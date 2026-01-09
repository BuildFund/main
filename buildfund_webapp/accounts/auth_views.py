"""Custom authentication views."""
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework import permissions
from .throttles import TokenObtainThrottle, LoginRateThrottle


class CustomObtainAuthToken(ObtainAuthToken):
    """
    Token authentication endpoint that explicitly allows anonymous access.
    Protected by rate limiting to prevent brute force attacks.
    """
    permission_classes = [permissions.AllowAny]
    throttle_classes = [TokenObtainThrottle, LoginRateThrottle]
