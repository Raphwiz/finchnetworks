import { sqliteTable,text,integer,index } from 'drizzle-orm/sqlite-core';
export const products=sqliteTable('products',{id:text('id').primaryKey(),data:text('data').notNull()});
export const projects=sqliteTable('projects',{id:text('id').primaryKey(),data:text('data').notNull()});
export const settings=sqliteTable('settings',{id:text('id').primaryKey(),data:text('data').notNull()});
export const enquiries=sqliteTable('enquiries',{id:text('id').primaryKey(),reference:text('reference').notNull(),data:text('data').notNull(),status:text('status').notNull().default('new'),createdAt:integer('created_at').notNull(),rateKey:text('rate_key').notNull()},t=>[index('idx_enquiries_rate_time').on(t.rateKey,t.createdAt)]);
export const commerce=sqliteTable('commerce',{id:text('id').primaryKey(),kind:text('kind').notNull(),data:text('data').notNull(),status:text('status').notNull(),revision:integer('revision').notNull().default(1),createdAt:integer('created_at').notNull(),rateKey:text('rate_key').notNull().default('')},t=>[index('idx_commerce_kind_time').on(t.kind,t.createdAt),index('idx_commerce_rate_time').on(t.rateKey,t.createdAt)]);
