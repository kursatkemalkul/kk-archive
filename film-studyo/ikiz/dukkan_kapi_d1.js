// D1 (YONETICI 22 Eki, Kemal: "kapi kolunu gercek yap · kapilarda cok bosluk var, aradan iceri gozukuyor").
// Personel dis kapisi: Hoppe Amsterdam E1400Z/3332ZA/3310 F69 koruma takimi (ES1 DIN 18257, plaka 54x250x15, PZ 72, kol 125, kapi 42-47 mm).
// Butun menteseli dukkan kapilari: kasaya bindirme (stop) + EPDM fitil + kanat altinda otomatik dusen esik contasi -> kasa-kanat arasindan iceri bakis yok.
// Cephe olcusu/konumu degismez; kanat, kasa ve menteseler oldugu gibi kalir.
export function dukkanKapiD1(T,g,D,liste,MAT,IKIZ={}){
 const root=new T.Group();root.name='DUKKAN__D1_KAPI';g.add(root);
 const inox=MAT.paslanmaz,brushed=new T.MeshStandardMaterial({color:0xc4c8cc,metalness:.35,roughness:.35}),epdm=MAT.siyah,dark=new T.MeshStandardMaterial({color:0x2a2c2e,roughness:.45,metalness:.6});
 const added=[];
 function box(name,b,mat,parent=root){const m=new T.Mesh(new T.BoxGeometry(b[1]-b[0],b[3]-b[2],b[5]-b[4]),mat);m.name='DUKKAN__D1_'+name;m.position.set((b[0]+b[1])/2,(b[2]+b[3])/2,(b[4]+b[5])/2);parent.add(m);added.push(m);return m;}
 function cyl(name,r,c,axis,len,mat,parent){const m=new T.Mesh(new T.CylinderGeometry(r,r,len,32),mat);if(axis==='z')m.rotation.x=Math.PI/2;if(axis==='x')m.rotation.z=Math.PI/2;m.position.set(...c);m.name='DUKKAN__D1_'+name;parent.add(m);added.push(m);return m;}
 const report={};
 // 1) Personel dis kapisi (DUKKAN__KAPI_PERSONEL_KANAT_PIVOT, disa acilir, mentese solda).
 const outer=g.getObjectByName('DUKKAN__KAPI_PERSONEL_KANAT_PIVOT');
 if(outer){
  let removed=0;for(const o of [...outer.children])if(/^DUKKAN__KAPI_PERSONEL_KOL(_BAGLANTI)?_-?1$/.test(o.name)){o.removeFromParent();o.geometry?.dispose();removed++;}
  const [p0,p1]=D.KAPI_P,KY=D.KAPI_Y,oz=outer.position.z,ow=p1-p0-.030;
  // leaf local: x 0..ow, y .015..KY-.025, z -.0625..-.0175 (45 mm). Outer flute face = world 3.015.
  const zIn=-.0625,zFl=3.015-oz,sx=ow-.055,sy=1.05,cy=sy-.072;   // backset 55 (DIN 18251 mortise lock), handle height 1050 (DIN 18101), PZ 72
  const pc=(sy+cy)/2;
  box('HOPPE_3332ZA_DIS_PLAKA',[sx-.027,sx+.027,pc-.125,pc+.125,zFl,zFl+.015],brushed,outer);
  box('HOPPE_3310_IC_PLAKA',[sx-.027,sx+.027,pc-.125,pc+.125,zIn-.015,zIn],brushed,outer);
  for(const [side,z0,dir]of [['DIS',zFl+.015,1],['IC',zIn-.015,-1]]){
   cyl('HOPPE_E1400Z_BOYUN_'+side,.0095,[sx,sy,z0+dir*.0195],'z',.039,inox,outer);
   cyl('HOPPE_E1400Z_KOL_'+side,.0095,[sx-.0625+.0095,sy,z0+dir*.0485],'x',.125,inox,outer);
   cyl('PZ_SILINDIR_'+side,.0085,[sx,cy,z0+dir*.001],'z',.002,dark,outer);
  }
  // otomatik dusen esik contasi (Athmer Schall-Ex L-15/30 sinifi, kanat alt kanalinda; kapanınca esige oturur)
  box('KAPI_PERSONEL_DUSEN_CONTA',[.010,ow-.010,.005,.015,-.0495,-.0295],epdm,outer);
  // kasa bindirmesi + fitil (ic tarafta, kanat disa acildigi icin hareketi kesmez)
  const zl=oz+zIn;  // kanat ic yuzu (dunya)
  box('KAPI_PERSONEL_BINDIRME_SOL',[p0+.010,p0+.030,0,KY-.015,zl-.024,zl-.002],brushed);
  box('KAPI_PERSONEL_BINDIRME_SAG',[p1-.030,p1-.010,0,KY-.015,zl-.024,zl-.002],brushed);
  box('KAPI_PERSONEL_BINDIRME_UST',[p0+.010,p1-.010,KY-.040,KY-.015,zl-.024,zl-.002],brushed);
  box('KAPI_PERSONEL_FITIL_SOL',[p0+.018,p0+.028,.015,KY-.030,zl-.002,zl],epdm);
  box('KAPI_PERSONEL_FITIL_SAG',[p1-.028,p1-.018,.015,KY-.030,zl-.002,zl],epdm);
  box('KAPI_PERSONEL_FITIL_UST',[p0+.028,p1-.028,KY-.038,KY-.028,zl-.002,zl],epdm);
  box('KAPI_PERSONEL_ESIK_PLAKA',[p0+.010,p1-.010,0,.005,D.CEPHE_IC,D.CEPHE_DIS],brushed);
  outer.userData.handle='HOPPE Amsterdam E1400Z/3332ZA/3310 F69 · ES1 DIN 18257 · PZ 72 · kapı 42–47';
  report.personel={handleRemoved:removed,leaf_mm:45,gaps_mm:{sides:5,top:10,bottom:15},closedBy:'bindirme 15 + EPDM fitil + düşen eşik contası'};
 }
 // 2) Hucre kapisi (buzlu cam, personel tarafina acilir): ayni kural.
 const slider=g.getObjectByName('DUKKAN__HUCRE_KAPI_MENTESE_KANAT');
 if(slider){
  const [h0,h1]=D.HUCRE_KAPI,z=D.HUCRE_DUVAR,H=D.HUCRE_KAPI_Y,width=h1-h0-.050,zl=z;   // kanat arka yuzu = plane-.012 = z
  box('HUCRE_KAPI_BINDIRME_SOL',[h0+.020,h0+.040,0,H-.010,zl-.022,zl-.002],brushed);
  box('HUCRE_KAPI_BINDIRME_SAG',[h1-.040,h1-.020,0,H-.010,zl-.022,zl-.002],brushed);
  box('HUCRE_KAPI_BINDIRME_UST',[h0+.020,h1-.020,H-.030,H-.010,zl-.022,zl-.002],brushed);
  box('HUCRE_KAPI_FITIL_SOL',[h0+.028,h0+.038,.015,H-.025,zl-.002,zl],epdm);
  box('HUCRE_KAPI_FITIL_SAG',[h1-.038,h1-.028,.015,H-.025,zl-.002,zl],epdm);
  box('HUCRE_KAPI_FITIL_UST',[h0+.038,h1-.038,H-.028,H-.018,zl-.002,zl],epdm);
  box('HUCRE_KAPI_DUSEN_CONTA',[.010,width-.010,.003,.015,-.008,.008],epdm,slider);
  report.hucre={gaps_mm:{sides:5,top:5,bottom:15},closedBy:'bindirme 15 + EPDM fitil + düşen eşik contası'};
 }
 root.traverse(o=>{if(o.isMesh)o.userData={...o.userData,d1:true,productionRelease:false};});
 const metadata={revision:'D1',handle:'HOPPE Amsterdam E1400Z/3332ZA/3310 F69',meshes:added.length,...report};
 document.documentElement.dataset.d1kapi=JSON.stringify(metadata);
 IKIZ.d1Kapi={root,added,metadata};
 liste.push({ad:'D1_KAPI_DONANIM',tur:'kapi',kutu:[D.KAPI_P[0],D.KAPI_P[1],0,D.KAPI_Y,D.CEPHE_IC-.06,D.CEPHE_DIS+.09]});
 return IKIZ.d1Kapi;
}
