(() => {
  const videos = document.getElementById('sektor-videolari');
  const suppliers = document.getElementById('tedarik-teklifleri');
  const sourceURL = '/autokitch/otonom/';
  let sourceRequest;

  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  }

  function disclosure(title) {
    const details = element('details', 'sunum-acilir arastirma-grup');
    details.append(element('summary', '', title));
    return details;
  }

  function text(source, selector) {
    return source.querySelector(selector)?.textContent.trim() || '';
  }

  function readSource() {
    sourceRequest ??= fetch(sourceURL).then(async response => {
      if (!response.ok) throw new Error('Otonom sayfası yüklenemedi');
      const template = document.createElement('template');
      template.innerHTML = await response.text();
      return template.content;
    }).catch(error => {
      sourceRequest = undefined;
      throw error;
    });
    return sourceRequest;
  }

  function videoCard(source) {
    const heading = text(source, 'h4');
    const src = source.querySelector('iframe')?.getAttribute('src') || '';
    const id = src.match(/^https:\/\/www\.youtube-nocookie\.com\/embed\/([\w-]{11})(?:\?|$)/)?.[1];
    if (!id) return null;
    const card = element('article', 'arastirma-kart video-kart');
    const copy = element('div', 'video-kart-metin');
    copy.append(element('small', '', text(source, '.vk-ulke')), element('h3', '', heading),
      element('p', '', text(source, '.vk-ust p')));
    const link = element('a', '', 'YouTube’da izle');
    link.href = 'https://www.youtube.com/watch?v=' + id;
    link.target = '_blank';
    link.rel = 'noopener';
    const player = element('div', 'arastirma-oynatici');
    player.dataset.video = id;
    player.dataset.title = heading;
    card.append(copy, player, link);
    return card;
  }

  function buildVideos(source) {
    const contents = document.createDocumentFragment();
    for (const category of source.querySelectorAll('#dunya .vkat-wrap > .vkat')) {
      const originalGrid = category.nextElementSibling;
      if (!originalGrid?.matches('.vgrid')) continue;
      const grid = element('div', 'arastirma-video-izgara');
      for (const item of originalGrid.querySelectorAll('.vk')) {
        const card = videoCard(item);
        if (card) grid.append(card);
      }
      if (!grid.childElementCount) continue;
      const group = disclosure(text(category, 'h3'));
      group.append(grid);
      group.addEventListener('toggle', () => updatePlayers(group));
      contents.append(group);
    }
    return contents;
  }

  function updatePlayers(group) {
    for (const player of group.querySelectorAll('[data-video]')) {
      if (!videos.open || !group.open) {
        player.replaceChildren();
      } else if (!player.firstChild) {
        const frame = element('iframe');
        frame.title = player.dataset.title;
        frame.loading = 'lazy';
        frame.allow = 'encrypted-media; picture-in-picture; fullscreen';
        frame.allowFullscreen = true;
        frame.referrerPolicy = 'strict-origin-when-cross-origin';
        frame.src = 'https://www.youtube-nocookie.com/embed/' + player.dataset.video + '?rel=0';
        player.append(frame);
      }
    }
  }

  function supplierCard(source) {
    const card = element('article', 'arastirma-kart teklif-kart');
    const name = text(source, '.sup-name');
    const heading = element('h3', '', name);
    const original = source.querySelector('.sup-name a[href]');
    if (original && /^https?:\/\//i.test(original.getAttribute('href'))) {
      const link = element('a', '', name);
      link.href = original.getAttribute('href');
      link.target = '_blank';
      link.rel = 'noopener';
      heading.replaceChildren(link);
    }
    card.append(heading);
    for (const [selector, className] of [
      ['.sup-mach', ''], ['.sup-price', 'teklif-fiyat'], ['.sup-tech', 'teklif-not'],
      ['.sup-sent', 'teklif-not'], ['.sup-durum', 'teklif-durum']
    ]) {
      const value = text(source, selector).replace(/^📍\s*/u, '');
      if (value) card.append(element('p', className, value));
    }
    return card;
  }

  function buildSuppliers(source) {
    const titles = ['Kendi üretim hattımız', 'Doğrudan ilgili makineler', 'Hatta eklenebilecek modüller',
      'İçecek sistemleri', 'Otomatlar ve destek ekipmanı', 'Kapanan ve elenen firmalar'];
    const contents = document.createDocumentFragment();
    source.querySelectorAll('#fiyatlar .sup-cat').forEach((category, index) => {
      const group = disclosure(titles[index] || category.textContent.trim());
      const list = element('div', 'teklif-grup');
      for (let item = category.nextElementSibling; item && !item.matches('.sup-cat'); item = item.nextElementSibling) {
        if (item.matches('.sup-sub')) list.append(element('h3', 'teklif-alt', item.textContent.trim()));
        if (item.matches('.sup-row')) list.append(supplierCard(item));
        if (item.matches('.sup-dead')) {
          for (const row of item.querySelectorAll('tr')) {
            const [name, ...description] = Array.from(row.cells, cell => cell.textContent.trim());
            const card = element('article', 'arastirma-kart teklif-kart');
            card.append(element('h3', '', name), element('p', '', description.join(' · ')));
            list.append(card);
          }
        }
      }
      if (list.childElementCount) {
        group.append(list);
        contents.append(group);
      }
    });
    return contents;
  }

  function refreshWhenResized(container) {
    let lastHeight = 0;
    new ResizeObserver(([entry]) => {
      const height = Math.round(entry.contentRect.height);
      if (lastHeight === height) return;
      lastHeight = height;
      window.ScrollTrigger?.refresh();
    }).observe(container);
  }

  function loadOnOpen(details, build) {
    const target = details.querySelector('.arastirma-icerik');
    let pending = false;
    let ready = false;
    async function load() {
      if (!details.open || pending || ready) return;
      pending = true;
      target.replaceChildren(element('p', 'arastirma-durum', 'Yükleniyor…'));
      try {
        const result = build(await readSource());
        if (!result.childElementCount) throw new Error('Kategori bulunamadı');
        target.replaceChildren(result);
        ready = true;
      } catch {
        const fallback = element('a', '', 'Otonom sayfasında aç');
        fallback.href = sourceURL + (details === suppliers ? '#fiyatlar' : '#dunya');
        target.replaceChildren(element('p', 'arastirma-durum', 'Bu bölüm yüklenemedi.'), fallback);
      } finally {
        pending = false;
      }
    }
    details.addEventListener('toggle', load);
    refreshWhenResized(target);
    load();
  }

  loadOnOpen(videos, buildVideos);
  loadOnOpen(suppliers, buildSuppliers);
  videos.addEventListener('toggle', () => {
    for (const group of videos.querySelectorAll('.arastirma-grup')) updatePlayers(group);
  });
  document.getElementById('vs-ac').addEventListener('click', () => { videos.open = true; });
  if (location.hash === '#sektor-videolari') videos.open = true;
  if (location.hash === '#tedarik-teklifleri') suppliers.open = true;
})();
