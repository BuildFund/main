"""Admin configuration for products app."""

from django.contrib import admin
from .models import Product


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "lender",
        "funding_type",
        "property_type",
        "min_loan_amount",
        "max_loan_amount",
        "status",
    )
    search_fields = ("name", "lender__organisation_name")
    list_filter = ("funding_type", "property_type", "status")