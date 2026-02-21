---
title: 6) Logística y Sonora
toc: true
---

```js
import {sectionHeader, decisionCallout, implicationsCallout, roiMetric} from "./components/brand.js";
import {kpi, formatNumber, table} from "./components/ui.js";

// Cobertura real desde top10_logistica (HERE isócronas 5/10 min); fallback a top10_cedis. Total Top 400 desde datos.
const top400Geo = await FileAttachment("data/top400.web.geojson").json().catch(() => null);
const totalTop400 = top400Geo?.features?.length ?? 400;
let top10hubs = [];
try {
  const logistica = await FileAttachment("data/top10_logistica.web.csv").csv({typed: true});
  if (logistica && logistica.length > 0 && "coverage_10min" in logistica[0]) {
    top10hubs = logistica.map(h => ({
      ...h,
      coverage_5min: h.coverage_5min != null ? Number(h.coverage_5min) : null,
      coverage_10min: h.coverage_10min != null ? Number(h.coverage_10min) : null,
      businesses_5min: h.businesses_5min != null ? Number(h.businesses_5min) : null,
      businesses_10min: h.businesses_10min != null ? Number(h.businesses_10min) : null,
      score_logistico: h.score_adjusted != null ? Number(h.score_adjusted) : h.score
    }));
  }
} catch (_) {}
if (top10hubs.length === 0) {
  const top10cedis = await FileAttachment("data/top10_cedis.web.csv").csv({typed: true});
  const hasCoverage = top10cedis?.[0] && ("coverage_10min" in top10cedis[0] || "customers_10km" in top10cedis[0]);
  if (top10cedis && hasCoverage) {
    top10hubs = top10cedis.map(h => {
      const cov10 = h.coverage_10min != null ? Number(h.coverage_10min) : (totalTop400 > 0 ? (h.customers_10km / totalTop400 * 100) : null);
      const cov5 = h.coverage_5min != null ? Number(h.coverage_5min) : (totalTop400 > 0 ? (h.customers_5km / totalTop400 * 100) : null);
      return { ...h, coverage_5min: cov5, coverage_10min: cov10, score_logistico: h.score };
    });
  } else {
    top10hubs = (top10cedis || []).map(h => ({
      ...h,
      coverage_10min: null,
      coverage_5min: null,
      score_logistico: h.score
    }));
  }
}
```

```js
display(sectionHeader({
  title: "Logística y Expansión a Sonora",
  subtitle: "Análisis de cobertura territorial, ubicación óptima de CEDIS y estrategia de expansión regional"
}));
```

```js
display(decisionCallout({
  title: "¿Qué decidir con este análisis?",
  items: [
    "Aprobar inversión en CEDIS en Hermosillo (ubicación específica del top 3) o diferir hasta validar demanda",
    "Definir si Hermosillo consolida antes de expandir, o si se ataca Sonora en paralelo con modelo de micro-hubs",
    "Evaluar opciones de distribución desde Hermosillo a ciudades secundarias (Cajeme, Nogales) vs. hubs regionales independientes",
    "Determinar el modelo operativo: flota propia, 3PL (third-party logistics), o híbrido"
  ]
}));
```

---

## 6.1. Estrategia Logística para Hermosillo

### Hub Único vs. Micro-Hubs

**Análisis de Cobertura:**

