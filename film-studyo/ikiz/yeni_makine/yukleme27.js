// Startup only: no PLC, MQTT, order, camera or mechanism commands.
export function yuklemeHatasi(IKIZ, error) {
  IKIZ.yuklendi = false;
  IKIZ.yukleme ??= {};
  Object.assign(IKIZ.yukleme, { durum: 'hata', hata: String(error?.message || error) });
  const host = document.getElementById('yukle');
  if (!host) return;
  const text = document.getElementById('yukleMetin');
  if (text) text.textContent = 'Model açılamadı: ' + IKIZ.yukleme.hata;
  if (!document.getElementById('yukleTekrar')) {
    const button = document.createElement('button');
    button.id = 'yukleTekrar'; button.textContent = 'Yeniden yükle';
    button.style.cssText = 'margin-top:18px;padding:12px 20px;border-radius:7px;cursor:pointer';
    button.onclick = () => location.reload(); // Reload the viewer; never Reset the machine.
    host.append(button);
  }
}

export function yuklemeKur(IKIZ) {
  const state = IKIZ.yukleme = { durum: 'yukleniyor', asama: '', baslangic: performance.now(), alinan: 0, toplam: 0, deneme: 0 };
  // Loading must not wait for a render frame while another tab is active.
  const paint = () => document.hidden ? Promise.resolve() : new Promise(resolve => {
    let timer,done=false;
    const finish=()=>{if(done)return;done=true;clearTimeout(timer);document.removeEventListener('visibilitychange',hidden);resolve();};
    const hidden=()=>{if(document.hidden)finish();};
    document.addEventListener('visibilitychange',hidden);
    timer=setTimeout(finish,80);requestAnimationFrame(finish);
  });
  async function adim(label) {
    state.asama = label;
    const text = document.getElementById('yukleMetin');
    if (text) text.textContent = label + '…';
    await paint();
  }
  async function sinirli(work, label, milliseconds = 120000) {
    let timer,expire;
    const visible=()=>{if(!document.hidden&&expire){clearTimeout(timer);timer=setTimeout(expire,milliseconds);}};
    document.addEventListener('visibilitychange',visible);
    try {
      return await Promise.race([Promise.resolve().then(work), new Promise((_, reject) => {
        expire=()=>{if(document.hidden){timer=setTimeout(expire,1000);return;}reject(new Error(label + ' tamamlanamadı. Yeniden yüklemeyi deneyin.'));};timer=setTimeout(expire,milliseconds);
      })]);
    } finally { clearTimeout(timer);document.removeEventListener('visibilitychange',visible); }
  }
  async function indir(url) {
    const name = new URL(url, location.href).pathname.split('/').pop();
    for (let attempt = 1; attempt <= 2; attempt++) {
      const controller = new AbortController(); let timer, reader, timeout = false;
      const arm = () => { clearTimeout(timer); timer = setTimeout(() => { if(document.hidden){arm();return;}timeout = true; controller.abort(); }, 45000); };
      const visible=()=>{if(!document.hidden)arm();};document.addEventListener('visibilitychange',visible);
      try {
        Object.assign(state, { deneme: attempt, alinan: 0, toplam: 0 }); arm();
        await adim(attempt === 1 ? 'Yeni gövde indiriliyor' : 'Gövde bağlantısı yeniden deneniyor');
        const response = await fetch(url, { signal: controller.signal, cache: attempt === 1 ? 'default' : 'reload' });
        if (!response.ok) {
          const error = new Error(response.status === 401 ? 'Oturum sona erdi; yeniden giriş yapın.' : name + ' alınamadı (HTTP ' + response.status + ').');
          error.retry = response.status >= 500; throw error;
        }
        const total = response.headers.get('content-encoding') ? 0 : Number(response.headers.get('content-length')) || 0;
        state.toplam = total; const chunks = []; let bytes = 0, last = 0;
        reader = response.body.getReader();
        for (;;) {
          const { done, value } = await reader.read(); if (done) break;
          chunks.push(value); bytes += value.byteLength; state.alinan = bytes; arm();
          if (performance.now() - last > 120) {
            last = performance.now();
            const text = document.getElementById('yukleMetin');
            if (text) text.textContent = 'Yeni gövde indiriliyor… ' + (bytes / 1048576).toFixed(1) + (total ? ' / ' + (total / 1048576).toFixed(1) : '') + ' MB';
            const bar = document.getElementById('yukleCubuk');
            if (bar) bar.style.width = (total ? Math.min(99, bytes / total * 100) : 50) + '%';
          }
        }
        clearTimeout(timer);
        const buffer = new Uint8Array(bytes); let offset = 0;
        for (const chunk of chunks) { buffer.set(chunk, offset); offset += chunk.byteLength; } chunks.length = 0;
        const header = bytes >= 12 ? new DataView(buffer.buffer, 0, 12) : null;
        if (!header || header.getUint32(0, true) !== 0x46546c67 || header.getUint32(4, true) !== 2 || header.getUint32(8, true) !== bytes) {
          throw new Error('Gövde dosyası eksik veya geçersiz.');
        }
        const expected = new URL(url, location.href).searchParams.get('v');
        if (/^[a-f0-9]{8,64}$/i.test(expected || '') && globalThis.crypto?.subtle) {
          const digest = await crypto.subtle.digest('SHA-256', buffer);
          const hash = Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2, '0')).join('');
          if (!hash.startsWith(expected.toLowerCase())) throw new Error('Gövde sürümü uyuşmuyor.');
          state.dogrulananSha = hash;
        }
        return buffer.buffer;
      } catch (error) {
        if (attempt === 2 || error.retry === false) throw timeout ? new Error('Gövde indirmesi durdu; bağlantıyı kontrol edip yeniden yükleyin.') : error;
        await new Promise(resolve => setTimeout(resolve, 500));
      } finally {
        clearTimeout(timer);document.removeEventListener('visibilitychange',visible);controller.abort();
        if (reader) { try { await reader.cancel(); } catch (_) {} reader.releaseLock(); }
      }
    }
  }
  async function betik(url) {
    await new Promise((resolve,reject)=>{
      const script=document.createElement('script');script.src=url;script.async=true;
      let timer;
      const cleanup=()=>{clearTimeout(timer);document.removeEventListener('visibilitychange',visible);};
      const expire=()=>{if(document.hidden){timer=setTimeout(expire,1000);return;}cleanup();script.remove();reject(new Error('İstasyon yüklemesi zaman aşımına uğradı.'));};
      const visible=()=>{if(!document.hidden){clearTimeout(timer);timer=setTimeout(expire,60000);}};
      document.addEventListener('visibilitychange',visible);timer=setTimeout(expire,60000);
      script.onload=()=>{cleanup();resolve();};
      script.onerror=()=>{cleanup();script.remove();reject(new Error('İstasyon dosyası alınamadı: '+new URL(url).pathname.split('/').pop()));};
      document.head.append(script);
    });
  }
  function tamam() {
    Object.assign(state, { durum: 'hazir', sure_ms: Math.round(performance.now() - state.baslangic), asama: 'Hazır' });
    state.arkaPlandaHazir=!!document.hidden;document.documentElement.dataset.modelLoadState='ready';const text=document.getElementById('yukleMetin');if(text)text.textContent=document.hidden?'Model hazır · sekmeye döndüğünde görüntülenecek.':'Model hazır';
  }
  return { adim, sinirli, indir, betik, tamam };
}
