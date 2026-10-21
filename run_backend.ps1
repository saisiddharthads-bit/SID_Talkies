Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "Starting SID_Talkies Backend API Service..." -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan

$backendDir = Join-Path $PSScriptRoot "backend"
$venvPython = Join-Path $backendDir ".venv\Scripts\python.exe"
$env:PYTHONPATH = $backendDir

& $venvPython -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
