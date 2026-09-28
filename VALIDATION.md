# VPS migration validation

The application now runs on Next.js/Node.js with SQLite and filesystem media instead of the Cloudflare development runtime. Storage tests cover repeated migrations, persistence, transactional rollback, affected-row counts, RETURNING statements, upload path validation and database-plus-media backups.

Deployment configuration includes a non-root application container, private app network, Caddy HTTPS, persistent data volumes, health checks, restart policies, backup timer and an interactive administrator provisioning script. Production API origin checks use PUBLIC_SITE_URL, not untrusted forwarding headers. Administrator access uses authenticated sessions plus an explicit database role; platform headers and email allowlists no longer confer access.

External acceptance still required on the actual VPS: Docker image build/run, DNS, certificate issuance, firewall, reboot/persistence, off-server backups and restoration. Docker is not installed in the local Windows environment. Email delivery and Google sign-in require real business configuration. M-Pesa remains inactive.

## Local results (VPS migration)

- Production Next.js build and TypeScript checks passed.
- Three storage tests passed: repeatable migrations, transaction rollback and backup/media integrity.
- Production HTTP smoke tests passed: key pages and solar image, secure session cookies, administrator role enforcement, forged platform-header denial, cross-origin POST rejection, uploads, authenticated checkout, customer ownership isolation, password-reset single use and session revocation, restart persistence and logout.
- Production dependency audit reported zero known vulnerabilities after updating undici. Four moderate development-tool advisories remain in the Drizzle generation toolchain; it is not shipped in the standalone runtime.
- GitHub workflow added to repeat checks on Node.js 24/Linux and validate the Docker image and Caddy configuration. Its result must be checked separately; no local Docker engine is installed.
