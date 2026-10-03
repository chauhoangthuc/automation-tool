import {spawn} from 'node:child_process';
import {existsSync,mkdirSync,writeFileSync,unlinkSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {uid} from '../../shared/reading';

const here=dirname(fileURLToPath(import.meta.url));
type Result={kind:'single_passage_bundle'|'full_test_bundle';passageVersionIds:string[];exerciseId?:string;testId?:string;needsReview:string[];model:string};
export type ImportKind=Result['kind'];
type Envelope={ok:boolean;status?:number;error?:string;result?:Result};

function candidates():{command:string;prefix:string[]}[]{
 const configured=process.env.READING_PYTHON?.trim();
 const local=join(here,'..','..','.venv','Scripts','python.exe');
 const bundled=join(process.env.USERPROFILE||'', '.cache','codex-runtimes','codex-primary-runtime','dependencies','python','python.exe');
 return [configured&&{command:configured,prefix:[]},existsSync(local)&&{command:local,prefix:[]},existsSync(bundled)&&{command:bundled,prefix:[]},{command:'py',prefix:['-3']},{command:'python3',prefix:[]},{command:'python',prefix:[]}].filter(Boolean) as {command:string;prefix:string[]}[];
}

function run(command:string,args:string[],timeoutMs:number):Promise<{code:number|null;stdout:string;stderr:string}>{
 return new Promise((resolve,reject)=>{const child=spawn(command,args,{cwd:join(here,'..','..'),env:{...process.env,PYTHONUTF8:'1',PYTHONIOENCODING:'utf-8'},windowsHide:true});let stdout='',stderr='';const timer=setTimeout(()=>child.kill(),timeoutMs);child.stdout.setEncoding('utf8');child.stderr.setEncoding('utf8');child.stdout.on('data',x=>stdout+=x);child.stderr.on('data',x=>stderr+=x);child.on('error',reject);child.on('close',code=>{clearTimeout(timer);resolve({code,stdout,stderr})});});
}

export async function importPdfWithPython(pdf:Buffer,filename:string,database:string,expectedKind:ImportKind):Promise<Result>{
 const dir=join(tmpdir(),'ielts-space-reading');mkdirSync(dir,{recursive:true});const input=join(dir,`${uid('pdf')}.pdf`);writeFileSync(input,pdf);
 const args=['--pdf',input,'--filename',filename,'--database',database,'--expected-kind',expectedKind];let unavailable:unknown;
 const timeoutMs=expectedKind==='full_test_bundle'?720000:300000;
 try{for(const candidate of candidates()){try{const output=await run(candidate.command,[...candidate.prefix,join(here,'pdf_import.py'),...args],timeoutMs);const line=output.stdout.trim().split(/\r?\n/).at(-1);if(!line)throw new Error(output.stderr.trim()||'Python importer returned no JSON');const envelope=JSON.parse(line) as Envelope;if(envelope.ok&&envelope.result)return envelope.result;throw Object.assign(new Error(envelope.error||'Python PDF import failed'),{status:envelope.status||422});}catch(e){if((e as NodeJS.ErrnoException).code==='ENOENT'||(e as NodeJS.ErrnoException).code==='EACCES'){unavailable=e;continue}throw e}}}finally{try{unlinkSync(input)}catch{}}
 throw new Error(`Không tìm thấy Python 3. Đặt READING_PYTHON trong .env. ${String(unavailable||'')}`);
}
