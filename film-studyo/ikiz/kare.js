// Yalnız iki ölçülmüş kare arasında görüntü örnekler. PLC'yi ilerletmez,
// geleceğe kestirim yapmaz; ürün kimliği/yeri ve dijital çıkışlar karıştırılmaz.
const lerp=(a,b,p)=>a+(b-a)*p;
function sayilar(a,b,p,aci=false) {
  const out={...a};
  for(const k of Object.keys(a||{})) if(Number.isFinite(a[k])&&Number.isFinite(b?.[k])) {
    const d=aci&&k==='AX_TOP_TABLA'?((b[k]-a[k]+540)%360)-180:b[k]-a[k];
    out[k]=a[k]+d*p;
  }
  return out;
}
function urun(a,b,p) {
  if(!b||a.id!==b.id||(a.yer!==b.yer&&!(Number.isFinite(a.x_mm)&&Number.isFinite(b.x_mm)))||a.tur!==b.tur)return a;
  const out={...a};
  for(const k of ['ilerleme','ilerleme_mm','bant_mm','spreylendi_mm','taban_mm','x_mm','egim_deg'])
    if(Number.isFinite(a[k])&&Number.isFinite(b[k]))out[k]=lerp(a[k],b[k],p);
  if(a.tur==='E_KUTU'&&a.acilar&&b.acilar)out.acilar=sayilar(a.acilar,b.acilar,p);
  if(a.icerik)out.icerik=a.icerik.map(u=>urun(u,b.icerik?.find(v=>v.id===u.id),p));
  return out;
}
export function kareArasi(a,b,t) {
  if(!b||a.oturum!==b.oturum||a.dunya!==b.dunya||b.t<=a.t||t<=a.t)return a;
  if(t>=b.t)return b;
  const p=(t-a.t)/(b.t-a.t), f={...a,t};
  if(Object.hasOwn(a,'robot_poz'))f.robot_poz=robotArasi(a.robot_poz,b.robot_poz,t);
  for(const k of ['eksenler','silindirler','analog','akan_g','hareket_degerleri27'])f[k]=sayilar(a[k],b[k],p,k==='eksenler');
  // Raw native PLC recordings have DC drawer positions, not AX_B aliases.
  // Interpolate only measured travel; inventory/limits/state stay discrete.
  if(a.cekmeceler){f.cekmeceler={...a.cekmeceler};for(const[id,c]of Object.entries(a.cekmeceler)){
    const n=b.cekmeceler?.[id];if(Number.isFinite(c.konum)&&Number.isFinite(n?.konum))
      f.cekmeceler[id]={...c,konum:lerp(c.konum,n.konum,p)};
  }}
  if(Number.isFinite(a.robot_dil_mm)&&Number.isFinite(b.robot_dil_mm))f.robot_dil_mm=lerp(a.robot_dil_mm,b.robot_dil_mm,p);
  if(Number.isFinite(a.tabla_donus_deg)&&Number.isFinite(b.tabla_donus_deg))f.tabla_donus_deg=lerp(a.tabla_donus_deg,b.tabla_donus_deg,p);
  const ayniKutuCevrimi=!(Number.isFinite(a.e_kutu_t)&&Number.isFinite(b.e_kutu_t)&&b.e_kutu_t<a.e_kutu_t);
  if(ayniKutuCevrimi&&Number.isFinite(a.e_kutu_t)&&Number.isFinite(b.e_kutu_t))f.e_kutu_t=lerp(a.e_kutu_t,b.e_kutu_t,p);
  const next=(b.urunler||[]).flatMap(u=>[u,...(u.tur==='E_KUTU'?u.icerik||[]:[])]);
  f.urunler=(a.urunler||[]).map(u=>u.tur==='E_KUTU'&&!ayniKutuCevrimi?u:urun(u,next.find(v=>v.id===u.id&&v.tur===u.tur),p));
  if(a.k_kesme&&b.k_kesme)f.k_kesme={...a.k_kesme,sprey_s:lerp(a.k_kesme.sprey_s,b.k_kesme.sprey_s,p)};
  if(a.acici&&b.acici)f.acici={...a.acici,head_offset_mm:lerp(a.acici.head_offset_mm,b.acici.head_offset_mm,p)};
  return f;
}
export function robotArasi(a,b,t) {
  if(!a)return null;
  if(!b||b.t<=a.t||t<=a.t)return {...a,t};
  if(t>=b.t)return {...b,t};
  const p=(t-a.t)/(b.t-a.t), r={...a,t};
  if(a.eklem&&b.eklem)r.eklem=a.eklem.map((v,i)=>lerp(v,b.eklem[i],p));
  if(a.tcp&&b.tcp)r.tcp=a.tcp.map((v,i)=>lerp(v,b.tcp[i],p));
  if(Number.isFinite(a.ray_m)&&Number.isFinite(b.ray_m))r.ray_m=lerp(a.ray_m,b.ray_m,p);
  for(const k of ['jaw_derece','gripper','kapanma','gap_mm'])if(Number.isFinite(a[k])&&Number.isFinite(b[k]))r[k]=lerp(a[k],b[k],p);
  // _ara: iki ölçülmüş kare arasındaki en büyük eklem / ray adımı. Eklem ara değeri ucu yayda, ürün ara değeri kirişte
  // götürür; ikiz ürünü yalnız ölçülmüş (ya da adımı çok küçük) karede tutucuya kilitler, ara karede kilitle çizer.
  const adim=Math.max(a.eklem&&b.eklem?Math.max(...a.eklem.map((v,i)=>Math.abs(b.eklem[i]-v))):0,
    Number.isFinite(a.ray_m)&&Number.isFinite(b.ray_m)?Math.abs(b.ray_m-a.ray_m):0);
  if(a.urun_poz?.p&&b.urun_poz?.p&&a.urun_poz.tur===b.urun_poz.tur){
    r.urun_poz={...a.urun_poz,p:a.urun_poz.p.map((v,i)=>lerp(v,b.urun_poz.p[i],p)),_ara:adim};
    if(a.urun_poz.q&&b.urun_poz.q)r.urun_poz.q=quatArasi(a.urun_poz.q,b.urun_poz.q,p);
  } else if(a.urun_poz)r.urun_poz={...a.urun_poz,_ara:adim};
  return r;
}
function quatArasi(a,b,p){
 let d=a.reduce((s,v,i)=>s+v*b[i],0);if(d<0){b=b.map(v=>-v);d=-d;}
 let x=1-p,y=p;if(d<.9995){const t=Math.acos(Math.min(1,d)),s=Math.sin(t);x=Math.sin((1-p)*t)/s;y=Math.sin(p*t)/s;}
 const q=a.map((v,i)=>v*x+b[i]*y),n=Math.hypot(...q);return n>0?q.map(v=>v/n):a;
}
// Presentation time follows the selected PLC rate, never packet arrival speed.
// Network bursts must not accelerate robot/station motion to catch up.
export function canliKareKur({uygula,gecmiste}) {
  const BUFFER_MS=120,MAX_FRAMES=128;
  let q=[],r=[],world=null,shown=null,clock=null,lastWall=null,readyWall=null,newest=null,overflow=false,resync=0;
  function clear(){q=[];r=[];world=null;shown=null;clock=null;lastWall=null;readyWall=null;newest=null;overflow=false;}
  // Thin buffered samples without moving the display clock or skipping
  // drawer turning points, robot steps and product handovers.
  const stage=f=>JSON.stringify([f.robot?.gorev,f.robot?.adim,
    (f.urunler||[]).map(u=>[u.id,u.yer])]);
  function compact(){
    const keys=q.map(x=>stage(x.f));
    const keep=q.filter((x,i)=>{
      if(i<2||i===q.length-1||i%2===0)return true;
      if(keys[i]!==keys[i-1]||keys[i]!==keys[i+1])return true;
      for(const[id,d]of Object.entries(x.f.cekmeceler||{})){
        const a=q[i-1].f.cekmeceler?.[id]?.konum,b=d.konum,c=q[i+1].f.cekmeceler?.[id]?.konum;
        if(Number.isFinite(a)&&Number.isFinite(b)&&Number.isFinite(c)&&
          ((b>a&&b>=c)||(b<a&&b<=c)))return true;
      }
      return false;
    });
    if(keep.length===q.length)keep.splice(2,1);
    q=keep;
  }
  function index(t){let i=0;while(i+1<q.length&&q[i+1].f.t<=t+1e-9)i++;return i;}
  return {
    kaydet(f){
      const w=`${f.oturum}:${f.dunya}`;
      if(w!==world||(newest&&f.t<newest.f.t-1e-9)){clear();world=w;}
      newest={f,wall:performance.now()};
      if(overflow)return;
      if(q.at(-1)?.f.t===f.t){q[q.length-1].f=f;return;}
      if(q.length>=MAX_FRAMES)compact();
      // Idle PLC frames keep the same time. Refill on the first moving frame
      // after idle/underrun, rather than consuming every new packet instantly.
      if(clock!=null&&q.length&&clock>=q.at(-1).f.t-1e-9)readyWall=newest.wall+BUFFER_MS;
      q.push(newest);
      if(readyWall==null)readyWall=newest.wall+BUFFER_MS;
    },
    robotKaydet(f){r.push(f);if(r.length>48)r.shift();},
    tik(){
      const now=performance.now();
      if(gecmiste()||!q.length){lastWall=now;return;}
      if(overflow){lastWall=now;return;}
      if(clock==null)clock=q[0].f.t;
      let elapsed=lastWall==null?0:Math.min(.1,Math.max(0,(now-lastWall)/1000));lastWall=now;
      if(now<readyWall)elapsed=0;
      // Integrate the source speed on its own timeline. Even after a stall,
      // progress is bounded by wall time; future/unreceived poses are not used.
      let i=index(clock);
      while(elapsed>1e-9&&i+1<q.length){
        const a=q[i].f,b=q[i+1].f,rate=Number.isFinite(a.hiz)&&a.hiz>0?a.hiz:1;
        const step=Math.min(elapsed,Math.max(0,b.t-clock)/rate);
        clock=Math.min(b.t,clock+step*rate);elapsed-=step;
        if(clock>=b.t-1e-9){clock=b.t;i++;}else break;
      }
      const a=q[i],b=q[i+1],f=b?kareArasi(a.f,b.f,clock):a.f;
      let ri=-1;for(let j=0;j<r.length;j++)if(r[j].t<=clock+.00001)ri=j;
      // Kemal 2 Kas (#5): ×1 üstü hızlarda beyin robot duruşunu sim zamanı sıklığında ayrıca yollar (ikiz/robot, sik:true).
      // Saati iki yanından saran ölçülmüş robot karesi varsa o kullanılır; yoksa 20 Hz durum karesinin robot_poz'u.
      const dense=ri>=0&&r[ri+1]&&r[ri+1].t>=clock-1e-6&&(r[ri].sik||r[ri+1].sik);
      const rb=dense?robotArasi(r[ri],r[ri+1],clock):(Object.hasOwn(f,'robot_poz')?f.robot_poz:(ri<0?null:robotArasi(r[ri],r[ri+1],clock)));
      if(shown!==f||b){uygula(f,rb);shown=f;}
      if(i>0)q.splice(0,i);
      while(r.length>2&&r[1].t<=clock)r.shift();
    },
    yakala(){
      if(newest){q=[newest];clock=newest.f.t;readyWall=performance.now()+BUFFER_MS;}
      if(overflow)resync++;
      lastWall=performance.now();shown=null;overflow=false;
    },
    durum(){return {kaynak_t:newest?.f.t??null,goruntu_t:clock,duvar_ms:lastWall,gecikme_s:clock==null?0:Math.max(0,(newest?.f.t??clock)-clock),tampon_kare:q.length,esitleme_gerekli:overflow,yeniden_esitleme:resync};},
    temizle:clear
  };
}

// Unwrap encoder measurements before render sampling. A renderer may miss more
// than half a turn; choosing its shortest arc then reverses the visible table.
export function tablaOlcumKur(){let world=null,last=null,total=0;
 return f=>{const w=`${f.oturum}:${f.dunya}`,a=f.eksenler?.AX_TOP_TABLA;
  if(!Number.isFinite(a))return f;
  if(w!==world||last==null){world=w;last=a;total=a;}
  else {total+=((a-last+540)%360)-180;last=a;}
  f.tabla_donus_deg=total;return f;
 };
}
