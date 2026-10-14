@echo off
REM ==============================================================================
REM EduPredict - Complete Local Startup Script (Windows)
REM Runs both the Python Flask Backend (MongoDB) and React Vite Frontend
REM ==============================================================================

title EduPredict - Localhost Launcher
color 0A

echo ==============================================================================
echo           EDUPREDICT: Big Data & Machine Learning Analytics Platform
echo ==============================================================================
echo [*] Checking local environment...

REM 1. Check Python
where python >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Python is not installed or not in your system PATH!
    echo Please install Python 3.9+ from https://www.python.org/downloads/
    echo Make sure to check "Add Python to PATH" during installation.
    pause
    exit /b 1
)

REM 2. Check Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed or not in your system PATH!
    echo Please install Node.js LTS from https://nodejs.org/
    pause
    exit /b 1
)

REM 3. Start Python Backend in a separate window
echo [*] Starting Flask Backend & MongoDB Connector in separate console...
start "EduPredict - Python Flask Backend (Port 5000)" cmd /k "cd backend && if not exist venv (python -m venv venv) && call venv\Scripts\activate.bat && pip install -r requirements.txt && python app.py"

REM 4. Start React Frontend
echo [*] Installing frontend dependencies (if needed)...
call npm install

echo [*] Launching React Development Server on http://localhost:3000 ...
call npm run dev

pause
