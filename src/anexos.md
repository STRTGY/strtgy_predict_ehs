---
title: Anexos y Diccionario
toc: true
---

```js
import {sectionHeader} from "./components/brand.js";
```

```js
display(sectionHeader({
  title: "Anexos y Diccionario de Datos",
  subtitle: "Glosario técnico, referencias metodológicas y fuentes de información",
  certainty: "high"
}));
```

---

## Glosario de Términos

### A

**AGEB (Área Geoestadística Básica)**  
Unidad geográfica mínima utilizada por INEGI para censos y encuestas. En zonas urbanas, representa entre 1–50 manzanas con ~2,500 habitantes promedio.

**AGS (Aguascalientes, clave de entidad)**  
Código de 2 dígitos del estado (26 = Sonora, 14 = Jalisco, etc.) usado en CVEGEO de INEGI.

### C

**CEDIS (Centro de Distribución)**  
Almacén o hub logístico desde el cual se despachan productos a puntos de venta. Sinónimo de "hub" en este reporte.

**CONAPO**  
Consejo Nacional de Población. Organismo que publica índices de marginación y proyecciones demográficas.

**Cobertura**  
Porcentaje de establecimientos priorizados alcanzables desde un hub en un tiempo determinado (ej: 30 minutos).

**CRS (Coordinate Reference System)**  
Sistema de referencia de coordenadas. Este proyecto usa WGS84 (EPSG:4326) para coordenadas lat/lon.

**CVEGEO**  
Clave Geoestadística: código único de 13 dígitos que identifica AGEBs, manzanas o localidades en el sistema de INEGI.  
Formato: `EEMMMLLLLAAAAAZZZ` (Entidad, Municipio, Localidad, AGEB, Manzana)

### D

**Decil**  
División de un conjunto de datos en 10 grupos iguales. Decil 10 = top 10%, decil 1 = bottom 10%.

**DENUE (Directorio Estadístico Nacional de Unidades Económicas)**  
Base de datos de INEGI con información de ~5.7 millones de establecimientos en México (nombre, ubicación, actividad económica SCIAN).

**Densidad Comercial**  
Número de establecimientos por km² en una AGEB. Indicador de saturación comercial o potencial de mercado.

### G

**GeoJSON**  
Formato de archivo para datos geoespaciales basado en JSON. Soportado por QGIS, Leaflet, Mapbox, Google Maps.

**Geoprocesamiento**  
Operaciones de análisis espacial: buffers, intersecciones, joins espaciales, cálculo de distancias, etc.

### H

**HORECA**  
Acrónimo de **Ho**teles, **Re**staurantes, **Ca**fés. Segmento B2B que agrupa establecimientos de servicio de alimentos y bebidas.

**Hub Logístico**  
Ver **CEDIS**.

### I

**Índice de Marginación**  
Indicador de CONAPO que mide exclusión social por falta de acceso a educación, vivienda digna, servicios básicos e ingresos.  
Escala: Muy Baja, Baja, Media, Alta, Muy Alta.

**Isócrona**  
Polígono que delimita el área alcanzable desde un punto en un tiempo determinado (ej: 30 minutos de manejo).

### N

**NSE (Nivel Socioeconómico)**  
Clasificación de hogares por ingresos y patrones de consumo. Escala AMAI: A/B (alto), C+ (medio-alto), C (medio), C- (medio-bajo), D+ (bajo-alto), D (bajo), E (muy bajo).

### P

**POI (Point of Interest)**  
Punto de interés: lugar relevante en un mapa (hospital, escuela, centro comercial, etc.).

### R

**Retail**  
Comercio minorista: tiendas de abarrotes, conveniencia, farmacias, supermercados, etc.

### S

**SCIAN (Sistema de Clasificación Industrial de América del Norte)**  
Código de 6 dígitos que clasifica actividades económicas (ej: 461110 = Supermercados).

**SCINCE (Sistema de Consulta de Información Censal)**  
Herramienta de INEGI para consultar datos del Censo de Población y Vivienda 2020 a nivel AGEB y manzana.

**Score (de Electrolit)**  
Métrica compuesta [0–100] que estima el potencial comercial de un establecimiento. Mayor score = mayor prioridad.

**Segmento**  
Categorización de establecimientos: Retail (tiendas), HORECA (restaurantes/hoteles), Institucional (gimnasios, hospitales, escuelas), Otro.

**Sweet Spot**  
Zona geográfica con alta concentración de establecimientos priorizados + accesibilidad logística óptima.

### T

