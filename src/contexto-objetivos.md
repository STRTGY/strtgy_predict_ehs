---
title: 1) Contexto y Objetivos
toc: true
---

```js
import {sectionHeader, decisionCallout, implicationsCallout, certaintyBadge} from "./components/brand.js";
import {kpi, formatNumber} from "./components/ui.js";
```

```js
display(sectionHeader({
  title: "Contexto y Objetivos del Proyecto",
  subtitle: "Marco estratégico para la expansión B2B de Electrolit en Hermosillo y Sonora",
  certainty: "high"
}));
```

```js
display(decisionCallout({
  title: "¿Qué decidir en esta sección?",
  items: [
    "Validar alineación entre los objetivos del proyecto y las prioridades estratégicas de Electrolit",
    "Confirmar los supuestos de negocio que sustentan el modelo de priorización",
    "Identificar restricciones operativas que puedan afectar la implementación de recomendaciones"
  ]
}));
```

---

## 1.1. El Problema de Negocio

### Situación Actual

Electrolit ha consolidado su posición como líder en bebidas hidratantes en México, con fuerte presencia en canal retail moderno (cadenas nacionales y regionales). Sin embargo, **el canal B2B tradicional representa una oportunidad significativa de crecimiento** en mercados secundarios y terciarios donde la distribución organizada es limitada.

**Hermosillo** (población metropolitana: ~900,000 habitantes) y **Sonora** (población estatal: ~3 millones) presentan características atractivas:

- **Clima:** Temperaturas extremas (35–45°C en verano) aumentan demanda de hidratación
- **Perfil económico:** Economía industrial y agrícola con poder adquisitivo medio-alto
- **Infraestructura:** Red carretera bien desarrollada facilita distribución regional
- **Competencia:** Mercado de bebidas fragmentado con oportunidades de consolidación

### El Desafío Operativo

Sin embargo, la expansión enfrenta **complejidad de decisión**:

1. **Más de 10,000 establecimientos potenciales** en Hermosillo (tiendas de abarrotes, restaurantes, hoteles, gimnasios, farmacias, etc.)
2. **Recursos comerciales limitados**: equipo de ventas reducido requiere priorización quirúrgica
3. **Costos logísticos sensibles**: distribución capilar en territorio extenso afecta márgenes
4. **Información dispersa**: datos de mercado fragmentados en múltiples fuentes (INEGI, directorios, bases propias)

**¿Cómo identificar los 400–600 establecimientos con mayor potencial de conversión y volumen?**  
**¿Dónde ubicar infraestructura logística (CEDIS) para minimizar costos de distribución?**

---

## 1.2. Objetivos SMART del Proyecto

### Objetivo General

**Construir un sistema de inteligencia geoestadística que traduzca datos territoriales complejos en decisiones comerciales ejecutables, priorizando establecimientos B2B y ubicaciones logísticas con criterio cuantitativo y transparente.**

### Objetivos Específicos

