// Dükkân yapısı 31 (1 Kas 2026): duvarlar, cephe, bar gövdesi, dış tezgâh ve saçak zeminde çizilen plandan
// tek seferde, temiz yükseltilerek (extrude) kurulur. SHELL82 pişmiş ağının yerini alır: o ağda 348 ince
// bozuk üçgen, odayı çaprazlayan kesik ve bar tezgâhı ucunda şişkin parça vardı (kapalı katı değildi).
// Ölçüler yerleşim 84'ün kendisi: dış 0,436…5,460 × −1,220…3,002, yükseklik 2,80; bar köşesi R200 (merkez
// 2,957 / 2,802), ayırıcı 3,117–3,157, QR üst kuşağı z 2,005–2,105, saçak altı 2,392, cam bandı 1,015–2,050.
// Dış ölçü, ön düzlem, kapı / cam / kiosk / pano yerleri DEĞİŞMEZ; yalnız geometri temiz yeniden üretilir.
import {duvarBirlesikGeometri} from './dukkan_plan.js';
import {retireGeometry90} from './retired_geometry90.js';
export const YAPI31={H:2.80,L:[.436,.536],R:[5.360,5.460],ARKA:[-1.220,-1.120],ON:[2.883,3.002],BAR_IC_ON:2.902,
 BAR:{cx:2.957,cz:2.802,ri:.100,ro:.200,x0:1.770,ayirici:[3.117,3.157],cam:[1.015,2.050],raf:[.915,1.015],rafCikma:.225,rafX0:1.790},
 SACAK:2.392,QR_KUSAK:[2.005,2.105,2.200],KEMER:{cx:5.168,cy:2.200,r:.192},
 KAPI_P:[.686,1.586,2.100],HUCRE:{z:[1.500,1.600],kapi:[.686,1.586,2.030]},YIKAMA:{x:[1.864,1.884],arka:[2.328,2.348]},
 KIOSK_CEP:[5.360,5.430,.850,1.877,2.250,2.700],PANO_BOSLUK:[5.359,5.425,.995,1.705,.655,1.265],
 PANO_DX:-.156,PANO_DZ:0,SALTER_DX:-.050,SALTER_DY:-.880,SALTER_DZ:1.795,DIS_SINIR:5.455,RAY_Z:.960};   // sağ duvar donanımı: eski dış yüz 5,576'ya göre konmuştu → duvar içine çekilir (dış yüzde çıkıntı yok)
