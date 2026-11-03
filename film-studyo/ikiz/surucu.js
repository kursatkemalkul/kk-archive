/* İKİZ sürücüsü (v2 · ENTEGRASYON eşlemesiyle): `ikiz/durum` + `ikiz/robot` → ikiz-v1 GLB düğümleri. Hiçbir hareket zaman çizelgesiyle sahte yapılmaz.
 - EKSENLER (41 / 44) + HAREKETLİ ÇIKIŞLAR (27) + 12 QR MÜŞTERİ KAPISI + 21 B ÇEKMECESİ (AX_B_*) + ROBOT (ray + 6 kol + tutucu): ENTEGRASYON'un `ikiz-esleme.js` / `ikiz_esleme.json`
   (claude/sabah otonom/hat3d/ikiz-v1) — bu dosya yalnız çağırır ve 3B'nin GÖSTERDİĞİNİ programla karşılaştırır (`IKIZ.fark()`).
 - ROBOT eklemleri robot siminin `ikiz/robot` yayınından (eklem 6 rad · ray_m · gripper); ray: RailJoint d = ray_m − 1,176 m (rig.json rail_min).
 - ÜRÜNLER: `urunler[]` (tur · reçete · yer · ilerleme) → `urunKonum()` (ENT) ile konum; her ürün için ilgili model parçasının kopyası o konumda görünür.
 Eşlemede karşılığı olmayan adlar `IKIZ.eksikler`de (ENT'in `eksik` listesi nedenleriyle). */
