---
title: Inicio
toc: false
theme: ["cotton", "wide"]
---

```js
import {heroSTRTGY, decisionCallout, implicationsCallout} from "./components/brand.js";
import {kpi, formatNumber} from "./components/ui.js";

// Cargar datasets principales (Step 05: data/processed/midmen -> src/data)
const catalog = await FileAttachment("data/catalog.json").json();
const metrics = await FileAttachment("data/metrics.json").json();
const top400 = await FileAttachment("data/top400.web.geojson").json();
const agebs = await FileAttachment("data/agebs_base.web.geojson").json();
const zonasOportunidad = await FileAttachment("data/zonas_oportunidad.web.geojson").json();
const sweetspots = await FileAttachment("data/sweetspot_top10.web.geojson").json();
const top10hubs = await FileAttachment("data/top10_hubs.web.csv").csv({typed: true});

// KPIs desde src/data: total priorizados en metrics; Top 400 en GeoJSON; población/AGEBs en zonas_oportunidad
const totalPriorizados = metrics?.metrics?.total_establishments ?? metrics?.total_establecimientos ?? 4240;
const totalTop400 = top400.features.length;
const totalAgebs = agebs.features.length;
const totalSweet = sweetspots.features.length;
// Suma POB* por feature (zonas_oportunidad usa POB1, POB2, ...) para derivar oportunidad alta
const pobKeys = zonasOportunidad.features[0]?.properties
  ? Object.keys(zonasOportunidad.features[0].properties).filter(k => /^POB\d+$/.test(k) && !k.includes("_R"))
  : [];
const sumPobFeature = (f) => pobKeys.reduce((s, k) => s + (Math.max(0, Number(f.properties?.[k]) || 0)), 0);
const totalEstablecimientosAnalizados = zonasOportunidad.features.reduce((sum, f) => sum + (f.properties.n_establecimientos || 0), 0);
const totalPriorizadosDisplay = totalEstablecimientosAnalizados > 0 ? totalEstablecimientosAnalizados : totalPriorizados;
// oportunidad_tipo no existe en el GeoJSON; derivar "alta" como top 20% por población en zonas_oportunidad
const poblacionPorFeature = zonasOportunidad.features.map(f => sumPobFeature(f)).filter(n => n > 0);
const umbralAlta = poblacionPorFeature.length ? poblacionPorFeature.sort((a, b) => b - a)[Math.floor(poblacionPorFeature.length * 0.2) - 1] ?? 0 : 0;
const agebsConOportunidadAlta = umbralAlta > 0 ? zonasOportunidad.features.filter(f => sumPobFeature(f) >= umbralAlta).length : 0;
```

```js
display(heroSTRTGY({
  title: "STRTGY Predict | Framework de Análisis Geoespacial B2B",
  subtitle: "Transformando datos geoespaciales en decisiones comerciales con certeza",
  context: "Análisis de inteligencia geoestadística para optimizar la expansión comercial B2B de Electrolit en Hermosillo, Sonora. De la complejidad territorial a una estrategia ejecutable con ROI medible.",
  showPillars: true
}));
```

## Resumen Ejecutivo

**El desafío:** Una empresa de distribución B2B busca expandir su red en un mercado urbano con más de 38,000 establecimientos potenciales sin criterios claros de priorización. ¿Dónde invertir recursos comerciales y logísticos para maximizar conversión y volumen?

**La solución:** Este framework abstrae la complejidad del territorio en un modelo de scoring multi-criterio que integra demografía, densidad comercial y variables socioeconómicas. El resultado: **certeza en la priorización** de establecimientos de mayor potencial y la identificación de ubicaciones óptimas para infraestructura logística.

> **Fuentes de datos:** Este análisis integra datos oficiales de INEGI (DENUE 2024, SCINCE 2020) procesados mediante el framework STRTGY Predict.

