import { frameContract27, frameBagla27 } from './frame_registry27.js';
import { robotStatus } from './robot_status.js';
import { gorselKare27 } from './frame27.js';
import { konumBagla27 } from './konum27.js';
import { makineKapakKur } from './makine_kapaklari.js';
import { yuklemeHatasi } from './yeni_makine/yukleme27.js?v=27eki-1';
import './ic_kablo_gizle71.js';   // Kemal 22 Eki: makine içi kablo / kanal / hortum görünmez (yalnız görsel)
import './elk_ana_hat70.js';   // YÖNETİCİ 21 Eki: ana hat E beyninden zemin kanalıyla robot hücresine
import {cepheOcclusion67} from './cephe_occlusion67.js';
import { senaryoKur } from './senaryolar_panel.js?v=20261017-scenarios1';
import { siparisTuruKur } from './siparis_turu.js?v=20261031-efold3';
import * as THREE from 'three';
import { GLTFLoader } from './vendor/GLTFLoader.js';
import { MeshoptDecoder } from './vendor/meshopt_decoder.module.js';
import { OrbitControls } from './vendor/OrbitControls.js';
import { Mqtt, metin } from './mqtt-ws.js';
import { surucuKur } from './surucu.js?v=44-1';
import { gezintiKur } from './gezinti.js';
import { eskiDukkanGizle } from './dukkan.js?v=bace02727fe6';
import { kodPanelKur } from './kodpanel.js';
import { tiklamaKur } from './tiklama.js';
import { zamanKur } from './zaman.js';
import { robotKameraKur } from './robot_kamera.js';
import { tatliDogrulamaKur } from './tatli_dogrulama.js';
import { canliKareKur, tablaOlcumKur } from './kare.js?v=9d87af0fb3c4';

// Opening or refreshing any viewer must preserve the running PLC and other
// sessions. Only the explicit Reset action below may reset the Digital Twin.
const dokunmatik = matchMedia('(pointer:coarse)').matches || navigator.maxTouchPoints > 1 || (typeof location !== 'undefined' && new URLSearchParams(location.search).get('render') === 'tablet');
// MQTT yeniden bağlanması veya yeni bir sekme açılması sıfırlama değildir.
function eskiDenemeEkranlariniTemizle() {
  for (const k of ['ak.gecmis', 'ak.sepet']) { try { localStorage.removeItem(k); } catch (_) {} }
}
sessionStorage.removeItem('twin.resetDone');

const Q = new URLSearchParams(location.search);
const $ = id => document.getElementById(id);
window.addEventListener('twin:model-progress', e => {
  const d = e.detail || {}, mb = n => (n / 1048576).toFixed(0);
  const ek = /_ek_/.test(d.name || ''), arac = /tutucu/.test(d.name || '');
  const baslik = arac ? '3B robot tutucusu' : ek ? '3B ek parçalar' : '3B dükkân';
  if (d.phase === 'cdn') {
    $('yukleMetin').textContent = `${baslik} indiriliyor… ${mb(d.received)} / ${mb(d.total)} MB`;
    $('yukleCubuk').style.width = Math.min(99, d.received / Math.max(1, d.total) * 100) + '%';
  } else if (d.phase === 'fallback') {
    $('yukleMetin').textContent = `${baslik} bilgisayardan indiriliyor… bağlantı yavaş olabilir`;
    $('yukleCubuk').style.width = '0%';
  }
});
const OFS = (Number(location.port) || 8800) - 8800;                                // port takımı (10 Eki): 8800 → ofset 0 · 8820 → 20 (ws +1, sipariş 8790+ofset, HMI 8791+ofset)
const MQTT_URL = Q.get('mqtt') || `ws://${location.hostname || '127.0.0.1'}:${Q.get('wsport') || 8801 + OFS}`;
const MODEL = '../../hat3d/ikiz-v1/';                     // ENTEGRASYON ikiz web GLB + eşleme (köprü: claude/sabah otonom/hat3d/ikiz-v1)
const ON = 'autokitch/d1/';

/* ---------------------------------------------------------------- sağ panel: gerçek ekranlar (aynı kökenli, gerçek sipariş sunucusu) */
const HOST = location.hostname || '127.0.0.1', ARKA = `hmi=${HOST}:${8791 + OFS}&sip=${HOST}:${8790 + OFS}`;
const EKRANLAR = [
  ['KİOSK', '../musteri/index.html?mod=kiosk&hmi=yok'],
  ['WEB SİPARİŞ', '../musteri/index.html?hmi=yok'],
  ['SİPARİŞ TAKİBİ', '../musteri/takip.html?hmi=yok'],
  ['QR DOLAP', '../musteri/qr-pin.html?donanim=1'],
  ['MENÜ VE SİPARİŞ EKRANI', '../musteri/qr-ekran.html'],
  ['PERSONEL PANELİ', `../tablet/index.html?${ARKA}&pin=0000`],
  ['YÖNETİCİ', `../yonetici/index.html?${ARKA}&pin=1111`],
];
{
  const sek = $('sekmeler'), cer = $('cerceve');
  EKRANLAR.forEach(([ad, url], i) => {
    const b = document.createElement('button'); b.textContent = ad; b.dataset.i = i; sek.append(b);
    b.onclick = () => ac(i);
  });
  function ac(i) {
    [...sek.children].forEach((b, j) => b.classList.toggle('ak', j === i));
    if (!cer.querySelector(`iframe[data-i="${i}"]`)) {
      const f = document.createElement('iframe'); f.src = EKRANLAR[i][1]; f.title = EKRANLAR[i][0]; f.dataset.i = i; cer.append(f);
    }
    if (EKRANLAR[i][0] === 'SİPARİŞ TAKİBİ') { const f = cer.querySelector('iframe[data-i="2"]'); f.src = EKRANLAR[2][1]; }
    [...cer.children].forEach(x => x.classList.toggle('ak', +x.dataset.i === i));
  }
  window.IKIZ_EKRAN_AC = ac;
  window.IKIZ_BAKIM_HAZIRLA = async () => {
    let f=cer.querySelector('iframe[data-i="5"]');
    if(!f){f=document.createElement('iframe');f.src=EKRANLAR[5][1];f.title=EKRANLAR[5][0];f.dataset.i=5;cer.append(f);}
    const end=Date.now()+10000;
    while(!f.contentWindow?.TB?.girisYap&&Date.now()<end)await new Promise(r=>setTimeout(r,100));
    const tb=f.contentWindow?.TB;
    if(!tb)throw Error('Personel bağlantısı hazırlanamadı');
    if(!tb.yetkili('personel')){
      const pin=window.prompt('Kapağı açmak için personel PIN kodu:');
      if(!pin)throw Error('Kapak açma iptal edildi');
      await tb.girisYap(pin);
    }
  };
  ac(0);
}

