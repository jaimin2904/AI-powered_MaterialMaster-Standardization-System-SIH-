@echo off
setlocal enabledelayedexpansion

echo ======================================================================
echo   National Material Master Standardization Platform - Demo Launcher
echo ======================================================================
echo.

cd /d "%~dp0"

:: 1. Check Python
where python >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Python is not installed or not in your PATH.
    echo Please install Python 3.10+ from https://www.python.org/
    pause
    exit /b 1
)

:: 2. Check Node
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js / npm is not installed or not in your PATH.
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

:: 3. Setup Python virtual environment if missing
if not exist "venv" (
    echo [1/3] Creating Python virtual environment (venv)...
    python -m venv venv
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to create virtual environment.
        pause
        exit /b 1
    )
    echo [2/3] Installing backend dependencies...
    call venv\Scripts\activate.bat
    python -m pip install --upgrade pip
    pip install -r backend\requirements.txt
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to install backend dependencies.
        pause
        exit /b 1
    )
) else (
    echo [OK] Python virtual environment found.
)

:: 4. Setup Node modules if missing
if not exist "node_modules" (
    echo [3/3] Installing frontend dependencies...
    call npm install
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to install npm dependencies.
        pause
        exit /b 1
    )
) else (
    echo [OK] Node modules found.
)

echo.
echo ======================================================================
echo   Starting Backend and Frontend servers...
echo ======================================================================
echo.

:: 5. Launch Backend
start "Material Master Backend (FastAPI)" cmd /k "cd /d "%~dp0backend" && call ..\venv\Scripts\activate.bat && uvicorn main:app --reload --port 8000"

:: 6. Launch Frontend
start "Material Master Frontend (Vite)" cmd /k "cd /d "%~dp0" && npm run dev"

:: 7. Wait and open browser
echo Waiting for servers to initialize...
timeout /t 3 /nobreak >nul
start http://localhost:5173

echo.
echo Demo started successfully!
echo   - Frontend: http://localhost:5173
echo   - Backend API Docs: http://localhost:8000/docs
echo.
echo To stop the demo, close the opened backend and frontend terminal windows.
echo.
pause
