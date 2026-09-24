"""Prepares site imagery from the original site's assets (../assets). Requires Pillow and numpy.
Run: python scripts/build-images.py

1. Customer logos (../assets/customers): the supplied files carry very different amounts of
   empty canvas (Fiem's artwork fills 20% of its file's height, Stryker's 90%), so equal boxes
   made some logos tiny. Each logo is trimmed to its artwork and given a display size that
   gives every logo about the same visual weight: equal area, adjusted for how much dark
   ink it carries once greyscaled, within height and width limits. Very light logos also get
   a darkening factor for the greyscale state. Writes public/images/customers/*.webp and
   src/content/customers.json. Partner logos (../assets/brand-logos) get the same sizing,
   in colour: public/images/brands/*.webp and src/content/brand-logos.json.

2. Category photos (stock photography already licensed for the site, see
   ../assets/IMAGE-SOURCES-stock.md): cropped to 4:3 around a focal point and encoded as
   WebP for the category heroes, cards and menu thumbnails. Writes public/images/categories/.
"""
import json, math, os
import numpy as np
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
PROTO = os.path.dirname(HERE)
ASSETS = os.path.join(os.path.dirname(PROTO), 'assets')
PUBLIC = os.path.join(PROTO, 'public', 'images')

# ---------------------------------------------------------------- customer logos
LOGOS = ['vvdn', 'kaynes', 'syrma-sgs', 'hfcl', 'iit-delhi', 'waaree', 'stryker', 'marelli', 'hella',
         'fiem', 'interface', 'indication-instruments', 'iit-roorkee', 'iit-jammu', 'iiser-mohali', 'inst']
AREA = 3900          # px² of a logo of average ink density (a 3:1 logo is about 108 × 36)
MAX_H, MAX_W = 54, 172
TONE_TARGET = 0.3    # mean greyscale luminance of the ink after darkening


def luminance(rgb):
    return rgb @ np.array([0.2126, 0.7152, 0.0722])


def logo(slug):
    im = Image.open(os.path.join(ASSETS, 'customers', slug + '.png')).convert('RGBA')
    a = np.asarray(im).astype(float) / 255
    alpha, rgb = a[..., 3], a[..., :3]
    # Ink is anything visible on the white page: near-white shapes (Kaynes' white tagline) are not.
    ink = (alpha > 0.1) & ~(rgb.min(axis=2) > 0.92)
    ys, xs = np.nonzero(ink)
    pad = 2
    box = (max(xs.min() - pad, 0), max(ys.min() - pad, 0), min(xs.max() + 1 + pad, im.width), min(ys.max() + 1 + pad, im.height))
    crop = im.crop(box)
    c = np.asarray(crop).astype(float) / 255
    darkness = c[..., 3] * (1 - luminance(c[..., :3]))
    density = darkness.mean()
    ink_c = (c[..., 3] > 0.1) & ~(c[..., :3].min(axis=2) > 0.92)
    tone_l = float((luminance(c[..., :3])[ink_c] * c[..., 3][ink_c]).sum() / c[..., 3][ink_c].sum())
    return crop, density, tone_l


def customers():
    measured = {slug: logo(slug) for slug in LOGOS}
    median = float(np.median([d for _, d, _ in measured.values()]))
    out = {}
    os.makedirs(os.path.join(PUBLIC, 'customers'), exist_ok=True)
    for slug, (crop, density, tone_l) in measured.items():
        aspect = crop.width / crop.height
        area = AREA * min(max((median / density) ** 0.5, 0.72), 1.45)
        w = math.sqrt(area * aspect)
        h = w / aspect
        fit = min(1, MAX_H / h, MAX_W / w)
        w, h = w * fit, h * fit
        tone = min(1, TONE_TARGET / tone_l) if tone_l > TONE_TARGET else 1
        # Stored at twice the display size for high-density screens (never enlarged).
        scale = min(1, 2 * w / crop.width)
        stored = crop.resize((round(crop.width * scale), round(crop.height * scale)), Image.LANCZOS)
        stored.save(os.path.join(PUBLIC, 'customers', slug + '.webp'), quality=92, alpha_quality=100, method=6)
        out[slug] = {'w': round(w), 'h': round(h), 'tone': round(tone, 2)}
        print(f'  {slug:24s} aspect {aspect:4.2f}  ink {density:.2f}  -> {round(w):3d} x {round(h):2d}  tone {tone:.2f}')
    with open(os.path.join(PROTO, 'src', 'content', 'customers.json'), 'w', encoding='utf-8', newline='\n') as fh:
        json.dump(out, fh, indent=1)
        fh.write('\n')


# ---------------------------------------------------------------- partner (brand) logos
# The same treatment for the partner logos (../assets/brand-logos), shown in colour. Logos
# supplied on a white background have the white made transparent. CDIL's logo is in the
# folder but not on its original brand page.
BRAND_LOGOS = {
    'tektronix': 'tektronix.png', 'keithley': 'keithley.png', 'uni-t': 'uni-t.png', 'scientific': 'scientific.png',
    'microtest': 'microtest.png', 'elektro-automatik': 'elektro-automatik.png', 'anritsu': 'anritsu.svg',
    'krykard': 'krykard.avif', 'rishabh': 'rishabh.png', 'asemi': 'asemi-asm.png', 'jilin-sino': 'jilin-sino.png',
    'shikues': 'shikues.png', 'donghai-wxdh': 'donghai-wxdh.png', 'mot-inmark': 'mot-inmark.png',
    'reasunos': 'reasunos.png', 'surging': 'surging.png', 'adler': 'adler.png', 'mlcc-base': 'mlcc-base.png',
    'cdil': 'cdil.png',
}
BRAND_AREA, BRAND_MAX_H, BRAND_MAX_W = 4600, 46, 150


