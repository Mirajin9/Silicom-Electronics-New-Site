# Silicom premium redesign — direction and delivery plan

23 September 2026 · Proposal for design review

## Recommendation

Build an industrial editorial website: substantial block typography, precise alignment, open white space, Silicom blue, and believable studio-lit product models. Use strong changes of scale to create rhythm. Product selection and technical information should remain easy to scan.

The recommended direction is **A: Industrial Editorial**, with one restrained product-theatre sequence from direction C. Start with a homepage study and an oscilloscope prototype; resolve their quality before expanding the design to the complete site.

This folder contains the completed review and production plan. The React rebuild and web-ready 3D assets are proposed work, not completed deliverables. Existing production HTML, CSS, JavaScript, and server files have not been changed.

Supporting documents:

- [Design system and brand assets](brand-spec.md)
- [Content preservation and route map](content-map.md)
- [3D asset production brief](3d-asset-brief.md)
- [Research, references, and skills](research/sources.md)
- [Machine-readable audit of all 27 pages](research/site-audit.json)

## What the review found

The source inventory contains **27 pages: eight main pages and 19 brand pages**. Applications contains **18 detailed application entries**, nine for components and nine for instruments. The homepage additionally uses eight broad application/industry groupings; these are different taxonomies and must not be silently merged.

I visually reviewed the homepage, components, instruments, applications, and Tektronix page in a browser, and inspected the shared styling, navigation, enquiry implementation, store architecture, brand generator, and source inventory. This was a design/content review, not a live checkout test or an exhaustive accessibility audit.

### Preserve

- Existing blue, white, navy, pale-blue, and division accent palette.
- The actual Silicom logo, partner identities, and existing customer assets.
- Product families, supplier coverage, application kits, downloads, company history, leadership, sales coverage, and both division contacts.
- Every public page URL and useful anchor/query parameter.
- The store's catalog, search, price tiers, stock, cart, shipping quote, payment verification, and admin capabilities.
- Existing keyboard focus styles, skip links, and reduced-motion support where present.

### Problems to solve

1. **The first screen does not establish the product strongly enough.** “Find your supply path” is abstract; the dominant image is the reception area, and the actual division links sit below a large container. Lead with what Silicom supplies and a recognisable instrument.
2. **Too many elements have the same soft treatment.** Rounded glass containers, pills, gradients, shadows, and repeated split layouts flatten the hierarchy. Introduce squared compositions, clear rules, contrasting type weights, and solid surfaces.
3. **Browsing starts with suppliers more often than buyer intent.** Engineers should be able to start with a component family, instrument type, or application, then narrow by brand.
4. **Important product material is hidden.** The instrument featured-product section is collapsed initially. Show a curated product selection directly; reserve disclosure for specifications and secondary detail.
5. **Navigation has broken promises.** Eight distinct instrument/component anchor destinations are missing. The homepage's hardcoded mobile drawer omits Applications, while the shared script only generates a drawer when one does not already exist.
6. **Enquiry context is lost.** Links include `brand` and `cat`, but the inspected contact flow does not use those values. The form opens `mailto:` and displays “we've logged your enquiry” without a server submission. The new flow needs truthful confirmation and retained context.
7. **Brand pages sound repetitive.** “Distributor in India — best price & support” repeats across the generated pages. Keep search intent and factual portfolio content, but lead with each manufacturer's relevant product range. Confirm claims such as authorisation, availability, certifications, and response time before carrying them into newly written copy.

### Design assessment

Subjective assessment against the requested premium, blocky direction; not an automated score:

| Dimension | Current assessment | Main reason |
|---|---:|---|
| Direction alignment | 4/10 | Current soft glass language does not express the requested industrial confidence |
| Visual hierarchy | 5/10 | Headings are large, but product imagery and actions lack a clear first-screen priority |
| Craft | 6/10 | Consistent shared system, but overly similar treatments and mixed product imagery |
| Functionality | 5/10 | Useful content paths exist; anchors, enquiry context, and confirmation need repair |
| Originality | 4/10 | Repeated page patterns outweigh the more distinctive application interaction |

Overall design judgment: **about 5/10 for this brief**. The largest improvements are product-led composition, clear type rhythm, and better category access. Applying a new font alone will not achieve the intended result.

## How the references inform this

