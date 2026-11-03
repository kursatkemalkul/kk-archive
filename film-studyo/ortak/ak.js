/* AUTOKITCH · ORTAK ÇEKİRDEK v1 (7 Eki 2026 · müşteri ekranları)
   İçerik: DOM yardımcıları · tema · dil (ak-dil.js sözlüğü) · API istemcisi (gerçek sunucu ya da DEMO) · sipariş yardımcıları + cihaz geçmişi ·
           QR üreteci (bağımlılıksız, bayt kipi, ECC M) · HMI WebSocket köprüsü · yoklama döngüsü · kiosk boşta sayacı.
   Gerçek sunucu: sipariş sunucusu (8790, _local/siparis/sunucu.py) · makine/HMI (8791 WebSocket). Sunucu yoksa ak-demo.js DEMO verisiyle çalışır.
   Sunucudan gelen her metin textContent ile yazılır (innerHTML yalnız bu dosyadaki sabit şablonlarda). */
(function () {
  'use strict';
  const AK = (window.AK = window.AK || {});
  const Q = new URLSearchParams(location.search);
  AK.Q = Q;

  /* ------------------------------------------------------------------ DOM */
  AK.$ = (s, k) => (k || document).querySelector(s);
  AK.$$ = (s, k) => Array.from((k || document).querySelectorAll(s));
  AK.h = function (etiket, oz, ...cocuklar) {
    const e = document.createElement(etiket);
    if (oz) for (const [a, d] of Object.entries(oz)) {
      if (d === false || d == null) continue;
      if (a === 'sinif') e.className = d;
      else if (a === 'metin') e.textContent = d;
      else if (a.startsWith('on') && typeof d === 'function') e.addEventListener(a.slice(2), d);
      else if (a === 'stil' && typeof d === 'object') Object.assign(e.style, d);
      else if (a === 'html') e.innerHTML = d;            // yalnız sabit şablon (ürün resmi, QR)
      else e.setAttribute(a, d === true ? '' : d);
    }
    for (const c of cocuklar.flat()) if (c != null && c !== false) e.append(c.nodeType ? c : document.createTextNode(String(c)));
    return e;
  };
  AK.bos = e => { while (e.firstChild) e.removeChild(e.firstChild); return e; };
  AK.kac = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  AK.bekle = ms => new Promise(r => setTimeout(r, ms));
  AK.sakla = {            // localStorage (kapalıysa bellek)
    _b: {},
    al(k, v) { try { const x = localStorage.getItem(k); return x == null ? v : JSON.parse(x); } catch (e) { return k in this._b ? this._b[k] : v; } },
    yaz(k, d) { try { localStorage.setItem(k, JSON.stringify(d)); } catch (e) { this._b[k] = d; } },
    sil(k) { try { localStorage.removeItem(k); } catch (e) { delete this._b[k]; } },
  };

  /* ------------------------------------------------------------------ tema + dil */
  AK.tema = {
    ayarla(t) { document.documentElement.setAttribute('data-tema', t); AK.sakla.yaz('ak.tema', t); },
    /** sayfanın HTML'deki data-tema değeri (koyu / acik) o ekranın varsayılanıdır (dolap / dış ekran koyu); 'otomatik' ise kullanıcının kayıtlı seçimi geçerli. ?tema= her zaman baskın. */
    uygula() { const v = document.documentElement.getAttribute('data-tema') || 'otomatik'; const t = Q.get('tema') || (v !== 'otomatik' ? v : AK.sakla.al('ak.tema', 'otomatik')); document.documentElement.setAttribute('data-tema', t); },
    degistir() { const g = document.documentElement.getAttribute('data-tema'); const koyu = g === 'koyu' || (g === 'otomatik' && matchMedia('(prefers-color-scheme:dark)').matches); AK.tema.ayarla(koyu ? 'acik' : 'koyu'); },
  };
  AK.dil = {
    kod: 'tr',
    al() { return AK.dil.kod; },
    ayarla(k) { AK.dil.kod = k; AK.sakla.yaz('ak.dil', k); document.documentElement.lang = k; AK.dil.uygula(); window.dispatchEvent(new CustomEvent('ak-dil', { detail: k })); },
    uygula() {          // [data-t] metni · [data-t-ph] placeholder · [data-t-aria] aria-label · [data-t-baslik] title
      AK.$$('[data-t]').forEach(e => { e.textContent = AK.t(e.dataset.t); });
      AK.$$('[data-t-ph]').forEach(e => { e.placeholder = AK.t(e.dataset.tPh); });
      AK.$$('[data-t-aria]').forEach(e => { e.setAttribute('aria-label', AK.t(e.dataset.tAria)); });
      AK.$$('[data-t-baslik]').forEach(e => { e.title = AK.t(e.dataset.tBaslik); });
    },
    baslat() { AK.dil.kod = Q.get('dil') || AK.sakla.al('ak.dil', 'tr'); document.documentElement.lang = AK.dil.kod; },
  };
  AK.t = function (anahtar, v) {
    const S = window.AK_DIL || {};
    let m = (S[AK.dil.kod] || {})[anahtar];
    if (m == null) m = (S.tr || {})[anahtar];
    if (m == null) return anahtar;
    if (v) for (const [a, d] of Object.entries(v)) m = m.split('{' + a + '}').join(d);
    return m;
  };
  /** belirli bir dilde metin (dış ekran: iki dil aynı anda) */
  AK.tDil = function (d, anahtar, v) { const o = AK.dil.kod; AK.dil.kod = d; try { return AK.t(anahtar, v); } finally { AK.dil.kod = o; } };
  /* sunucudan gelen Türkçe ürün adı → seçili dilde (katalogda varsa) */
  AK.urunAd = u => { if (AK.dil.kod !== 'en') return u.ad; const k = (window.AK_KATALOG || {})[u.id]; return u.ad_en || (k && k.ad_en) || u.ad; };
  AK.tl = kurus => (kurus / 100).toLocaleString(AK.dil.kod === 'en' ? 'en-GB' : 'tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' ₺';
  AK.saat = (s, saniye) => new Date(s * 1000).toLocaleTimeString(AK.dil.kod === 'en' ? 'en-GB' : 'tr-TR', saniye ? { hour: '2-digit', minute: '2-digit', second: '2-digit' } : { hour: '2-digit', minute: '2-digit' });
  AK.dk = sn => { sn = Math.max(0, Math.round(sn)); const d = Math.floor(sn / 60), s = sn % 60; return d + ':' + String(s).padStart(2, '0'); };

  /* ------------------------------------------------------------------ bildirim + modal */
  AK.bildir = function (metin, ms) {
    const e = AK.h('div', { sinif: 'ak-bildirim', role: 'status', metin });
    document.body.append(e); setTimeout(() => e.remove(), ms || 3200);
  };
  AK.modal = function (icerik, secenek) {
    const perde = AK.h('div', { sinif: 'ak-modal-perde', role: 'dialog', 'aria-modal': 'true' });
    const kutu = AK.h('div', { sinif: 'ak-modal' }, icerik);
    perde.append(kutu);
    const kapat = () => { perde.remove(); document.removeEventListener('keydown', esc); if (secenek && secenek.kapaninca) secenek.kapaninca(); };
    const esc = e => { if (e.key === 'Escape') kapat(); };
    perde.addEventListener('click', e => { if (e.target === perde) kapat(); });
    document.addEventListener('keydown', esc);
    document.body.append(perde);
    const ilk = kutu.querySelector('button,input,textarea'); if (ilk) ilk.focus();
    return { kapat, kutu };
  };

  /* ------------------------------------------------------------------ API */
  AK.api = {
    taban: Q.get('api') || '', mod: 'bekle',
    /** önce gerçek sunucuyu dener (menü ucu, 2 sn), olmazsa DEMO. ?demo=1 → doğrudan DEMO. */
    async hazir() {
      if (AK.api._hazir) return AK.api._hazir;
      AK.api._hazir = (async () => {
        if (!Q.get('demo')) {
          try {
            const c = new AbortController(); const z = setTimeout(() => c.abort(), 2000);
            const r = await fetch(AK.api.taban + '/api/menu', { signal: c.signal, cache: 'no-store' }); clearTimeout(z);
            if (r.ok && (r.headers.get('content-type') || '').includes('json')) { AK.api.mod = 'gercek'; return 'gercek'; }
          } catch (e) { /* DEMO'ya düş */ }
        }
        AK.api.mod = 'demo';
        if (!window.AK_DEMO) throw new Error('ak-demo.js yüklenmedi');
        return 'demo';
      })();
      return AK.api._hazir;
    },
    async cagir(yontem, yol, govde, baslik) {
      await AK.api.hazir();
      let kod, veri;
      if (AK.api.mod === 'demo') {
        ({ kod, veri } = window.AK_DEMO.istek(yontem, yol, govde || {}, Object.assign({}, AK.oturum.baslik(), baslik || {})));
      } else {
        const r = await fetch(AK.api.taban + yol, { method: yontem, cache: 'no-store',
          headers: { 'Content-Type': 'application/json', ...AK.oturum.baslik(), ...(baslik || {}) }, body: govde !== undefined && yontem !== 'GET' ? JSON.stringify(govde) : undefined });
        kod = r.status; try { veri = await r.json(); } catch (e) { veri = {}; }
      }
      if (kod >= 400) { const h = new Error((veri && veri.hata) || ('HTTP ' + kod)); h.kod = kod; throw h; }
      return veri;
    },
    al(yol) { return AK.api.cagir('GET', yol); },
    gonder(yol, govde) { return AK.api.cagir('POST', yol, govde || {}); },
  };
  /* üye oturumu: anahtar yalnız bu cihazda (localStorage), her çağrıda X-Uye-Anahtar başlığıyla gider (sunucu yalnız özetini tutar) */
  AK.oturum = {
    token() { return AK.sakla.al('ak.token', null); },
    ayarla(t) { if (t) AK.sakla.yaz('ak.token', t); else AK.sakla.sil('ak.token'); },
    baslik() { const t = AK.oturum.token(); return t ? { 'X-Uye-Anahtar': t } : {}; },
  };
  AK.uye = {
    kodIste(telefon, kvkk) { return AK.api.gonder('/api/uye/otp', { telefon, kvkk_izin: !!kvkk }); },
    async dogrula(telefon, kod) { const j = await AK.api.gonder('/api/uye/dogrula', { telefon, kod }); AK.oturum.ayarla(j.anahtar); return j; },
    ben() { return AK.api.al('/api/uye/ben'); },
    siparisler() { return AK.api.al('/api/uye/siparisler'); },
    ad(ad) { return AK.api.gonder('/api/uye/ad', { ad }); },
    ticari(izin) { return AK.api.gonder('/api/uye/ticari', { izin: !!izin }); },
    async sil() { const j = await AK.api.gonder('/api/uye/sil', {}); AK.oturum.ayarla(null); return j; },
    async cikis() { try { await AK.api.gonder('/api/uye/cikis', {}); } catch (e) { /* belirteç zaten geçersiz */ } AK.oturum.ayarla(null); },
  };

  /* ------------------------------------------------------------------ sipariş yardımcıları */
  const BITMIS = ['TESLIM_EDILDI', 'IPTAL', 'IADE'];
  AK.siparis = {
    BITMIS,
    ADIMLAR: [['ODENDI', 'durum.odendi'], ['MAKINE_KABUL', 'durum.makinede'], ['URETIMDE', 'durum.hazirlaniyor'], ['KUTU_HAZIR', 'durum.kutulandi'], ['HAZIR', 'durum.dolapta'], ['TESLIM_EDILDI', 'durum.teslim']],
    adimIndeks(durum) {
      const m = { ODEME_BEKLIYOR: -1, ODENDI: 0, MAKINEYE_GONDERILDI: 1, MAKINE_KABUL: 1, URETIMDE: 2, KUTU_HAZIR: 3, HAZIR: 4, ZAMAN_ASIMI: 4, TESLIM_EDILDI: 5 };
      return durum in m ? m[durum] : -1;
    },
    menu() { return AK.api.al('/api/menu'); },
    olustur(kalemler, secenek) {
      const g = { kaynak: 'QR', kalemler: kalemler.map(k => ({ urun: k.urun, adet: k.adet, not: k.not || undefined })) };
      if (secenek && secenek.telefon) { g.telefon = secenek.telefon; g.kvkk_izin = !!secenek.kvkk; }
      if (secenek && secenek.not) g.not = secenek.not;
      if (secenek && secenek.teslim) g.teslim = secenek.teslim;
      return AK.api.gonder('/api/siparis', g);
    },
    getir(id, e) { return AK.api.al('/api/siparis/' + encodeURIComponent(id) + '?e=' + encodeURIComponent(e)); },
    odemeBaslat(id, e) { return AK.api.gonder('/api/siparis/' + encodeURIComponent(id) + '/odeme-baslat?e=' + encodeURIComponent(e)); },
    ode(id, e, kartTest) { return AK.api.gonder('/api/siparis/' + encodeURIComponent(id) + '/ode?e=' + encodeURIComponent(e), kartTest ? { kart_test: kartTest } : {}); },
    iptal(id, e, neden) { return AK.api.gonder('/api/siparis/' + encodeURIComponent(id) + '/iptal?e=' + encodeURIComponent(e), { neden: neden || 'müşteri iptali' }); },
    ekran() { return AK.api.al('/api/ekran'); },
    /* cihaz geçmişi: erişim anahtarı yalnız bu cihazda (sunucuda üyelik ucu yok → İSTEK) */
    gecmis() { return AK.sakla.al('ak.gecmis', []); },
    kaydet(s, e, ozet) {
      const l = AK.siparis.gecmis().filter(x => x.id !== s.id);
      l.unshift({ id: s.id, e, t: Date.now(), kisa_no: s.kisa_no, toplam: s.toplam_kurus, ozet: ozet || '' });
      AK.sakla.yaz('ak.gecmis', l.slice(0, 30));
    },
    unut(id) { AK.sakla.yaz('ak.gecmis', AK.siparis.gecmis().filter(x => x.id !== id)); },
    /** takip bağlantısı (SMS / QR): bu sayfanın yanındaki takip.html */
    takipUrl(id, e) { const u = new URL('takip.html', location.href.replace(/[?#].*$/, '')); u.searchParams.set('s', id); u.searchParams.set('e', e); if (AK.api.taban) u.searchParams.set('api', AK.api.taban); if (AK.api.mod === 'demo') u.searchParams.set('demo', '1'); return u.href; },
  };

  /** yönetici vitrin ayarı (sunucu /api/vitrin) → AK_VITRIN üzerine biner; uç yoksa varsayılan kalır */
  AK.vitrinYukle = async function () {
    try { const r = await AK.api.al('/api/vitrin'); if (r && r.saatler) window.AK_VITRIN = Object.assign({}, window.AK_VITRIN, r); } catch (e) { /* uç yok → varsayılan vitrin */ }
    return window.AK_VITRIN;
  };

  /* ------------------------------------------------------------------ yoklama */
  AK.dongu = function (fn, ms) {
    let dur = false, zaman = null;
    const tur = async () => { if (dur) return; if (!document.hidden) { try { await fn(); } catch (e) { /* sessiz: sonraki turda yeniden */ } } zaman = setTimeout(tur, ms); };
    tur();
    return { durdur() { dur = true; clearTimeout(zaman); }, simdi() { clearTimeout(zaman); tur(); } };
  };

  /* ------------------------------------------------------------------ HMI WebSocket (makine durumu + dolap olayları) */
  AK.hmi = {
    ws: null, bagli: false, durum: null, dinleyiciler: [],
    adres() { const x = Q.get('hmi'); return (location.protocol === 'https:' ? 'wss://' : 'ws://') + (x || (location.hostname || '127.0.0.1') + ':8791') + '/ws'; },
    abone(fn) { AK.hmi.dinleyiciler.push(fn); },
    baglan() {
      if (AK.hmi.ws || Q.get('demo') || Q.get('hmi') === 'yok') return;      // hmi=yok: İKİZ yığını (HMI sunucusu yok; her şey sipariş sunucusu + MQTT beyni üzerinden)
      let ws;
      try { ws = new WebSocket(AK.hmi.adres()); } catch (e) { return; }
      AK.hmi.ws = ws;
      ws.onopen = () => { AK.hmi.bagli = true; AK.hmi.yay({ tip: 'baglandi' }); };
      ws.onclose = () => { AK.hmi.bagli = false; AK.hmi.ws = null; AK.hmi.yay({ tip: 'koptu' }); setTimeout(AK.hmi.baglan, 3000); };
      ws.onerror = () => { try { ws.close(); } catch (e) { /* */ } };
      ws.onmessage = ev => {
        let m; try { m = JSON.parse(ev.data); } catch (e) { return; }
        if (m.kanal === 'durum') { AK.hmi.durum = m.durum; AK.hmi.yay({ tip: 'durum', durum: m.durum }); }
        else if (m.kanal === 'olay') AK.hmi.yay({ tip: 'olay', olay: m.olay, konu: m.konu });
        else if (m.kanal === 'cevap') { const f = AK.hmi._bekleyen[m.ref]; if (f) { delete AK.hmi._bekleyen[m.ref]; f(m.cevap); } }
      };
    },
    _ref: 0, _bekleyen: {},
    /** HMI'ye komut gönder (ARAYUZ komutları: qr.code_entered …); cevap gelince çözülür, 5 sn'de {ok:false} */
    komut(k) {
      return new Promise(coz => {
        if (!AK.hmi.ws || AK.hmi.ws.readyState !== 1) { coz({ ok: false, hata: 'bağlantı yok' }); return; }
        const ref = ++AK.hmi._ref; AK.hmi._bekleyen[ref] = coz;
        AK.hmi.ws.send(JSON.stringify(Object.assign({}, k, { ref, surum: 'siparis-arayuz/0.1', saat: new Date().toISOString(), kaynak: 'dolap-ekrani' })));
        setTimeout(() => { if (AK.hmi._bekleyen[ref]) { delete AK.hmi._bekleyen[ref]; coz({ ok: false, hata: 'yanıt gelmedi' }); } }, 5000);
      });
    },
    yay(x) { AK.hmi.dinleyiciler.forEach(f => { try { f(x); } catch (e) { console.error(e); } }); },
  };

  /* ------------------------------------------------------------------ kiosk boşta sayacı */
  AK.bosta = function (sn, uyarSn, uyar, sifirla) {
    let son = Date.now(), uyarildi = false;
    const dokun = () => { son = Date.now(); if (uyarildi) { uyarildi = false; uyar(false, 0); } };
    ['pointerdown', 'keydown', 'touchstart', 'click'].forEach(o => addEventListener(o, dokun, { passive: true, capture: true }));
    setInterval(() => {
      const gecen = (Date.now() - son) / 1000;
      if (gecen >= sn) { son = Date.now(); uyarildi = false; uyar(false, 0); sifirla(); }
      else if (gecen >= sn - uyarSn) { uyarildi = true; uyar(true, Math.ceil(sn - gecen)); }
    }, 500);
  };

  /* ------------------------------------------------------------------ QR üreteci (bağımlılıksız · bayt kipi · ECC M · sürüm 1–10) */
  AK.qr = (function () {
    const ECC_BLOK = [0, 10, 16, 26, 18, 24, 16, 18, 22, 22, 26];           // ECC M: blok başına ECC kod sözcüğü
    const BLOK_SAYI = [0, 1, 1, 1, 2, 2, 4, 4, 4, 5, 5];                     // ECC M: blok sayısı
    const sozcukSay = v => { let r = (16 * v + 128) * v + 64; if (v >= 2) { const n = Math.floor(v / 7) + 2; r -= (25 * n - 10) * n - 55; if (v >= 7) r -= 36; } return r; };
    const bit = (x, i) => ((x >>> i) & 1) !== 0;
    function rsCarp(x, y) { let z = 0; for (let i = 7; i >= 0; i--) { z = (z << 1) ^ ((z >>> 7) * 0x11D); z ^= ((y >>> i) & 1) * x; } return z & 255; }
    function rsBolen(derece) { const r = new Array(derece).fill(0); r[derece - 1] = 1; let kok = 1; for (let i = 0; i < derece; i++) { for (let j = 0; j < r.length; j++) { r[j] = rsCarp(r[j], kok); if (j + 1 < r.length) r[j] ^= r[j + 1]; } kok = rsCarp(kok, 0x02); } return r; }
    function rsKalan(veri, bol) { const r = bol.map(() => 0); for (const b of veri) { const f = b ^ r.shift(); r.push(0); bol.forEach((k, i) => { r[i] ^= rsCarp(k, f); }); } return r; }
    function hizaKonum(v) { if (v === 1) return []; const n = Math.floor(v / 7) + 2; const adim = Math.ceil((v * 4 + 4) / (n * 2 - 2)) * 2; const r = [6]; for (let p = v * 4 + 17 - 7; r.length < n; p -= adim) r.splice(1, 0, p); return r; }

    function uret(metin) {
      const bayt = Array.from(new TextEncoder().encode(metin));
      let v = 1; for (; v <= 10; v++) { const kap = (Math.floor(sozcukSay(v) / 8) - ECC_BLOK[v] * BLOK_SAYI[v]) * 8; const baslik = 4 + (v < 10 ? 8 : 16); if (baslik + bayt.length * 8 <= kap) break; }
      if (v > 10) throw new Error('QR: metin çok uzun');
      const boy = v * 4 + 17, kapBit = (Math.floor(sozcukSay(v) / 8) - ECC_BLOK[v] * BLOK_SAYI[v]) * 8;
      const bitler = []; const ekle = (d, n) => { for (let i = n - 1; i >= 0; i--) bitler.push((d >>> i) & 1); };
      ekle(4, 4); ekle(bayt.length, v < 10 ? 8 : 16); bayt.forEach(b => ekle(b, 8));
      ekle(0, Math.min(4, kapBit - bitler.length)); ekle(0, (8 - bitler.length % 8) % 8);
      for (let p = 0xEC; bitler.length < kapBit; p ^= 0xEC ^ 0x11) ekle(p, 8);
      const veri = []; for (let i = 0; i < bitler.length; i += 8) veri.push(parseInt(bitler.slice(i, i + 8).join(''), 2));
      // ECC + iç içe geçirme
      const nb = BLOK_SAYI[v], eccLen = ECC_BLOK[v], ham = Math.floor(sozcukSay(v) / 8), kisaSay = nb - ham % nb, kisaLen = Math.floor(ham / nb);
      const bol = rsBolen(eccLen), bloklar = [];
      for (let i = 0, k = 0; i < nb; i++) { const d = veri.slice(k, k + kisaLen - eccLen + (i < kisaSay ? 0 : 1)); k += d.length; const e = rsKalan(d, bol); if (i < kisaSay) d.push(0); bloklar.push(d.concat(e)); }
      const son = []; for (let i = 0; i < bloklar[0].length; i++) bloklar.forEach((b, j) => { if (i !== kisaLen - eccLen || j >= kisaSay) son.push(b[i]); });
      // matris
      const m = Array.from({ length: boy }, () => new Array(boy).fill(false)), fn = Array.from({ length: boy }, () => new Array(boy).fill(false));
      const kur = (x, y, d) => { m[y][x] = d; fn[y][x] = true; };
      for (let i = 0; i < boy; i++) { kur(6, i, i % 2 === 0); kur(i, 6, i % 2 === 0); }
      const bulucu = (x, y) => { for (let dy = -4; dy <= 4; dy++) for (let dx = -4; dx <= 4; dx++) { const d = Math.max(Math.abs(dx), Math.abs(dy)), xx = x + dx, yy = y + dy; if (xx >= 0 && xx < boy && yy >= 0 && yy < boy) kur(xx, yy, d !== 2 && d !== 4); } };
      bulucu(3, 3); bulucu(boy - 4, 3); bulucu(3, boy - 4);
      const hiza = hizaKonum(v), na = hiza.length;
      for (let i = 0; i < na; i++) for (let j = 0; j < na; j++) { if ((i === 0 && j === 0) || (i === 0 && j === na - 1) || (i === na - 1 && j === 0)) continue; for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) kur(hiza[i] + dx, hiza[j] + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1); }
      const bicim = mask => { const d = (0 << 3) | mask; let r = d; for (let i = 0; i < 10; i++) r = (r << 1) ^ ((r >>> 9) * 0x537); const b = ((d << 10) | r) ^ 0x5412;
        for (let i = 0; i <= 5; i++) kur(8, i, bit(b, i)); kur(8, 7, bit(b, 6)); kur(8, 8, bit(b, 7)); kur(7, 8, bit(b, 8)); for (let i = 9; i < 15; i++) kur(14 - i, 8, bit(b, i));
        for (let i = 0; i < 8; i++) kur(boy - 1 - i, 8, bit(b, i)); for (let i = 8; i < 15; i++) kur(8, boy - 15 + i, bit(b, i)); kur(8, boy - 8, true); };
      bicim(0);
      if (v >= 7) { let r = v; for (let i = 0; i < 12; i++) r = (r << 1) ^ ((r >>> 11) * 0x1F25); const b = (v << 12) | r; for (let i = 0; i < 18; i++) { const x = bit(b, i), a = boy - 11 + i % 3, c = Math.floor(i / 3); kur(a, c, x); kur(c, a, x); } }
      let i = 0;
      for (let sag = boy - 1; sag >= 1; sag -= 2) { if (sag === 6) sag = 5; for (let dik = 0; dik < boy; dik++) for (let j = 0; j < 2; j++) { const x = sag - j, yukari = ((sag + 1) & 2) === 0, y = yukari ? boy - 1 - dik : dik; if (!fn[y][x] && i < son.length * 8) { m[y][x] = bit(son[i >>> 3], 7 - (i & 7)); i++; } } }
      const maske = (mask) => { for (let y = 0; y < boy; y++) for (let x = 0; x < boy; x++) { let t; switch (mask) { case 0: t = (x + y) % 2 === 0; break; case 1: t = y % 2 === 0; break; case 2: t = x % 3 === 0; break; case 3: t = (x + y) % 3 === 0; break;
        case 4: t = (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0; break; case 5: t = x * y % 2 + x * y % 3 === 0; break; case 6: t = (x * y % 2 + x * y % 3) % 2 === 0; break; default: t = ((x + y) % 2 + x * y % 3) % 2 === 0; } if (!fn[y][x] && t) m[y][x] = !m[y][x]; } };
      const ceza = () => { let c = 0; for (let k = 0; k < 2; k++) for (let a = 0; a < boy; a++) { let ser = 1; for (let b = 1; b < boy; b++) { const p = k ? m[b][a] : m[a][b], q = k ? m[b - 1][a] : m[a][b - 1]; if (p === q) { ser++; if (ser === 5) c += 3; else if (ser > 5) c++; } else ser = 1; } }
        for (let y = 0; y < boy - 1; y++) for (let x = 0; x < boy - 1; x++) if (m[y][x] === m[y][x + 1] && m[y][x] === m[y + 1][x] && m[y][x] === m[y + 1][x + 1]) c += 3;
        let koyu = 0; m.forEach(s => s.forEach(d => { if (d) koyu++; })); c += Math.floor(Math.abs(koyu * 20 - boy * boy * 10) / (boy * boy)) * 10; return c; };
      let enIyi = 0, enAz = Infinity;
      for (let mk = 0; mk < 8; mk++) { maske(mk); bicim(mk); const c = ceza(); if (c < enAz) { enAz = c; enIyi = mk; } maske(mk); }
      maske(enIyi); bicim(enIyi);
      return m;
    }
    /** SVG dizgisi (sabit şablon; metin SVG'ye girmez, yalnız yol verisi) */
    function svg(metin, kenar) {
      const m = uret(metin), k = kenar == null ? 3 : kenar, n = m.length + 2 * k; let d = '';
      m.forEach((s, y) => { let x = 0; while (x < s.length) { if (s[x]) { let u = x; while (u < s.length && s[u]) u++; d += 'M' + (x + k) + ',' + (y + k) + 'h' + (u - x) + 'v1h' + (x - u) + 'z'; x = u; } else x++; } });
      return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + n + ' ' + n + '" shape-rendering="crispEdges" role="img"><rect width="100%" height="100%" fill="#fff"/><path d="' + d + '" fill="#111"/></svg>';
    }
    return { uret, svg };
  })();
  AK.qrKutu = (metin, boy) => AK.h('div', { sinif: 'ak-qr', stil: boy ? { width: boy + 'px' } : null, html: AK.qr.svg(metin), 'aria-label': 'QR' });

  /* ------------------------------------------------------------------ başlatma */
  AK.tema.uygula(); AK.dil.baslat();
  document.addEventListener('DOMContentLoaded', () => AK.dil.uygula());
})();
