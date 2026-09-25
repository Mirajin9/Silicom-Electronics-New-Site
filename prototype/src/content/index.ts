// Content of the original site, extracted by scripts/extract-content.mjs, plus the few
// structures written for the new design (see also ./categories.ts). Re-run the extractor
// if the original pages change.
import instrumentsJson from './instruments.json';
import componentsJson from './components.json';
import applicationsJson from './applications.json';
import brandsJson from './brands.json';
import aboutJson from './about.json';
import brandLogoSizes from './brand-logos.json';
import { paceBrand, paceCard, paceTile } from './pace';
import type { Img, Link, TitlePart } from '../ui';
import type { ModelId } from '../models';

export type Hero = { badge: string; tag: string; title: TitlePart[]; lede: string; actions: Link[]; note: string | null; image: Img };
export type Head = { eyebrow: string; heading: string; text: string; actions: Link[] };
export type Banner = { eyebrow: string; heading: string; text: string; chips: string[]; actions: Link[] };
export type BrandCard = { slug: string | null; logo: Img; title: string; meta: string; categories: Link[]; note: string; links: Link[] };
export type Product = {
  image: Img; brandLogo: Img; brandLabel: string; model: string; title: string; tagline: string;
  specs: [string, string][]; bullets: string[]; useCase: string; link: Link;
};
export type Division = {
  hero: Hero;
  featured?: { head: { eyebrow: string; heading: string; text: string }; products: Product[] };
  brands: { head: Head; note: string | null; cards: BrandCard[] };
  banners: (Banner & { id: string | null })[];
  cta: Banner;
};
export type Application = {
  id: string; title: string; meta: string; image: Img;
  parts: { name: string; detail: string; source: string }[]; note: string; link: Link;
};
export type Brand = {
  slug: string; name: string; cat: 'instruments' | 'components'; catLabel: string; origin: string;
  breadcrumb: { label: string; href: string | null }[];
  hero: Hero & { chips: string[] }; heroImage: Img; logo: Img;
  glance: { eyebrow: string; rows: [string, string][] };
  about: Head & { paragraphs: string[] };
  range: Head & { rows: [string, string][] };
  applications: { eyebrow: string; heading: string; chips: string[] };
  why: Head & { items: { icon: string; title: string; text: string }[] };
  faq: Head & { items: { q: string; a: string }[] };
  cta: Banner;
  related: { eyebrow: string; items: { slug: string; name: string; label: string }[] };
};
export type Tile = {
  slug: string; cat: string; linkLabel: string; image: Img; logo: Img; name: string; catLabel: string;
  description: string; chips: string[]; viewLabel: string;
};

const instrumentsSource = instrumentsJson as unknown as Division;
/** PACE (added in the redesign) is the tenth instrument partner. */
export const instruments: Division = {
  ...instrumentsSource,
  brands: {
    ...instrumentsSource.brands,
    head: { ...instrumentsSource.brands.head, heading: instrumentsSource.brands.head.heading.replace(/^Nine /, 'Ten ') },
    cards: [...instrumentsSource.brands.cards, paceCard],
  },
};
export const components = componentsJson as unknown as Division;
type ApplicationsContent = {
  hero: Hero; head: Head; groups: { id: string; label: string; items: Application[] }[]; cta: Banner;
};
/** The original site's instrument application photos showed a competitor's oscilloscope, vintage
 *  analogue scopes, a pole transformer and battery cells; these show the instruments we supply. */
const applicationPhotos: Record<string, Img> = {
  'app-signal-debug': { src: '/images/products/tektronix-2-series-mso.webp', alt: 'Tektronix 2 Series mixed-signal oscilloscope' },
  'app-ev-power': { src: '/images/products/elektro-automatik-psi9000.webp', alt: 'Elektro-Automatik programmable DC power supply' },
  'app-transformer': { src: '/images/products/microtest-5465.webp', alt: 'Microtest 5465 transformer analyzer' },
  'app-cable-harness': { src: '/images/products/microtest-8761.webp', alt: 'Microtest 8761 cable harness tester' },
  'app-rf-telecom': { src: '/images/products/anritsu-ms2720t.webp', alt: 'Anritsu Spectrum Master handheld spectrum analyzer' },
  'app-smu-semi': { src: '/images/products/keithley-2450.webp', alt: 'Keithley 2450 SourceMeter source measure unit' },
};
const applicationsSource = applicationsJson as unknown as ApplicationsContent;
export const applications: ApplicationsContent = {
  ...applicationsSource,
  groups: applicationsSource.groups.map((g) => ({ ...g, items: g.items.map((a) => (applicationPhotos[a.id] ? { ...a, image: applicationPhotos[a.id] } : a)) })),
};
export const brands = [...(brandsJson as unknown as { brands: Brand[] }).brands, paceBrand];
const brandIndexSource = (brandsJson as unknown as {
  index: { hero: Hero; filters: { id: string; label: string }[]; tiles: Tile[]; banner: Banner; cta: Banner };
}).index;
/** PACE sits with the other instrument partners, before the component brands. */
export const brandIndex = {
  ...brandIndexSource,
  tiles: [...brandIndexSource.tiles.filter((t) => t.cat === 'instruments'), paceTile, ...brandIndexSource.tiles.filter((t) => t.cat !== 'instruments')],
};
export const about = aboutJson as unknown as {
  hero: Hero & { stats: { value: string; label: string }[] };
  image: Img;
  why: Head & { items: { title: string; text: string }[] };
  journey: Head & { rows: { year: string; title: string; text: string }[] };
  leadership: Head & { people: { initials: string; photo: Img; name: string; role: string; bio: string; contacts: string[] }[] };
  offer: Head & { items: { eyebrow: string; title: string; text: string }[] };
  cta: Banner;
};
export const brandBySlug = (slug: string) => brands.find((b) => b.slug === slug)!;

/** Component brands have no product photography; their tiles show the package family
 *  they are best known for, rendered from the 3D models (public/images/packages). */
export const brandModel: Record<string, ModelId | undefined> = {
  'donghai-wxdh': 'to247', reasunos: 'to220', 'mot-inmark': 'to220', 'jilin-sino': 'sot23',
  asemi: 'sot23', shikues: 'qfn', cdil: 'to220',
};

/** Partner logos trimmed and sized for equal visual weight by scripts/build-images.py.
 *  Width and height are the display size at full scale. */
export const brandLogo = (slug: string) => {
  const size = (brandLogoSizes as Record<string, { w: number; h: number }>)[slug];
  return size ? { src: `/images/brands/${slug}.webp`, ...size } : null;
};
