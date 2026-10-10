import CctvBuilder from '@/frontend/CctvBuilder';
import {pageMeta} from '@/shared/seo';
export const metadata=pageMeta('Build a Hikvision or Dahua CCTV system','Choose cameras, a recorder and storage, then send the list to Finch for a confirmed quotation.','/services/cctv');
export default function Page(){return <CctvBuilder/>}
