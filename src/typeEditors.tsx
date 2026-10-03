import {useRef,useState} from 'react';
import type {PointerEvent as ReactPointerEvent} from 'react';
import type {EditorProps} from './registry';
import type {Option,Part,Content} from '../shared/reading';
import {optionLabel,uid,isWordBox} from '../shared/reading';
import {RichTextarea} from './RichText';
import {DiagramConnectors} from './DiagramConnectors';

function Options({options,onChange,title='Danh sách lựa chọn'}:{options:Option[];onChange:()=>void;title?:string}){
 return <fieldset className="fieldbox"><legend>{title}</legend>{options.map((o,i)=><div className="inline" key={i}><input aria-label="Option ID" value={o.id} onChange={e=>{o.id=e.target.value;onChange()}} className="id-input"/><input aria-label="Option text" value={o.text} placeholder="Nội dung lựa chọn" onChange={e=>{o.text=e.target.value;onChange()}}/><button type="button" onClick={()=>{options.splice(i,1);onChange()}}>Xóa</button></div>)}<button type="button" onClick={()=>{options.push({id:optionLabel(options.length),text:''});onChange()}}>+ Thêm lựa chọn</button></fieldset>
}
export function ListEditor({group,sections,onChange}:EditorProps){
 const matching=group.type.startsWith('matching_');
 const tf=group.type==='true_false_not_given'||group.type==='yes_no_not_given';
 if(matching&&!group.options)group.options=[];
 return <div className="editor-fields">
  {matching&&<Options options={group.options!} onChange={onChange} title={group.type==='matching_headings'?'Danh sách heading (i, ii, iii…)':group.type==='matching_features'?'Tên danh sách / features':'Options chung A, B, C…'}/>}
  {matching&&<label>Cho phép dùng lại option<select value={group.settings?.optionReuse||'allowed'} onChange={e=>{group.settings={...group.settings,optionReuse:e.target.value as 'allowed'|'not_allowed'};onChange()}}><option value="allowed">Có thể dùng lại</option><option value="not_allowed">Không dùng lại</option></select></label>}
  {(group.type==='sentence_completion'||group.type==='short_answer')&&<WordSettings group={group} onChange={onChange}/>}
  {group.questions.map((q,i)=><fieldset className="fieldbox" key={q.id}><legend>Câu {q.number}</legend>
   {group.type==='matching_headings'?<label>Đoạn mục tiêu<select value={q.targetSectionId||''} onChange={e=>{q.targetSectionId=e.target.value;onChange()}}><option value="">Chọn đoạn</option>{sections.map(s=><option value={s.id} key={s.id}>{s.label}</option>)}</select></label>:<RichTextarea label={tf?'Statement':group.type==='sentence_completion'?'Sentence (dùng [[gap]] tại ô trống)':group.type==='short_answer'?'Question prompt':group.type==='matching_sentence_endings'?'Beginning':'Prompt / statement'} value={q.prompt||''} onChange={value=>{q.prompt=value;onChange()}} placeholder={group.type==='sentence_completion'?'The answer is [[gap]].':''}/>}
   {group.type==='multiple_choice_single'&&<Options options={q.options??(q.options=[])} onChange={onChange} title="Options riêng của câu"/>}
  </fieldset>)}
 </div>;
}
function WordSettings({group,onChange}:Pick<EditorProps,'group'|'onChange'>){return <div className="inline"><label>Số từ tối đa<input type="number" min="1" value={group.settings?.maxWords??1} onChange={e=>{group.settings={...group.settings,maxWords:Number(e.target.value)};onChange()}}/></label><label className="checkbox"><input type="checkbox" checked={group.settings?.allowNumber??false} onChange={e=>{group.settings={...group.settings,allowNumber:e.target.checked};onChange()}}/> Cho phép số</label></div>}
export function MultipleEditor({group,onChange}:EditorProps){
 return <div className="editor-fields"><RichTextarea label="Prompt chung" value={group.questions[0]?.prompt||''} onChange={value=>{group.questions.forEach(q=>q.prompt=value);onChange()}}/><div className="inline"><label>Số đáp án phải chọn<input type="number" min="2" value={group.settings?.selectionCount??2} onChange={e=>{group.settings={...group.settings,selectionCount:Number(e.target.value),scoring:'unordered_set'};onChange()}}/></label><span>Số answer slots: {group.questions.length} · chấm theo tập không thứ tự</span></div><Options options={group.options??(group.options=[])} onChange={onChange}/></div>;
}
function PartsEditor({parts,onChange,onInsertGap,questions}:{parts:Part[];onChange:()=>void;onInsertGap:()=>void;questions:{id:string;number:number}[]}){
 return <div className="parts-editor">{parts.map((part,i)=><div className="inline" key={i}>{part.kind==='text'?<><span className="part-tag">Text</span><RichTextarea label={`Nội dung text ${i+1}`} value={part.text} onChange={value=>{part.text=value;onChange()}} placeholder="Nội dung trước/sau ô"/></>:<><span className="part-tag gap-tag">Ô {questions.find(q=>q.id===part.questionId)?.number??'?'}</span><select value={part.questionId} onChange={e=>{part.questionId=e.target.value;onChange()}}>{questions.map(q=><option value={q.id} key={q.id}>Câu {q.number}</option>)}</select></>}<button type="button" onClick={()=>{parts.splice(i,1);onChange()}}>×</button></div>)}<div className="inline"><button type="button" onClick={()=>{parts.push({kind:'text',text:''});onChange()}}>+ Text</button><button type="button" onClick={onInsertGap}>+ Ô trống</button></div></div>
}
export function GapEditor({group,onChange}:EditorProps){
 const c=group.content;const addGap=(parts:Part[])=>{const orphan=group.questions.find(q=>!JSON.stringify(c).includes(q.id));if(orphan){parts.push({kind:'gap',questionId:orphan.id});onChange();}else alert('Hãy bấm Thêm câu/ô ở thanh nhóm trước.');};
 return <div className="editor-fields">
  <label>Tiêu đề nội dung<input value={c.title||''} onChange={e=>{c.title=e.target.value;onChange()}}/></label>
  {isWordBox(group.type)?<><Options options={group.options??(group.options=[])} onChange={onChange} title="Hộp từ / option bank"/><label>Cho phép dùng lại<select value={group.settings?.optionReuse||'allowed'} onChange={e=>{group.settings={...group.settings,optionReuse:e.target.value as 'allowed'|'not_allowed'};onChange()}}><option value="allowed">Có</option><option value="not_allowed">Không</option></select></label></>:<WordSettings group={group} onChange={onChange}/>}
  {(c.kind==='rich_text_with_gaps'||c.kind==='notes')&&<><h4>{c.kind==='notes'?'Heading · subheading · bullet · paragraph':'Đoạn tóm tắt'}</h4>{c.blocks.map((b,i)=><fieldset className="fieldbox" key={i}><legend>Block {i+1}</legend><div className="inline"><select value={b.kind} onChange={e=>{b.kind=e.target.value as typeof b.kind;onChange()}}>{(c.kind==='notes'?['heading','subheading','bullet','paragraph']:['paragraph','heading']).map(k=><option key={k}>{k}</option>)}</select>{c.kind==='notes'&&<label>Level<select value={b.level??1} onChange={e=>{b.level=Number(e.target.value);onChange()}}><option value="1">1</option><option value="2">2</option></select></label>}<button type="button" onClick={()=>{c.blocks.splice(i,1);onChange()}}>Xóa block</button></div><PartsEditor parts={b.parts} questions={group.questions} onChange={onChange} onInsertGap={()=>addGap(b.parts)}/></fieldset>)}<button type="button" onClick={()=>{c.blocks.push({kind:c.kind==='notes'?'bullet':'paragraph',parts:[{kind:'text',text:''}]});onChange()}}>+ Thêm block</button></>}
  {c.kind==='table'&&<><h4>Bảng: hàng, cột, ô text hoặc gap</h4><div className="table-editor">{c.rows.map((row,ri)=><div className="table-row-editor" key={ri}>{row.map((cell,ci)=><fieldset className="fieldbox" key={ci}><legend>Hàng {ri+1} · Cột {ci+1}</legend><label className="checkbox"><input type="checkbox" checked={!!cell.isHeader} onChange={e=>{cell.isHeader=e.target.checked;onChange()}}/> Header</label><PartsEditor parts={cell.parts} questions={group.questions} onChange={onChange} onInsertGap={()=>addGap(cell.parts)}/></fieldset>)}<button type="button" onClick={()=>{c.rows.splice(ri,1);onChange()}}>Xóa hàng</button></div>)}</div><div className="inline"><button type="button" onClick={()=>{c.rows.push(c.rows[0].map(()=>({parts:[{kind:'text' as const,text:''}]})));onChange()}}>+ Hàng</button><button type="button" onClick={()=>{c.rows.forEach((r,i)=>r.push({parts:[{kind:'text',text:''}],isHeader:i===0}));onChange()}}>+ Cột</button><button type="button" onClick={()=>{c.rows.forEach(r=>r.pop());onChange()}}>− Cột</button></div></>}
  {c.kind==='flowchart'&&<><h4>Các bước và mũi tên</h4>{c.steps.map((step,i)=><fieldset className="fieldbox" key={step.id}><legend>Bước {i+1}</legend><PartsEditor parts={step.parts} questions={group.questions} onChange={onChange} onInsertGap={()=>addGap(step.parts)}/><label>Mũi tên tới bước<select value={step.nextStepIds?.[0]||''} onChange={e=>{step.nextStepIds=e.target.value?[e.target.value]:[];onChange()}}><option value="">Không</option>{c.steps.filter(s=>s.id!==step.id).map((s,j)=><option value={s.id} key={s.id}>Bước {c.steps.indexOf(s)+1}</option>)}</select></label><button type="button" onClick={()=>{c.steps.splice(i,1);onChange()}}>Xóa bước</button></fieldset>)}<button type="button" onClick={()=>{c.steps.push({id:uid('step'),parts:[{kind:'text',text:''}]});onChange()}}>+ Bước</button></>}
 </div>;
}
type DiagramContent=Extract<Content,{kind:'diagram'}>;
function DiagramPositioner({content,questions,selected,onSelect,onChange}:{content:DiagramContent;questions:{id:string;number:number}[];selected:number;onSelect:(index:number)=>void;onChange:()=>void}){
 const [aspect,setAspect]=useState(5/3);
 const [placement,setPlacement]=useState<'answer'|'source'>('answer');
 const drag=useRef<{index:number;kind:'answer'|'source';pointerId:number;clientX:number;clientY:number;x:number;y:number}|null>(null);
 const clamp=(value:number)=>Math.max(0,Math.min(100,Math.round(value*10)/10));
 const place=(index:number,kind:'answer'|'source',x:number,y:number)=>{const anchor=content.anchors[index];if(!anchor)return;if(kind==='answer'){anchor.xPercent=clamp(x);anchor.yPercent=clamp(y)}else{anchor.sourceXPercent=clamp(x);anchor.sourceYPercent=clamp(y)}onChange()};
 const down=(event:ReactPointerEvent<HTMLDivElement>)=>{
  if(event.button!==0||!content.anchors.length)return;
  const target=event.target as HTMLElement;
  const sourceHandle=target.closest<HTMLElement>('[data-source-index]');
  const answerHandle=target.closest<HTMLElement>('[data-anchor-index]');
  const index=sourceHandle?Number(sourceHandle.dataset.sourceIndex):answerHandle?Number(answerHandle.dataset.anchorIndex):Math.min(selected,content.anchors.length-1);
  const kind=sourceHandle?'source':answerHandle?'answer':placement;
  const rect=event.currentTarget.getBoundingClientRect();
  const anchor=content.anchors[index];
  if(!sourceHandle&&!answerHandle)place(index,kind,(event.clientX-rect.left)/rect.width*100,(event.clientY-rect.top)/rect.height*100);
  drag.current={index,kind,pointerId:event.pointerId,clientX:event.clientX,clientY:event.clientY,x:kind==='answer'?anchor.xPercent:anchor.sourceXPercent??anchor.xPercent,y:kind==='answer'?anchor.yPercent:anchor.sourceYPercent??anchor.yPercent};
  onSelect(index);event.currentTarget.setPointerCapture(event.pointerId);event.preventDefault();
 };
 const move=(event:ReactPointerEvent<HTMLDivElement>)=>{
  const current=drag.current;if(!current||current.pointerId!==event.pointerId)return;
  const rect=event.currentTarget.getBoundingClientRect();
  place(current.index,current.kind,current.x+(event.clientX-current.clientX)/rect.width*100,current.y+(event.clientY-current.clientY)/rect.height*100);
 };
 const up=(event:ReactPointerEvent<HTMLDivElement>)=>{if(drag.current?.pointerId!==event.pointerId)return;drag.current=null;if(event.currentTarget.hasPointerCapture(event.pointerId))event.currentTarget.releasePointerCapture(event.pointerId)};
 const active=content.anchors[selected];
 return <div className="diagram-positioner"><p>Chọn ô trong danh sách dưới ảnh. Để tạo đường nối, bấm “Tạo đường nối” rồi bấm lên chi tiết trong sơ đồ; kéo chấm tròn hoặc ô để canh lại. Phím mũi tên chỉnh 1%, Shift + mũi tên chỉnh 5%.</p><div className="diagram-placement-modes"><button type="button" className={placement==='answer'?'active':''} onClick={()=>setPlacement('answer')}>Đặt ô trả lời</button><button type="button" className={placement==='source'?'active':''} onClick={()=>setPlacement('source')}>Đặt điểm nối</button><button type="button" disabled={!active||active.sourceXPercent!==undefined} onClick={()=>{if(!active)return;active.sourceXPercent=clamp(active.xPercent-15);active.sourceYPercent=active.yPercent;setPlacement('source');onChange()}}>+ Tạo đường nối ô {questions.find(q=>q.id===active?.questionId)?.number??selected+1}</button><button type="button" disabled={active?.sourceXPercent===undefined} onClick={()=>{if(!active)return;delete active.sourceXPercent;delete active.sourceYPercent;onChange()}}>Bỏ đường nối ô {questions.find(q=>q.id===active?.questionId)?.number??selected+1}</button></div><div className="diagram-placement-stage" style={{maxWidth:`${Math.round(420*aspect)}px`}} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}>
  <img src={`/api/assets/${content.assetId}`} alt={content.alt||'Sơ đồ đang nhập'} draggable={false} onLoad={event=>{const image=event.currentTarget;if(image.naturalWidth&&image.naturalHeight)setAspect(image.naturalWidth/image.naturalHeight)}}/>
  <DiagramConnectors anchors={content.anchors}/>
  {active&&<><span className="diagram-guide diagram-guide-x" style={{left:`${placement==='source'?active.sourceXPercent??active.xPercent:active.xPercent}%`}}/><span className="diagram-guide diagram-guide-y" style={{top:`${placement==='source'?active.sourceYPercent??active.yPercent:active.yPercent}%`}}/></>}
  {content.anchors.map((anchor,index)=>{const question=questions.find(q=>q.id===anchor.questionId);const number=question?.number??index+1;return <button type="button" key={anchor.questionId} data-anchor-index={index} className={`diagram-placement-anchor ${selected===index?'selected':''}`} style={{left:`${anchor.xPercent}%`,top:`${anchor.yPercent}%`}} aria-label={`Kéo ô ${number}`} aria-pressed={selected===index} onKeyDown={event=>{const step=event.shiftKey?5:1;const dx=event.key==='ArrowRight'?step:event.key==='ArrowLeft'?-step:0,dy=event.key==='ArrowDown'?step:event.key==='ArrowUp'?-step:0;if(dx||dy){event.preventDefault();onSelect(index);place(index,'answer',anchor.xPercent+dx,anchor.yPercent+dy)}}}>Ô {number}</button>})}
  {content.anchors.map((anchor,index)=>anchor.sourceXPercent===undefined||anchor.sourceYPercent===undefined?null:<button type="button" key={anchor.questionId} data-source-index={index} className={`diagram-source-handle ${selected===index?'selected':''}`} style={{left:`${anchor.sourceXPercent}%`,top:`${anchor.sourceYPercent}%`}} aria-label={`Kéo điểm nối câu ${questions.find(q=>q.id===anchor.questionId)?.number??index+1}`} onKeyDown={event=>{const step=event.shiftKey?5:1;const dx=event.key==='ArrowRight'?step:event.key==='ArrowLeft'?-step:0,dy=event.key==='ArrowDown'?step:event.key==='ArrowUp'?-step:0;if(dx||dy){event.preventDefault();onSelect(index);place(index,'source',anchor.sourceXPercent!+dx,anchor.sourceYPercent!+dy)}}}/>)}
 </div><div className="diagram-placement-list">{content.anchors.map((anchor,index)=>{const question=questions.find(q=>q.id===anchor.questionId);return <button type="button" key={anchor.questionId} className={selected===index?'active':''} onClick={()=>onSelect(index)}>Ô {question?.number??index+1} · X {anchor.xPercent}% · Y {anchor.yPercent}%</button>})}</div></div>;
}
export function DiagramEditor({group,onChange,onUpload,onDeleteQuestion}:EditorProps){
 const [selected,setSelected]=useState(0);
 const c=group.content;if(c.kind!=='diagram')return null;
 const below=c.answerPlacement==='below';
 return <div className="editor-fields">
  <label>Tiêu đề sơ đồ<input value={c.title||''} onChange={e=>{c.title=e.target.value;onChange()}}/></label>
  <fieldset className="fieldbox diagram-layout-choice"><legend>Vị trí ô trả lời</legend><label className="checkbox"><input type="radio" name={`diagram-placement-${group.id}`} checked={!below} onChange={()=>{c.answerPlacement='image';onChange()}}/> Ô trả lời đặt trên ảnh (kéo thả, có thể vẽ đường nối)</label><label className="checkbox"><input type="radio" name={`diagram-placement-${group.id}`} checked={below} onChange={()=>{c.answerPlacement='below';onChange()}}/> Ảnh đã in sẵn số/đường dẫn; ô trả lời nằm bên dưới ảnh</label></fieldset>
  <label>Upload SVG/PNG/JPEG (≤5 MB)<input type="file" accept="image/svg+xml,image/png,image/jpeg" onChange={async e=>{const file=e.target.files?.[0];if(file){c.assetId=await onUpload(file);onChange()}}}/></label>
  {c.assetId&&(below?<div className="diagram-source-preview"><img src={`/api/assets/${c.assetId}`} alt={c.alt||'Sơ đồ đang nhập'}/><p>Ảnh đã có số câu và đường chỉ dẫn. Học viên điền vào các ô được hiển thị bên dưới ảnh; không cần đặt tọa độ.</p></div>:<DiagramPositioner content={c} questions={group.questions} selected={selected} onSelect={setSelected} onChange={onChange}/>)}
  <label>Alt text<input value={c.alt} onChange={e=>{c.alt=e.target.value;onChange()}}/></label>
  <WordSettings group={group} onChange={onChange}/>
  {c.anchors.map((a,i)=>{const q=group.questions.find(question=>question.id===a.questionId);const number=q?.number??i+1;return <fieldset className="fieldbox" key={a.questionId}><legend>Ô {number}</legend><div className="inline">{below?<label>Gợi ý bên cạnh ô (tùy chọn)<input value={q?.prompt||''} onChange={e=>{if(q)q.prompt=e.target.value;onChange()}} placeholder="Để trống nếu lời dẫn đã nằm trong ảnh"/></label>:<><label>X %<input type="number" min="0" max="100" step="0.1" value={a.xPercent} onFocus={()=>setSelected(i)} onChange={e=>{a.xPercent=Number(e.target.value);onChange()}}/></label><label>Y %<input type="number" min="0" max="100" step="0.1" value={a.yPercent} onFocus={()=>setSelected(i)} onChange={e=>{a.yPercent=Number(e.target.value);onChange()}}/></label><label>Nhãn<input value={a.label||''} onChange={e=>{a.label=e.target.value;onChange()}}/></label></>}<button type="button" onClick={()=>{onDeleteQuestion?.(a.questionId);setSelected(Math.max(0,Math.min(selected,c.anchors.length-2)))}}>Xóa ô {number}</button></div></fieldset>})}
 </div>;
}
