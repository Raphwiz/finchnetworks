import Admin from '@/frontend/Admin';
import {Shell,PageHeading} from '@/frontend/Shell';
import {getChatGPTUser,chatGPTSignInPath} from '@/app/chatgpt-auth';
import {isAdmin} from '@/backend/auth';
export const dynamic='force-dynamic';
export default async function Page(){const user=await getChatGPTUser();if(!user)return <Shell><PageHeading label="FINCH MANAGEMENT" title="Welcome back." description="Sign in with the ChatGPT account using your authorised administrator email."/><a href={chatGPTSignInPath('/admin')} target="_top" className="button yellow">Sign in to manage Finch</a></Shell>;if(!await isAdmin())return <Shell><PageHeading label="ADMINISTRATOR ACCESS" title="This account has no access." description="Use the administrator account registered for Finch Networks."/><p>Signed in as {user.email}</p><a className="button dark" href="/signout-with-chatgpt?return_to=%2Fadmin" target="_top">Switch account</a></Shell>;return <Admin/>}
