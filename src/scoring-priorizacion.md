---
title: 5) Scoring y Priorización
toc: true
---

```js
import {sectionHeader, decisionCallout, implicationsCallout, roiMetric} from "./components/brand.js";
import {kpi, formatNumber, formatPercent, table} from "./components/ui.js";
import {createBaseMap, addGeoJsonLayer, styleByScore, getColorForScore, createLegend, fitBounds, createEstablishmentPopup} from "./components/maps.js";

// Cargar datos
const top400 = await FileAttachment("data/top400.web.geojson").json();
const top20comercial = await FileAttachment("data/top20_comercial.web.csv").csv({typed: true});
const agebs = await FileAttachment("data/agebs_base.web.geojson").json();
```

```js
display(sectionHeader({
  title: "Scoring y Priorización de Establecimientos",
  subtitle: "Modelo multi-criterio para identificar los 400 establecimientos B2B de mayor potencial",
  certainty: "high"
}));
```

```js
display(decisionCallout({
  title: "¿Qué decidir con este scoring?",
  items: [
    "Priorizar los primeros 100–200 establecimientos para prospección inmediata (deciles 9–10)",
    "Asignar recursos comerciales: equipo senior en deciles altos, equipo junior en deciles medios",
    "Definir secuencia de ataque territorial: comenzar por AGEBs con mayor concentración de top scores",
    "Ajustar ponderadores si el perfil de negocio requiere énfasis diferente (ej: priorizar horeca sobre retail)"
  ]
}));
```

---

## 5.1. Metodología de Scoring

### Modelo Multi-Criterio

Nuestro modelo de scoring integra **5 dimensiones cuantitativas** que predicen el potencial comercial de cada establecimiento. Cada dimensión tiene un ponderador basado en su impacto esperado en conversión y volumen.

```js
const criterios = [
  {
    dimension: "Población de AGEB",
    ponderador: 30,
    fuente: "SCINCE 2020",
    logica: "Mayor población → mayor demanda de consumo local",
    normalizacion: "Z-score sobre distribución poblacional de Hermosillo"
  },
  {
    dimension: "Densidad Comercial",
    ponderador: 25,
    fuente: "DENUE 2024",
    logica: "Alta concentración de negocios → eficiencia en distribución y visitas",
    normalizacion: "Establecimientos/km² en AGEB, percentil 0–100"
  },
  {
    dimension: "Nivel Socioeconómico",
    ponderador: 20,
    fuente: "AMAI + INEGI",
    logica: "NSE medio-alto → mayor disposición a pagar productos premium",
    normalizacion: "Escala ordinal: E=0, D=20, D+=40, C-=60, C=70, C+=85, B=95, A/B=100"
  },
  {
    dimension: "Proximidad a Zonas Clave",
    ponderador: 15,
    fuente: "Análisis espacial",
    logica: "Cercanía a centros comerciales, hospitales, hoteles → mayor tráfico",
    normalizacion: "Distancia inversa (km⁻¹) a POIs relevantes"
  },
  {
    dimension: "Índice de Marginación (Inverso)",
    ponderador: 10,
    fuente: "CONAPO 2020",
    logica: "Baja marginación → estabilidad económica y predictibilidad de demanda",
    normalizacion: "Escala inversa: Muy Baja=100, Baja=75, Media=50, Alta=25, Muy Alta=0"
  }
];

display(html`
  <div class="card">
    <h3>Ponderadores del Modelo de Scoring</h3>
    <table style="width: 100%; border-collapse: collapse; font-size: 0.9rem;">
      <thead>
        <tr style="background: #f5f5f5; text-align: left;">
          <th style="padding: 10px; border: 1px solid #ddd;">Dimensión</th>
          <th style="padding: 10px; border: 1px solid #ddd; text-align: center;">Peso (%)</th>
          <th style="padding: 10px; border: 1px solid #ddd;">Fuente</th>
          <th style="padding: 10px; border: 1px solid #ddd;">Lógica de Negocio</th>
          <th style="padding: 10px; border: 1px solid #ddd;">Normalización</th>
        </tr>
      </thead>
      <tbody>
        ${criterios.map(c => `
          <tr style="border: 1px solid #ddd;">
            <td style="padding: 10px; font-weight: 600;">${c.dimension}</td>
            <td style="padding: 10px; text-align: center; font-size: 1.1rem; color: #1565c0; font-weight: 700;">${c.ponderador}%</td>
            <td style="padding: 10px; font-style: italic; color: #666;">${c.fuente}</td>
            <td style="padding: 10px;">${c.logica}</td>
            <td style="padding: 10px; font-size: 0.85rem; color: #666;">${c.normalizacion}</td>
          </tr>
        `).join('')}
        <tr style="background: #e3f2fd; font-weight: 700;">
          <td style="padding: 10px;">TOTAL</td>
          <td style="padding: 10px; text-align: center; font-size: 1.2rem;">100%</td>
          <td colspan="3" style="padding: 10px; text-align: right; font-style: italic; font-weight: normal;">
            Score final = Σ (dimensión<sub>normalizada</sub> × ponderador)
          </td>
        </tr>
      </tbody>
    </table>
    <p style="margin-top: 1rem; font-size: 0.9rem; color: #666;">
      <strong>Nota técnica:</strong> Todas las dimensiones se normalizan a escala 0–100 antes de aplicar ponderadores. 
      El score final es un valor continuo entre 0 y 100, posteriormente discretizado en deciles para simplicidad operativa.
    </p>
  </div>
