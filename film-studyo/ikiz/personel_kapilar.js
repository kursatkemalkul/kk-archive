// Shop door visual kinematics. No PLC commands or safety certification.
export function personelKapilarKur(T,g,D,liste,MAT,IKIZ={}){
 const legacy=/^DUKKAN__(HUCRE_KAPI_|KAPI_PERSONEL_|AZM40_)/;
 for(const o of [...g.children])if(legacy.test(o.name)){g.remove(o);o.traverse(m=>m.geometry?.dispose());}
 for(let i=liste.length-1;i>=0;i--)if(legacy.test('DUKKAN__'+liste[i].ad))liste.splice(i,1);
 const root=new T.Group();root.name='DUKKAN__PERSONEL_KAPILARI';g.add(root);
 function box(name,b,mat=MAT.kasa,parent=root){const m=new T.Mesh(new T.BoxGeometry(b[1]-b[0],b[3]-b[2],b[5]-b[4]),mat);m.name='DUKKAN__'+name;m.position.set((b[0]+b[1])/2,(b[2]+b[3])/2,(b[4]+b[5])/2);parent.add(m);return m;}
 const [h0,h1]=D.HUCRE_KAPI,z=D.HUCRE_DUVAR,plane=z+.012,H=D.HUCRE_KAPI_Y,width=h1-h0-.050;
 const slider=new T.Group();slider.name='DUKKAN__HUCRE_KAPI_MENTESE_KANAT';slider.position.set(h0+.025,0,plane);root.add(slider);
 const frost=new T.MeshStandardMaterial({color:0xc9d6dc,roughness:1,metalness:0,transparent:true,opacity:.88,depthWrite:true});
 box('HUCRE_KAPI_BUZLU_CAM',[.030,width-.030,.055,H-.055,-.012,-.004],frost,slider);
 for(const [name,b]of [['SOL',[0,.030,.015,H-.015,-.012,.012]],['SAG',[width-.030,width,.015,H-.015,-.012,.012]],['ALT',[.030,width-.030,.015,.055,-.012,.012]],['UST',[.030,width-.030,H-.055,H-.015,-.012,.012]]])box('HUCRE_KAPI_CERCEVE_'+name,b,MAT.kasa,slider);
 for(const side of [-1,1]){
  const zz=side*.012;
  box('HUCRE_KAPI_KOL_BAGLANTI_'+side,[width-.10,width-.08,.99,1.01,Math.min(zz,zz+side*.035),Math.max(zz,zz+side*.035)],MAT.paslanmaz,slider);
  box('HUCRE_KAPI_KOL_'+side,[width-.20,width-.08,.99,1.01,zz+side*.035-.008,zz+side*.035+.008],MAT.paslanmaz,slider);
 }
 for(const y of [.25,1.05,H-.25]){
  const h=new T.Mesh(new T.CylinderGeometry(.006,.006,.14,16),MAT.paslanmaz);h.name='DUKKAN__HUCRE_KAPI_MENTESE_'+y;h.position.set(h0+.025,y,plane);root.add(h);
  box('HUCRE_KAPI_MENTESE_YAPRAK_'+y,[0,.030,y-.05,y+.05,-.012,-.008],MAT.paslanmaz,slider);
  box('HUCRE_KAPI_MENTESE_SABIT_'+y,[h0+.005,h0+.021,y-.05,y+.05,plane,z+.020],MAT.paslanmaz);
 }
 for(const [name,x0,x1]of [['SOL',h0,h0+.020],['SAG',h1-.020,h1]])box('HUCRE_KAPI_KASA_'+name,[x0,x1,0,H,z,z+D.HUCRE_PANEL]);
 box('HUCRE_KAPI_KASA_UST',[h0+.020,h1-.020,H-.010,H,z,z+D.HUCRE_PANEL]);
 // Fixed lock at free edge; a thin key exits toward the staff room as the leaf opens.
 const lx=h1,ly=1.10,lz=plane-.010,keyY=ly+.040,keyZ=plane;
 for(const [name,b]of [['ARKA',[lx+.020,lx+.040,ly,ly+.1195,lz,lz+.020]],['ALT',[lx,lx+.020,ly,keyY-.003,lz,lz+.020]],['UST',[lx,lx+.020,keyY+.003,ly+.1195,lz,lz+.020]],['SOL',[lx,lx+.020,keyY-.003,keyY+.003,lz,keyZ-.003]],['SAG',[lx,lx+.020,keyY-.003,keyY+.003,keyZ+.003,lz+.020]]])box('HUCRE_KAPI_KILIT_'+name,b,MAT.panel);
 box('HUCRE_KAPI_KILIT_DUVAR_BAGLANTI',[lx,lx+.040,ly+.070,ly+.1195,plane+.010,z+.1665],MAT.paslanmaz);
 box('HUCRE_KAPI_HAREKETLI_DIL',[width-.002,width+.035,keyY-.002,keyY+.002,-.002,.002],MAT.paslanmaz,slider);
 const feedPoints=[[1.625,-.06,2.10],[lx+.020,-.06,z+.010],[lx+.020,keyY+.020,z+.010],[lx+.020,keyY+.020,plane-.010]].map(p=>new T.Vector3(...p));
 const feedPath=new T.CurvePath();for(let i=1;i<feedPoints.length;i++)feedPath.add(new T.LineCurve3(feedPoints[i-1],feedPoints[i]));
 const feed=new T.Mesh(new T.TubeGeometry(feedPath,24,.003,8,false),MAT.siyah);feed.name='DUKKAN__HUCRE_KAPI_DUVAR_ICI_KILIT_BESLEME';root.add(feed);
 const [p0,p1]=D.KAPI_P,KY=D.KAPI_Y,outer=new T.Group();outer.name='DUKKAN__KAPI_PERSONEL_KANAT_PIVOT';outer.position.set(p0+.015,0,D.CEPHE_DIS+.0365);root.add(outer);
 const ow=p1-p0-.030;
 box('KAPI_PERSONEL_KANAT',[0,ow,.015,KY-.025,-.0625,-.0175],MAT.kapi,outer);
 for(const side of [-1,1]){const zz=side===1?-.0175:-.0625;
  box('KAPI_PERSONEL_KOL_BAGLANTI_'+side,[ow-.12,ow-.10,.99,1.01,Math.min(zz,zz+side*.035),Math.max(zz,zz+side*.035)],MAT.paslanmaz,outer);
  box('KAPI_PERSONEL_KOL_'+side,[ow-.22,ow-.10,.99,1.01,zz+side*.035-.009,zz+side*.035+.009],MAT.paslanmaz,outer);
 }
 // Concealed hinge envelope: recess-mounted in the edge of the leaf. The
 // visible swing uses the clearance axis of the closed clad door (not OEM CAD).
 outer.userData.hingeReference='SIMONSWERK TECTUS concealed / clad flush door';
 outer.userData.hingeModel='simplified visual envelope, selection requires leaf mass';
 for(const y of [.25,1.05,KY-.25])box('KAPI_PERSONEL_GIZLI_MENTESE_'+y,[.001,.009,y-.080,y+.080,-.056,-.027],MAT.paslanmaz,outer);
 box('KAPI_PERSONEL_KASA_SOL',[p0,p0+.010,0,KY,D.CEPHE_IC,D.CEPHE_DIS]);box('KAPI_PERSONEL_KASA_SAG',[p1-.010,p1,0,KY,D.CEPHE_IC,D.CEPHE_DIS]);box('KAPI_PERSONEL_KASA_UST',[p0+.010,p1-.010,KY-.015,KY,D.CEPHE_IC,D.CEPHE_DIS]);
 const ease=x=>x*x*x*(x*(x*6-15)+10),state={ic:0,dis:0};
 function uygula(ic,dis){state.ic=Math.max(0,Math.min(1,ic));state.dis=Math.max(0,Math.min(1,dis));slider.rotation.y=-Math.PI/2*state.ic;outer.rotation.y=-Math.PI/2*state.dis;root.updateMatrixWorld(true);}
 let manualDis=null;const toggleDis=()=>{manualDis=!(manualDis??(tracks.dis.target>.5));return manualDis;};
 const tracks={ic:{value:0,start:0,target:0,t:0,duration:1.6,hold:0},dis:{value:0,start:0,target:0,t:0,duration:1.0,hold:0}};
 function tick(k,want,dt){const s=tracks[k];if(want)s.hold=1.2;else s.hold=Math.max(0,s.hold-dt);const target=want||s.hold>0?1:0;if(target!==s.target){s.start=s.value;s.target=target;s.t=0;}s.t=Math.min(s.duration,s.t+dt);s.value=s.start+(s.target-s.start)*ease(s.t/s.duration);return s.value;}
 function guncelle(kamPos,dt,gezintide){dt=Math.max(0,Math.min(.1,Number(dt)||0));const role=IKIZ.gezinti?.rol,staff=['personel','doldurma','patron'].includes(role),f=IKIZ.son;
  // Visual access gating only; no new real safety interlock is claimed.
  const idle=f&&['KAPALI','BOSTA','SERVIS','TEMIZLIK'].includes(f.hat)&&!f.kuyruk&&!f.robot?.gorev;
  const near=(a,b,z)=>Math.hypot(kamPos.x-(a+b)/2,kamPos.z-z)<1.05;
  if(manualDis===false)tracks.dis.hold=0;
  uygula(tick('ic',gezintide&&staff&&idle&&near(h0,h1,z),dt),tick('dis',manualDis??(gezintide&&staff&&near(p0,p1,D.CEPHE_DIS)),dt));
  return {ic:state.ic,personel:state.dis,ic_tur:'personel tarafına açılan menteşeli buzlu cam',ic_giris_uygun:!!idle};
 }
 uygula(0,0);return {guncelle,uygula,toggleDis,state,slider,leaves:[slider],outer,acilma_acisi:90,not:'Görsel erişim hareketi; PLC güvenlik kabulü değildir'};
}
