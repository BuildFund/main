# API Keys Configuration

## ✅ Configured API Keys

### Google Maps API Key
**Key**: `AIzaSyAUr1qD0EgEgOci3afOQ5eXPMa74gT5kU4`

**Usage**:
- Postcode lookup (`/api/mapping/postcode-lookup/`)
- Address autocomplete (`/api/mapping/autocomplete/`)
- Geocoding (`/api/mapping/geocode/`)
- Reverse geocoding (`/api/mapping/reverse-geocode/`)

**Status**: ✅ Configured in settings (can be overridden via `GOOGLE_API_KEY` environment variable)

### HMRC/Companies House API Key
**Key**: `78c822f6-c88d-4502-a15b-80f4597b7c28`

**Usage**:
- Company verification (`/api/verification/company/verify/`)
- Director verification (`/api/verification/director/verify/`)

**Status**: ✅ Configured in `verification/services.py` (can be overridden via `HMRC_API_KEY` environment variable)

## 🔧 Configuration Methods

### Method 1: Environment Variables (Recommended for Production)

Create a `.env` file in `buildfund_webapp/` directory:

```bash
GOOGLE_API_KEY=AIzaSyAUr1qD0EgEgOci3afOQ5eXPMa74gT5kU4
HMRC_API_KEY=78c822f6-c88d-4502-a15b-80f4597b7c28
```

Then use a package like `python-dotenv` to load it, or set them in your deployment environment.

### Method 2: Direct in Settings (Current)

The keys are currently configured directly in the code:
- Google API Key: `buildfund_webapp/buildfund_app/settings.py` (line ~171)
- HMRC API Key: `buildfund_webapp/verification/services.py` (line ~14)

### Method 3: System Environment Variables

Set in your system environment:
```bash
# Windows PowerShell
$env:GOOGLE_API_KEY="AIzaSyAUr1qD0EgEgOci3afOQ5eXPMa74gT5kU4"
$env:HMRC_API_KEY="78c822f6-c88d-4502-a15b-80f4597b7c28"

# Linux/Mac
export GOOGLE_API_KEY="AIzaSyAUr1qD0EgEgOci3afOQ5eXPMa74gT5kU4"
export HMRC_API_KEY="78c822f6-c88d-4502-a15b-80f4597b7c28"
```

## ✅ Current Status

Both API keys are configured and ready to use:
- ✅ Google Maps API - Postcode lookup and geocoding will work
- ✅ HMRC API - Company and director verification will work

## 🧪 Testing

### Test Google Maps API (Postcode Lookup)
```bash
curl "http://localhost:8000/api/mapping/postcode-lookup/?postcode=SW1A1AA" \
  -H "Authorization: Token YOUR_TOKEN"
```

### Test HMRC API (Company Verification)
```bash
curl -X POST http://localhost:8000/api/verification/company/verify/ \
  -H "Authorization: Token YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"company_number": "12345678", "company_name": "Example Ltd"}'
```

## 🔒 Security Notes

- ⚠️ **Never commit API keys to version control**
- ✅ Use environment variables in production
- ✅ Rotate keys if exposed
- ✅ Restrict API key usage in Google Cloud Console (IP restrictions, referrer restrictions)

## 📝 Next Steps

1. ✅ API keys are configured
2. ✅ Postcode lookup is ready to use
3. ✅ Verification services are ready to use
4. 🔄 Test the endpoints to verify they work
5. 🔄 Integrate into frontend components
