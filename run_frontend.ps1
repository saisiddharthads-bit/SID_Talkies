Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "Starting SID_Talkies Mobile Web Frontend..." -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan

$frontendDir = Join-Path $PSScriptRoot "frontend"
Set-Location $frontendDir

Start-Process "http://localhost:5173"
npm run dev
