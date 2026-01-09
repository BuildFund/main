"""Services for company and director verification using HMRC API."""
from __future__ import annotations

import os
import requests
from typing import Dict, Any, Optional
from django.conf import settings


class HMRCVerificationService:
    """Service for verifying company and director information via HMRC API."""
    
    BASE_URL = "https://api.company-information.service.gov.uk"
    
    def __init__(self):
        """Initialize the service with API key from environment."""
        api_key = os.environ.get("HMRC_API_KEY")
        if not api_key:
            raise ValueError(
                "HMRC_API_KEY environment variable is required. "
                "Set it in your .env file or environment variables."
            )
        
        # Companies House API uses HTTP Basic Auth with API key as username and empty password
        import base64
        credentials = f"{api_key}:"
        encoded_credentials = base64.b64encode(credentials.encode()).decode()
        self.headers = {
            "Authorization": f"Basic {encoded_credentials}",
            "Accept": "application/json",
        }
    
    def get_company_info(self, company_number: str) -> Dict[str, Any]:
        """
        Retrieve company information from Companies House API.
        
        Args:
            company_number: UK company registration number
            
        Returns:
            Dictionary containing company information
            
        Raises:
            requests.RequestException: If API request fails
        """
        url = f"{self.BASE_URL}/company/{company_number}"
        
        try:
            response = requests.get(url, headers=self.headers, timeout=10)
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            return {
                "error": str(e),
                "status_code": getattr(e.response, "status_code", None),
            }
    
    def get_company_officers(self, company_number: str) -> Dict[str, Any]:
        """
        Retrieve list of company officers (directors) from Companies House API.
        
        Args:
            company_number: UK company registration number
            
        Returns:
            Dictionary containing list of officers
            
        Raises:
            requests.RequestException: If API request fails
        """
        url = f"{self.BASE_URL}/company/{company_number}/officers"
        
        try:
            response = requests.get(url, headers=self.headers, timeout=10)
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            return {
                "error": str(e),
                "status_code": getattr(e.response, "status_code", None),
            }
    
    def verify_company(self, company_number: str, company_name: str) -> Dict[str, Any]:
        """
        Verify company details by checking company number and name match.
        
        Args:
            company_number: UK company registration number
            company_name: Company name to verify
            
        Returns:
            Dictionary with verification results:
            {
                "verified": bool,
                "company_info": dict,
                "name_match": bool,
                "status": str,
                "message": str
            }
        """
        company_info = self.get_company_info(company_number)
        
        if "error" in company_info:
            return {
                "verified": False,
                "company_info": None,
                "name_match": False,
                "status": "error",
                "message": f"Failed to retrieve company information: {company_info.get('error')}",
            }
        
        # Check if company name matches (case-insensitive, normalized)
        registered_name = company_info.get("company_name", "").upper().strip()
        provided_name = company_name.upper().strip()
        name_match = registered_name == provided_name or registered_name in provided_name or provided_name in registered_name
        
        # Check company status
        company_status = company_info.get("company_status", "").lower()
        is_active = company_status in ["active", "dissolved"]  # Dissolved companies may still be valid for historical checks
        
        return {
            "verified": name_match and is_active,
            "company_info": company_info,
            "name_match": name_match,
            "status": company_status,
            "message": "Company verified successfully" if (name_match and is_active) else f"Verification failed: name_match={name_match}, status={company_status}",
        }
    
    def verify_director(self, company_number: str, director_name: str, date_of_birth: Optional[str] = None) -> Dict[str, Any]:
        """
        Verify if a person is a director of the specified company.
        
        Args:
            company_number: UK company registration number
            director_name: Full name of the director to verify
            date_of_birth: Optional date of birth (YYYY-MM-DD) for additional verification
            
        Returns:
            Dictionary with verification results:
            {
                "verified": bool,
                "director_info": dict,
                "name_match": bool,
                "message": str
            }
        """
        officers_data = self.get_company_officers(company_number)
        
        if "error" in officers_data:
            return {
                "verified": False,
                "director_info": None,
                "name_match": False,
                "message": f"Failed to retrieve officers: {officers_data.get('error')}",
            }
        
        officers = officers_data.get("items", [])
        director_name_normalized = director_name.upper().strip()
        
        # Search for matching director
        matching_director = None
        for officer in officers:
            officer_name = officer.get("name", "").upper().strip()
            if director_name_normalized in officer_name or officer_name in director_name_normalized:
                matching_director = officer
                break
        
        if not matching_director:
            return {
                "verified": False,
                "director_info": None,
                "name_match": False,
                "message": f"No director found matching name: {director_name}",
            }
        
        # Additional verification with date of birth if provided
        dob_match = True
        if date_of_birth and "date_of_birth" in matching_director:
            officer_dob = matching_director.get("date_of_birth", {})
            if officer_dob:
                officer_dob_str = f"{officer_dob.get('year', '')}-{officer_dob.get('month', ''):02d}-{officer_dob.get('day', ''):02d}"
                dob_match = officer_dob_str == date_of_birth
        
        return {
            "verified": dob_match if date_of_birth else True,
            "director_info": matching_director,
            "name_match": True,
            "message": "Director verified successfully" if (dob_match if date_of_birth else True) else "Director name matches but date of birth does not",
        }
