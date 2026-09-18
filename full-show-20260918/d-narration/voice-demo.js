// Synthetic envelope only. Show lifetime controls state; sound controls motion.
export function demoVoiceLevel(timeMs,durationMs,config){
 if(timeMs<0 || timeMs>=durationMs) return 0;
 const phrase=timeMs%(config.phraseMs+config.pauseMs);
 if(phrase>=config.phraseMs) return 0;
 const pulse=Math.max(0,Math.sin(Math.PI*(phrase%config.syllableMs)/config.syllableMs));
 const edge=Math.min(1,phrase/80,(config.phraseMs-phrase)/100,(durationMs-timeMs)/100);
 return (0.14+0.66*pulse*pulse)*Math.max(0,edge);
}
export function showOrbState(showActive){return showActive?'thinking':'idle';}
