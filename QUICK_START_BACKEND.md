# 🚀 Quick Start: Backend Server

## The backend server MUST be running for the frontend to work!

### ⚠️ IMPORTANT: Start the server in a SEPARATE terminal window

You need to keep this terminal window open while using the application.

---

## Step-by-Step Instructions:

### 1. Open a NEW PowerShell Window
- Press `Windows Key + X`
- Select "Windows PowerShell" or "Terminal"
- **Keep this window open** - the server runs here

### 2. Copy and Paste These Commands:

```powershell
# Navigate to backend directory
cd "C:\Users\paul-\OneDrive - BARE Capital Ltd\BARE Drive\10.0 BUILDFUND\1.0 Website Dev\GitHub\buildfund_webapp"

# Set API keys (REQUIRED)
$env:GOOGLE_API_KEY="AIzaSyAUr1qD0EgEgOci3afOQ5eXPMa74gT5kU4"
$env:HMRC_API_KEY="78c822f6-c88d-4502-a15b-80f4597b7c28"
$env:OPENAI_API_KEY="[YOUR_OPENAI_API_KEY_HERE]"

# Start the server
python manage.py runserver
```

### 3. You Should See:

```
Watching for file changes with StatReloader
Performing system checks...

System check identified no issues (0 silenced).
...
Starting development server at http://127.0.0.1:8000/
Quit the server with CTRL-BREAK.
```

### 4. Test It Works:

Open your browser and go to:
- **http://localhost:8000/admin/** 
- You should see the Django admin login page ✅

If you see the login page, the backend is running correctly!

---

## ✅ Verification Checklist:

- [ ] PowerShell window is open
- [ ] You're in the `buildfund_webapp` directory
- [ ] API keys are set (3 environment variables)
- [ ] Server shows "Starting development server at http://127.0.0.1:8000/"
- [ ] Browser can access http://localhost:8000/admin/
- [ ] Frontend can now connect (refresh the frontend page)

---

## 🛑 To Stop the Server:

Press `Ctrl+C` in the PowerShell window where the server is running.

---

## ❌ Common Issues:

### "GOOGLE_API_KEY environment variable is required"
- **Fix**: Make sure you set all 3 environment variables before running `python manage.py runserver`
- The variables are only set for that PowerShell session

### "Port 8000 is already in use"
- **Fix**: Another process is using port 8000
- Either stop that process, or use a different port:
  ```powershell
  python manage.py runserver 8001
  ```
- Then update frontend `.env` to use port 8001

### "Cannot connect to server" in frontend
- **Check**: Is the server actually running? (Check the PowerShell window)
- **Check**: Can you access http://localhost:8000/admin/ in browser?
- **Check**: Are you logged in to the frontend? (Token might be missing)

---

## 📝 Remember:

- **Keep the server terminal open** while using the app
- **Restart the server** after making changes to `settings.py` or other backend files
- **Two terminal windows needed**: One for backend, one for frontend

---

**The server cannot be started automatically. You must start it manually in your own terminal window.**
