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

