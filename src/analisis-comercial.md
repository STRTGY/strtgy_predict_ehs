# 4) Análisis Comercial en Hermosillo

Exploración de la estructura comercial de Hermosillo mediante códigos SCIAN, densidad por zona y segmentación de establecimientos prioritarios para Electrolit.

```js
import {kpi, formatNumber, table} from "./components/ui.js";
import * as d3 from "npm:d3";
import {createLoaders} from "./data/loaders.js";

// Cargar datos: pipeline outputs (Step 05) y grid vía loader (fallback a agebs_scored en loaders.js)
const denueMetadata = await FileAttachment("data/denue_hermosillo_metadata.json").json();
const denuePrioritarios = await FileAttachment("data/denue_hermosillo_prioritarios.web.geojson").json();
const scianCategoriesRaw = await FileAttachment("data/denue_hermosillo_categorias_scian.web.csv").csv({typed: true});
const loaders = createLoaders({ FileAttachment });
let grid500m = await loaders.loadGrid500m();
// Fallback: loader puede resolver sin "data/"; cargar explícitamente desde src/data
if (!grid500m?.features?.length) {
  try {
    const gridRaw = await FileAttachment("data/grid_suitability.web.geojson").json();
    if (gridRaw?.type === "FeatureCollection" && gridRaw.features?.length > 0) {
      grid500m = {
        ...gridRaw,
        features: gridRaw.features.map(f => ({
          ...f,
          properties: {
            ...f.properties,
            score_grid: f.properties.suitability_score ?? f.properties.score_grid ?? 0,
            dens_comercial: f.properties.density_commercial ?? f.properties.dens_comercial ?? 0,
            pob18: f.properties.pob_18plus ?? f.properties.pob18 ?? 0
          }
        }))
      };
    }
  } catch (_) {}
}
if (!grid500m?.features?.length) {
  try {
    const agebsRaw = await FileAttachment("data/agebs_scored.web.geojson").json();
    if (agebsRaw?.type === "FeatureCollection" && agebsRaw.features?.length > 0) {
      grid500m = {
        ...agebsRaw,
        features: agebsRaw.features.map(f => ({
          ...f,
          properties: {
            ...f.properties,
            score_grid: f.properties.score_total ?? f.properties.score ?? f.properties.score_grid ?? 0,
            dens_comercial: f.properties.dens_comercial ?? f.properties.density_commercial ?? 0,
            pob18: f.properties.pob18 ?? f.properties.pob_18plus ?? 0
          }
        }))
      };
    }
  } catch (_) {}
}

// Códigos SCIAN prioritarios para Electrolit (referencia: configs/reference/scian_comercio_inegi_2023.yaml)
// 4311/4312 = mayoreo; 4611, 4621, 4641 = retail. Conveniencia/minisupers = 462112 (rama 4621).
const SCIAN_PRIORITARIOS = {
  "4611": {nombre: "Abarrotes y misceláneas", tipo: "retail"},
  "4621": {nombre: "Supermercados y minisupers", tipo: "retail"},
  "4311": {nombre: "Comercio al por mayor de abarrotes", tipo: "mayoreo"},
  "4312": {nombre: "Comercio al por mayor de bebidas", tipo: "mayoreo"},
  "4641": {nombre: "Farmacias", tipo: "retail"}
};

// Filtrar solo categorías prioritarias para el análisis
const scianCategories = scianCategoriesRaw.filter(d => 
  SCIAN_PRIORITARIOS[d.scian_rama] || d.n_prioritarios > 0
);

// Helper para verificar disponibilidad de datos
const isDataAvailable = (data) => {
  if (!data) return false;
  if (Array.isArray(data)) return data.length > 0;
  if (typeof data === "object") return Object.keys(data).length > 0;
  return true;
};
```

## Enfoque SCIAN prioritario para Electrolit