/* ---------------------------------------------------------------- MQTT (WebSocket) */
const IKIZ = window.IKIZ = { son: null, kareler: 0, olaylar: [], eksikler: [], gosterilen: {}, mqttBagli: false, yuklendi: false, konsolHata: [], kancalar: [] };
IKIZ.THREE = THREE;                                              // denetim betikleri (Box3 vb.)
const mq = new Mqtt(MQTT_URL);
mq.abone(ON + 'ikiz/durum', 0); mq.abone(ON + 'ikiz/olay', 1); mq.abone(ON + 'ikiz/robot', 0); mq.abone(ON + 'ikiz/kod', 0); mq.abone(ON + 'dolap/olay', 1);   // dolap/olay: QR kod red / kilit (G/Ç qr.locked)   // ikiz/kod: kod paneli (K12)
mq.durum(b => { IKIZ.mqttBagli = b; $('baglanti').classList.toggle('var', !b); });
const tablaOlcum=tablaOlcumKur();
let surucu = null, kodP = null, zmn = null;                     // kodP: kod paneli (K-E-KODPANEL-6)
const canliGoruntu = canliKareKur({ uygula: (f,r) => {IKIZ.goruntuKaresi=f;surucu?.kareUygula(f,r);}, gecmiste: () => !!zmn?.kayitta() || !!IKIZ.sunumKareKontrol });
let goruntuHazirBitti=false,goruntuSonCizim=null,goruntuDuzgun=0,goruntuPaketCapa=null,goruntuTopluT=0;
function goruntuPaketAl(j){const n=performance.now();if(goruntuPaketCapa){const dw=(n-goruntuPaketCapa.n)/1000,ds=j.t-goruntuPaketCapa.t,rate=Number.isFinite(j.hiz)&&j.hiz>0?j.hiz:1;if(ds>dw*rate+.15){goruntuTopluT=n;goruntuPaketCapa={n,t:j.t};}else if(dw>.2)goruntuPaketCapa={n,t:j.t};}else goruntuPaketCapa={n,t:j.t};canliGoruntu.kaydet(j);if(!goruntuHazirBitti)canliGoruntu.yakala();}
function goruntuIlkCizim(){const n=performance.now();if(!IKIZ.yuklendi){goruntuSonCizim=null;goruntuDuzgun=0;return false;}if(goruntuHazirBitti)return true;goruntuDuzgun=goruntuSonCizim!=null&&n-goruntuSonCizim<5000?goruntuDuzgun+1:0;goruntuSonCizim=n;goruntuHazirBitti=goruntuDuzgun>=3&&n-goruntuTopluT>1000;IKIZ.goruntuHazirlik={hazir:goruntuHazirBitti,duzgun:goruntuDuzgun,son_toplu_ms:goruntuTopluT};return goruntuHazirBitti;}
IKIZ.kancalar.push(() => {if(!goruntuIlkCizim())canliGoruntu.yakala();else $('yukle')?.remove();canliGoruntu.tik();if(!IKIZ.sunumKareKontrol)IKIZ.son=(zmn?.kayitta()?IKIZ.kayitKare:IKIZ.goruntuKaresi)||IKIZ.son;});
IKIZ.canliyaDon = () => canliGoruntu.yakala();
IKIZ.goruntuSaati = () => canliGoruntu.durum();
let acilisHiziAyarlandi = false;
mq.dinle((konu, yuk) => {
  let j; try { j = JSON.parse(metin(yuk)); } catch (e) { return; }
  if (konu.endsWith('ikiz/durum') && !acilisHiziAyarlandi) {
    acilisHiziAyarlandi = true;
    mq.yayinla(ON + 'ikiz/kontrol', JSON.stringify({tip:'hiz',hiz:1}));
  }
  if (konu.endsWith('ikiz/durum')) { IKIZ.hamPlcKaresi=j; j=gorselKare27(j); tablaOlcum(j); if (IKIZ.canliSon && (IKIZ.canliSon.dunya !== j.dunya || IKIZ.canliSon.oturum !== j.oturum)) { IKIZ.robotSon = null; surucu?.temizle(); canliGoruntu.temizle(); } IKIZ.son = j; IKIZ.canliSon = j; if(!zmn?.kayitta())surucu?.olcumKaydet(j); goruntuPaketAl(j); IKIZ.kareler++; IKIZ.sonKareT = performance.now(); if (zmn) zmn.kaydet(j); if (!(zmn && zmn.kayitta())) { hudYaz(j); if (kodP) kodP.durumKaresi(j); } otomatikEl(j); if (IKIZ.kareKanca) IKIZ.kareKanca(j); }
  else if (konu.endsWith('ikiz/kod')) { if (kodP) kodP.kodMesaji(j); }
  else if (konu.endsWith('dolap/olay')) { if (/^qr\.(code_rejected|locked)$/.test(j.tip || '')) { IKIZ.qrOlay = (IKIZ.qrOlay || []).concat([j]).slice(-20); otomatikElOlay(j); } }
  else if (konu.endsWith('ikiz/olay')) { IKIZ.olaylar.push(j); if (IKIZ.olaylar.length > 2000) IKIZ.olaylar.shift(); olayYaz(j); otomatikElOlay(j); if (IKIZ.olayKanca) IKIZ.olayKanca(j); }
  else if (konu.endsWith('ikiz/robot')) { if (IKIZ.son && (j.t > IKIZ.son.t + Math.max(0.1, (IKIZ.son.hiz || 1) * 0.12) || (j.oturum != null && j.oturum !== IKIZ.son.oturum) || (j.dunya != null && j.dunya !== IKIZ.son.dunya))) return;   /* Kemal 2 Kas (#5): sık robot kareleri durum karesinin hız×0,12 s önüne kadar kabul */ IKIZ.robotSon = j; canliGoruntu.robotKaydet(j); zmn?.robotKaydet(j); IKIZ.robotKare = (IKIZ.robotKare || 0) + 1; }
});
mq.baglan();
const kontrol = y => mq.yayinla(ON + 'ikiz/kontrol', JSON.stringify(y));
/* IKIZ-ARAYUZ-7 (10 Eki): DOLDURMA rolünde 'otomatik el' — yalnız ikizde (gerçekte personelin eli), olay günlüğüne ikiz.mudahale olarak yazılır (beyin yazar).
   Kırmızı çizgi: kapak YALNIZ dolum HAZIR iken (istasyon STO'da) açılır — HAZIR'dan önce açmak KAPI_URUN ihlali. TOP / E / K kapakları (beynin ikiz.kapi kapsamı). */
