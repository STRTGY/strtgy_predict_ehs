---
title: 6) Logística y Sonora
toc: true
---

```js
import {sectionHeader, decisionCallout, implicationsCallout, roiMetric} from "./components/brand.js";
import {kpi, formatNumber} from "./components/ui.js";

const top10hubs = await FileAttachment("data/top10_hubs.web.csv").csv({typed: true});
const top10logistica = await FileAttachment("data/top10_logistica.web.csv").csv({typed: true});
```

```js
display(sectionHeader({
  title: "Logística y Expansión a Sonora",
  subtitle: "Análisis de cobertura territorial, ubicación óptima de CEDIS y estrategia de expansión regional",
  certainty: "medium"
}));
```

```js
display(decisionCallout({
  title: "¿Qué decidir con este análisis?",
  items: [
    "Aprobar inversión en CEDIS en Hermosillo (ubicación específica del top 3) o diferir hasta validar demanda",
    "Definir si Hermosillo consolida antes de expandir, o si se ataca Sonora en paralelo con modelo de micro-hubs",
    "Evaluar viabilidad de distribución desde Hermosillo a ciudades secundarias (Cajeme, Nogales) vs. hubs regionales independientes",
    "Determinar el modelo operativo: flota propia, 3PL (third-party logistics), o híbrido"
  ]
}));
```

---

## 6.1. Estrategia Logística para Hermosillo

### Hub Único vs. Micro-Hubs

**Análisis de Cobertura:**

```js
const hubOptimo = top10hubs[0];

display(html`
  <div class="grid grid-cols-3" style="gap: 1.5rem;">
    ${[
      {label: "Cobertura 30 min", value: `${(hubOptimo.cobertura_30min * 100).toFixed(1)}%`, desc: "de Top 400 establecimientos"},
      {label: "Tiempo Promedio", value: `${hubOptimo.tiempo_prom_min.toFixed(1)} min`, desc: "desde hub óptimo a clientes"},
      {label: "Radio Efectivo", value: "~20 km", desc: "asumiendo 40 km/h promedio"}
    ].map(m => `
      <div style="background: linear-gradient(135deg, #e3f2fd 0%, white 100%); padding: 2rem; border-radius: 10px; text-align: center; border: 2px solid #1976d2;">
        <div style="font-size: 2.5rem; font-weight: 700; color: #1565c0; margin-bottom: 0.5rem;">${m.value}</div>
        <div style="font-weight: 600; margin-bottom: 0.25rem;">${m.label}</div>
        <div style="font-size: 0.875rem; color: #666;">${m.desc}</div>
      </div>
    `).join('')}
  </div>
`);
```

**Conclusión:**  
Con **${(hubOptimo.cobertura_30min * 100).toFixed(0)}% de cobertura** desde un solo hub, **no se justifica la inversión en micro-hubs zonales** en Hermosillo. El 25% restante son establecimientos periféricos de menor prioridad (deciles <6).

---

### Modelo de Distribución Recomendado

**Frecuencia de entrega:**
- **Retail (Tiendas, farmacias):** 2–3 veces por semana
- **HORECA (Restaurantes, hoteles):** 1–2 veces por semana (pedidos más grandes, menor frecuencia)
- **Institucional (Gimnasios, clínicas):** 1 vez por semana o quincenal

**Ventanas horarias:**
- Retail: 8:00 AM – 12:00 PM (evitar horas pico de venta)
- HORECA: 10:00 AM – 3:00 PM (antes del servicio de comida/cena)

**Capacidad de flota estimada:**
- 2–3 vehículos tipo panel (1.5 ton) para Hermosillo
- 1 vehículo adicional para expansión a zona metropolitana (Bahía de Kino, Carbó)

---

## 6.2. Expansión a Nivel Sonora

### Ciudades Prioritarias

