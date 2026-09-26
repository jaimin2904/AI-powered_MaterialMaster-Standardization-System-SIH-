# National Material Master Standardization Platform (SIH)

An AI-powered material standardization, de-duplication, and catalog matching platform for Central Public Sector Enterprises (CPSEs).

The platform ingests raw, disparate material descriptions across diverse CPSEs (e.g., NTPC, Coal India, ONGC, BHEL, SAIL), normalizes specifications and units, identifies duplicates, and maps local items to a unified National Unified Material Classification (NUMC) standard catalog using deep learning sentence embeddings.

---

## Prerequisites

Make sure the following are installed on your machine:
- **Python 3.10+** ([python.org](https://www.python.org/downloads/))
- **Node.js 18+** & **npm** ([nodejs.org](https://nodejs.org/))
- **Git**

---

## Quick Start (Automated 1-Click Launch)

Clone the repository and run the automated launcher. It will automatically check prerequisites, create the Python virtual environment (`venv`), install all backend and frontend dependencies, start both servers, and open the demo in your browser.

### Windows (PowerShell / File Explorer)
```powershell
git clone https://github.com/jaimin2904/AI-powered_MaterialMaster-Standardization-System-SIH-.git
cd AI-powered_MaterialMaster-Standardization-System-SIH-
.\start-demo.ps1
```
*(Or simply double-click **`start-demo.bat`** from Windows File Explorer).*

### Windows (Command Prompt / CMD)
```cmd
git clone https://github.com/jaimin2904/AI-powered_MaterialMaster-Standardization-System-SIH-.git
cd AI-powered_MaterialMaster-Standardization-System-SIH-
start-demo.bat
```

### macOS / Linux (Terminal)
```bash
git clone https://github.com/jaimin2904/AI-powered_MaterialMaster-Standardization-System-SIH-.git
cd AI-powered_MaterialMaster-Standardization-System-SIH-
chmod +x start-demo.sh
./start-demo.sh
```

---

## Manual Setup & Run

If you prefer to start each service manually in separate terminal windows:

### 1. Backend Service (FastAPI)

```bash
# 1. From the project root, create a Python virtual environment
python -m venv venv

# 2. Activate virtual environment
# On Windows (PowerShell):
.\venv\Scripts\Activate.ps1
# On Windows (CMD):
venv\Scripts\activate.bat
# On macOS/Linux:
source venv/bin/activate

# 3. Install backend dependencies
pip install -r backend/requirements.txt

# 4. Run the FastAPI backend server
cd backend
uvicorn main:app --reload --port 8000
```

- **Backend Swagger UI Docs:** [http://localhost:8000/docs](http://localhost:8000/docs)
- **API Base:** [http://localhost:8000/api](http://localhost:8000/api)
- **OpenAPI Schema:** [http://localhost:8000/openapi.json](http://localhost:8000/openapi.json)

### 2. Frontend Service (React + Vite)

Open a second terminal window in the project root:

```bash
# Install frontend packages
npm install

# Start the Vite development server
npm run dev
```

- **Frontend Web UI:** [http://localhost:5173](http://localhost:5173)

---

## One-Line Presentation Demo Launcher (PowerShell)

For quick presentations on Windows without running setup scripts, paste this single line into PowerShell from the project root:

```powershell
Start-Process powershell -ArgumentList '-NoExit', '-Command', 'Set-Location backend; & ..\venv\Scripts\Activate.ps1; uvicorn main:app --reload --port 8000' ; Start-Process powershell -ArgumentList '-NoExit', '-Command', 'npm run dev' ; Start-Sleep -Seconds 3 ; Start-Process "http://localhost:5173"
```

---

## Key Backend API Endpoints

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/dashboard/stats` | `GET` | Platform-wide KPI metrics and CPSE breakdown |
| `/api/analytics/summary` | `GET` | Standardization analytics, similarity distributions, savings |
| `/api/materials` | `GET` / `POST` | Local CPSE material inventory records & batch CSV upload |
| `/api/standard-materials` | `GET` / `POST` | National Unified Material Catalog (NUMC) records |
| `/api/mappings` | `GET` | Recommended mappings and match confidence scores |
| `/api/approvals` | `GET` / `POST` | Workflow approvals / review actions for catalog mappings |
| `/api/audit-logs` | `GET` | Complete immutable audit trail of system operations |
| `/api/cpses` | `GET` / `POST` | Directory of registered CPSE enterprises |
| `/api/matcher/match` | `POST` | Real-time semantic matching for material descriptions |
| `/api/matcher/detect-duplicates` | `POST` | Near-duplicate detection using cosine similarity threshold |

---

## Architecture Overview

- **Backend (`/backend`)**:
  - `main.py`: FastAPI router, lifecycle hooks, automatic DB migration and seeding.
  - `matcher.py`: Semantic matching engine powered by Hugging Face `SentenceTransformer("all-MiniLM-L6-v2")`.
  - `processor.py`: Rule-based NLP pre-processor for domain abbreviations, unit standardization, and regex spec extraction.
  - `crud.py`: Database query layer for CPSEs, inventory, standard catalogs, mappings, and audits.
  - `models.py`: SQLAlchemy ORM models backed by SQLite (`material_master.db`).
  - `schemas.py`: Pydantic V2 validation schemas.
  - `seed.py`: Idempotent database seeder with realistic CPSE industry datasets.
- **Frontend (`/src`)**:
  - React 18 + Vite with dynamic dashboards, material search, AI mapping review, comparison matrix, and analytics charts.

---

## Running Test Suite

Backend tests can be executed with `pytest`:

```bash
cd backend
pytest test_processor.py -q
pytest test_matcher.py -q
```

*(Note: `test_matcher.py` loads the real `all-MiniLM-L6-v2` transformer model from Hugging Face on first execution).*

---

## Stopping the Demo

Press **`Ctrl + C`** in the running terminal windows, or simply close the terminal windows.
