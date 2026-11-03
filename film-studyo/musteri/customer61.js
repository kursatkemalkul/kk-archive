/* Customer presentation only. Existing basket, membership and payments stay in index.html. */

(()=>{'use strict';if(new URLSearchParams(location.search).get('mod')==='kiosk')return;

 const ids=['kasarli','kiymali','kusbasili','sucuklu','patatesli','tavuklu','lahmacun','kola','tatli'],original=window.AK_RESIM;

 window.AK_RESIM=id=>ids.includes(id)?'<img src="kiosk57/images/'+id+'-480.webp" alt="" decoding="async" draggable="false">':original(id);

 window.AK_CUSTOMER61={hero:()=>{const {h}=AK,en=AK.dil.kod==='en';return h('section',{sinif:'customer-hero61','aria-label':en?'AUTOKITCH menu':'AUTOKITCH menü'},h('div',{sinif:'customer-copy61'},h('p',{metin:en?'A LITTLE HAPPINESS':'BİR ISIRIK MUTLULUK'}),h('h2',{},en?'GOOD PIDE.':'İYİ PİDE.',h('strong',{metin:en?'GOOD MOOD.':'İYİ MOD.'})),h('a',{href:'#urunler61',sinif:'customer-menu61',metin:en?'Explore the menu':'Menüyü keşfet'})),h('img',{src:'kiosk57/images/sucuklu.webp',alt:en?'Round sucuk pide':'Yuvarlak sucuklu pide'}));}};

})();