```js
const objetivos = [
  {
    id: "OBJ-01",
    objetivo: "Base de Datos Priorizada",
    meta: "Generar listado de 400–600 establecimientos B2B georreferenciados con score multi-criterio",
    metrica: "# de establecimientos con score ≥ 60/100",
    entregable: "Archivo GeoJSON + CSV exportable con ranking",
    certeza: "high"
  },
  {
    id: "OBJ-02",
    objetivo: "Modelo de Scoring Transparente",
    meta: "Diseñar algoritmo de priorización basado en: densidad poblacional, perfil socioeconómico, densidad comercial, accesibilidad",
    metrica: "Correlación del score con conversión real (validación posterior)",
    entregable: "Documentación de ponderadores y lógica de scoring",
    certeza: "high"
  },
  {
    id: "OBJ-03",
    objetivo: "Ubicación Óptima de CEDIS",
    meta: "Identificar top 10 ubicaciones para centro de distribución que minimicen tiempo promedio de entrega",
    metrica: "Cobertura de ≥80% de establecimientos priorizados en <30 min",
    entregable: "Ranking de ubicaciones con análisis de cobertura",
    certeza: "medium"
  },
  {
    id: "OBJ-04",
    objetivo: "Estrategia de Expansión Sonora",
    meta: "Evaluar viabilidad de cobertura regional (Cajeme, Nogales, Guaymas, Navojoa) desde Hermosillo",
    metrica: "ROI logístico comparado (hub único vs. hubs regionales)",
    entregable: "Análisis de escenarios con recomendación",
    certeza: "medium"
  },
  {
    id: "OBJ-05",
    objetivo: "Dashboard Interactivo",
    meta: "Desarrollar interfaz web para exploración de datos, filtrado por segmento/zona y exportación de listas",
    metrica: "Usabilidad validada con equipo comercial",
    entregable: "Sitio Observable Framework desplegado",
    certeza: "high"
  }
];

const tableContainer = document.createElement("div");
tableContainer.style.overflowX = "auto";

const table = document.createElement("table");
table.style.width = "100%";
table.style.borderCollapse = "collapse";
table.style.fontSize = "0.9rem";

// Create header
const thead = document.createElement("thead");
const headerRow = document.createElement("tr");
headerRow.style.background = "#f5f5f5";
headerRow.style.textAlign = "left";

["ID", "Objetivo", "Meta", "Métrica de Éxito", "Entregable", "Certeza"].forEach(headerText => {
  const th = document.createElement("th");
  th.style.padding = "10px";
  th.style.border = "1px solid #ddd";
  th.textContent = headerText;
  headerRow.appendChild(th);
});

thead.appendChild(headerRow);
table.appendChild(thead);

// Create body
const tbody = document.createElement("tbody");

objetivos.forEach(obj => {
  const row = document.createElement("tr");
  row.style.border = "1px solid #ddd";
  
  // ID cell
  const idCell = document.createElement("td");
  idCell.style.padding = "10px";
  idCell.style.fontWeight = "600";
  idCell.style.color = "#1565c0";
  idCell.textContent = obj.id;
  row.appendChild(idCell);
  
  // Objetivo cell
  const objCell = document.createElement("td");
  objCell.style.padding = "10px";
  objCell.style.fontWeight = "600";
  objCell.textContent = obj.objetivo;
  row.appendChild(objCell);
  
  // Meta cell
  const metaCell = document.createElement("td");
  metaCell.style.padding = "10px";
  metaCell.textContent = obj.meta;
  row.appendChild(metaCell);
  
  // Métrica cell
  const metricaCell = document.createElement("td");
  metricaCell.style.padding = "10px";
  metricaCell.style.color = "#666";
  metricaCell.textContent = obj.metrica;
  row.appendChild(metricaCell);
  
  // Entregable cell
  const entregableCell = document.createElement("td");
  entregableCell.style.padding = "10px";
  entregableCell.style.fontStyle = "italic";
  entregableCell.textContent = obj.entregable;
  row.appendChild(entregableCell);
  
  // Certeza cell
  const certezaCell = document.createElement("td");
  certezaCell.style.padding = "10px";
  certezaCell.style.textAlign = "center";
  
  const certezaBadge = document.createElement("span");
  if (obj.certeza === 'high') {
    certezaBadge.style.background = "#c8e6c9";
    certezaBadge.style.color = "#2e7d32";
    certezaBadge.textContent = "Alta";
  } else {
    certezaBadge.style.background = "#fff9c4";
    certezaBadge.style.color = "#f57f17";
    certezaBadge.textContent = "Media";
  }
  certezaBadge.style.padding = "4px 8px";
  certezaBadge.style.borderRadius = "12px";
  certezaBadge.style.fontSize = "0.8rem";
  
  certezaCell.appendChild(certezaBadge);
  row.appendChild(certezaCell);
  
  tbody.appendChild(row);
});

table.appendChild(tbody);
tableContainer.appendChild(table);

display(tableContainer);
```

---

## 1.3. Hipótesis de Negocio

### Supuestos Críticos que Guían el Modelo

Nuestro enfoque se basa en hipótesis validables que conectan variables geoestadísticas con potencial comercial:

#### H1: Densidad Poblacional → Demanda de Consumo

**Hipótesis:** AGEBs con mayor población concentrada generan mayor demanda de bebidas hidratantes en establecimientos locales.

**Validación:** Análisis de correlación entre población SCINCE 2020 y ventas históricas en mercados similares (Guadalajara, Monterrey).

**Impacto en el modelo:** Ponderador de 30% en score de establecimientos ubicados en AGEBs densas.

---

#### H2: Nivel Socioeconómico → Capacidad de Compra

**Hipótesis:** Zonas de NSE medio-alto (C+, B, A/B) tienen mayor disposición a pagar precio premium por productos de valor agregado como Electrolit.

**Validación:** Electrolit se posiciona en segmento medio-alto vs. competencia genérica (Gatorade, Powerade, marcas blancas).

**Impacto en el modelo:** Ponderador de 20% favoreciendo AGEBs con NSE ≥ C.

---

#### H3: Densidad Comercial → Eficiencia de Distribución

**Hipótesis:** Zonas con alta concentración de establecimientos del segmento objetivo (retail/horeca) permiten mayor eficiencia en visitas comerciales y entregas.

**Validación:** Modelo de ruteo multi-drop optimiza tiempo cuando establecimientos están geográficamente agrupados.

**Impacto en el modelo:** Ponderador de 25% en score de AGEBs con ≥50 establecimientos/km².

---

#### H4: Accesibilidad Vial → Costos Logísticos

**Hipótesis:** Proximidad a vías primarias (carreteras federales, ejes viales principales) reduce tiempos de entrega y costos operativos.

**Validación:** Análisis de isócronas desde ubicaciones candidatas a CEDIS.

**Impacto en el modelo:** Criterio de ubicación de CEDIS con restricción de acceso a red vial principal.

---

#### H5: Marginación Inversa → Estabilidad de Demanda

**Hipótesis:** Zonas con menor índice de marginación (infraestructura, servicios, educación) presentan mayor estabilidad económica y previsibilidad de demanda.

**Validación:** Índice de marginación CONAPO correlacionado con variabilidad de ventas.

