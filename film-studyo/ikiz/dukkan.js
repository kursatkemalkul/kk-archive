import {staffStorage31} from './staff_storage31.js?v=9a4294175663';
import {shopSafety30} from './shop_safety30.js?v=6ef1263cedc5';
import {shopEquipment30} from './shop_equipment30.js?v=64667eaf05f6';
import {staffCabinet29} from './staff_cabinet29.js?v=55c82396cc71';
import {dukkanTemiz29} from './dukkan_temiz29.js?v=444a0115de9f';
import {dukkanKalan29} from './dukkan_kalan29.js?v=8d51b9772e20';
import {dukkanAccessories29} from './dukkan_accessories29.js?v=c4ccf54c27e3';
import {dukkanCephe58,cephe58Yuru} from './dukkan_cephe58.js?v=1f28f6e86954';
import {eServisKapakKur} from './e_servis_kapak.js';
import {katmanlarKur} from './katmanlar.js';
/* Shop layout: 13 October. dukkan_plan.js is the current wall/floor,
   open QR frontage, recessed right-wall kiosk and staff wet-block layout.
   Catalogue equipment keeps its actual size; legacy v4 staff door hardware
   is reused, while superseded facade/partition/kiosk/floors are removed. */
import { PERSONEL } from '../ikiz_personel/personel_v2.js';
import { GLTFLoader } from './vendor/GLTFLoader.js';
import {yikamaKur} from './yikama.js';
import { personelKapilarKur } from './personel_kapilar.js?v=290a15905bae';
import {dukkanFinish29} from './dukkan_finish29.js?v=622fed87e394';
import { dukkanKapiD1 } from './dukkan_kapi_d1.js?v=17498b734d4e';
import { dukkanKioskD2 } from './dukkan_kiosk_d2.js';
import { temizlikKur } from './temizlik_yerlesim.js?v=88dce0f52dac';
import { dukkanServisKur } from './dukkan_servis.js';
import { dukkanPlanKur, personelPlanUygula, PLAN } from './dukkan_plan.js?v=1a8a1f56649e';
import { QR_EKRAN } from './qr_ekran.js';
import { dukkanV4, EKRAN } from './dukkan_v4.js';
import { dukkanPersonel71 } from './dukkan_personel71.js?v=9b9a80bfff7f';
export const D = {
  CEPHE_IC: 2.883, CEPHE_DIS: 2.983,              // düz cephe (tüm genişlik; QR önü 800)
  HUCRE_DUVAR: PLAN.hucreDuvar, HUCRE_PANEL: 0.100, HUCRE_Y: PLAN.yukseklik, HUCRE_KAPI: [0.686, 1.586], HUCRE_KAPI_Y: 2.03,
  QR_YUZ: 2.083, X0: 0.636, X1: 5.36, TAVAN: 2.80,
  KAPI_P: [0.686, 1.586], PENCERE: [1.77, 3.07, 1.00, 2.00], KAPI_M: [4.31, 5.21], KAPI_M_KANAT: [3.84, 4.31], KAPI_M_RAY: [3.81, 5.21], KAPI_Y: 2.10,
  AYIRICI: PLAN.ayirici,
  TEZGAH: [PLAN.tezgah[0],PLAN.tezgah[1],PLAN.tezgah[4],PLAN.tezgah[5],PLAN.tezgah[2],PLAN.tezgah[3]], DIZ: [2.00, 2.60],
  EVYE: [2.243, 3.073, 1.770, 2.878],             // v2: L kolu 830 (ekipman evyesi + MEIKO) — personel_v2
  EL_LAVABO: [0.536, 0.836, 2.275, 2.725],         // v2: Delabie LAVANDO 121370 sol duvarda (450 × 300 × 135)
  POS_EGIM: 0.96,                                   // IKIZ-ARAYUZ-6 (10 Eki): ayakta kullanım — göz 1,65 / şerit z 2,10 → atan(0,695 / 0,49) = 0,96 rad (ekran yatayla 35°); tablet modeli + CSS3D AYNI dönüşüm
  KIOSK: [PLAN.sagIc, PLAN.sagIc+.066, 2.25, 2.70, 0.85, 1.89],
  SERIT: [1.95385,2.87615,2.31585,2.60415,3.043,3.1165], // Actual 37BH7N-H on external staff fascia
};

