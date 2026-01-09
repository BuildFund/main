"""Serializers for applications."""
from __future__ import annotations

from rest_framework import serializers

from .models import Application
from projects.models import Project
from products.models import Product


class ApplicationSerializer(serializers.ModelSerializer):
    """Serializes Application model for API operations."""

    class Meta:
        model = Application
        fields = [
            "id",
            "project",
            "product",
            "proposed_loan_amount",
            "proposed_interest_rate",
            "proposed_term_months",
            "proposed_ltv_ratio",
            "notes",
            "status",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "status", "created_at", "updated_at"]

    def validate(self, attrs):
        request = self.context.get("request")
        if request is None or not hasattr(request.user, "lenderprofile"):
            raise serializers.ValidationError("Only lenders can create applications.")
        lender_profile = request.user.lenderprofile
        project: Project = attrs.get("project")
        # ensure the product belongs to the lender
        product: Product = attrs.get("product")
        if product.lender_id != lender_profile.id:
            raise serializers.ValidationError("You may only apply with your own products.")
        # ensure no existing active application
        if Application.objects.filter(project=project, lender=lender_profile).exists():
            raise serializers.ValidationError(
                "An active application already exists for this project."
            )
        return attrs

    def create(self, validated_data):
        request = self.context.get("request")
        lender_profile = request.user.lenderprofile
        validated_data["lender"] = lender_profile
        return Application.objects.create(**validated_data)