/* Silicom component store — storefront logic.
   Talks to the Node API (same origin by default; override with window.STORE_API_BASE).
   Cart persists in localStorage, mirroring the site's existing localStorage pattern. */
(function () {
  'use strict';

  var API = (window.STORE_API_BASE || '').replace(/\/$/, '');
  var CART_KEY = 'silicom-cart';

  var state = {
    products: [],
    byId: {},
    filterBrand: null,
    search: '',
    storeConfig: { razorpayEnabled: false, razorpayKeyId: null },
  };

  // ---------- helpers ----------
  function api(path) { return API + path; }
  function inr(n) {
    return '₹' + Number(n).toLocaleString('en-IN', { minimumFractionDigits: Number.isInteger(+n) ? 0 : 2, maximumFractionDigits: 2 });
  }
  function el(html) { var t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstElementChild; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  function unitPriceFor(tiers, qty) {
    if (!tiers || !tiers.length) return null;
    var sorted = tiers.slice().sort(function (a, b) { return a.min_qty - b.min_qty; });
    var price = sorted[0].unit_price;
    sorted.forEach(function (t) { if (qty >= t.min_qty) price = t.unit_price; });
    return price;
  }

  // ---------- cart ----------
  function loadCart() { try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; } catch (e) { return []; } }
  function saveCart(c) { try { localStorage.setItem(CART_KEY, JSON.stringify(c)); } catch (e) {} updateCartCount(); }
  function cartQtyFor(id) { var l = loadCart().find(function (x) { return x.id === id; }); return l ? l.qty : 0; }
  function setCartQty(id, qty) {
    var cart = loadCart();
    var line = cart.find(function (x) { return x.id === id; });
    qty = Math.max(0, Math.floor(qty));
    var p = state.byId[id];
    if (p && qty > p.stock) qty = p.stock;
    if (qty === 0) { cart = cart.filter(function (x) { return x.id !== id; }); }
    else if (line) { line.qty = qty; }
    else { cart.push({ id: id, qty: qty }); }
    saveCart(cart);
  }
  function cartTotals() {
    var cart = loadCart(), subtotal = 0, count = 0;
    cart.forEach(function (l) {
      var p = state.byId[l.id]; if (!p) return;
      subtotal += (unitPriceFor(p.tiers, l.qty) || 0) * l.qty; count += l.qty;
    });
    return { subtotal: Math.round(subtotal * 100) / 100, count: count };
  }
  function updateCartCount() {
    var c = loadCart().reduce(function (a, l) { return a + l.qty; }, 0);
    document.getElementById('cartCount').textContent = c;
  }

  // ---------- catalog render ----------
  function thumb(p, cls) {
    if (p.image_main) return '<img src="' + esc(p.image_main) + '" alt="' + esc(p.name) + '" loading="lazy">';
    return '<div class="' + (cls || 'ph') + '">' + esc(p.sku) + '</div>';
  }

  function productCard(p) {
    var card = el(
      '<article class="product-card" data-id="' + p.id + '">' +
        '<div class="product-thumb">' + thumb(p) + '</div>' +
        '<div class="product-body">' +
          '<span class="product-brand">' + esc(p.brand || 'Component') + '</span>' +
          '<span class="product-name">' + esc(p.name) + '</span>' +
          '<span class="product-sku">' + esc(p.sku) + '</span>' +
          (p.short_desc ? '<p class="product-desc">' + esc(p.short_desc) + '</p>' : '') +
          '<div class="product-foot">' +
            '<div class="product-price"><span class="from">from</span>' +
              '<span class="amt">' + inr(p.price_floor) + '<small>/pc</small></span></div>' +
            (p.in_stock
              ? '<button class="add-btn" data-add>Add</button>'
              : '<span class="product-stock out">Out of stock</span>') +
          '</div>' +
        '</div>' +
      '</article>'
    );
    card.addEventListener('click', function (e) {
      if (e.target.closest('[data-add]')) { e.stopPropagation(); addToCart(p.id, 1); openCart(); return; }
      openProduct(p.slug);
    });
    return card;
  }

  function renderGrid() {
    var grid = document.getElementById('productGrid');
    var q = state.search.toLowerCase();
    var list = state.products.filter(function (p) {
      if (state.filterBrand && p.brand !== state.filterBrand) return false;
      if (!q) return true;
      return (p.name + ' ' + p.sku + ' ' + p.category + ' ' + p.brand).toLowerCase().indexOf(q) !== -1;
    });
    grid.innerHTML = '';
    if (!list.length) { grid.appendChild(el('<div class="store-empty">No components match your search.</div>')); return; }
    list.forEach(function (p) { grid.appendChild(productCard(p)); });
  }

  function renderFilters() {
    var brands = Array.from(new Set(state.products.map(function (p) { return p.brand; }).filter(Boolean))).sort();
    var wrap = document.getElementById('brandFilters');
    wrap.innerHTML = '';
    var all = el('<button class="store-chip active" data-brand="">All</button>');
    wrap.appendChild(all);
    brands.forEach(function (b) { wrap.appendChild(el('<button class="store-chip" data-brand="' + esc(b) + '">' + esc(b) + '</button>')); });
    wrap.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-brand]'); if (!btn) return;
      state.filterBrand = btn.dataset.brand || null;
      wrap.querySelectorAll('.store-chip').forEach(function (c) { c.classList.toggle('active', c === btn); });
      renderGrid();
    });
  }

  // ---------- product modal ----------
  function addToCart(id, qty) { setCartQty(id, cartQtyFor(id) + qty); }

  function openProduct(slug) {
    var p = state.products.find(function (x) { return x.slug === slug; });
    if (!p) return;
    var qty = Math.max(1, cartQtyFor(p.id) || 1);

    var images = (p.images && p.images.length) ? p.images : (p.image_main ? [p.image_main] : []);
    var galleryMain = images.length ? '<img id="pmMainImg" src="' + esc(images[0]) + '" alt="' + esc(p.name) + '">' : '<div class="ph">' + esc(p.sku) + '</div>';
    var thumbs = images.length > 1 ? '<div class="pm-thumbs">' + images.map(function (u, i) { return '<img src="' + esc(u) + '" class="' + (i === 0 ? 'active' : '') + '" data-src="' + esc(u) + '">'; }).join('') + '</div>' : '';

    var tiersSorted = p.tiers.slice().sort(function (a, b) { return a.min_qty - b.min_qty; });
    var ceiling = tiersSorted[0] ? tiersSorted[0].unit_price : 0;
    var tierRows = tiersSorted.map(function (t) {
      var save = ceiling > 0 ? Math.round((1 - t.unit_price / ceiling) * 100) : 0;
      return '<tr data-min="' + t.min_qty + '"><td>' + t.min_qty + '+</td><td>' + inr(t.unit_price) + '</td><td class="tier-save">' + (save > 0 ? '−' + save + '%' : '—') + '</td></tr>';
    }).join('');

    var body =
      '<div class="pm-grid">' +
        '<div class="pm-gallery"><div class="pm-main">' + galleryMain + '</div>' + thumbs + '</div>' +
        '<div>' +
          '<span class="product-brand">' + esc(p.brand || 'Component') + '</span>' +
          '<h2 class="pm-name" id="pmName">' + esc(p.name) + '</h2>' +
          '<div class="product-sku">' + esc(p.sku) + (p.category ? ' · ' + esc(p.category) : '') + '</div>' +
          (p.long_desc ? '<p class="pm-long">' + esc(p.long_desc) + '</p>' : (p.short_desc ? '<p class="pm-long">' + esc(p.short_desc) + '</p>' : '')) +
          '<table class="tier-table"><thead><tr><th>Quantity</th><th>Price / pc</th><th>You save</th></tr></thead><tbody>' + tierRows + '</tbody></table>' +
          '<div class="qty-row">' +
            '<div class="qty-stepper"><button data-step="-1" aria-label="Decrease">−</button>' +
              '<input id="pmQty" type="number" min="1" max="' + p.stock + '" value="' + qty + '">' +
              '<button data-step="1" aria-label="Increase">+</button></div>' +
            '<div class="pm-line-price"><span class="unit" id="pmUnit"></span><div class="total" id="pmTotal"></div></div>' +
          '</div>' +
          '<div class="product-stock in" style="margin-bottom:12px">' + p.stock + ' in stock · single pieces welcome</div>' +
          '<button class="btn btn-primary btn-full" id="pmAdd">Add to cart</button>' +
        '</div>' +
      '</div>';

    document.getElementById('pmBody').innerHTML = body;
    show('productModal');

    var qtyInput = document.getElementById('pmQty');
    function refresh() {
      var q = Math.max(1, Math.min(p.stock, parseInt(qtyInput.value, 10) || 1));
      qtyInput.value = q;
      var unit = unitPriceFor(p.tiers, q);
      document.getElementById('pmUnit').textContent = inr(unit) + ' / pc';
      document.getElementById('pmTotal').textContent = inr(unit * q);
      document.querySelectorAll('#pmBody .tier-table tr[data-min]').forEach(function (tr) {
        tr.classList.toggle('active', q >= +tr.dataset.min && (!tr.nextElementSibling || q < +tr.nextElementSibling.dataset.min));
      });
    }
    document.getElementById('pmBody').addEventListener('click', function (e) {
      var step = e.target.closest('[data-step]');
      if (step) { qtyInput.value = (parseInt(qtyInput.value, 10) || 1) + parseInt(step.dataset.step, 10); refresh(); }
      var t = e.target.closest('.pm-thumbs img');
      if (t) { document.getElementById('pmMainImg').src = t.dataset.src; document.querySelectorAll('.pm-thumbs img').forEach(function (i) { i.classList.toggle('active', i === t); }); }
    });
    qtyInput.addEventListener('input', refresh);
    document.getElementById('pmAdd').addEventListener('click', function () {
      setCartQty(p.id, parseInt(qtyInput.value, 10) || 1);
      hide('productModal'); openCart();
    });
    refresh();
  }

  // ---------- cart drawer ----------
  function renderDrawer() {
    var cart = loadCart();
    var items = document.getElementById('drawerItems');
    var foot = document.getElementById('drawerFoot');
    items.innerHTML = '';
    if (!cart.length) {
      items.appendChild(el('<div class="drawer-empty">Your cart is empty.<br>Add components to get started.</div>'));
      foot.innerHTML = '';
      return;
    }
    cart.forEach(function (l) {
      var p = state.byId[l.id]; if (!p) return;
      var unit = unitPriceFor(p.tiers, l.qty);
      var line = el(
        '<div class="cart-line" data-id="' + p.id + '">' +
          (p.image_main ? '<img src="' + esc(p.image_main) + '" alt="">' : '<div class="ph">' + esc(p.sku) + '</div>') +
          '<div><div class="cl-name">' + esc(p.name) + '</div>' +
            '<div class="cl-meta">' + esc(p.sku) + ' · ' + inr(unit) + '/pc</div>' +
            '<div class="cl-qty"><button data-step="-1">−</button><span>' + l.qty + '</span><button data-step="1">+</button></div>' +
          '</div>' +
          '<div><div class="cl-price">' + inr(unit * l.qty) + '</div><button class="cl-remove" data-remove>Remove</button></div>' +
        '</div>'
      );
      items.appendChild(line);
    });
    var t = cartTotals();
    foot.innerHTML =
      '<div class="row"><span>Subtotal (' + t.count + ' pcs)</span><strong>' + inr(t.subtotal) + '</strong></div>' +
      '<div class="note">Shipping calculated at checkout by pincode.</div>' +
      '<button class="btn btn-primary btn-full" id="checkoutBtn">Proceed to checkout</button>';
    document.getElementById('checkoutBtn').addEventListener('click', openCheckout);
  }

  document.getElementById('drawerItems').addEventListener('click', function (e) {
    var line = e.target.closest('.cart-line'); if (!line) return;
    var id = +line.dataset.id;
    if (e.target.closest('[data-remove]')) { setCartQty(id, 0); renderDrawer(); return; }
    var step = e.target.closest('[data-step]');
    if (step) { setCartQty(id, cartQtyFor(id) + parseInt(step.dataset.step, 10)); renderDrawer(); }
  });

  function openCart() { renderDrawer(); show('cartDrawer'); }

  // ---------- checkout ----------
  function checkoutSummaryHtml(quote) {
    var t = cartTotals();
    var ship = quote ? (quote.free ? 'FREE' : inr(quote.shipping)) : '—';
    var total = quote ? inr(quote.total) : inr(t.subtotal) + ' + shipping';
    var freeHint = quote && !quote.free && quote.free_remaining > 0
      ? '<div class="note" style="color:var(--store-d)">Add ' + inr(quote.free_remaining) + ' more to this zone for free shipping.</div>' : '';
    return '<div class="co-summary">' +
      '<div class="row"><span>Subtotal</span><span>' + inr(t.subtotal) + '</span></div>' +
      '<div class="row"><span>Shipping' + (quote && quote.zone ? ' · ' + esc(quote.zone.name) : '') + '</span><span>' + ship + '</span></div>' +
      '<div class="row total"><span>Total</span><span>' + total + '</span></div>' + freeHint + '</div>';
  }

  function openCheckout() {
    if (!loadCart().length) return;
    hide('cartDrawer');
    var body = document.getElementById('checkoutBody');
    body.innerHTML =
      '<h2 class="co-title">Checkout</h2>' +
      '<p class="muted" style="margin-top:0;font-size:13px">Enter your shipping details. We\'ll calculate shipping from your pincode.</p>' +
      '<div id="coErr"></div>' +
      '<form class="co-form" id="coForm" autocomplete="on">' +
        '<div class="co-grid2"><div><label>Full name</label><input name="name" required></div>' +
          '<div><label>Phone</label><input name="phone" required inputmode="tel"></div></div>' +
        '<label>Email</label><input name="email" type="email" required>' +
        '<label>Address</label><textarea name="address" rows="2" required></textarea>' +
        '<div class="co-grid2"><div><label>City</label><input name="city" required></div>' +
          '<div><label>State</label><input name="state" required></div></div>' +
        '<label>Pincode</label><input name="pincode" inputmode="numeric" maxlength="6" required>' +
        '<div id="coSummary">' + checkoutSummaryHtml(null) + '</div>' +
        '<button class="btn btn-primary btn-full" id="payBtn" type="submit">Calculate shipping &amp; pay</button>' +
      '</form>';
    show('checkoutModal');

    var form = document.getElementById('coForm');
    var lastQuote = null;
    var pin = form.pincode;
    pin.addEventListener('blur', function () { if (/^\d{6}$/.test(pin.value)) refreshQuote(); });

    function refreshQuote() {
      return fetch(api('/api/shipping-quote'), {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pincode: pin.value, cart: loadCart() }),
      }).then(function (r) { return r.json(); }).then(function (q) {
        if (q.error) return;
        lastQuote = q;
        document.getElementById('coSummary').innerHTML = checkoutSummaryHtml(q);
        document.getElementById('payBtn').textContent = 'Pay ' + inr(q.total);
      }).catch(function () {});
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      document.getElementById('coErr').innerHTML = '';
      var customer = {
        name: form.name.value.trim(), email: form.email.value.trim(), phone: form.phone.value.trim(),
        address: form.address.value.trim(), city: form.city.value.trim(), state: form.state.value.trim(),
        pincode: form.pincode.value.trim(),
      };
      if (!/^\d{6}$/.test(customer.pincode)) { showCoErr('Enter a valid 6-digit pincode.'); return; }
      startPayment(customer);
    });
  }

  function showCoErr(msg) { document.getElementById('coErr').innerHTML = '<div class="co-err">' + esc(msg) + '</div>'; }
  function setPaying(on) {
    var b = document.getElementById('payBtn');
    if (!b) return;
    b.disabled = on;
    if (on) b.innerHTML = '<span class="spinner"></span> Processing…';
  }

  function startPayment(customer) {
    setPaying(true);
    fetch(api('/api/create-order'), {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cart: loadCart(), customer: customer }),
    }).then(function (r) { return r.json().then(function (j) { return { ok: r.ok, j: j }; }); })
      .then(function (res) {
        if (!res.ok) { setPaying(false); showCoErr(res.j.error || 'Could not start the order.'); return; }
        var order = res.j;
        if (order.demo || !state.storeConfig.razorpayEnabled) { return demoPay(order); }
        launchRazorpay(order, customer);
      })
      .catch(function () { setPaying(false); showCoErr('Network error. Please try again.'); });
  }

  function launchRazorpay(order, customer) {
    var options = {
      key: order.key_id,
      amount: order.amount,
      currency: order.currency,
      name: state.storeConfig.storeName || 'Silicom Components',
      description: 'Order payment',
      order_id: order.razorpay_order_id,
      prefill: order.prefill,
      theme: { color: '#0d9488' },
      handler: function (resp) { confirmPayment(resp); },
      modal: { ondismiss: function () { setPaying(false); } },
    };
    var rzp = new Razorpay(options);
    rzp.on('payment.failed', function (resp) { setPaying(false); showCoErr('Payment failed: ' + (resp.error && resp.error.description || 'try again')); });
    rzp.open();
  }

  // Demo mode (no Razorpay keys configured) — confirm the order directly for local testing.
  function demoPay(order) { confirmPayment({ razorpay_order_id: order.razorpay_order_id }); }

  function confirmPayment(resp) {
    fetch(api('/api/verify-payment'), {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(resp),
    }).then(function (r) { return r.json().then(function (j) { return { ok: r.ok, j: j }; }); })
      .then(function (res) {
        if (!res.ok || !res.j.ok) { setPaying(false); showCoErr(res.j.error || 'Payment verification failed.'); return; }
        saveCart([]);
        showSuccess(res.j.order_id, resp.razorpay_order_id);
      })
      .catch(function () { setPaying(false); showCoErr('Could not confirm payment. If you were charged, contact us with your payment id.'); });
  }

  function showSuccess(orderId, ref) {
    document.getElementById('checkoutBody').innerHTML =
      '<div class="co-ok"><div class="tick">✓</div>' +
      '<h2 class="co-title">Order placed!</h2>' +
      '<p class="muted">Your order <strong>#' + esc(orderId) + '</strong> is confirmed. A confirmation email is on its way, and our team has been notified to ship your components.</p>' +
      '<button class="btn btn-primary btn-full" style="margin-top:18px" onclick="location.reload()">Continue shopping</button></div>';
    refreshProductsSilently();
  }

  // ---------- modal plumbing ----------
  function show(id) { var m = document.getElementById(id); m.hidden = false; document.body.style.overflow = 'hidden'; }
  function hide(id) { document.getElementById(id).hidden = true; if (!anyOpen()) document.body.style.overflow = ''; }
  function anyOpen() { return ['productModal', 'cartDrawer', 'checkoutModal'].some(function (i) { return !document.getElementById(i).hidden; }); }

  document.addEventListener('click', function (e) {
    if (e.target.closest('[data-close]')) hide('productModal');
    if (e.target.closest('[data-close-cart]')) hide('cartDrawer');
    if (e.target.closest('[data-close-checkout]')) hide('checkoutModal');
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') ['productModal', 'cartDrawer', 'checkoutModal'].forEach(hide); });
  document.getElementById('cartBtn').addEventListener('click', openCart);
  document.getElementById('searchInput').addEventListener('input', function (e) { state.search = e.target.value; renderGrid(); });

  // ---------- boot ----------
  function ingest(products) {
    state.products = products;
    state.byId = {};
    products.forEach(function (p) { state.byId[p.id] = p; });
  }
  function refreshProductsSilently() {
    fetch(api('/api/products')).then(function (r) { return r.json(); }).then(function (d) { ingest(d.products || []); }).catch(function () {});
  }

  fetch(api('/api/config')).then(function (r) { return r.json(); }).then(function (c) { state.storeConfig = c; }).catch(function () {});

  fetch(api('/api/products'))
    .then(function (r) { if (!r.ok) throw new Error('load'); return r.json(); })
    .then(function (d) {
      ingest(d.products || []);
      renderFilters();
      renderGrid();
      updateCartCount();
    })
    .catch(function () {
      document.getElementById('productGrid').innerHTML =
        '<div class="store-empty">The store is being set up. Please check back soon, or <a href="contact.html">contact us</a> to place an order.</div>';
    });

  updateCartCount();
})();
