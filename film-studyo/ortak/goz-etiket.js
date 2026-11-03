// QR dolabı göz numaralaması: TEK eşleme tablosu (21 Eki, Kemal: üst sol = 1, soldan sağa).
// PLC göz kimliği (G1..G12, alt sol = 1) DEĞİŞMEZ; robot hedefleri, kilitler ve sipariş kayıtları PLC kimliğini kullanır.
// Gözün üstünde ve her ekranda gösterilen numara = etiket(PLC kimliği). Eşleme kendi tersidir: plc(etiket(n)) = n.
(function (g) {
  const etiket = n => { n = +n; if (!(n >= 1 && n <= 12)) return n; const sira = Math.floor((n - 1) / 4), sut = (n - 1) % 4; return (2 - sira) * 4 + sut + 1; };
  g.AK_GOZ = { etiket, plc: etiket, tablo: Array.from({ length: 12 }, (_, i) => etiket(i + 1)) };
})(typeof globalThis !== 'undefined' ? globalThis : window);
