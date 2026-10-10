import {repairEquipment} from '@/shared/repairs';
export async function repairBody(req:Request){
 const max=4_200_000;
 if(Number(req.headers.get('content-length'))>max)throw Error('Use a photo smaller than 4 MB.');
 const reader=req.body?.getReader();if(!reader)throw Error('Enter your repair details.');
 const chunks:Uint8Array[]=[];let size=0;
 while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>max){await reader.cancel();throw Error('Use a photo smaller than 4 MB.');}chunks.push(value);}
 const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length;}
 const form=await new Response(bytes,{headers:{'Content-Type':req.headers.get('content-type')||''}}).formData();
 const equipment=form.get('equipment');if(!repairEquipment.includes(equipment as any))throw Error('Choose the equipment that needs repair.');
 const fault=form.get('fault');if(typeof fault!=='string'||!fault.trim()||fault.length>2500)throw Error('Describe the fault in up to 2,500 characters.');
 let photo:{buffer:ArrayBuffer;ext:string}|undefined;
 const file=form.get('photo');if(file instanceof File&&file.size){if(file.size>4_000_000)throw Error('Use a photo smaller than 4 MB.');const buffer=await file.arrayBuffer();const b=new Uint8Array(buffer);const jpg=b[0]===255&&b[1]===216&&b[2]===255;const png=b[0]===137&&b[1]===80&&b[2]===78&&b[3]===71;const webp=String.fromCharCode(...b.slice(0,4))==='RIFF'&&String.fromCharCode(...b.slice(8,12))==='WEBP';if(!jpg&&!png&&!webp)throw Error('Choose a JPG, PNG or WebP photo.');photo={buffer,ext:jpg?'jpg':png?'png':'webp'};}
 return {body:{name:form.get('name'),phone:form.get('phone'),location:form.get('location'),consent:form.get('consent')==='on',website:form.get('website'),notes:`Repair request: ${equipment}\n${fault.trim()}`,items:[],repairEquipment:equipment},photo};
}
