---
title: 7) Dashboard Interactivo
toc: false
---

```js
import {sectionHeader, decisionCallout} from "./components/brand.js";
import {kpi, formatNumber, table} from "./components/ui.js";
import {createBaseMap, addGeoJsonLayer, styleByScore, getColorForScore, createLegend, fitBounds, createEstablishmentPopup, createLayerControl} from "./components/maps.js";

// Cargar todos los datasets
const top400 = await FileAttachment("data/top400.web.geojson").json();
const agebs = await FileAttachment("data/agebs_base.web.geojson").json();
const sweetspots = await FileAttachment("data/sweetspot_top10.web.geojson").json();
const top10hubs = await FileAttachment("data/top10_hubs.web.csv").csv({typed: true});
```

```js
display(sectionHeader({
  title: "Dashboard Interactivo de Priorización",
  subtitle: "Explora, filtra y exporta establecimientos priorizados con controles dinámicos",
  certainty: "high"
}));
```

```js
display(decisionCallout({
  title: "Cómo usar este dashboard",
  items: [
    "Usa los filtros abajo para segmentar por decil, segmento de negocio o colonia",
    "El mapa se actualiza automáticamente mostrando solo los establecimientos filtrados",
    "La tabla es ordenable (clic en encabezados) y exportable a CSV para uso en CRM o ruteo",
    "Los KPIs superiores muestran métricas agregadas de la selección actual"
  ]
}));
```

---

## Filtros Dinámicos

```js
// Inputs de filtrado
const segmentos = ["Todos", ...new Set(top400.features.map(f => f.properties.segmento).filter(Boolean))];
viewof segmentoSeleccionado = Inputs.select(segmentos, {
  label: "Segmento de Negocio",
  value: "Todos"
});
```

```js
viewof decilMinimo = Inputs.range([1, 10], {
  label: "Decil Mínimo (1=bajo, 10=alto)",
  value: 7,
  step: 1
});
```

```js
viewof scoreMinimo = Inputs.range([0, 100], {
  label: "Score Mínimo",
  value: 60,
  step: 5
});
```

```js
// Colonias disponibles
const colonias = ["Todas", ...new Set(top400.features.map(f => f.properties.colonia).filter(Boolean)).sort()];
viewof coloniaSeleccionada = Inputs.search(colonias, {
  label: "Buscar por Colonia",
  placeholder: "Escribe para filtrar...",
  value: "Todas"
});
```

---

## Resultados Filtrados

```js
// Aplicar filtros
const establecimientosFiltrados = top400.features.filter(f => {
  const props = f.properties;
  
  // Filtro por segmento
  if (segmentoSeleccionado !== "Todos" && props.segmento !== segmentoSeleccionado) {
    return false;
  }
  
  // Filtro por decil
  if (props.decil < decilMinimo) {
    return false;
  }
  
  // Filtro por score
  if ((props.score_electrolit || 0) < scoreMinimo) {
    return false;
  }
  
  // Filtro por colonia
  if (coloniaSeleccionada !== "Todas" && props.colonia !== coloniaSeleccionada) {
    return false;
  }
  
  return true;
});

// Crear GeoJSON filtrado
const geoJsonFiltrado = {
  type: "FeatureCollection",
  features: establecimientosFiltrados
};

// Métricas de los filtrados
const totalFiltrados = establecimientosFiltrados.length;
const scorePromedio = totalFiltrados > 0
  ? establecimientosFiltrados.reduce((sum, f) => sum + (f.properties.score_electrolit || 0), 0) / totalFiltrados
  : 0;

const segmentosDistrib = establecimientosFiltrados.reduce((acc, f) => {
  const seg = f.properties.segmento || "otro";
  acc[seg] = (acc[seg] || 0) + 1;
  return acc;
}, {});
```

### Métricas de la Selección

