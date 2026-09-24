import { useEffect, useRef, useState } from "react";
import { Logo } from "./brand/Logo";
import { categoriesOf, categoryBrands, categoryHref, categoryPhoto } from "./content/categories";
import { url } from './base';
const nav = [
  ["Instruments", "instruments"],
  ["Components", "components"],
  ["Applications", "applications"],
  ["Brands", "brands"],
  ["About us", "about"],
];
type Division = "instruments" | "components";
const divisions: Record<Division, { all: string; intro: string }> = {
  instruments: { all: "All instruments", intro: "Test & measurement for the lab bench and the production line." },
  components: { all: "All components", intro: "Power semiconductors, protection, passives and ICs for Indian EMS and OEM lines." },
};
const isDivision = (path: string): path is Division => path === "instruments" || path === "components";
const partnerCount = (d: Division) => new Set(categoriesOf(d).flatMap(categoryBrands)).size;
const Arrow = ({diagonal = false}: {diagonal?: boolean}) => <span aria-hidden="true">{diagonal ? "↗" : "→"}</span>;

/** The category panel under a division's menu item. It is in the page from the start
 *  (hidden until opened), so its links are also there without JavaScript. */
function MegaMenu({ division, open }: { division: Division; open: boolean }) {
  const d = divisions[division];
  return <div className="mega" id={`mega-${division}`} hidden={!open}>
    <div className="mega-inner">
      <div className="mega-intro">
        <span className="eyebrow">{division === "instruments" ? "Instruments" : "Components"}</span>
        <p>{d.intro}</p>
        <span className="mega-count">{partnerCount(division)} authorized partners</span>
        <a className="mega-all" href={url(`/${division}.html`)}>{d.all} <Arrow /></a>
        <a className="mega-brands" href={url("/brands.html")}>Browse by brand <Arrow diagonal /></a>
      </div>
      <ul className="mega-grid">
        {categoriesOf(division).map((c) => <li key={c.id}>
          <a href={url(categoryHref(c))}>
            <img src={url(categoryPhoto(c, "-thumb"))} alt="" width="96" height="72" loading="lazy" />
            <span><strong>{c.name}</strong><span>{c.menu}</span></span>
          </a>
        </li>)}
      </ul>
    </div>
  </div>;
}

