import {database} from './database';
import {isAdmin} from './auth';
import {currentCustomer} from './customer-session';
import {settings} from './catalog';
import {validateInvoice,validateReceipt,invoiceReference,receiptReference} from '../shared/receipts';
import {createInvoicePdf,createWorkReceiptPdf} from './receipt-pdf';
import {pdfResponse} from './pdf';

const json=(value:unknown,status=200)=>Response.json(value,{status,headers:{'Cache-Control':'private, no-store'}});

export async function receiptsHandle(req:Request):Promise<Response|null>{
 const url=new URL(req.url);
 const route=url.pathname.match(/^\/api\/admin\/(receipts|invoices)(?:\/(.+))?$/);
 if(!route)return null;
 if(!await isAdmin(req))return json({error:'Administrator access is required.'},403);
 if(req.method==='POST'&&req.headers.get('origin')!==url.origin)return json({error:'Request origin not allowed.'},403);

 const [,collection,action='']=route;
 const invoice=collection==='invoices';
 const table=invoice?'issued_invoices':'issued_receipts';
 const kind=invoice?'invoice':'receipt';
 const reference=invoice?invoiceReference:receiptReference;
 const createPdf=invoice?createInvoicePdf:createWorkReceiptPdf;
 const db=database();

 if(req.method==='GET'&&!action){
  const query=url.searchParams.get('q')?.trim().slice(0,150)||'';
  const rows=await db.prepare(`SELECT * FROM ${table}
   WHERE ?='' OR instr(lower(data),lower(?))>0 OR instr(printf(?,number),upper(?))>0
   ORDER BY number DESC LIMIT 200`).bind(query,query,invoice?'FN-INV-%06d':'FN-RCP-%06d',query).all<any>();
  return json({[collection]:rows.results.map(row=>({
   ...JSON.parse(row.data),reference:reference(row.number),createdAt:row.created_at,voidReason:row.void_reason,
  }))});
 }

 const record=action.match(/^([a-f0-9-]{36})\/(pdf|void)$/);
 if(record){
  const [,id,operation]=record;
  const row=await db.prepare(`SELECT * FROM ${table} WHERE id=?`).bind(id).first<any>();
  if(!row)return json({error:invoice?'Invoice not found.':'Receipt not found.'},404);
  if(req.method==='GET'&&operation==='pdf'){
   const number=reference(row.number);
   const bytes=await createPdf({...JSON.parse(row.data),reference:number,voidReason:row.void_reason});
   return pdfResponse(bytes,`${number}.pdf`);
  }
  if(req.method==='POST'&&operation==='void'){
   const body=await req.json();
   if(typeof body?.reason!=='string'||!body.reason.trim()||body.reason.length>500)
    throw Error(`Enter a reason for voiding this ${kind}.`);
   const user=await currentCustomer(req);
   await db.prepare(`UPDATE ${table} SET void_reason=?,voided_at=?,voided_by=? WHERE id=? AND voided_at IS NULL`)
    .bind(body.reason.trim(),Date.now(),user!.id,id).run();
   return json({ok:true});
  }
 }

 if(req.method==='POST'&&(!action||action==='preview')){
  if(Number(req.headers.get('content-length'))>50000)return json({error:`The ${kind} is too large.`},413);
  const body=await req.json();
  const validated=invoice?validateInvoice(body):validateReceipt(body);
  let sourceReference='';
  if(validated.sourceId){
   const source=await db.prepare("SELECT data FROM commerce WHERE id=? AND kind IN ('quote','order')")
    .bind(validated.sourceId).first<{data:string}>();
   if(!source)throw Error('Linked quotation or order was not found.');
   sourceReference=JSON.parse(source.data).reference||'';
  }

  const {phone,email,area}=await settings();
  const data={...validated,sourceReference,brand:{phone,email,area}};
  if(action==='preview'){
   const metadata={reference:'PREVIEW - NOT ISSUED',preview:true};
   const bytes='dueDate' in data
    ? await createInvoicePdf({...data,...metadata})
    : await createWorkReceiptPdf({...data,...metadata});
   return json({pdf:Buffer.from(bytes).toString('base64')});
  }
  if(body.confirmed!==true)
   throw Error(invoice?'Confirm that the invoice details are correct.':'Confirm that Finch has received this payment.');

  const user=await currentCustomer(req);
  // The client keeps the same ID when retrying issuance.
  await db.prepare(`INSERT INTO ${table} (id,data,created_at,issued_by) VALUES (?,?,?,?) ON CONFLICT(id) DO NOTHING`)
   .bind(data.id,JSON.stringify(data),Date.now(),user!.id).run();
  const row=await db.prepare(`SELECT number,data FROM ${table} WHERE id=?`)
   .bind(data.id).first<{number:number;data:string}>();
  return json({...JSON.parse(row!.data),reference:reference(row!.number)},201);
 }
 return json({error:'Not found'},404);
}
