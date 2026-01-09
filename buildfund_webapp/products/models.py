"""Model definitions for products offered by lenders."""
from __future__ import annotations

from django.db import models
from django.conf import settings


class Product(models.Model):
    """Represents a finance product offered by a lender."""

    FUNDING_TYPES = [
        ("mortgage", "Mortgage Finance"),
        ("senior_debt", "Senior Debt/Development Finance"),
        ("equity", "Equity Finance"),
    ]
    PROPERTY_TYPES = [
        ("residential", "Residential"),
        ("commercial", "Commercial"),
        ("mixed", "Mixed"),
        ("industrial", "Industrial"),
    ]
    REPAYMENT_STRUCTURES = [
        ("interest_only", "Interest‑Only"),
        ("amortising", "Amortising"),
    ]
    STATUS_CHOICES = [
        ("pending", "Pending Approval"),
        ("active", "Active"),
        ("inactive", "Inactive"),
    ]

    lender = models.ForeignKey(
        "lenders.LenderProfile", related_name="products", on_delete=models.CASCADE
    )
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    funding_type = models.CharField(max_length=20, choices=FUNDING_TYPES)
    property_type = models.CharField(max_length=20, choices=PROPERTY_TYPES)
    min_loan_amount = models.DecimalField(max_digits=15, decimal_places=2)
    max_loan_amount = models.DecimalField(max_digits=15, decimal_places=2)
    interest_rate_min = models.DecimalField(max_digits=5, decimal_places=2)
    interest_rate_max = models.DecimalField(max_digits=5, decimal_places=2)
    term_min_months = models.PositiveIntegerField()
    term_max_months = models.PositiveIntegerField()
    max_ltv_ratio = models.DecimalField(max_digits=5, decimal_places=2)
    repayment_structure = models.CharField(max_length=20, choices=REPAYMENT_STRUCTURES)
    fees = models.JSONField(default=dict, blank=True)
    eligibility_criteria = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self) -> str:  # pragma: no cover
        return f"Product({self.name})"