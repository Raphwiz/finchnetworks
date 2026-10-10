import type {MetadataRoute} from 'next';
import {siteUrl} from '@/shared/seo';

export default function robots():MetadataRoute.Robots{
  return {
    rules:{userAgent:'*',allow:'/',disallow:['/admin','/account','/cart','/quote','/track','/api']},
    sitemap:`${siteUrl}/sitemap.xml`,
    host:siteUrl,
  };
}
