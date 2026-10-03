import {chromium} from 'playwright';
import {mkdirSync} from 'node:fs';

const browser=await chromium.launch({headless:true,executablePath:'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',args:['--no-sandbox']});
try{
 const page=await browser.newPage({viewport:{width:1365,height:900},deviceScaleFactor:1});
 await page.goto('http://127.0.0.1:5173/reading/preview/passage/community-gardens');
 await page.locator('.question-panel').waitFor();
 const footer=page.locator('.preview-footer');
 for(const name of ['Gợi ý','Xem lời giải','Lưu câu'])if(await footer.getByRole('button',{name}).count())throw Error(`${name} remains in footer`);
 if(!await footer.getByRole('link',{name:'Lưu & thoát'}).isVisible())throw Error('Save and exit is not visible');
 if(await page.locator('.review-list').count())throw Error('Explanations are visible before submission');
 const mark=page.getByRole('button',{name:'Lưu câu 1'});
 await mark.click();
 if(await mark.getAttribute('aria-pressed')!=='true')throw Error('Bookmark did not activate');
 await page.reload();
 if(await page.getByRole('button',{name:'Bỏ lưu câu 1'}).getAttribute('aria-pressed')!=='true')throw Error('Bookmark did not persist after reload');
 await page.setViewportSize({width:1365,height:600});
 const scroll=page.locator('.question-scroll');
 await scroll.evaluate(el=>{el.scrollTop=el.scrollHeight});
 const state=await page.evaluate(()=>{const head=document.querySelector('.question-panel-head');const panel=document.querySelector('.question-panel');const scroll=document.querySelector('.question-scroll');return {headTop:head.getBoundingClientRect().top,panelTop:panel.getBoundingClientRect().top,scrollTop:scroll.scrollTop,scrollHeight:scroll.scrollHeight,clientHeight:scroll.clientHeight}});
 if(state.scrollHeight<=state.clientHeight||state.scrollTop<=0||state.headTop>=state.panelTop)throw Error(`Group heading did not scroll with questions: ${JSON.stringify(state)}`);
 await scroll.evaluate(el=>{el.scrollTop=0});
 await page.setViewportSize({width:1365,height:900});
 mkdirSync('docs/reading-ui/screenshots',{recursive:true});
 await page.screenshot({path:'docs/reading-ui/screenshots/preview-feedback-desktop.png'});
 await page.getByRole('button',{name:'Nộp bài'}).click();
 await page.locator('.grade-banner').waitFor();
 await page.locator('.review-list').waitFor();
 await page.addInitScript(()=>sessionStorage.setItem('reading-admin-token','local-reading-admin'));
 await page.goto('http://127.0.0.1:5173/admin/reading/preview/passage/pv_5af70ab01438');
 if(await page.locator('.question-card').count()===8){
  await page.screenshot({path:'docs/reading-ui/screenshots/preview-feedback-eight-questions.png'});
  const longScroll=page.locator('.question-scroll');
  await longScroll.evaluate(el=>{el.scrollTop=el.scrollHeight});
  const longState=await page.evaluate(()=>({top:document.querySelector('.question-panel-head').getBoundingClientRect().top,panelTop:document.querySelector('.question-panel').getBoundingClientRect().top,scrollTop:document.querySelector('.question-scroll').scrollTop}));
  if(longState.scrollTop<=0||longState.top>=longState.panelTop)throw Error(`Eight-question scroll failed: ${JSON.stringify(longState)}`);
 }
 await page.setViewportSize({width:390,height:844});
 await page.getByRole('button',{name:'Câu hỏi',exact:true}).click();
 if(!await page.getByRole('link',{name:'Lưu & thoát'}).isVisible())throw Error('Save and exit is hidden on mobile');
 if(!await page.getByRole('button',{name:'Lưu câu 1'}).isVisible())throw Error('Question bookmark is hidden on mobile');
 console.log('PASS preview controls, unified scroll, bookmark persistence, post-submit review');
}finally{await browser.close()}
