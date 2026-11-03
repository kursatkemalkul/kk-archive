import { sinyalPanelKur } from './kablo_sinyal_paneli.js?v=20261016-1';
import {disBaglantilarKur} from './kablo_dis_baglantilar.js';
import {duvarBirlesikGeometri,PLAN} from './dukkan_plan.js';
import {KABLO_KATALOG} from './kablo_katalog.js';
// Physical cable envelopes and explicit ports. Never infer an electrical joint
// from geometric proximity; never write to PLC, orders or robot trajectories.
export const PROFIL={
 URBUS:{diameter_mm:13.4,min_bend_mm:107.2,part:'Universal Robots high-flex extension 6/12 m',pins:['OEM proprietary harness — pin map pending'],source:'https://www.universal-robots.com/marketplace/products/01tP40000071NjRIAU/',status:'manufacturer_nominal'},
 AC230:{diameter_mm:12.5,min_bend_mm:50,part:'LAPP 1600118 H07RN-F 3G2.5',pins:['L','N','PE'],source:'https://www.lapp.com/de/de/h07rn-f/p/1600118',status:'manufacturer_max_envelope'},
 CAT6A:{diameter_mm:8.7,min_bend_mm:87,part:'LAPP 2170465 ETHERLINE Cat.6A',pins:['1','2','3','4','5','6','7','8','shield'],source:'https://www.lapp.ch/media/PIM_NEU/Datenbl%C3%A4tter/DB2170465EN.pdf',status:'manufacturer_nominal'},
 CAT7PATCH:{diameter_mm:6.4,min_bend_mm:25.6,part:'LAPP 2170934 ETHERLINE Cat.7 FLEX',pins:['1','2','3','4','5','6','7','8','shield'],source:'https://products.lappgroup.com/online-catalogue/data-communication-systems-for-ethernet-technology/industrial-ethernet-cat7/cables-for-flexible-applications/etherline-cat7-flex.html',status:'manufacturer_nominal'},
 DC24:{diameter_mm:6.7,min_bend_mm:27,part:'LAPP 1119303 CLASSIC 110 3G1.5',pins:['+24V','0V','PE'],status:'project_catalogue'},
 HIGHFLEX:{diameter_mm:6.5,min_bend_mm:32.5,part:'Purchased wrist-camera 24V + USB hybrid harness; supplier diameter and pinout pending',pins:['OEM hybrid 24V/USB pinout pending'],status:'provisional'},
 C13:{diameter_mm:8,min_bend_mm:32,part:'H05VV-F 3G1.5 C13/C14 cordset',pins:['L','N','PE'],status:'provisional_cordset'},
 USB:{diameter_mm:4.8,min_bend_mm:24,part:'USB shielded cable (final assembly selection pending)',pins:['VBUS','D-','D+','GND','shield'],status:'provisional'},
 HUB75:{diameter_mm:20,width_mm:20,thickness_mm:1,min_bend_mm:5,part:'HUB75 16-way ribbon — selected display supplier assembly pending',pins:Array.from({length:16},(_,i)=>String(i+1)),status:'provisional'},
 LED5:{diameter_mm:5.8,min_bend_mm:24,part:'2x1.5 mm2 LED power lead (final supplier selection pending)',pins:['+5V','0V'],status:'provisional'}
};
PROFIL.AC400={...PROFIL.AC230,diameter_mm:22.2,min_bend_mm:133.2,part:'LAPP 16001313 H07RN-F 5G6',pins:['L1','L2','L3','N','PE'],status:'manufacturer_max_envelope'};
PROFIL.ECAT={...PROFIL.CAT7PATCH,part:'Shielded industrial EtherCAT patch; Cat.7 FLEX envelope',pins:['ECAT_TX+','ECAT_TX-','ECAT_RX+','ECAT_RX-','shield'],status:'project_selection'};
PROFIL.SAFETY={diameter_mm:8.9,min_bend_mm:53.4,part:'Shielded 7G0.5 safety interface harness',pins:['1','2','3','4','5','6','PE','shield'],status:'project_catalogue_supplier_pinout_pending'};
PROFIL.CONTROL={...PROFIL.SAFETY,part:'Shielded 7G0.5 dry-contact interface harness',pins:['START','PROGRAM','READY','DONE','FAULT','COMMON','PE','shield']};
PROFIL.DC12={diameter_mm:4,min_bend_mm:20,part:'ER605 supplied 12 V adapter output lead; OD provisional',pins:['+12V','0V'],status:'voltage_manufacturer_verified_diameter_pending'};
PROFIL.CHARGE={diameter_mm:4.8,min_bend_mm:24,part:'Manufacturer supplied USB-C / POS charger cord',pins:['supplier charging interface'],status:'supplier_cordset_pending'};
PROFIL.CORD230={...PROFIL.C13,part:'H05VV-F 3G1.5 supplied Schuko cord',status:'supplier_cordset_pending'};
PROFIL.SHUTTER={diameter_mm:9,min_bend_mm:45,part:'Supplied shutter motor 4G1.5 lead',pins:['UP','DOWN','N','PE'],status:'supplier_motor_variant_pending'};
PROFIL.AC230_SWEEP={...PROFIL.AC230,min_bend_mm:134,part:PROFIL.AC230.part+'; reserved 134 mm routing bends'};
PROFIL.POE={...PROFIL.CAT7PATCH,part:'Industrial Ethernet patch carrying IEEE 802.3at PoE+',pins:['1','2','3','4','5','6','7','8','shield','802.3at negotiated power'],status:'interface_manufacturer_verified_cordset_pending'};
PROFIL.FCONTROL={diameter_mm:7.6,min_bend_mm:45.6,part:'UNITRONIC LiYCY 7x0.5 oven dry-contact interface',pins:['START','BELT','READY','FAULT','HEAT_ENABLE','LIMIT','COMMON','shield'],status:'project_catalogue_oven_pinout_pending'};
PROFIL.AUX230={...PROFIL.DC24,part:'CLASSIC 110 3G1.5 external equipment feed',pins:['L','N','PE']};
PROFIL.SHUTTER_FEED={...PROFIL.AC230,routing_bends_mm:[50,134,134,134,50,50,50]};
PROFIL.C13_SWEEP={...PROFIL.C13,min_bend_mm:50,part:'UPS supplied 3G1.5 mains cord: wall outlet to IEC C13'};
PROFIL.C14FREE={...PROFIL.C13,part:'3G1.5 cord: UPS C14 plug to NDR screw-terminal ferrules'};
PROFIL.ASAFETY={...PROFIL.SAFETY,diameter_mm:7.9,part:'4X0.5 shielded opener safety interface',pins:['SAFE1_A','SAFE1_B','SAFE2_A','SAFE2_B','shield']};
export function profilSec(name,fallbackRadius=.003){
 if(/BINA_VERI|BINA_ZEMIN_KUTUSU_VERI/.test(name))return PROFIL.CAT6A;
 if(/BINA_(KASA|PERSONEL_SERVIS|QR|KIOSK|PANJUR)_230V/.test(name))return PROFIL.AC230;
 return {diameter_mm:fallbackRadius*2000,min_bend_mm:fallbackRadius*8000,part:'Existing project cable: '+name,status:'project_geometry'};
}
export function kabloYolu(T,points,radius){
 const p=[];for(const a of points){const v=new T.Vector3(...a);if(!p.length||v.distanceTo(p.at(-1))>1e-7)p.push(v);}
 for(let i=p.length-2;i>0;i--){const a=p[i].clone().sub(p[i-1]).normalize(),b=p[i+1].clone().sub(p[i]).normalize();if(a.dot(b)>.999999)p.splice(i,1);}
 const path=new T.CurvePath(),bends=[];let from=p[0];
 class Arc extends T.Curve{constructor(c,u,v,r,angle){super();Object.assign(this,{c,u,v,r,angle});}getPoint(t,target=new T.Vector3()){return target.copy(this.c).addScaledVector(this.u,this.r*Math.cos(t*this.angle)).addScaledVector(this.v,this.r*Math.sin(t*this.angle));}}
 for(let i=1;i<p.length-1;i++){
  const incoming=p[i].clone().sub(p[i-1]),outgoing=p[i+1].clone().sub(p[i]),a=incoming.clone().normalize(),b=outgoing.clone().normalize();
  const angle=Math.acos(Math.max(-1,Math.min(1,a.dot(b))));if(angle<1e-6)continue;
  if(angle>Math.PI-.001)throw Error('Cable route reverses at '+i);
  const tangent=Math.tan(angle/2),available=Math.min(incoming.length()*(i===1?.95:.49),outgoing.length()*(i===p.length-2?.95:.49));
  const requested=Array.isArray(radius)?(radius[i]??radius[0]):radius,actual=Math.min(requested,available/tangent),trim=actual*tangent;
  const before=p[i].clone().addScaledVector(a,-trim),after=p[i].clone().addScaledVector(b,trim);
  const normal=b.clone().sub(a.clone().multiplyScalar(a.dot(b))).normalize();
  const center=before.clone().addScaledVector(normal,actual),u=before.clone().sub(center).normalize();
  path.add(new T.LineCurve3(from,before));path.add(new Arc(center,u,a,actual,angle));from=after;
  bends.push({corner:i,radius_mm:actual*1000,required_mm:requested*1000,ok:actual+1e-7>=requested});
 }
 if(from.distanceTo(p.at(-1))>1e-8)path.add(new T.LineCurve3(from,p.at(-1)));
 return {path,bends};
}
export function baglantiDogrula(ports,routes){
 const errors=[],seen=new Set();for(const r of routes){
  if(seen.has(r.id))errors.push({id:r.id,type:'duplicate_cable_id'});seen.add(r.id);
  const a=ports[r.from],b=ports[r.to];if(!a||!b){errors.push({id:r.id,type:'missing_port'});continue;}
  if(a.domain!==b.domain)errors.push({id:r.id,type:'voltage_or_protocol_mismatch'});
  for(const [port,end] of [[a,r.points[0]],[b,r.points.at(-1)]])if(Math.hypot(...end.map((v,i)=>v-port.position[i]))>.0005)errors.push({id:r.id,type:'endpoint_gap'});
  if(a.pins.join('|')!==b.pins.join('|'))errors.push({id:r.id,type:'pin_mismatch'});
  if(r.pins&&r.pins.join('|')!==a.pins.join('|'))errors.push({id:r.id,type:'cable_core_mismatch'});
 }
 return {geometric_errors:errors,bend_warnings:routes.flatMap(r=>r.bends.filter(b=>!b.ok).map(b=>({id:r.id,...b}))),physical_acceptance:false};
}
export function kablolamaKur(T,scene,IKIZ){
 if(IKIZ.kablolama)return IKIZ.kablolama;
 const root=new T.Group();root.name='ELK_BAGLANTI_AGI';scene.add(root);
 const ports={},routes=[],retired=[],models=[],material={AC230:new T.MeshStandardMaterial({color:0x262b30,roughness:.66}),CAT6A:new T.MeshStandardMaterial({color:0x53964a,roughness:.6}),CAT7PATCH:new T.MeshStandardMaterial({color:0x53964a,roughness:.6}),DC24:new T.MeshStandardMaterial({color:0x3b4654,roughness:.6}),C13:new T.MeshStandardMaterial({color:0x20252b,roughness:.6}),USB:new T.MeshStandardMaterial({color:0x222b35,roughness:.6}),LED5:new T.MeshStandardMaterial({color:0x333b43,roughness:.6})};
 const shell=new T.MeshStandardMaterial({color:0x919aa4,metalness:.7,roughness:.35}),black=material.AC230;
 function tag(o,owner,extra={}){o.userData.assemblyOwner=owner;o.userData.electrical=true;Object.assign(o.userData,extra);return o;}
 function box(n,p,d,mat=shell,owner='QR'){const o=new T.Mesh(new T.BoxGeometry(...d),mat);o.name='ELK_BAGLANTI_'+n;o.position.set(...p);tag(o,owner);root.add(o);return o;}
 function retire(n){const o=scene.getObjectByName(n);if(o){o.visible=false;o.userData.electricalRetired=true;retired.push(n);}}
 function dimensionedEnvelope(name,origin,size,owner,source){const o=scene.getObjectByName(name);if(!o||!o.isMesh)return;scene.updateMatrixWorld(true);const b=new T.Box3().setFromObject(o),old=b.getSize(new T.Vector3());const geo=o.geometry.clone();geo.applyMatrix4(o.matrixWorld);const pos=geo.attributes.position;for(let i=0;i<pos.count;i++){pos.setXYZ(i,origin[0]+(pos.getX(i)-b.min.x)/old.x*size[0],origin[1]+(pos.getY(i)-b.min.y)/old.y*size[1],origin[2]+(pos.getZ(i)-b.min.z)/old.z*size[2]);}geo.computeVertexNormals();geo.computeBoundingBox();geo.computeBoundingSphere();o.geometry=geo;root.add(o);o.position.set(0,0,0);o.rotation.set(0,0,0);o.scale.set(1,1,1);if(name==='ELK_ROBOT_UPS__cihaz')o.material=black;
  tag(o,owner,{dimensionedEnvelope:true,envelope_mm:size.map(n=>n*1000),dimensionSource:source,downloadedOEM:false});}
 dimensionedEnvelope('ELK_ROBOT_UPS__cihaz',[3.300,.060,1.820],[.439,.219,.171],'ROB','https://eshop.se.com/sa/apc-smart-ups-line-interactive-1500va-tower-230v-8x-iec-c13-outlets-smartslot-avr-lcd-smt1500i.html');
 dimensionedEnvelope('ELK_DUKKAN_PC__cihaz',[4.180,.100,1.840],[.076,.132,.133],'POWER','https://www.beckhoff.com/en-en/products/ipc/pcs/c60xx-ultra-compact-industrial-pcs/c6030-0080.html');
 function port(id,position,domain,owner='QR',sourceVerified=false){ports[id]={id,position,domain,owner,pins:PROFIL[domain].pins,sourceVerified};return id;}
 function cable(id,from,to,profile,via=[],owner='QR',replacement=[]){
  replacement.forEach(retire);const points=[ports[from].position,...via,ports[to].position];const spec=PROFIL[profile],shape=kabloYolu(T,points,spec.routing_bends_mm?spec.routing_bends_mm.map(v=>v/1000):spec.min_bend_mm/1000);
  const o=new T.Mesh((spec.width_mm?new T.ExtrudeGeometry(new T.Shape([new T.Vector2(-spec.width_mm/2000,-spec.thickness_mm/2000),new T.Vector2(spec.width_mm/2000,-spec.thickness_mm/2000),new T.Vector2(spec.width_mm/2000,spec.thickness_mm/2000),new T.Vector2(-spec.width_mm/2000,spec.thickness_mm/2000)]),{steps:Math.max(12,Math.ceil(shape.path.getLength()*40)),bevelEnabled:false,extrudePath:shape.path}):new T.TubeGeometry(shape.path,Math.max(24,Math.ceil(shape.path.getLength()*45)),spec.diameter_mm/2000,8,false)),(material[profile]||black));o.name='ELK_BAGLANTI_'+owner+'_KABLO_'+id;tag(o,owner,{cableId:id,from,to,cableProfile:profile});root.add(o);
  const r={id,from,to,points,profile,...spec,length_m:shape.path.getLength(),bends:shape.bends,mesh:o,port_verified:ports[from].sourceVerified&&ports[to].sourceVerified};routes.push(r);return r;
 }
 // Purchased assemblies: only external interfaces, no internal harness model.
 port('QR.BOTTOM_AC',[5.2925,.043,1.770],'AC230');
 port('QR.BOTTOM_DATA',[5.315,.043,1.810],'CAT7PATCH');
 for(const n of ['QR_PIN_ARKASI_IC_BESLEME_0','QR_PIN_ARKASI_IC_BESLEME_1','DT_QR_LCD_DAHILI_BESLEME','DT_QR_LCD_DAHILI_VERI'])retire(n);
 // UR fixed cable is continuous to the existing cabinet entry; its moving
 // chain object stays attached and is NOT replaced or driven by this module.
 port('ROB.FIXED_CHAIN_EXIT',[3.108,.022,1.178],'URBUS','ROB');port('ROB.CABINET_CONTROL',[4.592,.100,1.934],'URBUS','ROB');
 cable('UR-HIGHFLEX-FIXED','ROB.FIXED_CHAIN_EXIT','ROB.CABINET_CONTROL','URBUS',[[2.900,.022,1.178],[2.900,-.090,1.550],[2.900,-.090,1.890],[4.400,-.090,1.890]],'ROB',['QR_UR_KUTUSU_KABLO','DT_ZINCIR_UR_KONTROL_KABLOSU']);
 port('ROB.FIXED_CAMERA_EXIT',[3.108,.022,1.192],'HIGHFLEX','ROB');port('ROB.CAMERA_INTERFACE',[4.680,.100,1.934],'HIGHFLEX','ROB');
 cable('W122-FIXED-END','ROB.FIXED_CAMERA_EXIT','ROB.CAMERA_INTERFACE','HIGHFLEX',[[2.950,.022,1.192],[2.950,-.032,1.550],[2.950,-.032,1.960],[4.550,-.032,1.960]],'ROB');
 // UPS output and PC 24 V supply are distinct circuits. AC never lands on PC.
 port('UPS.C13_OUT',[3.739,.180,1.890],'AC230','ROB');port('UR.AC_IN',[4.355,.100,2.0345],'AC230','ROB');
 cable('W129-UR','UPS.C13_OUT','UR.AC_IN','C13',[[3.790,.180,1.890],[3.790,.065,1.890],[4.300,.065,1.890]],'ROB',['QR_UPS_UR_BESLEME_KABLOSU']);
 port('ROB.PSU24_PC_OUT',[4.192,.475,1.850],'DC24','ROB');port('PC.DC_IN',[4.218,.150,1.840],'DC24','POWER');
 cable('W126','ROB.PSU24_PC_OUT','PC.DC_IN','DC24',[[4.192,.550,1.850],[4.192,.550,1.740],[4.320,.550,1.740],[4.320,.080,1.740],[4.218,.080,1.740],[4.218,.150,1.740]],'POWER');
 port('ROUTER.LAN_PC',[5.486,1.525,1.238],'CAT7PATCH','POWER',true);port('PC.LAN',[4.218,.190,1.840],'CAT7PATCH','POWER');
 cable('W125','ROUTER.LAN_PC','PC.LAN','CAT7PATCH',[[5.416,1.525,1.238],[5.416,-.032,1.238],[5.416,-.032,1.700],[4.218,-.032,1.700],[4.218,.190,1.700]],'POWER');
 port('PANEL.ROBOT_AC',[5.514,.997,.790],'AC230','POWER');port('UPS.C14_IN',[3.739,.120,1.840],'AC230','ROB');
 cable('W130','PANEL.ROBOT_AC','UPS.C14_IN','C13_SWEEP',[[5.514,-.090,.790],[5.514,-.090,1.050],[3.800,-.090,1.050],[3.800,-.090,1.700],[3.800,.020,1.700],[3.800,.020,1.840]],'POWER');
 port('UPS.C13_PC',[3.739,.220,1.940],'AC230','ROB');port('ROB.PSU24_PC_AC',[4.192,.350,1.850],'AC230','ROB');
 cable('W129-PC','UPS.C13_PC','ROB.PSU24_PC_AC','C14FREE',[[3.790,.220,1.940],[3.790,.035,2.070],[4.120,.035,2.070],[4.120,.035,1.740],[4.120,.300,1.740],[4.192,.300,1.740],[4.192,.300,1.850]],'ROB');
 port('ROUTER.LAN_QR',[5.486,1.540,1.238],'CAT7PATCH','POWER',true);
 cable('QR-ETHERNET-IN','ROUTER.LAN_QR','QR.BOTTOM_DATA','CAT7PATCH',[[5.440,1.540,1.300],[5.440,-.032,1.300],[5.440,-.032,1.810],[5.315,-.032,1.810]],'POWER');
 // Supplier interfaces remain procurement requirements until model selection.
 retire('ELK_ROBOT_KAMERA__kablo_veri');
 const modelReady=[];
 for(const [id,p] of Object.entries(ports)){
  if(!/UPS\.|PC\.|UR\./.test(id)||/PSU24/.test(id))continue;
  const power=ports[id].domain==='DC24',size=id.startsWith('PC.LAN')?[.016,.014,.018]:power?[.014,.010,.012]:[.018,.025,.030];
  const o=box('SOKET_'+id.replaceAll('.','_'),p.position,size,power?new T.MeshStandardMaterial({color:0x54895f}):black,p.owner);o.userData.portId=id;o.userData.sourceVerified=p.sourceVerified;
 }

 async function oem(file,name,origin,owner,mat,permutation=[0,1,2]){
  try{const data=await fetch(new URL('./assets/elektrik/'+file,import.meta.url)).then(r=>{if(!r.ok)throw Error('CAD '+r.status);return r.json();});
   const positions=[];for(const v of data.vertices)for(let i=0;i<3;i++)positions.push(origin[i]+v[permutation[i]]-data.bbox_mm[permutation[i]]/1000);
   const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(positions,3));geo.setIndex((permutation.join(',')==='1,0,2'?data.triangles.map(t=>[t[0],t[2],t[1]]):data.triangles).flat());geo.computeVertexNormals();const o=new T.Mesh(geo,mat);o.name='ELK_BAGLANTI_'+name;tag(o,owner,{oemPart:data.part,oemSource:data.source_url||data.source_note,oemHash:data.oem_step_sha256});root.add(o);models.push({name,part:data.part,loaded:true});IKIZ.katmanlar?.scan?.();
  }catch(e){models.push({name,loaded:false,error:String(e)});}
 }
 if(typeof fetch!=='undefined'&&typeof document!=='undefined'){


  modelReady.push(oem('meanwell-ndr120.json','ROB_NDR120_PC_24V',[4.180,.350,1.785],'ROB',shell,[1,2,0]));

 }
 box('ROB_PC_PSU_MOUNT',[4.201,.417,1.777],[.070,.170,.002],shell,'ROB');box('ROB_PC_PSU_DIN',[4.201,.410,1.783],[.065,.035,.0075],shell,'ROB');
 const devices=[
  {id:'UPS',supply:'UPS.C14_IN',backupOutputs:['UPS.C13_OUT','UPS.C13_PC'],outputs:['UPS.C13_OUT','UPS.C13_PC'],kind:'purchased UPS'},
  {id:'PC_PSU',supply:'ROB.PSU24_PC_AC',outputs:['ROB.PSU24_PC_OUT'],kind:'purchased AC/24V supply'},
  {id:'PC',supply:'PC.DC_IN',input:'PC.LAN',outputs:[],kind:'purchased PC'},
  {id:'QR_LOCKER',supply:'QR.BOTTOM_AC',input:'QR.BOTTOM_DATA',outputs:[],kind:'purchased locker; supplier interfaces pending'},
  {id:'UR_CONTROL',supply:'UR.AC_IN',outputsRequireInput:false,outputs:['ROB.CABINET_CONTROL','ROB.CAMERA_INTERFACE'],kind:'purchased robot controller'},
 ];
 const boundaries=['BUILDING.SUPPLY','BUILDING.WAN'];
 const external=disBaglantilarKur(T,scene,IKIZ,{ports,routes,devices,port,cable,box,retire,PROFIL,kabloYolu});
 // Cut actual cable crossings through floor and tray lid, not just a decorative line.
 const floorPassages=[];
 for(const r of routes){const path=r.mesh.geometry.parameters.path||r.mesh.geometry.parameters.options?.extrudePath,n=Math.ceil(path.getLength()/.002),rad=r.diameter_mm/2000,near=[];
  for(let i=0;i<=n;i++){const q=path.getPointAt(i/n);if(q.y+rad>=-.016&&q.y-rad<=.006)near.push(q);}
  if(!near.length)continue;
  const margin=rad+.002;floorPassages.push({id:r.id,cut:[Math.min(...near.map(q=>q.x))-margin,Math.max(...near.map(q=>q.x))+margin,-.016,.004,Math.min(...near.map(q=>q.z))-margin,Math.max(...near.map(q=>q.z))+margin]});
 }
 const branches=IKIZ.dukkanServis?.floor_channels,tray=scene.getObjectByName('DUKKAN_SERVIS__KAPAKLI_ZEMIN_KANALI');
 if(branches&&tray){const outer=branches.map(([a,b,c,d])=>[a,b,-.100,-.011,c,d]),holes=[];
  for(const [a,b,c,d]of branches)for(const [lo,hi]of [[-.0985,-.039],[-.0375,-.014]]){const xLong=b-a>d-c;holes.push([a+(xLong?-.002:.0015),b+(xLong?.002:-.0015),lo,hi,c+(xLong?.0015:-.002),d+(xLong?-.0015:.002)]);}
  const cuts=[...(IKIZ.dukkanServis.floor_apertures||[]).map(c=>[c[0],c[1],-.016,.004,c[4],c[5]]),...floorPassages.map(p=>p.cut)];
  tray.geometry.dispose();tray.geometry=duvarBirlesikGeometri(T,outer,[...holes,...cuts]);
  const floor=scene.getObjectByName('DUKKAN__TEK_PARCA_ZEMIN');if(floor){floor.geometry.dispose();floor.geometry=duvarBirlesikGeometri(T,[[PLAN.solIc-.10,PLAN.sagIc+.10,-.011,0,PLAN.arkaIc-.10,PLAN.cepheDis]],[...cuts,...(floor.userData.wash60AnchorBores||[])]);floor.position.set(0,0,0);}
 }
 external.floorPassages=floorPassages;
 const purchasedAssemblies=['QR locker','QR delivery screen/keypad','upper menu/waiting display','order kiosk/payment/receipt assembly','staff POS','tablets','robot/controller','rail/drive','UPS','industrial PC','external power supplies','dough opener'];
 // This inventory is a scope boundary, not a claim that unselected ports are verified.
 IKIZ.hazirCihazKapsami={assemblies:purchasedAssemblies,internalWiring:false,externalInterfacesRequireSupplierMatch:true};
 const state={external,ports,routes,devices,boundaries,analyze:(broken=[])=>baglantiErisim(ports,routes,devices,boundaries,broken),retired,models,modelReady:Promise.all(modelReady),catalogue:KABLO_KATALOG,root,validate:()=>baglantiDogrula(ports,routes)};
 IKIZ.kablolama=state;return state;
}