```js
// Construir cards desde denue_hermosillo_categorias_scian (scian_rama + n_prioritarios)
const mayoreoRamas = (scianCategories || []).filter(d => {
  const info = SCIAN_PRIORITARIOS[d.scian_rama];
  return info && info.tipo === "mayoreo" && d.n_prioritarios > 0;
}).sort((a, b) => b.n_prioritarios - a.n_prioritarios);

const retailRamas = (scianCategories || []).filter(d => {
  const info = SCIAN_PRIORITARIOS[d.scian_rama];
  return info && info.tipo === "retail" && d.n_prioritarios > 0;
}).sort((a, b) => b.n_prioritarios - a.n_prioritarios);

const totalMayoreo = mayoreoRamas.reduce((sum, d) => sum + Number(d.n_prioritarios || 0), 0);
const totalRetail = retailRamas.reduce((sum, d) => sum + Number(d.n_prioritarios || 0), 0);

const hasScianData = mayoreoRamas.length > 0 || retailRamas.length > 0;

const mayoreoItems = mayoreoRamas.map(d => {
  const nombre = SCIAN_PRIORITARIOS[d.scian_rama]?.nombre || `SCIAN ${d.scian_rama}`;
  return html`<li><strong>${d.scian_rama}</strong>: ${nombre} (${formatNumber(d.n_prioritarios)})</li>`;
});
const retailItems = retailRamas.map(d => {
  const nombre = SCIAN_PRIORITARIOS[d.scian_rama]?.nombre || `SCIAN ${d.scian_rama}`;
  return html`<li><strong>${d.scian_rama}</strong>: ${nombre} (${formatNumber(d.n_prioritarios)})</li>`;
});

display(hasScianData ? html`
  <div class="grid grid-cols-2">
    <div class="card">
      <h3>Canal Mayoreo (B2B)</h3>
      <ul>
        ${mayoreoRamas.length > 0 ? mayoreoItems : html`<li><em>Sin establecimientos prioritarios en este canal.</em></li>`}
      </ul>
      <p style="font-size: 0.85rem; color: var(--theme-foreground-muted); margin-top: 0.5rem;">
        <strong>Total mayoreo:</strong> ${formatNumber(totalMayoreo)} establecimientos
      </p>
    </div>
    <div class="card">
      <h3>Canal Retail (B2C)</h3>
      <ul>
        ${retailRamas.length > 0 ? retailItems : html`<li><em>Sin establecimientos prioritarios en este canal.</em></li>`}
      </ul>
      <p style="font-size: 0.85rem; color: var(--theme-foreground-muted); margin-top: 0.5rem;">
        <strong>Total retail:</strong> ${formatNumber(totalRetail)} establecimientos
      </p>
    </div>
  </div>
` : html`<div class="note"><p><strong>Datos no disponibles.</strong> Las categorías SCIAN prioritarias (denue_hermosillo_categorias_scian.web.csv) no están cargadas o no tienen establecimientos prioritarios.</p></div>`);
```

```js
display(html`<div class="note" style="margin-top: 1rem;">
  <p><strong>Criterio de selección:</strong> Solo se incluyen establecimientos cuyo giro principal es la venta de bebidas, alimentos empacados o productos de salud donde Electrolit tiene presencia natural. Se excluyen restaurantes, tiendas de ropa, servicios y otros giros no prioritarios. Cifras desde <code>denue_hermosillo_categorias_scian.web.csv</code> (pipeline Step 05).</p>
</div>`);
```

## Indicadores comerciales

