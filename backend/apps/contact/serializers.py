"""
Serializers for contact app
"""

import time

from django.conf import settings
from django.core.mail import send_mail
from django.utils import timezone

from rest_framework import serializers

from .models import ContactMessage

# Minimum time (in seconds) that must pass between form load and submission
MIN_SUBMISSION_TIME_SECONDS = 3


class ContactMessageSerializer(serializers.ModelSerializer):
    """
    Serializer for contact form submissions.
    Handles validation, spam protection, and email sending.
    """

    # Spam protection fields (write-only, not stored in DB)
    website = serializers.CharField(required=False, allow_blank=True, write_only=True)
    form_loaded_at = serializers.IntegerField(required=False, write_only=True)

    class Meta:
        model = ContactMessage
        fields = (
            "name",
            "email",
            "subject",
            "message",
            "submitted_url",
            "website",
            "form_loaded_at",
        )

    def validate_message(self, value):
        """Ensure message is not too short"""
        if len(value.strip()) < 10:
            raise serializers.ValidationError("Message must be at least 10 characters long.")
        return value

    def validate_website(self, value):
        """Honeypot validation - this field should always be empty"""
        if value:
            # Log the spam attempt but return a generic error
            import logging

            logger = logging.getLogger(__name__)
            logger.warning(
                f"Honeypot triggered - spam submission blocked (website field filled: {value[:50]})"
            )
            raise serializers.ValidationError("Invalid submission.")
        return value

    def validate_form_loaded_at(self, value):
        """Time-based validation - reject submissions that happen too quickly"""
        if value:
            current_time_ms = int(time.time() * 1000)
            elapsed_seconds = (current_time_ms - value) / 1000

            if elapsed_seconds < MIN_SUBMISSION_TIME_SECONDS:
                import logging

                logger = logging.getLogger(__name__)
                logger.warning(
                    f"Time-based spam check triggered - form submitted in {elapsed_seconds:.1f}s "
                    f"(minimum: {MIN_SUBMISSION_TIME_SECONDS}s)"
                )
                raise serializers.ValidationError("Please take your time filling out the form.")
        return value

    def create(self, validated_data):
        """Create contact message and send email"""
        # Remove spam protection fields (they're not in the model)
        validated_data.pop("website", None)
        validated_data.pop("form_loaded_at", None)

        # Get IP and user agent from request context
        request = self.context.get("request")
        if request:
            x_forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR")
            if x_forwarded_for:
                validated_data["ip_address"] = x_forwarded_for.split(",")[0]
            else:
                validated_data["ip_address"] = request.META.get("REMOTE_ADDR")
            validated_data["user_agent"] = request.META.get("HTTP_USER_AGENT", "")

        # Create the contact message record
        contact_message = super().create(validated_data)

        # Send email notification
        self._send_email_notification(contact_message)

        return contact_message

    def _send_email_notification(self, contact_message):
        """Send email notification to configured recipient(s)"""
        # Get recipient email(s) from settings
        recipient_email = getattr(settings, "CONTACT_EMAIL", settings.DEFAULT_FROM_EMAIL)
        # Ensure recipient_email is a list
        if isinstance(recipient_email, str):
            recipient_email = [recipient_email]

        # Prepare email content
        subject = f"[Contact Form] {contact_message.subject}"

        message_body = f"""
New contact form submission:

Name: {contact_message.name}
Email: {contact_message.email}
Subject: {contact_message.subject}

Message:
{contact_message.message}

---
Submitted: {contact_message.created_at}
IP Address: {contact_message.ip_address or 'N/A'}

───────────────────────────────────────

This message was submitted at {contact_message.submitted_url or 'Unknown URL'}
"""

        try:
            send_mail(
                subject,
                message_body,
                settings.DEFAULT_FROM_EMAIL,
                recipient_email,
                fail_silently=False,
            )
            contact_message.email_sent = True
            contact_message.email_sent_at = timezone.now()
            contact_message.save(update_fields=["email_sent", "email_sent_at"])
        except Exception as e:
            # Log the error but don't fail the request
            import logging

            logger = logging.getLogger(__name__)
            logger.error(f"Failed to send contact form email: {e}")
            # The contact message is still saved in the database for manual follow-up
