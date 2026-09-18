// Masks use exact source-logo pixels, including A's swoosh and B's curved shoulder.
export const LETTERS = {
 A:{letter:'A',title:'設計與品質',color:'#3FB4F0',crop:[0,0,597,413],focus:[219,91]},
 B:{letter:'N',title:'生命履歷',color:'#FFA61A',crop:[611,0,412,413],focus:[176,171]},
 C:{letter:'L',title:'空間定位',color:'#FF2E1E',crop:[1105,0,347,413],focus:[38,190]},
 D:{letter:'B',title:'日常管理',color:'#18DCB9',crop:[1416,0,475,413],focus:[142,199]}
};
export const clamp=x=>Math.max(0,Math.min(1,x));
export const smooth=x=>{x=clamp(x);return x*x*(3-2*x)};
export function endingStages(t,c){
 const fadeStart=c.speechEnd+c.subtitleHold;
 const logoStart=fadeStart+c.subtitleFade;
 return {dark:smooth((t-c.closingFirst+.65)/1.2),
  first:smooth((t-c.closingFirst)/.6)*(1-smooth((t-fadeStart)/c.subtitleFade)),
  second:smooth((t-c.closingSecond)/.6)*(1-smooth((t-fadeStart)/c.subtitleFade)),
  white:smooth((t-c.closingFirst)/.9), logo:smooth((t-logoStart)/c.logoFade),
  dim:1-.67*smooth((t-logoStart)/c.logoFade)};
}
// Ordered in-place fades. D/B clears exactly when the main logo starts.
export function letterExit(t,c,id,reduced=false){
 const index=['A','B','C','D'].indexOf(id),end=c.speechEnd+c.subtitleHold+c.subtitleFade;
 const duration=2.1,start=end-duration-(3-index)*.85;
 const p=smooth((t-start)/duration);
 return {start,end:start+duration,p,x:0,y:0,alpha:1-p};
}

function path(ctx,points,color,width=1,progress=1){
 if(progress<=0)return;
 const lengths=points.slice(1).map((p,i)=>Math.hypot(p[0]-points[i][0],p[1]-points[i][1]));
 let left=lengths.reduce((a,b)=>a+b,0)*clamp(progress);
 ctx.strokeStyle=color;ctx.lineWidth=width;ctx.beginPath();ctx.moveTo(...points[0]);
 for(let i=0;i<lengths.length;i++){const q=points[i],r=points[i+1],f=Math.min(1,left/lengths[i]);ctx.lineTo(q[0]+(r[0]-q[0])*f,q[1]+(r[1]-q[1])*f);left-=lengths[i];if(left<=0)break}ctx.stroke();
}
function ring(ctx,x,y,r,color,width=1,progress=1){ctx.beginPath();ctx.strokeStyle=color;ctx.lineWidth=width;ctx.arc(x,y,r,-Math.PI/2,-Math.PI/2+Math.PI*2*clamp(progress));ctx.stroke()}
function dot(ctx,x,y,r,color){ctx.fillStyle=color;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill()}

function quality(ctx,t,color){
 // Braced frames, inset certificates, and drawn checks: no numeric claims.
 for(let row=-1;row<8;row++)for(let col=-1;col<10;col++){
  const x=col*64,y=row*62,phase=(row+col+20)%3;
  path(ctx,[[x,y+53],[x,y],[x+54,y],[x+54,y+53]],color+'66',.75);
  path(ctx,[[x,y+53],[x+27,y+15],[x+54,y+53]],color+'40',.55);
  ctx.fillStyle='#0f3245';ctx.fillRect(x+13,y+14,28,31);
  path(ctx,[[x+13,y+45],[x+13,y+14],[x+41,y+14],[x+41,y+45],[x+13,y+45]],color,1,clamp(t/1.15));
  const p=clamp((t-.5-phase*.10)/.75);
  path(ctx,[[x+19,y+29],[x+25,y+35],[x+36,y+23]],'#e1f8ff',1.9,p);
  path(ctx,[[x+17,y+40],[x+36,y+40]],color+'80',.65);
 }
}
function history(ctx,t,color){
 // Accumulated sheets remain in place; short moving arcs suggest continuity.
 for(let row=-1;row<7;row++)for(let col=-1;col<7;col++){
  const x=col*74,y=row*72;
  for(let k=2;k>=0;k--){ctx.fillStyle=k?'#102c40':'#163b55';ctx.fillRect(x+7+k*4,y+7+k*4,42,40);path(ctx,[[x+7+k*4,y+47+k*4],[x+7+k*4,y+7+k*4],[x+49+k*4,y+7+k*4],[x+49+k*4,y+47+k*4]],color+(k?'65':'dc'),.9,clamp((t-k*.2)/.9))}
  for(let k=0;k<3;k++)path(ctx,[[x+15,y+18+k*8],[x+38-k*3,y+18+k*8]],'#d9f3ff',.65,clamp((t-.7-k*.15)/.5));
  ring(ctx,x+48,y+46,10,color,.85,clamp((t-1)/.7));
  path(ctx,[[x+58,y+46],[x+68,y+46],[x+68,y+79]],color+'99',.6);
  dot(ctx,x+68,y+46+(t*7+col*3+row*5)%33,1.4,'#d9f3ff');
 }
}
function locationWorld(ctx,t,color){
 // Architectural parcels and orthogonal service routes, with locating brackets.
 for(let row=-1;row<7;row++)for(let col=-1;col<7;col++){
  const x=col*72,y=row*74;
  path(ctx,[[x,y],[x+60,y],[x+60,y+63],[x,y+63],[x,y]],color+'66',.8);
  path(ctx,[[x+22,y],[x+22,y+29],[x+60,y+29]],color+'55',.8);
  path(ctx,[[x,y+45],[x+38,y+45],[x+38,y+12],[x+68,y+12]],color,1.5,clamp((t-.5)/1.1));
  const focus=clamp((t-1.15)/.7);
  path(ctx,[[x+30,y+34],[x+30,y+29],[x+45,y+29],[x+45,y+35]],'#d9f3ff',1.2,focus);
  path(ctx,[[x+30,y+49],[x+30,y+55],[x+45,y+55],[x+45,y+49]],'#d9f3ff',1.2,focus);
  dot(ctx,x+38,y+42,2.5,color);
  const q=(t*.16+row*.12+col*.09)%1;
  dot(ctx,x+38,y+45-33*q,1.25,'#d9f3ff');
 }
}
function sensors(ctx,t,color){
 // Signal nodes and occupancy-like fields; no scores, percentages or fake readings.
 for(let row=-1;row<8;row++)for(let col=-1;col<9;col++){
  const x=col*58,y=row*58;
  ctx.fillStyle='#103045';ctx.fillRect(x+3,y+3,46,44);
  path(ctx,[[x+3,y+47],[x+3,y+3],[x+49,y+3],[x+49,y+47]],color+'66',.65);
  ring(ctx,x+26,y+25,10,color,1.2,clamp(t/.9));
  dot(ctx,x+26,y+25,2.5,'#d9f3ff');
  path(ctx,[[x+36,y+25],[x+55,y+25],[x+55,y+58],[x+26,y+58]],color,.85,clamp((t-.7)/1));
  const p=(t*.18+col*.11+row*.04)%1;
  dot(ctx,x+36+19*p,y+25,1.2,'#d9f3ff');
 }
}
const worlds={A:quality,B:history,C:locationWorld,D:sensors};

