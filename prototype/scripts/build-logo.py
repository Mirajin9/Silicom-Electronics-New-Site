"""Vectorise the supplied Silicom logo rasters into an SVG kit.

Sources (the only logo artwork supplied; the brochures embed the same files):
  ../assets/silicom-logo-mark.png  arrow + SE monogram, 197 x 453
  ../assets/silicom-logo-full.png  full lockup, 477 x 108

- Arrow: a centre-line stroke with true corners, so it can be drawn on and stays
  crisp at any size.
- SE monogram: the thick calligraphy is traced from a smoothed mask; the faint
  hairlines are rebuilt as constant-width lines; the outline is then evened out
  between its corners and refitted as smooth curves.
- Wordmark: the 30 px-tall source is too small to trace cleanly, so it is reset
  in Alegreya (SIL OFL, scripts/fonts), the closest open typeface found in a
  glyph-by-glyph comparison. Each letter keeps the original's position, cap
  height, x-height and width.

Outputs:
  public/brand/                       web logo files and icons
  src/brand/logo-data.ts              path data for the React logo components
  ../design/logo/silicom-logo-package  the full package: SVG, PDF, PNG, ICO, usage guide

Run from prototype/:  python scripts/build-logo.py
Requires Pillow, numpy, fontTools and potracer (pip install potracer fonttools).
PNGs are rendered with @resvg/resvg-js (parent node_modules); PDFs with Chrome.
"""
import hashlib
import json
import math
import re
import os
import subprocess

import numpy as np
import potrace
from PIL import Image, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
PROTO = os.path.dirname(HERE)
ROOT = os.path.dirname(PROTO)
BRAND = os.path.join(PROTO, 'public', 'brand')
DATA = os.path.join(PROTO, 'src', 'brand', 'logo-data.ts')
PACKAGE = os.path.join(ROOT, 'design', 'logo', 'silicom-logo-package')
FONT = os.path.join(HERE, 'fonts', 'Alegreya[wght].ttf')
CHROME = r'C:\Program Files\Google\Chrome\Application\chrome.exe'

RED = '#E0161B'
GREY = '#8C9096'
INK = '#363636'
NAVY = '#061A33'
BLUE = '#0B6FD3'


def load(name):
    im = Image.open(os.path.join(ROOT, 'assets', name)).convert('RGBA')
    a = np.asarray(im).astype(float) / 255
    rgb, alpha = a[..., :3], a[..., 3]
    redness = np.clip(rgb[..., 0] - rgb[..., 1:].max(-1), 0, 1) * alpha
    over_white = rgb * alpha[..., None] + (1 - alpha[..., None])
    darkness = (1 - over_white.mean(-1)) * (redness < 0.18)
    return redness, darkness


def upscale(channel, factor, blur=0.0):
    im = Image.fromarray((np.clip(channel, 0, 1) * 255).astype(np.uint8))
    im = im.resize((im.width * factor, im.height * factor), Image.BICUBIC)
    if blur:
        im = im.filter(ImageFilter.GaussianBlur(blur * factor))  # removes pixel stair-steps
    return np.asarray(im).astype(float) / 255


def trace(mask, scale, alphamax=1.0, tolerance=0.2):
    """Trace a boolean mask into one even-odd SVG path, in source-pixel units."""
    # potracer treats dark (False) pixels as ink.
    curves = potrace.Bitmap(~mask).trace(turdsize=6, alphamax=alphamax, opticurve=True, opttolerance=tolerance)
    f = lambda p: f'{p.x / scale:.2f} {p.y / scale:.2f}'
    out = []
    for curve in curves:
        out.append(f'M{f(curve.start_point)}')
        for seg in curve.segments:
            if seg.is_corner:
                out.append(f'L{f(seg.c)}L{f(seg.end_point)}')
            else:
                out.append(f'C{f(seg.c1)} {f(seg.c2)} {f(seg.end_point)}')
        out.append('Z')
    return ''.join(out)


