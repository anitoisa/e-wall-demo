import * as THREE from 'three';
/* Geometry-only exhibits: every label is in the sibling HTML layer. */
export function buildVolume(s,h){
 const {box,line,ring,material}=h,{group,color,kind}=s,add=fn=>s.updates.push(fn),mix=THREE.MathUtils.lerp;
 const metal='#8199a5',concrete='#b9b4a8',dark='#173747';
 const smooth=(t,start,duration)=>THREE.MathUtils.smoothstep(t,start,start+duration);
 function pipe(parent,pts,c=color,r=.13){const curve=new THREE.CurvePath();for(let i=1;i<pts.length;i++)curve.add(new THREE.LineCurve3(new THREE.Vector3(...pts[i-1]),new THREE.Vector3(...pts[i])));const m=new THREE.Mesh(new THREE.TubeGeometry(curve,160,r,16,false),material(c));m.userData.curve=curve;parent.add(m);return m;}
 function bolt(parent,x,y,z){const b=new THREE.Mesh(new THREE.CylinderGeometry(.15,.15,.13,6),material('#d2d8d5'));b.rotation.x=Math.PI/2;b.position.set(x,y,z);parent.add(b);}
 function tick(parent,x,y,z){pipe(parent,[[x-.6,y,z],[x-.15,y-.45,z],[x+.7,y+.5,z]],color,.11);}
 if(kind==='idle-s1'){
  s.bounds={width:28,height:16};const shell=new THREE.Group(),service=new THREE.Group();group.add(shell,service);
  // Diagram of separated structure/services; dimensions are illustrative, not an as-built detail.
  box(shell,23,.8,11,0,-5,0,concrete);box(shell,23,.8,11,0,5,0,concrete);
  for(const x of [-10.5,10.5]){box(shell,1.1,10,1.1,x,0,-4.5,metal);box(shell,1.1,10,1.1,x,0,4.5,metal);}
  box(shell,23,1,1,0,4.2,-4.5,metal);box(shell,23,1,1,0,4.2,4.5,metal);
  box(shell,23,8,.22,0,-.2,-5.3,'#294350',.25);
  for(let i=0;i<3;i++){const y=2.8-i*.85,z=1.2+i*1.15;pipe(service,[[-10,y,z],[-5,y,z],[-5,y,4],[8,y,4],[8,-3,4]],i===1?'#b3c9cd':color,.16+i*.035);for(const x of [-8,-2,4]){box(service,.1,1.1,.1,x,3.1,z,metal);ring(service,.29,x,y,z,'#d1e2e7',.06).rotation.y=Math.PI/2;}}
  for(const x of [-7,1,7]){box(service,2.7,.1,4.9,x,1.2,2.1,dark,.7);for(let j=0;j<4;j++)box(service,2.4,.07,.08,x,1.3,.1+j*1.2,metal);}
  const flow=Array.from({length:6},(_,i)=>box(service,.23,.23,.23,-9+i*3,2.8,1.2,'#fff3d6'));
  s.holdTargets=seg=>seg?service.children.filter(o=>o.isMesh).slice(0,1):shell.children.filter(o=>o.isMesh).slice(2,3);
  const routes=service.children.filter(o=>o.userData.curve),smooth=(t,start,duration)=>THREE.MathUtils.smoothstep(t,start,start+duration);
  add((v,t)=>{
   const seg=s.segment,a=seg===0?0:seg===1?smooth(t,.6,3):1,b=seg===2?smooth(t,.6,3):0;
   s.bounds={width:35,height:19};service.position.set(4*a+2*b,-a,4*a);service.scale.setScalar(1+.2*b);shell.position.x=-4*b;shell.scale.setScalar(1-.18*b);
   shell.children.forEach((o,i)=>{const q=seg?1:smooth(t,.15+i*.12,1.2);o.visible=q>.001;o.scale.y=Math.max(.001,q);});
   routes.forEach((o,i)=>{const q=seg?1:smooth(t,1.6+i*.3,1.7);o.geometry.setDrawRange(0,Math.floor(o.geometry.index.count*q/3)*3);});
   service.children.filter(o=>!routes.includes(o)&&!flow.includes(o)).forEach((o,i)=>{const q=seg?1:smooth(t,2+i*.015,1.4);o.visible=q>.01;o.scale.y=Math.max(.01,q);});
   flow.forEach((o,i)=>{const track=i%3,ready=seg>0||t>3.3+track*.3;o.visible=ready;const progress=((t-(3.3+track*.3))*.17+Math.floor(i/3)*.5+10)%1;o.position.copy(routes[track].userData.curve.getPointAt(progress));});
   group.rotation.y=-.25;group.rotation.x=.1;s.sequence={stage:seg,flow:flow.filter(o=>o.visible).length,service:service.position.toArray()};
  });return true;
 }
 if(kind==='life-s1'){
  s.bounds={width:29,height:15};const oldUnit=new THREE.Group(),newUnit=new THREE.Group();group.add(oldUnit,newUnit);
  box(group,24,.65,10,0,-4,0,dark);for(const z of [-3,3])box(group,23,.2,.25,0,-3.5,z,metal);
  function unit(g,c){box(g,8,5.8,6,0,-.2,0,c);box(g,7.3,5,.3,0,-.2,3.2,'#152b36');for(let i=0;i<8;i++)box(g,6.7,.13,.25,0,1.8-i*.55,3.45,metal);box(g,2,1.1,.25,1.9,2,3.55,color);for(const x of [-3,3])for(const z of [-2.6,2.6])box(g,.45,1,.45,x,-3,z,metal);for(const y of [-1.5,1.5])ring(g,.55,-4.2,y,0,metal,.14).rotation.y=Math.PI/2;}
  // Replace the generic appliance with a removable flanged service pipe.
  function pipeModule(g,c){pipe(g,[[-4.2,0,0],[4.2,0,0]],c,.8);for(const x of [-4.2,4.2]){ring(g,1.1,x,0,0,metal,.18).rotation.y=Math.PI/2;for(let j=0;j<8;j++){const a=j*Math.PI/4;box(g,.3,.22,.22,x,Math.cos(a)*1.08,Math.sin(a)*1.08,'#d5e0e2');}}box(g,2,.1,1.5,0,-1.3,0,metal);}
  pipeModule(oldUnit,'#71818b');pipeModule(newUnit,color);
  for(const side of [-1,1]){pipe(group,[[side*12,0,0],[side*7,0,0]],'#a7c2cf',.8);ring(group,1.1,side*7,0,0,color,.18).rotation.y=Math.PI/2;}
  const couplings=new THREE.Group(),connectors=[];group.add(couplings);for(const side of [-1,1]){const end=new THREE.Group();end.position.x=side*7;couplings.add(end);connectors.push(end);pipe(end,[[0,0,0],[-side*2.8,0,0]],color,.8);ring(end,1.1,-side*2.5,0,0,metal,.18).rotation.y=Math.PI/2;}
  const archiveLink=pipe(group,[[-4,0,0],[-6,0,0],[-6,4,0],[-8,4,0]],color,.065);
  const archive=new THREE.Group();group.add(archive);for(let i=0;i<3;i++)box(archive,5,.4,4,0,-2+i*.7,0,i===2?color:metal);tick(archive,0,.3,2.2);
  s.holdTargets=seg=>seg===0?[oldUnit.children[0]]:seg===1?group.children.filter(o=>o.isMesh&&o.geometry.type==='TorusGeometry').slice(0,2):[newUnit.children[0]];
  const smooth=(t,start,duration)=>THREE.MathUtils.smoothstep(t,start,start+duration);
  const fade=(g,q)=>g.traverse(o=>{if(o.isMesh||o.isLineSegments){o.userData.sequenceOpacity??=o.material.opacity;o.material.transparent=true;o.material.opacity=q*o.userData.sequenceOpacity;}});
  add((v,t)=>{
   const seg=s.segment,reduced=matchMedia('(prefers-reduced-motion: reduce)').matches,local=Math.max(0,t-.5);
   // Two clear assembly demonstrations fit one beat; the second result stays readable.
   const cycle=reduced?3.2:s.manualReveal?Math.min(local,3.8):local<5.5?local:Math.min(local-5.5,3.8);
   let seated=smooth(cycle,0,1.8),connection=smooth(cycle,1.8,1);
   if(cycle>3.8)connection=1-smooth(cycle,3.8,.7);
   if(cycle>4.5)seated=1-smooth(cycle,4.5,1);
   const exit=seg===0?0:seg===1?smooth(t,.8,2):1;
   oldUnit.position.set(-exit*9,exit*4,exit*2);oldUnit.visible=seg<2;fade(oldUnit,seg===0?smooth(t,0,1.1):1-exit);
   newUnit.visible=seg===2;newUnit.position.set((1-seated)*9,4*(1-seated),0);fade(newUnit,seg===2?smooth(t,.1,.4):0);
   const coupling=seg===0?smooth(t,1.1,1):seg===1?1-smooth(t,0,.7):connection;
   connectors.forEach(g=>{g.scale.x=Math.max(.001,coupling);fade(g,coupling);});
   const archived=seg===2?smooth(t,3.3,.8):0;archive.visible=archiveLink.visible=archived>0;fade(archive,archived);archiveLink.geometry.setDrawRange(0,Math.floor(archiveLink.geometry.index.count*archived/3)*3);archive.position.set(-8,5,0);archive.scale.setScalar(.8);
   s.bounds={width:31,height:16};group.rotation.y=-.18;group.rotation.x=.08;
   s.sequence={cycle,seated,coupling,archived,position:newUnit.position.toArray()};
  });return true;
 }
 if(kind==='bim-a'){
  s.bounds={width:34,height:16};const space=new THREE.Group(),systems=new THREE.Group(),history=new THREE.Group();group.add(space,systems,history);
  const levels=[];for(let i=0;i<5;i++){const level=new THREE.Group();level.position.y=-5+i*2.35;space.add(level);levels.push(level);box(level,11,.28,7,0,0,0,dark,.85);for(const x of [-5,5])for(const z of [-3,3])box(level,.18,2.35,.18,x,1.2,z,'#94afbc');box(level,10,1.5,.08,0,1.1,-3,'#659caf',.2);for(const x of [-2.5,2.5])box(level,.1,1.5,6,x,1.1,0,'#659caf',.18);}
  const route=pipe(systems,[[-4,-4,2],[-4,4,2],[3,4,2],[3,1,-2],[6,1,-2]],color,.2);for(const [x,y,z] of [[-4,-4,2],[-4,4,2],[3,1,-2]])box(systems,.8,.8,.8,x,y,z,'#e4e9e5');
  for(let i=0;i<3;i++){box(history,6,2.5,.55,0,3.5-i*3.4,0,'#325165');box(history,.2,2.5,.6,-2.8,3.5-i*3.4,0,color);tick(history,0,3.5-i*3.4,.4);}
  s.holdTargets=seg=>seg===0?[levels[3].children[0]]:seg===1?[route]:[history.children[1],history.children[4],history.children[7]];
  const indexLink=pipe(group,[[9,1,-2],[12,1,-2],[12,3.5,0]],color,.12),packet=box(systems,.35,.35,.35,0,0,0,'#fff');
  add((v,t)=>{const seg=s.segment,a=seg===0?0:seg===1?smooth(t,.3,2):1,path=seg===0?0:seg===1?smooth(t,2.1,2.5):1;
   s.bounds={width:34,height:18};space.position.x=-9*a;space.scale.setScalar(1.35-.35*a);
   levels.forEach((level,i)=>{const q=seg?1:smooth(t,i*.45,1.2);level.visible=q>0;level.scale.y=Math.max(.001,q);});
   systems.position.x=3;systems.visible=seg>0;route.geometry.setDrawRange(0,Math.floor(route.geometry.index.count*path/3)*3);
   systems.children.slice(1,-1).forEach((o,i)=>{const q=smooth(path,(i+1)/4-.08,.08);o.scale.setScalar(Math.max(.001,q));});
   packet.visible=path===1&&!s.reduced;packet.position.copy(route.userData.curve.getPointAt(((t* .17)%1+1)%1));
   history.position.x=12;history.visible=seg===2;history.children.forEach((o,i)=>{const q=seg===2?smooth(t,1+Math.floor(i/3)*.55,1.1):0;o.scale.y=Math.max(.001,q);o.visible=q>0;});
   const linked=seg===2?smooth(t,3.3,1.2):0;indexLink.geometry.setDrawRange(0,Math.floor(indexLink.geometry.index.count*linked/3)*3);group.rotation.y=-.22;
   s.sequence={space:a,system:path,index:linked};
  });return true;
 }
 if(kind==='bim-d'){
  s.bounds={width:28,height:16};const pump=new THREE.Group();group.add(pump);box(pump,17,.8,6,0,-4,0,dark);
  const motor=new THREE.Mesh(new THREE.CylinderGeometry(2.4,2.4,7,64),material(metal));motor.rotation.z=Math.PI/2;motor.position.x=-2;pump.add(motor);
  for(let i=0;i<12;i++){const fin=new THREE.Mesh(new THREE.CylinderGeometry(2.6,2.6,.1,48),material('#476b7c'));fin.rotation.z=Math.PI/2;fin.position.x=-5.2+i*.57;pump.add(fin);}
  const casing=new THREE.Mesh(new THREE.CylinderGeometry(2.9,2.9,2.5,64),material(color));casing.rotation.x=Math.PI/2;casing.position.set(4,0,0);pump.add(casing);
  const front=ring(pump,2.25,4,0,1.3,'#d7e2e3',.14);for(let i=0;i<8;i++){const a=i*Math.PI/4;bolt(pump,4+2.4*Math.cos(a),2.4*Math.sin(a),1.35);}
  box(pump,2.3,2.3,2,-2,3,0,dark);const system=new THREE.Group();group.add(system);pipe(system,[[-12,-1,0],[-9,-1,0],[-9,0,0],[-6,0,0]],'#73bcd3',.4);pipe(system,[[4,2,0],[4,5,0],[12,5,0]],color,.4);
  const dots=Array.from({length:5},(_,i)=>box(system,.35,.35,.35,5+i*1.3,5,.45,'#f0f6f5'));
  s.holdTargets=seg=>seg===0?[casing]:seg===1?[system.children[0],system.children[1]]:[casing];
  const inlet=system.children[0],outlet=system.children[1];
  add((v,t)=>{const seg=s.segment,established=seg?1:smooth(t,.3,1.1),spread=seg===0?0:seg===1?smooth(t,.3,1.2):1,information=seg===2?smooth(t,.3,1.2):0;
   s.bounds={width:26,height:17};pump.rotation.y=-.12;pump.scale.setScalar((1.2-.2*spread)*established);pump.position.y=0;system.visible=seg>0;
   const input=seg===1?smooth(t,1.5,1.2):seg===2?1:0,output=seg===1?smooth(t,2.9,1.2):seg===2?1:0;
   [inlet,outlet].forEach((p,i)=>p.geometry.setDrawRange(0,Math.floor(p.geometry.index.count*(i?output:input)/3)*3));
   dots.forEach((d,i)=>{d.visible=output===1&&!s.reduced;d.position.copy(outlet.userData.curve.getPointAt(((i*.2+t*.16)%1+1)%1));});
   group.scale.setScalar(1);group.rotation.y=-.12;group.position.x=-information;s.sequence={established,input,output,information};
  });return true;
 }
 if(kind==='bim-s1'){
  s.bounds={width:29,height:19};const floors=[];for(let i=0;i<12;i++){const g=box(group,17,.24,8,0,(i-5.5)*1.3,0,i===5?color:dark,.92);for(let c=0;c<3;c++)for(let r=0;r<3;r++)box(g,4.6,.06,2,-5+c*5, .18,-2.5+r*2.5,i===5?'#ffc0b7':'#698393',.55);floors.push(g);}
  s.holdTargets=()=>[floors[5]];
  const selectionEdge=floors[5].children.find(o=>o.isLineSegments);selectionEdge.material.color.set('#ffffff');
  add((v,t)=>{const seg=s.segment,a=seg===0?0:seg===1?smooth(t,.5,2.5):1,b=seg===2?smooth(t,.7,2):0,tilt=seg===2?smooth(t,2.7,2):0;
   s.bounds={width:39,height:20};floors.forEach((g,i)=>{const selected=i===5,q=seg?1:smooth(t,.3+i*.16,.9);g.visible=q>0;g.scale.setScalar((selected?1:1-.35*b)*q);g.scale.z*=.14+.86*a;g.rotation.x=selected?tilt*Math.PI/2:0;g.position.y=(i-5.5)*1.3*(selected?1-b:1);g.position.x=selected?9*b:-9*b;g.position.z=selected?3*b:0;});group.rotation.y=-.12;s.sequence={stack:a,extraction:b,plan:tilt};
   selectionEdge.material.opacity=ExSelection.value(t,[3.1,3,4.7][seg],{reduced:s.reduced,manual:s.manualReveal});
  });return true;
 }
 if(kind==='bim-s4'){
  s.bounds={width:31,height:16};box(group,25,11,.9,0,0,-2.8,dark);const pipes=new THREE.Group();group.add(pipes);
  s.pipeCount=8;s.demonstrationPipe=4;const selectedY=4.2-3*1.2;
  for(const x of [-8,0,8])box(pipes,.18,10,.22,x,0,-.55,'#506975');
  for(let i=0;i<8;i++){const y=4.2-i*1.2,c=i===3?color:'#7696a8';const route=pipe(pipes,[[-11,y,0],[11,y,0]],c,i===3?.2:.16);route.name='service-pipe-'+(i+1);for(const x of [-8,0,8])ring(pipes,.3,x,y,0,'#c4d2d7',.055).rotation.y=Math.PI/2;}
  const covers=[box(group,13,11,1,-6.35,0,1.1,concrete),box(group,13,11,1,6.35,0,1.1,concrete)];
  const device=box(group,1.4,.75,.85,11,selectedY,0,'#93b7c6'),marker=ring(group,.66,11,selectedY,.6,color,.08);
  const flow=Array.from({length:7},(_,i)=>box(group,.33,.15,.15,-10+i*3,selectedY,.23,'#fff'));
  flow.forEach((o,i)=>o.name='flow-04-'+i);
  s.holdCovers=covers;
  s.holdTargets=seg=>seg===0?[]:seg===1?[pipes.children.find(o=>o.name==='service-pipe-4')]:[marker];
  add((v,t)=>{const seg=s.segment,a=seg===0?0:seg===1?smooth(t,.5,2):1,b=seg===2?smooth(t,.5,1.8):0,path=seg===0?0:seg===1?smooth(t,2.6,1.5):1;
   covers.forEach((o,i)=>{o.position.x=(i?1:-1)*(6.35+a*13);o.material.transparent=true;o.material.opacity=1-a;o.material.depthWrite=o.material.opacity>.985;o.visible=a<1;});
   pipes.children.forEach(o=>{if(o.name.startsWith('service-pipe-')){const chosen=o.name==='service-pipe-4';o.material.transparent=true;o.material.opacity=chosen?1:1-b*.55;if(chosen)o.geometry.setDrawRange(0,Math.floor(o.geometry.index.count*path/3)*3);}});
   flow.forEach((o,i)=>{o.visible=path===1&&!s.reduced;o.position.x=-10.5+(i*3+(t+seg*12)*1.7)%21;});const full=globalThis.showcaseState?.narration?.version==='anlb-full-wall-candidate-20260918';marker.visible=path===1&&(!full||globalThis.showcaseState.waterRouteReady);marker.scale.setScalar(1+b*.65);device.scale.setScalar(1+b*.35);group.position.y=-selectedY*b;group.rotation.y=-.1;s.bounds.width=31-2*b;s.sequence={cover:a,path,selected:4,pipes:8};
  });return true;
 }
 return false;
}
