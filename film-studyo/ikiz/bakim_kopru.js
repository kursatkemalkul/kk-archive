// Commands are executed by the authenticated staff tablet, through TB.komut.
// No credentials, axis poses or production commands cross this channel.
export function bakimKopruKur(IKIZ){
  const channel=new BroadcastChannel('autokitch.bakim'),pending=new Map();
  let tablet=null,last=0,quick=null,quickLast=0;
  const active=()=>!!tablet&&Date.now()-last<1800;
  channel.onmessage=({data:m})=>{
    if(m?.tip==='bakim.durum'){
      if(m.hizli){quick=m.tablet;quickLast=Date.now();}
      if(m.aktif){tablet=m.tablet;last=Date.now();}
      else if(m.tablet===tablet){tablet=null;last=0;}
    }else if(m?.tip==='bakim.cevap'&&pending.has(m.id)){
      const p=pending.get(m.id);if(p.tablet!==m.tablet)return;
      clearTimeout(p.timer);pending.delete(m.id);
      if(m.ok)p.resolve(m.sonuc);else p.reject(new Error(m.hata||'PLC bakım isteğini reddetti'));
    }
  };
  // P77 (YÖNETİCİ 22 Eki): a Twin click on a QR / service / wash / E cover is a short maintenance request.
  // The real-machine lock is unchanged: MAIN accepts only when idle; during an order the click is refused here
  // first ('Sipariş sürerken kapak kilitli') without waiting for the tablet. Wash parts are cover ids 16–18.
  const HIZLI=['inceleme.kapak','inceleme.qr'],wash=k=>k.tip==='inceleme.kapak'&&+k.goz>=16;
  IKIZ.bakim={aktif:active,async komut(k,hizli=false){
    if(IKIZ.zamanModu==='kayit')return Promise.reject(new Error('Önce Makineye dön düğmesine bas'));
    let f=IKIZ.son;
    if(f&&k.ac!==false&&(f.kuyruk||f.robot?.gorev||f.hat==='SIPARIS'))return Promise.reject(new Error('Sipariş sürerken kapak kilitli'));
    if(hizli){await window.IKIZ_BAKIM_HAZIRLA?.();const until=Date.now()+6000;while((!quick||Date.now()-quickLast>1800)&&Date.now()<until)await new Promise(r=>setTimeout(r,100));}
    const quickOK=hizli&&HIZLI.includes(k.tip)&&quick&&Date.now()-quickLast<1800;
    if(!active()&&!quickOK)return Promise.reject(new Error('Personel tabletinde MAKİNE → BAKIM → Bakım modunu aç'));
    f=IKIZ.son;
    if(f&&k.ac!==false&&(f.kuyruk||f.robot?.gorev||f.hat==='SIPARIS'))return Promise.reject(new Error('Sipariş sürerken kapak kilitli'));
    if(!f||(!hizli&&f.duraklat)||(k.ac!==false&&(!['KAPALI','BOSTA',...(wash(k)?['TEMIZLIK']:[])].includes(f.hat)||f.kuyruk||f.robot?.gorev)))return Promise.reject(new Error('Bakım için makine ve robot boşta, Twin saati etkin olmalı'));
    const id=crypto.randomUUID(),target=quickOK?quick:tablet;
    return new Promise((resolve,reject)=>{
      const timer=setTimeout(()=>{pending.delete(id);reject(new Error('Personel tableti yanıt vermedi'));},7500);
      pending.set(id,{resolve,reject,timer,tablet:target});
      channel.postMessage({tip:'bakim.komut',id,tablet:target,komut:k,hizli:!!quickOK});
    });
  }};
  return IKIZ.bakim;
}
