/* Silicom site — shared interactions */
(function () {
  // ---- Tweaks persistence -------------------------------------------
  const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
    "theme": "light",
    "glass": "balanced",
    "density": "cozy",
    "accent": "red-grey"
  }/*EDITMODE-END*/;

  const ACCENTS = {
    "red-grey":    { a: "#cc1a20", b: "#6b7280", ink: "#991b1b" },
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
    const a = ACCENTS[t.accent] || ACCENTS["teal-violet"];
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
      <button data-val="red-grey" style="--s1:#cc1a20;--s2:#6b7280"${t.accent==='red-grey'?' aria-pressed="true"':''}><span></span><span></span></button>
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
