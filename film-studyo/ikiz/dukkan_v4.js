/* İKİZ · DÜKKÂN v4 (Kemal R24, 10 Eki gece — YÖNETİCİ onayı D1–D8): aydınlatma, kapı donanımı + sürgü açılışı, süpürgelik / tavan kenarı / tabela alanı,
   görünen tesisat uçları (priz, menfez, sigorta panosu kapağı, bulaşık bağlantısı), interkom, QR yönlendirme oku, AZM40 kapı kilidi, ekran gövdeleri (föy ölçüsüyle).
   Ölçüler KAT tablosunda — her satırda kaynak (üretici föyü); föyü olmayan satır 'kaynak: VARSAYIM' ile işaretli ve RAPOR'da ayrıca yazılır. Ana modele girmez (dükkân = ikiz). */
// D7 tesisat uçları (baglantilar) tek kaynak
import { PERSONEL } from '../ikiz_personel/personel_v2.js';
export const KAT = {
  PANEL_LED: { g: 0.595, d: 0.595, h: 0.063, lm: 3600, k: 4000, w: 26, model: 'Philips CoreLine Panel G6 RC132V 36S/840 PSD W60L60', kaynak: 'signify.com ürün sayfası (595 × 595 × 63, 3600 lm, 4000 K, 26 W)' },
  SERIT_LED: { g: 0.016, h: 0.012, model: 'KLUŚ PDS-4-ALU (A01718)', kaynak: 'KLUŚ föyü s.1 (0,6" × 0,5" → 16 × 12 mm)' },
  AZM40: { g: 0.040, y: 0.1195, d: 0.020, akt_g: 0.040, akt_y: 0.040, akt_d: 0.020, model: 'Schmersal AZM40 + AZM40-B1', kaynak: 'products.schmersal.com AZM40 (119,5 × 40 × 20) / AZM40-B1 (40 × 40 × 20)' },
  SURGU_OP: { y: 0.100, d: 0.180, model: 'dormakaba ES 200', kaynak: 'dormakaba ES 200 sayfası (yükseklik 100) + ES 200-2D broşürü s.3 (derinlik 180)' },
  KAPATICI: { g: 0.275, y: 0.060, d: 0.053, model: 'dormakaba TS 93 EN 2-5', kaynak: 'dormakaba BIM do_491 (275 × 60 × 53)' },
  KOL: { uz: 0.125, cikinti: 0.058, rozet_y: 0.052, rozet_g: 0.052, rozet_d: 0.008, model: 'Hoppe Amsterdam E1400Z', kaynak: 'BAYİ (Toolbrothers / Galaxus): kol 125, rozet 52 × 52 × 8 — hoppe.com sayfasında ölçü yok' },
  MENTESE: { y: 0.160, g: 0.028, model: 'Simonswerk TECTUS TE 340 3D', kaynak: 'Simonswerk ürün seçici (boy 160, kanat parçası 28)' },
  PRIZ: { g: 0.086, y: 0.086, d: 0.010, model: 'Legrand Valena Life 754151', kaynak: 'legrand.com e-katalog (86 × 86 × 10)' },
  MENFEZ: { g: 0.356, y: 0.206, d: 0.015, model: 'TROX AT 300 × 150', kaynak: 'TROX SA3/2/EN/6 s.3: ön yüz (300 + 2 × 28) × (150 + 2 × 28); derinlik 15 VARSAYIM (föyde ön çerçeve kalınlığı yok)' },
  SIGORTA: { g: 0.348, y: 0.5055, d: 0.0045, model: 'Hager Volta VU24UA (sıva altı, 2 × 12)', kaynak: 'hager.com VU24UA (348 × 505,5 × 94,5; gömme 90 → duvardan 4,5)' },
  INTERKOM: { g: 0.107, y: 0.130, d: 0.028, model: '2N IP Verso 2.0 tek modül, sıva üstü', kaynak: '2N kurulum kılavuzu Technical Parameters (107 × 130 × 28)' },
  OKC_POS: { g: 0.0911, y: 0.06585, d: 0.1944, model: 'Ingenico Move/5000 F (ÖKC + POS, Türkiye)', kaynak: 'BAYİ VERİSİ (KarPOS / Baybarkod / AcilYazarkasa aynı: 194,4 × 91,1 × 65,85, 420 g). Üretici (Ingenico TR / Worldline TR) cihaz dış ölçüsü YAYIMLAMIYOR — yalnız 420 g + para çekmecesi; global Move/5000 resmî 169 × 78 × 57 (320 g, farklı gövde)' },
  WIFI_AP: { g: 0.160, d: 0.160, h: 0.0336, model: 'TP-Link Omada EAP650 (V3) — şema: Omada EAP (F/U ile aynı)', kaynak: 'omadanetworks.com EAP650 (160 × 160 × 33,6, tavan / T-bar / duvar kiti)' },
  BULASIK: { su: 'G 3/4" (DN 15)', gider: 'DN 50, yerden ≤ 700', model: 'MEIKO bağlantı (UPster U 500 föyü; personel ünitesi M-iClean US — bağlantı standardı aynı VARSAYIM)', kaynak: 'meiko.com M-iPlan bağlantı çizimi' },
};
/* EKRANLAR (dukkan.js D tablosu bunlardan): kiosk 32" portre = Samsung QM32C dikey (duvar kiosk gövdesi föyü Samsung / LG'de yok → ekran + VESA askı; ödeme / fiş birimi VARSAYIM) ·
   TV 43" dikey = Samsung QB43C · şerit = LG 37BH7N-H 32:9 (49" 32:9 LG / Samsung'da YOK → en yakın 37") · POS = Samsung Galaxy Tab Active5 (126,8 × 213,8 × 10,1) */
