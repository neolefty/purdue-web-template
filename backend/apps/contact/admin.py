"""
Admin configuration for contact app
"""

from django.contrib import admin

from .models import ContactMessage


@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    """Admin configuration for ContactMessage model"""

    list_display = ("name", "email", "subject", "created_at", "email_sent", "ip_address")
    list_filter = ("email_sent", "created_at")
    search_fields = ("name", "email", "subject", "message", "ip_address", "submitted_url")
    readonly_fields = ("created_at", "email_sent_at", "ip_address", "user_agent", "submitted_url")
    date_hierarchy = "created_at"

    fieldsets = (
        (
            "Contact Information",
            {
                "fields": ("name", "email", "subject", "message"),
            },
        ),
        (
            "Email Status",
            {
                "fields": ("email_sent", "email_sent_at"),
            },
        ),
        (
            "Metadata",
            {
                "fields": ("submitted_url", "ip_address", "user_agent", "created_at"),
                "classes": ("collapse",),
            },
        ),
    )

    def has_add_permission(self, request):
        """Disable adding contact messages through admin"""
        return False