```js
const total = denueMetadata?.total_establishments || 0;
const prioritarios = denueMetadata?.priority_establishments || 0;
// Retail/mayoreo desde metadata si existe; si no, desde denue_hermosillo_categorias_scian
const retailFromScian = (scianCategories || []).filter(d => SCIAN_PRIORITARIOS[d.scian_rama]?.tipo === "retail").reduce((s, d) => s + Number(d.n_prioritarios || 0), 0);
const mayoreoFromScian = (scianCategories || []).filter(d => SCIAN_PRIORITARIOS[d.scian_rama]?.tipo === "mayoreo").reduce((s, d) => s + Number(d.n_prioritarios || 0), 0);
const retail = denueMetadata?.category_distribution?.retail ?? retailFromScian;
const mayoreo = denueMetadata?.category_distribution?.mayoreo ?? mayoreoFromScian;
const pctPrioritarios = total > 0 ? ((prioritarios / total) * 100).toFixed(1) : "0";

display(kpi([
  {
    label: "Establecimientos totales",
    value: formatNumber(total)
  },
  {
    label: "Establecimientos prioritarios",
    value: formatNumber(prioritarios)
  },
  {
    label: "Puntos de venta (Retail)",
    value: formatNumber(retail)
  },
  {
    label: "Distribuidores (Mayoreo)",
    value: formatNumber(mayoreo)
  }
]));
```

```js
display(html`<p style="font-size: 0.875rem; color: var(--theme-foreground-muted); text-align: center; margin-top: 1rem;">
  Los establecimientos prioritarios representan el <strong>${pctPrioritarios}%</strong> del total, 
  concentrados en farmacias, tiendas de conveniencia y distribuidores de bebidas.
</p>
<p style="font-size: 0.75rem; color: var(--theme-foreground-muted); text-align: center; margin-top: 0.25rem;">
  Fuente: totales desde <code>denue_hermosillo_metadata.json</code>; retail/mayoreo desde <code>denue_hermosillo_categorias_scian.web.csv</code> (src/data).
</p>`);
```

## Distribución de Establecimientos Prioritarios por Categoría SCIAN

```js
import * as Plot from "npm:@observablehq/plot";
```

```js
// Mapeo de códigos SCIAN a nombres legibles
const SCIAN_NOMBRES = {
  "4611": "Abarrotes y misceláneas",
  "4621": "Supermercados y minisupers",
  "4311": "Mayor abarrotes",
  "4312": "Mayor bebidas",
  "4641": "Farmacias"
};

// Filtrar solo categorías con establecimientos prioritarios (4311/4312 = Mayoreo; resto prioritario = Retail)
const categoriasPrioritarias = (scianCategories || [])
  .filter(d => d.n_prioritarios > 0)
  .map(d => ({
    ...d,
    nombre: SCIAN_NOMBRES[String(d.scian_rama)] || `SCIAN ${d.scian_rama}`,
    tipo: ["4311", "4312"].includes(String(d.scian_rama)) ? "Mayoreo" : "Retail"
  }))
  .sort((a, b) => b.n_prioritarios - a.n_prioritarios);

if (categoriasPrioritarias.length > 0) {
  display(Plot.plot({
    marginLeft: 160,
    height: 350,
    x: {label: "Número de establecimientos prioritarios", grid: true},
    y: {label: null},
    color: {
      domain: ["Retail", "Mayoreo"],
      range: ["#1565c0", "#ff6b35"],
      legend: true
    },
    marks: [
      Plot.barX(categoriasPrioritarias, {
        x: "n_prioritarios",
        y: "nombre",
        fill: "tipo",
        sort: {y: "-x"}
      }),
      Plot.text(categoriasPrioritarias, {
        x: "n_prioritarios",
        y: "nombre",
        text: d => formatNumber(d.n_prioritarios),
        dx: 5,
        textAnchor: "start",
        fill: "currentColor",
        fontSize: 11,
        fontWeight: 600
      })
    ]
  }));
} else {
  display(html`<div class="note"><p><strong>Datos no disponibles</strong></p><p>Las categorías SCIAN prioritarias aún no están cargadas.</p></div>`);
}
```

