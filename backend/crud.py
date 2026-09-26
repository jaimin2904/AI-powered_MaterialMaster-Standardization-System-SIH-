import json
from sqlalchemy.orm import Session
from sqlalchemy import or_, func
from datetime import datetime
from typing import Optional, List
import models, schemas

# --- CPSE CRUD ---
def get_cpse(db: Session, cpse_id: str):
    return db.query(models.CPSE).filter(models.CPSE.id == cpse_id).first()

def get_cpses(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.CPSE).offset(skip).limit(limit).all()

def create_cpse(db: Session, cpse: schemas.CPSECreate, user: str = "Admin"):
    db_cpse = models.CPSE(**cpse.model_dump())
    db.add(db_cpse)
    db.commit()
    db.refresh(db_cpse)

    # Log audit
    create_audit_log(db, action="CREATE_CPSE", old_val=None, new_val=json.dumps(cpse.model_dump()), user=user)
    return db_cpse

def update_cpse(db: Session, cpse_id: str, cpse_update: schemas.CPSEUpdate, user: str = "Admin"):
    db_cpse = get_cpse(db, cpse_id)
    if not db_cpse:
        return None
    old_data = {"name": db_cpse.name, "sector": db_cpse.sector}
    for key, val in cpse_update.model_dump(exclude_unset=True).items():
        setattr(db_cpse, key, val)
    db.commit()
    db.refresh(db_cpse)

    create_audit_log(db, action="UPDATE_CPSE", old_val=json.dumps(old_data), new_val=json.dumps(cpse_update.model_dump(exclude_unset=True)), user=user)
    return db_cpse

def delete_cpse(db: Session, cpse_id: str, user: str = "Admin"):
    db_cpse = get_cpse(db, cpse_id)
    if not db_cpse:
        return False
    old_data = {"id": db_cpse.id, "name": db_cpse.name}
    db.delete(db_cpse)
    db.commit()
    create_audit_log(db, action="DELETE_CPSE", old_val=json.dumps(old_data), new_val=None, user=user)
    return True


# --- Material CRUD & Search ---
def get_material(db: Session, material_id: int):
    return db.query(models.Material).filter(models.Material.id == material_id).first()

def get_materials(db: Session, skip: int = 0, limit: int = 100, cpse_id: Optional[str] = None):
    query = db.query(models.Material)
    if cpse_id and cpse_id != "all":
        query = query.filter(models.Material.cpse_id == cpse_id)
    return query.offset(skip).limit(limit).all()

def search_materials(
    db: Session,
    q: Optional[str] = None,
    cpse_id: Optional[str] = None,
    category: Optional[str] = None,
    status: Optional[str] = None,
    skip: int = 0,
    limit: int = 100
):
    query = db.query(models.Material).join(models.CPSE)

    if cpse_id and cpse_id != "all":
        query = query.filter(models.Material.cpse_id == cpse_id)

    if category and category != "ALL":
        query = query.filter(models.Material.category == category)

    if status and status != "ALL":
        query = query.join(models.MaterialMapping).filter(models.MaterialMapping.status == status)

    if q and q.strip():
        search_term = f"%{q.strip()}%"
        query = query.filter(
            or_(
                models.Material.material_code.ilike(search_term),
                models.Material.description.ilike(search_term),
                models.Material.raw_description.ilike(search_term),
                models.Material.category.ilike(search_term),
                models.Material.manufacturer.ilike(search_term)
            )
        )

    return query.offset(skip).limit(limit).all()

def create_material(db: Session, material: schemas.MaterialCreate, user: str = "Admin"):
    # Run data normalization & spec extraction
    from processor import processor
    processed = processor.process_material(material.raw_description or material.description, unit=material.unit)
    
    mat_data = material.model_dump()
    mat_data["cleaned_description"] = processed["cleaned_description"]
    mat_data["normalized_unit"] = processed["normalized_unit"]
    mat_data["extracted_specs"] = json.dumps(processed["extracted_specs"])

    db_material = models.Material(**mat_data)
    db.add(db_material)
    db.commit()
    db.refresh(db_material)

    # Automatically create initial material mapping entry
    mapping = models.MaterialMapping(
        material_id=db_material.id,
        standard_material_id=None,
        similarity_score=0.0,
        status="Unmapped"
    )
    db.add(mapping)
    db.commit()

    create_audit_log(db, action="CREATE_MATERIAL", old_val=None, new_val=json.dumps(material.model_dump()), user=user)
    return db_material

