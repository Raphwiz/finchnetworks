import Admin from '@/frontend/Admin';
import EmailLogin from '@/frontend/EmailLogin';
export const metadata={title:'Administrator sign-in',robots:{index:false,follow:false}};
import {Shell,PageHeading} from '@/frontend/Shell';
import {isAdmin} from '@/backend/auth';
import {emailReady} from '@/backend/email-auth';
export const dynamic='force-dynamic';
export default async function Page(){if(!await isAdmin())return <Shell><PageHeading label="FINCH MANAGEMENT" title="Administrator sign-in" description="Sign in with your Finch administrator account. Customer accounts use My Account."/><section className="panel account-signin"><EmailLogin emailEnabled={emailReady()} forAdmin/></section></Shell>;return <Admin/>;}
