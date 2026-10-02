# UV — considered menswear

Custom storefront for **UV**, replacing the previous Shopify shop at uvclo.com.

## What this is

A production-ready men's clothing store:

- Editorial storefront (home, shop, product, cart, checkout)
- Guest checkout
- Optional customer accounts and order history
- Admin desk for products, inventory, and orders
- **Razorpay** payments with server-side order creation and signature verification

Products always come from the database. Prices are never trusted from the browser.

## Local / preview

The app starts on its own in this workspace. No extra setup is required to browse the catalogue, cart, and admin UI.

## Environment

Do not commit secrets. Configure these on Vercel (or your host) for production:

| Name | Where | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | server | Postgres. Injected automatically on this platform. |
| `RAZORPAY_KEY_ID` | server | Razorpay key id. Safe to also expose as a public key to Checkout.js — the server is the source of truth. |
| `RAZORPAY_KEY_SECRET` | server | Razorpay secret. **Never** put this in client code. |

Auth credentials are injected by the platform. Email/password, Google, and X sign-in are enabled.

If Razorpay keys are missing, checkout explains that payments are not configured. It does **not** fake a successful payment.

## Payment flow

1. Customer bag → shipping form
2. Server validates products, sizes, colours, and **current database prices / stock**
3. Server creates a pending UV order and a Razorpay order
4. Browser opens Razorpay Checkout with the server-issued order id
5. Razorpay returns `razorpayOrderId`, `razorpayPaymentId`, `razorpaySignature`
6. Server verifies the HMAC signature with the Razorpay secret
7. Only then is the order marked paid, stock decremented, and confirmation shown

## Admin

`/admin` is signed-in only. The **first** account that signs in is promoted to store admin. Later accounts are customers.

From the desk you can add/edit/unpublish products, manage multiple images, sizes, colours, stock, and fulfilment status.

## Images

Sample product photography lives in `public/products/`. Admin can attach public image URLs or upload a compressed JPEG. For a large catalogue, point URLs at object storage / a CDN (S3, Vercel Blob, Cloudinary) rather than storing large binaries in Postgres.

## Vercel

This app is a TanStack Start project. Deploy on Vercel with the platform's project settings. Set the Razorpay env vars on the Vercel project.

### Custom domain (uvclo.com)

1. In Vercel → Project → Domains, add `uvclo.com` and `www.uvclo.com`
2. At your DNS host, add the records Vercel shows (usually A / CNAME)
3. Set the primary domain to `uvclo.com` and redirect `www`

## Stack notes

The original Replit project was Express + Vite + Drizzle + Supabase Auth. This storefront keeps that **product**, schema, Razorpay contracts, and editorial UI, running as a single Vercel-compatible app with Postgres (Neon in production, embedded Postgres in preview) and Better Auth.
