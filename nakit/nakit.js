/* ====== 2026 Nakit — paylaşılan model (takvim + gider yönetimi aynı veriyi kullanır) ====== */

const MN=["OCAK","ŞUBAT","MART","NİSAN","MAYIS","HAZİRAN","TEMMUZ","AĞUSTOS","EYLÜL","EKİM","KASIM","ARALIK"];
const MT=["Ocak","Şubat","Mart","Nisan","Mayıs","Haziran","Temmuz","Ağustos","Eylül","Ekim","Kasım","Aralık"];
const MS=["Oca","Şub","Mar","Nis","May","Haz","Tem","Ağu","Eyl","Eki","Kas","Ara"];
const COL=["#6366F1","#8B5CF6","#14B8A6","#10B981","#84CC16","#F59E0B","#F97316","#F43F5E","#06B6D4","#64748B","#3B82F6","#EF4444"];

/* Her grubun rengi: başlık tam renk, alt kalemler bu rengin soluk hali. */
const GCOL={
  "Gelirler":"#5FBE8C",
  "Ev & Yaşam (İtalya)":"#C25B6E",
  "Araç":"#5B9CC2",
  "Kürşat Evi":"#A07BC8",
  "Abonelikler":"#C79A5B",
  "Yıllık Giderler & Vergiler":"#C77B5B",
  "Ekstralar":"#8FA85B"
};
function gColor(key,gi){return GCOL[key]||COL[gi%COL.length];}
function rgbaOf(hex,a){const h=hex.replace("#","");
  return `rgba(${parseInt(h.slice(0,2),16)},${parseInt(h.slice(2,4),16)},${parseInt(h.slice(4,6),16)},${a})`;}

/* Grup sırası + tipi. items[].g bu anahtarlardan biri olur. */
const GROUPS=[
  {key:"Gelirler", t:"gelir"},
  {key:"Ev & Yaşam (İtalya)", t:"gider"},
  {key:"Araç", t:"gider"},
  {key:"Kürşat Evi", t:"gider"},
  {key:"Abonelikler", t:"gider"},
  {key:"Yıllık Giderler & Vergiler", t:"gider"},
  {key:"Ekstralar", t:"gider"}
];

