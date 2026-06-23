# Silicom Component Store — backend

Node.js + Express + SQLite backend that powers the online component store: catalog,
self-updating inventory, quantity-break pricing, Razorpay checkout, flat-rate shipping by
pincode zone, and order emails. The storefront (`/store.html`, `/store.css`, `/store.js`) and the
rest of the marketing site are plain static files; this server adds the dynamic `/api` + `/admin`.

## What's where

```
server/
  index.js            Express app (serves /api, /admin; serves static site in dev)
  config.js           Reads server/.env (see .env.example)
  db.js               SQLite (better-sqlite3) + auto-migrates schema.sql, seeds shipping zones
  schema.sql          Tables: products, product_tiers, shipping_zones, orders, order_items
  seed.js             `node seed.js` adds a few demo products
  scripts/hash-password.js   `node scripts/hash-password.js "pw"` -> bcrypt hash for ADMIN_HASH
  lib/                pricing, shipping, razorpay, mailer, auth, store (data access)
  routes/             products, shipping, orders (payments), admin
  views/admin/        EJS admin UI
  uploads/store/      product images uploaded via admin (gitignored)
  store.db            SQLite file (gitignored)
```

## Local development

```bash
cd server
npm install
node seed.js          # optional: demo products
npm start             # http://localhost:4000  (serves the static site too, in dev)
```

- Storefront:  http://localhost:4000/store.html
- Admin:       http://localhost:4000/admin   (default login: `admin` / `silicom-admin`)

With Razorpay/SMTP keys left blank, checkout runs in **demo mode** (no real charge) and order
emails are logged to the console instead of sent — so you can test the whole flow offline.

## Going live on the Hostinger VPS

1. **Upload** the project. Put the static site files in your web root and the `server/` folder
   alongside (or anywhere on the VPS).
2. **Install + configure**
   ```bash
   cd server
   npm ci
   cp .env.example .env      # then edit .env
   node scripts/hash-password.js "your-strong-admin-password"   # paste into ADMIN_HASH
   ```
   Fill `.env` with: `SESSION_SECRET` (long random), Razorpay **live** keys
   (`RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET`), SMTP for `orders@silicomindia.com`, and
   `ORDER_NOTIFY_TO` (where new-order alerts go). Set `NODE_ENV=production`.
3. **Run under PM2** (keeps it alive + restarts on reboot)
   ```bash
   npm i -g pm2
   pm2 start index.js --name silicom-store
   pm2 save && pm2 startup
   ```
4. **Nginx** — serve the static site and reverse-proxy the dynamic paths to Node:
   ```nginx
   server {
     server_name www.silicomindia.com silicomindia.com;
     root /var/www/silicom;          # static HTML/CSS/JS lives here
     index index.html;

     location /api/   { proxy_pass http://127.0.0.1:4000; proxy_set_header Host $host; proxy_set_header X-Forwarded-Proto $scheme; }
     location /admin/ { proxy_pass http://127.0.0.1:4000; proxy_set_header Host $host; proxy_set_header X-Forwarded-Proto $scheme; }
     location /store-uploads/ { proxy_pass http://127.0.0.1:4000; }

     location / { try_files $uri $uri/ =404; }
   }
   ```
   (In production the storefront calls the API on the same domain, so no extra config is needed.
   If you ever host the API on a different domain, set `window.STORE_API_BASE` in `store.html`.)
5. **Razorpay webhook** — in the Razorpay dashboard add a webhook to
   `https://www.silicomindia.com/api/webhook` for the `payment.captured` event, set its secret,
   and copy it into `RAZORPAY_WEBHOOK_SECRET`. This is the safety net that fulfils an order even
   if the buyer closes the tab right after paying.
6. **Email** — create the `orders@silicomindia.com` mailbox in hPanel and use its SMTP settings.

## How the money math stays safe

The browser is never trusted. On every `create-order` and `verify-payment` the server
re-derives unit prices from `product_tiers`, recomputes shipping from `shipping_zones`, and
checks stock. Stock is decremented only after Razorpay's signature is verified, inside a single
SQLite transaction, and the operation is idempotent (the webhook and the browser callback can
both fire without double-charging stock).

## Day-to-day

- **Add/edit products, prices, stock, images** → `/admin` → Products.
- **Shipping zones & free-shipping thresholds** → `/admin` → Shipping.
- **See orders** → `/admin` → Orders.
- Inventory updates itself as paid orders come in; re-stock by editing the product.
