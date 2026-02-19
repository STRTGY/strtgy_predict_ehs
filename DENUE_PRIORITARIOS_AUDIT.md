# Data Quality Audit: DENUE Prioritarios / Análisis Comercial (Electrolit Hermosillo)

**Date:** 2025-02-19  
**Context:** User reported uniform stores (e.g. "TOTAL SCOOL UNIFORMES & BORDADOS") appearing in the "Análisis Comercial" section with SCIAN 463211, Categoría mayoreo, Prioridad alta.  
**Scope:** Source of truth for prioritarios, SCIAN classification, presence of name-based filters, and recommendations.

---

## 1. Source of truth for prioritarios and SCIAN

### 1.1 SCIAN prioritarios list

| Layer | Source |
|-------|--------|
| **Config** | `configs/proyectos/midmen/electrolit_hermosillo.yaml` → `proyecto.configuracion.scian_electrolit` (dict keys). Fallback: `proyecto.industrias_foco` flattened. |
| **Loader** | `scripts/midmen/utils/config_loader.py` → `PipelineConfig.scian_prioritarios` (property). |
| **Pipeline** | `scripts/midmen/steps/step_02_denue_commercial.py` uses `config.scian_prioritarios` and `config.get_score_fit(code)` for enrichment. |

**Electrolit priority codes (from config):**  
After audit correction: 431111, 431211 (mayoreo), 461110, 464111, 464112, 468111, 462111, 462112.  
Previously the config wrongly listed 463211, 463212, 463213 as mayoreo.

**SCIAN 463211 (INEGI):**  
- En el catálogo INEGI, sector **46** = Comercio al por **menor**. Rama **463** = productos textiles, ropa, bisutería, calzado.  
- **463211** = "Comercio al por menor de ropa, excepto de bebé y lencería" (retail clothing). **No es abarrotes ni mayoreo.**  
- El proyecto no validaba códigos contra INEGI; los 463xxx estaban mal usados como mayoreo. Corregido: mayoreo usa sector **43** (431111, 431211). Validar siempre: 46 = menor, 43 = mayor.

### 1.2 Step 02 DENUE commercial flow

1. **Load DENUE:** Either `load_denue_subset(scian_codes=scian_prioritarios, ...)` when `denue_repository_dir` is set, or shapefile/convention path via `_load_and_filter_municipality` / `load_denue_for_state`. Municipality filter: `cve_mun` (e.g. `["030"]` for Hermosillo).
2. **Enrich:** `_enrich_scian(gdf, dict_prioridad)` adds:
   - `scian_6dig` from DENUE column `codigo_act` (or CODIGO_ACT, scian, etc.)
   - `scian_rama` = first 4 characters of `scian_6dig`
   - `es_prioritario` = `scian_6dig in dict_prioridad.keys()` (i.e. in `scian_prioritarios`)
   - `score_fit_base` from config (default 8)
3. **Output prioritarios:** `prioritarios_gdf = hermosillo[hermosillo["es_prioritario"]][cols]` → **inclusion is by SCIAN code only**. No use of establishment name.
4. **Outputs:** `denue_prioritarios.geojson`, `denue_categorias_scian.csv`, `denue_metadata.json`.

### 1.3 Report data chain

- **Análisis Comercial** (`reports/.../src/analisis-comercial.md`) reads:
  - `denue_hermosillo_prioritarios.web.geojson` (alias of `denue_prioritarios.web.geojson`, produced by Step 05 from Step 02 output).
  - `denue_hermosillo_categorias_scian.web.csv` (from Step 02 `denue_categorias_scian.csv`).
- The report uses a **hardcoded** `SCIAN_PRIORITARIOS` map (4-digit ramas: 4611, 4621, 4632, 4641, 4681, 4631) for display labels and tipo (retail/mayoreo). Establishment-level display (e.g. cards) comes from the GeoJSON; any row with a priority SCIAN in the pipeline is shown.

**Conclusion:** The **single source of truth** for "who is prioritario" is: **DENUE `codigo_act` ∈ `scian_prioritarios`** (from Electrolit config). There is **no secondary check** on establishment name or activity description.

---

## 2. Validation or filter by name/keywords

**Finding: There is no validation or filter based on establishment name or keywords.**

- **Step 02:** No reference to `nom_estab`, `nombre`, or any name/keyword list. Selection is purely `es_prioritario` (SCIAN).
- **DENUE repository** (`geointelligence/features/denue_repository.py`): `load_denue_subset` filters by `scian_codes` or `scian_prefix` and geography; no name or keyword parameter.
- **Report (analisis-comercial.md):** The copy states *"Se excluyen restaurantes, tiendas de ropa, servicios y otros giros no prioritarios"* — this reflects **intent**, not implementation. Exclusions are achieved only by **not** including those SCIAN codes in `scian_prioritarios`. There is no code that excludes "uniformes", "bordados", "ropa", etc. by name.

So if DENUE has an establishment with **codigo_act = 463211** and name "TOTAL SCOOL UNIFORMES & BORDADOS", the pipeline and report will show it as prioritario (mayoreo, high priority) because 463211 is in the priority list.

**Root cause (one or both):**  
- DENUE may have **misclassified** the business (wrong SCIAN), or  
- The business is **registered** as 463211 (abarrotes) but the trade name suggests a different activity (uniforms/embroidery).  

The pipeline does not distinguish these cases; it trusts DENUE’s SCIAN only.

