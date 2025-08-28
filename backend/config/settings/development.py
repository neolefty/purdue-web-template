"""
Development settings
"""

from .base import *

DEBUG = True

# Development-specific apps
INSTALLED_APPS += [
    "django_extensions",
    "debug_toolbar",
]

# Add debug toolbar middleware
MIDDLEWARE.insert(2, "debug_toolbar.middleware.DebugToolbarMiddleware")

# Debug toolbar settings
INTERNAL_IPS = [
    "127.0.0.1",
    "localhost",
]

# Allow all origins in development (be careful!)
CORS_ALLOW_ALL_ORIGINS = True

# Email backend for development
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
