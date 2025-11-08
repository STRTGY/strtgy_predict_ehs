---
title: 2) Datos y Metodología
toc: true
---

```js
import {sectionHeader, decisionCallout, implicationsCallout, certaintyBadge} from "./components/brand.js";
import {formatNumber} from "./components/ui.js";

const catalog = await FileAttachment("data/catalog.json").json();
```

```js
display(sectionHeader({
  title: "Datos y Metodología",
  subtitle: "Fuentes oficiales, pipeline de integración y criterios de calidad de datos",
  certainty: "high"
}));
```

```js
display(decisionCallout({
  title: "¿Qué validar en esta sección?",
  items: [
    "Confirmar que las fuentes de datos son confiables y actualizadas para tu decisión de inversión",
    "Entender las limitaciones inherentes de los datos públicos (INEGI) y cómo mitigarlas",
    "Verificar que la metodología de scoring es transparente y ajustable a tu criterio de negocio",
    "Identificar qué datos adicionales (propios de Electrolit) podrían mejorar el modelo en futuras iteraciones"
  ]
}));
```

---

## 2.1. Fuentes de Datos Primarias

<div class="grid grid-cols-2" style="margin: 2rem 0; gap: 1.5rem;">

<div class="card" style="background: white; border: 1px solid #e0e0e0; border-radius: 12px; padding: 1.5rem; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">

### 🏪 INEGI DENUE 2024
*Directorio Nacional de Unidades Económicas*

<div style="background: linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%); border-radius: 8px; padding: 1rem; margin: 1rem 0; text-align: center;">
  <div style="font-size: 1.75rem; font-weight: 700; color: #1565c0;">~12,000</div>
  <div style="font-size: 0.875rem; color: #666;">establecimientos registrados</div>
  <div style="margin-top: 0.75rem; padding-top: 0.75rem; border-top: 1px solid rgba(0,0,0,0.1);">
    <div style="font-size: 0.75rem; font-weight: 600; color: #2e7d32;">Calidad: 98%</div>
  </div>
</div>

**📋 Campos utilizados:**
- Nombre del establecimiento
- Coordenadas geográficas (WGS84)
- Dirección completa
- Actividad económica (SCIAN 6 dígitos)
- Fecha de alta

**⚠️ Limitaciones:**
- **MEDIO:** ~15% registros desactualizados
- **BAJO:** Excluye economía informal
- **BAJO:** Nombres genéricos en algunos casos

</div>

<div class="card" style="background: white; border: 1px solid #e0e0e0; border-radius: 12px; padding: 1.5rem; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">

### 👥 INEGI SCINCE 2020
*Sistema de Información Censal*

<div style="background: linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%); border-radius: 8px; padding: 1rem; margin: 1rem 0; text-align: center;">
  <div style="font-size: 1.75rem; font-weight: 700; color: #1565c0;">673</div>
  <div style="font-size: 0.875rem; color: #666;">AGEBs urbanas</div>
  <div style="margin-top: 0.75rem; padding-top: 0.75rem; border-top: 1px solid rgba(0,0,0,0.1);">
    <div style="font-size: 0.75rem; font-weight: 600; color: #2e7d32;">Calidad: 95%</div>
  </div>
</div>

**📋 Campos utilizados:**
- Población total por AGEB
- Viviendas particulares habitadas
- Variables demográficas (edad, sexo, escolaridad)
- Servicios en vivienda

**⚠️ Limitaciones:**
- **MEDIO:** Datos de 2020 (4 años de antigüedad)
- **MEDIO:** Crecimiento post-censo no reflejado
- **BAJO:** AGEBs nuevas sin datos

</div>

<div class="card" style="background: white; border: 1px solid #e0e0e0; border-radius: 12px; padding: 1.5rem; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">

### 📊 CONAPO Marginación 2020
*Índice de Exclusión Social*

<div style="background: linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%); border-radius: 8px; padding: 1rem; margin: 1rem 0; text-align: center;">
  <div style="font-size: 1.75rem; font-weight: 700; color: #1565c0;">5 niveles</div>
  <div style="font-size: 0.875rem; color: #666;">de clasificación</div>
  <div style="margin-top: 0.75rem; padding-top: 0.75rem; border-top: 1px solid rgba(0,0,0,0.1);">
    <div style="font-size: 0.75rem; font-weight: 600; color: #2e7d32;">Calidad: 92%</div>
  </div>
</div>

**📋 Campos utilizados:**
- Acceso a educación
- Calidad de vivienda
- Servicios básicos
- Nivel de ingresos

**⚠️ Limitaciones:**
- **MEDIO:** Índice a nivel AGEB
- **BAJO:** No captura microzonas

