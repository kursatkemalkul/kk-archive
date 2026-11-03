/* Operator overview. Read-only summaries; existing sections own all commands and PIN checks. */
(function(){
'use strict';
const {h}=AK,{ST,SEK,kart,dug}=TBA;
const names={B:'Hamur / içecek / tatlı',TOP:'Topping',E:'Karton / katlama',K:'Kesme / sprey',U:'Yıkama',ROB:'Robot',QR:'QR dolabı',F:'Fırın',A:'Açıcı'};
const states={KAPALI:'Kapalı',BOSTA:'Sipariş bekliyor',SIPARIS:'Üretim sürüyor',ISINMA:'Fırın ısınıyor',SERVIS:'Servis modu',TEMIZLIK:'Temizlik modu',HATA:'Müdahale gerekiyor'};
const num=v=>typeof v==='number'&&Number.isFinite(v);
function view(D,connection,now=Date.now()){
 const age=connection.received?Math.max(0,now-connection.received):Infinity;
 const demo=connection.mode==='demo',fresh=!!D&&!connection.error&&age<10000&&(connection.mode==='gercek'||demo);
 const live=fresh&&!demo;
 const stock=Array.isArray(D?.stok)?D.stok:[];
 const tasks=[];
 if(fresh){
  for(const [station,items] of Object.entries(D.gorevler||{}))for(const item of items||[]){
   if(num(item.ekle)&&item.ekle>0)tasks.push({station,title:item.ad||item.kalem||'Malzeme',detail:item.ekle+' '+(item.birim||'')+' doldur',section:'doldur'});
  }
  for(const item of stock){
   if(num(item.makine)&&item.makine===0&&!tasks.some(t=>t.title===(item.ad||item.id)))tasks.push({station:item.istasyon,title:item.ad||item.id,detail:'Makinede kalmadı · stok kaydını kontrol et',section:'stok'});
   if(item.depo_alti===true)tasks.push({station:item.istasyon,title:item.ad||item.id,detail:'Yedek stok az · tedarik kaydını kontrol et',section:'tedarik'});
  }
  for(const item of D.cop||[])if(item.gecti===true)tasks.unshift({station:'',title:item.ad||item.kalem,detail:'Kullanım süresi doldu · atık kaydını incele',section:'atik'});
 }
 return {fresh,live,demo,age,tasks,alarms:fresh&&Array.isArray(D.alarm)?D.alarm:[],state:fresh?(states[D.mod]||'Durum bilinmiyor'):'Güncel veri bekleniyor',temperature:fresh&&num(D.firin_c)?D.firin_c:null,queue:fresh&&num(D.kuyruk)?D.kuyruk:null,wip:fresh&&num(D.wip)?D.wip:null};
}
function maintenance(d){return [
 ['1 · Durum bağlantısı',d.bagli===true?'PLC durum verisi alındı':'Bağlantı bekleniyor'],
 ['2 · Üretim ve kuyruk',['KAPALI','BOSTA'].includes(d.hat)&&d.kuyruk===0?'Hat boşta · kuyruk boş':'Hat: '+(d.hat||'bilinmiyor')+' · kuyruk: '+(num(d.kuyruk)?d.kuyruk:'bilinmiyor')],
 ['3 · Robot',d.robot?.gorev?'Görev sürüyor: '+d.robot.gorev:d.robot?'Aktif görev yok · park konumu ayrıca doğrulanmalı':'Robot geri bildirimi yok'],
 ['4 · Erişim izni','Kapak iznini PLC her istekte denetler. Bu özet, açma izni değildir.']
 ];}
AK.HMI31={view,maintenance};
const current=()=>view(ST.D,{received:ST.hmiReceivedAt,error:ST.baglantiHata,mode:TB.mod.hmi});
const go=section=>{ST.mod='MAKINE';ST.sekme.MAKINE=section;document.documentElement.dataset.hmiMenu='closed';TBA.ciz();};
const show=v=>v===null?'—':TB.f1(v);
const time=()=>ST.hmiReceivedAt?new Date(ST.hmiReceivedAt).toLocaleTimeString('tr-TR'):'Henüz alınmadı';
const old=SEK.MAKINE.durum;
SEK.MAKINE.durum=function(kap){
 if(AK.Q.get('panel')!=='makine')return old(kap);
 const v=current();
 const hero=h('section',{sinif:'h31-hero'},h('p',{sinif:'h31-eyebrow',metin:'OPERASYON ÖZETİ'}),h('h2',{metin:v.state}),h('p',{sinif:'h31-connection',role:'status',metin:v.demo?'DEMO · örnek veriler':v.live?(ST.D?.sim===true?'Dijital ikiz · HMI verisi güncel':'HMI verisi güncel'):'Bağlantı / veri güncelliği sorunu'}),
 h('div',{sinif:'h31-temperature'},h('div',{},h('span',{metin:'FIRIN'}),h('strong',{metin:show(v.temperature)}),h('span',{metin:'°C'})),h('div',{sinif:'h31-arc','aria-hidden':'true'})),
 h('div',{sinif:'h31-kpis'},[['Bekleyen sipariş',v.queue],['Üretimde',v.wip],['Personel görevi',v.fresh?v.tasks.length:null]].map(([label,value])=>h('div',{},h('b',{metin:show(value)}),h('span',{metin:label})))),
 h('p',{sinif:'h31-last',metin:'Son HMI yanıtı: '+time()+' · '+(v.fresh?'2 saniyede bir kontrol':'Eski sayısal değerler gizlendi')}));
 kap.append(hero);
 const tasks=kart('Personelin yapacağı işler');
 if(!v.fresh)tasks.append(h('p',{metin:'Güncel görev ve stok bilgisi alınamadı.'}));
 else if(!Array.isArray(ST.D?.stok)&&!ST.D?.gorevler)tasks.append(h('p',{metin:'Stok verisi yok.'}));
 else if(!v.tasks.length)tasks.append(h('p',{metin:'Stok kaydında doldurma veya süresi dolan ürün görevi yok.'}));
 else {
  v.tasks.slice(0,4).forEach(t=>tasks.append(dug((names[t.station]||t.station||'Stok')+' · '+t.title+'\n'+t.detail,'h31-task',async()=>{
   if(t.section==='doldur'){ST.secili=t.station;ST.sayim={};ST.plan=null;try{ST.plan=await TB.hmiAl('/api/tablet/plan?ist='+encodeURIComponent(t.station));}catch(e){TBA.hata(e);}}
   go(t.section);
  })));
  if(v.tasks.length>4)tasks.append(dug('Tüm stokları gör · '+v.tasks.length+' görev','',()=>go('stok')));
 }
 const alerts=kart('Alarmlar');
 if(!v.fresh)alerts.append(h('p',{metin:'Güncel alarm durumu bilinmiyor.'}));
 else if(!v.alarms.length)alerts.append(h('p',{metin:'Aktif alarm yok.'}));
 else v.alarms.slice(0,3).forEach(a=>alerts.append(h('p',{sinif:'h31-alert',metin:(names[a.istasyon]||a.istasyon||'Hat')+' · '+(a.metin||a.ad||'Alarm')})));
 alerts.append(dug('Alarm rehberi / geçmiş','',()=>go('alarm')));
 kap.append(h('div',{sinif:'h31-panels'},tasks,alerts));
 kap.append(h('div',{sinif:'h31-actions'},dug('Bakım adımları','',()=>go('bakim')),dug(TB.yetkili('servis')?'Teknik servis · yetkili':'Teknik servis · kilitli','',()=>go('servis')),dug('Tüm işlemler ☰','',()=>document.documentElement.dataset.hmiMenu='open')));
};
// The existing service renderer checks role BEFORE reading service data or showing jog controls.
const service=SEK.MAKINE.servis;
SEK.MAKINE.servis=function(kap){kap.append(kart('Yetkili servis erişimi',h('p',{metin:TB.yetkili('servis')?'Servis yetkisi doğrulandı · '+(TB.ad||TB.rol):'Teknik hareketler için servis veya yönetici PIN’i gerekir. Personel yetkisi yeterli değildir.'}),TB.pin?dug('Oturumu kilitle','',()=>{TB.cikis();go('durum');}):null));return service(kap);};
const css=document.createElement('style');css.textContent=`
.h31-hero{padding:24px;border:1px solid #29323b;border-radius:18px;background:linear-gradient(120deg,#090c10,#151d24);overflow:hidden;color:#f0f4f8}.h31-eyebrow{font-size:11px;letter-spacing:.2em;color:#92acbb}.h31-hero h2{font-size:clamp(24px,5vw,38px);margin:12px 0}.h31-connection{color:#8dc6d9;font-size:14px}.h31-temperature{display:flex;position:relative;min-height:190px;align-items:center}.h31-temperature strong{font-size:clamp(68px,14vw,112px);line-height:1.2;font-weight:300;display:block;letter-spacing:-.06em}.h31-temperature span{color:#adc6d2;font-size:13px}.h31-arc{position:absolute;right:10%;width:150px;height:150px;border:2px solid #294d62;border-left:5px solid #45b9d5;border-bottom-color:transparent;border-radius:50%;transform:rotate(25deg);box-shadow:-12px 0 25px -20px #6cdcf6}.h31-kpis{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;padding-top:16px;border-top:1px solid #293743}.h31-kpis b{display:block;font-size:28px;font-weight:400}.h31-kpis span,.h31-last{font-size:12px;color:#a8b7c3}.h31-last{margin:20px 0 0}.h31-panels{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:16px}.h31-panels .ak-kart{margin:0;min-width:0}.h31-task{display:block!important;width:100%;white-space:pre-line!important;text-align:left!important;min-height:60px!important;margin:8px 0;line-height:1.5!important}.h31-alert{border-left:3px solid #ec9b6c;padding-left:12px}.h31-actions{display:flex;flex-wrap:wrap;gap:10px;margin:16px 0}.h31-maintenance{display:grid;gap:10px}.h31-maintenance p{margin:0;padding:12px;background:var(--ak-zemin2);border-radius:8px}.h31-maintenance b{display:block;margin-bottom:6px}.h31-freshbar{font-size:12px;color:var(--ak-yazi2)}@media(max-width:620px){.h31-panels{grid-template-columns:1fr}.h31-hero{padding:18px}.h31-arc{right:0;width:110px;height:140px}.h31-kpis span{font-size:11px}.h31-actions button{flex:1}}
`;document.head.append(css);
// Update freshness labels without replacing inputs, dialogs, or a held maintenance button.
let freshness;
setInterval(()=>{
 const v=current();
 for(const el of document.querySelectorAll('.h31-last'))el.textContent='Son HMI yanıtı: '+time()+' · '+(v.fresh?'2 saniyede bir kontrol':'Eski sayısal değerler gizlendi');
 const chips=document.querySelectorAll('.hmi-system-state .hmi-state-chip');
 if(chips[0]){chips[0].textContent=v.demo?'DEMO':v.live?'● HMI bağlı':'● Güncel veri yok';chips[0].className='hmi-state-chip '+(v.live?'connected':'disconnected');}
 if(chips[1]&&(!v.fresh||v.demo)){chips[1].textContent=v.demo?'Örnek durum':'Veri güncel değil';chips[1].className='hmi-state-chip disconnected';}
 const alarm=document.querySelector('.hmi-alarm-chip');if(alarm&&(!v.fresh||v.demo))alarm.textContent=v.demo?'DEMO · '+v.alarms.length+' alarm':'Alarm durumu bilinmiyor';
 const key=v.fresh+':'+v.demo;
 if(freshness!==undefined&&key!==freshness&&ST.mod==='MAKINE'&&ST.sekme.MAKINE==='durum')TBA.ciz(false);
 freshness=key;
},1000);
})();
