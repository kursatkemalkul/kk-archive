import {JAMB84} from './wash_jamb84.js';
import {counter62} from './wash_counter62.js';
import {solidTools42} from './wash_solid61.js';
import {bentLand61} from './wash_standard61.js';
import {GLTFLoader} from './vendor/GLTFLoader.js';
import {PAN57} from './wash_pans57.js';

// Metres. Fabricated parts are custom AISI 304; purchased parts retain 1:1 scale.
export function washFabrication57(T,root,MAT,IKIZ,box,tube,cylinder){
 const steel=MAT.paslanmaz,black=MAT.siyah,skin=new T.MeshStandardMaterial({color:0xc5d1d5,metalness:.72,roughness:.32});
 const blue=new T.MeshStandardMaterial({color:0x158ba5,roughness:.65}),parts=[],shell=[],joints=[];
 function mark(o,type,data={}){const frame=['RHS','sheet','formed sheet','formed pan','drilled sheet','countertop','purchased OEM CAD'].includes(type);o.userData={...o.userData,wash57:true,materialSpecification:'EN1.4307/AISI304L; material certificate required',nominalSheetTolerance_mm:.10,criticalFrameTolerance_mm:.5,type,...(frame?{wash57Part:'frame'}:{}),...data};parts.push(o);return o;}
 function plate(n,b,parent=root,mat=steel){return mark(box(n,b,mat,parent),'sheet',{thickness_mm:1000*Math.min(b[1]-b[0],b[3]-b[2],b[5]-b[4])});}
 function holed(n,b,axis,holes,parent=root){const k=axis==='x'?0:axis==='y'?1:2,uv=k===0?[[-b[5],-b[4]],[b[2],b[3]]]:k===1?[[b[0],b[1]],[b[4],b[5]]]:[[b[0],b[1]],[b[2],b[3]]],s=new T.Shape();s.moveTo(uv[0][0],uv[1][0]);s.lineTo(uv[0][1],uv[1][0]);s.lineTo(uv[0][1],uv[1][1]);s.lineTo(uv[0][0],uv[1][1]);s.closePath();for(const [a,c,r]of holes){const h=new T.Path();h.absarc(k===0?-a:a,c,r,0,Math.PI*2,true);s.holes.push(h);}const g=new T.ExtrudeGeometry(s,{depth:b[2*k+1]-b[2*k],bevelEnabled:false});if(k===0){g.rotateY(Math.PI/2);g.translate(b[0],0,0);}else if(k===1){g.rotateX(Math.PI/2);g.translate(0,b[3],0);}else g.translate(0,0,b[4]);const o=new T.Mesh(g,steel);o.name='YIKAMA__'+n;parent.add(o);return mark(o,'drilled sheet',{thickness_mm:1000*(b[2*k+1]-b[2*k]),axis,holes:holes.map(h=>h.map(v=>v*1000))});}
 function rhs(n,a,b,w=.030,h=.030,t=.002){
  const d=new T.Vector3(...b).sub(new T.Vector3(...a)),L=d.length(),s=new T.Shape(),ro=2*t,ri=t;
  function rounded(shape,u,v,r,reverse=false){shape.moveTo(-u/2+r,-v/2);shape.lineTo(u/2-r,-v/2);shape.quadraticCurveTo(u/2,-v/2,u/2,-v/2+r);shape.lineTo(u/2,v/2-r);shape.quadraticCurveTo(u/2,v/2,u/2-r,v/2);shape.lineTo(-u/2+r,v/2);shape.quadraticCurveTo(-u/2,v/2,-u/2,v/2-r);shape.lineTo(-u/2,-v/2+r);shape.quadraticCurveTo(-u/2,-v/2,-u/2+r,-v/2);shape.closePath();}
  rounded(s,w,h,ro);const hole=new T.Path();rounded(hole,w-2*t,h-2*t,ri);s.holes.push(hole);
  const o=new T.Mesh(new T.ExtrudeGeometry(s,{depth:L,bevelEnabled:false}),steel);o.position.fromArray(a);o.quaternion.setFromUnitVectors(new T.Vector3(0,0,1),d.normalize());o.name='YIKAMA__'+n;root.add(o);return mark(o,'RHS',{stock_mm:[w*1000,h*1000,t*1000],ends:[a,b],join:'welded butt joint'});
 }
 function pin(n,a,b,r=.003,parent=root,mat=steel){const d=new T.Vector3(...b).sub(new T.Vector3(...a)),o=new T.Mesh(new T.CylinderGeometry(r,r,d.length(),16),mat);o.position.fromArray(a).addScaledVector(d,.5);o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),d.normalize());o.name='YIKAMA__'+n;parent.add(o);return mark(o,'pin');}
 function ring(n,x,y,z,ro,ri,h,parent=root,mat=steel,sides=48){const s=new T.Shape();for(let i=0;i<=sides;i++){const a=i/sides*Math.PI*2;i?s.lineTo(ro*Math.cos(a),ro*Math.sin(a)):s.moveTo(ro,0);}s.closePath();const hole=new T.Path();hole.absarc(0,0,ri,0,Math.PI*2,true);s.holes.push(hole);const g=new T.ExtrudeGeometry(s,{depth:h,bevelEnabled:false,curveSegments:24});g.rotateX(Math.PI/2);g.translate(x,y+h,z);const o=new T.Mesh(g,mat);o.name='YIKAMA__'+n;parent.add(o);return mark(o,'bored fitting',{outside_mm:ro*2000,bore_mm:ri*2000,length_mm:h*1000});}
 function screw(n,a,b,r=.0025,parent=root){pin(n+'_GOVDE',a,b,r,parent);const v=new T.Vector3(...a).sub(new T.Vector3(...b)).normalize();pin(n+'_BAS',a,new T.Vector3(...a).addScaledVector(v,.003).toArray(),r*1.6,parent,black);}
 // Continuous brake-formed sheet, including actual inside/outside bend radii.
 function fold(n,points,t,axis,lo,hi,parent=root,mat=skin){
  const sh=new T.Shape(),[p0,...rest]=points;sh.moveTo(...p0);for(const p of rest)sh.lineTo(...p);sh.closePath();const geo=new T.ExtrudeGeometry(sh,{depth:hi-lo,bevelEnabled:false});
  if(axis==='x'){geo.rotateY(Math.PI/2);geo.translate(lo,0,0);}else if(axis==='y'){geo.rotateX(Math.PI/2);geo.translate(0,hi,0);}else geo.translate(0,0,lo);
  const o=new T.Mesh(geo,mat);o.name='YIKAMA__'+n;parent.add(o);return mark(o,'formed sheet',{thickness_mm:t*1000});
 }
 // A 90-degree downward return on a horizontal sheet. XY profile extrudes in Z.
 function pan(n,x0,x1,y,z0,z1,t=.0015,down=.022,parent=root){
  const key=[(x1-x0)*1000,(z1-z0)*1000,down*1000].map(v=>v.toFixed(1)).join(','),data=PAN57[key];if(!data)throw Error('Missing formed pan '+n+' '+key);
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(data.positions,3));g.setIndex(data.indices);g.computeVertexNormals();const o=new T.Mesh(g,steel);o.position.set((x0+x1)/2,y,(z0+z1)/2);o.name='YIKAMA__'+n+'_R1_5_TEK_BUKUMLU';parent.add(o);return mark(o,'formed pan',{sheet_mm:t*1000,insideRadius_mm:1.5,outsideRadius_mm:3,edgeHeight_mm:down*1000,solidValidated:true});
 }
 // Six feet carry the lower counter. The appliance keeps its own factory roller base.
 const xs=[2.0265,2.6665,3.1345],zs=[1.525,2.3015];
 for(const x of xs)for(const z of zs){
  rhs('ALT_DIKME_25_25_2',[x,.100,z],[x,.8885,z],.025,.025);
  const foot=cylinder('AYAK_TABANI',x,0,z,.015,.008,black);mark(foot,'levelling foot',{thread:'M12',adjustment_mm:30,customFabricated:true});
  cylinder('AYAK_PASLANMAZ_TABAK',x,.008,z,.015,.006,steel);cylinder('AYAK_M12_MIL',x,.014,z,.006,.105,steel);
  ring('AYAK_M12_KONTRA_SOMUN',x,.076,z,.010,.0061,.007,root,steel,6);ring('AYAK_M12_KAYNAKLI_DISLI_BURC',x,.086,z,.010,.0061,.014);
  holed('AYAK_ALT_KAPAMA_YUVA',[x-.0105,x+.0105,.097,.100,z-.0105,z+.0105],'y',[[x,z,.00625]]);
 }
 for(const z of [1.5375,2.2915])for(let i=0;i<xs.length-1;i++)rhs('TEZGAH_ENINE_50_25_3',[xs[i]+.0125,.876,z],[xs[i+1]-.0125,.876,z],.050,.025,.003);
 for(const x of xs)rhs('TEZGAH_DERINLIK_25_40_3',[x,.8685,zs[0]+.0125],[x,.8685,zs[1]-.0125],.025,.040,.003);
 // Lower rear and sink-side base braces avoid the dishwasher insertion envelope.
 for(let i=0;i<xs.length-1;i++)rhs('ALT_ARKA_BAG',[xs[i]+.0125,.115,2.3015],[xs[i+1]-.0125,.115,2.3015]);
 for(const x of [2.6665,3.1345])rhs('ALT_YAN_BAG',[x,.115,1.5375],[x,.115,2.289]);
 // Upper chassis stands on the counter's side bearers, never on a 1.5 mm skin.
 for(const x of [2.0215,3.1395])for(const z of [1.6855,2.3065])rhs('UST_DIKME_20_20_2',[x,.890,z],[x,2.7685,z],.020,.020);
 for(const y of [1.4685,2.7585]){
  for(const z of (y<2?[1.7115,2.2865]:[1.6855,2.3065]))rhs(y<2?'RAF_ENINE_20_30_2':'UST_ENINE_20_20_2',[2.0315,y<2?1.4635:y,z],[3.1295,y<2?1.4635:y,z],.020,y<2?.030:.020);
  for(const x of [2.0215,3.1395])rhs('UST_DERINLIK_20_20_2',[x,y,1.6955],[x,y,2.2965],.020,.020);
 }
 for(const z of [1.7015,2.2765])rhs('KARTON_RAFI_20_30_2',[2.0315,2.395,z],[3.1295,2.395,z],.020,.030);
 for(const x of [2.0215,3.1395])rhs('KARTON_RAFI_YAN_20_30_2',[x,2.395,1.6955],[x,2.395,2.2965],.020,.030);
 // One continuous bend on the front face of the shifted RHS, same as E53.
 for(const [outer,hand]of [[2.010,1],[3.151,-1]]){
  shell.push(bentLand61(T,{parts,steel,skin},root,{name:'UST_YAN_TEK_BUKUM_61',outer,hand,bottom:.890,top:2.7685,seat:1.674}));
  shell.push(bentLand61(T,{parts,steel,skin},root,{name:'ALT_YAN_TEK_BUKUM_61',outer,hand,bottom:.100,top:.8685,seat:1.511,land:26}));
 }
 const jamb=bentLand61(T,{parts,steel,skin},root,{name:'ALT_ORTA_TEK_BUKUM_62',outer:2.6505,hand:1,bottom:.100,top:.8685,seat:1.511,rear:2.108,land:25.5});shell.push(jamb);
 const solid62=solidTools42(T),cut62=b=>{const g=new T.BoxGeometry(b[1]-b[0],b[3]-b[2],b[5]-b[4]);g.translate((b[0]+b[1])/2,(b[2]+b[3])/2,(b[4]+b[5])/2);return g;};
 // Laser reliefs fit the actual side brace and the counter's front beam.
 {const old=jamb.geometry,g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(JAMB84.positions,3));g.setAttribute('normal',new T.Float32BufferAttribute(JAMB84.normals,3));jamb.geometry=g;old.dispose();}
 const backHoles=[...[2.0215,3.1395].flatMap(x=>[.300,.790,1.450,2.350,2.690].map(y=>[x,y,.00275]))];
 // Two real removable back panels meet the worktop return; no doubled strip.
 for(const [lo,hi]of [[.100,.8685],[.890,2.7685]])shell.push(holed('ARKA_SOKULUR_SAC',[2.0115,3.1495,lo,hi,2.3165,2.318],'z',backHoles.filter(h=>h[1]>lo&&h[1]<hi)));
 for(const x of [2.0215,3.1395])for(const y of [.300,.790,1.450,2.350,2.690])screw('ARKA_M5',[x,y,2.321],[x,y,2.303],.0025);
 const tapSupport=rhs('BATARYA_TASIYICI_20_20_2',[2.0315,1.174,2.3065],[3.1295,1.174,2.3065],.020,.020,.002);
 tapSupport.updateMatrixWorld(true);const invTap=tapSupport.matrixWorld.clone().invert(),tapBores=[2.869,2.897].map(x=>{const g=new T.CylinderGeometry(.00225,.00225,.004,24);g.rotateX(Math.PI/2);g.translate(x,1.174,2.2975);return g.applyMatrix4(invTap);});tapSupport.geometry=solid62.subtract(tapSupport.geometry,tapBores);
 const deckStart60=root.children.length;
 // 1.5 mm worktop, R20 welded bowl aperture and actual Ø35 faucet opening.
 const tm=counter62(T,steel);root.add(tm);mark(tm,'countertop',{thickness_mm:1.5});
 function round(w,d,r){const s=new T.Shape(),a=-w/2,b=-d/2;s.moveTo(a+r,b);s.lineTo(a+w-r,b);s.quadraticCurveTo(a+w,b,a+w,b+r);s.lineTo(a+w,b+d-r);s.quadraticCurveTo(a+w,b+d,a+w-r,b+d);s.lineTo(a+r,b+d);s.quadraticCurveTo(a,b+d,a,b+d-r);s.lineTo(a,b+r);s.quadraticCurveTo(a,b,a+r,b);return s;}
 // Fully closed, constant-thickness bowl: wall / R20 bottom turn / sloping bottom / drain.
 const pos=[],ix=[],loops=[];
 function addLoop(w,d,r,y){const pp=round(w,d,r).getSpacedPoints(96).slice(0,-1),l=[];for(const p of pp){l.push(pos.length/3);pos.push(2.883+p.x,y,1.875+p.y);}loops.push(l);return l;}
 function bridge(a,b,reverse=false){for(let i=0;i<a.length;i++){const j=(i+1)%a.length;if(reverse)ix.push(a[i],b[j],b[i],a[i],a[j],b[j]);else ix.push(a[i],b[i],b[j],a[i],b[j],a[j]);}}
 const inner=[];inner.push(addLoop(.400,.450,.020,.8785),addLoop(.400,.450,.020,.6485));
 for(let i=1;i<=12;i++){const a=Math.PI/2*i/12,k=.020*(1-Math.cos(a));inner.push(addLoop(.400-2*k,.450-2*k,.020,.6485-.020*Math.sin(a)));}
 const drainI=[];for(let i=0;i<96;i++){const a=i/96*Math.PI*2;drainI.push(pos.length/3);pos.push(2.883+.022*Math.cos(a),.6255,1.875+.022*Math.sin(a));}
 // Use matching rounded-perimeter angles to avoid twisted bottom facets.
 const outline=round(.360,.410,.020).getSpacedPoints(96).slice(0,-1);for(let i=0;i<96;i++){const p=outline[i],r=Math.hypot(p.x,p.y);pos[drainI[i]*3]=2.883+.022*p.x/r;pos[drainI[i]*3+2]=1.875+.022*p.y/r;}
 for(let i=1;i<inner.length;i++)bridge(inner[i-1],inner[i]);bridge(inner.at(-1),drainI);
 const outer=[];outer.push(addLoop(.403,.453,.0215,.8785),addLoop(.403,.453,.0215,.6485));
 for(let i=1;i<=12;i++){const a=Math.PI/2*i/12,k=.0215*(1-Math.cos(a));outer.push(addLoop(.403-2*k,.453-2*k,.020,.6485-.0215*Math.sin(a)));}
 const drainO=drainI.map(i=>{const k=pos.length/3;pos.push(pos[i*3],pos[i*3+1]-.0015,pos[i*3+2]);return k;});for(let i=1;i<outer.length;i++)bridge(outer[i-1],outer[i],true);bridge(outer.at(-1),drainO,true);bridge(inner[0],outer[0],true);bridge(drainI,drainO);
 const bg=new T.BufferGeometry();bg.setAttribute('position',new T.Float32BufferAttribute(pos,3));bg.setIndex(ix);bg.computeVertexNormals();const bowl=new T.Mesh(bg,steel);bowl.name='YIKAMA__KAYNAKLI_EVYE_400_450_250_R20';root.add(bowl);mark(bowl,'formed bowl',{sheet_mm:1.5,inside_mm:[400,450,250],bottomRadius_mm:20,drain_mm:44,drainSlope_mm:3});
 ring('EVYE_GIDER_FLANSI_ACIK_DN40',2.883,.619,1.875,.025,.0185,.006);tube('DN40_SIFON',[[2.883,.624,1.875],[2.883,.540,1.875],[2.883,.515,1.905],[2.883,.515,1.950],[2.883,.580,1.975],[2.883,.580,2.255],[2.883,.220,2.255]],.020);
 // Fisher 70100 / PRCB-SQ-SDTTL: drawing-derived, NOT labelled manufacturer 3D CAD.
 const faucet=new T.Group();faucet.name='YIKAMA__FISHER_70100_CIZIMDEN_532MM';root.add(faucet);const faucetStart=root.children.length;faucet.userData={source:'https://fisherfaucets.com/sites/default/files/spec-sheets/PRCB-SQ-SDTTL.pdf',genuineCAD:false,height_mm:532,inlets:'1/2 NPT; local adapters required'};
 ring('BATARYA_ROZET',2.883,.880,2.180,.0225,.0145,.006);cylinder('BATARYA_VANA_GOVDE',2.883,.886,2.180,.020,.072);ring('BATARYA_GOVDE_SOMUN',2.883,.845,2.180,.022,.0142,.010,root,steel,6);cylinder('BATARYA_GECIS_MILI',2.883,.830,2.180,.014,.056);
 holed('BATARYA_TEZGAH_TAKVIYE',[2.838,2.928,.8755,.8785,2.135,2.225],'y',[[2.883,2.180,.0175]]);
 tube('BATARYA_10IN_RISER',[[2.883,.958,2.180],[2.883,1.212,2.180]],.010);
 const hosePts=[new T.Vector3(2.883,1.212,2.180),new T.Vector3(2.883,1.3324,2.180)];for(let i=1;i<=40;i++){const a=Math.PI*i/40;hosePts.push(new T.Vector3(2.883,1.3324+.066*Math.sin(a),2.114+.066*Math.cos(a)));}hosePts.push(new T.Vector3(2.883,1.240,2.048));const curve=new T.CatmullRomCurve3(hosePts);
 const hose=new T.Mesh(new T.TubeGeometry(curve,70,.007,12,false),steel);hose.name='YIKAMA__FISHER_15IN_CELIK_ORGU_HORTUM';root.add(hose);mark(hose,'hose',{drawingDerived:true});
 // Spring follows the hose centre line; no isolated loops.
 const spring=[];for(let i=0;i<=450;i++){const u=i/450,a=u*38*Math.PI,q=curve.getPointAt(u),t=curve.getTangentAt(u),n=new T.Vector3(1,0,0),b=new T.Vector3().crossVectors(t,n).normalize();spring.push(q.addScaledVector(n,.012*Math.cos(a)).addScaledVector(b,.012*Math.sin(a)));}const sg=new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(spring),450,.0016,6,false),steel);sg.name='YIKAMA__BATARYA_HORTUM_YAYI';root.add(sg);mark(sg,'spring');
 cylinder('YIKAMA_TABANCASI_HORTUM_RAKOR',2.883,1.157,2.048,.012,.083);cylinder('YIKAMA_TABANCASI_SAP',2.883,.978,2.048,.013,.179,black);cylinder('YIKAMA_TABANCASI_NOZUL',2.883,.930,2.048,.022,.048,blue);plate('YIKAMA_TABANCASI_TETIK',[2.896,2.900,1.005,1.140,2.042,2.056]);tube('TABAN_VANA_KOL',[[2.903,.940,2.180],[2.950,.940,2.180],[2.950,.950,2.130]],.005);
 tube('BATARYA_DUVAR_DESTEGI',[[2.883,1.164,2.180],[2.883,1.164,2.2905]],.004);holed('BATARYA_DESTEK_FLANS',[2.863,2.903,1.144,1.184,2.2905,2.2935],'z',[[2.869,1.164,.00225],[2.897,1.164,.00225]]);for(const x of [2.869,2.897]){const o=ring('BATARYA_SASI_M4_KAYNAKLI_BURC',0,-.0015,0,.004,.00205,.003);o.rotation.x=Math.PI/2;o.position.set(x,1.164,2.295);}for(const x of [2.869,2.897])screw('BATARYA_M4',[x,1.164,2.2905],[x,1.164,2.303],.002);
 for(const [i,x,col]of [[0,2.865,blue],[1,2.901,new T.MeshStandardMaterial({color:0xb34842})]]){tube('BATARYA_BESLEME_'+i,[[x,.830,2.180],[x,.720,2.230],[x,.680,2.270]],.006,col);cylinder('BATARYA_KESME_VANASI',x,.670,2.270,.012,.040,steel);}
 for(const o of root.children.slice(faucetStart))faucet.add(o);
 for(const o of root.children.slice(deckStart60))o.position.y+=.010;
 const washer=new T.Group();washer.name='YIKAMA__MEIKO_M_ICLEAN_UL';washer.position.set(2.0465,0,1.505);root.add(washer);
 const hinge=new T.Group();hinge.name='YIKAMA__UL_KAPAK_MENTESE';hinge.userData.kapakIstasyon='WASH';hinge.position.set(0,.280,0);washer.add(hinge);
 for(const [a,b]of [[.010,.020],[.580,.590]])pin('UL_IC_MENTESE_PIM_CIZIMDEN',[a,.280,0],[b,.280,0],.002,washer);
 const tray=new T.Group();tray.name='YIKAMA__UL_SEPET_SURGU';washer.add(tray);
 const ready=new Promise((resolve,reject)=>new GLTFLoader().load(new URL('./assets/wash57/meiko-ul-oem.glb',import.meta.url).href,gl=>{gl.scene.updateMatrixWorld(true);const all=[];gl.scene.traverse(o=>{if(o.isMesh)all.push(o);});for(const o of all){const m=o.matrixWorld.clone();o.removeFromParent();if(o.name.startsWith('MOVING_')){hinge.add(o);o.matrix.copy(new T.Matrix4().makeTranslation(0,-.280,0).multiply(m));}else{washer.add(o);o.matrix.copy(m);}o.matrix.decompose(o.position,o.quaternion,o.scale);mark(o,'purchased OEM CAD',{manufacturer:'MEIKO',unitScale:1});}resolve(washer);},undefined,reject));ready.catch(e=>console.error('MEIKO üretici modeli yüklenemedi',e));
 // Internal tub/rack are explicitly drawing-derived; OEM publishes an exterior envelope.
 const tub=new T.Group();tub.name='YIKAMA__UL_IC_HACIM_CIZIMDEN';washer.add(tub);tub.userData.genuineInternalCAD=false;
 for(const b of [[.020,.580,.3085,.310,.020,.650],[.020,.0215,.310,.745,.020,.650],[.5785,.580,.310,.745,.020,.650],[.0215,.5785,.310,.745,.6485,.650],[.0215,.5785,.745,.7465,.020,.650]])plate('UL_YIKAMA_KAZANI',b,tub);
 const basket=new T.Group();basket.name='YIKAMA__UL_SEPET_500_600';tray.add(basket);
 for(let i=0;i<=10;i++)plate('SEPET_TABAN_BOYUNA',[.050+i*.0497,.053+i*.0497,.313,.316,.0265,.6265],basket,blue);
 for(let i=0;i<=12;i++)plate('SEPET_TABAN_ENINE',[.050,.550,.316,.319,.0265+i*.04975,.0295+i*.04975],basket,blue);
 for(const x of [.050,.547])for(const y of [.319,.393])plate('SEPET_YAN_KUSAK',[x,x+.003,y,y+.004,.0265,.6265],basket,blue);
 for(const z of [.0265,.6235])for(const y of [.319,.393])plate('SEPET_ENINE_KUSAK',[.050,.550,y,y+.004,z,z+.003],basket,blue);
 for(const x of [.050,.547])for(const z of [.0265,.6235])plate('SEPET_DIKME',[x,x+.003,.319,.397,z,z+.003],basket,blue);
 // Rack lands on continuous rails, which are welded to the wash chamber side walls.
 for(const x of [.0215,.550])plate('UL_SEPET_KIZAK',[x,x+.0285,.310,.313,.022,.640],washer);
 const returns={parts,shell,joints,steel,skin,blue,plate,holed,rhs,pin,screw,ring,fold,pan,washer,hinge,tray,basket,ready,faucet};IKIZ.wash57=returns;return returns;
}
