#!/usr/bin/env bash
set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$DIR"

echo "======================================================================"
echo "  National Material Master Standardization Platform - Demo Launcher"
echo "======================================================================"
echo ""

# 1. Check Python
if ! command -v python3 &> /dev/null && ! command -v python &> /dev/null; then
    echo "[ERROR] Python is not installed. Please install Python 3.10+."
    exit 1
fi
PYTHON_CMD=$(command -v python3 || command -v python)

# 2. Check Node
if ! command -v npm &> /dev/null; then
    echo "[ERROR] Node.js / npm is not installed. Please install Node.js."
    exit 1
fi

# 3. Setup Python virtual environment if missing
if [ ! -d "venv" ]; then
    echo "[1/3] Creating Python virtual environment..."
    $PYTHON_CMD -m venv venv
    echo "[2/3] Installing backend dependencies..."
    ./venv/bin/pip install --upgrade pip
    ./venv/bin/pip install -r backend/requirements.txt
else
    echo "[OK] Python virtual environment found."
fi

# 4. Setup Node modules if missing
if [ ! -d "node_modules" ]; then
    echo "[3/3] Installing frontend dependencies..."
    npm install
else
    echo "[OK] Node modules found."
fi

echo ""
echo "Starting Backend and Frontend servers..."

# 5. Launch Backend
(cd "$DIR/backend" && "$DIR/venv/bin/uvicorn" main:app --reload --port 8000) &
BACKEND_PID=$!

# 6. Launch Frontend
npm run dev &
FRONTEND_PID=$!

cleanup() {
    echo ""
    echo "Stopping servers..."
    kill "$BACKEND_PID" "$FRONTEND_PID" 2>/dev/null || true
    exit 0
}

trap cleanup INT TERM

sleep 3
if command -v xdg-open &> /dev/null; then
    xdg-open "http://localhost:5173"
elif command -v open &> /dev/null; then
    open "http://localhost:5173"
fi

echo ""
echo "Demo started successfully!"
echo "  - Frontend: http://localhost:5173"
echo "  - Backend API Docs: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop both servers."

wait
