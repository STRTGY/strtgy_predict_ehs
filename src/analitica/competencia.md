---
title: Análisis de Competencia
toc: true
---

# 📊 Análisis de Competencia y Zonas de Oportunidad

Análisis espacial de densidad de competidores y identificación de zonas con alta demanda y baja competencia.

```js
import {createMap, addGeoJsonLayer, createLegend} from "../components/MapLeaflet.js";
```

```js
// Load data
const zonasOportunidad = await FileAttachment("../data/zonas_oportunidad.web.geojson").json();
```

## Zonas de Oportunidad

Las **Zonas de Oportunidad** son AGEBs clasificados por su potencial comercial considerando:
- Densidad de establecimientos existentes
- Nivel de competencia en la zona
- Score de oportunidad calculado

```js
// Calculate statistics usando los campos reales del GeoJSON
const totalZonas = zonasOportunidad.features.length;
const zonasAlta = zonasOportunidad.features.filter(f => f.properties.oportunidad_tipo === 'Alta').length;
const zonasMedia = zonasOportunidad.features.filter(f => f.properties.oportunidad_tipo === 'Media').length;
const zonasBaja = zonasOportunidad.features.filter(f => f.properties.oportunidad_tipo === 'Baja').length;

// Estadísticas adicionales
const avgScore = zonasOportunidad.features.reduce((sum, f) => sum + (f.properties.opportunity_score || 0), 0) / totalZonas;
const totalCompetidores = zonasOportunidad.features.reduce((sum, f) => sum + (f.properties.n_competitors || 0), 0);

// Crear card con DOM manipulation
const statsCard = document.createElement("div");
statsCard.className = "card";

const statsTitle = document.createElement("h3");
statsTitle.textContent = "Resumen de Zonas de Oportunidad";
statsCard.appendChild(statsTitle);

const statsGrid = document.createElement("div");
statsGrid.className = "grid grid-cols-4";
statsGrid.style.gap = "1rem";

const statsData = [
  { value: totalZonas, label: "Total AGEBs", color: "#1565c0" },
  { value: zonasAlta, label: "Oportunidad Alta", color: "#2e7d32" },
  { value: zonasMedia, label: "Oportunidad Media", color: "#f57c00" },
  { value: zonasBaja, label: "Oportunidad Baja", color: "#9e9e9e" }
];

statsData.forEach(stat => {
  const statDiv = document.createElement("div");
  statDiv.style.textAlign = "center";
  statDiv.innerHTML = `
    <div style="font-size: 2.2em; font-weight: bold; color: ${stat.color};">${stat.value}</div>
    <div style="font-size: 0.9em; color: #666;">${stat.label}</div>
  `;
  statsGrid.appendChild(statDiv);
});

statsCard.appendChild(statsGrid);

// Métricas adicionales
const metricsDiv = document.createElement("div");
metricsDiv.style.cssText = "margin-top: 1rem; padding-top: 1rem; border-top: 1px solid #e0e0e0; display: flex; gap: 2rem; justify-content: center;";
metricsDiv.innerHTML = `
  <div style="text-align: center;">
    <div style="font-size: 1.5em; font-weight: 600; color: #7b1fa2;">${avgScore.toFixed(1)}</div>
    <div style="font-size: 0.85em; color: #666;">Score Promedio</div>
  </div>
  <div style="text-align: center;">
    <div style="font-size: 1.5em; font-weight: 600; color: #c62828;">${totalCompetidores}</div>
    <div style="font-size: 0.85em; color: #666;">Total Competidores</div>
  </div>
`;
statsCard.appendChild(metricsDiv);

display(statsCard);
```

## Mapa: Zonas de Oportunidad

