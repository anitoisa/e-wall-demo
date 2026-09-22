/* Near-square, content-native layouts. No transforms are applied to old 16:9 art.
 * Geometry, labels and connectors below share the same chapter-local clock.
 */
globalThis.Aperture=(()=>{
 const ids=['s1','s2','s3','s4'],colors={idle:'#3FB4F0',life:'#FFA61A',bim:'#FF2E1E',data:'#18DCB9'};
 let config={"version": 1, "screens": {"s1": {"x": 96.0, "y": 108.0, "height": 864.0, "widthMm": 330, "heightMm": 300, "safeMm": 10.0, "bleedMm": {"top": 5.0, "right": 5.0, "bottom": 5.0, "left": 5.0}, "calibrated": false}, "s2": {"x": 474.72, "y": 108.0, "height": 864.0, "widthMm": 337, "heightMm": 300, "safeMm": 10.0, "bleedMm": {"top": 5.0, "right": 5.0, "bottom": 5.0, "left": 5.0}, "calibrated": false}, "s3": {"x": 474.72, "y": 108.0, "height": 864.0, "widthMm": 337, "heightMm": 300, "safeMm": 10.0, "bleedMm": {"top": 5.0, "right": 5.0, "bottom": 5.0, "left": 5.0}, "calibrated": false}, "s4": {"x": 873.6, "y": 108.0, "height": 864.0, "widthMm": 330, "heightMm": 300, "safeMm": 10.0, "bleedMm": {"top": 5.0, "right": 5.0, "bottom": 5.0, "left": 5.0}, "calibrated": false}}},qa=null,qaReceived=0,view='content';
 const review=new URLSearchParams(location.search).get('review')==='1';
 const ease=x=>{x=Math.max(0,Math.min(1,x));return x*x*(3-2*x)},esc=x=>String(x).replace(/[<>&"]/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c]));
 const t=(x,y,text,size=32,extra='')=>`<text x="${x}" y="${y}" font-size="${size}" ${extra}>${esc(text)}</text>`;
 const g=(at,body,span=.8,extra='')=>`<g data-ap-at="${at}" data-ap-span="${span}" ${extra}>${body}</g>`;
 const path=(d,at=0,extra='')=>`<path d="${d}" class="ap-path" data-ap-draw="${at}" data-ap-span="1.1" ${extra}/>`;
 const flow=(d,at)=>`<path d="${d}" class="ap-flow" data-ap-flow="${at}"/>`;
 const box=(x,y,w,h,extra='')=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="14" class="ap-box" ${extra}/>`;
 const label=(x,y,s,at,size=32)=>g(at,t(x,y,s,size,'text-anchor="middle"'));
 const shape={
  check:'<rect x="18" y="12" width="84" height="99" rx="10"/><path d="M38 9h45v22H38Z"/><path class="ap-detail" d="m34 62 18 17 34-38"/>',
  record:'<path d="M24 10h50l25 24v76H24ZM74 10v27h25"/><path class="ap-detail" d="M39 55h44M39 72h44M39 89h30"/>',
  building:'<path d="M18 110V35l48-20v95M66 37h35v73M7 110h106"/><path class="ap-detail" d="M30 44h18M30 61h18M30 78h18M80 52h9M80 70h9M80 88h9"/>',
  clock:'<circle cx="60" cy="60" r="45"/><path class="ap-detail" d="M60 28v36l25 15"/>',
  tools:'<path d="M95 14a30 30 0 0 0-44 36L18 84a14 14 0 0 0 20 20l34-34a30 30 0 0 0 35-40L86 50 69 33Z"/>',
  pump:'<circle cx="58" cy="59" r="30"/><path d="M7 48h21v24H7M84 48h28v24H84M37 88l-8 20h58l-9-20"/><path class="ap-detail" d="M43 61h29M59 46v30"/>',
  water:'<path d="M60 9C47 30 22 53 22 77a38 38 0 0 0 76 0C98 53 73 30 60 9Z"/><path class="ap-detail" d="M38 74a23 23 0 0 0 24 24"/>',
  air:'<path d="M12 39h65c29 0 29-29 8-29M12 61h80c30 0 30 39 3 39M12 84h40c25 0 25 29 8 29"/>',
  temperature:'<path d="M49 73V22a12 12 0 0 1 24 0v51a24 24 0 1 1-24 0Z"/><path class="ap-detail" d="M61 36v54M90 30h15M90 51h12"/>',
  power:'<path class="ap-detail" d="m70 8-44 58h29l-5 45 45-62H66Z"/>',
  target:'<circle cx="60" cy="60" r="31"/><circle cx="60" cy="60" r="9"/><path class="ap-detail" d="M60 7v27M60 86v27M7 60h27M86 60h27"/>',
  layers:'<path d="m10 38 50-25 50 25-50 26ZM10 61l50 26 50-26M10 84l50 26 50-26"/>'};
 function icon(kind,x,y,size=100,at=0){return `<svg x="${x}" y="${y}" width="${size}" height="${size}" viewBox="0 0 120 120" class="ap-icon" data-ap-icon="${at}">${shape[kind]||shape.record}</svg>`}
 function documentArt(x,y,w=330,h=360){return `${box(x,y,w,h)}<path class="ap-thin" d="M${x+25} ${y+24}h65"/>`}
 const slab=(x,y,w=480,depth=100)=>`<path class="ap-solid-top" d="M${x} ${y}l${depth} -65h${w}l-${depth} 65Z"/><path class="ap-solid-face" d="M${x} ${y}h${w}v20H${x}Z"/><path class="ap-solid-side" d="M${x+w} ${y}l${depth} -65v20l-${depth} 65Z"/>`;
 function tower(x=230,y=130,levels=4){return `<g class="ap-tower">${Array.from({length:levels},(_,i)=>slab(x,y+i*74,350,90)).join('')}<path class="ap-thin" d="M${x+30} ${y}v${(levels-1)*74}M${x+310} ${y}v${(levels-1)*74}M${x+415} ${y-45}v${(levels-1)*74}"/></g>`}
 function pump(x,y,scale=1){return `<g transform="translate(${x} ${y}) scale(${scale})"><ellipse cx="170" cy="160" rx="150" ry="19" class="ap-shadow"/><path class="ap-solid-top" d="M20 145l30-22h220l30 22-35 20H55Z"/><rect x="130" y="48" width="115" height="86" rx="14" fill="url(#ap-metal)" stroke="currentColor" stroke-width="3"/><path class="ap-thin" d="M151 56v70M170 56v70M190 56v70M210 56v70M230 56v70"/><circle cx="105" cy="94" r="58" fill="url(#ap-metal)" stroke="currentColor" stroke-width="5"/><circle cx="105" cy="94" r="33" class="ap-solid-face"/><rect x="4" y="76" width="50" height="36" rx="5" fill="url(#ap-metal)" stroke="currentColor" stroke-width="4"/><rect x="96" y="9" width="36" height="35" rx="4" fill="url(#ap-metal)" stroke="currentColor" stroke-width="4"/><path class="ap-thin" d="M88 91h34M105 74v34"/></g>`}
 const TITLES={idle:['結構與管線分離','第三方品質把關','從建造到維養的\n全資訊建構','建築紀錄看得到'],life:['為持續更新而設計','建築品質查驗','設備維養履歷','120年資產維養計畫'],bim:['樓層索引','設備系統關聯','BIM設備資訊','管線透視']};
 const CAPTIONS={idle:[['SI 工法｜結構與服務層','服務層抽離，結構保留','接口可接近，維養更清楚'],['查驗項目逐項留存','第三方品質把關','依據文件，連回建築履歷'],['建築與設備建檔','資訊連結維養計畫','更新資訊，回存同一履歷'],['由建築，找到資訊','設備身份，連結位置','設備與紀錄，一起查閱']],life:[['管線接口，預留更新可能','舊管退出，結構不變','接合動作示意｜更新紀錄接續'],['建材・工法・設備','查驗與交付，逐項對照','一份查驗，對應一份依據'],['P-01｜給水設備','物業安排，專業執行','維養內容，留在同一履歷'],['公區與專有戶，分別規劃','各設備有各自維養節奏','更新接续，履歷延續']],bim:[['十二層展示索引','抽出 L06，保留全棟關係','從樓層，找到區域'],['先確認系統來源','上游、設備、下游連通','沿選中路徑查閱設備'],['DEMO-L06-P01','所屬系統與維養工作','設備身份，連結文件索引'],['八條系統管線示意','遮蔽打開，給水路徑顯露','第四條給水路徑 → P-01']]};

 function scene(mode,id,s,seed){
  const n=Number(id[1])-1,at=.3+n*.35;
  let art='',title=TITLES[mode]?.[n],caption=CAPTIONS[mode]?.[n]?.[s]||'',note=mode==='data'?'非即時資料 · 展演判讀':'概念圖解 · 非現場執行紀錄';
  const L=(x,y,v,a=at,size=32)=>label(x,y,v,a,size);
  if(mode==='idle'&&id==='s1'){
   art=g(at,tower(180,160,4),1.5)+`<g data-ap-move="${s===0?'0,0':s===1?'0,-85':'55,-75'}" data-ap-at="${at+1.1}">`+g(at+.8,slab(215,410,370,90))+
    path('M270 392V220H565V343H450',at+1.2,'stroke-width="15"')+flow('M270 392V220H565V343H450',at+2.4)+`</g>`;
   // Stages 1/2 are complete exhibits, not left-side references for stage 3.
   // Visible model bounds: x=180..675; y=95..430 / 95..402.
   // Centre the exhibit at (485,280); keep the label in its own reading row.
   if(s<2)art=`<g class="ap-si-model" transform="translate(57.5 ${s===0?17.5:31.5})">${art}</g>`;
   art+=L(s<2?485:450,540,['結構與服務層','服務層獨立抽離','可接近的維養接口'][s],at+2.6,38);
   if(s===2)art+=g(at+1,`<circle cx="505" cy="268" r="67" class="ap-selected"/>`)+path('M560 304L715 433',at+2)+icon('tools',680,420,100,at+3);
  }
  if(mode==='idle'&&id==='s2'){
   art=g(at,documentArt(205,35,490,445),1.1)+L(450,103,'查驗依據',at+1,38);
   ['建材','工法','設備'].forEach((v,i)=>{art+=g(at+1+i*.35,t(250,190+i*85,v,37));art+=path(`M525 ${181+i*85}l20 20 39-43`,at+1.5+i*.4,'stroke-width="7"');});
   if(s>=1)art+=g(at+2.6,`<circle cx="676" cy="409" r="61" class="ap-stamp"/>`)+icon('check',630,363,91,at+2.9);
   if(s===2)art+=path('M450 480V530',at+3.4)+icon('record',230,493,90,at+3.6)+L(480,570,'建築履歷',at+4.4,37);
  }
  if(mode==='idle'&&id==='s3'){
   art=g(at,slab(265,190,280,90))+icon('building',358,40,145,at)+L(450,255,'BIM 建築資訊',at+1.2,40);
   const ic=['record','clock','record'][s],name=['建築與設備建檔','維養計畫','更新資訊回存'][s];
   art+=icon(ic,380,346,140,at+1.3)+path(s===2?'M450 338V276':'M450 276V338',at+2.4)+flow(s===2?'M450 338V276':'M450 276V338',at+3.4)+L(450,554,name,at+3.5,42);
   if(s===2)art+=g(at+3.8,`<rect x="284" y="29" width="334" height="249" rx="30" class="ap-selected"/>`);
  }
  if(mode==='idle'&&id==='s4'){
   if(s===0){art=g(at,`<path class="ap-solid-side" d="M640 90l110-55v350l-110 70Z"/><path class="ap-solid-face" d="M150 90h490v365H150Z"/><path class="ap-solid-top" d="M150 90l110-55h490L640 90Z"/>`,1.4);
    for(let i=0;i<3;i++)art+=g(at+.5+i*.3,`<path class="ap-thin" d="M150 ${180+i*105}h490"/><rect x="184" y="${110+i*105}" width="99" height="57" class="ap-solid-top"/><rect x="310" y="${110+i*105}" width="99" height="57" class="ap-solid-top"/>`);
    art+=g(at+1.5,`<path fill="#07131e" stroke="currentColor" stroke-width="4" d="M448 110h165v323H448Z"/><path class="ap-thin" d="M452 205h157M452 316h157"/>`)+icon('pump',476,224,110,at+2)+L(450,555,'建築剖面｜設備位置',at+3.2,39);
   }
   else if(s===1)art=g(at,`<g transform="translate(45 80) scale(.43)">${tower(0,0,5)}</g>`)+path('M228 185V297H433',at+1.3)+g(at+2,pump(382,165,1.4),1.2,'data-ap-move="45,0"')+L(590,505,'P-01｜設備身份',at+3.2,40);
   else art=g(at,pump(285,15,.9))+L(450,225,'P-01',at+.5,35)+path('M450 235V298',at+1.1)+g(at+2,documentArt(235,304,430,210))+L(450,365,'設備履歷',at+2.3,40)+L(450,439,'設備身份・查閱紀錄',at+2.8,32)+L(450,570,'由位置，連到紀錄',at+3.2,38);
  }
  if(mode==='life'&&id==='s1'){
   art=g(at,`<path class="ap-pipe" d="M110 230H295M605 230H790"/><path class="ap-thin" d="M110 287H790"/><ellipse cx="450" cy="323" rx="300" ry="19" class="ap-shadow"/>`);
   const pipe=`<rect x="300" y="190" width="300" height="80" rx="12" fill="url(#ap-metal)" stroke="currentColor" stroke-width="4"/><ellipse cx="302" cy="230" rx="12" ry="40" class="ap-solid-top"/>`;
   art+=`<g data-ap-pipe="${s}" data-ap-at="${at+.5}">${pipe}</g><g data-ap-coupling="${s}" data-ap-at="${at+1.2}"><rect x="273" y="174" width="36" height="112" rx="8" class="ap-coupling"/><rect x="591" y="174" width="36" height="112" rx="8" class="ap-coupling"/></g>`;
   art+=L(450,398,['可更新的管段','接頭與更新空間','對位・接合'][s],at+1.6,42);
   if(s<2){[280,620].forEach((x,i)=>{art+=path(`M${i?617:291} 286L${x} 439`,at+2+i*.3)+g(at+3+i*.3,`<circle cx="${x}" cy="494" r="48" class="ap-solid-top"/><circle cx="${x}" cy="494" r="27" class="ap-solid-face"/>${[0,1,2,3,4,5].map(j=>`<circle cx="${x+38*Math.cos(j*Math.PI/3)}" cy="${494+38*Math.sin(j*Math.PI/3)}" r="4" fill="currentColor"/>`).join('')}`)+L(x,589,i?'預留更新空間':'可接近接口',at+3.8+i*.3,31);});}
   if(s===2)art+=path('M450 418V460',at+2.6)+icon('record',255,456,90,at+3.6)+L(505,518,'更新紀錄接續',at+3.7,36);
  }
  if(mode==='life'&&id==='s2'){
   const xs=[195,450,705];['建材','工法','設備'].forEach((name,i)=>art+=icon(['layers','tools','pump'][i],xs[i]-52,22,104,at+i*.2)+L(xs[i],175,name,at+.9+i*.2,37));
   if(s<2){['建造查驗','交付對照'].forEach((name,j)=>{art+=g(at+1+j*.7,t(12,282+j*157,name,24));xs.forEach((x,i)=>{art+=g(at+1+j*.7+i*.15,box(x-75,215+j*157,150,125));if(s>=1||j===0)art+=path(`M${x-35} ${277+j*157}l25 22 47-51`,at+1.7+j*.6+i*.2,'stroke-width="7"');});});}
   else art+=path('M450 190V237',at+1)+g(at+2,documentArt(210,242,480,274))+L(450,314,'查驗摘要',at+2.4,41)+L(450,389,'項目・階段・文件',at+2.8,35)+icon('check',390,420,110,at+3.2);
  }
  if(mode==='life'&&id==='s3'){
   art=g(at,pump(296,15,1))+L(450,238,'P-01｜給水設備',at+.9,41);
   if(s===0)art+=path('M450 258V318',at+1.3)+g(at+2.4,box(145,324,610,194))+g(at+3.1,t(190,393,'設備類別',30)+t(408,393,'加壓泵浦',40)+t(190,468,'維養範圍',30)+t(408,468,'公區設備',40));
   if(s>=1)art+=path('M450 258V303',at+1.1)+g(at+2,box(145,310,610,130))+icon('tools',170,327,92,at+2)+g(at+2.8,t(300,362,'保養與定期檢修',37)+t(300,411,'物業安排／專業執行',29));
   if(s===2)art+=path('M450 445V476',at+3)+g(at+3.8,box(145,478,610,108))+icon('record',178,493,75,at+3.8)+g(at+4.6,t(290,522,'維養紀錄欄位',34)+t(290,560,'日期・作業內容・文件編號',27));
  }
  if(mode==='life'&&id==='s4'){
   const rows=[['layers','公區｜外牆','清潔／檢視','專業作業'],['pump','公區｜加壓泵浦','保養／檢修','專業廠商'],['air','專有戶｜全熱交換器','濾網清潔','耗材更新']];
   rows.forEach(([ic,name,work,renew],i)=>{const y=16+i*185,start=at+i*.55;art+=g(start,box(35,y,830,161))+icon(ic,51,y+21,84,start)+g(start+.7,t(160,y+47,name,35));
    art+=path(`M180 ${y+92}H795`,start+1.1);
    const count=s===0?1:s===1?2:3;for(let j=0;j<count;j++)art+=g(start+2+j*.3,`<circle cx="${195+j*(i===0?285:i===1?260:245)}" cy="${y+92}" r="11" class="ap-node"/>`);
    art+=g(start+2.2,t(165,y+139,s===0?'管理範圍與工作分類':s===1?work:renew+' → 更新紀錄',31));
    if(s>0)art+=flow(`M195 ${y+92}H${s===1?450:740}`,start+2.4);
   });
  }
  if(mode==='bim'&&id==='s1'){
   const x=s===2?165:315,w=s===2?210:300,dy=s===2?25:31,baseY=110;
   let selectedFloor='';for(let i=11;i>=0;i--){let y=baseY+(11-i)*dy;const node=g(at+(11-i)*.065,`<g ${i===5?'data-ap-floor="'+s+'"':''}>${slab(x,y,w,65)}${t(i===5&&s>0?x+w-10:x-32,y+6,'L'+String(i+1).padStart(2,'0'),i===5&&s>0?30:24,'text-anchor="end"')}</g>`);if(i===5&&s>0)selectedFloor=node;else art+=node;}art+=selectedFloor;
   if(s===2)art+=path('M525 270H680V393H555V413',at+1.8)+g(at+2.8,box(335,413,440,155))+g(at+3.1,`<path class="ap-thin" d="M485 420v140M630 420v140M343 490h420"/><rect x="491" y="421" width="131" height="61" class="ap-selected"/>`)+L(555,608,'L06｜選定區域',at+3.5,35);
   else art+=L(450,572,s===0?'全棟樓層索引':'L06 抽出定位',at+2.4,39);
  }
  if(mode==='bim'&&id==='s2'){
   art=icon('water',90,28,105,at)+g(at+.9,t(243,92,'給水來源',43));
   art+=path('M142 150V244H300',at+1.2);
   if(s===0)art=g(at,box(185,35,530,315),1.1)+icon('water',340,62,220,at+.3)+L(450,322,'給水來源',at+1.4,43)+path('M450 350V440',at+1.6)+flow('M450 350V440',at+2.8)+icon('target',400,449,100,at+2.8)+L(450,595,'系統進水端',at+3.8,35);
   if(s>=1)art+=g(at+2.3,pump(300,188,1.0))+L(645,312,'P-01',at+3,44)+path('M573 280H750V418H195',at+3.2)+icon('layers',93,421,105,at+4.3)+g(at+5,t(242,498,'下游管線',43));
   if(s===2)art+=flow('M142 150V244H300',at+2.4)+flow('M573 280H750V418H195',at+4.4)+g(at+4.5,`<rect x="284" y="183" width="330" height="183" rx="20" class="ap-selected"/>`);
  }
  if(mode==='bim'&&id==='s3'){
   art=g(at,pump(285,20,1.05))+L(450,255,'P-01｜給水設備',at+1,42);
   if(s===0)art+=g(at+1.8,box(170,308,560,206))+g(at+2.6,t(212,361,'示例位置',28)+t(410,361,'L06・設備區',35)+t(212,422,'設備分類',28)+t(410,422,'加壓泵浦',35)+t(212,484,'DEMO-L06-P01',31));
   if(s===1)art+=path('M150 155H287',at+1.1)+path('M415 26V7H740V150',at+1.5)+L(178,207,'進水',at+2.3,29)+L(740,200,'出水',at+2.8,29)+path('M450 273V340',at+2.8)+g(at+3.8,box(145,350,610,169))+L(450,409,'所屬系統｜給水系統',at+4,36)+L(450,474,'維養工作｜保養／定期檢修',at+4.3,32);
   if(s===2){art+=path('M450 270V330M195 330H705M195 330V386M450 330V386M705 330V386',at+1.3);['操作資料','維養計畫','檢查紀錄'].forEach((v,i)=>art+=icon('record',139+i*255,398,110,at+2.5+i*.22)+L(195+i*255,563,v,at+3.5+i*.22,32));}
  }
  if(mode==='bim'&&id==='s4'){
   for(let i=0;i<8;i++){let x=190+i*73;const d=`M${x} 32V310Q${x} 346 ${x+20} 355L${x+20} 399`;art+=`<path d="${d}" class="ap-route-back"/>`;
    art+=path(d,at+.4+i*.1,`stroke-width="${i===3?12:7}" stroke-opacity="${i===3?1:.28}"`);art+=t(x,17,String(i+1),25,'text-anchor="middle"');
    if(i===3&&s>=1)art+=flow(d,at+1.9)+path(`M${x+20} 399V435H450V467`,at+2.3)+flow(`M${x+20} 399V435H450V467`,at+3.4);
   }
   art+=`<g data-ap-wall="${s}" data-ap-at="${at}"><rect x="130" y="50" width="667" height="337" rx="10" fill="url(#ap-wall)" stroke="#66818f" stroke-width="3"/><path d="M130 168h667M130 279h667M351 50v337M576 50v337" class="ap-wall-joints"/>${t(462,237,'管線服務層',40,'text-anchor="middle"')}</g>`;
   if(s>=1)art+=icon('pump',389,467,120,at+3.5)+L(630,554,'P-01',at+4.5,43);
  }
  if(mode==='data'){
   const snap=BOS.scenario(s,seed),metric=snap.metric,selected=snap.selected,normal=selected[1];
   const name=['溫度','濕度','CO₂ 通風','相對用電'][s],fmt=r=>s===3?r.value.toFixed(3):s<=1?r.value.toFixed(1):Math.round(r.value).toString();
   note='非即時資料 · 展演判讀';
   if(id==='s1'){
    title=name+'讀值';caption='同一指標，逐戶觀察';art=icon(['temperature','water','air','power'][s],361,12,160,.2);
    selected.forEach((r,i)=>art+=g(1.3+i*1.4,box(80,202+i*185,740,166))+g(1.8+i*1.4,t(117,248+i*185,r.id,30)+t(117,332+i*185,fmt(r),76)+t(520,330+i*185,metric.unit,40))+g(2.2+i*1.4,`<rect x="737" y="${218+i*185}" width="16" height="130" rx="8" fill="${r.color}"/>`));
   }
   if(id==='s2'){
    title=name+'分布';caption='完整 108 戶｜同一套判讀條件';const valid=108-snap.missing,good=snap.histogram[0]+snap.histogram[1];
    art=`<circle cx="450" cy="227" r="160" fill="none" stroke="${BOS.bands[0].color}" stroke-width="54"/>`;
    let off=0;snap.histogram.forEach((count,i)=>{art+=`<circle cx="450" cy="227" r="160" fill="none" stroke="${BOS.bands[i].color}" stroke-width="54" pathLength="108" transform="rotate(-90 450 227)" data-ap-band="${count}" data-ap-offset="${off}" stroke-dasharray="0 108"/>`;off+=count;});
    art+=g(4.8,t(450,227,Math.round(good/valid*100)+'%',74,'text-anchor="middle"')+t(450,274,'藍綠戶別比例',30,'text-anchor="middle"'));
    snap.histogram.forEach((count,i)=>{const col=i%3,row=Math.floor(i/3),x=80+col*260,y=450+row*80;art+=g(4.8,`<rect x="${x}" y="${y-25}" width="21" height="42" rx="5" fill="${BOS.bands[i].color}"/>`+t(x+34,y-7,`${BOS.bands[i].min}–${BOS.bands[i].max} 分`,24)+t(x+34,y+27,count+' 戶',30));});
   }
   if(id==='s3'){
    title='全棟戶別｜'+name+'評分';caption='';art='';for(let u=1;u<=9;u++)art+=t(132+(u-1)*80,31,'U'+String(u).padStart(2,'0'),24,'text-anchor="middle"');
    for(let f=12;f>=1;f--){const y=51+(12-f)*40;art+=t(71,y+25,'L'+String(f).padStart(2,'0'),24,'text-anchor="end"');for(let u=1;u<=9;u++){const r=snap.records.find(r=>r.f===f&&r.u===u),sel=metric.pair.includes(r.id);art+=`<rect data-house="${r.id}" data-score="${r.score}" x="${96+(u-1)*80}" y="${y}" width="71" height="32" rx="5" fill="${r.color}" style="fill:${r.color}" data-ap-cell="${f}" ${sel?'class="ap-selected ap-house-selected"':''}/>`;}}
    BOS.bands.forEach((b,i)=>art+=`<rect x="${78+i*163}" y="558" width="19" height="19" rx="4" fill="${b.color}"/>`+t(105+i*163,576,b.min+'–'+b.max,24));
   }
   if(id==='s4'){
    title='每個分數，都有依據';caption='讀值與判讀，連回同一戶';
    const condition=['目標帶 24–26°C','濕度範圍 30–50% RH','室內外 CO₂ 差值 ≤400 ppm','同條件用電中位數基準'][s];
    art=g(.2,t(450,43,normal.id,32,'text-anchor="middle"'))+g(.6,t(450,133,fmt(normal)+' '+metric.unit,64,'text-anchor="middle"'))+path('M450 162V211',1.5)+g(2.6,box(89,220,722,92))+L(450,278,condition,2.8,34)+path('M450 323V367',3.1)+g(4.2,t(450,462,normal.score+' 分',98,`text-anchor="middle" style="fill:${normal.color}"`))+icon('record',190,514,67,4.9)+L(493,557,'讀值・判讀版本・紀錄索引',5.4,30);
   }
  }
  return {title,caption,note,art};
 }
 // Tighten empty drawing margins, never scale the physical opening or shrink text.
 // Each frame includes the full animation travel, labels and result state.
 function framing(mode,id,s){
  const frames={idle:['130 70 710 500','180 20 580 580','240 15 430 570',s===0?'125 15 660 570':s===1?'25 60 850 490':'190 10 520 585'],
   life:['85 50 730 565','0 0 820 550',s===0?'120 0 660 550':'120 0 660 605','20 0 865 570'],
   bim:[s===0?'230 30 470 565':s===1?'225 30 625 565':'115 20 690 600','70 0 710 610','85 0 710 590','125 0 700 590'],
   data:['65 0 770 565','60 25 790 540','15 0 825 600','70 0 760 580']};
  return frames[mode]?.[Number(id[1])-1]||'0 0 900 620';
 }
 function isBrandStandby(){try{return (globalThis.ExIntro?.enabled?ExIntro.read():state).standby===true}catch{return false}}
 // Exact official-logo pixels, with the same neighbour cleanup as the ending.
 const brandLogo=new Image();brandLogo.src=new URL('assets/logo.png',new URL(document.body.dataset.view==='single'?'../':'./',location.href)).href;
 brandLogo.onload=()=>{[[0,597],[611,412],[1105,347],[1416,475]].forEach(([x,w],i)=>{
  const c=document.createElement('canvas');c.width=w;c.height=413;const ctx=c.getContext('2d');ctx.drawImage(brandLogo,x,0,w,413,0,0,w,413);
  if(i===2)ctx.clearRect(311,0,36,315);if(i===3)ctx.clearRect(0,315,93,98);
  document.documentElement.style.setProperty(`--sb-glyph-${i}`,`url("${c.toDataURL()}")`);
 })};
 function brandMarkup(id){const main=id==='main',i=['a','b','c','d'].indexOf(id),portrait=['s5','s6'].includes(id);
  return `<article class="panel standby-panel sb-panel ${main?'sb-main':portrait?'portrait sb-portrait':'sb-letter'}" data-id="${id}" style="--sb-glyph:var(--sb-glyph-${i<0?(id==='s5'?0:3):i});--sb-delay:-${Math.max(0,i)*3}s"><div class="sb-depth" aria-hidden="true"></div>${main?'':'<div class="sb-glyph" aria-hidden="true"></div>'}<img class="sb-logo" src="${document.body.dataset.view==='single'?'../':''}assets/logo.png" alt="ANLB INSIDE">${main?'<strong>第五代住宅宣言</strong><span>AI原生建築生命體</span>':''}</article>`;
 }
 function markup(id){if(!ids.includes(id))return brandMarkup(id);return `<article class="panel ap-output" data-id="${id}"><div class="ap-live" data-live-clock="ap-${id}" data-ap-id="${id}"></div></article>`}
 function shell(id){return `<div class="ap-bleed"><div class="ap-kv" aria-hidden="true"><i></i><i></i></div></div><div class="ap-opening"><div class="ap-kv" aria-hidden="true"><i></i><i></i></div><div class="ap-layout"><header class="ap-header"><span class="ap-kicker"></span><img src="${document.body.dataset.view==='single'?'../':''}assets/logo.png" alt="ANLB INSIDE"><h1></h1></header><div class="ap-art"></div><footer class="ap-footer"><p></p><small></small></footer></div><div class="ap-brand"><img src="${document.body.dataset.view==='single'?'../':''}assets/logo.png" alt="ANLB INSIDE"></div></div><div class="ap-guides"><div class="ap-opening-outline"></div><div class="ap-safe-outline"></div><div class="ap-grid"></div><span>${id.toUpperCase()}</span></div>`}
 function svg(art){return `<svg viewBox="0 0 900 620" class="ap-svg" role="img" aria-label="開孔版段落圖解"><defs><linearGradient id="ap-metal" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#608093"/><stop offset=".26" stop-color="#d4e0e4"/><stop offset=".33" stop-color="#597080"/><stop offset=".78" stop-color="#243845"/><stop offset="1" stop-color="#597887"/></linearGradient><linearGradient id="ap-wall" x2=".8" y2="1"><stop stop-color="#34434b"/><stop offset="1" stop-color="#111e29"/></linearGradient></defs>${art}</svg>`}
 function updateMotion(el,s){
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;let time=s.elapsed||0;
  if(reduced)time=100;
  // Narration's short BOS beats display their completed graph, matching existing timing.
  if(s.shortBeat)time=18;
  const p=(at,span=.8)=>ease((time-at)/span);
  el.querySelectorAll('[data-ap-at]').forEach(e=>{const at=+e.dataset.apAt;e.style.opacity=p(at,+e.dataset.apSpan||.8);if(e.dataset.apMove){const[x,y]=e.dataset.apMove.split(',').map(Number),q=p(at,1.8);e.setAttribute('transform',`translate(${x*q} ${y*q})`);}});
  el.querySelectorAll('[data-ap-draw]').forEach(e=>{const len=e.getTotalLength();e.style.strokeDasharray=len;e.style.strokeDashoffset=len*(1-p(+e.dataset.apDraw,+e.dataset.apSpan||1.1));e.style.opacity=p(+e.dataset.apDraw,.25)});
  el.querySelectorAll('[data-ap-icon]').forEach(e=>{const at=+e.dataset.apIcon;e.style.opacity=p(at,.4);e.querySelectorAll('path,rect,circle').forEach(n=>{const len=n.getTotalLength();const a=at+(n.classList.contains('ap-detail')?.6:0);n.style.strokeDasharray=len;n.style.strokeDashoffset=len*(1-p(a,.8));});});
  el.querySelectorAll('[data-ap-flow]').forEach(e=>{e.style.opacity=p(+e.dataset.apFlow,.4)*.9;e.style.strokeDashoffset=reduced?'0':String(-time*46);});
  el.querySelectorAll('.ap-selected').forEach(e=>{const pulse=reduced?1:time%5<.4||time%5>=1&&time%5<1.4||time%5>=2&&time%5<2.4?1:.5;e.style.strokeOpacity=pulse});
  el.querySelectorAll('[data-ap-band]').forEach(e=>{const count=+e.dataset.apBand,off=+e.dataset.apOffset,shown=count*p(1.5,3.2);e.setAttribute('stroke-dasharray',`${shown} ${108-shown}`);e.setAttribute('stroke-dashoffset',-off);});
  el.querySelectorAll('[data-ap-cell]').forEach(e=>e.style.fillOpacity=.22+.78*p(.3+(12-Number(e.dataset.apCell))*.17,1));
  el.querySelectorAll('[data-ap-floor]').forEach(e=>{const seg=+e.dataset.apFloor,q=p(.8,1.8);e.setAttribute('transform',`translate(${seg?150*q:0} ${seg===2?-10*q:0})`)});
  el.querySelectorAll('[data-ap-wall]').forEach(e=>{const seg=+e.dataset.apWall,q=seg?p(+e.dataset.apAt+.5,1.8):0;e.setAttribute('transform',`translate(${-200*q} ${-70*q})`);e.style.opacity=1-q});
  el.querySelectorAll('[data-ap-pipe]').forEach(e=>{const seg=+e.dataset.apPipe,at=+e.dataset.apAt;let y=seg===1?-128*p(at,1.8):0;
   if(seg===2&&!reduced){const c=Math.max(0,time-at)%5.8;y=c<2?-128*(1-ease(c/2)):c<3.5?0:c<4.8?-128*ease((c-3.5)/1.3):-128;}
   e.setAttribute('transform',`translate(0 ${y})`);});
  el.querySelectorAll('[data-ap-coupling]').forEach(e=>{const seg=+e.dataset.apCoupling;let q=seg===1?1-p(+e.dataset.apAt,1):1;
   if(seg===2&&!reduced){const c=Math.max(0,time-(+e.dataset.apAt-.7))%5.8;q=c<1.4?0:c<2.5?ease((c-1.4)/1.1):c<3.5?1:c<4.2?1-ease((c-3.5)/.7):0;}
   [...e.children].forEach((part,i)=>{part.style.opacity=.25+.75*q;part.setAttribute('transform',`translate(${(i?1:-1)*44*(1-q)} 0)`)});});
 }
 function tick(){
  requestAnimationFrame(tick);if(document.hidden||!config)return;
  let s;try{s=globalThis.ExIntro?.enabled?ExIntro.read():state;}catch{return}
  if(review&&qa){s={mode:qa.mode,segment:qa.segment,elapsed:qa.time+(qa.playing?(performance.now()-qaReceived)/1000:0),segmentDuration:qa.mode==='data'?18:12,scenarioSeed:qa.seed,playing:qa.playing,standby:['standby','ready'].includes(qa.phase),narration:{phase:qa.phase,chapter:qa.phase==='ending'?4:0}};view=qa.view;}
  const ending=s.narration?.chapter===4||s.narration?.phase==='ending';
  document.querySelectorAll('.ap-live').forEach(el=>{
   const id=el.dataset.apId,c=config.screens[id];if(!el.children.length)el.innerHTML=shell(id);
   const scale=c.height/900,w=c.widthMm*3,safe=c.safeMm*3,b=c.bleedMm;
   el.style.setProperty('--ap-color',colors[s.mode]||colors.idle);el.dataset.phase=ending?'ending':s.standby?s.narration?.phase||'standby':'chapter';el.dataset.view=review?view:'content';
   const opening=el.querySelector('.ap-opening');opening.style.cssText=`left:${c.x}px;top:${c.y}px;width:${w}px;height:900px;transform:scale(${scale});--ap-safe:${safe}px`;
   const bleed=el.querySelector('.ap-bleed');bleed.style.cssText=`left:${c.x-b.left*c.height/300}px;top:${c.y-b.top*c.height/300}px;width:${(c.widthMm+b.left+b.right)*c.height/300}px;height:${(300+b.top+b.bottom)*c.height/300}px`;
   bleed.querySelector('.ap-kv').style.cssText=`left:${b.left*c.height/300}px;top:${b.top*c.height/300}px;width:${w}px;height:900px;transform:scale(${scale});transform-origin:0 0;overflow:visible`;
   const guides=el.querySelector('.ap-guides');guides.style.cssText=`left:${c.x}px;top:${c.y}px;width:${w*scale}px;height:${c.height}px;--safe:${safe*scale}px`;
   const layout=el.querySelector('.ap-layout');const key=[s.mode,s.segment,s.scenarioSeed].join(':');
   if(layout.dataset.key!==key){const a=scene(s.mode,id,s.segment,s.scenarioSeed||20260915);layout.dataset.key=key;layout.dataset.wrap=a.title.includes('\n')?'1':'0';layout.querySelector('h1').textContent=a.title;layout.querySelector('.ap-kicker').textContent=`${id.toUpperCase()} / ${['idle','life','bim','data'].indexOf(s.mode).toString().padStart(2,'0')}`;layout.querySelector('.ap-art').innerHTML=svg(a.art);layout.querySelector('.ap-svg').setAttribute('viewBox',framing(s.mode,id,s.segment));layout.querySelector('.ap-footer p').textContent=a.caption;layout.querySelector('small').textContent=a.note;}
   updateMotion(layout,s);
  });
 }

 requestAnimationFrame(tick);

 return {supports:id=>ids.includes(id)||(['a','b','c','d','main','s5','s6'].includes(id)&&isBrandStandby()),markup,scene,updateMotion,getConfig:()=>config};
})();
