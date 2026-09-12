/* Isolated layout revision; D is reserved for another session. No tour or hardware control. */
const beforeDVacancy=revisionPanel;
function vacantD(){return '<article class="panel d-vacant" data-id="d" data-reserved="narration" aria-label="D 螢幕預留區"></article>';}
function buildingPromises(seg){
 const names=['高標準耐震設計','第三方品質把關','全生命週期維養'];
 const descriptions=['從完整建築，認識安全主張','揭示樓板層次，連結品質依據','設備資訊，接續維養履歷'];
 const icons=['shield','check','tools'];
 return `<div class="building-promises beat-${seg}" data-key="building-promises">${scoreFrame('exhibit')}<aside class="promise-focus" data-key="promise-focus"><span class="promise-step">0${seg+1} / 03</span>${icon(icons[seg])}<h2>${names[seg]}</h2><p>${descriptions[seg]}</p>${seg===2?`<div class="model-record-link">${icon('record')}<span>設備建檔<br>維養計畫<br>履歷更新</span></div>`:''}</aside><svg class="model-information-link" viewBox="0 0 1740 650" aria-hidden="true"><path pathLength="1" d="M720 360H1020Q1070 360 1070 410V500H1220"/><circle cx="720" cy="360" r="10"/></svg><div class="promise-index">${names.map((name,i)=>`<span class="${i===seg?'active':''}">${icon(icons[i])}<b>${name}</b></span>`).join('')}</div></div>`;
}
revisionPanel=function(id){
 if(id==='d')return vacantD();
 const m=state.mode,s=state.segment;
 if(m==='idle'&&id==='c')return nativeFrame(id,'高標準，落實在每個環節','',buildingPromises(s),'merged-building','品牌主張與維養關係示意 · FBX量體非結構工程驗證');
 if(m==='life'&&id==='s4')return nativeFrame(id,'120年資產維養計畫','',maintenanceTracks(s),'review-maintenance moved-maintenance',REVIEW_NOTE);
 if(m==='bim'&&id==='s3')return nativeFrame(id,'BIM設備資訊','找到設備，也找到維養方法',volume('bim-d',deviceDetails(s)),'has-volume equipment-panel review-device moved-device',REVIEW_NOTE);
 if(m==='data'&&id==='s4')return nativeFrame(id,'每個分數，都有依據','讀值與判讀條件，連回同一戶',scoreExplanation(BOS.snapshot(s,revisionElapsed(),state.scenarioSeed)),'moved-score','非即時資料 · 展演判讀，非WELL FM官方評分');
 return beforeDVacancy(id);
};
document.title='ANLB｜動畫升級・線上操作預覽';
function vacancyMotion(now){
 requestAnimationFrame(vacancyMotion);
 const st=globalThis.showcaseState;if(!st)return;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 const t=Math.min(st.segmentDuration,st.elapsed+(st.playing?(now-st.received)/1000:0));
 const reveal=motionManual&&!st.playing?Math.max(t,(now-motionChanged)/1000*4):t;
 const p=reduced?1:Math.max(0,Math.min(1,(reveal-.6)/3));
 document.querySelectorAll('.beat-2 .model-information-link path').forEach(el=>el.style.strokeDashoffset=String(1-p));
 if(st.mode==='data'){
  const snap=BOS.snapshot(st.segment,reduced?18:t,st.scenarioSeed),r=snap.selected[1];
  document.querySelectorAll('.moved-score').forEach(el=>{
   el.querySelector('.causal-reading strong').textContent=formatReading(r.value,snap.metric);
   el.querySelector('.causal-score strong').textContent=r.score;
   el.querySelector('.causal-score').style.setProperty('--score-color',r.color);
   if(el.dataset.reading!==String(r.value)){
    const template=document.createElement('template');template.innerHTML=criterionGraphic(snap);
    morph(el.querySelector('.criterion-mini'),template.content.firstElementChild);
    el.dataset.reading=String(r.value);
   }
  });
 }
}
requestAnimationFrame(vacancyMotion);
