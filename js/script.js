// =============================================
// KEMAL KUL — PORTFOLIO CV 2026
// PDF slideshow with per-page zoom + pan
// =============================================

import * as pdfjsLib from 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/build/pdf.min.mjs';
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/build/pdf.worker.min.mjs';

// ──────────────────────────────────────────────────────────────
// Video placement: each video plays AFTER the listed PDF page.
// Set numbers to match your hero pages — adjust freely.
// ──────────────────────────────────────────────────────────────
// Videos placed AFTER all PDF pages (outro) — user moved intro to slide 48 (end).
const OUTRO_VIDEO_IDS = ['MGNGPg5bZgQ'];

const VIDEO_AFTER_PDF_PAGE = [
    { afterPdfPage: 1,  id: 'Mo6jeeaUWHt' },   // slide 2 (after 1st cover)
    { afterPdfPage: 3,  id: 'Q558CfKxWdZ' },   // slide 5
    { afterPdfPage: 9,  id: 'IQR4iTSugyb' },   // slide 12
    { afterPdfPage: 26, id: 'NbyBT3YdRgi' },   // slide 30
    { afterPdfPage: 32, id: '4AR3C88TVjp' },   // slide 37
    { afterPdfPage: 39, id: 'A2z6AA3bWEp' },   // slide 45
];

// ──────────────────────────────────────────────────────────────

const deck = document.getElementById('deck');
const counterCurrent = document.getElementById('page-current');
const counterTotal = document.getElementById('page-total');
const navPrev = document.getElementById('navPrev');
const navNext = document.getElementById('navNext');
const loadingEl = document.getElementById('pdfLoading');
const loadingBar = document.getElementById('pdfLoadingBar');

let pdfDoc = null;
let allSlides = [];
let current = 0;
const renderedPages = new Set();

// Per-page zoom/pan state lives on the wrapper element via dataset & inline transform
function getZoomState(wrap) {
    return {
        scale: parseFloat(wrap.dataset.scale || '1'),
        tx: parseFloat(wrap.dataset.tx || '0'),
        ty: parseFloat(wrap.dataset.ty || '0'),
    };
}
function setZoomState(wrap, s) {
    wrap.dataset.scale = s.scale;
    wrap.dataset.tx = s.tx;
    wrap.dataset.ty = s.ty;
    wrap.style.transform = `translate(${s.tx}px, ${s.ty}px) scale(${s.scale})`;
}
function resetZoom(wrap) {
    setZoomState(wrap, { scale: 1, tx: 0, ty: 0 });
}

// Adobe/Behance CCV embed URL from a video id
function ccvUrl(videoId) {
    return `https://www-ccv.adobe.io/v1/player/ccv/${videoId}/embed?bgcolor=%23000000&autoplay=true&muted=true&api_key=BehancePro2View`;
}

// Create a video slide — iframe stays empty until the slide becomes active (prevents all videos auto-playing at once)
// Accepts a FULL embed URL (ccv or youtube) or a direct .mp4 path (self-hosted, played with a native <video> tag).
function createVideoSlide(src) {
    const videoSlide = document.createElement('section');
    videoSlide.className = 'page page--video';
    const vw = document.createElement('div');
    vw.className = 'video-wrap';
    if (/\.mp4(\?|$)/i.test(src)) {
        const video = document.createElement('video');
        video.dataset.src = src;
        video.muted = true;
        video.loop = true;
        video.playsInline = true;
        video.controls = true;
        video.preload = 'none';
        video.style.cssText = 'width:100%;height:100%;object-fit:cover;background:#000;display:block';
        vw.appendChild(video);
    } else {
        const iframe = document.createElement('iframe');
        iframe.dataset.src = src;
        iframe.setAttribute('frameborder', '0');
        iframe.setAttribute('allowfullscreen', '');
        iframe.setAttribute('allow', 'autoplay; fullscreen');
        iframe.setAttribute('loading', 'lazy');
        vw.appendChild(iframe);
    }
    videoSlide.appendChild(vw);
    return videoSlide;
}

// Create an image slide with a video playing inside a region of the image
// rect = [left%, top%, width%, height%] relative to the image
function createImgVideoSlide(bg, src, rect) {
    const slide = document.createElement('section');
    slide.className = 'page page--video page--imgvid';
    const stage = document.createElement('div');
    stage.style.cssText = 'position:relative;flex:none;width:min(100vw,calc(100dvh*1.31708));aspect-ratio:2027/1539;background:#fff';
    const img = document.createElement('img');
    img.src = bg;
    img.style.cssText = 'width:100%;height:100%;object-fit:contain;display:block';
    const video = document.createElement('video');
    video.dataset.src = src;
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.controls = true;
    video.preload = 'none';
    const [l, t, w, h] = rect;
    video.style.cssText = `position:absolute;left:${l}%;top:${t}%;width:${w}%;height:${h}%;object-fit:cover;background:#fff`;
    stage.appendChild(img);
    stage.appendChild(video);
    slide.appendChild(stage);
    return slide;
}

