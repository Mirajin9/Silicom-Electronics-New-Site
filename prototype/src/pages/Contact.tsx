import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { Layout } from '../Layout';
import { Arrow, PageHero } from '../ui';
import { url } from '../base';

const REQUIRED = ['name', 'company', 'email', 'message'] as const;
const TOPICS = ['Request a product demo', 'Submit a BOM / RFQ', 'Tender / GeM enquiry', 'Become a brand partner', 'Technical / application support', 'Something else'];

function EnquiryForm() {
  const form = useRef<HTMLFormElement>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sent, setSent] = useState(false);

  // Links such as contact.html?brand=tektronix&cat=smu carry what the visitor was looking at.
  useEffect(() => {
    const f = form.current!;
    const q = new URLSearchParams(location.search);
    const division = q.get('division');
    if (division === 'components' || division === 'instruments') (f.elements.namedItem(`div-${division}`) as HTMLInputElement).checked = true;
    else if (q.has('brand') || q.has('bom') || q.has('cat')) {
      const componentsBrand = /asemi|wxdh|donghai|shikues|jilin|mot|reasunos|surging|adler|mlcc|cdil/.test(q.get('brand') || '');
      if (componentsBrand || q.has('bom')) (f.elements.namedItem('div-components') as HTMLInputElement).checked = true;
    }
    const context = ['brand', 'cat', 'app', 'bom', 'demo'].filter((k) => q.has(k)).map((k) => `${k}: ${q.get(k)}`).join('\n');
    if (context) (f.elements.namedItem('message') as HTMLTextAreaElement).value = `I would like to enquire about:\n${context}\n\n`;
  }, []);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const f = form.current!;
    const data = new FormData(f);
    const next: Record<string, string> = {};
    for (const name of REQUIRED) {
      const value = String(data.get(name) || '').trim();
      if (!value) next[name] = 'Please complete this field.';
      else if (name === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) next[name] = 'Enter a valid email address.';
    }
    setErrors(next);
    const first = REQUIRED.find((n) => next[n]);
    if (first) {
      (f.elements.namedItem(first) as HTMLElement).focus();
      return;
    }
    const subject = encodeURIComponent(`Silicom enquiry - ${data.get('division')}`);
    const body = encodeURIComponent(['name', 'company', 'email', 'phone', 'division', 'topic', 'message'].map((k) => `${k}: ${data.get(k) || ''}`).join('\n'));
    window.location.href = `mailto:info@silicomindia.com?subject=${subject}&body=${body}`;
    setSent(true);
  };
  const field = (name: string) => ({
    id: name, name, 'aria-invalid': errors[name] ? true : undefined, 'aria-describedby': errors[name] ? `error-${name}` : undefined,
    onInput: () => errors[name] && setErrors({ ...errors, [name]: '' }),
  });
  const error = (name: string) => <div className="field-error" id={`error-${name}`} data-error-for={name} aria-live="polite">{errors[name]}</div>;

  return <form className="enquiry-form" id="contact-form" ref={form} action="mailto:info@silicomindia.com" method="POST" encType="text/plain" noValidate onSubmit={submit}>
    <div className={`success-banner${sent ? ' show' : ''}`} id="success-banner" role={sent ? 'status' : undefined}>
      <span>Your email draft is ready. Send it from your email app to complete your enquiry.</span>
    </div>
    <fieldset className="field">
      <legend>Which division?</legend>
      <div className="division-toggle">
        <input type="radio" name="division" id="div-instruments" value="instruments" defaultChecked />
        <label htmlFor="div-instruments">Instruments (T&amp;M)</label>
        <input type="radio" name="division" id="div-components" value="components" />
        <label htmlFor="div-components">Components</label>
      </div>
    </fieldset>
    <div className="field-row">
      <div className="field"><label htmlFor="name">Your name *</label><input {...field('name')} type="text" required placeholder="Full name" autoComplete="name" />{error('name')}</div>
      <div className="field"><label htmlFor="company">Company *</label><input {...field('company')} type="text" required placeholder="Organization" autoComplete="organization" />{error('company')}</div>
    </div>
    <div className="field-row">
      <div className="field"><label htmlFor="email">Email *</label><input {...field('email')} type="email" required placeholder="you@company.com" autoComplete="email" />{error('email')}</div>
      <div className="field"><label htmlFor="phone">Phone</label><input id="phone" name="phone" type="tel" placeholder="+91 ..." autoComplete="tel" /><div className="field-error" data-error-for="phone" /></div>
    </div>
    <div className="field">
      <label htmlFor="topic">What can we help with?</label>
      <select id="topic" name="topic">{TOPICS.map((t) => <option key={t}>{t}</option>)}</select>
    </div>
    <div className="field">
      <label htmlFor="message">Message *</label>
      <textarea {...field('message')} required placeholder="Part numbers, quantities, application, deadlines…" rows={6} />
      {error('message')}
    </div>
    <button type="submit" className="button primary">Send enquiry <Arrow /></button>
    <div className="contact-fallback">This static site opens your email app with the enquiry filled in. You can also email <a href="mailto:info@silicomindia.com">info@silicomindia.com</a> directly.</div>
    <p className="form-note">By sending you agree to be contacted by Silicom Electronics. We don't share your details.</p>
  </form>;
}

