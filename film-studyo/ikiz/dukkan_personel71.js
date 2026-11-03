// Fitted personnel counter: same folded stainless construction as wash station.
import {GOVDE_STANDARD28} from './govde_standard28.js';
import {closedFurnitureCover30 as foldedCover28,closedFurnitureGeometry30} from './furniture_closed30.js';
import {pianoBlack29} from './piano_black29.js';
import {PLAN,duvarBirlesikGeometri} from './dukkan_plan.js';
const CZ=PLAN.yikamaArka[1],R=3.002-CZ,CX=3.273-R,RW=R-.100;
const ax=(r,z)=>CX+Math.sqrt(Math.max(0,r*r-(z-CZ)**2)),angle=(r,z)=>Math.asin((z-CZ)/r);
export const TEZGAH71={on_x:2.810,z0:2.350,z1:2.850,ust_y:.770,sac:.0015,
 kaynak_egri:{merkez_xz:[CX,CZ],duvar_ic_R_mm:RW*1000,duvar_kalinlik_mm:100},
 govde:{on_x:2.833,z0:2.354,z1:2.825,sac:.0015,R_arka_dis:RW-.010,taban_y:.100},
 ray:{boy:.250,kalinlik:.0127,yukseklik:.0457,model:'250 mm tam açılır üç parçalı bilyalı ray; üretici seçimi bekliyor'},tablet:{center:[2.960,.985,2.490],base:[2.950,2.490]},split:2.610,
 cekmeceler:[['NAKIT_FIS','Nakit / fiş çekmecesi',.584,.7285,.600,.690],['SARF','Sarf çekmecesi',.378,.5815,.395,.545],['COP_TEMIZLIK','Çöp / temizlik çekmecesi',.102,.3755,.120,.350]]};
