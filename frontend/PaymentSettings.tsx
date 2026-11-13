'use client';

import {useEffect,useState} from 'react';
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
 async function save(event:React.FormEvent<HTMLFormElement>){
  event.preventDefault();
  if(!channel||!confirmed||busy)return;
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

 return <section className="panel form">
  <h2>ZetuPay collection destination</h2>
  {error&&<p className="error" role="alert">{error}</p>}
  {message&&<p className="notice" role="status">{message}</p>}
  {!settings&&!error&&<p role="status">Loading payment settings…</p>}
  {settings&&!settings.configured&&<p>Connect the Finch Networks merchant wallet on the server to load its collection channels.</p>}
  {settings?.configured&&<form className="form" onSubmit={save}>
   <p>M-Pesa prompts are {settings.enabled&&settings.channels.some(channel=>channel.id===settings.channelId)?'enabled':'disabled'}.</p>
   {settings.channelId&&!settings.channels.some(channel=>channel.id===settings.channelId)&&<p className="notice">The saved destination is no longer active. Select another collection channel.</p>}
   <label>Collection channel<select value={channel?.id||''} onChange={event=>{setSelected(event.target.value);setConfirmed(false);}} disabled={busy} required>
    <option value="">Choose an active destination</option>
    {settings.channels.map(item=><option key={item.id} value={item.id}>{destination(item)}{item.id===settings.channelId?' (current)':''}</option>)}
   </select></label>
   {channel&&<label className="receipt-confirm"><input type="checkbox" checked={confirmed} onChange={event=>setConfirmed(event.target.checked)} disabled={busy}/>
    <span>Send future M-Pesa payments to {destination(channel)}.</span></label>}
   <button className="button yellow" disabled={busy||!confirmed||!channel||channel.id===settings.channelId}>Save destination</button>
  </form>}
  {settings?.configured&&<button type="button" className="button" disabled={busy} onClick={()=>setAdding(!adding)}>{adding?'Cancel adding destination':'Add a collection destination'}</button>}
  {settings?.configured&&adding&&<form className="form" onSubmit={register}>
   <label>Destination type<select value={type} onChange={event=>changeType(event.target.value)} disabled={busy}>
    <option value="paybill">PayBill</option><option value="till">Till</option><option value="bank">Bank account</option>
   </select></label>
   {type==='bank'?<label>Bank<select name="bankCode" required><option value="">Choose a bank</option>
    {banks.map(bank=><option value={bank.code} key={bank.code}>{bank.name}</option>)}
   </select></label>:<label>{type==='till'?'Till number':'PayBill number'}
    <input key={type} name={type==='till'?'tillNumber':'paybillNumber'} inputMode="numeric" pattern="[0-9]{4,12}" required/>
   </label>}
   {type!=='till'&&<label>Account number<input name="accountNumber" pattern="[a-zA-Z0-9]{1,30}" required/></label>}
   <label className="receipt-confirm"><input type="checkbox" name="confirmed" required/><span>I have checked the destination details.</span></label>
   <button className="button" disabled={busy}>Register with ZetuPay</button>
  </form>}
 </section>;
}
