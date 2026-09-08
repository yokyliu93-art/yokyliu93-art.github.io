import {DatabaseSync,backup} from 'node:sqlite';
import {mkdirSync,chmodSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
const source=process.env.ISLAND_DATABASE?resolve(process.env.ISLAND_DATABASE):fileURLToPath(new URL('../data/islands.sqlite',import.meta.url));
const destination=resolve(dirname(source),'backups','islands-'+new Date().toISOString().replace(/[:.]/g,'-')+'.sqlite');
mkdirSync(dirname(destination),{recursive:true,mode:0o700});
const db=new DatabaseSync(source,{readOnly:true});
try{await backup(db,destination);chmodSync(destination,0o600);const copy=new DatabaseSync(destination,{readOnly:true});try{if(copy.prepare('PRAGMA integrity_check').get().integrity_check!=='ok')throw Error('备份完整性检查失败');}finally{copy.close();}console.log(destination);}finally{db.close();}
