/* AUTOKITCH · TABLET + YÖNETİCİ DEMO ARKA UCU v1 (7 Eki 2026) — sunucu yokken ekranlar bununla açılır; GERÇEK DEĞİL, yalnız görünüm + akış denemesi.
   TB_DEMO.istek(hedef 'hmi'|'sip', yontem, yol, govde, kimlik) → {kod, veri}  ·  TB_DEMO.pinCoz(pin) → {rol, ad} | null  (demo PIN: personel 0000 · yönetici 1111 · servis 2222)
   Bellekte yaşar (sayfa yenilenince sıfırlanır). Sipariş durumları zamanla ilerler (her 4 sn bir adım). */
(function () {
  'use strict';
  const D = (window.TB_DEMO = {});
  const now = () => Date.now() / 1000;
  const GUN = 86400;
  const PIN = { '0000': { rol: 'personel', ad: 'Ayşe (demo)' }, '1111': { rol: 'yonetici', ad: 'Yönetici (demo)' }, '2222': { rol: 'servis', ad: 'Servis (demo)' } };
  D.pinCoz = p => PIN[p] || null;
  const SIRA = { personel: 0, servis: 1, yonetici: 2 };
  const yetki = (k, en) => k && SIRA[k.rol] >= SIRA[en];
  const ok = (v) => ({ kod: 200, veri: v }), hata = (kod, m) => ({ kod, veri: { hata: m } });

  /* ------------------------------------------------------------------ MENÜ + SİPARİŞ (sipariş sunucusu) */
  const URUN = [
    ['kasarli', 'Kaşarlı pide', 22000, 'pide', ['gluten', 'süt'], 'Pide hamuru, kaşar peyniri'], ['kiymali', 'Kıymalı pide', 26000, 'pide', ['gluten'], 'Pide hamuru, kıyma'],
    ['kusbasili', 'Kuşbaşılı pide', 30000, 'pide', ['gluten'], 'Pide hamuru, kuşbaşı et'], ['sucuklu', 'Sucuklu pide', 27000, 'pide', ['gluten', 'süt'], 'Pide hamuru, kaşar, sucuk'],
    ['patatesli', 'Patatesli pide', 23000, 'pide', ['gluten'], 'Pide hamuru, patates püresi'], ['tavuklu', 'Tavuklu pide', 27000, 'pide', ['gluten'], 'Pide hamuru, tavuk'],
    ['lahmacun', 'Lahmacun (2 adet)', 18000, 'lahmacun', ['gluten'], 'İnce hamur, kıymalı harç'], ['kola', 'Kola', 5000, 'icecek', [], 'Kola 33 cl'], ['tatli', 'Tatlı', 9000, 'tatli', ['gluten', 'süt', 'yumurta'], 'Günün tatlısı']];
  const menu = URUN.map(([id, ad, f, kat, al, ic], i) => ({ id, ad, fiyat_kurus: f, taban_fiyat_kurus: f, kampanya: null, ornek_fiyat: true, ek: kat === 'icecek' || kat === 'tatli', kalan: 40, tukendi: false, aktif: true, kategori: kat, icerik: ic, aciklama: null, gorsel: null, alerjen: al, alerjen_dogrulandi: false }));
  const kampanyalar = [];
  const siparisler = [];          // {id, kisa_no, kaynak, platform_no, durum, toplam_kurus, kdv_kurus, odeme_yontemi, dolap_gozu, teslim_kodu, olusma, odeme_zaman, kalemler, not_}
  const vardiyalar = [];
  let kisaNo = 0, kurus = 0;
  const kullanicilar = [{ id: 1, ad: 'Ayşe', rol: 'personel', aktif: true }];
  const cagrilar = [];
  const fiyat = id => { const u = menu.find(x => x.id === id); let f = u.taban_fiyat_kurus, ad = null; for (const k of kampanyalar) { if (!k.aktif || (k.urun_id && k.urun_id !== id)) continue; const g = k.tur === 'YUZDE' ? Math.round(u.taban_fiyat_kurus * (1 - k.deger / 100)) : Math.max(0, u.taban_fiyat_kurus - Math.round(k.deger * 100)); if (g < f) { f = g; ad = k.ad; } } u.fiyat_kurus = f; u.kampanya = ad; return f; };
  function siparisYap(kaynak, kalemler, yontem, ek, t0) {
    kisaNo = kisaNo % 99 + 1;
    const kl = kalemler.map(k => { const u = menu.find(x => x.id === k.urun); return { urun_id: k.urun, ad: u.ad, adet: k.adet, birim_kurus: fiyat(k.urun) }; });
    const toplam = kl.reduce((a, k) => a + k.adet * k.birim_kurus, 0);
    const t = t0 || now();
    const s = { id: 'S' + new Date(t * 1000).toISOString().slice(2, 10).replace(/-/g, '') + '-' + (++kurus + 4096).toString(16).toUpperCase().padStart(6, '0'), kisa_no: kisaNo, kaynak, platform_no: ek && ek.platform_no || null, durum: 'ODENDI', toplam_kurus: toplam,
      kdv_kurus: Math.round(toplam - toplam / 1.10), odeme_yontemi: kaynak.match(/GETIR|YEMEKSEPETI|TRENDYOL/) ? 'PLATFORM' : yontem, dolap_gozu: null, teslim_kodu: String(Math.floor(1000 + Math.random() * 9000)), olusma: t, odeme_zaman: t, kalemler: kl, not_: ek && ek.not || null, adim: 0 };
    siparisler.unshift(s); return s;
  }
  const ADIM = ['ODENDI', 'MAKINE_KABUL', 'URETIMDE', 'KUTU_HAZIR', 'HAZIR'];
  setInterval(() => {
    for (const s of siparisler) {
      if (!ADIM.includes(s.durum) || s.durum === 'HAZIR') continue;
      if (Math.random() < 0.6) { s.adim = Math.min(4, s.adim + 1); s.durum = ADIM[s.adim]; if (s.durum === 'HAZIR') s.dolap_gozu = 1 + (s.kisa_no % 12); }
    }
  }, 4000);
  // tohum: son 30 gün satış (ciro grafikleri) + 3 platform siparişi
  (function tohum() {
    const gun0 = new Date(); gun0.setHours(0, 0, 0, 0);
    for (let g = 29; g >= 0; g--) {
      const wd = new Date((gun0.getTime() / 1000 - g * GUN) * 1000).getDay(), n = Math.round((wd === 5 || wd === 6 ? 34 : 22) + ((g * 7) % 9));
      for (let i = 0; i < n; i++) {
        const u = URUN[(i * 3 + g) % 7][0], kal = [{ urun: u, adet: 1 + (i % 3 === 0 ? 1 : 0) }]; if (i % 2 === 0) kal.push({ urun: 'kola', adet: 1 });
        const s = siparisYap(['PERSONEL', 'QR', 'QR', 'GETIR', 'YEMEKSEPETI', 'TRENDYOL'][(i + g) % 6], kal, ['NAKIT', 'KART_POS', 'SANAL_POS'][i % 3], null, gun0.getTime() / 1000 - g * GUN + 39600 + i * 600);
        s.durum = 'TESLIM_EDILDI';
      }
    }
    kisaNo = 0;
    [['GETIR', 'G-4471', 'lahmacun'], ['YEMEKSEPETI', 'YS-9902', 'kasarli'], ['TRENDYOL', 'TY-1188', 'tavuklu']].forEach(([k, no, u]) => { const s = siparisYap(k, [{ urun: u, adet: 1 }], 'PLATFORM', { platform_no: no }); s.adim = 2; s.durum = 'URETIMDE'; });
  })();
  const kasaRapor = (t0, t1) => {
    const y = {}; let adet = 0, ciro = 0, kdv = 0;
    siparisler.filter(s => s.odeme_zaman >= t0 && s.odeme_zaman <= t1 && !['IPTAL', 'IADE'].includes(s.durum)).forEach(s => { const o = y[s.odeme_yontemi] = y[s.odeme_yontemi] || { tahsilat_kurus: 0, tahsilat_adet: 0, iade_kurus: 0, iade_adet: 0 }; o.tahsilat_kurus += s.toplam_kurus; o.tahsilat_adet++; adet++; ciro += s.toplam_kurus; kdv += s.kdv_kurus; });
    const ip = {}; siparisler.filter(s => ['IPTAL', 'IADE'].includes(s.durum) && s.olusma >= t0).forEach(s => { const o = ip[s.durum] = ip[s.durum] || { adet: 0, tutar_kurus: 0 }; o.adet++; o.tutar_kurus += s.toplam_kurus; });
    return { baslangic: t0, bitis: t1, yontemler: y, siparis_adet: adet, ciro_kurus: ciro, kdv_kurus: kdv, net_tahsilat_kurus: ciro, iptal_iade: ip, uyari: 'DEMO verisi. Platform tahsilatı platformdan hesaba geçer — kasada nakit değildir.' };
  };
  const gunBas = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d.getTime() / 1000; };
  function ciro(aralik, grup) {
    const g = { gun: 1, hafta: 7, ay: 30 }[aralik]; if (!g) return hata(400, 'aralık gun / hafta / ay');
    const t0 = gunBas() - (g - 1) * GUN, l = siparisler.filter(s => s.odeme_zaman >= t0 && !['IPTAL', 'IADE'].includes(s.durum));
    const sat = {}; l.forEach(s => {
      if (grup === 'urun') s.kalemler.forEach(k => { const x = sat[k.urun_id] = sat[k.urun_id] || { ad: k.ad, id: k.urun_id, adet: 0, ciro_kurus: 0 }; x.adet += k.adet; x.ciro_kurus += k.adet * k.birim_kurus; });
      else if (grup === 'saat') { const k = String(new Date(s.odeme_zaman * 1000).getHours()).padStart(2, '0') + ':00'; const x = sat[k] = sat[k] || { ad: k, adet: 0, ciro_kurus: 0 }; x.adet++; x.ciro_kurus += s.toplam_kurus; }
      else if (grup === 'odeme') { const x = sat[s.odeme_yontemi] = sat[s.odeme_yontemi] || { ad: s.odeme_yontemi, adet: 0, ciro_kurus: 0 }; x.adet++; x.ciro_kurus += s.toplam_kurus; }
      else { const x = sat[s.kaynak] = sat[s.kaynak] || { ad: s.kaynak, adet: 0, ciro_kurus: 0 }; x.adet++; x.ciro_kurus += s.toplam_kurus; }
    });
    const seri = {}; l.forEach(s => { const k = new Date(s.odeme_zaman * 1000).toISOString().slice(0, 10); const x = seri[k] = seri[k] || { gun: k, adet: 0, ciro_kurus: 0 }; x.adet++; x.ciro_kurus += s.toplam_kurus; });
    return ok({ aralik, grup, siparis_adet: l.length, ciro_kurus: l.reduce((a, s) => a + s.toplam_kurus, 0), satirlar: Object.values(sat).sort((a, b) => b.ciro_kurus - a.ciro_kurus), seri: Object.values(seri).sort((a, b) => a.gun < b.gun ? -1 : 1) });
  }
  const sipDetay = s => ({ ...s, erisim: 'demo' });
  function sip(yontem, yol, g, kim) {
    const [p, qs] = yol.split('?'), r = p.split('/').filter(Boolean).slice(1);   // ['siparis', id, 'iptal']
    const G = yontem === 'GET';
    if (G && r[0] === 'menu' && !r[1]) { menu.forEach(u => fiyat(u.id)); return ok({ dukkan: 'AUTOKITCH Pide · Dükkân 1 (DEMO)', urunler: menu.filter(u => u.aktif), makine: { mod: 'BOSTA', hazir: true } }); }
    if (G && r[0] === 'ben') return kim ? ok(kim) : hata(401, 'PIN yok');
    if (!kim) return hata(401, 'personel PIN gerekli');
    if (!G && r[0] === 'siparis' && !r[1]) {
      if (!g.kalemler || !g.kalemler.length) return hata(400, 'sepet boş');
      const s = siparisYap(g.kaynak || 'PERSONEL', g.kalemler, g.odeme_yontemi || 'NAKIT', { not: g.not }); return ok({ id: s.id, erisim: 'demo', siparis: sipDetay(s) });
    }
    if (r[0] === 'siparis' && r[1]) {
      const s = siparisler.find(x => x.id === r[1]); if (!s) return hata(404, 'sipariş yok');
      if (G && !r[2]) return ok(sipDetay(s));
      if (G && r[2] === 'fis') return ok({ isletme: 'AUTOKITCH Pide · Dükkân 1 (DEMO)', fis_no: s.kisa_no, siparis_id: s.id, tarih: new Date(s.odeme_zaman * 1000).toLocaleString('tr-TR'), kalemler: s.kalemler.map(k => ({ ad: k.ad, adet: k.adet, birim_kurus: k.birim_kurus, tutar_kurus: k.adet * k.birim_kurus })), toplam_kurus: s.toplam_kurus, kdv_orani: 0.10, kdv_kurus: s.kdv_kurus, odeme_yontemi: s.odeme_yontemi, teslim_kodu: s.teslim_kodu, e_arsiv: { belge_no: 'AKT2026' + String(100000 + s.kisa_no).padStart(9, '0'), tur: 'E_ARSIV', durum: 'GONDERILDI' }, not_: 'DEMO — BİLGİ FİŞİDİR, mali fiş değildir. Dükkân içi nakit / kart satışında ÖKC (yazar kasa) fişi gerekir.' });
      if (!G && r[2] === 'iptal') { const gec = !['ODENDI', 'MAKINE_KABUL', 'ODEME_BEKLIYOR'].includes(s.durum); if (gec && !yetki(kim, 'yonetici')) return hata(403, 'üretim sonrası iade için yönetici yetkisi gerekir'); s.durum = gec ? 'IADE' : 'IPTAL'; return ok(sipDetay(s)); }
      if (!G && r[2] === 'teslim' || !G && r[2] === 'kurye-teslim') { if (!['HAZIR', 'ZAMAN_ASIMI'].includes(s.durum)) return hata(409, 'dolapta değil'); s.durum = 'TESLIM_EDILDI'; return ok(sipDetay(s)); }
      if (!G && r[2] === 'oncelik') { s.oncelik = g.oncelik || 1; return ok(sipDetay(s)); }
    }
    if (G && r[0] === 'kuyruk') return ok({ siparisler: siparisler.filter(s => !['TESLIM_EDILDI', 'IPTAL', 'IADE'].includes(s.durum)).map(sipDetay), makine: { mod: 'BOSTA' } });
    if (G && r[0] === 'vardiya' && !r[1]) return ok({ acik: vardiyalar.find(v => !v.kapanis_zaman) || null });
    if (!G && r[0] === 'vardiya' && r[1] === 'ac') { if (vardiyalar.find(v => !v.kapanis_zaman)) return hata(409, 'açık vardiya var — önce kapatın'); const v = { id: vardiyalar.length + 1, kisi: kim.ad, rol: kim.rol, acilis_zaman: now(), acilis_kasa_kurus: g.kasa_kurus || 0, kapanis_zaman: null }; vardiyalar.unshift(v); return ok(v); }
    if (!G && r[0] === 'vardiya' && r[1] === 'kapat') {
      const v = vardiyalar.find(x => !x.kapanis_zaman); if (!v) return hata(409, 'açık vardiya yok');
      const rp = kasaRapor(v.acilis_zaman, now()), nakit = (rp.yontemler.NAKIT || { tahsilat_kurus: 0 }).tahsilat_kurus, bek = v.acilis_kasa_kurus + nakit, fark = g.sayilan_kurus - bek;
      Object.assign(v, { kapanis_zaman: now(), sayilan_kurus: g.sayilan_kurus, beklenen_kurus: bek, fark_kurus: fark });
      return ok({ vardiya_id: v.id, kisi: v.kisi, acilis_kasa_kurus: v.acilis_kasa_kurus, beklenen_nakit_kurus: bek, sayilan_kurus: g.sayilan_kurus, fark_kurus: fark, rapor: rp });
    }
    if (G && r[0] === 'vardiyalar') return ok({ vardiyalar: vardiyalar.slice(0, 30) });
    if (G && r[0] === 'kasa' && r[1] === 'rapor') return ok(kasaRapor(gunBas(), now()));
    if (G && r[0] === 'platform-siparisleri') return ok({ siparisler: siparisler.filter(s => /GETIR|YEMEKSEPETI|TRENDYOL/.test(s.kaynak) && now() - s.olusma < 3600 * 5).map(s => ({ id: s.id, kisa_no: s.kisa_no, kaynak: s.kaynak, platform_no: s.platform_no, durum: s.durum, dolap_gozu: s.dolap_gozu, toplam_kurus: s.toplam_kurus, olusma: s.olusma, kalemler: s.kalemler.map(k => ({ ad: k.ad, adet: k.adet })), kurye_kodu_son4: s.teslim_kodu, teslim_bekliyor: ['HAZIR', 'ZAMAN_ASIMI'].includes(s.durum) })) });
    if (G && r[0] === 'cagrilar') return ok({ cagrilar: cagrilar.filter(c => c.durum === 'ACIK') });
    if (!G && r[0] === 'cagri' && r[2] === 'kapat') { const c = cagrilar.find(x => x.id == r[1]); if (c) c.durum = 'KAPANDI'; return ok({ cagrilar: cagrilar.filter(x => x.durum === 'ACIK') }); }
    if (G && r[0] === 'faturalar') return ok({ faturalar: siparisler.slice(0, 40).map((s, i) => ({ id: i + 1, siparis_id: s.id, tur: 'E_ARSIV', belge_no: 'AKT2026' + String(1000 + i).padStart(9, '0'), durum: ['IPTAL', 'IADE'].includes(s.durum) ? 'IPTAL' : 'GONDERILDI', tutar_kurus: s.toplam_kurus, kdv_kurus: s.kdv_kurus, zaman: s.odeme_zaman })) });
    // --- yönetici
    if (!yetki(kim, 'yonetici')) return hata(403, 'bu işlem için yonetici yetkisi gerekir');
    if (G && r[0] === 'rapor' && r[1] === 'ciro') { const q = new URLSearchParams(qs || ''); return ciro(q.get('aralik') || 'gun', q.get('grup') || 'urun'); }
    if (G && r[0] === 'menu' && r[1] === 'yonet') { menu.forEach(u => fiyat(u.id)); return ok({ urunler: menu, kampanyalar }); }
    if (!G && r[0] === 'menu' && r[1] === 'urun') { const u = menu.find(x => x.id === g.id); if (!u) return hata(404, 'ürün yok'); if (g.fiyat_tl != null) { u.taban_fiyat_kurus = Math.round(g.fiyat_tl * 100); u.ornek_fiyat = false; } ['aktif', 'alerjen', 'icerik', 'aciklama', 'alerjen_dogrulandi'].forEach(a => { if (g[a] != null) u[a] = g[a]; }); fiyat(u.id); return ok(u); }
    if (!G && r[0] === 'kampanya' && !r[1]) { kampanyalar.unshift({ id: kampanyalar.length + 1, ad: g.ad, tur: g.tur, deger: +g.deger, urun_id: g.urun_id || null, aktif: 1, gecerli: true }); return ok({ kampanyalar }); }
    if (!G && r[0] === 'kampanya' && r[2] === 'kapat') { const k = kampanyalar.find(x => x.id == r[1]); if (k) { k.aktif = 0; k.gecerli = false; } return ok({ kampanyalar }); }
    if (G && r[0] === 'kullanici') return ok({ kullanicilar });
    if (!G && r[0] === 'kullanici') { const u = kullanicilar.find(x => x.ad === g.ad); if (u) { u.rol = g.rol; u.aktif = g.aktif !== false; } else kullanicilar.push({ id: kullanicilar.length + 1, ad: g.ad, rol: g.rol, aktif: g.aktif !== false }); return ok({ kullanicilar }); }
    return hata(404, 'uç yok (demo)');
  }

  /* ------------------------------------------------------------------ HMI (makine · stok · servis · tahmin) */
  const KAL = [
    ['hamur_pide', 'Pide hamuru', 'adet', 'B', 140, 40, 'kasa', 'Hamur üreticisi', 2, 'Hamur üreticisi'], ['hamur_lahm', 'Lahmacun hamuru', 'adet', 'B', 360, 72, 'kasa', 'Hamur üreticisi', 2],
    ['kola', 'Kola (33 cl)', 'adet', 'B', 60, 24, 'koli', 'İçecek bayii', 180], ['tatli', 'Tatlı', 'adet', 'B', 16, 16, 'tepsi', 'Tatlıcı', 3],
    ['kasar', 'Kaşar (kaset)', 'doz', 'TOP', 120, 240, 'paket', 'Süt ürünleri', 30], ['sucuk', 'Sucuk (kaset)', 'doz', 'TOP', 120, 240, 'paket', 'Şarküteri', 30],
    ['kiyma', 'Kıyma (orta kaset)', 'doz', 'TOP', 120, 240, 'kasa', 'Kasap', 2], ['tavuk', 'Tavuk (kaset)', 'doz', 'TOP', 120, 240, 'kasa', 'Tavuk tedarikçisi', 2],
    ['patates', 'Patates püresi', 'doz', 'TOP', 120, 240, 'kova', 'Püre üreticisi', 3], ['kusbasi', 'Kuşbaşı (kaset)', 'doz', 'TOP', 120, 240, 'kasa', 'Kasap', 2], ['harc', 'Lahmacun harcı', 'doz', 'TOP', 120, 240, 'kasa', 'Hazır harç', 2],
    ['kutu', 'Kutu kartonu', 'adet', 'E', 300, 300, 'palet', 'Ambalaj', 3650], ['yag', 'Yağ (sprey)', 'kg', 'K', 20, 20, 'teneke', 'Yağ bayii', 365], ['deterjan', 'Deterjan', 'lt', 'U', 10, 20, 'bidon', 'Temizlik', 365]];
  const GUNLUK = { hamur_pide: 55, hamur_lahm: 30, kola: 70, tatli: 22, kasar: 40, sucuk: 25, kiyma: 22, tavuk: 20, patates: 10, kusbasi: 14, harc: 36, kutu: 90, yag: 0.36, deterjan: 0.5 };
  const stokDurum = KAL.map(([id, ad, birim, ist, kap, paket, paket_ad, ted, omur], i) => {
    const gun = GUNLUK[id], hedef = ['TOP', 'E', 'K', 'U'].includes(ist) ? kap : Math.min(kap, gun * 2), dh = gun * 7, mak = Math.round(hedef * (id === 'kola' ? 0.25 : id === 'sucuk' ? 0.18 : 0.7 + (i % 3) * 0.08)), dep = Math.round(dh * (id === 'kola' ? 0.2 : 0.85));
    return { id, ad, birim, istasyon: ist, paket, paket_ad, tedarikci: ted, makine: mak, makine_kap: kap, makine_hedef: Math.round(hedef * 10) / 10, depo: dep, depo_hedef: Math.round(dh * 10) / 10, yenileme_noktasi: Math.round(gun * 3 * 10) / 10, gunluk: gun, gunluk_kaynak: '[V] planlama', makine_gun: Math.round(mak / gun * 100) / 100, depo_gun: Math.round(dep / gun * 100) / 100, ekle_makine: Math.max(0, Math.min(hedef - mak, dep)), eksik_depo: Math.max(0, dh - dep), kaynak: '[V]', depo_alti: dep < gun * 3, makine_alti: mak < hedef * 0.5, omur };
  });
    const TOP_KAP = { HARC: [45592, 60, 'lahmacun harcı', 'harc', 5], SOS: [15083, 150, 'patates püresi', 'patates', 5], KIYMA: [6502, 150, 'tavuk', 'tavuk', 5], KUSBASI: [4552, 145, 'kuşbaşı', 'kusbasi', 5], KASAR: [7888, 110, 'kaşar', 'kasar', 9], SUCUK: [6068, 70, 'sucuk', 'sucuk', 5], KIYMA_ORTA: [17774, 160, 'kıyma', 'kiyma', 5] };      // [kapasite g, doz g, içerik, kalem, 1 saatlik doz] = program P.TOP_KAP_G / TOP_STOK / TOP_UYARI_DOZ
  function topDemo(v, gram) { const doz = Math.floor(gram / v.doz_g); return { kalan_g: Math.round(gram), kalan_kg: Math.round(gram / 10) / 100, oran: Math.min(1, Math.round(gram / v.kapasite_g * 1000) / 1000), doz, saat: Math.round(doz / v.uyari_doz * 10) / 10, durum: doz <= 0 ? 'BOS' : doz <= v.uyari_doz ? 'SARI' : 'TAMAM' }; }
  function topDemoTum() { const r = {}; Object.entries(TOP_KAP).forEach(([k, [kap, dg, ic, kalem, uy]]) => { r[k] = Object.assign({ icerik: ic, kalem, kapasite_g: kap, doz_g: dg, uyari_doz: uy, kaset_var: true }, topDemo({ kapasite_g: kap, doz_g: dg, uyari_doz: uy }, kap * 0.8)); }); return r; }
  const H = {
    mod: 'BOSTA', hazir: true, kuyruk: 2, wip: 1, bekleme: '', firin_c: 304, yuva: 'MAKINE', sim: true, servis_ist: 'TOP',
    kasetVar: Object.fromEntries(['HARC', 'SOS', 'KIYMA', 'KUSBASI', 'KASAR', 'SUCUK', 'KIYMA_ORTA'].map(k => ['DI_TOP_' + k + '_KASET_VAR', true])),
    topping: topDemoTum(),
    cekmeceler: { K1_1: { icerik: 'HAMUR_LAHM', adet: 45, konum: 0, yuva_kap: 45, fifo_sira: 0 }, K1_2: { icerik: 'HAMUR_LAHM', adet: 6, konum: 0, yuva_kap: 45, fifo_sira: 1 }, K1_3: { icerik: 'HAMUR_LAHM', adet: 0, konum: 0, yuva_kap: 45, fifo_sira: 2 },
      K3_1: { icerik: 'HAMUR_PIDE', adet: 30, konum: 0, yuva_kap: 30, fifo_sira: 0 }, K3_2: { icerik: 'HAMUR_PIDE', adet: 4, konum: 0, yuva_kap: 30, fifo_sira: 1 }, K5_IC1: { icerik: 'ICECEK', adet: 10, konum: 0, yuva_kap: 48, fifo_sira: 0 }, K6_TATLI: { icerik: 'TATLI', adet: 12, konum: 0, yuva_kap: 12, fifo_sira: 0 } },
    soguk: { TOP: 3.6, B: 3.1 }, dolum: {}, oto_onay: false, ozet_saat: '22:00', servis: [], sayim_farki: [], zayi: [], kontrolYapilan: { acilis: {}, kapanis: {}, temizlik: {} },
    alarmlar: [{ kod: 6, ad: 'KASET_BOS', seviye: 'UYARI', aktif: true, metin: 'Kaset SUCUK %18 — sıradaki sipariş bekliyor', istasyon: 'TOP', saat: new Date().toISOString() }],
    gecmis: [{ zaman: new Date(Date.now() - 3600e3).toISOString(), ad: 'KAPI_ISLEMDE', seviye: 'UYARI', aktif: false, istasyon: 'TOP', metin: 'TOPPING kapağı açık' }],
    oneriler: [{ id: 1, durum: 'BEKLIYOR', kalem: 'kola', ad: 'Kola (33 cl)', paket_say: 6, paket_ad: 'koli', ted: 'İçecek bayii', neden: 'akşam özeti' }],
    kal: [], ariza: [], parca: [], sayimSon: {},
  };
  const LISTE = {
    acilis: ['Makine dışı ve QR dolabı gözle temiz', 'Soğuk hazne ≤ 4 °C (TOPPING + B) tablet değeri okundu', 'Fırın ısındı (hedef sıcaklık) — ekranda hazır', 'Kasetler takılı ve dolu (tablet doldur sekmesi yeşil)', 'Kutu kartonu, yağ, içecek / tatlı yeterli', 'Acil stop çalıştı (test), reset yapıldı', 'Eller yıkandı, eldiven takıldı'],
    kapanis: ['Hat boşaltıldı, açık sipariş yok', 'Kasetler çıkarılıp soğuk hazneye / buzdolabına kondu (etli ürünler)', 'Süresi dolan hamur çöpe atıldı (çöp listesi)', 'Temizlik modu: yüzeyler, kesme bıçağı bölgesi, tablalar silindi', 'Bulaşık makinesi çalıştırıldı', 'Soğuk zincir kaydı (sıcaklık) kontrol edildi', 'Fırın kapatıldı, gün sonu raporu alındı'],
    temizlik: ['Hat boşaltıldı, açık sipariş yok; TEMİZLİK modu açıldı (fırın soğutuluyor)', 'TOPPING: tabla, kaset ağızları, yayıcı + silecek gıda uyumlu temizleyiciyle silindi, durulandı', 'TOPPING kasetleri çıkarıldı: etli ürünler soğuk hazneye, boşlar yıkamaya', 'K: bıçak bölgesi, bant ve itici silindi (yalnız TEMİZLİK modunda, kapak açık, bıçak kilit pimi içeride)', 'E: kutu katlama yüzeyleri ve vakum başlığı silindi', 'B: çekmeceler içten silindi, eski ürün kalmadı (FIFO çöp listesi)', 'QR dolabı: gözler iç yüzeyi silindi, kapı contası kontrol edildi', 'Zemin ve dış yüzeyler silindi, çöp çıkarıldı', 'Yüzey sanitizer / sıcaklık kaydı yazıldı (soğuk hazne ≤ 4 °C)'] };
  const liste = ad => LISTE[ad].map(m => ({ madde: m, yapildi: !!H.kontrolYapilan[ad][m], kim: H.kontrolYapilan[ad][m] || null }));
  const REHBER = { KASET_BOS: { anlam: 'Kaset boş — sıradaki sipariş bekliyor', neden: 'Kaset bitti ya da BOŞ sensörü tetiklendi', adimlar: ['DOLDUR sekmesi → TOPPING → boş kaseti dolusuyla değiştirin', 'Sayımı onaylayın'], cozen: 'personel' }, KAPI_ISLEMDE: { anlam: 'Bir istasyon kapağı açık', neden: 'Doldurma / bakım', adimlar: ['İşiniz bittiyse kapağı kapatın', 'BAŞLAT ile devam edin'], cozen: 'personel' } };
  const EKSEN = [['AX_TOP_X', 'TOP', 'mm', 660], ['AX_TOP_TABLA', 'TOP', '°', 0], ['AX_TOP_BANT', 'TOP', 'mm', 0], ['AX_F_YBANT', 'F', 'mm', 0], ['AX_K_BANT', 'K', 'mm', 0], ['AX_E_PISTON', 'E', 'mm', 0], ['AX_E_KOL', 'E', '°', 0], ['AX_ROB_RAY', 'ROB', 'mm', 1800]].map(([ad, ist, birim, konum]) => ({ ad, ist, birim, konum, hiz: 0, durum: 'DURUYOR' }));
  const gunlukSeri = () => { const o = []; for (let i = 0; i < 7; i++) { const d = new Date(Date.now() + (i + 1) * GUN * 1000), w = d.getDay(), orta = Math.round(80 * [1, .85, .85, .9, .95, 1.15, 1.3][w] * (w === 2 || w === 5 ? 1.08 : 1) * 10) / 10; o.push({ gun: d.toISOString().slice(0, 10), gun_ad: ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'][w], orta, alt: Math.round(orta * 0.82 * 10) / 10, ust: Math.round(orta * 1.22 * 10) / 10, neden: w === 2 || w === 5 ? ['maç günü +%8'] : (i === 3 ? ['yağmur −%14'] : []) }); } return o; };
  const dpPlan = ist => { const k = stokDurum.filter(x => x.istasyon === ist); const ad = { TOP: 'TOPPING kaset yuvaları (soldan sağa: HARÇ = lahmacun harcı, SOS = patates, KIYMA = tavuk, KUŞBAŞI, KAŞAR, SUCUK; üst orta = kıyma)', E: 'E kutu şarjörü', K: 'K yağ tenekesi (sprey)', B: 'B çekmeceleri (hamur / içecek / tatlı)', U: 'U üst depo (deterjan · yedek)' }; if (!ad[ist]) return null;
    return { istasyon: ist, baslik: ad[ist], yontem: { TOP: 'Kapağı aç → boş / yarı kaseti çıkar (soğuk taşıma kutusuna), dolu kaseti tırnağa tıkla (klik sesi) → kapağı kapat', B: "Çekmeceyi aç → eski ürünlerin ÖNÜNE ('ilk giren ilk çıkar') yenileri arkaya diz → kapat", E: 'Kapağı aç → yeni kartonları yığın üstüne diz → kapat', K: 'Kilit açılınca kapağı aç → tenekeyi değiştir → kapat', U: 'Rafa yerleştir, adedi gir' }[ist],
      kalemler: k.map(x => ({ id: x.id, ad: x.ad, birim: x.birim, mevcut: x.makine, hedef: x.makine_hedef, kapasite: x.makine_kap, eklenecek: x.ekle_makine, depoda: x.depo, fifo: /hamur|kola|tatli/.test(x.id), son_kullanma: /hamur/.test(x.id) ? new Date(Date.now() + 30 * 3600e3).toISOString().slice(0, 16) : null })) }; };
  const tablet = () => {
    const gorev = {}; stokDurum.filter(d => d.makine_alti && d.ekle_makine > 0).forEach(d => (gorev[d.istasyon] = gorev[d.istasyon] || []).push({ kalem: d.id, ad: d.ad, ekle: d.ekle_makine, birim: d.birim }));
    return { mod: H.mod, hazir: H.mod === 'BOSTA' || H.mod === 'SIPARIS', kuyruk: siparisler.filter(s => ['ODENDI', 'MAKINE_KABUL'].includes(s.durum)).length, wip: siparisler.filter(s => ['URETIMDE', 'KUTU_HAZIR'].includes(s.durum)).length, bekleme: '', firin_c: H.firin_c, soguk: H.soguk,
      istasyonlar: { B: 'BOS', A: 'BOS', TOP: H.mod === 'SERVIS' ? 'DURDU' : 'CALISIYOR', F: 'CALISIYOR', K: 'BOS', E: 'CALISIYOR', ROB: 'BOS', QR: 'BOS' }, alarm: H.alarmlar.filter(a => a.aktif), dolum: Object.fromEntries(Object.entries(H.dolum).map(([k, v]) => [k, v.durum])), stok: stokDurum, gorevler: gorev,
      cop: [{ kalem: 'hamur_pide', ad: 'Pide hamuru', adet: 40, son: new Date(Date.now() + 8 * 3600e3).toISOString().slice(0, 16), gecti: false, kat: 'makine' }], acilis: liste('acilis'), kapanis: liste('kapanis'), temizlik: liste('temizlik'), servis: H.servis.filter(x => x.durum === 'ACIK'), sayim_farki: H.sayim_farki,
      alarm_gecmis: H.gecmis.concat(H.alarmlar.map(a => ({ zaman: a.saat, ad: a.ad, seviye: a.seviye, aktif: true, istasyon: a.istasyon }))), oneriler: H.oneriler, zayi: H.zayi, hamur_onerisi: [{ kalem: 'hamur_pide', gunluk: 55, eldeki: 160, onerilen: 80 }, { kalem: 'hamur_lahm', gunluk: 30, eldeki: 300, onerilen: 0 }],
      oto_onay: H.oto_onay, ozet_saat: H.ozet_saat, yuva: H.yuva, servis_cagri_acik: H.servis.filter(x => x.durum === 'ACIK').length, sim: true, tur: H.tur || null, sihirbaz: H.sihirbaz || null, tur_kayit: H.turKayit || [], kaset_var: H.kasetVar, cekmeceler: H.cekmeceler, topping: H.topping, saat: new Date().toISOString() };
  };
  function hmi(yontem, yol, g, kim) {
    const [p, qs] = yol.split('?'), q = new URLSearchParams(qs || '');
    if (yontem === 'GET') {
      if (p === '/api/tablet') return ok(tablet());
      if (p === '/api/tablet/plan') { const r = dpPlan(q.get('ist')); return r ? ok(r) : hata(400, 'doldurulacak istasyon geçersiz'); }
      if (p === '/api/tablet/rapor') return ok({ gun: new Date().toISOString().slice(0, 10), satilan: { bugun_uretim: siparisler.filter(s => s.odeme_zaman >= gunBas()).length, bugun_kirilim: { kasarli: 7, lahmacun: 9, sucuklu: 5 }, hurda: 0 }, tuketim: [{ kalem: 'kutu', adet: 42 }], zayi: [], sicaklik: { kayit: 120, firin_min: 296, firin_maks: 306, top_maks: 3.9, b_maks: 3.4, haccp_ihlali: false, sinir_c: 4 }, acilis: liste('acilis'), kapanis: liste('kapanis'), sayim_farklari: H.sayim_farki, servis_cagrilari: H.servis });
      if (p === '/api/tablet/servis') return ok({ mod: H.mod, servis_ist: H.servis_ist, eksenler: EKSEN, sensorler: { AI_F_SICAKLIK: H.firin_c, AI_TOP_SOGUTUCU: 3.6, AI_B_SOGUTUCU: 3.1, AI_HAT_PANO_SICAK: 41, AI_HAT_HAVA_BAR: 6.1, DI_ROB_HAZIR: true }, guvenlik: { GS_DURUM_ACIL: true, GS_DURUM_HUCRE: true, GS_DURUM_HAVA: true, GS_DURUM_KAPI_TOPPING: true, GS_DURUM_KAPI_F: true, GS_DURUM_KAPI_K: true, GS_DURUM_KAPI_E: true }, kalibrasyon: H.kal.slice(0, 10), ariza: H.ariza.slice(0, 15), parca: H.parca.slice(0, 15), parca_onerileri: { TOP: ['X motoru', 'Tabla motoru', 'Kaset helezonu', 'UNO piston'], K: ['Bıçak', 'Kilit pimi (AEN-16-15)', 'Yük hücresi'], F: ['Isıtıcı', 'Bant motoru'], E: ['Vakum başlığı', 'Piston'], B: ['Çekmece motoru', 'Reed sensörü'] }, kalibrasyon_son: {} });
      if (p === '/api/tablet/alarm') return ok({ aktif: H.alarmlar.filter(a => a.aktif).map(a => ({ ...a, rehber: REHBER[a.ad] || null })), gecmis: H.gecmis.map(a => ({ ...a, rehber: REHBER[a.ad] || null })) });
      if (p === '/api/tablet/gelen-giden') { const g = { gun: 1, hafta: 7, ay: 30 }[q.get('aralik') || 'gun'] || 1; const m = [['hamur_pide', 'Pide hamuru', 'adet', 9, 41 * g], ['hamur_lahm', 'Lahmacun hamuru', 'adet', 7, 18 * g], ['kola', 'Kola (33 cl)', 'adet', 14, 53 * g], ['tatli', 'Tatlı', 'adet', 28, 14 * g], ['kasar', 'Kaşar (kaset)', 'doz', 12, 44 * g], ['kutu', 'Kutu kartonu', 'adet', 4, 59 * g]].map(([kalem, ad, birim, bm, adet]) => ({ kalem, ad, birim, adet, birim_maliyet: bm, tutar: adet * bm })); const z = [{ kalem: 'hamur_pide', ad: 'Pide hamuru', birim: 'adet', adet: 3 * g, neden: 'süresi doldu (makine)', birim_maliyet: 9, tutar: 27 * g }]; return ok({ gun: g, malzeme: m, zayi: z, toplam_malzeme: m.reduce((a, x) => a + x.tutar, 0), toplam_zayi: z.reduce((a, x) => a + x.tutar, 0), maliyet_kaynak: '[V] DEMO varsayımı', komisyon: { platform: 0.25, sanal_pos_oran: 0.029, sanal_pos_sabit_kurus: 25, kart_pos_oran: 0.02 }, komisyon_kaynak: '[V] DEMO varsayımı' }); }
      if (p === '/api/tablet/tahmin') { const hf = gunlukSeri(); return ok({ asama: 'varsayilan', egitim_gun: 0, yarin: { ...hf[0], aciklama: hf[0].gun_ad + ': temel ' + hf[0].orta + ' (varsayılan profil — veri az)' }, hafta: hf, kalemler: stokDurum.filter(x => ['hamur_pide', 'hamur_lahm', 'kola', 'tatli', 'kutu'].includes(x.id)).map(x => ({ kalem: x.id, ad: x.ad, ihtiyac: Math.round(x.gunluk * (x.id === 'hamur_pide' || x.id === 'hamur_lahm' ? 2 : 7)), eldeki: x.makine + x.depo, eksik: Math.max(0, x.gunluk * 7 - x.makine - x.depo), paket: x.paket, paket_ad: x.paket_ad, paket_say: x.depo_alti ? 3 : 0, adet: x.depo_alti ? 3 * x.paket : 0, dayanak: '7 gün toplam sipariş kalemi', neden: null })), hata: { yok: true, neden: 'hata raporu için en az 60 günlük kayıt gerekir (DEMO)' }, mac_gunleri: [] }); }
      if (p === '/api/tablet/sayim') return ok({ matris: { kalemler: stokDurum.map(x => ({ kalem: x.id, ad: x.ad, istasyon: x.istasyon, makine_yontem: /hamur|kola|tatli/.test(x.id) ? 'robot kamerası çekmece açılınca sayar + tüketim kaydı' : x.istasyon === 'TOP' ? 'kaset VAR / BOŞ sensörü + tüketim sayımı' : x.id === 'yag' ? 'K tartısı (yük hücresi) ölçer' : x.id === 'kutu' ? 'E şarjör sensörü + tüketim kaydı' : 'personel sayımı', kamera_gorur: /hamur|kola|tatli/.test(x.id), makine_guven: 'DEMO', depo_yontem: 'kayıt + haftalık personel sayımı', duzeltme: '—' })), not_: 'Robot bilek kamerası YALNIZ makine içi çekmece / gözleri görür (içecek, tatlı, hamur tepsileri). Depo, makine dışı dolap, kaset seviyesi, yağ, kutu ve deterjanı göremez: kayıt + sensör + haftalık personel sayımıyla izlenir.' }, gorev: stokDurum.map(x => ({ kalem: x.id, ad: x.ad, birim: x.birim, kayit: x.depo, son_sayim_gun: H.sayimSon[x.id] ?? null, suresi_geldi: H.sayimSon[x.id] == null })), rapor: { gun: 7, farklar: H.sayim_farki.map(f => ({ kalem: f.kalem, kaynak: f.kaynak, n: 1, toplam_fark: f.sayilan - f.beklenen })), sayim_suresi_gelen: stokDurum.filter(x => H.sayimSon[x.id] == null).map(x => x.id), toplam_fark_kaydi: H.sayim_farki.length } });
      if (p === '/api/durum') return ok({ mod: H.mod, sayac: { calisma_sn: 28800, uretim_sn: 19100, durus_sn: 1800, hata: 1, hurda: 0, bugun_uretim: 53 }, firin_c: H.firin_c, alarmlar: H.alarmlar, istasyonlar: tablet().istasyonlar });
      return hata(404, 'uç yok (demo)');
    }
    // POST
    if (p === '/api/komut' && g.tip === 'test.kaset') { H.kasetVar[g.kaset] = !!g.var; return ok({ ok: true }); }
    if (p === '/api/komut') { if (g.tip === 'test.kapi') { const d = H.dolum[g.istasyon]; if (d) d.durum = g.acik ? 'ACIK' : 'KAPANDI'; } return ok({ ok: true }); }
    if (p === '/api/tablet/komut') {
      const k = kim, tip = g.tip, rolOk = en => k && SIRA[k.rol] >= SIRA[en];
      if (!k) return hata(401, 'yetki');
      const srv = /^makine\.(servis|jog|home|dur|io)/.test(tip) || ['kalibrasyon.kaydet', 'ariza.kapat', 'parca.degistir'].includes(tip), yon = ['oneri.onayla', 'oneri.red', 'ayar', 'ozet.simdi', 'uye.ekle'].includes(tip);
      if (!rolOk(yon ? 'yonetici' : srv ? 'servis' : 'personel')) return hata(401, 'yetki');
      if (tip === 'topping.doldur') {          // demo: gram girişi (programda P.TOP_KAP_G üst sınır; demo yalnız aşımı reddeder)
        const kd = String(g.kaset || '').toUpperCase(), v = H.topping[kd] || Object.values(H.topping).find(x => x.kalem === String(g.kaset || '').toLowerCase());
        if (!v) return hata(400, 'kaset bilinmiyor: ' + g.kaset);
        const gram = g.gram == null || g.gram === '' ? v.kapasite_g : +g.gram;
        if (!(gram >= 0 && gram <= v.kapasite_g * 1.05)) return hata(400, 'gram 0…' + v.kapasite_g + ' aralığında olmalı (kaset kapasitesi)');
        Object.assign(v, topDemo(v, gram)); return ok({ ok: true, gram });
      }
      if (tip === 'dolum.iste') { H.dolum[g.istasyon] = { durum: 'TALEP' }; setTimeout(() => { if (H.dolum[g.istasyon] && H.dolum[g.istasyon].durum === 'TALEP') H.dolum[g.istasyon].durum = 'HAZIR'; }, 2500); return ok({ ok: true, istasyon: g.istasyon, durum: 'TALEP' }); }
      if (tip === 'dolum.iptal' || tip === 'dolum.sifirla') { if (g.istasyon === 'hepsi') Object.keys(H.dolum).forEach(k => delete H.dolum[k]); else delete H.dolum[g.istasyon]; return ok({ ok: true }); }
      if (tip === 'dolum.cekmece') {          // B çekmecesini makine açar / kapatır (demo): hepsi kapalıyken ACIK → KAPANDI
        const c = H.cekmeceler[g.cekmece]; if (!c) return hata(400, 'çekmece yok');
        if (!g.ac && !g.basili) return hata(400, 'çekmece kapatma EMNİYET: kapat düğmesini BASILI TUTUN');
        c.konum = g.ac ? 700 : Math.max(0, c.konum - 175);       // demo: her kalp atışı 175 mm (gerçekte 40 mm/s)
        const d = H.dolum.B; if (d && ['HAZIR', 'ACIK', 'KAPANDI'].includes(d.durum)) d.durum = Object.values(H.cekmeceler).some(x => x.konum > 1) ? 'ACIK' : (d.durum === 'HAZIR' ? 'HAZIR' : 'KAPANDI');
        return ok({ ok: true });
      }
      if (tip === 'tur.kaydet' || tip === 'sihirbaz.kaydet') { H[tip.split('.')[0] === 'tur' ? 'tur' : 'sihirbaz'] = g.durum ? { ...g.durum, kim: k.ad } : null; return ok({ ok: true, durum: g.durum }); }
      if (tip === 'tur.bitir' || tip === 'sihirbaz.bitir') { const ad = tip.split('.')[0] === 'tur' ? 'tur' : 'sihirbaz'; H[ad] = null; (H.turKayit = H.turKayit || []).unshift({ id: (H.turKayit || []).length + 1, t: Date.now() / 1000, kim: k.ad, tur: ad, veri: g.ozet || {} }); return ok({ ok: true, kayit: H.turKayit.length }); }
      if (tip === 'dolum.bitti') { const pl = dpPlan(g.istasyon); Object.entries(g.sayim || {}).forEach(([id, v]) => { const x = stokDurum.find(y => y.id === id); if (x) { x.depo = Math.max(0, x.depo - Math.max(0, v - x.makine)); x.makine = v; x.ekle_makine = Math.max(0, x.makine_hedef - v); x.makine_alti = v < x.makine_hedef * 0.5; } }); delete H.dolum[g.istasyon]; return ok({ ok: true, istasyon: g.istasyon, fark: {} }); }
      if (tip === 'oneri.onayla') { const o = H.oneriler.find(x => x.id == g.id); if (o) o.durum = 'GONDERILDI'; return ok({ ok: true, metin: 'Merhaba, AUTOKITCH Dükkân 1 için ' + o.paket_say + ' ' + o.paket_ad + ' ' + o.ad + ' sipariş etmek istiyoruz. Teşekkürler.' }); }
      if (tip === 'oneri.red') { const o = H.oneriler.find(x => x.id == g.id); if (o) o.durum = 'RED'; return ok({ ok: true }); }
      if (tip === 'depo.giris') { const x = stokDurum.find(y => y.id === g.kalem); if (x) x.depo += (g.paket_say || 0) * x.paket + (g.adet || 0); return ok({ ok: true, kalem: g.kalem }); }
      if (tip === 'kamera.sayim') { const x = stokDurum.find(y => y.id === g.kalem); const f = g.sayilan - x.makine; if (f) H.sayim_farki.unshift({ kalem: g.kalem, beklenen: x.makine, sayilan: g.sayilan, kaynak: 'kamera' }); return ok({ ok: true, fark: f, uyari: !!f }); }
      if (tip === 'kontrol.isaretle') { H.kontrolYapilan[g.liste][g.madde] = k.ad; return ok({ ok: true }); }
      if (tip === 'temizlik.isaretle') { if (!LISTE.temizlik.includes(g.madde)) return hata(400, 'madde listede yok'); H.kontrolYapilan.temizlik[g.madde] = k.ad; return ok({ ok: true }); }
      if (tip === 'servis.cagri') { H.servis.unshift({ id: H.servis.length + 1, istasyon: g.istasyon, metin: g.metin, kim: k.ad, durum: 'ACIK' }); return ok({ ok: true }); }
      if (tip === 'servis.kapat') { const s = H.servis.find(x => x.id == g.id); if (s) s.durum = 'KAPANDI'; return ok({ ok: true }); }
      if (tip === 'zayi.tara') return ok({ ok: true, yazilan: [] });
      if (tip === 'tahmin.oneri') return ok({ ok: true, yeni: [1] });
      if (tip === 'mac.ekle') return ok({ ok: true, gun: g.gun });
      if (tip === 'ayar') { H.oto_onay = !!g.oto_onay; H.ozet_saat = g.ozet_saat || H.ozet_saat; return ok({ ok: true }); }
      if (tip === 'ozet.simdi') return ok({ ok: true, metin: 'AUTOKITCH akşam özeti (DEMO)', oneri: [], bildirim: 0 });
      if (tip === 'tablet.yuva') { H.yuva = g.yuva; return ok({ ok: true, yuva: H.yuva }); }
      if (tip === 'makine.servis') { if (g.ac) { H.mod = 'SERVIS'; H.servis_ist = g.istasyon || 'TOP'; } else H.mod = 'BOSTA'; return ok({ ok: true }); }
      if (tip === 'makine.jog') { const e = EKSEN.find(x => x.ad === g.eksen); if (!e) return ok({ ok: false, hata: 'eksen yok' }); if (H.mod !== 'SERVIS') return ok({ ok: false, hata: 'jog yalnız SERVIS modunda' }); e.konum += (g.yon >= 0 ? 1 : -1) * Math.min(50, Math.abs(g.miktar || 10)); return ok({ ok: true, uygulanan_hiz: Math.min(50, g.hiz || 20), uygulanan_miktar: Math.min(50, Math.abs(g.miktar || 10)) }); }
      if (tip === 'makine.home' || tip === 'makine.dur' || tip === 'makine.io') return ok({ ok: true });
      if (tip === 'makine.temizlik') { H.mod = g.ac ? 'TEMIZLIK' : 'BOSTA'; return ok({ ok: true }); }
      if (tip === 'makine.hat') { const m = { ac: 'ISINMA', kapat: 'KAPALI', baslat: 'BOSTA' }[g.islem]; if (m) H.mod = m; if (g.islem === 'ac') setTimeout(() => { if (H.mod === 'ISINMA') H.mod = 'BOSTA'; }, 4000); return ok({ ok: true }); }
      if (tip === 'kalibrasyon.kaydet') { const duz = g.tur === 'tarti' ? g.referans / g.olculen : g.referans - g.olculen; const uyari = g.tur === 'tarti' ? Math.abs(duz - 1) > 0.02 : Math.abs(duz) > 3; H.kal.unshift({ t: now(), tur: g.tur, hedef: g.hedef, referans: g.referans, olculen: g.olculen, duzeltme: duz, birim: g.tur === 'tarti' ? 'kat sayı' : '°C ofset', kim: k.ad }); return ok({ ok: true, duzeltme: Math.round(duz * 1e4) / 1e4, uyari, mesaj: uyari ? 'Düzeltme büyük — SERVİS çağırın' : 'Düzeltme kaydedildi (DEMO)' }); }
      if (tip === 'ariza.kaydet') { H.ariza.unshift({ id: H.ariza.length + 1, t: now(), istasyon: g.istasyon, metin: g.metin, kim: k.ad, durum: 'ACIK' }); return ok({ ok: true, id: H.ariza.length }); }
      if (tip === 'ariza.kapat') { const a = H.ariza.find(x => x.id == g.id); if (a) { a.durum = 'KAPANDI'; a.cozum = g.cozum; } return ok({ ok: true }); }
      if (tip === 'parca.degistir') { H.parca.unshift({ id: H.parca.length + 1, t: now(), istasyon: g.istasyon, parca: g.parca, eski_seri: g.eski_seri, yeni_seri: g.yeni_seri, neden: g.neden, kim: k.ad }); return ok({ ok: true }); }
      if (tip === 'sayim.haftalik') { const x = stokDurum.find(y => y.id === g.kalem), f = g.sayilan - x.depo; if (f) H.sayim_farki.unshift({ kalem: g.kalem, beklenen: x.depo, sayilan: g.sayilan, kaynak: 'haftalık sayım' }); x.depo = g.sayilan; H.sayimSon[g.kalem] = 0; return ok({ ok: true, fark: f, uyari: !!f }); }
      if (tip === 'kaset.bos') return ok({ ok: true, duzeltme: 0 });
      if (tip === 'tarti.oku' || tip === 'sarjor.sensor') return ok({ ok: true });
      return hata(400, 'bilinmeyen komut (demo)');
    }
    return hata(404, 'uç yok (demo)');
  }
  D.istek = (hedef, yontem, yol, govde, kim) => (hedef === 'hmi' ? hmi : sip)(yontem, yol, govde || {}, kim);
})();
