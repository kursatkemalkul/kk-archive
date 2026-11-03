import {bakimKopruKur} from './bakim_kopru.js';
import {makineKapakKur} from './makine_kapaklari.js';
import {elleAcmaKur} from './elle_acma.js';
// Motorized parts use the authenticated tablet maintenance path; furniture is visual.
export function parcaListesi(THREE, scene, E) {
  const drawers=new Map();
  for(const [axis,v] of Object.entries(E.eksen||{}))if(axis.startsWith('AX_B_'))
    for(const k of v.katkilar||[])for(const name of k.dugumler||[])
      if(!/__(hamur|tatli|icecek|urun)__/.test(name)&&/__CEKMECE(?:_ARA)?$/.test(name))drawers.set(name,axis.slice(5));
  const targets=[],walls=[];
  scene.traverse(o=>{
    if(!o.isMesh)return;
    let action=o.userData.twinAction;
    if(drawers.has(o.name))action={kind:'cekmece',id:drawers.get(o.name),label:drawers.get(o.name)};
    const qr=/^DT_QR_G(\d+)_(MUSTERI|ROBOT)_DUZ_KAPAK$/.exec(o.name);
    if(qr)action={kind:'qr',id:+qr[1],side:qr[2],label:`QR ${+qr[1]} · ${qr[2]==='ROBOT'?'robot':'müşteri'} kapağı`};
    if(action)targets.push({object:o,action});
    if(o.userData.fixedAccessBarrier||/^DUKKAN__.*(?:DUVAR|KAPI_.*KANAT)|^PERSONEL__.*kapi_kanat/.test(o.name))walls.push(o);
  });
  return {targets,walls};
}
export function tiklamaKur({THREE,IKIZ,scene,kamera,kanvas,E}) {
  bakimKopruKur(IKIZ);
  makineKapakKur(THREE,scene,IKIZ);
  elleAcmaKur(THREE,scene,IKIZ);
  const {targets,walls}=parcaListesi(THREE,scene,E),map=new Map(targets.map(x=>[x.object,x.action]));
  const ray=new THREE.Raycaster(),ndc=new THREE.Vector2();
  const visible=o=>{for(let p=o;p;p=p.parent)if(!p.visible)return false;if(o.layers.mask===0)return false;return (Array.isArray(o.material)?o.material:[o.material]).some(m=>m?.visible!==false);};
  function pick(x,y){
    const r=kanvas.getBoundingClientRect();ndc.set((x-r.left)/r.width*2-1,-(y-r.top)/r.height*2+1);
    ray.setFromCamera(ndc,kamera);scene.updateMatrixWorld(true);
    const hits=ray.intersectObjects(targets.filter(t=>visible(t.object)).map(t=>t.object),false);
    for(const hit of hits){
      const materials=Array.isArray(hit.object.material)?hit.object.material:[hit.object.material];
      if(!materials.some(m=>!(m.clippingPlanes||[]).some(p=>p.distanceToPoint(hit.point)<-.00001)))continue;
      const a=map.get(hit.object);
      if(a.kind==='qr'&&a.side!==(kamera.position.z>2?'MUSTERI':'ROBOT'))continue;
      ray.far=hit.distance-.002;const blocked=ray.intersectObjects(walls.filter(visible),false).length;ray.far=Infinity;
      return blocked?null:a;
    }
    return null;
  }
  const note=document.createElement('div');note.id='parcaTiklamaDurum';note.setAttribute('role','status');note.setAttribute('aria-live','polite');
  note.style.cssText='position:absolute;left:90px;bottom:96px;z-index:7;max-width:440px;padding:8px 12px;border-radius:7px;background:#17232fed;color:#f1f5f8;font:13px system-ui;pointer-events:none;display:none';
  document.getElementById('sahne').append(note);let timer,down=null,hoverAt=0;
  function say(text){note.textContent=text;note.style.display='block';clearTimeout(timer);timer=setTimeout(()=>note.style.display='none',4000);}
  IKIZ.parcaDurumYaz=say;
  const motor=a=>['cekmece','qr','makineKapak'].includes(a?.kind);
  function command(a,ac,basili=false){
    if(a.kind==='cekmece')return {tip:'inceleme.cekmece',cekmece:a.id,ac,basili};
    if(a.kind==='qr')return {tip:'inceleme.qr',goz:a.id,istasyon:a.side,ac};
    return {tip:'inceleme.kapak',goz:a.id,ac,basili};
  }
  function isOpen(a){const f=IKIZ.son||{};
    if(a.kind==='cekmece')return (f.cekmeceler?.[a.id]?.konum||0)>1||f.cekmeceler?.[a.id]?.adim!==0;
    if(a.kind==='makineKapak')return (f.servis_kapaklari?.[a.id]?.konum||0)>.001||!!f.servis_kapaklari?.[a.id]?.istek;
    return !!((f.inceleme?.[a.side==='ROBOT'?'robot':'musteri']||0)&(1<<(a.id-1)))||(f.qr?.[a.id]?.[a.side==='ROBOT'?'kapak':'musteri_kapak']||0)>.001;
  }
  const deadman=a=>a.kind==='cekmece'||a.kind==='makineKapak';
  let hold=null,consumed=false;
  function holdStop(){if(hold){clearTimeout(hold.delay);clearInterval(hold.timer);}hold=null;}
  // P77: service covers and QR doors go as a short maintenance request (MAIN opens only when idle); drawers keep the tablet mode.
  function send(a,ac,basili=false){return IKIZ.bakim.komut(command(a,ac,basili),a.kind==='makineKapak'||a.kind==='qr');}
  // A removed panel has no pick surface, and a lifted door moves away from
  // the original click. Keep an operator control outside the moving geometry.
  const service=document.createElement('div');service.id='kapakServisKontrol';
  service.style.cssText='position:absolute;left:90px;bottom:145px;z-index:36;background:#14202bf5;color:white;padding:10px;border:1px solid #62717e;border-radius:8px;display:none;max-width:360px';
  service.innerHTML='<strong data-name></strong><div><button data-open>Aç</button> <button data-close>Kapat — basılı tut</button> <button data-hide aria-label="Kapak kontrolünü gizle">✕</button></div>';
  document.getElementById('sahne').append(service);let selected=null,dockPulse=null,dockPending=false;
  const dockStop=()=>{clearInterval(dockPulse);dockPulse=null;};
  service.querySelector('[data-hide]').onclick=()=>{dockStop();service.style.display='none';};
  service.querySelector('[data-open]').onclick=()=>{if(selected)send(selected,true).then(()=>say(selected.label+' · açılıyor')).catch(e=>say(e.message));};
  const closeButton=service.querySelector('[data-close]');
  closeButton.onpointerdown=e=>{e.preventDefault();e.stopPropagation();dockStop();closeButton.setPointerCapture?.(e.pointerId);const a=selected;const pulse=()=>{if(!a||dockPending)return;dockPending=true;send(a,false,true).catch(e=>{dockStop();say(e.message);}).finally(()=>dockPending=false);};pulse();dockPulse=setInterval(pulse,150);};
  for(const event of ['pointerup','pointercancel','lostpointercapture'])closeButton.addEventListener(event,dockStop);
  addEventListener('blur',dockStop);document.addEventListener('visibilitychange',()=>{if(document.hidden)dockStop();});
  function selectService(a){if(a?.kind!=='makineKapak')return;selected=a;service.querySelector('[data-name]').textContent=a.label;service.style.display='block';}
  function act(a){
    if(!a)return false;
    if(motor(a)){
      selectService(a);
      if(consumed)return true;
      if(a.kind==='cekmece'&&!IKIZ.bakim.aktif()){say('Önce personel tabletinde MAKİNE → BAKIM → Bakım modunu aç');return true;}
      if(deadman(a)&&isOpen(a)){say('Kapatmak için parça üzerinde mouse tuşunu basılı tut; bırakınca durur.');return true;}
      const opening=!isOpen(a);if(opening&&a.kind==='qr'&&!IKIZ.bakim.aktif())say('Bakım isteği · '+a.label);
      send(a,opening).then(()=>say(a.label+(opening&&a.kind==='qr'?' · açılıyor (bakım; kapanınca biter)':' · PLC kabul etti'))).catch(e=>say(e.message));return true;
    }
    if(a.kind==='panjur'){
      const p=IKIZ.panjur;if(!p)return true;
      const action=a.action==='toggle'?(p.state.moving?'dur':p.state.closed>.5?'ac':'kapat'):a.action;
      p.command(action);say(action==='dur'?'Panjur durduruldu':action==='ac'?'Panjur açılıyor':'Panjur kapanıyor');
    }else if(a.kind==='elle')a.toggle();
    return true;
  }
  IKIZ.parcaTikla=(x,y)=>act(pick(x,y));
  kanvas.addEventListener('pointerdown',e=>{
    holdStop();consumed=false;down={x:e.clientX,y:e.clientY,t:performance.now()};
    const a=pick(e.clientX,e.clientY);
    if(a?.kind==='makineKapak'&&!isOpen(a)&&IKIZ.zamanModu!=='kayit'){
      const h=hold={delay:null,timer:null};
      h.delay=setTimeout(()=>{if(hold!==h)return;consumed=true;selectService(a);send(a,true).then(()=>say(a.label+' · açılıyor')).catch(e=>say(e.message));},500);
      return;
    }
    if(!motor(a)||!deadman(a)||!isOpen(a)||(a.kind!=='makineKapak'&&!IKIZ.bakim.aktif())||IKIZ.zamanModu==='kayit')return;
    consumed=true;const h=hold={pending:false,delay:null,timer:null};
    const pulse=()=>{if(hold!==h)return;if(a.kind!=='makineKapak'&&!IKIZ.bakim.aktif()){holdStop();return;}if(h.pending)return;h.pending=true;
      send(a,false,true).then(r=>{if(r?.kapali&&hold===h)holdStop();}).catch(e=>{if(hold===h)holdStop();say(e.message);}).finally(()=>h.pending=false);
    };
    h.delay=setTimeout(()=>{if(hold!==h)return;pulse();h.timer=setInterval(pulse,150);say(a.label+' kapanıyor · bırakınca durur');},180);
  });
  kanvas.addEventListener('pointermove',e=>{if(down&&Math.hypot(e.clientX-down.x,e.clientY-down.y)>=6)holdStop();});
  for(const event of ['pointerup','pointercancel','lostpointercapture','pointerleave'])kanvas.addEventListener(event,holdStop);
  addEventListener('blur',holdStop);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)holdStop();});
  kanvas.addEventListener('pointermove',e=>{
    if(e.buttons||performance.now()-hoverAt<120)return;hoverAt=performance.now();
    const a=pick(e.clientX,e.clientY);kanvas.style.cursor=a?'pointer':'';kanvas.title=a?a.label:'';
  });
  // gezinti.js owns pointerup for both orbit and staff modes: exactly one action per tap.
  kanvas.dataset??={};kanvas.dataset.etkilesimSayisi=String(targets.length);
  kanvas.dataset.cekmeceSayisi=String(targets.filter(t=>t.action.kind==='cekmece').length);
  kanvas.dataset.qrKapakSayisi=String(targets.filter(t=>t.action.kind==='qr').length);
  IKIZ.parcaEtkilesim={count:targets.length,pick,targets:targets.map(t=>({name:t.object.name,...t.action}))};
}
