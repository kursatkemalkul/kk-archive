// DÜKKÂN 24 Eki gece (Kemal istek listesi madde 9 · yeni_makine/KEMAL_ISTEK_24EKI_GECE.md):
//  9a  kablo yok — yalnız kablonun geçeceği kanal / geçiş kalır: elektrik kabloları (bina, robot panosu çıkışı, QR dikmesi, yıkama şebeke /
//      eş potansiyel, hücre kapısı kilit beslemesi, robot ana hattı) sahneden SİLİNİR; su tesisatı (hortum, sifon, vana) gerçek parça, kalır.
//  9b  çatıdaki kedi: arkası z 2,40'ta düz kesilir, kesik yüze facade turuncusu bir duvar konur.
//  9c  dükkânın iç makine odası duvarları BEYAZ · 9d personelin olduğu oda TURUNCU (her duvar yüzü önündeki odaya göre boyanır).
import { PLAN } from './dukkan_plan.js';

const KABLO = /kablo|KABLO|cable|CABLE|ES_POTANSIYEL|KILIT_BESLE/;
// 26 Eki gece: QR gözleri arasındaki KAPALI KABLO DİKMESİ bir bölme sacıdır (gözü yandan kapatır), kablo değil → silinmez (Kemal: "QR'da ara bölmeler yok")
const KABLO_DEGIL = /DIKMESI|kanal|KANAL|oluk|OLUK|olug|OLUG|duct|DUCT|gecis|GECIS|soket|SOKET|destek|DESTEK|EPDM|BOYUN|girisi|GIRISI|yaka|YAKA|rakor|RAKOR/;
const KEDI_KES_Z = 2.40;

