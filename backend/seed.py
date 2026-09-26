import json
from datetime import datetime
from database import SessionLocal, engine, Base
import models

def seed_database():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # Check if database is already seeded
    if db.query(models.CPSE).first():
        print("Database already seeded.")
        db.close()
        return

    print("Seeding database with CPSEs, Materials, Mappings, and Audit Logs...")

    # 1. CPSE Dataset (4 CPSEs)
    cpses = [
        models.CPSE(id="ntpc", name="NTPC Limited", sector="Power & Thermal Energy"),
        models.CPSE(id="cil", name="Coal India Limited", sector="Mining & Minerals"),
        models.CPSE(id="ongc", name="Oil and Natural Gas Corp (ONGC)", sector="Oil & Gas"),
        models.CPSE(id="bhel", name="Bharat Heavy Electricals Ltd (BHEL)", sector="Heavy Electrical Engineering"),
        models.CPSE(id="sail", name="Steel Authority of India Ltd (SAIL)", sector="Steel & Metals"),
    ]
    db.add_all(cpses)
    db.commit()

    # 2. Standard Materials (National NUMC Catalog)
    std_materials = [
        models.StandardMaterial(
            id=1,
            national_code="NUMC-401015-0089",
            standard_description="Gate Valve, Flanged Ends, 2 inch (50mm NB), ASME Class 150, Cast Carbon Steel Body (ASTM A216 Gr WCB), SS316 Trim",
            specification=json.dumps({
                "Nominal Size": "2 inch (50mm)",
                "Pressure Rating": "Class 150 (PN20)",
                "Body Material": "ASTM A216 WCB",
                "Trim Material": "SS316",
                "End Connection": "Flanged RF"
            }),
            unit="NOS",
            category="Valves"
        ),
        models.StandardMaterial(
            id=2,
            national_code="NUMC-311715-0142",
            standard_description="3-Phase Induction Motor, 75 kW (100 HP), 4 Pole (1500 RPM), 415V, 50Hz, TEFC, Frame 280M, Foot Mounted B3, Efficiency IE3 Premium",
            specification=json.dumps({
                "Power Rating": "75 kW (100 HP)",
                "Voltage / Freq": "415V, 50Hz",
                "Speed / Poles": "1480 RPM (4 Pole)",
                "Frame Size": "280M",
                "Efficiency Level": "IE3 Premium"
            }),
            unit="NOS",
            category="Motors"
        ),
        models.StandardMaterial(
            id=3,
            national_code="NUMC-311715-0899",
            standard_description="Deep Groove Ball Bearing, Single Row, 6205-2RS1, Rubber Seals Both Sides, Internal Clearance C3, Bore 25mm, OD 52mm, Width 15mm",
            specification=json.dumps({
                "Bore Diameter": "25 mm",
                "Outer Diameter": "52 mm",
                "Width": "15 mm",
                "Sealing": "2RS1 Rubber Seal",
                "Clearance": "C3 Clearance"
            }),
            unit="NOS",
            category="Bearings"
        ),
        models.StandardMaterial(
            id=4,
            national_code="NUMC-401515-0320",
            standard_description="Centrifugal Process Pump Impeller, Closed Type, Investment Cast SS316 (ASTM A743 Gr CF8M), Designed for API 610 Pumps, Outer Diameter 280mm",
            specification=json.dumps({
                "Impeller Type": "Closed Impeller",
                "Material": "Cast SS316 (CF8M)",
                "Outer Diameter": "280 mm",
                "Standard": "API 610 11th Ed"
            }),
            unit="NOS",
            category="Pumps & Impellers"
        )
    ]
    db.add_all(std_materials)
    db.commit()

    # 3. CPSE Local Materials
    materials = [
        models.Material(
            id=1,
            cpse_id="ntpc",
            material_code="NTPC-MECH-BLR-0941",
            description="Gate Valve, Flanged Ends, 2 inch (50mm NB), ASME Class 150, Cast Carbon Steel Body, SS316 Trim",
            specification=json.dumps({
                "Nominal Size": "2 inch (50mm)",
                "Pressure Rating": "Class 150",
                "Body Material": "ASTM A216 WCB",
                "Trim Material": "SS316"
            }),
            unit="NOS",
            category="Valves",
            raw_description="VALVE GATE 2IN 150# FLANGED WCB BODY CS SEAT SS316",
            unit_cost=14850.0,
            stock_qty=142,
            plant_location="Vindhyachal Super Thermal Power Station",
            manufacturer="L&T Valves / Audco"
        ),
        models.Material(
            id=2,
            cpse_id="cil",
            material_code="CIL-M-VLV-5012",
            description="Gate Valve 50mm Class 150 Flanged Cast Carbon Steel Body",
            specification=json.dumps({
                "Nominal Size": "50mm",
                "Pressure Rating": "Class 150",
                "Body Material": "Cast Carbon Steel WCB",
                "Trim Material": "SS316"
            }),
            unit="NOS",
            category="Valves",
            raw_description="GATE VALVE 50MM CL-150 FLG WCB SS FLANGE TYPE",
            unit_cost=18200.0,
            stock_qty=88,
            plant_location="Northern Coalfields Ltd (NCL Singrauli)",
            manufacturer="Kirloskar Brothers Ltd"
        ),
        models.Material(
            id=3,
            cpse_id="bhel",
            material_code="BHEL-ELE-MTR-8812",
            description="3-Phase Induction Motor 75kW 4 Pole 415V TEFC Foot Mounted IE3",
            specification=json.dumps({
                "Power Rating": "75 kW",
                "Voltage": "415V",
                "Speed": "1480 RPM",
                "Frame": "280M"
            }),
            unit="NOS",
            category="Motors",
            raw_description="IND MOTOR 75KW 4P 415V 50HZ TEFC FOOT B3 IE3",
            unit_cost=245000.0,
            stock_qty=24,
            plant_location="Haridwar Heavy Electrical Equipment Plant",
            manufacturer="ABB India / Siemens"
        ),
        models.Material(
            id=4,
            cpse_id="ongc",
            material_code="ONGC-OFF-MTR-0044",
            description="Induction Motor 75 kW 415V 1480RPM IE-3 Foot Mount",
            specification=json.dumps({
                "Power Rating": "75 kW",
                "Voltage": "415V",
                "Speed": "1480 RPM",
                "Enclosure": "IP56"
            }),
            unit="NOS",
            category="Motors",
            raw_description="MOTOR INDUCTION 75 KW 415V 1480RPM IE-3 FOOT MOUNT",
            unit_cost=289000.0,
            stock_qty=18,
            plant_location="Mumbai High Offshore Processing Complex",
            manufacturer="Bharat Bijlee Ltd"
        ),
        models.Material(
            id=5,
            cpse_id="sail",
            material_code="SAIL-DSP-BRG-6205",
            description="Deep Groove Ball Bearing 6205-2RS1 C3 Rubber Sealed",
            specification=json.dumps({
                "Bore Diameter": "25 mm",
                "Outer Diameter": "52 mm",
                "Width": "15 mm",
                "Sealing": "2RS1"
            }),
            unit="NOS",
            category="Bearings",
            raw_description="DEEP GROOVE BALL BEARING 6205-2RS1 C3 SKF",
            unit_cost=480.0,
            stock_qty=1450,
            plant_location="Durgapur Steel Plant",
            manufacturer="SKF Bearings"
        )
    ]
    db.add_all(materials)
    db.commit()

    # 4. Material Mappings
    mappings = [
        models.MaterialMapping(id=1, material_id=1, standard_material_id=1, similarity_score=98.4, status="Confirmed"),
        models.MaterialMapping(id=2, material_id=2, standard_material_id=1, similarity_score=95.2, status="Duplicate Cluster"),
        models.MaterialMapping(id=3, material_id=3, standard_material_id=2, similarity_score=99.1, status="Confirmed"),
        models.MaterialMapping(id=4, material_id=4, standard_material_id=2, similarity_score=96.8, status="Duplicate Cluster"),
        models.MaterialMapping(id=5, material_id=5, standard_material_id=3, similarity_score=99.8, status="Confirmed"),
    ]
    db.add_all(mappings)
    db.commit()

    # 5. Approvals
    approvals = [
        models.Approval(
            id=1,
            mapping_id=1,
            decision="Approved",
            comment="Verified ASME Class 150 Gate Valve specification alignment.",
            reviewed_by="Rajesh Sharma (Nodal Officer, NTPC)",
            timestamp=datetime(2026, 9, 18, 11, 30, 0)
        ),
        models.Approval(
            id=2,
            mapping_id=3,
            decision="Approved",
            comment="Harmonized IE3 75kW motor specification across BHEL catalogue.",
            reviewed_by="Dr. A. K. Sharma (Master Data Admin)",
            timestamp=datetime(2026, 9, 19, 14, 20, 0)
        )
    ]
    db.add_all(approvals)
    db.commit()

    # 6. Audit Logs
    audit_logs = [
        models.AuditLog(
            id=1,
            action="DUPLICATE_MERGE",
            old_value=json.dumps({"local_code": "CIL-M-VLV-5012", "status": "Unmapped"}),
            new_value=json.dumps({"numc_code": "NUMC-401015-0089", "status": "Duplicate Cluster"}),
            user="AI Auto-Harmonizer Agent (v4.2)",
            timestamp=datetime(2026, 9, 20, 19, 42, 10)
        ),
        models.AuditLog(
            id=2,
            action="MAPPING_APPROVE",
            old_value=json.dumps({"local_code": "NTPC-MECH-BLR-0941", "status": "Under Review"}),
            new_value=json.dumps({"numc_code": "NUMC-401015-0089", "status": "Confirmed"}),
            user="Rajesh Sharma (Nodal Officer, NTPC)",
            timestamp=datetime(2026, 9, 20, 18, 11, 5)
        ),
        models.AuditLog(
            id=3,
            action="PRICE_VARIANCE_ALERT",
            old_value=json.dumps({"bhel_price": 245000, "ongc_price": 289000}),
            new_value=json.dumps({"divergence_percent": 17.9, "flagged": True}),
            user="National Savings Monitoring Engine",
            timestamp=datetime(2026, 9, 20, 16, 25, 0)
        )
    ]
    db.add_all(audit_logs)
    db.commit()

    print("Database seeding completed successfully.")
    db.close()

if __name__ == "__main__":
    seed_database()
