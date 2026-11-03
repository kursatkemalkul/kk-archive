import {screenState,pageItems,products} from './qr-ekran-model.js';
const $=s=>document.querySelector(s),screen=$('#screen'),api=new URLSearchParams(location.search).get('api')||'';
const money=n=>new Intl.NumberFormat('tr-TR',{style:'currency',currency:'TRY',maximumFractionDigits:0}).format(n/100);
let orders=[],menu=[],campaigns=[],fresh=false,lastGood=0;
function el(tag,text,cls){const e=document.createElement(tag);if(text!==undefined)e.textContent=text;if(cls)e.className=cls;return e;}
function fit(){const scale=Math.min(innerWidth/1024,innerHeight/128);screen.style.transform=`translate(${(innerWidth-1024*scale)/2}px,${(innerHeight-128*scale)/2}px) scale(${scale})`;}
addEventListener('resize',fit);fit();
async function get(path){const c=new AbortController(),timer=setTimeout(()=>c.abort(),4500);try{const r=await fetch(api+path,{signal:c.signal,cache:'no-store'});if(!r.ok)throw Error(r.status);return await r.json();}finally{clearTimeout(timer);}}
const photoIDs=new Set(['kasarli','kiymali','kusbasili','sucuklu','patatesli','tavuklu','lahmacun','kola','tatli']);
function art(u,cls='art'){const a=el('div',undefined,cls),src=photoIDs.has(u.id)?`kiosk57/images/${u.id}-480.webp`:u.gorsel;if(src){const image=el('img');image.src=src;image.alt=u.ad||'';image.decoding='async';a.append(image);}return a;}
let menuVisualKey='',promoVisualKey='',adTimer;
function product(u){const card=el('article',undefined,'product'),copy=el('div',undefined,'copy');card.dataset.product=u.id;copy.append(el('h3',u.ad));if(u.ad_en)copy.append(el('div',u.ad_en,'sub'));const unavailable=u.tukendi||u.gecici_yok;copy.append(el('div',unavailable?'Şu an yok':Number.isFinite(u.fiyat_kurus)?money(u.fiyat_kurus)+(u.ornek_fiyat?'*':''):'',unavailable?'price sold':'price'));card.append(art(u),copy);return card;}
function status(selector,items,ready,now){const panel=$(selector),page=pageItems(items,2,now,7),list=panel.querySelector('.orders');panel.querySelector('.pages').textContent=page.pages>1?`${page.page}/${page.pages}`:'';list.replaceChildren();if(!items.length){list.append(el('div',ready?'Hazır sipariş yok':'Hazırlanan sipariş yok','empty'));return;}for(const s of page.items){const card=el('div',undefined,'order');card.dataset.no=s.kisa_no;card.style.setProperty('--order-size',`${Math.min(38,190/Math.max(1,String(s.kisa_no).length))}px`);card.append(el('b',s.kisa_no),el('small',ready?`Dolap ${s.dolap_gozu?AK_GOZ.etiket(s.dolap_gozu):'—'}`:s.kalan_dk>0?`≈ ${s.kalan_dk} dk`:'Hazırlanıyor'));list.append(card);}}
function menuPair(state,now){
 let pool=menu;
 if(state.mode==='REKLAM'){
  const available=menu.filter(u=>!u.tukendi&&!u.gecici_yok),slot=Math.floor(now/8000)%(available.length+campaigns.length+1);
  const hero=available[slot]||(slot===available.length+campaigns.length?(available.find(u=>u.id==='sucuklu')||available[0]):null);
  if(hero){const others=menu.filter(u=>u.id!==hero.id);if(others.length)pool=others;}
 }
 const start=Math.floor(now/8000)%Math.max(pool.length,1);
 return Array.from({length:Math.min(2,pool.length)},(_,i)=>pool[(start+i)%pool.length]);
}
function promotion(state,now){
 const p=$('#promotion'),available=menu.filter(u=>!u.tukendi&&!u.gecici_yok),index=Math.floor(now/8000),count=available.length+campaigns.length+1,slot=index%count;
 const visualKey=JSON.stringify([state.mode,slot,lastGood>0,menu.length,available,campaigns]);
 if(visualKey===promoVisualKey)return;promoVisualKey=visualKey;
 p.replaceChildren();const copy=el('div',undefined,'promo-copy');p.dataset.kind='product';
 if(state.mode==='BAGLANTI'){
  p.dataset.kind='connection';copy.append(el('div','SİPARİŞ BİLGİLERİ','promo-eyebrow'),el('h1',lastGood?'Bağlantı yenileniyor':'Bağlanıyor…'),el('p',lastGood?'Son durumu sipariş takip ekranından kontrol et.':'Sipariş bilgileri birazdan burada.'));
 }else if(!available.length){
  p.dataset.kind='unavailable';copy.append(el('div','GÜNCEL MENÜ','promo-eyebrow'),el('h1',menu.length?'Şu an ürün yok':'Menü yükleniyor…'),el('p','Güncel ürünleri kiosk ekranından kontrol edebilirsin.'));
 }else if(slot<available.length){
  const u=available[slot];p.append(art(u,'promo-art'));
  copy.append(el('div','FIRINDAN SICACIK','promo-eyebrow'),el('h1',u.ad),el('p',u.ad_en||'Siparişini kiosktan ver'));
  if(Number.isFinite(u.fiyat_kurus))copy.append(el('div',money(u.fiyat_kurus)+(u.ornek_fiyat?'*':''),'price'));
 }else if(slot<available.length+campaigns.length){
  const c=campaigns[slot-available.length];p.dataset.kind='campaign';copy.append(el('div','AUTOKITCH','promo-eyebrow'),el('h1',c.tr),el('p',c.en||''));
 }else{
  p.dataset.kind='brand';const hero=available.find(u=>u.id==='sucuklu')||available[0];if(hero)p.append(art(hero,'promo-art'));
  const title=el('h1');title.append(el('span','İYİ PİDE. '),el('strong','İYİ MOD.'));
  copy.append(el('div','BİR ISIRIK MUTLULUK','promo-eyebrow'),title,el('p','Seç. Sipariş ver. Dolaptan al.'));
 }
 p.append(copy);p.dataset.slide=String(slot);p.style.setProperty('--ad-offset',`${-(now%8000)}ms`);
 if(state.mode==='REKLAM'){
  const brand=el('div',undefined,'ad-brand60');brand.append(el('strong','AUTOKITCH'),el('small','PİDE · LAHMACUN'));
  const signature=el('div',undefined,'ad-signature60');signature.append(el('span','İYİ PİDE.'),el('strong','İYİ MOD.'),el('small','SİPARİŞİNİ KİOSKTAN VER'));
  p.append(brand,signature);if(menu.some(u=>u.ornek_fiyat))p.append(el('small','* Örnek fiyat','ad-price-note60'));
 }
}
function render(){const now=Date.now(),state=screenState(orders,fresh);screen.dataset.mode=state.mode;screen.dataset.fresh=String(fresh);$('#headline').textContent=!fresh&&orders.length?'SON BİLGİ · BAĞLANTI KESİLDİ':state.mode==='SIPARIS'?'SİPARİŞ TAKİBİ  /  ORDER STATUS':state.mode==='REKLAM'?'MENÜ  /  MENU':'SİPARİŞ BİLGİLERİ BAĞLANIYOR';$('#clock').textContent=new Date(now).toLocaleTimeString('tr-TR',{hour:'2-digit',minute:'2-digit'});
 status('#ready',state.ready,true,now);status('#preparing',state.preparing,false,now);const cards=$('#menuCards');const shown=menuPair(state,now),visualKey=JSON.stringify(shown);if(visualKey!==menuVisualKey){menuVisualKey=visualKey;cards.replaceChildren(...shown.map(product));if(!menu.length)cards.append(el('div','Menü yükleniyor…','empty'));}$('#priceNote').textContent=menu.some(u=>u.ornek_fiyat)?'* Örnek fiyat':'';promotion(state,now);clearTimeout(adTimer);if(state.mode==='REKLAM')adTimer=setTimeout(render,8000-(now%8000)+5);
}
async function poll(){try{const j=await get('/api/ekran');if(!Array.isArray(j.siparisler))throw Error('invalid orders');orders=j.siparisler;fresh=true;lastGood=Date.now();}catch{fresh=false;}render();setTimeout(poll,2000);}
async function refreshMenu(){try{const j=await get('/api/menu');if(Array.isArray(j.urunler))menu=products(j.urunler);}catch{}render();setTimeout(refreshMenu,60000);}
async function refreshCampaigns(){try{const j=await get('/api/vitrin');campaigns=(j.ornek?[]:(j.kampanyalar||[])).filter(c=>!c.ornek&&typeof c.tr==='string'&&c.tr.length<=90);}catch{}setTimeout(refreshCampaigns,300000);}
render();poll();refreshMenu();refreshCampaigns();setInterval(render,1000);
