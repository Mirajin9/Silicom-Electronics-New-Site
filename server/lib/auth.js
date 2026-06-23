// Admin auth: bcrypt password check, session guard, and a simple CSRF token.
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const config = require('../config');

function checkCredentials(user, password) {
  if (user !== config.admin.user) return false;
  if (!config.admin.hash) return false;
  try {
    return bcrypt.compareSync(password, config.admin.hash);
  } catch {
    return false;
  }
}

// Express middleware: allow only logged-in admins, else redirect to login.
function requireAdmin(req, res, next) {
  if (req.session && req.session.admin) return next();
  return res.redirect('/admin/login');
}

// Issue/lookup a per-session CSRF token for mutating admin forms.
function csrfToken(req) {
  if (!req.session.csrf) {
    req.session.csrf = crypto.randomBytes(16).toString('hex');
  }
  return req.session.csrf;
}

function verifyCsrf(req, res, next) {
  const sent = req.body && req.body._csrf;
  if (!sent || sent !== req.session.csrf) {
    return res.status(403).send('Invalid CSRF token. Go back and try again.');
  }
  next();
}

module.exports = { checkCredentials, requireAdmin, csrfToken, verifyCsrf };