/* Tek tip kalem: {id,t(gelir/gider),g(grup),n(ad),cur(E/T),a(tutar),months('all' | [aylar])} */
const DEFAULTS={
 v:2, kur:54.95, birikim:31000,
 items:[
  // --- gelirler ---
  {id:"g1",t:"gelir",g:"Gelirler",n:"Eslemisko Maaşı",cur:"T",a:316000,months:"all"},
  {id:"g2",t:"gelir",g:"Gelirler",n:"Changan Maaşı",cur:"E",a:3320,months:"all"},
  {id:"g3",t:"gelir",g:"Gelirler",n:"Eslem Evi 1 Kira Geliri",cur:"T",a:85000,months:"all"},
  {id:"g4",t:"gelir",g:"Gelirler",n:"Kürşat Evi Yıllık Kira",cur:"T",a:420000,months:[12]},
  {id:"g5",t:"gelir",g:"Gelirler",n:"Changan 13. Maaş",cur:"E",a:3320,months:[12]},
  {id:"g6",t:"gelir",g:"Gelirler",n:"Changan Bonus",cur:"E",a:1000,months:[12]},
  // --- Ev & Yaşam (İtalya) ---
  {id:"h1",t:"gider",g:"Ev & Yaşam (İtalya)",n:"Ev Kirası (İtalya)",cur:"E",a:1300,months:"all"},
  {id:"h2",t:"gider",g:"Ev & Yaşam (İtalya)",n:"Yemek",cur:"E",a:720,months:"all"},
  {id:"h3",t:"gider",g:"Ev & Yaşam (İtalya)",n:"Site Aidatı",cur:"E",a:300,months:"all"},
  {id:"h4",t:"gider",g:"Ev & Yaşam (İtalya)",n:"Elektrik",cur:"E",a:150,months:"all"},
  {id:"h5",t:"gider",g:"Ev & Yaşam (İtalya)",n:"Yemek (Kemal)",cur:"E",a:110,months:"all"},
  {id:"h6",t:"gider",g:"Ev & Yaşam (İtalya)",n:"İtalyanca Dersi",cur:"T",a:4000,months:"all"},
  {id:"h7",t:"gider",g:"Ev & Yaşam (İtalya)",n:"Saç Kesimi",cur:"E",a:37,months:"all"},
  {id:"h8",t:"gider",g:"Ev & Yaşam (İtalya)",n:"İnternet (İtalya)",cur:"E",a:25,months:"all"},
  // --- Araç ---
  {id:"a1",t:"gider",g:"Araç",n:"Benzin",cur:"E",a:300,months:"all"},
  // --- Kürşat Evi ---
  {id:"k1",t:"gider",g:"Kürşat Evi",n:"Konut Kredisi (kalan ₺42.000)",cur:"T",a:910,months:"all"},
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
  // --- Yıllık Giderler & Vergiler (taksitler çoklu ay) ---
  {id:"y1",t:"gider",g:"Yıllık Giderler & Vergiler",n:"Trafik Sigortası (Sara)",cur:"E",a:869,months:[2]},
  {id:"y2",t:"gider",g:"Yıllık Giderler & Vergiler",n:"MTV / Bollo",cur:"E",a:517,months:[2]},
  {id:"y3",t:"gider",g:"Yıllık Giderler & Vergiler",n:"Periyodik Bakım (servis)",cur:"E",a:800,months:[4]},
  {id:"y4",t:"gider",g:"Yıllık Giderler & Vergiler",n:"Eslemisko Gelir Vergisi (2 taksit)",cur:"T",a:145500,months:[5,7]},
  {id:"y5",t:"gider",g:"Yıllık Giderler & Vergiler",n:"Kürşat Kira Gelir Vergisi (2 taksit)",cur:"T",a:38500,months:[5,7]},
  {id:"y6",t:"gider",g:"Yıllık Giderler & Vergiler",n:"Eslem Evleri Emlak Vergisi (2 taksit)",cur:"T",a:19750,months:[5,11]},
  {id:"y7",t:"gider",g:"Yıllık Giderler & Vergiler",n:"Eslem Evleri DASK (2 ev)",cur:"T",a:3200,months:[5]},
  {id:"y8",t:"gider",g:"Yıllık Giderler & Vergiler",n:"Kürşat Evi Yangın Vergisi (2 taksit)",cur:"T",a:3220,months:[5,11]},
  {id:"y9",t:"gider",g:"Yıllık Giderler & Vergiler",n:"Kürşat Evi Emlak Vergisi (2 taksit)",cur:"T",a:3078,months:[5,11]},
  {id:"y10",t:"gider",g:"Yıllık Giderler & Vergiler",n:"Kürşat Evi DASK",cur:"T",a:1611,months:[5]},
  {id:"y11",t:"gider",g:"Yıllık Giderler & Vergiler",n:"Eslem Evleri Yangın Vergisi",cur:"T",a:0,months:[5]}
 ]
};

let S=null, editMode=false;
const openMonths=new Set(), openCats=new Set();
let openPicker=null;

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
function load(){
  let raw=null;
  try{raw=localStorage.getItem("nakit2026");}catch(e){}
  if(raw){
    try{
      const d=JSON.parse(raw);
      if(d&&d.v>=2&&Array.isArray(d.items)){S=d;return;}
      S=migrate(d); save(); return;
    }catch(e){}
  }
  S=JSON.parse(JSON.stringify(DEFAULTS));
}
let saveT=null;
function save(){
  clearTimeout(saveT);
  saveT=setTimeout(()=>{try{localStorage.setItem("nakit2026",JSON.stringify(S));}catch(e){}},350);
}

