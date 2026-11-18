"""Builds the three pictures the Solar Home block uses (public/zk/) from a day photo and a night photo of the same house.

  solarhome-photo.jpg      the day photo
  solarhome-night-lit.jpg  the night photo, lined up with the day photo (lights on)
  solarhome-night.jpg      the same night photo with the light behind every window glass dimmed (lights off)

The page fades from the day photo to "night", then fades "night-lit" back in through a clip around each window, so the lit glass blinks
while everything else stays still. Because the two night pictures only differ inside the glass, the clips can be rough. The glass of each
window is listed in GLASS below; the same list (clip polygons) is in src/lib/neon-house.ts: keep them in step. Needs Pillow.

The night photo was not framed exactly like the day photo: it is a little smaller and shifted. ALIGN maps day coordinates to night
coordinates (x_n = a*x_d + tx, y_n = b*y_d + ty); it was found by matching the outlines of the two photos. Change it if you use other photos.

Usage: python3 tools/solar-home-photos.py <day photo> <night photo> <output folder, e.g. public/zk>"""
import sys
from PIL import Image, ImageDraw, ImageFilter

day_path, night_path, out = sys.argv[1], sys.argv[2], sys.argv[3]
ALIGN = (0.92, 0.906, 76.0, 51.5)
OUT_SIZE = (1280, 721)  # the pictures are saved smaller than the 1671 x 941 originals (the block never shows them wider than about 1300px)

# the glass of each window on the day photo (x, y at the day photo's own size)
GLASS = [
    [(492, 354), (600, 341), (600, 482), (492, 485)],        # upper left
    [(741, 336), (998, 309), (998, 459), (741, 467)],        # upper middle (balcony)
    [(1186, 301), (1218, 307), (1218, 396), (1186, 396)],    # upper, narrow
    [(1276, 329), (1331, 338), (1331, 412), (1276, 408)],    # upper right
    [(461, 582), (764, 577), (764, 794), (461, 791)],        # lower left (sliding doors)
    [(925, 573), (1030, 572), (1030, 800), (925, 800)],      # lower middle
    [(1294, 575), (1352, 574), (1352, 806), (1294, 806)],    # lower right 1
    [(1425, 588), (1470, 592), (1470, 803), (1425, 806)],    # lower right 2
]
DIM = 0.22      # how much of its light a dimmed window keeps
LIT_FROM, LIT_RANGE = 55, 45   # brightness (0-255) where a pixel starts to count as light, and how fast it counts fully

day = Image.open(day_path).convert("RGB")
W, H = day.size
night_src = Image.open(night_path).convert("RGB")
a, b, tx, ty = ALIGN
night = night_src.transform((W, H), Image.AFFINE, (a, 0, tx, 0, b, ty), Image.BICUBIC)  # now in day coordinates

# anti-aliased mask of the glass areas (drawn at 4x)
S = 4
poly = Image.new("L", (W * S, H * S), 0)
d = ImageDraw.Draw(poly)
for p in GLASS:
    d.polygon([(x * S, y * S) for x, y in p], fill=255)
poly = poly.resize((W, H), Image.LANCZOS)
pp = poly.load()

# night, lights off: inside the glass every bit of light is turned down in proportion to how bright it is (frames, railings stay as they are)
off = night.copy()
op, npx = off.load(), night.load()
for y in range(H):
    for x in range(W):
        m = pp[x, y]
        if not m:
            continue
        r, g, bl = npx[x, y]
        lum = 0.299 * r + 0.587 * g + 0.114 * bl
        k = max(0.0, min(1.0, (lum - LIT_FROM) / LIT_RANGE)) * (m / 255.0) * (1 - DIM)
        op[x, y] = (int(r * (1 - k)), int(g * (1 - k)), int(bl * (1 - k)))

def save(im, name):
    im.resize(OUT_SIZE, Image.LANCZOS).save(out + "/" + name, "JPEG", quality=78, optimize=True, progressive=True)
save(day, "solarhome-photo.jpg")
save(night, "solarhome-night-lit.jpg")
save(off, "solarhome-night.jpg")
print("saved 3 pictures to", out)
