import {Shell,PageHeading} from '@/frontend/Shell';
import {GuideCards} from '@/frontend/CustomerHelp';
import {pageMeta} from '@/shared/seo';
export const metadata=pageMeta('Buying guides','Practical guides to CCTV, solar cameras and planning your Starlink installation.','/guides');
export default function Page(){return <Shell><PageHeading label="FINCH BUYING GUIDES" title="Choose with confidence." description="Straightforward explanations to help you ask the right questions before choosing your system."/><GuideCards/></Shell>}
