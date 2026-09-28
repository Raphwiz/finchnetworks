import {DatabaseSync,backup} from 'node:sqlite';
import {mkdirSync,cpSync} from 'node:fs';
import {join,resolve} from 'node:path';
const data=resolve(process.env.DATA_DIR||'data');
const destination=resolve(process.env.BACKUP_DIR||'backups',new Date().toISOString().replaceAll(':','-')+'-'+process.pid);
mkdirSync(destination,{recursive:true,mode:0o700});
const db=new DatabaseSync(join(data,'finch.sqlite'),{readOnly:true});
try{await backup(db,join(destination,'finch.sqlite'));}finally{db.close();}
try{cpSync(join(data,'uploads'),join(destination,'uploads'),{recursive:true,errorOnExist:true});}catch(e){if(e.code!=='ENOENT')throw e;}
console.log(destination);

