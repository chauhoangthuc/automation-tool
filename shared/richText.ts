export type RichRun={text:string;bold:boolean;large:boolean;italic:boolean};

// Formatting stays inside the existing text fields; no HTML is stored or rendered.
export function richTextRuns(source:string):RichRun[]{
 const runs:RichRun[]=[];let bold=false,large=false,italic=false;
 const push=(text:string)=>{if(!text)return;const last=runs.at(-1);if(last&&last.bold===bold&&last.large===large&&last.italic===italic)last.text+=text;else runs.push({text,bold,large,italic})};
 for(let i=0;i<source.length;){
  const marker=source.startsWith('**',i)?'**':source.startsWith('^^',i)?'^^':source[i]==='*'?'*':'';
  const active=marker==='**'?bold:marker==='^^'?large:marker==='*'?italic:false;
  if(marker&&(active||source.indexOf(marker,i+marker.length)>=0)){
   if(marker==='**')bold=!bold;else if(marker==='^^')large=!large;else italic=!italic;
   i+=marker.length;continue;
  }
  push(marker||source[i]);i+=marker?marker.length:1;
 }
 return runs;
}

export const plainReadingText=(source:string)=>richTextRuns(source).map(run=>run.text).join('');
