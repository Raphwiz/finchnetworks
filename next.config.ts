import type {NextConfig} from 'next';
const config:NextConfig={output:'standalone',images:{localPatterns:[{pathname:'/shop/**',search:''},{pathname:'/api/media/**',search:''},{pathname:'/solar-cctv.webp',search:''}],minimumCacheTTL:86400,formats:['image/webp'],imageSizes:[32,48,64,72,96,144,256,384]},poweredByHeader:false,serverExternalPackages:['node:sqlite'],async headers(){return [{source:'/:path*',headers:[{key:'X-Content-Type-Options',value:'nosniff'},{key:'Referrer-Policy',value:'same-origin'},{key:'X-Frame-Options',value:'DENY'}]}];}};
export default config;
