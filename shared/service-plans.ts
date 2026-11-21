export const servicePaths=['/services/cctv','/services/electric-fences','/services/automatic-gates','/services/office-networking','/services/starlink','/services/access-control','/services/solar'];
export function servicePath(id:string){const n=Number(id.replace('service-',''));return /^service-[0-6]$/.test(id)?servicePaths[n]:null;}
type Field={key:string;label:string;options?:string[];max?:number;unit?:string};
export const planDefinitions={
'solar':{index:6,title:'Plan my solar system',description:'Solar installation and backup power for your property.',fields:[
 {key:'goal',label:'What do you need?',options:['Backup during power outages','Reduce electricity bills','Off-grid power','CCTV and networking backup']},
 {key:'property',label:'Property type',options:['Home','Business / office','School / institution','Farm / remote site','Other']},
 {key:'grid',label:'Grid electricity',options:['Available','Not available','Unreliable','Not sure']},
 {key:'mounting',label:'Panel mounting space',options:['Roof','Ground','Not sure - site survey needed']},
 {key:'approach',label:'Sizing assistance',options:['I can list my appliances','Help me size my system']},
 {key:'backup',label:'Required backup duration (hours)',max:168,unit:'hours'},
 ...['Lights','TVs','Routers','Fridges','Computers','Pumps'].flatMap((name,index)=>[
  {key:`load${index}qty`,label:`${name} quantity`,max:10000,unit:'items'},
  {key:`load${index}watts`,label:'Power per appliance (watts)',max:100000,unit:'watts'},
  {key:`load${index}hours`,label:'Daily use (hours)',max:24,unit:'hours'},
 ]),
 {key:'battery',label:'Battery preference',options:['Lithium','Tubular']},
 {key:'headroom',label:'Additional capacity allowance (%)',max:100,unit:'percent'},
 {key:'totalWatts',label:'Total simultaneous load override (W)',max:100000,unit:'watts'},
 {key:'dailyHours',label:'Daily use for total load (hours)',max:24,unit:'hours'},
 {key:'extraWatts',label:'Other appliances combined load (W)',max:100000,unit:'watts'},
 {key:'extraHours',label:'Other appliances daily use (hours)',max:24,unit:'hours'},
 {key:'surgeWatts',label:'Measured startup load (W, optional)',max:300000,unit:'watts'},
 {key:'pvRun',label:'Panels to inverter one-way cable route (metres)',max:200,unit:'metres'},
 {key:'batteryRun',label:'Battery to inverter one-way cable route (metres)',max:20,unit:'metres'},
 {key:'acRun',label:'Inverter to distribution board cable route (metres)',max:200,unit:'metres'},
 {key:'nightWatts',label:'Night-time simultaneous load (W)',max:100000,unit:'watts'},
 {key:'nightHours',label:'Night-time operating duration (hours)',max:24,unit:'hours'},
]},

'access-control':{index:5,title:'Plan your access and attendance system.',description:'Tell us how you want to manage visitors, door entry and staff attendance.',fields:[{key:'work',label:'What do you need?',options:['New installation','Upgrade existing system','Repair / maintenance']},{key:'system',label:'System required',options:['Intercom / video doorbell','Door access control','Staff attendance system','Combined access and attendance','Multiple systems - describe below','Not sure - advise me']},{key:'property',label:'Property type',options:['Office / business','Home','Apartments','School / institution','Other']},{key:'doors',label:'Doors or entry points',max:10000,unit:'entry points'},{key:'users',label:'Approximate number of users / staff',max:100000,unit:'users'},{key:'identification',label:'Preferred entry / attendance method',options:['Fingerprint','Facial recognition','Access cards','PIN / keypad','Multiple methods','Not required - intercom only','Advise me']},{key:'intercom',label:'Intercom preference',options:['Not required','Audio intercom','Video intercom','Video doorbell','Advise me']},{key:'reporting',label:'Attendance reporting',options:['Not required','Basic attendance reports','Payroll integration - compatibility to confirm','Advise me']}]},
'electric-fences':{index:1,title:'Plan your electric fence.',description:'Tell us about your perimeter so we can prepare a suitable installation proposal.',fields:[{key:'work',label:'What do you need?',options:['New installation','Repair existing fence','Upgrade existing fence']},{key:'mounting',label:'Fence location',options:['On an existing wall','Freestanding fence','Not sure - advise me']},{key:'length',label:'Approximate perimeter length',max:100000,unit:'metres'},{key:'gates',label:'Number of gates',max:1000,unit:'gates'},{key:'power',label:'Power at the site',options:['Mains power available','Solar required','Not sure - advise me']}]},
'automatic-gates':{index:2,title:'Plan your automatic gate.',description:'Describe your gate and how you want to use it.',fields:[{key:'work',label:'What do you need?',options:['Automate an existing gate','New gate and automation','Repair / replace gate opener']},{key:'style',label:'Gate style',options:['Sliding gate','Swing gate','Not sure - advise me']},{key:'gates',label:'Number of gates',max:100,unit:'gates'},{key:'width',label:'Approximate gate opening',max:100,unit:'metres'},{key:'access',label:'Preferred access',options:['Remote controls','Remote controls and keypad','Remote controls and intercom','Advise me']},{key:'power',label:'Power at the gate',options:['Power available','Power needs to be installed','Not sure']}]},
'office-networking':{index:3,title:'Plan your office network.',description:'Tell us about your office, users and connection needs.',fields:[{key:'work',label:'What do you need?',options:['New office network','Expand an existing network','Repair / troubleshoot']},{key:'connection',label:'Connections required',options:['Wired connections','Wi-Fi','Wired and Wi-Fi']},{key:'users',label:'Approximate number of users',max:100000,unit:'users'},{key:'points',label:'Wired network points',max:10000,unit:'points'},{key:'floors',label:'Number of floors',max:200,unit:'floors'},{key:'internet',label:'Internet connection',options:['Already available','New connection needed','Not sure - advise me']}]},
'starlink':{index:4,title:'Starlink installation in Meru',description:'Plan your Starlink setup in Meru. Tell us about your kit, mounting location and Wi-Fi needs.',fields:[{key:'equipment',label:'Do you already have a kit?',options:['I need equipment and installation','I have a kit - installation only','Repair / relocate existing installation']},{key:'property',label:'Property type',options:['Home','Office / business','Farm / remote site','Other']},{key:'mount',label:'Preferred mounting location',options:['Roof','Wall / pole','Ground-level location','Not sure - site assessment needed']},{key:'distribution',label:'Connectivity inside the property',options:['Connect to existing network','Wi-Fi setup needed','Network cabling needed','Advise me']}]}
} satisfies Record<string,{index:number;title:string;description:string;fields:Field[]}>;
export type PlanKey=keyof typeof planDefinitions;
export type ServicePlan={service:PlanKey;answers:Record<string,string>;notes:string};
export function validatePlan(value:unknown):ServicePlan{if(!value||typeof value!=='object')throw new Error('Choose a service plan.');const p=value as ServicePlan;if(!Object.hasOwn(planDefinitions,p.service)||!p.answers||typeof p.answers!=='object'||typeof p.notes!=='string'||p.notes.length>2000)throw new Error('Check your service details.');const answers:Record<string,string>={};for(const f of planDefinitions[p.service].fields as Field[]){const v=p.answers[f.key]??(p.service==='solar'?(f.options?.[0]??''):undefined);if(typeof v!=='string'||v.length>150)throw new Error(`Check ${f.label.toLowerCase()}.`);if(p.service==='solar'&&f.key==='headroom'&&v!==''&&Number(v)<20)throw new Error('Load allowance must be at least 20%.');if(f.options&&!f.options.includes(v))throw new Error(`Choose ${f.label.toLowerCase()}.`);if(!f.options&&v!==''&&(!Number.isFinite(Number(v))||Number(v)<0||Number(v)>(f.max||100000)||(!['metres','hours','watts','percent'].includes(f.unit||'')&&!Number.isInteger(Number(v)))))throw new Error(`Enter a valid ${f.label.toLowerCase()}.`);answers[f.key]=v;}return {service:p.service,answers,notes:p.notes.trim()};}
export function planSummary(p:ServicePlan){const d=planDefinitions[p.service];const energy=p.service==='solar'?solarEnergySummary(p.answers):'';return (d.fields as Field[]).filter(f=>p.service!=='solar'||((p.answers[f.key]||f.options)&&!(Number(p.answers.totalWatts)>0&&f.key.startsWith('load')))).map(f=>`${f.label}: ${p.answers[f.key]||'To be assessed'}${p.answers[f.key]&&f.unit?' '+f.unit:''}`).join('\n')+(energy?'\n'+energy:'')+(p.notes?'\nAdditional details: '+p.notes:'');}

