'use client';

import {useEffect,useState} from 'react';
import {Shell,PageHeading} from './Shell';
import {EstimateProgress,readDraft,saveDraft,useEstimateDraftOwner} from './EstimateJourney';
import {planDefinitions,planSummary,validatePlan,type ServicePlan} from '@/shared/service-plans';

const definition=planDefinitions.solar;
export default function SolarPlanner(){
 const owner=useEstimateDraftOwner();
 const [ready,setReady]=useState(false);
 const [answers,setAnswers]=useState<Record<string,string>>(()=>Object.fromEntries(definition.fields.map(field=>[field.key,field.options?.[0]??''])));
 const [notes,setNotes]=useState('');
 const [error,setError]=useState('');
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
 const plan:ServicePlan={service:'solar',answers,notes};
 const field=(item:typeof definition.fields[number])=><label key={item.key}>{item.label}
  {item.options?<select value={answers[item.key]} onChange={event=>setAnswers({...answers,[item.key]:event.target.value})}>
   {item.options.map(option=><option key={option}>{option}</option>)}
  </select>:<input type="number" min={0} max={item.max} step={item.unit==='items'?1:.1} value={answers[item.key]} placeholder="Leave blank if unsure" onChange={event=>setAnswers({...answers,[item.key]:event.target.value})}/>}
 </label>;
 return <Shell><PageHeading label="SOLAR POWER INSTALLATION" title="Plan my solar system" description="Tell us what you want to power and how long you need it to run. Finch Networks Limited will review your requirements and prepare a quotation for your property."/>
 <EstimateProgress step={1}/>
 <form className="panel form" onSubmit={event=>{
  event.preventDefault();try{const checked=validatePlan(plan);location.assign('/estimate?plan='+encodeURIComponent(JSON.stringify(checked)));}catch{setError('Check your quantities and usage hours.');}
 }}>
  <h2>Your property and power needs</h2><div className="form-grid">{definition.fields.slice(0,6).map(field)}</div>
  <h2>Appliances to power</h2><p className="helper">Use the wattage on the appliance label if you know it. Leave uncertain values blank for Finch to assess. For backup, include the appliances you need during outages.</p>
  {['Lights','TVs','Routers','Fridges','Computers','Pumps'].map((name,index)=><fieldset className="panel" key={name}><legend>{name}</legend><div className="form-grid">{definition.fields.slice(6+index*3,9+index*3).map(field)}</div></fieldset>)}
  <label>Other appliances and additional requirements<textarea rows={4} maxLength={2000} value={notes} onChange={event=>setNotes(event.target.value)} placeholder="Other equipment, quantities, daily usage, site location or anything you need help with."/></label>
  <details><summary>Review requirements</summary><p className="preserve">{planSummary(plan)}</p></details>
  <p className="notice">Finch will confirm equipment sizing, startup loads, battery capacity, installation conditions and pricing before approving your quotation.</p>
  {error&&<p className="error" role="alert">{error}</p>}
  <button className="button yellow">Continue to estimate request</button>
 </form></Shell>;
}
