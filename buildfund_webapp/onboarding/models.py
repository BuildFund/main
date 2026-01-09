"""Models for user onboarding and KYC data collection."""
from __future__ import annotations

from django.conf import settings
from django.db import models
from django.utils import timezone


class OnboardingProgress(models.Model):
    """Tracks onboarding progress for users."""
    
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="onboarding_progress"
    )
    
    # Progress tracking
    is_complete = models.BooleanField(default=False)
    completion_percentage = models.IntegerField(default=0)
    current_step = models.CharField(max_length=50, blank=True)
    last_updated = models.DateTimeField(auto_now=True)
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    # Data collection flags
    profile_complete = models.BooleanField(default=False)
    contact_complete = models.BooleanField(default=False)
    company_complete = models.BooleanField(default=False)
    address_complete = models.BooleanField(default=False)
    financial_complete = models.BooleanField(default=False)
    documents_complete = models.BooleanField(default=False)
    
    # Verification status
    company_verified = models.BooleanField(default=False)
    address_verified = models.BooleanField(default=False)
    verification_score = models.IntegerField(null=True, blank=True, help_text="Overall verification score (0-100)")
    
    class Meta:
        verbose_name_plural = "Onboarding Progress"
    
    def calculate_progress(self):
        """Calculate completion percentage based on completed sections."""
        sections = [
            self.profile_complete,
            self.contact_complete,
            self.company_complete,
            self.address_complete,
            self.financial_complete,
            self.documents_complete,
        ]
        completed = sum(sections)
        total = len(sections)
        self.completion_percentage = int((completed / total) * 100) if total > 0 else 0
        self.is_complete = self.completion_percentage == 100
        if self.is_complete and not self.completed_at:
            self.completed_at = timezone.now()
        self.save()
        return self.completion_percentage
    
    def __str__(self) -> str:
        return f"Onboarding({self.user.email} - {self.completion_percentage}%)"


