import {retireGeometry90} from './retired_geometry90.js';
import {duvarBirlesikGeometri,PLAN} from './dukkan_plan.js';

// ZEMIN70 (YONETICI/Kemal 22 Eki, "zemin alti: tek duzenli kanal, kablo yok"): zemin altindaki dallanan eski kanal/kablo/kutu
// parcalari (Codex FLOOR27, BINA_ZEMIN, ELK_* zemin kablolari, ROBOT25 besleme/ethernet kablolari, DUKKAN_SERVIS kapakli kanal) kaldirilir.
// ELK_KANAL_AGI (Kemal 1 Kas 2026): 22 Eki zemin alti 3 kolu (ANA_KOL_Z / E_KOLU_X / DUKKAN_KOLU_X) ve sagdaki salter duvar kanali + zemin buati
// silindi. Yerine tek kanal agi, yalniz duz parca + 90 derece: salter kutusu (ray ekseni z 0,960) -> duvardan zemine -> sag duvar supurgelik
// kanali -> E makine girisi (sag yan, z -0,88) ; ray motoru ve enerji zinciri olugu ; QR dolabi arka yuzu -> ayirici gecisi -> personel tezgahi.
// 2 Kas (Kemal): kanal GOMULU — duvarda sag duvar govdesi icinde (x 5,370-5,410; duvar 5,360-5,455), zeminde doseme altinda
// (y -0,051 / -0,011). Uclarda yalniz zemine gomme 80x80 cikis kapagi gorunur (ust yuzu doseme hizasi +3 mm).
// Kanal 60 x 40 mm kapakli; kablolar kanal icinde, modelde yok (Kemal kurali).
const GIZLE=[/^FLOOR27_(?!ZEMIN_)/,/^BINA_ZEMIN__(celik|kanal|vida)$/,/^ELK_BINA_DAGITIM__/,/^ELK_ZEMIN__/,/^ELK_QR_DOLAP__kablo/,/^ELK_HUCRE_KAPI__(kanal|rakor)$/,
 /^ELK_ROBOT_KAMERA__kablo/,/^ELK_RAY_SENSOR__kablo/,/^ROBOT25_(QR_ETHERNET|QR_GUC|MAKINE_BESLEME|ROBOT_BESLEME|SURUCU_BESLEME|SERVO_MOTOR_KABLO|MAKINE_ETHERNET|UR_ETHERNET|UR_HIGH_FLEX_12M_SABIT)$/,
 /^DUKKAN_SERVIS__KAPAKLI_ZEMIN_KANALI$/];
const KANAL={urun:'60×40 mm kapaklı kablo kanalı (OBO LKM I 60040 sınıfı) · köşeler 90°',kesit_mm:[60,40]};
// [ad, x0,y0,z0, x1,y1,z1]  (sag duvar ic yuzu x 5,360; ray ekseni z 0,960; doseme ust yuzu y 0)
const ZA=-.051,ZU=-.011;
export const KANAL_AGI=[
 ['DIKEY_PANO_SALTER',[5.370,.840,.930,5.410,1.000,.990]],     // duvar icinde: pano alti -> salter ustu
 ['DIKEY_SALTER_ZEMIN',[5.370,ZA,.930,5.410,.600,.990]],       // duvar icinde: salter alti -> doseme alti
 ['ZEMIN_SAG',[5.330,ZA,-.910,5.410,ZU,1.732]],                // doseme alti, sag duvar dibi: E -> QR arkasi
 ['ZEMIN_MAKINE_E',[5.200,ZA,-.910,5.330,ZU,-.850]],           // doseme alti -> E sag yan altina
 ['ZEMIN_RAY_MOTOR',[5.020,ZA,.670,5.330,ZU,.730]],            // doseme alti -> ray dikey motoru
 ['ZEMIN_RAY_ZINCIR',[5.130,ZA,1.155,5.330,ZU,1.215]],         // doseme alti -> enerji zinciri olugu ucu
 ['ZEMIN_QR',[3.067,ZA,1.672,5.330,ZU,1.732]],                 // doseme alti: QR arkasi + ayirici altindan gecis
 ['ZEMIN_PERSONEL',[3.067,ZA,1.732,3.127,ZU,2.360]],           // doseme alti -> personel tezgahi
 ['CIKIS_E',[5.205,0,-.920,5.285,.003,-.840]],                 // zemine gomme cikis kapaklari (gorunen tek parca)
 ['CIKIS_RAY_MOTOR',[5.020,0,.660,5.100,.003,.740]],
 ['CIKIS_RAY_ZINCIR',[5.130,0,1.145,5.210,.003,1.225]],
 ['CIKIS_QR',[4.200,0,1.660,4.280,.003,1.740]],
 ['CIKIS_PERSONEL',[3.057,0,2.290,3.137,.003,2.370]],
];

