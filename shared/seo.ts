import type {Metadata} from 'next';

export const siteUrl='https://finchnetworksltd.com';
export const siteName='Finch Networks Ltd';
export const siteDescription='Finch Networks Ltd installs CCTV, electric fences, automatic gates, office networks, Starlink and access control for homes and businesses in Kenya.';

export function pageMeta(title:string,description:string,path:string):Metadata{
  const full=`${title} | ${siteName}`;
  return {title,description,alternates:{canonical:path},openGraph:{title:full,description,url:path}};
}
