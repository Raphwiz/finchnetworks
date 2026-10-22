'use client';
import {useEffect,useState} from 'react';
export async function api(path:string,body?:unknown){const r=await fetch(`/api/${path}`,body===undefined?{}:{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});const data:any=await r.json();if(!r.ok)throw new Error(data.error||'Please try again.');return data;}
export function useCatalog(initialData?:any){const [data,setData]=useState<any>(initialData??null);const [error,setError]=useState('');useEffect(()=>{if(initialData){setData(initialData);return;}let active=true;api('catalog').then(value=>{if(active)setData(value)}).catch(e=>{if(active)setError(e.message)});return()=>{active=false};},[initialData]);return {data,error};}