```js
if (categoriasPrioritarias.length > 0) {
  const totalPrioritarios = categoriasPrioritarias.reduce((sum, d) => sum + d.n_prioritarios, 0);
  const totalRetail = categoriasPrioritarias.filter(d => d.tipo === "Retail").reduce((sum, d) => sum + d.n_prioritarios, 0);
  const totalMayoreo = categoriasPrioritarias.filter(d => d.tipo === "Mayoreo").reduce((sum, d) => sum + d.n_prioritarios, 0);
  
  display(html`<p style="font-size: 0.875rem; color: var(--theme-foreground-muted); text-align: center; margin-top: 1rem;">
    <strong>${formatNumber(totalPrioritarios)}</strong> establecimientos prioritarios: 
    <span style="color: #1565c0; font-weight: 600;">${formatNumber(totalRetail)} retail</span> + 
    <span style="color: #ff6b35; font-weight: 600;">${formatNumber(totalMayoreo)} mayoreo</span>
  </p>`);
}
```

## Detalle por Categoría SCIAN Prioritaria

```js
// Preparar datos de tabla con nombres legibles
const tablaCategorias = categoriasPrioritarias.map(d => ({
  categoria: d.nombre,
  scian: d.scian_rama,
  tipo: d.tipo,
  prioritarios: d.n_prioritarios,
  score_fit: d.score_fit_promedio
}));

// Helper para crear badge de canal
function createCanalBadge(tipo) {
  const span = document.createElement("span");
  span.textContent = tipo;
  span.style.cssText = tipo === "Mayoreo" 
    ? "background: #fff3e0; color: #ff6b35; padding: 3px 8px; border-radius: 10px; font-size: 0.8rem; font-weight: 600;"
    : "background: #e3f2fd; color: #1565c0; padding: 3px 8px; border-radius: 10px; font-size: 0.8rem; font-weight: 600;";
  return span;
}

// Helper para crear número en negrita
function createBoldNumber(value) {
  const strong = document.createElement("strong");
  strong.textContent = formatNumber(value);
  return strong;
}

if (tablaCategorias.length > 0) {
  display(
    table(
      tablaCategorias,
      [
        {key: "categoria", label: "Categoría"},
        {key: "scian", label: "SCIAN"},
        {key: "tipo", label: "Canal", format: (v) => createCanalBadge(v)},
        {key: "prioritarios", label: "Establecimientos", format: (v) => createBoldNumber(v)},
        {key: "score_fit", label: "Score Fit Prom.", format: (v) => v != null ? Number(v).toFixed(1) : "N/D"}
      ],
      {
        sortable: true,
        exportable: true,
        pageSize: 10
      }
    )
  );
  
  display(html`<p style="font-size: 0.875rem; color: var(--theme-foreground-muted); margin-top: 1rem;">
    <strong>Score Fit:</strong> Indicador de afinidad del establecimiento con el perfil de cliente Electrolit (1-10). 
    Mayor score = mayor probabilidad de conversión y volumen de compra.
  </p>`);
}
```

## Mapa de establecimientos prioritarios

```js
const hasDenuePrioritarios = denuePrioritarios?.features?.length > 0;

if (hasDenuePrioritarios) {
  display(html`<div class="note">
    <p><strong>Mapa de establecimientos prioritarios para Electrolit</strong></p>
    <p>Farmacias, tiendas de conveniencia y distribuidores de bebidas en Hermosillo. 
    Coloreados por categoría (retail vs mayoreo) y tamaño según score fit base.</p>
  </div>`);
}
```