const EL_KAPAK = ['TOP', 'E', 'K'], el = { acik: {}, zaman: {} };
IKIZ.otomatikEl = el;
function otomatikEl(j) {
  if (!IKIZ.gezinti || IKIZ.gezinti.rol !== 'doldurma') return;
  const d = j.dolum || {};
  for (const k of EL_KAPAK) {
    if (d[k] === 'HAZIR' && !el.acik[k] && !el.zaman[k]) el.zaman[k] = setTimeout(() => { el.zaman[k] = null; if (((IKIZ.son || {}).dolum || {})[k] === 'HAZIR') { kontrol({ tip: 'ikiz.kapi', istasyon: k, acik: true }); el.acik[k] = true; } }, 2000);
    if (!d[k]) { el.acik[k] = false; if (el.zaman[k]) { clearTimeout(el.zaman[k]); el.zaman[k] = null; } }
  }
}
function otomatikElOlay(o) {
  if (o && /qr\.(code_rejected|locked)$/.test(o.tip || '') && IKIZ.kodRed) IKIZ.kodRed(o);          // QR-5: tuş takımında yanlış kod → ipucu satırı                                          // tabletten 'ürünleri koydum' (ikiz.doldur) → 3 s sonra kapak kapanır
  if (!IKIZ.gezinti || IKIZ.gezinti.rol !== 'doldurma') return;
  if (o && o.tip === 'ikiz.mudahale' && o.komut === 'ikiz.doldur' && EL_KAPAK.includes(o.istasyon) && el.acik[o.istasyon])
    setTimeout(() => { kontrol({ tip: 'ikiz.kapi', istasyon: o.istasyon, acik: false }); el.acik[o.istasyon] = false; }, 3000);
}
IKIZ.kontrol = kontrol;
tatliDogrulamaKur(IKIZ);
document.querySelectorAll('#araclar [data-hiz]').forEach(b => b.onclick = () => IKIZ.zaman?.hizSec(+b.dataset.hiz));
let dur = false;
IKIZ.washKomut=(parca,acik)=>kontrol({tip:'ikiz.wash',parca,acik:!!acik});
IKIZ.kapakKomut=(id,ac,basili=false)=>{mq.yayinla(ON+'makine/komut',JSON.stringify({tip:'inceleme.kapak',goz:id,ac,basili}));};
IKIZ.baslat = () => { mq.yayinla(ON + 'makine/komut', JSON.stringify({ tip: 'hat.baslat' })); kontrol({ tip: 'devam' }); };
IKIZ.reset = async () => {
  const b = $('resetBtn'); b.disabled = true; b.textContent = 'Sıfırlanıyor…';
  try {
    if (IKIZ.gosteri) IKIZ.gosteri.dur = true;
    const r = await fetch('/digital-twin/reset', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
    if (!r.ok) throw new Error('Reset isteği alınamadı');
    let resetState = await r.json();
    while (resetState.waiting) {
      await new Promise(resolve => setTimeout(resolve, 750));
      const status = await fetch('/digital-twin/reset/status', {cache:'no-store'});
      if (!status.ok) throw new Error('Reset bağlantısı kesildi; tekrar dene');
      resetState = await status.json();
      if (resetState.error) throw new Error(resetState.error);
    }
    if (!resetState.result?.ok) throw new Error('Reset teyidi alınamadı');
    eskiDenemeEkranlariniTemizle(); sessionStorage.setItem('twin.resetDone', '1'); location.reload();
  } catch (e) { b.disabled = false; b.textContent = 'Reset · tekrar dene'; b.title = e.message; }
};
$('resetBtn').onclick = IKIZ.reset;
IKIZ.kayitHud = f => { hudYaz(f); if (kodP) kodP.durumKaresi(f); };
$('dur').onclick = () => { if (dur) IKIZ.baslat(); else kontrol({ tip: 'duraklat' }); };

/* ---------------------------------------------------------------- HUD */
const HAT_AD = { KAPALI: 'kapalı', ISINMA: 'ısınıyor', BOSTA: 'boşta', SIPARIS: 'sipariş', HATA: 'hata', TEMIZLIK: 'temizlik', SERVIS: 'servis' };
/* ELESTIRMEN-EK18 (10 Eki): robot siminin dogrulandi=false karesi (çarpışma denetimsiz geçiş / doğrulanmamış hamur çekmecesi) HUD'da KIRMIZI + koşu boyu oranı */
function robotDogrulama() {
  // C 11 Eki 06:5x: tek "%35–47 denetimsiz" yanıltıcıydı — 9689b7be hız sınırı karelerini de dogrulandi=false yapıyor (föy hızıyla ilerleme, AŞIM DEĞİL). Nedene göre ayrı oran.
  const rs = IKIZ.robotSur || {}, rb = IKIZ.robotSon || {}, N = rs.neden || {}, n = rs.sayi || 0, yz = k => n ? (100 * (N[k] || 0) / n).toFixed(1) : '0.0';
  const simdi = rb.dogrulandi === false ? (IKIZ.robotNeden ? IKIZ.robotNeden(rb) : 'gecis') : null;
  const ad = { hiz: 'hız sınırı', gecis: 'denetimsiz geçiş', diger: 'doğrulanmamış' };   // kısa (HUD kod şeridini örtmesin); 'aşım değil' açıklaması title'da
  return `<div class="sat"><span class="sol">robot doğrulama</span><b class="${(N.gecis || N.diger) ? 'bilgi' : ''}" style="${simdi === 'gecis' ? 'color:#ff6b5e' : simdi === 'hiz' ? 'color:#f2c14e' : simdi === 'diger' ? 'color:#7fb4ff' : ''}" title="Robot simi dogrulandi=false nedenleri (dogrulama_neden): hız sınırı = föy hızıyla ilerleme, AŞIM DEĞİL (sarı) · geçiş = görevler arası / PARK segmenti çarpışma denetiminden geçmedi (Robot v8 ile kalkar) — bilgi">${simdi ? ad[simdi] : 'doğrulanmış'} · geçiş %${yz('gecis')} · hız %${yz('hiz')}${N.diger ? ' · diğer %' + yz('diger') : ''}</b></div>`;
}
function hudYaz(f) {
  dur = !!(IKIZ.son || f).duraklat; IKIZ.duraklatildi = dur;
  $('dur').textContent = dur ? 'Başlat' : 'Duraklat';
  const r = f.robot || {};
  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const sat = (a, d, c = '') => `<div class="sat"><span class="sol">${esc(a)}</span><b class="${c}">${esc(d)}</b></div>`;
  $('ustSatir').innerHTML = sat('kontrol', f.plc_controller?.engine === 'COMPILED_ST' ? 'PLC · MAIN (ST)' : 'kontrol bekleniyor') + sat('Digital Twin zamanı', (+f.t).toFixed(1) + ' s') + sat('hız', '×' + f.hiz + (f.hiz_gercek ? ` (ölçülen ×${(+f.hiz_gercek).toFixed(1)})` : '')) + sat('hat', HAT_AD[f.hat] || f.hat) +
    sat('kuyruk', f.kuyruk) + sat('fırın', (+f.firin_c).toFixed(0) + ' °C') + sat('robot', robotStatus(f)) +
    (f.robot_diagnostics?.order_start?.oldest_wait_wall_s != null ? sat('üretime başlama bekleyişi', f.robot_diagnostics.order_start.oldest_wait_wall_s + ' gerçek s') : '') +
    sat('ihlal', f.ihlal, f.ihlal ? 'uyari' : '') + sat('alarm', (f.alarmlar || []).join(', ') || '—', (f.alarmlar || []).length ? 'uyari' : '') + sat('görüntü', IKIZ.fps ? `${IKIZ.fps} FPS` : 'ölçülüyor') + robotDogrulama();
  const g = $('gozler'); if (!g.children.length) for (let i = 1; i <= 12; i++) { const d = document.createElement('div'); d.id = 'goz' + i; g.append(d); }
  for (let i = 1; i <= 12; i++) {
    const q = (f.qr || {})[i] || {}, d = $('goz' + i);
    d.className = (q.dolu ? 'dolu ' : '') + (q.kapi === 0 ? 'acik' : '');
    d.textContent = `G${(globalThis.AK_GOZ?.etiket||(x=>x))(i)} ` + (q.kapi === 0 ? 'AÇIK' : q.kilit ? 'kilit' : 'serbest') + (q.dolu ? ' ●' : '');
  }
}
function olayYaz(o) {
  const el = $('olaylar'), d = document.createElement('div');
  d.textContent = `${(+o.t).toFixed(0).padStart(5)} s  ${o.tip}${o.gorev ? ' ' + o.gorev : ''}${o.etiket ? ' ' + o.etiket : ''}${o.nereye ? ' → ' + o.nereye : ''}${o.kod ? ' ' + o.kod : ''}`;
  el.prepend(d); while (el.children.length > 14) el.lastChild.remove();
}

/* ---------------------------------------------------------------- 3B sahne */
const kanvas = $('kanvas');
const renderer = new THREE.WebGLRenderer({ canvas: kanvas, alpha: true, antialias: !dokunmatik, powerPreference: 'high-performance', preserveDrawingBuffer: false });
const gpuBilgi = renderer.getContext().getExtension('WEBGL_debug_renderer_info');
kanvas.dataset.gpu = gpuBilgi ? renderer.getContext().getParameter(gpuBilgi.UNMASKED_RENDERER_WEBGL) : 'bilinmiyor';
renderer.setPixelRatio(Math.min(devicePixelRatio, dokunmatik ? 1 : 1.5)); renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
const scene = new THREE.Scene(); scene.background = new THREE.Color(0x1a2029);
scene.add(new THREE.HemisphereLight(0xdfe8f5, 0x3a3f48, 1.1));
const gunes = new THREE.DirectionalLight(0xffffff, 2.2); gunes.position.set(4, 7, 5); scene.add(gunes);
const gunes2 = new THREE.DirectionalLight(0xbfd2ff, 0.9); gunes2.position.set(-5, 4, -4); scene.add(gunes2);
const kamera = new THREE.PerspectiveCamera(45, 1, 0.05, 80); kamera.position.set(3.2, 2.4, 5.6); IKIZ.kamera = kamera;   // ölçüm (tanı / kabul) için
const kontrolOrbit = new OrbitControls(kamera, kanvas); kontrolOrbit.enableDamping = true; kontrolOrbit.target.set(2.9, 0.6, 1.4); kamera.position.set(7.4, 4.6, 7.6);
function boyut() { const r = kanvas.parentElement.getBoundingClientRect(); if(r.width<=0||r.height<=0)return; renderer.setSize(r.width, r.height, false); kamera.aspect = r.width / r.height;
  // Keep the horizontal field of view on tall frames without moving the camera.
  kamera.fov=2*Math.atan(Math.tan(Math.PI/8)/Math.min(1,kamera.aspect))*180/Math.PI;kamera.updateProjectionMatrix(); }
addEventListener('resize', boyut); boyut();
new ResizeObserver(boyut).observe(kanvas.parentElement);
/* IKIZ-ARAYUZ-2: sağ panel gizle / aç — düğme + P (W A S D E Esc ile çakışmaz); seçim localStorage 'ikiz.panel' */
function panelAyar(gizli) { document.body.classList.toggle('panelGizli', gizli); const b = $('panelBtn'); if (b) b.textContent = gizli ? 'Panel ⟨' : 'Panel ⟩'; boyut(); IKIZ.panelGizli = gizli;
  try { localStorage.setItem('ikiz.panel', gizli ? 'gizli' : 'acik'); } catch (x) { /* özel pencere */ } }
IKIZ.panelAyar = panelAyar;
$('panelBtn').onclick = () => panelAyar(!document.body.classList.contains('panelGizli'));
addEventListener('keydown', e => { if (e.code !== 'KeyP' || e.ctrlKey || e.metaKey || e.altKey) return; const t = e.target && e.target.tagName; if (t === 'INPUT' || t === 'TEXTAREA' || t === 'SELECT') return; panelAyar(!document.body.classList.contains('panelGizli')); });
// Kemal 2 Kas (#1): sağdaki ekranlar açılışta KAPALI gelir; "Panel" düğmesi / P ile açılır, seçim kalıcıdır.
try { if (localStorage.getItem('ikiz.panel') !== 'acik') panelAyar(true); } catch (x) { panelAyar(true); }
IKIZ.sahne = { THREE, scene, kamera, renderer, kontrol: kontrolOrbit };
const gz = gezintiKur({ IKIZ, scene, kamera, renderer, kanvas, orbit: kontrolOrbit });
const BAKIS = { dukkan: [[7.4, 4.6, 7.6], [2.9, 0.6, 1.4]], robot: [[3.2, 2.5, 3.0], [2.4, 0.9, 0.7]], qr: [[4.27, 1.28, 4.9], [4.27, 1.0, 2.08]], ust: [[2.9, 9.5, 2.4], [2.9, 0, 1.2]], makine: [[2.8, 3.1, 5.4], [2.8, 0.85, -0.3]], cephe: [[3.0, 1.7, 7.5], [3.0, 1.4, 3.6]] };
let tween = null;
const GENIS_BAKIS = new Set(['dukkan', 'cephe', 'ust']);   // C E16: orbit'te dükkân ekranları (TV / pano) yalnız GENİŞ bakışlarda çizilir — istasyon / robot / QR yakın bakışında makinenin önünde boşlukta durmasın
let bakisGit = function (ad, sn = 1.2) {
  IKIZ.orbitEkranlar = GENIS_BAKIS.has(ad);
  const [p, h] = BAKIS[ad]; const p0 = kamera.position.clone(), h0 = kontrolOrbit.target.clone(), p1 = new THREE.Vector3(...p), h1 = new THREE.Vector3(...h), t0 = performance.now();
  tween = () => { const a = Math.min(1, (performance.now() - t0) / (sn * 1000)), e = a * a * (3 - 2 * a); kamera.position.lerpVectors(p0, p1, e); kontrolOrbit.target.lerpVectors(h0, h1, e); if (a >= 1) tween = null; };
}
IKIZ.bakis = bakisGit;
/* C E9 (10 Eki): KOD şeridindeki istasyon düğmesi kamerayı o istasyona götürür — istasyonun GLB düğümlerinin kutusundan, sabit sayı yok.
   C 21:00 (2) düzeltmesi: (a) '^E_' deseni makinenin başka yerlerindeki E_* düğümlerini de alıyordu (E kutusu x 0 → 5,23) → E / K / TOP·A kutusu ENT eşlemesindeki o istasyonun
   eksen + çıkış düğümlerinden; (b) K ve E ortak gövdenin (U_KE_GOVDE), F kendi gövdesinin içinde → dışarıdan her bakış gövdeye çarpıyordu. Aday bakışlar (önden-yukarıdan → tepeden →
   iki yandan) görüş ışınlarıyla (11 Eki: kutu hacminde 76 hedef, dükkân katmanı dahil) denenir, en az kesileni seçilir; kalan engeller (gövde sacı, QR dolabı …) o bakışta SAYDAM (0,15) olur, başka bakışa geçince geri gelir. */
const IST_ONEK = { 'TOP·A': /^(TOPPING_|A_)/, F: /^F_/, K: /^K_/, E: /^E_/, B: /^B_/, ROBOT: /^UR10E_/, QR: /^QR62_/ };
const IST_SINYAL = { 'TOP·A': /^(AX_TOP_|DO_TOP_|DO_A_)/, K: /^(AX_K_|DO_K_)/, E: /^(AX_E_|DO_E_)/ };
const istKutu = {}; let soluk = [];
function solukGeri() { for (const [m, eski] of soluk) m.material = eski; soluk = []; IKIZ.istSoluk = 0; }
const _bakisGit = bakisGit; bakisGit = (ad, sn) => { if (ad !== 'ist') solukGeri(); IKIZ.bakisAd = ad; return _bakisGit(ad, sn); }; IKIZ.bakis = bakisGit;
/* YÖNETİCİ 22:5x: çekmece ×10'da ~0,5 s açık kalıyor → 'robot' bakışında açılan çekmeceyi kamera İZLER (hedef çekmecenin önüne kayar, 3B programdan ayrılmaz).
   Kullanıcı sahneye dokununca izleme biter (bakış düğmesiyle yeniden başlar). */
document.getElementById('kanvas').addEventListener('pointerdown', () => { if (IKIZ.bakisAd === 'robot') IKIZ.bakisAd = 'robot-elle'; });
// Zaman içinde gezinmek kamera komutu değildir. Devam eden bakış geçişini ve
// çekmece takibini bırak; kullanıcı yeniden Robot'u seçene kadar açı korunsun.
IKIZ.zamanBakisiniKoru = () => {
  tween = null;
  if (IKIZ.bakisAd === 'robot') IKIZ.bakisAd = 'robot-elle';
  IKIZ.cekmeceIzle = null;
};
const _ckH = new THREE.Vector3(), _ckB = new THREE.Box3();
IKIZ.kancalar.push(() => {
  if (IKIZ.zamanModu === 'kayit' || IKIZ.sahneModu === 'gezinti' || IKIZ.bakisAd !== 'robot' || tween || !IKIZ.son || !IKIZ.kok) return;
  const ac = Object.entries(IKIZ.son.cekmeceler || {}).filter(([, c]) => (c.konum || 0) > 60).sort((a, b) => b[1].konum - a[1].konum)[0];
  if (!ac) { IKIZ.cekmeceIzle = null; return; }
  const [k] = ac, m = /^K(\d)_(\w+)$/.exec(k); if (!m) return;
  const re = new RegExp('^CEK_K' + m[1] + '_[a-z0-9]+_' + (/^\d+$/.test(m[2]) ? m[2] : '1') + '__sac__CEKMECE$'); let o = null; IKIZ.kok.traverse(x => { if (!o && x.isMesh && re.test(x.name)) o = x; });
  if (!o) return; _ckB.setFromObject(o); _ckB.getCenter(_ckH); kontrolOrbit.target.lerp(_ckH, 0.12); IKIZ.cekmeceIzle = { k, hedef: _ckH.toArray().map(v => +v.toFixed(3)) };
});
IKIZ.istasyonaGit = ist => {
  if (IKIZ.sahneModu === 'gezinti' || !IKIZ.kok) return false;
  const r = IST_ONEK[ist]; if (!r) { bakisGit('makine'); return true; }
  if (!istKutu[ist]) { const b = new THREE.Box3(), E = IKIZ.esleme || {}, rs = IST_SINYAL[ist];
    if (rs) for (const tablo of ['eksen', 'cikis']) for (const [ad, v] of Object.entries(E[tablo] || {})) if (rs.test(ad)) for (const k of v.katkilar || []) for (const n of k.dugumler || []) { const o = IKIZ.kok.getObjectByName(n); if (o) b.expandByObject(o); }
    if (b.isEmpty()) IKIZ.kok.traverse(o => { if (o.isMesh && o.visible && r.test(o.name)) b.expandByObject(o); });
    istKutu[ist] = b.isEmpty() ? null : b; }
  const b = istKutu[ist]; if (!b) return false;
  const m = b.getCenter(new THREE.Vector3()), d = b.getSize(new THREE.Vector3()), boy = Math.max(d.x, d.y, 0.6);
  const adaylar = [[m.x, b.max.y + 0.9 + boy * 0.35, b.max.z + boy * 0.9 + 0.5], [m.x, b.max.y + 1.6 + boy * 0.6, m.z + boy * 0.35 + 0.25],
    [b.min.x - boy * 0.9 - 0.6, b.max.y + 0.9 + boy * 0.3, m.z + boy * 0.3], [b.max.x + boy * 0.9 + 0.6, b.max.y + 0.9 + boy * 0.3, m.z + boy * 0.3]];
  // C 11 Eki 06:5x: 9 ışın büyük bir yüzeyi (görüşün yarısını kapatan gövde / duvar) kaçırıyordu → istasyon kutusunun hacmine yayılmış 5 × 5 × 3 hedef + merkez
  const t0_ = performance.now(), hedefler = [m]; for (let a = 0; a < 3; a++) for (let y = 0; y < 3; y++) for (let c = 0; c < 3; c++) hedefler.push(new THREE.Vector3(b.min.x + d.x * (0.15 + a * 0.35), b.min.y + d.y * (0.15 + y * 0.35), b.min.z + d.z * (0.15 + c * 0.35)));   // 27 + merkez (ana iş parçacığını dondurmasın)
  solukGeri();
  if (!istKutu[ist + '#ici']) { const S_ = new Set(); IKIZ.kok.traverse(o => { if (o.isMesh && !o.isInstancedMesh && b.containsPoint(new THREE.Box3().setFromObject(o).getCenter(new THREE.Vector3())) && !/GOVDE|KABIN|KABUK|KAPAK|DOLAP/.test(o.name)) S_.add(o); }); istKutu[ist + '#ici'] = S_; }   // kutu hesabı istasyon başına bir kez
  const ici = o => istKutu[ist + '#ici'].has(o);   // istasyonun içindeki parça engel sayılmaz (gövde / kapak sayılır)
  const engel = [], topla = o => { if (!o.isMesh || o.isInstancedMesh || !o.visible || /^IKIZ_(STOK|KUTU|URUN|BANT|K_SPREY|E_KATLI)/.test(o.name)) return; let p = o, g = false; while (p) { if (!p.visible) { g = true; break; } p = p.parent; } if (!g && !ici(o)) engel.push(o); };
  IKIZ.kok.traverse(topla); const dk = IKIZ.sahne.scene.getObjectByName('IKIZ_DUKKAN'); if (dk) dk.traverse(topla);   // C 06:5x: dükkân katmanı (hücre duvarı, tezgâh, tavan …) da engel
  /* 11 Eki: üçgen raycast (her ışın × büyük ağlar) ana iş parçacığını 4–43 s donduruyordu (F1 kod şeridi tıklaması zaman aşımı) → ağın DÜNYA KUTUSU ile ışın-kutu kesişimi:
     hızlı ve ihtiyatlı (fazla saydam olabilir, eksik olmaz); r21_r23 EKRAN denetimi sonucu gerçek ışınla doğrular. */
  const kutular = engel.map(o => [o, new THREE.Box3().setFromObject(o)]).filter(([, bx]) => !bx.isEmpty()), ray = new THREE.Ray(), _x = new THREE.Vector3(); let enIyi = null;
  const kesenler = (k, h) => { const yon = h.clone().sub(k), uz = yon.length() - 0.02; ray.set(k, yon.normalize()); const r = []; for (const [o, bx] of kutular) { const q = ray.intersectBox(bx, _x); if (q && k.distanceTo(q) < uz) r.push(o); } return r; };   // istasyonu saran gövde de engel (içi görünsün); istasyonun kendi parçaları ici() ile dışarıda
  adaylar.forEach((c, i) => { const k = new THREE.Vector3(...c); let kesik = 0; const kesen = new Set();
    for (const h of hedefler) { const x = kesenler(k, h); if (x.length) { kesik++; x.forEach(o => kesen.add(o)); } }
    if (!enIyi || kesik < enIyi.kesik || (kesik === enIyi.kesik && kesen.size < enIyi.kesen.size)) enIyi = { i, kesik, kesen }; });
  { const k = new THREE.Vector3(...adaylar[enIyi.i]); for (let a = 0; a < 5; a++) for (let y = 0; y < 5; y++) for (let c = 0; c < 3; c++)   // seçilen bakışta sık ızgara (75 hedef): seyrek ışınların arasından kaçan engel de saydam
      kesenler(k, new THREE.Vector3(b.min.x + d.x * (0.1 + a * 0.2), b.min.y + d.y * (0.1 + y * 0.2), b.min.z + d.z * (0.2 + c * 0.3))).forEach(o => enIyi.kesen.add(o));
    for (const x of [0.02, 0.98]) for (const y of [0.02, 0.98]) for (const z of [0.02, 0.98]) kesenler(k, new THREE.Vector3(b.min.x + d.x * x, b.min.y + d.y * y, b.min.z + d.z * z)).forEach(o => enIyi.kesen.add(o)); }   // köşeler (ekranın kenarları)
  // The explicit layer panel owns opacity; focusing a station only moves the camera.
  if (IKIZ.katmanlar) enIyi.kesen.clear();
  for (const o of enIyi.kesen) { const eski = o.material; const y = (Array.isArray(eski) ? eski[0] : eski).clone(); y.transparent = true; y.opacity = 0.15; y.depthWrite = false; o.material = y; soluk.push([o, eski]); }
  const k_ = new THREE.Vector3(...adaylar[enIyi.i]), opak = engel.filter(o => !soluk.some(([x]) => x === o) && !((Array.isArray(o.material) ? o.material[0] : o.material) || {}).transparent); let kalan = 0;   // saydamlaştırmadan SONRA hâlâ görüşü kesen opak parça (0 olmalı)
  const opakS = new Set(opak); for (const h of hedefler) if (kesenler(k_, h).some(o => opakS.has(o))) kalan++;
  IKIZ.istBakis = { ist, aday: enIyi.i, kesik: enIyi.kesik, kalan, ms: Math.round(performance.now() - t0_), hedef: hedefler.length, saydam_sayi: enIyi.kesen.size, saydam: [...enIyi.kesen].map(o => o.name).slice(0, 12), kutu: [b.min.toArray().map(v => +v.toFixed(2)), b.max.toArray().map(v => +v.toFixed(2))] };
  IKIZ.istSoluk = soluk.length;
  BAKIS['ist'] = [adaylar[enIyi.i], [m.x, m.y, m.z]]; bakisGit('ist'); return true;
};
document.querySelectorAll('#araclar [data-bakis]').forEach(b => b.onclick = () => bakisGit(b.dataset.bakis));
function bakisSigdir(kutu) {
  const m = kutu.getCenter(new THREE.Vector3()), b = kutu.getSize(new THREE.Vector3());
  kontrolOrbit.target.copy(m); kamera.position.set(m.x + b.x * 0.35, m.y + b.y * 0.9, m.z + Math.max(b.x, b.z) * 1.05); kontrolOrbit.update();
}
let kareSay = 0, fpsT = performance.now(), sonT = performance.now();
// IKIZ.kancalar: her karede çağrılır (dt) — sürücü kapı yumuşatması, gezinti, VR
renderer.setAnimationLoop(() => {                      // WebXR oturumunda requestAnimationFrame çalışmaz → tek döngü bu
  const n = performance.now(), dt = Math.min(0.1, (n - sonT) / 1000); sonT = n;
  // Preserve the last committed image while the recorded scene is rebuilt.
  // Live PLC recording continues independently through MQTT.
  if (IKIZ.zamanHazirlaniyor) return;
  if (!IKIZ.yuklendi) return; // Startup: no GPU upload of the retired machine
  const livePresentationFrame=IKIZ.son;
  if(IKIZ.sunumKareKontrol&&IKIZ.sunumGoruntuKaresi)IKIZ.son=IKIZ.sunumGoruntuKaresi;
  try {
    if (tween) tween(); if (kontrolOrbit.enabled) kontrolOrbit.update();
    let hookTotal=0,hookMax=0,hookIndex=-1;for(let hi=0;hi<IKIZ.kancalar.length;hi++){const ht=performance.now();IKIZ.kancalar[hi](dt);const used=performance.now()-ht;hookTotal+=used;if(used>hookMax){hookMax=used;hookIndex=hi;}}
    if(kareSay%60===0){kanvas.dataset.hooksMs=hookTotal.toFixed(1);kanvas.dataset.slowestHook=hookIndex+':'+hookMax.toFixed(1);}

    try { IKIZ.cepheOcclusion67?.before(); renderer.render(scene, kamera); } finally { IKIZ.cepheOcclusion67?.after(); }
    for (const h of IKIZ.cizimSonrasi || []) h(dt);
  } finally {
    IKIZ.son=livePresentationFrame;
  }
  kareSay++; if (n - fpsT > 2000) { IKIZ.fps = +(kareSay * 1000 / (n - fpsT)).toFixed(1); kareSay = 0; fpsT = n;
    kanvas.dataset.fps = IKIZ.fps;
    kanvas.dataset.visibility = document.visibilityState;
    kanvas.dataset.renderMs = (performance.now() - n).toFixed(1);
    kanvas.dataset.drawCalls = renderer.info.render.calls;
    kanvas.dataset.triangles = renderer.info.render.triangles;
  }
});

/* ---------------------------------------------------------------- model */
const YM_KUTU_MALZEME = new THREE.MeshBasicMaterial({ visible: false });
function modelHamVerisiniBirak(gltf) {
  frameBagla27(THREE,IKIZ,gltf);
  // Kemal 31 Eki ("eski modelleri komple sil"): eski makinenin geometrisi dosyadan silindi (strip_glb.py). Düğümde yalnız kutu sınırı sayı olarak kalır
  // (extras.ym_kutu = yerel min/max): sürücünün kot okumaları (TABLA_UST, şarjör yığını …) aynı kalsın diye iki köşe noktası olarak bağlanır
  // (computeBoundingBox aynı kutuyu verir); katman 0 + görünmez malzeme: çizilmez. Eski sil()'in bıraktığı hayalet ağ ile aynı durum (isMesh, ymSilindi).
  // extras.ym_kutu_cok: özgün ağ çok primitifliydi (three.js'te Group + primitif çocukları) → kutu düğüme değil, cikar()'ın eskisi gibi atabileceği bir çocuğa.
  const ymKutulu = []; gltf.scene.traverse(o => { if (o.userData && o.userData.ym_kutu && !o.geometry) ymKutulu.push(o); });
  for (const o of ymKutulu) { const k = o.userData.ym_kutu;
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(new Float32Array([...k[0], ...k[1]]), 3));
    g.computeBoundingBox(); g.computeBoundingSphere(); g.userData.ymSilindi = true;
    let m = o; if (o.userData.ym_kutu_cok) { m = new THREE.Mesh(g, YM_KUTU_MALZEME); m.name = o.name + '_ym'; o.add(m); } else { o.geometry = g; o.material = YM_KUTU_MALZEME; o.isMesh = true; }
    m.layers.mask = 0; m.userData.assemblyDuplicate = m.userData.ymEski = true; IKIZ.dosyadaSilinen = (IKIZ.dosyadaSilinen || 0) + 1; }
  // Every scene dependency has resolved. Keep associations and render objects,
  // release the loader's duplicate full-file buffer and dependency promises.
  gltf.parser?.cache?.removeAll();
  const binary = gltf.parser?.extensions?.KHR_binary_glTF;
  if (binary) { binary.body = null; binary.content = null; }
  return gltf;
}
async function modelYukle() {
  IKIZ.frameContract27=await frameContract27();
  const [E, ENT] = await Promise.all([fetch(MODEL + 'ikiz_esleme.json').then(r => r.json()), import(MODEL + 'ikiz-esleme.js')]);
  Object.assign(E,structuredClone(IKIZ.frameContract27.motion_bindings));
  const yanit = await fetch(MODEL + E.glb + '?v=' + E.glb_sha256.slice(0, 12));          // köprü Content-Encoding: gzip → tarayıcı açar
  if (!yanit.ok) throw new Error('GLB HTTP ' + yanit.status);
  const tahmin = 305e6, kovan = [];
  let oku = 0; const rd = yanit.body.getReader();
  for (;;) {
    const { done, value } = await rd.read(); if (done) break; kovan.push(value); oku += value.length;
    $('yukleCubuk').style.width = Math.min(99, oku / tahmin * 100) + '%'; $('yukleMetin').textContent = `3B dükkân indiriliyor… ${(oku / 1048576).toFixed(0)} MB`;
  }
  let buf = new Uint8Array(oku); let o = 0; for (const k of kovan) { buf.set(k, o); o += k.length; } kovan.length = 0;
  $('yukleMetin').textContent = '3B dükkân çözülüyor…';
  const loader = new GLTFLoader(); loader.setMeshoptDecoder(MeshoptDecoder);
  const gltf = modelHamVerisiniBirak(await new Promise((coz, red) => loader.parse(buf.buffer, '', coz, red))); buf = null;
  E.urun.yer=structuredClone(IKIZ.frameContract27.product_places);
  /* EK GLB (ENT tur 6+: web paketine girmeyen B100+ — robot kapakları, QR kabloları, tablet, duvar panosu): ENT'in ikizEkYukle kuralı aynen
     (gizle_web listesi gizlenir + adı '__web_gizli' olur, ek sahne aynı köke eklenir); dosya köprüden Content-Encoding: gzip ile gelir (tarayıcı açar). */
  /* TOPPING düzeltme (11 Eki akşam, S3): ek GLB bir düğümün YALNIZ kendi ağını değiştirir — gizlenen web düğümünün ekte bulunmayan çocukları (ör. TOPPING_DONER__TABLA__BANT)
     ekteki yeni düğümün altına dünya konumu korunarak taşınır (yoksa bant da gizleniyordu, pide boşlukta duruyordu). */
  const cocukTasi = (adlar, ekSahne) => { gltf.scene.updateMatrixWorld(true); let n = 0;
    for (const a of adlar) { const eski = gltf.scene.getObjectByName(a + '__web_gizli'), yeni = ekSahne.getObjectByName(a); if (!eski || !yeni) continue;
      for (const c of [...eski.children]) { if (!c.name || ekSahne.getObjectByName(c.name)) continue; yeni.attach(c); c.visible = true; n++; } }
    return n; };
  let ek = null;
  if (E.ek_glb && E.ek_glb.dosya) {
    $('yukleMetin').textContent = '3B ek parçalar indiriliyor…';
    const ey = await fetch(MODEL + E.ek_glb.dosya + '?v=' + (E.ek_glb.glb_sha256 || '').slice(0, 12));
    if (!ey.ok) throw new Error('ek GLB HTTP ' + ey.status);
    const eb = await ey.arrayBuffer();
    ek = modelHamVerisiniBirak(await new Promise((coz, red) => loader.parse(eb, '', coz, red)));
    const gz = new Set(E.ek_glb.gizle_web || []);
    gltf.scene.traverse(o => { if (gz.has(o.name)) o.visible = false; });
    for (const n of gz) { const o = gltf.scene.getObjectByName(n); if (o) o.name = n + '__web_gizli'; }
    ek.scene.name = 'IKIZ_EK'; gltf.scene.add(ek.scene);
    const tak = []; ek.scene.traverse(o => { if (o.userData && o.userData.ebeveyn) tak.push(o); });                // ENT GOVDE-4 kuralı (ikizEkYukle): extras.ebeveyn → web ebeveyninin altına, yerel TRS
    for (const o of tak) { const p = gltf.scene.getObjectByName(o.userData.ebeveyn); if (p) p.add(o); }
    IKIZ.ekCocukTasinan = cocukTasi(gz, ek.scene);
  }
  /* TUTUCU GLB (ENT ikiz-v2, ROBOT-TUTUCU-2): kök 'Tool' → extras ebeveyn (UR10E_body_06) altına birim dönüşümle; ürün şablonları gizli (elde ürünü sürücü çizer). ENT ikizTutucuYukle kuralı. */
  IKIZ.tutucu = null; IKIZ.gltfListe = [gltf].concat(ek ? [ek] : []);          // KABUL-C: GLB'deki özgün düğüm adı (parser.associations)
  if (E.tutucu_glb && E.tutucu_glb.dosya) {
    $('yukleMetin').textContent = '3B tutucu indiriliyor…';
    const r = await fetch(MODEL + E.tutucu_glb.dosya + '?v=' + (E.tutucu_glb.glb_sha256 || '').slice(0, 12)); if (!r.ok) throw new Error('tutucu GLB HTTP ' + r.status);
    const t = await new Promise(async (coz, red) => loader.parse(await r.arrayBuffer(), '', coz, red));
    frameBagla27(THREE,IKIZ,t);
    const tool = t.scene.getObjectByName(E.tutucu_glb.kok || 'Tool'), p = gltf.scene.getObjectByName(E.tutucu_glb.ebeveyn);
    if (tool) tool.traverse(o => { if (o.userData && o.userData.urun_sablon) { o.visible = false; o.userData.urun = true; } });
    if (tool && p) p.add(tool);
    await robotKameraKur(THREE,gltf.scene,loader,IKIZ);
    IKIZ.tutucu = { dosya: E.tutucu_glb.dosya, bagli: !!(tool && p) }; IKIZ.gltfListe.push(t);
  }
  IKIZ.ekGlb = ek ? { dugum: E.ek_glb.dugum_sayisi, gizlenen: (E.ek_glb.gizle_web || []).length } : null;
  /* EK GLB LİSTESİ (`E.ek_glb_ekler`, başlatıcı --ek-ekle): ENT final paketinden önce deneme ekleri (ör. 142 perde). Aynı kural: gizle_web adları bütün sahnede
     (web + önceki ekler) gizlenir ve yeniden adlanır, sonra ek sahne köke eklenir — sürücü adı yalnız yeni (görünür) kopyada bulur. */
  IKIZ.ekGlbler = [];
  for (const x of (E.ek_glb_ekler || [])) {
    $('yukleMetin').textContent = '3B ek parçalar indiriliyor… ' + x.dosya;
    const r = await fetch(MODEL + x.dosya + '?v=' + (x.glb_sha256 || '').slice(0, 12)); if (!r.ok) throw new Error('ek GLB HTTP ' + r.status + ' ' + x.dosya);
    const e2 = modelHamVerisiniBirak(await new Promise(async (coz, red) => loader.parse(await r.arrayBuffer(), '', coz, red)));
    const gz = new Set(x.gizle_web || []); let gizlenen = 0;
    gltf.scene.traverse(o => { if (gz.has(o.name)) { o.visible = false; o.name = o.name + '__web_gizli'; gizlenen++; } });
    e2.scene.name = 'IKIZ_EK_' + IKIZ.ekGlbler.length; gltf.scene.add(e2.scene);
    IKIZ.ekGlbler.push({ dosya: x.dosya, gizlenen, cocuk_tasinan: cocukTasi(gz, e2.scene) }); IKIZ.gltfListe.push(e2);
  }
  IKIZ.qrTool80={head:(await loader.loadAsync('./qr80/rochu-4087.glb')).scene,adapter:(await loader.loadAsync('./qr80/FCM-R1.glb')).scene};
  return { gltf, E, ENT };
}
modelYukle().then(async ({ gltf, E, ENT }) => {
  const kok = gltf.scene;
  // Kemal 31 Eki ("açılınca eski makine açılıyor, yenisi sonradan yükleniyor; gizleme, sadece son tasarım"): ana GLB'deki ESKİ makine sahneye
  // konmadan ayıklanır — yeni_makine.js eskiGizle() kuralı aynen (makine zarfı + KORU). Açılışta eski makine hiç çizilmez; geometrisi yeni
  // makine kurulunca yeni_makine.js sil() ile silinir (düğümler sürücü / ürün köprüsü olarak kalır).
  const eskiErkenGizle = root => { const ZARF = new THREE.Box3(new THREE.Vector3(.70, -.06, -.96), new THREE.Vector3(5.32, 2.26, .17)), bb = new THREE.Box3(), m = new THREE.Vector3(), b = new THREE.Vector3();
    const KORU = /^(IKIZ_DUKKAN|DUKKAN|QR|UR10E|ROBOT|E_KUTU__|URUN|IKIZ_URUN|IKIZ_E_|IKIZ_KUTU|IKIZ_STOK|IKIZ_K_SPREY|IKIZ_K_YAG|Tool|YENI_MAKINE|YM_|CEK_K\d_[a-z0-9]+_\d+__silikon__CEKMECE$)/;
    let n = 0; root.updateMatrixWorld(true);
    root.traverse(o => { if (!(o.isMesh || o.isLine || o.isLineSegments || o.isPoints) || o.userData.dtScreenDepthMask) return;
      for (let p = o; p; p = p.parent) if (p.name && KORU.test(p.name)) return;
      bb.setFromObject(o); if (bb.isEmpty()) return; bb.getCenter(m); bb.getSize(b);
      if (!ZARF.containsPoint(m) || Math.max(b.x, b.y, b.z) > 4.7) return;
      o.userData.assemblyDuplicate = true; o.userData.ymEski = true; o.layers.mask = 0; n++; });
    return n; };
  IKIZ.eskiMakineErken = eskiErkenGizle(kok);
  scene.add(kok);
  IKIZ.eskiDukkanGizli = eskiDukkanGizle(kok, THREE);                 // ana GLB'deki eski DUKKAN26 ön bölgesi (9 Eki 22:25 yerleşimi dukkan.js?v=bace02727fe6'te)
  kok.updateMatrixWorld(true);
  const kutu = new THREE.Box3().setFromObject(kok); IKIZ.sinir = kutu;
  IKIZ.kok = kok; IKIZ.gltf = gltf; IKIZ.esleme = E; IKIZ.ENT = ENT;   // denetim: ENT.urunKonum doğrudan
  const {urunGorsel28}=await import('./urun_gorsel28.js');
  const urunGorsel=await urunGorsel28(THREE);IKIZ.urunGorsel28=urunGorsel;
  surucu = surucuKur({ THREE, kok, IKIZ, E, ENT, urunGorsel });
  IKIZ.sunumUygula = f => {f=gorselKare27(f); surucu.kareUygula(f, f.robot_poz);};
  IKIZ.sunumTemizle = () => surucu.temizle();
  IKIZ.sunumBitir = () => {IKIZ.sunumKareKontrol=false;IKIZ.sunumGoruntuKaresi=null;canliGoruntu.yakala();if(IKIZ.canliSon&&!zmn?.kayitta())surucu.kareUygula(IKIZ.canliSon,IKIZ.canliSon.robot_poz);};
  kodP = kodPanelKur({ THREE, IKIZ, E, kok });
  zmn = zamanKur({ IKIZ, surucuAl: () => surucu });
  // New machine mechanisms are installed once, by yeni_makine.js.
  // Service IDs remain the production PLC contract; do not rebuild old stations.
  konumBagla27(THREE,IKIZ);
  makineKapakKur(THREE,scene,IKIZ);
  await (await import('./t_main70.js')).tMain70(THREE,IKIZ);
  (await import('./zemin70.js')).zemin70(THREE,IKIZ);
  tiklamaKur({THREE,IKIZ,scene,kamera,kanvas,E,surucu});
  // Normal sipariş tek üretim yoludur; gösteri siparişi/yuva/dolum çubuğu yok.
  if (IKIZ.robotSon) surucu.robotPoz(IKIZ.robotSon, false);
  if (IKIZ.son) { canliGoruntu.yakala(); surucu.kareUygula(IKIZ.son, IKIZ.robotSon); }
  IKIZ.cepheOcclusion67=cepheOcclusion67(THREE,IKIZ);
  IKIZ.eskiMakineErken += eskiErkenGizle(scene);   // eski modüllerin sonradan eklediği eski parçalar (servis kapakları, K nozul kablosu): yeni makine yüklenirken çizilmez
  { try { await (await import('./yeni_makine/yeni_makine.js?v=b596e972071b')).yeniMakine(THREE, IKIZ, scene); } catch (e) { throw e; } }   // ANA 24 Eki: yeni makine (iskelet_v1 + 5 istasyon modülü) PLC karesiyle sürülür; eski istasyonlar kalkar (tek güncel görünüm)
  try { await (await import('./acici32.js?v=32-1')).acici32(THREE, IKIZ, scene); } catch (e) { IKIZ.konsolHata.push('acici32: ' + e.message); console.error(e); }   // Kemal 1 Kas: A açıcısı (24 Eki geometrisi) + merdane inişi / dönüşü geri
  IKIZ.yuklendi = true; // Keep the loading mask through first-render compilation.
  siparisTuruKur(IKIZ);
  senaryoKur(IKIZ);
}).catch(e => { yuklemeHatasi(IKIZ,e); IKIZ.konsolHata.push(String(e)); console.error(e); });
addEventListener('error', e => IKIZ.konsolHata.push(e.message));