```js
const ciudadesSonora = [
  {ciudad: "Hermosillo", pob: 936000, dist_hmo: 0, potencial: "ALTA", estrategia: "Hub principal (CEDIS)"},
  {ciudad: "Cajeme (Cd. Obregón)", pob: 436000, dist_hmo: 210, potencial: "ALTA", estrategia: "Distribución desde Hermosillo o micro-hub"},
  {ciudad: "Nogales", pob: 264000, dist_hmo: 280, potencial: "MEDIA", estrategia: "Distribución desde Hermosillo 1x/semana"},
  {ciudad: "Guaymas", pob: 149000, dist_hmo: 130, potencial: "MEDIA", estrategia: "Ruta desde Hermosillo"},
  {ciudad: "Navojoa", pob: 164000, dist_hmo: 300, potencial: "BAJA", estrategia: "Fase 2 (post-consolidación)"},
  {ciudad: "San Luis Río Colorado", pob: 205000, dist_hmo: 300, potencial: "BAJA", estrategia: "Fase 2"}
];

display(html`
  <div class="card">
    <h3>Priorización de Ciudades en Sonora</h3>
    <table style="width: 100%; border-collapse: collapse; font-size: 0.9rem;">
      <thead>
        <tr style="background: #f5f5f5; text-align: left;">
          <th style="padding: 10px; border: 1px solid #ddd;">Ciudad</th>
          <th style="padding: 10px; border: 1px solid #ddd; text-align: center;">Población</th>
          <th style="padding: 10px; border: 1px solid #ddd; text-align: center;">Distancia de HMO (km)</th>
          <th style="padding: 10px; border: 1px solid #ddd; text-align: center;">Potencial</th>
          <th style="padding: 10px; border: 1px solid #ddd;">Estrategia Logística</th>
        </tr>
      </thead>
      <tbody>
        ${ciudadesSonora.map(c => `
          <tr style="border: 1px solid #ddd; ${c.potencial === 'ALTA' ? 'background: #e8f5e9;' : ''}">
            <td style="padding: 10px; font-weight: 600;">${c.ciudad}</td>
            <td style="padding: 10px; text-align: center;">${formatNumber(c.pob)}</td>
            <td style="padding: 10px; text-align: center;">${c.dist_hmo === 0 ? '—' : formatNumber(c.dist_hmo)}</td>
            <td style="padding: 10px; text-align: center;">
              <span style="padding: 4px 10px; border-radius: 12px; font-weight: 600; background: ${
                c.potencial === 'ALTA' ? '#c8e6c9' : c.potencial === 'MEDIA' ? '#fff9c4' : '#ffccbc'
              }; color: ${
                c.potencial === 'ALTA' ? '#2e7d32' : c.potencial === 'MEDIA' ? '#f57f17' : '#d84315'
              };">${c.potencial}</span>
            </td>
            <td style="padding: 10px; font-size: 0.85rem; color: #666;">${c.estrategia}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
    <p style="margin-top: 1rem; font-size: 0.85rem; color: #999; font-style: italic;">
      *Potencial estimado por tamaño de población, perfil económico y competitividad del mercado local.
    </p>
  </div>
`);
```

---

### Escenarios de Expansión

#### Escenario 1: Hub Único en Hermosillo (Conservador)

**Descripción:**  
Toda la distribución de Sonora se maneja desde CEDIS en Hermosillo, con rutas regionales 1–2 veces por semana a ciudades secundarias.

**Ventajas:**
- Menor inversión inicial (1 CEDIS)
- Mayor control operativo
- Economías de escala en inventario

**Desventajas:**
- Tiempos de entrega largos a ciudades lejanas (Nogales: 3h, Cajeme: 2.5h)
- Mayor costo de combustible y depreciación de flota
- Menor flexibilidad para pedidos urgentes

**Viabilidad:** ✅ Recomendado para **Fase 1 (Año 1)**

---

#### Escenario 2: Hub Hermosillo + Micro-Hub en Cajeme (Agresivo)

**Descripción:**  
CEDIS principal en Hermosillo + mini-almacén en Ciudad Obregón para servir el sur de Sonora (Cajeme, Guaymas, Navojoa).

**Ventajas:**
- Cobertura más rápida del sur de Sonora (2da ciudad más grande del estado)
- Potencial de alianzas con distribuidores locales en Cajeme

**Desventajas:**
- Duplicación de costos fijos (renta, personal) en 2 ubicaciones
- Complejidad de gestión de inventario multi-ubicación
- Requiere volumen significativo para justificar ROI

**Viabilidad:** ⚠️ Considerar solo si **ventas en Hermosillo superan $2M MXN/mes sostenidos** (indicador de demanda regional robusta)

---

#### Escenario 3: Modelo Híbrido con 3PL (Pragmático)

**Descripción:**  
CEDIS propio en Hermosillo + subcontratación de distribución regional a operador logístico local (3PL) con flota establecida.

**Ventajas:**
- Cero inversión en micro-hubs
- Flexibilidad para escalar sin comprometer capital
- 3PL asume riesgo operativo de rutas regionales

**Desventajas:**
- Menor margen por comisión de 3PL (típicamente 15–25%)
- Menor control de calidad de servicio
- Dependencia de proveedor externo

**Viabilidad:** ✅ Recomendado para **rutas esporádicas** (Nogales, Navojoa) mientras se valida demanda

---

## 6.3. Análisis de Costos Logísticos

### Estructura de Costos Estimada (Mensual, Hermosillo)

```js
const costosLogistica = [
  {concepto: "Renta de CEDIS (300 m²)", costo: 45000, tipo: "Fijo"},
  {concepto: "Personal (2 choferes + 1 coordinador)", costo: 35000, tipo: "Fijo"},
  {concepto: "Flota (2 vehículos, depreciación + seguro)", costo: 25000, tipo: "Fijo"},
  {concepto: "Combustible (promedio 3,000 km/mes @ $24/L, rend. 8 km/L)", costo: 9000, tipo: "Variable"},
  {concepto: "Mantenimiento de flota", costo: 8000, tipo: "Variable"},
  {concepto: "Sistemas (GPS, CRM logístico)", costo: 5000, tipo: "Fijo"},
  {concepto: "Contingencias (10%)", costo: 12700, tipo: "Variable"}
];

const costoFijoTotal = costosLogistica.filter(c => c.tipo === "Fijo").reduce((sum, c) => sum + c.costo, 0);
const costoVariableTotal = costosLogistica.filter(c => c.tipo === "Variable").reduce((sum, c) => sum + c.costo, 0);
const costoTotal = costoFijoTotal + costoVariableTotal;

display(html`
  <div class="card">
    <h3>Estructura de Costos Logísticos (Hermosillo, Mensual)</h3>
    <table style="width: 100%; border-collapse: collapse; font-size: 0.9rem; margin-bottom: 1rem;">
      <thead>
        <tr style="background: #f5f5f5; text-align: left;">
          <th style="padding: 10px; border: 1px solid #ddd;">Concepto</th>
          <th style="padding: 10px; border: 1px solid #ddd; text-align: right;">Costo (MXN/mes)</th>
          <th style="padding: 10px; border: 1px solid #ddd; text-align: center;">Tipo</th>
        </tr>
      </thead>
      <tbody>
        ${costosLogistica.map(c => `
          <tr style="border: 1px solid #ddd;">
            <td style="padding: 10px;">${c.concepto}</td>
            <td style="padding: 10px; text-align: right; font-weight: 600;">$${formatNumber(c.costo)}</td>
            <td style="padding: 10px; text-align: center;">
              <span style="padding: 3px 8px; border-radius: 10px; font-size: 0.8rem; background: ${c.tipo === 'Fijo' ? '#e3f2fd' : '#fff3e0'}; color: ${c.tipo === 'Fijo' ? '#1565c0' : '#e65100'};">${c.tipo}</span>
            </td>
          </tr>
        `).join('')}
        <tr style="background: #1565c0; color: white; font-weight: 700;">
          <td style="padding: 10px;">TOTAL MENSUAL</td>
          <td style="padding: 10px; text-align: right; font-size: 1.1rem;">$${formatNumber(costoTotal)}</td>
          <td style="padding: 10px; text-align: center;">—</td>
        </tr>
      </tbody>
    </table>
    <div class="grid grid-cols-3" style="gap: 1rem;">
      <div style="background: #e3f2fd; padding: 1rem; border-radius: 6px; text-align: center;">
        <div style="font-size: 1.5rem; font-weight: 700; color: #1565c0;">$${formatNumber(costoFijoTotal)}</div>
        <div style="font-size: 0.9rem; color: #666;">Costos Fijos</div>
      </div>
      <div style="background: #fff3e0; padding: 1rem; border-radius: 6px; text-align: center;">
        <div style="font-size: 1.5rem; font-weight: 700; color: #e65100;">$${formatNumber(costoVariableTotal)}</div>
        <div style="font-size: 0.9rem; color: #666;">Costos Variables</div>
      </div>
      <div style="background: #e8f5e9; padding: 1rem; border-radius: 6px; text-align: center;">
        <div style="font-size: 1.5rem; font-weight: 700; color: #2e7d32;">$${formatNumber(costoTotal * 12)}</div>
        <div style="font-size: 0.9rem; color: #666;">Costo Anual</div>
      </div>
    </div>
  </div>
`);
```

---

### ROI Logístico

**Punto de equilibrio:**  
Con costo logístico de **$${formatNumber(costoTotal)}/mes**, se requiere:

- **Venta mínima:** $${formatNumber(Math.round(costoTotal / 0.15))}/mes (asumiendo 15% de margen neto)
- **# de clientes activos:** ~${Math.round(costoTotal / 0.15 / 4000)} clientes con ticket promedio de $4,000 y 1.5 pedidos/mes

**Proyección (Año 1):**  
Si se convierten **200 clientes** del Top 400 con los supuestos del modelo de scoring, la venta proyectada es $${formatNumber(Math.round(2400000))} MXN/mes, lo que **cubre 2.9x el costo logístico** y deja margen operativo saludable.

---

```js
display(implicationsCallout({
  title: "Decisiones Clave de Logística",
  items: [
    "**Hub único en Hermosillo es suficiente para Fase 1:** Cobertura >75% con un solo CEDIS. Diferir micro-hubs hasta validar demanda regional.",
    "**Modelo híbrido para expansión:** Usar 3PL para rutas esporádicas a Nogales/Navojoa mientras se valida volumen. Si demanda sostiene >$500K/mes en Cajeme, considerar micro-hub.",
    "**Inversión inicial controlada:** CEDIS + 2 vehículos requiere ~$300K MXN (setup) + $140K/mes (operación). Payback en <8 meses si se alcanza 60% del potencial proyectado.",
    "**Flota propia vs. outsourcing:** Flota propia recomendada para Hermosillo (control + menor costo/km). 3PL para rutas regionales largas (>200 km) donde frecuencia es baja."
  ]
}));
```

---

## Próximos Pasos

- **[Dashboard Interactivo](./dashboard)** — Filtrar establecimientos por zona y exportar listas para ruteo
- **[Hubs Logísticos](./mapas/hubs)** — Explorar ubicaciones candidatas con análisis de cobertura detallado

---

<small style="color: #999;">
  **Sección:** 6 de 7 | **Anterior:** <a href="./scoring-priorizacion">5) Scoring y Priorización</a> | **Siguiente:** <a href="./dashboard">7) Dashboard</a>
</small>
