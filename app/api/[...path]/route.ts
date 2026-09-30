import {handle} from '@/backend/router';
import {config,database} from '@/backend/database';
export const dynamic='force-dynamic';
export const runtime='nodejs';
async function dispatch(req:Request){
 // Production has one configured origin. Never trust a caller's forwarded host.
 const site=config('PUBLIC_SITE_URL');
 if(process.env.NODE_ENV==='production'&&!site)return Response.json({error:'Website configuration is incomplete.'},{status:503});
 const original=new URL(req.url);
 const url=site?new URL(original.pathname+original.search,site):original;
 const normalized=new Request(url,req);
 if(original.pathname==='/api/health'){
  try{await database().prepare('SELECT count(*) FROM admin_users').first();return Response.json({ok:true},{headers:{'Cache-Control':'no-store'}});}catch{return Response.json({ok:false},{status:503});}
 }
 const safaricomCallback=original.pathname==='/api/commerce/mpesa/callback';
 if(req.method==='POST'&&!safaricomCallback&&req.headers.get('origin')!==url.origin)return Response.json({error:'Request origin not allowed.'},{status:403});
 return handle(normalized);
}
export const GET=dispatch;
export const POST=dispatch;