**TopoJSON**  
Formato de archivo geoespacial comprimido, más ligero que GeoJSON. Usado para polígonos de AGEBs o municipios.

---

## Diccionario de Campos (Datasets)

Los nombres y tipos siguientes coinciden con **catalog.json** y con los archivos `.web.geojson` / `.web.csv` generados por el pipeline Midmen (Step 05). La lista completa de columnas por dataset está en `data/catalog.json`.

### Top 400 Establecimientos (`top400.web.geojson`)

Derivado de `establecimientos_scored.web.geojson` (top 400 por `score_total`). Propiedades principales:

| Campo | Tipo | Descripción | Ejemplo |
|-------|------|-------------|---------|
| `nombre` | string | Nombre del establecimiento (alias añadido en Step 05) | "OXXO Santa Fe" |
| `nom_estab` | string | Nombre en fuente DENUE | "OXXO Santa Fe" |
| `scian_6dig` | string | Código SCIAN 6 dígitos | "461110" |
| `scian_rama` | string | Rama SCIAN | "Comercio al por menor" |
| `score_total` | float | Score de potencial compuesto [0–100] | 87.3 |
| `decil_prioridad` | integer | Decil de priorización [1–10]; 10 = mayor prioridad | 9 |
| `score_fit_base`, `score_estrato`, `score_pob`, `score_volumen` | float | Componentes del score | — |
| `es_prioritario` | boolean | Indica si entra en criterio SCIAN prioritario | true |
| `geometry` | Point | Coordenadas WGS84 (GeoJSON) | {...} |

Otros campos en el archivo: `score_margen`, `score_accesibilidad`, `score_competencia`, `perfil_cliente`, `score_fit`, `tiene_telefono`, `tiene_correo`, `tiene_web`, `score_contactabilidad`, `score_antiguedad`, `score_total_raw`, etc. Ver **catalog.json** → `establecimientos_scored` para la lista completa.

### Establecimientos Scored (`establecimientos_scored.web.geojson`)

Capa completa de establecimientos puntuados. Mismas columnas que Top 400 (incluye `nombre` añadido en Step 05). Usado para dashboard y mapas cuando se requiere el conjunto completo.

### AGEBs Base (`agebs_base.web.geojson`)

Polígonos de AGEBs urbanas con variables SCINCE 2020. Más de 3 400 columnas; principales:

| Campo | Tipo | Descripción | Ejemplo |
|-------|------|-------------|---------|
| `CVEGEO` | string | Clave geoestadística única (13 dígitos) | "2603000010001" |
| `POB1` … `POB81`, `POB*_R` | number | Población por edad y rangos (SCINCE) | — |
| `ECO*`, `ECO*_R` | number | Variables económicas | — |
| `EDU*`, `EDU*_R` | number | Educación | — |
| `GRADO_MARG` | string | Grado de marginación CONAPO | — |
| `HOGAR*`, `DISC*`, `INDI*`, `MIG*` | number | Hogar, discapacidad, indígena, migración | — |
| `geometry` | Polygon | Polígono del AGEB (WGS84) | {...} |

Lista completa de columnas: **catalog.json** → `agebs_base` (más de 3 400 variables).

### Zonas de Oportunidad (`zonas_oportunidad.web.geojson`)

Estructura de propiedades idéntica a **agebs_base** (mismas columnas SCINCE). No incluye campos `pob_total` ni `oportunidad_tipo` en el GeoJSON; las vistas que los usan pueden derivarlos de agregados (p. ej. suma de POB* para población) o de capas auxiliares.

### Top 10 Hubs y Top 10 CEDIS

**`top10_hubs.web.csv`** (candidatos por score):

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `ranking` | integer | Posición [1–10] |
| `lat`, `lon` | float | Coordenadas WGS84 |
| `score` | float | Score de idoneidad |
| `score_network_centrality` | float | Centralidad de red |

**`top10_logistica.web.csv`** (cobertura y negocios por tiempo):

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `ranking` | integer | Posición [1–10] (clave de cruce) |
| `lat`, `lon` | float | Coordenadas WGS84 |
| `score` | float | Score logístico |
| `businesses_5min`, `businesses_10min` | integer | Establecimientos alcanzables en 5 y 10 min |
| `coverage_5min`, `coverage_10min` | float | Cobertura (p. ej. fracción del Top 400) en 5 y 10 min |
| `score_adjusted` | float | Score ajustado por cobertura |

