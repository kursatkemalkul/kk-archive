/* İKİZ · ZAMAN ÇUBUĞU (IKIZ-ARAYUZ-1, 1. aşama, 10 Eki) — 3B'yi geri sarma / ileri alma. Yalnız programın KAYDEDİLMİŞ GERÇEK karelerini gösterir (zaman çizelgesiyle sahte hareket yok).
   Kayıt: ikiz/durum en çok 20 Hz (12 000 kare); robot ölçüleri kendi zamanlarıyla ayrı halkada tutulur. Dünya/oturum değişince ikisi de sıfırlanır.
   Oynatmada canlı kareler kayda yazılmaya devam eder ama sahneyi sürmez; program ve robot seçilen kayıt zamanında örneklenir. HUD 'KAYIT t = … s' etiketi zorunlu.
   Sağ paneldeki ekranlar canlı kalır; çubuk yalnız 3B'yi sarar. */
import { kareArasi, robotArasi } from './kare.js';
export function zamanKur({ IKIZ, surucuAl }) {
  const KAP = 12000; // Harici PLC kayıtlarının doğrulama sınırı.
  const dokunmatik = (typeof matchMedia === 'function' && matchMedia('(pointer:coarse)').matches) || (typeof navigator !== 'undefined' && navigator.maxTouchPoints > 1);
  const ARALIK_MS = dokunmatik ? 100 : 50, BELLEK_SINIRI = (dokunmatik ? 16 : 64) * 1024 * 1024;
  const canliTampon = [], robotTampon = []; let tampon = canliTampon, disBaslik = '', disBitti = null;
  let sonYazma = 0, dunya = null, mod = 'canli', tK = 0, oynuyor = false, hiz = 1, sonRaf = 0, kayitBayt = 0;
  IKIZ.zamanModu = 'canli';
  IKIZ.zamanHazirlaniyor = false;
  const css = document.createElement('style');
  css.textContent = `#zamanSerit{position:absolute;z-index:4;left:0;right:0;bottom:0;height:44px;display:flex;align-items:center;gap:6px;padding:0 10px;background:#0f1215e8;border-top:1px solid #2a2f36;color:#d9dde2;font:600 12px system-ui}
#zamanSerit button,#zamanSerit select{background:#1d2228;color:#d9dde2;border:1px solid #39414b;border-radius:6px;height:28px;padding:0 9px;cursor:pointer;font:600 12px system-ui}
#zamanSerit input[type=range]{flex:1;min-width:80px}#zamanSerit .etiket{min-width:150px;text-align:right;font:700 12px ui-monospace,Consolas,monospace}
#zamanSerit.kayit .etiket{color:#ffb15c}#zamanSerit.kayit{border-top-color:#f08a24}
body.zamanVar #hudAlt{bottom:52px!important}body.zamanVar #araclar{bottom:52px!important}body.kayitModu #hudUst{border-color:#f08a24!important;box-shadow:0 0 0 2px #f08a2455}`;
  document.head.append(css); document.body.classList.add('zamanVar');
  const s = document.createElement('div'); s.id = 'zamanSerit';
  s.innerHTML = `<button id="zGeri" title="10 s geri">⏮ −10 s</button><button id="zOyna" title="Geçmiş kaydı oynat / duraklat; makineyi başlatmaz">▶</button><button id="zIleri" title="10 s ileri">+10 s ⏭</button>
<input id="zKay" type="range" min="0" max="1" step="0.1" value="1" aria-label="Kaydedilmiş görüntünün zamanı"><select id="zHiz" aria-label="Görüntü hızı"><option value="0.25">×0,25</option><option value="1" selected>×1</option><option value="4">×4</option><option value="10">×10</option><option value="30">×30</option></select>
<button id="zCanli" title="Kaydı kapatıp çalışan makinenin şu anına dön">Makineye dön</button><span class="etiket" id="zEt">CANLI</span>`;
  document.getElementById('sahne').append(s);
  const $ = id => s.querySelector('#' + id);
  // OrbitControls must never treat timeline dragging as a camera gesture.
  for (const type of ['pointerdown','pointermove','pointerup','wheel','click']) s.addEventListener(type, e => e.stopPropagation());
  function hizGoster() {
    const kayit = mod === 'kayit', value = kayit ? hiz : (+IKIZ.son?.hiz || 1);
    const select=$('zHiz');
    // Automatic tours can request a temporary speed outside the manual list.
    // Show that acknowledged speed; remove the temporary option on return.
    for(const option of [...select.options])if(option.dataset.liveSpeed==='1'&&+option.value!==value)option.remove();
    if(![...select.options].some(option=>+option.value===value)){
      const option=document.createElement('option');option.value=String(value);option.textContent=`×${value}`;
      option.dataset.liveSpeed='1';option.disabled=true;select.append(option);
    }
    select.value=String(value);
    $('zHiz').title = kayit ? 'Kayıt oynatma hızı; çalışan makineyi etkilemez' : 'Çalışan Digital Twin hızı';
    document.querySelectorAll('#araclar [data-hiz]').forEach(b => {
      b.classList.toggle('ak', +b.dataset.hiz === value);
      b.title = kayit ? `Kaydı ×${b.dataset.hiz} hızında izle` : `Digital Twin hızını ×${b.dataset.hiz} yap`;
    });
    $('zCanli').disabled = !kayit && !IKIZ.goruntuSaati?.().esitleme_gerekli;
  }
  function etiketGoster() {
    const f = IKIZ.kayitKare; if (mod !== 'kayit' || !f || isleniyor) return;
    $('zEt').textContent = (disBaslik ? 'PLC KAYDI · ' : 'KAYIT t = ') + f.t.toFixed(1).replace('.', ',') + ' s' + (oynuyor ? ` · ×${hiz}` : ' · duraklatıldı');
  }
  function duraklat() { oynuyor = false; $('zOyna').textContent = '▶'; etiketGoster(); }
  function hizSec(value) {
    value = +value; if (![.25,1,4,10,30].includes(value)) return;
    if (mod === 'kayit') { hiz = value; sonRaf = performance.now(); }
    else IKIZ.kontrol?.({tip:'hiz',hiz:value});
    hizGoster(); etiketGoster();
  }


  let nesil = 0, sonCizilen = null, isleniyor = false, sonGosterim = null, surukleniyor = false;
  function ortam(f) { return `${f.oturum || ''}:${f.dunya ?? ''}`; }
  function kaydet(f) {
    const tampon = canliTampon;
    const yeni = ortam(f) !== dunya;
    if (yeni) {
      disKayitKapat();
      dunya = ortam(f); tampon.length = 0; kayitBayt = 0; robotTampon.length = 0; sonCizilen = null; sonGosterim = null; nesil++; isleniyor = false; surukleniyor = false;
      mod = 'canli'; IKIZ.zamanModu = 'canli'; IKIZ.kayitKare = null; oynuyor = false;
      s.classList.remove('kayit'); document.body.classList.remove('kayitModu');
      IKIZ.zamanHazirlaniyor = false;
      sonYazma = 0; tK = 0; $('zOyna').textContent = '▶';
    }
    const n = performance.now();
    if (!yeni && n - sonYazma < ARALIK_MS - 5) return;
    if (tampon.length && !(+f.t > tampon[tampon.length - 1].t)) { ayarla(); return; }
    sonYazma = n;
    // Robot ve program farklı hızlarda yayın yapar. Tam zaman eşleşmesi şartı
    // robot ölçülerini düşürüp kayıtta kavramayı/duruşu bir karede sıfırlıyordu.
    if (IKIZ.robotSon) robotKaydet(IKIZ.robotSon);
    const bayt = JSON.stringify(f).length * 2; // UTF-16 yükü; her karenin gerçek büyüklüğüne göre sınırla.
    tampon.push({ t: +f.t || 0, f: structuredClone(f), bayt }); kayitBayt += bayt;
    while (tampon.length > 1 && (tampon.length > KAP || kayitBayt > BELLEK_SINIRI)) kayitBayt -= tampon.shift().bayt;
    while (robotTampon.length > 1 && robotTampon[1].t < tampon[0].t) robotTampon.shift();
    IKIZ.kayitBoy = Math.round(kayitBayt / 1024) + ' KB';
    IKIZ.kayitBellek = { bayt: kayitBayt, sinir: BELLEK_SINIRI, kare: tampon.length };
    ayarla();
  }
  function son() { return tampon.length ? tampon[tampon.length - 1].t : 0; }
  // Bağımsız ölçü akışı: geç gelen ve program örnekleri arasındaki robot pozları da saklanır.
  function robotKaydet(r) {
    if (!Number.isFinite(r?.t)) return;
    let a = 0, b = robotTampon.length;
    while (a < b) { const m = (a + b) >> 1; if (robotTampon[m].t < r.t) a = m + 1; else b = m; }
    if (robotTampon[a]?.t === r.t) robotTampon[a] = structuredClone(r);
    else robotTampon.splice(a, 0, structuredClone(r));
    if (robotTampon.length > KAP * 4) robotTampon.shift();
  }
  function robotBul(t) {
    let a = 0, b = robotTampon.length - 1, i = -1;
    while (a <= b) { const m = (a + b) >> 1; if (robotTampon[m].t <= t) { i = m; a = m + 1; } else b = m - 1; }
    return i < 0 ? null : robotArasi(robotTampon[i], robotTampon[i + 1], t);
  }
  const kareRobotu = f => Object.hasOwn(f, 'robot_poz') ? f.robot_poz : robotBul(f.t);
  function ayarla() {
    const yeterli = tampon.length > 1 && son() - tampon[0].t >= 0.5;
    hizGoster();
    for (const id of ['zKay', 'zGeri', 'zIleri', 'zOyna']) $(id).disabled = !yeterli;
    if (!tampon.length) { $('zEt').textContent = 'MAKİNE · kayıt yok'; return; }
    const k = $('zKay'); k.min = tampon[0].t; k.max = son();
    k.title = `Kayıt aralığı: ${tampon[0].t.toFixed(1)} – ${son().toFixed(1)} s`;
    if (mod === 'canli') {
      k.value = k.max;
      $('zEt').textContent = IKIZ.goruntuSaati?.().esitleme_gerekli ? 'Görüntü gecikti · Makineye dön' : (yeterli ? `MAKİNE · ${IKIZ.son?.duraklat ? 'duraklatıldı' : 'şimdi'}` : `MAKİNE · ${IKIZ.son?.duraklat ? 'Başlat bekleniyor' : 'şimdi'}`);
    }
  }
  function bul(t) {
    let a = 0, b = tampon.length - 1;
    if (b < 0) return -1;
    while (a < b) { const m = Math.ceil((a + b) / 2); if (tampon[m].t <= t) a = m; else b = m - 1; }
    return a;
  }
  // Kesilme, doz birikmesi ve kutu kavrama geçmişe bağlıdır. Geri seek'te
  // görünüm önbelleği temizlenir; kaydedilmiş gerçek kareler sırayla işlenir.
  // Robot ve program farklı anlardan harmanlanmaz; istasyon FB'leri çalıştırılmaz.
  async function kareCiz(t, canliDon = false) {
    const S = surucuAl(), hedef = bul(t);
    if (!S || hedef < 0) return;
    // An interrupted rebuild may already have applied frames past the new
    // target, even though that target is ahead of the last committed image.
    if (isleniyor || (sonGosterim != null && t < sonGosterim - 1e-9)) sonCizilen = null;
    const id = ++nesil, liste = tampon.slice(0, hedef + 1);
    let bas = sonCizilen ? liste.indexOf(sonCizilen) + 1 : 0;
    if (!sonCizilen || bas === 0) { S.temizle(); bas = 0; }
    isleniyor = true;
    // Keep the last fully rendered image until this transaction commits.
    // Timeline code must never change the user's layer/root visibility.
    IKIZ.zamanHazirlaniyor = true;
    try {
    if (liste.length - bas > 64) $('zEt').textContent = `KAYIT · ${t.toFixed(1).replace('.', ',')} s hazırlanıyor…`;
    for (let i = bas; i < liste.length; i++) {
      if (id !== nesil) return;
      const k = liste[i]; S.kareUygula(k.f, kareRobotu(k.f)); sonCizilen = k;
      if ((i - bas + 1) % 64 === 0) await new Promise(requestAnimationFrame);
    }
    if (id !== nesil) return;
    const k = liste[liste.length - 1], next = tampon[hedef + 1];
    const f = next ? kareArasi(k.f, next.f, t) : k.f;
    // Aynı program karesine sonradan robot ölçüsü eklenmiş de olabilir.
    S.kareUygula(f, kareRobotu(f));
    sonGosterim = f.t;
    IKIZ.kayitKare = f; if (!oynuyor) tK = f.t; $('zKay').value = t;
    IKIZ.kayitHud?.(f);
    $('zEt').textContent = (disBaslik ? 'PLC KAYDI · ' : 'KAYIT t = ') + f.t.toFixed(1).replace('.', ',') + ' s' + (oynuyor ? ` · ×${hiz}` : ' · duraklatıldı');
    $('zEt').title = disBaslik;
    if (canliDon) {
      // Uzun geri sarma hazırlanırken gelen canlı karelerin doz/kesim olaylarını da işle.
      const sonIndex = tampon.indexOf(sonCizilen);
      if (sonIndex >= 0) for (const yeni of tampon.slice(sonIndex + 1)) { S.kareUygula(yeni.f, kareRobotu(yeni.f)); sonCizilen = yeni; }
      mod = 'canli'; IKIZ.zamanModu = 'canli'; IKIZ.kayitKare = null;
      s.classList.remove('kayit'); document.body.classList.remove('kayitModu');
      if (IKIZ.son) { S.kareUygula(IKIZ.son, kareRobotu(IKIZ.son)); IKIZ.kayitHud?.(IKIZ.son); }
      IKIZ.canliyaDon?.();
      ayarla();
    }
    } catch (error) {
      if (id === nesil) { sonCizilen = null; sonGosterim = null; }
      throw error;
    } finally {
      // A superseded job must not unlock the newer job's render transaction.
      if (id === nesil) { isleniyor = false; IKIZ.zamanHazirlaniyor = false; }
    }
  }
  async function git(t) {
    if (tampon.length < 2 || son() - tampon[0].t < 0.5) { ayarla(); return; }
    IKIZ.zamanBakisiniKoru?.();
    // Canlı sürücü son oynatma karesinden sonra ilerlemiş olabilir. İlk seek daima temiz kurulur.
    if (mod === 'canli') sonCizilen = null;
    mod = 'kayit'; IKIZ.zamanModu = 'kayit'; s.classList.add('kayit'); document.body.classList.add('kayitModu');
    hizGoster();
    tK = Math.min(son(), Math.max(tampon[0].t, t));
    return kareCiz(tK);
  }
  async function canli() {
    oynuyor = false; $('zOyna').textContent = '▶';
    if (mod === 'canli') { IKIZ.canliyaDon?.(); ayarla(); return; }
    disKayitKapat();
    sonCizilen = null; sonGosterim = null;
    if (!tampon.length) {
      nesil++; isleniyor = false; mod = 'canli'; IKIZ.zamanModu = 'canli'; IKIZ.kayitKare = null;
      s.classList.remove('kayit'); document.body.classList.remove('kayitModu');
      const S = surucuAl(); S?.temizle();
      if (IKIZ.son) { S?.kareUygula(IKIZ.son, kareRobotu(IKIZ.son)); IKIZ.kayitHud?.(IKIZ.son); }
      IKIZ.zamanHazirlaniyor = false;
      IKIZ.canliyaDon?.(); ayarla(); return;
    }
    IKIZ.zamanBakisiniKoru?.();
    mod = 'kayit'; IKIZ.zamanModu = 'kayit';
    return kareCiz(son(), true);
  }
  function disKayitKapat() {
    if (tampon !== canliTampon) { tampon = canliTampon; sonCizilen = null; sonGosterim = null; }
    disBaslik = ''; disBitti = null;
  }
  async function kayitAc(frames, baslik, options = {}) {
    if (!Array.isArray(frames) || frames.length < 2 || frames.length > KAP) throw new Error('PLC kayıt kareleri geçersiz');
    const world = ortam(frames[0]), next = [];
    for (const f of frames) {
      if (!Number.isFinite(f.t) || ortam(f) !== world || !Object.hasOwn(f, 'robot_poz')) throw new Error('PLC kaydında eşzamanlı robot karesi yok');
      if (next.length && f.t < next.at(-1).t) throw new Error('PLC kaydının zamanı sıralı değil');
      const k = { t: f.t, f };
      if (next.at(-1)?.t === f.t) next[next.length - 1] = k; else next.push(k);
    }
    tampon = next; disBaslik = String(baslik || 'PLC doğrulaması'); disBitti = options.onEnd || null;
    sonCizilen = null; sonGosterim = null; oynuyor = false; ayarla();
    await git(next[0].t);
    oynuyor = options.oynat !== false; $('zOyna').textContent = oynuyor ? '⏸' : '▶'; sonRaf = performance.now(); etiketGoster();
  }
  $('zKay').onpointerdown = e => { if(e.pointerId != null) e.target.setPointerCapture?.(e.pointerId); surukleniyor = true; oynuyor = false; $('zOyna').textContent = '▶'; return git(+e.target.value); };
  $('zKay').onpointerup = $('zKay').onpointercancel = $('zKay').onlostpointercapture = () => { surukleniyor = false; };
  $('zKay').oninput = e => { oynuyor = false; $('zOyna').textContent = '▶'; return git(+e.target.value); };
  $('zGeri').onclick = () => { duraklat(); return git((mod === 'kayit' ? tK : son()) - 10); };
  $('zIleri').onclick = () => { duraklat(); return git((mod === 'kayit' ? tK : son()) + 10); };
  $('zCanli').onclick = canli;
  $('zHiz').onchange = e => hizSec(e.target.value);
  $('zOyna').onclick = async () => {
    if (tampon.length < 2) return;
    if (mod === 'canli') await git(son() - 30);
    else if (!oynuyor && tK >= son()) await git(tampon[0].t);
    oynuyor = !oynuyor; $('zOyna').textContent = oynuyor ? '⏸' : '▶'; sonRaf = performance.now(); etiketGoster();
  };
  (function dongu(n) {
    requestAnimationFrame(dongu);
    if (mod !== 'kayit' || !oynuyor || isleniyor || surukleniyor) { sonRaf = n; return; }
    const dt = Math.min(0.1, (n - sonRaf) / 1000); sonRaf = n;
    tK += dt * hiz; // Recorded timestamps already include the live machine clock.
    const ended = tK >= son();
    if (ended) { tK = son(); oynuyor = false; $('zOyna').textContent = '▶'; }
    const done = ended ? disBitti : null; if (ended) disBitti = null;
    kareCiz(tK).then(() => { if(mod==='kayit'&&disBaslik)done?.(); });
  })(performance.now());
  IKIZ.zaman = { git, canli, kayitAc, hizSec, duraklat, mod: () => mod, kareSay: () => tampon.length, ilk: () => (tampon[0] || {}).t, son, kayitKare: () => IKIZ.kayitKare };
  ayarla();
  return { kaydet, robotKaydet, kayitta: () => mod === 'kayit' };
}
