import {database} from './database';
import {defaultSolarCatalog,sizeSolar,validateSolarCatalog,type SolarCatalog} from '@/shared/solar';
import {calculate} from './pricing';
import {products} from './catalog';
import {planDefinitions,type ServicePlan} from '@/shared/service-plans';

export async function solarCatalog():Promise<SolarCatalog>{
 const row=await database().prepare("SELECT data FROM settings WHERE id='solar-sizing'").first<{data:string}>();
 return row?validateSolarCatalog(JSON.parse(row.data)):structuredClone(defaultSolarCatalog);
}
export async function solarEstimate(plan:ServicePlan){return sizeSolar(plan.answers,await solarCatalog());}
export async function planCalculation(plan:ServicePlan){
 if(plan.service!=='solar')return calculate([{id:`service-${planDefinitions[plan.service].index}`,quantity:1}],await products());
 const result=await solarEstimate(plan);
 return result.ready?result.calculation:calculate([{id:'service-6',quantity:1}],[]);
}
