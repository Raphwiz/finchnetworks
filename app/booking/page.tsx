import {Booking} from "@/frontend/Commerce";
import {pageMeta} from '@/shared/seo';
export const metadata=pageMeta('Book a site survey','Request a visit for a survey, installation or repair. Finch confirms the appointment before attending.','/booking');
export default function Page(){return <Booking/>}
