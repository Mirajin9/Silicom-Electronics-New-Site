// Silicom component store — Express entry point.
const path = require('path');
const express = require('express');
const session = require('express-session');
const helmet = require('helmet');
const config = require('./config');

require('./db'); // initialise + migrate the database on boot

const app = express();
app.set('trust proxy', 1);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Razorpay Checkout script + images need a relaxed CSP; keep other protections from helmet.
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);

// Raw body is needed for webhook signature verification, so capture it before JSON parsing.
app.use('/api/webhook', express.raw({ type: '*/*' }));
app.use(express.json({ limit: '256kb' }));
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure: config.isProd,
      maxAge: 1000 * 60 * 60 * 8, // 8h admin session
    },
  })
);

// Uploaded product images.
app.use('/store-uploads', express.static(path.join(__dirname, 'uploads', 'store'), { maxAge: '7d' }));

// Routes
app.use('/api', require('./routes/products'));
app.use('/api', require('./routes/shipping'));
app.use('/api', require('./routes/orders'));
app.use('/admin', require('./routes/admin'));

// Expose the Razorpay publishable key + config to the storefront.
app.get('/api/config', (req, res) => {
  res.json({
    storeName: config.storeName,
    currency: config.currency,
    razorpayKeyId: config.razorpay.keyId || null,
    razorpayEnabled: config.razorpay.enabled,
  });
});

app.get('/api/health', (req, res) => res.json({ ok: true }));

// In local/dev convenience: serve the static site (the project root) so store.html works
// without a separate web server. In production Nginx serves the static files and proxies /api.
if (!config.isProd) {
  app.use(express.static(path.join(__dirname, '..')));
}

// Basic error handler — returns JSON for API routes.
app.use((err, req, res, next) => {
  console.error(err);
  const status = err.status || 500;
  if (req.path.startsWith('/api')) {
    return res.status(status).json({ error: err.message || 'Server error' });
  }
  res.status(status).send(err.message || 'Server error');
});

app.listen(config.port, () => {
  console.log(`Silicom store server on http://localhost:${config.port}`);
  if (!config.razorpay.enabled) console.log('  ⚠ Razorpay keys not set — checkout runs in demo mode.');
  if (!config.mail.enabled) console.log('  ⚠ SMTP not set — order emails will be logged, not sent.');
});
