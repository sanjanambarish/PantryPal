#!/usr/bin/env pwsh
# PantryPal AI – Development startup script
# Run this from the project root: .\start-dev.ps1

Write-Host "╔══════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║       PantryPal AI – Dev Server      ║" -ForegroundColor Green
Write-Host "╚══════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""

# --- Backend ---
Write-Host "▶ Starting Django backend on http://localhost:8000" -ForegroundColor Cyan
$backendJob = Start-Job -ScriptBlock {
    Set-Location "$using:PSScriptRoot\backend"
    if (Test-Path "venv\Scripts\Activate.ps1") {
        & "venv\Scripts\Activate.ps1"
    }
    python manage.py migrate --run-syncdb 2>&1
    python manage.py runserver 0.0.0.0:8000
}

Start-Sleep -Seconds 3

# --- Frontend ---
Write-Host "▶ Starting React frontend on http://localhost:3000" -ForegroundColor Cyan
$frontendJob = Start-Job -ScriptBlock {
    Set-Location "$using:PSScriptRoot\frontend"
    npm run dev
}

Write-Host ""
Write-Host "Both servers started. Press Ctrl+C to stop." -ForegroundColor Yellow
Write-Host "  Frontend → http://localhost:3000" -ForegroundColor White
Write-Host "  Backend  → http://localhost:8000/api/" -ForegroundColor White
Write-Host "  CouchDB  → http://localhost:5984/_utils/" -ForegroundColor White
Write-Host ""

# Keep script running
try {
    while ($true) { Start-Sleep -Seconds 5 }
} finally {
    Stop-Job $backendJob, $frontendJob
    Remove-Job $backendJob, $frontendJob
}
