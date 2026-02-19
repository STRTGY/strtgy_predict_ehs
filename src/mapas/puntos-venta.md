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
```

```js
// Load data
const top400 = await FileAttachment("../data/top400.web.geojson").json();
```

```js
// Calcular score compuesto y extraer top 20
// Fórmula: (40% volumen + 35% margen + 25% fit) normalizado a 100
const featuresConScore = (top400.features || []).map(f => {
  const p = f.properties || {};
  const scoreVolumen = p.score_volumen || 0;
  const scoreMargen = p.score_margen || 0;
  const scoreFit = p.score_fit || 0;
  
  // Score compuesto ponderado (normalizado a escala 0-100)
  const scoreCompuesto = (scoreVolumen * 0.40 + scoreMargen * 0.35 + scoreFit * 0.25) * 10;
  
  return {
    ...f,
    properties: {
      ...p,
      score_electrolit: scoreCompuesto
    }
  };
});

const top20Features = featuresConScore
  .sort((a, b) => (b.properties.score_electrolit || 0) - (a.properties.score_electrolit || 0))
  .slice(0, 20)
  .map((f, i) => ({
    ...f,
    properties: {
      ...f.properties,
      decil: Math.ceil((i + 1) / 2),
      ranking: i + 1
    }
  }));
```

```js
// Debug: mostrar conteo de datos
display(html`<div class="note" style="margin-bottom: 1rem;">
  <strong>📊 Datos cargados:</strong> ${top400?.features?.length || 0} establecimientos | 
  <strong>Top 20 calculados:</strong> ${top20Features?.length || 0} |
  <strong>Score máx:</strong> ${top20Features[0]?.properties?.score_electrolit?.toFixed(1) || 'N/A'}
</div>`);
```

## Ranking de Establecimientos

```js
// Crear tabla con DOM manipulation para evitar escape de HTML
const rankingCard = document.createElement("div");
rankingCard.className = "card";

const title = document.createElement("h3");
title.textContent = "Top 20 Establecimientos por Potencial B2B";
rankingCard.appendChild(title);

const subtitle = document.createElement("p");
subtitle.textContent = "Priorizados por score compuesto (volumen + margen + fit)";
rankingCard.appendChild(subtitle);

const tableWrapper = document.createElement("div");
tableWrapper.style.overflowX = "auto";

const table = document.createElement("table");
table.style.cssText = "width: 100%; margin-top: 10px; font-size: 13px; border-collapse: collapse;";

// Header
const thead = document.createElement("thead");
thead.innerHTML = `
  <tr style="background: #f5f5f5;">
    <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Rank</th>
    <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Establecimiento</th>
    <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Segmento</th>
    <th style="padding: 10px; text-align: center; border: 1px solid #ddd;">Score Total</th>
    <th style="padding: 10px; text-align: center; border: 1px solid #ddd;">Vol.</th>
    <th style="padding: 10px; text-align: center; border: 1px solid #ddd;">Marg.</th>
    <th style="padding: 10px; text-align: center; border: 1px solid #ddd;">Fit</th>
  </tr>
`;
table.appendChild(thead);

