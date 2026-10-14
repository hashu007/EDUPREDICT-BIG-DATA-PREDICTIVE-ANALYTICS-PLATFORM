@echo off
REM ==============================================================================
REM EduPredict - Local Backend Startup Script (Windows)
REM ==============================================================================

echo ==========================================================
echo  Starting EduPredict Backend with Local MongoDB (Windows)
echo ==========================================================

cd /d "%~dp0"

REM 1. Virtual Environment Setup
if not exist "venv" (
    echo [*] Creating Python virtual environment...
    python -m venv venv
)

echo [*] Activating virtual environment...
call venv\Scripts\activate.bat

REM 2. Dependency Installation
echo [*] Installing dependencies from requirements.txt...
pip install -r requirements.txt

REM 3. Seed MongoDB Collections
echo [*] Running database seeder...
python db_seed.py

REM 4. Launch Flask API Server
echo [✓] Starting Flask REST API at http://127.0.0.1:5000...
python app.py

pause
