"""Builds the Earth texture and the Sri Lanka terrain maps from Natural Earth
data (public domain, via the world-atlas npm package; see scripts/extract-geo.cjs).
The island's relief is stylised: real coastline, with the central highlands
modelled as smooth rises around their approximate locations.
Usage: python3 scripts/generate-geo-art.py <dir with geojson> <public dir>
"""
import json, math, sys, random
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

src, pub = sys.argv[1], sys.argv[2]
random.seed(4)

def polys(geom):
    if geom["type"] == "Polygon":
        return [geom["coordinates"]]
    return geom["coordinates"]

# ---------- Earth texture (equirectangular) ----------
W, H = 2048, 1024
land = json.load(open(f"{src}/land-50m.geojson"))
mask = Image.new("L", (W, H), 0)
d = ImageDraw.Draw(mask)
for f in land["features"]:
    for poly in polys(f["geometry"]):
        for k, ring in enumerate(poly):
            # unwrap longitudes so rings crossing the antimeridian stay continuous
            un, prev = [], None
            for lng, lat in ring:
                if prev is not None:
                    while lng - prev > 180: lng -= 360
                    while lng - prev < -180: lng += 360
                un.append((lng, lat)); prev = lng
            span = max(p[0] for p in un) - min(p[0] for p in un)
            if span > 350 and abs(un[0][0] - un[-1][0]) > 180:
                # a ring that wraps the globe (Antarctica): close it through the pole
                un = un + [(un[-1][0], -90), (un[0][0], -90)]
            for off in (-360, 0, 360):
                pts = [((lng + off + 180) / 360 * W, (90 - lat) / 180 * H) for lng, lat in un]
                d.polygon(pts, fill=0 if k else 255)
m = np.asarray(mask, dtype=np.float32) / 255
yy = np.linspace(90, -90, H)[:, None] * np.ones((1, W))
absl = np.abs(yy)
noise = np.asarray(Image.effect_noise((W // 4, H // 4), 64).resize((W, H), Image.BICUBIC), dtype=np.float32) / 255
fine = np.asarray(Image.effect_noise((W, H), 40), dtype=np.float32) / 255
# land palette by latitude: arid belts warmer, temperate greener, polar pale
green = np.array([62, 84, 58]); arid = np.array([150, 128, 92]); polar = np.array([210, 214, 218]); forest = np.array([40, 66, 46])
aridness = np.exp(-((absl - 24) / 9) ** 2) * (0.55 + 0.6 * noise)
tropic = np.exp(-((absl - 2) / 12) ** 2)
col = green * (1 - aridness[..., None]) + arid * aridness[..., None]
col = col * (1 - tropic[..., None] * 0.6) + forest * (tropic[..., None] * 0.6)
pol = np.clip((absl - 68) / 8, 0, 1)
col = col * (1 - pol[..., None]) + polar * pol[..., None]
col *= (0.85 + 0.3 * fine[..., None] * 0.5 + 0.15 * noise[..., None])
# ocean: deep navy with lighter shelf near coasts
shelf = np.asarray(mask.filter(ImageFilter.GaussianBlur(6)), dtype=np.float32) / 255
ocean = np.array([12, 30, 58]) * (1 - shelf[..., None]) + np.array([26, 62, 92]) * shelf[..., None]
img = col * m[..., None] + ocean * (1 - m[..., None])
Image.fromarray(np.clip(img, 0, 255).astype(np.uint8)).save(f"{pub}/globe/earth.jpg", quality=86)
# roughness: water glossy, land matte (greyscale)
Image.fromarray((m * 200 + 40).astype(np.uint8)).resize((1024, 512)).save(f"{pub}/globe/earth-rough.jpg", quality=80)
print("earth done")

# ---------- Sri Lanka ----------
lk = json.load(open(f"{src}/sri-lanka.geojson"))
LNG0, LNG1, LAT0, LAT1 = 79.45, 82.05, 5.75, 10.05
SW, SH = 640, 1060  # ~ equal-area at this latitude
def px(lng, lat):
    return ((lng - LNG0) / (LNG1 - LNG0) * SW, (LAT1 - lat) / (LAT1 - LAT0) * SH)
isl = Image.new("L", (SW, SH), 0)
di = ImageDraw.Draw(isl)
outline = []
for poly in polys(lk):
    ring = poly[0]
    di.polygon([px(*p) for p in ring], fill=255)
    outline.append([[round(p[0], 4), round(p[1], 4)] for p in ring])
json.dump({"bbox": [LNG0, LAT0, LNG1, LAT1], "rings": outline}, open(f"{pub}/geo/sri-lanka.json", "w"), separators=(",", ":"))
mk = np.asarray(isl, dtype=np.float32) / 255
inland = np.asarray(isl.filter(ImageFilter.GaussianBlur(14)), dtype=np.float32) / 255
lng = LNG0 + (np.arange(SW) + 0.5) / SW * (LNG1 - LNG0)
lat = LAT1 - (np.arange(SH) + 0.5) / SH * (LAT1 - LAT0)
LG, LT = np.meshgrid(lng, lat)
def bump(la, lo, s, h):
    return h * np.exp(-(((LT - la) / s) ** 2 + ((LG - lo) / (s * 0.9)) ** 2))
relief = (bump(6.95, 80.78, 0.42, 1.0) + bump(7.42, 80.8, 0.16, 0.45) + bump(6.7, 80.5, 0.22, 0.45)
          + bump(6.85, 81.0, 0.25, 0.35) + bump(7.25, 80.55, 0.3, 0.25))
rough = np.asarray(Image.effect_noise((SW // 40, SH // 40), 90).resize((SW, SH), Image.BICUBIC).filter(ImageFilter.GaussianBlur(6)), dtype=np.float32) / 255
rough = (rough - rough.min()) / (rough.max() - rough.min() + 1e-6)
hgt = np.clip(inland, 0, 1) ** 1.4 * 0.08 + relief * (0.75 + 0.5 * rough) * mk
hgt = np.clip(hgt, 0, None)
hgt /= hgt.max()
hgt *= mk
Image.fromarray((hgt * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.2)).save(f"{pub}/images/scenes/lanka-height.png")
# colour with baked hillshade
gy, gx = np.gradient(hgt * 60)
shade = np.clip(0.9 + (-gx * 0.35 + gy * 0.45), 0.6, 1.2)
sand = np.array([214, 196, 156]); low = np.array([86, 120, 72]); mid = np.array([58, 92, 58]); high = np.array([92, 98, 84])
coast = np.clip(1 - inland * 2.2, 0, 1) ** 2
c = low * (1 - coast[..., None]) + sand * coast[..., None]
c = c * (1 - np.clip(hgt * 3, 0, 1)[..., None]) + mid * np.clip(hgt * 3, 0, 1)[..., None]
c = c * (1 - np.clip(hgt * 2 - 1, 0, 1)[..., None]) + high * np.clip(hgt * 2 - 1, 0, 1)[..., None]
c = c * shade[..., None] * (0.92 + 0.12 * rough[..., None])
rgba = np.dstack([np.clip(c, 0, 255), mk * 255]).astype(np.uint8)
Image.fromarray(rgba, "RGBA").save(f"{pub}/images/scenes/lanka-color.png")
shallow = isl.filter(ImageFilter.MaxFilter(9)).filter(ImageFilter.GaussianBlur(22))
shallow.save(f"{pub}/images/scenes/lanka-shallow.png")
print("lanka done", SW, SH)
