import {GLTFLoader} from './vendor/GLTFLoader.js';

// Downloaded OEM geometry, layout only. No PLC I/O, safety parameters or real
// emergency controls are changed by this module.
export function shopSafety30(T,scene,g,IKIZ){
 if(IKIZ.shopSafety30)return IKIZ.shopSafety30;
 const root=new T.Group();root.name='SHOP_SAFETY30';root.userData={assemblyOwner:'SHOP',visualOnly:true};g.add(root);
 const info={revision:'restaurant-robot30',installed:[],errors:[],visualOnly:true,existingPreserved:['sink','wash-station','HMI','staff-furniture','emergency-stop','main-isolator','machine-guards'],pending:['district-and-activity-classification','fuel-and-exhaust-project','first-aid-approved-contents','AZM40-OEM-visual-replacement-cleanup-hides-old-lock','guard-escape-release-CAD-human-check','LOTO-kit-CAD-human-check','statutory-no-smoking-notice','food-business-official-QR','WC-location','light-level-and-emergency-power-validation','safety-function-validation']};
 const fixtures=[],loader=new GLTFLoader(),pending=[];
 const protect=o=>{o.userData={...o.userData,assemblyOwner:'SHOP',visualOnly:true};if(o.isMesh){o.castShadow=true;o.receiveShadow=true;for(const m of Array.isArray(o.material)?o.material:[o.material])m.userData={...m.userData,preserveReviewMaterial:true,gercekRenk:true,storefront60Finish:true};}};
 async function model(id,name,pos,ry=0){
  const {scene:asset}=await loader.loadAsync(new URL('./shop-assets30/'+id+'.glb?v=light30d',import.meta.url).href);
  const pose=new T.Group();pose.name=name;pose.userData={assemblyOwner:'SHOP',wallVisibility:true,visualOnly:true};pose.add(asset);root.add(pose);pose.position.set(...pos);pose.rotation.y=ry;asset.traverse(protect);pose.updateMatrixWorld(true);fixtures.push(pose);
  const bounds=new T.Box3().setFromObject(pose);info.installed.push({name,asset:id,source:'Original manufacturer 3D',bounds:[bounds.min.toArray(),bounds.max.toArray()]});return pose;
 }
 const maps=new Map();async function texture(file){if(!maps.has(file))maps.set(file,new T.TextureLoader().loadAsync(new URL('./shop-assets30/'+file,import.meta.url).href).then(t=>{t.colorSpace=T.SRGBColorSpace;return t;}));return maps.get(file);}
 async function decal(file,name,w,h,pos,ry=0,parent=root){
  const map=await texture(file),mat=new T.MeshStandardMaterial({map,transparent:true,alphaTest:.05,roughness:.65,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1});
  mat.userData={preserveReviewMaterial:true,gercekRenk:true,storefront60Finish:true};const mesh=new T.Mesh(new T.PlaneGeometry(w,h),mat);mesh.name=name;mesh.position.set(...pos);mesh.rotation.y=ry;mesh.userData={assemblyOwner:'SHOP',visualOnly:true,wallVisibility:true,downloadedArtwork:file};parent.add(mesh);info.installed.push({name,asset:file});return mesh;
 }
 async function exit(name,pos){
  const pose=await model('etap-k232',name,pos,Math.PI);
  // Down-arrow directly above the actual door. It never points into machinery.
  const foil=await decal('etap-exit-down.png',name+'_FOLYO',.320,.160,[0,0,.09905],0,pose);foil.material.emissive=new T.Color(0xffffff);foil.material.emissiveMap=foil.material.map;foil.material.emissiveIntensity=.5;
  // Turkish supplementary caption on the wall, separate from the unchanged
  // manufacturer's luminaire and pictogram geometry.
  if(document.createElement){const c=document.createElement('canvas');c.width=640;c.height=90;const x=c.getContext('2d');x.fillStyle='#008b63';x.fillRect(0,0,640,90);x.fillStyle='#ffffff';x.font='bold 68px Arial';x.textAlign='center';x.textBaseline='middle';x.fillText('ÇIKIŞ',320,48);const map=new T.CanvasTexture(c);map.colorSpace=T.SRGBColorSpace;const m=new T.MeshStandardMaterial({map,roughness:.7,emissive:0xffffff,emissiveMap:map,emissiveIntensity:.22});m.userData={preserveReviewMaterial:true,gercekRenk:true,storefront60Finish:true};const label=new T.Mesh(new T.PlaneGeometry(.320,.045),m);label.name=name+'_TR_CIKIS';label.position.set(pos[0],pos[1]-.120,pos[2]-.001);label.rotation.y=Math.PI;label.userData={assemblyOwner:'SHOP',wallVisibility:true,visualOnly:true};root.add(label);}
 }
 pending.push(exit('SHOP30_DIS_CIKIS_ISARETI',[1.136,2.340,2.880]));
 pending.push(exit('SHOP30_ROBOT_ODASI_CIKIS_ISARETI',[1.136,2.285,1.499]));
 pending.push(model('etap-k262','SHOP30_PERSONEL_AKULU_AYDINLATMA',[1.300,2.798,2.300]));
 // User-marked grey projecting fixture beside the machine was removed.
 info.removedAtUserRequest=['SHOP30_ROBOT_AKULU_AYDINLATMA'];
 async function firstAid(){
  const pose=await model('crew-110','SHOP30_CREW110_ILK_YARDIM',[0,0,0]);
  const asset=pose.children[0],b=new T.Box3().setFromObject(asset),c=b.getCenter(new T.Vector3());asset.position.set(-c.x,-b.min.y,-b.min.z);pose.rotation.y=Math.PI/2;pose.position.set(.538,1.550,1.990);pose.updateMatrixWorld(true);
  const bb=new T.Box3().setFromObject(pose);info.installed.find(x=>x.name===pose.name).bounds=[bb.min.toArray(),bb.max.toArray()];
  // Downloaded cabinet is explicitly unfilled; no medicines or invented kit
  // contents are implied. Current manufacturer configurator: 360 x 360 x 170.
  pose.userData.contents='unfilled OEM cabinet; occupational first-aid contents pending';
  await decal('first-aid-sign.svg','SHOP30_ILK_YARDIM_ISARETI',.160,.160,[.539,2.040,1.990],Math.PI/2);
  if(IKIZ.shopEquipment30?.info){const prior=IKIZ.shopEquipment30.info;prior.selectedProducts.firstAid='ROSCONI CREW 110 · manufacturer 3D installed';prior.pending=prior.pending.filter(x=>x!=='manufacturer-first-aid-model');document.documentElement.dataset.shopEquipment30=JSON.stringify(prior);}
 }
 pending.push(firstAid());
 // Staff side of the fixed header: visible above the access door, clear of the
 // tall personal cabinet and of the moving leaf. Warn before entering the cell.
 pending.push(decal('W018.svg','SHOP30_OTOMATIK_HAREKET_UYARI',.150,.131,[1.035,2.205,1.601]));
 pending.push(decal('W017.svg','SHOP30_SICAK_URETIM_ALANI_UYARI',.150,.131,[1.235,2.205,1.601]));
 // Electrical warning is attached to the real cabinet door, not a floating part.
 let electricalAttached=false,electricalInFlight=false,scan=0;
 function attachElectrical(){
  if(electricalAttached||electricalInFlight)return;
  const panel=scene.getObjectByName('ROBOT25_DUVAR_PANO_KAPI')??scene.getObjectByName('ELK_DUVAR__KUTU_ACILIR_KAPAK');if(!panel)return;
  electricalInFlight=true;panel.updateWorldMatrix(true,true);const b=new T.Box3().setFromObject(panel),s=b.getSize(new T.Vector3()),c=b.getCenter(new T.Vector3()),axis=s.x<s.z?'x':'z';
  const back=scene.getObjectByName('ROBOT25_DUVAR_PANO_ARKA'),bc=back?new T.Box3().setFromObject(back).getCenter(new T.Vector3()):c.clone();const sign=back?Math.sign(c[axis]-bc[axis])||1:1,world=c.clone();world.y=Math.min(b.max.y-.09,b.min.y+s.y*.72);world[axis]=(sign>0?b.max[axis]:b.min[axis])+sign*.001;
  const local=panel.worldToLocal(world),q=new T.Quaternion();panel.getWorldQuaternion(q);const orientation=new T.Quaternion().setFromAxisAngle(new T.Vector3(0,1,0),axis==='x'?sign*Math.PI/2:sign>0?0:Math.PI);orientation.premultiply(q.invert());
  decal('W012.svg','SHOP30_ELEKTRIK_UYARI',.10,.087,local.toArray(),0,panel).then(mesh=>{mesh.quaternion.copy(orientation);electricalAttached=true;info.pending=info.pending.filter(x=>x!=='electrical-panel-warning-anchor');document.documentElement.dataset.shopSafety30=JSON.stringify(info);}).catch(e=>{info.errors.push({id:'electrical-warning',error:String(e)});electricalInFlight=false;});
 }
 info.pending.push('electrical-panel-warning-anchor');attachElectrical();
 // Original wall cabinet arrives after shop construction. Follow its actual
 // door once available, rather than leaving a sign suspended at guessed XYZ.
 IKIZ.kancalar?.push(dt=>{if(!electricalAttached){scan+=Math.max(0,dt||0);if(scan>1){scan=0;attachElectrical();}}});

 // OEM guard hardware. Fixed body and emergency escape lever are inside the
 // robot room. The actuator belongs to the moving door, not to the room wall.
 async function guardHardware(){
  const leaf=scene.getObjectByName('DUKKAN__HUCRE_KAPI_MENTESE_KANAT');
  if(!leaf)throw new Error('Actual robot door leaf missing; no floating actuator created');
  const {scene:assembly}=await loader.loadAsync(new URL('./shop-assets30/schmersal-guard-assembly.glb?v=light30d',import.meta.url).href);
  assembly.name='SHOP30_ROBOT_KAPI_GUVENLIK_MONTAJI';root.add(assembly);assembly.traverse(protect);
  const body=assembly.getObjectByName('AZM40Z_FIXED'),actuator=assembly.getObjectByName('B1_MOVING'),escape=assembly.getObjectByName('ESCAPE_FIXED'),loto=assembly.getObjectByName('SZ40_PARKED');
  if(!body||!actuator||!escape||!loto)throw new Error('Incomplete OEM guard assembly');
  const hardware=[body,actuator,escape,loto],names=['SHOP30_ROBOT_KAPI_AZM40Z','SHOP30_ROBOT_KAPI_B1','SHOP30_ROBOT_IC_KACIS_KOLU','SHOP30_SZ40_SERVIS_KILIDI_PARK'];
  hardware.forEach((part,i)=>{part.name=names[i];part.userData={...part.userData,assemblyOwner:'SHOP',visualOnly:true,wallVisibility:true,manufacturer:'Schmersal',mountingReviewRequired:true};info.installed.push({name:names[i],asset:'schmersal-guard-assembly',source:'Original manufacturer full STEP assemblies, combined locally',movingWithDoor:i===1});});
  // Preserve the existing door's local motion, including if it already opened
  // while the single combined assembly was downloading.
  leaf.add(actuator);actuator.position.set(.830,1.1965,-.022);actuator.rotation.set(0,Math.PI/2,0);
  info.guardHardware={fixed:body.name,moving:actuator.name,insideEscape:escape.name,serviceLockout:loto.name,mode:'visual layout; no safety I/O or commissioning changes',mountingReview:'Frame support, fasteners, interlock alignment and safety circuit validation remain engineering tasks'};
  info.pending=info.pending.filter(x=>!['AZM40-OEM-visual-replacement-cleanup-hides-old-lock','guard-escape-release-CAD-human-check','LOTO-kit-CAD-human-check'].includes(x));
  info.pending.push('guard-hardware-mounting-and-fastener-validation');
  return hardware;
 }
 const guardReady=guardHardware();pending.push(guardReady);
 const ready=Promise.allSettled(pending).then(rs=>{rs.forEach((r,i)=>{if(r.status==='rejected')info.errors.push({index:i,error:String(r.reason)});});document.documentElement.dataset.shopSafety30=JSON.stringify(info);return info;});
 return IKIZ.shopSafety30={root,ready,info,fixtures,guardReady};
}
