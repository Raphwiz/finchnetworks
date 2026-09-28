import {DatabaseSync, type SQLInputValue} from 'node:sqlite';
import {mkdirSync,readFileSync,writeFileSync,renameSync} from 'node:fs';
import {resolve,join} from 'node:path';
export function config(key:string){return process.env[key]||'';}
export function dataDirectory(){return resolve(config('DATA_DIR')||'data');}
let connection:DatabaseSync|undefined;
function connectionFor(){
 if(!connection){mkdirSync(dataDirectory(),{recursive:true});connection=new DatabaseSync(join(dataDirectory(),'finch.sqlite'));connection.exec('PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON; PRAGMA busy_timeout=5000;');}
 return connection;
}
class Statement {
 private values:SQLInputValue[]=[];
 private sql:string;
 constructor(sql:string){this.sql=sql;}
 bind(...values:SQLInputValue[]){const s=new Statement(this.sql);s.values=values;return s;}
 execute(){const db=connectionFor();const statement=db.prepare(this.sql);let results:Record<string,unknown>[]=[];let changes=0;if(statement.columns().length){results=statement.all(...this.values);changes=Number(db.prepare('SELECT changes() AS n').get()!.n);}else{changes=Number(statement.run(...this.values).changes);}return {results,success:true,meta:{changes}};}
 async first<T=Record<string,unknown>>(){return (connectionFor().prepare(this.sql).get(...this.values) as T|undefined)??null;}
 async all<T=Record<string,unknown>>(){return this.execute() as unknown as {results:T[];success:boolean;meta:{changes:number}};}
 async run(){return this.execute();}
}
const adapter={prepare:(sql:string)=>new Statement(sql),async batch(statements:Statement[]){const db=connectionFor();db.exec('BEGIN IMMEDIATE');try{const results=statements.map(s=>s.execute());db.exec('COMMIT');return results;}catch(e){db.exec('ROLLBACK');throw e;}}};
export function database(){return adapter;}
function mediaFile(key:string){if(!/^[a-f0-9-]+\.(png|jpg|webp)$/.test(key))throw Error('Invalid media key');return join(dataDirectory(),'uploads',key);}
export function media(){return {
 async get(key:string){try{return {body:new Uint8Array(readFileSync(mediaFile(key))),httpMetadata:{contentType:key.endsWith('.jpg')?'image/jpeg':key.endsWith('.png')?'image/png':'image/webp'}};}catch(e){if((e as NodeJS.ErrnoException).code==='ENOENT')return null;throw e;}},
 async put(key:string,buffer:ArrayBuffer,_options?:unknown){const file=mediaFile(key);mkdirSync(join(dataDirectory(),'uploads'),{recursive:true});const temp=file+'.'+crypto.randomUUID()+'.tmp';writeFileSync(temp,new Uint8Array(buffer),{mode:0o600});renameSync(temp,file);}
};}
