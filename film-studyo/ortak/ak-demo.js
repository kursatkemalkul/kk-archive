/* AUTOKITCH · DEMO ARKA UÇ (sunucu yokken müşteri ekranları bununla açılır) — sipariş sunucusunun (sunucu.py) yanıt biçimlerini taklit eder.
   Durum tarayıcıda (localStorage) tutulur: sipariş veren sayfa, takip, dolap, dış ekran, bekleme ekranı AYNI veriyi görür (aynı tarayıcı).
   Sipariş ilerlemesi geçen süreden TÜRETİLİR (zamanlayıcı yok): demo hızı gerçeğin ≈ 1/6'sı (gerçek ≈ 250 s, demo ≈ 45 s). ?hiz=2 → iki kat hızlı.
   DEMO verisi gerçek değildir: fiyatlar örnek, kodlar rastgele, ödeme TEST. Gerçek sunucu bulununca (AK.api.hazir) hiç kullanılmaz. */
(function () {
  'use strict';
  const Q = new URLSearchParams(location.search);
  const HIZ = parseFloat(Q.get('hiz')) || 1;
  const ANAHTAR = 'ak.demo.v1';
  const M0 = window.AK_DEMO_MENU;                                    // sunucu ayarlar.json menüsünün kopyası (menu_uret.py) — DEMO menüsü ve stok SUNUCUYLA AYNI kaynaktan
  const URUN = Object.fromEntries(M0.urunler.map(u => [u.id, u]));
  const FIYAT = Object.fromEntries(M0.urunler.map(u => [u.id, u.fiyat_kurus]));
  const AD = Object.fromEntries(M0.urunler.map(u => [u.id, u.ad]));
  const EK = Object.fromEntries(M0.urunler.filter(u => u.ek).map(u => [u.id, true]));
  const ANA_ID = M0.urunler.filter(u => !u.ek).map(u => u.id);
  function harcananHesap() {
    const h = {}; Object.keys(M0.stok).forEach(k => { h[k] = 0; });
    Object.entries(S.satilan).forEach(([u, n]) => Object.entries(URUN[u].tuketim).forEach(([k, c]) => { h[k] = (h[k] || 0) + c * n; }));
    return h;
  }
  /** sunucu menu() ile aynı kural: kalan = min((stok − eşik − satılan) // tüketim) */
  function kalanHesap(id) {
    const h = harcananHesap();
    return Math.max(0, Math.min(...Object.entries(URUN[id].tuketim).filter(([k]) => M0.stok[k]).map(([k, n]) => Math.floor((M0.stok[k].miktar - h[k] - M0.stok[k].esik) / n)), 0 + 1e9));
  }
  const T = { kabul: 2, uretim: 5, kutu: 36, hazir: 43, zamanAsimi: 240, kapak: 7 };     // sn (demo)
  const AMBIENT_SLOT = 22000;                                                              // ms

  const bos = () => ({ surum: 1, siparisler: {}, kisa: 0, satilan: {}, olaylar: [], olaySayac: 0, ortam: false, uyeler: {}, oturumlar: {}, otp: {}, sonCagri: 0 });
  let S;
  const oku = () => { try { S = JSON.parse(localStorage.getItem(ANAHTAR)) || bos(); } catch (e) { S = S || bos(); } return S; };
  const yaz = () => { try { localStorage.setItem(ANAHTAR, JSON.stringify(S)); } catch (e) { /* bellek */ } };
  const simdi = () => Date.now();
  const rast = (n) => Math.floor(Math.random() * n);
  const hata = (kod, mesaj) => ({ kod, veri: { hata: mesaj } });

  function olayEkle(tip, v, gecikmeSn) { S.olaySayac++; S.olaylar.push(Object.assign({ id: S.olaySayac, t: simdi() + (gecikmeSn ? gecikmeSn * 1000 / HIZ : 0), tip }, v)); if (S.olaylar.length > 200) S.olaylar.splice(0, S.olaylar.length - 200); }

  /* sipariş durumu geçen süreden */
  function turet(s) {
    if (['ODEME_BEKLIYOR', 'IPTAL', 'IADE'].includes(s.durum)) return s.durum;
    if (s.teslim_t) return (simdi() - s.teslim_t) / 1000 * HIZ >= T.kapak ? 'TESLIM_EDILDI' : 'HAZIR';
    const g = (simdi() - s.odeme_t) / 1000 * HIZ;
    const n = Math.max(1, s.kutu);
    const kutuS = T.kutu + (n - 1) * 14, hazirS = T.hazir + (n - 1) * 14;
    if (g < T.kabul) return 'ODENDI';
    if (g < T.uretim) return 'MAKINE_KABUL';
    if (g < kutuS) return 'URETIMDE';
    if (g < hazirS) return 'KUTU_HAZIR';
    return g < hazirS + T.zamanAsimi ? 'HAZIR' : 'ZAMAN_ASIMI';
  }
  function gorunum(s, ic) {
    const durum = turet(s);
    const n = Math.max(1, s.kutu), hazirS = T.hazir + (n - 1) * 14;
    const r = { id: s.id, kisa_no: s.kisa_no, kaynak: 'QR', platform_no: null, durum, oncelik: 0, toplam_kurus: s.toplam, kdv_kurus: Math.round(s.toplam - s.toplam / 1.1),
      odeme_yontemi: s.odeme_t ? 'SANAL_POS' : null, dolap_gozu: s.odeme_t ? s.gozler[0] : null, teslim_kodu: s.durum === 'ODEME_BEKLIYOR' ? null : s.kod,
      tahmini_hazir: s.odeme_t ? Math.round(s.odeme_t / 1000 + hazirS / HIZ) : null, not_: s.not || null, olusma: Math.round(s.olusma / 1000),
      teslim: s.teslim || 'DOLAP', dolap_gozlari: s.odeme_t ? s.gozler : [],
      kalemler: s.kalemler.map(k => ({ urun_id: k.urun, ad: AD[k.urun] || k.urun, adet: k.adet, birim_kurus: FIYAT[k.urun], not_: k.not || null })) };
    if (ic) { r.erisim = s.erisim; r.iptal_neden = s.iptal_neden || null; }
    return r;
  }
  const aktif = s => !['IPTAL', 'IADE', 'TESLIM_EDILDI'].includes(turet(s));

  function gozAyir(kutu) {                       // gerçek siparişler 1–6. gözler, 2 kutu/göz [V]; ortam siparişleri 7–12
    const gerek = Math.max(1, Math.ceil(kutu / 2)), dolu = new Set();
    Object.values(S.siparisler).forEach(s => { if (aktif(s) && s.gozler) s.gozler.forEach(g => dolu.add(g)); });
    for (let b = 1; b + gerek - 1 <= 6; b++) { let ok = true; for (let i = 0; i < gerek; i++) if (dolu.has(b + i)) ok = false; if (ok) return Array.from({ length: gerek }, (_, i) => b + i); }
    return null;
  }
  function kodUret() {
    const kullanilan = new Set(Object.values(S.siparisler).filter(aktif).map(s => s.kod));
    ambient().forEach(a => kullanilan.add(a.kod));
    let k; do { k = String(rast(10000)).padStart(4, '0'); } while (kullanilan.has(k)); return k;
  }

  /* ortam siparişleri (dış ekran / bekleme / dolap boşta listesi canlı görünsün): zamandan türetilir, saklanmaz */
  function ambient() {
    if (!S.ortam) return [];
    const t = simdi(), slot = Math.floor(t / AMBIENT_SLOT), cikti = [];
    for (let k = slot - 12; k <= slot; k++) {
      const n = (k * 37) % 89 + 11, yas = (t - k * AMBIENT_SLOT) / 1000 * HIZ;
      if (yas < 0 || yas > 200) continue;
      const platform = k % 5 === 0 ? 'GETIR' : null;
      const durum = yas < 4 ? 'ODENDI' : yas < 22 ? 'MAKINE_KABUL' : yas < 62 ? 'URETIMDE' : yas < 72 ? 'KUTU_HAZIR' : 'HAZIR';
      cikti.push({ k, kisa_no: n, durum, dolap_gozu: 7 + (k % 6), platform, kod: String((n * 7919) % 9000 + 1000), yas });
    }
    return cikti;
  }

  function menu() {
    return { dukkan: M0.dukkan + ' · DEMO', makine: { mod: 'BOSTA', hazir: true },
      urunler: M0.urunler.map(u => { const { tuketim, ...acik } = u; const kalan = kalanHesap(u.id); return Object.assign({}, acik, { kalan, tukendi: kalan <= 0 }); }) };
  }

  function istek(yontem, yol, g, baslik) {
    oku();
    const tok = String((baslik || {})['X-Uye-Anahtar'] || ''), uye = tok && S.oturumlar[tok] ? S.uyeler[S.oturumlar[tok]] || null : null;
    const u = new URL(yol, 'http://x'), p = u.pathname.split('/').filter(Boolean), q = Object.fromEntries(u.searchParams), r = p.slice(1), G = yontem === 'GET';
    if (p[0] !== 'api') return hata(404, 'yok');
    if (G && r[0] === 'menu') return { kod: 200, veri: menu() };
    if (G && r[0] === 'vitrin') return { kod: 200, veri: M0.vitrin || {} };
    if (r[0] === 'uye') {
      const TEL = x => { const d = String(x || '').replace(/[^\d+]/g, ''), m = d.match(/^(?:\+?90|0)?(5\d{9})$/); return m ? '+90' + m[1] : null; };
      if (!G && r[1] === 'otp') {
        const tel = TEL(g.telefon); if (!tel) return hata(400, 'geçerli bir cep telefonu girin'); if (!g.kvkk_izin) return hata(400, 'telefon için aydınlatma metni onayı gerekli');
        const o = S.otp[tel]; if (o && simdi() - o.son < 30000) return hata(429, 'yeni kod için biraz bekleyin');
        const kod = String(rast(1000000)).padStart(6, '0'); S.otp[tel] = { kod, bitis: simdi() + 300000, deneme: 0, son: simdi() }; yaz();
        return { kod: 200, veri: { gonderildi: true, sure_s: 300, test_kodu: kod } };
      }
      if (!G && r[1] === 'dogrula') {
        const tel = TEL(g.telefon), o = tel && S.otp[tel]; if (!o || simdi() > o.bitis) return hata(401, 'kod süresi doldu; yeni kod isteyin'); if (o.deneme >= 5) return hata(429, 'çok fazla yanlış deneme; yeni kod isteyin');
        if (String(g.kod).trim() !== o.kod) { o.deneme++; yaz(); return hata(401, 'kod yanlış'); }
        delete S.otp[tel]; const ex = S.uyeler[tel] || (S.uyeler[tel] = { telefon: tel, ad: null, ticari_izin: false, kvkk_zaman: simdi() / 1000, olusma: simdi() / 1000 });
        const token = Array.from({ length: 32 }, () => 'abcdefghijklmnopqrstuvwxyz0123456789'[rast(36)]).join(''); S.oturumlar[token] = tel; yaz();
        return { kod: 200, veri: { anahtar: token, gun: 30 } };
      }
      if (!uye) return hata(401, 'oturum yok ya da süresi doldu');
      if (G && r[1] === 'ben') return { kod: 200, veri: uye };
      if (G && r[1] === 'siparisler') return { kod: 200, veri: { siparisler: Object.values(S.siparisler).filter(x => x.uye === uye.telefon).sort((a, b) => b.olusma - a.olusma).map(x => ({ id: x.id, kisa_no: x.kisa_no, durum: turet(x), toplam_kurus: x.toplam, olusma: Math.round(x.olusma / 1000), erisim: x.erisim, kalemler: x.kalemler.map(k => ({ ad: AD[k.urun], adet: k.adet })) })) } };
      if (!G && r[1] === 'ad') { uye.ad = String(g.ad || '').slice(0, 40).trim() || null; yaz(); return { kod: 200, veri: uye }; }
      if (!G && r[1] === 'ticari') { uye.ticari_izin = !!g.izin; yaz(); return { kod: 200, veri: uye }; }
      if (!G && r[1] === 'sil') { Object.values(S.siparisler).forEach(x => { if (x.uye === uye.telefon) x.uye = null; }); Object.keys(S.oturumlar).forEach(k => { if (S.oturumlar[k] === uye.telefon) delete S.oturumlar[k]; }); delete S.uyeler[uye.telefon]; yaz(); return { kod: 200, veri: { silindi: true } }; }
      if (!G && r[1] === 'cikis') { delete S.oturumlar[tok]; yaz(); return { kod: 200, veri: { cikti: true } }; }
      return hata(404, 'uç yok');
    }
    if (!G && r[0] === 'siparis' && r.length === 1) {
      const kalemler = (g.kalemler || []).map(k => ({ urun: k.urun, adet: parseInt(k.adet, 10) || 0, not: String(k.not || '').replace(/[\u0000-\u001f]/g, ' ').slice(0, 80).trim() || null })).filter(k => k.adet > 0);
      if (g.teslim != null && !['DOLAP', 'TEZGAH'].includes(g.teslim)) return hata(400, 'teslim DOLAP ya da TEZGAH olmalı');
      if (!kalemler.length) return hata(400, 'sepet boş');
      if (kalemler.reduce((a, k) => a + k.adet, 0) > 12) return hata(400, 'tek siparişte en fazla 12 kalem');
      if (kalemler.some(k => !(k.urun in FIYAT))) return hata(400, 'ürün yok');
      if (g.telefon && !g.kvkk_izin) return hata(400, 'telefon için aydınlatma metni onayı gerekli');
      if (!kalemler.some(k => !EK[k.urun])) return hata(400, 'en az bir pide ya da lahmacun gerekli (yalnız ek ürün makineden çıkmaz)');
      const ihtiyac = {}; kalemler.forEach(k => Object.entries(URUN[k.urun].tuketim).forEach(([kl, n]) => { ihtiyac[kl] = (ihtiyac[kl] || 0) + n * k.adet; }));
      const harc = harcananHesap(), eksik = Object.entries(ihtiyac).filter(([kl, n]) => M0.stok[kl] && M0.stok[kl].miktar - harc[kl] - n < M0.stok[kl].esik).map(([kl]) => kl);
      if (eksik.length) return hata(409, 'STOK YETERSİZ: ' + eksik.join(', ') + ' (eşik altına iner, sipariş alınmadı)');
      const kutu = kalemler.filter(k => !EK[k.urun]).reduce((a, k) => a + k.adet, 0);
      const gozler = gozAyir(kutu); if (!gozler) return hata(409, 'dolap dolu, kısa süre sonra tekrar deneyin');
      kalemler.forEach(k => { S.satilan[k.urun] = (S.satilan[k.urun] || 0) + k.adet; });
      S.kisa = (S.kisa % 999) + 1;
      const id = 'S' + new Date().toISOString().slice(2, 10).replace(/-/g, '') + '-' + Array.from({ length: 6 }, () => '0123456789ABCDEF'[rast(16)]).join('');
      const erisim = Array.from({ length: 16 }, () => 'abcdefghijklmnopqrstuvwxyz0123456789'[rast(36)]).join('');
      S.siparisler[id] = { id, erisim, kisa_no: S.kisa, kalemler, kutu, gozler, toplam: kalemler.reduce((a, k) => a + FIYAT[k.urun] * k.adet, 0), durum: 'ODEME_BEKLIYOR',
        olusma: simdi(), odeme_t: null, kod: null, not: g.not || null, telefon: g.telefon ? '***' : null, teslim: g.teslim || 'DOLAP', uye: uye ? uye.telefon : null };
      yaz(); return { kod: 200, veri: { id, erisim, siparis: gorunum(S.siparisler[id], false) } };
    }
    if (r[0] === 'siparis' && r.length >= 2) {
      const s = S.siparisler[r[1]]; if (!s) return hata(404, 'sipariş yok');
      if (q.e !== s.erisim && !(uye && s.uye === uye.telefon) && baslik['X-Personel-Pin'] !== '0000') return hata(401, 'personel PIN gerekli');
      if (G && r.length === 2) return { kod: 200, veri: gorunum(s, false) };
      if (!G && r[2] === 'odeme-baslat') return { kod: 200, veri: { url: null, saglayici: 'TEST' } };
      if (!G && r[2] === 'ode') {
        if (s.durum !== 'ODEME_BEKLIYOR') return hata(409, 'ödeme beklenmiyor');
        if (g.kart_test === 'RED') return hata(402, 'ödeme reddedildi: test reddi');
        s.durum = 'ODENDI'; s.odeme_t = simdi(); s.kod = kodUret(); olayEkle('order.state', { siparis_id: s.id, durum: 'ODENDI' }); yaz();
        return { kod: 200, veri: gorunum(s, false) };
      }
      if (!G && r[2] === 'iptal') {
        const d = turet(s);
        if (!['ODEME_BEKLIYOR', 'ODENDI', 'MAKINE_KABUL', 'MAKINEYE_GONDERILDI'].includes(d)) return hata(409, 'üretim başladı: yalnız personel iade edebilir');
        s.durum = 'IPTAL'; s.iptal_neden = g.neden || 'müşteri iptali';
        s.kalemler.forEach(k => { S.satilan[k.urun] = Math.max(0, (S.satilan[k.urun] || 0) - k.adet); }); yaz();
        return { kod: 200, veri: gorunum(s, false) };
      }
    }
    if (G && r[0] === 'ekran') {
      const gercek = Object.values(S.siparisler).filter(s => s.odeme_t && aktif(s)).map(s => ({ kisa_no: s.kisa_no, durum: turet(s), dolap_gozu: s.gozler[0], platform: null }));
      const ort = ambient().map(a => ({ kisa_no: a.kisa_no, durum: a.durum, dolap_gozu: a.dolap_gozu, platform: a.platform }));
      return { kod: 200, veri: { siparisler: gercek.concat(ort) } };
    }
    if (!G && r[0] === 'personel-cagir') {
      if (simdi() - S.sonCagri < 30000) return hata(429, 'görevli zaten çağrıldı; birazdan gelecek'); S.sonCagri = simdi(); yaz(); return { kod: 200, veri: { id: 1, tekrar: false } };
    }
    if (!G && r[0] === 'dolap' && r[1] === 'kod') {
      const kod = String(g.kod || '').slice(0, 8);
      olayEkle('qr.code_entered', { kod });
      const s = Object.values(S.siparisler).find(x => x.odeme_t && x.kod === kod && ['HAZIR', 'ZAMAN_ASIMI'].includes(turet(x)));
      if (s) {
        s.teslim_t = simdi(); s.gozler.forEach(z => { olayEkle('qr.opened', { goz: z, siparis_id: s.id }); olayEkle('qr.closed', { goz: z, siparis_id: s.id, bos: true }, T.kapak); });
        yaz(); return { kod: 200, veri: { gonderildi: true } };
      }
      const a = ambient().find(x => x.kod === kod && x.durum === 'HAZIR');
      if (a) { olayEkle('qr.opened', { goz: a.dolap_gozu, siparis_id: 'ORTAM-' + a.k }); olayEkle('qr.closed', { goz: a.dolap_gozu, siparis_id: 'ORTAM-' + a.k, bos: true }, T.kapak); yaz(); return { kod: 200, veri: { gonderildi: true } }; }
      olayEkle('qr.code_rejected', { kod }); yaz(); return { kod: 200, veri: { gonderildi: true } };
    }
    if (G && r[0] === 'dolap' && r[1] === 'olay') {                    // sunucu /api/dolap/olay ile aynı biçim: ?son=N (son N olay) · ?sonra=ID (ID'den yenileri); kod değeri verilmez
      const n = simdi(), sonra = parseInt(q.sonra || '0', 10), liste = [];
      if (q.sonra == null) { const hepsi = S.olaylar.filter(o => o.t <= n && ['qr.opened', 'qr.closed', 'qr.code_rejected'].includes(o.tip)); return { kod: 200, veri: { olaylar: hepsi.slice(-parseInt(q.son || '20', 10)).map(o => ({ id: o.id, zaman: o.t / 1000, tip: o.tip, goz: o.goz == null ? null : o.goz, bos: o.bos || null })) } }; }
      for (const o of S.olaylar) { if (o.id <= sonra) continue; if (o.t > n) break; if (['qr.opened', 'qr.closed', 'qr.code_rejected'].includes(o.tip)) liste.push({ id: o.id, zaman: o.t / 1000, tip: o.tip, goz: o.goz == null ? null : o.goz, bos: o.bos || null }); else liste.push({ id: o.id, zaman: o.t / 1000, tip: 'x', goz: null }); }
      return { kod: 200, veri: { olaylar: liste.filter(o => o.tip !== 'x') } };
    }
    return hata(404, 'uç yok');
  }

  window.AK_DEMO = {
    istek, T, HIZ,
    ortam(a) { oku(); if (S.ortam !== a) { S.ortam = a; yaz(); } },
    sifirla() { S = bos(); yaz(); },
    ipucuKod() { oku(); const a = ambient().filter(x => x.durum === 'HAZIR').sort((x, y) => y.yas - x.yas)[0]; return a ? { kod: a.kod, goz: a.dolap_gozu, platform: a.platform, kisa_no: a.kisa_no } : null; },
    /** bekleme ekranı: üretimdeki işler (demo): ilerleme ve aşama yaştan türetilir */
    isler() {
      oku(); const ADIM = [[0.12, 'ÇEKMECE', 'B'], [0.3, 'AÇICI', 'A'], [0.55, 'KASAR', 'TOP'], [0.75, 'FIRIN', 'F'], [0.88, 'KESME', 'K'], [1.01, 'KUTU', 'E']], TARIF = ANA_ID;
      const gercek = Object.values(S.siparisler).filter(x => x.odeme_t && ['MAKINEYE_GONDERILDI', 'MAKINE_KABUL', 'URETIMDE', 'KUTU_HAZIR'].includes(turet(x))).map(x => ({ no: x.kisa_no, ad: x.kalemler[0].urun, yas: (simdi() - x.odeme_t) / 1000 * HIZ, tam: T.kutu }));
      const orta = ambient().filter(a => ['MAKINE_KABUL', 'URETIMDE', 'KUTU_HAZIR'].includes(a.durum)).map(a => ({ no: a.kisa_no, ad: TARIF[a.k % TARIF.length], yas: a.yas - 4, tam: 68 }));
      return gercek.concat(orta).map(x => { const p = Math.max(0, Math.min(1, x.yas / x.tam)), st = ADIM.find(a => p < a[0]) || ADIM[5]; return { no: x.no, ad: x.ad, ilerleme: p, adim: st[1], istasyon: st[2] }; });
    },
    hazirKodlar() { oku(); return ambient().filter(x => x.durum === 'HAZIR').sort((x, y) => y.yas - x.yas).map(a => ({ kod: a.kod, goz: a.dolap_gozu, platform: a.platform })); },
    gercekHazirKod() { oku(); const s = Object.values(S.siparisler).find(x => x.odeme_t && ['HAZIR', 'ZAMAN_ASIMI'].includes(turet(x))); return s ? s.kod : null; },
  };
})();
