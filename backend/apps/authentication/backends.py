"""
Authentication backends for Purdue Web Application
"""

import logging

from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.backends import BaseBackend

logger = logging.getLogger(__name__)
User = get_user_model()


class PurdueSAMLBackend(BaseBackend):
    """
    SAML authentication backend for Purdue SSO
    """

    def authenticate(self, request, saml_response=None, **kwargs):
        """
        Authenticate user via SAML response
        """
        if not saml_response:
            return None

        # In development, use mock attributes
        if settings.DEBUG and hasattr(settings, "SAML_MOCK_ATTRIBUTES"):
            attributes = settings.SAML_MOCK_ATTRIBUTES
        else:
            # Parse SAML response attributes
            attributes = self._parse_saml_response(saml_response)

        if not attributes:
            logger.error("No attributes found in SAML response")
            return None

        # Extract user information
        username = attributes.get("uid", [None])[0]
        email = attributes.get("email", [None])[0]
        first_name = attributes.get("first_name", [""])[0]
        last_name = attributes.get("last_name", [""])[0]

        if not username or not email:
            logger.error("Missing required SAML attributes: uid or email")
            return None

        # Get or create user
        user, created = User.objects.get_or_create(
            username=username,
            defaults={
                "email": email,
                "first_name": first_name,
                "last_name": last_name,
                "is_active": True,
            },
        )

        if not created:
            # Update user information
            user.email = email
            user.first_name = first_name
            user.last_name = last_name
            user.save()

        # Handle groups if provided
        groups = attributes.get("groups", [])
        if groups:
            self._sync_user_groups(user, groups)

        return user

    def _parse_saml_response(self, saml_response):
        """
        Parse SAML response and extract attributes
        """
        try:
            from onelogin.saml2.auth import OneLogin_Saml2_Auth
            from onelogin.saml2.utils import OneLogin_Saml2_Utils

            # This would be implemented with actual SAML parsing
            # For now, returning None to indicate parsing needs implementation
            return None
        except ImportError:
            logger.error("python3-saml not installed")
            return None

    def _sync_user_groups(self, user, group_names):
        """
        Synchronize user groups based on SAML attributes
        """
        from django.contrib.auth.models import Group

        # Clear existing groups
        user.groups.clear()

        # Add user to specified groups
        for group_name in group_names:
            group, _ = Group.objects.get_or_create(name=group_name)
            user.groups.add(group)

    def get_user(self, user_id):
        """
        Get user by ID
        """
        try:
            return User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return None
