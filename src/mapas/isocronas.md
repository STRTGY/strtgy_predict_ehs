---
title: ⏱️ Análisis de Isócronas HERE
toc: true
---

```js
import {sectionHeader, decisionCallout, implicationsCallout} from "../components/brand.js";
import {kpi, formatNumber, table} from "../components/ui.js";
import {createBaseMap, addGeoJsonLayer, createMarker, createLegend, fitBounds} from "../components/maps.js";
import {normalizeIsochronesWithHubId} from "../data/loaders.js";

// Cargar datos reales de HERE API (isocronas 5/10/15 con business_count)
const isocronas515 = await FileAttachment("../data/isocronas_5_10_15.web.geojson").json();
// top10_cedis = merge top10_hubs + top10_logistica (tiene businesses_5min, businesses_10min, score_adjusted)
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

// hub_id unificado (origin_id ?? cedis_id ?? hub_id) para filtrar por hub; coincide con ranking del CSV
const hubIsochrones = normalizeIsochronesWithHubId(isocronas515 ?? { type: "FeatureCollection", features: [] });
```

```js
// Normalizar datos de hubs y alinear con isócronas (posición y cobertura)
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

  // Alinear posición y cobertura con isócronas: mismo origen que los polígonos
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
    ranking, ranking_adjusted, nombre, lat, lon,
    businesses_5min, businesses_10min, coverage_5min, coverage_10min,
    score_original, score_adjusted
  };
});

// Ordenar por score ajustado
const top10hubsSorted = [...top10hubs].sort((a, b) => b.score_adjusted - a.score_adjusted);
```

```js
display(sectionHeader({
  title: "Análisis de Isócronas con HERE API",
  subtitle: "Cobertura real calculada con red vial y condiciones de tráfico de Hermosillo",
  certainty: "high"
}));
```

```js
display(decisionCallout({
  title: "¿Qué decidir con este análisis?",
  items: [
    "Comparar cobertura real de cada hub en 5, 10 y 15 minutos (HERE API)",
    "Identificar el hub que maximiza cobertura de establecimientos prioritarios",
    "Evaluar trade-offs entre ubicaciones cercanas con diferente acceso vial",
    "Validar que el hub óptimo cubre ≥40% de clientes en 10 minutos"
  ]
}));
```

---

## Metodología: Isócronas HERE API

Las isócronas fueron calculadas usando **HERE Isoline Routing API**, que considera:

- **Red vial real** de Hermosillo (calles, avenidas, sentidos)
- **Condiciones de tráfico** promedio (no tiempo real)
- **Restricciones** de giros y accesos
- **Velocidades** reales por tipo de vía

```js
// Grid: solo tiempos 5, 10, 15 min (datos reales de isocronas_5_10_15 con business_count)
const isoCard = document.createElement("div");
isoCard.className = "card";
isoCard.style.cssText = "background: linear-gradient(135deg, #e8f5e9 0%, white 100%);";

const title = document.createElement("h3");
title.style.marginTop = "0";
title.textContent = "Isócronas Generadas (HERE API)";
isoCard.appendChild(title);

const grid = document.createElement("div");
grid.style.cssText = "display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.5rem; margin-top: 1rem;";

[5, 10, 15].forEach(t => {
  const feats = hubIsochrones.features.filter(f => f.properties.time_minutes === t);
  const isoCount = feats.length;
  const totalBiz = feats.reduce((sum, f) => sum + (f.properties.business_count || 0), 0);
  const avgBiz = isoCount ? totalBiz / isoCount : 0;
  const avgAreaNum = feats.reduce((sum, f) => sum + (f.properties.area_km2 || 0), 0) / (isoCount || 1);
  const hasArea = feats.some(f => f.properties.area_km2 != null);
  const avgAreaStr = hasArea ? (avgAreaNum.toFixed(1) + " km²") : "—";
  
  const cell = document.createElement("div");
  cell.style.cssText = `text-align: center; padding: 0.75rem; background: rgba(255, 152, 0, ${0.15 + (t === 5 ? 0 : t === 10 ? 0.1 : 0.2)}); border-radius: 8px; border-bottom: 3px solid ${t === 5 ? "#fbc02d" : t === 10 ? "#f9a825" : "#e65100"};`;
  cell.innerHTML = `
    <div style="font-size: 1.5rem; font-weight: 700; color: #e65100;">${t}</div>
    <div style="font-size: 0.75rem; color: #666;">minutos</div>
    <div style="font-size: 0.85rem; color: #1565c0; margin-top: 0.5rem;"><strong>${avgBiz.toFixed(0)}</strong> neg.</div>
    <div style="font-size: 0.75rem; color: #999;">${avgAreaStr}</div>
  `;
  grid.appendChild(cell);
});

isoCard.appendChild(grid);

const footer = document.createElement("p");
footer.style.cssText = "margin-top: 1rem; font-size: 0.9rem; color: #666;";
footer.innerHTML = `<strong>Fuente:</strong> HERE Isoline Routing API | <strong>10 hubs × 3 tiempos (5/10/15 min) = 30 isócronas</strong><br>
<strong>Fecha de cálculo:</strong> Diciembre 2024 | <strong>Modo:</strong> Automóvil, tráfico promedio`;
isoCard.appendChild(footer);

display(isoCard);
```

