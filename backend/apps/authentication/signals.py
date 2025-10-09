"""
Signals for authentication app
"""

from django.db.models.signals import pre_save
from django.dispatch import receiver

from .models import User


@receiver(pre_save, sender=User)
def reset_email_verification_on_email_change(sender, instance, **kwargs):
    """
    Reset is_email_verified to False when user changes their email address.
    This ensures users must verify their new email address.
    """
    if instance.pk:  # Only for existing users (not new registrations)
        try:
            old_user = User.objects.get(pk=instance.pk)
            if old_user.email != instance.email:
                instance.is_email_verified = False
        except User.DoesNotExist:
            pass
