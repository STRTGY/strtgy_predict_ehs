---
title: Análisis de Competencia
toc: true
---

# 📊 Análisis de Competencia y Zonas de Oportunidad

Análisis espacial de densidad de competidores y identificación de zonas con alta demanda y baja competencia.

```js
import {createMap, addGeoJsonLayer, createLegend, getColorForScore} from "../components/MapLeaflet.js";

// Load data
const zonasOportunidad = await FileAttachment("../data/zonas_oportunidad.web.geojson").json();
const agebsDist = await FileAttachment("../data/agebs_dist.web.geojson").json();
```

## Zonas de Oportunidad

Las **Zonas de Oportunidad** son AGEBs que presentan:
- Alta concentración de clientes objetivo (Top 400)
- Baja densidad de competidores directos
- Alto ratio de oportunidad (demanda vs. oferta)

```js
// Calculate statistics
const totalZonas = zonasOportunidad.features.length;
const zonasAlta = zonasOportunidad.features.filter(f => f.properties.prioridad === 'Alta').length;
const zonasMedia = zonasOportunidad.features.filter(f => f.properties.prioridad === 'Media').length;
const zonasBaja = zonasOportunidad.features.filter(f => f.properties.prioridad === 'Baja').length;

display(html`
  <div class="card">
    <h3>Resumen de Zonas de Oportunidad</h3>
    <div class="grid grid-cols-4">
      <div>
        <div style="font-size: 2em; font-weight: bold; color: #1565c0;">${totalZonas}</div>
        <div style="font-size: 0.9em; color: #666;">Total AGEBs</div>
      </div>
      <div>
        <div style="font-size: 2em; font-weight: bold; color: #2e7d32;">${zonasAlta}</div>
        <div style="font-size: 0.9em; color: #666;">Prioridad Alta</div>
      </div>
      <div>
        <div style="font-size: 2em; font-weight: bold; color: #f57c00;">${zonasMedia}</div>
        <div style="font-size: 0.9em; color: #666;">Prioridad Media</div>
      </div>
      <div>
        <div style="font-size: 2em; font-weight: bold; color: #9e9e9e;">${zonasBaja}</div>
        <div style="font-size: 0.9em; color: #666;">Prioridad Baja</div>
      </div>
    </div>
  </div>
`);
```

## Mapa: Zonas de Oportunidad por Prioridad

```js
const mapContainer1 = display(document.createElement("div"));
mapContainer1.style.width = "100%";
mapContainer1.style.height = "600px";

const map1 = createMap(mapContainer1);

// Style function for opportunity zones
function getOportunidadStyle(feature) {
  const prioridad = feature.properties.prioridad;
  let fillColor, fillOpacity;
  
  switch(prioridad) {
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
const oportunidadLayer = addGeoJsonLayer(map1, zonasOportunidad, {
  style: getOportunidadStyle,
  onEachFeature: (feature, layer) => {
    const props = feature.properties;
    const popupContent = `
      <div style="font-family: Arial; min-width: 220px;">
        <h4 style="margin: 0 0 10px 0;">Zona de Oportunidad</h4>
        <b>AGEB:</b> ${props.CVEGEO || 'N/A'}<br>
        <b>Prioridad:</b> <span style="font-weight: bold; color: ${
          props.prioridad === 'Alta' ? '#2e7d32' : 
          props.prioridad === 'Media' ? '#f57c00' : '#9e9e9e'
        };">${props.prioridad || 'N/A'}</span><br>
        <hr style="margin: 8px 0;">
        <b>Clientes Objetivo:</b> ${props.clientes_objetivo || 'N/A'}<br>
        <b>Competidores:</b> ${props.competidores || 'N/A'}<br>
        <b>Ratio Oportunidad:</b> ${props.ratio_oportunidad?.toFixed(2) || 'N/A'}<br>
      </div>
    `;
    layer.bindPopup(popupContent, {maxWidth: 250});
    layer.bindTooltip(`AGEB ${props.CVEGEO || 'N/A'} - ${props.prioridad || 'N/A'}`, {sticky: true});
  }
});

// Create legend
createLegend(map1, [
  {type: "header", label: "Prioridad de Zona"},
  {type: "square", color: "#2e7d32", label: "Alta (Mejor Oportunidad)"},
  {type: "square", color: "#f57c00", label: "Media"},
  {type: "square", color: "#9e9e9e", label: "Baja"},
  {type: "separator"},
  {type: "header", label: "Criterios"},
  {type: "square", color: "#e8f5e9", label: "• Clientes objetivo > Competidores"},
  {type: "square", color: "#e8f5e9", label: "• Alto ratio de oportunidad"},
  {type: "square", color: "#e8f5e9", label: "• Baja saturación de mercado"}
], "bottomright");
```

