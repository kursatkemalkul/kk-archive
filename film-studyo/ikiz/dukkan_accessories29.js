import {duvarBirlesikGeometri} from './dukkan_plan.js';
import {SHOP_GLYPHS29} from './shop_glyphs29.js';
// Customer accessories and dry staff workspace; visual shop furniture only.
export function dukkanAccessories29(T,scene,g,MAT,IKIZ){
 if(IKIZ.dukkanAccessories29)return IKIZ.dukkanAccessories29;
 const root=new T.Group();root.name='DUKKAN__ACCESSORIES29';g.add(root);
 const steel=new T.MeshStandardMaterial({color:0xc4cdcc,metalness:.82,roughness:.32}),dark=new T.MeshStandardMaterial({color:0x343c3e,roughness:.7}),paper=new T.MeshStandardMaterial({color:0xf4efe4,roughness:1}),white=new T.MeshStandardMaterial({color:0xfff1d7,roughness:.8}),red=new T.MeshStandardMaterial({color:0x9f342d,roughness:.55,metalness:.45});
 for(const m of [steel,dark,paper,white,red])m.userData={storefront60Finish:true,preserveReviewMaterial:true};
 const parts=[],tracks=[],cx=2.619,cz=2.348;
 function add(name,geo,mat=steel,parent=root){const o=new T.Mesh(geo,mat);o.name='DUKKAN__ACC29_'+name;o.userData={assemblyOwner:'SHOP',accessory29:true};parent.add(o);parts.push(o);return o;}
 function box(name,b,mat=steel,parent=root){const geo=new T.BoxGeometry(b[1]-b[0],b[3]-b[2],b[5]-b[4]);geo.translate((b[0]+b[1])/2,(b[2]+b[3])/2,(b[4]+b[5])/2);return add(name,geo,mat,parent);}
 function solid(name,b,holes,mat=steel,parent=root){return add(name,duvarBirlesikGeometri(T,b,holes),mat,parent);}
 function tube(name,points,r=.004,mat=steel,parent=root){const curve=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p)));return add(name,new T.TubeGeometry(curve,24,r,8,false),mat,parent);}
 function label(text,parent,position,width,rotation=0,mat=white){const group=new T.Group();group.name='DUKKAN__ACC29_YAZI_'+text;parent.add(group);group.position.set(...position);group.rotation.y=rotation;
  const total=[...text].reduce((s,c)=>s+SHOP_GLYPHS29.glyphs[c].advance,0),scale=width/total;let offset=0;const positions=[],normals=[];
  for(const c of text){const glyph=SHOP_GLYPHS29.glyphs[c],path=new T.ShapePath();for(const cmd of glyph.commands){const p=cmd.slice(1);if(cmd[0]==='M')path.moveTo(...p);if(cmd[0]==='L')path.lineTo(...p);if(cmd[0]==='Q')path.quadraticCurveTo(...p);if(cmd[0]==='C')path.bezierCurveTo(...p);if(cmd[0]==='Z')path.currentPath.closePath();}
   if(glyph.commands.length){const geo=new T.ExtrudeGeometry(path.toShapes(false),{depth:.00035/scale,bevelEnabled:false,curveSegments:4});geo.scale(scale,scale,scale);geo.translate(offset*scale,0,0);positions.push(...geo.attributes.position.array);normals.push(...geo.attributes.normal.array);geo.dispose();}offset+=glyph.advance;}
  if(positions.length){const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(positions,3));geo.setAttribute('normal',new T.Float32BufferAttribute(normals,3));add('YAZI_'+text,geo,mat,group);}
  return group;
 }
 const stoolAngles=IKIZ.disBar29.info.stools.map(s=>s.angle);
 // Rounded hooks lie within the bar's 225 mm projection, below the slab.
 for(const [i,a]of stoolAngles.entries()){
  const hook=new T.Group();hook.name='DUKKAN__ACC29_CANTA_ASKISI_'+(i+1);hook.position.set(cx+.800*Math.cos(a),0,cz+.800*Math.sin(a));hook.rotation.y=Math.PI/2-a;root.add(hook);
  box('ASKI_MONTAJ_'+i,[-.014,.014,.911,.915,-.014,.014],steel,hook);
  tube('YUVARLAK_ASKI_'+i,[[0,.911,0],[0,.872,0],[0,.844,.010],[0,.845,.033],[0,.860,.043]],.004,steel,hook);
  const end=new T.SphereGeometry(.004,12,8);end.translate(0,.860,.043);add('ASKI_YUMUSAK_UC_'+i,end,steel,hook);
 }
 // Dispenser on the right-hand curved ledge, clear of the straight service pane.
 // QR collection clearance: no dispenser on the shortened bar tip.
 // Small closed wall-mounted bin sits beneath the right bar, not in the aisle.
 const ba=.20,bin=new T.Group();bin.name='DUKKAN__ACC29_COP_KUTUSU';bin.position.set(cx+.760*Math.cos(ba),0,cz+.760*Math.sin(ba));bin.rotation.y=Math.PI/2-ba;root.add(bin);
 const profile=new T.Shape();profile.moveTo(.069,.120);profile.lineTo(.070,.120);profile.lineTo(.070,.520);profile.lineTo(.0685,.520);profile.lineTo(.0685,.122);profile.lineTo(0,.122);profile.lineTo(0,.120);profile.closePath();add('COP_CIKARILIR_KOVA',new T.LatheGeometry(profile.getPoints(),40),red,bin);
 const lid=new T.Group();lid.name='DUKKAN__ACC29_COP_KAPAGI';lid.position.set(0,.520,-.069);bin.add(lid);
 const lg=new T.CylinderGeometry(.071,.071,.003,40);lg.translate(0,.0015,.069);const lidMesh=add('COP_KAPAK',lg,red,lid);box('COP_KAPAK_KULP',[-.018,.018,.003,.010,.115,.126],steel,lid);
 const binState={value:0,target:0};lid.traverse(o=>{if(o.isMesh)o.userData.twinAction={kind:'elle',label:'Kapalı çöp kutusu · aç / kapat',toggle:()=>binState.target=binState.target?0:1};});tracks.push({state:binState,pose:v=>lid.rotation.x=-v*1.25});
 for(const y of [.230,.440])box('COP_DUVAR_ASKISI',[-.018,.018,y,y+.018,-.107,-.069],steel,bin);
 label('ATIK',bin,[-.040,.360,.0705],.080,0,white);
 // Dry workstation on the staff side of the wash divider. Existing cashier stays small.
 const staff=new T.Group();staff.name='DUKKAN__ACC29_PERSONEL_KURU_ALAN';staff.userData={ist:'PERSONEL',katman:'PERSONEL'};root.add(staff);
 solid('PERSONEL_CALISMA_RAFI',[[1.740,1.978,.898,.900,1.960,2.260],[1.740,1.742,.878,.898,1.960,2.260],[1.742,1.978,.878,.898,1.960,1.962],[1.742,1.978,.878,.898,2.258,2.260]],[],steel,staff);
 for(const z of [1.985,2.230]){tube('RAF_DUVAR_KONSOLU',[[1.970,.680,z],[1.970,.880,z],[1.760,.880,z]],.005,steel,staff);tube('RAF_CAPRAZ',[[1.970,.690,z],[1.760,.880,z]],.004,steel,staff);}
 const body=[[1.830,1.978,1.380,1.382,1.940,2.260],[1.976,1.978,1.382,1.820,1.940,2.260],[1.830,1.976,1.818,1.820,1.940,2.260],[1.830,1.976,1.382,1.818,1.940,1.942],[1.830,1.976,1.382,1.818,2.258,2.260],[1.830,1.976,1.596,1.598,1.942,2.258]];
 solid('PERSONEL_TEMIZ_SARF_DOLABI',body,[],steel,staff);
 for(const [i,z0,z1,x]of [[0,1.945,2.100,1.826],[1,2.100,2.255,1.821]]){
  const leaf=new T.Group();leaf.name='DUKKAN__ACC29_SURGU_KAPAK_'+i;staff.add(leaf);box('SURGU_KAPAK_'+i,[x,x+.002,1.387,1.813,z0,z1],red,leaf);box('SURGU_GOMME_KULP_'+i,[x-.003,x,1.570,1.630,z0+.020,z0+.030],dark,leaf);
  const state={value:0,target:0};leaf.traverse(o=>{if(o.isMesh)o.userData.twinAction={kind:'elle',label:'Temiz sarf dolabı · sürgülü kapak',toggle:()=>state.target=state.target?0:1};});tracks.push({state,pose:v=>leaf.position.z=(i===0?.145:-.145)*v});
 }
 for(const y of [1.396,1.612])box('PERSONEL_SARF_KUTUSU',[1.850,1.950,y,y+.130,1.970,2.230],paper,staff);
 box('PERSONEL_DOLAP_SABIT_BASLIK',[1.817,1.978,1.818,1.860,1.940,2.260],steel,staff);
 label('TEMİZ SARF',staff,[1.8165,1.824,1.960],.270,-Math.PI/2,white);
 // Small dry dispenser below the cabinet; nothing is put into the wash splash zone.
 box('PERSONEL_PECETE_GOVDE',[1.870,1.978,1.080,1.220,2.100,2.250],steel,staff);box('PERSONEL_PECETE_UCU',[1.863,1.871,1.095,1.120,2.132,2.217],paper,staff);
 // Drawer-front text removed at the user's request.
 // Service glazing remains clear; opening hours appear once on the fascia.
 // Reuse the real per-compartment readiness lamps; never invent order readiness.
 const qrEnhanced=new Set();let scan=0,qrScans=0;
 function enhanceQR(){let added=0;scene.traverse(o=>{if(!o.isMesh||!/^IKIZ_GOZ_ISIK_G\d{2}$/.test(o.name)||qrEnhanced.has(o.uuid))return;o.scale.x*=1.35;o.scale.y*=1.35;o.updateMatrix();o.material.emissiveIntensity=2;o.userData.accessory29ReadyIndicator=true;qrEnhanced.add(o.uuid);added++;});return added;}
 function update(dt){for(const q of tracks){const step=Math.max(0,Math.min(.1,dt||0))/.65;q.state.value+=Math.sign(q.state.target-q.state.value)*Math.min(step,Math.abs(q.state.target-q.state.value));q.pose(q.state.value);}scan-=Math.max(0,dt||0);if(scan<=0&&qrEnhanced.size<12&&qrScans<5&&typeof IKIZ.gozIsiklari==='function'){scan=1;qrScans++;enhanceQR();}}
 if(typeof IKIZ.gozIsiklari==='function')enhanceQR();IKIZ.kancalar.push(update);
 IKIZ.disBar29.info.edgeRadius_mm=3;
 const info={revision:'29eki-accessories',bagHooks:2,napkinDispenser:0,customerBin:{diameter_mm:140,height_mm:400,closedLid:true,withinBarFootprint:true},staffDryShelf_mm:[238,300],staffSlidingCabinet_mm:[161,480,320],cashierSizeUnchanged:true,serviceGlassLabel:false,openingHours:'24 saat açık',realQRReadiness:true,cameraChanged:false,barEdgeRadius_mm:3};
 IKIZ.dukkanAccessories29={root,staff,bin,lid,info,tracks,update,enhanceQR,qrEnhanced};return IKIZ.dukkanAccessories29;
}
