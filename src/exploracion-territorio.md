# 3) Exploración Territorial

Análisis espacial de la estructura urbana de Hermosillo mediante AGEBs (Áreas Geoestadísticas Básicas) y visualización de establecimientos comerciales.

```js
import {kpi, formatNumber} from "./components/ui.js";
import * as Plot from "npm:@observablehq/plot";
```

```js
// Cargar datos directamente con FileAttachment
const agebGeo = FileAttachment("./data/agebs_base.web.geojson").json();
const zonasOportunidad = FileAttachment("./data/zonas_oportunidad.web.geojson").json();
const denue = FileAttachment("./data/scored.sample.web.geojson").json();
const top20Comercial = FileAttachment("./data/top20_comercial.web.csv").csv({typed: true});
```

```js
// Crear lookup de datos de zonas de oportunidad (tiene población y scores)
const zonaDataMap = new Map(
  zonasOportunidad.features.map(f => [
    f.properties.CVEGEO,
    {
      pob_total: f.properties.pob_total || 0,
      opportunity_score: f.properties.opportunity_score || 0,
      avg_score: f.properties.avg_score || 0,
      n_establecimientos: f.properties.n_establecimientos || 0,
      oportunidad_tipo: f.properties.oportunidad_tipo || 'normal'
    }
  ])
);

// Generar scores usando datos reales de zonas de oportunidad
const scoresAgeb = agebGeo.features.map(f => {
  const cvegeo = f.properties.CVEGEO;
  const zonaData = zonaDataMap.get(cvegeo);
  
  // Calcular score normalizado en escala 0-10 basado en tipo de oportunidad
  let score = 5.0; // default
  if (zonaData) {
    // Usar oportunidad_tipo como indicador principal
    const tipo = zonaData.oportunidad_tipo?.toLowerCase() || '';
    
    if (tipo === 'alta') {
      // Alta oportunidad: 7.5-9.5
      const variation = (zonaData.opportunity_score - 25) / (78 - 25); // normalizar 25-78 a 0-1
      score = 7.5 + (variation * 2); // mapear a 7.5-9.5
    } else if (tipo === 'media') {
      // Media oportunidad: 5-7
      const variation = (zonaData.opportunity_score - 25) / (78 - 25);
      score = 5 + (variation * 2); // mapear a 5-7
    } else if (tipo === 'baja') {
      // Baja oportunidad: 2.5-5
      const variation = (zonaData.opportunity_score - 25) / (78 - 25);
      score = 2.5 + (variation * 2.5); // mapear a 2.5-5
    }
    
    // Limitar a rango 1-10
    score = Math.max(1, Math.min(10, score));
  }
  
  return {
    ageb: cvegeo,
    score: Number(score.toFixed(2)),
    pob_total: zonaData?.pob_total || 0,
    n_establecimientos: zonaData?.n_establecimientos || 0,
    oportunidad_tipo: zonaData?.oportunidad_tipo || 'normal'
  };
});
```

```js
// Crear competencia desde top20
const competencia = {
  type: "FeatureCollection",
  features: top20Comercial.map(d => ({
    type: "Feature",
    properties: {
      nombre: d.nom_estab,
      segmento: d.segmento
    },
    geometry: d.latitud && d.longitud ? {
      type: "Point",
      coordinates: [+d.longitud, +d.latitud]
    } : null
  })).filter(f => f.geometry !== null)
};
```

```js
// Zonas de interés (filtrar zonas de alta oportunidad)
const zonasInteres = {
  ...zonasOportunidad,
  features: zonasOportunidad.features
    .filter(f => {
      // Filtrar por tipo de oportunidad alta o score alto
      return f.properties.oportunidad_tipo === 'alta' || 
             f.properties.opportunity_score > 7 ||
             f.properties.avg_score > 7;
    })
    .slice(0, 20) // Limitar a 20 para mejor visualización
    .map(f => ({
      ...f,
      properties: {
        ...f.properties,
        nombre: `Zona ${f.properties.oportunidad_tipo || 'Oportunidad'} - ${f.properties.CVEGEO?.slice(-4) || ''}`
      }
    }))
};
```

## Indicadores territoriales

