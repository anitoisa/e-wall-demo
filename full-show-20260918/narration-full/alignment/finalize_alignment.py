from pathlib import Path
exec((Path(__file__).parent/'build_raw_alignment.py').read_text().split('for ch,f in enumerate')[0])
raw=json.loads((A/'raw-alignment.json').read_text());pcms=json.loads((A/'pcm-boundaries.json').read_text());maps=json.loads((A/'character-maps.json').read_text())
assert len(raw)==5,'All five ASRs required'
PHRASES=[
[('design','設計圖說'),('equipment','設備文件'),('maintenance','維養紀錄'),('memory','在這裡'),('build-record','從建造時留下的資料'),('update','到日後每一次保養與更新'),('accumulate','讓新的紀錄接續累積'),('look-back','也讓過去的經驗'),('identity','當資訊有了對應的位置與身分'),('handover','接手的人'),('closing','社區的管理')],
[('start','完工'),('day-night','日夜交替'),('maintenance','從建造查驗'),('adjust-plan','依據使用狀況'),('year120','以一百二十年的長壽建築為願景'),('handover','管理者更替'),('generations','讓照顧建築的經驗')],
[('intro','有了紀錄'),('floor','從整棟建築進入樓層'),('systems','看清給水'),('water','給水'),('drain','排水'),('fire','消防'),('equipment','沿著管線找到設備'),('documents','再查閱對應的身分'),('connection','數位分身'),('conclusion','讓查找有方向')],
[('intro','建築每天的運作'),('sensors','分布各處的感測訊號'),('converge','逐步匯集'),('whole-building','形成理解全棟運作的線索'),('readings','環境讀值與用電資訊'),('conditions','回到各自的位置'),('compare','才能看出差異'),('return','從全棟到每一戶'),('observe','從當下讀值到持續觀察'),('goals','讓健康'),('closing','有資訊作為依據')],
[('A','從設計與品質'),('B','到生命履歷'),('C','從空間定位'),('D','到日常管理'),('closingFirst','寶舖帶來的'),('closingSecond','也是讓安心延續的方法')]]
anchors=[];allsubs=[];checks=[];manifest=json.loads((P/'audio-manifest.json').read_text());chapters=[];offset=0
for ch,row in enumerate(raw):
 pc=pcms[ch];gaps=pc['silenceMs'];cs=row['cues'];m=maps[ch];dur=round(manifest['files'][ch]['durationSeconds']*1000)
 boundaries=[]
 for nxt in cs[1:]:
  gap=min(gaps,key=lambda g:abs(g[1]-nxt['rawStartMs']))
  assert abs(gap[1]-nxt['rawStartMs'])<=1100,(ch,nxt,gap)
  boundaries.append(gap)
 for i,c in enumerate(cs):
  c['speechStartMs']=pc['speechStartMs'] if i==0 else boundaries[i-1][1]
  c['speechEndMs']=pc['speechEndMs'] if i==len(cs)-1 else boundaries[i][0]
  show=max(c['speechStartMs'],cs[i-1]['clearMs'] if i else 0)
  c.update(showMs=show,fadeInMs=250,fadeOutMs=300,fadeOutStartMs=c['speechEndMs'],clearMs=c['speechEndMs']+300,holdAfterSpeechMs=0,target='d',confidence='ASR+canonical-script+PCM-gap-candidate',reviewRequired=True)
  c['displayDelayMs']=show-c['speechStartMs']
  assert 0<=c['displayDelayMs']<=100,(ch,c)
  assert c['speechEndMs']>show+250,(ch,c)
  assert len(c['lines'])<=2 and max(map(len,c['lines']))<=19,(ch,c)
 # Ending keeps established persistent main block, A-D phrases are supplied as separate anchors.
 ach=[]
 for aid,phrase in PHRASES[ch]:
  n=norm(conv(phrase));ix=m['canonical'].index(n);st=m['chars'][str(ix)][0];en=m['chars'][str(ix+len(n)-1)][1]
  # Onset correct to the end of a measured silence only when within 300ms.
  near=min(gaps,key=lambda g:abs(g[1]-st))
  if abs(near[1]-st)<=300:st=near[1]
  if aid=='start' or (ch==4 and aid=='A'):st=pc['speechStartMs']
  # Full phrase ending may lie within silence; clamp to earlier PCM speech edge.
  cand=[g[0] for g in gaps if st<g[0] and abs(g[0]-en)<=450]
  if cand:en=min(cand,key=lambda x:abs(x-en))
  ach.append({'id':aid,'text':phrase,'startMs':st,'endMs':max(st,en),'timingSource':'ASR-token+PCM-candidate'})
 # Refine full-clause boundaries with measured PCM pauses; 04 AB/CD re-ASR of short clips.
 overrides={
  0:{'accumulate':(23310,25350),'identity':(30670,33060),'handover':(33380,34230)},
  3:{'return':(20520,22270),'observe':(22640,24940),'goals':(25510,25810)},
  4:{'A':(100,1460),'B':(1720,2760),'C':(4010,5160),'D':(5230,6240)}
 }
 for x in ach:
  if x['id'] in overrides.get(ch,{}):
   x['startMs'],x['endMs']=overrides[ch][x['id']]
   x['timingSource']='ASR+PCM-refined' if ch!=4 else 'short-clip-ASR+PCM-refined'
 anchors.append({'chapter':f'{ch:02}','durationMs':dur,'speechStartMs':pc['speechStartMs'],'speechEndMs':pc['speechEndMs'],'anchors':ach})
 if ch==4:
  a={x['id']:x['startMs'] for x in ach};first=a['closingFirst'];second=a['closingSecond'];end=pc['speechEndMs'];fade=end+800;clear=fade+600
  cs=[{'id':'04-main-01','lines':['寶舖帶來的，是安心的空間，'],'speechStartMs':first,'showMs':first,'speechEndMs':second,'fadeInMs':600,'fadeOutStartMs':second,'fadeOutMs':0,'clearMs':second,'target':'main','confidence':'ASR+PCM-candidate','reviewRequired':True}, {'id':'04-main-02','lines':['寶舖帶來的，是安心的空間，','也是讓安心延續的方法。'],'lineRevealMs':[first,second],'speechStartMs':second,'showMs':second,'speechEndMs':end,'fadeInMs':600,'fadeOutStartMs':fade,'fadeOutMs':600,'clearMs':clear,'target':'main','confidence':'ASR+PCM-candidate','reviewRequired':True}]
  ending={'version':VERSION,'audioStatus':'new-audio-aligned-candidate','audio':manifest['files'][ch]['file'],'timeBase':'04-local-seconds',**{k:v/1000 for k,v in a.items()},'speechEnd':end/1000,'audioEnd':dur/1000,'revealDuration':2.2,'subtitleHold':.8,'subtitleFade':.6,'logoFade':1.2,'logoHold':3.,'logoStart':clear/1000,'visualEnd':(end+5600)/1000,'mainSubtitleMode':'persistent-two-line-block','mainLineRevealMs':[first,second],'note':'R7品牌收尾沿用；新語音ASR＋PCM候選，非人工聽校。main第一行持續至第二行，不重複淡入。'}
  (P/'ending-cues.json').write_text(json.dumps(ending,ensure_ascii=False,indent=2)+'\n')
 obj={'version':VERSION,'chapter':f'{ch:02}','durationMs':dur,'timeBase':'chapter-local-ms','cues':cs}
 (P/f'{ch:02}_subtitles.json').write_text(json.dumps(obj,ensure_ascii=False,indent=2)+'\n');allsubs.append(obj)
 def stamp(t):return f'{t//3600000:02}:{t//60000%60:02}:{t//1000%60:02},{t%1000:03}'
 (P/f'{ch:02}_subtitles.srt').write_text('\n\n'.join(f"{i+1}\n{stamp(c['showMs'])} --> {stamp(c['clearMs'])}\n"+'\n'.join(c['lines']) for i,c in enumerate(cs))+'\n')
 chapters.append({'id':f'{ch:02}','file':manifest['files'][ch]['file'],'sha256':manifest['files'][ch]['sha256'],'durationMs':dur,'globalAudioStartMs':offset,'globalAudioEndMs':offset+dur,'subtitleFile':f'{ch:02}_subtitles.json','envelopeFile':f'{ch:02}_envelope.json','status':'received-machine-aligned-candidate'})
 offset+=dur
 checks.append({'chapter':f'{ch:02}','maxLineChars':max(len(l) for c in cs for l in c['lines']),'subtitleCount':len(cs),'asrMatch':row['match'],'pcmSpeechEndMs':pc['speechEndMs']})
