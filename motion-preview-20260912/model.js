import * as THREE from 'three';
import {FBXLoader} from 'three/addons/loaders/FBXLoader.js';
const q=new URLSearchParams(location.search), mode=q.get('mode')||'idle',segment=Number(q.get('segment'))||0;
let playing=q.get('playing')!=='false', model,renderer;
const accent=new THREE.Color(({idle:'#3FB4F0',life:'#FFA61A',bim:'#FF2E1E',data:'#18DCB9'})[mode]||'#3FB4F0');
const cutaway=mode==='bim'||segment===2;
const showUnits=q.get('units')==='1';
// Fixed semantic unit colors: chapter changes never change a household's color.
const unitColors={U01:'#36B9FF',U02:'#FF9B35',U03:'#B68AFF',U04:'#35DAB1',U05:'#FF638A',U06:'#F2D447',U07:'#5574F5',U08:'#C7E987',U09:'#EBAFE5'};
const status=document.getElementById('status');
try{
 renderer=new THREE.WebGLRenderer({antialias:true,alpha:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(innerWidth,innerHeight);renderer.setClearColor(0x000000,0);renderer.outputColorSpace=THREE.SRGBColorSpace;document.body.prepend(renderer.domElement);
 const scene=new THREE.Scene();const camera=new THREE.PerspectiveCamera(36,innerWidth/innerHeight,.1,1000);
 scene.add(new THREE.HemisphereLight(0xe5f3ff,0x162437,3));const key=new THREE.DirectionalLight(0xffffff,3.4);key.position.set(65,110,75);scene.add(key);const rim=new THREE.DirectionalLight(accent,2);rim.position.set(-70,30,-50);scene.add(rim);
 const grid=new THREE.GridHelper(150,30,accent,0x294354);grid.position.y=.03;scene.add(grid);
 const groundMaterial=new THREE.MeshStandardMaterial({color:0x14242d,roughness:.86,metalness:.15,side:THREE.DoubleSide});
 function floor(w,d,x,z){const p=new THREE.Mesh(new THREE.PlaneGeometry(w,d),groundMaterial);p.rotation.x=-Math.PI/2;p.position.set(x,-.12,z);scene.add(p);}
 // FBX is Z-up; observed basement -18..0 and above-ground up to 69.15. Keep zero elevation.
 if(cutaway){floor(43,150,-53.5,0);floor(43,150,53.5,0);floor(64,35,0,-57.5);grid.visible=false;
  const opening=new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(64,.2,80)),new THREE.LineBasicMaterial({color:accent}));scene.add(opening);
 }else floor(150,150,0,0);
 const loader=new FBXLoader();model=await loader.loadAsync('assets/building.fbx');
 model.rotation.x=-Math.PI/2;model.updateMatrixWorld(true);const bounds=new THREE.Box3().setFromObject(model);const center=bounds.getCenter(new THREE.Vector3());model.position.x=-center.x;model.position.z=-center.z;model.updateMatrixWorld(true);
 let meshes=0,basements=0;const normal=new THREE.MeshStandardMaterial({color:0xd4e3e9,roughness:.6,metalness:.12});const underground=new THREE.MeshStandardMaterial({color:accent,roughness:.48,metalness:.15});const selected=new THREE.MeshStandardMaterial({color:accent,emissive:accent,emissiveIntensity:.26,roughness:.5});
 const selectedPrefix=['R02_','R06_','R10_'][segment];
 const unit3DMaterials=Object.fromEntries(Object.entries(unitColors).map(([id,color])=>[id,new THREE.MeshBasicMaterial({color})]));
 const floors=new Map(),coloredMeshes=[];
 const neutralStructure=new THREE.MeshStandardMaterial({color:0x344454,roughness:.85});
 model.traverse(obj=>{if(!obj.isMesh)return;meshes++;const basement=obj.name.startsWith('BASEMENT');if(basement)basements++;
  const match=obj.name.match(/^(R\d+)_.*_U(\d{2})(?:_|$)/),id=match?`U${match[2]}`:null;
  obj.material=showUnits&&unit3DMaterials[id]?unit3DMaterials[id]:basement?underground:showUnits?neutralStructure:(mode==='bim'&&obj.name.startsWith(selectedPrefix)?selected:normal);
  if(showUnits&&unit3DMaterials[id]){
   if(!floors.has(match[1]))floors.set(match[1],new Set());floors.get(match[1]).add(id);coloredMeshes.push(obj);
   obj.userData.unitId=id;
   const edges=new THREE.LineSegments(new THREE.EdgesGeometry(obj.geometry,30),new THREE.LineBasicMaterial({color:obj.name.startsWith(selectedPrefix)?0xffffff:0x081621,transparent:true,opacity:obj.name.startsWith(selectedPrefix)?.9:.65}));obj.add(edges);
  }
  obj.castShadow=false;obj.receiveShadow=false;
 });scene.add(model);
 if(showUnits){
  if(!floors.size||[...floors.values()].some(ids=>ids.size!==9))throw Error('Every residential model layer must contain nine units');
  document.body.dataset.unitFloors=JSON.stringify(Object.fromEntries([...floors].map(([floor,ids])=>[floor,[...ids].sort()])));
  document.body.dataset.coloredUnitMeshes=coloredMeshes.length;
  document.body.dataset.unitPalette=JSON.stringify(unitColors);
  // Expose read-only material snapshots for verification after animation and chapter changes.
  window.getUnitColorSnapshot=()=>coloredMeshes.map(obj=>({name:obj.name,id:obj.userData.unitId,color:'#'+obj.material.color.getHexString()}));
 }
 let unitScene,unitCamera,unitLabels=[],unitMaterials=[],activeUnit=-1,unitTime=segment*12;
 const planBounds=new THREE.Box3();
 if(showUnits){
  document.body.classList.add('with-units');
  const style=document.createElement('style');style.textContent='.unit-title{position:absolute;left:45%;right:12px;top:18px;font-size:28px;font-weight:600;color:#f2f1ec;line-height:1.3}.unit-title small{display:block;font-size:17px;font-weight:400;color:#b6c8d7;margin-top:6px}.unit-label{position:absolute;transform:translate(-50%,-50%);padding:4px 7px;border:1px solid #aec3d9;background:#07111beb;color:#f2f1ec;font:bold 20px Arial;border-radius:4px;pointer-events:none;white-space:nowrap}.unit-label.active{background:#f2f1ec;color:#07111b;border-color:#fff}.unit-summary{position:absolute;left:45%;right:12px;bottom:18px;font-size:19px;color:#e0e9ef}.with-units #hint{max-width:39%;font-size:16px}.with-units #status{max-width:36%;font-size:15px}';document.head.appendChild(style);
  const labelStyle=document.createElement('style');labelStyle.textContent='.unit-label{font-size:30px}.unit-title{font-size:34px}';document.head.appendChild(labelStyle);
  const legendStyle=document.createElement('style');legendStyle.textContent='.unit-legend{position:absolute;left:12px;width:40%;bottom:64px;display:grid;grid-template-columns:repeat(3,1fr);gap:9px 12px;color:#f2f1ec;font:600 21px Arial}.unit-legend span{display:flex;align-items:center;gap:8px}.unit-legend i{width:19px;height:19px;border-radius:3px;display:inline-block}.unit-color-note{position:absolute;left:12px;bottom:164px;color:#e0e9ef;font-size:18px}.unit-label.active{background:#07111b;color:#fff;outline:3px solid #fff}';document.head.appendChild(legendStyle);
  const legend=document.createElement('div');legend.className='unit-legend';legend.setAttribute('aria-label','全棟戶別配色');legend.innerHTML=Object.entries(unitColors).map(([id,color])=>`<span data-unit="${id}"><i style="background:${color}"></i>${id}</span>`).join('');document.body.appendChild(legend);
  const colorNote=document.createElement('div');colorNote.className='unit-color-note';colorNote.textContent=`${floors.size} 個住宅模型分層 · 同戶別同色`;document.body.appendChild(colorNote);
  const heading=document.createElement('div');heading.className='unit-title';heading.innerHTML=`單層 <b>9</b> 戶<small>模型分層 ${selectedPrefix.slice(0,-1)} · U01–U09</small>`;document.body.appendChild(heading);
  const summary=document.createElement('div');summary.className='unit-summary';summary.textContent='依原始模型戶別分布 · 非室內格局圖';document.body.appendChild(summary);
  unitScene=new THREE.Scene();unitCamera=new THREE.OrthographicCamera();
  const units=new Map();
  model.traverse(obj=>{if(!obj.isMesh||!obj.name.startsWith(selectedPrefix))return;const match=obj.name.match(/_U(\d{2})(?:_|$)/);const geometry=obj.geometry.clone().applyMatrix4(obj.matrixWorld);const id=match?`U${match[1]}`:null;
   const color=new THREE.Color(id?unitColors[id]:'#263d4d');
   const material=new THREE.MeshBasicMaterial({color,side:THREE.DoubleSide});unitScene.add(new THREE.Mesh(geometry,material));
   if(id){if(!units.has(id))units.set(id,{id,bounds:new THREE.Box3(),materials:[],sourceObjects:[]});const u=units.get(id);geometry.computeBoundingBox();u.bounds.union(geometry.boundingBox);u.materials.push({material,color:color.clone()});u.sourceObjects.push(obj);planBounds.union(geometry.boundingBox);
    const edges=new THREE.LineSegments(new THREE.EdgesGeometry(geometry,35),new THREE.LineBasicMaterial({color:0xb3d4e3,transparent:true,opacity:.5}));unitScene.add(edges);
   }
  });
  const entries=[...units.values()].sort((a,b)=>a.id.localeCompare(b.id));if(entries.length!==9)throw Error(`Expected 9 unique model units; got ${entries.length}`);
  entries.forEach(u=>{const el=document.createElement('div');el.className='unit-label';el.textContent=u.id;el.dataset.unit=u.id;el.style.borderColor=unitColors[u.id];document.body.appendChild(el);unitLabels.push({el,point:u.bounds.getCenter(new THREE.Vector3())});unitMaterials.push(u);});
  document.body.dataset.unitCount=entries.length;document.body.dataset.unitIds=entries.map(u=>u.id).join(',');
 }
 const target=new THREE.Vector3(0,cutaway?22:30,0);let angle=.82,last=0;
 function position(){const distance=cutaway?165:150;camera.position.set(Math.sin(angle)*distance,cutaway?58:72,Math.cos(angle)*distance);camera.lookAt(target);}
 position();status.textContent=cutaway?'地下室開口展示 · 量體示意':'地面遮蔽地下室 · 地上建築展示';document.getElementById('hint').textContent=cutaway?'地面 GL ±0 ／ 地下量體':'地面 GL ±0 ／ 地上建築';document.body.dataset.ready='true';document.body.dataset.meshes=meshes;document.body.dataset.basements=basements;
 function renderViews(){
  renderer.setScissorTest(false);renderer.setViewport(0,0,innerWidth,innerHeight);renderer.clear();
  if(!showUnits){renderer.render(scene,camera);return;}
  const leftWidth=Math.round(innerWidth*.43),x=Math.round(innerWidth*.45),y=70,w=innerWidth-x-12,h=innerHeight-150;
  const modelHeight=Math.max(100,innerHeight-190);
  camera.aspect=leftWidth/modelHeight;camera.updateProjectionMatrix();renderer.setScissorTest(true);renderer.setViewport(0,175,leftWidth,modelHeight);renderer.setScissor(0,175,leftWidth,modelHeight);renderer.render(scene,camera);
  const size=planBounds.getSize(new THREE.Vector3()),center=planBounds.getCenter(new THREE.Vector3()),halfHeight=Math.max(size.z*1.17/2,size.x*1.25/(w/h)/2),halfWidth=halfHeight*w/h;
  unitCamera.left=-halfWidth;unitCamera.right=halfWidth;unitCamera.top=halfHeight;unitCamera.bottom=-halfHeight;unitCamera.near=.1;unitCamera.far=500;unitCamera.position.set(center.x,200,center.z);unitCamera.up.set(0,0,-1);unitCamera.lookAt(center);unitCamera.updateProjectionMatrix();unitCamera.updateMatrixWorld();
  renderer.setViewport(x,y,w,h);renderer.setScissor(x,y,w,h);renderer.clearDepth();renderer.render(unitScene,unitCamera);renderer.setScissorTest(false);
  for(const item of unitLabels){const p=item.point.clone().project(unitCamera);item.el.style.left=(x+(p.x+1)*w/2)+'px';item.el.style.top=(innerHeight-y-(p.y+1)*h/2)+'px';}
 }
 function animate(now){const delta=Math.min((now-last)/1000,.05);last=now;if(playing&&!matchMedia('(prefers-reduced-motion: reduce)').matches){angle+=delta*.055;unitTime+=delta;position();}
  if(showUnits){const index=Math.floor(unitTime/3)%9;if(index!==activeUnit){unitLabels.forEach((item,i)=>item.el.classList.toggle('active',i===index));activeUnit=index;}}
  renderViews();requestAnimationFrame(animate);}requestAnimationFrame(animate);
 addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);});
 addEventListener('message',event=>{if(event.origin===location.origin&&event.data?.type==='anlb-playback')playing=!!event.data.playing;});
 renderer.domElement.addEventListener('webglcontextlost',event=>{event.preventDefault();status.className='error';status.textContent='3D 顯示中斷，請重新載入此頁';});
}catch(error){status.className='error';status.textContent='模型無法顯示，請確認 WebGL 與模型檔案；未顯示替代模型。';document.body.dataset.error='true';console.error(error);}
