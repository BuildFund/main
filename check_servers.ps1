# BuildFund Server Status Check Script
Write-Host "`n=== BuildFund Server Status Check ===" -ForegroundColor Cyan

# Check Django Backend
Write-Host "`n1. Django Backend (Port 8000):" -ForegroundColor Yellow
$djangoProcesses = Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique
if ($djangoProcesses) {
    Write-Host "   [OK] Django server is running (PID: $($djangoProcesses -join ', '))" -ForegroundColor Green
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8000/api/" -Method GET -TimeoutSec 3 -UseBasicParsing -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            Write-Host "   [OK] API endpoint is responding" -ForegroundColor Green
        }
    } catch {
        Write-Host "   [WARNING] API endpoint not responding: $($_.Exception.Message)" -ForegroundColor Yellow
    }
} else {
    Write-Host "   [ERROR] Django server is NOT running!" -ForegroundColor Red
    Write-Host "   Start it with: cd buildfund_webapp; python manage.py runserver 8000" -ForegroundColor Gray
}

# Check React Frontend
Write-Host "`n2. React Frontend (Port 3000):" -ForegroundColor Yellow
$reactProcesses = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique
if ($reactProcesses) {
    Write-Host "   [OK] React server is running (PID: $($reactProcesses -join ', '))" -ForegroundColor Green
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000" -Method GET -TimeoutSec 3 -UseBasicParsing -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            Write-Host "   [OK] Frontend is accessible" -ForegroundColor Green
        }
    } catch {
        Write-Host "   [WARNING] Frontend not responding: $($_.Exception.Message)" -ForegroundColor Yellow
    }
} else {
    Write-Host "   [ERROR] React server is NOT running!" -ForegroundColor Red
    Write-Host "   Start it with: cd new_website; npm start" -ForegroundColor Gray
}

# Recommendations
Write-Host "`n=== Recommendations ===" -ForegroundColor Cyan
if (-not $djangoProcesses) {
    Write-Host "1. Start Django server first" -ForegroundColor Yellow
}
if (-not $reactProcesses) {
    Write-Host "2. Start React server" -ForegroundColor Yellow
}
if ($djangoProcesses -and $reactProcesses) {
    Write-Host "`nBoth servers are running. If localhost is still spinning:" -ForegroundColor Yellow
    Write-Host "  - Open browser console (F12) and check for errors" -ForegroundColor White
    Write-Host "  - Clear browser cache (Ctrl+Shift+Delete)" -ForegroundColor White
    Write-Host "  - Hard refresh the page (Ctrl+Shift+R)" -ForegroundColor White
    Write-Host "  - Check if you're logged in (token in localStorage)" -ForegroundColor White
}

Write-Host "`n=== Quick Start Commands ===" -ForegroundColor Cyan
Write-Host "Terminal 1 (Django):" -ForegroundColor Yellow
Write-Host "  cd buildfund_webapp" -ForegroundColor Gray
Write-Host "  python manage.py runserver 8000" -ForegroundColor Gray
Write-Host "`nTerminal 2 (React):" -ForegroundColor Yellow
Write-Host "  cd new_website" -ForegroundColor Gray
Write-Host "  npm start" -ForegroundColor Gray
