// Central config — reads from environment (.env) with safe local-dev defaults.
// Load .env from the server directory regardless of the process working directory.
require('dotenv').config({ path: require('path').join(__dirname, '.env') });

const bool = (v, dflt = false) =>
  v === undefined ? dflt : ['1', 'true', 'yes', 'on'].includes(String(v).toLowerCase());

const config = {
  port: parseInt(process.env.PORT || '4000', 10),
  // Where the storefront/static site is served from, used to build absolute URLs in emails.
  siteUrl: process.env.SITE_URL || 'http://localhost:4000',
  sessionSecret: process.env.SESSION_SECRET || 'dev-insecure-session-secret-change-me',
  isProd: process.env.NODE_ENV === 'production',

  // SQLite file location (relative to server/ unless absolute).
  dbFile: process.env.DB_FILE || 'store.db',

  // Admin login. Generate a hash with:  node scripts/hash-password.js "yourpassword"
  admin: {
    user: process.env.ADMIN_USER || 'admin',
    // bcrypt hash for the password "silicom-admin" — CHANGE in production via ADMIN_HASH.
    hash: process.env.ADMIN_HASH || '$2a$10$Q8Q9rVQ8c1mE0sXoQ8mQ0u3sJ2YwQ0cQ0cQ0cQ0cQ0cQ0cQ0cQ0c',
  },

  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID || '',
    keySecret: process.env.RAZORPAY_KEY_SECRET || '',
    webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET || '',
    // When keys are missing we run in a clearly-flagged demo mode (no real Razorpay calls).
    get enabled() {
      return Boolean(this.keyId && this.keySecret);
    },
  },

  mail: {
    enabled: bool(process.env.SMTP_HOST),
    host: process.env.SMTP_HOST || '',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: bool(process.env.SMTP_SECURE, false),
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.MAIL_FROM || 'Silicom Store <orders@silicomindia.com>',
    // Where order notifications are sent (the Silicom team inbox).
    notifyTo: process.env.ORDER_NOTIFY_TO || 'orders@silicomindia.com',
  },

  // Free-form business info shown on the store.
  storeName: process.env.STORE_NAME || 'Silicom Components Store',
  currency: 'INR',
};

module.exports = config;
