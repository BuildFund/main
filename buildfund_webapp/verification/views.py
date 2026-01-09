"""Views for company and director verification."""
from __future__ import annotations

from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from core.validators import validate_company_number, sanitize_string
from accounts.permissions import IsBorrower as IsBorrowerPermission
from accounts.throttles import VerificationThrottle

from .models import CompanyVerification, DirectorVerification
from .services import HMRCVerificationService
from .serializers import CompanyVerificationSerializer, DirectorVerificationSerializer


class CompanyVerificationViewSet(viewsets.ModelViewSet):
    """ViewSet for company verification."""
    
    serializer_class = CompanyVerificationSerializer
    permission_classes = [permissions.IsAuthenticated, IsBorrowerPermission]
    throttle_classes = [VerificationThrottle]  # Prevent API abuse
    
    def get_queryset(self):
        """Return verifications for the current borrower."""
        if hasattr(self.request.user, "borrowerprofile"):
            return CompanyVerification.objects.filter(
                borrower_profile=self.request.user.borrowerprofile
            )
        return CompanyVerification.objects.none()
    
    @action(detail=False, methods=["post"])
    def verify(self, request):
        """
        Verify a company using HMRC API.
        
        Expected payload:
        {
            "company_number": "12345678",
            "company_name": "Example Company Ltd"
        }
        """
        company_number = request.data.get("company_number")
        company_name = request.data.get("company_name")
        
        if not company_number or not company_name:
            return Response(
                {"error": "company_number and company_name are required"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        
        # Validate and sanitize inputs
        try:
            company_number = validate_company_number(company_number)
            company_name = sanitize_string(company_name, max_length=255)
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST,
            )
        
        borrower_profile = request.user.borrowerprofile
        
        # Check if verification already exists
        verification, created = CompanyVerification.objects.get_or_create(
            borrower_profile=borrower_profile,
            defaults={
                "company_number": company_number,
                "company_name": company_name,
                "status": "pending",
            },
        )
        
        # Perform verification
        service = HMRCVerificationService()
        result = service.verify_company(company_number, company_name)
        
        # Update verification record
        verification.verification_data = result.get("company_info", {})
        verification.status = "verified" if result["verified"] else "failed"
        if result["verified"]:
            verification.verified_at = timezone.now()
        else:
            verification.error_message = result.get("message", "")
        verification.save()
        
        serializer = self.get_serializer(verification)
        return Response(serializer.data)


class DirectorVerificationViewSet(viewsets.ModelViewSet):
    """ViewSet for director verification."""
    
    serializer_class = DirectorVerificationSerializer
    permission_classes = [permissions.IsAuthenticated, IsBorrowerPermission]
    throttle_classes = [VerificationThrottle]  # Prevent API abuse
    
    def get_queryset(self):
        """Return verifications for the current borrower."""
        if hasattr(self.request.user, "borrowerprofile"):
            return DirectorVerification.objects.filter(
                borrower_profile=self.request.user.borrowerprofile
            )
        return DirectorVerification.objects.none()
    
    @action(detail=False, methods=["post"])
    def verify(self, request):
        """
        Verify a director using HMRC API.
        
        Expected payload:
        {
            "company_number": "12345678",
            "director_name": "John Doe",
            "date_of_birth": "1980-01-15"  # Optional
        }
        """
        company_number = request.data.get("company_number")
        director_name = request.data.get("director_name")
        date_of_birth = request.data.get("date_of_birth")
        
        if not company_number or not director_name:
            return Response(
                {"error": "company_number and director_name are required"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        
        # Validate and sanitize inputs
        try:
            company_number = validate_company_number(company_number)
            director_name = sanitize_string(director_name, max_length=255)
            # Validate date format if provided
            if date_of_birth:
                from datetime import datetime
                try:
                    datetime.strptime(date_of_birth, "%Y-%m-%d")
                except ValueError:
                    return Response(
                        {"error": "date_of_birth must be in YYYY-MM-DD format"},
                        status=status.HTTP_400_BAD_REQUEST,
                    )
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST,
            )
        
        borrower_profile = request.user.borrowerprofile
        
        # Perform verification
        service = HMRCVerificationService()
        result = service.verify_director(company_number, director_name, date_of_birth)
        
        # Create or update verification record
        verification = DirectorVerification.objects.create(
            borrower_profile=borrower_profile,
            company_number=company_number,
            director_name=director_name,
            date_of_birth=date_of_birth if date_of_birth else None,
            status="verified" if result["verified"] else "failed",
            verification_data=result.get("director_info", {}),
            error_message="" if result["verified"] else result.get("message", ""),
            verified_at=timezone.now() if result["verified"] else None,
        )
        
        serializer = self.get_serializer(verification)
        return Response(serializer.data)