def white_to_alpha(im):
    """GIMP-style colour-to-alpha against white: identical on a white page, transparent elsewhere."""
    a = np.asarray(im.convert('RGB')).astype(float) / 255
    alpha = (1 - a).max(axis=2)
    colour = np.where(alpha[..., None] > 0, (a - (1 - alpha[..., None])) / np.maximum(alpha[..., None], 1e-6), 0)
    out = np.dstack([np.clip(colour, 0, 1), alpha]) * 255
    return Image.fromarray(out.round().astype(np.uint8), 'RGBA')


def open_logo(path):
    if path.endswith('.svg'):
        import subprocess, tempfile
        png = os.path.join(tempfile.mkdtemp(), 'logo.png')
        jobs = os.path.join(os.path.dirname(png), 'jobs.json')
        with open(jobs, 'w') as fh:
            json.dump([[path, png, 1200, None]], fh)
        subprocess.run(['node', os.path.join(HERE, 'render-icons.cjs'), jobs], check=True, cwd=PROTO)
        path = png
    im = Image.open(path).convert('RGBA')
    corners = [im.getpixel(p) for p in [(0, 0), (im.width - 1, 0), (0, im.height - 1), (im.width - 1, im.height - 1)]]
    if all(c[3] > 250 and min(c[:3]) > 240 for c in corners):
        im = white_to_alpha(im)
    return im


def brand_logos():
    os.makedirs(os.path.join(PUBLIC, 'brands'), exist_ok=True)
    measured = {}
    for slug, name in BRAND_LOGOS.items():
        im = open_logo(os.path.join(ASSETS, 'brand-logos', name))
        a = np.asarray(im).astype(float) / 255
        ink = (a[..., 3] > 0.1) & ~(a[..., :3].min(axis=2) > 0.92)
        ys, xs = np.nonzero(ink)
        crop = im.crop((xs.min(), ys.min(), xs.max() + 1, ys.max() + 1))
        c = np.asarray(crop).astype(float) / 255
        measured[slug] = (crop, (c[..., 3] * (1 - luminance(c[..., :3]))).mean())
    median = float(np.median([d for _, d in measured.values()]))
    out = {}
    for slug, (crop, density) in measured.items():
        aspect = crop.width / crop.height
        area = BRAND_AREA * min(max((median / density) ** 0.5, 0.75), 1.4)
        w = math.sqrt(area * aspect)
        h = w / aspect
        fit = min(1, BRAND_MAX_H / h, BRAND_MAX_W / w)
        w, h = w * fit, h * fit
        scale = min(1, 2 * w / crop.width)
        crop.resize((round(crop.width * scale), round(crop.height * scale)), Image.LANCZOS) \
            .save(os.path.join(PUBLIC, 'brands', slug + '.webp'), quality=92, alpha_quality=100, method=6)
        out[slug] = {'w': round(w), 'h': round(h)}
        print(f'  {slug:20s} aspect {aspect:4.2f}  ink {density:.2f}  -> {round(w):3d} x {round(h):2d}')
    with open(os.path.join(PROTO, 'src', 'content', 'brand-logos.json'), 'w', encoding='utf-8', newline='\n') as fh:
        json.dump(out, fh, indent=1)
        fh.write('\n')


# ---------------------------------------------------------------- category photos
# id: (source under ../assets, focal point x, y as fractions of the image)
PHOTOS = {
    'oscilloscopes': ('instruments/rf.jpg', 0.5, 0.5),
    'power': ('instruments/ev-power.jpg', 0.5, 0.5),
    'rf': ('instruments/high-bw.jpg', 0.45, 0.55),
    'production': ('instruments/transformer.jpg', 0.5, 0.42),
    'meters': ('instruments/field.jpg', 0.5, 0.42),
    'smu': ('instruments/education.jpg', 0.55, 0.5),
    'mosfets': ('applications/smps-adapter.jpg', 0.55, 0.55),
    'transistors': ('applications/bldc-motor-driver.jpg', 0.5, 0.5),
    'diodes': ('heroes/brands.jpg', 0.5, 0.5),
    'protection': ('applications/smart-meter.jpg', 0.5, 0.4),
    'passives': ('heroes/home.jpg', 0.5, 0.5),
    'ics': ('applications/led-driver.jpg', 0.6, 0.55),
}
SIZES = {'': (1400, 1050, 78), '-card': (720, 540, 76), '-thumb': (192, 144, 74)}


def crop_to(im, ratio, fx, fy):
    w, h = im.size
    if w / h > ratio:
        cw, ch = round(h * ratio), h
    else:
        cw, ch = w, round(w / ratio)
    x = min(max(round(fx * w - cw / 2), 0), w - cw)
    y = min(max(round(fy * h - ch / 2), 0), h - ch)
    return im.crop((x, y, x + cw, y + ch))


def categories():
    os.makedirs(os.path.join(PUBLIC, 'categories'), exist_ok=True)
    for cid, (src, fx, fy) in PHOTOS.items():
        im = crop_to(Image.open(os.path.join(ASSETS, src)).convert('RGB'), 4 / 3, fx, fy)
        for suffix, (w, h, q) in SIZES.items():
            out = im if im.width <= w else im.resize((w, h), Image.LANCZOS)
            out.save(os.path.join(PUBLIC, 'categories', f'{cid}{suffix}.webp'), quality=q, method=6)
    print(f'  {len(PHOTOS)} category photos x {len(SIZES)} sizes')


if __name__ == '__main__':
    print('customer logos')
    customers()
    print('partner logos')
    brand_logos()
    print('category photos')
    categories()
