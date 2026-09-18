from pathlib import Path
import json
P=Path(__file__).resolve().parents[1]
vers='full-wall-20260918-v1'
chap=[]
def make(ch,mode,points,labels,phases=None):
 seg=[]
 for i,label in enumerate(labels):
  obj={'segment':i if ch!=3 else [0,0,1,2,3,3][i],'startMs':points[i],'endMs':points[i+1],'durationMs':points[i+1]-points[i],'label':label}
  if phases:obj['phase']=phases[i]
  seg.append(obj)
 return {'chapter':f'{ch:02}','mode':mode,'durationMs':points[-1],'segments':seg}
chap.append(make(0,'idle',[0,44480],['建築記憶；維持現行中性品牌序章']))
chap[0]['segments'][0].update(id='00-intro',presentation='neutral-intro')
chap[0]['events']=[{'atMs':11240,'id':'memory-kept'},{'atMs':40660,'id':'governance'}]
chap.append(make(1,'life',[0,11480,26230,32720],['完工與日夜／履歷累積','查驗保養更新／依使用調整／120年願景','管理者交接／跨世代照顧']))
chap[1]['events']=[{'atMs':19760,'id':'year120','value':120}]
chap.append(make(2,'bim',[0,7430,15110,28200],['全棟到樓層；C/S1承接樓層定位','系統路徑；S2/S4承接設備查找','S3設備身分／文件／履歷；空間資訊整合']))
chap[2]['events']=[{'atMs':4970,'id':'floor-L06'},{'atMs':12900,'id':'water-route-to-P01'},{'atMs':15110,'id':'equipment-documents'}]
chap.append(make(3,'data',[0,11230,13780,16760,20520,25510,31960],['全棟感知與匯流概述','環境資訊示例：溫度','位置／條件示例：濕度','查核比較示例：CO2','全棟到每戶／持續觀察：用電比較','健康安全低碳目標／資訊支持管理'],['intro','temperature','humidity','co2','power','summary']))
chap[3]['segments'][0]['presentation']='bos-overview';chap[3]['segments'][-1]['presentation']='bos-summary'
chap[3]['metricTimingSource']='editorial illustrative rotation within semantic phrases, not spoken metric-name alignment'
chap.append({'chapter':'04','mode':'ending','durationMs':13720,'visualEndMs':18930,'segments':[],'presentation':'approved-ANLB-ending'})
notes=['BOS新稿未逐一點名四指標；中段輪播是配合泛稱環境/用電資訊的展示安排，不冒稱四個語詞的ASR落點。','BOS短段直接顯示可讀結果再局部循環，不等完整3D進場才顯示。','01年份需獨立依year120事件於19760ms到達120，不能沿舊固定28秒；中間年份視覺插值不冒稱口述錨點。','01C各段圈以段長減1000ms完成並保留已完成圈。','02water-route-to-P01門檻改用12900ms事件，移除舊14685硬碼；不宣稱與UE工程實體坐標已對齊。','03若牆現況需要更長閱讀可由wall調整示例輪播，但不得改動ASR錨點或音軌。','所有音軌原速原長；保留既有人工章間推進及03→04自動接續，順播僅QA。']
(P/'wall-timeline.json').write_text(json.dumps({'version':vers,'timeBase':'chapter-local-ms','chapters':chap,'notes':notes},ensure_ascii=False,indent=2)+'\n')
