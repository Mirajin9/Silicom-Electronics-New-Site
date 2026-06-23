// Razorpay client + signature verification helpers.
const crypto = require('crypto');
const Razorpay = require('razorpay');
const config = require('../config');

let client = null;
if (config.razorpay.enabled) {
  client = new Razorpay({
    key_id: config.razorpay.keyId,
    key_secret: config.razorpay.keySecret,
  });
}

// Verify the signature Razorpay Checkout returns to the browser after payment.
// signature should equal HMAC_SHA256(order_id + "|" + payment_id, key_secret).
function verifyPaymentSignature({ order_id, payment_id, signature }) {
  if (!config.razorpay.keySecret) return false;
  const expected = crypto
    .createHmac('sha256', config.razorpay.keySecret)
    .update(`${order_id}|${payment_id}`)
    .digest('hex');
  return safeEqual(expected, signature);
}

// Verify a webhook payload using the webhook secret.
function verifyWebhookSignature(rawBody, signature) {
  if (!config.razorpay.webhookSecret) return false;
  const expected = crypto
    .createHmac('sha256', config.razorpay.webhookSecret)
    .update(rawBody)
    .digest('hex');
  return safeEqual(expected, signature);
}

function safeEqual(a, b) {
  const ba = Buffer.from(String(a));
  const bb = Buffer.from(String(b));
  if (ba.length !== bb.length) return false;
  return crypto.timingSafeEqual(ba, bb);
}

module.exports = { client, verifyPaymentSignature, verifyWebhookSignature };
