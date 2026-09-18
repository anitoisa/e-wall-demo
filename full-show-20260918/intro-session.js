/* Opt-in, browser-local audio master. Never controls /api, UE or lighting.
 * Only the Web Lock owner creates an Audio element; all other views receive time. */
globalThis.ExIntro=(()=>{
 const enabled=new URLSearchParams(location.search).get('narration')==='intro';
 if(!enabled)return {enabled:false};
 const base=document.body.dataset.view==='single'?'../':'',channel=new BroadcastChannel('anlb-new-intro-20260915');
 const key='anlb-new-intro-20260915',id=crypto.randomUUID(),duration=41.36;
 let audio=null,owner=false,release=null,serial=Promise.resolve(),received=0,lastSave=0,disposed=false;
 let snap={mode:'idle',segment:0,elapsed:0,playing:false,standby:true,revision:0,scenarioSeed:20260915,segmentDuration:12,segmentCount:3,narration:{version:key,time:0,duration,ended:false}};
 try{const saved=JSON.parse(localStorage.getItem(key));if(saved?.narration?.version===key)snap={...saved,playing:false};}catch{}
 const valid=s=>s?.narration?.version===key&&['idle','life','bim','data'].includes(s.mode)&&Number.isFinite(s.narration.time)&&s.narration.time>=0&&s.narration.time<=duration;
 function receive(s){if(!valid(s))return;snap=s;received=performance.now();}
 function publish(){
  if(!owner)return;
  if(snap.mode==='idle'&&audio){snap.narration.time=Math.min(duration,audio.currentTime||0);snap.playing=!audio.paused&&!audio.ended;}
  if(snap.mode==='idle'&&!snap.standby){const t=snap.narration.time;snap.segment=Math.min(2,Math.floor(t/12));snap.elapsed=Math.min(11.999,t-snap.segment*12);snap.chapterElapsed=snap.segment*12+snap.elapsed;}
  snap.owner=id;snap.revision++;receive({...snap,narration:{...snap.narration}});
  channel.postMessage({type:'state',snapshot:snap});
  if(performance.now()-lastSave>250||!snap.playing){try{localStorage.setItem(key,JSON.stringify(snap));}catch{}lastSave=performance.now();}
 }
 async function play(){
  snap.narration.error='';
  try{await audio.play();}catch{snap.playing=false;snap.narration.error='聲音尚未解鎖，請在發聲的導播牆頁按播放';}
  publish();
 }
 async function apply(action,mode){
  if(!audio){audio=new Audio(new URL(base+'narration-20260915/00_序章.wav',location.href));audio.preload='auto';
   audio.addEventListener('ended',()=>{snap.narration.ended=true;snap.narration.time=duration;snap.playing=false;publish();});
   audio.addEventListener('error',()=>{snap.playing=false;snap.narration.error='新版序章音檔載入失敗，請重新整理';publish();});
   audio.currentTime=snap.narration.time;
  }
  if(action==='standby'){audio.pause();audio.currentTime=0;snap.mode='idle';snap.segment=0;snap.elapsed=0;snap.standby=true;snap.playing=false;snap.narration.ended=false;publish();return;}
  if(action==='mode'&&mode!=='idle'){
   audio.pause();snap.mode=mode;snap.segment=0;snap.elapsed=mode==='data'?17.99:11.99;snap.segmentDuration=mode==='data'?18:12;snap.segmentCount=mode==='data'?4:3;snap.standby=false;snap.playing=false;publish();return;
  }
  if(snap.mode!=='idle'&&['prev','next','toggle'].includes(action)){
   if(action!=='toggle'){snap.segment=(snap.segment+(action==='next'?1:snap.segmentCount-1))%snap.segmentCount;}
   publish();return;
  }
  if(action==='next'){/* Intro has no fabricated beat/next-chapter timing. */publish();return;}
  const restart=action==='reset'||action==='replay'||action==='prev'||action==='start'||action==='mode'||snap.narration.ended;
  snap.mode='idle';snap.segment=0;snap.segmentCount=3;snap.segmentDuration=12;snap.elapsed=0;snap.standby=false;
  if(restart){audio.pause();audio.currentTime=0;snap.narration.ended=false;await play();}
  else if(action==='toggle'){if(audio.paused)await play();else{audio.pause();publish();}}
 }
 function enqueue(action,mode){serial=serial.then(()=>apply(action,mode)).catch(e=>{snap.narration.error=String(e);publish();});return serial;}
 async function acquire(action,mode){
  if(owner)return enqueue(action,mode);
  if(!navigator.locks){snap.narration.error='瀏覽器不支援單一音源鎖定；請使用 Chrome／Edge';return;}
  await navigator.locks.request(key,{ifAvailable:true},async lock=>{
   if(!lock){channel.postMessage({type:'command',action,mode});return;}
   owner=true;await enqueue(action,mode);await new Promise(resolve=>release=resolve);
  });
 }
 function request(action,mode){
  if(!['start','standby','toggle','reset','replay','prev','next','mode'].includes(action))return;
  if(action==='mode'&&!['idle','life','bim','data'].includes(mode))return;
  if(parent!==window){parent.postMessage({type:key,action,mode},location.origin);return;}
  if(document.body.dataset.view==='single')return;
  void acquire(action,mode);
 }
 channel.onmessage=e=>{
  if(e.data?.type==='state'&&!owner)receive(e.data.snapshot);
  if(e.data?.type==='hello'&&owner)publish();
  if(e.data?.type==='command'&&owner)enqueue(e.data.action,e.data.mode);
 };
 addEventListener('message',e=>{if(e.origin===location.origin&&e.data?.type===key&&[...document.querySelectorAll('iframe')].some(f=>f.contentWindow===e.source))request(e.data.action,e.data.mode);});
 channel.postMessage({type:'hello'});
 const timer=setInterval(()=>{if(!disposed)publish();},50);
 addEventListener('pagehide',()=>{disposed=true;if(owner){audio?.pause();publish();}clearInterval(timer);release?.();channel.close();},{once:true});
 function read(){const stale=!owner&&performance.now()-received>1500;return {...snap,playing:stale?false:snap.playing,narration:{...snap.narration,stale,source:'measured-pcm-rms'}};}
 function panel(id){
  // Narration is chapter 00 itself: retain the existing chapter renderer.
  // 0–36 s: three visual beats; 36–41.36 s: hold the third result.
  return null;
 }
 function paint(){
  document.querySelectorAll('a[href="ipad.html"]').forEach(a=>a.href='ipad.html?narration=intro');
  if(document.body.dataset.view==='single')return;
  const n=read().narration,active=snap.mode==='idle',text=snap.standby?'新版序章 · 點按開始':active?n.error||(n.ended?'序章已播完 · 請於控制板開啟下一章':n.stale?'播放器連線中斷 · 時間保持':snap.playing?'新版序章播放中':'新版序章已暫停'):'此章新版音檔尚未提供 · 僅看原有畫面';
  const header=document.querySelector('.desk-header>span small');if(header)header.textContent='新版00實音 · 41.36秒 · 本機聯調';
  const status=document.getElementById('connection');if(status)status.textContent=text;
  const segment=document.getElementById('segment-label');if(segment)segment.textContent=active?n.time.toFixed(2)+' / 41.36 秒':(snap.segment+1)+' / '+snap.segmentCount+' · 無聲畫面';
  const note=document.getElementById('story-note');if(note)note.textContent='過渡預覽：僅 00 為新版實音；後三章／結尾待音檔。字幕仍待人工聽校。';
  if(active&&!snap.standby){
   const label=document.getElementById('chapter-label');if(label)label.textContent='00 / 新版序章';
   const title=document.getElementById('chapter-claim');if(title)title.textContent='生命履歷與數位分身';
   const guide=document.getElementById('guide-cue');if(guide)guide.textContent='音訊主時鐘 · 播完保持，不自動進入下一章';
   const art=document.getElementById('console-art');if(art)art.hidden=true;
  }else{const art=document.getElementById('console-art');if(art)art.hidden=false;}
  document.querySelectorAll('[data-action="next"]').forEach(b=>b.disabled=active);
  const btn=document.getElementById('play');if(btn){btn.textContent=active?(snap.standby?'▶ 開始新版序章':n.ended?'↻ 重播序章':snap.playing?'Ⅱ 暫停':'▶ 播放'):'新版音檔待提供';btn.disabled=!active;}
  document.querySelectorAll('[data-action="reset"]').forEach(b=>b.textContent='重播序章');
 }
 return {enabled,request,read,panel,paint,diagnostics:()=>({owner,id,audioCount:audio?1:0,time:audio?.currentTime,paused:audio?.paused,snapshot:read()})};
})();
