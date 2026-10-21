@echo off
echo ========================================================
echo Starting SID_Talkies (Backend + Frontend)...
echo ========================================================

start "SID_Talkies Backend" cmd /k "run_backend.bat"
timeout /t 2 /nobreak >nul
start "SID_Talkies Frontend" cmd /k "run_frontend.bat"

echo Backend & Frontend launched!
