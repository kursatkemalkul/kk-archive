/* İKİZ · KOD PANELİ (K-E-KODPANEL-6 · K12, 10 Eki) — solda dar 'KOD' şeridi (8 istasyon) + kod penceresi (ST kaynağı + son 50 komut) + 3B'de komut alan düğüm 0,6 s turuncu.
   VERİ: `ikiz/kod` (programın komut akışı, olay günlüğüne GİRMEZ — G/Ç K-E-KODPANEL-2/3). Konu henüz yayınlanmıyorsa aynı satırlar `ikiz/durum` karelerindeki
   DEĞİŞİMDEN türetilir (DO ← 0/1 · eksen hareket başladı / vardı): bunlar da programın gerçek çıkışı, uydurma değil; satırın başında [durum] etiketi.
   ST kaynağı köprüden salt okunur: /program/st/<dosya>.st (başlatıcının program kopyası). Duraklatınca (çerçeve gelmez) panel donar. */
const ISTASYON = [
  ['TOP·A', /(_TOP_|_A_|^AX_A|^DO_A)/], ['F', /(_F_|^AX_F|^DO_F)/], ['K', /(_K_|^AX_K|^DO_K)/], ['E', /(_E_|^AX_E|^DO_E)/],
  ['B', /(_B_|^AX_B)/], ['ROBOT', /(_ROB|^AX_ROB|^DO_ROB)/], ['QR', /(_QR_|^DO_QR|^DI_QR)/], ['HAT', /.*/],
];
const istBul = ad => (ISTASYON.find(([, r]) => r.test(ad)) || ISTASYON[7])[0];

