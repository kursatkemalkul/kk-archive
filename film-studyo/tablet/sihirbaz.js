/* AUTOKITCH · TABLET · R25 TEDARİK TURU + R26 TEMİZLİK SİHİRBAZI (10 Eki 2026 gece, Kemal istek listesi)
   Mevcut tek kalemlik DOLDUR akışı (dolum.iste / dolum.cekmece / dolum.bitti) bunun bir ADIMI olur: tur her istasyon için aynı komutları sırayla kullanır.
   R25: "Tedarik geldi, süreci başlat" (PIN) → makine ilgili istasyonları güvenle durdurur → sırayla: hamur çekmeceleri (boş / az olanlar, FIFO ve SKT'ye göre) · içecek · tatlı · kutu şarjörü ·
        TOPPING kasetleri (kaşar / sucuk dahil) · K yağ. Her adımda makine çekmeceyi / kapağı AÇAR; "doldurdun mu?" → Evet (kapanır, sıradaki) · Atla. Parti / SKT (barkod ya da elle) + adet; sonunda özet,
        stok güncelleme (dolum.bitti), HACCP kaydı (tur.bitir) ve makine üretime döner. İlerleme sunucuda saklanır (tablet yenilense de kaldığı yerden) ve ikiz.durum.tur olarak İKİZ'e gider.
   R26: TOPPING söküm / takma sırasına göre adım adım temizlik (kaset çıkar → MEIKO → tak → sensör "kaset var" doğrular), günlük / haftalık, HACCP kaydı (sihirbaz.bitir). */
