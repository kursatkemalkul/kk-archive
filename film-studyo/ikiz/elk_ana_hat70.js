// ELK ANA HAT 70 (YÖNETİCİ 21 Eki): eski ELK_ANA_HAT (UF ana panosundan dağılan, K/TOP sacını delen, öne çıkan hat) makine
// ile duvar ayırıcısına giden eski besleme YALNIZ GÖRSEL olarak kalkar (veri/PLC dokunulmaz; ayırıcı cihazı kalır).
// 1 Kas: buradaki zemin kabloları + robot zemin yakası silindi; kablo yolu zemin70.js ELK_KANAL_AGI.

const MAKINE_X = [0.70, 5.30];
const ESKI = /^ELK_ANA_HAT__(?!ayirici)/;

export function anaHat70Kur(IKIZ) {
  const T = IKIZ.sahne.THREE, sahne = IKIZ.sahne.scene;
  const durum = IKIZ.anaHat70 = {kaldirilan: []};
  const kaldir = () => {
    sahne.updateMatrixWorld(true);
    sahne.traverse(o => {
      const ad = o.userData?.assemblySourceName || o.name || '';
      if (!o.isMesh || !ESKI.test(ad) || o.userData.anaHat70Kaldirildi || !o.visible) return;
      const b = new T.Box3().setFromObject(o);
      if (b.isEmpty() || b.max.x < MAKINE_X[0] - 0.05) return;   // bina beslemesi artık E giriş plakasından alttan; ayırıcı cihazı kalır
      o.visible = false; o.userData.anaHat70Kaldirildi = true; durum.kaldirilan.push(o.name);
    });
  };
  // 1 Kas: ELK_ANA_HAT70 zemin kabloları ve robot zemin yakası kaldırıldı; kablo yolu zemin70.js ELK_KANAL_AGI.
  kaldir();
  let son = 0; IKIZ.kancalar.push(() => { const t = performance.now(); if (t - son > 3000) { son = t; kaldir(); } });   // geç yüklenen parçalar
  return durum;
}

const bekle = () => window.IKIZ?.sahne?.scene && window.IKIZ.kancalar ? anaHat70Kur(window.IKIZ) : setTimeout(bekle, 500);
if (typeof window !== 'undefined' && !window.__anaHat70Kuru && new URLSearchParams(location.search).get('anahat') !== 'eski') bekle();
