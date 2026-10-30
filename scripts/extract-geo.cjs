// Extracts Natural Earth geometry (public domain, via the world-atlas package)
// into small files the site and the art scripts use.
const fs = require("fs");
const { feature } = require("topojson-client");
const out = process.argv[2];
const c10 = require("world-atlas/countries-10m.json");
const land50 = require("world-atlas/land-50m.json");
const lka = feature(c10, c10.objects.countries).features.find((f) => f.id === "144");
fs.writeFileSync(`${out}/sri-lanka.geojson`, JSON.stringify(lka.geometry));
fs.writeFileSync(`${out}/land-50m.geojson`, JSON.stringify(feature(land50, land50.objects.land)));
console.log(lka.properties, lka.geometry.type, lka.geometry.coordinates.length);
