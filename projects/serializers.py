"""Serializers for projects."""
from __future__ import annotations

from rest_framework import serializers

from .models import Project


class ProjectSerializer(serializers.ModelSerializer):
    """Serializes Project model for API operations."""

    class Meta:
        model = Project
        exclude = ["borrower", "status", "created_at", "updated_at"]

    def create(self, validated_data):
        request = self.context.get("request")
        if request is None or not hasattr(request.user, "borrowerprofile"):
            raise serializers.ValidationError("Only borrowers can create projects.")
        validated_data["borrower"] = request.user.borrowerprofile
        return Project.objects.create(**validated_data)