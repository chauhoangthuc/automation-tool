import {chromium} from 'playwright';
import {mkdirSync} from 'node:fs';

const browser=await chromium.launch({headless:true,executablePath:'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',args:['--no-sandbox']});
try{
 const page=await browser.newPage({viewport:{width:1440,height:900}});
 await page.addInitScript(()=>sessionStorage.setItem('reading-admin-token','local-reading-admin'));
 await page.goto('http://127.0.0.1:5173/admin/reading');
 await page.getByLabel('Lọc theo dạng câu').selectOption('diagram_completion_text');
 const cards=page.locator('.dashboard-card');
 await cards.first().waitFor();
 const count=await cards.count();
 if(count<2)throw Error(`Expected demo and type draft, got ${count} diagram cards`);
 for(const type of await cards.allTextContents())if(!type.includes('Diagram · text'))throw Error(`Wrong type in diagram filter: ${type}`);
 await page.getByLabel('Tìm bài hoặc dạng câu').fill('Mẫu');
 if(!await page.getByText('Mẫu · Diagram Completion Text').count())throw Error('Search did not find the diagram type draft');
 mkdirSync('docs/reading-ui/screenshots',{recursive:true});
 await page.screenshot({path:'docs/reading-ui/screenshots/dashboard-type-search.png'});
 await page.getByLabel('Tìm bài hoặc dạng câu').fill('');
 await page.getByLabel('Lọc theo dạng câu').selectOption('flowchart_completion_word_box');
 const mixed=page.locator('.dashboard-card').filter({hasText:'Rainwater Collection'});
 await mixed.getByRole('link',{name:'Preview ↗'}).click();
 await page.locator('.breadcrumb').getByText('Flowchart · word box').waitFor();
 if(!page.url().includes('group=1'))throw Error(`Mixed passage opened wrong group: ${page.url()}`);
 console.log(`PASS dashboard filter/search: ${count} diagram items, template found`);
}finally{await browser.close()}
