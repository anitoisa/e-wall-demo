/* Local-only five-track player. A single wall tab owns the Web Lock and Audio.
 * iPad, D, single screens and inspection views consume time; they never play audio. */
globalThis.ExIntro=(()=>{
 const P=globalThis.FullPack,T=globalThis.FullTiming,E=globalThis.FullEnding;
 const base=document.body.dataset.view==='single'?'../':'',key='anlb-online-free-20260924-v1',id=crypto.randomUUID();
 const channel=new BroadcastChannel(key),view=document.body.dataset.view;
 const qa=new URLSearchParams(location.search).get('qa')==='1';
 let owner=false,audio=null,release,serial=Promise.resolve(),ticket=0,received=0,lastSave=0,lastInteraction=performance.now(),disposed=false;
 let postAnchor=0,postTime=0,index=0,phase='standby',staff=true,qaContinuous=false,error='',completed=[];
 const mediaCache=new Map();
 function mediaURL(i){if(!mediaCache.has(i))mediaCache.set(i,(async()=>{const entry=P.manifest.chapters[i],r=await fetch(new URL('narration-full/'+entry.file+'?v=web60-20260923',new URL(base,location.href)),{signal:AbortSignal.timeout(20000)});if(!r.ok)throw Error('原音讀取失敗');const raw=await r.arrayBuffer(),hash=[...new Uint8Array(await crypto.subtle.digest('SHA-256',raw))].map(x=>x.toString(16).padStart(2,'0')).join('');if(hash!==entry.sha256)throw Error('原音完整性核對失敗');return URL.createObjectURL(new Blob([raw],{type:'audio/wav'}))})().catch(e=>{mediaCache.delete(i);throw e}));return mediaCache.get(i)}
 let s={mode:'idle',segment:0,elapsed:0,segmentDuration:12,segmentCount:3,playing:false,standby:true,staffMode:true,scenarioSeed:20260915,revision:0,
  narration:{version:key,chapter:0,time:0,duration:P.manifest.chapters[0].durationMs/1000,phase:'standby',ended:false},completedChapters:[]};
 function receive(next){if(next?.narration?.version!==key||!Number.isFinite(next.narration.time))return;s=next;received=performance.now()}
 function localTime(){if(phase==='complete'&&index===4)return T.visualDuration(4,P);if(phase==='postroll')return Math.min(T.visualDuration(4,P),postTime+(performance.now()-postAnchor)/1000);if(index===4&&postTime>=(P.manifest.chapters[4].durationMs/1000)&&phase==='paused')return postTime;return audio?.currentTime??s.narration.time??0}
 function publish(){
  if(!owner)return;
  let t=localTime();if(phase==='standby'||phase==='ready')t=0;
  if(phase==='postroll'&&t>=T.visualDuration(4,P)){t=T.visualDuration(4,P);phase='complete';completed=[0,1,2,3];lastInteraction=performance.now()}
  const playing=phase==='postroll'||phase==='playing'&&!!audio&&!audio.paused&&!audio.ended;
  const mapped=T.mapTime(index,t,P),sub=T.sampleSubtitle(index,t,playing,P);
  s={...s,...mapped,playing,standby:['standby','ready'].includes(phase),staffMode:staff,completedChapters:[...completed],showComplete:phase==='complete',
   narration:{version:key,chapter:index,time:t,duration:P.manifest.chapters[index].durationMs/1000,visualDuration:T.visualDuration(index,P),phase,ended:['waiting','complete'].includes(phase),error,subtitle:sub,source:'measured-pcm-rms',audioTime:audio?.currentTime||0},revision:s.revision+1,owner:id};
  receive(s);channel.postMessage({type:'state',snapshot:s});
  if(performance.now()-lastSave>250||!playing){localStorage.setItem(key,JSON.stringify(s));lastSave=performance.now()}
 }
 function ensureAudio(){
  if(audio)return;
  audio=new Audio();audio.preload='auto';audio.muted=new URLSearchParams(location.search).get('muted')==='1';
  audio.addEventListener('ended',()=>{
   if(phase!=='playing')return;
   if(index===4){postTime=P.manifest.chapters[4].durationMs/1000;postAnchor=performance.now();phase='postroll';publish();return}
   if(!completed.includes(index))completed.push(index);
   phase='waiting';lastInteraction=performance.now();publish();
   if(index===3||qaContinuous)void enqueue('chapter',index+1);
  });
  audio.addEventListener('error',()=>{phase='error';error='音檔載入失敗，請重選章節重試';publish()});
 }
 async function load(i,time=0){
  ensureAudio();audio.pause();index=i;postTime=0;
  const [url]=await Promise.all([mediaURL(i),UEFilms.prepare(i)]);
  for(let j=0;j<5;j++)void mediaURL(j).catch(()=>{});
  if(audio.src!==url){audio.src=url;audio.load();await new Promise((resolve,reject)=>{
   let timer;const clean=()=>{clearTimeout(timer);audio.removeEventListener('loadedmetadata',ready);audio.removeEventListener('error',fail)};
   const ready=()=>{clean();resolve()},fail=()=>{clean();reject(Error('音檔無法載入'))};
   timer=setTimeout(()=>{clean();reject(Error('音檔載入逾時'))},8000);audio.addEventListener('loadedmetadata',ready,{once:true});audio.addEventListener('error',fail,{once:true});if(audio.readyState>=1)ready();
  })}
  audio.currentTime=Math.min(time,P.manifest.chapters[i].durationMs/1000);
  if(i===4&&time>=(P.manifest.chapters[4].durationMs/1000))postTime=time;
 }
 async function play(){
  error='';
  if(index===4&&postTime>=(P.manifest.chapters[4].durationMs/1000)){postAnchor=performance.now();phase='postroll';publish();return}
  phase='playing';try{await audio.play()}catch{phase='paused';error='請在發聲的導播牆頁按播放，解鎖瀏覽器聲音'}publish();
 }
 async function apply(action,value,seq){
  lastInteraction=performance.now();error='';
  if(action==='staff'){staff=true;publish();return}
  if(action==='sync'){publish();return}
  if(action==='standby'){audio?.pause();if(audio?.readyState)audio.currentTime=0;index=0;postTime=0;completed=[];phase='standby';publish();return}
  if(action==='continuous'){if(qa){qaContinuous=!!value;publish()}return}
  if(action==='seek'){
   if(!qa)return;const n=Number(value.chapter),t=Number(value.time);if(!Number.isInteger(n)||n<0||n>4||!Number.isFinite(t))return;
   phase='loading';await load(n,Math.max(0,Math.min(t,T.visualDuration(n,P))));if(seq!==ticket)return;phase='paused';publish();return;
  }
  if(action==='start'&&phase==='standby'){phase='ready';publish();return}
  if(action==='toggle'){
   if(phase==='standby'){phase='ready';publish();return}
   if(phase==='playing'||phase==='postroll'){const t=localTime();audio?.pause();if(index===4&&t>=(P.manifest.chapters[4].durationMs/1000))postTime=t;phase='paused';publish();return}
   if(phase==='paused'){await load(index,s.narration.time);if(seq!==ticket)return;await play();return}
   if(['waiting','complete','error','ready'].includes(phase)){action='chapter';value=Math.min(index,3)}else return;
  }
  if(action==='next'){action='chapter';value=(Math.min(index,3)+1)%4}
  if(action==='mode'){action='chapter';value=['idle','life','bim','data'].indexOf(value)}
  if(action==='reset'||action==='replay'||action==='prev'){value=action==='reset'?0:action==='prev'?(Math.min(index,3)+3)%4:Math.min(index,3);action='chapter';completed=[]}
  if(action==='chapter'){
   const n=Number(value);if(!Number.isInteger(n)||n<0||n>4)return;
   phase='loading';audio?.pause();publish();await load(n);if(seq!==ticket)return;publish();await play();
  }
 }
 function enqueue(action,value){const seq=++ticket;serial=serial.then(()=>seq===ticket?apply(action,value,seq):undefined).catch(e=>{if(seq!==ticket)return;phase='error';error=String(e.message||e);publish()});return serial}
 function request(action,value){
  if(parent!==window){parent.postMessage({type:key,action,value},location.origin);return}
  if(view!=='wall'){channel.postMessage({type:'command',action,value});return}
  if(owner){void enqueue(action,value);return}
  if(!navigator.locks){error='請使用支援單一播放鎖的 Chrome／Edge';return}
  void navigator.locks.request(key,{ifAvailable:true},async lock=>{
   if(!lock){channel.postMessage({type:'command',action,value});return}
   owner=true;index=s.narration.chapter;phase=s.narration.phase;if(['playing','postroll','loading'].includes(phase))phase='paused';staff=true;completed=[];
   await enqueue(action,value);await new Promise(resolve=>release=resolve);
  });
 }
 channel.onmessage=e=>{if(e.data?.type==='state'&&!owner)receive(e.data.snapshot);if(e.data?.type==='hello'&&owner)publish();if(e.data?.type==='command'&&owner)void enqueue(e.data.action,e.data.value)};
 addEventListener('message',e=>{if(e.origin===location.origin&&e.data?.type===key&&[...document.querySelectorAll('iframe')].some(f=>f.contentWindow===e.source))request(e.data.action,e.data.value)});
 channel.postMessage({type:'hello'});const timer=setInterval(publish,50);
 // Claim the silent control owner on wall startup so an external iPad can wake it.
 // This command neither creates Audio nor starts a chapter.
 if(view==='wall'&&parent===window)request('sync');
 addEventListener('pagehide',()=>{disposed=true;if(owner){postTime=localTime();audio?.pause();if(['playing','postroll'].includes(phase))phase='paused';publish()}clearInterval(timer);release?.();channel.close()},{once:true});
 function read(){return {...s,narration:{...s.narration,stale:!owner&&performance.now()-received>1800},playing:!owner&&performance.now()-received>1800?false:s.playing}}
 function panel(id){
  if(s.standby)return null;
  if(s.narration.chapter===4)return E.markup(id,base);
  if(id==='main')return UEFilms.markup();
  if(s.mode==='data'&&['intro','summary'].includes(s.visualPhase)&&['a','s1','s2','s3','s4'].includes(id)){
   const summary=s.visualPhase==='summary',names=summary?['位置','條件','紀錄']:['健康','安全','低碳'];
   const title=summary?'支持查核與管理':'智慧維養管理平台';
   return `<article class="panel full-bos-overview" data-id="${id}">${panelHeader(id)}<div class="panel-body"><h1>${title}</h1><div class="full-overview-art">${names.map((n,i)=>`<div>${icon((summary?['target','check','record']:['air','shield','power'])[i])}<b>${n}</b></div>${i<2?'<span>→</span>':''}`).join('')}</div><p class="full-overview-note">${summary?'每個讀值，回到位置、條件與紀錄':'三類系統，匯入智慧維養管理平台'}</p></div>${foot('情境示意 · 非即時資料')}</article>`;
  }
  return null;
 }
 function paint(){
  UEFilms.paint(s);
  document.body.classList.add('full-show');document.body.classList.toggle('full-qa-enabled',qa);
  document.body.classList.toggle('show-ready',s.narration.phase==='ready');
  document.querySelectorAll('a[href="ipad.html"]').forEach(a=>a.href='ipad.html?narration=full');
  const n=s.narration,phase=n.phase,active=['playing','postroll','loading'].includes(phase),labels=['序章','建築生命履歷','數位孿生定位','建築 BOS','尾聲'];
  document.body.classList.toggle('full-ending-blue',n.chapter===4&&!s.standby);
  if(n.chapter===4&&!s.standby)document.documentElement.style.setProperty('--accent','#3FB4F0');
  const text=n.error||(['waiting','complete'].includes(phase)?(phase==='complete'?'展演結束':'請於控制板開啟下一章'):phase==='ready'?'請按序章開始展演':phase==='standby'?'輕觸螢幕進入建築':phase==='paused'?'已暫停':`${labels[n.chapter]}播放中`);
  if(s.showComplete)E.paint(n.time,P.ending,true);else if(n.chapter===4&&!s.standby)E.paint(n.time,P.ending,matchMedia('(prefers-reduced-motion: reduce)').matches);
  if(view==='single')return;
  const connection=document.getElementById('connection');if(connection)connection.textContent=n.stale?'聲音主牆未連線':'自由預覽 · '+text;
  if(view==='wall'){
   let staffButton=document.getElementById('full-staff');
   if(!staffButton){staffButton=document.createElement('button');staffButton.id='full-staff';staffButton.onclick=()=>request('staff');document.querySelector('.transport').append(staffButton)}
   staffButton.hidden=true;
  }
  document.body.classList.toggle('full-staff-active',!!s.staffMode);
  let badge=document.getElementById('full-staff-badge');if(!badge){badge=document.createElement('div');badge.id='full-staff-badge';badge.setAttribute('role','status');document.body.append(badge)}
  badge.textContent='自由預覽 · 四章隨時切換';badge.hidden=false;
  document.querySelector('.desk-header>span small')?.replaceChildren(document.createTextNode('完整展演演示 · UE 實際預錄影像 · 不連接現場硬體'));
  document.getElementById('segment-label').textContent=`${labels[n.chapter]} · ${n.time.toFixed(1)} / ${n.visualDuration||n.duration} 秒`;
  document.getElementById('story-note').textContent=view==='ipad'?'': '四章可隨時來回切換 · 03 播完接尾聲 · 首次點按啟用聲音';
  if(n.chapter===4&&!s.standby){document.getElementById('chapter-label').textContent='04 / 尾聲';document.getElementById('chapter-claim').textContent='ANLB'}
  if(s.mode==='bim'&&s.segment===1){document.querySelectorAll('[data-id=s4] .edge-label span').forEach(el=>el.textContent=s.waterRouteReady?'→ P-01':'管線概念')}
  const play=document.getElementById('play');play.textContent=phase==='loading'?'載入中…':active?'Ⅱ 暫停':['waiting','complete','error'].includes(phase)?'▶ 重播':'▶ 播放';play.disabled=phase==='loading';
  const expected=(s.completedChapters||[]).length;
  document.querySelectorAll('[data-mode]').forEach(b=>{b.disabled=false;b.classList.remove('full-completed','full-next')});
  document.querySelectorAll('[data-action=prev],[data-action=reset]').forEach(b=>b.disabled=!qa&&!s.staffMode);
  document.querySelectorAll('[data-action=next]').forEach(b=>{b.disabled=false;b.textContent='下一章 →'});
  document.querySelectorAll('[data-action=prev]').forEach(b=>{b.disabled=false;b.textContent='← 上一章'});
  document.querySelectorAll('[data-action=standby]').forEach(b=>{b.hidden=false;b.disabled=false});
  if(view==='ipad'){
   let hint=document.getElementById('ready-start-hint');
   const cover=document.getElementById('standby-screen');
   if(!hint){hint=document.createElement('small');hint.id='ready-start-hint';hint.textContent='點擊螢幕開始展演';cover.append(hint)}
   hint.hidden=phase!=='ready';
   cover.dataset.action=phase==='ready'?'toggle':'start';
   if(phase==='ready'){document.body.classList.add('is-standby');document.getElementById('console').inert=true;cover.hidden=false}
   document.getElementById('guide-cue').textContent=text;
   const art=document.getElementById('console-art');art.hidden=n.chapter===4;
   if(n.chapter===4){document.getElementById('chapter-label').textContent='04 / 尾聲';document.getElementById('chapter-claim').textContent=phase==='complete'?'展演結束':'ANLB';}
   document.querySelector('.full-exit')?.remove();
  }
  if(qa&&!document.querySelector('.full-qa')){
   const bar=document.createElement('div');bar.className='full-qa full-qa-only';bar.innerHTML='<label><input id="full-continuous" type="checkbox"> QA 連續播放（不改正式互動）</label><select id="full-chapter">'+labels.map((n,i)=>`<option value="${i}">${String(i).padStart(2,'0')} ${n}</option>`).join('')+'</select><input id="full-seek" type="range" min="0" max="41.36" step=".01" value="0"><button id="full-jump">定位／暫停</button>';document.body.append(bar);
   bar.querySelector('#full-continuous').onchange=e=>request('continuous',e.target.checked);
   bar.querySelector('#full-chapter').onchange=e=>{bar.querySelector('#full-seek').max=T.visualDuration(Number(e.target.value),P)};
   bar.querySelector('#full-jump').onclick=()=>request('seek',{chapter:Number(bar.querySelector('#full-chapter').value),time:Number(bar.querySelector('#full-seek').value)});
  }
  if(qa&&view==='wall'){let build=document.getElementById('ending-build');if(!build){build=document.createElement('span');build.id='ending-build';build.style.cssText='font-size:14px;color:#3fb4f0;margin-left:15px';document.querySelector('.desk-header').append(build)}build.textContent=E.BUILD||'尾聲模組版本不符，請重新載入'}
 }
 let hold,consumeHoldClick=false,holdTarget=null;
 function cancelHold(){clearTimeout(hold);hold=null;holdTarget?.classList.remove('full-logo-holding');holdTarget=null}
 document.addEventListener('pointerdown',e=>{
  if(!['standby','ready'].includes(s.narration.phase)||!e.target.matches('img[alt*="ANLB"]'))return;
  cancelHold();holdTarget=e.target;holdTarget.draggable=false;holdTarget.classList.add('full-logo-holding');
  hold=setTimeout(()=>{cancelHold();consumeHoldClick=true;request('staff')},3000);
 });
 document.addEventListener('dragstart',e=>{if(e.target.matches('img[alt*="ANLB"]'))e.preventDefault()});
 document.addEventListener('contextmenu',e=>{if(e.target.matches('img[alt*="ANLB"]'))e.preventDefault()});
 document.addEventListener('click',e=>{if(consumeHoldClick){consumeHoldClick=false;e.preventDefault();e.stopImmediatePropagation()}},true);
 for(const event of ['pointerup','pointercancel'])document.addEventListener(event,cancelHold);
 addEventListener('blur',cancelHold);
 return {enabled:true,full:true,request,read,panel,paint,diagnostics:()=>({owner,id,audioCount:audio?1:0,currentTime:audio?.currentTime,paused:audio?.paused,phase,index,postTime,snapshot:read(),muted:audio?.muted})};
})();
