# Rewrites components.html — replaces 4 stale sections with the new Applications
# accordion + Brand showcase accordion. Keeps Hero, RFQ banner, CTA, footer.
import re, pathlib

f = pathlib.Path("components.html")
src = f.read_text(encoding="utf-8")

# --- New Application accordion (replaces BoM + Function picks + Categories) ---
NEW_APP_SECTION = '''<!-- APPLICATIONS — expandable per-application item lists -->
<section class="section">
  <div class="container">
    <div class="section-head reveal">
      <div>
        <div class="eyebrow"><span class="dot"></span>Applications</div>
        <h2 class="h2" style="margin-top:12px">Start from what you're building.</h2>
        <p class="muted" style="font-size:14.5px;max-width:60ch;margin-top:10px">Click any application to see the specific items Silicom carries for that design. Items are grouped by function, with the brand chip per line so you can match your AVL.</p>
      </div>
      <a class="btn btn-ghost btn-arrow" href="contact.html">Send a BOM
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </a>
    </div>

    <div class="category-grid">

      <article class="category-card glass reveal" id="app-led-driver">
        <div class="category-head">
          <div class="category-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M9 18h6M10 22h4M12 2a7 7 0 00-4 12c1 1 1 2 1 3h6c0-1 0-2 1-3a7 7 0 00-4-12z"/></svg></div>
          <div><div class="category-title">LED Driver (230V mains, 9–60 W)</div><div class="category-meta">Bulbs · tubes · panels · street &amp; outdoor lighting</div></div>
          <button class="category-toggle" aria-label="Expand"><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button>
        </div>
        <div class="category-body"><div class="category-body-inner">
          <div class="app-item-list">
            <div class="app-item"><div class="app-item-name">600 V Bridge Rectifier<span class="app-item-pkg">KBP / MB DIP-4 · SMD bridge</span></div><span class="app-item-source">ASEMI (ASM)</span></div>
            <div class="app-item"><div class="app-item-name">HV Cool MOS — 600–800 V primary switch<span class="app-item-pkg">TO-220 / DPAK · quasi-resonant ready</span></div><span class="app-item-source">Reasunos</span></div>
            <div class="app-item"><div class="app-item-name">Hi-V MOSFET (alternative primary)<span class="app-item-pkg">TO-220 / DPAK · trench</span></div><span class="app-item-source">MOT Inmark</span></div>
            <div class="app-item"><div class="app-item-name">Output Schottky / FRD<span class="app-item-pkg">SMA / SMB · low V<sub>F</sub></span></div><span class="app-item-source">Jilin Sino</span></div>
            <div class="app-item"><div class="app-item-name">Fast-Recovery diodes (output)<span class="app-item-pkg">SMB / DPAK</span></div><span class="app-item-source">MOT Inmark</span></div>
            <div class="app-item"><div class="app-item-name">TVS / transient protection<span class="app-item-pkg">SMA / SMB high-energy</span></div><span class="app-item-source">Jilin Sino / CDIL</span></div>
            <div class="app-item"><div class="app-item-name">Mains-side MOV (street &amp; outdoor)<span class="app-item-pkg">7D561 · 7D621 disc varistors</span></div><span class="app-item-source">Surging</span></div>
            <div class="app-item"><div class="app-item-name">MLCC + SMD passives<span class="app-item-pkg">MLCC · resistors · film caps</span></div><span class="app-item-source">MLCC Base</span></div>
          </div>
          <div class="app-item-foot">
            <span class="muted" style="font-size:13px">LED driver IC sourced on RFQ</span>
            <a class="btn-arrow" href="contact.html?bom=led-driver" style="font-weight:600;color:var(--accent-ink);display:inline-flex;align-items:center;gap:6px;font-size:14px">Send my BoM
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </a>
          </div>
        </div></div>
      </article>

      <article class="category-card glass reveal" id="app-gan-charger">
        <div class="category-head">
          <div class="category-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z"/></svg></div>
          <div><div class="category-title">65 W GaN USB-PD Charger</div><div class="category-meta">Laptop / fast-charge adapter · compact form factor</div></div>
          <button class="category-toggle" aria-label="Expand"><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button>
        </div>
        <div class="category-body"><div class="category-body-inner">
          <div class="app-item-list">
            <div class="app-item"><div class="app-item-name">GaN power IC — primary stage<span class="app-item-pkg">Integrated GaN + driver</span></div><span class="app-item-source">Shikues</span></div>
            <div class="app-item"><div class="app-item-name">PWM controller — flyback / QR<span class="app-item-pkg">SOP-8 / DIP-8</span></div><span class="app-item-source">Shikues</span></div>
            <div class="app-item"><div class="app-item-name">Sync-rectifier MOSFET (output)<span class="app-item-pkg">SOP-8 / DFN · low R<sub>DS(on)</sub></span></div><span class="app-item-source">Reasunos</span></div>
            <div class="app-item"><div class="app-item-name">SMD input bridge<span class="app-item-pkg">Compact-package bridge for tight enclosure</span></div><span class="app-item-source">ASEMI (ASM)</span></div>
            <div class="app-item"><div class="app-item-name">USB-C TVS / ESD arrays<span class="app-item-pkg">SOT-23-6 multi-line · VBUS &amp; CC</span></div><span class="app-item-source">Jilin Sino</span></div>
            <div class="app-item"><div class="app-item-name">MLCC + SMD passives<span class="app-item-pkg">Y-cap · X-cap · MLCC</span></div><span class="app-item-source">MLCC Base</span></div>
          </div>
          <div class="app-item-foot">
            <span class="muted" style="font-size:13px">USB-PD controller sourced on RFQ</span>
            <a class="btn-arrow" href="contact.html?bom=65w-gan-charger" style="font-weight:600;color:var(--accent-ink);display:inline-flex;align-items:center;gap:6px;font-size:14px">Send my BoM
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </a>
          </div>
        </div></div>
      </article>

      <article class="category-card glass reveal" id="app-smps">
        <div class="category-head">
          <div class="category-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="6" width="18" height="12" rx="1"/><path d="M7 10h2v4H7zM12 10h5"/></svg></div>
          <div><div class="category-title">Standard SMPS / Adapter (5–30 W)</div><div class="category-meta">Set-top boxes · routers · retail chargers · auxiliary supplies</div></div>
          <button class="category-toggle" aria-label="Expand"><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button>
        </div>
        <div class="category-body"><div class="category-body-inner">
          <div class="app-item-list">
            <div class="app-item"><div class="app-item-name">Primary HV MOSFET — 600–700 V<span class="app-item-pkg">TO-220 / DPAK · Cool MOS</span></div><span class="app-item-source">Reasunos</span></div>
            <div class="app-item"><div class="app-item-name">Primary MOSFET (alternative trench)<span class="app-item-pkg">TO-220 · hi-V</span></div><span class="app-item-source">MOT Inmark</span></div>
            <div class="app-item"><div class="app-item-name">Input bridge rectifier<span class="app-item-pkg">DIP-4 KBP / SMD bridge</span></div><span class="app-item-source">ASEMI (ASM)</span></div>
            <div class="app-item"><div class="app-item-name">Output Schottky<span class="app-item-pkg">SMA / SMB · 40–100 V</span></div><span class="app-item-source">Jilin Sino</span></div>
            <div class="app-item"><div class="app-item-name">Zener / small-signal diodes<span class="app-item-pkg">SOD-123 / 323 · reference &amp; clamps</span></div><span class="app-item-source">Jilin Sino</span></div>
            <div class="app-item"><div class="app-item-name">TVS / surge protection<span class="app-item-pkg">SMA / SMB</span></div><span class="app-item-source">Jilin Sino / CDIL</span></div>
            <div class="app-item"><div class="app-item-name">MLCC + R + film caps<span class="app-item-pkg">SMD passives</span></div><span class="app-item-source">MLCC Base</span></div>
          </div>
          <div class="app-item-foot">
            <span class="muted" style="font-size:13px">PWM controller IC sourced on RFQ</span>
            <a class="btn-arrow" href="contact.html?bom=smps-adapter" style="font-weight:600;color:var(--accent-ink);display:inline-flex;align-items:center;gap:6px;font-size:14px">Send my BoM
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </a>
          </div>
        </div></div>
      </article>

      <article class="category-card glass reveal" id="app-smart-meter">
        <div class="category-head">
          <div class="category-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 7h8M8 11h8M8 15h5"/></svg></div>
          <div><div class="category-title">Smart Meter — SMPS &amp; mains protection</div><div class="category-meta">RDSS rollout · single &amp; three-phase residential meters</div></div>
          <button class="category-toggle" aria-label="Expand"><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button>
        </div>
        <div class="category-body"><div class="category-body-inner">
          <div class="app-item-list">
            <div class="app-item"><div class="app-item-name">Mains-side TVS array<span class="app-item-pkg">SMA / SMB high-energy clamp</span></div><span class="app-item-source">Jilin Sino / CDIL</span></div>
            <div class="app-item"><div class="app-item-name">Line-side MOV<span class="app-item-pkg">7D561 · 7D621 · 10D / 14D disc</span></div><span class="app-item-source">Surging</span></div>
            <div class="app-item"><div class="app-item-name">Auxiliary SMPS MOSFET<span class="app-item-pkg">TO-220 / DPAK · small flyback switch</span></div><span class="app-item-source">Reasunos / MOT Inmark</span></div>
            <div class="app-item"><div class="app-item-name">Output Schottky<span class="app-item-pkg">SMA / SMB rectifier</span></div><span class="app-item-source">Jilin Sino</span></div>
            <div class="app-item"><div class="app-item-name">Comm-line ESD arrays<span class="app-item-pkg">SOT-23-6 multi-line for RS-485 / RF</span></div><span class="app-item-source">Jilin Sino / CDIL</span></div>
            <div class="app-item"><div class="app-item-name">SMD passives<span class="app-item-pkg">MLCC · current-sense resistors</span></div><span class="app-item-source">MLCC Base</span></div>
          </div>
          <div class="app-item-foot">
            <span class="muted" style="font-size:13px">MCU &amp; latching relays sourced on RFQ</span>
            <a class="btn-arrow" href="contact.html?bom=smart-meter" style="font-weight:600;color:var(--accent-ink);display:inline-flex;align-items:center;gap:6px;font-size:14px">Send my BoM
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </a>
          </div>
        </div></div>
      </article>

      <article class="category-card glass reveal" id="app-ev-ac-charger">
        <div class="category-head">
          <div class="category-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M5 11l-2 9h7l-1-5h6l-1 5h7l-2-9M7 11V6l5-4 5 4v5"/></svg></div>
          <div><div class="category-title">EV AC Charger (3.3 – 7.4 kW)</div><div class="category-meta">Residential &amp; light-commercial Type-2 / CCS2</div></div>
          <button class="category-toggle" aria-label="Expand"><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button>
        </div>
        <div class="category-body"><div class="category-body-inner">
          <div class="app-item-list">
            <div class="app-item"><div class="app-item-name">Hi-V trench MOSFETs (power stage)<span class="app-item-pkg">TO-220 / TO-247</span></div><span class="app-item-source">MOT Inmark / Reasunos</span></div>
            <div class="app-item"><div class="app-item-name">Cool IGBT modules (auxiliary)<span class="app-item-pkg">High-current switch packs</span></div><span class="app-item-source">Donghai / WXDH</span></div>
            <div class="app-item"><div class="app-item-name">Automotive EV fuses (in-line)<span class="app-item-pkg">AEC-grade automotive fuse holders</span></div><span class="app-item-source">Adler EV</span></div>
            <div class="app-item"><div class="app-item-name">Low-voltage block fuses<span class="app-item-pkg">For pilot / aux 12 V supplies</span></div><span class="app-item-source">Adler EV</span></div>
            <div class="app-item"><div class="app-item-name">CCS / CAN comm TVS<span class="app-item-pkg">PLC &amp; CAN protection arrays</span></div><span class="app-item-source">Jilin Sino / CDIL</span></div>
            <div class="app-item"><div class="app-item-name">Mains surge MOV bank<span class="app-item-pkg">7D / 10D / 14D varistor banks</span></div><span class="app-item-source">Surging</span></div>
          </div>
          <div class="app-item-foot">
            <span class="muted" style="font-size:13px">Gate drivers &amp; PLC ICs sourced on RFQ</span>
            <a class="btn-arrow" href="contact.html?bom=ev-ac-charger" style="font-weight:600;color:var(--accent-ink);display:inline-flex;align-items:center;gap:6px;font-size:14px">Send my BoM
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </a>
          </div>
        </div></div>
      </article>

      <article class="category-card glass reveal" id="app-ev-2w">
        <div class="category-head">
          <div class="category-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="6" cy="17" r="3"/><circle cx="18" cy="17" r="3"/><path d="M6 17l4-10h5l3 10M14 7l-2 0"/></svg></div>
          <div><div class="category-title">EV 2W / 3W Charger (700 W – 3.3 kW)</div><div class="category-meta">On-board &amp; portable charger banks for e-2W / e-3W</div></div>
          <button class="category-toggle" aria-label="Expand"><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button>
        </div>
        <div class="category-body"><div class="category-body-inner">
          <div class="app-item-list">
            <div class="app-item"><div class="app-item-name">Cool IGBT &amp; SGT switches<span class="app-item-pkg">Compact high-frequency switching</span></div><span class="app-item-source">Donghai / WXDH</span></div>
            <div class="app-item"><div class="app-item-name">SiC diodes (output rectification)<span class="app-item-pkg">TO-220 · TO-247</span></div><span class="app-item-source">MOT Inmark / Shikues</span></div>
            <div class="app-item"><div class="app-item-name">EV block fuse (battery line)<span class="app-item-pkg">Low-voltage in-line fuse block</span></div><span class="app-item-source">Adler EV</span></div>
            <div class="app-item"><div class="app-item-name">Battery-line TVS / over-V<span class="app-item-pkg">SMA / SMB high-energy clamp</span></div><span class="app-item-source">Jilin Sino / Reasunos</span></div>
            <div class="app-item"><div class="app-item-name">BLDC driver bundle (for integrated controllers)<span class="app-item-pkg">3-phase driver building block</span></div><span class="app-item-source">CDIL</span></div>
            <div class="app-item"><div class="app-item-name">MLCC &amp; bulk caps<span class="app-item-pkg">DC-link snubbing</span></div><span class="app-item-source">MLCC Base</span></div>
          </div>
          <div class="app-item-foot">
            <span class="muted" style="font-size:13px">Battery-protect IC sourced on RFQ</span>
            <a class="btn-arrow" href="contact.html?bom=ev-2w-charger" style="font-weight:600;color:var(--accent-ink);display:inline-flex;align-items:center;gap:6px;font-size:14px">Send my BoM
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </a>
          </div>
        </div></div>
      </article>

      <article class="category-card glass reveal" id="app-solar">
        <div class="category-head">
          <div class="category-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="4"/><path d="M12 2v3M12 19v3M5 12H2M22 12h-3M5 5l2 2M17 17l2 2M5 19l2-2M17 7l2-2"/></svg></div>
          <div><div class="category-title">Solar String Inverter (3 – 50 kW)</div><div class="category-meta">Rooftop &amp; commercial inverters · PM Surya Ghar pull</div></div>
          <button class="category-toggle" aria-label="Expand"><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button>
        </div>
        <div class="category-body"><div class="category-body-inner">
          <div class="app-item-list">
            <div class="app-item"><div class="app-item-name">SiC MOSFETs (DC boost / MPPT)<span class="app-item-pkg">TO-247 · hi-V</span></div><span class="app-item-source">Reasunos / Shikues</span></div>
            <div class="app-item"><div class="app-item-name">Cool IGBT (inverter bridge)<span class="app-item-pkg">PV-grade IGBT modules</span></div><span class="app-item-source">Donghai / WXDH</span></div>
            <div class="app-item"><div class="app-item-name">Schottky / SiC diodes<span class="app-item-pkg">Freewheel + boost rectification</span></div><span class="app-item-source">Jilin Sino / MOT Inmark</span></div>
            <div class="app-item"><div class="app-item-name">DC + AC TVS / MOV banks<span class="app-item-pkg">PV string &amp; AC-out protection</span></div><span class="app-item-source">Surging / CDIL</span></div>
            <div class="app-item"><div class="app-item-name">MLCC + bulk passives<span class="app-item-pkg">DC-link snubbing &amp; decoupling</span></div><span class="app-item-source">MLCC Base</span></div>
          </div>
          <div class="app-item-foot">
            <span class="muted" style="font-size:13px">Gate drivers sourced on RFQ</span>
            <a class="btn-arrow" href="contact.html?bom=solar-inverter" style="font-weight:600;color:var(--accent-ink);display:inline-flex;align-items:center;gap:6px;font-size:14px">Send my BoM
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </a>
          </div>
        </div></div>
      </article>

      <article class="category-card glass reveal" id="app-bldc">
        <div class="category-head">
          <div class="category-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3"/></svg></div>
          <div><div class="category-title">BLDC Motor Driver (fans · e-2W/3W · appliances)</div><div class="category-meta">Integrated 3-phase motor-controller boards</div></div>
          <button class="category-toggle" aria-label="Expand"><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button>
        </div>
        <div class="category-body"><div class="category-body-inner">
          <div class="app-item-list">
            <div class="app-item"><div class="app-item-name">BLDC driver module<span class="app-item-pkg">3-phase pre-driver building block</span></div><span class="app-item-source">CDIL</span></div>
            <div class="app-item"><div class="app-item-name">Power-stage trench MOSFETs<span class="app-item-pkg">DPAK / TO-220 · LV–MV</span></div><span class="app-item-source">MOT Inmark / Reasunos</span></div>
            <div class="app-item"><div class="app-item-name">Free-wheel Schottky<span class="app-item-pkg">SMA / SMB · low V<sub>F</sub></span></div><span class="app-item-source">Jilin Sino</span></div>
            <div class="app-item"><div class="app-item-name">Gate &amp; supply TVS clamps<span class="app-item-pkg">SOD-123 / SMA</span></div><span class="app-item-source">Jilin Sino / CDIL</span></div>
            <div class="app-item"><div class="app-item-name">SMD passives (current-sense + decoupling)<span class="app-item-pkg">MLCC · resistors</span></div><span class="app-item-source">MLCC Base</span></div>
          </div>
          <div class="app-item-foot">
            <span class="muted" style="font-size:13px">Hall sensors &amp; MCU sourced on RFQ</span>
            <a class="btn-arrow" href="contact.html?bom=bldc-driver" style="font-weight:600;color:var(--accent-ink);display:inline-flex;align-items:center;gap:6px;font-size:14px">Send my BoM
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </a>
          </div>
        </div></div>
      </article>

      <article class="category-card glass reveal" id="app-appliance">
        <div class="category-head">
          <div class="category-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M4 9h16M9 14h.01M9 17h.01"/></svg></div>
          <div><div class="category-title">Appliance Control Board (230V)</div><div class="category-meta">AC / fridge / washing machine / fan control PCBAs</div></div>
          <button class="category-toggle" aria-label="Expand"><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button>
        </div>
        <div class="category-body"><div class="category-body-inner">
          <div class="app-item-list">
            <div class="app-item"><div class="app-item-name">Logic-side MOSFETs<span class="app-item-pkg">SOT-23 / SOP-8 LV switching</span></div><span class="app-item-source">Reasunos / MOT Inmark</span></div>
            <div class="app-item"><div class="app-item-name">Bridge rectifier (control SMPS)<span class="app-item-pkg">DIP-4 / SMD</span></div><span class="app-item-source">ASEMI (ASM)</span></div>
            <div class="app-item"><div class="app-item-name">Schottky &amp; small-signal diodes<span class="app-item-pkg">SOD-123 / 323 · SMA</span></div><span class="app-item-source">Jilin Sino</span></div>
            <div class="app-item"><div class="app-item-name">Zener / TVS clamps<span class="app-item-pkg">SOD-123 / SMA</span></div><span class="app-item-source">Jilin Sino / CDIL</span></div>
            <div class="app-item"><div class="app-item-name">MOV (230 V input)<span class="app-item-pkg">7D / 10D disc varistors</span></div><span class="app-item-source">Surging</span></div>
            <div class="app-item"><div class="app-item-name">MLCC + SMD passives<span class="app-item-pkg">MLCC · resistors</span></div><span class="app-item-source">MLCC Base</span></div>
          </div>
          <div class="app-item-foot">
            <span class="muted" style="font-size:13px">Triacs · opto-triacs · optocouplers · MCU sourced on RFQ</span>
            <a class="btn-arrow" href="contact.html?bom=appliance-control" style="font-weight:600;color:var(--accent-ink);display:inline-flex;align-items:center;gap:6px;font-size:14px">Send my BoM
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </a>
          </div>
        </div></div>
      </article>

    </div>
  </div>
</section>'''

