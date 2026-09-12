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
function lifePoint(year){const z=year/120,k=z/(1+.72*z);return {x:150+1340*k,y:610-770*k,r:52-37*k};}
function lifeAxis(){return `<div class="life-axis" data-key="life-axis"><svg viewBox="0 0 1200 710" role="img" aria-label="0 至 120 年立體建築生命軸"><defs><linearGradient id="rail-metal" x2="1" y2="0"><stop stop-color="#80501e"/><stop offset=".45" stop-color="#ffd897"/><stop offset="1" stop-color="#533c24"/></linearGradient></defs><path class="rail-depth" d="M68 650L1110 8 1143 8 220 650V682H68Z"/><path class="rail-top" d="M68 650L1110 8 1143 8 220 650Z"/>${Array.from({length:25},(_,i)=>{const p=lifePoint(i*5);return `<path class="rail-tick" d="M${p.x-34} ${p.y+12}l${68-i*1.5} -9"/>`;}).join('')}<path class="life-trail" d="M150 610L929 162" pathLength="120"/>${LIFE_EVENTS.map((t,i)=>{const p=lifePoint(i*30);return `<g class="life-node" data-year="${i*30}" transform="translate(${p.x} ${p.y})"><ellipse class="node-base" cy="12" rx="${p.r}" ry="${p.r*.45}"/><ellipse class="node-light" rx="${p.r}" ry="${p.r*.45}"/><text x="${-p.r-24}" y="-12" text-anchor="end">${i*30}</text></g>`;}).join('')}<g class="life-cursor"><ellipse rx="65" ry="28"/><path d="M0 -55V0"/></g></svg></div><aside class="life-event"><div class="life-year"><strong data-life-number>0</strong><span>年 / 120</span></div><div class="life-current-icon">${LIFE_ICONS.map((ic,i)=>`<div data-life-icon="${i}">${icon(ic)}</div>`).join('')}</div><strong class="life-event-name">建物生產履歷</strong><div class="life-event-index">${LIFE_EVENTS.map((_,i)=>`<i data-life-stop="${i}"></i>`).join('')}</div><p>全生命週期維養目標</p></aside>`;}
function updateLifeAxis(now){requestAnimationFrame(updateLifeAxis);const shared=globalThis.showcaseState;if(!shared||shared.mode!=='life')return;const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches,t=shared.segment*12+Math.min(12,shared.elapsed+(shared.playing?(now-shared.received)/1000:0)),year=reduced?120:lifeYearAt(t),active=Math.min(4,Math.floor((year+.001)/30)),p=lifePoint(year);
 document.querySelectorAll('.life-axis-panel').forEach(panel=>{if(!reduced&&Number(panel.dataset.year)>=119&&year<1){const axis=panel.querySelector('.life-axis');axis.getAnimations().forEach(a=>a.cancel());axis.animate([{opacity:.35},{opacity:1}],{duration:900,easing:'ease-out'});}});
 document.querySelectorAll('.life-axis-panel').forEach(panel=>{panel.dataset.year=year.toFixed(2);panel.querySelector('[data-life-number]').textContent=Math.floor(year);panel.querySelector('.life-event-name').textContent=LIFE_EVENTS[active];panel.querySelector('.life-trail').style.strokeDasharray=`${year} 120`;panel.querySelector('.life-cursor').setAttribute('transform',`translate(${p.x} ${p.y})`);panel.querySelectorAll('.life-node').forEach(n=>{n.classList.toggle('passed',+n.dataset.year<=year);n.classList.toggle('current',+n.dataset.year===active*30);});panel.querySelectorAll('[data-life-icon]').forEach(n=>n.classList.toggle('active',+n.dataset.lifeIcon===active));panel.querySelectorAll('[data-life-stop]').forEach(n=>n.classList.toggle('active',+n.dataset.lifeStop<=active));});}
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
