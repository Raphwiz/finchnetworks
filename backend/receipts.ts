import {database} from './database';
import {isAdmin} from './auth';
import {currentCustomer} from './customer-session';
import {settings} from './catalog';
import {validateReceipt,receiptReference} from '../shared/receipts';
import {createWorkReceiptPdf} from './receipt-pdf';
import {pdfResponse} from './pdf';
const json=(v:unknown,s=200)=>Response.json(v,{status:s,headers:{'Cache-Control':'private, no-store'}});
export async function receiptsHandle(req:Request):Promise<Response|null>{
 const path=new URL(req.url).pathname.replace('/api/','');if(path!=='admin/receipts'&&!path.startsWith('admin/receipts/'))return null;
 if(!await isAdmin(req))return json({error:'Administrator access is required.'},403);
 if(req.method==='POST'&&req.headers.get('origin')!==new URL(req.url).origin)return json({error:'Request origin not allowed.'},403);
 if(req.method==='GET'&&path==='admin/receipts'){
 const query=new URL(req.url).searchParams.get('q')?.trim().slice(0,150)||'';
 const rows=await database().prepare("SELECT * FROM issued_receipts WHERE ?='' OR instr(lower(data),lower(?))>0 OR instr(printf('FN-RCP-%06d',number),upper(?))>0 ORDER BY number DESC LIMIT 200").bind(query,query,query).all<any>();
 return json({receipts:rows.results.map(r=>({...JSON.parse(r.data),reference:receiptReference(r.number),createdAt:r.created_at,voidReason:r.void_reason}))});}
 const match=path.match(/^admin\/receipts\/([a-f0-9-]{36})\/(pdf|void)$/);
 if(match){const row=await database().prepare('SELECT * FROM issued_receipts WHERE id=?').bind(match[1]).first<any>();if(!row)return json({error:'Receipt not found.'},404);
 if(req.method==='GET'&&match[2]==='pdf')return pdfResponse(await createWorkReceiptPdf({...JSON.parse(row.data),reference:receiptReference(row.number),voidReason:row.void_reason}),`${receiptReference(row.number)}.pdf`);
 if(req.method==='POST'&&match[2]==='void'){const b=await req.json();if(typeof b.reason!=='string'||!b.reason.trim()||b.reason.length>500)throw Error('Enter a reason for voiding this receipt.');const user=await currentCustomer(req);await database().prepare('UPDATE issued_receipts SET void_reason=?,voided_at=?,voided_by=? WHERE id=? AND voided_at IS NULL').bind(b.reason.trim(),Date.now(),user!.id,match[1]).run();return json({ok:true});}}
 if(req.method==='POST'&&(path==='admin/receipts'||path==='admin/receipts/preview')){
 if(Number(req.headers.get('content-length'))>50000)return json({error:'Receipt too large.'},413);
 const body=await req.json();const validated=validateReceipt(body);let sourceReference='';
 if(validated.sourceId){const source=await database().prepare("SELECT data FROM commerce WHERE id=? AND kind IN ('quote','order')").bind(validated.sourceId).first<any>();if(!source)throw Error('Linked quotation or order was not found.');sourceReference=JSON.parse(source.data).reference||'';}
 const brand=await settings();const data={...validated,sourceReference,brand:{phone:brand.phone,email:brand.email,area:brand.area}};
 if(path.endsWith('/preview')){const bytes=await createWorkReceiptPdf({...data,reference:'PREVIEW - NOT ISSUED',preview:true});return json({pdf:Buffer.from(bytes).toString('base64')});}
 if(body.confirmed!==true)throw Error('Confirm that Finch has received this payment.');
 const user=await currentCustomer(req);
 // The client retains its unique ID across retries, so a repeated click cannot issue a second receipt.
 await database().prepare('INSERT INTO issued_receipts (id,data,created_at,issued_by) VALUES (?,?,?,?) ON CONFLICT(id) DO NOTHING').bind(data.id,JSON.stringify(data),Date.now(),user!.id).run();
 const row=await database().prepare('SELECT number,data FROM issued_receipts WHERE id=?').bind(data.id).first<any>();return json({...JSON.parse(row.data),reference:receiptReference(row.number)},201);
 }
 return json({error:'Not found'},404);
}
