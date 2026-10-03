import {db,json,transaction} from '../server/db.ts';
import {addQuestion,makeGroup,TYPES,uid} from '../shared/reading.ts';
import {copyFileSync,mkdirSync} from 'node:fs';
import {dirname,join} from 'node:path';
import {fileURLToPath} from 'node:url';

const sections=[
 {id:'sample_sec_a',label:'A',blocks:[{id:'sample_blk_a',kind:'paragraph',text:'At Brookfield School, a roof channels rain into a covered tank beside the garden. The tank stores up to 800 litres. Teachers installed the system in 2022 to reduce the use of tap water. A mesh filter catches leaves before water reaches the tank.'}]},
 {id:'sample_sec_b',label:'B',blocks:[{id:'sample_blk_b',kind:'paragraph',text:'Each morning, student volunteers check a gauge on the tank. When soil is dry, they fill watering cans from a tap near the bottom. They water vegetable beds before classes begin. During heavy rain, an overflow pipe carries excess water to a shallow pond.'}]},
 {id:'sample_sec_c',label:'C',blocks:[{id:'sample_blk_c',kind:'paragraph',text:'The garden grows tomatoes, beans and herbs. The harvested vegetables are used in the school kitchen. Science classes measure rainfall and compare it with the tank level. Pupils record results in a notebook each Friday.'}]},
 {id:'sample_sec_d',label:'D',blocks:[{id:'sample_blk_d',kind:'paragraph',text:'In the first year, the school used 30 percent less tap water in the garden. Staff caution that weather also affects the amount of water needed. The school plans to add a second tank next spring; no date has been set for a greenhouse.'}]}
];
const quote=(section,text)=>({sectionId:`sample_sec_${section.toLowerCase()}`,blockId:`sample_blk_${section.toLowerCase()}`,quote:text});
const proof={tank:quote('A','The tank stores up to 800 litres.'),year:quote('A','Teachers installed the system in 2022 to reduce the use of tap water.'),filter:quote('A','A mesh filter catches leaves before water reaches the tank.'),roof:quote('A','a roof channels rain into a covered tank beside the garden.'),volunteers:quote('B','student volunteers check a gauge on the tank.'),cans:quote('B','they fill watering cans from a tap near the bottom.'),pond:quote('B','an overflow pipe carries excess water to a shallow pond.'),vegetables:quote('C','The harvested vegetables are used in the school kitchen.'),rainfall:quote('C','Science classes measure rainfall and compare it with the tank level.'),notebook:quote('C','Pupils record results in a notebook each Friday.'),savings:quote('D','the school used 30 percent less tap water in the garden.'),weather:quote('D','Staff caution that weather also affects the amount of water needed.'),second:quote('D','The school plans to add a second tank next spring; no date has been set for a greenhouse.')};
const option=(id,text)=>({id,text});
const textPart=text=>({kind:'text',text});
const gap=questionId=>({kind:'gap',questionId});
function build(type,passageId,diagramAsset){
 const group=makeGroup(type,1);
 const answers=[];
 const add=(prompt,correct,evidence,explanation)=>{
  const q=answers.length?addQuestion(group,answers.length+1):group.questions[0];
  q.prompt=prompt;
  answers.push({questionId:q.id,acceptedAnswers:[correct],explanation,evidence:evidence?[evidence]:[]});
  return q;
 };
 const setInstructions=(instruction,format,note)=>{group.instructionBlocks=[{kind:'instruction',text:instruction},{kind:'answer_format',text:format},...(note?[{kind:'note',text:note}]:[])];};
 const words=(count=1,allowNumber=false)=>{group.settings={maxWords:count,allowNumber};};
 const setOptions=(options)=>{group.options=options.map(([id,text])=>option(id,text));};
 const fillParts=(kind,title,rows)=>{
  const content=group.content;
  content.title=title;
  if(kind==='summary')content.blocks=[{kind:'paragraph',parts:rows.flatMap(([before,q],i)=>[...(i?[textPart(' ' )]:[]),textPart(before),gap(q.id),textPart('.')])}];
  if(kind==='notes')content.blocks=[{kind:'heading',parts:[textPart(title)]},...rows.map(([before,q])=>({kind:'bullet',parts:[textPart(before),gap(q.id)]}))];
  if(kind==='table')content.rows=[[{isHeader:true,parts:[textPart(title==='People and outcomes'?'Question':'Part of the system')]},{isHeader:true,parts:[textPart('Detail')]}],...rows.map(([before,q])=>[{parts:[textPart(before)]},{parts:[gap(q.id)]}])];
  if(kind==='flowchart')content.steps=rows.map(([before,q],i)=>({id:`sample_step_${i+1}`,parts:[textPart(before),gap(q.id)],nextStepIds:i<rows.length-1?[`sample_step_${i+2}`]:[]}));
 };
 switch(type){
  case 'true_false_not_given':{
   setInstructions('Do the following statements agree with the information in the passage?','Write TRUE, FALSE or NOT GIVEN for Questions 1–3.');
   add('The rainwater tank can store 800 litres.','TRUE',proof.tank,'The passage gives the capacity as 800 litres.');
   add('The rainwater system was installed in 2020.','FALSE',proof.year,'The passage states 2022, not 2020.');
   add('The school has already bought a greenhouse.','NOT GIVEN',null,'The passage mentions no date for a greenhouse but says nothing about a purchase.');break;
  }
  case 'yes_no_not_given':{
   setInstructions('Do the following statements agree with the views in the passage?','Write YES, NO or NOT GIVEN for Questions 1–3.');
   add('The school intended the system to reduce tap-water use.','YES',proof.year,'The installation was intended to reduce tap-water use.');
   add('Staff believe weather has no effect on the water needed.','NO',proof.weather,'Staff explicitly say weather affects water demand.');
   add('Teachers think a second tank will be too expensive.','NOT GIVEN',null,'The plan for a second tank is mentioned, but no opinion about its cost is given.');break;
  }
  case 'multiple_choice_single':{
   setInstructions('Choose the correct answer for each question.','Choose ONE letter, A, B or C.');
   let q=add('In which year was the system installed?','B',proof.year,'The teachers installed it in 2022.');q.options=[option('A','2020'),option('B','2022'),option('C','2024')];
   q=add('What catches leaves before water reaches the tank?','A',proof.filter,'A mesh filter catches leaves.');q.options=[option('A','A mesh filter'),option('B','A shallow pond'),option('C','A watering can')];break;
  }
  case 'multiple_choice_multiple':{
   setInstructions('Which TWO activities do pupils carry out in the garden?','Choose TWO letters, A–D.');
   add('Which TWO activities do pupils carry out in the garden?','A',proof.volunteers,'Student volunteers check the tank gauge.');
   add('Which TWO activities do pupils carry out in the garden?','B',proof.notebook,'Pupils record results in a notebook.');
   setOptions([['A','Check the tank gauge'],['B','Record results in a notebook'],['C','Sell vegetables at a market'],['D','Build a greenhouse']]);
   group.settings={selectionCount:2,scoring:'unordered_set'};break;
  }
  case 'matching_headings':{
   setInstructions('Choose the correct heading for each section of the passage.','Write the correct roman numeral, i–v.');
   const data=[['A','i',proof.filter,'Section A describes the roof, filter and tank.'],['B','ii',proof.volunteers,'Section B explains the daily watering routine.'],['C','iii',proof.rainfall,'Section C describes food growing and science lessons.'],['D','iv',proof.savings,'Section D reports results and future plans.']];
   data.forEach(([section,answer,evidence,explanation])=>{const q=add('',answer,evidence,explanation);q.targetSectionId=`sample_sec_${section.toLowerCase()}`});
   setOptions([['i','How the water system is built'],['ii','A daily routine in the garden'],['iii','Food and classroom learning'],['iv','Results and future plans'],['v','The history of the school kitchen']]);break;
  }
  case 'matching_information':{
   setInstructions('Which section contains the following information?','Write A, B, C or D.','NB You may use any letter more than once.');
   add('The amount of water the tank can hold','A',proof.tank,'Section A gives the 800-litre capacity.');
   add('What happens to water during heavy rain','B',proof.pond,'Section B describes the overflow pipe and pond.');
   add('How pupils document their measurements','C',proof.notebook,'Section C says they use a notebook each Friday.');
   setOptions([['A','Section A'],['B','Section B'],['C','Section C'],['D','Section D']]);break;
  }
  case 'matching_features':{
   setInstructions('Match each action with the group of people responsible.','Write A, B or C.');
   add('Check the gauge each morning','A',proof.volunteers,'Student volunteers check the gauge.');
   add('Measure rainfall and compare it with the tank level','B',proof.rainfall,'Science classes measure rainfall.');
   add('Warn that weather affects water demand','C',proof.weather,'Staff give this caution.');
   setOptions([['A','Student volunteers'],['B','Science classes'],['C','School staff']]);break;
  }
  case 'matching_sentence_endings':{
   setInstructions('Complete each sentence with the correct ending.','Write A, B or C.');
   add('A mesh filter','A',proof.filter,'The filter catches leaves before the water enters the tank.');
   add('An overflow pipe','B',proof.pond,'The pipe carries excess water to a pond.');
   add('The harvested vegetables','C',proof.vegetables,'They are used in the school kitchen.');
   setOptions([['A','catches leaves before water reaches the tank.'],['B','carries excess water to a pond.'],['C','are used in the school kitchen.'],['D','are sold to nearby families.']]);break;
  }
  case 'sentence_completion':{
   setInstructions('Complete the sentences below.','Write NO MORE THAN TWO WORDS AND/OR A NUMBER.');words(2,true);
   add('The tank can store up to [[gap]] litres.','800',proof.tank,'Its stated capacity is 800 litres.');
   add('A mesh [[gap]] catches leaves.','filter',proof.filter,'The passage names a mesh filter.');
   add('Pupils record results in a [[gap]] every Friday.','notebook',proof.notebook,'They write their results in a notebook.');break;
  }
  case 'short_answer':{
   setInstructions('Answer the questions below.','Write NO MORE THAN TWO WORDS for each answer.');words(2);
   add('What do student volunteers check each morning?','gauge',proof.volunteers,'They check a gauge on the tank.');
   add('Where are the harvested vegetables used?','school kitchen',proof.vegetables,'The passage names the school kitchen.');
   add('What carries excess water to the pond?','overflow pipe',proof.pond,'An overflow pipe carries the water.');break;
  }
  case 'summary_completion_text':{
   setInstructions('Complete the summary of the school water system.','Write ONE WORD AND/OR A NUMBER for each answer.');words(1,true);
   const q1=add('','2022',proof.year,'The system was installed in 2022.');
   const q2=add('','filter',proof.filter,'A mesh filter catches leaves.');
   const q3=add('','pond',proof.pond,'Excess water flows to a shallow pond.');
   fillParts('summary','A school water system',[['Teachers installed the system in ',q1],["Leaves are caught by a mesh ",q2],['Excess water flows to a shallow ',q3]]);break;
  }
  case 'summary_completion_word_box':{
   setInstructions('Complete the summary using words from the box.','Choose the correct letter, A–D, for each answer.');
   const q1=add('','A',proof.filter,'A filter removes leaves.');
   const q2=add('','B',proof.tank,'Water is kept in a covered tank.');
   const q3=add('','C',proof.pond,'Excess water reaches a pond.');
   setOptions([['A','filter'],['B','tank'],['C','pond'],['D','greenhouse']]);
   fillParts('summary','From roof to garden',[['Rain first passes through a ',q1],['It is stored in a covered ',q2],['Overflow reaches a shallow ',q3]]);break;
  }
  case 'note_completion_text':{
   setInstructions('Complete the notes about the garden.','Write ONE WORD AND/OR A NUMBER for each answer.');words(1,true);
   const q1=add('','800',proof.tank,'The tank holds 800 litres.');
   const q2=add('','gauge',proof.volunteers,'Volunteers check a gauge.');
   const q3=add('','notebook',proof.notebook,'Pupils record results in a notebook.');
   fillParts('notes','Garden project notes',[['Tank capacity: ',q1],['Morning check: tank ',q2],['Friday records: ',q3]]);break;
  }
  case 'note_completion_word_box':{
   setInstructions('Complete the notes using words from the box.','Choose the correct letter, A–D, for each answer.');
   const q1=add('','A',proof.cans,'Volunteers fill watering cans.');
   const q2=add('','B',proof.vegetables,'The vegetables go to the school kitchen.');
   const q3=add('','C',proof.rainfall,'Science classes measure rainfall.');
   setOptions([['A','watering cans'],['B','school kitchen'],['C','rainfall'],['D','greenhouse']]);
   fillParts('notes','Garden activities',[['Volunteers fill: ',q1],['Vegetables used in: ',q2],['Science classes measure: ',q3]]);break;
  }
  case 'table_completion_text':{
   setInstructions('Complete the table about the water system.','Write ONE WORD AND/OR A NUMBER for each answer.');words(1,true);
   const q1=add('','800',proof.tank,'The tank capacity is 800 litres.');
   const q2=add('','leaves',proof.filter,'The filter catches leaves.');
   const q3=add('','pond',proof.pond,'Overflow reaches a pond.');
   fillParts('table','Water system facts',[['Tank capacity in litres',q1],['Material caught by filter',q2],['Destination of overflow',q3]]);break;
  }
  case 'table_completion_word_box':{
   setInstructions('Complete the table using words from the box.','Choose the correct letter, A–D, for each answer.');
   const q1=add('','A',proof.volunteers,'Volunteers check the gauge.');
   const q2=add('','B',proof.vegetables,'The harvest goes to the school kitchen.');
   const q3=add('','C',proof.weather,'Staff warn about the effect of weather.');
   setOptions([['A','student volunteers'],['B','school kitchen'],['C','weather'],['D','market']]);
   fillParts('table','People and outcomes',[['Who checks the gauge',q1],['Where vegetables are used',q2],['What affects water demand',q3]]);break;
  }
  case 'flowchart_completion_text':{
   setInstructions('Complete the flowchart showing how rainwater moves through the system.','Write ONE WORD for each answer.');words(1);
   const q1=add('','roof',proof.roof,'Rain is channelled from a roof.');
   const q2=add('','filter',proof.filter,'Water passes through a mesh filter.');
   const q3=add('','tank',proof.tank,'It is stored in a covered tank.');
   fillParts('flowchart','Collecting rainwater',[['Rain falls on the ',q1],['Leaves are removed by a mesh ',q2],['Water is stored in a covered ',q3]]);break;
  }
  case 'flowchart_completion_word_box':{
   setInstructions('Complete the flowchart using words from the box.','Choose the correct letter, A–D, for each answer.');
   const q1=add('','A',proof.roof,'The roof collects the rain.');
   const q2=add('','B',proof.filter,'The filter catches leaves.');
   const q3=add('','C',proof.tank,'The tank stores the water.');
   setOptions([['A','roof'],['B','filter'],['C','tank'],['D','greenhouse']]);
   fillParts('flowchart','Collecting rainwater',[['Rain lands on the ',q1],['Leaves are removed by the ',q2],['Water enters the ',q3]]);break;
  }
  case 'diagram_completion_text':{
   setInstructions('Label the diagram of a household rainwater system.','Write ONE WORD for each answer.');words(1);
   add('','roof',proof.roof,'The roof channels rain into the system.');
   add('','filter',proof.filter,'The mesh filter catches leaves.');
   add('','tank',proof.tank,'The covered tank stores the rainwater.');
   group.content={kind:'diagram',title:'How rainwater is collected',assetId:diagramAsset,alt:'Diagram of a roof, mesh filter, pipe and rainwater storage tank.',anchors:group.questions.map((q,i)=>({questionId:q.id,xPercent:62,yPercent:[26,52,75][i],sourceXPercent:[38,54,63][i],sourceYPercent:[28,56,69][i],label:`Part ${i+1}`}))};break;
  }
  default:throw Error(`Missing authored type: ${type}`);
 }
 return {content:{schemaVersion:1,passageVersionId:passageId,label:'READING PASSAGE 1',leadIn:'You should spend about 20 minutes on Questions 1–'+group.questions.length+'.',title:'Rainwater at Brookfield School',description:'How a school garden collects and uses rainfall.',sections:structuredClone(sections),questionGroups:[group]},answerKey:{schemaVersion:1,passageVersionId:passageId,answers}};
}

