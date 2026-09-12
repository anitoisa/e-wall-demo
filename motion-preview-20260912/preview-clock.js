// Isolated browser-only clock. No API, WebSocket, UE or lighting connection.
globalThis.ANLBPreviewClock=(()=>{
 const modes=['idle','life','bim','data'],offsets=[0,36,72,108],key='anlb-motion-preview-20260912-v1';
 const seed=()=>crypto.getRandomValues(new Uint32Array(1))[0];
 const derive=(n,k)=>{n=(n^Math.imul(k,0x9e3779b9))>>>0;n=Math.imul(n^(n>>>16),0x85ebca6b);return(n^(n>>>13))>>>0};
 const fresh=()=>({mode:'idle',segment:0,elapsed:0,standby:true,playing:false,scenarioSeed:seed(),revision:0,changedAt:Date.now()});
 let memory;
 const valid=s=>s&&modes.includes(s.mode)&&Number.isInteger(s.segment)&&s.segment>=0&&s.segment<(s.mode==='data'?4:3)&&Number.isFinite(s.elapsed)&&s.elapsed>=0&&Number.isFinite(s.changedAt)&&typeof s.playing==='boolean'&&typeof s.standby==='boolean'&&Number.isFinite(s.scenarioSeed)&&Number.isFinite(s.revision);
 function load(){try{const s=JSON.parse(localStorage.getItem(key));if(valid(s))return memory=s}catch{}return memory||(memory=fresh())}
 function save(s){memory=s;try{localStorage.setItem(key,JSON.stringify(s))}catch{}return s}
 function snapshot(now=Date.now()){
  const s=load(),origin=offsets[modes.indexOf(s.mode)]+s.segment*(s.mode==='data'?18:12)+s.elapsed;
  const absolute=origin+(s.playing&&!s.standby?Math.max(0,now-s.changedAt)/1000:0),t=absolute%180;
  let i=3;while(i>0&&t<offsets[i])i--;const mode=modes[i],duration=mode==='data'?18:12,ct=t-offsets[i],crossings=Math.floor((absolute-108)/180)-Math.floor((origin-108)/180);
  return {...s,mode,segment:Math.floor(ct/duration),elapsed:ct%duration,segmentDuration:duration,segmentCount:mode==='data'?4:3,scenarioSeed:crossings>0?derive(s.scenarioSeed,crossings):s.scenarioSeed};
 }
 function command(action,mode){
  const s=snapshot(),r={...s,changedAt:Date.now(),revision:s.revision+1};let entering=false;
  if(action==='mode'){if(!modes.includes(mode))return s;r.mode=mode;r.segment=0;r.elapsed=0;r.standby=false;r.playing=s.standby||s.playing;entering=mode==='data'}
  else if(action==='next'||action==='prev'){
   let i=modes.indexOf(s.mode),seg=s.segment+(action==='next'?1:-1);
   if(seg>=s.segmentCount){i=(i+1)%4;seg=0}
   if(seg<0){i=(i+3)%4;seg=modes[i]==='data'?3:2}
   r.mode=modes[i];r.segment=seg;r.elapsed=0;r.standby=false;entering=r.mode==='data'&&s.mode!=='data';
  }else if(action==='standby'){Object.assign(r,{mode:'idle',segment:0,elapsed:0,standby:true,playing:false})}
  else if(action==='reset'||action==='start'&&s.standby){Object.assign(r,{mode:'idle',segment:0,elapsed:0,standby:false,playing:true})}
  else if(action==='toggle'){if(s.standby)Object.assign(r,{mode:'idle',segment:0,elapsed:0,standby:false,playing:true});else r.playing=!s.playing}
  else return s;
  if(entering)r.scenarioSeed=seed();save(r);return snapshot();
 }
 save(load());return {snapshot,command};
})();
