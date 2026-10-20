# AUTOKITCH · KURALLAR (Claude + Codex, tek liste)

Kemal, 5 Eki 2026: "Kurallar listesi hem senin hem Codex'in için kaydedilsin; ikisi de aynı sistemle, aynı kurallarla çalışsın."

- Her ajan işe başlamadan bu dosyayı okur. İş bitince §5'teki denetimi çalıştırır. Bir madde tutmazsa iş yayımlanmaz.
- Yeni kural yalnız buraya yazılır (Kemal kararıyla). Başka dosyada kural tutulmaz; eski dosyalar buraya bağlanır.
- Çelişkide sıra: **Kemal kararı (§6) > bu dosya > `arastirma/_uretec/h3/yama_v9/sac_standart/sac_uyum_v1.json` > `sac_kararlar_v1.json` > `sac_standart_v1.json`.**
- Ortak çalışma (kim neyi yapıyor, dosya sahipliği, zincir kilidi, yayın): `KOORDINASYON.md`.

---

## 1. Üretilebilirlik: her parça gerçekten üretilebilir ve birbirine uyumlu

### 1.1 Sac
1. Malzeme AISI 304 2B. Dış yüz 240 kum satine (hat boyunca yatay). Gıdaya değen yer 304; tuzlu veya asitli ürüne sürekli değen yer gerekirse 316L.
2. Kalınlık yalnız şu aileden: **0,8 · 1,0 · 1,2 · 1,5 · 2,0 · 3,0 mm**. Plaka veya lama olarak 4 ve 6 mm izinli. Aile dışı kalınlık Kemal onayı ister.
3. Aynı işlev, her istasyonda aynı kalınlık:
   - dış kabuk 1,5;
   - kapak dış tava 1,5, iç tava 1,0;
   - ön çerçeve 1,0;
   - raf ve yük sacı 3,0;
   - kulak ve braket 3,0;
   - dikme tapası 2,0.
4. Büküm iç yarıçapı R = 1,5 × t. Gıda tarafında iç köşe en az R 3.
5. Delik veya kesik, büküm çizgisine en az 2 × t + R uzak. Daha yakınsa rahatlatma kesiği açılır.
6. Açınım standart levhaya sığar (1000 × 2000 / 1250 × 2500 / 1500 × 3000). Büküm boyu ve flanş yüksekliği abkanta uyar: en kısa flanş en az 4 × t.
7. Profil dış R = 2 × t. Profiller iç içe geçmez; köşebent, plaka, cıvata ya da kaynakla birleşir.

### 1.2 Bağlantı elemanları (tek standart set)
| Eleman | Standart |
|---|---|
| Silindir baş | ISO 4762 (modül bağlantısı M8; başka baş tipi kullanılmaz) |
| Bombe baş | ISO 7380 (yalnız görünür iç yüzde M5) |
| Havşa | DIN 7991 |
| Pul | M5 ISO 7089 · M8 ISO 7092 |
| Fiberli somun | ISO 10511 |
| PEM | FHP saplama · SP somun (A286 pasive). Kod sac kalınlığına göre: 1,0–1,3 → -1 · ≥ 1,4 → -2 |
| Perçin somun | Kuru bölgede açık uç, ıslak veya soğuk bölgede kapalı uç |
| Kör perçin | Tek çap hedefi Ø4 ISO 15983 A2/A2 (eski Ø3,2'ler yeni sürümde Ø4'e çekilir) |
| Kaynak somunu | DIN 929 |

Kurallar:
- Vida ve somun A2-70 paslanmaz.
- Her deliğin vidası, her vidanın deliği var.
- Geçiş deliği ISO 273 orta seri (M5 → Ø5,5 · M8 → Ø9).
- Diş tutuşu en az 1 × d.
- Vida ucu somundan 1–3 diş taşar, fazlası olmaz. Kör dişte dibe 1 × P boşluk kalır.
- Vida boyu katalog boyundan seçilir.

### 1.3 Kaynak, yapıştırma, sızdırmazlık
- Kaynak (TIG, punta) yalnız torç veya elektrot ucunun ulaştığı yerde yapılır.
- Gıdaya değen dikiş sürekli olur, taşlanır ve pasive edilir. Gıda tarafında aralıklı dikiş ve yarık bırakılmaz.
- Gıda tarafındaki contalar, silikonlar ve plastikler gıdaya uygun malzemeden olur ve uygunluk beyanı alınabilir: silikon, POM, EPDM, PU.
- Gıda tarafında kör perçin yalnız KAPALI UÇLU (ISO 15973 / 15974, A2) ve başı silikonla sızdırmaz; açık uçlu perçin (DIN 7337, ISO 15983) yalnız gıdaya değmeyen tarafta. Açık PEM dişi / saplama ucu gıda tarafında olmaz (5 Eki: B iç kabuğunun gıda tarafına dönen perçinleri bu kurala çekildi — geometri aynı, parça listesi).

