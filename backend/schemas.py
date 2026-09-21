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
    unit_cost: Optional[float] = 0.0
    stock_qty: Optional[int] = 0
    plant_location: Optional[str] = None
    manufacturer: Optional[str] = None

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
class DashboardStatsOut(BaseModel):
    total_materials: int
    harmonized_materials: int
    duplicate_clusters: int
    total_cpses: int
    pending_approvals: int
    estimated_savings_cr: float
    ai_accuracy_percent: float
