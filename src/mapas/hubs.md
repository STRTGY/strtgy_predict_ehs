---
title: 🚚 Hubs Logísticos
toc: false
---

```js
import {sectionHeader, decisionCallout, implicationsCallout} from "../components/brand.js";
import {kpi, formatNumber, table} from "../components/ui.js";
import {createBaseMap, addGeoJsonLayer, createMarker, createCircle, createLegend, fitBounds} from "../components/maps.js";

// Cargar datos
const top10hubs = await FileAttachment("../data/top10_hubs.web.csv").csv({typed: true});
const top400 = await FileAttachment("../data/top400.web.geojson").json();
const agebs = await FileAttachment("../data/agebs_base.web.geojson").json();
```

```js
display(sectionHeader({
  title: "Top 10 Ubicaciones Óptimas para Hub Logístico (CEDIS)",
  subtitle: "Análisis espacial de cobertura y accesibilidad para centro de distribución",
  certainty: "medium"
}));
```

```js
display(decisionCallout({
  title: "¿Qué decidir con este análisis?",
  items: [
    "Seleccionar entre las 3–5 ubicaciones top para evaluación de campo (disponibilidad, costo de renta, infraestructura)",
    "Evaluar trade-off entre cobertura territorial (% de clientes en <30 min) y costo de ubicación",
    "Definir si un solo hub es suficiente para Hermosillo o se requieren micro-hubs zonales",
    "Validar accesibilidad a vías primarias y restricciones de tráfico pesado en horarios pico"
  ]
}));
```

---

## Top 10 Ubicaciones Priorizadas

```js
display(html`
  <div class="card">
    <h3>Ranking de Ubicaciones para CEDIS</h3>
    <p style="color: #666; font-size: 0.9rem; margin-bottom: 1rem;">
      Ubicaciones optimizadas por cobertura de establecimientos Top 400 en radio de 30 minutos. 
      Criterios: centralidad geográfica, acceso a vías principales, densidad de destinos.
    </p>
    ${table(
      top10hubs,
      [
        {key: "ranking", label: "#", format: (v) => `<strong style="font-size: 1.1rem; color: #1565c0;">${v}</strong>`},
        {key: "nombre", label: "Ubicación / Referencia"},
        {key: "lat", label: "Latitud", format: (v) => v?.toFixed(5) || "N/A"},
        {key: "lon", label: "Longitud", format: (v) => v?.toFixed(5) || "N/A"},
        {key: "cobertura_30min", label: "Cobertura 30min", format: (v) => v != null ? `${(v * 100).toFixed(1)}%` : "N/A"},
        {key: "tiempo_prom_min", label: "Tiempo Prom.", format: (v) => v != null ? `${v.toFixed(1)} min` : "N/A"},
        {key: "score_logistico", label: "Score", format: (v) => v != null ? `<strong>${v.toFixed(1)}</strong>` : "N/A"}
      ],
      {sortable: true, exportable: true}
    )}
    <p style="margin-top: 1rem; font-size: 0.85rem; color: #999; font-style: italic;">
      *Cobertura calculada asumiendo velocidad promedio de 40 km/h en zona urbana y acceso a red vial principal.
    </p>
  </div>
`);
```

---

## Mapa de Cobertura por Hub

### Selector de Hub

```js
viewof hubSeleccionado = Inputs.select(
  [0, ...top10hubs.map((h, i) => i + 1)],
  {
    label: "Ver Hub #",
    format: (i) => i === 0 ? "Mostrar todos" : `#${i} - ${top10hubs[i-1].nombre}`,
    value: 1
  }
);
```

```js
const hubsAMostrar = hubSeleccionado === 0 
  ? top10hubs 
  : [top10hubs[hubSeleccionado - 1]];