// Body
const tbody = document.createElement("tbody");
top20Features.forEach((f, i) => {
  const p = f.properties;
  const segmentoColor = getColorForSegmento(p.segmento);
  const row = document.createElement("tr");
  row.style.borderBottom = "1px solid #eee";
  
  // Determinar color de fila para top 3
  const bgColor = i < 3 ? 'rgba(46, 125, 50, 0.08)' : (i % 2 === 0 ? '#fff' : '#fafafa');
  row.style.background = bgColor;
  
  row.innerHTML = `
    <td style="padding: 8px; border: 1px solid #ddd;">
      <strong style="color: ${i < 3 ? '#2e7d32' : '#333'};">#${i + 1}</strong>
      ${i === 0 ? '<span style="margin-left: 4px;">🥇</span>' : ''}
      ${i === 1 ? '<span style="margin-left: 4px;">🥈</span>' : ''}
      ${i === 2 ? '<span style="margin-left: 4px;">🥉</span>' : ''}
    </td>
    <td style="padding: 8px; border: 1px solid #ddd; max-width: 200px; overflow: hidden; text-overflow: ellipsis;" title="${p.nom_estab || 'N/A'}">${p.nom_estab || 'N/A'}</td>
    <td style="padding: 8px; border: 1px solid #ddd;">
      <span style="display: inline-block; width: 10px; height: 10px; background: ${segmentoColor}; border-radius: 50%; margin-right: 5px;"></span>
      ${p.segmento || 'N/A'}
    </td>
    <td style="padding: 8px; border: 1px solid #ddd; text-align: center; font-weight: 700; color: #2e7d32; font-size: 1.1em;">${p.score_electrolit?.toFixed(1) || 'N/A'}</td>
    <td style="padding: 8px; border: 1px solid #ddd; text-align: center; color: #7b1fa2;">${p.score_volumen?.toFixed(1) || 'N/A'}</td>
    <td style="padding: 8px; border: 1px solid #ddd; text-align: center; color: #00796b;">${p.score_margen?.toFixed(1) || 'N/A'}</td>
    <td style="padding: 8px; border: 1px solid #ddd; text-align: center; color: #c62828;">${p.score_fit?.toFixed(1) || 'N/A'}</td>
  `;
  tbody.appendChild(row);
});
table.appendChild(tbody);

tableWrapper.appendChild(table);
rankingCard.appendChild(tableWrapper);

display(rankingCard);
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
  const medalEmoji = ranking === 1 ? '🥇' : ranking === 2 ? '🥈' : ranking === 3 ? '🥉' : '💰';
  const popupContent = `
    <div style="font-family: Arial; min-width: 280px;">
      <h4 style="color: ${segmentoColor}; margin: 0 0 10px 0;">${medalEmoji} Punto Venta #${ranking}</h4>
      <b>Establecimiento:</b> ${props.nom_estab || 'N/A'}<br>
      <b>Razón Social:</b> <span style="font-size: 0.9em; color: #666;">${props.raz_social || 'N/A'}</span><br>
      <b>Segmento:</b> <span style="color: ${segmentoColor}; font-weight: bold;">${props.segmento || 'N/A'}</span><br>
      <b>Personal:</b> ${props.per_ocu || 'N/A'}<br>
      <hr style="margin: 8px 0;">
      <b style="color: #2e7d32;">Score Compuesto: ${props.score_electrolit?.toFixed(1) || 'N/A'}</b><br>
      <div style="background: #f5f5f5; padding: 8px; border-radius: 4px; margin-top: 6px;">
        <b>Componentes:</b><br>
        <span style="color: #7b1fa2;">• Volumen (40%): ${props.score_volumen?.toFixed(1) || 'N/A'}</span><br>
        <span style="color: #00796b;">• Margen (35%): ${props.score_margen?.toFixed(1) || 'N/A'}</span><br>
        <span style="color: #c62828;">• Fit Electrolit (25%): ${props.score_fit?.toFixed(1) || 'N/A'}</span>
      </div>
      <hr style="margin: 8px 0;">
      <a href="https://www.google.com/maps?q=${latlng[0]},${latlng[1]}" target="_blank" style="color: ${segmentoColor}; font-weight: bold;">
        🗺️ Ver en Google Maps
      </a>
    </div>
  `;
  
  addPopup(marker, popupContent);
  addTooltip(marker, `${medalEmoji} #${ranking} - ${props.nom_estab?.substring(0, 25) || 'N/A'} - Score: ${props.score_electrolit?.toFixed(1) || 'N/A'}`);
  marker.addTo(map);
});

// Obtener segmentos únicos presentes en top20
const segmentosPresentes = [...new Set(top20Features.map(f => f.properties.segmento).filter(Boolean))];

