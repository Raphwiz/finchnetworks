
'use client';
export function EstimateProgress({step}:{step:number}){return <ol className="estimate-progress" aria-label="Estimate progress">{['Choose equipment','Review prices','Download PDF'].map((label,i)=><li key={label} aria-current={step===i+1?'step':undefined} className={step>i+1?'complete':''}><span>{step>i+1?'✓':i+1}</span>{label}</li>)}</ol>}
export function EstimateBar({total,href,label='Continue',disabled=false,onClick}:{total:string;href?:string;label?:string;disabled?:boolean;onClick?:()=>void}){return <div className="estimate-bar-space"><div className="estimate-mobile-bar"><div><small>Estimate subtotal</small><strong>{total}</strong><small>Subject to confirmation</small></div>{href&&!disabled?<a className="button yellow" href={href}>{label} →</a>:<button type="button" className="button yellow" disabled={disabled} onClick={onClick}>{label}</button>}</div></div>}
const prefix='finch-draft-v1:';
export function readDraft(key:string):any{try{const entry=JSON.parse(localStorage.getItem(prefix+key)||'null');if(!entry||!Number.isFinite(entry.at)||entry.at>Date.now()||Date.now()-entry.at>30*86400000)return null;return entry.value;}catch{return null;}}
export function saveDraft(key:string,value:unknown){try{localStorage.setItem(prefix+key,JSON.stringify({at:Date.now(),value}));}catch{}}
export function clearDraft(key:string){try{localStorage.removeItem(prefix+key);}catch{}}