```js
if (hasDenuePrioritarios) {
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
  
  // Create color scale for categories
  const colorMap = {
    "retail": "#0066cc",
    "mayoreo": "#ff6b35",
    "otro": "#cccccc"
  };
  // Derivar canal desde scian_rama si el GeoJSON no trae categoria_electrolit (4311/4312 = mayoreo; 4611, 4621, 4641 = retail)
  const scianToCanal = (scianRama) => {
    const r = String(scianRama ?? "");
    if (r === "4311" || r === "4312") return "mayoreo";
    if (r === "4611" || r === "4621" || r === "4641") return "retail";
    return "otro";
  };
  
  // Add markers
  L.geoJSON(denuePrioritarios, {
    pointToLayer: (feature, latlng) => {
      const props = feature.properties;
      const category = props.categoria_electrolit || scianToCanal(props.scian_rama);
      const scoreFit = props.score_fit_base || 5;
      
      return L.circleMarker(latlng, {
        radius: 3 + (scoreFit / 2),
        fillColor: colorMap[category] || "#cccccc",
        color: "#fff",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.7
      });
    },
    onEachFeature: (feature, layer) => {
      const props = feature.properties;
      const nombre = props.nom_estab || props.NOM_ESTAB || props.nombre || "Sin nombre";
      const categoria = props.categoria_electrolit || scianToCanal(props.scian_rama);
      const prioridad = props.prioridad_electrolit || "N/D";
      const scoreFit = props.score_fit_base || 0;
      
      layer.bindPopup(`
        <strong>${nombre}</strong><br>
        SCIAN: ${props.scian_6dig || "N/D"}<br>
        Categoría: ${categoria}<br>
        Prioridad: ${prioridad}<br>
        Score Fit: ${scoreFit}/10
      `);
    }
  }).addTo(map);
  
  // Legend: conteos desde el GeoJSON con la misma lógica de canal (scian_rama -> retail/mayoreo)
  const countsFromMap = denuePrioritarios.features.reduce((acc, f) => {
    const cat = f.properties?.categoria_electrolit || scianToCanal(f.properties?.scian_rama);
    if (cat === "retail") acc.retail += 1;
    else if (cat === "mayoreo") acc.mayoreo += 1;
    return acc;
  }, { retail: 0, mayoreo: 0 });
  const legendRetail = countsFromMap.retail + countsFromMap.mayoreo > 0 ? countsFromMap.retail : retail;
  const legendMayoreo = countsFromMap.retail + countsFromMap.mayoreo > 0 ? countsFromMap.mayoreo : mayoreo;
  
  const legendControl = L.control({position: 'bottomright'});
  legendControl.onAdd = function() {
    const div = L.DomUtil.create('div', 'map-legend');
    div.style.cssText = "background:#fff;padding:14px 16px;border-radius:8px;box-shadow:0 2px 12px rgba(0,0,0,0.2);font-size:14px;line-height:1.5;min-width:180px;border:1px solid rgba(0,0,0,0.1);";
    div.innerHTML = `
      <h4 style="margin:0 0 10px;font-size:15px;font-weight:700;color:#222;padding-bottom:6px;border-bottom:2px solid #0066cc;">Categoría</h4>
      <div class="map-legend-item" style="display:flex;align-items:center;margin:8px 0;">
        <div class="map-legend-color" style="width:24px;height:18px;margin-right:12px;border:1px solid rgba(0,0,0,0.25);border-radius:4px;flex-shrink:0;background-color:${colorMap.retail};"></div>
        <span style="font-size:14px;color:#333;font-weight:600;">Retail (${formatNumber(legendRetail)})</span>
      </div>
      <div class="map-legend-item" style="display:flex;align-items:center;margin:8px 0;">
        <div class="map-legend-color" style="width:24px;height:18px;margin-right:12px;border:1px solid rgba(0,0,0,0.25);border-radius:4px;flex-shrink:0;background-color:${colorMap.mayoreo};"></div>
        <span style="font-size:14px;color:#333;font-weight:600;">Mayoreo (${formatNumber(legendMayoreo)})</span>
      </div>
      <p style="font-size:13px;color:#555;margin:12px 0 0;padding-top:8px;border-top:1px solid #eee;">Tamaño: Score Fit (5-10)</p>
    `;
    return div;
  };
  legendControl.addTo(map);
} else {
  display(html`<div class="warning">
    <p><strong>Mapa no disponible</strong></p>
    <p>Los datos de establecimientos prioritarios no están disponibles.</p>
  </div>`);
}
```

