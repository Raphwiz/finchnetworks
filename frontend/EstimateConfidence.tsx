'use client';
import {useEffect,useState} from 'react';
import Image from 'next/image';
import {ArrowUpRight,Star} from 'lucide-react';
import {api} from './api';
import type {Project} from '@/shared/models';
type Review={id:string;name:string;service:string;rating:number;review:string};
function matches(value:string,category?:string){if(!category)return false;const groups=[/cctv|camera|surveillance/i,/electric.*fenc|perimeter/i,/gate/i,/network|cabling|wi-fi|wifi/i,/starlink/i,/access|intercom|attendance/i];const group=groups.find(g=>g.test(category));return group?group.test(value):value.toLowerCase()===category.toLowerCase();}
export default function EstimateConfidence({category}:{category?:string}){
 const [projects,setProjects]=useState<Project[]>([]),[reviews,setReviews]=useState<Review[]>([]);
 useEffect(()=>{let active=true;api('catalog').then(d=>{if(active)setProjects((d.projects||[]).filter((p:Project)=>p.published));}).catch(()=>{});api('commerce/public').then(d=>{if(active)setReviews(d.reviews||[]);}).catch(()=>{});return()=>{active=false;};},[]);
 const relevant=projects.filter(p=>matches(p.category,category));const jobs=(relevant.length?relevant:projects).slice(0,2);const relatedReviews=reviews.filter(r=>matches(r.service,category));const feedback=(relatedReviews.length?relatedReviews:reviews).slice(0,2);
 if(!jobs.length&&!feedback.length)return null;
 return <section className="estimate-confidence" aria-label="Completed work and customer feedback"><div className="confidence-heading"><div><p className="eyebrow">SEE OUR WORK</p><h2>{relevant.length?'Similar work completed by Finch':'Recent work completed by Finch'}</h2><p>Explore our installations as you plan your project.</p></div><a href="/projects" className="textlink">View all completed jobs <ArrowUpRight size={17}/></a></div>{jobs.length>0&&<div className="confidence-jobs">{jobs.map(p=><a href="/projects" className="confidence-job" key={p.id}>{p.image&&<Image src={p.image} alt={p.title} width={400} height={260} sizes="(max-width: 600px) 110px, 180px" quality={75}/>}<div><small>{p.category}{p.location&&p.location!=='Town'?` · ${p.location}`:''}</small><h3>{p.title}</h3><p>{p.description}</p><span>View installation photos <ArrowUpRight size={15}/></span></div></a>)}</div>}{feedback.length>0&&<div className="confidence-feedback"><h3>What our customers say</h3><div>{feedback.map(r=><figure key={r.id}><div className="confidence-stars" aria-label={`${r.rating} out of 5 stars`}>{Array.from({length:5},(_,i)=><Star key={i} size={15} aria-hidden="true" fill={i<r.rating?'currentColor':'none'}/>)}</div><blockquote>{r.review}</blockquote><figcaption><strong>{r.name}</strong>{r.service&&<span> · {r.service}</span>}</figcaption></figure>)}</div></div>}</section>;
}
