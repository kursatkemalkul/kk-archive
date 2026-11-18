(() => {
  'use strict';
  const button=document.getElementById('m-canli');
  const area=document.getElementById('maliyet');
  const status=document.getElementById('m-durum');
  if(!button || !area || !window.PinInvestorCost) return;
  const url=new URL('sunum-okuma.html','https://industrialproductdesigner.com/autokitch/otonom/maliyet/');
  const protocol='autokitch-cost-v1';
  let detected=false,checking=null,frame=null,popup=null,channel='',timer=0;
  const remembered=()=>{try{return localStorage.getItem('pin-maliyet-baglantisi')==='1';}catch{return false;}};
  function stopTimer(){clearInterval(timer);timer=0;}
  function connect(target){
    if(!target) return;
    stopTimer();channel=crypto.randomUUID();
    let attempts=0;
    const hello=()=>{
      if(target.closed||attempts++>=25){stopTimer();return;}
      target.postMessage({protocol,channel,kind:'connect'},url.origin);
    };
    hello();timer=setInterval(hello,450);
  }
  function quietConnect(){
    if(frame) return;
    frame=document.createElement('iframe');frame.hidden=true;frame.title='Bağlı maliyet hesabı';
    frame.referrerPolicy='no-referrer';
    frame.addEventListener('load',()=>connect(frame.contentWindow),{once:true});
    frame.src=url.href;document.body.append(frame);
  }
  async function detect(){
    if(checking||detected) return;
    checking=(async()=>{
      try{
        const r=await fetch(url,{mode:'cors',credentials:'omit',cache:'no-cache',signal:AbortSignal.timeout(7000)});
        if(!r.ok||!r.headers.get('content-type')?.includes('text/html')) return;
        const html=await r.text();
        if(!html.slice(0,500).includes('<meta name="autokitch-cost-reader" content="1">')) return;
        detected=true;button.hidden=false;
        if(remembered() || location.origin===url.origin) quietConnect();
      }catch{/* The public model and the original calculator remain available. */}
      finally{checking=null;}
    })();
    return checking;
  }
  function validReport(r){
    if(!r||!Array.isArray(r.scenarios)||r.scenarios.length!==3||!r.columns) return false;
    const values=['daily','revenue','ingredients','fees','fixed','tax','drinks','sides','profit'];
    const keys=['price','daily','ingredients','box','cost','contribution'];
    return ['M','S','D','P'].every(k=>{
      const c=r.columns[k];
      return c && values.every(n=>Number.isFinite(c[n])) && (c.breakEven===null||Number.isFinite(c.breakEven)) &&
        ['pide','lahmacun','pizza'].every(p=>c.products?.[p] && keys.every(n=>Number.isFinite(c.products[p][n])));
    }) && r.scenarios.every(s=>['daily','pide','lahmacun','profit'].every(n=>Number.isFinite(s[n])));
  }
  window.addEventListener('message',e=>{
    const m=e.data;
    if(e.origin!==url.origin || !e.source || (e.source!==popup && e.source!==frame?.contentWindow) ||
       !m || m.protocol!==protocol || m.channel!==channel) return;
    if(m.kind==='connected'){stopTimer();return;}
    if(m.kind==='report'&&validReport(m.report)){
      window.PinInvestorCost.setAccount(m.report,m.asOf);
      button.textContent='Hesap bağlantısını aç';
      try{localStorage.setItem('pin-maliyet-baglantisi','1');}catch{}
      return;
    }
    if(['auth','denied','empty','offline','unavailable'].includes(m.kind)){
      window.PinInvestorCost.disconnect();
      const reason={auth:'Kayıtlı hesabı görmek için Google oturumu gerekiyor.',denied:'Bu Google hesabının kayıtlı tabloya erişimi yok.',
        empty:'Bu hesap için maliyet kaydı bulunmuyor.',offline:'Kayıtlı hesaba şu anda ulaşılamıyor.',unavailable:'Kayıtlı tablo şu anda okunamıyor.'}[m.kind];
      status.textContent=reason+' Yayımlanmış varsayımlar gösteriliyor.';
      button.textContent='Kaydedilmiş hesabı bağla';
    }
  });
  button.addEventListener('click',()=>{
    if(popup&&!popup.closed){popup.focus();return;}
    popup=window.open(url.href,'autokitch-maliyet-okuma','popup,width=480,height=520');
    if(popup) connect(popup);
    else status.textContent='Maliyet hesabı için açılır pencereye izin ver veya asıl tabloyu aç.';
  });
  area.addEventListener('toggle',()=>{if(area.open) detect();});
  if(remembered()||area.open || location.origin===url.origin) detect();
  window.addEventListener('pagehide',stopTimer);
})();