def thin(img):
    """Zhang-Suen thinning of a 0/1 image."""
    img = img.astype(np.uint8).copy()
    while True:
        changed = False
        for step in (0, 1):
            P = np.pad(img, 1)
            p2, p3, p4, p5 = P[:-2, 1:-1], P[:-2, 2:], P[1:-1, 2:], P[2:, 2:]
            p6, p7, p8, p9 = P[2:, 1:-1], P[2:, :-2], P[1:-1, :-2], P[:-2, :-2]
            ring = [p2, p3, p4, p5, p6, p7, p8, p9, p2]
            b = sum(r.astype(int) for r in ring[:8])
            a = sum(((ring[i] == 0) & (ring[i + 1] == 1)).astype(int) for i in range(8))
            if step == 0:
                c = (p2 * p4 * p6 == 0) & (p4 * p6 * p8 == 0)
            else:
                c = (p2 * p4 * p8 == 0) & (p2 * p6 * p8 == 0)
            kill = (img == 1) & (b >= 2) & (b <= 6) & (a == 1) & c
            if kill.any():
                img[kill] = 0
                changed = True
        if not changed:
            return img


def prune(skel, rounds=8):
    """Trim spur ends and specks left by thinning. Closed loops are unaffected."""
    img = skel.astype(np.uint8).copy()
    for _ in range(rounds):
        P = np.pad(img, 1)
        count = sum(P[1 + dy:P.shape[0] - 1 + dy, 1 + dx:P.shape[1] - 1 + dx]
                    for dy in (-1, 0, 1) for dx in (-1, 0, 1) if dy or dx)
        img[(img == 1) & (count <= 1)] = 0
    return img


def order_loop(skel):
    """Order skeleton pixels into one loop from the topmost point, bridging the
    gaps where the red monogram covers the arrow."""
    pts = np.argwhere(skel)[:, ::-1].astype(float)  # (x, y)
    left = np.ones(len(pts), bool)
    cur = int(np.argmin(pts[:, 1]))
    start = pts[cur].copy()
    order = [cur]
    left[cur] = False
    while left.any():
        idx = np.nonzero(left)[0]
        d = np.hypot(*(pts[idx] - pts[cur]).T)
        j = int(idx[np.argmin(d)])
        # Once most of the outline is walked and we are back near the tip, stop.
        if len(order) > 0.3 * len(pts) and np.hypot(*(pts[cur] - start)) < 12 and d.min() > 6:
            break
        order.append(j)
        left[j] = False
        left[np.hypot(*(pts - pts[j]).T) < 1.6] = False  # consume the staircase
        cur = j
    return pts[order]


def rdp(points, eps):
    points = np.asarray(points, float)
    if len(points) < 3:
        return points
    a, b = points[0], points[-1]
    ab = b - a
    n = np.hypot(*ab) or 1
    d = np.abs(ab[0] * (points[:, 1] - a[1]) - ab[1] * (points[:, 0] - a[0])) / n
    i = int(d.argmax())
    if d[i] > eps:
        return np.vstack([rdp(points[:i + 1], eps)[:-1], rdp(points[i:], eps)])
    return np.array([a, b])


def sharpen(pts, short=10):
    """Smoothing rounds each corner into a cluster of short segments. Replace
    every cluster with the intersection of the long edges either side of it."""
    n = len(pts)
    seg = [np.hypot(*(pts[(i + 1) % n] - pts[i])) for i in range(n)]  # seg i: i -> i+1
    start = next(i for i in range(n) if seg[i - 1] >= short)  # a vertex entered by a long edge
    out, i = [], start
    while i < start + n:
        j = i
        while seg[j % n] < short and j < start + n - 1:
            j += 1
        if j == i:
            out.append(pts[i % n])
        else:
            a0, a1 = pts[(i - 1) % n], pts[i % n]
            b0, b1 = pts[j % n], pts[(j + 1) % n]
            da, db = a1 - a0, b1 - b0
            den = da[0] * db[1] - da[1] * db[0]
            centre = pts[[k % n for k in range(i, j + 1)]].mean(0)
            hit = a0 + da * (((b0 - a0)[0] * db[1] - (b0 - a0)[1] * db[0]) / den) if abs(den) > 1e-9 else centre
            out.append(hit if np.hypot(*(hit - centre)) < 15 else centre)
        i = j + 1
    return np.array(out)


