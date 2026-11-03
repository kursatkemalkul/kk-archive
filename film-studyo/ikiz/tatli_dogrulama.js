// Recorded measured frames from production MAIN; this viewer sends no machine command.
export function tatliDogrulamaKur(IKIZ) {
  const host=document.getElementById('copDenemeMenu'); if(!host)return;
  const panel=document.createElement('section');panel.className='tatliDogrulama';
  panel.innerHTML='<b>Tatlı · PLC doğrulaması</b><p>1 çekmece, 54 tatlı kutusu ve 12 QR gözü. Aynı PLC ile alınmış hareket kayıtları.</p><label>Kayıt <select id="tatliKayitSec" aria-label="Tatlı doğrulama kaydı"></select></label><button id="tatliKayitIzle" disabled>Kaydı izle</button><button id="tatliKayitTum" disabled>54 kaydı sırayla izle</button><p id="tatliKayitDurum" role="status">Doğrulama kayıtları yükleniyor…</p><small>FIFO testlerinde önceki yuvalar tüketilmiş durumdadır. Kapasite 54 kutudur. CANLI düğmesiyle çalışan makineye dön.</small>';
  const body=host.querySelector('.copDenemeIcerik');if(!body)return;
  body.style.maxHeight='70vh';body.style.overflowY='auto';
  panel.style.borderBottom='1px solid var(--cz)';panel.style.paddingBottom='14px';panel.style.marginBottom='14px';body.prepend(panel);
  const select=panel.querySelector('select'),play=panel.querySelector('#tatliKayitIzle'),all=panel.querySelector('#tatliKayitTum'),status=panel.querySelector('[role=status]');
  const moments=document.createElement('div');moments.innerHTML='<button id="tatliKavramaAni" disabled>Kavrama anı</button><button id="tatliBirakmaAni" disabled>QR’ye bırakma</button>';status.before(moments);
  const grip=moments.querySelector('#tatliKavramaAni'),drop=moments.querySelector('#tatliBirakmaAni');
  const base=new URL('./models/tatli54-dogrulama/',import.meta.url);let cases=[],generation=0,loaded=null,expectedHash=null;
  function camera(p,qr=false){
    const s=IKIZ.sahne;if(!s||!p)return;IKIZ.gezintiCik?.();IKIZ.zamanBakisiniKoru?.();IKIZ.bakisAd='tatli-dogrulama';IKIZ.orbitEkranlar=false;
    let eye=[p[0]+.65,p[1]+.5,1.10];
    if(qr){
      const T=s.THREE,target=new T.Vector3(...p),ray=new T.Raycaster();let best=Infinity;s.scene.updateMatrixWorld(true);
      for(const [dx,dy,z]of [[0,.08,1.15],[0,-.015,1.15],[-.05,.08,1.15],[.20,.08,1.15],[0,.35,1.35]]){
        const e=new T.Vector3(p[0]+dx,p[1]+dy,z),v=target.clone().sub(e);ray.set(e,v.clone().normalize());ray.near=.02;ray.far=Math.max(.02,v.length()-.055);
        const blockers=new Set();
        for(const h of ray.intersectObjects(s.scene.children,true)){
          let visible=true;for(let o=h.object;o;o=o.parent)if(!o.visible)visible=false;
          const mat=Array.isArray(h.object.material)?h.object.material[h.face?.materialIndex||0]:h.object.material;
          if(visible&&mat?.visible!==false&&(mat?.opacity??1)>.4)blockers.add(h.object.uuid);
        }
        if(blockers.size<best){best=blockers.size;eye=e.toArray();}if(!best)break;
      }
    }
    s.kamera.position.set(...eye);s.kontrol.target.set(...p);s.kontrol.update();
  }
  grip.onclick=async()=>{if(!loaded)return;const g=loaded.result.grasp,p=g.pose.urun_poz.p;const f=loaded.frames.find(f=>f.t>=g.t&&f.robot_poz?.tasinan==='Dessert'&&f.robot_poz.urun_poz?.p?.[1]>=p[1]+.075);IKIZ.zaman.duraklat();await IKIZ.zaman.git(f?.t??g.t);camera(f?.robot_poz.urun_poz.p??p);};
  drop.onclick=async()=>{if(!loaded)return;const f=loaded.frames.find(f=>f.urunler?.some(u=>u.tur==='TATLI'&&u.yer==='QR'+loaded.result.qr));const u=f?.urunler.find(u=>u.tur==='TATLI'&&u.yer==='QR'+loaded.result.qr);if(!u)return;IKIZ.zaman.duraklat();await IKIZ.zaman.git(f.t);camera(u.robot_poz?.p,true);};
  async function open(index,sequence,token){
    if(!IKIZ.zaman?.kayitAc){status.textContent='Önce 3D modelin yüklenmesini bekleyin.';return;}
    const c=cases[index];if(!c||token!==generation)return;
    play.disabled=all.disabled=true;status.textContent=`Yuva ${c.slot} → QR ${c.qr} kaydı yükleniyor…`;
    try {
      const r=await fetch(new URL(c.record,base));if(!r.ok)throw new Error(`HTTP ${r.status}`);
      const bytes=await r.arrayBuffer();
      const text=await new Response(new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'))).text();
      const data=JSON.parse(text);
      if(token!==generation)return;
      if(data.kind!=='PLC_DOGRULAMA_KAYDI'||!data.result?.passed||data.result.controller?.engine!=='COMPILED_ST'||data.result.controller.source_hash!==expectedHash||data.result.capacity!==54||data.result.slot!==c.slot||data.result.qr!==c.qr)throw new Error('Doğrulanmış PLC kaydı değil');
      loaded=data;grip.disabled=drop.disabled=false;camera(data.result.grasp.pose.urun_poz.p);
      select.value=String(index);status.textContent=`✓ Yuva ${c.slot} → QR ${c.qr} · PLC kaydı · kavrama ve bırakma geçti`;
      await IKIZ.zaman.kayitAc(data.frames,data.title,{oynat:true,onEnd:sequence&&index+1<cases.length?()=>open(index+1,true,token):null});
    }catch(e){if(token===generation)status.textContent='Kayıt açılamadı: '+e.message;}
    finally{if(token===generation)play.disabled=all.disabled=false;}
  }
  play.onclick=()=>open(+select.value,false,++generation);
  all.onclick=()=>open(0,true,++generation);
  fetch(new URL('index.json',base)).then(r=>{if(!r.ok)throw new Error(r.status);return r.json();}).then(j=>{
    cases=j.records;expectedHash=j.controller?.source_hash;if(j.capacity!==54||!/^([a-f0-9]{64})$/.test(expectedHash||'')||!Array.isArray(cases)||cases.length!==54||cases.some(c=>!c.passed||!Number.isInteger(c.slot)||c.slot<1||c.slot>54||!Number.isInteger(c.qr)||c.qr<1||c.qr>12||!/^yuva-\d{2}-qr-\d{2}\.json\.gz$/.test(c.record))||new Set(cases.map(c=>c.slot)).size!==54||new Set(cases.map(c=>c.qr)).size!==12)throw new Error('54 kayıt tamamlanmamış');
    select.innerHTML=cases.map((c,i)=>`<option value="${i}">✓ Yuva ${c.slot} → QR ${c.qr}</option>`).join('');
    play.disabled=all.disabled=false;status.textContent='✓ 54/54 yuva · 12/12 QR · 648 yuva–QR bağlantısı doğrulandı';
  }).catch(()=>{status.textContent='Doğrulama kayıtları henüz yüklenemedi. Sayfayı yenileyin.';});
}
