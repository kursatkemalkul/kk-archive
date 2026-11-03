// B · Çekmece dolabı mekanizma modülü (BIRLESIM_MODULU.md). Düz betik; THREE global. Sahne / ışık / DOM döngüsü yok, yalnız ctx.kok.
// Veri mekanizma_b.html ile aynı: parcalar_b.json (parça + kutu + eksen), glbjs/b_gercek.js (gerçek geometri, int16 + gzip + base64),
// glbjs/b_motor.js (B31 1 Kas: 21 × FAULHABER 2668W024CR + 32GPT 30:1 + IE3-1024, üretici STEP; basit ve gerçek kipte). Uç sensörleri: 42 × ifm IFS204 (kapalı + açık, 304 hedef).
// Soğutma (sogutma_b.py): Secop CU NLE8.8CN zarfı + 2 lamelli evaporatör + 4 × ebm-papst 4414 FL (föy) + Cu hatlar + drenaj; fanlar döner.
// Dünya koordinatı (m; x hat · y yukarı · z ön +) birebir. Döngü: 21 çekmece + depo sırayla tek tek aç (strok / hız) → 1 s bekle → kapat → 0,4 s ara.
(window.MEKANIZMA = window.MEKANIZMA || {})['B'] = {
  ad: 'B · Çekmece dolabı',
  async kur(ctx) {
    const T = ctx.THREE, kok = ctx.kok, taban = ctx.taban || 'B/';
    const J = await (await fetch(taban + 'parcalar_b.json')).json();
    const AD = {ray: 'Teleskopik raylar', kayis: 'Kayış · kasnak · avara', tahrik: 'Tahrik (24 V redüktörlü motor · kaplin · mil · braket)', sensor: 'Uç sensörleri (kapalı + açık ifm IFS204) · 304 hedef',
      cekmece: 'Çekmece kutusu · ön panel · çene', sogutma: 'Soğutma (kompresör, kondenser, evaporatör)', baglanti: 'Bağlantı elemanları'};
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
    const H = J.hareket, P = J.parcalar, EDGE = new T.LineBasicMaterial({color: 0x000000, transparent: true, opacity: .55}), MAT = {};
    const mat = r => MAT[r] || (MAT[r] = new T.MeshStandardMaterial({color: new T.Color('#' + String(r || 'b0b6bc').replace('#', '')), metalness: .35, roughness: .55}));
    const pivot = {}, DON = /^(GT3 kasnak|Kasnak mili|Kaplin|Set vidası M3 × 4)/, AVARA = /^GT3 avara/;
    // dönme ekseni: kasnak milinin kutu merkezi (kasnak kutusu dişten asimetrik, 0,245 mm kaçık; 23 Eki)
    for (const p of P) if (p.ad.startsWith('Kasnak mili')) { const b = p.kutu_mm; pivot[p.eksen] = [(b[1] + b[4]) / 2000, (b[2] + b[5]) / 2000]; }
    const DUG = [], byId = {}, hareketli = {}, gruplar = {};
    for (const k of Object.keys(AD)) { const g = new T.Group(); g.name = 'B_MEK_' + k; g.userData = {mekanizma: AD[k], ist: 'B'}; kok.add(g); gruplar[k] = g; }
    for (const p of P) {
      const g = new T.Group(); g.name = 'B_P' + p.id; let piv = null;
      if (DON.test(p.ad) && pivot[p.eksen]) piv = pivot[p.eksen]; else if (AVARA.test(p.ad)) { const b = p.kutu_mm; piv = [pivot[p.eksen] ? pivot[p.eksen][0] : (b[1] + b[4]) / 2000, (b[2] + b[5]) / 2000]; }
      const dn = p.don || null; g.userData = {id: p.id, ad: p.ad, eks: p.eksen, har: p.hareket, mekanizma: AD[p.mekanizma] || p.mekanizma, ist: 'B', piv, don: dn};
      if (piv) g.position.set(0, piv[0], piv[1]); if (dn) g.position.set(dn[0], dn[1], dn[2]);
      const ic = new T.Group(); if (piv) ic.position.set(0, -piv[0], -piv[1]); if (dn) ic.position.set(-dn[0], -dn[1], -dn[2]); g.add(ic); g.userData.ic = ic;
      (gruplar[p.mekanizma] || gruplar.baglanti).add(g); DUG.push(g); byId[p.id] = g;
      if (p.eksen) (hareketli[p.eksen] = hareketli[p.eksen] || []).push(g);
    }
    const giydir = (g, geo, renk) => { const ic = g.userData.ic; ic.clear(); const m = new T.Mesh(geo, mat(renk)); m.userData = {id: g.userData.id, mekanizma: g.userData.mekanizma, ist: 'B'};
      const e = new T.LineSegments(new T.EdgesGeometry(geo, 30), EDGE); e.userData = {mekanizma: g.userData.mekanizma, ist: 'B', kenar: true}; ic.add(m, e); };
    const MOTOR = new Set(), gunzip = async b64 => new Response(new Blob([Uint8Array.from(atob(b64), c => c.charCodeAt(0))]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer();
    await new Promise((ok, no) => { if (window.__GLB && window.__GLB.b_motor) return ok(); const s = document.createElement('script'); s.src = taban + 'glbjs/b_motor.js'; s.onload = ok; s.onerror = () => no(Error('B modülü: b_motor.js yüklenemedi')); document.head.appendChild(s); });
    { const GM = window.__GLB.b_motor, mb = await gunzip(GM.bin), MG = {};
      for (const [md, m] of Object.entries(GM.modeller)) MG[md] = m.alt.map(([c, nv, op, ni, oi, u, cc, hh]) => { const q = new Int16Array(mb, op, nv * 3), Pf = new Float32Array(nv * 3);
        for (let i = 0; i < nv; i++) for (let k = 0; k < 3; k++) Pf[i * 3 + k] = q[i * 3 + k] / 32767 * hh[k] + cc[k];
        const geo = new T.BufferGeometry(); geo.setAttribute('position', new T.BufferAttribute(Pf, 3)); geo.setIndex(new T.BufferAttribute((u === 16 ? new Uint16Array(mb, oi, ni) : new Uint32Array(mb, oi, ni)).slice(), 1)); const gk = kirikNormal(T, geo, 30);
        return {geo: gk, mat: new T.MeshStandardMaterial({color: new T.Color(c), metalness: .45, roughness: .45}), k: new T.EdgesGeometry(gk, 35)}; });
      for (const [pid, md, W] of GM.ornek) { const g = byId[pid]; if (!g) continue; MOTOR.add(pid); const ic = g.userData.ic; ic.clear(); const h = new T.Group(); h.matrixAutoUpdate = false; h.matrix.fromArray(W);
        for (const a of MG[md]) { const m = new T.Mesh(a.geo, a.mat); m.userData = {id: pid, mekanizma: g.userData.mekanizma, ist: 'B', motor: md}; const e = new T.LineSegments(a.k, EDGE); e.userData = {mekanizma: g.userData.mekanizma, ist: 'B', kenar: true}; h.add(m, e); }
        ic.add(h); } }
    function basit() { for (const p of P) { if (MOTOR.has(p.id)) continue; const b = p.kutu_mm, s = [(b[3] - b[0]) / 1000, (b[4] - b[1]) / 1000, (b[5] - b[2]) / 1000].map(v => Math.max(v, .0004));
      // A drawer is a hollow tray even in light mode, never a solid block
      // through its stock. Keep the existing CAD envelope, with 2 mm sheet.
      let geo;
      if (p.ad === 'Çekmece kutusu') {
        const [x,y,z]=s,t=.002, pieces=[
          [[x,t,z],[0,-y/2+t/2,0]],
          [[t,y,z],[-x/2+t/2,0,0]],[[t,y,z],[x/2-t/2,0,0]],
          [[x,y,t],[0,0,-z/2+t/2]],[[x,y,t],[0,0,z/2-t/2]]];
        const arrays=pieces.map(([size,pos])=>{const g=new T.BoxGeometry(...size).toNonIndexed();g.translate(...pos);const a=g.attributes.position.array.slice();g.dispose();return a;});
        const pos=new Float32Array(arrays.reduce((n,a)=>n+a.length,0));let off=0;for(const a of arrays){pos.set(a,off);off+=a.length;}
        geo=new T.BufferGeometry();geo.setAttribute('position',new T.BufferAttribute(pos,3));geo.computeVertexNormals();
      } else geo = new T.BoxGeometry(...s);
      geo.translate((b[0] + b[3]) / 2000, (b[1] + b[4]) / 2000, (b[2] + b[5]) / 2000); giydir(byId[p.id], geo, p.renk); } }
    basit();
    // zaman planı (mekanizma_b.html ile aynı)
    const EKS = Object.keys(H).sort((a, b) => a === 'B_DEPO' ? 1 : b === 'B_DEPO' ? -1 : a.localeCompare(b, 'tr', {numeric: true}));
    const BEK = 1.0, ARA = .4, R = .028650 / 2, plan = []; let SURE = 0;
    for (const e of EKS) { const d = H[e].strok / H[e].hiz; plan.push({e, t0: SURE, d}); SURE += 2 * d + BEK + ARA; }
    const konum = (a, tt) => { const x = tt - a.t0, d = a.d; if (x <= 0) return 0; if (x < d) return x / d; if (x < d + BEK) return 1; if (x < 2 * d + BEK) return 1 - (x - d - BEK) / d; return 0; };
    // sur (ANA 24 Eki, iskelet "İKİZ AKIŞI"): her çekmece ikizin AX_B_<id> değerinden (mm, 0…strok); fanlar dönmez
    const oran = {};   // sur'un son açıklık oranları (iskeletin çekmece önleri bunu izler)
    function sur(G) { for (const a of plan) { const ax = a.e === 'B_DEPO' ? 'AX_B_DEPO' : (a.e.startsWith('AX_') ? a.e : 'AX_' + a.e), g = G(ax); cek(a, oran[ax.slice(3)] = Math.max(0, Math.min(1, (+g || 0) / H[a.e].strok))); } kok.updateMatrixWorld(true); }   // 24 Eki düzeltme: plan adı zaten AX_ ile başlıyor (AX_AX_ istenip çekmece hiç açılmıyordu); oran anahtarı kapak kimliği (B_K3_3)
    function cek(a, k) { const s = k * H[a.e].strok / 1000, y = H[a.e].yon;
        for (const g of hareketli[a.e] || []) { const u = g.userData, px = u.piv ? u.piv[0] : 0, pz = u.piv ? u.piv[1] : 0;
          if (u.har === 'cekmece') g.position.set(y[0] * s, px + y[1] * s, pz + y[2] * s); else if (u.har === 'ara') g.position.set(y[0] * s / 2, y[1] * s / 2, y[2] * s / 2);
          else g.position.set(0, px, pz);
          g.rotation.set(u.piv ? -s / R : 0, 0, 0); } }
    function guncelle(t) {
      const tt = ((+t % SURE) + SURE) % SURE;
      for (const a of plan) { const s = konum(a, tt) * H[a.e].strok / 1000, y = H[a.e].yon;
        for (const g of hareketli[a.e] || []) { const u = g.userData, px = u.piv ? u.piv[0] : 0, pz = u.piv ? u.piv[1] : 0;
          if (u.har === 'cekmece') g.position.set(y[0] * s, px + y[1] * s, pz + y[2] * s); else if (u.har === 'ara') g.position.set(y[0] * s / 2, y[1] * s / 2, y[2] * s / 2);
          else g.position.set(0, px, pz);
          g.rotation.set(u.piv ? -s / R : 0, 0, 0); } }
      for (const g of DUG) if (g.userData.don) g.rotation.z = -2 * Math.PI * tt;      // soğutma fanları: gösterim 60 dev/dk (4414 FL ≈ 2650 dev/dk, föy)
      kok.updateMatrixWorld(true);
    }
    let veri = null, gercekMi = false;
    const js = () => new Promise((ok, no) => { if (window.__GLB && window.__GLB.b_gercek) return ok(); const s = document.createElement('script'); s.src = taban + 'glbjs/b_gercek.js'; s.onload = ok; s.onerror = () => no(Error('B modülü: b_gercek.js yüklenemedi')); document.head.appendChild(s); });
    async function gercek(acik) {
      acik = !!acik; if (acik === gercekMi) return;
      if (!acik) { basit(); gercekMi = false; return; }
      if (!veri) { await js(); const G = window.__GLB.b_gercek, bin = Uint8Array.from(atob(G.bin), c => c.charCodeAt(0));
        veri = {meta: G.meta, buf: await new Response(new Blob([bin]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer()}; }
      for (const [pid, c, h, nv, op, ni, oi, u] of veri.meta) { const g = byId[pid]; if (!g || MOTOR.has(pid)) continue; const q = new Int16Array(veri.buf, op, nv * 3), Pf = new Float32Array(nv * 3);
        for (let i = 0; i < nv; i++) for (let k = 0; k < 3; k++) Pf[i * 3 + k] = q[i * 3 + k] / 32767 * h[k] + c[k];
        const I = u === 16 ? new Uint16Array(veri.buf, oi, ni) : new Uint32Array(veri.buf, oi, ni), geo = new T.BufferGeometry();
        geo.setAttribute('position', new T.BufferAttribute(Pf, 3)); geo.setIndex(new T.BufferAttribute(I.slice(), 1)); giydir(g, kirikNormal(T, geo, 30), P[pid].renk); }
      gercekMi = true;
    }
    guncelle(0);
    if (ctx.basitMi === false) await gercek(true);
    // konumEks: eksenin açıklık oranı (0…1), iskeletin kendi çekmece önlerini bu zamanlamaya bağlamak için (ANA 23 Eki, iskelet v116)
    const konumEks = (e, t) => { const a = plan.find(q => q.e === e); return a ? konum(a, ((+t % SURE) + SURE) % SURE) : 0; };
    return {mekanizmalar: Object.keys(AD).map(k => AD[k]), sure: SURE, guncelle, sur, oran, gercek, konumEks, P, parca: P.length, motor: MOTOR.size};
  }
};
