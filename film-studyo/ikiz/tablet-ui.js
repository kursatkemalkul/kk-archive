// Layout only. Never reset or command the PLC when a viewport changes.
function tabletDuzeniKur() {
  const media=matchMedia('(max-width:1400px), (any-pointer:coarse)');
  function height(){
    const h=Math.min(innerHeight,window.visualViewport?.height||innerHeight);
    if(h>0)document.documentElement.style.setProperty('--twin-view-height',Math.floor(h)+'px');
  }
  height();addEventListener('resize',height);window.visualViewport?.addEventListener('resize',height);
  if(media.matches){try{if(localStorage.getItem('ikiz.panel')!=='acik')document.body.classList.add('panelGizli');}catch{document.body.classList.add('panelGizli');}}
  const host=document.getElementById('yan'),panel=document.getElementById('panelBtn');
  if(!host||!panel)return;
  if(!document.getElementById('tabletPanelKapat')){
    const close=document.createElement('button');close.id='tabletPanelKapat';close.type='button';close.textContent='×';close.setAttribute('aria-label','Ekran panelini kapat');close.onclick=()=>panel.click();host.append(close);
  }
  function sync(){const hidden=document.body.classList.contains('panelGizli');panel.setAttribute('aria-expanded',String(!hidden));panel.setAttribute('aria-controls','yan');panel.textContent=hidden?'Ekranlar ⟨':'Ekranlar ⟩';}
  new MutationObserver(sync).observe(document.body,{attributes:true,attributeFilter:['class']});sync();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',tabletDuzeniKur,{once:true});else tabletDuzeniKur();
