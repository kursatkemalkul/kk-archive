/* AUTOKITCH · VİTRİN AYARI (dış cephe şerit ekranı + dolap boşta ekranı + dükkân içi bekleme ekranı) — VARSAYILAN değerler.
   Yayın yöneticinin menü / kampanya ayarından otomatik gelmeli: sunucu ucu /api/vitrin (İSTEK kaydı panoda). Uç yoksa bu dosya kullanılır.
   Çalışma saatleri, kampanya metinleri ve gece parlaklığı ÖRNEKTİR (işletme kararı); fiyat içeren kampanya yazılmadı. */
(function () {
  'use strict';
  window.AK_VITRIN = {
    ornek: true,
    dukkan: 'AUTOKITCH Pide',
    saatler: [                                   // gun: 0 = Pazar … 6 = Cumartesi
      { gunler: [1, 2, 3, 4, 5, 6, 0], ac: '10:00', kapat: '23:00' },
    ],
    gece: { baslangic: '21:00', bitis: '07:00', parlaklik: 0.55 },   // dış ekran parlaklığı (1 = tam) — gece göz kamaştırmasın, enerji ve ekran ömrü
    bekleme: { hazirlik_sn: 270, masa_aralik_sn: 36 },                // ayarlar.json (workflow_v28): tek siparişin hazırlanması ≈ 270 s, kuyrukta her sipariş için ≈ 36 s
    kampanyalar: [
      { id: 'k1', tr: 'Telefonundan sipariş ver — sıra bekleme, hazır olunca SMS gelsin', en: 'Order from your phone — skip the queue, get an SMS when ready' },
      { id: 'k2', tr: 'Robot hazırlar, dolaptan alırsın: kodunu ya da QR\'ı göster', en: 'Made by a robot, collected from the locker: show your code or QR' },
      { id: 'k3', tr: 'Taze hamur, her gün — siparişe göre hazırlanır', en: 'Fresh dough every day — prepared to order' },
      { id: 'k4', tr: 'ÖRNEK KAMPANYA: 2 pide alana içecek bizden', en: 'SAMPLE CAMPAIGN: free drink with 2 pides', ornek: true },
    ],
  };
  /** şimdi çalışma saati içinde mi? → {acik, sonraki:'HH:MM', kapanis:'HH:MM'} */
  window.AK_ACIK = function (v, d) {
    d = d || new Date(); const dk = d.getHours() * 60 + d.getMinutes(), gun = d.getDay(), dakika = s => { const [a, b] = s.split(':'); return +a * 60 + +b; };
    let acik = false, kapanis = null, sonraki = null;
    for (const p of v.saatler) { if (!p.gunler.includes(gun)) continue; const a = dakika(p.ac), k = dakika(p.kapat); if (dk >= a && dk < k) { acik = true; kapanis = p.kapat; } else if (dk < a && (!sonraki || a < dakika(sonraki))) sonraki = p.ac; }
    return { acik, kapanis, sonraki };
  };
  /** gece parlaklığı çarpanı (0–1) */
  window.AK_PARLAKLIK = function (v, d) {
    const q = new URLSearchParams(location.search).get('parlaklik'); if (q) return Math.max(0.1, Math.min(1, parseFloat(q) || 1));
    d = d || new Date(); const dk = d.getHours() * 60 + d.getMinutes(), s = x => { const [a, b] = x.split(':'); return +a * 60 + +b; };
    const b = s(v.gece.baslangic), e = s(v.gece.bitis), gece = b > e ? (dk >= b || dk < e) : (dk >= b && dk < e);
    return gece ? v.gece.parlaklik : 1;
  };
})();
