"""Custom throttling classes for authentication endpoints."""
from __future__ import annotations

from rest_framework.throttling import AnonRateThrottle, UserRateThrottle


class LoginRateThrottle(AnonRateThrottle):
    """
    Throttle for login/token endpoints to prevent brute force attacks.
    More restrictive than general anonymous throttling.
    """
    rate = '5/minute'  # Allow 5 login attempts per minute per IP


class TokenObtainThrottle(AnonRateThrottle):
    """
    Throttle for token obtain endpoint to prevent brute force attacks.
    """
    rate = '10/hour'  # Allow 10 token requests per hour per IP


class VerificationThrottle(UserRateThrottle):
    """
    Throttle for verification endpoints to prevent API abuse.
    """
    rate = '20/hour'  # Allow 20 verification requests per hour per user
