# Instrucciones para Generar Isocronas en QGIS

## 📋 Objetivo

Generar isocronas de 5 y 10 minutos desde los puntos candidatos para ubicación de CEDIS en Hermosillo, Sonora.

---

## 📂 Archivos

### Archivo de Entrada (YA CREADO - BASADO EN ANÁLISIS CIENTÍFICO)

**Ubicación:** `src/data/puntos_candidatos_cedis.geojson`

Este archivo contiene **10 ubicaciones óptimas** calculadas mediante **análisis de grid suitability**:

| Rank | Nombre | Score | Clientes 5km | Clientes 10km | Prioridad |
|------|--------|-------|--------------|---------------|-----------|
| 1 | Hub Óptimo - Centro Comercial | 100.0 | 98 | 175 | Máxima |
| 2 | Hub Alternativo - Zona Noroeste | 98.9 | 70 | 165 | Muy Alta |
| 3 | Hub Alternativo - Zona Oeste | 97.7 | 60 | 173 | Alta |
| 4 | Hub Alternativo - Centro-Oeste | 97.2 | 128 | 173 | Alta |
| 5 | Hub Alternativo - Oeste Extendido | 97.0 | 48 | 171 | Alta |
| 6-10 | Hubs Secundarios | 96.6-96.9 | 44-122 | 173-177 | Media-Alta |

**📊 Metodología:** Estas ubicaciones fueron calculadas mediante:
- Grid de 500m sobre Hermosillo
- Análisis de cobertura de 400 clientes prioritarios
- Scoring basado en densidad y distancia óptima
- Generado por: `scripts/generate_qgis_layers_hermosillo.py`

**⚠️ Nota:** Estos puntos ya están alineados con el análisis v2 del proyecto y representan las mejores ubicaciones para un centro de distribución basándose en datos reales de clientes.

---

## 🛠️ Pasos en QGIS

### Opción 1: Usar Plugin ORS Tools (Recomendado)

1. **Instalar Plugin ORS Tools**
   - Ir a `Plugins` → `Administrar e instalar plugins`
   - Buscar "ORS Tools"
   - Instalar

2. **Configurar API Key (Gratuita)**
   - Registrarse en https://openrouteservice.org/
   - Obtener API key gratuita (500 requests/día)
   - En QGIS: `Web` → `ORS Tools` → `Provider Settings`
   - Pegar API key

3. **Generar Isocronas**
   - Cargar `puntos_candidatos_cedis.geojson` en QGIS
   - `Web` → `ORS Tools` → `Isochrones`
   - **Input Layer:** puntos_candidatos_cedis
   - **Dimension:** Time
   - **Time Ranges:** `5,10` (minutos)
   - **Travel Mode:** Driving-car
   - **⚠️ Importante:** Se generarán 20 polígonos (10 puntos × 2 tiempos)
   - Ejecutar

4. **Exportar Resultado**
   - Clic derecho en capa de isocronas → `Export` → `Save Features As`
   - **Format:** GeoJSON
   - **File name:** `isocronas_5_10.geojson`
   - **CRS:** EPSG:4326 (WGS 84)
   - Guardar en: `src/data/isocronas_5_10.geojson`

---

### Opción 2: Usar QNEAT3 (Red Vial Local)

Si tienes red vial de Hermosillo descargada:

1. **Instalar Plugin QNEAT3**
   - `Plugins` → `Administrar e instalar plugins`
   - Buscar "QNEAT3"
   - Instalar

2. **Preparar Red Vial**
   - Descargar OSM de Hermosillo (Overpass Turbo o QuickOSM)
   - Filtrar líneas tipo "highway"

3. **Generar Isocronas**
   - `Processing` → `Toolbox` → `QNEAT3`
   - `Iso-Area as Polygons (from Layer)`
   - **Network:** Red vial OSM
   - **Start Points:** puntos_candidatos_cedis
   - **Size of Iso-Area:** 5, 10 (minutos)
   - **Optimization Strategy:** Shortest Path (time)
   - **Speed:** 40 km/h (velocidad promedio urbana)

