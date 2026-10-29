"""Render the static globe fallback (reduced motion / no WebGL / loading).

Usage: python3 -I scripts/generate-static-globe.py
Reads public/globe/land-points.json and the markers in
src/content/destinations.ts, writes public/images/globe/static.png.
"""
import json, math, re, os
from PIL import Image, ImageDraw, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
S = 1280          # output size
R = S * 0.36      # globe radius in px
C = S / 2
pts = json.load(open(os.path.join(ROOT, "public/globe/land-points.json")))
src = open(os.path.join(ROOT, "src/content/destinations.ts")).read()
markers = [(float(a), float(b)) for a, b in re.findall(r"marker: \{ lat: (-?[\d.]+), lng: (-?[\d.]+)", src)]
ORIGIN = (9.6615, 80.0255)
CENTER = (ORIGIN[0] + 8, ORIGIN[1] - 25)

def xyz(lat, lng, r=1.0):
    phi, th = math.radians(90 - lat), math.radians(lng + 180)
    return (-r * math.sin(phi) * math.cos(th), r * math.cos(phi), r * math.sin(phi) * math.sin(th))

# rotation that brings CENTER to face +z (matches facingRotation in lib/geo.ts)
x0, _, z0 = xyz(0, CENTER[1])
ry = -math.atan2(x0, z0)
rx = max(-0.6, min(0.6, math.radians(CENTER[0])))

def rot(p):
    x, y, z = p
    x, z = x * math.cos(ry) + z * math.sin(ry), -x * math.sin(ry) + z * math.cos(ry)
    y, z = y * math.cos(rx) - z * math.sin(rx), y * math.sin(rx) + z * math.cos(rx)
    return x, y, z

def proj(p):
    x, y, z = rot(p)
    return C + x * R, C - y * R, z

img = Image.new("RGBA", (S, S), (0, 0, 0, 0))
glow = Image.new("RGBA", (S, S), (0, 0, 0, 0))
ImageDraw.Draw(glow).ellipse([C - R * 1.08, C - R * 1.08, C + R * 1.08, C + R * 1.08], fill=(127, 166, 230, 90))
glow = glow.filter(ImageFilter.GaussianBlur(S * 0.03))
img.alpha_composite(glow)
d = ImageDraw.Draw(img)
d.ellipse([C - R, C - R, C + R, C + R], fill=(12, 26, 51, 255))

for i in range(0, len(pts), 2):
    x, y, z = proj(xyz(pts[i], pts[i + 1]))
    if z > 0:
        a = int(200 * min(1, z * 1.6))
        rr = 1.6
        d.ellipse([x - rr, y - rr, x + rr, y + rr], fill=(244, 238, 226, a))

def arc(a, b, n=72):
    va, vb = xyz(*a), xyz(*b)
    dot = max(-1, min(1, sum(p * q for p, q in zip(va, vb))))
    om = math.acos(dot)
    lift = 0.06 + om * 0.22
    out = []
    for i in range(n + 1):
        t = i / n
        s = math.sin(om) or 1
        k1, k2 = math.sin((1 - t) * om) / s, math.sin(t * om) / s
        h = 1 + math.sin(math.pi * t) * lift
        out.append(tuple((va[j] * k1 + vb[j] * k2) * h for j in range(3)))
    return out

layer = Image.new("RGBA", (S, S), (0, 0, 0, 0))
ld = ImageDraw.Draw(layer)
for m in markers:
    seg = [proj(p) for p in arc(ORIGIN, m)]
    for (x1, y1, z1), (x2, y2, z2) in zip(seg, seg[1:]):
        # hide parts of arcs that pass behind the globe
        behind = z1 < 0 and math.hypot(x1 - C, y1 - C) < R
        if not behind:
            ld.line([x1, y1, x2, y2], fill=(227, 180, 103, 150), width=2)
    x, y, z = proj(xyz(*m, 1.004))
    if z > 0:
        ld.ellipse([x - 4, y - 4, x + 4, y + 4], fill=(244, 238, 226, 255))
img.alpha_composite(layer)
x, y, _ = proj(xyz(*ORIGIN, 1.004))
d = ImageDraw.Draw(img)
d.ellipse([x - 16, y - 16, x + 16, y + 16], outline=(227, 180, 103, 160), width=2)
d.ellipse([x - 7, y - 7, x + 7, y + 7], fill=(227, 180, 103, 255))
os.makedirs(os.path.join(ROOT, "public/images/globe"), exist_ok=True)
img.save(os.path.join(ROOT, "public/images/globe/static.png"), optimize=True)
print("markers", len(markers))
