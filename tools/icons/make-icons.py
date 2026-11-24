"""Renders every app, web and store icon from one drawing: a licence card with the holder's photo and a check.

Run from the repository root (needs Python with Playwright and Pillow, and Chrome):
    python3 tools/icons/make-icons.py [path-to-chrome]
Outputs overwrite the files the apps, the website and the stores use. The drawing lives in GLYPH below and in
store/icon/pal-test-icon.svg; the app header draws the same paths (LogoGlyph in app/src/components/ui.tsx).
"""
import io
import sys
from pathlib import Path

from PIL import Image
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[2]
CHROME = sys.argv[1] if len(sys.argv) > 1 else "/usr/bin/google-chrome"

GLYPH = """
  <rect x="186" y="292" width="652" height="440" rx="72"/>
  <circle cx="366" cy="462" r="58"/>
  <path d="M270 640 c14-64 56-96 96-96 s82 32 96 96"/>
  <path d="M548 520 L614 586 L730 470"/>
  <path d="M556 662 H730"/>"""
GRADIENT = ('<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7B6CF0"/>'
            '<stop offset="1" stop-color="#4433C2"/></linearGradient></defs>')


def svg(scale=1.0, colour="#FFFFFF", tile=True, radius=0):
    """1024 x 1024: the glyph scaled about the centre, optionally on the gradient tile (with rounded corners)."""
    bg = f'{GRADIENT}<rect width="1024" height="1024" rx="{radius}" fill="url(#g)"/>' if tile else ""
    return (f'<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">{bg}'
            f'<g transform="translate(512 512) scale({scale}) translate(-512 -512)" fill="none" stroke="{colour}" '
            f'stroke-width="54" stroke-linecap="round" stroke-linejoin="round">{GLYPH}\n</g></svg>')


# path -> (svg, size, keep transparency)
OUT = {
    "store/icon/pal-test-icon.svg": None,
    "app/assets/images/icon.png": (svg(), 1024, False),
    "store/icon/app-store-1024.png": (svg(), 1024, False),
    "store/icon/play-store-512.png": (svg(), 512, False),
    "store/play/app-icon-512.png": (svg(), 512, False),
    "app/public/icon-512.png": (svg(), 512, False),
    "app/public/icon-192.png": (svg(), 192, False),
    "app/public/apple-touch-icon.png": (svg(), 180, False),
    "app/assets/images/favicon.png": (svg(scale=1.08, radius=230), 48, True),
    # Android adaptive icon: the glyph alone, inside the 66% safe circle; the gradient is the background layer.
    "app/assets/images/android-icon-foreground.png": (svg(scale=0.75, tile=False), 512, True),
    "app/assets/images/android-icon-monochrome.png": (svg(scale=0.75, tile=False), 432, True),
    # Splash: the glyph in brand indigo on the light splash background.
    "app/assets/images/splash-icon.png": (svg(scale=0.95, colour="#5A4BD6", tile=False), 1024, True),
}

(ROOT / "store/icon/pal-test-icon.svg").write_text(svg() + "\n")
with sync_playwright() as p:
    browser = p.chromium.launch(executable_path=CHROME)
    page = browser.new_page(viewport={"width": 1024, "height": 1024})
    for rel, spec in OUT.items():
        if spec is None:
            continue
        source, size, transparent = spec
        page.set_content(f'<html><body style="margin:0;background:transparent">{source}</body></html>')
        png = page.screenshot(omit_background=transparent, clip={"x": 0, "y": 0, "width": 1024, "height": 1024})
        im = Image.open(io.BytesIO(png)).convert("RGBA" if transparent else "RGB")
        im.resize((size, size), Image.LANCZOS).save(ROOT / rel)
        print(f"{rel}  {size}x{size}")
    browser.close()