export function SiteHeader({page = ""}: {page?: string}) {
  const [menu, setMenu] = useState(false);
  const [open, setOpen] = useState<Division | null>(null);
  const [group, setGroup] = useState<Division | null>(null);
  const header = useRef<HTMLElement>(null);
  // Close the category panel on Escape (returning focus to its button) or a click elsewhere.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      header.current?.querySelector<HTMLButtonElement>(`[aria-controls="mega-${open}"]`)?.focus();
      setOpen(null);
    };
    const onPointer = (e: PointerEvent) => { if (!header.current?.contains(e.target as Node)) setOpen(null); };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => { document.removeEventListener("keydown", onKey); document.removeEventListener("pointerdown", onPointer); };
  }, [open]);
  return <>
      <a className="skip" href="#main">
        Skip to content
      </a>
      <header className={`header${open ? " has-mega" : ""}`} ref={header}>
        <a href={url("/")} className="logo" aria-label="Silicom Electronics Pvt. Ltd. — home">
          <Logo decorative />
        </a>
        <nav className="desktop-nav" aria-label="Main navigation">
          {nav.map(([label, path]) => isDivision(path)
            ? <button key={path} type="button" className={`nav-trigger${page === path ? " is-current" : ""}`}
                aria-expanded={open === path} aria-controls={`mega-${path}`}
                onClick={() => setOpen(open === path ? null : path)}>
                {label}<span className="nav-caret" aria-hidden="true" />
              </button>
            : <a key={path} href={url(`/${path}.html`)} aria-current={page === path ? "page" : undefined}>
                {label}
              </a>)}
        </nav>
        <a className="header-contact" href={url("/contact.html")}>
          Let’s talk <Arrow diagonal />
        </a>
        {page === "store" && <button id="cartBtn" className="cart-button">Cart <span id="cartCount">0</span></button>}
        <button
          className="menu-toggle"
          onClick={() => setMenu(!menu)}
          aria-expanded={menu}
          aria-controls="mobile-nav"
        >
          {menu ? "Close" : "Menu"}
          <span>{menu ? "−" : "+"}</span>
        </button>
        <MegaMenu division="instruments" open={open === "instruments"} />
        <MegaMenu division="components" open={open === "components"} />
      </header>
      {menu && (
        <nav
          id="mobile-nav"
          className="mobile-nav"
          aria-label="Mobile navigation"
        >
          {nav.map(([label, path]) => isDivision(path)
            ? <div key={path} className="mobile-group">
                <button type="button" aria-expanded={group === path} aria-controls={`mobile-${path}`} onClick={() => setGroup(group === path ? null : path)}>
                  {label}
                  <span aria-hidden="true">{group === path ? "−" : "+"}</span>
                </button>
                {group === path && <ul id={`mobile-${path}`}>
                  <li><a href={url(`/${path}.html`)}>{divisions[path].all} <Arrow /></a></li>
                  {categoriesOf(path).map((c) => <li key={c.id}><a href={url(categoryHref(c))}>{c.name} <Arrow /></a></li>)}
                </ul>}
              </div>
            : <a key={path} href={url(`/${path}.html`)} aria-current={page === path ? "page" : undefined}>
                {label}
                <Arrow />
              </a>)}
          <a href={url("/contact.html")}>
            Send an enquiry
            <Arrow />
          </a>
        </nav>
      )}
</>; }
export function SiteFooter() { return (
      <footer className="footer section-shell">
        <div className="footer-top">
          <div className="footer-identity">
            <Logo className="logo-on-dark" />
            <p>
              Components. Instruments. Expertise.
              <br />
              Since 1994.
            </p>
          </div>
          <div>
            <h3>Explore</h3>
            {nav.map(([label, path]) => (
              <a key={path} href={url(`/${path}.html`)}>
                {label}
              </a>
            ))}
            <a href={url("/store.html")}>Component store</a>
          </div>
          <div>
            <h3>Let’s talk</h3>
            <span>Components</span>
            <a href="tel:+919810029582">+91 9810 029 582</a>
            <span className="footer-space">Instruments</span>
            <a href="tel:+919810045234">+91 9810 045 234</a>
            <a className="footer-space" href="mailto:info@silicomindia.com">
              info@silicomindia.com
            </a>
          </div>
          <div>
            <h3>Visit us</h3>
            <p>
              C-26 DSIDC Complex,
              <br />
              Kirti Nagar, New Delhi
              <br />
              110015, India
            </p>
            <a href={url("/contact.html")}>
              Get directions <span>↗</span>
            </a>
          </div>
        </div>
        <div className="footer-range">
          {(["instruments", "components"] as const).map((d) => <div key={d}><h3>{d === "instruments" ? "Instruments" : "Components"}</h3>{categoriesOf(d).map((c) => <a key={c.id} href={url(categoryHref(c))}>{c.name}</a>)}</div>)}
          <div><h3>Downloads</h3><a href={url("/assets/Silicom-LineCard-2026.pdf")} download>Line Card 2026 (PDF)</a><a href={url("/assets/Silicom-Company-Profile-2026.pdf")} download>Company Profile (PDF)</a></div>
          <div><h3>Credentials</h3><span>ISO 9001:2015</span><span>GeM Assessed</span><p>Trusted partner in components and test & measurement equipment supply, since 1994.</p></div>
        </div>
        <div className="footer-bottom">
          <span suppressHydrationWarning>
            © {new Date().getFullYear()} Silicom Electronics Pvt. Ltd.
          </span>
          <span>Precision in every connection.</span>
        </div>
      </footer>
); }