---
title: Sweet Spots - Ubicaciones Óptimas
toc: true
---

# ⭐ Sweet Spots: Ubicaciones Óptimas Combinadas

Análisis integrado que combina eficiencia logística y potencial comercial para identificar las ubicaciones más estratégicas.

```js
import {createMap, createMarker, createCircle, addPopup, addTooltip, createLegend, createCircleMarker, addGeoJsonLayer} from "../components/MapLeaflet.js";

// Load data
const sweetspots = await FileAttachment("../data/sweetspot_top10.web.geojson").json();
const top400 = await FileAttachment("../data/top400.web.geojson").json();

// Normalize geometry to [lon, lat] (Point, Polygon exterior ring, or MultiPolygon first point)
function getPointFromFeature(feature) {
  const g = feature?.geometry;
  if (!g?.coordinates) return null;
  if (g.type === "Point") return g.coordinates;
  if (g.type === "Polygon" && g.coordinates[0]?.length) return g.coordinates[0][0];
  if (g.type === "MultiPolygon" && g.coordinates[0]?.[0]?.length) return g.coordinates[0][0][0];
  return null;
}

// Si el GeoJSON no trae score_compuesto/score_logistico, derivar índices sintéticos desde propiedades existentes (p. ej. POB*_R)
function deriveScoresFromProperties(p) {
  const hasScores = p.score_compuesto != null || p.score_logistico != null;
  if (hasScores) return { score_logistico: p.score_logistico ?? 0, score_compuesto: p.score_compuesto ?? 0 };
  const r = (key) => (p[key] != null && Number.isFinite(Number(p[key]))) ? Number(p[key]) : 0;
  const ratios = ["POB12_R", "POB17_R", "POB18_R", "POB19_R", "POB20_R"].map(k => r(k));
  const avg = ratios.length ? ratios.reduce((a, b) => a + b, 0) / ratios.length : 0;
  const scoreLogistico = Math.min(100, Math.max(0, avg));
  const scoreComercial = Math.min(100, Math.max(0, (r("POB12_R") + r("POB31_R")) / 2));
  const scoreCompuesto = 0.6 * scoreLogistico + 0.4 * scoreComercial;
  return { score_logistico: scoreLogistico, score_compuesto: scoreCompuesto };
}

// Ordenar por score_compuesto (mayor a menor) y enriquecer con ranking y score comercial derivado
const sweetspotsSorted = sweetspots.features
  .map((f) => {
    const p = f.properties;
    const { score_logistico: scoreLogistico, score_compuesto: scoreCompuesto } = deriveScoresFromProperties(p);
    const scoreComercial = scoreLogistico > 0 ? Math.max(0, (scoreCompuesto - 0.6 * scoreLogistico) / 0.4) : (p.score_comercial != null ? Number(p.score_comercial) : 0);
    return {
      ...f,
      properties: {
        ...p,
        score_logistico: scoreLogistico,
        score_compuesto: scoreCompuesto,
        score_comercial: scoreComercial
      }
    };
  })
  .sort((a, b) => (b.properties.score_compuesto || 0) - (a.properties.score_compuesto || 0))
  .map((f, idx) => ({
    ...f,
    properties: { ...f.properties, ranking: idx + 1 }
  }));
```

## ¿Qué es un Sweet Spot?

Un **Sweet Spot** es una ubicación que maximiza simultáneamente:
- **Eficiencia Logística (60%)**: Cobertura de clientes, centralidad, accesibilidad
- **Potencial Comercial (40%)**: Densidad de establecimientos prioritarios, potencial de venta

<div class="note">
  <p><strong>Fórmula del Score Compuesto:</strong></p>
  <p><code>Score Compuesto = (0.6 × Score Logístico) + (0.4 × Score Comercial normalizado)</code></p>
  <p style="font-size: 0.9em; color: var(--theme-foreground-muted); margin-bottom: 0;">Si el GeoJSON no incluye estos scores, se calculan índices a partir de ratios demográficos y de cobertura (POB*_R) del mismo archivo.</p>
</div>

## Top 10 Sweet Spots

