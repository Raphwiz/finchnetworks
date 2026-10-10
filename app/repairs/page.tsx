import RepairRequest from '@/frontend/RepairRequest';
import {pageMeta} from '@/shared/seo';
export const metadata=pageMeta('Repairs & support','Request help with CCTV, gates, electric fences, networks and access control. Describe the fault and optionally attach a photo.','/repairs');
export default function Page(){return <RepairRequest/>}
