// Regression: morph retains the article, but replaces its canvas on re-entry.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync('full-show-20260918/full-ending.js','utf8');
async function run(src){
 let canvas={draws:0};
 const title={style:{}},el={dataset:{endingId:'a'},querySelector:s=>s==='canvas'?canvas:title,style:{setProperty(){}},classList:{add(){}}};
 class LetterView{constructor(c){this.canvas=c}draw(){this.canvas.draws++}}
 const code=src.replace(/^import .*\n/,'').replace(/const renderers=.*?await logo.decode\(\);/,'const renderers=new WeakMap(),logo={};').replace(/export /g,'');
 const context={LetterView,LETTERS:{A:{title:'品質'}},endingStages:()=>({}),smooth:x=>x,letterExit:()=>({end:10}),document:{querySelectorAll:()=>[el]}};
 vm.createContext(context);vm.runInContext(code,context);
 context.paint(2,{A:0},false);assert.equal(canvas.draws,1);
 canvas={draws:0};context.paint(2,{A:0},false);
 return canvas.draws;
}
(async()=>{
 assert.equal(await run(source),1,'new canvas must receive the first re-entry frame');
 const old=source.replace('renderers.get(canvas)','renderers.get(el)').replace('renderers.set(canvas,v)','renderers.set(el,v)');
 assert.equal(await run(old),0,'regression reproduces the detached-canvas failure');
 console.log('PASS: old ownership reproduces failure; canvas ownership fixes re-entry');
})().catch(e=>{console.error(e);process.exitCode=1});
