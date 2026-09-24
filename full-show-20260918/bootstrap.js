const apStyle=document.createElement('link');apStyle.rel='stylesheet';apStyle.href=(document.body.dataset.view==='single'?'../':'')+'aperture.css?v=standby-space-20260923';document.head.append(apStyle);
(async()=>{
 const base=document.body.dataset.view==='single'?'../':'';
 const liveStyle=document.createElement('link');liveStyle.rel='stylesheet';liveStyle.href=base+'live-standby.css?v=web60-20260923';document.head.appendChild(liveStyle);
 if(document.body.dataset.view==='wall'){const standbyStyle=document.createElement('link');standbyStyle.rel='stylesheet';standbyStyle.href=base+'wall-standby.css?v=web60-20260923';document.head.appendChild(standbyStyle);}
 const style=document.createElement('link');style.rel='stylesheet';style.href=base+'revision.css?v=web60-20260923';document.head.appendChild(style);
 const showStyle=document.createElement('link');showStyle.rel='stylesheet';showStyle.href=base+'showcase.css?v=web60-20260923';document.head.appendChild(showStyle);
 try{const response=await fetch(base+'chapters.json',{cache:'no-store'});if(!response.ok)throw Error('章節設定無法載入');globalThis.CHAPTERS=await response.json();
  const brandStyle=document.createElement('link');brandStyle.rel='stylesheet';brandStyle.href=base+'brand-exhibition.css?v=web60-20260923';document.head.appendChild(brandStyle);
  if(document.body.dataset.view==='ipad'){const tabletStyle=document.createElement('link');tabletStyle.rel='stylesheet';tabletStyle.href=base+'ipad-preview.css?v=standby-space-20260923';document.head.appendChild(tabletStyle);await new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=base+'ipad-preview.js?v=web60-20260923';s.onload=resolve;s.onerror=reject;document.body.appendChild(s);});}
  const reviewStyle=document.createElement('link');reviewStyle.rel='stylesheet';reviewStyle.href=base+'source-review.css?v=web60-20260923';document.head.appendChild(reviewStyle);
  const motionStyle=document.createElement('link');motionStyle.rel='stylesheet';motionStyle.href=base+'review-motion.css?v=web60-20260923';document.head.appendChild(motionStyle);
  const vacancyStyle=document.createElement('link');vacancyStyle.rel='stylesheet';vacancyStyle.href=base+'d-vacancy.css?v=web60-20260923';document.head.appendChild(vacancyStyle);
  const motionUpgrade=document.createElement('link');motionUpgrade.rel='stylesheet';motionUpgrade.href=base+'motion-upgrade.css?v=web60-20260923';document.head.appendChild(motionUpgrade);
  const holdStyle=document.createElement('link');holdStyle.rel='stylesheet';holdStyle.href=base+'hold-effects.css?v=web60-20260923';document.head.appendChild(holdStyle);
  const staticBands=document.createElement('link');staticBands.rel='stylesheet';staticBands.href=base+'static-light-bands.css?v=web60-20260923';document.head.appendChild(staticBands);
  for(const file of ['scoring.js','revision.js','showcase-ui.js','brand-exhibition.js','source-review.js','review-motion.js','d-vacancy.js','motion-upgrade.js'])await new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=base+file+'?v=subtitle-sync-20260924';s.onload=resolve;s.onerror=reject;document.body.appendChild(s);});
  const map=document.createElement('script');map.type='importmap';map.textContent=JSON.stringify({imports:{three:new URL(base+'vendor/package/build/three.module.js',location.href).href,'three/addons/':new URL(base+'vendor/package/examples/jsm/',location.href).href}});document.head.appendChild(map);
  await new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=base+'hold-effects.js?v=web60-20260923';s.onload=resolve;s.onerror=reject;document.body.appendChild(s);});
  await new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=base+'selection-pulse.js?v=web60-20260923';s.onload=resolve;s.onerror=reject;document.body.appendChild(s);});
  await new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=base+'sequence-choreography.js?v=web60-20260923';s.onload=resolve;s.onerror=reject;document.body.appendChild(s);});
  const ueStyle=document.createElement('link');ueStyle.rel='stylesheet';ueStyle.href=base+'ue-films.css?v=free-20260924';document.head.append(ueStyle);
  await new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=base+'ue-films.js?v=free-20260924';s.onload=resolve;s.onerror=reject;document.body.append(s)});
  // Register panel markup and animation ownership before the first render.
  const narrationMode=new URLSearchParams(location.search).get('narration');
  if(!new URLSearchParams(location.search).has('preview')&&(!narrationMode||narrationMode==='full')){
   for(const name of ['intro-session.css','full-session.css']){const css=document.createElement('link');css.rel='stylesheet';css.href=base+name+'?v=web60-20260923';document.head.append(css)}
   globalThis.FullTiming=await import(new URL(base+'full-timing.js?v=web60-20260923',location.href));
   globalThis.FullPack=await FullTiming.loadPack(new URL(base+'narration-full/',location.href));
   globalThis.FullEnding=await import(new URL(base+'full-ending.js?v=web60-20260923',location.href));
   await new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=base+'full-session.js?v=free-20260924';s.onload=resolve;s.onerror=reject;document.body.appendChild(s)});
  }
  if(new URLSearchParams(location.search).get('narration')==='intro'){
   const style=document.createElement('link');style.rel='stylesheet';style.href=base+'intro-session.css?v=web60-20260923';document.head.appendChild(style);
   await new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=base+'intro-session.js?v=web60-20260923';s.onload=resolve;s.onerror=reject;document.body.appendChild(s);});
  }
  await new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=base+'aperture.js?v=web60-20260923';s.onload=resolve;s.onerror=reject;document.body.append(s)});
  await new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=base+'app.js?v=free-20260924';s.onload=resolve;s.onerror=reject;document.body.appendChild(s);});
  if(document.body.dataset.view==='wall'&&!globalThis.ExIntro?.enabled){const link=document.createElement('a');link.href='?narration=intro&v=audio-20260915';link.textContent='新版序章有聲聯調 ↗';link.style.fontSize='15px';document.querySelector('.desk-header').append(link);}
  if(document.body.dataset.view!=='ipad')await new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=base+'d-narration-bridge.js?v=web60-20260923';s.onload=resolve;s.onerror=reject;document.body.appendChild(s);});
  import(new URL(base+'showcase.js?v=bos-motion-20260924',location.href).href).catch(error=>{document.querySelectorAll('.show-loading').forEach(el=>el.textContent='立體圖像無法載入，請重新整理');console.error(error);});
 }catch(error){const p=document.createElement('p');p.setAttribute('role','alert');p.textContent='介面設定無法載入，請重新整理。';document.body.appendChild(p);console.error(error);}
})();
