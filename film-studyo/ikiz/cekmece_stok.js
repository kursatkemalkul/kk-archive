/* İKİZ · ÇEKMECE STOĞU tek tek (YÖNETİCİ 22:5x onayı, C 21:00 bulgu 1): her çekmecede ADET KADAR hamur / tatlı, gerçek dizilimle.
   VERİ: b_cekmece_izgara_139i.json = A+B ızgara JSON (c139i_izgara md5 9db9c760, A+B a36ecd6b: K1_5 / K2_5 = 33 (R1 kat 5, lahm 418) + K3_3 / K5_3 = 29 (pide 178); önceki 54a0cfed, c69a89f0, d42eb6f9 (K1_lahm_5 = 40)); önceki d799743a; ilk sürüm e5ae32bd / 6a8b60b1; Rochu 2 çene): lahmacun şaşırtmalı 5 × 9 = 45, pide 3 × 10 = 30, tatlı 4 × 3 = 12;
   boş K2_lahm_5 + K3_hamur_4. Yuva merkezi dünya mm, çekmece KAPALI; ürün çekmecenin hareketli stok düğümüne (…__hamur__CEKMECE) bağlanır → çekmeceyle birlikte açılır.
   SAYI: programın karesi cekmeceler[c].fiziksel (fiziksel stok). HANGİ YUVA: G/Ç cekmeceler[c].yuva_dolu (dizi) gelirse o; gelene kadar alım sırası (izgara 'sira', arkadan öne)
   ilk (dolu − fiziksel) yuva boş. İçecek (K5_IC1 / K6_IC1 / K6_IC2, 3 × 48) robotla ortak güncel ızgaradan (pide y29 1 mm içeri).
   139m sonrası kenar yuvaları değişirse aynı JSON yenilenir (kod değişmez). */
