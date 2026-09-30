# Finch Networks: Contabo deployment

Target: Ubuntu 24.04 LTS, Docker Engine with Compose plugin, one VPS. Domain: finchnetworksltd.com. The app is a Node.js/Next.js service with SQLite and uploads in a persistent Docker volume. The frontend and backend remain separate source folders. No Cloudflare Workers, D1, R2 or hosting-platform sign-in is required. Cloudflare remains the domain/DNS provider.

## 1. Prepare the server

Install Docker Engine and the Compose plugin using https://docs.docker.com/engine/install/ubuntu/. Keep SSH available before enabling a firewall; permit TCP 22 (or your configured SSH port), 80 and 443 only. Do not publish port 3000 or a database port. Docker-published ports can bypass UFW; this configuration publishes only Caddy's 80/443.

Clone the release branch into `/opt/finchnetworks`:

```sh
sudo mkdir -p /opt/finchnetworks
sudo chown "$USER":"$USER" /opt/finchnetworks
git clone --branch finch-website-rebuild https://github.com/Raphwiz/finchnetworks.git /opt/finchnetworks
cd /opt/finchnetworks
cp .env.example .env.production
chmod 600 .env.production
```

Set `PUBLIC_SITE_URL=https://finchnetworksltd.com`. Keep secrets only in `.env.production`. Docker supplies `DATA_DIR=/data`. Do not set a different production data directory.

## 2. Connect the domain

In Cloudflare DNS, create an A record for `@` pointing to the VPS IPv4 address, and a CNAME for `www` pointing to `finchnetworksltd.com`. Start with both **DNS only** (grey cloud). Remove conflicting old A/AAAA records; add an AAAA only if IPv6 is configured on the VPS. Do not change mail/MX records.

Caddy obtains and renews HTTPS certificates when DNS resolves correctly and ports 80/443 are reachable. Its configuration redirects www to the main domain. If enabling Cloudflare proxy later, use **Full (strict)** TLS. Never use Flexible. Caddy trusts CF-Connecting-IP only from the published Cloudflare IPv4/IPv6 ranges and overwrites the application client-IP header with the validated address. Direct clients cannot spoof this header. The static ranges in deploy/Caddyfile were verified on 2026-09-29; compare them periodically with https://www.cloudflare.com/ips-v4 and https://www.cloudflare.com/ips-v6 and validate/reload Caddy after any update. Enable proxying for @ and www with Full (strict) TLS. Leave caching at its default; do not enable Cache Everything for account, admin, API, cart, quotation or tracking pages. The origin still accepts direct connections; this setup does not claim to prevent all bypass of Cloudflare.

## 3. Build, start and create your administrator

```sh
docker compose up -d --build
docker compose ps
docker compose logs --tail=100 app caddy
docker compose exec app node scripts/create-admin.mjs Finchnetworksltd@gmail.com
```

The administrator command asks for a password twice without displaying it. It creates the owner directly, so email delivery is not needed for this first server-managed account. Never put the password in shell arguments, GitHub or chat. It refuses to overwrite an existing account. Sign in at `https://finchnetworksltd.com/account?next=admin`. Use My Account to sign out. Public registration never grants administrator access, even if an email matches the owner's address.

If an email account already exists, verify that it belongs to the intended administrator, then grant its exact `customer_id` in the `admin_users` table through a controlled database maintenance session. Do not automatically grant by an unverified email or HTTP header.

Check `https://finchnetworksltd.com/api/health`, then test Shop, estimates, a booking and an admin image upload. Restart the app and verify that saved data and the upload persist. The first startup applies migrations transactionally; later startups skip applied migrations. Do not import an old SQLite file over this database without reconciling its migration ledger.

## 4. Activate customer emails

Verify a sending domain in Resend, add its required DNS records in Cloudflare, and set `RESEND_API_KEY` and `AUTH_EMAIL_FROM` to your verified sender. Do not invent a working mailbox: set up business email separately if you want to receive mail at that address. Then run `docker compose up -d --force-recreate app` and test password reset with a real mailbox. Customers can sign in before Resend is configured. Creating an email account needs the 6-digit code sent to that address, so new email registration stays unavailable until sending is configured. Until it is configured, password-reset emails stay disabled, and new estimates, orders and site visits are not emailed to the business address saved in Settings. Once it is configured, each of those requests emails that inbox with the reference and a link. Signed-in customers are also emailed when the status of their shop order, estimate, quotation or site visit changes. The server-created administrator can sign in either way.

Google is optional: set its three environment values and register the exact callback `https://finchnetworksltd.com/api/customer/callback`. M-Pesa is not active; adding environment keys alone does not activate payment support.

## 5. Backups and recovery

```sh
docker compose exec -T app node scripts/backup.mjs
sudo cp deploy/finch-backup.service deploy/finch-backup.timer /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now finch-backup.timer
```

Backups contain a SQLite online snapshot and uploaded images under `/backups/<timestamp>` in the backup volume. The timer assumes `/opt/finchnetworks`. Uploads are immutable, so copying them after the SQLite snapshot preserves referenced files. Backups contain customer information: keep them private. Copy backups off the VPS regularly, for example `docker compose cp app:/backups ./private-backups` followed by transfer to protected external storage. The daily job does not implement remote storage or retention: monitor disk space and retain an appropriate set after checking the off-server copies. A Contabo snapshot is additional protection, not the only backup.

Recovery: stop writes by stopping the app, preserve the existing data volume, and use a temporary maintenance container with that volume mounted to restore `finch.sqlite` and the corresponding `uploads/` from the same backup. Restore into an empty directory so stale SQLite WAL/SHM files cannot be replayed. Start the matching application version, check database integrity, then test sign-in and uploaded images. Rehearse restoration before launch.

Never run `docker compose down -v`: that removes persistent volumes. Normal rebuilds and `docker compose down` keep data.

## Updates and rollback

Make a backup, record `git rev-parse HEAD`, then `git pull --ff-only origin finch-website-rebuild` and `docker compose up -d --build`. Check health and key flows. To roll back code, check out the previous recorded commit and rebuild; if a migration is incompatible, restore its matching pre-upgrade data backup as well. Keep only one app replica writing to this SQLite volume. Revisit the database architecture if traffic or multi-server requirements grow.

## Existing local content

The source includes service artwork, the solar camera and Starlink images, the five saved product edits and public business settings. First-start seeding inserts missing records only and is tracked in the migration ledger. Local customer records, sessions, test data and secrets are deliberately excluded. No completed projects were present to migrate. Review the seeded prices before launch.
