/* One machine HMI surface; all actions stay in the shared tablet API/PLC path. */
(function(){
'use strict';
const {h}=AK,{ST,SEK,kart,dug}=TBA;
const go=k=>{ST.mod='MAKINE';ST.sekme.MAKINE=k;TBA.ciz();};
const machine=AK.Q.get('panel')==='makine';
const names={B:'Hamur / stok',A:'Açıcı',TOP:'Topping',F:'Fırın',K:'Kesme / sprey',E:'Katlama',ROB:'Robot',QR:'QR dolabı'};
const status={KAPALI:'Kapalı',BOSTA:'Hazır · sipariş bekliyor',SIPARIS:'Üretim açık',ISINMA:'Fırın ısınıyor',SERVIS:'Servis modu',TEMIZLIK:'Temizlik modu',HATA:'Arıza var'};
const css=document.createElement('style');css.textContent=`
.hmi-hero{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:18px;border:1px solid var(--ak-cizgi);border-left:5px solid #e89e32;border-radius:12px;margin-bottom:12px}.hmi-hero h2{margin:0 0 6px;font-size:25px}.hmi-hero p{margin:0}.hmi-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin:12px 0}.hmi-grid button{min-height:75px;white-space:normal}.hmi-stations{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px}.hmi-station{padding:12px;border:1px solid var(--ak-cizgi);border-radius:9px;display:flex;flex-direction:column;gap:6px}.hmi-station[data-state=CALISIYOR]{border-color:#36bb85}.hmi-station[data-state=DURDU]{border-color:#ec6666}.hmi-kpi{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin:12px 0}.hmi-kpi>div{padding:12px;background:var(--ak-zemin2);border-radius:8px}.hmi-kpi b{display:block;font-size:23px}.hmi-table{width:100%;border-collapse:collapse}.hmi-table td,.hmi-table th{padding:10px;text-align:left;border-bottom:1px solid var(--ak-cizgi)}.hmi-note{font-size:13px;color:var(--ak-yazi2)}@media(max-width:650px){.hmi-grid,.hmi-stations,.hmi-kpi{grid-template-columns:repeat(2,minmax(0,1fr))}.hmi-table{font-size:13px}}
`;document.head.append(css);
const number=v=>v==null?'—':TB.f1(v);
const navigation=()=>h('div',{sinif:'hmi-grid'},[['doldur','Stok doldur'],['stok','Stoklar'],['topping','Reçeteler / gramaj'],['bakim','Bakım / kapaklar'],['servis','Teknik servis'],['atik','Atık / boşaltma'],['alarm','Alarmlar'],['acilis','Açılış / kapanış']].map(([k,n])=>dug(n,'',()=>go(k))));
const previousOverview=SEK.MAKINE.durum;
SEK.MAKINE.durum=function(kap){
 const D=ST.D;
 if(machine){
  const offline=!D||ST.baglantiHata||TB.mod.hmi!=='gercek',alarms=D?.alarm||[],temperature=D?.firin_c;
  kap.append(h('section',{sinif:'hmi-dial-home'},h('div',{sinif:'hmi-dial-status',role:'status',metin:offline?'Bağlantı bekleniyor':status[D.mod]||D.mod}),h('button',{sinif:'hmi-dial',type:'button','aria-label':'Makine menüsünü aç',onclick:()=>{document.documentElement.dataset.hmiMenu='open';}},h('span',{sinif:'hmi-dial-label',metin:'FIRIN'}),h('span',{sinif:'hmi-dial-number',metin:temperature==null?'—':Math.round(temperature)}),h('span',{sinif:'hmi-dial-unit',metin:'°C'}),h('span',{sinif:'hmi-thermo-mode',metin:offline?'VERİ YOK':D.hazir?'HAZIR':'FIRIN SICAKLIĞI'})),h('div',{sinif:'hmi-dial-summary'},h('div',{},h('b',{metin:D?.kuyruk??'—'}),h('span',{metin:'Bekleyen sipariş'})),h('div',{},h('b',{metin:D?.wip??'—'}),h('span',{metin:'Hattaki ürün'}))),h('p',{sinif:'hmi-dial-foot',metin:offline?'Canlı veriler bekleniyor':alarms.length?alarms.length+' aktif alarm':D.bekleme||'Sistem durumu izleniyor'})));
  if(alarms.length)kap.append(dug('Alarmları aç · '+alarms.length,'',()=>go('alarm')));return;
 }
 if(machine)kap.append(h('h1',{sinif:'hmi-home-title',metin:'Ana sayfa · Genel bakış'}));
 if(!D){kap.append(kart('Makineye bağlanılıyor',h('p',{metin:'Canlı durum bekleniyor.'})));return;}
 if(D.kurtarma?.aktif)return previousOverview(kap);
 const offline=ST.baglantiHata||TB.mod.hmi!=='gercek';
 kap.append(h('section',{sinif:'hmi-hero',role:'status'},h('div',{},h('h2',{metin:offline?'Makine bağlantısı yok':status[D.mod]||D.mod}),h('p',{metin:offline?'Gösterilen değerler güncel olmayabilir. Komut göndermeyin.':D.bekleme||((D.alarm||[]).length?'Aktif alarmları kontrol edin.':D.hazir?'PLC bağlı · makine hazır':'Makine hazırlık koşullarını bekliyor.')})),dug('Alarmları gör','',()=>go('alarm'))));
 kap.append(h('div',{sinif:'hmi-kpi'},[[D.kuyruk,'Kuyruk'],[D.wip,'Hatta ürün'],[number(D.firin_c)+' °C','Fırın'],[number(D.soguk?.B)+' °C','Çekmece soğutucu']].map(([v,n])=>h('div',{},h('b',{metin:v??'—'}),h('span',{metin:n})))));
 kap.append(h('div',{sinif:'hmi-stations'},Object.entries(names).map(([k,n])=>{const v=D.istasyonlar?.[k];return h('div',{sinif:'hmi-station','data-state':v||''},h('b',{metin:n}),h('span',{metin:D.dolum?.[k]?'Dolum: '+D.dolum[k]:({BOS:'Bekliyor',CALISIYOR:'Çalışıyor',DURDU:'Durdu',KAPI_ACIK:'Kapak açık'})[v]||v||'Veri yok'}));})));
 kap.append(navigation());
 for(const a of D.alarm||[])kap.append(h('p',{sinif:'ak-ipucu uyari',metin:(a.ad||'Alarm')+' · '+(a.metin||'')}));
 const empty=Object.entries(D.cekmeceler||{}).filter(([,v])=>!v.adet).map(([k])=>k);
 kap.append(h('p',{sinif:'hmi-note',metin:'Soğutucu TOP: '+number(D.soguk?.TOP)+' °C · Boş çekmece: '+(empty.join(', ')||'yok')+' · Yetki: '+(TB.rol||'salt okunur')}));
 if(D.kurtarma?.aktif)kap.append(kart('Güç kesintisi kurtarması',h('p',{metin:'Kurtarma adımlarını tamamlamadan üretime geçmeyin.'}),dug('Kurtarma / açılış','',()=>go('acilis'))));
};
SEK.MAKINE.atik=function(kap){
 const D=ST.D;if(!D)return;
 kap.append(kart('Atık ve çekmece boşaltma',h('p',{metin:'Süresi geçen hamurlar mevcut PLC ıskarta sırasıyla robot tarafından atılır. İçecek ve tatlı boşaltılması personel dolum işlemiyle yapılır.'}),h('p',{sinif:'hmi-note',metin:'Bu ekran stok silerek ürün atılmış gibi göstermez. Henüz PLC’de bulunmayan seçili göz / tüm hamurları zorla robotla atma komutu gönderilmez.'})));
 const rows=Object.entries(D.cekmeceler||{});
 kap.append(kart('Çekmeceler · canlı PLC stoğu',h('table',{sinif:'hmi-table'},h('thead',{},h('tr',{},['Çekmece','İçerik','Adet','Son kullanım','Durum'].map(m=>h('th',{metin:m})))),h('tbody',{},rows.map(([id,v])=>h('tr',{},h('td',{metin:id}),h('td',{metin:({HAMUR_PIDE:'Pide hamuru',HAMUR_LAHM:'Lahmacun hamuru',ICECEK:'İçecek',TATLI:'Tatlı'})[v.icerik]||v.icerik||'—'}),h('td',{metin:v.adet??'—'}),h('td',{metin:v.parti_tarih?.son_kullan_utc?TB.tarihSaat(v.parti_tarih.son_kullan_utc):'—'}),h('td',{metin:v.parti_tarih?.suresi_gecti?'Süresi geçti · PLC ıskarta':v.kilit_metin||'Kullanılabilir'})))))));
 kap.append(h('div',{sinif:'tb-yatay'},dug('Dolum / personelle boşaltma','ana',()=>{ST.secili=null;go('doldur');}),dug('Çekmece bakım kontrolü','',()=>go('bakim')),dug('Zayi kayıtları','',()=>go('gun'))));
};
// Existing command role checks remain authoritative; stale/demo state never sends machine actions.
const command=TB.komut;
TB.komut=async function(...args){if(!AK.Q.get('demo')&&(ST.baglantiHata||TB.mod.hmi!=='gercek'))throw new Error('Canlı makine bağlantısı yok; komut gönderilmedi.');return command(...args);};
const action=TBA.islem;
TBA.islem=async function(...args){if(!AK.Q.get('demo')&&(ST.baglantiHata||TB.mod.hmi!=='gercek')){TBA.hata(new Error('Canlı makine bağlantısı yok; işlem gönderilmedi.'));return null;}return action(...args);};
if(machine){
 document.documentElement.dataset.tema='koyu';document.documentElement.dataset.hmiHome='black';
 const theme=document.createElement('style');theme.textContent=`
 :root[data-suite][data-yuzey=tablet][data-hmi-home=black]{--ak-zemin:#000;--ak-zemin2:#111315;--ak-kart:#15181b;--ak-yazi:#f5f5f5;--ak-yazi2:#c3c8cd;--ak-soluk:#959da5;--ak-cizgi:#30363c;--ak-vurgu:#f29339;--ak-vurgu2:#ffad5c;--ak-vurgu-zemin:#302014;--ak-vurgu-yazi:#080808;--ak-iyi:#65d59a;--ak-iyi-zemin:#10271b;--ak-uyari:#f5c166;--ak-uyari-zemin:#302713;--ak-kotu:#ff827e;--ak-kotu-zemin:#321818;color-scheme:dark}
 html[data-hmi-home=black] body{background:#080a0d}
 html[data-hmi-home=black] .tb-ekran{grid-template-columns:minmax(0,1fr);grid-template-rows:68px minmax(0,1fr);background:#080a0d}
 html[data-hmi-home=black] .tb-ust{flex-wrap:wrap;height:auto;min-height:90px;gap:8px;padding:10px 14px}html[data-hmi-home=black] .tb-ekran{grid-template-rows:auto minmax(0,1fr)}
 .hmi-system-state{order:3;width:100%;display:flex;gap:8px;align-items:center;flex-wrap:wrap}.hmi-state-chip{font-size:12px;border-radius:20px;padding:5px 10px;background:#19222b;color:#b8c7d5}.hmi-state-chip.connected,.hmi-state-chip.ready{background:#142c20;color:#8be1af}.hmi-state-chip.disconnected{background:#332819;color:#f2c87b}.hmi-state-chip.fault,.hmi-alarm-chip.fault{background:#391a1b!important;color:#ffb2ad!important;border-color:#a94f4d!important}
 html[data-hmi-home=black] .hmi-alarm-chip{font-size:12px;min-height:28px;padding:4px 10px}html[data-hmi-home=black] .tb-sekmeler{top:105px}
 html[data-hmi-home=black] .tb-ust{background:#080a0d;color:#e8eef5;grid-column:1;justify-content:space-between;border-bottom:1px solid #202731}
 html[data-hmi-home=black] .tb-ust .ak-dugme{background:#171c23;color:#e8eef5;border:1px solid #34404e;font-size:14px}
 html[data-hmi-home=black] .tb-ust .ak-marka{color:#e8eef5} .hmi-header-actions{display:flex;gap:8px}
 html[data-hmi-home=black] .tb-sekmeler{display:none;position:fixed;left:0;top:68px;bottom:0;width:270px;background:#0d1117;z-index:20;border-right:1px solid #34404e}
 html[data-hmi-home=black][data-hmi-menu=open] .tb-sekmeler{display:block}
 html[data-hmi-home=black] .tb-sekmeler button{background:#141a22;color:#e6edf5;border-color:#303c49;min-height:50px}
 html[data-hmi-home=black] .tb-icerik{grid-column:1;grid-row:2;background:#080a0d;padding:24px;min-width:0}
 .hmi-dial-home{min-height:75vh;display:flex;align-items:center;justify-content:center;flex-direction:column;background:radial-gradient(ellipse at 50% 40%,#24313e 0%,#121922 35%,#080a0d 65%)}
 .hmi-dial-status{color:#c4d5e5;font-size:19px;letter-spacing:.04em;text-align:center;margin:0 0 45px}
 html[data-hmi-home=black] .hmi-dial{position:relative;display:flex;flex-direction:column;align-items:center;justify-content:center;width:min(60vw,360px);height:min(60vw,360px);border-radius:50%;background:radial-gradient(circle at 48% 40%,#151a20,#050709 80%);border:1px solid #6b7d8d;box-shadow:0 0 26px #acc9e959,0 0 90px #9bc4ed29,inset 0 0 35px #000;color:#edf4fc;overflow:visible}
 .hmi-dial:before{content:'';position:absolute;inset:-24px;border-radius:50%;border:1px solid #8b9bab66;border-left-color:#d9e8f8}
 .hmi-dial:after{content:'';position:absolute;width:1px;height:28%;background:#dbeaff;top:-15%;left:28%;transform:rotate(-28deg);transform-origin:bottom}
 .hmi-dial-label{font-size:13px;letter-spacing:.22em;color:#96a8ba}.hmi-dial-number{font-size:clamp(60px,14vw,105px);font-weight:200;line-height:1.35;letter-spacing:-.06em}.hmi-dial-unit{font-size:16px;color:#9aabbc}
 .hmi-dial-summary{display:flex;gap:65px;margin-top:65px;text-align:center}.hmi-dial-summary b{display:block;color:#e6eef8;font-size:32px;font-weight:400}.hmi-dial-summary span{color:#a3b0bd;font-size:14px}.hmi-dial-foot{color:#aab9c8;text-align:center;font-size:14px;margin-top:35px}
html[data-hmi-home=black] .hmi-dial-home{align-items:flex-start;position:relative;min-height:73vh;padding:28px 24px;background:linear-gradient(65deg,#090b0d 0%,#090b0d 60%,#14191d 60%,#090b0d 100%)}
 html[data-hmi-home=black] .hmi-dial-status{font-size:16px;text-transform:uppercase;letter-spacing:.12em;text-align:left;margin:0 0 85px;color:#8eb9c9}
 html[data-hmi-home=black] .hmi-dial{width:100%;height:310px;align-items:flex-start;justify-content:center;padding-left:10px;background:none;border:0;box-shadow:none;border-radius:0;position:relative}
 html[data-hmi-home=black] .hmi-dial:before{inset:auto;left:54%;top:0;width:240px;height:300px;border-radius:50%;border:3px solid #285770;border-left:5px solid #3fb6d5;box-shadow:-12px 0 22px -16px #51d0ec;background:none;transform:rotate(14deg)}
 html[data-hmi-home=black] .hmi-dial:after{top:38px;left:58%;height:20px;width:20px;border-radius:50%;background:#48b9d5;box-shadow:0 0 18px #4fd5f688;transform:none}
 html[data-hmi-home=black] .hmi-dial-number{font-size:112px;font-weight:300;line-height:1.2;letter-spacing:-.06em;z-index:1}.hmi-thermo-mode{position:absolute;top:-40px;left:10px;padding:5px 10px;background:#1e3a2c;color:#91d9ad;border-radius:6px;font-size:12px;letter-spacing:.06em}
 html[data-hmi-home=black] .hmi-dial-label{color:#b7c4cc;font-size:13px;letter-spacing:.1em}html[data-hmi-home=black] .hmi-dial-unit{position:absolute;left:70%;top:145px;font-size:24px;color:#66bdd7;text-shadow:0 0 14px #48b9d555}
 html[data-hmi-home=black] .hmi-dial-summary{margin-top:85px;gap:45px;align-self:center}html[data-hmi-home=black] .hmi-dial-foot{align-self:center;font-size:13px}
 html[data-hmi-home=black] .hmi-home-title{font-size:28px;margin:0 0 14px}html[data-hmi-home=black] .hmi-station{background:#101214}
 `;document.head.append(theme);
 ST.mod='MAKINE';document.title='AUTOKITCH · Makine HMI';
 // An inactive operator session returns to the read-only overview, never starts production.
 let touched=Date.now();for(const e of ['pointerdown','keydown','input','wheel'])addEventListener(e,()=>{touched=Date.now();},{passive:true});
 setInterval(()=>{if(Date.now()-touched>120000&&!TBA._ptr.basili&&!document.querySelector('.ak-modal-perde')&&['stok','atik','alarm','gun'].includes(ST.sekme.MAKINE)&&!['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName)){go('durum');}},5000);
}
})();
