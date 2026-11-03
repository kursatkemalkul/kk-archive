// T70 · TEMİZLİK DOLABI (FIRIN oturumu, 22 Eki · YÖNETİCİ T70, Kemal kemal_4 / kemal_5).
// Yıkama istasyonunun üst gövdesi (temizlik dolabı + karton deposu, x 2010–3151 · y 890–2770 · z 1668–2318) E/A kabuk
// sözlüğüyle baştan: RHS 30×20×2 iskelet, düz yan saclar, tam çatı, tam taban, iki bindirmeli kanat (ön düzlem tek, z 1668),
// EMKA 1031-U36/U37 gizli menteşe, EMKA 1011-21 conta, Southco A4 bas-aç. Dış ölçü / yer / iç işlev (yedekler, araç gereç,
// raflar, karton yığını) AYNEN. Ön = −z (dükkân tarafı); oturma düzlemi z 1674, kapak paneli 6 mm (1668–1674).
// Kemal'in bulguları → karşılığı:
//  · alttan bakınca kapak ile dolap tabanı arasında boşluk, sağda kısa biten profil → tam taban sacı (alt yüz y 1480) kapak alt
//    dönüşüyle aynı düzlemde, ön kenarı oturma düzleminde (z 1674); taban altında profil / sarkan raf dönüşü yok.
//  · üst köşeler sıfıra sıfır değil → çatı tek sac, yan sacların ÜSTÜNÜ örter (x 2010–3151); kapak üst dönüşü çatıyla aynı
//    düzlemde (y 2770); yan sac düz (bükümsüz, R3 'boru' görüntüsü yok), kapak yan dönüşüyle aynı düzlemde (x 2010 / 3151).
//  · dört kanat + sınırlayıcı halat + mıknatıslı tutucu → iki kanat (her biri 1290 yükseklik), 3 menteşe + 1 bas-aç.
import {solidTools42} from './wash_solid61.js';
import {retireGeometry90} from './retired_geometry90.js';
import {bentLand61} from './wash_standard61.js';

const X0=2.010,X1=3.151,XM=(X0+X1)/2,ZF=1.668,ZS=1.674,ZR=2.318,YC=.890,YB=1.480,YT=2.770,t=.0015;
const RB=[1.4815,1.5115],RM=[2.380,2.410],RT=[2.7385,2.7685],ML=[XM-.015,XM+.015];
// Dikmeler: 20 (x) × 30 (z); iç yüz x 2031,5 / 3129,5 eski raf / bölme / yedek düzenini aynen taşır.
const PX=[[X0+t,X0+t+.02],[X1-t-.02,X1-t]],PZ=[[ZS,ZS+.03],[ZR-t-.03,ZR-t]];
const OPEN=Math.PI/2;
export const T70={X0,X1,XM,ZF,ZS,ZR,YC,YB,YT,ring:{bottom:RB,carton:RM,top:RT},mullion:ML,open_deg:90};
// Eski üst gövde: 20×20 / 20×30 iskelet, bükümlü yan sac, bölmeler, alt raf tavası, buhar ayırıcı tavan, karton tavası / üst sacı,
// dört kanat ve donanımları (sınırlayıcı halat, MC-159 tutucu, saplamalar).
const RETIRE=/^YIKAMA__(UST_DIKME_20_20_2|RAF_ENINE_20_30_2|UST_DERINLIK_20_20_2|UST_ENINE_20_20_2|KARTON_RAFI_20_30_2|KARTON_RAFI_YAN_20_30_2|RAF_YAN_TASIYICI_20_20_2|UST_YAN_TEK_BUKUM_61|UST_BOLME_TEK_BUKUM_61|ALT_RAF_RHS_OTURMA_PEDI|UST_DOLAP_BUHAR_AYIRICI_TAVAN|KARTON_UST_SAC|KARTON_DEPO_RAF_R1_5_TEK_BUKUMLU|(UST_SOL|UST_SAG|KARTON_SOL|KARTON_SAG)_KAPAK)/;

