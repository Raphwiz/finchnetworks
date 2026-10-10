import ReloadScrollReset from '@/frontend/ReloadScrollReset';
import type { Metadata, Viewport } from 'next';
import {siteDescription,siteName,siteUrl} from '@/shared/seo';
import './globals.css';
export const viewport:Viewport={themeColor:'#075f63'};
export const metadata:Metadata={metadataBase:new URL(siteUrl),title:{default:`${siteName} | CCTV, gates, networking and Starlink`,template:`%s | ${siteName}`},description:siteDescription,applicationName:siteName,appleWebApp:{title:'Finch',statusBarStyle:'default'},icons:{icon:[{url:'/icon-192.png',sizes:'192x192',type:'image/png'},{url:'/icon-512.png',sizes:'512x512',type:'image/png'}],apple:'/apple-touch-icon.png'},openGraph:{type:'website',locale:'en_KE',siteName,url:siteUrl},robots:{index:true,follow:true}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body><ReloadScrollReset/>{children}</body></html>}

