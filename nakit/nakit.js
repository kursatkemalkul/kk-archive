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
  "Vergiler":"#C77B5B",
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
  {key:"Vergiler", t:"gider"},
  {key:"Ekstralar", t:"gider"}
];

/* Tek tip kalem: {id,t(gelir/gider),g(grup),n(ad),cur(E/T),a(tutar),months('all' | [aylar])} */
const DEFAULTS={
 v:5, kur:54.95, birikim:31000,
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
  // --- Diğer Evler (Türkiye): bu evlerin vergi/kredi giderleri ---
  {id:"k1",t:"gider",g:"Diğer Evler (Türkiye)",n:"Kürşat Evi — Konut Kredisi (kalan ₺42.000)",cur:"T",a:910,months:"all"},
  {id:"y5",t:"gider",g:"Diğer Evler (Türkiye)",n:"Kürşat Evi — Kira Gelir Vergisi (2 taksit)",cur:"T",a:38500,months:[5,7]},
  {id:"y6",t:"gider",g:"Diğer Evler (Türkiye)",n:"Eslem Evleri — Emlak Vergisi (2 taksit)",cur:"T",a:19750,months:[5,11]},
  {id:"y7",t:"gider",g:"Diğer Evler (Türkiye)",n:"Eslem Evleri — DASK (2 ev)",cur:"T",a:3200,months:[5]},
  {id:"y8",t:"gider",g:"Diğer Evler (Türkiye)",n:"Kürşat Evi — Yangın Vergisi (2 taksit)",cur:"T",a:3220,months:[5,11]},
  {id:"y9",t:"gider",g:"Diğer Evler (Türkiye)",n:"Kürşat Evi — Emlak Vergisi (2 taksit)",cur:"T",a:3078,months:[5,11]},
  {id:"y10",t:"gider",g:"Diğer Evler (Türkiye)",n:"Kürşat Evi — DASK",cur:"T",a:1611,months:[5]},
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
  // --- Vergiler (maaş/gelir vergisi) ---
  {id:"y4",t:"gider",g:"Vergiler",n:"Eslemisko Gelir Vergisi (2 taksit)",cur:"T",a:145500,months:[5,7]}
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
function load(){
  let raw=null;
  try{raw=localStorage.getItem("nakit2026");}catch(e){}
  if(raw){
    try{
      const d=JSON.parse(raw);
      if(d&&d.v>=2&&Array.isArray(d.items)){
        S=d; let changed=false;
        if(S.v<3){remapGroups(S); changed=true;}
        if(S.v<4){remapV4(S); changed=true;}
        if(S.v<5){remapV5(S); changed=true;}
        if(changed)save();
        return;
      }
      S=remapV5(remapV4(remapGroups(migrate(d)))); save(); return;
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
  },350);
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

  const expGroups=groupList().filter(g=>g.t!=="gelir");
  const grpOpts=groupList().map(g=>`<option value="${escapeHtml(g.key)}"${g.key==="Ekstralar"?" selected":""}>${escapeHtml(g.key)}</option>`).join("");
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
      html+=`<div class="it${star?" yr":""}"><span class="nm"${star?` style="color:${col}"`:""}>${star?"★ ":""}${escapeHtml(it.n)}${it.cur==="T"?' <small>₺</small>':""}</span>${valHTML(it)}</div>`;
    });
    html+=`<div class="sec out">GİDEN · ${fE(r.gO)}</div>`;
    expGroups.forEach(g=>{
      const items=S.items.filter(i=>i.g===g.key&&i.t==="gider"&&appliesTo(i,m));
      if(!items.length)return;
      const sum=items.reduce((s,i)=>s+eur(i),0);
      const ck=m+"_"+g.key, copen=openCats.has(ck)?" open":"";
      html+=`<div class="cat${copen}" data-cat="${escapeHtml(ck)}"><span>${escapeHtml(g.key)}<span class="cv">▶</span></span><span class="vl">${fE(sum)}</span></div><div class="catbody">`;
      items.forEach(it=>{
        const star=it.months!=="all";
        html+=`<div class="it"><span class="nm"${star?` style="color:${col}"`:""}>${star?"★ ":""}${escapeHtml(it.n)}${it.cur==="T"?' <small>₺</small>':""}</span>${valHTML(it)}</div>`;
      });
      html+=`</div>`;
    });
    html+=`<button class="addx" data-addx="${m}">+ Bu aya ekstra ekle</button>
    <div class="xform" id="xf${m}">
      <input placeholder="Açıklama (örn. tatil, tamirat)" id="xn${m}">
      <select id="xg${m}">${grpOpts}</select>
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
    let inSum=0,outSum=0;
    items.forEach(i=>{const an=annual(i); if(i.t==="gelir")inSum+=an; else outSum+=an;});
    const base=gColor(g.key,gi);
    const cTxt=rgbaOf(base,.72);
    const share=totOut>0?outSum/totOut*100:0;
    const totVal=g.t==="gelir"?inSum:outSum;
    html+=`<div class="grp">
      <div class="grphead"><span class="grpname" style="color:${base}">${escapeHtml(g.key)}</span>
      <span class="grptot" style="color:${base}">${fE(totVal)}<small> /yıl</small></span></div>`;
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
      html+=`<div class="ewrap" data-id="${it.id}">
        <div class="erow">
          <span class="dh" data-dh="${it.id}" title="Sürükle">⠿</span>
          <input class="enm" value="${escapeHtml(it.n)}" data-id="${it.id}" style="color:${cTxt}">
          <div class="val tl ${it.cur==='T'?'paid':'calc'}">${tlCell}</div>
          <div class="val eur ${it.cur==='E'?'paid':'calc'}">${eurCell}</div>
          <button class="emonths${open}" data-mp="${it.id}">${monthsLabel(it)}</button>
          <button class="edel" data-del="${it.id}">✕</button>
        </div>
        ${open?monthPickerHTML(it):""}
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
   <div class="it"><span class="nm">Yıllık Birikim</span><span class="vl">${fE(net)}</span></div>
   <div class="it"><span class="nm" style="color:var(--gold)">Yıl Sonu Toplam Birikim</span><span class="vl" style="color:var(--gold)">${fE(S.birikim+net)}</span></div>`;
  bindEditor();
}
function bindEditor(){
  document.querySelectorAll(".enm").forEach(inp=>inp.onchange=()=>{
    const it=findItem(inp.dataset.id); if(it){it.n=inp.value.trim()||it.n; save();}
  });
  document.querySelectorAll(".vnum.ed").forEach(sp=>sp.onclick=()=>{
    const it=findItem(sp.dataset.ed); if(!it)return;
    const inp=document.createElement("input");
    inp.type="number"; inp.inputMode="decimal"; inp.value=it.a; inp.className="vedit";
    sp.replaceWith(inp); inp.focus(); inp.select();
    let done=false;
    inp.onchange=()=>{done=true; it.a=parseFloat(inp.value)||0; save(); renderEditor();
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
    cloud.applying=true; S=d;
    try{localStorage.setItem("nakit2026",r.data);}catch(e){}
    rerender(); cloud.applying=false;
    cloudStatus("☁ eşitlendi",true);
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

/* ---- başlat ---- */
load();
rerender();
fetchKur();
authInit();
