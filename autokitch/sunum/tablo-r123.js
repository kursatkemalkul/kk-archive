(() => {
  if(new URLSearchParams(location.search).get('embed')!=='1'||parent===window)return;
  const origin=location.origin,protocol='autokitch-table-v1';
  let previous='',height=0,scheduled=false;
  function update(){
    scheduled=false;
    const locked=!!document.getElementById('gate');
    const next=locked?360:Math.ceil(document.getElementById('hesap').getBoundingClientRect().bottom+scrollY+12);
    if(next!==height){height=next;parent.postMessage({protocol,kind:'size',height},origin);}
    if(locked||!window.PinCost||!window.hread)return;
    const models=Object.fromEntries(['M','S','D','P'].map(c=>[c,hread(c)]));
    const record={ak_hesap_v4:JSON.stringify(models),ak_flags_v1:JSON.stringify(AKFL)};
    const current=JSON.stringify(record);
    if(current===previous)return;
    previous=current;parent.postMessage({protocol,kind:'report',report:window.PinCost.summary({data:record})},origin);
  }
  const schedule=()=>{if(!scheduled){scheduled=true;requestAnimationFrame(update);}};
  new ResizeObserver(schedule).observe(document.body);
  new MutationObserver(schedule).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['hidden','class','style']});
  document.addEventListener('input',schedule);
  document.addEventListener('change',schedule);
  setInterval(schedule,800);schedule();
})();
