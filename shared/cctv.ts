import type {Product} from './models';
export type CctvConfig={system:'hd'|'ip';cameras:number;channels:4|8|16;resolution:2|4;audio:boolean;storage:1|2|4;monitor:boolean;backup:boolean};
export const defaultCctv:CctvConfig={system:'ip',cameras:4,channels:4,resolution:2,audio:false,storage:1,monitor:false,backup:false};
const part=(id:string,name:string,unit='item',description='Final equipment model and compatibility will be confirmed by Finch.'):Product=>({id:`cctv-${id}`,name,unit,description,category:'CCTV & repairs',price:null,image:'',published:true,availability:'Enquire for availability'});
export const cctvProducts:Product[]=[
...(['hd','ip'] as const).flatMap(system=>[2,4].flatMap(mp=>[false,true].map(audio=>part(`camera-${system}-${mp}-${audio?'audio':'silent'}`,`${mp}MP ${system==='ip'?'IP':'HD'} camera ${audio?'with audio':'without audio'}`,'camera',`${system==='ip'?'NVR-based IP':'DVR/XVR-based HD'} camera option. ${audio?'Audio requires a compatible recorder and camera.':'Video-only option.'} Exact model to be confirmed.`)))),
...[4,8,16].flatMap(ch=>[part(`nvr-${ch}`,`${ch}-channel PoE NVR`,'recorder','NVR with integrated PoE camera ports. Model, bandwidth, resolution and audio support to be confirmed.'),part(`xvr-${ch}`,`${ch}-channel DVR / XVR`,'recorder','HD recorder. The selected camera format, resolution and audio support must match the final recorder model.')]),
...[1,2,4].map(tb=>part(`hdd-${tb}`,`${tb}TB surveillance hard drive`,'drive','Recording duration depends on camera count, resolution, bitrate and recording schedule.')),
part('cat6','CAT6 cable supply','lot','Cable length and final price to be confirmed after measuring the site.'),
part('rg59','RG59 coaxial cable with power','lot','Cable length and final price to be confirmed after measuring the site.'),
part('rj45','RJ45 connector','connector'),part('bnc','BNC connector','connector'),part('dc','DC power connector','connector'),
part('power','CCTV power supply','supply','Power rating and distribution to suit the final camera count and cable distances.'),
part('box','Camera junction box','box'),part('installation','Camera installation & setup','camera','Installation and configuration charge per camera. Site-specific works are quoted separately.'),
part('monitor','Viewing monitor','monitor'),part('ups','Recorder backup power / UPS','unit','Size and backup duration to be confirmed against the final connected load.')];
export function cctvSummary(c:CctvConfig){return `${c.cameras} cameras · ${c.system==='ip'?'IP / NVR':'HD / DVR-XVR'} · ${c.channels} channels · ${c.resolution}MP · ${c.audio?'With audio':'Without audio'} · ${c.storage}TB storage`;}

export function validateCctv(value:unknown):CctvConfig{if(!value||typeof value!=='object')throw new Error('Choose a CCTV configuration.');const c=value as CctvConfig;if(!['hd','ip'].includes(c.system)||!Number.isInteger(c.cameras)||c.cameras<1||c.cameras>16||![4,8,16].includes(c.channels)||c.cameras>c.channels||![2,4].includes(c.resolution)||typeof c.audio!=='boolean'||![1,2,4].includes(c.storage)||typeof c.monitor!=='boolean'||typeof c.backup!=='boolean')throw new Error('Check your CCTV choices. Camera count must fit the recorder capacity.');return {system:c.system,cameras:c.cameras,channels:c.channels,resolution:c.resolution,audio:c.audio,storage:c.storage,monitor:c.monitor,backup:c.backup};}
