'use client';
import {useEffect,useState} from 'react';
export async function api(path:string,body?:unknown){const r=await fetch(`/api/${path}`,body===undefined?{}:{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});const data:any=await r.json();if(!r.ok)throw new Error(data.error||'Please try again.');return data;}
export function useCatalog(){const [data,setData]=useState<any>(null);const [error,setError]=useState('');useEffect(()=>{api('catalog').then(setData).catch(e=>setError(e.message));},[]);return {data,error};}

