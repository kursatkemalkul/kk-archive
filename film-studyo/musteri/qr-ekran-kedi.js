// QR-9 (Kemal 22 Eki): idle screen (REKLAM mode, no active order) — our cat
// (kedi22 character: orange-cream stripes, white tail tip) walks in side
// profile from the far left to the right; "PİN PİDE PİZZA" appears letter by
// letter behind it. Order arrives -> #screen leaves REKLAM -> layer hides at once.
// Same page is the twin's 3D screen texture, so both show the same animation.
const W = 1024, H = 128;                       // QR screen pixel size (qr_ekran.js piksel)
const SVG_W = 210, SVG_H = 112, OLCEK = .92;   // cat drawing box and on-screen scale
const BACAK = 38, ACI = 34;                    // leg length (svg units), swing amplitude (deg)
const PERIYOT = .8;                            // one 4-leg walk cycle (s)
const ADIM = 2 * BACAK * Math.sin(ACI * Math.PI / 180) * OLCEK;  // ground travel per cycle (px)
const HIZ = ADIM / PERIYOT;                    // feet do not slide
const BEKLE = 3, SOLMA = 1.1;                  // text hold after exit, fade-out (s)
const YAZI = 'PİN PİDE PİZZA';
const R = {turuncu: '#e8923a', koyu: '#c9642f', krem: '#f8eddf', burun: '#e07a5f', cizgi: '#5a2a16'};

const css = document.createElement('style');
css.textContent = `
#kediSahne{position:absolute;inset:0;z-index:5;display:none;overflow:hidden;pointer-events:none;background:radial-gradient(120% 140% at 50% 120%,#5a2410 0%,#2a1208 55%,#1a0b05 100%)}
#screen[data-mode=REKLAM] #kediSahne{display:block}
#screen[data-mode=REKLAM] #promotion{visibility:hidden}
#kediYazi{position:absolute;left:0;right:0;top:50%;transform:translateY(-54%);display:flex;justify-content:center;gap:.04em;font:800 64px/1 Poppins,'Poppins',system-ui,sans-serif;letter-spacing:.02em;color:${R.krem};text-shadow:0 2px 0 #00000055}
#kediYazi span{display:inline-block;opacity:0;transform:translateY(10px) scale(.6);transition:opacity .55s ease-out,transform .55s cubic-bezier(.2,1.4,.4,1)}
#kediYazi span.on{opacity:1;transform:none}
#kediYazi span.vurgu{color:${R.turuncu}}
#kediYazi span.bosluk{width:.32em}
#kediYazi.sol span{opacity:0!important;transition:opacity ${SOLMA}s ease-in}
#kediSvg{position:absolute;left:0;bottom:2px;width:${SVG_W * OLCEK}px;height:${SVG_H * OLCEK}px;will-change:transform}
`;
document.head.append(css);

const svgNS = 'http://www.w3.org/2000/svg';
// Side-profile cat facing right. Pivots: shoulders (138,58) / (128,58), hips (64,60) / (54,60).
const bacak = (id, x, uzak) => `<g id="${id}" transform="translate(${x} 58)"><rect x="-6.5" y="-4" width="13" height="${BACAK + 4}" rx="6.5" fill="${uzak ? R.koyu : R.turuncu}"/><ellipse cx="0" cy="${BACAK - 1}" rx="8" ry="5.5" fill="${uzak ? '#e6d6c4' : R.krem}"/></g>`;
const SVG = `<svg id="kediSvg" viewBox="0 0 ${SVG_W} ${SVG_H}" xmlns="${svgNS}" aria-hidden="true">
 <g id="kGovdeSal">
  ${bacak('kBacakSagArka', 56, true)}${bacak('kBacakSagOn', 130, true)}
  <g id="kKuyruk" transform="translate(44 46)">
   <path d="M0 0 C -22 -2 -30 -18 -24 -34 C -21 -42 -13 -44 -9 -38" fill="none" stroke="${R.turuncu}" stroke-width="11" stroke-linecap="round"/>
   <path d="M-22 -26 C -21 -36 -14 -44 -9 -38" fill="none" stroke="${R.krem}" stroke-width="11.5" stroke-linecap="round"/>
   <path d="M-8 1 l-2 -6 M-15 -3 l-4 -5 M-21 -9 l-6 -3" stroke="${R.koyu}" stroke-width="3" stroke-linecap="round"/>
  </g>
  <path d="M40 52 C 38 30 70 22 100 24 C 128 26 150 30 154 48 C 157 62 140 72 118 73 L 66 73 C 50 73 41 65 40 52 Z" fill="${R.turuncu}"/>
  <path d="M120 70 C 132 70 150 64 152 52 C 146 64 132 66 118 66 Z" fill="${R.krem}" opacity=".9"/>
  <g stroke="${R.koyu}" stroke-width="5" stroke-linecap="round" fill="none" opacity=".85">
   <path d="M72 26 C 70 34 70 40 72 46"/><path d="M86 24 C 84 33 84 40 86 47"/><path d="M100 24 C 98 33 98 40 100 47"/><path d="M114 26 C 112 34 112 40 114 46"/><path d="M58 32 C 57 38 57 43 59 48"/>
  </g>
  ${bacak('kBacakSolArka', 66, false)}${bacak('kBacakSolOn', 140, false)}
  <g id="kBas" transform="translate(166 40)">
   <path d="M-14 -12 L -11 -32 L 0 -18 Z" fill="${R.turuncu}"/><path d="M-11.5 -15 L -10 -27 L -4 -18 Z" fill="${R.krem}"/>
   <path d="M4 -18 L 14 -32 L 16 -11 Z" fill="${R.turuncu}"/><path d="M7 -17 L 13 -26 L 14 -14 Z" fill="${R.krem}"/>
   <ellipse cx="0" cy="0" rx="22" ry="19" fill="${R.turuncu}"/>
   <path d="M-6 6 C -6 -6 18 -8 21 4 C 22 14 10 19 2 18 C -4 17 -6 12 -6 6 Z" fill="${R.krem}"/>
   <path d="M-13 -9 l4 -3 M-15 -3 l5 -1" stroke="${R.koyu}" stroke-width="3" stroke-linecap="round"/>
   <path d="M2 -3 q4 3 8 0" stroke="${R.cizgi}" stroke-width="2" fill="none" stroke-linecap="round"/>
   <path d="M17 3 l4 0 l-2 3 z" fill="${R.burun}"/>
   <path d="M19 7 q-2 3 -5 2 M19 7 q1 3 4 2" stroke="${R.cizgi}" stroke-width="1.4" fill="none" stroke-linecap="round"/>
  </g>
 </g>
</svg>`;

