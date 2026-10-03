import {chromium} from 'playwright';
import {mkdirSync} from 'node:fs';

const browser=await chromium.launch({headless:true,executablePath:'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',args:['--no-sandbox']});
try{
 const page=await browser.newPage({viewport:{width:1365,height:900}});
 await page.addInitScript(()=>sessionStorage.setItem('reading-admin-token','local-reading-admin'));
 await page.route('**/api/admin/passages/pv_5af70ab01438/preview',async route=>{
  const response=await route.fetch();const data=await response.json();
  data.content.questionGroups[0].instructionBlocks.find(x=>x.kind==='note').text='**TRUE** if the statement agrees\n**FALSE** if it contradicts\n^^NOT GIVEN^^ if there is no information';
  data.content.sections[0].blocks[0].text='**The founding** and development of many universities has been dependent on philanthropy.';
  await route.fulfill({response,json:data});
 });
 await page.goto('http://127.0.0.1:5173/admin/reading/preview/passage/pv_5af70ab01438');
 const note=page.locator('.note-strip');await note.waitFor();
 const boldCount=await note.locator('strong').count(),largeCount=await note.locator('.rich-large').count();
 if(boldCount!==2||largeCount!==1)throw Error(`Formatting was not rendered: bold=${boldCount}, large=${largeCount}, text=${await note.innerText()}`);
 const lines=await note.evaluate(el=>getComputedStyle(el).whiteSpace);
 if(lines!=='pre-wrap')throw Error(`NB line breaks are collapsed: ${lines}`);
 if(!(await note.innerText()).includes('agrees\nFALSE'))throw Error('NB line breaks were lost');
 if(await page.locator('.passage-body [data-block] strong').count()!==1)throw Error('Passage bold text was not rendered');
 mkdirSync('docs/reading-ui/screenshots',{recursive:true});
 await page.screenshot({path:'docs/reading-ui/screenshots/reading-rich-text-and-nb.png'});
 await page.goto('http://127.0.0.1:5173/admin/reading/passages/pv_5af70ab01438/edit');
 await page.getByRole('button',{name:'Nhóm câu hỏi'}).click();
 if(!await page.getByRole('button',{name:'Tô đậm NB / lưu ý'}).first().isVisible())throw Error('NB formatting toolbar missing');
 const nb=page.getByLabel('NB / lưu ý').first();const original=await nb.inputValue();
 await nb.evaluate(el=>{el.focus();el.setSelectionRange(0,Math.min(4,el.value.length))});
 await page.getByRole('button',{name:'Tô đậm NB / lưu ý'}).first().click();
 if(!(await nb.inputValue()).startsWith(`**${original.slice(0,4)}**`))throw Error('Bold toolbar did not wrap selected text');
 await nb.fill(original);
 await page.locator('.group-editor').first().scrollIntoViewIfNeeded();
 await page.screenshot({path:'docs/reading-ui/screenshots/reading-format-toolbar.png'});
 await page.getByRole('button',{name:'Bài đọc'}).click();
 if(!await page.getByRole('button',{name:'Chữ lớn Nội dung đoạn 1'}).first().isVisible())throw Error('Passage formatting toolbar missing');
 await page.evaluate(()=>import('/tests/validation.ts'));
 console.log('PASS rich text controls and multiline NB preview');
}finally{await browser.close()}
