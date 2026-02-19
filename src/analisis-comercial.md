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
const grid500m = await loaders.loadGrid500m();

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

// Filtrar solo categorías con establecimientos prioritarios
const categoriasPrioritarias = (scianCategories || [])
  .filter(d => d.n_prioritarios > 0)
  .map(d => ({
    ...d,
    nombre: SCIAN_NOMBRES[d.scian_rama] || `SCIAN ${d.scian_rama}`,
    tipo: ["4311", "4312"].includes(d.scian_rama) ? "Mayoreo" : "Retail"
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
  
  // Add markers
  L.geoJSON(denuePrioritarios, {
    pointToLayer: (feature, latlng) => {
      const props = feature.properties;
      const category = props.categoria_electrolit || "otro";
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
      const categoria = props.categoria_electrolit || "otro";
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
  
  // Legend
  const legendControl = L.control({position: 'bottomright'});
  legendControl.onAdd = function() {
    const div = L.DomUtil.create('div', 'map-legend');
    div.innerHTML = `
      <h4>Categoría</h4>
      <div class="map-legend-item">
        <div class="map-legend-color" style="background-color: ${colorMap.retail};"></div>
        <span>Retail (${retail})</span>
      </div>
      <div class="map-legend-item">
        <div class="map-legend-color" style="background-color: ${colorMap.mayoreo};"></div>
        <span>Mayoreo (${mayoreo})</span>
      </div>
      <p style="font-size: 0.75rem; margin-top: 0.5rem;">Tamaño: Score Fit (5-10)</p>
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
    <p>Cuadrícula de 500m coloreada por densidad de establecimientos. Zonas más oscuras indican mayor concentración comercial.</p>
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
  
  // Calculate color scale
  const gridScores = grid500m.features.map(f => f.properties.dens_comercial || f.properties.score_grid || f.properties.suitability_score || 0);
  const maxGridScore = Math.max(...gridScores);
  const minGridScore = Math.min(...gridScores.filter(s => s > 0));
  
  // Add grid with heat coloring
  L.geoJSON(grid500m, {
    style: (feature) => {
      const dens = feature.properties.dens_comercial || feature.properties.score_grid || feature.properties.suitability_score || 0;
      
      if (dens === 0) {
        return {color: "#e0e0e0", weight: 0.3, fillOpacity: 0, fillColor: "transparent"};
      }
      
      const normalized = maxGridScore > minGridScore ? (dens - minGridScore) / (maxGridScore - minGridScore) : 0;
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
      const densValue = props.dens_comercial || props.score_grid || props.suitability_score || 0;
      layer.bindPopup(`
        <strong>Cuadrícula 500m</strong><br>
        Densidad/Score: ${Number(densValue).toFixed(2)}<br>
        Población 18+: ${props.pob18 || props.pob_18plus || "N/D"}
      `);
    }
  }).addTo(map);
  
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