```js
// Mejor hub por cobertura 10 min (datos HERE) o primer registro
const withCov = top10hubs.filter(h => h.coverage_10min != null);
const hubOptimo = withCov.length > 0
  ? withCov.reduce((a, b) => (a.coverage_10min >= b.coverage_10min ? a : b))
  : top10hubs[0];
const cobertura10Real = hubOptimo?.coverage_10min != null ? Number(hubOptimo.coverage_10min) : null;
const cobertura5Real = hubOptimo?.coverage_5min != null ? Number(hubOptimo.coverage_5min) : null;
const negocios10 = hubOptimo?.businesses_10min != null ? Number(hubOptimo.businesses_10min) : null;
const datosReales = cobertura10Real != null;

function createMetricCard(value, label, desc, isEstimated = false) {
  const card = document.createElement("div");
  card.style.cssText = "background: linear-gradient(135deg, #e3f2fd 0%, white 100%); padding: 2rem; border-radius: 10px; text-align: center; border: 2px solid #1976d2;";
  const valueDiv = document.createElement("div");
  valueDiv.style.cssText = "font-size: 2.5rem; font-weight: 700; color: #1565c0; margin-bottom: 0.5rem;";
  valueDiv.textContent = value;
  const labelDiv = document.createElement("div");
  labelDiv.style.cssText = "font-weight: 600; margin-bottom: 0.25rem;";
  labelDiv.textContent = label + (isEstimated ? " (estimado)" : "");
  const descDiv = document.createElement("div");
  descDiv.style.cssText = "font-size: 0.875rem; color: #666;";
  descDiv.textContent = desc;
  card.append(valueDiv, labelDiv, descDiv);
  return card;
}

const metricsContainer = document.createElement("div");
metricsContainer.className = "grid grid-cols-3";
metricsContainer.style.gap = "1.5rem";

const labelCobertura = datosReales ? "Cobertura 10 min (HERE API)" : "Cobertura 30 min";
const valueCobertura = datosReales
  ? `${cobertura10Real.toFixed(1)}%`
  : "—";
const descCobertura = datosReales
  ? "de Top 400 en 10 min (isócronas)"
  : "sin datos de isócronas; ver Mapas > Isócronas";
metricsContainer.appendChild(createMetricCard(valueCobertura, labelCobertura, descCobertura, !datosReales));

const tiempoLabel = datosReales ? "Negocios en 10 min" : "Tiempo prom.";
const tiempoValue = datosReales && negocios10 != null ? formatNumber(negocios10) : (datosReales ? "—" : "~12 min (estimado)");
const tiempoDesc = datosReales ? "establecimientos cubiertos desde hub óptimo" : "desde hub óptimo a clientes";
metricsContainer.appendChild(createMetricCard(tiempoValue, tiempoLabel, tiempoDesc, !datosReales && tiempoValue.includes("estimado")));

metricsContainer.appendChild(createMetricCard(
  "~20 km",
  "Radio Efectivo",
  "estimado; 40 km/h promedio (no medido)",
  true
));

display(metricsContainer);

const conclusionHeading = document.createElement("p");
conclusionHeading.innerHTML = "<strong>Conclusión:</strong>";
conclusionHeading.style.marginTop = "1.5rem";
conclusionHeading.style.marginBottom = "0.5rem";
display(conclusionHeading);
const conclusionText = datosReales
  ? `Con **${cobertura10Real.toFixed(1)}% de cobertura en 10 min (HERE API)** desde el hub óptimo, **no se justifica la inversión en micro-hubs zonales** en Hermosillo en Fase 1.${negocios10 != null ? ` El hub con mayor cobertura alcanza ${negocios10} establecimientos del Top 400 en 10 min.` : ""}`
  : "Con **cobertura estimada** desde un solo hub, **no se justifica la inversión en micro-hubs zonales** en Hermosillo en Fase 1. Los establecimientos fuera de cobertura son en su mayoría periféricos (deciles <6).";
const conclusionEl = document.createElement("p");
conclusionEl.innerHTML = conclusionText;
display(conclusionEl);
```

---

### Modelo de Distribución Recomendado

**Frecuencia de entrega:**
- **Retail (Tiendas, farmacias):** 2–3 veces por semana
- **HORECA (Restaurantes, hoteles):** 1–2 veces por semana (pedidos más grandes, menor frecuencia)
- **Institucional (Gimnasios, clínicas):** 1 vez por semana o quincenal

**Ventanas horarias:**
- Retail: 8:00 AM – 12:00 PM (evitar horas pico de venta)
- HORECA: 10:00 AM – 3:00 PM (antes del servicio de comida/cena)

**Capacidad de flota estimada:**
- 2–3 vehículos tipo panel (1.5 ton) para Hermosillo
- 1 vehículo adicional para expansión a zona metropolitana (Bahía de Kino, Carbó)

---

## 6.2. Expansión a Nivel Sonora

### Ciudades Prioritarias

```js
const ciudadesSonora = [
  {ciudad: "Hermosillo", pob: 936000, dist_hmo: 0, potencial: "ALTA", estrategia: "Hub principal (CEDIS)"},
  {ciudad: "Cajeme (Cd. Obregón)", pob: 436000, dist_hmo: 210, potencial: "ALTA", estrategia: "Distribución desde Hermosillo o micro-hub"},
  {ciudad: "Nogales", pob: 264000, dist_hmo: 280, potencial: "MEDIA", estrategia: "Distribución desde Hermosillo 1x/semana"},
  {ciudad: "Guaymas", pob: 149000, dist_hmo: 130, potencial: "MEDIA", estrategia: "Ruta desde Hermosillo"},
  {ciudad: "Navojoa", pob: 164000, dist_hmo: 300, potencial: "BAJA", estrategia: "Fase 2 (post-consolidación)"},
  {ciudad: "San Luis Río Colorado", pob: 205000, dist_hmo: 300, potencial: "BAJA", estrategia: "Fase 2"}
];

// Helper para crear badge de potencial
function createPotencialBadge(potencial) {
  const colors = {
    ALTA: {bg: "#c8e6c9", color: "#2e7d32"},
    MEDIA: {bg: "#fff9c4", color: "#f57f17"},
    BAJA: {bg: "#ffccbc", color: "#d84315"}
  };
  const style = colors[potencial] || colors.BAJA;
  const badge = document.createElement("span");
  badge.style.cssText = `padding: 4px 10px; border-radius: 12px; font-weight: 600; background: ${style.bg}; color: ${style.color};`;
  badge.textContent = potencial;
  return badge;
}

const cardCiudades = document.createElement("div");
cardCiudades.className = "card";

const h3 = document.createElement("h3");
h3.textContent = "Priorización de Ciudades en Sonora";
cardCiudades.appendChild(h3);

cardCiudades.appendChild(table(ciudadesSonora, [
  {key: "ciudad", label: "Ciudad"},
  {key: "pob", label: "Población", format: v => formatNumber(v)},
  {key: "dist_hmo", label: "Distancia HMO (km)", format: v => v === 0 ? "—" : formatNumber(v)},
  {key: "potencial", label: "Potencial", format: v => createPotencialBadge(v)},
  {key: "estrategia", label: "Estrategia Logística"}
], {sortable: false}));

const nota = document.createElement("p");
nota.style.cssText = "margin-top: 1rem; font-size: 0.85rem; color: #999; font-style: italic;";
nota.textContent = "*Potencial estimado por tamaño de población, perfil económico y competitividad del mercado local.";
cardCiudades.appendChild(nota);

display(cardCiudades);
```

