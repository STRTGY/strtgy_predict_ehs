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

// Sort by ranking
const sweetspotsSorted = sweetspots.features.sort((a, b) => 
  (a.properties.ranking || 999) - (b.properties.ranking || 999)
);
```

## ¿Qué es un Sweet Spot?

Un **Sweet Spot** es una ubicación que maximiza simultáneamente:
- **Eficiencia Logística (60%)**: Cobertura de clientes, centralidad, accesibilidad
- **Potencial Comercial (40%)**: Densidad de establecimientos prioritarios, potencial de venta

<div class="note">
  <p><strong>Fórmula del Score Compuesto:</strong></p>
  <p><code>Score Compuesto = (0.6 × Score Logístico) + (0.4 × Score Comercial normalizado)</code></p>
</div>

## Top 10 Sweet Spots

```js
display(html`
  <div class="card">
    <h3>Ranking de Sweet Spots</h3>
    <table style="width: 100%; margin-top: 10px;">
      <thead>
        <tr>
          <th>Ranking</th>
          <th>Score Compuesto</th>
          <th>Score Logístico</th>
          <th>Score Comercial</th>
          <th>Clientes 5km</th>
          <th>Establecimientos 2km</th>
          <th>Coordenadas</th>
        </tr>
      </thead>
      <tbody>
        ${sweetspotsSorted.map(f => {
          const p = f.properties;
          const coords = f.geometry.coordinates;
          return `
            <tr>
              <td><strong>#${p.ranking || 'N/A'}</strong></td>
              <td><strong>${p.score_compuesto?.toFixed(1) || 'N/A'}</strong></td>
              <td>${p.score_logistico?.toFixed(1) || 'N/A'}</td>
              <td>${p.score_comercial?.toFixed(1) || 'N/A'}</td>
              <td>${p.clientes_5km || 'N/A'}</td>
              <td>${p.establecimientos_2km || 'N/A'}</td>
              <td><small>${coords[1].toFixed(4)}, ${coords[0].toFixed(4)}</small></td>
            </tr>
          `;
        }).join('')}
      </tbody>
    </table>
  </div>
`);
```

## Mapa Interactivo

```js
const mapContainer = display(document.createElement("div"));
mapContainer.style.width = "100%";
mapContainer.style.height = "700px";

const map = createMap(mapContainer);

// Add all Top 400 establishments as small background dots
top400.features.forEach(feature => {
  const coords = feature.geometry.coordinates;
  const latlng = [coords[1], coords[0]];
  const decil = feature.properties.decil;
  
  const color = decil === 1 ? "#1a237e" : decil <= 3 ? "#3949ab" : "#9fa8da";
  
  const marker = createCircleMarker(latlng, {
    radius: 3,
    color: color,
    fillColor: color,
    fillOpacity: 0.4,
    weight: 1
  });
  
  marker.addTo(map);
});

// Add sweet spots
sweetspotsSorted.forEach(feature => {
  const props = feature.properties;
  const coords = feature.geometry.coordinates;
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
  
  // Create custom marker
  const marker = createMarker(latlng, {
    markerColor,
    icon: iconType,
    iconColor: "white"
  });
  
  // Popup content
  const popupContent = `
    <div style="font-family: Arial; min-width: 280px;">
      <h4 style="color: ${markerColor}; margin: 0 0 10px 0;">${iconType === "star" ? "⭐" : iconType === "flag" ? "🚩" : "🎯"} Sweet Spot #${ranking}</h4>
      <h5 style="margin: 5px 0;">🎯 UBICACIÓN ÓPTIMA COMBINADA</h5>
      <hr style="margin: 8px 0;">
      <b>Score Compuesto:</b> <span style="font-size: 16px; color: ${markerColor}; font-weight: bold;">${props.score_compuesto?.toFixed(1) || 'N/A'}/100</span><br>
      <small>(60% Logística + 40% Comercial)</small>
      <hr style="margin: 8px 0;">
      <b>📊 Componentes:</b><br>
      • Score Logístico: <b>${props.score_logistico?.toFixed(1) || 'N/A'}</b><br>
      • Score Comercial: <b>${props.score_comercial?.toFixed(1) || 'N/A'}</b><br>
      <hr style="margin: 8px 0;">
      <b>📦 Eficiencia Logística:</b><br>
      • Clientes 5km: <b>${props.clientes_5km || 'N/A'}</b><br>
      • Clientes 10km: <b>${props.clientes_10km || 'N/A'}</b><br>
      <hr style="margin: 8px 0;">
      <b>💰 Potencial Comercial (radio 2km):</b><br>
      • Establecimientos: <b>${props.establecimientos_2km || 'N/A'}</b><br>
      <hr style="margin: 8px 0;">
      <a href="https://www.google.com/maps?q=${latlng[0]},${latlng[1]}" target="_blank" style="color: ${markerColor};">
        🗺️ Ver en Google Maps
      </a>
    </div>
  `;
  
  addPopup(marker, popupContent);
  addTooltip(marker, `${iconType === "star" ? "⭐" : iconType === "flag" ? "🚩" : "🎯"} Sweet Spot #${ranking} - Score: ${props.score_compuesto?.toFixed(1) || 'N/A'}`);
  marker.addTo(map);
  
  // Add 2km coverage circle for visual reference
  const circle2km = createCircle(latlng, {
    radius: 2000,
    color: markerColor,
    fillColor: markerColor,
    fillOpacity: 0.05,
    weight: 1,
    opacity: 0.3
  });
  addPopup(circle2km, `Radio 2km - ${props.establecimientos_2km || 'N/A'} establecimientos`);
  circle2km.addTo(map);
});

