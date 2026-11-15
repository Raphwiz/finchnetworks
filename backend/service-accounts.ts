import {isAdmin} from './auth';
import {settings} from './catalog';
import {currentCustomer} from './customer-session';
import {database} from './database';
import {createInvoicePdf} from './receipt-pdf';
import {pdfResponse} from './pdf';
import {invoiceReference,validateInvoice} from '../shared/receipts';

const json=(data:unknown,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'private, no-store'}});
type Account={id:string;name:string;phone:string;address:string};
type Work={id:string;work_date:string;location:string;description:string;labour:number;materials:number;invoice_number:number|null};
const uuid=(value:unknown)=>{
 if(typeof value!=='string'||!/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/.test(value))throw Error('Invalid service reference.');
 return value;
};
function field(value:unknown,max:number,required=false){
 if(typeof value!=='string'||value.trim().length>max||(required&&!value.trim()))throw Error('Check the name, location and work details.');
 return value.trim().replace(/\s+/g,' ');
}
function cents(value:unknown){
 if((typeof value!=='string'&&typeof value!=='number')||String(value).trim()===''||!/^\d+(\.\d{1,2})?$/.test(String(value))||Number(value)>100000000)
  throw Error('Enter a valid charge in KES, with up to two decimal places.');
 return Math.round(Number(value)*100);
}

