import type {ReactNode} from 'react';
import type {RendererProps} from './registry';
import type {Part,Option} from '../shared/reading';
import {isWordBox} from '../shared/reading';
import {RichText} from './RichText';
import {DiagramConnectors} from './DiagramConnectors';
const optionsFor=(items:Option[]|undefined,value:string,onChange:(v:string)=>void,placeholder='Chọn đáp án')=><select className={value?'selected-select':''} value={value} onChange={e=>onChange(e.target.value)}><option value="">{placeholder}</option>{items?.map(o=><option key={o.id} value={o.id}>{o.id} · {o.text}</option>)}</select>;
const badge=(n:number)=><span className="question-badge">{n}</span>;
const bookmark=(id:string,number:number,bookmarks:Record<string,boolean>|undefined,onToggleBookmark:((id:string)=>void)|undefined)=><button type="button" className={`question-bookmark ${bookmarks?.[id]?'is-bookmarked':''}`} aria-label={`${bookmarks?.[id]?'Bỏ lưu':'Lưu'} câu ${number}`} aria-pressed={!!bookmarks?.[id]} title={bookmarks?.[id]?'Bỏ lưu câu':'Lưu câu'} onClick={()=>onToggleBookmark?.(id)}>{bookmarks?.[id]?'★':'☆'}</button>;
export function ListRenderer({group,answers,onAnswer,sections,bookmarks,onToggleBookmark}:RendererProps){
 const tf=group.type==='true_false_not_given'||group.type==='yes_no_not_given';
 const choices=group.type==='true_false_not_given'?['TRUE','FALSE','NOT GIVEN']:['YES','NO','NOT GIVEN'];
 const matching=group.type.startsWith('matching_');
 return <div className="renderer-list">
  {group.content.kind==='question_list'&&group.content.title&&<h3 className="list-title">{group.content.title}</h3>}
  {matching&&group.options&&<div className="option-bank"><strong>{group.type==='matching_headings'?'Danh sách tiêu đề':group.type==='matching_sentence_endings'?'Các phần kết câu':group.type==='matching_features'?'Danh sách đặc điểm':'Các đoạn văn'}</strong><div className="option-grid">{group.options.map(o=><div className="bank-option" key={o.id}><b>{o.id}</b><span>{o.text}</span></div>)}</div></div>}
  {group.questions.map(q=><div className={`question-card ${group.type==='short_answer'?'short-answer':''}`} data-question={q.id} key={q.id}>{badge(q.number)}<div className="question-main">
   {tf?<><p><RichText text={q.prompt||''}/></p><div className="choice-three">{choices.map(v=><button key={v} type="button" className={answers[q.id]===v?'chosen':''} onClick={()=>onAnswer(q.id,v)}>{v}</button>)}</div></>:
   group.type==='multiple_choice_single'?<><p><RichText text={q.prompt||''}/></p><div className="mcq-options">{q.options?.map(o=><button type="button" key={o.id} className={answers[q.id]===o.id?'chosen':''} onClick={()=>onAnswer(q.id,o.id)}><b>{o.id}</b>{o.text}</button>)}</div></>:
   group.type==='sentence_completion'?<div className="inline-sentence">{(q.prompt||'').split('[[gap]]').map((part,i,arr)=><span key={i}><RichText text={part}/>{i<arr.length-1&&<input aria-label={`Câu ${q.number}`} placeholder="Nhập từ" value={answers[q.id]||''} onChange={e=>onAnswer(q.id,e.target.value)}/>}</span>)}</div>:
   group.type==='short_answer'?<><p><strong><RichText text={q.prompt||''}/></strong></p><input aria-label={`Câu ${q.number}`} placeholder="Nhập câu trả lời" value={answers[q.id]||''} onChange={e=>onAnswer(q.id,e.target.value)}/></>:
   <div className="matching-row"><span>{group.type==='matching_headings'?`Đoạn ${sections?.find(s=>s.id===q.targetSectionId)?.label||q.targetSectionId||''}`:<RichText text={q.prompt||''}/>}</span>{optionsFor(group.options,answers[q.id]||'',v=>onAnswer(q.id,v),group.type==='matching_headings'?'Chọn tiêu đề':'Chọn đáp án')}</div>}
  </div>{bookmark(q.id,q.number,bookmarks,onToggleBookmark)}</div>)}
 </div>;
}
export function MultipleRenderer({group,answers,onAnswer,bookmarks,onToggleBookmark}:RendererProps){
 const selected=group.questions.map(q=>answers[q.id]).filter(Boolean);
 const toggle=(id:string)=>{if(selected.includes(id)){const q=group.questions.find(q=>answers[q.id]===id);if(q)onAnswer(q.id,'');}else{const q=group.questions.find(q=>!answers[q.id]);if(q)onAnswer(q.id,id);}};
 return <div className="multiple-renderer"><div className="info-strip">Chọn đúng {group.settings?.selectionCount??group.questions.length} đáp án <span>Đã chọn {selected.length}/{group.settings?.selectionCount??group.questions.length}</span></div><h2><RichText text={group.questions[0]?.prompt||''}/></h2>{group.options?.map(o=><button type="button" key={o.id} className={`multiple-option ${selected.includes(o.id)?'chosen':''}`} onClick={()=>toggle(o.id)}><span className="check-square">{selected.includes(o.id)?'✓':''}</span><b>{o.id}</b>{o.text}</button>)}<div className="slot-row">{group.questions.map(q=><div className="slot-question" data-question={q.id} key={q.id}><label>Ô {q.number}{optionsFor(group.options,answers[q.id]||'',v=>onAnswer(q.id,v))}</label>{bookmark(q.id,q.number,bookmarks,onToggleBookmark)}</div>)}</div></div>;
}
function PartView({parts,group,answers,onAnswer,bookmarks,onToggleBookmark}:Pick<RendererProps,'group'|'answers'|'onAnswer'|'bookmarks'|'onToggleBookmark'>&{parts:Part[]}){
 return <>{parts.map((part,i):ReactNode=>part.kind==='text'?<span key={i}><RichText text={part.text}/></span>:(()=>{const q=group.questions.find(q=>q.id===part.questionId);return <span className="gap-inline" data-question={part.questionId} key={i}>{badge(q?.number??0)}{isWordBox(group.type)?optionsFor(group.options,answers[part.questionId]||'',v=>onAnswer(part.questionId,v)): <input aria-label={`Câu ${q?.number??''}`} placeholder="Nhập từ" value={answers[part.questionId]||''} onChange={e=>onAnswer(part.questionId,e.target.value)}/>}{bookmark(part.questionId,q?.number??0,bookmarks,onToggleBookmark)}</span>})())}</>;
}
export function GapRenderer({group,answers,onAnswer,bookmarks,onToggleBookmark}:RendererProps){
 const c=group.content;if(c.kind==='question_list'||c.kind==='diagram')return null;
 const part=(parts:Part[])=><PartView parts={parts} group={group} answers={answers} onAnswer={onAnswer} bookmarks={bookmarks} onToggleBookmark={onToggleBookmark}/>;
 return <div className="gap-renderer">
  {(c.kind==='rich_text_with_gaps'||c.kind==='notes')&&<div className={`content-card ${c.kind}`}><h2>{c.title}</h2>{c.blocks.map((b,i)=>{const Tag=b.kind==='heading'?'h3':b.kind==='subheading'?'h4':b.kind==='bullet'?'li':'p';return <Tag key={i} className={b.kind==='bullet'?`level-${b.level??1}`:''}>{part(b.parts)}</Tag>})}</div>}
  {c.kind==='table'&&<div className="content-card"><h2>{c.title}</h2><div className="table-scroll"><table><tbody>{c.rows.map((row,ri)=><tr key={ri}>{row.map((cell,ci)=>{const Tag=cell.isHeader?'th':'td';return <Tag key={ci}>{part(cell.parts)}</Tag>})}</tr>)}</tbody></table></div></div>}
  {c.kind==='flowchart'&&<div className="content-card flowchart"><h2>{c.title}</h2>{c.steps.map((s,i)=><div key={s.id}><div className="flow-step"><b>Bước {i+1}</b><span>{part(s.parts)}</span></div>{i<c.steps.length-1&&<div className="flow-arrow">↓</div>}</div>)}</div>}
  {isWordBox(group.type)&&<div className="option-bank word-bank"><strong>HỘP TỪ · CHỌN ĐÁP ÁN</strong><div className="option-grid">{group.options?.map(o=><div key={o.id} className={`bank-option ${Object.values(answers).includes(o.id)?'used':''}`}><b>{o.id}</b><span>{o.text}</span></div>)}</div></div>}
  {!isWordBox(group.type)&&<div className="completion-progress">{group.questions.length} ô trống · Mỗi ô tối đa {group.settings?.maxWords??1} từ</div>}
 </div>;
}
export function DiagramRenderer({group,answers,onAnswer,bookmarks,onToggleBookmark}:RendererProps){
 const c=group.content;if(c.kind!=='diagram')return null;
 const below=c.answerPlacement==='below';
 return <div className={`content-card diagram ${below?'diagram-below':''}`}><h2>{c.title}</h2>{c.assetId?<div className="diagram-stage"><img src={`/api/assets/${c.assetId}`} alt={c.alt}/>{!below&&<><DiagramConnectors anchors={c.anchors}/>{c.anchors.map(a=>{const q=group.questions.find(q=>q.id===a.questionId);return <div key={a.questionId} className="diagram-anchor" style={{left:`${a.xPercent}%`,top:`${a.yPercent}%`}} data-question={a.questionId}>{badge(q?.number??0)}<input aria-label={`Câu ${q?.number??''}`} value={answers[a.questionId]||''} onChange={e=>onAnswer(a.questionId,e.target.value)} placeholder={a.label||'Nhập từ'}/>{bookmark(a.questionId,q?.number??0,bookmarks,onToggleBookmark)}</div>})}</>}</div>:<p>Chưa có ảnh sơ đồ.</p>}{below&&<div className="diagram-answer-list">{group.questions.map(q=><div className="diagram-answer-row" data-question={q.id} key={q.id}>{badge(q.number)}{q.prompt&&<span className="diagram-answer-prompt"><RichText text={q.prompt}/></span>}<input aria-label={`Câu ${q.number}`} value={answers[q.id]||''} onChange={e=>onAnswer(q.id,e.target.value)} placeholder="Nhập đáp án"/>{bookmark(q.id,q.number,bookmarks,onToggleBookmark)}</div>)}</div>}</div>;
}
