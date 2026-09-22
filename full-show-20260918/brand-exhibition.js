/* Brand exhibition revision. Shared chapter clock; no new API or private timeline. */
const MAIN_COPY={idle:['核電廠同級耐震力','品質有保證','全透明原生健康建築'],life:['建物生產履歷','從建造到維養的全資訊建構','智慧建築履歷傳承'],bim:['全棟空間精準定位','隱蔽管線可視化','設備履歷一站整合'],data:['全棟溫度分布','逐戶濕度管理','CO₂ 與通風觀察','同條件用電比較']};
Object.assign(BEAT_NAMES,MAIN_COPY);
BEAT_ICONS.life=['record','handover','tools'];
GUIDES.life=['建構維養履歷，生命軸從 0 年開始。','智慧大腦監測，滾動調整維養週期。','預判設備更替，智慧建築履歷傳承。'];
GUIDES.idle=['結構與管線分離，呈現寶舖的耐震設計主張。','第三方品質把關，檢驗文件逐步展開。','從建造到維養，完整建構建築資訊。'];
MODES.forEach(m=>{m.segments=MAIN_COPY[m.id];m.cues=GUIDES[m.id];STORY[m.id].forEach((s,i)=>s.title=MAIN_COPY[m.id][i]);});
Object.assign(MODES.find(m=>m.id==='idle'),{note:'高標準耐震設計、第三方品質把關、全生命週期維養。'});
Object.assign(MODES.find(m=>m.id==='life'),{claim:'建築生命履歷',note:'從建造到維養，完整建構建築資訊。'});
Object.assign(MODES.find(m=>m.id==='bim'),{claim:'空間、設備、文件\n一次定位',note:'BIM 全資產生命週期，整合空間、設備與文件。'});
const LIFE_EVENTS=['建構維養履歷','智慧大腦監測','滾動調整維養週期','預判設備更替','建築履歷傳承'];
const LIFE_ICONS=['record','pulse','clock','tools','handover'];
function lifeYearAt(seconds){const t=Math.max(0,Math.min(36,seconds));if(t<2)return 0;if(t<7)return(t-2)*6;if(t<9)return 30;if(t<14)return 30+(t-9)*6;if(t<16)return 60;if(t<21)return 60+(t-16)*6;if(t<23)return 90;if(t<28)return 90+(t-23)*6;return 120;}
// Every surface uses the authored orange rail's axis; timing remains unchanged.
const LIFE_AXIS_GEOMETRY={x:150,y:610,dx:779,dy:-448};
function lifePoint(year){const z=Math.max(0,Math.min(120,year))/120,k=z/(1+.72*z),u=k*1.72,g=LIFE_AXIS_GEOMETRY;return {x:g.x+g.dx*u,y:g.y+g.dy*u,r:52-37*k,u};}
function lifeRail(){
 const g=LIFE_AXIS_GEOMETRY,near={x:g.x-g.dx*.05,y:g.y-g.dy*.05,w:84},far={x:g.x+g.dx*1.19,y:g.y+g.dy*1.19,w:33};
 const top=`M${near.x-near.w} ${near.y}L${far.x-far.w} ${far.y}L${far.x+far.w} ${far.y}L${near.x+near.w} ${near.y}Z`;
 const depth=`M${near.x-near.w} ${near.y}L${near.x+near.w} ${near.y}L${far.x+far.w} ${far.y}v10L${near.x+near.w} ${near.y+26}H${near.x-near.w}Z`;
 return `<path class="rail-depth" d="${depth}"/><path class="rail-top" d="${top}"/>`;
}
function lifeTrailGeometry(year){
 const p=lifePoint(year),g=LIFE_AXIS_GEOMETRY,len=Math.hypot(g.dx,g.dy),ux=g.dx/len,uy=g.dy/len,rx=p.r+13,ry=rx*.45;
 // Intersection of the rail with the near edge of the moving ellipse.
 const radius=1/Math.hypot(ux/rx,uy/ry),distance=Math.max(0,p.u*len-radius);
 return {p,rx,ry,d:`M${g.x} ${g.y}L${g.x+ux*distance} ${g.y+uy*distance}`,visible:distance>0};
}
function lifeAxis(){return `<div class="life-axis" data-key="life-axis"><svg viewBox="0 0 1200 710" role="img" aria-label="0 至 120 年立體建築生命軸"><defs><linearGradient id="rail-metal" x2="1" y2="0"><stop stop-color="#80501e"/><stop offset=".45" stop-color="#ffd897"/><stop offset="1" stop-color="#533c24"/></linearGradient></defs><path class="rail-depth" d="M68 650L1110 8 1143 8 220 650V682H68Z"/><path class="rail-top" d="M68 650L1110 8 1143 8 220 650Z"/>${Array.from({length:25},(_,i)=>{const p=lifePoint(i*5);return `<path class="rail-tick" d="M${p.x-34} ${p.y+12}l${68-i*1.5} -9"/>`;}).join('')}<path class="life-trail" d="M150 610L929 162" pathLength="120"/>${LIFE_EVENTS.map((t,i)=>{const p=lifePoint(i*30);return `<g class="life-node" data-year="${i*30}" transform="translate(${p.x} ${p.y})"><ellipse class="node-base" cy="12" rx="${p.r}" ry="${p.r*.45}"/><ellipse class="node-light" rx="${p.r}" ry="${p.r*.45}"/><text x="${-p.r-24}" y="-12" text-anchor="end">${i*30}</text></g>`;}).join('')}<g class="life-cursor"><ellipse rx="65" ry="28"/><path d="M0 -55V0"/></g></svg></div><aside class="life-event"><div class="life-year"><strong data-life-number>0</strong><span>年 / 120</span></div><div class="life-current-icon">${LIFE_ICONS.map((ic,i)=>`<div data-life-icon="${i}">${icon(ic)}</div>`).join('')}</div><strong class="life-event-name">建物生產履歷</strong><div class="life-event-index">${LIFE_EVENTS.map((_,i)=>`<i data-life-stop="${i}"></i>`).join('')}</div><p>全生命週期維養目標</p></aside>`;}
function updateLifeAxis(now){requestAnimationFrame(updateLifeAxis);const shared=globalThis.showcaseState;if(!shared||shared.mode!=='life')return;const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches,t=(shared.chapterElapsed??shared.segment*12+shared.elapsed)+(shared.playing?(now-shared.received)/1000:0),year=Number.isFinite(shared.lifeAxisYear)?shared.lifeAxisYear:reduced?120:lifeYearAt(t),active=Math.min(4,Math.floor((year+.001)/30)),p=lifePoint(year);
 document.querySelectorAll('.life-axis-panel').forEach(panel=>{if(!reduced&&Number(panel.dataset.year)>=119&&year<1){const axis=panel.querySelector('.life-axis');axis.getAnimations().forEach(a=>a.cancel());axis.animate([{opacity:.35},{opacity:1}],{duration:900,easing:'ease-out'});}});
 document.querySelectorAll('.life-axis-panel').forEach(panel=>{panel.dataset.year=year.toFixed(2);panel.querySelector('[data-life-number]').textContent=Math.floor(year);panel.querySelector('.life-event-name').textContent=LIFE_EVENTS[active];panel.querySelector('.life-trail').style.strokeDasharray=`${year} 120`;panel.querySelector('.life-cursor').setAttribute('transform',`translate(${p.x} ${p.y})`);panel.querySelectorAll('.life-node').forEach(n=>{n.classList.toggle('passed',+n.dataset.year<=year);n.classList.toggle('current',+n.dataset.year===active*30);});panel.querySelectorAll('[data-life-icon]').forEach(n=>n.classList.toggle('active',+n.dataset.lifeIcon===active));panel.querySelectorAll('[data-life-stop]').forEach(n=>n.classList.toggle('active',+n.dataset.lifeStop<=active));});}
