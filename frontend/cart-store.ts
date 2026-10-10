'use client';
import {useEffect,useState} from 'react';
export type CartLine={id:string;quantity:number};
const key='finch-cart';
export function readCart():CartLine[]{
  try{
    const raw=JSON.parse(localStorage.getItem(key)||'[]');
    if(!Array.isArray(raw))return [];
    return raw.flatMap(item=>{
      const quantity=Number(item?.quantity);
      if(!item||typeof item.id!=='string'||!Number.isFinite(quantity)||quantity<1)return [];
      return [{id:item.id,quantity:Math.min(200,Math.floor(quantity))}];
    });
  }catch{return [];}
}
export function cartCount(items:CartLine[]){return items.reduce((total,item)=>total+item.quantity,0);}
export function cartBadge(count:number){return count>99?'99+':String(count);}
function notify(){window.dispatchEvent(new Event('finch-cart'));}
export function saveCart(items:CartLine[]){localStorage.setItem(key,JSON.stringify(items));notify();}
export function clearCart(){localStorage.removeItem(key);notify();}
export function useCartCount(){
  const [count,setCount]=useState(0);
  useEffect(()=>{
    const sync=()=>setCount(cartCount(readCart()));
    sync();
    window.addEventListener('finch-cart',sync);
    window.addEventListener('storage',sync);
    return()=>{window.removeEventListener('finch-cart',sync);window.removeEventListener('storage',sync);};
  },[]);
  return count;
}
