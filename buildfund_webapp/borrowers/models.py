"""Models related to borrower profiles."""
from __future__ import annotations

from django.conf import settings
from django.db import models


class BorrowerProfile(models.Model):
    """Extends the User model with borrower‑specific details."""

    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    date_of_birth = models.DateField(null=True, blank=True)
    company_name = models.CharField(max_length=100, blank=True)
    registration_number = models.CharField(max_length=50, blank=True)
    trading_name = models.CharField(max_length=100, blank=True)
    phone_number = models.CharField(max_length=30, blank=True)
    address_1 = models.CharField(max_length=255, blank=True)
    address_2 = models.CharField(max_length=255, blank=True)
    city = models.CharField(max_length=100, blank=True)
    county = models.CharField(max_length=100, blank=True)
    postcode = models.CharField(max_length=20, blank=True)
    country = models.CharField(max_length=100, blank=True)
    experience_description = models.TextField(blank=True)
    income_details = models.JSONField(default=dict, blank=True)
    expenses_details = models.JSONField(default=dict, blank=True)
    documents = models.ManyToManyField("documents.Document", blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self) -> str:  # pragma: no cover
        return f"BorrowerProfile({self.user.email})"