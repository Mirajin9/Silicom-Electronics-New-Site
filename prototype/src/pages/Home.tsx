import React, { Fragment, useState, type CSSProperties } from "react";
import { SiteHeader, SiteFooter } from "../SiteChrome";
import { InlineModel, PackageBrowser } from "../InlineModel";
import { BrandIntro } from "../brand/BrandIntro";
import { useReducedMotion } from "../Layout";
import { Arrow } from "../ui";
import { categoriesOf, categoryHref } from "../content/categories";
import customerLogos from "../content/customers.json";
import { url } from '../base';

const logoSizes: Record<string, { w: number; h: number; tone: number }> = customerLogos;
const Plus = () => <span aria-hidden="true">+</span>;

const applications = [
  {
    name: "EV & charging",
    tag: "Power electronics",
    title: "From power conversion\nto validation.",
    text: "Source power semiconductors, protection and the instruments to put your charging design through its paces.",
    parts: [
      "SiC & power MOSFETs",
      "Rectifiers & EV fuses",
      "DC sources & electronic loads",
    ],
    brands: "Donghai / WXDH · Reasunos · Adler · Elektro-Automatik",
    image: "ev-ac-charger",
    anchor: "app-ev-ac-charger",
  },
  {
    name: "Solar & energy",
    tag: "Renewable energy",
    title: "Efficient power.\nMeasured performance.",
    text: "Components and test support for solar inverters, energy conversion and power-management designs.",
    parts: [
      "IGBTs & SiC devices",
      "Surge protection",
      "Power & efficiency testing",
    ],
    brands: "Donghai / WXDH · Shikues · Surging · Tektronix",
    image: "solar-inverter",
    anchor: "app-solar",
  },
  {
    name: "Lighting",
    tag: "LED systems",
    title: "The details behind\na dependable driver.",
    text: "Find the switching, rectification and protection families used in LED driver designs.",
    parts: ["MOSFETs & controllers", "Bridge rectifiers", "MOVs & protection"],
    brands: "ASEMI · Reasunos · Surging",
    image: "led-driver",
    anchor: "app-led-driver",
  },
  {
    name: "Industrial & BLDC",
    tag: "Motor control",
    title: "Keep the system\nmoving forward.",
    text: "Explore component families and production testing for BLDC drivers and industrial electronics.",
    parts: [
      "Motor drivers & MOSFETs",
      "Diodes & protection",
      "Production test instruments",
    ],
    brands: "CDIL · Donghai / WXDH · Microtest",
    image: "bldc-motor-driver",
    anchor: "app-bldc",
  },
  {
    name: "Research & education",
    tag: "Test & measurement",
    title: "Make room for\nthe next discovery.",
    text: "Equip teaching and research benches with oscilloscopes, power supplies and measurement instruments.",
    parts: ["Oscilloscopes", "Precision measurement", "Bench power supplies"],
    brands: "Tektronix · Keithley · Scientific · UNI-T",
    image: "education",
    anchor: "app-edu",
  },
];
const industries = [
  [
    "Electronics Manufacturing Services",
    "Tier-1 EMS partners across NCR, Baddi and Haridwar.",
  ],
  [
    "Automotive electronics",
    "EV power, BLDC drivers and harness testing solutions.",
  ],
  [
    "Consumer electronics",
    "Components and validation for high-volume design teams.",
  ],
  ["Telecom & RF", "VNAs, spectrum analyzers, antenna and cable analyzers."],
  ["Power electronics", "SiC, GaN, regenerative loads and AC/DC sources."],
  [
    "Industrial electronics",
    "Production test rigs for transformers, harnesses and motors.",
  ],
  [
    "Research & academia",
    "Tender support and lab fit-outs for IITs, NITs and PSUs.",
  ],
  [
    "Lighting",
    "Surge protection, rectifiers and power semiconductors for lighting designs.",
  ],
];
const coverageAreas = [
  [
    "NCR cluster",
    "Delhi, Gurugram, Noida, Greater Noida, Manesar, Faridabad and Ghaziabad",
  ],
  ["Haryana", "Ambala and Sonipat"],
  ["Punjab", "Mohali and Patiala"],
  ["Uttarakhand", "Roorkee and Haridwar"],
  ["Other northern hubs", "Mandi, Baddi and Jammu"],
  [
    "Secondary coverage",
    "Bangalore (Karnataka), Hyderabad (Telangana) and Gujarat",
  ],
];

