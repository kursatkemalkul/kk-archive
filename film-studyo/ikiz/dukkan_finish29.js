import {duvarBirlesikGeometri} from './dukkan_plan.js';
// Shop finishes and visual lighting. No machine commands and no camera changes.
export function dukkanFinish29(T,scene,g,MAT,IKIZ,doors){
 if(IKIZ.dukkanFinish29)return IKIZ.dukkanFinish29;
 const root=new T.Group();root.name='DUKKAN__FINISH29';g.add(root);
 const changed=[],removed=[],lights=[],emitters=[];
 // Retire fittings on the former large counter; the compact counter has AC/USB below.
 for(const name of ['DUKKAN__PRIZ_TEZGAH_1','DUKKAN__PRIZ_TEZGAH_2','DUKKAN__SUPURGELIK_CEPHE_P','DUKKAN__SUPURGELIK_CEPHE_M']){
  const o=g.getObjectByName(name);if(o){o.removeFromParent();o.geometry?.dispose();removed.push(name);}
 }
 // Join the staff-room base trim, leaving the cell and exterior door thresholds open.
 const skirtingMaterial=new T.MeshStandardMaterial({color:0xaeb7b7,metalness:.82,roughness:.32});
 const skirting=new T.Mesh(duvarBirlesikGeometri(T,[[.536,.548,0,.080,1.520,2.883],[.536,.686,0,.080,1.520,1.532]]),skirtingMaterial);skirting.name='DUKKAN__FINISH29_PERSONEL_SUPURGELIK';root.add(skirting);
 // Finishes are assigned to materials, without textures or extra floor layers.
 for(const [key,roughness,metalness,color]of [['paslanmaz',.32,.82,null],['zemin_ic',.88,0,0xb9b9b3],['kaldirim',.94,0,0x999c9b]]){
  const m=MAT[key];if(!m)continue;m.roughness=roughness;m.metalness=metalness;if(color!=null)m.color.setHex(color);changed.push(key);
 }
 const steelMaterials=new Set();g.traverse(o=>{if(!o.isMesh||o.userData.manufacturingFinish30)return;
  if((o.name.startsWith('PERSONEL_TEZGAH71__')&&o.userData.materialSpecification==='AISI 304')||(/^YIKAMA__/.test(o.name)&&o.material===MAT.paslanmaz)){
   for(const m of Array.isArray(o.material)?o.material:[o.material])if(m&&m.color.getHex()!==0x25292c&&m.metalness>.3){m.roughness=.32;m.metalness=.82;steelMaterials.add(m);}
  }
 });
 const shell=g.getObjectByName('DUKKAN__TEK_PARCA_DUVAR');const orange=Array.isArray(shell?.material)?shell.material[1]:null;
 if(orange){orange.roughness=.90;orange.metalness=0;orange.userData.paintedConcrete=true;}
 // Use the existing recessed spot lenses. No new canopy, rim or bar trim.
 for(const [i,x]of [3.65,4.30,4.95].entries()){
  const lens=g.getObjectByName('DUKKAN__CEPHE58_SPOT_'+x);if(lens){lens.material=lens.material.clone();emitters.push(lens.material);}
  const light=new T.SpotLight(0xffdfb0,0,3.5,Math.PI/3,.65,2);light.name='DUKKAN__FINISH29_QR_ISIK_'+i;light.position.set(x,2.374,2.600);light.target.position.set(x,1.05,2.16);light.castShadow=false;root.add(light,light.target);lights.push(light);
 }
 // Bar and staff worktop receive warm light from the existing header plane.
 const barLight=new T.SpotLight(0xffdfb0,0,3.4,Math.PI/2.7,.75,2);barLight.name='DUKKAN__FINISH29_BAR_ISIK';barLight.position.set(2.59,2.032,2.99);barLight.target.position.set(2.85,.85,3.19);root.add(barLight,barLight.target);lights.push(barLight);
 // Light the existing sign surface; no new frame or projecting fixture.
 const sign=g.getObjectByName('DUKKAN__PIN_YAZISI');const signLight=new T.PointLight(0xffdfb0,0,1.5,2);signLight.name='DUKKAN__FINISH29_TABELA_ISIK';signLight.position.set(.78,2.60,3.20);root.add(signLight);lights.push(signLight);
 const daylight=scene.children.filter(o=>o.isHemisphereLight||o.isDirectionalLight).map(o=>({o,intensity:o.intensity}));
 const signMaterials=new Set();sign?.traverse(o=>{if(o.isMesh)for(const m of Array.isArray(o.material)?o.material:[o.material])signMaterials.add(m);});
 const originalBackground=scene.background?.clone?.();const state={evening:false};let button;
 function setEvening(on){state.evening=!!on;
  lights.forEach((l,i)=>{l.intensity=state.evening?(i<3?3.5:i===3?4:1):0;l.visible=state.evening;});
  for(const m of emitters)m.emissiveIntensity=state.evening?1.8:.45;
  for(const m of signMaterials){m.emissive.setHex(0xffdfb0);m.emissiveIntensity=state.evening?.3:0;}
  for(const {o,intensity}of daylight)o.intensity=intensity*(state.evening?(o.isDirectionalLight?.08:.40):1);
  if(scene.background?.isColor){if(state.evening)scene.background.setHex(0x101925);else if(originalBackground)scene.background.copy(originalBackground);}
  if(button){button.setAttribute('aria-pressed',String(state.evening));button.textContent=state.evening?'Gündüz görünümü':'Akşam ışığı';}
  document.documentElement.dataset.shopLighting=state.evening?'evening':'day';return state.evening;
 }
 const toggle=()=>setEvening(!state.evening);
 // Kemal 2 Kas (#2): akşam ışığı düğmesi ve cephe spotlarındaki gündüz/akşam tıklaması kaldırıldı; sahne hep gündüz.
 // Only the exterior staff door is manual. Machine-cell access gating is preserved.
 if(doors?.toggleDis)doors.outer.traverse(o=>{if(o.isMesh)o.userData.twinAction={kind:'elle',label:'Personel kapısı · aç / kapat',toggle:doors.toggleDis};});
 setEvening(false);
 const info={revision:'29eki-finish',cameraChanged:false,extraRoof:false,barTrim:false,lights:lights.length,shadowLights:0,skirtingHeight_mm:80,skirtingDepth_mm:12,doorThresholdsOpen:true,materials:changed,removed,steelMaterials:steelMaterials.size,staffDoorClickable:!!doors?.toggleDis,cellDoorGatingPreserved:true,lighting:'visual preview, not a lux calculation'};
 IKIZ.dukkanFinish29={root,state,info,setEvening,toggle};return IKIZ.dukkanFinish29;
}
