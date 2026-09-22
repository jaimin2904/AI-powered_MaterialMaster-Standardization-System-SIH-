from pydantic import BaseModel, Field
from typing import Optional, List, Any, Dict
from datetime import datetime

# --- CPSE Schemas ---
class CPSEBase(BaseModel):
    id: str = Field(..., description="Unique CPSE identifier e.g. 'ntpc', 'cil'")
    name: str = Field(..., description="Full CPSE Enterprise Name")
    sector: str = Field(..., description="Industrial Sector e.g. Power & Energy")

class CPSECreate(CPSEBase):
    pass

class CPSEUpdate(BaseModel):
    name: Optional[str] = None
    sector: Optional[str] = None

class CPSEOut(CPSEBase):
    class Config:
        from_attributes = True

# --- Material Schemas ---
class MaterialBase(BaseModel):
    cpse_id: str
    material_code: str
    description: str
    specification: Optional[str] = None
    unit: str
    category: str
    raw_description: str
    cleaned_description: Optional[str] = None
    normalized_unit: Optional[str] = None
    extracted_specs: Optional[str] = None
    unit_cost: Optional[float] = 0.0
    stock_qty: Optional[int] = 0
    plant_location: Optional[str] = None
    manufacturer: Optional[str] = None

class ProcessMaterialRequest(BaseModel):
    raw_description: str
    unit: Optional[str] = "NOS"

class ProcessMaterialResponse(BaseModel):
    raw_description: str
    cleaned_description: str
    normalized_unit: str
    extracted_specs: Dict[str, Any]

class MaterialCreate(MaterialBase):
    pass

class MaterialUpdate(BaseModel):
    cpse_id: Optional[str] = None
    material_code: Optional[str] = None
    description: Optional[str] = None
    specification: Optional[str] = None
    unit: Optional[str] = None
    category: Optional[str] = None
    raw_description: Optional[str] = None
    unit_cost: Optional[float] = None
    stock_qty: Optional[int] = None
    plant_location: Optional[str] = None
    manufacturer: Optional[str] = None

class MaterialOut(MaterialBase):
    id: int
    cpse_name: Optional[str] = None

    class Config:
        from_attributes = True

# --- Standard Material Schemas ---
class StandardMaterialBase(BaseModel):
    national_code: str
    standard_description: str
    specification: Optional[str] = None
    unit: str
    category: str

class StandardMaterialCreate(StandardMaterialBase):
    pass

class StandardMaterialOut(StandardMaterialBase):
    id: int

    class Config:
        from_attributes = True

# --- Material Mapping Schemas ---
class MaterialMappingBase(BaseModel):
    material_id: int
    standard_material_id: Optional[int] = None
    similarity_score: float = 0.0
    status: str = "Unmapped"

class MaterialMappingCreate(MaterialMappingBase):
    pass

class MaterialMappingUpdate(BaseModel):
    standard_material_id: Optional[int] = None
    similarity_score: Optional[float] = None
    status: Optional[str] = None

class MaterialMappingOut(MaterialMappingBase):
    id: int
    material: Optional[MaterialOut] = None
    standard_material: Optional[StandardMaterialOut] = None

    class Config:
        from_attributes = True

# --- Approval Schemas ---
class ApprovalBase(BaseModel):
    mapping_id: int
    decision: str  # 'Approved', 'Rejected', 'Modified'
    comment: Optional[str] = None
    reviewed_by: str

class ApprovalCreate(ApprovalBase):
    pass

class ApprovalOut(ApprovalBase):
    id: int
    timestamp: datetime

    class Config:
        from_attributes = True

# --- Audit Log Schemas ---
class AuditLogBase(BaseModel):
    action: str
    old_value: Optional[str] = None
    new_value: Optional[str] = None
    user: str

class AuditLogCreate(AuditLogBase):
    pass

class AuditLogOut(AuditLogBase):
    id: int
    timestamp: datetime

    class Config:
        from_attributes = True

# --- Dashboard Stats Schema ---
class CPSEDashboardStat(BaseModel):
    cpse_id: str
    name: str
    material_count: int
    confirmed_matches: int = 0

class PendingRecommendation(BaseModel):
    mapping_id: int
    material_code: str
    cpse_id: str
    cpse_name: Optional[str] = ""
    similarity_score: float
    status: str
    raw_description: Optional[str] = ""
    national_code: Optional[str] = None
    standard_description: Optional[str] = None

class DashboardStatsOut(BaseModel):
    total_materials: int
    standard_materials: int
    total_cpses: int
    confirmed_matches: int
    under_review: int
    rejected_matches: int
    potential_duplicates: int
    ai_accuracy_percent: Optional[float] = None
    estimated_savings_cr: Optional[float] = None
    cpses: List[CPSEDashboardStat] = []
    pending_recommendations: List[PendingRecommendation] = []


# --- AI/ML Matching Engine Schemas ---
class MatchSingleRequest(BaseModel):
    raw_description: str = Field(..., description="Raw material description to match")
    unit: Optional[str] = Field("NOS", description="Unit of measure")
    category: Optional[str] = Field(None, description="Material category for score boosting")
    top_n: Optional[int] = Field(5, description="Number of top matches to return")
    min_score: Optional[float] = Field(0.0, description="Minimum similarity score threshold (0-100)")

class MatchResult(BaseModel):
    standard_material_id: int
    national_code: str
    standard_description: str
    similarity_score: float
    category: str
    unit: Optional[str] = None
    is_category_match: bool = False

class MatchSingleResponse(BaseModel):
    raw_description: str
    cleaned_description: str
    matches: List[MatchResult]

class MatchMaterialResponse(BaseModel):
    material_id: int
    material_code: str
    description: str
    cpse_id: Optional[str] = None
    cpse_name: Optional[str] = None
    match_status: Optional[str] = "Unmapped"
    mapping_id: Optional[int] = None
    best_match: Optional[MatchResult] = None
    all_matches: List[MatchResult]
    mapping_updated: bool = False

class BatchMatchResponse(BaseModel):
    processed_count: int
    matched_count: int
    unmatched_count: int
    avg_score: float
    results: List[MatchMaterialResponse]

class DuplicateClusterMaterial(BaseModel):
    id: Optional[int] = None
    material_code: str
    description: str
    raw_description: Optional[str] = ""
    cleaned_description: Optional[str] = None
    status: Optional[str] = "Unmapped"
    cpse_id: str
    cpse_name: Optional[str] = ""
    category: str
    unit_cost: Optional[float] = 0.0
    stock_qty: Optional[int] = 0
    plant_location: Optional[str] = ""

class DuplicateCluster(BaseModel):
    cluster_id: int
    materials: List[DuplicateClusterMaterial]
    avg_similarity: float
    category: str
    material_count: int

class DuplicateDetectionResponse(BaseModel):
    clusters_found: int
    total_duplicates: int
    clusters: List[DuplicateCluster]