const hubActual = hubSeleccionado > 0 ? top10hubs[hubSeleccionado - 1] : null;
```

```js
if (hubActual) {
  display(
    kpi([
      {
        label: "Cobertura en 30 min",
        value: hubActual.cobertura_30min != null ? `${(hubActual.cobertura_30min * 100).toFixed(1)}%` : "N/A",
        format: null
      },
      {
        label: "Tiempo Promedio",
        value: hubActual.tiempo_prom_min != null ? `${hubActual.tiempo_prom_min.toFixed(1)} min` : "N/A",
        format: null
      },
      {
        label: "Score Logístico",
        value: hubActual.score_logistico != null ? hubActual.score_logistico.toFixed(1) : "N/A",
        format: null
      },
      {
        label: "Ranking",
        value: `#${hubActual.ranking} de 10`,
        format: null
      }
    ])
  );
}
```

```js
const mapContainer = display(document.createElement("div"));
mapContainer.style.height = "600px";
mapContainer.style.width = "100%";
mapContainer.style.borderRadius = "8px";
mapContainer.style.overflow = "hidden";
mapContainer.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)";

const map = createBaseMap(mapContainer, {
  center: [29.0729, -110.9559],
  zoom: hubSeleccionado === 0 ? 12 : 13
});

// AGEBs base
addGeoJsonLayer(map, agebs, {
  style: () => ({
    fillColor: "#f5f5f5",
    color: "#ccc",
    weight: 1,
    opacity: 0.3,
    fillOpacity: 0.05
  })
});

// Establecimientos Top 400
addGeoJsonLayer(map, top400, {
  pointToLayer: (feature, latlng) => {
    return L.circleMarker(latlng, {
      radius: 4,
      fillColor: "#90caf9",
      color: "#1976d2",
      weight: 1,
      opacity: 0.8,
      fillOpacity: 0.6
    });
  },
  popupContent: (props) => `
    <div style="font-family: system-ui, sans-serif;">
      <h4 style="margin: 0 0 6px 0; color: #1976d2; font-size: 0.95rem;">${props.nom_estab || "Sin nombre"}</h4>
      <div style="font-size: 0.85rem; color: #666;">
        ${props.segmento ? `Segmento: ${props.segmento}<br>` : ""}
        ${props.colonia ? `Colonia: ${props.colonia}` : ""}
      </div>
    </div>
  `
});

// Hubs
hubsAMostrar.forEach((hub, idx) => {
  const latlng = [hub.lat, hub.lon];
  
  // Radio de 30 minutos (aprox 20 km a 40 km/h promedio)
  const radioKm = 20;
  const circulo = createCircle(latlng, {
    radius: radioKm * 1000,
    color: "#f57c00",
    fillColor: "#ff9800",
    fillOpacity: 0.1,
    weight: 2,
    opacity: 0.6
  }).addTo(map);
  
  circulo.bindPopup(`
    <div style="font-family: system-ui, sans-serif;">
      <h4 style="margin: 0 0 8px 0; color: #f57c00;">Radio de 30 min (aprox.)</h4>
      <p style="margin: 0; font-size: 0.85rem;">Cobertura estimada: ${(hub.cobertura_30min * 100).toFixed(1)}% de Top 400</p>
    </div>
  `);
  
  // Marker del hub
  const marker = createMarker(latlng, {
    type: "hub",
    color: hubSeleccionado === 0 ? (idx === 0 ? "#f44336" : "#ff9800") : "#f44336",
    icon: "🚚",
    size: 32
  }).addTo(map);
  
  marker.bindPopup(`
    <div style="font-family: system-ui, sans-serif;">
      <h4 style="margin: 0 0 8px 0; color: #f44336; font-size: 1rem;">Hub #${hub.ranking}</h4>
      <div style="font-size: 0.9rem;">
        <strong>${hub.nombre}</strong><br>
        <span style="color: #666;">
          Cobertura: ${(hub.cobertura_30min * 100).toFixed(1)}%<br>
          Tiempo prom: ${hub.tiempo_prom_min?.toFixed(1)} min<br>
          Score: ${hub.score_logistico?.toFixed(1)}
        </span>
      </div>
    </div>
  `);
  
  if (hubSeleccionado > 0) {
    marker.openPopup();
  }
});

