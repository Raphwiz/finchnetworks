'use client';

import {useEffect,useState} from 'react';
import {ArrowDown,Building2,Plus} from 'lucide-react';
import {api} from './api';
import {money} from '@/shared/models';

const base='admin/service-accounts';
const today=()=>new Date().toLocaleDateString('en-CA',{timeZone:'Africa/Nairobi'});
type Account={id:string;name:string;phone:string;address:string};
type Work={id:string;work_date:string;location:string;description:string;labour:number;materials:number;invoice:string|null;invoice_id:string|null};

export default function ServiceAccounts(){
 const [accountsReady,setAccountsReady]=useState(false);
 const [accounts,setAccounts]=useState<Account[]>([]);
 const [accountId,setAccountId]=useState('');
 const [work,setWork]=useState<Work[]>([]);
 const [newAccount,setNewAccount]=useState(false);
 const [selection,setSelection]=useState<string[]>([]);
 const [from,setFrom]=useState('');
 const [to,setTo]=useState('');
 const [error,setError]=useState('');
 const [message,setMessage]=useState('');
 const [busy,setBusy]=useState(false);
 const [loading,setLoading]=useState(false);
 const [preview,setPreview]=useState('');
 const [issued,setIssued]=useState<{id:string;reference:string}|null>(null);
 const [accountDraft,setAccountDraft]=useState(()=>crypto.randomUUID());
 const [workDraft,setWorkDraft]=useState(()=>crypto.randomUUID());
 const [invoiceDraft,setInvoiceDraft]=useState(()=>crypto.randomUUID());
 const account=accounts.find(item=>item.id===accountId);
 const path=base+'/'+accountId;
 const visible=work.filter(row=>(!from||row.work_date>=from)&&(!to||row.work_date<=to));
 const unbilled=work.filter(row=>!row.invoice);
 const total=(rows:Work[])=>money(rows.reduce((sum,row)=>sum+row.labour+row.materials,0)/100);
 const selected=visible.filter(row=>!row.invoice&&selection.includes(row.id));
 const filters=new URLSearchParams({...(from?{from}:{}),...(to?{to}:{})});
 const available=visible.filter(row=>!row.invoice);

 async function refreshAccounts(){
  const data=await api(base);
  setAccounts(data.accounts);setAccountsReady(true);
 }
 async function refreshWork(){
  const data=await api(path);
  setWork(data.work);
 }
 useEffect(()=>{void refreshAccounts().catch(reason=>setError(reason.message));},[]);
 useEffect(()=>{
  if(!accountId)return;
  let active=true;
  setLoading(true);
  void api(path).then(data=>{if(active)setWork(data.work);})
   .catch(reason=>{if(active)setError(reason.message);})
   .finally(()=>{if(active)setLoading(false);});
  return ()=>{active=false;};
 },[accountId,path]);
 useEffect(()=>()=>{if(preview)URL.revokeObjectURL(preview);},[preview]);

 function choose(id:string){
  setWork([]);setSelection([]);setPreview('');setIssued(null);setError('');setMessage('');setAccountId(id);
  setWorkDraft(crypto.randomUUID());setInvoiceDraft(crypto.randomUUID());
 }
 async function run(action:()=>Promise<void>){
  if(busy)return;
  setBusy(true);setError('');setMessage('');
  try{await action();}catch(reason){setError((reason as Error).message);}finally{setBusy(false);}
 }
 function addAccount(event:React.FormEvent<HTMLFormElement>){
  event.preventDefault();
  const fields=Object.fromEntries(new FormData(event.currentTarget));
  void run(async()=>{
   const result=await api(base,{...fields,id:accountDraft});
   await refreshAccounts();
   choose(result.id);setNewAccount(false);setAccountDraft(crypto.randomUUID());
  });
 }
 function addWork(event:React.FormEvent<HTMLFormElement>){
  event.preventDefault();
  const form=event.currentTarget;
  const fields=Object.fromEntries(new FormData(form));
  void run(async()=>{
   await api(path+'/work',{...fields,id:workDraft});
   await refreshWork();
   form.reset();setWorkDraft(crypto.randomUUID());setMessage('Work saved.');
  });
 }
 function invoice(event:React.FormEvent<HTMLFormElement>){
  event.preventDefault();
  const fields=Object.fromEntries(new FormData(event.currentTarget));
  const isPreview=(event.nativeEvent as SubmitEvent).submitter?.getAttribute('value')==='preview';
  void run(async()=>{
   const payload={...fields,confirmed:!isPreview,id:invoiceDraft,workIds:selected.map(row=>row.id)};
   if(isPreview){
    const response=await fetch('/api/'+path+'/preview',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
    if(!response.ok)throw Error((await response.json()).error);
    setPreview(URL.createObjectURL(await response.blob()));
    return;
   }
   setIssued(await api(path+'/invoice',payload));
   setSelection([]);setPreview('');setInvoiceDraft(crypto.randomUUID());await refreshWork();
  });
 }
 return <div className="service-accounts">
  {error&&<p className="error" role="alert">{error}</p>}
  {message&&<p className="notice" role="status">{message}</p>}
  <section className="panel form service-picker">
   <div className="service-picker-heading">
    <span className="service-picker-icon"><Building2 size={22} aria-hidden="true"/></span>
    <div><h2>Service account</h2><p>{account?account.name:'Choose who you’re recording work for.'}</p></div>
    <button type="button" className={newAccount?'button':'button yellow'} disabled={busy} aria-expanded={newAccount} onClick={()=>setNewAccount(!newAccount)}>
     {!newAccount&&<Plus size={17} aria-hidden="true"/>}{newAccount?'Cancel':'Add service account'}
    </button>
   </div>
   {accounts.length>0&&<div className="service-picker-controls"><label className="service-picker-select">Account<select value={accountId} onChange={event=>choose(event.target.value)} disabled={busy}>
    <option value="">Choose an account</option>{accounts.map(item=><option key={item.id} value={item.id}>{item.name}</option>)}
   </select></label>{account&&<a className="button service-log-link" href="#service-work-log">Find work log <ArrowDown size={16} aria-hidden="true"/></a>}</div>}
   {!accountsReady&&!error&&<p role="status">Loading service accounts…</p>}
   {accountsReady&&!accounts.length&&!newAccount&&<div className="service-picker-empty">
    <strong>No service accounts yet</strong><p>Add a school or organisation to start logging visits and billable work.</p>
   </div>}
   {newAccount&&<form className="service-account-form" onSubmit={addAccount}>
    <h3>New service account</h3>
    <label>School or organisation name<input name="name" required maxLength={100}/></label>
    <div className="form-grid"><label>Phone<input name="phone" type="tel" maxLength={40}/></label><label>Billing address<input name="address" maxLength={200}/></label></div>
    <button className="button yellow" disabled={busy}>Save account</button>
   </form>}
  </section>
  {account&&<>
   <form className="panel form" key={accountId} onSubmit={addWork}>
    <h2>Log work for {account.name}</h2>
    <div className="form-grid"><label>Work date<input name="date" type="date" defaultValue={today()} required/></label><label>Location within the school<input name="location" maxLength={50}/></label></div>
    <label>Work done<textarea name="description" maxLength={137} required rows={2}/></label>
    <div className="form-grid"><label>Labour (KES)<input name="labour" type="number" min="0" step="0.01" defaultValue="0" required/></label>
     <label>Materials (KES)<input name="materials" type="number" min="0" step="0.01" defaultValue="0" required/></label></div>
    <button className="button yellow" disabled={busy}>Save work</button>
   </form>
   <section id="service-work-log" className="panel form" tabIndex={-1} aria-labelledby="service-work-log-title">
    <div className="section-heading"><h2 id="service-work-log-title">Work log</h2><strong className="service-unbilled"><span>Unbilled total</span>{total(unbilled)}</strong></div>
    <div className="form-grid"><label>From<input type="date" value={from} onChange={event=>{setFrom(event.target.value);setPreview('');}}/></label><label>To<input type="date" value={to} onChange={event=>{setTo(event.target.value);setPreview('');}}/></label></div>
    <div className="actions">
     <button type="button" className="button" disabled={busy||!available.length} onClick={()=>{setSelection(available.slice(0,40).map(row=>row.id));setPreview('');}}>Select up to 40 unbilled jobs</button>
     <a className="button" href={`/api/${path}/summary?${filters}`} target="_blank" rel="noopener">Open printable summary</a>
    </div>
    {loading?<p role="status">Loading work…</p>:!visible.length?<p>No work in this date range.</p>:<div className="admin-list">{visible.map(row=><div className="admin-row" key={row.id}>
     <span><strong>{row.description}</strong><small>{[row.work_date,row.location,`Labour ${money(row.labour/100)}`,`Materials ${money(row.materials/100)}`].filter(Boolean).join(' · ')}</small></span>
     <strong>{total([row])}</strong>
     {row.invoice?<a href={`/api/admin/invoices/${row.invoice_id}/pdf`}>{row.invoice}</a>:<label className="check-label"><input type="checkbox" checked={selection.includes(row.id)} disabled={busy||(!selection.includes(row.id)&&selected.length>=40)} onChange={event=>{
      setSelection(event.target.checked?[...selection.filter(id=>visible.some(item=>item.id===id)),row.id]:selection.filter(id=>id!==row.id));setPreview('');
     }}/> Select</label>}
    </div>)}</div>}
   </section>
   {issued&&<p className="notice" role="status">Issued {issued.reference} · <a href={`/api/admin/invoices/${issued.id}/pdf`}>Download invoice</a></p>}
   {selected.length>0&&<form className="panel form" onSubmit={invoice}>
    <h2>Invoice selected work</h2><p>{selected.length} jobs · {total(selected)}</p>
    <div className="form-grid"><label>Invoice date<input type="date" name="date" defaultValue={today()} required onChange={()=>setPreview('')}/></label>
     <label>Due date<input type="date" name="dueDate" required onChange={()=>setPreview('')}/></label></div>
    <div className="actions"><button className="button" value="preview" disabled={busy}>Preview invoice</button><button className="button yellow" value="issue" disabled={busy}>Issue invoice</button></div>
    {preview&&<p><a href={preview} target="_blank" rel="noopener">Open PDF preview</a></p>}
   </form>}
  </>}
 </div>;
}
