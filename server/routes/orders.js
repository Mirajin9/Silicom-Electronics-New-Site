// Checkout: create a Razorpay order, verify payment, fulfil (decrement stock + email).
// The server is authoritative — it recomputes all prices, shipping and stock here.
const express = require('express');
const router = express.Router();
const config = require('../config');
const store = require('../lib/store');
const db = require('../db');
const { priceCart, money } = require('../lib/pricing');
const { quoteShipping } = require('../lib/shipping');
const razor = require('../lib/razorpay');
const { sendOrderEmails } = require('../lib/mailer');

const insertOrder = db.prepare(`
  INSERT INTO orders (razorpay_order_id, status, subtotal, shipping, total,
                      customer_name, email, phone, address, city, state, pincode)
  VALUES (@razorpay_order_id, 'created', @subtotal, @shipping, @total,
          @customer_name, @email, @phone, @address, @city, @state, @pincode)`);
const insertItem = db.prepare(`
  INSERT INTO order_items (order_id, product_id, sku, name, qty, unit_price, line_total)
  VALUES (@order_id, @product_id, @sku, @name, @qty, @unit_price, @line_total)`);

const persistOrder = db.transaction((orderRow, items) => {
  const info = insertOrder.run(orderRow);
  const orderId = info.lastInsertRowid;
  for (const it of items) insertItem.run({ order_id: orderId, ...it });
  return orderId;
});

function validateCustomer(c) {
  const required = ['name', 'email', 'phone', 'address', 'city', 'state', 'pincode'];
  for (const f of required) {
    if (!c || !String(c[f] || '').trim()) {
      const err = new Error(`Missing field: ${f}`);
      err.status = 400;
      throw err;
    }
  }
  if (!/^\S+@\S+\.\S+$/.test(c.email)) {
    const err = new Error('Invalid email address');
    err.status = 400;
    throw err;
  }
  if (!/^\d{6}$/.test(String(c.pincode))) {
    const err = new Error('Invalid 6-digit pincode');
    err.status = 400;
    throw err;
  }
}

