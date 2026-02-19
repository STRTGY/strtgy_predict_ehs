# DENUE Hermosillo - Documentación

Datos oficiales del Directorio Estadístico Nacional de Unidades Económicas (DENUE) de INEGI, procesados para análisis comercial de Electrolit en Hermosillo, Sonora.

## 📊 Dataset Completo

### Total de Establecimientos
- **38,683 establecimientos** en Hermosillo
- **257 categorías SCIAN** únicas (nivel rama - 4 dígitos)
- **4,823 establecimientos prioritarios** (12.5% del total)

### Distribución por Categoría
- **Retail**: 4,213 establecimientos
- **Mayoreo**: 610 establecimientos
- **Otros**: 33,860 establecimientos

## 📁 Archivos Generados

### 1. `denue_hermosillo.web.geojson` (1.8 MB)
Dataset completo muestreado a 5,000 establecimientos para optimizar carga web.

**Propiedades clave**:
- `nom_estab`: Nombre del establecimiento
- `scian_6dig`: Código SCIAN completo (6 dígitos)
- `scian_rama`: Código SCIAN rama (4 dígitos)
- `scian_subsector`: Código SCIAN subsector (3 dígitos)
- `scian_sector`: Código SCIAN sector (2 dígitos)
- `es_prioritario`: Boolean - si pertenece a códigos prioritarios
- `categoria_electrolit`: "retail", "mayoreo", o "otro"
- `prioridad_electrolit`: "muy_alta", "alta", "media", "baja"
- `score_fit_base`: Score base de ajuste al negocio (5-10)

**Uso**:
```js
const denue = await loaders.loadDenue();
const total = denue.features.length;
const prioritarios = denue.features.filter(f => f.properties.es_prioritario);
```

### 2. `denue_hermosillo_prioritarios.web.geojson` (1.8 MB)
Solo establecimientos prioritarios (4,823 features).

**Códigos SCIAN incluidos**:
- **463211**: Comercio al por mayor de abarrotes
- **463212**: Comercio al por mayor de bebidas no alcohólicas (★★★)
- **463213**: Comercio al por mayor de bebidas alcohólicas
- **461110**: Tiendas de abarrotes, ultramarinos y misceláneas
- **464111**: Farmacias sin minisúper (★★★)
- **464112**: Farmacias con minisúper (★★★)
- **468111**: Tiendas de conveniencia (★★★)
- **462111**: Supermercados (★★)
- **462112**: Minisupers (★★)

**Propiedades adicionales**:
- `scian_nombre_prioritario`: Descripción del código SCIAN
- `latitud` / `longitud`: Coordenadas explícitas

**Uso**:
```js
const prioritarios = await loaders.loadDenuePrioritarios();

// Filtrar por categoría
const farmacias = prioritarios.features.filter(f => 
  f.properties.scian_6dig.startsWith("4641")
);

// Filtrar por prioridad
const muyAlta = prioritarios.features.filter(f => 
  f.properties.prioridad_electrolit === "muy_alta"
);
```

### 3. `denue_hermosillo_categorias_scian.web.csv` (5.2 KB)
Agregación estadística por categoría SCIAN (rama - 4 dígitos).

**Columnas**:
- `scian_rama`: Código SCIAN de 4 dígitos
- `n_establecimientos`: Número total de establecimientos en la categoría
- `n_prioritarios`: Número de establecimientos prioritarios
- `score_fit_promedio`: Score fit promedio de la categoría
- `pct_total`: Porcentaje del total de establecimientos

**Top 5 Categorías**:
1. **4611** (Abarrotes/Ultramarinos): 4,144 establecimientos (10.7%)
2. **7225** (Restaurantes): 3,858 establecimientos (10.0%)
3. **8111** (Reparación automotriz): 2,402 establecimientos (6.2%)
4. **8121** (Servicios personales): 2,351 establecimientos (6.1%)
5. **3118** (Panadería): 1,490 establecimientos (3.9%)

**Uso**:
```js
const categorias = await loaders.loadScianCategories();

// Filtrar solo categorías con prioritarios
const conPrioritarios = categorias.filter(d => d.n_prioritarios > 0);

// Top 10 por número de establecimientos
const top10 = categorias.slice(0, 10);
```

### 4. `denue_hermosillo_metadata.json` (848 B)
Metadata del procesamiento y estadísticas generales.

**Estructura**:
```json
{
  "generated_at": "2025-11-09T10:21:38",
  "source_shapefile": "path/to/denue_inegi_26_.shp",
  "municipality": "Hermosillo, Sonora",
  "total_establishments": 38683,
  "priority_establishments": 4823,
  "priority_codes": ["463211", "463212", ...],
  "scian_categories": {
    "total": 257,
    "priority": 5
  },
  "category_distribution": {
    "otro": 33860,
    "retail": 4213,
    "mayoreo": 610
  },
  "bbox": {
    "min_lon": -112.163,
    "min_lat": 28.287,
    "max_lon": -109.624,
    "max_lat": 29.369
  }
}
```

**Uso**:
```js
const metadata = await loaders.loadDenueMetadata();
const pctPrioritarios = (metadata.priority_establishments / metadata.total_establishments) * 100;
```

## 🔧 Procesamiento

### Script de Generación
`scripts/process_denue_hermosillo_commercial.py`

### Fuente Original
`data/external/denue_26_shp/conjunto_de_datos/denue_inegi_26_.shp`

### Pasos del Pipeline
1. **Carga**: Lectura del shapefile DENUE de Sonora completo (127,297 establecimientos)
2. **Filtrado**: Extracción de establecimientos en Hermosillo (municipio 030)
3. **Enriquecimiento**: Clasificación por códigos SCIAN prioritarios
4. **Scoring**: Asignación de scores base según categoría y prioridad
5. **Exportación**: Generación de archivos optimizados para web

### Coordenadas
- **CRS Original**: WGS84 (compatible con DENUE)
- **CRS Final**: WGS84 (EPSG:4326)
- Sin reprojección necesaria

## 📈 Análisis Disponible

### En la Página `/analisis-comercial`

1. **Indicadores Comerciales**
   - Total de establecimientos
   - Establecimientos prioritarios
   - Distribución retail vs mayoreo

2. **Gráfico Top 15 Categorías SCIAN**
   - Barras horizontales coloreadas por prioridad
   - Porcentaje del total

3. **Tabla Detallada**
   - Categorías con establecimientos prioritarios
   - Estadísticas por rama SCIAN

4. **Mapa Interactivo**
   - Puntos coloreados por categoría
   - Tamaño según score fit
   - Popup con información completa

## 🔄 Actualización

Para regenerar los datos con DENUE actualizado:

```bash
# Desde la raíz del proyecto
cd d:\OneDrive\...\119_strtgy_geointelligence\strtgy_ai_geointelligence

# Ejecutar el script de procesamiento
python scripts/process_denue_hermosillo_commercial.py
```

El script automáticamente:
- ✅ Detecta el shapefile DENUE de Sonora
- ✅ Filtra Hermosillo por código de municipio
- ✅ Clasifica establecimientos según códigos prioritarios
- ✅ Genera todos los archivos en `reports/.../src/data/`

## 📝 Notas

- Los archivos `.web.geojson` están optimizados para carga web
- El dataset completo se muestrea a 5,000 features para evitar timeouts
- Los establecimientos prioritarios siempre se incluyen completos
- Los scores base son asignados según la matriz de prioridad del negocio

---

**Generado**: Noviembre 9, 2025  
**Versión DENUE**: 2024  
**Municipio**: Hermosillo, Sonora (26030)

