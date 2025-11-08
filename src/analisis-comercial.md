# 4) Análisis Comercial en Hermosillo

Exploración de la estructura comercial de Hermosillo mediante códigos SCIAN, densidad por zona y segmentación de establecimientos prioritarios para Electrolit.

```js
import {createLoaders, isDataAvailable, dataNotAvailableMessage} from "./data/loaders.js";
import {kpi, formatNumber, table} from "./components/ui.js";
import * as d3 from "npm:d3";

const loaders = createLoaders({FileAttachment});
const denue = await loaders.loadDenue();
const agebGeo = await loaders.loadAgebGeo();
const grid500m = await loaders.loadGrid500m();
const zonasInteres = await loaders.loadZonasInteres();
```

## Enfoque SCIAN prioritario

<div class="grid grid-cols-2">
  <div class="card">
    <h3>Mayoreo y distribución</h3>
    <ul>
      <li><strong>463211</strong>: Comercio al por mayor de abarrotes</li>
      <li><strong>463212</strong>: Comercio al por mayor de bebidas no alcohólicas</li>
      <li><strong>463213</strong>: Comercio al por mayor de bebidas alcohólicas</li>
    </ul>
  </div>
  <div class="card">
    <h3>Detalle prioritario</h3>
    <ul>
      <li><strong>461110</strong>: Tiendas de abarrotes, ultramarinos y misceláneas</li>
      <li><strong>464111/464112</strong>: Farmacias sin/con minisúper</li>
      <li><strong>468111</strong>: Tiendas de conveniencia</li>
      <li><strong>462111/462112</strong>: Supermercados y clubes de precio</li>
    </ul>
  </div>
</div>

## Indicadores comerciales

```js
if (isDataAvailable(denue)) {
  const total = denue.features.length;
  const conScian = denue.features.filter(f => f.properties.scian).length;
  
  // Count priority SCIAN codes
  const prioritarios = ["463211", "463212", "463213", "461110", "464111", "464112", "468111", "462111", "462112"];
  const enPrioritarios = denue.features.filter(f => {
    const scian = String(f.properties.scian || "");
    return prioritarios.some(p => scian.startsWith(p));
  }).length;
  
  display(kpi([
    {
      label: "Establecimientos totales",
      value: formatNumber(total)
    },
    {
      label: "Con código SCIAN",
      value: formatNumber(conScian)
    },
    {
      label: "En categorías prioritarias",
      value: formatNumber(enPrioritarios)
    },
    {
      label: "% prioritarios",
      value: `${((enPrioritarios / total) * 100).toFixed(1)}%`
    }
  ]));
} else {
  display(dataNotAvailableMessage("establecimientos DENUE"));
}
```

## Top 15 categorías SCIAN (4 dígitos)

```js
import * as Plot from "npm:@observablehq/plot";
```

```js
if (isDataAvailable(denue)) {
  const rows = denue.features.map(f => f.properties?.scian).filter(Boolean);
  const counts = Array.from(d3.rollup(rows, v => v.length, d => String(d).slice(0, 4)))
    .map(([scian, n]) => ({scian, establecimientos: n}))
    .sort((a, b) => d3.descending(a.establecimientos, b.establecimientos))
    .slice(0, 15);
  
  display(Plot.plot({
    marginLeft: 80,
    height: 450,
    x: {label: "Número de establecimientos", grid: true},
    y: {label: "SCIAN (4 dígitos)"},
    marks: [
      Plot.barX(counts, {
        x: "establecimientos",
        y: "scian",
        fill: "#0066cc",
        sort: {y: "-x"}
      }),
      Plot.text(counts, {
        x: "establecimientos",
        y: "scian",
        text: d => d.establecimientos,
        dx: -8,
        textAnchor: "end",
        fill: "white",
        fontSize: 11
      })
    ]
  }));
  
  html`<p style="font-size: 0.875rem; color: var(--theme-foreground-muted); text-align: center;">
    Distribución de establecimientos por categoría SCIAN (primeros 4 dígitos). Mayor concentración en comercio al por menor.
  </p>`;
}
```

## Tabla detallada por SCIAN

```js
if (isDataAvailable(denue)) {
  const rows = denue.features.map(f => f.properties?.scian).filter(Boolean);
  const counts = Array.from(d3.rollup(rows, v => v.length, d => String(d).slice(0, 4)))
    .map(([scian, n]) => ({scian, establecimientos: n}))
    .sort((a, b) => d3.descending(a.establecimientos, b.establecimientos))
    .slice(0, 30);
  
  html`<h3>Top 30 categorías SCIAN</h3>`;
  
  display(
    table(
      counts,
      [
        {key: "scian", label: "SCIAN (4 dig)"},
        {key: "establecimientos", label: "Establecimientos", format: (v) => formatNumber(v)}
      ],
      {
        sortable: true,
        exportable: true,
        pageSize: 0
      }
    )
  );
}
```

## Mapa de densidad comercial (Grid 500m)

