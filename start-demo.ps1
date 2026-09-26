# ======================================================================
#   National Material Master Standardization Platform - Demo Launcher
# ======================================================================

$Root = $PSScriptRoot

Write-Host "`n======================================================================" -ForegroundColor Cyan
Write-Host "  National Material Master Standardization Platform - Demo Launcher" -ForegroundColor Cyan
Write-Host "======================================================================`n" -ForegroundColor Cyan

# 1. Check Python
if (-not (Get-Command python -ErrorAction SilentlyContinue)) {
    Write-Host "[ERROR] Python is not installed or not in your PATH." -ForegroundColor Red
    Write-Host "Please install Python 3.10+ from https://www.python.org/"
    exit 1
}

# 2. Check Node
if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-Host "[ERROR] Node.js / npm is not installed or not in your PATH." -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/"
    exit 1
}

# 3. Setup Python virtual environment if missing
$VenvPath = Join-Path $Root "venv"
if (-not (Test-Path $VenvPath)) {
    Write-Host "[1/3] Creating Python virtual environment (venv)..." -ForegroundColor Yellow
    python -m venv $VenvPath
    Write-Host "[2/3] Installing backend dependencies..." -ForegroundColor Yellow
    & "$VenvPath\Scripts\pip.exe" install --upgrade pip
    & "$VenvPath\Scripts\pip.exe" install -r (Join-Path $Root "backend\requirements.txt")
} else {
    Write-Host "[OK] Python virtual environment found." -ForegroundColor Green
}

# 4. Setup Node modules if missing
$NodeModulesPath = Join-Path $Root "node_modules"
if (-not (Test-Path $NodeModulesPath)) {
    Write-Host "[3/3] Installing frontend dependencies..." -ForegroundColor Yellow
    Set-Location -Path $Root
    npm install
} else {
    Write-Host "[OK] Node modules found." -ForegroundColor Green
}

Write-Host "`nStarting Backend and Frontend servers..." -ForegroundColor Cyan

# 5. Launch Backend
$BackendCmd = "Set-Location -Path '$Root\backend'; & '$Root\venv\Scripts\Activate.ps1'; uvicorn main:app --reload --port 8000"
Start-Process powershell -ArgumentList "-NoExit", "-Command", $BackendCmd

# 6. Launch Frontend
$FrontendCmd = "Set-Location -Path '$Root'; npm run dev"
Start-Process powershell -ArgumentList "-NoExit", "-Command", $FrontendCmd

# 7. Wait and open browser
Write-Host "Waiting for servers to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 3
Start-Process "http://localhost:5173"

Write-Host "`nDemo started successfully!" -ForegroundColor Green
Write-Host "  - Frontend: http://localhost:5173" -ForegroundColor White
Write-Host "  - Backend API Docs: http://localhost:8000/docs" -ForegroundColor White
Write-Host "`nTo stop the demo, close the opened terminal windows." -ForegroundColor Gray
