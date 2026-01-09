"""Serializers for borrowers."""
from __future__ import annotations

from rest_framework import serializers

from .models import BorrowerProfile


class BorrowerProfileSerializer(serializers.ModelSerializer):
    """Serializes BorrowerProfile for API representation."""

    class Meta:
        model = BorrowerProfile
        exclude = ["user"]  # user is set from request