// Create legend
createLegend(map, [
  {type: "header", label: "Sweet Spots"},
  {type: "circle", color: "#d32f2f", label: "⭐ Sweet Spot #1 (Óptimo)"},
  {type: "circle", color: "#f57c00", label: "🚩 Sweet Spots #2-3"},
  {type: "circle", color: "#fbc02d", label: "🎯 Sweet Spots #4-10"},
  {type: "separator"},
  {type: "header", label: "Establecimientos Top 400"},
  {type: "circle", color: "#1a237e", label: "Decil 1 (Prioridad Alta)"},
  {type: "circle", color: "#3949ab", label: "Deciles 2-3"},
  {type: "circle", color: "#9fa8da", label: "Deciles 4-10"},
  {type: "separator"},
  {type: "line", color: "#d32f2f", label: "Radio 2km (referencia)"}
], "bottomright");
```

## Análisis Comparativo

```js
// Calculate statistics
const avgCompuesto = sweetspotsSorted.reduce((sum, f) => sum + (f.properties.score_compuesto || 0), 0) / sweetspotsSorted.length;
const avgLogistico = sweetspotsSorted.reduce((sum, f) => sum + (f.properties.score_logistico || 0), 0) / sweetspotsSorted.length;
const avgComercial = sweetspotsSorted.reduce((sum, f) => sum + (f.properties.score_comercial || 0), 0) / sweetspotsSorted.length;

const top1 = sweetspotsSorted[0]?.properties;
const top1Coords = sweetspotsSorted[0]?.geometry.coordinates;

display(html`
  <div class="grid grid-cols-2">
    <div class="card">
      <h3>⭐ Sweet Spot #1 (Recomendado)</h3>
      <div style="margin: 15px 0;">
        <div style="font-size: 2.5em; font-weight: bold; color: #d32f2f;">${top1?.score_compuesto?.toFixed(1) || 'N/A'}</div>
        <div style="font-size: 0.9em; color: #666;">Score Compuesto / 100</div>
      </div>
      <hr>
      <p><strong>Fortalezas:</strong></p>
      <ul>
        <li><strong>${top1?.clientes_5km || 'N/A'}</strong> clientes en radio de 5km</li>
        <li><strong>${top1?.clientes_10km || 'N/A'}</strong> clientes en radio de 10km</li>
        <li><strong>${top1?.establecimientos_2km || 'N/A'}</strong> establecimientos cercanos</li>
        <li>Score logístico: <strong>${top1?.score_logistico?.toFixed(1) || 'N/A'}</strong></li>
      </ul>
      <p><strong>📍 Coordenadas:</strong><br>
        <code>${top1Coords?.[1]?.toFixed(6)}, ${top1Coords?.[0]?.toFixed(6)}</code>
      </p>
    </div>
    <div class="card">
      <h3>📊 Promedios Top 10</h3>
      <div style="margin: 20px 0;">
        <div style="margin: 15px 0;">
          <div style="font-size: 1.5em; font-weight: bold; color: #1565c0;">${avgCompuesto.toFixed(1)}</div>
          <div style="font-size: 0.9em; color: #666;">Score Compuesto Promedio</div>
        </div>
        <div style="margin: 15px 0;">
          <div style="font-size: 1.5em; font-weight: bold; color: #1565c0;">${avgLogistico.toFixed(1)}</div>
          <div style="font-size: 0.9em; color: #666;">Score Logístico Promedio</div>
        </div>
        <div style="margin: 15px 0;">
          <div style="font-size: 1.5em; font-weight: bold; color: #1565c0;">${avgComercial.toFixed(1)}</div>
          <div style="font-size: 0.9em; color: #666;">Score Comercial Promedio</div>
        </div>
      </div>
    </div>
  </div>
`);
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

