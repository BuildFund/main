"""Serializers for products."""
from __future__ import annotations

from rest_framework import serializers

from .models import Product


class ProductSerializer(serializers.ModelSerializer):
    """Serializes Product for API representation and creation."""

    class Meta:
        model = Product
        fields = [
            "id",
            "lender",
            "name",
            "description",
            "funding_type",
            "property_type",
            "min_loan_amount",
            "max_loan_amount",
            "interest_rate_min",
            "interest_rate_max",
            "term_min_months",
            "term_max_months",
            "max_ltv_ratio",
            "repayment_structure",
            "fees",
            "eligibility_criteria",
            "status",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "status", "created_at", "updated_at", "lender"]

    def create(self, validated_data):
        # Assign the product to the current user's lender profile
        request = self.context.get("request")
        if request is None or not hasattr(request.user, "lenderprofile"):
            raise serializers.ValidationError("Only lenders can create products.")
        validated_data["lender"] = request.user.lenderprofile
        return super().create(validated_data)