import {db,json,transaction} from './db';
import {fixture} from '../tests/fixtures';
import {uid} from '../shared/reading';
import {copyFileSync,mkdirSync} from 'node:fs';
import {join,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
function insertPassage(d:ReturnType<typeof fixture>,status:'draft'|'published'='published'){const passageId=uid('p'),id=d.content.passageVersionId;db.prepare('INSERT INTO passages(id) VALUES(?)').run(passageId);db.prepare('INSERT INTO passage_versions(id,passage_id,version_no,status,content_json,answer_key_json,published_at) VALUES(?,?,1,?,?,?,CURRENT_TIMESTAMP)').run(id,passageId,status,json(d.content),json(d.answerKey));return id;}
transaction(()=>{
 const here=dirname(fileURLToPath(import.meta.url));const uploadDir=join(here,'..','uploads');mkdirSync(uploadDir,{recursive:true});copyFileSync(join(here,'assets','rain-system.svg'),join(uploadDir,'asset_demo.svg'));db.prepare("INSERT OR IGNORE INTO media_assets(id,path,mime) VALUES('asset_demo','asset_demo.svg','image/svg+xml')").run();
 if(db.prepare('SELECT COUNT(*) AS n FROM topics').get()?.n)return;
 const topics=[['environment','Environment'],['culture','Culture'],['nature','Nature'],['technology','Technology'],['history','History'],['modern-life','Modern Life']];for(const [slug,name] of topics)db.prepare('INSERT INTO topics(id,slug,name) VALUES(?,?,?)').run(`topic_${slug.replaceAll('-','_')}`,slug,name);
 const single=fixture(['true_false_not_given','summary_completion_word_box'],1,3);single.content.title='Community gardens in growing cities';const singleId=insertPassage(single);const exId=uid('ex');db.prepare("INSERT INTO single_passage_exercises(id,slug,title,description,passage_version_id,status,published_at) VALUES(?,?,?,?,?,'published',CURRENT_TIMESTAMP)").run(exId,'community-gardens','Community gardens in growing cities','A short reading practice about urban gardening.',singleId);db.prepare('INSERT INTO exercise_topics VALUES(?,?)').run(exId,'topic_environment');db.prepare('INSERT INTO exercise_topics VALUES(?,?)').run(exId,'topic_nature');
 const testId=uid('test');db.prepare("INSERT INTO full_reading_tests(id,slug,title,description,time_limit_minutes,status,published_at) VALUES(?,?,?,?,60,'published',CURRENT_TIMESTAMP)").run(testId,'sample-reading-test','Sample Reading Test','Three short passages for local preview.');let n=1;const combos=[['true_false_not_given','multiple_choice_single'],['matching_information','short_answer'],['summary_completion_text','flowchart_completion_text']] as const;combos.forEach((types,i)=>{const d=fixture([...types],n,2);d.content.label=`READING PASSAGE ${i+1}`;d.content.title=['Community gardens','Shared libraries','Rainwater systems'][i];const id=insertPassage(d);db.prepare('INSERT INTO test_passages VALUES(?,?,?)').run(testId,i+1,id);n+=4;});
});
console.log('Seed data ready.');
