import {chromium} from 'playwright';
import {mkdirSync} from 'node:fs';

const base='http://127.0.0.1:3001/api',headers={'x-admin-token':'local-reading-admin'};
const exercises=(await fetch(`${base}/admin/exercises`,{headers}).then(response=>response.json())).filter(item=>item.slug.startsWith('reading-type-draft-'));
if(exercises.length!==19)throw Error(`Expected 19 type examples, found ${exercises.length}`);
mkdirSync('docs/reading-ui/screenshots/type-previews',{recursive:true});
const browser=await chromium.launch({headless:true,executablePath:'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',args:['--no-sandbox']});
try{
 const page=await browser.newPage({viewport:{width:1586,height:992}});
 await page.addInitScript(()=>sessionStorage.setItem('reading-admin-token','local-reading-admin'));
 const pageErrors=[];page.on('pageerror',error=>pageErrors.push(error.message));
 for(const exercise of exercises){
  const group=exercise.passage.content.questionGroups[0];
  const type=group.type;
  if(exercise.passage.content.questionGroups.length!==1)throw Error(`${type}: not a dedicated one-type preview`);
  const checked=await fetch(`${base}/admin/passages/${exercise.passage_version_id}/validate`,{method:'POST',headers}).then(response=>response.json());
  if(!checked.valid)throw Error(`${type}: validation failed ${JSON.stringify(checked.issues)}`);
  const answers=Object.fromEntries(exercise.passage.answerKey.answers.map(answer=>[answer.questionId,answer.acceptedAnswers[0]]));
  const graded=await fetch(`${base}/admin/passages/${exercise.passage_version_id}/grade`,{method:'POST',headers:{...headers,'Content-Type':'application/json'},body:JSON.stringify({answers})}).then(response=>response.json());
  if(graded.grade.correct!==group.questions.length||graded.grade.total!==group.questions.length)throw Error(`${type}: grading failed ${JSON.stringify(graded.grade)}`);
  await page.goto(`http://127.0.0.1:5173/admin/reading/preview/passage/${exercise.passage_version_id}`);
  await page.locator('.question-panel').waitFor();
  if(await page.locator('.group-switch option').count()!==1)throw Error(`${type}: more than one group in Preview`);
  if(!(await page.locator('.question-panel').textContent()).includes(group.instructionBlocks[0].text))throw Error(`${type}: missing instruction`);
  const content=page.locator('.question-card,.content-card,.multiple-renderer');
  if(!await content.count())throw Error(`${type}: question renderer missing`);
  if(type==='diagram_completion_text'){
   if(!(await page.locator('.diagram-stage img').evaluate(image=>image.complete&&image.naturalWidth>0)))throw Error('Diagram image failed to load');
   const placeholders=await page.locator('.diagram-anchor input').evaluateAll(inputs=>inputs.map(input=>input.placeholder.toLowerCase()));
   if(placeholders.some((placeholder,index)=>placeholder===exercise.passage.answerKey.answers[index].acceptedAnswers[0].toLowerCase()))throw Error('Diagram placeholder reveals answer');
  }
  await page.screenshot({path:`docs/reading-ui/screenshots/type-previews/${type}.png`});
  console.log(`PASS ${type}: ${group.questions.length} questions, valid, graded, rendered`);
 }
 if(pageErrors.length)throw Error(`Preview page errors: ${pageErrors.join('; ')}`);
}finally{await browser.close()}
