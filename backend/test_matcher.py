import unittest

import numpy as np

from backend.matcher import SemanticMatcher


def _std(id_num, desc, category="Valves", spec=None):
    return {
        "id": id_num,
        "national_code": f"NUMC-TEST-{id_num:04d}",
        "standard_description": desc,
        "specification": spec or "{}",
        "unit": "NOS",
        "category": category,
    }


SAMPLE_STANDARDS = [
    _std(1, "Gate Valve, Flanged Ends, 2 inch, ASME Class 150, Cast Carbon Steel Body (WCB), SS316 Trim", "Valves"),
    _std(2, "3-Phase Induction Motor, 75 kW, 4 Pole, 415V, 50Hz, TEFC, Foot Mounted B3, IE3", "Motors"),
    _std(3, "Deep Groove Ball Bearing, Single Row, 6205-2RS1, Rubber Seals, Bore 25mm", "Bearings"),
]


class TestSemanticMatcher(unittest.TestCase):
    def setUp(self):
        self.matcher = SemanticMatcher()
        self.matcher.build_index(SAMPLE_STANDARDS)

    def test_similar_material_matching(self):
        matches = self.matcher.find_matches(
            description="gate valve 2 inch flanged asme class 150 carbon steel body ss316 trim",
            category="Valves", top_n=3,
        )
        self.assertTrue(matches)
        self.assertEqual(matches[0]["standard_material_id"], 1)
        self.assertGreater(matches[0]["similarity_score"], 50.0)

    def test_unrelated_material_matching(self):
        matches = self.matcher.find_matches(
            description="welding electrode copper rod flux core packaging",
            category="General Spares", top_n=3,
        )
        self.assertTrue(matches)
        self.assertLess(matches[0]["similarity_score"], 40.0)

    def test_category_boosting(self):
        query = "stainless steel gate valve 150 class flanged"
        no_cat = self.matcher.find_matches(description=query, category="", top_n=1)
        with_cat = self.matcher.find_matches(description=query, category="Valves", top_n=1)
        self.assertTrue(no_cat)
        self.assertTrue(with_cat)
        base_score = no_cat[0]["similarity_score"]
        boosted_score = with_cat[0]["similarity_score"]
        self.assertAlmostEqual(boosted_score, min(base_score + 5.0, 100.0), places=6)
        self.assertGreater(boosted_score, base_score)
        self.assertTrue(with_cat[0]["is_category_match"])

    def test_score_never_exceeds_100(self):
        exact = SAMPLE_STANDARDS[1]["standard_description"]
        matches = self.matcher.find_matches(description=exact, category="Motors", top_n=5)
        for m in matches:
            self.assertLessEqual(m["similarity_score"], 100.0)
            self.assertGreaterEqual(m["similarity_score"], 0.0)
        self.assertEqual(matches[0]["similarity_score"], 100.0)

    def test_duplicate_detection(self):
        materials = [
            {"id": 1, "material_code": "N1", "description": "Gate Valve 2 inch Flanged Class 150 WCB Body SS316", "raw_description": "GATE VALVE 2IN FLG 150# WCB", "cleaned_description": "gate valve 2in flg 150# wcb", "category": "Valves", "cpse_id": "ntpc", "cpse_name": "NTPC", "unit_cost": 100, "stock_qty": 1, "plant_location": "", "extracted_specs": "{}"},
            {"id": 2, "material_code": "C1", "description": "Gate Valve 2 inch Flanged Class 150 WCB Body SS316 Trim", "raw_description": "GATE VALVE 2IN 150# FLANGED WCB BODY SS316", "cleaned_description": "gate valve 2in 150# flanged wcb body ss316", "category": "Valves", "cpse_id": "cil", "cpse_name": "CIL", "unit_cost": 100, "stock_qty": 1, "plant_location": "", "extracted_specs": "{}"},
            {"id": 3, "material_code": "M1", "description": "Induction Motor 75kW 4 Pole 415V TEFC Foot Mount IE3", "raw_description": "IND MOTOR 75KW 4P 415V TEFC IE3", "cleaned_description": "ind motor 75kw 4p 415v tefc ie3", "category": "Motors", "cpse_id": "bhel", "cpse_name": "BHEL", "unit_cost": 200, "stock_qty": 1, "plant_location": "", "extracted_specs": "{}"},
        ]
        clusters = self.matcher.find_duplicates(materials, threshold=50.0)
        self.assertTrue(clusters)
        valve_cluster = [c for c in clusters if c["category"] == "Valves"]
        self.assertTrue(valve_cluster)
        ids_in_cluster = sorted(m["id"] for m in valve_cluster[0]["materials"])
        self.assertEqual(ids_in_cluster, [1, 2])
        self.assertEqual(valve_cluster[0]["material_count"], 2)

    def test_self_match_exclusion(self):
        identical = [
            {"id": 1, "material_code": "S1", "description": "Deep Groove Ball Bearing 6205-2RS1", "raw_description": "DEEP GROOVE BALL BEARING 6205-2RS1", "cleaned_description": "deep groove ball bearing 6205-2rs1", "category": "Bearings", "cpse_id": "sail", "cpse_name": "SAIL", "unit_cost": 10, "stock_qty": 1, "plant_location": "", "extracted_specs": "{}"},
            {"id": 2, "material_code": "S1", "description": "Deep Groove Ball Bearing 6205-2RS1", "raw_description": "DEEP GROOVE BALL BEARING 6205-2RS1", "cleaned_description": "deep groove ball bearing 6205-2rs1", "category": "Bearings", "cpse_id": "sail", "cpse_name": "SAIL", "unit_cost": 10, "stock_qty": 1, "plant_location": "", "extracted_specs": "{}"},
        ]
        self.assertEqual(self.matcher.find_duplicates(identical, threshold=70.0), [])

        single = [identical[0]]
        self.assertEqual(self.matcher.find_duplicates(single, threshold=70.0), [])

    def test_empty_standard_catalog(self):
        empty_matcher = SemanticMatcher()
        self.assertFalse(empty_matcher._is_fitted)
        self.assertEqual(
            empty_matcher.find_matches(description="gate valve 2 inch"), []
        )
        empty_matcher.build_index([])
        self.assertFalse(empty_matcher._is_fitted)
        self.assertEqual(
            empty_matcher.find_matches(description="gate valve 2 inch"), []
        )
        self.assertEqual(empty_matcher.find_duplicates([], threshold=70.0), [])

    def test_build_index_returns_reusable_cache(self):
        fresh = SemanticMatcher()
        cache = fresh.build_index(SAMPLE_STANDARDS)
        self.assertEqual(len(cache), len(SAMPLE_STANDARDS))
        for sid, entry in cache.items():
            self.assertEqual(set(entry.keys()), {"key", "model", "vector"})
            self.assertEqual(len(entry["vector"]), 384)
            self.assertIsInstance(entry["key"], str)
            self.assertTrue(entry["key"])

    def test_embedding_cache_reuse_skips_model_load(self):
        encoder = SemanticMatcher()
        cache = encoder.build_index(SAMPLE_STANDARDS)
        self.assertIsNotNone(encoder._model)

        # A fresh matcher that reuses the stored embeddings should never need
        # to load/download the model again.
        reuser = SemanticMatcher()
        cache2 = reuser.build_index(SAMPLE_STANDARDS, embedding_cache=cache)
        self.assertIsNone(reuser._model)
        self.assertEqual(set(cache.keys()), set(cache2.keys()))
        for sid in cache:
            self.assertEqual(cache[sid]["key"], cache2[sid]["key"])
            self.assertEqual(cache[sid]["model"], cache2[sid]["model"])
            np.testing.assert_allclose(cache[sid]["vector"], cache2[sid]["vector"], atol=1e-5)
        np.testing.assert_allclose(reuser._std_vectors, encoder._std_vectors, atol=1e-5)

    def test_embedding_cache_mismatch_reencodes(self):
        encoder = SemanticMatcher()
        cache = encoder.build_index(SAMPLE_STANDARDS)
        # Corrupt the cached key so it no longer matches the prepared text.
        bad_id = SAMPLE_STANDARDS[0]["id"]
        cache[bad_id] = {"key": "something completely different", "vector": [0.0] * 384}
        reuser = SemanticMatcher()
        cache2 = reuser.build_index(SAMPLE_STANDARDS, embedding_cache=cache)
        self.assertIsNotNone(reuser._model)  # re-encoded because key mismatched
        self.assertNotEqual(cache2[bad_id]["vector"], cache[bad_id]["vector"])


