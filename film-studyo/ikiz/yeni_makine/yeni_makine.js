import {sceneAudit30} from '../scene_audit30.js?v=950a7c43140b';
import {pianoBlack29,MACHINE_PIANO_FINISH30 as PIANO_FINISH30} from '../piano_black29.js?v=0f2f4cfd1656';
/* YENİ MAKİNE (ANA, 24 Eki 2026 — Kemal: "yeni makineyi ana dijital ikize koy, eskisini kaldır; oradaki makine üstünde çalışan kurallar
   (çekmece açılması, PLC kodu, parçaların hareket ve hızları) bununla çalışsın" · "katman sistemi çalışmıyor, düzelt; hızlandır").
   · Gövde: yeni_makine_govde.glb (yeni_makine/iskelet_v1.html'den, hat/iskelet_glb_aktar.py; her düğümde extras kat = iskelet katmanı, ist = istasyon).
   · Mekanizmalar: iskeletin beş istasyon modülü (K · F · TOP · B · E), GERÇEK model, iskeletteki yerleşim düzeltmeleriyle.
   · Hareket: zaman çizelgesi yok — her karede ikizin PLC karesi (eksenler + silindirler) modüllerin sur(G) girişine; çekmece önleri B'nin açıklık oranıyla.
   · KATMANLAR (katmanlar.js): her parça assemblyOwner = istasyon (A / TOP / F / K / E / B) + userData.katman ile etiketlenir:
     ana / ara / ayak → 'sasi' (+ iskelet 'ana' / 'ara' → "İskelet renkli") · yan / arka / çatı / taban / kaynak → 'sac' · kapak / kilit → 'kapak' ·
     mekanizma, kanal, pano, cihaz, vida, yalıtım, iç sac, soğutma → 'ic'. Panelin göz / Yalnız / sac / kapak / şasi / iç seçenekleri böylece çalışır.
   · HIZ: aynı istasyon + katman + iskelet rengi + malzeme + hareket grubundaki parçalar tek ağa birleşir (çizim çağrısı binlerden yüzlere).
     Hareket grubu: her eksen tek tek iki değerle oynatılır, dinlenmeye göre hareketi (M · M₀⁻¹) her denemede aynı olan parçalar bir grup;
     şekli / görünürlüğü değişenler (K hortumu, F kayış dişleri, E açınım yığını) ve çekmece önleri ayrı kalır. Model dosyalarına dokunulmaz.
   · Eski makine SİLİNDİ (Kemal 24 Eki): merkezi makine zarfındaki eski parçaların ve ikizin kendi yenilemelerinin emekliye ayırdığı eski sürümlerin
     GEOMETRİSİ silinir (~7300 ağ, ~30 M üçgen, ~1,8 GB); düğümleri boş çerçeve olarak kalır — sürücü eksenleri onlara uygular, ürün / stok konumu
     onlardan gelir ve yeni makine aynı yerde aynı PLC değeriyle döndüğü için ikisinin köprüsüdür. Dükkân, QR, robot, ürün, stok, E kutusu korunur.
   · Servis kapakları: ikizin 15 servis kapağı (PLC servis_kapaklari.konum) kutu örtüşmesiyle yeni kapaklara eşlenir, iskelet_v1 POZ kuralıyla açılır.
   · ?yeni=0 → eski görünüm. */
import { GLTFLoader } from '../vendor/GLTFLoader.js';
import { mergeGeometries, mergeVertices } from '../vendor/BufferGeometryUtils.js';
import { KAPAKLAR } from '../makine_kapaklari.js';
import { panoDetay28 } from './pano_detay28.js';
import { yuklemeKur } from './yukleme27.js?v=29eki-background';
import { transferKapak29 } from './transfer_kapak29.js?v=29eki-duzelt31-1';
import {eGovde30} from './e_govde30.js?v=29eki-duzelt31-1';
import {govdeDuzelt31,bDepo31,ePlaka31} from './govde_duzelt31.js?v=29eki-1';

const TABAN = new URL('./', import.meta.url).href;
const KAT_KATMAN = { ana: 'sasi', ara: 'sasi', ayak: 'sasi', yan: 'sac', arka: 'sac', cati: 'sac', taban: 'sac', kaynak: 'sac', yalitim: 'sac', kapak: 'kapak', kilit: 'kapak' };   // yalıtım sacının arkasında: sac ile gizlenir (Kemal 24 Eki)
// anlaşılır renk sınıfı (katmanlar.js 'Gerçek renk' kapalıyken): iskelet katmanı → renk
const KAT_RENK = { yan: 'sac', arka: 'sac', cati: 'sac', taban: 'sac', kaynak: 'sac', icsac: 'sac', ayak: 'vida', kapak: 'kapak', kilit: 'vida', vida: 'vida', kanal: 'kanal', kanalKapak: 'kanal', pano: 'elektrik', cihaz: 'elektrik', yalitim: 'yalitim', sogutma: 'sogutma' };
const ISTASYON = new Set(['A', 'TOP', 'F', 'K', 'E', 'B']);