---

### Escenarios de Expansión

#### Escenario 1: Hub Único en Hermosillo (Conservador)

**Descripción:**  
Toda la distribución de Sonora se maneja desde CEDIS en Hermosillo, con rutas regionales 1–2 veces por semana a ciudades secundarias.

**Ventajas:**
- Menor inversión inicial (1 CEDIS)
- Mayor control operativo
- Economías de escala en inventario

**Desventajas:**
- Tiempos de entrega largos a ciudades lejanas (Nogales: 3h, Cajeme: 2.5h)
- Mayor costo de combustible y depreciación de flota
- Menor flexibilidad para pedidos urgentes

**Recomendación:** ✅ Para **Fase 1 (Año 1)**

---

#### Escenario 2: Hub Hermosillo + Micro-Hub en Cajeme (Agresivo)

**Descripción:**  
CEDIS principal en Hermosillo + mini-almacén en Ciudad Obregón para servir el sur de Sonora (Cajeme, Guaymas, Navojoa).

**Ventajas:**
- Cobertura más rápida del sur de Sonora (2da ciudad más grande del estado)
- Potencial de alianzas con distribuidores locales en Cajeme

**Desventajas:**
- Duplicación de costos fijos (renta, personal) en 2 ubicaciones
- Complejidad de gestión de inventario multi-ubicación
- Requiere volumen significativo para justificar ROI

**Recomendación:** ⚠️ Considerar solo cuando la operación en Hermosillo esté consolidada y exista demanda comprobada en el sur de Sonora

---

#### Escenario 3: Modelo Híbrido con 3PL (Pragmático)

**Descripción:**  
CEDIS propio en Hermosillo + subcontratación de distribución regional a operador logístico local (3PL) con flota establecida.

**Ventajas:**
- Cero inversión en micro-hubs
- Flexibilidad para escalar sin comprometer capital
- 3PL asume riesgo operativo de rutas regionales

**Desventajas:**
- Menor margen por comisión de 3PL (típicamente 15–25%)
- Menor control de calidad de servicio
- Dependencia de proveedor externo

**Recomendación:** ✅ Para **rutas esporádicas** (Nogales, Navojoa) en expansión regional

---

```js
const coberturaFrase = (typeof datosReales !== "undefined" && datosReales && typeof cobertura10Real === "number")
  ? `Cobertura ${cobertura10Real.toFixed(1)}% en 10 min (HERE API) con un solo CEDIS`
  : "Cobertura estimada con un solo CEDIS (ver métricas arriba)";
display(implicationsCallout({
  title: "Decisiones Clave de Logística",
  items: [
    `**Hub único en Hermosillo es suficiente para Fase 1:** ${coberturaFrase}. Diferir micro-hubs hasta validar demanda regional.`,
    "**Modelo híbrido para expansión:** Usar 3PL para rutas esporádicas a Nogales/Navojoa mientras se valida volumen. Si demanda sostiene >$500K/mes en Cajeme, considerar micro-hub.",
    "**Flota propia vs. outsourcing:** Flota propia recomendada para Hermosillo (control + menor costo/km). 3PL para rutas regionales largas (>200 km) donde frecuencia es baja."
  ]
}));
```

---

## Próximos Pasos

- **[Dashboard Interactivo](./dashboard)** — Filtrar establecimientos por zona y exportar listas para ruteo
- **[Hubs Logísticos](./mapas/hubs)** — Explorar ubicaciones candidatas con análisis de cobertura detallado

---

<small style="color: #999;">
  <strong>Sección:</strong> 6 de 7 | <strong>Anterior:</strong> <a href="./scoring-priorizacion">5) Scoring y Priorización</a> | <strong>Siguiente:</strong> <a href="./dashboard">7) Dashboard</a>
</small>