// Create a full-screen image slide (for added images via the deck manager)
function createImgSlide(src) {
    const slide = document.createElement('section');
    slide.className = 'page page--img';
    const img = document.createElement('img');
    img.src = src;
    img.style.cssText = 'width:100%;height:100%;object-fit:contain;display:block';
    slide.appendChild(img);
    return slide;
}

// Build one PDF page slide (canvas + zoom)
function buildPdfSlide(p) {
    const slide = document.createElement('section');
    slide.className = 'page page--pdf';
    slide.dataset.pdfPage = p;
    const stage = document.createElement('div'); stage.className = 'pdf-stage';
    const wrap = document.createElement('div'); wrap.className = 'pdf-zoom';
    wrap.dataset.scale = '1'; wrap.dataset.tx = '0'; wrap.dataset.ty = '0';
    const canvas = document.createElement('canvas'); canvas.className = 'pdf-page-canvas';
    wrap.appendChild(canvas); stage.appendChild(wrap); slide.appendChild(stage);
    attachZoomHandlers(stage, wrap);
    return slide;
}

// Build deck from deck.json slide list ({t:'pdf',p} | {t:'video',src} | {t:'img',src})
function buildDeckFromConfig(slides) {
    slides.forEach(sl => {
        let el = null;
        if (sl.t === 'pdf') el = buildPdfSlide(sl.p);
        else if (sl.t === 'video' && sl.src) el = createVideoSlide(sl.src);
        else if (sl.t === 'imgvid' && sl.bg && sl.src) el = createImgVideoSlide(sl.bg, sl.src, sl.rect || [2, 19, 96, 76]);
        else if (sl.t === 'img' && sl.src) el = createImgSlide(sl.src);
        if (!el) return;
        deck.appendChild(el);
        allSlides.push(el);
    });
    counterTotal.textContent = String(allSlides.length).padStart(2, '0');
}

// Activate the video for the current slide; pause all others
function activateVideoFor(idx) {
    allSlides.forEach((s, i) => {
        if (!s.classList.contains('page--video')) return;
        const video = s.querySelector('video');
        if (video) {
            if (i === idx) {
                if (!video.src && video.dataset.src) video.src = video.dataset.src;
                video.preload = 'auto';
                video.play().catch(() => {});
            } else if (Math.abs(i - idx) <= 1) {
                // Komşu slayttaki videoyu önden yüklemeye başla (hızlı açılış)
                if (!video.src && video.dataset.src) video.src = video.dataset.src;
                video.preload = 'auto';
                if (!video.paused) video.pause();
            } else if (!video.paused) {
                video.pause();
            }
            return;
        }
        const iframe = s.querySelector('iframe');
        if (i === idx) {
            // Set src to start playback (only for active)
            if (iframe.dataset.src && iframe.src !== iframe.dataset.src) {
                iframe.src = iframe.dataset.src;
            }
        } else {
            // Clear src so the video stops (the iframe is destroyed and can be re-created next time)
            if (iframe.src) {
                iframe.removeAttribute('src');
            }
        }
    });
}

// ───── Build deck ─────
function buildDeck(totalPdfPages) {
    const videoMap = new Map();
    VIDEO_AFTER_PDF_PAGE.forEach(v => videoMap.set(v.afterPdfPage, v.id));

    for (let p = 1; p <= totalPdfPages; p++) {
        const slide = document.createElement('section');
        slide.className = 'page page--pdf';
        slide.dataset.pdfPage = p;

        const stage = document.createElement('div');
        stage.className = 'pdf-stage';

        const wrap = document.createElement('div');
        wrap.className = 'pdf-zoom';
        wrap.dataset.scale = '1';
        wrap.dataset.tx = '0';
        wrap.dataset.ty = '0';

        const canvas = document.createElement('canvas');
        canvas.className = 'pdf-page-canvas';
        wrap.appendChild(canvas);
        stage.appendChild(wrap);
        slide.appendChild(stage);
        deck.appendChild(slide);
        allSlides.push(slide);

        attachZoomHandlers(stage, wrap);

        if (videoMap.has(p)) {
            const videoSlide = createVideoSlide(ccvUrl(videoMap.get(p)));
            deck.appendChild(videoSlide);
            allSlides.push(videoSlide);
        }
    }

    // Outro videos (after all PDF pages) — e.g. moved intro to the end
    OUTRO_VIDEO_IDS.forEach(id => {
        const videoSlide = createVideoSlide(ccvUrl(id));
        deck.appendChild(videoSlide);
        allSlides.push(videoSlide);
    });

    counterTotal.textContent = String(allSlides.length).padStart(2, '0');
}

