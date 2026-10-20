# AUTOKITCH · Standart durumu (Türkiye / AB · CE) — 5 Eki 2026

Kemal: "Modelleme yapma, sadece durumu anlayayım; standartlarla ilgili çok mu değişiklik lazım? Durduk yere makineyi değiştirme."
Bu belge **yalnız tespit**. Makineye ve modele dokunulmadı. Değişiklik Kemal "ok" verince yapılacak ve Codex'le bölüşülecek.

Kaynak: repodaki tasarım notları, üreteçler ve modelin kendisi (SIRA.md, SABAH.md, SERVIS.md, teyit.md, BOM'lar, istasyon sayfaları).
Bu bir **ön değerlendirme**; resmî uygunluk kararı değildir. Son sözü akredite laboratuvar ya da onaylanmış kuruluş söyler.

---

## 1. Kısa cevap

**Makinede büyük değişiklik gerekmiyor.** Tasarım çoğunlukla doğru yolda:
- 304 paslanmaz, gıda tarafında R3 köşe;
- IP65 pano, 30 mA kaçak akım rölesi, kilitlenebilir ana şalter;
- aletsiz sökülen kasetler.

Gereken değişiklikler **küçük ve noktasal**: buton, kapı kilit anahtarı, şalter yeri, birkaç kablo ve sensör. Tek büyük soru, servis koridorunun genişliği (§3, madde 9).

**Asıl eksik kâğıt tarafında:**
- risk değerlendirmesi;
- teknik dosya;
- test raporları (EMC, elektrik güvenliği);
- tedarikçi beyanları;
- Türkçe kılavuz.

Bunlardan hiçbiri yok. CE için en çok iş buradadır ve makineyi değiştirmez.

Makine "Ek IV" (zorunlu onaylanmış kuruluş) listesine girmiyor: et testeresi, pres vb. yok. Bu yüzden **CE'yi üretici kendisi beyan edebilir**. EMC ve elektrik testleri yine de akredite laboratuvarda yaptırılır.

---

## 2. Uyulacak mevzuat (Türkiye ↔ AB karşılığı)

| Konu | Türkiye yönetmeliği | AB | Temel standartlar |
|---|---|---|---|
| Makine güvenliği | Makine Emniyeti Yönetmeliği | 2006/42/AT. 20 Oca 2027'den itibaren 2023/1230 Makine Tüzüğü; Türkiye'nin uyumlaştırması bekleniyor, tasarım şimdiden yeni tüzüğe göre yapılmalı. | EN ISO 12100 (risk), EN ISO 13849-1 (güvenlik devresi), EN ISO 13850 (acil stop), EN ISO 14119 / 14120 (kapı ve koruyucu), EN ISO 13857 (mesafe) |
| Elektrik | Alçak Gerilim Yönetmeliği | 2014/35/AB | EN 60204-1, EN 61439 (pano) |
| EMC | Elektromanyetik Uyumluluk Yönetmeliği | 2014/30/AB | EN 61000-6-2 / -6-4 (ya da -6-1 / -6-3) |
| Robot hücresi | (Makine yönetmeliği altında) | — | EN ISO 10218-1 / -2 (2025), ISO/TS 15066 (insanla temas varsa) |
| Gıda temas | Türk Gıda Kodeksi Gıda ile Temas Eden Madde ve Malzemeler Yönetmeliği (+ plastikler tebliği) | 1935/2004, 2023/2006 (GMP), 10/2011 | — |
| Hijyenik tasarım | (Makine yönetmeliği Ek I gıda makineleri maddesi) | — | EN 1672-2, EN ISO 14159 |
| Soğutma (R290) | F-gaz yönetmeliği (R290 F-gaz değil ama etiket ve kayıt) · Basınçlı Ekipmanlar (şarja göre) | 2014/68/AB | EN 378-1…4, IEC 60335-2-89 (ticari soğutucu) |
| Basınçlı hava tankı | Basit Basınçlı Kaplar Yönetmeliği | 2014/29/AB | Tedarikçi CE'si yeterli (JUN-AIR 15 L, Walther 6 bar) |
| Davlumbaz | — | — | EN 16282 |
| Sıcak yüzey | — | — | EN ISO 13732-1 |
| Çevre | RoHS ve AEEE yönetmelikleri | 2011/65/AB, 2012/19/AB | Tedarikçi beyanları |
| Satış | Garanti Belgesi ve Satış Sonrası Hizmetler Yönetmeliği (Ticaret Bak.) | — | Türkçe kılavuz, garanti belgesi, servis yeterlilik |

---

## 3. İstasyon istasyon durum

Değişiklik büyüklüğü: **0** = değişiklik yok (yalnız kâğıt) · **K** = küçük (bir iki parça, buton, sensör) · **O** = orta (bir grup yeniden düzenlenir) · **B** = büyük (yerleşim değişir).

| # | Konu | Şimdiki durum | Standart ne istiyor | Değişiklik |
|---|---|---|---|---|
| 1 | **Acil stop** (bütün hat) — *Kemal 5 Eki: TEK buton, B ön kapağı* | Adım 40'ta 6 buton vardı, adım 45'te Kemal kaldırttı. Model ve animasyonda buton yok. 5 Eki kararı: B'nin ön kapağına küçük buton. | EN 60204-1 10.7, EN ISO 13850: her kumanda yerinde ve tehlikeye müdahale edilen her yerde erişilebilir buton. Bastığında robot dahil bütün hat durur. | **K.** B ön kapağına Ø22 delik + buton (~Ø30–40 mantar). Notlar: (a) kapağa takılırsa menteşeden kablo geçer; buton sabit çerçevede daha iyi olur, ya da kapak açıkken de erişilebilir kalmalı. (b) Hat 5,2 m; personel E ucundayken tek buton uzak kalabilir. Risk değerlendirmesi ikinci butonu (QR / tezgâh ucu) isteyebilir. (c) Robot koridoruna girilen yerde (hücre kapısı yanı) ayrıca bir buton gerekir; robotun el terminalindeki buton servis için sayılır. |
| 2 | **Ana şalter yüksekliği** — *Kemal 5 Eki: olduğu gibi kalır* (U_F pano) | ABB OT40 kolu 2,07–2,14 m'de (SABAH.md'de açık madde) | EN 60204-1 5.3.4: kol 0,6–1,9 m arasında | **K.** Şalter kolunu ya da şalteri 1,9 m altına almak (uzatma mili veya yan yüzde ayrı şalter kutusu). |
| 3 | **Ön kapaklar, hareketli parçalar** (TOPPING, K, F üst, E) | Personel kaset takmak için kapak açıyor. İçeride 7 bar pnömatik piston ve döner valf (TOPPING), Ø296 bıçak (K), helezon motorları, X ekseni var. Kapaklarda kilit anahtarı yok. K'nın eski v6'sında 2 × AZM40 + PNOZ vardı, K400'de belirsiz. | EN ISO 14119 / 14120: hareketli tehlikeye açılan kapı ya ALETLE açılır (sabit koruyucu) ya da KİLİT ANAHTARLI olur: açılınca hareket durur, hava boşalır, kapanınca kendiliğinden başlamaz. Güvenlik devresi PL c–d (EN ISO 13849-1). | **K–O.** Her hareketli bölge kapısına bir kilit/emniyet anahtarı (kapı başına 1 küçük parça + kablo) ve güvenlik rölesi veya güvenlik PLC'si. Pnömatikte bölge başına emniyetli boşaltma valfi. Kapak ve gövde değişmez. |
| 4 | **A ışık perdesi** | BOM'da 2 × SICK miniTwin4 var; hat elektrik modelinden kabloları sonradan silinmiş | EN ISO 13855 mesafe + EN 61496 | **K.** Kabloları ve bağlantıyı geri koymak; robot ağzına göre mesafe hesabı. |
| 5 | **B motorlu çekmeceler** | 24 V motor, sıkışmada akım sınırı, reed sensör | Sıkıştırma tehlikesi: EN ISO 13854 en küçük aralıklar ya da kuvvet sınırlama (doğrulanmış) | **0–K.** Akım sınırı varsa çoğunlukla kâğıt işi (ölçüm + risk analizi). Ölçüm tutmazsa çekmece ağzına kenar sensörü. |
| 6 | **F fırın** | Sveba Dahlen TP10 özel 1500 mm gövde, 400 °C, ~14 kW. Üst yüzey sıcaklığı bilinmiyor (60–100 °C tahmini). Davlumbaz filtresi kompresörün arkasında kalıyor. | Fırının CE'si üreticiden; özel gövde için üreticinin değiştirilmiş ürüne beyanı gerekir. EN ISO 13732-1: elle değilecek yüzey sınırları ve uyarı etiketi. EN 16282: filtre haftalık sökülebilir olmalı. | **K.** Tedarikçi beyanı (kâğıt), sıcak yüzey ölçümü ve etiket. Filtrenin önden sökülebilmesi için kompresör veya filtre yeri küçük bir düzenleme ister. |
| 7 | **Soğutma (B, TOPPING) R290** | Secop NLE8.8CN ve KLF6.6CND, R290. Şarj miktarı hiçbir yerde yazmıyor. Kompresör bölmelerinde röle ve kontaktör var. | R290 yanıcı. IEC 60335-2-89 / EN 378: devre başına şarj sınırı (ticari ≤ 500 g, koşullu), kaçak olabilecek bölmede kıvılcım kaynağı olmaması ya da havalandırma, etiket. | **0–K.** Şarj küçükse (bu kompresörlerde tipik 100–150 g) çoğunlukla kâğıt + etiket. Kompresör bölmesindeki röle ve klemensler kapalı tip ya da başka bölmede olmalı; gerekirse havalandırma deliği. |
| 8 | **Pnömatik** (7 bar kompresör, 6 bar tank) | Tank ve kompresör hazır ürün | EN ISO 4414: kilitlenebilir ana hava vanası + boşaltma, enerji kesilince beklenmedik hareket yok, yumuşak başlatma | **K.** Ana hava girişine kilitlenebilir boşaltma vanası + yumuşak başlatma valfi (1–2 hazır parça). Tank ve kompresör için tedarikçi CE'si. |
| 9 | **Servis ve bakım erişimi** — *Kemal 5 Eki: servis için makine öne çekilir; açıklık olduğu gibi kalır* | Makine duvara ~20 mm; 40'tan fazla servis parçasına yalnız arkadan, robot koridorundan (makine ile ray arası 406 mm) erişiliyor. TOPPING arka servis sacı duvar dibinde açılamıyor. | EN ISO 12100 güvenli bakım; EN 547 / ISO 14738 vücut ölçüleri: geçiş en az ~500–600 mm. Bakım robot kilitliyken (kilitleme / etiketleme) yapılır. | **O–B.** En büyük soru bu. Seçenekler: (a) makineyi duvardan biraz açmak ya da koridoru 600 mm'ye çıkarmak (yerleşim); (b) en sık bakımı önden yapılabilir hale getirmek; (c) servis anında rayı veya robotu park konumuna alıp koridoru boşaltmak (yalnız prosedür). Kemal kararı gerekir; şimdilik dokunulmadı. |
| 10 | **Robot hücresi** (Fairino FR5, ray 4,9 m) | Koridor ince duvar + kilitli hücre kapısı ("açılınca robot durur") ile ayrılmış; personel öndedir. | EN ISO 10218-2: hücre kapısı emniyet anahtarlı (PL d), açıkken robot duruyor; robot ağızlarından personelin eli robota ulaşamaz (EN ISO 13857); hücre yanında acil stop. Robotun kendi CE'si "kısmen tamamlanmış makine" beyanıdır, hücreyi biz belgeleriz. | **K.** Kapı anahtarı + buton + güvenlik devresi. Gövdede değişiklik yok. Robot tarafı Codex'in alanı. |
| 11 | **QR dolabı** (müşteriye açık yüz) | 12 göz, müşteri kapısında elektrikli kilit, gözde 60 W ısıtıcı; robot gözlere arkadan erişiyor. | Müşteri kapısı açıkken robot o göze GİREMEZ; robot gözdeyken müşteri kapısı kilitli kalır (kilit geri bildirimi güvenlik devresinde). Isıtıcı yüzeyleri müşterinin değeceği sıcaklıkta olamaz. Halka açık kullanım: vandalizm ve çocuk eli de düşünülür. | **K.** Mantık ve sensör (kapı kapalı + kilitli geri bildirimi). Mekanik değişiklik büyük ihtimalle yok. Codex'in alanı. |
| 12 | **Hijyen (gıda tarafı)** | 304, R3 köşe + silikon, POM / UHMW / TPU parçalar; kaset ve hazneler aletsiz sökülüyor, MEIKO'da yıkanıyor. B iç kabuk flanşları kör perçinli. | EN 1672-2 / EN ISO 14159: gıda bölgesinde yarık, kör delik ve açık dişli vida olmaz. Perçin ve vida başları gıda tarafında olmamalı ya da kapalı ve sızdırmaz olmalı. | **0–K.** Tasarım iyi. Kontrol edilecek: gıdaya değen yüzde perçin başı veya açık PEM dişi var mı. Varsa yalnız o noktalar (silikon dolgu ya da kapalı uç). Malzeme beyanları kâğıt işi. |
| 13 | **Elektrik ve EMC** | Pano IP65, RCD 30 mA, MCB'ler, H07RN-F kablolar, istasyon kutuları IP65 | EN 60204-1: PE sarı-yeşil, N açık mavi, DC kontrol mavi gibi tel renkleri; topraklama sürekliliği testi; yalıtım testi; EMC testi | **0.** Belgeleme ve test. Dikkat: 3D görünümdeki "güç kırmızı / bilgi mavi" yalnız ekran rengidir; gerçek kablo renkleri standart tablodan seçilir. |
| 14 | **Gürültü** | Ölçülmemiş (kompresör, davlumbaz fanı, kesici) | Kılavuzda ses basıncı beyanı (≤ 70 dB(A) ise "≤ 70" yazılır) | **0.** Ölçüm. |

