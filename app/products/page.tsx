import Catalogue from '@/frontend/Catalogue';
import {pageMeta} from '@/shared/seo';
export const metadata=pageMeta('Shop security and connectivity equipment','Browse equipment Finch can supply. Delivery and installation are confirmed before you pay.','/products');
export default function Page(){return <Catalogue kind='products'/>}
