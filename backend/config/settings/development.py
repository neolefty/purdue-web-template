"""
Development settings
"""

import importlib.util

from .base import *

DEBUG = True

# Development-specific apps
# Only add these if they're installed

dev_apps = []
if importlib.util.find_spec("django_extensions"):
    dev_apps.append("django_extensions")
if importlib.util.find_spec("debug_toolbar"):
    dev_apps.append("debug_toolbar")

INSTALLED_APPS += dev_apps

# Add debug toolbar middleware (only if installed)
if "debug_toolbar" in dev_apps:
    MIDDLEWARE.insert(2, "debug_toolbar.middleware.DebugToolbarMiddleware")

# Debug toolbar settings
INTERNAL_IPS = [
    "127.0.0.1",
    "localhost",
]

# Allow all origins in development (be careful!)
CORS_ALLOW_ALL_ORIGINS = True

# Email backend for development
# Override base.py to use console backend (prints emails to stdout)
# To test actual SMTP in development, comment this out or set EMAIL_BACKEND in .env
EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"

# Disable password validators in development for easier testing
AUTH_PASSWORD_VALIDATORS = []

# Use SQLite by default in development if no DATABASE_ENGINE is set
if not env("DATABASE_ENGINE", default=None):
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": BASE_DIR / "db.sqlite3",
        }
    }

# Static files
STATICFILES_STORAGE = "django.contrib.staticfiles.storage.StaticFilesStorage"

# Media files in development
MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"

# Logging - reduce verbosity in development
LOGGING["root"]["level"] = "INFO"
LOGGING["loggers"]["django"]["level"] = "INFO"
LOGGING["loggers"]["django.utils.autoreload"] = {
    "handlers": ["console"],
    "level": "WARNING",
    "propagate": False,
}

# SAML settings for development (mock)
if AUTH_METHOD == "saml":
    SAML_MOCK_ATTRIBUTES = {
        "uid": ["testuser"],
        "email": ["testuser@purdue.edu"],
        "first_name": ["Test"],
        "last_name": ["User"],
        "groups": ["students"],
    }
