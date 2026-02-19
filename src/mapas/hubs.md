---
title: 🚚 Hubs Logísticos
toc: false
---

```js
import {sectionHeader, decisionCallout, implicationsCallout} from "../components/brand.js";
import {kpi, formatNumber, table} from "../components/ui.js";
import {createBaseMap, addGeoJsonLayer, createMarker, createCircle, createLegend, fitBounds} from "../components/maps.js";
import {normalizeIsochronesWithHubId} from "../data/loaders.js";

// Cargar datos (isocronas 5/10/15 con business_count)
// top10_cedis = merge top10_hubs + top10_logistica (businesses_5min, businesses_10min, score_adjusted)
let top10hubsRaw = [];
try {
  const cedis = await FileAttachment("../data/top10_cedis.web.csv").csv({typed: true});
  if (Array.isArray(cedis) && cedis.length > 0) top10hubsRaw = cedis;
} catch (_) {}
if (top10hubsRaw.length === 0) {
  top10hubsRaw = await FileAttachment("../data/top10_hubs.web.csv").csv({typed: true});
}
const top400 = await FileAttachment("../data/top400.web.geojson").json();
const agebs = await FileAttachment("../data/agebs_base.web.geojson").json();
const isocronas515 = await FileAttachment("../data/isocronas_5_10_15.web.geojson").json();
const hubIsochrones = normalizeIsochronesWithHubId(isocronas515 ?? { type: "FeatureCollection", features: [] });
```

```js
// Normalizar y enriquecer datos de hubs; alinear posición y cobertura con isócronas
const totalTop400 = top400?.features?.length ?? 400;
const isoFeatures = hubIsochrones?.features ?? [];

const top10hubs = (Array.isArray(top10hubsRaw) && top10hubsRaw.length > 0 
  ? top10hubsRaw 
  : []
).map((hub, idx) => {
  const ranking = hub.ranking ?? hub.rank ?? (idx + 1);
  const ranking_adjusted = hub.ranking_adjusted ?? ranking;
  let lat = hub.latitud ?? hub.latitude ?? hub.lat ?? null;
  let lon = hub.longitud ?? hub.longitude ?? hub.lon ?? null;
  const nombre = hub.nombre ?? hub.name ?? `Hub ${ranking}`;
  let businesses_5min = Number(hub.businesses_5min) || 0;
  let businesses_10min = Number(hub.businesses_10min) || 0;
  const score_original = Number(hub.score) || Number(hub.score_logistico) || 0;
  let score_adjusted = Number(hub.score_adjusted) || score_original;

  // Mismo origen que las isócronas: marcador sobre el centro del polígono
  const firstIso = isoFeatures.find(f => f.properties?.hub_id === ranking);
  if (firstIso?.properties) {
    if (firstIso.properties.origin_lat != null && firstIso.properties.origin_lon != null) {
      lat = firstIso.properties.origin_lat;
      lon = firstIso.properties.origin_lon;
    }
    if (!businesses_5min || !businesses_10min) {
      const iso5 = isoFeatures.find(f => f.properties?.hub_id === ranking && f.properties?.time_minutes === 5);
      const iso10 = isoFeatures.find(f => f.properties?.hub_id === ranking && f.properties?.time_minutes === 10);
      if (iso5?.properties?.business_count != null) businesses_5min = Number(iso5.properties.business_count);
      if (iso10?.properties?.business_count != null) businesses_10min = Number(iso10.properties.business_count);
    }
  }
  const coverage_5min = Number(hub.coverage_5min) ?? (businesses_5min / totalTop400 * 100);
  const coverage_10min = Number(hub.coverage_10min) ?? (businesses_10min / totalTop400 * 100);
  
  return {
    ranking,
    ranking_adjusted,
    nombre,
    lat,
    lon,
    latitud: lat,
    longitud: lon,
    businesses_5min,
    businesses_10min,
    coverage_5min,
    coverage_10min,
    score_original,
    score_adjusted,
    cobertura_30min: coverage_10min / 100,
    tiempo_prom_min: null,
    score_logistico: score_original
  };
});

// Ordenar por score ajustado (mayor primero)
const top10hubsSorted = [...top10hubs].sort((a, b) => b.score_adjusted - a.score_adjusted);
```

