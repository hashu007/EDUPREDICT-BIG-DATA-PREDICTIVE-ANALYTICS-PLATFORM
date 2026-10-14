#!/bin/bash
# ==============================================================================
# EduPredict - Complete Local Startup Script (macOS / Linux)
# ==============================================================================

echo "=============================================================================="
echo "          EDUPREDICT: Big Data & Machine Learning Analytics Platform"
echo "=============================================================================="

# 1. Start Python Backend in background
echo "[*] Setting up Python virtual environment..."
cd backend
if [ ! -d "venv" ]; then
    python3 -m venv venv
fi
source venv/bin/activate
pip install -r requirements.txt
python3 app.py &
BACKEND_PID=$!
cd ..

# 2. Start Frontend
echo "[*] Installing frontend dependencies..."
npm install

echo "[*] Launching React Development Server on http://localhost:3000..."
npm run dev

# Cleanup when user hits Ctrl+C
trap "kill $BACKEND_PID" EXIT