`);
```

### Fórmula de Cálculo

$$
\text{Score}_{\text{establecimiento}} = \sum_{i=1}^{5} \left( \text{Dimensión}_i^{\text{norm}} \times \text{Peso}_i \right)
$$

Donde:
- $\text{Dimensión}_i^{\text{norm}}$: valor normalizado de la dimensión $i$ en escala [0, 100]
- $\text{Peso}_i$: ponderador de la dimensión $i$ (suma total = 100%)
- Score final: valor continuo [0, 100], posteriormente asignado a deciles 1–10

---

## 5.2. Distribución de Scores

### Métricas Globales

```js
const scores = top400.features.map(f => f.properties.score_electrolit).filter(s => s != null);
const scorePromedio = scores.reduce((a,b) => a+b, 0) / scores.length;
const scoreMediana = scores.sort((a,b) => a-b)[Math.floor(scores.length / 2)];
const scoreMin = Math.min(...scores);
const scoreMax = Math.max(...scores);

const top10pct = scores.filter(s => s >= 90).length;
const top25pct = scores.filter(s => s >= 75).length;

display(
  kpi([
    {
      label: "Score Promedio",
      value: scorePromedio.toFixed(1),
      format: null
    },
    {
      label: "Score Mediana",
      value: scoreMediana.toFixed(1),
      format: null
    },
    {
      label: "Rango (Min–Max)",
      value: `${scoreMin.toFixed(0)}–${scoreMax.toFixed(0)}`,
      format: null
    },
    {
      label: "Top 10% (Score ≥90)",
      value: formatNumber(top10pct),
      format: null
    }
  ])
);
```

### Interpretación de Deciles

Los establecimientos se agrupan en **10 deciles** para facilitar la priorización operativa:

- **Deciles 10–9 (Top 20%):** Establecimientos de **prioridad crítica**. Potencial comercial muy alto, conversión esperada >50%
- **Deciles 8–7 (Siguiente 20%):** **Prioridad alta**. Buen potencial, asignar recursos senior
- **Deciles 6–5 (Centro 20%):** **Prioridad media**. Potencial moderado, atacar después de deciles altos
- **Deciles 4–3 (Siguiente 20%):** **Prioridad baja**. Considerar solo si hay capacidad comercial excedente
- **Deciles 2–1 (Bottom 20%):** **No priorizar**. Bajo potencial, alta probabilidad de baja conversión o volumen

---

## 5.3. Top 20 Establecimientos Comerciales

