import {emailReady} from './email-auth';
import {settings} from './catalog';
import {config} from './database';
import {staffAlertLabel,staffAlertText,type StaffAlert} from '@/shared/notifications';

export function staffAlertsEnabled(){return emailReady();}

export async function alertStaff(alert:StaffAlert){
  try{
    if(!emailReady()){console.error('Finch staff alert skipped: sending email is not configured');return;}
    const to=(await settings()).email.trim();
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)){console.error('Finch staff alert skipped: business email is missing');return;}
    const origin=new URL(config('PUBLIC_SITE_URL')).origin;
    const response=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:`Bearer ${config('RESEND_API_KEY')}`,'Content-Type':'application/json','Idempotency-Key':`staff-${alert.kind}-${alert.id}`},body:JSON.stringify({from:config('AUTH_EMAIL_FROM'),to:[to],subject:`New ${staffAlertLabel(alert.kind)} ${alert.reference}`,text:staffAlertText(alert,origin)}),signal:AbortSignal.timeout(15000)});
    if(!response.ok)console.error('Finch staff alert failed',response.status);
    else console.info(`Finch staff alert sent ${alert.kind} ${alert.reference}`);
  }catch(e){console.error('Finch staff alert failed',e instanceof Error?e.message:'Unknown error');}
}