```js
// Crear tabla con DOM manipulation para evitar escape de HTML
const sweetspotCard = document.createElement("div");
sweetspotCard.className = "card";

const cardTitle = document.createElement("h3");
cardTitle.textContent = "Ranking de Sweet Spots";
sweetspotCard.appendChild(cardTitle);

const table = document.createElement("table");
table.style.cssText = "width: 100%; margin-top: 10px; border-collapse: collapse; font-size: 13px;";

// Header
const thead = document.createElement("thead");
thead.innerHTML = `
  <tr style="background: linear-gradient(135deg, #fff8e1 0%, #ffecb3 100%);">
    <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Ranking</th>
    <th style="padding: 10px; text-align: center; border: 1px solid #ddd;">Score Compuesto</th>
    <th style="padding: 10px; text-align: center; border: 1px solid #ddd;">Logístico (60%)</th>
    <th style="padding: 10px; text-align: center; border: 1px solid #ddd;">Comercial (40%)</th>
    <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Coordenadas</th>
    <th style="padding: 10px; text-align: center; border: 1px solid #ddd;">Google Maps</th>
  </tr>
`;
table.appendChild(thead);

// Body
const tbody = document.createElement("tbody");
sweetspotsSorted.forEach((f, i) => {
  const p = f.properties;
  const coords = getPointFromFeature(f);
  const row = document.createElement("tr");
  
  // Colores según ranking
  const ranking = p.ranking || (i + 1);
  const isTop1 = ranking === 1;
  const isTop3 = ranking <= 3;
  const bgColor = isTop1 ? 'rgba(211, 47, 47, 0.1)' : isTop3 ? 'rgba(245, 124, 0, 0.08)' : (i % 2 === 0 ? '#fff' : '#fafafa');
  const rankColor = isTop1 ? '#d32f2f' : isTop3 ? '#f57c00' : '#fbc02d';
  const latLonStr = coords && Number.isFinite(coords[1]) && Number.isFinite(coords[0])
    ? `${Number(coords[1]).toFixed(4)}, ${Number(coords[0]).toFixed(4)}`
    : "N/A";
  const mapHref = coords && Number.isFinite(coords[1]) && Number.isFinite(coords[0])
    ? `https://www.google.com/maps?q=${coords[1]},${coords[0]}`
    : "#";
  
  row.style.background = bgColor;
  row.innerHTML = `
    <td style="padding: 8px; border: 1px solid #ddd;">
      <strong style="color: ${rankColor};">#${ranking}</strong>
      ${isTop1 ? ' ⭐' : isTop3 ? ' 🚩' : ' 🎯'}
    </td>
    <td style="padding: 8px; border: 1px solid #ddd; text-align: center; font-weight: 700; color: ${rankColor}; font-size: 1.1em;">${p.score_compuesto != null ? Number(p.score_compuesto).toFixed(1) : 'N/A'}</td>
    <td style="padding: 8px; border: 1px solid #ddd; text-align: center; color: #1565c0; font-weight: 600;">${p.score_logistico != null ? Number(p.score_logistico).toFixed(1) : 'N/A'}</td>
    <td style="padding: 8px; border: 1px solid #ddd; text-align: center; color: #2e7d32; font-weight: 600;">${p.score_comercial != null ? Number(p.score_comercial).toFixed(1) : 'N/A'}</td>
    <td style="padding: 8px; border: 1px solid #ddd; font-size: 0.85em; color: #666;">${latLonStr}</td>
    <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">
      <a href="${mapHref}" target="_blank" style="color: ${rankColor}; text-decoration: none;">🗺️ Ver</a>
    </td>
  `;
  tbody.appendChild(row);
});
table.appendChild(tbody);

sweetspotCard.appendChild(table);
display(sweetspotCard);
```

## Mapa Interactivo

```js
const mapContainer = display(document.createElement("div"));
mapContainer.style.width = "100%";
mapContainer.style.height = "700px";

const map = createMap(mapContainer);

// Add all Top 400 establishments as small background dots
top400.features.forEach(feature => {
  const coords = feature.geometry?.type === "Point" ? feature.geometry.coordinates : getPointFromFeature(feature);
  if (!coords || !Number.isFinite(coords[0]) || !Number.isFinite(coords[1])) return;
  const latlng = [coords[1], coords[0]];
  
  const marker = createCircleMarker(latlng, {
    radius: 3,
    color: "#3949ab",
    fillColor: "#3949ab",
    fillOpacity: 0.5,
    weight: 1
  });
  
  marker.addTo(map);
});