export function zemin70(T,I){
 if(I.zemin70)return I.zemin70.metadata;
 const sc=I.sahne.scene,gizli=[],retired=[];
 sc.traverse(o=>{if(!(o.isMesh||o.isLine))return;const n=o.name||'';
  let kablo=false;if(/^DUKKAN_SERVIS__BINA_/.test(n)&&o.isMesh){o.geometry.computeBoundingBox();const b=o.geometry.boundingBox.clone().applyMatrix4(o.matrixWorld);kablo=b.min.y<-.005;}
  if(kablo||GIZLE.some(r=>r.test(n))){gizli.push(n);retired.push(o);}});
 for(const o of retired)retireGeometry90(T,sc,o,I);
 // Doseme: eski kanal agizlari / kablo gecisleri kapanir.
 const floor=sc.getObjectByName('DUKKAN__TEK_PARCA_ZEMIN');let doseme=false;
 if(floor){floor.geometry.dispose();floor.geometry=duvarBirlesikGeometri(T,[[PLAN.solIc-.10,PLAN.sagIc+.10,-.011,0,PLAN.arkaIc-.10,PLAN.cepheDis]],[...(floor.userData.wash60AnchorBores||[])]);floor.position.set(0,0,0);doseme=true;}
 const root=new T.Group();root.name='ELK_KANAL_AGI';(sc.getObjectByName('IKIZ_DUKKAN')||sc).add(root);
 const kapak=new T.MeshStandardMaterial({color:0x8f969c,metalness:.6,roughness:.4});kapak.userData.preserveReviewMaterial=true;
 const mat=new T.MeshStandardMaterial({color:0xaeb4b9,metalness:.55,roughness:.45});mat.userData.preserveReviewMaterial=true;
 const box=a=>{const g=new T.BoxGeometry(a[3]-a[0],a[4]-a[1],a[5]-a[2]);g.translate((a[0]+a[3])/2,(a[1]+a[4])/2,(a[2]+a[5])/2);return g};
 const eklenen=[];
 for(const[ad,a]of KANAL_AGI){const o=new T.Mesh(box(a),/^CIKIS_/.test(ad)?kapak:mat);o.name='ELK_KANAL_AGI__'+ad;o.userData={electrical:true,electricalPart:'frame',assemblyOwner:'POWER',katman:'sasi',partLabel:KANAL.urun,productionRelease:false};root.add(o);eklenen.push(o);}
 root.updateMatrixWorld(true);I.katmanlar?.scan?.();
 const uzunluk_m=KANAL_AGI.reduce((s,[ad,a])=>/^CIKIS_/.test(ad)?s:s+Math.max(a[3]-a[0],a[4]-a[1],a[5]-a[2]),0);
 const metadata={revision:'kanal-gomulu-2kas',gomulu:'duvar ici + doseme alti',urun:KANAL.urun,parca:eklenen.length,uzunluk_m:+uzunluk_m.toFixed(3),gizlenen:gizli.length,gizlenenOrnek:[...new Set(gizli.map(n=>n.replace(/_\d+$/,'')))].slice(0,40),dosemeAgizlariKapandi:doseme,hedefler:['salter','E giris','ray motoru','enerji zinciri','QR','personel tezgahi']};
 document.documentElement.dataset.zemin70=JSON.stringify(metadata);
 I.zemin70={root,eklenen,metadata};return metadata;
}