def smooth_path(pts, closed, corner_deg=26):
    """Catmull-Rom through points, with sharp corners kept straight."""
    n = len(pts)
    get = lambda i: pts[i % n] if closed else pts[min(max(i, 0), n - 1)]

    def corner(i):
        if not closed and i in (0, n - 1):
            return True
        a, b, c = get(i - 1), get(i), get(i + 1)
        v1, v2 = b - a, c - b
        ang = math.degrees(abs(math.atan2(v1[0] * v2[1] - v1[1] * v2[0], v1 @ v2)))
        return ang > corner_deg

    sharp = [corner(i) for i in range(n)]
    f = lambda p: f'{p[0]:.2f} {p[1]:.2f}'
    out = [f'M{f(pts[0])}']
    for i in range(n if closed else n - 1):
        p0, p1, p2, p3 = get(i - 1), get(i), get(i + 1), get(i + 2)
        s1 = 0 if sharp[i % n] else 1
        s2 = 0 if sharp[(i + 1) % n] else 1
        c1 = p1 + (p2 - p0) / 6 * s1
        c2 = p2 - (p3 - p1) / 6 * s2
        if s1 == 0 and s2 == 0:
            out.append(f'L{f(p2)}')
        else:
            out.append(f'C{f(c1)} {f(c2)} {f(p2)}')
    if closed:
        out.append('Z')
    return ''.join(out)


def build_arrow():
    _, darkness = load('silicom-logo-mark.png')
    k = 4
    stroke = upscale(darkness, k) > 0.2
    loop = order_loop(prune(thin(stroke)))
    # Average out pixel noise along the outline, then keep only significant vertices.
    w = 9
    padded = np.vstack([loop[-w:], loop, loop[:w]])
    kernel = np.ones(2 * w + 1) / (2 * w + 1)
    loop = np.stack([np.convolve(padded[:, i], kernel, 'same')[w:-w] for i in (0, 1)], 1)
    far = int(np.argmax(np.hypot(*(loop - loop[0]).T)))  # a closed loop's chord is zero-length
    pts = np.vstack([rdp(loop[:far + 1], 3.2)[:-1], rdp(np.vstack([loop[far:], loop[:1]]), 3.2)[:-1]]) / k
    pts = sharpen(pts)
    # Start at the tip (topmost point), running clockwise.
    tip = int(np.argmin(pts[:, 1]))
    pts = np.roll(pts, -tip, axis=0)
    area = np.sum(pts[:, 0] * np.roll(pts[:, 1], -1) - np.roll(pts[:, 0], -1) * pts[:, 1])
    if area < 0:  # screen coordinates: positive area = clockwise
        pts = np.vstack([pts[:1], pts[1:][::-1]])
    # The ribbon notch is the highest point between the two bottom corners.
    h = pts[:, 1].max()
    cx = (pts[:, 0].min() + pts[:, 0].max()) / 2
    low = [i for i, p in enumerate(pts) if p[1] > h * 0.75]
    bl = max((i for i in low if pts[i][0] < cx), key=lambda i: pts[i][1])
    br = max((i for i in low if pts[i][0] > cx), key=lambda i: pts[i][1])
    inner = [i for i in low if pts[bl][0] + 10 < pts[i][0] < pts[br][0] - 10]
    notch = min(inner, key=lambda i: pts[i][1])
    print(f'arrow: {len(pts)} vertices, notch at {pts[notch].round(1)}')
    right = np.vstack([pts[notch::-1]])            # notch -> up the right side -> tip
    left = np.vstack([pts[notch:], pts[:1]])       # notch -> round the left side -> tip
    return {'closed': smooth_path(pts, True), 'halves': [smooth_path(right, False), smooth_path(left, False)]}


def img(a):
    return Image.fromarray((np.clip(a, 0, 1) * 255).astype(np.uint8))


def smooth_loop(pts, corners, sigma):
    """Gaussian-smooth a closed outline, never averaging across a corner."""
    n = len(pts)
    w = int(3 * sigma)
    ker = np.exp(-0.5 * (np.arange(-w, w + 1) / sigma) ** 2)
    ker /= ker.sum()
    idx = np.nonzero(corners)[0]
    if not len(idx):
        pad = np.vstack([pts[-w:], pts, pts[:w]])
        return np.stack([np.convolve(pad[:, i], ker, 'valid') for i in (0, 1)], 1)
    out = pts.copy()
    for a, b in zip(idx, list(idx[1:]) + [idx[0] + n]):
        span = pts[[i % n for i in range(a, b + 1)]]
        if len(span) < 3:
            continue
        pad = np.vstack([np.repeat(span[:1], w, 0), span, np.repeat(span[-1:], w, 0)])
        sm = np.stack([np.convolve(pad[:, i], ker, 'valid') for i in (0, 1)], 1)
        for j in range(1, len(span) - 1):  # corners stay fixed
            out[(a + j) % n] = sm[j]
    return out


