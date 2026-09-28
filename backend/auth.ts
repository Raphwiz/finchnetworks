import {headers} from 'next/headers';
import {database} from './database';
import {currentCustomer} from './customer-session';
export async function isAdmin(req?:Request){
 const request=req||new Request('http://localhost',{headers:await headers()});
 const user=await currentCustomer(request);
 if(!user)return false;
 return !!await database().prepare('SELECT customer_id FROM admin_users WHERE customer_id=?').bind(user.id).first();
}
