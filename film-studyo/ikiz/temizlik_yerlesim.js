import {finishMounts63} from './wash_hardware63.js';
import {bentLand61,WASH_STANDARD61} from './wash_standard61.js';
import {cabinetLeaf57} from './wash_doors57.js';
import {kartonDepoKur} from './karton_depo.js';
import {GLTFLoader} from './vendor/GLTFLoader.js';
import {SPARE_UNITS} from './spare_units.js';
import {washStationKur,WASH} from './wash_station.js?v=9f45e7edd996';
export const TEMIZLIK={dolap:[2.010,3.151,1.480,2.380,1.668,2.318],kirli_araba:null,parcalar:SPARE_UNITS.map(p=>[p.ad,p.olcu_m.map(v=>v*1000)]),tum_parcalar_makinede_yikanir:false};
export function temizlikKur(T,g,liste,MAT,IKIZ={}){
 const station=washStationKur(T,g,liste,MAT,IKIZ),root=station.root,steel=MAT.paslanmaz,box=station.box;
 const [x0,x1,y0,y1,z0,z1]=TEMIZLIK.dolap;
 const F=station.fabrication;
 // 1.5 mm folded pans land on welded angles, not on a thin unsupported vertical sheet.
 const shelves=[[2.0315,3.1295,y0],[2.7195,3.1295,1.928],[2.2595,2.718,1.805],[2.0315,2.258,1.780]];
 for(const [a,b,y]of shelves){
  const pan=F.pan('UST_DOLAP_RAF',a,b,y,z0+.015,z1-.0215,.0015,.022);pan.userData.support62=y===y0?'two continuous RHS seats':'downturned pan edges continuously welded to partition / side RHS face';F.joints.push({part:pan.name,bounds:[a,b,y],connection:pan.userData.support62});
 }
 // Actual side shelf rails butt-weld to the front/rear chassis posts.
 for(const [x,y]of [[2.0215,1.780],[3.1395,1.928]])F.rhs('RAF_YAN_TASIYICI_20_20_2',[x,y-.010,1.6955],[x,y-.010,2.2965],.020,.020,.002);
 // Continuous folded partitions stand on the shelf; no separate feet or loose front strips.
 for(const x of [2.258,2.718])bentLand61(T,F,root,{name:'UST_BOLME_TEK_BUKUM_61',outer:x,hand:1,bottom:y0+.0015,top:y1-.0015,seat:1.674,rear:z1-.0215,land:13.5});
 for(const z of [1.7015,2.2765])F.plate('ALT_RAF_RHS_OTURMA_PEDI',[2.0315,3.1295,1.4785,1.480,z,z+.020]);
 F.plate('UST_DOLAP_BUHAR_AYIRICI_TAVAN',[x0+.0215,x1-.0215,y1-.0015,y1,z0+.0275,z1-.0215]);
 for(const d of [{name:'UST_SOL_KAPAK',a:x0+.0025,b:2.5795,hand:1},{name:'UST_SAG_KAPAK',a:2.5815,b:x1-.0025,hand:-1}])F.doors.push(cabinetLeaf57(T,F,root,{...d,bottom:y0+.003,top:2.412,front:z0}));
 F.standard61=WASH_STANDARD61;
 const karton=kartonDepoKur(T,root,box,MAT,IKIZ);finishMounts63(T,F,root);
 // Click the physical leaf; no extra menu. Robot cleaning interlock remains unchanged.
 let down=null;const canvas=IKIZ.sahne?.renderer?.domElement||IKIZ.sahne?.render?.domElement;
 const ray=new T.Raycaster(),uv=new T.Vector2();
 function click(e){if(!canvas||!IKIZ.kamera||down&&Math.hypot(e.clientX-down.x,e.clientY-down.y)>6)return;const r=canvas.getBoundingClientRect();uv.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);ray.setFromCamera(uv,IKIZ.kamera);const hits=ray.intersectObjects(IKIZ.sahne.scene.children,true).filter(h=>{for(let o=h.object;o;o=o.parent)if(!o.visible)return false;return true;});if(hits.length){let o=hits[0].object;while(o&&!F.doors.some(d=>d.leaf===o))o=o.parent;const d=F.doors.find(d=>d.leaf===o);if(d)F.setDoor(d,d.target?0:1);}}
 canvas?.addEventListener('pointerdown',e=>down={x:e.clientX,y:e.clientY});canvas?.addEventListener('click',click);F.clickBound=!!canvas;
 F.setDoor=(d,v)=>{if(typeof d==='string')d=F.doors.find(o=>o.name===d);if(!d)return;if(d===F.doors[0]){if(v&&!F.serviceAccess()){F.bakimIste();return;}IKIZ.washKomut?.('kimyasal',!!v);return;}d.target=v?1:0;};
 // P77 (YÖNETİCİ 22 Eki): click without permission = maintenance request (cover id 16). MAIN accepts only when idle,
 // parks the robot and enters cleaning; the leaf opens on the PLC permission, and closing it ends cleaning by itself.
 F.bakimIste=async()=>{const say=IKIZ.parcaDurumYaz||(()=>{});if(F.bakimBekliyor)return;F.bakimBekliyor=true;
  try{say('Bakım isteği · yıkama kimyasal kapağı');await IKIZ.bakim.komut({tip:'inceleme.kapak',goz:16,ac:true},true);
   const until=Date.now()+90000;while(!F.serviceAccess()&&Date.now()<until)await new Promise(r=>setTimeout(r,250));
   if(!F.serviceAccess())throw Error('Bakım izni gelmedi (robot park bekleniyor)');
   IKIZ.washKomut?.('kimyasal',true);say('Kimyasal kapak açılıyor · bakım, kapanınca biter');
  }catch(e){say(e.message);}finally{F.bakimBekliyor=false;}};
 F.focus=()=>{IKIZ.eClean19?.inspection?.restore();IKIZ.katmanlar?.only('WASH');IKIZ.kamera.position.set(1.05,2.05,-2.25);IKIZ.sahne.kontrol.target.set(2.58,1.42,1.90);IKIZ.sahne.kontrol.update();};
 // Lower service access shares the appliance's MAIN cleaning/robot-park condition.
 F.serviceAccess=()=>IKIZ.son?.wash60?.servis_izin===true;
 F.update=dt=>{if(!F.directFocused&&new URLSearchParams(location.search).get('station')==='WASH'&&IKIZ.yuklendi&&!document.getElementById('yukle')){F.focus();F.directFocused=true;}const selected=IKIZ.katmanlar?.master?.isolate==='WASH',label=document.getElementById('eFrame12Size');if(selected&&!F.wasSelected){F.focus();if(label){F.previousLabel=label.textContent;label.textContent='Yıkama · gövde 1141 × 813 × 2770 mm · Kapaklara tıkla';}}else if(!selected&&F.wasSelected&&label&&F.previousLabel)label.textContent=F.previousLabel;F.wasSelected=selected;for(const d of F.doors){if(d===F.doors[0]){const p=IKIZ.son?.wash60?.konum?.kimyasal;if(Number.isFinite(p)){d.value=p;d.target=IKIZ.son.wash60.hedef?.kimyasal||0;d.pose(p);}continue;}const target=d.target;d.value+=Math.sign(target-d.value)*Math.min(Math.abs(target-d.value),Math.max(0,Math.min(.1,dt||0))/.8);d.pose(d.value);}};
 IKIZ.kancalar?.push(F.update);
 const spares=new T.Group();spares.name='DUKKAN__TEMIZ_YEDEKLER';root.add(spares);
 for(const p of SPARE_UNITS){const [x,y,z]=p.konum,[w,h,depth]=p.olcu_m;
  if(p.code!=='KUSBASI')box('YEDEK_ALTLIK_'+p.code,[x,x+w,y-.0015,y,z,z+depth],new T.MeshStandardMaterial({color:0x658b8c,roughness:1}));
  if(['KASAR','SUCUK'].includes(p.code))continue;
  const railY=y+h-.008;
  for(const side of [x-.004,x+w+.001]){box('YEDEK_DI KME'.replace(' ',''),[side,side+.003,Math.max(y-.0015,1.4815),railY,z+depth+.001,z+depth+.011]);box('YEDEK_YAN_OTURMA_KILAVUZU',[side,side+.003,railY-.006,railY,z+.012,z+depth+.010]);}
 }
 // Closed clean-tools compartment above the left hopper; no liquid chemicals here.
 const tools=new T.Group();tools.name='YIKAMA__TEMIZ_ARAC_GEREC';root.add(tools);
 // Stock rests on the real shelf topY1781.5mm, not the former1783mm datum.
 tools.position.y=1.7815-1.783;
 const fabric=new T.MeshStandardMaterial({color:0x4b8294,roughness:1}),plastic=new T.MeshStandardMaterial({color:0xe2e5df});
 for(let i=0;i<4;i++)box('MIKROFIBER_BEZ_'+i,[2.034,2.230,1.783+i*.010,1.793+i*.010,1.700,1.850],fabric,tools);
 for(let i=0;i<2;i++)box('ELDIVEN_KUTUSU_100_'+i,[2.034,2.230,1.823+i*.070,1.893+i*.070,1.700,1.800],plastic,tools);
 station.cylinder('KAGIT_HAVLU_RULO',2.100,1.963,1.780,.050,.230,plastic,tools);
 for(let i=0;i<2;i++){station.cylinder('TEMIZLIK_FIRCASI_SAP',2.080+i*.070,1.783,2.000,.009,.200,fabric,tools);box('TEMIZLIK_FIRCASI_BAS',[2.060+i*.070,2.100+i*.070,1.983,2.043,1.980,2.020],plastic,tools);}
 box('KIMYASAL_ELDIVEN_CIFT',[2.034,2.230,1.783,1.828,2.100,2.230],fabric,tools);box('KORUYUCU_GOZLUK',[2.040,2.220,1.828,1.873,2.100,2.180],plastic,tools);
 const sparesReady=new Promise((resolve,reject)=>new GLTFLoader().load('./spare-topping-206c.glb?v=3376458687dc',gl=>{for(const p of SPARE_UNITS){const unit=gl.scene.getObjectByName('YEDEK_'+p.code);if(!unit){reject(new Error('Missing spare '+p.code));return;}spares.add(unit);unit.position.fromArray(p.konum);unit.userData={...unit.userData,temiz_yedek:true,uretim_stokuna_dahil:false,source:'TOPPING206c'};}spares.updateMatrixWorld(true);resolve(spares);},undefined,reject));sparesReady.catch(e=>console.error('Yedek parçalar yüklenemedi',e));const ready=Promise.all([sparesReady,station.ready,karton.ready]);
 const slots=SPARE_UNITS.map(p=>[p.ad,[p.konum[0],p.konum[0]+p.olcu_m[0],p.konum[1],p.konum[1]+p.olcu_m[1],p.konum[2],p.konum[2]+p.olcu_m[2]]]);
 return{ready,spares,station,yikama:station.yikama,dirty:station.dirty,bilgi:{...TEMIZLIK,station:WASH,karton_depo:karton,asagi_indirme_mm:0,batarya_icin_one_alma_mm:0,duvara_asili:false,kirli_tepsi:[2.030,2.630,.890,.910,1.550,2.030],temiz_yedek_yuvalari:slots,tedarikci_yikama_onayi:false,raf_tasima_hesabi_onayli:false}};
}