</div>

<div class="card" style="background: white; border: 1px solid #e0e0e0; border-radius: 12px; padding: 1.5rem; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">

### 💰 NSE AMAI 2020
*Nivel Socioeconómico*

<div style="background: linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%); border-radius: 8px; padding: 1rem; margin: 1rem 0; text-align: center;">
  <div style="font-size: 1.75rem; font-weight: 700; color: #1565c0;">7 categorías</div>
  <div style="font-size: 0.875rem; color: #666;">(A/B hasta E)</div>
  <div style="margin-top: 0.75rem; padding-top: 0.75rem; border-top: 1px solid rgba(0,0,0,0.1);">
    <div style="font-size: 0.75rem; font-weight: 600; color: #f57c00;">Calidad: 68%</div>
  </div>
</div>

**📋 Campos utilizados:**
- Ingresos del hogar
- Patrones de consumo
- Escolaridad
- Bienes en el hogar

**⚠️ Limitaciones:**
- **MEDIO:** Asignación por AGEB (proxy)
- **MEDIO:** R² = 0.68 (precisión moderada)

</div>

</div>

---

## 2.2. Pipeline de Procesamiento

El proceso de análisis consta de 5 fases secuenciales:

<div style="margin: 2rem 0; display: grid; gap: 2rem;">

<!-- Fase 1: Extracción -->
<div style="background: white; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
<div style="background: #e3f2fd; padding: 1.25rem 1.5rem; border-bottom: 1px solid rgba(0,0,0,0.1);">

**Fase 1** • **📥 Extracción** — Obtención de datos de fuentes oficiales

</div>
<div style="padding: 1.5rem;">

| Fuente | Método | Output | Herramienta |
|--------|--------|--------|-------------|
| API DENUE | REST | Establecimientos RAW | `requests` |
| Shapefiles SCINCE | WFS | AGEBs + Población | `geopandas` |
| Índices CONAPO | CSV | Marginación + NSE | `pandas` |

</div>
</div>

<!-- Fase 2: Transformación -->
<div style="background: white; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
<div style="background: #f3e5f5; padding: 1.25rem 1.5rem; border-bottom: 1px solid rgba(0,0,0,0.1);">

**Fase 2** • **⚙️ Transformación** — Geoprocesamiento y joins espaciales

</div>
<div style="padding: 1.5rem;">

| Proceso | Método | Output | Herramienta |
|---------|--------|--------|-------------|
| Spatial Join | Point-in-Polygon | Establecimientos + AGEB | `geopandas` |
| Cálculo de densidades | Vectorizado | Métricas por AGEB | `numpy` |
| Normalización | Z-score → percentil | Variables [0-100] | `scikit-learn` |

</div>
</div>

<!-- Fase 3: Scoring -->
<div style="background: white; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
<div style="background: #fff3e0; padding: 1.25rem 1.5rem; border-bottom: 1px solid rgba(0,0,0,0.1);">

**Fase 3** • **🎯 Scoring** — Modelo multi-criterio ponderado

</div>
<div style="padding: 1.5rem;">

| Proceso | Método | Output | Herramienta |
|---------|--------|--------|-------------|
| Agregación ponderada | Σ(var × peso) | Score [0-100] | `numpy` |
| Asignación de deciles | Clasificación | 10 grupos | `pandas` |
| Segmentación | Por SCIAN | Retail/HORECA/Otro | `pandas` |

</div>
</div>

<!-- Fase 4: Validación -->
<div style="background: white; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
<div style="background: #e8f5e9; padding: 1.25rem 1.5rem; border-bottom: 1px solid rgba(0,0,0,0.1);">

**Fase 4** • **✅ Validación** — Control de calidad y tests

</div>
<div style="padding: 1.5rem;">

| Test | Método | Resultado | Herramienta |
|------|--------|-----------|-------------|
| Consistencia geográfica | Boundary check | 97.8% válidos | `shapely` |
| Detección de outliers | IQR | Flagged records | `pandas` |
| Completitud | Null check | <5% missing | `pandas` |

</div>
</div>

<!-- Fase 5: Exportación -->
<div style="background: white; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
<div style="background: #fce4ec; padding: 1.25rem 1.5rem; border-bottom: 1px solid rgba(0,0,0,0.1);">

**Fase 5** • **📤 Exportación** — Generación de productos finales

</div>
<div style="padding: 1.5rem;">

| Formato | Método | Uso | Herramienta |
|---------|--------|-----|-------------|
| GeoJSON | Simplificación | Mapas interactivos | `geopandas` |
| CSV | Tabular | CRM/Excel | `pandas` |
| TopoJSON | Compresión | Polígonos optimizados | `topojson` |

