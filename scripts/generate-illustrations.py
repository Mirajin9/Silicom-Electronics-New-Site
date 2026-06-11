# -*- coding: utf-8 -*-
"""
generate-illustrations.py
=========================
Generates a library of on-brand SVG "technical render" illustrations for every
.image-slot on the site (heroes + application cards) and the brand landing
pages, then injects them into the HTML.

Each illustration is a dark, glowing technical panel (navy gradient + accent
glow + grid) with a clean line-art motif relevant to the slot, so it reads as a
premium product/board render on both light and dark themes.

Run:  python scripts/generate-illustrations.py
"""

import html
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "assets", "illustrations")

W, H = 640, 360  # 16:9 canvas; slots crop with object-fit:cover

# ---- palette ----
NAVY0 = "#0a1322"
NAVY1 = "#0f1f38"
BLUE = "#3b82f6"
BLUE2 = "#2f7fe0"
CYAN = "#22d3ee"
SLATE = "#8aa0bd"
WHITE = "#e8eef6"
GRID = "#1c2c47"


def esc(s):
    return html.escape(s, quote=True)


# --------------------------------------------------------------------------
# Shared frame: background, grid, glows, corner ticks, mono label
# --------------------------------------------------------------------------

def frame(label, gx1=0.26, gy1=0.30, gx2=0.78, gy2=0.72):
    g1x, g1y = int(W * gx1), int(H * gy1)
    g2x, g2y = int(W * gx2), int(H * gy2)
    grid_lines = []
    step = 40
    for x in range(step, W, step):
        grid_lines.append(f'<line x1="{x}" y1="0" x2="{x}" y2="{H}" />')
    for y in range(step, H, step):
        grid_lines.append(f'<line x1="0" y1="{y}" x2="{W}" y2="{y}" />')
    grid = f'<g stroke="{GRID}" stroke-width="1" opacity="0.55">{"".join(grid_lines)}</g>'
    ticks = (
        f'<g stroke="{SLATE}" stroke-width="2" opacity="0.5" stroke-linecap="round">'
        f'<path d="M18 18 h18 M18 18 v18"/><path d="M{W-18} 18 h-18 M{W-18} 18 v18"/>'
        f'<path d="M18 {H-18} h18 M18 {H-18} v-18"/><path d="M{W-18} {H-18} h-18 M{W-18} {H-18} v-18"/></g>'
    )
    lbl = (
        f'<g font-family="ui-monospace,Menlo,monospace" font-size="13" font-weight="600">'
        f'<rect x="24" y="{H-44}" width="{14*len(label)//1+22}" height="26" rx="13" '
        f'fill="#0a1322" opacity="0.65"/>'
        f'<circle cx="40" cy="{H-31}" r="3.5" fill="{CYAN}"/>'
        f'<text x="54" y="{H-26}" fill="{WHITE}" opacity="0.92">{esc(label)}</text></g>'
    )
    return f'''<rect width="{W}" height="{H}" rx="0" fill="url(#bg)"/>
{grid}
<circle cx="{g1x}" cy="{g1y}" r="150" fill="url(#glowB)"/>
<circle cx="{g2x}" cy="{g2y}" r="170" fill="url(#glowC)"/>
{ticks}
{lbl}'''


def defs():
    return f'''<defs>
<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
  <stop offset="0" stop-color="{NAVY0}"/><stop offset="1" stop-color="{NAVY1}"/>
</linearGradient>
<radialGradient id="glowB" cx="0.5" cy="0.5" r="0.5">
  <stop offset="0" stop-color="{BLUE}" stop-opacity="0.55"/><stop offset="1" stop-color="{BLUE}" stop-opacity="0"/>
</radialGradient>
<radialGradient id="glowC" cx="0.5" cy="0.5" r="0.5">
  <stop offset="0" stop-color="{CYAN}" stop-opacity="0.40"/><stop offset="1" stop-color="{CYAN}" stop-opacity="0"/>
</radialGradient>
<linearGradient id="screen" x1="0" y1="0" x2="0" y2="1">
  <stop offset="0" stop-color="#0c1a30"/><stop offset="1" stop-color="#0a1626"/>
</linearGradient>
</defs>'''


def svg(inner):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" '
            f'width="{W}" height="{H}" role="img">\n{defs()}\n{inner}\n</svg>\n')


# --------------------------------------------------------------------------
# Motif primitives
# --------------------------------------------------------------------------

