# Finch Networks Ltd

Finch's service website, CCTV estimate builder, featured-product shop, bookings, customer accounts and administration dashboard.

## Structure

- `frontend/`: React screens and browser API client.
- `backend/`: authenticated API handlers, server-owned prices, SQLite database, file storage and PDF generation.
- `shared/`: serialisable models and service definitions.
- `app/`: thin Next.js page/API adapters.
- `drizzle/` and `deploy/migrations/`: ordered SQL migrations.
- `scripts/`: migrations, administrator provisioning and backups.

## Local development

Use Node.js 24 LTS (or a supported version from package.json).

```sh
npm ci
npm run db:migrate
npm run dev
```

Local data is stored in ignored `data/`. Set `PUBLIC_SITE_URL=http://localhost:3000` for local authentication if configuring an environment file. Do not use the live domain origin while testing localhost. Create a local administrator with `npm run admin:create -- owner@example.com`; the password is entered privately in the terminal. Sign in through `/admin`. The administrator account cannot sign in on My Account. Public accounts never acquire admin privileges automatically.

## Deploy to Contabo

Follow [DEPLOYMENT.md](DEPLOYMENT.md). The Docker deployment uses Node.js 24, Caddy HTTPS, persistent SQLite/uploads, transactional startup migrations, a health check and restart policies. The source remains on branch `finch-website-rebuild`. The live domain is `finchnetworksltd.com`.

The previous Cloudflare Workers/D1/R2 runtime and platform-specific administrator authentication have been replaced. The project runs independently on a VPS. Source bundles contain no customer database, secrets or sessions. The deployment seed preserves the five saved product edits, current public business settings and product images. First-start seeding never overwrites existing dashboard edits. Customer records and sessions are excluded.

## Accounts and integrations

Shop checkout requires a customer account. Estimates and appointments remain open to guests. Email/password signup creates the account immediately and signs the customer in. Passwords use salted scrypt. Reset tokens expire, are single-use and revoke sessions on password change. Email/password and Google identities remain separate. Request ownership is set from the server session; old guest records are not attached by matching email or phone.

Configure a verified Resend sender and the environment values in `.env.example` to enable password-reset emails. Google sign-in is optional. Neither real email delivery nor Google sign-in can be launch-tested until Finch configures those services. Customers can still create accounts and sign in before that. The owner can provision the first administrator locally without email delivery.

WhatsApp notifications are owner-reviewed messages opened in WhatsApp; they are not automatically sent. M-Pesa is an inactive adapter scaffold: it still needs the business account, durable payment attempts, verified reconciliation, callbacks and sandbox/live acceptance tests. Setting keys does not enable payments.

Review actual prices, service areas, delivery, warranty and return terms in the dashboard before launch. Never publish customer photos without permission.

## Checks

```sh
npm run test:vps
npx tsc --noEmit
npm run build
```

See [VALIDATION.md](VALIDATION.md) for results and remaining external checks.
