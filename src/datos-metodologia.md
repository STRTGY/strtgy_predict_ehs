---
title: 2) Datos y Metodología
toc: true
---

```js
import {sectionHeader, decisionCallout, implicationsCallout} from "./components/brand.js";
import {formatNumber} from "./components/ui.js";

const catalog = await FileAttachment("data/catalog.json").json();
```

```js
display(sectionHeader({
  title: "Datos y Metodología",
  subtitle: "Fuentes oficiales, pipeline de integración y criterios de calidad de datos"
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
  <div style="font-size: 1.75rem; font-weight: 700; color: #1565c0;">38,683</div>
  <div style="font-size: 0.875rem; color: #666;">establecimientos en Hermosillo (4,240 prioritarios para Electrolit)</div>
</div>

**📋 Campos utilizados:**
- Nombre del establecimiento
- Coordenadas geográficas (WGS84)
- Dirección completa
- Actividad económica (SCIAN 6 dígitos)
- Fecha de alta

</div>

<div class="card" style="background: white; border: 1px solid #e0e0e0; border-radius: 12px; padding: 1.5rem; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">

### 👥 INEGI SCINCE 2020
*Sistema de Información Censal*

<div style="background: linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%); border-radius: 8px; padding: 1rem; margin: 1rem 0; text-align: center;">
  <div style="font-size: 1.75rem; font-weight: 700; color: #1565c0;">575</div>
  <div style="font-size: 0.875rem; color: #666;">AGEBs urbanas</div>
</div>

**📋 Campos utilizados:**
- Población total por AGEB
- Viviendas particulares habitadas
- Variables demográficas (edad, sexo, escolaridad)
- Servicios en vivienda

</div>

<div class="card" style="background: white; border: 1px solid #e0e0e0; border-radius: 12px; padding: 1.5rem; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">

### 📊 CONAPO Marginación 2020
*Índice de Exclusión Social*

<div style="background: linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%); border-radius: 8px; padding: 1rem; margin: 1rem 0; text-align: center;">
  <div style="font-size: 1.75rem; font-weight: 700; color: #1565c0;">5 niveles</div>
  <div style="font-size: 0.875rem; color: #666;">de clasificación</div>
</div>

**📋 Campos utilizados:**
- Acceso a educación
- Calidad de vivienda
- Servicios básicos
- Nivel de ingresos

</div>

<div class="card" style="background: white; border: 1px solid #e0e0e0; border-radius: 12px; padding: 1.5rem; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">

### 💰 NSE AMAI 2020
*Nivel Socioeconómico*

<div style="background: linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%); border-radius: 8px; padding: 1rem; margin: 1rem 0; text-align: center;">
  <div style="font-size: 1.75rem; font-weight: 700; color: #1565c0;">7 categorías</div>
  <div style="font-size: 0.875rem; color: #666;">(A/B hasta E)</div>
</div>

**📋 Campos utilizados:**
- Ingresos del hogar
- Patrones de consumo
- Escolaridad
- Bienes en el hogar

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

| Fuente | Método | Output |
|--------|--------|--------|
| DENUE | Shapefile o repositorio por SCIAN | Establecimientos RAW |
| SCINCE 2020 | Parquet (get_agebs) | AGEBs + Población |
| Índices CONAPO/AMAI | Integrados en AGEB | Marginación + NSE |

</div>
</div>

<!-- Fase 2: Transformación -->
<div style="background: white; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
<div style="background: #f3e5f5; padding: 1.25rem 1.5rem; border-bottom: 1px solid rgba(0,0,0,0.1);">

**Fase 2** • **⚙️ Transformación** — Geoprocesamiento y joins espaciales

</div>
<div style="padding: 1.5rem;">

| Proceso | Método | Output |
|---------|--------|--------|
| Spatial Join | Point-in-Polygon | Establecimientos + AGEB |
| Cálculo de densidades | Vectorizado | Métricas por AGEB |
| Normalización | Z-score → percentil | Variables [0-100] |

</div>
</div>

<!-- Fase 3: Scoring -->
<div style="background: white; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
<div style="background: #fff3e0; padding: 1.25rem 1.5rem; border-bottom: 1px solid rgba(0,0,0,0.1);">

**Fase 3** • **🎯 Scoring** — Modelo multi-criterio ponderado

</div>
<div style="padding: 1.5rem;">

| Proceso | Método | Output |
|---------|--------|--------|
| Agregación ponderada | Σ(var × peso) | Score [0-100] |
| Asignación de deciles | Clasificación | 10 grupos |
| Segmentación | Por SCIAN | Retail/HORECA/Otro |

</div>
</div>

<!-- Fase 4: Validación -->
<div style="background: white; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
<div style="background: #e8f5e9; padding: 1.25rem 1.5rem; border-bottom: 1px solid rgba(0,0,0,0.1);">

**Fase 4** • **✅ Validación** — Control de calidad y tests

</div>
<div style="padding: 1.5rem;">

| Test | Método | Resultado |
|------|--------|-----------|
| Consistencia geográfica | Boundary check | 97.8% válidos |
| Detección de outliers | IQR | Flagged records |
| Completitud | Null check | <5% missing |

</div>
</div>

<!-- Fase 5: Exportación -->
<div style="background: white; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
<div style="background: #fce4ec; padding: 1.25rem 1.5rem; border-bottom: 1px solid rgba(0,0,0,0.1);">

**Fase 5** • **📤 Exportación** — Generación de productos finales

</div>
<div style="padding: 1.5rem;">

| Formato | Método | Uso |
|---------|--------|-----|
| GeoJSON | Simplificación (.web) | Mapas interactivos |
| CSV | Tabular (.web) | CRM/Excel, hubs, logística |

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

**Variables y Ponderaciones (modelo B2B Electrolit):**

| Variable | Peso | Descripción | Fuente |
|----------|------|-------------|--------|
| **Volumen potencial** | 20% | Estrato de empleados, población del AGEB | DENUE + SCINCE |
| **Margen estimado** | 15% | Tipo de establecimiento, NSE del AGEB | DENUE + NSE |
| **Accesibilidad logística** | 20% | Distancia a CEDIS, clustering | Geometría + HERE |
| **Competencia local** | 10% | Densidad de distribuidores de bebidas cercanos | DENUE |
| **Fit Electrolit** | 20% | Perfil de cliente ideal (A–E por SCIAN) | Config + DENUE |
| **Contactabilidad** | 10% | Completitud de datos de contacto | DENUE |
| **Antigüedad y estabilidad** | 5% | Años desde fecha de alta | DENUE |

<div style="margin-top: 1.5rem; padding: 1rem; background: rgba(255,255,255,0.7); border-radius: 8px; border-left: 4px solid #ff9800;">
<strong>Configurabilidad:</strong> Los pesos se cargan desde la configuración del proyecto (scoring_weights) y pueden ajustarse post-piloto con datos reales de ventas.
</div>

</div>

---

## 2.3. Métricas de Calidad de Datos

Las cifras siguientes son **referenciales (no derivadas de los datos actuales del reporte)**. Las métricas de calidad se obtienen en el procesamiento fuente; en este reporte se asume que los datos en `src/data` son la versión validada.

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

---

## 2.4. Criterios de Filtrado y Segmentación

### Filtros SCIAN Aplicados (Electrolit Hermosillo)

Los códigos SCIAN se definen en la configuración del proyecto (`electrolit_hermosillo.yaml`) y se aplican en el Step 02 (DENUE commercial). Se distinguen dos conceptos:

- **Códigos prioritarios (`scian_electrolit`):** Los 21 códigos SCIAN prioritarios con los que se construye el scoring y la priorización de establecimientos en este reporte. Son la fuente de la tabla de categorías y del conteo de establecimientos "prioritarios" en mapas y analítico. No incluyen 463xxx (en INEGI, 463xxx corresponde a comercio al por menor, no mayoreo).
- **Industrias foco (`industrias_foco`):** Conjunto más amplio en la configuración que incluye además HORECA, gimnasios, hoteles y gasolineras para filtrado DENUE o análisis complementario; el reporte y los rankings se basan en los **prioritarios**.

<div style="margin: 2rem 0;">

#### Códigos prioritarios (scian_electrolit) — 21 códigos (principales listados)

**Mayoreo (rama 43):**
- `431110` — Comercio al por mayor de abarrotes
- `431211` — Comercio al por mayor de bebidas no alcohólicas y hielo
- `431212` — Comercio al por mayor de vinos y licores
- `431213` — Comercio al por mayor de cerveza

**Retail y farmacias:**
- `461110` — Comercio al por menor en tiendas de abarrotes, ultramarinos y misceláneas
- `462111` — Comercio al por menor en supermercados
- `462112` — Comercio al por menor en minisupers (tiendas de conveniencia)
- `464111` — Farmacias sin minisúper
- `464112` — Farmacias con minisúper

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
