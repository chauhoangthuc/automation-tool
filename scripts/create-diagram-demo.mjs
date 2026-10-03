import {readFileSync} from 'node:fs';

const base=process.env.READING_API_URL||'http://127.0.0.1:3001';
const token=process.env.READING_ADMIN_TOKEN||'local-reading-admin';
const headers={'x-admin-token':token};
const slug='diagram-rainwater-demo';
const request=async(path,method='GET',body)=>{
 const response=await fetch(`${base}${path}`,{method,headers:{...headers,...(body===undefined?{}:{'Content-Type':'application/json'})},body:body===undefined?undefined:JSON.stringify(body)});
 const data=await response.json();if(!response.ok)throw Error(`${method} ${path}: ${JSON.stringify(data)}`);return data;
};

const existing=await request('/api/admin/exercises');
const prior=existing.find(item=>item.slug===slug);
if(prior){console.log(JSON.stringify({passageVersionId:prior.passage_version_id,exerciseId:prior.id,reused:true}));process.exit(0)}

const svg=readFileSync(new URL('../docs/reading-ui/examples/rainwater-collection-diagram.svg',import.meta.url));
const assetResponse=await fetch(`${base}/api/admin/assets`,{method:'POST',headers:{...headers,'Content-Type':'image/svg+xml'},body:svg});
const asset=await assetResponse.json();if(!assetResponse.ok)throw Error(`Asset upload: ${JSON.stringify(asset)}`);

const created=await request('/api/admin/passages','POST',{});
const id=created.id;
const content={
 schemaVersion:1,passageVersionId:id,label:'READING PASSAGE 1',leadIn:'You should spend about 20 minutes on Questions 1–3.',title:'Collecting Rainwater at Home',description:'How a simple rooftop system stores rain for a garden.',
 sections:[{id:'sec_rain_A',label:'A',blocks:[
  {id:'blk_rain_1',kind:'paragraph',text:'A simple rainwater collection system can help a household use less treated water in its garden. Rain first lands on the sloping roof of the house. The roof directs the water toward a gutter fixed along its lower edge.'},
  {id:'blk_rain_2',kind:'paragraph',text:'The gutter carries the water through a short pipe. Before the water reaches the tank, it passes through a mesh filter. The filter catches leaves and other material that might block the system.'},
  {id:'blk_rain_3',kind:'paragraph',text:'Cleaned rainwater flows into a storage tank beside the house. A tap near the bottom of the tank lets the family fill a watering can. The collected water is used on the garden during dry weeks.'}
 ]}],
 questionGroups:[{id:'g_rain_diagram',order:1,type:'diagram_completion_text',sourceHeading:'Questions 1–3',instructionBlocks:[
  {kind:'instruction',text:'Label the diagram of a household rainwater collection system.'},
  {kind:'answer_format',text:'Write NO MORE THAN TWO WORDS from the passage for each answer.'},
  {kind:'note',text:'Follow the dotted lines from each part of the system to its answer box.'}
 ],settings:{maxWords:2,allowNumber:false},content:{kind:'diagram',title:'How rainwater is collected',assetId:asset.id,alt:'Diagram showing a house roof, a gutter with a mesh filter, and a rainwater storage tank.',anchors:[
  {questionId:'q_rain_1',xPercent:61,yPercent:30,sourceXPercent:35.3,sourceYPercent:30.3,label:'Part 1'},
  {questionId:'q_rain_2',xPercent:61,yPercent:60,sourceXPercent:47.2,sourceYPercent:60,label:'Part 2'},
  {questionId:'q_rain_3',xPercent:61,yPercent:77,sourceXPercent:60.8,sourceYPercent:77.1,label:'Part 3'}
 ]},questions:[{id:'q_rain_1',number:1},{id:'q_rain_2',number:2},{id:'q_rain_3',number:3}]}]
};
const answerKey={schemaVersion:1,passageVersionId:id,answers:[
 {questionId:'q_rain_1',acceptedAnswers:['roof'],explanation:'Nước mưa rơi xuống mái nhà trước khi được dẫn vào máng.',evidence:[{sectionId:'sec_rain_A',blockId:'blk_rain_1',quote:'Rain first lands on the sloping roof of the house.'}]},
 {questionId:'q_rain_2',acceptedAnswers:['mesh filter'],explanation:'Bộ lọc lưới giữ lá cây trước khi nước chảy vào bồn.',evidence:[{sectionId:'sec_rain_A',blockId:'blk_rain_2',quote:'it passes through a mesh filter'}]},
 {questionId:'q_rain_3',acceptedAnswers:['storage tank'],explanation:'Nước đã lọc chảy vào bồn chứa cạnh nhà.',evidence:[{sectionId:'sec_rain_A',blockId:'blk_rain_3',quote:'Cleaned rainwater flows into a storage tank beside the house.'}]}
]};
await request(`/api/admin/passages/${id}/draft`,'PATCH',{revision:created.revision,content,answerKey});
const validation=await request(`/api/admin/passages/${id}/validate`,'POST',{});
if(!validation.valid)throw Error(`Draft validation failed: ${JSON.stringify(validation.issues)}`);
const exercise=await request('/api/admin/exercises','POST',{slug,title:'Diagram Completion · Rainwater Collection',description:'Bài mẫu 3 câu để thử đặt ô đáp án trực tiếp trên sơ đồ.',passageVersionId:id,topicIds:[]});
console.log(JSON.stringify({passageVersionId:id,exerciseId:exercise.id,assetId:asset.id,valid:validation.valid,reused:false}));
