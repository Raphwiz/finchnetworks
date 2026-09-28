'use client';
import {useEffect} from 'react';

export default function ReloadScrollReset(){
  useEffect(()=>{
    const navigation=performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming|undefined;
    if(navigation?.type!=='reload')return;
    const previous=history.scrollRestoration;
    history.scrollRestoration='manual';
    const restore=()=>{history.scrollRestoration=previous;};
    const top=()=>window.scrollTo({top:0,left:0,behavior:'instant'});
    const onShow=(event:PageTransitionEvent)=>{if(!event.persisted)top();};
    top();
    const frame=requestAnimationFrame(top);
    window.addEventListener('load',top,{once:true});
    window.addEventListener('pageshow',onShow);
    window.addEventListener('pagehide',restore);
    return ()=>{
      cancelAnimationFrame(frame);
      window.removeEventListener('load',top);
      window.removeEventListener('pageshow',onShow);
      window.removeEventListener('pagehide',restore);
      history.scrollRestoration=previous;
    };
  },[]);
  return null;
}