// POST /api/create-order { cart:[{id,qty}], customer:{...} }
router.post('/create-order', async (req, res, next) => {
  try {
    const { cart, customer } = req.body || {};
    validateCustomer(customer);

    const priced = priceCart(cart, store.getProductForPricing);
    const ship = quoteShipping(store.listZones(), customer.pincode, priced.subtotal);
    const total = money(priced.subtotal + ship.shipping);
    if (total <= 0) {
      const err = new Error('Order total must be greater than zero');
      err.status = 400;
      throw err;
    }

    // Create the Razorpay order (amount in paise). In demo mode (no keys) use a local id.
    let rzpOrderId;
    if (config.razorpay.enabled) {
      const rzpOrder = await razor.client.orders.create({
        amount: Math.round(total * 100),
        currency: config.currency,
        receipt: `sil_${Date.now()}`,
        notes: { customer_email: customer.email, pincode: customer.pincode },
      });
      rzpOrderId = rzpOrder.id;
    } else {
      rzpOrderId = `demo_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    }

    const orderRow = {
      razorpay_order_id: rzpOrderId,
      subtotal: priced.subtotal,
      shipping: ship.shipping,
      total,
      customer_name: customer.name.trim(),
      email: customer.email.trim(),
      phone: customer.phone.trim(),
      address: customer.address.trim(),
      city: customer.city.trim(),
      state: customer.state.trim(),
      pincode: String(customer.pincode).trim(),
    };
    const dbOrderId = persistOrder(orderRow, priced.items);

    res.json({
      ok: true,
      demo: !config.razorpay.enabled,
      db_order_id: dbOrderId,
      razorpay_order_id: rzpOrderId,
      key_id: config.razorpay.keyId || null,
      amount: Math.round(total * 100),
      currency: config.currency,
      subtotal: priced.subtotal,
      shipping: ship.shipping,
      total,
      zone: ship.zone,
      prefill: { name: orderRow.customer_name, email: orderRow.email, contact: orderRow.phone },
    });
  } catch (err) {
    next(err);
  }
});

// Atomic fulfilment: decrement stock + mark paid. Idempotent — only the first caller
// (verify-payment OR webhook) transitions created -> paid and returns firstTime.
const fulfillTxn = db.transaction((rzpOrderId, paymentId) => {
  const order = db.prepare('SELECT * FROM orders WHERE razorpay_order_id = ?').get(rzpOrderId);
  if (!order) {
    const e = new Error('Order not found');
    e.status = 404;
    throw e;
  }
  if (order.status === 'paid') return { order, items: [], firstTime: false };

  const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(order.id);
  for (const it of items) {
    if (!it.product_id) continue;
    const prod = db.prepare('SELECT stock, name FROM products WHERE id = ?').get(it.product_id);
    if (prod && prod.stock < it.qty) {
      const e = new Error(`Insufficient stock for ${prod.name}`);
      e.status = 409;
      e.oversold = true;
      throw e;
    }
    db.prepare(`UPDATE products SET stock = stock - ?, updated_at = datetime('now') WHERE id = ?`)
      .run(it.qty, it.product_id);
  }
  db.prepare(`UPDATE orders SET status = 'paid', razorpay_payment_id = ? WHERE id = ?`)
    .run(paymentId, order.id);
  return { order: { ...order, status: 'paid', razorpay_payment_id: paymentId }, items, firstTime: true };
});

async function fulfill(rzpOrderId, paymentId) {
  let result;
  try {
    result = fulfillTxn(rzpOrderId, paymentId);
  } catch (e) {
    if (e.oversold) {
      db.prepare(`UPDATE orders SET status = 'failed' WHERE razorpay_order_id = ?`).run(rzpOrderId);
    }
    throw e;
  }
  if (result.firstTime) {
    try {
      await sendOrderEmails(result.order, result.items);
      db.prepare('UPDATE orders SET notify_sent = 1 WHERE id = ?').run(result.order.id);
    } catch (mailErr) {
      console.error('[orders] email failed (order still paid):', mailErr.message);
    }
  }
  return result;
}

// POST /api/verify-payment { razorpay_order_id, razorpay_payment_id, razorpay_signature }
router.post('/verify-payment', async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body || {};
    if (!razorpay_order_id) return res.status(400).json({ error: 'Missing order id' });

    if (config.razorpay.enabled) {
      const valid = razor.verifyPaymentSignature({
        order_id: razorpay_order_id,
        payment_id: razorpay_payment_id,
        signature: razorpay_signature,
      });
      if (!valid) return res.status(400).json({ error: 'Payment signature verification failed' });
    } else if (!String(razorpay_order_id).startsWith('demo_')) {
      return res.status(400).json({ error: 'Payments are not configured' });
    }

    const result = await fulfill(razorpay_order_id, razorpay_payment_id || 'demo_pay');
    res.json({ ok: true, order_id: result.order.id, status: 'paid' });
  } catch (err) {
    next(err);
  }
});

// POST /api/webhook — Razorpay server-to-server backstop (payment.captured).
// Mounted with express.raw in index.js so we can verify the signature on the raw body.
router.post('/webhook', async (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const raw = req.body; // Buffer (express.raw)
    if (!razor.verifyWebhookSignature(raw, signature)) {
      return res.status(400).json({ error: 'Invalid webhook signature' });
    }
    const event = JSON.parse(raw.toString('utf8'));
    if (event.event === 'payment.captured' || event.event === 'order.paid') {
      const payment = event.payload.payment.entity;
      await fulfill(payment.order_id, payment.id).catch((e) => console.error('[webhook] fulfil:', e.message));
    }
    res.json({ ok: true });
  } catch (err) {
    console.error('[webhook] error:', err.message);
    res.status(200).json({ ok: true }); // ack so Razorpay doesn't hammer retries on our parse bugs
  }
});

module.exports = router;
