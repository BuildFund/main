# Debug script to start Django server and show all output
$env:GOOGLE_API_KEY="AIzaSyAUr1qD0EgEgOci3afOQ5eXPMa74gT5kU4"
$env:HMRC_API_KEY="78c822f6-c88d-4502-a15b-80f4597b7c28"
$env:OPENAI_API_KEY="[YOUR_OPENAI_API_KEY_HERE]"

Write-Host "========================================"
Write-Host "Starting Django Development Server"
Write-Host "========================================"
Write-Host "API Keys configured:"
Write-Host "  - Google Maps: $($env:GOOGLE_API_KEY -ne $null)"
Write-Host "  - HMRC: $($env:HMRC_API_KEY -ne $null)"
Write-Host "  - OpenAI: $($env:OPENAI_API_KEY -ne $null)"
Write-Host ""
Write-Host "Current directory: $(Get-Location)"
Write-Host ""

cd "C:\Users\paul-\OneDrive - BARE Capital Ltd\BARE Drive\10.0 BUILDFUND\1.0 Website Dev\GitHub\buildfund_webapp"

Write-Host "Changed to: $(Get-Location)"
Write-Host ""
Write-Host "Running: python manage.py runserver"
Write-Host "========================================"
Write-Host ""

python manage.py runserver
