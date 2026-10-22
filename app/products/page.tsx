import {products} from '@/backend/catalog';
import Catalogue from '@/frontend/Catalogue';
import {pageMeta} from '@/shared/seo';
export const metadata=pageMeta('Shop security and connectivity equipment','Browse equipment Finch can supply. Delivery and installation are confirmed before you pay.','/products');
export const dynamic='force-dynamic';
export default async function Page(){const shopProducts=(await products()).filter(p=>p.featured);return <Catalogue kind='products' initialData={{products:shopProducts}}/>}