### 1.4 Erişim ve bakım
- Her vidaya anahtar ya da tornavida girer; etrafında en az anahtar ağzı + 5 mm boşluk kalır.
- Bakımda sökülecek parça başka bir parçayı sökmeden çıkar. Çıkamıyorsa Kemal'e sorulur.
- Komşu istasyonlar aynı koordinat sabitinden delinir (eksen kayması 0). Derzler 3,0 mm; yükseklik ve kotlar `sac_uyum_v1.json`'daki tablodan alınır.

---

## 2. Montaj animasyonu (Kemal, 4 Eki 2026)

Amaç: animasyonu izleyen usta, parçayı gerçekten **aynı sırayla ve aynı yöntemle** üretip birleştirebilmeli.

### 2.1 Üretimden başla
1. Her sac parça önce **düz açınım** olarak görünür: lazer kesim, kontur ve tüm delikler.
2. Sonra **abkant**: her büküm tek tek, gerçek sırasıyla, doğru yön ve açıyla yapılır.
3. PEM somun ya da saplama gerçek sırasıyla (bükümden önce ya da sonra) kendi deliğine preslenir.
4. Profiller kesim boyunda gelir; delikleri görünür.

### 2.2 Birleştirme gerçek olmalı
5. Hiçbir parça "sihirle" birleşmez:
   - Vida tek tek, kendi deliğine, kendi ekseninde girer; pul ve somun da gelir.
   - Perçin deliğine girer ve sıkılır.
   - Kaynak dikişi vurgulanır (kırmızı, kalıcı).
   - Geçme veya tırnak yuvasına girer.
6. Profiller iç içe geçmez.
7. Her bağlantı modelde gerçektir: delik, vida, karşı diş. Deliksiz vida ya da vidasız delik olmaz.

### 2.3 Hareket
8. Hiçbir parça başka bir parçanın içinden geçmez. Yol 2 mm adımla denetlenir.
9. Hiçbir parça yerinde belirmez. İstisna: kablo ve kayış (boyunca uzar).
10. **Havada ya da bağsız duran parça yok.** Her parça oturduğu adımda bağlanır: vida, perçin, kaynak, klips, kilit mandalı.
    - Gerçek montajda bu mümkün değilse (vida ancak sonraki parça gelince takılabiliyorsa) parça **GEÇİCİ DAYALI** sayılır:
      - Geldiği adımda ekranda sarı uyarı çıkar.
      - Adım metninde şu yazar: *"Geçici olarak dayalı — N. adımda 4 × M5 ile sabitlenecek."*
      - Sabitlendiği adımda *"N. adımda dayanan X şimdi sabitleniyor"* yazar.
    - **Geçici dayalı parçanın üstüne, o sabitlenmeden yük binen parça konamaz.** Denetim bunu hata sayar.
    - Yalnız oturan parça (ör. elle çıkarılan tepsi, kaset) ancak bilerek böyle tasarlandıysa kabul edilir ve metinde *"oturur, kilit mandalıyla tutulur / elle çıkar"* diye yazılır.
    - Hazır ürünün (motor, UNO gövdesi, valf adası, menteşe) bağlantı vidaları da modelde ve animasyonda bulunur; "hazır ürün" diye vidasız bırakılmaz.
11. Geliş yönü gerçekçi olur:
    - delikli ya da geçmeli parça eksen boyunca gelir;
    - kapalı hacme giren parça açık taraftan, o taraf kapanmadan girer;
    - kapak menteşe tarafından gelir.
12. Dolap içinde kurulamayan grup tezgâhta kurulur, sonra bütün olarak yerine girer.

### 2.4 Sıra ve gösterim
13. Önce yazılı montaj planı yapılır: adım, parça, yön, bağlantı, açık taraf. Animasyon bu plandan üretilir.
14. Adım metni sade Türkçe olur: ne, nereden, neyle bağlanıyor. Örnek: *"Sol ray: 3 × M5×6 havşa vida ile bölme sacındaki PEM'lere."*
15. O adımda birleşen parçalar ve bağlantı elemanları kısa süre vurgulanır.
    - Renkler: sarı PU, turuncu o anki parça, kırmızı kaynak (kalıcı), mavi vida, yeşil yapıştırıcı.
    - Geçici dayalı uyarısı sarı rozet olur.
16. Çevre silik görünür; montajı yapılan ürün tam renkte görünür.

---

## 3. Model zinciri
- Model değişikliği yalnız zincire yeni numaralı adım olarak yapılır: `arastirma/_uretec/h3/yama_v9`, `zincir.py`, `SIRA.md`.
- Her adım GLB → GLB çalışır, iki koşuda bayt aynı çıkar ve `SIRA.md`'ye yazılır. Aynı anda tek yazar olur (kilit `KOORDINASYON.md`'de).
- Kemal (5 Eki): **küçük tasarım kararlarını ajan kendisi verir, sormaz**; iş bitince topluca rapor eder. Yalnız büyük kararlar (yerleşim, istasyon değişikliği, maliyeti / işlevi değiştiren) bulunduğu anda sorulur.
- **Hazır (satın alınan) ürünün bağlantısı:** ürüne dokunulmaz (dış kabuk); bağlantı BİZİM tarafımızdan basit parçayla yapılır — rafa / duvara kaynaklı ya da vidalı braket, pabuç, köşebent; üründen yalnız "şu yüzde N × M5 dişli delik" istenir (sipariş notu). Kaset gibi sık çıkarılan ürün: kapak takozu / dayama ile kilit (adım 63 örneği).

