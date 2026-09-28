import {AccountLink} from './Account';
import Footer from './Footer';
import {ArrowUpRight} from 'lucide-react';
export function Header(){return <><div className="topbar">SECURE. CONNECT. EMPOWER.<span>A Finch Holdings company</span></div><header className="header"><a href="/" className="brand"><img src="/finch-logo.png" alt="Finch Networks Ltd"/></a><nav><a href="/">Home</a><a href="/services">Services</a><a href="/projects">Our work</a><a href="/products">Shop</a><a href="/cart">Cart</a><a href="/estimate">Build an estimate</a><AccountLink/></nav><a className="button dark" href="/contact">Let's talk <ArrowUpRight size={18}/></a></header></>}
export function Shell({children}:{children:React.ReactNode}){return <><Header/><main className="wrap inner">{children}</main><Footer/></>}
export function PageHeading({label,title,description}:{label:string;title:string;description:string}){return <div className="page-heading"><div className="eyebrow">{label}</div><h1>{title}</h1><p>{description}</p></div>}
