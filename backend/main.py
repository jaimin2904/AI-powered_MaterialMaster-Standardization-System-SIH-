import csv
import io
import json
from typing import List, Optional
from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Query, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text as sa_text

from database import engine, get_db, Base, SessionLocal
import models, schemas, crud
from seed import seed_database


def _ensure_embedding_columns():
    """Lightweight migration: add the embedding column to existing tables."""
    with engine.begin() as conn:
        for table in ("materials", "standard_materials"):
            rows = conn.execute(sa_text(f"PRAGMA table_info({table})")).fetchall()
            cols = {r[1] for r in rows}
            if "embedding" not in cols:
                conn.execute(sa_text(f"ALTER TABLE {table} ADD COLUMN embedding TEXT"))


# Initialize database schema, migrate, and seed data
Base.metadata.create_all(bind=engine)
_ensure_embedding_columns()
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

@app.get("/api/materials/duplicates", response_model=schemas.DuplicateDetectionResponse)
def get_duplicate_clusters(
    threshold: float = Query(80.0, description="Minimum similarity threshold (0-100) for a duplicate"),
    limit: int = Query(500, description="Maximum number of materials to scan"),
    db: Session = Depends(get_db)
):
    _ensure_index(db)
    clusters = _duplicate_clusters(db, threshold=threshold, limit=limit)
    return schemas.DuplicateDetectionResponse(
        clusters_found=len(clusters),
        total_duplicates=sum(c["material_count"] for c in clusters),
        clusters=[schemas.DuplicateCluster(**c) for c in clusters],
    )

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


from processor import processor
from matcher import matcher as semantic_matcher


# ==========================================
# AI/ML SEMANTIC MATCHER INDEX MANAGEMENT
# ==========================================
def rebuild_matcher_index(db: Session) -> int:
    """(Re)build the embedding index from the current standard_materials table."""
    stds = db.query(models.StandardMaterial).all()

    cache = {}
    for std in stds:
        if std.embedding:
            try:
                cache[std.id] = json.loads(std.embedding)
            except (ValueError, TypeError):
                cache[std.id] = None

    index_data = [
        {
            "id": std.id,
            "national_code": std.national_code,
            "standard_description": std.standard_description,
            "specification": std.specification,
            "unit": std.unit,
            "category": std.category,
            "embedding": cache.get(std.id),
        }
        for std in stds
    ]

    fresh_cache = semantic_matcher.build_index(index_data, embedding_cache=cache)

    # Persist embeddings that are new or correspond to a changed description,
    # so they can be reused instead of being regenerated.
    for std in stds:
        entry = fresh_cache.get(std.id)
        if entry and cache.get(std.id) != entry:
            std.embedding = json.dumps(entry)
    db.commit()

    return len(index_data)


def _sync_material_embeddings(db: Session, materials, cache: dict):
    """Persist freshly computed material embeddings keyed by material id."""
    if not cache:
        return
    changed = False
    for mat in materials:
        entry = cache.get(mat.id)
        if not entry:
            continue
        current = None
        if mat.embedding:
            try:
                current = json.loads(mat.embedding)
            except (ValueError, TypeError):
                current = None
        if current != entry:
            mat.embedding = json.dumps(entry)
            changed = True
    if changed:
        db.commit()


# Pre-warm the matcher index at startup using the seeded standard materials
_startup_db = SessionLocal()
try:
    rebuild_matcher_index(_startup_db)
finally:
    _startup_db.close()


def _material_match_dict(mat) -> dict:
    embedding = None
    if mat.embedding:
        try:
            embedding = json.loads(mat.embedding)
        except (ValueError, TypeError):
            embedding = None
    mapping_status = "Unmapped"
    if mat.mappings:
        mapping_status = next(
            (m.status for m in mat.mappings if m.status),
            "Unmapped",
        )
    return {
        "id": mat.id,
        "material_code": mat.material_code,
        "description": mat.description,
        "cleaned_description": mat.cleaned_description,
        "raw_description": mat.raw_description,
        "status": mapping_status,
        "category": mat.category,
        "unit": mat.unit,
        "extracted_specs": mat.extracted_specs,
        "cpse_id": mat.cpse_id,
        "cpse_name": mat.cpse.name if mat.cpse else mat.cpse_id,
        "unit_cost": mat.unit_cost,
        "stock_qty": mat.stock_qty,
        "plant_location": mat.plant_location,
        "embedding": embedding,
    }


def _ensure_index(db: Session):
    if not semantic_matcher._is_fitted:
        rebuild_matcher_index(db)