export function dukkan24(T, IKIZ, scene) {
  const durum = IKIZ.dukkan24 = { kablo: 0, boyanan: 0, kedi: false };
  // ---- 9c / 9d: duvar boyası (oda kutuları dukkan_plan.js PLAN'ından)
  const MAKINE = [PLAN.solIc, PLAN.sagIc, 0, PLAN.yukseklik, PLAN.arkaIc, PLAN.hucreDuvar];
  const PERSONEL = [PLAN.solIc, PLAN.ayirici[0], 0, PLAN.yukseklik, PLAN.hucreDuvar, PLAN.cepheIc];
  const MUSTERI_NIS = [PLAN.ayirici[0] - .035, PLAN.sagIc + .45, -.035, PLAN.yukseklik + .035, PLAN.hucreDuvar, PLAN.cepheIc + .5];   // 25 Eki: QR'nin müşteri tarafındaki niş yüzleri hiçbir odaya girmiyordu → beyaz/gri kalıyordu → cephe turuncusu
  const icinde = (p, k) => p.x > k[0] && p.x < k[1] && p.y > k[2] && p.y < k[3] && p.z > k[4] && p.z < k[5];
  const beyaz = new T.MeshStandardMaterial({ color: 0xf4f4f1, roughness: .95, metalness: 0 }); beyaz.name = 'DUKKAN24_MAKINE_ODASI_BEYAZ';
  const turuncu = new T.MeshStandardMaterial({ color: 0xe8772e, roughness: .9, metalness: 0 }); turuncu.name = 'DUKKAN24_PERSONEL_ODASI_TURUNCU';
  for (const m of [beyaz, turuncu]) { m.userData.storefront60Finish = true; m.userData.preserveReviewMaterial = true; }
  const a = new T.Vector3(), b = new T.Vector3(), c = new T.Vector3(), n = new T.Vector3(), p = new T.Vector3();
  function boya(o) {
    // Split the existing surface at room boundaries before assigning finishes.
    // A long wall triangle can otherwise straddle the white/orange boundary.
    const source = o.geometry.index ? o.geometry.toNonIndexed() : o.geometry.clone();
    const attrs = Object.entries(source.attributes), output = Object.fromEntries(attrs.map(([key]) => [key, []]));
    const materials = [];
    const world = new T.Vector3();
    for (let start = 0; start < source.attributes.position.count; start += 3) {
      const material = source.groups.find(gr => start >= gr.start && start < gr.start + gr.count)?.materialIndex ?? 0;
      let polygons = [[0, 1, 2].map(j => {
        const values = Object.fromEntries(attrs.map(([key, attr]) => [key, Array.from({length: attr.itemSize}, (_, k) => attr.array[(start + j) * attr.itemSize + k])]));
        world.fromArray(values.position).applyMatrix4(o.matrixWorld);
        return {values, point: world.clone()};
      })];
      for (const [axis, boundary] of [['x',1.980],['x',2.000],['x',PLAN.ayirici[0]],['x',3.273],['z',1.500],['z',1.800],['z',2.105],['z',2.328],['z',2.348]]) {
        const next = [];
        for (const polygon of polygons) {
          if (!polygon.some(v => v.point[axis] < boundary - 1e-7) || !polygon.some(v => v.point[axis] > boundary + 1e-7)) { next.push(polygon); continue; }
          for (const side of [-1, 1]) {
            const clipped = [];
            for (let j = 0; j < polygon.length; j++) {
              const u = polygon[j], v = polygon[(j + 1) % polygon.length];
              const du = side * (u.point[axis] - boundary), dv = side * (v.point[axis] - boundary);
              if (du >= 0) clipped.push(u);
              if ((du < 0 && dv > 0) || (du > 0 && dv < 0)) {
                const t = du / (du - dv);
                clipped.push({point: u.point.clone().lerp(v.point, t), values: Object.fromEntries(attrs.map(([key]) => [key, u.values[key].map((a, k) => a + (v.values[key][k] - a) * t)]))});
              }
            }
            if (clipped.length >= 3) next.push(clipped);
          }
        }
        polygons = next;
      }
      for (const polygon of polygons) for (let j = 1; j + 1 < polygon.length; j++) {
        const triangle = [polygon[0], polygon[j], polygon[j + 1]];
        if (new T.Vector3().subVectors(triangle[1].point, triangle[0].point).cross(new T.Vector3().subVectors(triangle[2].point, triangle[0].point)).lengthSq() < 1e-20) continue;
        for (const vertex of triangle) for (const [key] of attrs) output[key].push(...vertex.values[key]);
        materials.push(material);
      }
    }
    source.dispose();
    const g0 = new T.BufferGeometry();
    for (const [key, attr] of attrs) g0.setAttribute(key, new T.Float32BufferAttribute(output[key], attr.itemSize));
    for (let j = 0; j < materials.length; j++) g0.addGroup(j * 3, 3, materials[j]);
    const P = g0.attributes.position; if (!P) return;
    const g = g0.index ? g0 : g0.clone().setIndex([...Array(P.count).keys()]);
    const I = g.index.array, eski = Array.isArray(o.material) ? o.material : [o.material];
    const grupMat = new Int32Array(I.length / 3).fill(0);
    if (g.groups.length) for (const gr of g.groups) for (let t = gr.start / 3; t < (gr.start + gr.count) / 3; t++) grupMat[t] = gr.materialIndex ?? 0;
    // duvarın KENDİ malzemeleri kullanılır (katmanlar.js kaydı malzeme dizisinin kopyasını tutar; yeni indis çizilmez): 0 = beyaz, 1 = cephe turuncusu
    const W = o.matrixWorld, iBeyaz = 0, iTuruncu = Math.min(1, eski.length - 1), yeni = new Int32Array(I.length / 3); let sayi = 0;
    for (let t = 0; t < I.length / 3; t++) {
      a.fromBufferAttribute(P, I[3 * t]).applyMatrix4(W); b.fromBufferAttribute(P, I[3 * t + 1]).applyMatrix4(W); c.fromBufferAttribute(P, I[3 * t + 2]).applyMatrix4(W);
      n.subVectors(c, b).cross(p.subVectors(a, b)).normalize(); p.copy(a).add(b).add(c).divideScalar(3).addScaledVector(n, .03);
      // 27 Eki (Kemal: "makinenin olduğu odadaki duvarlar hâlâ turuncu"): robot hücresine (−z) bakan yüzler QR'nin üstündeki duvar dahil (z < 2,15) makine odasıdır
      // 27 Eki akşam (A14): robot hücresi QR'nin yanında (x ≥ ayırıcı) QR robot yüzüne kadar (z 1,80) — QR'nin sağı / solu, duvarların üstü dahil
      const hucre = p.x > PLAN.solIc && p.x < PLAN.sagIc && p.z > PLAN.arkaIc && p.y > 0 && p.y < PLAN.yukseklik && (p.x < PLAN.ayirici[0] ? p.z < PLAN.hucreDuvar + .001 : p.z < (p.x < PLAN.qrSol + .01 ? 2.105 : 2.105));
      const musteriYuzu = (a.x + b.x + c.x) / 3 >= PLAN.ayirici[0] - 1e-6 && (a.z + b.z + c.z) / 3 >= 2.105 - 1e-6;
      const centreZ=(a.z+b.z+c.z)/3,centreY=(a.y+b.y+c.y)/3;
      const wetCell=p.x>1.980&&p.x<3.273&&p.z>1.500&&p.z<2.328;
      const cellTop=n.y>.5&&centreY>=PLAN.yukseklik-.001&&centreZ<2.348;
      yeni[t] = cellTop||wetCell ? iBeyaz : musteriYuzu ? iTuruncu : (icinde(p, MAKINE) || hucre || (n.z < -.5 && p.z < 2.15 && p.x > PLAN.solIc && p.x < PLAN.sagIc)) ? iBeyaz : (icinde(p, PERSONEL) || icinde(p, MUSTERI_NIS)) ? iTuruncu : grupMat[t]; if (yeni[t] !== grupMat[t]) sayi++;
    }
    const sira = [...Array(yeni.length).keys()].sort((x, y) => yeni[x] - yeni[y]), J = new Uint32Array(I.length);
    sira.forEach((t, k) => { J[3 * k] = I[3 * t]; J[3 * k + 1] = I[3 * t + 1]; J[3 * k + 2] = I[3 * t + 2]; });
    const ng = g.clone(); ng.setIndex(new T.BufferAttribute(J, 1)); ng.clearGroups();
    let bas = 0; for (let k = 1; k <= sira.length; k++) if (k === sira.length || yeni[sira[k]] !== yeni[sira[bas]]) { ng.addGroup(bas * 3, (k - bas) * 3, yeni[sira[bas]]); bas = k; }
    o.geometry = ng; durum.boyanan += sayi;
  }
  scene.updateMatrixWorld(true);
  const dukkan = scene.getObjectByName('IKIZ_DUKKAN'), duvarlar = [];
  if (dukkan) dukkan.traverse(o => { if (o.isMesh && o.name === 'DUKKAN__TEK_PARCA_DUVAR' && Array.isArray(o.material) && o.material.length >= 2) duvarlar.push(o); });
  const KAPLAMA = [];
  for (const o of duvarlar) boya(o);
  if (KAPLAMA.length) { const g = new T.BufferGeometry(); g.setAttribute('position', new T.Float32BufferAttribute(KAPLAMA, 3)); g.computeVertexNormals();
    const k = new T.Mesh(g, beyaz); k.name = 'DUKKAN__MAKINE_ODASI_BEYAZ_KAPLAMA'; k.userData = { assemblyOwner: 'SHOP', wallVisibility: true }; (dukkan || scene).add(k); durum.kaplama = KAPLAMA.length / 9; }
  // 25 Eki: QR üst ekranında hazır-ekran paneli ile CSS3D ekran maskesi aynı düzlemdeydi (z 2,095) → titreşen çift ekran; panel 2 mm geri
  { const rp = scene.getObjectByName('DT_QR_EKRAN_READY_PANEL'); if (rp && !rp.userData.geri25) { rp.position.z -= .002; rp.userData.geri25 = true; rp.updateMatrixWorld(true); durum.ekranPanelGeri = true; } }
  durum.duvar = duvarlar.map(o => o.name);

  // ---- 9a: elektrik kabloları
  const sil = [];
  scene.traverse(o => {
    if (!(o.isMesh || o.isLine || o.isLineSegments)) return;
    const ad = (o.userData && o.userData.assemblySourceName || '') + ' ' + (o.name || '');
    if (!KABLO.test(ad) || KABLO_DEGIL.test(ad)) return;
    for (let q = o; q; q = q.parent) if (q.name === 'YENI_MAKINE_KOK' || /^(UR10E|Tool$)/.test(q.name || '')) return;   // makine ve robot kolunun kendi donanımı değil
    sil.push(o);
  });
  for (const o of sil) { o.parent && o.parent.remove(o); o.geometry && o.geometry.dispose(); }
  durum.kablo = sil.length; durum.kabloAd = [...new Set(sil.map(o => (o.name || '').replace(/\d+/g, '#')))].slice(0, 40);

  // ---- 4: şalter kablo yolu 1 Kas'ta zemin70.js'teki tek kanal ağına taşındı (ELK_KANAL_AGI)

  // ---- 9b: kedi (yüklenince — ikiz.js çizim döngüsünde yükler)
  const kedi = () => {
    const k = scene.getObjectByName('DUKKAN__SLEEPING_CAT67'); if (!k || k.userData.kesildi24) return !!k;
    k.userData.kesildi24 = true; k.updateMatrixWorld(true);
    const duzlem = new T.Plane(new T.Vector3(0, 0, 1), -KEDI_KES_Z);   // z ≥ 2,40 kalır
    const kutu = new T.Box3();
    k.traverse(o => { if (!o.isMesh) return; for (const m of [].concat(o.material)) { m.clippingPlanes = [duzlem]; m.clipShadows = true; m.needsUpdate = true; } });
    kutu.setFromObject(k);
    const sac = scene.getObjectByName('DUKKAN__CEPHE67_SABIT_CITALAR'), turuncuCephe = sac && (Array.isArray(sac.material) ? sac.material[0] : sac.material);
    // kesik yüzü kapatan duvar: kedinin z = 2,40 kesitinin dış zarfı (dışbükey), 10 mm — önden kedinin arkasında kalır
    const nk = [], v1 = new T.Vector3(), v2 = new T.Vector3(), v3 = new T.Vector3();
    k.traverse(o => { if (!o.isMesh) return; const Pp = o.geometry.attributes.position, Ii = o.geometry.index, W0 = o.matrixWorld, say = Ii ? Ii.count : Pp.count;
      for (let i = 0; i < say; i += 3) { const id = [0, 1, 2].map(j => Ii ? Ii.getX(i + j) : i + j);
        v1.fromBufferAttribute(Pp, id[0]).applyMatrix4(W0); v2.fromBufferAttribute(Pp, id[1]).applyMatrix4(W0); v3.fromBufferAttribute(Pp, id[2]).applyMatrix4(W0);
        for (const [u, w] of [[v1, v2], [v2, v3], [v3, v1]]) if ((u.z - KEDI_KES_Z) * (w.z - KEDI_KES_Z) < 0) { const t = (KEDI_KES_Z - u.z) / (w.z - u.z); nk.push([u.x + (w.x - u.x) * t, u.y + (w.y - u.y) * t]); } } });
    nk.push([kutu.min.x, PLAN.yukseklik], [kutu.max.x, PLAN.yukseklik]);   // çatıya oturan taban
    const zarf = (() => { const P = nk.filter(q => q[1] >= PLAN.yukseklik - .001).sort((a, b) => a[0] - b[0] || a[1] - b[1]), x = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]), L = [], U = [];
      for (const q of P) { while (L.length > 1 && x(L[L.length - 2], L[L.length - 1], q) <= 0) L.pop(); L.push(q); }
      for (const q of P.slice().reverse()) { while (U.length > 1 && x(U[U.length - 2], U[U.length - 1], q) <= 0) U.pop(); U.push(q); }
      return L.slice(0, -1).concat(U.slice(0, -1)); })();
    const duvarSol = PLAN.solIc - PLAN.kalinlik, duvarSag = PLAN.sagIc + PLAN.kalinlik;
    const sekil = new T.Shape([[duvarSol,PLAN.yukseklik],[duvarSag,PLAN.yukseklik],[duvarSag,kutu.max.y],[duvarSol,kutu.max.y]].map(q => new T.Vector2(...q))); // İnce düz arkalık, yalnız çatı üzerinde; zemine uzanmaz.
    const gW = new T.ExtrudeGeometry(sekil, { depth: .01, bevelEnabled: false }); gW.translate(0, 0, KEDI_KES_Z - .01);
    const W = new T.Mesh(gW, IKIZ.dukkanTemiz29?.orange || (turuncuCephe ? turuncuCephe.clone() : turuncu.clone()));
    W.material.clippingPlanes = []; W.material.userData = { ...W.material.userData, storefront60Finish: true }; W.name = 'DUKKAN__KEDI_ARKA_DUVAR'; W.userData.wallVisibility = true;
    durum.kediKesitNokta = nk.length;
    scene.add(W); durum.kedi = { kes_z: KEDI_KES_Z, zarf_nokta: zarf.length, kutu: [duvarSol, duvarSag, PLAN.yukseklik, kutu.max.y].map(v => +v.toFixed(3)) };
    return true;
  };
  if (!kedi()) { let bitti = false; const z = setInterval(() => { if (!bitti && kedi()) { bitti = true; clearInterval(z); } }, 1000); }
  if (IKIZ.sahne && IKIZ.sahne.renderer) IKIZ.sahne.renderer.localClippingEnabled = true;
  IKIZ.dukkanTemiz29?.refresh();
  return durum;
}
