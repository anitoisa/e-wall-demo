// Captured at normal exhibition speed; source seconds follow DemoClock.
(function(global){
 'use strict';
 const base=document.body.dataset.view==='single'?'../':'';
 let manifest=null,readyPromise=null,loading=false,error=null;
 const urls=new Map(),pending=new WeakMap();
 async function prepare(){
  if(readyPromise)return readyPromise;
  loading=true;
  readyPromise=(async()=>{
   const response=await fetch(base+'ue-sequence.json?v=sequence1');
   if(!response.ok)throw Error('UE 圖片清單無法載入');
   manifest=await response.json();
   const queue=Object.values(manifest.chapters).flatMap(chapter=>chapter.frames);
   // Retain compressed blobs, not hundreds of decoded full-resolution bitmaps.
   await Promise.all(Array.from({length:6},async()=>{
    while(queue.length){const frame=queue.shift(),r=await fetch(base+frame.image);if(!r.ok)throw Error('UE 圖片無法載入');urls.set(frame.image,URL.createObjectURL(await r.blob()));}
   }));
   loading=false;
  })().catch(e=>{loading=false;error=e.message;throw e;});
  return readyPromise;
 }
 function frameFor(state){
  const chapter=manifest?.chapters[state.mode];if(!chapter||!Number.isFinite(state.chapterElapsed))return null;
  const i=Math.max(0,Math.min(chapter.frames.length-1,Math.floor(state.chapterElapsed)));
  return chapter.frames[i];
 }
 function render(state){
  if(state.standby||loading||error)return;
  const frame=frameFor(state);if(!frame)return;
  const src=urls.get(frame.image);if(!src)return;
  document.querySelectorAll('[data-key="main-image"] img').forEach(img=>{
   if(img.dataset.sequenceFrame===frame.image||pending.get(img)===src)return;
   pending.set(img,src);
   const preload=new Image();preload.src=src;
   preload.decode().then(()=>{
    if(pending.get(img)!==src||!img.isConnected||document.documentElement.dataset.standby==='true')return;
    img.src=src;img.dataset.sequenceFrame=frame.image;pending.delete(img);
   }).catch(()=>pending.delete(img));
  });
 }
 global.UESequence={prepare,render,frameFor,sourceFor(state){const frame=frameFor(state);return frame&&!loading&&!error?urls.get(frame.image):null;},get loading(){return loading;},get error(){return error;}};
 prepare().catch(()=>{});
})(globalThis);
