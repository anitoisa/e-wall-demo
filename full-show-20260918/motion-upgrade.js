/* Shared-clock exhibition choreography. No network/hardware endpoints. */
globalThis.ExMotion=(()=>{
 const clamp=x=>Math.max(0,Math.min(1,x)),ease=x=>{x=clamp(x);return x*x*(3-2*x)},cache=new Map();
 let key='',mode='',changed=0,manual=false,first=true;
 function sample(id,now=performance.now()){
  const st=globalThis.showcaseState||{mode:'idle',segment:0,elapsed:0,playing:false,received:now,scenarioSeed:0};
  const next=st.mode+':'+st.segment+':'+st.scenarioSeed+':'+(st.sceneKey||'');
  if(next!==key){for(const c of cache.values())c.from=mode===st.mode?c.v:0;changed=now;manual=!first&&!st.playing&&st.elapsed<.1;first=false;key=next;mode=st.mode;}
  if(st.playing)manual=false;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches||!!st.shortBeat;
  // A render can refresh `received` after the current RAF timestamp was sampled.
  // Clamp that sub-frame negative offset before path/loop indexing.
  let t=Math.max(0,Math.min(st.segmentDuration||12,st.elapsed+(st.playing?(now-st.received)/1000:0)));
  if(manual)t=Math.max(t,Math.min(Math.max(1,(st.segmentDuration||12)-1),(now-changed)/1000));
  if(reduced)t=st.mode==='data'?18:12;
  const delay=({a:0,c:.15,s1:.5,s2:.8,s3:1.1,s4:1.4})[id]||0,p=reduced?1:ease((t-delay)/4.2);
  let c=cache.get(id);if(!c){c={from:Math.max(0,st.segment-1),v:0};cache.set(id,c);}
  c.v=c.from+(st.segment-c.from)*p;
  return {mode:st.mode,segment:st.segment,v:c.v,p,t,delay,reduced,manual,playing:st.playing,key,duration:st.segmentDuration||12};
 }
 return {sample,clamp,ease};
})();
const motionPose=(poses,body,extra='')=>`<g data-motion-poses='${JSON.stringify(poses)}' ${extra}>${body}</g>`;
const MP=(x,y,s=1,a=1)=>[x,y,s,a];
const motionPath=d=>`<path class="motion-link" pathLength="1" d="${d}"/>`;
const motionLabel=(x,y,text)=>tx(x,y,text,'large','middle');
function motionDocument(){return artSVG('查驗項目、查驗標記、文件入庫',
 `<g transform="translate(210 10)"><rect class="motion-document" width="1240" height="570" rx="24"/>${pic('record',55,35,110)}${tx(210,115,'SGS · 檢驗紀錄','large')}${['項目與文件','查驗與留存','驗證依據'].map((t,i)=>`<g data-enter="${i*.35}">${tx(85,245+i*110,t)}<path class="motion-check verification-tick" data-tick="${i}" pathLength="1" d="M980 ${215+i*110}l30 30 70-70"/></g>`).join('')}<path class="document-return motion-link" d="M1140 435V540H935V530"/><g data-reveal-stage="2">${pic('record',900,460,70)}${tx(990,510,'依據入庫')}</g></g>`);
}
function motionInfo(){return artSVG('建檔、維養計畫、履歷更新',
 `<g transform="translate(100 100)"><path class="info-volume" d="M0 100l230-100 230 100v250L230 450 0 350ZM0 100l230 130 230-130M230 230v220"/>${motionLabel(230,175,'BIM')}</g>`+
 [0,1,2].map(i=>`<g data-info-node="${i}" transform="translate(1040 ${20+i*205})">${pic(['layers','tools','record'][i],0,0,140)}${tx(190,85,['建築設備建檔','維養計畫','履歷更新'][i],'large')}</g>`).join('')+
 ['M560 310H815V90H1020','M560 310H1020','M1040 505H700V440H550'].map((d,i)=>`<g data-info-link="${i}"><path class="sequence-route-base" d="${d}"/><path class="motion-link" d="${d}"/></g>`).join(''));
}
function motionCutaway(){return artSVG('建築剖面、設備身份、對應紀錄',
 `<g data-cut-building>${[2,1,0].map(i=>`<g data-cut-slab="${i}" transform="translate(0 ${i*110})"><path class="cutaway-side-left" d="M0 150L350 325V348L0 173Z"/><path class="cutaway-side-right" d="M350 325L650 175V198L350 348Z"/><path class="cutaway-slab" d="M0 150L300 0L650 175L350 325Z"/><path class="cutaway-edges" d="M120 150L350 265L530 175M300 0V110M0 150V260M650 175V285"/></g>`).join('')}</g>`+
 `<g data-cut-device>${pic('pipe',0,0,235)}${motionLabel(117,320,'設備身份')}</g>`+
 `<g data-cut-record transform="translate(1100 50)"><path class="motion-document" d="M0 0H490L560 70V530H0ZM490 0V70H560"/>${pic('record',38,35,130)}${tx(205,125,'對應紀錄','large')}${tx(45,290,'設備建檔')}${tx(45,405,'維養與更新')}</g>`+
 `<path data-cut-link="0" class="motion-link" d="M475 330H750"/><path data-cut-link="1" class="motion-link" d="M935 330H1080"/>`);
}
function motionRings(){return artSVG('建築履歷由建造、交付至維養逐層累積',
 `<circle cx="440" cy="310" r="296" class="ring-field"/><g class="history-core"><path d="M380 380V260l60-45 60 45v120ZM407 380v-94h66v94M380 305h120M380 343h120"/>${tx(440,425,'建築履歷','','middle')}</g>`+
 [0,1,2].map(i=>{const r=155+i*65,y=85+i*195;return `<g data-ring="${i}"><circle class="history-orbit" cx="440" cy="310" r="${r}" pathLength="1" transform="rotate(-90 440 310)"/>${Array.from({length:24},(_,j)=>{const a=j/24*Math.PI*2-Math.PI/2,x=440+Math.cos(a)*r,y=310+Math.sin(a)*r;return `<path data-ring-mark="${j}" class="history-mark" d="M${x} ${y}l${Math.cos(a)*14} ${Math.sin(a)*14}"/>`;}).join('')}<path class="history-leader" d="M${440+r} 310H${800+i*45}V${y+40}H1010"/><g class="history-caption">${pic(['structure','handover','tools'][i],1050,y-15,100)}${tx(1190,y+48,['建造紀錄','交付資料','維養累積'][i],'large')}${tx(1190,y+112,['建材・工法・設備建檔','文件分類・交付關聯','檢查・更新・紀錄接續'][i])}</g><circle class="history-packet" r="9"/></g>`}).join(''));
}
// Fixed stages: the evidence changes, not the entire page layout.
function refinedRecord(){return artSVG('同一設備的身份、維養工作及紀錄欄位',
 `<g class="record-exhibit"><path class="record-plinth" d="M60 485l310-95 340 95-340 95Z"/><g class="record-pump"><path class="pump-body" d="M160 240h240v170H160zM400 210h135v235H400z"/><ellipse class="pump-face" cx="535" cy="327" rx="67" ry="116"/>${Array.from({length:9},(_,i)=>`<path class="pump-fin" d="M${175+i*25} 250v148"/>`).join('')}<path class="pump-service" d="M85 348h75M535 212v-67h120"/><path class="pump-flow" pathLength="1" d="M85 348h75M535 212v-67h120"/></g>${tx(60,80,'P-01｜給水設備','large')}${tx(60,130,'導覽設備 · DEMO-L06-P01')}</g>`+
 `<g data-record-stage="0" class="record-panel"><path class="record-sheet" d="M880 35h670l75 75v490H880Z"/><path class="record-fold" d="M1550 35v75h75"/>${pic('record',925,65,85)}${tx(1045,132,'設備維養履歷','large')}${tx(935,235,'設備身份')}${tx(1195,235,'P-01 · 給水設備')}<path class="record-divider" d="M930 275h630"/></g>`+
 `<g data-record-stage="1">${pic('tools',925,305,95)}${tx(1060,365,'保養與定期檢修','large')}${pic('manager',925,415,85)}${tx(1060,465,'物業安排／專業執行')}</g>`+
 `<g data-record-stage="2"><path class="record-tab" d="M930 520h640v65H930Z"/>${tx(950,565,'日期 · 作業內容 · 文件索引','record-field-caption')}${pic('check',1495,527,50)}</g><path class="record-connector" pathLength="1" d="M670 327H860"/>`);}
