// YIKAMA İSTASYONU 24 (Kemal 24 Eki gece, istek listesi madde 6): makinedeki sistem — menteşe makinedeki gibi PİNET PİYANO
// (T70 üst kanatlarının 3'er EMKA menteşesi ve kimyasal kapağın gizli burç-pim menteşesi yerine; kanat ekseni ve açılış aynı),
// iskelet / sac / kapak / iç sistem katmanları açık etiketle (Katmanlar panelinde 'YIKAMA' satırının sac / kapak / şasi / iç seçenekleri).
// Yerine T70 kanatları konmuş, gizli duran eski üst dolap / karton kapakları (4 kanat, 68 parça) sahneden silinir.
import { MALZEME_AD } from './katmanlar.js';
export function yikama24(T, IKIZ, scene) {
  const root = scene.getObjectByName('DUKKAN__YIKAMA_ISTASYONU'); if (!root) return null;
  const rap = IKIZ.yikama24 = { silinen: 0, mentese: [], etiket: {} };
  const pas = new T.MeshStandardMaterial({ color: 0xc9cdd1, metalness: .35, roughness: .42 }); pas.userData.gercekRenk = true;
  root.updateMatrixWorld(true);
  // ---- 1) gizli eski kapaklar (T70 kanatları onların yerinde)
  for (const n of ['YIKAMA__UST_SOL_KAPAK', 'YIKAMA__UST_SAG_KAPAK', 'YIKAMA__KARTON_SOL_KAPAK', 'YIKAMA__KARTON_SAG_KAPAK']) {
    const o = root.getObjectByName(n); if (o && !o.visible) { o.traverse(x => { if (x.isMesh) { rap.silinen++; x.geometry.dispose(); } }); o.removeFromParent(); } }
  // gizli eski kapaklara ait gövde tarafı menteşe / tutucu parçaları (adı silinen kanatla başlayan, kendi başına gizli)
  { const sil = []; root.traverse(o => { if (o.isMesh && /^YIKAMA__(UST|KARTON)_(SOL|SAG)_KAPAK_/.test(o.name)) { let g = false; for (let p = o; p; p = p.parent) if (!p.visible) g = true; if (g) sil.push(o); } });
    for (const o of sil) { o.removeFromParent(); o.geometry.dispose(); rap.silinen++; } }
  // ---- 2) menteşe: Pinet piyano (2 mm paslanmaz, 20 + 20 mm kanat, boy = kapak − 2 × 10 mm); gövde kanadı sabit, kapak kanadı kapakla döner
  const MENTESE_ESKI = /(_EMKA(_\d+)?$|SABIT_GIZLI_MENTESE|HAREKETLI_GIZLI_MENTESE|MENTESE_PIM|PIM_ESIR|KANAT_BAGI|SABIT_MENTESE_KOK|EPDM_ESIR_MIL)/;
  const b = new T.Box3(), v = new T.Vector3();
  const ESKI_PARCA = { T70_KANAT_SOL: /^YIKAMA__(T70_KANAT_SOL_EMKA_1031|T70_EMKA_1031-U36_GOVDE_SOL)/, T70_KANAT_SAG: /^YIKAMA__(T70_KANAT_SAG_EMKA_1031|T70_EMKA_1031-U37_GOVDE_SAG)/ };   // EMKA 1031-U36 / U37 (kapak + gövde parçası)
  for (const [ad, yan] of [['YIKAMA__T70_KANAT_SOL', 1], ['YIKAMA__T70_KANAT_SAG', -1], ['YIKAMA__KIMYASAL_KAPAK', 1]]) {
    const kanat = root.getObjectByName(ad); if (!kanat) continue;
    const kok = ad.replace('YIKAMA__', ''), sil = [];
    root.traverse(o => { if (o.isMesh && !/CONTA/.test(o.name) && (ESKI_PARCA[kok] ? ESKI_PARCA[kok].test(o.name) : o.name.startsWith('YIKAMA__' + kok) && MENTESE_ESKI.test(o.name))) sil.push(o); });
    for (const o of sil) { o.removeFromParent(); o.geometry.dispose(); }
    kanat.updateMatrixWorld(true); b.setFromObject(kanat);
    const ya = b.min.y + .010, yb = b.max.y - .010, kal = b.max.z - b.min.z;   // kapak kalınlığı (kapalı)
    const eksen = kanat.getWorldPosition(v).clone();                            // kanat ekseni (dünya)
    // kapak kanadı (kanatla döner): kanat yerelinde eksenden içeri 20 mm, kapağın iç yüzünde
    const hareketli = new T.Mesh(new T.BoxGeometry(.020, yb - ya, .002), pas); hareketli.name = 'YIKAMA__' + kok + '_PINET_PIYANO_KANAT';
    { const p = new T.Vector3(eksen.x + yan * .010, (ya + yb) / 2, b.min.z + kal + .001); kanat.worldToLocal(p); hareketli.position.copy(p); kanat.add(hareketli); }
    // gövde kanadı (sabit): dikmenin ön yüzünde
    const sabit = new T.Mesh(new T.BoxGeometry(.020, yb - ya, .002), pas); sabit.name = 'YIKAMA__' + kok + '_PINET_PIYANO_GOVDE';
    { const p = new T.Vector3(eksen.x + yan * .010, (ya + yb) / 2, b.min.z + kal + .003); root.worldToLocal(p); sabit.position.copy(p); root.add(sabit); }   // iki kanat da eksenden içeri: gövde kanadı kapak kanadının arkasında
    // menteşe mili (pim) ekseni boyunca
    const pim = new T.Mesh(new T.CylinderGeometry(.002, .002, yb - ya, 12), pas); pim.name = 'YIKAMA__' + kok + '_PINET_PIYANO_PIM';
    { const p = new T.Vector3(eksen.x, (ya + yb) / 2, b.min.z + kal + .001); root.worldToLocal(p); pim.position.copy(p); root.add(pim); }
    for (const o of [hareketli, sabit, pim]) o.userData = { katman: 'kapak', menteşe: 'Pinet piyano' };
    rap.mentese.push({ kapak: kok, eski_parca_silinen: sil.length, eksen: [eksen.x, eksen.z].map(x => +x.toFixed(3)), boy_mm: Math.round((yb - ya) * 1000) });
  }
  // ---- 3) katman etiketleri (en yakın ata kazanır — yalnız mesh üzerine yazılır)
  const KURAL = [
    [/^(ALT_DIKME|UST_DIKME|T70_DIKME)/, 'sasi', { iskelet: 'ana' }],
    [/(TASIYICI|RHS|ZEMIN_ANKRAJ)/, 'sasi', { iskelet: 'ara' }],
    [/(YAN_SAC|CATI_SAC|TABAN_SAC|TEK_BUKUM_6|ARKA_SOKULUR_SAC|TEZGAH_TEK_SAC|KARTON_UST_SAC|UST_BOLME|AYIRICI_YAN_BUKUM|AYIRICI_MONTAJ_BAGI|KIMYASAL_(SOL|ARKA)_AYIRICI)/, 'sac', {}],
  ];
  const kanatIc = o => { for (let p = o; p && p !== root; p = p.parent) if (p.userData && p.userData.kapakIstasyon) return p.name; return null; };
  root.traverse(o => {
    if (!o.isMesh) return; const n = o.name.replace(/^YIKAMA__/, ''), k = kanatIc(o);
    for (let p = o; p && p !== root; p = p.parent) if (MALZEME_AD.test(p.name || '')) return;   // kimyasal, kâğıt, eldiven: malzeme katmanında kalır
    let katman = 'ic', ek = {};
    if (k && !/UL_KAPAK|MEIKO/.test(k)) katman = 'kapak';
    else if (o.userData.katman === 'kapak') katman = 'kapak';
    else for (const [re, kt, e] of KURAL) if (re.test(n)) { katman = kt; ek = e; break; }
    if (katman === 'ic') { if (/(SIEMENS|SENSOR|AYIRICI_KUTU|KABLO|PRIZ)/.test(n)) ek = { renkSinif: 'elektrik' }; else if (/(_M\d|SOMUN|PUL|CIVATA|KELEPCE|VIDA)/.test(n)) ek = { renkSinif: 'vida' }; }
    o.userData.katman = katman; Object.assign(o.userData, ek); rap.etiket[katman] = (rap.etiket[katman] || 0) + 1;
  });
  return rap;
}