/* Ana GLB'deki eski dükkân (Codex v26, DUKKAN26_*) ön bölge parçaları: yeni yerleşimle çakışır → ikizde gizlenir (ana modele dokunulmaz).
   Desen: hücre ara duvarı + robot alanı kapısı (eski z 2,133), eski ön duvar / dükkân kapısı (z 3,553), eski oturma tezgâhı, masa, sandalye, lavabo takımı, yan duvar çizgileri.
   Ek kural: dünya kutusu yeni cephenin dışını (z > 2,983) aşan HER DUKKAN26 parçası (eski ZEMIN_0 dahil → hücre zemini burada çizilir). Arka duvar kalır. */
export const ESKI_DUKKAN_DESEN = /^DUKKAN26_(ARA_DUVAR|ROBOT_ALANI_GIRIS|ON_DUVAR|DUKKAN_GIRIS|OTURMA_TEZGAHI|MASA_|SANDALYE_|LAVABO_|EL_YIKAMA|BATARYA|SOGUK_SU|SICAK_SU|SU_KESME|SABUNLUK|KAGIT_HAVLULUK|SOL_DUVAR_1_[23]|SAG_DUVAR_1_[23]|SOL_DUVAR_2_|SAG_DUVAR_2_)/;
export function eskiDukkanGizle(kok, THREE) {
  const gizlenen = [], kutu = THREE ? new THREE.Box3() : null;
  kok.updateMatrixWorld(true);
  // Two static panel-hinge meshes share a name and eight identical faces.
  // Keep the richer hinge assembly, retaining every unique face of the other.
  if(THREE){
    const hinges=[];kok.traverse(o=>{if(o.isMesh&&o.visible&&o.name==='ROBOT25_DUVAR_PANO_MENTESE_109')hinges.push(o);});
    hinges.sort((a,b)=>(b.geometry.index?.count??b.geometry.attributes.position.count)-(a.geometry.index?.count??a.geometry.attributes.position.count));
    const seen=new Set(),v=new THREE.Vector3();
    for(const o of hinges){const g=o.geometry,p=g.attributes.position,ix=g.index?.array,keep=[];let removed=0;
      for(let i=0,n=ix?.length??p.count;i<n;i+=3){const pts=[];for(let j=0;j<3;j++){v.fromBufferAttribute(p,ix?ix[i+j]:i+j).applyMatrix4(o.matrixWorld);pts.push(v.toArray().map(x=>Math.round(x*1e6)).join(','));}const key=pts.sort().join('|');
        if(seen.has(key)){removed++;continue;}seen.add(key);keep.push(ix?ix[i]:i,ix?ix[i+1]:i+1,ix?ix[i+2]:i+2);
      }
      if(removed){o.geometry=g.clone();o.geometry.setIndex(keep);o.userData.dtDuplicateFacesRemoved=removed;}
    }
  }
  kok.traverse(o => {
    // Migration-only position triangles are anchors, never physical equipment.
    // Keep their transform/name for animation lookups, but give them no draw.
    if(o.isMesh&&o.geometry?.userData?.referenceOnly){
      o.geometry=o.geometry.clone();o.geometry.setDrawRange(0,0);
      o.visible=false;o.userData.visualCleanup30='reference-only anchor';gizlenen.push(o.name);return;
    }
    // Superseded lower HMI tablet/dock: keep only the bonded upper tablet.
    if(/^HMI_TABLET__/.test(o.name)){o.visible=false;gizlenen.push(o.name);return;}
    if(THREE&&o.isMesh&&/^(BINA_ZEMIN__(kapak|vida)$|FLOOR27_.*_KAPAK(?:_|$))/.test(o.name)&&!o.userData.dtZeminBitisi){o.userData.dtZeminBitisi=true;zeminBitisiniAyikla(THREE,o);}
    // Retired cell-door safety post stood in the middle of the staff aisle.
    // The current lock is mounted at the new sliding-door jamb instead.
    if (/^ELK_HUCRE_KAPI__/.test(o.name)) { o.visible=false;gizlenen.push(o.name);return; }
    // Building electrical meshes also contain unrelated machine branches.
    // Trim only the former post's above-floor inlet, keeping those branches.
    if (THREE && o.isMesh && /^ELK_BINA_DAGITIM__(kablo_veri|kablo_guc|rakor)/.test(o.name) && !o.userData.dtEskiKapiKablo) {
      o.userData.dtEskiKapiKablo=true;
      const geo=o.geometry.clone(),p=geo.attributes.position,ix=geo.index?.array,keep=[],v=new THREE.Vector3(),c=new THREE.Vector3();
      for(let i=0,n=ix?.length??p.count;i<n;i+=3){c.set(0,0,0);for(let j=0;j<3;j++){v.fromBufferAttribute(p,ix?ix[i+j]:i+j).applyMatrix4(o.matrixWorld);c.add(v);}c.multiplyScalar(1/3);
        if(c.x>=1.53&&c.x<=1.71&&c.y>=-.001&&c.y<=1.15&&c.z>=2.06&&c.z<=2.15)continue;
        // Retired staff-door floor spur and its unused cable glands.
        if(c.x>=1.53&&c.x<=3.30&&c.y<.020&&c.z>=2.055&&c.z<=2.150)continue;
        // Retire the complete old building QR branch; the current PIN-spine
        // feed and its floor channels are now built explicitly by dukkan_servis.
        if(c.x>=3.050&&c.x<=5.600&&c.y<=2.100&&c.z>=1.600&&c.z<=2.220)continue;
        // Former QR-left inlet was replaced by the current right PIN spine.
        if(c.x>=3.125&&c.x<=3.235&&c.y>=-.100&&c.y<=.200&&c.z>=1.940&&c.z<=2.055)continue;
        keep.push(ix?ix[i]:i,ix?ix[i+1]:i+1,ix?ix[i+2]:i+2);
      }
      geo.setIndex(keep);o.geometry=geo;
    }
    if (o.name==='BINA_ZEMIN__doseme'||/^FLOOR27_(SAG_DUVAR|ARKA_DUVAR|ZEMIN)_|^DUKKAN26_(SOL_DUVAR|SAG_DUVAR|ARKA_DUVAR|ZEMIN)_/.test(o.name)) { o.visible=false;gizlenen.push(o.name);return; }
    if (!o.name || !o.name.startsWith('DUKKAN26_') || !o.visible) return;
    const disari = kutu && o.isMesh && kutu.setFromObject(o).max.z > D.CEPHE_DIS + 0.005;
    if (ESKI_DUKKAN_DESEN.test(o.name) || disari) { o.visible = false; gizlenen.push(o.name); }
  });
  if(THREE)eServisKapakKur(THREE,kok);
  return gizlenen;
}

