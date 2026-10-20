/* AUTOKITCH · SONUÇ KARTI — oynatma sonuna gelince 3D görünümün üstünde çıkar (Kemal 20 Eyl 2026).
   Karşılaştırma ekranındaki kartın tek hat sayfaları için ortak sürümü: sim3d (robotlu) ve sim3d_bant_tabla (bantlı / tablalı).
   Kullanım: sonucCiz(hat, PLAN)  · hat: 'robot' | 'robot_tabla' | 'bant' | 'tabla'   ·  sonucTemizle() yeni plan kurulunca. */
(function(){
  const AD={robot:'ROBOTLU HAT v19 (arşiv)', robot_tabla:'ROBOTLU HAT + ATOSA TABLASI (arşiv)', bant:'B · BANTLI + KONVEYÖR', tabla:'A · ATOSA TABLALI + KONVEYÖR', goz:'C · ROBOT KOLLU'};
  const css=`#sonuc{position:fixed;left:16px;top:62px;width:min(520px,calc(100vw - 400px));max-height:calc(100vh - 150px);overflow:auto;background:rgba(11,14,19,.96);border:1px solid #39414f;border-radius:14px;padding:13px 15px 11px;display:none;box-shadow:0 18px 40px rgba(0,0,0,.55);z-index:6}
  #sonuc.ac{display:block} #sonuc h3{font-size:12px;letter-spacing:.1em;text-transform:uppercase;color:#8a94a4;font-weight:700;margin-bottom:9px}
  #sonuc .buyuk{font-size:30px;font-weight:800;color:#3ddc84;line-height:1.05} #sonuc .buyuk small{font-size:12px;font-weight:600;color:#8a94a4;letter-spacing:.02em}
  #sonuc table{width:100%;border-collapse:collapse;font-size:12px;margin-top:9px} #sonuc td{padding:3px 0;border-bottom:1px solid #1c212b;color:#c9ccd3}
  #sonuc td:last-child{text-align:right;color:#fff;font-variant-numeric:tabular-nums}
  #sonuc .kapat{position:absolute;right:9px;top:7px;color:#8a94a4;cursor:pointer;font-size:16px;line-height:1;padding:3px 7px;border-radius:7px} #sonuc .kapat:hover{background:#1c212b;color:#fff}
  #sonuc .dip{margin-top:8px;font-size:11.5px;color:#ffb648}`;
  const st=document.createElement('style'); st.textContent=css; document.head.appendChild(st);
  let el=null, kapali=0, kurulanSure=-1;
  function kutu(){ if(el) return el; el=document.createElement('div'); el.id='sonuc';
    document.body.appendChild(el); return el; }
  const ss=s=>{ s=Math.max(0,Math.round(s)); const h=Math.floor(s/3600)+17, m=Math.floor(s%3600/60), q=s%60; return String(h).padStart(2,'0')+':'+String(m).padStart(2,'0')+':'+String(q).padStart(2,'0'); };
  const dk=s=>s>=60?(s/60).toFixed(1)+' dk':Math.round(s)+' s';
  window.sonucTemizle=function(){ kurulanSure=-1; kapali=0; if(el){ el.innerHTML=''; el.classList.remove('ac'); } };
  window.sonucCiz=function(hat,ps,T){ if(window.PANELSIZ) return;   /* karşılaştırma ekranında kendi kartı var */
    if(!ps||!ps.kpi) return; const kpi=ps.kpi, bitti=T>=kpi.sure-0.5;
    const e=kutu(); if(!bitti){ e.classList.remove('ac'); kapali=0; return; }
    if(kurulanSure!==kpi.sure){ kurulanSure=kpi.sure; icerik(hat,ps); }
    e.classList.toggle('ac',!kapali); };
  function icerik(hat,ps){ const kpi=ps.kpi, e=kutu(), robotlu=(hat==='robot'||hat==='robot_tabla');
    const bit=ps.plan.filter(b=>b.bitis).map(b=>b.bitisT!==undefined?b.bitisT:b.t1), hh=[0,0,0,0]; bit.forEach(t=>hh[Math.min(3,Math.floor(t/3600))]++);
    const dolA=kpi.robotlar||kpi.robotDoluluk||[kpi.robot||0], N=kpi.N||1, dol=dolA.slice(0,N).map(x=>Math.round(x*100)).join(' / ');
    /* darboğaz ÖLÇÜMLE: en dolu kaynak yazılır */
    let fd=0, goz=4, td=0;
    if(robotlu){ goz=(kpi.gozSay&&kpi.gozSay.lahm)?3:3; let s=0; ps.plan.forEach(b=>{ if(b.firin) s+=b.firin[1]-b.firin[0]; }); fd=s/(goz*Math.max(1,kpi.sure)); }
    else { let s=0,t=0; (ps.P||[]).forEach(p=>{ const f=p.faz; if(f&&f.firin) s+=f.firin[1]-f.firin[0]; if(f&&f.don) t+=f.don[1]-p.td; }); fd=s/(4*Math.max(1,kpi.sure)); td=t/Math.max(1,kpi.sure); }
    const sc=kpi.sayac||{}, ray=(N>1&&(sc.rayBekleme||sc.rayBek))?(sc.rayBekleme||sc.rayBek)/Math.max(1,kpi.sure):0;
    const aday=[['ROBOT',Math.max(...dolA.slice(0,N))],['fırın',fd]]; if(N>1) aday.push(['ray paylaşımı (iki robot birbirini bekliyor)',ray]);
    if(hat==='tabla') aday.push(['tabla turu (Atosa 60 s)',td]);
    aday.sort((a,b)=>b[1]-a[1]);
    const firinMetin=robotlu?(goz+' kapaklı göz · pide 240 s · lahmacun 120 s'):'konveyör · aynı anda 4 ürün · tek hız 240 s · tavan 60 ürün/saat';
    const tasima=hat==='robot'?'robot (6 tepsi dolaşımda)':hat==='robot_tabla'?'tabla (pres→dozaj→fırın ucu) + robot':hat==='bant'?'bant + fırın bandı (tepsisiz)':'tabla arabası (tepsisiz)';
    const sat=[['Çıkan ürün · 1. / 2. / 3. saat','<b>'+hh[0]+' / '+hh[1]+' / '+hh[2]+'</b>'+(hh[3]?' <span style="color:#8a94a4">/ '+hh[3]+'</span>':'')],
      ['Sipariş listesi',kpi.siparis+' sipariş · '+kpi.urun+' ürün'],['Teslimi biten',kpi.teslim+' sipariş · '+bit.length+' ürün'],
      ['Ortalama bekleme','<b>'+dk(kpi.ort)+'</b>'],['En uzun bekleme',dk(kpi.max)],
      ['25 dk üstü bekleyen','<span style="color:'+(kpi.gec?'#ff5c5c':'#3ddc84')+'">'+kpi.gec+' sipariş</span>'],
      ['Robot doluluğu',(N>1?'SOL / SAĞ ':'')+'%'+dol],['Son teslim',ss(kpi.sure)],
      ['Fırın',firinMetin+' · %'+Math.round(fd*100)+' dolu'],['Ürün taşıma',tasima]];
    const notlar=[...new Set(kpi.not||[])].filter(x=>x.indexOf('SIKI')<0).slice(0,2);
    e.innerHTML='<span class="kapat" title="kapat">✕</span><h3>'+(AD[hat]||'HAT')+(N>1?' · 2 robot':'')+' · bitti</h3>'
      +'<div class="buyuk">'+(bit.length?Math.round(bit.length/Math.max(1,kpi.sure)*3600):0)+' <small>ürün / saat ortalama</small></div>'
      +'<table>'+sat.map(r=>'<tr><td>'+r[0]+'</td><td>'+r[1]+'</td></tr>').join('')+'</table>'
      +'<div class="dip">darboğaz: '+aday[0][0]+' (%'+Math.round(aday[0][1]*100)+' dolu) · fırın %'+Math.round(fd*100)+(notlar.length?'<br>'+notlar.join(' · '):'')+'</div>';
    e.querySelector('.kapat').addEventListener('click',()=>{ kapali=1; e.classList.remove('ac'); }); }
})();
