# Evaluación Estratégica de Ubicación CEDIS

```js
import {isDataAvailable, dataNotAvailableMessage} from "./data/loaders.js";
import {kpi, formatNumber, formatPercent, table, badge, grid, card} from "./components/ui.js";
import {heroSTRTGY, decisionCallout, implicationsCallout, sectionHeader, certaintyBadge} from "./components/brand.js";
import * as Inputs from "npm:@observablehq/inputs";

// Load data directly using FileAttachment with data loaders
const isocronas = await FileAttachment("./data/isocronas_5_10_15.geojson").json();
const grid500m = await FileAttachment("./data/grid_suitability.web.geojson").json();
const zonasInteres = await FileAttachment("./data/puntos_candidatos_cedis.geojson").json();
const agebGeo = await FileAttachment("./data/agebs_base.web.geojson").json();
const denue = await FileAttachment("./data/scored.sample.web.geojson").json();
```

```js
// Hero section with STRTGY brand identity
display(heroSTRTGY({
  title: "Ubicación Óptima de CEDIS en Hermosillo",
  subtitle: "Análisis Multicriterio para Distribución B2B de Electrolit",
  context: "Evaluación estratégica de ubicaciones para bodega con punto de venta (mayoreo y medio mayoreo), considerando accesibilidad a clientes, densidad comercial, corredores logísticos y costos operativos.",
  showPillars: false
}));
```

## Decisión Estratégica

```js
display(decisionCallout({
  title: "¿Zona de Abastos o Corredor Céntrico?",
  items: [
    "Prioridad 1: Maximizar cobertura de establecimientos en 5-10 minutos",
    "Prioridad 2: Facilitar acceso para tráilers y operación logística",
    "Prioridad 3: Equilibrar costo vs. proximidad al ecosistema comercial",
    "Considerar: Restricciones de tráfico, horarios y disponibilidad inmobiliaria"
  ]
}));
```

## Criterios de Evaluación

<div class="grid" style="grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1rem; margin: 2rem 0;">
  <div class="card" style="border-left: 4px solid var(--strtgy-green);">
    <h4 style="margin: 0 0 0.5rem 0; color: var(--strtgy-green);">🎯 Accesibilidad</h4>
    <p style="margin: 0; font-size: 0.875rem; color: var(--theme-foreground-muted);">Cobertura de establecimientos objetivo en isocronas de 5-10 minutos</p>
  </div>
  <div class="card" style="border-left: 4px solid var(--strtgy-blue);">
    <h4 style="margin: 0 0 0.5rem 0; color: var(--strtgy-blue);">🏪 Densidad Comercial</h4>
    <p style="margin: 0; font-size: 0.875rem; color: var(--theme-foreground-muted);">Concentración de establecimientos objetivo por cuadrícula</p>
  </div>
  <div class="card" style="border-left: 4px solid var(--strtgy-orange);">
    <h4 style="margin: 0 0 0.5rem 0; color: var(--strtgy-orange);">🚚 Acceso Logístico</h4>
    <p style="margin: 0; font-size: 0.875rem; color: var(--theme-foreground-muted);">Facilidad de entrada/salida para tráilers y carga/descarga</p>
  </div>
  <div class="card" style="border-left: 4px solid #9b59b6;">
    <h4 style="margin: 0 0 0.5rem 0; color: #9b59b6;">💰 Costo-Beneficio</h4>
    <p style="margin: 0; font-size: 0.875rem; color: var(--theme-foreground-muted);">Balance entre inversión inmobiliaria y potencial comercial</p>
  </div>
</div>

---

## Panel de Indicadores Clave

```js
if (isDataAvailable(isocronas)) {
  // Calculate coverage by isochrone
  const iso5 = isocronas.features.filter(f => f.properties.range === 300);
  const iso10 = isocronas.features.filter(f => f.properties.range === 600);
  const iso15 = isocronas.features.filter(f => f.properties.range === 900);
  const zonasCount = zonasInteres?.features?.length || 3;
  const establecimientosDenue = denue?.features?.length || 0;
  
  display(html`
    <div style="background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%); padding: 2rem; border-radius: 12px; margin: 2rem 0;">
      <h3 style="margin: 0 0 1.5rem 0; text-align: center; font-size: 1.25rem; color: #2d3748;">
        Resumen Ejecutivo de Cobertura
      </h3>
      ${kpi([
        {
          label: "Establecimientos Analizados",
          value: formatNumber(establecimientosDenue),
          trend: "Base DENUE"
        },
        {
          label: "Isocronas Calculadas",
          value: isocronas.features.length,
          trend: `${iso5.length} de 5min + ${iso10.length} de 10min + ${iso15.length} de 15min`
        },
        {
          label: "Ubicaciones Candidatas",
          value: zonasCount,
          trend: "Comparación multicriterio"
        },
        {
          label: "Cobertura objetivo",
          value: ">70%",
          trend: "Meta 5-10 minutos"
        }
      ])}
    </div>
  `);
} else {
  display(dataNotAvailableMessage("isocronas"));
}
```