export async function yeniMakine(THREE, IKIZ, scene) {
  const yukleme = yuklemeKur(IKIZ);
  const T = Object.assign({}, THREE, { GLTFLoader });                      // modüller r128 dönemi API'si (THREE.GLTFLoader) bekler
  const kok = new THREE.Group(); kok.name = 'YENI_MAKINE_KOK'; scene.add(kok);
  const durum = IKIZ.yeniMakine = { kok, mek: {}, hata: [], cizim: {} };
  // 27 Eki (Kemal: "3B dükkân indiriliyor diyor, orda duruyor"): dükkân bitti, yeni makine iniyor / kuruluyor — yazı bunu söylesin
  const yaz = t => { const e = typeof document !== 'undefined' && document.getElementById('yukleMetin'); if (e) e.textContent = t; };
  await yukleme.adim('Yeni makine hazırlanıyor');
  const gorunur = o => { for (let p = o; p; p = p.parent) if (!p.visible) return false; return true; };
  // dünyaya taşınan geometri (yalnız konum + normal; ayna matrisinde üçgen yönü çevrilir)
  // yüzler İNDEKSLİ birleşir (köşe paylaşılır: bellek indekssizin ~yarısı); çizgiler indekssiz
  // renk birleştirmede tutulmaz: ikizin dış yüzey katmanı (dis_yuzey.js, Kemal 22 Eki "tüm makine aynı paslanmaz") makine parçasının rengini zaten
  // tek paslanmaz tona çeker → aynı yüzey türündeki (saydamlık, metallik, pürüzlülük, doku) parçalar renkten bağımsız tek çizim çağrısında birleşir
  // iki renk köşede: 'color' = gerçek malzeme rengi · 'renkMek' = modülün istasyon / mekanizma kod rengi (anlaşılır renkte katmanlar.js bunu 'color'a koyar)
  const _mc = new THREE.Color();
  const renkDizi = (n, c) => { const A = new Uint16Array(n * 3), r = Math.round(Math.min(1, c.r) * 65535), gg = Math.round(Math.min(1, c.g) * 65535), bb = Math.round(Math.min(1, c.b) * 65535);
    for (let i = 0; i < n * 3; i += 3) { A[i] = r; A[i + 1] = gg; A[i + 2] = bb; } return new THREE.BufferAttribute(A, 3, true); };
  const renkKoy = (g, m, o) => { const n = g.attributes.position.count, c = (o && o.userData.ymGercekRenk) || m.color || { r: 1, g: 1, b: 1 };
    g.setAttribute('color', renkDizi(n, c)); g.setAttribute('renkMek', o && o.userData.mekRenk != null ? renkDizi(n, _mc.setHex(o.userData.mekRenk)) : renkDizi(n, c)); };
  const dunyaya = (o, M, m) => { let g;
    if (o.isLineSegments) { g = o.geometry.index ? o.geometry.toNonIndexed() : o.geometry.clone(); for (const a of Object.keys(g.attributes)) if (a !== 'position') g.deleteAttribute(a); g.applyMatrix4(M); renkKoy(g, m, o); return g; }
    g = o.geometry.clone(); g.morphAttributes = {}; g.clearGroups();
    const dokulu = m && (m.map || m.emissiveMap || m.roughnessMap);   // 26 Eki: dokulu malzemede (çapraz kaplama, buzlu folyo, yazı) UV korunur
    for (const a of Object.keys(g.attributes)) if (a !== 'position' && a !== 'normal' && !(a === 'uv' && dokulu)) g.deleteAttribute(a);
    if (!g.attributes.normal) g.computeVertexNormals();
    if (!g.index) { const n = g.attributes.position.count, I = new Uint32Array(n); for (let i = 0; i < n; i++) I[i] = i; g.setIndex(new THREE.BufferAttribute(I, 1)); }
    g.applyMatrix4(M); if (M.determinant() < 0) { const I = g.index.array; for (let k = 0; k + 2 < I.length; k += 3) { const t = I[k + 1]; I[k + 1] = I[k + 2]; I[k + 2] = t; } }
    renkKoy(g, m, o); return g; };
  const sinif = m => [m.type, m.transparent ? 'T' + (+m.opacity).toFixed(2) : 'O', m.side, m.map ? m.map.uuid : '', m.metalness != null ? Math.round(m.metalness * 4) : '',
    m.roughness != null ? Math.round(m.roughness * 4) : '', m.emissive && m.emissive.getHex() ? m.emissive.getHex() : '', m.wireframe ? 'W' : '', m.visible === false ? 'G' : ''].join('/');
  const TEMSIL = new Map();
  const graphiteMaps30=new Map();
  function graphiteMap30(map){if(graphiteMaps30.has(map))return graphiteMaps30.get(map);const image=map.image;if(!image?.width||!image?.height)return map;const c=document.createElement('canvas');c.width=image.width;c.height=image.height;const ctx=c.getContext('2d');ctx.drawImage(image,0,0);const pixels=ctx.getImageData(0,0,c.width,c.height);const floorRGB=[PIANO_FINISH30.color>>16&255,PIANO_FINISH30.color>>8&255,PIANO_FINISH30.color&255];for(let i=0;i<pixels.data.length;i+=4)for(let j=0;j<3;j++){const base=floorRGB[j];pixels.data[i+j]=Math.round((base+pixels.data[i+j]*(255-base)/255)*PIANO_FINISH30.patternBrightness+(1-PIANO_FINISH30.patternBrightness)*base);}ctx.putImageData(pixels,0,0);const out=new THREE.CanvasTexture(c);out.colorSpace=map.colorSpace;out.flipY=map.flipY;out.wrapS=map.wrapS;out.wrapT=map.wrapT;out.repeat.copy(map.repeat);out.offset.copy(map.offset);out.rotation=map.rotation;out.needsUpdate=true;graphiteMaps30.set(map,out);return out;}
  const glossyPaint29=(m,layer)=>{if(!['kapak','sac'].includes(layer)||!m?.isMeshStandardMaterial||m.transparent)return false;if(m.map)return m.roughness>=.9||m.roughness<=.2;if(m.roughness>.6)return false;if(m.userData.graphiteBezel30)return true;const c=m.color;return Math.max(c.r,c.g,c.b)<.08&&Math.max(c.r,c.g,c.b)-Math.min(c.r,c.g,c.b)<.025;};
  const temsilMalzeme = (m,layer) => { const gloss=glossyPaint29(m,layer),k=sinif(m)+(gloss?'/PIANO_BLACK':'');let t=TEMSIL.get(k);if(!t){if(gloss){t=new THREE.MeshPhysicalMaterial();THREE.MeshStandardMaterial.prototype.copy.call(t,m);t.roughness=PIANO_FINISH30.roughness;t.metalness=PIANO_FINISH30.metalness;t.clearcoat=PIANO_FINISH30.clearcoat;t.clearcoatRoughness=PIANO_FINISH30.clearcoatRoughness;t.envMap=pianoBlack29(THREE,scene,IKIZ).env;t.envMapIntensity=PIANO_FINISH30.envMapIntensity;if(m.map)t.map=graphiteMap30(m.map);}else t=m.clone();if(t.color)t.color.setRGB(1,1,1);t.vertexColors=true;t.userData={...t.userData,gercekRenk:true,pianoBlack29:gloss,pianoTextured30:gloss&&!!m.map,preserveReviewMaterial:true};t.name='YM_'+k;TEMSIL.set(k,t);}return t;};
  const etiketle = (o, ist, katman, iskelet) => { o.userData.assemblyOwner = ist; o.userData.assemblySourceName = o.name || ''; o.userData.katman = katman; if (iskelet) o.userData.iskelet = iskelet; o.userData.yeniMakine = true; };
  // birleşik ağ: grup anahtarı = istasyon | katman | iskelet | çizgi/yüz | yüzey türü (renk köşede)
  function birlesik(liste, ad) {   // liste: [{o, M (dünya), ist, katman, iskelet}]
    const kume = new Map();
    for (const q of liste) { const m0 = Array.isArray(q.o.material) ? q.o.material[0] : q.o.material, m = temsilMalzeme(m0,q.katman), k = [q.ist, q.katman, q.iskelet || '', q.renk || '', q.o.isLineSegments ? 'L' : 'M', m.uuid].join('|');
      const geometry=dunyaya(q.o,q.M,m0);if(m.userData.pianoBlack29){const paint=new THREE.Color(m.userData.pianoTextured30?0xffffff:PIANO_FINISH30.color);geometry.setAttribute('color',renkDizi(geometry.attributes.position.count,paint));} (kume.get(k)||kume.set(k,{q,m,g:[]}).get(k)).g.push(geometry); }
    const cikti = [];
    for (const { q, m, g } of kume.values()) { let b = mergeGeometries(g); g.forEach(x => x.dispose()); if (!b) continue;
      if (b.index && b.attributes.position.count > 2 * b.index.count / 3) { const c = mergeVertices(b, 1e-5); b.dispose(); b = c; }   // köşesi paylaşılmamış kaynak (E, B): aynı konum + normal tek köşe (bellek ~1/3)
      const v = q.o.isLineSegments ? new THREE.LineSegments(b, m) : new THREE.Mesh(b, m); v.name = 'YM_' + ad + '_' + q.ist + '_' + q.katman + (q.iskelet ? '_' + q.iskelet : '');
      v.matrixAutoUpdate = false; etiketle(v, q.ist, q.katman, q.iskelet); if (q.renk) v.userData.renkSinif = q.renk; cikti.push(v); }
    return cikti;
  }

  // ---- gövde (25 Eki TASLAK: ?taslak=1 → iskelette düzenlenen taslak gövde, ../yeni_makine_taslak/; yayına geçmeden ikizde bakılır)
  const govdeUrl = TABAN + 'yeni_makine_govde.glb?v=a40819f6bd9d';
  let g = await yukleme.indir(govdeUrl);
  await yukleme.adim('Gövde çözülüyor');
  const gltf = await yukleme.sinirli(() => new Promise((ok, no) => new GLTFLoader().parse(g, '', ok, no)), 'Gövde çözümü');
  g = null;
  await yukleme.adim('Gövde ve kapaklar hazırlanıyor');
  const govde = gltf.scene; govde.updateMatrixWorld(true);
  // Same CAD assembly, re-exported only for the E right service door. Replace
  // the complete old root (fixed + moving hardware), never overlay two doors.
  { const old=govde.getObjectByName('YMK_E_MEK');if(!old)throw Error('E sağ kapak kökü bulunamadı');
    const replacement=await new GLTFLoader().loadAsync(TABAN+'door28/E_MEK.glb?v=02abe768d986');
    const root=replacement.scene.getObjectByName('YMK_E_MEK');if(!root)throw Error('E sağ kapak modeli eksik');
    old.parent.add(root);old.removeFromParent();govde.updateMatrixWorld(true);
    durum.eSagKapak28={tip:'sag',pivot:[5.286,0,-.0625],hinge:'Pinet42-1-3300',source:'iskelet_v1:E_MEK',replaced:1}; }

  // 31 Eki pano31 (Kemal: "pano vs ne varsa tablomuzda uyguladıysan twine uygula"): gövde dosyası robot konum sözleşmesine bağlı, değişmez.
  // iskelet_v1'in E / K / B / TOP / F pano (plaka / U / ray) + cihaz katmanı hat/pano31_aktar.py ile ayrı GLB; eski düğümler silinir, yenileri aynı
  // dünya konumunda gövdeye girer (E_MEK kapağıyla aynı yol). K'nın boşalan valf kuşakları da kalkar. PLC / robot / IO dokunulmaz.
  const pano31 = await new GLTFLoader().loadAsync(TABAN + 'pano31/pano31.glb?v=81d9c7ed26a9');
  { const IST31 = new Set(["E", "K", "B", "TOP", "F"]), sil = [];
    const ist31 = o => { for (let q = o; q; q = q.parent) if (q.userData.ist) return q.userData.ist; let r = null; o.traverse(m => { r ??= m.userData.ist; }); return r; };
    const EK31 = {"TOP": ["icsac", "yalitim"]};   // TOP31: istasyon → ek katman (iç sac / PU) — soğuk gövdesi değişen istasyon
    for (const kat of ['pano', 'cihaz', 'icsac', 'yalitim']) { const hedef = kat === 'pano' || kat === 'cihaz' ? IST31 : new Set(Object.keys(EK31).filter(i => EK31[i].includes(kat))); if (!hedef.size) continue;
      const grp = govde.getObjectByName('YM_' + kat); if (!grp) throw Error('Gövdede YM_' + kat + ' yok');
      for (const c of grp.children) if (hedef.has(ist31(c))) sil.push(c);
      const src = pano31.scene.getObjectByName('YM31_' + kat); if (!src) throw Error('pano31 YM31_' + kat + ' eksik');
      pano31.scene.updateMatrixWorld(true); govde.updateMatrixWorld(true);
      for (const o of sil.filter(o => o.parent === grp)) o.removeFromParent();
      for (const c of [...src.children]) grp.attach(c); }
    for (const ad of ['K_IC_VALF_KUSAGI_40x20', 'K_IC_VALF_KUSAGI_UST_40x20']) { const o = govde.getObjectByName(ad); if (o) { o.removeFromParent(); sil.push(o); } }
    govde.updateMatrixWorld(true);
    durum.pano31 = { istasyon: [...IST31], silinen: sil.length, eklenen: 698, kaynak: 'iskelet_v1 pano31 81d9c7ed26a9' }; }

  // Keep the exact CAD active area before batching releases its source geometry.
  const bezel29=govde.getObjectByName('F_ALT_SAG_HMI_SIEMENS_MTP1200_ON_CERCEVE_CAM');if(bezel29){bezel29.material=bezel29.material.clone();bezel29.material.color.setHex(PIANO_FINISH30.color);bezel29.material.roughness=.18;bezel29.material.userData={...bezel29.material.userData,graphiteBezel30:true};}
  let hmiSurface29=null;const hmiGlass29=govde.getObjectByName('F_ALT_SAG_HMI_SIEMENS_MTP1200_EKRAN_12IN_1280x800');
  if(hmiGlass29){hmiGlass29.geometry.computeBoundingBox();const b=hmiGlass29.geometry.boundingBox,c=b.getCenter(new THREE.Vector3());c.z=b.max.z+.0005;c.applyMatrix4(hmiGlass29.matrixWorld);const normal=new THREE.Vector3(0,0,1).transformDirection(hmiGlass29.matrixWorld);hmiSurface29={id:'hmi',ad:'Makine HMI · Siemens MTP1200',konum:c.toArray(),genislik:b.max.x-b.min.x,en:800,boy:1280,yon:Math.atan2(normal.x,normal.z),egim:Math.asin(normal.y),gomme:true,alwaysOn:true};}
  const govde31 = govdeDuzelt31(THREE,govde);durum.govde31=govde31.report;
  const transfer29 = transferKapak29(THREE, govde);
  durum.transferKapak29 = transfer29;
  durum.eGovde30 = eGovde30(THREE,govde,transfer29.find(r=>r.p.ist==='E'),scene);
  const pano28 = await panoDetay28(THREE, IKIZ, kok, gltf, birlesik, etiketle, [pano31]);
  durum.pano = pano28.state;
  const KANAT = {}; govde.traverse(o => { if (/^YMK_.+_KANAT$/.test(o.name)) KANAT[o.name.slice(4, -6)] = o; if (/^YMK_.+_ARA$/.test(o.name)) KANAT[o.name.slice(4, -4) + '#ara'] = o; });
  durum.kanat = KANAT;
  // istasyon: GLB extras ist; ortak katmanlarda (kanal, kilit, kaynak, ayak, soğutma) parçanın merkezi hangi istasyon kutusundaysa o (montaj_sahiplik.js sınırları)
  const SINIR = [['B', [.730, 4.400, .02, .790]], ['A', [.730, 1.436, .79, 2.78]], ['TOP', [1.436, 2.5, .79, 2.78]], ['F', [2.5, 4, .788, 2.21]], ['K', [4, 4.401, .788, 2.21]], ['E', [4.401, 5.292, 0, 2.21]]];
  const _b = new THREE.Box3(), _c = new THREE.Vector3();
  const yerIst = o => { _b.setFromObject(o); if (_b.isEmpty()) return 'COMMON'; _b.getCenter(_c);
    for (const [id, s] of SINIR) if (_c.x >= s[0] && _c.x <= s[1] && _c.y >= s[2] && _c.y <= s[3]) return id; return 'COMMON'; };
  const bilgi = o => { let kat = null, ist = null; for (let a = o; a; a = a.parent) { kat = kat || a.userData.kat; ist = ist || a.userData.ist; }
    ist = ISTASYON.has(ist) ? ist : yerIst(o);
    // şasi katmanındaki küçük parçalar (perçin somunu flanşı 14×14×2, M8 vida / pul, sensör taşıyıcı) şasi değil bağlantı elemanı → iç sistem (Kemal 24 Eki)
    // 26 Eki gece (Kemal "havada uçan parçalar"): bağlantı elemanı (vida, perçin somunu, PEM, pim) TAŞIDIĞI parçanın katmanını izler — kapak / sac / şasi
    // gizlenince onunla gizlenir; hiçbirine değmiyorsa iç sistem. Rengi 'vida' (iskelet boyasına girmez).
    if (BAG.has(o)) return { kat, ist, katman: BAG.get(o), iskelet: null, renk: 'vida' };
    return { kat, ist, katman: KAT_KATMAN[kat] || 'ic', iskelet: kat === 'ana' || kat === 'ara' ? kat : null, renk: KAT_RENK[kat] || (kat === 'ana' || kat === 'ara' ? null : 'mekanizma') }; };
  // hareketli kanatlar birleşik gövdeye girmez: çekmece önleri (B açıklık oranıyla kayar) ve servis kapakları (PLC servis_kapaklari ile açılır)
  // her biri kanat / ara düğümüne göre kendi içinde birleşir
  const HAREKET = new Set(['cekmece', 'sol', 'sag', 'ust', 'alt', 'vidali', 'transferSlul']);
  const CEK = Object.keys(KANAT).filter(k => !k.endsWith('#ara') && HAREKET.has(KANAT[k].userData.tip));
  // servis kapağı eşlemesi: ikizin 15 servis kapağı (makine_kapaklari.js, PLC kimliği) → kutusu yeni kapağın önüyle en az %45 örtüşenler
  const SERVIS = [], _kb = new THREE.Box3();
  for (const k of CEK) { const o = KANAT[k], u = o.userData; if (u.tip === 'cekmece') continue; _kb.setFromObject(o); if (_kb.isEmpty()) continue;
    if (u.tip === 'transferSlul') { const r = transfer29.find(r => r.leaf === o); SERVIS.push({ id:k, o, tip:u.tip, ids:[u.plc], pose:r.pose }); continue; }
    const ids = KAPAKLAR.filter(p => { const ox = Math.min(_kb.max.x, p.b[1]) - Math.max(_kb.min.x, p.b[0]), oy = Math.min(_kb.max.y, p.b[3]) - Math.max(_kb.min.y, p.b[2]);
      // 26 Eki: ölçüt iki kapaktan KÜÇÜĞÜNÜN %45'i (eskiden yalnız PLC kapağının alanı → yarım genişlikteki F_SAG / F_ALT_SAG hiç eşlenmiyordu)
      return ox > 0 && oy > 0 && ox * oy >= .45 * Math.min((p.b[1] - p.b[0]) * (p.b[3] - p.b[2]), (_kb.max.x - _kb.min.x) * (_kb.max.y - _kb.min.y)); }).map(p => p.id);
    SERVIS.push({ id: k, o, tip: u.tip, aci: (+u.aci || 90) * Math.PI / 180, z0: o.position.z, ids, pose:k==='B_MENFEZ'?govde31.ventPose:null }); }
  durum.servisKapak = SERVIS.map(s => s.id + '←' + s.ids.join('+'));
  const cekKok = new Set(CEK.map(k => govde.getObjectByName('YMK_' + k)).filter(Boolean));
  const cekmeceKoku = o => { for (let a = o; a; a = a.parent) if (cekKok.has(a)) return a; return null; };
  // bağlantı elemanı → taşıyıcı katmanı (kutular 2 mm şişirilip değme aranır; öncelik kapak > sac > şasi)
  const BAG = new Map();
  { const KUC = [], BUY = [], C = .1, h = new Map(), anahtar = (i, j, k) => i + ',' + j + ',' + k;
    govde.traverse(o => { if (!o.isMesh || !gorunur(o)) return; let kat = null; for (let a = o; a; a = a.parent) kat = kat || a.userData.kat;
      const bb = new THREE.Box3().setFromObject(o); if (bb.isEmpty()) return; bb.getSize(_c); const boy = Math.max(_c.x, _c.y, _c.z);
      if ((kat === 'vida' || ((kat === 'ana' || kat === 'ara' || kat === 'kilit') && boy < .07)) && boy < .12) { KUC.push({ o, bb }); return; }
      const km = KAT_KATMAN[kat]; if (km !== 'kapak' && km !== 'sac' && km !== 'sasi') return; if (kat === 'kilit') return;
      const r = { bb, km }; for (let i = Math.floor(bb.min.x / C); i <= Math.floor(bb.max.x / C); i++) for (let j = Math.floor(bb.min.y / C); j <= Math.floor(bb.max.y / C); j++) for (let k = Math.floor(bb.min.z / C); k <= Math.floor(bb.max.z / C); k++) { const q = anahtar(i, j, k); (h.get(q) || h.set(q, []).get(q)).push(r); } });
    const SIRA = { kapak: 3, sac: 2, sasi: 1 }, _m = new THREE.Vector3();
    for (const { o, bb } of KUC) { const e = bb.clone().expandByScalar(.002); bb.getCenter(_m); let en = null;
      for (const r of h.get(anahtar(Math.floor(_m.x / C), Math.floor(_m.y / C), Math.floor(_m.z / C))) || []) if (r.bb.intersectsBox(e) && (!en || SIRA[r.km] > SIRA[en])) en = r.km;
      BAG.set(o, en || 'ic'); }
    durum.baglanti = { toplam: KUC.length, ...[...BAG.values()].reduce((a, k) => (a[k] = (a[k] || 0) + 1, a), {}) }; }
  const sabitListe = [], cekmeceListe = new Map();
  // 27 Eki (Kemal: "gerçek renkte dikmeler kırmızı olmaz"): iskelet_v1'in kırmızı (ana) / sarı (ara) GÖSTERİM rengi yerine gerçek malzeme —
  // AISI 304 kutu profil (iskelet_v1 'celik' malzemesi #c9ced2); anlaşılır renkte katmanlar.js yine kırmızı / sarı boyar
  const PROFIL_RENK = new THREE.Color(0xc9ced2); const KOPUK_RENK = new THREE.Color(0xd9d6cf), _hsl = {};
  govde.traverse(o => { if (!(o.isMesh || o.isLineSegments) || !gorunur(o)) return; const b = bilgi(o), ck = cekmeceKoku(o);
    // Four-bar links move individually: retain these small assemblies rather
    // than baking their fixed and moving parts into one merged mesh.
    if (o.userData.transfer29) { etiketle(o,b.ist,o.userData.eGovde30?b.katman:'kapak',o.userData.eGovde30?b.iskelet:null); return; }
    if (o.isMesh && (b.kat === 'ana' || b.kat === 'ara')) o.userData.ymGercekRenk = PROFIL_RENK;
    // 27 Eki akşam (Kemal: "kesme katlamada yatay profiller hâlâ sarı, kendi renginde olmayanlara bak"): iskelet_v1'in sarımsı gösterim
    // malzemeleri (PU / PIR köpük, yalıtım ve iç sac katmanlarındaki krem-sarı) gerçek renkte açık gri-beyaz köpük (#d9d6cf); metal (pirinç vb.) dokunulmaz
    else if (o.isMesh && ['yalitim', 'kapak', 'icsac', 'yan', 'arka', 'cati', 'taban', 'kaynak', 'kanal', 'kanalKapak', 'sogutma'].includes(b.kat)) {
      const m0 = Array.isArray(o.material) ? o.material[0] : o.material;
      if (m0 && m0.color && !m0.map) { m0.color.getHSL(_hsl); const h = _hsl.h * 360; if (_hsl.s > .3 && _hsl.l > .3 && h > 30 && h < 72) o.userData.ymGercekRenk = m0.metalness > .55 ? PROFIL_RENK : KOPUK_RENK; } }
    // (kuşak pleksisindeki kör burçlar pirinç yerine paslanmaz: dumanlı pleksinin arkasından sarı çizgi gibi görünüyordu — Kemal A12)
    if (ck) { let tas = ck; for (let a = o.parent; a && a !== ck; a = a.parent) if (/_(KANAT|ARA)$/.test(a.name || '')) { tas = a; break; }
      (cekmeceListe.get(tas) || cekmeceListe.set(tas, []).get(tas)).push({ o, M: null, ...b, katman: 'kapak', iskelet: null }); return; }   // kanadın tümü kapak katmanı
    sabitListe.push({ o, M: o.matrixWorld.clone(), ...b }); });
  const govdeBirlesik = birlesik(sabitListe, 'GOVDE');
  const govdeGrup = new THREE.Group(); govdeGrup.name = 'YENI_MAKINE_GOVDE'; govdeBirlesik.forEach(v => govdeGrup.add(v)); kok.add(govdeGrup);
  const cekmeceGrup = new THREE.Group(); cekmeceGrup.name = 'YENI_MAKINE_CEKMECE'; kok.add(cekmeceGrup);
  let nCek = 0; const _Ti = new THREE.Matrix4();
  for (const [tas, L] of cekmeceListe) { _Ti.copy(tas.matrixWorld).invert(); for (const q of L) q.M = _Ti.clone().multiply(q.o.matrixWorld);
    const vekil = birlesik(L, 'CEKMECE'); for (const q of L) q.o.parent && q.o.parent.remove(q.o); for (const v of vekil) { v.matrixAutoUpdate = true; tas.add(v); } nCek += vekil.length; }
  for (const r of cekKok) cekmeceGrup.attach(r);
  // birleşen gövde asılları bellekte kalmaz: GLB sahnesi boşaltılır, yalnız çekmece kanatları tutulur
  for (const q of sabitListe) q.o.geometry.dispose(); sabitListe.length = 0; cekmeceListe.clear(); govde.clear();
  for (const k of Object.keys(KANAT)) if (!CEK.includes(k.replace(/#ara$/, ''))) delete KANAT[k];
  durum.cizim.govde = govdeBirlesik.length; durum.cizim.cekmece = nCek;

  // ---- mekanizma modülleri (gerçek model)
  // Kemal: one detailed view, no lightweight mode or detail toggle.
  const HAFIF = false; durum.hafif = false;
  const MD = await fetch(TABAN + 'mek_duzelt.json').then(r => r.json()).catch(() => ({}));
  await pano28.set(!HAFIF);
  const BATCH28 = new Map();
  const BIR = [];   // hareket grupları: {temsil, R (M₀⁻¹), vekil[]}
  // ---- GERÇEK MALZEME RENGİ: parça kaydındaki malzeme metni (B / E parça listesi 'malzeme', K parca.mal, TOP / F parça adı) → PBR rengi
  const MALZEME = [
    [/PMMA|pleksi|polikarbonat|\bPC\b|\bcam\b/i, null],
    [/NdFeB|m[ıi]knat[ıi]s/i, [0x9aa0a6, .8, .3]],
    [/siyah eloksal|black anod/i, [0x2a2c2f, .5, .4]],
    [/paslanmaz|AISI|inox|1\.43\d\d|1\.44\d\d|\b30[34]\b|\b316/i, [0xc9cdd1, .75, .32]],
    [/al[üu]minyum|\bAl\b|AlMg|AlSi|\b60[68]\d\b|EN AW|eloksal|anodize/i, [0xd9dcdf, .55, .4]],
    [/pirin[çc]|bronz|brass/i, [0xb5925a, .8, .35]],
    [/[çc]inko|galvaniz|zinc|zn kapl/i, [0xaeb3b8, .7, .45]],
    [/sens[öo]r|Pepperl|P\+F|\bifm\b|enkoder|encoder/i, [0x2d3135, .2, .6]],
    [/motor|1FL2|servo|SIMOTICS|red[üu]kt[öo]r|PLE0|Siemens/i, [0x3a3f45, .4, .5]],
    [/Festo|SMC|ADN|DSNU|valf|piston/i, [0xc4c8cc, .5, .4]],
    [/POM|delrin|PTFE|teflon|UHMW|PA6|naylon|polyamid/i, [0xf1f0ea, 0, .55]],
    [/kay[ıi][şs]|HTD|GT2|poli[üu]retan|\bPU\b|ka[uü][çc]uk|EPDM|NBR|silikon|conta/i, [0x202326, 0, .8]],
    [/[çc]elik|S235|S355|C45|42CrMo|steel|rulman|bilya|SKF|\bINA\b|NSK|vida|somun|pul\b|DIN \d|ISO \d/i, [0x7d838a, .75, .4]],
    [/plastik|\bABS\b|\bPP\b|\bPE\b|PVC/i, [0x2b2d30, 0, .7]],
    [/kablo|hortum/i, [0x15171a, 0, .7]]];
  const MAL_CACHE = new Map();
  const malzemeMat = (m, ad) => { if (!m || m.transparent || !m.color) return m; let k = null; for (const [re, v] of MALZEME) if (re.test(ad)) { k = v; break; } if (!k) return m;
    const key = k.join(':'); let x = MAL_CACHE.get(key); if (!x) { x = new THREE.MeshStandardMaterial({ color: k[0], metalness: k[1], roughness: k[2] }); x.name = 'YM_MALZEME_' + key; x.userData.gercekRenk = true; MAL_CACHE.set(key, x); }
    if (m.side !== x.side) { const y = x.clone(); y.side = m.side; y.userData.gercekRenk = true; return y; } return x; };
  async function malzemeUygula(ist, mk, api) {
    let liste = null; if (ist === 'E') liste = await fetch(TABAN + 'E/parcalar_e.json').then(r => r.json()).catch(() => null);
    const P = new Map(); for (const x of (api.P || (liste && (liste.parcalar || liste.P)) || [])) P.set(x.id, x);
    let n = 0;
    mk.traverse(o => { if (!o.isMesh) return; let t = '';
      { const m0 = Array.isArray(o.material) ? o.material[0] : o.material; if (o.userData.mekRenk == null && m0 && m0.color) o.userData.mekRenk = m0.color.getHex(); }   // modülün mekanizma rengi (anlaşılır renk için) saklanır
      for (let a = o; a && a !== mk && !t; a = a.parent) { const u = a.userData || {}, pc = u.parca;
        if (pc && typeof pc === 'object') t = [pc.mal, pc.malzeme, pc.ad, pc.katalog].filter(Boolean).join(' ');
        else if (typeof pc === 'string') t = pc.replace(/__/g, ' ');
        else if (u.id != null && P.has(u.id)) { const x = P.get(u.id); t = [x.malzeme, x.ad, x.katalog].filter(Boolean).join(' '); } }
      if (!t) return; const m0 = Array.isArray(o.material) ? o.material[0] : o.material, m1 = malzemeMat(m0, t); if (m1 !== m0) { o.material = m1; n++; } });
    durum.malzeme = (durum.malzeme || {}); durum.malzeme[ist] = n;
  }
  for (const ist of ['K', 'F', 'TOP', 'B', 'E']) {
    try {
      await yukleme.adim(ist + ' istasyonu yükleniyor');
      await yukleme.betik(TABAN + ist + '/mekanizma_' + ist.toLowerCase() + '.mod.js?v=' + (ist === 'E' ? 'e1kas-e43806bac4cd' : ist === 'K' ? 'k31eki-312b90f53b3e' : ist === 'TOP' ? '2a606439d24a' : '28eki-electric-cam1'));
      const M = window.MEKANIZMA && window.MEKANIZMA[ist]; if (!M) throw Error('modül yok');
      const mk = new THREE.Group(); mk.name = 'YM_MEK_' + ist; kok.add(mk);
      const api = await yukleme.sinirli(() => M.kur({ THREE: T, kok: mk, taban: TABAN + ist + '/', basitMi: true }), ist + ' istasyonu');
      if (!HAFIF) { try { await yukleme.adim(ist + ' ayrıntılı parçaları yükleniyor'); await yukleme.sinirli(() => api.gercek(true), ist + ' ayrıntılı modeli'); } catch (e) { durum.hata.push(ist + ' gerçek: ' + e.message); } }   // ?hafif=1: istasyonların basit modeli (hızlı bakış)
      await malzemeUygula(ist, mk, api);   // modüllerin mekanizma kod renkleri yerine gerçek malzeme rengi (Kemal 24 Eki)
      if (ist === 'E') mk.position.x = -.0015;                                // iskelet: E modülü x −1,5 mm (iç profillere oturur)
      // iskeletin kendi kapak / ön panelleriyle çakışan modül parçaları ağaçtan SİLİNİR (gizli tutulmaz: sahneyi ağırlaştırır)
      const sil = [];
      if (ist === 'F') mk.traverse(o => { if (/^F_MEK_(KAPAK_4|KAPI_EMNIYETI|FILTRE_SERVIS)$/.test(o.name) || /^BAG_(EMKA|3SE)/.test(o.name) || /^F_TP10_GOVDE__(sac|paslanmaz|yalitim)$/.test(o.name)) sil.push(o); });
      if (ist === 'B') mk.traverse(o => { const u = o.userData || {}; if (o.name && o.name.startsWith('B_P') && /^(Çekmece ön paneli|Çekmece ön iç sacı|Ön panel conta|Depo ön conta)/.test(u.ad || '')) sil.push(o); });
      sil.forEach(o => o.parent && o.parent.remove(o));
      duzelt(THREE, mk, MD[ist] || []);
      if(ist==='B')durum.govde31.depo=bDepo31(THREE,mk,api);
      if(ist==='E')durum.govde31.pressPlate=ePlaka31(THREE,mk);
      mk.traverse(o => { if (o.isMesh || o.isLineSegments) { etiketle(o, ist, 'ic', null); o.userData.renkSinif = 'mekanizma'; for (const m of [].concat(o.material || [])) m.userData = { ...m.userData, gercekRenk: true }; } });
      durum.mek[ist] = { kok: mk, api };
      await yukleme.adim(ist + ' hareketli parçaları bağlanıyor');
      durum.cizim[ist] = hareketBirlestir(ist, mk, api);
    } catch (e) { durum.hata.push(ist + ': ' + e.message); console.error('yeni makine', ist, e); }
  }
  function hareketBirlestir(ist, mk, api) {
    if (!api.sur) return 0;
    mk.updateMatrixWorld(true);
    const og = []; mk.traverse(o => { if ((o.isMesh || o.isLineSegments) && gorunur(o)) og.push(o); });
    const visibility = og.map(o => o.visible), addedRows = [], removed = [];
    const M0 = og.map(o => o.matrixWorld.clone()), surum = o => o.geometry.uuid + ':' + Object.values(o.geometry.attributes).map(a => a.version).join(','), s0 = og.map(surum);
    const sorulan = new Set(); api.sur(a => { sorulan.add(a); return undefined; }); mk.updateMatrixWorld(true);
    const iz = og.map(() => []), bozuk = new Set(), D = new THREE.Matrix4(), Mi = new THREE.Matrix4();
    for (const ad of sorulan) for (const v of [17.3, 61.9]) {
      api.sur(a => a === ad ? v : undefined); mk.updateMatrixWorld(true);
      og.forEach((o, i) => { if (surum(o) !== s0[i] || !gorunur(o)) bozuk.add(i); D.copy(o.matrixWorld).multiply(Mi.copy(M0[i]).invert()); iz[i].push(D.elements.map(x => Math.round(x * 1e5)).join(',')); });
    }
    api.sur(() => undefined); mk.updateMatrixWorld(true);
    const grup = new Map(); og.forEach((o, i) => { if (bozuk.has(i) || o.userData.urun) return; const k = iz[i].join('|'); (grup.get(k) || grup.set(k, []).get(k)).push(i); });
    let n = 0; const birlesti = new Set(), temsil = new Set();
    for (const L of grup.values()) {
      if (L.length < 2) continue;
      const vekil = birlesik(L.map(i => ({ o: og[i], M: M0[i], ist, katman: 'ic', iskelet: null, renk: 'mekanizma' })), 'MEK');
      for (const i of L) { og[i].visible = false; birlesti.add(og[i]); }
      for (const v of vekil) kok.add(v);
      temsil.add(og[L[0]]); const row={ist,temsil:og[L[0]],R:M0[L[0]].clone().invert(),vekil};BIR.push(row);addedRows.push(row); n += vekil.length;
    }
    // budama: birleşen asıllar ağaçta kalırsa her karedeki matris güncellemesi (ikizde karede ~5 kez) onları da gezer.
    // Alt ağacı tümüyle birleşmiş ağ (ya da yalnız onları taşıyan boş grup) olan düğüm ağaçtan çıkar; temsiller ve ataları kalır.
    const korunan = new Set(); for (const t of temsil) for (let a = t; a && a !== mk; a = a.parent) korunan.add(a);
    const sade = o => o.type === 'Group' || o.type === 'Object3D';
    const atilir = o => !korunan.has(o) && (birlesti.has(o) || (sade(o) && o.children.length > 0)) && o.children.every(atilir);
    const sil = []; const gez = o => { for (const c of o.children) { if (atilir(c)) sil.push(c); else gez(c); } }; gez(mk);
    for (const o of sil) { removed.push({o,parent:o.parent});o.parent.remove(o); }
    durum.budanan = (durum.budanan || 0) + sil.length;
    BATCH28.set(ist,{og,visibility,removed,rows:addedRows});
    return n;
  }
  function birlesimCoz28(ist){
    const st=BATCH28.get(ist);if(!st)return;
    for(const row of st.rows){for(const v of row.vekil){v.removeFromParent();v.geometry.dispose()}const i=BIR.indexOf(row);if(i>=0)BIR.splice(i,1)}
    for(const {o,parent}of st.removed)parent.add(o);
    st.og.forEach((o,i)=>{o.visible=st.visibility[i]});BATCH28.delete(ist);
  }
  const eksikIstasyon = ['K', 'F', 'TOP', 'B', 'E'].filter(ist => !durum.mek[ist]);
  if (eksikIstasyon.length || durum.hata.length) throw new Error('İstasyon kurulumu tamamlanamadı: ' + (eksikIstasyon.join(', ') || durum.hata.join('; ')));
  await yukleme.adim('Dükkân ve QR bağlantıları hazırlanıyor');
  const _M = new THREE.Matrix4();
  const birlesikGuncelle = () => { for (const b of BIR) { _M.copy(b.temsil.matrixWorld).multiply(b.R); for (const v of b.vekil) { if (!v.matrix.equals(_M)) { v.matrix.copy(_M); v.matrixWorldNeedsUpdate = true; } } } };

  // ---- eski makineyi kaldır (katmanlar.js kuralı: assemblyDuplicate → layers.mask hep 0)
  const ZARF = new THREE.Box3(new THREE.Vector3(.70, -.06, -.96), new THREE.Vector3(5.32, 2.26, .17));
  // 26 Eki gece (Kemal: "hamur çekmecesinde hamurları referanslayan plaka"): çekmecenin yuvalı silikon matı (556 × 615 × 10, hamur / lahmacun / tatlı
  // yuvaları) eski çekmece stok düğümünde kalır — PLC çekmece ekseniyle hamurla birlikte açılır; silinmez
  const KORU = /^(IKIZ_DUKKAN|DUKKAN|QR|UR10E|ROBOT|E_KUTU__|URUN|IKIZ_URUN|IKIZ_E_|IKIZ_KUTU|IKIZ_STOK|IKIZ_K_SPREY|IKIZ_K_YAG|Tool|YENI_MAKINE|YM_|CEK_K\d_[a-z0-9]+_\d+__silikon__CEKMECE$)/;   // ürün, çekmece stoğu, K sprey / yağ izi süreç görselleri kalır
  const bb = new THREE.Box3(), mrk = new THREE.Vector3(), boy = new THREE.Vector3();
  function eskiGizle() {
    scene.updateMatrixWorld(true); let n = 0;
    scene.traverse(o => {
      if (!(o.isMesh || o.isLine || o.isLineSegments || o.isPoints) || o.userData.dtScreenDepthMask || o.userData.ymBakildi) return;
      o.userData.ymBakildi = true;
      for (let p = o; p; p = p.parent) { if (p === kok) return; if (p.name && KORU.test(p.name)) return; }
      bb.setFromObject(o); if (bb.isEmpty()) return; bb.getCenter(mrk); bb.getSize(boy);
      if (!ZARF.containsPoint(mrk) || Math.max(boy.x, boy.y, boy.z) > 4.7) return;
      o.userData.assemblyDuplicate = true; o.userData.ymEski = true; o.layers.mask = 0; n++;
    });
    return n;
  }
  // ---- SİL (Kemal 24 Eki: "gözükmeyen, gizli ama sahneyi ağırlaştıran, kullanmadığımız her şeyi sil"):
  // eski makinenin ve yerine yenisi konmuş (__web_gizli, katmanlar.js assemblySource / assemblyDuplicate) parçaların GEOMETRİSİ silinir.
  // Düğüm (boş çerçeve) yerinde kalır: ikizin sürücüsü eksenleri bu düğümlere uygular, ürünler (pide, kutu, stok) konumunu onlardan alır;
  // yeni makine aynı yerde aynı PLC değerleriyle döndüğü için iskelet ikisinin köprüsüdür. Kutu sınırı korunur (ürün yüzey kotu hesapları).
  // Ürün şablonları (kopyalanarak çoğaltılır) ve E kutusu dokunulmaz.
  const UD = (IKIZ.esleme && IKIZ.esleme.urun && IKIZ.esleme.urun.dugum) || {};
  const SABLON = new Set(); const topla = v => { if (typeof v === 'string') SABLON.add(v); else if (v && typeof v === 'object') Object.values(v).forEach(topla); }; topla(UD);
  const SABLON_AD = /^(URUN|ROBOT\d*_PRODUCT|E_KUTU__|IKIZ_URUN|HAMUR_BEZE)/;
  const korunur = o => { for (let p = o; p; p = p.parent) { if (p.userData && p.userData.urun) return true; if (p.name && (SABLON.has(p.name) || SABLON_AD.test(p.name))) return true; } return false; };
  // ikizin kendi yenileme modüllerinin kalıcı gizlediği eski sürümler (zemin70 GIZLE · qr_donanim / qr_govde eski · kablo_dis_baglantilar retire);
  // 24 Eki tam sipariş koşusunda hiçbiri görünür olmadı. Yıkama istasyonu gizlileri ve ürün şablonları bu listede YOK.
  const EMEKLI = /^(ELK_QR_(DOLAP|KUTU|KABLO)|QR_PERDE_|QR62_|QR\d+_(column|shelf|BAY)_|ROBOT\d+_QR_(?!ALT_KONTROL_MODULU)|ROBOT\d+_UR_HIGH_FLEX|ELK_BINA_DAGITIM__|ELK_ZEMIN__|BINA_ZEMIN__|ELK_HUCRE_KAPI__|ELK_ANA_HAT\d+__|ELK_RAY_SENSOR__|ELK_ROBOT_(KAMERA|UPS)__|ELK_ZINCIR__|FLOOR27_|DUKKAN\d+_ROBOT_ALANI_GIRIS)/;
  const BOS = new WeakMap();   // zayıf: asıl geometriye başvuru tutmaz (bellek bırakılır)
  const hayalet = g => { let h = BOS.get(g); if (h) return h; if (!g.boundingBox) g.computeBoundingBox(); if (!g.boundingSphere) g.computeBoundingSphere();
    h = new THREE.BufferGeometry(); h.setAttribute('position', new THREE.BufferAttribute(new Float32Array(0), 3)); h.boundingBox = g.boundingBox.clone(); h.boundingSphere = g.boundingSphere.clone(); h.userData.ymSilindi = true; BOS.set(g, h); return h; };
  const BOS_MALZEME = new THREE.MeshBasicMaterial({ visible: false }); BOS_MALZEME.name = 'YM_SILINDI';
  durum.silinen = { ag: 0, ucgen: 0, MB: 0 };
  function sil() {
    const aday = [], kalan = new Map();
    scene.traverse(o => {
      if (o.userData.dtScreenDepthMask || !(o.isMesh || o.isLine || o.isLineSegments || o.isPoints) || !o.geometry || (o.geometry.userData && o.geometry.userData.ymSilindi)) return;
      let olu = !!(o.userData.ymEski || o.userData.assemblyDuplicate || o.userData.assemblySource);
      if (!olu) for (let p = o; p; p = p.parent) if (p.name && !p.visible && (/__web_gizli$/.test(p.name) || EMEKLI.test(p.name))) { olu = true; break; }
      if (olu && !korunur(o)) aday.push(o); else kalan.set(o.geometry, true);
    });
    for (const o of aday) { const g = o.geometry, P = g.attributes.position;
      if (P) { durum.silinen.ucgen += (g.index ? g.index.count : P.count) / 3; if (!kalan.has(g) && !BOS.has(g)) { let b = 0; for (const a of Object.values(g.attributes)) b += a.array.byteLength; if (g.index) b += g.index.array.byteLength; durum.silinen.MB += b / 1048576; } }
      { let y = ''; for (let q = o; q && q !== scene; q = q.parent) if (q.name) y = q.name.replace(/\d+/g, '#').slice(0, 40); (durum.silinenKok = durum.silinenKok || {})[y] = (durum.silinenKok[y] || 0) + 1; }   // tanı: hangi eski grup hâlâ üretiliyor
      o.geometry = hayalet(g); o.material = BOS_MALZEME; o.layers.mask = 0; durum.silinen.ag++;
      if (!kalan.has(g)) g.dispose(); }
    return aday.length;
  }
  // görünür çift: ana GLB'deki parçanın aynısı ek GLB'de de (aynı ad, aynı kutu) → ana GLB kopyası silinir (üst üste binme)
  function ciftSil() { scene.updateMatrixWorld(true); const ek = new Map(), _k = new THREE.Box3(); let n = 0;
    const anahtar = o => { _k.setFromObject(o); return o.name.replace(/__web_gizli$/, '') + '#' + [..._k.min.toArray(), ..._k.max.toArray()].map(v => Math.round(v * 500)).join(','); };
    const ekte = o => { for (let p = o; p; p = p.parent) if (/^IKIZ_EK/.test(p.name || '')) return true; return false; };
    const L = []; scene.traverse(o => { if (o.isMesh && o.name && o.geometry && o.geometry.attributes.position && o.geometry.attributes.position.count && gorunur(o) && o.layers.mask) L.push(o); });
    for (const o of L) if (ekte(o)) ek.set(anahtar(o), o);
    for (const o of L) if (!ekte(o) && ek.has(anahtar(o)) && !korunur(o)) { o.userData.assemblyDuplicate = true; o.layers.mask = 0; n++; }
    return n; }
  for (const g of IKIZ.gltfListe || []) if (g && g.parser) g.parser.primitiveCache = {};   // yükleyicinin geometri önbelleği silinen geometriyi bellekte tutmasın
  durum.eskiGizlenen = eskiGizle(); durum.cift = ciftSil(); sil();
  // ---- ÇIKAR (Kemal 24 Eki: "kut kut oynuyor"): geometrisi silinen düğümler sahnede kalırsa ikizin karede ~5 kez yaptığı tam sahne güncellemesi
  // ve her saniyeki katman taraması onları gezer (her saniye ~60 ms takılma). Sahneden yalnız şunlar kalır: eşleme tablosunda (ikiz_esleme.json)
  // ya da sürücünün adla aradığı düğümler ve ataları, canlı (silinmemiş) her parça ve ataları, korunan gruplar (ürün, stok, E kutusu, robot ucu).
  const ADLAR = new Set(['E_KUTU__B_ROOT', 'E_SARJOR__aluminyum__AX_E_ASANSOR', 'E_SARJOR__karton_yigin', 'E_SARJOR__karton_yigin__AX_E_ASANSOR', 'IKIZ_TOPPING', 'IKIZ_TOPPING_PARCA', 'TOPPING_DONER__TABLA', 'URUN_Box', 'Tool']);
  const adTopla = v => { if (typeof v === 'string') { if (v.length < 120) ADLAR.add(v); } else if (Array.isArray(v)) v.forEach(adTopla); else if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) { if (k.length < 120) ADLAR.add(k); adTopla(x); } };
  adTopla(IKIZ.esleme || {});
  const KORU_AD = /^(IKIZ_URUN|IKIZ_STOK|IKIZ_K_|IKIZ_E_|IKIZ_KUTU|E_KUTU__|URUN|ROBOT\d*_PRODUCT|QR62_BAY_\d+$|QR_PERDE_G\d+$|HAMUR_BEZE|YENI_MAKINE|YM_)/;
  const olu = o => !!(o.geometry && o.geometry.userData && o.geometry.userData.ymSilindi);
  durum.cikarilan = 0;
  function cikar() {
    const tut = new Set(), oluVar = new Set();
    scene.traverse(o => { const canli = (o.isMesh || o.isLine || o.isLineSegments || o.isPoints) ? !olu(o) : (o.isLight || o.isCamera);
      if (canli || (o.name && (ADLAR.has(o.name) || KORU_AD.test(o.name)))) for (let p = o; p && !tut.has(p); p = p.parent) tut.add(p);
      if (olu(o)) for (let p = o; p && !oluVar.has(p); p = p.parent) oluVar.add(p); });
    const at = []; const gez = o => { for (const c of o.children) { if (!tut.has(c) && oluVar.has(c)) at.push(c); else gez(c); } }; gez(scene);
    for (const o of at) { o.parent.remove(o); o.traverse(x => { if (x.userData) x.userData.ymCikti = true; }); }
    durum.cikarilan += at.length; return at.length;
  }
  // eski makinenin görselini her karede eski düğümlere taşıyan kancalar (E servis kapısı / asansörü, E servoları, TOP motorları — hepsi silinen geometri):
  // her biri karede tam sahne güncellemesi yapıyordu (~7 ms × 3). Kaynak dosyası çağrı yığınından tanınır, kancalar listesinden çıkar.
  const ESKI_KANCA = /\/(e_service31|e_servos47|top_motors_main58)\.js/;
  function eskiKancaCikar() { const umw = scene.updateMatrixWorld; let iz = '';
    scene.updateMatrixWorld = function (f) { iz += new Error().stack; return umw.call(this, f); };
    const at = []; try { for (const h of IKIZ.kancalar) { if (h === kare) continue; iz = ''; try { h(0); } catch (e) {} if (ESKI_KANCA.test(iz)) at.push(h); } } finally { scene.updateMatrixWorld = umw; }
    for (const h of at) IKIZ.kancalar.splice(IKIZ.kancalar.indexOf(h), 1); durum.kancaCikan = (durum.kancaCikan || 0) + at.length; }
  let tur = 0; const zm = setInterval(() => { durum.eskiGizlenen += eskiGizle(); sil(); cikar(); if (++tur >= 20) clearInterval(zm); }, 3000);

  // servis kapağı pozu: PLC açıklığı ile elle açma (tıkla, 26 Eki gece) hangisi büyükse — iskelet_v1 POZ kuralı aynen
  const kapakPoz = s => { const v = Math.max(s.plc || 0, s.ev || 0);
    if (s.pose) { s.pose(v); return; }
    if (s.tip === 'sol') s.o.rotation.y = -v * s.aci; else if (s.tip === 'sag') s.o.rotation.y = v * s.aci;
    else if (s.tip === 'ust') s.o.rotation.x = -v * s.aci; else if (s.tip === 'alt') s.o.rotation.x = v * s.aci;
    else if (s.tip === 'vidali') s.o.position.z = s.z0 + .08 * Math.min(1, v * 1.25); };
  // ---- her kare: PLC karesi → modüller → birleşik ağlar · çekmece önleri
  let tpMM = 0, sonKare = null, sonAnahtar = null; const sorulanlar = new Set();
  const kare = () => {
    const f = IKIZ.goruntuKaresi || IKIZ.son; if (durum.detayDegisiyor || !f || f === sonKare) return; sonKare = f;   // yalnız yeni PLC karesinde
    const ek = f.eksenler || {}, si = f.silindirler || {}, cik = f.cikislar || {};   // cikislar: TOP valf / piston / silecek (DO_*, 0/1)
    const sayi = v => (v != null && typeof v === 'object') ? (v.konum ?? v.deger) : v;
    const h = (f.urunler || []).find(u => u.tur === 'HAMUR' && u.yer === 'F' && u.bant_mm != null); if (h) tpMM = +h.bant_mm;
    const D = ad => f.hareket_degerleri27?.[ad] ?? (ad === 'F_TP_MM' ? tpMM : ad === 'AX_TOP_BANT_ROTOR' ? (+sayi(ek.AX_TOP_BANT) || 0) * 6.224419 : (   // rotor: ikizin top_main76 kuralı (assets/top76 rotor_deg_mm)
      ek[ad] != null ? +sayi(ek[ad]) : si[ad] != null ? +sayi(si[ad]) : cik[ad] != null ? +cik[ad] : undefined));
    const anahtar = [...sorulanlar].map(D).join(',') + '|' + JSON.stringify(f.servis_kapaklari || ''); if (anahtar === sonAnahtar) return; sonAnahtar = anahtar;   // eksenler kıpırdamadıysa modüller yeniden sürülmez
    const G = ad => { sorulanlar.add(ad); return D(ad); };
    for (const k in durum.mek) { const A = durum.mek[k].api; try { if (A.sur) A.sur(G); } catch (e) { if (durum.hata.length < 50) durum.hata.push(k + ' sur: ' + e.message); } }
    for (const k in durum.mek) durum.mek[k].kok.updateMatrixWorld(true);
    birlesikGuncelle();
    const SK = f.servis_kapaklari || {};
    for (const s of SERVIS) { let v = 0; for (const i of s.ids) v = Math.max(v, +((SK[i] || {}).konum) || 0); s.plc = v; kapakPoz(s); }
    const B = durum.mek.B && durum.mek.B.api;
    if (B && B.oran) for (const [id, o] of Object.entries(KANAT)) {
      if (id.endsWith('#ara') || !o.userData || o.userData.tip !== 'cekmece') continue; const v = B.oran[id] || 0, s = +o.userData.strok || 0;
      if (o.position.z !== v * s) { o.position.z = v * s; const a = KANAT[id + '#ara']; if (a) a.position.z = v * s / 2; } }
  };
  // KUŞAK PİKSEL LED — ÜRETİM TAKİBİ (Kemal 26 Eki): kuşağın füme levhası arkasındaki adreslenebilir şerit (60 piksel/m, 841,5 … 5184,5)
  // her karede hattaki her hamurun / pidenin x konumunda yanar (fırındaki turuncu, diğerleri yeşil, 5 piksel); boşta sönük sıcak beyaz.
  { const X0 = .8415, X1 = 5.1845, N = Math.round((X1 - X0) * 60), g = new THREE.BoxGeometry(1 / 60 * .7, .006, .0012);
    // 27 Eki (Kemal: "LED çalışmıyor"): LED malzemesi dış yüzey katmanında paslanmaza boyanıyordu (gercekRenk bayrağı yoktu) → sönük gri.
    // Ayrıca yalnız hamur / pide izleniyordu → makinedeki HER ürün ayrı: hazırlıkta (A / TOP / K) yeşil, fırında turuncu, kutuda / E'de mavi.
    const lm = new THREE.MeshBasicMaterial({ toneMapped: false }); lm.userData.gercekRenk = true;
    const im = new THREE.InstancedMesh(g, lm, N), M = new THREE.Matrix4(), c0 = new THREE.Color(0x3a2c22), cY = new THREE.Color(0x35ff7a), cT = new THREE.Color(0xff8a1e), cK = new THREE.Color(0x3aa0ff);
    for (let i = 0; i < N; i++) { M.makeTranslation(X0 + (i + .5) / 60, .768, .0742); im.setMatrixAt(i, M); im.setColorAt(i, c0); }
    im.name = 'YM_KUSAK_PIKSEL_LED'; im.userData = { katman: 'kapak', ist: 'B', renkSinif: 'gercek' }; im.frustumCulled = false; kok.add(im);
    let sonLed = null; const yan = new Uint8Array(N);
    const ledKare = () => { const f = IKIZ.goruntuKaresi || IKIZ.son; if (!f || f === sonLed) return; sonLed = f; const yeni = new Uint8Array(N);
      for (const u of f.urunler || []) { if (!['HAMUR', 'PIDE', 'KUTU', 'LAHMACUN'].includes(u.tur)) continue; const p = IKIZ.urunKopyaKonum && IKIZ.urunKopyaKonum(u.id); if (!p) continue;
        if (p[2] > .2) continue;   // makinenin dışında (robotta, QR'de) yanmaz
        const i = Math.round((p[0] - X0) * 60 - .5); if (i < -2 || i > N + 1) continue; const yer = String(u.yer).toUpperCase();
        const r = yer === 'F' ? 2 : (u.tur === 'KUTU' || yer === 'E') ? 3 : 1;
        for (let k = Math.max(0, i - 2); k <= Math.min(N - 1, i + 2); k++) yeni[k] = Math.max(yeni[k], r); }
      let deg = false; for (let k = 0; k < N; k++) if (yeni[k] !== yan[k]) { yan[k] = yeni[k]; im.setColorAt(k, yeni[k] === 3 ? cK : yeni[k] === 2 ? cT : yeni[k] === 1 ? cY : c0); deg = true; }
      if (deg) im.instanceColor.needsUpdate = true; durum.led = { piksel: N, yanan: yan.reduce((a, b) => a + (b ? 1 : 0), 0) }; };
    IKIZ.kancalar.push(ledKare); durum.led = { piksel: N, yanan: 0 }; }
  IKIZ.kancalar.push(kare); kare();
  cikar(); eskiKancaCikar();
  try { durum.dukkan24 = (await import('../dukkan_24eki.js?v=29eki-catwidth3')).dukkan24(THREE, IKIZ, scene); } catch (e) { durum.hata.push('dükkân 24: ' + e.message); console.error(e); }   // Kemal 24 Eki madde 9
  try { durum.tezgah24 = (await import('../personel_tezgah24.js?v=29eki-preserve-yellow')).personelTezgah24(THREE, IKIZ, scene); } catch (e) { durum.hata.push('tezgâh 24: ' + e.message); console.error(e); }   // madde 7
  // ELK24: eski istasyon modüllerinin kare kancaları (ör. top_main76) yeni makinede artık olmayan düğümlere dokunup her karede hata atıyor ve çizimi durduruyordu → kancalar korumalı (hata bir kez uyarı olarak yazılır, döngü sürer)
  { const K = IKIZ.kancalar = IKIZ.kancalar || [];
    const sar = f => { if (typeof f !== 'function' || f.__guv) return f; const g = dt => { try { f(dt); } catch (e) { if (!g.__hata) { g.__hata = 1; console.warn('kanca hatası (eski modül, yeni makinede düğüm yok): ' + e.message); } } }; g.__guv = 1; return g; };
    for (let i = 0; i < K.length; i++) K[i] = sar(K[i]);
    const itil = K.push.bind(K); K.push = (...f) => itil(...f.map(sar)); }   // sonradan eklenen kancalar da korumalı
  try { durum.yikama24 = (await import('../yikama24.js?v=24eki-b')).yikama24(THREE, IKIZ, scene); } catch (e) { durum.hata.push('yıkama 24: ' + e.message); console.error(e); }   // madde 6
  // 26 Eki gece (Kemal: "personeldeki makine üstü ekranı sil"): eski makinenin A önündeki personel tableti (Active5) + ekranı + şarj kablosu kalkar;
  // yeni makinede personel ekranı F sağ alt kapaktaki HMI (MTP1200)
  { const sil = []; scene.traverse(o => { if (/MAKINE_TABLET|MACHINE[-_]TABLET|IKIZ_EKRAN_DERINLIK_machine/.test(o.name || '')) sil.push(o); });
    const e = IKIZ.ekranlar3b && IKIZ.ekranlar3b.machine; if (e) { e.el && e.el.remove(); e.mask && sil.push(e.mask); delete IKIZ.ekranlar3b.machine; }
    for (const o of sil) { o.removeFromParent(); o.traverse(q => q.geometry && q.geometry.dispose()); } durum.tabletSilinen = sil.length; }
  if(hmiSurface29&&IKIZ.hmiEkranEkle29){const hmi=IKIZ.hmiEkranEkle29(hmiSurface29);const leaf=KANAT.F_ALT_SAG||kok;leaf.updateWorldMatrix(true,false);leaf.attach(hmi.mask);hmi.mask.userData.yeniMakine=true;
    hmi.follow=()=>{hmi.mask.updateWorldMatrix(true,false);const M=hmi.mask.matrixWorld;hmi.o.position.setFromMatrixPosition(M);hmi.o.sag.setFromMatrixColumn(M,0).normalize();hmi.o.ust.setFromMatrixColumn(M,1).normalize();hmi.normal.setFromMatrixColumn(M,2).normalize();hmi.konum=hmi.o.position.toArray();hmi.physicalVisible=true;for(let p=leaf;p;p=p.parent)if(!p.visible)hmi.physicalVisible=false;};hmi.follow();durum.hmiSurface29=hmiSurface29;}
  // 27 Eki (Kemal: "TOPPING'de borular aşağı inmiyor"): üç dirsek ucu (flanş Ø59, y 1545, z −170; x 1722 / 1911 / 2260) ile alttaki bağlantı halkası
  // (Ø50, y 1210) arasında 323 mm boşluk — arada parça yok (iskelette düşey ışın taraması) → AISI 304 boru Ø38 × 1,5 (DN32), iki ucu kelepçeli
  { const m = new THREE.MeshStandardMaterial({ color: 0xc9cdd1, metalness: .75, roughness: .3 }); m.userData.gercekRenk = true; const G = new THREE.Group(); G.name = 'TOP27_DUSEY_BORULAR'; kok.add(G);
    for (const x of [1.722, 1.911, 2.260]) { const y0 = 1.216, y1 = 1.539, o = new THREE.Mesh(new THREE.CylinderGeometry(.019, .019, y1 - y0, 32, 1, true), m);
      o.position.set(x, (y0 + y1) / 2, -.170); o.name = 'TOP27_BORU_D38_' + Math.round(x * 1000); o.userData = { assemblyOwner: 'TOP', ist: 'TOP', katman: 'ic', renkSinif: 'mekanizma', yeniMakine: true }; G.add(o); }
    durum.topBoru = G.children.length; }
  // 26 Eki gece: QR gözleri arası bölme sacları (kapalı kablo dikmesi, 12 mm çift cidar) QR gövdesinin sacıdır
  scene.traverse(o => { if (o.isMesh && /^QR_KAPALI_KABLO_DIKMESI_\d$/.test(o.name)) o.userData.katman = 'sac'; });
  // ---- KAPAKLAR TIKLAYINCA AÇILIR (Kemal 26 Eki gece: "her istasyonda, her makinedeki kapaklar açılsın basınca"):
  // ikizin tıklama listesi (tiklama.js) yeni makine ve 24 Eki modüllerinden ÖNCE kuruluyordu → yeni kapaklar listede yoktu. Burada sahnedeki
  // güncel hedefler toplanır: makinenin servis kapakları (elle aç / kapat; PLC'ye bakım isteği de gider) + twinAction taşıyan her parça
  // (QR teknik / iç bölme kapakları, yıkama kanatları, personel tezgâhı kapı + çekmece, eski dükkân mobilyası).
  { for (const s of SERVIS) { s.elle = 0; s.ev = 0;
      const etiket = s.id==='B_MENFEZ'?'Havalandırma menfezi · sök / tak':'Kapak ' + s.id.replace(/_/g, ' ') + ' · aç / kapat';
      // 27 Eki (Kemal: "kapak açarken PIN istiyor"): ikizde tıklama yalnız görsel açar — PLC'ye bakım isteği (personel tableti PIN'i) GÖNDERİLMEZ
      const ac = () => { s.elle = s.elle > .5 ? 0 : 1; };
      s.o.traverse(o => { if (o.isMesh) o.userData.twinAction = { kind: 'elle', label: etiket, toggle: ac }; });
      if(s.id==='B_MENFEZ')scene.getObjectByName('YMK_B_MENFEZ')?.traverse(o=>{if(o.isMesh&&o.material?.userData.serviceHit31)o.userData.twinAction={kind:'elle',label:etiket,toggle:ac};}); }
    IKIZ.kancalar.push(dt => { const st = Math.min(.1, dt || 0) / .9; for (const s of SERVIS) if (s.ev !== s.elle) { s.ev += Math.sign(s.elle - s.ev) * Math.min(st, Math.abs(s.elle - s.ev)); kapakPoz(s); } });
    // yıkama T70 üst dolap kanatları + kimyasal kapağı (Pinet piyano, düşey eksen; yikama24 menteşesiyle aynı yön): sol +, sağ −
    const YK = [];
    for (const [ad, yan, et] of [['YIKAMA__T70_KANAT_SOL', 1, 'Yıkama üst dolap · sol kanat'], ['YIKAMA__T70_KANAT_SAG', -1, 'Yıkama üst dolap · sağ kanat'], ['YIKAMA__KIMYASAL_KAPAK', 1, 'Kimyasal dolabı kapağı']]) {
      const k = scene.getObjectByName(ad); if (!k) continue; const q = { k, yan, r0: k.rotation.y, v: 0, h: 0, plc: 0 }; YK.push(q);
      // T70 kanatları yıkama PLC'sinin (wash60) pozuyla her karede sürülür → o poz fonksiyonu sarılır: açıklık = max(PLC, elle)
      { const adaylar = []; for (const v of [...Object.values(IKIZ.tMain70 || {}), (IKIZ.wash57 || {}).doors]) { if (Array.isArray(v)) adaylar.push(...v); else if (v && typeof v === 'object') adaylar.push(v); }
        const rec = adaylar.find(r => r && typeof r.pose === 'function' && Object.values(r).some(x => x === k || (x && x.isObject3D && x.getObjectById(k.id))));
        if (rec && !rec.__elle) { const asil = rec.pose.bind(rec); rec.pose = v => { q.plc = v; return asil(Math.max(v || 0, q.v)); }; rec.__elle = true; q.rec = rec; } }
      k.traverse(o => { if (o.isMesh && !o.userData.twinAction) o.userData.twinAction = { kind: 'elle', label: et + ' · aç / kapat', toggle: () => { q.h = q.h > .5 ? 0 : 1; } }; }); }
    IKIZ.kancalar.push(dt => { const st = Math.min(.1, dt || 0) / .8; for (const q of YK) if (q.v !== q.h) { q.v += Math.sign(q.h - q.v) * Math.min(st, Math.abs(q.h - q.v)); if (q.rec) q.rec.pose(q.plc); else q.k.rotation.y = q.r0 + q.yan * q.v * Math.PI / 2 * .95; } });
    durum.yikamaKanat = YK.length; durum.YK = YK;
    const kanvas = IKIZ.sahne.renderer.domElement, ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
    const gor = o => { for (let p = o; p; p = p.parent) if (!p.visible) return false; return o.layers.mask !== 0; };
    let hedef = [], tazele = 0;
    const topla = () => { hedef = []; scene.traverse(o => { if (o.isMesh && o.userData.twinAction && o.userData.twinAction.toggle) hedef.push(o); }); tazele = performance.now(); };
    const sec = (x, y) => { if (performance.now() - tazele > 5000) topla(); const r = kanvas.getBoundingClientRect(); ndc.set((x - r.left) / r.width * 2 - 1, -(y - r.top) / r.height * 2 + 1);
      ray.setFromCamera(ndc, IKIZ.sahne.kamera); const h = ray.intersectObjects(hedef.filter(gor), false)[0]; return h ? h.object.userData.twinAction : null; };
    const onceki = IKIZ.parcaTikla;
    IKIZ.parcaTikla = (x, y) => { const a = sec(x, y); if (a) { a.toggle(); IKIZ.parcaDurumYaz && IKIZ.parcaDurumYaz(a.label); return true; } return onceki ? onceki(x, y) : false; };
    let son = 0; kanvas.addEventListener('pointermove', e => { if (e.buttons || performance.now() - son < 150) return; son = performance.now(); const a = sec(e.clientX, e.clientY); if (a) { kanvas.style.cursor = 'pointer'; kanvas.title = a.label; } });
    topla(); durum.tiklanir = hedef.length; durum.kapakSec = sec;durum.tiklamaTazele=topla; }
  // ---- B ÇEKMECELERİ TIKLAYINCA AÇILIR (27 Eki akşam, Kemal A13: "kapağa basınca çekmece açılmıyor, yalnız hamur tepsisi oynuyor"): çekmece önüne
  // tıklama bağlı değildi. Elle açma, görüntülenen PLC karesindeki çekmece eksenini (AX_B_<id>, mm) büyütür → önü, mekanizması (kutu, ray, kayış),
  // hamur / silikon mat ve stok TEK eksenden birlikte açılır. PLC'ye komut gitmez (PIN yok).
  { const B = durum.mek.B && durum.mek.B.api, ELLE = {};
    if (B && B.sur) { const pr = {}; B.sur(a => { pr[a] = 1; return 100; }); const strok = {}; for (const id in B.oran) strok[id] = B.oran[id] > 0 ? 100 / B.oran[id] : 700;
      B.sur(() => 0); sonAnahtar = null;   // ölçüm sonrası çekmeceler kapalı; sonraki karede PLC değerleriyle yeniden sürülür
      for (const [id, o] of Object.entries(KANAT)) { if (id.endsWith('#ara') || !o.userData || o.userData.tip !== 'cekmece') continue; const e = ELLE[id] = { v: 0, h: 0, mm: strok[id] || 700 };
        o.traverse(x => { if (x.isMesh) x.userData.twinAction = { kind: 'elle', label: 'Çekmece ' + id.replace(/^B_/, '').replace('_', '.') + ' · aç / kapat', toggle: () => { e.h = e.h > .5 ? 0 : 1; } }; }); }
      const yama = f => { if (!f || !f.eksenler) return f; for (const id in ELLE) { const e = ELLE[id]; if (!(e.v > 0)) continue; const ax = 'AX_' + id, x = f.eksenler[ax];
          const cur = +(x != null && typeof x === 'object' ? (x.konum ?? x.deger) : x) || 0, yeni = Math.max(cur, e.v * e.mm);
          if (x != null && typeof x === 'object') f.eksenler[ax] = { ...x, konum: yeni }; else f.eksenler[ax] = yeni;
          if(f.hareket_degerleri27)f.hareket_degerleri27[ax]=yeni;
          const c = f.cekmeceler && f.cekmeceler[id.replace(/^B_/, '')]; if (c && typeof c === 'object') f.cekmeceler[id.replace(/^B_/, '')] = { ...c, konum: Math.max(+c.konum || 0, e.v * e.mm) }; }
        return f; };
      let _gk = IKIZ.goruntuKaresi; Object.defineProperty(IKIZ, 'goruntuKaresi', { configurable: true, get: () => _gk, set: f => { _gk = yama(f); } });
      IKIZ.kancalar.push(dt => { const st = Math.min(.1, dt || 0) / 1.2; for (const id in ELLE) { const e = ELLE[id]; if (e.v !== e.h) e.v += Math.sign(e.h - e.v) * Math.min(st, Math.abs(e.h - e.v)); } });
      durum.cekmeceElle = Object.keys(ELLE).length; durum.cekmeceAc = (id, v) => { if (ELLE[id]) ELLE[id].h = v; }; } }
  durum.tiklamaTazele?.();
  document.getElementById('ymGorunum')?.remove();
  // ---- ÇİZGİLER YOK (Kemal 1 Kas: "tüm corner line'ları kaldır, sahneyi temizle"): kenar26 + Çizgiler düğmesi kalktı; bütün kenar çizgileri silinir
  try { durum.kenarSil32 = (await import('../kenar_sil32.js?v=32-1')).kenarSil32(scene, IKIZ); } catch (e) { durum.hata.push('kenar sil 32: ' + e.message); console.error(e); }
  // 27 Eki akşam (Kemal madde A8: "'Paslanmaz kutu profil · dış ölçü …' yazısı ne, sil"): eski E çerçeve modülünün ölçü etiketi — yeni makinede anlamsız
  { const sil = () => { const e = typeof document !== 'undefined' && document.getElementById('eFrame12Size'); if (e) e.remove(); }; sil(); setTimeout(sil, 3000); setTimeout(sil, 15000); }
  // E kutusu (karton) E'nin iç sistemiyle gizlenir — şasi görünümünde 'kutunun parçaları' kalmasın (Kemal 24 Eki); anlaşılır renkte de kendi renginde
  { const ek = scene.getObjectByName('E_KUTU__B_ROOT'); if (ek) { ek.userData.katman = 'ic'; ek.userData.renkSinif = 'gercek'; } }
  durum.cizimToplam = () => { let n = 0; kok.traverse(o => { if ((o.isMesh || o.isLineSegments) && gorunur(o)) n++; }); return n; };
  durum.hazir = true; yukleme.tamam();
  setTimeout(()=>sceneAudit30(THREE,scene,IKIZ),1500);
  return durum;
}

// iskelet_v1 MEK_DUZELT uygulayıcısı (aynı kural): gizle · yalt / yust / yayna / zust (köşe düzeltmesi, dünya) · dx / dy / dz öteleme
function duzelt(THREE, kok, L) {
  for (const d of L) {
    const re = new RegExp(d.ad);
    kok.traverse(o => {
      const nm = o.name || (o.userData && o.userData.parca && o.userData.parca.ad) || (o.parent && o.parent.name) || '';
      if (!o.isMesh || !re.test(nm)) return;
      if (d.gizle) { o.visible = false; return; }
      const key=JSON.stringify(d);if(o.geometry.userData.ymDuzelt28?.includes(key))return;
      const mark=g=>{g.userData.ymDuzelt28=[...(g.userData.ymDuzelt28||[]),key];return g;};
      if (d.yalt || d.yust || d.yayna != null || d.zust != null) {
        o.updateMatrixWorld(true); const g = o.geometry = mark(o.geometry.clone()), P = g.attributes.position, W = o.matrixWorld, Wi = W.clone().invert(), v = new THREE.Vector3();
        for (let i = 0; i < P.count; i++) { v.fromBufferAttribute(P, i).applyMatrix4(W); if (d.yalt && v.y < d.yalt[0]) v.y += d.yalt[1]; if (d.yust && v.y > d.yust[0]) v.y += d.yust[1]; if (d.yayna != null) v.y = 2 * d.yayna - v.y; if (d.zust != null && v.z > d.zust) v.z = d.zust; v.applyMatrix4(Wi); P.setXYZ(i, v.x, v.y, v.z); }
        if (d.yayna != null && g.index) { const I = g.index.array; for (let k = 0; k < I.length; k += 3) { const t = I[k + 1]; I[k + 1] = I[k + 2]; I[k + 2] = t; } g.index.needsUpdate = true; }
        P.needsUpdate = true; g.computeVertexNormals(); g.computeBoundingBox(); g.computeBoundingSphere(); for (const c of o.children) if (c.isLineSegments) c.geometry = new THREE.EdgesGeometry(g, 30); return;
      }
      o.geometry = mark(o.geometry.clone()); o.geometry.translate((d.dx || 0) / 1e3, (d.dy || 0) / 1e3, (d.dz || 0) / 1e3); o.geometry.computeBoundingBox(); o.geometry.computeBoundingSphere();
      for (const c of o.children) if (c.isLineSegments) { c.geometry = c.geometry.clone(); c.geometry.translate((d.dx || 0) / 1e3, (d.dy || 0) / 1e3, (d.dz || 0) / 1e3); }
    });
  }
}