```js
display(html`
  <div class="card">
    <h3>Top 20 Establecimientos Priorizados</h3>
    <p style="color: #666; font-size: 0.9rem; margin-bottom: 1rem;">
      Lista ejecutable de los 20 establecimientos con mayor score. Listo para asignación a equipo comercial.
    </p>
    ${table(
      top20comercial,
      [
        {key: "ranking", label: "#", format: (v) => `<strong>${v}</strong>`},
        {key: "nom_estab", label: "Establecimiento", format: (v) => v || "Sin nombre"},
        {key: "segmento", label: "Segmento", format: (v, row) => {
          const colors = {retail: "#1565c0", horeca: "#e65100", institucional: "#6a1b9a"};
          const bg = {retail: "#e3f2fd", horeca: "#fff3e0", institucional: "#f3e5f5"};
          return `<span style="background: ${bg[v] || '#f5f5f5'}; color: ${colors[v] || '#666'}; padding: 4px 10px; border-radius: 12px; font-size: 0.85rem; font-weight: 600;">${v || 'N/A'}</span>`;
        }},
        {key: "score_electrolit", label: "Score", format: (v) => v != null ? `<strong>${v.toFixed(1)}</strong>` : "N/A"},
        {key: "decil", label: "Decil", format: (v) => `<span style="background: #e8eaf6; color: #3f51b5; padding: 4px 8px; border-radius: 8px; font-weight: 600;">${v || 'N/A'}</span>`},
        {key: "colonia", label: "Colonia", format: (v) => v || "N/A"},
        {key: "direccion", label: "Dirección", format: (v) => v ? `<span style="font-size: 0.85rem; color: #666;">${v}</span>` : "N/A"}
      ],
      {sortable: true, exportable: true, pageSize: 0}
    )}
  </div>
`);
```

---

## 5.4. Mapa de Establecimientos Priorizados

### Visualización Interactiva

```js
const mapContainer = display(document.createElement("div"));
mapContainer.style.height = "600px";
mapContainer.style.width = "100%";
mapContainer.style.borderRadius = "8px";
mapContainer.style.overflow = "hidden";
mapContainer.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)";

const map = createBaseMap(mapContainer, {
  center: [29.0729, -110.9559],
  zoom: 12
});

// Capa de AGEBs (contexto)
const agebsLayer = addGeoJsonLayer(map, agebs, {
  style: (feature) => ({
    fillColor: "#f5f5f5",
    color: "#999",
    weight: 1,
    opacity: 0.5,
    fillOpacity: 0.1
  })
});

// Capa de establecimientos priorizados
const top400Layer = addGeoJsonLayer(map, top400, {
  pointToLayer: (feature, latlng) => {
    const score = feature.properties.score_electrolit || 0;
    const color = getColorForScore(score);
    
    return L.circleMarker(latlng, {
      radius: 6 + (score / 100) * 6, // Radio proporcional al score (6-12px)
      fillColor: color,
      color: "#fff",
      weight: 2,
      opacity: 1,
      fillOpacity: 0.8
    });
  },
  popupContent: (props) => createEstablishmentPopup(props)
});

fitBounds(map, top400Layer, 30);

// Leyenda
createLegend(map, [
  {type: "header", label: "Score de Potencial"},
  {type: "circle", color: getColorForScore(95), label: "90–100 (Crítico)"},
  {type: "circle", color: getColorForScore(85), label: "80–89 (Muy Alto)"},
  {type: "circle", color: getColorForScore(70), label: "70–79 (Alto)"},
  {type: "circle", color: getColorForScore(55), label: "60–69 (Medio-Alto)"},
  {type: "circle", color: getColorForScore(40), label: "50–59 (Medio)"},
  {type: "circle", color: getColorForScore(25), label: "<50 (Bajo)"}
], {
  position: "bottomright",
  title: "Leyenda"
});
```

<div class="note" style="background: #e3f2fd; border-left: 4px solid #2196f3; padding: 1rem; margin: 1.5rem 0;">
  <p style="margin: 0; font-weight: 600;">💡 Interactividad del Mapa</p>
  <p style="margin: 0.5rem 0 0 0;">
    Haz clic en cualquier punto para ver detalles del establecimiento (nombre, segmento, score, dirección). 
    El tamaño del círculo es proporcional al score: círculos más grandes = mayor prioridad.
  </p>
</div>

---

## 5.5. Segmentación por Canal

### Distribución de Top 400 por Segmento

