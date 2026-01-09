"""URL configuration for the accounts app."""

from django.urls import path

from .views import RoleListView, UserRegistrationView, CurrentUserView

urlpatterns = [
    path("register/", UserRegistrationView.as_view(), name="user-register"),
    path("roles/", RoleListView.as_view(), name="role-list"),
    path("me/", CurrentUserView.as_view(), name="current-user"),
]