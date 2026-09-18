/* Per-exhibit causal scores. Called by the existing shared-clock renderer, never by a private timer. */
globalThis.ExSequence=(()=>{
 const handlers={},clamp=x=>Math.max(0,Math.min(1,x)),ease=x=>{x=clamp(x);return x*x*(3-2*x)};
 const op=(el,q)=>{if(el)el.style.opacity=String(clamp(q));};
 const trace=(el,q)=>{if(!el)return;el.setAttribute('pathLength','1');el.style.strokeDasharray='1';el.style.strokeDashoffset=String(1-clamp(q));};
 const all=(el,sel)=>[...el.querySelectorAll(sel)];
 const icon=(el,t,a,repeat=false,loopAt)=>{if(el){op(el,1);globalThis.ExHold?.stagedIcon(el,t,{repeat:repeat&&!a.manual&&globalThis.ExHold.enabled,reduced:a.reduced,loopAt});}};
 const focus=(el,on)=>{if(el){el.classList.toggle('attention-focus',on);el.style.filter='none';}};
 const deviceMarkup=globalThis.deviceDetails;
 globalThis.deviceDetails=seg=>deviceMarkup(seg)+'<svg class="device-data-link" viewBox="0 0 1740 650" aria-hidden="true"><path d="M740 330H855V145H905"/></svg>';
 const signalMarkup=globalThis.bosSignals;
 globalThis.bosSignals=seg=>signalMarkup(seg).replace('<rect class="bos-hub"',`<path class="signal-packet" pathLength="1" d="M${200+seg*440} 210C${200+seg*440} 370 870 250 870 435"/><rect class="bos-hub"`);
 handlers['idle:s2']=(el,a)=>{
  const t=a.reduced?30:a.t,s=a.segment;
  const document=el.querySelector('.motion-document');trace(document,s?1:ease(t/1.3));
  all(el,'[data-enter]').forEach((row,i)=>{row.style.transform='none';op(row,s?1:ease((t-1.3-i*.6)/.6));const tick=row.querySelector('[data-tick]');trace(tick,s===0?0:s===1?ease((t-1.3-i*.85)/.8):1);focus(tick,s===1&&t>=1.3+i*.85&&t<2.6+i*.85);});
  icon(el.querySelector('.ex-art>g>.art-icon .icon'),s?5:t,a);
  const link=el.querySelector('.document-return');
  op(link,s===2?1:0);trace(link,ease((t-.8)/2));
  const saved=el.querySelector('[data-reveal-stage="2"]');op(saved,s===2?ease((t-2.8)/.8):0);
  if(saved)icon(saved.querySelector('.icon'),t-2.8,a,true);
  focus(document,s===2&&t>2.8);
 };
 handlers['idle:s3']=(el,a)=>{
  const s=a.segment,t=a.reduced?30:a.t;
  all(el,'[data-info-node]').forEach((node,i)=>{op(node,i>s?0:i<s?.65:1);icon(node.querySelector('.icon'),i<s?3:t-.5,a,i===s&&t>5.5);op(node.querySelector('text'),i<s?1:i>s?0:ease((t-4.5)/.8));focus(node.querySelector('text'),i===s&&t>=4.5);});
  all(el,'[data-info-link]').forEach((g,i)=>{const q=i<s?1:i>s?0:ease((t-3)/1.5);op(g,i>s?0:1);op(g.firstElementChild,q);trace(g.lastElementChild,q);if(i===s&&t>5.5&&!a.reduced){g.lastElementChild.style.strokeDasharray='.13 .87';g.lastElementChild.style.strokeDashoffset=String(-(t-5.5)*.23);}});
  trace(el.querySelector('.info-volume'),s?1:ease(t/1.3));
 };
 handlers['idle:s4']=(el,a)=>{
  const s=a.segment,t=a.reduced?30:a.t,q=ease((t-.6)/2.4),build=el.querySelector('[data-cut-building]'),device=el.querySelector('[data-cut-device]'),record=el.querySelector('[data-cut-record]');
  const from=s===0?[510,20,.95]:s===1?[510,20,.95]:[35,110,.68],to=s===0?from:[35,110,.68],pose=from.map((v,i)=>v+(to[i]-v)*q);
  build.setAttribute('transform',`translate(${pose[0]} ${pose[1]}) scale(${pose[2]})`);
  all(build,'[data-cut-slab]').forEach((g,i)=>{const r=s?1:ease((t-i*.5)/1.2);op(g,r);g.setAttribute('transform',`translate(0 ${Number(g.dataset.cutSlab)*110+(1-r)*45})`);});
  const d0=s===0?[800,305,.36]:s===1?[800,305,.36]:[770,185,1.15],d1=s===0?d0:s===1?[770,185,1.15]:[725,230,.8],dp=d0.map((v,i)=>v+(d1[i]-v)*q);
  device.setAttribute('transform',`translate(${dp[0]} ${dp[1]}) scale(${dp[2]})`);op(device,s?1:ease((t-2)/.7));icon(device.querySelector('.icon'),s===0?t-2:t+3,a,s>0,8);
  op(device.querySelector('text'),s===0?0:s===1?ease((t-3.2)/.7):1);
  trace(el.querySelector('[data-cut-link="0"]'),s===0?0:s===1?ease((t-2.7)/.8):1);
  trace(el.querySelector('[data-cut-link="1"]'),s===2?ease((t-2.5)/1):0);
  op(record,s===2?ease((t-3.5)/.7):0);icon(record.querySelector('.icon'),t-3.5,a,t>7);
  focus(record.querySelector('.motion-document'),s===2&&t>4.2);
 };
 handlers['life:c']=(el,a)=>{
  const t=a.reduced?30:a.t,s=a.segment;
  all(el,'[data-ring]').forEach(g=>{
   const i=Number(g.dataset.ring),r=155+i*65,y=85+i*195,q=i<s?1:i>s?0:ease((t-4.3)/Math.max(1,a.duration-5.3));
   op(g,i>s?0:1);trace(g.querySelector('.history-orbit'),q);
   all(g,'[data-ring-mark]').forEach(n=>op(n,Math.max(0,Math.min(1,(q*24-Number(n.dataset.ringMark))*2))));
   const leader=g.querySelector('.history-leader');leader.setAttribute('d',`M1010 ${y+40}H${800+i*45}V310H${440+r}`);trace(leader,i<s?1:i>s?0:ease((t-3)/1.3));
   icon(g.querySelector('.icon'),i<s?3:t,a,false);
   all(g,'.history-caption text').forEach(n=>op(n,i<s?1:i>s?0:ease((t-4.3)/.8)));
   const dot=g.querySelector('.history-packet'),angle=(q===1?((Date.now()/1000+i*2)%10)/10:q)*Math.PI*2-Math.PI/2;dot.setAttribute('cx',440+Math.cos(angle)*r);dot.setAttribute('cy',310+Math.sin(angle)*r);op(dot,i===s&&q>0&&!a.reduced?1:0);
   focus(g.querySelector('.history-orbit'),i===s);focus(g.querySelector('.history-caption .large'),i===s&&t>3.3);
  });
 };
 handlers['life:s2']=(el,a)=>{
  const s=a.segment,t=a.reduced?30:a.t,groups=all(el,'[data-motion-poses]');
  const compact=s===2?ease((t-.3)/2):0;
  groups[0].setAttribute('transform',`translate(${220*(1-compact)} ${5+65*compact}) scale(${1.28-.36*compact})`);op(groups[0],1);
  all(groups[0],'[data-enter]').forEach((g,i)=>{
   g.style.transform='none';op(g,1);trace(g.querySelector('.motion-document'),s?1:ease((t-.4-i*.35)/1));
   const icons=all(g,'.icon');icon(icons[0],s?3:t-.4-i*.35,a,s===0&&t>5);
   op(g.querySelector('text'),s?1:ease((t-2.8-i*.35)/.5));
   const pair=g.querySelector('[data-evidence-pair]');op(pair,s?1:0);
   icons.slice(1).forEach((ic,j)=>icon(ic,s===1?t-.6-i*.7-j*.35:s===2?4:-1,a,false));
   all(pair,'text').forEach(n=>op(n,s===2?1:s===1?ease((t-3.4-i*.7)/.5):0));
   focus(g.querySelector('.motion-document'),s===2&&i===2);
  });
  groups[1].setAttribute('transform','translate(1110 75)');op(groups[1],s===2?ease((t-3.2)/.8):0);
  icon(groups[1].querySelector('.icon'),t-3.2,a,t>7);
  const link=el.querySelector('[data-reveal-stage="2"]');op(link,s===2?1:0);trace(link?.querySelector('path'),ease((t-1.5)/1.7));
  focus(groups[1].querySelector('.motion-document'),s===2&&t>4);
 };
 handlers['life:s3']=(el,a)=>{
  const s=a.segment,t=a.reduced?30:a.t;
  op(el.querySelector('.record-pump'),s?1:ease(t/1.3));trace(el.querySelector('.record-connector'),s?1:ease((t-1.5)/1.1));
  all(el,'[data-record-stage]').forEach(g=>{const i=Number(g.dataset.recordStage);g.style.clipPath='none';op(g,i>s?0:i<s?1:i===0?ease((t-2.6)/.8):1);
   all(g,'.icon').forEach((svg,j)=>icon(svg,i<s?3:t-(i===0?2.6:.7+j*.45),a,i===s&&t>6));
   all(g,'text').forEach(n=>op(n,i<s?1:i>s?0:ease((t-(i===0?5.3:4))/.7)));
   if(i===2){trace(g.querySelector('.record-tab'),i===s?ease((t-.5)/1.4):1);focus(g.querySelector('.record-tab'),s===2);}
  });
  const flow=el.querySelector('.pump-flow');op(flow,s>0?1:0);flow.style.strokeDashoffset=String(-t*.12);
 };
 handlers['life:s4']=(el,a)=>{
  const s=a.segment,t=a.reduced?30:a.t;
  all(el,'[data-service-row]').forEach((row,i)=>{
   op(row,1);const local=t-.5-i*.5,y=105+i*200,parts=[`M485 ${y}H560`,`M860 ${y}H970`,`M1270 ${y}H1390`],lengths=[75,110,120];
   row.querySelector('.service-rail').setAttribute('d',parts.join(' '));
   const line=row.querySelector('.service-trail'),prior=lengths.slice(0,s).reduce((x,y)=>x+y,0),q=ease((local-3)/1);
   line.setAttribute('d',parts.slice(0,s+1).join(' '));trace(line,(prior+lengths[s]*q)/(prior+lengths[s]));
   icon(row.querySelector(':scope>.art-icon .icon'),s?3:local,a,false);
   all(row,'[data-service-event]').forEach(g=>{const k=Number(g.dataset.serviceEvent);op(g,k>s?.12:1);
    icon(g.querySelector('.icon'),k<s?3:k>s?-2:local,a,k===s&&s>0&&local>6);
    all(g,'text').forEach(n=>op(n,k<s?1:k>s?0:ease((local-4)/.65)));
    focus(g.querySelector('.service-event'),k===s&&local>0);g.querySelector('.service-event').style.fillOpacity=k===s?'.28':'.1';
   });
   const dot=row.querySelector('.service-packet');op(dot,q===1&&!a.reduced?.9:0);
   if(q===1){const starts=[485,860,1270],p=((local-4)*.22)%1;dot.setAttribute('cx',starts[s]+lengths[s]*Math.max(0,p));}
  });
 };
 handlers['bim:a']=(el,a)=>{
  const t=a.reduced?30:a.t,s=a.segment;
  all(el,'.layer-labels>div').forEach((g,i)=>{op(g,i<s?1:i>s?0:ease((t-[3.4,4.6,4.5][s])/.7));g.style.filter='none';g.style.borderColor=i===s?'var(--accent)':'';});
 };
 handlers['bim:c']=(el,a)=>{
  const t=a.reduced?30:a.t,s=a.segment,groups=all(el,'[data-motion-poses]'),tower=groups[0],plan=groups[1],q=s===1?ease((t-1)/2):s===2?1:0;
  tower.setAttribute('transform',`translate(${440-410*q} ${10+85*q}) scale(${.92-.24*q})`);op(tower,1);
  all(tower,'[data-spatial-floor]').forEach((g,i)=>op(g,s?1:ease((t-(11-i)*.12)/1)));
  const scan=tower.querySelector('.space-scan');scan.setAttribute('y','288');trace(scan,s?1:ease((t-2.5)/1));op(scan,1);focus(scan,true);op(tower.querySelector('text'),s?1:ease((t-3.5)/.7));
  plan.setAttribute('transform','translate(660 35) scale(.92)');op(plan,s===0?0:s===1?ease((t-2.7)/1):1);
  all(plan,'.room-detail').forEach(n=>op(n,s===2?.35:1));focus(plan.querySelector('.selected-space'),s===2);
  const branch=el.querySelector(':scope .ex-art>g[data-reveal-stage="1"]');op(branch,s?1:0);trace(branch?.querySelector('path'),s===2?1:ease((t-2)/1));
  trace(plan.querySelector('.space-route'),s===2?ease((t-1.8)/1.8):0);
  const found=plan.querySelector('[data-reveal-stage="2"]');op(found,s===2?1:0);trace(found.querySelector('.device-halo'),ease((t-.4)/1.1));
  icon(found.querySelector('.icon'),t-3.6,a,t>7);op(found.querySelector('text'),s===2?ease((t-6.4)/.7):0);focus(found.querySelector('.device-halo'),s===2);
 };
 handlers['bim:s1']=(el,a)=>{
  const t=a.reduced?30:a.t,s=a.segment;
  all(el,'.floor-index>span').forEach((n,i)=>op(n,s?1:ease((t-.3-(11-i)*.16)/.9)));
  op(el.querySelector('.edge-label'),ease((t-[3.1,3.4,4.7][s])/.7));
 };
 handlers['bim:s2']=(el,a)=>{
  const s=a.segment,t=a.reduced?30:a.t,nodes=all(el,'[data-route-node]'),paths=all(el,'[data-route]');
  nodes.forEach((g,i)=>{const start=i===0?.5:i===1?2:i===2?5.9:6.5;op(g,s===0&&i>0?0:s===2&&i===3?.3:1);icon(g.querySelector('.icon'),s===0?t-.5:s===1&&i>0?t-start:s===2&&i===1?t+3:3,a,s===2&&i===1,8.5);op(g.querySelector('text'),s===0?ease((t-3.3)/.6):s===1&&i>0?ease((t-start-2.8)/.6):1);});
  paths.forEach((p,i)=>{trace(p,s===0?0:s===1?ease((t-[1,4.8,5.4][i])/[1,1.1,1.1][i]):1);op(p,s===2&&i===2?.25:1);});
  const f=el.querySelector('.route-focus');op(f,s===2?ease((t-.5)/1):0);f.style.strokeDasharray='none';f.style.strokeWidth='7';
  const dot=el.querySelector('.route-packet');op(dot,s>0&&t>8.5&&!a.reduced?1:0);
  if(s>0){const index=s===2?Math.floor(t/2)%2:Math.floor(t/2)%3,path=paths[index];if(path&&dot){const p=path.getPointAtLength(path.getTotalLength()*((t%2)/2));dot.setAttribute('cx',p.x);dot.setAttribute('cy',p.y);}}
 };
 handlers['bim:s3']=(el,a)=>{
  const t=a.reduced?30:a.t,s=a.segment,aside=el.querySelector('.review-equipment'),arrival=[1.5,4.1,2.8][s];op(aside,1);
  all(aside,':scope>span,:scope>h2').forEach(n=>op(n,s?1:ease((t-arrival)/.6)));
  op(aside.querySelector('h3'),ease((t-arrival)/.6));
  all(aside,'section').forEach((n,i)=>{op(n,ease((t-arrival-.6-i*.45)/.65));n.style.borderColor=s===2&&i===1?'var(--accent)':'';});
  op(aside.querySelector('p'),ease((t-arrival-2)/.6));
  aside.style.borderLeftWidth=s===2?'6px':'2px';
  const link=el.querySelector('.device-data-link');op(link,s===2?1:0);trace(link?.querySelector('path'),ease((t-1.3)/1.5));
 };
 handlers['bim:s4']=(el,a)=>{const t=a.reduced?30:a.t;op(el.querySelector('.edge-label'),ease((t-[1.5,4.1,2.3][a.segment])/.7));};
 handlers['data:a']=(el,a)=>{icon(el.querySelector('.metric-symbol .icon'),a.t-.4,a,true,11.6);};
 handlers['data:c']=(el,a)=>{
  const t=a.reduced?30:a.t,s=a.segment;
  all(el,'.ex-art>g.current,.ex-art>g.muted').forEach(g=>{const current=g.classList.contains('current');icon(g.querySelector('.icon'),current?t-.4:3,a,current);op(g.querySelector('text'),current?ease((t-2.8)/.6):1);});
  all(el,'.art-wire').forEach((p,i)=>{trace(p,i===s?ease((t-3.2)/2):1);p.style.strokeWidth=i===s?'6':'2';});
  focus(el.querySelector('.bos-hub'),t>=5.2);
  const packet=el.querySelector('.signal-packet');op(packet,t>=6&&!a.reduced?1:0);packet.style.strokeDasharray='.12 .88';packet.style.strokeDashoffset=String(-(t-6)*.2);
 };
 handlers['data:s1']=(el,a)=>{
  const t=a.reduced?30:a.t,symbol=el.querySelector('.raw-symbol');symbol.style.transform='none';icon(symbol.querySelector('.icon'),t-.5,a,true,8);
  op(symbol.querySelector('strong'),ease((t-2.8)/.6));
  all(el,'.raw-row').forEach((row,i)=>{op(row,ease((t-3.5-i*1.7)/.8));row.style.transform='none';row.style.borderBottomColor=t>=3.5+i*1.7&&t<5.2+i*1.7?'var(--accent)':'';row.style.borderBottomWidth='3px';});
 };
 handlers['data:s2']=(el,a)=>{
  const t=a.reduced?30:a.t,p=clamp((t-1)/5);
  all(el,'.proportion-donut [data-band-count]').forEach(c=>{
   const count=Number(c.dataset.bandCount),offset=Number(c.dataset.bandOffset),length=Math.min(count,Math.max(0,108*p-offset));
   c.setAttribute('stroke-dasharray',`${length} 108`);
  });
  all(el,'.ex-art>text,.ex-art>rect,.distribution-base').forEach(n=>op(n,ease((t-6.1)/.9)));
  // Fixed angular geometry: reveal the measured arcs, never spin or restart them.
  el.querySelector('.proportion-donut').style.opacity='1';
 };
 handlers['data:s3']=(el,a)=>{
  const t=a.reduced?30:a.t,selectedColumns=new Set();
  all(el,'.matrix-floor').forEach(row=>{
   row.style.opacity='1';row.style.transform='none';let selected=false;
   all(row,'.house-cell').forEach((c,i)=>{
    const chosen=c.classList.contains('chosen'),q=chosen?ease((t-7)/.8):0;
    c.style.background='var(--house-color)';c.style.transform='none';
    const border=q*globalThis.ExSelection.value(a.t,7.8,a);
    c.style.borderColor=c.style.outlineColor=`rgba(255,255,255,${border})`;
    op(c.querySelector('span'),q);if(chosen){selected=true;selectedColumns.add(i);}
   });
   const label=row.querySelector(':scope>b');label.style.color=selected&&t>=8?'#fff':'';label.style.fontWeight=selected&&t>=8?'700':'';
  });
  all(el,'.matrix-axis>b').forEach((n,i)=>{n.style.color=selectedColumns.has(i)&&t>=8.5?'#fff':'';n.style.fontWeight=selectedColumns.has(i)&&t>=8.5?'700':'';});
 };
 handlers['data:s4']=(el,a)=>{
  const t=a.reduced?30:a.t,reading=el.querySelector('.causal-reading'),rule=el.querySelector('.causal-rule'),score=el.querySelector('.causal-score'),record=el.querySelector('.score-record-line');
  [reading,rule,score].forEach(n=>n.style.transform='none');op(reading,1);
  icon(reading.querySelector('.icon'),t-.5,a,true,12);
  all(reading,':scope>span,:scope>strong').forEach(n=>op(n,ease((t-3.2)/.6)));
  all(el,'.causal-arrow').forEach((n,i)=>{const q=ease((t-(i?6.8:3.8))/.7);op(n,q);n.style.clipPath=`inset(0 ${(1-q)*100}% 0 0)`;});
  op(rule,ease((t-4.5)/1));op(score,ease((t-7.5)/1));
  op(record,ease((t-9)/.6));icon(record.querySelector('.icon'),t-9,a,false);
  all(record,'span,small').forEach(n=>op(n,ease((t-11.6)/.7)));
 };
 return {handlers,op,trace,all,icon,focus,ease,
  owns(mode,id){return !!handlers[mode+':'+id];},
  render(el,a){
   const key=a.mode+':'+el.dataset.id,fn=handlers[key];if(!fn)return false;fn(el,a);
   // Explicit selected frames only. Never pulse a parent group, fill or text.
   all(el,'.selection-pulse').forEach(n=>globalThis.ExSelection.svg(n,a,0,false));
   all(el,'.selection-border').forEach(n=>n.classList.remove('selection-border'));
   const pulse=(selector,start,on=true)=>all(el,selector).forEach(n=>globalThis.ExSelection.svg(n,a,start,on));
   const border=(n,start)=>{if(n){n.classList.add('selection-border');n.style.setProperty('--selection-alpha',globalThis.ExSelection.value(a.t,start,a));}};
   if(key==='idle:s4')pulse('[data-cut-record] .motion-document',4.2,a.segment===2);
   if(key==='life:s2')pulse('.motion-document.attention-focus',4,a.segment===2);
   if(key==='life:s3')pulse('.record-tab',4.7,a.segment===2);
   if(key==='life:s4')all(el,'[data-service-row]').forEach((row,i)=>all(row,'[data-service-event]').forEach(g=>globalThis.ExSelection.svg(g.querySelector('.service-event'),a,5.15+i*.5,Number(g.dataset.serviceEvent)===a.segment)));
   if(key==='bim:c'){
    pulse('.space-scan',a.segment?0:3.5);
    pulse('.selected-space',1.5,a.segment===2);
    pulse('.device-halo',7.1,a.segment===2);
   }
   if(key==='bim:s2')pulse('.route-focus',1.5,a.segment===2);
   if(key==='bim:a')border(all(el,'.layer-labels>div')[a.segment],[4.1,5.3,5.2][a.segment]);
   if(key==='bim:s3'&&a.segment===2)border(all(el,'.review-equipment section')[1],4.5);
   el.dataset.sequenceTime=a.t.toFixed(2);return true;
  },
  diagnostics(){return [...document.querySelectorAll('[data-sequence-time]')].map(el=>({id:el.dataset.id,time:+el.dataset.sequenceTime}));}
 };
})();
