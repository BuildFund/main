"""URL configuration for the BuildFund project.

This module routes incoming HTTP requests to the appropriate app
endpoints.  It includes API URLs for each of the local apps and
the Django admin interface.  Authentication endpoints (login,
logout, token obtain) are provided via Django REST Framework.
"""
from __future__ import annotations

from django.contrib import admin
from django.urls import include, path
from rest_framework.authtoken import views as drf_auth_views

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/token/", drf_auth_views.obtain_auth_token, name="api-token"),
    path("api/accounts/", include("accounts.urls")),
    path("api/borrowers/", include("borrowers.urls")),
    path("api/lenders/", include("lenders.urls")),
    path("api/products/", include("products.urls")),
    path("api/projects/", include("projects.urls")),
    path("api/applications/", include("applications.urls")),
    path("api/documents/", include("documents.urls")),
    path("api/underwriting/", include("underwriting.urls")),
    path("api/mapping/", include("mapping.urls")),
    path("api/private-equity/", include("private_equity.urls")),
]