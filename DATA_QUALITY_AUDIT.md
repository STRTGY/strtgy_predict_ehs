# Data Quality Audit: Midmen Electrolit Hermosillo

**Date:** 2026-02-19  
**Processed dir:** `data/processed/midmen`  
**Report data dir:** `reports/strtgy_predict_midmen_electrolit_hermosillo/src/data`  
**Pipeline:** B2B distribution (Electrolit Hermosillo). CRS: analysis EPSG:6372; report/export EPSG:4326.

---

## 1. Existing validator (validate_report_data_dir)

- **PASS**: No errors from `validate_report_data_dir`.
  - All root-level `.geojson` and `.web.geojson` in report data dir have CRS EPSG:4326.
  - `catalog.json` has non-empty `columns` for `top10_hubs` and `top10_logistica`.
  - `metrics.json` vs `denue_hermosillo_metadata.json`: `priority_establishments` (4,823) ≤ `total_establishments` (38,683); `total_establecimientos` is numeric (4,823).

---

## 2. Processed outputs (data/processed/midmen/)

### CRITICAL

- **agebs_scored.geojson** — Expected EPSG:6372, got EPSG:4326. Analysis outputs in processed dir should use pipeline CRS (EPSG:6372).
- **cedis_candidates.geojson** — Expected EPSG:6372, got EPSG:4326.
- **cedis_isochrones.geojson** — Expected EPSG:6372, got EPSG:4326.
- **denue_prioritarios.geojson** — Expected EPSG:6372, got EPSG:4326.
- **establecimientos_scored.geojson** — Expected EPSG:6372, got EPSG:4326.
- **isocronas_5_10_15.geojson** — Expected EPSG:6372, got EPSG:4326.

### Pass (CRS EPSG:6372)

- **agebs_base.geojson** — CRS EPSG:6372.
- **agebs_scince_kpis.geojson** — CRS EPSG:6372.
- **zonas_oportunidad.geojson** — CRS EPSG:6372.

**Recommendation:** Reproject the six GeoJSON files above to EPSG:6372 before writing to `data/processed/midmen/`, or document that these layers are intentionally stored in WGS84 for reuse by export. Per pipeline config and data-contracts, processed analysis files should be EPSG:6372.

---

## 3. Report data (exported for Observable)

- **PASS**: All audited GeoJSON in report data dir (root and samples) have CRS EPSG:4326:
  - agebs_base.web.geojson, agebs_dist.web.geojson, agebs_scince.web.geojson, agebs_scored.web.geojson
  - denue_hermosillo.web.geojson, denue_hermosillo_prioritarios.web.geojson, denue_prioritarios.web.geojson
  - establecimientos_scored.web.geojson, grid_suitability.web.geojson, grid_suitability_v2.web.geojson
  - hub_isochrones.web.geojson, isocronas_5_10_15.geojson, isocronas_5_10_15.web.geojson
- Catalog and metrics/metadata consistency: see §1.

---

## 4. H3 layers (layers/h3/)

- **PASS**: H3 manifest and resolution GeoJSONs valid and WGS84.
  - `h3_manifest.json` exists; `resolutions`: [8, 9, 10]; `h3_res8.geojson`, `h3_res9.geojson`, `h3_res10.geojson` exist.
  - Sampled `h3_res8.geojson`: CRS EPSG:4326.

---

## 5. Tabular (CSV / JSON)

- **PASS**: No schema or count issues.
  - **top10_hubs.csv**, **top10_logistica.csv** (processed): present, non-empty, with expected columns (e.g. ranking, lat, lon, score).
  - **top10_hubs.web.csv**, **top10_logistica.web.csv** (report): referenced in catalog with non-empty columns; files exist.
  - **metrics.json**: structure present; `total_establecimientos` numeric (4,823).
  - **denue_metadata.json** / **denue_hermosillo_metadata.json**: priority_establishments (4,823) ≤ total_establishments (38,683).

---

## 6. Summary

| Scope              | Result | Notes |
|--------------------|--------|--------|
| Report data dir    | **PASS** | CRS 4326, catalog columns, metrics/metadata consistent. |
| Processed GeoJSON | **FAIL** | 6 files in EPSG:4326; should be EPSG:6372 per pipeline. |
| H3 layers          | **PASS** | Manifest and res 8/9/10 GeoJSON present, WGS84. |
| Tabular (CSV/JSON) | **PASS** | Required columns, no high nulls, counts consistent. |

- **Files audited:** Processed: 9 GeoJSON, 2 CSV, metrics.json, denue_metadata.json. Report: root GeoJSON, catalog.json, metrics.json, denue_hermosillo_metadata.json, layers/h3 (manifest + 3 GeoJSON), top10 *.web.csv.
- **Critical:** 6 (processed CRS) | **High:** 0 | **Medium:** 0
- **Overall:** **FAIL** — Processed outputs do not meet CRS convention (EPSG:6372 for analysis). Report data is suitable for **downstream Observable report and web use** (all web layers WGS84). For **QGIS/analytics using processed dir**, reproject the six layers to EPSG:6372 or treat them as web-only copies and keep a 6372 version for analysis.

---

## 7. How to re-run this audit

From repo root:

```bash
PYTHONPATH=. python scripts/midmen/utils/audit_data_quality.py
```

Or run the existing validator only:

```python
from pathlib import Path
from scripts.midmen.utils.validate_report_data import validate_report_data_dir
errors = validate_report_data_dir(Path('reports/strtgy_predict_midmen_electrolit_hermosillo/src/data'))
# errors empty => pass
```

---

## 8. Observable isocronas page (mapas/isocronas.md) — schema alignment

**Expected by the methodology grid** (cells 1–10 min): `hub_isochrones.web.geojson` features with `time_minutes` (1–10), `hub_id`, `business_count`, `area_km2`.

**Actual `hub_isochrones.web.geojson`**:
- **time_minutes**: present but only **5, 10, 15** (not 1–10) → 7 of 10 grid cells have zero features.
- **hub_id**: absent; **cedis_id** present (same role, different name).
- **business_count**: **missing** → grid shows "0 neg." even when features exist.
- **area_km2**: **missing** → grid shows "0.0 km²".

**Actual `isocronas_5_10_15.web.geojson`**: Has `time_minutes`, `range_value`, `business_count`, `origin_id`; no `area_km2`. Used for the map layer; not for the 1–10 methodology grid.

**Impact**: The isocronas methodology grid will show **0 neg.** and **0.0 km²** for all cells until `hub_isochrones` is enriched with `business_count` and `area_km2`, and either (a) the grid is changed to 5/10/15 only, or (b) the pipeline produces isochrones for 1–10 minutes.

---

## 9. Previous audit (2025-02-17) — reference

A prior audit noted: CRS in agebs_scored.web.geojson (6372), catalog top10 columns empty, top10_logistica empty, and loader/count documentation issues. Those have been addressed in the current export: report GeoJSON are 4326, catalog has non-empty columns for top10_hubs and top10_logistica, and count consistency is verified. The remaining actionable item is **processed dir CRS** (see §2 and §6).
