import {slulKur,slulPoz,SLUL} from '../slul.js';
import {mergeGeometries} from '../vendor/BufferGeometryUtils.js';

// Source-model amendment: split ONLY the flat transfer glazing. Rounded side
// returns stay fixed; QR uses the same four-bar implementation without changes.
export const TRANSFER29 = [
  {id:'A_TRANSFER',ist:'A',plc:12,source:'A_KOSE_A_PLEKSI_TEK_PARCA',cut:.8615,
   x0:.863,x1:1.4345,y0:.7895,y1:1.1085,keepLeft:true,jambs:[.8980,1.3780],posts:[.8815,1.3945]},
  {id:'E_TRANSFER',ist:'E',plc:13,source:'E_TESLIM_CAM_TEK_PARCA',cut:5.1645,
   x0:4.4015,x1:5.163,y0:.7895,y1:1.1085,keepLeft:false,jambs:[4.4580,5.0455],posts:[4.4415,5.1445]}
];

// World-space clipping preserves the original curved glass, UV and normals.
function cornerGeometry(T,o,cut,keepLeft){
  const g=o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone();
  g.applyMatrix4(o.matrixWorld);
  const attrs=Object.entries(g.attributes),out=Object.fromEntries(attrs.map(([k])=>[k,[]]));
  const vertex=i=>Object.fromEntries(attrs.map(([k,a])=>[k,Array.from({length:a.itemSize},(_,j)=>a.array[i*a.itemSize+j]) ]));
  const inside=v=>keepLeft?v.position[0]<=cut:v.position[0]>=cut;
  const lerp=(a,b)=>{const t=(cut-a.position[0])/(b.position[0]-a.position[0]);return Object.fromEntries(attrs.map(([k])=>[k,a[k].map((x,j)=>x+(b[k][j]-x)*t)]));};
  for(let i=0;i<g.attributes.position.count;i+=3){const p=[vertex(i),vertex(i+1),vertex(i+2)],q=[];
    for(let j=0;j<3;j++){const a=p[j],b=p[(j+1)%3];if(inside(a))q.push(a);if(inside(a)!==inside(b))q.push(lerp(a,b));}
    for(let j=1;j<q.length-1;j++)for(const v of[q[0],q[j],q[j+1]])for(const[k]of attrs)out[k].push(...v[k]);
  }
  const r=new T.BufferGeometry();for(const[k,a]of attrs)r.setAttribute(k,new T.Float32BufferAttribute(out[k],a.itemSize));
  r.computeBoundingBox();r.computeBoundingSphere();g.dispose();return r;
}

// Clip through holes, or rear blind recesses, preserving glazing UV and front skin.
function drill(T,o,x,y,r,zMax=Infinity){
  o.updateWorldMatrix(true,false);const W=o.matrixWorld.clone(),g=(o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone()).applyMatrix4(W),attrs=Object.entries(g.attributes),out=Object.fromEntries(attrs.map(([k])=>[k,[]]));
  const vertex=i=>Object.fromEntries(attrs.map(([k,a])=>[k,Array.from({length:a.itemSize},(_,j)=>a.array[i*a.itemSize+j])]));
  const clip=(p,nx,ny,d,inside,nz=0)=>{const q=[],dist=v=>nx*v.position[0]+ny*v.position[1]+nz*v.position[2]-d;
    for(let j=0;j<p.length;j++){const a=p[j],b=p[(j+1)%p.length],da=dist(a),db=dist(b),ia=inside?da<=0:da>=0,ib=inside?db<=0:db>=0;if(ia)q.push(a);if(ia!==ib){const t=da/(da-db);q.push(Object.fromEntries(attrs.map(([k])=>[k,a[k].map((v,i)=>v+(b[k][i]-v)*t)])));}}return q;};
  const emit=p=>{for(let j=1;j<p.length-1;j++)for(const v of[p[0],p[j],p[j+1]])for(const[k]of attrs)out[k].push(...v[k]);};
  for(let i=0;i<g.attributes.position.count;i+=3){let p=[vertex(i),vertex(i+1),vertex(i+2)];if(Number.isFinite(zMax)){emit(clip(p,0,0,zMax,false,1));p=clip(p,0,0,zMax,true,1);}for(let k=0;k<16&&p.length>=3;k++){const a=k*Math.PI/8,nx=Math.cos(a),ny=Math.sin(a),d=nx*x+ny*y+r*Math.cos(Math.PI/16);emit(clip(p,nx,ny,d,false));p=clip(p,nx,ny,d,true);}}
  const q=new T.BufferGeometry();for(const[k,a]of attrs)q.setAttribute(k,new T.Float32BufferAttribute(out[k],a.itemSize));q.applyMatrix4(W.invert());q.computeBoundingBox();q.computeBoundingSphere();g.dispose();o.geometry=q;
}

