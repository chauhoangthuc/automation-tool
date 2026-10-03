import {existsSync} from 'node:fs';
import {join} from 'node:path';

// Node loads .env without replacing values already supplied by the shell.
const file=join(process.cwd(),'.env');
if(existsSync(file)) process.loadEnvFile(file);
