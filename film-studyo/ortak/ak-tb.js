/* AUTOKITCH · TABLET + YÖNETİCİ İSTEMCİ ÇEKİRDEĞİ v1 (7 Eki 2026 · tablet / stok / G/Ç oturumu)
   ak.js (ortak çekirdek) üstüne: iki arka uç (HMI 8791 = makine / stok / servis · sipariş 8790 = POS / kasa / rapor), PIN girişi + rol,
   sunucu yokken DEMO (ak-tb-demo.js), biçimleme, mini grafik, yazdırma (fiş), boşta oturum kapatma.
   Sunucudan gelen her metin textContent ile yazılır (AK.h). Adresler: ?hmi=host:port  ?sip=host:port  ?demo=1 */
(function () {
  'use strict';
  const AK = window.AK, Q = AK.Q;
  const TB = (window.TB = window.TB || {});
  const ayni = location.port === '8791' || location.port === '8790';
  const h_ = x => (x ? (/^https?:/.test(x) ? x : 'http://' + x) : '');
  TB.hmiTaban = h_(Q.get('hmi')) || (location.port === '8791' ? '' : 'http://127.0.0.1:8791');
  TB.sipTaban = h_(Q.get('sip')) || (location.port === '8790' ? '' : 'http://127.0.0.1:8790');
  TB.mod = { hmi: 'bekle', sip: 'bekle' };         // gercek | demo
  TB.rol = null; TB.ad = null; TB.pin = null;
  const SIRA = { personel: 0, servis: 1, yonetici: 2 };
  TB.yetkili = en_az => !!TB.rol && SIRA[TB.rol] >= SIRA[en_az];

  /* ---------------------------------------------------------------- biçim */
  TB.tl = k => (k / 100).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' ₺';
  TB.tl0 = k => (k / 100).toLocaleString('tr-TR', { maximumFractionDigits: 0 }) + ' ₺';
  TB.f1 = v => (Math.round(v * 10) / 10).toLocaleString('tr-TR');
  TB.sayi = v => (Math.round(v)).toLocaleString('tr-TR');
  TB.saat = t => new Date(t > 1e11 ? t : t * 1000).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  TB.tarihSaat = t => new Date(t > 1e11 ? t : t * 1000).toLocaleString('tr-TR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
  TB.sure = sn => { sn = Math.max(0, Math.round(sn)); return sn >= 3600 ? Math.floor(sn / 3600) + ' sa ' + Math.floor(sn % 3600 / 60) + ' dk' : Math.floor(sn / 60) + ' dk'; };
  TB.TL_ALAN = { kasar: 'kaşar', kiyma: 'kıyma', kusbasi: 'kuşbaşı', sucuk: 'sucuk', harc: 'lahmacun harcı', patates: 'patates', tavuk: 'tavuk' };
  TB.DURUM_AD = { ODEME_BEKLIYOR: 'ödeme bekliyor', ODENDI: 'ödendi', MAKINEYE_GONDERILDI: 'makineye gitti', MAKINE_KABUL: 'makine aldı', URETIMDE: 'hazırlanıyor',
    KUTU_HAZIR: 'kutuda', HAZIR: 'dolapta', TESLIM_EDILDI: 'teslim edildi', IPTAL: 'iptal', IADE: 'iade', ZAMAN_ASIMI: 'dolapta bekliyor', HATA: 'hata' };
  TB.durumSinif = d => ({ HAZIR: 'iyi', TESLIM_EDILDI: 'iyi', ZAMAN_ASIMI: 'uyari', HATA: 'kotu', IPTAL: 'kotu', IADE: 'kotu', ODEME_BEKLIYOR: 'uyari' }[d] || 'vurgu');

  /* ---------------------------------------------------------------- ağ */
  async function ham(taban, yontem, yol, govde, baslik) {
    const c = new AbortController(); const z = setTimeout(() => c.abort(), 6000);
    try {
      const r = await fetch(taban + yol, { method: yontem, signal: c.signal, cache: 'no-store',
        headers: { ...(yontem !== 'GET' ? { 'Content-Type': 'application/json' } : {}), ...(baslik || {}) }, body: govde !== undefined && yontem !== 'GET' ? JSON.stringify(govde) : undefined });   // GET'te Content-Type yok → ön uçuş (OPTIONS) gerekmez
      let v = {}; try { v = await r.json(); } catch (e) { /* boş */ }
      return { kod: r.status, veri: v };
    } finally { clearTimeout(z); }
  }
  TB.hazir = async function () {
    if (TB._hazir) return TB._hazir;
    TB._hazir = (async () => {
      const dene = async (taban, yol) => { try { const c = new AbortController(); const z = setTimeout(() => c.abort(), 2000); const r = await fetch(taban + yol, { signal: c.signal, cache: 'no-store' }); clearTimeout(z); return r.ok && (r.headers.get('content-type') || '').includes('json'); } catch (e) { return false; } };
      if (Q.get('demo')) { TB.mod = { hmi: 'demo', sip: 'demo' }; return TB.mod; }
      const [a, b] = await Promise.all([dene(TB.hmiTaban, '/api/tablet'), dene(TB.sipTaban, '/api/menu')]);
      if (!Q.get('demo') && Q.get('panel') === 'makine' && (!a || !b)) { TB._hazir=null; throw new Error('Makine bağlantısı yok. Bağlantıyı kontrol edip ekranı yeniden açın.'); }
      TB.mod = { hmi: a ? 'gercek' : 'demo', sip: b ? 'gercek' : 'demo' };
      if ((TB.mod.hmi === 'demo' || TB.mod.sip === 'demo') && !window.TB_DEMO) throw new Error('ak-tb-demo.js yüklenmedi');
      return TB.mod;
    })();
    return TB._hazir;
  };
  function pinBaslik() { return TB.pin ? { 'X-Personel-Pin': TB.pin } : {}; }
  TB.istek = async function (hedef, yontem, yol, govde) {         // hedef: 'hmi' | 'sip'
    await TB.hazir();
    let kod, veri;
    if (TB.mod[hedef] === 'demo') ({ kod, veri } = window.TB_DEMO.istek(hedef, yontem, yol, govde || {}, TB.pin ? { rol: TB.rol, ad: TB.ad } : null));
    else ({ kod, veri } = await ham(hedef === 'hmi' ? TB.hmiTaban : TB.sipTaban, yontem, yol, govde, hedef === 'sip' ? pinBaslik() : {}));   // HMI: PIN gövdede (komut) — başlık gönderilmez (ön uçuş sadeleşir)
    if (kod === 401 && TB.pin && !(await TB.pinDogrula())) { TB.cikis(true); }     // tek geçici 401 oturumu düşürmez: PIN sunucuda yeniden doğrulanır, yalnız o da 401 verirse çıkış
    if (kod >= 400) { const e = new Error((veri && (veri.hata || veri.message)) || ('HTTP ' + kod)); e.kod = kod; e.veri = veri; throw e; }
    return veri;
  };
  TB.hmiAl = yol => TB.istek('hmi', 'GET', yol);
  TB.sipAl = yol => TB.istek('sip', 'GET', yol);
  TB.sipGonder = (yol, g) => TB.istek('sip', 'POST', yol, g || {});
  /** HMI tablet komutu (PIN + rol gövdeye eklenir). Hata → özel durum; ok:false cevaplar da özel durum olur (metin = sunucunun hatası). */
  TB.komut = async function (tip, k) {
    if (!TB.pin) throw Object.assign(new Error('Giriş gerekli'), { kod: 401 });
    const v = await TB.istek('hmi', 'POST', '/api/tablet/komut', Object.assign({}, k, { tip, rol: TB.rol, pin: TB.pin }));
    if (v && v.ok === false) throw Object.assign(new Error(v.hata || 'reddedildi'), { veri: v });
    return v;
  };

  /* ---------------------------------------------------------------- giriş (PIN) */
  TB.girisYap = async function (pin) {
    await TB.hazir();
    let v;
    if (TB.mod.sip === 'demo' || TB.mod.hmi === 'demo' && TB.mod.sip !== 'gercek') {
      ({ veri: v } = { veri: window.TB_DEMO.pinCoz(pin) });
      if (!v) throw Object.assign(new Error('PIN yanlış'), { kod: 401 });
    } else {
      const r = await ham(TB.sipTaban, 'GET', '/api/ben', undefined, { 'X-Personel-Pin': pin });
      if (r.kod !== 200) throw Object.assign(new Error(r.kod === 401 ? 'PIN yanlış' : (r.veri.hata || 'giriş reddedildi')), { kod: r.kod });
      v = r.veri;
    }
    TB.pin = pin; TB.rol = v.rol; TB.ad = v.ad; TB.sonDokunus = Date.now(); TB.pinZaman = Date.now();
    window.dispatchEvent(new CustomEvent('tb-giris'));
    return v;
  };
  TB.cikis = function (sessiz) {
    TB.pin = null; TB.rol = null; TB.ad = null;
    window.dispatchEvent(new CustomEvent('tb-cikis', { detail: { sessiz: !!sessiz } }));
  };
  /** Oturum VARDİYA boyunca kalır: boşta kapanma yalnız çok uzun (VARDIYA_SN = 14 sa) boşlukta; işlem sürerken (TB.mesgul > 0) kapanmaz.
      Yetki gerektiren işlemde PIN yine sorulur (TB.yetkiGerek → PIN_TAZE_SN içinde girilmediyse). Eski çağrılar bostaKapat(300/600) ile gelse bile alt sınır VARDIYA_SN. */
  TB.VARDIYA_SN = 14 * 3600; TB.PIN_TAZE_SN = 120; TB.mesgul = 0;
  TB.bostaKapat = function (sn) {
    sn = Math.max(sn || 0, TB.VARDIYA_SN);
    ['pointerdown', 'pointermove', 'keydown', 'touchstart', 'wheel'].forEach(o => addEventListener(o, () => { TB.sonDokunus = Date.now(); }, { passive: true }));
    setInterval(() => TB.bostaKontrol(sn), 5000);
  };
  TB.bostaKontrol = function (sn) { if (TB.pin && !TB.mesgul && Date.now() - (TB.sonDokunus || 0) > sn * 1000) { TB.cikis(); AK.bildir('Vardiya boyunca işlem yok — oturum kapandı'); return true; } return false; };
  /** PIN hâlâ geçerli mi (sunucuda)? Ağ yoksa / demo ise geçerli say (oturum ağ kopmasında düşmez). */
  TB.pinDogrula = async function () {
    if (!TB.pin) return false;
    if (TB.mod.sip !== 'gercek') return true;
    try { const r = await ham(TB.sipTaban, 'GET', '/api/ben', undefined, { 'X-Personel-Pin': TB.pin }); return r.kod !== 401; } catch (e) { return true; }
  };  /** PIN penceresi: tuş takımı (AK tasarım dili). Başarıda çözülür. en_az: gerekli rol (yetersizse mesaj). */
  TB.pinSor = function (en_az, baslik) {
    return new Promise(coz => {
      let giris = '';
      const nokta = AK.h('div', { sinif: 'tb-pin-nokta', 'aria-live': 'polite' });
      const hata = AK.h('div', { sinif: 'ak-hata' });
      const guncelle = () => { nokta.textContent = '●'.repeat(giris.length) + '○'.repeat(Math.max(0, 4 - giris.length)); };
      const tus = AK.h('div', { sinif: 'ak-tus-izgara' });
      const bas = t => async () => {
        if (t === '⌫') giris = giris.slice(0, -1);
        else if (t === '✓') {
          if (!giris) return;
          try { const v = await TB.girisYap(giris); if (en_az && !TB.yetkili(en_az)) { hata.textContent = 'Bu işlem için ' + en_az + ' yetkisi gerekir'; TB.cikis(true); giris = ''; guncelle(); return; } coz(v); m.kapat(); return; }       // ÖNCE çöz: m.kapat() kapaninca→coz(null) tetikler ve ilk işlem kayboluyordu (P4x)
          catch (e) { hata.textContent = e.message; giris = ''; guncelle(); return; }
        } else if (giris.length < 8) { giris += t; hata.textContent = ''; }
        guncelle();
      };
      [1, 2, 3, 4, 5, 6, 7, 8, 9, '⌫', 0, '✓'].forEach(t => tus.append(AK.h('button', { type: 'button', sinif: t === '✓' ? 'ana' : (t === '⌫' ? 'ik' : ''), metin: String(t), 'aria-label': t === '⌫' ? 'sil' : t === '✓' ? 'giriş' : String(t), onclick: bas(t) })));
      const m = AK.modal(AK.h('div', { sinif: 'ak-sutun' }, AK.h('h2', { metin: baslik || 'PIN ile giriş' }), nokta, hata, tus,
        AK.h('button', { sinif: 'ak-dugme hayalet tam', type: 'button', metin: 'Vazgeç', onclick: () => { m.kapat(); coz(null); } })), { kapaninca: () => coz(null) });
      guncelle();
      const klavye = e => { if (/^\d$/.test(e.key)) bas(e.key)(); else if (e.key === 'Backspace') bas('⌫')(); else if (e.key === 'Enter') bas('✓')(); };
      document.addEventListener('keydown', klavye); const k0 = m.kapat; m.kapat = () => { document.removeEventListener('keydown', klavye); k0(); };
    });
  };
  /** işlem öncesi: giriş yoksa PIN sor; rol yetmezse reddet. Dönüş: true/false */
  TB.yetkiGerek = async function (en_az, baslik) {
    if (TB.pin && TB.yetkili(en_az || 'personel')) {
      if (SIRA[en_az || 'personel'] === 0 || Date.now() - (TB.pinZaman || 0) < TB.PIN_TAZE_SN * 1000) return true;     // yetki gerektiren işlem: PIN taze değilse yeniden sor
      const v = await TB.pinSor(en_az, baslik || 'PIN ile onayla'); return !!v;
    }
    if (TB.pin) { AK.bildir('Bu işlem için ' + en_az + ' yetkisi gerekir'); return false; }
    const v = await TB.pinSor(en_az || 'personel', baslik);
    return !!v;
  };

  /* ---------------------------------------------------------------- küçük grafikler (satır içi SVG, sabit şablon) */
  TB.cubuk = function (veri, etiketFn, degerFn, ac) {
    const W = 560, H = 170, p = 26, mx = Math.max(1, ...veri.map(degerFn));
    const n = veri.length, bw = (W - 2 * p) / Math.max(n, 1);
    let s = '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="grafik" style="width:100%;height:auto">';
    veri.forEach((x, i) => {
      const hh = (H - 2 * p) * degerFn(x) / mx, xx = p + i * bw + bw * 0.14;
      s += '<rect x="' + xx.toFixed(1) + '" y="' + (H - p - hh).toFixed(1) + '" width="' + (bw * 0.72).toFixed(1) + '" height="' + Math.max(hh, 1).toFixed(1) + '" rx="3" fill="var(--ak-vurgu)" opacity=".85"/>';
      if (n <= 14 || i % Math.ceil(n / 12) === 0) s += '<text x="' + (xx + bw * 0.36).toFixed(1) + '" y="' + (H - 8) + '" font-size="9" text-anchor="middle" fill="var(--ak-soluk)">' + AK.kac(String(etiketFn(x))) + '</text>';
    });
    s += '<line x1="' + p + '" y1="' + (H - p) + '" x2="' + (W - p) + '" y2="' + (H - p) + '" stroke="var(--ak-cizgi)"/></svg>';
    return AK.h('div', { html: s });
  };
  TB.yatayCubuk = function (satirlar, ad, deger, goster) {
    const mx = Math.max(1, ...satirlar.map(deger));
    return AK.h('div', { sinif: 'ak-sutun' }, satirlar.map(x => AK.h('div', { sinif: 'tb-yc' },
      AK.h('span', { sinif: 'tb-yc-ad', metin: ad(x) }),
      AK.h('span', { sinif: 'tb-yc-cubuk' }, AK.h('i', { stil: { width: (100 * deger(x) / mx).toFixed(1) + '%' } })),
      AK.h('b', { sinif: 'tb-yc-deger', metin: goster(x) }))));
  };

  /* ---------------------------------------------------------------- fiş (yazdır) */
  TB.fisYazdir = function (f) {
    const w = window.open('', '_blank', 'width=360,height=640');
    if (!w) { AK.bildir('Açılır pencere engellendi — fişi tarayıcı ayarından izin verin'); return; }
    const satir = f.kalemler.map(k => '<tr><td>' + AK.kac(k.ad) + '</td><td>' + k.adet + '×</td><td style="text-align:right">' + TB.tl(k.tutar_kurus) + '</td></tr>').join('');
    w.document.write('<!doctype html><meta charset="utf-8"><title>Fiş</title><style>body{font:13px/1.4 monospace;width:300px;margin:8px auto}table{width:100%;border-collapse:collapse}hr{border:0;border-top:1px dashed #000}.k{font-size:11px;margin-top:10px}</style>' +
      '<h3 style="text-align:center;margin:4px">' + AK.kac(f.isletme) + '</h3><div style="text-align:center">' + AK.kac(f.tarih) + ' · No ' + f.fis_no + '</div><hr><table>' + satir + '</table><hr>' +
      '<table><tr><td>KDV %' + Math.round(f.kdv_orani * 100) + '</td><td style="text-align:right">' + TB.tl(f.kdv_kurus) + '</td></tr><tr><td><b>TOPLAM</b></td><td style="text-align:right"><b>' + TB.tl(f.toplam_kurus) + '</b></td></tr></table>' +
      '<div>Ödeme: ' + AK.kac(f.odeme_yontemi || '') + '</div>' + (f.verilen_kurus != null ? '<div>Verilen: ' + TB.tl(f.verilen_kurus) + ' · <b>Para üstü: ' + TB.tl(f.para_ustu_kurus) + '</b></div>' : '') +
      (f.okc_fis_no ? '<div>ÖKC fiş no: <b>' + AK.kac(f.okc_fis_no) + '</b></div>' : '') + (f.teslim_kodu ? '<div>Teslim kodu: <b>' + AK.kac(f.teslim_kodu) + '</b></div>' : '') +
      (f.e_arsiv ? '<div class="k">e-Arşiv: ' + AK.kac(f.e_arsiv.belge_no) + '</div>' : '') + '<div class="k">' + AK.kac(f.not_) + '</div>');
    w.document.close(); w.focus(); setTimeout(() => w.print(), 250);
  };
  TB.bagKurus = v => Math.round(parseFloat(String(v).replace(',', '.')) * 100);
  /** Rapor CSV indir (yönetici; <a href> PIN başlığı gönderemez → fetch + blob). Gerçek sunucu: ?bicim=csv (UTF-8 BOM, ';' — Excel); DEMO: aynı rapordan CSV üretilir. */
  TB.csvIndir = async function (yol, dosya) {
    await TB.hazir();
    let blob;
    if (TB.mod.sip === 'demo') {
      const r = await TB.sipAl(yol), t = x => (x / 100).toFixed(2).replace('.', ',');
      const satir = (r.satirlar || []).map(x => [x.ad, x.adet, t(x.ciro_kurus || 0)].join(';')).concat([['TOPLAM', r.siparis_adet, t(r.ciro_kurus || 0)].join(';')]);
      blob = new Blob(['\ufeff' + [[r.grup || 'ad', 'adet', 'ciro_tl'].join(';')].concat(satir).join('\r\n')], { type: 'text/csv;charset=utf-8' });
    } else {
      const c = await fetch(TB.sipTaban + yol + (yol.includes('?') ? '&' : '?') + 'bicim=csv', { headers: pinBaslik(), cache: 'no-store' });
      if (!c.ok) { let m = 'HTTP ' + c.status; try { m = (await c.json()).hata || m; } catch (e) { /* gövde yok */ } throw new Error(m); }
      blob = await c.blob();
    }
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = dosya; document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  };
})();