```js
const numAgebs = agebGeo.features.length;
const numEstablecimientos = denue.features.length;
const avgScoreAgeb = (scoresAgeb.reduce((sum, d) => sum + d.score, 0) / scoresAgeb.length).toFixed(2);

display(kpi([
  {
    label: "AGEBs urbanas",
    value: formatNumber(numAgebs)
  },
  {
    label: "Establecimientos mapeados",
    value: formatNumber(numEstablecimientos)
  },
  {
    label: "Score promedio AGEB",
    value: avgScoreAgeb
  },
  {
    label: "Cobertura territorial",
    value: "Hermosillo urbano"
  }
]));
```

## Mapa interactivo de Hermosillo

<div class="note">
Visualización de la estructura territorial urbana de Hermosillo. Los polígonos representan AGEBs y los marcadores muestran establecimientos DENUE. Haz clic en los elementos para ver información detallada.
</div>

```js
const L = await import("npm:leaflet@1.9.4");
```

```js
{
  const container = document.createElement("div");
  container.style.width = "100%";
  container.style.height = "600px";
  container.style.border = "1px solid var(--theme-foreground-faintest)";
  container.style.borderRadius = "8px";
  container.style.overflow = "hidden";
  container.style.position = "relative";
  
  // Initialize Leaflet map with Hermosillo center
  const map = L.map(container, {
    scrollWheelZoom: true,
    zoomControl: true,
    center: [29.0892, -110.9608],
    zoom: 11
  });
  
  // Set initial view explicitly
  map.setView([29.0892, -110.9608], 11);
  
  // Base tile layer with better UX
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    minZoom: 9,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);
    
  // Color scale for scoring
  const getColor = (score) => {
    if (!score) return "#cccccc";
    if (score >= 8) return "#00a651";
    if (score >= 6) return "#ff6b35";
    return "#999999";
  };
  
  // Add AGEB polygons with conditional styling
  const agebLayer = L.geoJSON(agebGeo, {
    style: (feature) => {
      const ageb = feature.properties.CVEGEO || feature.properties.ageb;
      const scoreData = scoresAgeb?.find(d => d.ageb === ageb);
      const score = scoreData?.score;
      
      return {
        color: getColor(score),
        weight: 2,
        fillOpacity: 0.4,
        fillColor: getColor(score),
        className: "ageb-polygon"
      };
    },
    onEachFeature: (feature, layer) => {
      const ageb = feature.properties.CVEGEO || feature.properties.ageb || "Sin ID";
      const scoreData = scoresAgeb?.find(d => d.ageb === ageb);
      const score = scoreData?.score?.toFixed(2) || "N/D";
      const poblacion = scoreData?.pob_total || 0;
      const establecimientos = scoreData?.n_establecimientos || 0;
      
      layer.bindPopup(`
        <div style="font-family: var(--sans-serif); min-width: 220px;">
          <strong style="font-size: 1.1em; display: block; margin-bottom: 8px;">AGEB ${ageb}</strong>
          <div style="margin: 4px 0;"><strong>Score:</strong> <span style="color: ${getColor(scoreData?.score)}; font-weight: bold;">${score}</span></div>
          <div style="margin: 4px 0;"><strong>Población:</strong> ${formatNumber(poblacion)}</div>
          <div style="margin: 4px 0;"><strong>Establecimientos:</strong> ${formatNumber(establecimientos)}</div>
        </div>
      `, {
        maxWidth: 320,
        className: "custom-popup"
      });
      
      // Hover effect
      layer.on("mouseover", function() {
        this.setStyle({
          weight: 3,
          fillOpacity: 0.6
        });
      });
      layer.on("mouseout", function() {
        agebLayer.resetStyle(this);
      });
    }
  }).addTo(map);
  
  // Add zonas de interés (abastos, corredores)
  if (zonasInteres?.features?.length > 0) {
    L.geoJSON(zonasInteres, {
      style: (feature) => ({
        color: "#0066cc",
        weight: 3,
        fillOpacity: 0.15,
        fillColor: "#0066cc",
        dashArray: "8, 4"
      }),
      onEachFeature: (feature, layer) => {
        const nombre = feature.properties.nombre || "Zona de interés";
        layer.bindPopup(`
          <div style="font-family: var(--sans-serif);">
            <strong style="color: #0066cc; font-size: 1.1em;">${nombre}</strong>
          </div>
        `);
      }
    }).addTo(map);
  }
  
  // Add competencia markers
  if (competencia?.features?.length > 0) {
    L.geoJSON(competencia, {
      pointToLayer: (feature, latlng) => {
        return L.circleMarker(latlng, {
          radius: 7,
          fillColor: "#e74c3c",
          color: "#fff",
          weight: 2,
          opacity: 1,
          fillOpacity: 0.7
        });
      },
      onEachFeature: (feature, layer) => {
        const props = feature.properties;
        layer.bindPopup(`
          <div style="font-family: var(--sans-serif);">
            <strong style="font-size: 1.1em; display: block; margin-bottom: 8px;">${props.nombre || "Competencia"}</strong>
            <div><strong>Segmento:</strong> ${props.segmento || "N/D"}</div>
          </div>
        `);
      }
    }).addTo(map);
  }
  
  // Add establishment markers (clustered for better performance)
  const sampleSize = Math.min(500, denue.features.length);
  const sample = denue.features.slice(0, sampleSize);
  
  L.geoJSON(sample, {
    pointToLayer: (feature, latlng) => {
      return L.circleMarker(latlng, {
        radius: 5,
        fillColor: "#3498db",
        color: "#fff",
        weight: 1.5,
        opacity: 1,
        fillOpacity: 0.7
      });
    },
    onEachFeature: (feature, layer) => {
      const props = feature.properties;
      layer.bindPopup(`
        <div style="font-family: var(--sans-serif); min-width: 220px;">
          <strong style="font-size: 1.1em; display: block; margin-bottom: 8px;">${props.nom_estab || props.nombre || "Establecimiento"}</strong>
          <div style="margin: 4px 0;"><strong>Segmento:</strong> ${props.segmento || "N/D"}</div>
          <div style="margin: 4px 0;"><strong>ID:</strong> ${props.id || "N/D"}</div>
        </div>
      `, {
        maxWidth: 300
      });
    }
  }).addTo(map);
  
  // Force map to recalculate size and fit to bounds
  setTimeout(() => {
    map.invalidateSize();
    const bounds = agebLayer.getBounds();
    if (bounds.isValid()) {
      map.fitBounds(bounds, {
        padding: [30, 30],
        maxZoom: 12
      });
    }
  }, 200);
  
  // Add legend with better styling
  const legendControl = L.control({position: 'bottomright'});
  legendControl.onAdd = function(map) {
    const div = L.DomUtil.create('div', 'map-legend');
    div.style.background = "white";
    div.style.padding = "12px";
    div.style.borderRadius = "8px";
    div.style.boxShadow = "0 2px 8px rgba(0,0,0,0.15)";
    div.innerHTML = `
      <h4 style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600;">Leyenda</h4>
      <div style="display: flex; flex-direction: column; gap: 6px; font-size: 13px;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <div style="width: 20px; height: 20px; background-color: #00a651; border-radius: 3px;"></div>
          <span>AGEB Alto (≥8)</span>
        </div>
        <div style="display: flex; align-items: center; gap: 8px;">
          <div style="width: 20px; height: 20px; background-color: #ff6b35; border-radius: 3px;"></div>
          <span>AGEB Medio (6-8)</span>
        </div>
        <div style="display: flex; align-items: center; gap: 8px;">
          <div style="width: 20px; height: 20px; background-color: #999999; border-radius: 3px;"></div>
          <span>AGEB Bajo (<6)</span>
        </div>
        <div style="display: flex; align-items: center; gap: 8px;">
          <div style="width: 20px; height: 20px; background-color: #3498db; border-radius: 50%;"></div>
          <span>Establecimientos</span>
        </div>
        <div style="display: flex; align-items: center; gap: 8px;">
          <div style="width: 20px; height: 20px; background-color: #e74c3c; border-radius: 50%;"></div>
          <span>Competencia</span>
        </div>
        <div style="display: flex; align-items: center; gap: 8px;">
          <div style="width: 20px; height: 20px; border: 2px dashed #0066cc; background: transparent; border-radius: 3px;"></div>
          <span>Zonas de interés</span>
        </div>
      </div>
    `;
    return div;
  };
  legendControl.addTo(map);
  
  // Handle cleanup on invalidation
  invalidation.then(() => {
    map.remove();
  });
  
  display(container);
}
```

