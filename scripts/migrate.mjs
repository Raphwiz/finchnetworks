import {DatabaseSync} from 'node:sqlite';
import {mkdirSync,readFileSync,readdirSync,copyFileSync,constants} from 'node:fs';
import {join,resolve} from 'node:path';
const dir=resolve(process.env.DATA_DIR||'data');mkdirSync(dir,{recursive:true});
const db=new DatabaseSync(join(dir,'finch.sqlite'));
db.exec('PRAGMA foreign_keys=ON; PRAGMA busy_timeout=5000; PRAGMA journal_mode=WAL; CREATE TABLE IF NOT EXISTS finch_migrations (name TEXT PRIMARY KEY);');
try {
 const migrations=[...readdirSync('drizzle').filter(n=>n.endsWith('.sql')).sort().map(n=>['drizzle',n]),...readdirSync('deploy/migrations').filter(n=>n.endsWith('.sql')).sort().map(n=>['deploy/migrations',n])];
 for(const [folder,name] of migrations){
  if(db.prepare('SELECT name FROM finch_migrations WHERE name=?').get(name))continue;
  db.exec('BEGIN IMMEDIATE');
  try {db.exec(readFileSync(join(folder,name),'utf8'));db.prepare('INSERT INTO finch_migrations(name) VALUES (?)').run(name);db.exec('COMMIT');console.log('Applied '+name);}
  catch(e){db.exec('ROLLBACK');throw e;}
 }
 if(!db.prepare('SELECT name FROM finch_migrations WHERE name=?').get('catalog-seed-v1')){
  const seed=JSON.parse(readFileSync('seed/catalog.json','utf8'));
  mkdirSync(join(dir,'uploads'),{recursive:true});
  for(const name of readdirSync('public/seed-media')){try{copyFileSync(join('public/seed-media',name),join(dir,'uploads',name),constants.COPYFILE_EXCL);}catch(e){if(e.code!=='EEXIST')throw e;}}
  db.exec('BEGIN IMMEDIATE');
  try{for(const table of ['products','settings'])for(const row of seed[table])db.prepare('INSERT OR IGNORE INTO '+table+' (id,data) VALUES (?,?)').run(row.id,row.data);db.prepare('INSERT INTO finch_migrations VALUES (?)').run('catalog-seed-v1');db.exec('COMMIT');}catch(e){db.exec('ROLLBACK');throw e;}
 }
}finally{db.close();}