```js
display(sectionHeader({
  title: "Top 10 Ubicaciones Óptimas para Hub Logístico (CEDIS)",
  subtitle: "Análisis espacial de cobertura y accesibilidad para centro de distribución",
  certainty: "medium"
}));
```

```js
display(decisionCallout({
  title: "¿Qué decidir con este análisis?",
  items: [
    "Seleccionar entre las 3–5 ubicaciones top para evaluación de campo (disponibilidad, costo de renta, infraestructura)",
    "Evaluar trade-off entre cobertura territorial (% de clientes en <30 min) y costo de ubicación",
    "Definir si un solo hub es suficiente para Hermosillo o se requieren micro-hubs zonales",
    "Validar accesibilidad a vías primarias y restricciones de tráfico pesado en horarios pico"
  ]
}));
```

---

## Top 10 Ubicaciones Priorizadas (Score Ajustado por Cobertura)

```js
display(html`
  <div class="card">
    <h3>Ranking de Ubicaciones para CEDIS</h3>
    <p style="color: #666; font-size: 0.9rem; margin-bottom: 1rem;">
      <strong>Score Ajustado</strong> = 40% score original + 35% cobertura 5 min + 25% cobertura 10 min.<br>
      Cobertura calculada con <strong>isócronas reales HERE API</strong> (red vial + tráfico).
    </p>
    ${table(
      top10hubsSorted,
      [
        {key: "ranking_adjusted", label: "# Adj", format: (v) => `<strong style="font-size: 1.1rem; color: #2e7d32;">${v ?? "—"}</strong>`},
        {key: "ranking", label: "# Orig", format: (v) => `<span style="color: #999;">${v ?? "—"}</span>`},
        {key: "nombre", label: "Referencia", format: (v) => v || "Sin nombre"},
        {key: "businesses_5min", label: "5 min", format: (v) => v != null ? `<strong>${v}</strong>` : "—"},
        {key: "businesses_10min", label: "10 min", format: (v) => v != null ? `<strong style="color: #1565c0;">${v}</strong>` : "—"},
        {key: "coverage_10min", label: "Cobertura", format: (v) => v != null ? `${v.toFixed(1)}%` : "N/A"},
        {key: "score_original", label: "Score Orig", format: (v) => v != null ? v.toFixed(1) : "—"},
        {key: "score_adjusted", label: "Score Adj", format: (v) => v != null ? `<strong style="color: #2e7d32;">${v.toFixed(2)}</strong>` : "—"}
      ],
      {sortable: true, exportable: true}
    )}
    <p style="margin-top: 1rem; font-size: 0.85rem; color: #666;">
      <strong>5 min / 10 min:</strong> # de establecimientos Top 400 cubiertos en cada isócrona.<br>
      <strong>Cobertura:</strong> % del total de 400 establecimientos alcanzables en 10 minutos.
    </p>
  </div>
`);
```

---

## Mapa de Cobertura por Hub

### Controles del Mapa

<div class="grid grid-cols-2" style="gap: 1rem; margin-bottom: 1rem;">

```js
// Selector basado en ranking_adjusted para mostrar en orden de mejor a peor
// Pero usamos ranking original (hub.ranking) para filtrar isócronas
const hubSeleccionado = view(Inputs.select(
  [null, ...top10hubsSorted],
  {
    label: "Ver Hub #",
    format: (hub) => {
      if (hub === null) return "Mostrar todos";
      return `#${hub.ranking_adjusted} (orig #${hub.ranking}) - ${hub.nombre}`;
    },
    value: top10hubsSorted[0] // Por defecto el mejor hub
  }
));
```

```js
const tiempoIsocronaMin = view(Inputs.select([5, 10, 15], {
  label: "Tiempo de isócrona (minutos)",
  value: 5
}));
```

</div>

```js
const mostrarEstablecimientos = view(Inputs.toggle({
  label: "Mostrar establecimientos Top 400",
  value: true
}));
```

```js
// hubSeleccionado ahora es el objeto hub o null (mostrar todos)
const hubActual = hubSeleccionado;
const hubsAMostrar = hubActual ? [hubActual] : top10hubsSorted;

