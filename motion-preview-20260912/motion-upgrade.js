/* Shared-clock exhibition choreography. No network/hardware endpoints. */
globalThis.ExMotion=(()=>{
 const clamp=x=>Math.max(0,Math.min(1,x)),ease=x=>{x=clamp(x);return x*x*(3-2*x)},cache=new Map();
 let key='',mode='',changed=0,manual=false,first=true;
 function sample(id,now=performance.now()){
  const st=globalThis.showcaseState||{mode:'idle',segment:0,elapsed:0,playing:false,received:now,scenarioSeed:0};
  const next=st.mode+':'+st.segment+':'+st.scenarioSeed;
  if(next!==key){for(const c of cache.values())c.from=mode===st.mode?c.v:0;changed=now;manual=!first&&!st.playing&&st.elapsed<.1;first=false;key=next;mode=st.mode;}
  if(st.playing)manual=false;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  let t=Math.min(st.segmentDuration||12,st.elapsed+(st.playing?(now-st.received)/1000:0));
  if(manual)t=Math.max(t,Math.min(st.mode==='data'?12:6,(now-changed)/1000));
  if(reduced)t=st.mode==='data'?18:12;
  const delay=({a:0,c:.15,s1:.5,s2:.8,s3:1.1,s4:1.4})[id]||0,p=reduced?1:ease((t-delay)/4.2);
  let c=cache.get(id);if(!c){c={from:Math.max(0,st.segment-1),v:0};cache.set(id,c);}
  c.v=c.from+(st.segment-c.from)*p;
  return {mode:st.mode,segment:st.segment,v:c.v,p,t,delay,reduced,playing:st.playing,key};
 }
 return {sample,clamp,ease};
})();
const motionPose=(poses,body,extra='')=>`<g data-motion-poses='${JSON.stringify(poses)}' ${extra}>${body}</g>`;
const MP=(x,y,s=1,a=1)=>[x,y,s,a];
const motionPath=d=>`<path class="motion-link" pathLength="1" d="${d}"/>`;
const motionLabel=(x,y,text)=>tx(x,y,text,'large','middle');
function motionDocument(){return artSVG('查驗項目、查驗標記、文件入庫',
 motionPose([MP(365,5),MP(65,90,.74),MP(60,100,.67)],`<rect class="motion-document" width="940" height="560" rx="24"/>${pic('record',40,25,115)}${tx(185,110,'SGS · 檢驗紀錄','large')}${['項目與文件','查驗與留存','驗證依據'].map((t,i)=>`<g data-enter="${i*.75}">${tx(75,235+i*110,t)}<path class="motion-check" pathLength="1" d="M740 ${205+i*110}l30 30 70-70"/></g>`).join('')}`)+
 motionPose([MP(1090,115,.15,0),MP(1060,85,1),MP(980,0,1)],`${pic('check',0,0,290)}${motionLabel(145,400,'第三方品質把關')}`)+
 motionPose([MP(1190,420,.3,0),MP(1190,420,.3,0),MP(1190,465,1)],`${pic('record',0,0,110)}${tx(145,76,'依據入庫')}`)+`<g data-reveal-stage="1">${motionPath('M770 295H1040')}</g><g data-reveal-stage="2">${motionPath('M1195 410V445')}</g>`);
}
function motionInfo(){return artSVG('建檔、維養計畫、履歷更新',
 motionPose([MP(480,20,1.35),MP(90,95,.9),MP(100,115,.85)],`<path class="info-volume" d="M0 100l230-100 230 100v250L230 450 0 350ZM0 100l230 130 230-130M230 230v220"/>${motionLabel(230,175,'BIM')}`)+
 [0,1,2].map((i)=>motionPose([MP(1000,100+i*160,.15,0),MP(1000,20+i*205,1,i<2?1:0),MP(1040,20+i*205,1)],`${pic(['layers','tools','record'][i],0,0,140)}${tx(190,85,['建築設備建檔','維養計畫','履歷更新'][i],'large')}`)).join('')+
 `<g data-reveal-stage="1">${motionPath('M550 310H815V90H1020M815 310H1020')}</g><g data-reveal-stage="2">${motionPath('M1040 505H700V440H550')}</g>`);
}
function motionCutaway(){return artSVG('建築剖面、設備身份、對應紀錄',
 motionPose([MP(480,5,.98),MP(30,100,.8),MP(15,160,.68)],`<path class="floor-plan" d="M0 180 310 20 680 180V440L310 600 0 440ZM0 180l310 160 370-160M310 340v260"/>${[0,1,2].map(i=>`<path class="info-volume" d="M20 ${205+i*75}l290-140 350 140-350 155Z"/>`).join('')}`)+
 motionPose([MP(730,310,.25,.4),MP(900,110,1.5),MP(650,185,.95)],`${pic('pipe',0,0,240)}${motionLabel(120,330,'設備身份')}`)+
 motionPose([MP(1270,150,.15,0),MP(1270,150,.15,0),MP(1120,80,1)],`<rect class="motion-document" width="530" height="480" rx="22"/>${pic('record',35,35,145)}${tx(215,130,'對應紀錄','large')}${tx(45,280,'設備建檔')}${tx(45,375,'維養與更新')}`)+`<g data-reveal-stage="2">${motionPath('M850 310H1090')}</g>`);
}
function motionRings(){return artSVG('建築履歷由建造、交付至維養逐層累積',
 [0,1,2].map(i=>motionPose([MP(550,0,1,i===0?1:0),MP(i===0?120:1000,10,i===0?.85:1,i<2?1:0),MP(30+i*560,75,.85)],`<circle class="motion-year-ring" cx="280" cy="240" r="215"/><circle class="motion-year-ring inner" cx="280" cy="240" r="${140+i*22}"/>${pic(['structure','handover','tools'][i],205,155,150)}${motionLabel(280,555,['建造紀錄','交付資料','維養累積'][i])}`)).join('')+`<g data-reveal-stage="2">${motionPath('M490 310H580M1050 310H1140')}</g>`);
}
function motionEvidence(){return artSVG('建材、工法、設備的查驗與文件',
 motionPose([MP(210,10,1.18),MP(10,10,1),MP(0,210,.62)],`<g>${['建材','工法','設備'].map((t,i)=>`<g data-enter="${i*.6}"><rect class="motion-document" x="${i*350}" y="0" width="315" height="480" rx="18"/>${pic(['layers','structure','pipe'][i],i*350+75,45,165)}${motionLabel(i*350+155,290,t)}${pic('check',i*350+105,335,100)}</g>`).join('')}</g>`)+
 motionPose([MP(1140,50,.2,0),MP(1130,55,1),MP(880,0,1.3)],`<rect class="motion-document" width="560" height="440" rx="20"/>${pic('record',40,25,120)}${tx(185,110,'查驗摘要','large')}${tx(45,225,'建造 ↔ 交付')}${tx(45,330,'文件與設備對照')}`)+`<g data-reveal-stage="2">${motionPath('M650 335H865')}</g>`);
}
function motionSpace(){return artSVG('全棟、選層、設備區域連續定位',
 motionPose([MP(440,0,1),MP(35,100,.65),MP(20,255,.4)],`${Array.from({length:12},(_,i)=>`<rect class="${i===6?'selected-space':'floor-plan'}" x="0" y="${i*48}" width="750" height="35"/>`).join('')}${tx(795,330,'L06','large')}`)+
 motionPose([MP(1000,200,.1,0),MP(700,15,.82),MP(420,20,1.13)],`<path class="floor-plan" d="M0 50H1100V500H0ZM360 50v450M720 50v450M0 275h1100"/><rect class="selected-space" x="725" y="280" width="370" height="215"/><path class="route-flow" d="M160 170H545V370H875"/><g data-reveal-stage="2">${pic('target',780,290,175)}${tx(805,555,'P-01','large')}</g>`));}
