// AÇICI 32 (Kemal 1 Kas 2026: "A'nın açıcısı vardı, o ne oldu, yok modelde; onu geri koy animasyonuyla"):
// 31 Eki eski makine geometrisi silinince (strip_glb) açıcının beş düğümü boş çerçeve kaldı. Geometri 24 Eki kapsülündeki
// hat3_ikiz_v4b'den aynen (meshopt dilimleri, hat/acici32.glb) bu düğümlerin çocuğu olarak geri konur:
//   TOPPING_MODUL__celik / motor / sac __ACICI (açıcı kafası) · TOPPING_DONER__KONI_ON / KONI_ARKA (iki konik merdane).
// Hareket: kafa + merdaneler sürücünün aciciUygula'sıyla iner / kalkar (PLC acici.head_offset_mm, düğüm y'si);
// merdaneler DO_A_BASLA açıkken eski ENT kuralıyla döner (cikis DO_A_BASLA · donme · eksen ON [0, .306, .952] / ARKA [0, .306, −.952],
// pivot koni tepesi = düğüm orijini, sürekli 90°/s — [V] üretici föyü yok, VARSAYIM 15 dev/dk). Açıcı hazır alınır: yalnız görsel.
import { GLTFLoader } from './vendor/GLTFLoader.js';
import { MeshoptDecoder } from './vendor/meshopt_decoder.module.js';

const KAYNAK = './yeni_makine/acici32/acici32.glb?v=b8b17212bd67';
const EKSEN = { TOPPING_DONER__KONI_ON: [0, .306, .952], TOPPING_DONER__KONI_ARKA: [0, .306, -.952] };
const HIZ_DEG_S = 90;

export async function acici32(THREE, IKIZ, scene) {
  const d = IKIZ.acici32 = { parca: 0, ucgen: 0, eksik: [], aci: 0 };
  const loader = new GLTFLoader(); loader.setMeshoptDecoder(MeshoptDecoder);
  const gltf = await loader.loadAsync(new URL(KAYNAK, import.meta.url).href);
  const donen = [];
  for (const m of [...gltf.scene.children]) {
    const ad = m.userData.kaynak_dugum, hedef = ad && scene.getObjectByName(ad);
    if (!hedef) { d.eksik.push(ad); continue; }
    m.position.set(0, 0, 0); m.quaternion.identity(); m.scale.set(1, 1, 1);   // ağ düğümün yerel çerçevesinde (kaynakta da düğümün kendi ağıydı)
    m.traverse(o => { if (!o.isMesh) return;
      Object.assign(o.userData, { ist: 'A', assemblyOwner: 'A', assemblySourceName: ad, katman: 'ic', renkSinif: 'gercek' });
      d.parca++; d.ucgen += (o.geometry.index ? o.geometry.index.count : o.geometry.attributes.position.count) / 3; });
    hedef.add(m);
    if (EKSEN[ad]) donen.push({ m, eksen: new THREE.Vector3(...EKSEN[ad]).normalize() });
  }
  if (d.eksik.length) throw new Error('açıcı düğümü yok: ' + d.eksik.join(', '));
  let tOnce = null;
  IKIZ.kancalar.push(() => {
    const f = IKIZ.goruntuKaresi || IKIZ.son; if (!f) return;
    const t = +f.t || 0, PA = f.acici || null, c = f.cikislar || {};
    const bas = PA && PA.basiyor != null ? !!PA.basiyor : !!c.DO_A_BASLA;
    if (tOnce != null && bas) d.aci = (d.aci + HIZ_DEG_S * Math.max(0, Math.min(1, t - tOnce))) % 360;   // sim zamanıyla birikir (duraklatınca durur)
    tOnce = t; d.donuyor = bas;
    for (const r of donen) r.m.quaternion.setFromAxisAngle(r.eksen, d.aci * Math.PI / 180);
  });
  IKIZ.katmanlar?.scan?.();
  return d;
}
