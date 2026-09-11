/* Shared deterministic exhibition fixtures. NOT operational building/health data. */
(function(scope){
 const bands=[{min:80,max:100,color:'#3FB4F0',label:'較接近目標'},{min:60,max:79,color:'#24C8A5',label:'接近目標'},{min:40,max:59,color:'#F0CC55',label:'有差距'},{min:20,max:39,color:'#F29645',label:'差距較大'},{min:0,max:19,color:'#E55C60',label:'優先查看'}];
 const metrics=[
  {id:'temperature',name:'溫度',title:'日照之下，每戶不同',unit:'°C',target:'展示目標 24–26°C',rule:'每偏離 1°C，扣 20 分',limits:[20,32],source:'展演設定，非完整熱舒適標準',pair:['R06-U01','R06-U08']},
  {id:'humidity',name:'濕度',title:'看見濕度的差異',unit:'% RH',target:'參考範圍 30–50% RH',rule:'每偏離 1 個百分點，扣 4 分',limits:[20,80],source:'EPA 範圍參考；扣分為展示算法',pair:['R08-U03','R08-U09']},
  {id:'air',name:'空氣',title:'從 CO₂，觀察通風',unit:'ppm',target:'室內外差值 ≤400 ppm',rule:'超出部分每 8 ppm，扣 1 分',limits:[420,1900],source:'展示設定，不代表完整空氣品質',pair:['R04-U02','R04-U07']},
  {id:'energy',name:'用電',title:'同條件，才好比較',unit:'kWh/m²',target:'比較群中位數＝70 分',rule:'比中位數高 20%，扣 10 分',limits:[0,.7],source:'相對用電觀察，不等於能效認證',pair:['R10-U04','R10-U06']}
 ];
 const fixture={label:'展示情境資料',outdoorCO2:420,date:'2026-09-06',cohort:'相同入住人數、使用時段與日期',people:2,occupiedHours:16,areas:[80,85,95,90,88,75,78,100,105],exposure:[1,.9,.8,.55,.4,.2,.15,.05,.1],rainExposure:[.1,.2,1,.8,.6,.35,.2,.1,.05],airExposure:[.5,1,.8,.65,.4,.35,.05,.2,.1],energyRatio:[.55,.7,.85,2.1,1.15,.65,1.4,1.6,.95],completeExhibitionCohort:true};
 const clamp=x=>Math.max(0,Math.min(100,Math.round(x)));
 const valid=x=>typeof x==='number'&&Number.isFinite(x);
 const distance=(x,a,b)=>x<a?a-x:x>b?x-b:0;
 const median=values=>{const a=values.filter(valid).sort((x,y)=>x-y),n=a.length;return n?n%2?a[(n-1)/2]:(a[n/2-1]+a[n/2])/2:null;};
 function energyBaseline(rows){return median(rows.filter(r=>r.occupied===true&&valid(r.area)&&r.area>0&&valid(r.kwh)&&r.kwh>=0).map(r=>r.kwh/r.area));}
 function score(kind,value,options={}){if(!valid(value))return null;
  if(kind==='temperature')return clamp(100-20*distance(value,24,26));
  if(kind==='humidity')return value<0||value>100?null:clamp(100-4*distance(value,30,50));
  if(kind==='air'){const outdoor=options.outdoor??fixture.outdoorCO2;return !valid(outdoor)||outdoor<0||value<0?null:clamp(100-Math.max(0,value-outdoor-400)/8);}
  if(kind==='energy')return options.occupied!==true||!valid(options.area)||options.area<=0||!valid(options.baseline)||options.baseline<=0||value<0?null:clamp(70-50*(value/options.area/options.baseline-1));
  return null;
 }
 function band(value){return value===null||!valid(value)||value<0||value>100?{min:null,max:null,color:'#677681',label:'資料不足'}:bands.find(b=>value>=b.min&&value<=b.max)||{min:null,max:null,color:'#677681',label:'資料不足'};}
 function rng(seed){let n=seed>>>0;return ()=>{n+=0x6D2B79F5;let t=n;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return ((t^t>>>14)>>>0)/4294967296;};}
 const shuffle=(a,random)=>{a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
 const cache=new Map();
 function scenario(index,seed=20260906){
  const key=index+':'+seed;if(cache.has(key))return cache.get(key);
  const random=rng((seed>>>0)^Math.imul(index+1,0x9e3779b1)),metric=metrics[index],records=[];
  for(let f=1;f<=12;f++)for(let u=1;u<=9;u++){const id=`R${String(f).padStart(2,'0')}-U${String(u).padStart(2,'0')}`;records.push({id,floor:`R${String(f).padStart(2,'0')}`,unit:`U${String(u).padStart(2,'0')}`,f,u,area:fixture.areas[u-1],occupied:true,missing:false});}
  const eligible=records.filter(r=>!r.missing&&(index!==3||r.occupied&&r.area>0));
  const counts=[1+Math.floor(random()*2),1+Math.floor(random()*2),3+Math.floor(random()*2)],count=counts.reduce((a,b)=>a+b,0);let attention=[];
  for(let attempt=0;attempt<100&&attention.length<count;attempt++){attention=[];for(const r of shuffle(eligible,random)){if(attention.every(a=>a.f!==r.f&&a.u!==r.u&&(Math.abs(a.f-r.f)>1||Math.abs(a.u-r.u)>1)))attention.push(r);if(attention.length===count)break;}}
  if(attention.length!==count)throw Error('Unable to distribute attention households');
  const targets=new Map();attention.forEach((r,i)=>targets.set(r.id,i<counts[0]?8+Math.floor(random()*10):i<counts[0]+counts[1]?27+Math.floor(random()*9):45+Math.floor(random()*11)));
  const ordinary=shuffle(eligible.filter(r=>!targets.has(r.id)),random);
  ordinary.forEach((r,i)=>targets.set(r.id,index===3?(i<Math.floor(eligible.length/2)-1?(i<31?84+Math.floor(random()*15):72+Math.floor(random()*8)):i<=Math.floor(eligible.length/2)?70:61+Math.floor(random()*9)):(i%3===0?66+Math.floor(random()*14):84+Math.floor(random()*17))));
  // All 108 households have complete fixtures. The two middle energy ratios are 1.
  for(const r of records){const target=targets.get(r.id)??80;r.temperature=26+(100-target)/20;r.humidity=50+(100-target)/4;r.air=fixture.outdoorCO2+400+(100-target)*8;r.kwh=r.missing?null:(r.area||fixture.areas[r.u-1])*.24*(1+(70-target)/50);}
  const baseline=energyBaseline(records);
  for(const r of records){const input=r.missing?null:index===3?r.kwh:r[metric.id];r.value=index===3?(valid(input)&&r.area>0?input/r.area:null):input;r.score=score(metric.id,input,{area:r.area,occupied:r.occupied,baseline});r.color=band(r.score).color;}
  const selected=[attention[0],ordinary.find(r=>r.f===attention[0].f)||ordinary[0]];
  const result={metric:{...metric,pair:selected.map(r=>r.id)},index,seed:seed>>>0,records,selected,baseline,histogram:bands.map(b=>records.filter(r=>r.score!==null&&r.score>=b.min&&r.score<=b.max).length),missing:records.filter(r=>r.score===null).length,attention:attention.map(r=>r.id)};
  if(cache.size>64)cache.clear();cache.set(key,result);return result;
 }
 function snapshot(index,time=18,seed=20260906){const i=Math.max(0,Math.min(3,index)),t=Math.max(0,Math.min(1,(time-4)/3));return {...scenario(i,seed),progress:t*t*(3-2*t),phase:time<4?'戶別總覽':time<7?'立體揭示':time<12?'位置連結':'紀錄可追溯'};}
 const api={bands,metrics,fixture,score,band,median,energyBaseline,snapshot,valid,scenario};scope.BOS=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(globalThis);
