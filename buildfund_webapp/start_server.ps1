# PowerShell script to start Django server with API keys
$env:GOOGLE_API_KEY="[YOUR_GOOGLE_API_KEY_HERE]"
$env:HMRC_API_KEY="[YOUR_HMRC_API_KEY_HERE]"
$env:OPENAI_API_KEY="[YOUR_OPENAI_API_KEY_HERE]"

Write-Host "Starting Django development server..."
Write-Host "API keys configured"
Write-Host "Server will be available at http://localhost:8000"
Write-Host "Press Ctrl+C to stop the server"
Write-Host ""

cd "C:\Users\paul-\OneDrive - BARE Capital Ltd\BARE Drive\10.0 BUILDFUND\1.0 Website Dev\GitHub\buildfund_webapp"
python manage.py runserver