// Add sweet spots
sweetspotsSorted.forEach(feature => {
  const props = feature.properties;
  const coords = getPointFromFeature(feature);
  if (!coords || !Number.isFinite(coords[0]) || !Number.isFinite(coords[1])) return;
  const latlng = [coords[1], coords[0]];
  const ranking = props.ranking || 999;
  
  // Determine marker appearance based on ranking
  let markerColor, iconType;
  if (ranking === 1) {
    markerColor = "#d32f2f";
    iconType = "star";
  } else if (ranking <= 3) {
    markerColor = "#f57c00";
    iconType = "flag";
  } else {
    markerColor = "#fbc02d";
    iconType = "circle";
  }
  
  // Create custom marker (latlng is [lat, lng] with finite numbers after guard above)
  const marker = createMarker([Number(latlng[0]), Number(latlng[1])], {
    markerColor,
    icon: iconType,
    iconColor: "white"
  });
  
  // Popup content
  const popupContent = `
    <div style="font-family: Arial; min-width: 260px;">
      <h4 style="color: ${markerColor}; margin: 0 0 10px 0;">${iconType === "star" ? "⭐" : iconType === "flag" ? "🚩" : "🎯"} Sweet Spot #${ranking}</h4>
      <div style="background: ${markerColor}; color: white; padding: 4px 8px; border-radius: 4px; display: inline-block; margin-bottom: 8px; font-size: 0.8em;">
        UBICACIÓN ÓPTIMA COMBINADA
      </div>
      <hr style="margin: 8px 0;">
      <div style="text-align: center; padding: 10px; background: #f5f5f5; border-radius: 8px; margin-bottom: 10px;">
        <div style="font-size: 1.8em; color: ${markerColor}; font-weight: bold;">${props.score_compuesto != null && Number.isFinite(Number(props.score_compuesto)) ? Number(props.score_compuesto).toFixed(1) : 'N/A'}</div>
        <div style="font-size: 0.8em; color: #666;">Score Compuesto / 100</div>
      </div>
      <b>📊 Componentes:</b>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 6px;">
        <div style="background: rgba(21,101,192,0.1); padding: 8px; border-radius: 4px; text-align: center;">
          <div style="color: #1565c0; font-weight: bold;">${props.score_logistico != null && Number.isFinite(Number(props.score_logistico)) ? Number(props.score_logistico).toFixed(1) : 'N/A'}</div>
          <div style="font-size: 0.75em; color: #666;">Logístico (60%)</div>
        </div>
        <div style="background: rgba(46,125,50,0.1); padding: 8px; border-radius: 4px; text-align: center;">
          <div style="color: #2e7d32; font-weight: bold;">${props.score_comercial != null && Number.isFinite(Number(props.score_comercial)) ? Number(props.score_comercial).toFixed(1) : 'N/A'}</div>
          <div style="font-size: 0.75em; color: #666;">Comercial (40%)</div>
        </div>
      </div>
      <hr style="margin: 10px 0 8px 0;">
      <a href="https://www.google.com/maps?q=${Number(latlng[0])},${Number(latlng[1])}" target="_blank" 
         style="display: block; text-align: center; color: ${markerColor}; font-weight: bold; text-decoration: none;">
        🗺️ Ver en Google Maps
      </a>
    </div>
  `;
  
  addPopup(marker, popupContent);
  const scoreStr = props.score_compuesto != null && Number.isFinite(Number(props.score_compuesto)) ? Number(props.score_compuesto).toFixed(1) : "N/A";
  addTooltip(marker, `${iconType === "star" ? "⭐" : iconType === "flag" ? "🚩" : "🎯"} Sweet Spot #${ranking} - Score: ${scoreStr}`);
  marker.addTo(map);
  
  // Add 2km coverage circle for visual reference
  const circle2km = createCircle([Number(latlng[0]), Number(latlng[1])], {
    radius: 2000,
    color: markerColor,
    fillColor: markerColor,
    fillOpacity: 0.05,
    weight: 1,
    opacity: 0.3
  });
  addPopup(circle2km, `Radio 2km - Sweet Spot #${ranking}`);
  circle2km.addTo(map);
});

// Create legend - solo elementos presentes
createLegend(map, [
  {type: "header", label: "Sweet Spots"},
  {type: "circle", color: "#d32f2f", label: "⭐ #1 (Óptimo)"},
  {type: "circle", color: "#f57c00", label: "🚩 #2-3"},
  {type: "circle", color: "#fbc02d", label: "🎯 #4-10"},
  {type: "separator"},
  {type: "header", label: "Establecimientos"},
  {type: "circle", color: "#3949ab", label: "Top 400"},
  {type: "separator"},
  {type: "square", color: "rgba(211,47,47,0.1)", label: "Radio 2km"}
], "bottomright");
```

## Análisis Comparativo

```js
// Calculate statistics
const n = sweetspotsSorted.length;
const avgCompuesto = n ? sweetspotsSorted.reduce((sum, f) => sum + (f.properties.score_compuesto || 0), 0) / n : 0;
const avgLogistico = n ? sweetspotsSorted.reduce((sum, f) => sum + (f.properties.score_logistico || 0), 0) / n : 0;
const avgComercial = n ? sweetspotsSorted.reduce((sum, f) => sum + (f.properties.score_comercial || 0), 0) / n : 0;

