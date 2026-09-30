import type {MetadataRoute} from 'next';
import {siteDescription,siteName} from '@/shared/seo';

export default function manifest():MetadataRoute.Manifest{
  return {
    name:siteName,
    short_name:'Finch',
    description:siteDescription,
    id:'/',
    start_url:'/',
    scope:'/',
    display:'standalone',
    background_color:'#f5f9fc',
    theme_color:'#075f63',
    lang:'en',
    icons:[
      {src:'/icon-192.png',sizes:'192x192',type:'image/png',purpose:'any'},
      {src:'/icon-512.png',sizes:'512x512',type:'image/png',purpose:'any'},
      {src:'/icon-maskable-512.png',sizes:'512x512',type:'image/png',purpose:'maskable'},
    ],
  };
}
