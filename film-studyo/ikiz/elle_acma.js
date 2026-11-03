// Shop furniture only. This module has no PLC, MQTT, stock or order access.
export function elleAcmaKur(T,scene,IKIZ){
  const tracks=[];
  const objects=[];scene.traverse(o=>{if(o.isMesh)objects.push(o);});
  const find=s=>objects.find(o=>o.name.endsWith(s));
  function group(parts,label,hinge=null,travel=null){
    parts=parts.filter(Boolean);if(!parts.length)return;
    const parent=parts[0].parent,g=new T.Group();g.name='ELLE_ACMA__'+label;parent.add(g);
    if(hinge)g.position.fromArray(hinge);
    scene.updateMatrixWorld(true);for(const p of parts)g.attach(p);
    const initial=g.position.clone(),track={value:0,target:0};tracks.push(track);
    const toggle=()=>{track.target=track.target>.5?0:1;};
    for(const p of parts)p.traverse(o=>{if(o.isMesh)o.userData.twinAction={kind:'elle',label,toggle};});
    track.pose=()=>{if(hinge)g.rotation.y=track.value*Math.PI/2;else g.position.copy(initial).addScaledVector(travel,track.value);};
    return g;
  }
  for(const [id,label]of [['NAKIT','Nakit çekmecesi'],['SARF','Fiş / sarf çekmecesi'],['COP','Çöp çekmecesi']]){
    const extra=id==='NAKIT'?[find('NAKIT_ANAHTAR_KILIDI')]:id==='SARF'?objects.filter(o=>/SARF_CEKMECE_TABAN|YEDEK_FIS_RULOSU/.test(o.name)):objects.filter(o=>/PERSONEL_COP_5L$|__COP_KAPAK$/.test(o.name));
    const g=group([find('KASA_CEKMECE_'+id),find('KASA_GOMME_KULP_'+id),...extra],label,null,new T.Vector3(-.32,0,0));
    if(g&&id!=='COP'){
      const y=id==='NAKIT'?.613:.452,z=2.397,x=2.760,m=find('KASA_CEKMECE_'+id).material;
      for(const [name,b]of [['TABAN',[x,3.130,y,y+.002,z,2.730]],['ARKA',[3.128,3.130,y,y+.08,z,2.730]],['SOL',[x,3.130,y,y+.08,z,z+.002]],['SAG',[x,3.130,y,y+.08,2.728,2.730]]]){
        // SARF already has a base. Retain its existing part.
        if(id==='SARF'&&name==='TABAN')continue;
        const dx=IKIZ.cephe58?.bilgi.deskShift_m??0;const o=new T.Mesh(new T.BoxGeometry(b[1]-b[0],b[3]-b[2],b[5]-b[4]),m);o.name='ELLE_CEKMECE_'+id+'_'+name;o.position.set((b[0]+b[1])/2+dx,(b[2]+b[3])/2,(b[4]+b[5])/2);g.add(o);o.userData.twinAction=g.children[0].userData.twinAction;
      }
    }
  }
  const door=find('PERSONEL_ESYA_KAPAK');if(door)group([door,find('PERSONEL_ESYA_KOL')],'Personel dolabı',[1.8015,0,2.855]);
  const leaves=objects.filter(o=>o.name.endsWith('UST_DOLAP_CAM_KAPAK'));
  for(const [i,leaf]of leaves.entries()){
    leaf.geometry.computeBoundingBox();const b=leaf.geometry.boundingBox;
    const handle=objects.find(o=>o.parent===leaf.parent&&o.name.endsWith('UST_DOLAP_KAPAK_GOMME_KOL')&&Math.abs(o.position.x-(leaf.position.x+b.max.x-.018))<.035);
    group([leaf,handle],'Üst dolap '+(i+1),[leaf.position.x+b.min.x,0,leaf.position.z]);
  }
  const sink=find('KIMYASAL_KAPALI_KAPAK');
  if(sink)group([sink,find('KIMYASAL_GOMME_KOL')],'Lavabo altı dolap',[2.678,0,1.5015]);
  const breaker=find('SIGORTA_PANOSU_KAPAK');
  if(breaker){
    breaker.geometry.computeBoundingBox();const b=breaker.geometry.boundingBox;
    group([breaker],'Şalter kutusu',[breaker.position.x,0,breaker.position.z+b.min.z]);
  }
  IKIZ.kancalar??=[];IKIZ.kancalar.push(dt=>{for(const t of tracks){const step=Math.max(0,Math.min(.1,dt))/.9;t.value+=Math.sign(t.target-t.value)*Math.min(step,Math.abs(t.target-t.value));t.pose();}});
  return tracks;
}
