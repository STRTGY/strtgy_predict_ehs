import { readFile } from "node:fs/promises";

// Data loader for puntos_candidatos_cedis.geojson
const data = JSON.parse(await readFile("src/data/puntos_candidatos_cedis.geojson", "utf-8"));

// Normalize names
const normalized = {
  ...data,
  features: data.features.map((f, idx) => ({
    ...f,
    properties: {
      ...f.properties,
      nombre: f.properties.nombre || f.properties.name || `Ubicación Candidata ${idx + 1}`
    }
  }))
};

process.stdout.write(JSON.stringify(normalized));

