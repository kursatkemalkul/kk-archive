/* Preview navigation only. Existing order routes, role checks and frame indices stay intact. */
(() => {
  'use strict';
  const extra = {
    7: ['WEBSITE', '../musteri/website62/index.html'],
    8: ['Müşteri uygulaması · tasarım', '../musteri/website62/app/native.html'],
  };
  function start() {
    const tabs = document.getElementById('sekmeler');
    const host = document.getElementById('cerceve');
    if (!tabs || !host) return;
    let ready = false;
    function install() {
      if (ready || !tabs.querySelector('button[data-i="6"]') || typeof window.IKIZ_EKRAN_AC !== 'function') return;
      ready = true;
      observer.disconnect();
      const originalOpen = window.IKIZ_EKRAN_AC;
      const labels = {1:'MÜŞTERİ SİPARİŞ', 4:'DOLAP ÜSTÜ EKRAN', 5:'PERSONEL / KASA'};
      for (const [i, text] of Object.entries(labels)) tabs.querySelector(`button[data-i="${i}"]`).textContent = text;
      // Keep index 2 available for existing tracking links; it is a screen inside the customer flow.
      tabs.querySelector('button[data-i="2"]').hidden = true;
      const website = document.createElement('button');
      website.type = 'button'; website.dataset.i = '7'; website.textContent = extra[7][0];
      website.title = 'Ayrı AUTOKITCH websitesi · tasarım önizlemesi';
      website.onclick = () => open(7);
      tabs.append(website);
      const modes = document.createElement('div');
      modes.className = 'customer-preview62'; modes.setAttribute('role', 'group');
      modes.setAttribute('aria-label', 'Müşteri ekranı önizlemesi');
      for (const [i, text] of [[1, 'Web sipariş'], [8, 'iOS / Android · tasarım']]) {
        const button = document.createElement('button'); button.type = 'button';
        button.textContent = text; button.dataset.mode = i; button.onclick = () => open(i);
        modes.append(button);
      }
      const note = document.createElement('p'); modes.append(note);
      tabs.after(modes);
      const full = document.createElement('a'); full.className = 'preview-open62';
      full.target = '_self'; full.rel = 'noopener';
      (document.querySelector('.device-caption59') || modes).append(full);
      function sync() {
        const frame = host.querySelector('iframe.ak');
        if (!frame) return;
        const i = Number(frame.dataset.i), customer = [1, 2, 8].includes(i);
        modes.hidden = !customer;
        tabs.querySelectorAll('button[data-i]').forEach(button => {
          button.classList.toggle('ak', Number(button.dataset.i) === (customer ? 1 : i));
        });
        modes.querySelectorAll('button').forEach(button => {
          const selected = Number(button.dataset.mode) === (i === 2 ? 1 : i);
          button.classList.toggle('ak', selected); button.setAttribute('aria-pressed', String(selected));
        });
        note.textContent = i === 8 ? 'Uygulama tasarımı · Gerçek sipariş ve ödeme oluşturmaz.' :
          'Sipariş takibi, müşteri sipariş akışının içindedir.';
        full.hidden = ![7, 8].includes(i);
        if (!full.hidden) {
          full.href = extra[i][1];
          full.textContent = i === 7 ? 'Websiteyi tam boy aç ↗' : 'Uygulama tasarımını tam boy aç ↗';
        }
      }
      function open(i) {
        if (!extra[i]) originalOpen(i);
        else {
          let frame = host.querySelector(`iframe[data-i="${i}"]`);
          if (!frame) {
            frame = document.createElement('iframe'); frame.dataset.i = i;
            frame.src = extra[i][1]; frame.title = extra[i][0]; host.append(frame);
          }
          host.querySelectorAll('iframe').forEach(f => f.classList.toggle('ak', f === frame));
        }
        sync();
      }
      window.IKIZ_EKRAN_AC = open;
      new MutationObserver(changes => {
        if (changes.some(c => c.target.tagName === 'IFRAME' ||
            [...c.addedNodes].some(n => n.nodeType === 1 && n.tagName === 'IFRAME'))) sync();
      }).observe(host, {childList:true, subtree:true, attributes:true, attributeFilter:['class']});
      sync();
    }
    const observer = new MutationObserver(install);
    observer.observe(tabs, {childList:true});
    install();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, {once:true});
  else start();
})();
