import assert from 'node:assert/strict';

import {mkdtempSync,writeFileSync,mkdirSync} from 'node:fs';

import {tmpdir} from 'node:os';

import {join} from 'node:path';

import {execFileSync} from 'node:child_process';

import {PDFDocument} from 'pdf-lib';

import {validateReceipt,amountWords,receiptNotes} from '../shared/receipts';

mkdirSync('work',{recursive:true});

process.env.DATA_DIR=mkdtempSync(join(tmpdir(),'finch-receipts-'));

execFileSync(process.execPath,['scripts/migrate.mjs'],{stdio:'pipe'});

const {database}=await import('../backend/database');const {hashToken}=await import('../backend/customer-session');const {receiptsHandle}=await import('../backend/receipts');const {createWorkReceiptPdf}=await import('../backend/receipt-pdf');

const token='a'.repeat(64),regularToken='b'.repeat(64),db=database();

for(const [id,t] of [['test-admin',token],['test-customer',regularToken]]){await db.prepare('INSERT INTO customers VALUES (?,?,?,?)').bind(id,id+'@example.test','Test',Date.now()).run();await db.prepare('INSERT INTO customer_sessions VALUES (?,?,?)').bind(await hashToken(t),id,Date.now()+3600000).run();}

await db.prepare('INSERT INTO admin_users VALUES (?)').bind('test-admin').run();

const input={id:crypto.randomUUID(),name:'Example Customer',phone:'0700000000',address:'Meru, Kenya',date:'2026-10-30',method:'M-Pesa',paymentReference:'TEST-TRANSACTION',authorizedBy:'Example Administrator',sourceId:'',notes:receiptNotes,lines:[{name:'Indoor access point',quantity:3,unitPrice:6500},{name:'Installation labour',quantity:1,unitPrice:7000}],discount:0,vat:0,paid:27000,previousPaid:0,confirmed:true};

const send=(path:string,body?:any,t=token,origin='https://finch.test')=>receiptsHandle(new Request('https://finch.test/api/admin/receipts'+path,{method:body?'POST':'GET',headers:{cookie:'finch_customer='+t,origin,'content-type':'application/json'},...(body?{body:JSON.stringify(body)}:{})}));

assert.equal((await send('',undefined,''))!.status,403);assert.equal((await send('',input,regularToken))!.status,403);assert.equal((await send('',input,token,'https://evil.test'))!.status,403);

assert.equal(validateReceipt(input).balance,-500);assert.equal(amountWords(27000),'Kenya shillings twenty seven thousand only');assert.equal(validateReceipt({...input,lines:[{name:'Cable',quantity:1.5,unitPrice:1.01}],paid:1.52}).total,1.52);

for(const bad of [{paid:0},{paid:-5},{discount:999999},{date:'2026-02-30'},{lines:[]},{paymentReference:''}])assert.throws(()=>validateReceipt({...input,...bad}));

const preview=await send('/preview',input);assert.equal(preview!.status,200);const previewData=await preview!.json();assert.ok((await PDFDocument.load(Buffer.from(previewData.pdf,'base64'))).getPageCount()>0);assert.equal((await db.prepare('SELECT count(*) n FROM issued_receipts').first<any>()).n,0);

const first=await (await send('',input))!.json();const retry=await (await send('',{...input,name:'Changed'}))!.json();assert.equal(first.reference,retry.reference);assert.equal(retry.name,input.name);

const second=await (await send('',{...input,id:crypto.randomUUID()}))!.json();assert.notEqual(first.reference,second.reference);

assert.equal((await send('/'+first.id+'/pdf',undefined,regularToken))!.status,403);

const pdf=await createWorkReceiptPdf({...validateReceipt(input),sourceReference:'',brand:{phone:'+254707625129',email:'finchnetworkslimited@gmail.com',area:'Meru, Kenya'},reference:'SAMPLE - NOT ISSUED',preview:true});writeFileSync('work/receipt-sample.pdf',pdf);console.log('Sample pages:',(await PDFDocument.load(pdf)).getPageCount());

