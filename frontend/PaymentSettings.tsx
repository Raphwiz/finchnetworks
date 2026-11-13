'use client';

import {useEffect,useState} from 'react';
import {ArrowRight, Landmark, Plus, Wallet} from 'lucide-react';
import {api} from './api';

type Channel={id:string;name:string;type:string;paybillNumber?:string;tillNumber?:string;bankName?:string;bankCode?:string;accountNumber?:string};
type Settings={configured:boolean;enabled:boolean;channelId:string;channels:Channel[]};

function destination(channel:Channel){
 if(channel.type==='till')return `Till ${channel.tillNumber}`;
 if(channel.type==='bank')return `${channel.bankName||channel.bankCode} account ${channel.accountNumber}`;
 return `PayBill ${channel.paybillNumber} · Account ${channel.accountNumber||'uses payment reference'}`;
}

export default function PaymentSettings(){
 const [settings,setSettings]=useState<Settings|null>(null);
 const [selected,setSelected]=useState('');
 const [confirmed,setConfirmed]=useState(false);
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState('');
 const [message,setMessage]=useState('');
 const [adding,setAdding]=useState(false);
 const [type,setType]=useState('paybill');
 const [banks,setBanks]=useState<{code:string;name:string}[]>([]);
 async function register(event:React.FormEvent<HTMLFormElement>){
  event.preventDefault();
  const fields=Object.fromEntries(new FormData(event.currentTarget));
  setBusy(true);
  setError('');
  setMessage('');
  try{
   const result=await api('commerce/admin/zetupay/channels',{...fields,type,confirmed:fields.confirmed==='on'});
   await load();
   setSelected(result.channel.id);
   setConfirmed(false);
   setAdding(false);
   setMessage('Destination added. Review and save it to route new payments there.');
  }catch(error){setError((error as Error).message);}
  finally{setBusy(false);}
 }
 function changeType(value:string){
  setType(value);
  if(value==='bank'&&!banks.length)void api('commerce/admin/zetupay/banks').then(data=>setBanks(data.banks)).catch(error=>setError(error.message));
 }

 async function load(){
  const value:Settings=await api('commerce/admin/zetupay');
  setSettings(value);
  const preferred=value.channels.find(channel=>channel.type==='paybill'&&channel.paybillNumber==='880100'&&channel.accountNumber==='089754');
  setSelected(value.channelId||preferred?.id||'');
 }
 useEffect(()=>{void load().catch(error=>setError(error.message));},[]);

 const channel=settings?.channels.find(channel=>channel.id===selected);
 const current=settings?.channels.find(channel=>channel.id===settings.channelId);
 const changing=!!channel&&channel.id!==settings?.channelId;
 const promptsEnabled=!!settings?.enabled&&!!current;
 async function save(event:React.FormEvent<HTMLFormElement>){
  event.preventDefault();
  if(!channel||!changing||!confirmed||busy)return;
  setBusy(true);
  setError('');
  setMessage('');
  try{
   await api('commerce/admin/zetupay',{channelId:channel.id,confirmed});
   await load();
   setConfirmed(false);
   setMessage('Collection destination saved for new M-Pesa prompts.');
  }catch(error){setError((error as Error).message);}
  finally{setBusy(false);}
 }

 return <section className="panel payment-settings">
  <header className="payment-settings-header">
   <div className="payment-heading"><span className="payment-icon"><Wallet size={21} aria-hidden="true"/></span>
    <div><h2>ZetuPay collection destination</h2><p>Manage where new M-Pesa payments are sent.</p></div>
   </div>
   {settings?.configured&&<span className="payment-status" data-enabled={promptsEnabled}>M-Pesa prompts {promptsEnabled?'enabled':'disabled'}</span>}
  </header>
  {error&&<p className="error" role="alert">{error}</p>}
  {message&&<p className="notice" role="status">{message}</p>}
  {!settings&&!error&&<p role="status">Loading payment settings…</p>}
  {settings&&!settings.configured&&<p>Connect the Finch Networks merchant wallet on the server to load its collection channels.</p>}
  {settings?.configured&&<>
   <div className="payment-current">
    <Landmark size={20} aria-hidden="true"/>
    <div><span>Current destination</span><strong>{current?destination(current):settings.channelId?'Saved destination unavailable':'No destination selected'}</strong></div>
   </div>
   <form className="form payment-selection" onSubmit={save}>
   {settings.channelId&&!settings.channels.some(channel=>channel.id===settings.channelId)&&<p className="notice">The saved destination is no longer active. Select another collection channel.</p>}
   <label>Collection channel<select value={channel?.id||''} onChange={event=>{setSelected(event.target.value);setConfirmed(false);}} disabled={busy} required>
    <option value="">Choose an active destination</option>
    {settings.channels.map(item=><option key={item.id} value={item.id}>{destination(item)}{item.id===settings.channelId?' (current)':''}</option>)}
   </select></label>
   {changing&&channel&&<label className="payment-confirm"><input type="checkbox" checked={confirmed} onChange={event=>setConfirmed(event.target.checked)} disabled={busy}/>
    <span>Send future M-Pesa payments to {destination(channel)}.</span></label>}
   <div className="payment-actions">
    <button className="button yellow" disabled={busy||!confirmed||!changing}>Save destination <ArrowRight size={16} aria-hidden="true"/></button>
    <button type="button" className="button payment-secondary" disabled={busy} aria-expanded={adding} aria-controls={adding?'payment-register':undefined} onClick={()=>setAdding(!adding)}>
     {!adding&&<Plus size={16} aria-hidden="true"/>}{adding?'Cancel':'Add destination'}
    </button>
   </div>
  </form></>}
  {settings?.configured&&adding&&<form id="payment-register" className="form payment-register" onSubmit={register}>
   <h3>Add a collection destination</h3>
   <label>Destination type<select value={type} onChange={event=>changeType(event.target.value)} disabled={busy}>
    <option value="paybill">PayBill</option><option value="till">Till</option><option value="bank">Bank account</option>
   </select></label>
   {type==='bank'?<label>Bank<select name="bankCode" required><option value="">Choose a bank</option>
    {banks.map(bank=><option value={bank.code} key={bank.code}>{bank.name}</option>)}
   </select></label>:<label>{type==='till'?'Till number':'PayBill number'}
    <input key={type} name={type==='till'?'tillNumber':'paybillNumber'} inputMode="numeric" pattern="[0-9]{4,12}" required/>
   </label>}
   {type!=='till'&&<label>Account number<input name="accountNumber" pattern="[a-zA-Z0-9]{1,30}" required/></label>}
   <label className="payment-confirm"><input type="checkbox" name="confirmed" required/><span>I have checked the destination details.</span></label>
   <button className="button yellow" disabled={busy}>Register with ZetuPay</button>
  </form>}
 </section>;
}
