import {useRef} from 'react';
import type {ReactNode} from 'react';
import {richTextRuns} from '../shared/richText';

export function RichText({text,highlight=''}:{text:string;highlight?:string}){
 const runs=richTextRuns(text),plain=runs.map(run=>run.text).join(''),at=highlight?plain.indexOf(highlight):-1;
 let offset=0;
 return <>{runs.map((run,i)=>{
  const start=offset;offset+=run.text.length;
  const pieces:[string,boolean][]=[];
  if(at<0||at>=offset||at+highlight.length<=start)pieces.push([run.text,false]);
  else{
   const a=Math.max(0,at-start),b=Math.min(run.text.length,at+highlight.length-start);
   if(a)pieces.push([run.text.slice(0,a),false]);pieces.push([run.text.slice(a,b),true]);if(b<run.text.length)pieces.push([run.text.slice(b),false]);
  }
  const content=pieces.map(([value,marked],j)=>marked?<mark key={j}>{value}</mark>:<span key={j}>{value}</span>);
  let node:ReactNode=content;
  if(run.bold)node=<strong>{node}</strong>;
  if(run.italic)node=<em>{node}</em>;
  if(run.large)node=<span className="rich-large">{node}</span>;
  return <span key={i}>{node}</span>;
 })}</>;
}

type RichTextareaProps={value:string;onChange:(value:string)=>void;label:string;placeholder?:string;disabled?:boolean};
export function RichTextarea({value,onChange,label,placeholder,disabled}:RichTextareaProps){
 const ref=useRef<HTMLTextAreaElement>(null);
 const wrap=(marker:string)=>{const input=ref.current;if(!input)return;const start=input.selectionStart,end=input.selectionEnd,selected=value.slice(start,end);const next=value.slice(0,start)+marker+selected+marker+value.slice(end);onChange(next);requestAnimationFrame(()=>{input.focus();input.setSelectionRange(start+marker.length,end+marker.length)})};
 return <div className="rich-field"><label>{label}<textarea ref={ref} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} disabled={disabled}/></label><div className="rich-toolbar" aria-label={`Định dạng ${label}`}><button type="button" disabled={disabled} aria-label={`Tô đậm ${label}`} title="Tô đậm phần chữ đã chọn" onClick={()=>wrap('**')}><b>B</b></button><button type="button" disabled={disabled} aria-label={`In nghiêng ${label}`} title="In nghiêng phần chữ đã chọn" onClick={()=>wrap('*')}><i>I</i></button><button type="button" disabled={disabled} aria-label={`Chữ lớn ${label}`} title="Tăng cỡ phần chữ đã chọn" onClick={()=>wrap('^^')}>A+</button><span>Chọn chữ rồi bấm định dạng; Enter để xuống dòng.</span></div></div>;
}
