/* Source-grounded review. No hardware or external service access. */
const REVIEW_CAPABILITIES=['建構維養履歷','智慧大腦監測','滾動調整維養週期','預判設備更替','建築履歷傳承'];
LIFE_EVENTS.splice(0,5,'可維養設計，從建造開始','管線更新，建築持續服務','系統世代升級','跨世代持有與維養','邁向長壽建築');
GUIDES.life=['生命軸從可維養設計開始；五項能力持續作用，不與某一年綁定。','不同設備各有維養節奏，公區與家中也有不同分工。','系統更新、履歷接續，邁向長壽建築。'];
GUIDES.bim=['全棟到L06，再到P-01；位置均為導覽示例。','沿給水路徑找到設備，查閱維養工作摘要。','BIM設備身份連到操作資料、維養計畫與檢查紀錄。'];
GUIDES.data=['溫度情境：感測讀值與展演判讀分開；A看戶別空間。','濕度情境：比較同一指標，不把分數當成故障診斷。','CO₂用於通風觀察；不代表全部十二合一感測項目。','用電資料另一路匯入BOS，不預設來自環境感測器。'];
MODES.forEach(m=>{m.cues=GUIDES[m.id];});
Object.assign(MODES.find(m=>m.id==='data'),{claim:'環境感測與\n用電資訊整合',note:'環境讀值與用電資料分流匯入BOS；分數為展演判讀。'});
const REVIEW_NOTE='文件導讀與情境圖解 · 非現場執行紀錄';
function capabilityBand(){return `<div class="capability-band" data-key="ongoing-capabilities"><span>從建造開始，持續運作</span>${['建構<br>維養履歷','智慧大腦<br>監測','滾動調整<br>維養週期','預判<br>設備更替','建築履歷<br>傳承'].map((t,i)=>`<div>${icon(['record','pulse','clock','tools','handover'][i])}<b>${t}</b></div>`).join('')}</div>`;}
function maintenanceTracks(seg){const rows=[['layers','公區','外牆','清潔／檢視','專業作業'],['pipe','公區','加壓泵浦','保養／檢修','專業廠商'],['air','專有戶','全熱交換器','濾網清潔','耗材更新']];return `<div class="maintenance-tracks beat-${seg}" data-viz="parallel-maintenance"><div class="track-head"><span>管理範圍／設備</span><strong>${['依設備建立計畫','各有維養節奏','系統更新，履歷延續'][seg]}</strong></div>${rows.map(([ic,area,name,work,renew],i)=>`<section><div class="track-asset">${icon(ic)}<span>${area}</span><strong>${name}</strong></div><div class="track-path"><div class="track-rail"></div>${[0,1,2,3].map(n=>`<i class="track-node ${seg>0?'lit':''}" style="left:${8+n*(i===0?25:i===1?23:21)}%;--n:${n}">${n===3?icon('record'):icon(seg===2&&n===2?'tools':'check')}</i>`).join('')}<div class="track-labels"><span>${seg===0?'工作分類':work}</span><span>${seg===2?'更新紀錄接續':renew}</span></div></div></section>`).join('')}<p>${['公區與專有戶，分別規劃','事件間距為概念，不是統一更換年限','延續至120年管理目標；各設備依計畫更新'][seg]}</p></div>`;}
function maintenanceRecord(seg){return `<div class="review-record"><header>${icon('pipe')}<div><span>導覽設備 · DEMO-L06-P01</span><strong>P-01｜給水設備</strong></div></header><div class="record-fields ${seg>=1?'shown':''}"><section><span>維養工作</span><strong>保養與定期檢修</strong></section><section><span>作業分工</span><strong>物業安排／專業執行</strong></section></div><div class="record-index ${seg===2?'shown':''}">${icon('record')}<div><span>紀錄欄位示例</span><strong>日期 · 作業內容 · 文件編號</strong></div></div></div>`;}
function responsibility(seg){return artSVG('住戶、物業、專業廠商分工',`${wire('M260 445H1480')}${[['manager','住戶','日常清潔'],['handover','物業','公區維養安排'],['tools','專業廠商','設備檢修']].map(([ic,t,d],i)=>`<g class="${i===seg?'current':'muted'}">${pic(ic,140+i*580,25,230)}${tx(255+i*580,345,t,'large','middle')}${tx(255+i*580,405,d,'','middle')}${pic('record',195+i*580,470,120)}</g>`).join('')}<path class="record-travel" d="M255 445H1415"/>`);}
function deviceDetails(seg){const rows=[ [['示例位置','L06 · 設備區'],['所屬系統','給水系統'],['設備分類','加壓泵浦']], [['維養工作','保養／定期檢修'],['安排單位','物業管理'],['執行角色','專業廠商']], [['計畫來源','公區生命週期計畫'],['文件類別','操作／維養／檢查'],['定位方式','設備身份關聯']] ][seg];return `<aside class="review-equipment"><span>DEMO-L06-P01</span><h2>P-01</h2><h3>${['設備身份與系統','維養工作摘要','設備文件索引'][seg]}</h3>${rows.map(([l,v])=>`<section><span>${l}</span><strong>${v}</strong></section>`).join('')}<p>設備／位置為示例；工作分類依公區計畫</p></aside>`;}
function systemRoute(seg){return artSVG('上游給水、P-01與下游管線',`${wire('M360 280H720',seg>=1)}${wire('M1020 280H1380',seg>=1)}${[['water','給水來源'],['pipe','P-01'],['layers','下游管線']].map(([ic,t],i)=>`<g class="${i===0||seg>=1?'current':'muted'}">${pic(ic,110+i*600,90,240)}${tx(230+i*600,445,t,'large','middle')}</g>`).join('')}${seg===2?'<circle class="locate-ring" cx="830" cy="210" r="145"/>':''}${tx(870,580,['先確認系統來源','上游、設備、下游連通','沿選中路徑查閱設備'][seg],'','middle')}`);}
function sourceSignals(seg){const env=seg<3;return `<div class="source-signals" data-source="${env?'environment':'energy'}"><div class="source-branch ${env?'selected':''}"><h2>WELL FM環境感測</h2><div>${['temperature','water','air'].map((ic,i)=>`<section class="${i===seg?'active':''}">${icon(ic)}<span>${['溫度','濕度','CO₂'][i]}</span></section>`).join('')}</div></div><div class="source-branch ${!env?'selected':''}"><h2>用電資訊</h2><div><section class="${!env?'active':''}">${icon('power')}<span>獨立資料來源</span></section></div></div><svg viewBox="0 0 1600 130"><path class="art-wire ${env?'live':''}" d="M400 0V55L800 115"/><path class="art-wire ${!env?'live':''}" d="M1200 0V55L800 115"/></svg><div class="review-bos-hub">建築BOS <span>資訊整合 · 展演判讀</span></div></div>`;}
function readTrace(s){return `<div class="trace-house"><strong>${s.selected[1].id}</strong><span>${s.metric.name} · 資料追溯</span></div><div class="trace-timeline">${[['clock','採樣紀錄','情境讀值 · 非即時'],['check','判讀版本','展演規則 1.0'],['record','相關文件',s.index===3?'用電資料索引':'環境／維養資料索引']].map(([ic,t,v])=>`<section>${icon(ic)}<span>${t}</span><strong>${v}</strong></section>`).join('')}</div>`;}
const beforeSourceReview=revisionPanel;
revisionPanel=function(id){const m=state.mode,s=state.segment;
 if(m==='idle'&&id==='s1')return beforeSourceReview(id).replace('完整空間，獨立服務層','SI工法｜獨立服務層').replace('明管配置，結構分離','SI工法｜結構與管線分離').replace('維養更新，保留結構','SI工法｜可接近、可抽換');
 if(m==='idle'&&id==='s3')return nativeFrame(id,'從建造到維養的全資訊建構',['建築與設備建檔','連到維養計畫','更新資訊回存同一履歷'][s],infoLinks(s).replace('>建造<','>建檔<').replace('>交付<','>維養計畫<').replace('>維養<','>履歷更新<'),'review-long-title');
 if(m==='idle'&&id==='s4')return nativeFrame(id,'建築紀錄看得到',['建築剖面與資訊','查閱設備身份','設備連到對應紀錄'][s],recordCutaway(s).replace('品質依據','設備身份').replace('維養紀錄','對應紀錄'));
 if(m==='life'&&id==='a')return beforeSourceReview(id).replace('</article>',capabilityBand()+'</article>');
 if(m==='life'&&id==='d')return nativeFrame(id,'120年資產維養計畫','',maintenanceTracks(s),'review-maintenance',REVIEW_NOTE);
 if(m==='life'&&id==='s1')return nativeFrame(id,'為持續更新而設計',['接口可接近，管線可抽換','抽換管段，保留結構','更新資訊，連回建築履歷'][s],volume('life-s1',edgeLabel(80,['管線接口','管段抽換','更新紀錄'][s],['獨立維養空間','結構保留','同一設備索引'][s])),'has-volume',REVIEW_NOTE);
 if(m==='life'&&id==='s2')return beforeSourceReview(id).replace('非即時資料','查驗欄位示例 · 非實際完成證明');
 if(m==='life'&&id==='s3')return nativeFrame(id,'設備維養履歷','照顧設備，也留下維養資訊',maintenanceRecord(s),'review-record-panel',REVIEW_NOTE);
 if(m==='life'&&id==='s4')return nativeFrame(id,'維養各有分工',['住戶日常照顧','物業安排公區維養','專業廠商檢修，交回紀錄'][s],responsibility(s),'',REVIEW_NOTE);
 if(m==='bim'&&id==='d')return nativeFrame(id,'BIM設備資訊','找到設備，也找到維養方法',volume('bim-d',deviceDetails(s)),'has-volume equipment-panel review-device',REVIEW_NOTE);
 if(m==='bim'&&id==='s2')return nativeFrame(id,'設備系統關聯','上游、設備、下游，一路查閱',systemRoute(s),'','管線拓撲示例 · 非實際BIM座標');
 if(m==='bim'&&id==='s3')return beforeSourceReview(id).replace('檢查文件','維養計畫').replace('維養紀錄','檢查紀錄').replace('例行檢查','工作與分工').replace('保養計畫','日期與文件');
 if(m==='bim'&&id==='s4')return beforeSourceReview(id).replace('八條管線，清晰分列','八條示意管線，清晰分列').replace('給水管線 04','選中給水路徑');
 // User-confirmed exception: keep data B/C exactly as the approved baseline.
 if(m==='data'&&id==='b')return beforeSourceReview(id).replace('環境感測與用電資訊整合','WELL FM｜從全棟訊號，看見每戶差異');
 if(m==='data'&&id==='c')return beforeSourceReview(id);
 if(m==='data'&&id==='d')return beforeSourceReview(id).replace('非即時資料','非即時資料 · 展演判讀，非WELL FM官方評分');
 if(m==='data'&&id==='s4'){const snap=BOS.snapshot(s,revisionElapsed(),state.scenarioSeed);return nativeFrame(id,'從讀值，查到維養資料','讀值、判讀與文件，依序可查',readTrace(snap),'review-long-title','非即時資料 · 文件關聯示例');}
 return beforeSourceReview(id);
};
document.title='ANLB｜建築中控台';
