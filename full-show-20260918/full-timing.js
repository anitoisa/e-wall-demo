export const MODES=['idle','life','bim','data','data'];
// Same chapter-local seconds and linear year progression as UE r12zb.
export function lifeYearAtTime(time){return 120*Math.max(0,Math.min(14.58,time-5.18))/14.58;}
export function visualDuration(index,pack){return index===4?pack.ending.visualEnd:pack.manifest.chapters[index].durationMs/1000}
export function mapTime(index,time,pack){
 const chapter=pack.timeline.chapters[index],ms=time*1000;
 const segment=chapter.segments.find(s=>ms>=s.startMs&&ms<s.endMs)||chapter.segments.at(-1);
 if(index===4)return {mode:'data',segment:3,elapsed:18,segmentDuration:18,segmentCount:4,chapterElapsed:time,visualPhase:'ending',sceneKey:'04-ending',shortBeat:true};
 const phase=segment.phase||segment.id||String(segment.segment),shortBeat=index===3&&!['intro','summary'].includes(phase);
 return {mode:chapter.mode,segment:segment.segment,elapsed:Math.max(0,Math.min(segment.durationMs/1000,time-segment.startMs/1000)),
  segmentDuration:segment.durationMs/1000,segmentCount:index===3?4:3,chapterElapsed:time,visualPhase:phase,sceneKey:chapter.chapter+'-'+phase,
  shortBeat,visualElapsed:shortBeat?18:undefined,segmentLabel:segment.label,
  lifeAxisYear:index===1?lifeYearAtTime(time):undefined,
  waterRouteReady:index===2&&ms>=(chapter.events?.find(e=>e.id==='water-route-to-P01')?.atMs??Infinity)};
}
export function sampleSubtitle(index,time,playing,pack){
 const ms=time*1000,sub=pack.subtitles[index],env=pack.envelopes[index];
 const cue=sub.cues.find(c=>ms>=c.showMs&&ms<c.clearMs);
 const fadeOut=cue?.fadeOutStartMs??(cue?.clearMs-(cue?.fadeOutMs||300));
 const opacity=!cue?0:Math.max(0,Math.min(1,(ms-cue.showMs)/(cue.fadeInMs||250),(cue.clearMs-ms)/(cue.fadeOutMs||300),ms<fadeOut?1:1));
 const p=ms/env.stepMs,i=Math.floor(p),f=p-i;
 const voice=playing&&ms<env.durationMs?(env.levels[i]||0)*(1-f)+(env.levels[i+1]||0)*f:0;
 return {cue:cue?.id||null,text:cue?cue.lines.join('\n'):'',lines:cue?.lines||[],opacity,voice,target:cue?.target||'d',lineRevealMs:cue?.lineRevealMs};
}
export async function loadPack(base){
 const read=async name=>{const r=await fetch(new URL(name,base));if(!r.ok)throw Error('新語音資料無法載入：'+name);return r.json()};
 const [manifest,timeline,ending]=await Promise.all(['manifest.json','wall-timeline.json','ending-cues.json'].map(read));
 const subtitles=await Promise.all(manifest.chapters.map(c=>read(c.subtitleFile))),envelopes=await Promise.all(manifest.chapters.map(c=>read(c.envelopeFile)));
 return {manifest,timeline,ending,subtitles,envelopes,base};
}