**Toplam:** 14 maddenin 10'u ya hiç değişiklik istemiyor ya da küçük bir hazır parça (buton, anahtar, valf, sensör) ile kapanıyor. Biri orta (F filtresi + kompresör yeri). Biri büyük olabilir (servis koridoru, madde 9). Gövde, sac, kalınlık ve istasyon ölçüleri değişmiyor.

---

## 4. Alınacak ve hazırlanacak belgeler

| Belge | Kim yapar | Makine değişir mi |
|---|---|---|
| Risk değerlendirmesi (EN ISO 12100): her istasyon + robot + bakım + temizlik | Biz (Claude + Codex taslak, Kemal onay) | Hayır; çıkan önlemler §3 tablosundaki küçük işler |
| Güvenlik devresi hesabı (EN ISO 13849-1, PL hesabı, SISTEMA) | Biz + elektrik tasarımcısı | Hayır |
| Teknik dosya (çizimler, şemalar, hesaplar, test raporları, standart listesi; 10 yıl saklanır) | Biz | Hayır |
| EMC testi + elektrik güvenliği testi (topraklama sürekliliği, yalıtım, dielektrik) | Akredite laboratuvar (TSE ya da özel; teklif alınmalı) | Hayır (geçemezse filtre veya ekranlama) |
| Tedarikçi beyanları: robot (birleştirme beyanı), fırın (değiştirilmiş ürün dahil), soğutma kompresörleri, kompresör + tank, UNO'lar, motorlar, ışık perdesi, kilit anahtarları | Tedarikçiler (biz isteriz) | Hayır |
| Gıda temas uygunluk beyanları (her plastik, conta, yağ, bant; gerekirse göç testi) | Tedarikçiler + gerekiyorsa laboratuvar | Hayır |
| AB / AT Uygunluk Beyanı + CE etiketi (tip plakası: üretici, model, seri no, yıl, gerilim, güç, soğutucu ve şarj) | Biz | Etiket plakası eklenir |
| Türkçe kullanım ve bakım kılavuzu (temizlik, kilitleme / etiketleme, acil stop, artık riskler) | Biz | Hayır |
| Garanti belgesi + Satış Sonrası Hizmet Yeterlilik Belgesi (Ticaret Bakanlığı) | Şirket | Hayır |
| İşletmede: gıda işletme kayıt belgesi (Tarım ve Orman Bak.), HACCP / ISO 22000, iş ekipmanı periyodik kontrolü (İSG), elektrik tesisatı topraklama ölçümü | Makineyi işleten | Hayır |
| İsteğe bağlı: TSE belgesi, ISO 9001 (üretim), EHEDG / NSF hijyen sertifikası | Şirket | Hayır |

