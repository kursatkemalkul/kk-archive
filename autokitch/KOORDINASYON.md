# AUTOKITCH · Claude + Codex ortak çalışma kuralları

Kemal'in kararı (5 Eki 2026): iki ajan aynı anda, farklı istasyonlarda çalışır. Depo düzenlemesi proje bitince yapılacak; o zamana kadar dosya taşınmaz.

**İşe başlamadan `KURALLAR.md`'yi oku** (üretilebilirlik, montaj animasyonu, makine emniyeti / hijyen, Kemal kararları). Bitirince oradaki §5 denetimini çalıştır; tutmazsa yayımlama.

## 1. Kim neyi yapıyor (çalışmaya başlamadan önce bu tabloyu güncelle, commit + push et)

| İş | Kim | Branch | Durum |
|---|---|---|---|
| Robot + ray + QR dolabı + sipariş animasyonları | Codex | `coord/codex-kutu-donus-v28` | BİTTİ v28/adım97: sabit rayda açık taraftan kutu dönüşü; geri kaçış0, değişen yolun robot/kutu/QR/makine denetimi geçti; 8 sipariş, tam fizik açık. |
| TOPPING montaj animasyonu v5 | Claude | `claude/topping-montaj-v5` | yayında (açık 3 küçük madde) |
| Standart önlemleri · makine: acil stop (58) · 10 kapı emniyet anahtarı (59) · hava emniyet valfi (60) · davlumbaz filtresi servis ağzı (61) · hijyen / R290 / A perdesi kayıt | Claude | `claude/standart-makine` | BİTTİ (cb7d1ec) — Kemal incelemesinde |
| **TOPPING montaj v6**: bağsız 63 parça + geçici dayalı 2 parça bağlanır (KURALLAR §2.3 kural 10), animasyon yeniden üretilir, §5 denetimi | Claude | `claude/topping-montaj-v6` | YAYINDA (5 Eki, PR #5) · açık: kıyma silindiri flanşı, 5 iç elektrik parçası, 2 kovan contası |
| **F montaj animasyonu** (TOPPING v6 yöntemiyle: açınım → büküm → montaj, her parça vidalı / kaynaklı, yol + bağlantı denetimi) | Claude | `claude/f-montaj` | ÇALIŞIYOR (5 Eki) · zincir adımları **67–69** + gerekirse 80–89 |
| **K montaj animasyonu** (KURALLAR §2, yeni yöntem: açınım → abkant → PEM → gerçek bağlantı; bağlı mı denetimi) | Codex | `codex/k-montaj` | ÇALIŞIYOR · TOPPING v6 altyapısı, 70–73 K düzeltmeleri; dört dosya kaydı 06b99c4 |
| Standart önlemleri · robot + QR (madde 10–11): hücre kapısı emniyet anahtarı, robot gözdeyken QR müşteri kapısı kilitli + geri bildirim | Codex | (Codex seçer) | Codex'e bildirildi |
| **E mekanizma montajı**: alt / üst modül mekanizmaları parça parça + vida vida | Claude (yerel oturum) | `claude/e-mekanizma` | BİTTİ (6 Eki) · zincir **81–85** (kol: v10l → v10q; E montaj sayfası bunu kullanır, makine modeli Codex 90–97 kolunda) · E montaj v3 yayında · açık: 15 küçük temas, katlama sensörü, 31 arayüz saplaması somunsuz, E panosu ve E iç kabloları ayrıntılandırılacak |
| **K montajı — Codex'ten devralındı** (Kemal, 6 Eki: Codex'in yarım işini Claude kendi yöntemiyle bitirir): devir `codex/k-montaj` 10f02d3b, 199 açık bağlantı + üretim / bağlantı denetimi + yeni plan | Claude (1. oturum) | `claude/k-montaj` | ÇALIŞIYOR (6 Eki) · zincir adımları **86–89** |
| A kontrol · B kaynak görünürlüğü · elektrik + bilgi görünümü · son denetim | Claude (1. oturum) | `claude/a-kontrol` | BEKLİYOR (K bitince) |
| Güvenlik devresi şeması (acil stop + kapı anahtarları + robot, tek röle / güvenlik PLC) | Claude + Codex | — | makine anahtarları bitince |

Bir işe başlamadan önce tabloda başka bir ajanın aynı istasyonu ya da aynı dosyaları almadığını kontrol et.

## 1b. Aynı anda çalışma (Kemal, 5 Eki: "sen TOPPING'e, Codex başka birine")