def build_se():
    redness, _ = load('silicom-logo-mark.png')
    k = 8
    R = upscale(redness / redness.max(), k)
    core = R > 0.42
    # Hairlines: centre-lines of the faint ink, redrawn at a constant ~1.4 source-px width.
    faint = np.asarray(img(R > 0.16).filter(ImageFilter.MaxFilter(3)).filter(ImageFilter.MinFilter(3))) > 127
    hair = np.asarray(img(prune(thin(faint), rounds=10)).filter(ImageFilter.MaxFilter(11))) > 127
    mask = np.asarray(img(core | hair).filter(ImageFilter.MaxFilter(5)).filter(ImageFilter.MinFilter(5))) > 127
    mask = np.asarray(img(mask).filter(ImageFilter.GaussianBlur(4.5))) > 127
    curves = potrace.Bitmap(~mask).trace(turdsize=6, alphamax=1.25, opticurve=True, opttolerance=1.0)
    P = lambda p: np.array([p.x, p.y]) / k
    out = []
    for curve in curves:
        pts, corner, cur = [], [], P(curve.start_point)
        for seg in curve.segments:
            if seg.is_corner:
                pts += [cur, P(seg.c)]
                corner += [False, True]
            else:
                t = np.linspace(0, 1, 10, endpoint=False)[:, None]
                c1, c2, p3 = P(seg.c1), P(seg.c2), P(seg.end_point)
                pts += list((1 - t) ** 3 * cur + 3 * (1 - t) ** 2 * t * c1 + 3 * (1 - t) * t ** 2 * c2 + t ** 3 * p3)
                corner += [False] * 10
            cur = P(seg.end_point)
        pts = np.array(pts)
        if len(pts) < 8:
            continue
        # Resample at ~0.35 source px so the smoothing is even along the outline.
        res, rc = [], []
        for i in range(len(pts)):
            a, b = pts[i], pts[(i + 1) % len(pts)]
            m = max(1, int(np.hypot(*(b - a)) / 0.35))
            for j in range(m):
                res.append(a + (b - a) * j / m)
                rc.append(corner[i] and j == 0)
        sm = smooth_loop(np.array(res), np.array(rc), 4.0)
        far = int(np.argmax(np.hypot(*(sm - sm[0]).T)))
        simp = np.vstack([rdp(sm[:far + 1], 0.09)[:-1], rdp(np.vstack([sm[far:], sm[:1]]), 0.09)[:-1]])
        out.append(smooth_path(simp, True, corner_deg=62))
    print(f'SE: {len(out)} outlines')
    return ''.join(out)


def glyph_runs(dark, count):
    """One column range per character: split on empty columns, then split merged
    letters at their weakest columns."""
    ink = (dark > 0.45).sum(0).astype(float)
    runs, x = [], 0
    while x < len(ink):
        if ink[x]:
            s = x
            while x < len(ink) and ink[x]:
                x += 1
            runs.append([s, x])
        x += 1
    while len(runs) < count:
        i = max(range(len(runs)), key=lambda r: runs[r][1] - runs[r][0])
        s, e = runs[i]
        cut = min(range(s + 3, e - 3), key=lambda c: ink[c] + 0.5 * (ink[c - 1] + ink[c + 1]))
        runs[i:i + 1] = [[s, cut], [cut + 1, e]]
    return runs


