// KENAR ÇİZGİSİ YOK 32 (Kemal 1 Kas 2026: "bazı şeylerin turuncu çizgileri olmuş, corner line'ları sil, tüm corner line'ları kaldır,
// sahneyi temizle"): sahnedeki bütün kenar çizgileri (kenar26 __KENAR, QR / dükkân / makine EdgesGeometry, YM_ çizgi birleşimleri,
// duvar köşe çizgisi) gizlenmez, SİLİNİR. Turuncu: kenar26 tek ortak malzeme kullanıyordu, dukkan_temiz29 bir çizgiyi boyayınca hepsi boyandı.
// Yalnız LineSegments silinir; kablo / boru izi (THREE.Line) kalır. Dükkân yapısı 31 en son kurulduğu için bir kez daha süpürülür.
export function kenarSil32(scene, IKIZ) {
  const sil = () => {
    const liste = []; scene.traverse(o => { if (o.isLineSegments) liste.push(o); });
    for (const o of liste) { o.removeFromParent(); o.geometry?.dispose(); }
    const d = IKIZ.kenarSil32 || (IKIZ.kenarSil32 = { silinen: 0, tur: 0 }); d.silinen += liste.length; d.tur++;
    IKIZ.katmanlar?.scan?.(); return liste.length;
  };
  sil();
  const bekle = () => { if (document.documentElement.dataset.dukkanYapi31 === 'ready') { sil(); IKIZ.kenarSil32.bitti = true; } else setTimeout(bekle, 200); };
  bekle();
  return IKIZ.kenarSil32;
}
