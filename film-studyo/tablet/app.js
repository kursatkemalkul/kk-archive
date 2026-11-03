/* AUTOKITCH · TEK TABLET UYGULAMASI (7 Eki 2026 · tablet / stok / G/Ç oturumu) — SATIŞ (POS) + MAKİNE modu, aynı uygulama.
   Personel tableti satış noktasındaki mıknatıslı yuvada SATIŞ modunda çalışır; makineye doldurmaya giderken yanında taşınıp makinenin yüzündeki yuvaya
   takılınca MAKİNE moduna geçer (yuva algılanınca kendiliğinden: HMI /api/tablet "yuva" alanı — tablet.yuva komutu / ?yuva= ; algılama yoksa üstteki düğmeyle elle).
   Arka uçlar: HMI 8791 (makine · stok · servis) + sipariş 8790 (POS · kasa) — ak-tb.js. Sunucu yoksa DEMO (ak-tb-demo.js). Bu dosya: kabuk + SATIŞ; MAKİNE sekmeleri makine.js. */
(function () {
  'use strict';
  const { $, h, bos, bildir, modal } = AK;
  const TBA = (window.TBA = window.TBA || {});
  const ST = (TBA.ST = { mod: (AK.Q.get('mod') || '').toUpperCase() === 'MAKINE' ? 'MAKINE' : 'SATIS', sekme: { SATIS: 'siparis', MAKINE: 'durum' }, D: null, menu: [], kat: 'pide', sepet: {}, not: '', tel: '', kvkk: false, odeme: 'NAKIT', verilen: '',
    kuyruk: [], platform: [], vardiya: null, kasa: null, cagrilar: [], sonYuva: null, sip: {}, imza: {} });
  TBA.f = TB.f1;

  const MODLAR = { SATIS: [['siparis', 'SİPARİŞ'], ['kuyruk', 'KUYRUK'], ['platform', 'PLATFORM'], ['kasa', 'KASA']],
    MAKINE: [['durum', AK.Q.get('panel')==='makine'?'ANA SAYFA':'DURUM'], ['topping', 'TOPPING'], ['doldur', 'DOLDUR'], ['tedarik', 'TEDARİK'], ['stok', 'STOK'], ['atik', 'ATIK / BOŞALTMA'], ['bakim', 'BAKIM'], ['servis', 'SERVİS'], ['temizlik', 'TEMİZLİK'], ['alarm', 'ALARMLAR'], ['acilis', 'AÇILIŞ / KAPANIŞ'], ['gun', 'GÜN']] };
  const SEK = (TBA.SEK = { SATIS: {}, MAKINE: {} });     // sekme çizicileri: (kap) => void
  const KATEGORI = [['pide', 'Pide'], ['lahmacun', 'Lahmacun'], ['icecek', 'İçecek'], ['tatli', 'Tatlı']];

  /* ---------------------------------------------------------------- yardımcılar */
  const kart = (baslik, ...c) => h('div', { sinif: 'ak-kart' }, baslik ? h('h2', { sinif: 'tb-b', metin: baslik }) : null, ...c);
  const rozet = (m, s) => h('span', { sinif: 'ak-rozet ' + (s || ''), metin: m });
  const dug = (m, o, f) => h('button', { type: 'button', sinif: 'ak-dugme ' + (o || ''), metin: m, onclick: f });
  const alan = (et, giris) => h('label', { sinif: 'ak-alan' }, h('span', { metin: et }), giris);
  const giris = (o) => h('input', Object.assign({ sinif: 'ak-giris' }, o));
  TBA.kart = kart; TBA.rozet = rozet; TBA.dug = dug; TBA.alan = alan; TBA.giris = giris;
  TBA.hata = e => { TBA.sonHata = e && e.message ? e.message : String(e); bildir(TBA.sonHata, 4500); };
  /** işlem sarmalayıcı: yetki iste, çalıştır, hata göster, yenile */
  TBA.islem = async function (en_az, fn, baslik) {
    try { if (!(await TB.yetkiGerek(en_az, baslik))) return null; return await fn(); }
    catch (e) { TBA.hata(e); return null; } finally { TBA.yenile(); }
  };
  const bosKap = kap => { bos(kap); return kap; };
  TBA.bosKap = bosKap;

  /* ---------------------------------------------------------------- kabuk */
  function kabuk() {
    const root = $('#kok'); bos(root);
    const ust = h('div', { sinif: 'tb-ust', id: 'ust' });
    const sek = h('nav', { sinif: 'tb-sekmeler', id: 'sekmeler', 'aria-label':'İşlemler' });
    const ic = h('div', { sinif: 'tb-icerik', id: 'icerik' });
    root.append(h('div', { sinif: 'tb-ekran' }, ust, sek, ic));
  }
  function ustCiz() {
    const D = ST.D, u = bos($('#ust'));
    if(AK.Q.get('panel')==='makine'){const online=!!D&&!ST.baglantiHata&&TB.mod.hmi==='gercek'&&Date.now()-(ST.hmiReceivedAt||0)<10000,count=online?(D?.alarm||[]).length:0;const mode=({KAPALI:'Kapalı',BOSTA:'Hazır',SIPARIS:'Üretim',ISINMA:'Isınma',SERVIS:'Servis',TEMIZLIK:'Temizlik',HATA:'Arıza'})[D?.mod]||'Durum bekleniyor';u.append(h('div',{sinif:'hmi-system-state',role:'status','aria-live':'polite'},h('span',{sinif:'hmi-state-chip '+(online?'connected':'disconnected'),metin:online?'● HMI bağlı':TB.mod.hmi==='demo'?'DEMO':'● Güncel veri yok'}),h('span',{sinif:'hmi-state-chip '+(count?'fault':online?'ready':'disconnected'),metin:TB.mod.hmi==='demo'?'Örnek durum':online?mode:'Veri güncel değil'}),dug(TB.mod.hmi==='demo'?'DEMO · '+(D?.alarm||[]).length+' alarm':!online?'Alarm durumu bilinmiyor':count?'⚠ '+count+' alarm':'Alarm yok',count?'hmi-alarm-chip fault':'hmi-alarm-chip',()=>{ST.mod='MAKINE';ST.sekme.MAKINE='alarm';document.documentElement.dataset.hmiMenu='closed';ciz();})));u.append(h('span',{sinif:'ak-marka',metin:'AUTOKITCH'}),h('div',{sinif:'hmi-header-actions'},dug('Ana sayfa','',()=>{ST.mod='MAKINE';ST.sekme.MAKINE='durum';document.documentElement.dataset.hmiMenu='closed';ciz();}),dug('Menü ☰','',()=>{const root=document.documentElement;root.dataset.hmiMenu=root.dataset.hmiMenu==='open'?'closed':'open';})));return;}
    const mod = (a, ad) => h('button', { type: 'button', sinif: ST.mod === a ? 'on' : '', metin: ad, onclick: () => { ST.mod = a; AK.sakla.yaz('tb.mod', a); ciz(); } });
    u.append(h('span', { sinif: 'ak-marka', html: 'AUTO<i>KITCH</i>' }), h('div', { sinif: 'tb-mod', role: 'tablist' }, mod('SATIS', 'Kasa'), mod('MAKINE', 'Personel')));
    const yer = h('span', { sinif: 'tb-yer' });
    if (D) {
      yer.append(rozet(ST.mod === 'SATIS' ? 'yuva: ' + (D.yuva === 'SATIS' ? 'satış noktası' : 'makine') : 'yuva: ' + (D.yuva === 'MAKINE' ? 'makine' : 'satış noktası'), D.yuva === ST.mod ? 'iyi' : ''),
        rozet(D.mod, D.mod === 'HATA' || D.mod === 'KAPALI' ? 'kotu' : D.mod === 'SERVIS' || D.mod === 'TEMIZLIK' ? 'uyari' : 'iyi'));
      yer.append(h('span', { html: 'fırın <b>' + TB.f1(D.firin_c) + ' °C</b>' }), h('span', { html: 'soğuk <b>' + (D.soguk?.TOP == null ? '—' : TB.f1(D.soguk.TOP)) + ' / ' + (D.soguk?.B == null ? '—' : TB.f1(D.soguk.B)) + '</b> °C' }));
    }
    const mod_ = TB.mod.hmi === 'demo' || TB.mod.sip === 'demo';
    yer.append(rozet(mod_ ? 'DEMO verisi' : 'bağlı · gerçek', mod_ ? 'uyari' : 'iyi'), h('span', { metin: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }) }),
      dug(TB.pin ? TB.ad + ' · Çıkış' : 'Giriş', 'kucuk', async () => { if (TB.pin) { TB.cikis(); } else await TB.pinSor('personel', 'Giriş'); ciz(); }),
      dug('Tema', 'kucuk hayalet', () => AK.tema.degistir()));
    u.append(yer);
  }
  function sekmeCiz() {
    const s = $('#sekmeler'), D = ST.D || {};
    const rozetSay = { alarm: (D.alarm || []).length, doldur: Object.values(D.gorevler || {}).reduce((a, x) => a + x.length, 0), kuyruk: ST.kuyruk.length, platform: ST.platform.filter(x => x.teslim_bekliyor).length, servis: D.servis_cagri_acik || 0, stok: (D.oneriler || []).filter(o => o.durum === 'BEKLIYOR').length, kasa: ST.cagrilar.length };
    // Keep the actual scroller and buttons alive across telemetry updates.
    let bar=s.querySelector('[role="tablist"]');
    if(!bar||bar.dataset.mod!==ST.mod){
      const x=bar?.scrollLeft||0;bos(s);
      bar=h('div',{sinif:'ak-sekme',role:'tablist'});bar.dataset.mod=ST.mod;
      MODLAR[ST.mod].forEach(([k,ad])=>bar.append(h('button',{type:'button',role:'tab','data-sekme':k,onclick:()=>{ST.sekme[ST.mod]=k;if(AK.Q.get('panel')==='makine')document.documentElement.dataset.hmiMenu='closed';ciz();}},ad,h('i',{}))));
      s.append(bar);bar.scrollLeft=x;
    }
    for(const button of bar.querySelectorAll('[data-sekme]')){
      const k=button.dataset.sekme,on=ST.sekme[ST.mod]===k;
      button.classList.toggle('on',on);button.setAttribute('aria-selected',String(on));
      const badge=button.querySelector('i'),n=rozetSay[k]||0;badge.hidden=!n;badge.textContent=n?String(n):'';
    }
  }
  /* T2: parmak basılıyken (pointerdown→pointerup) ekran yeniden çizilmez; çizim parmak kalkınca yapılır. Yoksa 'ürünleri koydum' sonrası gelen veri değişimi, düğme üstündeki ilk basışı yutuyordu (düğme DOM'dan değişirken click kaybolur). */
  const PTR = { basili: false, bekleyen: null };
  addEventListener('pointerdown', () => { PTR.basili = true; }, true);
  ['pointerup', 'pointercancel'].forEach(o => addEventListener(o, () => { PTR.basili = false; if (PTR.bekleyen !== null) { const z = PTR.bekleyen; PTR.bekleyen = null; setTimeout(() => icerikCiz(z), 60); } }, true));       // click, pointerup'tan SONRA gelir: 60 ms gecikme
  TBA._ptr = PTR;
  let cizimNo=0,bekleyenGorunum=null;
  function icerikCiz(zorla) {
    const kap = $('#icerik'), ae = document.activeElement;
    if (PTR.basili) { PTR.bekleyen = PTR.bekleyen === true || zorla === true; return; }
    if (!zorla && ae && kap.contains(ae) && /INPUT|SELECT|TEXTAREA/.test(ae.tagName)) return;
    document.documentElement.dataset.opsMode=ST.mod;
    const key=ST.mod+':'+ST.sekme[ST.mod],existing=kap.firstElementChild;
    if(existing?.dataset.vue===key&&existing.bakimGuncelle){existing.bakimGuncelle().catch(TBA.hata);return;}
    const no=++cizimNo,f=SEK[ST.mod][ST.sekme[ST.mod]];
    bekleyenGorunum?.remove();
    // Async views need a connected node, but the current view remains visible
    // until the replacement is complete. A hidden fixed node adds no scroll height.
    const kutu=h('div',{});kutu.dataset.vue=key;kutu.style.cssText='position:fixed;left:-100000px;top:0;visibility:hidden;pointer-events:none;width:'+kap.clientWidth+'px';
    kap.append(kutu);bekleyenGorunum=kutu;
    const title=MODLAR[ST.mod].find(x=>x[0]===ST.sekme[ST.mod])?.[1]||'';
    kutu.append(h('header',{sinif:'ops-heading'},h('div',{},h('p',{sinif:'ops-eyebrow',metin:ST.mod==='SATIS'?'KASA / SATIŞ NOKTASI':'PERSONEL / MAKİNE'}),h('h1',{metin:title==='DURUM'?'Operasyon özeti':title==='SİPARİŞ'?'Yeni sipariş':title})),h('span',{sinif:'ops-context',metin:'AUTOKITCH · Operasyon'})));
    const finish=()=>{
      if(no!==cizimNo||!kutu.isConnected){kutu.remove();return;}
      if(PTR.basili){setTimeout(finish,60);return;}
      const y=kap.scrollTop,x=kap.scrollLeft;
      kutu.style.cssText='';kap.replaceChildren(kutu);bekleyenGorunum=null;
      kap.scrollTop=y;kap.scrollLeft=x;
    };
    const hata=e=>{console.error(e);kutu.append(h('div',{sinif:'tb-tehlike-serit',metin:'Ekran hatası: '+(e&&e.message||e)}));};
    try{
      const r=f?f(kutu):kutu.append(kart('',h('p',{metin:'Bu sekme hazır değil.'})));
      if(r&&r.then)r.then(finish,e=>{hata(e);finish();});else finish();
    }catch(e){hata(e);finish();}
  }
  function ciz(zorla) { if (!$('#ust')) return; ustCiz(); sekmeCiz(); icerikCiz(zorla !== false); }
  TBA.ciz = ciz;
  /** veri değişince yenile: imza karşılaştırması (aynı veri → ekran dokunulmaz) */
  TBA.yenile = async function () { await cek(true); };

  /* ---------------------------------------------------------------- veri döngüsü */
  async function cek(zorla) {
    let degisti = !!ST.baglantiHata;
    ST.baglantiHata = false;
    try {
      const D = await TB.hmiAl('/api/tablet'); ST.baglantiHata = false; ST.hmiReceivedAt = Date.now(); ST.hmiServerTime = D.saat; const im = JSON.stringify(D, (k, v) => (k === 'saat' ? undefined : v));
      if (im !== ST.imza.hmi) { ST.imza.hmi = im; ST.D = D; degisti = true; }
      if (!AK.Q.has('panel') && D.yuva && D.yuva !== ST.sonYuva) { if (ST.sonYuva !== null) { ST.mod = D.yuva; AK.bildir('Tablet ' + (D.yuva === 'MAKINE' ? 'makine yuvasına' : 'satış yuvasına') + ' takıldı → ' + (D.yuva === 'MAKINE' ? 'MAKİNE' : 'SATIŞ') + ' modu'); } else if (AK.Q.get('yuva')) ST.mod = AK.Q.get('yuva').toUpperCase() === 'MAKINE' ? 'MAKINE' : 'SATIS'; ST.sonYuva = D.yuva; degisti = true; }
    } catch (e) { ST.baglantiHata = true; degisti = true; }
    if (TB.pin) {
      try {
        const k = (await TB.sipAl('/api/kuyruk')).siparisler, im = JSON.stringify(k.map(s => [s.id, s.durum, s.dolap_gozu, s.tahmini_hazir ? Math.round(s.tahmini_hazir / 5) : 0]));
        if (im !== ST.imza.kuyruk) { ST.imza.kuyruk = im; ST.kuyruk = k; degisti = true; }
        const c = (await TB.sipAl('/api/cagrilar')).cagrilar; if (JSON.stringify(c) !== ST.imza.cagri) { ST.imza.cagri = JSON.stringify(c); ST.cagrilar = c; degisti = true; }
        if (ST.mod === 'SATIS' && ST.sekme.SATIS === 'platform') { const p = (await TB.sipAl('/api/platform-siparisleri')).siparisler, ip = JSON.stringify(p); if (ip !== ST.imza.platform) { ST.imza.platform = ip; ST.platform = p; degisti = true; } }
        const v = (await TB.sipAl('/api/vardiya')).acik, iv = JSON.stringify(v); if (iv !== ST.imza.vardiya) { ST.imza.vardiya = iv; ST.vardiya = v; degisti = true; }
      } catch (e) { /* sipariş sunucusu yok / yetki */ }
    }
    if (!ST.menu.length || zorla === 'menu') { try { ST.menu = (await TB.sipAl('/api/menu')).urunler; degisti = true; } catch (e) { /* */ } }
    if (ST.mod === 'MAKINE' && ST.sekme.MAKINE === 'topping') {      // AYARLI GRAMAJ: TOPPING sekmesi açıkken gram tablosu (seçili gram + min / max + hesaplanan hareket)
      try { const G = await TB.hmiAl('/api/tablet/gramaj'), ig = JSON.stringify(G); if (ig !== ST.imza.gramaj) { ST.imza.gramaj = ig; ST.gramaj = G; degisti = true; } } catch (e) { /* HMI yok */ }
    }
    const dokunuyor = ST.mod === 'MAKINE' && ST.sekme.MAKINE === 'topping' && Date.now() - (ST.gramDokunma || 0) < 5000;   // kaydırıcı sürüklenirken ekran yeniden çizilmez
    if ((degisti && !dokunuyor) || zorla === true) { ust_sek(); icerikCiz(zorla === true); }
  }
  function ust_sek() { ustCiz(); sekmeCiz(); }

  /* ================================================================ SATIŞ · SİPARİŞ (POS) */
  const sepetSay = () => Object.values(ST.sepet).reduce((a, k) => a + k.adet, 0);
  const sepetTop = () => Object.entries(ST.sepet).reduce((a, [id, k]) => a + k.adet * (ST.menu.find(u => u.id === id) || { fiyat_kurus: 0 }).fiyat_kurus, 0);
  function ekle(id, d) {
    const u = ST.menu.find(x => x.id === id); if (!u) return;
    const k = ST.sepet[id] || (ST.sepet[id] = { adet: 0 }); k.adet += d;
    if (k.adet <= 0) delete ST.sepet[id];
    if (sepetSay() > 12) { k.adet -= d; if (k.adet <= 0) delete ST.sepet[id]; AK.bildir('Tek siparişte en fazla 12 kalem'); }
    icerikCiz(true);
  }
  function urunBilgi(u) {
    const al = u.alerjen.length ? u.alerjen.join(', ') : 'yok';
    modal(h('div', { sinif: 'ak-sutun' }, h('h2', { metin: u.ad }), h('p', { metin: u.icerik || '' }), h('p', { html: '<b>Alerjen:</b> ' + AK.kac(al) }),
      u.alerjen_dogrulandi ? null : h('div', { sinif: 'ak-ipucu uyari', metin: 'Alerjen / içerik bilgisi henüz tedarikçi bildirimiyle DOĞRULANMADI — müşteriye kesin bilgi gibi söylemeyin.' }),
      dug('Kapat', 'tam', () => document.querySelector('.ak-modal-perde')?.remove())));
  }
  SEK.SATIS.siparis = function (kap) {
    if (!ST.menu.length) { kap.append(kart('', h('p', { metin: 'Menü yükleniyor…' }))); return; }
    const uyar = [];
    if (TB.pin && !ST.vardiya) uyar.push(h('div', { sinif: 'ak-ipucu uyari', metin: 'Açık vardiya yok — satış için KASA sekmesinden vardiya açın.' }));
    if (ST.D && ['KAPALI', 'TEMIZLIK', 'SERVIS', 'HATA'].includes(ST.D.mod)) uyar.push(h('div', { sinif: 'ak-ipucu kotu', metin: 'Makine ' + ST.D.mod + ' durumunda — sipariş makineye gitmez, kuyrukta bekler.' }));
    const sol = h('div', {}, ...uyar, h('label',{sinif:'ops-search'},h('span',{metin:'Ürün ara'}),giris({type:'search',placeholder:'Ürün adıyla hızlı bul',value:ST.arama||'',oninput:e=>{ST.arama=e.target.value;let shown=0;kap.querySelectorAll('.tb-urun').forEach(b=>{b.hidden=!b.dataset.search.includes(ST.arama.toLocaleLowerCase('tr-TR'));if(!b.hidden)shown++;});const empty=kap.querySelector('.ops-search-empty');if(empty)empty.hidden=shown>0;}})), h('div', { sinif: 'ak-sekme', role: 'tablist' }, KATEGORI.map(([k, ad]) => h('button', { type: 'button', sinif: ST.kat === k ? 'on' : '', metin: ad, onclick: () => { ST.kat = k; icerikCiz(true); } }))),
      h('div', { sinif: 'tb-urunler' }, ST.menu.filter(u => u.kategori === ST.kat).map(u => {
        const n = (ST.sepet[u.id] || {}).adet || 0;
        return h('button', { type: 'button', sinif: 'tb-urun', 'data-search':u.ad.toLocaleLowerCase('tr-TR'), hidden:!!ST.arama&&!u.ad.toLocaleLowerCase('tr-TR').includes(ST.arama.toLocaleLowerCase('tr-TR')), disabled: u.tukendi, onclick: () => ekle(u.id, 1), 'aria-label': u.ad + ' ekle' },
          n ? h('span', { sinif: 'adet', metin: n }) : null, h('b', { metin: u.ad }),
          u.tukendi ? rozet('tükendi', 'kotu') : u.kampanya ? rozet(u.kampanya, 'vurgu') : h('span', { sinif: 'tb-mini', metin: u.alerjen.length ? u.alerjen.join(' · ') : ' ' }),
          h('span', { sinif: 'f', metin: TB.tl0(u.fiyat_kurus) + (u.ornek_fiyat ? ' *' : '') }),
          h('span', { sinif: 'tb-mini', stil: { position: 'absolute', right: '10px', bottom: '8px' }, role: 'button', 'aria-label': 'bilgi', metin: 'ⓘ', onclick: e => { e.stopPropagation(); urunBilgi(u); } }));
      })),h('p',{sinif:'ops-search-empty tb-mini',role:'status',hidden:ST.menu.some(u=>u.kategori===ST.kat&&u.ad.toLocaleLowerCase('tr-TR').includes((ST.arama||'').toLocaleLowerCase('tr-TR'))),metin:'Bu kategoride eşleşen ürün yok. Aramayı temizleyin veya kategori değiştirin.'}), ST.menu.some(u => u.ornek_fiyat) ? h('p', { sinif: 'tb-mini', metin: '* ÖRNEK FİYAT — gerçek fiyatı yönetici panelinden girer.' }) : null);
    const satirlar = Object.entries(ST.sepet).map(([id, k]) => { const u = ST.menu.find(x => x.id === id); return h('div', { sinif: 'tb-sepet-satir' }, h('span', {}, h('b', { metin: u.ad }), h('div', { sinif: 'tb-mini', metin: TB.tl(u.fiyat_kurus) })),
      h('span', { sinif: 'ak-adet' }, h('button', { type: 'button', 'aria-label': 'azalt', metin: '−', onclick: () => ekle(id, -1) }), h('b', { metin: k.adet }), h('button', { type: 'button', 'aria-label': 'artır', metin: '+', onclick: () => ekle(id, 1) })), h('b', { metin: TB.tl(k.adet * u.fiyat_kurus) })); });
    const ana = Object.keys(ST.sepet).some(id => !(ST.menu.find(u => u.id === id) || {}).ek);
    const sendButton = dug('Siparişi gönder · ' + TB.tl(sepetTop()), 'ana', gonder); sendButton.disabled = !sepetSay() || !ana;
    const sag = h('div', { sinif: 'ak-kart tb-sepet' }, h('h2', { sinif: 'tb-b', metin: 'Sepet · ' + sepetSay() + ' kalem' }), satirlar.length ? satirlar : h('p', { sinif: 'ak-soluk', metin: 'Ürüne dokunarak ekleyin.' }),
      h('div', { sinif: 'tb-toplam' }, h('span', { metin: 'Toplam' }), h('span', { metin: TB.tl(sepetTop()) })),
      !ana && satirlar.length ? h('div', { sinif: 'ak-ipucu uyari', metin: 'En az bir pide / lahmacun gerekir (içecek ve tatlı tek başına makineden çıkmaz).' }) : null,
      h('details',{sinif:'ops-order-details',open:!!(ST.contactOpen||ST.not||ST.tel),ontoggle:e=>{ST.contactOpen=e.target.open;}},h('summary',{metin:'Not / telefon ekle'}),alan('Sipariş notu', giris({ value: ST.not, placeholder: 'ör. acısız', maxlength: 120, oninput: e => { ST.not = e.target.value; } })),
      alan('Müşteri telefonu (isteğe bağlı — SMS ile hazır bilgisi)', giris({ value: ST.tel, inputmode: 'tel', placeholder: '5XX XXX XX XX', oninput: e => { ST.tel = e.target.value; } })),
      h('label', { sinif: 'ak-onay' }, h('input', { type: 'checkbox', checked: ST.kvkk, onchange: e => { ST.kvkk = e.target.checked; } }), h('span', { metin: 'Müşteri aydınlatma metnini okudu, telefonunun SMS bilgilendirmesi için işlenmesini onayladı (KVKK).' }))),
      h('div', { sinif: 'tb-odeme' }, [['NAKIT', 'Nakit'], ['KART_POS', 'Kart (POS)']].map(([k, ad]) => h('button', { type: 'button', sinif: ST.odeme === k ? 'on' : '', metin: ad, onclick: () => { ST.odeme = k; icerikCiz(true); } }))),
      nakitKutusu(),
      h('div', { sinif: 'tb-yatay' }, dug('Sepeti boşalt', 'hayalet', () => { ST.sepet = {}; ST.not = ''; ST.tel = ''; ST.kvkk = false; ST.verilen = ''; icerikCiz(true); }),
        sendButton));
    kap.append(h('div', { sinif: 'tb-pos' }, sol, sag));
  }
  /** NAKİT: müşterinin verdiği para + para üstü (canlı). Boş bırakılırsa tam tutar sayılır; verilen < toplam ise gönderilmez. */
  function nakitKutusu() {
    if (ST.odeme !== 'NAKIT') return null;
    const top = sepetTop(), pu = h('div', { sinif: 'ak-ipucu' });
    const guncelle = () => {
      const v = ST.verilen === '' ? null : TB.bagKurus(ST.verilen);
      if (v == null || isNaN(v)) { pu.className = 'ak-ipucu'; pu.textContent = 'Müşterinin verdiği tutarı girin (boş bırakılırsa tam tutar sayılır).'; return; }
      pu.className = 'ak-ipucu ' + (v < top ? 'kotu' : 'iyi'); pu.textContent = v < top ? 'Verilen para yetersiz: ' + TB.tl(top - v) + ' eksik' : 'PARA ÜSTÜ: ' + TB.tl(v - top);
    };
    const g = giris({ type: 'number', min: 0, step: '0.01', inputmode: 'decimal', placeholder: 'verilen para ₺', value: ST.verilen, oninput: e => { ST.verilen = e.target.value; guncelle(); } });
    const yuvarla = [...new Set([1000, 5000, 10000, 20000].map(u => Math.ceil(top / u) * u))].filter(k => k > top).slice(0, 3);      // toplamı 10 / 50 / 100 / 200 ₺'ye tamamlayan tutarlar
    const hizli = [['Tam tutar', top]].concat(yuvarla.map(k => [(k / 100) + ' ₺', k]));
    guncelle();
    return h('div', {}, alan('Müşterinin verdiği (₺)', g), h('div', { sinif: 'tb-yatay' }, hizli.map(([ad, k]) => dug(ad, 'kucuk', () => { ST.verilen = (k / 100).toFixed(2); g.value = ST.verilen; guncelle(); }))), pu);
  }
  let gonderiliyor = false;
  async function gonder() {
    if (gonderiliyor) return;
    if (!sepetSay()) { bildir('Sepet boş'); return; }
    if (ST.tel && !ST.kvkk) { bildir('Telefon için KVKK onayı gerekli'); return; }
    gonderiliyor = true;
    try {
      if (!(await TB.yetkiGerek('personel', 'Satış için PIN'))) return;
      await cek(true);
      if (!ST.vardiya) { bildir('Önce KASA sekmesinden vardiya açın'); ST.sekme.SATIS = 'kasa'; ciz(); return; }
      const kalemler = Object.entries(ST.sepet).map(([urun, k]) => ({ urun, adet: k.adet }));
      const verilen = ST.odeme === 'NAKIT' && ST.verilen !== '' ? TB.bagKurus(ST.verilen) : null;
      if (verilen != null && (isNaN(verilen) || verilen < sepetTop())) { bildir('Verilen para yetersiz'); return; }
      const okcUc = await TB.sipAl('/api/okc').catch(() => null);        // sunucu POS ödeme (/ode: verilen → para üstü) + ÖKC uçlarını biliyor mu
      const iki = ST.odeme === 'NAKIT' && verilen != null && !!okcUc;
      const y = await TB.sipGonder('/api/siparis', { kaynak: ST.tel ? 'TELEFON' : 'PERSONEL', kalemler, odeme_yontemi: iki ? undefined : ST.odeme, telefon: ST.tel || undefined, kvkk_izin: ST.kvkk, not: ST.not || undefined });
      const ode = iki ? await TB.sipGonder('/api/siparis/' + encodeURIComponent(y.id) + '/ode', { yontem: 'NAKIT', verilen_kurus: verilen }) : null;
      const s = ode || y.siparis; let fis = null; try { fis = await TB.sipAl('/api/siparis/' + encodeURIComponent(y.id) + '/fis'); } catch (e) { /* fiş sonra */ }
      const paraUstu = ode ? ode.para_ustu_kurus : (verilen != null ? verilen - s.toplam_kurus : null), okcNo = ode && ode.okc && ode.okc.fis_no;
      if (fis && paraUstu != null) { fis.verilen_kurus = verilen; fis.para_ustu_kurus = paraUstu; }
      if (fis && okcNo) fis.okc_fis_no = okcNo;
      ST.sepet = {}; ST.not = ''; ST.tel = ''; ST.kvkk = false; ST.verilen = '';
      const m = modal(h('div', { sinif: 'ak-sutun' }, h('h2', { metin: 'Sipariş alındı' }), h('div', { sinif: 'ak-orta' }, h('div', { sinif: 'tb-no', metin: '#' + s.kisa_no }), h('p', { metin: TB.tl(s.toplam_kurus) + ' · ' + ({ NAKIT: 'nakit', KART_POS: 'kart' }[s.odeme_yontemi] || s.odeme_yontemi) })),
        paraUstu != null ? h('div', { sinif: 'ak-ipucu iyi', metin: 'Verilen ' + TB.tl(verilen) + ' · PARA ÜSTÜ ' + TB.tl(paraUstu) }) : null,
        okcNo ? h('p', { sinif: 'tb-mini', metin: 'ÖKC fiş no: ' + okcNo }) : null,
        h('div', { sinif: 'ak-ipucu', metin: 'Teslim kodu: ' + s.teslim_kodu + ' — müşteri dolaptan alırken girer / okutur.' }),
        h('div', { sinif: 'tb-yatay' }, fis ? dug('Fişi yazdır', '', () => TB.fisYazdir(fis)) : null, dug('Yeni sipariş', 'ana', () => m.kapat()))), { kapaninca: () => { ciz(); } });
      cek(true);
    } catch (e) { TBA.hata(e); } finally { gonderiliyor = false; }
  }

  /* ================================================================ SATIŞ · KUYRUK */
  function sureKalan(s) { return s.tahmini_hazir ? Math.max(0, s.tahmini_hazir - Date.now() / 1000) : null; }
  SEK.SATIS.kuyruk = function (kap) {
    if (!TB.pin) { kap.append(kart('Açık siparişler', h('p', { metin: 'Görmek için giriş yapın.' }), dug('PIN ile giriş', 'ana', async () => { await TB.pinSor('personel'); ciz(); }))); return; }
    if (!ST.kuyruk.length) { kap.append(kart('Açık siparişler', h('p', { sinif: 'ak-soluk', metin: 'Açık sipariş yok.' }))); return; }
    ST.kuyruk.forEach(s => {
      const k = sureKalan(s);
      kap.append(h('div', { sinif: 'tb-siparis-kart' }, h('div', { sinif: 'tb-no', metin: '#' + s.kisa_no }),
        h('div', {}, h('div', { sinif: 'ak-satir' }, rozet(TB.DURUM_AD[s.durum] || s.durum, TB.durumSinif(s.durum)), rozet(s.kaynak), s.dolap_gozu ? rozet('göz ' + AK_GOZ.etiket(s.dolap_gozu), 'iyi') : null), h('div', { metin: s.kalemler.map(x => x.adet + '× ' + x.ad).join(', ') }),
          h('div', { sinif: 'tb-mini', metin: TB.tl(s.toplam_kurus) + (k != null && !['HAZIR', 'ZAMAN_ASIMI'].includes(s.durum) ? ' · yaklaşık ' + TB.sure(k) + ' sonra hazır' : '') + (s.not_ ? ' · not: ' + s.not_ : '') })),
        h('div', { sinif: 'eylem' }, dug('Fiş', 'kucuk', async () => { try { TB.fisYazdir(await TB.sipAl('/api/siparis/' + encodeURIComponent(s.id) + '/fis')); } catch (e) { TBA.hata(e); } }),
          ['HAZIR', 'ZAMAN_ASIMI'].includes(s.durum) ? dug('Gözden teslim', 'kucuk ana', () => TBA.islem('personel', () => TB.sipGonder('/api/siparis/' + encodeURIComponent(s.id) + '/teslim').then(() => bildir('Teslim edildi')))) : null,
          dug('Öncelik', 'kucuk', () => TBA.islem('personel', () => TB.sipGonder('/api/siparis/' + encodeURIComponent(s.id) + '/oncelik', { oncelik: 1 }).then(() => bildir('Öne alındı')))),
          dug(['URETIMDE', 'KUTU_HAZIR', 'HAZIR', 'ZAMAN_ASIMI'].includes(s.durum) ? 'İade' : 'İptal', 'kucuk tehlike', () => iptal(s)))));
    });
  };
  async function iptal(s) {
    const gec = ['URETIMDE', 'KUTU_HAZIR', 'HAZIR', 'ZAMAN_ASIMI'].includes(s.durum);
    if (!(await TB.yetkiGerek(gec ? 'yonetici' : 'personel', gec ? 'İade için YÖNETİCİ PIN' : 'İptal için PIN'))) return;
    const neden = giris({ placeholder: 'neden (ör. müşteri vazgeçti)', maxlength: 80 });
    const m = modal(h('div', { sinif: 'ak-sutun' }, h('h2', { metin: '#' + s.kisa_no + (gec ? ' iade edilsin mi?' : ' iptal edilsin mi?') }), h('p', { metin: gec ? 'Üretim başladı: ürün hurdaya gider, ödeme iade edilir, stok geri dönmez.' : 'Stok geri döner, ödeme iade edilir.' }), neden,
      h('div', { sinif: 'tb-yatay' }, dug('Vazgeç', '', () => m.kapat()), dug('Evet, ' + (gec ? 'iade et' : 'iptal et'), 'tehlike', async () => { m.kapat(); await TBA.islem(gec ? 'yonetici' : 'personel', () => TB.sipGonder('/api/siparis/' + encodeURIComponent(s.id) + '/iptal', { neden: neden.value || 'personel' }).then(() => bildir('Kaydedildi'))); }))));
  }

  /* ================================================================ SATIŞ · PLATFORM */
  SEK.SATIS.platform = function (kap) {
    if (!TB.pin) { kap.append(kart('Platform siparişleri', h('p', { metin: 'Görmek için giriş yapın.' }), dug('PIN ile giriş', 'ana', async () => { await TB.pinSor('personel'); ciz(); }))); return; }
    kap.append(h('p', { sinif: 'tb-mini', metin: 'Getir · Yemeksepeti · Trendyol Yemek: siparişler platformdan otomatik gelir (anahtarlar tanımlıysa), yoksa buradan elle girilir. Kurye kodu = teslim kodunun son 4 hanesi.' }));
    if (!ST.platform.length) { kap.append(kart('', h('p', { sinif: 'ak-soluk', metin: 'Son 5 saatte platform siparişi yok.' }))); return; }
    ST.platform.forEach(s => kap.append(h('div', { sinif: 'tb-siparis-kart' }, h('div', { sinif: 'tb-no', metin: '#' + s.kisa_no }),
      h('div', {}, h('div', { sinif: 'ak-satir' }, rozet(s.kaynak, 'vurgu'), rozet(TB.DURUM_AD[s.durum] || s.durum, TB.durumSinif(s.durum)), s.dolap_gozu ? rozet('göz ' + AK_GOZ.etiket(s.dolap_gozu), 'iyi') : null), h('div', { metin: s.kalemler.map(x => x.adet + '× ' + x.ad).join(', ') }), h('div', { sinif: 'tb-mini', metin: 'platform no ' + s.platform_no + ' · kurye kodu ****' + s.kurye_kodu_son4 + ' · ' + TB.tl(s.toplam_kurus) })),
      h('div', { sinif: 'eylem' }, s.teslim_bekliyor ? dug('Kurye teslimi', 'ana', () => TBA.islem('personel', () => TB.sipGonder('/api/siparis/' + encodeURIComponent(s.id) + '/kurye-teslim').then(() => bildir('Kuryeye teslim edildi')))) : null))));
  };

  /* ================================================================ SATIŞ · KASA */
  SEK.SATIS.kasa = function (kap) {
    if (!TB.pin) { kap.append(kart('Kasa', h('p', { metin: 'Vardiya ve kasa için giriş yapın.' }), dug('PIN ile giriş', 'ana', async () => { await TB.pinSor('personel'); ciz(); }))); return; }
    const v = ST.vardiya;
    const kasa = kart('Vardiya');
    if (!v) {
      const acilis = giris({ type: 'number', min: 0, step: '0.01', placeholder: 'açılış kasası ₺ (ör. 500)', inputmode: 'decimal' });
      kasa.append(h('p', { metin: 'Açık vardiya yok. Kasadaki bozuk para / nakit tutarını girip vardiyayı açın.' }), alan('Açılış kasası (₺)', acilis),
        dug('Vardiyayı aç', 'ana tam', () => TBA.islem('personel', async () => { await TB.sipGonder('/api/vardiya/ac', { kasa_kurus: TB.bagKurus(acilis.value || 0) }); bildir('Vardiya açıldı'); })));
    } else {
      const say = giris({ type: 'number', min: 0, step: '0.01', placeholder: 'kasadaki nakit ₺', inputmode: 'decimal' });
      kasa.append(h('p', { html: '<b>' + AK.kac(v.kisi) + '</b> · ' + TB.tarihSaat(v.acilis_zaman) + ' · açılış kasası ' + TB.tl(v.acilis_kasa_kurus) }),
        alan('Kapanışta sayılan nakit (₺)', say), dug('Vardiyayı kapat', 'tehlike tam', () => TBA.islem('personel', async () => {
          const r = await TB.sipGonder('/api/vardiya/kapat', { sayilan_kurus: TB.bagKurus(say.value || 0) });
          modal(h('div', { sinif: 'ak-sutun' }, h('h2', { metin: 'Vardiya kapandı' }), h('p', { metin: 'Beklenen nakit: ' + TB.tl(r.beklenen_nakit_kurus) + ' · Sayılan: ' + TB.tl(r.sayilan_kurus) }),
            h('div', { sinif: 'ak-ipucu ' + (r.fark_kurus === 0 ? 'iyi' : 'kotu'), metin: r.fark_kurus === 0 ? 'Kasa tutuyor ✓' : 'KASA FARKI: ' + TB.tl(r.fark_kurus) + ' — yöneticiye bildirildi.' }), dug('Tamam', 'ana tam', () => document.querySelector('.ak-modal-perde')?.remove())));
        })));
    }
    const rap = h('div', {}); kasa.append(h('div', { sinif: 'tb-ark' }));
    kap.append(h('div', { sinif: 'tb-iki' }, kasa, rap));
    const okcKap = h('div', {}); kap.append(okcKap); okcKartCiz(okcKap);
    TB.sipAl('/api/kasa/rapor').then(r => {
      const sat = Object.entries(r.yontemler).map(([y, o]) => h('tr', {}, h('td', { metin: ({ NAKIT: 'Nakit', KART_POS: 'Kart (POS)', SANAL_POS: 'Online kart', PLATFORM: 'Platform' })[y] || y }), h('td', { sinif: 's', metin: o.tahsilat_adet }), h('td', { sinif: 's', metin: TB.tl(o.tahsilat_kurus) }), h('td', { sinif: 's', metin: TB.tl(o.iade_kurus) })));
      bos(rap).append(kart('Bugünkü kasa raporu', h('table', { sinif: 'tb-t' }, h('tr', {}, h('th', { metin: 'Yöntem' }), h('th', { sinif: 's', metin: 'Adet' }), h('th', { sinif: 's', metin: 'Tahsilat' }), h('th', { sinif: 's', metin: 'İade' })), sat),
        h('div', { sinif: 'tb-kpi', stil: { marginTop: '10px' } }, h('div', {}, h('b', { metin: r.siparis_adet }), h('small', { metin: 'sipariş' })), h('div', {}, h('b', { metin: TB.tl0(r.ciro_kurus) }), h('small', { metin: 'ciro (KDV dahil)' })), h('div', {}, h('b', { metin: TB.tl0(r.kdv_kurus) }), h('small', { metin: 'KDV' }))),
        h('p', { sinif: 'tb-mini', metin: Object.entries(r.iptal_iade).map(([k, o]) => k + ' ' + o.adet + ' (' + TB.tl(o.tutar_kurus) + ')').join(' · ') || 'iptal / iade yok' }), h('p', { sinif: 'tb-mini', metin: r.uyari })));
    }).catch(() => { });
    if (ST.cagrilar.length) rap.before(kart('Personel çağrıları', ST.cagrilar.map(c => h('div', { sinif: 'tb-adim' }, h('div', {}, h('b', { metin: c.yer }), h('div', { metin: c.neden }), h('div', { sinif: 'tb-mini', metin: TB.saat(c.zaman) })), dug('Gidildi', 'kucuk ana', () => TBA.islem('personel', () => TB.sipGonder('/api/cagri/' + c.id + '/kapat')))))));
  };

  /** ÖKC (yazar kasa): durum + GÜN SONU Z RAPORU (POST /api/okc/z; sunucuda ÖKC uçları yoksa açıklama). */
  async function okcKartCiz(kap) {
    let o = null; try { o = await TB.sipAl('/api/okc'); } catch (e) { /* sunucu ÖKC ucunu bilmiyor */ }
    if (!o) { kap.append(kart('ÖKC (yazar kasa)', h('p', { sinif: 'tb-mini', metin: 'Bu sunucuda ÖKC uçları yok (yasal sürümde açılır).' }))); return; }
    kap.append(kart('ÖKC (yazar kasa)', h('div', { sinif: 'ak-satir' }, rozet(o.bagli ? 'bağlı' : 'bağlı değil', o.bagli ? 'iyi' : 'kotu'), rozet('mod ' + o.mod), rozet('kuyruk ' + o.kuyruk)),
      h('p', { sinif: 'tb-mini', metin: o.son_z ? 'Son Z raporu: ' + Object.entries(o.son_z).map(([k, v]) => k + ' ' + (typeof v === 'object' ? JSON.stringify(v) : v)).join(' · ') : 'Z raporu henüz alınmadı.' }),
      dug('ÖKC Z raporu (gün sonu)', 'tehlike tam', () => {
        const m = modal(h('div', { sinif: 'ak-sutun' }, h('h2', { metin: 'Gün sonu Z raporu alınsın mı?' }), h('p', { metin: 'Günlük ciro yazar kasada kapatılır; geri alınamaz. Vardiyayı kapattıktan sonra alın.' }),
          h('div', { sinif: 'tb-yatay' }, dug('Vazgeç', '', () => m.kapat()), dug('Z raporu al', 'tehlike', async () => {
            m.kapat();
            await TBA.islem('personel', async () => {
              const r = await TB.sipGonder('/api/okc/z');
              modal(h('div', { sinif: 'ak-sutun' }, h('h2', { metin: 'Z raporu alındı' }), h('div', { sinif: 'ak-ipucu iyi', metin: Object.entries(r).map(([k, v]) => k + ': ' + (typeof v === 'object' ? JSON.stringify(v) : v)).join(' · ') }), dug('Tamam', 'ana tam', () => document.querySelector('.ak-modal-perde')?.remove())));
            });
          }))));
      })));
  }

  /* ---------------------------------------------------------------- başlat */
  function basla() {
    document.documentElement.setAttribute('data-yuzey', 'tablet');
    document.body.classList.add('tb'); if (!AK.Q.get('tamekran')) document.body.classList.add('cerceve');
    kabuk(); AK.tema.uygula();
    const kayit = AK.sakla.al('tb.mod', null); if (kayit && !AK.Q.get('mod')) ST.mod = kayit;
    { const sk = (AK.Q.get('sekme') || '').toLowerCase(); if (sk && ST.mod === 'MAKINE' && MODLAR.MAKINE.some(m => m[0] === sk)) ST.sekme.MAKINE = sk; }   // IKIZ-ARAYUZ-7: ikiz tableti ?mod=MAKINE&sekme=doldur&tamekran=1 ile doğrudan DOLDUR ekranında açılır
    TB.hazir().then(async () => {
      if (AK.Q.get('pin') && /^(localhost|127\.)/.test(location.hostname)) { try { await TB.girisYap(AK.Q.get('pin')); } catch (e) { /* */ } }   // yalnız yerel geliştirme: ?pin=
      await cek('menu'); ciz();
    }).catch(e => { $('#icerik').textContent = 'Başlatılamadı: ' + e.message; });
    window.addEventListener('tb-giris', () => { cek('menu'); ciz(); });
    window.addEventListener('tb-cikis', () => { ST.kuyruk = []; ST.vardiya = null; ST.imza = {}; ciz(); });
    setInterval(() => { if (!document.hidden) cek(false); }, 2000);
    TB.bostaKapat(TB.VARDIYA_SN);
  }
  TBA.basla = basla;
})();
