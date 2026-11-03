// İKİZ · EŞLEME UYGULAYICI (7 Eki 2026 · Claude · ENTEGRASYON) — ikiz_esleme.json + hat3_ikiz_v1.glb.gz
// Kullanım (three.js): const ik = ikizKur(gltf.scene, esleme, THREE); her ikiz/durum çerçevesinde ik.uygula(durum);
// Yalnız GÖSTERİR: konumlar programın ikiz/durum çerçevesinden (eksenler, cikislar, qr, robot) gelir; zaman çizelgesi yok (IKIZ_PLAN kural 1).
export function ikizKur(sahne, E, THREE) {
  const ad = {};
  sahne.traverse(o => { if (o.name) ad[o.name] = o; });
  const dinlenme = new Map();
  const not = o => { if (o && !dinlenme.has(o)) dinlenme.set(o, { p: o.position.clone(), q: o.quaternion.clone() }); return o; };
  const eksik = new Set();
  const bul = n => { const o = ad[n]; if (!o) eksik.add(n); return not(o); };
  const derece = THREE.MathUtils.degToRad;
  const v3 = a => new THREE.Vector3(a[0], a[1], a[2]);

  // makine + QR: düğüm → katkı listesi
  const katki = [];          // {o, tur, yon|eksen, kaynak:'eksen'|'cikis', ad, sifir, olcek, strok, aci}
  for (const tablo of ['eksen', 'cikis']) {
    for (const [isim, oge] of Object.entries(E[tablo] || {})) {
      for (const k of oge.katkilar || []) {
        if (k.tur === 'bant_yuzey') continue;   // kapalı döngü bant: düğüm hareket ettirilmez (doku kayması sayfanın işi)
        for (const n of k.dugumler || []) {
          const o = bul(n); if (!o) continue;
          const ed = (k.eksen_dunya_dugum && k.eksen_dunya_dugum[n]) || k.eksen_dunya, pv = k.pivot_dunya_m_dugum && k.pivot_dunya_m_dugum[n];
          katki.push({ o, tablo, isim, tur: k.tur, yon: k.yon_dunya && v3(k.yon_dunya), eksen: ed && v3(ed).normalize(), pivot: pv ? v3(pv) : null,
                       sifir: k.sifir || 0, olcek: k.olcek, strok: k.model_strok_mm || 0, aci: k.model_aci_max || 0, rulo: (E.rulo_cap_mm || {})[n],
                       surekli: k.surekli ? { hiz: k.surekli.hiz_deg_s, aci: 0, t: null } : null,
                       ust: k.ust_y_m, uzunluk: k.uzunluk_mm, tablo_aci: k.tablo_aci || null });
        }
      }
    }
  }
  // 11 Eki ikiz-v4b QR 4×3: kapi.ek_pivot → kapı parçaları (ek GLB, dünya köşeli) pivot_m etrafında döner; yoksa eski pivot düğümü (IKIZ_QR_Gnn_KAPI)
  const qr = Object.entries(E.qr || {}).filter(([g, v]) => v.kapi).map(([g, v]) => v.kapi.ek_pivot
    ? ({ g, o: null, parca: (v.kapi.hareketli_parca || []).map(bul).filter(Boolean), pivot: v3(v.kapi.pivot_m), eksen: v3(v.kapi.eksen_dunya).normalize(), acik: v.kapi.acik_deg })
    : ({ g, o: bul(v.kapi.dugum), eksen: v3(v.kapi.eksen_dunya).normalize(), acik: v.kapi.acik_deg }));
  // QR robot tarafı motorlu kapaklar (ek GLB, 142): qr[g].kapak 0 kapalı … 1 açık
  const rk = Object.entries(E.qr || {}).filter(([g, v]) => v.robot_kapagi && v.robot_kapagi.dugum)
    .map(([g, v]) => ({ g, o: bul(v.robot_kapagi.dugum), eksen: v3(v.robot_kapagi.eksen_dunya).normalize(), acik: v.robot_kapagi.acik_deg })).filter(x => x.o);
  // QR robot tarafı perde (142_qr_perde, 10 Eki): qr[g].kapak 0 kapalı … 1 açık → düğüm y'de ölçeklenir, üst kenar sabit
  const pe = Object.entries(E.qr || {}).filter(([g, v]) => v.perde && v.perde.dugum)
    .map(([g, v]) => ({ g, o: bul(v.perde.dugum), ust: v.perde.ust_kenar_y_m })).filter(x => x.o);
  // malzeme ezmesi (YÖNETİCİ 10 Eki: QR müşteri kapağı camı BUZLU): E.malzeme_ez = [{desen, renk, opaklik, puruzluluk, metal}] → adı desene uyan malzemeler
  const mez = (E.malzeme_ez || []).map(z => ({ ...z, re: new RegExp(z.desen), sayi: 0 }));
  if (mez.length) sahne.traverse(o => { if (!o.isMesh) return; for (const m of [].concat(o.material)) for (const z of mez) if (m && z.re.test(m.name || '')) {
    if (z.renk) m.color.setRGB(z.renk[0], z.renk[1], z.renk[2]);
    if (z.opaklik != null) { m.opacity = z.opaklik; m.transparent = z.opaklik < 1; m.depthWrite = true; }
    if (z.puruzluluk != null) m.roughness = z.puruzluluk; if (z.metal != null) m.metalness = z.metal;
    m.needsUpdate = true; z.sayi++; } });
  // 10 Eki PAKET ROBOT-TUTUCU-2 adım 1: tutucu.tur === 'morph' → Rochu 4 parmak (OEM_DAC_0…3, morph ağırlığı); değilse eski Robotiq eklemleri
  const TUT = E.robot.tutucu || {}; const MORPH = TUT.tur === 'morph';
  const rob = { ...(E.robot.kol || {}), ...(MORPH ? {} : TUT) };
  const parmak = MORPH ? (TUT.dugumler || []).map(n => { const o = bul(n); let m = null; if (o) o.traverse(x => { if (!m && x.morphTargetInfluences) m = x; }); return m; }).filter(Boolean) : [];
  const robOge = Object.entries(rob).map(([j, v]) => ({ j, o: bul(v.dugum), q0: v.q_dinlenme_rad }));
  const ray = E.robot.tum && E.robot.tum.RailJoint ? bul(E.robot.tum.RailJoint.dugum) : null;
  const KOL = E.robot.kol ? Object.keys(E.robot.kol) : [];
  const RAY0 = ((E.eksen && E.eksen.AX_ROB_RAY && E.eksen.AX_ROB_RAY.sinir) || [1176])[0];   // mm: ray başı (RailJoint dünya x) — body_07 yerel x = ray − RAY0
  const zq = new THREE.Quaternion(), Z = new THREE.Vector3(0, 0, 1), X = new THREE.Vector3(1, 0, 0);

  // 10 Eki gece Kemal R13: E kutu blank'ı — E ikiz_blank_v1 (kutu_cad_v13) zaman tablosuyla katlanır ve taşınır.
  // Saat = durum.e_kutu_t (E çevriminin GERÇEK saati, s; blank şarjörden ayrılınca 0, robota geçince null). Pivot / eksen DÜNYA (GLB dinlenme pozu);
  // M_d = T(kök(t) − kök(0)) · Rot(p_1, u_1, θ_1) · … · Rot(p_d, u_d, θ_d) (ebeveyn sırasıyla) → dünya hedefi = M_d · W0_d → yerel = ebeveyn⁻¹ · hedef.
  const BL = E.blank || null, blank = [];
  let blankKok = null, tMap = null;
  if (BL) {
    const D = Object.fromEntries((BL.dugumler || []).map(x => [x.ad, x]));
    blankKok = bul(BL.kok);
    const kur = n => { const o = ad[n]; if (!o) { eksik.add(n); return null; } o.updateWorldMatrix(true, false);
                       return { n, o, W0: o.matrixWorld.clone(), p: o.position.clone(), q: o.quaternion.clone(), s: o.scale.clone(), J: D[n] || null }; };
    const kk = kur(BL.kok); if (kk) blank.push(kk);
    for (const x of BL.dugumler || []) { const r = kur(x.ad); if (r) blank.push(r); }
    const zincir = n => { const c = []; let x = D[n]; while (x) { c.unshift(x); x = D[x.ebeveyn]; } return c; };
    for (const b of blank) { b.zincir = b.J ? zincir(b.n) : []; let k = 0, x = b.J; while (x) { k++; x = D[x.ebeveyn]; } b.derinlik = b.J ? k : 0; }
    blank.sort((a, b) => a.derinlik - b.derinlik);
    const P = [[0, 0]]; for (const x of BL.dugumler || []) for (const q of x.parcalar || []) { P.push([q.t_eski[0], q.t_gercek[0]]); P.push([q.t_eski[1], q.t_gercek[1]]); }
    if (BL.robot) P.push([BL.robot.t_eski, BL.robot.t_gercek]);
    P.sort((a, b) => a[0] - b[0]); tMap = P.filter((q, i) => i === 0 || q[0] > P[i - 1][0] + 1e-9);
  }
  const ara = (T, x) => { if (x <= T[0][0]) return T[0][1]; for (let i = 1; i < T.length; i++) if (x <= T[i][0]) { const [a0, b0] = T[i - 1], [a1, b1] = T[i]; return a1 === a0 ? b1 : b0 + (b1 - b0) * (x - a0) / (a1 - a0); } return T[T.length - 1][1]; };
  const eskiGercek = te => { const T = tMap; if (te <= T[T.length - 1][0]) return ara(T, te); const [a0, b0] = T[T.length - 2], [a1, b1] = T[T.length - 1]; return b1 + (te - a1) * (b1 - b0) / (a1 - a0); };
  const tabloAci = (tab, x) => { if (!tab || !tab.length) return null;   // tablo hareket sırasıyla (artan ya da azalan eksen)
    for (let i = 1; i < tab.length; i++) { const [x0, a0] = tab[i - 1], [x1, a1] = tab[i]; if ((x - x0) * (x - x1) <= 0) return x1 === x0 ? a1 : a0 + (a1 - a0) * (x - x0) / (x1 - x0); }
    return Math.abs(x - tab[0][0]) < Math.abs(x - tab[tab.length - 1][0]) ? tab[0][1] : tab[tab.length - 1][1]; };
  const blankAci = (J, tk) => { const P = J.parcalar || []; if (!P.length) return J.aci_dinlenme || 0; let a = P[0].aci[0];
    for (const q of P) { const [t0, t1] = q.t_gercek; if (tk < t0) break;
      if (tk >= t1) { a = q.aci[1]; continue; }
      const f = (tk - t0) / (t1 - t0), y = q.surucu_yol;
      const ta = (y && y[0] !== y[1]) ? tabloAci(q.tablo, y[0] + (y[1] - y[0]) * f) : null;
      a = ta !== null ? ta : q.aci[0] + (q.aci[1] - q.aci[0]) * f; break; }
    return a; };
  const blankKok_t = tk => { let T = null;
    for (const ts of BL.tasima || []) { const R = ts.B_ROOT_oteleme_m.map(r => [r.length > 5 ? r[5] : eskiGercek(r[4]), r[1], r[2], r[3]]);   // 6. sütun t_gercek_s (E, kutu_cad_v13.gercek) varsa o
      if (tk < R[0][0]) return T || [0, 0, 0];
      if (tk <= R[R.length - 1][0]) { for (let i = 1; i < R.length; i++) if (tk <= R[i][0]) { const f = R[i][0] === R[i - 1][0] ? 1 : (tk - R[i - 1][0]) / (R[i][0] - R[i - 1][0]); return [1, 2, 3].map(j => R[i - 1][j] + (R[i][j] - R[i - 1][j]) * f); } }
      T = R[R.length - 1].slice(1); }
    return T || [0, 0, 0]; };
  const _m = new THREE.Matrix4(), _r = new THREE.Matrix4(), _t = new THREE.Matrix4(), _ip = new THREE.Matrix4();
  function blankUygula(d) {
    if (!blank.length) return;
    const tk = d.e_kutu_t !== undefined ? d.e_kutu_t : (d.e && d.e.kutu_t !== undefined ? d.e.kutu_t : undefined);
    if (tk === undefined) return;                                   // durum alanı yoksa dokunma (eski çerçeveler)
    const gorunur = tk !== null && !(BL.robot && tk >= BL.robot.t_gercek);
    if (blankKok) blankKok.visible = gorunur;
    if (tk === null || !gorunur) { for (const b of blank) { b.o.position.copy(b.p); if (b.o === blankKok) b.o.position.x += E.assemblyOffsets_m?.E?.[0] || 0; b.o.quaternion.copy(b.q); b.o.scale.copy(b.s); } return; }
    const k = blankKok_t(tk);
    const aci = {}; for (const b of blank) if (b.J) aci[b.n] = blankAci(b.J, tk);
    for (const b of blank) {                                          // ebeveynler önce (derinlik sırası)
      _m.makeTranslation(k[0], k[1], k[2]);
      for (const z of b.zincir) { const p = z.pivot_dunya_m, u = new THREE.Vector3().fromArray(z.eksen_dunya).normalize();
        _t.makeTranslation(p[0], p[1], p[2]); _r.makeRotationAxis(u, derece(aci[z.ad] || 0)); _ip.makeTranslation(-p[0], -p[1], -p[2]);
        _m.multiply(_t).multiply(_r).multiply(_ip); }
      _m.multiply(b.W0); _m.elements[12] += E.assemblyOffsets_m?.E?.[0] || 0;                                              // dünya hedefi
      b.o.parent.updateWorldMatrix(true, false);
      _t.copy(b.o.parent.matrixWorld).invert().multiply(_m);          // yerel = ebeveyn⁻¹ · hedef
      _t.decompose(b.o.position, b.o.quaternion, b.o.scale); b.o.updateMatrixWorld(true);
    }
  }

  function uygula(d) {
    const ek = d.eksenler || {}, ck = d.cikislar || {};
    // 1) makine: dinlenmeye dön, katkıları topla
    const top = new Map();
    for (const k of katki) {
      let s = null;
      if (k.tablo === 'eksen') { const x = ek[k.isim]; if (x === undefined || x === null) continue; s = x - k.sifir; }
      else { const x = ck[k.isim]; if ((x === undefined || x === null) && !k.surekli) continue; s = x ? 1 : 0; }
      const t = top.get(k.o) || { dp: new THREE.Vector3(), q: new THREE.Quaternion() };
      if (k.tur === 'olcek_y_ust') {                       // 10 Eki gece Kemal R13: karton yığını — üst kenar sabit, boy (uzunluk − s) / uzunluk (asansör kalktıkça azalır)
        t.sy = Math.min(1, Math.max(0.001, (k.uzunluk - s) / k.uzunluk)); t.ust = k.ust; top.set(k.o, t); continue;
      }
      if (k.tur === 'oteleme') {
        const m = k.tablo === 'eksen' ? s * k.olcek : s * k.strok * 0.001;
        t.dp.addScaledVector(k.yon, m);
      } else {
        let a;
        if (k.tablo === 'cikis' && k.surekli) {             // 10 Eki ELESTIRMEN-EK5: DO 1 iken sim zamanıyla birikerek sürekli döner (açı tutulur)
          const t = (d.t !== undefined ? d.t : (d.zaman !== undefined ? d.zaman : performance.now() / 1000));
          if (k.surekli.t !== null && s) k.surekli.aci = (k.surekli.aci + k.surekli.hiz * Math.max(0, t - k.surekli.t)) % 360;
          k.surekli.t = t; a = k.surekli.aci;
        }
        else if (k.tablo_aci) {                            // menteşe tablosu [[eksen değeri, açı °], …] (E blank katlama, kutu_cad_v13) — ham eksen değeriyle doğrusal ara değer
          const T = k.tablo_aci, x = s + k.sifir; a = T[0][1];
          for (let i = 1; i < T.length; i++) { if (x <= T[i][0]) { const [x0, a0] = T[i - 1], [x1, a1] = T[i]; a = x1 === x0 ? a1 : a0 + (a1 - a0) * (x - x0) / (x1 - x0); break; } a = T[i][1]; }
        }
        else if (k.tablo === 'cikis') a = s * k.aci;
        else if (k.olcek === null || k.olcek === undefined) a = k.rulo ? s * 360 / (Math.PI * k.rulo) : 0;   // bant mm → rulo °
        else a = s * k.olcek;
        zq.setFromAxisAngle(k.eksen, derece(a)); t.q.premultiply(zq);
        if (k.pivot) {                                     // pivot düğüm orijininde değil: konum += (R − I)(p0 − c)   (makine düğümleri dünya çerçevesinde)
          const p0 = dinlenme.get(k.o).p, d0 = p0.clone().sub(k.pivot); t.dp.add(d0.clone().applyQuaternion(zq).sub(d0));
        }
      }
      top.set(k.o, t);
    }
    for (const [o, r] of dinlenme) {
      if (robOge.some(x => x.o === o) || o === ray || qr.some(x => x.o === o || (x.parca && x.parca.includes(o))) || rk.some(x => x.o === o) || pe.some(x => x.o === o)) continue;
      const t = top.get(o);
      o.position.copy(r.p); o.quaternion.copy(r.q);
      if (t) { o.position.add(t.dp); o.quaternion.premultiply(t.q); }
      if (t && t.sy !== undefined) { o.scale.set(1, t.sy, 1); o.position.y = t.ust + t.sy * (r.p.y - t.ust); }
    }
    blankUygula(d);
    // 2) QR müşteri kapıları (kapi 1 kapalı · 0 açık; kapak 0..1 robot tarafı — modelde yok)
    for (const g of qr) {
      const s = d.qr && d.qr[g.g.replace(/^G0?/, '')];   // çerçeve anahtarı "1".."12"
      const acik = s ? (s.kapi === 0 ? 1 : 0) : 0;
      zq.setFromAxisAngle(g.eksen, derece(acik * g.acik));
      if (g.parca) { for (const o of g.parca) { const r = dinlenme.get(o); o.quaternion.copy(r.q).premultiply(zq); o.position.copy(r.p).sub(g.pivot).applyQuaternion(zq).add(g.pivot); } continue; }
      const r = dinlenme.get(g.o);
      g.o.quaternion.copy(r.q).premultiply(zq);
    }
    for (const k of rk) {
      const s = d.qr && d.qr[String(parseInt(k.g.slice(1), 10))];
      const r = dinlenme.get(k.o); const f = s && typeof s.kapak === 'number' ? Math.min(1, Math.max(0, s.kapak)) : 0;
      k.o.quaternion.copy(r.q).premultiply(zq.setFromAxisAngle(k.eksen, derece(f * k.acik)));
    }
    for (const k of pe) {
      const s = d.qr && d.qr[String(parseInt(k.g.slice(1), 10))];
      const f = s && typeof s.kapak === 'number' ? Math.min(1, Math.max(0, s.kapak)) : 0;
      const r = dinlenme.get(k.o), sy = Math.max(0.001, 1 - f);
      k.o.position.copy(r.p); k.o.position.y = k.ust + sy * (r.p.y - k.ust); k.o.scale.set(1, sy, 1);
    }
    // 3) robot: ray + eklemler (robot.eklem null ise dinlenme pozu)
    // 10 Eki (Robot rig_fk test vektörüyle doğrulandı): ray_konum = arabanın DÜNYA x'i, mm (sınır [1176, 4860] = ray başı / sonu; dinlenme 1715 = PARK).
    // body_07 yerel x = (ray − 1176) mm (RailJoint dünya x 1,176). Ölçüm: eklem [4,6501 −1,7342 1,5528 0,1814 1,5085 3,1417] + ray 3789 → flanş (3,934 · 0,899 · 1,549) = Robot FK.
    // (v1: x = ray → robot 1,176 m sağda · v2 ilk: dinlenme + (ray − 1176) → 0,539 m sağda.)
    if (ray && d.robot && d.robot.ray_konum !== undefined && d.robot.ray_konum !== null)
      ray.position.x = (d.robot.ray_konum - RAY0) * 0.001;
    const q = d.robot && d.robot.eklem;
    if (q && q.length >= 6) KOL.forEach((j, i) => { const r = robOge.find(x => x.j === j); r.o.quaternion.setFromAxisAngle(Z, q[i]); });
    if (MORPH && d.robot) {                               // ağırlık[0] = 1 (taban) · ağırlık[hedef[urun]] = kapanma (0 açık … 1 kapalı)
      const k = Math.min(1, Math.max(0, +d.robot.kapanma || 0)), h = TUT.hedef[(TUT.urun_hedef || {})[String(d.robot.urun || '').toUpperCase()]];
      for (const m of parmak) { const w = m.morphTargetInfluences; for (let i = 0; i < w.length; i++) w[i] = i === (TUT.taban_hedef || 0) ? 1 : 0; if (h) w[h] = k; }
    }
    if (!MORPH && d.robot && (d.robot.gripper !== undefined || d.robot.jaw_derece !== undefined)) {
      // 10 Eki PAKET ROBOT-TUTUCU-1 (ara çözüm, Rochu 4 parmak gelene kadar): parmak = dinlenme quat'ı × Rz(s·(j − q0)), j = çene açısı (rad).
      // Eski formül mutlak Rz(q0 + s·a) yazıyordu → dinlenme dönüşü (B⁻¹: 180° / 90°) atılıyor, q0 iki kez sayılıyordu; parmaklar 52–245 mm kopuyordu.
      // j: robot simi jaw_derece yayınlıyorsa o, yoksa gripper × 45,8° (robot_simi.py: gripper = jaw / 45,8). İşaretler rig.js matrices() ile aynı.
      const j = (d.robot.jaw_derece !== undefined ? d.robot.jaw_derece : 45.8 * d.robot.gripper) * Math.PI / 180, Q0 = 0.293215;
      const isaret = { finger_joint: 1, right_outer_knuckle_joint: 1, left_inner_knuckle_joint: 1, right_inner_knuckle_joint: -1, left_inner_finger_joint: -1, right_inner_finger_joint: -1 };
      for (const r of robOge) if (isaret[r.j] !== undefined) r.o.quaternion.copy(dinlenme.get(r.o).q).premultiply(zq.setFromAxisAngle(Z, isaret[r.j] * (j - Q0)));
    }
  }
  return { uygula, eksik: [...eksik], dugum: ad, dinlenme, malzeme_ez: mez.map(z => ({ desen: z.desen, sayi: z.sayi })) };
}

