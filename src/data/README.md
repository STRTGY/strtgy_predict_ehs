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

