import {mergeGeometries} from '../vendor/BufferGeometryUtils.js';

// E body refinement, applied to the authoritative body BEFORE batching.
// No PLC, robot target, outer envelope, purchased mechanism or cable changes.
export function eGovde30(T,body,transfer,scene){
  body.updateMatrixWorld(true);
  const door=body.getObjectByName('YMK_E_SOL_KANAT'),face=body.getObjectByName('E_SOL_KAPAK_YUZ');
  if(!door||!face||!transfer)throw Error('E alt kapak / transfer taşıyıcısı eksik');
  const steel=new T.MeshStandardMaterial({color:0xc9ced2,metalness:.8,roughness:.3});
  const pp=new T.MeshStandardMaterial({color:0x111214,roughness:.6});pp.userData.gercekRenk=true;
  const epdm=new T.MeshStandardMaterial({color:0x242629,roughness:.9});epdm.userData.gercekRenk=true;
  const mark=(o,kat='kapak')=>{o.userData={...o.userData,ist:'E',kat,eGovde30:true};return o;};
  const bounds=o=>new T.Box3().setFromObject(o);
  const addWorld=(parent,o,kat='kapak')=>{body.add(mark(o,kat));body.updateMatrixWorld(true);parent.attach(o);return o;};
  const boxGeo=b=>new T.BoxGeometry(b[1]-b[0],b[3]-b[2],b[5]-b[4]).translate((b[0]+b[1])/2,(b[2]+b[3])/2,(b[4]+b[5])/2);
  const part=(parent,name,bs,mat=steel,kat='kapak')=>{const gs=bs.map(boxGeo),g=mergeGeometries(gs);gs.forEach(g=>g.dispose());const o=new T.Mesh(g,mat);o.name=name;return addWorld(parent,o,kat);};
  const rect=(x0,x1,y0,y1,r=0)=>{const s=new T.Shape();s.moveTo(x0+r,y0);s.lineTo(x1-r,y0);s.quadraticCurveTo(x1,y0,x1,y0+r);s.lineTo(x1,y1-r);s.quadraticCurveTo(x1,y1,x1-r,y1);s.lineTo(x0+r,y1);s.quadraticCurveTo(x0,y1,x0,y1-r);s.lineTo(x0,y0+r);s.quadraticCurveTo(x0,y0,x0+r,y0);return s;};
  const frame=(name,outer,inner,z0,z1)=>{const s=rect(...outer);s.holes.push(new T.Path(rect(...inner).getPoints(8)));const g=new T.ExtrudeGeometry(s,{depth:z1-z0,bevelEnabled:false,curveSegments:8}).translate(0,0,z0);const o=new T.Mesh(g,pp);o.name=name;return addWorld(door,o);};
  const old=[];door.traverse(o=>{if(o.isMesh&&/^E_SOL_COP_AGZI_/.test(o.name))old.push(o);});
  const oldBounds=old.map(bounds),faceBounds=bounds(face),removed=[];
  door.traverse(o=>{if(o.isLineSegments){const b=bounds(o);if([...oldBounds,faceBounds].some(q=>q.min.distanceTo(b.min)<1e-5&&q.max.distanceTo(b.max)<1e-5))removed.push(o);}});
  for(const o of [...old,...removed])o.removeFromParent();

  // Wider mouth centred on the existing E lower-left door opening: 200 x 190.
  // The sheet is replaced with an actual extruded aperture, not an overlay.
  const x=4.5545,w=.200,y0=.515,y1=.705,zFace=.079;
  const cut=[x-w/2-.004,x+w/2+.004,y0-.004,y1+.004,.011];
  const sheet=rect(faceBounds.min.x,faceBounds.max.x,faceBounds.min.y,faceBounds.max.y);
  sheet.holes.push(new T.Path(rect(...cut).getPoints(8)));
  const fg=new T.ExtrudeGeometry(sheet,{depth:.0015,bevelEnabled:false,curveSegments:8}).translate(0,0,zFace-.0015);
  fg.applyMatrix4(face.matrixWorld.clone().invert());face.geometry=fg;mark(face);
  face.userData.wasteCutout_mm=[208,198];
  const edge=new T.LineSegments(new T.EdgesGeometry(fg,30),new T.LineBasicMaterial({color:0x222426,transparent:true,opacity:.55}));edge.name='E_SOL_KAPAK_YENI_KESIT_KENARI';edge.matrix.copy(face.matrix);edge.matrixAutoUpdate=false;door.add(mark(edge));
  // 20 mm rear adhesive land, bonded against the BACK of the 1.5 mm door sheet.
  // All parts belong to the moving door: no fixed throat trapping an open door.
  const flange=frame('E_SOL_COP_ARKA_YAPISTIRMA_FLANSI',[x-.124,x+.124,y0-.024,y1+.024,.016],[x-w/2,x+w/2,y0,y1,.007],.0745,.0775);
  flange.userData.adhesiveLand_mm=20;flange.userData.bondingPlane_z=.0775;
  frame('E_SOL_COP_ON_DUZ_CERCEVE',[x-.103,x+.103,y0-.003,y1+.003,.010],[x-w/2,x+w/2,y0,y1,.007],.0775,.079);
  // Single hollow PP scoop: open top/front, two side cheeks, continuous downward
  // floor leading inward; no flap, lid, or solid plate across the opening.
  const stations=[{x,w,y:.548,top:.635,z:.144},{x,w,y:y0,top:y1,z:.079},{x:4.525,w:.130,y:.398,top:.460,z:-.100}],th=.003;
  const prism=vs=>{const P=[],faces=[[0,1,2,3],[4,7,6,5],[0,4,5,1],[1,5,6,2],[2,6,7,3],[3,7,4,0]],v=vs.map(p=>new T.Vector3(...p)),c=new T.Vector3();v.forEach(p=>c.addScaledVector(p,1/8));
    for(const f of faces)for(const tri of [[f[0],f[1],f[2]],[f[0],f[2],f[3]]]){const [a,b,d]=tri.map(i=>v[i]),n=b.clone().sub(a).cross(d.clone().sub(a)),mid=a.clone().add(b).add(d).multiplyScalar(1/3);const ids=n.dot(mid.sub(c))<0?[tri[0],tri[2],tri[1]]:tri;for(const i of ids)P.push(...v[i].toArray());}
    const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(P,3));g.computeVertexNormals();return g;};
  const gs=[];
  for(let i=0;i<stations.length-1;i++){
    const a=stations[i],b=stations[i+1];
    gs.push(prism([[a.x-a.w/2,a.y,a.z],[a.x+a.w/2,a.y,a.z],[b.x+b.w/2,b.y,b.z],[b.x-b.w/2,b.y,b.z],[a.x-a.w/2,a.y-th,a.z],[a.x+a.w/2,a.y-th,a.z],[b.x+b.w/2,b.y-th,b.z],[b.x-b.w/2,b.y-th,b.z]]));
    for(const side of[-1,1]){const xa=a.x+side*a.w/2,xb=b.x+side*b.w/2;
      gs.push(prism([[xa,a.y-th,a.z],[xa,a.top,a.z],[xb,b.top,b.z],[xb,b.y-th,b.z],[xa+side*th,a.y-th,a.z],[xa+side*th,a.top,a.z],[xb+side*th,b.top,b.z],[xb+side*th,b.y-th,b.z]]));}
  }
  const chuteG=mergeGeometries(gs);gs.forEach(g=>g.dispose());
  const chute=new T.Mesh(chuteG,pp);chute.name='E_SOL_COP_ICI_BOS_ASAGI_YONLENDIRICI_PP';addWorld(door,chute);
  chute.userData={...chute.userData,clearWidth_mm:200,clearHeight_mm:190,oldClearWidth_mm:80,oldClearHeight_mm:120,wall_mm:3,outlet:[4.525,.398,-.100],outletWidth_mm:130,open:true};
  // Earlier lightweight export reduced the original bin/liner to three-vertex
  // anchors. Restore the SAME 165 x 400 x 300 mm compartment as hollow geometry;
  // never mistake a coordinate anchor for a visible bin or reload the old model.
  let retainedBin=0,binFromBounds=false;
  const binSource=scene?.getObjectByName('E_COP__plastik');
  if(binSource?.geometry?.attributes.position.count>100){
    for(const name of ['E_COP__plastik','E_COP__poset']){const src=scene.getObjectByName(name);if(!src?.isMesh)continue;src.updateWorldMatrix(true,false);const o=new T.Mesh(src.geometry.clone().applyMatrix4(src.matrixWorld).translate(.018,-.043,0),src.material.clone());o.name='E_ALT_MEVCUT_ATIK_'+name.split('__')[1];addWorld(transfer.root,o,'ic');o.userData.transfer29='E_TRANSFER';retainedBin++;}
  }else{
    binFromBounds=true;
    const cx=4.525,cz=-.171,bot=.0845,top=.3845;
    const ring=(hx,hz,y,zCenter=cz)=>[[-hx,-hz],[hx,-hz],[hx,hz],[-hx,hz]].map(([a,b])=>[cx+a,y,zCenter+b]);
    // A moulded tapered front clears the existing floor anchor without a plinth.
    const ob=ring(.0685,.160,bot,cz-.025),ot=ring(.0825,.200,top),ib=ring(.0665,.158,bot+.003,cz-.025),it=ring(.0805,.198,top);
    const outer=[],liner=[];
    for(let k=0;k<4;k++){const j=(k+1)%4;outer.push(prism([ob[k],ob[j],ot[j],ot[k],ib[k],ib[j],it[j],it[k]]));
      const g=new T.BufferGeometry(),pts=[ib[k],it[k],it[j],ib[k],it[j],ib[j]].flat();g.setAttribute('position',new T.Float32BufferAttribute(pts,3));g.computeVertexNormals();liner.push(g);}
    const bottom=boxGeo([cx-.0685,cx+.0685,bot,bot+.003,cz-.185,cz+.135]).toNonIndexed();bottom.deleteAttribute('uv');outer.push(bottom);
    const binMat=new T.MeshStandardMaterial({color:0x24272a,roughness:.62});binMat.userData.gercekRenk=true;
    const bodyG=mergeGeometries(outer);outer.forEach(g=>g.dispose());const o=new T.Mesh(bodyG,binMat);o.name='E_ALT_MEVCUT_ATIK_plastik';addWorld(transfer.root,o,'ic');o.userData.transfer29='E_TRANSFER';o.userData.originalEnvelope_mm=[165,400,300];o.userData.restoredFromAnchor=true;retainedBin++;
    const bagMat=new T.MeshStandardMaterial({color:0x111214,roughness:.38,side:T.DoubleSide});bagMat.userData.gercekRenk=true;
    // Liner is 0.3 mm inward, so it does not z-fight with the bin inner wall.
    const bagG=mergeGeometries(liner);liner.forEach(g=>g.dispose());const bag=new T.Mesh(bagG,bagMat);bag.name='E_ALT_MEVCUT_ATIK_poset';bag.scale.set(.996,1,.998);bag.position.set(cx*(1-.996),0,cz*(1-.998));addWorld(transfer.root,bag,'ic');bag.userData.transfer29='E_TRANSFER';retainedBin++;
  }
  // Bin rests directly on the existing E floor (top y84.5), no extra base or feet.

  // Lower-door closing rail: front/rear RHS40x20, shallow side C sections.
  // 1.5 mm EPDM reaches the original door return; the body envelope is unchanged.
  const root=transfer.root;
  const rhs=(name,b,axis)=>{const [a,A,c,C,d,D]=b,t=.002;let bs;
    if(axis==='x')bs=[[a,A,c,c+t,d,D],[a,A,C-t,C,d,D],[a,A,c+t,C-t,d,d+t],[a,A,c+t,C-t,D-t,D]];
    else bs=[[a,a+t,c,C,d,D],[A-t,A,c,C,d,D],[a+t,A-t,c,c+t,d,D],[a+t,A-t,C-t,C,d,D]];
    const o=part(root,name,bs,steel,'ara');o.userData.transfer29='E_TRANSFER';o.userData.section_mm=[40,20,2];o.userData.eGovde30=true;return o;};
  // Ends meet the existing vertical members, never pass through them.
  rhs('E_ALT_KAPAK_DAYAMA_ON_SOL_RHS40x20x2',[4.4415,4.835,.728,.768,.0495,.0695],'x');
  rhs('E_ALT_KAPAK_DAYAMA_ON_SAG_RHS40x20x2',[4.855,5.1445,.728,.768,.0495,.0695],'x');
  rhs('E_ALT_KAPAK_DAYAMA_ARKA_RHS40x20x2',[4.4415,5.2405,.708,.748,-.9195,-.8995],'x');
  // Shallow folded C sections at the side skins leave the elevator rods/rack
  // clear. Small flange reliefs straddle existing fixed cassette partitions;
  // lifting-carriage clearance windows preserve the full elevator stroke.
  for(const [side,x0,x1,web0,web1]of[['SOL',4.4015,4.4075,4.4015,4.403],['SAG',5.279,5.2885,5.287,5.2885]]){
    const zEnd=side==='SOL'?.0495:-.071,bs=[];
    const clearSegments=(a,b)=>{let q=[[a,b]];for(const [l,h]of[[-.776,-.728],[-.651,-.583],[-.506,-.458]])q=q.flatMap(([u,v])=>v<=l||u>=h?[[u,v]]:[[u,Math.min(v,l)],[Math.max(u,h),v]].filter(([a,b])=>b>a));return q;};
    for(const [z0,z1]of[[-.8995,-.364],[-.344,zEnd]].flatMap(([a,b])=>clearSegments(a,b)))bs.push([web0,web1,.705,.745,z0,z1]);
    const intervals=[[-.8995,-.8255],[-.8205,-.4135],[-.4085,-.364],[-.344,zEnd]];
    for(const [z0,z1]of intervals.flatMap(([a,b])=>clearSegments(a,b)))for(const [ya,yb]of[[.705,.7065],[.7435,.745]])bs.push([x0,x1,ya,yb,z0,z1]);
    const o=part(root,'E_ALT_KAPAK_DAYAMA_'+side+'_C40_DAYAMA_TAKIMI',bs,steel,'ara');o.userData.transfer29='E_TRANSFER';o.userData.profile='C40, 1.5 mm AISI304, sabit bölme geçişlerinde dudak rahatlatma';o.userData.elevatorClearance_mm=[[-776,-728],[-651,-583],[-506,-458]];
  }
  const arc0=body.getObjectByName('UYE_E_OTURMA_788_YAY');if(!arc0)throw Error('E köşe profil kesiti eksik');
  const arc=new T.Mesh(arc0.geometry.clone().applyMatrix4(arc0.matrixWorld).translate(0,-.040,0),steel);arc.name='E_ALT_KAPAK_DAYAMA_KOSE_YAY';addWorld(root,arc,'ara');arc.userData.transfer29='E_TRANSFER';
  const seal=part(root,'E_ALT_KAPAK_DAYAMA_EPDM',[ [4.4415,4.835,.728,.746,.0695,.071],[4.855,5.1445,.728,.746,.0695,.071] ],epdm,'ara');seal.userData.transfer29='E_TRANSFER';
  body.updateMatrixWorld(true);
  return {version:1,removedOldWasteParts:old.length,removedOldOutlines:removed.length,opening_mm:[200,190],sheetCut_mm:[208,198],flange_mm:20,outlet:[4.525,.398,-.100],retainedBin,binFromBounds,binShift_mm:[18,-43,0],lowerRail:{frontSection_mm:[40,20,2],sideSection:'shallow C40x6 / C40x10, sheet 1.5',front_y_mm:[728,768],connectedViaExistingPosts:true},door};
}