## Análisis de densidad por zona

```js
display(resize((width) => {
  return Plot.plot({
      width,
      height: 400,
      marginLeft: 60,
      marginBottom: 50,
      style: {
        background: "transparent",
        fontSize: "14px"
      },
      x: {
        label: "Score de AGEB →",
        grid: true,
        labelAnchor: "center"
      },
      y: {
        label: "↑ Número de AGEBs",
        grid: true
      },
      marks: [
        Plot.rectY(
          scoresAgeb,
          Plot.binX({y: "count"}, {
            x: "score",
            thresholds: 20,
            fill: "#3498db",
            inset: 0.5,
            tip: true
          })
        ),
        Plot.ruleX([6], {
          stroke: "#ff6b35",
          strokeWidth: 2,
          strokeDasharray: "6,4"
        }),
        Plot.ruleX([8], {
          stroke: "#00a651",
          strokeWidth: 2,
          strokeDasharray: "6,4"
        }),
        Plot.text([[6, 0]], {
          text: ["Umbral Medio"],
          dy: -10,
          fill: "#ff6b35",
          fontSize: 12
        }),
        Plot.text([[8, 0]], {
          text: ["Umbral Alto"],
          dy: -10,
          fill: "#00a651",
          fontSize: 12
        })
      ]
    });
}));

display(html`<p style="font-size: 0.875rem; color: var(--theme-foreground-muted); text-align: center; margin-top: 12px;">
  Distribución de scoring por AGEB. Las líneas verticales marcan umbrales de priorización (medio=6, alto=8).
