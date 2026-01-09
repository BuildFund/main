# 🔧 HTTPS Redirect Fix

## Problem

When accessing `http://localhost:8000/admin/`, the browser automatically redirects to `https://localhost:8000/admin/` and shows an error.

## Root Cause

Django security settings were forcing HTTPS redirects even in development:
- `SECURE_SSL_REDIRECT = not DEBUG` - Redirects HTTP to HTTPS when DEBUG is False
- `SECURE_HSTS_SECONDS = 31536000` - Tells browser to always use HTTPS for this domain
- `DEBUG` was defaulting to `False` instead of `True` for development

## ✅ Fix Applied

1. **Changed DEBUG default to `True`** for development
2. **Disabled HSTS in development** (only enabled in production)
3. **SSL redirect only happens in production** (when DEBUG=False)

## Action Required: Restart Server

**You MUST restart the Django server** for these changes to take effect:

1. In your backend PowerShell window, press `Ctrl+C` to stop the server
2. Restart it:
   ```powershell
   cd "C:\Users\paul-\OneDrive - BARE Capital Ltd\BARE Drive\10.0 BUILDFUND\1.0 Website Dev\GitHub\buildfund_webapp"
   $env:GOOGLE_API_KEY="AIzaSyAUr1qD0EgEgOci3afOQ5eXPMa74gT5kU4"
   $env:HMRC_API_KEY="78c822f6-c88d-4502-a15b-80f4597b7c28"
   $env:OPENAI_API_KEY="[YOUR_OPENAI_API_KEY_HERE]"
   python manage.py runserver
   ```

## Clear Browser HSTS Cache

Your browser may have cached the HSTS setting. Clear it:

### Chrome/Edge:
1. Go to: `chrome://net-internals/#hsts` (or `edge://net-internals/#hsts`)
2. Scroll to "Delete domain security policies"
3. Enter: `localhost`
4. Click "Delete"
5. Close and reopen your browser

### Firefox:
1. Go to: `about:config`
2. Search for: `security.tls.insecure_fallback_hosts`
3. Add `localhost` to the list
4. Or clear all HSTS data: `about:preferences#privacy` → Clear Data → Cookies and Site Data

### Alternative: Use Incognito/Private Mode
- Open an incognito/private window
- Try accessing `http://localhost:8000/admin/` again

## Verify Fix

After restarting the server and clearing HSTS:

1. Open browser (or incognito window)
2. Go to: `http://localhost:8000/admin/`
3. Should **NOT** redirect to HTTPS
4. Should show Django admin login page ✅

## For Production

When deploying to production:
- Set `DJANGO_DEBUG=False` in environment variables
- All security settings (HSTS, SSL redirect) will automatically enable
- Use proper SSL certificates with a reverse proxy (nginx, Apache)

---

**After restarting the server and clearing browser HSTS cache, HTTP should work correctly!**
