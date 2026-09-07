// Browser-only exhibition clock. Same-browser tabs share commands; no exhibition API.
(function(global){
 'use strict';
 const modes=['idle','life','bim','data'];
 const frames={idle:[8,20,32],life:[8,20,32],bim:[8,20,29],data:[12,32,48,68]};
 const key='anlb-ue-preview-clock-v1';
 let memory=null;
 const fresh=()=>({mode:'idle',chapterElapsed:8,playing:false,standby:false,scenarioSeed:20260907,revision:0,changedAt:Date.now()});
 function valid(r){return r&&modes.includes(r.mode)&&Number.isFinite(r.chapterElapsed)&&r.chapterElapsed>=0&&Number.isFinite(r.changedAt)&&typeof r.playing==='boolean'&&typeof r.standby==='boolean'&&Number.isFinite(r.scenarioSeed)&&Number.isFinite(r.revision);}
 function load(){try{const r=JSON.parse(localStorage.getItem(key));if(valid(r)){memory=r;return r;}}catch{}return memory||(memory=fresh());}
 function store(r){memory=r;try{localStorage.setItem(key,JSON.stringify(r));}catch{}return r;}
 function snapshot(){
  const r=load();let mode=r.mode,t=r.chapterElapsed+(r.playing&&!r.standby?Math.max(0,Date.now()-r.changedAt)/1000:0);
  // Full show is 180 seconds; bounded even after a background tab returns.
  t%=180;
  while(t>=(mode==='data'?72:36)){t-=mode==='data'?72:36;mode=modes[(modes.indexOf(mode)+1)%4];}
  const duration=mode==='data'?18:12,count=frames[mode].length;
  return {...r,mode,chapterElapsed:t,segment:Math.floor(t/duration),elapsed:t%duration,segmentDuration:duration,segmentCount:count};
 }
 function command(action,mode,index){
  const s=snapshot(),r={mode:s.mode,chapterElapsed:s.chapterElapsed,playing:s.playing,standby:s.standby,scenarioSeed:s.scenarioSeed,revision:s.revision+1,changedAt:Date.now()};
  if(action==='mode'){
   if(!modes.includes(mode))return s;
   r.mode=mode;r.chapterElapsed=r.playing?0:frames[mode][0];r.standby=false;
  }else if(action==='next'||action==='prev'){
   let i=s.segment+(action==='next'?1:-1),mi=modes.indexOf(s.mode);
   if(i>=frames[s.mode].length){mi=(mi+1)%4;i=0;}
   if(i<0){mi=(mi+3)%4;i=frames[modes[mi]].length-1;}
   r.mode=modes[mi];r.chapterElapsed=r.playing?i*(r.mode==='data'?18:12):frames[r.mode][i];r.standby=false;
  }else if(action==='segment'){
   if(!Number.isInteger(index)||index<0||index>=frames[s.mode].length)return s;
   r.chapterElapsed=r.playing?index*s.segmentDuration:frames[s.mode][index];r.standby=false;
  }else if(action==='toggle'){
   if(s.standby){r.playing=true;r.standby=false;}else r.playing=!s.playing;
  }else if(action==='start'){
   r.mode='idle';r.chapterElapsed=0;r.playing=true;r.standby=false;
  }else if(action==='reset'){
   r.mode='idle';r.chapterElapsed=r.playing?0:frames.idle[0];r.standby=false;
  }else if(action==='standby'){
   r.standby=true;r.playing=false;
  }else return s;
  store(r);return snapshot();
 }
 if(!valid(load()))store(fresh());else store(load());
 global.DemoClock={snapshot,command,frames};
})(globalThis);