// ───── Detect device & memory constraints ─────
const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.innerWidth < 768;
// Crisp-zoom multiplier — high on desktop, low on mobile so iOS doesn't crash
const ZOOM_RENDER_MULT = isMobile ? 1.4 : 2.5;
// How many slides on each side of current to keep canvases rendered for
const KEEP_RENDERED_RANGE = isMobile ? 1 : 3;

// ───── Render PDF page on demand (extra resolution so zoom stays crisp) ─────
async function renderPdfPage(slide) {
    const pageNum = parseInt(slide.dataset.pdfPage);
    if (renderedPages.has(pageNum)) return;
    renderedPages.add(pageNum);

    const canvas = slide.querySelector('canvas');
    const page = await pdfDoc.getPage(pageNum);

    const baseViewport = page.getViewport({ scale: 1 });
    const dpr = Math.min(window.devicePixelRatio || 1, isMobile ? 2 : 3);  // cap dpr on mobile

    // Compute biggest display size that fits viewport AND keeps page aspect ratio
    const aspect = baseViewport.width / baseViewport.height;
    let displayW, displayH;
    if (window.innerWidth / window.innerHeight > aspect) {
        displayH = window.innerHeight;
        displayW = displayH * aspect;
    } else {
        displayW = window.innerWidth;
        displayH = displayW / aspect;
    }

    const renderScale = (displayH / baseViewport.height) * ZOOM_RENDER_MULT * dpr;
    const viewport = page.getViewport({ scale: renderScale });

    canvas.width = viewport.width;
    canvas.height = viewport.height;
    canvas.style.width = `${displayW}px`;
    canvas.style.height = `${displayH}px`;

    await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
}

// Free GPU/RAM memory by clearing canvases that are far from current slide
function unloadDistantPages(currentIdx) {
    allSlides.forEach((s, i) => {
        if (!s.classList.contains('page--pdf')) return;
        const distance = Math.abs(i - currentIdx);
        if (distance > KEEP_RENDERED_RANGE) {
            const canvas = s.querySelector('canvas');
            if (canvas && canvas.width > 0) {
                // Setting width to 0 frees the backing pixel buffer
                canvas.width = 0;
                canvas.height = 0;
                renderedPages.delete(parseInt(s.dataset.pdfPage));
            }
        }
    });
}

function preloadAround(idx) {
    const range = isMobile ? 1 : 2;
    for (let i = Math.max(0, idx - range); i <= Math.min(allSlides.length - 1, idx + range); i++) {
        const s = allSlides[i];
        if (s.classList.contains('page--pdf')) {
            renderPdfPage(s).catch(e => console.warn('pdf render fail', i, e));
        }
    }
    // Free memory for distant slides — critical on iOS where tab gets killed at ~500MB
    unloadDistantPages(idx);
}

