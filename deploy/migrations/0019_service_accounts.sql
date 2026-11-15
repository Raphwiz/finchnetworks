CREATE TABLE service_accounts (
 id TEXT PRIMARY KEY,
 name TEXT NOT NULL,
 phone TEXT NOT NULL,
 address TEXT NOT NULL
);
CREATE TABLE service_work (
 id TEXT PRIMARY KEY,
 account_id TEXT NOT NULL REFERENCES service_accounts(id),
 work_date TEXT NOT NULL,
 location TEXT NOT NULL,
 description TEXT NOT NULL,
 labour INTEGER NOT NULL CHECK(labour >= 0),
 materials INTEGER NOT NULL CHECK(materials >= 0),
 invoice_id TEXT REFERENCES issued_invoices(id)
);
CREATE INDEX service_work_account ON service_work(account_id,work_date);

CREATE TRIGGER claim_service_invoice_work AFTER INSERT ON issued_invoices
WHEN json_type(NEW.data,'$.serviceWorkIds')='array'
BEGIN
 UPDATE service_work SET invoice_id=NEW.id
 WHERE account_id=json_extract(NEW.data,'$.serviceAccountId') AND invoice_id IS NULL
 AND id IN (SELECT value FROM json_each(NEW.data,'$.serviceWorkIds'));
 SELECT CASE WHEN changes()<>json_array_length(NEW.data,'$.serviceWorkIds')
 THEN RAISE(ABORT,'Selected work has already been invoiced. Refresh the account and try again.') END;
END;

CREATE TRIGGER release_void_service_invoice_work AFTER UPDATE OF voided_at ON issued_invoices
WHEN OLD.voided_at IS NULL AND NEW.voided_at IS NOT NULL
BEGIN
 UPDATE service_work SET invoice_id=NULL WHERE invoice_id=NEW.id;
END;
