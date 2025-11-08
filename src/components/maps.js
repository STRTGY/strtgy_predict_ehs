/**
 * Interactive Map Components for STRTGY Predict
 * Mapas interactivos con Leaflet optimizados para GitHub Pages (sin dataloaders)
 */

import * as L from "npm:leaflet@1.9.4";

/**
 * Crea un mapa base de Leaflet
 */
export function createBaseMap(container, options = {}) {
  const {
    center = [29.0729, -110.9559], // Hermosillo
    zoom = 12,
    maxZoom = 18,
    minZoom = 10,
    scrollWheelZoom = true
  } = options;

  const map = L.map(container, { scrollWheelZoom }).setView(center, zoom);
  
  // Tileset gratuito de OpenStreetMap
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom,
    minZoom,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> | STRTGY'
  }).addTo(map);
  
  // Controles
  L.control.scale({ position: 'bottomleft' }).addTo(map);
  
  return map;
}

/**
 * Agrega capa de GeoJSON con estilos y popups
 */
export function addGeoJsonLayer(map, data, options = {}) {
  const {
    style = defaultPolygonStyle,
    pointToLayer = defaultPointToLayer,
    onEachFeature,
    filter,
    popupContent,
    tooltipContent
  } = options;
  
  const layer = L.geoJSON(data, {
    style,
    pointToLayer,
    onEachFeature: (feature, layer) => {
      // Popup
      if (popupContent) {
        const content = typeof popupContent === 'function' 
          ? popupContent(feature.properties, feature) 
          : popupContent;
        layer.bindPopup(content, { maxWidth: 300 });
      }
      
      // Tooltip
      if (tooltipContent) {
        const content = typeof tooltipContent === 'function'
          ? tooltipContent(feature.properties, feature)
          : tooltipContent;
        layer.bindTooltip(content, { sticky: true });
      }
      
      // Custom handler
      if (onEachFeature) {
        onEachFeature(feature, layer);
      }
    },
    filter
  }).addTo(map);
  
  return layer;
}

/**
 * Estilo por defecto para polígonos
 */
function defaultPolygonStyle(feature) {
  return {
    fillColor: "#2196f3",
    color: "#1565c0",
    weight: 2,
    opacity: 1,
    fillOpacity: 0.4
  };
}

/**
 * Crea markers por defecto para puntos
 */
function defaultPointToLayer(feature, latlng) {
  return L.circleMarker(latlng, {
    radius: 8,
    fillColor: "#ff9800",
    color: "#e65100",
    weight: 2,
    opacity: 1,
    fillOpacity: 0.7
  });
}

/**
 * Generador de estilos por score
 */
export function styleByScore(scoreField = "score") {
  return (feature) => {
    const score = feature.properties[scoreField] || 0;
    return {
      fillColor: getColorForScore(score),
      color: "#333",
      weight: 1,
      opacity: 0.8,
      fillOpacity: 0.6
    };
  };
}

/**
 * Generador de estilos por categoría
 */
export function styleByCategory(categoryField = "categoria", colorMap = {}) {
  return (feature) => {
    const cat = feature.properties[categoryField];
    const color = colorMap[cat] || "#9e9e9e";
    return {
      fillColor: color,
      color: "#333",
      weight: 1,
      opacity: 0.8,
      fillOpacity: 0.6
    };
  };
}

/**
 * Paleta de colores por score (0-100)
 */
export function getColorForScore(score, reverse = false) {
  if (reverse) {
    if (score >= 80) return "#d32f2f";
    if (score >= 60) return "#f57c00";
    if (score >= 40) return "#fbc02d";
    if (score >= 20) return "#689f38";
    return "#388e3c";
  } else {
    if (score >= 80) return "#1b5e20";
    if (score >= 60) return "#388e3c";
    if (score >= 40) return "#fbc02d";
    if (score >= 20) return "#f57c00";
    return "#d32f2f";
  }
}

/**
 * Paleta por decil
 */
export function getColorForDecil(decil) {
  const colors = [
    "#1a237e", "#283593", "#303f9f", "#3949ab", "#3f51b5",
    "#5c6bc0", "#7986cb", "#9fa8da", "#c5cae9", "#e8eaf6"
  ];
  return colors[decil - 1] || "#9e9e9e";
}

/**
 * Crear markers customizados por tipo
 */
export function createMarker(latlng, {
  type = "default",
  color = "#2196f3",
  icon = "●",
  size = 24
} = {}) {
  const markerHtml = `
    <div style="
      background: ${color};
      width: ${size}px;
      height: ${size}px;
      border-radius: 50%;
      border: 2px solid white;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: ${size * 0.5}px;
      font-weight: bold;
    ">${icon}</div>
  `;
  
  return L.marker(latlng, {
    icon: L.divIcon({
      className: "custom-marker",
      html: markerHtml,
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2]
    })
  });
}

/**
 * Crear leyenda dinámica
 */
