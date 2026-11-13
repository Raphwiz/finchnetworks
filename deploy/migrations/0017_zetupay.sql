CREATE TABLE zetupay_attempts (
 reference TEXT PRIMARY KEY,
 quote_id TEXT NOT NULL REFERENCES commerce(id),
 channel_id TEXT NOT NULL,
 amount INTEGER NOT NULL,
 phone TEXT NOT NULL,
 created_at INTEGER NOT NULL,
 checked_at INTEGER NOT NULL DEFAULT 0,
 payment_key TEXT UNIQUE,
 receipt TEXT UNIQUE,
 state TEXT NOT NULL DEFAULT 'pending'
);
CREATE UNIQUE INDEX zetupay_pending_quote ON zetupay_attempts(quote_id) WHERE state='pending';
CREATE TABLE zetupay_channel_changes (
 id INTEGER PRIMARY KEY,
 channel_id TEXT NOT NULL,
 changed_by TEXT NOT NULL,
 changed_at INTEGER NOT NULL
);
