import type {AnswerKey,Group,Passage,QuestionType} from './reading';

export type QuestionResult={questionId:string;number:number;passageIndex:number;groupId:string;type:QuestionType;status:'correct'|'incorrect'|'unanswered';submitted:string;correctAnswers:string[]};
export type GradeResult={correct:number;incorrect:number;unanswered:number;total:number;questions:QuestionResult[]};

const compact=(value:string)=>value.normalize('NFKC').trim().replace(/\s+/g,' ').toLocaleUpperCase('en-US');
export function normalizeEnumAnswer(value:string){const normalized=compact(value).replace(/[\s_-]/g,'');return normalized==='NOTGIVEN'?'NOT GIVEN':compact(value)}
const normalizeForType=(value:string,type:QuestionType)=>type==='true_false_not_given'||type==='yes_no_not_given'?normalizeEnumAnswer(value):compact(value);

export function gradeSubmission(passages:Passage[],keys:AnswerKey[],answers:Record<string,string>):GradeResult{
 const questions:QuestionResult[]=[];
 passages.forEach((passage,passageIndex)=>passage.questionGroups.forEach(group=>{
  const key=keys[passageIndex];const correctSet=new Set(group.questions.map(q=>normalizeForType(key.answers.find(a=>a.questionId===q.id)?.acceptedAnswers[0]||'',group.type)));
  const used=new Set<string>();
  group.questions.forEach(q=>{
   const answer=key.answers.find(a=>a.questionId===q.id);const submitted=answers[q.id]||'';const value=normalizeForType(submitted,group.type);
   let correct=false;
   if(value){
    if(group.type==='multiple_choice_multiple'&&group.settings?.scoring!=='per_slot'){
     correct=correctSet.has(value)&&!used.has(value);used.add(value);
    }else correct=Boolean(answer?.acceptedAnswers.some(candidate=>normalizeForType(candidate,group.type)===value));
   }
   questions.push({questionId:q.id,number:q.number,passageIndex,groupId:group.id,type:group.type,status:!value?'unanswered':correct?'correct':'incorrect',submitted,correctAnswers:answer?.acceptedAnswers.map(candidate=>group.type==='true_false_not_given'||group.type==='yes_no_not_given'?normalizeEnumAnswer(candidate):candidate)||[]});
  });
 }));
 const correct=questions.filter(q=>q.status==='correct').length,unanswered=questions.filter(q=>q.status==='unanswered').length;
 return {correct,incorrect:questions.length-correct-unanswered,unanswered,total:questions.length,questions};
}
