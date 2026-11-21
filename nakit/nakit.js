/* ====== 2026 Nakit — paylaşılan model (takvim + gider yönetimi aynı veriyi kullanır) ====== */

const MN=["OCAK","ŞUBAT","MART","NİSAN","MAYIS","HAZİRAN","TEMMUZ","AĞUSTOS","EYLÜL","EKİM","KASIM","ARALIK"];
const MT=["Ocak","Şubat","Mart","Nisan","Mayıs","Haziran","Temmuz","Ağustos","Eylül","Ekim","Kasım","Aralık"];
const MS=["Oca","Şub","Mar","Nis","May","Haz","Tem","Ağu","Eyl","Eki","Kas","Ara"];
const COL=["#6366F1","#8B5CF6","#14B8A6","#10B981","#84CC16","#F59E0B","#F97316","#F43F5E","#06B6D4","#64748B","#3B82F6","#EF4444"];

/* Her grubun rengi: başlık tam renk, alt kalemler bu rengin soluk hali. */
const GCOL={
  "Gelirler":"#5FBE8C",
  "Yaşadığımız Ev (İtalya)":"#C25B6E",
  "Diğer Evler (Türkiye)":"#A07BC8",
  "Araç":"#5B9CC2",
  "Abonelikler":"#C79A5B",
  "Ekstralar":"#8FA85B"
};
function gColor(key,gi){return GCOL[key]||COL[gi%COL.length];}
function rgbaOf(hex,a){const h=hex.replace("#","");
  return `rgba(${parseInt(h.slice(0,2),16)},${parseInt(h.slice(2,4),16)},${parseInt(h.slice(4,6),16)},${a})`;}

/* Grup sırası + tipi. Tüm gelirler ilk grupta; geri kalanı gider grupları. */
const GROUPS=[
  {key:"Gelirler", t:"gelir"},
  {key:"Yaşadığımız Ev (İtalya)", t:"gider"},
  {key:"Diğer Evler (Türkiye)", t:"gider"},
  {key:"Araç", t:"gider"},
  {key:"Abonelikler", t:"gider"},
  {key:"Ekstralar", t:"gider"}
];

/* Kasa (fiziksel varlıklar) — yeni kullanıcı/ilk kurulum başlangıç değerleri */
const KASA_DEFAULT=()=>({
  nakit:[{cur:"EUR",a:6600},{cur:"USD",a:4553},{cur:"GBP",a:20}],
  sikke:[{t:"tam",n:"Tam altın",c:4},{t:"yarim",n:"Yarım altın",c:4},{t:"ceyrek",n:"Çeyrek altın",c:4},{t:"gram",n:"Gram altın",c:2}],
  taki:[{n:"Trabzon burma bileklik (25 sıra)",g:0},{n:"Trabzon burma bileklik (13 sıra)",g:0},{n:"Trabzon burma küpe (3 sıra, çift)",g:0},{n:"Trabzon burma kolye (5 sıra)",g:0},{n:"Ajda bilezik",g:0},{n:"Süs bileziği",g:0}]
});
const RATES_DEFAULT=()=>({USD:0,GBP:0,gram:0,ceyrek:0,yarim:0,tam:0,bilezik22:0,upd:""});

/* Tek tip kalem: {id,t(gelir/gider),g(grup),n(ad),cur(E/T),a(tutar),months('all' | [aylar])} */
const DEFAULTS={
 v:10, kur:54.95, birikim:31000, kasa:KASA_DEFAULT(), rates:RATES_DEFAULT(), frozen:{},
 items:[
  // --- Gelirler (tüm gelirler tek grupta) ---
  {id:"g1",t:"gelir",g:"Gelirler",n:"Eslemisko Maaşı",cur:"T",a:316000,months:"all"},
  {id:"g2",t:"gelir",g:"Gelirler",n:"Changan Maaşı",cur:"E",a:3320,months:"all"},
  {id:"g3",t:"gelir",g:"Gelirler",n:"Eslem Evi (kirada) — Kira Geliri",cur:"T",a:85000,months:"all"},
  {id:"g4",t:"gelir",g:"Gelirler",n:"Kürşat Evi (kirada) — Yıllık Kira",cur:"T",a:420000,months:[12]},
  {id:"g5",t:"gelir",g:"Gelirler",n:"Changan 13. Maaş",cur:"E",a:3320,months:[12]},
  {id:"g6",t:"gelir",g:"Gelirler",n:"Changan Bonus",cur:"E",a:1000,months:[12]},
  // --- Yaşadığımız Ev (İtalya) ---
  {id:"h1",t:"gider",g:"Yaşadığımız Ev (İtalya)",n:"Ev Kirası (İtalya)",cur:"E",a:1300,months:"all"},
  {id:"h2",t:"gider",g:"Yaşadığımız Ev (İtalya)",n:"Yemek",cur:"E",a:720,months:"all"},
  {id:"h3",t:"gider",g:"Yaşadığımız Ev (İtalya)",n:"Site Aidatı",cur:"E",a:300,months:"all"},
  {id:"h4",t:"gider",g:"Yaşadığımız Ev (İtalya)",n:"Elektrik",cur:"E",a:150,months:"all"},
  {id:"h5",t:"gider",g:"Yaşadığımız Ev (İtalya)",n:"Yemek (Kemal)",cur:"E",a:110,months:"all"},
  {id:"h6",t:"gider",g:"Yaşadığımız Ev (İtalya)",n:"İtalyanca Dersi",cur:"T",a:4000,months:"all"},
  {id:"h7",t:"gider",g:"Yaşadığımız Ev (İtalya)",n:"Saç Kesimi",cur:"E",a:37,months:"all"},
  {id:"h8",t:"gider",g:"Yaşadığımız Ev (İtalya)",n:"İnternet (İtalya)",cur:"E",a:25,months:"all"},
  {id:"ses1",t:"gider",g:"Yaşadığımız Ev (İtalya)",n:"Ses Terapisi (haftalık ₺3.250)",cur:"T",a:14083,months:"all"},
  // --- Diğer Evler (Türkiye): önce Kürşat evi, sonra Eslem evleri ---
  {id:"k1",t:"gider",g:"Diğer Evler (Türkiye)",n:"Kürşat Evi — Konut Kredisi (kalan ₺42.000)",cur:"T",a:910,months:"all"},
  {id:"y5",t:"gider",g:"Diğer Evler (Türkiye)",n:"Kürşat Evi — Kira Gelir Vergisi (2 taksit)",cur:"T",a:38500,months:[5,7],
   calc:{src:"g4",auto:false,ist:true,istT:58000,gg:15,d:[190000,400000,1000000,5300000],yil:2026}},
  {id:"y9",t:"gider",g:"Diğer Evler (Türkiye)",n:"Kürşat Evi — Emlak Vergisi (2 taksit)",cur:"T",a:3078,months:[5,11]},
  {id:"y8",t:"gider",g:"Diğer Evler (Türkiye)",n:"Kürşat Evi — Yangın Vergisi (2 taksit)",cur:"T",a:3220,months:[5,11]},
  {id:"y10",t:"gider",g:"Diğer Evler (Türkiye)",n:"Kürşat Evi — DASK",cur:"T",a:1611,months:[5]},
  {id:"y6",t:"gider",g:"Diğer Evler (Türkiye)",n:"Eslem Evleri — Emlak Vergisi (2 taksit)",cur:"T",a:19750,months:[5,11]},
  {id:"y7",t:"gider",g:"Diğer Evler (Türkiye)",n:"Eslem Evleri — DASK (2 ev)",cur:"T",a:3200,months:[5]},
  {id:"y11",t:"gider",g:"Diğer Evler (Türkiye)",n:"Eslem Evleri — Yangın Vergisi",cur:"T",a:0,months:[5]},
  // --- Araç (arabayla ilgili her şey) ---
  {id:"a1",t:"gider",g:"Araç",n:"Benzin",cur:"E",a:300,months:"all"},
  {id:"y1",t:"gider",g:"Araç",n:"Trafik Sigortası (Sara)",cur:"E",a:869,months:[2]},
  {id:"y2",t:"gider",g:"Araç",n:"MTV / Bollo",cur:"E",a:517,months:[2]},
  {id:"y3",t:"gider",g:"Araç",n:"Periyodik Bakım (servis)",cur:"E",a:800,months:[4]},
  // --- Abonelikler ---
  {id:"s1",t:"gider",g:"Abonelikler",n:"GSM İtalya x2",cur:"E",a:18,months:"all"},
  {id:"s2",t:"gider",g:"Abonelikler",n:"Eslem Uygulama",cur:"T",a:800,months:"all"},
  {id:"s3",t:"gider",g:"Abonelikler",n:"Google Gemini x2",cur:"T",a:700,months:"all"},
  {id:"s4",t:"gider",g:"Abonelikler",n:"İnternet (Türkiye)",cur:"T",a:568,months:"all"},
  {id:"s5",t:"gider",g:"Abonelikler",n:"GSM Türkiye (Kemal)",cur:"E",a:7,months:"all"},
  {id:"s6",t:"gider",g:"Abonelikler",n:"iCloud",cur:"T",a:300,months:"all"},
  {id:"s7",t:"gider",g:"Abonelikler",n:"Netflix",cur:"T",a:300,months:"all"},
  {id:"s8",t:"gider",g:"Abonelikler",n:"HBO Max",cur:"T",a:300,months:"all"},
  {id:"s9",t:"gider",g:"Abonelikler",n:"VPN",cur:"T",a:300,months:"all"},
  {id:"s10",t:"gider",g:"Abonelikler",n:"Disney+",cur:"T",a:249,months:"all"},
  {id:"s11",t:"gider",g:"Abonelikler",n:"YouTube",cur:"T",a:234,months:"all"},
  {id:"s12",t:"gider",g:"Abonelikler",n:"Spotify x2",cur:"T",a:200,months:"all"},
  {id:"s13",t:"gider",g:"Abonelikler",n:"Amazon Prime",cur:"T",a:200,months:"all"},
  // --- gelir vergisi (kullanıcı bunu Diğer Evler grubunda tutuyor) ---
  {id:"y4",t:"gider",g:"Diğer Evler (Türkiye)",n:"Eslem — Gelir Vergisi (2 taksit)",cur:"T",a:145500,months:[5,7]}
 ]
};

