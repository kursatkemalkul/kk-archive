(() => {
  // The main origin reuses its existing Google session in the background.
  // All editing takes place in the single calculator revealed below the summary.
  let reader=null,channel='',timer=0;
  const url=new URL('/autokitch/otonom/maliyet/sunum-okuma.html',location.origin);
  function connect(){
    if(reader)return;
    reader=document.createElement('iframe');reader.hidden=true;reader.title='Maliyet hesabı eşitlemesi';
    reader.addEventListener('load',()=>{
      channel=crypto.randomUUID();let count=0;
      const hello=()=>{
        if(count++>30){clearInterval(timer);return;}
        reader.contentWindow.postMessage({protocol:'autokitch-cost-v1',kind:'connect',channel},url.origin);
      };
      hello();timer=setInterval(hello,400);
    });
    reader.src=url.href;document.body.append(reader);
  }
  window.addEventListener('message',e=>{
    const m=e.data;
    if(!reader||e.source!==reader.contentWindow||e.origin!==url.origin||m?.channel!==channel||m.protocol!=='autokitch-cost-v1')return;
    if(m.kind==='connected')clearInterval(timer);
    if(m.kind==='report'&&m.report?.columns?.M)window.PinInvestorCost.setAccount(m.report);
  });
  if(sessionStorage.getItem('ak_main_ok')==='1')connect();
  else window.addEventListener('autokitch-unlocked',connect,{once:true});
})();
