import ServicePlanner from '@/frontend/ServicePlanner';
import {pageMeta} from '@/shared/seo';
export const metadata=pageMeta('Office network installation','Plan wired network points, Wi-Fi and internet for an office. Finch confirms the layout before quoting.','/services/office-networking');
export default function Page(){return <ServicePlanner service='office-networking'/>}
