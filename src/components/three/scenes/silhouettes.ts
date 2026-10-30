import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

/**
 * Landmark and landscape silhouettes for the destination scenes, built from
 * simple shape primitives. They are stylised outlines evoking each place's
 * best-known scenery, not architectural models. Units: x from -10 to 10,
 * ground at y = 0.
 */
type Part = THREE.Shape;

const rect = (x: number, w: number, h: number, y = 0): Part => {
  const s = new THREE.Shape();
  s.moveTo(x - w / 2, y);
  s.lineTo(x + w / 2, y);
  s.lineTo(x + w / 2, y + h);
  s.lineTo(x - w / 2, y + h);
  s.closePath();
  return s;
};
const poly = (pts: [number, number][]): Part => {
  const s = new THREE.Shape();
  s.moveTo(pts[0][0], pts[0][1]);
  pts.slice(1).forEach(([x, y]) => s.lineTo(x, y));
  s.closePath();
  return s;
};
const spire = (x: number, w: number, h: number, y = 0) => poly([[x - w / 2, y], [x + w / 2, y], [x, y + h]]);
const dome = (x: number, r: number, y: number, pointed = 0) => {
  const s = new THREE.Shape();
  s.moveTo(x - r, y);
  s.absarc(x, y, r, Math.PI, 0, true);
  s.lineTo(x - r, y);
  const parts: Part[] = [s];
  if (pointed) parts.push(spire(x, r * 0.3, r + pointed, y + r * 0.6));
  return parts;
};
const mountains = (peaks: [number, number][], base = 0) =>
  poly([[-10.5, base], ...peaks, [10.5, base]]);
const tree = (x: number, h: number) => [
  poly([[x - h * 0.22, h * 0.18], [x + h * 0.22, h * 0.18], [x, h]]),
  poly([[x - h * 0.28, h * 0.05], [x + h * 0.28, h * 0.05], [x, h * 0.7]]),
  rect(x, h * 0.05, h * 0.1),
];
const tiers = (x: number, w: number, levels: number, lh: number) =>
  Array.from({ length: levels }, (_, i) => rect(x, w * (1 - i / (levels + 1)), lh, i * lh)).concat([
    spire(x, w * 0.2, lh * 2.2, levels * lh),
  ]);
const pagoda = (x: number, w: number, levels: number, lh: number) =>
  Array.from({ length: levels }, (_, i) => {
    const ww = w * (1 - i * 0.14);
    const y = i * lh;
    return [rect(x, ww * 0.6, lh * 0.7, y), poly([[x - ww * 0.65, y + lh * 0.62], [x + ww * 0.65, y + lh * 0.62], [x + ww * 0.4, y + lh], [x - ww * 0.4, y + lh]])];
  })
    .flat()
    .concat([spire(x, w * 0.08, lh * 1.4, levels * lh)]);
const skyline = (x0: number, x1: number, seed: number, hMin: number, hMax: number) => {
  let s = seed;
  const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  const out: Part[] = [];
  for (let x = x0; x < x1; ) {
    const w = 0.5 + r() * 0.9;
    out.push(rect(x + w / 2, w * 0.92, hMin + r() * (hMax - hMin)));
    x += w;
  }
  return out;
};
const sail = (x: number, w: number, h: number, flip = 1) =>
  poly([
    [x, 0],
    [x + w * flip, 0],
    [x + w * 0.15 * flip, h],
  ]);

