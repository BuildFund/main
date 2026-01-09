"""Views for managing applications."""
from __future__ import annotations

from rest_framework import permissions, viewsets

from .models import Application
from .serializers import ApplicationSerializer


class ApplicationViewSet(viewsets.ModelViewSet):
    """ViewSet for creating and managing lender applications."""

    serializer_class = ApplicationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        # Lenders see their own applications; borrowers see applications for their projects
        if hasattr(user, "lenderprofile"):
            return Application.objects.filter(lender=user.lenderprofile)
        if hasattr(user, "borrowerprofile"):
            return Application.objects.filter(project__borrower=user.borrowerprofile)
        # admins see all
        return Application.objects.all()

    def get_permissions(self):
        # For create: only lenders can submit new applications
        if self.action == "create":
            return [permissions.IsAuthenticated(), self.LenderPermission()]
        # For update/partial_update/destroy: only the lender that created the
        # application or an admin can modify it
        if self.action in {"update", "partial_update", "destroy"}:
            return [permissions.IsAuthenticated(), self.AdminOrOwnerPermission()]
        return [permissions.IsAuthenticated()]

    class LenderPermission(permissions.BasePermission):
        """Allow access only to users with a lender profile."""

        def has_permission(self, request, view) -> bool:
            return hasattr(request.user, "lenderprofile")

    class AdminOrOwnerPermission(permissions.BasePermission):
        """Allow admin or the lender who owns the application."""

        def has_object_permission(self, request, view, obj) -> bool:
            return request.user.is_superuser or (
                hasattr(request.user, "lenderprofile") and obj.lender == request.user.lenderprofile
            )