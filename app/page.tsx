import Home from '@/frontend/Home';
import type {Metadata} from 'next';
import {siteDescription,siteName,siteUrl} from '@/shared/seo';
const homeTitle=`${siteName} | CCTV, gates, networking and Starlink`;
export const metadata:Metadata={title:{absolute:homeTitle},description:siteDescription,alternates:{canonical:'/'},openGraph:{title:homeTitle,description:siteDescription,url:'/'}};
const business={'@context':'https://schema.org','@type':'LocalBusiness',name:siteName,url:siteUrl,image:`${siteUrl}/finch-logo.png`,telephone:'+254707625129',email:'finchnetworkslimited@gmail.com',areaServed:'Kenya',description:siteDescription,knowsAbout:['CCTV installation','Electric fences','Automatic gates','Office networking','Starlink installation','Access control']};
export default function Page(){return <><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(business)}}/><Home/></>}
