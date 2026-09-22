/* Offline UE captures follow the existing audio transport; no hardware routes. */
globalThis.UEFilms = (() => {
 const base=document.body.dataset.view==='single'?'../':'';
 const cache=new Map(), videos=new Map();
 let manifest=null, current=-1, ready=-1, failure='', preparing=0,outgoing=null;
 const manifestReady=fetch(base+'ue-films/manifest.json',{cache:'no-store'}).then(r=>{if(!r.ok)throw Error('UE 影片清單尚未交付');return r.json()}).then(m=>manifest=m);
 function asset(i){
  if(!cache.has(i))cache.set(i,(async()=>{await manifestReady;const entry=manifest.chapters[i];if(!entry?.file)throw Error('本章 UE 影片尚未交付');
   const r=await fetch(new URL(entry.file,new URL(base+'ue-films/',location.href)));if(!r.ok)throw Error('UE 影片下載失敗');
   const blob=await r.blob();return URL.createObjectURL(blob);
  })().catch(e=>{cache.delete(i);throw e}));return cache.get(i);
 }
 function video(){const v=document.createElement('video');v.muted=true;v.defaultMuted=true;v.playsInline=true;v.preload='auto';v.setAttribute('aria-label','UE 實際錄製畫面');v.disablePictureInPicture=true;return v}
 const master=video();
 let stallTimer;
 master.addEventListener('waiting',()=>{clearTimeout(stallTimer);stallTimer=setTimeout(()=>{
  if(globalThis.ExIntro?.diagnostics().owner&&ExIntro.read().playing&&master.readyState<3){failure='影片解碼暫停，請按繼續';ExIntro.request('toggle')}
 },500)});
 master.addEventListener('playing',()=>clearTimeout(stallTimer));
 async function prepare(i){
  if(master.readyState>=2&&master.videoWidth){outgoing=document.createElement('canvas');outgoing.width=master.videoWidth;outgoing.height=master.videoHeight;outgoing.getContext('2d').drawImage(master,0,0)}
  const token=++preparing;failure='';current=i;ready=-1;master.pause();
  try{const url=await asset(i);if(token!==preparing)return;
   if(master.src!==url){master.src=url;master.load();await new Promise((resolve,reject)=>{
    const timer=setTimeout(()=>done(Error('UE 影片解碼逾時')),20000);
    function done(e){clearTimeout(timer);master.removeEventListener('loadeddata',ok);master.removeEventListener('error',bad);e?reject(e):resolve()}
    function ok(){done()}function bad(){done(Error('UE 影片無法解碼'))}
    master.addEventListener('loadeddata',ok,{once:true});master.addEventListener('error',bad,{once:true});if(master.readyState>=2)ok();
   })}if(token!==preparing)return;ready=i;
   if(i<4)void asset(i+1).catch(()=>{});
  }catch(e){failure=e.message;throw e}
 }
 function markup(){return '<article class="panel ue-film-panel" data-id="main"><div class="ue-film-host" data-live-clock="ue-film"></div></article>'}
 function align(v,n,playing){
  if(v.readyState<2)return;
  const t=Math.max(0,Math.min(n.time,Math.max(0,v.duration-1/60))),drift=t-v.currentTime;
  if(Math.abs(drift)>(playing?.14:.025)&&!v.seeking)v.currentTime=t;
  v.playbackRate=playing?Math.max(.97,Math.min(1.03,1+drift*.15)):1;
  if(playing){if(v.paused)void v.play().catch(e=>{failure='請點按導播牆播放以啟用影片';})}else v.pause();
 }
 function paint(s){
  if(s.standby){master.pause();for(const v of videos.values())v.pause();outgoing=null;return}
  const n=s.narration,hosts=[...document.querySelectorAll('.ue-film-host')];
  if(hosts.length&&current!==n.chapter&&n.phase!=='loading')void prepare(n.chapter).catch(()=>{});
  for(const [host,v] of videos){if(!host.isConnected){v.pause();videos.delete(host)}}
  hosts.forEach((host,k)=>{
   if(ready!==n.chapter){if(outgoing&&!host.querySelector('canvas')){const still=document.createElement('canvas');still.width=outgoing.width;still.height=outgoing.height;still.className='ue-film-outgoing';still.getContext('2d').drawImage(outgoing,0,0);host.replaceChildren(still)}else if(!outgoing)host.textContent=failure||'正在準備本章 UE 影片…';return}
   let v=videos.get(host);
   if(!v){v=k===0?master:video();videos.set(host,v)}
   if(v!==master&&v.src!==master.src){v.src=master.src;v.load()}
   if(host.firstChild!==v||host.dataset.filmChapter!==String(n.chapter)){
    host.replaceChildren(v);host.dataset.filmChapter=String(n.chapter);
    if(outgoing){const still=document.createElement('canvas');still.width=outgoing.width;still.height=outgoing.height;still.className='ue-film-outgoing';still.getContext('2d').drawImage(outgoing,0,0);host.append(still);
     const a=still.animate([{opacity:1},{opacity:0}],{duration:matchMedia('(prefers-reduced-motion: reduce)').matches?150:1200,easing:'ease-in-out',fill:'forwards'});a.finished.then(()=>still.remove()).catch(()=>still.remove());}
   }
   align(v,n,s.playing);
  });
  const note=document.querySelector('.desk-header>span small');if(note)note.textContent='完整展演演示 · UE 預錄影像 · 不連接現場硬體';
 }
 function stop(){master.pause();for(const v of videos.values())v.pause()}
 addEventListener('pagehide',stop);
 manifestReady.catch(e=>failure=e.message);
 return {prepare,markup,paint,stop,diagnostics:()=>({current,ready,failure,time:master.currentTime,frames:master.getVideoPlaybackQuality?.(),manifest})};
})();
