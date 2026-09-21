import csv
import io
import json
from typing import List, Optional
from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Query, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from .database import engine, get_db, Base
from . import models, schemas, crud
from .seed import seed_database

# Initialize database schema and seed data
Base.metadata.create_all(bind=engine)
seed_database()

app = FastAPI(
    title="AI-Driven National Material Master Platform API",
    description="REST API Foundation for CPSE Material Master Harmonization & Standardization (Problem Statement 26099)",
    version="1.0.0"
)

# Configure CORS for Frontend local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {
        "platform": "AI-Driven National Material Master Platform",
        "status": "Operational",
        "version": "1.0.0",
        "docs_url": "/docs"
    }

# ==========================================
# 1. CPSE CRUD ENDPOINTS
# ==========================================
@app.get("/api/cpses", response_model=List[schemas.CPSEOut])
def list_cpses(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_cpses(db, skip=skip, limit=limit)

@app.get("/api/cpses/{cpse_id}", response_model=schemas.CPSEOut)
def get_cpse(cpse_id: str, db: Session = Depends(get_db)):
    cpse = crud.get_cpse(db, cpse_id)
    if not cpse:
        raise HTTPException(status_code=404, detail="CPSE enterprise not found")
    return cpse

@app.post("/api/cpses", response_model=schemas.CPSEOut, status_code=status.HTTP_201_CREATED)
def create_cpse(cpse: schemas.CPSECreate, db: Session = Depends(get_db)):
    existing = crud.get_cpse(db, cpse.id)
    if existing:
        raise HTTPException(status_code=400, detail="CPSE ID already exists")
    return crud.create_cpse(db, cpse)

@app.put("/api/cpses/{cpse_id}", response_model=schemas.CPSEOut)
def update_cpse(cpse_id: str, cpse_update: schemas.CPSEUpdate, db: Session = Depends(get_db)):
    updated = crud.update_cpse(db, cpse_id, cpse_update)
    if not updated:
        raise HTTPException(status_code=404, detail="CPSE enterprise not found")
    return updated

@app.delete("/api/cpses/{cpse_id}")
def delete_cpse(cpse_id: str, db: Session = Depends(get_db)):
    success = crud.delete_cpse(db, cpse_id)
    if not success:
        raise HTTPException(status_code=404, detail="CPSE enterprise not found")
    return {"detail": f"CPSE '{cpse_id}' deleted successfully"}


# ==========================================
# 2. MATERIAL CRUD & SEARCH ENDPOINTS
# ==========================================
@app.get("/api/materials", response_model=List[schemas.MaterialOut])
def list_materials(
    skip: int = 0,
    limit: int = 100,
    cpse_id: Optional[str] = None,
    db: Session = Depends(get_db)
):
    mats = crud.get_materials(db, skip=skip, limit=limit, cpse_id=cpse_id)
    res = []
    for m in mats:
        m_dict = schemas.MaterialOut.from_orm(m)
        m_dict.cpse_name = m.cpse.name if m.cpse else m.cpse_id
        res.append(m_dict)
    return res

@app.get("/api/materials/search", response_model=List[schemas.MaterialOut])
def search_materials(
    q: Optional[str] = Query(None, description="Search keyword, material code, or spec"),
    cpse_id: Optional[str] = Query(None, description="Filter by CPSE ID"),
    category: Optional[str] = Query(None, description="Filter by category"),
    status: Optional[str] = Query(None, description="Filter by mapping status"),
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    mats = crud.search_materials(
        db, q=q, cpse_id=cpse_id, category=category, status=status, skip=skip, limit=limit
    )
    res = []
    for m in mats:
        m_dict = schemas.MaterialOut.from_orm(m)
        m_dict.cpse_name = m.cpse.name if m.cpse else m.cpse_id
        res.append(m_dict)
    return res

@app.get("/api/materials/{material_id}", response_model=schemas.MaterialOut)
def get_material(material_id: int, db: Session = Depends(get_db)):
    m = crud.get_material(db, material_id)
    if not m:
        raise HTTPException(status_code=404, detail="Material item not found")
    m_dict = schemas.MaterialOut.from_orm(m)
    m_dict.cpse_name = m.cpse.name if m.cpse else m.cpse_id
    return m_dict

@app.post("/api/materials", response_model=schemas.MaterialOut, status_code=status.HTTP_201_CREATED)
def create_material(material: schemas.MaterialCreate, db: Session = Depends(get_db)):
    cpse = crud.get_cpse(db, material.cpse_id)
    if not cpse:
        raise HTTPException(status_code=400, detail=f"CPSE '{material.cpse_id}' does not exist")
    created = crud.create_material(db, material)
    m_dict = schemas.MaterialOut.from_orm(created)
    m_dict.cpse_name = cpse.name
    return m_dict

@app.put("/api/materials/{material_id}", response_model=schemas.MaterialOut)
def update_material(material_id: int, material_update: schemas.MaterialUpdate, db: Session = Depends(get_db)):
    updated = crud.update_material(db, material_id, material_update)
    if not updated:
        raise HTTPException(status_code=404, detail="Material item not found")
    m_dict = schemas.MaterialOut.from_orm(updated)
    m_dict.cpse_name = updated.cpse.name if updated.cpse else updated.cpse_id
    return m_dict

@app.delete("/api/materials/{material_id}")
def delete_material(material_id: int, db: Session = Depends(get_db)):
    success = crud.delete_material(db, material_id)
    if not success:
        raise HTTPException(status_code=404, detail="Material item not found")
    return {"detail": f"Material ID {material_id} deleted successfully"}


# ==========================================
# 3. CSV / EXCEL MATERIAL UPLOAD API
# ==========================================
@app.post("/api/materials/upload")
async def upload_materials_csv(
    file: UploadFile = File(...),
    cpse_id: str = Query("ntpc", description="Target CPSE ID"),
    db: Session = Depends(get_db)
):
    if not file.filename.endswith(('.csv', '.txt')):
        raise HTTPException(status_code=400, detail="Only CSV/TXT files are supported currently")

    content = await file.read()
    try:
        decoded = content.decode('utf-8')
        reader = csv.DictReader(io.StringIO(decoded))
        created_count = 0

        for row in reader:
            mat_code = row.get("material_code") or row.get("LOCAL_CODE") or f"IMP-{created_count+100}"
            desc = row.get("description") or row.get("DESCRIPTION") or "Imported Material Item"
            category = row.get("category") or row.get("CATEGORY") or "General Spares"
            unit = row.get("unit") or row.get("UNIT") or "NOS"
            raw_desc = row.get("raw_description") or desc

            mat_schema = schemas.MaterialCreate(
                cpse_id=cpse_id,
                material_code=mat_code,
                description=desc,
                specification=json.dumps({"Source": file.filename}),
                unit=unit,
                category=category,
                raw_description=raw_desc,
                unit_cost=float(row.get("unit_cost", 0.0)),
                stock_qty=int(row.get("stock_qty", 0))
            )
            crud.create_material(db, mat_schema)
            created_count += 1

        crud.create_audit_log(
            db,
            action="CSV_UPLOAD",
            old_val=None,
            new_val=json.dumps({"filename": file.filename, "created_records": created_count, "cpse_id": cpse_id}),
            user="Batch Upload Service"
        )

        return {
            "message": f"Successfully uploaded and parsed '{file.filename}'",
            "imported_count": created_count,
            "cpse_id": cpse_id
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to process CSV upload: {str(e)}")


# ==========================================
# 4. STANDARD MATERIAL MANAGEMENT ENDPOINTS
# ==========================================
@app.get("/api/standard-materials", response_model=List[schemas.StandardMaterialOut])
def list_standard_materials(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_standard_materials(db, skip=skip, limit=limit)

@app.get("/api/standard-materials/{std_id}", response_model=schemas.StandardMaterialOut)
def get_standard_material(std_id: int, db: Session = Depends(get_db)):
    std_mat = crud.get_standard_material(db, std_id)
    if not std_mat:
        raise HTTPException(status_code=404, detail="Standard Material not found")
    return std_mat

@app.post("/api/standard-materials", response_model=schemas.StandardMaterialOut, status_code=status.HTTP_201_CREATED)
def create_standard_material(std_mat: schemas.StandardMaterialCreate, db: Session = Depends(get_db)):
    return crud.create_standard_material(db, std_mat)


# ==========================================
# 5. MATERIAL MAPPING ENDPOINTS
# ==========================================
@app.get("/api/mappings", response_model=List[schemas.MaterialMappingOut])
def list_mappings(skip: int = 0, limit: int = 100, status: Optional[str] = None, db: Session = Depends(get_db)):
    return crud.get_mappings(db, skip=skip, limit=limit, status=status)

@app.post("/api/mappings", response_model=schemas.MaterialMappingOut)
def create_or_update_mapping(mapping: schemas.MaterialMappingCreate, db: Session = Depends(get_db)):
    return crud.create_or_update_mapping(db, mapping)

@app.put("/api/mappings/{mapping_id}", response_model=schemas.MaterialMappingOut)
def update_mapping_status(mapping_id: int, update_data: schemas.MaterialMappingUpdate, db: Session = Depends(get_db)):
    updated = crud.update_mapping_status(db, mapping_id, update_data)
    if not updated:
        raise HTTPException(status_code=404, detail="Mapping record not found")
    return updated


# ==========================================
# 6. APPROVAL ENDPOINTS
# ==========================================
@app.get("/api/approvals", response_model=List[schemas.ApprovalOut])
def list_approvals(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_approvals(db, skip=skip, limit=limit)

@app.post("/api/approvals", response_model=schemas.ApprovalOut, status_code=status.HTTP_201_CREATED)
def create_approval(approval: schemas.ApprovalCreate, db: Session = Depends(get_db)):
    mapping = db.query(models.MaterialMapping).filter(models.MaterialMapping.id == approval.mapping_id).first()
    if not mapping:
        raise HTTPException(status_code=404, detail="Mapping record not found for approval")
    return crud.create_approval(db, approval)


# ==========================================
# 7. DASHBOARD STATISTICS ENDPOINT
# ==========================================
@app.get("/api/dashboard/stats", response_model=schemas.DashboardStatsOut)
def get_dashboard_stats(db: Session = Depends(get_db)):
    return crud.get_dashboard_stats(db)


# ==========================================
# 8. AUDIT HISTORY ENDPOINT
# ==========================================
@app.get("/api/audit-logs", response_model=List[schemas.AuditLogOut])
def list_audit_logs(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_audit_logs(db, skip=skip, limit=limit)
