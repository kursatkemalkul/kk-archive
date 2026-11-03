// İKİZ · İÇİNE GEÇME TARAMASI (10 Eki 2026 · Claude · ENTEGRASYON · PAKET_10EKI KABUL C)
// Her karede (ikiz/durum çerçevesi) HAREKETLİ düğümleri sahnenin geri kalanına (sabit + hareketli) karşı AĞ KESİŞİMİYLE tarar (three-mesh-bvh).
// Hareketli = ikiz-esleme.js uygula()'nın dokunduğu düğümler (ik.dinlenme) + robot iskeleti + Tool + userData.hareketli; ürün (userData.urun) kendi grubu.
// Hız: bir çiftin GÖRELİ dönüşümü dinlenmedekiyle aynıysa sonuç dinlenmedekiyle aynıdır → yalnız göreli konumu değişen çiftler taranır.
// Beklenen temas: (1) DİNLENME pozunda da kesişen çiftler ('önceden var' — DIN ray kilit dili, diş tutuşu, kaynak … ENT statik çakışma sınıflamasında;
// bulunan çift için dinlenme matrisleriyle ayrıca sorulur) · (2) aynı hareketli grup (birlikte taşınır) · (3) ürün ↔ tutucu 'kavrama' (ayrı sınıf).
// Geri kalan = İHLAL (0 olmalı). Morph'lu ağlar (Rochu çene) her karede anlık geometriyle taranır.
export function taramaKur(sahne, ik, E, THREE, BVH) {
  const { MeshBVH } = BVH;
  // İKİZ lideri kare dökümü (?poz=) için ürün kutu havuzu: önceden sahneye (gizli), userData.urun → kendi grubu
  const HAVUZ = [];
  for (let i = 0; i < 48; i++) { const m = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial()); m.name = 'URUN_SERBEST_' + i; m.visible = false; m.userData.urun = true; sahne.add(m); HAVUZ.push(m); }
  const ag = []; sahne.traverse(o => { if (o.isMesh && o.geometry && o.geometry.attributes.position) ag.push(o); });
  const kokler = new Set(ik.dinlenme.keys());
  const ekKok = n => { const o = sahne.getObjectByName(n); if (o) kokler.add(o); };
  ['Tool', 'UR10E_body_07', 'IKIZ_J__RailJoint'].forEach(ekKok);
  Object.values((E.robot && E.robot.kol) || {}).forEach(v => ekKok(v.dugum));
  const grup = new Map();
  for (const m of ag) {
    let o = m, g = null;
    while (o) { if (kokler.has(o) || (o.userData && o.userData.hareketli)) g = o; o = o.parent; }
    let u = m; while (u && !(u.userData && u.userData.urun)) u = u.parent;
    grup.set(m, u || g);
  }
  const gorunur = m => { let o = m; while (o) { if (o.visible === false) return false; o = o.parent; } return true; };
  // dinlenme matrisleri (durum boş)
  ik.uygula({ eksenler: {}, cikislar: {}, qr: {}, robot: {} }); sahne.updateMatrixWorld(true);
  const M0 = new Map(ag.map(m => [m, m.matrixWorld.clone()]));
  const bvh = new Map();
  const agac = m => {
    if (m.morphTargetInfluences && m.morphTargetInfluences.some((w, i) => i > 0 && w)) {
      const p = m.geometry.attributes.position, mp = m.geometry.morphAttributes.position || [], w = m.morphTargetInfluences;
      const X = new Float32Array(p.count * 3);
      for (let i = 0; i < p.count; i++) for (let k = 0; k < 3; k++) {
        let v = p.getComponent(i, k); for (let t = 0; t < mp.length; t++) if (w[t]) v += w[t] * mp[t].getComponent(i, k); X[i * 3 + k] = v;
      }
      const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(X, 3)); if (m.geometry.index) g.setIndex(m.geometry.index.clone());
      const b = new MeshBVH(g); g.boundsTree = b; return { g, b, morph: true };
    }
    if (!bvh.has(m)) { const b = m.geometry.boundsTree || new MeshBVH(m.geometry); m.geometry.boundsTree = b; bvh.set(m, { g: m.geometry, b }); }   // karşı geometride boundsTree → ağaç ↔ ağaç (bvhcast)
    return bvh.get(m);
  };
  for (const m of ag) if (!m.geometry.boundingBox) m.geometry.computeBoundingBox();
  const Mr = new THREE.Matrix4(), Ma = new THREE.Matrix4(), Mb = new THREE.Matrix4();
  const ad = m => { let o = m; while (o && (!o.name || /_mesh_\d+$/.test(o.name))) o = o.parent; return (o && o.name) || m.name || '?'; };
  const esit = (A, B) => { const a = A.elements, b = B.elements; for (let i = 0; i < 16; i++) if (Math.abs(a[i] - b[i]) > 1e-7) return false; return true; };
  const kesisir = (a, b, ma, mb) => { const A = agac(a), B = agac(b); Mr.copy(ma).invert().multiply(mb); return A.b.intersectsGeometry(B.g, Mr); };
  const tabanOnbellek = new Map();
  const tabanda = (a, b) => {
    if (HAVUZ.includes(a) || HAVUZ.includes(b)) return false;          // ürün kutusunun dinlenmesi yok                                    // dinlenmede de kesişiyor mu (yalnız bulunan çiftler için)
    const k = a.uuid + b.uuid; if (!tabanOnbellek.has(k)) {
      const A0 = new THREE.Box3().copy(a.geometry.boundingBox).applyMatrix4(M0.get(a)), B0 = new THREE.Box3().copy(b.geometry.boundingBox).applyMatrix4(M0.get(b));
      const morph = a.morphTargetInfluences || b.morphTargetInfluences;   // morph'lu çenede taban = açık çene (ağırlık 0)
      tabanOnbellek.set(k, A0.intersectsBox(B0) && !morph && kesisir(a, b, M0.get(a), M0.get(b)));
    }
    return tabanOnbellek.get(k);
  };
  const TUT = (E.robot && E.robot.tutucu) || {};
  const sablon = []; sahne.traverse(o => { if (o.userData && o.userData.urun_sablon) sablon.push(o); });
  const TUTUCU_RE = /DAC_parmak|DAC_govde|^TUTUCU_|^B_cene|^A_ISO|^RWC|^ISO\d|^Oring|^SMC_KQ2/;
  const kavramaMi = (a, b) => ((/^URUN_(?!SERBEST)/.test(a)) && TUTUCU_RE.test(b)) || ((/^URUN_(?!SERBEST)/.test(b)) && TUTUCU_RE.test(a));
  const sonuc = { kare: 0, test: 0, ihlal: new Map(), kavrama: new Map(), beklenen: 0 };
  const ROLL = /_DONER__RULO_|^K_BANT__RULO_/;
  const kutu = new Map();
  const W = new THREE.Matrix4(), Pi = new THREE.Matrix4(), _p = new THREE.Vector3(), _q = new THREE.Quaternion(), _s = new THREE.Vector3();
  const adla = new Map(); sahne.traverse(o => { if (o.name && !adla.has(o.name)) adla.set(o.name, o); });
  // poz satırı (İKİZ lideri kabul_c.py): {t, neden, d: {ad: [x,y,z,qx,qy,qz,qw,gorunur]}, u: [{id, tur, bicim, min, max, tutucuda}]}
  function pozUygula(satir) {
    ik.uygula({ eksenler: {}, cikislar: {}, qr: {}, robot: {} });            // her şey dinlenme, sonra dökümdeki dünya pozları
    for (const o of sablon) o.visible = false;
    const D = satir.d || {}, adlar = Object.keys(D).sort((x, y) => derinlik(adla.get(x)) - derinlik(adla.get(y)));
    for (const n of adlar) {
      const o = adla.get(n); if (!o) continue; const v = D[n];
      o.parent.updateWorldMatrix(true, false);
      W.compose(_p.set(v[0], v[1], v[2]), _q.set(v[3], v[4], v[5], v[6]), _s.setFromMatrixScale(o.matrixWorld));
      Pi.copy(o.parent.matrixWorld).invert().multiply(W); Pi.decompose(o.position, o.quaternion, o.scale);
      o.visible = v[7] === undefined ? true : !!v[7]; o.updateMatrixWorld(true);
    }
    HAVUZ.forEach(m => { m.visible = false; });
    (satir.u || []).slice(0, HAVUZ.length).forEach((u, i) => {
      const m = HAVUZ[i], a = u.min, b = u.max, k = 0.001;                  // 1 mm içe: yüzeye oturma teması sayılmaz
      m.name = (u.tutucuda ? 'URUN_ELDE_' : 'URUN_SERBEST_') + (u.id !== undefined ? u.id : i) + '_' + (u.tur || '');
      m.position.set((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2); m.quaternion.identity();
      m.scale.set(Math.max(1e-4, b[0] - a[0] - 2 * k), Math.max(1e-4, b[1] - a[1] - 2 * k), Math.max(1e-4, b[2] - a[2] - 2 * k)); m.visible = true;
    });
  }
  const derinlik = o => { let n = 0; while (o && o.parent) { n++; o = o.parent; } return n; };
  function kare(durum, etiket) {
    if (durum && durum.d) pozUygula(durum); else {
      ik.uygula(durum);
      const r = durum.robot || {}, h = (TUT.urun_hedef || {})[String(r.urun || '').toUpperCase()];
      for (const o of sablon) o.visible = !!(h && (+r.kapanma || 0) > 0 && o.userData.urun_sablon === h);
    }
    sonuc.kare++;
    sahne.updateMatrixWorld(true);
    const oynayan = ag.filter(m => grup.get(m) && gorunur(m) && (!esit(m.matrixWorld, M0.get(m)) || HAVUZ.includes(m) || (m.morphTargetInfluences && m.morphTargetInfluences.some((w, i) => i > 0 && w)) || (m.userData.urun_sablon || (m.parent && m.parent.userData.urun_sablon))));
    if (!oynayan.length) return;
    for (const m of ag) kutu.set(m, new THREE.Box3().copy(m.geometry.boundingBox).applyMatrix4(m.matrixWorld));
    const goruldu = new Set();
    for (const a of oynayan) {
      const ka = kutu.get(a), ga = grup.get(a);
      for (const b of ag) {
        if (b === a || grup.get(b) === ga || !gorunur(b)) continue;
        const ck = a.id < b.id ? a.id + ':' + b.id : b.id + ':' + a.id; if (goruldu.has(ck)) continue; goruldu.add(ck);
        if (!ka.intersectsBox(kutu.get(b))) continue;
        // göreli dönüşüm dinlenmedekiyle aynı mı? (ikisi birlikte aynı hareketi yaptıysa sonuç dinlenmedekiyle aynı)
        Ma.copy(M0.get(a)).invert().multiply(M0.get(b)); Mb.copy(a.matrixWorld).invert().multiply(b.matrixWorld);
        const morph = (a.morphTargetInfluences && a.morphTargetInfluences.some((w, i) => i > 0 && w)) || (b.morphTargetInfluences && b.morphTargetInfluences.some((w, i) => i > 0 && w));
        if (!morph && esit(Ma, Mb) && !/^URUN_/.test(ad(a)) && !/^URUN_/.test(ad(b))) continue;
        sonuc.test++;
        if (!kesisir(a, b, a.matrixWorld, b.matrixWorld)) continue;
        if (tabanda(a, b)) continue;
        const na = ad(a), nb = ad(b), k = na < nb ? na + '|' + nb : nb + '|' + na;
        // beklenen · dönen rulo ↔ bant / yatak: çokgen rulo ağı kendi ekseninde dönünce köşeleri bant / yatağa sürter (geometri yuvarlak değil)
        if (ROLL.test(na) && /bant|GOVDE|KONVEYOR|yatak/i.test(nb) || ROLL.test(nb) && /bant|GOVDE|KONVEYOR|yatak/i.test(na)) { sonuc.beklenen = (sonuc.beklenen || 0) + 1; continue; }
        const hedef = kavramaMi(na, nb) ? sonuc.kavrama : sonuc.ihlal;
        const e = hedef.get(k) || { a: na, b: nb, ilk: etiket, son: etiket, sayi: 0 }; e.son = etiket; e.sayi++; hedef.set(k, e);
      }
    }
  }
  function rapor() {
    return { kare: sonuc.kare, cift_testi: sonuc.test, beklenen_rulo: sonuc.beklenen, ihlal: [...sonuc.ihlal.values()].sort((x, y) => y.sayi - x.sayi), kavrama: [...sonuc.kavrama.values()],
             hareketli_ag: ag.filter(m => grup.get(m)).length, ag: ag.length, bvh: bvh.size };
  }
  return { kare, rapor, sablon };
}

// kare örnekleme: durum çerçeveleri (t artan) → saniyede ≥ 1 kare + her görev başı / sonu (gorev alanı değişince)
export function ornekle(kareler, adim_s = 1.0) {
  const out = []; let son = -1e9, onceki = null;
  for (const k of kareler) {
    const t = +k.t || 0, g = JSON.stringify((k.robot && k.robot.gorev) || k.gorev || null);
    if (t - son >= adim_s || g !== onceki) { out.push(k); son = t; }
    onceki = g;
  }
  return out;
}
