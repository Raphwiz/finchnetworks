import ReloadScrollReset from '@/frontend/ReloadScrollReset';
import type { Metadata } from 'next';
import {siteDescription,siteName,siteUrl} from '@/shared/seo';
import './globals.css';
export const metadata:Metadata={metadataBase:new URL(siteUrl),title:{default:`${siteName} | CCTV, gates, networking and Starlink`,template:`%s | ${siteName}`},description:siteDescription,applicationName:siteName,icons:{icon:'/finch-logo.png'},openGraph:{type:'website',locale:'en_KE',siteName,url:siteUrl},robots:{index:true,follow:true}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body><ReloadScrollReset/>{children}</body></html>}

