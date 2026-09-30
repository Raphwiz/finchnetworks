import ServicePlanner from '@/frontend/ServicePlanner';
import {pageMeta} from '@/shared/seo';
export const metadata=pageMeta('Starlink installation','Plan Starlink mounting and setup for a home, office or remote site. Subscription charges are separate.','/services/starlink');
export default function Page(){return <ServicePlanner service='starlink'/>}
