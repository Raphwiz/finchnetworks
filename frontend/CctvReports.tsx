'use client';

import {useRef,useState,type FormEvent} from 'react';

import {cameraReportBrands,cameraReportTypes,maxCameraSetups,recorderOptions,type CameraReportType} from '@/shared/cctv-report';

const cameraFields=[
 ['model','Camera model',120,'Model number or description'],
 ['wiring','Wiring status',240,'Cable type, condition, or faults'],
 ['recorderCondition','Recorder condition',240,'Model, channels, recording or playback faults'],
 ['storage','Hard drive status',240,'Capacity, health, or no drive installed'],
] as const;

const reportSections=[
 {name:'equipment',label:'Additional equipment and coverage notes',placeholder:'Camera counts, locations, fields of view and any other equipment.',required:false},
 {name:'condition',label:'Condition and findings',placeholder:'Working and offline cameras, image quality, recording and playback checks, blind spots and faults.',required:false},
 {name:'recommendations',label:'Recommendations',placeholder:'Suggested repairs, replacements or improvements in order of priority.',required:false},
];

export default function CctvReports(){
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState('');
 const [downloaded,setDownloaded]=useState(false);
 const [setups,setSetups]=useState<{id:number;type:CameraReportType}[]>([{id:0,type:'HD'}]);
 const nextSetupId=useRef(1);
 const today=new Intl.DateTimeFormat('sv-SE',{timeZone:'Africa/Nairobi',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());

 async function download(event:FormEvent<HTMLFormElement>){
  event.preventDefault();
  if(busy)return;
  const data=new FormData(event.currentTarget);
  const fields=Object.fromEntries(['customer','site','inspectionDate','technician','equipment','condition','recommendations'].map(name=>[name,data.get(name)]));
  const cameraSetups=setups.map(({id,type})=>({
   type,...Object.fromEntries(['brand','model','wiring','recorder','recorderCondition','storage'].map(name=>[name,data.get(`setup-${id}-${name}`)])),
  }));
  setBusy(true);
  setError('');
  setDownloaded(false);
  try{
   const response=await fetch('/api/admin/cctv-report',{
    method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...fields,cameraSetups}),
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
  <section className="form" aria-labelledby="camera-setups-title">
   <h3 id="camera-setups-title">Camera equipment</h3>
   <p className="helper">Add one setup per group of cameras that shares the same equipment.</p>
   {setups.map(({id,type},index)=><fieldset className="panel form" key={id}>
    <legend>Camera setup {index+1}</legend>
    <div className="form-grid">
     <label>Camera brand<select name={`setup-${id}-brand`} required defaultValue="">
      <option value="">Choose brand</option>
      {cameraReportBrands.map(brand=><option key={brand}>{brand}</option>)}
     </select></label>
     <label>Camera type<select value={type} onChange={event=>{
      const nextType=event.currentTarget.value==='IP'?'IP':'HD';
      setSetups(current=>current.map(setup=>setup.id===id?{...setup,type:nextType}:setup));
     }}>
      {cameraReportTypes.map(option=><option key={option}>{option}</option>)}
     </select></label>
     {cameraFields.slice(0,2).map(([name,label,limit,placeholder])=><label key={name}>{label}
      <input name={`setup-${id}-${name}`} maxLength={limit} placeholder={placeholder}/>
     </label>)}
     <label>Recorder type<select key={type} name={`setup-${id}-recorder`} required defaultValue="">
      <option value="">Choose recorder</option>
      {recorderOptions[type].map(recorder=><option key={recorder}>{recorder}</option>)}
     </select></label>
     {cameraFields.slice(2).map(([name,label,limit,placeholder])=><label key={name}>{label}
      <input name={`setup-${id}-${name}`} maxLength={limit} placeholder={placeholder}/>
     </label>)}
    </div>
    {setups.length>1&&<button type="button" className="textlink" onClick={()=>{
     setSetups(current=>current.filter(setup=>setup.id!==id));setDownloaded(false);
    }}>Remove setup</button>}
   </fieldset>)}
   <div className="actions"><button type="button" className="button" disabled={setups.length>=maxCameraSetups} onClick={()=>{
    const id=nextSetupId.current++;
    setSetups(current=>[...current,{id,type:'HD'}]);setDownloaded(false);
   }}>Add camera setup</button></div>
  </section>
  {reportSections.map(section=><label key={section.name}>{section.label}
   <textarea name={section.name} required={section.required} maxLength={2200} rows={3} placeholder={section.placeholder}/>
  </label>)}
  {error&&<p className="error" role="alert">{error}</p>}
  {downloaded&&<p className="notice" role="status">Your PDF is ready. Check your downloads.</p>}
  <div className="actions"><button className="button yellow" disabled={busy}>{busy?'Preparing PDF…':'Download report PDF'}</button></div>
  <p className="helper">Download a copy for your records. Reports are generated on demand and are not stored on the site.</p>
 </form>;
}