export function cekmeceStokKur({ THREE, kok, IKIZ, sablon, U, kaynakAd }) {
  const durum = { yuklendi: false, cekmece: {}, hata: null };
  IKIZ.cekmeceStok = durum;
  // Freeze the closed CAD transforms before asynchronous loading and live axes move.
  kok.updateMatrixWorld(true);
  const kapaliTers = new Map();
  kok.traverse(o => { if (/^CEK_/.test(o.name || '')) kapaliTers.set(o, new THREE.Matrix4().copy(o.matrixWorld).invert()); });
  const anahtar = ad => {                                                      // CEK_K3_hamur_1 → K3_1 · CEK_K6_tatli_1 → K6_TATLI (programın cekmeceler anahtarı)
    const m = /^CEK_(K\d)_([a-z0-9]+)_(\d+)$/.exec(ad); if (!m) return null;
    if (m[2] === 'tatli') return m[1] + '_TATLI'; if (/^ic/.test(m[2])) return m[1] + '_' + m[2].toUpperCase().replace(/^IC(\d)?$/, 'IC' + m[3]);
    return m[1] + '_' + m[3];
  };
  const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _s = new THREE.Vector3(), _p = new THREE.Vector3(), Y = new THREE.Vector3(0, 1, 0);
  function sablonAglari(ad) {                                                  // şablonun ağları (geometri şablon kökünün yerelinde) + boyut
    const s = sablon(ad); if (!s) return null; const o = s.clone(true); o.position.set(0, 0, 0); o.quaternion.identity(); if (Math.max(o.scale.x, o.scale.y, o.scale.z) < 0.01) o.scale.set(1, 1, 1);
    o.traverse(x => { x.visible = true; }); o.updateMatrixWorld(true);
    const b = new THREE.Box3().setFromObject(o), c = b.getCenter(new THREE.Vector3()), d = b.getSize(new THREE.Vector3()), aglar = [];
    o.traverse(x => { if (x.isMesh) { const g = x.geometry.clone(); g.applyMatrix4(x.matrixWorld); g.translate(-c.x, -c.y, -c.z); aglar.push({ g, mat: x.material }); } });
    return { aglar, d };
  }
  // Same authoritative geometry as the production robot pickup tables. Never substitute an old slot layout.
  const IZ_YEREL = '/film-studyo/hat3d/ikiz-v1/b_cekmece_izgara.json';
  fetch(IZ_YEREL).then(r => { if (!r.ok) throw new Error(r.status); durum.dosya = IZ_YEREL; return r.json(); }).then(J => {
    durum.izgara_kaynak = J.kaynak || null;
    const tipSablon = { lahm: U.HAMUR_TOP, hamur: U.HAMUR_TOP, tatli: kaynakAd.TATLI, icecek: kaynakAd.ICECEK };   // içecek: robotla ortak 3 × 48 erişilebilir yuva
    for (const [ad, c] of Object.entries(J.cekmece || {})) {
      const dug = kok.getObjectByName(c.urun_dugumu) || kok.getObjectByName(String(c.urun_dugumu).replace('__tatli__', '__hamur__')) || kok.getObjectByName(ad + '__hamur__CEKMECE');
      const k = anahtar(ad); if (!dug || !k) continue;
      if (dug.material) { const mm = (Array.isArray(dug.material) ? dug.material : [dug.material]).map(x => { const y = x.clone(); y.visible = false; return y; }); dug.material = mm.length === 1 ? mm[0] : mm; }   // blok stok ağı çizilmez (düğüm hareketi korunur)
      const yuva = (c.yuva || []).slice().sort((a, b) => (a.sira ?? a.yuva) - (b.sira ?? b.yuva));
      const modelAd=c.tip==='lahm'?'URUN_28_LAHM':c.tip==='icecek'?'URUN_28_CAN:'+(k==='K6_IC1'?'Fanta':k==='K6_IC2'?'Sprite':'Coca-Cola'):tipSablon[c.tip];
      const S = yuva.length ? sablonAglari(modelAd) : null;
      const kayit = { ad, tip: c.tip, model_size_m:S?.d.toArray()||null, bos: !!c.bos, yuva_sayisi: yuva.length, gosterilen: c.bos ? 0 : yuva.length, im: [] };
      if (S) {
        kok.updateMatrixWorld(true); const inv = kapaliTers.get(dug) || new THREE.Matrix4().copy(dug.matrixWorld).invert();
        const yerel = yuva.map(y => {                                          // dünya (kapalı) → stok düğümünün yereli; alt yüz alt_y_mm'de, ölçü olcu_mm (x, y, z)
          const o = y.olcu_mm || [S.d.x * 1000, S.d.y * 1000, S.d.z * 1000], sc = (c.tip === 'tatli' || c.tip === 'icecek') ? [1, 1, 1] : [o[0] / 1000 / S.d.x, o[1] / 1000 / S.d.y, o[2] / 1000 / S.d.z];
          const yuk = (c.tip === 'tatli' || c.tip === 'icecek') ? S.d.y : o[1] / 1000;   // tatlı / kola şablonu gerçek ölçüde (kola Ø58 ×145.4)
          _p.set(y.merkez_mm[0] / 1000, (y.alt_y_mm != null ? y.alt_y_mm / 1000 + yuk / 2 : y.merkez_mm[1] / 1000), y.merkez_mm[2] / 1000);
          _q.setFromAxisAngle(Y, (y.aci_deg || 0) * Math.PI / 180); _s.set(...sc);
          return new THREE.Matrix4().multiplyMatrices(inv, _m.compose(_p, _q, _s));
        });
        for (const a of S.aglar) { const im = new THREE.InstancedMesh(a.g, a.mat, yuva.length); im.name = 'IKIZ_STOK_' + ad; im.userData.renkSinif='gercek'; yerel.forEach((M, i) => im.setMatrixAt(i, M)); im.count = kayit.gosterilen; im.frustumCulled = false; dug.add(im); kayit.im.push(im); }
        kayit.yerel = yerel; kayit.no = yuva.map(y => y.yuva);   // A+B yuva numarası (d42eb6f9: K1_lahm_5 bos_yuva 0 / 1 / 2 / 3 / 5 listede yok)
      }
      durum.cekmece[k] = kayit;
    }
    durum.yuklendi = true;
  }).catch(e => { durum.hata = String(e); IKIZ.konsolHata.push('çekmece stoğu: ' + e); });
  /* her kare: gösterilen = fiziksel (G/Ç yuva_dolu varsa yuva yuva). Yuvalar alım sırasına göre dizildi → im.count = fiziksel, ilk (yuva − fiziksel) yuva boş
     (instance dizisi sondan dolu tutulur: alınan = baştakiler). */
  function uygula(f) {
    if (!durum.yuklendi) return; const C = f.cekmeceler || {};
    for (const [k, r] of Object.entries(durum.cekmece)) {
      if (!r.im.length) continue; const c = C[k]; if (!c) continue;
      const dolu = Array.isArray(c.yuva_dolu) ? c.yuva_dolu : null;
      const liste = Array.isArray(c.yuva_dolu_liste) ? c.yuva_dolu_liste : null;   // G/Ç d30976df GÖSTERİ yalniz_yuva: YALNIZ bu yuvalar dolu (1 tabanlı = ızgara yuva no + 1)
      const sayi = typeof c.yuva_dolu === 'number' ? c.yuva_dolu : null;   // G/Ç YUVA dalı (1f1ba662): yuva_dolu = dolu yuva SAYISI (alınan no = kap − stok, tablo sırası = ızgara 'sira', 15 çekmecede 0,0 mm aynı)
      let n = dolu ? dolu.filter(Boolean).length : Math.max(0, +(sayi ?? c.fiziksel ?? c.adet ?? r.yuva_sayisi));
      // G/Ç 5b4fd788: robot kamera sayımı uyuşmazsa çekmece KİLİTLİ (cekmeceler[c].kilit / kilit_metin) → çekmecenin ön camı + sacı kırmızı
      const kilit = c.kilit || null;
      if ((r._kilit || null) !== kilit) { r._kilit = kilit; kilitBoya(r.ad, !!kilit); r.kilit = kilit ? { sebep: kilit, metin: c.kilit_metin || null } : null; }
      const lk = liste ? liste.join(',') : ''; if (r._n === n && !dolu && r._lk === lk) continue; r._lk = lk;
      r._n = n; r.kaynak = liste ? 'G/Ç yuva_dolu_liste (gösteri yalnız yuva)' : dolu ? 'G/Ç yuva_dolu (dizi)' : sayi != null ? 'G/Ç yuva_dolu (sayı) + tablo sırası' : 'fiziksel + alım sırası';
      /* G/Ç (R1, 11 Eki): "boşlar çıkarılmış yuva listesinin SONUNDAKİ adet tanesi dolu" — liste = ızgaranın (boş yuvasız) sıralı yuvaları. Program kapasitesi (yuva_kap)
         ızgarayla aynıysa doğrudan son n; değilse (ızgara eski) uyumsuzluk raporlanır ve yuva numarasıyla (no ≥ kap − n) yaklaşık çizilir. */
      const kap = +(c.yuva_kap || 0) || null;
      r.uyumsuz = kap != null && kap !== r.yuva_sayisi ? { program_kap: kap, izgara: r.yuva_sayisi } : null;
      const sec = liste ? r.yerel.filter((_, i) => liste.includes((r.no ? r.no[i] : i) + 1)) : dolu ? r.yerel.filter((_, i) => dolu[r.no ? r.no[i] : i]) : !r.uyumsuz ? r.yerel.slice(Math.max(0, r.yuva_sayisi - n)) : r.no ? r.yerel.filter((_, i) => r.no[i] >= kap - n) : r.yerel.slice(Math.max(0, r.yuva_sayisi - n));
      for (const im of r.im) { sec.forEach((M, i) => im.setMatrixAt(i, M)); im.count = sec.length; im.instanceMatrix.needsUpdate = true; }
      r.gosterilen = sec.length;
    }
  }
  const kilitli = new Map(), KIRMIZI = new THREE.Color(0xe0342b);
  function kilitBoya(ad, ac) {
    const re = new RegExp('^' + ad + '__(on_seffaf|sac)__CEKMECE$');
    kok.traverse(o => { if (!o.isMesh || !re.test(o.name)) return;
      if (ac && !kilitli.has(o)) { const e = o.material, y = (Array.isArray(e) ? e[0] : e).clone(); if (y.emissive) { y.emissive = KIRMIZI.clone(); y.emissiveIntensity = 0.8; } o.material = y; kilitli.set(o, e); }
      else if (!ac && kilitli.has(o)) { o.material = kilitli.get(o); kilitli.delete(o); } });
  }
  IKIZ.cekmeceStokOzet = () => { const o = Object.fromEntries(Object.entries(durum.cekmece).map(([k, r]) => [k, { tip: r.tip, bos: r.bos, yuva: r.yuva_sayisi, gosterilen: r.gosterilen, kaynak: r.kaynak || null, uyumsuz: r.uyumsuz || null, kilit: r.kilit || null }]));
    // ENT ikiz-v4 ızgarası boş çekmeceyi (K3_4) hiç yazmıyor → programda olup ızgarada olmayan, yuva_kap 0 çekmece BOŞ sayılır (çizilecek ürün yok)
    for (const [k, c] of Object.entries((IKIZ.son || {}).cekmeceler || {})) if (!o[k] && /^K\d_\d$/.test(k) && !(+c.yuva_kap)) o[k] = { tip: 'hamur', bos: true, yuva: 0, gosterilen: 0, kaynak: 'ızgarada yok · program yuva_kap 0', uyumsuz: null, kilit: c.kilit || null };
    return o; };
  return { uygula };
}
