import {chromium} from 'playwright';
import {TYPES} from '../shared/reading';
const token=process.env.READING_ADMIN_TOKEN||'local-reading-admin',root='http://127.0.0.1:5173';
const rows=await fetch('http://127.0.0.1:3001/api/admin/passages',{headers:{'x-admin-token':token}}).then(r=>r.json()) as {id:string;status:string}[];
const ids:Record<string,string>={};for(const row of rows){if(row.status!=='draft')continue;const p=await fetch(`http://127.0.0.1:3001/api/admin/passages/${row.id}/draft`,{headers:{'x-admin-token':token}}).then(r=>r.json()) as {content:{questionGroups:{type:string}[]}};const type=p.content.questionGroups[0]?.type;if(type&&p.content.questionGroups.length===1&&!ids[type])ids[type]=row.id;if(Object.keys(ids).length===TYPES.length)break;}
const browser=await chromium.launch({headless:true,executablePath:'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',args:['--no-sandbox']});const context=await browser.newContext({viewport:{width:1280,height:900}});await context.addInitScript(v=>sessionStorage.setItem('reading-admin-token',v),token);const page=await context.newPage();
try{for(const type of TYPES){const id=ids[type];if(!id)throw Error(`No draft for ${type}`);await page.goto(`${root}/admin/reading/passages/${id}/edit`);await page.getByRole('button',{name:'Nhóm câu hỏi'}).click();await page.locator('.group-editor').waitFor();let field;
 if(type.startsWith('matching_'))field=page.locator('.group-editor input[aria-label="Option text"]').first();
 else if(type==='diagram_completion_text'||type.startsWith('summary_')||type.startsWith('note_')||type.startsWith('table_')||type.startsWith('flowchart_'))field=page.locator('.group-editor .editor-fields input').first();
 else field=page.locator('.group-editor .editor-fields textarea').first();
 const before=await field.inputValue();await field.fill(`${before} UI`);await page.getByRole('button',{name:'Lưu',exact:true}).click();await page.waitForTimeout(250);await page.reload();await page.getByRole('button',{name:'Nhóm câu hỏi'}).click();await page.locator('.group-editor').waitFor();let check;
 if(type.startsWith('matching_'))check=page.locator('.group-editor input[aria-label="Option text"]').first();
 else if(type==='diagram_completion_text'||type.startsWith('summary_')||type.startsWith('note_')||type.startsWith('table_')||type.startsWith('flowchart_'))check=page.locator('.group-editor .editor-fields input').first();
 else check=page.locator('.group-editor .editor-fields textarea').first();
 if((await check.inputValue())!==`${before} UI`)throw Error(`Editor did not persist ${type}`);console.log(`PASS editor ${type}`);
 }}finally{await browser.close()}