export async function tMain70(T,IKIZ){
 if(IKIZ.tMain70)return IKIZ.tMain70;
 const s=IKIZ.sahne.scene;
 for(let i=0;i<600&&!(IKIZ.wash57&&IKIZ.kartonDepo&&s.getObjectByName('DUKKAN__YIKAMA_ISTASYONU'));i++)await new Promise(r=>setTimeout(r,100));
 const F=IKIZ.wash57,root=s.getObjectByName('DUKKAN__YIKAMA_ISTASYONU');if(!F||!root)throw Error('T70: yıkama istasyonu yok');
 const solid=solidTools42(T);
 const steel=F.steel,skin=F.skin,epdm=new T.MeshStandardMaterial({color:0x1d2226,roughness:.9}),zinc=new T.MeshStandardMaterial({color:0x9aa3aa,metalness:.8,roughness:.35}),dark=new T.MeshStandardMaterial({color:0x30363b,metalness:.3,roughness:.6});
 const parts=[],retired=[];
 const tag=(o,data={})=>{o.userData={...o.userData,wash57:true,tMain70:true,materialSpecification:'EN 1.4307 / AISI 304L',productionRelease:false,...data};parts.push(o);return o};
 function add(name,g,mat=steel,data={},parent=root){g.computeBoundingBox();g.computeBoundingSphere();const o=new T.Mesh(g,mat);o.name='YIKAMA__T70_'+name;parent.add(o);return tag(o,data)}
 const box=b=>{const g=new T.BoxGeometry(b[1]-b[0],b[3]-b[2],b[5]-b[4]);g.translate((b[0]+b[1])/2,(b[2]+b[3])/2,(b[4]+b[5])/2);return g};
 // (x, z) çokgeni y boyunca: lazer kesim sac (çentikli taban / karton tabanı) ve pahlı kanat kenarları.
 function prismY(pts,y0,y1){const sh=new T.Shape();sh.moveTo(pts[0][0],pts[0][1]);for(const p of pts.slice(1))sh.lineTo(p[0],p[1]);sh.closePath();const g=new T.ExtrudeGeometry(sh,{depth:y1-y0,bevelEnabled:false});g.rotateX(Math.PI/2);g.translate(0,y1,0);return g}
 // RHS 30×20×2 EN 10219 1.4301, R2,5 dış köşe; b = sınır, axis = boy ekseni.
 function rhs(name,b,axis,data={},cuts=[]){const ext={x:b[1]-b[0],y:b[3]-b[2],z:b[5]-b[4]},L=ext[axis],[u,v]=axis==='x'?['z','y']:axis==='y'?['x','z']:['x','y'],w=ext[u],h=ext[v];
  const rr=(W,H,R)=>{const sh=new T.Shape(),l=-W/2,bo=-H/2,r=W/2,up=H/2;sh.moveTo(l+R,bo);sh.lineTo(r-R,bo);sh.absarc(r-R,bo+R,R,-Math.PI/2,0);sh.lineTo(r,up-R);sh.absarc(r-R,up-R,R,0,Math.PI/2);sh.lineTo(l+R,up);sh.absarc(l+R,up-R,R,Math.PI/2,Math.PI);sh.lineTo(l,bo+R);sh.absarc(l+R,bo+R,R,Math.PI,Math.PI*1.5);return sh};
  const sh=rr(w,h,.0025);sh.holes.push(new T.Path(rr(w-.004,h-.004,.0005).getPoints(4)));let g=new T.ExtrudeGeometry(sh,{depth:L,bevelEnabled:false,curveSegments:4});
  if(axis==='x')g.rotateY(Math.PI/2);else if(axis==='y')g.rotateX(-Math.PI/2);
  g.computeBoundingBox();const q=g.boundingBox;g.translate((b[0]+b[1])/2-(q.min.x+q.max.x)/2,(b[2]+b[3])/2-(q.min.y+q.max.y)/2,(b[4]+b[5])/2-(q.min.z+q.max.z)/2);
  if(cuts.length)g=solid.subtract(g,cuts);
  return add(name,g,steel,{type:'RHS',stock_mm:[Math.round(w*1000),Math.round(h*1000),2],part:'RHS '+Math.round(Math.max(w,h)*1000)+'x'+Math.round(Math.min(w,h)*1000)+'x2 EN 10219 1.4301',join:'TIG alın kaynağı',...data})}
 const bore=(x,y,z0,z1,r=.0028)=>{const g=new T.CylinderGeometry(r,r,z1-z0,32);g.rotateX(Math.PI/2);g.translate(x,y,(z0+z1)/2);return g};
 const visible=o=>{for(let p=o;p;p=p.parent)if(!p.visible)return false;return true};

 // ---------- 1 · replaced upper-body geometry is permanently removed ----------
 root.updateMatrixWorld(true);
 const shelves=[];
 for(const o of [...root.children]){if(!o.name)continue;
  if(/^YIKAMA__UST_DOLAP_RAF_R1_5_TEK_BUKUMLU/.test(o.name)){o.geometry.computeBoundingBox();const w=o.geometry.boundingBox.max.x-o.geometry.boundingBox.min.x;if(w>1){retired.push(o.name);retireGeometry90(T,s,o,IKIZ)}else shelves.push(o);continue}
  if(RETIRE.test(o.name)){retired.push(o.name);retireGeometry90(T,s,o,IKIZ)}}
 const oldDoors=F.doors.filter(d=>/^(UST_SOL|UST_SAG|KARTON_SOL|KARTON_SAG)_KAPAK$/.test(d.name));
 F.doors=F.doors.filter(d=>!oldDoors.includes(d));

 // ---------- 2 · iskelet: 4 dikme + alt / karton / üst halka + orta kayıt (kanat derzi arkası) ----------
 // Arka sökülür sacın M5 vidaları (x 2021,5 / 3139,5 · y 1450 / 2350 / 2690) arka dikmenin arka cidarından geçer → Ø5,6 delik.
 const rearBores=x=>[1.450,2.350,2.690].map(y=>bore(x,y,ZR-t-.003,ZR-t+.001));
 for(const [i,px]of PX.entries())for(const [j,pz]of PZ.entries()){const xc=(px[0]+px[1])/2;
  rhs('DIKME_'+(j?'ARKA_':'ON_')+(i?'SAG':'SOL'),[px[0],px[1],YC,RT[1],pz[0],pz[1]],'y',{note:j?'arka sökülür sacın M5 vidaları: Ø5,6 delik + kör perçin somun':'ön yüzü oturma düzlemi z 1674 (kapak contası)',wash57Part:'frame'},j?rearBores(xc):[])}
 const XI=[PX[0][1],PX[1][0]],FZ=[ZS,ZS+.02],BZ=[ZR-t-.02,ZR-t],SZ=[PZ[0][1],PZ[1][0]];
 for(const [nm,r]of [['ALT',RB],['KARTON',RM],['UST',RT]]){
  if(nm==='KARTON'){rhs('HALKA_KARTON_ON_SOL',[XI[0],ML[0],r[0],r[1],FZ[0],FZ[1]],'x',{wash57Part:'frame'});rhs('HALKA_KARTON_ON_SAG',[ML[1],XI[1],r[0],r[1],FZ[0],FZ[1]],'x',{wash57Part:'frame'})}
  else rhs('HALKA_'+nm+'_ON',[XI[0],XI[1],r[0],r[1],FZ[0],FZ[1]],'x',{wash57Part:'frame',note:'ön yüzü oturma düzlemi z 1674'});
  rhs('HALKA_'+nm+'_ARKA',[XI[0],XI[1],r[0],r[1],BZ[0],BZ[1]],'x',{wash57Part:'frame'});
  for(const [i,px]of PX.entries())rhs('HALKA_'+nm+'_YAN_'+(i?'SAG':'SOL'),[px[0],px[1],r[0],r[1],SZ[0],SZ[1]],'z',{wash57Part:'frame'})}
 rhs('ORTA_KAYIT',[ML[0],ML[1],RB[1],RT[0],FZ[0],FZ[1]],'y',{wash57Part:'frame',note:'iki kanadın derz arkası; conta ve bas-aç bu yüze'});
 // Yan raf taşıyıcıları (eski RAF_YAN_TASIYICI yerine, aynı raf kotları 1780 / 1928).
 rhs('RAF_TASIYICI_SOL',[PX[0][0],PX[0][1],1.750,1.780,SZ[0],SZ[1]],'z',{wash57Part:'frame'});
 rhs('RAF_TASIYICI_SAG',[PX[1][0],PX[1][1],1.898,1.928,SZ[0],SZ[1]],'z',{wash57Part:'frame'});

 // Kirli bekletme tepsisi (x 2030–2630) sol ön dikmeye 1,5 mm giriyordu (eski 20×20 dikmede de aynı): tepsi 2 mm sağa, dikmeden 0,5 mm açık.
 {const d=root.getObjectByName('YIKAMA__KIRLI_BEKLETME');if(d){d.position.x+=.002;d.userData.movedT70_mm=2}}
 // ---------- 3 · saclar (1,5 mm 1.4307): düz yan saclar, tam çatı, tam taban, karton tabanı ----------
 for(const [i,x]of [[0,X0],[1,X1-t]].map(([i,x])=>[i,x])){const nm='YAN_SAC_'+(i?'SAG':'SOL');
  // tek sac, lazer kesim: niş bölümünde (tezgâh 890 – dolap altı 1480) ön düzleme (1668) kadar, kapak bölümünde oturma düzleminde (1674) biter
  const g=prismY([[x,ZS],[x+t,ZS],[x+t,ZR],[x,ZR]],YB,RT[1]);add(nm,g,skin,{type:'sheet',sheet_mm:1.5,part:'1.4307 1,5 mm düz yan sac (bükümsüz, dışta iz yok)',samePart:nm});
  add(nm,box([x,x+t,YC,YB,ZF,ZR]),skin,{type:'sheet',sheet_mm:1.5,samePart:nm})}
 add('CATI_SAC',box([X0,X1,RT[1],YT,ZS,ZR]),skin,{type:'sheet',sheet_mm:1.5,part:'1.4307 1,5 mm tek çatı sacı: yan sacların ve arka sacın üstünü örter'});
 // Taban: alt yüz 1480 = kapak alt dönüşü; dikmelere çentikli (4 köşe), üstü 1481,5 = eski raf tavası yüzü (yedek altlıkları aynen).
 const notched=(xa,xb,za,zb,extra=[])=>{const p=[[xa,za+.03],[PX[0][1],za+.03],[PX[0][1],za],...extra,[PX[1][0],za],[PX[1][0],za+.03],[xb,za+.03],[xb,zb-.03],[PX[1][0],zb-.03],[PX[1][0],zb],[PX[0][1],zb],[PX[0][1],zb-.03],[xa,zb-.03]];return p};
 add('TABAN_SAC',prismY(notched(PX[0][0],PX[1][1],ZS,ZR-t),YB,RB[0]),skin,{type:'sheet',sheet_mm:1.5,part:'1.4307 1,5 mm dolap tabanı (dikme köşeleri çentikli), alt halkaya punta',note:'alt yüz düz ve kapalı: kapak alt dönüşü ile aynı düzlem (y 1480)'});
 add('KARTON_TABAN_SAC',prismY(notched(PX[0][0],PX[1][1],ZS,ZR-t,[[ML[0],ZS],[ML[0],ZS+.02],[ML[1],ZS+.02],[ML[1],ZS]]),RM[1],RM[1]+t),steel,{type:'sheet',sheet_mm:1.5,part:'1.4307 1,5 mm karton tabanı = temizlik dolabı tavanı (buhar ayırıcı), karton halkasına punta'});

 // ---------- 4 · bölmeler (eski x 2258 / 2718, tek bükümlü, ön dili oturma düzleminde) ----------
 // Ön-alt köşe alt halka ön kaydına çentikli (30 × 20,5); arka kenar arka kayda dayanır.
 const FS={parts:[],steel,skin};
 for(const x of [2.258,2.718]){const nm='BOLME_'+Math.round(x*1000);
  const o=bentLand61(T,FS,root,{name:'T70_'+nm,outer:x,hand:1,bottom:RB[1],top:RM[0]-t,seat:ZS,rear:BZ[0],land:13.5});tag(o,{type:'formed sheet',sheet_mm:1.5,samePart:nm,part:'1.4307 1,5 mm tek bükümlü bölme'});
  add(nm,box([x,x+t,RB[0],RB[1],FZ[1]+.0005,BZ[0]]),skin,{type:'sheet',sheet_mm:1.5,samePart:nm})}
 // Orta raf (x 2259,5–2718) ön kenarı orta kayıt hizasında çentik (32 × 12,5).
 for(const o of shelves){const w=o.geometry.boundingBox.max.x-o.geometry.boundingBox.min.x;if(Math.abs(w-.4585)>.002)continue;
  o.updateMatrix();const inv=o.matrix.clone().invert();o.geometry=solid.subtract(o.geometry,[box([ML[0]-.001,ML[1]+.001,1.75,1.82,ZS+.008,FZ[1]+.0015]).applyMatrix4(inv)]);o.userData.notchT70='orta kayıt (x 2565,5–2595,5) için ön kenar çentiği';}

 // ---------- 5 · kanatlar: iki bindirmeli kanat, ön düzlem z 1668, derz 0 ----------
 // Sac 1,5 + 6 mm dönüş (dış üç kenar). Derz kenarında dönüş yok; yüz sacı arkada 0,02 mm, dönüş uçları 0,02→0,1 mm pahlı
 // (STANDART derz kuralı: açılış yolunda komşu kanada girmez; önde derz 0).
 const leaves=[],hinges=[],latches=[],seals=[];
 const HY=[YB+.12,(YB+YT)/2,YT-.12];
 for(const [nm,hand,emka]of [['SOL',1,'1031-U36'],['SAG',-1,'1031-U37']]){
  const piv=hand>0?X0:X1,inner=XM,leaf=new T.Group();leaf.name='YIKAMA__T70_KANAT_'+nm;leaf.userData.kapakIstasyon='WASH';root.add(leaf);
  const lp=[];const L=(n,g,mat=skin,data={})=>{const o=add('KANAT_'+nm+'_'+n,g,mat,{coverId:'T70_'+nm,...data},leaf);lp.push(o);return o};
  const xo=piv,xi=inner,sx=v=>xo+hand*v; // kanat yerel ölçüsü: dış kenardan içe doğru
  const W=Math.abs(xi-xo);
  L('YUZ_SAC',prismY([[sx(0),ZF],[sx(W),ZF],[sx(W-.00002),ZF+t],[sx(0),ZF+t]],YB,YT),skin,{type:'door skin',sheet_mm:1.5,part:'1.4307 1,5 mm kanat, 6 mm dönüşlü'});
  L('DONUS_DIS',box(hand>0?[X0,X0+t,YB,YT,ZF+t,ZS]:[X1-t,X1,YB,YT,ZF+t,ZS]));
  for(const [n,y0,y1]of [['DONUS_ALT',YB,YB+t],['DONUS_UST',YT-t,YT]])L(n,prismY([[sx(t),ZF+t],[sx(W-.00002),ZF+t],[sx(W-.0001),ZS],[sx(t),ZS]],y0,y1));
  // EMKA 1011-21 conta: kanat arkasında kapalı halka (dış kenarlar 14–20 mm bant → dikme / halka kaydı yüzü; derz kenarı 6–12 mm → orta kayıt).
  const band=(a,b)=>[sx(a),sx(b)].sort((p,q)=>p-q);
  const so=band(.014,.020),si=band(W-.012,W-.006),sxa=band(.014,W-.006),zc=[ZF+t,ZS];
  for(const [n,b]of [['ALT',[...sxa,YB+.014,YB+.020]],['UST',[...sxa,YT-.020,YT-.014]],['DIS',[...so,YB+.020,YT-.020]],['DERZ',[...si,YB+.020,YT-.020]]])
   seals.push(L('CONTA_EMKA_1011_21_'+n,box([b[0],b[1],b[2],b[3],...zc]),epdm,{part:'EMKA 1011-21 köpük EPDM balon conta (kuru istasyon), kanat iç flanşına klipsli',catalogue:'EMKA 1011-21',dimensionsAssumed:true}));
  // EMKA 1031 gizli menteşe ×3 (kanat 1290 mm, kanat başına 3): gövde parçası dikme iç yüzüne, kapak parçası kanat arkasına.
  const hx=band(.0215,.0455);
  for(const y of HY){add('EMKA_'+emka+'_GOVDE_'+nm+'_'+Math.round(y*1000),box([hx[0],hx[1],y-.025,y+.025,ZS,ZS+.025]),zinc,{part:'EMKA '+emka+' gövde parçası (AISI 304), dikmeye M6 saplama',catalogue:'EMKA '+emka+' · 125° · aletsiz takılır-çıkar',dimensionsAssumed:true,hinge:true});
   L('EMKA_'+emka+'_KAPAK_PARCASI_'+Math.round(y*1000),box([hx[0],hx[1],y-.02,y+.02,ZF+t,ZS-.0005]),zinc,{part:'EMKA '+emka+' kapak parçası (AISI 316, mandallı)',catalogue:'EMKA '+emka,dimensionsAssumed:true,hinge:true});hinges.push({leaf:nm,y,part:'EMKA '+emka})}
  // Southco A4 bas-aç: mandal orta kaydın yan yüzünde L köşebentte, itici kanadın arkasında (zarf; A81 ile aynı).
  const lb=hand>0?[ML[0]-.003,ML[0]]:[ML[1],ML[1]+.003],st=hand>0?[ML[0]-.013,ML[0]-.004]:[ML[1]+.004,ML[1]+.013];
  add('BAS_AC_MANDAL_'+nm,box([lb[0],lb[1],2.100,2.150,ZS+.003,ZS+.030]),steel,{part:'Southco A4-26-502-10 mandal + L köşebent (zarf)',catalogue:'Southco A4-26-502-10',dimensionsAssumed:true});
  L('BAS_AC_ITICI',box([st[0],st[1],2.113,2.137,ZF+t,ZS+.012]),dark,{part:'Southco A4-99-162 itici (zarf)',catalogue:'Southco A4-99-162',dimensionsAssumed:true});latches.push({leaf:nm,y:2.125});
  // Menteşe ekseni: dış ön köşe (x 2010 / 3151, z 1668); kanat her açıda yan sacın ön düzleminin önünde kalır.
  const o=new T.Vector3(piv,0,ZF);for(const m of lp)m.geometry.translate(-o.x,0,-o.z);leaf.position.copy(o);
  const rec={name:'T70_KANAT_'+nm,leaf,hand,target:0,value:0,customFabricated:false,parts:lp,
   pose(v){v=Math.max(0,Math.min(1,v));leaf.rotation.y=hand*OPEN*v;root.updateMatrixWorld(true);return{value:v,doorAngle_deg:90*v,closureError_m:0}}};
  // Tıklama: temizlik_yerlesim'in mevcut işleyicisi F.doors[].leaf atasını arar (menü yok, eski kanatlarla aynı).
  rec.pose(0);leaves.push(rec)}
 F.doors.push(...leaves);if(IKIZ.kartonDepo)IKIZ.kartonDepo.doors=leaves;F.cartonDoors=leaves;
 root.updateMatrixWorld(true);

 // ---------- 6 · en alt kapak (KIMYASAL_KAPAK) tıklama düzeltmesi (Kemal: "en alt kapağı açamıyorum") ----------
 // Kök neden: kapak yalnız PLC/sim yıkama servisi üzerinden açılıyor (IKIZ.washKomut → 'ikiz.wash', izin = son.wash60.servis_izin,
 // konum = son.wash60.konum.kimyasal). Bu servis yalnız wash-service60 kapsülünün sim'inde (wash_service60.py) vardı; canlı main-e7x
 // sim'inde YOK → son.wash60 hiç gelmez → setDoor izin yok diye döner, update konum yok diye kapağı oynatmaz.
 // Düzeltme: sim wash60 yayınlıyorsa davranış AYNEN (izin + PLC konumu); yayınlamıyorsa kapak yerel olarak açılır / kapanır (0,8 s).
 const chem=F.doors[0],origSet=F.setDoor;
 F.setDoor=(d,v)=>{if(typeof d==='string')d=F.doors.find(o=>o.name===d);if(d===chem&&!IKIZ.son?.wash60){chem.target=v?1:0;chem.localT70=true;return}return origSet(d,v)};
 const chemLocal=dt=>{if(IKIZ.son?.wash60||!chem)return;const tg=chem.target||0;chem.value=(chem.value||0)+Math.sign(tg-(chem.value||0))*Math.min(Math.abs(tg-(chem.value||0)),Math.max(0,Math.min(.1,dt||0))/.8);chem.pose(chem.value)};
 IKIZ.kancalar?.push(chemLocal);

 const data=IKIZ.tMain70={revision:70,root,parts,retired,leaves,hinges,latches,seals,T70,
  closure:{front_plane_mm:ZF*1000,seat_plane_mm:ZS*1000,seam_front_mm:0,seam_back_relief_mm:[.02,.1],bottom_face_mm:YB*1000,top_face_mm:YT*1000},
  note:'Dış ölçü ve yer aynı (x 2010–3151 · y 890–2770 · z 1668–2318). Yedek kasetler, araç gereç, raflar (1780/1805/1928), karton yığını (210) yerinde. Eski 4 kanat → 2 kanat; sınırlayıcı halat ve MC-159 tutucular kalktı (EMKA 1031 açı sonu 125° > 90° kullanım, Southco A4 bas-aç).'};
 return data}
