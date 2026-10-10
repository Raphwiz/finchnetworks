import type {MetadataRoute} from 'next';
import {siteUrl} from '@/shared/seo';

const pages=['/','/services','/services/cctv','/services/electric-fences','/services/automatic-gates','/services/office-networking','/services/starlink','/services/access-control','/products','/packages','/maintenance','/projects','/about','/contact','/estimate','/booking','/privacy'];

export default function sitemap():MetadataRoute.Sitemap{
  return pages.map(path=>({url:path==='/'?siteUrl:`${siteUrl}${path}`,changeFrequency:path==='/'?'weekly':'monthly',priority:path==='/'?1:path.startsWith('/services')?0.8:0.6}));
}
