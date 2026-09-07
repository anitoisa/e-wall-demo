(async()=>{
 const base=document.body.dataset.view==='single'?'../':'';
 const demoStyle=document.createElement('link');demoStyle.rel='stylesheet';demoStyle.href=base+'demo.css';document.head.appendChild(demoStyle);
 if(document.body.dataset.view==='wall'){const standbyStyle=document.createElement('link');standbyStyle.rel='stylesheet';standbyStyle.href=base+'wall-standby.css';document.head.appendChild(standbyStyle);}
 const style=document.createElement('link');style.rel='stylesheet';style.href=base+'revision.css';document.head.appendChild(style);
 const showStyle=document.createElement('link');showStyle.rel='stylesheet';showStyle.href=base+'showcase.css';document.head.appendChild(showStyle);
 try{const response=await fetch(base+'chapters.json',{cache:'no-store'});if(!response.ok)throw Error('章節設定無法載入');globalThis.CHAPTERS=await response.json();
  const brandStyle=document.createElement('link');brandStyle.rel='stylesheet';brandStyle.href=base+'brand-exhibition.css';document.head.appendChild(brandStyle);
  if(document.body.dataset.view==='ipad'){const tabletStyle=document.createElement('link');tabletStyle.rel='stylesheet';tabletStyle.href=base+'ipad-preview.css';document.head.appendChild(tabletStyle);await new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=base+'ipad-preview.js';s.onload=resolve;s.onerror=reject;document.body.appendChild(s);});}
  for(const file of ['scoring.js','revision.js','showcase-ui.js','brand-exhibition.js','demo-clock.js','app.js'])await new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=base+file;s.onload=resolve;s.onerror=reject;document.body.appendChild(s);});
  const map=document.createElement('script');map.type='importmap';map.textContent=JSON.stringify({imports:{three:new URL(base+'vendor/package/build/three.module.js',location.href).href,'three/addons/':new URL(base+'vendor/package/examples/jsm/',location.href).href}});document.head.appendChild(map);
  import(new URL(base+'showcase.js',location.href).href).catch(error=>{document.querySelectorAll('.show-loading').forEach(el=>el.textContent='立體圖像無法載入，請重新整理');console.error(error);});
 }catch(error){const p=document.createElement('p');p.setAttribute('role','alert');p.textContent='介面設定無法載入，請重新整理。';document.body.appendChild(p);console.error(error);}
})();
