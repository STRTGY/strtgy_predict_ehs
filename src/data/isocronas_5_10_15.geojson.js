import { readFile } from "node:fs/promises";

// Data loader for isocronas_5_10_15.geojson
const data = JSON.parse(await readFile("src/data/isocronas_5_10_15.geojson", "utf-8"));

// Normalize: add 'minutos' property from 'range' (seconds)
const normalized = {
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

process.stdout.write(JSON.stringify(normalized));