const top1 = sweetspotsSorted[0]?.properties;
const top1Point = sweetspotsSorted[0] ? getPointFromFeature(sweetspotsSorted[0]) : null;
const top1Lat = top1Point != null && Number.isFinite(Number(top1Point[1])) ? Number(top1Point[1]) : null;
const top1Lon = top1Point != null && Number.isFinite(Number(top1Point[0])) ? Number(top1Point[0]) : null;
const top1CoordsStr = top1Lat != null && top1Lon != null ? `${top1Lat.toFixed(6)}, ${top1Lon.toFixed(6)}` : "N/A";
const top1MapHref = top1Lat != null && top1Lon != null ? `https://www.google.com/maps?q=${top1Lat},${top1Lon}` : "#";

// Crear cards con DOM manipulation
const gridContainer = document.createElement("div");
gridContainer.className = "grid grid-cols-2";
gridContainer.style.gap = "1rem";

// Card 1: Sweet Spot #1
const card1 = document.createElement("div");
card1.className = "card";
card1.style.cssText = "background: linear-gradient(135deg, #ffebee 0%, white 100%); border: 2px solid #d32f2f;";
card1.innerHTML = `
  <h3 style="margin-top: 0; color: #d32f2f;">⭐ Sweet Spot #1 (Recomendado)</h3>
  <div style="margin: 15px 0; text-align: center;">
    <div style="font-size: 3em; font-weight: bold; color: #d32f2f;">${top1?.score_compuesto != null ? Number(top1.score_compuesto).toFixed(1) : 'N/A'}</div>
    <div style="font-size: 0.9em; color: #666;">Score Compuesto / 100</div>
  </div>
  <hr style="border-color: #ffcdd2;">
  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin: 1rem 0;">
    <div style="text-align: center; padding: 10px; background: rgba(21, 101, 192, 0.1); border-radius: 8px;">
      <div style="font-size: 1.8em; font-weight: bold; color: #1565c0;">${top1?.score_logistico != null ? Number(top1.score_logistico).toFixed(1) : 'N/A'}</div>
      <div style="font-size: 0.8em; color: #666;">Score Logístico</div>
    </div>
    <div style="text-align: center; padding: 10px; background: rgba(46, 125, 50, 0.1); border-radius: 8px;">
      <div style="font-size: 1.8em; font-weight: bold; color: #2e7d32;">${top1?.score_comercial != null ? Number(top1.score_comercial).toFixed(1) : 'N/A'}</div>
      <div style="font-size: 0.8em; color: #666;">Score Comercial</div>
    </div>
  </div>
  <hr style="border-color: #ffcdd2;">
  <p style="margin-bottom: 0.5rem;"><strong>📍 Coordenadas:</strong></p>
  <code style="background: #f5f5f5; padding: 8px; display: block; border-radius: 4px; font-size: 0.9em;">
    ${top1CoordsStr}
  </code>
  <a href="${top1MapHref}" target="_blank" 
     style="display: inline-block; margin-top: 10px; padding: 8px 16px; background: #d32f2f; color: white; text-decoration: none; border-radius: 4px; font-weight: 600;">
    🗺️ Ver en Google Maps
  </a>
`;
gridContainer.appendChild(card1);

