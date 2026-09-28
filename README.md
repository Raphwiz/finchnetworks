# Finch Networks

A branded company website, product catalogue, completed-job gallery, customer estimate builder and private management area.

## Clear separation

- frontend/: React screens, components, presentation and browser API client. No database credentials or database access.
- backend/: HTTP API handler, administrator authorisation, database access, pricing calculations and PDF generation. Never imported into client components.
- shared/: serialisable data contracts and service catalogue.
- app/: thin page and API adapters required by the framework. The API adapter delegates to backend/router.ts.
- db/: schema definitions and database tooling; drizzle/: generated migrations.
- public/: supplied logo and optimised hero photograph.

The frontend communicates with the backend through /api. They are separate code layers, packaged into one Sites deployment, not two independently deployed servers. Sites uses the React/Vinext framework, Cloudflare D1 for data and R2 for uploaded images. This hosted starter differs from the earlier Next.js/Supabase recommendation; it provides the equivalent core capabilities without creating separate database accounts.

## Local development

npm install
npm run db:local
npm run dev

Apply generated migrations with npm run db:local before using data pages. After schema changes, generate new migrations with npm run db:generate. .env controls the local ADMIN_EMAILS allowlist. Never commit .env. For production, configure ADMIN_EMAILS through Sites runtime settings. Authentication uses ChatGPT sign-in; only explicitly allowlisted email addresses can access admin API operations. Public customer forms require no account after the site is publicly released.

## Business data

Initial catalogue entries are generic product families with no invented specifications, prices or stock claims. Enter actual products and prices through /admin. Completed projects begin empty. Publish only customer-approved photos. Enquiries appear in the dashboard; no automatic email notification service has been configured. WhatsApp is an explicit link the customer chooses to open.

Estimates are calculated from server-owned current catalogue data. Each submitted estimate stores a price snapshot. PDF URLs use random unguessable IDs. Unpriced products and site-dependent services remain marked for confirmation. No taxes or labour charges are invented.

## Validation

Run npm run build and npx tsc --noEmit. Backend checks must cover tampered prices, invalid quantities, anonymous admin access, persistence, PDF output and image uploads. The optional WebMCP configuration tool stages selections only and does not submit customer data.


## Commercial website features

- Shop: device-local draft cart; durable order requests in D1; server-owned prices; featured-only checkout; out-of-stock protection; delivery/collection and installation request.
- Sales admin: order management, booking confirmation, editable draft quotations, private customer quotation links, acceptance, manually verified deposit/full payment records and installation progress. Quotation status updates also update the source order/enquiry.
- Packages and maintenance: editable inclusions, starting prices and frequency. Maintenance requests go to bookings. No recurring billing or scheduled visits are implied until Finch agrees a contract.
- Trust: editable About, collection/delivery, warranty and return information. Only customer-approved reviews are published. Existing project publishing and photos remain available.
- New routes: /cart, /booking, /packages, /maintenance, /about and /quote?id=PRIVATE_REFERENCE.
- The cart is a temporary device-local draft, not a customer account. Orders persist when submitted. Quotation links are private bearer links; share only with the intended customer.

### M-Pesa activation still required

Finch currently has no Till/Paybill. Online payments are intentionally unavailable. `backend/mpesa.ts` is a server-side adapter scaffold for Safaricom OAuth, STK initiation and status query, based on the official Safaricom SDK (https://github.com/safaricom/mpesa-php-sdk/blob/master/src/Mpesa.php). It has no public payment routes and is not a production-ready payment integration. Do not activate solely by setting secrets.

Before activation: obtain a supported business account and Daraja access; securely configure the MPESA_* environment values; implement persistent payment attempts with request locking and idempotency, authenticated/provider-queried reconciliation, amount/account/quote validation, callback handling and retry recovery; test sandbox success, failure, timeout, duplicate requests and callbacks; complete a live acceptance test. Only then expose payment buttons. Never mark a quote paid on the basis of STK initiation or an unverified callback. Until then, staff may record independently verified payments, with receipt reference and cumulative amount.

### Local schema

Generated migration `0001_smiling_the_spike.sql` adds the commerce table and indexes. The existing local database originally lacked matching Wrangler migration history for its already-present initial schema; the new migration was applied directly to that verified local database. Production uses the generated migrations from a clean database. Do not reapply the initial schema over an existing database without first reconciling its migration ledger.

## Optional customer Google accounts

Customers can use /account to sign in, view their own new orders, appointment requests, enquiries and linked non-draft quotations, and sign out. Guest flows remain enabled. Existing guest records are not automatically claimed by matching a phone number or email. Customer sessions do not confer staff permissions.

Google activation requires Finch-owned OAuth credentials. In Google Cloud / Google Auth Platform, configure the consent screen and create a Web application OAuth client. Register the exact redirect URI `http://localhost:3000/api/customer/callback` for local testing and `https://YOUR-DOMAIN/api/customer/callback` for production. Set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET and GOOGLE_REDIRECT_URI securely in the environment, then restart. Do not commit the secret. Add test users if the Google app is in testing mode and complete Google's applicable publishing requirements. Configure only openid, email and profile scopes. Reference: https://developers.google.com/identity/openid-connect/openid-connect

Implementation uses authorization code flow with PKCE, a single-use expiring state bound to an HttpOnly cookie, nonce verification, Google's signed ID token with issuer/audience/expiry validation, Google subject-based identity and seven-day opaque hashed sessions. Logout revokes the current session. Google credentials have not been supplied, so real Google sign-in has not been activated or end-to-end tested.

Checkout policy update: Shop order submission now requires a customer session (HTTP 401 otherwise). Browsing, cart editing, estimate requests and bookings remain open to guests. Google sign-in returns checkout customers to their saved cart. Until Google credentials are configured, checkout is intentionally unavailable. Email/password registration is not implemented.
