import {createHmac,timingSafeEqual} from 'node:crypto';
import {config,database} from './database';

type Channel={id:string;name:string;type:string;active:boolean;paybillNumber?:string;tillNumber?:string;bankName?:string;bankCode?:string;accountNumber?:string};
type Payment={paymentKey:string;reference:string;channelId:string;currency:string;amount:number;phoneNumber:string;status:string;receiptNumber?:string};
export type Attempt={reference:string;quote_id:string;channel_id:string;amount:number;phone:string;created_at:number;payment_key:string|null;state:string};
export const zetupayConfigured=()=>!!config('ZETUPAY_SECRET_KEY');
export const zetupayEnabled=()=>zetupayConfigured()&&config('ZETUPAY_STK_ENABLED')==='true';

async function request<T>(path:string,body?:object,key?:string){
 const secret=config('ZETUPAY_SECRET_KEY');
 if(!secret)throw Error('Configure the ZetuPay secret on the server first.');
 const response=await fetch('https://pay.zetupay.co.ke/api/v1/'+path,{
  method:body?'POST':'GET',redirect:'error',signal:AbortSignal.timeout(12000),
  headers:{Authorization:'Bearer '+secret,...(body?{'Content-Type':'application/json'}:{}),...(key?{'Idempotency-Key':key}:{})},
  ...(body?{body:JSON.stringify(body)}:{}),
 });
 const result=await response.json();
 if(!response.ok||result.success!==true)throw Error('ZetuPay could not complete the request. Check the merchant setup and try again.');
 return {data:result.data as T,pages:Number(result.pagination?.totalPages)||1};
}

export async function activeChannel(){
 const row=await database().prepare('SELECT channel_id FROM zetupay_channel_changes ORDER BY id DESC LIMIT 1').first<{channel_id:string}>();
 return row?.channel_id||'';
}

function channelDetails(channel:Channel){
 const {name,type,paybillNumber,tillNumber,bankName,bankCode,accountNumber}=channel;
 const displayAccount=type==='bank'&&accountNumber
  ? '••••'+(accountNumber.length>4?accountNumber.slice(-4):'')
  : accountNumber;
 return {id:String(channel.id),name,type,paybillNumber,tillNumber,bankName,bankCode,accountNumber:displayAccount};
}

export async function listChannels(){
 const channels=[];
 for(let page=1;page<=100;page++){
  const result=await request<Channel[]>('collection-channels?active=true&pageSize=100&page='+page);
  channels.push(...result.data.filter(channel=>channel.active===true&&['paybill','till','bank'].includes(channel.type)).map(channelDetails));
  if(page>=result.pages)break;
 }
 return channels;
}

export async function listBanks(){
 const {data}=await request<{code:string;name:string}[]>('banks');
 return data.map(({code,name})=>({code,name}));
}

export async function registerChannel(body:Record<string,unknown>){
 const {type,confirmed}=body;
 if(confirmed!==true||!['paybill','till','bank'].includes(String(type)))throw Error('Confirm the new collection destination.');
 const field=(name:string,pattern:RegExp)=>{
  const value=body[name];
  if(typeof value!=='string'||!pattern.test(value.trim()))throw Error('Check the collection account details.');
  return value.trim();
 };
 const digits=/^\d{4,12}$/;
 const account=/^[a-z0-9]{1,30}$/i;
 const details=type==='till'?{type,tillNumber:field('tillNumber',digits)}
  :type==='paybill'?{type,paybillNumber:field('paybillNumber',digits),accountNumber:field('accountNumber',account)}
  :{type,bankCode:field('bankCode',/^[a-z0-9_-]{1,30}$/i),accountNumber:field('accountNumber',account)};
 const {data}=await request<Channel>('collection-channels',{name:'Finch Networks Ltd',...details});
 if(data.active!==true||!/^\d{1,30}$/.test(String(data.id))||
  !Object.entries(details).every(([key,value])=>data[key as keyof Channel]===value))
  throw Error('ZetuPay did not confirm the submitted collection destination.');
 return channelDetails(data);
}

export async function selectChannel(id:unknown,confirmed:unknown,adminId:string){
 if(confirmed!==true||typeof id!=='string'||!/^\d{1,30}$/.test(id))throw Error('Choose and confirm a collection destination.');
 const {data}=await request<Channel>('collection-channels/'+id);
 if(data.active!==true||String(data.id)!==id||!['paybill','till','bank'].includes(data.type))
  throw Error('Choose an active PayBill, Till or bank account from ZetuPay.');
 await database().prepare('INSERT INTO zetupay_channel_changes(channel_id,changed_by,changed_at) VALUES (?,?,?)')
  .bind(id,adminId,Date.now()).run();
}

export async function latestAttempt(quoteId:string){
 return database().prepare('SELECT * FROM zetupay_attempts WHERE quote_id=? ORDER BY created_at DESC,rowid DESC LIMIT 1')
  .bind(quoteId).first<Attempt>();
}

function matches(payment:Payment,attempt:Attempt){
 return payment.reference===attempt.reference&&String(payment.channelId)===attempt.channel_id&&
  payment.currency==='KES'&&payment.amount===attempt.amount&&String(payment.phoneNumber).replace(/^\+/,'')===attempt.phone;
}

export async function sendPrompt(attempt:Attempt){
 const {data}=await request<Payment>('payment/stk-push',{
  amount:attempt.amount,phoneNumber:attempt.phone,reference:attempt.reference,currency:'KES',channelId:attempt.channel_id,
 },attempt.reference);
 if(!matches(data,attempt)||typeof data.paymentKey!=='string'||!data.paymentKey)throw Error('ZetuPay returned an unmatched payment.');
 await database().prepare('UPDATE zetupay_attempts SET payment_key=? WHERE reference=? AND payment_key IS NULL')
  .bind(data.paymentKey,attempt.reference).run();
}

export async function queryPayment(attempt:Attempt){
 if(!attempt.payment_key)return null;
 const {data}=await request<Payment>('payment/stk-push/'+encodeURIComponent(attempt.payment_key));
 if(!matches(data,attempt)||data.paymentKey!==attempt.payment_key)throw Error('ZetuPay returned an unmatched payment.');
 return data;
}

export async function webhookReference(req:Request){
 const parts=Object.fromEntries((req.headers.get('x-zetupay-signature')||'').split(',').map(part=>part.trim().split('=')));
 const {t,v1}=parts;
 if(!zetupayConfigured()||!/^\d{10}$/.test(t)||!(/^[a-f0-9]{64}$/i.test(v1))||Math.abs(Date.now()/1000-Number(t))>300)return null;
 const raw=Buffer.from(await req.arrayBuffer());
 if(raw.length>50000)return null;
 const expected=createHmac('sha256',config('ZETUPAY_SECRET_KEY')).update(t+'.').update(raw).digest();
 if(!timingSafeEqual(Buffer.from(v1,'hex'),expected))return null;
 const payload=JSON.parse(raw.toString('utf8'));
 return payload?.status==='success'&&typeof payload.reference==='string'?payload.reference:'';
}
