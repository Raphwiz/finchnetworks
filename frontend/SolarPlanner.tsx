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
 useEffect(()=>{
  if(owner===undefined)return;
  try{
   const raw=new URLSearchParams(location.search).get('plan');
   const saved=raw?JSON.parse(raw):readDraft(owner,'plan-solar');
   if(saved){const plan=validatePlan(saved);if(plan.service!=='solar')throw Error();setAnswers(plan.answers);setNotes(plan.notes);}
  }catch{setError('Please check your saved solar requirements.');}
  setReady(true);
 },[owner]);
 useEffect(()=>{if(ready)saveDraft(owner,'plan-solar',{service:'solar',answers,notes:''});},[ready,owner,answers]);
 useEffect(()=>{
  if(!ready)return;
  let active=true;
  setCalculating(true);setSizing(null);setSizingError('');
  const timer=setTimeout(()=>{
   api('solar-sizing',{plan:{service:'solar',answers,notes:''}}).then(result=>{if(active)setSizing(result);}).catch(error=>{if(active)setSizingError(error.message);}).finally(()=>{if(active)setCalculating(false);});
  },350);
  return()=>{active=false;clearTimeout(timer);};
 },[ready,answers]);
 const plan:ServicePlan={service:'solar',answers,notes};
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
  <h2>Your property and power needs</h2><div className="form-grid">{definition.fields.slice(0,6).map(field)}</div>
  <div className="form-grid">{definition.fields.slice(24,26).map(field)}</div>
  <details><summary>Enter a total wattage instead of individual appliances</summary><p>A total wattage replaces the appliance load calculation below. Use the combined watts of equipment that may operate at the same time.</p><div className="form-grid">{definition.fields.slice(26,28).map(field)}</div></details>
  <h2>Appliances to power</h2><p className="helper">Use the wattage on the appliance label if you know it. Leave uncertain values blank for Finch to assess. For backup, include the appliances you need during outages.</p>
  {['Lights','TVs','Routers','Fridges','Computers','Pumps'].map((name,index)=><fieldset className="panel" key={name}><legend>{name}</legend><div className="form-grid">{definition.fields.slice(6+index*3,9+index*3).map(field)}</div></fieldset>)}
  <div className="form-grid">{definition.fields.slice(28,30).map(field)}</div>
  <details><summary>Startup load and cable routes</summary><p>Leave routes blank to use cable allowances of 20 m from panels, 2 m from batteries and 15 m to the distribution board. Cable lengths include 20% routing allowance. Without a measured startup load, a conservative three-times-running-load allowance is used.</p><div className="form-grid">{definition.fields.slice(30).map(field)}</div></details>
  <section className="panel form" aria-label="Suggested solar system" aria-live="polite">
   <h2>Suggested system and estimate</h2>
   {calculating&&<p role="status">Calculating your solar system…</p>}
   {sizingError&&<p className="error">{sizingError}</p>}
   {sizing&&!sizing.ready&&<p>{sizing.reason}</p>}
   {sizing?.ready&&<>
    <dl className="admin-order-contact">
     <div><dt>Your simultaneous load</dt><dd>{sizing.runningWatts.toLocaleString()} W</dd></div>
     <div><dt>Design load with {sizing.headroom}% allowance</dt><dd>{sizing.designWatts.toLocaleString()} W</dd></div>
     <div><dt>Estimated daily use</dt><dd>{sizing.dailyKwh.toFixed(2)} kWh</dd></div>
     <div><dt>Inverter</dt><dd>{sizing.inverter.watts!/1000} kW · {sizing.inverter.surgeWatts!/1000} kW surge</dd></div>
     <div><dt>Battery bank</dt><dd>{sizing.batteryCount} × {sizing.battery.name} · {sizing.nominalBatteryKwh.toFixed(2)} kWh nominal</dd></div>
     <div><dt>Solar array</dt><dd>{sizing.panelCount} panels · {(sizing.panelWatts/1000).toFixed(2)} kWp</dd></div>
     <div><dt>{sizing.offGrid?'Off-grid autonomy':'Backup duration'}</dt><dd>{sizing.duration} hours {sizing.offGrid?'at the entered daily usage':'at the full stated running load'}</dd></div>
    </dl>
    <p className="helper">Lithium uses compatible 51.2 V modules. Tubular batteries use strings of four 12 V units. Battery quantities allow for usable capacity and discharge current.</p>
    {sizing.calculation.lines.map(line=><div className="summary-line" key={line.id}><span>{line.quantity} {line.unit} × {line.name}</span><strong>{line.total===null?'Price to confirm':money(line.total)}</strong></div>)}
    <div className="total"><span>{sizing.calculation.hasUnpriced?'Priced items subtotal':'Estimated total'}</span><strong>{money(sizing.calculation.subtotal)}</strong></div>
    {sizing.calculation.hasUnpriced&&<p className="notice">Some material prices need Finch confirmation. A complete estimated total appears once all prices are configured.</p>}
    <p className="helper">{sizing.calculation.note}</p>
   </>}
  </section>
  <label>Other appliances and additional requirements<textarea rows={4} maxLength={2000} value={notes} onChange={event=>setNotes(event.target.value)} placeholder="Other equipment, quantities, daily usage, site location or anything you need help with."/></label>
  <details><summary>Review requirements</summary><p className="preserve">{planSummary(plan)}</p></details>
  <p className="notice">Finch will confirm equipment sizing, startup loads, battery capacity, installation conditions and pricing before approving your quotation.</p>
  {error&&<p className="error" role="alert">{error}</p>}
  <button className="button yellow">{sizing?.ready?'Continue with this system':'Request help from Finch'}</button>
 </form></Shell>;
}
