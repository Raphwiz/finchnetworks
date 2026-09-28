export type Product={featured?:boolean;stockStatus?:'in-stock'|'out-of-stock'|'on-request';id:string;name:string;category:string;description:string;price:number|null;image:string;published:boolean;unit:string;availability:string};
export type Project={id:string;title:string;category:string;location:string;description:string;image:string;published:boolean};
export type Settings={phone:string;email:string;area:string;tiktok:string;youtube:string;x:string;instagram:string};
export const socialFields=[{key:'tiktok',label:'TikTok'},{key:'youtube',label:'YouTube'},{key:'x',label:'X'},{key:'instagram',label:'Instagram'}] as const;
export const defaultSettings:Settings={phone:'+254707625129',email:'Finchnetworksltd@gmail.com',area:'',tiktok:'',youtube:'',x:'',instagram:''};
export type Line={id:string;name:string;quantity:number;unit:string;unitPrice:number|null;total:number|null};
export type Calculation={lines:Line[];subtotal:number;hasUnpriced:boolean;note:string};
export const categories=['CCTV & repairs','Electric fences','Automatic gates','Office networking','Starlink','Access Control & Intercoms'];
export const initialProducts:Product[]=[
{id:'solar-cctv',name:'Solar CCTV camera',category:'CCTV & repairs',description:'An option for places without a convenient power connection. Ask us about connectivity, battery capacity and site suitability.',price:null,image:'/solar-cctv.webp',published:true,unit:'camera',availability:'Enquire for availability'},
{id:'cctv-camera',name:'CCTV camera',category:'CCTV & repairs',description:'Build a surveillance system around the coverage you need. We can help select the camera and recording equipment.',price:null,image:'',published:true,unit:'camera',availability:'Enquire for availability'},
{id:'starlink',name:'Starlink equipment',category:'Starlink',description:'Discuss the right equipment, mounting and installation for your location. Subscription costs are separate.',price:null,image:'',published:true,unit:'kit',availability:'Enquire for availability'},
{id:'networking',name:'Office networking equipment',category:'Office networking',description:'Routers, switches and access points selected for your office layout and connectivity needs.',price:null,image:'',published:true,unit:'item',availability:'Enquire for availability'}];
export const serviceItems=categories.map((name,i)=>({id:`service-${i}`,name,description:['Installation, repairs, upgrades and remote viewing setup.','Perimeter assessment, electric fence installation and repairs.','Automatic gate opener installation and troubleshooting.','Structured cabling, Wi-Fi coverage and network troubleshooting.','Equipment mounting, setup and network connection.','Intercoms, smart door access, fingerprint attendance and facial recognition systems.'][i]}));
export const money=(n:number)=>new Intl.NumberFormat('en-KE',{style:'currency',currency:'KES',maximumFractionDigits:0}).format(n);