const Row = ({ label, children }: { label: string; children: ReactNode }) => <div className="info-row"><span className="info-label">{label}</span><div>{children}</div></div>;

export default function ContactPage() {
  return <Layout page="contact">
    <PageHero
      kicker="CONTACT · Components & Instruments — Two divisions, one team"
      aside="Mon – Sat · 9:30 AM – 6:30 PM IST"
      title={<><span className="blue-word">Get in touch</span> with Silicom Electronics.</>}
      lede="Tell us what you're building. Our technical sales engineers will get back to you within one working day with a quote, demo schedule or product application guidance."
      media={<img className="page-hero-photo contact-photo" src={url("/assets/company/reception.jpg")} alt="Silicom Electronics office, Kirti Nagar, New Delhi" loading="eager" />}
    />
    <section className="contact-layout section-shell">
      <EnquiryForm />
      <aside className="info-card" aria-labelledby="direct-title">
        <span className="eyebrow">Direct lines</span>
        <h2 id="direct-title">Talk to a division</h2>
        <Row label="Instruments Division"><a className="info-value" href="tel:+919810045234">+91 9810 045 234</a><span className="info-sub">Mr. Chandeep Singh — Director (TMI)</span></Row>
        <Row label="Components Division"><a className="info-value" href="tel:+919810029582">+91 9810 029 582</a><span className="info-sub">Mr. Suneet Dargan — Director (Components)</span><a className="info-sub" href="tel:+919911419582">+91 9911 419 582</a></Row>
        <Row label="Email"><a className="info-value" href="mailto:info@silicomindia.com">info@silicomindia.com</a><a className="info-sub" href="mailto:suneet@silicomindia.com">suneet@silicomindia.com</a></Row>
        <Row label="Office"><span className="info-value">C-26 DSIDC Complex</span><span className="info-sub">Kirti Nagar, New Delhi 110015 · India</span></Row>
        <Row label="Hours"><span className="info-value">Mon – Sat · 9:30 AM – 6:30 PM IST</span><span className="info-sub">Closed on Sundays &amp; national holidays</span></Row>
        <ul className="chips"><li>ISO 9001:2015</li><li>GeM Assessed</li><li>www.silicomindia.com</li></ul>
      </aside>
    </section>
    <section className="coverage-band section-shell">
      <div>
        <h2>Pan-India sales coverage</h2>
        <p>NCR, Punjab, Haryana, Uttarakhand, Himachal, Jammu, Bangalore, Hyderabad &amp; Gujarat — backed by 20+ employees and 30 years on the ground.</p>
      </div>
      <a className="text-link" href={url("/about.html")}>See coverage <Arrow diagonal /></a>
    </section>
  </Layout>;
}
