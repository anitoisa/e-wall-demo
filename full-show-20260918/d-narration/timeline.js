import {demoVoiceLevel} from './voice-demo.js';
export const modes=['idle','life','bim','data'];
export function validState(s){return s&&modes.includes(s.mode)&&Number.isInteger(s.segment)&&s.segment>=0&&s.segment<(s.mode==='data'?4:3)&&Number.isFinite(s.elapsed)&&s.elapsed>=0&&s.elapsed<=18&&typeof s.playing==='boolean'&&typeof s.standby==='boolean';}
export function sampleNarration(s,cues,config){
 const active=s.standby===false&&!s.completed,cue=cues[s.mode]?.[s.segment],ms=s.elapsed*1000;
 if(!active||!cue)return {active,orb:active?'thinking':'idle',text:'',opacity:0,voice:0};
 const opacity=ms<cue.speechMs?Math.min(1,ms/250):Math.max(0,1-(ms-cue.speechMs)/300);
 return {active,orb:'thinking',text:cue.text,opacity:!s.playing&&ms===0?1:opacity,voice:s.playing?demoVoiceLevel(ms,cue.speechMs,config):0};
}