def chip(cx, cy, s=88, label=None):
    """IC package with pins and inner die."""
    half = s / 2
    pins = []
    n = 5
    pitch = s / (n + 1)
    for i in range(1, n + 1):
        px = cx - half + i * pitch
        pins.append(f'<line x1="{px:.0f}" y1="{cy-half:.0f}" x2="{px:.0f}" y2="{cy-half-12:.0f}"/>')
        pins.append(f'<line x1="{px:.0f}" y1="{cy+half:.0f}" x2="{px:.0f}" y2="{cy+half+12:.0f}"/>')
        py = cy - half + i * pitch
        pins.append(f'<line x1="{cx-half:.0f}" y1="{py:.0f}" x2="{cx-half-12:.0f}" y2="{py:.0f}"/>')
        pins.append(f'<line x1="{cx+half:.0f}" y1="{py:.0f}" x2="{cx+half+12:.0f}" y2="{py:.0f}"/>')
    inner = (
        f'<g stroke="{CYAN}" stroke-width="2.5" stroke-linecap="round" opacity="0.85">{"".join(pins)}</g>'
        f'<rect x="{cx-half:.0f}" y="{cy-half:.0f}" width="{s}" height="{s}" rx="12" '
        f'fill="#0c1a30" stroke="{BLUE}" stroke-width="2.5"/>'
        f'<rect x="{cx-half+16:.0f}" y="{cy-half+16:.0f}" width="{s-32}" height="{s-32}" rx="6" '
        f'fill="none" stroke="{SLATE}" stroke-width="1.5" opacity="0.7"/>'
        f'<circle cx="{cx-half+26:.0f}" cy="{cy-half+26:.0f}" r="3" fill="{CYAN}"/>'
    )
    if label:
        inner += (f'<text x="{cx:.0f}" y="{cy+5:.0f}" text-anchor="middle" '
                  f'font-family="ui-monospace,monospace" font-size="13" font-weight="700" '
                  f'fill="{WHITE}" opacity="0.85">{esc(label)}</text>')
    return inner


def board(x, y, w, h):
    """A PCB panel with traces and pads."""
    traces = []
    for i, ty in enumerate([0.25, 0.5, 0.75]):
        yy = y + h * ty
        traces.append(f'<path d="M{x+14} {yy:.0f} h{w*0.3:.0f} l24 -20 h{w*0.4:.0f}" '
                      f'fill="none" stroke="{BLUE}" stroke-width="2" opacity="0.55"/>')
    pads = "".join(
        f'<circle cx="{x+w-28-i*22:.0f}" cy="{y+h-22:.0f}" r="4" fill="none" '
        f'stroke="{CYAN}" stroke-width="2" opacity="0.8"/>' for i in range(5)
    )
    return (
        f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="16" fill="url(#screen)" '
        f'stroke="{GRID}" stroke-width="2"/>'
        f'<g stroke-linecap="round">{"".join(traces)}</g>{pads}'
    )


def waveform(x, y, w, h, kind="sine"):
    cy = y + h / 2
    if kind == "square":
        d = f'M{x} {cy:.0f}'
        seg = w / 8
        up = True
        cx = x
        for _ in range(8):
            yy = y + h * 0.22 if up else y + h * 0.78
            d += f' L{cx:.0f} {yy:.0f} L{cx+seg:.0f} {yy:.0f}'
            cx += seg
            up = not up
    else:
        import math
        pts = []
        for i in range(0, int(w) + 1, 8):
            yy = cy - (h * 0.36) * math.sin(i / w * math.pi * 4)
            pts.append(f'{x+i:.0f},{yy:.0f}')
        d = 'M' + ' L'.join(pts)
    return (f'<path d="M{x} {cy:.0f} h{w}" stroke="{SLATE}" stroke-width="1" opacity="0.4"/>'
            f'<path d="{d}" fill="none" stroke="{CYAN}" stroke-width="3" '
            f'stroke-linecap="round" stroke-linejoin="round"/>')


def scope_screen(x, y, w, h, kind="sine"):
    grat = []
    for i in range(1, 6):
        grat.append(f'<line x1="{x+w*i/6:.0f}" y1="{y}" x2="{x+w*i/6:.0f}" y2="{y+h}"/>')
    for i in range(1, 4):
        grat.append(f'<line x1="{x}" y1="{y+h*i/4:.0f}" x2="{x+w}" y2="{y+h*i/4:.0f}"/>')
    return (
        f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="12" fill="url(#screen)" '
        f'stroke="{BLUE}" stroke-width="2"/>'
        f'<g stroke="{GRID}" stroke-width="1" opacity="0.8">{"".join(grat)}</g>'
        + waveform(x + 12, y + 8, w - 24, h - 16, kind)
    )