# --- New Brand Showcase accordion (replaces BRAND PARTNERS LIST) ---
NEW_BRAND_SECTION = '''<!-- BRAND SHOWCASE — expandable brand cards with nested item categories -->
<section class="section" id="brands">
  <div class="container">
    <div class="section-head reveal">
      <div>
        <div class="eyebrow"><span class="dot"></span>Brand showcase</div>
        <h2 class="h2" style="margin-top:12px">Ten authorized partners. Click a brand to see what they make.</h2>
        <p class="muted" style="font-size:14.5px;max-width:60ch;margin-top:10px">If a brand is on your AVL, this is the catalogue we can ship from. Categories below are the item families Silicom carries per partner.</p>
      </div>
    </div>

    <div class="category-grid">

      <article class="category-card glass reveal">
        <div class="category-head">
          <div class="brand-card-logo"><img src="assets/brand-logos/asemi-asm.png" alt="ASEMI (ASM)" loading="lazy" /></div>
          <div><div class="category-title">ASEMI (ASM)</div><div class="category-meta">SMD/DIP bridges &amp; diodes · high-volume EMS lines</div></div>
          <button class="category-toggle" aria-label="Expand"><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button>
        </div>
        <div class="category-body"><div class="category-body-inner">
          <div class="brand-cat-list">
            <a class="brand-cat-pill" href="contact.html?brand=asemi&amp;cat=smd-bridge">SMD Bridge Rectifiers</a>
            <a class="brand-cat-pill" href="contact.html?brand=asemi&amp;cat=dip-bridge">DIP Bridge Rectifiers</a>
            <a class="brand-cat-pill" href="contact.html?brand=asemi&amp;cat=smd-diode">SMD Diodes</a>
            <a class="brand-cat-pill" href="contact.html?brand=asemi&amp;cat=dip-diode">DIP Diodes</a>
            <a class="brand-cat-pill" href="contact.html?brand=asemi&amp;cat=power-diode">Power Diodes</a>
          </div>
          <div class="brand-card-foot">
            <span class="muted" style="font-size:13px">Used in lighting, BLDC, charger &amp; SMPS designs</span>
            <a class="btn-arrow" href="contact.html?brand=asemi" style="font-weight:600;color:var(--accent-ink);display:inline-flex;align-items:center;gap:6px;font-size:14px">Talk to sourcing
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </a>
          </div>
        </div></div>
      </article>

      <article class="category-card glass reveal">
        <div class="category-head">
          <div class="brand-card-logo"><img src="assets/brand-logos/donghai-wxdh.png" alt="Donghai / WXDH" loading="lazy" /></div>
          <div><div class="category-title">Donghai / WXDH</div><div class="category-meta">Cool IGBT · SGT · intelligent control semis</div></div>
          <button class="category-toggle" aria-label="Expand"><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button>
        </div>
        <div class="category-body"><div class="category-body-inner">
          <div class="brand-cat-list">
            <a class="brand-cat-pill" href="contact.html?brand=wxdh&amp;cat=cool-igbt">Cool IGBT Modules</a>
            <a class="brand-cat-pill" href="contact.html?brand=wxdh&amp;cat=sgt">SGT MOSFETs</a>
            <a class="brand-cat-pill" href="contact.html?brand=wxdh&amp;cat=mosfet">Power MOSFETs</a>
            <a class="brand-cat-pill" href="contact.html?brand=wxdh&amp;cat=control-ic">Intelligent Control ICs</a>
          </div>
          <div class="brand-card-foot">
            <span class="muted" style="font-size:13px">EV charger AC stage · solar string inverter</span>
            <a class="btn-arrow" href="contact.html?brand=wxdh" style="font-weight:600;color:var(--accent-ink);display:inline-flex;align-items:center;gap:6px;font-size:14px">Talk to sourcing
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </a>
          </div>
        </div></div>
      </article>

      <article class="category-card glass reveal">
        <div class="category-head">
          <div class="brand-card-logo"><img src="assets/brand-logos/shikues.png" alt="Shikues" loading="lazy" /></div>
          <div><div class="category-title">Shikues</div><div class="category-meta">GaN ICs · PWM · IGBT · SiC diodes</div></div>
          <button class="category-toggle" aria-label="Expand"><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button>
        </div>
        <div class="category-body"><div class="category-body-inner">
          <div class="brand-cat-list">
            <a class="brand-cat-pill" href="contact.html?brand=shikues&amp;cat=gan">GaN Power ICs</a>
            <a class="brand-cat-pill" href="contact.html?brand=shikues&amp;cat=pwm">PWM Controllers</a>
            <a class="brand-cat-pill" href="contact.html?brand=shikues&amp;cat=igbt">IGBTs</a>
            <a class="brand-cat-pill" href="contact.html?brand=shikues&amp;cat=mosfet">MOSFETs</a>
            <a class="brand-cat-pill" href="contact.html?brand=shikues&amp;cat=sic">SiC Diodes</a>
          </div>
          <div class="brand-card-foot">
            <span class="muted" style="font-size:13px">Wide-bandgap power · GaN PD chargers · solar</span>
            <a class="btn-arrow" href="contact.html?brand=shikues" style="font-weight:600;color:var(--accent-ink);display:inline-flex;align-items:center;gap:6px;font-size:14px">Talk to sourcing
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </a>
          </div>
        </div></div>
      </article>

      <article class="category-card glass reveal">
        <div class="category-head">
          <div class="brand-card-logo"><img src="assets/brand-logos/jilin-sino.png" alt="Jilin Sino" loading="lazy" /></div>
          <div><div class="category-title">Jilin Sino</div><div class="category-meta">Schottky · TVS · MOSFETs · discrete semis</div></div>
          <button class="category-toggle" aria-label="Expand"><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button>
        </div>
        <div class="category-body"><div class="category-body-inner">
          <div class="brand-cat-list">
            <a class="brand-cat-pill" href="contact.html?brand=jilin&amp;cat=schottky">Schottky Diodes</a>
            <a class="brand-cat-pill" href="contact.html?brand=jilin&amp;cat=tvs">TVS / ESD Arrays</a>
            <a class="brand-cat-pill" href="contact.html?brand=jilin&amp;cat=mosfet">MOSFETs</a>
            <a class="brand-cat-pill" href="contact.html?brand=jilin&amp;cat=power-transistor">Power Transistors</a>
            <a class="brand-cat-pill" href="contact.html?brand=jilin&amp;cat=transistor">Small-signal Transistors</a>
          </div>
          <div class="brand-card-foot">
            <span class="muted" style="font-size:13px">Authorized partner since 2015 · cross-application</span>
            <a class="btn-arrow" href="contact.html?brand=jilin" style="font-weight:600;color:var(--accent-ink);display:inline-flex;align-items:center;gap:6px;font-size:14px">Talk to sourcing
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </a>
          </div>
        </div></div>
      </article>

      <article class="category-card glass reveal">
        <div class="category-head">
          <div class="brand-card-logo"><img src="assets/brand-logos/mot-inmark.png" alt="MOT Inmark" loading="lazy" /></div>
          <div><div class="category-title">MOT Inmark</div><div class="category-meta">Trench &amp; HV MOSFETs · rectifiers · SiC diodes</div></div>
          <button class="category-toggle" aria-label="Expand"><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button>
        </div>
        <div class="category-body"><div class="category-body-inner">
          <div class="brand-cat-list">
            <a class="brand-cat-pill" href="contact.html?brand=motinmark&amp;cat=trench-mosfet">Trench MOSFETs (LV/MV)</a>
            <a class="brand-cat-pill" href="contact.html?brand=motinmark&amp;cat=hv-mosfet">HV MOSFETs (600–800 V)</a>
            <a class="brand-cat-pill" href="contact.html?brand=motinmark&amp;cat=rectifier">Rectifiers</a>
            <a class="brand-cat-pill" href="contact.html?brand=motinmark&amp;cat=sic-diode">SiC Diodes</a>
          </div>
          <div class="brand-card-foot">
            <span class="muted" style="font-size:13px">SMPS · LED driver · EV charger AC stage</span>
            <a class="btn-arrow" href="contact.html?brand=motinmark" style="font-weight:600;color:var(--accent-ink);display:inline-flex;align-items:center;gap:6px;font-size:14px">Talk to sourcing
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </a>
          </div>
        </div></div>
      </article>

      <article class="category-card glass reveal">
        <div class="category-head">
          <div class="brand-card-logo"><img src="assets/brand-logos/reasunos.png" alt="Reasunos" loading="lazy" /></div>
          <div><div class="category-title">Reasunos</div><div class="category-meta">Cool MOS · SiC MOSFETs · TVS · power boost ICs</div></div>
          <button class="category-toggle" aria-label="Expand"><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button>
        </div>
        <div class="category-body"><div class="category-body-inner">
          <div class="brand-cat-list">
            <a class="brand-cat-pill" href="contact.html?brand=reasunos&amp;cat=cool-mos">Cool MOS (HV)</a>
            <a class="brand-cat-pill" href="contact.html?brand=reasunos&amp;cat=sic-mosfet">SiC MOSFETs</a>
            <a class="brand-cat-pill" href="contact.html?brand=reasunos&amp;cat=hv-mosfet">High-Voltage MOSFETs</a>
            <a class="brand-cat-pill" href="contact.html?brand=reasunos&amp;cat=tvs">TVS</a>
            <a class="brand-cat-pill" href="contact.html?brand=reasunos&amp;cat=boost-ic">Power Boosting ICs</a>
          </div>
          <div class="brand-card-foot">
            <span class="muted" style="font-size:13px">LED driver primary · SMPS · solar · charger sync stage</span>
            <a class="btn-arrow" href="contact.html?brand=reasunos" style="font-weight:600;color:var(--accent-ink);display:inline-flex;align-items:center;gap:6px;font-size:14px">Talk to sourcing
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </a>
          </div>
        </div></div>
      </article>

      <article class="category-card glass reveal">
        <div class="category-head">
          <div class="brand-card-logo"><img src="assets/brand-logos/surging.png" alt="Surging" loading="lazy" /></div>
          <div><div class="category-title">Surging</div><div class="category-meta">MOV · ZOV · over-protection components</div></div>
          <button class="category-toggle" aria-label="Expand"><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button>
        </div>
        <div class="category-body"><div class="category-body-inner">
          <div class="brand-cat-list">
            <a class="brand-cat-pill" href="contact.html?brand=surging&amp;cat=mov">Metal Oxide Varistors (7D · 10D · 14D)</a>
            <a class="brand-cat-pill" href="contact.html?brand=surging&amp;cat=zov">Zinc Oxide Varistors</a>
            <a class="brand-cat-pill" href="contact.html?brand=surging&amp;cat=over-protection">Over-protection Components</a>
          </div>
          <div class="brand-card-foot">
            <span class="muted" style="font-size:13px">Mains-side surge · smart meter · outdoor lighting</span>
            <a class="btn-arrow" href="contact.html?brand=surging" style="font-weight:600;color:var(--accent-ink);display:inline-flex;align-items:center;gap:6px;font-size:14px">Talk to sourcing
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </a>
          </div>
        </div></div>
      </article>

      <article class="category-card glass reveal">
        <div class="category-head">
          <div class="brand-card-logo"><img src="assets/brand-logos/adler.png" alt="Adler EV" loading="lazy" /></div>
          <div><div class="category-title">Adler EV</div><div class="category-meta">Automotive &amp; LV EV fuses · charging equipment</div></div>
          <button class="category-toggle" aria-label="Expand"><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button>
        </div>
        <div class="category-body"><div class="category-body-inner">
          <div class="brand-cat-list">
            <a class="brand-cat-pill" href="contact.html?brand=adler&amp;cat=auto-fuse">Automotive EV Fuses</a>
            <a class="brand-cat-pill" href="contact.html?brand=adler&amp;cat=lv-block-fuse">LV Block Fuses</a>
            <a class="brand-cat-pill" href="contact.html?brand=adler&amp;cat=ev-charging">EV Charging Equipment</a>
          </div>
          <div class="brand-card-foot">
            <span class="muted" style="font-size:13px">EV 2W/3W · EV AC charger · battery pack protection</span>
            <a class="btn-arrow" href="contact.html?brand=adler" style="font-weight:600;color:var(--accent-ink);display:inline-flex;align-items:center;gap:6px;font-size:14px">Talk to sourcing
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </a>
          </div>
        </div></div>
      </article>

      <article class="category-card glass reveal">
        <div class="category-head">
          <div class="brand-card-logo"><img src="assets/brand-logos/mlcc-base.png" alt="MLCC Base" loading="lazy" /></div>
          <div><div class="category-title">MLCC Base</div><div class="category-meta">Resistors · capacitors · MLCC · SMD passives</div></div>
          <button class="category-toggle" aria-label="Expand"><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button>
        </div>
        <div class="category-body"><div class="category-body-inner">
          <div class="brand-cat-list">
            <a class="brand-cat-pill" href="contact.html?brand=mlccbase&amp;cat=resistor">Resistors (SMD)</a>
            <a class="brand-cat-pill" href="contact.html?brand=mlccbase&amp;cat=mlcc">MLCC (Ceramic Capacitors)</a>
            <a class="brand-cat-pill" href="contact.html?brand=mlccbase&amp;cat=capacitor">Electrolytic / Film Capacitors</a>
            <a class="brand-cat-pill" href="contact.html?brand=mlccbase&amp;cat=smd-passive">Other SMD Passives</a>
          </div>
          <div class="brand-card-foot">
            <span class="muted" style="font-size:13px">High-volume EMS lines · cross-application</span>
            <a class="btn-arrow" href="contact.html?brand=mlccbase" style="font-weight:600;color:var(--accent-ink);display:inline-flex;align-items:center;gap:6px;font-size:14px">Talk to sourcing
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </a>
          </div>
        </div></div>
      </article>

      <article class="category-card glass reveal">
        <div class="category-head">
          <div class="brand-card-logo text-fallback">CDIL</div>
          <div><div class="category-title">CDIL</div><div class="category-meta">Continental Devices India · modules · BLDC · diodes · MOSFETs · TVS</div></div>
          <button class="category-toggle" aria-label="Expand"><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button>
        </div>
        <div class="category-body"><div class="category-body-inner">
          <div class="brand-cat-list">
            <a class="brand-cat-pill" href="contact.html?brand=cdil&amp;cat=modules">Modules</a>
            <a class="brand-cat-pill" href="contact.html?brand=cdil&amp;cat=bldc-driver">BLDC Motor Drivers</a>
            <a class="brand-cat-pill" href="contact.html?brand=cdil&amp;cat=diode">Diodes</a>
            <a class="brand-cat-pill" href="contact.html?brand=cdil&amp;cat=mosfet">MOSFETs</a>
            <a class="brand-cat-pill" href="contact.html?brand=cdil&amp;cat=tvs">TVS Arrays</a>
          </div>
          <div class="brand-card-foot">
            <span class="muted" style="font-size:13px">Indian-make partner · BLDC · meter · charger</span>
            <a class="btn-arrow" href="contact.html?brand=cdil" style="font-weight:600;color:var(--accent-ink);display:inline-flex;align-items:center;gap:6px;font-size:14px">Talk to sourcing
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </a>
          </div>
        </div></div>
      </article>

    </div>
  </div>
</section>'''

# Replace block 1: APPLICATION BOMs section through end of CATEGORIES section
# (BoM + Function-led picks + standalone Categories all go).
m1 = re.search(r"<!-- APPLICATION BOMs.*?(?=<!-- BRAND PARTNERS LIST -->)", src, re.S)
assert m1, "Could not find APPLICATION BOMs..BRAND PARTNERS boundary"
src = src.replace(m1.group(0), NEW_APP_SECTION + "\n\n", 1)

# Replace block 2: BRAND PARTNERS LIST section through its closing </section>.
# Match up to the blank line before next comment / section.
m2 = re.search(r"<!-- BRAND PARTNERS LIST -->.*?</section>\s*\n", src, re.S)
assert m2, "Could not find BRAND PARTNERS LIST.. boundary"
src = src.replace(m2.group(0), NEW_BRAND_SECTION + "\n\n", 1)

f.write_text(src, encoding="utf-8")
print("OK")
