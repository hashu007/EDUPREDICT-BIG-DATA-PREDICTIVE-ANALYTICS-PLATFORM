#!/usr/bin/env bash
# ==============================================================================
# EduPredict - Local Backend Startup Script (Linux & macOS)
# ==============================================================================

set -e

echo "=========================================================="
echo " Starting EduPredict Backend with Local MongoDB"
echo "=========================================================="

cd "$(dirname "$0")"

# 1. Virtual Environment Setup
if [ ! -d "venv" ]; then
    echo "[*] Creating Python virtual environment..."
    python3 -m venv venv
fi

echo "[*] Activating virtual environment..."
source venv/bin/activate

# 2. Dependency Installation
echo "[*] Installing / Verifying dependencies..."
pip install -r requirements.txt --quiet

# 3. Seed Database (Optional / Safe upsert)
echo "[*] Ensuring MongoDB baseline users and collections exist..."
python3 db_seed.py || echo "[!] Notice: db_seed.py skipped or MongoDB offline. Starting server anyway."

# 4. Launch Flask API Server
echo "[✓] Starting Flask REST API at http://127.0.0.1:5000..."
python3 app.py
