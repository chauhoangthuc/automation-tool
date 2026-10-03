import type {ComponentType} from 'react';
import type {AnswerKey,Group,Issue,Passage,QuestionType} from '../shared/reading';
import {TYPES,makeGroup} from '../shared/reading';
import {businessValidate} from '../shared/validate';
import {ListEditor,MultipleEditor,GapEditor,DiagramEditor} from './typeEditors';
import {ListRenderer,MultipleRenderer,GapRenderer,DiagramRenderer} from './typeRenderers';
export type EditorProps={group:Group;sections:{id:string;label:string}[];onChange:()=>void;onUpload:(file:File)=>Promise<string>;onDeleteQuestion?:(questionId:string)=>void};
export type RendererProps={group:Group;answers:Record<string,string>;onAnswer:(id:string,value:string)=>void;bookmarks?:Record<string,boolean>;onToggleBookmark?:(id:string)=>void;focusId?:string;sections?:{id:string;label:string}[]};
export type RegistryEntry={type:QuestionType;label:string;Editor:ComponentType<EditorProps>;Renderer:ComponentType<RendererProps>;validate:(group:Group,passage:Passage,key:AnswerKey)=>Issue[];answerShape:'enum'|'option'|'text'|'unordered_slots';defaultDraft:(number:number)=>Group;reference?:string};
const labels:Record<QuestionType,string>={
 true_false_not_given:'True / False / Not Given',yes_no_not_given:'Yes / No / Not Given',multiple_choice_single:'Multiple choice · single',multiple_choice_multiple:'Multiple choice · multiple',
 matching_headings:'Matching headings',matching_information:'Matching information',matching_features:'Matching features',matching_sentence_endings:'Matching sentence endings',sentence_completion:'Sentence completion',short_answer:'Short answer',
 summary_completion_text:'Summary · text',note_completion_text:'Notes · text',table_completion_text:'Table · text',flowchart_completion_text:'Flowchart · text',diagram_completion_text:'Diagram · text',
 summary_completion_word_box:'Summary · word box',note_completion_word_box:'Notes · word box',table_completion_word_box:'Table · word box',flowchart_completion_word_box:'Flowchart · word box'
};
const refs=['00-shell-tfng.png','01-yes-no-not-given.png','06-multiple-choice-single.png','07-multiple-choice-multiple.png','02-matching-headings.png','03-matching-information.png','04-matching-features.png','05-matching-sentence-endings.png','08-sentence-completion.png','13-short-answer.png','09-summary-completion-text.png',undefined,'14-table-completion.png','12-flowchart-completion.png','11-diagram-completion.png','10-summary-completion-word-box.png',undefined,undefined,undefined];
export const questionTypeRegistry=Object.fromEntries(TYPES.map((type,i)=>{
 const Editor=type==='diagram_completion_text'?DiagramEditor:type==='multiple_choice_multiple'?MultipleEditor:type.includes('completion')&&type!=='sentence_completion'?GapEditor:ListEditor;
 const Renderer=type==='diagram_completion_text'?DiagramRenderer:type==='multiple_choice_multiple'?MultipleRenderer:type.includes('completion')&&type!=='sentence_completion'?GapRenderer:ListRenderer;
 const answerShape=type==='multiple_choice_multiple'?'unordered_slots':type.endsWith('_text')||type==='sentence_completion'||type==='short_answer'?'text':type==='true_false_not_given'||type==='yes_no_not_given'?'enum':'option';
 return [type,{type,label:labels[type],Editor,Renderer,answerShape,reference:refs[i],defaultDraft:(number:number)=>makeGroup(type,number),validate:(group:Group,passage:Passage,key:AnswerKey)=>{const index=passage.questionGroups.findIndex(g=>g.id===group.id);return businessValidate(passage,key,passage.questionGroups[0]?.questions[0]?.number??1).filter(x=>x.path.startsWith(`questionGroups[${index}]`));}} satisfies RegistryEntry];
})) as Record<QuestionType,RegistryEntry>;
