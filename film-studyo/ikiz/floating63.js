/* Presentation adapter: preserve live frame indices, existing role checks and panel toggle. */
(() => {
  'use strict';
  function start() {
    const panel = document.getElementById('yan'), tabs = document.getElementById('sekmeler');
    const host = document.getElementById('cerceve');
    if (!panel || !tabs || !host) return;
    // Prepare the two small design views before the CAD viewer opens its live panels.
    // Switching to them then reuses a ready document instead of starting a late navigation.
    for (const [i, title, url] of [
      [7, 'WEBSITE', '../musteri/website62/index.html'],
      [8, 'Müşteri uygulaması · tasarım', '../musteri/website62/app/index.html'],
    ]) {
      if (host.querySelector(`iframe[data-i="${i}"]`)) continue;
      const frame = document.createElement('iframe'); frame.dataset.i = i;
      frame.title = title; frame.loading = 'eager'; frame.src = url; host.append(frame);
    }
    let ready = false;
    function install() {
      if (ready || !tabs.querySelector('button[data-i="7"]') || typeof window.IKIZ_EKRAN_AC !== 'function') return;
      ready = true; waiting.disconnect(); panel.dataset.floating63 = 'true';
      const bar = document.createElement('div'); bar.className = 'floating-picker63';
      const label = document.createElement('label'); label.textContent = 'Ekran';
      const select = document.createElement('select'); select.setAttribute('aria-label', 'Gösterilecek ekran');
      const groups = [
        ['Müşteri', [[0, 'Kiosk'], [1, 'Telefon · web sipariş'], [8, 'Telefon · uygulama tasarımı']]],
        ['İşletme', [[5, 'Tablet · personel / kasa'], [6, 'Tablet · yönetici']]],
        ['Diğer ekranlar', [[3, 'QR teslim paneli'], [4, 'Dolap üstü ekran'], [7, 'Website · tarayıcı']]],
      ];
      for (const [name, options] of groups) {
        const group = document.createElement('optgroup'); group.label = name;
        for (const [i, text] of options) { const option = document.createElement('option'); option.value = i; option.textContent = text; group.append(option); }
        select.append(group);
      }
      select.onchange = () => window.IKIZ_EKRAN_AC(Number(select.value));
      label.append(select); bar.append(label);
      const full = document.createElement('button'); full.type = 'button'; full.textContent = '↗';
      full.setAttribute('aria-label', 'Seçili tasarımı tam boy aç');
      full.title = 'Seçili tasarımı tam boy aç';
      full.onclick = () => { const link = panel.querySelector('.preview-open62:not([hidden])'); if (link) link.click(); };
      bar.append(full);
      const close = document.createElement('button'); close.type = 'button'; close.textContent = '×';
      close.setAttribute('aria-label', 'Ekranı kapat'); close.title = 'Ekranı kapat';
      close.onclick = () => document.getElementById('panelBtn')?.click(); bar.append(close);
      panel.prepend(bar);
      function sync() {
        const frame = host.querySelector('iframe.ak');
        if (!frame) return;
        const i = Number(frame.dataset.i);
        select.value = String(i === 2 ? 1 : i);
        full.hidden = ![7, 8].includes(i);
        panel.dataset.deviceKind = host.dataset.deviceKind || 'kiosk';
      }
      new MutationObserver(sync).observe(host, {childList:true, attributes:true, subtree:true, attributeFilter:['class','data-device-kind']});
      sync();
    }
    const waiting = new MutationObserver(install); waiting.observe(tabs, {childList:true}); install();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, {once:true});
  else start();
})();