// Crear items de leyenda solo para segmentos presentes
const legendItems = [
  {type: "header", label: "Segmentos"},
  ...segmentosPresentes.map(seg => ({
    type: "circle", 
    color: getColorForSegmento(seg), 
    label: seg.charAt(0).toUpperCase() + seg.slice(1)
  })),
  {type: "separator"},
  {type: "header", label: "Tamaño de Marcador"},
  {type: "circle", color: "#666", label: "Top 5: Grande"},
  {type: "circle", color: "#666", label: "Top 6-10: Mediano"},
  {type: "circle", color: "#666", label: "Top 11-20: Pequeño"}
];

createLegend(map, legendItems, "bottomright");
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

// Crear con DOM manipulation para evitar escape de HTML
const segmentCard = document.createElement("div");
segmentCard.className = "card";

const segTitle = document.createElement("h3");
segTitle.textContent = "Distribución por Segmento";
segmentCard.appendChild(segTitle);

const segGrid = document.createElement("div");
segGrid.className = "grid grid-cols-2";
segGrid.style.gap = "0.5rem";

Object.entries(segmentStats).forEach(([seg, stats]) => {
  const segBox = document.createElement("div");
  segBox.style.cssText = "padding: 15px; border: 1px solid #e0e0e0; border-radius: 8px;";
  segBox.innerHTML = `
    <div style="display: flex; align-items: center; margin-bottom: 10px;">
      <span style="display: inline-block; width: 16px; height: 16px; background: ${getColorForSegmento(seg)}; border-radius: 50%; margin-right: 10px;"></span>
      <h4 style="margin: 0; text-transform: capitalize;">${seg}</h4>
    </div>
    <div style="font-size: 2em; font-weight: bold; color: ${getColorForSegmento(seg)};">${stats.count}</div>
    <div style="font-size: 0.9em; color: #666;">establecimientos</div>
    <div style="margin-top: 10px; font-size: 0.9em;">
      Score promedio: <strong>${stats.avgScore.toFixed(1)}</strong>
    </div>
  `;
  segGrid.appendChild(segBox);
});

segmentCard.appendChild(segGrid);
display(segmentCard);
```

## Componentes del Scoring

```js
// Crear cards de metodología con DOM manipulation
const metodoContainer = document.createElement("div");
metodoContainer.className = "grid grid-cols-3";
metodoContainer.style.gap = "1rem";

const componentes = [
  {
    titulo: "Score de Volumen",
    peso: "40%",
    color: "#7b1fa2",
    indicadores: [
      "Personal ocupado (empleados)",
      "Tamaño del establecimiento",
      "Capacidad de compra estimada"
    ]
  },
  {
    titulo: "Score de Margen",
    peso: "35%",
    color: "#00796b",
    indicadores: [
      "Tipo de establecimiento",
      "Segmento de mercado",
      "Potencial de rentabilidad"
    ]
  },
  {
    titulo: "Fit con Electrolit",
    peso: "25%",
    color: "#c62828",
    indicadores: [
      "Perfil de productos actuales",
      "Tipo de clientes",
      "Alineación con marca"
    ]
  }
];

componentes.forEach(comp => {
  const card = document.createElement("div");
  card.className = "card";
  card.style.borderLeft = `4px solid ${comp.color}`;
  
  const listaItems = comp.indicadores.map(ind => `<li>${ind}</li>`).join('');
  
  card.innerHTML = `
    <h3 style="color: ${comp.color}; margin-top: 0;">${comp.titulo}</h3>
    <div style="background: ${comp.color}; color: white; display: inline-block; padding: 4px 12px; border-radius: 12px; font-size: 0.85rem; font-weight: 600; margin-bottom: 10px;">
      Peso: ${comp.peso}
    </div>
    <p><strong>Indicadores:</strong></p>
    <ul style="margin: 0; padding-left: 20px;">
      ${listaItems}
    </ul>
  `;
  metodoContainer.appendChild(card);
});