function monthCalc(m){
  let gI=0,gO=0;
  S.items.forEach(it=>{if(!appliesTo(it,m))return;const v=eur(it);if(it.t==="gelir")gI+=v;else gO+=v;});
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
function valHTML(it){
  if(!editMode)return `<span class="vl tap" data-id="${it.id}">${fNative(it)}</span>`;
  return `<input class="editv" type="number" value="${it.a}" data-id="${it.id}">`;
}
function renderCalendar(){
  const ki=document.getElementById("kurIn"); if(ki)ki.value=S.kur;
  const bi=document.getElementById("birIn"); if(bi)bi.value=S.birikim;
  const res=MN.map((_,i)=>monthCalc(i+1));
  const maxK=Math.max(...res.map(r=>r.k),1);
  document.getElementById("strip").innerHTML=res.map((r,i)=>
    `<div style="height:${Math.max(8,r.k>0?r.k/maxK*100:8)}%;background:${COL[i]}" title="${MN[i]}"></div>`).join("");

  const expGroups=groupList().filter(g=>g.t==="gider");
  let cum=S.birikim, html="";
  res.forEach((r,idx)=>{
    const m=idx+1; cum+=r.k;
    const col=COL[idx], open=openMonths.has(m)?" open":"";
    html+=`<div class="mcard${open}" data-m="${m}">
    <div class="mhead" data-mh="${m}">
      <div class="mbar" style="background:${col}"></div>
      <div class="mname">${MN[idx]}</div>
      <div><div class="mkalan">${fE(r.k)}</div>
      <div class="mbirik">birikim ${fE(cum)}</div></div>
      <div class="chev">▶</div>
    </div>
    <div class="mbody">
      <div class="sec in">GELEN · ${fE(r.gI)}</div>`;
    S.items.filter(i=>i.t==="gelir"&&appliesTo(i,m)).forEach(it=>{
      const star=it.months!=="all";
      html+=`<div class="it${star?" yr":""}"><span class="nm"${star?` style="color:${col}"`:""}>${star?"★ ":""}${it.n}${it.cur==="T"?' <small>₺</small>':""}</span>${valHTML(it)}</div>`;
    });
    html+=`<div class="sec out">GİDEN · ${fE(r.gO)}</div>`;
    expGroups.forEach(g=>{
      const items=S.items.filter(i=>i.g===g.key&&appliesTo(i,m));
      if(!items.length)return;
      const sum=items.reduce((s,i)=>s+eur(i),0);
      const ck=m+"_"+g.key, copen=openCats.has(ck)?" open":"";
      html+=`<div class="cat${copen}" data-cat="${escapeHtml(ck)}"><span>${g.key}<span class="cv">▶</span></span><span class="vl">${fE(sum)}</span></div><div class="catbody">`;
      items.forEach(it=>{
        const star=it.months!=="all";
        html+=`<div class="it"><span class="nm"${star?` style="color:${col}"`:""}>${star?"★ ":""}${it.n}${it.cur==="T"?' <small>₺</small>':""}</span>${valHTML(it)}</div>`;
      });
      html+=`</div>`;
    });
    html+=`<button class="addx" data-addx="${m}">+ Bu aya ekstra ekle</button>
    <div class="xform" id="xf${m}">
      <input placeholder="Açıklama (örn. tatil, tamirat)" id="xn${m}">
      <div class="half"><input type="number" placeholder="Tutar" id="xa${m}">
      <select id="xc${m}"><option value="T">₺</option><option value="E">€</option></select>
      <select id="xt${m}"><option value="gider">Gider</option><option value="gelir">Gelir</option></select></div>
      <button data-xsave="${m}">Ekle</button>
    </div>
    <div class="kalanrow"><span class="l">KALAN</span><span class="v">${fE(r.k)}</span></div>
    <div class="tlrow"><span>≈ TL karşılığı</span><span>${fT(r.k*S.kur)}</span></div>
    <div class="birrow"><span>TOPLAM BİRİKİM</span><span>${fE(cum)}</span></div>
    </div></div>`;
  });
  document.getElementById("months").innerHTML=html;

  const yI=res.reduce((s,r)=>s+r.gI,0), yO=res.reduce((s,r)=>s+r.gO,0);
  document.getElementById("yearbox").innerHTML=`<h2>YIL ÖZETİ</h2>
   <div class="it"><span class="nm">Yıllık Gelir</span><span class="vl" style="color:var(--in)">${fE(yI)}</span></div>
   <div class="it"><span class="nm">Yıllık Gider</span><span class="vl" style="color:var(--out)">${fE(yO)}</span></div>
   <div class="it"><span class="nm">Yıllık Birikim</span><span class="vl">${fE(yI-yO)}</span></div>
   <div class="it"><span class="nm" style="color:var(--gold)">Yıl Sonu Toplam Birikim</span><span class="vl" style="color:var(--gold)">${fE(S.birikim+yI-yO)}</span></div>`;
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
    const it=findItem(inp.dataset.id); if(it){it.a=parseFloat(inp.value)||0; save(); renderCalendar();}
  });
  document.querySelectorAll(".vl.tap").forEach(sp=>sp.onclick=e=>{
    e.stopPropagation();
    const it=findItem(sp.dataset.id); if(!it)return;
    const inp=document.createElement("input");
    inp.className="editv"; inp.type="number"; inp.value=it.a; inp.inputMode="decimal";
    sp.replaceWith(inp); inp.focus();
    let done=false;
    inp.onchange=()=>{done=true; it.a=parseFloat(inp.value)||0; save(); renderCalendar();
      toast(it.months==="all"?"Tüm aylara uygulandı ✓":"Kaydedildi ✓");};
    inp.onblur=()=>{if(!done)renderCalendar();};
  });
  document.querySelectorAll("[data-addx]").forEach(b=>b.onclick=()=>{
    document.getElementById("xf"+b.dataset.addx).classList.toggle("show");
  });
  document.querySelectorAll("[data-xsave]").forEach(b=>b.onclick=()=>{
    const m=+b.dataset.xsave;
    const n=document.getElementById("xn"+m).value.trim();
    const a=parseFloat(document.getElementById("xa"+m).value);
    if(!n||!a)return;
    S.items.push({id:newId(),t:document.getElementById("xt"+m).value,g:"Ekstralar",n,
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

  let totIn=0,totOut=0;
  S.items.forEach(it=>{const an=annual(it); if(it.t==="gelir")totIn+=an; else totOut+=an;});

  let html="";
  groupList().forEach((g,gi)=>{
    const items=S.items.filter(i=>i.g===g.key);
    if(!items.length && g.key==="Ekstralar")return;  // boş ekstralar grubunu gizle
    const gTot=items.reduce((s,i)=>s+annual(i),0);
    const share=g.t==="gider"&&totOut>0?gTot/totOut*100:0;
    const base=gColor(g.key,gi);
    const cTxt=rgbaOf(base,.72), cAmt=rgbaOf(base,.82), cCur=rgbaOf(base,.9), cBd=rgbaOf(base,.35);
    html+=`<div class="grp">
      <div class="grphead"><span class="grpname" style="color:${base}">${g.key}</span>
      <span class="grptot" style="color:${base}">${fE(gTot)}<small> /yıl</small></span></div>`;
    if(g.t==="gider")html+=`<div class="grpbar"><div style="width:${share}%;background:${base}"></div></div>`;
    items.forEach(it=>{
      const open=openPicker===it.id?" open":"";
      html+=`<div class="erow">
        <div class="erow-main">
          <input class="enm" value="${escapeHtml(it.n)}" data-id="${it.id}" style="color:${cTxt}">
          <input class="eamt" type="number" inputmode="decimal" value="${it.a}" data-id="${it.id}" style="color:${cAmt}">
          <button class="ecur" data-cur="${it.id}" style="color:${cCur};border-color:${cBd}">${it.cur==="E"?"€":"₺"}</button>
          <button class="edel" data-del="${it.id}">✕</button>
        </div>
        <div class="erow-meta">
          <span class="eeq">≈ ${fOther(it)}</span>
          <button class="emonths${open}" data-mp="${it.id}">${monthsLabel(it)}</button>
        </div>
        ${open?monthPickerHTML(it):""}
      </div>`;
    });
    html+=`<button class="addrow" data-add="${escapeHtml(g.key)}">+ ${g.t==="gelir"?"gelir":"gider"} ekle</button></div>`;
  });
  document.getElementById("groups").innerHTML=html;

  const net=totIn-totOut;
  document.getElementById("esum").innerHTML=`<h2>YIL ÖZETİ</h2>
   <div class="it"><span class="nm">Yıllık Gelir</span><span class="vl" style="color:var(--in)">${fE(totIn)}</span></div>
   <div class="it"><span class="nm">Yıllık Gider</span><span class="vl" style="color:var(--out)">${fE(totOut)}</span></div>
   <div class="it"><span class="nm">Yıllık Birikim</span><span class="vl">${fE(net)}</span></div>
   <div class="it"><span class="nm" style="color:var(--gold)">Yıl Sonu Toplam Birikim</span><span class="vl" style="color:var(--gold)">${fE(S.birikim+net)}</span></div>`;
  bindEditor();
}
function bindEditor(){
  document.querySelectorAll(".enm").forEach(inp=>inp.onchange=()=>{
    const it=findItem(inp.dataset.id); if(it){it.n=inp.value.trim()||it.n; save();}
  });
  document.querySelectorAll(".eamt").forEach(inp=>inp.onchange=()=>{
    const it=findItem(inp.dataset.id); if(it){it.a=parseFloat(inp.value)||0; save(); renderEditor();
      toast(it.months==="all"?"Tüm aylara uygulandı ✓":"Kaydedildi ✓");}
  });
  document.querySelectorAll(".ecur").forEach(b=>b.onclick=()=>{
    const it=findItem(b.dataset.cur); if(!it)return;
    if(it.cur==="E"){it.a=Math.round(it.a*S.kur*100)/100; it.cur="T";}
    else{it.a=Math.round(it.a/S.kur*100)/100; it.cur="E";}
    save(); renderEditor(); toast("Para birimi çevrildi ✓");
  });
  document.querySelectorAll("[data-mp]").forEach(b=>b.onclick=()=>{
    openPicker=openPicker===b.dataset.mp?null:b.dataset.mp; renderEditor();
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
    const g=groupList().find(x=>x.key===b.dataset.add)||{key:b.dataset.add,t:"gider"};
    const it={id:newId(),t:g.t,g:g.key,n:"Yeni kalem",cur:"T",a:0,months:"all"};
    S.items.push(it); openPicker=null; save(); renderEditor();
    setTimeout(()=>{const el=document.querySelector('.enm[data-id="'+it.id+'"]'); if(el){el.focus(); el.select();}},0);
  });
  wireSettings(renderEditor);
}

/* ---- ortak: kur / birikim ayar alanı + otomatik kur ---- */
function wireSettings(reRender){
  const kr=document.getElementById("kurRef"); if(kr)kr.onclick=fetchKur;
  const ki=document.getElementById("kurIn"); if(ki)ki.onchange=e=>{S.kur=parseFloat(e.target.value)||S.kur; save(); reRender();};
  const bi=document.getElementById("birIn"); if(bi)bi.onchange=e=>{S.birikim=parseFloat(e.target.value)||0; save(); reRender();};
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

/* ---- başlat ---- */
load();
rerender();
fetchKur();