export function createLegend(map, items, {
  position = "bottomright",
  title = "Leyenda"
} = {}) {
  const legend = L.control({ position });
  
  legend.onAdd = function() {
    const div = L.DomUtil.create("div", "info legend");
    div.style.cssText = `
      background: white;
      padding: 12px;
      border-radius: 6px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
      font-size: 13px;
      line-height: 1.5;
    `;
    
    let html = `<div style="font-weight: 600; margin-bottom: 8px;">${title}</div>`;
    
    items.forEach(item => {
      if (item.type === "circle") {
        html += `
          <div style="margin: 4px 0; display: flex; align-items: center;">
            <span style="display: inline-block; width: 14px; height: 14px; background: ${item.color}; border-radius: 50%; margin-right: 8px;"></span>
            <span>${item.label}</span>
          </div>
        `;
      } else if (item.type === "square") {
        html += `
          <div style="margin: 4px 0; display: flex; align-items: center;">
            <span style="display: inline-block; width: 14px; height: 14px; background: ${item.color}; margin-right: 8px;"></span>
            <span>${item.label}</span>
          </div>
        `;
      } else if (item.type === "gradient") {
        html += `
          <div style="margin: 8px 0;">
            <div style="background: linear-gradient(to right, ${item.colors.join(', ')}); height: 8px; border-radius: 4px; margin-bottom: 4px;"></div>
            <div style="display: flex; justify-content: space-between; font-size: 11px; color: #666;">
              <span>${item.min}</span>
              <span>${item.max}</span>
            </div>
          </div>
        `;
      } else if (item.type === "header") {
        html += `<div style="margin-top: 12px; font-weight: 600; color: #333;">${item.label}</div>`;
      } else if (item.type === "separator") {
        html += `<hr style="margin: 8px 0; border: 0; border-top: 1px solid #e0e0e0;">`;
      }
    });
    
    div.innerHTML = html;
    return div;
  };
  
  legend.addTo(map);
  return legend;
}

/**
 * Ajustar mapa a los límites de una capa
 */
export function fitBounds(map, layer, padding = 50) {
  const bounds = layer.getBounds();
  if (bounds.isValid()) {
    map.fitBounds(bounds, { padding: [padding, padding], maxZoom: 16 });
  }
}

/**
 * Crear popup HTML estándar para establecimientos
 */
export function createEstablishmentPopup(props) {
  const {
    nom_estab = "Sin nombre",
    segmento = "N/A",
    score_electrolit,
    decil,
    colonia,
    direccion
  } = props;
  
  return `
    <div style="font-family: system-ui, sans-serif; min-width: 200px;">
      <h4 style="margin: 0 0 8px 0; color: #1565c0; font-size: 1rem;">${nom_estab}</h4>
      ${segmento !== "N/A" ? `<div style="margin-bottom: 6px;"><strong>Segmento:</strong> ${segmento}</div>` : ""}
      ${score_electrolit != null ? `<div style="margin-bottom: 6px;"><strong>Score:</strong> ${score_electrolit.toFixed(1)}</div>` : ""}
      ${decil != null ? `<div style="margin-bottom: 6px;"><strong>Decil:</strong> ${decil}</div>` : ""}
      ${colonia ? `<div style="margin-bottom: 6px;"><strong>Colonia:</strong> ${colonia}</div>` : ""}
      ${direccion ? `<div style="font-size: 0.875rem; color: #666;">${direccion}</div>` : ""}
    </div>
  `;
}

/**
 * Crear popup HTML para AGEBs
 */
export function createAGEBPopup(props) {
  const {
    CVEGEO = "N/A",
    POBTOT,
    densidad_comercial,
    nse_dominante
  } = props;
  
  return `
    <div style="font-family: system-ui, sans-serif;">
      <h4 style="margin: 0 0 8px 0; color: #2e7d32; font-size: 1rem;">AGEB ${CVEGEO}</h4>
      ${POBTOT != null ? `<div style="margin-bottom: 6px;"><strong>Población:</strong> ${POBTOT.toLocaleString('es-MX')}</div>` : ""}
      ${densidad_comercial != null ? `<div style="margin-bottom: 6px;"><strong>Densidad comercial:</strong> ${densidad_comercial.toFixed(1)}</div>` : ""}
      ${nse_dominante ? `<div style="margin-bottom: 6px;"><strong>NSE:</strong> ${nse_dominante}</div>` : ""}
    </div>
  `;
}

/**
 * Crear control de capas con checkboxes
 */
export function createLayerControl(map, layers, position = "topright") {
  const control = L.control({ position });
  
  control.onAdd = function() {
    const div = L.DomUtil.create("div", "leaflet-control-layers");
    div.style.cssText = `
      background: white;
      padding: 12px;
      border-radius: 6px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
      max-width: 200px;
    `;
    
    div.innerHTML = `<div style="font-weight: 600; margin-bottom: 8px;">Capas</div>`;
    
    Object.entries(layers).forEach(([name, layer]) => {
      const label = document.createElement("label");
      label.style.cssText = "display: flex; align-items: center; margin: 6px 0; cursor: pointer;";
      
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = map.hasLayer(layer);
      checkbox.style.marginRight = "8px";
      
      checkbox.onchange = (e) => {
        if (e.target.checked) {
          map.addLayer(layer);
        } else {
          map.removeLayer(layer);
        }
      };
      
      label.appendChild(checkbox);
      label.appendChild(document.createTextNode(name));
      div.appendChild(label);
    });
    
    // Prevent map interactions when using control
    L.DomEvent.disableClickPropagation(div);
    L.DomEvent.disableScrollPropagation(div);
    
    return div;
  };
  
  control.addTo(map);
  return control;
}

