# Network Error Troubleshooting Guide

## Issue: "Failed to load data: Network Error" on Admin Dashboard

### Fixed Issues:

1. ✅ **CORS Middleware Order** - Moved `CorsMiddleware` before `CommonMiddleware` in settings.py
2. ✅ **Enhanced Error Messages** - Updated AdminDashboard to show more detailed error information

### Steps to Fix:

1. **Restart the Django server** (the middleware order change requires a restart):
   ```powershell
   # In your backend terminal, press Ctrl+C to stop
   # Then restart:
   cd "C:\Users\paul-\OneDrive - BARE Capital Ltd\BARE Drive\10.0 BUILDFUND\1.0 Website Dev\GitHub\buildfund_webapp"
   $env:GOOGLE_API_KEY="[YOUR_GOOGLE_API_KEY_HERE]"
   $env:HMRC_API_KEY="[YOUR_HMRC_API_KEY_HERE]"
   $env:OPENAI_API_KEY="[YOUR_OPENAI_API_KEY_HERE]"
   python manage.py runserver
   ```

2. **Check Browser Console**:
   - Open browser DevTools (F12)
   - Go to Console tab
   - Look for CORS errors or network errors
   - Check the Network tab to see if requests are being blocked

3. **Verify Authentication**:
   - Make sure you're logged in
   - Check that `localStorage.getItem('token')` returns a token
   - The token should be sent in the Authorization header

### Common Causes:

1. **CORS Issues**:
   - Check browser console for CORS errors
   - Verify `CORS_ALLOWED_ORIGINS` includes `http://localhost:3000`
   - Make sure the frontend is running on port 3000

2. **Server Not Running**:
   - Verify backend is running: http://localhost:8000/admin/
   - Check the terminal for any error messages

3. **Authentication Issues**:
   - Make sure you're logged in
   - Token might have expired - try logging out and back in
   - Check browser console for 401/403 errors

4. **Network/Firewall**:
   - Check if firewall is blocking localhost connections
   - Try accessing http://localhost:8000/api/projects/ directly in browser (will need to be logged in)

### Testing:

1. **Test API directly** (in browser, after logging in):
   ```
   http://localhost:8000/api/projects/
   ```
   Should return JSON data (or redirect to login if not authenticated)

2. **Test from browser console**:
   ```javascript
   fetch('http://localhost:8000/api/projects/', {
     headers: {
       'Authorization': 'Token ' + localStorage.getItem('token')
     }
   })
   .then(r => r.json())
   .then(console.log)
   .catch(console.error)
   ```

3. **Check CORS headers**:
   - In browser DevTools → Network tab
   - Look at the OPTIONS request (preflight)
   - Check response headers for `Access-Control-Allow-Origin`

### If Still Not Working:

1. **Clear browser cache and cookies**
2. **Try incognito/private browsing mode**
3. **Check Django server logs** for any errors
4. **Verify all environment variables are set** in the server terminal

---

**After restarting the server, refresh the Admin Dashboard page. The enhanced error messages will now show more details about what's failing.**