function refinedTracks(){const rows=[['layers','公區','外牆','清潔／檢視','專業作業'],['pipe','公區','加壓泵浦','保養／檢修','專業廠商'],['air','專有戶','全熱交換器','濾網清潔','耗材更新']];return artSVG('公區與專有戶設備，各自維養並接續紀錄',rows.map(([ic,area,name,work,renew],i)=>{const y=20+i*200;return `<g data-service-row="${i}"><path class="service-row-bg" d="M0 ${y}h1720v180H0Z"/>${pic(ic,25,y+30,120)}${tx(180,y+52,area)}${tx(180,y+120,name,'large')}<path class="service-rail" d="M530 ${y+85}H1650"/><path class="service-trail" pathLength="1" d="M530 ${y+85}H1650"/>${[[560,'check',work],[970,'tools',renew],[1390,'record','更新紀錄']].map(([x,icon,label],j)=>`<g data-service-event="${j}"><rect class="service-event" x="${x}" y="${y+22}" width="300" height="135" rx="16"/>${pic(icon,x+20,y+40,75)}${tx(x+112,y+96,label)}</g>`).join('')}<circle class="service-packet" r="8" cy="${y+85}"/></g>`;}).join(''))+`<div class="service-caption">概念事件順序；各設備依計畫維養，非統一更換年限</div>`;}
function motionEvidence(){return artSVG('建材、工法、設備的查驗與文件',
 motionPose([MP(0,70,.92),MP(0,70,.92),MP(0,70,.92)],`<g>${['建材','工法','設備'].map((t,i)=>`<g data-enter="${i*.4}"><rect class="motion-document" x="${i*350}" y="0" width="315" height="480" rx="18"/>${pic(['layers','structure','pipe'][i],i*350+75,45,165)}${motionLabel(i*350+155,290,t)}<g data-evidence-pair>${pic('check',i*350+50,335,70)}${pic('check',i*350+190,335,70)}${tx(i*350+85,450,'建造','','middle')}${tx(i*350+225,450,'交付','','middle')}</g></g>`).join('')}</g>`)+
 motionPose([MP(1110,75,1,0),MP(1110,75,1,.65),MP(1110,75,1)],`<rect class="motion-document" width="560" height="440" rx="20"/>${pic('record',40,25,120)}${tx(185,110,'查驗摘要','large')}${tx(45,225,'建造 ↔ 交付')}${tx(45,330,'文件與設備對照')}`)+`<g data-reveal-stage="2">${motionPath('M960 335H1090')}</g>`);
}
function motionSpace(){return artSVG('全棟、選層、設備區域連續定位',
 motionPose([MP(440,10,.92),MP(30,95,.68),MP(30,95,.68)],`${Array.from({length:12},(_,i)=>`<g data-spatial-floor="${i}"><path class="floor-depth" d="M0 ${i*48}l35-14h650v35l-35 14Z"/><rect class="${i===6?'selected-space':'floor-plan'}" x="0" y="${i*48}" width="650" height="35" rx="4"/>${[1,2,3,4].map(n=>`<path class="room-detail" d="M${n*130} ${i*48}v35"/>`).join('')}</g>`).join('')}<rect class="space-scan" x="-15" y="0" width="705" height="42" rx="5"/>${tx(235,642,'L06','large')}`)+
 motionPose([MP(660,35,.92,0),MP(660,35,.92),MP(660,35,.92)],`<path class="floor-plan" d="M0 50H1100V500H0ZM360 50v450M720 50v450M0 275h1100"/><path class="room-detail" d="M45 95H305V230H45ZM405 95H665V230H405ZM765 95H1055V230H765ZM45 320H305V450H45ZM405 320H665V450H405Z"/><rect class="selected-space" x="725" y="280" width="370" height="215"/><path class="space-route" pathLength="1" d="M160 170H545V370H875"/><g data-reveal-stage="2"><path class="device-halo" d="M780 310h220v150H780Z"/>${pic('pipe',820,320,125)}${tx(805,555,'P-01','large')}</g>`)+`<g data-reveal-stage="1">${motionPath('M490 310H650')}</g>`);}
