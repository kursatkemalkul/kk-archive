import {barCam29} from './bar_cam29.js?v=29eki-click-glass';
import {PLAN} from './dukkan_plan.js';
const CAM_Z=PLAN.yikamaArka[1], CAM_R=3.002-CAM_Z, CAM_CX=3.273-CAM_R;
import {sleepingCat67} from './sleeping_cat67.js';   // QR-8 geri alındı (Kemal 22 Eki: "yeni kediyi kaldır, eskisini yerine koy"); kedi22.js + models/kedi22.glb diskte duruyor, yüklenmiyor
import {pin67} from './pin67.js';
import {dukkanShell65} from './dukkan_shell65.js?v=448f23f9b1e2';
// Shop-front concept in metres. The QR cabinet is deliberately outside this module.
// Curved glazing, its sill and its head share a single plan curve derived from the wash divider end.
export function cephe58Yuru(x,z,rol){
 if(z<2.105)return true;
 if(['personel','doldurma','patron'].includes(rol)&&x>=.886&&x<=1.386)return true;
 if(['personel','doldurma','patron'].includes(rol)&&x>=.736&&x<3.073&&(x<=CAM_CX?z<=2.802:Math.hypot(x-CAM_CX,z-CAM_Z)<=CAM_R-.2))return true;
 if(x<.236||x>CAM_CX+CAM_R+.425)return true;
 return x<=CAM_CX?z>=3.427:Math.hypot(x-CAM_CX,z-CAM_Z)>=CAM_R+.425;
}
export function dukkanCephe58(T,g,D,liste,MAT,IKIZ){
 const root=new T.Group();root.name='DUKKAN__CEPHE58';g.add(root);
 const orange=new T.MeshStandardMaterial({color:0xe16520,roughness:.38,metalness:.12});orange.userData.preserveReviewMaterial=true;orange.userData.storefront60Finish=true;
 const ribMat=new T.MeshStandardMaterial({color:0xeb7529,roughness:.42,metalness:.12});
 const trim=new T.MeshStandardMaterial({color:0x8e310d,roughness:.4,metalness:.25});
 // A neutral shop-window reflection is local to this glass material; the rest
 // of the scene, especially QR materials, keeps its original lighting.
 const envCanvas=document.createElement('canvas');envCanvas.width=1024;envCanvas.height=512;const ec=envCanvas.getContext('2d');ec.fillStyle='#57483d';ec.fillRect(0,0,1024,512);ec.fillStyle='#b9afa3';ec.fillRect(0,155,1024,125);ec.fillStyle='#f7f3e8';ec.fillRect(110,60,28,345);ec.fillRect(720,70,55,320);ec.fillStyle='#7d6a59';ec.fillRect(0,300,1024,212);const env=new T.CanvasTexture(envCanvas);env.mapping=T.EquirectangularReflectionMapping;env.colorSpace=T.SRGBColorSpace;
 const glass=new T.MeshPhysicalMaterial({color:0xc28b62,roughness:.08,metalness:0,transparent:true,opacity:.35,depthWrite:false,side:T.DoubleSide,clearcoat:1,envMap:env,envMapIntensity:.55});
 function mesh(name,geo,mat=orange){const o=new T.Mesh(geo,mat);o.name='DUKKAN__CEPHE58_'+name;root.add(o);return o;}
 function box(n,a,m=orange){const o=mesh(n,new T.BoxGeometry(a[1]-a[0],a[3]-a[2],a[5]-a[4]),m);o.position.set((a[0]+a[1])/2,(a[2]+a[3])/2,(a[4]+a[5])/2);return o;}
 function extrudeXY(n,path,depth,z,mat=orange){const geo=new T.ExtrudeGeometry(path,{depth,steps:1,bevelEnabled:false,curveSegments:48});geo.translate(0,0,z);return mesh(n,geo,mat);}
 // One L-shaped fascia: right vertical, one right-hand radius, then
 // an uninterrupted horizontal band to the glass. There is no left arch foot.
 const staff=new T.Shape();staff.moveTo(.436,0);staff.lineTo(.686,0);staff.lineTo(.686,2.10);staff.lineTo(1.586,2.10);staff.lineTo(1.586,0);staff.lineTo(1.770,0);staff.lineTo(1.770,2.39);staff.lineTo(.436,2.39);staff.closePath();extrudeXY('PERSONEL_DUZ_CEPHE',staff,.019,2.983);
 const fascia=new T.Shape();fascia.moveTo(.436,2.39);fascia.lineTo(5.170,2.39);fascia.absarc(5.170,2.200,.190,Math.PI/2,0,true);fascia.lineTo(5.360,0);fascia.lineTo(5.460,0);fascia.lineTo(5.460,2.8);fascia.lineTo(.436,2.8);fascia.closePath();extrudeXY('KESINTISIZ_ON_UST_BANT_VE_SAG_KEMER',fascia,.019,2.983);
 box('SAG_DIS_DONUS',[5.460,5.479,0,2.8,2.105,3.002]);
 // Radial 19 mm soffit, tangent to the QR top/right corner at (5.360,2.200).
 const soffit=new T.Shape();soffit.moveTo(3.273,2.390);soffit.lineTo(5.170,2.390);
 soffit.absarc(5.170,2.200,.190,Math.PI/2,0,true);soffit.lineTo(5.379,2.200);
 soffit.absarc(5.170,2.200,.209,0,Math.PI/2,false);soffit.lineTo(3.273,2.409);soffit.closePath();
 extrudeXY('SADECE_SAGDAN_DONEN_SACAK',soffit,.878,2.105);
 // The original right column, kiosk and QR reader remain under this canopy.
 box('KESINTISIZ_UST_KAPAMA',[.536,5.360,2.780,2.800,2.105,2.983]);
 // Colour the EXISTING building header surface; do not add an overhead board.
 const wall=g.getObjectByName('DUKKAN__TEK_PARCA_DUVAR');if(wall){const geo=wall.geometry.clone(),p=geo.attributes.position,ix=geo.index;geo.clearGroups();let begin=0,last=-1;for(let i=0;i<(ix?.count??p.count);i+=3){const ids=[0,1,2].map(j=>ix?ix.getX(i+j):i+j),header=ids.every(j=>Math.abs(p.getZ(j)-2.105)<.00001&&p.getY(j)>=2.0499&&p.getX(j)>=3.1669)||ids.every(j=>p.getX(j)>=5.3659&&p.getZ(j)>=2.1049),m=header?1:0;if(last!==m){if(last>=0)geo.addGroup(begin,i-begin,last);begin=i;last=m;}}geo.addGroup(begin,(ix?.count??p.count)-begin,last);wall.geometry=geo;wall.material=[Array.isArray(wall.material)?wall.material[0]:wall.material,orange];}
 // The photograph has fluting on the building wall ABOVE the existing display.
 // Smooth wall finish: no vertical flutes over the QR cabinet.
 // The glazed bay turns back towards the existing wall; no QR geometry is moved.
 const x0=1.77,cx=CAM_CX,cz=CAM_Z,R=CAM_R;
 function curve(t,r=R){if(t<=cx-x0)return[x0+t,cz+r];const a=(t-(cx-x0))/r;return[cx+r*Math.sin(a),cz+r*Math.cos(a)];}
 const length=(cx-x0)+Math.PI*R/2;
 function bandShape(ro,ri,start=x0){const s=new T.Shape();s.moveTo(start,cz+ro);s.lineTo(cx,cz+ro);s.absarc(cx,cz,ro,Math.PI/2,0,true);s.lineTo(cx+ri,cz);s.absarc(cx,cz,ri,0,Math.PI/2,false);s.lineTo(start,cz+ri);s.closePath();return s;}
 function planExtrude(n,shape,y0,y1,mat){const geo=new T.ExtrudeGeometry(shape,{depth:y1-y0,steps:1,bevelEnabled:false,curveSegments:64});const p=geo.attributes.position;for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getY(i),y=p.getZ(i);p.setXYZ(i,x,y+y0,z);}const indices=[];for(let i=0;i<p.count;i+=3)indices.push(i,i+2,i+1);geo.setIndex(indices);geo.computeVertexNormals();return mesh(n,geo,mat);}
 // Only the corner stays fixed. Straight glazing is built as a balanced sliding sash below.
 const laminate=glass.clone();laminate.opacity=.10;
 planExtrude('KAVISLI_CAM_DIS_5MM',bandShape(R-.045,R-.050,cx),1.015,2.035,glass);
 planExtrude('KAVISLI_CAM_ARA_076',bandShape(R-.050,R-.05076,cx),1.015,2.035,laminate);
 planExtrude('KAVISLI_CAM_IC_5MM',bandShape(R-.05076,R-.05576,cx),1.015,2.035,glass);
 // Hollow apron and a closed top follow the same glazing bend.
 planExtrude('KAVISLI_ALT_GOVDE',bandShape(R,R-.100),0,1.0,orange);
 planExtrude('CAM_USTU_KAVISLI_CITALI_BANT',bandShape(R,R-.100),2.05,2.39,orange);
 // Thin underside closes the gap between the curved fluting and flat fascia.
 const overhang=new T.Shape(),joinZ=2.983,joinAngle=Math.asin((joinZ-cz)/R);overhang.moveTo(cx+R*Math.cos(joinAngle),joinZ);overhang.lineTo(cx+R,joinZ);overhang.lineTo(cx+R,cz);overhang.absarc(cx,cz,R,0,joinAngle,false);overhang.closePath();planExtrude('KAVIS_DUZ_BANT_ALT_BIRLESIMI',overhang,2.390,2.409,orange);
 // The shell's concrete bar forms the flush window sill; no separate trim.
 planExtrude('CAM_UST_PROFIL',bandShape(R,R-.100),2.035,2.05,trim);
 box('CAM_SOL_PROFIL',[1.770,1.782,1.015,2.035,2.983,3.004],trim);
 box('CAM_DONUS_BITIS',[3.173,3.273,1.015,2.035,cz,cz+.012],trim);
 // Smooth concrete apron and header; no vertical flutes.
 // Keep the original staff door datum. Move the complete desk assembly
 // left as a rigid unit. The kiosk stays in the original right column.
 const desk=n=>/^DUKKAN__DAR_TEZGAH_|^DUKKAN__POS_TABLET$|^PERSONEL_(KASA_DOLABI|COP_5L)$|^DUKKAN_SERVIS__(TABLET_|POS_|MASA_|KASA_|APG_NANO_|COP_|NAKIT_|SARF_|YEDEK_FIS_|TEZGAH_KABLO)/.test(n);
 function tops(test){const a=[];g.traverse(o=>{if(!test(o.name))return;for(let p=o.parent;p&&p!==g;p=p.parent)if(test(p.name))return;a.push(o);});return a;}
 for(const o of tops(desk))o.position.x-=.450;
 const leaf=g.getObjectByName('DUKKAN__KAPI_PERSONEL_KANAT');if(leaf)leaf.material=orange;
 for(const n of ['SOL','SAG','UST']){const jamb=g.getObjectByName('DUKKAN__KAPI_PERSONEL_KASA_'+n);if(jamb)jamb.material=trim;}
 const oldGlass=g.getObjectByName('DUKKAN__PENCERE_CAM_SURME');if(oldGlass){oldGlass.visible=false;oldGlass.userData.cephe58Retired=true;}
 // Recessed warm lamps occupy the front canopy, well forward of the QR cabinet.
 const lampMat=new T.MeshStandardMaterial({color:0xffe4ba,emissive:0xffc680,emissiveIntensity:1.1,roughness:.3});
 for(const x of [3.65,4.30,4.95]){const rim=mesh('SPOT_KASA_'+x,new T.CylinderGeometry(.027,.027,.010,32),trim);rim.position.set(x,2.387,2.600);const lens=mesh('SPOT_'+x,new T.CylinderGeometry(.019,.019,.002,32),lampMat);lens.position.set(x,2.381,2.600);}

 const shell65=dukkanShell65(T,g,root,orange,IKIZ);
 // Close the tangent corner with a square flute on the common header datum.

 // Exterior leaf and facade share one finish plane and one 32 mm flute grid.
 const door=g.getObjectByName('DUKKAN__KAPI_PERSONEL_KANAT_PIVOT');
 // The old flat window's pull handles have no function on the fixed curved pane.
 for(const o of [...g.children])if(/^DUKKAN__CAM_(KOL|TUTAMAK)|^DUKKAN__PENCERE_(KOL|RAY)/.test(o.name)){o.removeFromParent();o.geometry?.dispose();}
 pin67(T,root);let catRequested67=false;IKIZ.kancalar.push(()=>{if(IKIZ.yuklendi&&!catRequested67){catRequested67=true;sleepingCat67(root);}});
 // One draw call per moving/static flute group, rather than one per strip.
 function batchFlutes(parent,objects,label){if(!objects.length)return;const unit=new T.BoxGeometry(1,1,1),batch=new T.InstancedMesh(unit,ribMat,objects.length);batch.name='DUKKAN__'+label;
  for(let i=0;i<objects.length;i++){const o=objects[i];o.updateMatrix();const size=new T.Vector3();o.geometry.computeBoundingBox();o.geometry.boundingBox.getSize(size);const m=o.matrix.clone().multiply(new T.Matrix4().makeScale(size.x,size.y,size.z));batch.setMatrixAt(i,m);o.removeFromParent();o.geometry.dispose();}
  parent.add(batch);batch.computeBoundingBox();batch.computeBoundingSphere();return batch;
 }
 const staticFlutes=[...root.children].filter(o=>o.isMesh&&o.material===ribMat);batchFlutes(root,staticFlutes,'CEPHE67_SABIT_CITALAR');
 const movingFlutes=door?[...door.children].filter(o=>o.name==='DUKKAN__KAPI_PERSONEL_CITA'):[];if(door)batchFlutes(door,movingFlutes,'KAPI_PERSONEL_CITALAR');
 document.documentElement.dataset.storefront67=JSON.stringify({staticFlutes:staticFlutes.length,doorFlutes:movingFlutes.length,fluteDrawCalls:door?2:1,closedLeafDatum:3.002,fluteFrontDatum:3.015,sign:'Pin'});
 // All facade-local mesh transforms are fixed. Moving door pivots remain
 // fully dynamic; only their fixed flute children keep a cached local matrix.
 barCam29(T,root,orange,glass,trim,IKIZ,liste);
 root.traverse(o=>{o.updateMatrix();o.matrixAutoUpdate=!(!o.userData.bar29Dynamic);});
 const facadeDoor72=door;facadeDoor72?.children.filter(o=>o.name==='DUKKAN__KAPI_PERSONEL_CITALAR').forEach(o=>{o.updateMatrix();o.matrixAutoUpdate=false;});
 const hide=hidden=>{root.visible=!hidden;};
 const bilgi={revision:67,scope:'Main Digital Twin storefront',glassRadius_mm:Math.round(R*1000),shutterRemoved:true,headerFrontDatum_m:3.002,headerBottom_m:2.390,glazingFinishedTop_m:2.050,deskShift_m:-.450,glassThickness_mm:10.76,glazing:'laminated fixed corner + balanced vertical straight sash',bayProjection_mm:Math.round(R*1000),qrCabinetChanged:false,overheadBox:false,addedSignage:true,soffitThickness_mm:19,leftArchFoot:false,rightColumnRetained:true,canopyProjection_mm:897,glassEnd:[3.273,cz],QRFrontDatum_m:2.105,glassToDividerJointGap_mm:0,glazingSetbackFromQR_mm:243,productionRelease:false};
 const view=()=>{IKIZ.gezintiCik?.();IKIZ.katmanlar.reset();IKIZ.dukkan.duvarGizle(false);IKIZ.sahne.kontrol.target.set(2.95,1.85,2.6);IKIZ.kamera.position.set(3.15,2.7,10.2);if(new URLSearchParams(location.search).get('kedi')==='1'){IKIZ.sahne.kontrol.target.set(2.951,3.25,2.85);IKIZ.kamera.position.set(3.15,3.95,7.65);}IKIZ.sahne.kontrol.update();};
 IKIZ.cephe58={root,bilgi,hide,view,personelDatum:2.983,shell65};
 if(new URLSearchParams(location.search).get('cephe')==='1'){let opened=false;IKIZ.kancalar.push(()=>{if(!opened&&IKIZ.yuklendi){opened=true;view();}});}
 liste.push({ad:'CEPHE58',tur:'duvar',kutu:[.436,5.479,0,2.8,2.105,3.004]});return {root,hide,bilgi};
}
