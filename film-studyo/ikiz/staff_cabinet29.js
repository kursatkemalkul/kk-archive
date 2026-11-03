import {duvarBirlesikGeometri} from './dukkan_plan.js';
import {GOVDE_STANDARD28} from './govde_standard28.js';
import {closedFurnitureCover30 as foldedCover28,closedFurnitureGeometry30} from './furniture_closed30.js';
import {pianoBlack29} from './piano_black29.js';
// One replacement staff cupboard; QR-style thin RHS frame and double-skin sheets.
export function staffCabinet29(T,scene,g,IKIZ,liste=[]){
 if(IKIZ.staffCabinet29)return IKIZ.staffCabinet29;
 const removed=[];
 function retire(o){if(!o?.parent)return;removed.push(o.name);o.removeFromParent();o.traverse(x=>x.geometry?.dispose());}
 retire(IKIZ.dukkanAccessories29?.staff);retire(IKIZ.dukkanKalan29?.locker);retire(IKIZ.dukkanKalan29?.rail);retire(g.getObjectByName('PERSONEL_ESYA_SOL_DUVAR'));
 const oldMounts=[];g.traverse(o=>{if(/^DUKKAN_SERVIS__PERSONEL_DOLAP_DUVAR_ASKISI/.test(o.name))oldMounts.push(o);});oldMounts.forEach(retire);
 if(IKIZ.dukkanAccessories29){IKIZ.dukkanAccessories29.tracks.splice(1);IKIZ.dukkanAccessories29.info.staffReplacement='PERSONEL_BOY_DOLABI29';}
 if(IKIZ.dukkanKalan29)Object.assign(IKIZ.dukkanKalan29.info,{personalLockbox:false,apronInsideLocker:false,footrailUnderDryShelf:false,outerLockerUsesSliders:false,staffReplacement:'PERSONEL_BOY_DOLABI29'});
 const root=new T.Group();root.name='PERSONEL_BOY_DOLABI29';root.userData={assemblyOwner:'PERSONEL',ist:'PERSONEL',katman:'mobilya'};g.add(root);
 const env=pianoBlack29(T,scene,IKIZ).env,steel=new T.MeshStandardMaterial({color:0xd7dce0,metalness:.35,roughness:.45,envMap:env,envMapIntensity:1.0}),dark=new T.MeshStandardMaterial({color:0x343b3d,roughness:.8});
 for(const m of [steel,dark])m.userData={storefront60Finish:true,preserveReviewMaterial:true,gercekRenk:true};
 const parts=[],doors=[];
 function add(n,geo,mat=steel,parent=root,kind='sac'){const o=new T.Mesh(geo,mat);o.name='PERSONEL_BOY29__'+n;o.userData={assemblyOwner:'PERSONEL',ist:'PERSONEL',katman:kind,staffCabinet29:true,manufacturingFinish30:true};parent.add(o);parts.push(o);return o;}
 function box(n,b,mat=steel,parent=root,kind='sac'){if(!b.every(Number.isFinite)||[0,2,4].some(i=>b[i+1]<=b[i]))throw Error('Invalid cupboard part '+n);const geo=new T.BoxGeometry(b[1]-b[0],b[3]-b[2],b[5]-b[4]);geo.translate((b[0]+b[1])/2,(b[2]+b[3])/2,(b[4]+b[5])/2);return add(n,geo,mat,parent,kind);}
 function rhs(n,b,axis){const hole=b.slice(),t=.0012;for(const a of[0,1,2])if(a!==axis){hole[a*2]+=t;hole[a*2+1]-=t;}hole[axis*2]-=.001;hole[axis*2+1]+=.001;return add(n,duvarBirlesikGeometri(T,[b],[hole]),steel,root,'sasi');}
 // Butt-jointed frame: outside rails and side crossmembers meet end-to-end.
 for(const x of[1.770,1.956])for(const z of[1.681,2.249])rhs('DIKME_20x10',[x,x+.020,.1115,2.349,z,z+.010],1);
 for(const x of[1.770,1.956])for(const y of[.1015,2.349])rhs('YATAY_20x10',[x,x+.020,y,y+.010,1.681,2.259],2);
 for(const y of[.1015,2.349])for(const z of[1.681,2.239])rhs('YAN_KAYIT_20x10',[1.790,1.956,y,y+.010,z,z+.020],0);
 // Continuous 1.5 mm enclosure, meeting at all corners. Profiles stay inside.
 box('ARKA_SAC_1_5mm',[1.9765,1.978,.100,2.361,1.679,2.261]);
 box('SOL_YAN_SAC_1_5mm',[1.740,1.9765,.100,2.361,1.679,1.6805]);
 box('SAG_YAN_SAC_1_5mm',[1.740,1.9765,.100,2.361,2.2595,2.261]);
 box('UST_SAC_1_5mm',[1.740,1.9765,2.3595,2.361,1.6805,2.2595]);
 box('ALT_SAC_1_5mm',[1.740,1.9765,.100,.1015,1.6805,2.2595]);
 // Fixed folded jambs conceal rail cavities; leaves slide behind their overlap.
 for(const z of[1.6805,2.246])box('KAPALI_YAN_PERVAZ',[1.740,1.7415,.1015,2.3595,z,z+.0135]);
 for(const y of[.1015,2.339])box('KAPALI_RAY_ALIN',[1.740,1.7415,y,y+.0205,1.694,2.246]);
 const shelfYs=[.128,.550,1.000,1.450,1.900];
 for(const [i,y]of shelfYs.entries()){
  // Flat upper surface. All stiffening folds are underneath, joined as one mesh.
  const x0=1.792,x1=1.954,z0=i>=3?1.999:1.692,z1=2.248,t=.0012;
  const v=[[x0,x1,y-t,y,z0,z1],[x0,x0+t,y-.012,y-t,z0,z1],[x1-t,x1,y-.012,y-t,z0,z1],[x0+t,x1-t,y-.012,y-t,z0,z0+t],[x0+t,x1-t,y-.012,y-t,z1-t,z1]];
  add('RAF_TABLA_1_2mm_'+i,duvarBirlesikGeometri(T,v),steel);
  for(const x of[1.800,1.925])for(const side of[0,1]){
   const za=side?2.230:(i>=3?1.9875:1.682),zb=side?2.258:(i>=3?2.0155:1.710);
   if(i===0)box('ALT_RAF_MESNET',[x,x+.018,.1115,y-.012,za,zb]);
   else {
    box('RAF_L_ALT_DESTEK_'+i,[x,x+.018,y-.0135,y-.012,za,zb]);
    box('RAF_L_DUVAR_TABANI_'+i,[x,x+.018,y-.0335,y-.0135,side?2.258:(i>=3?1.986:1.6805),side?2.2595:(i>=3?1.9875:1.682)]);
   }
  }
 }
 // Two parallel rails and 3.5 mm double skins, all within the cupboard envelope.
 for(const x of[1.742,1.757])for(const y of[.112,2.342]){
  box('SURGU_RAY_TABAN',[x,x+.010,y,y+.0015,1.690,2.250]);box('SURGU_RAY_YAN',[x+.0085,x+.010,y+.0015,y+.006,1.690,2.250]);
 }
 for(const [i,x,z0,z1,travel]of[[0,1.740,1.694,1.980,.266],[1,1.755,1.960,2.246,-.266]]){
  const leaf=new T.Group();leaf.name='PERSONEL_BOY29__SURGU_KANAT_'+i;leaf.userData={assemblyOwner:'PERSONEL',katman:'kapak'};root.add(leaf);
  const y0=.124,y1=2.337,hz=i===0?z1-.035:z0+.025;
  // Same AISI304 t1.5 / R1.5 / 8 mm folded tray as the QR cabinet.
  const panel=foldedCover28(T,{width:z1-z0,height:y1-y0,material:steel,name:'PERSONEL_BOY29__QR_STANDART_KAPAK_'+i});
  panel.rotation.y=Math.PI/2;panel.position.set(x,(y0+y1)/2,(z0+z1)/2);leaf.add(panel);
  panel.traverse(o=>{o.userData={...o.userData,assemblyOwner:'PERSONEL',ist:'PERSONEL',staffCabinet29:true,manufacturingFinish30:true};if(o.isMesh)parts.push(o);});
  // A closed finger pocket through the face only, with a bottom and four walls.
  const W=(z1-z0)/2,H=(y1-y0)/2;
  const u=(z0+z1)/2-(hz+.007),v=1.15-(y0+y1)/2;
  panel.geometry.dispose();panel.geometry=closedFurnitureGeometry30(T,{width:2*W,height:2*H,holes:[[u-.007,u+.007,v-.070,v+.070,-.001,.002]]});
  box('GOMME_KULP_ARKA_'+i,[x+.005,x+.0065,1.0785,1.2215,hz-.0015,hz+.0155],dark,leaf,'kapak');
  for(const z of[hz-.0015,hz+.014])box('GOMME_KULP_YAN_'+i,[x+.0015,x+.005,1.0785,1.2215,z,z+.0015],steel,leaf,'kapak');
  for(const y of[1.0785,1.220])box('GOMME_KULP_UC_'+i,[x+.0015,x+.005,y,y+.0015,hz,hz+.014],steel,leaf,'kapak');
  const state={value:0,target:0,travel,leaf};leaf.traverse(o=>{if(o.isMesh)o.userData.twinAction={kind:'elle',label:'Personel boy dolabı · sürgülü kapak',toggle:()=>{const next=state.target?0:1;for(const q of doors)q.target=0;state.target=next;}};});doors.push(state);
 }
 for(const x of[1.796,1.946])for(const z of[1.710,2.230]){
  for(const [n,r,y,h,mat]of[['PABUC',.012,0,.010,dark],['AYAR_M8',.004,.010,.040,steel],['AYAK_KOVANI',.009,.035,.063,steel]]){const geo=new T.CylinderGeometry(r,r,h,24);geo.translate(x,y+h/2,z);add(n,geo,mat,root,'sasi');}
  box('AYAK_UST_PLAKA',[x-.022,x+.022,.098,.100,z-.022,z+.022],steel,root,'sasi');
 }
 // Assembly hardware and anti-tip straps, all inside the existing furniture envelope.
 function screw(n,x,y,z,axis='y',parent=root){const head=new T.CylinderGeometry(.0038,.0038,.0025,6),stem=new T.CylinderGeometry(.002,.002,.008,12);head.translate(0,.00525,0);const group=new T.Group();group.position.set(x,y,z);if(axis==='x')group.rotation.z=-Math.PI/2;parent.add(group);add(n+'_M4_BAS',head,steel,group,'baglanti');add(n+'_M4_GOVDE',stem,steel,group,'baglanti');}
 for(const z of[1.730,2.210]){
  box('DEVRILME_EMNIYET_L_2mm',[1.952,1.9765,2.300,2.302,z-.020,z+.020]);
  box('DEVRILME_EMNIYET_L_DIKEY',[1.9745,1.9765,2.302,2.338,z-.020,z+.020]);
  screw('EMNIYET_M4',1.970,2.318,z,'x');
 }
 // Captive top/bottom roller pairs and mounting ears move with each leaf.
 for(const [i,q]of doors.entries()){
  const face=q.leaf.children[0],zmid=face.position.z,x=face.position.x;
  for(const z of[zmid-.100,zmid+.100])for(const y of[.116,2.346]){
   box('SURGU_MAKARA_KULAGI_'+i,[x+.003,x+.0045,y<1?y-.010:2.337,y<1?.124:y+.010,z-.008,z+.008],steel,q.leaf,'kapak');
   const wheel=new T.CylinderGeometry(.004,.004,.0025,20);wheel.rotateZ(Math.PI/2);wheel.translate(x+.006,y,z);add('SURGU_POM_MAKARA_'+i,wheel,dark,q.leaf,'kapak');
   const pin=new T.CylinderGeometry(.0015,.0015,.005,12);pin.rotateZ(Math.PI/2);pin.translate(x+.005,y,z);add('SURGU_M3_MAKARA_PIMI_'+i,pin,steel,q.leaf,'kapak');
  }
 }
 for(const m of parts){m.userData.manufacturingFinish30=true;m.userData.manufacture={material:'AISI304',edge:'Çapak al / R0.5',join:'İçten TIG / M4 perçin somun',source:'dimensioned custom fabrication; not OEM CAD'};}
 for(const q of doors)q.leaf.traverse(o=>{if(o.isMesh)o.userData.twinAction={kind:'elle',label:'Personel dolabı · sürgülü kapak',toggle:()=>{const next=q.target?0:1;for(const p of doors)p.target=0;q.target=next;}};});
 function update(dt){const step=Math.min(.1,Math.max(0,dt||0))/.9;for(const q of doors){q.value+=Math.sign(q.target-q.value)*Math.min(step,Math.abs(q.target-q.value));q.leaf.position.z=q.value*q.travel;}}
 // The left upper bay is open vertically for a hanging coat/apron; upper
 // shelves occupy only the right bay. Personal belongings stay in this cabinet.
 box('KISISEL_UST_BOLME_AYIRICI',[1.792,1.954,1.001,2.339,1.986,1.9875]);
 const cloth=new T.MeshStandardMaterial({color:0x365561,roughness:1}),bagMat=new T.MeshStandardMaterial({color:0x4b4138,roughness:.95});
 for(const m of [cloth,bagMat])m.userData={gercekRenk:true,preserveReviewMaterial:true,storefront60Finish:true};
 function personalTube(name,points,r=.004,mat=steel){return add(name,new T.TubeGeometry(new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p))),24,r,8,false),mat,root,'kisisel');}
 for(const z of[1.765,1.915]){
  box('KIYAFET_ASKI_MONTAJ',[1.970,1.9765,2.205,2.255,z-.012,z+.012]);
  personalTube('YUVARLAK_KIYAFET_ASKISI',[[1.970,2.230,z],[1.887,2.230,z],[1.862,2.215,z],[1.854,2.230,z]],.004);
 }
 // Flat hanging garment fits the shallow cupboard without crossing the sliders.
 const garment=new T.Shape();garment.moveTo(-.080,0);garment.lineTo(.080,0);garment.lineTo(.095,.70);garment.lineTo(.125,.79);garment.lineTo(.072,.89);garment.lineTo(.035,.93);garment.lineTo(-.035,.93);garment.lineTo(-.072,.89);garment.lineTo(-.125,.79);garment.lineTo(-.095,.70);garment.closePath();
 const garmentGeo=new T.ExtrudeGeometry(garment,{depth:.003,bevelEnabled:false});garmentGeo.rotateY(Math.PI/2);garmentGeo.translate(1.860,1.250,1.817);add('ASILMIS_PERSONEL_KIYAFETI',garmentGeo,cloth,root,'kisisel');
 personalTube('KIYAFET_ASMA_BAGI',[[1.862,2.160,1.787],[1.862,2.222,1.765],[1.862,2.160,1.847]],.003,cloth);
 box('KISISEL_CANTA',[1.815,1.930,.565,.850,1.750,1.945],bagMat,root,'kisisel');
 personalTube('CANTA_KULPU',[[1.855,.848,1.790],[1.855,.925,1.818],[1.855,.925,1.880],[1.855,.848,1.910]],.006,bagMat);
 // Phone charging moved to the dry staff counter (shop_equipment30).
 // Same stool design as outside, tucked between cupboard and cashier. No new
 // floor anchors in the staff aisle: portable wide base, existing footrest.
 const template=IKIZ.disBar29?.root.getObjectByName('DUKKAN__BAR29_TABURE_1');
 if(!template)throw Error('Exterior stool reference missing');
 const staffStool=template.clone(true);staffStool.name='PERSONEL_DINLENME_TABURESI30';staffStool.position.set(2.120,0,2.580);staffStool.rotation.y=0;g.add(staffStool);
 const remove=[];staffStool.traverse(o=>{o.userData={assemblyOwner:'PERSONEL',ist:'PERSONEL',katman:'mobilya',manufacturingFinish30:true};if(/ZEMIN_ANKRAJI/.test(o.name))remove.push(o);});remove.forEach(o=>o.removeFromParent());
 const feet=new T.Mesh(new T.CylinderGeometry(.145,.150,.014,48),dark);feet.name='PERSONEL_TABURE_KAYMAZ_PORTATIF_TABAN';feet.position.y=.007;staffStool.add(feet);
 staffStool.updateMatrix();staffStool.matrixAutoUpdate=false;
 IKIZ.staffNeeds30={stool:staffStool,info:{personalCabinet:true,hangingBay:true,coatHooks:2,bagBay:true,phoneChargingBay:false,phoneChargingAtCounter:true,stoolCenter:[2.120,0,2.580],seatDiameter_mm:320,entranceLaneX:[.686,1.586],noFoodOrChemicalsInPersonalCabinet:true}};
 IKIZ.kancalar.push(update);
 const info={revision:'30eki-qr-fabrication-detail',outerBounds:[1.740,1.978,0,2.361,1.679,2.261],width_mm:582,depth_mm:238,height_mm:2361,profile_mm:[20,10,1.2],skin_mm:1.5,shelf_mm:1.2,doorDoubleSkin_mm:8,standard:GOVDE_STANDARD28,closedCorners:true,finish:0xd7dce0,shelves:shelfYs.length,slidingDoors:2,noAisleProjection:true,empty:false,personalUse:true,hangingBay:true,phoneChargingBay:false,manufacture:{shelfReturns_mm:12,shelfTop:'flat; returns below',closedEndCaps:true,fasteners:"M4 perçin somun + M4x8; delik merkezleri imalat çiziminde doğrulanmalı",antiTip:"2 üst L bağlantı; duvar ankrajı alt yapıya göre seçilecek",slideHardware:"özel çift kanal; makara/ray üretici seçimi bekliyor",siteDimensions:"imalat öncesi ölçü ve tolerans doğrulaması gerekli"},removed};
 liste.push({ad:'PERSONEL_BOY_DOLABI29',tur:'mobilya',kutu:info.outerBounds});IKIZ.staffCabinet29={root,parts,doors,update,info};return IKIZ.staffCabinet29;
}
