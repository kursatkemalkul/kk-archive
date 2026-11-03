import {cleanKeys,putKey} from './camera-keys.js?v=bb9c67aff12d';
import {openScene} from './scene-loader.js?v=d70a9a986c5e';
import {SHOTS as INITIAL_SHOTS,DURATION as INITIAL_DURATION,actionTime,clamp,createStory} from './story.js?v=b95c74d23c10';
let duration=INITIAL_DURATION,SHOTS=INITIAL_SHOTS;const shotAt=t=>SHOTS.find(s=>t>=s.start&&t<s.end)||SHOTS.at(-1);
const $=id=>document.getElementById(id),state={time:0,playing:false,ready:false,speed:1,free:false,edits:{},cameraKeys:[]};
try{const saved=JSON.parse(localStorage.getItem('autokitch.promo.director.v3')||'{}');for(const s of SHOTS){const v=saved[s.id];if(v&&['positionOffset','targetOffset'].every(k=>Array.isArray(v[k])&&v[k].length===3&&v[k].every(n=>Number.isFinite(n)&&Math.abs(n)<10))&&Number.isFinite(v.fovOffset)&&Math.abs(v.fovOffset)<60)state.edits[s.id]=v}}catch{}
try{state.cameraKeys=cleanKeys(JSON.parse(localStorage.getItem('autokitch.film.director.v3')||'[]'))}catch{}
let api,I,motionData,last=performance.now(),booting=false;
function drawShots(){$('scrub').max=duration;document.querySelector('.section-title small').textContent=SHOTS.length+' plan · '+duration+' saniye';$('exportVideo').textContent=duration+' sn videoyu indir';$('shots').replaceChildren();$('shotBands').replaceChildren();for(const [index,s]of SHOTS.entries()){
 const button=document.createElement('button');button.className='shot';button.dataset.shot=s.id;button.innerHTML=`<span class="n">${String(index+1).padStart(2,'0')}</span><span><strong>${s.title}</strong><small>${s.start}–${s.end} sn · ${s.detail}</small></span>`;button.onclick=()=>{pause();seek(s.start+.001)};$('shots').append(button);
 const band=document.createElement('div');band.className='band';band.dataset.shot=s.id;band.style.width=((s.end-s.start)/duration*100)+'%';band.textContent=String(index+1).padStart(2,'0');$('shotBands').append(band);
}
}
drawShots();
function paint(){const shot=shotAt(state.time),index=SHOTS.indexOf(shot);$('scrub').value=state.time;$('position').textContent=state.time.toFixed(2).replace('.',',')+' / '+duration.toFixed(2).replace('.',',')+' sn';$('timecode').textContent='00:'+String(Math.floor(state.time)).padStart(2,'0')+'.'+String(Math.floor(state.time%1*100)).padStart(2,'0');$('camNumber').textContent=String(index+1).padStart(2,'0');$('shotTitle').textContent=shot.title;$('play').textContent=state.playing?'Ⅱ Duraklat':'▶ Oynat';document.querySelectorAll('[data-shot]').forEach(el=>el.classList.toggle('active',el.dataset.shot===shot.id));$('endTitle').style.opacity=clamp((state.time-18.4)/.65);$('saveCamera').disabled=!state.ready||!state.free}
function pause(){state.playing=false;paint()}
function seek(t){state.time=clamp(t,0,duration);if(state.ready)api.render(state.time,state);paint()}
function play(){if(!state.ready)return;ensureSound();if(state.free){state.free=false;$('freeCamera').checked=false;$('screen').classList.remove('free');api.orbit.enabled=false;}if(state.time>=duration)state.time=0;state.playing=!state.playing;last=performance.now();paint()}
$('play').onclick=play;$('restart').onclick=()=>{pause();seek(0)};$('back').onclick=()=>{pause();seek(state.time-.5)};$('forward').onclick=()=>{pause();seek(state.time+.5)};$('scrub').oninput=()=>{pause();seek(Number($('scrub').value))};$('speed').onchange=()=>state.speed=Number($('speed').value);
$('freeCamera').onchange=()=>{pause();state.free=$('freeCamera').checked;$('screen').classList.toggle('free',state.free);if(api)api.orbit.enabled=state.free;paint()};
function persistKeys(){try{localStorage.setItem('autokitch.film.director.v3',JSON.stringify(state.cameraKeys));return true}catch{return false}}
function drawKeys(){
 const list=$('cameraKeys'),marks=$('cameraMarks');list.replaceChildren();marks.replaceChildren();
 for(const k of state.cameraKeys){
  const row=document.createElement('div');row.className='key-row';
  const jump=document.createElement('button');jump.className='key-jump';jump.textContent=k.time.toFixed(2).replace('.',',')+' sn · Kamera';jump.onclick=()=>{pause();state.free=false;$('freeCamera').checked=false;$('screen').classList.remove('free');seek(k.time)};
  const remove=document.createElement('button');remove.className='key-delete';remove.textContent='×';remove.title=k.time.toFixed(2)+' saniyedeki kamerayı sil';remove.setAttribute('aria-label',remove.title);remove.onclick=()=>{state.cameraKeys=state.cameraKeys.filter(v=>v.time!==k.time);persistKeys();drawKeys();seek(state.time)};
  row.append(jump,remove);list.append(row);
  const mark=document.createElement('button');mark.className='camera-mark';mark.style.left=(k.time/duration*100)+'%';mark.title=k.time.toFixed(2)+' sn · Kamera noktasına git';mark.setAttribute('aria-label',mark.title);mark.textContent='◆';mark.onclick=jump.onclick;marks.append(mark);
 }
 $('keySummary').textContent=state.cameraKeys.length===0?'Henüz kamera noktası yok.':state.cameraKeys.length===1?'1 nokta: ikinci bir zamanda açı kaydet.':state.cameraKeys.length+' nokta · Araları yumuşak geçiş';
}
$('saveCamera').onclick=()=>{if(!api||!state.free)return;state.cameraKeys=putKey(state.cameraKeys,{time:state.time,position:api.camera.position.toArray(),target:api.orbit.target.toArray(),fov:api.camera.fov});const stored=persistKeys();drawKeys();$('cameraStatus').textContent=state.time.toFixed(2).replace('.',',')+' sn açısı '+(stored?'kaydedildi.':'bu oturumda kaydedildi (tarayıcı depolaması kapalı).');paint()};
$('resetCameras').onclick=()=>{state.edits={};state.cameraKeys=[];try{localStorage.removeItem('autokitch.promo.director.v3');localStorage.removeItem('autokitch.film.director.v3')}catch{}state.free=false;$('freeCamera').checked=false;$('screen').classList.remove('free');drawKeys();$('cameraStatus').textContent='Kamera noktaları silindi; özgün kamera planına dönüldü.';seek(state.time)};
$('capture').onclick=()=>{if(!state.ready)return;pause();I.sahne.renderer.render(api.scene,api.camera);I.sahne.renderer.domElement.toBlob(blob=>{if(!blob)return;const a=document.createElement('a'),url=URL.createObjectURL(blob);a.href=url;a.download='AUTOKITCH-plan-'+String(SHOTS.indexOf(shotAt(state.time))+1).padStart(2,'0')+'-'+state.time.toFixed(2)+'.png';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)},'image/png')};
let filmSound=null;
function ensureSound(){
 if(!$('filmSound').checked)return null;
 try{if(!filmSound){const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return null;const ctx=new AC(),master=ctx.createGain();master.gain.value=.20;master.connect(ctx.destination);
 const buffer=ctx.createBuffer(1,ctx.sampleRate*2,ctx.sampleRate),samples=buffer.getChannelData(0);let seed=67421;for(let i=0;i<samples.length;i++){seed=(Math.imul(seed,1664525)+1013904223)>>>0;samples[i]=(seed/2147483648-1);}
 function noise(filterType,frequency){const source=ctx.createBufferSource(),filter=ctx.createBiquadFilter(),gain=ctx.createGain();source.buffer=buffer;source.loop=true;filter.type=filterType;filter.frequency.value=frequency;gain.gain.value=0;source.connect(filter);filter.connect(gain);gain.connect(master);source.start();return gain;}
 const bake=noise('highpass',2300),whoosh=noise('lowpass',1100),motor=ctx.createOscillator(),motorGain=ctx.createGain();motor.type='sine';motor.frequency.value=95;motorGain.gain.value=0;motor.connect(motorGain);motorGain.connect(master);motor.start();filmSound={ctx,master,bake,whoosh,motor,motorGain};}
 filmSound.ctx.resume();return filmSound;}catch{return null}
}
function soundFrame(t,active){if(!filmSound)return;const a=filmSound,now=a.ctx.currentTime,on=active&&$('filmSound').checked&&!document.hidden;const p=actionTime(t),baking=on&&p>=11.3&&p<13.3,robot=on&&((p>=5.3&&p<9.1)||(p>=13.3&&p<16.2)||(t>=4.5&&t<9.5));const swell=on?Math.max(...SHOTS.slice(1).map(s=>s.start).map(c=>Math.exp(-Math.pow((t-c)/.11,2)))):0;a.bake.gain.setTargetAtTime(baking?.18*(.5+.5*Math.pow(Math.sin(t*51),8)):0,now,.012);a.whoosh.gain.setTargetAtTime(swell*.28,now,.015);a.motorGain.gain.setTargetAtTime(robot?.07:0,now,.03);a.motor.frequency.setTargetAtTime(95+30*Math.sin(t*3),now,.05)}
$('filmSound').onchange=()=>{if($('filmSound').checked)ensureSound();soundFrame(state.time,state.playing||recording)};
let recording=false,abortExport=false;
function downloadFilm(blob,name){const a=document.createElement('a'),url=URL.createObjectURL(blob);a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),30000)}
async function exportFilm(seconds){
 if(!state.ready||recording)return;
 const canvas=I.sahne.renderer.domElement,renderer=I.sahne.renderer;
 if(!window.MediaRecorder||!canvas.captureStream){$('exportStatus').textContent='Video kaydı bu tarayıcıda desteklenmiyor. Güncel Chrome kullan.';return}
 const mime=['video/mp4','video/mp4;codecs=avc1.42001F','video/webm;codecs=vp9','video/webm;codecs=vp8','video/webm'].find(v=>MediaRecorder.isTypeSupported(v));
 if(!mime){$('exportStatus').textContent='Tarayıcı uygun bir video biçimi sunmuyor.';return}
 recording=true;abortExport=false;pause();
 const original={time:state.time,free:state.free,ratio:renderer.getPixelRatio(),size:renderer.getSize(new I.THREE.Vector2()),aspect:api.camera.aspect,position:api.camera.position.clone(),target:api.orbit.target.clone(),quaternion:api.camera.quaternion.clone(),up:api.camera.up.clone(),fov:api.camera.fov};
 const controls=[...document.querySelectorAll('button,input,select')].map(el=>[el,el.disabled]);controls.forEach(([el])=>el.disabled=true);$('exportCancel').hidden=false;$('exportCancel').disabled=false;
 state.free=false;$('freeCamera').checked=false;$('screen').classList.remove('free');api.orbit.enabled=false;
 const start=seconds===duration?0:Math.min(state.time,duration-seconds);let stream,recorder,failed,frames=0,audioDestination;const chunks=[];
 try{
  if(document.hidden)throw Error('Kayıt sırasında stüdyo sekmesi görünür olmalı.');
  renderer.setPixelRatio(1);renderer.setSize(1280,720,false);api.camera.aspect=16/9;state.time=start;api.render(state.time,state);renderer.render(api.scene,api.camera);
  stream=canvas.captureStream(30);const sound=ensureSound();if(sound){audioDestination=sound.ctx.createMediaStreamDestination();sound.master.connect(audioDestination);for(const track of audioDestination.stream.getAudioTracks())stream.addTrack(track)}recorder=new MediaRecorder(stream,{mimeType:mime,videoBitsPerSecond:6000000});
  const stopped=new Promise((resolve,reject)=>{recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data)};recorder.onstop=resolve;recorder.onerror=e=>{failed=e.error||Error('Video kaydı başarısız');reject(failed)}});
  stopped.catch(()=>{});recorder.start(250);const beginning=performance.now();
  while(true){
   if(abortExport)throw Error('Video kaydı iptal edildi.');if(document.hidden)throw Error('Sekme arka plana geçtiği için kayıt durduruldu. Stüdyo açıkken tekrar dene.');if(failed)throw failed;
   const elapsed=Math.min(seconds,(performance.now()-beginning)/1000);state.time=start+elapsed;
   if(canvas.width!==1280||canvas.height!==720){renderer.setSize(1280,720,false);api.camera.aspect=16/9;}
   api.render(state.time,state);renderer.render(api.scene,api.camera);frames++;paint();$('exportStatus').textContent='Kaydediliyor: '+elapsed.toFixed(1)+' / '+seconds+' sn · 720p · sekmeyi açık tut';
   if(elapsed>=seconds)break;await new Promise(requestAnimationFrame);
  }
  recorder.stop();await stopped;
  const blob=new Blob(chunks,{type:recorder.mimeType||mime});if(!blob.size)throw Error('Video dosyası oluşmadı.');
  const extension=blob.type.includes('mp4')?'mp4':'webm';downloadFilm(blob,'AUTOKITCH-referans-'+start.toFixed(2)+'-'+seconds+'sn.'+extension);
  $('exportStatus').textContent=seconds+' sn temiz video indirildi · '+extension.toUpperCase()+' · 1280×720 · yalnız sahne, arayüz yok.';
 }catch(e){$('exportStatus').textContent=e.message||'Video kaydedilemedi.';}
 finally{
  if(recorder&&recorder.state!=='inactive'){recorder.onerror=null;recorder.stop()}
  stream?.getTracks().forEach(t=>t.stop());if(audioDestination)filmSound.master.disconnect(audioDestination);soundFrame(state.time,false);renderer.setPixelRatio(original.ratio);renderer.setSize(original.size.x,original.size.y,false);api.camera.aspect=original.aspect;
  state.time=original.time;state.free=original.free;$('freeCamera').checked=state.free;$('screen').classList.toggle('free',state.free);controls.forEach(([el,disabled])=>el.disabled=disabled);$('exportCancel').hidden=true;recording=false;seek(state.time);if(original.free){api.camera.position.copy(original.position);api.camera.quaternion.copy(original.quaternion);api.camera.up.copy(original.up);api.camera.fov=original.fov;api.orbit.target.copy(original.target);api.camera.updateProjectionMatrix();}
 }
}
$('exportScanner').onclick=()=>{pause();seek(4.5);exportFilm(5)};$('exportVideo').onclick=()=>exportFilm(duration);$('exportSample').onclick=()=>exportFilm(5);$('exportCancel').onclick=()=>abortExport=true;
$('fullscreen').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await $('screen').requestFullscreen()}catch{}};
addEventListener('keydown',e=>{if(recording)return;if(/INPUT|TEXTAREA|SELECT/.test(e.target.tagName)||e.ctrlKey||e.metaKey||e.altKey)return;if(e.code==='Space'){e.preventDefault();play()}if(e.code==='ArrowRight'||e.code==='ArrowLeft'){e.preventDefault();pause();seek(state.time+(e.code==='ArrowRight'?1:-1)*(e.shiftKey ? 0.5 : 1/24))}if(e.code==='Home'){e.preventDefault();pause();seek(0)}if(e.code==='End'){e.preventDefault();pause();seek(duration)}});
async function boot(){if(booting)return;booting=true;state.ready=false;state.playing=false;$('play').disabled=true;$('loading').hidden=false;$('retry').hidden=true;$('loadingTitle').textContent='Dükkân hazırlanıyor';try{
 const dataPromise=fetch(new URL('motion.json?v=2839944c622a',import.meta.url)).then(r=>{if(!r.ok)throw Error('Hareket verisi yüklenemedi');return r.json()});
 I=await openScene($('scene'),text=>$('loadingTitle').textContent=text);const data=await dataPromise;motionData=data;api=createStory(I,data);I.kancalar.push(()=>api.render(state.time,state));state.ready=true;$('loading').hidden=true;$('play').disabled=false;$('capture').disabled=false;$('exportVideo').disabled=false;$('exportSample').disabled=false;$('exportScanner').disabled=false;$('reloadDirector').disabled=false;seek(0);window.AUTOKITCH_FILM={state,seek,pause,play,shots:SHOTS,get scene(){return I},get api(){return api}};
 }catch(e){$('loadingTitle').textContent='Sahne açılamadı';$('loadingDetail').textContent=e.message;$('retry').hidden=false;console.error(e)}finally{booting=false}}
$('reloadDirector').onclick=async()=>{if(!state.ready||recording)return;pause();$('reloadDirector').disabled=true;try{const updated=await import('./story.js?director='+Date.now());api.dispose?.();api=updated.createStory(I,motionData);SHOTS=updated.SHOTS;duration=updated.DURATION;drawShots();state.free=false;$('freeCamera').checked=false;$('screen').classList.remove('free');seek(state.time);$('exportStatus').textContent='Kamera kurgusu güncellendi; CAD modelleri yeniden yüklenmedi.'}catch(e){$('exportStatus').textContent='Kamera güncellenemedi: '+e.message}finally{$('reloadDirector').disabled=false}};
$('retry').onclick=boot;
function tick(now){const dt=Math.min(.1,Math.max(0,(now-last)/1000));last=now;if(state.playing&&state.ready){state.time+=dt*state.speed;if(state.time>duration){if($('loop').checked)state.time%=duration;else{state.time=duration;state.playing=false}}paint()}soundFrame(state.time,state.playing||recording);requestAnimationFrame(tick)}
drawKeys();paint();boot();requestAnimationFrame(tick);