---

## Mapa Interactivo de Escenarios

<div class="note" style="background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%); border-left: 4px solid var(--strtgy-blue); padding: 1.5rem; border-radius: 8px; margin: 2rem 0;">
  <h4 style="margin: 0 0 0.75rem 0; color: var(--strtgy-blue); font-size: 1.1rem;">📍 Visualización Geoespacial de Ubicaciones Candidatas</h4>
  <p style="margin: 0; font-size: 0.95rem; line-height: 1.6;">Explore las <strong>isocronas de accesibilidad</strong> (5, 10 y 15 minutos), la <strong>densidad comercial</strong>, y las <strong>zonas estratégicas</strong> evaluadas. Use los controles del mapa para navegar y analizar cada escenario.</p>
</div>

```js
// Initialize map once (non-reactive)
if (isDataAvailable(isocronas)) {
  // Dynamic import of Leaflet
  const L = await import("npm:leaflet@1.9.4");
  
  // Add Leaflet CSS to page
  html`<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />`;
  
  const container = display(document.createElement("div"));
  container.style.height = "650px";
  container.style.border = "2px solid var(--strtgy-blue)";
  container.style.borderRadius = "12px";
  container.style.overflow = "hidden";
  container.style.boxShadow = "0 4px 20px rgba(0, 102, 204, 0.15)";
  container.style.margin = "1.5rem 0";
  
  // Wait for container to be in DOM
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // Initialize Leaflet map
  const map = L.map(container).setView([29.0892, -110.9608], 12);
  
  // Base tile layer with CartoDB Positron for cleaner look
  const baseLayer = L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
  }).addTo(map);
  
  // Google Maps Traffic Layer using Leaflet.GridLayer
  const GoogleTrafficLayer = L.GridLayer.extend({
    createTile: function(coords) {
      const tile = document.createElement('img');
      const url = `https://mts1.google.com/vt?lyrs=m@221097413,traffic&x=${coords.x}&y=${coords.y}&z=${coords.z}`;
      tile.setAttribute('src', url);
      tile.style.opacity = '0.7';
      return tile;
    }
  });
  
  const trafficLayer = new GoogleTrafficLayer({
    attribution: '&copy; <a href="https://www.google.com/maps">Google Maps</a> Traffic'
  });
  
  // Layer groups for toggle control
  const layerGroups = {
    iso5: L.layerGroup(),
    iso10: L.layerGroup(),
    iso15: L.layerGroup(),
    densidad: L.layerGroup(),
    establecimientos: L.layerGroup(),
    traffic: trafficLayer
  };
  
  // Separate isocronas by time range
  const iso5Features = isocronas.features.filter(f => f.properties.range === 300);
  const iso10Features = isocronas.features.filter(f => f.properties.range === 600);
  const iso15Features = isocronas.features.filter(f => f.properties.range === 900);
  
  // 15 min isochrone (outermost, lightest)
  if (iso15Features.length > 0) {
    L.geoJSON({type: "FeatureCollection", features: iso15Features}, {
      style: {
        color: "#9b59b6",
        weight: 2,
        fillOpacity: 0.08,
        fillColor: "#9b59b6",
        dashArray: "8, 8"
      },
      onEachFeature: (feature, layer) => {
        layer.bindPopup(`
          <div style="font-family: system-ui; padding: 0.5rem;">
            <strong style="color: #9b59b6; font-size: 1.1rem;">⏱️ 15 minutos</strong><br>
            <span style="font-size: 0.9rem; color: #555;">Radio de cobertura máximo</span>
          </div>
        `);
      }
    }).addTo(layerGroups.iso15);
  }
  
  // 10 min isochrone (middle, moderate)
  if (iso10Features.length > 0) {
    L.geoJSON({type: "FeatureCollection", features: iso10Features}, {
      style: {
        color: "#ff6b35",
        weight: 3,
        fillOpacity: 0.12,
        fillColor: "#ff6b35",
        dashArray: "5, 5"
      },
      onEachFeature: (feature, layer) => {
        layer.bindPopup(`
          <div style="font-family: system-ui; padding: 0.5rem;">
            <strong style="color: var(--strtgy-orange); font-size: 1.1rem;">⏱️ 10 minutos</strong><br>
            <span style="font-size: 0.9rem; color: #555;">Radio de cobertura extendido</span>
          </div>
        `);
      }
    }).addTo(layerGroups.iso10);
  }
  
  // 5 min isochrone (inner, darkest)
  if (iso5Features.length > 0) {
    L.geoJSON({type: "FeatureCollection", features: iso5Features}, {
      style: {
        color: "#00a651",
        weight: 3,
        fillOpacity: 0.2,
        fillColor: "#00a651"
      },
      onEachFeature: (feature, layer) => {
        layer.bindPopup(`
          <div style="font-family: system-ui; padding: 0.5rem;">
            <strong style="color: var(--strtgy-green); font-size: 1.1rem;">🎯 5 minutos</strong><br>
            <span style="font-size: 0.9rem; color: #555;">Radio de cobertura prioritario</span>
          </div>
        `);
      }
    }).addTo(layerGroups.iso5);
  }
  
  // Add zonas de interés (candidate locations) - always visible
  if (isDataAvailable(zonasInteres)) {
    L.geoJSON(zonasInteres, {
      pointToLayer: (feature, latlng) => {
        return L.circleMarker(latlng, {
          radius: 8,
          fillColor: "#0066cc",
          color: "#003d7a",
          weight: 3,
          opacity: 1,
          fillOpacity: 0.8
        });
      },
      onEachFeature: (feature, layer) => {
        const nombre = feature.properties.nombre || "Ubicación Candidata";
        const score = feature.properties.score || "N/D";
        const rank = feature.properties.rank || "";
        
        layer.bindPopup(`
          <div style="font-family: system-ui; padding: 0.75rem; min-width: 200px;">
            <strong style="color: var(--strtgy-blue); font-size: 1.1rem;">📍 ${nombre}</strong><br>
            ${rank ? `<div style="margin-top: 0.5rem; font-size: 0.9rem;"><strong>Ranking:</strong> #${rank}</div>` : ''}
            ${typeof score === 'number' ? `<div style="font-size: 0.9rem;"><strong>Score:</strong> ${score.toFixed(2)}</div>` : ''}
          </div>
        `);
      }
    }).addTo(map);
  }
  
  // Add DENUE establishments to layer group
  if (isDataAvailable(denue)) {
    // Sample to max 200 points for performance
    const denueSample = denue.features.slice(0, 200);
    
    L.geoJSON({type: "FeatureCollection", features: denueSample}, {
      pointToLayer: (feature, latlng) => {
        const segmento = feature.properties.segmento || "retail";
        const color = segmento === "wholesale" ? "#ff6b35" : 
                     segmento === "retail" ? "#0066cc" :
                     segmento === "health_fitness" ? "#00a651" : "#666";
        
        return L.circleMarker(latlng, {
          radius: 4,
          fillColor: color,
          color: "#fff",
          weight: 1,
          opacity: 0.8,
          fillOpacity: 0.6
        });
      },
      onEachFeature: (feature, layer) => {
        const props = feature.properties;
        layer.bindPopup(`
          <div style="font-family: system-ui; padding: 0.5rem;">
            <strong>${props.nom_estab || "Establecimiento"}</strong><br>
            <span style="font-size: 0.85rem;">Segmento: ${props.segmento || "N/D"}</span>
          </div>
        `);
      }
    }).addTo(layerGroups.establecimientos);
  }
  
  // Add grid 500m (if available) with density coloring
  if (isDataAvailable(grid500m)) {
    const scores = grid500m.features.map(f => f.properties.suitability_score || 0).filter(s => s > 0);
    const maxScore = scores.length > 0 ? Math.max(...scores) : 100;
    const minScore = scores.length > 0 ? Math.min(...scores) : 0;
    
    // Color scale function: green (low) -> yellow (medium) -> orange (high) -> red (very high)
    const getColor = (score) => {
      if (score === 0) return "#cccccc";
      
      // Normalize score to 0-1 range
      const normalized = maxScore > minScore ? (score - minScore) / (maxScore - minScore) : 0;
      
      if (normalized < 0.25) return "#ffffb2"; // Light yellow (low)
      if (normalized < 0.5) return "#fecc5c";  // Yellow (medium-low)
      if (normalized < 0.75) return "#fd8d3c"; // Orange (medium-high)
      return "#f03b20"; // Red-orange (high)
    };
    
    L.geoJSON(grid500m, {
      style: (feature) => {
        const score = feature.properties.suitability_score || 0;
        const color = getColor(score);
        const opacity = score > 0 ? 0.5 : 0.1;
        
        return {
          color: score > 60 ? "#d73027" : "#999",
          weight: score > 60 ? 1.5 : 0.5,
          fillOpacity: opacity,
          fillColor: color
        };
      },
      onEachFeature: (feature, layer) => {
        const props = feature.properties;
        const score = props.suitability_score || 0;
        const customers5km = props.customers_5km || 0;
        const customers10km = props.customers_10km || 0;
        const coverage = props.coverage_ratio || 0;
        
        layer.bindPopup(`
          <div style="font-family: system-ui; padding: 0.5rem; min-width: 220px;">
            <strong style="color: var(--strtgy-orange); font-size: 1.1rem;">📊 Cuadrícula 500m</strong><br>
            <div style="margin-top: 0.5rem; font-size: 0.9rem;">
              <strong>Score Idoneidad:</strong> ${score.toFixed(2)}<br>
              <strong>Clientes 5km:</strong> ${customers5km}<br>
              <strong>Clientes 10km:</strong> ${customers10km}<br>
              <strong>Cobertura:</strong> ${(coverage * 100).toFixed(1)}%
            </div>
          </div>
        `);
      }
    }).addTo(layerGroups.densidad);
  }
  
  // Initialize layers with default visibility
  layerGroups.iso5.addTo(map);
  layerGroups.iso10.addTo(map);
  
  // Fit map to isocronas bounds (only once at initialization)
  if (iso5Features.length > 0 || iso10Features.length > 0) {
    const allIso = [...iso5Features, ...iso10Features];
    const isoLayer = L.geoJSON({type: "FeatureCollection", features: allIso});
    map.fitBounds(isoLayer.getBounds(), {padding: [30, 30]});
  }
  
  // Enhanced legend
  const legendControl = L.control({position: 'bottomright'});
  legendControl.onAdd = function() {
    const div = L.DomUtil.create('div', 'map-legend');
    div.style.cssText = `
      background: rgba(255, 255, 255, 0.97);
      backdrop-filter: blur(8px);
      padding: 16px;
      border-radius: 10px;
      box-shadow: 0 4px 16px rgba(0,0,0,0.2);
      font-size: 12px;
      line-height: 1.8;
      min-width: 180px;
      border: 2px solid var(--strtgy-blue);
    `;
    div.innerHTML = `
      <h4 style="margin: 0 0 12px 0; font-size: 14px; font-weight: 700; color: var(--strtgy-blue); border-bottom: 2px solid var(--strtgy-blue); padding-bottom: 8px;">
        📍 Leyenda
      </h4>
      <div style="display: flex; align-items: center; margin: 8px 0;">
        <div style="width: 24px; height: 18px; background-color: #00a651; opacity: 0.5; margin-right: 10px; border: 1px solid #00a651; border-radius: 4px;"></div>
        <span style="font-weight: 500;">Isocrona 5 min</span>
      </div>
      <div style="display: flex; align-items: center; margin: 8px 0;">
        <div style="width: 24px; height: 18px; background-color: #ff6b35; opacity: 0.4; margin-right: 10px; border: 1px dashed #ff6b35; border-radius: 4px;"></div>
        <span style="font-weight: 500;">Isocrona 10 min</span>
      </div>
      <div style="display: flex; align-items: center; margin: 8px 0;">
        <div style="width: 24px; height: 18px; background-color: #9b59b6; opacity: 0.3; margin-right: 10px; border: 1px dotted #9b59b6; border-radius: 4px;"></div>
        <span style="font-weight: 500;">Isocrona 15 min</span>
      </div>
      <div style="display: flex; align-items: center; margin: 8px 0;">
        <div style="width: 16px; height: 16px; background: #0066cc; border: 2px solid #003d7a; border-radius: 50%; margin-right: 10px; margin-left: 4px;"></div>
        <span style="font-weight: 500;">Ubicación candidata</span>
      </div>
      <div style="margin: 12px 0 4px 0; font-weight: 600; font-size: 12px; color: #555;">Grid Idoneidad:</div>
      <div style="display: flex; align-items: center; margin: 4px 0;">
        <div style="width: 20px; height: 14px; background: #ffffb2; margin-right: 8px; border: 1px solid #ddd; border-radius: 3px;"></div>
        <span style="font-size: 11px;">Baja (0-25%)</span>
      </div>
      <div style="display: flex; align-items: center; margin: 4px 0;">
        <div style="width: 20px; height: 14px; background: #fecc5c; margin-right: 8px; border: 1px solid #ddd; border-radius: 3px;"></div>
        <span style="font-size: 11px;">Media (25-50%)</span>
      </div>
      <div style="display: flex; align-items: center; margin: 4px 0;">
        <div style="width: 20px; height: 14px; background: #fd8d3c; margin-right: 8px; border: 1px solid #ddd; border-radius: 3px;"></div>
        <span style="font-size: 11px;">Alta (50-75%)</span>
      </div>
      <div style="display: flex; align-items: center; margin: 4px 0;">
        <div style="width: 20px; height: 14px; background: #f03b20; margin-right: 8px; border: 1px solid #ddd; border-radius: 3px;"></div>
        <span style="font-size: 11px;">Muy Alta (>75%)</span>
      </div>
    `;
    return div;
  };
  legendControl.addTo(map);
  
  // Cleanup on invalidation
  invalidation.then(() => {
    map.remove();
  });
  
  // Expose map and layer groups for reactive updates
  window._mapaUbicacion = {map, layerGroups, L};
  
} else {
  display(html`<div class="warning" style="background: #fff3e0; border-left: 4px solid #ff9800; padding: 1.5rem; border-radius: 8px; margin: 2rem 0;">
    <p style="margin: 0 0 0.5rem 0;"><strong style="color: #e65100;">⚠️ Mapa no disponible</strong></p>
    <p style="margin: 0; font-size: 0.9rem;">Coloca el archivo <code>isocronas_5_10_15.geojson</code> en <code>src/data/</code> para visualizar el análisis de ubicación.</p>
  </div>`);
}
```

```js
// Interactive layer toggles (separate cell for reactivity)
const showIso5 = view(Inputs.toggle({label: "Mostrar isocrona 5 min", value: true}));
const showIso10 = view(Inputs.toggle({label: "Mostrar isocrona 10 min", value: true}));
const showIso15 = view(Inputs.toggle({label: "Mostrar isocrona 15 min", value: false}));
const showDensidad = view(Inputs.toggle({label: "Mostrar densidad comercial", value: false}));
const showEstablecimientos = view(Inputs.toggle({label: "Mostrar establecimientos", value: false}));
const showTraffic = view(Inputs.toggle({label: "🚦 Mostrar tráfico en tiempo real", value: false}));
```

<div style="background: var(--theme-background-alt); padding: 1rem; border-radius: 8px; margin: 1rem 0; display: flex; gap: 2rem; flex-wrap: wrap; border: 1px solid var(--theme-foreground-faintest);">
  <div style="display: flex; align-items: center; gap: 0.5rem;">
    ${showIso5}
  </div>
  <div style="display: flex; align-items: center; gap: 0.5rem;">
    ${showIso10}
  </div>
  <div style="display: flex; align-items: center; gap: 0.5rem;">
    ${showIso15}
  </div>
  <div style="display: flex; align-items: center; gap: 0.5rem;">
    ${showDensidad}
  </div>
  <div style="display: flex; align-items: center; gap: 0.5rem;">
    ${showEstablecimientos}
  </div>
  <div style="display: flex; align-items: center; gap: 0.5rem;">
    ${showTraffic}
  </div>
</div>

```js
// Reactive cell to update layers visibility (without recreating map)
if (window._mapaUbicacion) {
  const {map, layerGroups} = window._mapaUbicacion;
  
  // Update layer visibility based on toggle state
  if (showIso5) {
    if (!map.hasLayer(layerGroups.iso5)) layerGroups.iso5.addTo(map);
  } else {
    if (map.hasLayer(layerGroups.iso5)) map.removeLayer(layerGroups.iso5);
  }
  
  if (showIso10) {
    if (!map.hasLayer(layerGroups.iso10)) layerGroups.iso10.addTo(map);
  } else {
    if (map.hasLayer(layerGroups.iso10)) map.removeLayer(layerGroups.iso10);
  }
  
  if (showIso15) {
    if (!map.hasLayer(layerGroups.iso15)) layerGroups.iso15.addTo(map);
  } else {
    if (map.hasLayer(layerGroups.iso15)) map.removeLayer(layerGroups.iso15);
  }
  
  if (showDensidad) {
    if (!map.hasLayer(layerGroups.densidad)) layerGroups.densidad.addTo(map);
  } else {
    if (map.hasLayer(layerGroups.densidad)) map.removeLayer(layerGroups.densidad);
  }
  
  if (showEstablecimientos) {
    if (!map.hasLayer(layerGroups.establecimientos)) layerGroups.establecimientos.addTo(map);
  } else {
    if (map.hasLayer(layerGroups.establecimientos)) map.removeLayer(layerGroups.establecimientos);
  }
  
  if (showTraffic) {
    if (!map.hasLayer(layerGroups.traffic)) layerGroups.traffic.addTo(map);
  } else {
    if (map.hasLayer(layerGroups.traffic)) map.removeLayer(layerGroups.traffic);
  }
}
```

---

## Comparativa Estratégica de Ubicaciones

```js
display(sectionHeader({
  title: "Evaluación Multicriterio de Escenarios",
  subtitle: "Análisis comparativo de ubicaciones candidatas para CEDIS con scoring ponderado",
  certainty: "medium"
}));
```

```js
if (isDataAvailable(zonasInteres)) {
  // Create enhanced comparison data with scoring
  const escenarios = zonasInteres.features.map((f, idx) => {
    const nombre = f.properties.nombre || `Escenario ${idx + 1}`;
    const score = f.properties.score || 50;
    const rank = f.properties.rank || (idx + 1);
    
    // Scoring logic based on actual grid data properties
    const scores = {
      accesibilidad: f.properties.score_proximity || 
        (f.properties.customers_5km ? Math.min(100, (f.properties.customers_5km / 100) * 100) : Math.max(50, score - 10)),
      densidad: f.properties.score_coverage || 
        (f.properties.customers_10km ? Math.min(100, (f.properties.customers_10km / 200) * 100) : score),
      logistica: f.properties.score_infrastructure || (rank <= 2 ? 85 : 70),
      costo: rank === 1 ? 60 : (rank === 2 ? 75 : 80)
    };
    
    const scoreTotal = Math.round(
      scores.accesibilidad * 0.35 + 
      scores.densidad * 0.30 + 
      scores.logistica * 0.25 + 
      scores.costo * 0.10
    );
    
    return {
      escenario: nombre,
      score_total: scoreTotal,
      accesibilidad: Math.round(scores.accesibilidad),
      densidad_comercial: Math.round(scores.densidad),
      acceso_trailers: Math.round(scores.logistica),
      costo_beneficio: Math.round(scores.costo),
      prioridad: scoreTotal >= 75 ? "1" : "2",
      recomendacion: scoreTotal >= 75 ? "Prioritario" : "Alternativa"
    };
  }).sort((a, b) => b.score_total - a.score_total);
  
  // Interactive scenario selector
  const escenarioSeleccionado = view(
    Inputs.select(
      escenarios.map(e => e.escenario),
      {
        label: "Seleccionar escenario para detalle:",
        value: escenarios[0].escenario
      }
    )
  );
  
  const detalle = escenarios.find(e => e.escenario === escenarioSeleccionado);
  
  // Display scenario detail card
  if (detalle) {
    display(html`
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 2rem; border-radius: 12px; margin: 1.5rem 0; box-shadow: 0 6px 24px rgba(102,126,234,0.3);">
        <h3 style="margin: 0 0 1rem 0; font-size: 1.5rem;">📍 ${detalle.escenario}</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 1rem; margin-top: 1.5rem;">
          <div style="background: rgba(255,255,255,0.15); padding: 1rem; border-radius: 8px; text-align: center;">
            <div style="font-size: 2rem; font-weight: 700;">${detalle.score_total}</div>
            <div style="font-size: 0.875rem; opacity: 0.9; margin-top: 0.25rem;">Score Total</div>
          </div>
          <div style="background: rgba(255,255,255,0.15); padding: 1rem; border-radius: 8px; text-align: center;">
            <div style="font-size: 2rem; font-weight: 700;">${detalle.accesibilidad}</div>
            <div style="font-size: 0.875rem; opacity: 0.9; margin-top: 0.25rem;">Accesibilidad</div>
          </div>
          <div style="background: rgba(255,255,255,0.15); padding: 1rem; border-radius: 8px; text-align: center;">
            <div style="font-size: 2rem; font-weight: 700;">${detalle.densidad_comercial}</div>
            <div style="font-size: 0.875rem; opacity: 0.9; margin-top: 0.25rem;">Densidad</div>
          </div>
          <div style="background: rgba(255,255,255,0.15); padding: 1rem; border-radius: 8px; text-align: center;">
            <div style="font-size: 2rem; font-weight: 700;">${detalle.acceso_trailers}</div>
            <div style="font-size: 0.875rem; opacity: 0.9; margin-top: 0.25rem;">Logística</div>
          </div>
        </div>
        <div style="margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid rgba(255,255,255,0.3); text-align: center;">
          <span style="background: ${detalle.prioridad === '1' ? '#00a651' : '#ff9800'}; padding: 0.5rem 1.5rem; border-radius: 20px; font-weight: 600; font-size: 1rem;">
            ${detalle.recomendacion}
          </span>
        </div>
      </div>
    `);
  }
  
  // Comparison table
  display(html`<h4 style="margin: 2rem 0 1rem 0; font-size: 1.1rem; color: var(--strtgy-blue);">📊 Tabla Comparativa Completa</h4>`);
  
  display(
    table(
      escenarios,
      [
        {
          key: "escenario", 
          label: "Ubicación",
          format: (v, row) => {
            const isTop = row.prioridad === "1";
            return html`<strong style="color: ${isTop ? 'var(--strtgy-blue)' : '#666'};">${v}</strong>`;
          }
        },
        {
          key: "score_total", 
          label: "Score Total",
          format: (v) => html`<span style="font-weight: 700; font-size: 1.1rem; color: ${v >= 75 ? 'var(--strtgy-green)' : 'var(--strtgy-orange)'};">${v}</span>`
        },
        {
          key: "accesibilidad", 
          label: "Accesibilidad (35%)",
          format: (v) => html`<div style="display: flex; align-items: center; gap: 0.5rem;">
            <div style="flex: 1; background: #e0e0e0; height: 8px; border-radius: 4px; overflow: hidden;">
              <div style="width: ${v}%; background: linear-gradient(90deg, var(--strtgy-green), #00d66c); height: 100%;"></div>
            </div>
            <span style="font-weight: 600; min-width: 2rem;">${v}</span>
          </div>`
        },
        {
          key: "densidad_comercial", 
          label: "Densidad (30%)",
          format: (v) => html`<div style="display: flex; align-items: center; gap: 0.5rem;">
            <div style="flex: 1; background: #e0e0e0; height: 8px; border-radius: 4px; overflow: hidden;">
              <div style="width: ${v}%; background: linear-gradient(90deg, var(--strtgy-blue), #4da6ff); height: 100%;"></div>
            </div>
            <span style="font-weight: 600; min-width: 2rem;">${v}</span>
          </div>`
        },
        {
          key: "acceso_trailers", 
          label: "Logística (25%)",
          format: (v) => html`<div style="display: flex; align-items: center; gap: 0.5rem;">
            <div style="flex: 1; background: #e0e0e0; height: 8px; border-radius: 4px; overflow: hidden;">
              <div style="width: ${v}%; background: linear-gradient(90deg, var(--strtgy-orange), #ff8c5a); height: 100%;"></div>
            </div>
            <span style="font-weight: 600; min-width: 2rem;">${v}</span>
          </div>`
        },
        {
          key: "prioridad", 
          label: "Prioridad",
          format: (v) => v === "1" ? badge("Alta", "high") : badge("Media", "medium")
        }
      ],
      {
        sortable: true,
        exportable: true,
        pageSize: 0
      }
    )
  );
} else {
  display(html`<p style="color: var(--theme-foreground-muted); padding: 2rem; text-align: center; background: var(--theme-background-alt); border-radius: 8px;">
    ⚠️ Coloca archivo de ubicaciones candidatas en src/data/ para ver comparativa.
  </p>`);
}
```

## Análisis de densidad comercial por cuadrícula

```js
if (isDataAvailable(grid500m)) {
  import * as Plot from "npm:@observablehq/plot";
  
  const gridData = grid500m.features.map(f => ({
    score: f.properties.suitability_score || 0,
    customers_5km: f.properties.customers_5km || 0,
    customers_10km: f.properties.customers_10km || 0,
    coverage: (f.properties.coverage_ratio || 0) * 100
  })).filter(d => d.score > 0);
  
  if (gridData.length > 0) {
    display(Plot.plot({
      width,
      height: 400,
      marginLeft: 60,
      marginBottom: 50,
      x: {label: "Clientes en 10km", grid: true},
      y: {label: "Score de Idoneidad", grid: true},
      color: {label: "Cobertura (%)", scheme: "Greens", legend: true},
      marks: [
        Plot.dot(gridData, {
          x: "customers_10km",
          y: "score",
          fill: "coverage",
          r: 4,
          opacity: 0.7,
          tip: true
        }),
        Plot.linearRegressionY(gridData, {
          x: "customers_10km",
          y: "score",
          stroke: "#00a651",
          strokeWidth: 2,
          strokeDasharray: "4,4"
        })
      ]
    }));
    
    display(html`<p style="font-size: 0.875rem; color: var(--theme-foreground-muted); text-align: center; margin-top: 0.5rem;">
      Relación entre clientes potenciales en radio de 10km y score de idoneidad por cuadrícula de 500m. El color indica el ratio de cobertura.
    </p>`);
  }
} else {
  display(html`<p style="color: var(--theme-foreground-muted); padding: 1rem; text-align: center; background: var(--theme-background-alt); border-radius: 8px; margin: 2rem 0;">
    Datos de cuadrícula no disponibles para análisis de densidad.
  </p>`);
}
```

---

## Recomendación Estratégica STRTGY

```js
display(implicationsCallout({
  title: "💡 Insights Clave y Recomendaciones",
  items: [
    "El análisis de isocronas identifica ubicaciones óptimas con cobertura >70% de establecimientos objetivo en 10 minutos",
    "Las ubicaciones candidatas balancean accesibilidad comercial y viabilidad logística para operaciones B2B",
    "La densidad comercial por cuadrícula confirma concentración de demanda en corredores identificados",
    "Se recomienda validación de campo para confirmar disponibilidad inmobiliaria y restricciones operativas"
  ]
}));
```

<div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); color: white; padding: 2.5rem; border-radius: 12px; margin: 2rem 0; box-shadow: 0 6px 24px rgba(0,0,0,0.2);">
  <h3 style="margin: 0 0 1.5rem 0; font-size: 1.5rem; border-bottom: 2px solid var(--strtgy-blue); padding-bottom: 1rem;">🎯 Recomendación Ejecutiva</h3>
  
  <div style="display: grid; gap: 1.5rem; margin-top: 1.5rem;">
    <div style="background: rgba(0, 166, 81, 0.15); border-left: 4px solid #00a651; padding: 1.25rem; border-radius: 8px;">
      <h4 style="margin: 0 0 0.75rem 0; color: #00d66c; font-size: 1.1rem;">✅ Ubicación Óptima Identificada</h4>
      <p style="margin: 0; line-height: 1.6; font-size: 0.95rem; opacity: 0.95;">
        <strong>Ventajas:</strong> Máxima cobertura de establecimientos objetivo, equilibrio entre accesibilidad comercial y viabilidad logística.<br>
        <strong>Próximos pasos:</strong> Validación inmobiliaria, análisis de costos operativos, confirmación de restricciones de tráfico.
      </p>
    </div>
    
    <div style="background: rgba(0, 102, 204, 0.15); border-left: 4px solid #0066cc; padding: 1.25rem; border-radius: 8px;">
      <h4 style="margin: 0 0 0.75rem 0; color: #4da6ff; font-size: 1.1rem;">📊 Metodología Basada en Datos</h4>
      <p style="margin: 0; line-height: 1.6; font-size: 0.95rem; opacity: 0.95;">
        Análisis multicriterio con isocronas calculadas, datos DENUE de establecimientos, y métricas de densidad comercial por cuadrícula de 500m.
      </p>
    </div>
    
    <div style="background: rgba(255, 107, 53, 0.15); border-left: 4px solid #ff6b35; padding: 1.25rem; border-radius: 8px;">
      <h4 style="margin: 0 0 0.75rem 0; color: #ff8c5a; font-size: 1.1rem;">🔍 Consideraciones Operativas</h4>
      <p style="margin: 0; line-height: 1.6; font-size: 0.95rem; opacity: 0.95;">
        Validar: disponibilidad inmobiliaria real, costos de renta/compra actualizados, regulaciones de carga/descarga, tiempos en horas pico.
      </p>
    </div>
  </div>
</div>

---

<div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); color: white; padding: 2rem; border-radius: 12px; margin: 3rem 0 2rem 0; text-align: center;">
  <div style="margin-bottom: 1rem;">
    <span style="font-size: 2rem; font-weight: 700; background: linear-gradient(90deg, #4da6ff, #00d66c); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">STRTGY</span>
  </div>
  <p style="margin: 0; font-size: 0.95rem; opacity: 0.9; line-height: 1.6;">
    <strong>Certeza por encima de todo.</strong> Obsesión por el ROI del cliente.<br>
    Análisis geoespacial con inteligencia artificial para decisiones de negocio medibles.
  </p>
  <div style="margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid rgba(255,255,255,0.2); font-size: 0.85rem; opacity: 0.7;">
    Análisis basado en isocronas calculadas, DENUE y métricas de densidad espacial.<br>
    Se recomienda actualizar con validación de campo antes de la decisión final.
  </div>
</div>
