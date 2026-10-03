import {chromium} from 'playwright';
import {mkdirSync} from 'node:fs';

const base='http://127.0.0.1:5173',token=process.env.READING_ADMIN_TOKEN||'local-reading-admin';
const api=process.env.READING_API_URL||'http://127.0.0.1:3001';
const exercises=await fetch(`${api}/api/admin/exercises`,{headers:{'x-admin-token':token}}).then(r=>r.json());
const demo=exercises.find(x=>x.slug==='diagram-rainwater-demo');if(!demo)throw Error('Run node scripts/create-diagram-demo.mjs first');
const id=demo.passage_version_id;
const browser=await chromium.launch({headless:true,executablePath:'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',args:['--no-sandbox']});
try{
 const page=await browser.newPage({viewport:{width:1586,height:992},deviceScaleFactor:1});
 await page.addInitScript(value=>sessionStorage.setItem('reading-admin-token',value),token);
 await page.goto(`${base}/admin/reading/preview/passage/${id}`);
 await page.locator('.diagram-stage img').waitFor();
 const anchors=page.locator('.diagram-anchor');if(await anchors.count()!==3)throw Error('Expected three diagram gaps');
 const stage=await page.locator('.diagram-stage').boundingBox();
 for(let i=0;i<3;i++){const box=await anchors.nth(i).boundingBox();if(!box||!stage||box.x<stage.x||box.x+box.width>stage.x+stage.width||box.y<stage.y||box.y+box.height>stage.y+stage.height)throw Error(`Gap ${i+1} falls outside the diagram`)}
 mkdirSync('docs/reading-ui/screenshots',{recursive:true});
 await page.screenshot({path:'docs/reading-ui/screenshots/diagram-demo-preview.png'});
 for(const [i,answer] of ['roof','mesh filter','storage tank'].entries())await page.getByRole('textbox',{name:`Câu ${i+1}`}).fill(answer);
 await page.getByRole('button',{name:'Nộp bài'}).click();await page.locator('.grade-banner').waitFor();
 if(!(await page.locator('.grade-banner').innerText()).includes('3/3'))throw Error('Diagram sample was not graded 3/3');
 await page.goto(`${base}/admin/reading/passages/${id}/edit`);
 await page.getByRole('button',{name:'Nhóm câu hỏi'}).click();
 await page.locator('.diagram-editor-image').waitFor();
 await page.locator('.diagram-editor-image').scrollIntoViewIfNeeded();
 await page.screenshot({path:'docs/reading-ui/screenshots/diagram-demo-editor.png'});
 console.log(`PASS diagram demo: ${id}, 3 visible gaps, grade 3/3`);
}finally{await browser.close()}
