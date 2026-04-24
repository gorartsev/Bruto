"""Generate BRUTE app icons — Ink black + bone BRUTE wordmark + blood accent."""
from PIL import Image, ImageDraw, ImageFont
import os, random

INK = (10, 10, 10)
BONE = (244, 236, 216)
BLOOD = (179, 18, 26)
SMOKE = (42, 42, 42)

FONT_PATH = r"C:\Windows\Fonts\impact.ttf"

def halftone(img, opacity=28):
    """Overlay subtle halftone dot pattern."""
    w, h = img.size
    overlay = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(overlay)
    step = max(6, w // 80)
    r = step * 0.12
    for y in range(0, h, step):
        for x in range(0, w, step):
            d.ellipse((x - r, y - r, x + r, y + r), fill=(255, 255, 255, opacity))
    return Image.alpha_composite(img.convert("RGBA"), overlay)

def rough_rect(draw, box, color, jitter=2):
    """Rectangle with slightly jittered edges to feel hand-painted."""
    x1, y1, x2, y2 = box
    pts = []
    steps = 24
    for i in range(steps):
        pts.append((x1 + (x2 - x1) * i / steps, y1 + random.uniform(-jitter, jitter)))
    for i in range(steps):
        pts.append((x2 + random.uniform(-jitter, jitter), y1 + (y2 - y1) * i / steps))
    for i in range(steps):
        pts.append((x2 - (x2 - x1) * i / steps, y2 + random.uniform(-jitter, jitter)))
    for i in range(steps):
        pts.append((x1 + random.uniform(-jitter, jitter), y2 - (y2 - y1) * i / steps))
    draw.polygon(pts, fill=color)

def make_icon(size, out_path, full_bleed=True):
    random.seed(42)
    img = Image.new("RGBA", (size, size), INK)
    d = ImageDraw.Draw(img)

    # safe area (iOS auto-crops, keep content inset)
    inset = int(size * 0.14)
    inner = size - inset * 2

    # red brush slab behind wordmark
    slab_h = int(inner * 0.42)
    slab_y = inset + int(inner * 0.30)
    rough_rect(d, (inset + int(inner * 0.04), slab_y,
                   inset + inner - int(inner * 0.04), slab_y + slab_h),
               BLOOD, jitter=int(size * 0.008))

    # BRUTE wordmark (Impact for thick condensed vibe)
    text = "BRUTE"
    # Find font size that fits
    font_size = int(slab_h * 0.82)
    while True:
        font = ImageFont.truetype(FONT_PATH, font_size)
        bbox = d.textbbox((0, 0), text, font=font)
        tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
        if tw <= inner * 0.88 and th <= slab_h * 0.80:
            break
        font_size -= 2
        if font_size < 20:
            break

    tx = (size - tw) / 2 - bbox[0]
    ty = slab_y + (slab_h - th) / 2 - bbox[1]
    d.text((tx, ty), text, font=font, fill=BONE)

    # period accent
    dot_r = int(size * 0.022)
    dot_x = tx + tw + int(size * 0.015)
    dot_y = ty + th - dot_r
    d.ellipse((dot_x, dot_y, dot_x + dot_r * 2, dot_y + dot_r * 2), fill=BONE)

    # three rough divider rules below
    rule_y = slab_y + slab_h + int(inner * 0.08)
    widths = [0.70, 0.45, 0.60]
    for i, wfrac in enumerate(widths):
        rw = int(inner * wfrac)
        rx = inset + (inner - rw) // 2
        ry = rule_y + i * int(size * 0.018)
        rough_rect(d, (rx, ry, rx + rw, ry + int(size * 0.008)),
                   BONE, jitter=int(size * 0.003))

    # small tick marks top
    tick_y = inset + int(inner * 0.05)
    for i in range(6):
        tx2 = inset + int(inner * (0.10 + i * 0.16))
        rough_rect(d, (tx2, tick_y, tx2 + int(size * 0.014), tick_y + int(size * 0.04)),
                   BONE, jitter=int(size * 0.002))

    img = halftone(img, opacity=22)

    img.convert("RGB").save(out_path, "PNG", optimize=True)
    print(f"wrote {out_path} ({size}x{size})")

if __name__ == "__main__":
    out = os.path.dirname(os.path.abspath(__file__))
    make_icon(180, os.path.join(out, "icon-180.png"))
    make_icon(192, os.path.join(out, "icon-192.png"))
    make_icon(512, os.path.join(out, "icon-512.png"))
    make_icon(1024, os.path.join(out, "icon-1024.png"))
