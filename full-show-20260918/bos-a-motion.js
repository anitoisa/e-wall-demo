// Visual-only pose. Audio, metric data and subtitle clocks remain unchanged.
const smooth=x=>{x=Math.max(0,Math.min(1,x));return x*x*(3-2*x)};
const starts=[11.23,13.78,16.76,20.52];
const angles=[.58,-.6,2.5,Math.PI*2-2.5];
export function bosAPose(chapterTime,index,reduced=false){
 const local=Math.max(0,chapterTime-starts[index]);
 const geometry=reduced||index>0?1:smooth((local-.25)/1.05);
 const turn=reduced?1:smooth((local-(index===0?1:0))/(index===0?1.05:1.2));
 const from=index?angles[index-1]:0;
 return {geometry,angle:from+(angles[index]-from)*turn,
  selection:reduced?1:smooth((local-(index===0?1.65:.3))/.45)};
}
