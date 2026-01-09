# PowerShell script to start Django server with API keys
$env:GOOGLE_API_KEY="AIzaSyAUr1qD0EgEgOci3afOQ5eXPMa74gT5kU4"
$env:HMRC_API_KEY="78c822f6-c88d-4502-a15b-80f4597b7c28"
$env:OPENAI_API_KEY="[YOUR_OPENAI_API_KEY_HERE]"

Write-Host "Starting Django development server..."
Write-Host "API keys configured"
Write-Host "Server will be available at http://localhost:8000"
Write-Host "Press Ctrl+C to stop the server"
Write-Host ""

cd "C:\Users\paul-\OneDrive - BARE Capital Ltd\BARE Drive\10.0 BUILDFUND\1.0 Website Dev\GitHub\buildfund_webapp"
python manage.py runserver