---

## 5. Önerilen sıra (Kemal "ok" verirse; Claude ↔ Codex bölüşümü önerisi)

1. **Kemal kararları:** acil stop butonu sayısı (B ön kapağında 1 + robot hücresi kapısında 1; risk analizi gerekirse ikinci uç); servis koridoru (madde 9).
2. **Claude:** risk değerlendirmesi taslağı (istasyonlar), §3 madde 1–9 ve 12'nin modele işlenmesi (zincir adımı olarak), montaj animasyonlarında yeni parçalar.
3. **Codex:** robot hücresi + QR dolabı (madde 10–11), kendi alanında.
4. **Birlikte:** güvenlik devresi şeması (tek güvenlik rölesi veya PLC; acil stop + bütün kapı anahtarları + robot), teknik dosya iskeleti, tedarikçi beyan listesi.
5. **Dışarıdan:** EMC ve elektrik güvenliği laboratuvar teklifi; ilk prototipte test.


## 6. Kemal kararları (5 Eki 2026)
- Acil stop: tek buton, B'nin ön kapağında, küçük.
- Ana şalter yüksekliği ve servis açıklığı: değişmez (risk değerlendirmesinde açık madde).
- Diğer önlemler (madde 3–8, 10–14): yapılacak; Claude ↔ Codex bölüşümü KOORDINASYON.md tablosunda.

