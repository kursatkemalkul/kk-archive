/* E kartonu: katlama tablası ve mafsallar gerçek program eksenlerini izler.
 * Toplam çevrim saatini doğrusal ölçeklemek ara adımlarda eksenlerle ayrışır.
 * Kırımların katalog/model tabloları korunur; bitmiş kıvrımlar geri açılmaz. */
export function eKartonKur({ THREE:T, kok, E, IKIZ }) {
  if (!E.blank) return () => {};
  const D=Object.fromEntries(E.blank.dugumler.map(j=>[j.ad,j]));
  const root=kok.getObjectByName(E.blank.kok), nodes=[E.blank.kok,...Object.keys(D)].map(n=>{
    const o=kok.getObjectByName(n); if(!o)return null;o.updateWorldMatrix(true,false);
    const chain=[];let j=D[n];while(j){chain.unshift(j);j=D[j.ebeveyn];}
    return {n,o,W:o.matrixWorld.clone(),chain};
  }).filter(Boolean).sort((a,b)=>a.chain.length-b.chain.length);
  const vacNames=new Set((E.cikis.DO_E_Z_SILINDIR?.katkilar||[]).flatMap(k=>k.dugumler||[]));
  const vac=[...vacNames].map(n=>{const o=kok.getObjectByName(n);if(!o)return null;o.updateWorldMatrix(true,false);return {o,W:o.matrixWorld.clone()};}).filter(Boolean);
  const table=(q,x)=>{
    const a=q.tablo;if(!a?.length)return q.aci[0];
    // Kapak son bölümde kol0 iken serbest kapanır: aynı eksen değerindeki
    // terminal kayıtlar için tamamlanmış uç açıyı seç, ilk0 kaydında kalma.
    if(Math.abs(x-a.at(-1)[0])<1e-6)return a.at(-1)[1];
    for(let i=1;i<a.length;i++){const [x0,y0]=a[i-1],[x1,y1]=a[i];if((x-x0)*(x-x1)<=0)return x1===x0?y1:y0+(y1-y0)*(x-x0)/(x1-x0);}
    return Math.abs(x-a[0][0])<Math.abs(x-a.at(-1)[0])?a[0][1]:a.at(-1)[1];
  };
  const end=j=>j.parcalar.at(-1).aci[1], m=new T.Matrix4(),r=new T.Matrix4(),tr=new T.Matrix4(),ip=new T.Matrix4();
  // CAD v13 _ray_uzeri: gerçek kalıp köşesine teğet 1,6 mm karton.
  // Seyrek açı tablosunu doğrusal bağlamak ilk 2–4 mm'de kartonu raya gömer.
  const smooth=(lo,hi,x)=>{const t=Math.max(0,Math.min(1,(x-lo)/(hi-lo)));return t*t*(3-2*t);};
  const rayAngle=(u,height)=>{
    const dy=height-(983.2-u), d=2.1, rr=Math.hypot(dy,d);
    return Math.max(0,Math.min(90,(Math.atan2(dy,d)+Math.asin(1.6/rr))*180/Math.PI));
  };
  return f=>{
    const fb=f.fb?.E, ax=f.eksenler||{}, stage=fb?.adim, rawI=stage===30?fb?.kapat_i:fb?.katla_i;
    // Programın yeni9 adımı köşe takımını indirirken karton ilk katlama
    // pozunda kalır. Sonraki adımlar mevcut CAD kırımlarına bir indeks geri bağlanır.
    const i=stage===10&&rawI>=9?(rawI===9?8:rawI>=20?rawI-2:rawI-1):rawI;
    const sx=f.silindirler?.SX_E_VAC_Z;
    if(sx!=null)for(const b of vac){
      m.makeTranslation(0,-sx*.001,(ax.AX_E_BESLEYICI||0)*.001).multiply(b.W);m.elements[12]+=IKIZ.stationOffsets56?.E||0;b.o.parent.updateWorldMatrix(true,false);tr.copy(b.o.parent.matrixWorld).invert().multiply(m);tr.decompose(b.o.position,b.o.quaternion,b.o.scale);b.o.updateMatrixWorld(true);
    }
    if(!root?.visible||f.e_kutu_t==null||((stage===10||stage===30)&&i==null)||!(stage===10||stage===20||stage===30||stage===40))return;
    const besleme=stage===10&&i<7;
    const done=stage!==10, a={};
    const panelAcilar=(f.urunler||[]).find(u=>u.tur==='E_KUTU')?.acilar;
    for(const j of Object.values(D)){
      const n=j.ad.slice(10),q=j.parcalar;
      // Program gerçek eksen/temas durumundan panel açılarını zaten hesaplar.
      // Aynı pozun ikinci bir adım tablosuyla hesaplanması, özellikle flap geri
      // dönerken ve kapak kolu hareket ederken kartonu bitiş açısına sıçratıyordu.
      const olculen=panelAcilar?.[j.ad.slice('E_KUTU__'.length)];
      if(Number.isFinite(olculen)){a[j.ad]=olculen;continue;}
      if(besleme){a[j.ad]=0;continue;}
      if(n==='SWM'||n==='SWP')a[j.ad]=done||i>12?end(j):(n==='SWM'?1:-1)*Math.max(rayAngle(ax.AX_E_DESTEK||0,981.5),90*smooth(41.6,45.6,ax.AX_E_DESTEK||0));
      else if(n==='BW')a[j.ad]=done||i>12?end(j):(ax.AX_E_DESTEK||0)>=44?90:Math.asin(Math.max(0,ax.AX_E_DESTEK||0)/44)*180/Math.PI;
      else if(n==='FO')a[j.ad]=done||i>12?end(j):i<12?0:-Math.max(rayAngle(ax.AX_E_DESTEK||0,961.5),90*smooth(32,45.6,ax.AX_E_DESTEK||0));
      else if(n.startsWith('CT'))a[j.ad]=done||i>9?end(j):i<9?0:table(q[0],Math.max(0,ax[({CTMF:'AX_E_KOSE_SOL_ARKA',CTMB:'AX_E_KOSE_SAG_ARKA',CTPF:'AX_E_KOSE_SOL_ON',CTPB:'AX_E_KOSE_SAG_ON'})[n]]||0));
      else if(n==='FI')a[j.ad]=done||i>15?end(j):i<15?0:table(q[0],-(ax.AX_E_PARMAK+90));
      else if(n==='LID'){
        if(stage===40)a[j.ad]=90;
        // Alt kol yatırır; tesisin yerçekimi/üst kafa temas açısı uygulanır.
        // Üst kafanın gerçek baskısı tamamlanmadan kapalı bayrağı verilmez.
        else if(stage===30){const kutu=(f.urunler||[]).find(x=>x.tur==='E_KUTU');a[j.ad]=kutu?.acilar?.B_LID??(i===0?table(q[3],ax.AX_E_KOL):90);}
        else if(done||i===19)a[j.ad]=table(q[2],ax.AX_E_KOL);
        else a[j.ad]=-(a.E_KUTU__B_BW||0);
      }else a[j.ad]=done||i>18?end(j):i<18?0:table(q[0],ax.AX_E_FLAP);
    }
    const dy=besleme?((f.cikislar?.DO_E_VAKUM?20-(sx||0):0)*.001):-(ax.AX_E_DESTEK||0)*.001;
    const dz=besleme&&i<=5?(ax.AX_E_BESLEYICI||0)*.001:.411;
    for(const b of nodes){
      m.makeTranslation(0,dy,dz);
      for(const j of b.chain){const p=j.pivot_dunya_m,u=new T.Vector3().fromArray(j.eksen_dunya).normalize();tr.makeTranslation(...p);ip.makeTranslation(...p.map(v=>-v));r.makeRotationAxis(u,T.MathUtils.degToRad(a[j.ad]||0));m.multiply(tr).multiply(r).multiply(ip);}
      m.multiply(b.W);m.elements[12]+=IKIZ.stationOffsets56?.E||0;b.o.parent.updateWorldMatrix(true,false);tr.copy(b.o.parent.matrixWorld).invert().multiply(m);tr.decompose(b.o.position,b.o.quaternion,b.o.scale);b.o.updateMatrixWorld(true);
    }
    IKIZ.eKartonEksen={adim:stage,i,dy,aci:a};
  };
}
