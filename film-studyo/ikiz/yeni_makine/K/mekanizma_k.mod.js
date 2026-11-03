// K · Kesme + sprey mekanizma modülü (BIRLESIM_MODULU.md). Düz betik, THREE r128 global. Sahne / ışık / kamera / UI yok:
// yalnız ctx.kok altına dünya koordinatında (m, ikiz 8920 ile birebir) parçalar. Veri mekanizma_k.html ile aynı
// (veri/k_veri.js: parça listesi + basit model, gercek/k_gercek_<n>.js: gerçek üçgenler; ikisi de gzip + base64).
(window.MEKANIZMA = window.MEKANIZMA || {})['K'] = {
 ad: 'K · Kesme + sprey',
 async kur(ctx) {
  const {THREE} = ctx, kok = ctx.kok, taban = ctx.taban || 'K/';
  const betik = f => new Promise((ok, no) => { const s = document.createElement('script'); s.src = taban + f; s.onload = ok; s.onerror = () => no(Error('K modülü: yüklenemedi ' + f)); document.head.appendChild(s); });
  const b64 = s => Uint8Array.from(atob(s), c => c.charCodeAt(0));
  const gunzip = async u => new Response(new Blob([u]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer();
  const VK = '1e99f8166ee3';   // veri + gerçek dosyaların içerik özeti (k_mod_damga.py)
  if (!window.__MEKK_K) await betik('veri/k_veri.js?v=' + VK);
  const V = window.__MEKK_K.V, P = V.parcalar, H = V.hareket, AD = H.adimlar;
  const RENK = {BANT: 0x2f8f7a, KESICI: 0xc2410c, ITICI: 0x2f62b3, YAG_SPREY: 0xb07d10, PNOMATIK: 0x7a4bb0}, VIDA = 0x585e66;
  const KENAR = new THREE.LineBasicMaterial({color: 0x101214}), malz = {};
  const malzeme = p => { const k = p.m + '|' + p.tur; if (malz[k]) return malz[k];
   const c = new THREE.Color(p.tur === 'baglanti' ? VIDA : p.tur === 'kaynak' ? 0x3d4146 : RENK[p.m]); if (p.tur === 'hortum') c.lerp(new THREE.Color(0xffffff), .35);
   return malz[k] = new THREE.MeshStandardMaterial({color: c, metalness: .25, roughness: .6, flatShading: true, side: THREE.DoubleSide, transparent: p.tur === 'hortum', opacity: p.tur === 'hortum' ? .9 : 1}); };
  const geo = (buf, h) => { const [o, nv, io, ni] = h, q = new Uint16Array(buf, o, nv * 3), f = new Uint32Array(buf, io, ni), a = new Float32Array(nv * 3);
   for (let i = 0; i < nv; i++) { a[i * 3] = V.O[0] + q[i * 3] * V.Q; a[i * 3 + 1] = V.O[1] + q[i * 3 + 1] * V.Q; a[i * 3 + 2] = V.O[2] + q[i * 3 + 2] * V.Q; }
   const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(a, 3)); g.setIndex(new THREE.BufferAttribute(f, 1)); g.computeVertexNormals(); g.computeBoundingSphere(); return g; };
  const kenar = (m, g, limit) => { for (const c of [...m.children]) if (c.isLineSegments) { m.remove(c); c.geometry.dispose(); } if (g.index && g.index.count / 3 <= limit) m.add(new THREE.LineSegments(new THREE.EdgesGeometry(g, 30), KENAR)); };
  const buf = await gunzip(b64(window.__MEKK_K.BASIT)), mesh = {};
  P.forEach((p, i) => { const g = geo(buf, V.basit[i]), m = new THREE.Mesh(g, malzeme(p)); m.matrixAutoUpdate = false; m.name = p.ad;
   m.userData = {mekanizma: V.mekanizmalar[p.m], ist: 'K', tur: p.tur, parca: p}; kenar(m, g, 1e9); kok.add(m); mesh[p.id] = m; });
  // çevrim (hareket_k.json = ikiz programı FB_Kesme + reçete süreleri); sayfa ve denetimle aynı formül
  const KANAL = ['bant_mm', 'bicak_mm', 'pim_mm', 'x_mm', 'z_mm'], bas = []; let sure = 0; for (const a of AD) { bas.push(sure); sure += a.sure; }
  const durum = t => { const d = {bant_mm: 0, bicak_mm: 0, pim_mm: 0, x_mm: 0, z_mm: 0};
   for (let i = 0; i < AD.length; i++) { if (t < bas[i]) continue; const a = AD[i], u = Math.min(1, Math.max(0, (t - bas[i]) / a.sure));
    for (const k of KANAL) if (a[k]) { const s = k === 'bant_mm' ? u : u * u * (3 - 2 * u); d[k] = a[k][0] + (a[k][1] - a[k][0]) * s; } } return d; };
  const matris = (g, d) => { const G = H.gruplar[g], M = new THREE.Matrix4(); if (!G) return M;
   if (G.tur === 'oteleme') return M.makeTranslation(...G.yon.map(v => v * d[G.kanal] / 1000));
   if (G.tur === 'oteleme2') return M.makeTranslation(...G.yon.map((v, i) => v * d[G.kanal] / 1000 + G.yon2[i] * d[G.kanal2] / 1000));
   if (G.tur === 'oteleme_donme') { const [px, py] = G.pivot, s = d[G.kanal]; return new THREE.Matrix4().makeTranslation(...G.yon.map((v, i) => v * s / 1000 + (i === 0 ? px : i === 1 ? py : 0))).multiply(new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(...G.eksen), s * G.oran)).multiply(new THREE.Matrix4().makeTranslation(-px, -py, 0)); }   // pinyon: arabayla öteler + kremayerde yuvarlanır
   if (G.tur === 'donme') { const [px, py] = G.pivot; return new THREE.Matrix4().makeTranslation(px, py, 0).multiply(new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(...G.eksen), d[G.kanal] * G.oran)).multiply(new THREE.Matrix4().makeTranslation(-px, -py, 0)); }
   return M; };
  // SMC TLM1008 servis hortumu: ikizdeki k_hortum.js analitik hattı (s = bıçak mm)
  const tlmGeo = sx => { const s = Math.max(0, Math.min(125, sx)), xf = 4155, rad = Math.hypot(4355 - xf, 200) / 2, tot = 33 + Math.PI * 50 + 240 + Math.PI * rad;
   class Y extends THREE.Curve { getPoint(t, v = new THREE.Vector3()) { const ym = 1329.1 - s, yf = 1250, yc = (ym + yf) / 2 + 120; let l = t * tot, x, y, z;
    if (l <= 33) { x = 4222 + l; y = 1229.1 - s; z = -206; } else if ((l -= 33) <= Math.PI * 50) { const a = l / 100; x = 4255 + 100 * Math.sin(a); y = ym - 100 * Math.cos(a); z = -206; }
    else if ((l -= Math.PI * 50) <= yc - ym) { x = 4355; y = ym + l; z = -206; } else if ((l -= yc - ym) <= Math.PI * rad) { const a = l / rad; x = (4355 + xf) / 2 + (4355 - xf) / 2 * Math.cos(a); y = yc + rad * Math.sin(a); z = -306 + 100 * Math.cos(a); }
    else { l -= Math.PI * rad; x = xf; y = yc - l; z = -406; } return v.set(x / 1000, y / 1000, z / 1000); } }
   return new THREE.TubeGeometry(new Y(), 256, .005, 12, false); };
  let tlmS = null;
  // Çevrim başına bant 734,67 mm ilerler: dönen grupların açısı çevrim sayısıyla birikir (başa sarmada sıçrama yok).
  // Birleşik sayfa ham t'yi (mod almadan) verirse dönüş süreklidir; aynı t → aynı poz.
  const bantCevrim = durum(sure - 1e-9).bant_mm;
  function guncelle(t) { const n = Math.floor(t / sure); t = t - n * sure; const d = durum(t); d.bant_mm += n * bantCevrim; uygulaD(d); }
  // sur (ANA 24 Eki, iskelet "İKİZ AKIŞI"): ikizin PLC kanallarıyla sür — G(ad) ikiz değeri (AX_K_BANT mm · SX_K_BICAK / SX_K_PIM / SX_K_ITICI_X / SX_K_ITICI_Z mm)
  function sur(G) { uygulaD({bant_mm: +G('AX_K_BANT') || 0, bicak_mm: +G('SX_K_BICAK') || 0, pim_mm: +G('SX_K_PIM') || 0, x_mm: +G('SX_K_ITICI_X') || 0, z_mm: +G('SX_K_ITICI_Z') || 0}); }
  function uygulaD(d) {
   for (const p of P) { const m = mesh[p.id];
    if (p.h === 'TLM_HAREKETLI') { const k = Math.round(d.bicak_mm * 10); if (tlmS !== k) { tlmS = k; const g = tlmGeo(d.bicak_mm); m.geometry.dispose(); m.geometry = g; kenar(m, g, 0); } m.matrix.identity(); }
    else m.matrix.copy(matris(p.h, d));
    m.matrixWorldNeedsUpdate = true; } }
  let gbuf = null;
  async function gercek(acik) {
   if (acik) { if (!gbuf) { gbuf = []; for (let i = 0; i < V.dosyalar.length; i++) { await betik(V.dosyalar[i] + '?v=' + VK); gbuf[i] = await gunzip(b64(window.__MEKK['k_gercek_' + i])); delete window.__MEKK['k_gercek_' + i]; } }
    for (const p of P) { if (p.h === 'TLM_HAREKETLI') continue; const [i, ...h] = V.gercek[p.id], m = mesh[p.id]; if (!m.userData.basit) m.userData.basit = m.geometry; else if (m.geometry !== m.userData.basit) continue; const g = geo(gbuf[i], h); m.geometry = g; kenar(m, g, 12000); } }
   else for (const p of P) { const m = mesh[p.id]; if (p.h === 'TLM_HAREKETLI' || !m.userData.basit || m.geometry === m.userData.basit) continue; m.geometry.dispose(); m.geometry = m.userData.basit; kenar(m, m.geometry, 1e9); } }
  guncelle(0);
  return {mekanizmalar: Object.values(V.mekanizmalar), sure, guncelle, sur, gercek, parcaSayisi: P.length};
 }
};
