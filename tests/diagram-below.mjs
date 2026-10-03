import {chromium} from 'playwright';
import {mkdirSync} from 'node:fs';

const id='pv_61ea5fc16893',base='http://127.0.0.1:5173';
const browser=await chromium.launch({headless:true,executablePath:'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',args:['--no-sandbox']});
try{
 const page=await browser.newPage({viewport:{width:1586,height:992}});
 await page.addInitScript(()=>sessionStorage.setItem('reading-admin-token','local-reading-admin'));
 await page.goto(`${base}/admin/reading/preview/passage/${id}`);
 await page.locator('.diagram-answer-list').waitFor();
 const inputs=page.locator('.diagram-answer-row input');
 if(await inputs.count()!==7)throw Error('Expected seven answer inputs below image');
 const labels=await inputs.evaluateAll(elements=>elements.map(element=>element.getAttribute('aria-label')));
 if(labels.join(',')!=='Câu 20,Câu 21,Câu 22,Câu 23,Câu 24,Câu 25,Câu 26')throw Error(`Wrong numbers: ${labels}`);
 if(await page.locator('.diagram-anchor,.diagram-connectors').count())throw Error('Overlay controls appeared in below-image layout');
 if(!(await page.locator('.diagram-stage img').evaluate(image=>image.complete&&image.naturalWidth>0)))throw Error('Attached Falkirk image failed to load');
 mkdirSync('docs/reading-ui/screenshots',{recursive:true});
 await page.screenshot({path:'docs/reading-ui/screenshots/diagram-falkirk-below-preview.png'});
 await inputs.first().fill('test answer');
 if(await inputs.first().inputValue()!=='test answer')throw Error('Below-image answer input did not work');
 await page.locator('.question-palette').getByRole('button',{name:'26'}).click();
 await page.locator('.diagram-answer-row').last().waitFor();
 await page.waitForTimeout(350);
 const lastBounds=await page.locator('.diagram-answer-row').last().boundingBox();
 if(!lastBounds||lastBounds.y<0||lastBounds.y>900)throw Error('Footer did not navigate to question 26 below image');
 await page.goto(`${base}/admin/reading/passages/${id}/edit`);
 await page.getByRole('button',{name:'Nhóm câu hỏi'}).click();
 await page.getByRole('radio',{name:/Ảnh đã in sẵn số/}).waitFor();
 if(!await page.getByRole('radio',{name:/Ảnh đã in sẵn số/}).isChecked())throw Error('Editor did not reload below-image layout');
 if(await page.locator('.diagram-placement-stage').count())throw Error('Positioner should be hidden for below-image layout');
 await page.setViewportSize({width:1440,height:900});
 await page.locator('.diagram-source-preview').scrollIntoViewIfNeeded();
 await page.screenshot({path:'docs/reading-ui/screenshots/diagram-falkirk-below-editor.png'});
 await page.getByRole('radio',{name:/Ô trả lời đặt trên ảnh/}).check();
 await page.locator('.diagram-placement-stage').waitFor();
 await page.getByRole('radio',{name:/Ảnh đã in sẵn số/}).check();
 await page.locator('.diagram-source-preview').waitFor();
 console.log('PASS diagram below-image preview: attached image, slots 20–26, editor layout switch');
}finally{await browser.close()}