**Impacto en el modelo:** Ponderador de 10% favoreciendo AGEBs con marginación baja o muy baja.

---

## 1.4. Restricciones y Limitaciones

### Restricciones Operativas

- **Presupuesto limitado para CEDIS:** Inversión inicial en infraestructura logística debe justificarse con cobertura de ≥70% del mercado priorizado
- **Equipo comercial reducido:** 5–8 vendedores disponibles para prospección, requieren listas priorizadas para optimizar rutas
- **Frecuencia de entrega:** Modelo de distribución 2–3 veces por semana (no diario) en canal tradicional
- **Tamaño de pedido mínimo:** Establecimientos deben tener capacidad de compra ≥$2,000 MXN/pedido para rentabilidad

### Limitaciones de Datos

- **DENUE 2024:** Directorio INEGI actualizado pero con ~15% de registros desactualizados o cerrados (validación de campo requerida)
- **SCINCE 2020:** Datos demográficos del último censo (4 años de antigüedad); estimaciones de crecimiento poblacional aplicadas
- **Sin datos de ventas propias:** No hay histórico de Electrolit en Hermosillo para validación cuantitativa del modelo
- **Competencia:** Información limitada sobre presencia de competidores (Gatorade, Powerade) por establecimiento

### Supuestos de Riesgo

- **Tasa de conversión asumida:** 30–40% de establecimientos contactados se convierten en clientes activos (benchmark de industria)
- **Ticket promedio estimado:** $3,000–$5,000 MXN/pedido en canal tradicional (validar en piloto)
- **Frecuencia de recompra:** 1.5 pedidos/mes en promedio (varía por segmento: retail > horeca > institucional)

---

## 1.5. Definición de Éxito

### Criterios de Evaluación del Proyecto

**Éxito del Modelo de Scoring:**
- ✅ **Correlación ≥0.70** entre score y conversión real en piloto de 100 establecimientos
- ✅ **Tasa de contacto efectivo ≥80%** (establecimientos priorizados están activos y accesibles)
- ✅ **Tiempo de prospección reducido en ≥50%** vs. enfoque sin priorización

**Éxito de Ubicación de CEDIS:**
- ✅ **Cobertura ≥75%** de establecimientos top 400 en radio de 30 minutos
- ✅ **Ahorro logístico ≥20%** vs. ubicación no optimizada (costo/km recorrido)
- ✅ **Escalabilidad validada:** ubicación permite expansión a Sonora sin reubicación

**Éxito del Dashboard:**
- ✅ **Adopción por equipo comercial:** ≥4/5 vendedores usan la herramienta semanalmente
- ✅ **Exportaciones activas:** ≥10 descargas de listas priorizadas en primer mes
- ✅ **Feedback positivo:** NPS ≥8/10 de usuarios internos

---

```js
display(implicationsCallout({
  title: "Implicaciones Estratégicas",
  items: [
    "Este proyecto NO es solo un ejercicio de análisis de datos; es un acelerador de ejecución comercial que reduce incertidumbre y asigna recursos con criterio cuantitativo",
    "La metodología es replicable: una vez validada en Hermosillo, se puede escalar a otras ciudades de Sonora (Cajeme, Nogales) y eventualmente a otros estados",
    "El ROI no está solo en las ventas directas, sino en la eficiencia operativa: menos tiempo desperdiciado en prospección de bajo potencial, más foco en cuentas de alto valor",
    "La certeza viene de la transparencia: todos los supuestos son auditables, todos los ponderadores son ajustables, todas las decisiones son trazables a datos"
  ]
}));
```

---

## Próximos Pasos

Una vez validado el contexto y los objetivos, el reporte se estructura en las siguientes secciones:

1. **[Datos y Metodología](./datos-metodologia)** — Fuentes, pipeline de integración y criterios de calidad
2. **[Exploración Territorial](./exploracion-territorio)** — Mapas base y contexto geográfico de Hermosillo
3. **[Análisis Comercial](./analisis-comercial)** — Densidades por sector y segmentación de mercado
4. **[Scoring y Priorización](./scoring-priorizacion)** — Modelo de ranking y lista ejecutable
5. **[Logística y Sonora](./logistica-sonora)** — Ubicación de CEDIS y expansión regional
6. **[Dashboard Interactivo](./dashboard)** — Herramienta de exploración y exportación

---

<div class="note" style="background: #fff3e0; border-left: 4px solid #ff9800; padding: 1rem; margin: 2rem 0;">
  <p style="margin: 0; font-weight: 600;">⚠️ Nota Importante</p>
  <p style="margin: 0.5rem 0 0 0;">
    Este análisis es **inteligencia previa a la ejecución**, no un plan de acción cerrado. 
    Los datos y el modelo deben validarse con piloto de campo antes de escalar. 
    STRTGY recomienda un enfoque iterativo: prueba → aprende → ajusta → escala.
  </p>
</div>

---

<small style="color: #999;">
  **Sección:** 1 de 7 | **Siguiente:** <a href="./datos-metodologia">2) Datos y Metodología</a>
</small>