def update_material(db: Session, material_id: int, material_update: schemas.MaterialUpdate, user: str = "Admin"):
    db_material = get_material(db, material_id)
    if not db_material:
        return None
    old_data = {"code": db_material.material_code, "desc": db_material.description}
    for key, val in material_update.model_dump(exclude_unset=True).items():
        setattr(db_material, key, val)
    db.commit()
    db.refresh(db_material)

    create_audit_log(db, action="UPDATE_MATERIAL", old_val=json.dumps(old_data), new_val=json.dumps(material_update.model_dump(exclude_unset=True)), user=user)
    return db_material

def delete_material(db: Session, material_id: int, user: str = "Admin"):
    db_material = get_material(db, material_id)
    if not db_material:
        return False
    old_data = {"id": db_material.id, "code": db_material.material_code}
    
    # Delete associated mappings
    db.query(models.MaterialMapping).filter(models.MaterialMapping.material_id == material_id).delete()
    db.delete(db_material)
    db.commit()

    create_audit_log(db, action="DELETE_MATERIAL", old_val=json.dumps(old_data), new_val=None, user=user)
    return True


# --- Standard Material Management ---
def get_standard_material(db: Session, std_id: int):
    return db.query(models.StandardMaterial).filter(models.StandardMaterial.id == std_id).first()

def get_standard_materials(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.StandardMaterial).offset(skip).limit(limit).all()

def create_standard_material(db: Session, std_mat: schemas.StandardMaterialCreate, user: str = "Admin"):
    db_std = models.StandardMaterial(**std_mat.model_dump())
    db.add(db_std)
    db.commit()
    db.refresh(db_std)

    create_audit_log(db, action="CREATE_STANDARD_MATERIAL", old_val=None, new_val=json.dumps(std_mat.model_dump()), user=user)
    return db_std


# --- Material Mapping ---
def get_mappings(db: Session, skip: int = 0, limit: int = 100, status: Optional[str] = None):
    query = db.query(models.MaterialMapping)
    if status and status != "ALL":
        query = query.filter(models.MaterialMapping.status == status)
    return query.offset(skip).limit(limit).all()

def create_or_update_mapping(db: Session, mapping_data: schemas.MaterialMappingCreate, user: str = "Admin"):
    existing = db.query(models.MaterialMapping).filter(models.MaterialMapping.material_id == mapping_data.material_id).first()
    if existing:
        old_val = json.dumps({"status": existing.status, "std_id": existing.standard_material_id})
        existing.standard_material_id = mapping_data.standard_material_id
        existing.similarity_score = mapping_data.similarity_score
        existing.status = mapping_data.status
        db.commit()
        db.refresh(existing)
        create_audit_log(db, action="UPDATE_MAPPING", old_val=old_val, new_val=json.dumps(mapping_data.model_dump()), user=user)
        return existing
    else:
        db_mapping = models.MaterialMapping(**mapping_data.model_dump())
        db.add(db_mapping)
        db.commit()
        db.refresh(db_mapping)
        create_audit_log(db, action="CREATE_MAPPING", old_val=None, new_val=json.dumps(mapping_data.model_dump()), user=user)
        return db_mapping

def update_mapping_status(db: Session, mapping_id: int, mapping_update: schemas.MaterialMappingUpdate, user: str = "Admin"):
    mapping = db.query(models.MaterialMapping).filter(models.MaterialMapping.id == mapping_id).first()
    if not mapping:
        return None
    old_val = json.dumps({"status": mapping.status, "std_id": mapping.standard_material_id})
    for key, val in mapping_update.model_dump(exclude_unset=True).items():
        setattr(mapping, key, val)
    db.commit()
    db.refresh(mapping)
    create_audit_log(db, action="MAPPING_STATUS_CHANGE", old_val=old_val, new_val=json.dumps(mapping_update.model_dump(exclude_unset=True)), user=user)
    return mapping


# --- Approvals ---
def create_approval(db: Session, approval: schemas.ApprovalCreate):
    db_approval = models.Approval(**approval.model_dump())
    db.add(db_approval)
    
    # Update mapping status based on approval decision
    mapping = db.query(models.MaterialMapping).filter(models.MaterialMapping.id == approval.mapping_id).first()
    if mapping:
        if approval.decision.lower() == "approved":
            mapping.status = "Confirmed"
        elif approval.decision.lower() == "rejected":
            mapping.status = "Under Review"

    db.commit()
    db.refresh(db_approval)

    create_audit_log(
        db,
        action="APPROVAL_DECISION",
        old_val=None,
        new_val=json.dumps({"mapping_id": approval.mapping_id, "decision": approval.decision, "comment": approval.comment}),
        user=approval.reviewed_by
    )
    return db_approval

def get_approvals(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Approval).order_by(models.Approval.timestamp.desc()).offset(skip).limit(limit).all()


