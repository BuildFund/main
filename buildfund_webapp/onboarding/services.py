"""Services for onboarding data collection and verification."""
from __future__ import annotations

import os
import requests
from typing import Dict, Any, Optional
from django.conf import settings
from verification.services import HMRCVerificationService


class AddressVerificationService:
    """Service for verifying addresses using Google Maps API."""
    
    def __init__(self):
        """Initialize the service with API key from environment."""
        api_key = os.environ.get("GOOGLE_API_KEY")
        if not api_key:
            raise ValueError(
                "GOOGLE_API_KEY environment variable is required. "
                "Set it in your .env file or environment variables."
            )
        self.api_key = api_key
    
    def verify_address(self, address_line_1: str, postcode: str, town: str = "", country: str = "United Kingdom") -> Dict[str, Any]:
        """
        Verify address using Google Maps Geocoding API.
        
        Args:
            address_line_1: First line of address
            postcode: UK postcode
            town: Town/city
            country: Country (default: United Kingdom)
            
        Returns:
            Dictionary with verification results:
            {
                "verified": bool,
                "formatted_address": str,
                "components": dict,
                "confidence_score": float,
                "message": str
            }
        """
        # Build address string
        address_parts = [address_line_1]
        if town:
            address_parts.append(town)
        address_parts.append(postcode)
        if country:
            address_parts.append(country)
        
        address_string = ", ".join(address_parts)
        
        url = "https://maps.googleapis.com/maps/api/geocode/json"
        params = {
            "address": address_string,
            "key": self.api_key,
            "region": "gb",  # UK region
        }
        
        try:
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            data = response.json()
            
            if data.get("status") == "OK" and data.get("results"):
                result = data["results"][0]
                formatted_address = result.get("formatted_address", "")
                components = {}
                
                # Extract address components
                for component in result.get("address_components", []):
                    types = component.get("types", [])
                    if "postal_code" in types:
                        components["postcode"] = component.get("long_name")
                    elif "locality" in types or "postal_town" in types:
                        components["town"] = component.get("long_name")
                    elif "administrative_area_level_2" in types:
                        components["county"] = component.get("long_name")
                    elif "country" in types:
                        components["country"] = component.get("long_name")
                    elif "street_number" in types:
                        components["street_number"] = component.get("long_name")
                    elif "route" in types:
                        components["route"] = component.get("long_name")
                
                # Calculate confidence score based on match quality
                confidence_score = 0.8  # Base score
                if components.get("postcode") and postcode.upper().replace(" ", "") in components.get("postcode", "").replace(" ", ""):
                    confidence_score += 0.1
                if components.get("town") and town.lower() in components.get("town", "").lower():
                    confidence_score += 0.1
                confidence_score = min(confidence_score, 1.0)
                
                return {
                    "verified": True,
                    "formatted_address": formatted_address,
                    "components": components,
                    "confidence_score": confidence_score,
                    "message": "Address verified successfully",
                    "geometry": result.get("geometry", {}),
                }
            else:
                return {
                    "verified": False,
                    "formatted_address": None,
                    "components": {},
                    "confidence_score": 0.0,
                    "message": f"Address verification failed: {data.get('status', 'Unknown error')}",
                }
        except requests.RequestException as e:
            return {
                "verified": False,
                "formatted_address": None,
                "components": {},
                "confidence_score": 0.0,
                "message": f"Failed to verify address: {str(e)}",
            }


