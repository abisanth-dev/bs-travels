/**
 * Renders the generated placeholder artwork into /public/images.
 * Usage: node scripts/art/render.cjs
 * Requires Playwright with Chromium. Replace any output file with a real,
 * licensed photograph of the same name to swap it in.
 */
const path = require("path");
const fs = require("fs");
const { chromium } = require("playwright");

const root = path.resolve(__dirname, "../..");
const dusk = { sky: ["#0b1630", "#2a3a66", "#d98c5f"], glow: "#f2b46a", far: "#4a4f74", near: "#151c34", fore: "#0a0f1f" };
const night = { sky: ["#070d1c", "#14234a", "#3d4f80"], glow: "#cfd8f0", far: "#2f3c62", near: "#0d1428", fore: "#070b16", stars: true };
const gold = { sky: ["#1a1830", "#7a4a4a", "#f0b06a"], glow: "#ffd08a", far: "#7a5a5a", near: "#2a1c22", fore: "#120c12" };
const dawn = { sky: ["#13223f", "#5c6f9a", "#e9b89a"], glow: "#ffd9b0", far: "#6f7fa3", near: "#1d2a46", fore: "#0d1424", snow: "#f3eee8" };

const scenes = {
  "destinations/canada": { ...dawn, seed: 11, motifs: ["mountains"], water: true, horizon: 0.62, sun: { x: 0.3, y: 0.5 } },
  "destinations/united-kingdom": { ...dusk, seed: 4, sky: ["#101a33", "#3b4a72", "#c98a6c"], motifs: ["skyline"], skyline: "clock", water: true, horizon: 0.68, sun: { x: 0.78, y: 0.6 } },
  "destinations/india": { ...gold, seed: 21, motifs: ["skyline"], skyline: "domes", horizon: 0.7, sun: { x: 0.5, y: 0.58, r: 0.07 } },
  "destinations/thailand": { ...gold, seed: 9, motifs: ["temples"], water: true, horizon: 0.7, sun: { x: 0.62, y: 0.6 } },
  "destinations/malaysia": { ...dusk, seed: 15, sky: ["#0c1a2e", "#2c4d63", "#e0915e"], motifs: ["islands"], water: true, horizon: 0.66, sun: { x: 0.25, y: 0.58 } },
  "destinations/dubai-uae": { ...gold, seed: 3, sky: ["#191b33", "#6a4d58", "#f2b36e"], motifs: ["skyline"], skyline: "spire", horizon: 0.72, sun: { x: 0.3, y: 0.66 } },
  "destinations/qatar": { ...dusk, seed: 8, sky: ["#141a33", "#4a3d5e", "#e19a6e"], motifs: ["skyline"], skyline: "domes", water: true, horizon: 0.68, sun: { x: 0.72, y: 0.6 } },
  "destinations/china": { ...dawn, seed: 31, sky: ["#141d36", "#56506e", "#e6a77e"], motifs: ["wall"], horizon: 0.64, sun: { x: 0.7, y: 0.45 } },
  "destinations/japan": { ...dawn, seed: 27, sky: ["#111b38", "#5a5f8a", "#efb3a4"], glow: "#ffd2c2", motifs: ["fuji"], water: true, horizon: 0.66, sun: { x: 0.28, y: 0.4, r: 0.06 } },
  "destinations/vietnam": { ...dawn, seed: 13, sky: ["#122238", "#4f6a7a", "#e2b98a"], motifs: ["karst"], water: true, horizon: 0.64, sun: { x: 0.55, y: 0.5 } },
  "destinations/nepal": { ...dawn, seed: 19, motifs: ["himalaya"], horizon: 0.72, sun: { x: 0.8, y: 0.3, r: 0.04 } },
  "destinations/indonesia": { ...gold, seed: 23, sky: ["#14183a", "#6a4a62", "#f0a868"], motifs: ["islands"], volcano: true, water: true, horizon: 0.66, sun: { x: 0.35, y: 0.58 } },
  "destinations/united-states": { ...night, seed: 6, glow: "#f2c48a", sky: ["#081024", "#1d2c5a", "#7a5a72"], motifs: ["skyline"], water: true, horizon: 0.66, sun: { x: 0.8, y: 0.25, r: 0.025 } },
  "destinations/australia": { ...dusk, seed: 17, sky: ["#0e1a33", "#3a4f7a", "#e89a66"], motifs: ["harbour"], water: true, horizon: 0.66, sun: { x: 0.75, y: 0.58 } },
  "articles/green-card": { ...night, seed: 41, glow: "#f2c48a", motifs: ["skyline"], water: true, horizon: 0.64, width: 1600, height: 900, sun: { x: 0.2, y: 0.25, r: 0.02 } },
  "articles/canada-visitor": { ...dawn, seed: 44, motifs: ["mountains"], water: true, horizon: 0.6, width: 1600, height: 900, sun: { x: 0.7, y: 0.45 } },
  "hero/sky": {
    ...dusk, seed: 5, width: 2400, height: 1400, sky: ["#060c1c", "#16264c", "#c97f5e"], glow: "#f5b46c",
    motifs: ["clouds"], cloudTop: "#d8b49a", cloudBottom: "#1b2442", backRidge: false, water: false,
    fore: "#0b1226", horizon: 0.6, sun: { x: 0.72, y: 0.6, r: 0.035 },
  },
  "about/jaffna": { ...gold, seed: 52, sky: ["#101632", "#5a4258", "#eaa86a"], motifs: ["islands"], water: true, horizon: 0.62, sun: { x: 0.6, y: 0.56 } },
};

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto("file://" + path.join(__dirname, "painter.html"));
  for (const [name, scene] of Object.entries(scenes)) {
    await page.setViewportSize({ width: scene.width || 1600, height: scene.height || 1000 });
    await page.evaluate((s) => window.paint(s), scene);
    const out = path.join(root, "public/images", name + ".jpg");
    fs.mkdirSync(path.dirname(out), { recursive: true });
    await page.locator("#c").screenshot({ path: out, type: "jpeg", quality: 82 });
    console.log("wrote", path.relative(root, out));
  }
  await browser.close();
})();
