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

### Top 400 Establecimientos

| Campo | Tipo | Descripción | Ejemplo |
|-------|------|-------------|---------|
| `nom_estab` | string | Nombre del establecimiento | "OXXO Santa Fe" |
| `segmento` | string | Categoría de negocio | "retail", "horeca", "institucional" |
| `score_electrolit` | float | Score de potencial [0–100] | 87.3 |
| `decil` | integer | Decil de priorización [1–10] | 9 |
| `colonia` | string | Colonia o fraccionamiento | "Villa de Seris" |
| `direccion` | string | Dirección completa | "Blvd. Luis Encinas 123" |
| `lat` | float | Latitud (WGS84) | 29.0856 |
| `lon` | float | Longitud (WGS84) | -110.9612 |
| `scian` | string | Código SCIAN (6 dígitos) | "461110" |
| `CVEGEO` | string | Clave de AGEB donde se ubica | "2603000010001" |

### AGEBs Base

| Campo | Tipo | Descripción | Ejemplo |
|-------|------|-------------|---------|
| `CVEGEO` | string | Clave geoestadística única | "2603000010001" |
| `POBTOT` | integer | Población total (SCINCE 2020) | 3,245 |
| `nse_dominante` | string | NSE predominante en la AGEB | "C", "C+", "D+" |
| `densidad_comercial` | float | Establecimientos/km² | 125.3 |
| `im_2020` | string | Índice de marginación | "Muy Baja", "Baja", "Media" |
| `geometry` | geometry | Polígono de la AGEB (GeoJSON) | {...} |

### Top 10 Hubs Logísticos

| Campo | Tipo | Descripción | Ejemplo |
|-------|------|-------------|---------|
| `ranking` | integer | Posición en el ranking [1–10] | 1 |
| `nombre` | string | Referencia o nombre de la zona | "Parque Industrial Norte" |
| `lat` | float | Latitud del hub candidato | 29.1234 |
| `lon` | float | Longitud del hub candidato | -110.8765 |
| `cobertura_30min` | float | % de Top 400 alcanzables en 30 min | 0.78 (78%) |
| `tiempo_prom_min` | float | Tiempo promedio a Top 400 (minutos) | 18.5 |
| `score_logistico` | float | Score compuesto de idoneidad logística | 92.1 |

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
