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

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.environ.get("DJANGO_SECRET_KEY", "change-me")

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = os.environ.get("DJANGO_DEBUG", "False").lower() in {"1", "true", "yes"}

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
    # New apps for underwriting reports and mapping/geocoding
    "underwriting",
    "mapping",
    # Private equity module
    "private_equity",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    # CORS middleware must come before CommonMiddleware
    "corsheaders.middleware.CorsMiddleware",
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
# value should be provided via environment variables in
# production and **never** committed to version control.  See
# README.md and .env.example for more details on how to set
# this securely.  When not provided, the mapping endpoints will
# return a 500 error until a key is configured.
GOOGLE_API_KEY = os.environ.get("GOOGLE_API_KEY")

# API key for OpenAI ChatGPT (underwriting report generation).
# This key must be kept secret and never exposed client‑side.
# Set this via the OPENAI_API_KEY environment variable.  When
# unset, the underwriting view will return an informative
# error.
OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")

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
    },
    "DEFAULT_SCHEMA_CLASS": "rest_framework.schemas.openapi.AutoSchema",
}

# CORS configuration
# Only allow requests from the specified front‑end domain(s)

CORS_ALLOWED_ORIGINS: list[str] = os.environ.get("CORS_ALLOWED_ORIGINS", "http://localhost:3000").split(",")

# In production, disallow all origins except those specified above
CORS_ALLOW_ALL_ORIGINS = False

# Remove any cross‑domain credentials; rely on token authentication instead
CORS_ALLOW_CREDENTIALS = False

# Restrict API endpoints from being browsed by unknown origins
CORS_EXPOSE_HEADERS = ["Content-Type", "Authorization"]

##########################################################
# Security settings
##########################################################

SESSION_COOKIE_SECURE = not DEBUG
CSRF_COOKIE_SECURE = not DEBUG
SECURE_HSTS_SECONDS = 31536000  # 1 year
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_SSL_REDIRECT = not DEBUG
