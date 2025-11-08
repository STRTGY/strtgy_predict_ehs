import * as L from "npm:leaflet@1.9.4";

export function createMap(container, options = {}) {
  const {
    center = [29.0729, -110.9559],
    zoom = 12,
    maxZoom = 19,
    minZoom = 10
  } = options;

  const map = L.map(container).setView(center, zoom);
  
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);
  
  return map;
}

export function addGeoJsonLayer(map, data, options = {}) {
  const {
    style,
    pointToLayer,
    onEachFeature,
    filter
  } = options;
  
  return L.geoJSON(data, {
    style,
    pointToLayer,
    onEachFeature,
    filter
  }).addTo(map);
}

export function createMarker(latlng, options = {}) {
  const {
    color = "blue",
    icon = "circle",
    iconColor = "white",
    markerColor = color,
    prefix = "fa"
  } = options;
  
  return L.marker(latlng, {
    icon: L.divIcon({
      className: "custom-marker",
      html: `<div style="background-color: ${markerColor}; width: 24px; height: 24px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: ${iconColor};">
        <span style="font-size: 12px;">${icon === "circle" ? "●" : icon === "star" ? "⭐" : icon === "flag" ? "🚩" : "📍"}</span>
      </div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    })
  });
}

export function createCircleMarker(latlng, options = {}) {
  const {
    radius = 8,
    color = "blue",
    fillColor = "lightblue",
    fillOpacity = 0.7,
    weight = 2
  } = options;
  
  return L.circleMarker(latlng, {
    radius,
    color,
    fillColor,
    fillOpacity,
    weight
  });
}

export function createCircle(latlng, options = {}) {
  const {
    radius = 5000,
    color = "blue",
    fillColor = "blue",
    fillOpacity = 0.1,
    weight = 1,
    opacity = 0.3
  } = options;
  
  return L.circle(latlng, {
    radius,
    color,
    fillColor,
    fillOpacity,
    weight,
    opacity
  });
}

export function addPopup(layer, content) {
  layer.bindPopup(content, {maxWidth: 300});
  return layer;
}

export function addTooltip(layer, content) {
  layer.bindTooltip(content, {sticky: true});
  return layer;
}

export function getColorForScore(score, reverse = false) {
  if (reverse) {
    if (score >= 80) return "#d32f2f";
    if (score >= 60) return "#f57c00";
    if (score >= 40) return "#fbc02d";
    if (score >= 20) return "#689f38";
    return "#388e3c";
  } else {
    if (score >= 80) return "#388e3c";
    if (score >= 60) return "#689f38";
    if (score >= 40) return "#fbc02d";
    if (score >= 20) return "#f57c00";
    return "#d32f2f";
  }
}

export function getColorForDecil(decil) {
  const colors = {
    1: "#1a237e",
    2: "#283593",
    3: "#303f9f",
    4: "#3949ab",
    5: "#3f51b5",
    6: "#5c6bc0",
    7: "#7986cb",
    8: "#9fa8da",
    9: "#c5cae9",
    10: "#e8eaf6"
  };
  return colors[decil] || "#9e9e9e";
}

export function getColorForSegmento(segmento) {
  const colors = {
    "retail": "#2e7d32",
    "horeca": "#f57c00",
    "institucional": "#1565c0",
    "otro": "#757575"
  };
  return colors[segmento?.toLowerCase()] || "#9e9e9e";
}

export function createLegend(map, items, position = "bottomright") {
  const legend = L.control({position});
  
  legend.onAdd = function() {
    const div = L.DomUtil.create("div", "info legend");
    div.style.cssText = "background: white; padding: 10px; border-radius: 5px; box-shadow: 0 2px 4px rgba(0,0,0,0.2); font-size: 12px;";
    
    let html = "";
    items.forEach(item => {
      if (item.type === "circle") {
        html += `<div style="margin: 5px 0;"><span style="display: inline-block; width: 16px; height: 16px; background: ${item.color}; border-radius: 50%; margin-right: 8px; vertical-align: middle;"></span><span>${item.label}</span></div>`;
      } else if (item.type === "square") {
        html += `<div style="margin: 5px 0;"><span style="display: inline-block; width: 16px; height: 16px; background: ${item.color}; margin-right: 8px; vertical-align: middle;"></span><span>${item.label}</span></div>`;
      } else if (item.type === "line") {
        html += `<div style="margin: 5px 0;"><span style="display: inline-block; width: 20px; height: 2px; background: ${item.color}; margin-right: 8px; vertical-align: middle;"></span><span>${item.label}</span></div>`;
      } else if (item.type === "header") {
        html += `<div style="margin: 10px 0 5px 0; font-weight: bold;">${item.label}</div>`;
      } else if (item.type === "separator") {
        html += `<hr style="margin: 5px 0; border: 0; border-top: 1px solid #ddd;">`;
      }
    });
    
    div.innerHTML = html;
    return div;
  };
  
  legend.addTo(map);
  return legend;
}

export function fitBounds(map, layer, options = {}) {
  const bounds = layer.getBounds();
  if (bounds.isValid()) {
    map.fitBounds(bounds, options);
  }
}

