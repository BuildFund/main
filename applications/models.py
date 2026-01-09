"""Model definitions for funding applications."""
from __future__ import annotations

from django.conf import settings
from django.db import models


class Application(models.Model):
    """Represents a lender's offer on a project."""

    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("under_review", "Under Review"),
        ("accepted", "Accepted"),
        ("declined", "Declined"),
        ("withdrawn", "Withdrawn"),
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
    proposed_loan_amount = models.DecimalField(max_digits=15, decimal_places=2)
    proposed_interest_rate = models.DecimalField(max_digits=5, decimal_places=2)
    proposed_term_months = models.PositiveIntegerField()
    proposed_ltv_ratio = models.DecimalField(max_digits=5, decimal_places=2)
    notes = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("project", "lender")

    def __str__(self) -> str:  # pragma: no cover
        return f"Application({self.project.id}→{self.lender.organisation_name})"