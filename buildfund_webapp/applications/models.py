"""Model definitions for funding applications."""
from __future__ import annotations

from django.conf import settings
from django.db import models
from django.utils import timezone


class Application(models.Model):
    """Represents a lender's offer on a project, or a borrower's enquiry about a product."""

    STATUS_CHOICES = [
        ("submitted", "Submitted"),
        ("opened", "Opened"),
        ("under_review", "Under Review"),
        ("further_info_required", "Further Information Required"),
        ("credit_check", "Credit Check/Underwriting"),
        ("approved", "Approved"),
        ("accepted", "Accepted"),
        ("declined", "Declined"),
        ("withdrawn", "Withdrawn"),
        ("completed", "Completed"),
    ]
    
    INITIATED_BY_CHOICES = [
        ("borrower", "Borrower"),
        ("lender", "Lender"),
    ]

    project = models.ForeignKey(
        "projects.Project", related_name="applications", on_delete=models.CASCADE
    )
    lender = models.ForeignKey(
        "lenders.LenderProfile", related_name="applications", on_delete=models.CASCADE
    )
    product = models.ForeignKey(
        "products.Product", related_name="applications", on_delete=models.CASCADE
    )
    # Track who initiated the application/enquiry
    initiated_by = models.CharField(
        max_length=20, 
        choices=INITIATED_BY_CHOICES, 
        default="lender",
        help_text="Whether this application was initiated by the borrower (enquiry) or lender (offer)"
    )
    proposed_loan_amount = models.DecimalField(max_digits=15, decimal_places=2)
    proposed_interest_rate = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    proposed_term_months = models.PositiveIntegerField()
    proposed_ltv_ratio = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    notes = models.TextField(blank=True)
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default="submitted")
    status_feedback = models.TextField(
        blank=True,
        help_text="Feedback or notes about the current status (e.g., reason for decline, information required)"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    status_changed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = ("project", "lender")
        ordering = ["-created_at"]

    def update_status(self, new_status, feedback=""):
        """Update application status and record change timestamp."""
        if self.status != new_status:
            self.status = new_status
            self.status_feedback = feedback
            self.status_changed_at = timezone.now()
            self.save(update_fields=["status", "status_feedback", "status_changed_at", "updated_at"])

    def __str__(self) -> str:  # pragma: no cover
        return f"Application({self.project.id}→{self.lender.organisation_name})"


class ApplicationStatusHistory(models.Model):
    """Tracks the history of status changes for an application."""
    
    application = models.ForeignKey(
        Application,
        related_name="status_history",
        on_delete=models.CASCADE
    )
    status = models.CharField(max_length=30, choices=Application.STATUS_CHOICES)
    feedback = models.TextField(blank=True)
    changed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        help_text="User who made this status change"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name_plural = "Application Status Histories"

    def __str__(self) -> str:
        return f"{self.application.id} - {self.status} ({self.created_at})"


class ApplicationDocument(models.Model):
    """Links documents to applications for shared document access between borrower and lender."""
    
    application = models.ForeignKey(
        Application,
        related_name="documents",
        on_delete=models.CASCADE
    )
    document = models.ForeignKey(
        "documents.Document",
        on_delete=models.CASCADE
    )
    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        help_text="User who uploaded this document to the application"
    )
    description = models.CharField(
        max_length=255,
        blank=True,
        help_text="Optional description of the document"
    )
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ["-uploaded_at"]
        unique_together = ("application", "document")
    
    def __str__(self) -> str:
        return f"ApplicationDocument({self.application.id} - {self.document.file_name})"
