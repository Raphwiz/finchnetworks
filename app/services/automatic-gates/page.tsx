import ServicePlanner from '@/frontend/ServicePlanner';
import {pageMeta} from '@/shared/seo';
export const metadata=pageMeta('Automatic gate installation','Plan a sliding or swing gate opener. Finch confirms the gate, power and access method before quoting.','/services/automatic-gates');
export default function Page(){return <ServicePlanner service='automatic-gates'/>}
