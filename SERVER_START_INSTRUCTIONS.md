# 🚀 Starting the Django Backend Server

## The server needs to be started manually in a separate terminal window.

### Step-by-Step Instructions:

1. **Open a NEW PowerShell window** (keep it open - this will run the server)

2. **Copy and paste these commands one by one:**

```powershell
# Navigate to the backend directory
cd "C:\Users\paul-\OneDrive - BARE Capital Ltd\BARE Drive\10.0 BUILDFUND\1.0 Website Dev\GitHub\buildfund_webapp"

# Set the API keys
$env:GOOGLE_API_KEY="AIzaSyAUr1qD0EgEgOci3afOQ5eXPMa74gT5kU4"
$env:HMRC_API_KEY="78c822f6-c88d-4502-a15b-80f4597b7c28"
$env:OPENAI_API_KEY="[YOUR_OPENAI_API_KEY_HERE]"

# Start the server
python manage.py runserver
```

3. **You should see output like:**
```
Watching for file changes with StatReloader
Performing system checks...

System check identified no issues (0 silenced).
...
Starting development server at http://127.0.0.1:8000/
Quit the server with CTRL-BREAK.
```

4. **Keep this terminal window open** - the server runs in this window

5. **Test the server** by opening your browser and going to:
   - http://localhost:8000/admin/
   - You should see the Django admin login page

## Alternative: Use the PowerShell Script

You can also use the provided script:

```powershell
.\buildfund_webapp\start_server.ps1
```

Or the debug version:

```powershell
.\buildfund_webapp\start_server_debug.ps1
```

## Troubleshooting

### If you see "GOOGLE_API_KEY environment variable is required"
- Make sure you set all three environment variables before running `python manage.py runserver`
- The variables are only set for that PowerShell session

### If you see "Port 8000 is already in use"
- Another process is using port 8000
- Either stop that process, or use a different port:
  ```powershell
  python manage.py runserver 8001
  ```

### If the server starts but frontend can't connect
- Make sure the server is actually running (check the terminal output)
- Try accessing http://localhost:8000/admin/ in your browser
- Check that CORS is configured correctly in settings.py

## Important Notes

- **The server must be running** for the frontend to work
- **Keep the server terminal open** while using the application
- **Press Ctrl+C** in the server terminal to stop it
- **You need TWO terminal windows**: one for backend, one for frontend

## Quick Test

Once the server is running, test it:
1. Open browser: http://localhost:8000/admin/
2. Should see Django admin login page
3. If you see this, the backend is working! ✅

---

**The server cannot be started automatically in the background reliably. Please start it manually using the instructions above.**