// hub_id para filtrar isócronas (usa ranking ORIGINAL, no el ajustado)
const hubIdParaIsocrona = hubActual ? hubActual.ranking : null;
```

```js
// Filtrar isócronas para el hub y tiempo seleccionados (hub_id = origin_id = ranking original)
const isochronasFiltradas = hubIsochrones.features.filter(f => {
  const props = f.properties;
  const matchTime = props.time_minutes === tiempoIsocronaMin;
  if (hubIdParaIsocrona === null) return matchTime;
  return matchTime && props.hub_id === hubIdParaIsocrona;
});

// Métricas (business_count desde isocronas_5_10_15; area_km2 puede no existir)
const areaTotalKm2 = isochronasFiltradas.reduce((sum, f) => sum + (f.properties.area_km2 || 0), 0);
const negociosTotales = isochronasFiltradas.reduce((sum, f) => sum + (f.properties.business_count || 0), 0);
```

```js
if (hubActual) {
  const isoHub = isochronasFiltradas.find(f => f.properties.hub_id === hubIdParaIsocrona);
  const areaIsochrone = isoHub?.properties?.area_km2;
  const bizCount = isoHub?.properties?.business_count ?? 0;
  
  display(
    kpi([
      {
        label: `Negocios en ${tiempoIsocronaMin} min`,
        value: `${bizCount}`,
        format: null,
        color: "#2e7d32"
      },
      {
        label: `Área ${tiempoIsocronaMin} min`,
        value: areaIsochrone != null ? `${areaIsochrone.toFixed(1)} km²` : "—",
        format: null
      },
      {
        label: "Score Ajustado",
        value: hubActual.score_adjusted != null ? hubActual.score_adjusted.toFixed(2) : "N/A",
        format: null,
        color: "#1565c0"
      },
      {
        label: "Ranking Ajustado",
        value: `#${hubActual.ranking_adjusted} (era #${hubActual.ranking})`,
        format: null
      }
    ])
  );
} else {
  // Mostrar KPIs agregados cuando se muestran todos los hubs
  display(
    kpi([
      {
        label: `Negocios en ${tiempoIsocronaMin} min`,
        value: `${negociosTotales} (suma)`,
        format: null,
        color: "#2e7d32"
      },
      {
        label: `Área total ${tiempoIsocronaMin} min`,
        value: `${areaTotalKm2.toFixed(1)} km²`,
        format: null
      },
      {
        label: "Hubs mostrados",
        value: `${hubsAMostrar.length} de 10`,
        format: null
      },
      {
        label: "Fuente",
        value: "HERE API",
        format: null
      }
    ])
  );
}
```

```js
const mapContainer = display(document.createElement("div"));
mapContainer.style.height = "600px";
mapContainer.style.width = "100%";
mapContainer.style.borderRadius = "8px";
mapContainer.style.overflow = "hidden";
mapContainer.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)";

const map = createBaseMap(mapContainer, {
  center: [29.0729, -110.9559],
  zoom: hubActual === null ? 12 : 13
});

// AGEBs base
addGeoJsonLayer(map, agebs, {
  style: () => ({
    fillColor: "#f5f5f5",
    color: "#ccc",
    weight: 1,
    opacity: 0.3,
    fillOpacity: 0.05
  })
});

// Isócronas reales de HERE (primero para que queden debajo)
const isoGeoJson = {
  type: "FeatureCollection",
  features: isochronasFiltradas
};

// Colores para isócronas por tiempo
const isoColors = { 5: "#fbc02d", 10: "#f9a825", 15: "#e65100" };

