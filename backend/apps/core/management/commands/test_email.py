"""
Management command to test email configuration.
Usage: python manage.py test_email recipient@example.com
"""

from django.conf import settings
from django.core.mail import send_mail
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = "Test email configuration by sending a test email"

    def add_arguments(self, parser):
        parser.add_argument("email", type=str, help="Email address to send test message to")
        parser.add_argument(
            "--subject", type=str, default="Test Email from Django", help="Email subject"
        )

    def handle(self, *args, **options):
        recipient = options["email"]
        subject = options["subject"]

        self.stdout.write("Testing email configuration...")
        self.stdout.write(f"EMAIL_BACKEND: {settings.EMAIL_BACKEND}")
        self.stdout.write(f"EMAIL_HOST: {settings.EMAIL_HOST}")
        self.stdout.write(f"EMAIL_PORT: {settings.EMAIL_PORT}")
        self.stdout.write(f"EMAIL_USE_TLS: {settings.EMAIL_USE_TLS}")
        self.stdout.write(f"EMAIL_HOST_USER: {settings.EMAIL_HOST_USER or '(not set)'}")
        self.stdout.write(f"DEFAULT_FROM_EMAIL: {settings.DEFAULT_FROM_EMAIL}")
        self.stdout.write(f"Sending to: {recipient}")

        message = f"""
This is a test email from the Django application.

Server: {settings.ALLOWED_HOSTS}
Email Backend: {settings.EMAIL_BACKEND}
SMTP Host: {settings.EMAIL_HOST}

If you receive this message, email is configured correctly!
"""

        try:
            send_mail(
                subject=subject,
                message=message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[recipient],
                fail_silently=False,
            )
            self.stdout.write(self.style.SUCCESS(f"Successfully sent test email to {recipient}"))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"Failed to send email: {e}"))
