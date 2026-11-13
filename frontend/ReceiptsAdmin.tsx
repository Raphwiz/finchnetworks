'use client';

import {useEffect,useRef,useState} from 'react';

import {api} from './api';

import {money} from '@/shared/models';

import {paymentMethods,receiptNotes,amountWords,invoicePaymentDetails} from '@/shared/receipts';

const fresh=(invoice:boolean)=>({previousUnpaidBalance:0,dueDate:'',id:crypto.randomUUID(),date:new Intl.DateTimeFormat('en-CA',{timeZone:'Africa/Nairobi',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date()),name:'',phone:'',address:'',method:'M-Pesa',paymentReference:'',authorizedBy:'RAPHAEL GIKUNDI',sourceId:'',notes:invoice?'':receiptNotes,lines:[{name:'',quantity:1,unitPrice:0}],discount:0,vat:0,paid:0,previousPaid:0,confirmed:false});

export default function ReceiptsAdmin({kind='receipt'}:{kind?:'receipt'|'invoice'}){
 const invoice=kind==='invoice';
 const label=invoice?'Invoice':'Receipt';
 const collection=invoice?'invoices':'receipts';
 const endpoint=`admin/${collection}`;

 const [form,setForm]=useState<ReturnType<typeof fresh>|null>(null),[receipts,setReceipts]=useState<any[]>([]),[sources,setSources]=useState<any[]>([]),[query,setQuery]=useState(''),[error,setError]=useState(''),[message,setMessage]=useState(''),[busy,setBusy]=useState(false),[issued,setIssued]=useState<any>(null),[voidId,setVoidId]=useState(''),[reason,setReason]=useState(''),[loading,setLoading]=useState(true),[previewUrl,setPreviewUrl]=useState('');const lock=useRef(false);const results=useRef(0);const previewPanel=useRef<HTMLElement>(null);const itemInputs=useRef<(HTMLInputElement|null)[]>([]);const focusNewItem=useRef(false);

 async function refresh(q=query){const version=++results.current;setLoading(true);try{const r=await api(endpoint+'?q='+encodeURIComponent(q));if(version===results.current)setReceipts(r[collection]);}catch(e){setError((e as Error).message);}finally{if(version===results.current)setLoading(false);}}

 useEffect(()=>{const t=setTimeout(()=>{void refresh(query);},200);return()=>clearTimeout(t);},[query]);

 useEffect(()=>{api('commerce/admin').then(d=>setSources(d.records.filter((r:any)=>['quote','order'].includes(r.kind)))).catch(()=>setError('Could not load quotations and orders. You can still create a standalone '+kind+'.'));},[]);

 useEffect(()=>()=>{if(previewUrl)URL.revokeObjectURL(previewUrl);},[previewUrl]);

 useEffect(()=>{if(previewUrl)previewPanel.current?.scrollIntoView({behavior:'smooth',block:'start'});},[previewUrl]);

 useEffect(()=>{if(focusNewItem.current&&form){focusNewItem.current=false;const input=itemInputs.current[form.lines.length-1];input?.focus();input?.scrollIntoView({behavior:'smooth',block:'center'});}},[form?.lines.length]);
 function addItem(){focusNewItem.current=true;setForm(current=>current&&current.lines.length<40?{...current,lines:[...current.lines,{name:'',quantity:1,unitPrice:0}]}:current);}
 const update=(key:string,value:any)=>setForm(f=>f?{...f,[key]:value}:f);

 const subtotal=form?.lines.reduce((n,l)=>n+Math.round(Number(l.quantity)*Math.round(Number(l.unitPrice)*100)),0)||0;const total=(subtotal-Math.round(Number(form?.discount||0)*100)+Math.round(Number(form?.vat||0)*100))/100;const balance=Math.round((total-Number(form?.paid||0)-Number(form?.previousPaid||0)+(invoice?Number(form?.previousUnpaidBalance||0):0))*100)/100;

 function fromSource(id:string){
  const source=sources.find(record=>record.id===id);
  if(!source){update('sourceId','');return;}
  const lines=(source.lines||source.calculation?.lines||[]).map((line:any)=>({
   name:line.name,quantity:line.quantity,unitPrice:line.unitPrice??(invoice?'':0),
  }));
  const previousPaid=invoice?Math.min(Number(source.payment?.amount)||0,Number(source.total??source.calculation?.subtotal)||0):0;
  setForm(current=>current?{
   ...current,sourceId:id,name:source.name||'',phone:source.phone||'',address:source.location||'',
   lines:lines.length?lines:[{name:'',quantity:1,unitPrice:0}],paid:0,previousPaid,discount:0,vat:0,
  }:current);
 }

 async function submit(preview:boolean){if(!form||lock.current)return;lock.current=true;setBusy(true);setError('');setMessage('');try{if(preview){const result=await api(endpoint+'/preview',form);const bytes=Uint8Array.from(atob(result.pdf),(c)=>c.charCodeAt(0));setPreviewUrl(URL.createObjectURL(new Blob([bytes],{type:'application/pdf'})));setMessage('Preview ready. Review it below or download the PDF.');}else{const document=await api(endpoint,form);setIssued(document);setForm(null);setPreviewUrl('');setMessage(`Saved — ${document.reference} issued successfully.`);void refresh();window.scrollTo({top:0,behavior:'smooth'});}}catch(e){setError((e as Error).message==='Failed to fetch'?'The connection was interrupted. Your entered details are still here. Please try again.':(e as Error).message);}finally{lock.current=false;setBusy(false);}}

 async function voidDocument(){if(lock.current)return;lock.current=true;setBusy(true);setError('');try{await api(`${endpoint}/${voidId}/void`,{reason});setVoidId('');setReason('');setIssued(null);setMessage(`${label} voided. Its original record is retained.`);void refresh();}catch(e){setError((e as Error).message);}finally{lock.current=false;setBusy(false);}}

 return <div className="receipts-admin">{error&&<p className="error" role="alert">{error}</p>}{message&&<p className="notice" role="status">{message}</p>}{issued&&<p><a className="button yellow" href={`/api/${endpoint}/${issued.id}/pdf`}>Download {issued.reference}</a></p>}

 {!form?<button className="button yellow" onClick={()=>{setForm(fresh(invoice));setPreviewUrl('');setIssued(null);setMessage('');}}>New {kind}</button>:<form className="panel form receipt-form" onSubmit={e=>{e.preventDefault();void submit(false);}}><h2>{invoice?'New invoice':'New official receipt'}</h2><p>{invoice?'Set a due date, preview the invoice and issue it when ready. To correct an issued invoice, void it and issue a replacement.':'Preview your receipt, then issue it once payment is verified. Issued receipts cannot be edited; void and replace a mistaken receipt.'}</p><fieldset disabled={busy} style={{border:0,padding:0,minWidth:0}}>

 <label>Start from a quotation or order (optional)<select value={form.sourceId} onChange={e=>fromSource(e.target.value)}><option value="">Standalone {kind}</option>{sources.map(s=><option key={s.id} value={s.id}>{s.reference||s.id} — {s.name}</option>)}</select></label><p className="helper">{invoice?'Linking copies the customer, items and any recorded payments. Check these amounts before issuing.':'Linking copies the customer and items. Enter the payment actually received below; issuing a receipt does not change the linked order’s payment status.'}</p>

 <div className="form-grid">{[['name',invoice?'Bill to':'Received from'],['phone','Customer phone'],['address',invoice?'Billing address':'Customer address'],['date',`${label} issue date`]].map(([key,label])=><label key={key}>{label}<input type={key==='date'?'date':'text'} required={['name','date','authorizedBy'].includes(key)} maxLength={key==='address'?200:key==='phone'?40:100} value={(form as any)[key]} onChange={e=>update(key,e.target.value)}/></label>)}{invoice?<label>Due date<input type="date" required min={form.date} value={form.dueDate} onChange={e=>update('dueDate',e.target.value)}/></label>:<label>Payment method<select value={form.method} onChange={e=>update('method',e.target.value)}>{paymentMethods.map(m=><option key={m}>{m}</option>)}</select></label>}</div>{!invoice&&<label>Payment / transaction reference<input required={form.method!=='Cash'} maxLength={100} value={form.paymentReference} onChange={e=>update('paymentReference',e.target.value)}/></label>}

 <h3>{invoice?'Goods / services billed':'Goods / services purchased'}</h3>{form.lines.map((l,i)=><div className="receipt-item" key={i}><label>Item {i+1} description<input ref={element=>{itemInputs.current[i]=element;}} placeholder="Enter product or service name" required maxLength={200} value={l.name} onChange={e=>update('lines',form.lines.map((x,j)=>j===i?{...x,name:e.target.value}:x))}/></label><label>Qty<input required type="number" min="0.01" max="100000" step="0.01" value={l.quantity} onChange={e=>update('lines',form.lines.map((x,j)=>j===i?{...x,quantity:e.target.value}:x))}/></label><label>Unit price (KES)<input required type="number" min="0" max="100000000" step="0.01" value={l.unitPrice} onChange={e=>update('lines',form.lines.map((x,j)=>j===i?{...x,unitPrice:e.target.value}:x))}/></label><button type="button" className="textlink" disabled={form.lines.length===1} onClick={()=>update('lines',form.lines.filter((_,j)=>j!==i))} aria-label={`Remove item ${i+1}`}>Remove</button></div>)}<div className="receipt-add-row"><button type="button" className="button yellow" disabled={form.lines.length>=40} onClick={addItem}>+ Add another item</button><span role="status">{form.lines.length} / 40 items</span></div>

 <div className="form-grid">{[['discount','Discount (KES)'],['vat','VAT amount (KES)'],['previousPaid',invoice?'Previously paid (KES)':'Previously paid, excluding this receipt (KES)'],...(invoice?[['previousUnpaidBalance','Previous unpaid balance (KES)']]:[['paid','Amount received for this receipt (KES)']])].map(([key,label])=><label key={key}>{label}<input required type="number" min={key==='paid'?'0.01':'0'} max="100000000" step="0.01" value={(form as any)[key]} onChange={e=>update(key,e.target.value)}/></label>)}</div><div className="receipt-totals"><p>Subtotal <strong>{money(subtotal/100)}</strong></p><p>Grand total <strong>{money(total)}</strong></p><p>{invoice?'Amount due':balance<0?'Credit / overpayment':'Balance'} <strong>{money(Math.abs(balance))}</strong></p>{!invoice&&<p>{Number(form.paid)>0&&Number(form.paid)<=100000000?amountWords(Number(form.paid)):''}</p>}</div>{invoice&&<div className="notice invoice-payment-details">
  <strong>M-Pesa payment details</strong><br/>
  <strong>Please pay {invoicePaymentDetails.recipient} via M-Pesa PayBill.</strong><br/>
  <strong>PayBill: {invoicePaymentDetails.paybill} · Account number: {invoicePaymentDetails.account}</strong>
 </div>}<label>{invoice?'Additional notes':'Notes / warranty terms'}<textarea maxLength={1500} rows={4} value={form.notes} onChange={e=>update('notes',e.target.value)}/></label>

 <label className="receipt-confirm"><input type="checkbox" required checked={form.confirmed} onChange={e=>update('confirmed',e.target.checked)}/><span>{invoice?'I confirm the billing details, amounts and due date are correct.':'I have verified that Finch Networks Ltd received this payment and the receipt details are correct.'}</span></label><div className="actions"><button type="button" className="button" onClick={()=>void submit(true)}>Preview PDF</button><button type="submit" className="button yellow">{busy?'Working…':`Issue & save ${kind}`}</button><button type="button" className="button" onClick={()=>{setForm(null);setPreviewUrl('');}}>Cancel</button></div></fieldset></form>}

 {previewUrl&&<section ref={previewPanel} className="panel" aria-label={`${label} preview`} style={{scrollMarginTop:100}}><h2 >{label} preview — not issued</h2><p>This preview reflects the details entered when you clicked Preview PDF.</p><div className="actions"><a className="button yellow" href={previewUrl} download={`Finch-${kind}-preview.pdf`}>Download preview PDF</a><button type="button" className="button" onClick={()=>setPreviewUrl('')}>Close preview</button></div><iframe title={`${label} PDF preview`} src={previewUrl} style={{width:'100%',height:'70vh',border:0,marginTop:16}}/></section>}

 <section className="panel"><h2>Saved {collection}</h2><label className="admin-search">Search {collection}<input type="search" placeholder={invoice?"Invoice number, customer or linked quotation":"Receipt number, customer or payment reference"} value={query} onChange={e=>setQuery(e.target.value)}/></label>{loading?<p role="status">Loading {collection}…</p>:<><p className="helper">{receipts.length} {collection} shown (latest 200 matching records).</p>{!receipts.length&&<p>No {collection} found.</p>}<div className="admin-list">{receipts.map(r=><article className="receipt-record" key={r.id}><div><strong>{r.reference} · {r.name}</strong><p>{r.date} · {invoice?`Due ${r.dueDate} · Total ${money(r.total)}`:`${r.method} · Received ${money(r.paid)}`}</p><small>{r.voidReason?`VOID — ${r.voidReason}`:`${invoice?'Amount due':r.balance<0?'Credit':'Balance'}: ${money(Math.abs(r.balance))}`}</small></div><div className="actions"><a className="button" href={`/api/${endpoint}/${r.id}/pdf`}>Download PDF</a>{!r.voidReason&&<button className="textlink" disabled={busy} onClick={()=>{setVoidId(r.id);setReason('');}}>Void {kind}</button>}</div>{voidId===r.id&&<div className="receipt-void form"><label>Reason for voiding<input maxLength={500} value={reason} onChange={e=>setReason(e.target.value)}/></label><p>The {kind} will remain in your records marked VOID.</p><button className="button yellow" disabled={busy||!reason.trim()} onClick={()=>void voidDocument()}>Confirm void</button><button className="button" disabled={busy} onClick={()=>setVoidId('')}>Cancel</button></div>}</article>)}</div></>}</section></div>;

}

