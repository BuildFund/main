# PowerShell script to start Django server
# API keys are loaded from .env file (gitignored, never committed)
# Make sure you have created .env file with your API keys

Write-Host "Starting Django development server..."
Write-Host "API keys will be loaded from .env file"
Write-Host "Server will be available at http://localhost:8000"
Write-Host "Press Ctrl+C to stop the server"
Write-Host ""

cd "C:\Users\paul-\OneDrive - BARE Capital Ltd\BARE Drive\10.0 BUILDFUND\1.0 Website Dev\GitHub\buildfund_webapp"

# Check if .env file exists
if (-not (Test-Path .env)) {
    Write-Host "WARNING: .env file not found!" -ForegroundColor Yellow
    Write-Host "Please create .env file with your API keys (see .env.example)" -ForegroundColor Yellow
    Write-Host ""
}

python manage.py runserver