---

## Mapa Interactivo de Isócronas

### Controles

<div class="grid grid-cols-3" style="gap: 1rem; margin-bottom: 1rem;">

```js
const hubSeleccionado = view(Inputs.select(
  [null, ...top10hubsSorted],
  {
    label: "Hub",
    format: (hub) => {
      if (hub === null) return "Todos los hubs";
      return `#${hub.ranking_adjusted} (orig #${hub.ranking}) - ${hub.nombre}`;
    },
    value: top10hubsSorted[0]
  }
));
```

```js
const tiempoMin = view(Inputs.select([5, 10, 15], {
  label: "Tiempo (minutos)",
  value: 5
}));
```

```js
const mostrarNegocios = view(Inputs.toggle({
  label: "Mostrar establecimientos",
  value: true
}));
```

</div>

```js
// Datos derivados
const hubActual = hubSeleccionado;
const hubIdParaIsocrona = hubActual ? hubActual.ranking : null;

// Filtrar isócronas
const isochronasFiltradas = hubIsochrones.features.filter(f => {
  const props = f.properties;
  const matchTime = props.time_minutes === tiempoMin;
  if (hubIdParaIsocrona === null) return matchTime;
  return matchTime && props.hub_id === hubIdParaIsocrona;
});

// Métricas
const negociosCubiertos = isochronasFiltradas.reduce((sum, f) => sum + (f.properties.business_count || 0), 0);
const areaTotalKm2 = isochronasFiltradas.reduce((sum, f) => sum + (f.properties.area_km2 || 0), 0);
const coberturaPct = (negociosCubiertos / totalTop400 * 100);
```

```js
display(
  kpi([
    {
      label: `Negocios en ${tiempoMin} min`,
      value: hubActual ? negociosCubiertos : `${negociosCubiertos} (suma)`,
      color: "#2e7d32"
    },
    {
      label: "Cobertura del Top 400",
      value: hubActual ? `${coberturaPct.toFixed(1)}%` : `${(coberturaPct / 10).toFixed(1)}% prom.`,
      color: coberturaPct > 30 ? "#2e7d32" : "#f57c00"
    },
    {
      label: `Área ${tiempoMin} min`,
      value: areaTotalKm2 > 0 ? `${areaTotalKm2.toFixed(1)} km²` : "—"
    },
    {
      label: "Isócronas mostradas",
      value: `${isochronasFiltradas.length}`
    }
  ])
);
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
  zoom: hubActual ? 13 : 12
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

// Colores para isócronas por tiempo (5, 10, 15 min)
const isoColors = {
  5: "#fbc02d",
  10: "#f9a825",
  15: "#e65100"
};

// Isócronas HERE
const isoGeoJson = {
  type: "FeatureCollection",
  features: isochronasFiltradas
};