def _duplicate_clusters(db: Session, threshold: float = 80.0, limit: int = 500):
    mats = db.query(models.Material).limit(limit).all()
    material_dicts = [_material_match_dict(m) for m in mats]

    cache = {
        m.id: m_dict["embedding"]
        for m, m_dict in zip(mats, material_dicts)
        if m_dict["embedding"]
    }

    clusters = semantic_matcher.find_duplicates(
        material_dicts,
        threshold=threshold,
        embedding_cache=cache,
    )

    # Persist/freshen material embeddings for later reuse
    _sync_material_embeddings(db, mats, semantic_matcher._last_duplicate_cache)
    return clusters


# ==========================================
# MATERIAL DATA PROCESSING MODULE ENDPOINTS
# ==========================================
@app.post("/api/materials/process", response_model=schemas.ProcessMaterialResponse)
def process_material_description(req: schemas.ProcessMaterialRequest):
    """
    Normalizes text, expands abbreviations, normalizes units, and extracts specifications.
    Preserves raw description.
    """
    res = processor.process_material(req.raw_description, unit=req.unit or "NOS")
    return res

@app.post("/api/materials/{material_id}/process", response_model=schemas.MaterialOut)
def process_existing_material(material_id: int, db: Session = Depends(get_db)):
    """
    Process an existing material record in the database and update its cleaned/normalized fields.
    """
    mat = crud.get_material(db, material_id)
    if not mat:
        raise HTTPException(status_code=404, detail="Material item not found")

    res = processor.process_material(mat.raw_description or mat.description, unit=mat.unit)
    mat.cleaned_description = res["cleaned_description"]
    mat.normalized_unit = res["normalized_unit"]
    mat.extracted_specs = json.dumps(res["extracted_specs"])

    db.commit()
    db.refresh(mat)

    crud.create_audit_log(
        db,
        action="PROCESS_MATERIAL",
        old_val=mat.raw_description,
        new_val=json.dumps(res),
        user="Material Data Processing Service"
    )

    m_dict = schemas.MaterialOut.from_orm(mat)
    m_dict.cpse_name = mat.cpse.name if mat.cpse else mat.cpse_id
    return m_dict

# ==========================================
# AI/ML SEMANTIC MATCHING ENGINE ENDPOINTS
# ==========================================
@app.post("/api/materials/match", response_model=schemas.MatchSingleResponse)
def match_material_description(req: schemas.MatchSingleRequest, db: Session = Depends(get_db)):
    """Normalize a raw description and find the best standard-material matches."""
    _ensure_index(db)
    res = processor.process_material(req.raw_description, unit=req.unit or "NOS")
    matches = semantic_matcher.find_matches(
        description=res["cleaned_description"],
        raw_description=req.raw_description,
        category=req.category or "",
        unit=req.unit or "NOS",
        specs=res["extracted_specs"],
        top_n=req.top_n,
        min_score=req.min_score,
    )
    return schemas.MatchSingleResponse(
        raw_description=req.raw_description,
        cleaned_description=res["cleaned_description"],
        matches=[schemas.MatchResult(**m) for m in matches],
    )

@app.post("/api/materials/{material_id}/match", response_model=schemas.MatchMaterialResponse)
def match_existing_material(material_id: int, db: Session = Depends(get_db)):
    """Match a stored material against standard materials and update its mapping."""
    mat = crud.get_material(db, material_id)
    if not mat:
        raise HTTPException(status_code=404, detail="Material item not found")

    _ensure_index(db)
    res = processor.process_material(mat.raw_description or mat.description, unit=mat.unit)
    matches = semantic_matcher.find_matches(
        description=res["cleaned_description"],
        raw_description=mat.raw_description,
        category=mat.category,
        unit=mat.unit,
        specs=res["extracted_specs"],
    )
    best_match = matches[0] if matches else None

    mapping_updated = False
    if best_match:
        crud.create_or_update_mapping(
            db,
            schemas.MaterialMappingCreate(
                material_id=material_id,
                standard_material_id=best_match["standard_material_id"],
                similarity_score=best_match["similarity_score"],
                status="Under Review",
            ),
            user="AI Semantic Matcher",
        )
        mapping_updated = True

    # Cache the freshly-embedded material description for later reuse
    if semantic_matcher._last_query_cache:
        mat.embedding = json.dumps(semantic_matcher._last_query_cache)
        db.commit()

    mapping_status = "Unmapped"
    mapping_row = db.query(models.MaterialMapping).filter(
        models.MaterialMapping.material_id == material_id
    ).first()
    if mapping_row:
        mapping_status = mapping_row.status

    return schemas.MatchMaterialResponse(
        material_id=mat.id,
        material_code=mat.material_code,
        description=mat.description,
        cpse_id=mat.cpse_id,
        cpse_name=mat.cpse.name if mat.cpse else mat.cpse_id,
        match_status=mapping_status,
        mapping_id=mapping_row.id if mapping_row else None,
        best_match=schemas.MatchResult(**best_match) if best_match else None,
        all_matches=[schemas.MatchResult(**m) for m in matches],
        mapping_updated=mapping_updated,
    )