const priorMotionPanel=revisionPanel;
revisionPanel=function(id){
 const m=state.mode,s=state.segment;
 let html;
 if(m==='idle'&&id==='s2')html=nativeFrame(id,'第三方品質把關','SGS 全品項驗證',motionDocument());
 if(m==='idle'&&id==='s3')html=nativeFrame(id,'從建造到維養的全資訊建構',['建築與設備建檔','連到維養計畫','更新資訊回存同一履歷'][s],motionInfo(),'review-long-title');
 if(m==='idle'&&id==='s4')html=nativeFrame(id,'建築紀錄看得到',['建築剖面與資訊','查閱設備身份','設備連到對應紀錄'][s],motionCutaway());
 if(m==='life'&&id==='c')html=nativeFrame(id,'建築生命履歷',['建造紀錄形成','交付資料加入','維養紀錄持續累積'][s],motionRings());
 if(m==='life'&&id==='s3')html=nativeFrame(id,'設備維養履歷',['設備建檔，建立維養身份','維養工作與執行分工','更新內容納入同一履歷'][s],refinedRecord(),'refined-record',REVIEW_NOTE);
 if(m==='life'&&id==='s4')html=nativeFrame(id,'120年資產維養計畫',['公區與專有戶，分別規劃','設備各有維養節奏','更新接續，履歷延續'][s],refinedTracks(),'refined-tracks',REVIEW_NOTE);
 if(m==='life'&&id==='s2')html=nativeFrame(id,'建築品質查驗','建造與交付，逐項查驗',motionEvidence());
 if(m==='bim'&&id==='c')html=nativeFrame(id,'從整體，找到位置',['全棟範圍 · L06','L06 · 東側設備區','P-01 · 同一台給水設備'][s],motionSpace());
 html??=priorMotionPanel(id);
 const targets={idle:['c','s1','s2','s3','s4'],life:['a','c','s1','s2','s3','s4'],bim:['a','c','s1','s2','s3','s4'],data:['a','c','s1','s2','s3','s4']};
 return html&&targets[m]?.includes(id)?html.replace('class="panel ',`data-motion-panel="${id}" class="panel motion-upgrade `):html;
};
function choreograph(now){
 requestAnimationFrame(choreograph);if(document.hidden)return;
 document.querySelectorAll('[data-motion-panel]').forEach(el=>{
  const a=ExMotion.sample(el.dataset.motionPanel,now),{v,p,t,segment,mode}=a;
  if(globalThis.ExSequence?.render(el,a))return;
  el.style.setProperty('--reveal',p);el.style.setProperty('--chapter-stage',v);
  el.querySelectorAll('[data-motion-poses]').forEach(g=>{
   const ps=JSON.parse(g.dataset.motionPoses),lo=Math.floor(v),hi=Math.min(2,lo+1),q=v-lo;
   const pose=ps[Math.min(2,lo)].map((x,i)=>x+(ps[hi][i]-x)*q);
   // Establish in place; no generic fly-in or zoom applied to every object.
   if(segment===0)pose[3]*=ExMotion.ease((t-a.delay)/1.1);
   g.setAttribute('transform',`translate(${pose[0]} ${pose[1]}) scale(${pose[2]})`);g.style.opacity=pose[3];
  });
  el.querySelectorAll('[data-reveal-stage]').forEach(g=>g.style.opacity=ExMotion.clamp((v-(+g.dataset.revealStage-1))*1.5));
  el.querySelectorAll('[data-enter]').forEach(g=>{const q=segment===0?ExMotion.ease((t-a.delay-(+g.dataset.enter))/2.5):1;g.style.opacity=q;g.style.transform=`translateY(${(1-q)*100}px)`;});
  el.querySelectorAll('.motion-link,.motion-check').forEach(g=>g.style.strokeDashoffset=segment===0?1-p:0);
  el.querySelectorAll('[data-tick]').forEach(g=>{const q=segment===0?0:segment===1?ExMotion.ease((t-.5-Number(g.dataset.tick)*.5)/1.2):1;g.style.strokeDashoffset=1-q;});
  el.querySelectorAll('[data-ring]').forEach(g=>{
   const i=Number(g.dataset.ring),q=i<segment?1:i>segment?0:ExMotion.ease(t/Math.max(1,a.duration-1));
   g.style.opacity=i>segment?.12:1;
   g.querySelector('.history-orbit').style.strokeDashoffset=1-q;
   g.querySelector('.history-leader').style.opacity=q;
   g.querySelectorAll('[data-ring-mark]').forEach(n=>n.style.opacity=ExMotion.clamp((q*24-Number(n.dataset.ringMark))*2));
   g.querySelectorAll('.icon,text').forEach(n=>n.style.opacity=i>segment?.22:Math.max(.22,q));
   const packet=g.querySelector('.history-packet'),angle=q*Math.PI*2-Math.PI/2,r=155+i*65;packet.setAttribute('cx',440+Math.cos(angle)*r);packet.setAttribute('cy',310+Math.sin(angle)*r);packet.style.opacity=q>0&&q<1?1:0;
  });
  el.querySelectorAll('[data-record-stage]').forEach(g=>{const k=Number(g.dataset.recordStage),q=k<segment?1:k>segment?0:ExMotion.ease((t-.6)/2.4);g.style.opacity=q;g.style.clipPath=`inset(0 ${(1-q)*100}% 0 0)`;});
  el.querySelectorAll('.record-connector').forEach(g=>g.style.strokeDashoffset=1-(segment>0?ExMotion.ease((t-.2)/1.3):0));
  el.querySelectorAll('.pump-flow').forEach(g=>{g.style.strokeDashoffset=String(-t*.08);g.style.opacity=segment>0?1:0;});
  el.querySelectorAll('[data-service-row]').forEach((row,i)=>{
   const q=ExMotion.ease((t-.5-i*.45)/2.8);row.style.opacity=segment===0?.3+.7*q:1;
   row.querySelectorAll('.service-rail,.service-trail').forEach(line=>line.setAttribute('d',`M530 ${105+i*200}H560M860 ${105+i*200}H970M1270 ${105+i*200}H1390`));
   row.querySelectorAll('[data-service-event]').forEach(g=>{const k=Number(g.dataset.serviceEvent),reveal=k<segment?1:k>segment?0:q;g.style.opacity=.12+.88*reveal;g.querySelector('.service-event').style.fillOpacity=.12+.45*reveal;g.querySelectorAll('.icon,text').forEach(n=>n.style.opacity=reveal);});
   row.querySelector('.service-trail').style.strokeDashoffset=1-(segment+q)/3;
   const dot=row.querySelector('.service-packet');dot.style.opacity=0;
  });
  el.querySelectorAll('[data-spatial-floor]').forEach(g=>{const i=Number(g.dataset.spatialFloor),q=segment>0?1:ExMotion.ease((t-(11-i)*.14)/1.2);g.style.opacity=.16+.84*q;});
  el.querySelectorAll('.space-scan').forEach(g=>{const q=segment>0?1:ExMotion.ease((t-.6)/3);g.setAttribute('y',String(48*6*q));g.style.opacity=segment===0?.8:0;});
  el.querySelectorAll('.space-route').forEach(g=>g.style.strokeDashoffset=String(segment===2?1-ExMotion.ease((t-.6)/2.8):1));
  if(mode==='bim'&&el.dataset.motionPanel==='c'&&segment===1){
   const plan=el.querySelectorAll('[data-motion-poses]')[1];
   if(plan)plan.style.opacity=ExMotion.ease((v-.7)/.3);
  }
  if(mode==='idle'&&el.dataset.motionPanel==='c'){
   const model=el.querySelector('.revision-model'),aside=el.querySelector('.promise-focus');
   model.style.right='23%';
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
   const layout=1;
   el.querySelectorAll('.maintenance-tracks>section').forEach((row,i)=>{
    const q=ExMotion.ease((t-.6-i*.5)/3.2);
    row.style.setProperty('--track-progress',(segment+q)/3);
    row.style.left=`${i*575*(1-layout)}px`;row.style.top=`${90+i*160*layout}px`;
    row.style.width=`${500+1240*layout}px`;row.style.height=`${440-265*layout}px`;
    const track=row.querySelector('.track-path');track.style.left=`${465*layout}px`;track.style.top=`${225*(1-layout)}px`;
    row.style.transform='none';
    row.querySelector('.track-labels').style.opacity=1;
    row.style.opacity=segment===0?.15+.85*q:1;
   });
  }
  if(mode==='bim'&&el.dataset.motionPanel==='s2'){
   const network=el.querySelector('.motion-route');if(network)network.style.transform='none';
  }
  if(mode==='bim'&&el.dataset.motionPanel==='s3'){
   el.querySelector('.show-viewport').style.setProperty('right','54%','important');
   const side=el.querySelector('.review-equipment');side.style.opacity=segment===0?ExMotion.ease((t-.5)/1.1):1;side.style.transform='none';
  }
  if(mode==='data')dataReveal(el,a);
  // Semantic icon details remain visible after the main reveal, without full-wall flashing.
  el.querySelectorAll('.icon .draw,.icon .flow-path,.icon .pulse-dot').forEach((g,i)=>{
   if(g.closest('.attention-icon'))return;
   g.style.opacity=1;
   if(g.classList.contains('draw')&&g.getTotalLength){const n=g.getTotalLength();g.style.strokeDasharray=String(n);g.style.strokeDashoffset=String(n*(1-(a.reduced||segment>0?1:ExMotion.ease((t-a.delay-.15)/1.6))));}
   if(g.classList.contains('flow-path')&&g.getTotalLength){const n=g.getTotalLength();g.style.strokeDasharray=`${n*.16} ${n*.08}`;g.style.strokeDashoffset=a.reduced?'0':String(-t*18);}
   if(g.classList.contains('pulse-dot'))g.style.transform='none';
  });
  el.querySelectorAll('.icon[data-icon-kind]').forEach(svg=>{
   if(svg.classList.contains('attention-icon'))return;
   const parent=svg.closest('[data-record-stage],[data-service-event],[data-ring],[data-reveal-stage]');
   const stage=parent?Number(parent.dataset.recordStage??parent.dataset.serviceEvent??parent.dataset.ring??parent.dataset.revealStage):0;
   const local=t-a.delay-.35,q=a.reduced||stage<segment?1:stage>segment?0:ExMotion.ease(local/1.8);
   const type=svg.dataset.iconKind;
   svg.querySelectorAll('.draw,.record-lines').forEach(path=>{const n=path.getTotalLength();path.style.strokeDasharray=String(n);path.style.strokeDashoffset=String(n*(1-q));});
   if(type==='record'){const stamp=svg.querySelector('.pulse-dot');if(stamp){stamp.style.opacity=ExMotion.clamp((q-.55)/.45);stamp.style.transformBox='fill-box';stamp.style.transformOrigin='center';stamp.style.transform=`scale(${1.25-.25*q})`;}}
   if(type==='target'){const ring=svg.querySelector('circle');ring.style.transformBox='fill-box';ring.style.transformOrigin='center';ring.style.transform=`scale(${1.3-.3*q})`;}
   if(type==='air'&&!a.reduced&&q===1){svg.querySelectorAll('.draw').forEach(path=>{const n=path.getTotalLength();path.style.strokeDasharray=`${n*.8} ${n*.2}`;path.style.strokeDashoffset=String(-t*12);});}
  });
 });
}
function dataReveal(el,a){
 const id=el.dataset.motionPanel,t=a.t,e=ExMotion.ease;
 const q1=a.reduced?1:e((t-1)/3),q2=a.reduced?1:e((t-4)/3),q3=a.reduced?1:e((t-8)/3);
 if(id==='s1'){
  const symbol=el.querySelector('.raw-symbol');symbol.style.transform='none';
  el.querySelectorAll('.raw-row').forEach((r,i)=>{const q=i?q2:q1;r.style.opacity=q;r.style.transform='none';});
  const snap=BOS.snapshot(a.segment,t,globalThis.showcaseState.scenarioSeed);
  el.querySelectorAll('.raw-row').forEach((row,i)=>{const r=snap.selected[i];row.querySelector('strong').firstChild.textContent=r.value.toFixed(snap.index===3?3:snap.index===2?0:1);row.querySelector('i').style.background=r.color;});
 }
 if(id==='s2'){
  el.querySelectorAll('.ex-art>text,.ex-art>rect,.distribution-base').forEach(g=>g.style.opacity=q2);
 }
 if(id==='s3'){
  el.querySelectorAll('.matrix-floor').forEach(row=>{row.style.opacity=1;row.style.transform='none';row.querySelectorAll('.house-cell').forEach(c=>{c.style.background='var(--house-color)';c.style.borderColor=c.classList.contains('chosen')?'#fff':'transparent';c.style.outlineColor=c.classList.contains('chosen')?'#fff':'transparent';});});
 }
 if(id==='s4'){
  const reading=el.querySelector('.causal-reading'),rule=el.querySelector('.causal-rule'),score=el.querySelector('.causal-score');
  reading.style.transform='none';
  rule.style.opacity=q2;rule.style.transform='none';
  score.style.opacity=q3;score.style.transform='none';
  el.querySelector('.score-record-line').style.opacity=q3;
  el.querySelectorAll('.causal-arrow').forEach((g,i)=>g.style.opacity=i?q3:q2);
 }
}
requestAnimationFrame(choreograph);