(function () {
  'use strict';
  const { h, bildir } = AK;
  const { ST, SEK, kart, rozet, dug, giris } = TBA;
  const komutla = (en_az, tip, k, mesaj, baslik) => TBA.islem(en_az, async () => { const v = await TB.komut(tip, k); if (mesaj) bildir(typeof mesaj === 'function' ? mesaj(v) : mesaj); return v; }, baslik);
  const girisKarti = (baslik, metin) => kart(baslik, h('p', { metin }), dug('PIN ile giriş', 'ana', async () => { await TB.pinSor('personel'); TBA.ciz(); }));
  const GRUP_SIRA = ['HAMUR_LAHM', 'HAMUR_PIDE', 'ICECEK', 'TATLI'];
  const GRUP_AD = { HAMUR_LAHM: 'lahmacun hamuru', HAMUR_PIDE: 'pide hamuru', ICECEK: 'içecek', TATLI: 'tatlı' };
  const GRUP_KALEM = { HAMUR_LAHM: 'hamur_lahm', HAMUR_PIDE: 'hamur_pide', ICECEK: 'kola', TATLI: 'tatli' };
  const KAP_YEDEK = { HAMUR_LAHM: 45, HAMUR_PIDE: 30, ICECEK: 48, TATLI: 12 };
  const IST_AD = { B: 'B çekmeceleri', E: 'E kutu şarjörü', TOP: 'TOPPING kasetleri', K: 'K yağ tenekesi' };
  const SIMDI = () => Date.now();
  const AZ_ORAN = 0.5;            // çekmece "boş / az": adet ≤ hedefin %50'si

  /* ============================================================ PLAN */
  function planla(D, plan) {
    const A = [];
    const cek = D.cekmeceler || {};
    const ipucu = {};
    ((plan && plan.kalemler) || []).forEach(x => { ipucu[x.id] = x; });
    GRUP_SIRA.forEach(g => {
      Object.entries(cek).filter(([, v]) => v.icerik === g).map(([c, v]) => ({ c, v, hedef: v.yuva_kap || KAP_YEDEK[g] })).filter(x => (x.v.adet || 0) <= x.hedef * AZ_ORAN)
        .sort((a, b) => (a.v.adet || 0) - (b.v.adet || 0) || (a.v.fifo_sira || 0) - (b.v.fifo_sira || 0))                       // en boş önce; eşitse FIFO sırası
        .forEach(x => A.push({ id: 'B:' + x.c, ist: 'B', tur: 'cekmece', cekmece: x.c, kalem: GRUP_KALEM[g], ad: GRUP_AD[g] + ' · ' + x.c.replace('_', ' · '), mevcut: x.v.adet || 0, hedef: x.hedef, durum: 'bekle', fifo: x.v.fifo_sira, ipucu: (ipucu[GRUP_KALEM[g]] || {}).son_kullanma || null }));
    });
    const stok = D.stok || [];
    if (!A.some(a => a.ist === 'B')) {                          // çekmece verisi yoksa (ikiz dışı) kalem düzeyinde
      stok.filter(x => x.istasyon === 'B' && x.ekle_makine > 0).forEach(x => A.push({ id: 'B:' + x.id, ist: 'B', tur: 'kalem', kalem: x.id, ad: x.ad, mevcut: Math.round(x.makine), hedef: Math.round(x.makine_hedef), durum: 'bekle' }));
    }
    [['E', x => x.istasyon === 'E'], ['TOP', x => x.istasyon === 'TOP'], ['K', x => x.istasyon === 'K']].forEach(([ist, suz]) => {
      stok.filter(x => suz(x) && x.ekle_makine > 0).forEach(x => A.push({ id: ist + ':' + x.id, ist, tur: 'kalem', kalem: x.id, ad: x.ad, mevcut: Math.round(x.makine), hedef: Math.round(x.makine_hedef), durum: 'bekle' }));
    });
    return A;
  }
  const SORU = { hamur_pide: 'Pide hamurunu doldurdun mu?', hamur_lahm: 'Lahmacun hamurunu doldurdun mu?', kola: 'Kolayı yerleştirdin mi?', tatli: 'Tatlıyı yerleştirdin mi?', kutu: 'Kutu kartonunu doldurdun mu?', yag: 'Yağı doldurdun mu?' };
  const soruMetni = a => SORU[a.kalem] || ((a.ad || 'Ürün').replace(/ ·.*$/, '').replace(/\s*\(.*\)\s*$/, '') + ' kasetini doldurdun mu?');
  const istasyonlar = T => [...new Set(T.adimlar.map(a => a.ist))];
  const kaydet = T => komutla('personel', 'tur.kaydet', { durum: T });
  const mevcutT = () => (ST.turYerel !== undefined ? ST.turYerel : ((ST.D && ST.D.tur) || null));
  const ilerleme = T => T.adimlar.filter(a => a.durum === 'tamam' || a.durum === 'atlandi').length;

  async function turBasla() {
    let plan = null;
    try { plan = await TB.hmiAl('/api/tablet/plan?ist=B'); } catch (e) { /* ipucu isteğe bağlı */ }
    const adimlar = planla(ST.D, plan);
    if (!adimlar.length) { bildir('Doldurulacak kalem yok — her şey yeterli'); return; }
    const T = { asama: 'liste', adimlar, i: 0, t0: SIMDI(), istasyonlar: istasyonlar({ adimlar }) };
    ST.turYerel = T;
    await komutla('personel', 'tur.kaydet', { durum: T }, 'Tedarik turu hazır: ' + adimlar.length + ' adım');
    TBA.ciz();
  }
  const dolumVar = ist => !!((ST.D && ST.D.dolum) || {})[ist];
  async function istasyonIste(ist) {                // R25: istasyonlar SIRAYLA durdurulur (üçü birden hava boşaltınca HAVA_YOK doğuyordu)
    if (!dolumVar(ist)) await komutla('personel', 'dolum.iste', { istasyon: ist }, null);
  }
  async function turDurdur() {                       // yalnız İLK adımın istasyonu durdurulur; sıradaki istasyon önceki kapanınca istenir
    const T = mevcutT();
    await istasyonIste(T.adimlar[0].ist);
    T.asama = 'adim';
    ST.turYerel = T; await kaydet(T); TBA.ciz();
  }
  async function istasyonKapat(T, ist) {             // bu istasyonun adımları bitti → dolumu kapat (kapak kapalı olmalı; program doğrular)
    if (!dolumVar(ist) || (T.kapali || {})[ist]) return true;
    TBA.sonHata = null;
    const r = await komutla('personel', 'dolum.bitti', { istasyon: ist, sayim: sayimHesapla(T, ist), cekmece_sayim: cekmeceSayimi(T, ist) }, null);
    if (!r) { T.ret = { ist, neden: TBA.sonHata || 'program / stok denetimi reddetti — kapağı kapatıp tekrar deneyin' }; ST.turYerel = T; await kaydet(T); TBA.ciz(); return false; }
    (T.kapali = T.kapali || {})[ist] = true; T.ret = null;
    return true;
  }
  async function turIptal(T) {                       // 'Vazgeç' / 'Turu iptal et': açılan BÜTÜN dolum istekleri kapatılır
    const D = ST.D || {};
    for (const ist of T.istasyonlar) {
      if (!dolumVar(ist) || (T.kapali || {})[ist]) continue;
      const durum = D.dolum[ist];
      if (durum === 'ACIK') { bildir(IST_AD[ist] + ' kapağı AÇIK — önce kapatın, sonra tekrar "Turu iptal et"'); return; }
      TBA.sonHata = null;
      if (durum === 'KAPANDI') await komutla('personel', 'dolum.bitti', { istasyon: ist, sayim: sayimHesapla(T, ist), cekmece_sayim: cekmeceSayimi(T, ist) }, null);
      else await komutla('personel', 'dolum.iptal', { istasyon: ist }, null);
      if (TBA.sonHata) { bildir(IST_AD[ist] + ': ' + TBA.sonHata); return; }
      (T.kapali = T.kapali || {})[ist] = true;
    }
    ST.turYerel = null; await komutla('personel', 'tur.bitir', { ozet: { iptal: true, baslangic: T.t0 } }, 'Tedarik turu iptal edildi — istasyonlar üretime dönüyor'); TBA.ciz();
  }
  async function adimBitir(T, a, sonuc) {          // sonuc: 'tamam' | 'atlandi'
    a.durum = sonuc; a.t = SIMDI();
    if (a.tur === 'cekmece') {                       // EMNİYET: kapatma yalnız basılı tutarak (adım ekranında); burada otomatik kapatma YOK
      const v = (ST.D.cekmeceler || {})[a.cekmece];
      if (v && v.konum > 1) { a.durum = 'bekle'; bildir('Önce çekmeceyi kapatın — düğmeyi BASILI TUTUN'); return; }
    }
    const sonraki = T.adimlar[T.i + 1];
    if (!sonraki || sonraki.ist !== a.ist) {         // istasyonun son adımı: dolumu kapat, sıradaki istasyonu iste
      if (!(await istasyonKapat(T, a.ist))) { a.durum = 'bekle'; return; }
      if (sonraki) await istasyonIste(sonraki.ist);
    }
    T.i = Math.min(T.i + 1, T.adimlar.length);
    if (T.i >= T.adimlar.length) T.asama = 'ozet';
    ST.turYerel = T; await kaydet(T); TBA.ciz();
  }
  function cekmeceSayimi(T, ist) {
    if (ist !== 'B') return {};
    const out = {};
    Object.entries(ST.D.cekmeceler || {}).forEach(([c, v]) => {
      const a = T.adimlar.find(x => x.cekmece === c && x.durum === 'tamam');
      out[c] = a ? +(a.sonra ?? a.hedef) : +(v.adet || 0);
    });
    return out;
  }
  function sayimHesapla(T, ist) {
    const sayim = {};
    if (ist === 'B') {
      const cek = ST.D.cekmeceler || {};
      GRUP_SIRA.forEach(g => {
        const adm = T.adimlar.filter(a => a.ist === 'B' && a.tur === 'cekmece' && a.kalem === GRUP_KALEM[g]);
        if (!adm.length) return;
        let top = 0;
        Object.entries(cek).filter(([, v]) => v.icerik === g).forEach(([c, v]) => { const a = adm.find(x => x.cekmece === c); top += a && a.durum === 'tamam' ? +(a.sonra ?? a.hedef) : (v.adet || 0); });
        sayim[GRUP_KALEM[g]] = top;
      });
    }
    T.adimlar.filter(a => a.ist === ist && a.tur !== 'cekmece').forEach(a => { sayim[a.kalem] = a.durum === 'tamam' ? +(a.sonra ?? a.hedef) : +a.mevcut; });
    return sayim;
  }
  async function turBitir(T) {
    const sonuclar = {};
    for (const ist of T.istasyonlar) {
      const sayim = sayimHesapla(T, ist);
      TBA.sonHata = null;
      const r = (((ST.D.dolum || {})[ist]) && !(T.kapali || {})[ist]) ? await komutla('personel', 'dolum.bitti', { istasyon: ist, sayim, cekmece_sayim: cekmeceSayimi(T, ist) }, null) : { ok: true };
      sonuclar[ist] = r ? 'tamam' : (TBA.sonHata || 'reddedildi');
      if (!r) {                                       // reddedildi: nedeni ekranda kalıcı göster, tur AÇIK kalır
        T.ret = { ist, neden: TBA.sonHata || 'program / stok denetimi reddetti' }; ST.turYerel = T; await kaydet(T); TBA.ciz(); return;
      }
    }
    const ozet = { baslangic: T.t0, bitis: SIMDI(), istasyonlar: sonuclar, adimlar: T.adimlar.map(a => ({ id: a.id, ad: a.ad, durum: a.durum, mevcut: a.mevcut, sonra: a.sonra ?? (a.durum === 'tamam' ? a.hedef : a.mevcut), parti: a.parti || null, skt: a.skt || null, uretim_utc: a.uretim_utc || null })) };
    await komutla('personel', 'tur.bitir', { ozet }, 'Tedarik turu bitti — stok güncellendi, HACCP kaydı yazıldı, makine üretime döndü');
    ST.turYerel = null; TBA.ciz();
  }

  /* ============================================================ EKRAN · TEDARİK */
  SEK.MAKINE.tedarik = function (kap) {
    const D = ST.D; if (!D) return;
    if (!TB.pin) { kap.append(girisKarti('Tedarik turu', 'Tedarik geldiğinde süreci başlatmak için giriş yapın.')); return; }
    if (ST.turYerel === null && !D.tur) ST.turYerel = undefined;               // sunucu da boşaldı → sunucuyla eşitle
    const T = mevcutT();
    if (!T) {
      kap.append(kart('Tedarik turu', h('p', { metin: 'Tedarikçi ürünleri getirdi mi? Uygulama sizi sırayla yönlendirir: hamur çekmeceleri (boş / az olanlar, FIFO ve son kullanma tarihine göre), içecek, tatlı, kutu şarjörü, TOPPING kasetleri (kaşar / sucuk dahil), yağ. Her adımda makine ilgili çekmeceyi ya da kapağı açar; siz doldurup "Evet" dersiniz.' }),
        dug('📦 Tedarik geldi — süreci başlat', 'ana tam', () => turBasla()),
        (D.tur_kayit || []).length ? h('div', { sinif: 'tb-mini', stil: { marginTop: '10px' }, metin: 'Son turlar: ' + D.tur_kayit.filter(x => x.tur === 'tur').map(x => TB.tarihSaat(x.t) + ' · ' + x.kim).join('  |  ') }) : null));
      return;
    }
    const n = T.adimlar.length;
    const baslik = h('div', { sinif: 'tb-yatay' }, rozet('Tedarik turu', 'vurgu'), h('b', { metin: ' ' + ilerleme(T) + ' / ' + n + ' adım tamam' }), h('div', { sinif: 'tb-cubuk', stil: { flex: 1, marginLeft: '10px' } }, h('i', { stil: { width: Math.round(100 * ilerleme(T) / n) + '%' } })));
    if (T.ret) kap.append(h('div', { sinif: 'ak-ipucu kotu', id: 'tur-ret', role: 'alert', metin: T.ret.ist + ' sayımı ONAYLANMADI: ' + T.ret.neden + ' — adımları düzeltip "Turu bitir"e yeniden basın.' }));
    if (T.asama === 'liste') {
      kap.append(kart('Tedarik turu planı', baslik,
        h('table', { sinif: 'tb-t' }, T.adimlar.map((a, i) => h('tr', {}, h('td', { metin: String(i + 1) }), h('td', {}, h('b', { metin: a.ad }), a.ipucu ? h('div', { sinif: 'tb-mini', metin: 'en eski parti SKT ' + String(a.ipucu).slice(0, 16).replace('T', ' ') }) : null), h('td', { sinif: 's', metin: (a.mevcut ?? '') + ' → ' + (a.hedef ?? '') }), h('td', { metin: IST_AD[a.ist] })))),
        h('p', { sinif: 'tb-mini', metin: 'Başlayınca makine bu istasyonları güvenle durdurur (robot ve istasyon durur): ' + T.istasyonlar.map(i => IST_AD[i]).join(', ') + '.' }),
        h('div', { sinif: 'tb-yatay' }, dug('▶ Süreci başlat — makine durdurulsun', 'ana tam', () => turDurdur()), dug('Vazgeç', '', () => turIptal(T)))));
      return;
    }
    if (T.asama === 'ozet') {
      kap.append(kart('Tedarik turu özeti', baslik,
        h('table', { sinif: 'tb-t' }, h('tr', {}, ['Kalem', 'Önce', 'Sonra', 'Parti', 'SKT', 'Durum'].map((t, i) => h('th', { sinif: i && i < 3 ? 's' : '', metin: t }))),
          T.adimlar.map(a => h('tr', {}, h('td', { metin: a.ad }), h('td', { sinif: 's', metin: String(a.mevcut ?? '') }), h('td', { sinif: 's', metin: a.durum === 'tamam' ? String(a.sonra ?? a.hedef) : String(a.mevcut ?? '') }), h('td', { metin: a.parti || '' }), h('td', { metin: a.skt || '' }), h('td', {}, rozet(a.durum === 'tamam' ? 'dolduruldu' : 'atlandı', a.durum === 'tamam' ? 'iyi' : 'uyari'))))),
        dug('✓ Turu bitir — stoğu güncelle, HACCP kaydını yaz, makineyi üretime döndür', 'ana tam', () => turBitir(T))));
      return;
    }
    // ---- adım ekranı
    const a = T.adimlar[T.i];
    const dolum = (D.dolum || {})[a.ist];
    const hazir = ['HAZIR', 'ACIK', 'KAPANDI'].includes(dolum);
    const acik = a.tur === 'cekmece' ? (((D.cekmeceler || {})[a.cekmece] || {}).konum || 0) > 1 : dolum === 'ACIK';
    const bekle = !hazir ? h('div', { sinif: 'ak-ipucu uyari', metin: IST_AD[a.ist] + ' güvenle durduruluyor… (ürün çıkışı bekleniyor)' }) : null;
    const digerAcik = a.tur === 'cekmece' && Object.entries(D.cekmeceler || {}).some(([c, v]) => c !== a.cekmece && (v.konum || 0) > 1);
    const adetG = giris({ type: 'number', min: 0, value: a.sonra ?? a.hedef, 'data-tur-adet': a.id, oninput: e => { a.sonra = +e.target.value; } });
    const partiG = giris({ placeholder: 'Parti no / barkod', value: a.parti || '', 'data-tur-parti': a.id, oninput: e => { a.parti = e.target.value; } });
    const sktG = giris({ placeholder: 'SKT (GG.AA.YYYY ya da barkod: parti|SKT)', value: a.skt || '', 'data-tur-skt': a.id, oninput: e => { const v = e.target.value; const p = v.split(/[|;]/); if (p.length > 1) { a.parti = p[0]; a.skt = p[1]; partiG.value = a.parti; sktG.value = a.skt; } else a.skt = v; } });
    const uretimG = a.tur === 'cekmece' ? giris({ type: 'datetime-local', value: a.uretimYerel || '', oninput: e => { a.uretimYerel = e.target.value; } }) : null;
    const gramG = a.ist === 'TOP' ? giris({ type: 'number', min: 0, placeholder: 'Kaseti koyduğunuz GRAM (boş = tam kaset)', value: a.gram ?? '', 'data-tur-gram': a.id, oninput: e => { a.gram = e.target.value; } }) : null;       // TOPPING DOLULUK: kalan gram buradan başlar
    const evet = dug('✓ Evet, doldurdum', 'ana', async () => {
      if (a.tur === 'cekmece' && acik) { bildir('Önce çekmeceyi kapatın — düğmeyi BASILI TUTUN'); const u = kap.querySelector('#tur-uyari'); if (u) u.textContent = 'Çekmece açık — kapatma düğmesini BASILI TUTUN (bırakınca durur).'; return; }
      if (a.tur !== 'cekmece' && dolum !== 'KAPANDI') { bildir('Önce kapağı kapatın (durum ' + (dolum || '—') + ')'); const u = kap.querySelector('#tur-uyari'); if (u) u.textContent = 'Kapak kapanmadan devam edilemez — kapağı kapatın.'; return; }
      if (gramG) {                                                         // gram programa yazılır (topping.doldur); boşsa kaset kapasitesi varsayılır
        const gv = String(gramG.value).trim();
        const r = await komutla('personel', 'topping.doldur', Object.assign({ kaset: a.kalem }, gv === '' ? {} : { gram: +gv }), null);
        if (!r) { const u = kap.querySelector('#tur-uyari'); if (u) u.textContent = 'Gram kabul edilmedi: ' + (TBA.sonHata || 'kaset kapasitesini aşıyor olabilir'); return; }
      }
      a.sonra = +adetG.value;
      if (uretimG) {
        const utc = new Date(uretimG.value).getTime() / 1000;
        if (a.sonra > 0 && (!Number.isFinite(utc) || utc <= 0 || utc > Date.now() / 1000)) { bildir('Geçerli üretim tarihini ve saatini girin.'); return; }
        a.uretim_utc = a.sonra > 0 ? utc : 0;
        const r = await komutla('personel', 'stok.doldur', { cekmece: a.cekmece, adet: a.sonra, uretim_utc: a.uretim_utc }, null);
        if (!r) { bildir(TBA.sonHata || 'PLC parti kaydını kabul etmedi'); return; }
      }
      await adimBitir(T, a, 'tamam');
    });
    const atla = dug('Atla', '', () => adimBitir(T, a, 'atlandi'));
    const ac = a.tur === 'cekmece'
      ? (acik ? TBA.basiliKapat(a.cekmece, '✋ Çekmece AÇIK — kapatmak için BASILI TUTUN', () => (((ST.D.cekmeceler || {})[a.cekmece]) || {}).konum <= 1)
        : dug('🔓 Çekmeceyi aç', 'ana', () => hazir && !digerAcik && komutla('personel', 'dolum.cekmece', { istasyon: 'B', cekmece: a.cekmece, ac: true }, 'Çekmece açılıyor')))
      : h('div', { sinif: 'ak-ipucu ' + (dolum === 'KAPANDI' ? 'iyi' : 'uyari'), metin: dolum === 'HAZIR' ? 'İstasyon durdu — kapağı açıp doldurun, sonra KAPATIN.' : dolum === 'ACIK' ? 'Kapak açık — doldurun, sonra KAPATIN.' : dolum === 'KAPANDI' ? 'Kapak kapandı.' : '…' });
    kap.append(kart('Adım ' + (T.i + 1) + ' / ' + n + ' · ' + a.ad, baslik, bekle,
      h('p', { metin: a.tur === 'cekmece' ? ('Şu an ' + a.mevcut + ' adet var, kapasite ' + a.hedef + '. ' + (a.fifo != null ? 'FIFO sırası ' + a.fifo + '. ' : '') + 'Eski ürünlerin önüne yenileri arkaya dizin.') : (IST_AD[a.ist] + ' · ' + a.kalem + ': şu an ' + a.mevcut + ', hedef ' + a.hedef + '.') }),
      a.tur === 'cekmece' && /^HAMUR/.test((((D.cekmeceler || {})[a.cekmece]) || {}).icerik || '') ? h('div', { sinif: 'ak-ipucu uyari', id: 'tur-derin', metin: '⚠ Derin çekmece: en arka yuva önden 550–632 mm. Arkayı doldururken ÇEKMECENİN YANINA GEÇİN, öne eğilip uzanmayın.' }) : null,
      digerAcik ? h('div', { sinif: 'ak-ipucu uyari', metin: 'Başka bir çekmece açık — önce kapanmasını bekleyin.' }) : null,
      ac, h('div', { sinif: 'tb-ark' }),
      h('div', { sinif: 'ak-sutun' }, h('label', { sinif: 'ak-alan' }, h('span', { metin: 'Doldurduktan sonraki adet' }), adetG), uretimG ? h('label', { sinif: 'ak-alan' }, h('span', { metin: 'Üretim tarihi ve saati (en fazla 72 saat saklama)' }), uretimG) : null, gramG ? h('label', { sinif: 'ak-alan' }, h('span', { metin: 'Koyduğunuz gram (TOPPING DOLULUK)' }), gramG) : null, partiG, sktG),
      h('div', { id: 'tur-uyari', sinif: 'tb-mini' }),
      h('p', { stil: { fontWeight: '600' }, metin: soruMetni(a) }),
      h('div', { sinif: 'tb-yatay' }, evet, atla, dug('Turu iptal et', 'tehlike', () => turIptal(T)))));
  };

  /* ============================================================ R26 · TEMİZLİK SİHİRBAZI */
  const KASETLER = [['HARC', 'Harç (UNO)'], ['SOS', 'Patates (UNO)'], ['KIYMA', 'Tavuk (UNO)'], ['KUSBASI', 'Kuşbaşı (UNO)'], ['KASAR', 'Kaşar kaseti'], ['SUCUK', 'Sucuk kaseti'], ['KIYMA_ORTA', 'Kıyma (orta UNO)']];
  const UNO = ['HARC', 'SOS', 'KIYMA', 'KUSBASI', 'KIYMA_ORTA'];
  const B_CEK_YEDEK = ['K1_1', 'K1_2', 'K1_3', 'K1_4', 'K1_5', 'K2_1', 'K2_2', 'K2_3', 'K2_4', 'K2_5', 'K3_1', 'K3_2', 'K3_3', 'K3_4', 'K5_1', 'K5_2', 'K5_3', 'K5_IC1', 'K6_IC1', 'K6_IC2', 'K6_TATLI'];
  function sihirbazAdimlari(tur) {          // TOPPING söküm / takma sırası [V]: gerçek prosedür TOPPING'den gelince burası güncellenir
    const A = [{ id: 'hazir', ad: 'Hat boşaltıldı, açık sipariş yok; temizlik modu açık', tip: 'onay' }];
    KASETLER.forEach(([k, ad]) => {
      A.push({ id: 'cikar_' + k, ad: ad + ': kaseti çıkar (aletsiz)', tip: 'sensor', kaset: k, di: 'DI_TOP_' + k + '_KASET_VAR', bekle: false });
      A.push({ id: 'meiko_' + k, ad: ad + ': MEIKO sepetine yerleştir, yıka, durula', tip: 'onay' });
    });
    if (tur === 'haftalik') UNO.forEach(k => A.push({ id: 'uno_' + k, ad: k + ' UNO: ağız, piston ve spreader parçalarını sök, yıka, tak', tip: 'onay' }));
    KASETLER.forEach(([k, ad]) => A.push({ id: 'tak_' + k, ad: ad + ': kaseti tak — sensör "kaset var" doğrular', tip: 'sensor', kaset: k, di: 'DI_TOP_' + k + '_KASET_VAR', bekle: true }));
    /* R26 (A+B, YÖNETİCİ 11 Eki): B tepsi matlarında reed YOK. Mat varlığı = bu onay adımı + dolum / temizlik sonrası robot bilek kamerası sayım pozu (mat + ürün); uyuşmazsa çekmece kilitli + uyarı. Ters takma mekanik takozla engelli. Yıkama yeri EKİPMAN EVYESİ (MEIKO yanı); el evyesi yalnız el. */
    const CEK = Object.keys((ST.D && ST.D.cekmeceler) || {}); const BCEK = CEK.length ? CEK : B_CEK_YEDEK;
    const bKalem = (id, ad) => { A.push({ id: 'cikar_' + id, ad: ad + ': ÇIKAR → EKİPMAN EVYESİNDE yıka + dezenfekte et (el evyesinde DEĞİL)', tip: 'onay', b: true }); A.push({ id: 'tak_' + id, ad: ad + ': yerine TAK — mat takıldı mı? (ters takma takozla engelli; robot kamerası sayımda doğrular)', tip: 'onay', b: true }); };
    BCEK.forEach(c => bKalem('mat_' + c, 'B ' + c.replace('_', '·') + ' tepsi matı'));
    [['KASAR', 'Kaşar'], ['SUCUK', 'Sucuk']].forEach(([k, ad]) => bKalem('depo_' + k, ad + ' depo kabı'));
    A.push({ id: 'kamera', ad: 'Robot bilek kamerası her çekmecede sayım pozuna gider (mat + ürün sayısı); uyuşmazsa çekmece KİLİTLİ + uyarı', tip: 'onay', b: true });
    A.push({ id: 'yuzey', ad: 'Tabla, kaset ağızları, yüzeyler gıda uyumlu temizleyiciyle silindi', tip: 'onay' });
    if (tur === 'haftalik') A.push({ id: 'bicak', ad: 'K bıçak bölgesi ve sprey memesi temizlendi', tip: 'onay' });
    A.push({ id: 'soguk', ad: 'Soğuk zincir kaydı (sıcaklık) kontrol edildi', tip: 'onay' });
    return A.map(a => Object.assign({ durum: 'bekle' }, a));
  }
  const sihirbazT = () => ST.sihirbazYerel !== undefined ? ST.sihirbazYerel : ((ST.D && ST.D.sihirbaz) || null);
  const sensorVar = a => { const kv = (ST.D && ST.D.kaset_var) || {}; const ad = a.di || ('DI_TOP_' + a.kaset + '_KASET_VAR'); return ad in kv ? !!kv[ad] : null; };
  async function sihKaydet(S) { ST.sihirbazYerel = S; await komutla('personel', 'sihirbaz.kaydet', { durum: S }); TBA.ciz(); }
  function sihirbazKarti(kap) {
    if (!TB.pin) return;
    if (ST.sihirbazYerel === null && !(ST.D && ST.D.sihirbaz)) ST.sihirbazYerel = undefined;
    const S = sihirbazT();
    if (!S) {
      kap.append(kart('Temizlik sihirbazı', h('p', { metin: 'Kasetleri ve UNO parçalarını söküm / takma sırasıyla adım adım temizleyin; her adım HACCP kaydına yazılır. Kaset takınca sensör "kaset var" doğrular.' }),
        h('div', { sinif: 'tb-yatay' }, dug('Günlük temizlik', 'ana', () => sihKaydet({ tur: 'gunluk', adimlar: sihirbazAdimlari('gunluk'), i: 0, t0: SIMDI() })), dug('Haftalık temizlik', '', () => sihKaydet({ tur: 'haftalik', adimlar: sihirbazAdimlari('haftalik'), i: 0, t0: SIMDI() })))));
      return;
    }
    const n = S.adimlar.length;
    if (S.i >= n) {
      kap.append(kart('Temizlik sihirbazı bitti · ' + (S.tur === 'haftalik' ? 'haftalık' : 'günlük'), h('p', { metin: n + ' adım tamam. HACCP kaydı yazılacak.' }),
        dug('✓ Kaydı yaz ve bitir', 'ana tam', async () => { const ozet = { tur: S.tur, baslangic: S.t0, bitis: SIMDI(), adimlar: S.adimlar.map(a => ({ id: a.id, ad: a.ad, durum: a.durum, t: a.t || null, sensor: a.sensor ?? null })) }; await komutla('personel', 'sihirbaz.bitir', { ozet }, 'Temizlik kaydedildi (HACCP)'); ST.sihirbazYerel = null; TBA.ciz(); })));
      return;
    }
    const a = S.adimlar[S.i];
    const sv = a.tip === 'sensor' ? sensorVar(a) : null;
    const dogru = a.tip !== 'sensor' ? true : (sv === null ? null : sv === a.bekle);          // null: sensör verisi yok → elle onay
    const devam = dug(dogru === false ? 'Sensör bekleniyor…' : '✓ Tamam, sıradaki', 'ana tam' + (dogru === false ? ' pasif' : ''), async () => {
      if (dogru === false) { const u = kap.querySelector('#sih-uyari'); if (u) u.textContent = a.bekle ? 'Sensör "kaset var" DEMİYOR — kaseti tam oturtun.' : 'Sensör hâlâ "kaset var" diyor — kaseti çıkarın.'; return; }
      a.durum = 'tamam'; a.t = SIMDI(); a.sensor = sv; S.i += 1; await sihKaydet(S);
    });
    kap.append(kart('Temizlik sihirbazı · adım ' + (S.i + 1) + ' / ' + n, h('div', { sinif: 'tb-cubuk' }, h('i', { stil: { width: Math.round(100 * S.i / n) + '%' } })),
      h('p', { stil: { fontWeight: '600' }, metin: a.ad }),
      a.tip === 'sensor' ? h('div', { sinif: 'ak-ipucu ' + (dogru ? 'iyi' : dogru === false ? 'uyari' : ''), id: 'sih-sensor', metin: 'Sensör: ' + (sv === null ? 'veri yok (elle onaylayın)' : sv ? 'kaset VAR' : 'kaset YOK') + ' · beklenen: ' + (a.bekle ? 'VAR' : 'YOK') + (dogru ? ' ✓' : '') }) : null,
      h('div', { id: 'sih-uyari', sinif: 'tb-mini' }),
      h('div', { sinif: 'tb-yatay' }, devam, dug('Sihirbazı bırak', '', async () => { ST.sihirbazYerel = null; await komutla('personel', 'sihirbaz.kaydet', { durum: null }); TBA.ciz(); }))));
  }
  const temizlikEski = SEK.MAKINE.temizlik;
  SEK.MAKINE.temizlik = function (kap) { sihirbazKarti(kap); if (temizlikEski) temizlikEski(kap); };
  TBA.sihirbaz = { planla, sihirbazAdimlari };
})();