// Leyenda
createLegend(map, [
  {type: "header", label: "Elementos"},
  {type: "circle", color: "#f44336", label: hubSeleccionado === 0 ? "Hub #1 (óptimo)" : "Hub Seleccionado"},
  {type: "circle", color: "#ff9800", label: hubSeleccionado === 0 ? "Hubs alternos" : "—"},
  {type: "circle", color: "#90caf9", label: "Establecimientos Top 400"},
  {type: "square", color: "rgba(255,152,0,0.2)", label: "Radio 30 min (20 km)"}
].filter(item => item.label !== "—"), {
  position: "bottomright",
  title: "Leyenda"
});
```

---

## Comparativa de los Top 3 Hubs

```js
const top3 = top10hubs.slice(0, 3);

display(html`
  <div class="grid grid-cols-3" style="gap: 1rem; margin: 2rem 0;">
    ${top3.map(hub => `
      <div class="card" style="background: linear-gradient(135deg, ${hub.ranking === 1 ? '#fff9c4' : '#f5f5f5'} 0%, white 100%); border: 2px solid ${hub.ranking === 1 ? '#f57f17' : '#e0e0e0'};">
        <div style="text-align: center; padding: 0.5rem 0;">
          <div style="font-size: 2.5rem; font-weight: 700; color: ${hub.ranking === 1 ? '#f57f17' : '#1565c0'};">#${hub.ranking}</div>
          <h4 style="margin: 0.5rem 0; font-size: 1.1rem;">${hub.nombre}</h4>
          ${hub.ranking === 1 ? '<div style="background: #f57f17; color: white; padding: 4px 12px; border-radius: 12px; display: inline-block; font-size: 0.8rem; font-weight: 600; margin-bottom: 1rem;">ÓPTIMO</div>' : ''}
        </div>
        <hr style="border: 0; border-top: 1px solid #e0e0e0; margin: 1rem 0;">
        <div style="font-size: 0.9rem;">
          <div style="margin: 8px 0;">
            <strong>Cobertura 30min:</strong><br>
            <span style="font-size: 1.3rem; color: #2e7d32;">${(hub.cobertura_30min * 100).toFixed(1)}%</span>
          </div>
          <div style="margin: 8px 0;">
            <strong>Tiempo Promedio:</strong> ${hub.tiempo_prom_min?.toFixed(1)} min
          </div>
          <div style="margin: 8px 0;">
            <strong>Score Logístico:</strong> ${hub.score_logistico?.toFixed(1)}/100
          </div>
          <div style="margin: 8px 0; color: #666; font-size: 0.85rem;">
            📍 ${hub.lat?.toFixed(4)}, ${hub.lon?.toFixed(4)}
          </div>
        </div>
      </div>
    `).join('')}
  </div>
`);
```

---

```js
display(implicationsCallout({
  title: "Implicaciones y Próximos Pasos",
  items: [
    `**Hub #1 es el óptimo bajo criterios de cobertura territorial:** ${(top10hubs[0].cobertura_30min * 100).toFixed(1)}% de establecimientos alcanzables en <30 min. Validar disponibilidad de inmuebles comerciales/industriales en esa zona.`,
    "**Trade-off cobertura vs. costo:** Los hubs #2 y #3 tienen cobertura ligeramente menor pero pueden estar en zonas de menor costo de renta. Evaluar ROI comparado.",
    "**Validación de campo crítica:** Estos análisis asumen velocidades promedio y acceso a red vial. Conducir pilotos de ruteo en horarios pico (8–10 AM, 6–8 PM) para validar tiempos reales.",
    "**Modelo de un solo hub vs. micro-hubs:** Con cobertura >75% desde hub óptimo, un solo CEDIS es suficiente para Hermosillo. Micro-hubs zonales solo justificables si se expande a ciudades satélite (Bahía de Kino, Carbó)."
  ]
}));
```

---

## Criterios de Evaluación para Selección Final

<div class="card">
  <h3>Checklist de Validación de Hubs</h3>
  <table style="width: 100%; border-collapse: collapse; font-size: 0.9rem;">
    <thead>
      <tr style="background: #f5f5f5; text-align: left;">
        <th style="padding: 10px; border: 1px solid #ddd;">Criterio</th>
        <th style="padding: 10px; border: 1px solid #ddd;">Importancia</th>
        <th style="padding: 10px; border: 1px solid #ddd;">Cómo Validar</th>
      </tr>
    </thead>
    <tbody>
      <tr style="border: 1px solid #ddd;">
        <td style="padding: 10px; font-weight: 600;">Cobertura Territorial</td>
        <td style="padding: 10px; text-align: center;"><span style="background: #c8e6c9; color: #2e7d32; padding: 4px 10px; border-radius: 12px; font-weight: 600;">CRÍTICA</span></td>
        <td style="padding: 10px;">Verificar que ≥75% de Top 400 estén en <30 min (ya validado en análisis)</td>
      </tr>
      <tr style="border: 1px solid #ddd;">
        <td style="padding: 10px; font-weight: 600;">Acceso a Vías Principales</td>
        <td style="padding: 10px; text-align: center;"><span style="background: #c8e6c9; color: #2e7d32; padding: 4px 10px; border-radius: 12px; font-weight: 600;">CRÍTICA</span></td>
        <td style="padding: 10px;">Proximidad a Blvd. Luis Encinas, Periférico, Carretera Internacional (< 2 km)</td>
      </tr>
      <tr style="border: 1px solid #ddd;">
        <td style="padding: 10px; font-weight: 600;">Costo de Renta/Compra</td>
        <td style="padding: 10px; text-align: center;"><span style="background: #fff9c4; color: #f57f17; padding: 4px 10px; border-radius: 12px; font-weight: 600;">ALTA</span></td>
        <td style="padding: 10px;">Consultar brokers locales, rango esperado: $8–15/m²/mes en zona industrial</td>
      </tr>
      <tr style="border: 1px solid #ddd;">
        <td style="padding: 10px; font-weight: 600;">Infraestructura (Muelle, Rampa)</td>
        <td style="padding: 10px; text-align: center;"><span style="background: #fff9c4; color: #f57f17; padding: 4px 10px; border-radius: 12px; font-weight: 600;">ALTA</span></td>
        <td style="padding: 10px;">Inspección física: altura de techo ≥4m, piso de concreto, espacio de maniobra</td>
      </tr>
      <tr style="border: 1px solid #ddd;">
        <td style="padding: 10px; font-weight: 600;">Restricciones de Tráfico Pesado</td>
        <td style="padding: 10px; text-align: center;"><span style="background: #ffccbc; color: #d84315; padding: 4px 10px; border-radius: 12px; font-weight: 600;">MEDIA</span></td>
        <td style="padding: 10px;">Validar con tránsito municipal: horarios permitidos, rutas autorizadas</td>
      </tr>
      <tr style="border: 1px solid #ddd;">
        <td style="padding: 10px; font-weight: 600;">Seguridad de la Zona</td>
        <td style="padding: 10px; text-align: center;"><span style="background: #ffccbc; color: #d84315; padding: 4px 10px; border-radius: 12px; font-weight: 600;">MEDIA</span></td>
        <td style="padding: 10px;">Consultar índices de robo/asalto en zona (policía municipal, vecinos)</td>
      </tr>
    </tbody>
  </table>
</div>

---

<div class="note" style="background: #fff3e0; border-left: 4px solid #ff9800; padding: 1rem; margin: 2rem 0;">
  <p style="margin: 0; font-weight: 600;">⚠️ Limitación del Análisis</p>
  <p style="margin: 0.5rem 0 0 0;">
    Este análisis de cobertura es **teórico** y asume condiciones ideales de tráfico. 
    Se recomienda **validación con GPS tracking** en pilotos reales de entrega desde las ubicaciones candidatas 
    durante 2–4 semanas antes de comprometer inversión en inmueble.
  </p>
</div>

---

<small style="color: #999;">
  **Ver también:** <a href="../logistica-sonora">6) Logística y Sonora</a> | <a href="../dashboard">7) Dashboard</a>
</small>
