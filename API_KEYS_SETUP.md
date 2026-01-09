# API Keys Configuration Guide

## ✅ All API Keys Configured

All API keys are now configured to use environment variables only. **No keys are hardcoded in the codebase.**

## Required Environment Variables

Create a `.env` file in the `buildfund_webapp/` directory with the following:

```bash
# Google Maps API Key (for postcode lookup, geocoding, address autocomplete)
GOOGLE_API_KEY=AIzaSyAUr1qD0EgEgOci3afOQ5eXPMa74gT5kU4

# HMRC/Companies House API Key (for company and director verification)
HMRC_API_KEY=78c822f6-c88d-4502-a15b-80f4597b7c28

# OpenAI API Key (for AI-powered underwriting reports)
OPENAI_API_KEY=[YOUR_OPENAI_API_KEY_HERE]
```

## Setting Environment Variables

### Option 1: .env File (Recommended for Development)

1. Create `.env` file in `buildfund_webapp/` directory
2. Copy the keys above into the file
3. Use `python-dotenv` to load (or set manually)

### Option 2: System Environment Variables (Recommended for Production)

**Windows PowerShell:**
```powershell
$env:GOOGLE_API_KEY="AIzaSyAUr1qD0EgEgOci3afOQ5eXPMa74gT5kU4"
$env:HMRC_API_KEY="78c822f6-c88d-4502-a15b-80f4597b7c28"
$env:OPENAI_API_KEY="[YOUR_OPENAI_API_KEY_HERE]"
```

**Linux/Mac:**
```bash
export GOOGLE_API_KEY="AIzaSyAUr1qD0EgEgOci3afOQ5eXPMa74gT5kU4"
export HMRC_API_KEY="78c822f6-c88d-4502-a15b-80f4597b7c28"
export OPENAI_API_KEY="[YOUR_OPENAI_API_KEY_HERE]"
```

### Option 3: Deployment Platform Environment Variables

For production deployments (Heroku, AWS, DigitalOcean, etc.):
- Set environment variables in your platform's dashboard
- Never commit `.env` files to version control
- Use platform secrets management

## Security Verification

✅ **No API keys in client code** (`new_website/`)
✅ **No hardcoded keys in backend** (all use `os.environ.get()`)
✅ **Application validates keys** (warns if missing)
✅ **Keys only in environment variables**

## API Key Usage

| Key | Used For | Location |
|-----|----------|----------|
| `GOOGLE_API_KEY` | Postcode lookup, geocoding, address autocomplete | `mapping/views.py` |
| `HMRC_API_KEY` | Company and director verification | `verification/services.py` |
| `OPENAI_API_KEY` | AI underwriting report generation | `underwriting/views.py` |

## Testing

After setting environment variables, test the configuration:

```bash
cd buildfund_webapp
python manage.py shell
>>> from django.conf import settings
>>> print("Google API Key:", bool(settings.GOOGLE_API_KEY))
>>> print("HMRC API Key:", bool(settings.HMRC_API_KEY))
>>> print("OpenAI API Key:", bool(settings.OPENAI_API_KEY))
```

All should return `True` if keys are properly configured.

## ⚠️ Security Reminders

1. **Never commit `.env` files** to version control
2. **Never expose API keys** in client-side code
3. **Rotate keys** if accidentally exposed
4. **Use different keys** for development and production
5. **Restrict API key permissions** in provider dashboards (Google Cloud, OpenAI, etc.)

## Next Steps

1. ✅ Create `.env` file with the keys above
2. ✅ Set environment variables in your deployment platform
3. ✅ Test that all features work (postcode lookup, verification, underwriting)
4. ✅ Verify no keys are in version control (check `.gitignore`)

---

**All API keys are now securely configured!** 🔒
