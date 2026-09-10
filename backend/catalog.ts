import {cctvProducts} from '@/shared/cctv';
import {defaultSettings,initialProducts,type Product,type Project,type Settings} from '@/shared/models';
import {database} from './database';
export async function products(all=false):Promise<Product[]>{const rows=await database().prepare('SELECT data FROM products').all<{data:string}>();const map=new Map([...initialProducts,...cctvProducts].map(p=>[p.id,p]));for(const r of rows.results) {const p=JSON.parse(r.data);map.set(p.id,p);}return [...map.values()].map(p=>({...p,featured:p.featured??['solar-cctv','starlink'].includes(p.id)})).filter(p=>all||p.published);}
export async function projects(all=false):Promise<Project[]>{const rows=await database().prepare('SELECT data FROM projects ORDER BY rowid DESC').all<{data:string}>();return rows.results.map(r=>JSON.parse(r.data)).filter(p=>all||p.published);}
export async function settings():Promise<Settings>{const row=await database().prepare("SELECT data FROM settings WHERE id='business'").first<{data:string}>();return {...defaultSettings,...(row?JSON.parse(row.data):{})};}

