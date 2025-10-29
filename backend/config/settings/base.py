"""
Base settings for Purdue Web Application Template
"""

import os
from pathlib import Path

import environ

# Build paths
BASE_DIR = Path(__file__).resolve().parent.parent.parent

# Environment variables
env = environ.Env(
    DEBUG=(bool, False),
    DATABASE_ENGINE=(str, "postgresql"),
    AUTH_METHOD=(str, "email"),  # 'saml' or 'email'
    REQUIRE_EMAIL_VERIFICATION=(bool, False),  # Require email verification for new accounts
)

# Read .env file if it exists
# Look for .env in the backend directory first, then parent directory
env_file = BASE_DIR / ".env"
if os.path.exists(env_file):
    env.read_env(env_file)
else:
    # Also check parent directory (repository root)
    parent_env_file = BASE_DIR.parent / ".env"
    if os.path.exists(parent_env_file):
        env.read_env(parent_env_file)

# Security
SECRET_KEY = env("SECRET_KEY", default="django-insecure-change-this-in-production")
DEBUG = env("DEBUG")

# Site domain configuration - allows deriving other settings from a single domain
SITE_DOMAIN = env("SITE_DOMAIN", default=None)

# Site name for emails and branding
# If not set, derives from SITE_DOMAIN by taking the part before the first dot,
# replacing dashes with spaces, and capitalizing words
# Example: "django-template-dev.ag.purdue.edu" -> "Django Template Dev"
if env("SITE_NAME", default=None):
    SITE_NAME = env.str("SITE_NAME")
elif SITE_DOMAIN:
    # Extract subdomain part before first dot
    subdomain = SITE_DOMAIN.split(".")[0]
    # Replace dashes and underscores with spaces, capitalize each word
    SITE_NAME = subdomain.replace("-", " ").replace("_", " ").title()
else:
    SITE_NAME = "Django Template"

# ALLOWED_HOSTS can be explicitly set or derived from SITE_DOMAIN
if env("ALLOWED_HOSTS", default=None):
    ALLOWED_HOSTS = env.list("ALLOWED_HOSTS")
elif SITE_DOMAIN:
    ALLOWED_HOSTS = [SITE_DOMAIN]
else:
    ALLOWED_HOSTS = ["localhost", "127.0.0.1", "backend"]

# Application definition
DJANGO_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
]

THIRD_PARTY_APPS = [
    "rest_framework",
    "corsheaders",
    "django_filters",
    "drf_spectacular",
]

LOCAL_APPS = [
    "apps.core",
    "apps.authentication",
    "apps.api",
    "apps.turf_research",
]

INSTALLED_APPS = DJANGO_APPS + THIRD_PARTY_APPS + LOCAL_APPS

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "config.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [BASE_DIR / "templates"],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "config.wsgi.application"
ASGI_APPLICATION = "config.asgi.application"

# Database configuration with multi-database support
DATABASE_ENGINE = env("DATABASE_ENGINE")

if DATABASE_ENGINE == "postgresql":
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.postgresql",
            "NAME": env("DB_NAME", default="purdue_app"),
            "USER": env("DB_USER", default="postgres"),
            "PASSWORD": env("DB_PASSWORD", default="postgres"),
            "HOST": env("DB_HOST", default="localhost"),
            "PORT": env("DB_PORT", default="5432"),
            "CONN_MAX_AGE": 600,
        }
    }
elif DATABASE_ENGINE == "mysql":
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.mysql",
            "NAME": env("DB_NAME", default="purdue_app"),
            "USER": env("DB_USER", default="root"),
            "PASSWORD": env("DB_PASSWORD", default=""),
            "HOST": env("DB_HOST", default="localhost"),
            "PORT": env("DB_PORT", default="3306"),
            "OPTIONS": {
                "charset": "utf8mb4",
                "init_command": "SET sql_mode='STRICT_TRANS_TABLES'",
            },
            "CONN_MAX_AGE": 600,
        }
    }
elif DATABASE_ENGINE == "mssql":
    DATABASES = {
        "default": {
            "ENGINE": "mssql",
            "NAME": env("DB_NAME", default="purdue_app"),
            "USER": env("DB_USER", default="sa"),
            "PASSWORD": env("DB_PASSWORD", default=""),
            "HOST": env("DB_HOST", default="localhost"),
            "PORT": env("DB_PORT", default="1433"),
            "OPTIONS": {
                "driver": "ODBC Driver 18 for SQL Server",
                "extra_params": "TrustServerCertificate=yes",
            },
        }
    }
elif DATABASE_ENGINE == "oracle":
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.oracle",
            "NAME": env("DB_NAME", default="XE"),  # SID or Service name
            "USER": env("DB_USER", default="system"),
            "PASSWORD": env("DB_PASSWORD", default="oracle"),
            "HOST": env("DB_HOST", default="localhost"),
            "PORT": env("DB_PORT", default="1521"),
            "OPTIONS": {
                "threaded": True,
            },
        }
    }
elif DATABASE_ENGINE == "sqlite":
    # SQLite for lightweight development
    db_name = env("DB_NAME", default="db.sqlite3")
    # Handle both absolute and relative paths
    if os.path.isabs(db_name):
        db_path = Path(db_name)
    else:
        db_path = BASE_DIR / db_name
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": db_path,
        }
    }
else:
    raise ValueError(f"Unsupported DATABASE_ENGINE: {DATABASE_ENGINE}")

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

# Authentication backends
AUTH_METHOD = env("AUTH_METHOD")
REQUIRE_EMAIL_VERIFICATION = env("REQUIRE_EMAIL_VERIFICATION")
AUTHENTICATION_BACKENDS = []

if AUTH_METHOD == "saml":
    AUTHENTICATION_BACKENDS.append("apps.authentication.backends.PurdueSAMLBackend")
