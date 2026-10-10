import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {mkdtempSync,readFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {spawn,execFileSync} from 'node:child_process';
import {randomBytes,createHash,scryptSync,randomUUID} from 'node:crypto';
import {setTimeout as delay} from 'node:timers/promises';
const dir=mkdtempSync(join(tmpdir(),'finch-smoke-'));
const origin='https://finchnetworksltd.com',base='http://127.0.0.1:3101';
const env={...process.env,NODE_ENV:'production',DATA_DIR:dir,PUBLIC_SITE_URL:origin,PORT:'3101',HOSTNAME:'127.0.0.1',RESEND_API_KEY:'',AUTH_EMAIL_FROM:'',GOOGLE_CLIENT_ID:'',GOOGLE_CLIENT_SECRET:''};
execFileSync(process.execPath,['scripts/migrate.mjs'],{env});
const db=new DatabaseSync(join(dir,'finch.sqlite'));
const hash=s=>createHash('sha256').update(s).digest('hex');
const password='Disposable-test-passphrase-123';
const salt=randomBytes(16).toString('hex');
const passwordHash='scrypt$16384$8$5$'+salt+'$'+scryptSync(password,salt,64,{N:16384,r:8,p:5,maxmem:64*1024*1024}).toString('hex');
for(const id of ['owner','customer','other']){
 db.prepare('INSERT INTO customers VALUES (?,?,?,?)').run(id,id+'@example.invalid',id,Date.now());
 db.prepare('INSERT INTO email_credentials VALUES (?,?,?)').run(id+'@example.invalid',id,passwordHash);
}
db.prepare('INSERT INTO admin_users VALUES (?)').run('owner');
let server;let logs='';
async function start(){server=spawn(process.execPath,['scripts/start.mjs'],{env,stdio:['ignore','pipe','pipe']});server.stdout.on('data',b=>logs+=b);server.stderr.on('data',b=>logs+=b);for(let i=0;i<100;i++){if(server.exitCode!==null)throw Error(logs);try{if((await fetch(base+'/api/health')).ok)return;}catch{}await delay(300);}throw Error('Server did not start: '+logs);}
async function stop(){if(server&&server.exitCode===null){const ended=new Promise(r=>server.once('exit',r));server.kill();await ended;}}
async function call(path,body,cookie='',extra={}){const r=await fetch(base+'/api/'+path,{method:body===undefined?'GET':'POST',headers:{Origin:origin,'Content-Type':'application/json',Cookie:cookie,...extra},body:body===undefined?undefined:JSON.stringify(body)});const data=await r.json();return {r,data};}
async function login(email){const {r}=await call('customer/login',{email:email+'@example.invalid',password,admin:email==='owner'});assert.equal(r.status,200);assert.match(r.headers.get('set-cookie'),/HttpOnly/);assert.match(r.headers.get('set-cookie'),/Secure/);return r.headers.get('set-cookie').split(';')[0];}
try{
 await start();
 for(const path of ['/','/services','/products','/account','/solar-cctv.webp'])assert.equal((await fetch(base+path)).status,200,path);
 assert.equal((await call('admin',undefined,'',{'oai-authenticated-user-email':'owner@example.invalid','oai-authenticated-user-id':'owner'})).r.status,403);
 assert.equal((await call('commerce/order',{})).r.status,401);
 assert.equal((await call('customer/login',{email:'owner@example.invalid',password})).r.status,403);
 assert.equal((await call('customer/login',{email:'customer@example.invalid',password,admin:true})).r.status,403);
 const owner=await login('owner'),customer=await login('customer'),other=await login('other');
 assert.equal((await call('customer/session',undefined,owner)).data.admin,true);
 assert.equal((await call('customer/session',undefined,customer)).data.admin,false);
 assert.equal((await call('admin',undefined,customer)).r.status,403);
 assert.equal((await call('admin',undefined,owner)).r.status,200);
 assert.equal((await call('admin/settings',{},owner,{Origin:'https://evil.example'})).r.status,403);
 const form=new FormData();form.append('file',new Blob([readFileSync('public/solar-cctv.webp')],{type:'image/webp'}),'solar.webp');
 const uploaded=await fetch(base+'/api/admin/upload',{method:'POST',headers:{Origin:origin,Cookie:owner},body:form});assert.equal(uploaded.status,200);const image=(await uploaded.json()).url;
 assert.equal((await fetch(base+image)).status,200);
 const id=randomUUID();const order={id,name:'Smoke test',phone:'+254700000000',location:'Test',consent:true,fulfilment:'collection',customerId:'other',items:[{id:'solar-cctv',quantity:1,price:1}]};
 assert.equal((await call('commerce/order',order,customer)).r.status,201);
 assert.equal(db.prepare('SELECT customer_id FROM commerce WHERE id=?').get(id).customer_id,'customer');
 assert.ok((await call('customer/requests',undefined,customer)).data.requests.some(r=>r.id===id));
 assert.equal((await call('customer/requests',undefined,other)).data.requests.length,0);
 const token=randomBytes(32).toString('hex');db.prepare('INSERT INTO email_tokens VALUES (?,?,?,?)').run(hash(token),'reset',JSON.stringify({customerId:'customer',previousHash:passwordHash}),Date.now()+600000);
 assert.equal((await call('customer/reset',{token,password:'Replacement-test-password-123'})).r.status,200);
 assert.equal((await call('customer/session',undefined,customer)).data.customer,null);
 assert.equal((await call('customer/reset',{token,password})).r.status,400);
 assert.equal((await call('customer/login',{email:'customer@example.invalid',password})).r.status,401);
 await stop();await start();
 assert.equal((await fetch(base+image)).status,200);
 assert.equal((await call('admin',undefined,owner)).r.status,200);
 assert.equal(db.prepare('SELECT count(*) AS n FROM commerce WHERE id=?').get(id).n,1);
 assert.equal((await call('customer/logout',{},owner)).r.status,200);
 assert.equal((await call('admin',undefined,owner)).r.status,403);
 console.log('PASS: production pages, secure cookies, admin roles, forged-header denial, CSRF, image upload, checkout, ownership isolation, reset/revocation, restart persistence and logout. Disposable database: '+dir);
}catch(e){console.error(logs);throw e;}finally{await stop();db.close();}