// ürün konumu: ikiz/durum.urunler[] öğesi → dünya konumu (THREE.Vector3) ya da null (yer bilinmiyor)
// u: {yer: 'TABLA'|'A'|'F'|'K'|'E'|'ROBOT'|'G01'..'G12'|…, ilerleme?, goz?} · sahne: ikiz GLB sahnesi (bağlı düğümler için)
// 11 Eki Kemal O2: ROBOT → TABLA geçişinde ürün robotun bıraktığı x / z'de kalsın — ürün kimliğine göre son dünya konumu ve tabla yerel ofseti tutulur
const _sonKonum = new Map(), _tablaOfs = new Map();
export function urunKonum(E, u, sahne, THREE, d) {
  const p_ = _urunKonum(E, u, sahne, THREE, d);
  if (p_ && u.id !== undefined) _sonKonum.set(u.id, { yer: String(u.yer || '').toUpperCase(), p: p_.clone() });
  return p_;
}
function _urunKonum(E, u, sahne, THREE, d) {
  const Y = (E.urun || {}).yer || {}; const v = a => new THREE.Vector3(a[0], a[1], a[2]);
  const bagli = (dg, ofs) => { const o = sahne.getObjectByName(dg); if (!o) return null; o.updateWorldMatrix(true, false);
                               return v(ofs || [0, 0, 0]).applyMatrix4(o.matrixWorld); };
  const yer = String(u.yer || '').toUpperCase();
  // 10 Eki gece Kemal R7 / R10: bant üstündeki ürün bant ekseninde kayar — Y[yer].bant = {eksen, yon_yerel | yon_dunya, olcek};
  // kayma = u.ilerleme_mm (program) ya da (durum.eksenler[eksen] − u.bant0) × olcek (bant0 = ürün banda geldiğindeki eksen değeri)
  const kay = () => { const B = Y[yer] && Y[yer].bant; if (!B) return 0;
    if (u.ilerleme_mm !== undefined) return u.ilerleme_mm * 0.001;
    const x = d && d.eksenler && d.eksenler[B.eksen]; return (x !== undefined && u.bant0 !== undefined) ? (x - u.bant0) * (B.olcek || 0.001) : 0; };
  if (yer === 'TABLA') { const B = Y.TABLA.bant, k = kay(), o = (Y.TABLA.ofset_m || [0, 0, 0]).slice();
    if (B && B.yon_yerel && k) for (let i = 0; i < 3; i++) o[i] += B.yon_yerel[i] * k;
    // 11 Eki Kemal O2: robotun BIRAKMA noktası tabla yerel çerçevesinde (G/Ç: urunler[].ofset_yerel_mm = [x, z] ya da [x, y, z], mm) → ürün oraya bırakılır (merkeze değil)
    if (false && !Array.isArray(u.ofset_yerel_mm) && u.id !== undefined) {   // KAPALI (Robot 11 Eki: bırakma yatayda tabla merkezi; eldeki konum farkı robot_paketi_v2 ↔ v8 dönüşümünden)          // ofset programdan gelmiyorsa: ilk TABLA karesinde eldeki son konumdan hesapla (tabla açısı bırakmada 0°)
      if (!_tablaOfs.has(u.id)) { const s_ = _sonKonum.get(u.id), T = sahne.getObjectByName(Y.TABLA.bagli_dugum);
        if (s_ && s_.yer === 'ROBOT' && T) { T.updateWorldMatrix(true, false); const l = s_.p.clone().applyMatrix4(T.matrixWorld.clone().invert()); _tablaOfs.set(u.id, [l.x - o[0], l.z - o[2]]); }
        else _tablaOfs.set(u.id, null); }
      const t_ = _tablaOfs.get(u.id); if (t_) { o[0] += t_[0]; o[2] += t_[1]; }
    }
    if (Array.isArray(u.ofset_yerel_mm)) { const q = u.ofset_yerel_mm; o[0] += q[0] * 0.001; if (q.length === 3) { o[1] += q[1] * 0.001; o[2] += q[2] * 0.001; } else o[2] += q[1] * 0.001; }
    return bagli(Y.TABLA.bagli_dugum, o); }
  if (yer === 'ROBOT') {                                   // elde ürün: UR10E_body_06 × T_alet_urun_tur[tür] (yoksa sabit ofset)
    const T = (Y.ROBOT.T_alet_urun_tur || {})[String(u.tur || '').toUpperCase()];
    return bagli(Y.ROBOT.bagli_dugum, T ? [T[0][3], T[1][3], T[2][3]] : Y.ROBOT.ofset_m);
  }
  if ((yer === 'F' || yer === 'F_YBANT') && Y[yer] && Y[yer].dogru_m && Y[yer].dogru_m[0]) {   // F_YBANT: 10 Eki TABLA-EK2 (ilerleme_mm ya da ilerleme)
    const a = v(Y[yer].dogru_m[0]), b = v(Y[yer].dogru_m[1]);
    const t = (u.ilerleme_mm !== undefined && Y[yer].uzunluk_mm) ? u.ilerleme_mm / Y[yer].uzunluk_mm : (u.ilerleme || 0);
    return a.lerp(b, Math.min(1, Math.max(0, t)));
  }
  const g = u.goz ? 'G' + String(u.goz).padStart(2, '0') : (/^G\d+$/.test(yer) ? 'G' + yer.slice(1).padStart(2, '0') : null);
  // 10 Eki ROBOT-TUTUCU-3: tür başına taban noktası (KUTU | ICECEK | TATLI); tür yoksa / tabloda yoksa eski tek nokta
  const gt = g && Y.GOZ && Y.GOZ.konum_tur_m && Y.GOZ.konum_tur_m[g] && Y.GOZ.konum_tur_m[g][String(u.tur || '').toUpperCase()];
  if (gt) return v(gt);
  if (g && Y.GOZ && Y.GOZ.konum_m[g]) return v(Y.GOZ.konum_m[g]);
  if (Y[yer] && Y[yer].konum_m) {                       // bant varsa ve kayma biliniyorsa: başlangıç (giriş fotoseli) + yön × kayma; yoksa sabit konum
    const B = Y[yer].bant, k = kay();
    if (B && B.yon_dunya && (u.ilerleme_mm !== undefined || u.bant0 !== undefined)) {
      const p = v(B.baslangic_m || Y[yer].konum_m).addScaledVector(v(B.yon_dunya), k);
      const zp = B.z_profil;                              // 11 Eki YÖNETİCİ / K O5: giriş kılavuzu ürünü z'de yumuşak kaydırır — [x_m, z_m] parçalı doğrusal, uçlarda sabit
      if (zp && zp.length) {
        if (p.x <= zp[0][0]) p.z = zp[0][1];
        else if (p.x >= zp[zp.length - 1][0]) p.z = zp[zp.length - 1][1];
        else for (let i = 1; i < zp.length; i++) if (p.x <= zp[i][0]) { const t = (p.x - zp[i - 1][0]) / (zp[i][0] - zp[i - 1][0]); p.z = zp[i - 1][1] + t * (zp[i][1] - zp[i - 1][1]); break; }
      }
      return p; }
    return v(Y[yer].konum_m); }
  return null;
}

