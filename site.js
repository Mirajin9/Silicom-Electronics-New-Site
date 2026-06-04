/* Silicom site — shared interactions */
(function () {
  // ---- Tweaks persistence -------------------------------------------
  const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
    "theme": "light",
    "glass": "balanced",
    "density": "cozy",
    "accent": "blue-metal"
  }/*EDITMODE-END*/;

  const ACCENTS = {
    "blue-metal":  { a: "#0b6fd3", b: "#7d8794", ink: "#07529d" },
    "red-grey":    { a: "#0b6fd3", b: "#7d8794", ink: "#07529d" },
    "teal-violet": { a: "#06b6d4", b: "#8b5cf6", ink: "#0e7490" },
    "blue":        { a: "#3b82f6", b: "#1e40af", ink: "#1e3a8a" },
    "emerald":     { a: "#10b981", b: "#0e7490", ink: "#065f46" },
    "amber":       { a: "#f59e0b", b: "#ef4444", ink: "#92400e" }
  };

  function applyTweaks(t) {
    const root = document.documentElement;
    root.dataset.theme   = t.theme   || "light";
    root.dataset.glass   = t.glass   || "balanced";
    root.dataset.density = t.density || "cozy";
    const a = ACCENTS[t.accent] || ACCENTS["blue-metal"];
    root.style.setProperty("--accent", a.a);
    root.style.setProperty("--accent-2", a.b);
    root.style.setProperty("--accent-ink", a.ink);
  }

  // Read persisted state from localStorage to keep across page nav
  let stored = {};
  try { stored = JSON.parse(localStorage.getItem("silicom-tweaks") || "{}"); } catch(e) {}
  const initial = Object.assign({}, TWEAK_DEFAULTS, stored);
  applyTweaks(initial);
  window.__silicomTweaks = initial;

  window.silicomSetTweaks = function (patch) {
    Object.assign(window.__silicomTweaks, patch);
    applyTweaks(window.__silicomTweaks);
    try { localStorage.setItem("silicom-tweaks", JSON.stringify(window.__silicomTweaks)); } catch(e) {}
    // Notify host so it persists in source file
    try {
      window.parent.postMessage({type: "__edit_mode_set_keys", edits: patch}, "*");
    } catch(e) {}
  };

  // ---- Edit-mode integration ----------------------------------------
  let panelMounted = false;
  window.addEventListener("message", (e) => {
    const d = e.data;
    if (!d || typeof d !== "object") return;
    if (d.type === "__activate_edit_mode") {
      mountTweaksPanel(true);
    } else if (d.type === "__deactivate_edit_mode") {
      const p = document.getElementById("silicom-tweaks-panel");
      if (p) p.style.display = "none";
    }
  });
  // Announce availability after listener exists
  try { window.parent.postMessage({type: "__edit_mode_available"}, "*"); } catch(e) {}

  function mountTweaksPanel(show) {
    let p = document.getElementById("silicom-tweaks-panel");
    if (!p) {
      p = document.createElement("div");
      p.id = "silicom-tweaks-panel";
      p.innerHTML = renderTweaksPanel();
      document.body.appendChild(p);
      wireTweaksPanel(p);
    }
    p.style.display = show ? "block" : "none";
  }

  function renderTweaksPanel() {
    const t = window.__silicomTweaks;
    return `
<div class="tk-shell glass">
  <div class="tk-head">
    <strong>Tweaks</strong>
    <button class="tk-close" aria-label="Close">×</button>
  </div>
  <div class="tk-section">
    <label class="tk-label">Theme</label>
    <div class="tk-seg" data-key="theme">
      <button data-val="light"${t.theme==='light'?' aria-pressed="true"':''}>Light</button>
      <button data-val="dark"${t.theme==='dark'?' aria-pressed="true"':''}>Dark</button>
    </div>
  </div>
  <div class="tk-section">
    <label class="tk-label">Glass intensity</label>
    <div class="tk-seg" data-key="glass">
      <button data-val="subtle"${t.glass==='subtle'?' aria-pressed="true"':''}>Subtle</button>
      <button data-val="balanced"${t.glass==='balanced'?' aria-pressed="true"':''}>Balanced</button>
      <button data-val="max"${t.glass==='max'?' aria-pressed="true"':''}>Max</button>
    </div>
  </div>
  <div class="tk-section">
    <label class="tk-label">Density</label>
    <div class="tk-seg" data-key="density">
      <button data-val="compact"${t.density==='compact'?' aria-pressed="true"':''}>Compact</button>
      <button data-val="cozy"${t.density==='cozy'?' aria-pressed="true"':''}>Cozy</button>
      <button data-val="airy"${t.density==='airy'?' aria-pressed="true"':''}>Airy</button>
    </div>
  </div>
  <div class="tk-section">
    <label class="tk-label">Accent</label>
    <div class="tk-swatch-row" data-key="accent">
      <button data-val="blue-metal" style="--s1:#0b6fd3;--s2:#7d8794"${(t.accent==='blue-metal'||t.accent==='red-grey')?' aria-pressed="true"':''}><span></span><span></span></button>
      <button data-val="teal-violet" style="--s1:#06b6d4;--s2:#8b5cf6"${t.accent==='teal-violet'?' aria-pressed="true"':''}><span></span><span></span></button>
      <button data-val="blue" style="--s1:#3b82f6;--s2:#1e40af"${t.accent==='blue'?' aria-pressed="true"':''}><span></span><span></span></button>
      <button data-val="emerald" style="--s1:#10b981;--s2:#0e7490"${t.accent==='emerald'?' aria-pressed="true"':''}><span></span><span></span></button>
    </div>
  </div>
</div>`;
  }

  function wireTweaksPanel(root) {
    root.querySelector(".tk-close").addEventListener("click", () => {
      root.style.display = "none";
      try { window.parent.postMessage({type:"__edit_mode_dismissed"}, "*"); } catch(e) {}
    });
    root.querySelectorAll(".tk-seg, .tk-swatch-row").forEach(seg => {
      seg.addEventListener("click", (e) => {
        const btn = e.target.closest("button[data-val]");
        if (!btn) return;
        const key = seg.dataset.key;
        const val = btn.dataset.val;
        seg.querySelectorAll("button").forEach(b => b.removeAttribute("aria-pressed"));
        btn.setAttribute("aria-pressed", "true");
        window.silicomSetTweaks({[key]: val});
      });
    });
    // Drag
    let dragging = false, sx=0, sy=0, ox=0, oy=0;
    const head = root.querySelector(".tk-head");
    head.addEventListener("mousedown", (e) => {
      dragging = true;
      sx = e.clientX; sy = e.clientY;
      const r = root.getBoundingClientRect();
      ox = r.left; oy = r.top;
      document.body.style.userSelect = "none";
    });
    window.addEventListener("mousemove", (e) => {
      if (!dragging) return;
      root.style.left = (ox + e.clientX - sx) + "px";
      root.style.top  = (oy + e.clientY - sy) + "px";
      root.style.right = "auto"; root.style.bottom = "auto";
    });
    window.addEventListener("mouseup", () => { dragging = false; document.body.style.userSelect = ""; });
  }

  // ---- Nav dropdowns -------------------------------------------------
  document.addEventListener("DOMContentLoaded", () => {
    const items = document.querySelectorAll(".nav-item.has-dropdown");
    items.forEach(item => {
      const trigger = item.querySelector(".nav-link");
      let timer;
      const open = () => { clearTimeout(timer); items.forEach(i => i.classList.remove("open")); item.classList.add("open"); };
      const close = () => { timer = setTimeout(() => item.classList.remove("open"), 180); };
      item.addEventListener("mouseenter", open);
      item.addEventListener("mouseleave", close);
      trigger.addEventListener("click", (e) => {
        e.preventDefault();
        item.classList.toggle("open");
      });
    });
    document.addEventListener("click", (e) => {
      if (!e.target.closest(".nav-item.has-dropdown")) {
        items.forEach(i => i.classList.remove("open"));
      }
    });

    // Expandable category cards.
    // Ignore clicks that originate from interactive content inside the
    // expanded body (CTAs, brand-category pills, etc.) so those still work.
    document.querySelectorAll(".category-card").forEach(c => {
      c.addEventListener("click", (e) => {
        if (e.target.closest("a, button:not(.category-toggle)")) return;
        c.classList.toggle("open");
      });
    });

    // Home application guide carousel.
    const applicationGuides = [
      {
        code: "EV",
        title: "Automotive",
        summary: "Automotive-grade semis, efficient power devices and protection parts.",
        hue: 206,
        components: "For automotive electronics, start with protection, switching, and thermal margin. Silicom can support MOSFET and SiC requirements through Shikues, Reasunos and MOT Inmark, while Jilin Sino is useful for TVS, ESD and diode protection around communication and auxiliary rails. For EV-adjacent boards, Adler EV fuses and WXDH power devices can be considered where the design needs higher current handling.",
        instruments: "Automotive boards usually need power-stage validation, signal debugging and safety checks. Tektronix scopes are a good fit for mixed-signal bring-up, Elektro-Automatik and Tektronix power equipment can support battery or converter testing, and Metrix/Rishabh instruments help with field electrical maintenance.",
        componentLink: "components.html#app-ev-ac-charger",
        instrumentLink: "instruments.html#app-ev-power"
      },
      {
        code: "IoT",
        title: "IoT",
        summary: "Slim packages, low-loss switching and space-conscious circuit designs.",
        hue: 194,
        components: "For IoT and connected control boards, the priority is compact packages, stable low-power switching and reliable protection. ASEMI can support rectification, Shikues and Reasunos are useful where efficient MOSFET or power IC choices are needed, and Jilin Sino can cover small-signal diodes, TVS and ESD protection around communication lines.",
        instruments: "For IoT validation, teams usually need a practical bench: oscilloscope, DMM, DC supply and sometimes protocol or mixed-signal debugging. Tektronix, UNI-T and Scientific cover the bench scope side, while UNI-T and Scientific help round out DMM, LCR and lab supply needs.",
        componentLink: "components.html#app-smart-meter",
        instrumentLink: "instruments.html#app-signal-debug"
      },
      {
        code: "LED",
        title: "Lighting",
        summary: "Surge-ready protection and power parts for industrial lighting designs.",
        hue: 210,
        components: "For LED drivers, we would look at the full power path: ASEMI bridge rectifiers at the input, Reasunos or MOT Inmark MOSFETs for the primary switch, Jilin Sino Schottky/TVS parts for output and protection, and Surging MOVs where the design faces mains or outdoor surge exposure.",
        instruments: "Lighting power designs benefit from scope-based switching checks, input/output ripple measurement and load testing. Tektronix or UNI-T scopes can help debug switching behavior, while Scientific or UNI-T supplies and loads support basic driver validation.",
        componentLink: "components.html#app-led-driver",
        instrumentLink: "instruments.html#oscilloscopes"
      },
      {
        code: "GaN",
        title: "Mobile Chargers",
        summary: "GaN charger design support for compact 20W, 30W, 45W and 65W builds.",
        hue: 202,
        components: "For compact USB-PD and GaN charger builds, Silicom can help around the primary GaN/power IC stage through Shikues, synchronous rectification through Reasunos, compact bridge rectification through ASEMI, and USB-C/ESD protection through Jilin Sino. MLCC Base can support the SMD passive side of the design.",
        instruments: "Charger validation usually needs waveform, thermal and load behavior checks. Tektronix or UNI-T scopes help inspect switching and ripple, programmable supplies/loads help exercise output modes, and a DMM/LCR bench can support production checks.",
        componentLink: "components.html#app-gan-charger",
        instrumentLink: "instruments.html#power"
      },
      {
        code: "BL",
        title: "BLDC",
        summary: "Motor drivers, hall sensors and power stages for OEM and EMS lines.",
        hue: 214,
        components: "For BLDC motor control, focus on the driver stage, MOSFET bridge, freewheel path and gate protection. MOT Inmark and Reasunos can support power MOSFET choices, while Jilin Sino helps with Schottky, TVS and clamp protection around the motor-control PCB.",
        instruments: "BLDC validation needs both signal and power visibility. A Tektronix or UNI-T oscilloscope helps with PWM, phase and gate-drive debugging, while power supplies, loads and production test equipment help validate boards before they move into EMS or appliance production.",
        componentLink: "components.html#app-bldc",
        instrumentLink: "instruments.html#production"
      },
      {
        code: "PV",
        title: "Solar",
        summary: "PV, inverter and power conversion components for sustainable energy.",
        hue: 198,
        components: "For solar inverter designs, Silicom can support the conversion path with SiC MOSFET options from Reasunos/Shikues, IGBT or power-stage devices from WXDH, diode support from Jilin Sino/MOT Inmark, and MOV protection through Surging for DC string and AC output exposure.",
        instruments: "Solar and inverter testing typically needs programmable high-power sources, regenerative loading and efficiency measurement. Elektro-Automatik is relevant for programmable DC and regenerative load setups, while Tektronix and Microtest can support waveform and power-analysis needs.",
        componentLink: "components.html#app-solar",
        instrumentLink: "instruments.html#app-ev-power"
      },
      {
        code: "DC",
        title: "SMPS",
        summary: "MOSFETs, rectifiers, protection and high-efficiency power parts.",
        hue: 218,
        components: "For SMPS and adapter boards, the usual starting point is the primary MOSFET, bridge rectifier, output diode and surge/protection network. Reasunos and MOT Inmark are strong options for HV MOSFET needs, ASEMI supports bridge rectification, and Jilin Sino covers Schottky, Zener, TVS and small-signal protection.",
        instruments: "SMPS validation usually starts on the bench: scope for switching waveforms and ripple, supply/load for line and load behavior, and DMM/LCR for supporting measurements. Tektronix, UNI-T and Scientific are the practical instrument families to explore first.",
        componentLink: "components.html#app-smps",
        instrumentLink: "instruments.html#oscilloscopes"
      },
      {
        code: "EV",
        title: "EV Chargers",
        summary: "Power converters, current sensing, gate drivers and EV protection.",
        hue: 204,
        components: "For EV charger designs, Silicom can support high-voltage switching through MOT Inmark/Reasunos, power devices through WXDH, protection through Jilin Sino and Surging, and EV fuse requirements through Adler EV. Where diode selection is critical, Shikues or MOT Inmark SiC diode options should be evaluated for thermal and switching requirements after checking the exact datasheet.",
        instruments: "EV charger validation needs more than a scope. Teams may need programmable DC sources, regenerative loads, battery simulation, safety/hipot testing and field electrical tools. Elektro-Automatik, Tektronix, Microtest, Metrix and Rishabh are the instrument directions to explore depending on whether the requirement is R&D, production or installation.",
        componentLink: "components.html#app-ev-ac-charger",
        instrumentLink: "instruments.html#app-ev-power"
      }
    ];

    document.querySelectorAll("[data-application-carousel]").forEach(carousel => {
      const nameList = carousel.querySelector("[data-app-name-list]");
      const visualList = carousel.querySelector("[data-app-visuals]");
      const summary = carousel.querySelector("[data-app-summary]");
      const prev = carousel.querySelector("[data-app-prev]");
      const next = carousel.querySelector("[data-app-next]");
      const explore = carousel.querySelector("[data-app-explore]");
      const detail = carousel.querySelector("[data-app-detail]");
      const detailClose = carousel.querySelector("[data-app-detail-close]");
      const detailTitle = carousel.querySelector("[data-app-detail-title]");
      const detailIntro = carousel.querySelector("[data-app-detail-intro]");
      const detailComponents = carousel.querySelector("[data-app-components]");
      const detailInstruments = carousel.querySelector("[data-app-instruments]");
      const detailComponentsLink = carousel.querySelector("[data-app-components-link]");
      const detailInstrumentsLink = carousel.querySelector("[data-app-instruments-link]");
      if (!nameList || !visualList || !summary || !prev || !next || !explore || !detail) return;

      let active = 0;
      let progress = 0;
      let snapTimer = 0;
      let animationFrame = 0;
      let touchStartX = 0;
      let touchStartY = 0;
      let touchStartProgress = 0;
      let detailOpen = false;
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const appCount = applicationGuides.length;
      const mod = (value, length) => ((value % length) + length) % length;
      const circularOffset = (index, value) => {
        const normalizedProgress = mod(value, appCount);
        let offset = index - normalizedProgress;
        if (offset > appCount / 2) offset -= appCount;
        if (offset < -appCount / 2) offset += appCount;
        return offset;
      };

      applicationGuides.forEach((app, index) => {
        const nameButton = document.createElement("button");
        nameButton.type = "button";
        nameButton.className = "application-name-button";
        nameButton.setAttribute("role", "tab");
        nameButton.dataset.appIndex = String(index);
        nameButton.innerHTML = '<span class="application-name-code">' + app.code + '</span><span class="application-name-title">' + app.title + '</span>';
        nameList.appendChild(nameButton);

        const visual = document.createElement("article");
        visual.className = "application-carousel-card";
        visual.dataset.appIndex = String(index);
        visual.style.setProperty("--app-hue", app.hue);
        visual.innerHTML = ''
          + '<div class="application-visual-code">' + app.code + '</div>'
          + '<div class="application-visual-title">' + app.title + '</div>'
          + '<p class="application-visual-copy">' + app.summary + '</p>';
        visualList.appendChild(visual);
      });

      const nameButtons = Array.from(nameList.querySelectorAll(".application-name-button"));
      const visuals = Array.from(visualList.querySelectorAll(".application-carousel-card"));

      const updateDetail = () => {
        const app = applicationGuides[active];
        if (detailTitle) detailTitle.textContent = app.title;
        if (detailIntro) detailIntro.textContent = app.summary;
        if (detailComponents) detailComponents.textContent = app.components;
        if (detailInstruments) detailInstruments.textContent = app.instruments;
        if (detailComponentsLink) detailComponentsLink.href = app.componentLink;
        if (detailInstrumentsLink) detailInstrumentsLink.href = app.instrumentLink;
      };

      const positionVisuals = () => {
        const width = carousel.getBoundingClientRect().width;
        const spacing = width < 720 ? 220 : 330;
        visuals.forEach((card, index) => {
          const offset = circularOffset(index, progress);
          const distance = Math.abs(offset);
          const visible = distance <= 2.15;
          const scale = reduceMotion ? 1 : Math.max(.70, 1 - distance * .12);
          const rotate = reduceMotion ? 0 : offset * -28;
          const z = reduceMotion ? 0 : distance * -150;
          const y = reduceMotion ? 0 : distance * 8;
          const x = reduceMotion ? offset * 28 : offset * spacing;
          card.style.transform = 'translate(-50%, -50%) translateX(' + x + 'px) translateY(' + y + 'px) translateZ(' + z + 'px) rotateY(' + rotate + 'deg) scale(' + scale + ')';
          card.style.opacity = visible ? String(Math.max(.18, 1 - distance * .26)) : "0";
          card.style.filter = distance === 0 ? "none" : "saturate(.82) blur(.2px)";
          card.style.zIndex = String(20 - distance);
          card.classList.toggle("active", distance < .08);
          card.setAttribute("aria-hidden", distance < .08 ? "false" : "true");
        });
      };

      const positionNames = () => {
        const titleStride = carousel.getBoundingClientRect().width < 720 ? 116 : 152;
        nameButtons.forEach((button, index) => {
          const offset = circularOffset(index, progress);
          const distance = Math.abs(offset);
          const opacity = Math.max(0, 1 - distance * 1.9);
          button.style.setProperty("--title-y", (offset * titleStride) + "px");
          button.style.setProperty("--title-scale", String(Math.max(.86, 1 - distance * .08)));
          button.style.opacity = String(opacity);
          button.style.zIndex = String(20 - Math.round(distance * 10));
        });
      };

      const setProgress = (value) => {
        progress = value;
        active = mod(Math.round(progress), appCount);
        const app = applicationGuides[active];
        summary.textContent = app.summary;
        prev.disabled = false;
        next.disabled = false;
        explore.setAttribute("aria-label", "Explore " + app.title);
        nameButtons.forEach((button, index) => {
          const isActive = index === active;
          button.setAttribute("aria-selected", isActive ? "true" : "false");
          button.setAttribute("aria-current", isActive ? "true" : "false");
          button.tabIndex = isActive ? 0 : -1;
        });
        positionVisuals();
        positionNames();
        if (detailOpen) updateDetail();
      };

      const animateTo = (target) => {
        const end = target;
        if (animationFrame) window.cancelAnimationFrame(animationFrame);
        if (reduceMotion) {
          setProgress(end);
          return;
        }
        const start = progress;
        const duration = 360;
        const started = performance.now();
        const ease = (t) => 1 - Math.pow(1 - t, 3);
        const tick = (now) => {
          const t = Math.min(1, (now - started) / duration);
          setProgress(start + (end - start) * ease(t));
          if (t < 1) {
            animationFrame = window.requestAnimationFrame(tick);
          } else {
            animationFrame = 0;
            setProgress(end);
          }
        };
        animationFrame = window.requestAnimationFrame(tick);
      };

      const step = (direction) => {
        const nextIndex = Math.round(progress) + direction;
        animateTo(nextIndex);
        return true;
      };

      const openDetail = () => {
        detailOpen = true;
        updateDetail();
        detail.hidden = false;
        explore.setAttribute("aria-expanded", "true");
        window.requestAnimationFrame(() => {
          detail.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "nearest" });
          if (detailClose) detailClose.focus({ preventScroll: true });
        });
      };

      const closeDetail = () => {
        detailOpen = false;
        detail.hidden = true;
        explore.setAttribute("aria-expanded", "false");
        explore.focus({ preventScroll: true });
      };

      nameButtons.forEach(button => {
        button.addEventListener("click", () => {
          const index = Number(button.dataset.appIndex || 0);
          const current = mod(progress, appCount);
          let delta = index - current;
          if (delta > appCount / 2) delta -= appCount;
          if (delta < -appCount / 2) delta += appCount;
          animateTo(progress + delta);
        });
      });
      prev.addEventListener("click", () => step(-1));
      next.addEventListener("click", () => step(1));
      explore.addEventListener("click", openDetail);
      if (detailClose) detailClose.addEventListener("click", closeDetail);

      const handleCarouselWheel = (e) => {
        const rect = carousel.getBoundingClientRect();
        const insideCarousel =
          e.clientX >= rect.left &&
          e.clientX <= rect.right &&
          e.clientY >= rect.top &&
          e.clientY <= rect.bottom;
        if (!insideCarousel) return;
        if (detailOpen && detail.contains(e.target)) return;
        if (Math.abs(e.deltaY) < 12) return;
        e.preventDefault();
        e.stopPropagation();
        if (animationFrame) {
          window.cancelAnimationFrame(animationFrame);
          animationFrame = 0;
        }
        const delta = e.deltaY / (reduceMotion ? 900 : 460);
        setProgress(progress + delta);
        window.clearTimeout(snapTimer);
        snapTimer = window.setTimeout(() => animateTo(Math.round(progress)), 120);
      };
      document.addEventListener("wheel", handleCarouselWheel, { passive: false, capture: true });

      carousel.addEventListener("keydown", (e) => {
        if (e.key === "ArrowRight" || e.key === "ArrowDown") {
          if (step(1)) e.preventDefault();
        } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
          if (step(-1)) e.preventDefault();
        } else if (e.key === "Home") {
          animateTo(progress - mod(progress, appCount));
          e.preventDefault();
        } else if (e.key === "End") {
          animateTo(progress + ((appCount - 1) - mod(progress, appCount)));
          e.preventDefault();
        } else if (e.key === "Escape" && detailOpen) {
          closeDetail();
        }
      });

      carousel.addEventListener("touchstart", (e) => {
        const touch = e.changedTouches[0];
        touchStartX = touch.clientX;
        touchStartY = touch.clientY;
        touchStartProgress = progress;
      }, { passive: true });

      carousel.addEventListener("touchmove", (e) => {
        if (detail.contains(e.target)) return;
        const touch = e.changedTouches[0];
        const dx = touch.clientX - touchStartX;
        const dy = touch.clientY - touchStartY;
        const delta = Math.abs(dy) >= Math.abs(dx) ? -dy : -dx;
        if (Math.abs(delta) < 8) return;
        const nextProgress = touchStartProgress + (delta / 280);
        e.preventDefault();
        setProgress(nextProgress);
      }, { passive: false });

      carousel.addEventListener("touchend", (e) => {
        const touch = e.changedTouches[0];
        const dx = touch.clientX - touchStartX;
        const dy = touch.clientY - touchStartY;
        if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) return;
        animateTo(Math.round(progress));
      }, { passive: true });

      window.addEventListener("resize", () => {
        positionVisuals();
        positionNames();
      });
      explore.setAttribute("aria-expanded", "false");
      setProgress(0);
    });

    // ?slots=1 reveals the data-hint label on every .image-slot. Internal
    // tool for the photo-planning pass; invisible to normal visitors.
    if (new URLSearchParams(location.search).has("slots")) {
      document.body.classList.add("show-slot-hints");
    }

    // Circular Applications organiser — rotates the ring, populates a side
    // preview on hover, and click-jumps to the matching accordion card.
    document.querySelectorAll(".org-circle").forEach(circle => {
      const preview = circle.querySelector(".org-preview");
      const empty   = preview ? preview.querySelector(".org-preview-empty") : null;
      const emptyHTML = empty ? empty.outerHTML : "";
      const renderPreview = (d) => {
        const split = (s) => (s || "").split(/\s*(?:\u00b7|\u00c2\u00b7)\s*/).map(x => x.trim()).filter(Boolean);
        const brands = split(d.appBrands).map(b => '<span class="chip">' + b + '</span>').join("");
        const items  = split(d.appProducts).map(p =>
          '<li><span class="org-preview-dot"></span>' + p + '</li>').join("");
        return ''
          + '<div class="org-preview-head"><div class="eyebrow"><span class="dot"></span>' + (d.appLabel || d.appTitle || 'Application') + '</div></div>'
          + (brands ? '<div class="org-preview-block"><div class="org-preview-label">Brand partners</div><div class="org-preview-chips">' + brands + '</div></div>' : '')
          + (items  ? '<div class="org-preview-block"><div class="org-preview-label">What we carry</div><ul class="org-preview-items">' + items + '</ul></div>' : '')
          + '<a class="btn-arrow org-preview-link" href="#' + (d.appId || '') + '">Open detail <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></a>';
      };
      const nodes = circle.querySelectorAll(".org-node");
      nodes.forEach(n => {
        n.addEventListener("mouseenter", () => {
          circle.classList.add("paused");
          if (preview) preview.innerHTML = renderPreview(n.dataset);
        });
        n.addEventListener("focus", () => {
          circle.classList.add("paused");
          if (preview) preview.innerHTML = renderPreview(n.dataset);
        });
        n.addEventListener("mouseleave", () => {
          circle.classList.remove("paused");
        });
        n.addEventListener("blur", () => {
          circle.classList.remove("paused");
        });
        n.addEventListener("click", (e) => {
          e.preventDefault();
          const card = document.getElementById(n.dataset.appId || "");
          if (!card) return;
          card.classList.add("open");
          card.scrollIntoView({ behavior: "smooth", block: "center" });
        });
      });
      // Reset preview when leaving the ring entirely.
      const stage = circle.querySelector(".org-circle-stage");
      if (stage && preview) {
        stage.addEventListener("mouseleave", () => {
          preview.innerHTML = emptyHTML;
        });
      }
    });

    // Reveal animations are CSS-only (see styles.css .reveal rules).
    // No JS opacity manipulation — content is always visible by default.

    // Active nav link
    const path = location.pathname.split("/").pop() || "index.html";
    document.querySelectorAll(".nav-link[data-route]").forEach(a => {
      if (a.dataset.route === path) a.classList.add("active");
    });

    // Theme toggle
    const themeToggle = document.querySelector(".nav-theme-toggle");
    if (themeToggle) {
      themeToggle.addEventListener("click", () => {
        const current = window.__silicomTweaks.theme || "light";
        const next = current === "light" ? "dark" : "light";
        window.silicomSetTweaks({ theme: next });
        updateThemeIcon(next);
      });
      updateThemeIcon(window.__silicomTweaks.theme || "light");
    }

    function updateThemeIcon(theme) {
      if (!themeToggle) return;
      themeToggle.innerHTML = theme === "dark"
        ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>'
        : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>';
    }
  });
})();
