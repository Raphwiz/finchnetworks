import {emailReady} from './email-auth';
import {database,config} from './database';
import {customerUpdateLabel,customerUpdateReference,customerUpdateText,type CustomerUpdate} from '@/shared/notifications';

function address(value:unknown){return typeof value==='string'&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())?value.trim():'';}

export async function notifyCustomer(update:CustomerUpdate){
  try{
    if(!emailReady()){console.error('Finch customer update skipped: sending email is not configured');return;}
    const row=update.kind==='enquiry'
      ?await database().prepare('SELECT c.email AS email FROM enquiries e JOIN customers c ON c.id=e.customer_id WHERE e.id=?').bind(update.id).first<{email:string}>()
      :await database().prepare('SELECT c.email AS email FROM commerce o JOIN customers c ON c.id=o.customer_id WHERE o.id=?').bind(update.id).first<{email:string}>();
    const to=address(row?.email);
    if(!to)return;
    const origin=new URL(config('PUBLIC_SITE_URL')).origin;
    const reference=customerUpdateReference(update);
    const response=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:`Bearer ${config('RESEND_API_KEY')}`,'Content-Type':'application/json','Idempotency-Key':`customer-${update.kind}-${update.id}-${update.status}`},body:JSON.stringify({from:config('AUTH_EMAIL_FROM'),to:[to],subject:`Your Finch ${customerUpdateLabel(update.kind)} ${reference} is ${String(update.status).replaceAll('-',' ')}`,text:customerUpdateText(update,origin)}),signal:AbortSignal.timeout(15000)});
    if(!response.ok)console.error('Finch customer update failed',response.status);
    else console.info(`Finch customer update sent ${update.kind} ${reference}`);
  }catch(e){console.error('Finch customer update failed',e instanceof Error?e.message:'Unknown error');}
}
