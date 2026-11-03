/* Staff maintenance requests: MAIN owns motion and interlocks. No order commands. */
(function () {
  const {h}=AK,{ST,kart,dug,alan}=TBA;
  const channel=new BroadcastChannel('autokitch.bakim'),tabletId=crypto.randomUUID();
  const mode=()=>!!ST.bakimAcik&&ST.mod==='MAKINE'&&ST.sekme.MAKINE==='bakim'&&TB.yetkili('personel');
  const announce=()=>channel.postMessage({tip:'bakim.durum',tablet:tabletId,aktif:mode(),hizli:TB.yetkili('personel')});
  setInterval(()=>{if(ST.mod!=='MAKINE'||ST.sekme.MAKINE!=='bakim'||!TB.yetkili('personel'))ST.bakimAcik=false;announce();},400);
  channel.onmessage=async({data:m})=>{
    if(m?.tip!=='bakim.komut'||m.tablet!==tabletId)return;
    try{
      // P77: Twin cover click = short maintenance request (service / E / wash covers and QR doors); MAIN keeps the lock.
      if(!mode()&&!(m.hizli&&TB.yetkili('personel')&&['inceleme.kapak','inceleme.qr'].includes(m.komut?.tip)))throw Error('Tablette bakım modu kapalı');
      const k=m.komut||{};
      if(!['inceleme.cekmece','inceleme.qr','inceleme.kapak'].includes(k.tip))throw Error('Bakım komutu geçersiz');
      // Explicit field whitelist: a scene message cannot replace PIN or role.
      const args={ac:k.ac===true,basili:k.basili===true};
      if(k.tip==='inceleme.cekmece')args.cekmece=k.cekmece;
      else {args.goz=k.goz;if(k.tip==='inceleme.qr')args.istasyon=k.istasyon;}
      if(m.hizli){const d=await TB.hmiAl('/api/tablet/bakim'),wash=k.tip==='inceleme.kapak'&&+k.goz>=16;
        if(d.bagli&&k.ac!==false&&(d.kuyruk||d.robot?.gorev||d.hat==='SIPARIS'))throw Error('Sipariş sürerken kapak kilitli');
        if(!d.bagli||(k.ac!==false&&(!['KAPALI','BOSTA',...(wash?['TEMIZLIK']:[])].includes(d.hat)||d.kuyruk||d.robot?.gorev)))throw Error('Makine çalışıyor; kapak kilitli');if(d.duraklat)await TB.komut('bakim.saat',{});}
      let sonuc;try{sonuc=await TB.komut(k.tip,args);}catch(e){if(!m.hizli||!e.message.includes('Bakım hareketlerini etkinleştir'))throw e;await TB.komut('bakim.saat',{});await new Promise(r=>setTimeout(r,600));sonuc=await TB.komut(k.tip,args);}
      channel.postMessage({tip:'bakim.cevap',id:m.id,tablet:tabletId,ok:true,sonuc});
    }catch(e){channel.postMessage({tip:'bakim.cevap',id:m.id,tablet:tabletId,ok:false,hata:e.message});}
  };
  addEventListener('pagehide',()=>{ST.bakimAcik=false;announce();});
  const request=(tip,k)=>TBA.islem('personel',async()=>{
    const r=await TB.komut(tip,k);AK.bildir(tip==='bakim.saat'?'Bakım hareketleri etkinleştirildi':'PLC isteği kabul etti');return r;
  });
  TBA.SEK.MAKINE.bakim=async function(kap){
    if(!TB.yetkili('personel')){kap.append(kart('Personel bakımı',dug('PIN ile giriş','ana',async()=>{await TB.pinSor('personel');TBA.ciz();})));return;}
    let d=await TB.hmiAl('/api/tablet/bakim');
    if(!kap.isConnected)return;
    if(!d.bagli){kap.append(kart('Bakım',h('p',{metin:'PLC durum bağlantısı bekleniyor. Hareket komutu gönderilmedi.'})));return;}
    const busy=!['KAPALI','BOSTA'].includes(d.hat)||d.kuyruk||d.robot?.gorev;
    const steps=h('div',{sinif:'h31-maintenance',role:'status'});
    const drawSteps=(data)=>steps.replaceChildren(...(AK.HMI31?.maintenance(data)||[]).map(([title,text])=>h('p',{},h('b',{metin:title}),h('span',{metin:text}))));
    drawSteps(d);kap.append(kart('Bakım öncesi durum',steps));
    kap.append(kart('Motorlu çekmece ve QR kapak bakımı',h('p',{metin:'Yalnız makine ve robot boşta iken. Açık bakım kapakları kapanmadan üretim başlamaz. Stok ve sipariş kayıtları değişmez.'}),h('p',{metin:busy?'Makine çalışıyor; hareket kilitli.':'Makine boşta · PLC izinleri her istekte denetlenir.'}),
      d.duraklat&&!busy?dug('Bakım hareketlerini etkinleştir','ana',()=>request('bakim.saat',{}).then(()=>TBA.ciz())):null));
    if(busy){ST.bakimAcik=false;announce();}
    const modeText=h('p',{}),modeButton=dug('Bakım modunu aç','ana',async()=>{
      if(mode()){ST.bakimAcik=false;announce();refresh();return;}
      if(!['KAPALI','BOSTA'].includes(d.hat)||d.kuyruk||d.robot?.gorev){TBA.hata(Error('Makine çalışıyor; hareket kilitli'));return;}
      const r=d.duraklat?await request('bakim.saat',{}):{ok:true};
      if(r){ST.bakimAcik=true;announce();await kap.bakimGuncelle();}
    });
    kap.append(kart('Twin’de mouse ile bakım',modeText,modeButton));
    const select=(items,key)=>{const el=h('select',{sinif:'ak-giris',onchange:()=>{ST.form??={};ST.form[key]=el.value;}},items.map(x=>h('option',{value:x,metin:x})));if(ST.form?.[key])el.value=ST.form[key];return el;};
    const covers=[["1", "Açıcı üst vidalı panel"], ["2", "Topping sol yalıtımlı kapak"], ["3", "Topping sağ yalıtımlı kapak"], ["4", "Fırın üst paralel kaldırma kapağı"], ["5", "Katlama üst paralel kaldırma kapağı"], ["6", "Kesme üst vidalı panel"], ["7", "Kutu alma üst vidalı panel"], ["8", "Katlama sağ üst vidalı panel"], ["9", "Tek parça alt havalandırma paneli"], ["10", "Katlama alt sol menteşeli kapak"], ["11", "Katlama alt sağ menteşeli kapak"], ["12", "Hamur koyma mavi pleksi kaldırma kapağı"], ["13", "Pide kutusu mavi pleksi kaldırma kapağı"], ["14", "Fırın orta paralel kaldırma kapağı"], ["15", "Fırın alt vidalı şerit panel"]];
    const cv=h('select',{id:'bakimKapak',sinif:'ak-giris','aria-label':'Kapak / servis paneli',onchange:()=>{ST.form??={};ST.form.bakimKapak=cv.value;}},covers.map(([id,ad])=>h('option',{value:id,metin:ad}))),cc=dug('BASILI TUT — kapağı kapat / paneli tak','uyari',()=>{});
    if(ST.form?.bakimKapak)cv.value=ST.form.bakimKapak;
    let ct=null,cp=false,closingId=null;
    const cs=()=>{clearInterval(ct);ct=null;closingId=null;};
    const pulseCover=()=>{if(!closingId||!cc.isConnected||document.hidden){cs();return;}if(cp)return;cp=true;TB.komut('inceleme.kapak',{goz:+closingId,ac:false,basili:true}).catch(e=>{cs();TBA.hata(e);}).finally(()=>cp=false);};
    const begin=()=>{if(ct)return;closingId=cv.value;pulseCover();ct=setInterval(pulseCover,150);};
    cc.addEventListener('pointerdown',e=>{e.preventDefault();begin();});
    cc.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&!e.repeat){e.preventDefault();begin();}});
    for(const ev of ['pointerup','pointerleave','pointercancel','lostpointercapture','keyup','blur'])cc.addEventListener(ev,cs);
    addEventListener('blur',cs);const sweep=setInterval(()=>{if(!cc.isConnected){cs();removeEventListener('blur',cs);clearInterval(sweep);}},100);
    kap.append(kart('Makine · Ön kapaklar',alan('Kapak / servis paneli',cv),dug('Aç / vidalı paneli sök','ana',()=>request('inceleme.kapak',{goz:+cv.value,ac:true})),cc,
      h('p',{metin:'Menteşeli ve vidalı paneller elle kullanılır; tablette erişim izni istenir. Digital Twin fiziksel açma/takma hareketini gösterir. Kaldırma kapakları QR dolabı gibi dikliğini koruyarak öne ve yukarı ilerler. Kapatmayı bırakınca hareket durur.'}),
      h('p',{id:'bakimKapakDurum',sinif:'tb-mini',metin:covers.map(([id,ad])=>ad+': '+Math.round((d.servis_kapaklari?.[id]?.konum||0)*100)+'%'+(d.servis_kapaklari?.[id]?.hata?' · HATA':'')).join(' / ')})));
    const c=select(Object.keys(d.cekmeceler),'bakimCek'),close=dug('BASILI TUT — çekmeceyi kapat','uyari',()=>{});
    let timer=null,closing=null,pending=false;
    const stop=()=>{clearInterval(timer);timer=null;closing=null;};
    const pulse=()=>{if(pending||!closing||document.hidden||!close.isConnected){if(document.hidden||!close.isConnected)stop();return;}pending=true;TB.komut('inceleme.cekmece',{cekmece:closing,ac:false,basili:true}).then(r=>{if(r.kapali)stop();}).catch(e=>{stop();TBA.hata(e);}).finally(()=>{pending=false;});};
    close.addEventListener('pointerdown',e=>{e.preventDefault();if(timer)return;closing=c.value;pulse();timer=setInterval(()=>{if(!close.isConnected||document.hidden){stop();return;}pulse();},200);});
    close.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&!e.repeat&&!timer){e.preventDefault();closing=c.value;pulse();timer=setInterval(pulse,200);}});
    for(const ev of ['pointerup','pointerleave','pointercancel','lostpointercapture','keyup','blur'])close.addEventListener(ev,stop);
    addEventListener('blur',stop);
    // Removal, tab switching and page hiding end the deadman heartbeat.
    const cleanup=setInterval(()=>{if(!close.isConnected){stop();removeEventListener('blur',stop);clearInterval(cleanup);}},100);
    kap.append(kart('B · Motorlu çekmeceler',alan('Çekmece',c),dug('Çekmeceyi aç','ana',()=>request('inceleme.cekmece',{cekmece:c.value,ac:true})),close,
      h('p',{sinif:'tb-mini',metin:'Kapatma yalnız basılı tutulurken, mevcut düşük hız ve kuvvet sınırıyla yapılır. Bırakınca durur.'}),
      h('p',{metin:Object.entries(d.cekmeceler).map(([id,v])=>id+': '+Math.round(v.konum||0)+' mm').join(' · ')})));
    const g=select(Array.from({length:12},(_,i)=>String(i+1)),'bakimGoz'),side=select(['ROBOT','MUSTERI'],'bakimTaraf');
    kap.append(kart('QR · Boş gözlerin kapakları',alan('Göz',g),alan('Kapak tarafı',side),
      dug('Kapağı aç','ana',()=>request('inceleme.qr',{goz:+g.value,istasyon:side.value,ac:true})),
      dug('Kapağı kapat','',()=>request('inceleme.qr',{goz:+g.value,istasyon:side.value,ac:false})),
      h('p',{metin:'Dolu göz teslim koduyla açılır. Aynı gözün iki kapağı birlikte açılamaz.'}),
      h('p',{sinif:'tb-mini',metin:Object.entries(d.qr).map(([id,q])=>'Göz '+AK_GOZ.etiket(id)+': '+q.durum+' · robot %'+Math.round((q.kapak||0)*100)+' · müşteri %'+Math.round((q.musteri_kapak||0)*100)).join(' / ')})));
    const paras=[...kap.querySelectorAll('p')];
    const status=paras.find(p=>p.textContent.startsWith('Makine çalışıyor;')||p.textContent.startsWith('Makine boşta'));
    const stock=paras.find(p=>p.textContent.startsWith('K1_1:'));
    const coversText=kap.querySelector('#bakimKapakDurum');
    const qrText=paras.find(p=>p.textContent.startsWith('Göz 1:'));
    const clock=[...kap.querySelectorAll('button')].find(b=>b.textContent==='Bakım hareketlerini etkinleştir');
    function refresh(){
      drawSteps(d);
      const busy=!d.bagli||!['KAPALI','BOSTA'].includes(d.hat)||d.kuyruk||d.robot?.gorev;
      if(busy){ST.bakimAcik=false;announce();}
      if(status)status.textContent=busy?'Makine çalışıyor; hareket kilitli.':'Makine boşta · PLC izinleri her istekte denetlenir.';
      modeText.textContent=mode()?'BAKIM AÇIK · Twin’de parçaya tıklayın. Kapatırken basılı tutun; bırakınca durur.':'Bakım modunu açınca Twin’de parçaya tıklamak tabletteki aynı komutu PLC’ye gönderir.';
      modeButton.textContent=mode()?'Bakım modunu kapat':'Bakım modunu aç';
      if(stock)stock.textContent=Object.entries(d.cekmeceler).map(([id,v])=>id+': '+Math.round(v.konum||0)+' mm').join(' · ');
      if(coversText)coversText.textContent=covers.map(([id,ad])=>ad+': '+Math.round((d.servis_kapaklari?.[id]?.konum||0)*100)+'%'+(d.servis_kapaklari?.[id]?.hata?' · HATA':'')).join(' / ');
      if(qrText)qrText.textContent=Object.entries(d.qr).map(([id,q])=>'Göz '+AK_GOZ.etiket(id)+': '+q.durum+' · robot %'+Math.round((q.kapak||0)*100)+' · müşteri %'+Math.round((q.musteri_kapak||0)*100)).join(' / ');
      for(const el of kap.querySelectorAll('button,select'))el.disabled=!!busy||!!d.duraklat;
      modeButton.disabled=!!busy;
      if(clock){clock.hidden=!d.duraklat;clock.disabled=!!busy;}
    }
    let refreshPending=null;
    kap.bakimGuncelle=()=>refreshPending??=(async()=>{try{const next=await TB.hmiAl('/api/tablet/bakim');if(kap.isConnected){d=next;refresh();}}catch(e){drawSteps({bagli:false});throw e;}finally{refreshPending=null;}})();
    refresh();
  };
})();
