# Environment Variables Guide

This document outlines the environment variables needed to fully configure the BuildFund application.

## Required Environment Variables

### Django Backend (`buildfund_webapp`)

Create a `.env` file in the `buildfund_webapp` directory with the following variables:

#### Core Django Settings
```env
# Django Secret Key (REQUIRED for production)
DJANGO_SECRET_KEY=your-secret-key-here-generate-a-random-string

# Debug Mode (set to False in production)
DJANGO_DEBUG=True

# Allowed Hosts (comma-separated)
DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1

# CORS Allowed Origins (comma-separated)
CORS_ALLOWED_ORIGINS=http://localhost:3000
```

#### Database Configuration (Optional - defaults to SQLite)
```env
# Database Engine (postgresql, mysql, sqlite3)
DB_ENGINE=django.db.backends.sqlite3

# For PostgreSQL/MySQL:
DB_NAME=buildfund
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=127.0.0.1
DB_PORT=5432
```

#### External API Keys

##### OpenAI API Key (REQUIRED for Underwriting Reports)
```env
# Get your API key from: https://platform.openai.com/api-keys
OPENAI_API_KEY=[YOUR_OPENAI_API_KEY_HERE]
```
**Purpose:** Used to generate AI-powered underwriting reports for projects. Without this key, the underwriting report generation feature will not work.

**⚠️ SECURITY NOTE:** This key must be kept secret and never exposed in client-side code or committed to version control. Always use environment variables.

##### Google Maps API Key (OPTIONAL but Recommended)
```env
# Get your API key from: https://console.cloud.google.com/
# Enable: Maps JavaScript API, Places API, Geocoding API
GOOGLE_API_KEY=your-google-maps-api-key-here
```
**Purpose:** 
- Address autocomplete in project creation forms
- Geocoding addresses to coordinates
- Reverse geocoding for location display

**Note:** The Google Maps API requires billing to be enabled, but Google provides $200 in free credits per month.

#### Rate Limiting (Optional)
```env
DRF_RATE_LIMIT_ANON=100/day
DRF_RATE_LIMIT_USER=1000/day
```

### React Frontend (`new_website`)

Create a `.env` file in the `new_website` directory:

```env
# API Base URL (defaults to http://localhost:8000 if not set)
REACT_APP_API_BASE_URL=http://localhost:8000

# Google Maps API Key (for address autocomplete - if using)
REACT_APP_GOOGLE_MAPS_API_KEY=your-google-maps-api-key-here
```

**Note:** Frontend environment variables must be prefixed with `REACT_APP_` to be accessible in the React application.

## Setting Up Environment Variables

### For Development

1. **Backend:**
   ```bash
   cd buildfund_webapp
   # Create .env file (copy from .env.example if it exists)
   # Add the variables listed above
   ```

2. **Frontend:**
   ```bash
   cd new_website
   # Create .env file
   # Add REACT_APP_API_BASE_URL=http://localhost:8000
   ```

### For Production

1. Use your hosting platform's environment variable configuration (Heroku, AWS, etc.)
2. **NEVER** commit `.env` files to version control
3. Ensure `DJANGO_DEBUG=False` in production
4. Use strong, randomly generated `DJANGO_SECRET_KEY`
5. Configure proper `CORS_ALLOWED_ORIGINS` for your production domain

## Features That Require API Keys

### Without OpenAI API Key:
- ❌ Underwriting report generation will fail
- ✅ All other features work normally

### Without Google Maps API Key:
- ❌ Address autocomplete will not work
- ❌ Geocoding features will not work
- ✅ All other features work normally (users can manually enter addresses)

## Testing Without API Keys

The application will work without these API keys, but certain features will be disabled:

- **Underwriting Reports:** The generate report endpoint will return an error message
- **Address Autocomplete:** Forms will use standard text inputs instead of autocomplete

## Security Notes

1. **Never commit API keys to version control**
2. **Use different keys for development and production**
3. **Rotate keys if they are accidentally exposed**
4. **Restrict API key permissions** (e.g., restrict Google Maps API key to specific domains/IPs)
5. **Monitor API usage** to detect unauthorized access

## Getting API Keys

### OpenAI API Key
1. Go to https://platform.openai.com/
2. Sign up or log in
3. Navigate to API Keys section
4. Create a new secret key
5. Copy and add to `.env` file

### Google Maps API Key
1. Go to https://console.cloud.google.com/
2. Create a new project or select existing
3. Enable APIs:
   - Maps JavaScript API
   - Places API
   - Geocoding API
4. Go to Credentials → Create Credentials → API Key
5. Restrict the key (recommended):
   - Application restrictions: HTTP referrers
   - API restrictions: Select only the APIs you need
6. Copy and add to `.env` file

## Current Status

Check which environment variables are currently set by looking at:
- `buildfund_webapp/buildfund_app/settings.py` - Django settings
- `new_website/src/api.js` - Frontend API configuration
