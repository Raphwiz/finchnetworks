import ServicePlanner from '@/frontend/ServicePlanner';
import {pageMeta} from '@/shared/seo';
export const metadata=pageMeta('Electric fence installation','Plan a new electric fence, repair or upgrade. Finch confirms the perimeter, power and price before work starts.','/services/electric-fences');
export default function Page(){return <ServicePlanner service='electric-fences'/>}