addGeoJsonLayer(map, isoGeoJson, {
  style: (feature) => {
    const hubId = feature.properties.hub_id;
    const time = feature.properties.time_minutes;
    const isSelected = hubIdParaIsocrona === null || hubId === hubIdParaIsocrona;
    // Buscar el ranking ajustado para este hub
    const hubData = top10hubs.find(h => h.ranking === hubId);
    const isTopAdjusted = hubData?.ranking_adjusted === 1;
    return {
      fillColor: isoColors[time] || "#ff9800",
      color: isTopAdjusted ? "#2e7d32" : "#f57c00",
      weight: isSelected ? 2 : 1,
      opacity: isSelected ? 0.8 : 0.4,
      fillOpacity: isSelected ? 0.25 : 0.1
    };
  },
  popupContent: (props) => {
    const bizCount = props.business_count ?? 0;
    const coverage = (bizCount / totalTop400 * 100).toFixed(1);
    // Buscar datos del hub para mostrar ranking ajustado
    const hubData = top10hubs.find(h => h.ranking === props.hub_id);
    const rankAdj = hubData?.ranking_adjusted ?? "?";
    return `
      <div style="font-family: system-ui, sans-serif;">
        <h4 style="margin: 0 0 8px 0; color: #f57c00;">Isócrona Hub #${rankAdj} <span style="color: #999; font-size: 0.85rem;">(orig #${props.hub_id})</span></h4>
        <div style="font-size: 0.9rem;">
          <strong>Tiempo:</strong> ${props.time_minutes} minutos<br>
          <strong>Área:</strong> ${props.area_km2 != null ? props.area_km2.toFixed(2) + " km²" : "—"}<br>
          <strong style="color: #2e7d32;">Negocios cubiertos:</strong> ${bizCount} (${coverage}%)<br>
          <span style="color: #666; font-size: 0.85rem;">Fuente: HERE API (tráfico real)</span>
        </div>
      </div>
    `;
  }
});

// Establecimientos Top 400 (opcional)
if (mostrarEstablecimientos) {
  addGeoJsonLayer(map, top400, {
    pointToLayer: (feature, latlng) => {
      return L.circleMarker(latlng, {
        radius: 4,
        fillColor: "#90caf9",
        color: "#1976d2",
        weight: 1,
        opacity: 0.8,
        fillOpacity: 0.6
      });
    },
    popupContent: (props) => `
      <div style="font-family: system-ui, sans-serif;">
        <h4 style="margin: 0 0 6px 0; color: #1976d2; font-size: 0.95rem;">${props.nom_estab || "Sin nombre"}</h4>
        <div style="font-size: 0.85rem; color: #666;">
          ${props.segmento ? `Segmento: ${props.segmento}<br>` : ""}
          ${props.colonia ? `Colonia: ${props.colonia}` : ""}
        </div>
      </div>
    `
  });
}

