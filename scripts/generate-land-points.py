"""Generate the dotted-globe land points from a water mask (white = water).

Usage: python3 -I scripts/generate-land-points.py <earth-water.png> public/globe/land-points.json
The mask used is three-globe's example earth-water.png (MIT, NASA-derived).
"""
import json, math, sys
from PIL import Image

src, out = sys.argv[1], sys.argv[2]
im = Image.open(src).convert("L")
w, h = im.size
ROWS = 150  # latitude rows; spacing kept roughly equal-area
pts = []
for r in range(ROWS):
    lat = 90 - (r + 0.5) * 180 / ROWS
    count = max(1, int(round(2 * ROWS * math.cos(math.radians(lat)))))
    for c in range(count):
        lng = -180 + (c + 0.5) * 360 / count
        x = int((lng + 180) / 360 * (w - 1))
        y = int((90 - lat) / 180 * (h - 1))
        if im.getpixel((x, y)) < 128:
            pts += [round(lat, 1), round(lng, 1)]
with open(out, "w") as f:
    json.dump(pts, f, separators=(",", ":"))
print(len(pts) // 2, "points")
