import {scrypt,timingSafeEqual} from 'node:crypto';
const derive=(password:string,salt:string)=>new Promise<Buffer>((resolve,reject)=>scrypt(password,salt,64,{N:16384,r:8,p:5,maxmem:64*1024*1024},(e,key)=>e?reject(e):resolve(key)));
export function validatePassword(value:unknown){if(typeof value!=='string'||value.length<12||value.length>128)throw Error('Use a password between 12 and 128 characters.');return value;}
export async function hashPassword(password:string){const salt=Array.from(crypto.getRandomValues(new Uint8Array(16))).map(n=>n.toString(16).padStart(2,'0')).join('');return `scrypt$16384$8$5$${salt}$${(await derive(password,salt)).toString('hex')}`;}
export async function verifyPassword(password:string,stored:string){const [alg,n,r,p,salt,hash]=stored.split('$');if(alg!=='scrypt'||n!=='16384'||r!=='8'||p!=='5'||!salt||!/^[a-f0-9]{128}$/.test(hash||''))return false;const actual=await derive(password,salt);return timingSafeEqual(actual,Buffer.from(hash,'hex'));}
export const dummyHash='scrypt$16384$8$5$00000000000000000000000000000000$'+'0'.repeat(128);