## Mapa: Score de Distribución por AGEB

```js
const mapContainer2 = display(document.createElement("div"));
mapContainer2.style.width = "100%";
mapContainer2.style.height = "600px";

const map2 = createMap(mapContainer2);

// Style function for distribution score
function getDistStyle(feature) {
  const categoria = feature.properties.categoria_dist;
  let fillColor, fillOpacity;
  
  switch(categoria) {
    case 'Excelente':
      fillColor = "#1a237e";
      fillOpacity = 0.7;
      break;
    case 'Bueno':
      fillColor = "#1976d2";
      fillOpacity = 0.6;
      break;
    case 'Regular':
      fillColor = "#64b5f6";
      fillOpacity = 0.5;
      break;
    case 'Bajo':
      fillColor = "#bbdefb";
      fillOpacity = 0.4;
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

// Add distribution score layer
const distLayer = addGeoJsonLayer(map2, agebsDist, {
  style: getDistStyle,
  onEachFeature: (feature, layer) => {
    const props = feature.properties;
    const popupContent = `
      <div style="font-family: Arial; min-width: 220px;">
        <h4 style="margin: 0 0 10px 0;">Score de Distribución</h4>
        <b>AGEB:</b> ${props.CVEGEO || 'N/A'}<br>
        <b>Categoría:</b> <span style="font-weight: bold;">${props.categoria_dist || 'N/A'}</span><br>
        <hr style="margin: 8px 0;">
        <b>Score Distribución:</b> ${props.score_dist?.toFixed(1) || 'N/A'}/100<br>
        <b>Ranking:</b> #${props.ranking_dist || 'N/A'}<br>
        <hr style="margin: 8px 0;">
        <b>Clientes:</b><br>
        • Total: ${props.clientes_count || 'N/A'}<br>
        • Top 100: ${props.clientes_top100 || 'N/A'}<br>
        • Top 400: ${props.clientes_top400 || 'N/A'}<br>
      </div>
    `;
    layer.bindPopup(popupContent, {maxWidth: 250});
    layer.bindTooltip(`AGEB ${props.CVEGEO || 'N/A'} - ${props.categoria_dist || 'N/A'}`, {sticky: true});
  }
});

// Create legend
createLegend(map2, [
  {type: "header", label: "Score de Distribución"},
  {type: "square", color: "#1a237e", label: "Excelente (80-100)"},
  {type: "square", color: "#1976d2", label: "Bueno (60-79)"},
  {type: "square", color: "#64b5f6", label: "Regular (40-59)"},
  {type: "square", color: "#bbdefb", label: "Bajo (0-39)"},
  {type: "separator"},
  {type: "header", label: "Métrica"},
  {type: "square", color: "#e3f2fd", label: "Concentración de clientes Top 400"}
], "bottomright");
```

## Análisis por Categoría

