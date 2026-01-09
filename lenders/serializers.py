"""Serializers for lenders."""
from __future__ import annotations

from rest_framework import serializers

from .models import LenderProfile


class LenderProfileSerializer(serializers.ModelSerializer):
    """Serializes LenderProfile for API representation."""

    class Meta:
        model = LenderProfile
        exclude = ["user"]