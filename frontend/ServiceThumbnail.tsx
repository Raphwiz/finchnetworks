import {Sun} from 'lucide-react';
import {serviceThumbnail} from '@/shared/service-plans';

export default function ServiceThumbnail({index,className=''}:{index:number;className?:string}){
 return <span className={`service-thumb ${className}`} aria-hidden="true" style={{
  ...serviceThumbnail(index),
  ...(index===6?{display:'inline-flex',alignItems:'center',justifyContent:'center',color:'#08796d'}:{}),
 }}>{index===6&&<Sun size={25} strokeWidth={2}/>}</span>;
}
