// Audio-local clock. No subtitle-to-wall beat conversion or synthetic envelope.
export function sampleIntro(s,subtitles,envelope){
 const active=s.standby===false&&!s.completed,ms=Math.max(0,Math.min(subtitles.durationMs,(s.narration?.time||0)*1000));
 if(!active||s.mode!=='idle')return {active,orb:active?'thinking':'idle',text:'',opacity:0,voice:0};
 const cue=subtitles.cues.find(c=>ms>=c.showMs&&ms<c.clearMs);
 const opacity=!cue?0:Math.max(0,Math.min(1,(ms-cue.showMs)/cue.fadeInMs,(cue.clearMs-ms)/cue.fadeOutMs));
 const index=ms/envelope.stepMs,i=Math.floor(index),f=index-i;
 const rms=(envelope.levels[i]||0)*(1-f)+(envelope.levels[i+1]||0)*f;
 return {active,orb:'thinking',cue:cue?.id||null,text:cue?cue.lines.join('\n'):'',opacity,voice:s.playing&&!s.narration?.ended?rms:0,timeMs:ms};
}
