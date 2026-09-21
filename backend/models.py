from sqlalchemy import Column, Integer, String, Text, Float, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base

class CPSE(Base):
    __tablename__ = "cpse"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    sector = Column(String, nullable=False)

    materials = relationship("Material", back_populates="cpse")

class Material(Base):
    __tablename__ = "materials"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    cpse_id = Column(String, ForeignKey("cpse.id"), nullable=False)
    material_code = Column(String, nullable=False, index=True)
    description = Column(Text, nullable=False)
    normalized_description = Column(Text, nullable=True)
    specification = Column(Text, nullable=True)  # JSON string or text spec dict
    unit = Column(String, nullable=False)
    category = Column(String, nullable=False, index=True)
    raw_description = Column(Text, nullable=False)
    unit_cost = Column(Float, default=0.0)
    stock_qty = Column(Integer, default=0)
    plant_location = Column(String, nullable=True)
    manufacturer = Column(String, nullable=True)

    cpse = relationship("CPSE", back_populates="materials")
    mappings = relationship("MaterialMapping", back_populates="material")

class StandardMaterial(Base):
    __tablename__ = "standard_materials"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    national_code = Column(String, nullable=False, unique=True, index=True)
    standard_description = Column(Text, nullable=False)
    specification = Column(Text, nullable=True)  # JSON string or text spec dict
    unit = Column(String, nullable=False)
    category = Column(String, nullable=False, index=True)

    mappings = relationship("MaterialMapping", back_populates="standard_material")

class MaterialMapping(Base):
    __tablename__ = "material_mappings"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    material_id = Column(Integer, ForeignKey("materials.id"), nullable=False)
    standard_material_id = Column(Integer, ForeignKey("standard_materials.id"), nullable=True)
    similarity_score = Column(Float, default=0.0)
    status = Column(String, default="Unmapped")  # 'Unmapped', 'Confirmed', 'Under Review', 'Duplicate Cluster'

    material = relationship("Material", back_populates="mappings")
    standard_material = relationship("StandardMaterial", back_populates="mappings")
    approvals = relationship("Approval", back_populates="mapping")

class Approval(Base):
    __tablename__ = "approvals"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    mapping_id = Column(Integer, ForeignKey("material_mappings.id"), nullable=False)
    decision = Column(String, nullable=False)  # 'Approved', 'Rejected', 'Modified'
    comment = Column(Text, nullable=True)
    reviewed_by = Column(String, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)

    mapping = relationship("MaterialMapping", back_populates="approvals")

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    action = Column(String, nullable=False)
    old_value = Column(Text, nullable=True)
    new_value = Column(Text, nullable=True)
    user = Column(String, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