// ───── Zoom + Pan handlers (per PDF page) ─────
function attachZoomHandlers(stage, wrap) {
    const MIN = 1, MAX = 6;

    function clamp(s) {
        s.scale = Math.min(MAX, Math.max(MIN, s.scale));
        // Limit pan so canvas can't drift off screen completely
        const overhang = (s.scale - 1) / 2 * stage.clientWidth;
        const overhangY = (s.scale - 1) / 2 * stage.clientHeight;
        s.tx = Math.min(overhang, Math.max(-overhang, s.tx));
        s.ty = Math.min(overhangY, Math.max(-overhangY, s.ty));
        if (s.scale <= 1.001) { s.tx = 0; s.ty = 0; s.scale = 1; }
        return s;
    }

    function zoomAt(cx, cy, factor) {
        const r = stage.getBoundingClientRect();
        const px = cx - r.left - r.width / 2;
        const py = cy - r.top - r.height / 2;
        const state = getZoomState(wrap);
        const newScale = state.scale * factor;
        // Keep the cursor point stable: new translation accounts for scale change
        const adjustedScale = Math.min(MAX, Math.max(MIN, newScale));
        const realFactor = adjustedScale / state.scale;
        state.tx = (state.tx - px) * realFactor + px;
        state.ty = (state.ty - py) * realFactor + py;
        state.scale = adjustedScale;
        setZoomState(wrap, clamp(state));
    }

    // Wheel: ctrl/cmd (or trackpad pinch) → continuous zoom toward cursor; normal wheel → pan
    stage.addEventListener('wheel', (e) => {
        if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            // Continuous zoom — factor scales smoothly with deltaY
            const factor = Math.exp(-e.deltaY * 0.01);
            zoomAt(e.clientX, e.clientY, factor);
            return;
        }
        // Trackpad two-finger pan (works diagonally — both deltaX and deltaY)
        const state = getZoomState(wrap);
        if (state.scale > 1.01) {
            e.preventDefault();
            state.tx -= e.deltaX;
            state.ty -= e.deltaY;
            setZoomState(wrap, clamp(state));
        }
    }, { passive: false });

    // Mouse drag pan
    let dragging = false, lastX = 0, lastY = 0;
    stage.addEventListener('mousedown', (e) => {
        const state = getZoomState(wrap);
        if (state.scale <= 1.01) return;
        dragging = true;
        lastX = e.clientX; lastY = e.clientY;
        stage.style.cursor = 'grabbing';
        e.preventDefault();
    });
    window.addEventListener('mousemove', (e) => {
        if (!dragging) return;
        const state = getZoomState(wrap);
        state.tx += (e.clientX - lastX);
        state.ty += (e.clientY - lastY);
        lastX = e.clientX; lastY = e.clientY;
        setZoomState(wrap, clamp(state));
    });
    window.addEventListener('mouseup', () => {
        dragging = false;
        stage.style.cursor = '';
    });

    // Double-click to toggle zoom
    stage.addEventListener('dblclick', (e) => {
        const state = getZoomState(wrap);
        if (state.scale > 1.5) {
            resetZoom(wrap);
        } else {
            zoomAt(e.clientX, e.clientY, 2);
        }
    });

    // Touch: 1 finger → defer to deck navigation; 2 fingers → pinch/pan
    let pinchStartDist = 0, pinchStartScale = 1;
    let twoFingerStartX = 0, twoFingerStartY = 0;
    let twoFingerStartTx = 0, twoFingerStartTy = 0;
    let activeTouches = 0;

    stage.addEventListener('touchstart', (e) => {
        activeTouches = e.touches.length;
        if (activeTouches === 2) {
            e.preventDefault();
            const dx = e.touches[0].clientX - e.touches[1].clientX;
            const dy = e.touches[0].clientY - e.touches[1].clientY;
            pinchStartDist = Math.hypot(dx, dy);
            pinchStartScale = getZoomState(wrap).scale;
            twoFingerStartX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
            twoFingerStartY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
            const s = getZoomState(wrap);
            twoFingerStartTx = s.tx; twoFingerStartTy = s.ty;
        }
    }, { passive: false });

    stage.addEventListener('touchmove', (e) => {
        if (e.touches.length !== 2) return;
        e.preventDefault();
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const dist = Math.hypot(dx, dy);
        const midX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
        const midY = (e.touches[0].clientY + e.touches[1].clientY) / 2;

        // Pinch zoom
        const factor = dist / pinchStartDist;
        const desiredScale = Math.min(6, Math.max(1, pinchStartScale * factor));
        const state = getZoomState(wrap);
        const realFactor = desiredScale / state.scale;
        const r = stage.getBoundingClientRect();
        const px = midX - r.left - r.width / 2;
        const py = midY - r.top - r.height / 2;
        state.tx = (state.tx - px) * realFactor + px + (midX - twoFingerStartX);
        state.ty = (state.ty - py) * realFactor + py + (midY - twoFingerStartY);
        state.scale = desiredScale;
        setZoomState(wrap, clamp(state));
        twoFingerStartX = midX; twoFingerStartY = midY;
    }, { passive: false });

    stage.addEventListener('touchend', (e) => { activeTouches = e.touches.length; });
}

// ───── Page navigation ─────
function updateUI() {
    counterCurrent.textContent = String(current + 1).padStart(2, '0');
    navPrev.classList.toggle('is-hidden', current === 0);
    navNext.classList.toggle('is-hidden', current >= allSlides.length - 1);
    // Reset zoom on the OLD slide when leaving it
    allSlides.forEach((s, i) => {
        if (i !== current) {
            const w = s.querySelector('.pdf-zoom');
            if (w) resetZoom(w);
        }
    });
}

function goTo(idx) {
    if (idx < 0 || idx >= allSlides.length) return;
    current = idx;
    deck.style.scrollSnapType = 'none';
    deck.scrollTo({ left: idx * window.innerWidth, behavior: 'smooth' });
    setTimeout(() => { deck.style.scrollSnapType = 'x mandatory'; }, 600);
    updateUI();
    preloadAround(idx);
    activateVideoFor(idx);
}

