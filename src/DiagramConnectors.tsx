import type {Content} from '../shared/reading';

type DiagramAnchor=Extract<Content,{kind:'diagram'}>['anchors'][number];

export function DiagramConnectors({anchors}:{anchors:DiagramAnchor[]}){
 return <svg className="diagram-connectors" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
  {anchors.filter(a=>a.sourceXPercent!==undefined&&a.sourceYPercent!==undefined).map(a=>{
   const x=a.sourceXPercent!,y=a.sourceYPercent!,mid=x+(a.xPercent-x)*.45;
   return <g key={a.questionId}><polyline points={`${x},${y} ${mid},${y} ${mid},${a.yPercent} ${a.xPercent},${a.yPercent}`} fill="none" stroke="#7663cc" strokeWidth="2" vectorEffect="non-scaling-stroke" strokeLinejoin="round"/><circle cx={x} cy={y} r="1.15" fill="#6545cf" stroke="#ffffff" strokeWidth="2" vectorEffect="non-scaling-stroke"/></g>;
  })}
 </svg>;
}
