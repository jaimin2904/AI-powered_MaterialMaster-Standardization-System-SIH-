import re
import json
import os
from typing import Dict, Any, Tuple, Optional

# Load default config path
CONFIG_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "processing_config.json")

class MaterialDataProcessor:
    def __init__(self, config_path: str = CONFIG_PATH):
        self.config_path = config_path
        self.abbreviations: Dict[str, str] = {}
        self.unit_mappings: Dict[str, str] = {}
        self.extraction_rules: Dict[str, Any] = {}
        self.load_config()

    def load_config(self):
        """Load or reload configuration rules."""
        if os.path.exists(self.config_path):
            with open(self.config_path, "r", encoding="utf-8") as f:
                config = json.load(f)
                self.abbreviations = config.get("abbreviations", {})
                self.unit_mappings = config.get("units", {})
                self.extraction_rules = config.get("extraction_rules", {})

    # 1. Text Normalization
    def normalize_text(self, text: str) -> str:
        if not text:
            return ""
        # Convert to lowercase
        normalized = text.lower()
        
        # Replace non-standard symbols while preserving dimensions (x, /, -, #, ., ")
        normalized = re.sub(r'[^a-z0-9\s\.\,\-\/\#\"\%]', ' ', normalized)
        
        # Normalize punctuation spaces
        normalized = re.sub(r'\s*([\.\,])\s*', r'\1 ', normalized)
        
        # Remove extra spaces
        normalized = re.sub(r'\s+', ' ', normalized).strip()
        return normalized

    # 2. Abbreviation Normalization
    def normalize_abbreviations(self, text: str) -> str:
        if not text:
            return ""
        
        words = text.split()
        normalized_words = []
        for word in words:
            # Strip trailing commas or periods for abbreviation lookup
            clean_word = word.strip(".,")
            if clean_word in self.abbreviations:
                expanded = self.abbreviations[clean_word]
                normalized_words.append(expanded)
            else:
                normalized_words.append(word)
        
        result = " ".join(normalized_words)
        
        # Apply multi-word regex replacements if any
        result = re.sub(r'\b(s\.s\.|ss316|ss304)\b', 'stainless steel', result)
        result = re.sub(r'\b(m\.s\.)\b', 'mild steel', result)
        result = re.sub(r'\b(c\.s\.)\b', 'carbon steel', result)
        
        return re.sub(r'\s+', ' ', result).strip()

    # 3. Unit Normalization
    def normalize_unit(self, unit: str) -> str:
        if not unit:
            return "numbers"
        cleaned_unit = unit.lower().strip().rstrip(".")
        return self.unit_mappings.get(cleaned_unit, unit)

    # 4. Specification Extraction
    def extract_specifications(self, text: str, raw_text: str = "") -> Dict[str, Any]:
        combined_text = f"{raw_text} {text}"
        specs = {
          "material_type": None,
          "size": None,
          "diameter": None,
          "length": None,
          "width": None,
          "thickness": None,
          "capacity": None,
          "model_number": None
        }

        # Extract material_type
        mat_match = re.search(r'\b(stainless steel 316|ss316|ss304|stainless steel|cast carbon steel wcb|carbon steel|mild steel|hdpe|xlpe|aluminium|al)\b', combined_text, re.IGNORECASE)
        if mat_match:
            specs["material_type"] = mat_match.group(1).upper()

        # Extract size / dimensions (e.g., 2 inch, 50mm, 16 x 65mm, 3c x 240 sqmm)
        size_match = re.search(r'(\d+\s*(?:inch|in|\"|nb|mm|sq\s*mm)|\d+\s*x\s*\d+(?:\s*x\s*\d+)?\s*(?:mm|inch|in|\")?)', text, re.IGNORECASE)
        if size_match:
            specs["size"] = size_match.group(1).strip()

        # Extract diameter (bore or outer)
        dia_match = re.search(r'(\d+\s*mm\s*(?:id|od|bore)|bore\s*\d+mm|\d+x\d+x\d+mm)', text, re.IGNORECASE)
        if dia_match:
            specs["diameter"] = dia_match.group(1).strip()

        # Extract length (e.g., 65mm, 3200m)
        len_match = re.search(r'(\b\d+\s*mm\s*long|\b\d+\s*mtrs|\b\d+\s*m\b)', text, re.IGNORECASE)
        if len_match:
            specs["length"] = len_match.group(1).strip()

        # Extract capacity / power / voltage / pressure rating
        cap_match = re.search(r'(\d+\s*kw|\d+\s*hp|\d+\s*v|\d+\.\d+\s*kv|\d+\s*rpm|class\s*\d+|150#|\d+\s*bar|cl-\d+)', text, re.IGNORECASE)
        if cap_match:
            specs["capacity"] = cap_match.group(1).strip()

        # Extract model / standard number (e.g., 6205-2RS1, API 610, IS 7098, IE3)
        model_match = re.search(r'\b(6\d{3}(?:-[2ZRS1C3]+)?|api\s*\d+|is\s*\d+|ie[1-4])\b', text, re.IGNORECASE)
        if model_match:
            specs["model_number"] = model_match.group(1).upper()

        # Remove None keys for clean JSON output
        return {k: v for k, v in specs.items() if v is not None}

    # Main Orchestrator
    def process_material(self, raw_description: str, unit: str = "NOS") -> Dict[str, Any]:
        """
        Process raw material string and return normalized description, unit, and extracted specs.
        """
        # Step 1: Text Normalization
        step1_text = self.normalize_text(raw_description)
        
        # Step 2: Abbreviation Normalization
        cleaned_description = self.normalize_abbreviations(step1_text)
        
        # Step 3: Unit Normalization
        normalized_unit = self.normalize_unit(unit)
        
        # Step 4: Specification Extraction
        extracted_specs = self.extract_specifications(cleaned_description, raw_description)

        return {
            "raw_description": raw_description,
            "cleaned_description": cleaned_description,
            "normalized_unit": normalized_unit,
            "extracted_specs": extracted_specs
        }

# Global processor instance
processor = MaterialDataProcessor()