export function dukkanPersonel71(T,g,D,liste,MAT,IKIZ={}){
 const K=TEZGAH71,G=K.govde,t=G.sac,steel=new T.MeshStandardMaterial({color:0xd7dce0,metalness:.35,roughness:.45,envMap:pianoBlack29(T,g.parent||g,IKIZ).env,envMapIntensity:1}),black=MAT.siyah;
 steel.userData={storefront60Finish:true,preserveReviewMaterial:true,gercekRenk:true,manufacturingFinish30:true};
 const old=/^(DUKKAN__DAR_TEZGAH_|PERSONEL_KASA_DOLABI$|PERSONEL_COP_5L$|DUKKAN_SERVIS__(KASA_AYAK_|KASA_TEKNIK_BOLME_|APG_NANO_|NAKIT_|KASA_CEKMECE_|KASA_GOMME_KULP_|SARF_CEKMECE_TABAN|YEDEK_FIS_RULOSU|COP_KAPAK$|TEZGAH_KABLO_GECISI|TABLET_USB_KABLO|POS_DC_KABLO|MASA_GOMME_PRIZ_GIZLI_BESLEME|KASA_DUVAR_PRIZI|KASA_RJ45_YUVA))/;
 const retired=[];g.traverse(o=>{if(old.test(o.name))retired.push(o);});for(const o of retired){o.removeFromParent();o.traverse(q=>q.geometry?.dispose());}
 for(let i=liste.length-1;i>=0;i--)if(/^DAR_TEZGAH_/.test(liste[i].ad))liste.splice(i,1);
 const root=new T.Group();root.name='PERSONEL_TEZGAH71';root.userData={katman:'PERSONEL',ist:'PERSONEL'};g.add(root);
 const parts=[],states=[];
 function add(ad,geo,mat=steel,parent=root){const o=new T.Mesh(geo,mat);o.name='PERSONEL_TEZGAH71__'+ad;o.userData={ist:'PERSONEL',materialSpecification:'AISI 304',construction:'folded sheet / welded hollow frame',manufacturingFinish30:true};parent.add(o);parts.push(o);return o;}
 function box(ad,b,mat=steel,parent=root){if(!(b[1]>b[0]&&b[3]>b[2]&&b[5]>b[4]))throw Error('Invalid counter part '+ad);const geo=new T.BoxGeometry(b[1]-b[0],b[3]-b[2],b[5]-b[4]);geo.translate((b[0]+b[1])/2,(b[2]+b[3])/2,(b[4]+b[5])/2);return add(ad,geo,mat,parent);}
 function solid(ad,vol,holes=[],parent=root,mat=steel){return add(ad,duvarBirlesikGeometri(T,vol,holes),mat,parent);}
 function cylinder(ad,x,y,z,r,h,mat=steel,parent=root){const geo=new T.CylinderGeometry(r,r,h,24);geo.translate(x,y+h/2,z);return add(ad,geo,mat,parent);}
 function ring(ad,x,y,z,ro,ri,h,parent=root){const s=new T.Shape();s.absarc(0,0,ro,0,Math.PI*2,false);const hole=new T.Path();hole.absarc(0,0,ri,0,Math.PI*2,true);s.holes.push(hole);const geo=new T.ExtrudeGeometry(s,{depth:h,bevelEnabled:false,curveSegments:24});geo.rotateX(-Math.PI/2);geo.translate(x,y,z);return add(ad,geo,steel,parent);}
 function plan(ad,shape,y0,y1,parent=root){const geo=new T.ExtrudeGeometry(shape,{depth:y1-y0,bevelEnabled:false,curveSegments:128}),p=geo.attributes.position;for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getY(i),y=p.getZ(i);p.setXYZ(i,x,y+y0,z);}const index=[];for(let i=0;i<p.count;i+=3)index.push(i,i+2,i+1);geo.setIndex(index);geo.computeVertexNormals();return add(ad,geo,steel,parent);}
 function footprint(front,z0,z1,r,holes=[]){const s=new T.Shape();s.moveTo(front,z0);s.lineTo(front,z1);s.lineTo(ax(r,z1),z1);s.absarc(CX,CZ,r,angle(r,z1),angle(r,z0),true);s.lineTo(front,z0);s.closePath();s.holes.push(...holes);return s;}
 function band(ri,ro,z0,z1){const s=new T.Shape();s.moveTo(ax(ro,z0),z0);s.absarc(CX,CZ,ro,angle(ro,z0),angle(ro,z1),false);s.lineTo(ax(ri,z1),z1);s.absarc(CX,CZ,ri,angle(ri,z1),angle(ri,z0),true);s.closePath();return s;}
 function rect(x0,x1,z0,z1){const p=new T.Path();p.moveTo(x0,z0);p.lineTo(x0,z1);p.lineTo(x1,z1);p.lineTo(x1,z0);p.closePath();return p;}
 const circle=(x,z,r)=>{const p=new T.Path();p.absarc(x,z,r,0,Math.PI*2,true);return p;};
 function rhs(ad,a,b,w=.020){const length=new T.Vector3(...b).sub(new T.Vector3(...a)),s=new T.Shape(),h=w/2,i=h-.0015;s.moveTo(-h,-h);s.lineTo(h,-h);s.lineTo(h,h);s.lineTo(-h,h);s.closePath();s.holes.push(rect(-i,i,-i,i));const geo=new T.ExtrudeGeometry(s,{depth:length.length(),bevelEnabled:false});geo.applyMatrix4(new T.Matrix4().makeRotationFromQuaternion(new T.Quaternion().setFromUnitVectors(new T.Vector3(0,0,1),length.normalize())));geo.translate(...a);return add(ad,geo);}
 const F=K.on_x,Z0=K.z0,Z1=K.z1,TY=K.ust_y,RO=RW-.008,RB=G.R_arka_dis,YT=TY-K.sac;
 const pos=[2.875,2.710],tablet=[K.tablet.center[0],K.tablet.center[2]],socket=[2.813,2.788];
 const cut=[circle(K.tablet.base[0],K.tablet.base[1],.008),...[-.035,.035].flatMap(dx=>[-.035,.035].map(dz=>circle(K.tablet.base[0]+dx,K.tablet.base[1]+dz,.00275)))];
 plan('UST_TABLA_304_1_5',footprint(F,Z0,Z1,RO,cut),YT,TY);
 box('ON_BUKUM_40',[F,F+.0015,TY-.040,YT,Z0,Z1]);box('ON_IC_DONUS_10',[F+.0015,F+.0115,TY-.040,TY-.0385,Z0,Z1]);
 box('YAN_BUKUM_40',[F+.0015,ax(RO,Z1),TY-.040,YT,Z1-.0015,Z1]);
 plan('KAVISLI_ARKA_ETEK_50',band(RO-.0015,RO,Z0,Z1),TY,TY+.050);
 box('DUVAR_YANI_ETEK_50',[F,ax(RO-.0015,Z0),TY,TY+.050,Z0,Z0+.0015]);
 plan('DOLAP_TABAN_1_2',footprint(G.on_x,G.z0+t,G.z1-t,RB-t),G.taban_y,G.taban_y+t);
 plan('DOLAP_KAVISLI_ARKA_1_2',band(RB-t,RB,G.z0,G.z1),G.taban_y,YT);
 for(const [id,z]of [['DUVAR',G.z0],['UC',G.z1-t]])box('DOLAP_YAN_'+id,[G.on_x,ax(RB-t,z+t),G.taban_y,YT,z,z+t]);
 const split=K.split;
 const service=new T.Group();service.name='PERSONEL_TEZGAH71__SERVIS_KAPAK';root.add(service);
 const cover=foldedCover28(T,{width:G.z1-split-.003,height:.6265,material:steel,name:'PERSONEL_TEZGAH71__SERVIS_BUKUMLU_KAPAK'});cover.rotation.y=Math.PI/2;cover.position.set(F+.003,.41525,(split+.0015+G.z1-.0015)/2);service.add(cover);cover.traverse(o=>o.userData={...o.userData,ist:'PERSONEL',assemblyOwner:'PERSONEL',manufacturingFinish30:true});
 // Continuous inner jambs conceal the cabinet behind 1.5 / 2.5 mm working reveals.
 for(const z of[K.z0,G.z1-.002])box('SABIT_YAN_BINDIRME',[F+.012,G.on_x,.100,.730,z,z+.002]);
 box('SABIT_ALT_BINDIRME',[F+.012,G.on_x,.100,.102,K.z0,G.z1]);
 box('SABIT_UST_BINDIRME',[F+.012,G.on_x,.7285,.730,K.z0,G.z1]);
 box('ORTA_DERZ_ARKA',[F+.012,G.on_x,.102,.7285,split-.002,split+.002]);
 // The straight cupboard is removed; the compact corner contains three drawers.
 box('SUPURGELIK_100',[F+.047,F+.0482,.003,.100,G.z0,G.z1]);
 const foots=[];for(const z of [2.380,2.790])for(const x of [F+.030,ax(RB,z)-.045]){foots.push([x,z]);cylinder('AYAK_TABAN_D40',x,0,z,.020,.010,black);cylinder('AYAK_AYAR_M10',x,.010,z,.005,.025);cylinder('AYAK_GOVDE_D30',x,.035,z,.015,.065);box('AYAK_MONTAJ_PLAKASI',[x-.022,x+.022,.098,.100,z-.022,z+.022]);}
 for(const z of [2.365,split-.010,2.818])for(const x of [G.on_x+.012,ax(RB,z)-.020])rhs('SASI_DIKME',[x,.102,z],[x,.722,z],.012);
 for(const z of [2.380,2.790])rhs('UST_YATAY_TASIYICI',[F+.030,.722,z],[ax(RB,z)-.045,.722,z]);
 rhs('UST_ON_TASIYICI',[F+.030,.722,2.380],[F+.030,.722,2.790]);
 // 250 mm slides fit in the deep left bay; the curved right wing remains a service bay.
 const rz0=G.z0+t,rz1=split,boxz0=rz0+K.ray.kalinlik,boxz1=rz1-K.ray.kalinlik,bx0=G.on_x,bx1=bx0+K.ray.boy-.003;
 for(const [id,label,fy0,fy1,by0,by1]of K.cekmeceler){
  const moving=new T.Group();moving.name='PERSONEL_TEZGAH71__CEKMECE_'+id;root.add(moving);
  const face=foldedCover28(T,{width:split-K.z0-.003,height:fy1-fy0,material:steel,name:'PERSONEL_TEZGAH71__CEKMECE_ON_'+id});face.rotation.y=Math.PI/2;face.position.set(F+.003,(fy0+fy1)/2,(K.z0+.0015+split-.0015)/2);moving.add(face);face.traverse(o=>{o.userData={...o.userData,ist:'PERSONEL',assemblyOwner:'PERSONEL',manufacturingFinish30:true};if(o.isMesh)parts.push(o);});
  solid('CEKMECE_KUTU_'+id,[[bx0,bx1,by0,by1,boxz0,boxz1]],[[bx0+t,bx1-t,by0+t,by1+.005,boxz0+t,boxz1-t]],moving);
  const pullZ0=rz0+.015,pullZ1=rz1-.015,uc=(K.z0+split)/2,vc=(fy0+fy1)/2,W=(split-K.z0-.003)/2,H=(fy1-fy0)/2;
  face.geometry.dispose();face.geometry=closedFurnitureGeometry30(T,{width:2*W,height:2*H,holes:[[uc-pullZ1,uc-pullZ0,fy1-.040-vc,fy1-.018-vc,-.001,.002]]});
  box('GOMME_TUTAMAK_'+id,[F+.008,F+.0095,fy1-.0415,fy1-.0165,pullZ0-.0015,pullZ1+.0015],black,moving);
  for(const y of[fy1-.0415,fy1-.018])box('KULP_CEP_YATAY_'+id,[F+.0045,F+.008,y,y+.0015,pullZ0-.0015,pullZ1+.0015],steel,moving);
  for(const z of[pullZ0-.0015,pullZ1])box('KULP_CEP_UC_'+id,[F+.0045,F+.008,fy1-.040,fy1-.018,z,z+.0015],steel,moving);
  const rails=[];for(const z of [rz0,rz1-K.ray.kalinlik]){
   const yc=(by0+by1)/2-.02285;
   const railFace=new T.Shape();railFace.moveTo(bx0,yc);railFace.lineTo(bx0+K.ray.boy,yc);railFace.lineTo(bx0+K.ray.boy,yc+.0457);railFace.lineTo(bx0,yc+.0457);railFace.closePath();
   for(const x of[bx0+.025,bx0+.225]){const hole=new T.Path();hole.absarc(x,yc+.02285,.00275,0,Math.PI*2,true);railFace.holes.push(hole);}
   const web=new T.ExtrudeGeometry(railFace,{depth:.0015,bevelEnabled:false,curveSegments:12});web.translate(0,0,z);add('RAY_SABIT_'+id,web,steel);
   for(const y of[yc,yc+.0442])box('RAY_SABIT_DONUS_'+id,[bx0,bx0+K.ray.boy,y,y+.0015,z+.0015,z+.003],steel);
   const mid=new T.Group();root.add(mid);solid('RAY_ARA_'+id,[[bx0,bx0+K.ray.boy,yc+.004,yc+.0417,z+.0035,z+.0065]],[[bx0-.001,bx0+.351,yc+.007,yc+.0387,z+.005,z+.008]],mid);rails.push(mid);
   box('RAY_HAREKETLI_'+id,[bx0,bx0+K.ray.boy,yc+.010,yc+.0357,z+.007,z+.010],steel,moving);
  }
  if(id==='NAKIT_FIS')for(const z of [boxz0+.038])box('NAKIT_IC_BOLME',[bx0+.015,bx1-.015,by0+t,by0+.055,z,z+t],steel,moving);
  if(id==='COP_TEMIZLIK')solid('CIKARILIR_COP_KOVASI',[[bx0+.015,bx0+.135,by0+t,by0+.170,boxz0+.012,boxz1-.012]],[[bx0+.0165,bx0+.1335,by0+.003,by0+.175,boxz0+.0135,boxz1-.0135]],moving,new T.MeshStandardMaterial({color:0xd9dedb}));
  const state={value:0,target:0,stroke:K.ray.boy,group:moving,rails,id};states.push(state);
  moving.traverse(o=>{if(o.isMesh)o.userData.twinAction={kind:'elle',label,toggle:()=>state.target=state.target>.5?0:1};});
 }
 const doorState={value:0,target:0};
 // Replace the old cantilever stand as a complete assembly; retain the live tablet mesh.
 const stands=[];g.traverse(o=>{if(/^DUKKAN_SERVIS__TABLET_STAND_/.test(o.name))stands.push(o);});for(const o of stands){o.removeFromParent();o.geometry?.dispose();}
 const tabletMesh=g.getObjectByName('DUKKAN__POS_TABLET');if(tabletMesh)tabletMesh.position.set(...K.tablet.center);
 const payment=g.getObjectByName('DUKKAN_SERVIS__POS_MOVE5000');if(payment){g.updateMatrixWorld(true);const c=new T.Box3().setFromObject(payment).getCenter(new T.Vector3());const mount=new T.Group();mount.name='PERSONEL_TEZGAH71__POS_MONTAJ';g.add(mount);mount.attach(payment);payment.position.sub(c);mount.rotation.y=Math.PI/2;mount.position.set(pos[0],.802,pos[1]);}
 const [sx,sz]=K.tablet.base;
 plan('TABLET_TABAN_3mm',(()=>{const p=new T.Shape();p.moveTo(sx-.045,sz-.045);p.lineTo(sx+.045,sz-.045);p.lineTo(sx+.045,sz+.045);p.lineTo(sx-.045,sz+.045);p.closePath();for(const dx of[-.035,.035])for(const dz of[-.035,.035])p.holes.push(circle(sx+dx,sz+dz,.00275));p.holes.push(circle(sx,sz,.008));return p;})(),TY,TY+.003);
 const column=rhs('TABLET_STAND_KABLO_ICI_RHS20',[sx,TY+.003,sz],[sx,.955,sz]);
 // M6 tilt pivot, captive side cheeks and padded tablet cradle.
 for(const z of[sz-.027,sz+.024])solid('TABLET_MAFSAL_YANAK_3mm',[[sx-.020,sx+.020,.923,.970,z,z+.003]],[[sx-.004,sx+.004,.943,.951,z-.001,z+.004]]);
 const pivot=new T.CylinderGeometry(.003,.003,.058,16);pivot.rotateX(Math.PI/2);pivot.translate(sx,.947,sz);add('TABLET_M6_MAFSAL_MILI',pivot);
 box('TABLET_KABLO_KAPAGI',[sx-.006,sx+.006,.794,.834,sz-.0105,sz-.009],black);
 const cradle=new T.Group();cradle.position.set(...K.tablet.center);cradle.rotation.set(-D.POS_EGIM,-Math.PI/2,0,'YXZ');root.add(cradle);
 box('TABLET_MAFSAL_KOPRUSU',[sx-.009,sx+.014,.946,.976,sz-.010,sz+.010]);
 box('TABLET_ARKA_TASIYICI_2mm',[-.070,.070,-.042,.042,-.011,-.009],steel,cradle);
 for(const u of[-.104,.098]){box('TABLET_YAN_KELEPCE',[u,u+.006,-.025,.025,-.009,.007],steel,cradle);box('TABLET_EPDM_PED',[u+.001,u+.005,-.024,.024,-.009,.002],black,cradle);}
 // Dedicated receipt sorting recess, removable and washable (not a fictitious printer).
 solid('FIS_ALANI_CIKARILIR_TEPSI',[[2.824,3.004,.772,.789,2.355,2.435]],[[2.8255,3.0025,.7735,.791,2.3565,2.4335]]);
 box('FIS_TUTUCU_YAY_KLIPS',[2.826,2.828,.787,.791,2.367,2.422]);
 const oldSockets=[];g.traverse(o=>{if(/^DUKKAN_SERVIS__(MASA_GOMME_PRIZ_(GOVDE|YUZ)|MASA_PRIZ_|MASA_GOMME_USB_PORT|TABLET_ADAPTOR|POS_ADAPTOR)/.test(o.name))oldSockets.push(o);});for(const o of oldSockets)o.removeFromParent();
 box('ALT_SERVIS_PRIZ_GOVDE',[G.on_x,G.on_x+.035,.402,.467,2.755,2.820],black);
 box('ALT_SERVIS_PRIZ_YUZ',[F+.001,F+.003,.402,.467,2.755,2.820],black,service);
 const outlet=new T.CylinderGeometry(.020,.020,.002,32);outlet.rotateZ(Math.PI/2);outlet.translate(F+.0005,.4345,2.7875);add('ALT_SERVIS_PRIZ_YUVA',outlet,new T.MeshStandardMaterial({color:0xdce0e2}),service);
 for(const z of [2.765,2.810])box('ALT_SERVIS_USB_YUVA',[F,F+.001,.448,.455,z-.003,z+.003],black,service);
 box('TABLA_ALTI_KABLO_OLUGU_TABAN',[2.845,2.970,.724,.7255,2.655,2.705]);
 box('TABLA_ALTI_KABLO_OLUGU_YAN',[2.845,2.970,.7255,.766,2.655,2.6565]);
 // Visible fasteners with matching clearance holes; representative hardware, no vendor claim.
 function screw(name,x,y,z,axis='y',parent=root){const sh=new T.CylinderGeometry(.0025,.0025,.010,12),head=new T.CylinderGeometry(.00425,.00425,.003,6);head.translate(0,.0065,0);const group=new T.Group();group.name='PERSONEL_TEZGAH71__'+name;parent.add(group);if(axis==='x')group.rotation.z=-Math.PI/2;if(axis==='z')group.rotation.x=Math.PI/2;group.position.set(x,y,z);add(name+'_M5_GOVDE',sh,steel,group);add(name+'_M5_BAS',head,steel,group);}
 for(const dx of[-.035,.035])for(const dz of[-.035,.035]){screw('TABLET_TABAN_CIVATA',sx+dx,TY-.003,sz+dz);ring('TABLET_M5_PUL',sx+dx,TY+.003,sz+dz,.005,.00275,.001);}
 for(const q of states)for(const z of[rz0+.0015,rz1-.0015])for(const x of[bx0+.025,bx0+.225])screw('RAY_SABIT_CIVATA_'+q.id,x,(K.cekmeceler.find(r=>r[0]===q.id)[4]+K.cekmeceler.find(r=>r[0]===q.id)[5])/2,z,'z');
 for(const z of[split+.025,G.z1-.025]){const fast=box('SERVIS_KAPAK_CEYREK_TUR_KILIT',[F+.001,F+.003,.652,.664,z-.006,z+.006],black,service);fast.userData.twinAction={kind:'elle',label:'Tezgâh servis kapağı · sök / tak',toggle:()=>doorState.target=doorState.target?0:1};}
 IKIZ.kancalar??=[];IKIZ.kancalar.push(dt=>{const step=Math.min(.1,Math.max(0,dt||0))/.9;for(const q of [...states,doorState])q.value+=Math.sign(q.target-q.value)*Math.min(step,Math.abs(q.target-q.value));service.position.x=-.060*doorState.value;for(const q of states){q.group.position.x=-q.stroke*q.value;for(const rail of q.rails)rail.position.x=-q.stroke*q.value*.5;}});
 const bilgi={revizyon:'71-30eki-250mm-production-detail',on_x:F,tabla:{malzeme:'AISI 304, 1.5 mm',z:[Z0,Z1],arka_R_mm:RO*1000,duvar_boslugu_mm:8},dolap:{sac_mm:1.5,ayak:foots,kavisli_kose_kapak:false},cekmece:{ray:K.ray.model,stroke_mm:250,kutu_z:[boxz0,boxz1],kutu_x:[bx0,bx1],adet:3},cihaz:{tablet,pos,socket},uretim:{standard:GOVDE_STANDARD28,rayTedarikciSecimi:'bekliyor',sahaOlcusu:'imalat öncesi doğrulanmalı',arkaForm:'mevcut duvar yarıçapı - 10 mm montaj payı',kaynak:'içten TIG; dış yüzey saten',keskinKenar:'çapak al / R0.5',ustTabla:'1.5 mm AISI304; 40 mm etek / 10 mm iç dönüş',tabletTaban:'3 mm AISI304; 4xØ5.5 / 70x70',baglanti:'M5 perçin somun + M5x10; tablet mafsalı M6',yerindeDelik:'duvar ankrajı alt yapıya göre seçilecek'},parca:parts.length,izler:states};
 liste.push({ad:'PERSONEL_TEZGAH71',tur:'mobilya',kutu:[F,ax(RO,Z0),0,TY+.05,Z0,Z1]});
 IKIZ.personelTezgah71={root,bilgi,ac:i=>{for(const q of i==null?states:[states[i]])q.target=1;},kapat:()=>{for(const q of states)q.target=0;doorState.target=0;},doorState};
 document.documentElement.dataset.personelTezgah71='ready';return bilgi;
}