---

## 4. Makine emniyeti ve hijyen (Türkiye / AB: CE)

Ayrıntı ve eksik listesi: `STANDART_DURUM.md`. Tasarımda uyulacak temel kurallar:
1. **Acil durdurma** (EN ISO 13850, EN 60204-1):
   - Kırmızı mantar buton, sarı zemin, kilitlenen tip, el ile geri alınır.
   - Kemal kararıyla yeri B'nin ön kapağı, küçük model (Ø22 mm delik, ~Ø30–40 mm mantar).
   - Bastığında robot dahil bütün hattın tehlikeli hareketi durur (Durdurma kategorisi 0 ya da 1).
   - Butonu kapağa koymak menteşe üstünden kablo geçişi ister. Kapak açıkken de erişilebilir ve çalışır kalmalı.
2. Hareketli ve tehlikeli bölgeye açılan her kapı ya da kapak:
   - ya aletle açılır (sabit koruyucu, EN ISO 14120);
   - ya da kilit anahtarlıdır (EN ISO 14119): açılınca hareket durur, kapalıyken yeniden başlamaz, yalnız "başlat" ile başlar.
   - Güvenlik devresi EN ISO 13849-1'e göre tasarlanır.
3. Açıklıklar EN ISO 13857 güvenlik mesafelerine uyar: robot ağzı, servis delikleri, tabla geçişi parmak veya elle tehlikeye ulaşılamayacak boyutta olur.
4. Hijyenik tasarım (EN 1672-2, EN ISO 14159):
   - gıda bölgesinde yarık, kör delik, dışa açık vida dişi, yatay su tutan yüzey olmaz;
   - iç köşe en az R 3;
   - sökülmesi gereken parçalar aletsiz sökülür;
   - Ra ≤ 0,8 µm hedeflenir.
5. Gıdaya değen her malzeme için uygunluk beyanı alınabilir olmalı (Türk Gıda Kodeksi, AB 1935/2004 karşılığı).
6. Elektrik (EN 60204-1):
   - pano IP54, ıslak bölge IP65 ve üstü;
   - koruma topraklaması her metal gövdeye;
   - ana şalter kilitlenebilir;
   - kablo renkleri standarda uygun.
7. Pnömatik (EN ISO 4414): enerji kesilince basınç boşaltılır, beklenmedik hareket olmaz.
8. Soğutma: EN 378. Gaz türü ve miktarı F-gaz yönetmeliğine göre etikete yazılır.

---

## 5. Denetim (yayından önce zorunlu)
- **Yol:** gerçek çakışma 0, yerinde belirme 0 (istisnalar hariç), son konum = model (±0,01 mm).
- **Bağlantı:** her taşıyıcı parça HEMEN bağlı ya da GEÇİCİ DAYALI (uyarı ve metin var). Bağlantısız parça 0. Geçici dayalı parçaya yük binmesi 0.
  - Araç: `_local/claude_son_yerel/gece2/t5/baglanti_denetim.py` (TOPPING için yazıldı, diğer istasyonlara uyarlanır).
- **Vida ve delik:** eşleşme tam; diş tutuşu en az 1 × d; taşma 1–3 diş.
- **Üretilebilirlik:** §1'deki kalınlık ailesi, R, delik–büküm mesafesi, levhaya sığma.
- Biri tutmazsa sayfa **yayımlanmaz**; plan düzeltilir. Düzeltilemiyorsa Kemal'e sorulur.

---

## 6. Kemal kararları (değişmez; değişirse burada güncellenir)
- **Acil stop:** 5 Eki 2026 kararı: B'nin ön kapağında, küçük. Eski "acil stop yok" kararı kaldırıldı.
- Acil stop TEK buton (5 Eki: "tek buton dediğim yere"); ek buton yok.
- Servis: makine durur, duvardan öne çekilir, arkadan servis yapılır, yeniden duvara yaslanır (5 Eki). Servis açıklığı (ray ↔ makine 406 mm) ve ana şalter kol yüksekliği (2,07–2,14 m) OLDUĞU GİBİ kalır (Kemal, 5 Eki: "boşver") — risk değerlendirmesinde açık madde olarak yazılır.
- STANDART_DURUM.md §3'teki diğer önlemler onaylandı (5 Eki): kapı kilit anahtarları, A ışık perdesi kablosu, pnömatik boşaltma, R290 bölmesi, F filtresi, hijyen noktaları, robot kapısı + QR kilidi (Codex).
- A'nın içi boş. Dış zarf sabit.
- Renkler: güç kırmızı, bilgi mavi, hava yeşil.
- QR ve tezgâh montaj animasyonu yapılmaz.
- TOPPING iç gıda sacı 1,0 (onaylı fark; yeni sürümde 1,2 önerisi). Evaporatör ayağı 2,5 (onaylı fark).
- Depo düzenlemesi proje bitince yapılır. Oturum kayıtları silinmez.
