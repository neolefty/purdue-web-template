"""
Models for contact app
"""

from django.db import models


class ContactMessage(models.Model):
    """
    Model to store contact form submissions.
    Provides audit trail and spam analysis.
    """

    name = models.CharField(max_length=255)
    email = models.EmailField()
    subject = models.CharField(max_length=255)
    message = models.TextField()
    submitted_url = models.URLField(max_length=500, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    email_sent = models.BooleanField(default=False)
    email_sent_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Contact Message"
        verbose_name_plural = "Contact Messages"
        indexes = [
            models.Index(fields=["-created_at"]),
            models.Index(fields=["email"]),
            models.Index(fields=["ip_address"]),
        ]

    def __str__(self):
        return f"{self.name} - {self.subject} ({self.created_at})"
