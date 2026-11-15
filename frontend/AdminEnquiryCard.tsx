'use client';
import {Phone,MessageCircle,Download,FileText,MapPin,Mail,Wrench,ClipboardList,ChevronDown} from 'lucide-react';
import EnquiryUpdateEditor from './EnquiryUpdateEditor';
import {enquiryStatuses} from '@/shared/enquiry-updates';
import NotifyCustomer from './NotifyCustomer';
import {money} from '@/shared/models';
import {whatsappNumber} from '@/shared/notifications';
export default function AdminEnquiryCard({enquiry:e,onUpdated,onQuote}:{enquiry:any;onUpdated:()=>Promise<void>;onQuote:()=>void}){
 const lines=e.calculation?.lines||[];
 const repair=e.requestType==='repair'||!!e.repairEquipment||String(e.notes||'').startsWith('Repair request:');
 const kind=repair?'Repair request':e.cctvSummary?'CCTV installation':e.planSummary?'Service installation':lines.length?'Equipment estimate':'General enquiry';
 const Icon=repair?Wrench:ClipboardList;
 const date=new Date(e.createdAt);
 const received=Number.isNaN(date.getTime())?'Date not recorded':date.toLocaleString('en-KE',{dateStyle:'medium',timeStyle:'short',timeZone:'Africa/Nairobi'});
 return <details className="panel enquiry-card">
  <summary className="enquiry-card-header">
   <span className="enquiry-heading">
    <span className={`enquiry-kind${repair?' repair':''}`}><Icon size={15} aria-hidden="true"/>{kind}</span>
    <strong className="enquiry-customer">{e.name||'Customer'}</strong>
    <span className="enquiry-reference">{e.reference} · {received} EAT</span>
   </span>
   <span className="enquiry-summary-status"><span>{enquiryStatuses[e.status]||e.status}</span><ChevronDown size={19} aria-hidden="true"/></span>
  </summary>
  <div className="enquiry-body">
   <section aria-label="Request details">
    <h4 className="enquiry-section-title">Request details</h4>
    <dl className="enquiry-contact"><div><dt><Phone size={15}/>Phone / WhatsApp</dt><dd>{e.phone?<a href={`tel:${e.phone}`}>{e.phone}</a>:'Not provided'}</dd></div><div><dt><MapPin size={15}/>Installation / repair location</dt><dd>{e.location||'Not provided'}</dd></div>{e.email&&<div><dt><Mail size={15}/>Email</dt><dd><a href={`mailto:${e.email}`}>{e.email}</a></dd></div>}</dl><section className="enquiry-requirements"><h4>{repair?'Reported fault':'What the customer needs'}</h4>{e.repairEquipment&&<p className="enquiry-equipment"><strong>Equipment:</strong> {e.repairEquipment}</p>}<p className="preserve">{e.notes||'No additional description supplied. Contact the customer to confirm the requirements.'}</p>{!e.cctvSummary&&!e.planSummary&&!lines.length&&<p className="enquiry-followup">{repair?'Next: confirm the fault, equipment model and a suitable assessment time.':'Next: confirm the required service, quantities and site details before preparing a quotation.'}</p>}</section>{(e.cctvSummary||e.planSummary)&&<section className="enquiry-selected"><h4>Customer’s selected setup</h4>{e.cctvSummary&&<p className="preserve">{e.cctvSummary}</p>}{e.planSummary&&<p className="preserve">{e.planSummary}</p>}</section>}{e.repairPhoto&&<section className="enquiry-photo"><h4>Customer’s equipment photo</h4><a href={e.repairPhoto} target="_blank" rel="noreferrer"><img src={e.repairPhoto} alt="Equipment photo supplied with the repair request" loading="lazy"/><span>Open full photo</span></a></section>}{lines.length>0&&<section className="enquiry-items"><h4>Requested equipment &amp; services</h4><div className="enquiry-table-scroll"><table><thead><tr><th>Item</th><th>Qty</th><th>Unit price</th><th>Total</th></tr></thead><tbody>{lines.map((l:any,i:number)=><tr key={l.id||i}><td>{l.name}</td><td>{l.quantity}</td><td>{l.unitPrice==null?'To confirm':money(l.unitPrice)}</td><td>{l.total==null?'To confirm':money(l.total)}</td></tr>)}</tbody></table></div><div className="enquiry-subtotal"><span>Priced items subtotal</span><strong>{money(e.calculation?.subtotal||0)}</strong></div>{e.calculation?.hasUnpriced&&<p className="helper">Some items still need pricing. This is not a final total.</p>}</section>}</section><section className="enquiry-actions" aria-label="Next actions"><h4>Next actions</h4><div className="actions"><button type="button" className="button yellow" onClick={onQuote}><FileText size={17}/>Prepare quotation</button>{e.phone&&<><a className="enquiry-action" href={`tel:${e.phone}`}><Phone size={17}/>Call customer</a><a className="enquiry-action" target="_blank" rel="noreferrer" href={`https://wa.me/${whatsappNumber(e.phone)}?text=${encodeURIComponent(`Hello ${e.name}, this is Finch Networks following up on your ${repair?'repair request':'enquiry'} ${e.reference}.`)}`}><MessageCircle size={17}/>WhatsApp customer</a></>}<a className="enquiry-action" href={`/api/estimate/${e.id}`}><Download size={17}/>Download PDF</a></div><NotifyCustomer record={{...e,kind:'enquiry'}}/></section><EnquiryUpdateEditor enquiry={e} onUpdated={onUpdated}/></div></details>;
}