**`top10_cedis.web.csv`** es la fusión de ambos por `ranking`; columnas resultantes según Step 05: las de **top10_hubs** más las de **top10_logistica** (sin duplicar `ranking`, `lat`, `lon`, `score`). Si el CSV generado usa otros nombres (p. ej. `rank`, `latitude`, `longitude`, `customers_5km`), consultar el encabezado del archivo o **catalog.json** → `top10_cedis`.

### Isócronas

**`hub_isochrones.web.geojson`** (polígonos por CEDIS; origen: Step 03 `cedis_isochrones`):

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `cedis_id` | string | Identificador del hub/CEDIS |
| `time_minutes` | integer | Tiempo de viaje (min) |
| `range_value` | number | Valor del rango (distancia o tiempo según proveedor) |
| `range_type`, `range_type_raw` | string | Tipo de rango (tiempo/distancia) |
| `transport_mode`, `provider` | string | Modo y proveedor (p. ej. HERE) |
| `origin_lat`, `origin_lon` | float | Origen del servicio |
| `departure_time` | string | Hora de salida (opcional) |
| `geometry` | Polygon | Polígono de la isócrona (WGS84) |

**`isocronas_5_10_15.web.geojson`** (Step 04; incluye negocio y origen):

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `origin_id` | string | Identificador del hub/origen (alias en UI: `hub_id`) |
| `time_minutes` | integer | 5, 10 o 15 minutos |
| `business_count` | integer | Establecimientos priorizados dentro del polígono |
| `origin_lat`, `origin_lon` | float | Origen |
| `range_value`, `transport_mode`, `provider` | — | Igual que hub_isochrones |
| `geometry` | Polygon | Polígono (WGS84) |

### Top 20 Comercial (`top20_comercial.web.csv`)

Top 20 establecimientos por `score_total`. Columnas típicas: `lon`, `lat`, `nombre`, `nom_estab` (y las que Step 05 incluya del GeoJSON de establecimientos). Ver **catalog.json** → `top20_comercial` si existe.

### DENUE Categorías SCIAN (`denue_hermosillo_categorias_scian.web.csv`)

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `scian_rama` | string | Rama o categoría SCIAN |
| `n_establecimientos` | integer | Número de establecimientos en la categoría |
| `n_prioritarios` | integer | Establecimientos prioritarios (criterio Electrolit) |
| `score_fit_promedio` | float | Score de ajuste promedio |
| `pct_total` | float | Porcentaje sobre el total |

### Sweet Spots (`sweetspot_top10.web.geojson`, `sweetspot_top10_v2.web.geojson`)

Top 10 candidatos CEDIS desde `cedis_candidates.geojson`. Propiedades: mismas que **puntos_candidatos_cedis** (p. ej. `CVEGEO`, scores de cobertura y centralidad). Ver **catalog.json** → `sweetspot_top10` o `puntos_candidatos_cedis` para columnas completas.

---

## Referencias Metodológicas

### Fuentes de Datos Primarias

