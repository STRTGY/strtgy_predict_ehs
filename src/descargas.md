---
title: 📥 Descargas
toc: false
---

```js
import {sectionHeader} from "./components/brand.js";
```

```js
display(sectionHeader({
  title: "Descargas y Exportación de Datos",
  subtitle: "Acceso directo a datasets priorizados para integración con CRM y herramientas de ruteo",
  certainty: "high"
}));
```

---

## Datasets Disponibles

<div class="grid grid-cols-2">
  <div class="card">
    <h3>🎯 Top 400 Establecimientos (GeoJSON)</h3>
    <p style="color: #666; font-size: 0.9rem;">
      Lista priorizada con scoring, segmento, ubicación y metadatos. Formato GeoJSON para importar en QGIS, Google Maps, Mapbox.
    </p>
    <ul style="font-size: 0.9rem; color: #666;">
      <li><strong>Registros:</strong> ~400 establecimientos</li>
      <li><strong>Campos clave:</strong> nom_estab, score_electrolit, decil, segmento, colonia, direccion, lat, lon</li>
      <li><strong>Uso:</strong> Mapas interactivos, análisis espacial</li>
    </ul>
    <a href="./data/top400.web.geojson" download style="
      display: inline-block;
      background: #1565c0;
      color: white;
      padding: 10px 20px;
      border-radius: 6px;
      text-decoration: none;
      font-weight: 600;
      margin-top: 1rem;
    ">Descargar GeoJSON</a>
  </div>
  
  <div class="card">
    <h3>📊 Top 400 Establecimientos (CSV)</h3>
    <p style="color: #666; font-size: 0.9rem;">
      Mismos datos en formato CSV tabular para importar en Excel, CRM (Salesforce, HubSpot), ERP o bases de datos.
    </p>
    <ul style="font-size: 0.9rem; color: #666;">
      <li><strong>Registros:</strong> ~400 establecimientos</li>
      <li><strong>Formato:</strong> UTF-8, delimitado por comas</li>
      <li><strong>Uso:</strong> CRM, reporting, análisis en Excel/Python</li>
    </ul>
    <a href="./data/top400.web.csv" download style="
      display: inline-block;
      background: #2e7d32;
      color: white;
      padding: 10px 20px;
      border-radius: 6px;
      text-decoration: none;
      font-weight: 600;
      margin-top: 1rem;
    ">Descargar CSV</a>
  </div>
  
  <div class="card">
    <h3>🚚 Top 10 Hubs Logísticos (CSV)</h3>
    <p style="color: #666; font-size: 0.9rem;">
      Ubicaciones óptimas para CEDIS con métricas de cobertura, tiempo promedio y score logístico.
    </p>
    <ul style="font-size: 0.9rem; color: #666;">
      <li><strong>Registros:</strong> 10 ubicaciones</li>
      <li><strong>Campos:</strong> ranking, nombre, lat, lon, cobertura_30min, tiempo_prom_min, score_logistico</li>
      <li><strong>Uso:</strong> Evaluación de ubicación de CEDIS</li>
    </ul>
    <a href="./data/top10_hubs.web.csv" download style="
      display: inline-block;
      background: #f57c00;
      color: white;
      padding: 10px 20px;
      border-radius: 6px;
      text-decoration: none;
      font-weight: 600;
      margin-top: 1rem;
    ">Descargar CSV</a>
  </div>
  
  <div class="card">
    <h3>⭐ Sweet Spots (GeoJSON)</h3>
    <p style="color: #666; font-size: 0.9rem;">
      Top 10 zonas de alta concentración comercial + accesibilidad logística óptima.
    </p>
    <ul style="font-size: 0.9rem; color: #666;">
      <li><strong>Registros:</strong> 10 polígonos (AGEBs o clusters)</li>
      <li><strong>Geometría:</strong> Polígonos delimitados</li>
      <li><strong>Uso:</strong> Análisis de zonas prioritarias, clustering</li>
    </ul>
    <a href="./data/sweetspot_top10.web.geojson" download style="
      display: inline-block;
      background: #6a1b9a;
      color: white;
      padding: 10px 20px;
      border-radius: 6px;
      text-decoration: none;
      font-weight: 600;
      margin-top: 1rem;
    ">Descargar GeoJSON</a>
  </div>
  
  <div class="card">
    <h3>🗺️ AGEBs Base (GeoJSON)</h3>
    <p style="color: #666; font-size: 0.9rem;">
      Polígonos de AGEBs de Hermosillo con datos demográficos SCINCE 2020.
    </p>
    <ul style="font-size: 0.9rem; color: #666;">
      <li><strong>Registros:</strong> ~300 AGEBs</li>
      <li><strong>Campos:</strong> CVEGEO, POBTOT, NSE, índice de marginación, densidad comercial</li>
      <li><strong>Uso:</strong> Contexto territorial, análisis demográfico</li>
    </ul>
    <a href="./data/agebs_base.web.geojson" download style="
      display: inline-block;
      background: #455a64;
      color: white;
      padding: 10px 20px;
      border-radius: 6px;
      text-decoration: none;
      font-weight: 600;
      margin-top: 1rem;
    ">Descargar GeoJSON</a>
  </div>
  
  <div class="card">
    <h3>📋 Top 20 Comercial (CSV)</h3>
    <p style="color: #666; font-size: 0.9rem;">
      Lista reducida de los 20 establecimientos de máxima prioridad para prospección inmediata.
    </p>
    <ul style="font-size: 0.9rem; color: #666;">
      <li><strong>Registros:</strong> 20 establecimientos</li>
      <li><strong>Contenido:</strong> Subset del Top 400 con deciles 9–10</li>
      <li><strong>Uso:</strong> Piloto de prospección, asignación a vendedores</li>
    </ul>
    <a href="./data/top20_comercial.web.csv" download style="
      display: inline-block;
      background: #c62828;
      color: white;
      padding: 10px 20px;
      border-radius: 6px;
      text-decoration: none;
      font-weight: 600;
      margin-top: 1rem;
    ">Descargar CSV</a>
  </div>