navPrev.addEventListener('click', () => goTo(current - 1));
navNext.addEventListener('click', () => goTo(current + 1));

document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    switch (e.key) {
        case 'ArrowRight': case 'PageDown': case ' ':
            e.preventDefault(); goTo(current + 1); break;
        case 'ArrowLeft': case 'PageUp':
            e.preventDefault(); goTo(current - 1); break;
        case 'Home': e.preventDefault(); goTo(0); break;
        case 'End': e.preventDefault(); goTo(allSlides.length - 1); break;
    }
});

// Touch on the deck level: 1-finger swipe = navigate, 2-finger handled by zoom stage
let touchStartX = 0, touchCount = 0;
deck.addEventListener('touchstart', (e) => {
    touchCount = e.touches.length;
    if (touchCount === 1) touchStartX = e.touches[0].clientX;
}, { passive: true });
deck.addEventListener('touchend', (e) => {
    if (touchCount !== 1) return;
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) < 60) return;
    if (dx < 0) goTo(current + 1); else goTo(current - 1);
}, { passive: true });

// Scroll tracking
let scrollTimer = null;
deck.addEventListener('scroll', () => {
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(() => {
        const idx = Math.round(deck.scrollLeft / window.innerWidth);
        if (idx !== current && idx >= 0 && idx < allSlides.length) {
            current = idx;
            updateUI();
            preloadAround(idx);
            activateVideoFor(idx);
        }
    }, 80);
});

// Re-render visible PDF pages on resize / orientation change (phone landscape ↔ portrait)
let resizeTimer = null;
function handleViewportChange() {
    deck.scrollTo({ left: current * window.innerWidth, behavior: 'instant' });
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        // Re-snap scroll position (orientation can shift things)
        deck.scrollTo({ left: current * window.innerWidth, behavior: 'instant' });
        // Invalidate nearby PDF pages so they re-render at the new size
        const range = 2;
        for (let i = Math.max(0, current - range); i <= Math.min(allSlides.length - 1, current + range); i++) {
            const s = allSlides[i];
            if (s.classList.contains('page--pdf')) {
                const pageNum = parseInt(s.dataset.pdfPage);
                renderedPages.delete(pageNum);
                renderPdfPage(s).catch(() => {});
            }
        }
    }, 350);
}
window.addEventListener('resize', handleViewportChange);
window.addEventListener('orientationchange', () => {
    // iOS Safari fires orientationchange before resize completes — wait a tick
    setTimeout(handleViewportChange, 100);
});
// Screen Orientation API (modern browsers) as a backup signal
if (screen.orientation && screen.orientation.addEventListener) {
    screen.orientation.addEventListener('change', () => setTimeout(handleViewportChange, 100));
}

// ───── Boot ─────
(async function init() {
    try {
        // Use range requests + disable autoFetch so initial paint is fast (first page first)
        const loadingTask = pdfjsLib.getDocument({
            url: 'pdf/portfolio.pdf',
            disableAutoFetch: true,
            disableStream: false,
            rangeChunkSize: 65536,
        });
        loadingTask.onProgress = (p) => {
            if (p.total > 0) loadingBar.style.width = Math.min(100, (p.loaded / p.total) * 100) + '%';
        };
        pdfDoc = await loadingTask.promise;
        // deck.json varsa ondan kur (sıra/sil/ekle yönetilebilir); yoksa veya hata olursa eski davranışa düş
        let deckCfg = null;
        try {
            const r = await fetch('deck.json', { cache: 'no-store' });
            if (r.ok) {
                const j = await r.json();
                if (j && Array.isArray(j.slides) && j.slides.length) deckCfg = j.slides;
            }
        } catch (e) { /* yok say → fallback */ }
        if (deckCfg) {
            try {
                buildDeckFromConfig(deckCfg);
            } catch (e) {
                console.warn('deck.json build failed, fallback to PDF order', e);
                allSlides = []; renderedPages.clear(); deck.innerHTML = '';
                buildDeck(pdfDoc.numPages);
            }
        } else {
            buildDeck(pdfDoc.numPages);
        }
        updateUI();
        const firstPdf = allSlides.find(s => s.classList.contains('page--pdf'));
        if (firstPdf) await renderPdfPage(firstPdf);
        preloadAround(0);
        activateVideoFor(0);
        loadingEl.classList.add('is-done');
    } catch (e) {
        console.error('PDF load failed:', e);
        loadingEl.querySelector('.pdf-loading__text').textContent = 'Failed to load PDF';
    }
})();
