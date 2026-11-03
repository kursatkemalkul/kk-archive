// F · Fırın mekanizma modülü (BIRLESIM_MODULU.md) — F82 üretim ayrıntısı. Düz betik; THREE ve THREE.GLTFLoader global.
// Veri mekanizma_f.html ile aynı: veri/basit_f.json (basit vekil + hareket + GT2 yolu), glbjs/f_<mek>.js (gerçek model, gzip+base64 GLB).
// Dünya koordinatı (m, x hat · y yukarı · z ön +) birebir; döngü 28,05 s: yükleme bandı → TP10 (×13) → çıkış → kapak 4 110° → filtre servisi.
// F82 BİTTİ 0197ed2b ile aynı veri (veri/basit_f.json + glbjs/f_*.js + parcalar_f.json, 23 Eki 14:41, 252 parça); sayfa ↔ modül t=0 kutu farkı ≤ 0,05 mm (headless, 23 Eki).
(window.MEKANIZMA = window.MEKANIZMA || {})['F'] = {
  ad: 'F · Fırın',
  async kur(ctx) {
    const T = ctx.THREE, kok = ctx.kok, taban = ctx.taban || 'F/';
    const D = await (await fetch(taban + 'veri/basit_f.json')).json();
    const AD = D.mek, MEK = Object.keys(AD), H = {}, hareketli = [], gruplar = {}, G2 = D.gt2;
    const EDGE = new T.LineBasicMaterial({color: 0x000000, transparent: true, opacity: .55});
    function malz(hex, m, vc) {
      const x = new T.MeshStandardMaterial({color: vc ? 0xffffff : new T.Color(m === 'TP10_FIRIN' ? '#9aa6b0' : hex).convertSRGBToLinear(), vertexColors: !!vc,
        metalness: m === 'BAGLANTI' ? .75 : .35, roughness: m === 'BAGLANTI' ? .35 : .55});
      if (m === 'TP10_FIRIN') { x.transparent = true; x.opacity = .16; x.depthWrite = false; }   // fırın bloğu yarı saydam: içi görünsün
      return x;
    }
    function giydir(h, geo, mat) {
      for (const c of [...h.children]) h.remove(c);
      const u = {mekanizma: AD[h.userData.m], ist: 'F', parca: h.name, katman: h.userData.katman};
      const m = new T.Mesh(geo, mat); m.userData = u;
      const e = new T.LineSegments(new T.EdgesGeometry(geo, 28), EDGE); e.userData = {...u, kenar: true};
      h.add(m); h.add(e);
    }
    for (const m of MEK) { const g = new T.Group(); g.name = 'F_MEK_' + m; g.userData = {mekanizma: AD[m], ist: 'F'}; kok.add(g); gruplar[m] = g; }
    for (const p of D.basit) {
      const h = new T.Group(); h.name = p.id; h.userData = {...p, mekanizma: AD[p.m], ist: 'F'}; const hv = p.h || {};
      const pv = hv.pivot ? new T.Vector3(hv.pivot[0], hv.pivot[1], hv.pivot[2]) : new T.Vector3(); if (hv.tip === 'don') pv.z = 0;
      h.position.copy(pv); h.userData.pv = pv; gruplar[p.m].add(h); H[p.id] = h;
      if (['don', 'kapi', 'kay', 'kayis_dis'].includes(hv.tip)) hareketli.push(h);
      if (p.k === 'yok') continue;                                  // GT2 dişleri: yalnız gerçek modelde
      const [x0, y0, z0, x1, y1, z1] = p.b; let g;
      if (p.k === 'cylz' && Math.abs((x1 - x0) - (y1 - y0)) <= .1 * Math.max(x1 - x0, y1 - y0)) { const r = Math.max(x1 - x0, y1 - y0) / 2; g = new T.CylinderGeometry(r, r, Math.max(z1 - z0, 1e-4), 28); g.rotateX(Math.PI / 2); }
      else g = new T.BoxGeometry(Math.max(x1 - x0, 1e-4), Math.max(y1 - y0, 1e-4), Math.max(z1 - z0, 1e-4));
      g.translate((x0 + x1) / 2 - pv.x, (y0 + y1) / 2 - pv.y, (z0 + z1) / 2 - pv.z);
      giydir(h, g, malz(p.c, p.m));
    }
    // ürün (pide 300 × 150 × 12, görsel vekil) — yükleme bandı mekanizmasına ait
    const urun = new T.Group(); urun.name = 'F_URUN'; const ug = new T.BoxGeometry(.300, .012, .150);
    const um = new T.Mesh(ug, new T.MeshStandardMaterial({color: 0xd9a35a, roughness: .9})); um.userData = {mekanizma: AD.YUKLEME_BANDI, ist: 'F', urun: true};
    const ue = new T.LineSegments(new T.EdgesGeometry(ug), EDGE); ue.userData = {mekanizma: AD.YUKLEME_BANDI, ist: 'F', kenar: true};
    urun.add(um, ue); gruplar.YUKLEME_BANDI.add(urun);
    const FAZ = [{a: 0, b: 1.55, x0: 2.690, x1: 3.000}, {a: 1.55, b: 13.55, x0: 3.000, x1: 3.970}, {a: 13.55, b: 15.05, x0: 3.970, x1: 4.120}, {a: 15.05, b: 20.05}, {a: 20.05, b: 28.05}];
    const DEST = [[2.5175, 2.812, 1.000], [2.845, 2.864, 1.000], [2.882, 3.970, .998], [4.000, 4.018, .9975]];
    const ust = x => Math.max(...DEST.filter(d => d[0] < x + .15 && d[1] > x - .15).map(d => d[2]), .9975) + .0005;
    const SURE = 28.05, RDE = G2.RD + G2.TB / 2;
    // GT2 hatve çizgisi (mek_f82_kur.py ile aynı): diş k, s = 2k mm
    function yolN(s) {
      const L = G2.L, RP = G2.RP, C = G2.C, U = G2.U, n = [-U[1], U[0]], Dp = G2.D, Mp = G2.M; s = ((s % L) + L) % L; const arc = Math.PI * RP;
      if (s < arc) { const a = Math.atan2(-n[1], -n[0]) - s / RP; return [Dp[0] + RP * Math.cos(a), Dp[1] + RP * Math.sin(a), a - Math.PI / 2]; } s -= arc;
      if (s < C) return [Dp[0] + RP * n[0] + U[0] * s, Dp[1] + RP * n[1] + U[1] * s, Math.atan2(U[1], U[0])]; s -= C;
      if (s < arc) { const a = Math.atan2(n[1], n[0]) - s / RP; return [Mp[0] + RP * Math.cos(a), Mp[1] + RP * Math.sin(a), a - Math.PI / 2]; } s -= arc;
      return [Mp[0] - RP * n[0] - U[0] * s, Mp[1] - RP * n[1] - U[1] * s, Math.atan2(-U[1], -U[0])];
    }
    function disPoz(h, ds) {
      const m = h.children.find(c => c.isMesh); if (!m) return; const g = m.geometry, P = g.attributes.position;
      if (!g.userData.taban) g.userData.taban = P.array.slice(); const B = g.userData.taban, n = P.count / G2.adet; if (n !== Math.floor(n)) return;
      for (let k = 0; k < G2.adet; k++) {
        const p0 = yolN(.002 * k), p1 = yolN(.002 * k + ds), c = Math.cos(p1[2] - p0[2]), sn = Math.sin(p1[2] - p0[2]);
        for (let i = k * n; i < (k + 1) * n; i++) { const x = B[3 * i] - p0[0], y = B[3 * i + 1] - p0[1]; P.array[3 * i] = p1[0] + x * c - y * sn; P.array[3 * i + 1] = p1[1] + x * sn + y * c; P.array[3 * i + 2] = B[3 * i + 2]; }
      }
      P.needsUpdate = true; const e = h.children.find(c => c.isLineSegments); if (e) e.visible = false;
    }
    function guncelle(tt) {
      const t = ((tt % SURE) + SURE) % SURE, ms = t * 1000;
      const f = FAZ.find(q => t >= q.a && t <= q.b) || FAZ[0], k = Math.min(1, (t - f.a) / (f.b - f.a));
      const x = f.x0 != null ? f.x0 + (f.x1 - f.x0) * k : null; urun.visible = x != null && x < 4.10; if (x != null) urun.position.set(x, ust(x) + .006, D.yol.z);
      const sGB = Math.min(ms, 1550) / 1000 * .20 + (ms > 13550 ? Math.min(ms - 13550, 1500) / 1000 * .10 : 0);
      const sTP = Math.max(0, Math.min(ms, 13550) - 1550) / 12000 * .970 + (ms > 13550 ? Math.min(ms - 13550, 1500) / 1000 * .10 : 0);
      const u = t < 20.05 ? 0 : t - 20.05;   // filtre servisi: 0–1,5 tapa öne · 1,5–4 filtre sola · 4–6,5 geri · 6,5–8 tapa yerine
      const tapa = u < 1.5 ? u / 1.5 : u < 6.5 ? 1 : u < 8 ? 1 - (u - 6.5) / 1.5 : 0, filt = u < 1.5 ? 0 : u < 4 ? (u - 1.5) / 2.5 : u < 6.5 ? 1 - (u - 4) / 2.5 : 0;
      for (const h of hareketli) {
        const hv = h.userData.h;
        if (hv.tip === 'don') { const s = hv.kaynak === 'tel_bant' ? sTP : sGB; h.rotation.z = -s / (hv.r_m || .01); }
        else if (hv.tip === 'kapi') { const kk = ms < 15050 ? 0 : ms < 17550 ? (ms - 15050) / 2500 : ms < 20050 ? 1 - (ms - 17550) / 2500 : 0, e = kk < .5 ? 2 * kk * kk : 1 - Math.pow(-2 * kk + 2, 2) / 2;
          h.rotation.y = T.MathUtils.degToRad(hv.aci_derece) * e; }
        else if (hv.tip === 'kay') { if (hv.eksen === 'z') h.position.z = hv.strok_m * tapa; else h.position.x = hv.strok_m * filt; }
        else if (hv.tip === 'kayis_dis') disPoz(h, sGB / RDE * G2.RP);
      }
      kok.updateMatrixWorld(true);
    }
    // gerçek model: tutucular aynı kalır (pivot), yalnız içleri değişir → konum değişmez · toNonIndexed: düz gölge (sac yüzlerinde yumuşatma lekesi yok)
    const ld = new T.GLTFLoader(), betik = {}, sahne = {}, basitIc = {};
    const js = f => betik[f] || (betik[f] = new Promise((ok, no) => { const s = document.createElement('script'); s.src = taban + 'glbjs/' + f + '.js'; s.onload = ok; s.onerror = no; document.head.appendChild(s); }));
    const b64 = s => Uint8Array.from(atob(s), c => c.charCodeAt(0));
    const yukle = f => sahne[f] || (sahne[f] = js(f).then(async () => { const buf = await new Response(new Blob([b64(window.__GLB[f])]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer();
      return new Promise((ok, no) => ld.parse(buf, '', g => ok(g.scene), no)); }));
    let gercekMi = false, sonT = 0;
    async function gercek(acik) {
      acik = !!acik; if (acik === gercekMi) return;
      if (acik) {
        const scs = await Promise.all(MEK.map(m => yukle('f_' + m.toLowerCase())));
        for (const s of scs) { s.updateMatrixWorld(true); s.traverse(o => {
          if (!o.isMesh) return; const h = H[o.name] || H[o.parent && o.parent.name]; if (!h) return;
          if (!basitIc[h.name]) basitIc[h.name] = h.children.slice();
          const g = o.geometry.clone().applyMatrix4(o.matrixWorld).toNonIndexed(), pv = h.userData.pv; g.translate(-pv.x, -pv.y, -pv.z); g.computeVertexNormals();
          giydir(h, g, malz(null, h.userData.m, true)); }); }
      } else for (const [id, ch] of Object.entries(basitIc)) { const h = H[id]; for (const c of [...h.children]) h.remove(c); ch.forEach(c => h.add(c)); }
      gercekMi = acik; guncelle(sonT);
    }
    // sur (ANA 24 Eki, iskelet "İKİZ AKIŞI"): yükleme bandı ikizin AX_F_YBANT değerinden (mm), TP10 tel bandı F_TP_MM'den (ürünün fırın bandı yolu, mm);
    // kapak / filtre servisi kapalı; vekil ürün gizli (pideyi iskelet çizer)
    function sur(G) {
      const sGB = (+G('AX_F_YBANT') || 0) / 1000, sTP = (+G('F_TP_MM') || 0) / 1000; urun.visible = false;
      for (const h of hareketli) { const hv = h.userData.h;
        if (hv.tip === 'don') { const s = hv.kaynak === 'tel_bant' ? sTP : sGB; h.rotation.z = -s / (hv.r_m || .01); }
        else if (hv.tip === 'kapi') h.rotation.y = 0; else if (hv.tip === 'kay') { if (hv.eksen === 'z') h.position.z = 0; else h.position.x = 0; }
        else if (hv.tip === 'kayis_dis') disPoz(h, sGB / RDE * G2.RP); }
      kok.updateMatrixWorld(true);
    }
    const gu = guncelle; function guncelle2(t) { sonT = t; gu(t); }
    guncelle2(0);
    if (ctx.basitMi === false) await gercek(true);
    return {mekanizmalar: MEK.map(m => AD[m]), sure: SURE, guncelle: guncelle2, sur, gercek, parca: D.basit.length};
  }
};