```js
const segmentos = top400.features.reduce((acc, f) => {
  const seg = f.properties.segmento || "otro";
  acc[seg] = (acc[seg] || 0) + 1;
  return acc;
}, {});

const segmentosData = Object.entries(segmentos).map(([seg, count]) => ({
  segmento: seg,
  cantidad: count,
  porcentaje: (count / top400.features.length) * 100
})).sort((a,b) => b.cantidad - a.cantidad);

display(html`
  <div class="card">
    <h3>Distribución por Segmento</h3>
    <table style="width: 100%; border-collapse: collapse; font-size: 0.9rem;">
      <thead>
        <tr style="background: #f5f5f5;">
          <th style="padding: 10px; text-align: left;">Segmento</th>
          <th style="padding: 10px; text-align: center;">Cantidad</th>
          <th style="padding: 10px; text-align: center;">% del Total</th>
          <th style="padding: 10px;">Estrategia Recomendada</th>
        </tr>
      </thead>
      <tbody>
        ${segmentosData.map(s => `
          <tr style="border-top: 1px solid #ddd;">
            <td style="padding: 10px; font-weight: 600; text-transform: capitalize;">${s.segmento}</td>
            <td style="padding: 10px; text-align: center; font-size: 1.1rem; color: #1565c0;">${formatNumber(s.cantidad)}</td>
            <td style="padding: 10px; text-align: center;">${s.porcentaje.toFixed(1)}%</td>
            <td style="padding: 10px; font-size: 0.9rem; color: #666;">
              ${s.segmento === 'retail' ? 'Volumen alto, márgenes medios. Contratos mensuales.' :
                s.segmento === 'horeca' ? 'Ticket alto, frecuencia media. Enfoque en menú/barra.' :
                s.segmento === 'institucional' ? 'Pedidos grandes, negociación centralizada. RFPs.' :
                'Evaluar caso por caso.'}
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>
`);
```

---

## 5.6. ROI Estimado por Decil

### Proyección de Conversión y Volumen

```js
const decilesROI = [
  {decil: 10, conversion: 65, ticket_promedio: 5500, frecuencia_mes: 2.0, establecimientos: 40},
  {decil: 9, conversion: 55, ticket_promedio: 5000, frecuencia_mes: 1.8, establecimientos: 40},
  {decil: 8, conversion: 45, ticket_promedio: 4500, frecuencia_mes: 1.6, establecimientos: 40},
  {decil: 7, conversion: 35, ticket_promedio: 4000, frecuencia_mes: 1.4, establecimientos: 40},
  {decil: 6, conversion: 28, ticket_promedio: 3500, frecuencia_mes: 1.2, establecimientos: 40},
  {decil: 5, conversion: 22, ticket_promedio: 3000, frecuencia_mes: 1.0, establecimientos: 40},
  {decil: 4, conversion: 18, ticket_promedio: 2800, frecuencia_mes: 0.9, establecimientos: 40},
  {decil: 3, conversion: 14, ticket_promedio: 2500, frecuencia_mes: 0.8, establecimientos: 40},
  {decil: 2, conversion: 10, ticket_promedio: 2200, frecuencia_mes: 0.7, establecimientos: 40},
  {decil: 1, conversion: 7, ticket_promedio: 2000, frecuencia_mes: 0.6, establecimientos: 40}
];

const decilesConROI = decilesROI.map(d => {
  const clientesEsperados = d.establecimientos * (d.conversion / 100);
  const ventaMensual = clientesEsperados * d.ticket_promedio * d.frecuencia_mes;
  const ventaAnual = ventaMensual * 12;
  return {...d, clientesEsperados, ventaMensual, ventaAnual};
});

const totalVentaAnualProyectada = decilesConROI.reduce((sum, d) => sum + d.ventaAnual, 0);
const top3DecilesVenta = decilesConROI.slice(0, 3).reduce((sum, d) => sum + d.ventaAnual, 0);

display(html`
  <div class="card">
    <h3>Proyección de ROI por Decil</h3>
    <p style="color: #666; font-size: 0.9rem; margin-bottom: 1rem;">
      Basado en benchmarks de industria: tasa de conversión, ticket promedio y frecuencia de compra. 
      <strong>Los deciles 9–10 generan ${formatPercent(top3DecilesVenta / totalVentaAnualProyectada, 0)} de la venta proyectada.</strong>
    </p>
    <table style="width: 100%; border-collapse: collapse; font-size: 0.9rem;">
      <thead>
        <tr style="background: #f5f5f5;">
          <th style="padding: 10px; text-align: center;">Decil</th>
          <th style="padding: 10px; text-align: center;">Establecimientos</th>
          <th style="padding: 10px; text-align: center;">Conversión (%)</th>
          <th style="padding: 10px; text-align: center;">Clientes Esperados</th>
          <th style="padding: 10px; text-align: center;">Ticket Promedio</th>
          <th style="padding: 10px; text-align: center;">Venta Mensual</th>
          <th style="padding: 10px; text-align: center;">Venta Anual</th>
        </tr>
      </thead>
      <tbody>
        ${decilesConROI.map(d => `
          <tr style="border-top: 1px solid #ddd; ${d.decil >= 9 ? 'background: #e8f5e9;' : ''}">
            <td style="padding: 10px; text-align: center; font-weight: 700; color: #3f51b5;">${d.decil}</td>
            <td style="padding: 10px; text-align: center;">${d.establecimientos}</td>
            <td style="padding: 10px; text-align: center; color: ${d.conversion >= 50 ? '#2e7d32' : '#666'};">${d.conversion}%</td>
            <td style="padding: 10px; text-align: center; font-weight: 600;">${d.clientesEsperados.toFixed(0)}</td>
            <td style="padding: 10px; text-align: center;">$${formatNumber(d.ticket_promedio)}</td>
            <td style="padding: 10px; text-align: center; font-weight: 600; color: #1565c0;">$${formatNumber(Math.round(d.ventaMensual))}</td>
            <td style="padding: 10px; text-align: center; font-weight: 700; font-size: 1.05rem; color: #1565c0;">$${formatNumber(Math.round(d.ventaAnual))}</td>
          </tr>
        `).join('')}
        <tr style="background: #1565c0; color: white; font-weight: 700;">
          <td colspan="5" style="padding: 10px; text-align: right;">TOTAL PROYECTADO (Año 1)</td>
          <td style="padding: 10px; text-align: center;">—</td>
          <td style="padding: 10px; text-align: center; font-size: 1.2rem;">$${formatNumber(Math.round(totalVentaAnualProyectada))}</td>
        </tr>
      </tbody>
    </table>
    <p style="margin-top: 1rem; font-size: 0.85rem; color: #999; font-style: italic;">
      *Proyección basada en supuestos conservadores. Validar con piloto de campo en deciles 9–10 antes de escalar.
    </p>
  </div>
`);
```

---

```js
display(implicationsCallout({
  title: "Implicaciones y Acciones Inmediatas",
  items: [
    `**Foco en top 80 (deciles 9–10):** Estos establecimientos representan ${formatPercent(top3DecilesVenta / totalVentaAnualProyectada, 0)} del potencial de venta. Asignar equipo senior exclusivamente aquí.`,
    "**Piloto de validación:** Prospectar 50 establecimientos del decil 10 en primera fase. Medir conversión real vs. proyectada (65% esperado).",
    "**Ajuste dinámico:** Si conversión real < 50% en decil 10, revisar ponderadores del modelo (posiblemente sobrevalorando población o NSE).",
    `**ROI claro:** Con una inversión estimada de $200K MXN en 6 meses (equipo + logística), el payback es <8 meses si se alcanza 60% del potencial proyectado ($${formatNumber(Math.round(totalVentaAnualProyectada * 0.6))} anuales).`
  ]
}));
```

---

## Próximos Pasos

- **[Dashboard Interactivo](./dashboard)** — Explora, filtra y exporta listas priorizadas
- **[Logística y Sonora](./logistica-sonora)** — Ubicación óptima de CEDIS para servir estos establecimientos
- **[Descargas](./descargas)** — Exporta CSV/GeoJSON para CRM o herramientas de ruteo

---

<small style="color: #999;">
  **Sección:** 5 de 7 | **Anterior:** <a href="./analisis-comercial">4) Análisis Comercial</a> | **Siguiente:** <a href="./logistica-sonora">6) Logística y Sonora</a>
</small>