</div>
</div>

</div>

---

### Detalles del Modelo de Scoring

<div style="background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%); border-radius: 12px; padding: 2rem; border: 1px solid #ffb74d; margin: 2rem 0;">

#### 🎯 Fórmula de Scoring Multi-Criterio

<div style="background: white; padding: 1.5rem; border-radius: 8px; text-align: center; font-family: Georgia, serif; font-size: 1.5rem; margin: 1.5rem 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
Score = Σ(Variable<sub>norm</sub> × Peso)
</div>

**Variables y Ponderaciones:**

| Variable | Peso | Descripción | Normalización |
|----------|------|-------------|---------------|
| **Población AGEB** | 30% | Demanda potencial base | Z-score → percentil |
| **Densidad comercial** | 25% | Competencia y actividad económica | Z-score → percentil |
| **NSE** | 20% | Poder adquisitivo | Escala ordinal (E=0, A/B=100) |
| **Proximidad a POIs** | 15% | Tráfico peatonal/vehicular | Distancia inversa |
| **Marginación inversa** | 10% | Infraestructura y servicios | Inversa lineal |

<div style="margin-top: 1.5rem; padding: 1rem; background: rgba(255,255,255,0.7); border-radius: 8px; border-left: 4px solid #ff9800;">
<strong>⚙️ Configurabilidad:</strong> Los pesos son ajustables según la estrategia de negocio. Electrolit puede modificarlos post-piloto con datos reales de ventas.
</div>

</div>

---

## 2.3. Métricas de Calidad de Datos

<div class="grid grid-cols-4" style="gap: 1rem; margin: 2rem 0;">

<div class="card" style="background: white; border: 1px solid #e0e0e0; border-radius: 8px; padding: 1.5rem; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.08);">
<div style="font-size: 2.5rem; font-weight: 700; color: #2e7d32;">97.8%</div>
<div style="font-size: 0.875rem; color: #666; margin-top: 0.5rem;">Tasa de validez</div>
</div>

<div class="card" style="background: white; border: 1px solid #e0e0e0; border-radius: 8px; padding: 1.5rem; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.08);">
<div style="font-size: 2.5rem; font-weight: 700; color: #f57c00;">95.2%</div>
<div style="font-size: 0.875rem; color: #666; margin-top: 0.5rem;">Completitud</div>
</div>

<div class="card" style="background: white; border: 1px solid #e0e0e0; border-radius: 8px; padding: 1.5rem; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.08);">
<div style="font-size: 2.5rem; font-weight: 700; color: #2e7d32;">98.3%</div>
<div style="font-size: 0.875rem; color: #666; margin-top: 0.5rem;">Precisión geográfica</div>
</div>

<div class="card" style="background: white; border: 1px solid #e0e0e0; border-radius: 8px; padding: 1.5rem; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.08);">
<div style="font-size: 2.5rem; font-weight: 700; color: #2e7d32;">0.8%</div>
<div style="font-size: 0.875rem; color: #666; margin-top: 0.5rem;">Duplicados removidos</div>
</div>

</div>

**Detalles por métrica:**

- **Tasa de validez (97.8%):** 11,736 registros válidos de 12,000 totales que pasaron todos los controles de calidad
- **Completitud (95.2%):** Campos clave sin valores faltantes en 95.2% de los registros
- **Precisión geográfica (98.3%):** Coordenadas dentro de límites municipales válidos
- **Duplicados removidos (0.8%):** ~100 registros eliminados por duplicación exacta de coordenadas/nombre

---

## 2.4. Criterios de Filtrado y Segmentación

### 🎯 Filtros SCIAN Aplicados

<div style="margin: 2rem 0;">

#### 🛒 Sector 46: Comercio al por menor (Retail)
**Incluido** • 4 códigos SCIAN

- `461110` — Supermercados
- `461130` — Tiendas de abarrotes
- `461122` — Farmacias
- `462112` — Tiendas de conveniencia

#### 🍽️ Sector 72: Servicios de alojamiento y alimentación (HORECA)
**Incluido** • 3 códigos SCIAN

- `722511` — Restaurantes con servicio completo
- `722513` — Cafeterías y fuentes de sodas
- `721111` — Hoteles

#### 💪 Otros: Servicios complementarios
**Incluido** • 2 códigos SCIAN

- `713940` — Gimnasios y centros deportivos
- `621111` — Consultorios médicos (clínicas privadas)

#### ⛔ Sectores Excluidos
**Excluido por relevancia**

- `811` — Servicios de reparación y mantenimiento
- `812` — Servicios personales (peluquerías, lavanderías)

</div>

