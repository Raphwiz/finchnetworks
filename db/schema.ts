import { sqliteTable,text,integer,index } from 'drizzle-orm/sqlite-core';
export const products=sqliteTable('products',{id:text('id').primaryKey(),data:text('data').notNull()});
export const projects=sqliteTable('projects',{id:text('id').primaryKey(),data:text('data').notNull()});
export const settings=sqliteTable('settings',{id:text('id').primaryKey(),data:text('data').notNull()});
export const enquiries=sqliteTable('enquiries',{customerId:text('customer_id'),id:text('id').primaryKey(),reference:text('reference').notNull(),data:text('data').notNull(),status:text('status').notNull().default('new'),createdAt:integer('created_at').notNull(),rateKey:text('rate_key').notNull()},t=>[index('idx_enquiries_customer').on(t.customerId),index('idx_enquiries_rate_time').on(t.rateKey,t.createdAt)]);
export const commerce=sqliteTable('commerce',{customerId:text('customer_id'),id:text('id').primaryKey(),kind:text('kind').notNull(),data:text('data').notNull(),status:text('status').notNull(),revision:integer('revision').notNull().default(1),createdAt:integer('created_at').notNull(),rateKey:text('rate_key').notNull().default('')},t=>[index('idx_commerce_customer').on(t.customerId),index('idx_commerce_kind_time').on(t.kind,t.createdAt),index('idx_commerce_rate_time').on(t.rateKey,t.createdAt)]);

export const customers=sqliteTable('customers',{id:text('id').primaryKey(),email:text('email').notNull(),name:text('name').notNull(),createdAt:integer('created_at').notNull()});
export const customerSessions=sqliteTable('customer_sessions',{hash:text('hash').primaryKey(),customerId:text('customer_id').notNull(),expiresAt:integer('expires_at').notNull()},t=>[index('idx_customer_sessions_expiry').on(t.expiresAt)]);
export const oauthFlows=sqliteTable('oauth_flows',{hash:text('hash').primaryKey(),nonce:text('nonce').notNull(),verifier:text('verifier').notNull(),expiresAt:integer('expires_at').notNull()},t=>[index('idx_oauth_flows_expiry').on(t.expiresAt)]);
