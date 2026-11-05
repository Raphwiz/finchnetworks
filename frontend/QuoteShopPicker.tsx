'use client';
import {useState} from 'react';
import {useCatalog} from './api';
import {money,type Product} from '@/shared/models';
type Line={name:string;quantity:number;unitPrice:number;labour:boolean};
export default function QuoteShopPicker({onAdd,disabled=false}:{onAdd:(line:Line)=>void;disabled?:boolean}){
 const [open,setOpen]=useState(false);
 return <div><button type="button" className="button yellow" disabled={disabled} onClick={()=>setOpen(!open)}>{open?'Close shop items':'Add shop item'}</button>{open&&<ShopItems onAdd={onAdd} disabled={disabled}/>}</div>;
}
function ShopItems({onAdd,disabled}:{onAdd:(line:Line)=>void;disabled:boolean}){
 const {data,error}=useCatalog();const [search,setSearch]=useState(''),[message,setMessage]=useState('');
 const products:Product[]=(data?.products||[]).filter((p:Product)=>p.published&&p.featured&&`${p.name} ${p.description} ${p.category}`.toLowerCase().includes(search.trim().toLowerCase()));
 return <section className="panel" aria-label="Shop items"><label>Search shop items<input type="search" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Product name or model"/></label>{message&&<p role="status">{message}</p>}{error?<p role="alert">{error}</p>:!data?<p>Loading shop items…</p>:<><p>Select a product to copy its current shop price into the quotation. You can adjust it afterwards.</p><div style={{maxHeight:320,overflowY:'auto'}}>{products.map(p=><div key={p.id} style={{display:'flex',gap:12,alignItems:'center',justifyContent:'space-between',padding:'12px 0',borderBottom:'1px solid #d8e5e9'}}><div><strong>{p.name}</strong><div>{p.price===null?'Price to confirm':money(p.price)} / {p.unit}</div></div><button type="button" className="button yellow" disabled={disabled||p.price===null} onClick={()=>{onAdd({name:p.name,quantity:1,unitPrice:p.price!,labour:false});setMessage(`${p.name} added to quotation.`);}}>Add</button></div>)}</div>{!products.length&&<p>No matching shop items.</p>}<p>For items without a price, use Add item and enter the agreed price.</p></>}</section>;
}