try:
    from fastapi.testclient import TestClient
    from backend.main import app

    API_AVAILABLE = True
except Exception:  # pragma: no cover - protects unit-only environments
    TestClient = None
    app = None
    API_AVAILABLE = False


@unittest.skipUnless(API_AVAILABLE, "FastAPI TestClient / app not importable")
class TestMatchingAPI(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)

    def test_match_endpoint(self):
        resp = self.client.post("/api/materials/match", json={
            "raw_description": "GATE VALVE 2IN 150# FLANGED WCB BODY CS SEAT SS316",
            "unit": "NOS",
            "category": "Valves",
        })
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertIn("raw_description", data)
        self.assertIn("cleaned_description", data)
        self.assertTrue(data["matches"])
        first = data["matches"][0]
        for key in ("standard_material_id", "national_code", "standard_description", "similarity_score", "category"):
            self.assertIn(key, first)

    def test_rebuild_endpoint(self):
        resp = self.client.post("/api/matcher/rebuild")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertIn("message", data)
        self.assertIn("indexed_standard_materials", data)
        self.assertGreaterEqual(data["indexed_standard_materials"], 1)

    def test_duplicates_endpoint(self):
        resp = self.client.get("/api/materials/duplicates", params={"threshold": 5})
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertIn("clusters_found", data)
        self.assertIn("total_duplicates", data)
        self.assertIn("clusters", data)
        self.assertGreaterEqual(data["clusters_found"], 1)

    def test_duplicates_detect_endpoint(self):
        resp = self.client.post("/api/materials/duplicates/detect", params={"threshold": 5})
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(set(data.keys()), {"clusters_found", "total_duplicates"})

    def test_match_existing_material(self):
        created = self.client.post("/api/materials", json={
            "cpse_id": "ntpc",
            "material_code": "TEST-MATCH-0001",
            "description": "Gate Valve 2 inch Flanged Class 150 WCB",
            "unit": "NOS",
            "category": "Valves",
            "raw_description": "GATE VALVE 2IN FLG 150# WCB",
        })
        self.assertEqual(created.status_code, 201)
        material_id = created.json()["id"]
        try:
            resp = self.client.post(f"/api/materials/{material_id}/match")
            self.assertEqual(resp.status_code, 200)
            data = resp.json()
            self.assertEqual(data["material_id"], material_id)
            if data["best_match"]:
                self.assertIn("standard_material_id", data["best_match"])
        finally:
            self.client.delete(f"/api/materials/{material_id}")

    def test_match_batch_endpoint(self):
        created = self.client.post("/api/materials", json={
            "cpse_id": "cil",
            "material_code": "TEST-BATCH-0001",
            "description": "Deep Groove Ball Bearing 6205-2RS1 Sealed",
            "unit": "NOS",
            "category": "Bearings",
            "raw_description": "DEEP GROOVE BALL BEARING 6205-2RS1 C3",
        })
        self.assertEqual(created.status_code, 201)
        material_id = created.json()["id"]
        try:
            resp = self.client.post("/api/materials/match-batch")
            self.assertEqual(resp.status_code, 200)
            data = resp.json()
            for key in ("processed_count", "matched_count", "avg_score"):
                self.assertIn(key, data)
            self.assertGreaterEqual(data["processed_count"], 1)
        finally:
            self.client.delete(f"/api/materials/{material_id}")


if __name__ == "__main__":
    unittest.main()