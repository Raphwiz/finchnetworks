import {database} from './database';
export const random=()=>Array.from(crypto.getRandomValues(new Uint8Array(32))).map(x=>x.toString(16).padStart(2,'0')).join('');
export async function hashToken(s:string){return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s)))).map(x=>x.toString(16).padStart(2,'0')).join('');}
export function cookie(req:Request,key:string){return (req.headers.get('cookie')||'').split(';').map(x=>x.trim()).find(x=>x.startsWith(key+'='))?.slice(key.length+1)||'';}
export function setCookie(req:Request,key:string,value:string,seconds:number){return `${key}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${seconds}${new URL(req.url).protocol==='https:'?'; Secure':''}`;}
export async function currentCustomer(req:Request){const token=cookie(req,'finch_customer');if(!/^[a-f0-9]{64}$/.test(token))return null;return database().prepare('SELECT c.id,c.name,c.email FROM customer_sessions s JOIN customers c ON c.id=s.customer_id WHERE s.hash=? AND s.expires_at>?').bind(await hashToken(token),Date.now()).first<{id:string;name:string;email:string}>();}
