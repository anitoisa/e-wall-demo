const view=document.body.dataset.view, single=document.body.dataset.screen;
const root=single?'../':'';
const query=new URLSearchParams(location.search);
const frozen=query.get('preview')==='1';
const initialMode=MODES.some(m=>m.id===query.get('mode'))?query.get('mode'):'idle';
let state={mode:initialMode,segment:Math.min(CHAPTERS[initialMode].segmentCount-1,Math.max(0,Number(query.get('segment'))||0)),playing:!frozen,elapsed:frozen?14:0,revision:0,scenarioSeed:Number(query.get('seed'))||20260906,...CHAPTERS[initialMode]};
let lastKey='',online=false,detailId=null,busy=false;
const current=()=>MODES.find(m=>m.id===state.mode);
const escapeHTML=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const lines=s=>escapeHTML(s).replace(/\n/g,'<br>');
const portrait=id=>['s5','s6'].includes(id);
function icon(type){const paths={
 temperature:'<path d="M48 73V24a12 12 0 0 1 24 0v49a25 25 0 1 1-24 0ZM60 40v48M85 27h17M85 47h12"/><circle class="pulse-dot" cx="60" cy="91" r="8"/>',
 tools:'<path d="M80 15a26 26 0 0 0-30 34L18 81a14 14 0 0 0 20 20l32-32a26 26 0 0 0 34-30L85 57 64 36Z"/><path class="draw" d="m20 30 70 70"/>',
 manager:'<circle cx="60" cy="30" r="19"/><path d="M22 110V85a38 38 0 0 1 76 0v25M43 64l17 20 17-20M60 84v26"/><path class="draw" d="M22 103h76"/>',
 clock:'<circle cx="60" cy="60" r="46"/><path class="draw" d="M60 28v34l24 15M60 8v9M60 103v9M8 60h9M103 60h9"/>',
 shield:'<path d="M60 12 99 29v31c0 24-22 39-39 48-17-9-39-24-39-48V29Z"/><path class="draw" d="m39 61 15 15 29-34"/>',
 check:'<rect x="22" y="17" width="76" height="90" rx="8"/><path d="M43 15h34v17H43zM39 91h43"/><path class="draw" d="m37 59 15 15 31-29"/>',
 record:'<path d="M29 13h48l19 19v75H29zM77 13v22h19M43 49h37M43 65h37M43 81h24"/><circle class="pulse-dot" cx="88" cy="91" r="15"/><path d="m81 91 5 5 9-11"/>',
 pipe:'<path d="M18 24h45v38h37M18 97h45V62M100 19v78"/><circle cx="63" cy="62" r="12"/><path class="flow-path" d="M18 24h45v38h37"/>',
 layers:'<path d="m13 39 47-25 47 25-47 25ZM13 62l47 25 47-25M13 85l47 25 47-25"/>',
 target:'<circle cx="60" cy="60" r="33"/><circle class="pulse-dot" cx="60" cy="60" r="13"/><path d="M60 6v30M60 84v30M6 60h30M84 60h30"/>',
 pulse:'<path d="M10 64h24l13-34 22 64 14-30h27"/><circle cx="60" cy="60" r="51"/>',
 handover:'<path d="M20 39h78L83 24M100 81H22l15 15M22 17v86M98 17v86"/><path class="draw" d="m42 59 12 12 25-25"/>',
 structure:'<path d="M22 108V13h76v95M22 42h76M22 75h76M22 13l76 62M98 13 22 75M22 42l76 66M98 42l-76 66"/>',
 air:'<path class="draw" d="M13 39h63c29 0 29-31 9-31M13 60h78c31 0 31 39 4 39M13 81h41c24 0 24 31 6 31"/>',
 water:'<path d="M60 9C43 34 22 53 22 75a38 38 0 0 0 76 0C98 53 77 34 60 9Z"/><path class="draw" d="M36 75a24 24 0 0 0 24 24"/>',
 power:'<path class="draw" d="m69 8-43 59h30l-5 45 43-61H65Z"/>'};
 return `<svg class="icon" viewBox="0 0 120 120" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">${paths[type]||paths.record}</svg>`;
}
function diagram(kind){
 if(kind==='structure')return `<svg class="diagram structural" viewBox="0 0 900 510" role="img" aria-label="結構受力概念圖，非工程計算"><g class="grid-lines">${[130,220,310,400].map(y=>`<path d="M80 ${y}H820"/>`).join('')}</g><g class="building-frame">${[230,450,670].map(x=>`<path d="M${x} 45V450"/>`).join('')}${[45,145,245,345,450].map(y=>`<path d="M230 ${y}H670"/>`).join('')}<path class="braces" d="M230 45 450 145 230 245 450 345 230 450M670 45 450 145 670 245 450 345 670 450"/></g><path class="ground" d="M100 460H800"/><path class="flow-path" d="m80 265 70-35-70-35m670 70 70-35-70-35"/><circle class="pulse-dot" cx="450" cy="145" r="14"/></svg>`;
 if(kind==='bim')return `<svg class="diagram bim-diagram step-${state.segment}" viewBox="0 0 900 550" role="img" aria-label="樓層、管線及設備定位概念示意"><g class="building-wire">${[0,1,2,3,4].map(i=>`<path d="m190 ${160+i*64} 290-120 230 120-290 125Z"/>`).join('')}<path d="M190 160v256M480 40v256M710 160v256M420 285v256"/></g><g class="selected-floor"><path d="m190 288 290-120 230 120-290 125Z"/></g><g class="route-layer"><path class="pipe-line" d="m252 285 226-90 140 72-134 56v139"/><path class="flow-path" d="m252 285 226-90 140 72-134 56v139"/></g><g class="target-layer"><circle class="target-ring" cx="484" cy="323" r="39"/><circle class="pulse-dot" cx="484" cy="323" r="12"/><path d="M528 321h208v-70" stroke="currentColor" fill="none" stroke-width="3"/><text x="646" y="226">設備定位</text></g></svg>`;
 if(kind==='archive')return `<svg class="diagram archive-diagram" viewBox="0 0 900 510" role="img" aria-label="檢驗、履歷、交接流程圖">${[0,1,2].map((n)=>`<g class="archive-page" style="--order:${n}"><rect x="${75+n*268}" y="70" width="215" height="300" rx="12"/><path d="M${110+n*268} 128h140M${110+n*268} 160h140M${110+n*268} 192h96"/><circle cx="${182+n*268}" cy="278" r="43"/><path class="draw" d="m${159+n*268} 278 17 17 34-39"/><text x="${182+n*268}" y="450" text-anchor="middle">${['檢驗','留存','交接'][n]}</text></g>`).join('')}<path class="flow-path" d="M290 240h50m218 0h50"/></svg>`;
 if(kind==='network')return `<svg class="diagram network" viewBox="0 0 900 510" role="img" aria-label="環境、設備與能源訊號匯流至 BOS"><g class="network-links"><path d="M135 110 450 255 765 110M135 400 450 255 765 400"/></g><path class="flow-path" d="M135 110 450 255 765 400M765 110 450 255 135 400"/><circle class="core-ring" cx="450" cy="255" r="112"/><circle cx="450" cy="255" r="95"/><text x="450" y="279" text-anchor="middle" class="bos-text">BOS</text>${[[135,110,'空氣'],[765,110,'設備'],[135,400,'能源'],[765,400,'履歷']].map(([x,y,t])=>`<circle cx="${x}" cy="${y}" r="62"/><text x="${x}" y="${y+15}" text-anchor="middle">${t}</text>`).join('')}</svg>`;
 return diagram('network');
}
function flow(labels){return `<div class="big-flow">${labels.map((label,i)=>`<div class="flow-node ${i===state.segment?'active':''}"><span>0${i+1}</span>${icon(['pulse','target','record'][i])}<strong>${label}</strong></div>${i<2?'<b class="flow-arrow">→</b>':''}`).join('')}</div>`;}
function panelHeader(id){return `<header class="panel-header"><span>${id.toUpperCase()} / ${current().en}</span><img class="corner-logo" src="${root}assets/logo.png" alt="ANLB INSIDE"></header>`;}
function foot(text='概念圖解 · 非即時建物資料'){return `<footer class="panel-footer"><span>寶舖建設 · ANLB INSIDE</span><span>${text}</span></footer>`;}
function stages(labels,active=state.segment){return `<div class="story-stages">${labels.map((t,i)=>`<div data-key="stage-${i}" class="stage ${i<=active?'revealed':''} ${i===active?'selected':''}"><span>0${i+1}</span>${icon(['layers','target','record'][i])}<strong>${escapeHTML(t)}</strong></div>`).join('')}</div>`;}
function locatorGraph(segment){return `<svg class="locator-graph phase-${segment}" viewBox="0 0 1000 500" role="img" aria-label="L06 東側給水設備 P-01 定位概念示意"><g class="level-stack">${[0,1,2,3,4,5].map((n)=>`<rect x="35" y="${35+n*70}" width="205" height="52" rx="8" class="${n===2?'chosen':''}"/><text x="60" y="${71+n*70}">L${String(8-n).padStart(2,'0')}</text>`).join('')}</g><path class="loc-wire" d="M245 200H345V100H700V320H860"/><path class="loc-route" d="M245 200H345V100H700V320H860"/><g class="room-block"><rect x="320" y="60" width="420" height="330" rx="20"/><text x="365" y="365">東側設備區</text></g><circle class="loc-target" cx="860" cy="320" r="45"/><text x="795" y="410">P-01</text><g class="loc-record"><path d="M860 268V115H940"/><rect x="775" y="20" width="200" height="90" rx="12"/><text x="795" y="76">維養履歷</text></g></svg>`;}
function dataVisual(config,n){const seg=state.segment,kind=config.kind;
 if(kind==='air'||kind==='energy'){
  const vals=kind==='air'?[620,650,710,820,730,680]:[12,16,22,28,26,22],max=kind==='air'?1000:32,unit=kind==='air'?'ppm':'kWh';
  return `<svg class="detail-chart ${kind}" viewBox="0 0 1500 420" role="img" aria-label="${kind==='air'?'二氧化碳':'時段用電'}展示情境圖表"><g class="chart-grid">${[70,150,230,310].map(y=>`<path d="M100 ${y}H1420"/>`).join('')}</g>${seg>0?'<rect class="chart-highlight" x="790" y="35" width="150" height="295"/>':''}${kind==='air'?`<path class="trend-line" d="${vals.map((v,i)=>`${i?'L':'M'}${145+i*240} ${325-v/max*300}`).join(' ')}"/>`:''}${vals.map((v,i)=>{const x=145+i*240,y=325-v/max*300;return `<g data-key="value-${i}">${kind==='energy'?`<rect class="energy-bar" x="${x-42}" y="${y}" width="84" height="${325-y}" rx="8"/>`:`<circle class="trend-point" cx="${x}" cy="${y}" r="9"/>`}<text x="${x}" y="${y-22}" text-anchor="middle">${v}</text><text class="axis-label" x="${x}" y="385" text-anchor="middle">${8+i*2}:00</text></g>`;}).join('')}<text x="100" y="28">${unit}</text></svg>`;
 }
 if(kind==='devices')return `<div class="device-matrix">${Array.from({length:10},(_,i)=>{const pending=i===0&&seg<2,offline=i===9;return `<div class="device-cell ${pending?'pending':offline?'disconnected':'healthy'}" data-key="device-${i}">${icon(i<5?'water':'pulse')}<strong>${i===0?'P-01':`P-${String(i+1).padStart(2,'0')}`}</strong><span>${offline?'離線':pending?'待確認':'正常'}</span></div>`;}).join('')}</div>`;
 if(kind==='locate'||kind==='route')return locatorGraph(seg);
 if(kind==='timeline'){
  const labels=state.mode==='data'?['訊號待確認','檢查與處理','紀錄已留存']:state.mode==='bim'?['設備索引','檢查紀錄','維修履歷']:n===1?['施工查驗','紀錄留存','履歷回查']:['文件分類','管理交接','保養排程'];return stages(labels,seg);
 }
 const rows=config.pages[seg];return `<div class="record-cards">${[rows[0],rows[1],rows[2]].map((t,i)=>`<div class="record-card ${i===seg?'selected':''}" data-key="record-${i}">${icon(['record','check','handover'][i])}<span>0${i+1}</span><strong>${escapeHTML(t)}</strong></div>`).join('')}</div>`;
}
function integratedPanel(id){const m=current(),seg=state.segment,s=STORY[m.id][seg];let cl='',body='',note='概念圖解 · 非即時建物資料';
 if(id==='a'){
  cl='anchor-panel';
  const title={idle:'核電廠同級耐震力',life:'全品項驗證',bim:'BIM 全資產\n生命週期',data:'WELL FM\n設備狀態總覽'}[m.id];
  body=m.id==='idle'?`<div class="anchor-metric">0.41<span>G</span></div>`:m.id==='life'?'<div class="anchor-kicker">SGS</div><div class="anchor-metric">100<span>%</span></div>':'';
  body+=`<h1 data-key="anchor-title">${lines(title)}</h1><div class="anchor-art" data-key="anchor-art">${m.id==='idle'?diagram('structure'):m.id==='life'?diagram('archive'):m.id==='bim'?stages(['建造','交付','維養']):`<div class="anchor-status">${[['正常',seg===2?9:8],['待確認',seg===2?0:1],['離線',1]].map(([label,count])=>`<div><b>${count}</b><span>${label}</span></div>`).join('')}</div>`}</div><div class="anchor-caption" data-key="anchor-caption">${escapeHTML(s.steps[seg])}<span>0${seg+1} / 03</span></div>`;
  note=m.id==='idle'?'寶舖品牌主張 · 依個案結構設計文件':m.id==='life'?'SGS 品牌用語 · 驗證範圍依個案文件':m.id==='data'?'WELL FM · 展示情境資料 · 10 台設備示例':'BIM 全資產生命週期 · 概念圖解';
 }else if(id==='main'){
  cl='main-panel narrative-main';body=`<img data-key="main-photo" class="scene-photo" src="${root}assets/${{idle:'tower',life:'orbit',bim:'aerial',data:'tower'}[m.id]}.png" alt="既有 UE 模型參考影像"><div class="photo-shade"></div><div class="main-title"><div class="eyebrow">0${MODES.indexOf(m)} / ${m.en} · 0${seg+1}</div><h1>${lines(s.title)}</h1><p>${escapeHTML(s.sub)}</p></div><div class="main-beats">${STORY[m.id].map((b,i)=>`<span class="${i===seg?'active':''}">${String(i+1).padStart(2,'0')} ${escapeHTML(b.title.replace(/\n/g,'，'))}</span>`).join('')}</div>`;note='65″ 獨立示意 · 既有 UE 影像 · 未連接即時系統';
 }else if(id==='c'){
  cl='story-panel';body=`<h1>${lines({idle:['規格說清楚','品質看得見','維養有依據'],life:['品質從材料開始','資料，跟著房子走','紀錄，接著累積'],bim:['先縮小範圍','再看清路徑','最後讀懂履歷'],data:['建築訊號匯流','從訊號找到位置','從處理回到履歷']}[m.id][seg])}</h1><div class="story-art">${m.id==='bim'?locatorGraph(seg):m.id==='idle'&&seg===0?diagram('structure'):stages(s.steps)}</div><p class="story-caption">${escapeHTML(s.sub)}</p>`;
 }else if(id==='d'){
  if(m.id==='data'){
   cl='bos-model-panel';body=`<h1 data-key="model-heading">WELL FM<span>全棟維養</span></h1><div class="model-stage" data-key="model-stage"><img class="model-placeholder" src="${root}assets/tower.png" alt="既有 UE 參考影像；模型載入前展示"><iframe data-key="bos-model" class="model-view" title="BOS 全棟九戶模型與輔助平面圖" src="${root}model.html?mode=data&units=1&hero=1" loading="eager"></iframe></div><div class="model-beat" data-key="model-beat"><b>0${seg+1}</b><span>${escapeHTML(s.d)}</span></div>`;note='展示情境資料 · 設備位置示意 · 戶別色不代表設備狀態';
  }else if(m.id==='idle'){
   cl='photo-panel narrative-photo';body=`<img data-key="d-photo" class="scene-photo" src="${root}assets/tower.png" alt="既有 UE 模型影像，非實拍"><div class="photo-shade"></div><div class="photo-markers">${s.detail.map((t,i)=>`<div data-key="marker-${i}">${icon(['structure','check','record'][i])}<span>${escapeHTML(t)}</span></div>`).join('')}</div><div class="photo-copy"><h1>${escapeHTML(s.d)}</h1><p class="benefit">${escapeHTML(s.sub)}</p></div>`;note='既有 UE 模型參考影像 · 非建物實拍';
  }else{
   cl='story-panel d-story';body=`<h1>${escapeHTML(s.d)}</h1><div class="story-art">${m.id==='bim'?locatorGraph(seg):stages(['建造','交付','維養'])}</div><div class="detail-chips">${s.detail.map((t,i)=>`<span data-key="chip-${i}">${escapeHTML(t)}</span>`).join('')}</div>`;note=m.id==='bim'?'定位概念示意 · P-01 為展示設備，非現場資料':'履歷流程示意 · 非建物即時紀錄';
  }
 }else{
  const n=Number(id[1])-1;
  if(m.id==='idle'){
   const [ic,title,label,benefit]=CARDS.idle[n];cl='satellite intro-card';body=`<div class="eyebrow">0${n+1} / BRAND PROMISE</div><div class="sat-art ${seg===Math.min(n,2)?'emphasized':''}">${icon(ic)}</div><h1>${title}</h1><p class="sat-label">${label}</p><p class="benefit">${benefit}</p><div class="intro-state">${['規格有依據','驗證有紀錄','維養接得上'][seg]}</div>`;note='品牌主張 · 適用範圍依個案文件';
  }else{
   const config=LOWER[m.id][n],p=config.pages[seg];cl='detail-panel';body=`<div class="eyebrow" data-key="lower-brand">${n>=2?'WELL FM':'BUILDING RECORD'} <span>0${n+1} / ${m.en}</span></div><h1 data-key="lower-title">${config.title}</h1><p class="detail-benefit" data-key="lower-benefit">${config.benefit}</p><div class="data-art" data-key="data-art">${dataVisual(config,n)}</div><div class="detail-summary" data-key="summary"><strong>${escapeHTML(p[0])}</strong><span>${escapeHTML(p[1])}</span></div>`;note=`${n>=2?'WELL FM · ':''}${m.id==='data'&&n===2?'能源管理為定制功能 · ':''}展示情境資料 · ${p[2]}`;
  }
 }
 return `<article class="panel ${cl}" data-id="${id}" data-mode="${m.id}" data-segment="${seg}"><div class="kv-background" aria-hidden="true"><i></i><i></i><i></i></div>${panelHeader(id)}<div class="panel-body">${body}</div>${foot(note)}</article>`;
}
function panel(id){if(state.standby&&!frozen)return `<article class="panel standby-panel ${portrait(id)?'portrait':''}" data-id="${id}"><img src="${root}assets/logo.png" alt="ANLB INSIDE"><strong>第五代住宅宣言</strong><span>AI NATIVE LIVING BUILDING</span></article>`;const m=current(),seg=state.segment;let body='',cl='',note='概念圖解 · 非即時建物資料';
 const revised=revisionPanel(id);if(revised!==null)return revised;
 if(['a','main','c','d','s1','s2','s3','s4'].includes(id))return integratedPanel(id);
 if(id==='b'){cl='manifesto';body=`<div class="eyebrow">寶舖建設 · 第五代住宅宣言</div><h1>第五代<br>住宅宣言</h1><p class="manifesto-line">AI 原生建築生命體</p><div class="manifesto-bottom">全透明原生健康建築<span>AI NATIVE LIVING BUILDING</span></div>`;note='品牌宣言';}
 else if(id==='s5'){
  const titles={idle:'建築的\n三個承諾',life:'從建造\n到維養',bim:'由外到內\n逐層看清',data:'建築訊號\n匯流在一起'};
  const rows={idle:[['0.41G','耐震規格'],['SGS','全品項驗證'],['BIM','全生命週期']],life:[['規劃・設計','建築資訊起點'],['施工・竣工','檢驗紀錄留存'],['維養','管理持續接力']],bim:[['樓層','縮小問題範圍'],['管線','看見牆內路徑'],['設備','連到維養履歷']],data:[['環境','空氣與用水'],['設備','運轉與異常'],['履歷','檢查與維養']]};
  body=`<h1>${lines(titles[m.id])}</h1><div class="portrait-stack">${rows[m.id].map(([title,sub],i)=>`<div class="portrait-item ${i===seg?'active':''}"><span>0${i+1}</span><h2>${title}</h2><p>${sub}</p></div>`).join('')}</div>`;
 }
 else if(id==='s6'){
  const titles={idle:'住得安心\n更有依據',life:'換人管理\n紀錄不斷',bim:'找到位置\n讀懂履歷',data:'哪裡該修\n一看就懂'};
  const lists={idle:['規格說清楚','品質看得見','維養有紀錄'],life:['哪裡修過','何時修過','下次何時保養'],bim:['在哪一層','是哪個設備','過去如何維修'],data:['待處理設備','定位相關空間','處理後存檔']};
  body=`<h1>${lines(titles[m.id])}</h1><div class="portrait-art">${icon(m.id==='idle'?'shield':m.id==='bim'?'target':'record')}</div><div class="portrait-list">${lists[m.id].map((s,i)=>`<p class="${seg===i?'active':''}"><span>0${i+1}</span>${s}</p>`).join('')}</div>`;if(m.id==='data')note='展示情境資料 · 維養功能示意';
 }
 return `<article class="panel ${cl} ${portrait(id)?'portrait':''}" data-id="${id}" aria-label="${id.toUpperCase()} ${m.name}"><div class="kv-background" aria-hidden="true"><i></i><i></i><i></i></div>${panelHeader(id)}<div class="panel-body">${body}</div>${foot(note)}</article>`;
}
function resize(){
 const dock=document.getElementById('ipad-dock');if(dock)dock.querySelector('iframe').style.transform=`scale(${dock.clientWidth/1300})`;
 document.querySelectorAll('.slot').forEach(slot=>{const p=slot.querySelector('.panel');p.style.transform=`scale(${slot.clientWidth/(portrait(slot.dataset.id)?1080:1920)})`;});
 if(single){const w=portrait(single)?1080:1920,h=portrait(single)?1920:1080;document.querySelector('.panel').style.transform=`translate(-50%,-50%) scale(${Math.min(innerWidth/w,innerHeight/h)})`;}
 if(detailId){const w=portrait(detailId)?1080:1920,h=portrait(detailId)?1920:1080,s=Math.min(innerWidth*.92/w,innerHeight*.86/h);const d=document.getElementById('detail');d.style.width=w*s+'px';d.style.height=h*s+'px';d.firstElementChild.style.transform=`scale(${s})`;}
}
function soften(el){if(!el?.animate||matchMedia('(prefers-reduced-motion: reduce)').matches)return;if(el.closest('.ex-stage')){if(el instanceof SVGElement||el.matches('.volume-labels,.show-viewport'))return;el.animate([{opacity:.4},{opacity:1}],{duration:600,easing:'ease-out'});return;}el.getAnimations().filter(a=>a.effect?.getTiming().iterations!==Infinity).forEach(a=>a.cancel());const id=el.closest('.panel')?.dataset.id,delay=['s3','s4'].includes(id)?240:['s1','s2'].includes(id)?120:0;el.animate([{opacity:.4},{opacity:1}],{duration:700,delay,easing:'ease-out',fill:'backwards'});}
// Patch only changed nodes. Stable headers, labels, SVG geometry and the BOS iframe survive beats.
function morph(oldNode,newNode){
 if(oldNode.nodeType===1&&oldNode.hasAttribute('data-live-clock')&&newNode.nodeType===1&&newNode.getAttribute('data-live-clock')===oldNode.getAttribute('data-live-clock'))return;
 if(oldNode.nodeType!==newNode.nodeType||oldNode.nodeName!==newNode.nodeName){const fresh=newNode.cloneNode(true);oldNode.replaceWith(fresh);soften(fresh);return;}
 if(oldNode.nodeType===3){if(oldNode.nodeValue!==newNode.nodeValue){oldNode.nodeValue=newNode.nodeValue;soften(oldNode.parentElement);}return;}
 if(oldNode.nodeType!==1)return;
 const iframe=oldNode.tagName==='IFRAME';
 if(iframe&&oldNode.getAttribute('src')!==newNode.getAttribute('src')){oldNode.setAttribute('src',newNode.getAttribute('src'));oldNode.classList.remove('ready');}
 for(const attr of [...oldNode.attributes])if(!newNode.hasAttribute(attr.name)&&!['style','data-loaded'].includes(attr.name))oldNode.removeAttribute(attr.name);
 for(const attr of [...newNode.attributes]){if(iframe&&['src','class'].includes(attr.name))continue;if(oldNode.getAttribute(attr.name)!==attr.value)oldNode.setAttribute(attr.name,attr.value);}
 if(iframe)return;
 const wanted=[...newNode.childNodes];for(let i=0;i<wanted.length;i++){
  const next=wanted[i],key=next.nodeType===1?next.getAttribute('data-key'):null;
  if(key){const matched=[...oldNode.children].find(c=>c.getAttribute('data-key')===key);if(matched&&matched!==oldNode.childNodes[i])oldNode.insertBefore(matched,oldNode.childNodes[i]||null);}
  if(oldNode.childNodes[i])morph(oldNode.childNodes[i],next);else {const fresh=next.cloneNode(true);oldNode.appendChild(fresh);soften(fresh);}
 }
 while(oldNode.childNodes.length>wanted.length)oldNode.lastChild.remove();
}
function patchPanel(container,id){const template=document.createElement('template');template.innerHTML=panel(id);if(container.firstElementChild)morph(container.firstElementChild,template.content.firstElementChild);else container.appendChild(template.content.firstElementChild);}
function modelSync(){globalThis.showcaseState={...state,elapsed:revisionElapsed(),received:performance.now()};document.querySelectorAll('.model-view').forEach(frame=>frame.contentWindow?.postMessage({type:'anlb-scene',mode:state.mode,segment:state.segment,playing:state.playing,elapsed:revisionElapsed(frame.dataset.role)},location.origin));}
// One shared narrative clock also drives vector icons, including pause/reconnect.
let lastNativeTick=0;
function nativeMotion(now){requestAnimationFrame(nativeMotion);if(now-lastNativeTick<90||document.hidden||matchMedia('(prefers-reduced-motion: reduce)').matches)return;lastNativeTick=now;const shared=globalThis.showcaseState;if(!shared)return;const t=shared.elapsed+(shared.playing?(now-shared.received)/1000:0);for(const animation of document.getAnimations()){const el=animation.effect?.target;if(animation.effect?.getTiming().iterations===Infinity&&el?.closest?.('.ex-stage,.current-beat,.portrait-art')){animation.pause();animation.currentTime=(t+2)*1000;}}}
requestAnimationFrame(nativeMotion);
addEventListener('message',event=>{if(event.origin!==location.origin||!['anlb-model-ready','anlb-model-error'].includes(event.data?.type))return;document.querySelectorAll('.model-view').forEach(frame=>{if(frame.contentWindow===event.source){frame.classList.add('ready');if(event.data.type==='anlb-model-ready')modelSync();}});});
function render(){const m=current();
 if(view==='wall'){
  let beats=document.getElementById('demo-beats');if(!beats){beats=document.createElement('nav');beats.id='demo-beats';beats.className='demo-beats';beats.setAttribute('aria-label','段落直選');document.querySelector('.transport').before(beats);}
  const bk=state.mode+':'+state.segment;if(beats.dataset.key!==bk){beats.dataset.key=bk;beats.innerHTML=m.segments.map((title,i)=>`<button data-demo-segment="${i}" aria-current="${i===state.segment}" ${frozen?'disabled':''}><b>${String(i+1).padStart(2,'0')}</b>${escapeHTML(title)}</button>`).join('');}
 }
document.documentElement.dataset.mode=m.id;document.documentElement.dataset.standby=String(!!state.standby);document.documentElement.style.setProperty('--accent',state.standby?'#3FB4F0':m.color);document.body.classList.toggle('paused',!state.playing);document.documentElement.style.setProperty('--phase',`-${state.elapsed}s`);
 if(view==='wall'){const waiting=false;document.body.classList.toggle('is-standby',waiting);document.getElementById('wall-standby').hidden=!waiting;for(const el of document.querySelectorAll('#wall,#modes,.wall-heading,.transport'))el.inert=waiting;if(waiting&&document.getElementById('inspect').open)document.getElementById('inspect').close();}
 if(view==='ipad'){const waiting=!!state.standby&&!frozen;document.body.classList.toggle('is-standby',waiting);document.getElementById('console').inert=waiting;document.getElementById('standby-screen').hidden=!waiting;}
 const key=String(!!state.standby)+':'+m.id+state.segment+':'+state.scenarioSeed;if(key!==lastKey){
  if(single)patchPanel(document.getElementById('single'),single);
  if(view==='wall'){const wall=document.getElementById('wall');if(!wall.children.length)wall.innerHTML=LAYOUT.map(([id,x,y,w,h])=>`<button class="slot" data-id="${id}" aria-label="放大 ${id.toUpperCase()} 螢幕" style="left:${x/420*100}%;top:${y/208*100}%;width:${w/420*100}%;height:${h/208*100}%"></button>`).join('');wall.querySelectorAll('.slot').forEach(slot=>patchPanel(slot,slot.dataset.id));}
  if(view==='ipad'){const art=document.getElementById('console-art');const template=document.createElement('template');template.innerHTML=consoleArtwork();if(art.firstElementChild)morph(art.firstElementChild,template.content.firstElementChild);else art.appendChild(template.content.firstElementChild);}
  if(detailId)patchPanel(document.getElementById('detail'),detailId);
  lastKey=key;
 }
 if(!single){document.getElementById('chapter-label').textContent=`0${MODES.indexOf(m)} / ${m.name}`;document.getElementById('chapter-claim').innerHTML=lines(m.claim);document.getElementById('story-note').textContent=m.note;document.getElementById('segment-label').textContent=`${state.segment+1} / ${m.segmentCount}　${m.segments[state.segment]}`;if(view==='ipad')document.getElementById('guide-cue').textContent=m.cues[state.segment];document.getElementById('play').textContent=state.playing?'Ⅱ 暫停':'▶ 播放';
  if(!document.getElementById('modes').children.length)document.getElementById('modes').innerHTML=MODES.map((item,i)=>`<button data-mode="${item.id}" style="--mode-color:${item.color}" aria-pressed="${item.id===m.id}"><span>0${i} · ${item.en}</span><strong>${item.short||item.name}</strong></button>`).join('');
  document.querySelectorAll('button[data-mode]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.mode===m.id));
 }
 if(view==='ipad'&&m.id==='idle'){document.getElementById('chapter-claim').innerHTML='第五代住宅宣言<br>AI原生建築生命體';document.getElementById('story-note').textContent='';}
 if(state.standby&&!single){document.getElementById('chapter-label').textContent='ANLB / 待機';document.getElementById('chapter-claim').textContent='第五代住宅宣言';document.getElementById('segment-label').textContent='全牆待機預覽';document.getElementById('story-note').textContent='按開始或選擇情境，開始展演';document.getElementById('play').textContent='▶ 開始';document.querySelectorAll('button[data-mode]').forEach(b=>b.setAttribute('aria-pressed','false'));}
 refreshScores();modelSync();
 resize();
}
function connection(ok){online=ok;document.body.classList.toggle('offline',!ok);const el=document.getElementById('connection');if(el)el.textContent=frozen?'固定分鏡預覽':ok?(state.standby?'● 待機 · 全牆預覽':'● 演示模式 · UE 預錄'):'● 準備中';document.querySelectorAll('[data-action],[data-mode]').forEach(b=>b.disabled=!ok||frozen);}
function poll(){if(frozen){render();connection(false);return;}state=DemoClock.snapshot();render();connection(true);setTimeout(poll,50);}
function command(action,mode){if(frozen)return;state=DemoClock.command(action,mode);render();connection(true);}
document.addEventListener('click',e=>{const beat=e.target.closest('[data-demo-segment]');if(beat&&!frozen){state=DemoClock.command('segment',null,Number(beat.dataset.demoSegment));render();}const action=e.target.closest('[data-action]'),mode=e.target.closest('[data-mode]'),slot=e.target.closest('.slot');if(action)command(action.dataset.action);if(mode&&mode.tagName==='BUTTON')command('mode',mode.dataset.mode);if(slot){detailId=slot.dataset.id;document.getElementById('detail').innerHTML=panel(detailId);document.getElementById('inspect').showModal();resize();}if(e.target.id==='close')document.getElementById('inspect').close();});
document.getElementById('inspect')?.addEventListener('close',()=>detailId=null);
document.addEventListener('keydown',e=>{if(single||e.target.closest('input,textarea'))return;if(['ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();command('mode',MODES[(MODES.indexOf(current())+(e.key==='ArrowRight'?1:3))%4].id);}if(e.code==='Space'&&e.target.tagName!=='BUTTON'){e.preventDefault();command('toggle');}});
if(!single){const fmLink=document.createElement('a');fmLink.href='fm.html';fmLink.target='_blank';fmLink.textContent='WELL FM 常駐總覽 ↗';fmLink.style.fontSize='16px';if(view==='wall')document.querySelector('.desk-header').insertBefore(fmLink,document.querySelector('.desk-header a'));else document.querySelector('.transport').appendChild(fmLink);}
if(view==='wall'){const standby=document.createElement('button');standby.id='wall-standby';standby.dataset.action='start';standby.disabled=true;standby.setAttribute('aria-label','第五代住宅宣言，AI原生建築生命體；點按開始展演');standby.innerHTML='<div class="kv-background" aria-hidden="true"><i></i><i></i><i></i></div><img src="assets/logo.png" alt="ANLB INSIDE"><strong>第五代住宅宣言</strong><span>AI原生建築生命體</span><small>點按開始展演</small>';document.getElementById('wall').before(standby);const sleep=document.createElement('button');sleep.dataset.action='standby';sleep.textContent='待機';document.querySelector('.transport').append(sleep);}
if(view==='wall'){const stage=document.createElement('div');stage.className='wall-stage';const wall=document.getElementById('wall'),standby=document.getElementById('wall-standby');standby.before(stage);stage.append(standby,wall);const dock=document.createElement('aside');dock.id='ipad-dock';dock.setAttribute('aria-label','iPad 操作預覽');const url=new URL('ipad.html',location.href);url.searchParams.set('embedded','1');url.searchParams.set('v','fast07');if(frozen){for(const [key,value] of query)url.searchParams.set(key,value);}dock.innerHTML=`<iframe title="iPad 操作預覽" src="${url.pathname+url.search}" loading="eager"></iframe><a href="ipad.html?v=fast07" target="_blank" rel="noopener">平板操作版 ↗</a>`;stage.append(dock);}
addEventListener('resize',resize);render();poll();
