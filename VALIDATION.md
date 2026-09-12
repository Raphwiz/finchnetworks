# Validation record

2026-09-09: Production build and TypeScript checks passed. HTTP checks verified all customer routes (the initial products development reload was retried successfully), anonymous administrator rejection, authenticated administrator access, cross-origin write rejection, negative/fractional/unknown-item rejection, server-side prices ignoring client price tampering, persisted enquiries, saved PDF price snapshots, exact uploaded-image retrieval, project publish/unpublish, and enquiry status updates. Test data remained local only.

The optional WebMCP estimate-staging tool is feature-detected. No supported WebMCP validation context was available; registration and execution were not verified. No broader browser interaction or visual QA was requested or performed. Hero imagery is illustrative, not a completed Finch project. The supplied logo was extracted directly from the PDF.

Production requires the administrator to sign in with the configured Finch email. Enquiries are stored in the dashboard; email notifications and online checkout are not configured. Actual product specifications, prices, project photos and service area must be entered by Finch.

2026-09-10: CCTV builder checks passed for IP versus HD equipment, camera/recorder capacities, 2MP/4MP and audio variants, optional extras, invalid selections, editable prices, server-derived enquiry quantities, saved configuration, PDF price snapshots and unpublished equipment. Test prices restored and verification enquiries removed.

## Commercial flow validation — 12 September 2026

Passed API checks for server-owned order pricing, featured-shop restriction, unavailable stock rejection, duplicate order retry, booking creation and confirmation, admin authorization, draft quote privacy, customer acceptance, stale-revision rejection, accepted quotation edit protection, deposit versus full-payment validation, source order status synchronization, customer review permission and solar-camera image preservation. Test-only records were removed and the original solar product restored. TypeScript and production build passed before final follow-up hardening; final verification follows below.

No browser UI automation was requested or performed. M-Pesa remains deliberately unavailable because the business account does not exist yet; no payment provider calls or live payment tests were performed.

Final verification: TypeScript passed after appointment-time changes; all eight commercial/admin page routes returned HTTP 200; generated migrations applied successfully to an empty SQLite database. The commercial API test suite passed after validation hardening. The final production build passed.
