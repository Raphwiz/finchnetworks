CREATE TABLE admin_users (customer_id TEXT PRIMARY KEY REFERENCES customers(id) ON DELETE CASCADE);

