'use client';
import {useEffect,useState} from 'react';
import {usePathname} from 'next/navigation';
import {AccountLink} from './Account';
import Footer from './Footer';
import {ArrowUpRight,Menu,X} from 'lucide-react';
const links=[['/','Home'],['/services','Services'],['/projects','Our work'],['/products','Shop'],['/cart','Cart'],['/estimate','Build an estimate']] as const;
function current(path:string,href:string){return href==='/'?path==='/':path===href||path.startsWith(`${href}/`);}
export function Header({compact=false}:{compact?:boolean}){
  const path=usePathname()||'/';
  const [open,setOpen]=useState(false);
  const [hidden,setHidden]=useState(false);
  useEffect(()=>{setOpen(false);},[path]);
  useEffect(()=>{
    let last=window.scrollY;
    const onScroll=()=>{
      const y=window.scrollY;
      if(Math.abs(y-last)<8)return;
      const down=y>last;
      last=y;
      if(open)return;
      setHidden(current=>current===(down&&y>72)?current:down&&y>72);
    };
    window.addEventListener('scroll',onScroll,{passive:true});
    return()=>window.removeEventListener('scroll',onScroll);
  },[open]);
  useEffect(()=>{
    if(!open)return;
    const onKey=(event:KeyboardEvent)=>{if(event.key==='Escape')setOpen(false);};
    window.addEventListener('keydown',onKey);
    return()=>window.removeEventListener('keydown',onKey);
  },[open]);
  return <>
    {!compact&&<div className="topbar">SECURE. CONNECT. EMPOWER.<span>A Finch Holdings company</span></div>}
    <div className={`site-head${open?' open':''}${hidden?' concealed':''}`}>
      <header className="header">
        <a href="/" className="brand"><img src="/finch-logo.png" alt="Finch Networks Ltd"/></a>
        <button type="button" className="nav-toggle" aria-expanded={open} aria-controls="site-nav" onClick={()=>{setHidden(false);setOpen(value=>!value);}}>{open?<X size={22}/>:<Menu size={22}/>}<span className="sr-only">{open?'Close menu':'Open menu'}</span></button>
        <nav id="site-nav" aria-label="Main">{links.map(([href,label])=><a href={href} key={href} aria-current={current(path,href)?'page':undefined}>{label}</a>)}<AccountLink/></nav>
        <a className="button dark" href="/contact" aria-current={path==='/contact'?'page':undefined}>Let's talk <ArrowUpRight size={18}/></a>
      </header>
    </div>
  </>;
}
export function Shell({children}:{children:React.ReactNode}){return <><Header compact/><main className="wrap inner">{children}</main><Footer/></>}
export function PageHeading({label,title,description}:{label:string;title:string;description:string}){return <div className="page-heading"><div className="eyebrow">{label}</div><h1>{title}</h1><p>{description}</p></div>}
