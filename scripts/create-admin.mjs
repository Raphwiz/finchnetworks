import {DatabaseSync} from 'node:sqlite';
import {scryptSync,randomUUID} from 'node:crypto';
import {resolve,join} from 'node:path';
import {emitKeypressEvents} from 'node:readline';
const email=(process.argv[2]||'').trim().toLowerCase();
if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))throw Error('Usage: npm run admin:create -- owner@example.com');
if(!process.stdin.isTTY)throw Error('Use an interactive terminal to enter the administrator password.');
function secret(prompt){return new Promise(resolve=>{let value='';process.stdout.write(prompt);emitKeypressEvents(process.stdin);process.stdin.setRawMode(true);process.stdin.resume();function key(str,k){if(k?.ctrl&&k.name==='c')process.exit(130);if(k?.name==='return'){process.stdin.removeListener('keypress',key);process.stdin.setRawMode(false);process.stdin.pause();process.stdout.write('\n');resolve(value);}else if(k?.name==='backspace'){value=value.slice(0,-1);}else if(str&&!k?.ctrl&&!k?.meta&&value.length<129){value+=str;}}process.stdin.on('keypress',key);});}
const db=new DatabaseSync(join(resolve(process.env.DATA_DIR||'data'),'finch.sqlite'));
try{
 if(db.prepare('SELECT email FROM email_credentials WHERE email=?').get(email))throw Error('An account already exists. Use the documented grant procedure after checking its identity; no password was changed.');
 const password=await secret('New administrator password (12–128 characters, hidden): ');
 if(password.length<12||password.length>128)throw Error('Use 12–128 characters.');
 if(password!==await secret('Confirm password: '))throw Error('Passwords do not match.');
 const salt=randomUUID().replaceAll('-','');const hash='scrypt$16384$8$5$'+salt+'$'+scryptSync(password,salt,64,{N:16384,r:8,p:5,maxmem:64*1024*1024}).toString('hex');
 const id='email:'+randomUUID();db.exec('PRAGMA foreign_keys=ON; BEGIN IMMEDIATE');
 try{db.prepare('INSERT INTO customers(id,email,name,created_at) VALUES (?,?,?,?)').run(id,email,'Finch Administrator',Date.now());db.prepare('INSERT INTO email_credentials(email,customer_id,password_hash) VALUES (?,?,?)').run(email,id,hash);db.prepare('INSERT INTO admin_users(customer_id) VALUES (?)').run(id);db.exec('COMMIT');}catch(e){db.exec('ROLLBACK');throw e;}
 console.log('Administrator created. Sign in at /account?next=admin.');
}finally{db.close();}