function kur() {
  const screen = document.getElementById('screen');
  if (!screen || document.getElementById('kediSahne')) return;
  const sahne = document.createElement('div'); sahne.id = 'kediSahne';
  const yazi = document.createElement('div'); yazi.id = 'kediYazi';
  for (const [i, ch] of [...YAZI].entries()) {
    const s = document.createElement('span'); s.textContent = ch === ' ' ? '' : ch;
    if (ch === ' ') s.className = 'bosluk'; else if (/[PZ]/.test(ch) && i > 3) s.classList.add('vurgu');
    yazi.append(s);
  }
  sahne.append(yazi); sahne.insertAdjacentHTML('beforeend', SVG); screen.append(sahne);
  const kedi = sahne.querySelector('#kediSvg'), sal = sahne.querySelector('#kGovdeSal'), bas = sahne.querySelector('#kBas'), kuyruk = sahne.querySelector('#kKuyruk');
  const bacaklar = [['kBacakSolArka', 0], ['kBacakSolOn', .25], ['kBacakSagArka', .5], ['kBacakSagOn', .75]]
    .map(([id, faz]) => [sahne.querySelector('#' + id), faz, +sahne.querySelector('#' + id).getAttribute('transform').match(/translate\(([\d.]+)/)[1]]);
  const harfler = [...yazi.children];
  const kediW = SVG_W * OLCEK, BAS = -kediW - 8, SON = W + 8;
  const yuruSure = (SON - BAS) / HIZ;
  let t0 = null, son = 0, calisiyor = false, raf = 0;
  const harfX = () => harfler.map(s => { const r = s.getBoundingClientRect(), p = sahne.getBoundingClientRect(); return (r.left - p.left + r.width / 2) / (p.width / W || 1); });
  let hx = null;
  function poz(t) {                                // t: seconds since cycle start (also used by previews)
    const x = BAS + Math.min(t, yuruSure) * HIZ, f = (t / PERIYOT) % 1, p = f * 2 * Math.PI;
    kedi.style.transform = `translateX(${x.toFixed(2)}px)`;
    sal.setAttribute('transform', `translate(0 ${(1.6 * Math.sin(2 * p)).toFixed(2)})`);
    bas.setAttribute('transform', `translate(166 ${(40 + 1.4 * Math.sin(2 * p + .7)).toFixed(2)}) rotate(${(2.5 * Math.sin(2 * p + .7)).toFixed(2)})`);
    kuyruk.setAttribute('transform', `translate(44 46) rotate(${(7 * Math.sin(p * .5)).toFixed(2)})`);
    for (const [g, faz, gx] of bacaklar) {
      const q = 2 * Math.PI * (f + faz), aci = ACI * Math.sin(q), kalk = Math.max(0, Math.cos(q)) * 3.2;  // swing forward while lifted
      g.setAttribute('transform', `translate(${gx} ${(58 - kalk).toFixed(2)}) rotate(${(-aci).toFixed(2)})`);
    }
    hx = hx || harfX();
    const kuyrukUcu = x + 10 * OLCEK;              // a letter appears once the cat's rear has passed it
    harfler.forEach((s, i) => s.classList.toggle('on', t > 0 && kuyrukUcu > hx[i]));
    const bitti = t > yuruSure + BEKLE;
    yazi.classList.toggle('sol', bitti);
    return t > yuruSure + BEKLE + SOLMA + .4;      // true -> restart
  }
  function adim(now) {
    if (!calisiyor) return;
    if (t0 === null) t0 = now;
    if (poz((now - t0) / 1000)) { t0 = now; yazi.classList.remove('sol'); harfler.forEach(s => s.classList.remove('on')); }
    raf = requestAnimationFrame(adim);
  }
  function durum() {
    const aktif = screen.dataset.mode === 'REKLAM';
    if (aktif && !calisiyor) { calisiyor = true; t0 = null; hx = null; raf = requestAnimationFrame(adim); }
    if (!aktif && calisiyor) { calisiyor = false; cancelAnimationFrame(raf); harfler.forEach(s => s.classList.remove('on')); yazi.classList.remove('sol'); }
  }
  new MutationObserver(durum).observe(screen, {attributes: true, attributeFilter: ['data-mode']});
  durum();
  // Previews / tests: freeze at a given time without the loop.
  window.qrKedi = {poz: t => { calisiyor = false; cancelAnimationFrame(raf); hx = null; poz(t); }, devam: () => { calisiyor = false; durum(); }, yuruSure, HIZ, ADIM};
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', kur); else kur();