// Subtract only the finished-floor volume from old access-cover render meshes.
// Retain their outer portions and all structural channel beds/side walls.
function zeminBitisiniAyikla(T,o){
 // Retired GLB meshes retain two bounding points for datum lookups, not triangles.
 // Preserve those exact bounds; clipping a third nonexistent vertex creates NaNs.
 if(o.geometry.userData?.ymSilindi)return;
 const floor=[PLAN.solIc-.10,PLAN.sagIc+.10,-.011,.0045,PLAN.arkaIc-.10,PLAN.cepheDis],pos=o.geometry.attributes.position,ix=o.geometry.index?.array,out=[],inv=o.matrixWorld.clone().invert();
 const planes=[[0,floor[0],1],[0,floor[1],-1],[1,floor[2],1],[1,floor[3],-1],[2,floor[4],1],[2,floor[5],-1]];
 function clip(poly,axis,value,sign,inside){const result=[];if(!poly.length)return result;let a=poly.at(-1),da=(a.getComponent(axis)-value)*sign,aa=inside?da>=0:da<0;for(const b of poly){const db=(b.getComponent(axis)-value)*sign,bb=inside?db>=0:db<0;if(aa!==bb)result.push(a.clone().lerp(b,da/(da-db)));if(bb)result.push(b.clone());a=b;da=db;aa=bb;}return result;}
 for(let i=0;i<(ix?.length??pos.count);i+=3){let poly=[0,1,2].map(j=>new T.Vector3().fromBufferAttribute(pos,ix?ix[i+j]:i+j).applyMatrix4(o.matrixWorld));const outside=[];for(const[axis,value,sign]of planes){outside.push(clip(poly,axis,value,sign,false));poly=clip(poly,axis,value,sign,true);if(!poly.length)break;}for(const face of outside)for(let j=1;j<face.length-1;j++)for(const v of [face[0],face[j],face[j+1]])out.push(...v.clone().applyMatrix4(inv).toArray());}
 if(!out.length){o.visible=false;return;}const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(out,3));g.computeVertexNormals();g.computeBoundingBox();g.computeBoundingSphere();o.geometry=g;
}

