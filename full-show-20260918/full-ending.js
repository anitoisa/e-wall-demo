import {LetterView,LETTERS,endingStages,smooth,letterExit} from './full-ending/visuals.js?v=ending-r7';
const renderers=new WeakMap(),logo=new Image();logo.src=new URL('assets/logo.png',import.meta.url);await logo.decode();
export const BUILD='尾聲 R7｜原位淡出・依序熄幕';
export function markup(id,root){
 const header=id.startsWith('s')?'':`<img class="full-end-corner" src="${root}assets/logo.png" alt="ANLB INSIDE">`;
 const content=id==='main'?'<div class="ue-film-host full-end-photo" data-live-clock="ue-ending-film"></div>'+'<div class="full-end-copy"><p>寶舖帶來的，是安心的空間，</p><p>也是讓安心延續的方法。</p></div>'+`<img class="full-end-logo" src="${root}assets/logo.png" alt="ANLB INSIDE">`:LETTERS[id.toUpperCase()]?`<canvas></canvas><h1>${LETTERS[id.toUpperCase()].title}</h1>`:'';
 const declaration=id==='main'?'<div class="full-end-declaration"><strong>第五代住宅宣言</strong><span>AI原生建築生命體</span></div>':'';
 return `<article class="panel full-ending ${id.startsWith('s')?'full-end-dark':''} ${['s5','s6'].includes(id)?'portrait':''}" data-id="${id}" data-ending-id="${id}" data-live-clock="ending-${id}">${header}${content}${declaration}</article>`;
}
export function paint(time,cues,reduced){
 const s=endingStages(time,cues);
 document.querySelectorAll('[data-ending-id]').forEach(el=>{
  const id=el.dataset.endingId;
  if(id==='main'){el.querySelector('.full-end-photo').style.opacity=1-s.dark;const lines=el.querySelectorAll('p');lines[0].style.opacity=s.first;lines[1].style.opacity=s.second;el.querySelector('.full-end-logo').style.opacity=s.logo;el.querySelector('.full-end-corner').style.opacity=1-s.logo;el.querySelector('.full-end-declaration').style.opacity=smooth((time-(cues.speechEnd+cues.subtitleHold+cues.subtitleFade+cues.logoFade+.2))/.9)}
  else if(LETTERS[id.toUpperCase()]){let v=renderers.get(el);if(!v){v=new LetterView(el.querySelector('canvas'),id.toUpperCase(),logo);renderers.set(el,v)}v.draw(time,cues,reduced);const t=time-cues[id.toUpperCase()];el.querySelector('h1').style.opacity=t<0?0:smooth(t/.25)*(1-smooth((t-.9)/1.15));const dark=smooth((time-letterExit(time,cues,id.toUpperCase()).end)/.45);el.style.setProperty('--ending-blackout',dark);el.classList.add('full-end-blackout');el.dataset.blackout=dark.toFixed(3)}
 });
}