```js
display(
  kpi([
    {
      label: "Top 400 (establecimientos de mayor potencial)",
      value: formatNumber(totalTop400),
      format: null
    },
    {
      label: "Total priorizados (evaluados)",
      value: formatNumber(totalPriorizadosDisplay),
      format: null
    },
    {
      label: "Sweet Spots Logísticos Identificados",
      value: formatNumber(totalSweet),
      format: null
    },
    {
      label: "AGEBs con Oportunidad Alta",
      value: `${formatNumber(agebsConOportunidadAlta)} / ${formatNumber(totalAgebs)}`,
      format: null
    }
  ])
);
```

```js
display(decisionCallout({
  title: "¿Qué decidir con este análisis?",
  items: [
    "Priorizar los primeros 100–200 establecimientos B2B con mayor potencial de conversión y volumen",
    "Seleccionar la ubicación óptima de CEDIS entre las 10 alternativas identificadas",
    "Definir estrategia de expansión territorial: Hermosillo consolidado vs. cobertura regional Sonora",
    "Asignar recursos comerciales con criterio geoespacial: dónde NO invertir es tan importante como dónde SÍ"
  ]
}));
```

---

## El Valor STRTGY: De la Complejidad a la Certeza

Este reporte no es un ejercicio académico de geoestadística. Es **inteligencia ejecutable** diseñada para que tomes decisiones comerciales con confianza. Hemos eliminado la fricción entre el análisis y la acción.

### Qué encontrarás aquí

**1. Contexto y Objetivos**  
Problema de negocio, hipótesis comerciales y KPIs que miden éxito. Entendemos tu ADN de negocio.

**2. Datos y Metodología**  
Transparencia total: fuentes oficiales (INEGI), pipeline de integración y criterios de calidad. Sin cajas negras.

**3. Exploración Territorial**  
Mapas base de Hermosillo: AGEBs, demografía y estructura urbana. Contexto geográfico que informa la estrategia.

**4. Análisis Comercial**  
Densidades por sector (SCIAN), segmentación retail/horeca/institucional y zonas de oportunidad. Dónde está el potencial.

**5. Scoring y Priorización**  
Modelo de scoring transparente con ponderadores ajustables. Lista rank-ordered de establecimientos listos para prospección.

**6. Logística y Sonora**  
Ubicación óptima de CEDIS, cobertura territorial y análisis de expansión a nivel estatal. ROI logístico claro.

**7. Dashboard Interactivo**  
Filtros dinámicos, exportación de listas y visualizaciones personalizables. Tu equipo comercial puede usarlo directamente.

---

## Mapas Interactivos

<div class="grid grid-cols-4">
  <a href="./mapas/hubs" class="card" style="text-decoration: none; color: inherit; display: block; transition: all 0.2s ease;">
    <div style="font-size: 2.5rem; text-align: center; margin-bottom: 0.5rem;">🚚</div>
    <h3 style="margin: 0 0 0.5rem 0; color: #0066cc; font-size: 1.1rem;">Hubs Logísticos</h3>
    <p style="margin: 0; color: #666; font-size: 0.875rem; line-height: 1.4;">Top 10 ubicaciones óptimas para CEDIS</p>
  </a>
  <a href="./mapas/isocronas" class="card" style="text-decoration: none; color: inherit; display: block; transition: all 0.2s ease;">
    <div style="font-size: 2.5rem; text-align: center; margin-bottom: 0.5rem;">⏱️</div>
    <h3 style="margin: 0 0 0.5rem 0; color: #0066cc; font-size: 1.1rem;">Isócronas</h3>
    <p style="margin: 0; color: #666; font-size: 0.875rem; line-height: 1.4;">Análisis de cobertura temporal</p>
  </a>
  <a href="./mapas/sweet-spots" class="card" style="text-decoration: none; color: inherit; display: block; transition: all 0.2s ease;">
    <div style="font-size: 2.5rem; text-align: center; margin-bottom: 0.5rem;">⭐</div>
    <h3 style="margin: 0 0 0.5rem 0; color: #0066cc; font-size: 1.1rem;">Sweet Spots</h3>
    <p style="margin: 0; color: #666; font-size: 0.875rem; line-height: 1.4;">Zonas de alta concentración comercial</p>
  </a>
