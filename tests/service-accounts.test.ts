import './receipts.test';
import assert from 'node:assert/strict';
import {handle} from '../backend/router';
import {PDFDocument} from 'pdf-lib';

const origin='https://finch.test';
const send=(path:string,body?:object,admin=true)=>handle(new Request(origin+'/api/admin/'+path,{
 method:body?'POST':'GET',headers:{origin,...(admin?{cookie:'finch_customer='+'a'.repeat(64)}:{})},
 ...(body?{body:JSON.stringify(body)}:{}),
}));
const root='service-accounts';
const account=crypto.randomUUID(),other=crypto.randomUUID(),job=crypto.randomUUID();
assert.equal((await send(root,undefined,false)).status,403);
for(const id of [account,other])assert.equal((await send(root,{id,name:'Test School <North>'})).status,201);
const path=root+'/'+account;
const work={id:job,date:'2026-11-15',location:'ICT lab',description:'Repair CCTV',labour:'3000',materials:'1500'};
assert.equal((await send(path+'/work',work)).status,201);
assert.equal((await send(path+'/work',work)).status,201);
const summary=await (await send(path+'/summary')).text();
assert.match(summary,/4,500.00/);
assert.match(summary,/Test School &lt;North&gt;/);
assert.doesNotMatch(await (await send(path+'/summary?from=2026-11-16')).text(),/Repair CCTV/);
const invoice={id:crypto.randomUUID(),date:'2026-11-15',dueDate:'2026-12-15',workIds:[job],confirmed:true};
assert.equal((await send(root+'/'+other+'/invoice',invoice)).status,400);
const preview=await send(path+'/preview',invoice);
assert.equal(preview.status,200);
assert.equal((await PDFDocument.load(await preview.arrayBuffer())).getPageCount(),1);
const attempts=await Promise.all([send(path+'/invoice',invoice),send(path+'/invoice',{...invoice,id:crypto.randomUUID()})]);
assert.deepEqual(attempts.map(r=>r.status).sort(),[201,400]);
const issued=await attempts.find(r=>r.ok)!.json();
const listed=await (await send(path)).json();
assert.equal(listed.work.length,1);
assert.equal(listed.work[0].invoice,issued.reference);
assert.doesNotMatch(await (await send(path+'/summary')).text(),/Repair CCTV/);
assert.equal((await send('invoices/'+issued.id+'/pdf')).status,200);
assert.equal((await send('invoices/'+issued.id+'/void',{reason:'Test replacement'})).status,200);
assert.match(await (await send(path+'/summary')).text(),/Repair CCTV/);
assert.equal((await send(path+'/invoice',{...invoice,id:crypto.randomUUID()})).status,201);
console.log('PASS: service account access, work retries, printable summary, invoice preview, duplicate billing protection and void replacement.');