def battery(x, y, w, h, soc=0.7):
    cells = []
    for i in range(3):
        cells.append(f'<rect x="{x+10+i*(w-20)/3:.0f}" y="{y+10}" width="{(w-20)/3-8:.0f}" '
                     f'height="{h-20}" rx="4" fill="{BLUE}" opacity="{0.25+0.2*i}"/>')
    return (
        f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="10" fill="url(#screen)" '
        f'stroke="{CYAN}" stroke-width="2.5"/>'
        f'<rect x="{x+w}" y="{y+h*0.3:.0f}" width="10" height="{h*0.4:.0f}" rx="3" fill="{CYAN}"/>'
        f'{"".join(cells)}'
    )


def solar_panel(x, y, w, h):
    cells = []
    rows, cols = 3, 4
    for r in range(rows):
        for c in range(cols):
            cells.append(f'<rect x="{x+8+c*(w-16)/cols:.0f}" y="{y+8+r*(h-16)/rows:.0f}" '
                         f'width="{(w-16)/cols-5:.0f}" height="{(h-16)/rows-5:.0f}" rx="2" '
                         f'fill="{BLUE}" opacity="0.30" stroke="{CYAN}" stroke-width="1" />')
    return (f'<g transform="rotate(-8 {x+w/2:.0f} {y+h/2:.0f})">'
            f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="8" fill="#0c1a30" '
            f'stroke="{SLATE}" stroke-width="2"/>{"".join(cells)}</g>')


def motor(cx, cy, r=58):
    coils = []
    import math
    for a in (90, 210, 330):
        ax = cx + (r + 16) * math.cos(math.radians(a))
        ay = cy - (r + 16) * math.sin(math.radians(a))
        coils.append(f'<circle cx="{ax:.0f}" cy="{ay:.0f}" r="14" fill="none" '
                     f'stroke="{BLUE}" stroke-width="3" opacity="0.7"/>')
    return (
        f'{"".join(coils)}'
        f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="url(#screen)" stroke="{CYAN}" stroke-width="2.5"/>'
        f'<circle cx="{cx}" cy="{cy}" r="{r*0.45:.0f}" fill="none" stroke="{SLATE}" stroke-width="2"/>'
        f'<circle cx="{cx}" cy="{cy}" r="6" fill="{CYAN}"/>'
    )


def antenna(cx, cy):
    arcs = "".join(
        f'<path d="M{cx-2} {cy-2} a {r} {r} 0 0 1 {r} {r}" fill="none" stroke="{CYAN}" '
        f'stroke-width="2.5" opacity="{0.8-i*0.2}"/>' for i, r in enumerate((22, 40, 58))
    )
    return (
        f'<line x1="{cx}" y1="{cy}" x2="{cx}" y2="{cy+90}" stroke="{SLATE}" stroke-width="3"/>'
        f'<path d="M{cx-22} {cy+90} L{cx} {cy+50} L{cx+22} {cy+90}" fill="none" '
        f'stroke="{BLUE}" stroke-width="2.5"/>'
        f'<circle cx="{cx}" cy="{cy}" r="6" fill="{CYAN}"/>{arcs}'
    )


