"""
Email utility functions for sending templated emails.

Centralizes email sending logic to avoid duplication across views.
"""

import logging

from django.conf import settings
from django.core.mail import send_mail

logger = logging.getLogger(__name__)


def send_templated_email(
    email_type: str,
    recipient: str,
    context: dict,
    fail_silently: bool = False,
) -> bool:
    """
    Send a templated email.

    Args:
        email_type: Type of email to send ('verification', 'password_reset', etc.)
        recipient: Email address of the recipient
        context: Dictionary containing template variables
        fail_silently: If True, suppress exceptions

    Returns:
        True if email was sent successfully, False otherwise
    """
    try:
        subject, message = _get_email_content(email_type, context)
        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [recipient],
            fail_silently=fail_silently,
        )
        logger.info(f"{email_type.title()} email sent to {recipient}")
        return True
    except Exception as e:
        logger.error(f"Failed to send {email_type} email to {recipient}: {e}")
        if not fail_silently:
            raise
        return False


def _get_email_content(email_type: str, context: dict) -> tuple[str, str]:
    """
    Get email subject and message body based on email type.

    Args:
        email_type: Type of email
        context: Template variables

    Returns:
        Tuple of (subject, message)
    """
    templates = {
        "verification": _verification_email,
        "password_reset": _password_reset_email,
        "welcome": _welcome_email,
    }

    template_func = templates.get(email_type)
    if not template_func:
        raise ValueError(f"Unknown email type: {email_type}")

    return template_func(context)


def _verification_email(context: dict) -> tuple[str, str]:
    """Generate email verification email content."""
    name = context.get("name", context.get("username", "User"))
    verification_url = context["verification_url"]
    site_name = getattr(settings, "SITE_NAME", "Our Site")

    subject = "Verify Your Email Address"
    message = f"""Hello {name},

Thank you for creating an account! Please verify your email address by clicking the link below:

{verification_url}

This link will expire in 24 hours.

If you did not create this account, please ignore this email.

Best regards,
The {site_name} Team
"""
    return subject, message


def _password_reset_email(context: dict) -> tuple[str, str]:
    """Generate password reset email content."""
    name = context.get("name", context.get("username", "User"))
    reset_url = context["reset_url"]
    site_name = getattr(settings, "SITE_NAME", "Our Site")

    subject = "Password Reset Request"
    message = f"""Hello {name},

You have requested a password reset. Please click the link below to reset your password:

{reset_url}

This link will expire in 24 hours.

If you did not request this password reset, please ignore this email.

Best regards,
The {site_name} Team
"""
    return subject, message


def _welcome_email(context: dict) -> tuple[str, str]:
    """Generate welcome email content."""
    name = context.get("name", context.get("username", "User"))
    site_name = getattr(settings, "SITE_NAME", "Our Site")
    login_url = context.get("login_url", "")

    subject = f"Welcome to {site_name}"
    message = f"""Hello {name},

Welcome to {site_name}! Your account has been created successfully.

{f"You can log in at: {login_url}" if login_url else ""}

If you have any questions, please don't hesitate to contact us.

Best regards,
The {site_name} Team
"""
    return subject, message
