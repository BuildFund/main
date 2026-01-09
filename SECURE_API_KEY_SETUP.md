# Secure API Key Setup Guide

## ✅ Security Status

Your BuildFund application is configured to use environment variables for all API keys. **No keys are hardcoded in the codebase**, ensuring they will never be exposed in GitHub commits.

## 🔒 How It Works

1. **Environment Variables**: All API keys are read from environment variables
2. **`.env` File**: Local development uses a `.env` file (gitignored)
3. **`.env.example`**: Template file with placeholders (safe to commit)
4. **Git Protection**: `.env` files are in `.gitignore` and will never be committed

## 📝 Setup Instructions

### Step 1: Create Your `.env` File

1. Navigate to the `buildfund_webapp/` directory
2. Copy the example file:
   ```powershell
   cd buildfund_webapp
   Copy-Item .env.example .env
   ```

### Step 2: Add Your API Keys

Open the `.env` file and replace the placeholders with your actual keys:

```env
GOOGLE_API_KEY=your-actual-google-api-key-here
HMRC_API_KEY=your-actual-hmrc-api-key-here
OPENAI_API_KEY=your-actual-openai-api-key-here
```

### Step 3: Verify `.env` is Gitignored

The `.env` file should already be in `.gitignore`. Verify with:

```powershell
git check-ignore buildfund_webapp/.env
```

If it returns the path, it's properly ignored. ✅

### Step 4: Load Environment Variables

#### Option A: Using python-dotenv (Recommended)

Install if not already installed:
```powershell
pip install python-dotenv
```

Add to `buildfund_webapp/buildfund_app/settings.py` (if not already there):
```python
from dotenv import load_dotenv
load_dotenv()  # Loads .env file automatically
```

#### Option B: PowerShell Environment Variables

Set in your PowerShell session:
```powershell
$env:GOOGLE_API_KEY="your-actual-google-api-key-here"
$env:HMRC_API_KEY="your-actual-hmrc-api-key-here"
$env:OPENAI_API_KEY="your-actual-openai-api-key-here"
```

## 🔍 Verification

### Check Keys Are Loaded

```powershell
cd buildfund_webapp
python manage.py shell
```

Then in Python shell:
```python
from django.conf import settings
print("Google API Key:", "✅ Set" if settings.GOOGLE_API_KEY else "❌ Missing")
print("HMRC API Key:", "✅ Set" if hasattr(settings, 'HMRC_API_KEY') else "❌ Missing")
print("OpenAI API Key:", "✅ Set" if settings.OPENAI_API_KEY else "❌ Missing")
```

### Test Google Maps API

```powershell
# Start the server
python manage.py runserver

# In another terminal, test the endpoint (after logging in)
curl "http://localhost:8000/api/mapping/postcode-lookup/?postcode=SW1A1AA" -H "Authorization: Token YOUR_TOKEN"
```

## 🚨 Security Checklist

- ✅ `.env` file is in `.gitignore`
- ✅ `.env.example` contains only placeholders
- ✅ No API keys in any `.py`, `.js`, `.md`, or other source files
- ✅ All keys read from `os.environ.get()` in code
- ✅ Never commit `.env` file to git
- ✅ Use different keys for development and production

## 🛡️ Additional Security Measures

### For Production Deployment

1. **Use Platform Secrets Management**:
   - Heroku: `heroku config:set GOOGLE_API_KEY=your-key`
   - AWS: Use AWS Secrets Manager or Parameter Store
   - Azure: Use Azure Key Vault
   - DigitalOcean: Use App Platform environment variables

2. **Restrict API Keys**:
   - Google Maps: Restrict to your domain/IP in Google Cloud Console
   - OpenAI: Set usage limits and monitor usage
   - HMRC: Follow their security guidelines

3. **Rotate Keys Regularly**:
   - Change keys every 90 days
   - Immediately rotate if exposed

## 📚 Files Involved

- `buildfund_webapp/.env` - Your actual keys (gitignored) ⚠️ NEVER COMMIT
- `buildfund_webapp/.env.example` - Template with placeholders (safe to commit) ✅
- `buildfund_webapp/buildfund_app/settings.py` - Reads from environment variables
- `.gitignore` - Ensures `.env` is never committed

## ❓ Troubleshooting

### "GOOGLE_API_KEY environment variable is required"

**Solution**: Make sure your `.env` file exists and contains `GOOGLE_API_KEY=your-key`

### Keys not loading from `.env` file

**Solution**: Install and use `python-dotenv`:
```powershell
pip install python-dotenv
```

Then ensure `load_dotenv()` is called in `settings.py`

### Keys work locally but not in production

**Solution**: Set environment variables in your deployment platform's dashboard, not in code.

---

**Remember**: If you ever see an API key in a file that's about to be committed, **STOP** and remove it before committing!
