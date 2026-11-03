/* Presentation only: preserve the existing live iframes, URLs and panel actions. */
(() => {
  'use strict';
  // Native CSS viewports match dukkan.js / qr_ekran.js where hardware exists.
  // The QR panel canvas includes its existing physical keys; its LCD stays16:9.
  const profiles = [
    {name:'Kiosk · 32″ dikey', detail:'9:16 · 540 × 960', w:540, h:960, bx:22, by:22, radius:14, screen:2, kind:'kiosk'},
    {name:'Müşteri · web sipariş', detail:'390 × 844', w:390, h:844, bx:12, by:30, radius:44, screen:30, kind:'phone'},
    {name:'Sipariş takibi · telefon', detail:'390 × 844', w:390, h:844, bx:12, by:30, radius:44, screen:30, kind:'phone'},
    {name:'QR teslim paneli', detail:'Kod ekranı 16:9 + fiziksel tuşlar', w:480, h:640, bx:0, by:0, radius:0, screen:0, kind:'qr'},
    {name:'Dolap üstü menü ekranı', detail:'8:1 · 1024 × 128', w:1024, h:128, bx:18, by:18, radius:6, screen:0, kind:'signage'},
    {name:'Operasyon · personel ve kasa', detail:'16:10 · 1024 × 640', w:1024, h:640, bx:30, by:22, radius:32, screen:9, kind:'tablet'},
    {name:'Yönetici · tablet', detail:'16:10 · 1024 × 640', w:1024, h:640, bx:30, by:22, radius:32, screen:9, kind:'tablet'},
    {name:'Website · tasarım önizlemesi', detail:'16:10 · 1440 × 900', w:1440, h:900, bx:8, by:8, bt:44, radius:12, screen:3, kind:'website'},
    {name:'iOS / Android · uygulama tasarımı', detail:'390 × 844 · Sipariş ve takip aynı uygulamada', w:390, h:844, bx:12, by:30, radius:44, screen:30, kind:'phone'},
  ];
  function init() {
    const host = document.getElementById('cerceve');
    const panel = document.getElementById('yan');
    if (!host || !panel || host.dataset.preview59) return;
    host.dataset.preview59 = 'true';
    const caption = document.createElement('div');
    caption.className = 'device-caption59';
    const name = document.createElement('strong'), detail = document.createElement('span');
    caption.append(name, detail);
    panel.insertBefore(caption, host);
    const shell = document.createElement('div');
    shell.className = 'device-case59';
    shell.setAttribute('aria-hidden','true');
    const camera = document.createElement('i');
    camera.className = 'device-camera59';
    shell.append(camera);
    const browser = document.createElement('div'); browser.className = 'device-browser63';
    const dots = document.createElement('span'); dots.className = 'browser-dots63'; dots.textContent = '•••';
    const address = document.createElement('span'); address.className = 'browser-address63'; address.textContent = 'AUTOKITCH · Website';
    browser.append(dots, address); shell.append(browser);
    host.append(shell);
    let scheduled = false;
    function fit() {
      scheduled = false;
      const frame = host.querySelector('iframe.ak');
      if (!frame) { shell.hidden = true; return; }
      const p = profiles[Number(frame.dataset.i)];
      if (!p) { shell.hidden = true; return; }
      shell.hidden = false;
      const width = host.clientWidth, height = host.clientHeight;
      if (!width || !height) return;
      const outerW = p.w + 2 * p.bx, outerH = p.h + (p.bt ?? p.by) + p.by;
      const scale = Math.min(1, Math.max(1, width - 32) / outerW, Math.max(1, height - 32) / outerH);
      const floating = panel.hasAttribute('data-floating63');
      const x = floating ? width - outerW * scale : (width - outerW * scale) / 2;
      const y = floating ? 0 : (height - outerH * scale) / 2;
      name.textContent = p.name;
      detail.textContent = p.detail;
      host.dataset.deviceKind = p.kind;
      host.dataset.nativeSize = `${p.w}x${p.h}`;
      host.dataset.previewScale = scale.toFixed(5);
      Object.assign(shell.style, {
        left:`${x}px`, top:`${y}px`, width:`${outerW}px`, height:`${outerH}px`,
        borderRadius:`${p.radius}px`, transform:`scale(${scale})`,
      });
      Object.assign(frame.style, {
        width:`${p.w}px`, height:`${p.h}px`, left:`${x + p.bx * scale}px`,
        top:`${y + (p.bt ?? p.by) * scale}px`, transform:`scale(${scale})`,
        borderRadius:`${p.screen}px`,
      });
    }
    function schedule() {
      if (scheduled) return;
      scheduled = true;
      requestAnimationFrame(fit);
    }
    new ResizeObserver(schedule).observe(host);
    new MutationObserver(changes => {
      if (changes.some(c => c.target.tagName === 'IFRAME' ||
          [...c.addedNodes].some(n => n.nodeType === 1 && n.tagName === 'IFRAME'))) schedule();
    }).observe(host, {childList:true, subtree:true, attributes:true, attributeFilter:['class']});
    schedule();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();
