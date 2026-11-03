/* TOPPING düzeltme (11 Eki akşam, YÖNETİCİ 20:00): tabla üstünde malzeme GERÇEK görünüşüyle ve programın gerçek doz hareketiyle.
   (a) Hamur: disk biçimli şablon ağları (12 kenarlı) → 64 segmentli silindir, ölçü şablonun kendi kutusundan (pide R 140 = hesap v3 sabit.pide_r; açıcı yuvarlak açar).
   (b) Malzeme: ağız (hesap v3 ağız x / z, program X = dünya − 1436) tabla çerçevesinde nerede ise (tabla düğümünün o anki dünya matrisi) oraya, ağız iç Ø izinde
       gram akışıyla orantılı KÜÇÜK PARÇA bırakılır — UNO: piston açıkken gram / doz süresi (G/Ç 92302728 SPIRAL_PLAN T); kaşar / sucuk: helezon devri (eksen_hiz) × g/tur [K v2].
       Harç / patates: yarıklı boru (yayıcı) taradığı açı kadar ince TABAKA (r ≤ 125).
   (c) Birikme programın X + tabla açısından geldiği için dıştan içe kendiliğinden görünür (kenar halkası → spiral → iç halka). Uydurma zaman çizelgesi YOK. */
export function toppingParcaKur({ THREE, IKIZ, kok }) {
  const OFS = 1436.0, TZ = -170.0;
  const AGIZ = { KIYMA: [160.25, 0.0, 33.0], KUSBASI: [412.25, 0.0, 33.0], KIYMA_ORTA: [475.5, 0.2, 27.0], KASAR: [652.85, 20.0, 45.0], SUCUK: [879.0, 12.0, 42.0] };   // x, dz, iç Ø (hesap v3 [Ö])
  const UNO_GS = { KIYMA_ORTA: 160 / 19.261, KIYMA: 160 / 17.132, KUSBASI: 145 / 17.132 };     // g/s (G/Ç 92302728 P.DOZ_G / P.DOZ_T)
  const G_TUR = { KASAR: 100 / 7.0, SUCUK: 52.5 };                                               // g / helezon turu [K v2]
  const PARCA = {                                                                                 // tek parça: gram, ölçü (m), renk
    KIYMA_ORTA: { g: 0.40, geo: () => new THREE.IcosahedronGeometry(0.0032, 0), s: [1, 0.55, 1], renk: 0x6e3b24 },
    KIYMA:      { g: 0.60, geo: () => new THREE.IcosahedronGeometry(0.0040, 0), s: [1, 0.6, 1], renk: 0xd9b48a },
    KUSBASI:    { g: 2.50, geo: () => new THREE.BoxGeometry(0.011, 0.008, 0.011), s: [1, 1, 1], renk: 0x5b2f1c },
    KASAR:      { g: 0.25, geo: () => new THREE.BoxGeometry(0.0022, 0.0016, 0.014), s: [1, 1, 1], renk: 0xf3d27a },
    SUCUK:      { g: 1.00, geo: () => new THREE.BoxGeometry(0.009, 0.009, 0.009), s: [1, 1, 1], renk: 0x7a1a14 } };   // KÜP sucuk: hesap v3 istasyon SUCUK içerik 'küp sucuk' [K], Ø42 helezon ağzı küp için
  const TABAKA = { HARC: { renk: 0xa5442a, kal: 0.002 }, SOS: { renk: 0xe9d9a6, kal: 0.003 } };
  const YAYICI_X = { HARC: 286.0, SOS: 823.5 };
  const TB = () => (IKIZ.kok.parent || IKIZ.kok).getObjectByName('TOPPING_DONER__TABLA');
  const mats = {}; const mat = r => mats[r] || (mats[r] = new THREE.MeshStandardMaterial({ color: r, roughness: 0.85, metalness: 0 }));
  const DURUM = new Map(); IKIZ.toppingParcaDurum = DURUM;
  const hash = n => { let x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
  // (a) yuvarlak hamur
  const silGeo = new Map();
  function yuvarlat(o) {
    o.traverse(m => { if (!m.isMesh || m.userData.yuvarlak || /IKIZ_TOPPING/.test((m.parent && m.parent.name) || '')) return;
      const g = m.geometry; if (!g) return; if (!g.boundingBox) g.computeBoundingBox(); const b = g.boundingBox, sx = b.max.x - b.min.x, sy = b.max.y - b.min.y, sz = b.max.z - b.min.z;
      m.userData.yuvarlak = true;
      if (Math.max(sx, sy, sz) < 0.02) { m.visible = false; IKIZ.hamurKucukGizli = (IKIZ.hamurKucukGizli || 0) + 1; return; }   // ENT ürün şablonundaki küçük koyu altıgenler (≤ 20 mm) — üründe yok (YÖNETİCİ 20:2x)
      if (!(sx > 0.15 && Math.abs(sx - sz) / sx < 0.06 && sy < 0.25 * sx)) return;               // yalnız disk (pide / lahmacun gövdesi, kesik izi katmanı değil)
      const key = g.uuid; let c = silGeo.get(key);
      if (!c) { c = new THREE.CylinderGeometry((sx + sz) / 4, (sx + sz) / 4, sy, 64, 1, false); c.translate((b.min.x + b.max.x) / 2, (b.min.y + b.max.y) / 2, (b.min.z + b.max.z) / 2); silGeo.set(key, c); }
      m.geometry = c; IKIZ.hamurYuvarlak = (IKIZ.hamurYuvarlak || 0) + 1; });
  }
  function grup(k, z) {
    let g = k.o.getObjectByName('IKIZ_TOPPING_PARCA');
    if (!g && z.grup) { g = z.grup; k.o.add(g); }
    if (!g) { g = new THREE.Group(); g.name = 'IKIZ_TOPPING_PARCA'; k.o.add(g); z.ins = {}; z.tab = {}; }
    z.grup = g;
    return g;
  }
  function inst(g, z, K, kap) {
    if (z.ins[K]) return z.ins[K]; const P = PARCA[K]; const im = new THREE.InstancedMesh(P.geo(), mat(P.renk), kap); im.count = 0; im.name = 'IKIZ_TOPPING_' + K; im.frustumCulled = false;
    g.add(im); z.ins[K] = im; return im;
  }
  const M4 = new THREE.Matrix4(), Q = new THREE.Quaternion(), V = new THREE.Vector3(), S = new THREE.Vector3(), E_ = new THREE.Euler();
  function uygula(u, k, f, kas) {
    if (!k || !k.o || u.tur !== 'HAMUR') return false;
    yuvarlat(k.o);
    if (!kas) return true;
    let z = DURUM.get(u.id); if (!z) { z = { t: null, kalan: {}, n: {}, aci: {}, son: null }; DURUM.set(u.id, z); }
    const g = grup(k, z);
    // Recipe identity owns its topping meshes; never show a previous recipe's layer.
    for(const child of [...g.children])if(!kas.some(K=>child.name==='IKIZ_TOPPING_'+K))g.remove(child);
    const yer = String(u.yer).toUpperCase(), asama = String(u.asama || '');
    const tb = TB(); const t = +f.t || 0;
    const tabladaDoz = yer === 'TABLA' && tb && /dozlan|hızlan|yavaşl|0°|kaset/.test(asama);
    if (tabladaDoz) {               // grup çerçevesi = tabla düğümü çerçevesi (parçalar tablayla döner); doz bitince ürüne dondurulur
      k.o.updateMatrixWorld(true); tb.updateMatrixWorld(true);
      const dt = z.t == null ? 0 : Math.max(0, Math.min(0.5, t - z.t));
      const ust = k.yari;
      // Encoder samples, independent of the last rendered world matrix.
      const angle=(+f.eksenler?.AX_TOP_TABLA||0)*Math.PI/180;
      const centre=(OFS+(+f.eksenler?.AX_TOP_X||0))/1000;
      const local=(x,z,y)=>V.set(Math.cos(angle)*(x-centre)-Math.sin(angle)*(z-TZ/1000),y,Math.sin(angle)*(x-centre)+Math.cos(angle)*(z-TZ/1000));
      const cik = f.cikislar || {}, eh = f.eksen_hiz || {};
      for (const K of kas) {
        if (PARCA[K] && AGIZ[K]) {
          /* TOPPING TUR 3: programın akan gramı (sim: UNO strok × alan × ρ — iç bölgede piston darbeli —, helezon tur × g/tur — iç bölgede devir düşer) kare farkıyla; yoksa eski sabit debi */
          const ag = f.akan_g && f.akan_g[K] != null ? +f.akan_g[K] : null; z.akan = z.akan || {};
          const dG = ag != null ? (z.akan[K] != null ? Math.max(0, ag - z.akan[K]) : 0) : (K in G_TUR ? Math.max(0, +eh['AX_TOP_' + K + '_HEL'] || 0) / 60 * G_TUR[K] : (cik['DO_TOP_VALF_' + K + '_PISTON'] ? UNO_GS[K] : 0)) * dt;
          if (ag != null) z.akan[K] = ag;
          const gs = dt ? dG / dt : 0;
          if (!(dG > 0)) continue;
          const P = PARCA[K], kap = 900, im = inst(g, z, K, kap); z.kalan[K] = (z.kalan[K] || 0) + dG / P.g;
          const [ax, dz, ic] = AGIZ[K];
          while (z.kalan[K] >= 1 && im.count < kap) { z.kalan[K] -= 1; const n = (z.n[K] = (z.n[K] || 0) + 1);
            const a = hash(n) * 2 * Math.PI, r = Math.sqrt(hash(n + 0.37)) * ic / 2 / 1000;
            local((ax + OFS) / 1000 + r * Math.cos(a), (TZ + dz) / 1000 + r * Math.sin(a), ust + 0.001 + 0.0015 * hash(n + 0.71));
            E_.set(0, hash(n + 0.13) * 2 * Math.PI, 0); Q.setFromEuler(E_); S.set(...P.s); M4.compose(V, Q, S); im.setMatrixAt(im.count, M4); im.count++; }
          im.instanceMatrix.needsUpdate = true; z.gram = z.gram || {}; z.gram[K] = (z.gram[K] || 0) + dG;
        } else if (TABAKA[K]) {     // yayıcı: yarıklı boru tabla yarıçapı boyunca (dünya z −295 … −162) → tabla çerçevesinde boru yönünün açısı
          if (!cik['DO_TOP_VALF_' + K + '_PISTON']) { const A0 = z.aci[K]; if (A0 && !A0.bitti && Math.abs(A0.top) > 5.5) { A0.bitti = true; A0.top = Math.sign(A0.top) * (Math.abs(A0.top) + 0.29); } else continue; }   // piston kapandı: yarık genişliği (Ø35,8 boru, r 125'te ≈ 0,29 rad) kadar bindirme → 360° boşluksuz
          local((YAYICI_X[K] + OFS) / 1000, (TZ - 100) / 1000, ust); const th = Math.atan2(V.z, V.x);
          const A = z.aci[K] || (z.aci[K] = { bas: th, son: th, top: 0 }); let d = A.bitti ? 0 : th - A.son; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; if (!A.bitti) { A.top += d; A.son = th; }
          const sw = Math.min(2 * Math.PI, Math.abs(A.top)); if (!z.tab[K] || Math.abs(sw - (z.tab[K].userData.sw || 0)) > 0.04) {
            if (z.tab[K]) { g.remove(z.tab[K]); z.tab[K].geometry.dispose(); }
            const T = TABAKA[K], geo = new THREE.CylinderGeometry(0.125, 0.125, T.kal, 96, 1, false, A.top >= 0 ? A.bas : A.bas - sw, Math.max(0.01, sw));
            const ms = new THREE.Mesh(geo, mat(T.renk)); ms.name = 'IKIZ_TOPPING_' + K; ms.userData.sw = sw;
            ms.position.set(0, k.yari + T.kal / 2, 0); ms.rotation.y = 0; g.add(ms); z.tab[K] = ms; } }
      }
    }
    if(!tabladaDoz && yer==='TABLA'){z.akan=z.akan||{};for(const K of kas)if(f.akan_g?.[K]!=null)z.akan[K]=+f.akan_g[K];}
    z.t = t; IKIZ.toppingParcaSay = [...DURUM.values()].reduce((s, q) => s + Object.values(q.n).reduce((a, b) => a + b, 0), 0);
    return true;
  }
  // Dose accounting must consume every received measurement, even when the GPU
  // draws only a few frames. Otherwise a whole rotation lands at one mouth pose.
  const pending=new Map();
  const toppingParca=(u,k,f,kas)=>{
    const q=pending.get(u.id);
    while(q?.length && q[0].f.t<=f.t){const x=q.shift();uygula(x.u,k,x.f,kas);}
    if(q && !q.length && String(u.yer).toUpperCase()!=='TABLA')pending.delete(u.id);
    if(!q || String(u.yer).toUpperCase()!=='TABLA')return uygula(u,k,f,kas);
    return true;
  };
  toppingParca.kaydet=f=>{for(const u of f.urunler||[]){if(u.tur!=='HAMUR'||u.yer!=='TABLA')continue;
    let q=pending.get(u.id);if(!q)pending.set(u.id,q=[]);
    if(q.at(-1)?.f.t===f.t)continue;
    q.push({u,f:{t:f.t,eksenler:f.eksenler,eksen_hiz:f.eksen_hiz,cikislar:f.cikislar,akan_g:f.akan_g}});
    if(q.length>6000)q.shift();
  }};
  toppingParca.temizle=()=>pending.clear();
  return toppingParca;
}
