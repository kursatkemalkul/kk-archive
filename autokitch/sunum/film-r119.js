(()=>{
 const section=document.getElementById('film'),stage=document.getElementById('pinFilmStage'),video=document.getElementById('pinPresentationVideo'),button=document.getElementById('pinFilmPlay'),status=document.getElementById('pinFilmStatus');
 if(!section||!video||!button)return;
 let loading=null,blobUrl=null,armed=true,snapping=false,lastInput=0,snapTimer=0,initialJump=false;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 async function loadFilm(){
  if(video.dataset.loaded)return;
  if(loading)return loading;
  loading=(async()=>{
   const response=await fetch('/autokitch/sunum/media/pin-film-current.json',{cache:'no-cache'});if(!response.ok)throw Error('manifest');const manifest=await response.json();
   const buffers=await Promise.all(manifest.parts.map(async path=>{const res=await fetch(path);if(!res.ok)throw Error('video');return res.arrayBuffer()}));
   blobUrl=URL.createObjectURL(new Blob(buffers,{type:'video/mp4'}));video.src=blobUrl;video.dataset.loaded='true';video.load();
  })().catch(error=>{loading=null;throw error});
  return loading;
 }
 function state(){stage.classList.toggle('is-playing',!video.paused&&!video.ended);button.setAttribute('aria-label',video.currentTime>0?'Filmi devam ettir':'Tanıtım filmini sesli oynat')}
 button.addEventListener('click',async()=>{
  status.textContent=video.dataset.loaded?'':'Video hazırlanıyor…';button.setAttribute('aria-busy','true');
  try{await loadFilm();video.muted=false;video.volume=1;video.controls=true;await video.play();status.textContent=''}
  catch(_){status.textContent='Oynatmak için tekrar dokun. Bağlantı sorunu sürerse sayfayı yenile.'}
  finally{button.removeAttribute('aria-busy');state()}
 });
 video.addEventListener('timeupdate',()=>{if(video.currentTime>.22)stage.classList.add('has-started')});
 video.addEventListener('playing',state);video.addEventListener('pause',state);
 video.addEventListener('ended',()=>{stage.classList.remove('has-started');video.controls=false;video.currentTime=0;state()});
 video.addEventListener('error',()=>{status.textContent='Video yüklenemedi. Sayfayı yenileyip tekrar deneyin.';state()});
 new IntersectionObserver(entries=>{if(entries.some(x=>x.isIntersecting))loadFilm().catch(()=>{})},{rootMargin:'150% 0px'}).observe(section);
 function top(){return Math.max(0,window.scrollY+section.getBoundingClientRect().top)}
 function snap(){
  clearTimeout(snapTimer);snapTimer=setTimeout(()=>{
   if(Date.now()-lastInput<180){snap();return}
   const rect=section.getBoundingClientRect(),vh=innerHeight,ratio=Math.max(0,Math.min(vh,rect.bottom)-Math.max(0,rect.top))/vh;
   if(ratio<.58||snapping)return;
   if(Math.abs(rect.top)<2)return;
   snapping=true;window.scrollTo({top:top(),behavior:reduced?'instant':'smooth'});setTimeout(()=>snapping=false,650);
  },200);
 }
 for(const type of ['wheel','touchstart','touchmove','pointerdown'])window.addEventListener(type,()=>{lastInput=Date.now()},{passive:true});
 const observer=new IntersectionObserver(entries=>{for(const entry of entries){
  const ratio=entry.intersectionRatio;document.body.classList.toggle('pin-film-view',ratio>.88);
  if(ratio>.6&&armed&&!initialJump){armed=false;snap()}
  if(ratio<.25){armed=true;if(!video.paused)video.pause()}
 }},{threshold:[0,.25,.6,.88,1]});observer.observe(section);
 async function requestedFilm(){
  if(location.hash!=='#film')return;
  initialJump=true;
  if(document.fonts&&document.fonts.ready)await document.fonts.ready;
  if(document.readyState!=='complete')await new Promise(resolve=>window.addEventListener('load',resolve,{once:true}));
  await new Promise(resolve=>setTimeout(resolve,400));
  if(window.ScrollTrigger)window.ScrollTrigger.refresh();
  window.scrollTo({top:top(),behavior:'instant'});armed=false;initialJump=false;
 }
 requestedFilm();window.addEventListener('hashchange',requestedFilm);
 document.addEventListener('visibilitychange',()=>{if(document.hidden&&!video.paused)video.pause()});
 window.addEventListener('pagehide',event=>{if(!event.persisted&&blobUrl)URL.revokeObjectURL(blobUrl)},{once:true});
})();
