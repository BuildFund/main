"""
Django settings for the BuildFund project.

These settings configure the Django application to use environment
variables for sensitive values, enable rate limiting via Django REST
Framework and configure CORS so that only the designated front‑end
domains can call the API.  The configuration emphasises security
defaults suitable for a production deployment; DEBUG should be
disabled and secret keys should come from environment variables.
"""
from __future__ import annotations

import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables from .env file
# This allows local development without setting system environment variables
load_dotenv()

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.environ.get("DJANGO_SECRET_KEY", "change-me")

# SECURITY WARNING: don't run with debug turned on in production!
# Default to True for development, set to False in production via environment variable
DEBUG = os.environ.get("DJANGO_DEBUG", "True").lower() in {"1", "true", "yes"}

ALLOWED_HOSTS: list[str] = os.environ.get("DJANGO_ALLOWED_HOSTS", "localhost,127.0.0.1").split(",")

# Application definition

INSTALLED_APPS = [
    # Django core apps
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    # Third‑party apps
    "rest_framework",
    "rest_framework.authtoken",
    "corsheaders",
    # Local apps
    "accounts",
    "borrowers",
    "lenders",
    "products",
    "projects",
    "applications",
    "documents",
    "onboarding",
    # New apps for underwriting reports and mapping/geocoding
    "underwriting",
    "mapping",
    # Private equity module
    "private_equity",
    # Verification and messaging
    "verification",
    "messaging",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    # CORS middleware must come early, before CommonMiddleware
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "buildfund_app.urls"

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

WSGI_APPLICATION = "buildfund_app.wsgi.application"

# Database
# https://docs.djangoproject.com/en/4.2/ref/settings/#databases

# ---------------------------------------------------------------------------
# Database configuration
#
# This project supports both relational and MongoDB backends.  The database
# engine and connection parameters are read from environment variables.
#
# - To use MongoDB, set DB_ENGINE to "djongo" and specify DB_NAME,
#   DB_HOST, DB_PORT, DB_USER and DB_PASSWORD if authentication is
#   required.  The Djongo package allows Django's ORM to run on
#   MongoDB without further code changes.
# - To fall back to SQLite (useful for development/testing), set
#   DB_ENGINE to "django.db.backends.sqlite3" (default) and set
#   DB_NAME to the path of the SQLite database file.

DB_ENGINE = os.environ.get("DB_ENGINE", "django.db.backends.sqlite3")

if DB_ENGINE == "djongo":
    DATABASES = {
        "default": {
            "ENGINE": "djongo",
            "NAME": os.environ.get("DB_NAME", "buildfund_db"),
            "HOST": os.environ.get("DB_HOST", "localhost"),
            "PORT": os.environ.get("DB_PORT", "27017"),
            "USER": os.environ.get("DB_USER", ""),
            "PASSWORD": os.environ.get("DB_PASSWORD", ""),
            # Additional options can be added here (e.g. authSource, TLS settings)
        }
    }
else:
    DATABASES = {
        "default": {
            "ENGINE": DB_ENGINE,
            "NAME": os.environ.get("DB_NAME", str(BASE_DIR / "db.sqlite3")),
            "USER": os.environ.get("DB_USER", ""),
            "PASSWORD": os.environ.get("DB_PASSWORD", ""),
            "HOST": os.environ.get("DB_HOST", ""),
            "PORT": os.environ.get("DB_PORT", ""),
        }
    }

# Password validation
# https://docs.djangoproject.com/en/4.2/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
        "OPTIONS": {"min_length": 12},
    },
    {
        "NAME": "django.contrib.auth.password_validation.CommonPasswordValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.NumericPasswordValidator",
    },
]

# Internationalization
# https://docs.djangoproject.com/en/4.2/topics/i18n/

LANGUAGE_CODE = "en-gb"

TIME_ZONE = "Europe/London"

USE_I18N = True

USE_TZ = True

##########################################################
# External API keys
##########################################################

# API key for Google Maps / Places / Geocoding services.  This
# value MUST be provided via environment variables and **never**
# committed to version control.  When not provided, the mapping
# endpoints will return a 500 error until a key is configured.
GOOGLE_API_KEY = os.environ.get("GOOGLE_API_KEY")
if not GOOGLE_API_KEY:
    raise ValueError(
        "GOOGLE_API_KEY environment variable is required. "
        "Set it in your .env file or environment variables."
    )

