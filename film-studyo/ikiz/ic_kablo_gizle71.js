// İÇ KABLO GİZLE 71 (Kemal 22 Eki: "Kablolar olmasın dedik, her yer kablo, TÜM istasyonlarda var").
// 70'in eksikleri: (1) yalnız istasyon katmanı (A/TOP/F/UF/K/E/B/UKE) taranıyordu → ELK_* / COMMON / ELECTRICAL / POWER
// sınıflı makine içi kablolar kalıyordu; (2) katman paneli / sıfırlama görünürlüğü geri açınca kablolar dönüyordu;
// (3) katalog adları (Leitung, cord, pigtail, M8/M12 uç kablosu, hortum) kalıba girmiyordu.
// Kural: makine zarfı içindeki kablo / kanal / hortum meshleri görünmez. Yalnız görsel — veri, PLC, sinyal SİLİNMEZ.
// Kalır: arka üst ana kanal (y 2133,5 z −879 ± 60 mm), ana hat + K→B iniş (ELK_ANA_HAT*), birleşim fişleri (HARTING/FİŞ/SOKET/connector).
import {katmanSinif} from './katmanlar.js';

const ZARF = {x: [0.725, 5.30], y: [-0.01, 2.215], z: [-0.93, 0.085]};       // makine (dükkân / QR / robot hücresi hariç)
const KABLO = /(kablo|kablaj|cable|harness|iletken|wire|leitung|cord|pigtail|lead_?wire|M(8|12)_?(uc|kablo|cable))/i;
const KANAL = /(kanal|duct|trunking)/i;
const HORTUM = /(hortum|hose|pnomatik_?boru|pneumatic_?tube)/i;
// 70'in korudukları (E kanal gövdesi, hat kanalı, tel bant konveyörü) + birleşim fişleri + ana hat
const KALIR = /(TOP70_ESKI_KABLO_PENCERESI_YAMA|ELK_ANA_HAT|E_REWORK\d+_DUCT|LINE56_KANAL|tel_bant|HARTING|(?:^|_)FIS(?:_|$)|FİŞ|SOKET|PLUG|CONNECTOR|DERINLIK|EKRAN|TABLET)/i;
// istasyonların tasarlanmış DÜZENLİ kanalları kalır (Kemal: "sadece düzenli kablo kanalı olsun"): TOP57 sürücü/pano kanalları,
// F70 ana kanal parçaları + askıları, E dikey/zemin kanalı, A uç kapakları, TOP70 eski pencere yaması (sac). Kablo ve hortum her yerde gizli.
const KANAL_KORU = /^(TOP57_|TOP70_ESKI_KABLO_PENCERESI_YAMA|F70_KANAL|E_DUCT73|E_LAYOUT37|E_SERVICE31|A_CLEAN\d+_DUCT)/;
const DISARI = new Set(['ROB', 'QR', 'SHOP', 'PERSONEL', 'WASH', 'KIOSK']);
const ANA = {y: 2.1335, z: -0.879, pay: 0.06};

function tur(ad) { return KALIR.test(ad) ? null : KABLO.test(ad) ? 'kablo' : HORTUM.test(ad) ? 'hortum' : KANAL.test(ad) ? 'kanal' : null; }
const ici = c => c.x >= ZARF.x[0] && c.x <= ZARF.x[1] && c.y >= ZARF.y[0] && c.y <= ZARF.y[1] && c.z >= ZARF.z[0] && c.z <= ZARF.z[1];
const gorunur = o => { for (let a = o; a; a = a.parent) if (!a.visible && !a.userData.icKabloGizli71) return false; return true; };

// adaylar: [{o, tur, ist}] — ad = kendi adı, kaynak adı ya da en yakın adlı ebeveyn (CAD gövdeleri 'Body1' gibi adlansa da)
export function icKabloSec71(IKIZ, T) {
  const s = IKIZ.sahne.scene, out = []; s.updateMatrixWorld(true);
  s.traverse(o => {
    if (!o.isMesh || o.userData.assemblyDuplicate || o.userData.electricalRetired) return;
    // yalnız kendi adı + kaynak adı (ebeveyn adı gövde sacını yakalıyordu: F_GOVDE__sac altındaki F70_KANAL_DIS ana kanal parçası)
    const adlar = [o.name, o.userData.assemblySourceName].filter(Boolean);
    if (adlar.some(ad => KALIR.test(ad))) return;
    let t = null; for (const ad of adlar) t = t || tur(ad);
    if (!t) return;
    if (t === 'kanal' && KANAL_KORU.test(o.name || '')) return;
    const sinif = katmanSinif(o); if (DISARI.has(sinif.id)) return;
    const b = new T.Box3().setFromObject(o); if (b.isEmpty()) return;
    const c = b.getCenter(new T.Vector3()), sz = b.getSize(new T.Vector3());
    if (!ici(c)) return;
    if (t === 'kanal' && b.min.y >= ANA.y - 0.045 && b.max.z <= -0.77) return;   // arka üst ana kanal koridoru (parçalar, askılar, geçişler)
    if (Math.abs(c.y - ANA.y) <= ANA.pay && Math.abs(c.z - ANA.z) <= ANA.pay && sz.x >= sz.y && sz.x >= sz.z) return;   // arka üst ana kanal
    out.push({o, tur: t, ist: sinif.id});
  });
  return out;
}

// sayım (denetim): görünür kablo / kanal / hortum, istasyon başına
export function kabloSay71(IKIZ) {
  const T = IKIZ.sahne.THREE, r = {kablo: {}, kanal: {}, hortum: {}, toplam_gorunur: 0};
  for (const {o, tur: t, ist} of icKabloSec71(IKIZ, T)) {
    let g = true; for (let a = o; a; a = a.parent) if (!a.visible) g = false;
    if (!g) continue;
    r[t][ist] = (r[t][ist] || 0) + 1; r.toplam_gorunur++;
  }
  return r;
}

export function icKabloGizleKur71(IKIZ) {
  const T = IKIZ.sahne.THREE, durum = IKIZ.icKabloGizle71 = {gizli: 0, tur: {kablo: 0, kanal: 0, hortum: 0}, tarama: 0, geri_acilan: 0};
  const gizli = [];
  let sonSayi = -1, sonT = 0;
  const tara = () => {
    let n = 0; IKIZ.sahne.scene.traverse(() => n++);
    if (n !== sonSayi) {
      sonSayi = n; durum.tarama++;
      for (const {o, tur: t} of icKabloSec71(IKIZ, T)) {
        if (o.userData.icKabloGizli71) continue;
        o.userData.icKabloGizli71 = true; gizli.push(o); durum.gizli++; durum.tur[t]++;
      }
    }
    for (const o of gizli) if (o.visible) { o.visible = false; durum.geri_acilan++; }   // katman paneli / sıfırlama geri açarsa
  };
  // kendi zamanlayıcısı: IKIZ.kancalar yükleme sırasında yeniden kurulduğu için oraya eklenen kanca kayboluyordu (tarama 1'de kalıyordu)
  setInterval(() => { try { tara(); } catch (e) { durum.hata = String(e).slice(0, 200); } }, 500);
  tara();
  return durum;
}

const bekle = () => window.IKIZ?.sahne?.scene && window.IKIZ.kancalar ? icKabloGizleKur71(window.IKIZ) : setTimeout(bekle, 500);
// ?ickablo=goster → kapalı (önce/sonra). window.__icKabloKuru → yalnız sayım.
if (typeof window !== 'undefined' && !window.__icKabloKuru && new URLSearchParams(location.search).get('ickablo') !== 'goster') bekle();
