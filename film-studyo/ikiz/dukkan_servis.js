import {profilSec,kabloYolu} from './kablolama.js';
import {kioskDonanimKur} from './kiosk_donanim.js';
import {personelDonanimKur} from './personel_donanim.js';
import {duvarBirlesikGeometri,PLAN} from './dukkan_plan.js';
// Shop furniture/services only. Does not write plant commands or change robot nodes.
export const SERVIS={tablet:{model:'Samsung Galaxy Tab Active5',mm:[213.8,126.8,10.1]},pos:{model:'Ingenico Move/5000 global card terminal',mm:[169,78,57],turkiye_okc_onayi:false},strip:{model:'Custom flush desk socket module',envelope_mm:[235,65,78],sockets:3,usb_ports:2,flush:true,hidden_service_bay:true},underfloor_y:-.075,underfloor_data_y:-.023,source_geometry:'dimensioned representative models; not downloaded OEM CAD',outlets:['Kasa masası: tablet + POS + yedek','Personel kuru alan: temizlik/servis','QR: kapalı PIN teknik bölümü','Kiosk: duvar içi servis bağlantısı','Bulaşık: ayrı 400 V sabit hat'],robot_untouched:true};
export function dukkanServisKur(T,scene,g,liste,MAT,D,IKIZ={}){
 const root=new T.Group();root.name='DUKKAN_SERVIS';g.add(root);const routes=[],white=new T.MeshStandardMaterial({color:0xe8ebed,roughness:.55}),black=MAT.siyah,blue=new T.MeshStandardMaterial({color:0x3f78a1,roughness:.7});
 function box(n,b,m=MAT.kasa,parent=root){const o=new T.Mesh(new T.BoxGeometry(b[1]-b[0],b[3]-b[2],b[5]-b[4]),m);o.name='DUKKAN_SERVIS__'+n;o.position.set((b[0]+b[1])/2,(b[2]+b[3])/2,(b[4]+b[5])/2);parent.add(o);return o;}
 function tube(n,pts,r=.003,m=black){const electrical=/KABLO|BINA_|BESLEME|230V|400V|VERI|USB/.test(n),spec=profilSec(n,r),shape=kabloYolu(T,pts,electrical?spec.min_bend_mm/1000:.012),path=shape.path;
  const o=new T.Mesh(new T.TubeGeometry(path,Math.max(24,pts.length*12),spec.diameter_mm/2000,8,false),m);o.name='DUKKAN_SERVIS__'+n;o.userData.electrical=electrical;o.userData.cableProfile=electrical?spec:null;root.add(o);routes.push({name:n,points:pts,radius:spec.diameter_mm/2000,length_m:path.getLength(),profile:spec,bends:electrical?shape.bends:[]});return o;
 }
 function rounded(w,h,r){const s=new T.Shape(),x=-w/2,y=-h/2;s.moveTo(x+r,y);s.lineTo(x+w-r,y);s.quadraticCurveTo(x+w,y,x+w,y+r);s.lineTo(x+w,y+h-r);s.quadraticCurveTo(x+w,y+h,x+w-r,y+h);s.lineTo(x+r,y+h);s.quadraticCurveTo(x,y+h,x,y+h-r);s.lineTo(x,y+r);s.quadraticCurveTo(x,y,x+r,y);return s;}
 function cylinder(n,x,y,z,r,h,m=black,axis='y',parent=root){const o=new T.Mesh(new T.CylinderGeometry(r,r,h,24),m);if(axis==='x')o.rotation.z=Math.PI/2;if(axis==='z')o.rotation.x=Math.PI/2;o.position.set(x,y,z);o.name='DUKKAN_SERVIS__'+n;parent.add(o);return o;}
 const remove=/^DUKKAN__(PERSONEL_KOLTUK_|DAR_TEZGAH_AYAK_|DAR_TEZGAH_ARKA_KUSAK$|POS_STAND$|OKC_POS_MOVE5000F$)/;
 for(const o of [...g.children])if(remove.test(o.name)){g.remove(o);o.traverse(p=>p.geometry?.dispose());}
 for(let i=liste.length-1;i>=0;i--)if(remove.test('DUKKAN__'+liste[i].ad))liste.splice(i,1);
 // Cable grommets and a stepped recess for a flush-mounted desktop socket.
 const top=g.getObjectByName('DUKKAN__DAR_TEZGAH_TABLA');if(top){top.geometry.dispose();top.geometry=duvarBirlesikGeometri(T,[PLAN.tezgah],[[2.924,2.956,.739,.771,2.794,2.826],[2.964,2.996,.739,.771,2.444,2.476],[2.856,3.079,.739,.771,2.787,2.853],[2.850,3.085,.769,.771,2.781,2.859]]);top.position.set(0,0,0);}
 for(const [x,z] of [[2.94,2.81],[2.98,2.46]]){const ring=new T.Mesh(new T.TorusGeometry(.016,.002,8,32),black);ring.rotation.x=Math.PI/2;ring.position.set(x,.771,z);ring.name='DUKKAN_SERVIS__TEZGAH_KABLO_GECISI';root.add(ring);}
 // Retain the existing tablet and CSS screen pose exactly; detail its case/stand.
 const tablet=g.getObjectByName('DUKKAN__POS_TABLET');
 box('TABLET_STAND_TABAN',[2.880,3.000,.770,.778,2.552,2.692],MAT.paslanmaz);box('TABLET_STAND_DIKME',[2.940,2.960,.778,.915,2.608,2.636],MAT.paslanmaz);
 tube('TABLET_STAND_EGIK_BAGLANTI',[[2.950,.910,2.622],[2.955,.950,2.622]],.008,MAT.paslanmaz);
 if(tablet){
  const glass=new T.Mesh(new T.PlaneGeometry(.1723,.1077),new T.MeshStandardMaterial({color:0x24465c,roughness:.18,metalness:.18}));glass.position.z=.0052;glass.name='DUKKAN_SERVIS__TABLET_EKRAN_CAMI';tablet.add(glass);
  const button=new T.Mesh(new T.BoxGeometry(.016,.003,.006),MAT.panel);button.name='DUKKAN_SERVIS__TABLET_SES_TUSU';button.position.set(-.03,.064,0);tablet.add(button);
  const camera=new T.Mesh(new T.CylinderGeometry(.004,.004,.001,20),black);camera.rotation.x=Math.PI/2;camera.position.set(-.085,.040,-.0055);camera.name='DUKKAN_SERVIS__TABLET_ARKA_KAMERA';tablet.add(camera);
  const plug=new T.Mesh(new T.BoxGeometry(.006,.007,.004),black);plug.position.set(.109,.0,0);plug.name='DUKKAN_SERVIS__TABLET_USB_C_FIS';tablet.add(plug);g.updateMatrixWorld(true);const port=tablet.localToWorld(new T.Vector3(.112,0,0));
  tube('TABLET_USB_KABLO',[port.toArray(),[port.x,port.y,2.810],[2.940,.736,2.810],[2.957,.665,2.825]],.0024,black);
 }
 // Actual 169 x 78 x 57 mm global Move/5000 envelope, screen/printer/keypad.
 const pay=new T.Group();pay.name='DUKKAN_SERVIS__POS_MOVE5000';root.add(pay);const geo=new T.ExtrudeGeometry(rounded(.169,.078,.012),{depth:.032,bevelEnabled:false,curveSegments:12});geo.rotateX(-Math.PI/2);const body=new T.Mesh(geo,black);body.position.set(2.860,.770,2.460);body.name='DUKKAN_SERVIS__POS_GOVDE';pay.add(body);
 box('POS_YAZICI',[2.910,2.9445,.802,.827,2.421,2.499],black,pay);box('POS_FIS_YARIGI',[2.912,2.915,.8268,.8271,2.431,2.489],MAT.ekran,pay);
 box('POS_DOKUNMATIK_EKRAN',[2.837,2.899,.802,.803,2.434,2.486],new T.MeshStandardMaterial({color:0x245b76,emissive:0x102939}),pay);
 for(let r=0;r<4;r++)for(let c=0;c<3;c++)box('POS_TUS_'+r+'_'+c,[2.783+r*.011,2.791+r*.011,.802,.805,2.438+c*.016,2.450+c*.016],r===3?(c===2?new T.MeshStandardMaterial({color:0x4f9a69}):c===0?new T.MeshStandardMaterial({color:0xa54646}):MAT.panel):MAT.panel,pay);
 box('POS_SARJ_FISI',[2.944,2.952,.786,.796,2.454,2.466],black,pay);
 tube('POS_DC_KABLO',[[2.952,.791,2.460],[2.980,.791,2.460],[2.980,.736,2.825],[2.890,.736,2.825],[2.890,.665,2.825]],.0025);
 // Flush worktop face; adapters and wiring are enclosed in the rear service bay.
 box('MASA_GOMME_PRIZ_GOVDE',[2.856,3.079,.705,.769,2.787,2.853],black);
 const face=new T.Mesh(duvarBirlesikGeometri(T,[[2.850,3.085,.767,.770,2.781,2.859]],
  [[2.865,2.909,.766,.771,2.798,2.842],[2.926,2.970,.766,.771,2.798,2.842],[2.987,3.031,.766,.771,2.798,2.842]]),MAT.paslanmaz);
 face.name='DUKKAN_SERVIS__MASA_GOMME_PRIZ_YUZ';root.add(face);
 for(let i=0;i<3;i++){
  const x=2.887+i*.061;
  cylinder('MASA_PRIZ_YUVA_'+i,x,.7675,2.820,.021,.004,white);
  for(const sign of [-1,1])cylinder('MASA_PRIZ_PIN_DELIGI_'+i+'_'+sign,x+sign*.0065,.7698,2.820+sign*.0065,.0025,.0004,black);
 }
 for(const z of [2.805,2.835])box('MASA_GOMME_USB_PORT',[3.050,3.066,.7692,.7698,z-.003,z+.003],black);
 for(const [n,x]of [['TABLET',2.957],['POS',2.890]]){
  box(n+'_ADAPTOR',[x-.015,x+.015,.665,.705,2.800,2.840],black);
  // Ready plug-in charger body mates directly with the underside socket; no internal wire drawn.
 }
 // A dry, accessible wall outlet behind the desk feeds only small electronics.
 function socket(n,x,y,z,axis='x'){const b=axis==='x'?[x,x+.010,y-.043,y+.043,z-.043,z+.043]:[x-.043,x+.043,y-.043,y+.043,z,z+.010];const o=box(n,b,white);cylinder(n+'_YUVA',axis==='x'?x-.001:x,y,axis==='x'?z:z+.011,.020,.003,black,axis);return o;}
 socket('KASA_DUVAR_PRIZI',3.157,.380,2.73,'x');
 tube('MASA_GOMME_PRIZ_GIZLI_BESLEME',[[3.079,.720,2.820],[3.130,.720,2.820],[3.130,.380,2.820],[3.157,.380,2.730]],.004);
 socket('PERSONEL_SERVIS_PRIZI',.536,.350,2.45,'x');
 socket('QR_IC_SERVIS_PRIZI',5.285,1.600,1.885,'z');
 box('KIOSK_IC_SERVIS_KUTUSU',[5.395,5.435,.330,.420,2.430,2.520],MAT.kasa);
 // Existing floor channel: y=-100..0 mm, divider at -39 mm.
 // Feed through x=5.35..5.55 trunk and z=1.745..2.045 cross-channel.
 const branches=[[.440,5.550,1.820,1.980],[.440,.550,1.940,2.500],[2.690,2.830,1.900,2.883],[2.500,2.590,1.960,2.340],[5.250,5.550,-1.018,2.520],[5.230,5.550,1.680,1.980],[4.170,4.280,1.660,1.980],[2.800,3.180,1.100,1.960],[4.500,4.830,.320,1.070],[4.830,5.140,.630,.730],[2.800,5.550,1.620,1.730],[3.700,5.550,1.000,1.150],[3.740,3.850,1.050,1.720],[3.900,4.100,1.620,1.980],[3.280,5.340,1.940,2.070],[4.650,4.850,1.700,1.980],[4.650,5.550,1.740,1.840]];
 const outer=branches.map(([a,b,c,d])=>[a,b,-.100,-.011,c,d]),holes=[];
 for(const [a,b,c,d]of branches)for(const [lo,hi]of [[-.0985,-.039],[-.0375,-.014]]){
  const xLong=b-a>d-c;holes.push([a+(xLong?-.002:.0015),b+(xLong?.002:-.0015),lo,hi,c+(xLong?.0015:-.002),d+(xLong?-.0015:.002)]);
 }
 const risers=[[2.950,1.185],[2.755,2.730],[2.770,2.820],[.490,2.450],[5.2925,1.770],[5.420,1.855],[5.440,1.855],[4.218,1.700],[2.900,1.178],[2.950,1.192],[2.545,2.295],[3.800,1.700],[3.960,1.934],[4.020,1.934],[5.050,2.016],[5.285,2.016]],apertures=risers.map(([x,z])=>[x-.012,x+.012,-.100,.003,z-.012,z+.012]);
 const tray=new T.Mesh(duvarBirlesikGeometri(T,outer,[...holes,...apertures]),MAT.paslanmaz);tray.name='DUKKAN_SERVIS__KAPAKLI_ZEMIN_KANALI';tray.userData.electrical=true;tray.userData.electricalPart='frame';tray.userData.assemblyOwner='POWER';root.add(tray);
 const floor=g.getObjectByName('DUKKAN__TEK_PARCA_ZEMIN');if(floor){floor.geometry.dispose();floor.geometry=duvarBirlesikGeometri(T,[[PLAN.solIc-.10,PLAN.sagIc+.10,-.011,0,PLAN.arkaIc-.10,PLAN.cepheDis]],[...apertures,...(floor.userData.wash60AnchorBores||[])]);floor.position.set(0,0,0);}
 const power=-.075,data=-.023,feed=[5.420,power,1.420],cross=[5.420,power,1.870];
 const pBranch=(x,z)=>[feed,cross,[x,power,1.870],[x,power,z]];
 tube('BINA_KASA_230V',[...pBranch(2.770,2.730),[2.770,.380,2.730],[2.707,.380,2.730]],.0055);
 tube('BINA_PERSONEL_SERVIS_230V',[...pBranch(.475,2.450),[.475,.350,2.450],[.536,.350,2.450]],.0055);
 tube('BINA_QR_230V',[feed,[5.420,power,1.730],[5.2925,power,1.800],[5.2925,.043,1.800]],.004);
 tube('BINA_KIOSK_230V',[feed,[5.420,power,2.475],[5.411,.375,2.475]],.004);
 tube('BINA_BULASIK_400V',[...pBranch(2.545,2.295),[2.545,-.020,2.295]],.006);
 tube('BINA_VERI_KASA',[[5.420,data,1.420],[5.420,data,1.870],[2.802,data,1.870],[2.802,data,2.820],[2.802,.480,2.820],[2.707,.480,2.820]],.003,blue);
 socket('KASA_RJ45_YUVA',3.157,.480,2.820,'x');
 tube('BINA_VERI_KIOSK',[[5.440,data,1.420],[5.440,data,2.475],[5.445,.375,2.475]],.003,blue);
 tube('BINA_ZEMIN_KUTUSU_GUC',[[4.800,power,.680],[5.420,power,.680],[5.420,power,1.420]],.004);
 tube('BINA_ZEMIN_KUTUSU_VERI',[[4.800,data,.690],[5.440,data,.690],[5.440,data,1.420]],.003,blue);
 const kioskDonanim=kioskDonanimKur(T,g,root,MAT,D);IKIZ.kioskDonanim=kioskDonanim;
 const personel=personelDonanimKur(T,root,box,cylinder,tube,MAT);
 IKIZ.panjur=null;
 const state={...SERVIS,personel,routes,floor_channels:branches,floor_apertures:apertures,power_y:power,data_y:data,retired_chair:true,wall_height_m:PLAN.yukseklik,panjur:null};IKIZ.dukkanServis=state;
 // Route only the fixed building-side lead; moving chain and robot poses stay intact.
 function fixedLeadRoute(){const lead=scene.getObjectByName('DT_ZINCIR_UR_KONTROL_KABLOSU');if(!lead||lead.userData.dukkanKanalinda)return;
  lead.userData.dukkanKanalinda=true;const pts=[[3.108,.058,1.185],[2.950,.058,1.185],[2.950,-.023,1.185],[2.950,-.023,1.870],[5.2925,-.023,1.870],[5.2925,-.023,1.800],[5.2925,.080,1.800]];
  lead.geometry.dispose();lead.geometry=new T.BufferGeometry().setFromPoints(pts.map(p=>new T.Vector3(...p)));state.sabit_robot_besleme=pts;
 }
 return{root,routes,panjur:null,update:dt=>{fixedLeadRoute();IKIZ.kartonDepo?.update();},bilgi:state};
}