const long=await createWorkReceiptPdf({...validateReceipt({...input,lines:Array.from({length:40},(_,i)=>({name:'Long service description '+i+' with detailed installation and commissioning requirements '.repeat(2),quantity:1,unitPrice:1000})),notes:'Extended notes '.repeat(100)}),sourceReference:'',brand:{phone:'0700000000',email:'example@example.test',area:'Meru'},reference:'LONG SAMPLE',preview:true});writeFileSync('work/receipt-long-sample.pdf',long);

await send('/'+first.id+'/void',{reason:'Test correction'});const saved=await (await send(''))!.json();assert.equal(saved.receipts.find((r:any)=>r.id===first.id).voidReason,'Test correction');assert.equal(saved.receipts.find((r:any)=>r.id===first.id).paid,27000);

console.log('Passed: access control, CSRF, validation, rounding, credit, preview, retry safety, numbering and void preservation.');

const sendInvoice=(path:string,body?:unknown,t=token,origin='https://finch.test')=>receiptsHandle(
 new Request('https://finch.test/api/admin/invoices'+path,{
  method:body?'POST':'GET',
  headers:{cookie:'finch_customer='+t,origin,'content-type':'application/json'},
  ...(body?{body:JSON.stringify(body)}:{}),
 }),
);
const invoiceInput={
 id:input.id,name:input.name,phone:input.phone,address:input.address,date:input.date,dueDate:'2026-11-13',
 lines:input.lines,discount:500,vat:1000,previousPaid:7000,previousUnpaidBalance:3000,confirmed:true,
};
const sourceId=crypto.randomUUID();
const sourceReference='QUO-INVOICE-TEST';
await db.prepare("INSERT INTO commerce(id,kind,data,status,created_at) VALUES (?,'quote',?,'deposit-paid',?)")
 .bind(sourceId,JSON.stringify({reference:sourceReference}),Date.now()).run();
assert.equal((await sendInvoice('',undefined,regularToken))!.status,403);
assert.equal((await sendInvoice('',invoiceInput,token,'https://evil.test'))!.status,403);
await assert.rejects(sendInvoice('',{...invoiceInput,dueDate:'2026-10-29'}),/due date/);
await assert.rejects(sendInvoice('',{...invoiceInput,confirmed:false}),/Confirm/);
const invoicePreview=await (await sendInvoice('/preview',invoiceInput))!.json();
assert.ok((await PDFDocument.load(Buffer.from(invoicePreview.pdf,'base64'))).getPageCount()>0);
assert.deepEqual((await (await sendInvoice(''))!.json()).invoices,[]);

const [issuedInvoice,retriedInvoice]=await Promise.all(
 [invoiceInput,invoiceInput].map(async draft=>(await sendInvoice('',{...draft,sourceId}))!.json()),
);
assert.equal(issuedInvoice.reference,'FN-INV-000001');
assert.deepEqual(retriedInvoice,issuedInvoice);
assert.equal(issuedInvoice.total,27000);
assert.equal(issuedInvoice.balance,23000);
assert.equal(issuedInvoice.previousUnpaidBalance,3000);
assert.equal(issuedInvoice.sourceReference,sourceReference);
assert.equal(issuedInvoice.paid,undefined);
assert.equal((await sendInvoice('/'+issuedInvoice.id+'/pdf',undefined,regularToken))!.status,403);
const invoicePdf=await sendInvoice('/'+issuedInvoice.id+'/pdf');
assert.equal(invoicePdf!.headers.get('content-type'),'application/pdf');
const invoiceBytes=await invoicePdf!.arrayBuffer();
assert.equal((await PDFDocument.load(invoiceBytes)).getTitle(),issuedInvoice.reference);
writeFileSync('work/invoice-sample.pdf',Buffer.from(invoiceBytes));

await sendInvoice('/'+issuedInvoice.id+'/void',{reason:'Test correction'});
const invoiceRegister=await (await sendInvoice('?q=fn-inv-000001'))!.json();
assert.equal(invoiceRegister.invoices.length,1);
assert.equal(invoiceRegister.invoices[0].voidReason,'Test correction');
assert.equal(invoiceRegister.invoices[0].balance,23000);
assert.equal((await (await send('?q='+first.reference))!.json()).receipts[0].paid,27000);
console.log('Passed: invoice access, due dates, preview, numbering, concurrent retry, download and register.');
