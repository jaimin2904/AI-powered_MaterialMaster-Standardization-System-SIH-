"""
AI/ML Semantic Matching Engine for National Material Master Platform.

Uses sentence-transformers embeddings (all-MiniLM-L6-v2) + cosine similarity to:
1. Match CPSE material descriptions to national standard materials (NUMC)
2. Detect duplicate/similar materials across CPSEs
3. Batch-process unmapped materials with confidence scoring

The model is loaded once and reused. Embeddings are generated once and cached
(by prepared-text key) so regenerating vectors for unchanged descriptions is
avoided. Cached embeddings can be passed in from the database.
"""

import json
import logging
from typing import List, Dict, Any, Optional
from collections import defaultdict

import numpy as np

from sentence_transformers import SentenceTransformer

from processor import processor

logger = logging.getLogger(__name__)

MODEL_NAME = "all-MiniLM-L6-v2"
EMBEDDING_DIM = 384


class SemanticMatcher:
    """
    Sentence-embedding + Cosine Similarity matching engine for industrial
    material descriptions.
    """

    def __init__(self, model_name: str = MODEL_NAME):
        self.model_name = model_name
        self._model: Optional[SentenceTransformer] = None
        self._is_fitted = False
        self._std_ids: List[int] = []
        self._std_vectors: Optional[np.ndarray] = None
        self._std_keys: List[str] = []
        self._std_metadata: List[Dict[str, Any]] = []
        # Caches produced by the most recent encode operations, keyed so the
        # caller can persist them and pass them back as embedding_cache later.
        self._last_query_cache: Dict[str, Any] = {}
        self._last_duplicate_cache: Dict[str, Any] = {}
        self._last_batch_cache: Dict[str, Any] = {}

    # ----------------------------------------------------------------
    # Model lifecycle (load once, reuse)
    # ----------------------------------------------------------------
    def _get_model(self) -> SentenceTransformer:
        if self._model is None:
            logger.info("Loading sentence-transformers model '%s' ...", self.model_name)
            self._model = SentenceTransformer(self.model_name)
        return self._model

    def _encode(self, texts: List[str]) -> np.ndarray:
        if not texts:
            return np.zeros((0, EMBEDDING_DIM), dtype=np.float32)
        model = self._get_model()
        vectors = model.encode(
            texts,
            convert_to_numpy=True,
            normalize_embeddings=True,
            batch_size=32,
        )
        return np.asarray(vectors, dtype=np.float32)

    @staticmethod
    def _normalize(vectors: np.ndarray) -> np.ndarray:
        norms = np.linalg.norm(vectors, axis=1, keepdims=True)
        return vectors / np.where(norms == 0, 1.0, norms)

    def embed_text(self, text: str) -> np.ndarray:
        """Public helper: embed a single prepared text string."""
        return self._encode([text])[0]

    @staticmethod
    def _valid_cached_vector(cached: Dict[str, Any]) -> Optional[np.ndarray]:
        if not cached:
            return None
        vec = cached.get("vector")
        if vec is None:
            return None
        arr = np.asarray(vec, dtype=np.float32)
        if arr.shape != (EMBEDDING_DIM,):
            return None
        return arr

    def _cache_is_reusable(self, cached: Optional[Dict[str, Any]], text: str) -> bool:
        """A cached embedding is reusable only if it matches the model AND the text."""
        if not cached or cached.get("model") != self.model_name:
            return False
        if cached.get("key") != text:
            return False
        return self._valid_cached_vector(cached) is not None

    def _cache_entry(self, text: str, vector: np.ndarray) -> Dict[str, Any]:
        return {"key": text, "model": self.model_name, "vector": vector.tolist()}

    def _prepare_text(self, description: str, raw_description: str = "", specs: Dict = None) -> str:
        """
        Prepare a rich text representation by combining cleaned description
        with specification attributes for better matching accuracy.
        """
        parts = []

        # Use the processor to normalize/specify text if raw
        if raw_description:
            cleaned = processor.process_material(raw_description)
            parts.append(cleaned["cleaned_description"])

        if description:
            parts.append(description.lower())

        # Append extracted spec values for richer matching context
        if specs:
            for key, val in specs.items():
                if val:
                    parts.append(str(val).lower())

        combined = " ".join(parts)
        # Deduplicate words while preserving order
        seen = set()
        deduped = []
        for word in combined.split():
            if word not in seen:
                seen.add(word)
                deduped.append(word)
        return " ".join(deduped)

    def build_index(
        self,
        standard_materials: List[Dict[str, Any]],
        embedding_cache: Optional[Dict[int, Dict[str, Any]]] = None,
    ) -> Dict[int, Dict[str, Any]]:
        """
        Build the embedding index from the standard material catalog.

        Args:
            standard_materials: List of dicts with keys:
                id, national_code, standard_description, specification, unit, category
            embedding_cache: Optional mapping of standard material id ->
                {"key": prepared_text, "vector": [...]} to reuse stored embeddings.

        Returns:
            Index cache mapping standard material id -> {"key", "vector"} so the
            caller can persist/store fresh embeddings.
        """
        embedding_cache = embedding_cache or {}

        self._std_ids = []
        self._std_vectors = []
        self._std_keys = []
        self._std_metadata = []

        to_encode_texts: List[str] = []
        to_encode_positions: List[int] = []

        for std in standard_materials:
            specs = {}
            if std.get("specification"):
                try:
                    specs = json.loads(std["specification"]) if isinstance(std["specification"], str) else std["specification"]
                except (json.JSONDecodeError, TypeError):
                    specs = {}

            text = self._prepare_text(
                description=std.get("standard_description", ""),
                specs=specs,
            )

            position = len(self._std_ids)
            self._std_ids.append(std["id"])
            self._std_keys.append(text)
            self._std_metadata.append({
                "id": std["id"],
                "national_code": std.get("national_code", ""),
                "standard_description": std.get("standard_description", ""),
                "category": std.get("category", ""),
                "unit": std.get("unit", ""),
            })

            cached = embedding_cache.get(std["id"])
            if self._cache_is_reusable(cached, text):
                # Reuse the stored embedding (same model, description unchanged).
                self._std_vectors.append(self._valid_cached_vector(cached))
            else:
                self._std_vectors.append(None)
                to_encode_positions.append(position)
                to_encode_texts.append(text)

        if not self._std_ids:
            logger.warning("No standard materials to index.")
            self._is_fitted = False
            return {}

        if to_encode_texts:
            encoded = self._encode(to_encode_texts)
            for position, vec in zip(to_encode_positions, encoded):
                self._std_vectors[position] = vec

        vectors = np.stack(self._std_vectors).astype(np.float32)
        self._std_vectors = self._normalize(vectors)
        self._is_fitted = True
        logger.info(
            "Embedding index built with %d standard materials (%d encoded, %d reused)",
            len(self._std_ids), len(to_encode_texts), len(self._std_ids) - len(to_encode_texts),
        )

        index_cache = {}
        for sid, text, vec in zip(self._std_ids, self._std_keys, self._std_vectors):
            index_cache[sid] = self._cache_entry(text, vec)
        return index_cache

    def find_matches(
        self,
        description: str,
        raw_description: str = "",
        category: str = "",
        unit: str = "",
        specs: Dict = None,
        top_n: int = 5,
        min_score: float = 0.0,
    ) -> List[Dict[str, Any]]:
        """
        Find the best matching standard materials for a given CPSE material description.

        Args:
            description: Cleaned material description
            raw_description: Original raw description (will be processed)
            category: Material category for score boosting
            unit: Unit of measure
            specs: Extracted specifications dict
            top_n: Number of top matches to return
            min_score: Minimum similarity score threshold (0-100)

        Returns:
            List of match dicts with: standard_material_id, national_code,
            standard_description, similarity_score, category, unit, is_category_match
        """
        if not self._is_fitted:
            logger.error("Matcher not fitted. Call build_index() first.")
            return []

        query_text = self._prepare_text(
            description=description,
            raw_description=raw_description,
            specs=specs,
        )

        if not query_text.strip():
            return []

        query_vec = self._encode([query_text])[0]
        self._last_query_cache = self._cache_entry(query_text, query_vec)

        # Cosine similarity between normalized query and index embeddings (0-100)
        scores = self._std_vectors.dot(query_vec) * 100.0
        scores = np.maximum(scores, 0.0)

        # Apply category-aware boosting
        query_category = category.lower().strip() if category else ""
        if query_category:
            for i, meta in enumerate(self._std_metadata):
                std_cat = meta["category"]
                if std_cat and self._categories_match(query_category, std_cat.lower()):
                    scores[i] = min(scores[i] + 5.0, 100.0)  # +5% boost, cap at 100

        ranked_indices = np.argsort(scores)[::-1][:top_n]

        matches = []
        for idx in ranked_indices:
            score = round(float(scores[idx]), 2)
            if score < min_score:
                continue
            meta = self._std_metadata[idx]
            matches.append({
                "standard_material_id": meta["id"],
                "national_code": meta["national_code"],
                "standard_description": meta["standard_description"],
                "similarity_score": score,
                "category": meta["category"],
                "unit": meta["unit"],
                "is_category_match": self._categories_match(
                    query_category, meta["category"].lower()
                ) if query_category else False,
            })

        return matches

    @staticmethod
    def _categories_match(cat1: str, cat2: str) -> bool:
        """Check if two categories are semantically equivalent."""
        if not cat1 or not cat2:
            return False
        c1 = cat1.lower().strip()
        c2 = cat2.lower().strip()
        if c1 == c2:
            return True
        # Fuzzy category matching for common industrial category synonyms
        synonyms = [
            {"valves", "valve", "gate valve", "ball valve"},
            {"motors", "motor", "induction motor", "electric motor"},
            {"bearings", "bearing", "ball bearing", "roller bearing"},
            {"pumps", "pump", "pumps & impellers", "centrifugal pump"},
            {"cables", "cable", "power cable", "control cable"},
            {"pipes", "pipe", "seamless pipe", "welded pipe"},
            {"transformers", "transformer", "power transformer"},
        ]
        for group in synonyms:
            if c1 in group and c2 in group:
                return True
        return False

    def find_duplicates(
        self,
        materials: List[Dict[str, Any]],
        threshold: float = 80.0,
        embedding_cache: Optional[Dict[int, Dict[str, Any]]] = None,
    ) -> List[Dict[str, Any]]:
        """
        Detect duplicate/similar materials across CPSEs.

        Groups materials whose cosine similarity (embedding-based) is above the
        given threshold into clusters. A material is never compared against itself.

        Args:
            materials: List of material dicts with keys:
                id, description, raw_description, category, cpse_id, cpse_name,
                material_code, unit_cost, stock_qty, plant_location
            threshold: Minimum similarity score (0-100) to consider as duplicate
            embedding_cache: Optional mapping of material id ->
                {"key": prepared_text, "vector": [...]} to reuse stored embeddings.

        Returns:
            List of cluster dicts, each containing:
                cluster_id, materials (list), avg_similarity, category
        """
        if not materials or len(materials) < 2:
            return []

        embedding_cache = embedding_cache or {}

        # Prepare text representations and embeddings for all materials
        texts: List[str] = []
        vectors = []
        to_encode_positions: List[int] = []

        for i, mat in enumerate(materials):
            specs = {}
            if mat.get("extracted_specs"):
                try:
                    specs = json.loads(mat["extracted_specs"]) if isinstance(mat["extracted_specs"], str) else mat["extracted_specs"]
                except (json.JSONDecodeError, TypeError):
                    specs = {}

            text = self._prepare_text(
                description=mat.get("cleaned_description") or mat.get("description", ""),
                raw_description=mat.get("raw_description", ""),
                specs=specs,
            )
            texts.append(text)

            cached = embedding_cache.get(mat.get("id"))
            if self._cache_is_reusable(cached, text):
                vectors.append(self._valid_cached_vector(cached))
            else:
                to_encode_positions.append(i)
                vectors.append(None)

        if to_encode_positions:
            encoded = self._encode([texts[i] for i in to_encode_positions])
            for position, vec in zip(to_encode_positions, encoded):
                vectors[position] = vec

        matrix = self._normalize(np.stack(vectors).astype(np.float32))

        # Expose embeddings so the caller can persist them for later reuse.
        self._last_duplicate_cache = {}
        for i, mat in enumerate(materials):
            self._last_duplicate_cache[mat.get("id")] = self._cache_entry(
                texts[i], matrix[i]
            )

        # Compute pairwise cosine similarity
        sim_matrix = (matrix @ matrix.T) * 100.0

        # Build adjacency list of duplicate pairs
        n = len(materials)
        adjacency = defaultdict(set)
        for i in range(n):
            for j in range(i + 1, n):
                if sim_matrix[i][j] >= threshold:
                    # Only cluster materials from DIFFERENT CPSEs or with different codes
                    mat_i = materials[i]
                    mat_j = materials[j]
                    if mat_i.get("cpse_id") != mat_j.get("cpse_id") or mat_i.get("material_code") != mat_j.get("material_code"):
                        adjacency[i].add(j)
                        adjacency[j].add(i)

        # Find connected components (clusters) via BFS
        visited = set()
        clusters = []
        cluster_id = 1

        for node in range(n):
            if node in visited or node not in adjacency:
                continue

            # BFS
            queue = [node]
            visited.add(node)
            component = [node]

            while queue:
                current = queue.pop(0)
                for neighbor in adjacency[current]:
                    if neighbor not in visited:
                        visited.add(neighbor)
                        queue.append(neighbor)
                        component.append(neighbor)

            if len(component) >= 2:
                # Compute average pairwise similarity within cluster
                pair_scores = []
                for ci in range(len(component)):
                    for cj in range(ci + 1, len(component)):
                        pair_scores.append(sim_matrix[component[ci]][component[cj]])
                avg_sim = round(float(np.mean(pair_scores)), 2) if pair_scores else 0.0

                cluster_materials = []
                for idx in component:
                    mat = materials[idx]
                    cluster_materials.append({
                        "id": mat.get("id"),
                        "material_code": mat.get("material_code", ""),
                        "description": mat.get("description", ""),
                        "raw_description": mat.get("raw_description", ""),
                        "cleaned_description": mat.get("cleaned_description") or None,
                        "status": mat.get("status") or "Unmapped",
                        "cpse_id": mat.get("cpse_id", ""),
                        "cpse_name": mat.get("cpse_name", ""),
                        "category": mat.get("category", ""),
                        "unit_cost": mat.get("unit_cost", 0.0),
                        "stock_qty": mat.get("stock_qty", 0),
                        "plant_location": mat.get("plant_location", ""),
                    })

                # Determine the dominant category
                categories = [m["category"] for m in cluster_materials if m["category"]]
                dominant_category = max(set(categories), key=categories.count) if categories else "Unknown"

                clusters.append({
                    "cluster_id": cluster_id,
                    "materials": cluster_materials,
                    "avg_similarity": avg_sim,
                    "category": dominant_category,
                    "material_count": len(cluster_materials),
                })
                cluster_id += 1

        # Sort clusters by avg_similarity descending
        clusters.sort(key=lambda c: c["avg_similarity"], reverse=True)
        return clusters

    def run_batch_matching(
        self,
        materials: List[Dict[str, Any]],
        top_n: int = 3,
        min_score: float = 30.0,
    ) -> Dict[str, Any]:
        """
        Batch-process a list of materials, finding the best standard match for each.

        Args:
            materials: List of material dicts to match
            top_n: Number of top matches per material
            min_score: Minimum similarity score threshold

        Returns:
            Dict with:
                results: List of {material_id, best_match, all_matches}
                summary: {processed_count, matched_count, avg_score, unmatched_count}
        """
        if not self._is_fitted:
            logger.error("Matcher not fitted. Call build_index() first.")
            return {"results": [], "summary": {"processed_count": 0, "matched_count": 0, "avg_score": 0, "unmatched_count": 0}}

        results = []
        scores = []
        self._last_batch_cache = {}

        for mat in materials:
            specs = {}
            if mat.get("extracted_specs"):
                try:
                    specs = json.loads(mat["extracted_specs"]) if isinstance(mat["extracted_specs"], str) else mat["extracted_specs"]
                except (json.JSONDecodeError, TypeError):
                    specs = {}

            matches = self.find_matches(
                description=mat.get("cleaned_description") or mat.get("description", ""),
                raw_description=mat.get("raw_description", ""),
                category=mat.get("category", ""),
                unit=mat.get("unit", ""),
                specs=specs,
                top_n=top_n,
                min_score=min_score,
            )

            if self._last_query_cache:
                self._last_batch_cache[mat.get("id")] = self._last_query_cache

            best_match = matches[0] if matches else None
            if best_match:
                scores.append(best_match["similarity_score"])

            results.append({
                "material_id": mat.get("id"),
                "material_code": mat.get("material_code", ""),
                "cpse_id": mat.get("cpse_id", ""),
                "description": mat.get("description", ""),
                "best_match": best_match,
                "all_matches": matches,
            })

        matched_count = sum(1 for r in results if r["best_match"])
        avg_score = round(float(np.mean(scores)), 2) if scores else 0.0

        return {
            "results": results,
            "summary": {
                "processed_count": len(materials),
                "matched_count": matched_count,
                "unmatched_count": len(materials) - matched_count,
                "avg_score": avg_score,
            }
        }


# Global matcher instance (model is loaded once and reused across requests)
matcher = SemanticMatcher()