// Markers de Hubs
hubsAMostrar.forEach((hub, idx) => {
  const latlng = [hub.lat ?? hub.latitud, hub.lon ?? hub.longitud];
  
  // Marker del hub
  const isTopAdjusted = hub.ranking_adjusted === 1;
  const marker = createMarker(latlng, {
    type: "hub",
    color: hubActual === null ? (isTopAdjusted ? "#2e7d32" : "#ff9800") : "#2e7d32",
    icon: "🚚",
    size: 32
  }).addTo(map);
  
  const rankChange = hub.ranking - hub.ranking_adjusted;
  const rankChangeStr = rankChange > 0 ? `↑${rankChange}` : rankChange < 0 ? `↓${Math.abs(rankChange)}` : "";
  const rankChangeColor = rankChange > 0 ? "#2e7d32" : "#d32f2f";
  
  marker.bindPopup(`
    <div style="font-family: system-ui, sans-serif; min-width: 180px;">
      <h4 style="margin: 0 0 8px 0; color: #2e7d32; font-size: 1rem;">
        Hub #${hub.ranking_adjusted ?? "—"}
        ${rankChange !== 0 ? `<span style="color: ${rankChangeColor}; font-size: 0.85rem;">(orig #${hub.ranking} ${rankChangeStr})</span>` : ''}
      </h4>
      <div style="font-size: 0.9rem;">
        <strong>${hub.nombre || "Sin nombre"}</strong>
        <hr style="margin: 8px 0; border: 0; border-top: 1px solid #eee;">
        <div style="color: #1565c0;">
          📍 5 min: <strong>${hub.businesses_5min ?? 0}</strong> negocios<br>
          🚚 10 min: <strong>${hub.businesses_10min ?? 0}</strong> negocios
        </div>
        <div style="margin-top: 6px; color: #666; font-size: 0.85rem;">
          Cobertura: ${hub.coverage_10min?.toFixed(1) ?? "N/A"}%<br>
          Score Adj: <strong>${hub.score_adjusted?.toFixed(2) ?? "N/A"}</strong>
        </div>
      </div>
    </div>
  `);
  
  if (hubActual !== null) {
    marker.openPopup();
  }
});

// Leyenda actualizada con isócronas y cobertura
const legendItems = [
  {type: "header", label: "Hubs (Ranking Ajustado)"},
  {type: "circle", color: "#2e7d32", label: hubActual === null ? "Hub #1 (óptimo)" : "Hub Seleccionado"},
  {type: "circle", color: "#ff9800", label: hubActual === null ? "Hubs alternos" : "—"},
  {type: "separator"},
  {type: "header", label: `Isócronas (${tiempoIsocronaMin} min)`},
  {type: "square", color: isoColors[tiempoIsocronaMin] || "#ff9800", label: `Área alcanzable en ${tiempoIsocronaMin} min`},
  {type: "separator"},
  {type: "header", label: "Cobertura"},
  {type: "circle", color: "#90caf9", label: mostrarEstablecimientos ? "Establecimientos Top 400" : "—"}
].filter(item => item.label !== "—");

createLegend(map, legendItems, {
  position: "bottomright",
  title: "Score Ajustado + HERE API"
});
```

---

## Comparativa de los Top 3 Hubs (Ranking Ajustado)

```js
// Ordenar por score ajustado y tomar top 3
const top3 = [...top10hubs].sort((a, b) => b.score_adjusted - a.score_adjusted).slice(0, 3);

// Crear contenedor grid
const gridContainer = document.createElement("div");
gridContainer.className = "grid grid-cols-3";
gridContainer.style.cssText = "gap: 1rem; margin: 2rem 0;";

// Crear tarjetas para cada hub
top3.forEach((hub, idx) => {
  const card = document.createElement("div");
  card.className = "card";
  const isTop = idx === 0;
  card.style.cssText = `background: linear-gradient(135deg, ${isTop ? '#e8f5e9' : '#f5f5f5'} 0%, white 100%); border: 2px solid ${isTop ? '#2e7d32' : '#e0e0e0'};`;
  
  const biz5 = hub.businesses_5min ?? 0;
  const biz10 = hub.businesses_10min ?? 0;
  const cov10 = hub.coverage_10min != null ? hub.coverage_10min.toFixed(1) : "N/A";
  const scoreAdj = hub.score_adjusted != null ? hub.score_adjusted.toFixed(2) : "N/A";
  const scoreOrig = hub.score_original != null ? hub.score_original.toFixed(1) : "N/A";
  const latStr = hub.lat != null ? hub.lat.toFixed(4) : "N/A";
  const lonStr = hub.lon != null ? hub.lon.toFixed(4) : "N/A";
  
  // Cambio de ranking
  const rankChange = hub.ranking - hub.ranking_adjusted;
  const rankChangeStr = rankChange > 0 ? `↑${rankChange}` : rankChange < 0 ? `↓${Math.abs(rankChange)}` : "=";
  const rankChangeColor = rankChange > 0 ? "#2e7d32" : rankChange < 0 ? "#d32f2f" : "#666";
  
  card.innerHTML = `
    <div style="text-align: center; padding: 0.5rem 0;">
      <div style="font-size: 2.5rem; font-weight: 700; color: ${isTop ? '#2e7d32' : '#1565c0'};">#${hub.ranking_adjusted ?? "—"}</div>
      <div style="font-size: 0.9rem; color: #666; margin-bottom: 0.5rem;">
        (Orig: #${hub.ranking} <span style="color: ${rankChangeColor}; font-weight: 600;">${rankChangeStr}</span>)
      </div>
      <h4 style="margin: 0.5rem 0; font-size: 1.1rem;">${hub.nombre || "Sin nombre"}</h4>
      ${isTop ? '<div style="background: #2e7d32; color: white; padding: 4px 12px; border-radius: 12px; display: inline-block; font-size: 0.8rem; font-weight: 600; margin-bottom: 1rem;">🎯 ÓPTIMO</div>' : ''}
    </div>
    <hr style="border: 0; border-top: 1px solid #e0e0e0; margin: 1rem 0;">
    <div style="font-size: 0.9rem;">
      <div style="margin: 8px 0;">
        <strong>Negocios Cubiertos:</strong><br>
        <span style="font-size: 1.1rem; color: #1565c0;">📍 5 min: <strong>${biz5}</strong></span><br>
        <span style="font-size: 1.3rem; color: #2e7d32;">🚚 10 min: <strong>${biz10}</strong></span>
      </div>
      <div style="margin: 8px 0;">
        <strong>Cobertura (10 min):</strong> ${cov10}% de Top 400
      </div>
      <div style="margin: 8px 0; display: flex; justify-content: space-between;">
        <span><strong>Score Orig:</strong> ${scoreOrig}</span>
        <span style="color: #2e7d32;"><strong>Adj:</strong> ${scoreAdj}</span>
      </div>
      <div style="margin: 8px 0; color: #666; font-size: 0.85rem;">
        📍 ${latStr}, ${lonStr}
      </div>
    </div>
  `;
  
  gridContainer.appendChild(card);
});

display(gridContainer);
```

---

```js
// Obtener hub óptimo (mejor score ajustado)
const hubOptimo = [...top10hubs].sort((a, b) => b.score_adjusted - a.score_adjusted)[0];

display(implicationsCallout({
  title: "Implicaciones del Score Ajustado por Cobertura",
  items: [
    `**Hub óptimo (Rank Adj. #1):** Cubre ${hubOptimo?.businesses_10min ?? "N/A"} negocios en 10 min (${hubOptimo?.coverage_10min?.toFixed(1) ?? "N/A"}%). Score ajustado: ${hubOptimo?.score_adjusted?.toFixed(2) ?? "N/A"} (original: ${hubOptimo?.score_original?.toFixed(1) ?? "N/A"}).`,
    "**El score ajustado reordena hubs:** Ubicaciones con mejor acceso real a clientes suben en el ranking, aunque su score original de idoneidad fuera menor.",
    "**Fórmula:** 40% score original (idoneidad del terreno) + 35% cobertura 5 min (entregas inmediatas) + 25% cobertura 10 min (alcance logístico).",
    "**Validación de campo crítica:** Las isócronas HERE consideran tráfico promedio. Validar con pilotos en horarios pico (8–10 AM, 6–8 PM).",
    "**Decisión recomendada:** Evaluar los Top 3 hubs ajustados para disponibilidad de inmuebles y costos. El hub con mejor score ajustado maximiza ROI operativo."
  ]
}));
```

---

## Criterios de Evaluación para Selección Final

<div class="card">
  <h3>Checklist de Validación de Hubs</h3>
  <table style="width: 100%; border-collapse: collapse; font-size: 0.9rem;">
    <thead>
      <tr style="background: #f5f5f5; text-align: left;">
        <th style="padding: 10px; border: 1px solid #ddd;">Criterio</th>
        <th style="padding: 10px; border: 1px solid #ddd;">Importancia</th>
        <th style="padding: 10px; border: 1px solid #ddd;">Cómo Validar</th>
      </tr>
    </thead>
    <tbody>
      <tr style="border: 1px solid #ddd;">
        <td style="padding: 10px; font-weight: 600;">Cobertura Territorial</td>
        <td style="padding: 10px; text-align: center;"><span style="background: #c8e6c9; color: #2e7d32; padding: 4px 10px; border-radius: 12px; font-weight: 600;">CRÍTICA</span></td>
        <td style="padding: 10px;">Verificar que ≥75% de Top 400 estén en <30 min (ya validado en análisis)</td>
      </tr>
      <tr style="border: 1px solid #ddd;">
        <td style="padding: 10px; font-weight: 600;">Acceso a Vías Principales</td>
        <td style="padding: 10px; text-align: center;"><span style="background: #c8e6c9; color: #2e7d32; padding: 4px 10px; border-radius: 12px; font-weight: 600;">CRÍTICA</span></td>
        <td style="padding: 10px;">Proximidad a Blvd. Luis Encinas, Periférico, Carretera Internacional (< 2 km)</td>
      </tr>
      <tr style="border: 1px solid #ddd;">
        <td style="padding: 10px; font-weight: 600;">Costo de Renta/Compra</td>
        <td style="padding: 10px; text-align: center;"><span style="background: #fff9c4; color: #f57f17; padding: 4px 10px; border-radius: 12px; font-weight: 600;">ALTA</span></td>
        <td style="padding: 10px;">Consultar brokers locales, rango esperado: $8–15/m²/mes en zona industrial</td>
      </tr>
      <tr style="border: 1px solid #ddd;">
        <td style="padding: 10px; font-weight: 600;">Infraestructura (Muelle, Rampa)</td>
        <td style="padding: 10px; text-align: center;"><span style="background: #fff9c4; color: #f57f17; padding: 4px 10px; border-radius: 12px; font-weight: 600;">ALTA</span></td>
        <td style="padding: 10px;">Inspección física: altura de techo ≥4m, piso de concreto, espacio de maniobra</td>
      </tr>
      <tr style="border: 1px solid #ddd;">
        <td style="padding: 10px; font-weight: 600;">Restricciones de Tráfico Pesado</td>
        <td style="padding: 10px; text-align: center;"><span style="background: #ffccbc; color: #d84315; padding: 4px 10px; border-radius: 12px; font-weight: 600;">MEDIA</span></td>
        <td style="padding: 10px;">Validar con tránsito municipal: horarios permitidos, rutas autorizadas</td>
      </tr>
      <tr style="border: 1px solid #ddd;">
        <td style="padding: 10px; font-weight: 600;">Seguridad de la Zona</td>
        <td style="padding: 10px; text-align: center;"><span style="background: #ffccbc; color: #d84315; padding: 4px 10px; border-radius: 12px; font-weight: 600;">MEDIA</span></td>
        <td style="padding: 10px;">Consultar índices de robo/asalto en zona (policía municipal, vecinos)</td>
      </tr>
    </tbody>
  </table>
</div>

---

<div class="note" style="background: #e8f5e9; border-left: 4px solid #4caf50; padding: 1rem; margin: 2rem 0;">
  <p style="margin: 0; font-weight: 600;">✅ Score Ajustado por Cobertura Real (HERE API)</p>
  <p style="margin: 0.5rem 0 0 0;">
    El <strong>Score Ajustado</strong> combina el análisis de idoneidad del terreno (score original) 
    con la <strong>cobertura real de establecimientos</strong> calculada mediante isócronas HERE API.
  </p>
  <p style="margin: 0.5rem 0 0 0;">
    <strong>Fórmula:</strong> 40% Score Original + 35% Cobertura 5 min + 25% Cobertura 10 min
  </p>
  <p style="margin: 0.5rem 0 0 0;">
    Esto permite que hubs con mejor acceso real a clientes suban en el ranking, 
    <strong>priorizando la eficiencia operativa</strong> sobre la idoneidad teórica.
  </p>
</div>

<div class="note" style="background: #e3f2fd; border-left: 4px solid #2196f3; padding: 1rem; margin: 1rem 0;">
  <p style="margin: 0; font-weight: 600;">📊 Cambios en el Ranking</p>
  <p style="margin: 0.5rem 0 0 0;">
    El hub original #8 <strong>subió al #2</strong> por tener la mejor cobertura (173 negocios en 10 min).<br>
    El hub original #2 <strong>bajó al #7</strong> por menor cobertura (79 negocios en 10 min).
  </p>
</div>

<div class="note" style="background: #fff3e0; border-left: 4px solid #ff9800; padding: 1rem; margin: 1rem 0;">
  <p style="margin: 0; font-weight: 600;">⚠️ Recomendación de Validación</p>
  <p style="margin: 0.5rem 0 0 0;">
    Aunque las isócronas son precisas, se recomienda <strong>validación con GPS tracking</strong> en pilotos reales 
    de entrega durante horarios pico (8–10 AM, 6–8 PM) antes de comprometer inversión en inmueble.
  </p>
</div>

---

<small style="color: #999;">
  **Ver también:** <a href="../logistica-sonora">6) Logística y Sonora</a> | <a href="../dashboard">7) Dashboard</a>
</small>
