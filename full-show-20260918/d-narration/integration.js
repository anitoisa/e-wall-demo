import {createRestoredOrb} from './restored-orb.js';
import {validState,sampleNarration} from './timeline.js';
import {sampleIntro} from './intro-timeline.js?v=audio-20260915';
const $=id=>document.getElementById(id),embedded=parent!==window,origin=location.origin;
const readJSON=async name=>{const r=await fetch(name,{cache:'no-store'});if(!r.ok)throw Error('D 字幕設定載入失敗');return r.json();};
let controller,raf,last=performance.now(),received=last,signal=null,level=0,ready=false,disposed=false;
const instance=crypto.randomUUID();
function resize(){const r=$('viewport').getBoundingClientRect();$('stage').style.transform=`translate(-50%,-50%) scale(${Math.min(r.width/1920,r.height/1080)})`;}
const observer=new ResizeObserver(resize);observer.observe($('viewport'));resize();
function isFull(s){return ['anlb-full-wall-candidate-20260918','anlb-online-ue60-20260918'].includes(s?.narration?.version)}
function accept(s){const full=isFull(s);if(!validState(s)&&!(full&&Number.isFinite(s.narration.time)&&['idle','life','bim','data'].includes(s.mode)))return false;signal={...s};received=performance.now();return true;}
function onMessage(e){if(e.origin===origin&&e.source===parent&&e.data?.type==='anlb-d-state')accept(e.data.state);}
addEventListener('message',onMessage);
try{
 const [data,wall,intro,envelope]=await Promise.all([readJSON('demo.json'),readJSON('wall-cues.json'),readJSON('../narration-20260915/00_序章字幕.json'),readJSON('../narration-20260915/00_實際音量包絡.json')]);
 const voiceConfig=data.voiceDemo||{phraseMs:1500,pauseMs:800,syllableMs:280};
 if(embedded)parent.postMessage({type:'anlb-d-ready',instance},origin);
 else {const poll=async()=>{if(disposed)return;try{accept(await readJSON('../api/state'));}catch{$('connection').textContent='等待本機控制';}setTimeout(poll,500);};poll();}
 controller=createRestoredOrb({canvas:$('orb'),status:$('rendererStatus'),onReady(){if(disposed){controller?.dispose();return;}ready=true;$('rendererStatus').hidden=true;$('orb').dataset.renderer='ready';},onError(e){if(disposed)return;$('rendererStatus').hidden=false;$('rendererStatus').textContent='語音球需支援 WebGPU 的瀏覽器；字幕仍可顯示';$('orb').dataset.renderer='error';console.error(e);}});
 function tick(now){
  if(disposed)return;raf=requestAnimationFrame(tick);if(document.hidden)return;
  const dt=Math.min(.1,(now-last)/1000);last=now;
  const stale=now-received>2200,s=signal||{mode:'idle',segment:0,elapsed:0,playing:false,standby:true};
  const elapsed=Math.min(s.mode==='data'?18:12,s.elapsed+(s.playing?Math.min(now-received,2200)/1000:0));
  const sub=s.narration?.subtitle||{text:'',opacity:0,voice:0,cue:null};
  const current={...s,elapsed,playing:s.playing&&!stale},full=isFull(s),real=full||s.narration?.version==='anlb-new-intro-20260915',active=full&&s.standby===false&&s.narration.chapter<4,result=full?{active,orb:active?'thinking':'idle',text:active?sub.text:'',opacity:active?sub.opacity:0,voice:active&&s.playing&&!stale?sub.voice:0,cue:sub.cue}:real?sampleIntro(current,intro,envelope):sampleNarration(current,wall.cues,voiceConfig),chapter=data.chapters.find(c=>c.id===s.mode);
  $('preview-note').textContent=full?'新版語音 · 實測音量包絡 · 字詞待人工聽校':real?(s.mode==='idle'?'新版序章 · 實音聯調 · 字詞待人工聽校':'新版音檔待提供 · 無聲畫面預覽'):'暫用字幕 · 無聲合成包絡 · 未對齊新版旁白';
  $('stage').style.setProperty('--accent',chapter.accent);$('stage').style.setProperty('--background',chapter.background);$('chapterName').textContent='D / '+chapter.en;
  $('stage').dataset.standby=String(!result.active);$('stage').dataset.mode=s.mode;$('stage').dataset.segment=String(s.segment);
  if($('subtitle').textContent!==result.text)$('subtitle').textContent=result.text;
  $('subtitle').style.opacity=String(result.opacity);
  const target=matchMedia('(prefers-reduced-motion: reduce)').matches?0:result.voice;
  level+=(target-level)*(1-Math.exp(-dt/(target>level?.025:.09)));
  controller.setState(result.orb);controller.setSpeechLevel(result.active?level:0);
  $('orb').dataset.voiceTarget=target.toFixed(3);$('orb').dataset.level=level.toFixed(3);
  $('connection').textContent=stale&&signal?'同步暫停':'';
  globalThis.dNarrationStatus={instance,ready,mode:s.mode,segment:s.segment,elapsed,orb:result.orb,voice:target,level,subtitle:result.text,opacity:result.opacity,synthetic:!real,audioTime:s.narration?.time,cue:result.cue,stale,completed:!!s.completed};
 }
 raf=requestAnimationFrame(tick);
}catch(e){$('rendererStatus').hidden=false;$('rendererStatus').textContent=e.message;console.error(e);}
addEventListener('pagehide',()=>{disposed=true;cancelAnimationFrame(raf);observer.disconnect();removeEventListener('message',onMessage);controller?.dispose();},{once:true});
