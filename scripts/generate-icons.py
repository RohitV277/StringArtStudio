"""Regenerates every app icon and the splash screen. Needs Pillow:  pip install pillow   Run: npm run icons"""
import math
from pathlib import Path
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parent.parent

def icon(size, safe=0.34):
    s = 4; n = size * s
    im = Image.new('RGB', (n, n)); d0 = ImageDraw.Draw(im)
    for y in range(0, n, max(1, n // 256)):
        t = y / n
        d0.rectangle([0, y, n, y + n // 256 + 1], fill=(int(30 + 10 * (1 - t)), int(34 + 8 * (1 - t)), int(52 + 20 * (1 - t))))
    d = ImageDraw.Draw(im); c = n / 2; r = n * safe; count = 72
    pts = [(c + r * math.sin(2 * math.pi * i / count), c - r * math.cos(2 * math.pi * i / count)) for i in range(count)]
    for k, col, w in ((31, (255, 179, 0), n // 420), (23, (255, 106, 92), n // 520), (11, (255, 255, 255), n // 560)):
        for i in range(count):
            d.line([pts[i], pts[(i * k) % count]], fill=col, width=max(2, w))
    d.ellipse([c - r - n / 90, c - r - n / 90, c + r + n / 90, c + r + n / 90], outline=(235, 235, 240), width=max(2, n // 300))
    for p in pts:
        d.ellipse([p[0] - n / 190, p[1] - n / 190, p[0] + n / 190, p[1] + n / 190], fill=(245, 245, 245))
    return im.resize((size, size), Image.LANCZOS)

targets = [('public/icons/icon-1024.png', 1024, .36), ('public/icons/icon-512.png', 512, .30), ('public/icons/icon-192.png', 192, .30),
           ('public/icons/apple-touch-icon.png', 180, .36), ('public/icons/favicon-32.png', 32, .36), ('assets/icon-only.png', 1024, .36)]
for name, size, safe in targets:
    p = ROOT / name; p.parent.mkdir(parents=True, exist_ok=True); icon(size, safe).save(p)
splash = Image.new('RGB', (2732, 2732), (20, 22, 32)); splash.paste(icon(900, .36), ((2732 - 900) // 2, (2732 - 900) // 2))
splash.save(ROOT / 'assets/splash.png'); splash.save(ROOT / 'assets/splash-dark.png')
print('Icons written.')
