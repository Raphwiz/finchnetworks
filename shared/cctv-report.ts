export const cameraReportBrands=['Hikvision','Dahua','Imou','Tiandy','Other','Unknown'] as const;
export const cameraReportTypes=['HD','IP'] as const;
export type CameraReportType=typeof cameraReportTypes[number];
export const recorderOptions={
 HD:['DVR','XVR / Hybrid','None','Not checked'],
 IP:['NVR','XVR / Hybrid','None','Not checked'],
} as const;
export const maxCameraSetups=20;
export type CameraSetup={
 brand:string; model:string; type:CameraReportType; wiring:string;
 recorder:string; recorderCondition:string; storage:string;
};

export function parseCameraSetups(value:unknown):CameraSetup[]{
 if(value===undefined)return [];
 if(!Array.isArray(value)||value.length<1||value.length>maxCameraSetups){
  throw new Error(`Add between 1 and ${maxCameraSetups} camera setups.`);
 }
 return value.map((entry,index)=>{
  const field=(key:keyof CameraSetup,limit:number)=>{
   const raw=entry?.[key];
   if(typeof raw!=='string'||raw.length>limit)throw new Error(`Check the details for camera setup ${index+1}.`);
   return raw.replace(/\s+/g,' ').trim();
  };
  const brand=field('brand',30);
  const type=field('type',2);
  const recorder=field('recorder',30);
  if(!(cameraReportBrands as readonly string[]).includes(brand)||(type!=='HD'&&type!=='IP')){
   throw new Error(`Choose a brand and camera type for setup ${index+1}.`);
  }
  if(!(recorderOptions[type] as readonly string[]).includes(recorder)){
   throw new Error(`Choose a compatible recorder type for setup ${index+1}.`);
  }
  return {brand,type,recorder,model:field('model',120),wiring:field('wiring',240),
   recorderCondition:field('recorderCondition',240),storage:field('storage',240)};
 });
}