```js
const mapContainer1 = display(document.createElement("div"));
mapContainer1.style.width = "100%";
mapContainer1.style.height = "600px";

const map1 = createMap(mapContainer1);

// Style function usando oportunidad_tipo del GeoJSON
function getOportunidadStyle(feature) {
  const tipo = feature.properties.oportunidad_tipo;
  let fillColor, fillOpacity;
  
  switch(tipo) {
    case 'Alta':
      fillColor = "#2e7d32";
      fillOpacity = 0.7;
      break;
    case 'Media':
      fillColor = "#f57c00";
      fillOpacity = 0.5;
      break;
    case 'Baja':
      fillColor = "#9e9e9e";
      fillOpacity = 0.3;
      break;
    default:
      fillColor = "#e0e0e0";
      fillOpacity = 0.2;
  }
  
  return {
    fillColor,
    fillOpacity,
    color: "#333",
    weight: 1,
    opacity: 0.5
  };
}

// Add opportunity zones layer
addGeoJsonLayer(map1, zonasOportunidad, {
  style: getOportunidadStyle,
  onEachFeature: (feature, layer) => {
    const props = feature.properties;
    const tipoColor = props.oportunidad_tipo === 'Alta' ? '#2e7d32' : 
                      props.oportunidad_tipo === 'Media' ? '#f57c00' : '#9e9e9e';
    const popupContent = `
      <div style="font-family: Arial; min-width: 240px;">
        <h4 style="margin: 0 0 10px 0; color: ${tipoColor};">Zona de Oportunidad</h4>
        <b>AGEB:</b> <code>${props.CVEGEO || 'N/A'}</code><br>
        <b>Tipo:</b> <span style="font-weight: bold; color: ${tipoColor};">${props.oportunidad_tipo || 'N/A'}</span><br>
        <b>Zona:</b> ${props.zona_tipo || 'N/A'}<br>
        <hr style="margin: 8px 0;">
        <div style="background: #f5f5f5; padding: 8px; border-radius: 4px;">
          <b>Score Oportunidad:</b> <span style="color: ${tipoColor}; font-weight: 600;">${props.opportunity_score?.toFixed(1) || 'N/A'}</span><br>
          <b>Competidores:</b> ${props.n_competitors || 0}<br>
          <b>Establecimientos:</b> ${props.n_establecimientos || 0}<br>
          <b>Población:</b> ${props.pob_total?.toLocaleString() || 'N/A'}
        </div>
      </div>
    `;
    layer.bindPopup(popupContent, {maxWidth: 280});
    layer.bindTooltip(`AGEB ${props.CVEGEO?.slice(-4) || 'N/A'} - ${props.oportunidad_tipo || 'N/A'}`, {sticky: true});
  }
});

// Create legend
createLegend(map1, [
  {type: "header", label: "Tipo de Oportunidad"},
  {type: "square", color: "#2e7d32", label: "Alta"},
  {type: "square", color: "#f57c00", label: "Media"},
  {type: "square", color: "#9e9e9e", label: "Baja"}
], "bottomright");
```

## Mapa: Densidad de Competencia

```js
const mapContainer2 = display(document.createElement("div"));
mapContainer2.style.width = "100%";
mapContainer2.style.height = "600px";

const map2 = createMap(mapContainer2);

// Style function basada en número de competidores
function getCompetenciaStyle(feature) {
  const competitors = feature.properties.n_competitors || 0;
  let fillColor, fillOpacity;
  
  if (competitors === 0) {
    fillColor = "#2e7d32"; // Verde - sin competencia
    fillOpacity = 0.6;
  } else if (competitors <= 3) {
    fillColor = "#8bc34a"; // Verde claro - baja competencia
    fillOpacity = 0.5;
  } else if (competitors <= 10) {
    fillColor = "#ffc107"; // Amarillo - competencia moderada
    fillOpacity = 0.5;
  } else {
    fillColor = "#f44336"; // Rojo - alta competencia
    fillOpacity = 0.6;
  }
  
  return {
    fillColor,
    fillOpacity,
    color: "#333",
    weight: 1,
    opacity: 0.4
  };
}

// Add competition density layer
addGeoJsonLayer(map2, zonasOportunidad, {
  style: getCompetenciaStyle,
  onEachFeature: (feature, layer) => {
    const props = feature.properties;
    const competitors = props.n_competitors || 0;
    const compColor = competitors === 0 ? '#2e7d32' : competitors <= 3 ? '#8bc34a' : competitors <= 10 ? '#ffc107' : '#f44336';
    const compLabel = competitors === 0 ? 'Sin competencia' : competitors <= 3 ? 'Baja' : competitors <= 10 ? 'Moderada' : 'Alta';
    
    const popupContent = `
      <div style="font-family: Arial; min-width: 220px;">
        <h4 style="margin: 0 0 10px 0; color: ${compColor};">Densidad de Competencia</h4>
        <b>AGEB:</b> <code>${props.CVEGEO || 'N/A'}</code><br>
        <b>Zona:</b> ${props.zona_tipo || 'N/A'}<br>
        <hr style="margin: 8px 0;">
        <div style="text-align: center; padding: 10px; background: ${compColor}20; border-radius: 8px; margin-bottom: 8px;">
          <div style="font-size: 2em; font-weight: bold; color: ${compColor};">${competitors}</div>
          <div style="font-size: 0.85em; color: #666;">Competidores</div>
          <div style="font-size: 0.8em; color: ${compColor}; font-weight: 600;">${compLabel}</div>
        </div>
        <b>Establecimientos:</b> ${props.n_establecimientos || 0}<br>
        <b>Densidad Comercial:</b> ${props.densidad_comercial?.toFixed(1) || 'N/A'}
      </div>
    `;
    layer.bindPopup(popupContent, {maxWidth: 260});
    layer.bindTooltip(`${competitors} competidores - ${compLabel}`, {sticky: true});
  }
});

// Create legend
createLegend(map2, [
  {type: "header", label: "Nivel de Competencia"},
  {type: "square", color: "#2e7d32", label: "Sin competencia (0)"},
  {type: "square", color: "#8bc34a", label: "Baja (1-3)"},
  {type: "square", color: "#ffc107", label: "Moderada (4-10)"},
  {type: "square", color: "#f44336", label: "Alta (>10)"}
], "bottomright");
```

