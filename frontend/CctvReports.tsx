'use client';

import {useState,type FormEvent} from 'react';

const reportSections=[
 {name:'equipment',label:'Existing equipment and coverage',placeholder:'Camera count and locations, camera models, recorder, storage, cabling and power.',required:true},
 {name:'condition',label:'Condition and findings',placeholder:'Working and offline cameras, image quality, recording and playback checks, blind spots and faults.',required:true},
 {name:'recommendations',label:'Recommendations',placeholder:'Suggested repairs, replacements or improvements in order of priority.',required:false},
];

export default function CctvReports(){
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState('');
 const [downloaded,setDownloaded]=useState(false);
 const today=new Intl.DateTimeFormat('sv-SE',{timeZone:'Africa/Nairobi',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());

 async function download(event:FormEvent<HTMLFormElement>){
  event.preventDefault();
  if(busy)return;
  const fields=Object.fromEntries(new FormData(event.currentTarget));
  setBusy(true);
  setError('');
  setDownloaded(false);
  try{
   const response=await fetch('/api/admin/cctv-report',{
    method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(fields),
   });
   if(!response.ok){
    const result=await response.json().catch(()=>null);
    throw new Error(result?.error||'Could not generate the report. Try again.');
   }
   const url=URL.createObjectURL(await response.blob());
   const link=document.createElement('a');
   link.href=url;
   link.download=`Finch-CCTV-Report-${fields.inspectionDate}.pdf`;
   document.body.append(link);
   link.click();
   link.remove();
   setTimeout(()=>URL.revokeObjectURL(url),30000);
   setDownloaded(true);
  }catch(error){
   setError(error instanceof Error?error.message:'Could not generate the report. Try again.');
  }finally{
   setBusy(false);
  }
 }

 return <form className="panel form" onSubmit={download} onChange={()=>setDownloaded(false)}>
  <h2>Site assessment</h2>
  <div className="form-grid">
   <label>Customer or organisation<input name="customer" required maxLength={120}/></label>
   <label>Site or location<input name="site" required maxLength={200}/></label>
   <label>Inspection date<input type="date" name="inspectionDate" defaultValue={today} required/></label>
   <label>Inspected by<input name="technician" required maxLength={120}/></label>
  </div>
  {reportSections.map(section=><label key={section.name}>{section.label}
   <textarea name={section.name} required={section.required} maxLength={2200} rows={3} placeholder={section.placeholder}/>
  </label>)}
  {error&&<p className="error" role="alert">{error}</p>}
  {downloaded&&<p className="notice" role="status">Your PDF is ready. Check your downloads.</p>}
  <div className="actions"><button className="button yellow" disabled={busy}>{busy?'Preparing PDF…':'Download report PDF'}</button></div>
  <p className="helper">Download a copy for your records. Reports are generated on demand and are not stored on the site.</p>
 </form>;
}