---
<!-- 
## 2.5. Transparencia y Reproducibilidad

### 💻 Stack Tecnológico

<div style="background: #1a1a2e; color: white; border-radius: 12px; padding: 2rem; margin: 2rem 0;">

| Librería | Versión | Uso Principal |
|----------|---------|---------------|
| `python` | 3.11+ | Lenguaje base |
| `geopandas` | 1.0.1 | Análisis geoespacial, joins, overlays |
| `pandas` | 2.2.3 | Manipulación tabular, agregaciones |
| `requests` | 2.32.3 | API calls a DENUE/INEGI |
| `scikit-learn` | 1.5.2 | Normalización, clustering |
| `shapely` | 2.0.6 | Geometrías, validación espacial |
| `numpy` | 2.1.2 | Operaciones vectorizadas |

<div style="margin-top: 1rem; padding: 1rem; background: rgba(255,255,255,0.1); border-radius: 6px;">
📦 **Nota:** Código fuente disponible en repositorio interno de STRTGY. Contactar para acceso.
</div>

</div>

### 📋 Trazabilidad de Datos

Cada registro procesado incluye metadatos de trazabilidad:

| Campo | Descripción | Ejemplo |
|-------|-------------|---------|
| `source_file` | Archivo de origen | `denue_hermosillo_2024.csv` |
| `processed_date` | Timestamp de procesamiento | `2025-11-03T20:15:32Z` |
| `processing_version` | Versión del pipeline | `v2.1.3` |
| `quality_flags` | Flags de validación | `["geo_valid", "complete"]` |

> **Regeneración con Parámetros Ajustados:** Ejecutar `python scripts/process_pipeline.py --config config_adjusted.yaml` desde el repositorio.

---

## 2.6. Limitaciones y Mitigaciones

<div style="margin: 2rem 0;">

### Alto Impacto

<div style="padding: 1.5rem; background: #ffebee; border-left: 4px solid #f44336; border-radius: 8px; margin-bottom: 1rem;">

**Censo 2020 desactualizado (4 años)**
- **Impacto:** Población y demografía con rezago temporal
- **Mitigación:** Aplicación de factor de crecimiento +2% anual. Actualización con Censo 2030 cuando esté disponible.
- **Probabilidad:** Media | **Timeline:** 2030

</div>

### Impacto Medio

<div style="padding: 1.5rem; background: #fff3e0; border-left: 4px solid #ff9800; border-radius: 8px; margin-bottom: 1rem;">

**DENUE con ~15% registros desactualizados**
- **Impacto:** Algunos establecimientos cerrados o con datos obsoletos
- **Mitigación:** Validación de existencia física en Top 20–30 mediante Google Maps/Street View antes de visita. Actualización trimestral desde API DENUE.
- **Probabilidad:** Alta | **Timeline:** Trimestral

**Sin datos históricos de Electrolit**
- **Impacto:** Modelo predictivo sin calibración local
- **Mitigación:** Usar benchmarks de industria (Gatorade, Powerade). Ajustar modelo tras 3 meses de operación con datos reales.
- **Probabilidad:** Media | **Timeline:** 3 meses

**Cobertura de hubs teórica (no validada)**
- **Impacto:** Radios de cobertura asumidos, no medidos
- **Mitigación:** Piloto de ruteo GPS desde hubs candidatos en horarios pico (2–4 semanas) antes de decisión final.
- **Probabilidad:** Media | **Timeline:** 2-4 semanas

</div>

### Bajo Impacto

<div style="padding: 1.5rem; background: #e8f5e9; border-left: 4px solid #4caf50; border-radius: 8px; margin-bottom: 1rem;">

**NSE asignado a nivel AGEB (no individual)**
- **Impacto:** Agregación espacial puede enmascarar heterogeneidad intra-AGEB
- **Mitigación:** Aceptable para priorización macro. Refinamiento posible con datos de tarjetas de crédito (si disponibles).
- **Probabilidad:** Baja | **Timeline:** Fase 2

**Economía informal no capturada**
- **Impacto:** Pequeños negocios sin registro formal excluidos
- **Mitigación:** Electrolit prioriza canal formal con facturación. Economía informal fuera de scope inicial.
- **Probabilidad:** Baja | **Timeline:** N/A

</div>

</div>

---

```js
display(implicationsCallout({
  title: "Próximos Pasos",
  items: [
    "Revisar la sección 3) Exploración Territorial para visualizar los datos procesados en mapas interactivos",
    "Validar que los pesos del modelo de scoring reflejan las prioridades comerciales de Electrolit",
    "Identificar oportunidades de integración con datos propios (ventas, rutas existentes, clientes actuales)"
  ]
}));
``` -->
