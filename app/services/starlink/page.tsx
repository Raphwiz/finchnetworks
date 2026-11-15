import ServicePlanner from '@/frontend/ServicePlanner';
import {pageMeta} from '@/shared/seo';
export const metadata=pageMeta('Starlink Installation in Meru','Request Starlink mounting and setup in Meru for a home, office or remote site. Subscription charges are separate.','/services/starlink');
export default function Page(){return <ServicePlanner service='starlink'/>}
