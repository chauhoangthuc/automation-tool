import {chromium} from 'playwright';
import {mkdirSync} from 'node:fs';

const browser=await chromium.launch({headless:true,executablePath:'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',args:['--no-sandbox']});
try{
 const page=await browser.newPage({viewport:{width:1365,height:768},deviceScaleFactor:1});
 await page.addInitScript(()=>sessionStorage.setItem('reading-admin-token','local_admin_reading'));
 await page.goto('http://127.0.0.1:5173/admin/reading/preview/test/test_38603a42b8aa?passage=0&group=0');
 const palette=page.locator('.question-palette');
 await palette.waitFor();
 const exitAction=page.getByRole('link',{name:'Lưu & thoát'}),submitAction=page.getByRole('button',{name:'Nộp bài'});
 if(await exitAction.locator('svg.action-icon').count()!==1||await submitAction.locator('svg.action-icon').count()!==1)throw Error('Footer action icons are missing');
 for(const icon of [exitAction.locator('svg'),submitAction.locator('svg')]){const box=await icon.boundingBox();if(!box||box.width>22||box.height>22)throw Error(`Footer icon has invalid size: ${JSON.stringify(box)}`)}
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
 const passage=page.locator('.passage-panel'),questions=page.locator('.question-panel'),resizer=page.locator('.preview-resizer');
 const beforePassage=await passage.boundingBox(),beforeQuestions=await questions.boundingBox(),handle=await resizer.boundingBox();
 if(!beforePassage||!beforeQuestions||!handle)throw Error('Resizable panels are missing');
 await page.mouse.move(handle.x+handle.width/2,handle.y+handle.height/2);
 await page.mouse.down();
 await page.mouse.move(handle.x-170,handle.y+handle.height/2,{steps:8});
 await page.mouse.up();
 const afterPassage=await passage.boundingBox(),afterQuestions=await questions.boundingBox();
 if(!afterPassage||!afterQuestions||afterPassage.width>=beforePassage.width-100||afterQuestions.width<=beforeQuestions.width+100)throw Error(`Panels did not resize: ${JSON.stringify({beforePassage,beforeQuestions,afterPassage,afterQuestions})}`);
 await page.screenshot({path:'docs/reading-ui/screenshots/full-test-resizable-panels.png'});
 const saved=await page.evaluate(()=>Number(localStorage.getItem('reading-preview-split')));
 await page.reload();
 const persisted=await passage.boundingBox();
 if(!saved||!persisted||Math.abs(persisted.width-afterPassage.width)>5)throw Error('Panel ratio did not persist after reload');
 console.log('PASS full-test palette exposes questions 1-40 and split panels resize');
}finally{await browser.close()}