</div>

---

## Catálogo de Datos

```js
const catalog = await FileAttachment("data/catalog.json").json();

display(html`
  <div class="card">
    <h3>Metadata del Catálogo</h3>
    <pre style="background: #f5f5f5; padding: 1rem; border-radius: 6px; overflow-x: auto; font-size: 0.85rem;">${JSON.stringify(catalog, null, 2)}</pre>
  </div>
`);
```

---

## Guías de Integración

### Importar a CRM (Salesforce, HubSpot, Zoho)

1. **Descargar Top 400 en CSV**
2. **Mapear campos:**
   - `nom_estab` → Nombre de la Cuenta
   - `direccion` → Dirección
   - `colonia` → Barrio/Distrito
   - `segmento` → Categoría/Tag
   - `score_electrolit` → Campo personalizado "Score de Prioridad"
   - `decil` → Campo personalizado "Decil"
   - `lat`, `lon` → Geolocalización (si el CRM lo soporta)
3. **Importar usando el asistente de importación del CRM**
4. **Crear vistas filtradas por decil** (9–10 para equipo senior, 7–8 para equipo junior)

### Importar a Google Maps / Google My Maps

1. **Descargar Top 400 en GeoJSON o CSV**
2. **Abrir [Google My Maps](https://www.google.com/maps/d/)**
3. **Crear nuevo mapa → Importar → Seleccionar archivo**
4. **Configurar estilos por score o decil:** usar reglas de color condicional
5. **Compartir con equipo comercial** mediante enlace

### Usar en QGIS / ArcGIS

1. **Descargar GeoJSON** (Top 400, AGEBs, Sweet Spots)
2. **Abrir QGIS → Añadir Capa → Vector → Seleccionar archivo**
3. **Aplicar simbología por score** usando clasificación graduada
4. **Combinar con otras capas** (vialidades, zonas postales, competidores)
5. **Exportar mapas estáticos** para presentaciones

### Integrar con Herramientas de Ruteo (OptimoRoute, Route4Me)

1. **Descargar Top 400 en CSV**
2. **Asegurar que columnas `lat` y `lon` estén presentes**
3. **Importar en herramienta de ruteo**
4. **Configurar restricciones:**
   - Horarios de visita (ej: retail 9 AM–7 PM, horeca 12 PM–10 PM)
   - Capacidad de vehículo
   - Ventanas de tiempo
5. **Generar rutas optimizadas por vendedor/día**

---

## Actualizaciones de Datos

<div class="note" style="background: #e3f2fd; border-left: 4px solid #2196f3; padding: 1rem;">
  <p style="margin: 0; font-weight: 600;">📅 Frecuencia de Actualización</p>
  <p style="margin: 0.5rem 0 0 0;">
    Los datos de este reporte se basan en fuentes oficiales (INEGI DENUE 2024, SCINCE 2020). 
    **Recomendamos actualizar el análisis cada 6–12 meses** para reflejar:
  </p>
  <ul style="margin: 0.5rem 0 0 0; padding-left: 1.5rem;">
    <li>Nuevos establecimientos registrados en DENUE</li>
    <li>Cambios demográficos (nuevos fraccionamientos, crecimiento poblacional)</li>
    <li>Feedback del equipo comercial (conversión real vs. proyectada)</li>
  </ul>
  <p style="margin: 0.5rem 0 0 0;">
    STRTGY puede proveer actualizaciones automatizadas mediante pipeline de datos configurado.
  </p>
</div>

---

## Soporte y Preguntas Frecuentes

**¿Los archivos CSV usan codificación UTF-8?**  
Sí, todos los archivos CSV están en UTF-8 para soportar caracteres especiales (ñ, acentos). Al abrir en Excel, usa "Datos → Desde texto/CSV" y selecciona UTF-8.

**¿Puedo filtrar los datos antes de descargar?**  
Sí, usa el [Dashboard Interactivo](./dashboard) para aplicar filtros por decil, segmento o colonia, y luego exporta desde la tabla.

**¿Los datos incluyen información de contacto (teléfono, email)?**  
No. DENUE provee solo nombre, dirección y ubicación. Los datos de contacto deben obtenerse mediante prospección de campo o servicios de enriquecimiento (ej: Apollo.io, ZoomInfo).

**¿Puedo redistribuir estos datos?**  
Los datos derivados de fuentes públicas (INEGI) son redistribuibles. Sin embargo, el **modelo de scoring y la priorización son propiedad intelectual de STRTGY** y están sujetos a los términos del contrato de consultoría.

**¿Cómo reporto errores en los datos?**  
Contacta a tu Project Manager de STRTGY con el detalle del error (CVEGEO o nombre del establecimiento afectado). Validaremos y corregiremos en la próxima actualización.

---

<small style="color: #999;">
  **Ver también:** <a href="./dashboard">7) Dashboard Interactivo</a> | <a href="./anexos">Anexos y Diccionario</a>
</small>
