"""Views for onboarding chatbot and data collection."""
from __future__ import annotations

import uuid
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone

from .models import OnboardingProgress, OnboardingData, OnboardingSession
from .serializers import (
    OnboardingProgressSerializer,
    OnboardingDataSerializer,
    OnboardingSessionSerializer,
    ChatbotMessageSerializer,
)
from .services import OnboardingChatbotService, AddressVerificationService
from verification.services import HMRCVerificationService
from accounts.models import Role, UserRole


class OnboardingViewSet(viewsets.ViewSet):
    """ViewSet for onboarding chatbot and data collection."""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.chatbot_service = OnboardingChatbotService()
        self.address_service = AddressVerificationService()
        self.hmrc_service = HMRCVerificationService()
    
    @action(detail=False, methods=["get"])
    def progress(self, request):
        """Get current user's onboarding progress."""
        progress, _ = OnboardingProgress.objects.get_or_create(user=request.user)
        serializer = OnboardingProgressSerializer(progress)
        return Response(serializer.data)
    
    @action(detail=False, methods=["get", "post"])
    def chat(self, request):
        """Handle chatbot conversation."""
        user = request.user
        
        # Get or create onboarding progress
        progress, _ = OnboardingProgress.objects.get_or_create(user=user)
        
        # Get user role
        user_roles = UserRole.objects.filter(user=user).select_related("role")
        user_role = "Borrower"  # Default
        if user_roles.exists():
            role_names = [ur.role.name for ur in user_roles]
            if "Lender" in role_names:
                user_role = "Lender"
            elif "Admin" in role_names:
                user_role = "Admin"
        
        if request.method == "GET":
            # Start or resume conversation
            session_id = request.query_params.get("session_id")
            
            if session_id:
                try:
                    session = OnboardingSession.objects.get(session_id=session_id, user=user, is_active=True)
                except OnboardingSession.DoesNotExist:
                    session = None
            else:
                session = OnboardingSession.objects.filter(user=user, is_active=True).first()
            
            if not session:
                # Create new session
                session = OnboardingSession.objects.create(
                    user=user,
                    session_id=str(uuid.uuid4()),
                    current_step=progress.current_step or "welcome",
                )
            
            # Get next question
            steps = self.chatbot_service.get_steps_for_role(user_role)
            current_step_index = steps.index(session.current_step) if session.current_step in steps else 0
            
            if progress.is_complete:
                current_step = "complete"
            else:
                current_step = session.current_step or steps[0]
            
            question_data = self.chatbot_service.get_next_question(
                current_step,
                user_role,
                session.collected_data or {}
            )
            
            if not question_data:
                question_data = {
                    "question": "Thank you! Your profile is complete.",
                    "step": "complete",
                    "type": "text",
                }
            
            return Response({
                "session_id": session.session_id,
                "question": question_data,
                "progress": OnboardingProgressSerializer(progress).data,
                "conversation_history": session.conversation_history or [],
            })
        
        elif request.method == "POST":
            # Process user response
            serializer = ChatbotMessageSerializer(data=request.data)
            if not serializer.is_valid():
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
            message = serializer.validated_data["message"]
            session_id = serializer.validated_data.get("session_id")
            step = serializer.validated_data.get("step", "welcome")
            
            # Get or create session
            if session_id:
                try:
                    session = OnboardingSession.objects.get(session_id=session_id, user=user)
                except OnboardingSession.DoesNotExist:
                    session = OnboardingSession.objects.create(
                        user=user,
                        session_id=session_id,
                        current_step=step,
                    )
            else:
                session = OnboardingSession.objects.filter(user=user, is_active=True).first()
                if not session:
                    session = OnboardingSession.objects.create(
                        user=user,
                        session_id=str(uuid.uuid4()),
                        current_step=step,
                    )
            
            # Update conversation history
            if not session.conversation_history:
                session.conversation_history = []
            session.conversation_history.append({
                "type": "user",
                "message": message,
                "timestamp": timezone.now().isoformat(),
            })
            
            # Process response based on current step
            collected_data = session.collected_data or {}
            next_step = self._process_response(step, message, collected_data, user_role, progress, user)
            
            # Update session
            session.current_step = next_step
            session.collected_data = collected_data
            session.last_activity = timezone.now()
            session.save()
            
            # Update progress
            self._update_progress(progress, collected_data, user_role, user)
            
            # Get next question
            question_data = self.chatbot_service.get_next_question(
                next_step,
                user_role,
                collected_data
            )
            
            # Add bot response to conversation
            if question_data:
                session.conversation_history.append({
                    "type": "bot",
                    "message": question_data.get("question", ""),
                    "timestamp": timezone.now().isoformat(),
                })
                session.save()
            
            return Response({
                "session_id": session.session_id,
                "question": question_data,
                "progress": OnboardingProgressSerializer(progress).data,
                "conversation_history": session.conversation_history,
            })
    
    def _process_response(self, step: str, message: str, collected_data: dict, user_role: str, progress: OnboardingProgress, user) -> str:
        """Process user response and update collected data."""
        steps = self.chatbot_service.get_steps_for_role(user_role)
        current_index = steps.index(step) if step in steps else 0
        
        # Handle special responses
        message_lower = message.lower().strip()
        if message_lower in ["skip", "none", "n/a", "not applicable"]:
            # Skip optional fields
            if current_index < len(steps) - 1:
                return steps[current_index + 1]
            return step
        
        if message_lower in ["yes, let's start", "yes", "ok", "sure", "let's go"]:
            if step == "welcome":
                return steps[1] if len(steps) > 1 else "complete"
        
        if message_lower in ["maybe later", "later", "not now"]:
            return "paused"
        
        # Process step-specific responses
        if step == "profile_name":
            collected_data["first_name"] = message
            return steps[current_index + 1] if current_index < len(steps) - 1 else "complete"
        
        elif step == "profile_dob":
            # Parse date (DD/MM/YYYY)
            try:
                from datetime import datetime
                date_obj = datetime.strptime(message, "%d/%m/%Y")
                collected_data["date_of_birth"] = date_obj.strftime("%Y-%m-%d")
            except:
                pass  # Invalid date, will ask again
            return steps[current_index + 1] if current_index < len(steps) - 1 else "complete"
        
        elif step == "contact_phone":
            collected_data["phone_number"] = message
            return steps[current_index + 1] if current_index < len(steps) - 1 else "complete"
        
        elif step == "address_collection":
            collected_data["postcode"] = message
            # Verify address
            addr_data = collected_data.get("address_data", {})
            verification = self.address_service.verify_address(
                address_line_1=addr_data.get("address_line_1", ""),
                postcode=message,
                town=addr_data.get("town", ""),
            )
            collected_data["address_verification_data"] = verification
            if verification.get("verified"):
                return "address_verification"
            return steps[current_index + 1] if current_index < len(steps) - 1 else "complete"
        
        elif step == "company_collection":
            if message_lower not in ["skip", "none", "n/a"]:
                collected_data["company_registration_number"] = message
                # Verify company
                company_name = collected_data.get("company_name", "")
                verification = self.hmrc_service.verify_company(message, company_name)
                collected_data["company_verification_data"] = verification
                if verification.get("verified"):
                    return "company_verification"
            return steps[current_index + 1] if current_index < len(steps) - 1 else "complete"
        
        # Default: move to next step
        if current_index < len(steps) - 1:
            return steps[current_index + 1]
        return "complete"
    
    def _update_progress(self, progress: OnboardingProgress, collected_data: dict, user_role: str):
        """Update onboarding progress based on collected data."""
        # Check what's been collected
        if collected_data.get("first_name") and collected_data.get("last_name"):
            progress.profile_complete = True
        
        if collected_data.get("phone_number"):
            progress.contact_complete = True
        
        if collected_data.get("postcode") and collected_data.get("address_verification_data", {}).get("verified"):
            progress.address_complete = True
            progress.address_verified = True
        
        if collected_data.get("company_registration_number") and collected_data.get("company_verification_data", {}).get("verified"):
            progress.company_complete = True
            progress.company_verified = True
        
        if collected_data.get("annual_income"):
            progress.financial_complete = True
        
        # Calculate overall progress
        progress.calculate_progress()
    
    @action(detail=False, methods=["post"])
    def save_data(self, request):
        """Save collected onboarding data to OnboardingData model."""
        user = request.user
        data = request.data
        
        onboarding_data, _ = OnboardingData.objects.get_or_create(user=user)
        
        # Update fields from collected data
        for field in [
            "first_name", "last_name", "date_of_birth", "nationality",
            "phone_number", "mobile_number",
            "address_line_1", "address_line_2", "postcode", "town", "county", "country",
            "company_name", "company_registration_number", "company_type",
            "annual_income", "employment_status", "monthly_expenses",
        ]:
            if field in data:
                setattr(onboarding_data, field, data[field])
        
        # Save verification data
        if "address_verification_data" in data:
            onboarding_data.address_verification_data = data["address_verification_data"]
            if data["address_verification_data"].get("verified"):
                onboarding_data.address_verified_at = timezone.now()
        
        if "company_verification_data" in data:
            onboarding_data.company_verification_data = data["company_verification_data"]
            if data["company_verification_data"].get("verified"):
                onboarding_data.company_verified_at = timezone.now()
        
        onboarding_data.save()
        
        return Response({"message": "Data saved successfully"})
    
    @action(detail=False, methods=["post"])
    def verify_address(self, request):
        """Verify address using Google API."""
        address_line_1 = request.data.get("address_line_1")
        postcode = request.data.get("postcode")
        town = request.data.get("town", "")
        
        if not address_line_1 or not postcode:
            return Response(
                {"error": "address_line_1 and postcode are required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        verification = self.address_service.verify_address(address_line_1, postcode, town)
        return Response(verification)
    
    @action(detail=False, methods=["post"])
    def verify_company(self, request):
        """Verify company using HMRC API."""
        company_number = request.data.get("company_number")
        company_name = request.data.get("company_name", "")
        
        if not company_number:
            return Response(
                {"error": "company_number is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        verification = self.hmrc_service.verify_company(company_number, company_name)
        return Response(verification)
