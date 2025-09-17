"""
Custom User model for the authentication app.

This extends Django's AbstractUser to allow for future customization.
Even though we're not adding fields initially, having a custom User model
from the start is a Django best practice that makes future changes much easier.
"""

from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """
    Custom User model extending Django's AbstractUser.

    This provides all the default Django user fields:
    - username (unique identifier)
    - email
    - first_name
    - last_name
    - is_active
    - is_staff
    - is_superuser
    - date_joined
    - last_login

    Future enhancements could include:
    - Purdue-specific fields (PUID, department, etc.)
    - Profile picture
    - Phone number
    - Timezone preferences
    - Notification settings
    """

    # Make email required and unique
    email = models.EmailField(
        verbose_name="email address",
        max_length=255,
        unique=True,
        blank=False,
        help_text="Required. Must be a valid email address.",
        error_messages={
            "unique": "A user with that email address already exists.",
        },
    )

    # Optional: Add Purdue-specific fields here in the future
    # puid = models.CharField(max_length=20, blank=True, null=True, unique=True)
    # department = models.CharField(max_length=100, blank=True)
    # career_account = models.CharField(max_length=50, blank=True)

    class Meta:
        db_table = "auth_user"
        verbose_name = "User"
        verbose_name_plural = "Users"
        ordering = ["username"]

    def __str__(self):
        """String representation of the user."""
        return self.username

    def get_full_name(self):
        """
        Return the first_name plus the last_name, with a space in between.
        Falls back to username if name is not set.
        """
        full_name = super().get_full_name()
        return full_name or self.username

    def get_short_name(self):
        """
        Return the short name for the user.
        Falls back to username if first_name is not set.
        """
        return self.first_name or self.username
