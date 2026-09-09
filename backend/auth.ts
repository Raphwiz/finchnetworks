import {getChatGPTUser} from '@/app/chatgpt-auth';
import {config} from './database';
export async function isAdmin(){const user=await getChatGPTUser();const emails=config('ADMIN_EMAILS').toLowerCase().split(',').map(v=>v.trim()).filter(Boolean);return !!user&&emails.includes(user.email.toLowerCase());}
