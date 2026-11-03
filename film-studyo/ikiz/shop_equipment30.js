import {GLTFLoader} from './vendor/GLTFLoader.js';
import {pianoBlack29} from './piano_black29.js';

// Downloaded, licensed layout models. No manufacturer approval or fire-system
// acceptance is implied by their presence in this visual twin.
export function shopEquipment30(T,scene,g,IKIZ){
 if(IKIZ.shopEquipment30)return IKIZ.shopEquipment30;
 const root=new T.Group();root.name='SHOP_EQUIPMENT30';root.userData={assemblyOwner:'SHOP',visualOnly:true,assetCredits:'CEA Estintori PD6ES manufacturer BIM; original geometry and label texture. Source: ./shop-assets30/cea-pd6es-source.json'};g.add(root);
 const info={downloadedAssets:9,downloadedSigns:2,installed:[],signs:[],existingEquipment:['wash-station','sink','soap-and-towel','HMI','staff-counter','personal-cabinet'],doNotDuplicateExisting:true,pending:['WC-location','ventilation-and-flue','fire-risk-product-selection','exit-sign-direction-and-power','official-food-business-QR'],errors:[],duplicateHMI:false,phoneCharging:'dry counter',certifiedInstallation:false};
 const loader=new GLTFLoader(),env=pianoBlack29(T,scene,IKIZ).env;
 const fixtures=[];
 const status=()=>{document.documentElement.dataset.shopEquipment30=JSON.stringify(info);};
 async function mount(id,name,{bottom,wallX,centerZ}){
  const gltf=await loader.loadAsync(new URL('./shop-assets30/'+id+'.glb?v=light30d',import.meta.url).href);
  const asset=gltf.scene;asset.name=name;
  asset.traverse(o=>{o.userData={...o.userData,assemblyOwner:'SHOP',ist:'PERSONEL',visualOnly:true,downloadedAsset:id};if(o.isMesh){o.castShadow=true;o.receiveShadow=true;for(const m of Array.isArray(o.material)?o.material:[o.material]){m.userData={...m.userData,preserveReviewMaterial:true,gercekRenk:true,storefront60Finish:true};m.envMap=env;m.envMapIntensity=.8;m.roughness=.33;m.metalness=.12;if(m.color&&m.color.r<.08&&m.color.g<.08&&m.color.b<.08){m.roughness=.78;m.metalness=0;}}}});
  // Preserve catalogue dimensions; put the back of the downloaded assembly on
  // the real inner left wall. Rotation turns its +Z working face toward +X.
  const original=new T.Box3().setFromObject(asset),c=original.getCenter(new T.Vector3());
  const pose=new T.Group();pose.name=name+'_WALL_MOUNT';pose.userData={assemblyOwner:'SHOP',wallVisibility:true};root.add(pose);pose.add(asset);
  asset.position.set(-c.x,-original.min.y,-original.min.z);pose.rotation.y=Math.PI/2;pose.position.set(wallX,bottom,centerZ);pose.updateMatrixWorld(true);
  const b=new T.Box3().setFromObject(pose);fixtures.push(pose);info.installed.push({id,bounds:[...b.min.toArray(),...b.max.toArray()],source:'CEA Estintori PD6ES manufacturer BIM / original OBJ + label',scale:1});status();return pose;
 }
 // The inner leaf ends at z=2.362 when fully open. The extinguisher begins
 // beyond z=2.53. The shallow first-aid box stays to the left of its hinge.
 async function sign(id,y,z){
  const map=await new T.TextureLoader().loadAsync(new URL('./shop-assets30/'+id+'.svg',import.meta.url).href);map.colorSpace=T.SRGBColorSpace;
  const mat=new T.MeshStandardMaterial({map,roughness:.65});mat.userData={preserveReviewMaterial:true,gercekRenk:true,storefront60Finish:true};
  const mesh=new T.Mesh(new T.PlaneGeometry(.20,.20),mat);mesh.name='SHOP30_'+id;mesh.rotation.y=Math.PI/2;mesh.position.set(.539,y,z);mesh.userData={assemblyOwner:'SHOP',wallVisibility:true,downloadedPictogram:true};root.add(mesh);info.signs.push(id);return mesh;
 }
 // Rejected by the user: generic low-poly first-aid / extinguisher meshes.
 // Preserve their intended locations in the source record, but do not display
 // those models or their paired signs until detailed replacements are reviewed.
 info.qualityStatus='manufacturer-fire-model-reviewed';
 info.selectedProducts={extinguisher:'CEA PD6ES',firstAid:'Cederroth 51011026 · product selected, 3D file pending'};
 info.pending.unshift('manufacturer-first-aid-model');
 const ready=Promise.allSettled([mount('cea-pd6es','SHOP30_CEA_PD6ES',{wallX:.538,bottom:.350,centerZ:2.660}),sign('fire-sign',1.120,2.660)]).then(results=>{results.forEach((r,i)=>{if(r.status==='rejected')info.errors.push({id:['cea-pd6es','fire-sign'][i],error:String(r.reason)});});status();return results;});
 const black=new T.MeshStandardMaterial({color:0x242a2e,roughness:.45,metalness:.1}),screen=new T.MeshStandardMaterial({color:0x17282f,roughness:.22,emissive:0x122a32,emissiveIntensity:.3});
 for(const m of[black,screen])m.userData={preserveReviewMaterial:true,gercekRenk:true,storefront60Finish:true};
 function box(n,b,m=black){const o=new T.Mesh(new T.BoxGeometry(b[1]-b[0],b[3]-b[2],b[5]-b[4]),m);o.position.set((b[0]+b[1])/2,(b[2]+b[3])/2,(b[4]+b[5])/2);o.name='SHOP30_'+n;o.userData={assemblyOwner:'PERSONEL',visualOnly:true};root.add(o);return o;}
 // Dry counter, clear of tablet clamps, POS, receipt tray and worktop edges.
 box('TEZGAH_TELEFON',[2.938,3.011,.771,.779,2.645,2.794]);
 box('TELEFON_CAM',[2.942,3.007,.779,.7795,2.651,2.789],screen);
 box('TEZGAH_USB_C_PANEL',[2.958,2.988,.7705,.773,2.808,2.832]);
 const p=[[2.975,.776,2.795],[2.995,.776,2.803],[2.995,.776,2.822],[2.974,.776,2.821]].map(p=>new T.Vector3(...p));
 const lead=new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(p),24,.0018,8,false),black);lead.name='SHOP30_TEZGAH_USB_C_KABLO';root.add(lead);
 // This cable represents a low-voltage charging lead, not mains wiring.
 // Explicit inspection controls exist only on an opt-in review URL. They never
 // alter the saved/default camera or send commands to equipment.
 if(new URLSearchParams(location.search).has('shopAudit')){
  const panel=document.createElement('div');panel.id='shop-equipment-review30';Object.assign(panel.style,{position:'fixed',left:'16px',bottom:'70px',zIndex:10000,display:'flex',gap:'8px',padding:'8px',background:'#18222e',borderRadius:'8px'});
  for(const [label,pos,target]of[['İlk yardım ve yangın',[2.03,1.62,2.55],[.538,1.18,2.28]],['Tezgâh ve tablet',[2.16,1.30,2.53],[2.97,.88,2.61]]]){
   const b=document.createElement('button');b.textContent=label;b.onclick=()=>{const s=IKIZ.sahne;s.kamera.position.set(...pos);s.kontrol.target.set(...target);s.kontrol.update();};panel.append(b);
  }document.body.append(panel);
 }
 const api={root,ready,fixtures,info};IKIZ.shopEquipment30=api;status();return api;
}
