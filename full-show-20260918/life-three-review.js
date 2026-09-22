import * as THREE from 'three';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
const host=document.querySelector('#scene'),stage=document.querySelector('#stage'),viewport=document.querySelector('#viewport');
const embedded=new URLSearchParams(location.search).get('embedded')==='1';
if(embedded){
 const style=document.createElement('style');style.textContent='html,body{background:transparent!important;overflow:hidden}header,#logo,h1,.eyebrow,aside,.capabilities,footer,.kv-background{display:none!important}#viewport{width:100vw;height:100vh;max-height:none;aspect-ratio:auto}#stage{width:1200px;height:710px;background:transparent!important}#scene{left:0;top:0;width:1200px;height:710px}.year-label{font:44px Arial}';document.head.append(style);
}
// Use the existing chapter background, not a candidate-specific art direction.
const background=document.createElement('div');background.className='kv-background';background.setAttribute('aria-hidden','true');background.innerHTML='<i></i><i></i>';stage.prepend(background);
function fit(){const w=embedded?1200:1920,h=embedded?710:1080,s=Math.min(viewport.clientWidth/w,viewport.clientHeight/h);stage.style.transform=`translate(${(viewport.clientWidth-w*s)/2}px,${(viewport.clientHeight-h*s)/2}px) scale(${s})`;}
new ResizeObserver(fit).observe(viewport);fit();
const renderer=new THREE.WebGLRenderer({alpha:true,antialias:true});renderer.setSize(1200,650);renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.35;host.prepend(renderer.domElement);
if(embedded)renderer.setSize(1200,710);
const scene=new THREE.Scene(),camera=new THREE.OrthographicCamera(-12,12,6.5,-6.5,.1,100);camera.position.set(0,14,18);camera.lookAt(0,0,0);camera.updateMatrixWorld();
const env=new RoomEnvironment(),pmrem=new THREE.PMREMGenerator(renderer),environment=pmrem.fromScene(env,.06);scene.environment=environment.texture;env.dispose();pmrem.dispose();
scene.environmentIntensity=.24;
scene.add(new THREE.HemisphereLight(0xfff2d9,0x0a1524,.65));const key=new THREE.DirectionalLight(0xffe2ac,2);key.position.set(-5,12,4);scene.add(key);const rim=new THREE.DirectionalLight(0xb8d5ef,1.2);rim.position.set(8,6,-8);scene.add(rim);
const plane=new THREE.Plane(new THREE.Vector3(0,1,0),0),ray=new THREE.Raycaster();
function point(year){const z=year/120,k=z/(1+.72*z),u=k*1.72;return {x:150+779*u,y:610-448*u,r:52-37*k};}
function position(year){const p=point(year);ray.setFromCamera(new THREE.Vector2(p.x/1200*2-1,1-p.y/710*2),camera);return ray.ray.intersectPlane(plane,new THREE.Vector3());}
const warm=new THREE.MeshStandardMaterial({color:0xffbc48,emissive:0xff9e16,emissiveIntensity:1.3,roughness:.25,metalness:.65});
const dark=new THREE.MeshPhysicalMaterial({color:0x18212b,metalness:.6,roughness:.23,clearcoat:1,clearcoatRoughness:.12});
const glass=new THREE.MeshPhysicalMaterial({color:0x34414a,metalness:.25,roughness:.19,transmission:.32,thickness:.6,transparent:true,opacity:.75,ior:1.45,clearcoat:1});
const start=position(0),end=position(120),direction=end.clone().sub(start),distance=direction.length();
function beam(material,radius){const mesh=new THREE.Mesh(new THREE.CylinderGeometry(radius,radius,1,16),material);mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),direction.clone().normalize());scene.add(mesh);return mesh;}
const track=beam(new THREE.MeshBasicMaterial({color:0x816124,toneMapped:false}),.044);track.position.copy(start).addScaledVector(direction,.5);track.scale.y=distance;
// Saturated yellow remains yellow under the scene's filmic tone mapping.
const energy=beam(new THREE.MeshBasicMaterial({color:0xffcb27,toneMapped:false}),.095);
const energyHalo=beam(new THREE.MeshBasicMaterial({color:0xffbb18,transparent:true,opacity:.12,depthWrite:false,toneMapped:false}),.18);
const energyCore=beam(new THREE.MeshBasicMaterial({color:0xffed9e,toneMapped:false}),.032);
const nodes=[0,30,60,90,120].map((year,i)=>{
 const group=new THREE.Group();group.position.copy(position(year));scene.add(group);const radius=point(year).r/50;
 const base=new THREE.Mesh(new THREE.CylinderGeometry(radius,radius*.96,.22,64),dark);base.position.y=.07;group.add(base);
 const coreMat=warm.clone();const core=new THREE.Mesh(new THREE.CylinderGeometry(radius*.69,radius*.69,.13,64),coreMat);core.position.y=.25;group.add(core);
 const cap=new THREE.Mesh(new THREE.CylinderGeometry(radius*.92,radius*.92,.26,64),glass.clone());cap.position.y=.48;group.add(cap);
 const rimMaterial=new THREE.MeshBasicMaterial({color:0xffd43b,transparent:true,opacity:0,toneMapped:false});
 const capRim=new THREE.Mesh(new THREE.TorusGeometry(radius*.9,.025,8,64),rimMaterial);capRim.rotation.x=Math.PI/2;capRim.position.y=.125;cap.add(capRim);
 // Broad material surface, not concentric wire rings. Two small solid data laminae.
 const layers=[];for(let n=0;n<2;n++){const m=new THREE.Mesh(new THREE.BoxGeometry(radius*1.02,.07,radius*.8),dark.clone());m.position.set(0,.65+n*.19,0);group.add(m);layers.push(m);}
 const label=document.createElement('span');label.className='year-label';label.textContent=year;label.style.left=`${point(year).x-point(year).r-24}px`;label.style.top=`${point(year).y/710*(embedded?710:650)}px`;document.querySelector('#labels').append(label);
 return {group,base,core,coreMat,cap,rimMaterial,layers,label,year};
});
// A separate luminous traveller stays visible above the node surfaces.
const cursor=new THREE.Mesh(new THREE.SphereGeometry(.19,32,20),new THREE.MeshBasicMaterial({color:0xfff6c0,toneMapped:false}));scene.add(cursor);
const glowPixels=new Uint8Array(64*64*4);
for(let y=0;y<64;y++)for(let x=0;x<64;x++){const r=Math.hypot((x-31.5)/31.5,(y-31.5)/31.5),i=(y*64+x)*4;glowPixels.set([255,194,24,Math.round(160*Math.pow(Math.max(0,1-r),2))],i);}
const glowTexture=new THREE.DataTexture(glowPixels,64,64);glowTexture.needsUpdate=true;
const cursorGlow=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTexture,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,toneMapped:false}));cursorGlow.scale.set(1.35,1.35,1);cursor.add(cursorGlow);
const names=['可維養設計，從建造開始','管線更新，建築持續服務','系統世代升級','跨世代持有與維養','邁向長壽建築'];
function yearAt(t){if(t<2)return 0;if(t<7)return(t-2)*6;if(t<9)return 30;if(t<14)return 30+(t-9)*6;if(t<16)return 60;if(t<21)return 60+(t-16)*6;if(t<23)return 90;if(t<28)return 90+(t-23)*6;return 120;}
let time=0,playing=true,last=performance.now();const seek=document.querySelector('#seek'),play=document.querySelector('#play'),reduced=matchMedia('(prefers-reduced-motion: reduce)');
play.onclick=()=>{playing=!playing;play.textContent=playing?'暫停':'播放';};document.querySelector('#reset').onclick=()=>{time=0;playing=true;play.textContent='暫停';};seek.oninput=()=>{time=Number(seek.value);};
function render(now){requestAnimationFrame(render);const dt=Math.min(.1,(now-last)/1000);last=now;if(document.hidden)return;
 let sharedYear=null;
 if(embedded){
  const shared=parent.showcaseState,panel=window.frameElement?.closest('.life-axis-panel');
  if(!shared||!panel||shared.mode!=='life')return;
  sharedYear=Number(panel.dataset.year);if(!Number.isFinite(sharedYear))return;
  playing=!!shared.playing;
  time=(shared.chapterElapsed??shared.segment*12+shared.elapsed)+(playing?(parent.performance.now()-shared.received)/1000:0);
 }else{if(playing)time=Math.min(36,time+dt);if(time===36){playing=false;play.textContent='重播請按左側重播';}}
 const year=sharedYear??yearAt(time),active=Math.min(4,Math.floor((year+.001)/30)),p=position(year),diff=p.clone().sub(start),len=diff.length();
 for(const rail of [energy,energyHalo,energyCore]){rail.visible=len>.01;rail.position.copy(start).addScaledVector(diff,.5);rail.scale.y=len;}
 cursor.position.copy(p);cursor.position.y=.43;
 nodes.forEach((n,i)=>{const arrival=[5.18,8.825,12.47,16.115,19.76][i],activation=reduced.matches?1:THREE.MathUtils.smoothstep(time,arrival,arrival+.85),current=i===active,passed=year>=n.year;
 const next=[8.825,12.47,16.115,19.76,Infinity][i],focus=reduced.matches?(current?1:0):activation*(1-THREE.MathUtils.smoothstep(time,next,next+.85));
 n.cap.position.y=.48+.48*focus;n.coreMat.emissiveIntensity=passed?.55+1.85*focus:.03;n.coreMat.color.setHex(passed?0xffbe56:0x26303a);
 // Existing dwell windows only: 0–2, 7–9, 14–16, 21–23, 28–36 s.
 // One soft 2-second breath at every stop; final stop repeats without moving time.
 const dwellEnd=[7.18,10.825,14.47,18.115,32.72][i],dwell=current&&time>=arrival&&time<=dwellEnd;
 const breath=dwell&&!reduced.matches?Math.pow(Math.sin(Math.PI*(time-arrival)/2),2):0;
 n.coreMat.emissive.setHex(0xffc21c);n.coreMat.emissiveIntensity+=breath*1.1;
 n.rimMaterial.opacity=passed?.12+focus*(.5+.38*breath):0;
 n.cap.material.emissive.setHex(0xffbd20);n.cap.material.emissiveIntensity=focus*(.1+.35*breath);
 n.layers.forEach((m,j)=>{m.visible=passed;m.position.y=.6+j*.18+focus*(.58+j*.12);m.material.color.setHex(current?0xc59528:0x20262b);m.material.emissive.setHex(0xffc52a);m.material.emissiveIntensity=focus*(j===1?.42:.18);});
 n.label.className=`year-label ${current?'active':passed?'done':''}`;
 });
 document.querySelector('#year').textContent=Math.floor(year);document.querySelector('#name').textContent=names[active];document.querySelectorAll('.capabilities span').forEach((e,i)=>e.classList.toggle('active',i===active));seek.value=time;renderer.render(scene,camera);
}
requestAnimationFrame(render);
window.lifeThreeDiagnostics=()=>({time,playing,year:embedded?120*Math.max(0,Math.min(14.58,time-5.18))/14.58:yearAt(time),renderer:'Three.js WebGL',nodes:nodes.length,drawCalls:renderer.info.render.calls,geometries:renderer.info.memory.geometries});
renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();playing=false;document.querySelector('#status').textContent='GPU 繪圖中斷，請重新整理候選頁';});