// ek GLB (web paketine girmeyen ham son adımlar): web sahnesindeki eski sürümleri gizler, eki aynı sahneye ekler. ikizKur'dan ÖNCE çağır.
export async function ikizEkYukle(sahne, E, THREE, GLTFLoader, MeshoptDecoder, temel = './') {
  if (!E.ek_glb) return null;
  const gz = new Set(E.ek_glb.gizle_web || []);
  sahne.traverse(o => { if (gz.has(o.name)) o.visible = false; });
  for (const n of gz) { const o = sahne.getObjectByName(n); if (o) o.name = n + '__web_gizli'; }
  const g = await glbGzYukle(temel + E.ek_glb.dosya, THREE, GLTFLoader, MeshoptDecoder);
  g.scene.name = 'IKIZ_EK'; sahne.add(g.scene);
  // 10 Eki PAKET GOVDE-4: extras.ebeveyn taşıyan düğüm (ör. ROBOT25_IGUS_CARRO → UR10E_body_07, ray zinciri) web'deki ebeveyninin altına, GLB'deki yerel TRS'iyle
  const tak = []; g.scene.traverse(o => { if (o.userData && o.userData.ebeveyn) tak.push(o); });
  for (const o of tak) { const p = sahne.getObjectByName(o.userData.ebeveyn); if (p) p.add(o); }
  // 11 Eki: gizlenen web düğümünün GİZLENMEYEN çocukları (ör. TOPPING_DONER__TABLA__BANT) ek'teki aynı adlı düğüme taşınır (ek düğümü web'in TRS'ini taşır)
  for (const n of gz) {
    const w = sahne.getObjectByName(n + '__web_gizli'), e = g.scene.getObjectByName(n);
    if (w && e) for (const c of [...w.children]) if (!gz.has(c.name.replace(/__web_gizli$/, ''))) e.add(c);
  }
  return g;
}

