"""Model definitions for borrower projects."""
from __future__ import annotations

from django.conf import settings
from django.db import models


class Project(models.Model):
    """Represents a property development project submitted by a borrower."""

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
    DEVELOPMENT_EXTENTS = [
        ("light_refurb", "Light Refurb"),
        ("heavy_refurb", "Heavy Refurb"),
        ("conversion", "Conversion"),
        ("new_build", "New Build"),
    ]
    TENURE_CHOICES = [
        ("freehold", "Freehold"),
        ("leasehold", "Leasehold"),
    ]
    REPAYMENT_METHODS = [
        ("sale", "Sale"),
        ("refinance", "Refinance"),
    ]
    STATUS_CHOICES = [
        ("draft", "Draft"),
        ("pending_review", "Pending Review"),
        ("approved", "Approved"),
        ("declined", "Declined"),
    ]

    borrower = models.ForeignKey(
        "borrowers.BorrowerProfile", related_name="projects", on_delete=models.CASCADE
    )
    funding_type = models.CharField(max_length=20, choices=FUNDING_TYPES)
    property_type = models.CharField(max_length=20, choices=PROPERTY_TYPES)
    address = models.CharField(max_length=255)
    town = models.CharField(max_length=100)
    county = models.CharField(max_length=100)
    postcode = models.CharField(max_length=20)
    description = models.TextField(blank=True)
    development_extent = models.CharField(max_length=20, choices=DEVELOPMENT_EXTENTS)
    tenure = models.CharField(max_length=20, choices=TENURE_CHOICES)
    planning_permission = models.BooleanField(default=False)
    planning_authority = models.CharField(max_length=100, blank=True)
    planning_reference = models.CharField(max_length=100, blank=True)
    planning_description = models.TextField(blank=True)
    loan_amount_required = models.DecimalField(max_digits=15, decimal_places=2)
    term_required_months = models.PositiveIntegerField()
    repayment_method = models.CharField(max_length=20, choices=REPAYMENT_METHODS)
    unit_counts = models.JSONField(default=dict)
    gross_internal_area = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)
    purchase_price = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)
    purchase_costs = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)
    build_cost = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)
    current_market_value = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)
    gross_development_value = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)
    funds_provided_by_applicant = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)
    source_of_funds = models.CharField(max_length=255, blank=True)
    existing_mortgage = models.BooleanField(default=False)
    mortgage_company = models.CharField(max_length=100, blank=True)
    mortgage_balance = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="draft")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self) -> str:  # pragma: no cover
        return f"Project({self.description[:30]}…)"