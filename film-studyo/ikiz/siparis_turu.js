import * as T from 'three';
import {QR_PIN_ESLEME} from './qr_govde.js';
import {QR_EKRAN} from './qr_ekran.js';

// A camera director over the normal kiosk / payment / PLC / delivery flow.
// Never inject products, change stock, move equipment, or edit process timings.
export function siparisTuruKur(IKIZ) {
  const view=IKIZ.sahne, camera=view.kamera, orbit=view.kontrol;
  const state={active:false,phase:'idle',label:'',order:null,log:[],error:null};
  let saved=null,run=0,manualUntil=0,lastPoll=0,lastFrame=-1,world=null,pollRun=null;
  let position=null,target=null,screen=false,orderInfo=null,deliveryStarted=false,lastE=null,eMoved=0,flight=null;
  let fast=false,fastDone=false,lastSpeedRequest=-Infinity,lastSpeedValue=null;
  const clock=document.createElement('div');clock.hidden=true;clock.id='turHizGostergesi';clock.style.cssText='position:fixed;top:140px;left:50%;transform:translateX(-50%);z-index:46;border-radius:10px;background:#18222aee;color:#ffd077;padding:10px 20px;font:600 19px system-ui';clock.innerHTML='<span style="display:inline-block;animation:turSaat 2s linear infinite">◷</span> ×50 · Fırın beklemesi';
  const fade=document.createElement('div');fade.style.cssText='position:fixed;inset:0;background:#15202a;opacity:0;pointer-events:none;z-index:42;transition:opacity .5s';fade.hidden=true;document.body.append(fade);
  const style=document.createElement('style');style.textContent='@keyframes turSaat{to{transform:rotate(360deg)}}';document.head.append(style);document.body.append(clock);
  const panel=document.createElement('div');panel.id='siparisTuruPanel';panel.hidden=true;
  panel.style.cssText='position:fixed;z-index:44;top:76px;left:50%;transform:translateX(-50%);max-width:calc(100vw - 24px);padding:10px 14px;border:1px solid #52616d;border-radius:12px;background:#101923ed;color:#fff;font:14px system-ui;pointer-events:auto';
  const label=document.createElement('span'),stop=document.createElement('button');
  stop.textContent='Kamera turunu bitir';stop.title='Kamera ve görünüm geri döner; verilmiş sipariş PLC’de çalışmaya devam eder.';
  stop.style.cssText='margin-left:12px;padding:8px;border-radius:8px;background:#33495b;color:white;border:0';
  panel.append(label,stop);document.body.append(panel);
  const button=document.createElement('button');button.id='siparisTuruBtn';button.textContent='▶ Sipariş turu';
  button.title='Kiosk → hamur → topping → fırın → kola / tatlı → kesme / katlama → QR teslim; normal PLC siparişi.';
  document.getElementById('araclar').append(button);
  const inset=document.createElement('div');inset.hidden=true;
  inset.style.cssText='position:fixed;right:16px;bottom:170px;z-index:43;color:white;text-shadow:0 1px 3px #000;font:13px system-ui;pointer-events:none;border:2px solid #e9ad47;border-radius:6px;padding:5px;background:transparent';
  document.body.append(inset);
  const smallCamera=new T.PerspectiveCamera(50,1,.05,80),insetSize=new T.Vector2(),viewport=new T.Vector4(),scissor=new T.Vector4();
  const keyLight=new T.Mesh(new T.RingGeometry(.007,.010,24),new T.MeshBasicMaterial({color:0xffc44e,transparent:true,opacity:.9,side:T.DoubleSide,depthWrite:false,depthTest:false}));
  keyLight.name='SIPARIS_TURU_PIN_ISIK';keyLight.renderOrder=1000;keyLight.visible=false;view.scene.add(keyLight);
  function keyPulse(key){if(QR_PIN_ESLEME.enabled===false)return;const keys=[['1','2','3'],['4','5','6'],['7','8','9'],['*','0','#']];for(let r=0;r<4;r++)for(let c=0;c<3;c++)if(keys[r][c]===key){keyLight.position.set(QR_PIN_ESLEME.x[c],QR_PIN_ESLEME.y[r],QR_PIN_ESLEME.z+.004);keyLight.visible=true;}}
  IKIZ.cizimSonrasi??=[];
  IKIZ.cizimSonrasi.push(()=>{
    const f=IKIZ.goruntuKaresi||IKIZ.son,r=f?.robot||{},u=f?.urunler?.find(u=>u.tur==='HAMUR'&&u.siparis===state.order?.id);
    const productParallel=!!r.gorev&&u&&['TABLA','F','F_YBANT'].includes(u.yer)&&!['cut-spray','fold-close','box-robot'].includes(state.phase);
    const robotParallel=!!r.gorev&&u?.yer==='K';
    // Kemal 31 Eki ("hâlâ kartonu katlamıyor"): program sonraki kartonu robot kutuyu QR'ye taşırken katlıyor (≈17 s); ana görüntü robottayken
    // katlama küçük görüntüde E kalıbında gösterilir (ölçülen: e_kutu_t ilerlerken, kutu boş ve kapalı değil).
    const ec=f?.urunler?.find(x=>x.tur==='E_KUTU'),eFold=!!ec&&!ec.kapali&&!(ec.icerik||[]).length&&f.e_kutu_t!=null&&IKIZ.eKartonEksen?.adim===10&&performance.now()-eMoved<1500&&state.phase!=='carton-prepare';
    const parallel=state.active&&!screen&&!deliveryStarted&&(productParallel||robotParallel||eFold);
    inset.hidden=!parallel;if(!parallel)return;
    const renderer=view.renderer;renderer.getSize(insetSize);
    const eSol=!(productParallel||robotParallel),w=Math.min(440,insetSize.x*.40),h=w*.68,x=eSol?56:insetSize.x-w-16,y=170;   // E katlama penceresi solda: sağda kiosk ekranı açık kalıyor
    inset.style.left=eSol?x+'px':'';inset.style.right=eSol?'auto':'16px';
    inset.style.width=(w-10)+'px';inset.style.height=(h-10)+'px';inset.textContent=!(productParallel||robotParallel)?'E · karton katlanıyor (sonraki kutu)':robotParallel?'Robot · canlı takip':u.yer==='TABLA'?'Pide · açıcı / sucuk ve kaşar dozajı':'Pide · fırındaki ilerleme';
    const[p,hp]=!(productParallel||robotParallel)?[[4.56,1.42,.62],[4.70,.97,-.22]]:robotParallel?robotView(f):stationView(u.yer==='TABLA'?(u.durum==='bekliyor'?'A':'TOP'):'F');smallCamera.aspect=w/h;smallCamera.updateProjectionMatrix();smallCamera.position.set(...p);smallCamera.lookAt(new T.Vector3(...hp));
    renderer.getViewport(viewport);renderer.getScissor(scissor);const scissorTest=renderer.getScissorTest();
    renderer.setScissorTest(true);renderer.setViewport(x,y,w,h-25);renderer.setScissor(x,y,w,h-25);renderer.render(view.scene,smallCamera);
    renderer.setViewport(viewport);renderer.setScissor(scissor);renderer.setScissorTest(scissorTest);
    const phase=!(productParallel||robotParallel)?'e-fold-inset':robotParallel?'robot-inset':'product-inset';
    if(!state.log.some(e=>e.phase===phase))state.log.push({phase,t:f.t,text:inset.textContent});
  });
  const sleep=ms=>new Promise(r=>setTimeout(r,ms));
  const alive=id=>{if(!state.active||id!==run)throw Error('Tur durduruldu');};
  function say(phase,text){
    label.textContent=text;state.label=text;
    if(state.phase===phase)return;
    state.phase=phase;state.log.push({phase,t:IKIZ.son?.t,text});
    if(state.log.length>250)state.log.shift();
  }
  async function api(path,body){
    const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),12000);
    try{
      const options=body===undefined?{cache:'no-store'}:{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)};
      const r=await fetch(path,{...options,signal:controller.signal});
      const data=await r.json();if(!r.ok)throw Error(data.hata||`HTTP ${r.status}`);return data;
    }catch(e){if(e.name==='AbortError')throw Error('Sipariş sunucusundan yanıt alınamadı; bağlantıyı kontrol et. Verilmiş sipariş sunucuda devam edebilir');throw e;}
    finally{clearTimeout(timer);}
  }
  async function until(fn,id,ms=20000){
    const end=Date.now()+ms;
    while(Date.now()<end){alive(id);const value=fn();if(value)return value;await sleep(100);}
    throw Error('Ekran / bağlantı zamanında hazır olmadı');
  }
  function setFast(value,force=false){
    const live=IKIZ.canliSon||IKIZ.son;
    if(value&&(live?.robot?.gorev||(live?.siparisler||[]).some(s=>s.id!==state.order?.id&&!['HAZIR','TESLIM','TESLIM_EDILDI','IPTAL','ZAMAN_ASIMI'].includes(s.durum))))value=false;
    const desired=value?50:1,changed=fast!==value;fast=value;clock.hidden=!value;
    const actual=+live?.hiz;
    if(force||lastSpeedValue!==desired||(actual!==desired&&performance.now()-lastSpeedRequest>500)){
      IKIZ.kontrol?.({tip:'hiz',hiz:desired});lastSpeedRequest=performance.now();lastSpeedValue=desired;
    }
    if(changed||force)state.log.push({phase:value?'oven-fast':'normal-speed',t:IKIZ.son?.t});
  }
  function pointer(doc){let e=doc.getElementById('turDokunma');if(!e){e=doc.createElement('div');e.id='turDokunma';e.style.cssText='position:fixed;left:50%;top:65%;width:34px;height:34px;margin:-17px;border:3px solid #f6b643;border-radius:50%;background:#ffd36c55;box-shadow:0 0 0 9px #ffd36c22;z-index:2147483647;pointer-events:none;transition:left .65s ease,top .65s ease,transform .2s';doc.body.append(e);}return e;}
  async function scrollTouch(doc,element,id){
    const root=doc.scrollingElement,win=doc.defaultView,rect=element.getBoundingClientRect(),height=win.innerHeight;
    const to=Math.max(0,Math.min(root.scrollHeight-height,root.scrollTop+rect.top-Math.max(100,(height-rect.height)/2)));
    if(Math.abs(to-root.scrollTop)<30)return;
    const finger=pointer(doc),from=root.scrollTop,x=win.innerWidth*.65;finger.style.transition='none';finger.style.left=x+'px';
    for(let i=0;i<=32;i++){alive(id);const a=i/32,e=a*a*(3-2*a);finger.style.top=(height*(to>from?.72:.38)+(to>from?-1:1)*height*.30*e)+'px';root.scrollTop=from+(to-from)*e;await sleep(35);}
    finger.style.transition='left .65s ease,top .65s ease,transform .2s';await sleep(500);
  }
  async function tap(doc,element,id,after=1000){
    await scrollTouch(doc,element,id);alive(id);const rect=element.getBoundingClientRect(),finger=pointer(doc);
    finger.style.left=(rect.left+rect.width/2)+'px';finger.style.top=(rect.top+rect.height/2)+'px';await sleep(850);alive(id);
    finger.style.transform='scale(.72)';element.dispatchEvent(new doc.defaultView.PointerEvent('pointerdown',{bubbles:true}));await sleep(180);alive(id);element.click();finger.style.transform='scale(1)';if(after)await sleep(after);
  }
  function destination(p,h){position=new T.Vector3(...p);target=new T.Vector3(...h);}
  function travel(p,h,ms=900){return new Promise(done=>{flight={p0:camera.position.clone(),h0:orbit.target.clone(),p1:new T.Vector3(...p),h1:new T.Vector3(...h),start:performance.now(),ms,done};});}
  function releaseScreen(){const p=camera.position.clone(),q=camera.quaternion.clone();IKIZ.odakBirak();camera.position.copy(p);camera.quaternion.copy(q);orbit.target.copy(p).add(new T.Vector3(0,0,-.6).applyQuaternion(q));orbit.enabled=true;screen=false;IKIZ.bakisAd='siparis-turu';}
  const qrCenter=n=>[3.5195+((n-1)%4)*.487,.718+Math.floor((n-1)/4)*.262,1.91];
  function bay(n,outside=false){const h=qrCenter(n);destination([h[0]+(outside ? .22 : -.30),h[1]+.38,outside?3.02:.68],h);}
  function stationView(id){
    // Views stay in the robot aisle. Hidden enclosure panels do not hide tools.
    const presets={
      A:[[1.47,1.75,1.38],[1.08,1.04,-.08]],
      TOP:[[2.0,1.85,1.40],[1.85,1.06,-.22]],
      F:[[3.25,1.95,1.36],[3.15,1.04,-.32]],
      K:[[3.82,1.75,1.18],[4.10,1.0,-.25]],
      E:[[4.40,1.72,1.26],[4.83,1.04,-.26]],
    };return presets[id];
  }
  function station(id){destination(...stationView(id));}
  function robotView(f){
    const r=f.robot||{},p=f.robot_poz||IKIZ.robotSon||{};
    const tcpClose=Array.isArray(p.tcp)?p.tcp:null;
    if(r.goz&&r.gorev!=='HAMUR'&&tcpClose&&tcpClose[2]>1.18){
      // Stay in the aisle, looking through the open rear bay at the actual fingers.
      const q=qrCenter(+r.goz),h=[tcpClose[0]*.75+q[0]*.25,tcpClose[1]*.8+q[1]*.2,tcpClose[2]];
      return [[Math.max(2.9,Math.min(5.35,h[0]-.38)),h[1]+.48,.78],h];
    }
    const root=IKIZ.kok?.getObjectByName('UR10E_body_07');
    if(root){
      const box=new T.Box3().setFromObject(root),center=box.getCenter(new T.Vector3()),size=box.getSize(new T.Vector3());
      if(!box.isEmpty()){
        let distance=Math.max(2.15,size.length()*.95);const direction=new T.Vector3(-.75,.58,.32).normalize(),eye=new T.Vector3(),fit=new T.PerspectiveCamera(camera.fov,camera.aspect,.05,80);
        for(let pass=0;pass<7;pass++){
          eye.copy(center).addScaledVector(direction,distance);eye.x=Math.max(.90,eye.x);eye.z=Math.min(1.45,eye.z);fit.position.copy(eye);fit.lookAt(center);fit.updateMatrixWorld(true);
          let edge=0;for(const x of [box.min.x,box.max.x])for(const y of [box.min.y,box.max.y])for(const z of [box.min.z,box.max.z]){const v=new T.Vector3(x,y,z).project(fit);edge=Math.max(edge,Math.abs(v.x),Math.abs(v.y));}
          if(edge<.84)break;distance*=1.2;
        }
        return [eye.toArray(),center.toArray()];
      }
    }
    const tcp=Array.isArray(p.tcp)?p.tcp:[(r.ray_konum||1715)/1000,1.05,.65];
    // Track the actual TCP with both the pickup surface and the arm in frame.
    const rail=Number.isFinite(p.ray_m)?p.ray_m:(r.ray_konum||1715)/1000;
    const h=[tcp[0]*.4+rail*.6,1.02,.85];
    if(r.goz&&['birak_goz','bekle','bitti'].includes(r.adim)&&r.t>r.toplam_s*.55){
      const q=qrCenter(+r.goz);h[0]=(h[0]+q[0])/2;h[1]=(h[1]+q[1])/2;h[2]=(h[2]+q[2])/2;
    }
    return [[Math.min(5.35,Math.max(1.35,rail+.85)),2.35,1.45],h];
  }
  function robot(f){destination(...robotView(f));}
  function production(f){
    const r=f.robot||{},products=f.urunler||[];
    if(f.e_kutu_t!==lastE){if(lastE!==null)eMoved=performance.now();lastE=f.e_kutu_t;}
    const ours=u=>!state.order||u.siparis===state.order.id;
    const dough=products.find(u=>ours(u)&&u.tur==='HAMUR');
    const carton=products.find(u=>u.tur==='E_KUTU');
    const box=products.find(u=>ours(u)&&u.tur==='KUTU'&&u.yer==='ROBOT');
    if(dough?.yer==='K'){
      if(fast){setFast(false);fastDone=true;}
      say('cut-spray',dough.kesildi?'Kesme tamam → sprey ve kutuya aktarım':'Pide fırından çıktı → kesme / sprey');station('K');return;
    }
    if(carton?.icerik?.some(ours)&&!carton.kapali){
      say('fold-close','Pide kutunun içinde → kulaklar ve üst kapak kapanıyor');station('E');return;
    }
    if(box||r.gorev==='KUTU'||r.gorev==='KUTU2'){
      say('box-robot','Robot pide kutusunu kavrıyor → QR gözüne taşıyor');robot(f);return;
    }
    if(carton?.kapali&&carton.icerik?.some(ours)){
      say('box-ready','Kutu kapandı → robotun kavraması bekleniyor');station('E');return;
    }
    if(dough?.yer==='TABLA'){
      const pressing=dough.durum==='bekliyor'||String(dough.asama||'').includes('açıcı');
      say(pressing?'dough-press':'topping',r.gorev?(pressing?'Robot ana görüntüde · hamur küçük görüntüde açılıyor':'Robot kola / tatlıyı hazırlıyor · küçük görüntüde sucuk ve kaşar dozajı'):(pressing?'Hamur açıcıda açılıyor':'Sucuk ve kaşar dozajı · pide ana görüntüde'));
      if(r.gorev)robot(f);else station(pressing?'A':'TOP');return;
    }
    if(r.gorev==='HAMUR'){
      say('dough-robot','Robot hamuru çekmeceden alıyor → açıcıya bırakıyor');robot(f);return;
    }
    if(['ICECEK','TATLI'].includes(r.gorev)){
      const kind=r.gorev==='ICECEK'?'kolayı':'tatlıyı';
      say(r.gorev==='ICECEK'?'drink-robot':'dessert-robot',`Pide pişerken robot ${kind} alıyor → QR gözüne bırakıyor`);robot(f);return;
    }
    if(f.e_kutu_t!=null&&performance.now()-eMoved<1200&&carton&&!carton.kapali&&!(carton.icerik||[]).length){
      say('carton-prepare','Karton alınıyor → kutu hazırlanıyor');station('E');return;
    }
    if(dough?.yer==='F'||dough?.yer==='F_YBANT'){
      const nearExit=dough.yer==='F'&&(dough.ilerleme||0)>=.92;
      if(fast&&nearExit){setFast(false);fastDone=true;}
      if(!fastDone&&!fast&&dough.yer==='F'&&!r.gorev&&(dough.ilerleme||0)<.85&&orderInfo&&orderInfo.durum==='URETIMDE'){setFast(true);}
      say('oven',fast?'Pide ana görüntüde · fırın beklemesi ×50':'Pide fırındaki ilerlemesiyle ana görüntüde');station('F');return;
    }
    const queued=(f.siparisler||[]).find(s=>s.id===state.order?.id);
    const detail=queued?.bekleme||'',status=queued?.durum||orderInfo?.durum;
    if(status==='ODEME_BEKLIYOR')say('payment-wait','Ödeme teyidi bekleniyor; üretim henüz başlamadı');
    else if(status==='URETIMDE')say('dispatch',detail?'Üretim bekliyor: '+detail:'PLC üretimde · robot / istasyon geri bildirimi bekleniyor');
    else if(status==='HAZIR')say('dispatch','Sipariş hazır · QR teslim görüntüsüne geçiliyor');
    else say('dispatch',detail?'PLC sırası: '+detail:'Sipariş kabulü ve PLC kuyruğu kontrol ediliyor');
    robot(f);
  }
  function restore(){
    setFast(false);IKIZ.sunumBitir?.();
    fade.hidden=true;for(const frame of document.querySelectorAll('iframe')){try{frame.contentDocument?.getElementById('turDokunma')?.remove();}catch{}}
    IKIZ.odakBirak?.();
    if(!saved)return;
    const motor=IKIZ.katmanlar;
    if(motor&&saved.layers){Object.assign(motor.master,saved.master);for(const[k,v]of Object.entries(saved.layers))Object.assign(motor.state[k],v);motor.update();}
    IKIZ.dukkan?.duvarGizle(saved.walls);
    for(const[o,visible]of saved.covers||[])o.visible=visible;
    const wb=document.getElementById('duvarGizleBtn');if(wb){wb.setAttribute('aria-pressed',String(saved.walls));wb.textContent=saved.walls?'Duvarları göster':'Duvarları gizle';}
    camera.fov=saved.fov;camera.updateProjectionMatrix();camera.position.copy(saved.p);orbit.target.copy(saved.h);orbit.enabled=true;orbit.update();
    IKIZ.bakisAd=saved.bakis;IKIZ.orbitEkranlar=saved.screens;saved=null;
  }
  function finish(message='Kamera turu durduruldu; sipariş üretimi devam eder'){
    run++;state.active=false;screen=false;position=target=null;if(flight){flight.done();flight=null;}inset.hidden=true;keyLight.visible=false;restore();button.disabled=false;
    panel.hidden=false;label.textContent=message;stop.textContent='Kapat';
  }
  stop.onclick=()=>state.active?finish():(panel.hidden=true);
  document.getElementById('kanvas').addEventListener('pointerdown',()=>{if(state.active&&!screen){manualUntil=performance.now()+6000;}});
  // No page-load automatic run. Only an explicit click creates the test order.
  async function start(){
    if(state.active)return;
    const f=IKIZ.son;
    if(!IKIZ.yuklendi||!IKIZ.mqttBagli){panel.hidden=false;label.textContent='Önce 3B model ve PLC bağlantısı hazır olmalı';return;}
    if(['HATA','SERVIS','TEMIZLIK'].includes(f.hat)){panel.hidden=false;label.textContent='Makine '+f.hat+' durumunda; üretim izni olmadan tur başlatılamaz';return;}
    if(IKIZ.zamanModu==='kayit'||(f.siparisler||[]).some(s=>!['HAZIR','TESLIM','TESLIM_EDILDI','IPTAL','ZAMAN_ASIMI'].includes(s.durum))){panel.hidden=false;label.textContent='Turu makine boşken başlat; mevcut siparişin bitmesini bekle';return;}
    const basket=JSON.parse(localStorage.getItem('ak.sepet')||'{}');
    if(Object.values(basket).some(x=>x.adet>0)){panel.hidden=false;label.textContent='Kiosktaki mevcut sepetini önce tamamla veya boşalt';return;}
    const id=begin(f);
    try{
      await until(()=>+(IKIZ.canliSon||IKIZ.son)?.hiz===1,id,12000);
      IKIZ.bakisAd='siparis-turu';IKIZ.orbitEkranlar=true;
      IKIZ.katmanlar?.reset();IKIZ.dukkan?.duvarGizle(true);
      screen=true;say('kiosk','Sipariş ekranına yaklaşıyoruz');IKIZ.odakla('kiosk');
      const iframe=await until(()=>document.querySelector('iframe[data-ekran="kiosk"]'),id);
      const doc=await until(()=>{try{return iframe.contentDocument?.querySelector('#baslangic')&&iframe.contentDocument;}catch{return null;}},id);
      await sleep(1800);alive(id);await tap(doc,doc.querySelector('#kTR')||doc.querySelector('#baslangic'),id);if(doc.querySelector('#baslangic')?.classList.contains('on'))await tap(doc,doc.querySelector('#baslangic'),id);
      await until(()=>doc.querySelector('.urun .alt button'),id);
      const select=async(name)=>{const card=await until(()=>[...doc.querySelectorAll('.urun')].find(c=>c.querySelector('.ad')?.textContent.trim()===name),id);const b=card.querySelector('.alt button');if(!b||b.disabled)throw Error(`${name} stokta yok`);await tap(doc,b,id);};
      say('kiosk-select','Ekrandan sucuklu-kaşarlı pide, kola ve tatlı seçiliyor');
      await select('Sucuklu pide');await tap(doc,doc.querySelectorAll('[role="tab"]')[1],id);await select('Kola');await select('Tatlı');
      await tap(doc,doc.querySelector('#sepetGit'),id);alive(id);
      const checkout=await until(()=>doc.querySelector('#odemeyeGec'),id);await tap(doc,checkout,id);
      const pay=await until(()=>iframe.contentDocument?.querySelector('#odeTest'),id);
      const q=new URL(iframe.contentWindow.location.href).searchParams;
      state.order={id:q.get('s'),e:q.get('e')};
      if(!state.order.id||!state.order.e)throw Error('Kiosk sipariş kimliği alınamadı');
      const provider=await api(`/api/siparis/${state.order.id}/odeme-baslat?e=${state.order.e}`,{});
      if(provider.saglayici!=='TEST')throw Error('Otomatik tur yalnız TEST ödeme sağlayıcısında çalışır');
      say('kiosk-pay','Kiosk: sipariş onaylanıyor · TEST ödeme');await tap(iframe.contentDocument,pay,id,0);
      // A click is not an acknowledgement from payment or the PLC queue.
      const acceptUntil=Date.now()+20000;
      while(true){
        alive(id);orderInfo=await api(`/api/siparis/${state.order.id}?e=${state.order.e}`);
        if(orderInfo.durum!=='ODEME_BEKLIYOR')break;
        if(Date.now()>=acceptUntil)throw Error('Ödeme onayı gelmedi; sipariş üretime gönderilmedi');
        await sleep(400);
      }
      if(['HATA','IPTAL','IADE','ZAMAN_ASIMI'].includes(orderInfo.durum))throw Error('Sipariş kabul edilmedi: '+orderInfo.durum);
      alive(id);fade.style.transition='opacity .18s';
      fade.hidden=false;fade.style.opacity='0';await sleep(20);fade.style.opacity='1';await sleep(200);alive(id);
      releaseScreen();cutaway();lastPoll=0;
      const [p,h]=robotView(IKIZ.goruntuKaresi||IKIZ.canliSon||IKIZ.son);camera.position.set(...p);orbit.target.set(...h);orbit.update();destination(p,h);
      fade.style.opacity='0';await sleep(200);alive(id);fade.hidden=true;lastFrame=-1;tick(0.05);
    }catch(e){if(id!==run)return;state.error=e.message;finish('Tur durdu: '+e.message);}
  }
  function begin(f,order=null){
    state.active=true;state.phase='idle';state.error=null;state.log=[];state.order=order;
    fastDone=false;fast=false;setFast(false,true);
    const id=++run;button.disabled=true;panel.hidden=false;stop.textContent='Kamera turunu bitir';deliveryStarted=false;orderInfo=null;lastE=f.e_kutu_t;eMoved=-Infinity;world=[f.oturum,f.dunya].join(':');lastFrame=-1;
    if(IKIZ.sahneModu==='gezinti')IKIZ.gezintiCik?.();IKIZ.odakBirak?.();
    saved={p:camera.position.clone(),h:orbit.target.clone(),fov:camera.fov,bakis:IKIZ.bakisAd,screens:IKIZ.orbitEkranlar,layers:IKIZ.katmanlar?structuredClone(IKIZ.katmanlar.state):null,master:IKIZ.katmanlar?{...IKIZ.katmanlar.master}:null,walls:document.getElementById('duvarGizleBtn')?.getAttribute('aria-pressed')==='true'};
    return id;
  }
  function cutaway(){
      IKIZ.bakisAd='siparis-turu';IKIZ.katmanlar?.reset();IKIZ.dukkan?.duvarGizle(true);
      IKIZ.katmanlar?.setMachinePart('cover','hidden');IKIZ.katmanlar?.setMachinePart('frame','glass');
      saved.covers=[];const coverRoot=view.scene.getObjectByName('MAKINE_SERVIS_KAPAKLARI');
      if(coverRoot){saved.covers.push([coverRoot,coverRoot.visible]);coverRoot.visible=false;}
      view.scene.traverse(o=>{if(o.isMesh&&/^F_TP10_GOVDE__/.test(o.name)){saved.covers.push([o,o.visible]);o.visible=false;}});
  }
  async function resume(order){
    if(state.active)throw Error('Kamera turu zaten açık');
    const s=await api(`/api/siparis/${order.id}?e=${order.e}`);
    if(['ODEME_BEKLIYOR','TESLIM_EDILDI','IPTAL','IADE','ZAMAN_ASIMI'].includes(s.durum))throw Error('Takip edilecek etkin sipariş yok');
    const id=begin(IKIZ.son,order);await until(()=>+(IKIZ.canliSon||IKIZ.son)?.hiz===1,id,12000);cutaway();lastPoll=0;tick(.05);
  }
  async function deliver(id,info){
    try{
      setFast(false);IKIZ.sunumBitir?.();
      say('exit','Sipariş hazır → QR dolabının yanından müşteri tarafına geçiyoruz');screen=false;position=target=null;
      await travel([5.65,1.70,1.22],[4.65,1.10,1.91]);alive(id);
      await travel([5.65,1.70,2.65],[5.29,1.26,2.105]);alive(id);
      const tv=[(QR_EKRAN.x0+QR_EKRAN.x1)/2,1.885,QR_EKRAN.z];
      say('waiting-approach','Müşteri sipariş bekleme ekranına yaklaşıyor');
      const priorFov=camera.fov;camera.fov=Math.max(70,camera.fov);camera.updateProjectionMatrix();
      await travel([tv[0],1.65,3.10],tv,1400);alive(id);
      await until(()=>{try{return IKIZ.ekranlar3b.tv.f.contentDocument?.body?.innerText?.trim()&&IKIZ.ekranlar3b.tv.el.style.opacity==='1';}catch{return false;}},id);
      say('waiting-screen','Müşteri bekleme ekranına bakıyor · sipariş hazır');await sleep(4000);alive(id);camera.fov=priorFov;camera.updateProjectionMatrix();
      say('pin','Dışarıdaki teslim ekranı → PIN girişi');screen=true;
      IKIZ.odakBirak();IKIZ.odakla('qrpin');await sleep(1400);alive(id);
      await IKIZ.tusTakimi.bas('*');
      for(const digit of String(info.teslim_kodu)){alive(id);keyPulse(digit);await IKIZ.tusTakimi.bas(digit);say('pin-entry','Teslim PIN’i giriliyor: '+IKIZ.tusTakimi.durum.kod);await sleep(450);keyLight.visible=false;await sleep(100);}
      await sleep(650);alive(id);keyPulse('#');await IKIZ.tusTakimi.bas('#');await sleep(300);keyLight.visible=false;alive(id);
      releaseScreen();
      const n=+(info.dolap_gozlari?.[0]||info.dolap_gozu||1),h=qrCenter(n);
      await travel([h[0]+.22,h[1]+.38,3.02],h,750);alive(id);bay(n,true);say('customer-open',`PIN kabulü bekleniyor → ${(globalThis.AK_GOZ?.etiket||(x=>x))(n)}. gözün müşteri kapağı`);
      await until(()=>+(IKIZ.son.qr?.[n]?.musteri_kapak||0)>.1,id,45000);
      say('customer-take',`${(globalThis.AK_GOZ?.etiket||(x=>x))(n)}. göz açıldı → müşteri pide, kola ve tatlıyı alıyor`);
      await until(()=>!(IKIZ.son.urunler||[]).some(u=>u.yer===`QR${n}`),id,45000);
      say('customer-close','Ürünler alındı → müşteri kapağı kapanıyor');
      await until(()=>+(IKIZ.son.qr?.[n]?.musteri_kapak||0)<.02,id,45000);
      const confirmUntil=Date.now()+30000;
      while(true){
        const end=await api(`/api/siparis/${state.order.id}?e=${state.order.e}`);alive(id);
        if(end.durum==='TESLIM_EDILDI')break;
        if(Date.now()>=confirmUntil)throw Error('PLC teslim teyidi zamanında gelmedi');
        await sleep(500);
      }
      say('done','Sipariş turu tamamlandı · PLC teslimi doğruladı');await sleep(1800);alive(id);
      finish('Sipariş turu tamamlandı · üretim ve teslim PLC üzerinden doğrulandı');
    }catch(e){if(id!==run)return;state.error=e.message;finish('Teslim turu durdu: '+e.message);}
  }
  async function poll(id){
    if(pollRun===id)return;pollRun=id;
    try{const s=await api(`/api/siparis/${state.order.id}?e=${state.order.e}`);if(id!==run)return;orderInfo=s;state.connectionError=null;
      if(s.durum==='HAZIR'&&!deliveryStarted){deliveryStarted=true;deliver(id,s);}
      else if(['HATA','IPTAL','IADE','ZAMAN_ASIMI'].includes(s.durum))throw Error('Sipariş durumu: '+s.durum);
    }catch(e){if(id===run){
      if(e.message.startsWith('Sipariş durumu:')){state.error=e.message;finish('Sipariş turu: '+e.message);}
      else {state.connectionError=e.message;lastPoll=performance.now()+2000;}
    }}
    finally{if(pollRun===id)pollRun=null;}
  }
  function tick(dt){
    if(!state.active)return;
    if(IKIZ.zamanModu==='kayit'){finish('Kayıt izlemeye geçildi; kamera turu durdu, sipariş üretimi devam eder');return;}
    const live=IKIZ.canliSon||IKIZ.son;
    if(!live)return;
    // Acceleration is only for an empty-handed oven wait, never robot motion.
    if(live.robot?.gorev&&(+live.hiz!==1||fast))setFast(false);
    if(!IKIZ.mqttBagli||(IKIZ.sonKareT&&performance.now()-IKIZ.sonKareT>5000)){
      say('connection-wait','Canlı görüntü bağlantısı bekleniyor · PLC siparişi sunucuda devam edebilir');return;
    }
    if(world!==[live.oturum,live.dunya].join(':')){finish('Dünya sıfırlandı; kamera turu kapatıldı');return;}
    const shown=IKIZ.goruntuKaresi;
    const f=shown&&shown.oturum===live.oturum&&shown.dunya===live.dunya?shown:live;
    if(world!==[f.oturum,f.dunya].join(':')){finish('Dünya sıfırlandı; kamera turu kapatıldı');return;}
    if(!screen&&state.order&&!deliveryStarted&&f.t!==lastFrame){lastFrame=f.t;production(f);}
    if(orderInfo?.durum==='HAZIR'&&!deliveryStarted&&(f.siparisler||[]).some(s=>s.id===state.order?.id&&s.durum==='HAZIR')){deliveryStarted=true;deliver(run,orderInfo);}
    if(!screen&&flight){const f=flight,a=Math.min(1,(performance.now()-f.start)/f.ms),e=a*a*(3-2*a);camera.position.lerpVectors(f.p0,f.p1,e);orbit.target.lerpVectors(f.h0,f.h1,e);orbit.update();if(a>=1){flight=null;f.done();}}
    else if(!screen&&position&&performance.now()>=manualUntil){const a=1-Math.exp(-Math.min(.1,dt)*2.7);camera.position.lerp(position,a);orbit.target.lerp(target,a);orbit.update();}
    if(state.order&&!deliveryStarted&&performance.now()-lastPoll>1000){lastPoll=performance.now();poll(run);}
  }
  IKIZ.kancalar.push(tick);
  button.onclick=start;
  addEventListener('pagehide',()=>{if(state.active){setFast(false);IKIZ.sunumBitir?.();}});
  IKIZ.siparisTuru={baslat:start,mevcutSiparisiIzle:resume,durdur:finish,durum:state,kameraHedefi:robotView};
}
