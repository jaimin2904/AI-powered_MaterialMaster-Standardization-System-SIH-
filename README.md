# AI-Driven National Material Master Platform

## Smart India Hackathon 2026

**Problem Statement ID:** 26099

**Problem Statement:** AI-Driven Standardization and Harmonization of Material Codes Across CPSEs

---

## About the Project

The **AI-Driven National Material Master Platform** is a web application designed to standardize and manage material information across CPSEs.

Different CPSEs may use different material codes, descriptions, specifications, units, and classifications for the same or similar materials. This can create duplicate and inconsistent records.

The platform uses **AI, NLP, and semantic similarity** to clean material data, find similar materials, detect duplicates, and recommend standard material mappings.

Original CPSE material codes are preserved, and AI recommendations are reviewed by humans before approval.

---

## Main Features

- Material data management
- Material data cleaning and normalization
- Abbreviation and unit standardization
- Specification extraction
- AI-based material matching
- Duplicate detection
- Standard material mapping
- Human approval and rejection
- Dashboard and analytics
- Audit history

---

## Technology Used

### Frontend
- React
- Vite
- JavaScript

### Backend
- Python
- FastAPI
- SQLAlchemy
- SQLite

### AI / ML
- Sentence Transformers
- `all-MiniLM-L6-v2`
- Cosine Similarity

---

## How It Works

```text
Material Data
      ↓
Data Cleaning
      ↓
Normalization
      ↓
Specification Extraction
      ↓
AI Matching
      ↓
Duplicate Detection
      ↓
AI Recommendation
      ↓
Human Review
      ↓
Approve / Reject
      ↓
Audit History
