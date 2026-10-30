// Captures a still of each homepage scene, used as its static fallback
// (reduced motion, no WebGL, weak devices, and while 3D loads).
// Usage: start the production server on :3100, then
//   node scripts/capture-scene-posters.cjs <outdir>
// and convert the PNGs to public/images/scenes/poster-<name>.webp.
const { chromium } = require("playwright");
const NAMES = ["services", "inspire", "about", "steps", "book", "folder", "journal", "faq", "desk"];
(async () => {
  const out = process.argv[2];
  const b = await chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"] });
  const p = await b.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1.5 });
  await p.goto("http://localhost:3100/?3d=high", { waitUntil: "networkidle" });
  await p.waitForTimeout(3000);
  for (const name of NAMES) {
    // the stage registers slots by name; find the element through its poster image
    const sel = `img[src="/images/scenes/poster-${name}.webp"]`;
    await p.evaluate((s) => {
      const slot = document.querySelector(s).parentElement.parentElement;
      const r = slot.getBoundingClientRect();
      window.scrollTo({ top: scrollY + r.top + r.height / 2 - innerHeight / 2, behavior: "instant" });
    }, sel);
    await p.waitForTimeout(4500);
    const box = await p.evaluate((s) => {
      const slot = document.querySelector(s).parentElement.parentElement;
      document.documentElement.classList.add("capture-scene");
      const r = slot.getBoundingClientRect();
      return { x: Math.max(0, r.left), y: Math.max(0, r.top), width: Math.min(r.width, innerWidth), height: Math.min(r.height, innerHeight - Math.max(0, r.top)) };
    }, sel);
    await p.addStyleTag({ content: ".capture-scene header, .capture-scene main section > *:not(canvas), .capture-scene main section [data-reveal], .capture-scene svg { visibility: hidden !important; } .capture-scene main section { background: transparent !important; }" });
    await p.waitForTimeout(300);
    await p.screenshot({ path: `${out}/poster-${name}.png`, clip: box, timeout: 120000 });
    await p.evaluate(() => document.documentElement.classList.remove("capture-scene"));
    console.log(name, box);
  }
  await b.close();
})();