```js
// Distribution score statistics
const categorias = {};
agebsDist.features.forEach(f => {
  const cat = f.properties.categoria_dist || 'Sin categoría';
  if (!categorias[cat]) {
    categorias[cat] = {count: 0, avgScore: 0, totalClientes: 0};
  }
  categorias[cat].count++;
  categorias[cat].avgScore += f.properties.score_dist || 0;
  categorias[cat].totalClientes += f.properties.clientes_count || 0;
});

Object.keys(categorias).forEach(cat => {
  categorias[cat].avgScore = categorias[cat].avgScore / categorias[cat].count;
});

display(html`
  <div class="card">
    <h3>Distribución por Categoría</h3>
    <table style="width: 100%; margin-top: 10px;">
      <thead>
        <tr>
          <th>Categoría</th>
          <th>AGEBs</th>
          <th>Score Promedio</th>
          <th>Total Clientes</th>
        </tr>
      </thead>
      <tbody>
        ${Object.entries(categorias).map(([cat, stats]) => `
          <tr>
            <td><strong>${cat}</strong></td>
            <td>${stats.count}</td>
            <td>${stats.avgScore.toFixed(1)}</td>
            <td>${stats.totalClientes}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>
`);
```

## Criterios de Evaluación

<div class="grid grid-cols-2">
  <div class="card">
    <h3>Zonas de Oportunidad</h3>
    <p><strong>Cálculo del Ratio:</strong></p>
    <p><code>Ratio = Clientes Objetivo / (Competidores + 1)</code></p>
    <br>
    <p><strong>Clasificación:</strong></p>
    <ul>
      <li><strong>Alta:</strong> Ratio > 3.0 y Clientes > 5</li>
      <li><strong>Media:</strong> Ratio 1.5-3.0 o Clientes 2-5</li>
      <li><strong>Baja:</strong> Ratio < 1.5 o Clientes < 2</li>
    </ul>
  </div>
  <div class="card">
    <h3>Score de Distribución</h3>
    <p><strong>Componentes:</strong></p>
    <ul>
      <li>Densidad de clientes prioritarios</li>
      <li>Concentración de Top 100 y Top 400</li>
      <li>Accesibilidad y centralidad</li>
      <li>Potencial de crecimiento</li>
    </ul>
    <br>
    <p><strong>Rangos:</strong></p>
    <ul>
      <li><strong>Excelente:</strong> 80-100</li>
      <li><strong>Bueno:</strong> 60-79</li>
      <li><strong>Regular:</strong> 40-59</li>
      <li><strong>Bajo:</strong> 0-39</li>
    </ul>
  </div>
</div>

## Top 10 AGEBs con Mayor Potencial

```js
// Sort by distribution score
const top10Agebs = agebsDist.features
  .filter(f => f.properties.score_dist != null)
  .sort((a, b) => (b.properties.score_dist || 0) - (a.properties.score_dist || 0))
  .slice(0, 10);

display(html`
  <div class="card">
    <h3>Top 10 AGEBs por Score de Distribución</h3>
    <table style="width: 100%; margin-top: 10px;">
      <thead>
        <tr>
          <th>Ranking</th>
          <th>CVEGEO</th>
          <th>Score</th>
          <th>Categoría</th>
          <th>Clientes Total</th>
          <th>Top 100</th>
          <th>Top 400</th>
        </tr>
      </thead>
      <tbody>
        ${top10Agebs.map((f, i) => {
          const p = f.properties;
          return `
            <tr>
              <td><strong>#${i + 1}</strong></td>
              <td><code>${p.CVEGEO || 'N/A'}</code></td>
              <td><strong>${p.score_dist?.toFixed(1) || 'N/A'}</strong></td>
              <td>${p.categoria_dist || 'N/A'}</td>
              <td>${p.clientes_count || 'N/A'}</td>
              <td>${p.clientes_top100 || 'N/A'}</td>
              <td>${p.clientes_top400 || 'N/A'}</td>
            </tr>
          `;
        }).join('')}
      </tbody>
    </table>
  </div>
`);
```

## Recomendaciones Estratégicas

<div class="note">
  <strong>💡 Insights Clave:</strong>
  <ul>
    <li><strong>Zonas de Prioridad Alta:</strong> Presentan el mejor balance entre demanda y baja competencia. Enfocar esfuerzos comerciales aquí.</li>
    <li><strong>AGEBs Excelente:</strong> Concentración significativa de clientes Top 400. Considerar para ubicación de hubs.</li>
    <li><strong>Cobertura Estratégica:</strong> Combinar zonas de alta oportunidad con AGEBs de score excelente maximiza ROI.</li>
    <li><strong>Saturación:</strong> Evitar AGEBs con alta densidad de competidores salvo que el potencial de mercado justifique la inversión.</li>
  </ul>
</div>

---

<div class="callout callout-info">
  <strong>Siguientes pasos:</strong>
  <ol>
    <li>Revisar <a href="/mapas/sweet-spots">Sweet Spots</a> para identificar ubicaciones que coincidan con zonas de alta oportunidad</li>
    <li>Analizar <a href="/mapas/hubs">Hubs Logísticos</a> en AGEBs con score excelente</li>
    <li>Priorizar <a href="/mapas/puntos-venta">Puntos de Venta</a> en zonas de prioridad alta</li>
    <li>Descargar datos completos desde <a href="/descargas">Descargas</a> para análisis detallado</li>
  </ol>
</div>