addGeoJsonLayer(map, isoGeoJson, {
  style: (feature) => {
    const hubId = feature.properties.hub_id;
    const time = feature.properties.time_minutes;
    const isSelected = hubIdParaIsocrona === null || hubId === hubIdParaIsocrona;
    const hubData = top10hubs.find(h => h.ranking === hubId);
    const isTopAdjusted = hubData?.ranking_adjusted === 1;
    return {
      fillColor: isoColors[time] || "#ff9800",
      color: isTopAdjusted ? "#2e7d32" : "#f57c00",
      weight: isSelected ? 2.5 : 1,
      opacity: isSelected ? 0.9 : 0.4,
      fillOpacity: isSelected ? 0.3 : 0.1
    };
  },
  popupContent: (props) => {
    const bizCount = props.business_count ?? 0;
    const coverage = (bizCount / totalTop400 * 100).toFixed(1);
    const hubData = top10hubs.find(h => h.ranking === props.hub_id);
    const rankAdj = hubData?.ranking_adjusted ?? "?";
    const areaStr = props.area_km2 != null ? `${props.area_km2.toFixed(2)} km²` : "—";
    return `
      <div style="font-family: system-ui, sans-serif;">
        <h4 style="margin: 0 0 8px 0; color: #f57c00;">
          Isócrona ${props.time_minutes} min — Hub #${rankAdj}
          <span style="color: #999; font-size: 0.8rem;">(orig #${props.hub_id})</span>
        </h4>
        <div style="font-size: 0.9rem;">
          <strong style="color: #2e7d32;">Negocios:</strong> ${bizCount} (${coverage}%)<br>
          <strong>Área:</strong> ${areaStr}<br>
          <span style="color: #666; font-size: 0.8rem;">Fuente: HERE API</span>
        </div>
      </div>
    `;
  }
});

// Establecimientos Top 400
if (mostrarNegocios) {
  addGeoJsonLayer(map, top400, {
    pointToLayer: (feature, latlng) => {
      return L.circleMarker(latlng, {
        radius: 4,
        fillColor: "#1976d2",
        color: "#fff",
        weight: 1,
        opacity: 0.9,
        fillOpacity: 0.7
      });
    },
    popupContent: (props) => `
      <div style="font-family: system-ui, sans-serif;">
        <h4 style="margin: 0 0 6px 0; color: #1976d2;">${props.nom_estab || "Establecimiento"}</h4>
        <div style="font-size: 0.85rem; color: #666;">
          ${props.segmento ? `Segmento: ${props.segmento}<br>` : ""}
          ${props.colonia || ""}
        </div>
      </div>
    `
  });
}

// Markers de hubs
const hubsAMostrar = hubActual ? [hubActual] : top10hubsSorted;
hubsAMostrar.forEach((hub) => {
  const latlng = [hub.lat, hub.lon];
  const isTop = hub.ranking_adjusted === 1;
  
  const marker = L.marker(latlng, {
    icon: L.divIcon({
      className: 'hub-marker',
      html: `<div style="
        background: ${isTop ? '#2e7d32' : '#f57c00'};
        color: white;
        width: 26px;
        height: 26px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        font-size: 11px;
        border: 2px solid white;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
      ">${hub.ranking_adjusted}</div>`,
      iconSize: [26, 26],
      iconAnchor: [13, 13]
    })
  }).addTo(map);
  
  marker.bindPopup(`
    <div style="font-family: system-ui, sans-serif; min-width: 160px;">
      <h4 style="margin: 0 0 6px 0; color: ${isTop ? '#2e7d32' : '#f57c00'};">
        Hub #${hub.ranking_adjusted} <span style="color: #999; font-size: 0.85rem;">(orig #${hub.ranking})</span>
      </h4>
      <div style="font-size: 0.85rem;">
        📍 5 min: <strong>${hub.businesses_5min}</strong> negocios<br>
        🚚 10 min: <strong>${hub.businesses_10min}</strong> negocios<br>
        Score Adj: <strong>${hub.score_adjusted?.toFixed(2)}</strong>
      </div>
    </div>
  `);
  
  if (hubActual) marker.openPopup();
});