```js
display(
  kpi([
    {
      label: "Establecimientos Seleccionados",
      value: formatNumber(totalFiltrados),
      format: null
    },
    {
      label: "Score Promedio",
      value: scorePromedio.toFixed(1),
      format: null
    },
    {
      label: "% del Total",
      value: `${((totalFiltrados / top400.features.length) * 100).toFixed(1)}%`,
      format: null
    },
    {
      label: "Decil Mínimo Aplicado",
      value: decilMinimo,
      format: null
    }
  ])
);
```

---

## Mapa Interactivo

```js
const mapContainer = display(document.createElement("div"));
mapContainer.style.height = "600px";
mapContainer.style.width = "100%";
mapContainer.style.borderRadius = "8px";
mapContainer.style.overflow = "hidden";
mapContainer.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)";
mapContainer.style.marginBottom = "2rem";

const map = createBaseMap(mapContainer, {
  center: [29.0729, -110.9559],
  zoom: 12
});

// Capa de AGEBs (contexto)
const agebsLayer = addGeoJsonLayer(map, agebs, {
  style: (feature) => ({
    fillColor: "#f5f5f5",
    color: "#ccc",
    weight: 1,
    opacity: 0.4,
    fillOpacity: 0.05
  })
});

// Sweet spots (si están en filtro)
const sweetspotsLayer = addGeoJsonLayer(map, sweetspots, {
  style: (feature) => ({
    fillColor: "#ffd54f",
    color: "#f57f17",
    weight: 2,
    opacity: 0.8,
    fillOpacity: 0.2
  }),
  popupContent: (props) => `
    <div style="font-family: system-ui, sans-serif;">
      <h4 style="margin: 0 0 8px 0; color: #f57f17;">Sweet Spot</h4>
      <p style="margin: 0;">Zona de alta concentración comercial y logística óptima</p>
    </div>
  `
});

// Capa de establecimientos filtrados
const filtradosLayer = addGeoJsonLayer(map, geoJsonFiltrado, {
  pointToLayer: (feature, latlng) => {
    const score = feature.properties.score_electrolit || 0;
    const color = getColorForScore(score);
    
    return L.circleMarker(latlng, {
      radius: 6 + (score / 100) * 6,
      fillColor: color,
      color: "#fff",
      weight: 2,
      opacity: 1,
      fillOpacity: 0.85
    });
  },
  popupContent: (props) => createEstablishmentPopup(props)
});

if (totalFiltrados > 0) {
  fitBounds(map, filtradosLayer, 40);
}

// Leyenda
createLegend(map, [
  {type: "header", label: "Score de Potencial"},
  {type: "circle", color: getColorForScore(95), label: "90–100 (Crítico)"},
  {type: "circle", color: getColorForScore(85), label: "80–89 (Muy Alto)"},
  {type: "circle", color: getColorForScore(70), label: "70–79 (Alto)"},
  {type: "circle", color: getColorForScore(55), label: "60–69 (Medio-Alto)"},
  {type: "separator"},
  {type: "square", color: "#ffd54f", label: "Sweet Spots"}
], {
  position: "bottomright",
  title: "Leyenda"
});
```

<div class="note" style="background: #fff3e0; border-left: 4px solid #ff9800; padding: 1rem; margin: 1.5rem 0;">
  <p style="margin: 0; font-weight: 600;">💡 Tip de Uso</p>
  <p style="margin: 0.5rem 0 0 0;">
    Si no ves establecimientos en el mapa, ajusta los filtros (especialmente decil y score mínimo). 
    Los filtros muy restrictivos pueden resultar en 0 coincidencias.
  </p>
</div>

---

## Tabla de Resultados