export function dukkanKur(THREE, scene,IKIZ={}) {
  const g = new THREE.Group(); g.name = 'IKIZ_DUKKAN'; scene.add(g);
  const liste = [];
  const M = (renk, ek = {}) => new THREE.MeshStandardMaterial({ color: renk, roughness: 0.75, metalness: 0.05, ...ek });
  const MAT = {
    duvar: M(0xffffff), panel: M(0xd9dde2, { metalness: 0.2 }), zemin_ic: M(0xa9adb2, { roughness: 0.9 }), kaldirim: M(0x9a9da2, { roughness: 0.95 }), cam: M(0xbfd6e6, { transparent: true, opacity: 0.25, roughness: 0.05, metalness: 0.1 }),
    kasa: M(0x2e3238, { metalness: 0.4, roughness: 0.5 }), paslanmaz: M(0xc8ccd0, { metalness: 0.75, roughness: 0.3 }), siyah: M(0x121417, { roughness: 0.4 }), ekran: M(0x0b0d10, { roughness: 0.2, metalness: 0.2 }),
    ahsap: M(0x8a6a4a), kapi: M(0x3a3f46, { metalness: 0.3 }),
  };
  function kutu(ad, x0, x1, y0, y1, z0, z1, mat, tur = 'parca') {
    const m = new THREE.Mesh(new THREE.BoxGeometry(Math.abs(x1 - x0), Math.abs(y1 - y0), Math.abs(z1 - z0)), mat);
    m.position.set((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2); m.name = 'DUKKAN__' + ad; g.add(m);
    liste.push({ ad, tur, kutu: [x0, x1, y0, y1, z0, z1].map(v => +v.toFixed(3)) }); return m;
  }
  function silindir(ad, x, z, r, y0, y1, mat, tur = 'parca') {                     // düşey silindir (tabure)
    const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, y1 - y0, 32), mat);
    m.position.set(x, (y0 + y1) / 2, z); m.name = 'DUKKAN__' + ad; g.add(m);
    liste.push({ ad, tur, kutu: [x - r, x + r, y0, y1, z - r, z + r].map(v => +v.toFixed(3)) }); return m;
  }
  const { CEPHE_IC: CI, CEPHE_DIS: CD, HUCRE_DUVAR: HD, HUCRE_PANEL: HP, X0, X1, TAVAN } = D;
  const HDi = HD + HP;                                                   // hücre duvarının personel yüzü
  const [a0, a1] = D.AYIRICI;
  /* zeminler */
  kutu('ZEMIN_HUCRE', X0, X1, -0.011, -0.001, -0.882, HD, MAT.zemin_ic, 'zemin');      // eski DUKKAN26_ZEMIN_0 (z 3,613'e uzanıyordu) gizlendi
  kutu('ZEMIN_PERSONEL', X0, a0, -0.01, 0, HDi, CI, MAT.zemin_ic, 'zemin');
  kutu('ZEMIN_MUSTERI', a1, X1, -0.01, 0, D.QR_YUZ, CI, MAT.zemin_ic, 'zemin');
  kutu('KALDIRIM', -0.6, 6.8, -0.012, 0, CD, 8.2, MAT.kaldirim, 'zemin');
  kutu('ESIK_CEPHE', X0, X1, -0.01, 0, CI, CD, MAT.zemin_ic, 'zemin');
  /* hücre duvarı z 1,750 (QR arka yüzü hizası; 20 mm panel, h 2,05) + hücre kapısı (menteşeli, kapalı çizilir; DOLDURMA rolü geçer) */
  const [h0, h1] = D.HUCRE_KAPI;
  kutu('HUCRE_DUVAR_1', X0, h0, 0, D.HUCRE_Y, HD, HDi, MAT.panel, 'duvar');
  kutu('HUCRE_DUVAR_2', h1, a0, 0, D.HUCRE_Y, HD, HDi, MAT.panel, 'duvar');
  kutu('HUCRE_KAPI_UST', h0, h1, D.HUCRE_KAPI_Y, D.HUCRE_Y, HD, HDi, MAT.panel, 'duvar');
  kutu('HUCRE_KAPI_KASA_SOL', h0, h0 + 0.03, 0, D.HUCRE_KAPI_Y, HD - 0.01, HDi + 0.01, MAT.kasa, 'kapi');
  kutu('HUCRE_KAPI_KASA_SAG', h1 - 0.03, h1, 0, D.HUCRE_KAPI_Y, HD - 0.01, HDi + 0.01, MAT.kasa, 'kapi');
  kutu('HUCRE_KAPI_KANAT', h0 + 0.03, h1 - 0.03, 0.01, D.HUCRE_KAPI_Y - 0.01, HD + 0.004, HDi - 0.004, MAT.cam, 'kapi');
  /* cephe z 2,883 düz (iki kapı + tezgâh penceresi) */
  const [p0, p1] = D.KAPI_P, [w0, w1, wy0, wy1] = D.PENCERE, [m0, m1] = D.KAPI_M;
  kutu('CEPHE_1', X0 - 0.1, p0, 0, TAVAN, CI, CD, MAT.duvar, 'duvar');
  kutu('CEPHE_2', p1, w0, 0, TAVAN, CI, CD, MAT.duvar, 'duvar');
  kutu('CEPHE_PENCERE_ALT', w0, w1, 0, wy0, CI, CD, MAT.duvar, 'duvar');
  kutu('CEPHE_PENCERE_UST', w0, w1, wy1, TAVAN, CI, CD, MAT.duvar, 'duvar');
  kutu('CEPHE_3', w1, m0, 0, TAVAN, CI, CD, MAT.duvar, 'duvar');
  kutu('CEPHE_4', m1, X1 + 0.1, 0, TAVAN, CI, CD, MAT.duvar, 'duvar');
  kutu('CEPHE_KAPI_UST_P', p0, p1, D.KAPI_Y, TAVAN, CI, CD, MAT.duvar, 'duvar');
  kutu('CEPHE_KAPI_UST_M', m0, m1, D.KAPI_Y, TAVAN, CI, CD, MAT.duvar, 'duvar');
  kutu('PENCERE_CAM_SURME', w0 + 0.01, w1 - 0.01, wy0 + 0.01, wy1 - 0.01, CI + 0.04, CI + 0.05, MAT.cam, 'cam');
  /* kapılar: personel kapısı dışa açılır (ikizde geçiş açık) · müşteri kapısı SÜRGÜLÜ: 2 cam kanat teleskopik, açık konumda soldaki cephenin dış yüzünde toplanır (ray üstte) */
  kutu('KAPI_PERSONEL_KASA', p0, p1, D.KAPI_Y - 0.04, D.KAPI_Y, CI, CD, MAT.kasa, 'kapi');
  kutu('KAPI_MUSTERI_KASA', m0, m1, D.KAPI_Y - 0.04, D.KAPI_Y, CI, CD, MAT.kasa, 'kapi');
  const [kk0, kk1] = D.KAPI_M_KANAT, [ry0, ry1] = D.KAPI_M_RAY;
  kutu('KAPI_MUSTERI_RAY', ry0, ry1, D.KAPI_Y, D.KAPI_Y + 0.08, CD, CD + 0.06, MAT.kasa, 'kapi');
  kutu('KAPI_MUSTERI_SURGU_1', kk0, kk1, 0.01, D.KAPI_Y - 0.01, CD + 0.01, CD + 0.02, MAT.cam, 'kapi');
  kutu('KAPI_MUSTERI_SURGU_2', kk0 + 0.01, kk1 + 0.01, 0.01, D.KAPI_Y - 0.01, CD + 0.035, CD + 0.045, MAT.cam, 'kapi');
  /* yan duvarlar (ön bölge) + ayırıcı z 1,750 → 2,883 */
  kutu('DUVAR_SOL', X0 - 0.1, X0, 0, TAVAN, HD, CD, MAT.duvar, 'duvar');
  kutu('DUVAR_SAG', X1, X1 + 0.1, 0, TAVAN, D.QR_YUZ, CD, MAT.duvar, 'duvar');
  kutu('AYIRICI_DUVAR', a0, a1, 0, TAVAN, HD, CI, MAT.duvar, 'duvar');
  /* tezgâh + L kolu = GERÇEK ÜNİTELER (10 Eki, A · PERSONEL TARAFI): MEIKO M-iClean US (L kolunda, önü −x, kapak tezgâh altı açık bölmeye) + el evyesi dolabı
     (hücre duvarı ucu) + deterjan / parlatıcı dolabı (köşe) + tezgâh (dar kilitli dolap + açık bölme) → ../ikiz_personel/personel_v1.glb. Yer tutucu kutular kalktı;
     liste'ye birim kutuları girer (TEZGAH_UST / EVYE_UST adları korunur). Ölçüler + bağlantılar: PERSONEL (personel_v1.js). */
  const [, , tz0, , , ty1] = D.TEZGAH;
  // Furniture footprints are rebuilt by the current floor plan below.
  let yikama=null;
  const pg = new THREE.Group(); pg.name = 'DUKKAN__PERSONEL'; g.add(pg);
  // Wet equipment is now one freestanding station; the superseded OEM US/sink scene is not loaded.
  /* personel taburesi KALDIRILDI (K11 · IKIZ-ARAYUZ-6, 10 Eki: oturmaya gerek yok, tezgâh arkası şeridi kesintisiz) */
  /* POS tableti (tezgâhta, personele dönük) — Samsung Tab Active5 + masa standı [kat.] */
  const posX = 2.94, posZ = 2.622;
  kutu('POS_STAND', posX - 0.06, posX + 0.06, ty1, ty1 + 0.12, posZ - 0.04, posZ + 0.04, MAT.kasa, 'cihaz');
  const PE = EKRAN.POS, posT = kutu('POS_TABLET', posX - PE.g / 2, posX + PE.g / 2, ty1 + 0.185 - PE.y / 2, ty1 + 0.185 + PE.y / 2, posZ - PE.d / 2, posZ + PE.d / 2, MAT.siyah, 'cihaz');   /* R24 D2: Tab Active5 föy */ posT.rotation.set(-D.POS_EGIM, -Math.PI/2, 0, 'YXZ');   // CSS3D ile aynı (eski −0,35 X ↔ CSS3D ters eğim 'iç içe' görünüyordu)
  /* kiosk (duvar tipi, ayırıcının müşteri yüzünde, +x'e bakar) */
  const [kx0, kx1, kz0, kz1, ky0, ky1] = D.KIOSK;
  /* R24 D2: ekran Samsung QM32C portre (föy 421,9 × 727,3 × 28,5) + VESA 100 duvar askısı; altında ödeme terminali yuvası + fiş ağzı (gövde föyü YOK → VARSAYIM, RAPOR) */
  const KE = EKRAN.KIOSK, kzm = (kz0 + kz1) / 2, kyE0 = ky0 + 0.30;
  kutu('KIOSK_ASKI_VESA100', kx0, kx0 + 0.030, kyE0 + KE.y / 2 - 0.06, kyE0 + KE.y / 2 + 0.06, kzm - 0.06, kzm + 0.06, MAT.kasa, 'cihaz');
  kutu('KIOSK_EKRAN_QM32C', kx0 + 0.030, kx0 + 0.030 + KE.d, kyE0, kyE0 + KE.y, kzm - KE.g / 2, kzm + KE.g / 2, MAT.siyah, 'cihaz');
  kutu('KIOSK_GOVDE', kx0, kx0 + 0.060, ky0, kyE0 - 0.01, kz0, kz1, MAT.kasa, 'cihaz');   // alt ödeme / fiş gövdesi [VARSAYIM]
  kutu('KIOSK_POS_YUVA', kx0 + 0.058, kx0 + 0.10, ky0 + 0.10, ky0 + 0.20, kz0 + 0.12, kz1 - 0.12, MAT.siyah, 'cihaz');
  kutu('KIOSK_FIS_AGZI', kx0 + 0.056, kx0 + 0.064, ky0 + 0.235, ky0 + 0.245, kz0 + 0.14, kz1 - 0.14, MAT.siyah, 'cihaz');
  /* QR-5 (10 Eki, K6): QR kolonundaki 7" ekran KALKTI — teslim yalnız FM430 QR okuyucu + Storm tuş takımı (ikizde tuşlar tıklanır: gezinti.js) */
  /* sipariş panosu 49" şerit (hücre duvarının personel yüzü, +z; VESA askı yalnız personel yüzündeki taşıyıcı profile — koruyucu panel delinmez, ISO 14120) */
  // Menu and waiting status now share the single QR cabinet display.
  /* Kemal R24 (10 Eki gece, YÖNETİCİ onayı D1–D8): aydınlatma, kapı donanımı + açılış, süpürgelik / tavan kenarı / tabela alanı, tesisat uçları, interkom, QR oku, AZM40 → dukkan_v4.js */
  const v4 = dukkanV4(THREE, scene, g, D, kutu, MAT); for (const p of v4.ek) liste.push(p);
  const plan = dukkanPlanKur(THREE,g,D,liste,MAT);
  const temizlik=temizlikKur(THREE,g,liste,MAT,IKIZ);yikama=temizlik.yikama;
  const kapilar=personelKapilarKur(THREE,g,D,liste,MAT,IKIZ);
  const servis=dukkanServisKur(THREE,scene,g,liste,MAT,D,IKIZ);
  const cephe58=dukkanCephe58(THREE,g,D,liste,MAT,IKIZ);
  dukkanKapiD1(THREE,g,D,liste,MAT,IKIZ);   // D1 (22 Eki): gerçek kapı kolu + kasa bindirmesi / fitil
  dukkanKioskD2(THREE,g,liste,MAT,IKIZ);    // D2 (22 Eki): gömme kiosk çerçevesi, açıklıkta boşluk 0
  dukkanPersonel71(THREE,g,D,liste,MAT,IKIZ);   // 29 Eki: sağ köşe, 100 mm duvara uyumlu tabla, 3 çekmece + köşe dolabı
  dukkanFinish29(THREE,scene,g,MAT,IKIZ,kapilar);
  dukkanAccessories29(THREE,scene,g,MAT,IKIZ);
  dukkanKalan29(THREE,scene,g,MAT,IKIZ);
  staffCabinet29(THREE,scene,g,IKIZ,liste);
  dukkanTemiz29(THREE,scene,g,IKIZ);
  shopEquipment30(THREE,scene,g,IKIZ);
  shopSafety30(THREE,scene,g,IKIZ);
  staffStorage31(THREE,g,IKIZ);
  katmanlarKur(THREE,scene,IKIZ);
  const gorunum=()=>{}; // Wall visibility is explicit and independent of walk/orbit mode.
  return {grup:g,liste,gorunum,duvarGizle:hidden=>{plan.gizle(hidden);cephe58.hide(hidden);scene.traverse(o=>{if(o.userData.wallVisibility||o.name==='DUKKAN__MAKINE_ODASI_BEYAZ_KAPLAMA'||o.name==='DUKKAN__KEDI_ARKA_DUVAR')o.visible=!hidden;});const doors=g.getObjectByName('DUKKAN__PERSONEL_KAPILARI');if(doors)doors.visible=!hidden;},temizlik:temizlik.bilgi,servis,guncelle:(cam,dt,walk)=>{servis.update(dt);IKIZ.yikamaDurum=yikama?.update(dt);return kapilar.guncelle(cam,dt,walk);},yikama:()=>yikama,kapilar,v4:v4.say,plan:plan.bilgi};
}

