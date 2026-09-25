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

2. Category photos: instrument categories show a real product photo whole on white; component
   categories use the licensed stock photography (../assets/IMAGE-SOURCES-stock.md) or ADLER's
   range photography, cropped to 4:3. WebP for heroes, cards and menu thumbnails
   (public/images/categories/). Product photos for galleries and cards go to
   public/images/products/, ADLER's range photos to public/images/adler/.
   Sources outside ../assets are in image-source/ (see image-source/SOURCES.md).
"""
import json, math, os, time
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
    'pace': '../../prototype/image-source/pace/logo.png',
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
    # A logo drawn white for dark headers (PACE's) is shown in the page's ink colour instead.
    a = np.asarray(im)
    if a[..., 3].max() > 0 and a[..., :3][a[..., 3] > 40].mean() > 235:
        a = a.copy(); a[..., :3] = (11, 16, 32)
        im = Image.fromarray(a, 'RGBA')
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
# Sources: '../assets/…' (the original site's photos) or 'image-source/…' (see image-source/SOURCES.md).
# Scenes are cropped to 4:3 around a focal point ('cover'); product photos on white are shown
# whole, centred on white with a margin ('contain'), so an instrument is never cut off.
A = '../assets/'
PHOTOS = {
    'oscilloscopes': (A + 'brands/products/tektronix.jpg', 0.5, 0.5, 'cover'),
    'power': ('image-source/instruments/unit-utp3000-dual-bench-psu.png', 0.5, 0.5, 'contain'),
    'rf': ('image-source/instruments/unit-uts1000-spectrum-analyzer.png', 0.5, 0.5, 'contain'),
    'production': (A + 'products/instruments/microtest-5465-transformer-analyzer.png', 0.5, 0.5, 'contain'),
    'meters': (A + 'brands/products/uni-t.jpg', 0.5, 0.5, 'contain'),
    'smu': (A + 'brands/products/keithley.jpg', 0.5, 0.5, 'contain'),
    'soldering': ('image-source/pace/ads200-station-large.jpg', 0.5, 0.5, 'contain'),
    'mosfets': (A + 'applications/smps-adapter.jpg', 0.55, 0.55, 'cover'),
    'transistors': (A + 'applications/bldc-motor-driver.jpg', 0.5, 0.5, 'cover'),
    'diodes': (A + 'heroes/brands.jpg', 0.5, 0.5, 'cover'),
    'protection': ('image-source/adler/range-ev-fuses.jpg', 0.5, 0.5, 'cover'),
    'passives': (A + 'heroes/home.jpg', 0.5, 0.5, 'cover'),
    'ics': (A + 'applications/led-driver.jpg', 0.6, 0.55, 'cover'),
}
SIZES = {'': (1400, 1050, 78), '-card': (720, 540, 76), '-thumb': (192, 144, 74)}

# Product photos for galleries, cards and application images: 4:3, whole product on white.
PRODUCTS = {
    'tektronix-tbs2000': A + 'brands/products/tektronix.jpg',
    'tektronix-2-series-mso': A + 'products/instruments/tektronix-2-series-mso.jpg',
    'unit-upo-mso': 'image-source/instruments/unit-upo-mso-oscilloscope.png',
    'unit-utp3000': 'image-source/instruments/unit-utp3000-dual-bench-psu.png',
    'unit-udp3000': 'image-source/instruments/unit-udp3000-programmable-psu.png',
    'unit-udp6720': 'image-source/instruments/unit-udp6720-programmable-psu.png',
    'unit-utl8200': 'image-source/instruments/unit-utl8200-electronic-load.png',
    'unit-uts1000': 'image-source/instruments/unit-uts1000-spectrum-analyzer.png',
    'unit-ut8802e': 'image-source/instruments/unit-ut8802e-bench-multimeter.png',
    'unit-ut61e': A + 'brands/products/uni-t.jpg',
    'rishabh-613': A + 'brands/products/rishabh.jpg',
    'elektro-automatik-psi9000': A + 'brands/products/elektro-automatik.jpg',
    'keithley-2230': A + 'products/instruments/keithley-2230-dc-power-supply.jpg',
    'keithley-2450': A + 'brands/products/keithley.jpg',
    'anritsu-ms2720t': A + 'brands/products/anritsu.jpg',
    'microtest-lcr': A + 'brands/products/microtest.jpg',
    'microtest-5465': A + 'products/instruments/microtest-5465-transformer-analyzer.png',
    'microtest-8761': A + 'products/instruments/microtest-8761-cable-harness-tester.png',
    'krykard-alm31': A + 'brands/products/krykard.jpg',
    'pace-ads200': 'image-source/pace/ads200-station.jpg',
    'pace-ads200-large': 'image-source/pace/ads200-station-large.jpg',
    'pace-st35': 'image-source/pace/st35-station.jpg',
    'pace-td200': 'image-source/pace/td200-iron.png',
    'pace-ps90': 'image-source/pace/ps90-iron-kit.jpg',
    'pace-mbt360': 'image-source/pace/mbt360-rework.jpg',
    'pace-mbt450': 'image-source/pace/mbt450-rework.jpg',
    'pace-st125': 'image-source/pace/st125-rework.jpg',
    'pace-prc2000': 'image-source/pace/prc2000-repair.jpg',
    'pace-ir3100': 'image-source/pace/ir3100-bga.jpg',
    'pace-tf1800': 'image-source/pace/tf1800-bga.jpg',
    'pace-tf2800': 'image-source/pace/tf2800-bga.jpg',
    'pace-st325': 'image-source/pace/st325-hot-air.jpg',
    'pace-st1600': 'image-source/pace/st1600-preheater.jpg',
    'pace-arm-evac-150': 'image-source/pace/arm-evac-150.jpg',
    'pace-tj70': 'image-source/pace/tj70-thermojet.jpg',
    'pace-mt200': 'image-source/pace/mt200-minitweez.jpg',
    'adler-a83': 'image-source/adler/a83.png',
    'adler-a85': 'image-source/adler/a85.png',
    'adler-a65': 'image-source/adler/a65.png',
    'adler-a94': 'image-source/adler/a94.png',
    'adler-bh300': 'image-source/adler/bh300.png',
    'adler-bh400': 'image-source/adler/bh400.png',
    'adler-ev-bolt-down': 'image-source/adler/ev-bolt-down.png',
    'adler-ev-mini-blade': 'image-source/adler/ev-mini-blade.png',
    'adler-evse-at1': 'image-source/adler/evse-at1.png',
    'adler-ev-bfr-holder': 'image-source/adler/ev-bfr-holder.png',
}
# ADLER's own range photography (from its catalogues), 4:3.
RANGES = ['range-pv-fuses', 'range-pv-holders', 'range-ev-fuses', 'range-evse-fuses']


def source(path):
    return Image.open(os.path.join(PROTO, path)).convert('RGB')


def crop_to(im, ratio, fx, fy):
    w, h = im.size
    if w / h > ratio:
        cw, ch = round(h * ratio), h
    else:
        cw, ch = w, round(w / ratio)
    x = min(max(round(fx * w - cw / 2), 0), w - cw)
    y = min(max(round(fy * h - ch / 2), 0), h - ch)
    return im.crop((x, y, x + cw, y + ch))


def contain(im, ratio=4 / 3, margin=0.1):
    """The product trimmed of its white surround, centred on a white 4:3 canvas."""
    a = np.asarray(im).astype(int)
    ys, xs = np.nonzero((255 - a).max(axis=2) > 18)
    if len(xs):
        im = im.crop((xs.min(), ys.min(), xs.max() + 1, ys.max() + 1))
    w = max(im.width, im.height * ratio) / (1 - 2 * margin)
    canvas = Image.new('RGB', (round(w), round(w / ratio)), 'white')
    canvas.paste(im, ((canvas.width - im.width) // 2, (canvas.height - im.height) // 2))
    return canvas


def save_sizes(im, folder, name, sizes):
    os.makedirs(os.path.join(PUBLIC, folder), exist_ok=True)
    for suffix, (w, h, q) in sizes.items():
        # Small product shots are enlarged to the card size rather than left tiny.
        out = im.resize((w, h), Image.LANCZOS) if im.width != w else im
        # Write then swap, retrying briefly: OneDrive locks a file while it syncs it.
        path = os.path.join(PUBLIC, folder, f'{name}{suffix}.webp')
        out.save(path + '.tmp', 'WEBP', quality=q, method=6)
        for attempt in range(20):
            try:
                os.replace(path + '.tmp', path)
                break
            except PermissionError:
                if attempt == 19:
                    raise
                time.sleep(0.5)


def categories():
    for cid, (src, fx, fy, mode) in PHOTOS.items():
        im = source(src)
        im = contain(im) if mode == 'contain' else crop_to(im, 4 / 3, fx, fy)
        save_sizes(im, 'categories', cid, SIZES)
    print(f'  {len(PHOTOS)} category photos x {len(SIZES)} sizes')
    for name, src in PRODUCTS.items():
        save_sizes(contain(source(src)), 'products', name, {'': (900, 675, 82)})
    print(f'  {len(PRODUCTS)} product photos')
    for name in RANGES:
        im = source(f'image-source/adler/{name}.jpg')
        save_sizes(crop_to(im, 4 / 3, 0.5, 0.5), 'adler', name, {'': (1400, 1050, 80), '-card': (720, 540, 76)})
    print(f'  {len(RANGES)} ADLER range photos')


if __name__ == '__main__':
    print('customer logos')
    customers()
    print('partner logos')
    brand_logos()
    print('category, product and ADLER photos')
    categories()
