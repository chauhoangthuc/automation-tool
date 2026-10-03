import {chromium} from 'playwright';
import {mkdirSync} from 'node:fs';
import {join} from 'node:path';
import {TYPES} from '../shared/reading';
import {fixture} from './fixtures';
const root='http://127.0.0.1:5173',token=process.env.READING_ADMIN_TOKEN||'local-reading-admin';
const apiRoot='http://127.0.0.1:3001/api';
const browser=await chromium.launch({headless:true,executablePath:'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',args:['--no-sandbox']});
const out=join(process.cwd(),'docs','reading-ui','screenshots');mkdirSync(out,{recursive:true});
const context=await browser.newContext({viewport:{width:1586,height:992},deviceScaleFactor:1});await context.addInitScript(value=>sessionStorage.setItem('reading-admin-token',value),token);
const page=await context.newPage();
let firstId='';
for(const type of TYPES){const d=fixture([type],1,type==='multiple_choice_multiple'?2:5);const c=await fetch(`${apiRoot}/admin/passages`,{method:'POST',headers:{'x-admin-token':token,'Content-Type':'application/json'},body:'{}'}).then(r=>r.json()) as {id:string;revision:number};d.content.passageVersionId=c.id;d.answerKey.passageVersionId=c.id;await fetch(`${apiRoot}/admin/passages/${c.id}/draft`,{method:'PATCH',headers:{'x-admin-token':token,'Content-Type':'application/json'},body:JSON.stringify({revision:c.revision,...d})});if(!firstId)firstId=c.id;await page.goto(`${root}/admin/reading/preview/passage/${c.id}`);await page.locator('.question-panel').waitFor();
 if(type==='true_false_not_given'||type==='yes_no_not_given'){await page.locator('.choice-three button').first().click();await page.locator('.choice-three button').nth(4).click();}
 else if(type==='multiple_choice_single'){await page.locator('.mcq-options button').first().click();await page.locator('.mcq-options button').nth(4).click();}
 else if(type==='multiple_choice_multiple'){await page.locator('.multiple-option').first().click();await page.locator('.multiple-option').nth(2).click();}
 else if(type.startsWith('matching_')){await page.locator('.matching-row select').first().selectOption(type==='matching_headings'?'i':'A');await page.locator('.matching-row select').nth(1).selectOption(type==='matching_headings'?'ii':'B');}
 else if(type.endsWith('_word_box')){await page.locator('.gap-inline select').first().selectOption('A');await page.locator('.gap-inline select').nth(1).selectOption('B');}
 else {const inputs=page.locator('.question-panel input');if(await inputs.count()>1){await inputs.first().fill('free');await inputs.nth(1).fill('soil');}}
 await page.screenshot({path:join(out,`${type}.png`)});console.log(type,c.id);}
await page.setViewportSize({width:390,height:844});await page.goto(`${root}/admin/reading/preview/passage/${firstId}`);await page.locator('.preview-shell').waitFor();await page.screenshot({path:join(out,'mobile.png')});await browser.close();