// Leyenda
createLegend(map, [
  {type: "header", label: "Isócronas HERE API"},
  {type: "square", color: isoColors[tiempoMin], label: `${tiempoMin} minutos`},
  {type: "separator"},
  {type: "header", label: "Elementos"},
  {type: "circle", color: "#2e7d32", label: "Hub #1 (óptimo)"},
  {type: "circle", color: "#f57c00", label: "Otros hubs"},
  {type: "circle", color: "#1976d2", label: mostrarNegocios ? "Top 400" : "—"}
].filter(i => i.label !== "—"), {
  position: "bottomright",
  title: "Leyenda"
});
```

---

## Análisis de Cobertura por Hub y Tiempo

```js
// Calcular cobertura real para cada hub en tiempos 5, 10, 15 min
const tiemposClave = [5, 10, 15];
const coberturaRealData = top10hubsSorted.map(hub => {
  const row = {
    ranking_adj: hub.ranking_adjusted,
    ranking_orig: hub.ranking,
    nombre: hub.nombre
  };
  
  tiemposClave.forEach(t => {
    const iso = hubIsochrones.features.find(f => 
      f.properties.hub_id === hub.ranking && f.properties.time_minutes === t
    );
    row[`biz_${t}min`] = iso?.properties?.business_count ?? 0;
    row[`cov_${t}min`] = ((iso?.properties?.business_count ?? 0) / totalTop400 * 100).toFixed(1);
  });
  
  row.score_adj = hub.score_adjusted;
  return row;
});

display(html`
  <div class="card">
    <h3>Cobertura Real por Hub (Datos HERE API)</h3>
    <p style="color: #666; font-size: 0.9rem; margin-bottom: 1rem;">
      Negocios del Top 400 alcanzables en cada tiempo de isócrona (5, 10, 15 min).
    </p>
    ${table(
      coberturaRealData,
      [
        {key: "ranking_adj", label: "#Adj", format: (v) => `<strong style="color: #2e7d32;">${v}</strong>`},
        {key: "nombre", label: "Hub", format: (v) => v || "—"},
        {key: "biz_5min", label: "5 min", format: (v) => `<strong>${v ?? 0}</strong>`},
        {key: "biz_10min", label: "10 min", format: (v) => `<strong style="color: #1565c0;">${v ?? 0}</strong>`},
        {key: "biz_15min", label: "15 min", format: (v) => v ?? 0},
        {key: "cov_10min", label: "Cob. 10min", format: (v) => `${v}%`},
        {key: "score_adj", label: "Score", format: (v) => v?.toFixed(1) || "—"}
      ],
      {sortable: true, exportable: true}
    )}
  </div>
`);
```

---

## Comparativa Visual: Mejor Hub vs Alternativas

```js
// Top 3 hubs - crear con DOM manipulation
const top3Hubs = top10hubsSorted.slice(0, 3);

const gridTop3 = document.createElement("div");
gridTop3.className = "grid grid-cols-3";
gridTop3.style.gap = "1rem";

top3Hubs.forEach((hub, idx) => {
  const isTop = idx === 0;
  const bgColor = isTop ? '#e8f5e9' : '#f5f5f5';
  const borderColor = isTop ? '#2e7d32' : '#e0e0e0';
  
  const card = document.createElement("div");
  card.className = "card";
  card.style.cssText = `background: linear-gradient(135deg, ${bgColor} 0%, white 100%); border: 2px solid ${borderColor};`;
  
  card.innerHTML = `
    <div style="text-align: center;">
      <div style="font-size: 2rem; font-weight: 700; color: ${isTop ? '#2e7d32' : '#1565c0'};">
        #${hub.ranking_adjusted}
      </div>
      <div style="font-size: 0.85rem; color: #666;">(orig #${hub.ranking})</div>
      <h4 style="margin: 0.5rem 0;">${hub.nombre}</h4>
      ${isTop ? '<span style="background: #2e7d32; color: white; padding: 3px 10px; border-radius: 10px; font-size: 0.75rem; font-weight: 600;">ÓPTIMO</span>' : ''}
    </div>
    <hr style="border: 0; border-top: 1px solid #e0e0e0; margin: 1rem 0;">
    <div style="font-size: 0.9rem;">
      <div style="margin: 6px 0;">
        <strong>5 min:</strong> <span style="color: #1565c0;">${hub.businesses_5min}</span> negocios (${hub.coverage_5min?.toFixed(1)}%)
      </div>
      <div style="margin: 6px 0;">
        <strong>10 min:</strong> <span style="color: #2e7d32; font-weight: 700;">${hub.businesses_10min}</span> negocios (${hub.coverage_10min?.toFixed(1)}%)
      </div>
      <div style="margin: 6px 0; padding-top: 6px; border-top: 1px dashed #ddd;">
        Score Adj: <strong>${hub.score_adjusted?.toFixed(2)}</strong>
      </div>
    </div>
  `;
  
  gridTop3.appendChild(card);
});

