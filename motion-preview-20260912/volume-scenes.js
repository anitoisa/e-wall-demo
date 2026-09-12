import * as THREE from 'three';
/* Geometry-only exhibits: every label is in the sibling HTML layer. */
export function buildVolume(s,h){
 const {box,line,ring,material}=h,{group,color,kind}=s,add=fn=>s.updates.push(fn),mix=THREE.MathUtils.lerp;
 const metal='#8199a5',concrete='#b9b4a8',dark='#173747';
 function pipe(parent,pts,c=color,r=.13){const curve=new THREE.CurvePath();for(let i=1;i<pts.length;i++)curve.add(new THREE.LineCurve3(new THREE.Vector3(...pts[i-1]),new THREE.Vector3(...pts[i])));const m=new THREE.Mesh(new THREE.TubeGeometry(curve,160,r,16,false),material(c));parent.add(m);return m;}
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
  add((v,t)=>{const a=Math.min(v,1),b=Math.max(0,v-1);s.bounds.width=28+12*a;s.bounds.height=18;service.position.set(7*a+2*b,-a*2,4*a);service.scale.setScalar(1+.12*b);shell.position.x=-7*a;shell.scale.setScalar(1-.4*b);service.traverse(o=>{if(o.isMesh){o.material.transparent=true;o.material.opacity=.45+.55*a;}});flow.forEach((o,i)=>{o.visible=v>.8;o.position.x=-9+(i*2.8+Math.min(t,6)*1.4)%16;});group.rotation.y=-.25;group.rotation.x=.1;});return true;
 }
 if(kind==='life-s1'){
  s.bounds={width:29,height:15};const oldUnit=new THREE.Group(),newUnit=new THREE.Group();group.add(oldUnit,newUnit);
  box(group,24,.65,10,0,-4,0,dark);for(const z of [-3,3])box(group,23,.2,.25,0,-3.5,z,metal);
  function unit(g,c){box(g,8,5.8,6,0,-.2,0,c);box(g,7.3,5,.3,0,-.2,3.2,'#152b36');for(let i=0;i<8;i++)box(g,6.7,.13,.25,0,1.8-i*.55,3.45,metal);box(g,2,1.1,.25,1.9,2,3.55,color);for(const x of [-3,3])for(const z of [-2.6,2.6])box(g,.45,1,.45,x,-3,z,metal);for(const y of [-1.5,1.5])ring(g,.55,-4.2,y,0,metal,.14).rotation.y=Math.PI/2;}
  // Replace the generic appliance with a removable flanged service pipe.
  function pipeModule(g,c){pipe(g,[[-4.2,0,0],[4.2,0,0]],c,.8);for(const x of [-4.2,4.2]){ring(g,1.1,x,0,0,metal,.18).rotation.y=Math.PI/2;for(let j=0;j<8;j++){const a=j*Math.PI/4;box(g,.3,.22,.22,x,Math.cos(a)*1.08,Math.sin(a)*1.08,'#d5e0e2');}}box(g,2,.1,1.5,0,-1.3,0,metal);}
  pipeModule(oldUnit,'#71818b');pipeModule(newUnit,color);
  for(const side of [-1,1]){pipe(group,[[side*12,0,0],[side*7,0,0]],'#a7c2cf',.8);ring(group,1.1,side*7,0,0,color,.18).rotation.y=Math.PI/2;}
  const couplings=new THREE.Group();group.add(couplings);for(const side of [-1,1]){pipe(couplings,[[side*7,0,0],[side*4.2,0,0]],color,.8);ring(couplings,1.1,side*4.5,0,0,metal,.18).rotation.y=Math.PI/2;}
  const archiveLink=pipe(group,[[4,0,0],[6,0,0],[6,1,0],[9,1,0]],color,.065);
  const archive=new THREE.Group();group.add(archive);for(let i=0;i<3;i++)box(archive,5,.4,4,0,-2+i*.7,0,i===2?color:metal);tick(archive,0,.3,2.2);
  add(v=>{const a=Math.min(v,1),b=Math.max(0,v-1);s.bounds={width:29,height:14};oldUnit.position.set(-a*10,a*5,a*2);oldUnit.visible=a<.99;newUnit.visible=b>.01;newUnit.position.set((1-b)*10,5*(1-b),0);couplings.visible=v<.2||b>.92;archiveLink.visible=b>.65;archive.visible=b>.6;archive.position.set(8,5,0);archive.scale.setScalar(.7+.3*b);group.rotation.y=-.18;group.rotation.x=.08;});return true;
 }
 if(kind==='bim-a'){
  s.bounds={width:34,height:16};const space=new THREE.Group(),systems=new THREE.Group(),history=new THREE.Group();group.add(space,systems,history);
  for(let i=0;i<5;i++){box(space,11,.28,7,0,-5+i*2.35,0,dark,.65);for(const x of [-5,5])for(const z of [-3,3])box(space,.18,2.35,.18,x,-3.8+i*2.35,z,'#94afbc');}
  const route=pipe(systems,[[-4,-4,2],[-4,4,2],[3,4,2],[3,1,-2],[6,1,-2]],color,.2);for(const [x,y,z] of [[-4,-4,2],[-4,4,2],[3,1,-2]])box(systems,.8,.8,.8,x,y,z,'#e4e9e5');
  for(let i=0;i<3;i++){box(history,6,2.5,.55,0,3.5-i*3.4,0,'#325165');box(history,.2,2.5,.6,-2.8,3.5-i*3.4,0,color);tick(history,0,3.5-i*3.4,.4);}
  add(v=>{const a=Math.min(v,1),b=Math.max(0,v-1);s.bounds={width:18+11*a+9*b,height:14+5*a};space.position.x=-9*a-2*b;space.scale.set(1,1,.015+.985*a);systems.position.x=5*a-2*b;systems.visible=v>.02;systems.scale.setScalar(.15+a*1.05);history.position.x=12;history.visible=b>.02;history.scale.setScalar(.1+b*1.15);group.rotation.y=-.17;});return true;
 }
 if(kind==='bim-d'){
  s.bounds={width:28,height:16};const pump=new THREE.Group();group.add(pump);box(pump,17,.8,6,0,-4,0,dark);
  const motor=new THREE.Mesh(new THREE.CylinderGeometry(2.4,2.4,7,64),material(metal));motor.rotation.z=Math.PI/2;motor.position.x=-2;pump.add(motor);
  for(let i=0;i<12;i++){const fin=new THREE.Mesh(new THREE.CylinderGeometry(2.6,2.6,.1,48),material('#476b7c'));fin.rotation.z=Math.PI/2;fin.position.x=-5.2+i*.57;pump.add(fin);}
  const casing=new THREE.Mesh(new THREE.CylinderGeometry(2.9,2.9,2.5,64),material(color));casing.rotation.x=Math.PI/2;casing.position.set(4,0,0);pump.add(casing);
  const front=ring(pump,2.25,4,0,1.3,'#d7e2e3',.14);for(let i=0;i<8;i++){const a=i*Math.PI/4;bolt(pump,4+2.4*Math.cos(a),2.4*Math.sin(a),1.35);}
  box(pump,2.3,2.3,2,-2,3,0,dark);const system=new THREE.Group();group.add(system);pipe(system,[[-12,-1,0],[-9,-1,0],[-9,0,0],[-6,0,0]],'#73bcd3',.4);pipe(system,[[4,2,0],[4,5,0],[12,5,0]],color,.4);
  const dots=Array.from({length:5},(_,i)=>box(system,.35,.35,.35,5+i*1.3,5,.45,'#f0f6f5'));
  add((v,t)=>{const a=Math.min(1,v),b=Math.max(0,v-1);s.bounds={width:22+6*a,height:10+6*a};pump.rotation.y=-.12;pump.scale.setScalar(1.2-.2*a);pump.position.y=-b*.8;system.visible=v>.03;system.scale.setScalar(.3+.7*a);system.position.y=(1-a)*7;dots.forEach((d,i)=>{d.position.x=5+(i*1.5+Math.min(t,7)*1.3)%6;});group.rotation.y=-.12;});return true;
 }
 if(kind==='bim-s1'){
  s.bounds={width:29,height:19};const floors=[];for(let i=0;i<12;i++){const g=box(group,17,.24,8,0,(i-5.5)*1.3,0,i===5?color:dark,.92);for(let c=0;c<3;c++)for(let r=0;r<3;r++)box(g,4.6,.06,2,-5+c*5, .18,-2.5+r*2.5,i===5?'#ffc0b7':'#698393',.55);floors.push(g);}
  add(v=>{const a=Math.min(v,1),b=Math.max(0,v-1);s.bounds={width:29+9*b,height:19};floors.forEach((g,i)=>{const selected=i===5;g.scale.setScalar(selected?1+.15*b:1-.58*b);g.scale.z*=.015+.985*a;g.rotation.x=selected?b*Math.PI/2:0;g.position.y=selected?(i-5.5)*1.3*(1-b):(i-5.5)*1.3*(1-.45*b);g.position.x=selected?7*b:-10*b;g.position.z=selected?4*b:0;});group.rotation.y=-.12;});return true;
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
  add((v,t)=>{const a=Math.min(v,1),b=Math.max(0,v-1);covers.forEach((o,i)=>{o.position.x=(i?1:-1)*(6.35+a*13);o.material.transparent=true;o.material.opacity=1-a*.9;o.visible=a<.99;});pipes.children.forEach(o=>{if(o.name.startsWith('service-pipe-')){o.material.transparent=true;o.material.opacity=o.name==='service-pipe-4'?1:1-b*.72;}});flow.forEach((o,i)=>{o.visible=v>1.05;o.position.x=-10.5+(i*3+Math.min(t,7)*2.2)%21;});marker.visible=v>1.05;marker.scale.setScalar(1+b*.8);device.scale.setScalar(1+b*.55);group.position.y=-selectedY*b;group.rotation.y=-.1;s.bounds.width=31-3*b;});return true;
 }
 return false;
}
