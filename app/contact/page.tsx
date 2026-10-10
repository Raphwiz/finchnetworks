import Estimate from '@/frontend/Estimate';
import {pageMeta} from '@/shared/seo';
export const metadata=pageMeta('Contact Finch','Tell Finch about an installation, repair or product. Share your phone number and location for a follow-up.','/contact');
export default function Page(){return <Estimate contact/>}
