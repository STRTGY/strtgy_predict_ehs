---
title: Top 20 Puntos de Venta Mayorista
toc: true
---

# 💰 Top 20 Puntos de Venta Mayorista B2B

Establecimientos con mayor potencial para distribución de Electrolit basado en:
- Score de volumen (tamaño y capacidad)
- Score de margen (rentabilidad potencial)
- Fit con Electrolit (perfil de productos y clientes)

```js
import {createMap, createCircleMarker, addPopup, addTooltip, createLegend, getColorForSegmento} from "../components/MapLeaflet.js";

// Load data
const top20Comercial = await FileAttachment("../data/top20_comercial.web.csv").csv({typed: true});
const top400 = await FileAttachment("../data/top400.web.geojson").json();

// Extract top 20 from top400 GeoJSON by filtering decil 1
const top20Features = top400.features
  .filter(f => f.properties.decil === 1)
  .sort((a, b) => (b.properties.score_electrolit || 0) - (a.properties.score_electrolit || 0))
  .slice(0, 20);
```

## Ranking de Establecimientos

```js
display(html`
  <div class="card">
    <h3>Top 20 Establecimientos por Potencial B2B</h3>
    <p>Priorizados por score compuesto (volumen + margen + fit)</p>
    <div style="overflow-x: auto;">
      <table style="width: 100%; margin-top: 10px; font-size: 13px;">
        <thead>
          <tr>
            <th>Rank</th>
            <th>Establecimiento</th>
            <th>Segmento</th>
            <th>Score</th>
            <th>Decil</th>
            <th>Colonia</th>
          </tr>
        </thead>
        <tbody>
          ${top20Features.map((f, i) => {
            const p = f.properties;
            const segmentoColor = getColorForSegmento(p.segmento);
            return `
              <tr>
                <td><strong>#${i + 1}</strong></td>
                <td style="max-width: 200px; overflow: hidden; text-overflow: ellipsis;">${p.nom_estab || 'N/A'}</td>
                <td>
                  <span style="display: inline-block; width: 10px; height: 10px; background: ${segmentoColor}; border-radius: 50%; margin-right: 5px;"></span>
                  ${p.segmento || 'N/A'}
                </td>
                <td>${p.score_electrolit?.toFixed(2) || 'N/A'}</td>
                <td>${p.decil || 'N/A'}</td>
                <td style="max-width: 150px; overflow: hidden; text-overflow: ellipsis;">${p.colonia || 'N/A'}</td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </div>
  </div>
`);
```

## Mapa Interactivo

```js
const mapContainer = display(document.createElement("div"));
mapContainer.style.width = "100%";
mapContainer.style.height = "600px";

const map = createMap(mapContainer);

// Add top 20 establishments as markers
top20Features.forEach((feature, index) => {
  const props = feature.properties;
  const coords = feature.geometry.coordinates;
  const latlng = [coords[1], coords[0]]; // GeoJSON is [lng, lat]
  
  const ranking = index + 1;
  
  // Determine marker size and color based on segment
  const segmentoColor = getColorForSegmento(props.segmento);
  const radius = ranking <= 5 ? 10 : ranking <= 10 ? 8 : 6;
  
  // Create marker
  const marker = createCircleMarker(latlng, {
    radius,
    color: segmentoColor,
    fillColor: segmentoColor,
    fillOpacity: 0.8,
    weight: 2
  });
  
  // Popup content
  const popupContent = `
    <div style="font-family: Arial; min-width: 250px;">
      <h4 style="color: ${segmentoColor}; margin: 0 0 10px 0;">💰 Punto Venta #${ranking}</h4>
      <b>Establecimiento:</b> ${props.nom_estab || 'N/A'}<br>
      <b>Segmento:</b> <span style="color: ${segmentoColor}; font-weight: bold;">${props.segmento || 'N/A'}</span><br>
      <hr style="margin: 8px 0;">
      <b>Score Electrolit:</b> ${props.score_electrolit?.toFixed(2) || 'N/A'}/100<br>
      <b>Decil:</b> ${props.decil || 'N/A'}<br>
      <hr style="margin: 8px 0;">
      <b>Componentes del Score:</b><br>
      • Volumen: ${props.score_volumen?.toFixed(1) || 'N/A'}<br>
      • Margen: ${props.score_margen?.toFixed(1) || 'N/A'}<br>
      • Fit Electrolit: ${props.score_fit?.toFixed(1) || 'N/A'}<br>
      <hr style="margin: 8px 0;">
      <b>📍 Ubicación:</b><br>
      ${props.colonia || 'N/A'}<br>
      <a href="https://www.google.com/maps?q=${latlng[0]},${latlng[1]}" target="_blank" style="color: ${segmentoColor};">
        🗺️ Ver en Google Maps
      </a>
    </div>
  `;
  
  addPopup(marker, popupContent);
  addTooltip(marker, `💰 #${ranking} - ${props.nom_estab?.substring(0, 30) || 'N/A'} - Score: ${props.score_electrolit?.toFixed(1) || 'N/A'}`);
  marker.addTo(map);
});

// Create legend
createLegend(map, [
  {type: "header", label: "Segmentos"},
  {type: "circle", color: getColorForSegmento("retail"), label: "Retail"},
  {type: "circle", color: getColorForSegmento("horeca"), label: "HoReCa"},
  {type: "circle", color: getColorForSegmento("institucional"), label: "Institucional"},
  {type: "circle", color: getColorForSegmento("otro"), label: "Otro"},
  {type: "separator"},
  {type: "header", label: "Tamaño de Marcador"},
  {type: "circle", color: "#666", label: "Top 5: Grande"},
  {type: "circle", color: "#666", label: "Top 6-10: Mediano"},
  {type: "circle", color: "#666", label: "Top 11-20: Pequeño"}
], "bottomright");
```

## Análisis por Segmento

```js
// Calculate statistics by segment
const segmentStats = {};
top20Features.forEach(f => {
  const seg = f.properties.segmento || 'otro';
  if (!segmentStats[seg]) {
    segmentStats[seg] = {count: 0, totalScore: 0, avgScore: 0};
  }
  segmentStats[seg].count++;
  segmentStats[seg].totalScore += f.properties.score_electrolit || 0;
});

Object.keys(segmentStats).forEach(seg => {
  segmentStats[seg].avgScore = segmentStats[seg].totalScore / segmentStats[seg].count;
});

display(html`
  <div class="card">
    <h3>Distribución por Segmento</h3>
    <div class="grid grid-cols-2">
      ${Object.entries(segmentStats).map(([seg, stats]) => `
        <div style="padding: 15px; border: 1px solid #e0e0e0; border-radius: 8px; margin: 5px;">
          <div style="display: flex; align-items: center; margin-bottom: 10px;">
            <span style="display: inline-block; width: 16px; height: 16px; background: ${getColorForSegmento(seg)}; border-radius: 50%; margin-right: 10px;"></span>
            <h4 style="margin: 0; text-transform: capitalize;">${seg}</h4>
          </div>
          <div style="font-size: 2em; font-weight: bold; color: ${getColorForSegmento(seg)};">${stats.count}</div>
          <div style="font-size: 0.9em; color: #666;">establecimientos</div>
          <div style="margin-top: 10px; font-size: 0.9em;">
            Score promedio: <strong>${stats.avgScore.toFixed(1)}</strong>
          </div>
        </div>
      `).join('')}
    </div>
  </div>
`);
```

## Componentes del Scoring

<div class="grid grid-cols-3">
  <div class="card">
    <h3>Score de Volumen</h3>
    <p><strong>Indicadores:</strong></p>
    <ul>
      <li>Personal ocupado (empleados)</li>
      <li>Tamaño del establecimiento</li>
      <li>Capacidad de compra estimada</li>
    </ul>
  </div>
  <div class="card">
    <h3>Score de Margen</h3>
    <p><strong>Indicadores:</strong></p>
    <ul>
      <li>Tipo de establecimiento</li>
      <li>Segmento de mercado</li>
      <li>Potencial de rentabilidad</li>
    </ul>
  </div>
  <div class="card">
    <h3>Fit con Electrolit</h3>
    <p><strong>Indicadores:</strong></p>
    <ul>
      <li>Perfil de productos actuales</li>
      <li>Tipo de clientes</li>
      <li>Alineación con marca</li>
    </ul>
  </div>
</div>

## Estadísticas Clave

```js
const avgScoreAll = top20Features.reduce((sum, f) => sum + (f.properties.score_electrolit || 0), 0) / top20Features.length;
const maxScore = Math.max(...top20Features.map(f => f.properties.score_electrolit || 0));
const minScore = Math.min(...top20Features.map(f => f.properties.score_electrolit || 0));

display(html`
  <div class="card">
    <h3>Estadísticas del Top 20</h3>
    <div class="grid grid-cols-3">
      <div>
        <div style="font-size: 2em; font-weight: bold; color: #2e7d32;">${avgScoreAll.toFixed(1)}</div>
        <div style="font-size: 0.9em; color: #666;">Score Promedio</div>
      </div>
      <div>
        <div style="font-size: 2em; font-weight: bold; color: #2e7d32;">${maxScore.toFixed(1)}</div>
        <div style="font-size: 0.9em; color: #666;">Score Máximo</div>
      </div>
      <div>
        <div style="font-size: 2em; font-weight: bold; color: #2e7d32;">${minScore.toFixed(1)}</div>
        <div style="font-size: 0.9em; color: #666;">Score Mínimo</div>
      </div>
    </div>
  </div>
`);
```

---

<div class="note">
  <strong>💡 Recomendaciones:</strong>
  <ul>
    <li>Priorizar contacto con establecimientos <strong>Top 5</strong> para conversión inmediata</li>
    <li>Segmentos <strong>Retail y HoReCa</strong> muestran mayor concentración</li>
    <li>Considerar <strong>cercanía con hubs logísticos</strong> para eficiencia de distribución</li>
    <li>Revisar <a href="/mapas/sweet-spots">Sweet Spots</a> para análisis combinado</li>
  </ul>
</div>

