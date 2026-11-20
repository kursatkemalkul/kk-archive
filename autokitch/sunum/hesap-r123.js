(() => {
  const area=document.getElementById('maliyet'), slot=document.getElementById('maliyet-tablosu');
  const number=new Intl.NumberFormat('tr-TR',{maximumFractionDigits:0});
  const money=n=>number.format(n)+' TL';
  const node=(tag,text)=>{const el=document.createElement(tag);if(text!==undefined)el.textContent=text;return el;};
  function display(report, source){
    const cols=report.columns,prices=[];
    for(const [key,title] of [['pide','Kaşarlı pide'],['lahmacun','Lahmacun']]){
      const row=node('div');row.className='f-urun';
      row.append(node('span',title),node('strong',money(cols.M.products[key].price)),
        node('small','Usta Pideci '+money(cols.D.products[key].price)+' · Mahalle '+money(cols.P.products[key].price)));
      prices.push(row);
    }
    document.getElementById('f-urunler').replaceChildren(...prices);
    document.getElementById('f-senaryolar').replaceChildren(...report.scenarios.map(s=>{
      const row=node('div');row.className='f-senaryo';
      row.append(node('span','Günde '+s.daily+' ürün'),node('strong',money(s.profit)));return row;
    }));
    document.querySelector('[data-cost="current-profit"]').textContent=money(cols.M.profit);
    for(const group of ['P','M','S']){
      document.querySelector('[data-payroll="'+group+'-month"]').textContent=money(cols[group].payroll);
      document.querySelector('[data-payroll="'+group+'-year"]').textContent=money(cols[group].payroll*12);
    }
    document.getElementById('hesap-kaynak').textContent=source;
  }
  let frame=null;
  function showTable(){
    if(!area.open){slot.replaceChildren();frame=null;window.ScrollTrigger?.refresh();return;}
    if(frame)return;
    frame=node('iframe');frame.title='Maliyet hesabı';
    frame.src='/autokitch/otonom/maliyet/?embed=1&v=125';
    slot.append(frame);
  }
  area.addEventListener('toggle',showTable);
  window.addEventListener('message',e=>{
    if(e.origin!==location.origin||!frame||e.source!==frame.contentWindow||e.data?.protocol!=='autokitch-table-v1')return;
    if(e.data.kind==='size'&&Number.isFinite(e.data.height)){
      const height=Math.max(360,Math.min(20000,e.data.height));
      if(Math.abs(frame.getBoundingClientRect().height-height)>2){frame.style.height=height+'px';window.ScrollTrigger?.refresh();}
    }
    if(e.data.kind==='report'&&e.data.report?.columns?.M)display(e.data.report,'Açık maliyet hesabındaki rakamlar');
  });
  window.PinInvestorCost={setAccount:report=>display(report,'Kaydedilmiş maliyet hesabındaki rakamlar')};
  const keys=['ak_hesap_v4','ak_flags_v1','ak_yatirim_v2'];
  function showSavedOnDevice(){
    try {
      const data=Object.fromEntries(keys.map(key=>[key,localStorage.getItem(key)]));
      const models=JSON.parse(data.ak_hesap_v4);
      if(models?.M && models?.S && models?.P && models?.D){
        display(window.PinCost.summary(data),'Bu cihazda kaydedilmiş maliyet hesabı');
        return;
      }
    } catch {}
    display(window.PinCost.summary(),'Maliyet hesabının varsayılan senaryosu');
  }
  showSavedOnDevice();
  async function anchor(){
    const hash=location.hash;if(!['#kapak','#fiyat','#maliyet','#yatirim','#tedarik'].includes(hash))return;
    if(hash==='#maliyet' && !document.getElementById('site-giris')){area.open=true;showTable();}
    if(document.readyState!=='complete')await new Promise(resolve=>window.addEventListener('load',resolve,{once:true}));
    await document.fonts?.ready;await new Promise(resolve=>setTimeout(resolve,400));
    window.ScrollTrigger?.refresh();
    if(hash!==location.hash)return;
    window.scrollTo({top:hash==='#kapak'?0:scrollY+document.querySelector(hash).getBoundingClientRect().top-(hash==='#maliyet'?72:0),behavior:'instant'});
  }
  anchor();window.addEventListener('hashchange',anchor);
  window.addEventListener('autokitch-unlocked',anchor,{once:true});
})();