let S=null, editMode=false;
const openMonths=new Set(), openCats=new Set();
let openPicker=null, openVergi=null, openVergiDet=false, kasaOpen=false;

/* ---- para birimi / biçim ---- */
const fE=v=>"€"+Math.round(v).toLocaleString("tr-TR");
const fT=v=>"₺"+Math.round(v).toLocaleString("tr-TR");
const eur=it=>it.cur==="E"?it.a:it.a/S.kur;                 // her zaman € değeri
const fNative=it=>it.cur==="E"?fE(it.a):fT(it.a);           // yazıldığı para birimi
const fOther=it=>it.cur==="E"?fT(it.a*S.kur):fE(it.a/S.kur);// karşı para birimi (otomatik)

function appliesTo(it,m){return it.months==="all"||(Array.isArray(it.months)&&it.months.includes(m));}
function findItem(id){return S.items.find(i=>i.id===id);}
function newId(){return "x"+Date.now().toString(36)+Math.floor(Math.random()*1e4).toString(36);}
function escapeHtml(s){return String(s).replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;").replace(/>/g,"&gt;");}

function groupList(){
  const known=GROUPS.map(g=>g.key), extra=[];
  S.items.forEach(it=>{if(!known.includes(it.g)&&!extra.find(e=>e.key===it.g))extra.push({key:it.g,t:it.t});});
  return GROUPS.concat(extra);
}

/* ---- yükle / kaydet / eski modelden taşı ---- */
function migrate(o){
  const items=[]; let n=0; const nid=()=>"m"+(++n);
  (o.mInc||[]).forEach(i=>items.push({id:nid(),t:"gelir",g:"Gelirler",n:i.n,cur:i.c,a:i.a,months:"all"}));
  (o.yInc||[]).forEach(i=>items.push({id:nid(),t:"gelir",g:"Gelirler",n:i.n,cur:i.c,a:i.a,months:[i.m]}));
  (o.cats||[]).forEach(c=>(c.items||[]).forEach(i=>items.push({id:nid(),t:"gider",g:c.cat,n:i.n,cur:i.c,a:i.a,months:"all"})));
  (o.yExp||[]).forEach(i=>items.push({id:nid(),t:"gider",g:"Yıllık Giderler & Vergiler",n:i.n,cur:i.c,a:i.a,months:[i.m]}));
  (o.extras||[]).forEach(x=>items.push({id:nid(),t:x.t==="gelir"?"gelir":"gider",g:"Ekstralar",n:x.n,cur:x.c,a:x.a,months:[x.m]}));
  return {v:2,kur:o.kur||54.95,birikim:o.birikim||0,items};
}
/* v2 → v3: kalemleri yeni mantıklı gruplara taşı (araç, evler ikiye, vergiler) */
function remapGroups(st){
  const carRe=/(trafik|mtv|bollo|bak[ıi]m|sigorta)/i;
  (st.items||[]).forEach(it=>{
    if(it.t==="gelir"){ it.g=/kira/i.test(it.n)?"Diğer Evler (Türkiye)":"Maaşlar"; return; }
    const og=it.g;
    if(og==="Ev & Yaşam (İtalya)") it.g="Yaşadığımız Ev (İtalya)";
    else if(og==="Araç") it.g="Araç";
    else if(og==="Kürşat Evi") it.g="Diğer Evler (Türkiye)";
    else if(og==="Abonelikler") it.g="Abonelikler";
    else if(og==="Yıllık Giderler & Vergiler"){
      if(carRe.test(it.n)) it.g="Araç";
      else if(/eslemisko gelir vergisi/i.test(it.n)) it.g="Vergiler";
      else it.g="Diğer Evler (Türkiye)";
    }
    else if(og==="Ekstralar") it.g="Ekstralar";
    // tanınmayan grup → olduğu gibi kalsın
  });
  st.v=3;
  return st;
}
/* v3 → v4: tüm gelirler tek "Gelirler" grubunda toplansın */
function remapV4(st){
  (st.items||[]).forEach(it=>{ if(it.t==="gelir") it.g="Gelirler"; });
  st.v=4;
  return st;
}
/* v4 → v5: Ekstralar'a düşmüş ev kalemleri (emlak/dask/yangın/ev) Diğer Evler'e gitsin */
function remapV5(st){
  const houseRe=/emlak|dask|yang[ıi]n|\bev\b/i;
  (st.items||[]).forEach(it=>{
    if(it.g==="Ekstralar" && it.t==="gider" && houseRe.test(it.n)) it.g="Diğer Evler (Türkiye)";
  });
  st.v=5;
  return st;
}
/* v5 → v6: "Diğer Evler" içinde önce Kürşat, sonra Eslem kalemleri (karışmasın) */
function remapV6(st){
  const items=st.items||[];
  const isDE=i=>i.g==="Diğer Evler (Türkiye)";
  const de=items.filter(isDE);
  if(de.length>1){
    const rank=it=>{const n=(it.n||"").toLowerCase();
      if(/kürşat|kursat|kemal/.test(n))return 0;
      if(/eslem/.test(n))return 1; return 2;};
    const sorted=[...de].sort((a,b)=>rank(a)-rank(b)); // stabil: aynı sahibin sırası korunur
    const out=[]; let placed=false;
    for(const it of items){
      if(isDE(it)){ if(!placed){ out.push(...sorted); placed=true; } }
      else out.push(it);
    }
    st.items=out;
  }
  st.v=6;
  return st;
}
/* v6 → v7: "Kira Gelir Vergisi" kalemine hesap makinesi tanımı ekle (kira kalemine bağlı) */
function remapV7(st){
  (st.items||[]).forEach(it=>{
    if(it.t==="gider"&&!it.calc&&/kira gelir vergisi/i.test(it.n||"")){
      const src=(st.items||[]).find(x=>x.t==="gelir"&&/k[üu]r[şs]at/i.test(x.n||"")&&/kira/i.test(x.n||""))
             ||(st.items||[]).find(x=>x.t==="gelir"&&/kira/i.test(x.n||""));
      it.calc={src:src?src.id:null,auto:false,ist:true,istT:58000,gg:15,d:[190000,400000,1000000,5300000],yil:2026};
    }
  });
  st.v=7;
  return st;
}
/* v7 → v8: Kasa (fiziksel varlıklar) + canlı fiyat alanları */
function remapV8(st){
  if(!st.kasa)st.kasa=KASA_DEFAULT();
  if(!st.rates)st.rates=RATES_DEFAULT();
  st.v=8;
  return st;
}
/* v8 → v9: takı listesini düzelt (kullanıcı revizesi); eşleşen kalemlerin gramını koru */
function remapV9(st){
  if(st.kasa&&Array.isArray(st.kasa.taki)){
    const old=st.kasa.taki;
    const g=re=>{const it=old.find(x=>re.test(x.n||""));return it&&it.g||0;};
    st.kasa.taki=[
      {n:"Trabzon burma bileklik (25 sıra)",g:g(/bileklik.*25|25.*bileklik/i)},
      {n:"Trabzon burma bileklik (13 sıra)",g:g(/bileklik.*13|13.*bileklik/i)},
      {n:"Trabzon burma küpe (3 sıra, çift)",g:g(/küpe|kupe/i)},
      {n:"Trabzon burma kolye (5 sıra)",g:g(/kolye/i)},
      {n:"Ajda bilezik",g:g(/ajda/i)},
      {n:"Süs bileziği",g:g(/süs|sus/i)}
    ];
  }
  st.v=9;
  return st;
}
/* v9 → v10: haftalık ses terapisi kalemi + geçmiş ay dondurma alanı (frozen) */
function remapV10(st){
  if(!st.frozen)st.frozen={};
  if(!(st.items||[]).some(i=>/ses terapisi/i.test(i.n||""))){
    (st.items=st.items||[]).push({id:"ses1",t:"gider",g:"Yaşadığımız Ev (İtalya)",n:"Ses Terapisi (haftalık ₺3.250)",cur:"T",a:14083,months:"all"});
  }
  st.v=10;
  return st;
}
/* gelen veriyi (yerel ya da bulut) güncel sürüme taşı */
function migrateUp(st){
  if(!st||!Array.isArray(st.items))return st;
  if((st.v||0)<3)remapGroups(st);
  if((st.v||0)<4)remapV4(st);
  if((st.v||0)<5)remapV5(st);
  if((st.v||0)<6)remapV6(st);
  if((st.v||0)<7)remapV7(st);
  if((st.v||0)<8)remapV8(st);
  if((st.v||0)<9)remapV9(st);
  if((st.v||0)<10)remapV10(st);
  return st;
}
function load(){
  let raw=null;
  try{raw=localStorage.getItem("nakit2026");}catch(e){}
  if(raw){
    try{
      const d=JSON.parse(raw);
      if(d&&d.v>=2&&Array.isArray(d.items)){
        S=d; let changed=false;
        if(S.v<10){migrateUp(S); changed=true;}
        if(changed)save();
        return;
      }
      S=migrateUp(migrate(d)); save(); return;
    }catch(e){}
  }
  S=JSON.parse(JSON.stringify(DEFAULTS));
}
let saveT=null;
function save(){
  clearTimeout(saveT);
  saveT=setTimeout(()=>{
    S._mt=Date.now();
    try{localStorage.setItem("nakit2026",JSON.stringify(S));}catch(e){}
    cloudPush();
    histRecord();
  },350);
}

/* Geçmiş (donmuş) aylar kendi anlık kopyalarından, güncel/gelecek aylar canlı kalemlerden hesaplanır. */
function curMonth(){const n=new Date();const y=n.getFullYear();return y>2026?13:(y<2026?0:n.getMonth()+1);}
function isPast(m){return m<curMonth();}
function monthItems(m){const f=S.frozen&&S.frozen[m];return (f&&Array.isArray(f.items))?f.items:S.items;}
function freezePast(){
  if(!S.frozen)S.frozen={};
  const cm=curMonth(); let ch=false;
  for(let m=1;m<cm;m++){ if(!S.frozen[m]){ S.frozen[m]={items:JSON.parse(JSON.stringify(S.items)),kur:S.kur}; ch=true; } }
  if(ch)save();
}
function monthCalc(m){
  let gI=0,gO=0;
  monthItems(m).forEach(it=>{if(!appliesTo(it,m))return;const v=eur(it);if(it.t==="gelir")gI+=v;else gO+=v;});
  return {gI,gO,k:gI-gO};
}

let toastT=null;
function toast(msg){
  let t=document.getElementById("toast");
  if(!t){t=document.createElement("div");t.id="toast";document.body.appendChild(t);}
  t.textContent=msg;t.classList.add("show");
  clearTimeout(toastT);toastT=setTimeout(()=>t.classList.remove("show"),1800);
}
function rerender(){document.body.dataset.page==="editor"?renderEditor():renderCalendar();}

/* ====================== SAYFA 1 — AYLIK TAKVİM ====================== */
function valHTML(it,locked){
  if(locked)return `<span class="vl">${fNative(it)}</span>`;
  if(!editMode)return `<span class="vl tap" data-id="${it.id}">${fNative(it)}</span>`;
  return `<input class="editv" type="number" value="${it.a}" data-id="${it.id}">`;
}
function renderCalendar(){
  const ki=document.getElementById("kurIn"); if(ki)ki.value=S.kur;
  const bi=document.getElementById("birIn"); if(bi)bi.value=S.birikim;
  const bti=document.getElementById("birTlIn"); if(bti)bti.value=S.birikimTL||0;
  const cm=curMonth();
  const res=MN.map((_,i)=>monthCalc(i+1));
  const maxK=Math.max(...res.map(r=>r.k),1);
  document.getElementById("strip").innerHTML=res.map((r,i)=>{
    const mm=i+1, cls=mm<cm?"bpast":mm===cm?"bcur":"";
    return `<div class="${cls}" style="height:${Math.max(8,r.k>0?r.k/maxK*100:8)}%;background:${COL[i]}" title="${MN[i]}"></div>`;
  }).join("");

  const expGroups=groupList().filter(g=>g.t!=="gelir");
  const grpOpts=groupList().map(g=>`<option value="${escapeHtml(g.key)}"${g.key==="Ekstralar"?" selected":""}>${escapeHtml(g.key)}</option>`).join("");
  let html="";
  res.forEach((r,idx)=>{
    const m=idx+1;
    const past=m<cm, cur=m===cm;
    const col=COL[idx], open=openMonths.has(m)?" open":"";
    const src=monthItems(m);
    html+=`<div class="mcard${open}${past?" past":""}${cur?" cur":""}" data-m="${m}">
    <div class="mhead" data-mh="${m}">
      <div class="mbar" style="background:${col}"></div>
      <div class="mname">${MN[idx]}${cur?' <span class="nowtag">BU AY</span>':past?' <span class="pasttag">🔒</span>':""}</div>
      <div><div class="mkalan">${fE(r.k)}</div>
      ${(()=>{const ger=(S.gercek||{})[m],hasGer=typeof ger==="number",gv=hasGer?ger:r.k;
        return `<div class="mbirik ${gv>=0?"pos":"neg"}">${hasGer?"✓ ":"bu ay "}${gv>=0?"+":"−"}${fE(Math.abs(gv))}</div>`;})()}</div>
      <div class="chev">▶</div>
    </div>
    <div class="mbody">
      <div class="sec in">GELEN · ${fE(r.gI)}</div>`;
    src.filter(i=>i.t==="gelir"&&appliesTo(i,m)).forEach(it=>{
      const star=it.months!=="all";
      html+=`<div class="it${star?" yr":""}"><span class="nm"${star?` style="color:${col}"`:""}>${star?"★ ":""}${escapeHtml(it.n)}${it.cur==="T"?' <small>₺</small>':""}</span>${valHTML(it,past)}</div>`;
    });
    html+=`<div class="sec out">GİDEN · ${fE(r.gO)}</div>`;
    expGroups.forEach(g=>{
      const items=src.filter(i=>i.g===g.key&&i.t==="gider"&&appliesTo(i,m));
      if(!items.length)return;
      const sum=items.reduce((s,i)=>s+eur(i),0);
      const ck=m+"_"+g.key, copen=openCats.has(ck)?" open":"";
      html+=`<div class="cat${copen}" data-cat="${escapeHtml(ck)}"><span>${escapeHtml(g.key)}<span class="cv">▶</span></span><span class="vl">${fE(sum)}</span></div><div class="catbody">`;
      items.forEach(it=>{
        const star=it.months!=="all";
        html+=`<div class="it"><span class="nm"${star?` style="color:${col}"`:""}>${star?"★ ":""}${escapeHtml(it.n)}${it.cur==="T"?' <small>₺</small>':""}</span>${valHTML(it,past)}</div>`;
      });
      html+=`</div>`;
    });
    if(!past)html+=`<button class="addx" data-addx="${m}">+ Bu aya ekstra ekle</button>
    <div class="xform" id="xf${m}">
      <input placeholder="Açıklama (örn. tatil, tamirat)" id="xn${m}">
      <select id="xg${m}">${grpOpts}</select>
      <div class="half"><input type="number" placeholder="Tutar" id="xa${m}">
      <select id="xc${m}"><option value="T">₺</option><option value="E">€</option></select>
      <select id="xt${m}"><option value="gider">Gider</option><option value="gelir">Gelir</option></select></div>
      <button data-xsave="${m}">Ekle</button>
    </div>`;
    html+=`<div class="kalanrow"><span class="l">KALAN</span><span class="v">${fE(r.k)}</span></div>
    <div class="tlrow"><span>≈ TL karşılığı</span><span>${fT(r.k*S.kur)}</span></div>`;
    if(past){
      const ger=(S.gercek||{})[m];
      html+=`<div class="gerrow"><span class="l">BU AY BİRİKTİRDİĞİM (€)</span>
        <span class="gerval">${typeof ger==="number"?fE(ger):"—"}</span></div>`;
    }else{
      html+=`<div class="gerrow"><span class="l">BU AY BİRİKTİRDİĞİM (€)</span>
      <input type="number" inputmode="decimal" class="gerin" data-ger="${m}"
        value="${typeof (S.gercek||{})[m]==="number"?S.gercek[m]:""}" placeholder="örn. 5000 / -2000"></div>`;
    }
    html+=`</div></div>`;
  });
  document.getElementById("months").innerHTML=html;

  const yI=res.reduce((s,r)=>s+r.gI,0), yO=res.reduce((s,r)=>s+r.gO,0);
  document.getElementById("yearbox").innerHTML=`<h2>YIL ÖZETİ</h2>
   <div class="it"><span class="nm">Yıllık Gelir</span><span class="vl" style="color:var(--in)">${fE(yI)}</span></div>
   <div class="it"><span class="nm">Yıllık Gider</span><span class="vl" style="color:var(--out)">${fE(yO)}</span></div>
   <div class="it"><span class="nm">Yıllık Birikim (plan)</span><span class="vl">${fE(yI-yO)}</span></div>`;
  bindCalendar();
}
function bindCalendar(){
  document.querySelectorAll("[data-mh]").forEach(el=>el.onclick=e=>{
    if(e.target.closest("input"))return;
    const m=+el.dataset.mh; openMonths.has(m)?openMonths.delete(m):openMonths.add(m);
    el.parentElement.classList.toggle("open");
  });
  document.querySelectorAll("[data-cat]").forEach(el=>el.onclick=()=>{
    const k=el.dataset.cat; openCats.has(k)?openCats.delete(k):openCats.add(k); el.classList.toggle("open");
  });
  document.querySelectorAll(".editv").forEach(inp=>inp.onchange=()=>{
    const it=findItem(inp.dataset.id); if(it){it.a=parseFloat(inp.value)||0; vergiAuto(it.id); save(); renderCalendar();}
  });
  document.querySelectorAll(".vl.tap").forEach(sp=>sp.onclick=e=>{
    e.stopPropagation();
    const it=findItem(sp.dataset.id); if(!it)return;
    const inp=document.createElement("input");
    inp.className="editv"; inp.type="number"; inp.value=it.a; inp.inputMode="decimal";
    sp.replaceWith(inp); inp.focus();
    let done=false;
    inp.onchange=()=>{done=true; it.a=parseFloat(inp.value)||0; vergiAuto(it.id); save(); renderCalendar();
      toast(it.months==="all"?"Tüm aylara uygulandı ✓":"Kaydedildi ✓");};
    inp.onblur=()=>{if(!done)renderCalendar();};
  });
  /* "bu ay biriktirdiğim": artı tutar Mevcut Birikim'e eklenir; eksi tutar sadece
     kırmızı gösterilir, birikimden DÜŞÜLMEZ. Düzeltme/silme eski eklemeyi geri alır. */
  document.querySelectorAll(".gerin").forEach(inp=>inp.onchange=()=>{
    const m=+inp.dataset.ger;
    if(!S.gercek)S.gercek={};
    const old=typeof S.gercek[m]==="number"?S.gercek[m]:0;
    const raw=inp.value.trim();
    if(raw===""){
      if(m in S.gercek){S.birikim-=Math.max(0,old); delete S.gercek[m];
        toast("Kayıt silindi"+(old>0?" — birikimden geri alındı":""));}
    }else{
      const val=parseFloat(raw)||0;
      S.birikim+=Math.max(0,val)-Math.max(0,old); S.gercek[m]=val;
      toast(val>0?"Birikime eklendi ✓ Mevcut birikim: "+fE(S.birikim)
              :"Kaydedildi — eksi ay birikimden düşülmez");
    }
    save(); renderCalendar();
  });
  document.querySelectorAll("[data-addx]").forEach(b=>b.onclick=()=>{
    document.getElementById("xf"+b.dataset.addx).classList.toggle("show");
  });
  document.querySelectorAll("[data-xsave]").forEach(b=>b.onclick=()=>{
    const m=+b.dataset.xsave;
    const n=document.getElementById("xn"+m).value.trim();
    const a=parseFloat(document.getElementById("xa"+m).value);
    if(!n||!a)return;
    const xt=document.getElementById("xt"+m).value;
    const xg=document.getElementById("xg"+m).value || "Ekstralar";
    S.items.push({id:newId(),t:xt,g:xt==="gelir"?"Gelirler":xg,n,
      cur:document.getElementById("xc"+m).value,a,months:[m]});
    save(); renderCalendar();
  });
  wireSettings(renderCalendar);
  const eb=document.getElementById("editBtn");
  if(eb)eb.onclick=()=>{
    editMode=!editMode;
    eb.classList.toggle("on",editMode); eb.textContent=editMode?"Bitti":"Düzenle";
    renderCalendar();
  };
}

/* ====================== SAYFA 2 — GİDER YÖNETİMİ ====================== */
const monthCount=it=>it.months==="all"?12:(Array.isArray(it.months)?it.months.length:0);
const annual=it=>eur(it)*monthCount(it);
function monthsLabel(it){
  if(it.months==="all")return "Her ay";
  const arr=[...it.months].sort((a,b)=>a-b);
  if(!arr.length)return "Ay seç →";
  if(arr.length===12)return "Her ay";
  if(arr.length===1)return MT[arr[0]-1];
  if(arr.length>4)return arr.length+" ay";
  return arr.map(m=>MS[m-1]).join(" · ");
}
/* ---- kira gelir vergisi hesabı (GVK 103 — artan oranlı tarife) ----
   Formül sabit: kira − mesken istisnası − %15 götürü gider = matrah → dilimlere göre vergi.
   İstisna tutarı ve dilim sınırları her yıl GİB tarafından yenilenir (calc parametreleri elle güncellenir). */
const VDIL_ORAN=[.15,.20,.27,.35,.40];
function srcYearlyTL(it){return (it.cur==="T"?it.a:it.a*S.kur)*monthCount(it);}
function vergiKirasi(t){const c=t.calc||{};const s=c.src?findItem(c.src):null;
  return Math.round(s?srcYearlyTL(s):(c.kira||0));}
function kiraVergiHesap(kira,c){
  const ist=c.ist?Math.min(c.istT||0,kira):0;
  const kalan=Math.max(0,kira-ist);
  const gg=Math.round(kalan*((c.gg||0)/100));
  const matrah=kalan-gg;
  const lims=[...(c.d||[])].concat([Infinity]);
  let prev=0,toplam=0; const dil=[];
  for(let i=0;i<lims.length&&i<VDIL_ORAN.length;i++){
    if(matrah<=prev)break;
    const pay=Math.min(matrah,lims[i])-prev;
    const v=pay*VDIL_ORAN[i];
    dil.push({oran:VDIL_ORAN[i],pay,v});
    toplam+=v; prev=lims[i];
  }
  return {kira,ist,gg,matrah,dil,toplam:Math.round(toplam)};
}
function vergiUygula(t){
  const r=kiraVergiHesap(vergiKirasi(t),t.calc);
  const ins=Math.max(1,monthCount(t));
  t.a=Math.round(r.toplam/ins); t.cur="T";
  return {r,ins};
}
/* bir kalemin tutarı değişince: ona bağlı otomatik vergi kalemlerini yeniden hesapla */
function vergiAuto(changedId){
  let msg=null;
  S.items.forEach(t=>{
    if(t.calc&&t.calc.auto&&t.calc.src===changedId){
      const {ins}=vergiUygula(t);
      msg="Kira vergisi yeniden hesaplandı: "+ins+" × "+fT(t.a);
    }
  });
  if(msg)toast(msg);
}
function vergiPanelHTML(it){
  const c=it.calc;
  const src=c.src?findItem(c.src):null;
  const kira=vergiKirasi(it);
  const r=kiraVergiHesap(kira,c);
  const ins=Math.max(1,monthCount(it));
  const tak=Math.round(r.toplam/ins);
  let h=`<div class="vpanel">
    <div class="vphead">KİRA GELİR VERGİSİ HESABI · ${c.yil} TARİFESİ</div>
    <div class="vk"><label>Yıllık kira (₺)${src?` — “${escapeHtml(src.n)}” kalemine bağlı`:""}</label>
      <input type="number" data-vk="${it.id}" value="${kira}"></div>
    <label class="vchk"><input type="checkbox" data-vist="${it.id}"${c.ist?" checked":""}>
      Mesken istisnası (−${(c.istT||0).toLocaleString("tr-TR")} ₺)</label>
    ${c.ist?`<div class="vpnote">Türkiye'de beyana tabi toplam gelir 1.500.000 ₺'yi aşarsa istisna kullanılamaz — o durumda kapat.</div>`:""}
    <div class="vrow"><span>Kira (yıllık)</span><span>${fT(r.kira)}</span></div>`;
  if(r.ist>0)h+=`<div class="vrow"><span>− Mesken istisnası</span><span>−${fT(r.ist)}</span></div>`;
  h+=`<div class="vrow"><span>− Götürü gider (%${c.gg})</span><span>−${fT(r.gg)}</span></div>
    <div class="vrow top"><span>Vergi matrahı</span><span>${fT(r.matrah)}</span></div>`;
  r.dil.forEach(d=>{h+=`<div class="vrow dim"><span>%${Math.round(d.oran*100)} × ${fT(d.pay)}</span><span>${fT(d.v)}</span></div>`;});
  h+=`<div class="vrow top"><span>TOPLAM VERGİ</span><span>${fT(r.toplam)}</span></div>
    <div class="vrow dim"><span>${ins} taksit (${monthsLabel(it)}) · resmî ödeme Mart + Temmuz</span><span>${ins} × ${fT(tak)}</span></div>
    <button class="vapply" data-vapply="${it.id}">Kaleme yaz: ${ins} × ${fT(tak)}</button>
    <label class="vchk"><input type="checkbox" data-vauto="${it.id}"${c.auto?" checked":""}>
      Kira kalemi değişince otomatik yeniden hesapla</label>
    <details class="vpdet"${openVergiDet?" open":""}><summary>${c.yil} parametreleri (her yıl değişir)</summary>
      <div class="vprm"><label>Mesken istisnası (₺)</label><input type="number" data-vp="istT" data-vid="${it.id}" value="${c.istT}"></div>
      <div class="vprm"><label>Götürü gider (%)</label><input type="number" data-vp="gg" data-vid="${it.id}" value="${c.gg}"></div>
      <div class="vprm"><label>1. dilim üstü (%15)</label><input type="number" data-vp="d0" data-vid="${it.id}" value="${c.d[0]}"></div>
      <div class="vprm"><label>2. dilim üstü (%20)</label><input type="number" data-vp="d1" data-vid="${it.id}" value="${c.d[1]}"></div>
      <div class="vprm"><label>3. dilim üstü (%27)</label><input type="number" data-vp="d2" data-vid="${it.id}" value="${c.d[2]}"></div>
      <div class="vprm"><label>4. dilim üstü (%35)</label><input type="number" data-vp="d3" data-vid="${it.id}" value="${c.d[3]}"></div>
      <div class="vprm"><label>Tarife yılı</label><input type="number" data-vp="yil" data-vid="${it.id}" value="${c.yil}"></div>
      <div class="vpnote">4. dilimin üzeri %40. Bu tutarları GİB her yıl Aralık'ta yeniler
        (<a href="https://www.gib.gov.tr" target="_blank" rel="noopener">gib.gov.tr</a>) — uygulama bunları
        kendiliğinden çekemez; yeni yılda buradan elle düzelt ya da Claude'a sor.</div>
    </details>
  </div>`;
  return h;
}

function monthsLabelFull(it){
  if(it.months==="all")return "Her ay";
  const arr=[...it.months].sort((a,b)=>a-b);
  if(!arr.length)return "Ay seçilmedi";
  if(arr.length===12)return "Her ay";
  return arr.map(m=>MT[m-1]).join(" · ");
}

/* kesilen yazılar: üzerine gelince (fare) ya da dokununca (odak) tam metni balonda göster */
let tipEl=null,tipHideT=null;
function tipShow(target,text){
  if(!text)return;
  if(!tipEl){tipEl=document.createElement("div");tipEl.id="tip";document.body.appendChild(tipEl);}
  clearTimeout(tipHideT);
  tipEl.textContent=text; tipEl.classList.add("show");
  const r=target.getBoundingClientRect();
  let x=r.left+r.width/2-tipEl.offsetWidth/2;
  x=Math.max(8,Math.min(x,window.innerWidth-tipEl.offsetWidth-8));
  let y=r.top-tipEl.offsetHeight-8;
  if(y<8)y=r.bottom+8;
  tipEl.style.left=x+"px"; tipEl.style.top=y+"px";
}
function tipHide(delay){clearTimeout(tipHideT);
  tipHideT=setTimeout(()=>{if(tipEl)tipEl.classList.remove("show");},delay||0);}
window.addEventListener("scroll",()=>tipHide(0),{passive:true});
document.addEventListener("pointerdown",e=>{if(!e.target.closest(".enm"))tipHide(0);},true);

function monthPickerHTML(it){
  const all=it.months==="all";
  let h=`<div class="mpick"><button class="mall${all?" on":""}" data-mall="${it.id}">Her ay</button><div class="mgrid">`;
  for(let m=1;m<=12;m++){
    const on=!all&&Array.isArray(it.months)&&it.months.includes(m);
    h+=`<button class="mchip${on?" on":""}" data-mc="${it.id}" data-m="${m}">${MS[m-1]}</button>`;
  }
  return h+`</div></div>`;
}
function renderEditor(){
  const ki=document.getElementById("kurIn"); if(ki)ki.value=S.kur;
  const bi=document.getElementById("birIn"); if(bi)bi.value=S.birikim;
  const bti=document.getElementById("birTlIn"); if(bti)bti.value=S.birikimTL||0;

  let totIn=0,totOut=0;
  S.items.forEach(it=>{const an=annual(it); if(it.t==="gelir")totIn+=an; else totOut+=an;});

  let html="";
  groupList().forEach((g,gi)=>{
    const items=S.items.filter(i=>i.g===g.key);
    if(!items.length && g.key==="Ekstralar")return;  // boş ekstralar grubunu gizle
    let inSum=0,outSum=0;
    items.forEach(i=>{const an=annual(i); if(i.t==="gelir")inSum+=an; else outSum+=an;});
    const base=gColor(g.key,gi);
    const cTxt=rgbaOf(base,.72);
    const share=totOut>0?outSum/totOut*100:0;
    const totVal=g.t==="gelir"?inSum:outSum;
    html+=`<div class="grp">
      <div class="grphead"><span class="grpname" style="color:${base}">${escapeHtml(g.key)}</span>
      <span class="grptot" style="color:${base}">${fE(totVal)}<small> /yıl</small></span></div>`;
    if(g.t==="gelir"){
      const mIn=items.filter(i=>i.months==="all").reduce((s,i)=>s+eur(i),0);
      html+=`<div class="grpsub" style="color:${base}"><span>Aylık gelir (her ay)</span><span>${fE(mIn)} · ${fT(mIn*S.kur)}</span></div>`;
    }
    if(g.t!=="gelir"&&outSum>0)html+=`<div class="grpbar"><div style="width:${share}%;background:${base}"></div></div>`;
    html+=`<div class="glist" data-group="${escapeHtml(g.key)}">`;
    items.forEach(it=>{
      const open=openPicker===it.id?" open":"";
      const tlNum=Math.round(it.cur==="T"?it.a:it.a*S.kur);
      const eurNum=Math.round(it.cur==="E"?it.a:it.a/S.kur);
      const tlCell=it.cur==="T"
        ? `<span class="vnum ed" data-ed="${it.id}" style="color:${base}">${tlNum.toLocaleString("tr-TR")}</span>`
        : `<span class="vnum sw" data-sw="${it.id}" data-to="T">${tlNum.toLocaleString("tr-TR")}</span>`;
      const eurCell=it.cur==="E"
        ? `<span class="vnum ed" data-ed="${it.id}" style="color:${base}">${eurNum.toLocaleString("tr-TR")}</span>`
        : `<span class="vnum sw" data-sw="${it.id}" data-to="E">${eurNum.toLocaleString("tr-TR")}</span>`;
      const vopen=openVergi===it.id;
      const fx=it.calc?`<button class="efx${vopen?" on":""}" data-fx="${it.id}" title="Vergi hesabı">ƒ</button>`:"";
      html+=`<div class="ewrap" data-id="${it.id}">
        <div class="erow">
          <span class="dh" data-dh="${it.id}" title="Sürükle">⠿</span>
          <input class="enm" value="${escapeHtml(it.n)}" data-id="${it.id}" style="color:${cTxt}">
          ${fx}
          <div class="val tl ${it.cur==='T'?'paid':'calc'}">${tlCell}</div>
          <div class="val eur ${it.cur==='E'?'paid':'calc'}">${eurCell}</div>
          <button class="emonths${open}" data-mp="${it.id}">${monthsLabel(it)}</button>
          <button class="edel" data-del="${it.id}">✕</button>
        </div>
        ${open?monthPickerHTML(it):""}
        ${vopen?vergiPanelHTML(it):""}
      </div>`;
    });
    html+=`</div>`;
    html+=`<button class="addrow" data-add="${escapeHtml(g.key)}" data-addt="${g.t==='gelir'?'gelir':'gider'}">+ ${g.t==='gelir'?'gelir':'gider'} ekle</button>`;
    html+=`</div>`;
  });
  document.getElementById("groups").innerHTML=html;

  const net=totIn-totOut;
  document.getElementById("esum").innerHTML=`<h2>YIL ÖZETİ</h2>
   <div class="it"><span class="nm">Yıllık Gelir</span><span class="vl" style="color:var(--in)">${fE(totIn)}</span></div>
   <div class="it"><span class="nm">Yıllık Gider</span><span class="vl" style="color:var(--out)">${fE(totOut)}</span></div>
   <div class="it"><span class="nm">Yıllık Birikim (plan)</span><span class="vl">${fE(net)}</span></div>`;
  bindEditor();
}
function bindEditor(){
  tipHide(0);
  document.querySelectorAll(".enm").forEach(inp=>{
    inp.onchange=()=>{
      const it=findItem(inp.dataset.id); if(it){it.n=inp.value.trim()||it.n; save();}
    };
    // ad kesikse tam halini balonda göster (fareyle üzerine gelince ya da dokunup odaklanınca)
    const trunc=()=>inp.scrollWidth>inp.clientWidth+1;
    inp.addEventListener("mouseenter",()=>{if(trunc())tipShow(inp,inp.value);});
    inp.addEventListener("mouseleave",()=>{if(document.activeElement!==inp)tipHide(80);});
    inp.addEventListener("focus",()=>{if(trunc())tipShow(inp,inp.value);});
    inp.addEventListener("input",()=>{if(tipEl&&tipEl.classList.contains("show"))tipShow(inp,inp.value);});
    inp.addEventListener("blur",()=>tipHide(0));
  });
  document.querySelectorAll(".vnum.ed").forEach(sp=>sp.onclick=()=>{
    const it=findItem(sp.dataset.ed); if(!it)return;
    const inp=document.createElement("input");
    inp.type="number"; inp.inputMode="decimal"; inp.value=it.a; inp.className="vedit";
    sp.replaceWith(inp); inp.focus(); inp.select();
    let done=false;
    inp.onchange=()=>{done=true; it.a=parseFloat(inp.value)||0; vergiAuto(it.id); save(); renderEditor();
      toast(it.months==="all"?"Tüm aylara uygulandı ✓":"Kaydedildi ✓");};
    inp.onblur=()=>{if(!done)renderEditor();};
  });
  document.querySelectorAll(".vnum.sw").forEach(s=>s.onclick=()=>{
    const it=findItem(s.dataset.sw); if(!it)return;
    const to=s.dataset.to; if(to===it.cur)return;
    // gösterilen değer aynı kalsın diye tutarı hedef para birimine çevir
    if(to==="E") it.a=Math.round((it.cur==="T"?it.a/S.kur:it.a)*100)/100;
    else it.a=Math.round((it.cur==="E"?it.a*S.kur:it.a)*100)/100;
    it.cur=to; save(); renderEditor(); toast(to==="E"?"€ ile ödeniyor ✓":"₺ ile ödeniyor ✓");
  });
  /* --- vergi hesap paneli --- */
  document.querySelectorAll("[data-fx]").forEach(b=>b.onclick=()=>{
    openVergi=openVergi===b.dataset.fx?null:b.dataset.fx; openPicker=null; renderEditor();
  });
  document.querySelectorAll("[data-vk]").forEach(inp=>inp.onchange=()=>{
    const it=findItem(inp.dataset.vk); if(!it||!it.calc)return;
    const val=parseFloat(inp.value)||0;
    const src=it.calc.src?findItem(it.calc.src):null;
    if(src){ // panelde yazılan yıllık kira, bağlı gelir kalemine de işler (çift yönlü)
      const mc=Math.max(1,monthCount(src));
      if(src.cur==="T")src.a=Math.round(val/mc);
      else src.a=Math.round(val/S.kur/mc*100)/100;
    } else it.calc.kira=val;
    if(it.calc.auto)vergiUygula(it);
    save(); renderEditor();
  });
  document.querySelectorAll("[data-vist]").forEach(cb=>cb.onchange=()=>{
    const it=findItem(cb.dataset.vist); if(!it||!it.calc)return;
    it.calc.ist=cb.checked; if(it.calc.auto)vergiUygula(it);
    save(); renderEditor();
  });
  document.querySelectorAll("[data-vauto]").forEach(cb=>cb.onchange=()=>{
    const it=findItem(cb.dataset.vauto); if(!it||!it.calc)return;
    it.calc.auto=cb.checked; if(cb.checked)vergiUygula(it);
    save(); renderEditor();
  });
  document.querySelectorAll("[data-vapply]").forEach(b=>b.onclick=()=>{
    const it=findItem(b.dataset.vapply); if(!it||!it.calc)return;
    const {ins}=vergiUygula(it); it.calc.auto=true;
    save(); renderEditor(); toast("Kaleme yazıldı: "+ins+" × "+fT(it.a));
  });
  document.querySelectorAll("[data-vp]").forEach(inp=>inp.onchange=()=>{
    const it=findItem(inp.dataset.vid); if(!it||!it.calc)return;
    const val=parseFloat(inp.value)||0, k=inp.dataset.vp;
    if(k==="istT")it.calc.istT=val;
    else if(k==="gg")it.calc.gg=val;
    else if(k==="yil")it.calc.yil=Math.round(val);
    else if(/^d[0-3]$/.test(k))it.calc.d[+k[1]]=val;
    if(it.calc.auto)vergiUygula(it);
    save(); renderEditor();
  });
  document.querySelectorAll(".vpdet").forEach(d=>d.ontoggle=()=>{openVergiDet=d.open;});

  document.querySelectorAll("[data-mp]").forEach(b=>{
    b.onclick=()=>{
      openPicker=openPicker===b.dataset.mp?null:b.dataset.mp; renderEditor();
    };
    // "May · T…" gibi kesik ay etiketinin tam halini balonda göster
    b.addEventListener("mouseenter",()=>{
      const it=findItem(b.dataset.mp); if(it)tipShow(b,monthsLabelFull(it));
    });
    b.addEventListener("mouseleave",()=>tipHide(80));
  });
  document.querySelectorAll("[data-mall]").forEach(b=>b.onclick=()=>{
    const it=findItem(b.dataset.mall); if(it){it.months="all"; save(); renderEditor();}
  });
  document.querySelectorAll("[data-mc]").forEach(b=>b.onclick=()=>{
    const it=findItem(b.dataset.mc); if(!it)return;
    const m=+b.dataset.m;
    let arr=it.months==="all"?[]:[...it.months];
    if(it.months==="all")arr=[m];
    else if(arr.includes(m))arr=arr.filter(x=>x!==m);
    else arr.push(m);
    it.months=arr.length===12?"all":arr;
    save(); renderEditor();
  });
  document.querySelectorAll("[data-del]").forEach(b=>b.onclick=()=>{
    const it=findItem(b.dataset.del);
    if(!confirm("“"+(it?it.n:"")+"” kalemini sil?"))return;
    S.items=S.items.filter(i=>i.id!==b.dataset.del);
    if(openPicker===b.dataset.del)openPicker=null;
    save(); renderEditor();
  });
  document.querySelectorAll("[data-add]").forEach(b=>b.onclick=()=>{
    const t=b.dataset.addt||"gider";
    const it={id:newId(),t,g:b.dataset.add,n:"Yeni kalem",cur:"T",a:0,months:"all"};
    S.items.push(it); openPicker=null; save(); renderEditor();
    setTimeout(()=>{const el=document.querySelector('.enm[data-id="'+it.id+'"]'); if(el){el.focus(); el.select();}},0);
  });
  setupDrag();
  wireSettings(renderEditor);
}

/* Tut-çek ile sıralama (dokunmatik + fare). Tutamaçtan sürüklenir;
   başka gruba bırakılırsa o kaleme yeni grup atanır. */
function setupDrag(){
  let dragEl=null;
  const listUnder=(x,y)=>{const el=document.elementFromPoint(x,y); return el?el.closest(".glist"):null;};
  const afterEl=(list,y)=>{
    let res=null,min=Infinity;
    list.querySelectorAll(".ewrap:not(.dragging)").forEach(c=>{
      const b=c.getBoundingClientRect(), center=b.top+b.height/2;
      if(y<center && center-y<min){min=center-y; res=c;}
    });
    return res;
  };
  const commit=()=>{
    const seen=[], newItems=[];
    document.querySelectorAll(".glist").forEach(list=>{
      const gk=list.dataset.group;
      list.querySelectorAll(".ewrap").forEach(w=>{
        const it=findItem(w.dataset.id);
        if(it){it.g=gk; newItems.push(it); seen.push(it.id);}
      });
    });
    S.items.forEach(it=>{if(!seen.includes(it.id))newItems.push(it);}); // gizli grupları koru
    S.items=newItems; save(); renderEditor();
  };
  let lastX=0,lastY=0,scrollTimer=null;
  const place=()=>{
    if(!dragEl)return;
    const list=listUnder(lastX,lastY)||dragEl.parentElement;
    const ref=afterEl(list,lastY);
    if(ref)list.insertBefore(dragEl,ref); else list.appendChild(dragEl);
  };
  const autoScroll=()=>{
    if(!dragEl){clearInterval(scrollTimer);scrollTimer=null;return;}
    const h=window.innerHeight;
    let d=0;
    if(lastY<70)d=-Math.min(14,(70-lastY)/3+4);
    else if(lastY>h-70)d=Math.min(14,(lastY-(h-70))/3+4);
    if(d){window.scrollBy(0,d); place();}
  };
  document.querySelectorAll(".dh").forEach(h=>{
    h.addEventListener("pointerdown",e=>{
      e.preventDefault();
      dragEl=h.closest(".ewrap"); if(!dragEl)return;
      dragEl.classList.add("dragging");
      lastX=e.clientX; lastY=e.clientY;
      if(!scrollTimer)scrollTimer=setInterval(autoScroll,16);
      const move=ev=>{
        ev.preventDefault();
        lastX=ev.clientX; lastY=ev.clientY; place();
      };
      const up=()=>{
        document.removeEventListener("pointermove",move);
        document.removeEventListener("pointerup",up);
        clearInterval(scrollTimer); scrollTimer=null;
        if(dragEl)dragEl.classList.remove("dragging");
        dragEl=null; commit();
      };
      document.addEventListener("pointermove",move);
      document.addEventListener("pointerup",up);
    });
  });
}

/* ---- ortak: kur / birikim ayar alanı + otomatik kur ---- */
function birTlGoster(){
  const bt=document.getElementById("birTop");
  if(bt)bt.textContent="toplam ≈ "+fE(S.birikim+(S.birikimTL||0)/S.kur)+" · "+fT(S.birikim*S.kur+(S.birikimTL||0));
}
function wireSettings(reRender){
  const kr=document.getElementById("kurRef"); if(kr)kr.onclick=fetchKur;
  const ki=document.getElementById("kurIn"); if(ki)ki.onchange=e=>{S.kur=parseFloat(e.target.value)||S.kur; save(); reRender();};
  const bi=document.getElementById("birIn"); if(bi)bi.onchange=e=>{S.birikim=parseFloat(e.target.value)||0; save(); reRender();};
  const bti=document.getElementById("birTlIn"); if(bti)bti.onchange=e=>{S.birikimTL=parseFloat(e.target.value)||0; save(); reRender();};
  birTlGoster();
  renderKasa();
}

/* ---- KASA (nakit + altın) ---- */
const fTL0=v=>"₺"+Math.round(v).toLocaleString("tr-TR");
const CUR_SYM={EUR:"€",USD:"$",GBP:"£"};
function curTL(cur){return cur==="EUR"?S.kur:cur==="USD"?(S.rates&&S.rates.USD||0):cur==="GBP"?(S.rates&&S.rates.GBP||0):0;}
function sikkePrice(t){const R=S.rates||{};return t==="tam"?R.tam:t==="yarim"?R.yarim:t==="ceyrek"?R.ceyrek:t==="gram"?R.gram:0;}
function kasaCalc(){
  const k=S.kasa||{};
  let nakit=0,sikke=0,taki=0;
  (k.nakit||[]).forEach(c=>nakit+=(c.a||0)*curTL(c.cur));
  (k.sikke||[]).forEach(s=>sikke+=(s.c||0)*(sikkePrice(s.t)||0));
  (k.taki||[]).forEach(t=>taki+=(t.g||0)*((S.rates&&S.rates.bilezik22)||0));
  return {nakit,sikke,taki,tot:nakit+sikke+taki};
}
function renderKasa(){
  const el=document.getElementById("kasa"); if(!el)return;
  const k=S.kasa||{},R=S.rates||{},c=kasaCalc();
  const bankaTL=S.birikim*S.kur+(S.birikimTL||0);
  const grandTL=bankaTL+c.tot;
  let h=`<div class="krow khead" id="kHead"><span class="kttl">KASA · nakit + altın</span>
    <span class="ktot">${fTL0(c.tot)} · ${fE(c.tot/S.kur)} <span class="kchev">${kasaOpen?"▾":"▸"}</span></span></div>`;
  if(kasaOpen){
    h+=`<div class="kbody"><div class="ksec">Nakit (döviz)</div>`;
    (k.nakit||[]).forEach((c2,i)=>{
      h+=`<div class="krow"><span class="kname">${CUR_SYM[c2.cur]||c2.cur} nakit</span>
        <input class="kin" type="number" inputmode="decimal" data-kn="${i}" value="${c2.a}">
        <span class="kval">${fTL0((c2.a||0)*curTL(c2.cur))}</span></div>`;
    });
    h+=`<div class="ksec">Sikke altın <small>adet × güncel</small></div>`;
    (k.sikke||[]).forEach((s,i)=>{
      h+=`<div class="krow"><span class="kname">${s.n}</span>
        <input class="kin" type="number" inputmode="numeric" data-ks="${i}" value="${s.c}">
        <span class="kval">${fTL0((s.c||0)*(sikkePrice(s.t)||0))}</span></div>`;
    });
    h+=`<div class="ksec">Takı · 22 ayar <small>gramı gir</small></div>`;
    (k.taki||[]).forEach((t,i)=>{
      h+=`<div class="krow"><span class="kname">${t.n}</span>
        <input class="kin kg" type="number" inputmode="decimal" data-kt="${i}" value="${t.g||''}" placeholder="gr">
        <span class="kval">${t.g?fTL0((t.g||0)*(R.bilezik22||0)):"—"}</span></div>`;
    });
    const p=v=>v?("₺"+Math.round(v).toLocaleString("tr-TR")):"—";
    h+=`<div class="knote">gram ${p(R.gram)} · çeyrek ${p(R.ceyrek)} · yarım ${p(R.yarim)} · tam ${p(R.tam)} · 22a bilezik ${p(R.bilezik22)}/gr
      <button class="iconbtn" id="ratesRef" style="padding:5px 9px">⟳</button>
      <span class="ksrc" id="ksrc">${R.upd?("güncel · "+R.upd):"otomatik çekiliyor…"}</span></div></div>`;
  }
  h+=`<div class="grandrow"><span>TOPLAM BİRİKİM<br><small>banka + kasa</small></span><span class="gval">${fTL0(grandTL)}<br><small>${fE(grandTL/S.kur)}</small></span></div>`;
  el.innerHTML=h;
  document.getElementById("kHead").onclick=()=>{kasaOpen=!kasaOpen; renderKasa();};
  el.querySelectorAll("[data-kn]").forEach(inp=>inp.onchange=()=>{S.kasa.nakit[+inp.dataset.kn].a=parseFloat(inp.value)||0; save(); renderKasa();});
  el.querySelectorAll("[data-ks]").forEach(inp=>inp.onchange=()=>{S.kasa.sikke[+inp.dataset.ks].c=parseFloat(inp.value)||0; save(); renderKasa();});
  el.querySelectorAll("[data-kt]").forEach(inp=>inp.onchange=()=>{S.kasa.taki[+inp.dataset.kt].g=parseFloat(inp.value)||0; save(); renderKasa();});
  const rr=document.getElementById("ratesRef"); if(rr)rr.onclick=fetchRates;
}
async function fetchRates(){
  const el=document.getElementById("ksrc");
  try{
    const r=await fetch("https://finans.truncgil.com/today.json");
    const j=await r.json();
    const num=o=>{if(!o)return 0;let s=(o["Alış"]||o["Alis"]||o["Buying"]||"").toString();s=s.replace(/\./g,"").replace(",",".");const v=parseFloat(s);return isFinite(v)?v:0;};
    const R=S.rates||(S.rates=RATES_DEFAULT());
    R.USD=num(j["USD"])||R.USD; R.GBP=num(j["GBP"])||R.GBP;
    R.gram=num(j["gram-altin"])||R.gram; R.ceyrek=num(j["ceyrek-altin"])||R.ceyrek;
    R.yarim=num(j["yarim-altin"])||R.yarim; R.tam=num(j["tam-altin"])||R.tam;
    R.bilezik22=num(j["22-ayar-bilezik"])||R.bilezik22;
    R.upd=new Date().toLocaleDateString("tr-TR")+" "+new Date().toLocaleTimeString("tr-TR",{hour:"2-digit",minute:"2-digit"});
    save(); rerender();
  }catch(e){if(el)el.textContent="fiyat alınamadı — ⟳ ile tekrar dene";}
}
async function fetchKur(){
  const srcEl=document.getElementById("kurSrc");
  try{
    let rate=null;
    try{const r=await fetch("https://api.frankfurter.dev/v1/latest?base=EUR&symbols=TRY");
      const j=await r.json(); rate=j.rates&&j.rates.TRY;}catch(e){}
    if(!rate){const r2=await fetch("https://open.er-api.com/v6/latest/EUR");
      const j2=await r2.json(); rate=j2.rates&&j2.rates.TRY;}
    if(rate){
      S.kur=Math.round(rate*100)/100;
      if(srcEl)srcEl.textContent="otomatik güncellendi · "+new Date().toLocaleDateString("tr-TR");
      save(); rerender();
    }else if(srcEl){srcEl.textContent="otomatik kur alınamadı — elle gir";}
  }catch(e){if(srcEl)srcEl.textContent="otomatik kur alınamadı — elle gir";}
}

/* ---- bulut eşitleme (Firebase · veri sadece kursatkemalkul@gmail.com hesabına açık) ---- */
const FB_CONFIG={
  apiKey:"AIzaSyAffxPdRyYEvhlsHlDBlGf7g4iu2wnzf3c",
  authDomain:"gen-lang-client-0276539885.firebaseapp.com",
  projectId:"gen-lang-client-0276539885"
};
const CID=(()=>{try{let c=localStorage.getItem("nakit_cid");
  if(!c){c="c"+Date.now().toString(36)+Math.floor(Math.random()*1e6).toString(36);localStorage.setItem("nakit_cid",c);}
  return c;}catch(e){return "c0";}})();
const cloud={ref:null,applying:false,first:true};

function cloudStatus(txt,ok){
  let el=document.getElementById("cstat");
  if(!el){el=document.createElement("div");el.id="cstat";
    el.style.cssText="position:fixed;bottom:10px;right:10px;z-index:60;font-size:11px;padding:4px 10px;border-radius:12px;background:rgba(20,22,30,.85);color:#9aa3b5;border:1px solid rgba(255,255,255,.08);pointer-events:none;";
    document.body.appendChild(el);}
  el.textContent=txt; el.style.color=ok?"#5FBE8C":"#c2a35b";
}

function cloudPush(){
  if(!cloud.ref||cloud.applying)return;
  cloud.ref.set({data:JSON.stringify(S),cid:CID,mt:S._mt||Date.now()})
    .then(()=>cloudStatus("☁ eşitlendi",true))
    .catch(()=>cloudStatus("☁ bu hesabın erişimi yok",false));
}
function cloudApply(r){
  try{
    const d=JSON.parse(r.data);
    if(!d||!Array.isArray(d.items))return;
    const oldV=d.v||0;
    migrateUp(d);                       // bulut verisini de güncel sürüme taşı (sıralama/gruplar)
    cloud.applying=true; S=d;
    freezePast();                       // geçmiş ayları dondur (bu cihazda henüz donmadıysa)
    try{localStorage.setItem("nakit2026",JSON.stringify(S));}catch(e){}
    rerender(); cloud.applying=false;
    cloudStatus("☁ eşitlendi",true);
    if(oldV<10)cloudPush();             // bulut eski sürümdeyse güncellenmiş hali geri yaz
    histReset();                        // dıştan gelen veri geri-al geçmişini sıfırlar
  }catch(e){}
}
function startSync(){
  const db=firebase.firestore();
  cloud.ref=db.collection("nakit").doc("2026");
  cloud.ref.onSnapshot(snap=>{
    if(snap.metadata.hasPendingWrites)return;          // kendi yazmamızın yerel yankısı
    if(!snap.exists){cloudPush();return;}              // bulut boş → bu cihazdaki veriyi yükle
    const r=snap.data();
    if(cloud.first){cloud.first=false;
      if((r.mt||0)>=(S._mt||0))cloudApply(r); else cloudPush();  // ilk bağlantı: yeni olan kazanır
      return;}
    if(r.cid===CID)return;                             // kendi yazmamız → uygulama gerekmez
    cloudApply(r);
  },()=>cloudStatus("☁ bu hesabın erişimi yok",false));
}
function showGate(){
  if(document.getElementById("cloudGate"))return;
  const ov=document.createElement("div");
  ov.id="cloudGate";
  ov.style.cssText="position:fixed;inset:0;z-index:99;display:flex;align-items:center;justify-content:center;background:rgba(8,10,16,.96)";
  ov.innerHTML=`<div style="text-align:center;max-width:320px;padding:24px">
    <div style="font-size:40px;margin-bottom:10px">☁</div>
    <div style="color:#e7ecf5;font-size:17px;font-weight:600;margin-bottom:6px">2026 Nakit</div>
    <div style="color:#9aa3b5;font-size:13px;margin-bottom:20px">Kişisel bütçe — verilerin tüm cihazlarında eşitlenmesi için Google hesabınla giriş yap.</div>
    <button id="gBtn" style="font-size:15px;font-weight:600;padding:12px 22px;border-radius:10px;border:0;background:#e7ecf5;color:#10131c;cursor:pointer">Google ile Giriş</button>
    <div id="gErr" style="color:#c2a35b;font-size:12px;margin-top:12px"></div></div>`;
  document.body.appendChild(ov);
  document.getElementById("gBtn").onclick=()=>{
    firebase.auth().signInWithPopup(new firebase.auth.GoogleAuthProvider())
      .catch(e=>{document.getElementById("gErr").textContent="Giriş açılamadı — tekrar dene ("+(e.code||"hata")+")";});
  };
}
function authInit(){
  if(!window.firebase||!firebase.auth){cloudStatus("☁ çevrimdışı mod",false);return;}
  firebase.initializeApp(FB_CONFIG);
  try{firebase.firestore().enablePersistence({synchronizeTabs:true}).catch(()=>{});}catch(e){}
  firebase.auth().onAuthStateChanged(u=>{
    if(u){const g=document.getElementById("cloudGate");if(g)g.remove();
      cloudStatus("☁ bağlanıyor…",true); startSync();}
    else showGate();
  });
}

/* ---- geri al / ileri al (undo/redo) ---- */
let hist={undo:[],redo:[],prev:null,applying:false};
function snapState(){const c=Object.assign({},S);delete c._mt;delete c.rates;delete c.frozen;return JSON.stringify(c);}
function updateUndoUI(){
  const u=document.getElementById("undoBtn"),r=document.getElementById("redoBtn");
  if(u)u.disabled=!hist.undo.length;
  if(r)r.disabled=!hist.redo.length;
}
function histInit(){hist.prev=snapState();hist.undo=[];hist.redo=[];updateUndoUI();}
function histReset(){hist.prev=snapState();hist.undo=[];hist.redo=[];updateUndoUI();}
function histRecord(){
  if(hist.applying)return;
  const cur=snapState();
  if(cur===hist.prev)return;
  hist.undo.push(hist.prev);
  if(hist.undo.length>80)hist.undo.shift();
  hist.redo=[];
  hist.prev=cur;
  updateUndoUI();
}
function histApply(snapStr,msg){
  hist.applying=true;
  S=JSON.parse(snapStr); S._mt=Date.now(); hist.prev=snapStr;
  try{localStorage.setItem("nakit2026",JSON.stringify(S));}catch(e){}
  cloudPush(); rerender();
  hist.applying=false; updateUndoUI(); toast(msg);
}
function undo(){
  if(!hist.undo.length){toast("Geri alınacak bir şey yok");return;}
  hist.redo.push(hist.prev);
  histApply(hist.undo.pop(),"↩ Geri alındı");
}
function redo(){
  if(!hist.redo.length){toast("İleri alınacak bir şey yok");return;}
  hist.undo.push(hist.prev);
  histApply(hist.redo.pop(),"↪ İleri alındı");
}
function mountUndoBar(){
  const tb=document.querySelector(".topbar");
  if(!tb||document.getElementById("undobar"))return;
  const bar=document.createElement("div");
  bar.id="undobar"; bar.className="undobar";
  bar.innerHTML='<button id="undoBtn" class="ubtn" title="Geri al">↩</button><button id="redoBtn" class="ubtn" title="İleri al">↪</button>';
  tb.appendChild(bar);
  document.getElementById("undoBtn").onclick=undo;
  document.getElementById("redoBtn").onclick=redo;
  updateUndoUI();
}
document.addEventListener("keydown",e=>{
  const t=e.target,inF=t&&(t.tagName==="INPUT"||t.tagName==="TEXTAREA"||t.isContentEditable);
  if(inF)return;
  const k=(e.key||"").toLowerCase();
  if((e.ctrlKey||e.metaKey)&&!e.shiftKey&&k==="z"){e.preventDefault();undo();}
  else if((e.ctrlKey||e.metaKey)&&(k==="y"||(e.shiftKey&&k==="z"))){e.preventDefault();redo();}
});

/* ---- başlat ---- */
load();
freezePast();
rerender();
mountUndoBar();
histInit();
fetchKur();
fetchRates();
authInit();
