'use client';

import {useEffect,useState} from 'react';
import {Shell,PageHeading} from './Shell';
import {EstimateProgress,readDraft,saveDraft,useEstimateDraftOwner} from './EstimateJourney';
import {planDefinitions,planSummary,validatePlan,type ServicePlan} from '@/shared/service-plans';
import {api} from './api';
import {money} from '@/shared/models';
import type {sizeSolar} from '@/shared/solar';

const definition=planDefinitions.solar;
export default function SolarPlanner(){
 const owner=useEstimateDraftOwner();
 const [ready,setReady]=useState(false);
 const [answers,setAnswers]=useState<Record<string,string>>(()=>Object.fromEntries(definition.fields.map(field=>[field.key,field.options?.[0]??''])));
 const [notes,setNotes]=useState('');
 const [error,setError]=useState('');
 const [sizing,setSizing]=useState<ReturnType<typeof sizeSolar>|null>(null);
 const [sizingError,setSizingError]=useState('');
 const [calculating,setCalculating]=useState(false);
 const [totalMode,setTotalMode]=useState(false);
 const activeAnswers:Record<string,string>={...answers,totalWatts:totalMode?answers.totalWatts:'',dailyHours:totalMode?answers.dailyHours:''};
 if(totalMode){
  for(const item of [...definition.fields.slice(6,24),...definition.fields.slice(28,30)])activeAnswers[item.key]='';
 }
 useEffect(()=>{
  if(owner===undefined)return;
  try{
   const raw=new URLSearchParams(location.search).get('plan');
   const saved=raw?JSON.parse(raw):readDraft(owner,'plan-solar');
   if(saved){const plan=validatePlan(saved);if(plan.service!=='solar')throw Error();setAnswers(plan.answers);setNotes(plan.notes);setTotalMode(typeof saved.totalMode==='boolean'?saved.totalMode:Number(plan.answers.totalWatts)>0);}
  }catch{setError('Please check your saved solar requirements.');}
  setReady(true);
 },[owner]);
 useEffect(()=>{if(ready)saveDraft(owner,'plan-solar',{service:'solar',answers,notes:'',totalMode});},[ready,owner,answers,totalMode]);
 useEffect(()=>{
  if(!ready)return;
  let active=true;
  setCalculating(true);setSizing(null);setSizingError('');
  const timer=setTimeout(()=>{
   api('solar-sizing',{plan:{service:'solar',answers:activeAnswers,notes:''}}).then(result=>{if(active)setSizing(result);}).catch(error=>{if(active)setSizingError(error.message);}).finally(()=>{if(active)setCalculating(false);});
  },350);
  return()=>{active=false;clearTimeout(timer);};
 },[ready,answers,totalMode]);
 const plan:ServicePlan={service:'solar',answers:activeAnswers,notes};
 const field=(item:typeof definition.fields[number])=><label key={item.key}>{item.label}
  {item.options?<select value={answers[item.key]} onChange={event=>setAnswers({...answers,[item.key]:event.target.value})}>
   {item.options.map(option=><option key={option}>{option}</option>)}
  </select>:<input type="number" min={item.key==='headroom'?20:0} max={item.max} step={item.unit==='items'?1:.1} value={answers[item.key]??''} placeholder={item.key==='headroom'?'Minimum 20%':item.key==='pvRun'?'20 m allowance':item.key==='batteryRun'?'2 m allowance':item.key==='acRun'?'15 m allowance':'Leave blank if unsure'} onChange={event=>setAnswers({...answers,[item.key]:event.target.value})}/>}
 </label>;
 return <Shell><PageHeading label="SOLAR POWER INSTALLATION" title="Plan my solar system" description="Tell us what you want to power and how long you need it to run. Finch Networks Limited will review your requirements and prepare a quotation for your property."/>
 <EstimateProgress step={1}/>
 <form className="panel form" onSubmit={event=>{
  event.preventDefault();try{const checked=validatePlan(plan);location.assign('/estimate?plan='+encodeURIComponent(JSON.stringify(checked)));}catch{setError('Check your quantities and usage hours.');}
 }}>
  <h2>Your property and power needs</h2><div className="form-grid">{definition.fields.slice(0,6).filter(item=>answers.goal!=='Off-grid power'||item.key!=='backup').map(field)}</div>
  <div className="form-grid">{definition.fields.slice(24,26).map(field)}</div>
  {answers.goal==='Off-grid power'&&<section className="panel form"><h2>Night-time battery needs</h2><p>Enter the equipment load that runs after sunset and its operating hours. Leave night watts blank to use your full running load. Daily appliance hours must include both daytime and night-time use.</p><div className="form-grid">{definition.fields.filter(item=>['nightWatts','nightHours'].includes(item.key)).map(field)}</div><p className="helper">Batteries cover the entered night use. Panels supply daytime loads and recharge the overnight reserve. The load allowance applies to both.</p></section>}
  {answers.goal!=='Off-grid power'&&<section>{definition.fields.filter(item=>item.key==='rechargeDays').map(field)}<p className="helper">Blank uses one solar day. Choose a longer recovery period for a multi-day backup reserve when appropriate.</p></section>}
  <details open={totalMode} onToggle={event=>setTotalMode(event.currentTarget.open)}><summary>Enter a total wattage instead of individual appliances</summary><p>Use the combined watts of equipment that may operate at the same time. Close this section to return to individual appliances.</p><fieldset disabled={!totalMode} className="form-grid" style={{border:0,padding:0,margin:0}}>{definition.fields.slice(26,28).map(field)}</fieldset></details>
  {!totalMode&&<>
  <h2>Appliances to power</h2><p className="helper">Use actual running watts and daily operating hours. For fridges and other cycling equipment, use compressor running hours rather than 24 hours continuously, or enter measured daily kWh below. Leave uncertain values blank for Finch to assess.</p>
  {['Lights','TVs','Routers','Fridges','Computers','Pumps'].map((name,index)=><fieldset className="panel" key={name}><legend>{name}</legend><div className="form-grid">{definition.fields.slice(6+index*3,9+index*3).map(field)}</div></fieldset>)}
  <div className="form-grid">{definition.fields.slice(28,30).map(field)}</div>
  </>}
  {definition.fields.filter(item=>item.key==='dailyKwh').map(field)}
  <p className="helper">Measured daily kWh replaces the hours-based energy calculation. Keep appliance watts or total simultaneous watts for inverter sizing. Use energy for the equipment this solar system will power.</p>
  <details><summary>Startup load and cable routes</summary><p>Enter the measured or manufacturer-specified combined startup load when known. Motor and compressor starting VA and surge duration need verification. Cable routes default to 20 m, 2 m and 15 m respectively, with a 20% routing allowance.</p><div className="form-grid">{definition.fields.slice(30,34).map(field)}</div></details>
  <section className="panel form" aria-label="Suggested solar system" aria-live="polite">
   <h2>Suggested system and estimate</h2>
   {calculating&&<p role="status">Calculating your solar system…</p>}
   {sizingError&&<p className="error">{sizingError}</p>}
   {sizing&&!sizing.ready&&<p>{sizing.reason}</p>}
   {sizing?.ready&&<>
    <p className="notice">Budget sizing — installation design needs verification.</p>
    <dl className="admin-order-contact">
     <div><dt>Your simultaneous load</dt><dd>{sizing.runningWatts.toLocaleString()} W</dd></div>
     <div><dt>Design load with {sizing.headroom}% allowance</dt><dd>{sizing.designWatts.toLocaleString()} W</dd></div>
     <div><dt>Estimated daily use</dt><dd>{sizing.dailyKwh.toFixed(2)} kWh</dd></div>
     <div><dt>Inverter</dt><dd>{sizing.inverter.watts!/1000} kW · {sizing.inverter.surgeWatts!/1000} kW surge</dd></div>
     <div><dt>Battery bank</dt><dd>{sizing.batteryCount>0?<>{sizing.batteryCount} × {sizing.battery.name} · {sizing.nominalBatteryKwh.toFixed(2)} kWh nominal</>:'No night-time storage required; battery-free inverter operation needs Finch confirmation.'}</dd></div>
     <div><dt>Solar array</dt><dd>{sizing.panelCount} panels · {(sizing.panelWatts/1000).toFixed(2)} kWp</dd></div>
     <div><dt>{sizing.offGrid?'Night-time duration':'Backup duration'}</dt><dd>{sizing.duration} hours {sizing.offGrid?`at ${sizing.nightWatts.toLocaleString()} W`:'at the full stated running load'}</dd></div>
     {sizing.offGrid&&<><div><dt>Night-time energy before allowance</dt><dd>{sizing.nightKwh.toFixed(2)} kWh</dd></div><div><dt>Daytime energy supplied by solar</dt><dd>{sizing.daytimeKwh.toFixed(2)} kWh</dd></div></>}
    </dl>
    <p className="helper">Lithium uses compatible 51.2 V modules. Tubular batteries use strings of four 12 V units. Battery quantities allow for usable capacity and discharge current.</p>
    {sizing.calculation.lines.map(line=><div className="summary-line" key={line.id}><span>{line.quantity} {line.unit} × {line.name}</span><strong>{line.total===null?'Price to confirm':money(line.total)}</strong></div>)}
    <div className="total"><span>{sizing.calculation.hasUnpriced?'Priced items subtotal':'Estimated budget total'}</span><strong>{money(sizing.calculation.subtotal)}</strong></div>
    {sizing.calculation.hasUnpriced&&<p className="notice">Some material prices need Finch confirmation. A complete estimated total appears once all prices are configured.</p>}
    <details><summary>Calculation and verification details</summary>
     <p>Daily energy = sum of watts × quantities × daily operating hours. Battery capacity = stored-load energy × allowance ÷ inverter efficiency ÷ usable depth. Panels = PV energy ÷ peak sun hours ÷ DC derate ÷ panel watts, rounded up once.</p>
     <p>Required PV power before rounding: {(sizing.requiredPvWatts/1000).toFixed(2)} kWp.</p>
     <p className="helper">{sizing.calculation.note}</p>
    </details>
   </>}
  </section>
  <label>Other appliances and additional requirements<textarea rows={4} maxLength={2000} value={notes} onChange={event=>setNotes(event.target.value)} placeholder="Other equipment, quantities, daily usage, site location or anything you need help with."/></label>
  <details><summary>Review requirements</summary><p className="preserve">{planSummary(plan)}</p></details>
  <p className="notice">Finch will confirm equipment sizing, startup loads, battery capacity, installation conditions and pricing before approving your quotation.</p>
  {error&&<p className="error" role="alert">{error}</p>}
  <button className="button yellow">{sizing?.ready?'Continue with this system':'Request help from Finch'}</button>
 </form></Shell>;
}