</p>`);
```

## Hallazgos territoriales clave

<div class="grid grid-cols-2">
  <div class="card">
    <h3>Zonas de alta densidad</h3>
    <p>AGEBs centrales con mayor concentración de establecimientos y población objetivo. Mayor potencial comercial pero también mayor competencia.</p>
  </div>
  <div class="card">
    <h3>Zonas periféricas</h3>
    <p>AGEBs periurbanas con menor saturación comercial. Oportunidades de crecimiento con menor competencia pero requieren análisis de accesibilidad.</p>
  </div>
  <div class="card">
    <h3>Corredores comerciales</h3>
    <p>Vialidades principales con alta concentración lineal de comercios. Estrategia de cobertura por ruta optimizada.</p>
  </div>
  <div class="card">
    <h3>Áreas de oportunidad</h3>
    <p>Zonas con alta población objetivo y baja penetración comercial actual. Priorización para expansión estratégica.</p>
  </div>
</div>

## Patrones espaciales identificados

```js
{
  const highScoreAgebs = scoresAgeb.filter(d => d.score >= 7).length;
  const mediumScoreAgebs = scoresAgeb.filter(d => d.score >= 5 && d.score < 7).length;
  const lowScoreAgebs = scoresAgeb.filter(d => d.score < 5).length;
  const total = scoresAgeb.length;
  
  const tableData = [
    {
      categoria: "Alta prioridad (≥7)",
      numero: highScoreAgebs,
      porcentaje: ((highScoreAgebs / total) * 100).toFixed(1),
      estrategia: "Cobertura inmediata",
      color: "#00a651"
    },
    {
      categoria: "Media prioridad (5-7)",
      numero: mediumScoreAgebs,
      porcentaje: ((mediumScoreAgebs / total) * 100).toFixed(1),
      estrategia: "Expansión gradual",
      color: "#ff6b35"
    },
    {
      categoria: "Baja prioridad (<5)",
      numero: lowScoreAgebs,
      porcentaje: ((lowScoreAgebs / total) * 100).toFixed(1),
      estrategia: "Monitoreo",
      color: "#999999"
    }
  ];
  
  const tableContainer = html`<div class="card" style="overflow-x: auto;">
    <h3 style="margin-bottom: 16px;">Clasificación de AGEBs por potencial</h3>
    <table style="width: 100%; border-collapse: collapse;">
      <thead>
        <tr style="border-bottom: 2px solid var(--theme-foreground-faintest);">
          <th style="text-align: left; padding: 12px 8px; font-weight: 600;">Categoría</th>
          <th style="text-align: right; padding: 12px 8px; font-weight: 600;">Número de AGEBs</th>
          <th style="text-align: right; padding: 12px 8px; font-weight: 600;">% del total</th>
          <th style="text-align: left; padding: 12px 8px; font-weight: 600;">Estrategia</th>
        </tr>
      </thead>
      <tbody></tbody>
    </table>
  </div>`;
  
  const tbody = tableContainer.querySelector("tbody");
  for (const row of tableData) {
    const tr = document.createElement("tr");
    tr.style.borderBottom = "1px solid var(--theme-foreground-faintest)";
    
    // Categoría con color
    const tdCategoria = document.createElement("td");
    tdCategoria.style.padding = "12px 8px";
    tdCategoria.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px;">
        <div style="width: 12px; height: 12px; background-color: ${row.color}; border-radius: 2px;"></div>
        <strong>${row.categoria}</strong>
      </div>
    `;
    
    // Número
    const tdNumero = document.createElement("td");
    tdNumero.style.textAlign = "right";
    tdNumero.style.padding = "12px 8px";
    tdNumero.style.fontVariantNumeric = "tabular-nums";
    tdNumero.textContent = formatNumber(row.numero);
    
    // Porcentaje
    const tdPorcentaje = document.createElement("td");
    tdPorcentaje.style.textAlign = "right";
    tdPorcentaje.style.padding = "12px 8px";
    tdPorcentaje.style.fontVariantNumeric = "tabular-nums";
    tdPorcentaje.innerHTML = `<strong>${row.porcentaje}%</strong>`;
    
    // Estrategia
    const tdEstrategia = document.createElement("td");
    tdEstrategia.style.padding = "12px 8px";
    tdEstrategia.innerHTML = `
      <span style="background-color: var(--theme-foreground-faintest); padding: 4px 8px; border-radius: 4px; font-size: 0.875rem;">
        ${row.estrategia}
      </span>
    `;
    
    tr.append(tdCategoria, tdNumero, tdPorcentaje, tdEstrategia);
    tbody.appendChild(tr);
  }
  
  display(tableContainer);
  
  // Add visualization of distribution
  display(resize((width) => {
    return Plot.plot({
      width,
      height: 80,
      marginTop: 0,
      marginBottom: 30,
      x: {
        label: null,
        domain: [0, total],
        axis: null
      },
      y: {
        label: null,
        axis: null
      },
      marks: [
        Plot.barX([
          {label: "Alta", value: highScoreAgebs, color: "#00a651"},
          {label: "Media", value: mediumScoreAgebs, color: "#ff6b35"},
          {label: "Baja", value: lowScoreAgebs, color: "#999999"}
        ], {
          x: "value",
          y: () => 1,
          fill: "color",
          insetTop: 10,
          insetBottom: 10
        }),
        Plot.text([
          {x: highScoreAgebs / 2, label: `Alta: ${((highScoreAgebs / total) * 100).toFixed(0)}%`},
          {x: highScoreAgebs + mediumScoreAgebs / 2, label: `Media: ${((mediumScoreAgebs / total) * 100).toFixed(0)}%`},
          {x: highScoreAgebs + mediumScoreAgebs + lowScoreAgebs / 2, label: `Baja: ${((lowScoreAgebs / total) * 100).toFixed(0)}%`}
        ], {
          x: "x",
          y: () => 1,
          text: "label",
          fill: "white",
          fontSize: 13,
          fontWeight: "bold"
        })
      ]
    });
  }));
}
```

## Recomendaciones de cobertura

<div class="tip">
  <p><strong>Estrategia territorial recomendada</strong></p>
  <ol>
    <li><strong>Fase 1</strong>: Cobertura de AGEBs de alta prioridad (score ≥7) - Aprox. 30-40% del territorio</li>
    <li><strong>Fase 2</strong>: Expansión a zonas de media prioridad con alto tránsito y accesibilidad</li>
    <li><strong>Fase 3</strong>: Evaluación de zonas periféricas según resultados de fases anteriores</li>
    <li><strong>Monitoreo continuo</strong>: Actualización de scores con datos de conversión real</li>
  </ol>
</div>

---

<small style="color: var(--theme-foreground-muted);">
  Análisis territorial basado en SCINCE 2020 y DENUE. Actualizar con datos de campo para calibración.
</small>