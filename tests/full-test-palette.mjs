import {chromium} from 'playwright';
import {mkdirSync} from 'node:fs';

const browser=await chromium.launch({headless:true,executablePath:'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',args:['--no-sandbox']});
try{
 const page=await browser.newPage({viewport:{width:1365,height:768},deviceScaleFactor:1});
 await page.addInitScript(()=>sessionStorage.setItem('reading-admin-token','local_admin_reading'));
 await page.goto('http://127.0.0.1:5173/admin/reading/preview/test/test_38603a42b8aa?passage=0&group=0');
 const palette=page.locator('.question-palette');
 await palette.waitFor();
 const numbers=palette.locator('button');
 if(await numbers.count()!==40)throw Error(`Expected 40 question buttons, got ${await numbers.count()}`);
 const initial=await palette.evaluate(el=>({left:el.getBoundingClientRect().left,scrollLeft:el.scrollLeft,scrollWidth:el.scrollWidth,clientWidth:el.clientWidth}));
 const first=await numbers.first().boundingBox();
 if(!first||initial.scrollLeft!==0||first.x<initial.left-1)throw Error(`Question 1 is clipped initially: ${JSON.stringify({initial,first})}`);
 await palette.evaluate(el=>{el.scrollLeft=el.scrollWidth});
 if(!await numbers.last().isVisible())throw Error('Question 40 is not reachable');
 await palette.evaluate(el=>{el.scrollLeft=0});
 if(!await numbers.first().isVisible())throw Error('Question 1 is not reachable after scrolling back');
 mkdirSync('docs/reading-ui/screenshots',{recursive:true});
 await page.screenshot({path:'docs/reading-ui/screenshots/full-test-palette-1-40.png'});
 console.log('PASS full-test palette exposes questions 1-40');
}finally{await browser.close()}