## Mapa de densidad comercial (Grid 500m)

```js
const hasGrid500m = grid500m?.features?.length > 0;

if (hasGrid500m) {
  display(html`<div class="note">
    <p><strong>Mapa de calor de densidad comercial</strong></p>
    <p>Cuadrícula de 500m coloreada por densidad de establecimientos. Zonas más oscuras indican mayor concentración comercial. La cuadrícula cubre el área de estudio (Hermosillo); en zonas fuera del núcleo (p. ej. Miguel Alemán, Bahía de Kino) es normal que no haya celdas o que aparezcan con densidad muy baja o sin color.</p>
  </div>`);
}
```

```js
if (hasGrid500m) {
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
  
  // Escala por cuantiles con el doble de saltos (8 niveles) para mejor lectura de la distribución
  const gridScores = grid500m.features.map(f => f.properties.dens_comercial || f.properties.score_grid || f.properties.suitability_score || 0);
  const positiveScores = gridScores.filter(s => s > 0).sort((a, b) => a - b);
  const n = positiveScores.length;
  const quantile = (arr, q) => arr[Math.min(Math.floor(q * arr.length), arr.length - 1)] ?? 0;
  const breaks = n > 0 ? [0.125, 0.25, 0.375, 0.5, 0.625, 0.75, 0.875].map(q => quantile(positiveScores, q)) : [];
  const colorsByLevel = [
    "#fff8e1", "#ffecb3", "#ffe082", "#ffb74d", "#ff9800", "#f57c00", "#e65100", "#bf360c"
  ];
  
  const getLevelIndex = (dens) => {
    if (dens <= 0) return -1;
    for (let i = 0; i < breaks.length; i++) if (dens <= breaks[i]) return i;
    return breaks.length;
  };
  
  // Add grid with heat coloring
  L.geoJSON(grid500m, {
    style: (feature) => {
      const dens = feature.properties.dens_comercial || feature.properties.score_grid || feature.properties.suitability_score || 0;
      const idx = getLevelIndex(dens);
      
      if (idx < 0) {
        return {color: "#e0e0e0", weight: 0.3, fillOpacity: 0.2, fillColor: "#e0e0e0"};
      }
      
      const color = colorsByLevel[idx];
      const opacity = 0.45 + (idx / (colorsByLevel.length - 1)) * 0.45;
      
      return {
        color: color,
        weight: 0.5,
        fillOpacity: opacity,
        fillColor: color
      };
    },
    onEachFeature: (feature, layer) => {
      const props = feature.properties;
      const densValue = props.dens_comercial || props.score_grid || props.suitability_score || 0;
      layer.bindPopup(`
        <strong>Cuadrícula 500m</strong><br>
        Densidad/Score: ${Number(densValue).toFixed(2)}
      `);
    }
  }).addTo(map);
  
  // Fit bounds
  const gridLayer = L.geoJSON(grid500m);
  map.fitBounds(gridLayer.getBounds());
  
  // Leyenda: 8 niveles (doble de saltos), fondo sólido
  const legendLabels = ["Muy baja", "Baja", "Media-baja", "Media", "Media-alta", "Alta", "Muy alta", "Máxima"];
  const legendControl = L.control({position: 'bottomright'});
  legendControl.onAdd = function() {
    const div = L.DomUtil.create('div', 'map-legend');
    div.style.cssText = "background:#fff;padding:12px 14px;border-radius:8px;box-shadow:0 2px 12px rgba(0,0,0,0.2);font-size:13px;line-height:1.4;min-width:140px;max-height:320px;overflow-y:auto;border:1px solid rgba(0,0,0,0.1);";
    const items = colorsByLevel.map((hex, i) => `
      <div style="display:flex;align-items:center;margin:4px 0;">
        <div style="width:20px;height:14px;margin-right:8px;border:1px solid rgba(0,0,0,0.2);border-radius:3px;flex-shrink:0;background:${hex};"></div>
        <span style="font-size:12px;color:#333;font-weight:600;">${legendLabels[i]}</span>
      </div>
    `).join("");
    div.innerHTML = `
      <h4 style="margin:0 0 8px;font-size:14px;font-weight:700;color:#222;padding-bottom:4px;border-bottom:2px solid #ff6b35;">Densidad comercial</h4>
      ${items}
      <p style="font-size:11px;color:#666;margin:8px 0 0;padding-top:6px;border-top:1px solid #eee;">Cuadrícula 500 m. 8 cuantiles.</p>
    `;
    return div;
  };
  legendControl.addTo(map);
  
} else {
  display(html`<div class="warning">
    <p><strong>Mapa no disponible</strong></p>
    <p>El archivo de cuadrícula de densidad comercial no está disponible.</p>
  </div>`);
}
```