/* C E20 (10 Eki): canlı akış durursa (MQTT bağlı ama 5 s'den uzun ikiz/durum yok — beyin durdu / kilitlendi) kırmızı uyarı; 'CANLI' yazısı yanıltmasın */
(function akisBekcisi() {
  const u = document.createElement('div'); u.id = 'akisUyari';
  u.style.cssText = 'position:absolute;z-index:30;left:50%;top:58px;transform:translateX(-50%);display:none;background:#b4261f;color:#fff;font:700 14px/1.3 system-ui;padding:8px 16px;border-radius:8px;box-shadow:0 6px 20px #0008';
  (document.getElementById('sahne') || document.body).append(u);
  setInterval(() => {
    const gec = IKIZ.sonKareT ? (performance.now() - IKIZ.sonKareT) / 1000 : 0, dur = IKIZ.zaman && IKIZ.zaman.mod && IKIZ.zaman.mod() === 'kayit';
    const durdu = !dur && !IKIZ.duraklatildi && IKIZ.sonKareT && gec > 5;   // kullanıcı Duraklat'a bastıysa uyarı yok
    u.style.display = durdu ? 'block' : 'none'; IKIZ.akisDurdu = !!durdu;
    if (durdu) u.textContent = `Canlı akış durdu — program beyninden ${Math.round(gec)} s'dir kare gelmiyor (sim ${((IKIZ.son || {}).t || 0).toFixed(1).replace('.', ',')} s)`;
  }, 1000);
})();
