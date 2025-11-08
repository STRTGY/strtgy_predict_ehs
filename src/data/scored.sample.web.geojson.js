import { readFile } from "node:fs/promises";

// Data loader for scored.sample.web.geojson
const data = JSON.parse(await readFile("src/data/scored.sample.web.geojson", "utf-8"));

process.stdout.write(JSON.stringify(data));

