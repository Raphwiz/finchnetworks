CREATE TABLE IF NOT EXISTS technician_users (customer_id TEXT PRIMARY KEY REFERENCES customers(id));
