import {SHELL82} from './yerlesim82-data.js';
import {duvarBirlesikGeometri} from './dukkan_plan.js';
import {counter82} from './counter82.js';
const L=await(await fetch(new URL('./qr84-layout.json',import.meta.url))).json();
const DX=L.delta_world_m[0],END=L.origin_m[0],R=L.front_radius_mm/1000,CX=END-R,CZ=3.002-R,OLD_CX=2.619;
// Approved production layout; the PLC remains the only product/door owner.
export function yerlesim84(T,I){
 if(I.yerlesim84)return I.yerlesim84;
 let installed=false;const state=I.yerlesim84={ready:false,reviewOnly:false,shift_mm:-116,panel_mm:40,radius_mm:200};
 const apply=()=>{
  if(installed||!I.yuklendi||!I.qrYeni80||!I.staffCabinet29)return;
  installed=true;const S=I.sahne,scene=S.scene,g=scene.getObjectByName('IKIZ_DUKKAN');
  const qr=I.qrYeni80.root,wash=scene.getObjectByName('DUKKAN__YIKAMA_ISTASYONU'),staff=scene.getObjectByName('PERSONEL_BOY_DOLABI29');
  if(!wash||!staff)throw Error('Yerleşim82: yıkama veya personel dolabı bulunamadı');
  for(const o of[qr,wash,staff]){o.position.x+=DX;o.updateMatrix();o.updateMatrixWorld(true);}
  I.qrYeni80.origin_m=qr.position.toArray();
  const counter=counter82(T,I);state.counter=counter;
  const wall=g.getObjectByName('DUKKAN__TEK_PARCA_DUVAR'),old=wall.geometry,geo=new T.BufferGeometry();
  geo.setAttribute('position',new T.Float32BufferAttribute(SHELL82.positions,3));geo.setAttribute('normal',new T.Float32BufferAttribute(SHELL82.normals,3));geo.setIndex(SHELL82.indices);
  geo.addGroup(0,SHELL82.whiteIndexCount,0);geo.addGroup(SHELL82.whiteIndexCount,SHELL82.indices.length-SHELL82.whiteIndexCount,1);geo.computeBoundingBox();geo.computeBoundingSphere();wall.geometry=geo;old.dispose();
  const edges=g.getObjectByName('DUKKAN__DUVAR_KOSE_CIZGILERI');if(edges){edges.geometry.dispose();edges.geometry=new T.EdgesGeometry(geo,35);}
  // Move the existing wash floor penetrations and close the surplus floor
  // strip outside the real building wall. No new cables or fixtures are added.
  const bores=[[2.720,2.215,.014],[3.020,2.290,.014],[2.930,2.286,.029],[3.100,2.290,.010]].map(([x,z,r])=>[x+DX-r,x+DX+r,-.012,.001,z-r,z+r]);
  const anchors=[[2.0455+DX,2.0575+DX,-.012,.001,2.244,2.256],[3.1265+DX,3.1385+DX,-.012,.001,2.244,2.256]];
  const floor=g.getObjectByName('DUKKAN__TEK_PARCA_ZEMIN');floor.geometry.dispose();floor.geometry=duvarBirlesikGeometri(T,[[.436,5.460,-.011,0,-1.220,2.983]],[...anchors,...bores]);
  function glazing(ro,ri){
   const s=new T.Shape();s.moveTo(CX,CZ+ro);s.absarc(CX,CZ,ro,Math.PI/2,0,true);s.lineTo(CX+ro,2.348);s.lineTo(CX+ri,2.348);s.lineTo(CX+ri,CZ);s.absarc(CX,CZ,ri,0,Math.PI/2,false);s.closePath();
   const q=new T.ExtrudeGeometry(s,{depth:1.020,bevelEnabled:false,curveSegments:96}),p=q.attributes.position;
   for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getY(i),y=p.getZ(i);p.setXYZ(i,x,1.015+y,z);}
   const ix=[];for(let i=0;i<p.count;i+=3)ix.push(i,i+2,i+1);q.setIndex(ix);q.computeVertexNormals();return q;
  }
  for(const[n,a,b]of[['KAVISLI_CAM_DIS_5MM',R-.045,R-.050],['KAVISLI_CAM_ARA_076',R-.050,R-.05076],['KAVISLI_CAM_IC_5MM',R-.05076,R-.05576]]){
   const o=g.getObjectByName('DUKKAN__CEPHE58_'+n);if(o){o.geometry.dispose();o.geometry=glazing(a,b);o.updateMatrix();}
  }
  // Replace the curved top glazing profile with the same path and tangent
  // return. Its 15mm height, material and actual 100mm section are preserved.
  const profile=g.getObjectByName('DUKKAN__CEPHE58_CAM_UST_PROFIL');
  if(profile){const pg=glazing(R,R-.100),p=pg.attributes.position;for(let i=0;i<p.count;i++)p.setY(i,2.035+(p.getY(i)-1.015)*(.015/1.020));pg.computeVertexNormals();profile.geometry.dispose();profile.geometry=pg;}
  const endFrame=g.getObjectByName('DUKKAN__CEPHE58_CAM_DONUS_BITIS');if(endFrame){endFrame.geometry.dispose();endFrame.geometry=new T.BoxGeometry(.100,1.020,.012);endFrame.position.set(END-.050,1.525,2.354);endFrame.updateMatrix();}
  // Reapply the existing real orange finish to new geometry, including the
  // vertex colour channel used by the shop's original gradient material.
  scene.updateMatrixWorld(true);
  for(const o of[wall,profile,endFrame].filter(Boolean))I.dukkanTemiz29?.gradient30?.apply(o,Array.isArray(o.material));
  // Widen the straight sash to the new tangent. Hardware translates rigidly;
  // only full-width glass and horizontal seals/rails gain length.
  const bar=g.getObjectByName('DUKKAN__BAR_CAM29');
  const full=/LAMINE|KANAT_YATAY_PROFIL|KANATLAR_ARASI|ALT_SIZDIRMAZLIK|UST_SIZDIRMAZLIK/;
  const mapX=x=>1.782+(x-1.782)*(CX-1.782)/(OLD_CX-1.782);
  bar?.updateMatrixWorld(true);
  bar?.traverse(o=>{if(!o.isMesh||/TABURE/.test(o.name))return;
   const gg=o.geometry.clone(),p=gg.attributes.position,b=new T.Box3().setFromObject(o),center=b.getCenter(new T.Vector3()),shift=mapX(center.x)-center.x;
   const v=new T.Vector3(),inv=new T.Matrix4().copy(o.matrixWorld).invert();
   for(let i=0;i<p.count;i++){v.fromBufferAttribute(p,i).applyMatrix4(o.matrixWorld);v.x=full.test(o.name)?mapX(v.x):v.x+shift;v.applyMatrix4(inv);p.setXYZ(i,v.x,v.y,v.z);}
   gg.computeBoundingBox();gg.computeBoundingSphere();o.geometry=gg;
   if(o.userData.bar29Dynamic&&Number.isFinite(o.userData.cableX)){o.userData.cableX+=shift;}
  });
  for(const[index,x]of[[1,2.200],[2,2.900]]){const stool=bar?.getObjectByName('DUKKAN__BAR29_TABURE_'+index);if(stool){stool.position.set(x,0,3.547);stool.rotation.y=Math.PI;stool.updateMatrix();}}
  // A display, its depth mask and its CSS3D surface move together.
  scene.traverse(o=>{if(/^IKIZ_EKRAN_DERINLIK_tv$|^DT_QR_EKRAN/.test(o.name)){o.position.x+=DX;o.updateMatrix();}});
  const tv=I.ekranlar3b?.tv;if(tv){tv.o.position.x+=DX;if(Array.isArray(tv.konum))tv.konum[0]+=DX;}
  for(const s of[I.cssScene,I.sahne.cssScene,I.ekran?.scene,I.ekranlar?.scene])s?.traverse?.(o=>{if(o.isCSS3DObject&&o.element?.querySelector?.('iframe')?.src.includes('qr-ekran')){o.position.x+=DX;o.updateMatrix();}});
  scene.updateMatrixWorld(true);const bounds=o=>{const b=new T.Box3().setFromObject(o);return{min:b.min.toArray(),max:b.max.toArray()};};
  Object.assign(state,{ready:true,qr:bounds(qr),wash:bounds(wash),staff:bounds(staff),wall:bounds(wall),productionRobotRetargeted:true,layoutRevision:84});
  // Rebuild the existing cached daylight shadow map for the relocated objects.
  const sun=scene.children.find(o=>o.isDirectionalLight&&o.shadow);if(sun)sun.shadow.needsUpdate=true;
  Object.assign(I.dukkan.plan,{sagIc:5.360,qrSol:END,ayirici:[END-.040,END],qrLayoutRevision:84});
  document.documentElement.dataset.yerlesim84='ready';document.getElementById('layout83Pending')?.remove();
 };
 I.kancalar.push(apply);apply();return state;
}