class OnboardingData(models.Model):
    """Stores collected onboarding data for users."""
    
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="onboarding_data"
    )
    
    # Profile Information
    title = models.CharField(max_length=10, blank=True)
    first_name = models.CharField(max_length=50, blank=True)
    last_name = models.CharField(max_length=50, blank=True)
    date_of_birth = models.DateField(null=True, blank=True)
    nationality = models.CharField(max_length=100, blank=True)
    national_insurance_number = models.CharField(max_length=20, blank=True)
    
    # Contact Information (FCA Requirement)
    email = models.EmailField(blank=True, help_text="Contact email address")
    phone_number = models.CharField(max_length=30, blank=True)
    mobile_number = models.CharField(max_length=30, blank=True)
    email_verified = models.BooleanField(default=False)
    phone_verified = models.BooleanField(default=False)
    
    # Address Information
    address_line_1 = models.CharField(max_length=255, blank=True)
    address_line_2 = models.CharField(max_length=255, blank=True)
    address_line_3 = models.CharField(max_length=255, blank=True)
    town = models.CharField(max_length=100, blank=True)
    county = models.CharField(max_length=100, blank=True)
    postcode = models.CharField(max_length=20, blank=True)
    country = models.CharField(max_length=100, default="United Kingdom")
    address_verification_data = models.JSONField(default=dict, blank=True)  # Google API response
    address_verified_at = models.DateTimeField(null=True, blank=True)
    
    # Company Information (for borrowers/lenders)
    company_name = models.CharField(max_length=200, blank=True)
    company_registration_number = models.CharField(max_length=50, blank=True)
    company_type = models.CharField(max_length=50, blank=True)  # Ltd, PLC, LLP, etc.
    company_status = models.CharField(max_length=50, blank=True)  # Active, Dissolved, etc.
    company_incorporation_date = models.DateField(null=True, blank=True)
    company_address = models.TextField(blank=True)
    company_verification_data = models.JSONField(default=dict, blank=True)  # HMRC API response
    company_verified_at = models.DateTimeField(null=True, blank=True)
    
    # Director Information (FCA Requirement - HMRC Validation)
    # Store multiple directors as JSON
    directors_data = models.JSONField(
        default=list, 
        blank=True,
        help_text="List of directors with name, DOB, nationality, and verification data"
    )
    # Legacy single director fields (for backward compatibility)
    director_name = models.CharField(max_length=200, blank=True)
    director_date_of_birth = models.DateField(null=True, blank=True)
    director_nationality = models.CharField(max_length=100, blank=True)
    director_verification_data = models.JSONField(default=dict, blank=True)
    
    # KYC Information (FCA Requirement)
    national_insurance_number = models.CharField(max_length=20, blank=True)
    source_of_funds = models.TextField(blank=True, help_text="Source of funds for loan application or lending")
    
    # Financial Information (FCA Requirement)
    annual_income = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)
    employment_status = models.CharField(max_length=50, blank=True)  # Employed, Self-employed, Retired, etc.
    employment_company = models.CharField(max_length=200, blank=True)
    employment_position = models.CharField(max_length=200, blank=True)
    years_in_employment = models.IntegerField(null=True, blank=True)
    existing_debts = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)
    monthly_expenses = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)
    total_assets = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True, help_text="Total value of assets")
    
    # FCA Registration Information (for Lenders)
    has_fca_registration = models.BooleanField(default=False, help_text="Whether organisation has FCA registration")
    fca_registration_number = models.CharField(max_length=50, blank=True)
    fca_permissions = models.TextField(blank=True, help_text="FCA permissions held")
    financial_licences = models.TextField(blank=True, help_text="Other financial licences held")
    regulatory_capital = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True, help_text="Regulatory capital requirement")
    lending_capacity = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True, help_text="Total lending capacity")
    key_personnel = models.TextField(blank=True, help_text="Key personnel names and positions")
    
    # Asset & Liability Statement (FCA Requirement)
    assets_real_estate = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True, help_text="Total value of real estate assets")
    assets_investments = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True, help_text="Total value of investments")
    assets_other = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True, help_text="Total value of other assets")
    liabilities_mortgages = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True, help_text="Total value of mortgages")
    liabilities_loans = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True, help_text="Total value of loans")
    liabilities_other = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True, help_text="Total value of other liabilities")
    assets_liabilities_data = models.JSONField(default=dict, blank=True, help_text="Complete asset and liability statement data")
    
    # Experience & Portfolio (FCA Requirement)
    experience_years = models.IntegerField(null=True, blank=True)
    previous_projects = models.IntegerField(null=True, blank=True)
    portfolio_description = models.TextField(blank=True, help_text="Description of current property portfolio or business assets")
    portfolio_property_details = models.TextField(blank=True, help_text="Detailed property portfolio information")
    risk_tolerance = models.CharField(max_length=50, blank=True)
    
    # Documents (references stored, actual files in documents app)
    documents_uploaded = models.ManyToManyField("documents.Document", blank=True)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    data_collected_via = models.CharField(max_length=20, default="chatbot")  # chatbot, manual, import
    
    class Meta:
        verbose_name_plural = "Onboarding Data"
    
    def __str__(self) -> str:
        return f"OnboardingData({self.user.email})"


class OnboardingSession(models.Model):
    """Tracks individual onboarding chat sessions."""
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="onboarding_sessions"
    )
    session_id = models.CharField(max_length=100, unique=True)
    current_step = models.CharField(max_length=50, blank=True)
    conversation_history = models.JSONField(default=list, blank=True)
    collected_data = models.JSONField(default=dict, blank=True)
    started_at = models.DateTimeField(auto_now_add=True)
    last_activity = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        ordering = ["-last_activity"]
    
    def __str__(self) -> str:
        return f"Session({self.user.email} - {self.session_id[:8]})"