- **İstasyon bölüşümü:** Claude → TOPPING · Codex → K (Codex K400'ü tasarladı). Biri bitince tablodan sıradakini alır: F, E, U, A kontrol, B kaynak (önce yazan alır).
- **Dosyalar ayrı:** her ajan yalnız kendi istasyonunun `otonom/hat/<ist>-montaj.html`, `otonom/hat3d/v3/<ist>_montaj/` ve üreteç klasörüne yazar
  (Claude: `_local/claude_son_yerel/gece2/t6/`, Codex: kendi `codex/…` klasörü). Ortak oynatıcı `montaj-oynatici.js`'e dokunmak gerekirse önce buraya not.
- **Model zinciri aynı anda:** ikisi de **aynı tabandan** (adım 61, `hat3_v10c`) başlar. Adım numaraları ayrılmıştır: Claude **62–69**, Codex **70–79** →
  iki ajan kendi adımlarını kendi branch'inde, kendi iş klasöründe geliştirir (iki koşu bayt aynı). Kilit yalnız **birleştirirken** alınır:
  önce biten kendi adımlarını zincire ekler; sonra gelen, kendi adımlarını öncekinin çıktısı üstünde YENİDEN koşar (girdi değişti → SHA değişir,
  iki koşu bayt aynı yeniden denetlenir) ve ekler. Farklı istasyonlar farklı düğümlere dokunduğu için çakışma beklenmez; aynı düğüme dokunan adım
  varsa birleştiren öteki ajana / Kemal'e yazar.
- **Animasyon** zincirin son modelinden üretilir: model birleşince ikisi de kendi animasyonunu son modelle bir kez daha üretir ve denetler.
- **Yayın** birlikte, Kemal gördükten sonra.

## 2. Dosya sahipliği

- Her ajan yalnız kendi işinin dosyalarına yazar. Başkasının alanındaki dosyayı değiştirmek gerekirse önce Kemal'e sorulur.
- Codex'in alanı: `arastirma/_uretec/robot_integrated_v28/`, `otonom/hat/robot-integrated-v28/`, `otonom/hat3d/robot-integrated-v28/`, `_local/codex_robot_v28/`, `otonom/hat/makine.html`; zincir97 ve kaydı. Claude K86–89 / E81–85 dosyaları değiştirilmez.
- İstasyon montaj animasyonu alanı (istasyonu alan ajanın): `otonom/hat/<ist>-montaj.html`, `otonom/hat3d/v3/<ist>_montaj/`, kendi üreteç klasörü.
- Ortak dosyalar (`otonom/hat/ist_montaj/montaj-oynatici.js`, `otonom/hat/hat.css`, `index.html`): değiştirmeden önce tabloya not düş, değişikliği küçük tut, geri uyumlu yap.

## 3. Model zinciri (`arastirma/_uretec/h3/yama_v9/zincir.py`) — aynı anda tek yazar

- Zincire yeni adım (58, 59 …) yalnız bir ajan yazar. Yazmaya başlamadan bu dosyanın en altındaki **ZİNCİR KİLİDİ** satırını kendi adınla doldur, commit + push et; adım bitince (iki koşu bayt aynı, SIRA.md kaydı) boşalt.
- Kilit doluyken öteki ajan model değiştirmez; gerekiyorsa kilit sahibine / Kemal'e yazar.
- Son model: `_local/claude_son_yerel/hat3_v10l.glb.gz` (adım 80 · zincir 67 F, 68–69 + 80 E; E montaj yayında) · önceki: `hat3_v10h.glb.gz` (adım 66) — branch `claude/topping-montaj-v6` (zincir betikleri 56–66 orada; 56–61 `claude/standart-makine`'de de; main'e birlikte birleştirilecek). Yeni adım çıkınca bu satır güncellenir.

Robot entegrasyon adımı94, makine geometrisini koruyan son render/animasyon adımıdır; adım90–93 önceki kayıt olarak korunur. Kaynak makine v10l (80) korunur; E81–85 / K86–89 birleştirilince 94 yeni birleşik makine girdisiyle yeniden çalıştırılır (robot eklenmiş v90 çıktısı değil). Native GLB büyük olduğu için commit dışı; sitedeki v25 gzip ve üreteç/provenance/iki-koşu kayıtları commitlidir. Özel3684 strok, eksen motor/sürücü seçimi, tam robot çarpışma, döşeme/yaya yükü ve cam kaldırıldıktan sonra koruma/güvenlik devresi açık.

## 4. Branch, birleştirme, yayın

- Her iş kendi branch'inde: `claude/<iş>` ya da `codex/<iş>`. Force push yok. Başkasının branch'ine push yok.
- Main'e yalnız yayınlanacak dosyalar birleştirilir; birleştiren, öteki ajanın main'deki değişikliklerini korur (merge, rebase değil).
- Site `kk-archive` deposundaki `deploy` iş akışıyla yayınlanır; autokitch'e push etmek siteyi güncellemez. Main'e birleştirdikten sonra iş akışı elle tetiklenir:
  `gh api -X POST repos/kursatkemalkul/kk-archive/actions/workflows/deploy.yml/dispatches -f ref=main`
- `_local/` siteye kopyalanmaz (güvenlik). Sitede gereken hiçbir dosya `_local/` altına konmaz.

## 5. Güvenlik

- Depo herkese açık. Oturum kayıtları `_local/claude_oturum/` altında durur (Kemal: kalsın); `_local/` siteye kopyalanmaz. Parola, anahtar, kişisel bilgi depoya konmaz.
- Büyük ara dosyalar (`.pkl`, 100 MB üstü GLB) depoya konmaz; GLB gerekirse kayıpsız `.gz` olarak.

ZİNCİR KİLİDİ: BOŞ

Codex v23/adım92: sağ duvar panosu ve ayrı router bölmesi; gömülü iniş, sıfır kapak, doğru dirsek/kesim ve ayrı kablo yolları. İki tam koşu bayt aynı; kanal/kablo katıları kapalı, modüllerde örtüşme yok, kablo yolunda2mm asgari pay. Elektrik nihai devre/kesit-seçicilik ve döşeme yükü, özel ray ve tam robot çarpışması hâlâ açık. E/K cloud dosyalarına dokunulmadı.

Codex v28/adım97: v27 tüm sahne geometrisini korur; yalnız kutu dönüşü ve sonrası saatler yeniden yazıldı. Ray dönüşte sabit, sonra ileri; GJK kaynak gövde konveks zarflarıyla değişen yolda çarpışma0, kutu yatay, hız/ivme kontrolü geçti. 2 koşu aynı, 8 klip. Diğer görevler, gerçek kavrama ve tüm donanım pozisyon/dinamik/güvenlik onayı halen açık. Yeni makine birleşince 94→95→96→97 sırasıyla aynı güncel girdiden yeniden üretilir.
