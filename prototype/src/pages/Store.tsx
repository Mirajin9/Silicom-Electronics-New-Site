import { useEffect } from 'react';
import { Layout } from '../Layout';
import { PageHero } from '../ui';
import { url } from '../base';

// store.js (the existing storefront, backed by the Node API) fills these containers.
// They are rendered as opaque HTML so React never reconciles what store.js puts inside.
const opaque = (html = '') => ({ dangerouslySetInnerHTML: { __html: html } });

export default function StorePage() {
  // Load the storefront script after hydration, so it only ever sees the final DOM.
  useEffect(() => {
    const script = document.createElement('script');
    script.src = url('/store.js');
    document.body.append(script);
    return () => script.remove();
  }, []);
  return <Layout page="store">
    <PageHero
      kicker="STORE · Spot & hobby buying — single pieces welcome"
      aside="Secure Razorpay checkout"
      title={<>Buy components online, <span className="blue-word">any quantity.</span></>}
      lede="Order MOSFETs, MLCCs, diodes and protection parts in the quantity you actually need — one piece for a prototype, or a reel for production. Prices drop automatically as you buy more."
    >
      <ul className="store-points">
        <li>✓ No minimum order</li><li>✓ Automatic bulk price breaks</li><li>✓ Secure Razorpay checkout</li><li>✓ Flat-rate shipping across India</li>
      </ul>
    </PageHero>
    <section className="store-section section-shell">
      <div className="store-toolbar">
        <label className="store-search">
          <span className="sr-only">Search components</span>
          <input id="searchInput" type="search" placeholder="Search part number, name or category…" aria-label="Search components" />
        </label>
        <div className="store-filters" id="brandFilters" {...opaque()} />
      </div>
      <div className="store-grid" id="productGrid" aria-live="polite" {...opaque('<div class="store-empty" id="loadingMsg">Loading products…</div>')} />
    </section>
    <div className="store-modal" id="productModal" hidden>
      <div className="store-modal-backdrop" data-close="" />
      <div className="store-modal-card" role="dialog" aria-modal="true" aria-labelledby="pmName">
        <button className="store-modal-close" data-close="" aria-label="Close">✕</button>
        <div className="pm-body" id="pmBody" {...opaque()} />
      </div>
    </div>
    <div className="store-drawer" id="cartDrawer" hidden>
      <div className="store-drawer-backdrop" data-close-cart="" />
      <aside className="store-drawer-panel" role="dialog" aria-modal="true" aria-label="Shopping cart">
        <div className="drawer-head">
          <h3>Your cart</h3>
          <button className="store-modal-close" data-close-cart="" aria-label="Close cart">✕</button>
        </div>
        <div className="drawer-items" id="drawerItems" {...opaque()} />
        <div className="drawer-foot" id="drawerFoot" {...opaque()} />
      </aside>
    </div>
    <div className="store-modal" id="checkoutModal" hidden>
      <div className="store-modal-backdrop" data-close-checkout="" />
      <div className="store-modal-card store-checkout-card" role="dialog" aria-modal="true" aria-label="Checkout">
        <button className="store-modal-close" data-close-checkout="" aria-label="Close">✕</button>
        <div id="checkoutBody" {...opaque()} />
      </div>
    </div>
  </Layout>;
}