```js
// Preparar datos para tabla
const tablaData = establecimientosFiltrados
  .map(f => ({
    nom_estab: f.properties.nom_estab || "Sin nombre",
    segmento: f.properties.segmento || "N/A",
    score_electrolit: f.properties.score_electrolit,
    decil: f.properties.decil,
    colonia: f.properties.colonia || "N/A",
    direccion: f.properties.direccion || "N/A",
    lat: f.geometry.coordinates[1],
    lon: f.geometry.coordinates[0]
  }))
  .sort((a, b) => (b.score_electrolit || 0) - (a.score_electrolit || 0));

display(html`
  <div class="card">
    <h3>Establecimientos Seleccionados (${formatNumber(totalFiltrados)})</h3>
    <p style="color: #666; font-size: 0.9rem; margin-bottom: 1rem;">
      Tabla ordenable y exportable a CSV. Usa el botón "Exportar CSV" para descargar la lista completa con coordenadas.
    </p>
    ${table(
      tablaData,
      [
        {key: "nom_estab", label: "Establecimiento"},
        {key: "segmento", label: "Segmento", format: (v) => {
          const colors = {retail: "#1565c0", horeca: "#e65100", institucional: "#6a1b9a"};
          const bg = {retail: "#e3f2fd", horeca: "#fff3e0", institucional: "#f3e5f5"};
          return `<span style="background: ${bg[v] || '#f5f5f5'}; color: ${colors[v] || '#666'}; padding: 3px 8px; border-radius: 10px; font-size: 0.8rem; font-weight: 600;">${v || 'N/A'}</span>`;
        }},
        {key: "score_electrolit", label: "Score", format: (v) => v != null ? `<strong>${v.toFixed(1)}</strong>` : "N/A"},
        {key: "decil", label: "Decil", format: (v) => `<span style="background: #e8eaf6; color: #3f51b5; padding: 3px 7px; border-radius: 6px; font-weight: 600;">${v || 'N/A'}</span>`},
        {key: "colonia", label: "Colonia"},
        {key: "direccion", label: "Dirección", format: (v) => `<span style="font-size: 0.85rem; color: #666;">${v}</span>`}
      ],
      {sortable: true, exportable: true, pageSize: 50}
    )}
  </div>
`);
```

---

## Análisis Rápido

### Distribución por Segmento en Selección

```js
if (totalFiltrados > 0) {
  const segmentosArray = Object.entries(segmentosDistrib)
    .map(([seg, count]) => ({
      segmento: seg,
      cantidad: count,
      porcentaje: (count / totalFiltrados) * 100
    }))
    .sort((a, b) => b.cantidad - a.cantidad);
  
  display(html`
    <div class="card">
      <h3>Composición por Segmento</h3>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem; margin-top: 1rem;">
        ${segmentosArray.map(s => `
          <div style="
            background: linear-gradient(135deg, ${s.segmento === 'retail' ? '#e3f2fd' : s.segmento === 'horeca' ? '#fff3e0' : '#f3e5f5'} 0%, white 100%);
            padding: 1.5rem;
            border-radius: 8px;
            border: 1px solid #e0e0e0;
            text-align: center;
          ">
            <div style="font-size: 2rem; font-weight: 700; color: ${s.segmento === 'retail' ? '#1565c0' : s.segmento === 'horeca' ? '#e65100' : '#6a1b9a'}; margin-bottom: 0.5rem;">
              ${formatNumber(s.cantidad)}
            </div>
            <div style="font-weight: 600; text-transform: capitalize; margin-bottom: 0.25rem;">${s.segmento}</div>
            <div style="font-size: 0.9rem; color: #666;">${s.porcentaje.toFixed(1)}% del total</div>
          </div>
        `).join('')}
      </div>
    </div>
  `);
} else {
  display(html`
    <div class="card" style="background: #fff3e0; border-left: 4px solid #ff9800;">
      <p style="margin: 0; font-weight: 600; color: #e65100;">⚠️ No hay resultados con los filtros actuales</p>
      <p style="margin: 0.5rem 0 0 0; color: #666;">
        Ajusta los valores de decil mínimo o score mínimo para ver más establecimientos.
      </p>
    </div>
  `);
}
```

---

## Próximos Pasos con la Selección