const diagramAsset='asset_type_preview_rainwater';
if(!db.prepare('SELECT id FROM media_assets WHERE id=?').get(diagramAsset)){
 const root=join(dirname(fileURLToPath(import.meta.url)),'..'),uploads=join(root,'uploads');
 mkdirSync(uploads,{recursive:true});
 copyFileSync(join(root,'docs','reading-ui','examples','rainwater-collection-diagram.svg'),join(uploads,`${diagramAsset}.svg`));
 db.prepare('INSERT INTO media_assets(id,path,mime) VALUES(?,?,?)').run(diagramAsset,`${diagramAsset}.svg`,'image/svg+xml');
}
let updated=0,already=0,skipped=0;
for(const type of TYPES){
 const slug=`reading-type-draft-${type.replaceAll('_','-')}`;
 const row=db.prepare('SELECT e.id AS exercise_id,e.title AS exercise_title,e.revision AS exercise_revision,e.passage_version_id AS passage_id,v.status,v.revision,v.content_json,v.answer_key_json FROM single_passage_exercises e JOIN passage_versions v ON v.id=e.passage_version_id WHERE e.slug=?').get(slug);
 if(!row){skipped++;continue;}
 const before=JSON.parse(row.content_json),key=JSON.parse(row.answer_key_json),group=before.questionGroups?.[0];
 if(before.title==='Rainwater at Brookfield School'){
  if(type==='diagram_completion_text'&&group.content.assetId==='asset_demo'){
   group.content.assetId=diagramAsset;
   const changed=db.prepare("UPDATE passage_versions SET content_json=?,revision=revision+1,updated_at=CURRENT_TIMESTAMP WHERE id=? AND revision=? AND status='draft'").run(json(before),row.passage_id,row.revision);
   if(changed.changes!==1)throw Error(`Concurrent edit: ${type}`);
   updated++;
  }else if(type==='diagram_completion_text'&&group.content.assetId===diagramAsset&&group.content.anchors.map(anchor=>anchor.xPercent).join(',')==='72,73,73'){
   group.content.anchors.forEach((anchor,i)=>{anchor.xPercent=62;anchor.sourceXPercent=[38,54,63][i]});
   const changed=db.prepare("UPDATE passage_versions SET content_json=?,revision=revision+1,updated_at=CURRENT_TIMESTAMP WHERE id=? AND revision=? AND status='draft'").run(json(before),row.passage_id,row.revision);
   if(changed.changes!==1)throw Error(`Concurrent edit: ${type}`);
   updated++;
  }else if(type==='diagram_completion_text'&&group.content.assetId===diagramAsset&&group.content.anchors.map(anchor=>anchor.label).join(',')==='Roof,Filter,Tank'){
   group.content.anchors.forEach((anchor,i)=>anchor.label=`Part ${i+1}`);
   const changed=db.prepare("UPDATE passage_versions SET content_json=?,revision=revision+1,updated_at=CURRENT_TIMESTAMP WHERE id=? AND revision=? AND status='draft'").run(json(before),row.passage_id,row.revision);
   if(changed.changes!==1)throw Error(`Concurrent edit: ${type}`);
   updated++;
  }else if(type==='table_completion_word_box'&&group.content.title==='People and outcomes'&&group.content.rows[0][0].parts[0].text==='Part of the system'){
   group.content.rows[0][0].parts[0].text='Question';
   const changed=db.prepare("UPDATE passage_versions SET content_json=?,revision=revision+1,updated_at=CURRENT_TIMESTAMP WHERE id=? AND revision=? AND status='draft'").run(json(before),row.passage_id,row.revision);
   if(changed.changes!==1)throw Error(`Concurrent edit: ${type}`);
   updated++;
  }else already++;
  continue;
 }
 const untouched=before.title.startsWith('Mẫu nhập · ')&&before.description==='Bản nháp mẫu để nhập passage và câu hỏi cho dạng này.'&&before.questionGroups.length===1&&group.type===type&&group.questions.length===1&&group.instructionBlocks.every(block=>!block.text.trim())&&key.answers.length===1&&!key.answers[0].acceptedAnswers.length&&row.status==='draft';
 if(!untouched){skipped++;continue;}
 const sample=build(type,row.passage_id,diagramAsset);
 const label=type.replaceAll('_',' ').replace(/\b\w/g,character=>character.toUpperCase());
 transaction(()=>{
  const changed=db.prepare("UPDATE passage_versions SET content_json=?,answer_key_json=?,revision=revision+1,updated_at=CURRENT_TIMESTAMP WHERE id=? AND revision=? AND status='draft'").run(json(sample.content),json(sample.answerKey),row.passage_id,row.revision);
  if(changed.changes!==1)throw Error(`Concurrent edit: ${type}`);
  db.prepare('UPDATE single_passage_exercises SET title=?,description=?,revision=revision+1,updated_at=CURRENT_TIMESTAMP WHERE id=? AND revision=?').run(`Bài mẫu · ${label}`,'Đề mẫu hoàn chỉnh để xem Preview và thử nhập đáp án cho dạng câu này.',row.exercise_id,row.exercise_revision);
 });
 updated++;
}
console.log(JSON.stringify({updated,already,skipped,total:TYPES.length}));