# API key for OpenAI ChatGPT (underwriting report generation).
# This key MUST be provided via environment variables and **never**
# committed to version control.  When not provided, the underwriting
# endpoints will return a 500 error until a key is configured.
OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")
if not OPENAI_API_KEY:
    # Don't fail on startup, but log a warning
    import warnings
    warnings.warn(
        "OPENAI_API_KEY environment variable is not set. "
        "Underwriting report generation will not work. "
        "Set it in your .env file or environment variables.",
        UserWarning
    )

# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/4.2/howto/static-files/

STATIC_URL = "static/"

STATICFILES_DIRS = [BASE_DIR / "static"]

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

##########################################################
# REST Framework configuration
##########################################################

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework.authentication.TokenAuthentication",
        "rest_framework.authentication.SessionAuthentication",
    ],
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.IsAuthenticated",
    ],
    "DEFAULT_THROTTLE_CLASSES": [
        "rest_framework.throttling.AnonRateThrottle",
        "rest_framework.throttling.UserRateThrottle",
    ],
    "DEFAULT_THROTTLE_RATES": {
        "anon": os.environ.get("DRF_RATE_LIMIT_ANON", "100/day"),
        "user": os.environ.get("DRF_RATE_LIMIT_USER", "1000/day"),
        # Custom throttle rates for specific endpoints
        "login": "5/minute",  # Login attempts per IP
        "token_obtain": "10/hour",  # Token requests per IP
        "verification": "20/hour",  # Verification requests per user
    },
    "DEFAULT_SCHEMA_CLASS": "rest_framework.schemas.openapi.AutoSchema",
}

# CORS configuration
# Only allow requests from the specified front‑end domain(s)

# CORS configuration - SECURITY CRITICAL
# Only allow requests from explicitly whitelisted origins
CORS_ALLOWED_ORIGINS: list[str] = [
    origin.strip() 
    for origin in os.environ.get("CORS_ALLOWED_ORIGINS", "http://localhost:3000").split(",")
    if origin.strip()
]

# In production, disallow all origins except those specified above
CORS_ALLOW_ALL_ORIGINS = False

# Remove any cross‑domain credentials; rely on token authentication instead
CORS_ALLOW_CREDENTIALS = False

# Restrict allowed HTTP methods
CORS_ALLOW_METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]

# Restrict allowed headers
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

# Restrict API endpoints from being browsed by unknown origins
CORS_EXPOSE_HEADERS = ["Content-Type", "Authorization"]

# Prevent preflight caching for security
CORS_PREFLIGHT_MAX_AGE = 86400  # 24 hours

##########################################################
# Security settings
##########################################################

# In development (DEBUG=True), disable HTTPS-only settings
# In production (DEBUG=False), enable all security settings
SESSION_COOKIE_SECURE = not DEBUG
CSRF_COOKIE_SECURE = not DEBUG
# HSTS: Only enable in production (when DEBUG=False)
SECURE_HSTS_SECONDS = 31536000 if not DEBUG else 0  # Disable HSTS in development
SECURE_HSTS_INCLUDE_SUBDOMAINS = not DEBUG
SECURE_HSTS_PRELOAD = not DEBUG
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
# SSL Redirect: Only redirect HTTP to HTTPS in production
SECURE_SSL_REDIRECT = not DEBUG

# Additional security headers
SECURE_REFERRER_POLICY = "strict-origin-when-cross-origin"
X_FRAME_OPTIONS = "DENY"  # Prevent clickjacking
SECURE_CROSS_ORIGIN_OPENER_POLICY = "same-origin"

##########################################################
# Email configuration
##########################################################

EMAIL_BACKEND = os.environ.get(
    "EMAIL_BACKEND",
    "django.core.mail.backends.console.EmailBackend"  # Console backend for development
)
EMAIL_HOST = os.environ.get("EMAIL_HOST", "smtp.gmail.com")
EMAIL_PORT = int(os.environ.get("EMAIL_PORT", "587"))
EMAIL_USE_TLS = os.environ.get("EMAIL_USE_TLS", "True").lower() in {"1", "true", "yes"}
EMAIL_HOST_USER = os.environ.get("EMAIL_HOST_USER", "")
EMAIL_HOST_PASSWORD = os.environ.get("EMAIL_HOST_PASSWORD", "")
DEFAULT_FROM_EMAIL = os.environ.get("DEFAULT_FROM_EMAIL", "noreply@buildfund.com")