// Rochu 4 parmak tutucu GLB (10 Eki PAKET ROBOT-TUTUCU-2): kök 'Tool' extras.ebeveyn (UR10E_body_06) altına birim dönüşümle. ikizKur'dan ÖNCE çağır.
export async function ikizTutucuYukle(sahne, E, THREE, GLTFLoader, MeshoptDecoder, temel = './') {
  if (!E.tutucu_glb) return null;
  const g = await glbGzYukle(temel + E.tutucu_glb.dosya, THREE, GLTFLoader, MeshoptDecoder);
  const tool = g.scene.getObjectByName(E.tutucu_glb.kok || 'Tool'); const p = sahne.getObjectByName(E.tutucu_glb.ebeveyn);
  if (tool) tool.traverse(o => { if (o.userData && o.userData.urun_sablon) { o.visible = false; o.userData.urun = true; } });   // ürün şablonları gizli (elde ürünü sürücü çizer; tarama açar)
  if (tool && p) p.add(tool); return g;
}

export async function glbGzYukle(url, THREE, GLTFLoader, MeshoptDecoder) {
  const r = await fetch(url); if (!r.ok) throw new Error(url + ' ' + r.status);
  const ds = r.body.pipeThrough(new DecompressionStream('gzip'));
  const ab = await new Response(ds).arrayBuffer();
  const L = new GLTFLoader(); L.setMeshoptDecoder(MeshoptDecoder);
  return new Promise((ok, hata) => L.parse(ab, '', ok, hata));
}