export function dukkanYapi31(T,I){
 if(I.dukkanYapi31)return I.dukkanYapi31;
 const S=I.sahne,scene=S.scene,g=scene.getObjectByName('IKIZ_DUKKAN'),wall=g?.getObjectByName('DUKKAN__TEK_PARCA_DUVAR');
 if(!wall)throw Error('Yapı31: DUKKAN__TEK_PARCA_DUVAR yok');
 const Y=YAPI31,B=Y.BAR,H=Y.H,[l0,l1]=Y.L,[r0,r1]=Y.R,[b0,b1]=Y.ARKA,[ci,cd]=Y.ON,[a0,a1]=B.ayirici,[c0,c1]=B.cam,[w0,w1]=Y.YIKAMA.x,[k0,k1]=Y.YIKAMA.arka,[h0,h1]=Y.HUCRE.z;
 // ---------- 1) dik açılı duvarlar: tek birleşik katı (iç yüz yok)
 const V=[
  [l0,l1,0,H,b0,cd],[l1,r0,0,H,b0,b1],[r0,r1,0,H,b0,cd],                         // sol / arka / sağ (U)
  [l1,Y.KAPI_P[0],0,H,ci,cd],[Y.KAPI_P[0],Y.KAPI_P[1],Y.KAPI_P[2],H,ci,cd],         // cephe sol + personel kapısı üstü
  [Y.KAPI_P[1],B.x0,0,H,ci,cd],                                                    // kapı ile bar camı arası dikme
  [l1,Y.HUCRE.kapi[0],0,H,h0,h1],[Y.HUCRE.kapi[0],Y.HUCRE.kapi[1],Y.HUCRE.kapi[2],H,h0,h1],[Y.HUCRE.kapi[1],w1,0,H,h0,h1], // robot odası bölmesi 100 mm + hücre kapısı (SZ40 kilidi ve uyarı levhaları 1,600 yüzünde)
  [w0,w1,0,H,1.600,k1],[w1,a0,0,H,k0,k1],[a0,a1,0,H,1.668,k1],                         // yıkama L duvarı + ayırıcı
  [a1,r0,Y.QR_KUSAK[2],H,Y.QR_KUSAK[0],Y.QR_KUSAK[1]],                              // QR dolabı üst kuşağı
  [a1,r0,Y.SACAK,H,Y.QR_KUSAK[1],cd]];                                               // müşteri cebi saçağı (alt yüz 2,392)
 const geos=[duvarBirlesikGeometri(T,V,[Y.KIOSK_CEP,Y.PANO_BOSLUK])];
 // ---------- 2) eğri parçalar: plan çizimi (x, z) → y boyunca extrude
 const SEG=48;
 function plan(y0,y1,shape){
  const q=new T.ExtrudeGeometry(shape,{depth:y1-y0,bevelEnabled:false,curveSegments:SEG}),p=q.attributes.position;
  for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getY(i),y=p.getZ(i);p.setXYZ(i,x,y0+y,z);}
  // (x, z) düzleminden y'ye çevirme el değiştirir: üçgen yönü ters çevrilir
  for(let i=0;i<p.count;i+=3){const ax=p.getX(i+1),ay=p.getY(i+1),az=p.getZ(i+1);p.setXYZ(i+1,p.getX(i+2),p.getY(i+2),p.getZ(i+2));p.setXYZ(i+2,ax,ay,az);}
  q.deleteAttribute('uv');q.deleteAttribute('normal');return q;
 }
 // bar gövdesi: düz ön (1,770 → 2,957) + R200 köşe + ayırıcıya inen yan; iç yüz tezgâh arka hattı (3,057 / 3,117)
 function barGovde(kare){
  const s=new T.Shape();s.moveTo(B.x0,cd);
  if(kare)s.lineTo(a1,cd);else{s.lineTo(B.cx,cd);s.absarc(B.cx,B.cz,B.ro,Math.PI/2,0,true);}
  s.lineTo(a1,k1);s.lineTo(a0,k1);s.lineTo(B.cx+B.ri,2.450);s.lineTo(B.cx+B.ri,B.cz);s.absarc(B.cx,B.cz,B.ri,0,Math.PI/2,false);s.lineTo(B.x0,Y.BAR_IC_ON);s.closePath();return s;
 }
 geos.push(plan(0,c0,barGovde(false)),plan(c1,Y.SACAK,barGovde(false)),plan(Y.SACAK,H,barGovde(true)));
 // dış bar tezgâhı (raf): bar ön yüzünden 225 mm çıkma, köşeyi döner, müşteri cebine radyal kesimle biter (dolap kapakları önü boş)
 {const s=new T.Shape(),ro=B.ro+B.rafCikma;s.moveTo(B.rafX0,cd);s.lineTo(B.cx,cd);s.absarc(B.cx,B.cz,B.ro,Math.PI/2,0,true);s.lineTo(B.cx+ro,B.cz);s.absarc(B.cx,B.cz,ro,0,Math.PI/2,false);s.lineTo(B.rafX0,cd+B.rafCikma);s.closePath();geos.push(plan(B.raf[0],B.raf[1],s));}
 // saçak sağ kemeri: saçak altı (2,392) sağ kolona R192 iç bükey döner, z 2,105 → 3,002
 {const K=Y.KEMER,s=new T.Shape();s.moveTo(r0,K.cy);s.lineTo(r0,Y.SACAK);s.lineTo(K.cx,Y.SACAK);s.absarc(K.cx,K.cy,K.r,Math.PI/2,0,true);s.closePath();
  const q=new T.ExtrudeGeometry(s,{depth:cd-Y.QR_KUSAK[1],bevelEnabled:false,curveSegments:SEG});q.translate(0,0,Y.QR_KUSAK[1]);q.deleteAttribute('uv');q.deleteAttribute('normal');geos.push(q);}
 // ---------- 3) tek geometri, düz yüz normalleri; yay yüzlerinde yumuşak (radyal) normal
 const pos=[];for(const q of geos){const n=q.index?q.toNonIndexed():q,p=n.attributes.position;for(let i=0;i<p.count;i++)pos.push(p.getX(i),p.getY(i),p.getZ(i));}
 const nT=pos.length/9,nor=new Float32Array(pos.length),va=new T.Vector3(),vb=new T.Vector3(),vc=new T.Vector3(),fn=new T.Vector3();
 const yaylar=[[B.cx,B.cz,B.ro,1],[B.cx,B.cz,B.ri,-1],[B.cx,B.cz,B.ro+B.rafCikma,1]];
 const mat=new Uint8Array(nT);let sacakAlti=0;
 for(let t=0;t<nT;t++){
  va.fromArray(pos,t*9);vb.fromArray(pos,t*9+3);vc.fromArray(pos,t*9+6);fn.subVectors(vc,vb).cross(vb.clone().sub(va)).normalize().negate();
  for(let k=0;k<3;k++){let nx=fn.x,ny=fn.y,nz=fn.z;
   const x=pos[t*9+k*3],z=pos[t*9+k*3+2];
   if(Math.abs(ny)<.2&&x>B.cx-1e-6&&z>B.cz-1e-6)for(const[cx,cz,r,sgn]of yaylar){const d=Math.hypot(x-cx,z-cz);if(Math.abs(d-r)<2e-5&&(nx*(x-cx)+nz*(z-cz))*sgn>0){nx=sgn*(x-cx)/d;ny=0;nz=sgn*(z-cz)/d;break;}}
   if(Math.abs(ny)<.2&&x>Y.KEMER.cx-1e-6&&pos[t*9+k*3+1]>Y.KEMER.cy-1e-6){const y=pos[t*9+k*3+1],d=Math.hypot(x-Y.KEMER.cx,y-Y.KEMER.cy);if(Math.abs(d-Y.KEMER.r)<2e-5){nx=-(x-Y.KEMER.cx)/d;ny=-(y-Y.KEMER.cy)/d;nz=0;}}
   nor[t*9+k*3]=nx;nor[t*9+k*3+1]=ny;nor[t*9+k*3+2]=nz;}
  // malzeme: yüzün önündeki hava dışarısı mı (turuncu; müşteri cebi tavanı dahil), içerisi mi (beyaz)
  const c=va.clone().add(vb).add(vc).multiplyScalar(1/3),p=c.clone().addScaledVector(fn,.004);
  const cep=p.x>a1-1e-4&&p.x<r0&&p.z>Y.QR_KUSAK[1]-1e-4&&p.y<Y.SACAK+1e-4;
  const barDis=p.x>B.cx&&p.z>B.cz&&Math.hypot(p.x-B.cx,p.z-B.cz)>B.ro-1e-4;
  if(p.y>H-1e-4)mat[t]=(c.x<l1||c.x>r0||c.z<b1||c.z>ci-1e-4||(c.x>a0&&c.z>Y.QR_KUSAK[0]))?1:0;
  else if(cep&&fn.y<-.9){mat[t]=1;sacakAlti++;}   // saçak altı: dış yüz (turuncu); sahnedeki malzeme sistemi duvarı 2 malzemeyle tutar
  else mat[t]=(p.x<l1||p.x>r0||p.z<b1||p.z>cd-3e-3||cep||barDis)?1:0;
 }
 // malzeme sırasıyla grupla (beyaz / turuncu)
 const P2=new Float32Array(pos.length),N2=new Float32Array(pos.length),groups=[];let w=0;
 for(const m of[0,1]){const start=w;for(let t=0;t<nT;t++)if(mat[t]===m){P2.set(pos.slice(t*9,t*9+9),w*9);N2.set(nor.subarray(t*9,t*9+9),w*9);w++;}groups.push([start*3,(w-start)*3,m]);}
 let geo=new T.BufferGeometry();geo.setAttribute('position',new T.BufferAttribute(P2,3));geo.setAttribute('normal',new T.BufferAttribute(N2,3));
 for(const[s,n,m]of groups)if(n)geo.addGroup(s,n,m);
 // dünya koordinatında çizildi → duvarın kendi uzayına
 wall.updateWorldMatrix(true,false);geo.applyMatrix4(new T.Matrix4().copy(wall.matrixWorld).invert());geo.computeBoundingBox();geo.computeBoundingSphere();
 const eski=Array.isArray(wall.material)?wall.material:[wall.material],white=eski[0],orange=eski[1]||eski[0];
 const old=wall.geometry;wall.geometry=geo;old.dispose();wall.material=[white,orange];
 I.dukkanTemiz29?.gradient30?.apply(wall,true);
 const edges=g.getObjectByName('DUKKAN__DUVAR_KOSE_CIZGILERI');if(edges){edges.geometry.dispose();edges.geometry=new T.EdgesGeometry(wall.geometry,35);}
 // ---------- 4) kapı kasaları duvar kalınlığını tam kaplar (cephe 119, bölme 100): kasa yüzü duvar yüzüyle aynı
 const kasa=[];
 function kasaUzat(ad,z0,z1){const o=g.getObjectByName(ad);if(!o?.isMesh)return;o.updateWorldMatrix(true,false);
  const e=new T.Matrix4().extractRotation(o.matrixWorld);if(Math.abs(e.elements[0]-1)>1e-6||Math.abs(e.elements[5]-1)>1e-6||Math.abs(e.elements[10]-1)>1e-6)return;
  const bb=new T.Box3().setFromObject(o),q=new T.BoxGeometry(bb.max.x-bb.min.x,bb.max.y-bb.min.y,z1-z0);
  q.translate((bb.min.x+bb.max.x)/2,(bb.min.y+bb.max.y)/2,(z0+z1)/2);q.applyMatrix4(new T.Matrix4().copy(o.matrixWorld).invert());o.geometry.dispose();o.geometry=q;kasa.push(ad);}
 for(const s of['SOL','SAG','UST'])kasaUzat('DUKKAN__KAPI_PERSONEL_KASA_'+s,ci,cd);
 for(const s of['SOL','SAG','UST'])kasaUzat('DUKKAN__HUCRE_KAPI_KASA_'+s,h0,h1);
 // ---------- 5) kedi pano arka duvarı bina genişliğini aşmasın (5,576 → 5,460)
 // kedi panosu sahneye geç gelebilir: gelene dek (en çok 120 s) yokla, bir kez düzelt
 const kediDene=()=>{const kedi=scene.getObjectByName('DUKKAN__KEDI_ARKA_DUVAR');
  if(!kedi||!kedi.geometry){if(performance.now()-kt0<120000)setTimeout(kediDene,500);return null;}
  if(kedi.userData.kediDuvar31)return kedi.userData.kediDuvar31;scene.updateMatrixWorld(true);const bb=new T.Box3().setFromObject(kedi);let sonuc=[+bb.min.x.toFixed(3),+bb.max.x.toFixed(3),'zaten içte'];
  if(bb.max.x>r1+1e-4||bb.min.x<l0-1e-4){const sx=(r1-l0)/(bb.max.x-bb.min.x),M=new T.Matrix4().makeTranslation(l0,0,0).multiply(new T.Matrix4().makeScale(sx,1,1)).multiply(new T.Matrix4().makeTranslation(-bb.min.x,0,0));
   const q=kedi.geometry.clone();q.applyMatrix4(kedi.matrixWorld);q.applyMatrix4(M);q.applyMatrix4(new T.Matrix4().copy(kedi.matrixWorld).invert());kedi.geometry.dispose();kedi.geometry=q;
   I.dukkanTemiz29?.gradient30?.apply(kedi,Array.isArray(kedi.material));sonuc=[+bb.min.x.toFixed(3),+bb.max.x.toFixed(3),l0,r1];}
  kedi.userData.kediDuvar31=sonuc;if(I.dukkanYapi31)I.dukkanYapi31.info.kediArkaDuvar=sonuc;return sonuc;};
 const kt0=performance.now(),kediDuzelt=kediDene();
 scene.updateMatrixWorld(true);
 const sun=scene.children.find(o=>o.isDirectionalLight&&o.shadow);if(sun)sun.shadow.needsUpdate=true;
 const say=[0,0];for(let t=0;t<nT;t++)say[mat[t]]++;
 const info={revision:31,kaynak:'zeminde plan → extrude (dik parçalar birleşik katı + eğri parçalar ExtrudeGeometry)',ucgen:nT,beyaz:say[0],turuncu:say[1],sacakAlti:sacakAlti,
  disOlcu_m:[l0,r1,b0,cd,H],barKose_mm:{merkez:[B.cx*1000,B.cz*1000],ic:B.ri*1000,dis:B.ro*1000},disTezgah_mm:{cikma:B.rafCikma*1000,ust:B.raf[1]*1000,bitis:'radyal, müşteri cebine 225'},
  sacakAlti_m:Y.SACAK,kasaUzatilan:kasa,kediArkaDuvar:kediDuzelt,eskiAg:'SHELL82 (348 ince bozuk üçgen + çapraz kesik) kaldırıldı'};
 wall.userData.yapi31=info;document.documentElement.dataset.dukkanYapi31='ready';
 sagDuvar31(T,I,info);
 return I.dukkanYapi31={info,wall};
}
// ---------- 6) sağ duvar donanımı (Kemal 1 Kas: şalter kutusu ray hizasında, ortalı): pano (ROBOT25 / ELK_DUVAR_PANO / ELK_ANA_HAT) 156 mm içeri,
// z .655–1.265, merkezi ray ekseni z .960; şalter panonun altında aynı eksende (zemin 0,60–0,84 m). Eski duvar içi güç kanalı (ROBOT25_DUVAR_GUC)
// ve şalter kanalı kaldırıldı: kablo yolu zemin70.js'teki tek kanal ağı (ELK_KANAL_AGI).
// Pano arka levhası ≤ 5,455 (duvar içinde, dış yüz 5,460 kapalı). Bina giriş kabloları dış yüzün 5 mm içinde biter.
// Parçalar sahneye farklı anlarda geldiği için hepsi gelene dek (en çok 120 s) bekler; her parça bir kez taşınır.
function sagDuvar31(T,I,info){
 const Y=YAPI31,scene=I.sahne.scene,t0=performance.now();
 const PANO=new T.Box3(new T.Vector3(5.15,0,.55),new T.Vector3(5.70,1.85,1.35)),SALTER=new T.Box3(new T.Vector3(5.15,1.30,-1.05),new T.Vector3(5.60,1.85,-.60));
 const panoAd=/^(ROBOT25_|ELK_DUVAR_PANO__|ELK_ANA_HAT__)/,salterAd=/^ELK_DUVAR__/,eskiKanal=/^ROBOT25_DUVAR_GUC/;
 const onarilan=[],tasi=(o,dx,dz=0,dy=0)=>{const p=new T.Vector3();o.getWorldPosition(p);p.x+=dx;p.y+=dy;p.z+=dz;o.parent.worldToLocal(p);o.position.copy(p);o.updateMatrix();o.updateMatrixWorld(true);o.userData.sagDuvar31=[dx,dy,dz];
  o.traverse(m=>{const g=m.geometry;if(!g)return;
   // eski şalter gövdesi / kolları: indeks [0,0,0,3,3,3…] bozuk (her üçgen tek noktaya çökük, kutu hiç görünmüyordu); konumlar tam üçgen listesi → indeks kaldırılır
   const ix=g.index;if(ix&&ix.count===g.attributes.position.count){let bos=0;for(let i=0;i<ix.count;i+=3)if(ix.getX(i)===ix.getX(i+1)&&ix.getX(i+1)===ix.getX(i+2))bos++;if(bos*3===ix.count){g.setIndex(null);g.computeVertexNormals();onarilan.push(m.name);}}
   g.computeBoundingBox();g.computeBoundingSphere();});};
 function dene(){
  if(!['ROBOT25_DUVAR_PANO_KAPI','ELK_DUVAR__salter','ELK_DUVAR_PANO__cihaz'].every(n=>scene.getObjectByName(n))){if(performance.now()-t0<120000)setTimeout(dene,500);else info.sagDuvar={hata:'parçalar gelmedi'};return;}
  scene.updateMatrixWorld(true);const b=new T.Box3(),secP=[],secS=[],secG=[];onarilan.length=0;
  scene.traverse(o=>{if(o===scene||o.userData.sagDuvar31!==undefined)return;const ad=o.name||'',eski=eskiKanal.test(ad),pano=!eski&&panoAd.test(ad),sal=salterAd.test(ad);if(!pano&&!sal&&!eski)return;
   for(let q=o.parent;q;q=q.parent)if(q.userData.sagDuvar31!==undefined||((pano||eski)&&panoAd.test(q.name||''))||(sal&&salterAd.test(q.name||'')))return;
   b.setFromObject(o);if(b.isEmpty())return;if(eski)secG.push(o);else if(pano&&PANO.intersectsBox(b))secP.push(o);else if(sal&&SALTER.intersectsBox(b))secS.push(o);});
  for(const o of secP)tasi(o,Y.PANO_DX,Y.PANO_DZ);for(const o of secS)tasi(o,Y.SALTER_DX,Y.SALTER_DZ,Y.SALTER_DY);
  const eskiAd=secG.map(o=>o.name);for(const o of secG){o.userData.sagDuvar31='kaldirildi';retireGeometry90(T,scene,o,I);}
  // dış yüzü hâlâ geçen ince parça (bina güç / WAN giriş kablosu) x yönünde dış yüzün içinde biter
  const kirp=[];for(const o of secP)o.traverse(m=>{if(!m.isMesh)return;b.setFromObject(m);if(b.max.x<=Y.DIS_SINIR+1e-4)return;const L=b.max.x-b.min.x,k=(Y.DIS_SINIR-b.min.x)/L;if(k<=0||!m.geometry)return;
   const g=m.geometry.clone(),A=g.attributes.position,v=new T.Vector3(),M=m.matrixWorld,Mi=M.clone().invert();for(let i=0;i<A.count;i++){v.fromBufferAttribute(A,i).applyMatrix4(M);v.x=b.min.x+(v.x-b.min.x)*k;v.applyMatrix4(Mi);A.setXYZ(i,v.x,v.y,v.z);}
   A.needsUpdate=true;g.computeBoundingBox();g.computeBoundingSphere();m.geometry=g;kirp.push(m.name);});
  let maxX=-1;for(const o of secP){b.setFromObject(o);maxX=Math.max(maxX,b.max.x);}
  info.sagDuvar={pano:secP.length,salter:secS.length,eskiKanalKaldirilan:eskiAd,rayEkseniZ:Y.RAY_Z,indeksOnarilan:onarilan.slice(),panoDx_mm:Y.PANO_DX*1000,panoDz_mm:Y.PANO_DZ*1000,salterDx_mm:Y.SALTER_DX*1000,salterDy_mm:Y.SALTER_DY*1000,salterDz_mm:Y.SALTER_DZ*1000,kirpilan:kirp,panoMaxX:+maxX.toFixed(4),sure_ms:Math.round(performance.now()-t0)};
  document.documentElement.dataset.sagDuvar31='ready';
  const sun=scene.children.find(o=>o.isDirectionalLight&&o.shadow);if(sun)sun.shadow.needsUpdate=true;
 }
 dene();
}
