import {duvarBirlesikGeometri} from './dukkan_plan.js';
// Remaining shop furniture: removable parts and storage, no machine commands.
export function dukkanKalan29(T,scene,g,MAT,IKIZ){
 if(IKIZ.dukkanKalan29)return IKIZ.dukkanKalan29;
 const root=new T.Group();root.name='DUKKAN__KALAN29';root.userData={assemblyOwner:'SHOP'};g.add(root);
 const steel=new T.MeshStandardMaterial({color:0xc4cdcc,metalness:.82,roughness:.32}),dark=new T.MeshStandardMaterial({color:0x293637,roughness:.7}),paper=new T.MeshStandardMaterial({color:0xf5f0e8,roughness:1}),cloth=new T.MeshStandardMaterial({color:0x416268,roughness:1}),red=new T.MeshStandardMaterial({color:0x9f342d,metalness:.45,roughness:.55});
 for(const m of [steel,dark,paper,cloth,red])m.userData={storefront60Finish:true,preserveReviewMaterial:true};
 const tracks=[],parts=[];const say=text=>IKIZ.parcaDurumYaz?.(text);
 function add(n,geo,mat=steel,parent=root){const o=new T.Mesh(geo,mat);o.name='DUKKAN__KALAN29_'+n;o.userData={assemblyOwner:'SHOP',remaining29:true};parent.add(o);parts.push(o);return o;}
 function box(n,b,mat=steel,parent=root){const geo=new T.BoxGeometry(b[1]-b[0],b[3]-b[2],b[5]-b[4]);geo.translate((b[0]+b[1])/2,(b[2]+b[3])/2,(b[4]+b[5])/2);return add(n,geo,mat,parent);}
 function solid(n,b,holes=[],mat=steel,parent=root){return add(n,duvarBirlesikGeometri(T,b,holes),mat,parent);}
 function cylinder(n,r,h,p,axis='y',mat=steel,parent=root){const geo=new T.CylinderGeometry(r,r,h,24);if(axis==='x')geo.rotateZ(Math.PI/2);if(axis==='z')geo.rotateX(Math.PI/2);geo.translate(...p);return add(n,geo,mat,parent);}
 function rod(n,a,b,r=.004,mat=steel,parent=root){const curve=new T.LineCurve3(new T.Vector3(...a),new T.Vector3(...b));return add(n,new T.TubeGeometry(curve,1,r,12,false),mat,parent);}
 function action(o,label,toggle){o.traverse(m=>{if(m.isMesh)m.userData.twinAction={kind:'elle',label,toggle};});}
 function track(pose){const q={value:0,target:0,pose};tracks.push(q);return q;}
 // Tray stays inside the existing straight concrete bar, never in the aisle.
 const tray=new T.Group();tray.name='DUKKAN__KALAN29_SERVIS_TEPSISI';root.add(tray);
 solid('TEPSI_YIKANABILIR',[ [1.970,2.430,1.015,1.027,3.045,3.200] ],[[1.9712,2.4288,1.0162,1.028,3.0462,3.1988]],steel,tray);
 for(const x of [1.985,2.415])rod('TEPSI_TUTMA',[x,1.029,3.100],[x,1.029,3.145],.003,steel,tray);
 const trayState=track(v=>tray.position.y=.110*v);action(tray,'Servis tepsisi · kaldır / yerine koy',()=>trayState.target=trayState.target?0:1);
 // Inserts are built inside the actual drawer box bounds and move with each drawer.
 const organizers=[];
 for(const id of ['NAKIT_FIS','SARF']){
  const moving=IKIZ.personelTezgah71.root.getObjectByName('PERSONEL_TEZGAH71__CEKMECE_'+id),body=moving?.getObjectByName('PERSONEL_TEZGAH71__CEKMECE_KUTU_'+id);if(!body)throw Error('Drawer box missing '+id);
  body.geometry.computeBoundingBox();const b=body.geometry.boundingBox,x0=b.min.x+.004,x1=b.max.x-.004,z0=b.min.z+.004,z1=b.max.z-.004,y=b.min.y+.003;
  const insert=new T.Group();insert.name='DUKKAN__KALAN29_CEKMECE_DUZENLEYICI_'+id;moving.add(insert);
  const pans=id==='NAKIT_FIS'?[[z0,b.min.z+.035],[b.min.z+.042,z1]]:[[z0,z1]];
  for(const [a,c]of pans)solid('DUZENLEYICI_'+id,[[x0,x1,y,y+.020,a,c]],[[x0+.001,x1-.001,y+.001,y+.021,a+.001,c-.001]],steel,insert);
  if(id==='SARF'){
   box('KALEM_AYIRICI',[x0+.001,x1-.001,y+.001,y+.018,z1-.012,z1-.011],steel,insert);
   for(const x of [x0+.035,x1-.035]){cylinder('FIS_RULOSU',.021,.040,[x,y+.023,(z0+z1-.012)/2],'x',paper,insert);cylinder('FIS_GOBEK',.005,.0405,[x,y+.023,(z0+z1-.012)/2],'x',dark,insert);}
   cylinder('KALEM',.0025,x1-x0-.018,[(x0+x1)/2,y+.004,z1-.006],'x',dark,insert);
  }else for(const x of [x0+.025,x1-.025])cylinder('BOZUK_PARA',.009,.0015,[x,y+.0025,z0+.014],'y',steel,insert);
  organizers.push({id,root:insert,innerBounds:[x0,x1,y,y+.045,z0,z1]});
 }
 // Rail under the dry staff shelf: within its existing 238 mm depth, floor clear.
 const rail=new T.Group();rail.name='DUKKAN__KALAN29_PERSONEL_AYAK_DAYAMA';root.add(rail);
 rod('AYAK_BORUSU',[1.790,.160,1.985],[1.790,.160,2.235],.011,steel,rail);
 for(const z of [1.985,2.235]){rod('AYAK_DUVAR_KOLU',[1.790,.160,z],[1.974,.160,z],.008,steel,rail);box('AYAK_MONTAJ_PLAKASI',[1.974,1.978,.125,.195,z-.018,z+.018],steel,rail);}
 // Existing personal locker: replace the projecting swing leaf with two sliders.
 const old=[];g.traverse(o=>{if(/^(PERSONEL_ESYA_KAPAK|DUKKAN_SERVIS__PERSONEL_ESYA_(KAPAK|KOL))$/.test(o.name))old.push(o);});
 for(const o of old){o.removeFromParent();o.geometry?.dispose();}
 const locker=new T.Group();locker.name='DUKKAN__KALAN29_PERSONEL_DOLAP_ICI';locker.userData={ist:'PERSONEL',katman:'PERSONEL'};root.add(locker);
 const outerSlides=[];
 for(const [i,x0,x1,z]of [[0,1.629,1.780,1.841],[1,1.780,1.931,1.8365]]){
  const leaf=new T.Group();leaf.name='DUKKAN__KALAN29_ESYA_SURGU_'+i;locker.add(leaf);box('ESYA_SURGU_'+i,[x0,x1,.654,2.096,z,z+.002],steel,leaf);box('ESYA_GOMME_TUTAMAK_'+i,[i===0?x1-.020:x0+.012,i===0?x1-.012:x0+.020,1.300,1.410,z+.002,z+.005],dark,leaf);
  const q=track(v=>leaf.position.x=(i===0?.144:-.144)*v);action(leaf,'Personel dolabı · sürgülü kapak',()=>q.target=q.target?0:1);outerSlides.push({leaf,state:q});
 }
 // A separate lockable inner compartment keeps personal items below the apron.
 solid('KISISEL_KILITLI_BOLME',[[1.650,1.910,.700,.950,1.692,1.826]],[[1.6515,1.9085,.7015,.9485,1.6935,1.828]],steel,locker);
 const lockState={locked:true},innerSlides=[];
 for(const [i,x0,x1,z]of [[0,1.653,1.780,1.8265],[1,1.780,1.907,1.8225]]){
  const leaf=new T.Group();leaf.name='DUKKAN__KALAN29_KILITLI_SURGU_'+i;locker.add(leaf);box('KILITLI_SURGU_'+i,[x0,x1,.704,.946,z,z+.0015],red,leaf);box('KILITLI_TUTAMAK_'+i,[x0+.020,x0+.028,.790,.850,z+.0015,z+.0045],dark,leaf);
  const q=track(v=>leaf.position.x=(i===0?.121:-.121)*v);action(leaf,'Kişisel eşya bölmesi · aç / kapat',()=>{if(lockState.locked){say('Önce kişisel bölmenin kilidini aç.');return false;}q.target=q.target?0:1;return true;});innerSlides.push({leaf,state:q});
 }
 const lockParent=innerSlides[0].leaf,lock=cylinder('KISISEL_ANAHTAR_KILIDI',.007,.004,[1.766,.825,1.8305],'z',dark,lockParent);
 box('KILIT_DILI',[1.758,1.800,.820,.830,1.816,1.818],steel,lockParent);
 action(lock,'Kişisel bölme kilidi · kilitle / aç',()=>{if(innerSlides.some(q=>q.state.value>.001||q.state.target)){say('Kilitlemek için önce bölmeyi kapat.');return false;}lockState.locked=!lockState.locked;lock.material=lockState.locked?dark:steel;say(lockState.locked?'Kişisel bölme kilitlendi.':'Kişisel bölmenin kilidi açıldı.');return true;});
 box('ANAHTAR_YARIGI',[1.765,1.767,.821,.829,1.8326,1.8328],steel,lockParent);
 // Apron and its rounded hook are inside the personal locker, away from wash/food.
 box('ONLUK_ASKI_TABANI',[1.765,1.795,1.804,1.844,1.682,1.686],steel,locker);
 const hookCurve=new T.CatmullRomCurve3([[1.780,1.824,1.686],[1.780,1.824,1.716],[1.780,1.816,1.738],[1.780,1.833,1.744]].map(p=>new T.Vector3(...p)));add('ONLUK_YUVARLAK_ASKI',new T.TubeGeometry(hookCurve,20,.0035,8,false),steel,locker);
 const apron=new T.Shape();apron.moveTo(-.110,0);for(const p of [[.110,0],[.100,.400],[.065,.550],[.040,.630],[-.040,.630],[-.065,.550],[-.100,.400]])apron.lineTo(...p);apron.closePath();const ag=new T.ExtrudeGeometry(apron,{depth:.0015,bevelEnabled:false});ag.translate(1.780,1.100,1.737);add('ONLUK_KUMAS',ag,cloth,locker);
 for(const x of [1.743,1.817])rod('ONLUK_BOYUN_BAGI',[x,1.730,1.738],[1.780,1.833,1.744],.003,cloth,locker);
 // Magnetic locating pad lets the napkin dispenser lift off without tools.
 const acc=IKIZ.dukkanAccessories29;
 // Removed exterior napkin dispenser has no remaining mount or animation.
 const napBase=null,napState=null;
 // Leave the bin wall mounts fixed while the bin lifts and pulls off the studs.
 const bin=acc.bin,origin=bin.position.clone(),out=new T.Vector3(0,0,1).applyQuaternion(bin.quaternion),fixed=new T.Group();fixed.name='DUKKAN__KALAN29_COP_SABIT_BAGLANTI';root.add(fixed);scene.updateMatrixWorld(true);
 for(const o of [...bin.children])if(o.name==='DUKKAN__ACC29_COP_DUVAR_ASKISI')fixed.attach(o);
 for(const y of [.230,.440]){
  solid('COP_ANAHTAR_DELIGI_PLAKASI',[[-.020,.020,y-.020,y+.020,-.074,-.072]],[[-.006,.006,y-.012,y,-.075,-.071],[-.003,.003,y,y+.014,-.075,-.071]],steel,bin);
  const pinGroup=new T.Group();pinGroup.position.copy(origin);pinGroup.quaternion.copy(bin.quaternion);root.add(pinGroup);cylinder('COP_SOKME_PIMI',.0025,.014,[0,y+.009,-.078],'z',steel,pinGroup);cylinder('COP_PIM_BASI',.005,.002,[0,y+.009,-.070],'z',steel,pinGroup);
 }
 const release=box('COP_SOKME_MANDALI',[-.012,.012,.435,.461,.071,.075],steel,bin);
 const binState=track(v=>{bin.position.copy(origin).addScaledVector(out,.025*Math.max(0,(v-.4)/.6));bin.position.y+=.080*Math.min(1,v*1.3);});
 action(release,'Çöp kovası · temizlik için çıkar / yerine koy',()=>{if(acc.tracks[0].state.value>.001){say('Önce çöp kutusunun kapağını kapat.');return false;}binState.target=binState.target?0:1;return true;});
 function update(dt){const step=Math.min(.1,Math.max(0,dt||0))/.8;for(const q of tracks){q.value+=Math.sign(q.target-q.value)*Math.min(step,Math.abs(q.target-q.value));q.pose(q.value);}}
 IKIZ.kancalar.push(update);
 const info={revision:'29eki-remaining',serviceTray_mm:[460,155,12],drawerOrganizers:organizers.length,personalLockbox:true,apronInsideLocker:true,footrailUnderDryShelf:true,quickReleaseNapkin:false,quickReleaseBin:true,cashierSizeUnchanged:true,doorwaysUnchanged:true,cameraChanged:false,outerLockerUsesSliders:true};
 IKIZ.dukkanKalan29={root,info,tray,trayState,organizers,rail,locker,outerSlides,innerSlides,lock,lockState,napBase,napState,binState,fixed,update};return IKIZ.dukkanKalan29;
}