export function kodPanelKur({ THREE, IKIZ, E, kok, kontrolEkle }) {
  const kayit = Object.fromEntries(ISTASYON.map(([a]) => [a, []]));      // istasyon → son 50 satır
  let ikizKodVar = false, onceki = null, hareket = {}, acikIst = null, stOnbellek = {}, stListe = null;
  const css = document.createElement('style');
  css.textContent = `#kodSerit{position:absolute;z-index:6;left:0;top:212px;bottom:96px;width:44px;display:flex;flex-direction:column;gap:3px;padding:4px 3px;background:#111418cc;border-right:1px solid #2a2f36;overflow:hidden;transition:width .15s}
#kodSerit:hover{width:420px}
#kodSerit .kb{display:flex;align-items:center;gap:8px;min-height:30px;border:1px solid #2a2f36;border-radius:7px;background:#1a1e24;color:#d9dde2;font:600 11px system-ui;cursor:pointer;padding:0 6px;white-space:nowrap;overflow:hidden;text-align:left}
#kodSerit .kb b{flex:0 0 30px;text-align:center;font-size:10.5px}#kodSerit .kb span{font:500 11px ui-monospace,Consolas,monospace;color:#9aa4ae;overflow:hidden;text-overflow:ellipsis}
#kodSerit .kb.yeni{border-color:#f08a24;box-shadow:0 0 0 2px #f08a2455}
#kodSerit .bas{font:800 10px system-ui;letter-spacing:.12em;color:#f08a24;text-align:center;padding:3px 0}
#kodPencere{position:absolute;z-index:20;left:52px;top:212px;width:640px;height:480px;display:none;grid-template-columns:1.25fr 1fr;grid-template-rows:auto 1fr;background:#0f1215;border:1px solid #2f353d;border-radius:10px;box-shadow:0 12px 40px #000a;color:#d9dde2;overflow:hidden}
#kodPencere.ac{display:grid}#kodPencere{grid-template-rows:auto auto 1fr!important}#kodAktif{grid-column:1/3;padding:5px 12px;border-bottom:1px solid #2f353d;font:600 11px ui-monospace,Consolas,monospace;color:#7fe0a8;min-height:18px;white-space:normal}#kodAktif b{color:#d9dde2;font-weight:700;margin-right:6px}#kodAktif i{font-style:normal;display:inline-block;margin:0 10px 2px 0;padding:1px 6px;border:1px solid #2e6b4a;border-radius:5px;background:#12301f}#kodPencere pre .aktif{background:#2ee66b30;display:block;box-shadow:inset 3px 0 0 #2ee66b}#kodSerit .kb em{font-style:normal;margin-left:auto;min-width:16px;text-align:center;border-radius:8px;background:#2ee66b;color:#0b1a12;font:800 10px system-ui;padding:0 4px;display:none}#kodSerit .kb em.var{display:inline-block}#kodPencere .ust{grid-column:1/3;display:flex;justify-content:space-between;align-items:center;padding:8px 12px;border-bottom:1px solid #2f353d;font:700 13px system-ui}
#kodPencere pre{margin:0;overflow:auto;font:11.5px/1.45 ui-monospace,Consolas,monospace;padding:8px 10px;border-right:1px solid #2f353d}#kodPencere pre .vurgu{background:#f08a2440;display:block}
#kodPencere ol{margin:0;padding:6px 10px 6px 26px;overflow:auto;font:11px/1.45 ui-monospace,Consolas,monospace;color:#b9c1ca}#kodPencere ol li.yeni{color:#ffb15c}
#kodPencere button{background:#1d2228;color:#d9dde2;border:1px solid #39414b;border-radius:6px;padding:3px 10px;cursor:pointer}`;
  document.head.append(css);
  const serit = document.createElement('div'); serit.id = 'kodSerit'; serit.innerHTML = '<div class="bas">KOD</div>';
  const btn = {};
  const KISA = { 'TOP·A': 'TOP', ROBOT: 'ROB' };
  for (const [a] of ISTASYON) { const b = document.createElement('button'); b.className = 'kb'; b.dataset.ist = a; b.innerHTML = `<b title="${a}">${KISA[a] || a}</b><span>—</span><em></em>`; b.title = a + ': son komut yok'; b.onclick = () => { pencereAc(a); if (IKIZ.istasyonaGit) IKIZ.istasyonaGit(a); }; /* C E9: kamera da istasyona gider */ serit.append(b); btn[a] = b; }
  const pen = document.createElement('div'); pen.id = 'kodPencere';
  pen.innerHTML = '<div class="ust"><span id="kodBaslik">KOD</span><button id="kodKapat">Kapat ✕</button></div><div id="kodAktif"></div><pre id="kodST">…</pre><ol id="kodOlay"></ol>';
  const sahne = document.getElementById('sahne'); sahne.append(serit, pen);
  const kapat = e => { if (e) { e.preventDefault(); e.stopPropagation(); } pen.classList.remove('ac'); acikIst = null; };
  pen.querySelector('#kodKapat').addEventListener('pointerdown', kapat); pen.querySelector('#kodKapat').onclick = kapat;   // C E13: ilk tıklamada kapanmıyordu → basışta kapanır
  addEventListener('keydown', e => { if (e.key === 'Escape' && pen.classList.contains('ac')) kapat(); });

  /* 3B vurgu: sinyal → ENT eşleme düğümleri (cikis / eksen katkıları) 0,6 s turuncu */
  const sinyalDugum = {};
  for (const tablo of ['cikis', 'eksen']) for (const [ad, v] of Object.entries(E[tablo] || {})) for (const k of v.katkilar || []) for (const n of k.dugumler || []) (sinyalDugum[ad] = sinyalDugum[ad] || []).push(n);
  const yanan = new Map(), TURUNCU = new THREE.Color(0xf08a24);
  function yak(ad) {
    // Robot commands continue updating ROB and the code log. Keep the arm's
    // original materials: repeated axis commands must not light the whole arm.
    if (istBul(ad) === 'ROBOT') return;
    for (const n of sinyalDugum[ad] || []) { const o = kok.getObjectByName(n); if (!o) continue;
      o.traverse(m => { if (!m.isMesh || !m.material) return; if (yanan.has(m)) { yanan.get(m).t = performance.now(); return; } const eski = m.material; const yeni = (Array.isArray(eski) ? eski[0] : eski).clone(); if (yeni.emissive) { yeni.emissive = TURUNCU.clone(); yeni.emissiveIntensity = 0.9; } m.material = yeni; yanan.set(m, { eski, t: performance.now() }); }); }
  }
  setInterval(() => { const t = performance.now(); for (const [m, v] of yanan) if (t - v.t > 600) { m.material = v.eski; yanan.delete(m); } }, 100);

  function satirEkle(ist, metin, sinyal, kaynak) {
    const L = kayit[ist]; L.push({ metin, sinyal, kaynak, t: performance.now() }); if (L.length > 50) L.shift();
    const b = btn[ist]; b.querySelector('span').textContent = metin; b.title = ist + ': ' + metin; b.classList.add('yeni'); setTimeout(() => b.classList.remove('yeni'), 600);
    if (sinyal) yak(sinyal);
    if (acikIst === ist) olayCiz();
    IKIZ.kodSon = { ist, metin, sinyal, kaynak };
  }
  const zs = f => (+f.t || 0).toFixed(1).replace('.', ',') + ' s';
  /* ikiz/kod (G/Ç): {t, istasyon?, sinyal, deger, fb?, adim?, satir?, metin?} */
  function kodMesaji(m) {
    ikizKodVar = true;
    /* G/Ç biçimi (program sim/ikiz.py _kod_olay): {t, ist: TOP|A|F|K|E|B|ROB|QR|HAT, fb, adim, adim_ad, sinyal, komut, hedef / konum / hiz | eski / yeni, st: 'st/FB_X.st:satır', py} */
    const sin = m.sinyal || m.ad || '';
    const ISTK = { TOP: 'TOP·A', A: 'TOP·A', ROB: 'ROBOT' };
    const ist = ISTK[m.ist] || m.ist || m.istasyon || istBul(sin);
    const sayi = v => (typeof v === 'number' ? (Math.abs(v) >= 100 ? v.toFixed(0) : v.toFixed(2)).replace('.', ',') : String(v));
    const deger = m.yeni != null ? `← ${sayi(m.yeni)}` : m.hedef != null ? `hedef ${sayi(m.hedef)}${m.hiz ? ' · hız ' + sayi(m.hiz) : ''}` : m.deger != null ? `← ${sayi(m.deger)}` : '';
    const metin = m.metin || `${zs(m)} · ${m.fb || ist}${m.adim_ad ? ' (' + m.adim_ad + ')' : m.adim != null ? ' adım ' + m.adim : ''} · ${sin}${m.komut ? ' ' + m.komut : ''}${deger ? ' ' + deger : ''}`;
    const st = /^(?:st\/)?([^:]+\.st):(\d+)$/.exec(m.st || '');
    satirEkle(ist, metin, sin, { fb: m.fb, satir: st ? +st[2] : m.satir, dosya: st ? st[1] : m.dosya, adim: m.adim });
  }
  /* yedek: ikiz/durum değişimi (ikiz/kod gelmiyorsa) */
  /* Kemal R22 (10 Eki gece): 'şu an hangi kod neyi aktif ediyor' — programın o anki çıkışları (DO / AO ≠ 0) + hareket eden eksenler, istasyon başına; pencerede ST satırları
     sürekli yeşil, 3B'de düğüm aktif kaldıkça turuncu (0,6 s yanıp sönme değil). Kaynak her zaman programın ikiz/durum karesi. */
  let aktif = {}, aktifOnce = null, aktifImza = '', sonAktifCiz = 0;
  function aktifGuncelle(f) {
    const A = Object.fromEntries(ISTASYON.map(([a]) => [a, []]));
    for (const [ad, v] of Object.entries(f.cikislar || {})) if (v && v !== '0' && /^(DO|AO)_/.test(ad)) A[istBul(ad)].push({ ad, deger: v });
    for (const [ad, v] of Object.entries(f.eksenler || {})) { const o = aktifOnce && aktifOnce[ad]; if (o != null && Math.abs(v - o) > 0.05) A[istBul(ad)].push({ ad, deger: +v, hareket: true }); }
    aktifOnce = { ...(f.eksenler || {}) }; aktif = A; IKIZ.kodAktifSon = { t: f.t, A };
    const n = performance.now(); if (n - sonAktifCiz < 250) return; sonAktifCiz = n;
    for (const [ist, L] of Object.entries(A)) { if (ist === acikIst) L.filter(x => !/ISITICI|FAN|LAMBA/.test(x.ad)).forEach(x => yak(x.ad)); const em = btn[ist] && btn[ist].querySelector('em'); if (em) { em.textContent = L.length || ''; em.classList.toggle('var', L.length > 0); } }
    if (acikIst) aktifCiz();
  }
  function aktifCiz() {
    const L = aktif[acikIst] || [], d = pen.querySelector('#kodAktif'), sayi = v => typeof v === 'number' ? (Math.abs(v) >= 100 ? v.toFixed(0) : v.toFixed(1)).replace('.', ',') : String(v);
    d.innerHTML = '<b>ŞU AN AKTİF</b>' + (L.length ? L.map(x => `<i>${x.ad}${x.hareket ? ' → ' + sayi(x.deger) : x.deger === true || x.deger === 1 ? '' : ' = ' + sayi(x.deger)}</i>`).join('') : '<span style="color:#7d8792">— (bu istasyonda açık çıkış / hareket eden eksen yok)</span>');
    IKIZ.kodAktifCizilen = { ist: acikIst, t: (IKIZ.kodAktifSon || {}).t, ads: L.map(x => x.ad), cikislar: { ...((IKIZ.son || {}).cikislar || {}) } };
    const imza = L.map(x => x.ad).join(','); if (imza !== aktifImza) { aktifImza = imza; stCiz(); }
  }
  function durumKaresi(f) {
    if (f) aktifGuncelle(f);
    if (ikizKodVar || !f) return;
    if (onceki) {
      for (const [ad, v] of Object.entries(f.cikislar || {})) if (onceki.cikislar && onceki.cikislar[ad] !== undefined && onceki.cikislar[ad] !== v) satirEkle(istBul(ad), `[durum] ${zs(f)} · ${ad} ← ${v}`, ad);
      for (const [ad, v] of Object.entries(f.eksenler || {})) {
        const o = (onceki.eksenler || {})[ad]; if (o == null) continue; const h = Math.abs(v - o) > 0.05, a = hareket[ad];
        if (h && !a) { hareket[ad] = true; satirEkle(istBul(ad), `[durum] ${zs(f)} · ${ad} hareket başladı (${o.toFixed(1)} → …)`, ad); }
        else if (!h && a) { hareket[ad] = false; satirEkle(istBul(ad), `[durum] ${zs(f)} · ${ad} vardı ${v.toFixed(1)}`, ad); }
      }
    }
    onceki = { cikislar: { ...(f.cikislar || {}) }, eksenler: { ...(f.eksenler || {}) } };
  }
  /* ST kaynağı: programın kod_harita.json'u (G/Ç uret_kod_harita.py: FB → istasyon, st_dosya, cikis_st / adim_st satırları) — tek kaynak; harita yoksa eski tek dosya */
  let harita;
  const IST_KOD = { 'TOP·A': 'TOP', ROBOT: 'ROB' };
  async function haritaAl() { if (harita === undefined) { try { harita = (await (await fetch('/program/st/kod_harita.json')).json()).fb || null; } catch (e) { harita = null; } } return harita; }
  async function stDosya(ist) {
    if (!stListe) { try { stListe = await (await fetch('/program/st/liste.json')).json(); } catch (e) { stListe = []; } }
    const H = await haritaAl(), k = IST_KOD[ist] || ist;
    const fb = H ? Object.values(H).find(v => (v.ist || []).includes(k)) : null;
    const eski = { 'TOP·A': 'FB_Istasyonlar.st', F: 'FB_Istasyonlar.st', K: 'FB_Istasyonlar.st', E: 'FB_Istasyonlar.st', B: 'FB_Dolum.st', ROBOT: 'FB_Hat.st', QR: 'FB_Hat.st', HAT: 'FB_Hat.st' }[ist];
    const dosya = fb ? fb.st_dosya.split('/').pop() : (stListe.includes('FB_Hat.st') && !stListe.includes(eski) ? 'FB_Hat.st' : eski);
    if (!stOnbellek[dosya]) { try { stOnbellek[dosya] = await (await fetch('/program/st/' + dosya)).text(); } catch (e) { stOnbellek[dosya] = '(ST kaynağı okunamadı)'; } }
    return { dosya, metin: stOnbellek[dosya], fb };
  }
  async function pencereAc(ist) {
    acikIst = ist; aktifImza = null; pen.classList.add('ac'); aktifCiz(); pen.querySelector('#kodBaslik').textContent = `KOD · ${ist}${ikizKodVar ? '' : ' · (ikiz/kod bekleniyor — satırlar ikiz/durum değişiminden)'}`;
    olayCiz(); await stCiz();
  }
  async function stCiz() {
    if (!acikIst) return; const son = kayit[acikIst][kayit[acikIst].length - 1]; let { dosya, metin, fb } = await stDosya(acikIst);
    if (son && son.kaynak && son.kaynak.dosya && son.kaynak.dosya !== dosya) {                            // programın bildirdiği ST dosyası (ikiz/kod.st)
      dosya = son.kaynak.dosya; if (!stOnbellek[dosya]) { try { stOnbellek[dosya] = await (await fetch('/program/st/' + dosya)).text(); } catch (e) { stOnbellek[dosya] = '(ST kaynağı okunamadı)'; } } metin = stOnbellek[dosya]; }
    const satirlar = metin.split('\n'); let vur = -1;
    if (son && son.kaynak && son.kaynak.satir) vur = son.kaynak.satir - 1;
    else if (son && son.sinyal && fb && fb.cikis_st && fb.cikis_st[son.sinyal]) vur = fb.cikis_st[son.sinyal] - 1;            // kod_harita: çıkışın ST satırı
    else if (son && son.kaynak && son.kaynak.adim != null && fb && fb.adim_st && fb.adim_st[son.kaynak.adim]) vur = fb.adim_st[son.kaynak.adim] - 1;
    else if (son && son.sinyal) vur = satirlar.findIndex(l => l.includes(son.sinyal));
    if (vur < 0 && fb && fb.adim_st && Object.keys(fb.adim_st).length) vur = Math.min(...Object.values(fb.adim_st)) - 1;   // eksen satırı vb.: FB'nin adım makinesi başı
    const aktifSatir = new Set(); for (const x of aktif[acikIst] || []) { const sat = fb && fb.cikis_st && fb.cikis_st[x.ad]; if (sat) aktifSatir.add(sat - 1); else { const j = satirlar.findIndex(l => l.includes(x.ad)); if (j >= 0) aktifSatir.add(j); } }
    if (vur < 0 && aktifSatir.size) vur = Math.min(...aktifSatir);
    const pre = pen.querySelector('#kodST'); pre.innerHTML = '';
    const bas = Math.max(0, vur - 14), bit = Math.min(satirlar.length, vur < 0 ? 60 : vur + 30);
    pre.append(document.createTextNode(`// ${dosya} — satır ${bas + 1}…${bit}\n`));
    for (let i = bas; i < bit; i++) { const sp = document.createElement('span'); sp.textContent = String(i + 1).padStart(4) + '  ' + satirlar[i] + '\n'; if (i === vur) sp.className = 'vurgu'; else if (aktifSatir.has(i)) sp.className = 'aktif'; pre.append(sp); }
    IKIZ.kodVurgu = { dosya, satir: vur + 1, aktif: [...aktifSatir].map(i => i + 1).sort((a, b) => a - b), gorunen_aktif: [...aktifSatir].filter(i => i >= bas && i < bit).length };
  }
  function olayCiz() {
    const ol = pen.querySelector('#kodOlay'); ol.innerHTML = ''; const L = kayit[acikIst] || [];
    L.slice().reverse().forEach((x, i) => { const li = document.createElement('li'); li.textContent = x.metin; if (i === 0) li.className = 'yeni'; ol.append(li); });
    stCiz();
  }
  IKIZ.kodPanel = { kayit, pencereAc, ikizKod: () => ikizKodVar, aktif: () => aktif };
  return { kodMesaji, durumKaresi };
}
