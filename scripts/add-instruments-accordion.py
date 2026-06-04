# Replaces the static 9-card .application-grid in instruments.html with a 9-card
# .category-card accordion mirroring the Components Applications structure.
import re, pathlib

f = pathlib.Path("instruments.html")
src = f.read_text(encoding="utf-8")

NEW_ACCORDION = '''    <div class="category-grid" style="grid-template-columns:repeat(2,minmax(0,1fr))">

      <article class="category-card glass reveal" id="app-signal-debug">
        <div class="category-head">
          <div class="category-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M3 12h3l2-6 4 12 2-6h7"/></svg></div>
          <div><div class="category-title">Signal debugging &amp; R&amp;D bench</div><div class="category-meta">Mixed-signal bring-up · serial decode · embedded validation</div></div>
          <button class="category-toggle" aria-label="Expand"><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button>
        </div>
        <div class="category-body"><div class="category-body-inner">
          <div class="app-item-list">
            <div class="app-item"><div class="app-item-name">Benchtop oscilloscope<span class="app-item-pkg">2/3/4 Series MSO · entry to mid-bandwidth</span></div><span class="app-item-source">Tektronix</span></div>
            <div class="app-item"><div class="app-item-name">Benchtop oscilloscope (4-channel MSO)<span class="app-item-pkg">Mid-range bench scope</span></div><span class="app-item-source">UNI-T</span></div>
            <div class="app-item"><div class="app-item-name">Benchtop oscilloscope (institutional T&amp;M)<span class="app-item-pkg">Tender-friendly lab scope</span></div><span class="app-item-source">Scientific</span></div>
            <div class="app-item"><div class="app-item-name">Logic analyzer / mixed-signal analysis<span class="app-item-pkg">Parallel + serial protocol decode</span></div><span class="app-item-source">Tektronix</span></div>
            <div class="app-item"><div class="app-item-name">Handheld oscilloscope<span class="app-item-pkg">Portable bench / field debug</span></div><span class="app-item-source">UNI-T</span></div>
          </div>
          <div class="app-item-foot">
            <span class="muted" style="font-size:13px">Battery pack for field debug sourced on RFQ</span>
            <a class="btn-arrow" href="contact.html?app=signal-debug" style="font-weight:600;color:var(--accent-ink);display:inline-flex;align-items:center;gap:6px;font-size:14px">Discuss application
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </a>
          </div>
        </div></div>
      </article>

      <article class="category-card glass reveal" id="app-high-bw">
        <div class="category-head">
          <div class="category-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M2 12h4l2-8 4 16 2-12 2 4h6"/></svg></div>
          <div><div class="category-title">High-bandwidth validation &amp; SI</div><div class="category-meta">≥1 GHz capture · signal integrity · advanced scope workflows</div></div>
          <button class="category-toggle" aria-label="Expand"><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button>
        </div>
        <div class="category-body"><div class="category-body-inner">
          <div class="app-item-list">
            <div class="app-item"><div class="app-item-name">Real-time oscilloscope<span class="app-item-pkg">4 / 5 / 6 Series · ≥1 GHz bandwidth</span></div><span class="app-item-source">Tektronix</span></div>
            <div class="app-item"><div class="app-item-name">Arbitrary / function waveform generator<span class="app-item-pkg">AFG31000 / AFG family</span></div><span class="app-item-source">Tektronix</span></div>
            <div class="app-item"><div class="app-item-name">Probes &amp; accessories<span class="app-item-pkg">Hi-bandwidth differential / current probes</span></div><span class="app-item-source">Tektronix</span></div>
            <div class="app-item"><div class="app-item-name">Vector Network Analyzer (VNA)<span class="app-item-pkg">S-parameter / impedance measurement</span></div><span class="app-item-source">Anritsu / Scientific</span></div>
          </div>
          <div class="app-item-foot">
            <span class="muted" style="font-size:13px">Application-specific demo unit on request</span>
            <a class="btn-arrow" href="contact.html?app=high-bw" style="font-weight:600;color:var(--accent-ink);display:inline-flex;align-items:center;gap:6px;font-size:14px">Discuss application
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </a>
          </div>
        </div></div>
      </article>

      <article class="category-card glass reveal" id="app-edu">
        <div class="category-head">
          <div class="category-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M2 7l10-4 10 4-10 4-10-4zM6 9v6c0 2 3 3 6 3s6-1 6-3V9"/></svg></div>
          <div><div class="category-title">Education &amp; lab benches</div><div class="category-meta">IIT / NIT / PSU lab fit-outs · training rigs</div></div>
          <button class="category-toggle" aria-label="Expand"><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button>
        </div>
        <div class="category-body"><div class="category-body-inner">
          <div class="app-item-list">
            <div class="app-item"><div class="app-item-name">MSO 2 Series EDU oscilloscope<span class="app-item-pkg">70 / 100 / 200 MHz · 16 digital ch · AFG</span></div><span class="app-item-source">Tektronix</span></div>
            <div class="app-item"><div class="app-item-name">Benchtop oscilloscope (entry-level training)<span class="app-item-pkg">2-ch / 4-ch entry MSO</span></div><span class="app-item-source">UNI-T</span></div>
            <div class="app-item"><div class="app-item-name">Benchtop oscilloscope (government tender ready)<span class="app-item-pkg">GeM listed institutional T&amp;M</span></div><span class="app-item-source">Scientific</span></div>
            <div class="app-item"><div class="app-item-name">DC power supply (training bench)<span class="app-item-pkg">Linear / switching bench supply</span></div><span class="app-item-source">Scientific</span></div>
            <div class="app-item"><div class="app-item-name">Benchtop multimeter<span class="app-item-pkg">5½ / 6½ digit DMM</span></div><span class="app-item-source">UNI-T / Scientific</span></div>
          </div>
          <div class="app-item-foot">
            <span class="muted" style="font-size:13px">Lab bundle quote · IIT / NIT tender support</span>
            <a class="btn-arrow" href="contact.html?app=education" style="font-weight:600;color:var(--accent-ink);display:inline-flex;align-items:center;gap:6px;font-size:14px">Discuss application
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </a>
          </div>
        </div></div>
      </article>

      <article class="category-card glass reveal" id="app-ev-power">
        <div class="category-head">
          <div class="category-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z"/></svg></div>
          <div><div class="category-title">EV / battery / power test</div><div class="category-meta">Programmable DC · regenerative loading · source-measure</div></div>
          <button class="category-toggle" aria-label="Expand"><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button>
        </div>
        <div class="category-body"><div class="category-body-inner">
          <div class="app-item-list">
            <div class="app-item"><div class="app-item-name">Programmable DC power supply<span class="app-item-pkg">Bidirectional · multi-kW</span></div><span class="app-item-source">Tektronix / Elektro-Automatik</span></div>
            <div class="app-item"><div class="app-item-name">Regenerative electronic load<span class="app-item-pkg">Energy-recycling load bank</span></div><span class="app-item-source">Elektro-Automatik</span></div>
            <div class="app-item"><div class="app-item-name">Battery tester<span class="app-item-pkg">Cycle test · capacity profile</span></div><span class="app-item-source">Tektronix</span></div>
            <div class="app-item"><div class="app-item-name">AC source / grid simulator<span class="app-item-pkg">Programmable AC with fault injection</span></div><span class="app-item-source">Elektro-Automatik</span></div>
            <div class="app-item"><div class="app-item-name">Power analyzer<span class="app-item-pkg">3-phase efficiency &amp; quality</span></div><span class="app-item-source">Microtest</span></div>
            <div class="app-item"><div class="app-item-name">Hipot tester (battery pack)<span class="app-item-pkg">AC / DC dielectric strength</span></div><span class="app-item-source">Microtest / Scientific</span></div>
          </div>
          <div class="app-item-foot">
            <span class="muted" style="font-size:13px">CCS2 communication tester sourced on RFQ</span>
            <a class="btn-arrow" href="contact.html?app=ev-power" style="font-weight:600;color:var(--accent-ink);display:inline-flex;align-items:center;gap:6px;font-size:14px">Discuss application
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </a>
          </div>
        </div></div>
      </article>

      <article class="category-card glass reveal" id="app-transformer">
        <div class="category-head">
          <div class="category-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="8" cy="12" r="4"/><circle cx="16" cy="12" r="4"/></svg></div>
          <div><div class="category-title">Transformer &amp; coil test</div><div class="category-meta">Production-line LCR · turns ratio · leakage · pin-short</div></div>
          <button class="category-toggle" aria-label="Expand"><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button>
        </div>
        <div class="category-body"><div class="category-body-inner">
          <div class="app-item-list">
            <div class="app-item"><div class="app-item-name">5465 Transformer Analyzer<span class="app-item-pkg">10 Hz–200 kHz · 20 channels · ±0.1%</span></div><span class="app-item-source">Microtest</span></div>
            <div class="app-item"><div class="app-item-name">LCR meter<span class="app-item-pkg">Production-line LCR</span></div><span class="app-item-source">Microtest</span></div>
            <div class="app-item"><div class="app-item-name">Hipot tester (winding insulation)<span class="app-item-pkg">AC / DC dielectric strength</span></div><span class="app-item-source">Microtest</span></div>
            <div class="app-item"><div class="app-item-name">F5620 pneumatic fixture<span class="app-item-pkg">Built-in 100 mA DC bias</span></div><span class="app-item-source">Microtest</span></div>
            <div class="app-item"><div class="app-item-name">Customised testing fixture service<span class="app-item-pkg">OEM-specific jigs &amp; cycle programs</span></div><span class="app-item-source">Microtest</span></div>
          </div>
          <div class="app-item-foot">
            <span class="muted" style="font-size:13px">Customer-specific test cycle on RFQ</span>
            <a class="btn-arrow" href="contact.html?app=transformer" style="font-weight:600;color:var(--accent-ink);display:inline-flex;align-items:center;gap:6px;font-size:14px">Discuss application
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </a>
          </div>
        </div></div>
      </article>

      <article class="category-card glass reveal" id="app-cable-harness">
        <div class="category-head">
          <div class="category-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M3 12c4 0 4-4 8-4s4 4 8 4M3 16c4 0 4-4 8-4s4 4 8 4"/></svg></div>
          <div><div class="category-title">Cable harness &amp; USB-C cable testing</div><div class="category-meta">Continuity · open/short · Hipot · E-marker · 4-wire</div></div>
          <button class="category-toggle" aria-label="Expand"><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button>
        </div>
        <div class="category-body"><div class="category-body-inner">
          <div class="app-item-list">
            <div class="app-item"><div class="app-item-name">8761 Universal Cable Harness Tester<span class="app-item-pkg">64 / 128 / 256 test pins · 500 stored programs</span></div><span class="app-item-source">Microtest</span></div>
            <div class="app-item"><div class="app-item-name">Type-C Cable Tester<span class="app-item-pkg">E-marker IC · V-drop test at 5 A</span></div><span class="app-item-source">Microtest</span></div>
            <div class="app-item"><div class="app-item-name">AC / DC Hipot test<span class="app-item-pkg">Built into 8761 platform</span></div><span class="app-item-source">Microtest</span></div>
            <div class="app-item"><div class="app-item-name">4-wire continuity<span class="app-item-pkg">Low-resistance harness validation</span></div><span class="app-item-source">Microtest</span></div>
          </div>
          <div class="app-item-foot">
            <span class="muted" style="font-size:13px">Connector-specific test jigs on RFQ</span>
            <a class="btn-arrow" href="contact.html?app=cable-harness" style="font-weight:600;color:var(--accent-ink);display:inline-flex;align-items:center;gap:6px;font-size:14px">Discuss application
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </a>
          </div>
        </div></div>
      </article>

      <article class="category-card glass reveal" id="app-rf-telecom">
        <div class="category-head">
          <div class="category-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="2"/><path d="M16 8a6 6 0 010 8M8 8a6 6 0 000 8M19 5a10 10 0 010 14M5 5a10 10 0 000 14"/></svg></div>
          <div><div class="category-title">RF · telecom · antenna</div><div class="category-meta">Spectrum · cable/antenna · VNA · field RF validation</div></div>
          <button class="category-toggle" aria-label="Expand"><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button>
        </div>
        <div class="category-body"><div class="category-body-inner">
          <div class="app-item-list">
            <div class="app-item"><div class="app-item-name">Spectrum analyzer (handheld + benchtop)<span class="app-item-pkg">Sub-6 GHz / mmWave options</span></div><span class="app-item-source">Anritsu</span></div>
            <div class="app-item"><div class="app-item-name">Cable &amp; antenna analyzer<span class="app-item-pkg">Site Master / field validation</span></div><span class="app-item-source">Anritsu</span></div>
            <div class="app-item"><div class="app-item-name">Vector Network Analyzer (VNA)<span class="app-item-pkg">2-port / 4-port S-parameter</span></div><span class="app-item-source">Anritsu</span></div>
            <div class="app-item"><div class="app-item-name">Spectrum analyzer (lab bench)<span class="app-item-pkg">Entry / mid-range bench unit</span></div><span class="app-item-source">UNI-T / Scientific</span></div>
            <div class="app-item"><div class="app-item-name">RF signal generator<span class="app-item-pkg">Vector / analog signal source</span></div><span class="app-item-source">Anritsu</span></div>
          </div>
          <div class="app-item-foot">
            <span class="muted" style="font-size:13px">EMI / EMC pre-compliance kit on RFQ</span>
            <a class="btn-arrow" href="contact.html?app=rf-telecom" style="font-weight:600;color:var(--accent-ink);display:inline-flex;align-items:center;gap:6px;font-size:14px">Discuss application
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </a>
          </div>
        </div></div>
      </article>

      <article class="category-card glass reveal" id="app-smu-semi">
        <div class="category-head">
          <div class="category-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 2v3M12 19v3M5 12H2M22 12h-3"/><circle cx="12" cy="12" r="6"/></svg></div>
          <div><div class="category-title">Precision SMU &amp; semiconductor parameter</div><div class="category-meta">Source-measure · low-current · parameter analysis</div></div>
          <button class="category-toggle" aria-label="Expand"><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button>
        </div>
        <div class="category-body"><div class="category-body-inner">
          <div class="app-item-list">
            <div class="app-item"><div class="app-item-name">Source Measure Unit (SMU)<span class="app-item-pkg">4 / 6 / 7-Series · sub-pA / fV resolution</span></div><span class="app-item-source">Keithley</span></div>
            <div class="app-item"><div class="app-item-name">SMU (Tektronix range)<span class="app-item-pkg">Low-current measurement</span></div><span class="app-item-source">Tektronix</span></div>
            <div class="app-item"><div class="app-item-name">Semiconductor parameter analyzer<span class="app-item-pkg">I-V / C-V characterization</span></div><span class="app-item-source">Keithley</span></div>
            <div class="app-item"><div class="app-item-name">Low-current / resistance measurement system<span class="app-item-pkg">Electrometer / pico-ammeter</span></div><span class="app-item-source">Keithley</span></div>
          </div>
          <div class="app-item-foot">
            <span class="muted" style="font-size:13px">Probe station integration on RFQ</span>
            <a class="btn-arrow" href="contact.html?app=smu-semi" style="font-weight:600;color:var(--accent-ink);display:inline-flex;align-items:center;gap:6px;font-size:14px">Discuss application
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </a>
          </div>
        </div></div>
      </article>

      <article class="category-card glass reveal" id="app-field-electrical">
        <div class="category-head">
          <div class="category-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="4" y="6" width="16" height="12" rx="1"/><path d="M8 10h2v4H8zM12 10h6M12 14h6"/></svg></div>
          <div><div class="category-title">Field electrical maintenance</div><div class="category-meta">Portable testers · insulation · panel metering · loggers</div></div>
          <button class="category-toggle" aria-label="Expand"><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button>
        </div>
        <div class="category-body"><div class="category-body-inner">
          <div class="app-item-list">
            <div class="app-item"><div class="app-item-name">Portable multimeter (field &amp; maintenance)<span class="app-item-pkg">Industrial-grade DMM</span></div><span class="app-item-source">Metrix</span></div>
            <div class="app-item"><div class="app-item-name">Insulation tester (IR / Megger)<span class="app-item-pkg">Insulation resistance &amp; PI ratio</span></div><span class="app-item-source">Metrix</span></div>
            <div class="app-item"><div class="app-item-name">Panel meter (switchboard install)<span class="app-item-pkg">DIN / 96 mm panel mount</span></div><span class="app-item-source">Rishabh</span></div>
            <div class="app-item"><div class="app-item-name">Power &amp; energy analyzer (facility-scale)<span class="app-item-pkg">3-phase power quality / energy</span></div><span class="app-item-source">Rishabh</span></div>
            <div class="app-item"><div class="app-item-name">Multimeter / temperature data logger<span class="app-item-pkg">Long-duration logging</span></div><span class="app-item-source">UNI-T</span></div>
          </div>
          <div class="app-item-foot">
            <span class="muted" style="font-size:13px">Calibration certificate package on RFQ</span>
            <a class="btn-arrow" href="contact.html?app=field-electrical" style="font-weight:600;color:var(--accent-ink);display:inline-flex;align-items:center;gap:6px;font-size:14px">Discuss application
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </a>
          </div>
        </div></div>
      </article>

    </div>'''

# Match the old <div class="application-grid"> through its closing </div>
# Use a regex that finds the start anchor + lazy span up to the line before "</div>\n  </div>\n</section>"
m = re.search(r'    <div class="application-grid">[\s\S]*?    </div>\n  </div>\n</section>\n\n<!-- CTA -->', src)
assert m, "Could not find application-grid block"
old = m.group(0)
new = NEW_ACCORDION + "\n  </div>\n</section>\n\n<!-- CTA -->"
src = src.replace(old, new, 1)
f.write_text(src, encoding="utf-8")
print("OK")