## Análisis por Tipo de Zona

```js
// Estadísticas por tipo de zona
const zonaStats = {};
zonasOportunidad.features.forEach(f => {
  const zona = f.properties.zona_tipo || 'Sin clasificar';
  if (!zonaStats[zona]) {
    zonaStats[zona] = {count: 0, avgScore: 0, totalCompetidores: 0, totalEstab: 0};
  }
  zonaStats[zona].count++;
  zonaStats[zona].avgScore += f.properties.opportunity_score || 0;
  zonaStats[zona].totalCompetidores += f.properties.n_competitors || 0;
  zonaStats[zona].totalEstab += f.properties.n_establecimientos || 0;
});

Object.keys(zonaStats).forEach(zona => {
  zonaStats[zona].avgScore = zonaStats[zona].avgScore / zonaStats[zona].count;
});

// Crear tabla con DOM manipulation
const zonaCard = document.createElement("div");
zonaCard.className = "card";

const zonaTitle = document.createElement("h3");
zonaTitle.textContent = "Distribución por Tipo de Zona";
zonaCard.appendChild(zonaTitle);

const zonaTable = document.createElement("table");
zonaTable.style.cssText = "width: 100%; margin-top: 10px; border-collapse: collapse;";

const zonaThead = document.createElement("thead");
zonaThead.innerHTML = `
  <tr style="background: #f5f5f5;">
    <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Tipo de Zona</th>
    <th style="padding: 10px; text-align: center; border: 1px solid #ddd;">AGEBs</th>
    <th style="padding: 10px; text-align: center; border: 1px solid #ddd;">Score Prom.</th>
    <th style="padding: 10px; text-align: center; border: 1px solid #ddd;">Competidores</th>
    <th style="padding: 10px; text-align: center; border: 1px solid #ddd;">Establecimientos</th>
  </tr>
`;
zonaTable.appendChild(zonaThead);

const zonaTbody = document.createElement("tbody");
const sortedZonas = Object.entries(zonaStats).sort((a, b) => b[1].avgScore - a[1].avgScore);

sortedZonas.forEach(([zona, stats], idx) => {
  const row = document.createElement("tr");
  row.style.background = idx % 2 === 0 ? '#fff' : '#fafafa';
  row.innerHTML = `
    <td style="padding: 8px; border: 1px solid #ddd;"><strong>${zona}</strong></td>
    <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${stats.count}</td>
    <td style="padding: 8px; border: 1px solid #ddd; text-align: center; color: #7b1fa2; font-weight: 600;">${stats.avgScore.toFixed(1)}</td>
    <td style="padding: 8px; border: 1px solid #ddd; text-align: center; color: #c62828;">${stats.totalCompetidores}</td>
    <td style="padding: 8px; border: 1px solid #ddd; text-align: center; color: #1565c0;">${stats.totalEstab}</td>
  `;
  zonaTbody.appendChild(row);
});

zonaTable.appendChild(zonaTbody);
zonaCard.appendChild(zonaTable);
display(zonaCard);
```

## Criterios de Evaluación

