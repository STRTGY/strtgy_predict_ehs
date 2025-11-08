import { readFile } from "node:fs/promises";

// Data loader for agebs_base.web.geojson
const data = JSON.parse(await readFile("src/data/agebs_base.web.geojson", "utf-8"));

process.stdout.write(JSON.stringify(data));