export function transferKapak29(T,govde){
  govde.updateMatrixWorld(true);const records=[];
  const steel=new T.MeshStandardMaterial({color:0xb7bec4,metalness:.8,roughness:.3});
  const rubber=new T.MeshStandardMaterial({color:0x23282d,roughness:.8});rubber.userData.gercekRenk=true;
  const black=new T.MeshStandardMaterial({color:0x101214,roughness:.55,metalness:0});black.userData.gercekRenk=true;
  const mark=(o,p,kat='kapak')=>{o.userData={...o.userData,ist:p.ist,kat,transfer29:p.id};return o;};
  const box=(parent,p,name,b,m)=>{const o=new T.Mesh(new T.BoxGeometry(b[1]-b[0],b[3]-b[2],b[5]-b[4]),m);o.name=p.id+'_'+name;o.position.set((b[0]+b[1])/2,(b[2]+b[3])/2,(b[4]+b[5])/2);parent.add(mark(o,p));return o;};
  const solid=(parent,p,name,bounds,mat)=>{const gs=bounds.map(b=>new T.BoxGeometry(b[1]-b[0],b[3]-b[2],b[5]-b[4]).translate((b[0]+b[1])/2,(b[2]+b[3])/2,(b[4]+b[5])/2));const g=mergeGeometries(gs);gs.forEach(g=>g.dispose());const o=new T.Mesh(g,mat);o.name=p.id+'_'+name;parent.add(mark(o,p));return o;};
  const screw=(parent,p,name,x,y,z,axis='z')=>{const o=new T.Mesh(new T.CylinderGeometry(.0035,.0035,.0015,16),steel);o.name=p.id+'_'+name;o.rotation[axis==='z'?'x':'z']=Math.PI/2;o.position.set(x,y,z);parent.add(mark(o,p));return o;};
  for(const p of TRANSFER29){
    const original=govde.getObjectByName(p.source);if(!original)throw Error('Transfer camı bulunamadı: '+p.source);
    const root=mark(new T.Group(),p);root.name='YMK_'+p.id;govde.add(root);
    const fixed=mark(new T.Mesh(cornerGeometry(T,original,p.cut,p.keepLeft),original.material),p);fixed.name=p.id+'_SABIT_KOSE_CAMI';root.add(fixed);
    // Seal the cut edge. The 3 mm joint lies over the existing vertical member.
    box(root,p,'SABIT_KOSE_KESIT',[p.cut-.00005,p.cut+.00005,p.y0,p.y1,.071,.079],original.material);
    const leaf=mark(new T.Group(),p);leaf.name='YMK_'+p.id+'_KANAT';leaf.userData.tip='transferSlul';leaf.userData.plc=p.plc;root.add(leaf);
    const pane=mark(new T.Mesh(cornerGeometry(T,original,p.keepLeft?p.x0:p.x1,!p.keepLeft),original.material),p);
    pane.name=p.id+'_PMMA_8';leaf.add(pane);
    const cutX=p.keepLeft?p.x0:p.x1;
    box(leaf,p,'CAM_KESIT',[cutX-.00005,cutX+.00005,p.y0,p.y1,.071,.079],original.material);
    pane.userData.preserveServicePlexi=true;
    original.removeFromParent();
    const anchors=[];govde.traverse(o=>{if(!o.isMesh)return;if((p.ist==='A'&&/^A_PLEKSI_B862_/.test(o.name))||(p.ist==='E'&&/^E_KOSE_VIDA_CAM_/.test(o.name)))anchors.push(o);});
    const cornerPoints=[];
    for(const o of anchors){
      if(p.ist==='E'){
        if(/_BAS_/.test(o.name)){const c=new T.Box3().setFromObject(o).getCenter(new T.Vector3());cornerPoints.push({x:c.x+.012,y:c.y});}
        o.removeFromParent();
      }else{root.attach(o);o.position.x-=.012;o.name=p.id+'_SABIT_'+o.name;o.traverse(q=>mark(q,p));}
    }
    // The TWO visible round heads on the fixed corner strip also use the
    // original glazing's rear blind M4 inserts. No front head/washer survives.
    const brassCorner=new T.MeshStandardMaterial({color:0xb8913a,metalness:.8,roughness:.35});brassCorner.userData.gercekRenk=true;
    for(const {x,y}of cornerPoints){
      root.updateMatrixWorld(true);drill(T,fixed,x,y,.0028,.0765);
      const carriers=[];govde.traverse(o=>{if(!o.isMesh||o.userData.transfer29)return;const b=new T.Box3().setFromObject(o);if(b.min.x>=5.1444&&b.max.x<=5.1846&&b.min.y<=y&&b.max.y>=y&&b.min.z>=.0494&&b.max.z<=.0696)carriers.push(o);});
      for(const o of carriers)drill(T,o,x,y,.00225);
      fixed.userData.cornerFixings??=[];fixed.userData.cornerFixings.push({x,y,carrierMeshesDrilled:carriers.length,blindDepth_mm:5.5});
      const ring=new T.Shape();ring.absarc(0,0,.0028,0,Math.PI*2,false);const hole=new T.Path();hole.absarc(0,0,.00165,0,Math.PI*2,true);ring.holes.push(hole);
      const bush=new T.Mesh(new T.ExtrudeGeometry(ring,{depth:.005,bevelEnabled:false,curveSegments:16}),brassCorner);bush.position.set(x,y,.071);bush.name=p.id+'_SABIT_CAM_KOR_BURC_M4_'+y;root.add(mark(bush,p));
      const shaft=new T.Mesh(new T.CylinderGeometry(.002,.002,.031,12),steel);shaft.rotation.x=Math.PI/2;shaft.position.set(x,y,.0595);shaft.name=p.id+'_SABIT_CAM_M4_SAPLAMA_'+y;root.add(mark(shaft,p));
      const washer=new T.Shape();washer.absarc(0,0,.0045,0,Math.PI*2,false);const wh=new T.Path();wh.absarc(0,0,.00225,0,Math.PI*2,true);washer.holes.push(wh);
      const wm=new T.Mesh(new T.ExtrudeGeometry(washer,{depth:.0015,bevelEnabled:false}),steel);wm.position.set(x,y,.048);wm.name=p.id+'_SABIT_CAM_ARKA_PUL_'+y;root.add(mark(wm,p));
      const hex=new T.Shape();for(let k=0;k<6;k++){const a=k*Math.PI/3;(k?hex.lineTo.bind(hex):hex.moveTo.bind(hex))(.00404*Math.cos(a),.00404*Math.sin(a));}hex.closePath();const nh=new T.Path();nh.absarc(0,0,.002,0,Math.PI*2,true);hex.holes.push(nh);
      const nm=new T.Mesh(new T.ExtrudeGeometry(hex,{depth:.0022,bevelEnabled:false}),steel);nm.position.set(x,y,.0458);nm.name=p.id+'_SABIT_CAM_ARKA_M4_SOMUN_'+y;root.add(mark(nm,p));
      fixed.userData.rearOnlyAttachment=true;fixed.userData.frontSkin_mm=2.5;
    }

    // Retire the complete old fixed-glazing assembly, including unnamed GLB
    // outline siblings of its obsolete studs/latch. Preserve the carrier rail.
    const old=govde.getObjectByName(p.ist==='A'?'YMK_A_PLEKSI':'YMK_E_TESLIM');
    if(old){const carriers=[];old.traverse(o=>{if(/OTURMA_/.test(o.name))carriers.push(o);});for(const o of carriers)govde.attach(o);old.removeFromParent();}
    // Flat fixed-glass studs and the old manual E latch cannot bridge a moving
    // leaf. Curved corner hardware outside the new leaf is retained.
    const remove=[];govde.traverse(o=>{
      if(!o.isMesh&&!o.isLineSegments)return;
      if((p.ist==='A'&&/^A_PLEKSI_B/.test(o.name)) || (p.ist==='E'&&/^E_TESLIM_MANDAL_/.test(o.name)))remove.push(o);
      else if(p.ist==='E'&&/^E_KOSE_VIDA_CAM_/.test(o.name))remove.push(o);
    });remove.forEach(o=>o.removeFromParent());
    // QR-style mounting within the GLASS band. Upper doors and their rails
    // remain the original, uncut geometry. Right-hand units mirror across x.
    const scale=(p.y1-p.y0+.014)/SLUL.travel,arms=[];
    for(let i=0;i<2;i++){
      const x=p.jambs[i],hardware=slulKur(T,root,{name:p.id+'_'+(i?'SAG':'SOL'),x,
        bottom:p.y0+.032,face:.085,dir:1,scale,material:steel,leafThickness:.008});
      hardware.root.userData.customHousingDepth_mm=50;
      hardware.root.userData.mount='cam bandındaki yan dikmeye bağlı özel kaset';
      if(i){hardware.root.position.x=2*x;hardware.root.scale.x=-1;}
      hardware.root.traverse(o=>{
        if(/_SLUL_(YAN_KORUMA|AMORTISOR_GOVDESI)$/.test(o.name)&&o.material)o.material.userData.gercekRenk=true;
        // Same parallel-lift kinematics; a CUSTOM 50 mm-deep side cassette,
        // not a claim that the manufacturer's deep SLUL body fits this gap.
        if(/_SLUL_(GOVDE|YAN_KORUMA)$/.test(o.name)){o.scale.x=.050/(SLUL.bodyDepth*scale);o.userData.customHousingDepth_mm=50;}
        if(/_PIM_/.test(o.name))o.scale.y=.8;
        if(/KANAT_BAGLANTI_PLAKASI$/.test(o.name))o.scale.y=.70;
      });
      const spacer=hardware.root.children.find(o=>/KANAT_ARA_MESAFE$/.test(o.name));if(spacer)spacer.removeFromParent();
      hardware.root.traverse(o=>mark(o,p));arms.push(hardware);
      const dir=i?-1:1,lo=x+(i?-.0085:-.0135),hi=x+(i?.0135:.0085),yb=.835,yt=1.080,t=.0012,zb=.002,zf=.064;
      const rhs=p.ist==='E'&&i===1;
      const post=rhs?x:p.posts[i],side=post+dir*.002;
      // E right jamb spans the two EXISTING horizontal carriers, rather than
      // a short cantilever off the rounded corner. One bent sheet fixes the case.
      const supportX=5.0155;
      const tray=[[lo,hi,yb,yt,zb-.002,zb]];
      if(!rhs)tray.push([Math.min(post,side),Math.max(post,side),.850,1.060,zb,.068],[Math.min(side,lo),Math.max(side,hi),.850,1.060,zb-.002,zb]);
      else tray.push([supportX+.018,lo,yb,yt,zb-.002,zb],[supportX+.018,supportX+.020,yb,yt,zb,.0595],[supportX,supportX+.020,yb,yt,.0575,.0595]);
      const mount=solid(root,p,'TEK_BUKUMLU_MONTAJ_TAVASI_'+i,tray,steel);mount.userData.fabricatedPart='2 mm bükümlü 304 sac';
      if(rhs){
        const a=supportX,b=a+.020,c=.0595,d=.0695,w=.0015,Y0=.808,Y1=1.103;
        const rhsPart=solid(root,p,'RHS20x10x1_5_YAN_TASIYICI',[[a,a+w,Y0,Y1,c,d],[b-w,b,Y0,Y1,c,d],[a+w,b-w,Y0,Y1,c,c+w],[a+w,b-w,Y0,Y1,d-w,d]],steel);
        rhsPart.userData.section_mm=[20,10,1.5];rhsPart.userData.span_mm=295;
        rhsPart.userData.connectedTo=['E_TESLIM_OTURMA_788_RHS40x15','E_MEK_OTURMA_1110_RHS40x15'];
      }
      // One closed black shell with a narrow arm slot; no broad open frame.
      const shell=solid(root,p,'SIYAH_KAPALI_KABUK_'+i,[[lo,lo+t,yb,yt,zb,zf],[hi-t,hi,yb,yt,zb,zf],[lo+t,hi-t,yb,yb+t,zb,zf],[lo+t,x-.003,yt-t,yt,zb,zf],[x+.003,hi-t,yt-t,yt,zb,zf],[x-.003,x+.003,yt-t,yt,zb,.030],[lo+t,x-.003,yb+t,yt-t,zf-t,zf],[x+.003,hi-t,yb+t,yt-t,zf-t,zf]],black);
      shell.userData.armSlot_mm=6;shell.userData.removableCover=true;
      for(const y of[.858,1.060]){const head=screw(root,p,'KABUK_M3_'+i+'_'+y,x+(i?.0085:-.0085),y,zf+.00075);head.scale.set(.75,1,.75);}
      // Two fixing screws behind the removable housing, into its mounting tray.
      for(const y of(rhs?[.841,.996]:[.850,1.050]))screw(root,p,'KASET_MONTAJ_M4_'+i+'_'+y,rhs?supportX+.010:(lo+hi)/2,y,rhs?.05675:zb+.001);
      // Same rear-only blind M4 insert/stud attachment as the original glazing.
      // The 8 mm sheet keeps an unbroken 2.5 mm front skin; no front clamp/head.
      const cy=p.y0+.032+.025*scale+.030*scale;
      const lug=solid(leaf,p,'CAM_ARKA_BAGLANTI_SACI_'+i,[[x-.009,x+.009,cy-.014,cy+.014,.0675,.0695]],steel);
      lug.userData.attachment='arka kör burç M4 + saplama; ön yüz düz';
      const brass=new T.MeshStandardMaterial({color:0xb8913a,metalness:.8,roughness:.35});brass.userData.gercekRenk=true;
      for(const yy of[cy-.008,cy+.008]){
        const pad=box(leaf,p,'CAM_EPDM_ARKA_'+i+'_'+yy,[x-.008,x+.008,yy-.005,yy+.005,.0695,.071],rubber);
        root.updateMatrixWorld(true);drill(T,pane,x,yy,.0028,.0765);drill(T,lug,x,yy,.00225);drill(T,pad,x,yy,.0028);
        pane.userData.blindHoles??=[];pane.userData.blindHoles.push({x,y:yy,diameter_mm:5.6,depth_mm:5.5,frontSkin_mm:2.5,fastener:'M4 rear stud'});
        const ring=new T.Shape();ring.absarc(0,0,.0028,0,Math.PI*2,false);const bore=new T.Path();bore.absarc(0,0,.00165,0,Math.PI*2,true);ring.holes.push(bore);
        const bush=new T.Mesh(new T.ExtrudeGeometry(ring,{depth:.005,bevelEnabled:false,curveSegments:16}),brass);bush.position.set(x,yy,.071);bush.name=p.id+'_CAM_KOR_BURC_M4_'+i+'_'+yy;leaf.add(mark(bush,p));
        const shaft=new T.Mesh(new T.CylinderGeometry(.002,.002,.017,12),steel);shaft.rotation.x=Math.PI/2;shaft.position.set(x,yy,.0665);shaft.name=p.id+'_CAM_M4_SAPLAMA_'+i+'_'+yy;leaf.add(mark(shaft,p));
        const hex=new T.Shape();for(let k=0;k<6;k++){const a=k*Math.PI/3;(k?hex.lineTo.bind(hex):hex.moveTo.bind(hex))(.00404*Math.cos(a),.00404*Math.sin(a));}hex.closePath();const thread=new T.Path();thread.absarc(0,0,.002,0,Math.PI*2,true);hex.holes.push(thread);
        const nut=new T.Mesh(new T.ExtrudeGeometry(hex,{depth:.0022,bevelEnabled:false}),steel);nut.name=p.id+'_CAM_M4_ARKA_SOMUN_'+i+'_'+yy;nut.position.set(x,yy,.0653);leaf.add(mark(nut,p));
      }

    }
    // No cross-shaft below the opening: the glazing itself links the two arms.
    for(const x of[p.x0+.004,p.x1-.004])box(leaf,p,'YAN_CONTA_'+x,[x-.003,x+.003,p.y0+.003,p.y1-.003,.071,.0715],rubber);
    const pose=value=>{const q=slulPoz(value,scale);leaf.position.set(0,q.y,q.out);leaf.rotation.set(0,0,0);for(const a of arms)a.pose(value);root.updateMatrixWorld(true);return q;};
    pose(0);records.push({p,root,leaf,arms,scale,pose,removed:remove.length});
  }
  return records;
}
