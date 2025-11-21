"""
Serializers for contact app
"""

from django.conf import settings
from django.core.mail import send_mail
from django.utils import timezone

from rest_framework import serializers

from .models import ContactMessage


class ContactMessageSerializer(serializers.ModelSerializer):
    """
    Serializer for contact form submissions.
    Handles validation and email sending.
    """

    class Meta:
        model = ContactMessage
        fields = ("name", "email", "subject", "message")

    def validate_message(self, value):
        """Ensure message is not too short"""
        if len(value.strip()) < 10:
            raise serializers.ValidationError("Message must be at least 10 characters long.")
        return value

    def create(self, validated_data):
        """Create contact message and send email"""
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
        """Send email notification to configured recipient"""
        # Get recipient email from settings
        recipient_email = getattr(settings, "CONTACT_EMAIL", settings.DEFAULT_FROM_EMAIL)

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
"""

        try:
            send_mail(
                subject,
                message_body,
                settings.DEFAULT_FROM_EMAIL,
                [recipient_email],
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
