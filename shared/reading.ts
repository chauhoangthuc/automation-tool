export const TYPES = [
  'true_false_not_given','yes_no_not_given','multiple_choice_single','multiple_choice_multiple',
  'matching_headings','matching_information','matching_features','matching_sentence_endings',
  'sentence_completion','short_answer','summary_completion_text','note_completion_text',
  'table_completion_text','flowchart_completion_text','diagram_completion_text',
  'summary_completion_word_box','note_completion_word_box','table_completion_word_box','flowchart_completion_word_box'
] as const;
export type QuestionType = typeof TYPES[number];
export type Part = {kind:'text';text:string}|{kind:'gap';questionId:string};
export type Question = {id:string;number:number;prompt?:string;targetSectionId?:string;options?:Option[]};
export type Option = {id:string;text:string};
export type Instruction = {kind:'instruction'|'answer_format'|'note';text:string};
export type Content = {kind:'question_list';title?:string}|{kind:'rich_text_with_gaps'|'notes';title?:string;blocks:{kind:'paragraph'|'heading'|'subheading'|'bullet';level?:number;parts:Part[]}[]}|{kind:'table';title?:string;rows:{parts:Part[];isHeader?:boolean}[][]}|{kind:'flowchart';title?:string;steps:{id:string;parts:Part[];nextStepIds?:string[]}[]}|{kind:'diagram';title?:string;assetId:string;alt:string;answerPlacement?:'image'|'below';anchors:{questionId:string;xPercent:number;yPercent:number;sourceXPercent?:number;sourceYPercent?:number;label?:string}[]};
export type Group = {id:string;order:number;type:QuestionType;sourceHeading?:string;instructionBlocks:Instruction[];settings?:{optionReuse?:'allowed'|'not_allowed';maxWords?:number;allowNumber?:boolean;selectionCount?:number;scoring?:'per_slot'|'unordered_set'};options?:Option[];content:Content;questions:Question[]};
export type Passage = {schemaVersion:1;passageVersionId:string;label?:string;leadIn?:string;title:string;description?:string;sections:{id:string;label:string;blocks:{id:string;kind:'paragraph'|'subheading'|'caption';text:string}[]}[];questionGroups:Group[]};
export type Answer = {questionId:string;acceptedAnswers:string[];explanation:string;evidence:{sectionId:string;blockId:string;quote:string}[]};
export type AnswerKey = {schemaVersion:1;passageVersionId:string;answers:Answer[]};
export type Draft = {content:Passage;answerKey:AnswerKey};
export type Issue = {path:string;message:string};
export const uid = (prefix='id') => `${prefix}_${crypto.randomUUID().replaceAll('-','').slice(0,12)}`;
export const isWordBox = (type:QuestionType) => type.endsWith('_word_box');
export const isTextCompletion = (type:QuestionType) => type.endsWith('_text') || type==='sentence_completion' || type==='short_answer';
export const isMatching = (type:QuestionType) => type.startsWith('matching_');
export const optionLabel = (index:number) => String.fromCharCode(65+index);
export const makeQuestion = (number:number):Question => ({id:uid('q'),number,prompt:''});
export const makeAnswer = (questionId:string):Answer => ({questionId,acceptedAnswers:[],explanation:'',evidence:[]});
export function defaultContent(type:QuestionType, questionId:string):Content {
  if (type.startsWith('note_')) return {kind:'notes',title:'',blocks:[{kind:'heading',parts:[{kind:'text',text:''}]},{kind:'bullet',parts:[{kind:'text',text:''},{kind:'gap',questionId}]}]};
  if (type.startsWith('summary_')) return {kind:'rich_text_with_gaps',title:'',blocks:[{kind:'paragraph',parts:[{kind:'text',text:''},{kind:'gap',questionId}]}]};
  if (type.startsWith('table_')) return {kind:'table',title:'',rows:[[{parts:[{kind:'text',text:'Heading'}],isHeader:true}],[{parts:[{kind:'gap',questionId}]}]]};
  if (type.startsWith('flowchart_')) return {kind:'flowchart',title:'',steps:[{id:uid('step'),parts:[{kind:'gap',questionId}]}]};
  if (type==='diagram_completion_text') return {kind:'diagram',title:'',assetId:'',alt:'',anchors:[{questionId,xPercent:50,yPercent:50}]};
  return {kind:'question_list',title:''};
}
export function makeGroup(type:QuestionType,number:number):Group {
  const q=makeQuestion(number);
  const group:Group={id:uid('g'),order:1,type,instructionBlocks:[{kind:'instruction',text:''}],content:defaultContent(type,q.id),questions:[q]};
  if (isWordBox(type)||isMatching(type)||type==='multiple_choice_multiple') group.options=[{id:'A',text:''},{id:'B',text:''}];
  if (type==='multiple_choice_single') q.options=[{id:'A',text:''},{id:'B',text:''}];
  if (type==='multiple_choice_multiple') group.settings={selectionCount:2,scoring:'unordered_set'};
  if (isMatching(type)||isWordBox(type)) group.settings={optionReuse:'allowed'};
  if (isTextCompletion(type)) group.settings={maxWords:1,allowNumber:false};
  return group;
}
export function makePassage():Draft {
  const id=uid('pv'); const sectionId=uid('sec');
  return {content:{schemaVersion:1,passageVersionId:id,title:'',description:'',sections:[{id:sectionId,label:'A',blocks:[{id:uid('blk'),kind:'paragraph',text:''}]}],questionGroups:[]},answerKey:{schemaVersion:1,passageVersionId:id,answers:[]}};
}
export function allParts(content:Content):Part[] {
  if(content.kind==='question_list'||content.kind==='diagram')return [];
  if(content.kind==='table')return content.rows.flatMap(row=>row.flatMap(cell=>cell.parts));
  if(content.kind==='flowchart')return content.steps.flatMap(step=>step.parts);
  return content.blocks.flatMap(block=>block.parts);
}
export function addQuestion(group:Group,nextNumber:number):Question {
  const q=makeQuestion(nextNumber); group.questions.push(q);
  if(group.type==='multiple_choice_single')q.options=[{id:'A',text:''},{id:'B',text:''}];
  const c=group.content;
  if(c.kind==='rich_text_with_gaps'||c.kind==='notes')c.blocks.push({kind:c.kind==='notes'?'bullet':'paragraph',parts:[{kind:'text',text:''},{kind:'gap',questionId:q.id}]});
  if(c.kind==='table')c.rows.push(Array.from({length:c.rows[0]?.length??1},(_,i)=>({parts:i===0?[{kind:'gap' as const,questionId:q.id}]:[{kind:'text' as const,text:''}]})));
  if(c.kind==='flowchart')c.steps.push({id:uid('step'),parts:[{kind:'gap',questionId:q.id}]});
  if(c.kind==='diagram')c.anchors.push({questionId:q.id,xPercent:50,yPercent:50});
  return q;
}
export function renumber(passages:Passage[],start?:number){let n=start??Math.min(...passages.flatMap(p=>p.questionGroups.flatMap(g=>g.questions.map(q=>q.number))));if(!Number.isFinite(n))n=1;for(const p of passages)for(const [gi,g] of p.questionGroups.entries()){g.order=gi+1;for(const q of g.questions)q.number=n++;}}
export function heading(g:Group){const nums=g.questions.map(q=>q.number);return nums.length?`Câu hỏi ${nums[0]}${nums.length>1?'–'+nums.at(-1):''}`:'Câu hỏi';}
