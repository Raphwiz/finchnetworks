'use client';
import {ArrowUpRight} from 'lucide-react';
import {Shell,PageHeading} from './Shell';
import {serviceItems} from '@/shared/models';
import {servicePaths} from '@/shared/service-plans';
export default function ServiceChooser(){return <Shell><div className="cctv-compact-heading"><PageHeading label="BUILD AN ESTIMATE" title="What would you like to plan?" description="Choose a service to see the right options for your project."/></div><div className="cards services-grid estimate-service-choices">{serviceItems.map((s,i)=><a className="service-card" data-category={s.name} href={servicePaths[i]} key={s.id}><div className="service-card-heading"><span className="service-thumb service-card-thumb" aria-hidden="true" style={{backgroundPosition:`${i*25}% center`}}/><ArrowUpRight size={22}/></div><h3>{s.name}</h3><p>{s.description}</p><span className="textlink">Start planning <ArrowUpRight size={18}/></span></a>)}</div><div className="estimate-other"><a href="/estimate?custom=1" className="textlink">Build a product-only request <ArrowUpRight size={18}/></a><a href="/contact" className="textlink">Not sure? Talk to Finch <ArrowUpRight size={18}/></a></div></Shell>}