(P/'semantic-anchors.json').write_text(json.dumps({'version':VERSION,'timeBase':'chapter-local-ms','review':'machine-ASR+approved-script+PCM; not human-listening certified','chapters':anchors},ensure_ascii=False,indent=2)+'\n')
(P/'all-subtitles.json').write_text(json.dumps({'version':VERSION,'chapters':allsubs},ensure_ascii=False,indent=2)+'\n')
post=round(ending['visualEnd']*1000)-chapters[-1]['durationMs']
(P/'manifest.json').write_text(json.dumps({'version':VERSION,'scope':'local-wall-and-UE-candidates-not-production','audioDurationMs':offset,'visualPostRollMs':post,'showDurationMs':offset+post,'interChapterGapMs':0,'chapters':chapters,'wallTimeline':'wall-timeline.json','endingCues':'ending-cues.json','semanticAnchors':'semantic-anchors.json','endingMainFadeInMs':600,'review':'machine-ASR+canonical-script+PCM; human listening pending','playbackPolicy':'preserve approved wall chapter hold/iPad controls; continuous mode QA-only','globalOffsetMeaning':'concatenated active audio excluding manual waits'},ensure_ascii=False,indent=2)+'\n')
(A/'validation.json').write_text(json.dumps(checks,ensure_ascii=False,indent=2)+'\n')
print(json.dumps(anchors,ensure_ascii=False,indent=2))
