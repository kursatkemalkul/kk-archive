/* AUTOKITCH · TABLET · MAKİNE MODU sekmeleri (7 Eki 2026): DURUM · DOLDUR · STOK (stok / tahmin / sayım / satın alma) · SERVİS · TEMİZLİK · ALARMLAR · AÇILIŞ-KAPANIŞ · GÜN.
   app.js'in TBA nesnesine takılır. Veri: HMI /api/tablet (+ /plan /servis /alarm /tahmin /sayim /rapor), komutlar TB.komut (PIN + rol). */
(function () {
  'use strict';
  const { h, bos, bildir, modal } = AK;
  const { ST, SEK, kart, rozet, dug, alan, giris, f } = TBA;
  const F = (ST.form = ST.form || {});
  const ISTAD = { TOP: 'TOPPING kasetleri', E: 'E kutu şarjörü', K: 'K yağ tenekesi', B: 'B çekmeceleri', U: 'U üst depo' };
  const ISTKART = { B: 'B · Dolap', A: 'A · Açıcı', TOP: 'TOPPING', F: 'F · Fırın', K: 'K · Kesme', E: 'E · Kutu', ROB: 'Robot', QR: 'QR dolabı' };
  const fg = (ad, o) => giris(Object.assign({ value: F[ad] ?? '', oninput: e => { F[ad] = e.target.value; } }, o || {}));      // form girişi (yenilemede değer kaybolmaz)
  const sec = (ad, secenekler, vars) => { const s = h('select', { sinif: 'ak-giris', onchange: e => { F[ad] = e.target.value; } }, secenekler.map(x => h('option', { value: Array.isArray(x) ? x[0] : x, metin: Array.isArray(x) ? x[1] : x }))); s.value = F[ad] ?? vars ?? (Array.isArray(secenekler[0]) ? secenekler[0][0] : secenekler[0]); F[ad] = s.value; return s; };
  const komutla = (en_az, tip, k, mesaj, baslik) => TBA.islem(en_az, async () => { const v = await TB.komut(tip, k); if (mesaj) bildir(typeof mesaj === 'function' ? mesaj(v) : mesaj); return v; }, baslik);
  /* EMNİYET (A+B R26): çekmece KAPANMA yalnız düğme BASILI TUTULDUKÇA; ~0,2 s'de bir kalp atışı (basili:true); bırakınca / parmak kayınca / ekran donunca atış kesilir, makine durur. Açma tek dokunuş. */
  TBA.basiliKapat = function (cd, etiket, kapaliMi) {
    let tm = null; const el = h('button', { type: 'button', sinif: 'uyari', 'data-basili-kapat': cd, metin: etiket || '✋ BASILI TUTUN — çekmece kapanır' });
    const at = () => { try { const p = TB.komut('dolum.cekmece', { istasyon: 'B', cekmece: cd, ac: false, basili: true }); if (p && p.catch) p.catch(e => TBA.hata(e)); } catch (e) { TBA.hata(e); } };
    const dur = () => { if (tm) { clearInterval(tm); tm = null; el.classList.remove('on'); } };
    const bas = ev => { if (ev && ev.preventDefault) ev.preventDefault(); if (tm) return; el.classList.add('on'); at(); tm = setInterval(() => { if (kapaliMi && kapaliMi()) dur(); else at(); }, 200); };
    ['pointerup', 'pointerleave', 'pointercancel', 'blur', 'contextmenu'].forEach(o => el.addEventListener(o, dur));
    el.addEventListener('pointerdown', bas);
    el.addEventListener('keydown', e => { if (e.key === ' ' || e.key === 'Enter') bas(e); }); el.addEventListener('keyup', dur);
    return el;
  };
  const girisKarti = (baslik, metin, en_az) => kart(baslik, h('p', { metin }), dug('PIN ile giriş', 'ana', async () => { await TB.pinSor(en_az || 'personel'); TBA.ciz(); }));
  const liste = (kap, ad, baslik, en_az) => {
    const L = ST.D[ad] || [], yap = L.filter(x => x.yapildi).length;
    return kart(baslik + ' · ' + yap + '/' + L.length, L.map((x, i) => h('label', { sinif: 'tb-adim ' + (x.yapildi ? 'bitti' : ''), stil: { cursor: 'pointer' } },
      h('input', { type: 'checkbox', checked: x.yapildi, disabled: x.yapildi, stil: { width: '28px', height: '28px', flex: '0 0 28px' }, onchange: () => komutla(en_az || 'personel', ad === 'temizlik' ? 'temizlik.isaretle' : 'kontrol.isaretle', ad === 'temizlik' ? { madde: x.madde } : { liste: ad, madde: x.madde }) }),
      h('div', {}, h('b', { metin: x.madde }), x.kim ? h('div', { sinif: 'tb-mini', metin: x.kim }) : null))));
  };

  /* ================================================================ GÜÇ KESİNTİSİ KURTARMA (ARAYUZ §13) */
  const kurtarmaKarti = K => {
    const bolgeAd = { TABLA: 'Hamur tablası', F: 'Fırın içi', K: 'K kesme', E: 'E kutu', ROBOT: 'Robot eli' };
    const bol = Object.entries(K.bolgeler || {}).map(([b, z]) => {
      const n = (z.kayit || []).length;
      const kayit = n ? h('div', { sinif: 'tb-mini', metin: 'Kayıtlı: ' + z.kayit.map(x => x.siparis_id + ' · ' + x.tarif).join(', ') }) : null;
      if (z.durum === 'SORU') return h('div', { sinif: 'ak-ipucu uyari' }, h('b', { metin: (bolgeAd[b] || b) + ': ' }), z.soru, kayit, h('div', { sinif: 'tb-yatay' },
        dug('VAR', 'tehlike', () => komutla('personel', 'kurtarma.cevap', { bolge: b, var: true }, 'Not alındı')), dug('YOK', 'ana', () => komutla('personel', 'kurtarma.cevap', { bolge: b, var: false }, 'Tamam'))));
      if (z.durum === 'BOSALT') { const adet = giris({ type: 'number', min: 0, value: n, id: 'kurtN' + b, stil: { width: '90px' } });
        return h('div', { sinif: 'ak-ipucu kotu' }, h('b', { metin: (bolgeAd[b] || b) + ': ' }), 'Ürünü ve kutuyu çıkarın, atın (' + (z.neden || '') + ')', kayit,
          h('div', { sinif: 'tb-yatay' }, alan('Attığınız ürün sayısı', adet), dug('Çıkardım, attım', 'ana', () => komutla('personel', 'kurtarma.bosaltildi', { bolge: b, urun: +adet.value }, 'Kaydedildi')))); }
      return h('div', { sinif: 'ak-ipucu iyi' }, h('b', { metin: (bolgeAd[b] || b) + ': ' }), 'tamam');
    });
    const mesaj = (K.mesajlar || []).slice(-8).map(m => h('div', { sinif: 'tb-mini', metin: m.saat + ' · ' + m.metin }));
    return kart('GÜÇ KESİNTİSİ KURTARMASI' + (K.kesinti_s != null ? ' · kesinti ' + Math.round(K.kesinti_s / 60) + ' dk' : ''),
      h('p', { sinif: 'tb-mini', metin: 'Makine güvenli duruşa alınıyor, eksenler referanslanıyor. Sensörü olmayan bölgeler için aşağıdaki soruları yanıtlayın; yarım ürün güvenlik gereği ATILIR ve yeniden üretilir.' }),
      !K.referans ? h('div', { sinif: 'ak-ipucu uyari', metin: 'Referans sürüyor… (TwinSAFE reset gerekirse mavi butona basın, hücre kapısı kapalı olmalı)' }) : null,
      K.bekle ? h('div', { sinif: 'ak-ipucu kotu' }, h('b', { metin: 'Bekleniyor: ' }), K.bekle.mesaj || K.bekle.neden, K.bekle.adim ? dug('Elle yaptım, devam', 'ana', () => komutla('personel', 'kurtarma.manuel_tamam', { adim: K.bekle.adim }, 'Devam')) : null) : null,
      ...bol, ...mesaj, K.zayi && K.zayi.length ? h('div', { sinif: 'tb-mini', metin: 'Zayi kaydı: ' + K.zayi.length + ' ürün' }) : null);
  };


  /* ================================================================ TOPPING DOLULUK (YÖNETİCİ + SERVİS) — TOPPING makinesine benzeyen önden görünüş
     7 kaset / UNO yan yana (io_tablosu soldan sağa); renkli dolgu yüksekliği = kalan gram / kapasite. Veri: D.topping (ikiz.durum.topping: program kalan gram = dolum gramı − gerçekte akan gram).
     Sarı = kalan ≤ ≈ 1 saatlik tüketim · kırmızı = bitti ya da kaset yok → "DOLDUR" düğmesi tedarik turuna götürür. */
  const TOP_SIRA = ['HARC', 'SOS', 'KIYMA', 'KUSBASI', 'KASAR', 'SUCUK', 'KIYMA_ORTA'];
  const TOP_AD = { HARC: 'Harç', SOS: 'Sos · patates', KIYMA: 'Tavuk', KUSBASI: 'Kuşbaşı', KASAR: 'Kaşar', SUCUK: 'Sucuk', KIYMA_ORTA: 'Kıyma' };
  const TOP_TIP = { HARC: 'UNO', SOS: 'UNO', KIYMA: 'UNO', KUSBASI: 'UNO', KASAR: 'helezon', SUCUK: 'helezon', KIYMA_ORTA: 'UNO' };
  (function () {
    if (document.getElementById('tb-top-css')) return;
    const st = document.createElement('style'); st.id = 'tb-top-css';
    st.textContent = '.tb-topd{display:flex;gap:8px;align-items:stretch;padding:12px 10px 10px;border:2px solid var(--ak-cizgi);border-radius:18px;background:var(--ak-zemin2)}'
      + '.tb-topd .k{flex:1 1 0;min-width:0;display:flex;flex-direction:column;align-items:center;gap:6px}'
      + '.tb-topd .kap{position:relative;width:100%;height:150px;border:2px solid var(--ak-yazi2);border-radius:8px 8px 14px 14px;background:var(--ak-kart);overflow:hidden}'
      + '.tb-topd .dol{position:absolute;left:0;right:0;bottom:0;background:var(--ak-iyi);opacity:.85;transition:height .6s}'
      + '.tb-topd .k.SARI .dol{background:var(--ak-uyari)}.tb-topd .k.BOS .dol,.tb-topd .k.YOK .dol{background:var(--ak-kotu)}'
      + '.tb-topd .yuz{position:absolute;top:6px;left:0;right:0;text-align:center;font-weight:700;font-size:1.05em;color:var(--ak-yazi);text-shadow:0 0 4px var(--ak-kart)}'
      + '.tb-topd .nozul{width:26%;height:14px;border-radius:0 0 8px 8px;background:var(--ak-yazi2)}'
      + '.tb-topd b{font-size:.92em;text-align:center}.tb-topd .m{font-size:.78em;line-height:1.3;text-align:center;color:var(--ak-yazi2)}'
      + '.tb-topd .k.SARI .m{color:var(--ak-uyari);font-weight:600}.tb-topd .k.BOS .m,.tb-topd .k.YOK .m{color:var(--ak-kotu);font-weight:600}'
      + '.tb-topd .rayi{margin-top:auto;width:100%;display:flex;flex-direction:column;gap:4px;align-items:stretch}';
    document.head.append(st);
  })();
  TBA.toppingKarti = function (D, baslikEk) {
    const T = (D && D.topping) || {};
    if (!Object.keys(T).length) return kart('TOPPING DOLULUK', h('p', { sinif: 'tb-mini', metin: 'Kaset verisi henüz gelmedi.' }));
    const sutun = TOP_SIRA.filter(k => T[k]).map(k => {
      const v = T[k], kirmizi = v.durum === 'BOS' || v.durum === 'YOK';
      const yazi = v.durum === 'YOK' ? 'kaset takılı değil' : 'kalan ' + (v.kalan_kg >= 10 ? v.kalan_kg.toFixed(1) : v.kalan_kg.toFixed(2)).replace('.', ',') + ' kg · ' + v.doz + ' doz · ≈ ' + (v.saat >= 10 ? Math.round(v.saat) : String(v.saat).replace('.', ',')) + ' saat';
      return h('div', { sinif: 'k ' + v.durum, 'data-kaset': k },
        h('div', { sinif: 'nozul' }),
        h('div', { sinif: 'kap', title: (TOP_AD[k] || k) + ' · ' + v.icerik },
          h('div', { sinif: 'dol', stil: { height: Math.round(v.oran * 100) + '%' } }),
          h('div', { sinif: 'yuz', metin: v.durum === 'YOK' ? '—' : Math.round(v.oran * 100) + '%' })),
        h('b', { metin: TOP_AD[k] || k }),
        h('div', { sinif: 'm', metin: yazi }),
        h('div', { sinif: 'm', metin: TOP_TIP[k] + ' · kapasite ' + (v.kapasite_g / 1000).toFixed(1).replace('.', ',') + ' kg' }),
        kirmizi ? dug('DOLDUR', 'tehlike', () => { ST.sekme.MAKINE = 'tedarik'; TBA.ciz(); }) : null);
    });
    const kirmiziN = TOP_SIRA.filter(k => T[k] && (T[k].durum === 'BOS' || T[k].durum === 'YOK')).length, sariN = TOP_SIRA.filter(k => T[k] && T[k].durum === 'SARI').length;
    return kart('TOPPING DOLULUK' + (baslikEk || ''), h('div', { sinif: 'tb-topd', id: 'top-doluluk' }, sutun),
      h('p', { sinif: 'tb-mini', metin: (kirmiziN ? kirmiziN + ' kaset bitti ya da takılı değil · ' : '') + (sariN ? sariN + ' kaset ≤ 1 saatlik · ' : '') + 'sarı: kalan ≤ ≈ 1 saatlik tüketim · kırmızı: bitti → DOLDUR tedarik turuna gider · kalan = dolumda girilen gram − her dozda gerçekte akan gram' }));
  };

  /* ================================================================ DURUM */
  SEK.MAKINE.durum = function (kap) {
    const D = ST.D; if (!D) { kap.append(kart('', h('p', { metin: 'Makineye bağlanılıyor…' }))); return; }
    if (D.kurtarma && D.kurtarma.aktif) kap.append(kurtarmaKarti(D.kurtarma));
    else if (D.kurtarma && D.kurtarma.bitti) kap.append(kart('Güç kesintisi kurtarması bitti', h('p', { metin: 'Atılan ürün ' + D.kurtarma.bitti.zayi + ' · yeniden üretilecek ' + D.kurtarma.bitti.yeniden + ' · iade ' + ((D.kurtarma.bitti.iade || []).length) + ((D.kurtarma.bitti.qr_asilan || []).length ? ' · süresi aşılan QR gözü: ' + D.kurtarma.bitti.qr_asilan.join(', ') : '') })));
    const onay = (D.oneriler || []).filter(o => o.durum === 'BEKLIYOR').length;
    kap.append(h('div', { sinif: 'tb-kpi' }, [[D.kuyruk, 'kuyruktaki sipariş'], [D.wip, 'hatta ürün'], [f(D.firin_c) + '°', 'fırın'], [onay, 'onay bekleyen sipariş']].map(([b, k]) => h('div', {}, h('b', { metin: b }), h('small', { metin: k })))));
    if (D.bekleme) kap.append(h('div', { sinif: 'ak-ipucu uyari', metin: 'Kuyruk başı bekliyor: ' + D.bekleme }));
    const ist = h('div', { sinif: 'tb-ist' }, Object.entries(D.istasyonlar).map(([k, v]) => { const dol = D.dolum[k]; return h('div', { sinif: dol ? 'DOLUM' : v }, h('b', { metin: ISTKART[k] || k }), h('small', { metin: dol ? 'dolum: ' + dol : ({ BOS: 'bekliyor', CALISIYOR: 'çalışıyor', KAPI_ACIK: 'kapak açık', DURDU: 'durdu' })[v] || v })); }));
    const al = D.alarm.length ? D.alarm.map(a => h('div', { sinif: 'ak-ipucu ' + (a.seviye === 'HATA' ? 'kotu' : 'uyari') }, h('b', { metin: a.ad }), ' · ' + a.metin)) : [h('div', { sinif: 'ak-ipucu iyi', metin: 'Alarm yok' })];
    const yuva = kart('Tablet yuvası', h('p', { sinif: 'tb-mini', metin: 'Yuva algılanınca mod kendiliğinden değişir. Algılama yoksa elle bildirin:' }), h('div', { sinif: 'tb-yatay' },
      dug('Makine yuvasına taktım', D.yuva === 'MAKINE' ? 'ana' : '', () => komutla('personel', 'tablet.yuva', { yuva: 'MAKINE' }, 'Makine yuvası')), dug('Satış yuvasına taktım', D.yuva === 'SATIS' ? 'ana' : '', () => komutla('personel', 'tablet.yuva', { yuva: 'SATIS' }, 'Satış yuvası'))));
    kap.append(TBA.toppingKarti(D), h('div', { sinif: 'tb-ark' }));
    kap.append(h('div', { sinif: 'tb-iki' }, kart('İstasyonlar', ist), kart('Alarmlar', ...al, dug('Çözüm adımları', 'kucuk', () => { ST.sekme.MAKINE = 'alarm'; TBA.ciz(); }))), h('div', { sinif: 'tb-ark' }), yuva);
  };

  /* ================================================================ DOLDUR */
  const svgIk = t => ({ ac: '🔓', cikar: '📦', gir: '📥', kapat: '🔒' })[t] || '•';
  SEK.MAKINE.doldur = function (kap) {
    const D = ST.D; if (!D) return;
    const g = D.gorevler || {};
    const dugmeler = h('div', { sinif: 'tb-secim' }, Object.keys(ISTAD).map(k => { const n = (g[k] || []).length, dolum = D.dolum[k];
      return h('button', { type: 'button', sinif: (ST.secili === k ? 'on ' : '') + (n ? 'uyari' : ''), onclick: async () => { ST.secili = k; ST.sayim = {}; ST.plan = null; try { ST.plan = await TB.hmiAl('/api/tablet/plan?ist=' + k); } catch (e) { /* */ } TBA.ciz(); } },
        h('b', { metin: ISTAD[k] }), h('br'), h('small', { metin: (n ? n + ' kalem eksik' : 'yeterli') + (dolum ? ' · ' + dolum : '') })); }));
    kap.append(h('h2', { sinif: 'tb-b', metin: 'Doldurulacak istasyon' }), dugmeler, h('div', { sinif: 'tb-ark' }));
    if (!ST.secili) { kap.append(h('p', { sinif: 'ak-soluk', metin: 'Doldurmak için bir istasyon seçin. Makine yalnız o istasyonu güvenle durdurur; diğerleri çalışmaya devam eder.' })); return; }
    const k = ST.secili, plan = ST.plan;
    // P4a (güvenlik): 'açabilirsiniz' yalnız PROGRAM dolum.iste'yi kabul etti (komut cevabı ok) VE durum.dolum'da istasyon görünüyorsa söylenir. Onay yoksa durum TALEP gibi gösterilir.
    const dOnay = (ST.dolumOnay = ST.dolumOnay || AK.sakla.al('tb.dolumOnay', {}) || {});
    if (!D.dolum[k] && dOnay[k] && Date.now() - dOnay[k] > 15000) { delete dOnay[k]; AK.sakla.yaz('tb.dolumOnay', dOnay); }      // onaydan sonra 15 s içinde durum henüz gelmemiş olabilir
    const durum = !D.dolum[k] ? 'YOK' : (dOnay[k] ? D.dolum[k] : 'TALEP');
    const c = kart(ISTAD[k]);
    if (durum === 'YOK') c.append(dug('▶ Doldurmaya başla — ' + ISTAD[k] + ' durdurulsun', 'ana tam', () => komutla('personel', 'dolum.iste', { istasyon: k }, null, 'Doldurma için PIN').then(async v => { if (v && v.ok !== false) { dOnay[k] = Date.now(); AK.sakla.yaz('tb.dolumOnay', dOnay); } ST.plan = await TB.hmiAl('/api/tablet/plan?ist=' + k); TBA.ciz(); })));
    if (durum === 'TALEP') c.append(h('div', { sinif: 'ak-ipucu uyari', metin: D.dolum[k] && !dOnay[k] ? 'Program henüz isteği onaylamadı — kapağı AÇMAYIN' : 'İstasyon güvenli durduruluyor… (ürün çıkışı bekleniyor)' }), dug('Vazgeç', '', () => komutla('personel', 'dolum.iptal', { istasyon: k })));
    if (durum === 'HAZIR') c.append(h('div', { sinif: 'ak-ipucu iyi', metin: 'İstasyon durdu' + (k === 'K' ? ', kilit açıldı' : '') + '. ' + (['B', 'U'].includes(k) ? 'Çekmeceyi açabilirsiniz.' : 'Kapağı açabilirsiniz.') }), dug('Vazgeç', '', () => komutla('personel', 'dolum.iptal', { istasyon: k })));
    if (['TALEP', 'HAZIR', 'KAPANDI'].includes(durum)) c.append(dug('⟲ Sıfırla — takıldıysa ' + ISTAD[k] + ' dolum isteğini kapat', 'kucuk', () => komutla('personel', 'dolum.sifirla', { istasyon: k }, 'Dolum isteği sıfırlandı')));       // takılma kurtarma: kapak kapalıysa her durumdaki isteği program kapatır
    if (durum === 'ACIK') c.append(h('div', { sinif: 'ak-ipucu uyari', metin: 'Kapak açık — doldurun, sonra KAPATIN.' }));
    if (durum === 'KAPANDI') c.append(h('div', { sinif: 'ak-ipucu iyi', metin: 'Kapak kapandı — sayımı girin ve onaylayın.' }));
    const IKIZ_EKRAN = !!AK.Q.get('tamekran') && !!ST.D.ikiz;       // IKIZ-ARAYUZ-7: ikiz içinde sim düğmeleri gizli (kapağı / ürünü 3B'deki personel rolü yapar)
    if (!IKIZ_EKRAN && ST.D.sim && !['B', 'U'].includes(k) && ['HAZIR', 'ACIK'].includes(durum)) c.append(h('div', { sinif: 'tb-yatay' }, dug('🔓 (sim) kapağı aç', 'kucuk', () => TB.istek('hmi', 'POST', '/api/komut', { tip: 'test.kapi', istasyon: k, acik: true }).then(() => TBA.yenile())), dug('🔒 (sim) kapağı kapat', 'kucuk', () => TB.istek('hmi', 'POST', '/api/komut', { tip: 'test.kapi', istasyon: k, acik: false }).then(() => TBA.yenile()))));
    if (!IKIZ_EKRAN && ST.D.ikiz && ['HAZIR', 'ACIK', 'KAPANDI'].includes(durum)) c.append(h('div', { sinif: 'tb-yatay' }, dug('🧺 (sim) ürünleri koydum', 'kucuk', () => TB.istek('hmi', 'POST', '/api/komut', { tip: 'test.doldur', istasyon: k }).then(() => { bildir('Ürünler yerleştirildi (sim)'); return TBA.yenile(); }))));
    if (k === 'B' && ['HAZIR', 'ACIK', 'KAPANDI'].includes(durum) && ST.D.cekmeceler) {         // B: makine çekmeceyi KENDİSİ açar / kapatır (ARAYUZ v1.4 dolum.cekmece)
      const CK = Object.entries(ST.D.cekmeceler), ad = { HAMUR_PIDE: 'pide hamuru', HAMUR_LAHM: 'lahmacun hamuru', ICECEK: 'içecek', TATLI: 'tatlı' };
      c.append(h('div', { sinif: 'tb-mini', metin: 'Çekmeceyi seçin — makine açar; doldurup yine buradan kapattırın.' }), h('div', { sinif: 'tb-secim' }, CK.map(([cd, v]) => {
        const acik = v.konum > 1;
        if (acik) return h('div', { sinif: 'tb-hucre' }, TBA.basiliKapat(cd, '✋ ' + cd.replace('_', ' · ') + ' AÇIK — kapatmak için BASILI TUTUN', () => ((ST.D.cekmeceler || {})[cd] || {}).konum <= 1),
          h('small', { metin: (ad[v.icerik] || v.icerik) + ' ' + v.adet + ' · ' + (v.konum >= 699 ? 'açık' : 'hareket') + ' · bırakınca DURUR' }));
        if (v.kilit) return h('div', { sinif: 'tb-hucre' }, h('div', { sinif: 'ak-ipucu uyari', 'data-kilit': cd, metin: '🔒 ' + cd.replace('_', ' · ') + ' KİLİTLİ: ' + (v.kilit_metin || v.kilit) }),
          h('button', { type: 'button', sinif: '', onclick: () => komutla('personel', 'sayim.iste', { hedef: cd, id: 'tablet' }, 'Robot sayımı istendi') }, h('b', { metin: 'Düzelttim — yeniden say' })),
          h('button', { type: 'button', sinif: '', onclick: () => komutla('personel', 'dolum.cekmece', { istasyon: 'B', cekmece: cd, ac: true }, 'Çekmece açılıyor') }, h('small', { metin: 'çekmeceyi aç (düzeltmek için)' })));
        return h('button', { type: 'button', sinif: '', onclick: () => komutla('personel', 'dolum.cekmece', { istasyon: 'B', cekmece: cd, ac: true }, 'Çekmece açılıyor') },
          h('b', { metin: cd.replace('_', ' · ') }), h('br'), h('small', { metin: (ad[v.icerik] || v.icerik) + ' ' + v.adet + ' · ' + 'aç' }));
      })));
    }
    const rehber = [['ac', 'Doldurmayı başlat', 'Makine bu istasyonu güvenle durdurur (STO / hava boşaltma), robot bölgeden çekilir.', durum !== 'YOK'],
      ['ac', k === 'K' ? 'Kilit açılınca kapağı aç' : ['B', 'U'].includes(k) ? 'Çekmeceyi / rafı aç' : 'Kapağı aç', 'Kapak ancak istasyon hazır olunca açılır.', ['ACIK', 'KAPANDI'].includes(durum)], ['cikar', 'Çıkar / yerleştir', plan ? plan.yontem : '', durum === 'KAPANDI'], ['kapat', 'Kapağı kapat', 'Kapanınca sistem sayımı bekler.', durum === 'KAPANDI']];
    if (durum !== 'YOK') rehber.forEach((a, i) => c.append(h('div', { sinif: 'tb-adim ' + (a[3] ? 'bitti' : i && !rehber[i - 1][3] ? 'bekle' : '') }, h('div', { sinif: 'tb-ik', metin: svgIk(a[0]) }), h('div', { sinif: 'no', metin: i + 1 }), h('div', {}, h('b', { metin: a[1] }), h('div', { sinif: 'tb-mini', metin: a[2] })))));
    if (plan) c.append(h('table', { sinif: 'tb-t' }, h('tr', {}, ['Kalem', 'Mevcut', 'Hedef', 'EKLENECEK', 'Depoda', 'Sayım'].map((t, i) => h('th', { sinif: i ? 's' : '', metin: t }))), plan.kalemler.map(x => h('tr', {},
      h('td', {}, x.ad, x.fifo ? rozet('FIFO') : null, x.son_kullanma ? h('div', { sinif: 'tb-mini', metin: 'en eski: SKT ' + x.son_kullanma.slice(0, 16).replace('T', ' ') }) : null), h('td', { sinif: 's', metin: f(x.mevcut) }), h('td', { sinif: 's', metin: f(x.hedef) }), h('td', { sinif: 's' }, h('b', { metin: f(x.eklenecek) })), h('td', { sinif: 's', metin: f(x.depoda) }),
      h('td', { sinif: 's' }, giris({ type: 'number', min: 0, max: x.kapasite, stil: { width: '96px', textAlign: 'right' }, placeholder: 'say', value: (ST.sayim || {})[x.id] ?? '', oninput: e => { (ST.sayim = ST.sayim || {})[x.id] = e.target.value; }, 'data-sayim': x.id }))))));
    const cop = (D.cop || []).filter(x => plan && plan.kalemler.some(y => y.id === x.kalem));
    if (cop.length) c.append(h('div', { sinif: 'ak-ipucu uyari', metin: 'Çöp listesi: ' + cop.map(x => x.ad + ' ' + f(x.adet) + ' adet (' + (x.gecti ? 'süresi doldu' : 'yarın') + ')').join(' · ') + ' — çıkarıp zayi yazın.' }));
    if (['HAZIR', 'ACIK', 'KAPANDI'].includes(durum)) c.append(dug('✓ Bitti — sayımı onayla, istasyonu devreye al', 'ana tam' + (durum !== 'KAPANDI' ? ' pasif' : ''), async () => {
      // DURUM TAZE okunur: render anındaki 'durum' bayat kalabilir (sayım kutusuna yazarken sayfa yenilenmez) — kabul_a S4 gerilemesi (1f1ba662): bayat 'ACIK' ile Bitti hiç gönderilmiyordu
      let taze = (ST.D && ST.D.dolum && ST.D.dolum[k]) || durum;
      try { const Tz = await TB.hmiAl('/api/tablet'); if (Tz && Tz.dolum) taze = Tz.dolum[k] || 'YOK'; } catch (e) { /* eldeki durum */ }
      if (taze !== 'KAPANDI') {         // T1: kapak kapanmadan bitirilemez — görünür uyarı (sayım denetiminden ÖNCE)
        let u = kap.querySelector('#kapak-uyari');
        if (!u) { u = h('div', { sinif: 'ak-ipucu kotu', id: 'kapak-uyari', role: 'alert' }); kap.querySelector('.tb-adim') ? kap.querySelector('.tb-adim').before(u) : kap.append(u); }
        u.textContent = taze === 'ACIK' ? 'Kapak hâlâ AÇIK — önce ürünleri yerleştirin, kapağı KAPATIN, sonra Bitti.' : 'Önce kapağı açıp doldurun, kapağı KAPATIN; kapanmadan Bitti geçmez.';
        TB.bildir && TB.bildir('Kapak kapanmadan bitirilemez');
        return;
      }
      const gir = {}; let bos = false; kap.querySelectorAll('[data-sayim]').forEach(i => { if (i.value === '' || isNaN(+i.value)) bos = true; gir[i.dataset.sayim] = +i.value; });
      if (bos) {            // P4e: görünür uyarı (alert() ekranda/otomasyonda kaybolabiliyor): sayfada kırmızı kutu + boş alanlar işaretlenir
        TB.bildir && TB.bildir('Her kalemin sayımını girin — sayı girilmeden bitirilemez');
        let u = kap.querySelector('#sayim-uyari');
        if (!u) { u = h('div', { sinif: 'ak-ipucu kotu', id: 'sayim-uyari', role: 'alert' }); kap.querySelector('[data-sayim]') ? kap.querySelector('[data-sayim]').closest('table').before(u) : kap.append(u); }
        u.textContent = 'Her kalemin SAYIMINI girin (makinedeki gerçek adet). Sayı girilmeden bitirilemez.';
        kap.querySelectorAll('[data-sayim]').forEach(i => { i.style.outline = (i.value === '' || isNaN(+i.value)) ? '3px solid var(--ak-kotu, #c0392b)' : ''; });
        return;
      }
      TBA.sonHata = null;
      const r = await komutla('personel', 'dolum.bitti', { istasyon: k, sayim: gir }, 'İstasyon devreye alındı ✓');
      if (r) { ST.secili = null; ST.plan = null; TBA.ciz(); return; }
      // onay REDDEDİLDİ: nedeni kalıcı kırmızı kutuda göster (kutu kapanmaz, sayım değerleri durur)
      let u = kap.querySelector('#dolum-ret');
      if (!u) { u = h('div', { sinif: 'ak-ipucu kotu', id: 'dolum-ret', role: 'alert' }); kap.querySelector('[data-sayim]') ? kap.querySelector('[data-sayim]').closest('table').before(u) : kap.append(u); }
      u.textContent = 'Sayım ONAYLANMADI: ' + (TBA.sonHata || 'program / stok denetimi reddetti (kapak kapanmamış ya da sayım uyuşmuyor)') + ' — düzeltip tekrar Bitti düğmesine basın.';
    }));
    kap.append(c);
  };

  /* ================================================================ STOK (alt sekmeler) */
  const ALT = [['stok', 'Stok'], ['tahmin', 'Tahmin'], ['sayim', 'Sayım'], ['satin', 'Satın alma']];
  SEK.MAKINE.stok = function (kap) {
    ST.altStok = ST.altStok || 'stok';
    kap.append(h('div', { sinif: 'ak-sekme tb-alt-sekme' }, ALT.map(([k, ad]) => h('button', { type: 'button', sinif: ST.altStok === k ? 'on' : '', metin: ad, onclick: () => { ST.altStok = k; TBA.ciz(); } }))));
    const ic = h('div', {}); kap.append(ic);
    ({ stok: stokSek, tahmin: tahminSek, sayim: sayimSek, satin: satinSek })[ST.altStok](ic);
  };
  function stokSek(kap) {
    const D = ST.D; if (!D) return;
    const sat = D.stok.map(x => { const mp = Math.min(100, 100 * x.makine / x.makine_kap), mh = 100 * x.makine_hedef / x.makine_kap, dp = Math.min(100, 100 * x.depo / Math.max(1, x.depo_hedef));
      return h('tr', {}, h('td', {}, h('b', { metin: x.ad }), h('div', { sinif: 'tb-mini', metin: (ISTKART[x.istasyon] || x.istasyon) + ' · ' + f(x.gunluk) + '/gün' })),
        h('td', { stil: { minWidth: '150px' } }, h('div', { sinif: 'tb-cubuk ' + (x.makine_alti ? 'az' : '') }, h('i', { stil: { width: mp + '%' } }), h('u', { stil: { left: mh + '%' } })), h('div', { sinif: 'tb-mini' }, f(x.makine) + ' / ' + f(x.makine_hedef) + ' · ', h('b', { metin: (x.makine_gun ?? '–') + ' gün' }), x.makine_bitti ? rozet('BİTTİ · sipariş kapalı', 'kotu') : x.makine_az ? rozet('≈ 1 saat kaldı (≤ ' + f(x.uyari_doz) + ')', 'uyari') : null)),
        h('td', { stil: { minWidth: '150px' } }, h('div', { sinif: 'tb-cubuk ' + (x.depo_alti ? 'az' : '') }, h('i', { stil: { width: dp + '%' } })), h('div', { sinif: 'tb-mini' }, f(x.depo) + ' / ' + f(x.depo_hedef) + ' · ', h('b', { metin: (x.depo_gun ?? '–') + ' gün' }))), h('td', { sinif: 'tb-mini', metin: x.tedarikci })); });
    kap.append(kart('3 kat stok · makine içi (2 gün hedef) · dükkân deposu (1 hafta) · tedarikçi', h('table', { sinif: 'tb-t' }, h('tr', {}, ['Kalem', 'Makine içi', 'Depo', 'Tedarikçi'].map(t => h('th', { metin: t }))), sat), h('p', { sinif: 'tb-mini', metin: 'Çizgi = hedef. Kırmızı = yenileme gerekli. Günlük tüketim siparişlerden; kayıt azken planlamayla harmanlanır.' })));
    const kalem = sec('dgKalem', D.stok.map(x => [x.id, x.ad])), paket = fg('dgPaket', { type: 'number', min: 1, placeholder: 'paket' }), bark = fg('dgBarkod', { placeholder: 'barkod / QR  kalem:adet[:gün]' });
    kap.append(h('div', { sinif: 'tb-ark' }), kart('Depoya giriş (teslim alma)', h('div', { sinif: 'tb-iki' }, alan('Kalem', kalem), alan('Paket sayısı', paket)), alan('ya da barkod / QR', bark),
      alan('Parti / etiket kodu',fg('dgParti',{type:'text',maxLength:31,'data-depo86':'parti'})),
      alan('Üretim zamanı',fg('dgUretim',{type:'datetime-local',step:1,'data-depo86':'uretim'})),
      alan('Kullanıma hazır olma zamanı',fg('dgHazir',{type:'datetime-local',step:1,'data-depo86':'hazir'})),
      alan('Etiketteki kullanım sonu',fg('dgSon',{type:'datetime-local',step:1,'data-depo86':'son'})),
      h('label',{sinif:'ak-onay'},h('input',{type:'checkbox',checked:F.dgOnay===true,'data-depo86':'confirm',onchange:e=>{F.dgOnay=e.target.checked;}}),' Parti bilgilerini doğruladım'),
      dug('Depoya gir', 'ana', () => TBA.islem('personel',async()=>{
        const {cekmece,...lot}=AK.Parti86.payload({cekmece:'depo',parti:F.dgParti,uretim:F.dgUretim,hazir:F.dgHazir,son:F.dgSon,onay:F.dgOnay});
        const r=await TB.komut('depo.giris',{kalem:kalem.value,paket_say:+paket.value||undefined,barkod:bark.value||undefined,...lot});
        if(r?.ok===false)throw Error(r.hata||'Depo girişi kabul edilmedi.');
        F.dgPaket='';F.dgBarkod='';F.dgOnay=false;bildir('Etiketli parti depoya girdi');await TBA.yenile();return r;
      },'Depo girişi için PIN'))));
  }
  async function tahminSek(kap) {
    const bekle = h('p', { sinif: 'ak-soluk', metin: 'Tahmin yükleniyor…' }); kap.append(bekle);
    let T; try { T = await TB.hmiAl('/api/tablet/tahmin'); } catch (e) { bekle.textContent = 'Tahmin alınamadı: ' + e.message; return; }
    bekle.remove();
    const y = T.yarin, asama = { varsayilan: 'varsayılan profil (veri az)', mevsimsel: 'haftanın günü + güncel düzey (≥ 3 ay)', dis_etkenli: 'dış etkenli model (≥ 6 ay)' }[T.asama] || T.asama;
    kap.append(kart('Yarın', h('div', { sinif: 'tb-kpi' }, h('div', {}, h('b', { metin: f(y.orta) }), h('small', { metin: 'tahmini sipariş kalemi' })), h('div', {}, h('b', { metin: f(y.alt) + '–' + f(y.ust) }), h('small', { metin: '%80 aralık' })), h('div', {}, h('b', { metin: T.egitim_gun }), h('small', { metin: 'öğrenilen gün' }))),
      h('p', { metin: y.aciklama }), h('p', { sinif: 'tb-mini', metin: 'Model: ' + asama + (T.hata && !T.hata.yok ? ' · geriye dönük hata (MAPE) %' + T.hata.mape_yuzde + ' · sapma %' + T.hata.sapma_yuzde : ' · hata raporu: ' + (T.hata ? T.hata.neden : '—')) })));
    kap.append(h('div', { sinif: 'tb-ark' }), kart('7 günlük tahmin (aralıklı)', TB.cubuk(T.hafta, x => x.gun_ad.slice(0, 3), x => x.orta), h('table', { sinif: 'tb-t' }, T.hafta.map(x => h('tr', {}, h('td', { metin: x.gun_ad + ' ' + x.gun.slice(5) }), h('td', { sinif: 's' }, h('b', { metin: f(x.orta) })), h('td', { sinif: 's tb-mini', metin: f(x.alt) + '–' + f(x.ust) }), h('td', { sinif: 'tb-mini', metin: (x.neden || []).join(' · ') }))))));
    const bek = T.kalemler.filter(x => x.paket_say > 0);
    kap.append(h('div', { sinif: 'tb-ark' }), kart('Sipariş önerisi (tahmine göre)', h('table', { sinif: 'tb-t' }, h('tr', {}, ['Kalem', 'İhtiyaç', 'Eldeki', 'Önerilen'].map((t, i) => h('th', { sinif: i ? 's' : '', metin: t }))), T.kalemler.map(x => h('tr', {}, h('td', {}, x.ad, h('div', { sinif: 'tb-mini', metin: x.dayanak }), x.neden ? h('div', { sinif: 'tb-mini', metin: x.neden }) : null), h('td', { sinif: 's', metin: f(x.ihtiyac) }), h('td', { sinif: 's', metin: f(x.eldeki) }), h('td', { sinif: 's' }, x.paket_say ? h('b', { metin: x.paket_say + ' ' + x.paket_ad }) : '—')))),
      dug(bek.length ? 'Önerileri SATIN ALMA onayına gönder' : 'Eksik yok', 'ana', () => komutla('yonetici', 'tahmin.oneri', {}, v => (v.yeni || []).length + ' öneri satın alma listesine eklendi', 'Öneriyi göndermek için YÖNETİCİ PIN'))));
    const mac = fg('macGun', { type: 'date' });
    kap.append(h('div', { sinif: 'tb-ark' }), kart('Maç günleri (elle takvim)', h('p', { sinif: 'tb-mini', metin: 'Takım / şehir fikstürü bağlanana kadar maç günlerini elle girin; model maç etkisini kendi öğrenir.' }), h('div', { sinif: 'tb-yatay' }, mac, dug('Maç günü ekle', '', () => F.macGun && komutla('personel', 'mac.ekle', { gun: F.macGun }, 'Eklendi'))), h('p', { sinif: 'tb-mini', metin: 'Kayıtlı: ' + (T.mac_gunleri.join(', ') || '—') })));
  }
  async function sayimSek(kap) {
    const bekle = h('p', { sinif: 'ak-soluk', metin: 'Yükleniyor…' }); kap.append(bekle);
    let S; try { S = await TB.hmiAl('/api/tablet/sayim'); } catch (e) { bekle.textContent = 'Alınamadı: ' + e.message; return; }
    bekle.remove();
    kap.append(kart('Stok nasıl sayılıyor?', h('div', { sinif: 'ak-ipucu', metin: S.matris.not_ }), h('table', { sinif: 'tb-t' }, h('tr', {}, ['Kalem', 'Makine içi', 'Kamera', 'Depo'].map(t => h('th', { metin: t }))), S.matris.kalemler.map(x => h('tr', {}, h('td', {}, h('b', { metin: x.ad })), h('td', { sinif: 'tb-mini', metin: x.makine_yontem }), h('td', {}, rozet(x.kamera_gorur ? 'görür' : 'GÖREMEZ', x.kamera_gorur ? 'iyi' : 'uyari')), h('td', { sinif: 'tb-mini', metin: x.depo_yontem }))))));
    const gorev = S.gorev.filter(x => x.suresi_geldi);
    kap.append(h('div', { sinif: 'tb-ark' }), kart('Haftalık sayım · ' + gorev.length + ' kalem süresi gelmiş', h('table', { sinif: 'tb-t' }, h('tr', {}, ['Kalem', 'Kayıt (depo)', 'Son sayım', 'Sayılan', ''].map((t, i) => h('th', { sinif: i ? 's' : '', metin: t }))), S.gorev.map(x => h('tr', {}, h('td', {}, h('b', { metin: x.ad })), h('td', { sinif: 's', metin: f(x.kayit) + ' ' + x.birim }), h('td', { sinif: 's tb-mini', metin: x.son_sayim_gun == null ? 'hiç' : x.son_sayim_gun + ' gün' }),
      h('td', { sinif: 's' }, fg('say_' + x.kalem, { type: 'number', min: 0, stil: { width: '96px', textAlign: 'right' } })), h('td', {}, dug('Kaydet', 'kucuk', () => F['say_' + x.kalem] !== undefined && F['say_' + x.kalem] !== '' && komutla('personel', 'sayim.haftalik', { kalem: x.kalem, sayilan: +F['say_' + x.kalem] }, v => v.uyari ? 'Fark ' + (v.fark > 0 ? '+' : '') + f(v.fark) + ' — yöneticiye bildirildi' : 'Sayım tuttu').then(() => { F['say_' + x.kalem] = ''; TBA.ciz(); }))))))));
    const r = S.rapor;
    kap.append(h('div', { sinif: 'tb-ark' }), kart('Fark raporu (son ' + r.gun + ' gün)', r.farklar.length ? h('table', { sinif: 'tb-t' }, r.farklar.map(x => h('tr', {}, h('td', { metin: x.kalem }), h('td', { sinif: 'tb-mini', metin: x.kaynak }), h('td', { sinif: 's', metin: x.n + ' kayıt' }), h('td', { sinif: 's' }, h('b', { metin: (x.toplam_fark > 0 ? '+' : '') + f(x.toplam_fark) }))))) : h('p', { sinif: 'ak-soluk', metin: 'Fark kaydı yok.' }), r.sayim_suresi_gelen.length ? h('p', { sinif: 'tb-mini', metin: 'Sayımı yapılmamış: ' + r.sayim_suresi_gelen.join(', ') }) : null));
  }
  function satinSek(kap) {
    const D = ST.D; if (!D) return;
    const bek = (D.oneriler || []).filter(o => o.durum === 'BEKLIYOR'), dig = (D.oneriler || []).filter(o => o.durum !== 'BEKLIYOR').slice(-8);
    const o = bek.map(o => h('div', { sinif: 'tb-adim' }, h('div', {}, h('b', { metin: f(o.paket_say) + ' ' + o.paket_ad + ' ' + o.ad }), h('div', { sinif: 'tb-mini', metin: o.ted + ' · ' + o.neden })), h('span', { stil: { marginLeft: 'auto', display: 'flex', gap: '8px' } },
      dug('Evet, sipariş ver', 'ana kucuk', () => komutla('yonetici', 'oneri.onayla', { id: o.id }, v => 'Tedarikçi metni hazır: ' + (v.metin || '').slice(0, 90) + '…', 'Onay için YÖNETİCİ PIN')), dug('Hayır', 'kucuk', () => komutla('yonetici', 'oneri.red', { id: o.id }, null, 'YÖNETİCİ PIN')))));
    kap.append(kart('Tedarikçiye sipariş verilsin mi?', o.length ? o : h('p', { sinif: 'ak-soluk', metin: 'Onay bekleyen sipariş yok.' }), TB.yetkili('yonetici') ? null : h('p', { sinif: 'tb-mini', metin: 'Onay için yönetici PIN gerekir.' })));
    const hm = D.hamur_onerisi || [];
    if (hm.length) kap.append(h('div', { sinif: 'tb-ark' }), kart('Ertesi gün hamur önerisi (tüketime göre)', hm.map(x => h('div', { html: (x.kalem === 'hamur_pide' ? 'Pide' : 'Lahmacun') + ' hamuru: günlük ' + f(x.gunluk) + ' · eldeki ' + f(x.eldeki) + ' → <b>' + f(x.onerilen) + '</b> adet' }))));
    kap.append(h('div', { sinif: 'tb-ark' }), kart('Son siparişler', h('table', { sinif: 'tb-t' }, dig.map(x => h('tr', {}, h('td', { metin: x.ad }), h('td', { metin: f(x.paket_say) + ' ' + x.paket_ad }), h('td', {}, rozet(x.durum, x.durum === 'TESLIM' ? 'iyi' : x.durum === 'RED' ? 'kotu' : 'uyari')))))));
  }

  /* ================================================================ SERVİS */
  SEK.MAKINE.servis = async function (kap) {
    const D = ST.D; if (!D) return;
    kap.append(TBA.toppingKarti(D, ' · SERVİS'), h('div', { sinif: 'tb-ark' }));
    if (!TB.yetkili('servis')) {
      kap.append(girisKarti('Servis', 'Servis ekranı (eksen / valf / sensör testi, kalibrasyon, arıza ve parça kaydı) servis PIN\'i ister.', 'servis'));
      kap.append(h('div', { sinif: 'tb-ark' }), kart('Servis çağır', h('p', { sinif: 'tb-mini', metin: 'PIN gerekmez (personel girişi yeter).' }), cagriFormu()));
      return;
    }
    let S; try { S = await TB.hmiAl('/api/tablet/servis'); } catch (e) { kap.append(kart('', h('p', { metin: 'Servis verisi alınamadı: ' + e.message }))); return; }
    const modu = h('div', { sinif: 'tb-yatay' }), ist = sec('svModIst', [['TOP', 'TOPPING'], ['F', 'F · Fırın'], ['K', 'K · Kesme'], ['E', 'E · Kutu'], ['B', 'B · Dolap'], ['ROB', 'Robot']], S.servis_ist);
    if (S.mod !== 'SERVIS') modu.append(alan('Servis edilecek istasyon', ist), dug('SERVİS modunu aç', 'ana', () => komutla('servis', 'makine.servis', { ac: true, istasyon: ist.value }, 'SERVİS modu açıldı')));
    else modu.append(rozet('SERVİS modu · ' + S.servis_ist, 'uyari'), dug('SERVİS modundan çık', 'tehlike', () => komutla('servis', 'makine.servis', { ac: false }, 'Üretime dönüldü')));
    kap.append(kart('Servis modu', h('p', { sinif: 'tb-mini', metin: 'Yalnız üretim durmuşken açılır. Elle hareket: hız ≤ %10 nominal ve ≤ 50 mm/s, adım ≤ 50 mm / 90°, kapı kapalı olmalı. TwinSAFE sinyalleri (GS_) yazılamaz.' }), modu));
    if (S.mod === 'SERVIS') {
      const adim = sec('svAdim', [['1', '1'], ['10', '10'], ['50', '50']], '10');
      const eks = S.eksenler.filter(e => e.ist === S.servis_ist);
      kap.append(h('div', { sinif: 'tb-ark' }), kart('Eksen testi · ' + S.servis_ist, h('div', { sinif: 'tb-yatay' }, alan('Adım (mm / °)', adim)), eks.length ? h('table', { sinif: 'tb-t' }, eks.map(e => h('tr', {}, h('td', {}, h('b', { metin: e.ad }), h('div', { sinif: 'tb-mini', metin: f(e.konum) + ' ' + e.birim + ' · ' + e.durum })),
        h('td', { sinif: 's' }, h('div', { sinif: 'tb-yatay', stil: { justifyContent: 'flex-end' } }, dug('−', 'kucuk', () => komutla('servis', 'makine.jog', { eksen: e.ad, yon: -1, miktar: +adim.value }, v => 'jog: hız ' + f(v.uygulanan_hiz) + ', adım ' + f(v.uygulanan_miktar))), dug('+', 'kucuk', () => komutla('servis', 'makine.jog', { eksen: e.ad, yon: 1, miktar: +adim.value }, v => 'jog: hız ' + f(v.uygulanan_hiz) + ', adım ' + f(v.uygulanan_miktar))),
          dug('Home', 'kucuk', () => komutla('servis', 'makine.home', { eksen: e.ad }, 'home')), dug('Dur', 'kucuk tehlike', () => komutla('servis', 'makine.dur', { eksen: e.ad }, 'durdu'))))))) : h('p', { sinif: 'ak-soluk', metin: 'Bu istasyonda tanımlı eksen yok.' })));
      const sn = Object.entries(S.sensorler).map(([a, v]) => h('tr', {}, h('td', { metin: a }), h('td', { sinif: 's', metin: typeof v === 'number' ? f(v) : String(v) })));
      const gs = Object.entries(S.guvenlik).filter(([a]) => a.startsWith('GS_DURUM')).map(([a, v]) => h('tr', {}, h('td', { metin: a }), h('td', { sinif: 's' }, rozet(v ? 'TAMAM' : 'KAPALI / AÇIK', v ? 'iyi' : 'kotu'))));
      const cikis = fg('svIo', { placeholder: 'DO_TOP_KESME_1' });
      kap.append(h('div', { sinif: 'tb-ark' }), h('div', { sinif: 'tb-iki' }, kart('Sensörler', h('table', { sinif: 'tb-t' }, sn)), kart('Güvenlik durumu (TwinSAFE, salt okunur)', h('table', { sinif: 'tb-t' }, gs))),
        h('div', { sinif: 'tb-ark' }), kart('Valf / çıkış testi', h('p', { sinif: 'tb-mini', metin: 'Çıkış adı (DO_…) yazıp aç / kapat. GS_ ile başlayanlar reddedilir.' }), h('div', { sinif: 'tb-yatay' }, cikis, dug('AÇ', 'kucuk ana', () => komutla('servis', 'makine.io', { ad: F.svIo, deger: true }, 'çıkış açıldı')), dug('KAPAT', 'kucuk', () => komutla('servis', 'makine.io', { ad: F.svIo, deger: false }, 'çıkış kapandı')))));
    }
    // kalibrasyon
    const tur = sec('kalTur', [['tarti', 'Tartı (K yük hücresi)'], ['sicaklik', 'Sıcaklık (Pt100)']]), hedef = sec('kalHedef', [['K_YAG', 'K yağ tartısı'], ['FIRIN', 'Fırın'], ['TOP', 'TOPPING soğuk'], ['B', 'B soğuk']]), ref = fg('kalRef', { type: 'number', step: 'any', placeholder: 'referans (g ya da °C)' }), olc = fg('kalOlc', { type: 'number', step: 'any', placeholder: 'sistemin ölçtüğü' });
    kap.append(h('div', { sinif: 'tb-ark' }), kart('Kalibrasyon', h('p', { sinif: 'tb-mini', metin: 'Tartı: bilinen kütle koyun, sistemin gösterdiğini girin → kat sayı. Sıcaklık: referans termometre ↔ sensör → ofset. Düzeltme program parametresine yazılacak değerdir.' }),
      h('div', { sinif: 'tb-iki' }, alan('Tür', tur), alan('Hedef', hedef), alan('Referans', ref), alan('Ölçülen', olc)),
      dug('Kalibrasyonu kaydet', 'ana', () => komutla('servis', 'kalibrasyon.kaydet', { tur: F.kalTur, hedef: F.kalHedef, referans: +F.kalRef, olculen: +F.kalOlc }, v => v.mesaj + ' (' + v.duzeltme + ' ' + v.birim + ')', 'Kalibrasyon için SERVİS PIN')),
      h('table', { sinif: 'tb-t', stil: { marginTop: '10px' } }, S.kalibrasyon.map(k => h('tr', {}, h('td', { metin: TB.tarihSaat(k.t) }), h('td', { metin: k.tur + ' · ' + k.hedef }), h('td', { sinif: 's', metin: f(k.referans) + ' ↔ ' + f(k.olculen) }), h('td', { sinif: 's' }, h('b', { metin: (Math.round(k.duzeltme * 1e3) / 1e3) + ' ' + k.birim })), h('td', { sinif: 'tb-mini', metin: k.kim }))))));
    // arıza + parça
    const aIst = sec('arIst', ['TOP', 'F', 'K', 'E', 'B', 'ROB', 'QR', 'A', 'HAT']), aMetin = fg('arMetin', { placeholder: 'Ne oluyor?' }), pIst = sec('paIst', ['TOP', 'F', 'K', 'E', 'B', 'ROB', 'QR', 'A']), pAd = fg('paAd', { placeholder: 'parça adı', list: 'parcaListe' }), eski = fg('paEski', { placeholder: 'eski seri' }), yeni = fg('paYeni', { placeholder: 'yeni seri' }), neden = fg('paNeden', { placeholder: 'neden' });
    const dl = h('datalist', { id: 'parcaListe' }, Object.values(S.parca_onerileri).flat().map(x => h('option', { value: x })));
    kap.append(h('div', { sinif: 'tb-ark' }), h('div', { sinif: 'tb-iki' }, kart('Arıza kaydı', h('div', { sinif: 'tb-yatay' }, aIst, aMetin), dug('Arıza kaydet', 'ana', () => F.arMetin && komutla('personel', 'ariza.kaydet', { istasyon: F.arIst, metin: F.arMetin }, 'Arıza kaydedildi').then(() => { F.arMetin = ''; TBA.ciz(); })),
      h('table', { sinif: 'tb-t', stil: { marginTop: '8px' } }, S.ariza.map(a => h('tr', {}, h('td', {}, h('b', { metin: a.istasyon }), h('div', { sinif: 'tb-mini', metin: a.metin + (a.cozum ? ' → ' + a.cozum : '') })), h('td', {}, rozet(a.durum, a.durum === 'ACIK' ? 'kotu' : 'iyi')), h('td', {}, a.durum === 'ACIK' ? dug('Kapat', 'kucuk', () => { const c = giris({ placeholder: 'çözüm' }); const m = modal(h('div', { sinif: 'ak-sutun' }, h('h2', { metin: 'Arıza kapatılsın mı?' }), c, dug('Kapat', 'ana', () => { m.kapat(); komutla('servis', 'ariza.kapat', { id: a.id, cozum: c.value }, 'Kapatıldı'); }))); }) : null))))),
      kart('Parça değişimi', h('div', { sinif: 'tb-yatay' }, pIst, pAd), h('div', { sinif: 'tb-yatay' }, eski, yeni), neden, dl, dug('Parça değişimini kaydet', 'ana', () => F.paAd && komutla('servis', 'parca.degistir', { istasyon: F.paIst, parca: F.paAd, eski_seri: F.paEski, yeni_seri: F.paYeni, neden: F.paNeden }, 'Kaydedildi').then(() => { F.paAd = F.paEski = F.paYeni = F.paNeden = ''; TBA.ciz(); }), 'SERVİS PIN'),
        h('table', { sinif: 'tb-t', stil: { marginTop: '8px' } }, S.parca.map(p => h('tr', {}, h('td', { metin: TB.tarihSaat(p.t) }), h('td', {}, h('b', { metin: p.parca }), h('div', { sinif: 'tb-mini', metin: p.istasyon + ' · ' + (p.eski_seri || '—') + ' → ' + (p.yeni_seri || '—') }))))))));
  };
  function cagriFormu() {
    const ist = sec('cgIst', ['HAT', 'TOP', 'F', 'K', 'E', 'B', 'ROB', 'QR', 'A']), metin = fg('cgMetin', { placeholder: 'Ne oluyor? (ör. kilit açılmıyor)' });
    return h('div', { sinif: 'ak-sutun' }, ist, metin, dug('Servisi çağır', 'tehlike tam', () => F.cgMetin && komutla('personel', 'servis.cagri', { istasyon: F.cgIst, metin: F.cgMetin }, 'Servis çağrıldı').then(() => { F.cgMetin = ''; })));
  }

  /* ================================================================ TEMİZLİK */
  SEK.MAKINE.temizlik = function (kap) {
    const D = ST.D; if (!D) return;
    if (!TB.pin) { kap.append(girisKarti('Temizlik', 'Temizlik modu ve HACCP adımları için giriş yapın.')); return; }
    const modAc = D.mod === 'TEMIZLIK';
    kap.append(kart('Temizlik modu', h('p', { sinif: 'tb-mini', metin: 'Üretim bitmeden açılmaz; fırın soğutulur. Adımlar günlük kaydedilir (kim, ne zaman) — HACCP kaydı.' }),
      modAc ? h('div', { sinif: 'tb-yatay' }, rozet('TEMİZLİK modu açık', 'uyari'), dug('Temizlik bitti — üretime dön', 'ana', () => komutla('personel', 'makine.temizlik', { ac: false }, 'Temizlik bitti (fırın ısınıyor)'))) : dug('Temizlik modunu aç', 'ana tam', () => komutla('personel', 'makine.temizlik', { ac: true }, 'Temizlik modu açıldı'))), h('div', { sinif: 'tb-ark' }), liste(kap, 'temizlik', 'Temizlik adımları (HACCP)'));
  };

  /* ================================================================ ALARMLAR */
  SEK.MAKINE.alarm = async function (kap) {
    let A; try { A = await TB.hmiAl('/api/tablet/alarm'); } catch (e) { kap.append(kart('', h('p', { metin: 'Alarm verisi alınamadı: ' + e.message }))); return; }
    const rehberKart = (a, ac) => { const r = a.rehber; return h('div', { sinif: 'ak-kart', stil: { marginBottom: '10px' } }, h('div', { sinif: 'ak-satir ayir' }, h('b', { metin: a.ad }), rozet(a.seviye, a.seviye === 'HATA' ? 'kotu' : a.seviye === 'UYARI' ? 'uyari' : ''), r ? rozet('çözen: ' + r.cozen, r.cozen === 'servis' ? 'vurgu' : '') : null),
      h('p', { sinif: 'tb-mini', metin: 'İstasyon: ' + (a.istasyon || 'Hat geneli') }), h('p', { metin: a.metin || (r && r.anlam) || 'Açıklama alınamadı.' }), ac ? h('p', { sinif: 'tb-mini', metin: 'Gördüm: yalnız alarmı onaylar. Hattı yeniden başlat: üretim başlatma isteği gönderir; PLC koşulları denetler.' }) : null, r ? h('div', {}, h('p', { sinif: 'tb-mini', metin: 'Olası neden: ' + r.neden }), (r.adimlar || []).map((s, i) => h('div', { sinif: 'tb-adim' }, h('div', { sinif: 'no', metin: i + 1 }), h('div', { metin: s })))) : h('p', { sinif: 'tb-mini', metin: 'Bu alarm için çözüm rehberi yok.' }),
      ac ? h('div', { sinif: 'tb-yatay' }, dug('Gördüm (onayla)', 'kucuk', () => komutla('personel', 'makine.hat', { islem: 'alarm_ack', ad: a.ad }, 'Onaylandı')), dug('Hattı yeniden başlat', 'kucuk ana', () => komutla('personel', 'makine.hat', { islem: 'baslat' }, 'BAŞLAT gönderildi')), dug('Servis çağır', 'kucuk tehlike', () => komutla('personel', 'servis.cagri', { istasyon: a.istasyon || 'HAT', metin: a.ad + ' alarmı' }, 'Servis çağrıldı'))) : null); };
    kap.append(h('h2', { sinif: 'tb-b', metin: 'Aktif alarmlar' }), ...(A.aktif.length ? A.aktif.map(a => rehberKart(a, true)) : [h('div', { sinif: 'ak-ipucu iyi', metin: 'Aktif alarm yok' })]), h('div', { sinif: 'tb-ark' }),
      h('h2', { sinif: 'tb-b', metin: 'Alarm geçmişi' }), h('div', { sinif: 'ak-kart' }, h('table', { sinif: 'tb-t' }, A.gecmis.slice(0, 40).map(a => h('tr', {}, h('td', { sinif: 'tb-mini', metin: (a.zaman || '').slice(5, 19).replace('T', ' ') }), h('td', {}, h('b', { metin: a.ad })), h('td', {}, rozet(a.seviye, a.seviye === 'HATA' ? 'kotu' : a.seviye === 'UYARI' ? 'uyari' : '')), h('td', { sinif: 'tb-mini', metin: a.istasyon || '' }), h('td', { metin: a.aktif ? 'başladı' : 'bitti' }),
        h('td', {}, a.rehber ? dug('Çözüm', 'kucuk', () => { const m = modal(h('div', { sinif: 'ak-sutun' }, h('h2', { metin: a.ad }), h('p', { metin: a.rehber.anlam }), a.rehber.adimlar.map((s, i) => h('div', { sinif: 'tb-adim' }, h('div', { sinif: 'no', metin: i + 1 }), h('div', { metin: s }))), dug('Kapat', 'tam', () => m.kapat()))); }) : null))))));
  };

  /* ================================================================ AÇILIŞ / KAPANIŞ */
  SEK.MAKINE.acilis = function (kap) {
    const D = ST.D; if (!D) return;
    if (!TB.pin) { kap.append(girisKarti('Açılış / kapanış', 'Prosedür için giriş yapın.')); return; }
    const hazir = D.mod === 'BOSTA' || D.mod === 'SIPARIS', isinma = D.mod === 'ISINMA', kapali = D.mod === 'KAPALI';
    const aT = (D.acilis || []).every(x => x.yapildi), kT = (D.kapanis || []).every(x => x.yapildi), bos_ = D.kuyruk === 0 && D.wip === 0;
    const hedef = 300, yuz = Math.max(0, Math.min(100, 100 * (D.firin_c - 25) / (hedef - 25)));
    kap.append(h('div', { sinif: 'tb-iki' },
      kart('1 · AÇILIŞ', h('div', { sinif: 'tb-adim ' + (!kapali ? 'bitti' : '') }, h('div', { sinif: 'no', metin: 1 }), h('div', {}, h('b', { metin: 'Hattı aç — fırın ısınmaya başlar' }), h('div', { sinif: 'tb-mini', metin: 'Durum: ' + D.mod })), kapali ? dug('Hattı aç', 'ana kucuk', () => komutla('personel', 'makine.hat', { islem: 'ac' }, 'Hat açılıyor')) : null),
        h('div', { sinif: 'tb-adim ' + (hazir ? 'bitti' : !kapali ? '' : 'bekle') }, h('div', { sinif: 'no', metin: 2 }), h('div', { stil: { flex: 1 } }, h('b', { metin: 'Fırın ısınıyor · ' + f(D.firin_c) + ' °C / hedef ' + hedef + ' °C' }), h('div', { sinif: 'tb-cubuk', stil: { marginTop: '6px' } }, h('i', { stil: { width: yuz + '%' } })))),
        h('div', { sinif: 'tb-adim ' + (aT ? 'bitti' : '') }, h('div', { sinif: 'no', metin: 3 }), h('div', {}, h('b', { metin: 'Açılış listesi (' + (D.acilis || []).filter(x => x.yapildi).length + '/' + (D.acilis || []).length + ')' }), h('div', { sinif: 'tb-mini', metin: 'aşağıda işaretleyin' }))),
        h('div', { sinif: 'ak-ipucu ' + (hazir && aT ? 'iyi' : 'uyari'), metin: hazir && aT ? 'ÜRETİME HAZIR ✓' : 'Üretime hazır değil: ' + [!hazir ? 'fırın / hat hazır değil' : null, !aT ? 'açılış listesi eksik' : null].filter(Boolean).join(' · ') })),
      kart('2 · KAPANIŞ', h('div', { sinif: 'tb-adim ' + (bos_ ? 'bitti' : '') }, h('div', { sinif: 'no', metin: 1 }), h('div', {}, h('b', { metin: 'Açık sipariş kalmadı' }), h('div', { sinif: 'tb-mini', metin: 'kuyruk ' + D.kuyruk + ' · hatta ürün ' + D.wip }))),
        h('div', { sinif: 'tb-adim ' + (kT ? 'bitti' : '') }, h('div', { sinif: 'no', metin: 2 }), h('div', {}, h('b', { metin: 'Kapanış listesi (' + (D.kapanis || []).filter(x => x.yapildi).length + '/' + (D.kapanis || []).length + ')' }))),
        h('div', { sinif: 'tb-adim' }, h('div', { sinif: 'no', metin: 3 }), h('div', {}, h('b', { metin: 'Gün sonu raporu' })), dug('Raporu göster', 'kucuk', () => { ST.sekme.MAKINE = 'gun'; TBA.ciz(); })),
        dug('Hattı kapat (fırın kapanır)', 'tehlike tam', () => { if (!bos_ || !kT) { bildir('Önce açık siparişler bitmeli ve kapanış listesi tamamlanmalı'); return; } komutla('personel', 'makine.hat', { islem: 'kapat' }, 'Hat kapandı'); }))),
      h('div', { sinif: 'tb-ark' }), h('div', { sinif: 'tb-iki' }, liste(kap, 'acilis', 'Açılış listesi'), liste(kap, 'kapanis', 'Kapanış listesi')));
  };

  /* ================================================================ GÜN */
  SEK.MAKINE.gun = function (kap) {
    const D = ST.D; if (!D) return;
    const rp = h('div', { sinif: 'tb-mini', stil: { marginTop: '8px' } });
    const kal = (D.stok || []).filter(x => ['kola', 'tatli'].includes(x.id)), kAd = sec('kmKalem', kal.map(x => [x.id, x.ad + ' (sistem ' + f(x.makine) + ')'])), kSay = fg('kmSay', { type: 'number', min: 0, placeholder: 'sayılan' });
    kap.append(h('div', { sinif: 'tb-iki' },
      kart('Gün sonu raporu', dug('Raporu hazırla', 'ana tam', async () => {
        try { const R = await TB.hmiAl('/api/tablet/rapor'), k = R.satilan.bugun_kirilim || {}, s = R.sicaklik;
          bos(rp).append(h('div', { html: '<b>' + AK.kac(R.gun) + '</b> · satılan ' + (R.satilan.bugun_uretim || 0) + ' (' + AK.kac(Object.entries(k).map(([a, n]) => a + ' ' + n).join(', ') || '—') + ') · hurda ' + (R.satilan.hurda || 0) }),
            h('div', { html: 'fırın ' + f(s.firin_min || 0) + '–' + f(s.firin_maks || 0) + ' °C · soğuk TOP ≤ ' + f(s.top_maks || 0) + ' · B ≤ ' + f(s.b_maks || 0) + ' °C ' }, rozet(s.haccp_ihlali ? 'HACCP SINIRI AŞILDI' : '≤ 4 °C', s.haccp_ihlali ? 'kotu' : 'iyi')),
            h('div', { metin: 'tüketim: ' + (R.tuketim.map(x => x.kalem + ' ' + f(x.adet)).join(', ') || '—') }), h('div', { metin: 'zayi: ' + (R.zayi.map(x => x.kalem + ' ' + f(x.adet)).join(', ') || '—') }),
            h('div', { metin: 'açılış ' + R.acilis.filter(x => x.yapildi).length + '/' + R.acilis.length + ' · kapanış ' + R.kapanis.filter(x => x.yapildi).length + '/' + R.kapanis.length + ' · sayım farkı ' + R.sayim_farklari.length + ' · açık servis ' + R.servis_cagrilari.length }));
        } catch (e) { TBA.hata(e); } }), rp),
      kart('Servis çağrısı', (D.servis || []).map(x => h('div', { sinif: 'ak-ipucu kotu' }, '#' + x.id + ' ' + x.istasyon + ': ' + x.metin + ' ', h('span', { sinif: 'tb-mini', metin: x.kim }), TB.yetkili('servis') ? dug('Kapat', 'kucuk', () => komutla('servis', 'servis.kapat', { id: x.id })) : null)), !(D.servis || []).length ? h('p', { sinif: 'ak-soluk', metin: 'Açık çağrı yok.' }) : null, cagriFormu())),
      h('div', { sinif: 'tb-ark' }), h('div', { sinif: 'tb-iki' },
        kart('Çekmece sayımı (kamera / tartı)', h('p', { sinif: 'tb-mini', metin: 'Çekmece açılınca kamera sayar; beklenenle farklıysa uyarı. Kamera bağlanana kadar elle girilebilir. Sistem farkı kendi düzeltmez — personel doğrular.' }),
          (D.sayim_farki || []).map(x => h('div', { sinif: 'ak-ipucu uyari', metin: x.kalem + ': sistem ' + f(x.beklenen) + ' · ' + x.kaynak + ' ' + f(x.sayilan) + ' (fark ' + f(x.sayilan - x.beklenen) + ')' })), h('div', { sinif: 'tb-yatay' }, kAd, kSay, dug('Gönder', '', () => F.kmSay !== undefined && F.kmSay !== '' && komutla('personel', 'kamera.sayim', { kalem: F.kmAd || kAd.value, sayilan: +F.kmSay }, v => v.uyari ? 'Sayım farkı: ' + (v.fark > 0 ? '+' : '') + v.fark + ' — yöneticiye bildirildi' : 'Sayım doğru')))),
        kart('Gün sonu özeti + ayar', h('p', { sinif: 'tb-mini', metin: 'Her gün ' + D.ozet_saat + ': eksikler, çöp listesi, zayi → yöneticiye ve giriş yapmış üyeye (HMI + SMS + e-posta).' }), alan('Özet saati', fg('aSaat', { type: 'time', value: F.aSaat ?? D.ozet_saat })),
          h('label', { sinif: 'ak-onay' }, h('input', { type: 'checkbox', checked: F.aOto ?? D.oto_onay, onchange: e => { F.aOto = e.target.checked; } }), h('span', { metin: 'Otomatik sipariş (onaysız) — yalnız yönetici açar' })),
          h('div', { sinif: 'tb-yatay' }, dug('Kaydet', 'ana', () => komutla('yonetici', 'ayar', { oto_onay: F.aOto ?? D.oto_onay, ozet_saat: F.aSaat || D.ozet_saat }, 'Kaydedildi', 'Ayar için YÖNETİCİ PIN')), dug('Özeti şimdi gönder', '', () => komutla('yonetici', 'ozet.simdi', {}, 'Özet gönderildi', 'YÖNETİCİ PIN')))),
        kart('Zayi (son 24 sa)', (D.zayi || []).length ? D.zayi.map(z => h('div', { metin: z.kalem + ': ' + f(z.adet) + ' · ' + z.neden })) : h('p', { sinif: 'ak-soluk', metin: 'Kayıt yok.' }), dug('Süresi dolanları listele', '', () => komutla('personel', 'zayi.tara', {}, 'Tarandı')))));
  };
  /* ================================================================ TOPPING · GRAMAJ (Kemal 11 Eki gece: "personel seçebilsin, tablette TOPPING yeri olsun")
     Ürün × malzeme başına kaydırıcı + sayı kutusu (min / max mekanizmadan: UNO strok, helezon g/tur × izinli tur, tabla hız sınırı — recete_gramaj.json).
     'Kaydet' → önizleme (ürün başına tabla süresi, ürün/saat, kaset stok günü). KIRMIZI ÇİZGİ (stok < 2 gün düşüyor / kapasite düşüyor): kırmızı uyarı,
     yalnız Kemal'in açık İKİNCİ onayı + YÖNETİCİ PIN ile kaydedilir. Değişiklik SONRAKİ siparişten geçerli; süren sipariş etkilenmez. Veri: HMI /api/tablet/gramaj. */
  const gAd = (kod, kas) => 'gr_' + kod + '_' + kas;
  const g1 = x => (Math.round(x * 10) / 10).toLocaleString('tr-TR');
  const gramDegisim = G => { const d = []; for (const u of G.urunler) for (const z of u.doz) { const v = F[gAd(u.kod, z.kaset)]; if (v != null && v !== '' && Math.abs(+v - z.g) > 1e-9) d.push({ tarif: u.kod, kaset: z.kaset, gram: +v }); } return d; };
  function gramOnizleModal(G, dg, on) {
    const ur = G.urunler.filter(u => dg.some(d => d.tarif === u.kod)).map(u => { const o = on.urun[u.kod]; return h('tr', {}, h('td', { metin: u.ad }), h('td', { metin: g1(o.tabla_s_eski) + ' → ' + g1(o.tabla_s_yeni) + ' s' }), h('td', { metin: g1(o.tavan_eski) + ' → ' + g1(o.tavan_yeni) })); });
    const kas = new Set(dg.map(d => d.kaset)), st = Object.entries(on.stok).filter(([k]) => kas.has(k)).map(([k, s]) => h('tr', { sinif: s.gun_yeni < G.stok_gun_min && s.gun_yeni < s.gun_eski ? 'kotu' : '' }, h('td', { metin: s.icerik }), h('td', { metin: g1(s.gun_eski) + ' → ' + g1(s.gun_yeni) + ' gün' })));
    const kirmizi = on.kirmizi || [];
    const kaydet = async (kemal) => { m.kapat(); const v = await komutla(kemal ? 'yonetici' : 'personel', 'topping.gramaj', { degisim: dg, kemal_onay: !!kemal }, x => x.mesaj || 'Kaydedildi', kemal ? 'Kırmızı çizgi — YÖNETİCİ PIN' : 'Gramaj için PIN');
      if (v && v.ok !== false) { for (const d of dg) delete F[gAd(d.tarif, d.kaset)]; ST.imza.gramaj = null; } };
    const ikinci = () => { m.kapat(); const m2 = modal(h('div', { sinif: 'ak-sutun' }, h('h2', { metin: 'Kemal onaylıyor mu?' }),
      h('div', { sinif: 'ak-ipucu kotu' }, ...kirmizi.map(k => h('div', { metin: '⚠ ' + k }))),
      h('p', { metin: 'Bu değişiklik kırmızı çizgidir. Yalnız Kemal açıkça onayladıysa devam edin; ardından YÖNETİCİ PIN istenir.' }),
      h('div', { sinif: 'tb-yatay' }, dug('Evet, Kemal onayladı — kaydet', 'tehlike', () => { m2.kapat(); kaydet(true); }), dug('Vazgeç', '', () => m2.kapat())))); };
    const m = modal(h('div', { sinif: 'ak-sutun', id: 'gram-onizle' }, h('h2', { metin: 'Gramaj değişikliği — önizleme' }),
      h('div', { sinif: 'tb-mini', metin: dg.map(d => d.tarif + ' · ' + d.kaset + ' → ' + g1(d.gram) + ' g').join('   ') }),
      h('table', { sinif: 'tb-tablo' }, h('tr', {}, h('th', { metin: 'Ürün' }), h('th', { metin: 'Tabla süresi' }), h('th', { metin: 'Tabla ürün/saat' })), ...ur),
      h('p', { metin: 'Hat kapasitesi (tahmin): ' + g1(on.hat_eski) + ' → ' + g1(on.hat_yeni) + ' ürün/saat' }),
      st.length ? h('table', { sinif: 'tb-tablo' }, h('tr', {}, h('th', { metin: 'Kaset' }), h('th', { metin: 'Stok' })), ...st) : null,
      kirmizi.length ? h('div', { sinif: 'ak-ipucu kotu', id: 'gram-kirmizi' }, h('b', { metin: 'KIRMIZI ÇİZGİ' }), ...kirmizi.map(k => h('div', { metin: '⚠ ' + k }))) : h('div', { sinif: 'ak-ipucu iyi', metin: 'Stok ≥ 2 gün, kapasite düşmüyor.' }),
      h('p', { sinif: 'tb-mini', metin: 'Bir sonraki siparişten geçerli; şu an üretilen sipariş eski gramla biter.' }),
      h('div', { sinif: 'tb-yatay' }, kirmizi.length ? dug('Kemal onayıyla kaydet…', 'tehlike', ikinci) : dug('Onayla ve kaydet', 'ana', () => kaydet(false)), dug('Vazgeç', '', () => m.kapat()))));
  }
  SEK.MAKINE.topping = function (kap) {
    const G = ST.gramaj;
    if (!G) { kap.append(kart('TOPPING · gramaj', h('p', { metin: 'Gramaj tablosu yükleniyor…' }))); return; }
    const dokun = () => { ST.gramDokunma = Date.now(); };
    const satir = (u, z) => {
      const ad = gAd(u.kod, z.kaset), v = F[ad] != null && F[ad] !== '' ? +F[ad] : z.g, adim = z.max - z.min > 100 ? 1 : 0.5;
      const kutu = giris({ type: 'number', min: z.min, max: z.max, step: adim, value: v, 'data-gram': ad, stil: { width: '92px' } });
      const kay = h('input', { type: 'range', min: z.min, max: z.max, step: adim, value: v, 'data-gram-kaydirici': ad, stil: { flex: '1 1 auto' } });
      const yaz = (x, ben) => { let y = Math.max(z.min, Math.min(z.max, +x)); if (!isFinite(y)) return; F[ad] = String(y); if (ben !== kutu) kutu.value = y; if (ben !== kay) kay.value = y; fark.textContent = Math.abs(y - z.g) > 1e-9 ? '● değişti (' + g1(z.g) + ' → ' + g1(y) + ' g)' : ''; dokun(); };
      kay.addEventListener('input', () => yaz(kay.value, kay)); kay.addEventListener('pointerdown', dokun);
      kutu.addEventListener('input', dokun); kutu.addEventListener('change', () => yaz(kutu.value, kutu));
      const fark = h('span', { sinif: 'tb-mini', metin: Math.abs(v - z.g) > 1e-9 ? '● değişti (' + g1(z.g) + ' → ' + g1(v) + ' g)' : '' });
      const hareket = 'doz ' + g1(z.doz_s) + ' s · ' + (z.tabla_v ? 'tabla ' + g1(z.tabla_v) + ' mm/s, ' + g1(z.tur) + ' tur' : 'tabla ' + g1(z.yayici_dev) + ' dev/dk, 1 tur') + (z.uno ? ' · piston ' + g1(z.strok_mm) + ' mm' : ' · helezon ' + g1(z.helezon_dev) + ' dev/dk');
      return h('div', { sinif: 'tb-gram' }, h('div', { sinif: 'tb-yatay' }, h('b', { metin: z.icerik, stil: { minWidth: '120px' } }), kay, kutu, h('span', { metin: 'g' })),
        h('div', { sinif: 'tb-mini', metin: 'en az ' + g1(z.min) + ' · en çok ' + g1(z.max) + ' g · varsayılan ' + g1(z.varsayilan) + ' g · şimdi: ' + hareket }), fark);
    };
    const on = G.onizle || {};
    kap.append(kart('TOPPING · ürün başına malzeme gramı',
      h('p', { metin: 'Bir pide / lahmacuna konan malzemeyi seçin. Makine tabla dönüşünü ve hareketini bu grama göre hesaplar; bütün yüzey eşit dolar. Kaydet önizleme gösterir.' }),
      h('div', { sinif: 'tb-kpi' }, [[g1(on.hat_eski || 0), 'hat kapasitesi ürün/saat'], [g1(Math.min(...Object.values(on.stok || {}).map(s => s.gun_eski))), 'en az kaset stoğu (gün)']].map(([b, k]) => h('div', {}, h('b', { metin: b }), h('small', { metin: k }))))));
    kap.append(h('div', { sinif: 'tb-iki' }, G.urunler.map(u => kart(u.ad, ...u.doz.map(z => satir(u, z))))));
    kap.append(h('div', { sinif: 'tb-yatay' },
      dug('Kaydet', 'ana', async () => { const dg = gramDegisim(G); if (!dg.length) { bildir('Değişiklik yok'); return; }
        const v = await TBA.islem('personel', () => TB.komut('topping.gramaj_onizle', { degisim: dg }), 'Gramaj için PIN'); if (v && v.onizle) gramOnizleModal(G, dg, v.onizle); }),
      dug('Değişiklikleri geri al', '', () => { for (const u of G.urunler) for (const z of u.doz) delete F[gAd(u.kod, z.kaset)]; ST.gramDokunma = 0; TBA.ciz(); }),
      dug('Hepsini varsayılana çek', '', () => { for (const u of G.urunler) for (const z of u.doz) F[gAd(u.kod, z.kaset)] = String(z.varsayilan); ST.gramDokunma = 0; TBA.ciz(); })));
  };
})();