export function kabloPanelKur(IKIZ,host){
 const a=IKIZ.kablolama;if(!a||!host||host.querySelector('[data-wiring-inspector]'))return;
 const details=document.createElement('details');details.dataset.wiringInspector='';details.innerHTML='<summary>Kablo bağlantıları / katalog</summary><p data-wire-summary></p><select aria-label="İncelenecek kablo"></select><button data-wire-focus>Kabloya yaklaş</button><pre data-wire-info style="font-size:11px;white-space:pre-wrap"></pre><p style="font-size:11px">Geometrik süreklilik, elektrik kabulü değildir. İşaretlenmemiş portlar ve eski birleşik kablolar üretim eşleştirmesi bekler.</p>';
 const list=details.querySelector('select');for(const r of a.routes){const opt=document.createElement('option');opt.value=r.id;opt.textContent=r.id+' · '+r.part;list.append(opt);}
 for(const c of a.catalogue.cables){const opt=document.createElement('option');opt.value='catalogue:'+c.no;opt.textContent=c.no+' · katalog / '+c.tip;list.append(opt);}
 const info=details.querySelector('[data-wire-info]');const update=()=>{if(list.value.startsWith('catalogue:')){const c=a.catalogue.cables.find(c=>c.no===list.value.slice(10));info.textContent=c.no+'\n'+c.nereden+' → '+c.nereye+'\nDış çap zarfı: '+c.outer_mm+' mm'+(c.outer_range_mm?' (üretici aralığı '+c.outer_range_mm.join('–')+' mm)':'')+'\n'+c.tip+'\n'+c.kaynak+'\nDurum: '+c.diameter_status+'\nBu katalog kaydı tek başına 3B uç/pin doğrulaması değildir.';return;}const r=a.routes.find(r=>r.id===list.value);if(!r)return;info.textContent=r.id+'\n'+r.from+' → '+r.to+'\nDış çap: '+r.diameter_mm+' mm\nUzunluk: '+r.length_m.toFixed(3)+' m\nAsgari dönüş: '+r.min_bend_mm+' mm\nKatalog: '+r.status+'\nPort yerleşimi: '+(r.port_verified?'kaynaklı':'tasarım; üretici pin/port teyidi gerekli')+'\n'+r.part;};list.onchange=update;details.querySelector('[data-wire-focus]').onclick=()=>{const r=a.routes.find(r=>r.id===list.value),view=IKIZ.sahne;if(!r||!view)return;if(IKIZ.katmanlar?.master?.isolate!=='ELECTRICAL')IKIZ.katmanlar?.only('ELECTRICAL');IKIZ.zamanBakisiniKoru?.();const lo=[0,1,2].map(i=>Math.min(...r.points.map(p=>p[i]))),hi=[0,1,2].map(i=>Math.max(...r.points.map(p=>p[i]))),center=lo.map((v,i)=>(v+hi[i])/2),distance=Math.max(.5,Math.max(...hi.map((v,i)=>v-lo[i]))*1.65);view.kontrol.target.set(...center);view.kamera.position.set(center[0]+distance*.25,center[1]+distance*.25,center[2]+distance);view.kontrol.update();};
 const v=a.validate();details.querySelector('[data-wire-summary]').textContent=a.catalogue.cables.length+' eski katalog kaydı (tamamı 3B doğrulanmış değildir) · '+a.routes.length+' uçlandırılmış güzergâh · '+v.geometric_errors.length+' bağlantı hatası · '+v.bend_warnings.length+' dönüş uyarısı · sınır bağlantıları içinde beslemesiz cihaz: '+a.analyze().unpowered_devices.length;host.append(details);update();
 const deviceList=document.createElement('details');deviceList.innerHTML='<summary>Cihazların dış bağlantıları</summary><p>Hazır cihazların iç tesisatı gösterilmez. Üretici soket/pin teyidi tamamlanmış sayılmaz.</p>';
 for(const d of a.external.deviceChecks){const row=document.createElement('details'),title=document.createElement('summary'),body=document.createElement('pre');title.textContent=d.id+' · '+d.external_cables.length+' dış kablo';body.style.cssText='font-size:11px;white-space:pre-wrap';body.textContent=d.kind+'\n'+d.external_cables.map(r=>r.id+' · '+r.type+' · Ø'+r.diameter_mm+' mm\n'+r.from+' → '+r.to).join('\n')+'\nÜretici pin/soket kabulü: bekliyor';row.append(title,body);deviceList.append(row);}host.append(deviceList);sinyalPanelKur(IKIZ,host,a);
}