@app.post("/api/materials/match-batch", response_model=schemas.BatchMatchResponse)
def match_batch_unmapped_materials(db: Session = Depends(get_db)):
    """Process every unmapped material and update its mapping with the best match."""
    _ensure_index(db)
    unmapped_ids = [
        m.material_id for m in db.query(models.MaterialMapping)
        .filter(models.MaterialMapping.status == "Unmapped").all()
    ]
    if not unmapped_ids:
        return schemas.BatchMatchResponse(
            processed_count=0, matched_count=0, unmatched_count=0, avg_score=0.0, results=[]
        )

    material_dicts = [_material_match_dict(m) for m in db.query(models.Material)
                      .filter(models.Material.id.in_(unmapped_ids)).all()]

    batch = semantic_matcher.run_batch_matching(material_dicts, top_n=3, min_score=30.0)

    # Persist fresh embeddings for the batch of unmapped materials
    if unmapped_ids and semantic_matcher._last_batch_cache:
        batch_mats = db.query(models.Material).filter(models.Material.id.in_(unmapped_ids)).all()
        _sync_material_embeddings(db, batch_mats, semantic_matcher._last_batch_cache)

    results = []
    matched_ids = []
    for r in batch["results"]:
        best = r["best_match"]
        mapping_updated = False
        if best:
            crud.create_or_update_mapping(
                db,
                schemas.MaterialMappingCreate(
                    material_id=r["material_id"],
                    standard_material_id=best["standard_material_id"],
                    similarity_score=best["similarity_score"],
                    status="Under Review",
                ),
                user="AI Semantic Matcher",
            )
            matched_ids.append(r["material_id"])
            mapping_updated = True
        mat_row = db.query(models.Material).filter(models.Material.id == r["material_id"]).first()
        results.append(schemas.MatchMaterialResponse(
            material_id=r["material_id"],
            material_code=r["material_code"],
            description=r["description"],
            cpse_id=mat_row.cpse_id if mat_row else None,
            cpse_name=mat_row.cpse.name if mat_row and mat_row.cpse else (mat_row.cpse_id if mat_row else None),
            match_status="Under Review" if best else "Unmapped",
            best_match=schemas.MatchResult(**best) if best else None,
            all_matches=[schemas.MatchResult(**m) for m in r["all_matches"]],
            mapping_updated=mapping_updated,
        ))

    crud.create_audit_log(
        db,
        action="BATCH_MATCH",
        old_val=None,
        new_val=json.dumps({
            "processed_count": batch["summary"]["processed_count"],
            "matched_count": len(matched_ids),
            "matched_material_ids": matched_ids,
            "avg_score": batch["summary"]["avg_score"],
        }),
        user="AI Semantic Matcher",
    )

    return schemas.BatchMatchResponse(
        processed_count=batch["summary"]["processed_count"],
        matched_count=len(matched_ids),
        unmatched_count=batch["summary"]["unmatched_count"],
        avg_score=batch["summary"]["avg_score"],
        results=results,
    )

@app.post("/api/materials/duplicates/detect")
def detect_duplicate_clusters(
    threshold: float = Query(80.0, description="Minimum similarity threshold (0-100) for a duplicate"),
    limit: int = Query(500, description="Maximum number of materials to scan"),
    db: Session = Depends(get_db)
):
    """Run duplicate detection across CPSE material catalogs."""
    _ensure_index(db)
    clusters = _duplicate_clusters(db, threshold=threshold, limit=limit)
    total = sum(c["material_count"] for c in clusters)

    crud.create_audit_log(
        db,
        action="DUPLICATE_DETECTION",
        old_val=None,
        new_val=json.dumps({"clusters_found": len(clusters), "total_duplicates": total}),
        user="AI Semantic Matcher",
    )

    return {"clusters_found": len(clusters), "total_duplicates": total}

@app.post("/api/matcher/rebuild")
def rebuild_matcher(db: Session = Depends(get_db)):
    """Rebuild the TF-IDF index from the current standard_materials table."""
    count = rebuild_matcher_index(db)
    return {
        "message": "Matcher index rebuilt successfully",
        "indexed_standard_materials": count,
    }

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
    created = crud.create_standard_material(db, std_mat)
    rebuild_matcher_index(db)
    return created


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
# 7b. ANALYTICS SUMMARY ENDPOINT
# ==========================================
@app.get("/api/analytics/summary", response_model=schemas.AnalyticsSummary)
def get_analytics_summary(db: Session = Depends(get_db)):
    return crud.get_analytics_summary(db)


# ==========================================
# 8. AUDIT HISTORY ENDPOINT
# ==========================================
@app.get("/api/audit-logs", response_model=List[schemas.AuditLogOut])
def list_audit_logs(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_audit_logs(db, skip=skip, limit=limit)