export function serviceThumbnail(index:number){if(index===6)return {backgroundImage:'linear-gradient(135deg, #f8d457, #f7edb8)',backgroundPosition:'center'};return index===5?{backgroundImage:"url('/access-control.svg')",backgroundSize:'cover',backgroundPosition:'center'}:{backgroundPosition:`${index*25}% center`};}

export function solarEnergySummary(answers:Record<string,string>){
 if(Number(answers.totalWatts)>0&&Number(answers.dailyHours)>0)return `Indicative daily energy: ${(Number(answers.totalWatts)*Number(answers.dailyHours)/1000).toFixed(2)} kWh. Final system sizing uses the configured allowance and equipment limits.`;
 let dailyWh=Number(answers.extraWatts||0)*Number(answers.extraHours||0);
 let complete=dailyWh>0?1:0;
 let incomplete=false;
 for(let index=0;index<6;index++){
  const quantity=Number(answers[`load${index}qty`]);
  if(!quantity)continue;
  const watts=Number(answers[`load${index}watts`]);
  const hours=Number(answers[`load${index}hours`]);
  if(!watts||!hours){incomplete=true;continue;}
  dailyWh+=quantity*watts*hours;
  complete++;
 }
 return complete?`Indicative daily energy for fully specified appliances: ${(dailyWh/1000).toFixed(2)} kWh. ${incomplete?'Some appliances still need assessment. ':''}Finch will confirm actual consumption, startup loads and system sizing.`:'Energy use and system sizing: Finch assessment required.';
}