export const EKRAN = {
  KIOSK: { g: 0.4219, y: 0.7273, d: 0.0285, aktif: [0.39285, 0.6984], vesa: 0.100, model: 'Samsung QM32C (LH32QMCEBGCXEN) portre', kaynak: 'Samsung DE föy s.3 (727,3 × 421,9 × 28,5), aktif s.2' },
  TV: { g: 0.5578, y: 0.9695, d: 0.0285, aktif: [0.5294, 0.9412], vesa: 0.200, model: 'Samsung QB43C (LH43QBCEBGCXEN) dikey', kaynak: 'Samsung DE föy s.3 (969,5 × 557,8 × 28,5), aktif s.2' },
  SERIT: { g: 0.9223, y: 0.2883, d: 0.0435, aktif: [0.9037, 0.2571], vesa: [0.400, 0.200], model: 'LG 37BH7N-H (32:9, 1920 × 540) — 49" yok', kaynak: 'LG US föy s.1 / s.5 (922,3 × 288,3 × 43,5); aktif çerçeveden hesap' },
  POS: { g: 0.2138, y: 0.1268, d: 0.0101, aktif: [0.1723, 0.1077], model: 'Samsung Galaxy Tab Active5 (SM-X300)', kaynak: 'Samsung AU sayfası / US föy s.2 (126,8 × 213,8 × 10,1); aktif 8" 16:10 hesap' },
};

