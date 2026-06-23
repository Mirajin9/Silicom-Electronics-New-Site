// Order emails via nodemailer. Falls back to console logging when SMTP is not configured,
// so local development and demos never crash on a missing mail server.
const nodemailer = require('nodemailer');
const config = require('../config');

let transporter = null;
if (config.mail.enabled) {
  transporter = nodemailer.createTransport({
    host: config.mail.host,
    port: config.mail.port,
    secure: config.mail.secure,
    auth: config.mail.user ? { user: config.mail.user, pass: config.mail.pass } : undefined,
  });
}

const inr = (n) => '₹' + Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function itemRows(items) {
  return items
    .map(
      (i) => `<tr>
        <td style="padding:6px 10px;border-bottom:1px solid #eee">${escapeHtml(i.name)} <span style="color:#888">(${escapeHtml(i.sku)})</span></td>
        <td style="padding:6px 10px;border-bottom:1px solid #eee;text-align:center">${i.qty}</td>
        <td style="padding:6px 10px;border-bottom:1px solid #eee;text-align:right">${inr(i.unit_price)}</td>
        <td style="padding:6px 10px;border-bottom:1px solid #eee;text-align:right">${inr(i.line_total)}</td>
      </tr>`
    )
    .join('');
}

function orderHtml(order, items, { heading }) {
  return `<div style="font-family:Arial,Helvetica,sans-serif;max-width:640px;margin:auto;color:#1a1a1a">
    <h2 style="color:#0d9488">${escapeHtml(heading)}</h2>
    <p><strong>Order #${order.id}</strong> · ${escapeHtml(order.razorpay_payment_id || order.razorpay_order_id || '')}</p>
    <table style="border-collapse:collapse;width:100%;font-size:14px">
      <thead><tr style="background:#f4f8fe">
        <th style="padding:8px 10px;text-align:left">Item</th>
        <th style="padding:8px 10px">Qty</th>
        <th style="padding:8px 10px;text-align:right">Unit</th>
        <th style="padding:8px 10px;text-align:right">Total</th>
      </tr></thead>
      <tbody>${itemRows(items)}</tbody>
    </table>
    <table style="margin-top:12px;font-size:14px;float:right">
      <tr><td style="padding:2px 10px;text-align:right">Subtotal</td><td style="padding:2px 10px;text-align:right">${inr(order.subtotal)}</td></tr>
      <tr><td style="padding:2px 10px;text-align:right">Shipping</td><td style="padding:2px 10px;text-align:right">${order.shipping > 0 ? inr(order.shipping) : 'FREE'}</td></tr>
      <tr><td style="padding:2px 10px;text-align:right;font-weight:bold">Total</td><td style="padding:2px 10px;text-align:right;font-weight:bold">${inr(order.total)}</td></tr>
    </table>
    <div style="clear:both"></div>
    <h3 style="margin-top:24px">Ship to</h3>
    <p style="font-size:14px;line-height:1.6">
      ${escapeHtml(order.customer_name)}<br>
      ${escapeHtml(order.address)}<br>
      ${escapeHtml(order.city)}, ${escapeHtml(order.state)} — <strong>${escapeHtml(order.pincode)}</strong><br>
      ${escapeHtml(order.phone)} · ${escapeHtml(order.email)}
    </p>
  </div>`;
}

// Sends both the team notification and the customer confirmation. Resolves even if mail is
// not configured (logs instead) so the checkout flow is never blocked by email.
async function sendOrderEmails(order, items) {
  const teamHtml = orderHtml(order, items, { heading: 'New order placed' });
  const custHtml = orderHtml(order, items, { heading: `Thanks for your order, ${order.customer_name.split(' ')[0] || ''}!` });

  if (!transporter) {
    console.log(`[mailer] SMTP not configured — would notify ${config.mail.notifyTo} of order #${order.id}`);
    return { sent: false };
  }

  await transporter.sendMail({
    from: config.mail.from,
    to: config.mail.notifyTo,
    replyTo: order.email || undefined,
    subject: `New order #${order.id} — ${inr(order.total)}`,
    html: teamHtml,
  });

  if (order.email) {
    await transporter.sendMail({
      from: config.mail.from,
      to: order.email,
      subject: `${config.storeName} — order #${order.id} confirmed`,
      html: custHtml,
    });
  }
  return { sent: true };
}

function escapeHtml(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

module.exports = { sendOrderEmails };
