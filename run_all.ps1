Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "Starting SID_Talkies (Backend + Frontend)..." -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan

Start-Process powershell -ArgumentList "-NoExit", "-File", (Join-Path $PSScriptRoot "run_backend.ps1")
Start-Sleep -Seconds 2
Start-Process powershell -ArgumentList "-NoExit", "-File", (Join-Path $PSScriptRoot "run_frontend.ps1")

Write-Host "Services started! Open http://localhost:5173" -ForegroundColor Green