def build_wordmark():
    """Reset the wordmark in Alegreya at the original letter positions."""
    from fontTools.ttLib import TTFont
    from fontTools.varLib.instancer import instantiateVariableFont
    from fontTools.pens.boundsPen import BoundsPen
    from fontTools.pens.svgPathPen import SVGPathPen
    from fontTools.pens.transformPen import TransformPen

    _, dark = load('silicom-logo-full.png')
    dark[:, :56] = 0  # the mark is built separately
    words = ['Silicom', 'Electronics', 'Pvt.', 'Ltd.']
    text = ''.join(words)
    runs = glyph_runs(dark, len(text))
    boxes = []
    for s, e in runs:
        ys = np.nonzero((dark[:, s:e] > 0.12).any(1))[0]
        boxes.append((s, ys.min(), e, ys.max() + 1))
    baseline = max(b[3] for b, ch in zip(boxes, text) if ch in 'SEPLilcomtrnsv')
    cap = float(np.median([b[3] - b[1] for b, ch in zip(boxes, text) if ch in 'SEPL']))

    font = instantiateVariableFont(TTFont(FONT), {'wght': 750})
    glyphs, cmap = font.getGlyphSet(), font.getBestCmap()
    bounds = {}
    for ch in set(text + 'E'):
        pen = BoundsPen(glyphs)
        glyphs[cmap[ord(ch)]].draw(pen)
        bounds[ch] = pen.bounds
    sy = cap / bounds['E'][3]
    widths = np.array([(b[2] - b[0]) / ((bounds[ch][2] - bounds[ch][0]) * sy) for b, ch in zip(boxes, text)])
    condense = float(np.median(widths))
    print(f'wordmark: Alegreya 750, cap {cap:.1f}, condensed to {condense:.3f}')

    ntos = lambda v: f'{v:.2f}'.rstrip('0').rstrip('.')
    paths, i = [], 0
    for word in words:
        pen = SVGPathPen(glyphs, ntos=ntos)
        for ch in word:
            b, (x0, _, x1, _) = boxes[i], bounds[ch]
            # A common condensing, with each letter nudged (at most 6%) to the original's width.
            fit = np.clip(widths[i] / condense, 0.94, 1.06)
            sx = sy * condense * fit
            centre = (b[0] + b[2]) / 2
            tp = TransformPen(pen, (sx, 0, 0, -sy, centre - (x0 + x1) / 2 * sx, baseline))
            glyphs[cmap[ord(ch)]].draw(tp)
            i += 1
        paths.append(pen.getCommands())
    return {
        'main': paths[0] + paths[1],
        'legal': paths[2] + paths[3],
        'right': float(boxes[-1][2]),
        'legalX': float(boxes[len('SilicomElectronics')][0]),
        'mainRight': float(boxes[len('SilicomElectronics') - 1][2]),
        'cap': cap,
        'baseline': float(baseline),
    }


# ---------------------------------------------------------------------------
# Composition and export

COLOURWAYS = {
    # name: (arrow, SE, wordmark)
    'color': (GREY, RED, INK),
    'reverse': ('#B9C6D6', '#FF4A4F', '#FFFFFF'),
    'mono-black': ('#000000', '#000000', '#000000'),
    'mono-white': ('#FFFFFF', '#FFFFFF', '#FFFFFF'),
    'mono-blue': (BLUE, BLUE, BLUE),
}
MARK_W, MARK_H = 197, 453


def mark_group(arrow, se, colours, stroke, tf='', se_weight=0.0):
    a, r, _ = colours
    g = f'<g transform="{tf}">' if tf else '<g>'
    weight = f' stroke="{r}" stroke-width="{se_weight}" stroke-linejoin="round"' if se_weight else ''
    return (f'{g}<path d="{arrow["closed"]}" fill="none" stroke="{a}" stroke-width="{stroke}" stroke-linejoin="miter" '
            f'stroke-miterlimit="10"/><path d="{se}" fill="{r}"{weight}/></g>')


def svg(viewbox, body, label='Silicom Electronics Pvt. Ltd.', background=None):
    vb = ' '.join(f'{v:g}' for v in viewbox)
    bg = f'<rect x="{viewbox[0]:g}" y="{viewbox[1]:g}" width="{viewbox[2]:g}" height="{viewbox[3]:g}" fill="{background}"/>' if background else ''
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{vb}" role="img" aria-label="{label}">'
            f'<title>{label}</title>{bg}{body}</svg>\n')


