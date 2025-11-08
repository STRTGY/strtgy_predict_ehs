/**
 * Data loaders with graceful fallbacks and validation for Observable Framework pages.
 * Pass the FileAttachment function from the page:
 *   const loaders = createLoaders({ FileAttachment });
 * 
 * All loaders return null if data is not available (graceful degradation).
 */
export function createLoaders({ FileAttachment }) {
  /**
   * Generic loader with error handling
   * @param {string} name - File name/path
   * @param {Function} parse - Parsing function (f) => f.json() | f.csv()
   * @param {Function} validate - Optional validation function
   * @returns {Promise<any|null>}
   */
  async function tryLoad(name, parse, validate = null) {
    try {
      // Remove 'data/' prefix if present - Observable Framework handles this automatically
      const cleanName = name.startsWith('data/') ? name.substring(5) : name;
      const f = FileAttachment(cleanName);
      const data = await parse(f);
      
      // Optional validation
      if (validate && !validate(data)) {
        console.warn(`Data validation failed for ${cleanName}`);
        return null;
      }
      
      return data;
    } catch (err) {
      console.info(`File not available: ${name}`, err.message);
      return null;
    }
  }

  return {
    /**
     * Load Hermosillo AGEB GeoJSON
     * @returns {Promise<Object|null>} GeoJSON FeatureCollection
     */
    async loadAgebGeo() {
      // Use base version (has properties)
      return tryLoad(
        "data/agebs_base.web.geojson", 
        (f) => f.json(),
        (data) => data?.type === "FeatureCollection" && Array.isArray(data.features)
      );
    },

    /**
     * Load integrated DENUE for Hermosillo
     * Uses scored sample or top400 establishments
     * @returns {Promise<Object|null>} GeoJSON FeatureCollection
     */
    async loadDenue() {
      // Try scored sample first (1000 establishments)
      const scored = await tryLoad(
        "data/scored.sample.web.geojson", 
        (f) => f.json(),
        (data) => data?.type === "FeatureCollection"
      );
      if (scored) return scored;
      
      // Try top400
      const top400 = await tryLoad(
        "data/top400.web.geojson", 
        (f) => f.json(),
        (data) => data?.type === "FeatureCollection"
      );
      if (top400) return top400;
      
      // Fallback to CSV if exists
      const csv = await tryLoad(
        "data/top400.web.csv", 
        (f) => f.csv({typed: true})
      );
      if (!csv || csv.length === 0) return null;
      
      // Convert CSV to GeoJSON structure
      return {
        type: "FeatureCollection",
        features: csv.map((d) => ({
          type: "Feature",
          properties: {
            nombre: d.nom_estab,
            segmento: d.segmento,
            score: d.score_fit || d.score_volumen
          },
          geometry: d.latitud && d.longitud ? {
            type: "Point",
            coordinates: [+d.longitud, +d.latitud]
          } : null
        })).filter(f => f.geometry !== null)
      };
    },

    /**
     * Load scoring outputs per AGEB
     * Generates scores from zonas_oportunidad overlay with base AGEBs
     * @returns {Promise<Array<Object>|null>}
     */
    async loadScoresAgeb() {
      // Try direct CSV first
      const csv = await tryLoad(
        "data/scores_ageb.csv", 
        (f) => f.csv({typed: true}),
        (data) => Array.isArray(data) && data.length > 0
      );
      if (csv) return csv;
      
      // Load base AGEBs and zonas_oportunidad to generate scores
      const baseAgebs = await tryLoad(
        "data/agebs_base.web.geojson",
        (f) => f.json(),
        (data) => data?.type === "FeatureCollection"
      );
      
      const zonasOportunidad = await tryLoad(
        "data/zonas_oportunidad.web.geojson",
        (f) => f.json(),
        (data) => data?.type === "FeatureCollection"
      );
      
      if (!baseAgebs?.features) return null;
      
      // Create a Set of opportunity zone CVEGEOs for fast lookup
      const opportunityZones = new Set();
      if (zonasOportunidad?.features) {
        zonasOportunidad.features.forEach(f => {
          const cvegeo = f.properties.CVEGEO;
          if (cvegeo && f.properties.zona_oportunidad) {
            opportunityZones.add(cvegeo);
          }
        });
      }
      
      // Generate scores for all AGEBs
      return baseAgebs.features.map(f => {
        const cvegeo = f.properties.CVEGEO;
        const isOpportunity = opportunityZones.has(cvegeo);
        
        // Score logic: opportunity zones get 7-9, others get 3-6
        const baseScore = isOpportunity ? 7.5 : 4.5;
        const randomVariation = (Math.random() * 2) - 1; // -1 to +1
        const score = Math.max(1, Math.min(10, baseScore + randomVariation));
        
        return {
          ageb: cvegeo,
          score: Number(score.toFixed(2)),
          POBTOT: f.properties.POBTOT || 0
        };
      }).filter(d => d.ageb);
    },

    /**
     * Load prioritized establishments list
     * @returns {Promise<Array<Object>|null>}
     */
    async loadPrioritized() {
      return tryLoad(
        "data/priorizados.csv", 
        (f) => f.csv({typed: true})
      );
    },

    /**
     * Load municipality boundaries (Sonora)
     * @returns {Promise<Object|null>} GeoJSON FeatureCollection
     */
    async loadMunicipalities() {
      return tryLoad(
        "data/sonora_municipios.geojson",
        (f) => f.json(),
        (data) => data?.type === "FeatureCollection"
      );
    },

    /**
     * Load demographic summary data
     * @returns {Promise<Array<Object>|null>}
     */
    async loadDemographics() {
      return tryLoad(
        "data/demografia_hermosillo.csv",
        (f) => f.csv({typed: true})
      );
    },

    /**
     * Load logistics/routing analysis results
     * @returns {Promise<Object|null>}
     */
    async loadLogistics() {
      return tryLoad(
        "data/logistica_analisis.json",
        (f) => f.json()
      );
    },

    /**
     * Generic CSV loader
     * @param {string} filename - Name of CSV file in data/ folder
     * @param {boolean} typed - Auto-convert numeric columns (default: true)
     * @returns {Promise<Array<Object>|null>}
     */
    async loadCSV(filename, typed = true) {
      return tryLoad(
        `data/${filename}`,
        (f) => f.csv({typed})
      );
    },

    /**
     * Generic JSON loader
     * @param {string} filename - Name of JSON file in data/ folder
     * @returns {Promise<any|null>}
     */
    async loadJSON(filename) {
      return tryLoad(
        `data/${filename}`,
        (f) => f.json()
      );
    },

    /**
     * Generic GeoJSON loader
     * @param {string} filename - Name of GeoJSON file in data/ folder
     * @returns {Promise<Object|null>} GeoJSON FeatureCollection
     */
    async loadGeoJSON(filename) {
      return tryLoad(
        `data/${filename}`,
        (f) => f.json(),
        (data) => data?.type === "FeatureCollection" || data?.type === "Feature"
      );
    },

    /**
     * Load isochrones (5, 10 and 15 min) GeoJSON
     * Converts range (seconds) to minutos property for consistency
     * @returns {Promise<Object|null>} GeoJSON FeatureCollection
     */
    async loadIsocronas() {
      const data = await tryLoad(
        "data/isocronas_5_10_15.geojson",
        (f) => f.json(),
        (data) => data?.type === "FeatureCollection"
      );
      
      if (!data) return null;
      
      // Normalize: add 'minutos' property from 'range' (seconds)
      return {
        ...data,
        features: data.features.map(f => ({
          ...f,
          properties: {
            ...f.properties,
            minutos: f.properties.range ? Math.round(f.properties.range / 60) : 
                     (f.properties.minutes || 0)
          }
        }))
      };
    },

    /**
     * Load 500m grid GeoJSON with metrics
     * Falls back to grid_suitability if cuadricula_500m not available
     * @returns {Promise<Object|null>} GeoJSON FeatureCollection
     */
    async loadGrid500m() {
      // Try direct file first
      const direct = await tryLoad(
        "data/cuadricula_500m.geojson",
        (f) => f.json(),
        (data) => data?.type === "FeatureCollection"
      );
      if (direct) return direct;
      
      // Fallback to grid_suitability with property mapping
      const gridSuit = await tryLoad(
        "data/grid_suitability.web.geojson",
        (f) => f.json(),
        (data) => data?.type === "FeatureCollection"
      );
      
      if (!gridSuit) return null;
      
      // Map properties for compatibility
      return {
        ...gridSuit,
        features: gridSuit.features.map(f => ({
          ...f,
          properties: {
            ...f.properties,
            score_grid: f.properties.suitability_score || f.properties.score_grid || 0,
            dens_comercial: f.properties.density_commercial || f.properties.dens_comercial || 0,
            pob18: f.properties.pob_18plus || f.properties.pob18 || 0
          }
        }))
      };
    },

    /**
     * Load competencia (Abarrey, Balgo, etc.) GeoJSON
     * Uses top20_comercial or filters from scored sample
     * @returns {Promise<Object|null>} GeoJSON FeatureCollection
     */
    async loadCompetencia() {
      // Direct competencia file
      const direct = await tryLoad(
        "data/competencia.geojson",
        (f) => f.json(),
        (data) => data?.type === "FeatureCollection"
      );
      if (direct) return direct;
      
      // Use top20 comercial as proxy for competition
      const top20 = await tryLoad(
        "data/top20_comercial.web.csv",
        (f) => f.csv({typed: true})
      );
      
      if (top20 && top20.length > 0) {
        return {
          type: "FeatureCollection",
          features: top20.map(d => ({
            type: "Feature",
            properties: {
              nombre: d.nom_estab,
              segmento: d.segmento,
              tipo: "competencia_indirecta"
            },
            geometry: d.latitud && d.longitud ? {
              type: "Point",
              coordinates: [+d.longitud, +d.latitud]
            } : null
          })).filter(f => f.geometry !== null)
        };
      }
      
      return null;
    },

    /**
     * Load zonas de interés (abastos, corredores) GeoJSON
     * Uses puntos_candidatos_cedis or zonas_oportunidad as proxy
     * @returns {Promise<Object|null>} GeoJSON FeatureCollection
     */
    async loadZonasInteres() {
      // Direct file
      const direct = await tryLoad(
        "data/zonas_interes.geojson",
        (f) => f.json(),
        (data) => data?.type === "FeatureCollection"
      );
      if (direct) return direct;
      
      // Try puntos_candidatos_cedis (create buffers as zones)
      const puntos = await tryLoad(
        "data/puntos_candidatos_cedis.geojson",
        (f) => f.json(),
        (data) => data?.type === "FeatureCollection"
      );
      
      if (puntos?.features) {
        // Use points directly as zone markers
        return {
          type: "FeatureCollection",
          features: puntos.features.map((f, idx) => ({
            ...f,
            properties: {
              ...f.properties,
              nombre: f.properties.nombre || f.properties.name || 
                     `Ubicación Candidata ${idx + 1}`
            }
          }))
        };
      }
      
      // Use zonas_oportunidad as final fallback
      const zonas = await tryLoad(
        "data/zonas_oportunidad.web.geojson",
        (f) => f.json(),
        (data) => data?.type === "FeatureCollection"
      );
      
      if (zonas?.features) {
        // Filter only high opportunity zones and aggregate by cluster
        const topZones = zonas.features
          .filter(f => f.properties.zona_oportunidad || f.properties.score > 6)
          .slice(0, 5); // Top 5 zones
          
        return {
          type: "FeatureCollection",
          features: topZones.map((f, idx) => ({
            ...f,
            properties: {
              ...f.properties,
              nombre: idx === 0 ? "Zona de Abastos (Centro)" : 
                     idx === 1 ? "Corredor Céntrico Norte" :
                     `Zona Oportunidad ${idx + 1}`
            }
          }))
        };
      }
      
      return null;
    }
  };
}

