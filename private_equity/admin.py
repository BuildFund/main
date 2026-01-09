"""Django admin configuration for private equity models."""

from django.contrib import admin

from .models import PrivateEquityOpportunity, PrivateEquityInvestment


@admin.register(PrivateEquityOpportunity)
class PrivateEquityOpportunityAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "title",
        "borrower",
        "funding_required",
        "share_offered",
        "status",
        "created_at",
    )
    list_filter = ("status",)
    search_fields = ("title", "borrower__user__email", "industry")


@admin.register(PrivateEquityInvestment)
class PrivateEquityInvestmentAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "opportunity",
        "lender",
        "amount",
        "share",
        "status",
        "created_at",
    )
    list_filter = ("status",)
    search_fields = ("opportunity__title", "lender__user__email")