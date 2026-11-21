import SolarPlanner from '@/frontend/SolarPlanner';
import {pageMeta} from '@/shared/seo';
export const metadata=pageMeta('Solar Installation in Meru','Plan solar power and battery backup for homes, businesses and schools. Share your appliance requirements with Finch Networks Limited.','/services/solar');
export default function Page(){return <SolarPlanner/>}