import { gorselKare27, kIticiTemas28 } from './frame27.js';
import { hamurBezeKur, hamurPozUygula } from './hamur_beze.js';
import { cekmeceStokKur } from './cekmece_stok.js';
import { servisKur } from './servis.js';
import { toppingParcaKur } from './topping_parca.js';
import { kHortumKur } from './k_hortum.js';
import { kYagIziKur } from './k_yag_izi.js';
import { kUrunSablon } from './k_urun.js';
import { eKartonKur } from './e_karton.js';
import { kMekanikKur } from './k_mekanik.js';
import { kSpreyKabloKur } from './k_sprey_kablo.js';
import { robotTutucuKur } from './robot_tutucu.js?v=44-1';
import { robotKabloKur } from './robot_kablo.js';
import { eCopKur } from './e_cop.js';
import { qrKapakEsle,qrDonanimKur,qrDerinlikKur } from './qr_donanim.js?v=44-1';
export function surucuKur({ THREE, kok, IKIZ, E, ENT, urunGorsel }) {
  IKIZ.eCop=eCopKur(THREE,kok);
  qrDerinlikKur(THREE,kok);
  qrKapakEsle(E);
  const eksik = IKIZ.eksikler;
  const ekle = s => { if (!eksik.includes(s)) eksik.push(s); };
  // kutu_cad_v13.corner_translation = kafa − H_UST + corner_lift:
  // kaldırma pistonun aşağı hareketine EKLENİR; ham klipten çıkan −Y yanlıştı.
  for (const k of E.eksen.AX_E_KOSE_KALDIR?.katkilar || []) {
    if (k.tur === 'oteleme') k.yon_dunya = [0, 1, 0];
  }
  // Sabit HGR15 raylar, motor ve vida mili kafa ile aşağı inmez.
  // E_PISTON ailesinin yalnız __PISTON işaretli kızak/kafa parçaları taşınır.
  for (const k of E.eksen.AX_E_PISTON?.katkilar || []) {
    k.dugumler=(k.dugumler||[]).filter(n=>!n.startsWith('E_PISTON__')||n.endsWith('__PISTON'));
  }
  // Ön parmak programda −90 → +90 giderken fiziksel üstten içe katlar.
  // Ham klibin işareti, makinenin program ekseniyle ters yöndedir.
  for (const k of E.eksen.AX_E_PARMAK?.katkilar || []) {
    if(k.tur==='donme')k.olcek=-1;
  }
  // VAC_Y kaynak modelde kartona temas kotunda çizilmiş. Silindir 20 mm
  // düşeydir; besleme arabasının 411 mm yatay hareketiyle karıştırılmamalı.
  const eVacNodes = new Set();
  for (const k of E.cikis.DO_E_Z_SILINDIR?.katkilar || []) {
    if (k.tur !== 'oteleme') continue;
    k.yon_dunya = [0, -1, 0]; k.model_strok_mm = 20;
    for (const n of k.dugumler || []) eVacNodes.add(n);
  }
  for (const n of eVacNodes) { const o=kok.getObjectByName(n); if(o) o.position.y += .020; }
  IKIZ.kMekanik = kMekanikKur(THREE, kok, E);
  const ik = ENT.ikizKur(kok, E, THREE);
  const robotTutucuUygula=robotTutucuKur(THREE,kok,IKIZ);
  const robotKabloUygula=robotKabloKur(THREE,kok,IKIZ);
  const qrDonanimUygula=qrDonanimKur(THREE,kok,E,IKIZ);
  const eKartonUygula = eKartonKur({ THREE, kok, E, IKIZ });
  IKIZ.malzemeEz = ik.malzeme_ez || null;                                    // ENT 60031d60: buzlu QR kapak camı vb. [{desen, sayi}]
  for (const x of E.eksik || []) ekle(`${x.ad}: ${x.neden}`);
  for (const n of ik.eksik) ekle('eşleme düğümü sahnede yok: ' + n);
  const dugum = ik.dugum;
  const RAIL_MIN = (E.robot.ray.sinir_m || [1.176])[0];
  const RAY_MUTLAK = !!E.tutucu_glb;                                          // ENT ikiz-v2: ray_konum = MUTLAK ray mm (x = dinlenme + (mm − RAY0) / 1000); v1: dinlenmeden göreli

  /* ------------------------------------------------------------ robot: `ikiz/robot` (robot simi) çerçeveye katılır */
  /* C 11 Eki 06:5x: robot simi 9689b7be dogrulandi=false'u farklı nedenlerle verir (not_ alanı): R27 hız sınırı (föy hızıyla — aşım DEĞİL) · çarpışma denetimsiz geçiş / PARK geçişi ·
     diğer (IK / A yükleme). HUD tek oran yerine nedene göre ayırır. */
  const robot = { son: null, sayi: 0, gecersiz: 0, neden: { hiz: 0, gecis: 0, diger: 0 } };
  const N_HIZ = ['HIZ_SINIRI'], N_GECIS = ['DENETIMSIZ_GECIS', 'DENETIM_GECMEDI', 'DENETIM_YOK', 'PARK'];   // Robot robot_simi/5 (1e4695d1): dogrulama_neden listesi — önce o, yoksa not_ metni
  const robotNeden = r => { const L = Array.isArray(r.dogrulama_neden) ? r.dogrulama_neden : null;
    if (L && L.length) return L.some(x => N_GECIS.includes(x)) ? 'gecis' : L.every(x => N_HIZ.includes(x)) ? 'hiz' : 'diger';
    const n = String(r.not_ || r.neden || ''); return /hız sınırı|hiz siniri/i.test(n) && !/denetimsiz|PARK geçişi|karışım/i.test(n) ? 'hiz' : /denetimsiz|PARK geçişi|karışım|geçiş/i.test(n) ? 'gecis' : 'diger'; };
  function robotPoz(r, ciz = true) { if (r && Array.isArray(r.eklem) && r.eklem.length === 6) { robot.son = r; robot.sayi++; if (r.dogrulandi === false) { robot.gecersiz++; robot.neden[robotNeden(r)]++; } if (ciz && IKIZ.son && IKIZ.zamanModu !== 'kayit') uygula(IKIZ.son); } }
  // Kayıt robotu ve ürünleri AYNI kareden uygular; canlı IKIZ.son buraya karışmaz.
  let kareKesin = false;
  function kareUygula(f, r) {
    // Live, timeline and scenario replay share ONE projected snapshot. Raw PLC
    // recordings omit visual DC aliases; stock and the new assembly must not
    // receive different frames (drawer contents used to leave a closed front).
    f = gorselKare27(f); IKIZ.goruntuKaresi = f;
    robot.son = Object.hasOwn(f, 'robot_poz') ? f.robot_poz : (r || null); kareKesin = true; try { uygula(f); } finally { kareKesin = false; } }

  /* ------------------------------------------------------------ ürünler (10 Eki · PAKET_10EKI: ELESTIRMEN-EK1 / EK2 / EK3 / EK4 / 10 · K-E-KODPANEL-4 — tek sahip: bu işlev)
     · ölçek: web GLB şablonları 'gizli' duruşta 0,0001 ölçekli → kopyada ölçek + dönüş sıfırlanır (pide 276 mm görünür)
     · TABAN SÖZLEŞMESİ: ürünün bbox ALT yüzü yüzeye oturur (TABLA bant üstü · F / K / E_GIRIS yüzey kotu · E karton üstü · göz rafı + 1,5 mm); robot elinde merkez
     · BİÇİM: u.bicim (beyin) varsa o; yoksa top (tabla 'bekliyor' / reçetesiz) → açık (tabla basıldı, yükleme bandı, fırın) → pişmiş (fırın sonu, K, E, robot, göz; ton koyulaşır)
       → kesik (K'de ilk 'kesiliyor' anı, sonra yapışkan; LAHMACUN KESİLMEZ — K8)
     · F_YBANT (yükleme bandı, ENT tablosunda yok): fırın girişi − 150 mm [V F_YBANT_FIRIN_MM] + ilerleme_mm
     · E: E_KUTU.icerik E kartonunun üstünde (lahmacunda iki ürün x ± 0,07); kapak kapanınca içerik gizlenir; E kartonu (E_KUTU__B_ROOT) yalnız durumda E_KUTU varken görünür
     · TEK KUTU: KUTU ilk kez robotta görülünce E kartonunun O ANKİ şekli (E_KUTU__B_ROOT alt ağacı) dondurulur → robot ucuna bağlanır (devir anında sıçrama yok) → aynı nesne göze geçer
     · ELDE: ürün robot ucunun dönüşünü izler (alındığı andaki göreli duruş korunur) · GÖZ: kutu x gx0 + 5 … 325, z merkez 1,912; kola / tatlı yandaki şeritte (kola önde, tatlı arkada) */
  const U = E.urun.dugum;
  /* A 15:4x: ROBOT25_PRODUCT_Cola / _Dessert ana GLB'de çekmecedeki STOK yığını (475 × 598 mm) → tek ürün şablonu ENT tutucu GLB'sinden (URUN_*: kola Ø65,5 × 115 · tatlı 65 × 60 · kutu 45 × 320 × 320) */
  const kaynakAd = {}; for (const [t, ad] of [['ICECEK', ['URUN_Cola', 'ROBOT25_PRODUCT_Cola']], ['TATLI', ['URUN_Dessert', 'ROBOT25_PRODUCT_Dessert']], ['KUTU', ['URUN_Box', 'ROBOT25_PRODUCT_Box']]]) kaynakAd[t] = ad.find(n => kok.getObjectByName(n)) || ad[1];
  const hamurBeze = urunGorsel.models.hamur;
  const urunMarkalari = new Map();
  const icecekMarka = d => d==='K6_IC1'?'Fanta':d==='K6_IC2'?'Sprite':'Coca-Cola';
  const sablon = ad => { if(ad==='URUN_28_LAHM')return urunGorsel.models.lahm;if(ad.startsWith('URUN_28_CAN:'))return urunGorsel.models[ad.split(':')[1]];if(ad===kaynakAd.ICECEK)return urunGorsel.models['Coca-Cola'];if(ad===kaynakAd.TATLI)return urunGorsel.models.tatli;if(ad===U.HAMUR_TOP)return hamurBeze; const o = dugum[ad] || kok.getObjectByName(ad); if (!o) { ekle('ürün düğümü yok: ' + ad); return null; } return o; };
  const gizle = new Set([U.PIDE, U.LAHMACUN, U.HAMUR_TOP, U.PIDE_KESIK, U.LAHMACUN_KESIK, ...Object.values(U.MALZEME || {}).flat(), ...(U.LAHMACUN_HARC || []), 'ROBOT25_PRODUCT_Dough', 'ROBOT25_PRODUCT_Cola', 'ROBOT25_PRODUCT_Dessert', 'ROBOT25_PRODUCT_Box']);
  for (const n of gizle) if (dugum[n]) dugum[n].visible = false;            // statik duruşlar ekranda kalmaz: ürün yalnız programın dediği yerde görünür
  const urunGrup = new THREE.Group(); urunGrup.name = 'IKIZ_URUNLER'; kok.add(urunGrup);
  const cStok = cekmeceStokKur({ THREE, kok, IKIZ, sablon, U, kaynakAd });
  const servis = servisKur({ THREE, IKIZ, kok });   // Kemal R25 / R26: tur + sihirbaz paneli, hedef çekmece vurgusu, personel silüeti, kaset dışarıda   // YÖNETİCİ 22:5x: çekmecede adet kadar tek tek hamur (A+B 139i ızgarası)
  const kopya = new Map(), kesildi = new Set(), kutuKlon = new Map();
  const yagIziUygula = kYagIziKur(THREE);
  const bb = new THREE.Box3(), mrk = new THREE.Vector3(), _A = new THREE.Matrix4(), _B = new THREE.Matrix4();
  const _kp = new THREE.Vector3(), _kq = new THREE.Quaternion(), _k1 = new THREE.Vector3(1, 1, 1), _ks = new THREE.Vector3(), ELDE_ARA_ESIK = 0.002;   // elde kilidi: ara kare eşiği (rad / m)
  const UY = (E.urun || {}).yer || {};
  const yuzeyY = ad => { const o = kok.getObjectByName(ad); if (!o) return null; kok.updateMatrixWorld(true); return new THREE.Box3().setFromObject(o).max.y; };
  // TOPPING düzeltme (11 Eki akşam, S3): ürün tabanı BANT ÜSTÜ (TABLA__BANT kutusu üstü y 1,0000) — TABLA düğümünün kutu üstü 1,0059 bantın yan kılavuzlarıdır (pide izinde r ≤ 140 tabla yüzeyi ≤ 0,984 + bant);
  // eski ölçüm kılavuz üstünü bant sanıyordu → pide bant üstünde 5,9 mm havada (ek GLB bantı da gizliyordu: ikiz.js çocuk taşıma).
  const TABLA_UST = (() => { const T = kok.getObjectByName((UY.TABLA || {}).bagli_dugum || 'TOPPING_DONER__TABLA'); let bant = null; if (T) T.traverse(o => { if (!bant && /__BANT$/.test(o.name || '')) bant = o; });
    return bant ? yuzeyY(bant.name) : yuzeyY((UY.TABLA || {}).bagli_dugum || 'TOPPING_DONER__TABLA'); })();
  IKIZ.tablaUst = TABLA_UST;
  const E_KOK = kok.getObjectByName('E_KUTU__B_ROOT'), E_UST = yuzeyY('E_KUTU__B_ROOT'); // karton üstü (≈ 0,9832)
  /* C 20:1x: tutucu GLB'deki URUN_Box'ta malzeme yok (GLTFLoader varsayılanı: gri, metal 1) → E kartonunun kraft malzemesi (ME_E_KUTU__karton) */
  const KRAFT = (() => { let m = null; if (E_KOK) E_KOK.traverse(x => { if (!m && x.isMesh && x.material && !Array.isArray(x.material)) m = x.material; }); return m; })();
  if (KRAFT && kaynakAd.KUTU === 'URUN_Box') { const b_ = kok.getObjectByName('URUN_Box'); if (b_) b_.traverse(x => { if (x.isMesh && (!x.material || !x.material.name)) x.material = KRAFT; }); }
  IKIZ.kutuMalzeme = () => { const b_ = kok.getObjectByName(kaynakAd.KUTU), a = []; if (b_) b_.traverse(x => { if (x.isMesh) a.push(x.material && x.material.name); }); return a; };
  const ARAC = (UY.ROBOT || {}).bagli_dugum ? kok.getObjectByName(UY.ROBOT.bagli_dugum) : null;
  const F0 = UY.F && UY.F.dogru_m ? UY.F.dogru_m[0] : null, YBANT_FIRIN = 0.150;
  const URUN_YARI = 0.150, FIRIN_GIRIS = 0.360;    // TUR 3: program recete K_URUN_MM / 2 · F_YBANT_FIRIN_MM (fotosel 2,522 → TP10 bandı girişi 2,882)
  const GX_ = [[3.769, 4.244], [4.256, 4.731], [4.743, 5.218]], GY_ = [0.588, 0.850, 1.112, 1.374], KUTU_Z = 1.912;
  const KARTON = 0.0015;
  const ITICI_YUZ0 = 4.2915, ITICI_PIDE_R = 0.150, K_ILERLET_MM = 230.0;   // G/Ç 0caf043c SON KARAR (recete ITICI_YUZ_X0 4260, ITICI_STROK_X_MM 250, K_ILERLET_MM 230): kesim 4200 → bant +230 (merkez 4430) → yüz 4260 → 4510, pide merkezi yüzün 150 mm önünde (4660 = E kalıp merkezi)
  const iticiTemas = kIticiTemas28;
  IKIZ.iticiIz = [];                                                         // G/Ç 0caf043c itme ölçümü (surucu urun konumu: SX_K_ITICI_X > 0 kareleri)
  const GOZ_TUR = (UY.GOZ && UY.GOZ.konum_tur_m) || null;                  // yoksa (ikiz-v1) eski sabit tablo
  function bicim(u) {
    if (u.bicim) return u.bicim;
    const y = String(u.yer).toUpperCase();
    if (!u.recete || (y === 'TABLA' && u.durum === 'bekliyor')) return 'top';
    if (y === 'ROBOT' && u.tur === 'HAMUR') return 'top';                    // robot hamuru B'den tablaya TOP olarak taşır (açıcı tablada basar)
    if (y === 'K' && (u.kesildi === true || (u.kesildi === undefined && /kesil/.test(u.asama || '')))) kesildi.add(u.id);   // K-E-KODPANEL-1: beynin kesildi alanı (bıçak SX ≥ 120 mm)
    const pisti = y === 'F' ? (u.ilerleme || 0) >= 0.999 : ['K', 'E', 'E_KUTU', 'E_GIRIS', 'ROBOT', 'KUTU'].includes(y) || /^G\d/.test(y);
    if (u.recete !== 'lahmacun' && (kesildi.has(u.id) || (pisti && y !== 'K' && y !== 'F'))) return 'kesik';   // K'yi geçmiş pide kesiktir (kare kaçsa da)
    return pisti ? 'pismis' : 'acik';
  }
  function urunSablon(u, sekil) {
    if (u.tur === 'HAMUR') {
      const lahm = u.recete === 'lahmacun';
      if (sekil === 'top') return lahm ? urunGorsel.models.lahm : hamurBeze;
      return kesikPide(u.boy_mm ?? 300, !lahm, lahm);
    }
    if (u.tur === 'KUTU' && kutuKlon.has(u.id) && (kaynakAd.KUTU !== 'URUN_Box' || E.blank)) return kutuKlon.get(u.id);
    if(u.tur==='ICECEK')return urunGorsel.models[urunMarkalari.get(u.id)||'Coca-Cola'];
    return kaynakAd[u.tur] ? sablon(kaynakAd[u.tur]) : null;
  }
  const _kesik = new Map();
  function kesikPide(length, cut, lahm) {
    const key = [length, cut, lahm].join(':');
    if (!_kesik.has(key)) _kesik.set(key, kUrunSablon(THREE, sablon(lahm ? U.LAHMACUN : U.PIDE), length, cut));
    return _kesik.get(key);
  }
  function kartonDondur() {                                                    // E kartonunun o anki şekli (dünya duruşuyla) — tek kutu kimliği
    if (!E_KOK) return null; E_KOK.updateMatrixWorld(true); const g = new THREE.Group(); g.name = 'IKIZ_KUTU_KARTON';
    E_KOK.traverse(m => { if (!m.isMesh) return; const c = new THREE.Mesh(m.geometry, m.material); m.matrixWorld.decompose(c.position, c.quaternion, c.scale); g.add(c); });
    return g.children.length ? g : null;
  }
  let kapaliKarton = null;
  function kapaliKartonKur(f) {
    if (!E.blank || kapaliKarton) return;
    // Taşınan kutu yeni beslenen levhadan klonlanamaz. Zaman çizgisinde doğrudan
    // alım karesine gidilse de aynı bitmiş kartonu üret; makine karesi aşağıda geri uygulanır.
    const acilar = Object.fromEntries(E.blank.dugumler.map(j =>
      [j.ad.slice('E_KUTU__'.length), j.parcalar.at(-1).aci[1]]));
    const d = { ...f, e_kutu_t: E.blank.robot.t_gercek - 1e-6,
      fb: { ...f.fb, E: { adim: 40 } },
      eksenler: { ...f.eksenler, AX_E_DESTEK: 45.6 },
      urunler: [{ tur: 'E_KUTU', kapali: true, acilar }] };
    ik.uygula(d); robotKabloUygula(f); eKartonUygula(d);
    kapaliKarton = kartonDondur();
  }
  /* YÖNETİCİ / Kemal 11 Eki (TABLA + TOPPING (d)): siparişteki malzeme tabla üstünde GÖRÜNÜR. ENT şablonları (ikiz_esleme urun.dugum.MALZEME): spiral kasetlerde 4 halka
     (_0 dış r 125 → _3 iç r 35), harç / püre 6 dilim (1 tam tur). Reçete → kaset ve doz penceresi programdan (makine/recete.py 2dfb9c36: RECETELER, X_DOZ (HARC 298,5 → 286) x_baş → x_bit, dünya − 1436).
     Spiral doz (R6): tabla X'i x_baş → x_bit giderken nozül dıştan içe → ilerleme p = (X − x_baş) / (x_bit − x_baş), halka i görünür ⇔ p > i / 4.
     Yayıcı (HARC, SOS; x sabit): dozlama aşamasında tablanın döndüğü açı / 360 → dilim j görünür ⇔ açı > j · 60°. Malzeme ürünün çocuğu: fırına, K'ya, kutuya birlikte gider. */
  const REC_KASET = { kasarli: ['KASAR'], kiymali: ['KIYMA_ORTA'], kusbasili: ['KUSBASI'], sucuklu: ['KASAR', 'SUCUK'], patatesli: ['SOS'], tavuklu: ['KIYMA'], lahmacun: ['HARC'] };
  // TOPPING düzeltme (11 Eki akşam, G/Ç claude-yazilim-yerel): X_DOZ = hesap v3 (dıştan içe; önce kenar halkası X = x_baş'ta 1 tur, sonra spiral x_baş → x_bit)
  const X_DOZ = { HARC: [286.0, 286.0], SOS: [823.5, 823.5], KIYMA: [272.05, 162.25], KUSBASI: [524.05, 414.25], KASAR: [547.74, 652.85], SUCUK: [771.47, 851.5], KIYMA_ORTA: [589.7, 477.49] };
  const KASET_SABLON = { KASAR: 'KASAR', SUCUK: 'SUCUK', KIYMA_ORTA: 'KIYMA', KIYMA: 'KIYMA', KUSBASI: 'KUSBASI', SOS: 'SOS', HARC: 'HARC' };   // ENT: düğüm adları eski kaset adlarıyla (KIYMA_ORTA = kıyma)
  const DOZ_ASAMA = /dozlan|hızlan|yavaşl/;
  const topDurum = new Map(); IKIZ.toppingDurum = topDurum;
  IKIZ.toppingParca = toppingParcaKur({ THREE, IKIZ, kok });
  function toppingUygula(u, k, f) {
    if (IKIZ.toppingParca && IKIZ.toppingParca(u, k, f, REC_KASET[u.recete])) return;      // TOPPING düzeltme (11 Eki): yuvarlak hamur + gram yoğunluklu parça malzeme (topping_parca.js)
    if (!k || u.tur !== 'HAMUR') return; const kas = REC_KASET[u.recete]; if (!kas) return;
    let z = topDurum.get(u.id); if (!z) { z = { p: {}, aciSon: null }; topDurum.set(u.id, z); }
    const yer = String(u.yer).toUpperCase(), ek = f.eksenler || {}, X = +ek.AX_TOP_X, A = +ek.AX_TOP_TABLA;
    if (yer === 'TABLA' && DOZ_ASAMA.test(String(u.asama || '')) && isFinite(X)) {
      for (const K of kas) { const [x0, x1] = X_DOZ[K] || []; if (x0 == null) continue;
        if (x0 !== x1) { const lo = Math.min(x0, x1) - 3, hi = Math.max(x0, x1) + 3; if (X >= lo && X <= hi) z.p[K] = Math.max(z.p[K] || 0, /dozlan/.test(String(u.asama || '')) ? 0.001 : 0, Math.min(1, (X - x0) / (x1 - x0))); }   // kenar halkası (X = x_baş) sırasında dış halka görünür
        else if (Math.abs(X - x0) < 15) {   // yayıcı: x sabit (program sürümünde 298,5 → 286 değişti; ±15 mm pay)
          const h = Math.abs(+(f.eksen_hiz || {}).AX_TOP_TABLA || 0), t = +f.t || 0;   // dönen açı = ∫ tabla hızı (dev/dk × 6 °/s) dt — ×10'da kare başına açı > 180° olabilir, açı farkı yanıltır
          if (z.aciSon != null && t > z.aciSon.t) z.p[K] = Math.min(1, (z.p[K] || 0) + (z.aciSon.h + h) / 2 * 6 * (t - z.aciSon.t) / 360); z.aciSon = { t, h }; } }
    } else z.aciSon = null;
    if (yer === 'TABLA') z.tablada = true;
    if (z.tablada && (yer !== 'TABLA' || u.durum === 'dozlandi')) for (const K of kas) z.p[K] = 1;   // dozaj bitti (program 'dozlandi' / tabladan çıktı): malzeme tam
    const lahm = u.recete === 'lahmacun';
    let g = k.o.getObjectByName('IKIZ_TOPPING'); const imza = kas.map(K => K + ':' + Math.ceil((z.p[K] || 0) * 6 - 1e-6)).join(',');
    if (g && g.userData.imza === imza) return; if (g) k.o.remove(g);
    const wrapper = k.o.children[0]; if (!wrapper) return;
    const ana = /^IKIZ_(K_DISK|KESIK_PIDE)$/.test(wrapper.name) ? wrapper.children[0] : wrapper;
    g = new THREE.Group(); g.name = 'IKIZ_TOPPING'; g.userData.imza = imza;
    for (const K of kas) { const pk = z.p[K] || 0; if (pk <= 0) continue;
      const L = K === 'HARC' && lahm ? (U.LAHMACUN_HARC || []) : ((U.MALZEME || {})[KASET_SABLON[K]] || []); const n = L.length; if (!n) continue;
      const kac = Math.min(n, Math.ceil(pk * n - 1e-6));
      for (let i = 0; i < kac; i++) { const s_ = sablon(L[i]); if (!s_) continue; const c = s_.clone(true); c.traverse(x => { x.visible = true; });
        c.position.copy(ana.position); c.quaternion.copy(ana.quaternion); c.scale.copy(ana.scale); g.add(c); } }
    if (k.o.userData.bicim === 'pismis' || k.o.userData.bicim === 'kesik') pismisYap(g);
    k.o.add(g); IKIZ.toppingCiz = (IKIZ.toppingCiz || 0) + 1;
  }
  const pismisMat = new Map();
  function pismisYap(o) { o.traverse(x => { if (!x.isMesh || !x.material) return; const ms = Array.isArray(x.material) ? x.material : [x.material];
    x.material = ms.map(mt => { if (!pismisMat.has(mt)) { const c = mt.clone(); if (c.color) c.color.lerp(new THREE.Color(0x9a5a24), 0.38).multiplyScalar(0.9); pismisMat.set(mt, c); } return pismisMat.get(mt); });
    if (x.material.length === 1) x.material = x.material[0]; }); }
  function konumBul(u, f) {                                                    // Seçilen kare, canlı IKIZ.son değil.
    const y = String(u.yer).toUpperCase();
    /* TOPPING TUR 3 (Kemal 11 Eki gece: 'fırına yanaşırken pide ileri geri yapıyor, ışınlanıyor'): eski eşleme F_YBANT'ta merkez = 2,522 + ilerleme (0 → 150) ve F'te 2,672'den başlıyordu;
       program ilerlemeyi aktarma SONUNDAN sayıyordu → tabla bandı pideyi 2,667'ye taşıyor, F_YBANT'ın ilk karesi 2,522'ye (−145 mm) geri atıyor, 150 mm ileri gidip F'te yine 2,672'ye (−145 mm) dönüyordu.
       Şimdi (G/Ç tur3): ilerleme = ön kenarın fotoseli (bant BAŞI x 2,522) geçtiğinden beri yükleme bandı yolu → merkez = 2,522 − 0,150 (yarım ürün) + ilerleme: aktarma sonunda 294,9 → 2,6669 = tabla merkezi
       2,3654 + 0,3015 (sürekli); fırına giriş ilerleme 360 → 2,7324 (ön kenar TP10 bandı girişi 2,882). */
    if (y === 'F_YBANT') { const d0 = UY.F_YBANT && UY.F_YBANT.dogru_m ? UY.F_YBANT.dogru_m[0] : (F0 ? [F0[0] - YBANT_FIRIN, F0[1], F0[2]] : null); if (!d0) return null;
      return { p: new THREE.Vector3(d0[0] - URUN_YARI + (u.ilerleme_mm || 0) / 1000, d0[1], d0[2]), taban: d0[1] }; }
    if ((y === 'K' || y === 'E_KUTU') && Number.isFinite(u.x_mm) && Number.isFinite(u.taban_mm)) return {p:new THREE.Vector3(u.x_mm/1000,u.taban_mm/1000,-.206),taban:u.taban_mm/1000,egim:u.egim_deg||0};
    if (y === 'E_KUTU') { const e = UY.E && UY.E.konum_m; if (!e) return null; const kutu=(f.urunler||[]).find(x=>x.tur==='E_KUTU'), taban=u.taban_mm!=null?u.taban_mm/1000:(E_UST??e[1])+(kutu?.kok_mm?.[1]||0)/1000; return { p: new THREE.Vector3(e[0] + (u._dx || 0), taban, e[2]), taban }; }
    const m = /^(?:QR|G)(\d+)$/.exec(y);
    if (m && GOZ_TUR) {                                                        // ELESTIRMEN-EK2 / ROBOT-TUTUCU-3 (ENT ikiz-v2): göz başına tür tabanı eşlemeden — tek kaynak (Öneri B / v8 gelince kendiliğinden)
      const g = GOZ_TUR['G' + String(+m[1]).padStart(2, '0')]; const t = g && (g[u.tur] || g.KUTU); if (!t) return null;
      return { p: new THREE.Vector3(t[0], t[1], t[2]), taban: t[1] };
    }
    if (m) {
      const n = +m[1], c = (n - 1) % 3, b = Math.floor((n - 1) / 3); if (!GX_[c] || GY_[b] == null) return null; const gx0 = GX_[c][0];
      const x = u.tur === 'KUTU' ? gx0 + 0.005 + 0.160 : gx0 + 0.330 + 0.0725, z = u.tur === 'KUTU' ? KUTU_Z : u.tur === 'ICECEK' ? 1.990 : 1.835;
      return { p: new THREE.Vector3(x, GY_[b], z), taban: GY_[b] + (u.tur === 'KUTU' ? 0 : KARTON) };
    }
    /* YÖNETİCİ 11 Eki (ODAK O4): fırın çıkışı sıçramasın — F doğrusu ENT F girişi → K BAŞI (ürün merkezi, 3,860) arasında (F→K 130 → 11 mm); ENT eşlemesi düzelince (tam v4b) aynı değerler */
    /* TUR 3: F girişi = yükleme bandının bıraktığı yer (2,522 − 0,150 + 0,360 = 2,7324); ilk ortak_mm (263) fırın bandı hızında (program F_YBANT de bu hızda — iki bant eş hız, ürün bant yoluyla),
       kalan yol K başına (3,862) çıkış zamanına doğrusal. Program bant_mm göndermiyorsa eski doğru. */
    if (y === 'F' && UY.F && UY.F.dogru_m && u.bant_mm != null && u.cikis_mm > u.ortak_mm) { const d0 = UY.F_YBANT && UY.F_YBANT.dogru_m ? UY.F_YBANT.dogru_m[0] : UY.F.dogru_m[0], a = UY.F.dogru_m[0];
      const kb_ = UY.K && UY.K.bant && UY.K.bant.baslangic_m, b_ = kb_ ? [4.200 - (188 + (u.boy_mm ?? 300) / 2) / 1000, kb_[1], -0.170] : UY.F.dogru_m[1], x0 = d0[0] - URUN_YARI + FIRIN_GIRIS, ov = u.ortak_mm / 1000, d = +u.bant_mm / 1000;
      const x = d <= ov ? x0 + d : x0 + ov + (b_[0] - x0 - ov) * Math.min(1, (d - ov) / ((u.cikis_mm - u.ortak_mm) / 1000)), t = Math.max(0, Math.min(1, (x - a[0]) / (b_[0] - a[0])));
      const pf = new THREE.Vector3(x, a[1] + (b_[1] - a[1]) * t, a[2] + (b_[2] - a[2]) * t); return { p: pf, taban: pf.y }; }
    if (y === 'F' && UY.F && UY.F.dogru_m) { const a = UY.F.dogru_m[0], kb =   /* başlangıç ENT F girişi (2,661): F_YBANT'ın 2,845 sonu programın yükleme bandı yolundan (~150 mm) uzun → 178–319 mm atlıyordu */
      UY.K && UY.K.bant && UY.K.bant.baslangic_m, b_ = kb ? [4.200 - (188 + (u.boy_mm ?? 300) / 2) / 1000, kb[1], -0.170] : UY.F.dogru_m[1];
      const t = Math.min(1, Math.max(0, u.ilerleme_mm != null && UY.F.uzunluk_mm ? u.ilerleme_mm / UY.F.uzunluk_mm : (u.ilerleme || 0)));
      const pf = new THREE.Vector3(a[0] + (b_[0] - a[0]) * t, a[1] + (b_[1] - a[1]) * t, a[2] + (b_[2] - a[2]) * t); return { p: pf, taban: pf.y }; }
    const p = ENT.urunKonum(E, u, kok, THREE, f); if (!p) return null;
    if (y === 'ROBOT') return { p, taban: null, elde: true };
    /* K-E-KODPANEL-1 (3): fırın çıkışından sıçramasın. Kemal R11 (10 Eki gece): 277,5 eski fotosel düzeninden (K_GIRIS 260) kalmıştı → program pideyi kesme konumunda
       (recete.K_GIRIS_MM = 340: giriş fotoseli → kesme konumu; ölçülen duruş 335,4) durdururken 3B'de pide bıçağın (K_KESICI merkezi x 4,200) 58 mm ötesindeydi. */
    if (y === 'K' && u.ilerleme_mm != null) {
      const durus = 188 + (u.boy_mm ?? 300) / 2;
      p.x = 4.200 + (Math.min(durus + K_ILERLET_MM, Math.max(0, +u.ilerleme_mm)) - durus) / 1000;
      // Giriş kılavuzları ürünü z−170'ten kesici ekseni z−206'ya getirir.
      p.z = -0.170 - 0.036 * Math.min(1, Math.max(0, +u.ilerleme_mm / 100));
    }
    // G/Ç 0caf043c: itici yüzü x 4,260 + SX_K_ITICI_X (250); pide merkezi yüzün 150 mm önünde (yüz 4,510 → merkez 4,660 = E kalıp merkezi). Pide yalnız yüz değince kayar.
    // ENT ikiz-v4 K.bant (f33a8582: 3860 + ilerleme) 570'e kadar bununla AYNI; itme sırasında bant dönmeye devam eder (ilerleme > 570) → üst sınır burada, pide iticiden kaçmaz
    let bantX_ = null;
    if (y === 'K' && u.ilerleme_mm != null) { const sx = Math.max(0, +(silAnlik.SX_K_ITICI_X || 0)), yuzX = ITICI_YUZ0 + sx / 1000, bantX = p.x; bantX_ = bantX; if (iticiTemas(f) && sx > 0.5) p.x = Math.max(bantX, yuzX + (u.boy_mm ?? 300) / 2000);
      if (sx > 0 && IKIZ.iticiIz.length < 400) IKIZ.iticiIz.push({ t: +(+IKIZ.sonUygulanan || 0).toFixed(2), id: u.id, sx: +sx.toFixed(1), bant_x: +bantX.toFixed(4), yuz_x: +yuzX.toFixed(4), pide_x: +p.x.toFixed(4), ilerleme: +u.ilerleme_mm }); }   // itme ölçümü: itme başı pide merkezi (4,430) + pide–yüz teması
    if (y === 'TABLA' || y === 'A') return { p, taban: TABLA_UST != null ? TABLA_UST : p.y };
    return { p, taban: p.y, bantX: bantX_ };
  }
  const elBekle = {}, elBekleyen = new Set(), birakti = new Set(); let sonElde = null;
  let eKatliKap = null; IKIZ.kutuAlimBicim = [];                          // F1: robot kutuyu tutarken E'de katlı kutu mu (levha mı) göründü
  function eKatliUygula(goster, f) {
    if (!eKatliKap && goster) { const s = sablon(kaynakAd.KUTU); const e = UY.E && UY.E.konum_m;
      if (s && e) { const o = s.clone(true); o.traverse(x => { x.visible = true; }); o.position.set(0, 0, 0); if (Math.max(o.scale.x, o.scale.y, o.scale.z) < 0.01) o.scale.set(1, 1, 1);
        const kap = new THREE.Group(); kap.name = 'IKIZ_E_KATLI_KUTU'; kap.add(o); o.updateMatrixWorld(true); const b = new THREE.Box3().setFromObject(o), c = b.getCenter(new THREE.Vector3()), d = b.getSize(new THREE.Vector3()); o.position.sub(c);
        const ax = d.x <= d.y && d.x <= d.z ? 'x' : d.z <= d.y ? 'z' : 'y';
        if (ax === 'x') kap.quaternion.setFromAxisAngle(new THREE.Vector3(0, 0, 1), Math.PI / 2); else if (ax === 'z') kap.quaternion.setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI / 2);
        kap.userData.yarim = Math.min(d.x, d.y, d.z) / 2; kap.position.set(e[0], (E_UST != null ? E_UST : e[1]) + kap.userData.yarim, e[2]); urunGrup.add(kap); eKatliKap = kap; } }
    if (eKatliKap) eKatliKap.visible = goster;
    if (eKatliKap && goster) {                                                 // E 20:24: katlı kutu KALIP merkezinde (eşlemedeki E.konum_m = E_KALIP NEST 4660 / −206), taban = karton tabanı − DESTEK inişi
      const e = UY.E && UY.E.konum_m, ds = +((f || {}).eksenler || {}).AX_E_DESTEK;
      if (e) eKatliKap.position.set(e[0], (E_UST != null ? E_UST : e[1]) - (isFinite(ds) ? Math.min(45.6, Math.max(0, ds)) / 1000 : 0) + (eKatliKap.userData.yarim || 0), e[2]);
    }
  }
  /* E (YÖNETİCİ 20:24, E cevabı): E_KUTU__B_* = düz blankın ŞARJÖR üstündeki hâli (merkez 4810 / −617). AX_E_BESLEYICI (vakum arabası) blankı 411 mm +z kalıba taşır (0,70–1,48 s);
     kutu kalıpta katlanır. Önceden levha şarjörde kalıyor, katlı kutu da levhanın x / z'sini alıyordu → robot alımında ≈ 0,43 m sıçrama.
     Levha besleyiciyle +z kayar; bu kutu için ulaşılan en büyük strok tutulur (araba geri dönerken levha kalıpta kalır). */
  /* Kemal R13 (10 Eki gece): şarjörde GERÇEK sayıda kutu — programın karesindeki karton sayısı (sim tesis.KARTON, başta 300 [V]) × 1,6 mm (programın asansör adımı: kutu başına
     GORELI ASANSOR 1,6). Yığının üstü alma düzleminde (vakum üstten alır), alt yüzü ona göre; modeldeki yığın 740 mm (≈ 462 kutu). Asansör tablası ile yığın altı arası
     IKIZ.eSarjor.bosluk_mm (program asansörü 0'dan başlıyor → 300 kutuda tabla 260 mm aşağıda kalır: E / G/Ç bulgusu, ikiz uydurmaz). */
  const SARJOR_Y = (o => o && (o.isMesh ? o : o.children.find(c => c.isMesh)))(kok.getObjectByName('E_SARJOR__karton_yigin') || kok.getObjectByName('E_SARJOR__karton_yigin__AX_E_ASANSOR'))   /* ENT tam v4b (139e): düğüm adı __AX_E_ASANSOR ekli */, SARJOR_P = kok.getObjectByName('E_SARJOR__aluminyum__AX_E_ASANSOR'), KARTON_MM = 1.6;
  let sarjorUst = null, sarjorH0 = null, sarjorY0 = null;
  if (SARJOR_Y && SARJOR_Y.geometry) { SARJOR_Y.geometry.computeBoundingBox(); const g = SARJOR_Y.geometry.boundingBox; sarjorUst = g.max.y; sarjorH0 = g.max.y - g.min.y; sarjorY0 = SARJOR_Y.position.y; }
  const ENT_YIGIN = Object.values((E.eksen || {})).some(v => (v.katkilar || []).some(k => k.tur === 'olcek_y_ust'));   // ENT ikiz-v4 yığını kendisi ölçekliyor → ikiz çekilir (çift ölçek olmasın)
  function sarjorUygula(f) {
    const fz = f.e_sarjor_fiziksel != null ? f.e_sarjor_fiziksel : f.karton;   // G/Ç 5b4fd788: e_sarjor_fiziksel (yığın) · e_sarjor_adet (kullanılabilir, kapasite 420)
    if (!SARJOR_Y || sarjorH0 == null || fz == null) return;
    if (ENT_YIGIN) {   // ENT ikiz-v4: yığını ENT ölçekler (AX_E_ASANSOR, üstten çapalı) — ikiz yalnız ölçer: yığının GERÇEK dünya yüksekliği (F1: = karton × 1,6 mm) + kullanılabilir / uyarı
      SARJOR_Y.updateMatrixWorld(true); const bx = new THREE.Box3().setFromObject(SARJOR_Y), n = Math.max(0, +fz || 0), ku = f.e_sarjor_adet != null ? +f.e_sarjor_adet : Math.max(0, n - 45), uy = ku <= 60, dur = ku <= 20;
      IKIZ.eSarjor = { kaynak: 'ENT olcek_y_ust', karton: n, dolu: 463, kapasite: 420, kullanilabilir: ku, uyari: uy, dur, metin: `şarjör: ${n} fiziksel · kullanılabilir ${ku} / 420${dur ? ' · DUR — DOLDUR' : uy ? ' · DOLDUR' : ''}`,
        yukseklik_mm: SARJOR_Y.visible && !bx.isEmpty() ? +((bx.max.y - bx.min.y) * 1000).toFixed(1) : 0, ust_m: bx.isEmpty() ? null : +bx.max.y.toFixed(4) }; return; }
    const n = Math.max(0, +fz || 0), h = n * KARTON_MM / 1000, s = Math.min(1, Math.max(1e-4, h / sarjorH0));
    SARJOR_Y.visible = n > 0; SARJOR_Y.scale.y = s; SARJOR_Y.position.y = sarjorY0 + sarjorUst * (1 - s);   // üst yüz sabit (alma düzlemi)
    let pu = null; if (SARJOR_P) { SARJOR_P.updateMatrixWorld(true); pu = new THREE.Box3().setFromObject(SARJOR_P).max.y; }
    const ku = f.e_sarjor_adet != null ? +f.e_sarjor_adet : Math.max(0, n - 45), uy = ku <= 60, dur = ku <= 20;   // G/Ç 5b4fd788: kullanılabilir / 420 · uyarı ≤ 60 · dur ≤ 20
    IKIZ.eSarjor = { karton: n, dolu: 463, kapasite: 420, kullanilabilir: ku, uyari: uy, dur, metin: `şarjör: ${n} fiziksel · kullanılabilir ${ku} / 420${dur ? ' · DUR — DOLDUR' : uy ? ' · DOLDUR' : ''}`, yukseklik_mm: +(h * 1000).toFixed(1), ust_m: +(sarjorY0 + sarjorUst).toFixed(4), alt_m: +(sarjorY0 + sarjorUst - h).toFixed(4), tabla_ust_m: pu != null ? +pu.toFixed(4) : null,
      bosluk_mm: pu != null ? +((sarjorY0 + sarjorUst - h - pu) * 1000).toFixed(1) : null };
  }
  const E_KOK0 = E_KOK ? E_KOK.position.clone() : null; let eLevhaId, eLevhaMm = 0;
  function eLevhaUygula(f, eKutu) {
    if (!E_KOK || !E_KOK0) return;
    if (E.blank && f.e_kutu_t !== undefined) { IKIZ.eLevha = { kaynak: 'ENT blankUygula (e_kutu_t)' }; return; }   // ENT ikiz-v4 blank katlama + taşıma programın e_kutu_t saatiyle → ikiz çekilir
    const id = eKutu ? (eKutu.id != null ? eKutu.id : eKutu.siparis_id != null ? eKutu.siparis_id : 'E') : null; if (id !== eLevhaId) { eLevhaId = id; eLevhaMm = 0; }
    const mm = +((f.eksenler || {}).AX_E_BESLEYICI); if (eKutu && isFinite(mm)) eLevhaMm = Math.max(eLevhaMm, Math.min(411, Math.max(0, mm)));
    const p = E_KOK.parent; if (p) p.updateWorldMatrix(true, false); const w = p ? p.localToWorld(E_KOK0.clone()) : E_KOK0.clone(); w.z += eLevhaMm / 1000;
    E_KOK.position.copy(p ? p.worldToLocal(w) : w); IKIZ.eLevha = { id, mm: eLevhaMm };
  }
  IKIZ.urunElBekleyen = () => [...elBekleyen];
  function robotTutuyor(u) {                                                  // robot simi BU ürünü hâlâ tutuyor mu
    const r = robot.son; if (!r) return false;
    /* A G5 (18:0x): 'birakilan null + görev var' kuralı, robot kutuyu bırakıp sonraki göreve (İÇECEK) geçince kutuyu elde sanıyordu (birakilan yeni görevde yine null).
       Kesin ölçüt: ikiz/robot.urun_poz (eldeki ürün; türü ROB_TUR ile) bu ürünün türü mü. */
    if (u && 'urun_poz' in r) { const t = r.urun_poz && String(r.urun_poz.tur || '').toUpperCase(); return !!t && ({ BOX: 'KUTU', COLA: 'ICECEK', DESSERT: 'TATLI', DOUGH: 'HAMUR' }[t] || t) === String(u.tur).toUpperCase(); }
    if ('birakilan' in r) return r.birakilan == null && !!r.gorev;          // urun_poz yayınlamayan robot simi: görev sürüyor ve henüz bırakmadı
    const v = r.kapanma != null ? +r.kapanma : r.gripper != null ? +r.gripper : null; return v != null && v > 0.3;   // eski robot simi: kavrayıcı kapalı
  }
  function urunUygula(f) {
    const gorulen = new Set(); let eKutu = null;
    for(const u of f.urunler||[])if(u.tur==='ICECEK'){
      const drawer=u.kaynak_cekmece||u.cekmece||(String(u.yer).toUpperCase()==='ROBOT'&&(robot.son?.cekmece||f.robot?.cekmece));
      const explicit=u.marka&&urunGorsel.models[u.marka]?u.marka:null;
      if(explicit||drawer)urunMarkalari.set(u.id,explicit||icecekMarka(drawer));
    }
    const liste = [];
    for (const u of f.urunler || []) {
      if (u.tur === 'E_KUTU') { eKutu = u; const ic = u.icerik || []; ic.forEach((x, i) => liste.push({ ...x, yer: 'E_KUTU', _dx: ic.length > 1 ? (i ? 0.07 : -0.07) : 0, _gizli: !!u.kapali })); continue; }
      if (!u.yer || ['MUSTERI', 'HURDA', 'KUTU'].includes(String(u.yer).toUpperCase())) continue;
      liste.push(u);
    }
    /* YÖNETİCİ 17:0x E alımı (KABUL-B): program ürünü ROBOT'a, robot simi onu TUTMADAN yazıyor (alım anında tcp E'ye 0,78 m uzak → kutu 516 mm ışınlanıyordu).
       Robot simi ürünü tutana kadar (ikiz/robot.urun_poz dolu ve türü aynı) ürün eski yerinde kalır; ilk kez ROBOT'ta görünen ürün (E kutusu, çekmecedeki hamur) çizilmez, E kartonu görünür kalır. */
    const r0 = robot.son, ROBT = { BOX: 'KUTU', COLA: 'ICECEK', DESSERT: 'TATLI', DOUGH: 'HAMUR' };
    const tutmadi = u => !!(r0 && ('urun_poz' in r0)) && (!r0.urun_poz || (ROBT[String(r0.urun_poz.tur || '').toUpperCase()] || String(r0.urun_poz.tur || '').toUpperCase()) !== String(u.tur).toUpperCase());
    let kutuBekliyor = false; IKIZ.alimBekleyen = [];
    for (let i = liste.length - 1; i >= 0; i--) { const u = liste[i]; if (String(u.yer).toUpperCase() !== 'ROBOT' || !tutmadi(u)) continue;
      const ky = kopya.get(u.id); IKIZ.alimBekleyen.push(u.id);
      if (!ky && u.tur === 'KUTU' && kutuKlon.has(u.id)) {
        // Robot kavramadan kapalı kutu kalıpta kalır; yeni boş karton ayrı nesnedir.
        u._eBekliyor = true; kutuBekliyor = true;
      }
      else if (!ky) { if (u.tur === 'KUTU') kutuBekliyor = true; liste.splice(i, 1); }
      else if (!ky.rel) { gorulen.add(u.id); liste.splice(i, 1); }                   // önceki yerinde (tabla, göz …) olduğu gibi kalır
    }
    /* YÖNETİCİ 17:4x (Kemal sabah: 'E katlaması gerçek değil'): katlama sürerken E kartonu (ENT ağı); program kutuyu KAPALI yazınca (E_KUTU.kapali — programın durumu, süre tablosu değil)
       karton gizlenir, yerine KATLI KUTU şablonu (URUN_Box 320 × 320 × 45) E tablasında düz durur; robot gerçekten tutana kadar orada bekler. */
    const eKatli = !!(eKutu && eKutu.kapali) || kutuBekliyor, katliOnce = !!(eKatliKap && eKatliKap.visible), levhaOnce = !!(E_KOK && E_KOK.visible);
    const blankSur = !!E.blank && IKIZ.eKutuT !== undefined;
    if (E_KOK && !blankSur) E_KOK.visible = !!eKutu && !eKatli;
    eLevhaUygula(f, eKutu); sarjorUygula(f);
    eKatliUygula(eKatli && !blankSur, f);
    for (const u of liste) {
      if (u.tur === 'KUTU' && (kaynakAd.KUTU !== 'URUN_Box' || E.blank) && !kutuKlon.has(u.id) && String(u.yer).toUpperCase() === 'ROBOT') { const g = kartonDondur(); if (g) kutuKlon.set(u.id, g); }
      let kb = u._eBekliyor ? { p: new THREE.Box3().setFromObject(kutuKlon.get(u.id)).getCenter(new THREE.Vector3()), taban: null } : (u.yer==='COP'&&u.robot_poz?.p?{p:new THREE.Vector3().fromArray(u.robot_poz.p),taban:null}:konumBul(u, f)); if (!kb) { ekle(`ürün yeri eşlemede yok: ${u.tur} @ ${u.yer}`); continue; }
      /* G/Ç 14:3x: programın 'bırakıldı' anı plan tablosundan (S5) — robot simi yörüngesi daha uzun → ürün robot varmadan yeni yere geçiyordu (KABUL-B 0,9–1,8 m).
         Robot plan tablosu gelene kadar: ürün ROBOT'tan çıktığında robot simi kavrayıcısı hâlâ KAPALIYSA ürün elde kalır (en çok 30 s sim); IKIZ.urunElBekleyen HUD'da görünür. */
      { const ky = kopya.get(u.id), yerU = String(u.yer).toUpperCase();
        if (yerU !== 'ROBOT' && ky && ky.rel && sonElde === u.id && robotTutuyor(u)) {   // yalnız EN SON ele alınan ürün (aynı türden 2. kutu alınınca 1. kutu geri uçmasın) if (elBekle[u.id] == null) elBekle[u.id] = +f.t || 0;
          if ((+f.t || 0) - elBekle[u.id] < 30) { kb = { p: kb.p, taban: null, elde: true }; elBekleyen.add(u.id); } else elBekleyen.delete(u.id); }
        else { delete elBekle[u.id]; elBekleyen.delete(u.id); }
        /* ters durum: robot BIRAKTI (ikiz/robot.birakilan) ama program ürünü hâlâ ROBOT'ta tutuyor → ürün bırakılan göze / noktaya konur (robot çekilirken elde uçmasın) */
        const br = robot.son && robot.son.birakilan;
        const hedefGoz = ((f.robot || {}).goz);                                   // birakilan bir sonraki göreve kadar dolu kalabilir → yalnız programın o anki hedef gözü aynıysa (yeni alınan ürün uçmasın)
        const ROB_TUR = { BOX: 'KUTU', KUTU: 'KUTU', COLA: 'ICECEK', DRINK: 'ICECEK', CAN: 'ICECEK', ICECEK: 'ICECEK', DESSERT: 'TATLI', TATLI: 'TATLI', DOUGH: 'HAMUR', HAMUR: 'HAMUR' };   // robot simi tür adları (Box, Dough …) → ikiz türü
        const brTur = br && (ROB_TUR[String(br.tur || '').toUpperCase()] || String(br.tur || '').toUpperCase());
        if (yerU === 'ROBOT' && br && brTur === String(u.tur).toUpperCase() && (br.goz == null || hedefGoz == null || +br.goz === +hedefGoz)) {
          const g = br.goz != null && GOZ_TUR && GOZ_TUR['G' + String(+br.goz).padStart(2, '0')]; const t = g && (g[u.tur] || g.KUTU);
          // The measured release is the product CENTRE. The old layout stores
          // a shelf base and can belong to a different column arrangement.
          // Never visit that fallback for one frame during PLC handover.
          if (Array.isArray(br.p)) kb = { p: new THREE.Vector3(...br.p), taban: null };
          else if (t) kb = { p: new THREE.Vector3(t[0], t[1], t[2]), taban: t[1] };
          birakti.add(u.id);
        } }
      const sekil = u.tur === 'HAMUR' ? bicim(u) : '';
      const anah = [u.tur, u.recete || '', sekil === 'top' ? 'top' : 'disk', u.boy_mm ?? 300, kutuKlon.has(u.id) ? 'karton' : '',u.tur==='ICECEK'?(urunMarkalari.get(u.id)||'Coca-Cola'):''].join(':');
      let k = kopya.get(u.id);
      if (!k || k.anah !== anah) {
        const once = k; if (k) urunGrup.remove(k.o);
        const s = urunSablon(u, sekil); if (!s) continue;
        const o = s.clone(true); o.traverse(x => { x.visible = true; });
        const karton = s.name === 'IKIZ_KUTU_KARTON';
        if (!karton) { o.position.set(0, 0, 0); if (Math.max(o.scale.x, o.scale.y, o.scale.z) < 0.01) { o.scale.set(1, 1, 1); o.quaternion.identity(); } }
        o.updateMatrixWorld(true); bb.setFromObject(o, u.tur === 'HAMUR'); bb.getCenter(mrk);
        const yari = u.tur==='ICECEK'?urunGorsel.can.datumHeight/2:(bb.max.y - bb.min.y) / 2; const merkezDunya = mrk.clone();
        o.position.sub(mrk); if(u.tur==='ICECEK')o.position.y+=urunGorsel.can.centerOffset;                                                     // kap orijini = ürün bbox merkezi
        if (sekil === 'pismis' || (sekil === 'kesik')) pismisYap(o);
        const kap = new THREE.Group(); kap.add(o); kap.name = 'IKIZ_URUN_' + u.id; kap.userData = { renkSinif:'gercek', marka:u.tur==='ICECEK'?(urunMarkalari.get(u.id)||'Coca-Cola'):null, datumOffset:u.tur==='ICECEK'?urunGorsel.can.centerOffset:0, tur: u.tur, recete: u.recete || null, bicim: sekil || null, yari }; urunGrup.add(kap);
        k = { o: kap, anah, rel: once && once.rel, yari, pisti:sekil==='pismis'||sekil==='kesik' };
        const malzeme = once?.o.getObjectByName('IKIZ_TOPPING_PARCA');
        if (malzeme) kap.add(malzeme);
        if (karton || u.tur === 'KUTU') {                                       // E10 (C 15:1x): dondurulan karton E'deki duruşuyla (dik) → gözde DÜZ yatsın: en ince eksen dünya y (robot simi kutu q = birim, 45 mm düşey)
          const d = new THREE.Vector3(); new THREE.Box3().setFromObject(o).getSize(d); const ax = d.x <= d.y && d.x <= d.z ? 'x' : d.z <= d.y ? 'z' : 'y';
          k.duzQ = ax === 'x' ? new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), Math.PI / 2) : ax === 'z' ? new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI / 2) : null;
          k.yariDuz = Math.min(d.x, d.y, d.z) / 2;
        }
        if (karton) { kap.position.copy(merkezDunya); kap.updateMatrixWorld(true); }   // devir anı: kutu E'deki yerinde başlar (sıçrama 0)
        else if (once) { kap.position.copy(once.o.position); kap.quaternion.copy(once.o.quaternion); }
        kopya.set(u.id, k);
      }
      // Cooking and cutting change the same product, preserving its dose group.
      if(u.tur==='HAMUR'){
        const cooked=sekil==='pismis'||sekil==='kesik';
        if(cooked&&!k.pisti){pismisYap(k.o.children[0]);k.pisti=true;}
        k.o.userData.bicim=sekil;
        k.o.traverse(o=>{if(o.name.startsWith('K_BICAK_IZ_'))o.visible=sekil==='kesik';});
      }
      if(u.tur==='ICECEK'&&k.o.userData.datumOffset!=null){const pose=kb.elde?robot.son?.urun_poz:u.robot_poz,target=pose?.bbox_center?0:(urunGorsel.can?.centerOffset||0),delta=target-k.o.userData.datumOffset;if(delta&&k.o.children[0])k.o.children[0].position.y+=delta;k.o.userData.datumOffset=target;}
      k.o.visible = !u._gizli; k.o.userData.elde = !!kb.elde;                // KABUL-C: tutucuda (ürün ↔ çene 'kavrama' sınıfı)
      if (kb.elde && ARAC) {                                                     // elde: alındığı andaki göreli duruş korunur, robot ucunun dönüşünü izler
        ARAC.updateMatrixWorld(true);
        if (!k.rel && u.tur === 'KUTU') IKIZ.kutuAlimBicim.push({ id: u.id, t: +(+f.t).toFixed(2), katli: katliOnce, levha: levhaOnce });   // F1: alım anında E'de görünen biçim
        if (!k.rel) sonElde = u.id;
        if (!k.rel) { if (u.tur === 'KUTU' && katliOnce && eKatliKap) { k.o.position.copy(eKatliKap.position); k.o.quaternion.copy(eKatliKap.quaternion); }   // v4 (E 20:24): kutu kalıpta DURDUĞU yerden kavranır (robot v6 alımı kalıp merkezine 1 mm) → sonra uçla katı gövde; ENT tutucu kaydırması (≈ 91 mm) sıçratmasın
          else if (!kutuKlon.has(u.id) || k.o.position.lengthSq() === 0) { k.o.position.copy(kb.p); k.o.quaternion.copy(ARAC.getWorldQuaternion(new THREE.Quaternion())); }
          // C 11 Eki FARKLAR 1c / 2c: robot programın gerisindeyken ürün ele geçtiğinde eldeki fark 0,5–1,3 m → ürün tutucudan uzakta havada taşınıyordu ('tutucu boş').
          // Fark 15 cm'den büyükse ürün tutucuya oturur (küçük tutucu kaydırması — ENT T_alet ≈ 91 mm — korunur). Kalan sıçrama robotun geride kalmasıdır (F1 / R27 ürün izinde sayılır).
          if (k.o.position.distanceTo(kb.p) > 0.15) { k.o.position.copy(kb.p); k.o.quaternion.copy(ARAC.getWorldQuaternion(new THREE.Quaternion())); IKIZ.eldeOturtma = (IKIZ.eldeOturtma || 0) + 1; }
          k.o.updateMatrixWorld(true); k.rel = _A.copy(ARAC.matrixWorld).invert().multiply(k.o.matrixWorld).clone(); }
        _B.copy(ARAC.matrixWorld).multiply(k.rel); _B.decompose(k.o.position, k.o.quaternion, new THREE.Vector3());
        // Claude 2 Kas: kare.js robot karelerinin arasını doldurur — eklemler açı uzayında (uç YAY çizer), urun_poz doğrusal (KİRİŞ) →
        // hamur / kola / tatlı / kutu taşınırken tutucunun 10–20 mm yanında / gerisinde. Ürün ÖLÇÜLMÜŞ robot karesinde (urun_poz._ara yok)
        // 3B uca göre kilitlenir; ara karelerde 3B uç × kilit çizilir → ürün tutucuyla tek cisim (robot simi urun_poz = flanş × urun_alet, sabit).
        { const up = robot.son && robot.son.urun_poz, tur = String(up?.tur || '').toUpperCase();
          const uygun = up && up.p?.length === 3 && up.q?.length === 4 && [...up.p, ...up.q].every(Number.isFinite)
            && (u.tur === 'HAMUR' ? ['DOUGH', 'HAMUR'].includes(tur) : ['KUTU', 'ICECEK', 'TATLI'].includes(u.tur));
          if (uygun) {
            if (!(up._ara > ELDE_ARA_ESIK) || !k.kilit || k.kilitTur !== tur) {
              _B.compose(_kp.fromArray(up.p), _kq.fromArray(up.q).normalize(), _k1); k.kilit = _A.copy(ARAC.matrixWorld).invert().multiply(_B).clone(); k.kilitTur = tur; }
            _B.copy(ARAC.matrixWorld).multiply(k.kilit); _B.decompose(k.o.position, k.o.quaternion, _ks);
            IKIZ.eldeUrunPoz = (IKIZ.eldeUrunPoz || 0) + 1;
          } else k.kilit = null; }
        { const g = k.o.position.clone(); fYum.set(u.id, { o: k.o, p0: g.clone(), p1: g.clone(), goster: g, tw0: performance.now(), dur: 0, elde: true }); }   // bırakma düşüşü için son elde konumu (aşağıda TABLA)
        // ENT + Robot 11 Eki (O8 tek tur): robot bırakma karesine gelince yayındaki 'birakilan' {p} = ürünün QR'de bıraktığı son yer (itme varsa itme sonu) → QR'de oradan çizilir
        { const bl = robot.son && robot.son.birakilan; if (bl && Array.isArray(bl.p) && bl.p.length === 3) k.birakP = new THREE.Vector3().fromArray(bl.p); }
      } else {
        k.rel = null; k.kilit = null; if (k.duzQ) k.o.quaternion.copy(k.duzQ); else k.o.quaternion.identity();
        if (u.tur === 'HAMUR' && sekil === 'top' && String(u.yer).toUpperCase() === 'TABLA' && aciciP > 0) {   // R5: merdane altında top → disk (aynı sürede)
          const T0 = sablonBoy(u.recete==='lahmacun'?'URUN_28_LAHM':U.HAMUR_TOP), T1 = new THREE.Vector3((u.boy_mm ?? 300) / 1000, 0.015, (u.boy_mm ?? 300) / 1000);
          if (T0 && T1) { const e = aciciP; k.o.scale.set(1 + (T1.x / T0.x - 1) * e, 1 + (T1.y / T0.y - 1) * e, 1 + (T1.z / T0.z - 1) * e); k.yassiYari = (T0.y + (T1.y - T0.y) * e) / 2; IKIZ.hamurYassi = { id: u.id, e: +e.toFixed(3), y_mm: +((T0.y + (T1.y - T0.y) * e) * 1000).toFixed(1), x_mm: +((T0.x + (T1.x - T0.x) * e) * 1000).toFixed(1) }; }
        } else if (k.o.scale.x !== 1 || k.o.scale.y !== 1) { k.o.scale.set(1, 1, 1); k.yassiYari = null; }
        k.o.position.copy(kb.p); if (kb.taban != null) k.o.position.y = kb.taban + (k.yassiYari != null ? k.yassiYari : k.yariDuz != null ? k.yariDuz : k.yari);
        if (kb.egim != null) k.o.rotation.z = kb.egim*Math.PI/180;
        if (k.birakP) { if (/^QR/.test(String(u.yer).toUpperCase())) { k.o.position.copy(k.birakP); IKIZ.qrBirakilan = (IKIZ.qrBirakilan || 0) + 1; } else k.birakP = null; }
        if((/^QR/.test(String(u.yer).toUpperCase())||u.yer==='COP')&&u.robot_poz?.p?.length===3){k.o.position.fromArray(u.robot_poz.p);if(u.robot_poz.q?.length===4){k.o.quaternion.fromArray(u.robot_poz.q).normalize();}}
        if (kb.bantX != null) kPide.set(u.id, { o: k.o, bantX: kb.bantX, radius: (u.boy_mm ?? 300) / 2000, temas: iticiTemas(f) }); else kPide.delete(u.id);
        // YÖNETİCİ 11 Eki (O4): F_YBANT / F kaydı ~1,8 Hz, bant 150 mm'yi tek karede alıyor → gösterilen konum önceki gösterilenden yeni hedefe, iki karenin DUVAR aralığında doğrusal gider (render tikinde)
        { const yy = String(u.yer).toUpperCase();
          // Robot / ENT 11 Eki: hamur bant üstünden 66 mm'de (merkez 33,5 mm) BİLEREK bırakılır (R3 / DY 40) → TABLA'nın ilk karesinde banda bir kare aralığında düşer
          const zE = fYum.get(u.id), dus = (yy === 'TABLA' || /^QR/.test(yy)) && zE && zE.elde; if (dus) { zE.elde = false; IKIZ.hamurDusus = (IKIZ.hamurDusus || 0) + 1; }   // QR: kutu bırakılınca 45 mm itilir (programın gerçek hareketi, ENT) → bir kare aralığında göze kayar
          if (!kareKesin && IKIZ.zamanModu !== 'kayit' && (yy === 'F_YBANT' || yy === 'F' || (yy === 'K' && !Number.isFinite(u.x_mm)) || dus)) { const now = performance.now(), h = k.o.position.clone(), z = fYum.get(u.id);
            if (z && z.goster.distanceTo(h) < 0.40) { z.pasif = false; z.p0 = z.goster.clone(); z.p1 = h; z.dur = Math.min(800, Math.max(40, now - z.tw0)); z.tw0 = now; k.o.position.copy(z.p0); }
            else fYum.set(u.id, { o: k.o, p0: h.clone(), p1: h.clone(), goster: h.clone(), tw0: now, dur: 0 }); }
          else if (yy === 'TABLA') { const g = k.o.position.clone(); fYum.set(u.id, { o: k.o, p0: g.clone(), p1: g.clone(), goster: g, tw0: performance.now(), dur: 0, pasif: true }); }   // O4: tabladaki son yer kaydı (yalnız ölçü) → F_YBANT'ın ilk karesi oradan ara değerle
          else fYum.delete(u.id); }
      }
      // Pide tablayla aynı açıdadır; doz izi ürünün kendi çocuğu olarak taşınır.
      if (u.tur === 'HAMUR' && String(u.yer).toUpperCase() === 'TABLA' && sekil !== 'top') {
        k.o.rotation.y = (f.tabla_donus_deg ?? +f.eksenler?.AX_TOP_TABLA ?? 0) * Math.PI / 180;
      }
      toppingUygula(u, kopya.get(u.id), f);
      yagIziUygula(u, kopya.get(u.id));
      gorulen.add(u.id);
    }
    for (const [id, k] of kopya) if (!gorulen.has(id)) { urunGrup.remove(k.o); kopya.delete(id); kutuKlon.delete(id); }
    IKIZ.urunSayisi = kopya.size;
    izYaz(f, liste);
  }
  /* KABUL-B (10 Eki): ürün izi — her ürün kimliği için yer / biçim sırası, kare başı sıçrama (|Δp| ≤ V_MAX × Δt_sim + 5 mm), görünmez kare, kayıp-dönüş.
     Yalnız ölçer (sürücüye dokunmaz); test IKIZ.urunIz() ile okur. V_MAX 2,5 m/s: robot ucu + ray en hızlı hareket [V]. */
  const IZ = new Map(), V_MAX = 2.5; let izT = null;
  function izYaz(f, liste) {
    const t = +f.t || 0; const dt = izT == null ? 0 : Math.max(0, t - izT); izT = t;
    const simdi = new Set();
    for (const u of liste) {
      const k = kopya.get(u.id); if (!k) continue; simdi.add(u.id);
      let z = IZ.get(u.id); const p = k.o.position, yer = String(u.yer).toUpperCase(), bc = k.o.userData.bicim || '';
      if (!z) { z = { id: u.id, tur: u.tur, recete: u.recete || null, yerler: [yer], bicimler: bc ? [bc] : [], p: p.clone(), kare: 0, gizli: 0, sicrama: [], enOran: 0, kayip: 0, yok: false, kap: new Set(), gecis: [] }; IZ.set(u.id, z); }
      if (z.yok) { z.kayip++; z.yok = false; }
      if (z.yerler[z.yerler.length - 1] !== yer) { if (z.gecis.length < 12) z.gecis.push({ t: +t.toFixed(2), yer: z.yerler[z.yerler.length - 1] + '→' + yer, d_mm: +(p.distanceTo(z.p) * 1000).toFixed(1), once: z.p.toArray().map(v => +v.toFixed(3)), sonra: p.toArray().map(v => +v.toFixed(3)), sx: +(silAnlik.SX_K_ITICI_X || 0) }); z.yerler.push(yer); }   // yer değişim karesindeki konum farkı (K→E itici teslimi ölçümü)
      if (bc && z.bicimler[z.bicimler.length - 1] !== bc) z.bicimler.push(bc);
      if (z.kare && dt > 0) { const d = p.distanceTo(z.p), sinir = V_MAX * dt + 0.005, oran = d / sinir; if (oran > z.enOran) z.enOran = +oran.toFixed(3);
        if (d > sinir && z.sicrama.length < 8) z.sicrama.push({ t: +t.toFixed(2), d: +d.toFixed(4), dt: +dt.toFixed(3), yer: z.yerler.slice(-2).join('→') }); }
      z.p.copy(p); z.kare++; if (!k.o.visible) z.gizli++; z.kap.add(k.o.uuid);
    }
    for (const [id, z] of IZ) if (!simdi.has(id)) z.yok = true;
    if (IZ.size > 400) for (const id of [...IZ.keys()].slice(0, IZ.size - 400)) IZ.delete(id);
  }
  IKIZ.urunKopyaKonum = id => { const k = kopya.get(id); return k ? k.o.position.toArray().map(v => +v.toFixed(4)) : null; };   // denetim (odak O5): 3B'deki ürün konumu
  IKIZ.urunIz = () => [...IZ.values()].map(z => ({ id: z.id, tur: z.tur, recete: z.recete, yerler: z.yerler, bicimler: z.bicimler, kare: z.kare, gizli: z.gizli, sicrama: z.sicrama, enOran: z.enOran, kayip: z.kayip, kapSay: z.kap.size, gecis: z.gecis }));
  /* K-E-KODPANEL-1 (10 Eki): pnömatik silindirler ara konumla — beynin `silindirler` (tesis SX_* mm, [V]) ENT çıkış katkısının yönüyle (yon_dunya × mm × olcek) uygulanır;
     ENT 0/1 tam strok (tek karede ışınlanma) yerine. Katkının baskın ekseni hangi SX'i seçer: y → SX_K_BICAK · x → SX_K_ITICI_X · z → SX_K_ITICI_Z. */
  const SX_ESLE = { DO_K_BICAK_IN: { y: 'SX_K_BICAK' }, DO_K_ITICI: { x: 'SX_K_ITICI_X', z: 'SX_K_ITICI_Z' } };
  const silOgeler = [];
  for (const [cik, harita] of Object.entries(SX_ESLE)) for (const k of ((E.cikis || {})[cik] || {}).katkilar || []) {
    if (k.tur !== 'oteleme' || !k.yon_dunya) continue; const yon = new THREE.Vector3(...k.yon_dunya), ax = ['x', 'y', 'z'][[0, 1, 2].reduce((a, i) => Math.abs(k.yon_dunya[i]) > Math.abs(k.yon_dunya[a]) ? i : a, 0)];
    const sx = harita[ax]; if (!sx) continue;
    for (const n of k.dugumler || []) { const o = dugum[n]; if (o) silOgeler.push({ sx, o, yon, olcek: k.olcek ?? 0.001, sifir: k.sifir || 0, cik }); }
  }
  // CAD parçaları düz kardeş düğümler: Z kafası X arabasının çocuğu değil.
  // Bu yüzden yüz/kol/capraz da arabanın X hareketini birlikte alır.
  for (const g of [...silOgeler]) if (g.sx === 'SX_K_ITICI_Z') {
    silOgeler.push({ ...g, sx: 'SX_K_ITICI_X', yon: new THREE.Vector3(1, 0, 0) });
  }
  /* C 11 Eki R12: program silindirleri ara konumla yayınlıyor (pide itmesi 0,63 s, lahmacun 1,67 s) ama kare aralığı 0,1–0,5 s (×10'da itme 1–2 kare) → 3B tek karede atlıyordu.
     Her yeni karede silindir önceki gösterilen değerden yeni değere, iki karenin DUVAR aralığı boyunca doğrusal gider (render tikinde); K'daki pide aynı ara değerle itilir. */
  let silSon = {}, silDuvar = null; const kPide = new Map(), fYum = new Map();
  function silindirUygula(f) {
    const S = f.silindirler; if (!S) return; silSon = S; const now = performance.now(), dur = kareKesin || IKIZ.zamanModu === 'kayit' || silDuvar == null ? 0 : Math.min(800, Math.max(40, now - silDuvar)); silDuvar = now;
    for (const g of silOgeler) { const v = S[g.sx]; if (v == null) continue; g.v0 = g.vs == null ? v : g.vs; g.v1 = v; g.tw0 = now; g.dur = dur; }
    silTik();
  }
  function silTik() {
    const now = performance.now(); let itX = null; const konumlar = new Map();
    for (const g of silOgeler) { if (g.v1 == null) continue; const r0 = ik.dinlenme.get(g.o); if (!r0) continue; const a = g.dur ? Math.min(1, (now - g.tw0) / g.dur) : 1;
      g.vs = g.v0 + (g.v1 - g.v0) * a; g.a = a;
      if (!konumlar.has(g.o)) konumlar.set(g.o, r0.p.clone());
      konumlar.get(g.o).addScaledVector(g.yon, (g.vs - g.sifir) * g.olcek);
      if (g.sx === 'SX_K_ITICI_X') itX = g.vs; }
    for (const [o,p] of konumlar) o.position.copy(p);
    for (const [id, z] of fYum) { if (!kopya.has(id)) { fYum.delete(id); continue; } if (z.elde || z.pasif) continue; const a = z.dur ? Math.min(1, (now - z.tw0) / z.dur) : 1; z.goster.lerpVectors(z.p0, z.p1, a); z.o.position.copy(z.goster); }
    IKIZ.fYumSayi = fYum.size;
    if (itX != null) for (const [id, z] of kPide) { if (!kopya.has(id)) { kPide.delete(id); continue; } const smooth = fYum.get(id), x = smooth ? smooth.goster.x : z.bantX; z.o.position.x = z.temas && itX > 0.5 ? Math.max(x, ITICI_YUZ0 + z.radius + itX / 1000) : x; }
    if (itX != null) {   // R12 ölçümü: her itmede 3B'de gösterilen ara değer sayısı + duvar süresi + programın HIZLI çıkışı (pide 1 / lahmacun 0)
      const I = IKIZ.iticiGoster || (IKIZ.iticiGoster = []), son = I[I.length - 1];
      if (itX > 1 && itX < 249) { if (!son || son.bitti) { if (I.length < 60) I.push({ t0: now, hizli: ((IKIZ.son || {}).cikislar || {}).DO_K_ITICI_HIZLI ?? null, ara: new Set(), bitti: false }); } const z = I[I.length - 1]; if (z && !z.bitti) z.ara.add(Math.round(itX)); }
      else if (itX >= 249 && son && !son.bitti) { son.bitti = true; son.ms = Math.round(now - son.t0); son.ara_sayi = son.ara.size; son.ara = undefined; } }
  }
  if (IKIZ.kancalar) IKIZ.kancalar.push(silTik);
  /* sprey (DO_K_SPREY_PWM): PulsaJet ucu (4,025 · 1,141 · −0,170) → aşağı 110° yassı yelpaze, yükseklik 130 mm, ürün üstünde 2 × 130 × tan 55° = 371 mm, kalınlık 15 mm, opaklık 0,3 */
  // Merkezde tek dozun tam dairesel yüzey kapsaması. Akışkan/atomizasyon çözümü değil.
  const spreyG = new THREE.ConeGeometry(1, .1491, 48, 1, true);
  spreyG.translate(0, -.1491 / 2, 0);
  const sprey = new THREE.Mesh(spreyG, new THREE.MeshBasicMaterial({ color: 0x8fd0ff, transparent: true, opacity: 0.55, depthWrite: false, side: THREE.DoubleSide })   /* C FARKLAR 3a: 0,3 beyaz açık zeminde seçilmiyordu */);
  sprey.position.set(4.200, 1.1601, -0.206); sprey.name = 'IKIZ_K_SPREY'; sprey.visible = false; kok.add(sprey);
  // Ölçülmüş valf açıkken nozuldan yüzeye düşen damlalar; yalnız saydam
  // koninin metal/cam arkasında kaybolmasına karşı akışın yönünü gösterir.
  const damlaG = new THREE.BufferGeometry(), damlaP = new Float32Array(96*3);
  damlaG.setAttribute('position',new THREE.BufferAttribute(damlaP,3));
  const damlalar = new THREE.Points(damlaG,new THREE.PointsMaterial({color:0xffe09b,size:.0035,transparent:true,opacity:.9,depthWrite:false}));
  damlalar.name='IKIZ_K_YAG_DAMLALARI';damlalar.frustumCulled=false;sprey.add(damlalar);
  const merkezNozul = [];
  kok.traverse(o => { if (o.visible && /^K_MERKEZ120__celik_[0123]__KESICI$/.test(o.name || '')) merkezNozul.push(o); });
  const hortumGoster = kHortumKur(THREE, kok);
  const spreyKabloGoster = kSpreyKabloKur(THREE, kok);
  function merkezPoz(sx) {
    // Nozul, yıldız ve bağlantılar artık aynı SX_K_BICAK sürücüsünün parçaları.
    // İkinci kez/bağımsız bir döngüde konum yazılmaz.
    hortumGoster(sx); spreyKabloGoster(sx); sprey.position.y = 1.1601 - sx / 1000;
  }
  let spreyOnce = null;
  function spreyUygula(f) {
    const k = f.k_kesme || {}, sx = +(f.silindirler || {}).SX_K_BICAK || 0;
    merkezPoz(sx);
    // Yayınlar arasında gerçekleşmiş PWM süresinden görünür sis yoğunluğu;
    // yalnız pencere açık diye sürekli sahte püskürtme yok.
    const dt = spreyOnce ? +f.t - spreyOnce.t : 0;
    const ds = spreyOnce ? +k.sprey_s - spreyOnce.s : 0;
    const duty = dt > 0 && ds > 0 ? Math.min(1, ds / dt) : 0;
    sprey.visible = merkezNozul.length > 0 && sx <= 1 && !!(f.cikislar || {}).DO_K_SPREY_PWM;
    sprey.material.opacity = 0.15 + 0.4 * Math.max(duty, (f.cikislar || {}).DO_K_SPREY_PWM ? 1 : 0);
    const urun = (f.urunler || []).find(u => u.yer === 'K' && u.tur === 'HAMUR');
    const radius = Math.max(.01, (+(urun?.boy_mm) || 300) / 2000 - .003);
    const ku = urun && kopya.get(urun.id);
    const h = ku ? Math.max(.001, sprey.position.y - ku.o.position.y - ku.yari) : .1491;
    sprey.scale.set(radius, h / .1491, radius);
    if(sprey.visible){
      for(let i=0;i<96;i++){
        const p=((+f.t*7+i/96)%1+1)%1,a=i*2.399963229728653;
        const r=Math.sqrt(((i*37)%97)/97)*p;
        damlaP[i*3]=Math.cos(a)*r;damlaP[i*3+1]=-.1491*p;damlaP[i*3+2]=Math.sin(a)*r;
      }
      damlaG.attributes.position.needsUpdate=true;
    }
    spreyOnce = { t: +f.t, s: +k.sprey_s || 0 };
    IKIZ.kMerkezSprey = { model: merkezNozul.length > 0, duty, x: sprey.position.x, y: sprey.position.y, z: sprey.position.z, visible: sprey.visible };
  }
  /* Kemal R5 (10 Eki gece, YÖNETİCİ 22:2x): örnek açıcı MERDANELİ (TOPPING_MODUL__celik__ACICI, A+B ölçümü: merdane / çelik ağı). DO_A_BASLA'da merdane iner; alt kenarı
     tabla üstü + kot: pide KOT_PIDE, lahmacun KOT_LAHM (DO_A_PROGRAM_LAHM; G/Ç pres kotası 6 / 3 mm [V] = merdane boşluğu). Süre sonunda (DO_A_BASLA düşünce) kalkar.
     12 Eki: belgelenmiş DSBC yükleme kalkışı 100 mm; kafa grubu fizik tesisinin head_offset_mm konumunu izler. İniş / kalkış programın ölçülmüş fizik konumundan gelir; gerçek mekanik hız üretici kabulünü bekler. */
  /* A+B ölçümü (YÖNETİCİ 23:3x): merdane = TOPPING_DONER__KONI_ON + KONI_ARKA (iki konik merdane uç uca, dönüş ekseni dünya Z, x 1086,5 · y 1112; Ø 88); düğüm orijini
     merdanenin ALT kotunda (y 1068) → alt kot = düğüm y. Dönmeyi ENT yapar (DO_A_BASLA donme katkısı); ikiz yalnız İNİŞİ ekler (ENT'nin o karede koyduğu konumun üstüne). */
  const KOT_PIDE = 6.0, KOT_LAHM = 3.0, KONI = ['TOPPING_DONER__KONI_ON', 'TOPPING_DONER__KONI_ARKA'].map(n => kok.getObjectByName(n)).filter(Boolean), MERDANE = KONI[0] || null;
  const A_KAFA = [...KONI, ...["TOPPING_MODUL__celik__ACICI", "TOPPING_MODUL__motor__ACICI", "TOPPING_MODUL__sac__ACICI"].map(n=>kok.getObjectByName(n)).filter(Boolean)];
  let merdaneAlt0 = null, aBas = null, merdaneDy = 0.100, merdaneT = null; const koniSon = new Map();
  let tablaMerdane = null;   // A+B üçgen ölçümü: merdanenin altındaki TABLA yüzeyi y 1000,0 (TABLA_UST 1,0059 kenar dahil kutu üstü) → ışınla ölç
  if (MERDANE) { kok.updateMatrixWorld(true); const mp = MERDANE.getWorldPosition(new THREE.Vector3()); merdaneAlt0 = mp.y;
    // 11 Eki (ENT / TOPPING: bant üst yüzü 1000,00; kenar şeridi 998,90 · kademe 998,85): merdane üst yüzeye oturur → merdane ekseni (z) boyunca 5 ışın, EN YÜKSEK isabet
    const T_ = kok.getObjectByName('TOPPING_DONER__TABLA'); if (T_) { const mb = new THREE.Box3(); KONI.forEach(o => mb.expandByObject(o)); let en = null;
      for (let i = 0; i < 5; i++) { const z = mb.isEmpty() ? mp.z : mb.min.z + (mb.max.z - mb.min.z) * (0.1 + 0.2 * i); const h = new THREE.Raycaster(new THREE.Vector3(mp.x, mp.y - 0.001, z), new THREE.Vector3(0, -1, 0), 0, 0.3).intersectObject(T_, true)[0]; if (h && (en == null || h.point.y > en)) en = h.point.y; }
      if (en != null) tablaMerdane = en; } }
  IKIZ.acici = { merdane: KONI.length, alt0: merdaneAlt0 };
  function aciciUygula(f) {
    const c = f.cikislar || {}, PA = f.acici || null, bas = PA && PA.basiyor != null ? !!PA.basiyor : !!c.DO_A_BASLA, lahm = PA && PA.ayar ? PA.ayar === 'LAHMACUN' : !!c.DO_A_PROGRAM_LAHM, t = +f.t || 0;   // G/Ç 1f1ba662: durum.acici {ayar, kota_mm, basiyor}
    if (bas && aBas == null) aBas = { t0: t, lahm, kot: PA && PA.kota_mm != null ? +PA.kota_mm : null }; if (!bas) aBas = null;
    const kot = (aBas ? (aBas.kot != null ? aBas.kot : aBas.lahm ? KOT_LAHM : KOT_PIDE) : null);   // kot programdan (ACICI_KOTA_MM); yoksa 6 / 3 [V]
    if (MERDANE && merdaneAlt0 != null && (tablaMerdane ?? TABLA_UST) != null) {
      const TU = tablaMerdane ?? TABLA_UST, hedef = Number.isFinite(PA?.head_offset_mm) ? PA.head_offset_mm / 1000 : (aBas ? (TU + kot / 1000) - merdaneAlt0 : 0.100);   // dünya y kayması (merdane ebeveyni dünya hizalı: GLB kökünde)
      const dts = merdaneT == null ? 1 : Math.max(0, t - merdaneT), inisS_ = +((f.acici || {}).inis_s) || 0, adim = (inisS_ > 0 ? Math.max(0.01, Math.max(Math.abs(hedef), Math.abs(merdaneDy)) / inisS_) : 0.300) * dts;   // C FARKLAR 2d: iniş hızı programın inis_s'inden (yoksa 300 mm/s)   // sim zamanıyla 300 mm/s [V] (hız ×10'da da aynı sim süresi)
      merdaneDy = Number.isFinite(PA?.head_offset_mm) ? hedef : merdaneDy + Math.max(-adim, Math.min(adim, hedef - merdaneDy));
      for (const o of A_KAFA) { const s_ = koniSon.get(o); const taban = s_ && Math.abs(o.position.y - s_.y) < 1e-9 ? s_.y - s_.dy : o.position.y;   // ENT bu karede yeniden kurmadıysa önceki inişi çıkar (birikmesin)
        o.position.y = taban + merdaneDy; koniSon.set(o, { y: o.position.y, dy: merdaneDy }); }
    }
    merdaneT = t;
    const inis = aBas && kot != null && merdaneAlt0 != null && (tablaMerdane ?? TABLA_UST) != null ? ((tablaMerdane ?? TABLA_UST) + kot / 1000) - merdaneAlt0 : 0;   // tam iniş (negatif)
    // C 11 Eki FARKLAR 2d: merdane 300 mm/s ile ~0,2 s'de iniyor → top bir karede diske dönüyordu. Program acici.inis_s + pres_s (G/Ç) varsa yassılma o süreye yayılır.
    const PA_ = f.acici || {}, sure_ = (+PA_.pres_s > 0 && +PA_.inis_s > 0) ? Math.min(+PA_.inis_s, +PA_.pres_s) : (+PA_.inis_s || 0);   // 11 Eki kayıt: pide pres_s 0,405 s < inis_s 1,5 s → %28'de kalıyordu; basma penceresinde biter   // hamur merdane inerken yassılır: inis_s (G/Ç 1,5 s); pres_s toplam çevrim olabilir, basma bitmeden tamamlanmayabilirdi
    const p = aBas ? (sure_ > 0 ? Math.min(1, Math.max(0, (t - aBas.t0) / sure_)) : (inis < 0 ? Math.min(1, Math.max(0, merdaneDy / inis)) : 1)) : 0;   // top → disk merdanenin inişiyle: merdane kota oturunca hamur disk (basma süresi programdan bağımsız)
    IKIZ.acici = { merdane: KONI.length, basla: bas, lahm, kot_mm: kot, alt_m: MERDANE ? +(merdaneAlt0 + merdaneDy).toFixed(4) : null, tabla_ust_m: tablaMerdane ?? TABLA_UST, tabla_kaynak: tablaMerdane != null ? 'ışın (merdane altı)' : 'TABLA kutu üstü', bosluk_mm: MERDANE && (tablaMerdane ?? TABLA_UST) != null ? +((merdaneAlt0 + merdaneDy - (tablaMerdane ?? TABLA_UST)) * 1000).toFixed(2) : null, yassi: +p.toFixed(3) };
    if (aBas) { const z = IKIZ.aciciIz = IKIZ.aciciIz || []; z.push({ t, t0: aBas.t0, lahm, kot_mm: kot, bosluk_mm: IKIZ.acici.bosluk_mm, yassi: +p.toFixed(3) }); if (z.length > 2000) z.shift(); }   // R5 ölçümü: program karesi başına (×10'da basma ~3 kare)
    return p;
  }
  let aciciP = 0;
  const _boy = {}; function sablonBoy(ad) { if (_boy[ad]) return _boy[ad]; const s_ = sablon(ad); if (!s_) return null; const o = s_.clone(true); o.position.set(0, 0, 0); o.quaternion.identity(); if (Math.max(o.scale.x, o.scale.y, o.scale.z) < 0.01) o.scale.set(1, 1, 1); o.traverse(x => { x.visible = true; }); o.updateMatrixWorld(true); const d = new THREE.Vector3(); new THREE.Box3().setFromObject(o).getSize(d); return (_boy[ad] = d); }
  /* YÖNETİCİ 16:4x KARAR (C E15): müşteri kapağı camı BUZLU — içerik görünmez; doluluk / hazır her gözün kendi ışığıyla. Işık kapağın (QR62_BAY_nn_door) üst kenarında,
     müşteri yüzünde 3 mm önde, Ø18 mm. Renk programın qr[g].durum'undan (E_Goz): BOS sönük · REZERVE sarı (hazırlanıyor) · HAZIR yeşil · ACIK yeşil yanıp söner. */
  const gozIsik = {};
  { const geo = new THREE.CylinderGeometry(0.009, 0.009, 0.004, 20); geo.rotateX(Math.PI / 2); const b3 = new THREE.Box3();
    for (let g = 1; g <= 12; g++) { const d = kok.getObjectByName('QR62_BAY_' + String(g).padStart(2, '0') + '_door'); if (!d) continue;
      d.updateWorldMatrix(true, true); b3.setFromObject(d); const m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: 0x2a2f33, emissive: 0x000000, emissiveIntensity: 1.4 }));
      m.position.set((b3.min.x + b3.max.x) / 2, b3.max.y - 0.022, b3.max.z + 0.003); m.name = 'IKIZ_GOZ_ISIK_G' + String(g).padStart(2, '0'); kok.add(m); gozIsik[g] = m; } }
  function isikUygula(f) {
    const q = f.qr || {}, yan = Math.floor(performance.now() / 400) % 2 === 0;
    for (const [g, m] of Object.entries(gozIsik)) { const d = String((q[g] || {}).durum || 'BOS').toUpperCase();
      const renk = d === 'HAZIR' || (d === 'ACIK' && yan) ? 0x2ee66b : d === 'REZERVE' ? 0xffc21a : null;
      m.material.emissive.setHex(renk || 0x000000); m.material.color.setHex(renk ? renk : 0x2a2f33); m.userData.durum = d; }
  }
  IKIZ.gozIsiklari = () => Object.fromEntries(Object.entries(gozIsik).map(([g, m]) => [g, { durum: m.userData.durum, renk: '#' + m.material.emissive.getHexString() }]));
  IKIZ.urunBoyutlari = () => urunGrup.children.filter(k => k.visible && String(k.name).startsWith('IKIZ_URUN_')).map(k => { const b = new THREE.Box3().setFromObject(k), d = new THREE.Vector3(); b.getSize(d);   // F1 / kabul ölçütü: görünen ürünün gerçek boyu + konumu
    return { id: +String(k.name).replace('IKIZ_URUN_', ''), tur: k.userData.tur, recete: k.userData.recete, bicim: k.userData.bicim, dx: +d.x.toFixed(3), dy: +d.y.toFixed(3), dz: +d.z.toFixed(3),
             alt: +b.min.y.toFixed(4), x: +k.position.x.toFixed(4), y: +k.position.y.toFixed(4), z: +k.position.z.toFixed(4) }; });

  /* ------------------------------------------------------------ QR ROBOT TARAFI KAPAKLARI (ADIM 142: QR_ROBOT_KAPAK_Gnn, alttan menteşeli klape, pivot +x ekseni, açık −90°)
     program: qr[n].kapak (0 kapalı … 1 açık; true/false da olur). Pivot ENT eşlemesinde (`E.qr_robot_kapak`) yoksa 142'nin PIVOT tablosu (mm, model ekseni = sahne ekseni / 1000). */
  const GX = [[3769, 4244], [4256, 4731], [4743, 5218]], GY = [588, 850, 1112, 1374];
  const KP = E.qr_robot_kapak || Object.fromEntries(Array.from({ length: 12 }, (_, i) => { const b = Math.floor(i / 3), c = i % 3, G = 'G' + String(i + 1).padStart(2, '0');
    return [G, { dugum: 'QR_ROBOT_KAPAK_' + G, eksen_dunya: [1, 0, 0], nokta: [(GX[c][0] + GX[c][1]) / 2, GY[b] - 15, 1712], acik_deg: -180 }]; }));   // 142 (a) 9 Eki: eksen z 1712, açık −180° sarkık
  const kapak = [];
  const entSurer = new Set();                                                   // ENT eşlemesi bir kapağı eksen / çıkış olarak sürüyorsa burada SÜRÜLMEZ (çift sürüş yok)
  for (const tablo of ['eksen', 'cikis']) for (const v of Object.values(E[tablo] || {})) for (const k of v.katkilar || []) for (const n of k.dugumler || []) entSurer.add(n);
  kok.updateMatrixWorld(true);
  for (const [G, v] of Object.entries(KP)) {
    let o = dugum[v.dugum]; if (!o) o = kok.getObjectByName(v.dugum);
    if (!o) { ekle('QR robot kapağı modelde yok: ' + v.dugum + ' (ikiz-v1 GLB ADIM 142 öncesi — ENT yeniden üretince bağlanır)'); continue; }
    const W0 = o.matrixWorld.clone(), p = new THREE.Vector3(...v.nokta).multiplyScalar(0.001), ax = new THREE.Vector3(...v.eksen_dunya).normalize();
    const entQ = Object.values(E.qr || {}).find(q => q.robot_kapagi && q.robot_kapagi.dugum === v.dugum);   // ENT tur 6: qr[g].robot_kapagi ile ENT sürer → açı ENT'in
    kapak.push({ n: +G.slice(1), o, W0, p, ax, deg: entQ ? entQ.robot_kapagi.acik_deg : v.acik_deg, gos: 0, maks: 0, ent: entSurer.has(v.dugum) || !!entQ });
  }
  const _M = new THREE.Matrix4(), _T = new THREE.Matrix4(), _Pi = new THREE.Matrix4();
  function kapakUygula(f) {
    for (const k of kapak) {
      const q = ((f.qr || {})[k.n] || {}).kapak; const a = Math.max(0, Math.min(1, q === true ? 1 : +q || 0));
      if (k.ent) {                                                              // ENT sürüyor: yalnız gösterilen açıyı izle (çift sürüş yok)
        const qq = new THREE.Quaternion(); k.o.getWorldQuaternion(qq); const q0 = new THREE.Quaternion(); k.W0.decompose(new THREE.Vector3(), q0, new THREE.Vector3());
        k.gos = 2 * Math.acos(Math.min(1, Math.abs(qq.dot(q0)))) * 180 / Math.PI / Math.abs(k.deg); k.maks = Math.max(k.maks, k.gos); continue;
      }
      _M.makeTranslation(k.p.x, k.p.y, k.p.z).multiply(_T.makeRotationAxis(k.ax, THREE.MathUtils.degToRad(k.deg * a))).multiply(new THREE.Matrix4().makeTranslation(-k.p.x, -k.p.y, -k.p.z)).multiply(k.W0);
      k.o.parent.updateWorldMatrix(true, false); _Pi.copy(k.o.parent.matrixWorld).invert();
      _M.premultiply(_Pi).decompose(k.o.position, k.o.quaternion, k.o.scale);
      k.gos = a; k.maks = Math.max(k.maks, a);
    }
  }
  IKIZ.robotKapak = kapak;

  /* ------------------------------------------------------------ QR ROBOT TARAFI PERDE (ADIM 142 9 Eki revizyonu, yüz düzleminde sarmalı perde): QR_PERDE_Gnn
     üst kenarı (tambur altı, gy+214) sabit, y'de (1 − açıklık) ölçeklenir; açıklık = programın qr[n].kapak (0 kapalı … 1 açık). Pivot / ölçek ENT `E.qr_perde` yoksa 142 tablosu. */
  const PD = E.qr_perde || Object.fromEntries(Array.from({ length: 12 }, (_, i) => { const G = 'G' + String(i + 1).padStart(2, '0');
    return [G, { dugum: 'QR_PERDE_' + G, ust_kenar_y: GY[Math.floor(i / 3)] + 214, alt_kenar_y_kapali: GY[Math.floor(i / 3)] + 1 }]; }));
  const perde = [];
  for (const [G, v] of Object.entries(PD)) {
    const o = dugum[v.dugum] || kok.getObjectByName(v.dugum); if (!o) continue;
    if (entSurer.has(v.dugum)) continue;
    const entP = (E.qr || {})[G] && E.qr[G].perde && E.qr[G].perde.dugum === v.dugum;    // ENT 10 Eki: qr[g].perde ile ENT sürer → burada yalnız ölçülür (çift sürüş yok)
    perde.push({ n: +G.slice(1), o, W0: o.matrixWorld.clone(), yUst: v.ust_kenar_y * 0.001, boy: (v.ust_kenar_y - v.alt_kenar_y_kapali) * 0.001, gos: 0, maks: 0, ent: !!entP });
  }
  function perdeUygula(f) {
    for (const k of perde) {
      const q = ((f.qr || {})[k.n] || {}).kapak; const a = Math.max(0, Math.min(1, q === true ? 1 : +q || 0)), s = Math.max(0.02, 1 - a);
      if (k.ent) { k.o.updateMatrixWorld(true); const e = new THREE.Vector3(); k.o.getWorldScale(e); const e0 = new THREE.Vector3(); k.W0.decompose(new THREE.Vector3(), new THREE.Quaternion(), e0); k.gos = 1 - e.y / e0.y; k.maks = Math.max(k.maks, k.gos); continue; }
      _M.makeTranslation(0, k.yUst, 0).multiply(new THREE.Matrix4().makeScale(1, s, 1)).multiply(new THREE.Matrix4().makeTranslation(0, -k.yUst, 0)).multiply(k.W0);
      k.o.parent.updateWorldMatrix(true, false); _Pi.copy(k.o.parent.matrixWorld).invert();
      _M.premultiply(_Pi).decompose(k.o.position, k.o.quaternion, k.o.scale);
      k.o.updateMatrixWorld(true); const e = new THREE.Vector3(); k.o.getWorldScale(e); const e0 = new THREE.Vector3(); k.W0.decompose(new THREE.Vector3(), new THREE.Quaternion(), e0);
      k.gos = 1 - e.y / e0.y; k.maks = Math.max(k.maks, k.gos);
    }
  }
  IKIZ.robotPerde = perde;

  /* ------------------------------------------------------------ KAPALI DÖNGÜ BANTLAR (ENT katkı türü `bant_yuzey`, ör. AX_TOP_BANT): düğüm hareket ETTİRİLMEZ (ENT kuralı);
     bandın üst yüzünde 6 ince işaret programın eksen değeri (mm × olcek → m) kadar `yon_yerel` boyunca kayar, bant boyunda modüler */
  const bantlar = [];
  for (const [ad, v] of Object.entries(E.eksen || {})) for (const k of v.katkilar || []) {
    if (k.tur !== 'bant_yuzey') continue;
    for (const n of k.dugumler || []) {
      const o = dugum[n] || kok.getObjectByName(n); if (!o) { ekle(`bant düğümü yok: ${n} (${ad})`); continue; }
      const yb = new THREE.Box3(); o.updateMatrixWorld(true);
      const inv = new THREE.Matrix4().copy(o.matrixWorld).invert();
      o.traverse(m => { if (m.isMesh) { m.geometry.computeBoundingBox(); yb.union(m.geometry.boundingBox.clone().applyMatrix4(new THREE.Matrix4().multiplyMatrices(inv, m.matrixWorld))); } });
      if (yb.isEmpty()) continue;
      const ax = ['x', 'y', 'z'][Math.max(0, (k.yon_yerel || [1, 0, 0]).findIndex(c => Math.abs(c) > 0.5))], sg = Math.sign((k.yon_yerel || [1, 0, 0]).find(c => Math.abs(c) > 0.5) || 1);
      const boy = yb.max[ax] - yb.min[ax], sz = new THREE.Vector3(); yb.getSize(sz);
      const ws = new THREE.Vector3(); o.getWorldScale(ws); const olcekYerel = 1 / (ws[ax] || 1);   // dünya metresi → düğüm yerel birimi
      const grup = new THREE.Group(); grup.name = 'IKIZ_BANT_ISARET_' + ad; o.add(grup);
      const mat = new THREE.MeshBasicMaterial({ color: 0x2b2b2b });
      const isaret = [];
      for (let i = 0; i < 6; i++) {
        const g = new THREE.BoxGeometry(ax === 'x' ? boy * 0.01 : sz.x * 0.9, ax === 'y' ? boy * 0.01 : Math.max(sz.y * 0.02, 1e-4), ax === 'z' ? boy * 0.01 : sz.z * 0.9);
        const m = new THREE.Mesh(g, mat); m.position.set((yb.min.x + yb.max.x) / 2, yb.max.y + Math.max(sz.y * 0.01, 5e-5), (yb.min.z + yb.max.z) / 2); grup.add(m); isaret.push(m);
      }
      bantlar.push({ ad, k, o, ax, sg, boy, min: yb.min[ax], olcekYerel, isaret, gos: 0 });
    }
  }
  function bantUygula(f) {
    for (const b of bantlar) {
      const v = (f.eksenler || {})[b.ad]; if (v == null) continue;
      const kay = (((v * (b.k.olcek ?? 0.001)) * b.olcekYerel * b.sg) % b.boy + b.boy) % b.boy;   // yüzey kayması (yerel birim, bant boyunda modüler)
      b.isaret.forEach((m, i) => { m.position[b.ax] = b.min + ((kay + i * b.boy / 6) % b.boy); });
      b.gos = kay; b.bek = kay;
    }
  }
  IKIZ.bantlar = bantlar;

  /* ------------------------------------------------------------ uygula */
  const qrMaks = {};
  // ENT ikiz-v4b (09:23, QR 4×3): kapi.ek_pivot → kapı parçaları (ek GLB) pivot_m etrafında döner, eski pivot düğümü (IKIZ_QR_Gnn_KAPI) kullanılmaz → açı ilk hareketli parçadan
  const kapiDugum = v => v.kapi.ek_pivot ? (v.kapi.hareketli_parca || []).map(n => dugum[n] || kok.getObjectByName(n)).find(o => o && ik.dinlenme.get(o)) : dugum[v.kapi.dugum];
  const kapiAci = v => { const o = kapiDugum(v), r0 = o && ik.dinlenme.get(o); return o && r0 ? 2 * Math.acos(Math.min(1, Math.abs(o.quaternion.dot(r0.q)))) * 180 / Math.PI / v.kapi.acik_deg : null; };
  // acd2c329 E devamı: katlama saati doğrudan program karesinden gelir.
  // Program ROBOT'a devrettikten sonra gerçek kavramaya kadar son karton duruşu korunur.
  const eKat = { id: null, t: null, adim: [] }; IKIZ.eKatlama = eKat;
  function eKutuSaati(f) {
    if (!E.blank || f.e_kutu_t === undefined) return undefined;
    const u = (f.urunler || []).find(x => x.tur === 'E_KUTU');
    if (f.e_kutu_t != null && Number.isFinite(f.e_kutu_t)) {
      const id = u ? (u.id ?? u.siparis_id ?? 'E') : null;
      if (id !== eKat.id) { eKat.id = id; eKat.adim = []; }
      // ENT robot eşiği kartonu gizleyip dinlenme geometrisine döndürür.
      // Kapanmış karton, gerçek kavramaya kadar bu eşiğin hemen önünde kalmalı.
      eKat.t = Math.min(f.e_kutu_t, E.blank.robot ? E.blank.robot.t_gercek - 1e-6 : Infinity);
      if (eKat.adim.length < 400) eKat.adim.push([f.t, eKat.t]);
    } else {
      const bekleyen = (f.urunler || []).some(x => x.tur === 'KUTU' && String(x.yer).toUpperCase() === 'ROBOT' && !kutuKlon.has(x.id));
      if (!bekleyen) { eKat.id = null; eKat.t = null; }
    }
    return eKat.t;
  }
  let silAnlik = {};
  /* TOPPING TUR 3 (Kemal 'UNO'lar hepsi çalışıyor mu'): eşleme UNO pistonunu bobin çıkışıyla (DO 0 / 1 → model stroku 49,4 mm) TEK SEFERDE itiyordu; program artık iç bölgede pistonu
     darbeli sürdüğü için DO titrerdi. Piston programın IO-Link strok ölçüsüyle (AI_TOP_UNO_<K>_STROK − doz başı) ilerler, doz bitince (döner valf kapanınca) geri çekilir (dolum).
     KIYMA_ORTA'nın eşlemede satırı yok (ENT: cikis DO_TOP_VALF_KIYMA_ORTA_PISTON eksik) → düğüm adından bulunur, yön ötekilerle aynı (−z). */
  const UNO_P = ['HARC', 'SOS', 'KIYMA', 'KUSBASI', 'KIYMA_ORTA'].map(K => { const c = ((E.cikis || {})['DO_TOP_VALF_' + K + '_PISTON'] || {}).katkilar, k0 = c && c[0];
    const adlar = k0 ? k0.dugumler : ['TOPPING_MODUL__paslanmaz__PISTON_' + K, 'TOPPING_MODUL__pom__PISTON_' + K];
    const os = adlar.map(n => dugum[n] || kok.getObjectByName(n)).filter(Boolean).map(o => ({ o, p0: ((ik.dinlenme && ik.dinlenme.get(o)) || { p: o.position }).p.clone() }));
    return { K, os, yon: new THREE.Vector3(...((k0 && k0.yon_dunya) || [0, 0, -1])), strok: (k0 && k0.model_strok_mm) || 49.4, esleme: !!k0, s0: null, mm: 0 }; });
  IKIZ.unoPiston = () => UNO_P.map(u => ({ K: u.K, dugum: u.os.length, esleme: u.esleme, mm: +u.mm.toFixed(2) }));
  function unoPistonUygula(f) {
    const ck = f.cikislar || {}, an = f.analog || {};
    for (const u of UNO_P) { if (!u.os.length) continue; const valf = !!ck['DO_TOP_VALF_' + u.K + '_VALF'], s = +an['AI_TOP_UNO_' + u.K + '_STROK'];
      if (valf && isFinite(s)) { if (u.s0 == null) u.s0 = s; u.mm = Math.max(0, Math.min(u.strok, s - u.s0)); } else { u.s0 = null; u.mm = 0; }
      for (const x of u.os) x.o.position.copy(x.p0).addScaledVector(u.yon, u.mm / 1000); }
  }
  function uygula(f) {

    qrDonanimUygula(f);
    robotTutucuUygula({...f,robot_poz:robot.son||f.robot_poz});
    silAnlik = f.silindirler || {};
    const r = robot.son;
    const rb = { ...(f.robot || {}) };
    if (r) Object.assign(rb, { eklem: r.eklem, gripper: r.gripper, kapanma:r.kapanma,urun:r.urun, ray_konum: RAY_MUTLAK ? r.ray_m * 1000 : (r.ray_m - RAIL_MIN) * 1000 }); else Object.assign(rb, { eklem: null, ray_konum: null });
    const ek = { ...(f.eksenler || {}) }; delete ek.AX_ROB_RAY;      // ray: eşlemede yon_dunya yok (eklem düğümü, yerel) → robot siminin ray_m'si ile sürülür
    if(Number.isFinite(f.tabla_donus_deg))ek.AX_TOP_TABLA=f.tabla_donus_deg;
    const d = { ...f, eksenler: ek, robot: rb };
    if (E.blank && (f.urunler || []).some(u => u.tur === 'KUTU')) {
      kapaliKartonKur(d);
      for (const u of f.urunler) if (u.tur === 'KUTU' && !kutuKlon.has(u.id)) kutuKlon.set(u.id, kapaliKarton);
    }
    const tk = eKutuSaati(f); IKIZ.eKutuT = tk;
    if (tk !== undefined) d.e_kutu_t = tk;
    ik.uygula(d); robotKabloUygula(f); eKartonUygula(d);
    if (E.blank && E_KOK && !(f.urunler || []).some(u => u.tur === 'E_KUTU')) E_KOK.visible = false;
    robot.uygulanan = r; unoPistonUygula(f);
    aciciP = aciciUygula(f); cStok.uygula(f); servis.uygula(f); urunUygula(f); kapakUygula(f); perdeUygula(f); bantUygula(f); silindirUygula(f); spreyUygula(f); isikUygula(f);
    for (const [g, v] of Object.entries(E.qr)) { const n = +g.replace(/^G0?/, ''), a = kapiAci(v); if (a != null) qrMaks[n] = Math.max(qrMaks[n] || 0, a); }
    for (const [id, c] of Object.entries(f.cekmeceler || {})) {      // her çekmecenin gördüğü en büyük açıklık: program ↔ 3B (anlık örnekleme kaçırmasın)
      const o = otel.find(x => x.ad === 'AX_B_' + id); if (!o) continue; const r0 = ik.dinlenme.get(o.o); const tam = (700 - o.k.sifir) * o.k.olcek;
      const m = cekMaks[id] = cekMaks[id] || { program: 0, gosterilen: 0 }; m.program = Math.max(m.program, (c.konum || 0) / 700); m.gosterilen = Math.max(m.gosterilen, o.o.position.clone().sub(r0.p).dot(o.yon) / tam);
    }
    IKIZ.sonUygulanan = f.t; IKIZ.sonD = d;
  }
  const cekMaks = IKIZ.cekmeceMaks = {};

  /* ------------------------------------------------------------ 3B ↔ program farkı (gösterilen düğümden geri okunur) */
  const KOL = Object.keys(E.robot.kol);
  const say = {};
  for (const tablo of ['eksen', 'cikis']) for (const v of Object.values(E[tablo])) for (const k of v.katkilar || []) for (const n of k.dugumler || []) say[n] = (say[n] || 0) + 1;
  const otel = [];
  for (const [ad, v] of Object.entries(E.eksen)) for (const k of v.katkilar || []) {
    const n = (k.dugumler || []).find(x => say[x] === 1);
    if (k.tur === 'oteleme' && k.yon_dunya && n && dugum[n] && !otel.some(x => x.ad === ad)) otel.push(      // eksen başına ANA katkı (ilk); teleskop ara kızak gibi yarım katkılar ayrıca gösterilir
      { ad, o: dugum[n], k, yon: new THREE.Vector3(...k.yon_dunya) });
  }
  IKIZ.fark = () => {
    const f = IKIZ.sonD; if (!f) return null;
    const out = { t: f.t };
    const rs = robot.uygulanan;
    if (rs) {
      let mx = 0;
      KOL.forEach((j, i) => { const q = dugum[E.robot.kol[j].dugum].quaternion; const a = 2 * Math.atan2(q.z, q.w); const dq = Math.abs(((a - rs.eklem[i]) % (2 * Math.PI) + 3 * Math.PI) % (2 * Math.PI) - Math.PI); mx = Math.max(mx, dq); });
      const rj = dugum[E.robot.tum.RailJoint.dugum]; const dr = Math.abs(rj.position.x - (rs.ray_m - RAIL_MIN));   // ENT ikiz-v2 (10 Eki 13:1x): body_07 yerel x = (ray_mm − 1176) / 1000 (dinlenme 0,539 = PARK 1715)
      out.robot = { gorev: rs.gorev, program_gorev: ((IKIZ.son || {}).robot || {}).gorev || null, fark_rad: +mx.toFixed(9), ray_fark_m: +dr.toFixed(9), sayi: robot.sayi, dogrulandi: rs.dogrulandi };
      const tcp = robot.son && robot.son.tcp; if (Array.isArray(tcp) && ARAC) { ARAC.updateMatrixWorld(true); const w = ARAC.getWorldPosition(new THREE.Vector3());   // KABUL-B: 3B flanş (bagli_dugum) ↔ robot simi rig_fk flanşı (tcp, web m)
        out.robot.uc_fark_m = +w.distanceTo(new THREE.Vector3(...tcp)).toFixed(5); out.robot.uc = [+w.x.toFixed(4), +w.y.toFixed(4), +w.z.toFixed(4)]; out.robot.tcp = tcp; }
    }
    out.eksen = {}; const ek = f.eksenler || {};
    for (const { ad, o, k, yon } of otel) {
      const v = ek[ad]; if (v == null) continue; const r0 = ik.dinlenme.get(o);
      const bek = (v - k.sifir) * k.olcek, gos = o.position.clone().sub(r0.p).dot(yon);
      out.eksen[ad] = { beklenen_m: +bek.toFixed(6), gosterilen_m: +gos.toFixed(6), fark_m: +Math.abs(bek - gos).toFixed(6) };
    }
    out.cekmece = {};
    for (const id of Object.keys(f.cekmeceler || {})) {        // 0…1 = program konumu / 700 mm strok; 3B tam açıklığı eşlemenin ölçeğiyle (model çekmece stroku)
      const e = out.eksen['AX_B_' + id], o = otel.find(x => x.ad === 'AX_B_' + id); if (!e || !o) continue; const tam = (700 - o.k.sifir) * o.k.olcek;
      out.cekmece[id] = { beklenen: +(e.beklenen_m / tam).toFixed(4), gosterilen: +(e.gosterilen_m / tam).toFixed(4), fark: +(e.fark_m / tam).toFixed(4), model_strok_m: +tam.toFixed(4) };
    }
    out.kapi = {};
    for (const [g, v] of Object.entries(E.qr)) {
      const n = +g.replace(/^G0?/, ''), gos = kapiAci(v); if (gos == null) continue;
      const bek = ((f.qr || {})[n] || {}).kapi === 0 ? 1 : 0;
      out.kapi[n] = { beklenen: bek, hedef: bek, gosterilen: +gos.toFixed(3), maks: +(qrMaks[n] || 0).toFixed(3), fark: +Math.abs(bek - gos).toFixed(3) };
    }
    out.robot_kapak = {};
    for (const k of kapak) {                                                    // gösterilen açı düğümün dünya dönüşünden geri okunur
      const q = new THREE.Quaternion(); k.o.getWorldQuaternion(q); const q0 = new THREE.Quaternion(); k.W0.decompose(new THREE.Vector3(), q0, new THREE.Vector3());
      const gos = 2 * Math.acos(Math.min(1, Math.abs(q.dot(q0)))) * 180 / Math.PI / Math.abs(k.deg);
      const bek = (q_ => Math.max(0, Math.min(1, q_ === true ? 1 : +q_ || 0)))(((f.qr || {})[k.n] || {}).kapak);
      out.robot_kapak[k.n] = { beklenen: bek, gosterilen: +gos.toFixed(4), maks: +k.maks.toFixed(3), fark: +Math.abs(bek - gos).toFixed(4) };
    }
    out.bant = {};
    for (const b of bantlar) {                                                  // işaretin gösterilen kayması (ilk işaretin konumundan geri okunur) ↔ programın eksen değeri
      const v = (f.eksenler || {})[b.ad]; if (v == null) continue;
      const bek = (((v * (b.k.olcek ?? 0.001)) * b.olcekYerel * b.sg) % b.boy + b.boy) % b.boy, gos = b.isaret[0].position[b.ax] - b.min;
      const d = Math.abs(bek - gos); out.bant[b.ad] = { beklenen: +bek.toFixed(6), gosterilen: +gos.toFixed(6), fark: +Math.min(d, b.boy - d).toFixed(6), boy: +b.boy.toFixed(4) };
    }
    out.robot_perde = {};
    for (const k of perde) {                                                    // gösterilen açıklık düğümün dünya ölçeğinden geri okunur
      const bek = (q_ => Math.max(0, Math.min(1, q_ === true ? 1 : +q_ || 0)))(((f.qr || {})[k.n] || {}).kapak), bekS = k.ent ? bek : Math.min(bek, 0.98);      // kendi sürüşümüz tam açıkta 0,98'de durur; ENT sürüşü (10 Eki) 0,999'a açar
      out.robot_perde[k.n] = { beklenen: +bek.toFixed(4), gosterilen: +k.gos.toFixed(4), maks: +k.maks.toFixed(3), fark: +Math.abs(bekS - k.gos).toFixed(4) };
    }
    out.silindir = {};                                                           // gösterilen strok (düğümün dinlenmeden yer değiştirmesi) ↔ tesis SX_* mm
    for (const g of silOgeler) { if (out.silindir[g.sx] || silSon[g.sx] == null) continue; const r0 = ik.dinlenme.get(g.o); if (!r0) continue;   // geçiş sürerken (a < 1) karşılaştırma ara hedefe (g.vs), bitince programa
      const gos = g.o.position.clone().sub(r0.p).dot(g.yon) / g.olcek + g.sifir, ara = g.a != null && g.a < 1, ref = ara ? g.vs : silSon[g.sx]; out.silindir[g.sx] = { beklenen: +(+silSon[g.sx]).toFixed(3), gosterilen: +gos.toFixed(3), ara, fark: +Math.abs(gos - ref).toFixed(4) }; }
    out.sprey = sprey.visible;
    out.urun = IKIZ.urunSayisi || 0;
    return out;
  };
  IKIZ.robotSur = robot; IKIZ.robotNeden = robotNeden; IKIZ.ent = ik;
  function temizle() { urunMarkalari.clear();
    for (const k of kopya.values()) k.o.removeFromParent();
    kopya.clear(); kesildi.clear(); kutuKlon.clear(); topDurum.clear();
    IKIZ.toppingParcaDurum?.clear(); IKIZ.toppingParca?.temizle?.(); yagIziUygula.temizle?.();
    for (const k of Object.keys(elBekle)) delete elBekle[k];
    elBekleyen.clear(); birakti.clear(); sonElde = null;
    fYum.clear(); kPide.clear(); IZ.clear(); izT = null;
    eKat.id = null; eKat.t = null; eKat.adim = []; eLevhaId = null; eLevhaMm = 0;
    if (eKatliKap) eKatliKap.visible = false;
    for (const o of KONI) { const s = koniSon.get(o); if (s && Math.abs(o.position.y - s.y) < 1e-9) o.position.y -= s.dy; }
    koniSon.clear(); aBas = null; merdaneDy = 0; merdaneT = null;
    silSon = {}; silDuvar = null;
    silAnlik = {}; spreyOnce = null; sprey.visible = false; aciciP = 0;
    for (const g of silOgeler) { g.v0 = g.v1 = g.vs = null; g.dur = 0; }
    for (const u of UNO_P) { u.s0 = null; u.mm = 0; }
    robot.son = null;
  }
  return { robotPoz, uygula, kareUygula, temizle, robot, olcumKaydet:f=>IKIZ.toppingParca?.kaydet?.(f) };
}
