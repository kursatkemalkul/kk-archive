import {solidTools42} from './wash_solid61.js';
// Drawing-derived purchased catch plus custom fabricated concealed door fittings.
// Not OEM CAD; supplier and physical fatigue/termination acceptance remain required.
export function hardware63(T,F,root,leaf,{name,a,b,bottom,top,front,hand}){
 const origin=hand>0?a:b,w=b-a,y=top-.040,post=front<1.6?2.679:(hand>0?2.0315:3.1295),x=origin+hand*.050;
 const black=new T.MeshStandardMaterial({color:0x344046,roughness:.8}),records=[],mark=(o,role)=>{o.userData={...o.userData,wash63:true,door63:name,role63:role};records.push(o);return o;};
 const own=(o,role)=>mark(o,role),P=(suffix,b,parent=root,mat=F.steel)=>own(F.plate(name+'_'+suffix,b,parent,mat),suffix);
 const H=(suffix,b,axis,holes,parent=root)=>own(F.holed(name+'_'+suffix,b,axis,holes,parent),suffix);
 const pin=(suffix,A,B,r,parent=root,mat=F.steel)=>own(F.pin(name+'_'+suffix,A,B,r,parent,mat),suffix);
 const minmax=(u,v)=>[Math.min(u,v),Math.max(u,v)];
 // One compact limiter per leaf; both eye pins are supported by drilled plates.
 H('SINIR_SASI_KULAK',[...minmax(post,x+hand*.006),y-.002,y+.002,front+.0075,front+.0375],'y',[[x,front+.020,.00425]]);
 const bx=hand*.150;
 P('SINIR_KAPAK_TAKVIYE',[bx-.020,bx+.020,y-.020,y+.020,.0015,.0035],leaf);
 H('SINIR_KAPAK_KULAK',[bx-.006,bx+.006,y-.002,y+.002,.0035,.023],'y',[[bx,.014,.00425]],leaf);
 const fixedPin=pin('SINIR_SASI_8MM_PIM',[x,y+.003,front+.020],[x,y-.010,front+.020],.004),movingPin=pin('SINIR_KAPAK_8MM_PIM',[bx,y+.003,.014],[bx,y-.010,.014],.004,leaf);
 pin('SINIR_SASI_PIM_BASI',[x,y-.009,front+.020],[x,y-.010,front+.020],.0063);
 pin('SINIR_KAPAK_PIM_BASI',[bx,y-.009,.014],[bx,y-.010,.014],.0063,leaf);
 const A=new T.Vector3(x,y-.0045,front+.020),B=new T.Vector3(bx,y-.0045,.014),axis=new T.Vector3(origin-hand*.0005,0,front+.004),localAxis=new T.Vector3(-hand*.0005,0,.004);
 const openB=B.clone().sub(localAxis).applyAxisAngle(new T.Vector3(0,1,0),hand*Math.PI/2).add(axis),radius=.00685,L=A.distanceTo(openB)-2*radius;
 const eye=(suffix,parent)=>{const m=new T.Mesh(new T.TorusGeometry(radius,.002,8,32),F.steel);m.rotation.x=Math.PI/2;m.name='YIKAMA__'+name+'_'+suffix;parent.add(m);F.parts.push(m);return own(m,suffix);};
 const eyeA=eye('SINIR_SASI_HALAT_GOZU',root),eyeB=eye('SINIR_KAPAK_HALAT_GOZU',leaf);eyeA.position.copy(A);eyeB.position.copy(B);const bushA=own(F.ring(name+'_SINIR_SASI_GOZ_BURCU',0,-.002,0,.00485,.00405,.004),'SINIR_SASI_GOZ_BURCU'),bushB=own(F.ring(name+'_SINIR_KAPAK_GOZ_BURCU',0,-.002,0,.00485,.00405,.004,leaf),'SINIR_KAPAK_GOZ_BURCU');bushA.position.copy(A);bushB.position.copy(B);
 const cable=new T.Mesh(new T.BufferGeometry(),black);cable.name='YIKAMA__'+name+'_90DERECE_HALAT';root.add(cable);F.parts.push(cable);own(cable,'90DERECE_HALAT');
 cable.userData={...cable.userData,manufacturer:'Carl Stahl TECHNOCABLES',partNumber:'SE000114',core_mm:3,outer_mm:4,rawMinimumBreakingLoad_N:5350,freeLength_mm:L*1000,termination:'custom swaged eye assembly; minimum4000N after termination to qualify',drawingDerived:true,qualified:false};
 let last=-1,current={};
 function update(value){if(Math.abs(value-last)<1e-8)return current;last=value;root.updateMatrixWorld(true);const bb=leaf.localToWorld(B.clone()),dir=bb.clone().sub(A).normalize(),p=A.clone().addScaledVector(dir,radius),q=bb.clone().addScaledVector(dir,-radius),d=p.distanceTo(q),mid=p.clone().add(q).multiplyScalar(.5);let lo=0,hi=.15,curve;
  for(let i=0;i<22;i++){const sag=(lo+hi)/2,c=new T.QuadraticBezierCurve3(p,mid.clone().add(new T.Vector3(0,-sag,0)),q);c.arcLengthDivisions=100;if(c.getLength()>L)hi=sag;else lo=sag;}
  curve=new T.QuadraticBezierCurve3(p,mid.clone().add(new T.Vector3(0,-(lo+hi)/2,0)),q);curve.arcLengthDivisions=100;const g=new T.TubeGeometry(curve,40,.002,8,false);cable.geometry.dispose();cable.geometry=g;
  current={chord_m:d,freeLength_m:L,actualLength_m:curve.getLength(),slack_m:L-d,angle_deg:value*90,taut:value>.99999};return current;
 }
 // Genuine MC-159-2-STD dimensional envelope:35x16.5x2.2mm,25mm M5 studs.
 const cx=hand>0?b-.060:a+.060,isTop=bottom>2.4,cy=isTop?2.7585:top-.019,localCx=cx-origin,base=cy-.025;
 let support=null;
 if(!isTop){
  support=H('TUTUCU_SASI_SACI',[cx-.030,cx+.030,cy-.011,cy+.011,front+.0067,front+.0082],'z',[[cx-.0125,cy,.00275],[cx+.0125,cy,.00275],[cx-.024,cy,.0026],[cx+.024,cy,.0026]]);
  P('TUTUCU_OTURMA',[cx-.030,cx+.030,cy+.0095,cy+.011,front+.0082,front+.015]);
  if(front<1.6)P('TUTUCU_UST_KIRIS_KOK',[cx-.030,cx+.030,cy+.0095,.8635,front+.015,front+.0165]);
 }else{
  // Rear-mounted catch studs enter blind M5 inserts in the actual top RHS.
  for(const xx of [cx-.0125,cx+.0125]){
   const flange=own(F.ring(name+'_M5_KOR_SOMUN_FLANS',0,-.0004,0,.005,.0026,.0008),'M5_INSERT');flange.rotation.x=Math.PI/2;flange.position.set(xx,cy,front+.0071);
   const barrel=own(F.ring(name+'_M5_KOR_SOMUN_GOVDE',0,-.006,0,.0035,.0026,.012),'M5_INSERT');barrel.rotation.x=Math.PI/2;barrel.position.set(xx,cy,front+.0135);
  }
 }
 F.hardware63Mounts??=[];F.hardware63Mounts.push({isTop,front,cx,cy,name});
 const s=new T.Shape(),rr=.00825,dx=.0175-rr;s.moveTo(cx-dx,cy-rr);s.lineTo(cx+dx,cy-rr);s.absarc(cx+dx,cy,rr,-Math.PI/2,Math.PI/2,false);s.lineTo(cx-dx,cy+rr);s.absarc(cx-dx,cy,rr,Math.PI/2,Math.PI*1.5,false);s.closePath();
 const g=new T.ExtrudeGeometry(s,{depth:.0022,bevelEnabled:false,curveSegments:24});g.translate(0,0,front+.0045);const body=new T.Mesh(g,F.steel);body.name='YIKAMA__'+name+'_SUGATSUNE_MC159_2_STD';root.add(body);F.parts.push(body);own(body,'CATCH_BODY');body.userData={...body.userData,manufacturer:'Sugatsune',model:'MC-159-2-STD',envelope_mm:[35,16.5,2.2],pullForce_N:19.6,mountingPitch_mm:25,source:'https://global.sugatsune.com/eu/en/arch/products/22049_a',representation:'manufacturer drawing-derived, not OEM CAD'};
 for(const xx of [cx-.0125,cx+.0125]){pin('TUTUCU_M5_STUD',[xx,cy,front+.0067],[xx,cy,front+.0173],.0025);if(!isTop){const nut=own(F.ring(name+'_TUTUCU_M5_SOMUN',0,-.002,0,.0046,.00255,.004,root,F.steel,6),'TUTUCU_M5_SOMUN');nut.rotation.x=Math.PI/2;nut.position.set(xx,cy,front+.0102);}}
 const strike=P('TUTUCU_KARSI_430',[localCx-.0175,localCx+.0175,cy-.00825,cy+.00825,.0015,.0045],leaf);strike.userData.materialSpecification='ferritic430 stainless strike, spot-welded flush to304L leaf; weld procedure to qualify';
 if(!isTop)for(const xx of [cx-.024,cx+.024]){pin('KAPALI_EPDM_DAYAMA',[xx,cy,front+.0015],[xx,cy,front+.0067],.0032,root,black);pin('EPDM_ESIR_MIL',[xx,cy,front+.0067],[xx,cy,front+.0082],.0025,root,black);}
 return{nodes:records,cable,eyeA,eyeB,fixedPin,movingPin,A,B,openB,freeLength_m:L,update,catchBody:body,catchSupport:support,strike,closedPose63:true};
}

export function finishMounts63(T,F,root){
 const solid=solidTools42(T),cut=(x,y,z,r,h)=>{const g=new T.CylinderGeometry(r,r,h,32);g.rotateX(Math.PI/2);g.translate(x,y,z);return g;};
 for(const m of F.hardware63Mounts){if(m.front<1.6)continue;
  const nodes=m.isTop?F.parts.filter(o=>o.name==='YIKAMA__UST_ENINE_20_20_2'&&o.userData.ends?.[0]?.[2]<1.8):F.parts.filter(o=>o.name==='YIKAMA__KARTON_DEPO_RAF_R1_5_TEK_BUKUMLU');
  for(const o of nodes){o.updateMatrixWorld(true);const inv=o.matrixWorld.clone().invert(),bores=[m.cx-.0125,m.cx+.0125].map(x=>cut(x,m.cy,m.front+(m.isTop?.0085:.016),m.isTop?.00355:.003,.006).applyMatrix4(inv));o.geometry=solid.subtract(o.geometry,bores);o.userData.catchMount63='actual clearance holes; M5 blind insert in top RHS / clearance through carton shelf lip';}
 }
}