<div class="grid grid-cols-2">
  <div class="card">
    <h3>Para el Equipo Comercial</h3>
    <ol style="margin: 0; padding-left: 1.25rem; font-size: 0.9rem;">
      <li>Exporta la lista a CSV usando el botón en la tabla</li>
      <li>Importa a tu CRM o herramienta de gestión de prospección</li>
      <li>Usa las coordenadas (lat/lon) para optimizar rutas de visita</li>
      <li>Prioriza siempre deciles 9–10 antes de atacar deciles menores</li>
    </ol>
  </div>
  <div class="card">
    <h3>Para Operaciones/Logística</h3>
    <ol style="margin: 0; padding-left: 1.25rem; font-size: 0.9rem;">
      <li>Identifica clusters geográficos en el mapa para optimizar entregas</li>
      <li>Consulta <a href="./logistica-sonora">Logística y Sonora</a> para ubicación de CEDIS</li>
      <li>Revisa <a href="./mapas/hubs">Hubs Logísticos</a> para análisis de cobertura</li>
      <li>Valida tiempos de entrega estimados con piloto de campo</li>
    </ol>
  </div>
</div>

---

## Casos de Uso Recomendados

```js
const casosDeUso = [
  {
    caso: "Prospección Inicial (Mes 1–2)",
    filtros: "Decil ≥ 9, Segmento: Todos",
    razon: "Atacar establecimientos de máxima prioridad con equipo senior completo",
    accion: "Generar lista de ~80 establecimientos, dividir entre vendedores por zona geográfica"
  },
  {
    caso: "Expansión Retail (Mes 3–4)",
    filtros: "Decil ≥ 7, Segmento: Retail",
    razon: "Consolidar presencia en tiendas de abarrotes y conveniencia post-piloto",
    accion: "Validar ticket promedio y frecuencia real antes de escalar a deciles menores"
  },
  {
    caso: "Enfoque HORECA (Mes 5–6)",
    filtros: "Decil ≥ 6, Segmento: HORECA",
    razon: "Capturar restaurantes, bares y hoteles con propuesta diferenciada (menú/barra)",
    accion: "Preparar material POS específico y muestras de producto para degustación"
  },
  {
    caso: "Barrido Territorial Completo",
    filtros: "Decil ≥ 5, Segmento: Todos, Colonia: [específica]",
    razon: "Cobertura exhaustiva de una colonia de alta densidad",
    accion: "Optimizar ruta de visita multi-drop, agendar 1–2 días completos en la zona"
  }
];

display(html`
  <div class="card">
    <h3>Casos de Uso por Fase de Implementación</h3>
    <table style="width: 100%; border-collapse: collapse; font-size: 0.9rem;">
      <thead>
        <tr style="background: #f5f5f5; text-align: left;">
          <th style="padding: 10px; border: 1px solid #ddd;">Caso de Uso</th>
          <th style="padding: 10px; border: 1px solid #ddd;">Filtros Sugeridos</th>
          <th style="padding: 10px; border: 1px solid #ddd;">Razón Estratégica</th>
          <th style="padding: 10px; border: 1px solid #ddd;">Acción</th>
        </tr>
      </thead>
      <tbody>
        ${casosDeUso.map(c => `
          <tr style="border: 1px solid #ddd;">
            <td style="padding: 10px; font-weight: 600;">${c.caso}</td>
            <td style="padding: 10px; font-family: monospace; font-size: 0.85rem; background: #f9f9f9;">${c.filtros}</td>
            <td style="padding: 10px; color: #666;">${c.razon}</td>
            <td style="padding: 10px; font-style: italic;">${c.accion}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>
`);
```

---

<div class="note" style="background: #e3f2fd; border-left: 4px solid #2196f3; padding: 1rem; margin: 2rem 0;">
  <p style="margin: 0; font-weight: 600;">📊 Dashboard en Producción</p>
  <p style="margin: 0.5rem 0 0 0;">
    Este dashboard es completamente funcional y puede ser compartido con el equipo comercial mediante un enlace. 
    Al estar desplegado en GitHub Pages, no requiere servidores ni licencias adicionales. 
    Los datos se actualizan al reconstruir el sitio con nuevos datasets.
  </p>
</div>

---

<small style="color: #999;">
  **Sección:** 7 de 7 | **Anterior:** <a href="./logistica-sonora">6) Logística y Sonora</a> | **Ver también:** <a href="./descargas">Descargas</a>
</small>
