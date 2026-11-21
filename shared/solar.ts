import type {Calculation,Line} from './models';

export type SolarItem={id:string;name:string;unit:string;price:number|null;watts?:number;surgeWatts?:number;kwh?:number;maxAmps?:number;maxSurgeAmps?:number;maxPvWatts?:number;verified?:boolean};
export type SolarCatalog={revision?:number;headroom:number;sunHours:number;yieldFactor:number;inverterEfficiency:number;lithiumDod:number;tubularDod:number;lithiumRoundTrip?:number;tubularRoundTrip?:number;resourceVerified?:boolean;inverters:SolarItem[];lithium:SolarItem[];tubular:SolarItem[];panel:SolarItem;accessories:SolarItem[]};
const item=(id:string,name:string,unit='unit'):SolarItem=>({id,name,unit,price:null});
export const defaultSolarCatalog:SolarCatalog={
 headroom:20,sunHours:4,yieldFactor:.86,inverterEfficiency:.96,lithiumDod:.8,tubularDod:.5,lithiumRoundTrip:.92,tubularRoundTrip:.8,resourceVerified:false,
 inverters:[1000,2000,3000,5000,8000,10000].map(watts=>({...item('solar-inverter-'+watts,`48 V hybrid inverter allowance, ${watts/1000} kW`),watts,surgeWatts:watts*2,maxPvWatts:0,verified:false})),
 lithium:[{...item('solar-lithium','51.2 V lithium battery, 5.12 kWh allowance'),kwh:5.12,maxAmps:100,maxSurgeAmps:200}],
 tubular:[{...item('solar-tubular','12 V 200 Ah tubular battery allowance'),kwh:2.4,maxAmps:20,maxSurgeAmps:100}],
 panel:{...item('solar-panel','550 W solar panel allowance','panel'),watts:550},
 accessories:[item('solar-rail','Mount rail, 2.4 m allowance'),item('solar-clamp','Panel mounting clamp'),item('solar-pv-cable','PV cable allowance','metre'),item('solar-battery-cable','Battery cable allowance','metre'),item('solar-ac-cable','AC cable allowance','metre'),item('solar-dc-protection','PV DC isolation, breakers, fuses and surge protection allowance','set'),item('solar-battery-protection','Battery DC fuse, isolator and protection allowance','set'),item('solar-ac-protection','AC protection and changeover allowance','set'),item('solar-earth','Earthing and bonding allowance','set'),item('solar-connectors','PV connector and termination allowance','set'),item('solar-labour','Installation, testing and commissioning allowance','service')],
};

export function validateSolarCatalog(value:unknown):SolarCatalog{
 const c=structuredClone(value) as SolarCatalog;
 if(!c||typeof c!=='object')throw Error('Check solar equipment configuration.');
 c.lithiumRoundTrip??=.92;
 c.tubularRoundTrip??=.8;
 const number=(value:unknown,min:number,max:number)=>typeof value==='number'&&Number.isFinite(value)&&value>=min&&value<=max;
 if(!c||!number(c.headroom,20,100)||!number(c.sunHours,1,8)||!number(c.yieldFactor,.4,.95)||!number(c.inverterEfficiency,.6,.99)||!number(c.lithiumDod,.1,.95)||!number(c.tubularDod,.1,.6))throw Error('Check solar design assumptions. Headroom must be at least 20%.');
 if(!number(c.lithiumRoundTrip,.5,1)||!number(c.tubularRoundTrip,.4,1))throw Error('Check battery round-trip energy efficiency.');
 if(c.resourceVerified!==undefined&&typeof c.resourceVerified!=='boolean')throw Error('Check solar resource verification.');
 for(const key of ['inverters','lithium','tubular','accessories'] as const){
  if(!Array.isArray(c[key])||!c[key].length||c[key].length>20)throw Error('Check solar equipment profiles.');
 }
 const all=[...c.inverters,...c.lithium,...c.tubular,c.panel,...c.accessories];
 const ids=new Set<string>();
 for(const part of all){
  if(!part||typeof part.id!=='string'||!/^solar-[a-z0-9-]+$/.test(part.id)||ids.has(part.id)||typeof part.name!=='string'||!part.name.trim()||part.name.length>150||typeof part.unit!=='string'||!part.unit||part.unit.length>30||part.price!==null&&!number(part.price,0,100000000))throw Error('Check solar item names and prices.');
  ids.add(part.id);
  if(part.verified!==undefined&&typeof part.verified!=='boolean')throw Error('Check equipment verification.');
 }
 if(c.accessories.length!==defaultSolarCatalog.accessories.length||defaultSolarCatalog.accessories.some(item=>!c.accessories.some(part=>part.id===item.id)))throw Error('Keep all required accessory allowances.');
 for(const inverter of c.inverters)if(!number(inverter.watts,100,100000)||!number(inverter.surgeWatts,inverter.watts!,300000)||!number(inverter.maxPvWatts,0,200000))throw Error('Check inverter continuous, surge and maximum PV ratings. Use zero for an unconfirmed PV limit.');
 for(const battery of [...c.lithium,...c.tubular]){
  // Existing configured profiles use their continuous limit for surge until updated.
  battery.maxSurgeAmps??=battery.maxAmps;
  if(!number(battery.kwh,.1,100)||!number(battery.maxAmps,1,2000)||!number(battery.maxSurgeAmps,battery.maxAmps!,5000))throw Error('Check battery energy, continuous discharge and surge current ratings.');
 }
 if(!number(c.panel?.watts,50,1000))throw Error('Check panel wattage.');
 return c;
}

