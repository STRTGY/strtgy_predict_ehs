# Datasets para Observable Framework

Este directorio contiene los datasets optimizados para visualización web. Los archivos son generados automáticamente desde los datos fuente mediante el script `sync_data_to_observable.py`.

## ⚠️ Importante

**NO edites manualmente los archivos en este directorio.** Son generados automáticamente. Para actualizar los datos:

```bash
# Desde el directorio del proyecto Observable
npm run sync:data

# O directamente desde la raíz del proyecto
python scripts/sync_data_to_observable.py
```

## Pipeline data incorporation

El directorio `src/data/` es alimentado por el **pipeline Midmen** (Step 05 y, si está habilitado, Step 05b). Step 05 es la **única fuente de verdad** para los archivos de este directorio: lee únicamente desde `data/processed/midmen/` y escribe los artefactos optimizados para web (`.web.geojson`, `.web.csv`) más `catalog.json`, `metrics.json` y `denue_hermosillo_metadata.json`.

### Archivos producidos por Step 05 (directos desde processed)

| Archivo en `src/data/` | Origen en `data/processed/midmen/` |
|------------------------|------------------------------------|
| `agebs_base.web.geojson` | `agebs_base.geojson` |
| `zonas_oportunidad.web.geojson` | `zonas_oportunidad.geojson` |
| `denue_prioritarios.web.geojson` | `denue_prioritarios.geojson` |
| `agebs_scince.web.geojson` | `agebs_scince_kpis.geojson` |
| `establecimientos_scored.web.geojson` | `establecimientos_scored.geojson` |
| `agebs_scored.web.geojson` | `agebs_scored.geojson` |
| `puntos_candidatos_cedis.web.geojson` | `cedis_candidates.geojson` |
| `hub_isochrones.web.geojson` | `cedis_isochrones.geojson` (sin business_count) |
| `isocronas_5_10_15.web.geojson` | `isocronas_5_10_15.geojson` (con business_count, origin_id) |
| `top10_hubs.web.csv` | `top10_hubs.csv` |
| `top10_logistica.web.csv` | `top10_logistica.csv` |

### Archivos derivados por Step 05

| Archivo en `src/data/` | Lógica |
|------------------------|--------|
| `top400.web.geojson` | Top 400 establecimientos por `score_total` desde `establecimientos_scored.geojson`; WGS84, propiedad `nombre` añadida. |
| `top400.web.csv` | Mismos 400 establecimientos en CSV (todas las columnas de atributo + lon, lat) para CRM/Excel. |
| `sweetspot_top10.web.geojson` | Top 10 candidatos CEDIS desde `cedis_candidates.geojson` (por score); mismo contenido que sweet spots. |
| `sweetspot_top10_v2.web.geojson` | Copia de `sweetspot_top10.web.geojson` para uso en dashboard. |
| `top10_cedis.web.csv` | Fusión de `top10_hubs.csv` y `top10_logistica.csv` por `ranking`; tabla única para CEDIS. |
| `scored.sample.web.geojson` | Muestra aleatoria (máx. 1000) de `establecimientos_scored.geojson`; fallback para mapas/loaders. |
| `top20_comercial.web.csv` | Top 20 establecimientos por `score_total` desde `establecimientos_scored.geojson`; CSV con nombre y coordenadas. |
| `denue_hermosillo_prioritarios.web.geojson` | Alias: copia de `denue_prioritarios.web.geojson` (mismo contenido; nombre esperado por analisis-comercial y loaders). |
| `denue_hermosillo_categorias_scian.web.csv` | Copia optimizada de `denue_categorias_scian.csv` (Step 02); categorías SCIAN en establecimientos prioritarios. |

### Step 05b (H3)

Si `h3_output.enabled` está activo, Step 05b escribe capas H3 en `src/data/layers/h3/` (resoluciones 8, 9, 10) y Step 05 añade las entradas correspondientes a `catalog.json`.

### Isócronas (grid y mapa)

- Las páginas **Mapas > Isócronas** y **Mapas > Hubs** usan **`isocronas_5_10_15.web.geojson`** para el grid y el mapa (tiempos 5, 10, 15 min; propiedades `business_count`, `origin_id`). En la UI se aplica un único alias: **`hub_id = origin_id ?? cedis_id ?? hub_id`** (función `normalizeIsochronesWithHubId` en `loaders.js`), de modo que los filtros por hub usen siempre `hub_id`, que coincide con `top10_hubs.ranking` (1–10).
- `hub_isochrones.web.geojson` proviene de `cedis_isochrones` (Step 03) y no incluye `business_count` ni `area_km2`; la grid y las métricas usan `isocronas_5_10_15` para mostrar datos reales.

### Grid y fallbacks

- **`grid_suitability.web.geojson`**: No lo genera el pipeline. Es opcional/legado. Cuando no existe, los loaders y páginas (analisis-comercial, ubicacion-cedis) usan **`agebs_scored.web.geojson`** como proxy de “grid” o zona puntuada.
- Los loaders en `loaders.js` (p. ej. `loadGrid500m`) hacen fallback a `agebs_scored` cuando el grid no está presente.

## Archivos Disponibles

Consulta `catalog.json` para información completa sobre cada dataset (estructura, tamaño, columnas).

### Archivos Principales

#### 1. `agebs_base.web.geojson`
**Descripción**: Polígonos de AGEBs urbanas de Hermosillo  
**Fuente**: SCINCE 2020 / Marco Geoestadístico INEGI  
**Formato**: GeoJSON FeatureCollection  
**Propiedades requeridas**:
- `CVEGEO` o `ageb`: Clave geoestadística del AGEB
- `POBTOT`: Población total (opcional)