display(gridTop3);
```

---

```js
const hubOptimo = top10hubsSorted[0];

display(implicationsCallout({
  title: "Hallazgos Clave de las Isócronas HERE",
  items: [
    `**Hub óptimo (#${hubOptimo.ranking_adjusted}):** Cubre ${hubOptimo.businesses_10min} negocios en 10 min (${hubOptimo.coverage_10min?.toFixed(1)}% del Top 400).`,
    "**Las isócronas HERE son más precisas** que radios circulares: consideran calles reales, sentidos y tráfico.",
    `**Cobertura promedio en 5 min:** ${(top10hubs.reduce((s, h) => s + h.businesses_5min, 0) / 10).toFixed(0)} negocios por hub.`,
    `**Cobertura promedio en 10 min:** ${(top10hubs.reduce((s, h) => s + h.businesses_10min, 0) / 10).toFixed(0)} negocios por hub.`,
    "**Validar en campo:** Las isócronas asumen tráfico promedio. Realizar pilotos en horarios pico (8-10 AM, 6-8 PM)."
  ]
}));
```

---

## Próximos Pasos

<div class="grid grid-cols-2">
  <div class="card">
    <h3>🚚 Para Operaciones</h3>
    <ol style="margin: 0; padding-left: 1.25rem; font-size: 0.9rem;">
      <li>Validar tiempos con GPS tracking en pilotos reales</li>
      <li>Identificar cuellos de botella viales en las isócronas</li>
      <li>Definir SLAs por zona (5 min = express, 10 min = estándar)</li>
      <li>Calcular capacidad de entregas por vehículo/día</li>
    </ol>
  </div>
  <div class="card">
    <h3>📊 Para Análisis</h3>
    <ol style="margin: 0; padding-left: 1.25rem; font-size: 0.9rem;">
      <li>Comparar cobertura en horarios pico vs. promedio</li>
      <li>Evaluar isócronas en días de semana vs. fines de semana</li>
      <li>Identificar negocios fuera de cobertura para micro-hubs</li>
      <li>Optimizar score con pesos diferentes según prioridad</li>
    </ol>
  </div>
</div>

---

<div class="note" style="background: #e8f5e9; border-left: 4px solid #4caf50; padding: 1rem; margin: 2rem 0;">
  <p style="margin: 0; font-weight: 600;">Datos calculados con HERE API</p>
  <p style="margin: 0.5rem 0 0 0;">
    Las isócronas de 5, 10 y 15 minutos fueron generadas con <strong>HERE Isoline Routing API</strong>,
    que utiliza la red vial real de Hermosillo y condiciones de tráfico promedio.
    El conteo de negocios Top 400 dentro de cada isócrona se calculó mediante spatial join.
  </p>
</div>

<div class="note" style="background: #fff3e0; border-left: 4px solid #ff9800; padding: 1rem; margin: 1rem 0;">
  <p style="margin: 0; font-weight: 600;">⚠️ Limitaciones</p>
  <p style="margin: 0.5rem 0 0 0;">
    Las isócronas son estimaciones basadas en tráfico promedio. Los tiempos reales varían según:
    hora del día, condiciones climáticas, eventos especiales y obras viales.
    <strong>Validar con GPS tracking antes de comprometer SLAs de entrega.</strong>
  </p>
</div>

---

<small style="color: #999;">
  **Ver también:** <a href="./hubs">🚚 Hubs Logísticos</a> | <a href="../logistica-sonora">6) Logística y Sonora</a> | <a href="../dashboard">7) Dashboard</a>
</small>