export function sizeSolar(answers:Record<string,string>,catalog:SolarCatalog){
 const c=validateSolarCatalog(catalog);
 const read=(key:string,max:number)=>{
  const raw=answers[key]??'';
  if(raw==='')return 0;
  const n=Number(raw);
  if(!Number.isFinite(n)||n<0||n>max)throw Error('Check solar input '+key+'.');
  return n;
 };
 const measuredDailyKwh=read('dailyKwh',2400);
 let runningWatts=read('extraWatts',100000);
 let dailyWh=runningWatts*read('extraHours',24);
 let hasMotor=false;
 const missing:string[]=[];
 const names=['Lights','TVs','Routers','Fridges','Computers','Pumps'];
 for(let index=0;index<6;index++){
  const quantity=read(`load${index}qty`,10000);
  if(!Number.isInteger(quantity))throw Error('Appliance quantities must be whole numbers.');
  const watts=read(`load${index}watts`,100000),hours=read(`load${index}hours`,24);
  if(!quantity)continue;
  if(!watts){missing.push(names[index]);continue;}
  if(!hours&&!measuredDailyKwh)missing.push(names[index]);
  runningWatts+=quantity*watts;
  dailyWh+=quantity*watts*hours;
  if(index===3||index===5)hasMotor=true;
 }
 if(read('extraWatts',100000)&&!read('extraHours',24)&&!measuredDailyKwh)missing.push('Other appliances');
 const direct=read('totalWatts',100000);
 if(direct){
  runningWatts=direct;
  hasMotor=false;
  missing.length=0;
  const hours=read('dailyHours',24);
  if(!hours&&!measuredDailyKwh)missing.push('Daily use for total load');
  dailyWh=direct*hours;
 }
 if(measuredDailyKwh)dailyWh=measuredDailyKwh*1000;
 if(dailyWh>runningWatts*24+.001)throw Error('Daily energy cannot exceed the entered full load running for 24 hours. Check watts and kWh.');
 const offGrid=answers.goal==='Off-grid power';
 const duration=offGrid?read('nightHours',24):read('backup',168);
 const nightWatts=offGrid?(answers.nightWatts===''||answers.nightWatts===undefined?runningWatts:read('nightWatts',100000)):0;
 const nightWh=nightWatts*duration;
 if(!runningWatts||!duration||missing.length)return {ready:false as const,reason:missing.length?`Enter wattage and daily use for: ${missing.join(', ')}.`:offGrid?'Enter your loads, daily usage and night-time operating hours. Night watts can be left blank to use the full running load.':'Enter your appliance loads (or total watts) and required backup duration.',calculation:{lines:[],subtotal:0,hasUnpriced:true,note:'Complete your power requirements to size a system.'} satisfies Calculation};
 if(offGrid&&(nightWatts>runningWatts||nightWh>dailyWh+.001))return {ready:false as const,reason:'Night-time use must fit within your total daily use. Check the night load, night hours and daily appliance hours.',calculation:{lines:[],subtotal:0,hasUnpriced:true,note:'Check day and night energy requirements.'} satisfies Calculation};
 const headroom=Math.max(20,c.headroom,read('headroom',100))/100;
 const factor=1+headroom;
 const designWatts=Math.ceil(runningWatts*factor);
 const explicitSurge=read('surgeWatts',300000);
 // The 20% allowance applies once to continuous load. Measured startup power
 // is a separate transient requirement, not a multiplier on every appliance.
 const requiredSurge=Math.ceil(Math.max(designWatts,explicitSurge));
 const backupWh=(offGrid?nightWh:runningWatts*duration)*factor;
 const nominalKwh=backupWh/1000/c.inverterEfficiency/(answers.battery==='Tubular'?c.tubularDod:c.lithiumDod);
 const daytimeWh=offGrid?Math.max(0,dailyWh-nightWh):dailyWh;
 const rechargeDays=read('rechargeDays',7)||1;
 const storageLoadWh=offGrid?nightWh:Math.max(Math.min(dailyWh,runningWatts*duration),runningWatts*duration/rechargeDays);
 const directSolarWh=offGrid?daytimeWh:Math.max(0,dailyWh-Math.min(dailyWh,runningWatts*duration));
 const roundTrip=answers.battery==='Tubular'?c.tubularRoundTrip!:c.lithiumRoundTrip!;
 // Convert AC demand to PV DC energy once. The DC yield factor excludes
 // inverter and battery losses, which are accounted for separately here.
 const pvEnergyWh=(directSolarWh+storageLoadWh/roundTrip)*factor/c.inverterEfficiency;
 const panelCount=Math.max(1,Math.ceil(pvEnergyWh/(c.sunHours*c.yieldFactor*c.panel.watts!)));
 const panelWatts=panelCount*c.panel.watts!;
 const inverter=[...c.inverters].sort((a,b)=>a.watts!-b.watts!).find(part=>part.watts!>=designWatts&&part.surgeWatts!>=requiredSurge);
 if(!inverter)return {ready:false as const,reason:'This load exceeds the configured inverter continuous or measured startup rating. Finch needs to select a suitable model.',calculation:{lines:[],subtotal:0,hasUnpriced:true,note:'Custom solar system design required.'} satisfies Calculation};
 const tubular=answers.battery==='Tubular';
 const batteries=tubular?c.tubular:c.lithium;
 const series=tubular?4:1;
 // Four 12 V tubular batteries form one 48 V string. Lithium profiles are 51.2 V modules.
 const voltage=tubular?48:51.2;
 const batteryLoadWatts=offGrid?nightWatts*factor:designWatts;
 const batterySurgeWatts=offGrid?Math.max(batteryLoadWatts,nightWatts>0?explicitSurge:0):requiredSurge;
 const current=batteryLoadWatts/voltage/c.inverterEfficiency;
 const surgeCurrent=batterySurgeWatts/voltage/c.inverterEfficiency;
 const candidates=batteries.map(battery=>({battery,strings:Math.max(Math.ceil(nominalKwh/(battery.kwh!*series)),Math.ceil(current/battery.maxAmps!),Math.ceil(surgeCurrent/battery.maxSurgeAmps!))}));
 const fullyPriced=candidates.every(candidate=>candidate.battery.price!==null);
 candidates.sort((a,b)=>{
  const costA=a.strings*series*(fullyPriced?a.battery.price!:a.battery.kwh!);
  const costB=b.strings*series*(fullyPriced?b.battery.price!:b.battery.kwh!);
  return costA-costB||a.strings*series*a.battery.kwh!-b.strings*series*b.battery.kwh!;
 });
 const {battery,strings}=candidates[0];
 const batteryCount=strings*series;
 const nominalBatteryKwh=batteryCount*battery.kwh!;
 // Solar serves daytime demand directly and recharges the overnight battery reserve.
 const pvRun=read('pvRun',200)||20, batteryRun=read('batteryRun',20)||2, acRun=read('acRun',200)||15;
 const quantities:Record<string,number>={
  'solar-rail':panelCount*2,'solar-clamp':panelCount*4,
  'solar-pv-cable':Math.ceil(2*pvRun*1.2),'solar-battery-cable':Math.ceil(2*batteryRun*strings*1.2),
  'solar-ac-cable':Math.ceil(acRun*1.2),'solar-dc-protection':1,'solar-battery-protection':strings,
  'solar-ac-protection':1,'solar-earth':1,'solar-connectors':panelCount,'solar-labour':1,
 };
 const line=(part:SolarItem,quantity:number):Line=>({id:part.id,name:part.name,quantity,unit:part.unit,unitPrice:part.price,total:part.price===null?null:Math.round(part.price*quantity*100)/100});
 const lines=[line(inverter,1),line(battery,batteryCount),line(c.panel,panelCount),...c.accessories.map(part=>line(part,quantities[part.id]))].filter(line=>line.quantity>0);
 const reviewReasons:string[]=[];
 if(!explicitSurge&&(hasMotor||direct>0||Number(answers.extraWatts)>0))reviewReasons.push('Startup demand is unverified. Check motor/compressor starting VA, power factor and surge duration before choosing the final inverter.');
 if(!c.resourceVerified)reviewReasons.push('Peak sun hours, temperature and shading assumptions need site-specific design-month validation.');
 if(!inverter.verified||!battery.verified||!c.panel.verified)reviewReasons.push('Generic equipment profiles need confirmation against the actual manufacturer datasheets.');
 if(!inverter.maxPvWatts)reviewReasons.push('The inverter/MPPT PV input power limit has not been confirmed.');
 else if(panelWatts>inverter.maxPvWatts){
  reviewReasons.push('The energy-sized array exceeds the selected inverter PV limit. Select compatible solar charging or another verified inverter; do not connect this array as shown.');
  lines.push({id:'solar-additional-mppt',name:'Additional or revised solar charging — Finch specification required',quantity:1,unit:'set',unitPrice:null,total:null});
 }
 reviewReasons.push('PV series/parallel layout, cold Voc, hot Vmp, input current, charging current, cable sizing and mounting are subject to installation design.');
 const energyNote=offGrid?`Off-grid batteries cover ${nightWatts} W for ${duration} night hours (${(nightWh/1000).toFixed(2)} kWh before allowance). Solar serves ${(daytimeWh/1000).toFixed(2)} kWh of daytime loads and recharges the night reserve.`:`Backup reserve recovery is designed over ${rechargeDays} solar day(s). Stored energy already in the daily usage is counted once.`;
 const calculation:Calculation={lines,subtotal:Math.round(lines.reduce((sum,line)=>sum+(line.total??0),0)*100)/100,hasUnpriced:lines.some(line=>line.unitPrice===null),note:`Budget sizing with ${headroom*100}% explicit load allowance. ${c.sunHours} peak sun hours/day; ${c.yieldFactor*100}% DC PV derate; ${c.inverterEfficiency*100}% inverter efficiency; ${roundTrip*100}% battery round-trip efficiency. Battery usable depth: ${(tubular?c.tubularDod:c.lithiumDod)*100}%. Each loss factor is applied once. Required PV: ${(pvEnergyWh/c.sunHours/c.yieldFactor/1000).toFixed(2)} kWp before whole-panel rounding. ${energyNote} Generic equipment, rail, cable, protection and labour entries are budget allowances. ${reviewReasons.join(' ')} Taxes and site work are confirmed in the quotation.`};
 return {ready:true as const,runningWatts,designWatts,requiredSurge,dailyKwh:dailyWh/1000,daytimeKwh:daytimeWh/1000,nightKwh:nightWh/1000,nightWatts,headroom:headroom*100,inverter,battery,batteryCount,strings,nominalBatteryKwh,requiredBatteryKwh:nominalKwh,panelCount,panelWatts,duration,offGrid,requiredPvWatts:pvEnergyWh/c.sunHours/c.yieldFactor,pvEnergyWh,rechargeDays,reviewReasons,calculation};
}