def compose(arrow, se, word):
    """Return every lockup as {name: (viewBox, body-builder(colours))}."""
    s = 101 / 451  # the mark's height in the supplied lockup (y 3-104 of 108)
    mark_tf = f'translate(3.4 3) scale({s:.5f})'
    full = [0, 0, round(word['right'] + 4, 1), 108]
    short = [0, 0, round(word['mainRight'] + 4, 1), 108]
    # Stacked: mark centred above "Silicom Electronics", for square and narrow spaces.
    stack_w = word['mainRight'] - 56
    mark_h = 4.5 * word['cap']
    ms = mark_h / MARK_H
    stack_mark_tf = f'translate({56 + stack_w / 2 - MARK_W * ms / 2:.2f} {word["baseline"] - word["cap"] - 16 - mark_h:.2f}) scale({ms:.5f})'
    stack = [50, round(word['baseline'] - word['cap'] - 16 - mark_h - 6, 1), round(stack_w + 12, 1), round(mark_h + 16 + word['cap'] + 14, 1)]
    return {
        'primary': (full, lambda c, w=2.4: mark_group(arrow, se, c, 8.2, mark_tf, w) + f'<path d="{word["main"]}{word["legal"]}" fill="{c[2]}"/>'),
        'short': (short, lambda c, w=2.4: mark_group(arrow, se, c, 8.2, mark_tf, w) + f'<path d="{word["main"]}" fill="{c[2]}"/>'),
        'stacked': (stack, lambda c, w=1.2: mark_group(arrow, se, c, 5.5, stack_mark_tf, w) + f'<path d="{word["main"]}" fill="{c[2]}"/>'),
        'symbol': ([-4, -4, MARK_W + 8, MARK_H + 8], lambda c, w=0: mark_group(arrow, se, c, 3.4, '', w)),
    }, mark_tf


def round_path(d):
    """One decimal is sub-pixel at every web size; the package files keep two."""
    return re.sub(r'-?\d+\.\d+', lambda m: f'{float(m.group()):.1f}'.rstrip('0').rstrip('.'), d)


def write(path, text):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w', encoding='utf-8', newline='\n') as fh:
        fh.write(text)


