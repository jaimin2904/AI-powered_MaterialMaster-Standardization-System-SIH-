import unittest
from backend.processor import MaterialDataProcessor

class TestMaterialDataProcessor(unittest.TestCase):
    def setUp(self):
        self.processor = MaterialDataProcessor()

    def test_text_normalization(self):
        raw = "   VALVE   GATE   2IN   150#   FLANGED   "
        normalized = self.processor.normalize_text(raw)
        self.assertEqual(normalized, "valve gate 2in 150# flanged")

    def test_abbreviation_normalization(self):
        raw = "VALVE GATE 2IN 150# FLG WCB BODY CS SEAT SS"
        res = self.processor.process_material(raw, unit="NOS")
        self.assertIn("stainless steel", res["cleaned_description"])
        self.assertIn("flanged", res["cleaned_description"])
        self.assertEqual(res["normalized_unit"], "numbers")

    def test_unit_normalization(self):
        self.assertEqual(self.processor.normalize_unit("PCS"), "pieces")
        self.assertEqual(self.processor.normalize_unit("Pcs."), "pieces")
        self.assertEqual(self.processor.normalize_unit("NOS"), "numbers")
        self.assertEqual(self.processor.normalize_unit("MM"), "mm")
        self.assertEqual(self.processor.normalize_unit("KG"), "kg")

    def test_spec_extraction_valve(self):
        raw = "GATE VALVE 50MM CL-150 FLG WCB SS FLANGE TYPE"
        res = self.processor.process_material(raw, unit="NOS")
        specs = res["extracted_specs"]
        self.assertIn("material_type", specs)
        self.assertEqual(specs["size"], "50mm")
        self.assertEqual(specs["capacity"], "cl-150")

    def test_spec_extraction_motor(self):
        raw = "IND MOTOR 75KW 4P 415V 50HZ TEFC FOOT B3 IE3"
        res = self.processor.process_material(raw, unit="NOS")
        specs = res["extracted_specs"]
        self.assertIn("75kw", specs["capacity"].lower())
        self.assertEqual(specs["model_number"], "IE3")

    def test_spec_extraction_bearing(self):
        raw = "DEEP GROOVE BALL BEARING 6205-2RS1 C3 SKF"
        res = self.processor.process_material(raw, unit="PCS")
        specs = res["extracted_specs"]
        self.assertEqual(specs["model_number"], "6205-2RS1")

    def test_preserves_raw_description(self):
        raw = "XLPE CABLE 3.3KV 3C X 240 SQMM ARMOURED HT AL"
        res = self.processor.process_material(raw, unit="MTRS")
        self.assertEqual(res["raw_description"], raw)
        self.assertIsNotNone(res["cleaned_description"])

if __name__ == "__main__":
    unittest.main()
