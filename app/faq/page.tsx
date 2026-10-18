import Faq from '@/frontend/Faq';
import {Shell,PageHeading} from '@/frontend/Shell';
import {pageMeta} from '@/shared/seo';
export const metadata=pageMeta('Frequently asked questions','Answers about Finch estimates, installations, site visits, shop orders, payments, repairs and maintenance.','/faq');
export default function Page(){return <Shell><PageHeading label="HELP & ANSWERS" title="How can we help?" description="Find answers to common questions before planning your installation, placing an order or requesting support."/><Faq/></Shell>}
