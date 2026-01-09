"""URL configuration for the private equity module."""

from __future__ import annotations

from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import PrivateEquityOpportunityViewSet, PrivateEquityInvestmentViewSet


router = DefaultRouter()
router.register(r"opportunities", PrivateEquityOpportunityViewSet, basename="pe-opportunity")
router.register(r"investments", PrivateEquityInvestmentViewSet, basename="pe-investment")

urlpatterns = [
    path("", include(router.urls)),
]