### 2. `denue_hermosillo.geojson` o `denue_hermosillo.csv`
**Descripción**: Establecimientos DENUE de Hermosillo  
**Fuente**: DENUE INEGI (API o descarga masiva)  
**Formato**: GeoJSON FeatureCollection o CSV  
**Campos requeridos**:
- `nombre`: Nombre del establecimiento
- `scian`: Código SCIAN
- `latitud` y `longitud`: Coordenadas (WGS84)
- `direccion`: Dirección (opcional)

### 3. `scores_ageb.csv`
**Descripción**: Scoring calculado por AGEB  
**Fuente**: Generado por pipeline de análisis  
**Formato**: CSV  
**Columnas requeridas**:
- `ageb`: Clave del AGEB
- `score`: Score calculado (0-10)
- Otras métricas auxiliares (opcional)

### 4. `priorizados.csv`
**Descripción**: Lista de establecimientos priorizados  
**Fuente**: Generado por pipeline de análisis  
**Formato**: CSV  
**Columnas requeridas**:
- `id`: Identificador único
- `nombre`: Nombre del establecimiento
- `scian`: Código SCIAN
- `score`: Score calculado
- `latitud` y `longitud`: Coordenadas
- `direccion`: Dirección
- `ageb`: AGEB asignado
- `zona`: Zona geográfica (opcional)

## Archivos Nuevos (para análisis ampliado)

### 5. `isocronas_5_10.geojson`
**Descripción**: Polígonos de isocronas de 5 y 10 minutos  
**Fuente**: Generado con OSRM, Valhalla o similar  
**Formato**: GeoJSON FeatureCollection  
**Propiedades requeridas**:
- `minutos` o `minutes`: 5 o 10

**Generación recomendada**:
```python
# Usando openrouteservice o OSRM
# Puntos candidatos: zona de abastos, corredores céntricos
# Radio: 5 y 10 minutos en vehículo
```

### 6. `cuadricula_500m.geojson`
**Descripción**: Cuadrícula de 500x500m con métricas  
**Fuente**: Generado mediante spatial join AGEB→grid  
**Formato**: GeoJSON FeatureCollection  
**Propiedades requeridas**:
- `dens_comercial` o `score_grid`: Densidad comercial
- `pob18`: Población 18+ (opcional)

**Generación recomendada**:
```python
import geopandas as gpd
from shapely.geometry import box

# Crear grid 500m sobre bbox Hermosillo
# Spatial join con DENUE para contar establecimientos
# Spatial join con AGEB para población
```

### 7. `competencia.geojson`
**Descripción**: Puntos de competencia (distribuidores grandes)  
**Fuente**: Investigación de campo / Google Maps  
**Formato**: GeoJSON FeatureCollection  
**Propiedades requeridas**:
- `nombre`: Nombre del competidor (Abarrey, Balgo, etc.)
- `segmento`: Tipo de negocio
- `latitud` y `longitud`: Coordenadas

### 8. `zonas_interes.geojson`
**Descripción**: Polígonos de zonas de interés  
**Fuente**: Delimitación manual sobre mapa base  
**Formato**: GeoJSON FeatureCollection  
**Propiedades requeridas**:
- `nombre`: Nombre de la zona (ej: "Zona de abastos", "Corredor norte")

**Zonas sugeridas**:
- Zona de abastos (Blvd. Solidaridad y aledaños)
- Corredores comerciales principales
- Centro histórico

## Archivos Opcionales

### 9. `sonora_municipios.geojson`
**Descripción**: Límites municipales de Sonora  
**Fuente**: Marco Geoestadístico INEGI  
**Uso**: Análisis logístico estatal

### 10. `demografia_hermosillo.csv`
**Descripción**: Datos demográficos agregados  
**Fuente**: SCINCE 2020 agregado  
**Uso**: KPIs y resúmenes

### 11. `logistica_analisis.json`
**Descripción**: Resultados de análisis logístico  
**Fuente**: Cálculos de rutas y tiempos  
**Uso**: Página de logística

## Validación de Datos

Todos los loaders en `loaders.js` son "graceful" - si un archivo no está disponible, el sitio mostrará un mensaje informativo sin fallar.

**Para validar tus archivos**:

```bash
# Verificar que los archivos existen
ls -lh src/data/

# Validar GeoJSON (requiere jq)
cat src/data/hermosillo_ageb.geojson | jq '.type'
# Debe devolver: "FeatureCollection"

# Validar CSV (ver primeras líneas)
head -n 3 src/data/priorizados.csv
```

## Coordenadas y CRS

- **Sistema de coordenadas**: WGS84 (EPSG:4326) para todos los archivos
- **Formato de coordenadas**: Decimal (ej: `29.0892, -110.9608`)
- **Bbox Hermosillo**: lat 28.9-29.2, lon -111.1 a -110.8

## Fuentes de Datos

- **SCINCE 2020**: https://gaia.inegi.org.mx/scince2020/
- **DENUE**: https://www.inegi.org.mx/app/api/denue/
- **Marco Geoestadístico**: https://www.inegi.org.mx/temas/mg/
- **OpenStreetMap**: https://www.openstreetmap.org/ (para geocodificación)

## Contacto

Para dudas sobre formato de datos o generación de archivos, consulta la documentación del proyecto o contacta al equipo técnico.

---

**Última actualización**: Noviembre 2025

