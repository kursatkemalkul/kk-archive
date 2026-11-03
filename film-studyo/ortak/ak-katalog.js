/* AUTOKITCH · MENÜ KATALOĞU (müşteri ekranları) — ürün açıklaması, içerik / alerjen, görsel.
   Sunucu menü ucu (/api/menu) yalnız id · ad · fiyat · kalan döndürüyor; açıklama / alerjen / görsel için İSTEK kaydı panoda (menü yanıtına alanlar eklenince
   bu dosya yedek olur: sunucudaki alan varsa o kullanılır).
   !! ALERJEN / İÇERİK = VARSAYIM (kaynak: "tahmin"). Hamur / harç / püre reçeteleri onaylanana kadar ekranda "bilgi örnektir" uyarısı gösterilir;
      reçete kesinleşince burası (ya da sunucu alanı) onaylı veriyle değiştirilir. TGK etiketleme: 14 alerjen listesi. */
(function () {
  'use strict';
  const K = {   // YEDEK: sunucu menüsü (/api/menu) bu alanları verir (ayarlar.json); eski sunucuda ya da alan eksikse buradan okunur
    kasarli:   { grup: 'ana', ad_en: 'Cheese pide', aciklama: 'Kaşar peynirli pide.', aciklama_en: 'Pide with kaşar cheese.', icerik: ['Hamur', 'Kaşar peyniri'], icerik_en: ['Dough', 'Kaşar cheese'], alerjen: ['gluten', 'sut'] },
    kiymali:   { grup: 'ana', ad_en: 'Minced-meat pide', aciklama: 'Kıyma harcıyla pide.', aciklama_en: 'Pide with minced-meat topping.', icerik: ['Hamur', 'Kıyma harcı'], icerik_en: ['Dough', 'Minced-meat mix'], alerjen: ['gluten'] },
    kusbasili: { grup: 'ana', ad_en: 'Diced-meat pide', aciklama: 'Kuşbaşı etli pide.', aciklama_en: 'Pide with diced meat.', icerik: ['Hamur', 'Kuşbaşı et'], icerik_en: ['Dough', 'Diced meat'], alerjen: ['gluten'] },
    sucuklu:   { grup: 'ana', ad_en: 'Sausage & cheese pide', aciklama: 'Sucuk ve kaşar peynirli pide.', aciklama_en: 'Pide with sucuk sausage and kaşar cheese.', icerik: ['Hamur', 'Kaşar peyniri', 'Sucuk'], icerik_en: ['Dough', 'Kaşar cheese', 'Sucuk'], alerjen: ['gluten', 'sut'] },
    patatesli: { grup: 'ana', ad_en: 'Mashed-potato pide', aciklama: 'Patates püreli pide.', aciklama_en: 'Pide with mashed potato.', icerik: ['Hamur', 'Patates püresi'], icerik_en: ['Dough', 'Mashed potato'], alerjen: ['gluten', 'sut'] },
    tavuklu:   { grup: 'ana', ad_en: 'Chicken pide', aciklama: 'Tavuk etli pide.', aciklama_en: 'Pide with chicken.', icerik: ['Hamur', 'Tavuk eti'], icerik_en: ['Dough', 'Chicken'], alerjen: ['gluten'] },
    lahmacun:  { grup: 'ana', ad_en: 'Lahmacun (2 pcs)', aciklama: 'İnce açılmış hamur, lahmacun harcı. İki adet.', aciklama_en: 'Thin dough with lahmacun topping. Two pieces.', icerik: ['Hamur', 'Lahmacun harcı'], icerik_en: ['Dough', 'Lahmacun mix'], alerjen: ['gluten'] },
    kola:      { grup: 'ek', ad_en: 'Cola', aciklama: '330 ml kutu.', aciklama_en: '330 ml can.', icerik: [], icerik_en: [], alerjen: [] },
    tatli:     { grup: 'ek', ad_en: 'Dessert', aciklama: 'Günün tatlısı.', aciklama_en: 'Dessert of the day.', icerik: null, icerik_en: null, alerjen: null },
  };
  window.AK_KATALOG = K;
  window.AK_ALERJEN = {   // TGK Gıda Bilgisi Yönetmeliği Ek-II · AB 1169/2011 Ek-II: 14 alerjen (kod sırası sunucu model.ALERJEN_SIRA ile aynı)
    gluten: { tr: 'Gluten içeren tahıllar (buğday)', en: 'Cereals containing gluten (wheat)' }, kabuklu: { tr: 'Kabuklu deniz ürünleri', en: 'Crustaceans' }, yumurta: { tr: 'Yumurta', en: 'Eggs' },
    balik: { tr: 'Balık', en: 'Fish' }, yerfistigi: { tr: 'Yer fıstığı', en: 'Peanuts' }, soya: { tr: 'Soya', en: 'Soybeans' }, sut: { tr: 'Süt (laktoz dahil)', en: 'Milk (incl. lactose)' },
    sertkabuklu: { tr: 'Sert kabuklu yemişler', en: 'Tree nuts' }, kereviz: { tr: 'Kereviz', en: 'Celery' }, hardal: { tr: 'Hardal', en: 'Mustard' }, susam: { tr: 'Susam', en: 'Sesame' },
    sulfit: { tr: 'Kükürt dioksit ve sülfitler', en: 'Sulphur dioxide and sulphites' }, aci_bakla: { tr: 'Acı bakla', en: 'Lupin' }, yumusakca: { tr: 'Yumuşakçalar', en: 'Molluscs' },
  };
  window.AK_ALERJEN_KISA = { gluten: { tr: 'Gluten', en: 'Gluten' }, sut: { tr: 'Süt', en: 'Milk' }, yumurta: { tr: 'Yumurta', en: 'Egg' }, soya: { tr: 'Soya', en: 'Soy' }, hardal: { tr: 'Hardal', en: 'Mustard' }, susam: { tr: 'Susam', en: 'Sesame' }, kereviz: { tr: 'Kereviz', en: 'Celery' } };
  window.AK_KAYNAK_NOT = 'VARSAYIM';

  /* ------------------------------------------------------------ ürün resimleri (SVG, sabit şablon — sunucu verisi girmez) */
  const GOLGE = '<ellipse cx="200" cy="262" rx="150" ry="14" fill="#000" opacity=".13"/>';
  function pideKayik(ic, ust) {
    return '<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true">' + GOLGE +
      '<path d="M26 150C84 52 316 52 374 150C316 248 84 248 26 150Z" fill="#c98a3d" stroke="#a46a29" stroke-width="3"/>' +
      '<path d="M62 150C116 94 284 94 338 150C284 206 116 206 62 150Z" fill="' + ic + '"/>' + ust +
      '<path d="M40 138C96 84 150 72 200 70" fill="none" stroke="#e1a95a" stroke-width="5" stroke-linecap="round" opacity=".7"/></svg>';
  }
  const nokta = (x, y, r, f) => '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="' + f + '"/>';
  const ART = {
    kasarli() {
      let s = ''; const d = [[128, 140], [160, 124], [196, 142], [230, 122], [262, 144], [150, 168], [188, 176], [226, 166], [268, 168], [300, 150], [104, 150]];
      d.forEach(p => { s += '<path d="M' + (p[0] - 16) + ',' + p[1] + ' q8,-14 16,0 t16,0" fill="none" stroke="#e4b73e" stroke-width="6" stroke-linecap="round"/>'; });
      return pideKayik('#f3d36b', s);
    },
    kiymali() {
      let s = ''; for (let i = 0; i < 46; i++) { const a = i * 2.399, r = 8 + (i * 5.1) % 80; s += nokta(200 + Math.cos(a) * r * 1.28, 150 + Math.sin(a) * r * .36, 4.6, i % 5 === 0 ? '#c25a31' : '#7d3b22'); }
      for (let i = 0; i < 7; i++) s += nokta(120 + i * 27, 150 + ((i * 17) % 22) - 11, 3.4, '#4f8a3a');
      return pideKayik('#a4512f', s);
    },
    kusbasili() {
      let s = ''; for (let i = 0; i < 24; i++) { const a = i * 2.2, r = 10 + (i * 6.7) % 78; const x = 200 + Math.cos(a) * r * 1.25, y = 150 + Math.sin(a) * r * .34;
        s += '<rect x="' + (x - 7) + '" y="' + (y - 6) + '" width="14" height="12" rx="3" fill="' + (i % 3 ? '#7a3d24' : '#9a5230') + '" transform="rotate(' + (i * 37 % 90) + ' ' + x + ' ' + y + ')"/>'; }
      return pideKayik('#b9703c', s);
    },
    sucuklu() {
      let s = ''; const d = [[132, 146], [170, 128], [210, 150], [250, 128], [286, 148], [170, 172], [232, 174], [112, 156]];
      d.forEach((p, i) => { s += nokta(p[0], p[1], 17, '#8b2b1d') + nokta(p[0] - 4, p[1] - 3, 3, '#c9573f') + nokta(p[0] + 6, p[1] + 4, 2.6, '#c9573f'); });
      return pideKayik('#f3d36b', s);
    },
    lahmacun() {
      let s = ''; for (let i = 0; i < 70; i++) { const a = i * 2.399, r = (i * 4.9) % 104; s += nokta(200 + Math.cos(a) * r, 150 + Math.sin(a) * r * .88, 3.4 + (i % 3), i % 4 === 0 ? '#9d3a22' : '#c25a31'); }
      for (let i = 0; i < 12; i++) s += nokta(200 + Math.cos(i * 1.9) * (20 + i * 7), 150 + Math.sin(i * 1.9) * (14 + i * 6), 3, '#4f8a3a');
      return '<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true">' + GOLGE +
        '<ellipse cx="190" cy="150" rx="140" ry="118" fill="#dca85e" stroke="#b98240" stroke-width="3"/><ellipse cx="190" cy="150" rx="122" ry="102" fill="#c25a31" opacity=".95"/>' + s.replace(/cx="(\d+(?:\.\d+)?)"/g, (m, x) => 'cx="' + (+x - 10) + '"') +
        '<path d="M310 214a46 46 0 0 1 56-26l-30 56z" fill="#f4e27a" stroke="#d9b92e" stroke-width="3"/></svg>';
    },
    patatesli() {
      let s = '<ellipse cx="200" cy="150" rx="104" ry="40" fill="#f1dfa6"/><path d="M104 150c20-30 52-40 96-40s76 10 96 40c-24 18-56 28-96 28s-72-10-96-28z" fill="#f6e8b8"/>';
      for (let i = 0; i < 9; i++) s += '<path d="M' + (120 + i * 20) + ',' + (140 + (i % 3) * 8) + ' q8,-10 16,0" fill="none" stroke="#e4c978" stroke-width="5" stroke-linecap="round"/>';
      s += '<rect x="178" y="118" width="26" height="16" rx="4" fill="#f7d646"/>' + nokta(250, 142, 3, '#4f8a3a') + nokta(262, 150, 3, '#4f8a3a') + nokta(150, 158, 3, '#4f8a3a') + nokta(232, 160, 3, '#4f8a3a');
      return pideKayik('#f1dfa6', s);
    },
    tavuklu() {
      let s = ''; const d = [[118, 150], [152, 130], [190, 154], [226, 128], [262, 152], [296, 140], [170, 172], [246, 174]];
      d.forEach((p, i) => { s += '<rect x="' + (p[0] - 16) + '" y="' + (p[1] - 9) + '" width="32" height="18" rx="8" fill="' + (i % 2 ? '#e6bd76' : '#d9a85d') + '" transform="rotate(' + (i * 29 % 70 - 35) + ' ' + p[0] + ' ' + p[1] + ')"/>'; });
      for (let i = 0; i < 6; i++) s += nokta(128 + i * 32, 150 + ((i * 13) % 20) - 10, 4, i % 2 ? '#b8452c' : '#4f8a3a');
      return pideKayik('#f0dcae', s);
    },
    kola() {
      return '<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true"><ellipse cx="200" cy="262" rx="70" ry="10" fill="#000" opacity=".15"/>' +
        '<rect x="140" y="50" width="120" height="205" rx="14" fill="#c2272d"/><rect x="140" y="50" width="120" height="205" rx="14" fill="none" stroke="#8c171c" stroke-width="3"/>' +
        '<rect x="148" y="40" width="104" height="16" rx="6" fill="#c7ccd1"/><rect x="148" y="250" width="104" height="10" rx="5" fill="#c7ccd1"/>' +
        '<path d="M140 150C180 120 220 190 260 150L260 182C220 222 180 152 140 182Z" fill="#fff" opacity=".9"/>' +
        '<g fill="#fff" opacity=".35"><circle cx="156" cy="84" r="3"/><circle cx="170" cy="226" r="3.4"/><circle cx="238" cy="96" r="3"/><circle cx="246" cy="232" r="2.6"/></g></svg>';
    },
    tatli() {
      return '<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true">' + GOLGE +
        '<path d="M110 150h180l-18 96a20 20 0 0 1-20 16h-104a20 20 0 0 1-20-16z" fill="#e9e1d4" stroke="#c9bfae" stroke-width="3"/>' +
        '<ellipse cx="200" cy="150" rx="90" ry="22" fill="#b9722f"/><ellipse cx="200" cy="146" rx="74" ry="14" fill="#d49147"/>' +
        '<path d="M150 146c20-10 40 8 60-2s34 6 42-2" fill="none" stroke="#7a431a" stroke-width="5" stroke-linecap="round"/>' +
        '<circle cx="232" cy="124" r="14" fill="#a8261e"/><path d="M232 110c2-12 10-16 16-16" stroke="#4f8a3a" stroke-width="3" fill="none" stroke-linecap="round"/></svg>';
    },
  };
  window.AK_RESIM = id => (ART[id] ? ART[id]() : '<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' + GOLGE + '<circle cx="200" cy="150" r="96" fill="#e9e1d4" stroke="#c9bfae" stroke-width="3"/></svg>');
})();