const CategoryLinks = ({ division }: { division: "instruments" | "components" }) => (
  <span className="division-categories">
    {categoriesOf(division).map((c, i) => <Fragment key={c.id}>{i > 0 && " · "}<a href={url(categoryHref(c))}>{c.name}</a></Fragment>)}
  </span>
);

export default function HomePage() {
  const [appIndex, setAppIndex] = useState(0);
  const [allCustomers, setAllCustomers] = useState(false);
  const reduced = useReducedMotion();
  const app = applications[appIndex];
  const customers = [
    ["vvdn", "VVDN Technologies"],
    ["kaynes", "Kaynes Technology"],
    ["syrma-sgs", "Syrma SGS"],
    ["hfcl", "HFCL"],
    ["iit-delhi", "IIT Delhi"],
    ["waaree", "Waaree"],
    ["stryker", "Stryker"],
    ["marelli", "Marelli"],
    ["hella", "Hella"],
    ["fiem", "Fiem"],
    ["interface", "Interface"],
    ["indication-instruments", "Indication Instruments"],
    ["iit-roorkee", "IIT Roorkee"],
    ["iit-jammu", "IIT Jammu"],
    ["iiser-mohali", "IISER Mohali"],
    ["inst", "INST"],
  ];
  return (
    <div className={`site variant-editorial ${reduced ? "motion-reduced" : ""}`}>
      <SiteHeader />
      <BrandIntro />
      <main id="main">
        <section className="hero section-shell">
          <div className="hero-kicker">
            <span>Independent expertise. Since 1994.</span>
            <span className="hero-location">New Delhi · Across India</span>
          </div>
          <div className="hero-body">
            <div className="hero-copy">
              <h1>
                <span>Components.</span>
                <span>Instruments.</span>
                <span className="blue-word">Expertise.</span>
              </h1>
              <p>
                From the first component to the final test.
                <br />
                Your partner in electronics sourcing
                <br className="desktop-break" /> and test & measurement.
              </p>
              <div className="hero-actions">
                <a className="button primary" href={url("/contact.html")}>
                  Find your solution <Arrow />
                </a>
                <a
                  className="text-link"
                  href={url("/assets/Silicom-LineCard-2026.pdf")}
                  target="_blank"
                  rel="noreferrer"
                >
                  View line card <Arrow diagonal />
                </a>
              </div>
            </div>
            <div className="hero-product">
              <div className="product-orbit" aria-hidden="true" />
              <InlineModel model="scope" reduced={reduced} />
              <div className="product-caption">
                <span>Test & measurement</span>
                <span>Tektronix · 5 Series B</span>
              </div>
            </div>
          </div>
          <div className="hero-bottom">
            <span>Precision starts with the right partner.</span>
            <a href="#divisions">
              Explore what we do <span>↓</span>
            </a>
          </div>
        </section>
        <section className="trust section-shell" aria-labelledby="trust-title">
          <div className="trust-intro">
            <p id="trust-title">
              Working with India’s
              <br />
              <strong>engineering community.</strong>
            </p>
            <button
              className="quiet-button"
              aria-expanded={allCustomers}
              onClick={() => setAllCustomers(!allCustomers)}
            >
              {allCustomers ? "Show selected" : "View all customers"}{" "}
              <span>{allCustomers ? "−" : "+"}</span>
            </button>
          </div>
          <div className="customer-logos">
            {customers
              .slice(0, allCustomers ? customers.length : 6)
              .map(([file, name]) => (
                <div key={file}>
                  {/* Trimmed logos, sized for equal visual weight by scripts/build-images.py. */}
                  <img
                    src={url(`/images/customers/${file}.webp`)}
                    alt={name}
                    loading="lazy"
                    width={logoSizes[file].w}
                    height={logoSizes[file].h}
                    style={{ "--logo-w": `${logoSizes[file].w}px`, "--logo-tone": logoSizes[file].tone } as CSSProperties}
                  />
                </div>
              ))}
          </div>
        </section>
        <section className="divisions section-shell" id="divisions">
          <div className="section-intro">
            <h2>
              Two disciplines.
              <br />
              <span>One trusted partner.</span>
            </h2>
            <p>
              Connecting the parts you need with the knowledge to put them to
              work.
            </p>
          </div>
          <div className="division-grid">
            <article className="division instruments">
              <div className="division-top">
                <span>01 / Instruments</span>
                <a href={url("/instruments.html")} aria-label="Explore instruments">
                  <Arrow diagonal />
                </a>
              </div>
              <h3>
                Measure with
                <br />
                confidence.
              </h3>
              <p>
                For the lab bench.
                <br />
                For the production line.
              </p>
              <img
                className="instrument-detail"
                src={url("/images/scope-detail.webp")}
                alt="Tektronix oscilloscope model showing its screen, controls and inputs"
                width="1100"
                height="850"
                loading="lazy"
              />
              <div className="division-links">
                <a href={url("/instruments.html")}>
                  Explore instruments <Arrow />
                </a>
                <CategoryLinks division="instruments" />
              </div>
            </article>
            <article className="division components">
              <div className="division-top">
                <span>02 / Components</span>
                <a href={url("/components.html")} aria-label="Explore components">
                  <Arrow diagonal />
                </a>
              </div>
              <h3>
                Source the
                <br />
                right part.
              </h3>
              <p>
                Semiconductors, passives
                <br />
                and protection. Sourced right.
              </p>
              <img
                className="package-detail"
                src={url("/images/packages.webp")}
                alt="Three-dimensional TO-220, TO-247, QFN and SOT-23 semiconductor package studies"
                width="1100"
                height="850"
                loading="lazy"
              />
              <div className="division-links">
                <a href={url("/components.html")}>
                  Explore components <Arrow />
                </a>
                <CategoryLinks division="components" />
              </div>
            </article>
          </div>
        </section>
        <section className="applications section-shell" id="applications">
          <div className="application-heading">
            <span className="eyebrow">Built around your application</span>
            <h2>
              What are
              <br />
              you building?
            </h2>
            <a className="text-link" href={url("/applications.html")}>
              All applications <Arrow diagonal />
            </a>
          </div>
          <div className="application-browser">
            <div
              className="application-tabs"
              role="tablist"
              aria-label="Application examples"
            >
              {applications.map((item, i) => (
                <button
                  key={item.name}
                  role="tab"
                  id={`app-tab-${i}`}
                  aria-selected={appIndex === i}
                  aria-controls="application-panel"
                  tabIndex={appIndex === i ? 0 : -1}
                  onClick={() => setAppIndex(i)}
                  onKeyDown={(e) => {
                    if (
                      [
                        "ArrowDown",
                        "ArrowUp",
                        "ArrowLeft",
                        "ArrowRight",
                        "Home",
                        "End",
                      ].includes(e.key)
                    ) {
                      e.preventDefault();
                      const n =
                        e.key === "Home"
                          ? 0
                          : e.key === "End"
                            ? applications.length - 1
                            : (i +
                                (["ArrowDown", "ArrowRight"].includes(e.key)
                                  ? 1
                                  : -1) +
                                applications.length) %
                              applications.length;
                      setAppIndex(n);
                      document.getElementById(`app-tab-${n}`)?.focus();
                    }
                  }}
                >
                  <span>{item.name}</span>
                  <Arrow />
                </button>
              ))}
            </div>
            <article
              id="application-panel"
              role="tabpanel"
              aria-labelledby={`app-tab-${appIndex}`}
              className="application-panel"
            >
              <div className="application-media">
                <img
                  src={url(`/assets/${app.image === "education" ? "instruments" : "applications"}/${app.image}.jpg`)}
                  alt=""
                  width="900"
                  height="600"
                  loading="lazy"
                />
                <span>{app.tag}</span>
              </div>
              <div className="application-content">
                <h3>
                  {app.title.split("\n").map((line, i) => (
                    <React.Fragment key={line}>
                      {i > 0 && <br />}
                      {line}
                    </React.Fragment>
                  ))}
                </h3>
                <p>{app.text}</p>
                <ul>
                  {app.parts.map((part) => (
                    <li key={part}>
                      <span>+</span>
                      {part}
                    </li>
                  ))}
                </ul>
                <p className="application-brands">{app.brands}</p>
                <a
                  className="text-link"
                  href={url(`/applications.html#${app.anchor}`)}
                >
                  Explore this application <Arrow diagonal />
                </a>
              </div>
            </article>
          </div>
        </section>
        <section className="package-stage section-shell">
          <div className="package-stage-top">
            <span>Details make the difference.</span>
            <span>Semiconductor package library</span>
          </div>
          <div className="package-stage-body">
            <div>
              <h2>
                Made to fit.
                <br />
                <span>Built to perform.</span>
              </h2>
              <p>
                Explore the form behind the function.
                <br />A closer look at the packages
                <br />
                that connect your design.
              </p>
              <a className="button light" href={url("/components.html")}>Explore components <Arrow /></a>
            </div>
            <PackageBrowser reduced={reduced} />
          </div>
        </section>
        <section className="company section-shell">
          <div className="company-image">
            <img
              src={url("/assets/company/facility.jpg")}
              alt="Silicom Electronics facility"
              width="900"
              height="1100"
              loading="lazy"
            />
            <span>On the ground. Since 1994.</span>
          </div>
          <div className="company-copy">
            <span className="eyebrow">People behind the parts</span>
            <h2>
              Expertise you
              <br />
              can count on.
            </h2>
            <p>
              Three decades of working alongside India’s engineering teams. From
              component sourcing to instrument demonstrations, our two divisions
              bring practical knowledge to every conversation.
            </p>
            <div className="company-facts">
              <div>
                <strong>1994</strong>
                <span>Our story begins</span>
              </div>
              <div>
                <strong>19</strong>
                <span>Brand partners</span>
              </div>
              <div>
                <strong>20+</strong>
                <span>Employees</span>
              </div>
            </div>
            <a className="text-link" href={url("/about.html")}>
              Meet Silicom <Arrow diagonal />
            </a>
            <div className="coverage">
              <span>
                Based in New Delhi.
                <br />
                Supporting teams across India.
              </span>
              <a href={url("/contact.html")} aria-label="Find our team">
                <Arrow diagonal />
              </a>
            </div>
          </div>
          <div className="company-details">
            <details>
              <summary>
                <span>Eight industries. One partner.</span>
                <Plus />
              </summary>
              <dl>
                {industries.map(([name, detail]) => (
                  <div key={name}>
                    <dt>{name}</dt>
                    <dd>{detail}</dd>
                  </div>
                ))}
              </dl>
            </details>
            <details>
              <summary>
                <span>Our sales coverage</span>
                <Plus />
              </summary>
              <p className="details-intro">
                Primary coverage across North India’s electronics belt, with
                support in key national clusters.
              </p>
              <dl>
                {coverageAreas.map(([name, detail]) => (
                  <div key={name}>
                    <dt>{name}</dt>
                    <dd>{detail}</dd>
                  </div>
                ))}
              </dl>
            </details>
          </div>
        </section>
        <section className="resources section-shell">
          <h2>
            The full picture.
            <br />
            <span>Ready to download.</span>
          </h2>
          <div className="resource-list">
            <a
              href={url("/assets/Silicom-LineCard-2026.pdf")}
              target="_blank"
              rel="noreferrer"
            >
              <span className="pdf-label">PDF</span>
              <span>
                <strong>Line Card 2026</strong>
                <small>Our instrument and component portfolio</small>
              </span>
              <Arrow diagonal />
            </a>
            <a
              href={url("/assets/Silicom-Company-Profile-2026.pdf")}
              target="_blank"
              rel="noreferrer"
            >
              <span className="pdf-label">PDF</span>
              <span>
                <strong>Company Profile</strong>
                <small>Our people, partnerships and capabilities</small>
              </span>
              <Arrow diagonal />
            </a>
          </div>
        </section>
        <section className="contact-band section-shell">
          <span>Need a specific part or brand? Send us your BOM or RFQ.</span>
          <div>
            <h2>
              Your next project.
              <br />
              Our full attention.
            </h2>
            <a
              href={url("/contact.html")}
              className="contact-circle"
              aria-label="Tell us about your project"
            >
              <Arrow diagonal />
            </a>
          </div>
          <a href="mailto:info@silicomindia.com">info@silicomindia.com</a>
        </section>
      </main>
      <SiteFooter />

    </div>
  );
}
