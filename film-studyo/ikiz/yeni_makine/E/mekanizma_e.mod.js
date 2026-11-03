// E · Kutu katlama mekanizma modülü (BIRLESIM_MODULU.md). Düz betik; THREE global. Sahne / ışık / DOM döngüsü yok, yalnız ctx.kok.
// mekanizma_e.html de bu modülü kullanır (tek kaynak). Veri: parcalar_e.json · veri/kin_e.json (kinematik model + zaman çizelgesi) ·
// glbjs/e_motor.js (gerçek Siemens SIMOTICS S-1FL2 CAD, her zaman) · glbjs/e_gercek.js (gerçek geometri, isteğe bağlı).
// Hareket: her parça ikizin EKSEN değerinden sürülür (doğrusal: ±1 mm/mm; dönen: gerçek mil / menteşe ekseni, 1°/birim; bilyalı vida 16×5).
// Döngü = tek kaşarlı sipariş katlaması (sim saati, 1,5 s üstü bekleme 0,6 s) + asansör tam strok 0 → 671,3 → 0 mm @ 60 mm/s (E_REF_HIZ).
// Dünya koordinatı (m; x hat · y yukarı · z ön +) birebir.
(window.MEKANIZMA = window.MEKANIZMA || {})['E'] = {
  ad: 'E · Kutu katlama',
  async kur(ctx) {
    const T = ctx.THREE, kok = ctx.kok, taban = ctx.taban == null ? 'E/' : ctx.taban;
    const [J, K] = await Promise.all([fetch(taban + 'parcalar_e.json').then(r => r.json()), fetch(taban + 'veri/kin_e.json').then(r => r.json())]);
    const AD = Object.assign({}, J.mekanizmalar); AD.baglanti = 'Bağlantı elemanları (vida · pul · somun)';
    for (const [pid, k] of Object.entries(K.iz_ek || {})) J.parcalar[+pid].iz = k;      // ikiz e_tidy42 döner baskı parmağı (sözde eksen SX_E_TUTUCU)
    const P = J.parcalar, EKS = K.eksenler, V0 = K.v0, MOD = K.model, ZT = K.zaman.t, ZV = K.zaman.v, NZ = ZT.length;
// kırık normal (crease, 30°): paylaşılan köşelerde normaller keskin kenarlar boyunca ortalanmaz -> düz yüzler düz, silindirler yumuşak görünür.
    // geo: indeksli BufferGeometry -> indekssiz, normal öznitelikli yeni geometri. (three r128'de toCreasedNormals yok.)
    function kirikNormal(T, geo, aciDer) {
      const g = geo.index ? geo.toNonIndexed() : geo, p = g.attributes.position.array, nf = p.length / 9, fn = new Float32Array(nf * 3), N = new Float32Array(p.length);
      for (let f = 0; f < nf; f++) { const o = f * 9, ax = p[o + 3] - p[o], ay = p[o + 4] - p[o + 1], az = p[o + 5] - p[o + 2], bx = p[o + 6] - p[o], by = p[o + 7] - p[o + 1], bz = p[o + 8] - p[o + 2];
        let x = ay * bz - az * by, y = az * bx - ax * bz, z = ax * by - ay * bx; const l = Math.hypot(x, y, z) || 1; fn[f * 3] = x / l; fn[f * 3 + 1] = y / l; fn[f * 3 + 2] = z / l; }
      const k = (v) => Math.round(p[v * 3] * 1e6) + ',' + Math.round(p[v * 3 + 1] * 1e6) + ',' + Math.round(p[v * 3 + 2] * 1e6), M = new Map();
      for (let v = 0; v < nf * 3; v++) { const s = k(v); let a = M.get(s); if (!a) M.set(s, a = []); a.push(v); }
      const c = Math.cos((aciDer || 30) * Math.PI / 180);
      for (const L of M.values()) for (const v of L) { const f = (v / 3) | 0; let x = 0, y = 0, z = 0;
        for (const w of L) { const h = (w / 3) | 0; if (fn[f * 3] * fn[h * 3] + fn[f * 3 + 1] * fn[h * 3 + 1] + fn[f * 3 + 2] * fn[h * 3 + 2] >= c) { x += fn[h * 3]; y += fn[h * 3 + 1]; z += fn[h * 3 + 2]; } }
        const l = Math.hypot(x, y, z) || 1; N[v * 3] = x / l; N[v * 3 + 1] = y / l; N[v * 3 + 2] = z / l; }
      g.setAttribute('normal', new T.BufferAttribute(N, 3)); return g;
    }
    const EDGE = new T.LineBasicMaterial({color: 0x000000, transparent: true, opacity: .55}), MAT = {};
    // RENK (YÖNETİCİ madde 6): her mekanizma ayrı renk; hareketli parça tam ton, aynı mekanizmanın sabit parçası soluk ton; bağlantı elemanı çelik gri
    const PALET = {ASANSOR: '#3d7ec9', BESLEYICI: '#e08a2e', DESTEK: '#8a63c9', PISTON: '#c94a3d', KOPRU: '#3f9f5a', FLAP: '#d9b23a', KOL: '#25a8a8', KOSE: '#d65c9a',
      KOSE_KALDIR: '#5a6fd6', PARMAK: '#86b83a', TUTUCU: '#a0703c', SENSOR: '#e8ecef'};
    const solgun = h => { const c = new T.Color(h), g = new T.Color('#8a9099'); return '#' + c.lerp(g, .5).getHexString(); };
    const renkSec = p => p.katman === 'baglanti' ? '#9aa0a6' : (PALET[p.mekanizma] ? (p.iz >= 0 ? PALET[p.mekanizma] : solgun(PALET[p.mekanizma])) : p.renk);
    const mat = r => MAT[r] || (MAT[r] = new T.MeshStandardMaterial({color: new T.Color('#' + String(r || 'b0b6bc').replace('#', '')), metalness: .35, roughness: .55}));
    const betik = (f, ad) => new Promise((ok, no) => { if (window.__GLB && window.__GLB[ad]) return ok(); const s = document.createElement('script'); s.src = taban + 'glbjs/' + f; s.onload = ok; s.onerror = () => no(Error('E modülü: yüklenemedi ' + f)); document.head.appendChild(s); });
    const gunzip = async b64 => new Response(new Blob([Uint8Array.from(atob(b64), c => c.charCodeAt(0))]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer();
    // ---- parçalar ----
    const DUG = [], byId = {}, gruplar = {};
    for (const k of Object.keys(AD)) { const g = new T.Group(); g.name = 'E_MEK_' + k; g.userData = {mekanizma: AD[k], ist: 'E', renk: k === 'baglanti' ? '#9aa0a6' : (PALET[k] || '#9aa0a6')}; kok.add(g); gruplar[k] = g; }
    for (const p of P) { const g = new T.Group(); g.name = 'E_P' + p.id; g.matrixAutoUpdate = false; g.userData = {id: p.id, ad: p.ad, iz: p.iz, mekanizma: AD[p.katman] || p.katman, ist: 'E'};
      (gruplar[p.katman] || gruplar.baglanti).add(g); DUG.push(g); byId[p.id] = g; }
    const kenar = (geo, g) => { const e = new T.LineSegments(new T.EdgesGeometry(geo, 30), EDGE); e.userData = {mekanizma: g.userData.mekanizma, ist: 'E', kenar: true}; return e; };
    const giydir = (g, geo, renk) => { g.clear(); const m = new T.Mesh(geo, mat(renk)); m.userData = {id: g.userData.id, mekanizma: g.userData.mekanizma, ist: 'E'}; g.add(m, kenar(geo, g)); };
    // gerçek motorlar (Siemens CAD, model bir kez + örnek matrisi)
    await betik('e_motor.js?v=e1d1ec9bb43a', 'e_motor'); const GM = window.__GLB.e_motor, mbuf = await gunzip(GM.bin), MGEO = {}, MOTOR = new Set();
    for (const [md, m] of Object.entries(GM.modeller)) MGEO[md] = m.alt.map(([c, nv, op, ni, oi, u, cc, hh]) => { const q = new Int16Array(mbuf, op, nv * 3), Pf = new Float32Array(nv * 3);
      for (let i = 0; i < nv; i++) for (let k = 0; k < 3; k++) Pf[i * 3 + k] = q[i * 3 + k] / 32767 * hh[k] + cc[k];
      const geo = new T.BufferGeometry(); geo.setAttribute('position', new T.BufferAttribute(Pf, 3)); geo.setIndex(new T.BufferAttribute((u === 16 ? new Uint16Array(mbuf, oi, ni) : new Uint32Array(mbuf, oi, ni)).slice(), 1)); const geoK = kirikNormal(T, geo, 30);
      return {geo: geoK, mat: new T.MeshStandardMaterial({color: new T.Color(c), metalness: .45, roughness: .45}), kenar: new T.EdgesGeometry(geoK, 35)}; });
    for (const [pid, md, W] of GM.ornek) { const g = byId[pid]; if (!g) continue; MOTOR.add(pid); g.clear(); const h = new T.Group(); h.matrixAutoUpdate = false; h.matrix.fromArray(W);
      for (const a of MGEO[md]) { const m = new T.Mesh(a.geo, a.mat); m.userData = {id: pid, mekanizma: g.userData.mekanizma, ist: 'E', motor: md}; const e = new T.LineSegments(a.kenar, EDGE); e.userData = {mekanizma: g.userData.mekanizma, ist: 'E', kenar: true}; h.add(m, e); }
      g.add(h); }
    function basit() { for (const p of P) { if (MOTOR.has(p.id)) continue; const b = p.kutu_mm, s = [(b[3] - b[0]) / 1000, (b[4] - b[1]) / 1000, (b[5] - b[2]) / 1000].map(v => Math.max(v, .0004));
      const geo = new T.BoxGeometry(...s); geo.translate((b[0] + b[3]) / 2000, (b[1] + b[4]) / 2000, (b[2] + b[5]) / 2000); giydir(byId[p.id], geo, renkSec(p)); } }
    basit();
    // ---- kinematik ----
    const _m = new T.Matrix4(), _a = new T.Vector3(), _p = new T.Vector3();
    function izMat(k, v, cache) {
      if (k < 0) return null; if (cache[k]) return cache[k]; const m = MOD[k], M = new T.Matrix4();
      if (m.tip === 'dogrusal') { let x = 0, y = 0, z = 0; for (const [a, c] of Object.entries(m.c)) { const j = EKS.indexOf(a), d = (v[j] - V0[j]) / 1000; x += c[0] * d; y += c[1] * d; z += c[2] * d; } M.makeTranslation(x, y, z); }
      else { const j = EKS.indexOf(m.ax); _a.fromArray(m.eksen); _p.fromArray(m.nokta); M.makeTranslation(_p.x, _p.y, _p.z).multiply(_m.makeRotationAxis(_a, m.a * (v[j] - V0[j]))).multiply(new T.Matrix4().makeTranslation(-_p.x, -_p.y, -_p.z));
        const B = izMat(m.taban, v, cache); if (B) M.premultiply(B); }
      return cache[k] = M;
    }
    // kutu açınımı yığını (ürün vekili, çakışma denetimine girmez): 804 × 404 mm (ikiz e_cassette33 blank_mm), tabla üstünden alım kotuna
    // (983,2 mm; recete.py: N = (983,2 − tabla_y) / 1,6) — asansör 0 → 671,3 mm çıktıkça yığın 420 → 0 kutu azalır.
    const YIGIN = 'Kutu açınımı yığını (804 × 404, 1,6 mm/kutu)', yg = new T.Group(); yg.name = 'E_YIGIN'; yg.userData = {mekanizma: YIGIN, ist: 'E', urun: true, renk: '#c9a56b'}; kok.add(yg);
    const ygeo = new T.BoxGeometry(.804, 1, .404); ygeo.translate(0, .5, 0);
    const ym = new T.Mesh(ygeo, new T.MeshStandardMaterial({color: 0xc9a56b, roughness: .9, metalness: 0, transparent: true, opacity: .45, depthWrite: false})); ym.userData = {mekanizma: YIGIN, ist: 'E', urun: true};
    const ye = new T.LineSegments(new T.EdgesGeometry(ygeo), EDGE); ye.userData = {mekanizma: YIGIN, ist: 'E', kenar: true}; yg.add(ym, ye);
    const tabla = P.find(p => p.ad === 'Kaldırma tablası'), YX = 4.842, YZ = -.617, TABLA_Y0 = tabla ? tabla.kutu_mm[4] / 1000 : .311, UST = .9832, JA = EKS.indexOf('AX_E_ASANSOR');
    function yigin(v) { const alt = TABLA_Y0 + (v[JA] - V0[JA]) / 1000, h = Math.max(UST - alt, .0001); yg.position.set(YX, alt, YZ); yg.scale.set(1, h, 1); ym.visible = ye.visible = h > .0008; }
    // katlanan karton + pide (veri/kutu_e.json, araclar/kutu_e.py): ikizin 14 panelli açınımı, zaman çizelgesinin aynı karelerinde kök + panel açıları
    // (hat_oynat.js kuralı: M = T(kök − kök₀) · Rot(pivot, eksen, θ)…); pide kutu ortasında (x_mm, taban_mm). Yalnız kendi döngüsünde (sur() ile İKİZ AKIŞI kendi kutusunu çizer).
    const KUTU_AD = 'Karton kutu (katlanan açınım) + pide', KG = new T.Group(); KG.name = 'E_KUTU'; KG.userData = {mekanizma: KUTU_AD, ist: 'E', urun: true}; KG.visible = false; kok.add(KG);
    let KU = null; const KPAN = {}, KZIN = {}, KPIDE = new T.Group(); KG.add(KPIDE);
    try { KU = await fetch(taban + 'veri/kutu_e.json').then(r => r.ok ? r.json() : null); } catch (e) { KU = null; }
    if (KU) { const kgeo = ad => KU.geo[ad].map(q => { const g = new T.BufferGeometry(); g.setAttribute('position', new T.Float32BufferAttribute(q.P, 3)); if (q.I) g.setIndex(q.I); g.computeVertexNormals(); return [g, q.c]; });
      const kmesh = (ad, c0) => { const g = new T.Group(); for (const [geo, c] of kgeo(ad)) { const m = new T.Mesh(geo, new T.MeshStandardMaterial({color: new T.Color('#' + (c0 || c)), roughness: .85, metalness: 0, side: T.DoubleSide}));
        m.userData = {mekanizma: KUTU_AD, ist: 'E', urun: true}; const e = new T.LineSegments(new T.EdgesGeometry(geo, 30), EDGE); e.userData = {mekanizma: KUTU_AD, ist: 'E', kenar: true}; g.add(m, e); } return g; };
      for (const ad of Object.keys(KU.geo).filter(k => k.startsWith('E_KUTU__'))) { const g = kmesh(ad); g.matrixAutoUpdate = false; KG.add(g); KPAN[ad] = g; }
      for (const d of KU.zincir) KZIN[d.ad] = d;
      const ps = ['URUN__hamur', 'URUN__kasar_0', 'URUN__kasar_1', 'URUN__kasar_2', 'URUN__kasar_3', 'URUN__kesik'].map(ad => kmesh(ad, ad === 'URUN__hamur' ? 'c98a3e' : null));
      const b = new T.Box3().setFromObject(ps[0]), o = new T.Vector3((b.min.x + b.max.x) / 2, b.min.y, (b.min.z + b.max.z) / 2); for (const q of ps) { q.position.sub(o); KPIDE.add(q); } }   // pişmiş renk; orijin hamurun alt-orta noktası
    const rotP = (p, a, th) => new T.Matrix4().makeTranslation(p[0], p[1], p[2]).multiply(new T.Matrix4().makeRotationAxis(new T.Vector3(...a).normalize(), th * Math.PI / 180)).multiply(new T.Matrix4().makeTranslation(-p[0], -p[1], -p[2]));
    let kutuAn = null, kutuAcik = true;                                        // deger() son kare aralığı (a, b, w)
    function kutu() {
      const an = kutuAn, ka = KU && an ? KU.kare[an[0]] : null; KG.visible = !!(kutuAcik && ka); if (!KG.visible) return;
      const kb = an[1] < KU.kare.length ? KU.kare[an[1]] : null, w = kb ? an[2] : 0, ara = (x, y) => x + ((y ?? x) - x) * w;
      const kk = ka[0].map((x, i) => ara(x, kb && kb[0][i])), Tm = new T.Matrix4().makeTranslation((kk[0] - KU.kok0_mm[0]) / 1000, (kk[1] - KU.kok0_mm[1]) / 1000, (kk[2] - KU.kok0_mm[2]) / 1000);
      const aci = {}; KU.aci_ad.forEach((ad, i) => { aci[ad] = ara(ka[1][i], kb && kb[1][i]); });
      for (const [ad, g] of Object.entries(KPAN)) { const yol = []; for (let d = KZIN[ad]; d; d = KZIN[d.ebeveyn]) yol.unshift(d);
        const M = Tm.clone(); for (const d of yol) M.multiply(rotP(d.pivot_dunya_m, d.eksen_dunya, aci[d.ad.replace('E_KUTU__', '')] || 0)); g.matrix.copy(M); g.matrixWorldNeedsUpdate = true; }
      KPIDE.visible = !!ka[2]; if (ka[2]) KPIDE.position.set(ka[2][0] / 1000, ka[2][1] / 1000 + .0016, -.617 + (kk[2] - KU.kok0_mm[2]) / 1000);   // kutu ortası z (açınım −0,617 + kök kayması), tabana 1,6 karton
    }
    function uygula(v) { const cache = []; for (const g of DUG) { const k = g.userData.iz; if (k < 0) g.matrix.identity(); else g.matrix.copy(izMat(k, v, cache)); } yigin(v); kutu(); kok.updateMatrixWorld(true); }
    // ---- zaman: döngü + tek eksen süpürmesi ----
    const TAB = {}; for (const r of K.tablo) TAB[r.eksen] = r;
    let kip = 'DONGU', SURE = ZT[NZ - 1], plan = null;
    function kipSec(ad) {
      kip = ad || 'DONGU'; if (kip === 'DONGU') { SURE = ZT[NZ - 1]; plan = null; return SURE; }
      const r = TAB[kip], mx = r.max_gosterim ?? r.max, hz = kip === 'AX_E_ASANSOR' ? 60 : r.en_hiz, d = Math.abs(mx - r.min) / hz, j = EKS.indexOf(kip), b0 = V0[j];
      plan = {j, d, b0, mn: r.min, mx, ilk: Math.abs(b0 - r.min) / hz, son: Math.abs(mx - b0) / hz};       // v0 → min → max → v0, uçlarda 0,5 s bekleme
      SURE = plan.ilk + .5 + d + .5 + plan.son; return SURE; }
    function deger(t) {
      const tt = ((+t % SURE) + SURE) % SURE;
      if (!plan) { let a = 0, b = NZ - 1; while (b - a > 1) { const m = (a + b) >> 1; if (ZT[m] <= tt) a = m; else b = m; } const w = ZT[b] > ZT[a] ? Math.min(1, (tt - ZT[a]) / (ZT[b] - ZT[a])) : 0;
        kutuAn = [a, b, w]; return ZV[a].map((x, i) => x + (ZV[b][i] - x) * w); }
      kutuAn = null; const v = V0.slice(), p = plan; let x = tt;
      if (x < p.ilk) v[p.j] = p.b0 + (p.mn - p.b0) * x / Math.max(p.ilk, 1e-9); else if ((x -= p.ilk) < .5) v[p.j] = p.mn;
      else if ((x -= .5) < p.d) v[p.j] = p.mn + (p.mx - p.mn) * x / p.d; else if ((x -= p.d) < .5) v[p.j] = p.mx; else { x -= .5; v[p.j] = p.mx + (p.b0 - p.mx) * Math.min(1, x / Math.max(p.son, 1e-9)); }
      return v; }
    function faz(t) { if (plan) return kip; const tt = ((+t % SURE) + SURE) % SURE; for (const f of K.zaman.faz) if (tt >= f[1] && tt <= f[2]) return f[0]; return ''; }
    function guncelle(t) { uygula(deger(t)); }
    // ---- gerçek geometri ----
    let veri = null, gercekMi = false;
    async function gercek(acik) {
      acik = !!acik; if (acik === gercekMi) return;
      if (!acik) { basit(); gercekMi = false; return; }
      if (!veri) { await betik('e_gercek.js?v=8a4808ca869d', 'e_gercek'); const G = window.__GLB.e_gercek;
        for (const d of (G.devam || [])) await betik(d + '.js', d);           // yayın sınırı (16 MB) için bölünmüş bin parçaları
        veri = {meta: G.meta, buf: await gunzip(G.bin + (G.devam || []).map(d => window.__GLB[d]).join(''))}; }
      await betik('e_fit86.js?v=b749bfac84ce', 'e_fit86');
      const fit=window.__GLB.e_fit86,fitBuf=await gunzip(fit.bin),fitIds=new Set(fit.meta.map(x=>x[0]));
      for (const [pid, c, h, nv, op, ni, oi, u] of veri.meta) { const g = byId[pid]; if (!g || MOTOR.has(pid) || fitIds.has(pid)) continue; const q = new Int16Array(veri.buf, op, nv * 3), Pf = new Float32Array(nv * 3);
        for (let i = 0; i < nv; i++) for (let k = 0; k < 3; k++) Pf[i * 3 + k] = q[i * 3 + k] / 32767 * h[k] + c[k];
        const I = u === 16 ? new Uint16Array(veri.buf, oi, ni) : new Uint32Array(veri.buf, oi, ni), geo = new T.BufferGeometry();
        geo.setAttribute('position', new T.BufferAttribute(Pf, 3)); geo.setIndex(new T.BufferAttribute(I.slice(), 1)); giydir(g, kirikNormal(T, geo, 30), renkSec(P[pid])); }
      for(const [pid,nv,op,ni,oi]of fit.meta){const g=byId[pid];if(!g||MOTOR.has(pid))throw Error('E fit part missing '+pid);
        const geo=new T.BufferGeometry();geo.setAttribute('position',new T.BufferAttribute(new Float32Array(fitBuf,op,nv*3).slice(),3));
        geo.setIndex(new T.BufferAttribute(new Uint32Array(fitBuf,oi,ni).slice(),1));giydir(g,kirikNormal(T,geo,30),renkSec(P[pid]));}
      gercekMi = true;
    }
    guncelle(0);
    if (ctx.basitMi === false) await gercek(true);
    return {mekanizmalar: [...Object.keys(AD).map(k => AD[k]), YIGIN, ...(KU ? [KUTU_AD] : [])], get sure() { return SURE; }, guncelle, gercek, parca: P.length, motor: MOTOR.size,
      kipler: ['DONGU', ...EKS], kipSec, deger, faz, tablo: K.tablo, eksenler: EKS, DUG, kutuGoster(x) { kutuAcik = !!x; kutu(); },
      sur(G) { kutuAn = null; uygula(V0.map((x, j) => { const g = G(EKS[j]); return g == null ? x : +g; })); }};   // ANA 24 Eki · iskelet "İKİZ AKIŞI": eksenler ikizin PLC değerinden
  }
};