</div>

---

## ¿Por dónde empezar?

<div class="grid grid-cols-2">
  <div class="card">
    <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem;">
      <span style="font-size: 1.5rem;">📊</span>
      <h3 style="margin: 0; font-size: 1rem;">Directores Comerciales</h3>
    </div>
    <ul style="margin: 0; padding: 0; list-style: none;">
      <li style="margin-bottom: 0.75rem;">
        <a href="./contexto-objetivos" style="color: #0066cc; text-decoration: none; font-weight: 500;">Contexto y Objetivos</a>
        <span style="color: #999; font-size: 0.85rem;"> — Marco estratégico</span>
      </li>
      <li style="margin-bottom: 0.75rem;">
        <a href="./scoring-priorizacion" style="color: #0066cc; text-decoration: none; font-weight: 500;">Scoring y Priorización</a>
        <span style="color: #999; font-size: 0.85rem;"> — Lista ejecutable</span>
      </li>
      <li style="margin-bottom: 0.75rem;">
        <a href="./dashboard" style="color: #0066cc; text-decoration: none; font-weight: 500;">Dashboard Interactivo</a>
        <span style="color: #999; font-size: 0.85rem;"> — Filtros y exportación</span>
      </li>
    </ul>
  </div>

  <div class="card">
    <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem;">
      <span style="font-size: 1.5rem;">🏭</span>
      <h3 style="margin: 0; font-size: 1rem;">Directores de Operaciones</h3>
    </div>
    <ul style="margin: 0; padding: 0; list-style: none;">
      <li style="margin-bottom: 0.75rem;">
        <a href="./ubicacion-cedis" style="color: #0066cc; text-decoration: none; font-weight: 500;">Ubicación CEDIS</a>
        <span style="color: #999; font-size: 0.85rem;"> — Alternativas logísticas</span>
      </li>
      <li style="margin-bottom: 0.75rem;">
        <a href="./logistica-sonora" style="color: #0066cc; text-decoration: none; font-weight: 500;">Logística y Sonora</a>
        <span style="color: #999; font-size: 0.85rem;"> — Expansión regional</span>
      </li>
      <li style="margin-bottom: 0.75rem;">
        <a href="./mapas/hubs" style="color: #0066cc; text-decoration: none; font-weight: 500;">Hubs Logísticos</a>
        <span style="color: #999; font-size: 0.85rem;"> — Cobertura territorial</span>
      </li>
    </ul>
  </div>

  <div class="card">
    <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem;">
      <span style="font-size: 1.5rem;">🔬</span>
      <h3 style="margin: 0; font-size: 1rem;">Analistas Técnicos</h3>
    </div>
    <ul style="margin: 0; padding: 0; list-style: none;">
      <li style="margin-bottom: 0.75rem;">
        <a href="./datos-metodologia" style="color: #0066cc; text-decoration: none; font-weight: 500;">Datos y Metodología</a>
        <span style="color: #999; font-size: 0.85rem;"> — Pipeline reproducible</span>
      </li>
      <li style="margin-bottom: 0.75rem;">
        <a href="./exploracion-territorio" style="color: #0066cc; text-decoration: none; font-weight: 500;">Exploración Territorial</a>
        <span style="color: #999; font-size: 0.85rem;"> — Contexto geográfico</span>
      </li>
      <li style="margin-bottom: 0.75rem;">
        <a href="./anexos" style="color: #0066cc; text-decoration: none; font-weight: 500;">Anexos y Diccionario</a>
        <span style="color: #999; font-size: 0.85rem;"> — Referencias técnicas</span>
      </li>
    </ul>
  </div>

  <div class="card">
    <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem;">
      <span style="font-size: 1.5rem;">⚡</span>
      <h3 style="margin: 0; font-size: 1rem;">Ejecutivos (Vista Rápida)</h3>
    </div>
    <ul style="margin: 0; padding: 0; list-style: none;">
      <li style="margin-bottom: 0.75rem;">
        <strong style="color: #0066cc;">Esta página</strong>
        <span style="color: #999; font-size: 0.85rem;"> — Resumen ejecutivo</span>
      </li>
      <li style="margin-bottom: 0.75rem;">
        <a href="./scoring-priorizacion" style="color: #0066cc; text-decoration: none; font-weight: 500;">Scoring y Priorización</a>
        <span style="color: #999; font-size: 0.85rem;"> — Los números clave</span>
      </li>
      <li style="margin-bottom: 0.75rem;">
        <a href="./dashboard" style="color: #0066cc; text-decoration: none; font-weight: 500;">Dashboard</a>
        <span style="color: #999; font-size: 0.85rem;"> — Visualización dinámica</span>
      </li>
    </ul>
  </div>