def main():
    arrow = build_arrow()
    se = build_se()
    word = build_wordmark()
    lockups, mark_tf = compose(arrow, se, word)

    # --- Web kit (public/brand) and React data
    web = {
        'silicom-logo.svg': svg(lockups['primary'][0], lockups['primary'][1](COLOURWAYS['color'])),
        'silicom-logo-reversed.svg': svg(lockups['primary'][0], lockups['primary'][1](COLOURWAYS['reverse'])),
        'silicom-logo-mono-blue.svg': svg(lockups['primary'][0], lockups['primary'][1](COLOURWAYS['mono-blue'])),
        'silicom-logo-mono-white.svg': svg(lockups['primary'][0], lockups['primary'][1](COLOURWAYS['mono-white'])),
        'silicom-logo-short.svg': svg(lockups['short'][0], lockups['short'][1](COLOURWAYS['color']), 'Silicom Electronics'),
        'silicom-logo-stacked.svg': svg(lockups['stacked'][0], lockups['stacked'][1](COLOURWAYS['color']), 'Silicom Electronics'),
        'silicom-mark.svg': svg(lockups['symbol'][0], lockups['symbol'][1](COLOURWAYS['color']), 'Silicom Electronics'),
    }
    # Square icons: the mark centred on white. The favicon is drawn heavier so it
    # still reads at 16-32 px; the larger app icon keeps the normal weight.
    icon_scale = 0.86 * 512 / MARK_H
    icon_tf = f'translate({(512 - MARK_W * icon_scale) / 2:.2f} {(512 - MARK_H * icon_scale) / 2:.2f}) scale({icon_scale:.5f})'
    icon = lambda arrow_w, se_w: svg([0, 0, 512, 512], '<rect width="512" height="512" rx="96" fill="#fff"/>'
                                     + mark_group(arrow, se, ('#5D6268', RED, INK), arrow_w, icon_tf, se_w), 'Silicom Electronics')
    web['favicon.svg'] = icon(20, 9)
    web['icon.svg'] = icon(9, 4)
    # Link-preview card (1200 x 630): the full lockup on white over a blue base rule.
    pvb = lockups['primary'][0]
    card_w = 900
    card_h = card_w * pvb[3] / pvb[2]
    web['og-image.svg'] = svg([0, 0, 1200, 630], '<rect width="1200" height="630" fill="#fff"/>'
                              f'<svg x="150" y="{(600 - card_h) / 2:.1f}" width="{card_w}" height="{card_h:.1f}" viewBox="{" ".join(f"{v:g}" for v in pvb)}">'
                              + lockups['primary'][1](COLOURWAYS['color']) + '</svg>'
                              f'<rect y="600" width="1200" height="30" fill="{BLUE}"/>')
    for name, text in web.items():
        write(os.path.join(BRAND, name), text)

    # One cached sprite for the header and footer: pages reference it with <use>, so no
    # page repeats the path data. Colours come from --logo-* on the referencing <svg>.
    # Each shape is defined once and reused by the three symbols.
    # Colour attributes are the fallback for renderers without CSS variables.
    arrow_style = f'fill="none" stroke="{GREY}" stroke-linejoin="miter" stroke-miterlimit="10" style="stroke:var(--logo-arrow,{GREY})"'
    se_style = f'fill="{RED}" stroke="{RED}" stroke-linejoin="round" style="fill:var(--logo-se,{RED});stroke:var(--logo-se,{RED})"'
    defs = (f'<defs><path id="a" d="{round_path(arrow["closed"])}"/><path id="s" d="{round_path(se)}"/>'
            f'<path id="w" d="{round_path(word["main"])}"/><path id="l" d="{round_path(word["legal"])}"/></defs>')
    def symbol(ident, viewbox, parts, tf='', arrow_w=8.2, se_w=2.4):
        mark = (f'<g transform="{tf}">' if tf else '<g>') + (f'<use href="#a" stroke-width="{arrow_w}" {arrow_style}/>'
                f'<use href="#s" stroke-width="{se_w}" {se_style}/></g>')
        word_parts = ''.join(f'<use href="#{p}" fill="{INK}" style="fill:var(--logo-ink,{INK})"/>' for p in parts)
        return f'<symbol id="{ident}" viewBox="{" ".join(f"{v:g}" for v in viewbox)}">{mark}{word_parts}</symbol>'
    sprite = ('<svg xmlns="http://www.w3.org/2000/svg">' + defs + symbol('lockup', lockups['primary'][0], 'wl', mark_tf)
              + symbol('lockup-short', lockups['short'][0], 'w', mark_tf) + symbol('mark', lockups['symbol'][0], '', '', 3.4, 0) + '</svg>\n')
    write(os.path.join(BRAND, 'silicom-logo-symbols.svg'), sprite)
    version = hashlib.sha1(sprite.encode()).hexdigest()[:8]

    data = {
        'symbols': f'/brand/silicom-logo-symbols.svg?v={version}',
        'markViewBox': lockups['symbol'][0],
        'lockupViewBox': lockups['primary'][0],
        'shortViewBox': lockups['short'][0],
        'markTransform': mark_tf,
        'arrow': round_path(arrow['closed']),
        'arrowHalves': [round_path(h) for h in arrow['halves']],
        'se': round_path(se),
        'wordmark': round_path(word['main']),
        'legal': round_path(word['legal']),
    }
    write(DATA, '// Generated by scripts/build-logo.py from the supplied logo artwork. Do not edit by hand.\n'
          f'export const logo = {json.dumps(data, indent=2)} as const;\n')

    # --- Package (../design/logo/silicom-logo-package)
    jobs = []  # (svg path, png path, width, background)
    folders = {'primary': '01-primary', 'reverse': '02-reverse', 'mono': '03-mono', 'stacked': '04-stacked', 'symbol': '05-symbol'}
    def export(folder, name, viewbox, body, label='Silicom Electronics Pvt. Ltd.', background=None, sizes=(256, 512, 1024, 2048)):
        base = os.path.join(PACKAGE, folder, name)
        write(base + '.svg', svg(viewbox, body, label))
        for size in sizes:
            jobs.append((base + '.svg', f'{base}-{size}.png', size, background))
        return base + '.svg'
    pdfs = []
    pdfs.append(export(folders['primary'], 'primary-color', *lockups['primary'][:1], lockups['primary'][1](COLOURWAYS['color'])))
    jobs.append((pdfs[-1], os.path.join(PACKAGE, folders['primary'], 'primary-color.jpg.png'), 1024, '#FFFFFF'))
    export(folders['primary'], 'primary-short-color', lockups['short'][0], lockups['short'][1](COLOURWAYS['color']), 'Silicom Electronics')
    pdfs.append(export(folders['reverse'], 'primary-reverse', lockups['primary'][0], lockups['primary'][1](COLOURWAYS['reverse'])))
    export(folders['reverse'], 'stacked-reverse', lockups['stacked'][0], lockups['stacked'][1](COLOURWAYS['reverse']), 'Silicom Electronics')
    export(folders['reverse'], 'symbol-reverse', lockups['symbol'][0], lockups['symbol'][1](COLOURWAYS['reverse']), 'Silicom Electronics')
    for tone in ('mono-black', 'mono-white', 'mono-blue'):
        path = export(os.path.join(folders['mono'], tone), f'primary-{tone}', lockups['primary'][0], lockups['primary'][1](COLOURWAYS[tone]))
        if tone == 'mono-black':
            pdfs.append(path)
        export(os.path.join(folders['mono'], tone), f'symbol-{tone}', lockups['symbol'][0], lockups['symbol'][1](COLOURWAYS[tone]), 'Silicom Electronics')
    export(folders['stacked'], 'stacked-color', lockups['stacked'][0], lockups['stacked'][1](COLOURWAYS['color']), 'Silicom Electronics')
    export(folders['symbol'], 'symbol-color', lockups['symbol'][0], lockups['symbol'][1](COLOURWAYS['color']), 'Silicom Electronics')
    fav = os.path.join(PACKAGE, '06-favicon')
    write(os.path.join(fav, 'favicon.svg'), web['favicon.svg'])
    write(os.path.join(fav, 'app-icon.svg'), web['icon.svg'])
    for size in (16, 32, 48):
        jobs.append((os.path.join(fav, 'favicon.svg'), os.path.join(fav, f'favicon-{size}.png'), size, None))
    for size in (180, 192, 512):
        name = 'apple-touch-icon.png' if size == 180 else f'app-icon-{size}.png'
        jobs.append((os.path.join(fav, 'app-icon.svg'), os.path.join(fav, name), size, None))
    # Site icons
    jobs += [(os.path.join(BRAND, 'favicon.svg'), os.path.join(BRAND, 'favicon-32.png'), 32, None),
             (os.path.join(BRAND, 'icon.svg'), os.path.join(BRAND, 'apple-touch-icon.png'), 180, None),
             (os.path.join(BRAND, 'icon.svg'), os.path.join(BRAND, 'icon-192.png'), 192, None),
             (os.path.join(BRAND, 'icon.svg'), os.path.join(BRAND, 'icon-512.png'), 512, None),
             (os.path.join(BRAND, 'og-image.svg'), os.path.join(BRAND, 'og-image.png'), 1200, None)]
    job_file = os.path.join(PACKAGE, 'render-jobs.json')
    write(job_file, json.dumps(jobs))
    subprocess.run(['node', os.path.join(HERE, 'render-icons.cjs'), job_file], check=True, cwd=ROOT)
    os.remove(job_file)

    # JPG (white background, for email signatures) and the multi-size ICO.
    jpg_src = os.path.join(PACKAGE, folders['primary'], 'primary-color.jpg.png')
    Image.open(jpg_src).convert('RGB').save(os.path.join(PACKAGE, folders['primary'], 'primary-color.jpg'), quality=92)
    os.remove(jpg_src)
    icons = [Image.open(os.path.join(fav, f'favicon-{s}.png')) for s in (16, 32, 48)]
    icons[2].save(os.path.join(fav, 'favicon.ico'), format='ICO', sizes=[(16, 16), (32, 32), (48, 48)], append_images=icons[:2])

    # Vector PDFs for print, via Chrome's PDF engine.
    if os.path.exists(CHROME):
        for path in pdfs:
            vb = [float(v) for v in open(path, encoding='utf-8').read().split('viewBox="')[1].split('"')[0].split()]
            wmm = 120
            hmm = wmm * vb[3] / vb[2]
            page = path[:-4] + '.print.html'
            dark = 'reverse' in path
            write(page, f'<!doctype html><style>@page{{size:{wmm}mm {hmm:.2f}mm;margin:0}}html,body{{margin:0;background:{"#061A33" if dark else "#fff"}}}'
                        f'svg{{display:block;width:{wmm}mm;height:{hmm:.2f}mm}}</style>' + open(path, encoding='utf-8').read())
            subprocess.run([CHROME, '--headless=new', '--disable-gpu', '--no-pdf-header-footer', '--print-to-pdf-no-header',
                            f'--print-to-pdf={path[:-4]}.pdf', 'file:///' + page.replace(os.sep, '/')],
                           check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            os.remove(page)
    print('wrote', len(web), 'web files,', os.path.relpath(DATA, PROTO), 'and the package in', os.path.relpath(PACKAGE, ROOT))


if __name__ == '__main__':
    main()
