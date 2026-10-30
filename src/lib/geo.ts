const DEG = Math.PI / 180;

/** Same convention as three-globe: y is up, longitude 0 faces -x/+z split. */
export function latLngToXYZ(lat: number, lng: number, r = 1): [number, number, number] {
  const phi = (90 - lat) * DEG;
  const theta = (lng + 180) * DEG;
  return [-r * Math.sin(phi) * Math.cos(theta), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(theta)];
}

/** Great-circle distance in kilometres. */
export function distanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const dLat = (b.lat - a.lat) * DEG;
  const dLng = (b.lng - a.lng) * DEG;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * DEG) * Math.cos(b.lat * DEG) * Math.sin(dLng / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
}

/**
 * Points along the great circle from a to b, lifted off the surface in an
 * arc whose height grows with distance.
 */
export function arcPoints(a: { lat: number; lng: number }, b: { lat: number; lng: number }, segments = 64, r = 1) {
  const va = latLngToXYZ(a.lat, a.lng, 1);
  const vb = latLngToXYZ(b.lat, b.lng, 1);
  const dot = Math.min(1, Math.max(-1, va[0] * vb[0] + va[1] * vb[1] + va[2] * vb[2]));
  const omega = Math.acos(dot);
  const lift = 0.06 + omega * 0.22;
  const out: [number, number, number][] = [];
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const s = Math.sin(omega) || 1;
    const k1 = Math.sin((1 - t) * omega) / s;
    const k2 = Math.sin(t * omega) / s;
    const h = r * (1 + Math.sin(Math.PI * t) * lift);
    out.push([(va[0] * k1 + vb[0] * k2) * h, (va[1] * k1 + vb[1] * k2) * h, (va[2] * k1 + vb[2] * k2) * h]);
  }
  return out;
}

/** Globe rotation (x, y) that brings a lat/lng to face the camera on +z. */
export function facingRotation(lat: number, lng: number) {
  const [x, , z] = latLngToXYZ(0, lng, 1);
  return { y: -Math.atan2(x, z), x: Math.max(-0.6, Math.min(0.6, lat * DEG)) };
}
