import './env';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync,mkdirSync} from 'node:fs';
import {dirname,join} from 'node:path';
import {fileURLToPath} from 'node:url';
const here=dirname(fileURLToPath(import.meta.url));
export const dbPath=process.env.READING_DB ?? join(here,'..','data','reading.sqlite');
mkdirSync(dirname(dbPath),{recursive:true});
export const db=new DatabaseSync(dbPath);
db.exec('PRAGMA foreign_keys=ON; PRAGMA journal_mode=WAL;');
db.exec(readFileSync(join(here,'migrations','001_reading.sql'),'utf8'));
export const json=(x:unknown)=>JSON.stringify(x);
export const parse=<T>(x:unknown)=>JSON.parse(String(x)) as T;
export function transaction<T>(fn:()=>T):T {db.exec('BEGIN IMMEDIATE');try{const v=fn();db.exec('COMMIT');return v;}catch(e){db.exec('ROLLBACK');throw e;}}