export class LetterView{
 constructor(canvas,id,logo){
  this.canvas=canvas;this.id=id;this.def=LETTERS[id];this.ctx=canvas.getContext('2d');
  this.layer=document.createElement('canvas');this.lc=this.layer.getContext('2d');
  this.mask=document.createElement('canvas');const [x,y,w,h]=this.def.crop;this.mask.width=w;this.mask.height=h;
  const m=this.mask.getContext('2d');m.drawImage(logo,x,y,w,h,0,0,w,h);
  // Remove neighbouring glyph pixels crossing the rectangular crop (L/B shoulder).
  if(id==='C')m.clearRect(311,0,36,315);
  if(id==='D')m.clearRect(0,315,93,98);
  // Centre the visible official glyph, not its rectangular source crop.
  const pixels=m.getImageData(0,0,w,h).data;
  let minX=w,minY=h,maxX=0,maxY=0;
  for(let py=0;py<h;py++)for(let px=0;px<w;px++)if(pixels[(py*w+px)*4+3]>127){minX=Math.min(minX,px);maxX=Math.max(maxX,px);minY=Math.min(minY,py);maxY=Math.max(maxY,py)}
  this.glyphCenter=[(minX+maxX+1)/2,(minY+maxY+1)/2];
  this.width=w;this.height=h;
 }
 draw(time,cues,reduced=false){
  const box=this.canvas.getBoundingClientRect();if(!box.width||!box.height)return;
  const ratio=Math.min(devicePixelRatio||1,1.5),w=Math.round(box.width*ratio),h=Math.round(box.height*ratio);
  if(this.canvas.width!==w||this.canvas.height!==h){this.canvas.width=this.layer.width=w;this.canvas.height=this.layer.height=h}
  const ctx=this.ctx,l=this.lc,k=w/1920;
  ctx.setTransform(k,0,0,h/1080,0,0);ctx.clearRect(0,0,1920,1080);
  ctx.fillStyle='#080f15';ctx.fillRect(0,0,1920,1080);
  const elapsed=time-cues[this.id];if(elapsed<0)return;
  const reveal=reduced?1:smooth((elapsed-.7)/(cues.revealDuration-.7));
  const z=Math.exp(Math.log(24)*(1-reveal)+Math.log(1.60)*reveal);
  const f=this.def.focus,cx=f[0]+(this.glyphCenter[0]-f[0])*reveal,cy=f[1]+(this.glyphCenter[1]-f[1])*reveal;
  const exit=letterExit(time,cues,this.id,reduced);
  const tx=960-z*cx+exit.x,ty=540-z*cy+exit.y;
  l.setTransform(k,0,0,h/1080,0,0);l.clearRect(0,0,1920,1080);l.save();l.translate(tx,ty);l.scale(z,z);
  const stages=endingStages(time,cues);
  l.fillStyle='#112530';l.fillRect(0,0,this.width,this.height);
  worlds[this.id](l,reduced?5:Math.max(0,elapsed),this.def.color);
  l.fillStyle=`rgba(255,255,255,${stages.white})`;l.fillRect(0,0,this.width,this.height);
  l.globalCompositeOperation='destination-in';l.drawImage(this.mask,0,0);l.restore();l.globalCompositeOperation='source-over';
  ctx.globalAlpha=stages.dim*smooth(elapsed/.35)*exit.alpha;ctx.drawImage(this.layer,0,0,w,h,0,0,1920,1080);ctx.globalAlpha=1;
  this.canvas.dataset.exit=exit.p.toFixed(3);this.canvas.dataset.center='960,540';
  this.canvas.dataset.reveal=reveal.toFixed(3);this.canvas.dataset.letter=this.def.letter;
 }
}