/* CSS3D ekran yerleri (merkez, genişlik m, yön): ekranlar 3B içinde bu noktalarda gerçek sayfayı gösterir */
export function ekranYerleri() {
  const K = D.KIOSK, S = D.SERIT, TZ = D.TEZGAH;
  return [
    { id: 'kiosk', ad: 'Kiosk (32" portre)', konum: [PLAN.sagIc, K[4] + 0.30 + EKRAN.KIOSK.y / 2, (K[2] + K[3]) / 2], genislik: EKRAN.KIOSK.aktif[0], en: 540, boy: 960, yon: -Math.PI / 2, gomme:true, url: '../musteri/index.html?mod=kiosk&hmi=yok', rol: 'musteri' },
    { id:'tv',ad:'QR üstü menü ve sipariş ekranı',konum:[(QR_EKRAN.x0+QR_EKRAN.x1)/2,(QR_EKRAN.y0+QR_EKRAN.y1)/2,QR_EKRAN.z],genislik:QR_EKRAN.aktif[0],en:QR_EKRAN.piksel[0],boy:QR_EKRAN.piksel[1],yon:0,url:'../musteri/qr-ekran.html',rol:'musteri',gomme:true },

    {id:'machine',ad:'Makine personel tableti',konum:[1.05,1.700,.0903],genislik:.1723,en:1024,boy:640,yon:0,gomme:true,url:null,rol:'personel',arka:'tablet'},
    { id: 'pos', ad: 'Kasa tableti (POS)', konum: [2.960-.007*Math.cos(D.POS_EGIM),.985+.007*Math.sin(D.POS_EGIM),2.490], genislik: EKRAN.POS.aktif[0], en: 1024, boy: 640, yon: -Math.PI/2, egim: D.POS_EGIM, url: null, rol: 'personel', arka: 'tablet' },
  ];
}