## 7. Yapılanlar (5 Eki 2026 · Claude · branch `claude/standart-makine`, model zinciri 58–61)
| Madde | Ne yapıldı | Model |
|---|---|---|
| 1 Acil stop | TEK buton (Schneider XB4BS8442 Ø40 + Ø60 sarı etiket), ana şalterin önündeki kapakta: F sağ üst kapağı, yerden 1,60 m | adım 58 |
| 3 Kapılar | 10 ön kapağa emniyet anahtarı: Schmersal RSS36 kodlu sensör + aktüatör (A, TOPPING K1/K2, F sol/sağ, E × 4); K'da kilitli AZM40 (bıçak) | adım 59 |
| 4 A ışık perdesi | GEREKMEZ: açıcı kendi emniyet devresiyle hazır alınır (Kemal, v3.6); robot tarafı hücre kapısıyla korunur (Codex). A ön kapağı adım 59'da kilitli | — |
| 6 F davlumbaz filtresi | Filtre sola kayar, pizza kutusu stoğunun arkasındaki servis ağzından (tapa + 2 kam kilit) alınır; kompresör / yağ tankı yerinde. Ayrıca filtrenin içine giren 2 eski saplama düzeltildi | adım 61 |
| 7 R290 | Model değişmez: şarj miktarı soğutmacıdan (Secop NLE8.8CN / KLF6.6CND devreleri), kompresör bölmesine R290 + şarj etiketi; Secop R290 kompresörlerinin elektrik kutusu R290 onaylı | — (kılavuz / etiket) |
| 8 Pnömatik | Kompresör çıkış hortumuna Festo MS6-SV-E emniyetli yumuşak başlatma + hızlı boşaltma valfi; bakım kilitleme ana şalterle, tank kendi musluğuyla boşaltılır | adım 60 |
| 12 Hijyen | B iç kabuğunun gıda tarafına dönen kör perçinleri kapalı uçlu ISO 15973 + silikon (KURALLAR §1.3); geometri aynı | — (parça listesi) |
Açık: ölçüler katalogdan teyit (RSS36, AZM40, MS6-SV-E); kablolar ve güvenlik devresi şeması (Claude + Codex); sitede kapak animasyonu için mekanizma listesi.
