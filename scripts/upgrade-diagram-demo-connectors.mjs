import {readFileSync} from 'node:fs';

const base=process.env.READING_API_URL||'http://127.0.0.1:3001';
const token=process.env.READING_ADMIN_TOKEN||'local-reading-admin';
const headers={'x-admin-token':token};
const existing=await fetch(`${base}/api/admin/exercises`,{headers}).then(r=>r.json());
const exercise=existing.find(item=>item.slug==='diagram-rainwater-demo');
if(!exercise)throw Error('Diagram demo not found');
const id=exercise.passage_version_id;
const response=await fetch(`${base}/api/admin/passages/${id}/draft`,{headers});
const draft=await response.json();if(!response.ok||draft.status!=='draft')throw Error('Demo passage is unavailable or no longer a draft');
const content=draft.content;
const diagram=content.questionGroups.find(group=>group.type==='diagram_completion_text')?.content;
if(!diagram||diagram.kind!=='diagram')throw Error('Diagram group missing');
// Replace only the original sample asset. Preserve any image uploaded later by the user.
if(diagram.assetId!=='asset_6520832fda6e'){
 console.log(JSON.stringify({passageVersionId:id,assetId:diagram.assetId,skipped:'The user has changed the image; no replacement was made.'}));process.exit(0);
}
const svg=readFileSync(new URL('../docs/reading-ui/examples/rainwater-collection-diagram.svg',import.meta.url));
const upload=await fetch(`${base}/api/admin/assets`,{method:'POST',headers:{...headers,'Content-Type':'image/svg+xml'},body:svg});
const asset=await upload.json();if(!upload.ok)throw Error(`Asset upload failed: ${JSON.stringify(asset)}`);
diagram.assetId=asset.id;
const sourcePoints=new Map([
 ['q_rain_1',[35.3,30.3]],['q_rain_2',[47.2,60]],['q_rain_3',[60.8,77.1]]
]);
for(const anchor of diagram.anchors){const point=sourcePoints.get(anchor.questionId);if(point&&anchor.sourceXPercent===undefined&&anchor.sourceYPercent===undefined){anchor.sourceXPercent=point[0];anchor.sourceYPercent=point[1]}}
const patch=await fetch(`${base}/api/admin/passages/${id}/draft`,{method:'PATCH',headers:{...headers,'Content-Type':'application/json'},body:JSON.stringify({revision:draft.revision,content,answerKey:draft.answerKey})});
const saved=await patch.json();if(!patch.ok)throw Error(`Draft changed while upgrading; no draft content was overwritten: ${JSON.stringify(saved)}`);
const validated=await fetch(`${base}/api/admin/passages/${id}/validate`,{method:'POST',headers:{...headers,'Content-Type':'application/json'},body:'{}'}).then(r=>r.json());
console.log(JSON.stringify({passageVersionId:id,assetId:asset.id,revision:saved.revision,valid:validated.valid,issues:validated.issues}));
