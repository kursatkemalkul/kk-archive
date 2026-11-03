/* AUTOKITCH kiosk campaign UI57. Presentation only; ordering stays in index.html. */

(function () {

  'use strict';

  if (new URLSearchParams(location.search).get('mod') !== 'kiosk') return;

  const {h} = AK;

  const en = () => AK.dil.kod === 'en';

  const say = (tr,eng) => en() ? eng : tr;

  Object.assign(AK_DIL.tr, {'kiosk.sms_baslik':'SMS ile haber ver (isteğe bağlı)','kiosk.onayla_ode':'Onayla ve ödemeye geç','kiosk.ode_test':'Deneme ödemesini tamamla'});

  Object.assign(AK_DIL.en, {'kiosk.sms_baslik':'Notify me by SMS (optional)','kiosk.onayla_ode':'Confirm & continue to payment','kiosk.ode_test':'Complete test payment'});

  const ids = ['kasarli','kiymali','kusbasili','sucuklu','patatesli','tavuklu','lahmacun','kola','tatli'];

  const original = window.AK_RESIM;

  window.AK_RESIM = (id,hero=false) => ids.includes(id)

    ? '<img class="food57 food57-'+id+'" src="kiosk57/images/'+id+(hero?'':'-480')+'.webp" alt="" decoding="async" draggable="false">'

    : original(id);

  const icon = name => h('span',{sinif:'icon57 icon57-'+name,'aria-hidden':'true'});

  function visual(u) {

    return h('div',{sinif:'visual57'},

      h('div',{sinif:'vertical57','aria-hidden':'true'},h('b',{metin:u.ek?'MOLA':'PİDE'}),h('span',{metin:u.ek?'MOLA':'PİDE'})),

      h('div',{sinif:'hero-food57',html:AK_RESIM(u.id,true)}));

  }

  function hero(menu,selected,onSelect,onAdd,onDetails) {

    const list=menu.filter(u=>u.id===selected || (!u.ek && !u.tukendi));

    const u=menu.find(u=>u.id===selected) || list[0];

    if(!u) return h('div');

    const strip=h('div',{sinif:'product-strip57','aria-label':say('Öne çıkan pideler','Featured pide')});

    list.slice(0,7).forEach(p=>strip.append(h('button',{

      sinif:'thumb57'+(p.id===u.id?' selected':''),'aria-label':AK.urunAd(p),'aria-pressed':p.id===u.id,

      onclick:()=>onSelect(p.id)},h('span',{sinif:'thumb-image57',html:AK_RESIM(p.id)}),h('span',{metin:AK.urunAd(p).replace(/ pide$/i,'')}))));

    return h('section',{sinif:'campaign57','aria-label':say('Öne çıkan ürün','Featured product')},

      h('div',{sinif:'campaign-copy57'},

        h('p',{sinif:'eyebrow57',metin:say('BİR ISIRIK MUTLULUK','A LITTLE HAPPINESS')}),

        h('h2',{sinif:'campaign-title57'},h('span',{metin:say('İYİ PİDE.','GOOD PIDE.')}),h('strong',{metin:say('İYİ MOD.','GOOD MOOD.')})),

        h('p',{sinif:'campaign-name57',metin:AK.urunAd(u)}),

        h('div',{sinif:'campaign-actions57'},h('span',{sinif:'price57',metin:AK.tl(u.fiyat_kurus)}),

          h('button',{sinif:'ak-dugme ana hero-add57',disabled:!!u.tukendi,onclick:()=>onAdd(u.id),metin:u.tukendi?AK.t('menu.tukendi'):say('Sepete ekle','Add to basket')},icon('plus'))),

        h('button',{sinif:'detail57',onclick:()=>onDetails(u),metin:say('İçindekiler ve alerjenler','Ingredients & allergens')},icon('arrow-right'))),

      visual(u),strip);

  }

  function start(menu) {

    const b=document.querySelector('#baslangic');

    // A real start button replaces the old nested button role.

    b.removeAttribute('role');b.removeAttribute('tabindex');

    const brand=h('div',{sinif:'start-top57'},

      h('div',{sinif:'ak-marka'},'AUTO',h('i',{metin:'KITCH'})),

      h('span',{sinif:'start-tag57',metin:'PİDE · LAHMACUN'}));

    b.classList.add('intro58');

    const content=h('div',{sinif:'start-campaign57'});

    function draw() {

      const u=menu.find(p=>p.id==='sucuklu') || menu.find(p=>!p.ek) || menu[0];

      if(!u)return;

      content.replaceChildren(

        h('div',{sinif:'start-copy57'},

          h('p',{sinif:'eyebrow57',metin:say('BİR ISIRIK MUTLULUK','A LITTLE HAPPINESS')}),

          h('h1',{sinif:'campaign-title57'},h('span',{metin:say('İYİ PİDE.','GOOD PIDE.')}),h('strong',{metin:say('İYİ MOD.','GOOD MOOD.')}))),

        h('div',{id:'donen',sinif:'donen'},visual(u)));

    }

    const foot=h('div',{sinif:'start-bottom57'},

      h('button',{id:'start57',sinif:'ak-dugme ana start-cta57'},h('span',{'data-t':'kiosk.dokun',metin:AK.t('kiosk.dokun')}),icon('arrow-right')),

      h('div',{sinif:'start-languages57'},icon('globe'),h('button',{id:'kTR',sinif:'language57',metin:'Türkçe'}),h('button',{id:'kEN',sinif:'language57',metin:'English'})),

      h('p',{sinif:'start-hint57','data-t':'kiosk.alt',metin:AK.t('kiosk.alt')}));

    b.replaceChildren(brand,content,foot);

    draw();

    return draw;

  }

  function setAttract(on) {

    for(const selector of ['.ak-ust','#ana','#sepetBar','#serit']) {

      const el=document.querySelector(selector);if(el)el.inert=on;

    }

    document.body.classList.toggle('attract57',on);

    if(!on)document.querySelector('#dilD')?.focus({preventScroll:true});

  }

  window.AK_KIOSK57={hero,start,setAttract,icon,say};

})();

