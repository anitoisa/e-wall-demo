// Same-origin visual-only bridge. Never sends commands to the local server or hardware.
(()=>{
 let last=0,raf;
 function send(frame){const s=globalThis.showcaseState;if(!s)return;const elapsed=Math.min(s.segmentDuration||12,Math.max(0,s.elapsed+(s.playing?(performance.now()-s.received)/1000:0)));
  frame.contentWindow?.postMessage({type:'anlb-d-state',state:{mode:s.mode,segment:s.segment,elapsed,playing:!!s.playing,standby:s.standby!==false,completed:s.showComplete===true||s.exhibitionComplete===true,narration:s.narration}},location.origin);
 }
 function receive(e){if(e.origin!==location.origin||e.data?.type!=='anlb-d-ready')return;for(const frame of document.querySelectorAll('.d-narration-view'))if(frame.contentWindow===e.source)send(frame);}
 addEventListener('message',receive);
 // A closed inspection window must not keep a second WebGPU renderer alive.
 document.getElementById('inspect')?.addEventListener('close',()=>{const detail=document.getElementById('detail');if(detail?.querySelector('.d-narration-view'))detail.replaceChildren();});
 function tick(now){raf=requestAnimationFrame(tick);if(document.hidden||now-last<50)return;last=now;document.querySelectorAll('.d-narration-view').forEach(send);}
 raf=requestAnimationFrame(tick);addEventListener('pagehide',()=>{cancelAnimationFrame(raf);removeEventListener('message',receive);},{once:true});
})();
