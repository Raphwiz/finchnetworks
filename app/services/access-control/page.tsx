import ServicePlanner from "@/frontend/ServicePlanner";
import {pageMeta} from '@/shared/seo';
export const metadata=pageMeta('Access control and intercoms','Plan intercoms, door access, fingerprint attendance and facial recognition with Finch Networks Ltd.','/services/access-control');
export default function Page(){return <ServicePlanner service="access-control"/>}