display(metodoContainer);
```

```js
// Fórmula del score
const formulaCard = document.createElement("div");
formulaCard.className = "card";
formulaCard.style.cssText = "background: linear-gradient(135deg, #e8f5e9 0%, white 100%); border: 2px solid #2e7d32; margin-top: 1rem;";
formulaCard.innerHTML = `
  <h3 style="margin-top: 0; color: #2e7d32;">📊 Fórmula del Score Compuesto</h3>
  <div style="background: white; padding: 15px; border-radius: 8px; font-family: monospace; font-size: 1.1em; text-align: center; border: 1px solid #ddd;">
    <span style="color: #2e7d32; font-weight: bold;">Score</span> = 
    (<span style="color: #7b1fa2;">Volumen</span> × 0.40 + 
    <span style="color: #00796b;">Margen</span> × 0.35 + 
    <span style="color: #c62828;">Fit</span> × 0.25) × 10
  </div>
  <p style="margin-top: 15px; color: #666; font-size: 0.9rem;">
    <strong>Escala:</strong> 0-100 puntos. Los establecimientos se ordenan de mayor a menor score para identificar las mejores oportunidades de distribución B2B.
  </p>
`;
display(formulaCard);
```

## Estadísticas Clave

```js
const avgScoreAll = top20Features.reduce((sum, f) => sum + (f.properties.score_electrolit || 0), 0) / top20Features.length;
const maxScore = Math.max(...top20Features.map(f => f.properties.score_electrolit || 0));
const minScore = Math.min(...top20Features.map(f => f.properties.score_electrolit || 0));

// Promedios de componentes
const avgVolumen = top20Features.reduce((sum, f) => sum + (f.properties.score_volumen || 0), 0) / top20Features.length;
const avgMargen = top20Features.reduce((sum, f) => sum + (f.properties.score_margen || 0), 0) / top20Features.length;
const avgFit = top20Features.reduce((sum, f) => sum + (f.properties.score_fit || 0), 0) / top20Features.length;

// Crear con DOM manipulation
const statsCard = document.createElement("div");
statsCard.className = "card";

const statsTitle = document.createElement("h3");
statsTitle.textContent = "Estadísticas del Top 20";
statsCard.appendChild(statsTitle);

const statsGrid = document.createElement("div");
statsGrid.className = "grid grid-cols-3";
statsGrid.style.gap = "1rem";
statsGrid.style.marginBottom = "1.5rem";

// Score stats
const statsData = [
  { value: avgScoreAll.toFixed(1), label: "Score Promedio", color: "#2e7d32" },
  { value: maxScore.toFixed(1), label: "Score Máximo", color: "#1565c0" },
  { value: minScore.toFixed(1), label: "Score Mínimo", color: "#f57c00" }
];

statsData.forEach(stat => {
  const statDiv = document.createElement("div");
  statDiv.style.textAlign = "center";
  statDiv.innerHTML = `
    <div style="font-size: 2em; font-weight: bold; color: ${stat.color};">${stat.value}</div>
    <div style="font-size: 0.9em; color: #666;">${stat.label}</div>
  `;
  statsGrid.appendChild(statDiv);
});

statsCard.appendChild(statsGrid);

// Componentes promedio
const compTitle = document.createElement("h4");
compTitle.textContent = "Componentes Promedio del Score";
compTitle.style.marginTop = "1rem";
compTitle.style.marginBottom = "0.5rem";
statsCard.appendChild(compTitle);

const compGrid = document.createElement("div");
compGrid.className = "grid grid-cols-3";
compGrid.style.gap = "1rem";

const compData = [
  { value: avgVolumen.toFixed(1), label: "Volumen (40%)", color: "#7b1fa2" },
  { value: avgMargen.toFixed(1), label: "Margen (35%)", color: "#00796b" },
  { value: avgFit.toFixed(1), label: "Fit Electrolit (25%)", color: "#c62828" }
];

compData.forEach(comp => {
  const compDiv = document.createElement("div");
  compDiv.style.cssText = "text-align: center; padding: 10px; background: #f5f5f5; border-radius: 8px;";
  compDiv.innerHTML = `
    <div style="font-size: 1.5em; font-weight: bold; color: ${comp.color};">${comp.value}</div>
    <div style="font-size: 0.85em; color: #666;">${comp.label}</div>
  `;
  compGrid.appendChild(compDiv);
});

statsCard.appendChild(compGrid);
display(statsCard);
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