export async function serviceAccountsHandle(req:Request):Promise<Response|null>{
 const url=new URL(req.url);
 const route=url.pathname.match(/^\/api\/admin\/service-accounts(?:\/([^/]+)(?:\/(work|summary|preview|invoice))?)?$/);
 if(!route)return null;
 if(!await isAdmin(req))return json({error:'Administrator access is required.'},403);
 if(req.method==='POST'&&Number(req.headers.get('content-length'))>50000)return json({error:'Request too large.'},413);
 if(req.method==='POST'&&req.headers.get('origin')!==url.origin)return json({error:'Request origin not allowed.'},403);
 const [,accountId,action]=route;
 const db=database();
 if(req.method==='GET'&&!accountId){
  const result=await db.prepare('SELECT * FROM service_accounts ORDER BY name,id').all<Account>();
  return json({accounts:result.results});
 }
 if(req.method==='POST'&&!accountId){
  const body=await req.json();
  const account={id:uuid(body.id),name:field(body.name,100,true),phone:field(body.phone??'',40),address:field(body.address??'',200)};
  await db.prepare('INSERT INTO service_accounts(id,name,phone,address) VALUES (?,?,?,?) ON CONFLICT(id) DO NOTHING')
   .bind(account.id,account.name,account.phone,account.address).run();
  return json({id:account.id},201);
 }
 if(!accountId)return json({error:'Not found.'},404);
 const account=await db.prepare('SELECT * FROM service_accounts WHERE id=?').bind(uuid(accountId)).first<Account>();
 if(!account)return json({error:'Service account not found.'},404);

 if(req.method==='POST'&&action==='work'){
  const body=await req.json();
  const date=field(body.date,10,true);
  if(!/^\d{4}-\d\d-\d\d$/.test(date)||!Number.isFinite(Date.parse(date))||new Date(date).toISOString().slice(0,10)!==date)
   throw Error('Choose a valid work date.');
  const labour=cents(body.labour),materials=cents(body.materials);
  if(labour+materials===0)throw Error('Enter a labour or materials charge.');
  await db.prepare('INSERT INTO service_work(id,account_id,work_date,location,description,labour,materials) VALUES (?,?,?,?,?,?,?) ON CONFLICT(id) DO NOTHING')
   .bind(uuid(body.id),account.id,date,field(body.location??'',50),field(body.description,137,true),labour,materials).run();
  return json({ok:true},201);
 }

 const workSql=`SELECT w.*,i.number invoice_number FROM service_work w
  LEFT JOIN issued_invoices i ON i.id=w.invoice_id WHERE account_id=?`;
 if(req.method==='GET'&&!action){
  const {results}=await db.prepare(workSql+' ORDER BY work_date DESC,w.rowid DESC').bind(account.id).all<Work>();
  return json({account,work:results.map(row=>({...row,invoice:row.invoice_number?invoiceReference(row.invoice_number):null}))});
 }

 if(req.method==='GET'&&action==='summary'){
  const from=url.searchParams.get('from')||'0000-01-01';
  const to=url.searchParams.get('to')||'9999-12-31';
  const {results}=await db.prepare(workSql+' AND w.invoice_id IS NULL AND work_date BETWEEN ? AND ? ORDER BY work_date,w.rowid')
   .bind(account.id,from,to).all<Work>();
  const escape=(value:string)=>value.replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]!));
  const money=(value:number)=>(value/100).toLocaleString('en-KE',{minimumFractionDigits:2,maximumFractionDigits:2});
  const rows=results.map(row=>`<tr><td>${escape(row.work_date)}</td><td>${escape(row.location)}</td><td>${escape(row.description)}</td><td>${money(row.labour)}</td><td>${money(row.materials)}</td><td>${money(row.labour+row.materials)}</td></tr>`).join('');
  return new Response(`<!doctype html><html lang="en"><meta charset="utf-8"><title>Finch unbilled work summary</title>
   <style>body{font:15px system-ui;margin:2rem;color:#173642}table{border-collapse:collapse;width:100%}td,th{padding:.6rem;border-bottom:1px solid #aab8bf;text-align:left}thead{background:#e7f2f2}tr{break-inside:avoid}@media print{body{margin:0}.screen{display:none}}</style>
   <h1>Finch Networks Ltd</h1><h2>Unbilled work summary</h2><p>${escape(account.name)} · ${escape(account.address)}</p>
   <p class="screen">Use your browser’s Print command to print or save as PDF.</p>
   <table><thead><tr><th>Date</th><th>Location</th><th>Work done</th><th>Labour (KES)</th><th>Materials (KES)</th><th>Total (KES)</th></tr></thead><tbody>${rows}</tbody></table>
   <p><strong>Unbilled total: KES ${money(results.reduce((sum,row)=>sum+row.labour+row.materials,0))}</strong></p></html>`,
   {headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'private, no-store','Content-Security-Policy':"default-src 'none'; style-src 'unsafe-inline'"}});
 }
 if(req.method==='POST'&&(action==='invoice'||action==='preview')){
  const body=await req.json();
  const id=uuid(body.id);
  const existing=await db.prepare('SELECT number,data FROM issued_invoices WHERE id=?').bind(id).first<{number:number;data:string}>();
  if(existing){
   if(action==='invoice'&&JSON.parse(existing.data).serviceAccountId===account.id)
    return json({id,reference:invoiceReference(existing.number)},201);
   throw Error('Start a new invoice draft.');
  }
  if(action==='invoice'&&body.confirmed!==true)throw Error('Confirm the invoice details before issuing.');
  if(!Array.isArray(body.workIds)||!body.workIds.length||body.workIds.length>40)throw Error('Select between 1 and 40 jobs.');
  const ids=[...new Set<string>(body.workIds.map(uuid))];
  const {results}=await db.prepare(workSql+" AND w.invoice_id IS NULL AND w.id IN (SELECT value FROM json_each(?)) ORDER BY work_date,w.rowid")
   .bind(account.id,JSON.stringify(ids)).all<Work>();
  if(results.length!==ids.length)throw Error('Selected work has already been invoiced or is unavailable.');
  const lines=results.map(row=>({
   name:[row.work_date,row.location,row.description].filter(Boolean).join(' | '),quantity:1,unitPrice:(row.labour+row.materials)/100,
  }));
  const invoice=validateInvoice({...account,id,date:body.date,dueDate:body.dueDate,lines,discount:0,vat:0,previousPaid:0,notes:body.notes??''});
  const {phone,email,area}=await settings();
  const data={...invoice,sourceReference:'',brand:{phone,email,area},serviceWorkIds:ids,serviceAccountId:account.id};
  if(action==='preview')return pdfResponse(await createInvoicePdf({...data,reference:'PREVIEW - NOT ISSUED',preview:true}),'service-invoice-preview.pdf');
  const user=await currentCustomer(req);
  await db.prepare('INSERT INTO issued_invoices(id,data,created_at,issued_by) VALUES (?,?,?,?) ON CONFLICT(id) DO NOTHING')
   .bind(id,JSON.stringify(data),Date.now(),user!.id).run();
  const row=await db.prepare('SELECT number,data FROM issued_invoices WHERE id=?').bind(id).first<{number:number;data:string}>();
  if(!row||JSON.parse(row.data).serviceAccountId!==account.id)throw Error('Start a new invoice draft.');
  return json({id,reference:invoiceReference(row.number)},201);
 }
 return json({error:'Not found.'},404);
}
