/* One authoritative PLC lot per drawer. Counts stay in the refill workflow. */
(function(){
 'use strict';
 const {h,bildir}=AK,{ST,SEK,kart,dug,alan,giris}=TBA;
 const previous=SEK.MAKINE.stok;
 const dateInput=epoch=>{
  if(!(epoch>0))return '';
  const d=new Date(epoch*1000),local=new Date(d.getTime()-d.getTimezoneOffset()*60000);
  return local.toISOString().slice(0,19);
 };
 function payload(form){
  const epoch=k=>new Date(form[k]).getTime()/1000;
  const a=epoch('uretim'),b=epoch('hazir'),c=epoch('son');
  if(!form.cekmece||!form.parti?.trim()||new TextEncoder().encode(form.parti.trim()).length>31||![a,b,c].every(Number.isFinite)||a<=0||b<a||c<=b||form.onay!==true)
   throw Error('Parti kodunu, üç tarihi ve onayı tamamlayın.');
  return {cekmece:form.cekmece,parti_id:form.parti.trim(),uretim_utc:a,hazir_utc:b,son_kullan_utc:c,parti_onay:true};
 }
 AK.Parti86={payload,dateInput};
 SEK.MAKINE.stok=function(kap){
  previous(kap);if((ST.altStok||'stok')!=='stok')return;
  const drawers=ST.D?.cekmeceler||{},entries=Object.entries(drawers);
  if(!entries.length)return;
  const state=ST.parti86||(ST.parti86={});
  function load(cd){
   const lot=drawers[cd]?.parti_tarih||{};
   Object.assign(state,{cekmece:cd,parti:lot.parti_id||'',uretim:dateInput(lot.uretim_utc),hazir:dateInput(lot.hazir_utc),son:dateInput(lot.son_kullan_utc),onay:false});
  }
  if(!drawers[state.cekmece])load(entries.find(([,v])=>v.adet>0&&!v.parti_tarih?.parti_onay)?.[0]||entries[0][0]);
  const select=h('select',{sinif:'ak-giris','data-parti86':'drawer',onchange:e=>{load(e.target.value);TBA.ciz();}},entries.map(([cd,v])=>h('option',{value:cd,metin:cd+' · '+v.adet+' adet'+(v.parti_tarih?.parti_onay?'':' · parti onayı gerekli')})));
  select.value=state.cekmece;
  const input=(key,type)=>giris({type,value:state[key]||'',step:type==='datetime-local'?'1':undefined,'data-parti86':key,oninput:e=>{state[key]=e.target.value;}});
  const lot=drawers[state.cekmece]?.parti_tarih||{},card=kart('Çekmece parti bilgisi',
   alan('Çekmece',select),lot.sanal?h('p',{metin:'Sanal başlangıç partisi · fiziksel ürün etiketi değildir.'}):null,
   alan('Parti / etiket kodu',input('parti','text')),
   alan('Üretim zamanı',input('uretim','datetime-local')),
   alan('Kullanıma hazır olma zamanı',input('hazir','datetime-local')),
   alan('Etiketteki kullanım sonu',input('son','datetime-local')),
   h('label',{stil:{display:'flex',gap:'10px',alignItems:'center'}},h('input',{type:'checkbox',checked:state.onay,'data-parti86':'confirm',onchange:e=>{state.onay=e.target.checked;}}),' Parti bilgilerini ve hazır olma zamanını doğruladım'),
   h('div',{sinif:'tb-yatay',stil:{marginTop:'12px'}},dug('Partiyi kaydet','ana',()=>TBA.islem('personel',async()=>{
    const result=await TB.komut('stok.parti',payload(state));
    if(result?.ok===false)throw Error(result.hata||'PLC parti bilgisini kabul etmedi.');
    state.onay=false;bildir('Parti bilgisi PLC’ye kaydedildi');await TBA.yenile();
   },'Parti onayı için PIN'))));
  card.dataset.parti86='form';kap.append(card);
 };
})();
