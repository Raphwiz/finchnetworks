import {isAdmin} from '@/backend/auth';
import {redirect} from 'next/navigation';
import NewQuotation from '@/frontend/NewQuotation';
export const dynamic='force-dynamic';
export const metadata={title:'New quotation | Finch',robots:{index:false,follow:false}};
export default async function Page(){if(!await isAdmin())redirect('/admin');return <NewQuotation/>;}