1. **INEGI DENUE 2024**  
   URL: [https://www.inegi.org.mx/app/mapa/denue/](https://www.inegi.org.mx/app/mapa/denue/)  
   Fecha de consulta: Septiembre 2024  
   Cobertura: Establecimientos económicos de Hermosillo, Sonora

2. **INEGI SCINCE 2020**  
   URL: [https://www.inegi.org.mx/app/scince/2020/](https://www.inegi.org.mx/app/scince/2020/)  
   Fecha de consulta: Octubre 2024  
   Cobertura: Datos demográficos por AGEB del Censo 2020

3. **CONAPO Índice de Marginación 2020**  
   URL: [https://www.gob.mx/conapo](https://www.gob.mx/conapo)  
   Fecha de consulta: Octubre 2024  
   Cobertura: AGEBs urbanas de México

4. **OpenStreetMap (Basemap)**  
   URL: [https://www.openstreetmap.org/](https://www.openstreetmap.org/)  
   Licencia: ODbL (Open Database License)  
   Uso: Tiles de mapa base en visualizaciones

### Herramientas y Librerías

- **Python 3.11**
  - `geopandas 0.14.0` — Procesamiento de datos geoespaciales
  - `pandas 2.1.0` — Manipulación de datos tabulares
  - `shapely 2.0.2` — Geometrías y operaciones espaciales
  - `scikit-learn 1.3.0` — Normalización y scoring
  
- **Observable Framework 1.x**  
  - Generador de sitios estáticos para reportes interactivos
  - Leaflet 1.9.4 — Mapas interactivos
  - Observable Plot 0.6 — Visualizaciones estadísticas

- **QGIS 3.34** — Validación de geoprocesamiento y generación de mapas estáticos

### Pipeline de Procesamiento (Resumen)

1. **Extracción**
   - Descarga de DENUE vía API de INEGI (REST)
   - Descarga de shapefiles de AGEBs desde SCINCE
   - Consolidación de índices de marginación y NSE

2. **Transformación**
   - Join espacial: establecimientos → AGEBs
   - Cálculo de densidades comerciales por AGEB y por sector SCIAN
   - Normalización de variables a escala [0–100]
   - Cálculo de score ponderado multi-criterio
   - Asignación de deciles

3. **Carga**
   - Exportación a GeoJSON/CSV optimizados (<5 MB por archivo)
   - Generación de samples para visualización web
   - Despliegue en Observable Framework

### Supuestos y Limitaciones del Modelo

1. **Datos DENUE:**
   - ~15% de establecimientos pueden estar cerrados o con datos desactualizados
   - No incluye economía informal (tianguis, vendedores ambulantes)

2. **Ponderadores de Scoring:**
   - Basados en benchmarks de industria (bebidas) y experiencia de STRTGY
   - No validados con datos históricos de Electrolit en Hermosillo (no disponibles)
   - Ajustables mediante feedback de piloto de campo

3. **Análisis de Cobertura (Hubs):**
   - Asume velocidad promedio de 40 km/h en zona urbana
   - No considera tráfico en tiempo real ni restricciones de horarios pico
   - Distancias calculadas en línea recta (haversine), no por red vial real

4. **Nivel Socioeconómico:**
   - Asignado a nivel AGEB (proxy), no a nivel establecimiento individual
   - Basado en AMAI 2020, puede no reflejar cambios recientes (2024)

---

## Bibliografía y Recursos Adicionales

### Papers y Artículos Académicos

1. **Church, R. L., & ReVelle, C. S. (1974).** "The Maximal Covering Location Problem." *Papers of the Regional Science Association*, 32(1), 101–118.  
   (Fundamento teórico del análisis de ubicación de hubs)

2. **Miller, H. J., & Shaw, S. L. (2001).** *Geographic Information Systems for Transportation: Principles and Applications.* Oxford University Press.  
   (Análisis de accesibilidad y ruteo)

3. **Huff, D. L. (1964).** "Defining and Estimating a Trading Area." *Journal of Marketing*, 28(3), 34–38.  
   (Modelo de gravedad para estimación de áreas de influencia comercial)

### Recursos INEGI

- **Manual de Cartografía Geoestadística:** [https://www.inegi.org.mx/contenidos/temas/mapas/manual_cartografia.pdf](https://www.inegi.org.mx/contenidos/temas/mapas/manual_cartografia.pdf)
- **Catálogo SCIAN 2023:** [https://www.inegi.org.mx/app/scian/](https://www.inegi.org.mx/app/scian/)
- **Documentación de la API DENUE:** [https://www.inegi.org.mx/servicios/api_denue.html](https://www.inegi.org.mx/servicios/api_denue.html)

### Libros Recomendados

- **Lovelace, R., Nowosad, J., & Muenchow, J. (2019).** *Geocomputation with R.* CRC Press.  
  (Aunque usa R, los conceptos de análisis espacial son aplicables a Python)

- **Waller, L. A., & Gotway, C. A. (2004).** *Applied Spatial Statistics for Public Health Data.* Wiley.  
  (Estadística espacial aplicada)

---

## Contacto y Soporte

**STRTGY** — Transformando complejidad en certeza

**Project Manager:**  
[Nombre del PM]  
[email@strtgy.ai](mailto:email@strtgy.ai)

**Equipo Técnico (Geointelligence):**  
[Nombre del Lead Técnico]  
[tecnico@strtgy.ai](mailto:tecnico@strtgy.ai)

**Sitio Web:**  
[https://www.strtgy.ai](https://www.strtgy.ai)

---

<div class="note" style="background: #e8f5e9; border-left: 4px solid #4caf50; padding: 1rem;">
  <p style="margin: 0; font-weight: 600;">✅ Fin del Reporte</p>
  <p style="margin: 0.5rem 0 0 0;">
    Has completado la revisión del análisis de priorización para Electrolit en Hermosillo. 
    Para comenzar la implementación, dirígete al <a href="./dashboard">Dashboard Interactivo</a> 
    o descarga los datasets desde <a href="./descargas">Descargas</a>.
  </p>
</div>

---

<small style="color: #999; text-align: center; display: block; margin-top: 2rem;">
  **STRTGY Predict** | Electrolit Hermosillo | Proyecto entregado en Octubre 2025
</small>