class OnboardingChatbotService:
    """Service for managing onboarding chatbot conversations."""
    
    # Define onboarding steps based on user role
    BORROWER_STEPS = [
        "welcome",
        "profile_name",
        "profile_dob",
        "profile_nationality",
        "contact_phone",
        "address_collection",
        "address_verification",
        "company_collection",
        "company_verification",
        "director_verification",
        "financial_income",
        "financial_employment",
        "financial_expenses",
        "experience_collection",
        "documents_collection",
        "review",
        "complete",
    ]
    
    LENDER_STEPS = [
        "welcome",
        "profile_name",
        "contact_phone",
        "address_collection",
        "address_verification",
        "company_collection",
        "company_verification",
        "fca_registration",
        "financial_licences",
        "key_personnel",
        "documents_collection",
        "review",
        "complete",
    ]
    
    ADMIN_STEPS = [
        "welcome",
        "profile_name",
        "contact_phone",
        "complete",
    ]
    
    def get_steps_for_role(self, role: str) -> list:
        """Get onboarding steps based on user role."""
        if role == "Borrower":
            return self.BORROWER_STEPS
        elif role == "Lender":
            return self.LENDER_STEPS
        elif role == "Admin":
            return self.ADMIN_STEPS
        return []
    
    def get_next_question(self, step: str, user_role: str, collected_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Get the next question for the chatbot based on current step.
        
        Returns:
            {
                "question": str,
                "step": str,
                "field": str,
                "type": str,  # text, date, number, email, phone, file, select
                "options": list,  # for select type
                "required": bool,
                "validation": dict,
            }
        """
        questions = {
            "welcome": {
                "question": f"Hi! 👋 Welcome to BuildFund. I'm here to help you complete your profile. This will only take a few minutes, and you can save your progress at any time. Shall we begin?",
                "step": "welcome",
                "field": "welcome_acknowledged",
                "type": "select",
                "options": ["Yes, let's start", "Maybe later"],
                "required": True,
            },
            "profile_name": {
                "question": "Great! Let's start with your name. What's your first name?",
                "step": "profile_name",
                "field": "first_name",
                "type": "text",
                "required": True,
            },
            "profile_dob": {
                "question": "Thanks! Now, what's your date of birth? (Please enter in format: DD/MM/YYYY)",
                "step": "profile_dob",
                "field": "date_of_birth",
                "type": "date",
                "required": True,
                "validation": {"format": "DD/MM/YYYY"},
            },
            "profile_nationality": {
                "question": "What's your nationality?",
                "step": "profile_nationality",
                "field": "nationality",
                "type": "text",
                "required": True,
            },
            "contact_phone": {
                "question": "What's your phone number? (Please include country code, e.g., +44 for UK)",
                "step": "contact_phone",
                "field": "phone_number",
                "type": "phone",
                "required": True,
            },
            "address_collection": {
                "question": "Now let's get your address. What's your postcode?",
                "step": "address_collection",
                "field": "postcode",
                "type": "text",
                "required": True,
            },
            "address_verification": {
                "question": "I found your address. Is this correct? {formatted_address}",
                "step": "address_verification",
                "field": "address_confirmed",
                "type": "select",
                "options": ["Yes, that's correct", "No, let me enter it manually"],
                "required": True,
            },
            "company_collection": {
                "question": "Do you have a company registration number? (If yes, please provide it. If no, type 'skip')",
                "step": "company_collection",
                "field": "company_registration_number",
                "type": "text",
                "required": False,
            },
            "company_verification": {
                "question": "I've verified your company details. Is {company_name} correct?",
                "step": "company_verification",
                "field": "company_confirmed",
                "type": "select",
                "options": ["Yes, that's correct", "No, that's wrong"],
                "required": True,
            },
            "director_verification": {
                "question": "I need to verify you're a director of this company. What's your full name as registered with Companies House?",
                "step": "director_verification",
                "field": "director_name",
                "type": "text",
                "required": True,
            },
            "financial_income": {
                "question": "What's your annual income? (Please enter the amount in GBP, e.g., 50000)",
                "step": "financial_income",
                "field": "annual_income",
                "type": "number",
                "required": True,
            },
            "financial_employment": {
                "question": "What's your employment status?",
                "step": "financial_employment",
                "field": "employment_status",
                "type": "select",
                "options": ["Employed", "Self-employed", "Retired", "Student", "Other"],
                "required": True,
            },
            "financial_expenses": {
                "question": "What are your approximate monthly expenses? (Please enter the amount in GBP)",
                "step": "financial_expenses",
                "field": "monthly_expenses",
                "type": "number",
                "required": False,
            },
            "experience_collection": {
                "question": "How many years of experience do you have in property development?",
                "step": "experience_collection",
                "field": "experience_years",
                "type": "number",
                "required": False,
            },
            "fca_registration": {
                "question": "Do you have an FCA registration number? (If yes, please provide it. If no, type 'skip')",
                "step": "fca_registration",
                "field": "fca_registration_number",
                "type": "text",
                "required": False,
            },
            "financial_licences": {
                "question": "What financial licences does your organisation hold? (Please list them, or type 'none')",
                "step": "financial_licences",
                "field": "financial_licences",
                "type": "text",
                "required": False,
            },
            "key_personnel": {
                "question": "Who are the key personnel in your organisation? (Please provide names and positions, or type 'skip')",
                "step": "key_personnel",
                "field": "key_personnel",
                "type": "text",
                "required": False,
            },
            "documents_collection": {
                "question": "Now I need some documents. Please upload: 1) Proof of identity (passport or driving licence), 2) Proof of address (utility bill or bank statement). You can drag and drop files here or click to browse.",
                "step": "documents_collection",
                "field": "documents",
                "type": "file",
                "required": True,
                "multiple": True,
            },
            "review": {
                "question": "Great! Let me review what we've collected. {summary}. Does everything look correct?",
                "step": "review",
                "field": "review_confirmed",
                "type": "select",
                "options": ["Yes, everything is correct", "No, I need to make changes"],
                "required": True,
            },
            "complete": {
                "question": "Perfect! 🎉 Your profile is now complete. You can now submit applications and access all features. Is there anything else you'd like to update?",
                "step": "complete",
                "field": "complete",
                "type": "select",
                "options": ["No, I'm done", "Yes, I want to update something"],
                "required": False,
            },
        }
        
        question_template = questions.get(step, {})
        if not question_template:
            return None
        
        # Customize question based on collected data
        question = question_template.get("question", "")
        
        # Replace placeholders in question
        if "{formatted_address}" in question and "address_verification_data" in collected_data:
            addr_data = collected_data.get("address_verification_data", {})
            question = question.replace("{formatted_address}", addr_data.get("formatted_address", "the address"))
        
        if "{company_name}" in question and "company_verification_data" in collected_data:
            comp_data = collected_data.get("company_verification_data", {})
            comp_info = comp_data.get("company_info", {})
            question = question.replace("{company_name}", comp_info.get("company_name", "the company"))
        
        if "{summary}" in question:
            summary = self._generate_summary(collected_data, user_role)
            question = question.replace("{summary}", summary)
        
        return {
            **question_template,
            "question": question,
        }
    
    def _generate_summary(self, collected_data: Dict[str, Any], user_role: str) -> str:
        """Generate a summary of collected data for review."""
        summary_parts = []
        
        if collected_data.get("first_name") and collected_data.get("last_name"):
            summary_parts.append(f"Name: {collected_data['first_name']} {collected_data['last_name']}")
        
        if collected_data.get("phone_number"):
            summary_parts.append(f"Phone: {collected_data['phone_number']}")
        
        if collected_data.get("postcode"):
            summary_parts.append(f"Postcode: {collected_data['postcode']}")
        
        if collected_data.get("company_registration_number"):
            summary_parts.append(f"Company: {collected_data['company_registration_number']}")
        
        if collected_data.get("annual_income"):
            summary_parts.append(f"Income: £{collected_data['annual_income']:,}")
        
        return "\n".join(summary_parts) if summary_parts else "No data collected yet."
