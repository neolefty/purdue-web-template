"""
URLs for authentication app
"""

from django.urls import path

from . import views

app_name = "authentication"

urlpatterns = [
    # API endpoints
    path("config/", views.auth_config_view, name="config"),
    path("login/", views.login_view, name="login"),
    path("register/", views.register_view, name="register"),
    path("logout/", views.logout_view, name="logout"),
    path("user/", views.CurrentUserView.as_view(), name="current-user"),
    path("change-password/", views.change_password_view, name="change-password"),
    # User management endpoints (admin only)
    path("users/", views.UserListView.as_view(), name="user-list"),
    path("users/<int:pk>/", views.UserDetailView.as_view(), name="user-detail"),
    # SAML endpoints
    path("saml/login/", views.saml_login_view, name="saml-login"),
    path("saml/acs/", views.saml_acs_view, name="saml-acs"),
    path("saml/metadata/", views.saml_metadata_view, name="saml-metadata"),
]
