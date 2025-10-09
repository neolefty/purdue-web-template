"""
Custom User model for the authentication app.

This extends Django's AbstractUser to allow for future customization.
Even though we're not adding fields initially, having a custom User model
from the start is a Django best practice that makes future changes much easier.
"""

import secrets
from datetime import timedelta

from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone


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

    # Email verification
    is_email_verified = models.BooleanField(
        default=False,
        help_text="Designates whether this user has verified their email address.",
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


class EmailVerificationToken(models.Model):
    """
    Token for email verification.
    Tokens are single-use and expire after 24 hours.
    """

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="email_verification_tokens",
    )
    token = models.CharField(max_length=64, unique=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    is_used = models.BooleanField(default=False)

    class Meta:
        db_table = "auth_email_verification_token"
        verbose_name = "Email Verification Token"
        verbose_name_plural = "Email Verification Tokens"
        ordering = ["-created_at"]

    def __str__(self):
        return f"Verification token for {self.user.username}"

    def save(self, *args, **kwargs):
        """Generate token and expiry on creation."""
        if not self.token:
            self.token = secrets.token_urlsafe(32)
        if not self.expires_at:
            self.expires_at = timezone.now() + timedelta(hours=24)
        super().save(*args, **kwargs)

    def is_valid(self):
        """Check if token is valid (not expired and not used)."""
        return not self.is_used and timezone.now() < self.expires_at

    @classmethod
    def create_for_user(cls, user):
        """Create a new verification token for a user."""
        # Invalidate any existing unused tokens
        cls.objects.filter(user=user, is_used=False).update(is_used=True)
        return cls.objects.create(user=user)