const priorMotionPanel=revisionPanel;
revisionPanel=function(id){
 const m=state.mode,s=state.segment;
 let html;
 if(m==='idle'&&id==='s2')html=nativeFrame(id,'第三方品質把關','SGS 全品項驗證',motionDocument());
 if(m==='idle'&&id==='s3')html=nativeFrame(id,'從建造到維養的全資訊建構',['建築與設備建檔','連到維養計畫','更新資訊回存同一履歷'][s],motionInfo(),'review-long-title');
 if(m==='idle'&&id==='s4')html=nativeFrame(id,'建築紀錄看得到',['建築剖面與資訊','查閱設備身份','設備連到對應紀錄'][s],motionCutaway());
 if(m==='life'&&id==='c')html=nativeFrame(id,'建築生命履歷',['建造紀錄形成','交付資料加入','維養紀錄持續累積'][s],motionRings());
 if(m==='life'&&id==='s2')html=nativeFrame(id,'建築品質查驗','建造與交付，逐項查驗',motionEvidence());
 if(m==='bim'&&id==='c')html=nativeFrame(id,'從整體，找到位置',['全棟範圍 · L06','L06 · 東側設備區','P-01 · 同一台給水設備'][s],motionSpace());
 html??=priorMotionPanel(id);
 const targets={idle:['c','s1','s2','s3','s4'],life:['a','c','s1','s2','s3','s4'],bim:['a','c','s1','s2','s3','s4'],data:['a','s1','s2','s3','s4']};
 return html&&targets[m]?.includes(id)?html.replace('class="panel ',`data-motion-panel="${id}" class="panel motion-upgrade `):html;
};
function choreograph(now){
 requestAnimationFrame(choreograph);if(document.hidden)return;
 document.querySelectorAll('[data-motion-panel]').forEach(el=>{
  const a=ExMotion.sample(el.dataset.motionPanel,now),{v,p,t,segment,mode}=a;
  el.style.setProperty('--reveal',p);el.style.setProperty('--chapter-stage',v);
  el.querySelectorAll('[data-motion-poses]').forEach(g=>{
   const ps=JSON.parse(g.dataset.motionPoses),lo=Math.floor(v),hi=Math.min(2,lo+1),q=v-lo;
   const pose=ps[Math.min(2,lo)].map((x,i)=>x+(ps[hi][i]-x)*q);
   if(segment===0){pose[0]+=110*(1-p);pose[1]+=75*(1-p);pose[2]*=.65+.35*p;pose[3]*=p;}
   g.setAttribute('transform',`translate(${pose[0]} ${pose[1]}) scale(${pose[2]})`);g.style.opacity=pose[3];
  });
  el.querySelectorAll('[data-reveal-stage]').forEach(g=>g.style.opacity=ExMotion.clamp((v-(+g.dataset.revealStage-1))*1.5));
  el.querySelectorAll('[data-enter]').forEach(g=>{const q=segment===0?ExMotion.ease((t-a.delay-(+g.dataset.enter))/2.5):1;g.style.opacity=q;g.style.transform=`translateY(${(1-q)*100}px)`;});
  el.querySelectorAll('.motion-link,.motion-check').forEach(g=>g.style.strokeDashoffset=1-p);
  if(mode==='idle'&&el.dataset.motionPanel==='c'){
   const model=el.querySelector('.revision-model'),aside=el.querySelector('.promise-focus');
   model.style.right=`${segment===0?4+28*p:32}%`;
   aside.style.opacity=segment===0?ExMotion.ease((t-2.5)/2):1;
  }
  if(mode==='life'&&el.dataset.motionPanel==='a'){
   const label=el.querySelector('.life-event-name');label.textContent=label.textContent.replace(/，\s*/g,'，\n');
  }
  // Document identity changes its layout, rather than only showing tiny fields.
  if(mode==='life'&&el.dataset.motionPanel==='s3'){
   const r=el.querySelector('.motion-record');r?.style.setProperty('--record-open',Math.min(1,v));r?.style.setProperty('--record-save',Math.max(0,v-1));
  }
  if(mode==='life'&&el.dataset.motionPanel==='s4'){
   const layout=Math.min(1,v);
   el.querySelectorAll('.maintenance-tracks>section').forEach((row,i)=>{
    const q=ExMotion.ease((t-.6-i*.5)/3.2);
    row.style.setProperty('--track-progress',(segment+q)/3);
    row.style.left=`${i*575*(1-layout)}px`;row.style.top=`${90+i*160*layout}px`;
    row.style.width=`${500+1240*layout}px`;row.style.height=`${440-265*layout}px`;
    const track=row.querySelector('.track-path');track.style.left=`${465*layout}px`;track.style.top=`${225*(1-layout)}px`;
    row.style.transform=`translateY(${(1-q)*20}px)`;
    row.querySelector('.track-labels').style.opacity=segment===1?Math.abs(layout-.5)*2:1;
    row.style.opacity=segment===0?.15+.85*q:1;
   });
  }
  if(mode==='bim'&&el.dataset.motionPanel==='s2'){
   const network=el.querySelector('.motion-route');if(network){network.style.transformOrigin='850px 300px';network.style.transform=`translate(${v>1?-100*(v-1):0}px,0) scale(${segment===0?.68+.32*p:1+Math.max(0,v-1)*.09})`;}
  }
  if(mode==='bim'&&el.dataset.motionPanel==='s3'){
   el.querySelector('.show-viewport').style.setProperty('right',`${segment===0?54*p:54+4*Math.max(0,v-1)}%`,'important');
   const side=el.querySelector('.review-equipment');side.style.opacity=segment===0?ExMotion.ease((p-.96)/.04):1;side.style.transform=`translateX(${(1-p)*160}px)`;
  }
  if(mode==='data')dataReveal(el,a);
  // Semantic icon details remain visible after the main reveal, without full-wall flashing.
  el.querySelectorAll('.icon .draw,.icon .flow-path,.icon .pulse-dot').forEach((g,i)=>{
   const gentle=a.reduced?1:.91+.09*Math.sin(t*1.3+i*.7);g.style.opacity=gentle;
   if(g.classList.contains('draw')&&g.getTotalLength){const n=g.getTotalLength();g.style.strokeDasharray=String(n);g.style.strokeDashoffset=String(n*(1-(a.reduced?1:ExMotion.ease((t-a.delay-.15)/2.2))));}
   if(g.classList.contains('flow-path')&&g.getTotalLength){const n=g.getTotalLength();g.style.strokeDasharray=`${n*.16} ${n*.08}`;g.style.strokeDashoffset=a.reduced?'0':String(-t*18);}
   if(g.classList.contains('pulse-dot')){g.style.transformBox='fill-box';g.style.transformOrigin='center';g.style.transform=`scale(${a.reduced?1:1+.045*Math.sin(t*1.3)})`;}
  });
 });
}
function dataReveal(el,a){
 const id=el.dataset.motionPanel,t=a.t,e=ExMotion.ease;
 const q1=a.reduced?1:e((t-1)/3),q2=a.reduced?1:e((t-4)/3),q3=a.reduced?1:e((t-8)/3);
 if(id==='s1'){
  const symbol=el.querySelector('.raw-symbol');symbol.style.transform=`translateX(${(1-q1)*420}px) scale(${1.4-.4*q1})`;
  el.querySelectorAll('.raw-row').forEach((r,i)=>{const q=i?q2:q1;r.style.opacity=q;r.style.transform=`translateX(${(1-q)*300}px)`;});
  const snap=BOS.snapshot(a.segment,t,globalThis.showcaseState.scenarioSeed);
  el.querySelectorAll('.raw-row').forEach((row,i)=>{const r=snap.selected[i];row.querySelector('strong').firstChild.textContent=r.value.toFixed(snap.index===3?3:snap.index===2?0:1);row.querySelector('i').style.background=r.color;});
 }
 if(id==='s2'){
  el.querySelectorAll('.ex-art>text,.ex-art>rect,.distribution-base').forEach(g=>g.style.opacity=q2);
 }
 if(id==='s3'){
  el.querySelectorAll('.matrix-floor').forEach((row,i)=>{const q=a.reduced?1:e((t-i*.2)/2.5);row.style.opacity=q;row.style.transform=`translateY(${(1-q)*(230-i*10)}px)`;row.querySelectorAll('.house-cell').forEach((c,j)=>{const k=a.reduced?1:e((t-3-i*.13-j*.06)/2.6);c.style.background=`color-mix(in srgb, var(--house-color) ${k*100}%, #142b38)`;c.style.borderColor=c.classList.contains('chosen')&&q3>.9?'#fff':'transparent';c.style.outlineColor=c.classList.contains('chosen')&&q3>.9?'#fff':'transparent';});});
 }
 if(id==='s4'){
  const reading=el.querySelector('.causal-reading'),rule=el.querySelector('.causal-rule'),score=el.querySelector('.causal-score');
  reading.style.transform=`translateX(${(1-q2)*480}px) scale(${1.2-.2*q2})`;
  rule.style.opacity=q2;rule.style.transform=`translateY(${(1-q2)*130}px)`;
  score.style.opacity=q3;score.style.transform=`translateX(${(1-q3)*180}px) scale(${.7+.3*q3})`;
  el.querySelector('.score-record-line').style.opacity=q3;
  el.querySelectorAll('.causal-arrow').forEach((g,i)=>g.style.opacity=i?q3:q2);
 }
}
requestAnimationFrame(choreograph);
