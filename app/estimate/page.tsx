import Estimate from '@/frontend/Estimate';
import {pageMeta} from '@/shared/seo';
export const metadata=pageMeta('Build an installation estimate','Choose equipment and services, see a starting list, and send it to Finch. No payment is taken online.','/estimate');
export default function Page(){return <Estimate/>}
