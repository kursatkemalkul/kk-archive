/* İKİZ F2 · GEZİLEBİLİR İKİZ (gerçek zaman). Birinci şahıs gezinti (klavye + fare sürükleme + telefon dokunmatik), ekranlar 3B içinde kendi yerlerinde (CSS3D iframe: gerçek ekran, dokununca açılır ve çalışır),
   Gez: serbest kamera; Personel: kasa, dolum ve bakım. Dükkân ön bölgesi (cephe, kapılar, tezgâh, kiosk, TV, şerit ekran, kaldırım) dukkan.js — yerleşim "Robot + QR + dükkân" oturumundan. */
import * as THREE from 'three';
import {ekranPasif,odakOlcusu,odakMesafesi,ekranIsabet} from './ekran_etkilesim.js';
import { dukkanKur, ekranYerleri, yurunur } from './dukkan.js';
import {ekranOrtmeKur} from './ekran_ortme.js';
import { QR_PIN_ESLEME } from './qr_govde.js';

const GOZ = 1.65;                       // göz yüksekliği (m)
const HIZ = 1.4;                        // yürüme (m/s)

export function gezintiKur({ IKIZ, scene, kamera, renderer, kanvas, orbit, yan }) {
  const sahne = kanvas.parentElement;
  IKIZ.dukkan = dukkanKur(THREE, scene,IKIZ);                    // gerçek ölçülü ön bölge (yer tutucu yok)
  const wallBtn=document.createElement('button');wallBtn.id='duvarGizleBtn';wallBtn.textContent='Duvarları gizle';wallBtn.setAttribute('aria-pressed','false');document.getElementById('araclar').append(wallBtn);
  wallBtn.addEventListener('click',()=>{const hidden=wallBtn.getAttribute('aria-pressed')!=='true';IKIZ.dukkan.duvarGizle(hidden);wallBtn.setAttribute('aria-pressed',String(hidden));wallBtn.textContent=hidden?'Duvarları göster':'Duvarları gizle';wallBtn.classList.toggle('ak',hidden);});
  IKIZ.eklentiler = [];

  /* ---------------------------------------------------------- 3B EKRAN KATMANI (10 Eki): kendi izdüşümümüz — her ekranın 4 köşesi her karede kameraya izdüşürülür,
     iframe kutusu DÜZ katmanda tek bir matrix3d HOMOGRAFİSİYLE o dörtgene oturtulur. CSS3DRenderer'ın preserve-3d + perspektif zincirinde Chromium isabet sınaması
     iframe'in yalnız dar bir şeridini tıklanabilir bırakıyordu (KABUL-A gerçek tıklama denetimi: 7 × 9 ızgarada 5 / 63 nokta) → kiosk / tablet fareyle kullanılamıyordu.
     Görüntü aynı; tıklama ekranın her yerinde. Mantık (uzaklık, örtme, odak) metre cinsinden e.o.position ile. */
  const katman = document.createElement('div'); katman.id = 'css3d'; Object.assign(katman.style, { position: 'absolute', inset: '0', zIndex: 'auto', pointerEvents: 'none', overflow: 'hidden' });
  sahne.insertBefore(katman, document.getElementById('yukle') || document.getElementById('baglanti'));
  const css = { domElement: katman };
  kanvas.style.zIndex='2'; // transparent depth windows above the CSS screens
  const ekr = {};
  function ekranEkle(e) {
    if(ekr[e.id])return ekr[e.id];
    const el = document.createElement('div'); el.style.cssText = `position:absolute;left:0;top:0;transform-origin:0 0;width:${e.en}px;height:${e.boy}px;background:#fff;border:6px solid #15171a;border-radius:10px;overflow:hidden;opacity:0;box-sizing:content-box;will-change:transform`;
    if(e.gomme){el.style.border='0';el.style.borderRadius='0';}
    el.dataset.screenSurface=e.id;el.style.zIndex='1';
    const f = document.createElement('iframe'); f.style.cssText = 'width:100%;height:100%;border:0'; f.title = e.ad; f.dataset.ekran = e.id; f.style.pointerEvents='none'; el.append(f); katman.append(el);
    const R = new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(-(e.egim || 0), e.yon || 0, 0, 'YXZ'));
    const sag = new THREE.Vector3(1, 0, 0).applyMatrix4(R), ust = new THREE.Vector3(0, 1, 0).applyMatrix4(R);
    const o = { position: new THREE.Vector3(...e.konum), sag, ust, mPx: e.genislik / e.en };    // 1 CSS px = mPx metre
    e.normal = new THREE.Vector3(Math.sin(e.yon || 0) * Math.cos(e.egim || 0), Math.sin(e.egim || 0), Math.cos(e.yon || 0) * Math.cos(e.egim || 0));   // IKIZ-ARAYUZ-6: ÜÇ BOYUTLU normal (eğik POS ekranı ortalanır)
    // A zero-alpha, depth-writing plane cuts a window in the WebGL canvas.
    // All foreground geometry then paints over that window with real GPU
    // depth testing, down to individual pixels and moving thin parts.
    const border=e.gomme?0:12,mask=new THREE.Mesh(new THREE.PlaneGeometry((e.en+border)*o.mPx,(e.boy+border)*o.mPx),new THREE.MeshBasicMaterial({color:0x000000,opacity:0,transparent:false,blending:THREE.NoBlending,depthWrite:true,depthTest:true}));
    mask.name='IKIZ_EKRAN_DERINLIK_'+e.id;mask.userData.dtScreenDepthMask=true;mask.renderOrder=-100;mask.visible=false;mask.position.copy(o.position).addScaledVector(e.normal,.0001);mask.rotation.set(-(e.egim||0),e.yon||0,0,'YXZ');scene.add(mask);
    ekr[e.id] = { ...e, el, f, o,mask, yuklu: false };return ekr[e.id];
  }
  for(const e of ekranYerleri())ekranEkle(e);
  const _k = [new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()], _c = new THREE.Vector3();
  function ekranCiz(e, Wc, Hc) {                                              // 4 köşe → ekran pikseli → homografi (birim kare → dörtgen) → matrix3d
    const W = e.el.offsetWidth, H = e.el.offsetHeight, o = e.o, w = W * o.mPx, h = H * o.mPx;
    const kose = [[-w / 2, h / 2], [w / 2, h / 2], [w / 2, -h / 2], [-w / 2, -h / 2]];   // sol üst · sağ üst · sağ alt · sol alt
    const P = [];
    for (let i = 0; i < 4; i++) {
      _k[i].copy(o.position).addScaledVector(o.sag, kose[i][0]).addScaledVector(o.ust, kose[i][1]);
      _c.copy(_k[i]).applyMatrix4(kamera.matrixWorldInverse); if (_c.z > -0.02) return false;       // köşe kameranın arkasında → çizilmez
      _c.copy(_k[i]).project(kamera); P.push([(_c.x + 1) / 2 * Wc, (1 - _c.y) / 2 * Hc]);
    }
    const [[x0, y0], [x1, y1], [x2, y2], [x3, y3]] = P;
    const dx1 = x1 - x2, dx2 = x3 - x2, dx3 = x0 - x1 + x2 - x3, dy1 = y1 - y2, dy2 = y3 - y2, dy3 = y0 - y1 + y2 - y3, den = dx1 * dy2 - dx2 * dy1;
    if (Math.abs(den) < 1e-9) return false;
    const g = (dx3 * dy2 - dx2 * dy3) / den, hh = (dx1 * dy3 - dx3 * dy1) / den;
    const a = x1 - x0 + g * x1, b = x3 - x0 + hh * x3, c = x0, d = y1 - y0 + g * y1, ee = y3 - y0 + hh * y3, f = y0;
    // birim kare → dörtgen; eleman pikseli (X, Y) → (X / W, Y / H)
    const A = a / W, B = b / H, D = d / W, E2 = ee / H, G = g / W, Hh = hh / H;
    e.el.style.transform = `matrix3d(${A},${D},0,${G},${B},${E2},0,${Hh},0,0,1,0,${c},${f},0,1)`;
    return true;
  }
  IKIZ.ekranlar3b = ekr;
  const OFS = (Number(location.port) || 8800) - 8800;
  const ARKA = `hmi=${location.hostname}:${8791 + OFS}&sip=${location.hostname}:${8790 + OFS}`;
  function ekranYukle(e) { if (e.yuklu) return; e.yuklu = true; e.f.src = e.url || `../tablet/index.html?${ARKA}&yuva=${['machine','hmi'].includes(e.id)?'makine':'satis'}${['machine','hmi'].includes(e.id)?'&mod=MAKINE&panel=makine&sekme=durum':''}`; }

  IKIZ.hmiEkranEkle29=e=>{const screen=ekranEkle(e);screen.yuklu=false;ekranYukle(screen);return screen;};

  /* ---------------------------------------------------------- gezinti durumu */
  const g = IKIZ.gezinti = { acik: false, x: 3.2, z: 5.2, yaw: 0, pitch: -0.05, rol: null, odak: null, tus: {}, joy: { x: 0, y: 0 } };
  function uygulaKamera() { kamera.position.set(g.x, GOZ, g.z); kamera.rotation.set(g.pitch, g.yaw, 0, 'YXZ'); }
  let yuruyebilir = yurunur('musteri');
  const engelli = (x, z) => !yuruyebilir(x, z);
  function yuru(dt) {
    let ix = (g.tus.KeyD || g.tus.ArrowRight ? 1 : 0) - (g.tus.KeyA || g.tus.ArrowLeft ? 1 : 0) + g.joy.x, iz = (g.tus.KeyS || g.tus.ArrowDown ? 1 : 0) - (g.tus.KeyW || g.tus.ArrowUp ? 1 : 0) + g.joy.y;
    const n = Math.hypot(ix, iz); if (n < 0.05 || g.odak) return; if (n > 1) { ix /= n; iz /= n; }
    const sn = Math.sin(g.yaw), cs = Math.cos(g.yaw), hiz = HIZ * (g.tus.ShiftLeft ? 1.8 : 1);
    const dx = (ix * cs + iz * sn) * hiz * dt, dz = (-ix * sn + iz * cs) * hiz * dt;
    if (!engelli(g.x + dx, g.z)) g.x += dx; if (!engelli(g.x, g.z + dz)) g.z += dz;
  }
  addEventListener('keydown', e => { if (!g.acik&&!g.odak) return; if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return; g.tus[e.code] = true; if (e.code === 'KeyE') etkilesim(); if (e.code === 'Escape') odakBirak(); });
  addEventListener('keyup', e => { g.tus[e.code] = false; });
  // bakış: sürükleme (fare + dokunmatik); telefonda sol alt köşe = joystick
  let surukle = null;
  kanvas.addEventListener('pointerdown', e => { const r=kanvas.getBoundingClientRect(),joy=g.acik&&!g.odak&&e.pointerType==='touch'&&e.clientX-r.left<r.width*.4&&e.clientY-r.top>r.height*.4;surukle={id:e.pointerId,x:e.clientX,y:e.clientY,joy,x0:e.clientX,y0:e.clientY,t:performance.now(),moved:false};if(g.acik)kanvas.setPointerCapture(e.pointerId); });
  kanvas.addEventListener('pointermove', e => {if(!surukle||surukle.id!==e.pointerId)return;if(Math.hypot(e.clientX-surukle.x0,e.clientY-surukle.y0)>=6)surukle.moved=true;if(surukle.joy){g.joy.x=Math.max(-1,Math.min(1,(e.clientX-surukle.x0)/60));g.joy.y=Math.max(-1,Math.min(1,(e.clientY-surukle.y0)/60));return;}if(!g.acik||g.odak)return;g.yaw-=(e.clientX-surukle.x)*.004;g.pitch=Math.max(-1.2,Math.min(1.2,g.pitch-(e.clientY-surukle.y)*.004));surukle.x=e.clientX;surukle.y=e.clientY;});
  kanvas.addEventListener('pointerup', e => {if(surukle&&surukle.id===e.pointerId){if(!surukle.joy&&!surukle.moved&&performance.now()-surukle.t<500){if(!ekranTikla(e.clientX,e.clientY))IKIZ.parcaTikla?.(e.clientX,e.clientY);}g.joy.x=g.joy.y=0;surukle=null;}});
  kanvas.addEventListener('pointercancel',()=>{surukle=null;g.joy.x=g.joy.y=0;});

  /* ---------------------------------------------------------- QR-5 (10 Eki): Storm tuş takımı (ROBOT25_QR_STORM_KEYPAD, QR sol kolonu, ön yüz z 2,097) 3B içinde tıklanır.
     Tuş merkezleri modeldeki tuş yazılarından (ROBOT25_QR_TUS_*): sütun x 3,652 / 3,677 / 3,702 · satır y 1,258 / 1,234 / 1,208 / 1,182. Rakam ekler · * siler · # gönderir (POST /api/dolap/kod).
     Geri bildirim ekransız (K6): kapı / klape açılır; kod hatalıysa programın qr.code_rejected olayı ipucu satırında. */
  const TUS = { ...QR_PIN_ESLEME, et: [['1', '2', '3'], ['4', '5', '6'], ['7', '8', '9'], ['*', '0', '#']] };
  const tusDurum = { kod: '', son: null };
  const _ray = new THREE.Raycaster(), _ndc = new THREE.Vector2(), _plan = new THREE.Plane(new THREE.Vector3(0, 0, 1), -TUS.z), _nok = new THREE.Vector3();
  function tusBul(cx, cy) {
    if(TUS.enabled===false)return null;
    const r = kanvas.getBoundingClientRect(); _ndc.set(((cx - r.left) / r.width) * 2 - 1, -((cy - r.top) / r.height) * 2 + 1);
    _ray.setFromCamera(_ndc, kamera); if (kamera.position.z <= TUS.z + 0.02) return null;                 // yalnız müşteri tarafından (önden)
    if (!_ray.ray.intersectPlane(_plan, _nok) || _nok.distanceTo(kamera.position) > 14 || ekr.qrpin.mask.layers.mask===0) return null;
    if(blocked(kamera.position,_nok.clone().add(new THREE.Vector3(0,0,.0005))))return null;
    const [x0, x1, y0, y1] = TUS.kutu; if (_nok.x < x0 || _nok.x > x1 || _nok.y < y0 || _nok.y > y1) return null;
    let en = null, enD = 0.0135;
    TUS.y.forEach((y, i) => TUS.x.forEach((x, j) => { const d = Math.hypot(_nok.x - x, _nok.y - y); if (d < enD) { enD = d; en = TUS.et[i][j]; } }));
    return en;
  }
  async function tusBas(t) {
    if (tusDurum.kilitBitis && IKIZ.kodKilit && IKIZ.kodKilit() <= 0) { tusDurum.kilitBitis = 0; tusDurum.kod = ''; }   // kilit bitti: yarım giriş temizlenir, kod baştan
    if (IKIZ.kodKilit && IKIZ.kodKilit() > 0) { IKIZ.durumMetin(`Tuş takımı: kilitli — ${IKIZ.kodKilit()} s bekleyin`); tusDurum.son = { kod: '', t: Date.now(), sonuc: 'kilit' }; return; }   // QR kilidi süresince tuş alınmaz
    if (/^\d$/.test(t)||t==='*')tusDurum.son=null;
    if (/^\d$/.test(t)) { if (tusDurum.kod.length < 8) tusDurum.kod += t; }
    else if (t === '*') tusDurum.kod = '';
    else if (t === '#') {
      const kod = tusDurum.kod;if(!kod){IKIZ.durumMetin('Önce teslim kodunu girin');return;} tusDurum.kod = ''; tusDurum.son = { kod, t: Date.now(), sonuc: 'gönderildi' };
      IKIZ.durumMetin('Tuş takımı: kod gönderildi — dolap açılıyor…');
      try { await fetch('/api/dolap/kod', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ kod }) }); } catch (x) { IKIZ.durumMetin('Tuş takımı: dolaba ulaşılamadı'); }
      return;
    }
    IKIZ.durumMetin('Tuş takımı: ' + (tusDurum.kod ? '•'.repeat(tusDurum.kod.length) : '—') + '   (# gönder · * sil)');
  }
  function pinYayinla(){const data={tip:'autokitch.qr.pin',kod:tusDurum.kod,sonuc:tusDurum.son?.sonuc||'',kilit_s:IKIZ.kodKilit?.()||0};for(const f of document.querySelectorAll('iframe')){try{if(new URL(f.src,location.href).pathname.endsWith('/qr-pin.html'))f.contentWindow.postMessage(data,location.origin);}catch{}}}
  addEventListener('message',e=>{if(e.origin!==location.origin||e.data?.tip!=='autokitch.qr.tus'||!/^([0-9]|\*|#)$/.test(e.data.tus||''))return;const allowed=[...document.querySelectorAll('iframe')].some(f=>f.contentWindow===e.source&&new URL(f.src,location.href).pathname.endsWith('/qr-pin.html'));if(allowed)Promise.resolve(tusBas(e.data.tus)).finally(pinYayinla);});
  function tusTikla(cx, cy) { if (g.odak?.id!=='qrpin') return false; const t = tusBul(cx, cy); if (!t) return false; Promise.resolve(tusBas(t)).finally(pinYayinla); return true; }
  IKIZ.tusTakimi = { durum: tusDurum, bas: tusBas,
    ekranda: t => { const r = kanvas.getBoundingClientRect(); for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) if (TUS.et[i][j] === t) { const v = new THREE.Vector3(TUS.x[j], TUS.y[i], TUS.z).project(kamera);
      return { x: r.left + (v.x + 1) / 2 * r.width, y: r.top + (1 - v.y) / 2 * r.height, gorunur: Math.abs(v.x) < 1 && Math.abs(v.y) < 1 && v.z < 1 }; } return null; } };
  /* QR kilidi (G/Ç: 3 yanlış → 30 s): olayda kilit_s / kilit_bitis varsa (ya da qr.locked) tuş takımı o süre 'bekleyin' gösterir ve tuşları almaz — süre programdan, burada sayı yok */
  IKIZ.kodRed = (o = {}) => {
    const simT = o.t != null ? +o.t : o.sim_t != null ? +o.sim_t : +((IKIZ.son || {}).t || 0);   // A M3h: olayda 'zaman' yok, 't' var; kilit_s (G/Ç fbcf0a7c: KALAN saniye) öncelikli
    const k = o.kilit_s != null ? Math.max(0, +o.kilit_s) : (o.kilit_bitis != null ? Math.max(0, +o.kilit_bitis - simT) : 0);
    if (k > 0) { tusDurum.kilitBitis = performance.now() + k * 1000 / Math.max(0.1, +((IKIZ.son || {}).hiz) || 1) + 1000; tusDurum.kod = ''; }   // +1 s pay: programın kilidinden önce tuş alınmasın (A M3i)
    IKIZ.durumMetin(k > 0 ? `Tuş takımı: çok fazla yanlış — ${Math.ceil(k)} s bekleyin` : 'Tuş takımı: kod HATALI — tekrar dene'); if (tusDurum.son) tusDurum.son.sonuc = k > 0 ? 'kilit' : 'red';
  };
  IKIZ.kodKilit = () => { const k = (tusDurum.kilitBitis || 0) - performance.now(); return k > 0 ? Math.ceil(k / 1000) : 0; };

  /* ---------------------------------------------------------- etkileşim: en yakın / karşıdaki ekran → odak */
  const ileri = new THREE.Vector3();
  function ekranBul(cx,cy,passive=false){const r=kanvas.getBoundingClientRect();_ndc.set((cx-r.left)/r.width*2-1,-(cy-r.top)/r.height*2+1);_ray.setFromCamera(_ndc,kamera);let nearest=null,distance=14;for(const e of Object.values(ekr)){if((!passive&&ekranPasif(e.id))||e.mask.layers.mask===0||e.el.style.visibility==='hidden')continue;const p=ekranIsabet(THREE,_ray.ray,e);if(!p)continue;const d=p.distanceTo(kamera.position);if(d>=distance||blocked(kamera.position,p.clone().addScaledVector(e.normal,.0005)))continue;nearest=e;distance=d;}return nearest;}
  function bakilan(){const r=kanvas.getBoundingClientRect();return ekranBul(r.left+r.width/2,r.top+r.height/2);}
  function ekranTikla(cx,cy){if(tusTikla(cx,cy))return true;const key=tusBul(cx,cy);if(key){odakla(ekr.qrpin);return true;}const e=ekranBul(cx,cy,true);if(!e)return false;if(!ekranPasif(e.id)&&g.odak!==e)odakla(e);return true;}
  function etkilesim(){const r=kanvas.getBoundingClientRect();ekranTikla(r.left+r.width/2,r.top+r.height/2);}
  let tween = null;
  let odakDonus=null,orbitDonus=null;
  function odakla(e){
    if(!e||ekranPasif(e.id)||g.odak===e)return;
    if(g.odak)odakBirak();
    IKIZ.zamanBakisiniKoru?.();
    odakDonus={position:kamera.position.clone(),quaternion:kamera.quaternion.clone(),x:g.x,z:g.z,yaw:g.yaw,pitch:g.pitch};
    const angle=new THREE.Euler().setFromQuaternion(kamera.quaternion,'YXZ');g.yaw=angle.y;g.pitch=angle.x;
    g.odak=e;orbit.enabled=false;ekranYukle(e);
    const esc=()=>{try{e.f.contentWindow.addEventListener('keydown',k=>{if(k.key==='Escape')odakBirak();});}catch{}};esc();e.f.addEventListener('load',esc);
    Object.values(ekr).forEach(x=>{x.el.style.pointerEvents='none';x.f.style.pointerEvents='none';});
    if(e.id!=='qrpin')e.el.style.zIndex='4';
    const s=odakOlcusu(e),dist=odakMesafesi(e,kamera,sahne.clientWidth,sahne.clientHeight),hedef=new THREE.Vector3(...s.center).addScaledVector(e.normal,dist);
    const p0=kamera.position.clone(),y0=g.yaw,pt0=g.pitch,t0=performance.now(),y1=y0+Math.atan2(Math.sin((e.yon||0)-y0),Math.cos((e.yon||0)-y0)),pt1=-(e.egim||0);
    tween=()=>{const a=Math.min(1,(performance.now()-t0)/600),v=a*a*(3-2*a);kamera.position.lerpVectors(p0,hedef,v);g.yaw=y0+(y1-y0)*v;g.pitch=pt0+(pt1-pt0)*v;kamera.rotation.set(g.pitch,g.yaw,0,'YXZ');if(a>=1){tween=null;if(!s.physical){e.el.style.pointerEvents='auto';e.f.style.pointerEvents='auto';}}};
    IKIZ.durumMetin(e.id==='qrpin'?'QR teslim: fiziksel tuşlara tıkla · * sil · # onay':`${e.ad} — ekrandaki seçeneğe tıkla · Esc ile çık`);$geri.style.display='block';
  }
  function odakBirak(){if(!g.odak)return;const e=g.odak;try{document.activeElement?.blur();window.focus();}catch{}e.el.style.pointerEvents='none';e.f.style.pointerEvents='none';e.el.style.zIndex='1';g.odak=null;tween=null;$geri.style.display='none';IKIZ.durumMetin('');if(odakDonus){kamera.position.copy(odakDonus.position);kamera.quaternion.copy(odakDonus.quaternion);g.x=odakDonus.x;g.z=odakDonus.z;g.yaw=odakDonus.yaw;g.pitch=odakDonus.pitch;odakDonus=null;}orbit.enabled=!g.acik;}
  const $geri = document.createElement('button'); $geri.textContent = '⟵ Ekranı bırak'; Object.assign($geri.style, { position: 'absolute', zIndex: '6', left: '50%', bottom: '58px', transform: 'translateX(-50%)', display: 'none', fontSize: '15px', padding: '8px 16px' }); $geri.onclick = odakBirak; sahne.append($geri);
  const $ip = document.createElement('div'); Object.assign($ip.style, { position: 'absolute', zIndex: '5', left: '50%', bottom: '102px', transform: 'translateX(-50%)', padding: '5px 12px', borderRadius: '14px', background: 'rgba(15,19,24,.88)', border: '1px solid #303a47', font: '13px system-ui', display: 'none' }); sahne.append($ip);
  IKIZ.durumMetin = m => { $ip.textContent = m; $ip.style.display = m ? 'block' : 'none'; };

  /* ---------------------------------------------------------- roller */
  const ROLLER = {
    personel: { ad:'PERSONEL',x:2.03,z:2.622,yaw:-Math.PI/2,pitch:-.85,not:'Kasa, dolum ve bakım tek Personel panelinde.',yan:'PERSONEL PANELİ' },
  };
  function yanAc(ad) { document.querySelectorAll('#sekmeler button').forEach(b => { if (b.textContent === ad) b.click(); }); }
  function rolSec(r) {
    if(r==='doldurma')r='personel';
    const R = ROLLER[r]; if (!R) return;odakBirak(); girisYap(); try { document.activeElement && document.activeElement.blur(); window.focus(); } catch (x) { /* */ } g.rol = r; yuruyebilir = yurunur(r); g.x = R.x; g.z = R.z; g.yaw = R.yaw; g.pitch = R.pitch != null ? R.pitch : -0.04; uygulaKamera();
    yanAc(R.yan); IKIZ.durumMetin(R.ad + ' · ' + R.not + (IKIZ.panelGizli ? ' · (ekran panelde — P ile aç)' : '')); setTimeout(() => { if (!g.odak) IKIZ.durumMetin(''); }, 9000);
    document.querySelectorAll('#roller button').forEach(b => b.classList.toggle('ak', b.dataset.rol === r));
  }
  function girisYap() { if (g.acik) return;orbitDonus={position:kamera.position.clone(),quaternion:kamera.quaternion.clone(),target:orbit.target.clone()}; g.acik = true; IKIZ.dukkan.gorunum(true); orbit.enabled = false; IKIZ.sahneModu = 'gezinti'; document.getElementById('gezintiBtn').classList.add('ak'); }
  function cikisYap() { odakBirak();g.acik = false; IKIZ.dukkan.gorunum(false); orbit.enabled = true; IKIZ.sahneModu = 'orbit'; g.rol = null;g.tus={};g.joy.x=g.joy.y=0;IKIZ.zamanBakisiniKoru?.();if(orbitDonus){kamera.position.copy(orbitDonus.position);kamera.quaternion.copy(orbitDonus.quaternion);orbit.target.copy(orbitDonus.target);orbitDonus=null;}orbit.update();document.getElementById('gezintiBtn').classList.add('ak'); document.querySelectorAll('#roller button').forEach(b => b.classList.toggle('ak',b.id==='gezintiBtn')); Object.values(ekr).forEach(e => { e.el.style.opacity = '0'; }); IKIZ.durumMetin(''); }
  document.querySelectorAll('#roller [data-rol]').forEach(b => b.onclick = () => rolSec(b.dataset.rol));
  document.getElementById('gezintiBtn').onclick=()=>{cikisYap();};
  document.getElementById('gezintiBtn').title='Serbest 3B görünüm · sürükle: dön · tekerlek: yakınlaş / uzaklaş';document.getElementById('gezintiBtn').classList.add('ak');
  IKIZ.rolSec = rolSec; IKIZ.gezintiCik = cikisYap; IKIZ.odakla = id => ekr[id] && odakla(ekr[id]); IKIZ.odakBirak = odakBirak;

  /* ---------------------------------------------------------- döngü */
  let pinZ=0;
  function dongu(dt) {for(const e of Object.values(ekr))e.follow?.();if(performance.now()-pinZ>150){pinZ=performance.now();pinYayinla();}
    if (IKIZ.dukkan && IKIZ.dukkan.guncelle) IKIZ.dukkanKapi = IKIZ.dukkan.guncelle(kamera.position, dt, g.acik);   // R24 D4: sürgü / personel kapısı yaklaşınca açılır
    if (g.acik||g.odak) {
      if (tween) tween(); else if (!g.odak) { yuru(dt); uygulaKamera(); }
      const _r = kanvas.getBoundingClientRect(), tb = !g.odak && tusBul(_r.left + _r.width / 2, _r.top + _r.height / 2), b = !g.odak && !tb && bakilan();   // bakış ışını tuş takımına değiyorsa o öncelikli (kiosk yakında olsa da)
      if (!g.odak && !(tusDurum.son && Date.now() - tusDurum.son.t < 4000)) IKIZ.durumMetin(b ? `${b.ad}: E / dokun` : tb ? 'Tuş takımı: tuşlara dokun / tıkla — kodunu yaz, # ile gönder' + (tusDurum.kod ? '   ' + '•'.repeat(tusDurum.kod.length) : '') : '');
      IKIZ.ipucu = b ? b.id : tb ? 'tus' : null;
      for (const e of Object.values(ekr)) { const d = e.o.position.distanceTo(kamera.position); ekranYukle(e); e.el.style.opacity = e.physicalVisible!==false && d < 14 && ileriBak(e) && onYuz(e) ? '1' : '0'; e.el.style.visibility = e.el.style.opacity === '0' ? 'hidden' : 'visible'; }
      { kamera.updateMatrixWorld(true); const Wc = sahne.clientWidth, Hc = sahne.clientHeight; for (const e of Object.values(ekr)) if (e.el.style.opacity === '1' && !ekranCiz(e, Wc, Hc)) { e.el.style.opacity = '0'; e.el.style.visibility = 'hidden'; } }
    } else {
      // Orbit shows every actual display; interaction remains in walking/focus mode.
      kamera.updateMatrixWorld(true); const Wc = sahne.clientWidth, Hc = sahne.clientHeight;
      for (const e of Object.values(ekr)) {
        const goster = e.physicalVisible!==false && e.o.position.distanceTo(kamera.position) < 14 && ileriBak(e) && onYuz(e);
        if (goster||e.alwaysOn) ekranYukle(e);
        e.el.style.pointerEvents = 'none';
        const ok = goster && ekranCiz(e, Wc, Hc); e.el.style.opacity = ok ? '1' : '0'; e.el.style.visibility = ok ? 'visible' : 'hidden';
      }
    }
    for(const e of Object.values(ekr))e.mask.visible=e.el.style.visibility==='visible';
    kanvas.style.pointerEvents='auto';
  }
  // Every physical screen remains powered in both camera modes.
  function onYuz(e){return _d.copy(kamera.position).sub(e.o.position).dot(e.normal)>0;}
  const tv = new THREE.Vector3();
  // GPU depth masks handle visual occlusion continuously. The actual-mesh
  // rays below only reject interactions with screens behind physical objects.
  const blocked=ekranOrtmeKur(THREE,scene),_d=new THREE.Vector3();
  function ortulu(e) {
    _d.copy(kamera.position).sub(e.o.position);if(_d.dot(e.normal)<=0)return true;
    const now=performance.now();
    // Bound geometry work to 12.5 Hz; hide immediately on each new check.
    if(e.ortmeAt!==undefined&&now-e.ortmeAt<80)return e.ortmeSon;
    e.ortmeAt=now;
    const w=e.genislik/2-.002,h=e.genislik*e.boy/e.en/2-.002;
    e.ortmeSon=[[0,0],[-w,-h],[-w,h],[w,-h],[w,h]].some(([x,y])=>{
      const end=e.o.position.clone().addScaledVector(e.o.sag,x).addScaledVector(e.o.ust,y).addScaledVector(e.normal,.0005);
      return blocked(kamera.position,end,now);
    });return e.ortmeSon;
  }
  IKIZ.ekranOrtulu = id => ekr[id] ? ortulu(ekr[id]) : null;
  function ileriBak(e) { kamera.getWorldDirection(ileri); tv.copy(e.o.position).sub(kamera.position).normalize(); return tv.dot(ileri) > 0.2; }
  IKIZ.kancalar.push(dongu);
  return { rolSec, g, engelli };
}
