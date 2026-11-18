(() => {
  'use strict';
  const area=document.getElementById('maliyet');
  if (!area||!window.PinCost) return;
  const sourceUrl='https://industrialproductdesigner.com/autokitch/otonom/maliyet/';
  const names={M:'PIN personelli',S:'PIN insansız',D:'Usta Pideci',P:'Mahalle pidecisi'};
  const groups=Object.keys(names);
  const products={pide:'Kaşarlı pide',lahmacun:'Lahmacun',pizza:'Pizza'};
  const areaStatus=document.getElementById('m-durum');
  const number=new Intl.NumberFormat('tr-TR',{maximumFractionDigits:0});
  const decimal=new Intl.NumberFormat('tr-TR',{maximumFractionDigits:2});
  const asMoney=n=>Number.isFinite(n)?number.format(n)+' TL':'—';
  const moneyExact=n=>Number.isFinite(n)?decimal.format(n)+' TL':'—';
  const integer=n=>Number.isFinite(n)?number.format(n):'—';
  const element=(tag,text,cls)=>{
    const node=document.createElement(tag);
    if (text!==undefined) node.textContent=text;
    if (cls) node.className=cls;
    return node;
  };
  function bar(label,amount,max,css) {
    const row=element('div',undefined,css);
    const line=element('i',undefined,'cb');
    line.style.width=(max>0?Math.min(100,100*Math.abs(amount)/max):0)+'%';
    line.setAttribute('aria-hidden','true');
    row.append(element('span',label),line,element('em',asMoney(amount)));
    return row;
  }
  function table(title,headings,rows) {
    const wrap=element('div',undefined,'m-table-wrap');
    wrap.tabIndex=0;
    wrap.setAttribute('role','region');
    wrap.setAttribute('aria-label',title);
    const table=element('table');
    table.createCaption().textContent=title;
    const head=table.createTHead().insertRow();
    for (const name of headings) {
      const cell=element('th',name);
      cell.scope='col';
      head.append(cell);
    }
    const body=table.createTBody();
    for (const [name,...cells] of rows) {
      const tr=body.insertRow(), label=element('th',name);
      label.scope='row';
      tr.append(label);
      for(const value of cells) tr.insertCell().textContent=value;
    }
    wrap.append(table);
    return wrap;
  }
  function display(report) {
    const columns=report.columns, current=columns.M;
    const chart=document.getElementById('f-urunler');
    const bars=[];
    for (const id of ['pide','lahmacun']) {
      const group=element('div',undefined,'grup');
      group.append(element('span',products[id]));
      const max=Math.max(...['M','D','P'].map(c=>columns[c].products[id].price));
      for (const key of ['M','D','P']) group.append(bar(key==='M'?'PIN':names[key],columns[key].products[id].price,max,key==='M'?'fs pin':'fs'));
      bars.push(group);
    }
    chart.replaceChildren(...bars);
    const max=Math.max(...report.scenarios.map(s=>Math.abs(s.profit)));
    document.getElementById('f-senaryolar').replaceChildren(...report.scenarios.map(s=>bar('Günde '+s.daily+' ürün',s.profit,max,'sen')));
    for(const [id,value] of Object.entries({'pide-contribution':current.products.pide.contribution,
      'lahmacun-contribution':current.products.lahmacun.contribution,'current-profit':current.profit})) {
      const target=document.querySelector('[data-cost="'+id+'"]');
      target.textContent=asMoney(value);
    }
    const heads=['',...Object.values(names)];
    const unitRows=[];
    Object.entries(products).forEach(([id,title])=>{
      for (const [name,key] of [['satış','price'],['malzeme','ingredients'],['ambalaj','box'],['üretim maliyeti','cost'],['katkı','contribution']]) {
        unitRows.push([title+' · '+name,...groups.map(c=>moneyExact(columns[c].products[id][key]))]);
      }
    });
    const costs=[['Günlük satış (adet)','daily',integer],['Ciro','revenue',asMoney],
      ['Malzeme ve ambalaj','ingredients',asMoney],['Kanal ve bayilik kesintileri','fees',asMoney],
      ['Sabit giderler','fixed',asMoney],['Ödenecek KDV','tax',asMoney],
      ['İçecek katkısı','drinks',asMoney],['Diğer yan ürün katkısı','sides',asMoney],
      ['Faaliyet kârı','profit',asMoney],['Başabaş (ürün/gün)','breakEven',n=>n==null?'—':decimal.format(n)]];
    const totals=costs.map(([name,key,fmt])=>[name,...groups.map(c=>fmt(columns[c][key]))]);
    document.getElementById('m-tables').replaceChildren(table('Ürün başına ekonomi',heads,unitRows),
      table('Bir aylık işletme hesabı',heads,totals),
      table('Personelli dükkânda satış senaryoları',['Günlük ürün','Pide / gün','Lahmacun / gün','Aylık faaliyet kârı'],
        report.scenarios.map(s=>[integer(s.daily),integer(s.pide),integer(s.lahmacun),asMoney(s.profit)])));
  }
  let inflight=null, lastCheck=0, accountReport=false;
  function published(force=false) {
    if(inflight||(!force&&Date.now()-lastCheck<45000)) return inflight;
    lastCheck=Date.now();
    inflight=(async()=>{
      try {
        const response=await fetch(sourceUrl,{mode:'cors',credentials:'omit',cache:'no-cache',signal:AbortSignal.timeout(12000)});
        if(!response.ok) throw Error();
        window.PinCost.readPublished(await response.text());
        if(!accountReport) {
          display(window.PinCost.summary());
          showStatus('Ana maliyet hesabının yayımlanmış varsayımları. Rakip fiyatları tablodaki karşılaştırma değerleridir.');
        }
      } catch {
        if(!accountReport) showStatus('Ana hesaba şu anda ulaşılamıyor. Son yayımlanan varsayımlar gösteriliyor.');
      } finally {inflight=null;}
    })();
    return inflight;
  }
  function showStatus(text) {
    areaStatus.textContent=text;
    const note=document.getElementById('f-kaynak');
    if(note) note.textContent=accountReport?'Kaydedilmiş maliyet hesabı':'Maliyet tablosunun yayımlanmış varsayımları';
  }
  display(window.PinCost.summary());
  showStatus('Maliyet tablosunun yayımlanmış varsayımları.');
  published(true);
  const sourceButton=document.getElementById('m-asli-ac'), sourceSlot=document.getElementById('m-asli');
  function closeSource() {
    sourceSlot.replaceChildren();sourceSlot.hidden=true;
    sourceButton.textContent='Asıl tabloyu burada aç';sourceButton.setAttribute('aria-expanded','false');
  }
  sourceButton.addEventListener('click',()=>{
    if(!sourceSlot.hidden) closeSource();
    else {
      // Opening the original is an explicit user action. Its own account and sharing rules apply.
      const frame=document.createElement('iframe');
      frame.title='AUTOKITCH ana sitesindeki asıl maliyet hesabı';frame.src=sourceUrl+'#hesap';
      frame.referrerPolicy='strict-origin-when-cross-origin';
      sourceSlot.append(frame);sourceSlot.hidden=false;
      sourceButton.textContent='Asıl tabloyu kapat';sourceButton.setAttribute('aria-expanded','true');
    }
    requestAnimationFrame(()=>window.ScrollTrigger?.refresh());
  });
  area.addEventListener('toggle',()=>{
    if(area.open) published(true);
    else if(!sourceSlot.hidden) closeSource();
    requestAnimationFrame(()=>window.ScrollTrigger?.refresh());
  });
  window.addEventListener('focus',()=>published());
  document.addEventListener('visibilitychange',()=>{ if(!document.hidden) published(); });
  let showingFinance=false;
  const watch=new IntersectionObserver(entries=>{showingFinance=entries[0].isIntersecting;if(showingFinance&&!accountReport) published();});
  watch.observe(document.getElementById('fiyat'));
  setInterval(()=>{if(showingFinance&&!document.hidden&&!accountReport) published();},60000);
  // ScrollTrigger inserts the pinned first act after the browser's initial anchor jump.
  // Position a direct link after those heights and the web fonts have settled.
  let anchorRequest=0;
  const nextFrame=()=>new Promise(resolve=>requestAnimationFrame(resolve));
  async function positionAnchor() {
    const hash=location.hash;
    if(!['#kapak','#fiyat','#maliyet','#yatirim','#tedarik'].includes(hash)) return;
    const request=++anchorRequest, target=document.querySelector(hash);
    if(hash==='#maliyet') area.open=true;
    if(document.readyState!=='complete') await new Promise(resolve=>window.addEventListener('load',resolve,{once:true}));
    await document.fonts?.ready;
    await new Promise(resolve=>setTimeout(resolve,380));
    if(request!==anchorRequest||hash!==location.hash) return;
    window.ScrollTrigger?.refresh();
    await nextFrame();await nextFrame();
    if(request!==anchorRequest||hash!==location.hash) return;
    const top=hash==='#kapak'?0:scrollY+target.getBoundingClientRect().top-(hash==='#maliyet'?72:0);
    window.scrollTo({top,behavior:'instant'});
  }
  for(const event of ['wheel','touchmove','keydown']) window.addEventListener(event,()=>{anchorRequest++;},{passive:true});
  positionAnchor();
  window.addEventListener('hashchange',positionAnchor);
  window.PinInvestorCost={setAccount(report,asOf){
    display(report);accountReport=true;
    const stamp=Number(asOf);
    showStatus('Kaydedilmiş maliyet hesabı'+(stamp>0?' · '+new Date(stamp).toLocaleString('tr-TR',{dateStyle:'short',timeStyle:'short'}):'')+'.');
    requestAnimationFrame(()=>window.ScrollTrigger?.refresh());
  },disconnect(){
    accountReport=false;
    display(window.PinCost.summary());showStatus('Maliyet tablosunun yayımlanmış varsayımları.');
    published(true);
  }};
})();