/* Yürünebilir alanlar (göz noktası; duvar / mobilya + 0,2 m pay). Robot hücresi (z < 1,750) yalnız DOLDURMA rolünde, hücre kapısından.
   3c: cephe iç 2,883 / dış 2,983 · müşteri z 2,283 … 2,683 · kiosk önü x ≥ 3,937 · TV önü x ≤ 5,09 · müşteri kapısı geçişi x 4,51–5,01
   · tezgâh arkası z 1,97 … 2,233 · evye x 2,947 − 0,2 · personel kapısı geçişi x 0,886–1,386 */
export function yurunur(rol) {
  if(rol==='gez')return ()=>true; // Free visual camera; no equipment control or access grant.
  const A = [
    [-0.4, 2.983, 6.6, 8.0],[5.666,1.4,6.6,3.20],         // kaldırım (cephe dışı + 0,2)
    [3.48, 2.305, 5.15, 2.683],     // müşteri bölgesi (kiosk önü … TV önü; QR + 0,2 … cephe iç − 0,2)
    [3.48, 2.60, 5.15, 3.20],        // müşteri kapısı geçişi (sürgülü, x 4,31–5,21)
  ];
  if (['personel','doldurma','patron'].includes(rol)) {
    A.push([.85,D.HUCRE_DUVAR+.20,1.78,2.683],[1.136,2.60,1.386,3.70],[1.78,2.548,2.067,2.683]);
  }
  if (['personel','doldurma'].includes(rol)) A.push([.85,1.20,1.45,2.10],[.85,1.10,5.10,D.HUCRE_DUVAR-.20]);
  return (x,z)=>A.some(([x0,z0,x1,z1])=>x>=x0&&x<=x1&&z>=z0&&z<=z1)&&cephe58Yuru(x,z,rol);

}