export const SILHOUETTES: Record<string, () => Part[]> = {
  canada: () => [
    mountains([[-9, 2.5], [-6.5, 5.2], [-4.8, 3.6], [-2.5, 6.4], [0, 3.4], [2.6, 5.8], [5, 3.2], [7.5, 4.6], [9.5, 2.4]]),
    ...[-8, -6.9, -5.6, 3.8, 5.2, 6.4, 8.6].flatMap((x, i) => tree(x, 2.2 + (i % 3) * 0.6)),
  ],
  "united-kingdom": () => [
    rect(-3.2, 1.2, 7.2),
    rect(-3.2, 1.5, 1.4, 5.6),
    spire(-3.2, 1.3, 2.4, 7.2),
    ...skyline(-9, -4, 3, 1.4, 3),
    rect(1, 6, 2.6),
    ...[-1.4, 0, 1.4, 2.8].map((x) => spire(x, 0.4, 1.4, 2.6)),
    ...skyline(4.5, 10, 9, 1, 2.6),
  ],
  india: () => [
    rect(0, 7.5, 1),
    rect(0, 4.4, 2.6, 1),
    ...dome(0, 1.9, 3.4, 1.4),
    ...[-1.6, 1.6].flatMap((x) => dome(x, 0.5, 3.6, 0.5)),
    ...[-3.4, 3.4].flatMap((x) => [rect(x, 0.42, 5.2, 0), ...dome(x, 0.3, 5.2, 0.4)]),
  ],
  thailand: () => [
    ...tiers(0, 2.4, 6, 0.8),
    ...tiers(-3.2, 1.4, 5, 0.6),
    ...tiers(3.2, 1.4, 5, 0.6),
    rect(0, 10, 0.8),
  ],
  malaysia: () => [
    ...[-1.2, 1.2].flatMap((x) => [...tiers(x, 1.2, 9, 0.85), spire(x, 0.1, 2.2, 9.5)]),
    rect(0, 2.4, 0.3, 4.2),
    ...skyline(-9.5, -2.6, 5, 1, 3.5),
    ...skyline(2.6, 9.5, 7, 1, 3.2),
  ],
  "dubai-uae": () => [
    ...tiers(1.5, 1.5, 10, 0.95),
    spire(1.5, 0.12, 3, 10.4),
    ...skyline(-9, -1, 11, 1.2, 4),
    ...skyline(3, 9.5, 13, 1, 3.2),
  ],
  qatar: () => [
    ...skyline(-9.5, 9.5, 17, 1.2, 5),
    sail(-4, 2.2, 3.4),
    rect(-3, 3, 0.4),
  ],
  china: () => [
    ...pagoda(-3.6, 2.6, 6, 1),
    poly([[-10.5, 0], [-6, 1.6], [-3, 1], [0, 2.2], [3, 1.4], [6, 2.6], [10.5, 1.2], [10.5, 0]]),
    ...[-0.2, 3.1, 6.2].map((x) => rect(x, 0.8, 2.7 + (x > 5 ? 0.6 : 0))),
  ],
  japan: () => [
    poly([[-10.5, 0], [-5, 2.2], [-1.6, 5.6], [-0.8, 6.1], [0.1, 6.1], [0.9, 5.6], [4.6, 2.2], [10.5, 0]]),
    ...pagoda(5.4, 1.9, 5, 0.95),
  ],
  vietnam: () => [
    poly([[-10.5, 0], [-9.6, 4.6], [-8.4, 5.2], [-7.6, 2.4], [-6.8, 3.8], [-5.8, 0]]),
    poly([[-4.4, 0], [-3.8, 3.2], [-2.6, 3.6], [-2, 0]]),
    poly([[3, 0], [3.6, 5.4], [4.8, 6], [5.6, 2.2], [6.6, 4.4], [7.6, 0]]),
    poly([[8, 0], [8.6, 3], [9.8, 3.4], [10.5, 0]]),
    poly([[-1.4, 0.2], [1.6, 0.2], [1.2, -0.3], [-1, -0.3]]),
    sail(-0.6, 1.4, 2.6),
    sail(0.9, 0.9, 2, -1),
  ],
  nepal: () => [
    mountains([[-9.5, 3], [-7, 6.5], [-5.6, 5], [-3.2, 8.2], [-1.4, 6], [1.4, 7.4], [3.4, 5.2], [6, 7.8], [8.4, 4.6], [10, 3.4]]),
    rect(4, 3.2, 0.6),
    ...dome(4, 1.1, 0.6),
    rect(4, 0.5, 0.6, 1.6),
    spire(4, 0.6, 1.8, 2.2),
  ],
  indonesia: () => [
    poly([[-10.5, 0], [-6, 1.8], [-3.6, 6], [-2.4, 6], [0.4, 1.8], [4, 0]]),
    ...tiers(4.4, 3.8, 5, 0.65),
    ...[2.2, 6.6].flatMap((x) => tiers(x, 1, 3, 0.5)),
  ],
  "united-states": () => [
    ...skyline(-9.5, 9.5, 23, 1.4, 4.2),
    ...tiers(-1, 1.6, 7, 1.1),
    spire(-1, 0.15, 2, 7.7),
    ...tiers(3.4, 1.4, 6, 1),
  ],
  australia: () => [
    rect(0, 9, 0.9),
    ...[
      [-3, 2.6, 4.2, 1],
      [-1.2, 2.4, 3.6, 1],
      [0.6, 2.2, 3, 1],
      [2.2, 2.2, 3.8, -1],
      [3.8, 1.8, 3, -1],
    ].map(([x, w, h, f]) => {
      const s = new THREE.Shape();
      s.moveTo(x, 0.9);
      s.lineTo(x + w * f, 0.9);
      s.quadraticCurveTo(x + w * 0.2 * f, 0.9 + h * 0.6, x - w * 0.15 * f, 0.9 + h);
      s.closePath();
      return s;
    }),
    ...skyline(-9.5, -5, 31, 1, 3),
  ],
};

export function silhouetteGeometry(slug: string, depth = 0.25) {
  const parts = (SILHOUETTES[slug] ?? SILHOUETTES.canada)();
  const geos = parts.map((s) => new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: false, curveSegments: 10 }));
  const merged = mergeGeometries(geos, false)!;
  geos.forEach((g) => g.dispose());
  return merged;
}

/** Foreground atmosphere for each destination. */
export const ATMOSPHERE: Record<string, { fore: "palms" | "clouds" | "lanterns" | "haze"; tint: string; glow: string }> = {
  canada: { fore: "clouds", tint: "#1d3048", glow: "#f2c08a" },
  "united-kingdom": { fore: "clouds", tint: "#262a3a", glow: "#e8c49a" },
  india: { fore: "haze", tint: "#3a2a2c", glow: "#ffbf7a" },
  thailand: { fore: "palms", tint: "#2a2234", glow: "#ffc06e" },
  malaysia: { fore: "palms", tint: "#1b2a3a", glow: "#ffb98a" },
  "dubai-uae": { fore: "haze", tint: "#3a2a24", glow: "#ffcb86" },
  qatar: { fore: "haze", tint: "#2e2a30", glow: "#ffc48f" },
  china: { fore: "lanterns", tint: "#2b1f28", glow: "#ff9c6a" },
  japan: { fore: "lanterns", tint: "#231f33", glow: "#ffb2a0" },
  vietnam: { fore: "lanterns", tint: "#1c2a33", glow: "#ffbb7a" },
  nepal: { fore: "clouds", tint: "#1e2a40", glow: "#ffd2a6" },
  indonesia: { fore: "palms", tint: "#2a2430", glow: "#ffb070" },
  "united-states": { fore: "clouds", tint: "#1f2638", glow: "#f6c48e" },
  australia: { fore: "haze", tint: "#20283a", glow: "#ffc28a" },
};
