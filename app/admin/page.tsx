import Admin from '@/frontend/Admin';
import {Shell,PageHeading} from '@/frontend/Shell';
import {isAdmin} from '@/backend/auth';
export const dynamic='force-dynamic';
export default async function Page(){if(!await isAdmin())return <Shell><PageHeading label="FINCH MANAGEMENT" title="Administrator sign-in" description="Sign in with your Finch administrator account to manage the website."/><a href="/account?next=admin" className="button yellow">Sign in to manage Finch</a><p>If you are already signed in with a different account, sign out from My Account first.</p><a href="/account" className="textlink">My Account</a></Shell>;return <Admin/>;}
