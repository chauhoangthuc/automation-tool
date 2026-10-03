import {db,json,transaction} from '../server/db.ts';
import {makeGroup,makePassage,TYPES,uid} from '../shared/reading.ts';

// One reusable, incomplete authoring draft per question type. Re-running is safe.
let created=0,existing=0;
for(const type of TYPES){
 const slug=`reading-type-draft-${type.replaceAll('_','-')}`;
 if(db.prepare('SELECT id FROM single_passage_exercises WHERE slug=?').get(slug)){existing++;continue;}
 const draft=makePassage();
 const label=type.replaceAll('_',' ').replace(/\b\w/g,character=>character.toUpperCase());
 draft.content.label='READING PASSAGE 1';
 draft.content.title=`Mẫu nhập · ${label}`;
 draft.content.description='Bản nháp mẫu để nhập passage và câu hỏi cho dạng này.';
 draft.content.questionGroups=[makeGroup(type,1)];
 const questionId=draft.content.questionGroups[0].questions[0].id;
 draft.answerKey.answers=[{questionId,acceptedAnswers:[],explanation:'',evidence:[]}];
 const passageId=uid('p'),exerciseId=uid('ex');
 transaction(()=>{
  db.prepare('INSERT INTO passages(id) VALUES(?)').run(passageId);
  db.prepare("INSERT INTO passage_versions(id,passage_id,version_no,status,content_json,answer_key_json) VALUES(?,?,1,'draft',?,?)").run(draft.content.passageVersionId,passageId,json(draft.content),json(draft.answerKey));
  db.prepare("INSERT INTO single_passage_exercises(id,slug,title,description,passage_version_id,status) VALUES(?,?,?,?,?,'draft')").run(exerciseId,slug,`Mẫu · ${label}`,'Bản nháp riêng cho dạng câu hỏi này; điền nội dung trước khi xuất bản.',draft.content.passageVersionId);
 });
 created++;
}
console.log(JSON.stringify({created,existing,total:TYPES.length}));
