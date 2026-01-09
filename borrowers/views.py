"""Views for borrower operations."""
from __future__ import annotations

from rest_framework import mixins, permissions, viewsets

from .models import BorrowerProfile
from .serializers import BorrowerProfileSerializer


class IsOwner(permissions.BasePermission):
    """Custom permission to allow only owners of the profile to edit/view it."""

    def has_object_permission(self, request, view, obj) -> bool:
        return obj.user == request.user


class BorrowerProfileViewSet(
    mixins.RetrieveModelMixin, mixins.UpdateModelMixin, mixins.ListModelMixin, viewsets.GenericViewSet
):
    """ViewSet for borrowers to view, update or list their own profile.

    The list endpoint returns a single profile associated with the
    authenticated user.  Adding ListModelMixin makes it easy for
    front‑end applications to fetch the current profile without
    knowing its ID in advance.
    """

    serializer_class = BorrowerProfileSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwner]

    def get_queryset(self):
        return BorrowerProfile.objects.filter(user=self.request.user)

    def perform_update(self, serializer):
        serializer.save()