## Hallazgos clave

```js
// Hallazgos desde datos: prioritarios, retail, mayoreo, categoriasPrioritarias (denue_hermosillo_categorias_scian)
const pctRetail = prioritarios > 0 ? ((retail / prioritarios) * 100).toFixed(1) : "0";
const pctMayoreo = prioritarios > 0 ? ((mayoreo / prioritarios) * 100).toFixed(1) : "0";
const topRamas = (categoriasPrioritarias || []).slice(0, 5).map(d => `${SCIAN_NOMBRES[d.scian_rama] || d.scian_rama} (${d.scian_rama}): ${formatNumber(d.n_prioritarios)}`).join("; ");
const scoresPorRama = (categoriasPrioritarias || []).filter(d => d.score_fit_promedio != null).sort((a, b) => (b.score_fit_promedio || 0) - (a.score_fit_promedio || 0)).slice(0, 4);

display(html`
<div class="grid grid-cols-2">
  <div class="card">
    <h3>Peso del canal retail</h3>
    <p>De los ${formatNumber(prioritarios)} establecimientos prioritarios en Hermosillo, ${formatNumber(retail)} son retail (${pctRetail}%) y ${formatNumber(mayoreo)} mayoreo (${pctMayoreo}%). ${topRamas || "Cifras por categoría desde denue_hermosillo_categorias_scian.web.csv."} Priorizar rutas y surtido por volumen retail; mayoreo como canal estratégico con pocos actores.</p>
  </div>
  <div class="card">
    <h3>Score fit por canal</h3>
    <p>${scoresPorRama.length ? scoresPorRama.map(d => `${SCIAN_NOMBRES[d.scian_rama] || d.scian_rama} (${d.scian_rama}): ${Number(d.score_fit_promedio).toFixed(1)}`).join(". ") + ". Usar estos rangos para ordenar visitas y asignar metas de conversión por tipo de punto." : "Scores fit promedio por rama SCIAN desde denue_hermosillo_categorias_scian.web.csv. Usar para ordenar visitas y metas de conversión por tipo de punto."}</p>
  </div>
  <div class="card">
    <h3>Densidad y cobertura</h3>
    <p>La cuadrícula de 500 m muestra concentración de densidad comercial en el núcleo urbano de Hermosillo; periferia y zonas fuera del área de estudio aparecen con densidad baja o sin datos. Cruzar con isócronas de CEDIS e islas de calor del mapa permite identificar huecos de cobertura y corredores de expansión.</p>
  </div>
  <div class="card">
    <h3>Acciones recomendadas</h3>
    <p>Retail: abasto frecuente y surtido completo (sabores, formatos) en abarrotes y farmacias de mayor score. Mayoreo: relación directa con los ${formatNumber(mayoreo)} distribuidores identificados y presencia en zona de abastos. Validar con datos de venta real y conversión por ruta.</p>
  </div>
</div>
`);
```

---

<small style="color: var(--theme-foreground-muted);">
  Actualizar con datos de campo y conversión real.
</small>
