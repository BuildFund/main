"""Views for product management."""
from __future__ import annotations

from rest_framework import permissions, viewsets
from rest_framework.decorators import action  # type: ignore
from rest_framework.response import Response

from accounts.permissions import IsAdmin, IsLender

from .models import Product
from .serializers import ProductSerializer




class ProductViewSet(viewsets.ModelViewSet):
    """
    ViewSet for creating, listing and retrieving products.  Lenders can
    manage their own products, whilst general authenticated users see only
    active products.  Additional actions allow administrators to approve
    pending products.
    """

    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """
        Determine the queryset based on the requesting user's role.

        - Lenders see only their own products.
        - Administrators see all products regardless of status.
        - Other authenticated users see only active products.
        """
        user = self.request.user
        # Lender: only own products
        if hasattr(user, "lenderprofile"):
            return Product.objects.filter(lender=user.lenderprofile)
        # Admin: all products
        if IsAdmin().has_permission(self.request, self):
            return Product.objects.all()
        # Others: active only
        return Product.objects.filter(status="active")

    def get_permissions(self):
        """Assign custom permissions based on action."""
        if self.action in {"create", "update", "partial_update", "destroy"}:
            permission_classes = [permissions.IsAuthenticated, IsLender]
        elif self.action == "approve":
            # Only admins can approve products
            permission_classes = [permissions.IsAuthenticated, IsAdmin]
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [perm() for perm in permission_classes]



    @action(detail=True, methods=["post"])  # type: ignore[misc]
    def approve(self, request, pk: str | None = None):
        """
        Admin action to approve a pending product.  Sets the product's
        status to "active".  Requires the requesting user to be an
        administrator or superuser.
        """
        product = self.get_object()
        if product.status != "active":
            product.status = "active"
            product.save(update_fields=["status"])
            
            # Send email notification
            try:
                from notifications.services import EmailNotificationService
                lender_email = product.lender.user.email
                if lender_email:
                    EmailNotificationService.notify_product_approved(product, lender_email)
            except Exception as e:
                # Log error but don't fail the request
                print(f"Failed to send approval email: {e}")
        
        serializer = self.get_serializer(product)
        return Response(serializer.data)