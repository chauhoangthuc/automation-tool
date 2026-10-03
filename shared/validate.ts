import type {AnswerKey,Group,Issue,Passage,QuestionType} from './reading';
import {allParts,isMatching,isWordBox} from './reading';
import {normalizeEnumAnswer} from './grading';
import {plainReadingText} from './richText';

const enumAnswers:Partial<Record<QuestionType,string[]>>={true_false_not_given:['TRUE','FALSE','NOT GIVEN'],yes_no_not_given:['YES','NO','NOT GIVEN']};
const completionTypes=['summary_completion_','note_completion_','table_completion_','flowchart_completion_','diagram_completion_'];
const textTypes=['sentence_completion','short_answer'];
const idsUnique=(ids:string[])=>new Set(ids).size===ids.length;
export function businessValidate(p:Passage,key:AnswerKey,start=1):Issue[]{
 const issues:Issue[]=[]; const add=(path:string,message:string)=>issues.push({path,message});
 if(!p.title.trim())add('title','Cần nhập tiêu đề bài đọc');
 if(!p.description?.trim())add('description','Cần nhập mô tả ngay dưới tiêu đề');
 if(!p.sections.length)add('sections','Cần ít nhất một section');
 const sectionIds=p.sections.map(s=>s.id); if(!idsUnique(sectionIds))add('sections','Section ID bị trùng');
 const blocks=new Map<string,{sectionId:string;text:string}>();
 p.sections.forEach((s,si)=>{if(!s.label.trim())add(`sections[${si}].label`,'Thiếu nhãn');if(!s.blocks.length)add(`sections[${si}].blocks`,'Cần đoạn văn');s.blocks.forEach((b,bi)=>{if(!b.text.trim())add(`sections[${si}].blocks[${bi}].text`,'Đoạn văn trống');if(blocks.has(b.id))add(`sections[${si}].blocks[${bi}].id`,'Block ID trùng');blocks.set(b.id,{sectionId:s.id,text:b.text});});});
 if(!p.questionGroups.length)add('questionGroups','Cần ít nhất một nhóm câu hỏi');
 if(!idsUnique(p.questionGroups.map(g=>g.id)))add('questionGroups','Group ID bị trùng');
 const allIds:string[]=[];let expected=start;
 p.questionGroups.forEach((g,gi)=>{
  const path=`questionGroups[${gi}]`; const ids=g.questions.map(q=>q.id); allIds.push(...ids);
  if(g.order!==gi+1)add(`${path}.order`,'Thứ tự nhóm không liên tục');
  if(!g.instructionBlocks.some(b=>b.kind==='instruction'&&b.text.trim()))add(`${path}.instructionBlocks`,'Cần instruction');
  if(!g.questions.length)add(`${path}.questions`,'Cần ít nhất một câu/ô');
  g.questions.forEach((q,qi)=>{if(q.number!==expected++)add(`${path}.questions[${qi}].number`,'Số câu phải liên tục');});
  if(g.sourceHeading?.trim()){
   const a=g.questions[0]?.number,b=g.questions.at(-1)?.number,numbers=(g.sourceHeading.match(/\d+/g)||[]).map(Number);
   if(a&&b&&(!numbers.length||numbers[0]!==a||numbers.at(-1)!==b))add(`${path}.sourceHeading`,'Heading không khớp dải câu');
  }
  validateGroup(g,gi,p,add);
 });
 if(!idsUnique(allIds))add('questionGroups','Question ID bị trùng');
 if(key.passageVersionId!==p.passageVersionId)add('answerKey.passageVersionId','Không khớp passage');
 const answerIds=key.answers.map(a=>a.questionId);if(!idsUnique(answerIds))add('answerKey.answers','Answer ID bị trùng');
 for(const [gi,g] of p.questionGroups.entries())for(const [qi,q] of g.questions.entries()){
  const path=`questionGroups[${gi}].questions[${qi}]`;const a=key.answers.find(x=>x.questionId===q.id);
  if(!a){add(`${path}.answer`,'Thiếu đáp án');continue;}
  if(!a.acceptedAnswers.length||a.acceptedAnswers.some(v=>!v.trim()))add(`${path}.answer`,'Đáp án trống');
  if(!a.explanation.trim())add(`${path}.explanation`,'Cần giải thích riêng');
  a.evidence.forEach((e,ei)=>{const b=blocks.get(e.blockId);if(!b||b.sectionId!==e.sectionId)add(`${path}.evidence[${ei}]`,'Đoạn chứng cứ không tồn tại');else if(!plainReadingText(b.text).includes(plainReadingText(e.quote)))add(`${path}.evidence[${ei}].quote`,'Quote không còn trong đoạn');});
  const allowed=enumAnswers[g.type];if(allowed&&a.acceptedAnswers.some(v=>!allowed.includes(normalizeEnumAnswer(v))))add(`${path}.answer`,'Đáp án phải thuộc enum của dạng');
  if((allowed||isMatching(g.type)||isWordBox(g.type)||g.type.startsWith('multiple_choice'))&&a.acceptedAnswers.length!==1)add(`${path}.answer`,'Mỗi answer slot cần đúng một giá trị');
  const opts=g.type==='multiple_choice_single'?q.options:g.options;
  if(opts&&(isMatching(g.type)||isWordBox(g.type)||g.type.startsWith('multiple_choice'))){const optIds=opts.map(o=>o.id);if(a.acceptedAnswers.some(v=>!optIds.includes(v)))add(`${path}.answer`,'Đáp án không thuộc options');}
  if((textTypes.includes(g.type)||g.type.endsWith('_text'))&&g.settings?.maxWords&&a.acceptedAnswers.some(v=>v.trim().split(/\s+/).length>g.settings!.maxWords!))add(`${path}.answer`,'Đáp án vượt giới hạn từ');
  if((textTypes.includes(g.type)||g.type.endsWith('_text'))&&g.settings?.allowNumber===false&&a.acceptedAnswers.some(v=>/\d/.test(v)))add(`${path}.answer`,'Dạng này không cho phép số');
 }
 for(const id of answerIds)if(!allIds.includes(id))add('answerKey.answers','Đáp án trỏ đến câu không tồn tại');
 for(const [gi,g] of p.questionGroups.entries()){
  if(g.settings?.optionReuse==='not_allowed'&&(isMatching(g.type)||isWordBox(g.type))){const values=g.questions.flatMap(q=>key.answers.find(a=>a.questionId===q.id)?.acceptedAnswers??[]);if(!idsUnique(values))add(`questionGroups[${gi}].settings.optionReuse`,'Đáp án bị dùng lại khi không cho phép');}
  const note=g.instructionBlocks.filter(x=>x.kind==='note').map(x=>x.text).join(' ');if(g.settings?.optionReuse==='not_allowed'&&/may use.{0,30}more than once|có thể.{0,30}nhiều lần/i.test(note))add(`questionGroups[${gi}].instructionBlocks`,'NB mâu thuẫn với thiết lập không dùng lại');
  if(g.type==='multiple_choice_multiple'){
   const n=g.settings?.selectionCount??0;const values=g.questions.map(q=>key.answers.find(a=>a.questionId===q.id)?.acceptedAnswers[0]).filter(Boolean);
   if(g.questions.length!==n||values.length!==n||!idsUnique(values as string[]))add(`questionGroups[${gi}].settings.selectionCount`,'Số slot, số đáp án và số lựa chọn phải bằng nhau');
  }
 }
 return issues;
}
function validateGroup(g:Group,gi:number,p:Passage,add:(path:string,message:string)=>void){
 const path=`questionGroups[${gi}]`;const qs=new Set(g.questions.map(q=>q.id));
 if(g.options){if(g.options.length<2)add(`${path}.options`,'Cần ít nhất 2 options');if(!idsUnique(g.options.map(o=>o.id)))add(`${path}.options`,'Option ID trùng');g.options.forEach((o,i)=>{if(!o.id.trim()||!o.text.trim())add(`${path}.options[${i}]`,'Option ID/text trống');});}
 if(g.type==='multiple_choice_single')g.questions.forEach((q,i)=>{if(!q.prompt?.trim())add(`${path}.questions[${i}].prompt`,'Thiếu prompt');if(!q.options||q.options.length<2||q.options.some(o=>!o.text.trim())||!idsUnique(q.options.map(o=>o.id)))add(`${path}.questions[${i}].options`,'Cần ít nhất 2 options có ID duy nhất');});
 if(g.type==='multiple_choice_multiple'&&!g.questions[0]?.prompt?.trim())add(`${path}.questions[0].prompt`,'Thiếu prompt chung');
 if(isMatching(g.type)){if(!g.options)add(`${path}.options`,'Thiếu option bank');g.questions.forEach((q,i)=>{if(g.type==='matching_headings'){if(!p.sections.some(s=>s.id===q.targetSectionId))add(`${path}.questions[${i}].targetSectionId`,'Section không tồn tại');}else if(!q.prompt?.trim())add(`${path}.questions[${i}].prompt`,'Thiếu statement/beginning');});}
 if(g.type==='true_false_not_given'||g.type==='yes_no_not_given'||g.type==='short_answer')g.questions.forEach((q,i)=>{if(!q.prompt?.trim())add(`${path}.questions[${i}].prompt`,'Thiếu statement/prompt');});
 if(g.type==='sentence_completion')g.questions.forEach((q,i)=>{if(!q.prompt?.includes('[[gap]]'))add(`${path}.questions[${i}].prompt`,'Câu cần marker [[gap]]');});
 if(completionTypes.some(prefix=>g.type.startsWith(prefix))){const c=g.content;const refs=c.kind==='diagram'?c.anchors.map(a=>a.questionId):allParts(c).filter(x=>x.kind==='gap').map(x=>x.questionId);if(!idsUnique(refs))add(`${path}.content`,'Gap ID bị lặp');for(const id of refs)if(!qs.has(id))add(`${path}.content`,'Gap tham chiếu câu không tồn tại');for(const id of qs)if(!refs.includes(id))add(`${path}.content`,'Có câu/ô mồ côi');}
 if(g.content.kind==='table'){const widths=g.content.rows.map(r=>r.length);if(widths.some(w=>w!==widths[0]))add(`${path}.content.rows`,'Các hàng cần cùng số cột');if(g.content.rows.length<2)add(`${path}.content.rows`,'Bảng cần header và hàng dữ liệu');if(!g.content.rows[0]?.some(cell=>cell.isHeader))add(`${path}.content.rows[0]`,'Hàng đầu cần header');}
 if(g.content.kind==='flowchart'){const ids=g.content.steps.map(s=>s.id);if(!idsUnique(ids))add(`${path}.content.steps`,'Step ID trùng');g.content.steps.forEach((s,i)=>s.nextStepIds?.forEach(id=>{if(!ids.includes(id))add(`${path}.content.steps[${i}].nextStepIds`,'Edge trỏ step không tồn tại');}));}
 if(g.content.kind==='diagram'){if(!g.content.assetId)add(`${path}.content.assetId`,'Thiếu ảnh sơ đồ');if(!g.content.alt.trim())add(`${path}.content.alt`,'Thiếu alt text');g.content.anchors.forEach((a,i)=>{if(a.xPercent<0||a.xPercent>100||a.yPercent<0||a.yPercent>100)add(`${path}.content.anchors[${i}]`,'Anchor phải trong 0–100%');if((a.sourceXPercent===undefined)!==(a.sourceYPercent===undefined))add(`${path}.content.anchors[${i}]`,'Điểm nối cần cả X và Y');if(a.sourceXPercent!==undefined&&(a.sourceXPercent<0||a.sourceXPercent>100)||a.sourceYPercent!==undefined&&(a.sourceYPercent<0||a.sourceYPercent>100))add(`${path}.content.anchors[${i}]`,'Điểm nối phải trong 0–100%');});}
 if(isWordBox(g.type)&&!g.options)add(`${path}.options`,'Thiếu hộp từ');
}