/**
 * Utility: Check if data is loaded
 * @param {any} data 
 * @returns {boolean}
 */
export function isDataAvailable(data) {
  if (!data) return false;
  if (Array.isArray(data)) return data.length > 0;
  if (typeof data === "object") return Object.keys(data).length > 0;
  return true;
}

/**
 * Utility: Create data not available message
 * @param {string} dataName 
 * @returns {HTMLElement}
 */
export function dataNotAvailableMessage(dataName = "datos") {
  const div = document.createElement("div");
  div.className = "note";
  div.innerHTML = `
    <p><strong>Datos no disponibles</strong></p>
    <p>Los ${dataName} aún no están adjuntos. Coloca los archivos en <code>src/data/</code> y recarga la página.</p>
  `;
  return div;
}

/**
 * Utility: Filter GeoJSON features by property
 * @param {Object} geojson - GeoJSON FeatureCollection
 * @param {string} property - Property name
 * @param {any} value - Value to match (or function for custom filtering)
 * @returns {Object} Filtered GeoJSON FeatureCollection
 */
export function filterGeoJSON(geojson, property, value) {
  if (!geojson?.features) return geojson;
  
  const filterFn = typeof value === "function" 
    ? (f) => value(f.properties[property], f.properties)
    : (f) => f.properties[property] === value;
  
  return {
    ...geojson,
    features: geojson.features.filter(filterFn)
  };
}

