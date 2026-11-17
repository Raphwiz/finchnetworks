CREATE TABLE IF NOT EXISTS cctv_reports (
 id TEXT PRIMARY KEY,
 customer TEXT NOT NULL,
 site TEXT NOT NULL,
 inspection_date TEXT NOT NULL,
 issued_at INTEGER NOT NULL,
 data TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS cctv_reports_issued ON cctv_reports(issued_at DESC, id DESC);
