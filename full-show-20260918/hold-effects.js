/* Intrinsic attention: narrative time is immutable; decorative time drives only local detail. */
globalThis.ExHold=(()=>{
 const ids=['a','c','s1','s2','s3','s4','s5','s6'],cache=new Map();
 let enabled=true,last=0;
 const clamp=x=>Math.max(0,Math.min(1,x)),ease=x=>{x=clamp(x);return x*x*(3-2*x)};
 const hash=s=>[...s].reduce((h,c)=>(h*31+c.charCodeAt(0))>>>0,7);
 const choice=(s,a)=>a[Math.min(s,a.length-1)];
 const rule=(name,text,icons=null,kind='icon',after=4.8,surface=null)=>({name,text,icons,kind,after,surface,bright:false});
 function spec(mode,id,s){
  if(!ids.includes(id))return null;
  if(id==='s5')return rule('當前章節導航','.vertical-nav .current strong','.vertical-nav .current .icon','icon',2.5);
  if(id==='s6')return mode==='data'?rule('固定資料限制：不輪播、不改字','.score-note-list h3',null,'text',2.5):
   rule('當前生活利益',mode==='idle'?'.benefits-nav .current strong':'.portrait-list p.active',mode==='idle'?'.benefits-nav .current .icon':'.portrait-art .icon','icon',2.5);
  const rules={
   idle:{
    a:()=>rule('主張圖示與品質翻轉','.seismic-icon>span','.seismic-icon .icon',s===1?'flip':'icon'),
    c:()=>rule('模型與當段主張','.promise-focus h2','.promise-focus>.icon','model',5.8),
    s1:()=>rule('SI 服務層與接口','.edge-label strong',null,'volume',5.8),
    s2:()=>rule('查驗文件：保持已完成勾選',s===2?'[data-reveal-stage="2"] text':'[data-enter="'+(s*.35)+'"] text',s===2?'[data-reveal-stage="2"] .icon':'.ex-art>g>.art-icon .icon','document'),
    s3:()=>rule('建檔、維養、履歷回存','[data-motion-poses]:nth-of-type('+(s+2)+') text','[data-motion-poses]:nth-of-type('+(s+2)+') .icon'),
    s4:()=>rule('剖面、設備、對應紀錄',s?'[data-motion-poses]:nth-of-type('+(s+1)+') text':null,s?'[data-motion-poses]:nth-of-type('+(s+1)+') .icon':null,s?'icon':'surface',4.8,s===0?'.cutaway-slab':null)
   },
   life:{
    a:()=>rule('累積年份不重播；當前能力提示','.life-event-name','.life-current-icon [data-life-icon].active .icon','timeline',2),
    c:()=>rule('當前年輪畫至段末前一秒；前圈完整保留','[data-ring="'+s+'"] .history-caption text','[data-ring="'+s+'"] .icon','ring',4),
    s1:()=>rule('接合演示；停一秒後復位，履歷不重複新增','.edge-label strong',null,'volume',5.8),
    s2:()=>rule('查驗類別與對應摘要',s===2?'[data-motion-poses]:nth-of-type(2) text':'[data-enter="'+(s*.4)+'"] text',s===2?'[data-motion-poses]:nth-of-type(2) .icon':'[data-enter="'+(s*.4)+'"] .art-icon:first-of-type .icon'),
    s3:()=>rule('設備身份、維養工作、紀錄',choice(s,['.record-exhibit text','[data-record-stage="1"] text','[data-record-stage="2"] text']),choice(s,['[data-record-stage="0"] .icon','[data-record-stage="1"] .icon','[data-record-stage="2"] .icon']),'icon',5.3),
    s4:()=>rule('當段三列事件逐列提示；固定版面','[data-service-event="'+s+'"] text','[data-service-event="'+s+'"] .icon','tracks',5.8)
   },
   bim:{
    a:()=>rule('空間、系統、索引：原著色部位緩慢呼吸','.layer-labels>div:nth-child('+(s+1)+') strong',null,'volume',5.8),
    c:()=>rule('定位成立後保留位置',s===2?'[data-reveal-stage="2"] text':'.ex-art text',null,'surface',5.8,choice(s,['[data-spatial-floor="6"] .selected-space','[data-motion-poses]:nth-of-type(2) .selected-space','.device-halo'])),
    s1:()=>rule('L06 原樓板材質呼吸；不反覆抽層','.edge-label strong',null,'volume',5.8),
    s2:()=>rule('已接通的設備路徑','[data-route-node="'+(s?1:0)+'"] text','[data-route-node="'+(s?1:0)+'"] .icon','route',5.8),
    s3:()=>rule('泵浦與維養文件',s===2?'.review-equipment section strong':'.review-equipment h3',null,'volume',5.8),
    s4:()=>rule('遮蔽層完整保留至揭示；只沿第四路徑流動','.edge-label strong',null,'cover',s===0?2:5.8)
   },
   data:{
    a:()=>rule('當前指標；選戶白框原位微動','.metric-symbol strong','.metric-symbol .icon','volume',12),
    c:()=>rule('當前指標訊號匯流','.current text','.current .icon','route',5.8),
    s1:()=>rule('指標圖示與原始讀值','.raw-row strong','.raw-symbol .icon','icon',7.2),
    s2:()=>rule('精確比例保留；文字本體提示','.percentage,.distribution-base',null,'text',7.2),
    s3:()=>rule('固定矩陣與原選戶；只提示戶號','.house-cell.chosen span',null,'matrix',7.2),
    s4:()=>rule('讀值、條件、分數與紀錄','.causal-rule strong,.causal-score strong','.score-record-line .icon','record',11.2)
   }
  };
  return rules[mode]?.[id]?.();
 }
 function clock(mode,id,segment,now=performance.now()){
  const st=globalThis.showcaseState||{},sample=globalThis.ExMotion?.sample(id,now),t=sample?.t||0;
  const r=spec(mode,id,segment),period=5.5+(hash(mode+id)%9)/10,offset=hash(mode+':'+id)%1200/100;
  const decor=(performance.timeOrigin+now)/1000,phase=((decor+offset)%period)/period;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const raw=Math.min(st.segmentDuration||12,(st.elapsed||0)+(st.playing?(now-(st.received||now))/1000:0));
  const on=!!(r&&enabled&&!reduced&&!st.standby&&t>=r.after&&document.body.dataset.view!=='ipad');
  // Active 2.2 s, then keep the completed icon visible. No narrative values use this phase.
  const loopT=Math.max(0,t-(r?.after||0))%period,loop=ease(Math.min(1,loopT/2.2));
  return {on,phase,decor,t,raw,period,loopT,loop,breathe:.5-.5*Math.cos(phase*Math.PI*2),shine:0,q:loop,rule:r};
 }
 function visible(el,panel){
  if(!el?.isConnected)return false;
  for(let n=el;n&&n!==panel;n=n.parentElement){const c=getComputedStyle(n);if(c.visibility==='hidden'||c.display==='none'||+c.opacity<.2)return false;}
  return el.getBoundingClientRect().width>1;
 }
 function find(panel,selector){return selector?[...panel.querySelectorAll(selector)]:[];}
 function clear(c){
  for(const el of c.texts)el.classList.remove('attention-text');
  for(const el of c.surfaces){el.classList.remove('attention-surface');el.style.removeProperty('--attention-light');}
  for(const svg of c.icons){
   svg.classList.remove('attention-icon');svg.style.removeProperty('transform');svg.style.removeProperty('--attention-glow');
   svg.querySelectorAll('[data-attention-detail]').forEach(p=>{
    for(const k of ['stroke-dasharray','stroke-dashoffset','opacity','transform'])p.style.removeProperty(k);
    delete p.dataset.attentionDetail;
   });
  }
 }
 function build(panel,key,r){
  const texts=find(panel,r.text).filter(e=>!e.querySelector('.icon,svg,canvas')); // Glyphs only; never filter an entire card.
  const icons=find(panel,r.icons),surfaces=find(panel,r.surface);
  return {panel,key,r,texts,icons,surfaces};
 }
 function iconFrame(svg,a,index,kind){
  const type=svg.dataset.iconKind||'record',local=(a.loopT+index*.42)%a.period;
  const q=ease(Math.min(1,local/2.2));
  svg.classList.add('attention-icon');
  svg.style.setProperty('--attention-glow',(1.5+3*a.breathe).toFixed(2)+'px');
  if(kind==='flip'){
   const angle=360*ease(Math.min(1,local/2));
   svg.style.transform='perspective(900px) rotateY('+angle+'deg) scaleX('+(angle>90&&angle<270?-1:1)+')';
   svg.dataset.attentionAngle=angle.toFixed(1);return;
  }
  // Re-trace only the icon's internal detail. The main object and completed records remain.
  const paths=[...svg.querySelectorAll('.draw,.record-lines,.flow-path')];
  if(!paths.length&&['layers','structure','pulse'].includes(type)){
   const outline=svg.querySelector('path');if(outline)paths.push(outline);
  }
  if(!paths.length){
   // Single-path icons (layers/structure) keep geometry and use intrinsic stroke light.
   svg.style.setProperty('--attention-glow',(2+5*a.breathe).toFixed(2)+'px');
  }
  paths.forEach(p=>{
   if(!p.getTotalLength)return;const n=p.getTotalLength();p.dataset.attentionDetail='true';
   const flowing=type==='air'||p.classList.contains('flow-path');
   if(flowing){
    p.style.strokeDasharray=n*.72+' '+n*.28;p.style.strokeDashoffset=String(-n*Math.min(local,2.2)/2.2);
   }else{
    p.style.strokeDasharray=String(n);
    // 250ms soft reset instead of a hard disappearance at the decorative loop seam.
    const reset=local<.25?1-ease(local/.25):ease((local-.25)/1.95);
    p.style.strokeDashoffset=String(n*(1-reset));
   }
  });
  if(type==='record'){
   const stamp=svg.querySelector('.pulse-dot');if(stamp){stamp.dataset.attentionDetail='true';stamp.style.opacity=String(.65+.35*q);}
  }
  if(type==='target'){
   // Existing locator only: no added frame, no change of target location.
   const dot=svg.querySelector('.pulse-dot');if(dot){dot.dataset.attentionDetail='true';dot.style.opacity=String(.5+.5*a.breathe);}
  }
 }
 // One narrative owner: contour -> detail -> one flip -> repeat detail only.
 // Uses show time (not decorative time), so pause freezes the demonstration.
 function stagedIcon(svg,t,{flip=false,repeat=true,reduced=false,loopAt}={}){
  if(!svg)return;svg.classList.add('attention-icon');svg.style.setProperty('--attention-glow','0px');
  const type=svg.dataset.iconKind,all=[...svg.querySelectorAll('path,rect,circle,ellipse,polyline')];
  const details=all.filter(p=>p.matches('.draw,.record-lines,.flow-path,.pulse-dot')||(type==='record'&&p===all.at(-1)));
  const outlines=all.filter(p=>!details.includes(p));
  const draw=(p,q)=>{if(!p.getTotalLength)return;const n=p.getTotalLength();p.dataset.attentionDetail='true';p.style.strokeDasharray=String(n);p.style.strokeDashoffset=String(n*(1-q));p.style.opacity=q<=0?'0':'1';};
  const end=loopAt??(flip?5.4:6),cycle=Math.max(0,t-end)%3.6;
  let detail=ease((t-(outlines.length?1.25:0))/1.55);
  if(repeat&&t>end)detail=cycle<.45?1-ease(cycle/.45):ease((cycle-.45)/1.5);
  outlines.forEach((p,i)=>draw(p,reduced?1:ease((t-i*.12)/1.15)));
  details.forEach((p,i)=>draw(p,reduced?1:Math.max(0,Math.min(1,detail-i*.05))));
  const angle=flip&&!reduced?360*ease((t-3.15)/2):0;
  svg.style.transform=`perspective(900px) rotateY(${angle}deg) scaleX(${angle>90&&angle<270?-1:1})`;
  svg.style.strokeWidth='4.8';svg.dataset.attentionAngle=angle.toFixed(2);
  svg.dataset.sequencePhase=reduced?'result':t<1.25?'contour':t<3.15?'detail':flip&&t<5.15?'flip':!repeat||t<end?'hold':'detail-loop';
 }
 function tick(now){
  requestAnimationFrame(tick);if(document.hidden||now-last<32)return;last=now;
  for(const [panel,c]of cache)if(!panel.isConnected){clear(c);cache.delete(panel);}
  const st=globalThis.showcaseState;if(!st||document.body.dataset.view==='ipad')return;
  for(const panel of document.querySelectorAll('.panel[data-id]')){
   if(panel.classList.contains('intro-neutral'))continue;
   const id=panel.dataset.id;if(!ids.includes(id))continue;
   if(st.mode==='data'&&id==='s6'){const prior=cache.get(panel);if(prior)clear(prior);cache.delete(panel);continue;}
   if(globalThis.ExSequence?.owns(st.mode,id))continue;
   const r=spec(st.mode,id,st.segment),key=st.mode+':'+id+':'+st.segment;if(!r)continue;
   let c=cache.get(panel);
   const stale=c&&(c.key!==key||c.icons.some(e=>!e.isConnected)||c.texts.some(e=>!e.isConnected));
   if(stale){clear(c);cache.delete(panel);c=null;}
   if(!c){c=build(panel,key,r);cache.set(panel,c);}
   if(st.mode==='life'&&id==='a'&&(!c.refresh||now-c.refresh>200)){
    clear(c);Object.assign(c,build(panel,key,r));c.refresh=now;
   }
   const a=clock(st.mode,id,st.segment,now),on=a.on&&!panel.classList.contains('standby-panel');
   if(st.mode==='idle'&&id==='a'&&enabled&&!st.standby&&!panel.classList.contains('standby-panel')){
    c.icons.forEach(svg=>stagedIcon(svg,a.t,{flip:true,repeat:!globalThis.ExMotion?.sample(id,now)?.manual,reduced:matchMedia('(prefers-reduced-motion: reduce)').matches}));
    continue;
   }
   if((id==='s5'||(['idle','life','bim'].includes(st.mode)&&id==='s6'))&&enabled&&!st.standby&&!panel.classList.contains('standby-panel')){
    c.icons.forEach(svg=>stagedIcon(svg,a.t-.5,{repeat:!globalThis.ExMotion?.sample(id,now)?.manual,reduced:matchMedia('(prefers-reduced-motion: reduce)').matches}));
    continue;
   }
   if(st.mode==='life'&&id==='a'&&enabled&&!st.standby){
    const total=st.segment*12+a.t,active=panel.querySelector('[data-life-icon].active'),index=Number(active?.dataset.lifeIcon||0);
    stagedIcon(active?.querySelector('.icon'),total-[0,7,14,21,28][index],{repeat:!globalThis.ExMotion?.sample(id,now)?.manual,reduced:matchMedia('(prefers-reduced-motion: reduce)').matches});
    continue;
   }
   panel.dataset.holdKey=key;panel.dataset.holdPhase=on?a.phase.toFixed(4):'off';
   if(!on){clear(c);continue;}
   c.texts.forEach((e,i)=>{
    const ok=visible(e,panel);e.classList.toggle('attention-text',ok);
    if(ok)e.style.setProperty('--attention-glow',(2+5*(.5-.5*Math.cos(a.phase*Math.PI*2+i*.6))).toFixed(2)+'px');
   });
   c.surfaces.forEach(e=>{
    const ok=visible(e,panel);e.classList.toggle('attention-surface',ok);
    if(ok)e.style.setProperty('--attention-light',(1+.22*a.breathe).toFixed(3));
   });
   c.icons.forEach((svg,i)=>{
    if(!visible(svg,panel))return;
    // A cumulative ring owns its entire beat. Do not reset its icon while it is drawing.
    if(r.kind==='ring'&&a.t<(st.segmentDuration||12)-1)return;
    iconFrame(svg,a,i,r.kind);
   });
  }
 }
 requestAnimationFrame(tick);
 return {clock,spec,ids,stagedIcon,setEnabled(v){enabled=!!v;if(!enabled)for(const c of cache.values())clear(c);},get enabled(){return enabled;},
  diagnostics(){return [...cache.values()].filter(c=>c.panel.isConnected).map(c=>({key:c.key,name:c.r.name,texts:c.texts.length,icons:c.icons.length,surfaces:c.surfaces.length,kind:c.r.kind,phase:c.panel.dataset.holdPhase}));},
  manifest(){return ['idle','life','bim','data'].flatMap(mode=>Array.from({length:mode==='data'?4:3},(_,segment)=>ids.map(id=>({mode,id,segment,...spec(mode,id,segment)}))).flat());}};
})();
