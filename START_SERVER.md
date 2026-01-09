# Starting the Django Backend Server

## Quick Start

The Django backend server needs to be running for the frontend to connect. Here's how to start it:

## Method 1: Using PowerShell Script (Easiest)

1. Open PowerShell in the project directory
2. Run:
   ```powershell
   .\buildfund_webapp\start_server.ps1
   ```

## Method 2: Manual Start (PowerShell)

1. Open PowerShell
2. Navigate to the backend directory:
   ```powershell
   cd "C:\Users\paul-\OneDrive - BARE Capital Ltd\BARE Drive\10.0 BUILDFUND\1.0 Website Dev\GitHub\buildfund_webapp"
   ```

3. Set environment variables:
   ```powershell
   $env:GOOGLE_API_KEY="AIzaSyAUr1qD0EgEgOci3afOQ5eXPMa74gT5kU4"
   $env:HMRC_API_KEY="78c822f6-c88d-4502-a15b-80f4597b7c28"
   $env:OPENAI_API_KEY="[YOUR_OPENAI_API_KEY_HERE]"
   ```

4. Start the server:
   ```powershell
   python manage.py runserver
   ```

## Method 3: Using .env File (Recommended for Development)

1. Create a `.env` file in `buildfund_webapp/` directory:
   ```bash
   GOOGLE_API_KEY=AIzaSyAUr1qD0EgEgOci3afOQ5eXPMa74gT5kU4
   HMRC_API_KEY=78c822f6-c88d-4502-a15b-80f4597b7c28
   OPENAI_API_KEY=[YOUR_OPENAI_API_KEY_HERE]
   ```

2. Install python-dotenv (if not already installed):
   ```powershell
   pip install python-dotenv
   ```

3. Start the server:
   ```powershell
   python manage.py runserver
   ```

## Verify Server is Running

Once started, you should see:
```
Starting development server at http://127.0.0.1:8000/
Quit the server with CTRL-BREAK.
```

You can verify by visiting:
- http://localhost:8000/admin/ (Django admin)
- http://localhost:8000/api/ (API root)

## Troubleshooting

### Error: "GOOGLE_API_KEY environment variable is required"
- **Solution**: Set the environment variables before starting the server (see Method 2 or 3 above)

### Error: "Port 8000 is already in use"
- **Solution**: Either stop the process using port 8000, or use a different port:
  ```powershell
  python manage.py runserver 8001
  ```
  Then update the frontend `.env` file to use port 8001.

### Error: "Cannot connect to server"
- **Check**: Is the server actually running?
- **Check**: Are you using the correct URL (http://localhost:8000)?
- **Check**: Is there a firewall blocking the connection?

## Starting Both Frontend and Backend

You need **two terminal windows**:

1. **Terminal 1 - Backend**:
   ```powershell
   cd buildfund_webapp
   # Set environment variables (see Method 2 or 3)
   python manage.py runserver
   ```

2. **Terminal 2 - Frontend**:
   ```powershell
   cd new_website
   npm start
   ```

Both should be running simultaneously for the application to work.

---

**The server is now starting in the background. Check the terminal for the "Starting development server" message.**
