"""Views for project management."""
from __future__ import annotations

from rest_framework import permissions, viewsets
from rest_framework.decorators import action  # type: ignore
from rest_framework.response import Response

from accounts.permissions import IsAdmin

from .models import Project
from .serializers import ProjectSerializer


class IsBorrower(permissions.BasePermission):
    """Allows access only to users with a borrower profile."""

    def has_permission(self, request, view) -> bool:
        return request.user.is_authenticated and hasattr(request.user, "borrowerprofile")


class ProjectViewSet(viewsets.ModelViewSet):
    """ViewSet for borrowers to create and manage their projects."""

    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """
        Determine the queryset based on the requesting user's role.

        - Borrowers see only their own projects.
        - Administrators see all projects regardless of status.
        - Other authenticated users see only approved projects.
        """
        user = self.request.user
        # Borrower: only own projects
        if hasattr(user, "borrowerprofile"):
            return Project.objects.filter(borrower=user.borrowerprofile)
        # Admin: view all projects
        if IsAdmin().has_permission(self.request, self):
            return Project.objects.all()
        # Others: approved projects only
        return Project.objects.filter(status="approved")

    def get_permissions(self):
        if self.action in {"create", "update", "partial_update", "destroy"}:
            permission_classes = [permissions.IsAuthenticated, IsBorrower]
        elif self.action == "approve":
            permission_classes = [permissions.IsAuthenticated, IsAdmin]
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [perm() for perm in permission_classes]

    @action(detail=True, methods=["get"], url_path="matched-products")
    def matched_products(self, request, pk: str | None = None):
        """
        Return a list of lender products that match this project's criteria.

        Matching is based on the project's funding type, property type, loan
        amount, term and LTV ratio.  Only products with status "active"
        are considered.  Results are sorted by how closely they fit the
        requested loan amount and term.
        """
        project = self.get_object()
        from products.models import Product  # import here to avoid circular dependency

        # Base queryset: active products matching funding and property type
        qs = Product.objects.filter(
            status="active",
            funding_type=project.funding_type,
            property_type=project.property_type,
        )
        # Filter by loan amount and term
        qs = qs.filter(
            min_loan_amount__lte=project.loan_amount_required,
            max_loan_amount__gte=project.loan_amount_required,
            term_min_months__lte=project.term_required_months,
            term_max_months__gte=project.term_required_months,
        )
        # Compute simple match score (difference between desired and product median loan amount)
        def score(product: Product) -> float:
            median = (product.min_loan_amount + product.max_loan_amount) / 2
            diff = abs(float(median) - float(project.loan_amount_required))
            return diff

        sorted_products = sorted(qs, key=score)
        from products.serializers import ProductSerializer

        serializer = ProductSerializer(sorted_products, many=True, context={"request": request})
        return Response(serializer.data)

    @action(detail=True, methods=["post"])  # type: ignore[misc]
    def approve(self, request, pk: str | None = None):
        """
        Admin action to approve a pending project.  Sets the project's status
        to "approved".  Only users with the Admin role or superuser status
        can perform this action.
        """
        project = self.get_object()
        if project.status != "approved":
            project.status = "approved"
            project.save(update_fields=["status"])
        serializer = ProjectSerializer(project, context={"request": request})
        return Response(serializer.data)