```js
if (isDataAvailable(grid500m)) {
  html`<div class="note">
    <p><strong>Mapa de calor de densidad comercial</strong></p>
    <p>Cuadrícula de 500m coloreada por densidad de establecimientos. Zonas más oscuras indican mayor concentración comercial.</p>
  </div>`;
  
  const container = document.createElement("div");
  container.style.height = "600px";
  container.style.border = "1px solid var(--theme-foreground-faintest)";
  container.style.borderRadius = "8px";
  container.style.overflow = "hidden";
  
  display(container);
  
  const map = L.map(container).setView([29.0892, -110.9608], 12);
  
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "© OpenStreetMap contributors"
  }).addTo(map);
  
  // Calculate color scale
  const scores = grid500m.features.map(f => f.properties.dens_comercial || f.properties.score_grid || 0);
  const maxScore = Math.max(...scores);
  const minScore = Math.min(...scores.filter(s => s > 0));
  
  // Add grid with heat coloring
  L.geoJSON(grid500m, {
    style: (feature) => {
      const dens = feature.properties.dens_comercial || feature.properties.score_grid || 0;
      
      if (dens === 0) {
        return {color: "#e0e0e0", weight: 0.3, fillOpacity: 0, fillColor: "transparent"};
      }
      
      const normalized = maxScore > minScore ? (dens - minScore) / (maxScore - minScore) : 0;
      const opacity = 0.2 + (normalized * 0.5);
      
      // Color gradient: light orange to dark red
      let color;
      if (normalized > 0.7) color = "#d32f2f";
      else if (normalized > 0.4) color = "#ff6b35";
      else color = "#ffb74d";
      
      return {
        color: color,
        weight: 0.5,
        fillOpacity: opacity,
        fillColor: color
      };
    },
    onEachFeature: (feature, layer) => {
      const props = feature.properties;
      layer.bindPopup(`
        <strong>Cuadrícula 500m</strong><br>
        Densidad comercial: ${(props.dens_comercial || props.score_grid || 0).toFixed(2)}<br>
        Población 18+: ${props.pob18 || "N/D"}
      `);
    }
  }).addTo(map);
  
  // Add zonas de interés
  if (isDataAvailable(zonasInteres)) {
    L.geoJSON(zonasInteres, {
      style: {color: "#0066cc", weight: 3, fillOpacity: 0.05, dashArray: "5, 5"}
    }).addTo(map);
  }
  
  // Fit bounds
  const gridLayer = L.geoJSON(grid500m);
  map.fitBounds(gridLayer.getBounds());
  
  // Legend
  const legendControl = L.control({position: 'bottomright'});
  legendControl.onAdd = function() {
    const div = L.DomUtil.create('div', 'map-legend');
    div.innerHTML = `
      <h4>Densidad comercial</h4>
      <div class="map-legend-item">
        <div class="map-legend-color" style="background-color: #d32f2f; opacity: 0.7;"></div>
        <span>Muy alta</span>
      </div>
      <div class="map-legend-item">
        <div class="map-legend-color" style="background-color: #ff6b35; opacity: 0.6;"></div>
        <span>Alta</span>
      </div>
      <div class="map-legend-item">
        <div class="map-legend-color" style="background-color: #ffb74d; opacity: 0.4;"></div>
        <span>Media</span>
      </div>
      <div class="map-legend-item">
        <div class="map-legend-color" style="border: 2px dashed #0066cc; background: transparent;"></div>
        <span>Zonas de interés</span>
      </div>
    `;
    return div;
  };
  legendControl.addTo(map);
  
} else {
  html`<div class="warning">
    <p><strong>Mapa no disponible</strong></p>
    <p>Coloca el archivo <code>cuadricula_500m.geojson</code> para visualizar el mapa de calor de densidad comercial.</p>
  </div>`;
}
```

## Hallazgos clave

<div class="grid grid-cols-2">
  <div class="card">
    <h3>Polarización comercial</h3>
    <p>La oferta comercial se concentra en corredores principales (Blvd. Solidaridad, zona de abastos, ejes céntricos). Mayor densidad de farmacias y conveniencia en zonas residenciales consolidadas.</p>
  </div>
  <div class="card">
    <h3>Hotspots por segmento</h3>
    <p>Farmacias: dispersión uniforme en toda la mancha urbana. Conveniencia: corredores vehiculares. Abarrotes: colonias populares y tradicionales. Mayoreo: concentrado en zona de abastos.</p>
  </div>
  <div class="card">
    <h3>Oportunidades de penetración</h3>
    <p>Zonas periféricas con densidad media-alta y baja saturación de competencia. Corredores emergentes en expansión urbana norte y este.</p>
  </div>
  <div class="card">
    <h3>Estrategia diferenciada</h3>
    <p>Mayoreo: enfoque relacional en zona de abastos. Farmacias: disponibilidad de todos los sabores como diferenciador. Conveniencia: rapidez de surtido y servicio local.</p>
  </div>
</div>

---

<small style="color: var(--theme-foreground-muted);">
  Análisis basado en DENUE y cuadrícula de 500m. Actualizar con datos de campo y conversión real.
</small>