---

## 3. Recommendations

### 3.1 Document DENUE limitations (no code change)

- Add a short note in **methodology or report copy** (e.g. in `analisis-comercial.md` or in `reports/.../DATA_QUALITY_AUDIT.md` / project docs):
  - *"La priorización se basa únicamente en el código SCIAN declarado en DENUE. Algunos establecimientos pueden mostrar nombres o actividades que no coinciden con el giro oficial (p. ej. tiendas de uniformes registradas como abarrotes). Estos casos pueden reducirse con una lista de exclusión por palabras clave (opcional)."*

### 3.2 Optional name-based blocklist (minimal pipeline change)

- **Where:** `scripts/midmen/steps/step_02_denue_commercial.py`, after `_enrich_scian`, before building `prioritarios_gdf`.
- **Config:** In `electrolit_hermosillo.yaml` (or pipeline_config), add an optional list, e.g.:
  - `proyecto.configuracion.denue_prioritarios_excluir_nombre_keywords`: `["uniformes", "bordados", "uniforme", "ropa escolar", "scool"]`
- **Logic:** If present, drop rows from the **prioritarios** subset where the establishment name column (e.g. `nom_estab` / `NOM_ESTAB` / `nombre`) contains any of the keywords (case-insensitive, e.g. substring match). Log count of excluded establishments and optionally write them to a small `denue_prioritarios_excluded_by_name.csv` for traceability.
- **Important:** Apply only to the **prioritarios** export (denue_prioritarios.geojson); do **not** remove them from the full DENUE used for `denue_categorias_scian.csv` aggregates if that table is built from the full `hermosillo` frame (today it is), so that category counts remain consistent. If needed, build categorías from the same filtered prioritarios logic so counts match.

### 3.3 Correct config label for 463211

- In `electrolit_hermosillo.yaml`, change the label for 463211 from "Mayoreo carne aves" to **"Comercio al por mayor de abarrotes"** (or "Mayoreo abarrotes") to align with INEGI. This does not change behavior, only clarity.

### 3.4 Tests / validators: extend to name–SCIAN mismatch (optional)

- **`tests/midmen/test_step_02_denue_commercial.py`:**  
  - Add a test that, when an optional blocklist is set, establishments whose name contains a keyword are **not** in `denue_prioritarios.geojson` even if their SCIAN is priority.  
  - Optionally: test that without blocklist, a fixture with name "TIENDA UNIFORMES" and codigo_act 463211 **is** in prioritarios (current behavior).
- **`scripts/midmen/utils/audit_data_quality.py`:**  
  - Optional: add a check that scans `denue_prioritarios.geojson` (or report alias) for establishment name substrings from a configurable or default list (e.g. "uniformes", "bordados", "ropa") and **reports** them as MEDIUM (e.g. "N establishments with name suggesting non-beverage/non-grocery activity; consider blocklist"). This would not change data, only flag for review.
- **`scripts/midmen/utils/validate_report_data.py`:**  
  - No change required for consistency checks; optional extension could validate that a blocklist config key exists when a project expects it (documentation only).

---

## 4. Summary table

| Question | Answer |
|----------|--------|
| Where do SCIAN prioritarios come from? | `configs/proyectos/midmen/electrolit_hermosillo.yaml` → `configuracion.scian_electrolit` (and fallback `industrias_foco`). Loaded by `PipelineConfig.scian_prioritarios`. |
| Where is the list applied? | Step 02: `_enrich_scian` sets `es_prioritario`; prioritarios = `hermosillo[es_prioritario]`. No name used. |
| Is there any name/keyword filter? | **No.** |
| Why do uniform stores appear? | SCIAN 463211 is in the priority list; DENUE has the establishment as 463211. Either DENUE misclassification or business registered as abarrotes. Pipeline trusts SCIAN only. |
| Recommended data quality rules? | (1) Document that prioritization is SCIAN-only and that DENUE can yield name/activity mismatches. (2) Add optional blocklist by name keywords in config and Step 02. (3) Fix 463211 label in config. (4) Optionally extend tests and audit to flag or exclude name-keyword mismatches. |

---

## 5. Files referenced

| File | Role |
|------|------|
| `configs/proyectos/midmen/electrolit_hermosillo.yaml` | SCIAN priority list and labels; optional blocklist (if added). |
| `configs/proyectos/midmen/pipeline_config.yaml` | Extends Electrolit project; paths. |
| `scripts/midmen/utils/config_loader.py` | `scian_prioritarios`, `get_score_fit`. |
| `scripts/midmen/steps/step_02_denue_commercial.py` | DENUE load, enrich, write prioritarios and categorías. |
| `scripts/midmen/steps/step_05_export_observable.py` | Exports denue_prioritarios → .web.geojson and alias denue_hermosillo_prioritarios. |
| `reports/.../src/analisis-comercial.md` | Uses prioritarios GeoJSON and categorías CSV; hardcoded SCIAN_PRIORITARIOS for display. |
| `geointelligence/features/denue_repository.py` | Load by SCIAN/geography only; no name filter. |
| `tests/midmen/test_step_02_denue_commercial.py` | Step 02 output and priority logic; can add blocklist and name-mismatch tests. |
| `scripts/midmen/utils/audit_data_quality.py` | CRS, geometry, denue metadata; can add name-keyword flag. |
| `scripts/midmen/utils/validate_report_data.py` | Report data dir validation (CRS, catalog, metrics). |
