"""Admin configuration for applications app."""

from django.contrib import admin
from .models import Application


@admin.register(Application)
class ApplicationAdmin(admin.ModelAdmin):
    list_display = (
        "project",
        "lender",
        "product",
        "proposed_loan_amount",
        "proposed_interest_rate",
        "proposed_term_months",
        "status",
        "created_at",
    )
    search_fields = (
        "project__description",
        "lender__organisation_name",
        "product__name",
    )
    list_filter = ("status",)