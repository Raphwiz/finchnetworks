import Catalogue from '@/frontend/Catalogue';
import {pageMeta} from '@/shared/seo';
export const metadata=pageMeta('Completed installations','Photos and details of security, networking and automation work finished by Finch Networks Ltd.','/projects');
export default function Page(){return <Catalogue kind='projects'/>}