[Aardvark](https://www.aardvarkbookclub.com/) uses oversized tightly set type, objects at dramatically different scales, and decisive section changes. Borrow that confidence and compositional rhythm. For Silicom, use straighter letterforms, optical restraint, real industrial materials, and more disciplined supporting copy.

Your [Neri reference](https://flowing-smile-186867.framer.app/) creates atmosphere through its landscape opening, prominent identity, spacious story section, and dark destination gallery. Borrow the sense of deliberate progression and the transition from a large visual to useful information. Silicom's equivalent is the transition from a precision instrument to its applications and sourcing paths.

The design principle is **large statement → useful detail → visual pause → next decision**. This aligns with hierarchy through scale, contrast, and grouping described by [Nielsen Norman Group](https://www.nngroup.com/articles/visual-hierarchy-ux-definition/).

## Three focused renditions

All renditions retain the same brand colours and logo. They are composition studies, not three complete websites.

| Direction | Typography and composition | 3D role | Trade-off |
|---|---|---|---|
| **A. Industrial Editorial — recommended** | Archivo 800–900; broad, left-aligned headline blocks; white space; large blue chapter bands; asymmetric product placement | One dominant scope, one coordinated package group | Strong identity with good readability and clear buyer paths |
| B. Precision Catalogue | Barlow Semi Condensed 700–800; tighter typographic grid; compact category index; more technical detail above the fold | Smaller interactive product windows | Most efficient for repeat procurement users; less dramatic opening |
| C. Product Theatre | Heavy extended type; navy opening; large product close-up followed by a bright catalogue section | Slow controlled reveal and limited user rotation | Strongest product spectacle; highest visual, accessibility, and performance burden |

The first review should compare the **same headline, product, and navigation** across these options so the composition can be judged fairly. A development-only variant switch can help compare them without maintaining three separate sites.

## Proposed homepage rhythm

| Beat | Composition | Information and next action |
|---|---|---|
| 01 / Opening | White, wide, and asymmetric. Real logo in a compact header. Large headline with scope to the right and enough clear space around both. | Headline study: **“COMPONENTS. INSTRUMENTS. EXPERTISE.”** Supporting copy names distribution, engineering support, and India. Primary action: “Send an enquiry”. Clear text links to Instruments and Components. “Since 1994” remains a concise trust cue. |
| 02 / Proof | Compact, stationary customer strip with consistent optical logo sizes | A selected subset of existing customer marks; an accessible route to the full set. Keep manufacturer and customer relationships distinct. |
| 03 / Two divisions | Broad blue instrument panel paired with a white component composition; clear labels and unequal image scales | “MEASURE WITH CONFIDENCE.” and “SOURCE THE RIGHT PART.” Each has a short category list and a direct browsing link. |
| 04 / Application guide | Pale-blue background; persistent visible category names; one active application detail panel | Show the relevant component families, test instruments, suppliers, and enquiry action. All detailed application entries remain available in the hub. |
| 05 / Product moment | Navy stage, large scope or package close-up, short caption | Explain an actual sourcing/test use case. An optional controlled rotation reveals relevant product detail. It ends in a stable reading state. |
| 06 / Company proof | White, editorial photo layout using actual office/warehouse imagery | History, technical support, and a concise coverage overview. Full company and geographic detail stays on About. |
| 07 / Practical close | Compact download rows, then a strong blue enquiry section | Line Card and Company Profile remain obvious. Both divisions' contact details and a clear RFQ path finish the page. |

On mobile the headline comes first, followed by its action and a static product poster. The model is activated explicitly when useful. Category lists become straightforward stacked sections; nothing depends on hover or a horizontal scroll gesture to be discovered.

## Innovation with a purpose

- **A real instrument as the main visual.** The Tektronix scope has a carefully posed silhouette, accurate housing, connectors, controls, and screen. Limited movement establishes physical depth; it settles while visitors read.
- **A package library that helps browsing.** Selecting a package or family can update the adjacent description and relevant supplier links. Generic package geometry must not imply a particular SKU is available.
- **One visual language for products.** Consistent camera, light, scale conventions, black moulded resin, brushed metal, and soft contact shadows connect the oscilloscope and semiconductor scenes.
- **The logo as a small loading component.** Use the existing mark with a restrained opacity/mask reveal inside the model area while that asset genuinely loads. The header, text, and navigation render immediately. No artificial full-site loading delay.
- **Enquiries that remember the journey.** A visitor coming from Tektronix oscilloscopes should see that context already present. The submitted enquiry should retain the selected product/application information.

## Build architecture

Use **React + TypeScript + Vite**, with static prerendering for the marketing routes and shared data for products, brands, and applications. Keep the existing `.html` URLs initially; emit useful HTML at those paths, with page-specific metadata and structured data. Avoid making the catalogue's search visibility depend on a canvas or a blank JavaScript shell.

Load Three.js / React Three Fiber only in the product-viewer layer. Use normal HTML for text, specifications, links, filters, and enquiries. Export production models as GLB with compressed textures and static poster alternatives. Render on demand and pause offscreen: [React Three Fiber's own guidance](https://github.com/pmndrs/react-three-fiber/blob/master/docs/advanced/scaling-performance.mdx) describes this performance approach.

Retain the existing Node/Express store API while replacing its visual frontend. Keep price calculation and payment verification on the server. Move the brand generator's data into a shared source after the new template is ready, and prevent the legacy generator overwriting rebuilt pages.

Hostinger supports both static frontend and Node deployment approaches, depending on the plan. The existing Express/SQLite store also needs persistent storage for its database and uploads. A VPS is the most direct fit for its present architecture; managed Node hosting is another candidate after checking persistent-storage and native-module support. The actual account plan is still unknown. See [Hostinger's current hosting options](https://www.hostinger.com/support/node-js-hosting-options-at-hostinger/).

## Delivery sequence and review gates

| Phase | Concrete deliverable | Completion condition |
|---|---|---|
| 0 / Audit and sourcing — completed | This plan, 27-page content inventory, existing identity tokens, manufacturer CAD archive, and supplier package references | A clear design proposal and preservation contract exist |
| 1 / Visual studies | Three homepage opening studies plus one mobile composition, using the real logo and supplied product imagery | A preferred composition and typography are selected |
| 2 / 3D proof | One reviewable oscilloscope model, one finished TO-220/TO-247 package, material/lighting study, and fallback posters | Silhouette, details, realism, and browser cost meet the agreed bar |
| 3 / Core React build | Homepage, Instruments, Components, application hub, and shared navigation; first live model integration | Primary journeys and mobile layouts work with and without 3D |
| 4 / Complete migration | All 19 brand pages, Brands, About, Contact, Store, downloads, metadata, and existing route compatibility | Every old content block has a documented destination and all 27 routes work |
| 5 / Polish and release | Motion refinement, accessible states, performance tuning, deployment package, Hostinger configuration, and rollback bundle | Content sign-off, tested enquiry/checkout flows, no broken deep links, and release review |

Work in reviewable renditions. A reasonable planning allowance is **roughly 2–3 weeks of focused design/build work**, with overlap between modelling and template development. This is an estimate, not a delivery promise or a background schedule. Detailed model cleanup, source quality, feedback, and hosting configuration are the main variables. The first visible design study should precede the expensive full migration.

## Acceptance criteria

- All 27 existing routes work; all 18 detailed application entries and all 19 brands are retained.
- Missing category anchors are repaired; mobile and desktop navigation expose the same essential destinations.
- Products, forms, and specifications remain usable with JavaScript/3D failure where appropriate; the static marketing content stays readable.
- Enquiry success means server acceptance, and context survives navigation. The existing email and phone routes remain available.
- Store regression checks cover price tiers, stock, shipping, cart persistence, unsuccessful payment states, and duplicate payment callbacks, using test data.
- Keyboard access, visible focus, legible contrast, reduced motion, touch controls, and 200% zoom are checked across representative templates.
- Use **LCP ≤2.5 seconds, INP ≤200 ms, CLS ≤0.1 at the 75th percentile** as real-traffic goals. Lab checks guide the build; actual field performance requires traffic after launch. These are [Google's documented thresholds](https://web.dev/articles/vitals), not measurements of the current site.
- No product substitutions, invented testimonials, unsupported stock promises, or decorative text masquerading as technical specifications.

## Current progress

Direction A was approved and the first React homepage and five 3D studies have been built. Review [Rendition 01](rendition-01.md) and [the runnable prototype](../prototype/README.md). This completes the initial design/model proof, not the full route migration.

## Next decision

Proceed with **A: Industrial Editorial**, exploring Archivo-heavy typography and a white-led homepage, with a navy product-theatre section. The first review should contain the homepage opening studies and a 3D shape/material proof before the complete rollout.

The supplied Garden Web Design Engineer skill explicitly calls for design-system confirmation before its v0. This plan is that reviewable checkpoint: the design can now be accepted or adjusted with concrete choices on the table.
