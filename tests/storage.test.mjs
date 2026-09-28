import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,readFileSync,readdirSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {execFileSync} from 'node:child_process';
import {DatabaseSync} from 'node:sqlite';
process.env.DATA_DIR=mkdtempSync(join(tmpdir(),'finch-storage-'));
process.env.BACKUP_DIR=join(process.env.DATA_DIR,'backups');
const {database,media}=await import('../backend/database.ts');
test('migrations are repeatable and preserve records',async()=>{
 execFileSync(process.execPath,['scripts/migrate.mjs']);
 const db=database();
 await db.prepare('INSERT INTO settings(id,data) VALUES (?,?)').bind('test','{"ok":true}').run();
 execFileSync(process.execPath,['scripts/migrate.mjs']);
 assert.equal((await db.prepare('SELECT data FROM settings WHERE id=?').bind('test').first()).data,'{"ok":true}');
});
test('batch commits all statements or rolls back on failure',async()=>{
 const db=database();
 await assert.rejects(db.batch([db.prepare('INSERT INTO settings VALUES (?,?)').bind('rollback','{}'),db.prepare('INSERT INTO settings VALUES (?,?)').bind('test','{}')]));
 assert.equal(await db.prepare('SELECT * FROM settings WHERE id=?').bind('rollback').first(),null);
 const r=await db.batch([db.prepare('UPDATE settings SET data=? WHERE id=?').bind('{"updated":true}','test')]);
 assert.equal(r[0].meta.changes,1);
 assert.equal((await db.prepare('DELETE FROM settings WHERE id=? RETURNING id').bind('test').first()).id,'test');
});
test('uploads persist and reject traversal; backup includes database and uploads',async()=>{
 const bytes=new Uint8Array([82,73,70,70]);
 await media().put('abcdef.webp',bytes.buffer);
 assert.deepEqual((await media().get('abcdef.webp')).body,bytes);
 await assert.rejects(media().get('../secret.webp'));
 execFileSync(process.execPath,['scripts/backup.mjs']);
 const backup=join(process.env.BACKUP_DIR,readdirSync(process.env.BACKUP_DIR)[0]);
 assert.deepEqual(new Uint8Array(readFileSync(join(backup,'uploads','abcdef.webp'))),bytes);
 const db=new DatabaseSync(join(backup,'finch.sqlite'),{readOnly:true});
 assert.equal(db.prepare('PRAGMA integrity_check').get().integrity_check,'ok');
 assert.ok(db.prepare('SELECT name FROM finch_migrations WHERE name=?').get('0004_admin_users.sql'));db.close();
});
