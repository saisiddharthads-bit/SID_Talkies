@echo off
echo ========================================================
echo Starting SID_Talkies Mobile Web Frontend...
echo ========================================================
cd /d "%~dp0frontend"
start http://localhost:5173
npm run dev
pause