// Card 2: Promedios
const card2 = document.createElement("div");
card2.className = "card";
card2.innerHTML = `
  <h3 style="margin-top: 0;">📊 Promedios Top 10 Sweet Spots</h3>
  <div style="margin: 20px 0;">
    <div style="margin: 15px 0; text-align: center; padding: 15px; background: linear-gradient(135deg, #e3f2fd 0%, white 100%); border-radius: 8px;">
      <div style="font-size: 2em; font-weight: bold; color: #d32f2f;">${Number(avgCompuesto).toFixed(1)}</div>
      <div style="font-size: 0.9em; color: #666;">Score Compuesto Promedio</div>
    </div>
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
      <div style="text-align: center; padding: 12px; background: #f5f5f5; border-radius: 8px; border-left: 4px solid #1565c0;">
        <div style="font-size: 1.5em; font-weight: bold; color: #1565c0;">${Number(avgLogistico).toFixed(1)}</div>
        <div style="font-size: 0.85em; color: #666;">Logístico Prom.</div>
      </div>
      <div style="text-align: center; padding: 12px; background: #f5f5f5; border-radius: 8px; border-left: 4px solid #2e7d32;">
        <div style="font-size: 1.5em; font-weight: bold; color: #2e7d32;">${Number(avgComercial).toFixed(1)}</div>
        <div style="font-size: 0.85em; color: #666;">Comercial Prom.</div>
      </div>
    </div>
  </div>
  <hr>
  <p style="font-size: 0.9em; color: #666; margin-bottom: 0;">
    <strong>Fórmula:</strong> Score = (0.6 × Logístico) + (0.4 × Comercial)
  </p>
`;
gridContainer.appendChild(card2);

display(gridContainer);
```

## Criterios de Selección

<div class="grid grid-cols-2">
  <div class="card">
    <h3>🚚 Componente Logístico (60%)</h3>
    <ul>
      <li><strong>Cobertura 5km:</strong> Clientes alcanzables en viajes cortos</li>
      <li><strong>Cobertura 10km:</strong> Alcance total del hub</li>
      <li><strong>Centralidad:</strong> Distancia promedio a todos los clientes</li>
      <li><strong>Accesibilidad:</strong> Proximidad a vías principales</li>
    </ul>
  </div>
  <div class="card">
    <h3>💰 Componente Comercial (40%)</h3>
    <ul>
      <li><strong>Densidad local:</strong> Establecimientos en radio de 2km</li>
      <li><strong>Calidad de clientes:</strong> Concentración de Top 400</li>
      <li><strong>Potencial de venta:</strong> Clientes de alto valor cercanos</li>
      <li><strong>Oportunidad de mercado:</strong> Zonas desatendidas</li>
    </ul>
  </div>
</div>

## Distribución de Scores

```js
// Create score distribution chart
import * as Plot from "npm:@observablehq/plot";

const scoreData = sweetspotsSorted.map(f => ({
  ranking: f.properties.ranking,
  compuesto: f.properties.score_compuesto,
  logistico: f.properties.score_logistico,
  comercial: f.properties.score_comercial
}));

display(Plot.plot({
  width,
  height: 300,
  marginLeft: 50,
  marginBottom: 50,
  x: {label: "Ranking", domain: [1, 10], ticks: 10},
  y: {label: "Score", domain: [0, 100], grid: true},
  marks: [
    Plot.line(scoreData, {x: "ranking", y: "compuesto", stroke: "#d32f2f", strokeWidth: 3}),
    Plot.line(scoreData, {x: "ranking", y: "logistico", stroke: "#1565c0", strokeWidth: 2, strokeDasharray: "4,4"}),
    Plot.line(scoreData, {x: "ranking", y: "comercial", stroke: "#2e7d32", strokeWidth: 2, strokeDasharray: "4,4"}),
    Plot.dot(scoreData, {x: "ranking", y: "compuesto", fill: "#d32f2f", r: 5}),
    Plot.ruleY([0])
  ],
  style: {
    fontSize: "12px"
  }
}));

display(html`
  <div style="margin-top: 10px; font-size: 12px;">
    <span style="color: #d32f2f; font-weight: bold;">━━━</span> Score Compuesto &nbsp;&nbsp;
    <span style="color: #1565c0; font-weight: bold;">┄┄┄</span> Score Logístico &nbsp;&nbsp;
    <span style="color: #2e7d32; font-weight: bold;">┄┄┄</span> Score Comercial
  </div>
`);
```

---

<div class="note">
  <strong>💡 Recomendaciones Estratégicas:</strong>
  <ul>
    <li><strong>Sweet Spot #1</strong> ofrece el mejor balance entre eficiencia logística y potencial comercial</li>
    <li>Considerar <strong>múltiples sweet spots</strong> (Top 3) para cobertura completa de Hermosillo</li>
    <li>Los Sweet Spots <strong>coinciden con zonas de alta densidad</strong> de establecimientos prioritarios</li>
    <li>Revisar <a href="/mapas/hubs">Hubs Logísticos</a> y <a href="/mapas/puntos-venta">Puntos de Venta</a> individualmente para detalles</li>
    <li>Evaluar disponibilidad de <strong>infraestructura y servicios</strong> en cada ubicación</li>
  </ul>
</div>