// Connectivity proof for the declared boundaries only. Active conversions are
// explicit; a nearby line, rack, or enclosure never creates a graph edge.
export function baglantiErisim(ports,routes,devices,boundaries,broken=[]){
 const failed=new Set(broken),reachable=new Set(boundaries);if(!failed.has('UPS.BATTERY'))for(const d of devices)for(const p of d.backupOutputs||[])reachable.add(p);const edges=routes.filter(r=>{const a=ports[r.from],b=ports[r.to];return !failed.has(r.id)&&a&&b&&a.domain===b.domain&&a.pins.join('|')===b.pins.join('|')&&Math.hypot(...r.points[0].map((v,i)=>v-a.position[i]))<=.0005&&Math.hypot(...r.points.at(-1).map((v,i)=>v-b.position[i]))<=.0005;});let changed=true;
 while(changed){changed=false;const add=id=>{if(!reachable.has(id)){reachable.add(id);changed=true;}};
  for(const r of edges){if(reachable.has(r.from))add(r.to);if(reachable.has(r.to))add(r.from);if(ports[r.from].domain==='POE'){if(reachable.has(r.from+'#data'))add(r.to+'#data');if(reachable.has(r.to+'#data'))add(r.from+'#data');}}
  for(const d of devices)if(reachable.has(d.supply)&&(!d.input||d.outputsRequireInput===false||reachable.has(d.input)))for(const p of d.outputs)add(p);
 }
 return {boundaries,broken:[...failed],reachable:[...reachable],unpowered_devices:devices.filter(d=>!reachable.has(d.supply)).map(d=>d.id),missing_data:devices.filter(d=>d.input&&!reachable.has(d.input)).map(d=>d.id),physical_acceptance:false};
}
