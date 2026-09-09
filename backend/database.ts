import { env } from 'cloudflare:workers';
export function database(){const db=(env as unknown as {DB:D1Database}).DB;if(!db)throw new Error('Database unavailable');return db;}
export function media(){return (env as unknown as {MEDIA:R2Bucket}).MEDIA;}
export function config(key:string){return String((env as unknown as Record<string,unknown>)[key]||process.env[key]||'');}
