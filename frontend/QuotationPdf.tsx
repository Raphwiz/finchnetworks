'use client';
import {useEffect,useRef,useState} from 'react';
export default function QuotationPdf({href}:{href:string}){
 const [url,setUrl]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState('');const objectUrl=useRef('');const active=useRef(true);
 useEffect(()=>{active.current=true;return()=>{active.current=false;if(objectUrl.current)URL.revokeObjectURL(objectUrl.current);};},[]);
 async function preview(){
  if(busy)return;
  setBusy(true);
  setError('');
  try{
   const requestUrl=new URL(href,window.location.origin);
   requestUrl.searchParams.set('format','base64');
   const response=await fetch(requestUrl);
   if(!response.ok)throw Error('Unable to load this quotation.');
   const {pdf}=await response.json();
   if(typeof pdf!=='string'||!pdf)throw Error('Quotation preview was empty.');
   const bytes=Uint8Array.from(atob(pdf),char=>char.charCodeAt(0));
   if(!active.current)return;
   if(objectUrl.current)URL.revokeObjectURL(objectUrl.current);
   objectUrl.current=URL.createObjectURL(new Blob([bytes],{type:'application/pdf'}));
   setUrl(objectUrl.current);
  }catch{
   if(active.current)setError('Could not open the preview. Try again or select Download PDF.');
  }finally{
   if(active.current)setBusy(false);
  }
 }

 return <div><div className="actions"><button type="button" className="button" disabled={busy} onClick={()=>url?setUrl(''):preview()}>{busy?'Loading PDF…':url?'Close PDF preview':'Preview quotation PDF'}</button><a className="textlink" href={href} onClick={()=>setError('')}>Download PDF</a></div>{error&&<p className="error" role="alert">{error}</p>}{url&&<section aria-label="Quotation PDF preview"><p><a href={url} target="_blank" rel="noreferrer">Open preview in a new tab</a></p><iframe title="Finch quotation PDF preview" src={url} style={{width:'100%',height:'75vh',minHeight:400,border:'1px solid #cbdde2',borderRadius:8}}/></section>}</div>;
}