else:
    AUTHENTICATION_BACKENDS.append("django.contrib.auth.backends.ModelBackend")

# Internationalization
LANGUAGE_CODE = "en-us"
TIME_ZONE = "America/Indiana/Indianapolis"  # Purdue timezone
USE_I18N = True
USE_TZ = True

# Static files
STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR.parent / "static"  # Serve from /opt/apps/template/static
STATICFILES_DIRS = []

# Media files
MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"

# Default primary key field type
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# Custom user model
AUTH_USER_MODEL = "authentication.User"

# REST Framework configuration
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework.authentication.SessionAuthentication",
    ],
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.IsAuthenticated",
    ],
    "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.PageNumberPagination",
    "PAGE_SIZE": 20,
    "DEFAULT_SCHEMA_CLASS": "drf_spectacular.openapi.AutoSchema",
    "DEFAULT_FILTER_BACKENDS": [
        "django_filters.rest_framework.DjangoFilterBackend",
        "rest_framework.filters.SearchFilter",
        "rest_framework.filters.OrderingFilter",
    ],
}

# CORS settings - can be explicitly set or derived from SITE_DOMAIN
if env("CORS_ALLOWED_ORIGINS", default=None):
    CORS_ALLOWED_ORIGINS = env.list("CORS_ALLOWED_ORIGINS")
elif SITE_DOMAIN:
    CORS_ALLOWED_ORIGINS = [f"https://{SITE_DOMAIN}"]
else:
    CORS_ALLOWED_ORIGINS = [
        "http://localhost:5173",  # Vite dev server
        "http://localhost:3000",  # Alternative dev port
    ]
CORS_ALLOW_CREDENTIALS = True

# Frontend URL for password reset links
# Can be explicitly set or derived from SITE_DOMAIN
if env("FRONTEND_URL", default=None):
    FRONTEND_URL = env.str("FRONTEND_URL")
elif SITE_DOMAIN:
    FRONTEND_URL = f"https://{SITE_DOMAIN}"
else:
    FRONTEND_URL = "http://localhost:5173"

# CSRF trusted origins (required for Django 4.0+)
# Can be explicitly set or derived from SITE_DOMAIN
if env("CSRF_TRUSTED_ORIGINS", default=None):
    CSRF_TRUSTED_ORIGINS = env.list("CSRF_TRUSTED_ORIGINS")
elif SITE_DOMAIN:
    CSRF_TRUSTED_ORIGINS = [f"https://{SITE_DOMAIN}"]
else:
    CSRF_TRUSTED_ORIGINS = [
        "http://localhost:5173",  # Vite dev server
        "http://localhost:3000",  # Alternative dev port
    ]
CORS_ALLOW_HEADERS = [
    "accept",
    "accept-encoding",
    "authorization",
    "content-type",
    "dnt",
    "origin",
    "user-agent",
    "x-csrftoken",
    "x-requested-with",
]

# API Documentation
SPECTACULAR_SETTINGS = {
    "TITLE": "Purdue Web Application API",
    "DESCRIPTION": "API documentation for Purdue web application template",
    "VERSION": "1.0.0",
    "SERVE_INCLUDE_SCHEMA": False,
}

# Email configuration
# Supports multiple email backends:
# - smtp: Standard SMTP (default, works with Purdue's smtp.purdue.edu)
# - console: Prints to console (useful for development)
# - file: Saves to file (useful for testing)
# - dummy: Does nothing (disables email)
EMAIL_BACKEND = env("EMAIL_BACKEND", default="django.core.mail.backends.smtp.EmailBackend")

# SMTP Configuration (when using SMTP backend)
if EMAIL_BACKEND == "django.core.mail.backends.smtp.EmailBackend":
    EMAIL_HOST = env("EMAIL_HOST", default="smtp.purdue.edu")
    EMAIL_PORT = env.int("EMAIL_PORT", default=587)
    EMAIL_USE_TLS = env.bool("EMAIL_USE_TLS", default=True)
    EMAIL_USE_SSL = env.bool("EMAIL_USE_SSL", default=False)
    # Authentication (leave empty for Purdue internal servers)
    EMAIL_HOST_USER = env("EMAIL_HOST_USER", default="")
    EMAIL_HOST_PASSWORD = env("EMAIL_HOST_PASSWORD", default="")
    # Timeout for email operations (in seconds)
    EMAIL_TIMEOUT = env.int("EMAIL_TIMEOUT", default=10)
elif EMAIL_BACKEND == "django.core.mail.backends.console.EmailBackend":
    # Console backend - prints emails to stdout
    pass
elif EMAIL_BACKEND == "django.core.mail.backends.filebased.EmailBackend":
    # File backend - saves emails to files
    EMAIL_FILE_PATH = env("EMAIL_FILE_PATH", default=str(BASE_DIR / "sent_emails"))
elif EMAIL_BACKEND == "django.core.mail.backends.dummy.EmailBackend":
    # Dummy backend - does nothing
    pass

# Default email addresses
DEFAULT_FROM_EMAIL = env("DEFAULT_FROM_EMAIL", default="noreply@purdue.edu")
SERVER_EMAIL = env("SERVER_EMAIL", default="noreply@purdue.edu")

# Optional: Email subject prefix for admin emails
EMAIL_SUBJECT_PREFIX = env("EMAIL_SUBJECT_PREFIX", default="[Django] ")

# Logging
LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "verbose": {
            "format": "{levelname} {asctime} {module} {message}",
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
        "level": env("LOG_LEVEL", default="INFO"),
    },
    "loggers": {
        "django": {
            "handlers": ["console"],
            "level": env("DJANGO_LOG_LEVEL", default="INFO"),
            "propagate": False,
        },
    },
}
