'use client';
import {usePathname} from 'next/navigation';
import {AccountLink} from './Account';
import Footer from './Footer';
import {ArrowUpRight} from 'lucide-react';
const links=[['/' ,'Home'],['/services','Services'],['/projects','Our work'],['/products','Shop'],['/cart','Cart'],['/estimate','Build an estimate']] as const;
function current(path:string,href:string){return href==='/'?path==='/':path===href||path.startsWith(`${href}/`);}
export function Header({compact=false}:{compact?:boolean}){const path=usePathname()||'/';return <div className={compact?'site-head compact':'site-head'}><div className="topbar">SECURE. CONNECT. EMPOWER.<span>A Finch Holdings company</span></div><header className="header"><a href="/" className="brand"><img src="/finch-logo.png" alt="Finch Networks Ltd"/></a><nav aria-label="Main">{links.map(([href,label])=><a href={href} key={href} aria-current={current(path,href)?'page':undefined}>{label}</a>)}<AccountLink/></nav><a className="button dark" href="/contact" aria-current={path==='/contact'?'page':undefined}>Let's talk <ArrowUpRight size={18}/></a></header></div>}
export function Shell({children}:{children:React.ReactNode}){return <><Header compact/><main className="wrap inner">{children}</main><Footer/></>}
export function PageHeading({label,title,description}:{label:string;title:string;description:string}){return <div className="page-heading"><div className="eyebrow">{label}</div><h1>{title}</h1><p>{description}</p></div>}