```js
// Crear cards de metodología con DOM manipulation
const criteriosGrid = document.createElement("div");
criteriosGrid.className = "grid grid-cols-2";
criteriosGrid.style.gap = "1rem";

// Card 1: Score de Oportunidad
const card1 = document.createElement("div");
card1.className = "card";
card1.style.borderLeft = "4px solid #2e7d32";
card1.innerHTML = `
  <h3 style="margin-top: 0; color: #2e7d32;">📊 Score de Oportunidad</h3>
  <p><strong>Factores considerados:</strong></p>
  <ul style="margin-bottom: 1rem;">
    <li>Densidad comercial del área</li>
    <li>Número de competidores directos</li>
    <li>Score promedio de establecimientos</li>
    <li>Población del AGEB</li>
  </ul>
  <p><strong>Clasificación:</strong></p>
  <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.5rem; margin-top: 0.5rem;">
    <div style="background: #2e7d32; color: white; padding: 8px; border-radius: 4px; text-align: center; font-size: 0.85em;">
      <strong>Alta</strong><br>Score > 60
    </div>
    <div style="background: #f57c00; color: white; padding: 8px; border-radius: 4px; text-align: center; font-size: 0.85em;">
      <strong>Media</strong><br>Score 40-60
    </div>
    <div style="background: #9e9e9e; color: white; padding: 8px; border-radius: 4px; text-align: center; font-size: 0.85em;">
      <strong>Baja</strong><br>Score < 40
    </div>
  </div>
`;
criteriosGrid.appendChild(card1);

// Card 2: Análisis de Competencia
const card2 = document.createElement("div");
card2.className = "card";
card2.style.borderLeft = "4px solid #c62828";
card2.innerHTML = `
  <h3 style="margin-top: 0; color: #c62828;">🎯 Análisis de Competencia</h3>
  <p><strong>Niveles de saturación:</strong></p>
  <ul style="margin-bottom: 1rem;">
    <li><strong style="color: #2e7d32;">Sin competencia:</strong> Mercado virgen, máxima oportunidad</li>
    <li><strong style="color: #8bc34a;">Baja (1-3):</strong> Espacio para crecimiento</li>
    <li><strong style="color: #ffc107;">Moderada (4-10):</strong> Mercado establecido</li>
    <li><strong style="color: #f44336;">Alta (>10):</strong> Mercado saturado</li>
  </ul>
  <p style="font-size: 0.9em; color: #666; background: #f5f5f5; padding: 10px; border-radius: 4px;">
    <strong>💡 Recomendación:</strong> Priorizar zonas con oportunidad Alta/Media y competencia Baja/Sin competencia.
  </p>
`;
criteriosGrid.appendChild(card2);

display(criteriosGrid);
```

## Top 10 AGEBs con Mayor Oportunidad

```js
// Ordenar por score de oportunidad
const top10Agebs = zonasOportunidad.features
  .filter(f => f.properties.opportunity_score != null)
  .sort((a, b) => (b.properties.opportunity_score || 0) - (a.properties.opportunity_score || 0))
  .slice(0, 10);

// Crear tabla con DOM manipulation
const top10Card = document.createElement("div");
top10Card.className = "card";

const top10Title = document.createElement("h3");
top10Title.textContent = "Top 10 AGEBs por Score de Oportunidad";
top10Card.appendChild(top10Title);

const top10Table = document.createElement("table");
top10Table.style.cssText = "width: 100%; margin-top: 10px; border-collapse: collapse; font-size: 13px;";

const top10Thead = document.createElement("thead");
top10Thead.innerHTML = `
  <tr style="background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);">
    <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Rank</th>
    <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">CVEGEO</th>
    <th style="padding: 10px; text-align: center; border: 1px solid #ddd;">Score</th>
    <th style="padding: 10px; text-align: center; border: 1px solid #ddd;">Tipo</th>
    <th style="padding: 10px; text-align: center; border: 1px solid #ddd;">Zona</th>
    <th style="padding: 10px; text-align: center; border: 1px solid #ddd;">Competidores</th>
    <th style="padding: 10px; text-align: center; border: 1px solid #ddd;">Población</th>
  </tr>
