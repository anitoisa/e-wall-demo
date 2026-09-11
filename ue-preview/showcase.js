import * as THREE from 'three';
import {FBXLoader} from 'three/addons/loaders/FBXLoader.js';
import {buildVolume} from './volume-scenes.js?v=content-motion-20260911';
await document.fonts.ready;

// One renderer per page, independent persistent scenes, clipped to each panel.
const canvas=document.createElement('canvas');canvas.id='showcase-canvas';canvas.setAttribute('aria-hidden','true');document.body.appendChild(canvas);
let renderer,contextLost=false;
try{renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true});}catch(error){document.querySelectorAll('.show-loading').forEach(el=>el.textContent='3D 顯示無法啟動，請確認 WebGL');throw error;}
renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setClearColor(0,0);renderer.outputColorSpace=THREE.SRGBColorSpace;
const scenes=new Map(),basic=c=>new THREE.MeshBasicMaterial({color:c}),mix=THREE.MathUtils.lerp,clamp=THREE.MathUtils.clamp,ease=x=>{x=clamp(x,0,1);return x*x*(3-2*x);};
const white='#e4f3fa',steel='#203d50';
let modelPromise,modelLoads=0,lastState=null,lastKey='',lastTick=performance.now(),transitionStart=0,rendererFrames=0,lastRender=0;
function material(color,alpha=1){return new THREE.MeshStandardMaterial({color,roughness:.3,metalness:.35,transparent:alpha<1,opacity:alpha});}
function box(parent,w,h,d,x,y,z,color,alpha=1){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material(color,alpha));m.position.set(x,y,z);parent.add(m);const edges=new THREE.LineSegments(new THREE.EdgesGeometry(m.geometry),new THREE.LineBasicMaterial({color:color===steel?'#7295a7':white,transparent:true,opacity:.28}));m.add(edges);return m;}
function line(parent,pts,color,width=.055){const curve=new THREE.CatmullRomCurve3(pts.map(p=>new THREE.Vector3(...p)));const m=new THREE.Mesh(new THREE.TubeGeometry(curve,32,width,5,false),basic(color));parent.add(m);return m;}
function ring(parent,r,x,y,z,color,tube=.08){const m=new THREE.Mesh(new THREE.TorusGeometry(r,tube,8,80),material(color));m.position.set(x,y,z);parent.add(m);return m;}
function sphere(parent,r,x,y,z,color){const m=new THREE.Mesh(new THREE.SphereGeometry(r,24,16),material(color));m.position.set(x,y,z);parent.add(m);return m;}
function makeScene(kind){
 const scene=new THREE.Scene(),group=new THREE.Group();scene.add(group);scene.add(new THREE.HemisphereLight(0xe8f6ff,0x102536,2.1));const key=new THREE.DirectionalLight(0xffffff,3);key.position.set(-12,22,25);scene.add(key);const rim=new THREE.DirectionalLight(kind.startsWith('life')?0xffa61a:kind.startsWith('bim')?0xff604e:0x4fbceb,2);rim.position.set(15,6,-12);scene.add(rim);
 const color=kind.startsWith('life')?'#FFA61A':kind.startsWith('bim')?'#FF5545':'#3FB4F0',camera=new THREE.OrthographicCamera(-16,16,7,-7,.1,1000);camera.position.set(0,0,50);camera.lookAt(0,0,0);
 const s={kind,scene,group,camera,color,ready:true,updates:[],stage:0,pose:0,seed:null,segment:-1,bounds:{width:30,height:13},count:0};
 const shadow=new THREE.Mesh(new THREE.CircleGeometry(13,80),new THREE.MeshBasicMaterial({color:'#02080d',transparent:true,opacity:.55}));shadow.rotation.x=-Math.PI/2;shadow.scale.y=.45;shadow.position.y=-5.4;shadow.position.z=-1;group.add(shadow);
 const floor=ring(group,12,0,-5.35,-1,color,.035);floor.rotation.x=-Math.PI/2;floor.scale.y=.4;
 shadow.visible=floor.visible=false;
 if(buildVolume(s,{box,line,ring,material})){scene.updateMatrixWorld(true);return s;}
 const add=fn=>s.updates.push(fn);
 if(kind==='data-a'){
  shadow.visible=floor.visible=false;s.ready=false;s.bounds={width:90,height:83};s.units=[];s.structures=[];s.geometryProgress=-1;
  const selections=[0,1].map(()=>{const edge=new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(1,1,1)),new THREE.LineBasicMaterial({color:0xffffff,depthTest:false,transparent:true,opacity:.9}));edge.renderOrder=10;group.add(edge);return edge;});
  const scan=box(group,35,.2,38,0,0,0,'#70c7f3',.16),contours=[0,1,2].map(i=>{const r=ring(group,22,0,i*13-13,0,'#79d3d2',.09);r.rotation.x=-Math.PI/2;return r;}),arrows=[-1,0,1].map(i=>line(group,[[-28,10+i*15,0],[-12,12+i*15,8],[14,10+i*15,-8],[28,10+i*15,0]],'#9de8e7',.15)),dots=[0,1,2,3,4,5].map(i=>sphere(group,.6,(i%2?1:-1)*12,i*8-16,12,'#c6edb3'));
  s.auxiliary={scan,contours,arrows,dots,selections};
  if(!modelPromise){modelLoads++;modelPromise=new FBXLoader().loadAsync(new URL('assets/building.fbx',import.meta.url).href);}
  modelPromise.then(source=>{const model=source.clone(true);model.rotation.x=-Math.PI/2;model.updateMatrixWorld(true);const bounds=new THREE.Box3().setFromObject(model),center=bounds.getCenter(new THREE.Vector3());model.traverse(o=>{if(!o.isMesh)return;const match=o.name.match(/^(R\d+)_.*_U(\d{2})(?:_|$)/);if(o.name.startsWith('BASEMENT'))return;const geo=o.geometry.clone().applyMatrix4(o.matrixWorld);geo.translate(-center.x,-center.y,-center.z);const m=new THREE.Mesh(geo,match?basic('#3FB4F0'):material('#345969',0));group.add(m);if(match){const id=match[1]+'-U'+match[2],f=+match[1].slice(1),u=+match[2];geo.computeBoundingBox();const box=geo.boundingBox,c=box.getCenter(new THREE.Vector3()),size=box.getSize(new THREE.Vector3()),final=geo.attributes.position.array.slice(),flat=final.slice();for(let j=0;j<flat.length;j+=3){flat[j]=(u-5)*8.2+(final[j]-c.x)/Math.max(size.x,.01)*7.6;flat[j+1]=(f-6.5)*5.1+(final[j+1]-c.y)/Math.max(size.y,.01)*4.55;flat[j+2]=(final[j+2]-c.z)*.0001;}s.units.push({id,mesh:m,final,flat});}else{s.structures.push(m);}});if(s.units.length!==108)throw Error('Expected 108 model households');const ground=new THREE.Mesh(new THREE.CircleGeometry(62,100),material('#153442',.8));ground.rotation.x=-Math.PI/2;ground.position.y=-center.y;group.add(ground);s.ground=ground;s.ready=true;}).catch(e=>{s.error=e.message;console.error(e);});
  add((v,t,snap,p)=>{if(!s.ready)return;const map=new Map(snap.records.map(r=>[r.id,r]));for(const u of s.units){u.mesh.material.color.set(map.get(u.id).color);if(Math.abs(p-s.geometryProgress)>.0002){const positions=u.mesh.geometry.attributes.position;for(let j=0;j<u.flat.length;j++)positions.array[j]=mix(u.flat[j],u.final[j],p);positions.needsUpdate=true;u.mesh.geometry.computeVertexNormals();}u.mesh.userData.score=map.get(u.id).score;}s.geometryProgress=p;s.structures.forEach(o=>{o.material.opacity=p*.8;o.visible=p>.02;});s.ground.visible=p>.1;s.ground.material.opacity=p*.75;group.rotation.y=p*[.58,-.6,2.5,-2.5][snap.index];
   selections.forEach((edge,i)=>{const u=s.units.find(u=>u.id===snap.selected[i].id);u.mesh.geometry.computeBoundingBox();u.mesh.geometry.boundingBox.getCenter(edge.position);u.mesh.geometry.boundingBox.getSize(edge.scale);edge.scale.addScalar(.12);edge.visible=t>=7;});
   scan.visible=p>.8&&snap.index===0;scan.position.y=-18+Math.min(t,12)*4;contours.forEach(r=>r.visible=p>.8&&snap.index===1);arrows.forEach(r=>r.visible=p>.8&&snap.index===2);dots.forEach((r,i)=>r.visible=p>.8&&snap.index===3&&t>=7+i*.45);
  });
 }
 scene.updateMatrixWorld(true);return s;
}
function updateScene(s,state,t,now,reduced){
 const key=state.mode+':'+state.segment+':'+state.scenarioSeed;
 if(s.stateKey!==key){s.fromStage=s.stage;s.targetStage=state.segment;s.change=now;s.stateKey=key;s.segment=state.segment;}
 const delay=state.mode==='data'?0:({a:0,s1:120,s2:240,s3:500,s4:720,d:950}[s.kind.split('-')[1]]||0);
 const blend=reduced?1:ease((now-s.change-delay)/1100);s.stage=mix(s.fromStage||0,s.targetStage,blend);
 const snap=state.mode==='data'?BOS.snapshot(state.segment,t,state.scenarioSeed):null;
 if(snap&&(s.seed!==state.scenarioSeed||s.metric!==state.segment)){s.rebuild?.(snap);s.seed=state.scenarioSeed;s.metric=state.segment;}
 let p=state.mode==='data'?(reduced?1:ease((t-4)/3)):Math.min(s.stage,1);
 if(state.mode==='data'&&s.kind==='data-a'){
  // A beat change retracts the existing geometry, even on quick manual navigation.
  if(s.oldSegment!==state.segment){s.retractFrom=s.pose;s.retractStart=now;s.oldSegment=state.segment;}
  if(!reduced&&now-s.retractStart<900)p=mix(s.retractFrom||0,0,ease((now-s.retractStart)/900));
 }
 s.pose=p;
 for(const fn of s.updates)fn(s.stage,t,snap,p);
 const isBuilding=s.kind==='data-a';if(isBuilding){s.camera.position.set(0,30*p,150);s.camera.lookAt(0,6*p,0);}else{const a=state.mode==='data'?0:Math.min(s.stage,1);s.camera.position.set(a*7,a*6,40);s.camera.lookAt(0,0,0);}
 s.lastSnapshot=snap;
}
function draw(now){
 requestAnimationFrame(draw);if(document.hidden||contextLost)return;
 if(now-lastRender<(document.body.dataset.view==='wall'?1000/30:1000/60)-1)return;lastRender=now;
 const state=globalThis.showcaseState;if(!state)return;const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 const dt=now-state.received,t=reduced?(state.mode==='data'?18:12):Math.min(state.segmentDuration||12,state.elapsed+(state.playing?dt/1000:0));
 const dialog=document.querySelector('dialog[open]');if(dialog&&canvas.parentElement!==dialog)dialog.appendChild(canvas);else if(!dialog&&canvas.parentElement!==document.body)document.body.appendChild(canvas);
 if(canvas.width!==Math.round(innerWidth*renderer.getPixelRatio())||canvas.height!==Math.round(innerHeight*renderer.getPixelRatio()))renderer.setSize(innerWidth,innerHeight,false);
 renderer.setScissorTest(false);renderer.clear();renderer.setScissorTest(true);let active=0;
 for(const el of document.querySelectorAll('.show-viewport')){
  if(dialog&&!dialog.contains(el))continue;const r=el.getBoundingClientRect();if(r.bottom<0||r.top>innerHeight||r.right<0||r.left>innerWidth||r.width<1)continue;
  const key=el.dataset.scene;let s=scenes.get(key);if(!s){s=makeScene(key);scenes.set(key,s);}
  if(s.error){el.dataset.error='true';el.querySelector('.show-loading').textContent='模型無法載入，請確認 WebGL 與素材檔';continue;}
  updateScene(s,state,t,now,reduced);el.dataset.ready=s.ready?'true':'false';if(!s.ready)continue;active++;
  const aspect=r.width/r.height,h=Math.max(s.bounds.height,s.bounds.width/aspect),w=h*aspect;s.camera.left=-w/2;s.camera.right=w/2;s.camera.top=h/2;s.camera.bottom=-h/2;s.camera.updateProjectionMatrix();
  renderer.setViewport(r.left,innerHeight-r.bottom,r.width,r.height);renderer.setScissor(Math.max(0,r.left),Math.max(0,innerHeight-r.bottom),Math.min(r.width,innerWidth-r.left),Math.min(r.height,r.bottom,innerHeight-r.top));renderer.render(s.scene,s.camera);
 }
 canvas.style.display=active?'block':'none';rendererFrames++;
}
requestAnimationFrame(draw);
canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();contextLost=true;canvas.style.display='none';document.querySelectorAll('.show-viewport').forEach(el=>{el.dataset.ready='false';el.querySelector('.show-loading').textContent='3D 顯示中斷，請重新整理';});});
canvas.addEventListener('webglcontextrestored',()=>{contextLost=false;});
globalThis.showcaseDiagnostics=()=>({rendererCount:1,modelLoads,rendererFrames,scenes:[...scenes.values()].map(s=>({kind:s.kind,ready:s.ready,error:s.error,stage:s.stage,pose:s.pose,seed:s.seed,segment:s.segment,selected:s.lastSnapshot?.selected.map(r=>r.id),histogram:s.lastSnapshot?.histogram,units:s.units?.map(u=>({id:u.id,color:'#'+u.mesh.material.color.getHexString(),score:u.mesh.userData.score}))}))});