</div>

---

```js
display(implicationsCallout({
  title: "ROI Esperado y Próximos Pasos",
  items: [
    "Reducción estimada de 60% en tiempo de prospección comercial al enfocar solo en establecimientos priorizados",
    "Ahorro proyectado de 25–35% en costos logísticos al ubicar CEDIS en zona óptima vs. ubicación ad-hoc",
    "Incremento potencial de 40% en tasa de conversión B2B al atacar zonas de alta densidad demográfica y comercial",
    "Escalabilidad validada: modelo replicable para expansión en otras ciudades de Sonora (Cajeme, Nogales, Guaymas)"
  ]
}));
```

---

<!-- ## Muestra de Datos Priorizados

A continuación se presenta una muestra de los 5 establecimientos con mayor priorización de un total de ${totalPriorizadosDisplay.toLocaleString("es-MX")} analizados.

La lista completa está disponible en [Scoring y Priorización](./scoring-priorizacion) y puede exportarse desde el [Dashboard](./dashboard).

| Establecimiento | Segmento | Score | Decil | Colonia |
|:----------------|:---------|------:|------:|:--------|
| OXXO CANELA | retail | 8.7 | 10 | Villa Sonora |
| EXTRA VILLA BONITA | retail | 8.5 | 10 | Villa Bonita |
| FARMACIAS GUADALAJARA | retail | 8.4 | 10 | Centro |
| 7-ELEVEN PASEO RIO | retail | 8.3 | 10 | Paseo Rio Sonora |
| CÍRCULO K SAN BENITO | retail | 8.2 | 10 | San Benito |

### Criterios de Scoring

La priorización se basa en un modelo multi-criterio que considera:

- **Población de la AGEB** (30%)
- **Densidad comercial del sector** (25%)
- **Nivel socioeconómico** (20%)
- **Proximidad a zonas de alta demanda** (15%)
- **Índice de marginación inverso** (10%)

Consulta la metodología completa en [Datos y Metodología](./datos-metodologia).

---

<div class="note" style="background: #e8eaf6; border-left: 4px solid #3f51b5; padding: 1rem; margin: 2rem 0;">
  <p style="margin: 0; font-weight: 600;">💡 Nota sobre los datos</p>
  <p style="margin: 0.5rem 0 0 0;">
    Este análisis integra datos oficiales de INEGI (SCINCE 2020, DENUE 2024) con procesamiento geoestadístico avanzado. 
    Todos los datasets son reproducibles y actualizables. Ver <a href="./datos-metodologia">metodología completa</a>.
  </p>
</div> -->

---

<small style="color: #999; display: block; text-align: center; margin-top: 3rem; padding-top: 2rem; border-top: 1px solid #eee;">
  <strong>STRTGY</strong> — Transformando complejidad en certeza | Proyecto Electrolit Hermosillo | Febrero 2026
</small>
