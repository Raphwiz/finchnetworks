
'use client';
export function EstimateProgress({step}:{step:number}){return <ol className="estimate-progress" aria-label="Estimate progress">{['Choose equipment','Review prices','Download PDF'].map((label,i)=><li key={label} aria-current={step===i+1?'step':undefined} className={step>i+1?'complete':''}><span>{step>i+1?'✓':i+1}</span>{label}</li>)}</ol>}
export function EstimateBar({total,href,label='Continue',disabled=false,onClick}:{total:string;href?:string;label?:string;disabled?:boolean;onClick?:()=>void}){return <div className="estimate-bar-space"><div className="estimate-mobile-bar"><div><small>Estimate subtotal</small><strong>{total}</strong><small>Subject to confirmation</small></div>{href&&!disabled?<a className="button yellow" href={href}>{label} →</a>:<button type="button" className="button yellow" disabled={disabled} onClick={onClick}>{label}</button>}</div></div>}
import {useEffect,useState} from 'react';
import {api} from './api';

export function useEstimateDraftOwner() {
  const [owner,setOwner]=useState<string|null|undefined>(undefined);
  useEffect(()=>{
    let active=true;
    api('customer/session').then(({customer})=>{
      if(active)setOwner(typeof customer?.id==='string'&&customer.id?customer.id:null);
    }).catch(()=>{if(active)setOwner(null);});
    return ()=>{active=false;};
  },[]);
  return owner;
}

const draftKey=(owner:string,key:string)=>'finch-draft-v2:'+encodeURIComponent(owner)+':'+key;
export function readDraft(owner:string|null|undefined,key:string):any {
  if(!owner)return null;
  try {
    const entry=JSON.parse(localStorage.getItem(draftKey(owner,key))||'null');
    if(!entry||!Number.isFinite(entry.at)||entry.at>Date.now()||Date.now()-entry.at>30*86400000)return null;
    return entry.value;
  }catch{return null;}
}
export function saveDraft(owner:string|null|undefined,key:string,value:unknown) {
  if(!owner)return;
  try{localStorage.setItem(draftKey(owner,key),JSON.stringify({at:Date.now(),value}));}catch{}
}
export function clearDraft(owner:string|null|undefined,key:string) {
  if(!owner)return;
  try{localStorage.removeItem(draftKey(owner,key));}catch{}
}
