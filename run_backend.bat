@echo off
echo ========================================================
echo Starting SID_Talkies Backend API Service...
echo ========================================================
cd /d "%~dp0backend"
call .venv\Scripts\activate.bat
set PYTHONPATH=%cd%
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
pause
