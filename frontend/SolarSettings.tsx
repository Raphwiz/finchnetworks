'use client';
import {useEffect,useState} from 'react';
import {api} from './api';
import type {SolarCatalog,SolarItem} from '@/shared/solar';

export default function SolarSettings(){
 const [catalog,setCatalog]=useState<SolarCatalog|null>(null);
 const [error,setError]=useState(''),[message,setMessage]=useState(''),[busy,setBusy]=useState(false);
 useEffect(()=>{api('admin/solar').then(setCatalog).catch(error=>setError(error.message));},[]);
 const updateItem=(id:string,field:keyof SolarItem,value:string)=>{
  if(!catalog)return;
  const update=(part:SolarItem)=>part.id===id?{...part,[field]:field==='name'?value:field==='verified'?value==='true':value===''?null:Number(value)}:part;
  setCatalog({...catalog,inverters:catalog.inverters.map(update),lithium:catalog.lithium.map(update),tubular:catalog.tubular.map(update),panel:update(catalog.panel),panel625:catalog.panel625?update(catalog.panel625):undefined,accessories:catalog.accessories.map(update)});
  setMessage('');
 };
 const equipment=(title:string,items:SolarItem[])=><section><h3>{title}</h3>{items.map(part=><fieldset className="panel form" key={part.id}><legend>{part.name}</legend><div className="form-grid">
  <label>Equipment / model name<input value={part.name} maxLength={150} onChange={event=>updateItem(part.id,'name',event.target.value)}/></label>
  <label>Price per {part.unit} (KES)<input type="number" min={0} step="0.01" value={part.price??''} placeholder="Price needed" onChange={event=>updateItem(part.id,'price',event.target.value)}/></label>
  {(['watts','surgeWatts','maxPvWatts','kwh','maxAmps','maxSurgeAmps'] as const).filter(key=>part[key]!==undefined).map(key=><label key={key}>{({watts:'Continuous power / panel power (W)',surgeWatts:'Surge rating (W)',maxPvWatts:'Maximum connected PV array (W; 0 = unconfirmed)',kwh:'Nominal capacity per battery (kWh)',maxAmps:'Continuous discharge per battery / string (A)',maxSurgeAmps:'Surge discharge per battery / string (A)'})[key]}<input required type="number" min={key==='maxPvWatts'?0:.1} step="0.1" value={part[key]} onChange={event=>updateItem(part.id,key,event.target.value)}/></label>)}
  {part.watts!==undefined||part.kwh!==undefined?<label className="check-label"><input type="checkbox" checked={part.verified===true} onChange={event=>updateItem(part.id,'verified',String(event.target.checked))}/>Ratings checked against this model’s manufacturer datasheet</label>:null}
 </div></fieldset>)}</section>;
 return <>{error&&<p role="alert" className="error">{error}</p>}{!catalog?<p>Loading solar equipment…</p>:<form className="form" onSubmit={async event=>{
  event.preventDefault();setBusy(true);setError('');setMessage('');try{setCatalog(await api('admin/solar',catalog));setMessage('Solar equipment and prices saved.');}catch(error){setError((error as Error).message);}finally{setBusy(false);}
 }}>
 <section className="panel form"><h2>Solar design assumptions</h2><p>Replace allowance profiles with the equipment you supply. Verify ratings against each manufacturer’s data. All inverters use a 48 V nominal battery bus. Lithium profiles are compatible 51.2 V modules. Tubular profiles are 12 V units arranged in strings of four.</p><div className="form-grid">
 {(['headroom','sunHours','yieldFactor','inverterEfficiency','lithiumDod','tubularDod','lithiumRoundTrip','tubularRoundTrip'] as const).map(key=><label key={key}>{({headroom:'Minimum load allowance (%)',sunHours:'Design-month peak sun hours / day',yieldFactor:'DC PV derate, excluding inverter/storage losses (0–1)',inverterEfficiency:'Inverter efficiency (0–1)',lithiumDod:'Lithium usable depth (0–1)',tubularDod:'Tubular usable depth (0–1)',lithiumRoundTrip:'Lithium round-trip energy efficiency (0–1)',tubularRoundTrip:'Tubular round-trip energy efficiency (0–1)'})[key]}<input required type="number" step="0.01" min={key==='headroom'?20:.1} max={key==='headroom'?100:key==='sunHours'?8:1} value={catalog[key]??''} onChange={event=>{setCatalog({...catalog,[key]:Number(event.target.value)});setMessage('');}}/></label>)}
 <label className="check-label"><input type="checkbox" checked={catalog.resourceVerified===true} onChange={event=>setCatalog({...catalog,resourceVerified:event.target.checked})}/>Resource assumptions checked for Finch’s design region and season</label>
 <p className="helper">Default derate and efficiency values are starting assumptions. NREL models temperature separately from its 14% default system losses. Include site temperature/shading adjustments here when using this simplified daily-energy method. Keep inverter losses out of the DC derate.</p>
 </div></section>
 {equipment('Hybrid inverter profiles',catalog.inverters)}
 {equipment('Lithium batteries',catalog.lithium)}
 {equipment('Tubular batteries',catalog.tubular)}
 {equipment('Solar panels — separate prices for 550 W and 625 W',[catalog.panel,catalog.panel625!])}
 {equipment('Mounting, wiring, protection and installation allowances',catalog.accessories)}
 <p className="helper">Leave prices blank until confirmed. Blank prices are shown as needing a price, and cannot produce a complete estimated total.</p>
 {message&&<p className="notice" role="status">{message}</p>}
 <button className="button yellow" disabled={busy}>{busy?'Saving…':'Save solar equipment and prices'}</button>
 </form>}</>;
}
