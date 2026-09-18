/* Selection-only cadence: three gentle 0.8 s flashes, then 2 s solid.
 * Pure show-time function: no independent timer, data mutation or network IO. */
globalThis.ExSelection=Object.freeze({
 period:4.4,
 value(t,start=0,{reduced=false,manual=false}={}){
  if(reduced||manual||globalThis.ExHold?.enabled===false||t<=start)return 1;
  const phase=((t-start)%4.4+4.4)%4.4;
  if(phase>=2.4)return 1;
  const wave=Math.sin(Math.PI*(phase%.8)/.8);
  return 1-.86*wave*wave;
 },
 svg(el,a,start,active=true){
  if(!el)return;
  el.classList.toggle('selection-pulse',active);
  el.style.setProperty('--selection-alpha',active?this.value(a.t,start,a):1);
 }
});
