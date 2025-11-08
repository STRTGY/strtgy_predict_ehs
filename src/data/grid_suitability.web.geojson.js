import { readFile } from "node:fs/promises";

/**
 * Data loader for grid_suitability.web.geojson
 * 
 * Distribution center suitability grid (500m x 500m cells)
 * with complete scoring properties.
 * 
 * Properties:
 * - suitability_score: Overall suitability (0-100)
 * - customers_5km, customers_10km, customers_15km: Customer coverage
 * - center_lat, center_lon: Grid cell center
 * - score_proximity, score_coverage, score_infrastructure: Component scores
 * - score_demographics, score_operational: Additional dimensions
 */

const data = JSON.parse(await readFile("src/data/grid_suitability.web.geojson", "utf-8"));

// Validate data has properties
if (!data.features || data.features.length === 0) {
  throw new Error("Grid suitability data is empty");
}

// Check first feature has required properties
const firstFeature = data.features[0];
const requiredProps = ['suitability_score', 'customers_5km', 'customers_10km', 'center_lat', 'center_lon'];
const missingProps = requiredProps.filter(prop => !(prop in firstFeature.properties));

if (missingProps.length > 0) {
  throw new Error(`Grid suitability missing properties: ${missingProps.join(', ')}`);
}

// Add alias for compatibility with legacy code
const normalized = {
  ...data,
  features: data.features.map(f => ({
    ...f,
    properties: {
      ...f.properties,
      // Add alias score_grid for compatibility
      score_grid: f.properties.suitability_score
    }
  }))
};

process.stdout.write(JSON.stringify(normalized));

