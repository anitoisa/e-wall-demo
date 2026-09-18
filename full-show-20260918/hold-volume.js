// Original materials only: no duplicated mesh, added edges, or score-fill changes.
export function holdVolume(s,st,now){
 const id=s.kind==='bim-d'?'s3':s.kind.split('-')[1],a=globalThis.ExHold?.clock(st.mode,id,st.segment,now);
 s.attentionMaterials??=new Map();
 for(const [object,entry] of s.attentionMaterials){
  if(entry.material.emissive)entry.material.emissive.copy(entry.emissive);
  entry.material.emissiveIntensity=entry.intensity;
  if(object.isLineSegments&&s.kind!=='data-a')entry.material.opacity=entry.opacity;
 }
 if(!a?.on||!s.ready)return;
 // Existing flow points travel briefly, hold, then continue without replaying reveal.
 const cycle=Math.floor((a.decor+a.period*.31)/a.period),within=(a.decor+a.period*.31)%a.period;
 s.holdFlow?.(cycle*2.5+Math.min(within,2.5));
 const candidates=s.kind==='data-a'?[]:s.holdTargets?.(st.segment)||[];
 for(const target of candidates){
  if(!target?.material||Array.isArray(target.material))continue;
  let shown=true;for(let p=target;p&&p!==s.group;p=p.parent)if(!p.visible)shown=false;
  if(!shown)continue;
  let entry=s.attentionMaterials.get(target);
  if(!entry){
   const material=target.material.clone();
   entry={material,emissive:material.emissive?.clone(),intensity:material.emissiveIntensity??0,opacity:material.opacity};
   target.material=material;s.attentionMaterials.set(target,entry);
  }
  if(entry.material.emissive){
   entry.material.emissive.copy(entry.material.color);
   entry.material.emissiveIntensity=.08+.25*a.breathe;
  }
 }
}
