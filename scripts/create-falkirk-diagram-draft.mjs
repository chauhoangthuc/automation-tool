import {copyFileSync,mkdirSync} from 'node:fs';
import {dirname,join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {db,json,transaction} from '../server/db.ts';
import {addQuestion,makeAnswer,makeGroup,makePassage,uid} from '../shared/reading.ts';

const slug='diagram-falkirk-numbered-below';
const existing=db.prepare('SELECT passage_version_id FROM single_passage_exercises WHERE slug=?').get(slug);
if(existing){console.log(JSON.stringify({created:false,passageVersionId:existing.passage_version_id}));process.exit(0)}

const root=join(dirname(fileURLToPath(import.meta.url)),'..');
const assetId='asset_falkirk_numbered_below';
if(!db.prepare('SELECT id FROM media_assets WHERE id=?').get(assetId)){
 const uploads=join(root,'uploads');mkdirSync(uploads,{recursive:true});
 copyFileSync(join(root,'docs','reading-ui','examples','falkirk-wheel-numbered.png'),join(uploads,`${assetId}.png`));
 db.prepare('INSERT INTO media_assets(id,path,mime,width,height) VALUES(?,?,?,?,?)').run(assetId,`${assetId}.png`,'image/png',817,567);
}

const draft=makePassage(),group=makeGroup('diagram_completion_text',20);
for(let number=21;number<=26;number++)addQuestion(group,number);
group.instructionBlocks=[
 {kind:'instruction',text:'Complete the labels numbered 20–26 in the diagram.'},
 {kind:'answer_format',text:'Type each answer in the matching numbered box below the image.'},
 {kind:'note',text:'Layout draft from the supplied image. Add the original reading passage, answer format and answer key before publishing.'}
];
group.settings={maxWords:2,allowNumber:false};
group.content={kind:'diagram',title:'How a boat is lifted on the Falkirk Wheel',assetId,alt:'Numbered diagram of the Falkirk Wheel showing gaps 20 to 26 and their pointer lines.',answerPlacement:'below',anchors:group.questions.map(question=>({questionId:question.id,xPercent:50,yPercent:50}))};
draft.content.label='READING PASSAGE 3';
draft.content.leadIn='Questions 20–26';
draft.content.title='The Falkirk Wheel';
draft.content.description='Layout draft based on the supplied diagram; the original passage has not been provided.';
draft.content.sections=[{id:uid('sec'),label:'A',blocks:[{id:uid('blk'),kind:'paragraph',text:'Add the original reading passage here before publishing this exercise.'}]}];
draft.content.questionGroups=[group];
draft.answerKey.answers=group.questions.map(question=>makeAnswer(question.id));
const passageId=uid('p'),exerciseId=uid('ex');
transaction(()=>{
 db.prepare('INSERT INTO passages(id) VALUES(?)').run(passageId);
 db.prepare("INSERT INTO passage_versions(id,passage_id,version_no,status,content_json,answer_key_json) VALUES(?,?,1,'draft',?,?)").run(draft.content.passageVersionId,passageId,json(draft.content),json(draft.answerKey));
 db.prepare("INSERT INTO single_passage_exercises(id,slug,title,description,passage_version_id,status) VALUES(?,?,?,?,?,'draft')").run(exerciseId,slug,'Falkirk Wheel · Diagram 20–26 · ô dưới ảnh','Bản nháp bố cục từ ảnh đã cung cấp. Cần bổ sung passage và đáp án gốc trước khi xuất bản.',draft.content.passageVersionId);
});
console.log(JSON.stringify({created:true,passageVersionId:draft.content.passageVersionId,questions:group.questions.map(question=>question.number)}));