const originalLifeAxisMarkup=lifeAxis;
// Precision material treatment: scoped to 01A; never drives the exhibition clock.
const lifeMaterialStyle=document.createElement('style');
lifeMaterialStyle.textContent=`
.life-axis-panel .rail-top{fill:#101b25;opacity:.96;stroke:#d6a34e;stroke-width:1.6}
.life-axis-panel .rail-depth{fill:#070d14;stroke:#65502f;stroke-width:1.8}
.life-axis-panel .rail-tick{stroke:#c69951;opacity:.32;stroke-width:1.5}
.life-axis-panel .life-trail{stroke:#ffbd4d;stroke-width:7;filter:drop-shadow(0 0 4px #ffa61a90)}
.life-axis-panel .axis-core{fill:none;stroke:#fff1c7;stroke-width:2;pointer-events:none}
.life-axis-panel .axis-signal{fill:none;stroke:#fff9df;stroke-width:4;stroke-linecap:round;pointer-events:none}
.life-axis-panel .node-base{fill:#0a111b;stroke:#856735;stroke-width:2}
.life-axis-panel .node-light{fill:#15212a;stroke:#866c45;stroke-width:2;filter:none}
.life-axis-panel .life-node.passed .node-light{fill:#3a2c18;stroke:#ffc966}
.life-axis-panel .life-node.current .node-light{fill:#67421b;stroke:#fff1bc;stroke-width:3;filter:drop-shadow(0 0 5px #ffb54770)}
.life-axis-panel .node-inner{fill:none;stroke:#ddb66b;stroke-width:1;opacity:.22}
.life-axis-panel .life-node.passed .node-inner{opacity:.7}
.life-axis-panel .node-arrival{fill:none;stroke:#fff2c3;stroke-width:3;opacity:0}
.life-axis-panel .life-cursor ellipse{stroke:#ffeac0;stroke-width:2.5}
.life-axis-panel .life-cursor .cursor-scan{stroke:#fff8db;stroke-width:5;fill:none}
.life-axis-panel .life-cursor>path{stroke:#d4a552;stroke-width:2}
.life-axis-panel .life-node.current text{fill:#fff1cf}
`;
document.head.appendChild(lifeMaterialStyle);
// Replace only the animation viewport. All original panel typography and content stay owned by the original renderer.
const lifeThreeStyle=document.createElement('style');
lifeThreeStyle.textContent='.life-axis.life-three-mounted>svg{visibility:hidden}.life-axis .life-three-view{position:absolute;inset:0;width:100%;height:100%;border:0;background:transparent}';
document.head.append(lifeThreeStyle);
lifeAxis=function(){
 let html=originalLifeAxisMarkup();
 html=html.replace(/<path class="rail-depth"[^>]*\/><path class="rail-top"[^>]*\/>/,lifeRail());
 let tick=0;
 html=html.replace(/<path class="rail-tick"[^>]*\/>/g,()=>{const p=lifePoint(tick++*5),w=p.r+12;return `<path class="rail-tick" d="M${p.x-w} ${p.y}H${p.x+w}"/>`;});
 html=html.replace('<path class="life-trail"', '<path class="axis-core"/><path class="axis-signal"/><path class="life-trail"');
 // Put fine core and moving signal above the main rail, below the discs.
 html=html.replace('<path class="axis-core"/><path class="axis-signal"/>','').replace(/(<path class="life-trail"[^>]*\/>)/,'$1<path class="axis-core"/><path class="axis-signal"/>');
 html=html.replace(/(<ellipse class="node-light"[^>]*\/>)/g,(s)=>{
  const rx=Number(s.match(/rx="([^"]+)/)[1]),ry=Number(s.match(/ry="([^"]+)/)[1]);
  return s+`<ellipse class="node-inner" rx="${rx*.68}" ry="${ry*.68}"/><ellipse class="node-arrival" rx="${rx+5}" ry="${ry+2.25}" pathLength="100"/>`;
 });
 html=html.replace('<g class="life-cursor">','<g class="life-cursor"><ellipse class="cursor-scan" pathLength="100" stroke-dasharray="15 85"/>');
 return html;
};
// Update geometry after the existing clock update, without a second clock or RAF.
const updateLifeAxisClock=updateLifeAxis;
updateLifeAxis=function(now){
 updateLifeAxisClock(now);
 document.querySelectorAll('.life-axis-panel').forEach(panel=>{
  const year=Number(panel.dataset.year);if(!Number.isFinite(year))return;
  const axis=panel.querySelector('.life-axis');
  if(!axis.querySelector('.life-three-view')){
   const frame=document.createElement('iframe');frame.className='life-three-view';frame.title='120 年 Three.js 時間軸動畫';frame.src=root+'life-three-review.html?embedded=1';
   frame.onload=()=>axis.classList.add('life-three-mounted');axis.append(frame);
  }
  const g=lifeTrailGeometry(year),trail=panel.querySelector('.life-trail'),cursor=panel.querySelector('.life-cursor');
  trail.setAttribute('d',g.d);trail.style.strokeDasharray='none';trail.style.strokeLinecap='butt';trail.style.opacity=g.visible?'1':'0';
  cursor.setAttribute('transform',`translate(${g.p.x} ${g.p.y})`);
  cursor.querySelectorAll('ellipse').forEach(e=>{e.setAttribute('rx',g.rx);e.setAttribute('ry',g.ry);});
  panel.querySelectorAll('.node-light').forEach(n=>{n.style.transform='none';});
  const shared=globalThis.showcaseState,reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const time=shared?(shared.chapterElapsed??shared.segment*12+shared.elapsed)+(shared.playing?(now-shared.received)/1000:0):0;
  const core=panel.querySelector('.axis-core'),signal=panel.querySelector('.axis-signal');
  if(core){core.setAttribute('d',g.d);core.style.opacity=g.visible?'1':'0';}
  if(signal){
   signal.setAttribute('d',g.d);
   const length=signal.getTotalLength(),run=(time%5)/5,head=run*length;
   signal.style.strokeDasharray=`${Math.min(24,length)} ${length+30}`;
   signal.style.strokeDashoffset=String(-head);
   signal.style.opacity=g.visible&&!reduced&&shared?.playing?String(Math.min(1,run*8,(1-run)*8)*.85):'0';
  }
  const scan=cursor.querySelector('.cursor-scan');
  if(scan){scan.style.strokeDashoffset=String(-((time*9)%100));scan.style.opacity=reduced?'0':'.9';}
  panel.querySelectorAll('.node-arrival').forEach((ring,i)=>{
   const arrival=[5.18,8.825,12.47,16.115,19.76][i],p=Math.max(0,Math.min(1,(time-arrival)/.75));
   ring.style.strokeDasharray=`${p*100} 100`;ring.style.opacity=year>=i*30&&!reduced?String(Math.max(0,1-(time-arrival-.75)/1.1)): '0';
  });
 });
};
requestAnimationFrame(updateLifeAxis);
const brandPreviousPanel=revisionPanel;
// Authored exhibition fixture, not manufacturer data or live telemetry.
function detailedEquipment(segment){return typeof deviceDetails==='function'?deviceDetails(segment):'<div class="equipment-detail"><h2>P-01</h2><p>DEMO-L06-P01 · 給水設備</p><p>維養工作與文件索引</p></div>';}
revisionPanel=function(id){const m=state.mode,s=state.segment;
 if(id==='main')return `<article class="panel clean-main full-main" data-id="main"><div class="image-only" data-key="main-image"><img src="${root}assets/architecture-1600.png" alt="既有 UE 建築影像"></div><div class="main-info" data-key="main-overlay"><div class="main-copy"><span>0${MODES.findIndex(x=>x.id===m)} · ${{idle:'序章',life:'建築生命履歷',bim:'數位孿生定位',data:'建築 BOS'}[m]} <i>${s+1}/${CHAPTERS[m].segmentCount}</i></span><strong>${MAIN_COPY[m][s]}</strong></div><img data-key="main-logo" class="corner-logo" src="${root}assets/logo.png" alt="ANLB INSIDE"></div></article>`;
 if(m==='idle'){
  if(id==='s6')return nativeFrame(id,'住得安心<br>更有依據','',`<div class="vertical-nav benefits-nav">${['高標準耐震設計','第三方品質把關','全生命週期維養'].map((t,i)=>`<section class="${i===s?'current':''}">${icon(['shield','check','tools'][i])}<span>0${i+1}</span><strong>${t}</strong></section>`).join('')}</div>`,'nav-panel');
  if(id==='s1')return nativeFrame(id,'結構與管線分離',['完整空間，獨立服務層','明管配置，結構分離','維養更新，保留結構'][s],volume('idle-s1',edgeLabel(85,['空間剖面','獨立管線','服務層展開'][s],['結構與服務層','明管設計','結構保持完整'][s])),'has-volume','寶舖工法概念 · 非指定建案施工詳圖');
  if(id==='c')return nativeFrame(id,'高標準，落實在每個環節','',artSVG('耐震設計、第三方品質把關、全生命週期維養',[['shield','耐震設計'],['check','第三方品質把關'],['tools','全生命週期維養']].map(([ic,t],i)=>`<g class="promise ${s===i?'current':''}">${pic(ic,140+i*580,50,280)}${tx(280+i*580,455,t,'','middle')}<path class="promise-line" d="M${110+i*580} 530h340"/></g>`).join('')));
  if(id==='s2')return nativeFrame(id,'第三方品質把關','SGS 全品項驗證',oneDocument(s));
  if(id==='s3')return nativeFrame(id,'BIM 全生命週期','從建造到維養的全資訊建構',infoLinks(s));
  if(id==='s4')return nativeFrame(id,'建築紀錄看得到','全透明原生健康建築',recordCutaway(s));
 }
 if(m==='life'){
  if(id==='a')return nativeFrame(id,'邁向 120 年的建築生命週期','',lifeAxis().replace('>建物生產履歷<','>'+LIFE_EVENTS[0]+'<').replace('class="life-axis"','data-live-clock="axis" class="life-axis"').replace('class="life-event"','data-live-clock="event" class="life-event"'),'life-axis-panel','120 年為品牌維養目標 · 年份為敘事節點，非保固或設備更換週期');
  if(id==='s1')return nativeFrame(id,'為持續更新而設計',['獨立接口，預留維養空間','設備更新，建築持續服務','更新履歷，完整留存'][s],volume('life-s1',`<div class="renewal-summary">${icon(['pipe','tools','record'][s])}<strong>${['設備與接口','設備世代更新','建物履歷'][s]}</strong><span>${['獨立服務模組','抽換與接續','設備更新紀錄'][s]}</span>${s===2?'<p>P-01<br>設備版本更新<br>履歷索引已關聯</p>':''}</div>`),'has-volume','維養更新概念 · 非 FBX 實際設備或已完成維修');
  if(id==='b')return revFrame(id,'chapter-definition',`<div class="chapter-number">01</div><h1>建築生命履歷</h1><p>從建造到維養，完整建構建築資訊</p>`,'品牌與章節主張 · 適用範圍依個案文件');
 }
 if(m==='bim'&&id==='b')return brandPreviousPanel(id).replace('找到位置，也找到紀錄','空間、設備、文件，一次定位');
 if(m==='bim'&&id==='d')return nativeFrame(id,'BIM設備資訊','空間、系統、維養檔案，一站整合',volume('bim-d',detailedEquipment(s)),'has-volume equipment-panel equipment-rich','非即時資料 · 設備參數為展演設定');
 if(m==='bim'&&id==='s4')return nativeFrame(id,'管線透視',['隱蔽管線，集中整合','八條管線，清晰分列','沿著給水路徑，定位 P-01'][s],volume('bim-s4',edgeLabel(65,s===0?'管線服務層':s===1?'八路管線':'給水管線 04',s===2?'→ P-01':'獨立查閱')),'has-volume','管線概念 · 非實際 BIM 座標');
 if(m==='data'&&id==='s3'){const snap=BOS.snapshot(s,revisionElapsed(),state.scenarioSeed);return nativeFrame(id,`全棟戶別｜${['溫度','濕度','CO₂ 通風','相對用電'][s]}評分`,'',householdMatrix(snap).replace(/<div class="matrix-key">[\s\S]*?<\/div>$/,''),'household-panel matrix-airy');}
 return brandPreviousPanel(id);
};
