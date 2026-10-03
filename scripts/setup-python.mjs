import {spawnSync} from 'node:child_process';
import {existsSync} from 'node:fs';
import {join} from 'node:path';

const root=process.cwd(),venv=join(root,'.venv'),local=join(venv,'Scripts','python.exe');
const bundled=join(process.env.USERPROFILE||'', '.cache','codex-runtimes','codex-primary-runtime','dependencies','python','python.exe');
const candidates=[process.env.READING_PYTHON,existsSync(bundled)?bundled:null,'py','python3','python'].filter(Boolean);
let created=false;
for(const command of candidates){const prefix=command==='py'?['-3']:[];const result=spawnSync(command,[...prefix,'-m','venv',venv],{stdio:'inherit',windowsHide:true});if(result.status===0){created=true;break}}
if(!created){console.error('Không tìm thấy Python 3. Hãy cài Python hoặc đặt READING_PYTHON trong .env.');process.exit(1)}
const install=spawnSync(local,['-m','pip','install','-r',join(root,'server','ai','requirements.txt')],{stdio:'inherit',windowsHide:true});
process.exit(install.status??1);
