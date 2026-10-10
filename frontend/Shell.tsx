'use client';
import {useEffect,useState} from 'react';
import {usePathname} from 'next/navigation';
import {AccountLink} from './Account';
import Footer from './Footer';
import {ArrowUpRight,Menu,ShoppingBag,X} from 'lucide-react';
import {cartBadge,useCartCount} from './cart-store';
const links=[['/','Home'],['/services','Services'],['/projects','Our work'],['/products','Shop'],['/cart','Cart'],['/estimate','Build an estimate']] as const;
function current(path:string,href:string){return href==='/'?path==='/':path===href||path.startsWith(`${href}/`);}
export function Header({compact=false}:{compact?:boolean}){
  const path=usePathname()||'/';
  const [open,setOpen]=useState(false);
  const [hidden,setHidden]=useState(false);
  const count=useCartCount();
  const cartLabel=count?`Cart, ${count} ${count===1?'item':'items'}`:'Cart';
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
    const onPointer=(event:PointerEvent)=>{
      const target=event.target;
      if(!(target instanceof Node))return;
      const nav=document.getElementById('site-nav');
      const toggle=document.querySelector('.nav-toggle');
      if(nav?.contains(target)||toggle?.contains(target))return;
      setOpen(false);
    };
    window.addEventListener('keydown',onKey);
    document.addEventListener('pointerdown',onPointer);
    return()=>{window.removeEventListener('keydown',onKey);document.removeEventListener('pointerdown',onPointer);};
  },[open]);
  return <>
    {!compact&&<div className="topbar">SECURE. CONNECT. EMPOWER.<span>A Finch Holdings company</span></div>}
    <div className={`site-head${open?' open':''}${hidden?' concealed':''}`}>
      <header className="header">
        <a href="/" className="brand"><img src="/finch-logo.png" alt="Finch Networks Ltd"/></a>
        <a className="header-cart" href="/cart" aria-label={cartLabel}><ShoppingBag size={20}/>{count>0&&<span className="cart-count" aria-hidden="true">{cartBadge(count)}</span>}</a>
        <button type="button" className="nav-toggle" aria-expanded={open} aria-controls="site-nav" onClick={()=>{setHidden(false);setOpen(value=>!value);}}>{open?<X size={22}/>:<Menu size={22}/>}<span className="sr-only">{open?'Close menu':'Open menu'}</span></button>
        <nav id="site-nav" aria-label="Main">{links.map(([href,label])=><a href={href} key={href} aria-current={current(path,href)?'page':undefined} aria-label={href==='/cart'?cartLabel:undefined}>{label}{href==='/cart'&&count>0&&<span className="cart-count" aria-hidden="true">{cartBadge(count)}</span>}</a>)}<AccountLink/></nav>
        <a className="button dark" href="/contact" aria-current={path==='/contact'?'page':undefined}>Let's talk <ArrowUpRight size={18}/></a>
      </header>
    </div>
  </>;
}
export function Shell({children}:{children:React.ReactNode}){return <><Header compact/><main className="wrap inner">{children}</main><Footer/></>}
export function PageHeading({label,title,description}:{label:string;title:string;description:string}){return <div className="page-heading"><div className="eyebrow">{label}</div><h1>{title}</h1><p>{description}</p></div>}