4. **Exportar**
   - Igual que Opción 1

---

### Opción 3: Script Python en QGIS (Avanzado)

```python
from qgis.core import QgsVectorLayer, QgsProject
from qgis.analysis import QgsNetworkAnalyst

# Código para isocronas automáticas
# (Requiere configuración adicional de red vial)
```

---

## 📊 Estructura Esperada del Archivo Final

El archivo `isocronas_5_10.geojson` debe tener esta estructura:

```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {
        "minutos": 5,
        "rank": 1,
        "nombre": "Hub Óptimo - Centro Comercial",
        "area_m2": 12500000
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[...]]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "minutos": 10,
        "rank": 1,
        "nombre": "Hub Óptimo - Centro Comercial",
        "area_m2": 45000000
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[...]]
      }
    }
    // ... más isocronas para cada punto (10 puntos × 2 tiempos = 20 polígonos)
  ]
}
```

**Campos importantes:**
- `minutos` o `minutes`: 5 o 10
- `punto_origen` (opcional): nombre del punto candidato
- `geometry`: Polígono de la isocrona

---

## 🗺️ Otros Archivos Opcionales

### 1. Cuadrícula 500m (`cuadricula_500m.geojson`)

Si quieres crear la cuadrícula para análisis de densidad:

```
Processing → Create Grid
- Grid type: Rectangle (polygon)
- Grid extent: Hermosillo city bounds
- Horizontal spacing: 500 meters
- Vertical spacing: 500 meters
- Grid CRS: EPSG:32612 (UTM 12N - Sonora)
```

Exportar como `cuadricula_500m.geojson`

### 2. Zonas de Interés (`zonas_interes.geojson`)

Puedes usar `zonas_oportunidad.web.geojson` existente o crear manualmente:
- Dibujar polígonos de zonas de abastos
- Dibujar corredores comerciales principales
- Exportar con campos: `nombre`, `tipo`

---

## ✅ Checklist

- [ ] Cargar `puntos_candidatos_cedis.geojson` en QGIS
- [ ] Generar isocronas de 5 y 10 minutos
- [ ] Verificar que cada punto tenga 2 isocronas (5min y 10min)
- [ ] Exportar a `isocronas_5_10.geojson` en `src/data/`
- [ ] Verificar CRS = EPSG:4326
- [ ] Verificar que el campo `minutos` o `minutes` existe
- [ ] Reconstruir Observable: `npm run build`
- [ ] Refrescar navegador en `http://127.0.0.1:3000/ubicacion-cedis`

---

## 🚀 Una Vez Generado

1. **Coloca el archivo en:**
   ```
   reports/strtgy_predict_midmen_electrolit_hermosillo/src/data/isocronas_5_10.geojson
   ```

2. **Rebuild del proyecto:**
   ```bash
   cd reports/strtgy_predict_midmen_electrolit_hermosillo
   npm run build
   ```

3. **Verifica en el navegador:**
   - Navega a: `http://127.0.0.1:3000/ubicacion-cedis`
   - El mapa debe mostrar las isocronas coloreadas
   - Los controles de toggle deben funcionar

---

## 📝 Notas

- Las isocronas de 5 minutos se mostrarán en **verde** (#00a651)
- Las isocronas de 10 minutos se mostrarán en **naranja** (#ff6b35)
- Si ORS Tools da error de API, verifica tu API key o límite diario
- Velocidad recomendada: 30-40 km/h para tráfico urbano de Hermosillo
- Horario recomendado para análisis: 10:00-16:00 (no hora pico)

---

## 🆘 Troubleshooting

**Problema:** ORS Tools no genera isocronas
- **Solución:** Verifica API key, verifica conexión a internet

**Problema:** Isocronas muy grandes o muy pequeñas
- **Solución:** Ajusta velocidad en configuración (prueba 30-50 km/h)

**Problema:** Archivo muy pesado
- **Solución:** Simplifica geometría antes de exportar (Toolbox → Simplify)

---

**Contacto:** Si tienes problemas, revisa la consola del navegador (F12) para ver mensajes de error específicos.

