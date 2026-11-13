import './receipts.test';
import assert from 'node:assert/strict';
import {createHmac} from 'node:crypto';
import {commerceHandle} from '../backend/commerce';
import {database} from '../backend/database';

process.env.ZETUPAY_SECRET_KEY='fake-test-key';
process.env.ZETUPAY_STK_ENABLED='true';
const db=database();
const origin='https://finch.test';
const channels=[
 {id:'1001',name:'Finch',type:'paybill',active:true,paybillNumber:'880100',accountNumber:'089754'},
 {id:'1002',name:'Finch Till',type:'till',active:true,tillNumber:'123456'},
];
const payments=new Map<string,Record<string,unknown>>();
let mismatch=false;
const realFetch=globalThis.fetch;
globalThis.fetch=async(input,init)=>{
 const url=new URL(String(input));
 assert.equal(url.origin,'https://pay.zetupay.co.ke');
 const path=url.pathname.slice('/api/v1/'.length);
 let data:unknown;
 if(path==='collection-channels')data=channels;
 else if(path.startsWith('collection-channels/'))data=channels.find(channel=>channel.id===path.split('/').at(-1));
 else if(path==='payment/stk-push'){
  const body=JSON.parse(String(init?.body));
  assert.equal(new Headers(init?.headers).get('Idempotency-Key'),body.reference);
  if(!payments.has(body.reference))payments.set(body.reference,{...body,paymentKey:body.reference,status:'pending'});
  data=payments.get(body.reference);
 }else if(path.startsWith('payment/stk-push/')){
  data=payments.get(path.split('/').at(-1)!);
  if(mismatch)data={...(data as object),channelId:'9999'};
 }
 assert.ok(data);
 return Response.json({success:true,data});
};
const send=(path:string,body?:object,admin=false)=>commerceHandle(new Request(origin+'/api/commerce/'+path,{
 method:body?'POST':'GET',headers:{origin,...(admin?{cookie:'finch_customer='+'a'.repeat(64)}:{})},
 ...(body?{body:JSON.stringify(body)}:{}),
}));
function callback(reference:string,signed=true){
 const body=JSON.stringify({status:'success',reference});
 const t=Math.floor(Date.now()/1000);
 const sig=createHmac('sha256',process.env.ZETUPAY_SECRET_KEY!).update(t+'.'+body).digest('hex');
 return commerceHandle(new Request(origin+'/api/commerce/zetupay/callback',{
  method:'POST',body,headers:{'x-zetupay-signature':signed?`t=${t},v1=${sig}`:''},
 }));
}
try{
 const quoteId=crypto.randomUUID();
 await db.prepare("INSERT INTO commerce(id,kind,data,status,created_at) VALUES (?,'quote',?,'accepted',?)")
  .bind(quoteId,JSON.stringify({reference:'QUO-ZETUPAY',total:1500,deposit:500,phone:'0700000000'}),Date.now()).run();
 assert.equal((await send('admin/zetupay'))!.status,403);
 assert.equal((await send('quote/stk',{id:quoteId}))!.status,503);
 assert.equal((await send('admin/zetupay',{channelId:'1001',confirmed:true},true))!.status,200);
 const responses=await Promise.all([send('quote/stk',{id:quoteId}),send('quote/stk',{id:quoteId})]);
 assert.ok(responses.every(response=>response?.ok));
 assert.equal(payments.size,1);
 const [deposit]=payments.values();
 assert.equal(deposit.amount,500);
 assert.equal(deposit.channelId,'1001');
 assert.equal((await send('admin/zetupay',{channelId:'1002',confirmed:true},true))!.status,200);
 deposit.status='success';
 deposit.receiptNumber='TESTDEP123';
 const reference=String(deposit.reference);
 assert.equal((await callback(reference,false))!.status,401);
 mismatch=true;
 assert.equal((await callback(reference))!.status,503);
 mismatch=false;
 const callbacks=await Promise.all([callback(reference),callback(reference)]);
 assert.ok(callbacks.every(response=>response?.ok));
 const paidDeposit=await (await send('quote/'+quoteId))!.json();
 assert.equal(paidDeposit.status,'deposit-paid');
 assert.equal(paidDeposit.payment.amount,500);
 assert.ok((await send('quote/stk',{id:quoteId}))?.ok);
 const balance=[...payments.values()][1];
 assert.equal(balance.amount,1000);
 assert.equal(balance.channelId,'1002');
 balance.status='success';
 balance.receiptNumber='TESTBAL123';
 const paid=await (await send('quote/'+quoteId))!.json();
 assert.equal(paid.status,'paid');
 assert.equal(paid.payment.amount,1500);
 const orderId=crypto.randomUUID();
 const shopQuoteId=crypto.randomUUID();
 await db.prepare("INSERT INTO commerce(id,kind,data,status,created_at,customer_id) VALUES (?,'order',?,'accepted',?,'test-admin')")
  .bind(orderId,JSON.stringify({reference:'ORD-ZETUPAY',phone:'0700000000'}),Date.now()).run();
 await db.prepare("INSERT INTO commerce(id,kind,data,status,created_at) VALUES (?,'quote',?,'accepted',?)")
  .bind(shopQuoteId,JSON.stringify({sourceId:orderId,reference:'QUO-SHOP',total:1700,deposit:0,phone:'0700000000'}),Date.now()).run();
 assert.equal((await send('stk',{id:orderId}))!.status,401);
 const shopOrder=await (await send('order/'+orderId,undefined,true))!.json();
 assert.equal(shopOrder.stkReady,true);
 assert.equal(shopOrder.amountDue,1700);
 const shopPrompts=await Promise.all([send('stk',{id:orderId},true),send('quote/stk',{id:shopQuoteId})]);
 assert.ok(shopPrompts.every(response=>response?.ok));
 assert.equal(payments.size,3);
 const shopPayment=[...payments.values()][2];
 assert.equal(shopPayment.amount,1700);
 const pendingOrder=await (await send('order/'+orderId,undefined,true))!.json();
 assert.equal(pendingOrder.stkSent.amount,1700);
 shopPayment.status='success';
 shopPayment.receiptNumber='TESTSHOP123';
 await db.prepare('UPDATE zetupay_attempts SET checked_at=0 WHERE quote_id=?').bind(shopQuoteId).run();
 const paidOrder=await (await send('order/'+orderId,undefined,true))!.json();
 assert.equal(paidOrder.status,'paid');
 assert.equal(paidOrder.quote.payment.amount,1700);
 const item='direct-test-stock';
 await db.prepare('INSERT INTO products(id,data) VALUES (?,?)')
  .bind(item,JSON.stringify({id:item,name:'Test equipment',unit:'unit',published:true,featured:true,price:700,stockQuantity:2})).run();
 const stock=async()=>Number((await db.prepare("SELECT json_extract(data,'$.stockQuantity') n FROM products WHERE id=?").bind(item).first<{n:number}>())?.n);
 const checkout={id:crypto.randomUUID(),name:'Test buyer',phone:'0700000000',location:'Meru',consent:true,fulfilment:'collection',items:[{id:item,quantity:2}]};
 assert.equal((await send('order',checkout,true))!.status,201);
 assert.equal((await send('stk',{id:checkout.id},true))!.status,200);
 assert.equal(await stock(),2);
 const second={...checkout,id:crypto.randomUUID()};
 assert.equal((await send('order',second,true))!.status,201);
 await assert.rejects(()=>send('stk',{id:second.id},true),/stock or price changed/i);
 const directPayment=[...payments.values()].at(-1)!;
 assert.equal(directPayment.amount,1400);
 directPayment.status='success';
 directPayment.receiptNumber='TESTDIRECT123';
 const directCallbacks=await Promise.all([callback(String(directPayment.reference)),callback(String(directPayment.reference))]);
 assert.ok(directCallbacks.every(response=>response?.ok));
 assert.equal(await stock(),0);
 const directOrder=await (await send('order/'+checkout.id,undefined,true))!.json();
 assert.equal(directOrder.status,'paid');
 assert.equal(directOrder.payment.amount,1400);
 assert.equal((await send('shop-receipt/'+checkout.id,undefined,true))!.headers.get('content-type'),'application/pdf');

 const approved=await (await send('admin/quote',{
  name:'Test buyer',phone:'0700000000',lines:[{name:'Installation',quantity:1,unitPrice:1000}],
  expires:'2099-01-01',terms:'Test terms',status:'quoted',
 },true))!.json();
 assert.equal(approved.deposit,800);
 assert.equal((await send('accept',{id:approved.id,revision:approved.revision,name:'Test buyer',accept:true}))!.status,200);
 assert.equal((await send('quote/stk',{id:approved.id}))!.status,200);
 const workDeposit=[...payments.values()].at(-1)!;
 assert.equal(workDeposit.amount,800);
 workDeposit.status='success';
 workDeposit.receiptNumber='TESTWORK123';
 assert.equal((await callback(String(workDeposit.reference)))!.status,200);
 const work=await (await send('quote/'+approved.id))!.json();
 assert.equal(work.status,'deposit-paid');
 assert.match(work.workStartDate,/^\d{4}-\d{2}-\d{2}$/);
 assert.equal(work.amountDue,null);
 assert.equal((await send('admin/status',{id:approved.id,revision:work.revision,status:'completed'},true))!.status,200);
 assert.equal((await (await send('quote/'+approved.id))!.json()).amountDue,200);
 console.log('PASS: direct shop checkout, stock holds, atomic deduction, receipts, 80% deposit and completion balance.');
 console.log('PASS: shop ownership, shared attempt, in-page reconciliation and paid order.');
 console.log('PASS: admin access, prompt idempotency, channel switch, signed callback, mismatch rejection, deposit and balance.');
}finally{globalThis.fetch=realFetch;}
