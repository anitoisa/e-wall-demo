from pathlib import Path
import json,re,subprocess,difflib,wave,hashlib
import numpy as np
from functools import lru_cache
P=Path(__file__).resolve().parents[1]
A=P/'alignment'
GROUPS=[
['傳統的建築，|設計圖說、設備文件和維養紀錄，','可能隨著時間與人員更替，|逐漸散失。','在這裡，|我們用生命履歷與數位分身，','為建築保留記憶。','從建造時留下的資料，|到日後每一次保養與更新，','讓新的紀錄接續累積，','也讓過去的經驗|能夠回頭查閱。','當資訊有了對應的位置與身分，','接手的人，就能理解這棟建築|曾經受到哪些照顧。','社區的管理，|也不必每一次都從零開始。'],
['完工，是生活的開始，|也是長期維養的起點。','日夜交替，年份向前，|建築的履歷也持續累積。','從建造查驗，|到日常保養與設備更新，','依據使用狀況，|逐步調整維養計畫。','以一百二十年的長壽建築為願景，|需要持續的照顧與準備。','管理者更替，紀錄一起交接，','讓照顧建築的經驗，|跨越世代。'],
['有了紀錄，下一個問題是：|它在建築的哪裡？','從整棟建築進入樓層，','看清給水、排水與消防系統|的空間關係。','沿著管線找到設備，','再查閱對應的身分、|文件與維養紀錄。','數位分身，|把空間與資訊連在一起，','讓查找有方向，|後續的檢查與維養有依據。'],
['建築每天的運作，|又該怎麼理解？','分布各處的感測訊號，|逐步匯集，','形成理解全棟運作的線索。','環境讀值與用電資訊，','回到各自的位置、條件與紀錄，','才能看出差異，支持查核。','從全棟到每一戶，|從當下讀值到持續觀察，','讓健康、安全與低碳的管理目標，','有資訊作為依據。'],
['從設計與品質，到生命履歷；','從空間定位，到日常管理。','寶舖帶來的，是安心的空間，','也是讓安心延續的方法。']]
CONVERTED={}
@lru_cache(maxsize=None)
def conv(s):
 if s in CONVERTED:return CONVERTED[s]
 return subprocess.run(['opencc','-c','t2s.json'],input=s,text=True,capture_output=True,check=True).stdout
def norm(s):return ''.join(c.lower() for c in s.replace('120','一百二十') if c.isalnum())
strings=sorted({t['text'] for f in A.glob('0*.json') for seg in json.loads(f.read_text()).get('transcription',[]) for t in seg['tokens'] if '\n' not in t['text']})
converted=subprocess.run(['opencc','-c','t2s.json'],input='\n'.join(strings),text=True,capture_output=True,check=True).stdout.split('\n')
CONVERTED.update(zip(strings,converted))
VERSION='full-wall-20260918-v1'
AUDIT=[];ALL=[];maps=[];pcm=[]
for ch,f in enumerate(sorted(P.glob('*.wav'))):
 
 if not (A/(f.stem+'.json')).exists():continue
 raw=json.loads((A/(f.stem+'.json')).read_text()); toks=[]
 for seg in raw['transcription']:
  for t in seg['tokens']:
   if t['text'].startswith('[_'):continue
   chars=norm(conv(t['text']));a,b=t['offsets']['from'],t['offsets']['to']
   if not chars or a<0 or b<a:continue
   for i,c in enumerate(chars):toks.append((c,round(a+(b-a)*i/len(chars)),round(a+(b-a)*(i+1)/len(chars))))
 rec=''.join(t[0] for t in toks);can=norm(conv(''.join(GROUPS[ch]).replace('|','')));mapping={};diff=[]
 sm=difflib.SequenceMatcher(None,can,rec,autojunk=False)
 for tag,a,b,c,d in sm.get_opcodes():
  if tag=='equal':
   for i in range(b-a):mapping[a+i]=toks[c+i][1:]
  else:
   diff.append({'kind':tag,'script':can[a:b],'asr':rec[c:d]})
   left=toks[min(c,len(toks)-1)][1];right=toks[d-1][2] if d>c else left
   for i in range(b-a):mapping[a+i]=(round(left+(right-left)*i/max(1,b-a)),round(left+(right-left)*(i+1)/max(1,b-a)))
 with wave.open(str(f)) as w:
  rate=w.getframerate();dur=round(w.getnframes()/rate*1000);v=np.frombuffer(w.readframes(w.getnframes()),dtype='<i2').astype(float)/32768
 step=round(rate*.01);r=np.array([np.sqrt(np.mean(v[i:i+step]**2)) for i in range(0,len(v),step)])
 active=r>=.006;sil=[];st=None
 for i,isactive in enumerate(active):
  if not isactive and st is None:st=i
  if isactive and st is not None:
   if i-st>=18:sil.append([st*10,i*10])
   st=None
 if st is not None:sil.append([st*10,len(r)*10])
 pcm.append({'chapter':f'{ch:02}','silenceMs':sil,'speechStartMs':int(np.flatnonzero(active)[0])*10,'speechEndMs':(int(np.flatnonzero(active)[-1])+1)*10})
 cursor=0;cues=[]
 for g in GROUPS[ch]:
  chars=norm(conv(g.replace('|','')));idx=can.index(chars,cursor);endidx=idx+len(chars)-1
  start,end=mapping[idx][0],mapping[endidx][1]
  cues.append({'id':f'{ch:02}-{len(cues)+1:02}','lines':g.split('|'),'speechStartMs':start,'speechEndMs':end,'rawStartMs':start,'rawEndMs':end})
  cursor=endidx+1
 maps.append({'chapter':f'{ch:02}','canonical':can,'chars':{str(k):v for k,v in mapping.items()}})
 AUDIT.append({'chapter':f'{ch:02}','match':sm.ratio(),'differences':diff,'cues':cues})
 # Envelope sourced from PCM, same schema as accepted archive.
 r20=np.array([np.sqrt(np.mean(v[i:i+2*step]**2)) for i in range(0,len(v),2*step)])
 levels=np.clip((r20-.008)*5,0,1)
 (P/f'{ch:02}_envelope.json').write_text(json.dumps({'kind':'measured-pcm-rms-not-synthetic','chapter':f'{ch:02}','audio':f.name,'durationMs':dur,'stepMs':20,'gain':5,'noiseFloor':.008,'levels':np.round(levels,4).tolist()},ensure_ascii=False,indent=2)+'\n')
(A/'raw-alignment.json').write_text(json.dumps(AUDIT,ensure_ascii=False,indent=2))
(A/'character-maps.json').write_text(json.dumps(maps,ensure_ascii=False))
(A/'pcm-boundaries.json').write_text(json.dumps(pcm,ensure_ascii=False,indent=2))
for x in AUDIT:
 print(x['chapter'],round(x['match'],3),x['differences'])
 for c in x['cues']:print(c['id'],c['rawStartMs'],c['rawEndMs'],'/'.join(c['lines']))
