/* AUTOKITCH · YÖNETİCİ PANELİ (7 Eki 2026 · tablet / stok / G/Ç oturumu) — uzaktan, telefon / tablet. SCADA + HMI "Sahip" modu burada birleşir.
   Ciro + adet (gün / hafta / ay · ürün · kanal) · makine verimi · stok + tahmin + satın alma onayı · zayi · HACCP · alarmlar · personel vardiyası + kasa farkı ·
   fatura listesi · menü / fiyat / kampanya / alerjen · kullanıcı / rol / PIN · çok şube hazırlığı. Yetki: YÖNETİCİ PIN'i (ak-tb.js). Sunucu yoksa DEMO. */
(function () {
  'use strict';
  const { $, h, bos, bildir, modal } = AK;
  const ST = { sekme: AK.Q.get('sekme') || 'ozet', D: null, imza: '' };
  const SEKMELER = [['ozet', 'ÖZET'], ['gg', 'GELEN / GİDEN'], ['satis', 'SATIŞ'], ['makine', 'MAKİNE'], ['stok', 'STOK'], ['haccp', 'HACCP'], ['alarm', 'ALARMLAR'], ['personel', 'PERSONEL'], ['fatura', 'FATURA'], ['menu', 'MENÜ'], ['sube', 'ŞUBELER']];
  const kart = (b, ...c) => h('div', { sinif: 'ak-kart' }, b ? h('h2', { sinif: 'tb-b', metin: b }) : null, ...c);
  const rozet = (m, s) => h('span', { sinif: 'ak-rozet ' + (s || ''), metin: m });
  const dug = (m, o, f) => h('button', { type: 'button', sinif: 'ak-dugme ' + (o || ''), metin: m, onclick: f });
  const alan = (et, g) => h('label', { sinif: 'ak-alan' }, h('span', { metin: et }), g);
  const gir = o => h('input', Object.assign({ sinif: 'ak-giris' }, o));
  const kpi = (b, k) => h('div', {}, h('b', { metin: b }), h('small', { metin: k }));
  const hata = e => bildir(e && e.message ? e.message : String(e), 4500);
  const F = {};
  const fg = (ad, o) => gir(Object.assign({ value: F[ad] ?? '', oninput: e => { F[ad] = e.target.value; } }, o || {}));
  const f = TB.f1;
  const komut = async (tip, k, mesaj) => { try { const v = await TB.komut(tip, k); if (mesaj) bildir(typeof mesaj === 'function' ? mesaj(v) : mesaj); await veri(); return v; } catch (e) { hata(e); return null; } };

  function kabuk() {
    const kok = bos($('#kok'));
    kok.append(h('div', { sinif: 'ak-ust' }, h('div', { sinif: 'ak-ust-ic' }, h('span', { sinif: 'ak-marka', html: 'AUTO<i>KITCH</i> · YÖNETİCİ' }), h('span', { sinif: 'ak-bosluk' }), h('span', { id: 'bag' }), h('span', { id: 'kim' }), dug('Makine HMI', 'kucuk', () => { const q=new URLSearchParams(location.search);q.delete('pin');q.set('mod','MAKINE');q.set('panel','makine');location.href='../tablet/index.html?'+q; }), dug('Tema', 'kucuk hayalet', () => AK.tema.degistir()))),
      h('div', { sinif: 'ak-kap ops-layout' }, h('nav', { sinif: 'ak-sekme', id: 'sekmeler', role: 'tablist', 'aria-label':'Yönetim bölümleri' }), h('div', { sinif: 'ak-ara' }), h('div', { id: 'icerik' })));
  }
  function ust() {
    const m = TB.mod.hmi === 'demo' || TB.mod.sip === 'demo';
    bos($('#bag')).append(rozet(m ? 'DEMO verisi' : 'bağlı · gerçek', m ? 'uyari' : 'iyi'));
    bos($('#kim')).append(dug(TB.pin ? TB.ad + ' · Çıkış' : 'Giriş', 'kucuk', async () => { if (TB.pin) TB.cikis(); else await TB.pinSor('yonetici', 'Yönetici girişi'); ciz(); }));
    const s = bos($('#sekmeler'));
    SEKMELER.forEach(([k, ad]) => s.append(h('button', { type: 'button', role: 'tab', sinif: ST.sekme === k ? 'on' : '', 'aria-selected':String(ST.sekme===k), metin: ad, onclick: () => { ST.sekme = k; ciz(); } })));
  }
  async function ciz() {
    ust();
    const kap = bos($('#icerik'));
    if (!TB.yetkili('yonetici')) {
      kap.append(h('div', { sinif: 'ak-kap dar' }, kart('Yönetici girişi', h('p', { metin: 'Panel yalnız yönetici PIN\'iyle açılır.' }), dug('PIN ile giriş', 'ana tam', async () => { await TB.pinSor('yonetici', 'Yönetici girişi'); ciz(); }))));
      return;
    }
    const kutu = h('div', {}); kap.append(kutu);
    const titles={ozet:'İşletme özeti',gg:'Gelir ve gider',satis:'Satış raporları',makine:'Makine performansı',stok:'Stok yönetimi',haccp:'Gıda güvenliği',alarm:'Alarm merkezi',personel:'Personel ve vardiya',fatura:'Faturalar',menu:'Menü ve fiyatlar',sube:'Şubeler'};
    kutu.append(h('header',{sinif:'ops-heading'},h('div',{},h('p',{sinif:'ops-eyebrow',metin:'YÖNETİM / '+(SEKMELER.find(x=>x[0]===ST.sekme)?.[1]||'')}),h('h1',{metin:titles[ST.sekme]||'Yönetim'})),h('span',{sinif:'ops-context',metin:'AUTOKITCH · İşletme'})));
    try { const r = SAYFA[ST.sekme](kutu); if (r && r.catch) r.catch(e => kutu.append(h('div', { sinif: 'tb-tehlike-serit', metin: 'Hata: ' + e.message }))); }
    catch (e) { kutu.append(h('div', { sinif: 'tb-tehlike-serit', metin: 'Hata: ' + e.message })); }
  }
  async function veri() { try { ST.D = await TB.hmiAl('/api/tablet'); } catch (e) { /* */ } if (TB.yetkili('yonetici') && !document.querySelector('#icerik input:focus, #icerik select:focus')) ciz(); }
  const ciroAl = (a, g) => TB.sipAl('/api/rapor/ciro?aralik=' + a + '&grup=' + g);
  const kanalAd = { PERSONEL: 'Tezgâh', TELEFON: 'Telefon', QR: 'QR / web', GETIR: 'Getir', YEMEKSEPETI: 'Yemeksepeti', TRENDYOL: 'Trendyol' };

  /* ---------------------------------------------------------------- sayfalar */
  const SAYFA = {
    async ozet(kap) {
      const [g, hf, ay, d, kq, durum] = await Promise.all([ciroAl('gun', 'kanal'), ciroAl('hafta', 'kanal'), ciroAl('ay', 'urun'), TB.hmiAl('/api/tablet').catch(() => null), TB.sipAl('/api/kuyruk').catch(() => ({ siparisler: [] })), TB.hmiAl('/api/durum').catch(() => null)]);
      ST.D = d;
      const sa = durum && durum.sayac, verim = sa && sa.calisma_sn ? Math.round(100 * sa.uretim_sn / sa.calisma_sn) : null;
      const eksik = d ? d.stok.filter(x => x.depo_alti || x.makine_alti).length : null;
      kap.append(h('div', { sinif: 'tb-kpi' }, kpi(TB.tl0(g.ciro_kurus), 'bugün ciro · ' + g.siparis_adet + ' sipariş'), kpi(TB.tl0(hf.ciro_kurus), '7 gün ciro · ' + hf.siparis_adet), kpi(TB.tl0(ay.ciro_kurus), '30 gün ciro · ' + ay.siparis_adet), kpi(kq.siparisler.length, 'açık sipariş'), kpi(verim == null ? '—' : '%' + verim, 'makine verimi (üretim / çalışma)'), kpi(d ? d.alarm.length : '—', 'aktif alarm'), kpi(eksik == null ? '—' : eksik, 'eksik / yenilenecek kalem'), kpi(d ? d.servis_cagri_acik : '—', 'açık servis çağrısı')));
      kap.append(h('div', { sinif: 'tb-iki' }, kart('Son 30 gün ciro (₺)', TB.cubuk(ay.seri, x => x.gun.slice(8), x => x.ciro_kurus)), kart('Bugün · kanal kırılımı', g.satirlar.length ? TB.yatayCubuk(g.satirlar, x => kanalAd[x.ad] || x.ad, x => x.ciro_kurus, x => TB.tl0(x.ciro_kurus)) : h('p', { sinif: 'ak-soluk', metin: 'Bugün satış yok.' }))));
      if (d && d.alarm.length) kap.append(h('div', { sinif: 'tb-ark' }), kart('Aktif alarmlar', d.alarm.map(a => h('div', { sinif: 'ak-ipucu ' + (a.seviye === 'HATA' ? 'kotu' : 'uyari') }, h('b', { metin: a.ad }), ' · ' + a.metin))));
    },
    async gg(kap) {
      /* PATRON · GELEN / GİDEN (7 Eki, IKIZ_PLAN): gelen = sipariş sunucusu ciro raporu (kanal · saat · ödeme); giden = HMI stok (malzeme tüketimi, zayi) + komisyonlar.
         Maliyet ve komisyon oranları [V] varsayım — yönetici gerçek değerleri girince hesap güncellenir. Kira / personel / enerji bu görünümde YOK (yalnız değişken giderler). */
      const a = F.ggAralik || 'gun', sec = h('select', { sinif: 'ak-giris', onchange: e => { F.ggAralik = e.target.value; ciz(); } }, [['gun', 'Bugün'], ['hafta', 'Son 7 gün'], ['ay', 'Son 30 gün']].map(([k, t]) => h('option', { value: k, metin: t })));
      sec.value = a;
      const [kn, st, od, gd] = await Promise.all([ciroAl(a, 'kanal'), ciroAl(a, 'saat'), ciroAl(a, 'odeme'), TB.hmiAl('/api/tablet/gelen-giden?aralik=' + a)]);
      const brut = kn.ciro_kurus / 100, plat = new Set(['GETIR', 'YEMEKSEPETI', 'TRENDYOL']), K = gd.komisyon;
      const platKom = kn.satirlar.filter(x => plat.has(x.ad)).reduce((t, x) => t + x.ciro_kurus / 100 * K.platform, 0);
      const odKom = od.satirlar.reduce((t, x) => t + (x.ad === 'SANAL_POS' ? x.ciro_kurus / 100 * K.sanal_pos_oran + x.adet * K.sanal_pos_sabit_kurus / 100 : x.ad === 'KART_POS' ? x.ciro_kurus / 100 * K.kart_pos_oran : 0), 0);
      const gider = gd.toplam_malzeme + gd.toplam_zayi + platKom + odKom, net = brut - gider;
      const tl = v => v.toLocaleString('tr-TR', { maximumFractionDigits: 0 }) + ' ₺';
      kap.append(h('div', { sinif: 'tb-yatay' }, alan('Aralık', sec)), h('div', { sinif: 'tb-ark' }),
        h('div', { sinif: 'tb-kpi' }, kpi(tl(brut), 'GELEN · ciro (KDV dahil) · ' + kn.siparis_adet + ' sipariş'), kpi(tl(gd.toplam_malzeme), 'GİDEN · malzeme tüketimi'), kpi(tl(gd.toplam_zayi), 'GİDEN · zayi'), kpi(tl(platKom), 'GİDEN · platform komisyonu'), kpi(tl(odKom), 'GİDEN · ödeme komisyonu'), kpi(tl(net), 'KÂR ÖZETİ (değişken giderlerden sonra)')),
        h('div', { sinif: 'ak-ipucu uyari', metin: 'Maliyet ve komisyon oranları VARSAYIMDIR (' + gd.maliyet_kaynak + '). Kira, personel, enerji, amortisman bu özette yok. Ciro KDV dahildir; kâr özeti KDV ayrıştırmaz.' }), h('div', { sinif: 'tb-ark' }),
        h('div', { sinif: 'tb-iki' }, kart('GELEN · kanal', kn.satirlar.length ? TB.yatayCubuk(kn.satirlar, x => kanalAd[x.ad] || x.ad, x => x.ciro_kurus, x => TB.tl0(x.ciro_kurus) + ' · ' + x.adet) : h('p', { sinif: 'ak-soluk', metin: 'Satış yok.' })),
          kart('GELEN · ödeme yöntemi', od.satirlar.length ? TB.yatayCubuk(od.satirlar, x => ({ SANAL_POS: 'Online kart (iyzico)', KART_POS: 'Dükkân POS', NAKIT: 'Nakit', PLATFORM: 'Platform' })[x.ad] || x.ad, x => x.ciro_kurus, x => TB.tl0(x.ciro_kurus) + ' · ' + x.adet) : h('p', { sinif: 'ak-soluk', metin: 'Satış yok.' }))),
        h('div', { sinif: 'tb-ark' }), kart('GELEN · saat dağılımı (ciro)', st.satirlar.length ? TB.cubuk(st.satirlar, x => x.ad.slice(0, 2), x => x.ciro_kurus) : h('p', { sinif: 'ak-soluk', metin: 'Satış yok.' })),
        h('div', { sinif: 'tb-ark' }),
        kart('GİDEN · malzeme tüketimi (sipariş başına düşen)', gd.malzeme.length ? h('table', { sinif: 'tb-t' }, h('tr', {}, ['Kalem', 'Miktar', 'Birim maliyet', 'Tutar'].map((t, i) => h('th', { sinif: i ? 's' : '', metin: t }))), gd.malzeme.map(x => h('tr', {}, h('td', { metin: x.ad }), h('td', { sinif: 's', metin: f(x.adet) + ' ' + x.birim }), h('td', { sinif: 's', metin: f(x.birim_maliyet) + ' ₺' }), h('td', { sinif: 's', metin: tl(x.tutar) })))) : h('p', { sinif: 'ak-soluk', metin: 'Tüketim kaydı yok.' })),
        h('div', { sinif: 'tb-ark' }), kart('GİDEN · zayi (süresi dolan + sayım farkı)', gd.zayi.length ? gd.zayi.map(z => h('div', { metin: z.ad + ': ' + f(z.adet) + ' ' + z.birim + ' · ' + z.neden + ' · ' + tl(z.tutar) })) : h('p', { sinif: 'ak-soluk', metin: 'Zayi kaydı yok.' })),
        h('div', { sinif: 'tb-ark' }), kart('Maliyet / komisyon varsayımları', h('div', { sinif: 'tb-mini', metin: 'Platform %' + f(K.platform * 100) + ' · online kart %' + f(K.sanal_pos_oran * 100) + ' + ' + K.sanal_pos_sabit_kurus + ' kr · dükkân POS %' + f(K.kart_pos_oran * 100) + ' · nakit 0. Kalem maliyetini değiştirmek için:' }),
          h('div', { sinif: 'tb-yatay' }, alan('Kalem', (() => { const s2 = h('select', { sinif: 'ak-giris', onchange: e => { F.mlK = e.target.value; } }, gd.malzeme.map(x => h('option', { value: x.kalem, metin: x.ad }))); F.mlK = F.mlK || (gd.malzeme[0] && gd.malzeme[0].kalem); if (F.mlK) s2.value = F.mlK; return s2; })()), alan('Birim maliyet ₺', fg('mlD', { type: 'number', step: 'any', min: 0 })),
            dug('Kaydet', 'ana kucuk', () => F.mlK && F.mlD !== undefined && F.mlD !== '' && komut('maliyet.ayar', { kalem: F.mlK, deger: +F.mlD }, 'Maliyet kaydedildi')))));
    },
    async satis(kap) {
      const a = F.sAralik || 'hafta', gr = F.sGrup || 'urun', r = await ciroAl(a, gr);
      const sec = (ad, op, v) => { const s = h('select', { sinif: 'ak-giris', onchange: e => { F[ad] = e.target.value; ciz(); } }, op.map(([k, t]) => h('option', { value: k, metin: t }))); s.value = v; return s; };
      kap.append(h('div', { sinif: 'tb-yatay' }, alan('Aralık', sec('sAralik', [['gun', 'Bugün'], ['hafta', 'Son 7 gün'], ['ay', 'Son 30 gün']], a)), alan('Kırılım', sec('sGrup', [['urun', 'Ürün'], ['kanal', 'Kanal']], gr)),
        dug('CSV indir', 'kucuk', () => TB.csvIndir('/api/rapor/ciro?aralik=' + a + '&grup=' + gr, 'ciro_' + a + '_' + gr + '.csv').then(() => bildir('CSV indirildi')).catch(hata))), h('div', { sinif: 'tb-ark' }),
        h('div', { sinif: 'tb-kpi' }, kpi(TB.tl0(r.ciro_kurus), 'ciro (KDV dahil)'), kpi(r.siparis_adet, 'sipariş'), kpi(r.siparis_adet ? TB.tl0(r.ciro_kurus / r.siparis_adet) : '—', 'ortalama sepet')),
        h('div', { sinif: 'tb-iki' }, kart('Günlük ciro (₺)', TB.cubuk(r.seri, x => x.gun.slice(5), x => x.ciro_kurus)), kart(gr === 'urun' ? 'Ürün' : 'Kanal', TB.yatayCubuk(r.satirlar, x => (kanalAd[x.ad] || x.ad), x => x.ciro_kurus, x => TB.tl0(x.ciro_kurus) + ' · ' + x.adet))));
      kap.append(h('div', { sinif: 'tb-ark' }), kart('Günlük adet', TB.cubuk(r.seri, x => x.gun.slice(5), x => x.adet)));
    },
    async makine(kap) {
      const [d, dr] = await Promise.all([TB.hmiAl('/api/tablet'), TB.hmiAl('/api/durum').catch(() => null)]);
      const sa = (dr && dr.sayac) || {}, top = sa.calisma_sn || 1;
      kap.append(h('div', { sinif: 'tb-kpi' }, kpi(d.mod, 'mod'), kpi(f(d.firin_c) + ' °C', 'fırın'), kpi(f(d.soguk.TOP) + ' / ' + f(d.soguk.B), 'soğuk TOP / B °C'), kpi(d.kuyruk + ' + ' + d.wip, 'kuyruk + hatta'), kpi(sa.bugun_uretim ?? '—', 'bugün üretilen'), kpi(sa.hurda ?? '—', 'hurda'), kpi(sa.hata ?? '—', 'hata sayısı')));
      kap.append(h('div', { sinif: 'tb-iki' }, kart('Verim (çalışma süresi içinde)', TB.yatayCubuk([['Üretimde', sa.uretim_sn || 0], ['Boşta', Math.max(0, top - (sa.uretim_sn || 0) - (sa.durus_sn || 0))], ['Duruş / hata', sa.durus_sn || 0]], x => x[0], x => x[1], x => TB.sure(x[1]) + ' · %' + Math.round(100 * x[1] / top)), h('p', { sinif: 'tb-mini', metin: 'Süreler sim / makine sayacından (calisma_sn, uretim_sn, durus_sn).' })),
        kart('İstasyonlar', h('div', { sinif: 'tb-ist' }, Object.entries(d.istasyonlar).map(([k, v]) => h('div', { sinif: d.dolum[k] ? 'DOLUM' : v }, h('b', { metin: k }), h('small', { metin: d.dolum[k] ? 'dolum: ' + d.dolum[k] : v })))))));
      kap.append(h('div', { sinif: 'tb-ark' }), kart('Canlı makine', h('p', { metin: 'Ayrıntılı canlı ekran (3B + eksenler + sensörler): ' }), h('a', { href: '../hmi/index.html' + location.search, metin: 'HMI sayfası' }), ' · ', h('a', { href: '../scada/index.html' + location.search, metin: 'SCADA sayfası' })));
    },
    async stok(kap) {
      const [d, T] = await Promise.all([TB.hmiAl('/api/tablet'), TB.hmiAl('/api/tablet/tahmin').catch(() => null)]);
      ST.D = d;
      const bek = d.oneriler.filter(o => o.durum === 'BEKLIYOR');
      kap.append(kart('Satın alma onayı · ' + bek.length + ' bekliyor', bek.length ? bek.map(o => h('div', { sinif: 'tb-adim' }, h('div', {}, h('b', { metin: f(o.paket_say) + ' ' + o.paket_ad + ' ' + o.ad }), h('div', { sinif: 'tb-mini', metin: o.ted + ' · ' + o.neden })), h('span', { stil: { marginLeft: 'auto', display: 'flex', gap: '8px' } }, dug('Onayla', 'ana kucuk', () => komut('oneri.onayla', { id: o.id }, v => 'Tedarikçi metni hazır')), dug('Reddet', 'kucuk', () => komut('oneri.red', { id: o.id }))))) : h('p', { sinif: 'ak-soluk', metin: 'Bekleyen öneri yok.' }),
        h('label', { sinif: 'ak-onay' }, h('input', { type: 'checkbox', checked: d.oto_onay, onchange: e => komut('ayar', { oto_onay: e.target.checked, ozet_saat: d.ozet_saat }, 'Kaydedildi') }), h('span', { metin: 'Otomatik sipariş (onaysız): yalnız yönetici açar' })),
        dug('Tahmin önerilerini listeye ekle', '', () => komut('tahmin.oneri', {}, v => (v.yeni || []).length + ' öneri eklendi'))));
      if (T) kap.append(h('div', { sinif: 'tb-ark' }), kart('Talep tahmini · 7 gün', h('p', { sinif: 'tb-mini', metin: 'Model: ' + ({ varsayilan: 'varsayılan profil (veri az)', mevsimsel: 'haftanın günü + güncel düzey', dis_etkenli: 'dış etkenli' }[T.asama] || T.asama) + ' · ' + T.egitim_gun + ' gün öğrenildi' + (T.hata && !T.hata.yok ? ' · MAPE %' + T.hata.mape_yuzde : '') }), TB.cubuk(T.hafta, x => x.gun_ad.slice(0, 3), x => x.orta), h('p', { metin: T.yarin.aciklama })));
      const sat = d.stok.map(x => h('tr', {}, h('td', {}, h('b', { metin: x.ad })), h('td', { sinif: 's', metin: f(x.makine) + ' / ' + f(x.makine_hedef) }), h('td', { sinif: 's', metin: f(x.depo) + ' / ' + f(x.depo_hedef) }), h('td', { sinif: 's', metin: (x.depo_gun ?? '–') + ' gün' }), h('td', {}, x.depo_alti ? rozet('yenile', 'kotu') : x.makine_alti ? rozet('doldur', 'uyari') : rozet('tamam', 'iyi'))));
      kap.append(h('div', { sinif: 'tb-ark' }), kart('3 kat stok', h('table', { sinif: 'tb-t' }, h('tr', {}, ['Kalem', 'Makine', 'Depo', 'Depo kaç gün', ''].map((t, i) => h('th', { sinif: i && i < 4 ? 's' : '', metin: t }))), sat)),
        h('div', { sinif: 'tb-ark' }), kart('Zayi (son 24 sa)', (d.zayi || []).length ? d.zayi.map(z => h('div', { metin: z.kalem + ': ' + f(z.adet) + ' · ' + z.neden })) : h('p', { sinif: 'ak-soluk', metin: 'Kayıt yok.' })));
    },
    async haccp(kap) {
      const R = await TB.hmiAl('/api/tablet/rapor'), s = R.sicaklik, d = await TB.hmiAl('/api/tablet');
      kap.append(h('div', { sinif: 'tb-kpi' }, kpi(f(s.firin_min || 0) + '–' + f(s.firin_maks || 0), 'fırın °C (bugün)'), kpi('≤ ' + f(s.top_maks || 0), 'TOPPING soğuk °C'), kpi('≤ ' + f(s.b_maks || 0), 'B soğuk °C'), kpi(s.kayit || 0, 'sıcaklık kaydı')),
        h('div', { sinif: 'ak-ipucu ' + (s.haccp_ihlali ? 'kotu' : 'iyi'), metin: s.haccp_ihlali ? 'HACCP SINIRI AŞILDI: soğuk hazne > ' + s.sinir_c + ' °C kaydı var — etli ürün kararı gerekli.' : 'Soğuk zincir sınırı (≤ ' + s.sinir_c + ' °C) içinde.' }), h('div', { sinif: 'tb-ark' }),
        h('div', { sinif: 'tb-iki' }, ['acilis', 'kapanis', 'temizlik'].map(ad => { const L = d[ad] || []; return kart({ acilis: 'Açılış listesi', kapanis: 'Kapanış listesi', temizlik: 'Temizlik (HACCP)' }[ad] + ' · ' + L.filter(x => x.yapildi).length + '/' + L.length, L.map(x => h('div', { sinif: 'tb-mini' }, (x.yapildi ? '✓ ' : '○ ') + x.madde + (x.kim ? ' — ' + x.kim : '')))); })),
        h('div', { sinif: 'tb-ark' }), kart('Sayım farkları', (R.sayim_farklari || []).length ? R.sayim_farklari.map(x => h('div', { sinif: 'ak-ipucu uyari', metin: x.kalem + ': sistem ' + f(x.beklenen) + ' · ' + x.kaynak + ' ' + f(x.sayilan) })) : h('p', { sinif: 'ak-soluk', metin: 'Fark yok.' })));
    },
    async alarm(kap) {
      const A = await TB.hmiAl('/api/tablet/alarm');
      kap.append(kart('Aktif', A.aktif.length ? A.aktif.map(a => h('div', { sinif: 'ak-ipucu ' + (a.seviye === 'HATA' ? 'kotu' : 'uyari') }, h('b', { metin: a.ad }), ' · ' + (a.metin || ''))) : h('div', { sinif: 'ak-ipucu iyi', metin: 'Aktif alarm yok' })), h('div', { sinif: 'tb-ark' }),
        kart('Geçmiş', h('table', { sinif: 'tb-t' }, A.gecmis.slice(0, 60).map(a => h('tr', {}, h('td', { sinif: 'tb-mini', metin: (a.zaman || '').slice(5, 19).replace('T', ' ') }), h('td', {}, h('b', { metin: a.ad })), h('td', {}, rozet(a.seviye, a.seviye === 'HATA' ? 'kotu' : a.seviye === 'UYARI' ? 'uyari' : '')), h('td', { sinif: 'tb-mini', metin: a.istasyon || '' }), h('td', { metin: a.aktif ? 'başladı' : 'bitti' }))))));
    },
    async personel(kap) {
      const [v, k] = await Promise.all([TB.sipAl('/api/vardiyalar'), TB.sipAl('/api/kullanici')]);
      kap.append(kart('Vardiyalar ve kasa farkı', h('table', { sinif: 'tb-t' }, h('tr', {}, ['Kişi', 'Açılış', 'Kapanış', 'Açılış kasası', 'Beklenen', 'Sayılan', 'Fark'].map((t, i) => h('th', { sinif: i > 2 ? 's' : '', metin: t }))), v.vardiyalar.map(x => h('tr', {}, h('td', { metin: x.kisi }), h('td', { metin: TB.tarihSaat(x.acilis_zaman) }), h('td', { metin: x.kapanis_zaman ? TB.tarihSaat(x.kapanis_zaman) : 'açık' }), h('td', { sinif: 's', metin: TB.tl(x.acilis_kasa_kurus) }), h('td', { sinif: 's', metin: x.beklenen_kurus == null ? '—' : TB.tl(x.beklenen_kurus) }), h('td', { sinif: 's', metin: x.sayilan_kurus == null ? '—' : TB.tl(x.sayilan_kurus) }), h('td', { sinif: 's' }, x.fark_kurus == null ? '—' : rozet(TB.tl(x.fark_kurus), x.fark_kurus === 0 ? 'iyi' : 'kotu')))))), h('div', { sinif: 'tb-ark' }));
      const ad = fg('kuAd', { placeholder: 'ad' }), pin = fg('kuPin', { placeholder: 'PIN (4–8 rakam)', type: 'password', inputmode: 'numeric' }), rol = h('select', { sinif: 'ak-giris', onchange: e => { F.kuRol = e.target.value; } }, ['personel', 'servis', 'yonetici'].map(x => h('option', { value: x, metin: x })));
      rol.value = F.kuRol || 'personel';
      kap.append(kart('Kullanıcılar · rol · PIN', h('p', { sinif: 'tb-mini', metin: 'Varsayılan PIN\'ler (personel 0000 · yönetici 1111 · servis 2222) ortam değişkenindedir — İŞLETMEDE DEĞİŞTİRİN. Burada eklenen kullanıcıların PIN\'i şifreli (SHA-256 + tuz) saklanır.' }),
        h('table', { sinif: 'tb-t' }, k.kullanicilar.map(u => h('tr', {}, h('td', {}, h('b', { metin: u.ad })), h('td', {}, rozet(u.rol, u.rol === 'yonetici' ? 'vurgu' : '')), h('td', {}, rozet(u.aktif ? 'aktif' : 'pasif', u.aktif ? 'iyi' : 'kotu')), h('td', { sinif: 's' }, dug(u.aktif ? 'Pasifleştir' : 'Aktifleştir', 'kucuk', () => kullaniciKaydet(u.ad, u.rol, null, !u.aktif)))))),
        h('div', { sinif: 'tb-grid-3', stil: { marginTop: '10px' } }, alan('Ad', ad), alan('Rol', rol), alan('PIN (boş = değiştirme)', pin)), dug('Kullanıcıyı kaydet', 'ana', () => F.kuAd && kullaniciKaydet(F.kuAd, F.kuRol || 'personel', F.kuPin || null, true).then(() => { F.kuAd = ''; F.kuPin = ''; }))));
    },
    async fatura(kap) {
      const r = await TB.sipAl('/api/faturalar'), l = r.faturalar;
      const top = l.filter(x => x.durum === 'GONDERILDI').reduce((a, x) => a + x.tutar_kurus, 0), kdv = l.filter(x => x.durum === 'GONDERILDI').reduce((a, x) => a + x.kdv_kurus, 0);
      kap.append(h('div', { sinif: 'tb-kpi' }, kpi(l.length, 'son fatura'), kpi(TB.tl0(top), 'gönderilen toplam'), kpi(TB.tl0(kdv), 'KDV'), kpi(l.filter(x => x.durum !== 'GONDERILDI').length, 'gönderilemedi / iptal')),
        kart('e-Arşiv faturaları', h('table', { sinif: 'tb-t' }, h('tr', {}, ['Belge no', 'Sipariş', 'Tutar', 'KDV', 'Durum'].map((t, i) => h('th', { sinif: i > 1 && i < 4 ? 's' : '', metin: t }))), l.map(x => h('tr', {}, h('td', { metin: x.belge_no }), h('td', { sinif: 'tb-mini', metin: x.siparis_id }), h('td', { sinif: 's', metin: TB.tl(x.tutar_kurus) }), h('td', { sinif: 's', metin: TB.tl(x.kdv_kurus) }), h('td', {}, rozet(x.durum, x.durum === 'GONDERILDI' ? 'iyi' : 'kotu'))))), h('p', { sinif: 'tb-mini', metin: 'Gönderilemeyen e-Arşiv 7 gün içinde elle kesilmelidir (VUK 231/5). Sağlayıcı: ayarlar.json / ortam değişkeni (TEST ya da Sovos).' })));
    },
    async menu(kap) {
      const r = await TB.sipAl('/api/menu/yonet');
      kap.append(kart('Ürünler · fiyat · alerjen', h('p', { sinif: 'tb-mini', metin: 'Fiyatlar KDV dahildir. * = örnek fiyat (henüz girilmemiş). Alerjen / içerik listesi tedarikçi bildirimiyle doğrulanınca "doğrulandı" işaretlenir; işaretlenene kadar ekranlarda uyarı gösterilir.' }),
        h('table', { sinif: 'tb-t' }, h('tr', {}, ['Ürün', 'Fiyat ₺', 'Aktif', 'Alerjen', 'Doğrulandı'].map(t => h('th', { metin: t }))), r.urunler.map(u => {
          const fy = gir({ type: 'number', step: '0.5', min: 1, value: (u.taban_fiyat_kurus / 100).toFixed(2), stil: { width: '96px' } }), al = gir({ value: u.alerjen.join(', '), stil: { width: '170px' } });
          return h('tr', {}, h('td', {}, h('b', { metin: u.ad }), u.kampanya ? h('div', {}, rozet(u.kampanya, 'vurgu')) : null), h('td', {}, fy, dug('Kaydet', 'kucuk', () => urunKaydet(u.id, { fiyat_tl: +fy.value }))), h('td', {}, h('input', { type: 'checkbox', checked: u.aktif, stil: { width: '26px', height: '26px' }, onchange: e => urunKaydet(u.id, { aktif: e.target.checked }) })),
            h('td', {}, al, dug('Kaydet', 'kucuk', () => urunKaydet(u.id, { alerjen: al.value.split(',').map(x => x.trim()).filter(Boolean) }))), h('td', {}, h('input', { type: 'checkbox', checked: u.alerjen_dogrulandi, stil: { width: '26px', height: '26px' }, onchange: e => urunKaydet(u.id, { alerjen_dogrulandi: e.target.checked }) })));
        }))));
      const ur = h('select', { sinif: 'ak-giris', onchange: e => { F.kaUrun = e.target.value; } }, [h('option', { value: '', metin: 'Tüm ürünler' }), ...r.urunler.map(u => h('option', { value: u.id, metin: u.ad }))]); ur.value = F.kaUrun || '';
      const tur = h('select', { sinif: 'ak-giris', onchange: e => { F.kaTur = e.target.value; } }, [['YUZDE', 'Yüzde (%)'], ['TUTAR', 'Tutar (₺)']].map(([k, t]) => h('option', { value: k, metin: t }))); tur.value = F.kaTur || 'YUZDE';
      kap.append(h('div', { sinif: 'tb-ark' }), kart('Kampanyalar', r.kampanyalar.length ? r.kampanyalar.map(k => h('div', { sinif: 'tb-adim' }, h('div', {}, h('b', { metin: k.ad }), h('div', { sinif: 'tb-mini', metin: (k.tur === 'YUZDE' ? '%' + k.deger : k.deger + ' ₺') + ' · ' + (k.urun_id || 'tüm ürünler') + ' · ' + (k.gecerli ? 'geçerli' : 'kapalı') })), k.gecerli ? dug('Kapat', 'kucuk', () => sipGonder('/api/kampanya/' + k.id + '/kapat', {})) : null)) : h('p', { sinif: 'ak-soluk', metin: 'Kampanya yok.' }),
        h('div', { sinif: 'tb-grid-3' }, alan('Ad', fg('kaAd', { placeholder: 'ör. Öğle %10' })), alan('Ürün', ur), alan('Tür', tur), alan('Değer', fg('kaDeger', { type: 'number', step: 'any' }))), dug('Kampanya ekle', 'ana', () => F.kaAd && F.kaDeger && sipGonder('/api/kampanya', { ad: F.kaAd, tur: F.kaTur || 'YUZDE', deger: +F.kaDeger, urun_id: F.kaUrun || null }).then(() => { F.kaAd = ''; F.kaDeger = ''; }))));
    },
    async sube(kap) {
      let r; try { r = await TB.sipAl('/api/subeler'); } catch (e) { r = { subeler: [{ id: 'd1', ad: 'AUTOKITCH Pide · Dükkân 1', aktif: true }], not: 'Çok şube hazırlığı: bu sunucu tek dükkândır (dukkan_id). Yeni şube = ayrı sunucu + kendi dukkan_id.' }; }
      kap.append(kart('Şubeler (franchise hazırlığı)', r.subeler.map(s => h('div', { sinif: 'tb-adim' }, h('div', {}, h('b', { metin: s.ad }), h('div', { sinif: 'tb-mini', metin: 'dukkan_id: ' + s.id })), rozet(s.aktif ? 'aktif' : 'pasif', 'iyi'))), h('div', { sinif: 'ak-ipucu', metin: r.not }),
        h('p', { sinif: 'tb-mini', metin: 'Her sipariş / olay / makine konusu dukkan_id taşır (MQTT: autokitch/<dukkan_id>/…). Şube karşılaştırma (ciro, verim, stok) ikinci şube kurulunca bu panelde yan yana gösterilir; şimdilik tek şube.' })));
    },
  };
  async function sipGonder(yol, g) { try { await TB.sipGonder(yol, g); bildir('Kaydedildi'); ciz(); } catch (e) { hata(e); } }
  async function urunKaydet(id, alan_) { try { await TB.sipGonder('/api/menu/urun', Object.assign({ id }, alan_)); bildir('Kaydedildi'); ciz(); } catch (e) { hata(e); } }
  async function kullaniciKaydet(ad, rol, pin, aktif) { try { await TB.sipGonder('/api/kullanici', { ad, rol, pin: pin || undefined, aktif }); bildir('Kaydedildi'); ciz(); } catch (e) { hata(e); } }

  function basla() {
    document.documentElement.setAttribute('data-yuzey', 'tablet'); document.body.classList.add('tb'); AK.tema.uygula();
    kabuk(); ust();
    TB.hazir().then(async () => {
      if (AK.Q.get('pin') && /^(localhost|127\.)/.test(location.hostname)) { try { await TB.girisYap(AK.Q.get('pin')); } catch (e) { /* */ } }   // yalnız yerel geliştirme
      await veri(); ciz();
    }).catch(e => { $('#icerik').textContent = 'Başlatılamadı: ' + e.message; });
    window.addEventListener('tb-giris', () => { veri(); ciz(); }); window.addEventListener('tb-cikis', () => ciz());
    setInterval(() => { if (!document.hidden && TB.yetkili('yonetici')) veri(); }, 15000);
    TB.bostaKapat(TB.VARDIYA_SN);
  }
  window.YON = { basla, ciz };
})();
