"""
Production settings
"""

from .base import *

DEBUG = False

# Security settings
SECURE_SSL_REDIRECT = env.bool("SECURE_SSL_REDIRECT", default=True)
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = "DENY"
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True

# Trust proxy headers when behind nginx
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
USE_X_FORWARDED_HOST = True

# Allowed hosts must be explicitly set in production
ALLOWED_HOSTS = env.list("ALLOWED_HOSTS")

# Static files with compression
STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"
WHITENOISE_COMPRESS_OFFLINE = True
WHITENOISE_COMPRESSION_QUALITY = 90

# Add frontend dist to static files in production
STATICFILES_DIRS = STATICFILES_DIRS + [
    BASE_DIR.parent / "frontend" / "dist",  # React build output
]

# Database connection pooling
DATABASES["default"]["CONN_MAX_AGE"] = 600
DATABASES["default"]["CONN_HEALTH_CHECKS"] = True

# Cache configuration - use Redis if available, otherwise use local memory
if env("REDIS_URL", default=None):
    CACHES = {
        "default": {
            "BACKEND": "django_redis.cache.RedisCache",
            "LOCATION": env("REDIS_URL"),
            "OPTIONS": {
                "CLIENT_CLASS": "django_redis.client.DefaultClient",
                "CONNECTION_POOL_KWARGS": {
                    "max_connections": 50,
                    "retry_on_timeout": True,
                },
            },
            "KEY_PREFIX": "purdue_app",
            "TIMEOUT": 300,
        }
    }
else:
    # Fallback to local memory cache if Redis is not configured
    CACHES = {
        "default": {
            "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
            "LOCATION": "unique-snowflake",
        }
    }

# Session configuration
# Use database sessions since we don't have Redis for shared cache
SESSION_ENGINE = "django.contrib.sessions.backends.db"
SESSION_COOKIE_AGE = 86400  # 24 hours
SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_SAMESITE = "Lax"

# Email configuration is inherited from base.py
# Production should use SMTP backend (already set in base.py as default)
# Override here only if production needs different settings:
# SERVER_EMAIL = env("SERVER_EMAIL", default="server-errors@purdue.edu")

# Sentry error tracking
if env("SENTRY_DSN", default=None):
    import sentry_sdk
    from sentry_sdk.integrations.django import DjangoIntegration

    sentry_sdk.init(
        dsn=env("SENTRY_DSN"),
        integrations=[DjangoIntegration()],
        traces_sample_rate=env.float("SENTRY_TRACES_SAMPLE_RATE", default=0.1),
        send_default_pii=False,
        environment="production",
    )

# SAML Configuration for Production
if AUTH_METHOD == "saml":
    import saml2
    from saml2 import saml

    SAML_CONFIG = {
        "xmlsec_binary": "/usr/bin/xmlsec1",
        "entityid": env("SAML_ENTITY_ID", default="https://yourapp.purdue.edu/saml/metadata/"),
        "attribute_map_dir": str(BASE_DIR / "saml" / "attribute-maps"),
        "service": {
            "sp": {
                "name": "Purdue Web Application",
                "endpoints": {
                    "assertion_consumer_service": [
                        (
                            env("SAML_ACS_URL", default="https://yourapp.purdue.edu/saml/acs/"),
                            saml2.BINDING_HTTP_POST,
                        ),
                    ],
                    "single_logout_service": [
                        (
                            env("SAML_SLS_URL", default="https://yourapp.purdue.edu/saml/sls/"),
                            saml2.BINDING_HTTP_REDIRECT,
                        ),
                    ],
                },
                "required_attributes": ["uid", "email"],
                "optional_attributes": ["first_name", "last_name", "groups"],
            },
        },
        "metadata": {
            "remote": [
                {
                    "url": env(
                        "SAML_METADATA_URL",
                        default="https://www.purdue.edu/apps/account/saml/metadata.xml",
                    ),
                },
            ],
        },
        "key_file": env("SAML_KEY_FILE", default=str(BASE_DIR / "saml" / "private.key")),
        "cert_file": env("SAML_CERT_FILE", default=str(BASE_DIR / "saml" / "public.cert")),
        "encryption_keypairs": [
            {
                "key_file": env("SAML_KEY_FILE", default=str(BASE_DIR / "saml" / "private.key")),
                "cert_file": env("SAML_CERT_FILE", default=str(BASE_DIR / "saml" / "public.cert")),
            }
        ],
    }

# Logging for production
LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "verbose": {
            "format": "{levelname} {asctime} {module} {process:d} {thread:d} {message}",
            "style": "{",
        },
    },
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
            "formatter": "verbose",
        },
    },
    "root": {
        "handlers": ["console"],
        "level": "WARNING",
    },
    "loggers": {
        "django": {
            "handlers": ["console"],
            "level": "WARNING",
            "propagate": False,
        },
        "django.security": {
            "handlers": ["console"],
            "level": "INFO",
            "propagate": False,
        },
        "apps.authentication": {
            "handlers": ["console"],
            "level": "DEBUG",
            "propagate": False,
        },
    },
}