`;
top10Table.appendChild(top10Thead);

const top10Tbody = document.createElement("tbody");
top10Agebs.forEach((f, i) => {
  const p = f.properties;
  const row = document.createElement("tr");
  const isTop3 = i < 3;
  const tipoColor = p.oportunidad_tipo === 'Alta' ? '#2e7d32' : p.oportunidad_tipo === 'Media' ? '#f57c00' : '#9e9e9e';
  
  row.style.background = isTop3 ? 'rgba(46, 125, 50, 0.08)' : (i % 2 === 0 ? '#fff' : '#fafafa');
  row.innerHTML = `
    <td style="padding: 8px; border: 1px solid #ddd;">
      <strong style="color: ${isTop3 ? '#2e7d32' : '#333'};">#${i + 1}</strong>
      ${i === 0 ? ' 🥇' : i === 1 ? ' 🥈' : i === 2 ? ' 🥉' : ''}
    </td>
    <td style="padding: 8px; border: 1px solid #ddd;"><code style="font-size: 0.85em;">${p.CVEGEO || 'N/A'}</code></td>
    <td style="padding: 8px; border: 1px solid #ddd; text-align: center; font-weight: 700; color: #2e7d32; font-size: 1.1em;">${p.opportunity_score?.toFixed(1) || 'N/A'}</td>
    <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">
      <span style="background: ${tipoColor}; color: white; padding: 2px 8px; border-radius: 10px; font-size: 0.8em;">${p.oportunidad_tipo || 'N/A'}</span>
    </td>
    <td style="padding: 8px; border: 1px solid #ddd; text-align: center; font-size: 0.9em;">${p.zona_tipo || 'N/A'}</td>
    <td style="padding: 8px; border: 1px solid #ddd; text-align: center; color: ${p.n_competitors > 5 ? '#c62828' : '#2e7d32'};">${p.n_competitors || 0}</td>
    <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${p.pob_total?.toLocaleString() || 'N/A'}</td>
  `;
  top10Tbody.appendChild(row);
});

top10Table.appendChild(top10Tbody);
top10Card.appendChild(top10Table);
display(top10Card);
```

## Recomendaciones Estratégicas

```js
// Crear cards de recomendaciones con DOM manipulation
const recomCard = document.createElement("div");
recomCard.className = "note";
recomCard.style.cssText = "background: linear-gradient(135deg, #e3f2fd 0%, white 100%); border-left: 4px solid #1565c0; padding: 1.5rem;";
recomCard.innerHTML = `
  <h3 style="margin-top: 0; color: #1565c0;">💡 Insights Clave</h3>
  <ul style="margin-bottom: 0;">
    <li><strong style="color: #2e7d32;">Zonas de Alta Oportunidad:</strong> Presentan el mejor balance entre demanda y baja competencia. Enfocar esfuerzos comerciales aquí.</li>
    <li><strong style="color: #7b1fa2;">Top 10 AGEBs:</strong> Máximo potencial identificado. Considerar para primeras acciones comerciales.</li>
    <li><strong style="color: #f57c00;">Zonas sin Competencia:</strong> Mercados vírgenes con oportunidad de primer movedor.</li>
    <li><strong style="color: #c62828;">Saturación:</strong> Evitar AGEBs con >10 competidores salvo que el potencial justifique la inversión.</li>
  </ul>
`;
display(recomCard);
```

---

```js
// Card de siguientes pasos
const nextStepsCard = document.createElement("div");
nextStepsCard.className = "card";
nextStepsCard.style.cssText = "background: #f5f5f5; border: 1px solid #e0e0e0;";
nextStepsCard.innerHTML = `
  <h3 style="margin-top: 0;">📋 Siguientes Pasos</h3>
  <ol style="margin-bottom: 0;">
    <li>Revisar <a href="/mapas/sweet-spots" style="color: #d32f2f; font-weight: 600;">Sweet Spots</a> para identificar ubicaciones que coincidan con zonas de alta oportunidad</li>
    <li>Analizar <a href="/mapas/hubs" style="color: #f44336; font-weight: 600;">Hubs Logísticos</a> para cobertura óptima de zonas prioritarias</li>
    <li>Priorizar <a href="/mapas/puntos-venta" style="color: #2e7d32; font-weight: 600;">Puntos de Venta</a> en zonas con alta oportunidad y baja competencia</li>
    <li>Revisar <a href="/mapas/isocronas" style="color: #f57c00; font-weight: 600;">Isócronas</a> para análisis de tiempos de cobertura</li>
  </ol>
`;
display(nextStepsCard);
```

