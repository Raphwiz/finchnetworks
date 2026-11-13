CREATE TABLE IF NOT EXISTS issued_invoices (
 number INTEGER PRIMARY KEY AUTOINCREMENT,
 id TEXT NOT NULL UNIQUE,
 data TEXT NOT NULL,
 created_at INTEGER NOT NULL,
 issued_by TEXT NOT NULL,
 void_reason TEXT,
 voided_at INTEGER,
 voided_by TEXT
);
