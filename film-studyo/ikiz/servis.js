/* İKİZ · SERVİS / TEDARİK TURU (Kemal R25) + TEMİZLİK SİHİRBAZI (R26) — görsel kısım (G/Ç yazilim-r 487f4014 ikiz.durum alanları):
   · durum.tur      {asama: liste|adim|ozet, i, adimlar: [{id, ist, tur: cekmece|kalem, cekmece, durum: bekle|tamam|atlandi, hedef, mevcut}]}  (tablet ikiz.tur olayı)
   · durum.sihirbaz {tur: gunluk|haftalik, i, adimlar: [{id, ad, tip: onay|sensor, durum, kaset?}]}                                 (tablet ikiz.sihirbaz olayı)
   · çekmece hareketi programın cekmeceler[c].konum'undan (ENT AX_B_* — burada çizilmez, yalnız VURGU) · stok tek tek cekmece_stok.js
   · kaset dışarıda: girisler.DI_TOP_<kaset>_KASET_VAR === false → kaset düğümü ön yüzden dışarı kayar (KASET_CIKIS_M); takılınca geri girer.
     Kaset düğümleri modelde AYRI değilse (ikiz-v2d: kaset gövdesi TOPPING_MODUL ağlarına gömülü) hareket yapılamaz → IKIZ.servis.kasetDugumYok (TOPPING / ENT işi).
   Panel sahnenin sol altında, olay günlüğünün üstünde; tur / sihirbaz yoksa gizli. */
const KASETLER = ['HARC', 'SOS', 'KIYMA', 'KUSBASI', 'KASAR', 'SUCUK', 'KIYMA_ORTA'];
const KASET_CIKIS_M = 0.30;            // [V] kaset çıkarma yolu ön yüzden +z 300 mm — YÖNETİCİ: TOPPING'in çıkış yolu / yönü gelince o değerle değişir

