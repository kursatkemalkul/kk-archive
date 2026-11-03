// KENAR ÇİZGİSİ 26 (Kemal 26 Eki gece: yıkama dolabı "nerde kapaklar, neden renksiz"): makinedeki gibi her parçanın
// siyah kenar çizgisi (EdgesGeometry, 30°) — yıkama, QR, personel tezgâhı ve robot hücresinde kapak derzleri, sac
// bükümleri, raflar okunur. Çizgi sahibinin katmanını taşır (sac / kapak / şasi / iç) → katman paneliyle birlikte gizlenir.
import { katmanSinif } from './katmanlar.js';
const PARCA_ETIKET = { frame: 'sac', cover: 'kapak', sasi: 'sasi', ic: 'ic' };
export function kenar26(T, IKIZ, scene, istasyonlar = ['WASH', 'QR', 'PERSONEL']) {
  const mat = new T.LineBasicMaterial({ color: 0x15171a }); mat.userData.gercekRenk = true;
  const hedef = new Set(istasyonlar), say = {}, ekle = [];
  scene.updateMatrixWorld(true);
  scene.traverse(o => {
    if (!o.isMesh || !o.geometry || o.isInstancedMesh || o.userData.yeniMakine || /^YM_/.test(o.name || '') || o.userData.dtScreenDepthMask || o.userData.assemblySource || o.userData.assemblyDuplicate) return;
    if (o.children.some(c => c.isLineSegments)) return;
    const m = Array.isArray(o.material) ? o.material[0] : o.material; if (!m || m.map || (m.transparent && m.opacity < .9) || m.visible === false) return;   // dokulu yüz (numara / etiket / ekran) çizgisiz
    const c = katmanSinif(o); if (!hedef.has(c.id) || c.malzeme) return;
    const p = o.geometry.attributes.position; if (!p || p.count > 60000) return;
    const g = new T.EdgesGeometry(o.geometry, 30); if (!g.attributes.position.count) { g.dispose(); return; }
    const l = new T.LineSegments(g, mat); l.name = (o.name || 'PARCA') + '__KENAR'; l.raycast = () => {};
    l.userData = { katman: PARCA_ETIKET[c.part] || 'ic', kenar26: true, assemblyOwner: c.id, ist: c.id };
    ekle.push([o, l]); say[c.id] = (say[c.id] || 0) + 1;
  });
  for (const [o, l] of ekle) o.add(l);
  return IKIZ.kenar26 = say;
}
