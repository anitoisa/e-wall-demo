// Fixed 11-inch-class landscape proportions, scaled to fit the preview window.
const ipadParams=new URLSearchParams(location.search);
const embedded=ipadParams.get('embedded')==='1'||window.self!==window.top;
const actualTablet=/iPad|iPhone|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
const fullScreen=!embedded&&(ipadParams.get('display')==='device'||(ipadParams.get('display')!=='preview'&&(actualTablet||navigator.standalone||matchMedia('(display-mode: standalone)').matches)));
if(embedded)document.body.classList.add('embedded-ipad');
if(fullScreen)document.body.classList.add('device-ipad');
if(fullScreen){
 document.documentElement.classList.add('device-ipad-root');
 const preventZoom=e=>{if(e.type.startsWith('gesture')||e.touches?.length>1)e.preventDefault();};
 for(const event of ['gesturestart','gesturechange','gestureend','touchstart','touchmove'])document.addEventListener(event,preventZoom,{passive:false});
 // Real fullscreen is browser-dependent; never block the original control click.
 document.addEventListener('click',()=>{if(document.fullscreenElement||document.webkitFullscreenElement)return;const root=document.documentElement;const enter=root.requestFullscreen||root.webkitRequestFullscreen;if(enter){try{const result=enter.call(root);result?.catch(()=>{});}catch{}}},{capture:true});
}
const shell=document.createElement('div');shell.className='tablet-shell';
const screen=document.createElement('div');screen.className='tablet-screen';
const consolePanel=document.getElementById('console');consolePanel.before(shell);shell.append(screen);screen.append(consolePanel);
const cover=document.createElement('button');cover.id='standby-screen';cover.dataset.action='start';cover.disabled=true;
cover.setAttribute('aria-label','第五代住宅宣言，AI原生建築生命體；輕觸開始展演');
cover.innerHTML='<img src="assets/logo.png" alt="ANLB INSIDE"><div class="standby-claim"><strong>第五代住宅宣言</strong><span>AI原生建築生命體</span></div><small class="standby-status" role="status">輕觸螢幕進入建築</small>';
screen.append(cover);
// Reuse the screen wall's key-visual light ribbons, not the dated banner artwork.
for(const surface of [consolePanel,cover]){const kv=document.createElement('div');kv.className='kv-background tablet-kv';kv.setAttribute('aria-hidden','true');kv.innerHTML='<i></i><i></i><i></i>';surface.prepend(kv);}
const sleep=document.createElement('button');sleep.dataset.action='standby';sleep.textContent='待機';consolePanel.querySelector('.transport').append(sleep);
const label=document.createElement('p');label.className='tablet-caption';label.textContent='11 吋橫向平板 · 比例預覽';shell.after(label);
const fit=()=>{if(fullScreen){shell.style.width='100%';shell.style.height='100%';screen.style.transform='none';return;}const scale=Math.min((innerWidth-32)/1234,(innerHeight-70)/880,1);shell.style.width=1234*scale+'px';shell.style.height=880*scale+'px';screen.style.transform=`scale(${scale})`;};
addEventListener('resize',fit);fit();document.body.classList.add('is-standby');consolePanel.inert=true;