# --- Audit Logs ---
def create_audit_log(db: Session, action: str, old_val: Optional[str], new_val: Optional[str], user: str):
    log = models.AuditLog(
        action=action,
        old_value=old_val,
        new_value=new_val,
        user=user,
        timestamp=datetime.utcnow()
    )
    db.add(log)
    db.commit()
    return log

def get_audit_logs(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.AuditLog).order_by(models.AuditLog.timestamp.desc()).offset(skip).limit(limit).all()


# --- Dashboard Stats ---
def get_dashboard_stats(db: Session) -> schemas.DashboardStatsOut:
    total_materials = db.query(models.Material).count()
    standard_materials = db.query(models.StandardMaterial).count()
    total_cpses = db.query(models.CPSE).count()
    confirmed_matches = db.query(models.MaterialMapping).filter(
        models.MaterialMapping.status == "Confirmed"
    ).count()
    under_review = db.query(models.MaterialMapping).filter(
        models.MaterialMapping.status == "Under Review"
    ).count()
    rejected_matches = db.query(models.Approval).filter(
        models.Approval.decision == "Rejected"
    ).count()

    # potential_duplicates: real total from the most recent duplicate/near-duplicate
    # detection scan (POST /api/materials/duplicates/detect writes a DUPLICATE_DETECTION audit log).
    potential_duplicates = 0
    latest_detection = db.query(models.AuditLog).filter(
        models.AuditLog.action == "DUPLICATE_DETECTION"
    ).order_by(models.AuditLog.timestamp.desc()).first()
    if latest_detection and latest_detection.new_value:
        try:
            detection = json.loads(latest_detection.new_value)
            potential_duplicates = int(detection.get("total_duplicates", detection.get("clusters_found", 0)) or 0)
        except (ValueError, TypeError):
            potential_duplicates = 0

    # CPSE-wise material counts (real)
    cpses = []
    count_rows = dict(
        db.query(models.Material.cpse_id, func.count(models.Material.id))
        .group_by(models.Material.cpse_id).all()
    )
    confirmed_rows = dict(
        db.query(models.Material.cpse_id, func.count(models.MaterialMapping.id))
        .join(models.MaterialMapping, models.MaterialMapping.material_id == models.Material.id)
        .filter(models.MaterialMapping.status == "Confirmed")
        .group_by(models.Material.cpse_id).all()
    )
    for cpse in db.query(models.CPSE).order_by(models.CPSE.name).all():
        cpses.append(schemas.CPSEDashboardStat(
            cpse_id=cpse.id,
            name=cpse.name,
            material_count=int(count_rows.get(cpse.id, 0)),
            confirmed_matches=int(confirmed_rows.get(cpse.id, 0)),
        ))

    # Pending AI recommendations = real mapping rows awaiting review
    pending = db.query(models.MaterialMapping).filter(
        models.MaterialMapping.status.in_(["Unmapped", "Under Review"])
    ).order_by(models.MaterialMapping.similarity_score.desc()).all()
    pending_recommendations = []
    seen_materials = set()
    for mapping in pending:
        if mapping.material_id in seen_materials:
            continue
        seen_materials.add(mapping.material_id)
        mat = mapping.material
        if not mat:
            continue
        std = mapping.standard_material
        pending_recommendations.append(schemas.PendingRecommendation(
            mapping_id=mapping.id,
            material_code=mat.material_code,
            cpse_id=mat.cpse_id,
            cpse_name=mat.cpse.name if mat.cpse else mat.cpse_id,
            similarity_score=mapping.similarity_score or 0.0,
            status=mapping.status,
            raw_description=mat.raw_description or mat.description,
            national_code=std.national_code if std else None,
            standard_description=std.standard_description if std else None,
        ))

    return schemas.DashboardStatsOut(
        total_materials=total_materials,
        standard_materials=standard_materials,
        total_cpses=total_cpses,
        confirmed_matches=confirmed_matches,
        under_review=under_review,
        rejected_matches=rejected_matches,
        potential_duplicates=potential_duplicates,
        ai_accuracy_percent=None,
        estimated_savings_cr=None,
        cpses=cpses,
        pending_recommendations=pending_recommendations,
    )