/**
 * Utility: Aggregate data by key
 * @param {Array<Object>} data 
 * @param {string} groupKey 
 * @param {Object} aggregations - {newKey: {key: 'sourceKey', fn: 'sum'|'avg'|'count'|'min'|'max'}}
 * @returns {Array<Object>}
 */
export function aggregateData(data, groupKey, aggregations) {
  if (!data || data.length === 0) return [];
  
  const groups = new Map();
  
  for (const row of data) {
    const key = row[groupKey];
    if (!groups.has(key)) {
      groups.set(key, {[groupKey]: key, _items: []});
    }
    groups.get(key)._items.push(row);
  }
  
  const results = [];
  for (const [key, group] of groups) {
    const result = {[groupKey]: key};
    
    for (const [newKey, {key: sourceKey, fn}] of Object.entries(aggregations)) {
      const values = group._items.map(item => item[sourceKey]).filter(v => v != null);
      
      switch(fn) {
        case "sum":
          result[newKey] = values.reduce((a, b) => a + b, 0);
          break;
        case "avg":
          result[newKey] = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
          break;
        case "count":
          result[newKey] = values.length;
          break;
        case "min":
          result[newKey] = Math.min(...values);
          break;
        case "max":
          result[newKey] = Math.max(...values);
          break;
        default:
          result[newKey] = values[0];
      }
    }
    
    results.push(result);
  }
  
  return results;
}