export function dukkanV4(THREE, scene, g, D, kutu, MAT) {
  const ek = [];                                                               // { ad, tur, kutu } — dükkân listesine eklenir
  const say = { isik: 0, armatur: 0 };
  const { CEPHE_IC: CI, CEPHE_DIS: CD, HUCRE_DUVAR: HD, HUCRE_PANEL: HP, X0, X1, TAVAN } = D;
  const HDi = HD + HP, [a0, a1] = D.AYIRICI;
  const isikMat = new THREE.MeshStandardMaterial({ color: 0xf7f6f2, emissive: 0xfff4e0, emissiveIntensity: 1.6, roughness: 0.6 });
  const cerceveMat = new THREE.MeshStandardMaterial({ color: 0xdfe1e3, metalness: 0.5, roughness: 0.4 });
  // Tavan armatürleri kullanıcı isteğiyle kaldırıldı.
  // QR has an opaque flush technical enclosure. No external LED profile or
  // light fixture crosses its customer fascia.

  /* D5 süpürgelik (h 80, 12 mm) iç duvarlar boyunca · tavan kenarı köşe profili (40 × 40) · cephe dışı TABELA ALANI (metin yok) */
  const sup = new THREE.MeshStandardMaterial({ color: 0x5b5f66, roughness: 0.6 });
  const SH = 0.080, ST = 0.012;
  kutu('SUPURGELIK_CEPHE_P', X0, a0, 0, SH, CI - ST, CI, sup, 'supurgelik');
  kutu('SUPURGELIK_CEPHE_M', a1, X1, 0, SH, CI - ST, CI, sup, 'supurgelik');
  kutu('SUPURGELIK_SOL', X0, X0 + ST, 0, SH, HDi, CI, sup, 'supurgelik');
  kutu('SUPURGELIK_SAG', X1 - ST, X1, 0, SH, D.QR_YUZ, CI, sup, 'supurgelik');
  kutu('SUPURGELIK_AYIRICI_P', a0 - ST, a0, 0, SH, HDi, CI, sup, 'supurgelik');
  kutu('SUPURGELIK_AYIRICI_M', a1, a1 + ST, 0, SH, D.QR_YUZ, CI, sup, 'supurgelik');
  const tk = new THREE.MeshStandardMaterial({ color: 0xf2f0ec, roughness: 0.8 }), TK = 0.040;
  kutu('TAVAN_KENAR_CEPHE', X0, X1, TAVAN - TK, TAVAN, CI - TK, CI, tk, 'tavan');
  kutu('TAVAN_KENAR_SOL', X0, X0 + TK, TAVAN - TK, TAVAN, HDi, CI, tk, 'tavan');
  kutu('TAVAN_KENAR_SAG', X1 - TK, X1, TAVAN - TK, TAVAN, D.QR_YUZ, CI, tk, 'tavan');
  const tab = new THREE.MeshStandardMaterial({ color: 0x23272d, roughness: 0.5, metalness: 0.3 });
  kutu('TABELA_ALANI', D.PENCERE[0], D.KAPI_M[1], 2.22, 2.70, CD, CD + 0.06, tab, 'tabela');           // marka metni YOK (Kemal markası belli olunca)

  /* D4 KAPILAR */
  const [p0, p1] = D.KAPI_P, [m0, m1] = D.KAPI_M, [h0, h1] = D.HUCRE_KAPI, KY = D.KAPI_Y, HKY = D.HUCRE_KAPI_Y;
  const krom = new THREE.MeshStandardMaterial({ color: 0xc9cdd2, metalness: 0.85, roughness: 0.25 });
  const kanatMat = new THREE.MeshStandardMaterial({ color: 0x3a3f46, metalness: 0.3, roughness: 0.5 });
  const K = KAT.KOL, ME = KAT.MENTESE, KP = KAT.KAPATICI;
  function kol(ad, x, y, z, yon) {                                              // rozet + kol (yatay, kapı yüzüne dik değil — yüzeye paralel, yon: +1 / −1 x)
    kutu(ad + '_ROZET', x - K.rozet_g / 2, x + K.rozet_g / 2, y - K.rozet_y / 2, y + K.rozet_y / 2, z, z + K.rozet_d * Math.sign(yon.z || 1), krom, 'donanim');
    const zz = z + (K.cikinti - 0.009) * Math.sign(yon.z || 1);
    kutu(ad + '_KOL', Math.min(x, x + yon.x * K.uz), Math.max(x, x + yon.x * K.uz), y - 0.009, y + 0.009, Math.min(zz, zz + 0.018), Math.max(zz, zz + 0.018), krom, 'donanim');
    kutu(ad + '_BOYUN', x - 0.009, x + 0.009, y - 0.009, y + 0.009, Math.min(z, zz), Math.max(z, zz), krom, 'donanim');
  }
  // personel / kurye kapısı: kanat (dışa açılır, menteşe solda x p0), kol, 3 menteşe, kapatıcı (iç yüz üstte); yaklaşınca 90° açılır
  const pk = new THREE.Group(); pk.name = 'DUKKAN__KAPI_PERSONEL_KANAT_PIVOT'; pk.position.set(p0 + 0.01, 0, CD); g.add(pk);
  const pkK = new THREE.Mesh(new THREE.BoxGeometry(p1 - p0 - 0.02, KY - 0.05, 0.045), kanatMat); pkK.position.set((p1 - p0 - 0.02) / 2, (KY - 0.05) / 2 + 0.01, -0.0225 - 0.03); pkK.name = 'DUKKAN__KAPI_PERSONEL_KANAT'; pk.add(pkK);
  ek.push({ ad: 'KAPI_PERSONEL_KANAT', tur: 'kapi', kutu: [p0, p1, 0, KY, CI, CD].map(v => +v.toFixed(3)) });
  for (const [i, y] of [[1, 0.25], [2, 1.05], [3, KY - 0.25]]) kutu('KAPI_PERSONEL_MENTESE_' + i, p0 - 0.005, p0 + ME.g, y - ME.y / 2, y + ME.y / 2, CD - 0.01, CD + 0.005, krom, 'donanim');
  kol('KAPI_PERSONEL_KOL_DIS', p1 - 0.08, 1.05, CD + 0.001, { x: -1, z: 1 }); kol('KAPI_PERSONEL_KOL_IC', p1 - 0.08, 1.05, CI - 0.001, { x: -1, z: -1 });
  kutu('KAPI_PERSONEL_KAPATICI', p0 + 0.06, p0 + 0.06 + KP.g, KY - 0.11, KY - 0.11 + KP.y, CI - KP.d, CI, krom, 'donanim');
  // müşteri kapısı: sürgü operatörü kutusu (ray üstü, föy ölçüsü) — kanatlar AÇIK konum x 3,84–4,31 (dışta solda), KAPALI x 4,31–5,21 (iki teleskopik kanat)
  const SO = KAT.SURGU_OP;
  kutu('KAPI_MUSTERI_OPERATOR', D.KAPI_M_RAY[0], D.KAPI_M_RAY[1], KY + 0.08, KY + 0.08 + SO.y, CD, CD + SO.d, kanatMat, 'donanim');
  // hücre kapısı (makine hücresi, cam kanat): 3 menteşe + kol + kapatıcı + AZM40 kilit (kasa sağ, kanatta aktüatör)
  for (const [i, y] of [[1, 0.25], [2, 1.0], [3, HKY - 0.25]]) kutu('HUCRE_KAPI_MENTESE_' + i, h0 + 0.025, h0 + 0.025 + ME.g, y - ME.y / 2, y + ME.y / 2, HDi, HDi + 0.012, krom, 'donanim');
  kol('HUCRE_KAPI_KOL', h1 - 0.10, 1.05, HDi + 0.001, { x: -1, z: 1 });
  kutu('HUCRE_KAPI_KAPATICI', h0 + 0.06, h0 + 0.06 + KP.g, HKY - 0.10, HKY - 0.10 + KP.y, HDi, HDi + KP.d, krom, 'donanim');
  const A = KAT.AZM40, azmMat = new THREE.MeshStandardMaterial({ color: 0xe5c11a, roughness: 0.5 });   // Schmersal sarı gövde
  kutu('AZM40_KILIT', h1 + 0.005, h1 + 0.005 + A.g, 1.10, 1.10 + A.y, HDi, HDi + A.d, azmMat, 'guvenlik');
  kutu('AZM40_AKTUATOR', h1 - 0.03 - A.akt_g, h1 - 0.03, 1.10 + (A.y - A.akt_y) / 2, 1.10 + (A.y + A.akt_y) / 2, HDi, HDi + A.akt_d, krom, 'guvenlik');

  /* D7 görünen tesisat uçları (kanal YOK — sıva altı) */
  const beyaz = new THREE.MeshStandardMaterial({ color: 0xf4f4f2, roughness: 0.5 }), gri = new THREE.MeshStandardMaterial({ color: 0x8d9298, metalness: 0.4, roughness: 0.4 });
  const PR = KAT.PRIZ;
  kutu('PRIZ_TEZGAH_1', 1.95, 1.95 + PR.g, 1.05, 1.05 + PR.y, HDi, HDi + PR.d, beyaz, 'tesisat');       // tezgâh üstü (POS / şarj), hücre duvarının personel yüzü
  kutu('PRIZ_TEZGAH_2', 2.05, 2.05 + PR.g, 1.05, 1.05 + PR.y, HDi, HDi + PR.d, beyaz, 'tesisat');
  kutu('PRIZ_KIOSK', a1, a1 + PR.d, 0.30, 0.30 + PR.y, 2.30, 2.30 + PR.g, beyaz, 'tesisat');
  const MF = KAT.MENFEZ;
  kutu('MENFEZ_MUSTERI', 4.60, 4.60 + MF.g, TAVAN - 0.25, TAVAN - 0.25 + MF.y, CI - MF.d, CI, gri, 'tesisat');
  const SG = KAT.SIGORTA;
  kutu('SIGORTA_PANOSU_KAPAK', X0, X0 + SG.d, 1.40, 1.40 + SG.y, 1.90, 1.90 + SG.g, beyaz, 'tesisat');   // v2: z 1,90–2,248 (el lavabosu z 2,275–2,725 sol duvarda)   // sol duvar iç yüzü, personel kapısı yanında (sıva altı kutu, yalnız kapak)
  /* C 11 Eki (R24 D7): bulaşık / evye / lavabo bağlantı UÇLARI sahnede yoktu → tek kaynak PERSONEL.baglantilar (personel_v2 üreteci: konum + föy değeri) ağızları duvardan çıkan uç olarak çizilir.
     su: köşe musluk ucu G ¾" / ½" (boru dış çapı 26,9 / 21,3 mm, EN 10255) · tahliye: değerdeki Ø (hortum / PP boru dış çapı) · priz: Legrand Valena Life (KAT.PRIZ). Uç boyu 60 mm + rozet Ø 60 × 8 [V]. */
  { const krom = new THREE.MeshStandardMaterial({ color: 0xc9ccd1, metalness: 0.9, roughness: 0.25 }), pp = new THREE.MeshStandardMaterial({ color: 0x9aa0a6, roughness: 0.6 });
    const ad_ = t => t.toUpperCase().replace(/İ/g, 'I').replace(/Ş/g, 'S').replace(/Ğ/g, 'G').replace(/Ü/g, 'U').replace(/Ö/g, 'O').replace(/Ç/g, 'C').replace(/[^A-Z0-9]+/g, '_').replace(/^_|_$/g, '');
    const uc = (ad, x, y, z, yon, cap, mat) => { const L = 0.060, m = new THREE.Mesh(new THREE.CylinderGeometry(cap / 2, cap / 2, L, 24), mat); m.rotation.z = Math.PI / 2; m.position.set(x + yon * L / 2, y, z); m.name = 'DUKKAN__TESISAT_' + ad; g.add(m);
      const r = new THREE.Mesh(new THREE.CylinderGeometry(0.030, 0.030, 0.008, 32), krom); r.rotation.z = Math.PI / 2; r.position.set(x + yon * 0.004, y, z); r.name = 'DUKKAN__TESISAT_' + ad + '_ROZET'; g.add(r);
      ek.push({ ad: 'TESISAT_' + ad, tur: 'tesisat', kutu: [Math.min(x, x + yon * L), Math.max(x, x + yon * L), y - cap / 2, y + cap / 2, z - cap / 2, z + cap / 2].map(v => +v.toFixed(3)) }); };
    for (const b_ of PERSONEL.baglantilar || []) {
      const yon = b_.x > 2 ? -1 : 1, n = ad_(b_.ad), v = String(b_.deger || ''), cap_ = /Ø\s*(\d+)/.exec(v);
      if (/priz|elektrik/i.test(b_.ad) && !/su|tahliye/i.test(b_.ad)) { const PR = KAT.PRIZ; kutu('TESISAT_' + n, yon < 0 ? b_.x - PR.d : b_.x, yon < 0 ? b_.x : b_.x + PR.d, b_.y - PR.y / 2, b_.y + PR.y / 2, b_.z - PR.g / 2, b_.z + PR.g / 2, beyaz, 'tesisat'); continue; }
      if (/tahliye/i.test(b_.ad)) { uc(n, b_.x, b_.y, b_.z, yon, cap_ ? +cap_[1] / 1000 : 0.040, pp); continue; }
      if (/su/i.test(b_.ad)) { uc(n, b_.x, b_.y, b_.z, yon, /¾|3\/4/.test(v) ? 0.0269 : 0.0213, krom); continue; }
      uc(n, b_.x, b_.y, b_.z, yon, 0.040, pp); } }

  /* Kemal (makine kontrol şeması, 23:xx): ÖKC + POS tezgâhta (POS tabletinin sağında, düz yatar — şarj tabanı ölçüsü föyde yok, çizilmez) · Wi-Fi AP (TP-Link Omada EAP650) tavanda (personel / müşteri arası, ayırıcının üstüne yakın) */
  const OK = KAT.OKC_POS, ox = 2.11, oz = D.TEZGAH[2] + 0.14, oy = D.TEZGAH[5];
  kutu('OKC_POS_MOVE5000F', ox - OK.g / 2, ox + OK.g / 2, oy, oy + OK.y, oz - OK.d / 2, oz + OK.d / 2, new THREE.MeshStandardMaterial({ color: 0x1b1d21, roughness: 0.45 }), 'cihaz');
  /* D8 interkom (kurye / personel kapısı dışı) + QR yönlendirme oku (müşteri bölgesi zemini, kapıdan QR'ye) */
  const IK = KAT.INTERKOM;
  // D1b (Kemal 22 Eki, YÖNETİCİ): dış interkom SİLİNDİ — cephe çıtaları arasında 3 çubuk gibi görünüyor, cam profiline biniyordu. Satır devre dışı:
  // kutu('INTERKOM_DIS', p1 + 0.08, p1 + 0.08 + IK.g, 1.30, 1.30 + IK.y, CD, CD + IK.d, gri, 'cihaz');
  { const ok = new THREE.Shape(); ok.moveTo(0, 0.30); ok.lineTo(0.16, 0.10); ok.lineTo(0.06, 0.10); ok.lineTo(0.06, -0.30); ok.lineTo(-0.06, -0.30); ok.lineTo(-0.06, 0.10); ok.lineTo(-0.16, 0.10); ok.lineTo(0, 0.30);
    const m = new THREE.Mesh(new THREE.ShapeGeometry(ok), new THREE.MeshStandardMaterial({ color: 0x2ee66b, emissive: 0x0b3a1c, roughness: 0.6 }));
    m.rotation.x = -Math.PI / 2; m.position.set(4.76, 0.002, 2.62); m.name = 'DUKKAN__QR_YON_OKU'; g.add(m);   // ok −z yönünü gösterir (kapı → QR dolabı)
    ek.push({ ad: 'QR_YON_OKU', tur: 'isaret', kutu: [4.60, 4.92, 0, 0.002, 2.32, 2.92] }); }

  /* sürgü + personel kapısı açılışı: gezintide kamera 1,2 m yaklaşınca aç, uzaklaşınca kapat (0,8 s) */
  const s1 = g.getObjectByName('DUKKAN__KAPI_MUSTERI_SURGU_1'), s2 = g.getObjectByName('DUKKAN__KAPI_MUSTERI_SURGU_2');
  const s1x = s1 ? s1.position.x : 0, s2x = s2 ? s2.position.x : 0, KAPALI1 = (m0 + (m0 + m1) / 2) / 2 - s1x + 0.02, KAPALI2 = ((m0 + m1) / 2 + m1) / 2 - s2x - 0.01;   // AÇIK = çizildiği yer
  let acM = 0, acP = 0;
  function guncelle(kamPos, dt, gezintide) {
    const yakM = gezintide && Math.hypot(kamPos.x - (m0 + m1) / 2, kamPos.z - CD) < 1.2, yakP = gezintide && Math.hypot(kamPos.x - (p0 + p1) / 2, kamPos.z - CD) < 1.2;
    acM += ((yakM ? 1 : 0) - acM) * Math.min(1, dt / 0.27); acP += ((yakP ? 1 : 0) - acP) * Math.min(1, dt / 0.27);
    if (s1) s1.position.x = s1x + KAPALI1 * (1 - acM); if (s2) s2.position.x = s2x + KAPALI2 * (1 - acM);
    pk.rotation.y = -acP * Math.PI / 2;                                         // dışa (+z) açılır (yerel +x → +z)
    return { musteri: +acM.toFixed(2), personel: +acP.toFixed(2) };
  }
  guncelle({ x: 0, z: 0 }, 1, false);
  return { ek, say, guncelle };
}