export function servisKur({ THREE, IKIZ, kok }) {
  const css = document.createElement('style');
  css.textContent = `#servisPanel{position:absolute;z-index:7;left:10px;bottom:${'calc(32% + 64px)'};width:420px;display:none;background:#10141acc;border:1px solid #f0a33a;border-radius:10px;color:#e6e9ee;font:600 12px system-ui;padding:8px 10px}
#servisPanel h4{margin:0 0 4px;font:800 11px system-ui;letter-spacing:.1em;color:#f0a33a}#servisPanel .ad{font:700 14px system-ui;margin:2px 0}
#servisPanel ol{margin:4px 0 0;padding-left:20px;max-height:120px;overflow:auto;font:500 11px ui-monospace,Consolas,monospace;color:#aab3bd}#servisPanel li.su{color:#ffd28a}#servisPanel li.tamam{color:#7fe0a8}#servisPanel li.atlandi{color:#7d8792;text-decoration:line-through}`;
  document.head.append(css);
  const pan = document.createElement('div'); pan.id = 'servisPanel'; (document.getElementById('sahne') || document.body).append(pan);
  const yanan = new Map(), SARI = new THREE.Color(0xf0a33a);
  function sondur() { for (const [m, eski] of yanan) m.material = eski; yanan.clear(); }
  function yak(re) {
    kok.traverse(o => { if (!o.isMesh || !re.test(o.name) || yanan.has(o)) return; const e = o.material, y = (Array.isArray(e) ? e[0] : e).clone(); if (y.emissive) { y.emissive = SARI.clone(); y.emissiveIntensity = 0.7; } o.material = y; yanan.set(o, e); });
  }
  // kaset düğümleri (ayrı düğüm varsa): TOPPING_KASET_<ad> ya da TOPPING_*__KASET_<ad>
  const kasetDugum = {}, kasetYok = [];
  for (const k of KASETLER) { const re = new RegExp('^TOPPING_(KASET_' + k + '(__.*)?|.*__KASET_' + k + ')$'); const L = []; kok.traverse(o => { if (o.name && re.test(o.name)) L.push(o); });
    if (L.length) kasetDugum[k] = L.map(o => { o.updateWorldMatrix(true, false); return { o, p0: o.position.clone(), w0: o.getWorldPosition(new THREE.Vector3()) }; }); else kasetYok.push(k); }   // ENT ikiz-v4: TOPPING_KASET_<k>__* ek GLB'de (34 düğüm)
  /* "PERSONEL GİRER" (YÖNETİCİ onayı, Kemal R25): tur başlayınca 1,75 m kapsül silüet kaldırımdan personel kapısıyla girer, hücre kapısından hücreye geçer, hedef
     çekmecenin önüne yürür (1,2 m/s, duvar saati — görsel); kamera arkasından izler (kullanıcı sahneye dokununca bırakır). Tur bitince kapıdan çıkar ve gizlenir.
     Yol (dukkan.js 3c ölçüleri): kaldırım (1,26 · 3,50) → personel kapısı (1,26 · 2,90) → (1,26 · 2,20) → hücre kapısı (1,26 · 1,75) → hücre içi z 1,30 → çekmece x. */
  const sil = new THREE.Group(); sil.name = 'IKIZ_PERSONEL_SILUET'; sil.visible = false;
  { const mat = new THREE.MeshStandardMaterial({ color: 0x2f6fb3, roughness: 0.7 }), bas = new THREE.MeshStandardMaterial({ color: 0xe8c9a6, roughness: 0.8 });
    const govde = new THREE.Mesh(new THREE.CapsuleGeometry(0.19, 1.75 - 0.38 - 0.24, 6, 16), mat); govde.position.y = (1.75 - 0.24) / 2; sil.add(govde);
    const kafa = new THREE.Mesh(new THREE.SphereGeometry(0.11, 20, 14), bas); kafa.position.y = 1.75 - 0.11; sil.add(kafa); }
  (kok.parent || kok).add(sil);
  const YOL0 = [[1.26, 3.50], [1.26, 2.90], [1.26, 2.20], [1.26, 1.75], [1.26, 1.30]], HIZ = 1.2;
  let rota = null, rotaHedef = null, izle = true, sonT = performance.now();
  const kanvas = document.getElementById('kanvas'); if (kanvas) kanvas.addEventListener('pointerdown', () => { izle = false; });
  function cekmeceX(c) { const m = /^K(\d)_(\w+)$/.exec(c || ''); if (!m) return null; const b = new THREE.Box3(); const re = new RegExp('^CEK_K' + m[1] + '_[a-z0-9]+_' + (/^\d+$/.test(m[2]) ? m[2] : '1') + '__sac__CEKMECE$');
    kok.traverse(o => { if (o.isMesh && re.test(o.name)) b.expandByObject(o); }); return b.isEmpty() ? null : b.getCenter(new THREE.Vector3()).x; }
  function rotaKur(hedefX, cik) {
    const p = YOL0.map(([x, z]) => new THREE.Vector3(x, 0, z)); if (hedefX != null) p.push(new THREE.Vector3(hedefX, 0, 1.30));
    if (cik) p.reverse();
    const bas = sil.visible ? sil.position.clone() : p[0]; rota = { p: [bas, ...p.slice(cik ? 0 : 0)], i: 0, cik };
  }
  function yuru(dt) {
    if (!rota) return; let kalan = HIZ * dt;
    while (kalan > 0 && rota.i < rota.p.length - 1) { const a = sil.position, b = rota.p[rota.i + 1], d = a.distanceTo(b);
      if (d <= kalan) { a.copy(b); rota.i++; kalan -= d; } else { const y = b.clone().sub(a).normalize(); a.addScaledVector(y, kalan); sil.rotation.y = Math.atan2(y.x, y.z); kalan = 0; } }
    if (rota.i >= rota.p.length - 1) { if (rota.cik) sil.visible = false; rota = null; }
  }
  IKIZ.kancalar.push(dt => {
    const n = performance.now(), d = Math.min(0.1, (n - sonT) / 1000); sonT = n; yuru(d);
    if (sil.visible && izle && IKIZ.kamera && IKIZ.orbit && IKIZ.sahneModu !== 'gezinti') {   // arkasından izle (hedef baş hizası, kamera 1,6 m geride + 1,0 m yukarıda)
      const ileri = new THREE.Vector3(Math.sin(sil.rotation.y), 0, Math.cos(sil.rotation.y)), h = sil.position.clone().setY(1.4);
      IKIZ.kamera.position.lerp(h.clone().addScaledVector(ileri, -1.6).setY(2.4), 0.08); IKIZ.orbit.target.lerp(h, 0.12);
    }
    IKIZ.personelSiluet = sil.visible ? { x: +sil.position.x.toFixed(3), z: +sil.position.z.toFixed(3), yuruyor: !!rota } : null;
  });
  let sonImza = '';
  function uygula(f) {
    const tur = f.tur || null, sh = f.sihirbaz || null, g = f.girisler || {};
    // kaset dışarıda / içeride
    const disari = KASETLER.filter(k => g['DI_TOP_' + k + '_KASET_VAR'] === false || g['DI_TOP_' + k + '_KASET_VAR'] === 0);
    for (const [k, L] of Object.entries(kasetDugum)) { const d = disari.includes(k) ? KASET_CIKIS_M : 0; for (const x of L) { if (!d) { x.o.position.copy(x.p0); continue; } const w = x.w0.clone(); w.z += d; x.o.position.copy(x.o.parent ? x.o.parent.worldToLocal(w) : w); } }   // DÜNYA +z (ön yüz) — ek GLB ebeveyn çerçevesi farklı olabilir
    const aktif = tur || sh;
    IKIZ.servis = { tur: !!tur, sihirbaz: !!sh, kasetDisari: disari, kasetDugumYok: kasetYok, adim: null };
    if (!tur && sil.visible && !(rota && rota.cik)) { rotaKur(null, true); rotaHedef = null; }   // tur bitti → silüet kapıdan çıkar
    if (!aktif) { if (pan.style.display !== 'none') { pan.style.display = 'none'; sondur(); sonImza = ''; } return; }
    const A = aktif.adimlar || [], i = Math.max(0, Math.min(A.length - 1, +aktif.i || 0)), a = A[i] || {};
    if (tur) {                                                                     // personel girer → hedef çekmeceye yürür
      const hedef = a.cekmece || null;
      if (!sil.visible) { sil.position.set(YOL0[0][0], 0, YOL0[0][1]); sil.visible = true; izle = true; rotaHedef = undefined; }
      if (hedef !== rotaHedef) { rotaHedef = hedef; const hx = cekmeceX(hedef); const p = YOL0.map(([x, z]) => new THREE.Vector3(x, 0, z));
        if (hx != null) p.push(new THREE.Vector3(hx, 0, 1.30));
        const yakin = p.reduce((m, q, j) => q.distanceTo(sil.position) < p[m].distanceTo(sil.position) ? j : m, 0);   // bulunduğu yerden devam (yolu baştan yürümez)
        rota = { p: [sil.position.clone(), ...p.slice(Math.max(yakin, 0))], i: 0, cik: false }; }
    }
    IKIZ.servis.adim = { i, n: A.length, id: a.id, cekmece: a.cekmece || null, kaset: a.kaset || null, durum: a.durum };
    const imza = JSON.stringify([tur ? 'tur' : 'sh', aktif.asama, i, A.map(x => x.durum), disari]);
    if (imza === sonImza) return; sonImza = imza;
    pan.style.display = 'block';
    const baslik = tur ? `SERVİS / TEDARİK TURU · ${aktif.asama || ''}` : `TEMİZLİK SİHİRBAZI · ${aktif.tur === 'haftalik' ? 'HAFTALIK' : 'GÜNLÜK'}`;
    const adAd = x => x.ad || (x.tur === 'cekmece' ? `${x.cekmece} çekmecesi${x.hedef != null ? ` · ${x.mevcut ?? '?'} → ${x.hedef}` : ''}` : x.id);
    pan.innerHTML = `<h4>${baslik}</h4><div class="ad">Adım ${i + 1} / ${A.length}: ${adAd(a)}</div>`
      + (disari.length ? `<div>Dışarıdaki kaset: ${disari.join(', ')}${kasetYok.length ? ' (3B: kaset ayrı düğüm değil)' : ''}</div>` : '')
      + `<ol>${A.map((x, j) => `<li class="${j === i ? 'su' : (x.durum || '')}">${adAd(x)} — ${x.durum || 'bekle'}</li>`).join('')}</ol>`;
    sondur();
    if (a.cekmece) { const m = /^K(\d)_(\w+)$/.exec(a.cekmece); if (m) yak(new RegExp('^CEK_K' + m[1] + '_[a-z0-9]+_' + (/^\d+$/.test(m[2]) ? m[2] : (m[2].toLowerCase().replace(/^ic(\d)$/, 'ic1_$1').replace(/^tatli$/, 'tatli_1'))) + '__(sac|on_seffaf)__CEKMECE$')); }
    const ks = a.kaset || (/(HARC|SOS|KIYMA_ORTA|KIYMA|KUSBASI|KASAR|SUCUK)/.exec(String(a.id || '')) || [])[1];
    if (ks && kasetDugum[ks]) for (const x of kasetDugum[ks]) yak(new RegExp('^' + x.o.name + '$'));
    else if (ks) yak(new RegExp('^TOPPING_MODUL__.*__PISTON_' + ks + '$'));   // kaset ayrı düğüm değilse dozaj pistonunu vurgula (kasetin yeri)
  }
  return { uygula };
}