def connector_usbc(x, y, w=120, h=46):
    return (
        f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{h/2}" fill="url(#screen)" '
        f'stroke="{CYAN}" stroke-width="2.5"/>'
        f'<rect x="{x+14}" y="{y+h/2-5:.0f}" width="{w-28}" height="10" rx="5" fill="{BLUE}" opacity="0.6"/>'
        f'<line x1="{x+w}" y1="{y+h/2:.0f}" x2="{x+w+40}" y2="{y+h/2:.0f}" stroke="{SLATE}" stroke-width="4"/>'
    )


def meter_lcd(x, y, w, h):
    return (
        f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="12" fill="url(#screen)" '
        f'stroke="{BLUE}" stroke-width="2.5"/>'
        f'<rect x="{x+14}" y="{y+14}" width="{w-28}" height="{h*0.45:.0f}" rx="6" fill="#08131f" '
        f'stroke="{CYAN}" stroke-width="1.5"/>'
        f'<text x="{x+w/2:.0f}" y="{y+h*0.30+8:.0f}" text-anchor="middle" '
        f'font-family="ui-monospace,monospace" font-weight="700" font-size="26" '
        f'fill="{CYAN}">88.8</text>'
        f'<g fill="{BLUE}" opacity="0.5">'
        f'<rect x="{x+18}" y="{y+h*0.62:.0f}" width="{w*0.2:.0f}" height="10" rx="3"/>'
        f'<rect x="{x+18+w*0.26:.0f}" y="{y+h*0.62:.0f}" width="{w*0.2:.0f}" height="10" rx="3"/>'
        f'<rect x="{x+18+w*0.52:.0f}" y="{y+h*0.62:.0f}" width="{w*0.2:.0f}" height="10" rx="3"/></g>'
    )


def transformer(cx, cy):
    return (
        f'<rect x="{cx-14}" y="{cy-56}" width="28" height="112" rx="6" fill="#0c1a30" '
        f'stroke="{SLATE}" stroke-width="2"/>'
        + "".join(f'<path d="M{cx-50} {cy-40+i*20} q-18 10 0 20" fill="none" stroke="{BLUE}" '
                  f'stroke-width="3" opacity="0.8"/>' for i in range(5))
        + "".join(f'<path d="M{cx+50} {cy-40+i*20} q18 10 0 20" fill="none" stroke="{CYAN}" '
                  f'stroke-width="3" opacity="0.8"/>' for i in range(5))
    )


def block(x, y, w, h, text):
    return (
        f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="12" fill="url(#screen)" '
        f'stroke="{BLUE}" stroke-width="2.5"/>'
        f'<text x="{x+w/2:.0f}" y="{y+h/2+6:.0f}" text-anchor="middle" '
        f'font-family="ui-monospace,monospace" font-weight="700" font-size="20" '
        f'fill="{WHITE}" opacity="0.9">{esc(text)}</text>'
    )


def flow(x1, y1, x2, y2):
    return (f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="{CYAN}" stroke-width="2.5" '
            f'opacity="0.7" marker-end="url(#arrow)"/>')


def arrow_def():
    return (f'<marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" '
            f'markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" '
            f'fill="{CYAN}"/></marker>')


def eye_diagram(x, y, w, h):
    import math
    paths = []
    for off in range(-3, 4):
        d = f'M{x} {y+h/2:.0f}'
        for i in range(0, int(w) + 1, 6):
            yy = y + h / 2 - (h * 0.32) * math.sin((i / w * math.pi * 2) + off * 0.9)
            d += f' L{x+i:.0f} {yy:.0f}'
        paths.append(f'<path d="{d}" fill="none" stroke="{CYAN}" stroke-width="1.5" opacity="0.5"/>')
    return (f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="10" fill="url(#screen)" '
            f'stroke="{BLUE}" stroke-width="2"/>{"".join(paths)}')


# --------------------------------------------------------------------------
# Compose each illustration
# --------------------------------------------------------------------------

def il_hero_components():
    inner = frame("PCBA · EMS LINE")
    inner += board(150, 90, 360, 200)
    inner += chip(330, 190, 96, "MCU")
    inner += f'<g stroke="{CYAN}" stroke-width="2" opacity="0.7">' + \
             ''.join(f'<rect x="{180+i*60}" y="120" width="26" height="14" rx="3" fill="none"/>' for i in range(2)) + '</g>'
    return svg(inner)


def il_hero_instruments():
    inner = frame("LAB · TEST BENCH")
    inner += scope_screen(140, 80, 380, 200, "sine")
    inner += f'<rect x="140" y="292" width="380" height="22" rx="8" fill="#0c1a30" stroke="{GRID}" stroke-width="2"/>'
    inner += ''.join(f'<circle cx="{170+i*40}" cy="303" r="6" fill="{BLUE}" opacity="0.6"/>' for i in range(4))
    return svg(inner)


def il_hero_brands():
    inner = frame("PARTNER NETWORK")
    import math
    cx, cy = W / 2, H / 2 - 10
    nodes = []
    links = []
    pts = []
    for i in range(7):
        a = math.radians(i * 360 / 7 - 90)
        px, py = cx + 130 * math.cos(a), cy + 120 * math.sin(a)
        pts.append((px, py))
    for (px, py) in pts:
        links.append(f'<line x1="{cx}" y1="{cy}" x2="{px:.0f}" y2="{py:.0f}" stroke="{BLUE}" '
                     f'stroke-width="2" opacity="0.5"/>')
        nodes.append(f'<circle cx="{px:.0f}" cy="{py:.0f}" r="20" fill="#0c1a30" stroke="{CYAN}" stroke-width="2"/>')
    inner += "".join(links) + "".join(nodes)
    inner += f'<circle cx="{cx:.0f}" cy="{cy:.0f}" r="30" fill="url(#screen)" stroke="{CYAN}" stroke-width="2.5"/>'
    inner += f'<circle cx="{cx:.0f}" cy="{cy:.0f}" r="8" fill="{CYAN}"/>'
    return svg(inner)


def il_led_driver():
    inner = frame("LED DRIVER · 230V")
    inner += board(120, 80, 300, 210)
    inner += chip(220, 180, 78)
    # LED array
    leds = "".join(f'<circle cx="{460+ (i%3)*40}" cy="{120+(i//3)*46}" r="14" fill="{CYAN}" '
                   f'opacity="0.30" stroke="{CYAN}" stroke-width="2"/>' for i in range(6))
    inner += leds
    inner += f'<g markers>{arrow_marker()}</g>' if False else ''
    return svg(inner)


def arrow_marker():
    return ''


def il_gan_charger():
    inner = frame("65W GaN · USB-PD")
    inner += f'<rect x="150" y="95" width="180" height="180" rx="26" fill="url(#screen)" stroke="{BLUE}" stroke-width="2.5"/>'
    inner += f'<rect x="232" y="70" width="16" height="30" rx="4" fill="{SLATE}"/>'
    inner += f'<rect x="262" y="70" width="16" height="30" rx="4" fill="{SLATE}"/>'
    inner += f'<text x="240" y="195" text-anchor="middle" font-family="ui-monospace,monospace" font-weight="800" font-size="34" fill="{CYAN}">65W</text>'
    inner += connector_usbc(380, 162)
    return svg(inner)


def il_smps():
    inner = frame("SMPS · ADAPTER")
    inner += board(110, 80, 320, 210)
    inner += transformer(250, 185)
    inner += chip(370, 250, 56)
    return svg(inner)


def il_smart_meter():
    inner = frame("SMART METER")
    inner += meter_lcd(180, 90, 280, 190)
    return svg(inner)


def il_ev_ac_charger():
    inner = frame("EV AC CHARGER · 7.4kW")
    inner += f'<rect x="220" y="70" width="120" height="220" rx="22" fill="url(#screen)" stroke="{CYAN}" stroke-width="2.5"/>'
    inner += meter_lcd(244, 96, 72, 60)
    inner += f'<path d="M280 170 l-16 44 h14 l-10 40" fill="none" stroke="{CYAN}" stroke-width="4" stroke-linejoin="round"/>'
    inner += connector_usbc(360, 200, 110, 40)
    return svg(inner)


def il_ev_2w3w():
    inner = frame("EV 2W / 3W CHARGER")
    inner += battery(150, 150, 150, 90, 0.7)
    inner += block(360, 150, 130, 90, "DC-DC")
    inner += flow(305, 195, 355, 195)
    return svg(inner)


def il_solar():
    inner = frame("SOLAR STRING INVERTER")
    inner += solar_panel(120, 110, 200, 150)
    inner += block(380, 150, 130, 90, "INV")
    inner += flow(335, 190, 375, 190)
    return svg(inner)


def il_bldc():
    inner = frame("BLDC MOTOR DRIVER")
    inner += motor(220, 185, 60)
    inner += board(330, 110, 200, 150)
    inner += chip(430, 185, 64, "3PH")
    return svg(inner)


def il_appliance():
    inner = frame("APPLIANCE CONTROL · 230V")
    inner += board(140, 90, 360, 200)
    inner += chip(250, 190, 76, "MCU")
    inner += f'<rect x="380" y="150" width="80" height="80" rx="10" fill="none" stroke="{CYAN}" stroke-width="2.5"/>'
    inner += f'<circle cx="420" cy="190" r="22" fill="none" stroke="{BLUE}" stroke-width="3"/>'
    return svg(inner)


def il_ins_signal_debug():
    inner = frame("SIGNAL DEBUG · MSO")
    inner += scope_screen(120, 80, 400, 210, "square")
    return svg(inner)


def il_ins_high_bw():
    inner = frame("HIGH-BW · SIGNAL INTEGRITY")
    inner += eye_diagram(140, 90, 360, 190)
    return svg(inner)


def il_ins_education():
    inner = frame("EDUCATION · LAB BENCH")
    inner += scope_screen(110, 80, 230, 150, "sine")
    inner += block(360, 80, 160, 66, "DC PSU")
    inner += meter_lcd(360, 164, 160, 66)
    return svg(inner)


def il_ins_ev_power():
    inner = frame("EV · BATTERY · POWER TEST")
    inner += battery(130, 150, 150, 90)
    inner += block(340, 90, 170, 70, "PROG DC")
    inner += block(340, 178, 170, 70, "E-LOAD")
    inner += flow(285, 195, 335, 150)
    inner += flow(335, 213, 285, 205)
    return svg(inner)


def il_ins_transformer():
    inner = frame("TRANSFORMER · COIL TEST")
    inner += transformer(250, 185)
    inner += meter_lcd(360, 130, 170, 110)
    return svg(inner)


def il_ins_cable():
    inner = frame("CABLE HARNESS · USB-C")
    inner += connector_usbc(150, 110, 130, 50)
    inner += connector_usbc(150, 200, 130, 50)
    inner += f'<path d="M320 135 C 400 135 400 225 480 225" fill="none" stroke="{BLUE}" stroke-width="3" opacity="0.7"/>'
    inner += f'<path d="M320 225 C 400 225 400 135 480 135" fill="none" stroke="{CYAN}" stroke-width="3" opacity="0.7"/>'
    inner += meter_lcd(470, 150, 120, 70) if False else ''
    return svg(inner)


def il_ins_rf():
    inner = frame("RF · TELECOM · ANTENNA")
    inner += antenna(200, 110)
    inner += scope_screen(330, 150, 200, 130, "sine")
    return svg(inner)


def il_ins_smu():
    inner = frame("PRECISION SMU · I-V")
    inner += scope_screen(120, 80, 250, 210, "sine")
    # IV curve overlay
    inner += f'<path d="M150 250 C 230 250 250 130 360 110" fill="none" stroke="{CYAN}" stroke-width="3"/>'
    inner += chip(460, 185, 80, "DUT")
    return svg(inner)


def il_ins_field():
    inner = frame("FIELD ELECTRICAL · CLAMP")
    inner += f'<path d="M250 120 a70 70 0 1 0 70 70" fill="none" stroke="{CYAN}" stroke-width="10" opacity="0.8"/>'
    inner += f'<rect x="250" y="150" width="70" height="130" rx="14" fill="url(#screen)" stroke="{BLUE}" stroke-width="2.5"/>'
    inner += meter_lcd(258, 162, 54, 50)
    return svg(inner)


def il_brand_semiconductor():
    inner = frame("SEMICONDUCTOR · WAFER")
    # wafer
    cx, cy, r = 230, 185, 95
    dies = []
    for gx in range(-3, 4):
        for gy in range(-3, 4):
            dx, dy = gx * 26, gy * 26
            if (dx*dx + dy*dy) ** 0.5 < r - 14:
                dies.append(f'<rect x="{cx+dx-10:.0f}" y="{cy+dy-10:.0f}" width="20" height="20" rx="3" '
                            f'fill="{BLUE}" fill-opacity="0.18" stroke="{CYAN}" stroke-width="1" stroke-opacity="0.5"/>')
    inner += (f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="url(#screen)" stroke="{SLATE}" stroke-width="2"/>'
              f'<clipPath id="wfc"><circle cx="{cx}" cy="{cy}" r="{r-4}"/></clipPath>'
              f'<g clip-path="url(#wfc)">{"".join(dies)}</g>'
              f'<line x1="{cx+r*0.6:.0f}" y1="{cy+r*0.78:.0f}" x2="{cx+r*0.95:.0f}" y2="{cy+r*0.5:.0f}" '
              f'stroke="{CYAN}" stroke-width="3"/>')
    inner += chip(470, 185, 88, "IC")
    return svg(inner)


def il_brand_mosfet():
    inner = frame("POWER MOSFET · SiC")
    inner += board(110, 80, 280, 210)
    inner += chip(250, 185, 96, "MOSFET")
    inner += scope_screen(420, 120, 150, 130, "square")
    return svg(inner)


def il_brand_diode():
    inner = frame("DIODES · BRIDGE RECTIFIER")
    # bridge diamond of 4 diodes
    cx, cy, s = 250, 185, 70

    def diode(x, y, rot):
        return (f'<g transform="translate({x},{y}) rotate({rot})">'
                f'<path d="M-16 -14 L16 0 L-16 14 Z" fill="none" stroke="{CYAN}" stroke-width="2.5"/>'
                f'<line x1="16" y1="-14" x2="16" y2="14" stroke="{BLUE}" stroke-width="3"/></g>')
    inner += (f'<path d="M{cx} {cy-s} L{cx+s} {cy} L{cx} {cy+s} L{cx-s} {cy} Z" '
              f'fill="none" stroke="{SLATE}" stroke-width="2" opacity="0.5"/>')
    inner += diode(cx, cy - s + 18, -45) + diode(cx + s - 18, cy, 45)
    inner += diode(cx, cy + s - 18, -135) + diode(cx - s + 18, cy, 135)
    for px, py in ((cx, cy-s), (cx+s, cy), (cx, cy+s), (cx-s, cy)):
        inner += f'<circle cx="{px}" cy="{py}" r="5" fill="{CYAN}"/>'
    inner += chip(470, 185, 76)
    return svg(inner)


def il_brand_protection():
    inner = frame("SURGE · PROTECTION")
    # shield with bolt
    inner += (f'<path d="M250 90 L320 116 V190 C320 240 285 268 250 282 '
              f'C215 268 180 240 180 190 V116 Z" fill="url(#screen)" stroke="{CYAN}" stroke-width="2.5"/>')
    inner += f'<path d="M256 140 L232 196 H252 L244 240 L278 178 H256 Z" fill="{BLUE}" opacity="0.8" stroke="{CYAN}" stroke-width="1.5"/>'
    # varistor disc
    inner += f'<circle cx="450" cy="185" r="46" fill="none" stroke="{BLUE}" stroke-width="3"/>'
    inner += f'<line x1="450" y1="139" x2="450" y2="119" stroke="{SLATE}" stroke-width="3"/>'
    inner += f'<line x1="450" y1="231" x2="450" y2="251" stroke="{SLATE}" stroke-width="3"/>'
    inner += f'<text x="450" y="192" text-anchor="middle" font-family="ui-monospace,monospace" font-weight="700" font-size="14" fill="{CYAN}">MOV</text>'
    return svg(inner)


def il_brand_passives():
    inner = frame("MLCC · PASSIVES")
    # MLCC stack
    for i in range(4):
        inner += f'<rect x="{150+i*18}" y="{120+i*8}" width="80" height="56" rx="8" fill="url(#screen)" stroke="{CYAN}" stroke-width="2" opacity="{0.6+i*0.12}"/>'
    # resistor with bands
    rx, ry = 360, 170
    inner += f'<rect x="{rx}" y="{ry}" width="150" height="46" rx="23" fill="url(#screen)" stroke="{BLUE}" stroke-width="2.5"/>'
    for i, c in enumerate((CYAN, BLUE, SLATE, CYAN)):
        inner += f'<rect x="{rx+30+i*20}" y="{ry+6}" width="8" height="34" rx="3" fill="{c}" opacity="0.85"/>'
    inner += f'<line x1="{rx-26}" y1="{ry+23}" x2="{rx}" y2="{ry+23}" stroke="{SLATE}" stroke-width="3"/>'
    inner += f'<line x1="{rx+150}" y1="{ry+23}" x2="{rx+176}" y2="{ry+23}" stroke="{SLATE}" stroke-width="3"/>'
    return svg(inner)


def il_brand_fuse():
    inner = frame("FUSES · EV PROTECTION")
    # fuse body
    inner += f'<rect x="150" y="160" width="200" height="56" rx="28" fill="url(#screen)" stroke="{CYAN}" stroke-width="2.5"/>'
    inner += f'<rect x="138" y="172" width="18" height="32" rx="4" fill="{SLATE}"/>'
    inner += f'<rect x="344" y="172" width="18" height="32" rx="4" fill="{SLATE}"/>'
    inner += f'<path d="M168 188 q20 -22 40 0 t40 0 t40 0" fill="none" stroke="{BLUE}" stroke-width="3"/>'
    # EV plug
    inner += connector_usbc(400, 165, 110, 46)
    return svg(inner)


# ---- registry: key -> builder ----
BUILDERS = {
    "brand-semiconductor": il_brand_semiconductor,
    "brand-mosfet": il_brand_mosfet,
    "brand-diode": il_brand_diode,
    "brand-protection": il_brand_protection,
    "brand-passives": il_brand_passives,
    "brand-fuse": il_brand_fuse,
    "hero-components": il_hero_components,
    "hero-instruments": il_hero_instruments,
    "hero-brands": il_hero_brands,
    "app-led-driver": il_led_driver,
    "app-gan-charger": il_gan_charger,
    "app-smps": il_smps,
    "app-smart-meter": il_smart_meter,
    "app-ev-ac-charger": il_ev_ac_charger,
    "app-ev-2w3w": il_ev_2w3w,
    "app-solar": il_solar,
    "app-bldc": il_bldc,
    "app-appliance": il_appliance,
    "ins-signal-debug": il_ins_signal_debug,
    "ins-high-bw": il_ins_high_bw,
    "ins-education": il_ins_education,
    "ins-ev-power": il_ins_ev_power,
    "ins-transformer": il_ins_transformer,
    "ins-cable": il_ins_cable,
    "ins-rf": il_ins_rf,
    "ins-smu": il_ins_smu,
    "ins-field": il_ins_field,
    # brand-page category banners
    "brand-instruments": il_hero_instruments,
    "brand-components": il_hero_components,
}

# ---- map data-hint substrings -> key + alt text ----
HINT_MAP = [
    ("Brands hero", "hero-brands", "Silicom brand partner network"),
    ("Components hero", "hero-components", "Electronics PCB assembly and EMS line"),
    ("Instruments hero", "hero-instruments", "Test and measurement lab bench"),
    ("LED Driver", "app-led-driver", "LED driver board with components"),
    ("GaN USB-PD Charger", "app-gan-charger", "65W GaN USB-PD charger"),
    ("SMPS / Adapter", "app-smps", "SMPS adapter board with transformer"),
    ("Smart Meter", "app-smart-meter", "Smart energy meter board"),
    ("EV AC Charger", "app-ev-ac-charger", "EV AC charger 7.4 kW"),
    ("EV 2W / 3W Charger", "app-ev-2w3w", "EV two- and three-wheeler charger"),
    ("Solar String Inverter", "app-solar", "Solar string inverter with PV panel"),
    ("BLDC Motor Driver", "app-bldc", "BLDC motor driver board"),
    ("Appliance Control Board", "app-appliance", "Appliance control board"),
    ("Signal debugging", "ins-signal-debug", "Oscilloscope signal debugging bench"),
    ("High-bandwidth validation", "ins-high-bw", "High-bandwidth signal integrity eye diagram"),
    ("Education & lab benches", "ins-education", "Education and lab test bench"),
    ("EV / battery / power test", "ins-ev-power", "EV battery and power test setup"),
    ("Transformer & coil test", "ins-transformer", "Transformer and coil test setup"),
    ("Cable harness", "ins-cable", "Cable harness and USB-C cable tester"),
    ("RF", "ins-rf", "RF telecom and antenna test"),
    ("Precision SMU", "ins-smu", "Precision SMU and semiconductor parameter test"),
    ("Field electrical maintenance", "ins-field", "Field electrical maintenance with clamp meter"),
]


def key_for_hint(hint):
    for sub, key, alt in HINT_MAP:
        if sub in hint:
            return key, alt
    return None, None


# --------------------------------------------------------------------------
# Generate SVG files
# --------------------------------------------------------------------------

def write_svgs():
    os.makedirs(OUT, exist_ok=True)
    # inject arrow marker into defs for those that use flow()
    for key, fn in BUILDERS.items():
        content = fn()
        if "url(#arrow)" in content and "<marker id=\"arrow\"" not in content:
            content = content.replace("<defs>", "<defs>" + arrow_def(), 1)
        with open(os.path.join(OUT, key + ".svg"), "w", encoding="utf-8") as f:
            f.write(content)
    print(f"wrote {len(BUILDERS)} SVGs to assets/illustrations/")


# --------------------------------------------------------------------------
# Inject <img> into every empty .image-slot
# --------------------------------------------------------------------------

def patch_page(filename):
    path = os.path.join(ROOT, filename)
    with open(path, "r", encoding="utf-8") as f:
        src = f.read()

    def repl(m):
        tag = m.group(0)
        if "slot-img" in tag:
            return tag  # already filled
        hm = re.search(r'data-hint="([^"]*)"', tag)
        if not hm:
            return tag
        key, alt = key_for_hint(hm.group(1))
        if not key:
            return tag
        img = (f'<img class="slot-img" src="assets/illustrations/{key}.svg" '
               f'alt="{esc(alt)}" loading="lazy" decoding="async" />')
        # insert before closing </div>
        return tag[:-6] + img + "</div>"

    # match a complete <div class="image-slot ...> ... </div> with no nested div
    src2 = re.sub(r'<div class="image-slot[^>]*>\s*</div>', repl, src)
    if src2 != src:
        with open(path, "w", encoding="utf-8") as f:
            f.write(src2)
        print(f"patched {filename}")
    else:
        print(f"no change {filename}")


def ensure_slot_css():
    path = os.path.join(ROOT, "styles.css")
    with open(path, "r", encoding="utf-8") as f:
        css = f.read()
    if ".image-slot .slot-img" in css:
        return
    rule = (
        "\n.image-slot .slot-img {\n"
        "  position: absolute; inset: 0; width: 100%; height: 100%;\n"
        "  object-fit: cover; display: block; z-index: 1;\n"
        "}\n"
    )
    # place right after the .image-slot::after block
    css = css.replace("[data-theme=\"dark\"] .image-slot {", rule + "[data-theme=\"dark\"] .image-slot {", 1)
    with open(path, "w", encoding="utf-8") as f:
        f.write(css)
    print("added .slot-img CSS")


def main():
    write_svgs()
    ensure_slot_css()
    for p in ("brands.html", "components.html", "instruments.html"):
        patch_page(p)
    print("done")


if __name__ == "__main__":
    main()
