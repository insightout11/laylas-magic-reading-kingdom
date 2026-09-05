"""Generate the PWA icons in the app's felt/sticker style.

Drawn rather than exported so the icon matches the art direction: pastel
ground, chunky rounded crown, thick white sticker border, soft shadow.
Rendered at 4x and downsampled so the curves stay clean at 48px.

    python tools/make-icons.py

Outputs into icons/:  192, 512, maskable-512, apple-touch-180
"""
import math
import os
from PIL import Image, ImageDraw

OUT = os.path.join(os.path.dirname(__file__), "..", "icons")
SS = 4  # supersample factor

CREAM = (255, 233, 206)
BUTTER = (251, 216, 129)
BUTTER_D = (237, 182, 62)
PINK = (247, 166, 196)
PINK_D = (222, 116, 156)
LILAC = (188, 163, 238)
LILAC_L = (222, 208, 250)
WHITE = (255, 253, 248)
PLUM = (110, 78, 124)
ROSE = (242, 122, 141)


def lerp(a, b, t):
    return tuple(int(round(a[i] + (b[i] - a[i]) * t)) for i in range(3))


def ground(size, pad_ratio):
    """Soft diagonal pastel wash, full-bleed (safe for maskable)."""
    img = Image.new("RGB", (size, size), LILAC_L)
    d = ImageDraw.Draw(img)
    for y in range(size):
        t = y / max(1, size - 1)
        d.line([(0, y), (size, y)], fill=lerp(LILAC_L, PINK, t * 0.85))
    return img


def star(d, cx, cy, r, fill, outline=None, width=0, rot=-90):
    pts = []
    for i in range(10):
        rr = r if i % 2 == 0 else r * 0.44
        a = math.radians(rot + i * 36)
        pts.append((cx + math.cos(a) * rr, cy + math.sin(a) * rr))
    d.polygon(pts, fill=fill, outline=outline, width=width)


def draw_crown(d, size, pad):
    """A chunky felt crown with a white die-cut border."""
    w = size - pad * 2
    left, right = pad, size - pad
    base_top = pad + w * 0.52
    base_bot = pad + w * 0.86
    peak_y = pad + w * 0.10
    dip_y = pad + w * 0.40
    mid = size / 2

    # crown silhouette: three peaks with rounded valleys
    body = [
        (left, base_bot),
        (left, dip_y + w * 0.06),
        (left + w * 0.16, peak_y + w * 0.06),
        (left + w * 0.30, dip_y),
        (mid, peak_y),
        (right - w * 0.30, dip_y),
        (right - w * 0.16, peak_y + w * 0.06),
        (right, dip_y + w * 0.06),
        (right, base_bot),
    ]
    stroke = max(2, int(w * 0.055))
    # white sticker border drawn first, underneath
    d.polygon(body, fill=WHITE, outline=WHITE, width=stroke * 2)
    d.polygon(body, fill=BUTTER, outline=BUTTER_D, width=max(1, stroke // 2))

    # jewelled band
    band_top = base_top + w * 0.02
    band_bot = band_top + w * 0.17
    d.rounded_rectangle(
        [left + w * 0.02, band_top, right - w * 0.02, band_bot],
        radius=w * 0.06, fill=PINK, outline=WHITE, width=max(2, stroke // 2),
    )
    # gems on the band
    for i, col in enumerate((ROSE, LILAC, ROSE)):
        gx = left + w * (0.24 + i * 0.26)
        gy = (band_top + band_bot) / 2
        r = w * 0.055
        d.ellipse([gx - r, gy - r, gx + r, gy + r], fill=col, outline=WHITE,
                  width=max(1, stroke // 3))

    # stitching across the crown body
    sy = base_top - w * 0.06
    dash = w * 0.05
    x = left + w * 0.10
    while x < right - w * 0.10:
        d.line([(x, sy), (x + dash * 0.55, sy)], fill=WHITE, width=max(2, stroke // 3))
        x += dash

    # peak finials
    for px in (left + w * 0.16, mid, right - w * 0.16):
        py = peak_y + (w * 0.06 if px != mid else 0)
        r = w * 0.055
        d.ellipse([px - r, py - r, px + r, py + r], fill=WHITE, outline=BUTTER_D,
                  width=max(1, stroke // 3))


def build(size, maskable=False):
    S = size * SS
    img = ground(S, 0).convert("RGBA")
    d = ImageDraw.Draw(img)

    # maskable icons must keep content inside the middle ~80%
    pad = S * (0.26 if maskable else 0.16)

    # sparkles in the corners, behind the crown
    for (fx, fy, fr) in ((0.16, 0.20, 0.05), (0.85, 0.26, 0.038), (0.78, 0.82, 0.045)):
        if maskable and (fx < 0.25 or fx > 0.8):
            continue
        star(d, S * fx, S * fy, S * fr, WHITE)

    draw_crown(d, S, pad)

    if not maskable:
        # rounded-square mask so it looks tidy where the OS doesn't mask
        mask = Image.new("L", (S, S), 0)
        ImageDraw.Draw(mask).rounded_rectangle([0, 0, S, S], radius=S * 0.22, fill=255)
        img.putalpha(mask)

    return img.resize((size, size), Image.LANCZOS)


def main():
    os.makedirs(OUT, exist_ok=True)
    jobs = [
        ("icon-192.png", 192, False),
        ("icon-512.png", 512, False),
        ("icon-maskable-512.png", 512, True),
        ("apple-touch-icon.png", 180, False),
    ]
    for name, size, maskable in jobs:
        img = build(size, maskable)
        path = os.path.join(OUT, name)
        img.save(path, "PNG", optimize=True)
        print("  wrote %-26s %dx%d  %d bytes" % (name, size, size, os.path.getsize(path)))


if __name__ == "__main__":
    main()