def get_analytics_summary(db: Session) -> schemas.AnalyticsSummary:
    total_materials = db.query(models.Material).count()
    standard_materials = db.query(models.StandardMaterial).count()
    total_cpses = db.query(models.CPSE).count()
    confirmed_matches = db.query(models.MaterialMapping).filter(
        models.MaterialMapping.status == "Confirmed"
    ).count()
    under_review = db.query(models.MaterialMapping).filter(
        models.MaterialMapping.status == "Under Review"
    ).count()
    rejected_matches = db.query(models.Approval).filter(
        models.Approval.decision == "Rejected"
    ).count()

    # potential_duplicates: real total from the most recent duplicate/near-duplicate
    # detection scan (POST /api/materials/duplicates/detect writes a DUPLICATE_DETECTION audit log).
    potential_duplicates = 0
    latest_detection = db.query(models.AuditLog).filter(
        models.AuditLog.action == "DUPLICATE_DETECTION"
    ).order_by(models.AuditLog.timestamp.desc()).first()
    if latest_detection and latest_detection.new_value:
        try:
            detection = json.loads(latest_detection.new_value)
            potential_duplicates = int(detection.get("total_duplicates", detection.get("clusters_found", 0)) or 0)
        except (ValueError, TypeError):
            potential_duplicates = 0

    # Materials grouped by category (real GROUP BY)
    materials_by_category = [
        schemas.CategoryCount(category=category, count=int(count))
        for category, count in db.query(models.Material.category, func.count(models.Material.id))
        .group_by(models.Material.category)
        .order_by(func.count(models.Material.id).desc())
        .all()
    ]

    # Materials grouped by CPSE (real GROUP BY)
    cpse_names = {c.id: c.name for c in db.query(models.CPSE).all()}
    materials_by_cpse = [
        schemas.CPCensusStat(
            cpse_id=cpse_id,
            cpse_name=cpse_names.get(cpse_id, cpse_id),
            count=int(count),
        )
        for cpse_id, count in db.query(models.Material.cpse_id, func.count(models.Material.id))
        .group_by(models.Material.cpse_id)
        .order_by(func.count(models.Material.id).desc())
        .all()
        if cpse_id
    ]

    # Approval summary from real Approval records
    approved = db.query(models.Approval).filter(models.Approval.decision == "Approved").count()
    rejected = db.query(models.Approval).filter(models.Approval.decision == "Rejected").count()
    modified = db.query(models.Approval).filter(models.Approval.decision == "Modified").count()
    total_approvals = db.query(models.Approval).count()
    by_reviewer = [
        schemas.ReviewerCount(reviewed_by=reviewed_by, count=int(count))
        for reviewed_by, count in db.query(models.Approval.reviewed_by, func.count(models.Approval.id))
        .group_by(models.Approval.reviewed_by)
        .order_by(func.count(models.Approval.id).desc())
        .all()
    ]
    recent = [
        schemas.RecentApproval(
            id=a.id,
            decision=a.decision,
            comment=a.comment,
            reviewed_by=a.reviewed_by,
            timestamp=a.timestamp,
        )
        for a in db.query(models.Approval).order_by(models.Approval.timestamp.desc()).limit(5).all()
    ]

    # Similarity summary from real MaterialMapping.similarity_score (scored rows only)
    scored_rows = db.query(models.MaterialMapping).filter(
        models.MaterialMapping.similarity_score.isnot(None),
        models.MaterialMapping.similarity_score > 0,
    ).all()
    distribution = {"<25": 0, "25-49": 0, "50-74": 0, ">=75": 0}
    for row in scored_rows:
        score = row.similarity_score
        if score >= 75:
            distribution[">=75"] += 1
        elif score >= 50:
            distribution["50-74"] += 1
        elif score >= 25:
            distribution["25-49"] += 1
        else:
            distribution["<25"] += 1

    original = db.query(models.MaterialMapping.id).filter(
        models.MaterialMapping.similarity_score.isnot(None),
        models.MaterialMapping.similarity_score > 0,
    ).count()
    avg_score = min_score = max_score = None
    if original:
        numeric = [r.similarity_score for r in scored_rows]
        avg_score = round(sum(numeric) / len(numeric), 2)
        min_score = float(min(numeric))
        max_score = float(max(numeric))

    return schemas.AnalyticsSummary(
        total_materials=total_materials,
        standard_materials=standard_materials,
        total_cpses=total_cpses,
        confirmed_matches=confirmed_matches,
        under_review=under_review,
        rejected_matches=rejected_matches,
        potential_duplicates=potential_duplicates,
        materials_by_category=materials_by_category,
        materials_by_cpse=materials_by_cpse,
        approval_summary=schemas.ApprovalSummary(
            total=total_approvals,
            approved=approved,
            rejected=rejected,
            modified=modified,
            by_reviewer=by_reviewer,
            recent=recent,
        ),
        similarity_summary=schemas.SimilaritySummary(
            total=db.query(models.MaterialMapping).count(),
            scored=original,
            avg_score=avg_score,
            min_score=min_score,
            max_score=max_score,
            distribution=distribution,
        ),
    )
