// Exterior eating ledge and manually balanced service sash. Visual/mechanical model.

// No plant command, PLC interlock or robot movement is issued by this module.

import {PLAN} from './dukkan_plan.js';

export const BAR_CAM29={projection:.225,barTop:1.015,edgeRise:0,canopyProjection:0,

 glass:{ply:.005,interlayer:.00076,travel:.480},wallGap:0};

export function barCam29(T,facade,orange,glass,trim,IKIZ,liste=[]){

 const K=BAR_CAM29,cz=PLAN.yikamaArka[1],r=3.002-cz,cx=3.273-r,x0=1.790;

 const root=new T.Group();root.name='DUKKAN__BAR_CAM29';facade.add(root);

 const steel=new T.MeshStandardMaterial({color:0xc7ced0,metalness:.68,roughness:.35});steel.userData.storefront60Finish=true;

 const black=new T.MeshStandardMaterial({color:0x272c2e,roughness:.85}),rubber=new T.MeshStandardMaterial({color:0x34332e,roughness:1});

 const interlayer=new T.MeshPhysicalMaterial({color:0xe8eee9,transparent:true,opacity:.1,depthWrite:false,side:T.DoubleSide});

 const parts=[];

 function add(name,geo,mat=steel,parent=root){const o=new T.Mesh(geo,mat);o.name='DUKKAN__BAR29_'+name;o.userData={assemblyOwner:'SHOP',storefront60Finish:true};parent.add(o);parts.push(o);return o;}

 function box(name,b,mat=steel,parent=root){if(b[1]<=b[0]||b[3]<=b[2]||b[5]<=b[4])throw Error('Bad bar part '+name);const geo=new T.BoxGeometry(b[1]-b[0],b[3]-b[2],b[5]-b[4]);geo.translate((b[0]+b[1])/2,(b[2]+b[3])/2,(b[4]+b[5])/2);return add(name,geo,mat,parent);}

 function band(ro,ri,start=x0){const s=new T.Shape();s.moveTo(start,cz+ro);s.lineTo(cx,cz+ro);s.absarc(cx,cz,ro,Math.PI/2,0,true);s.lineTo(cx+ri,cz);s.absarc(cx,cz,ri,0,Math.PI/2,false);s.lineTo(start,cz+ri);s.closePath();return s;}

 function extrude(name,shape,y0,y1,mat=steel,slope=0){const geo=new T.ExtrudeGeometry(shape,{depth:y1-y0,bevelEnabled:false,curveSegments:96}),p=geo.attributes.position;for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getY(i),out=x<=cx?z-cz-r:Math.hypot(x-cx,z-cz)-r;p.setXYZ(i,x,p.getZ(i)+y0-out*slope,z);}const index=[];for(let i=0;i<p.count;i+=3)index.push(i,i+2,i+1);geo.setIndex(index);geo.computeVertexNormals();return add(name,geo,mat);}

 function path(rad,y,start=x0){const c=new T.CurvePath();c.add(new T.LineCurve3(new T.Vector3(start,y,cz+rad),new T.Vector3(cx,y,cz+rad)));class Arc extends T.Curve{getPoint(t,target=new T.Vector3()){const a=(1-t)*Math.PI/2;return target.set(cx+rad*Math.cos(a),y,cz+rad*Math.sin(a));}}c.add(new Arc());return c;}

 function roundRail(name,rad,y,diameter,mat=steel){return add(name,new T.TubeGeometry(path(rad,y),160,diameter/2,10,false),mat);}

 function beam(name,a,b,w,h,wall=.002){const d=new T.Vector3(...b).sub(new T.Vector3(...a)),s=new T.Shape();s.moveTo(-w/2,-h/2);s.lineTo(w/2,-h/2);s.lineTo(w/2,h/2);s.lineTo(-w/2,h/2);s.closePath();const hole=new T.Path();hole.moveTo(-w/2+wall,-h/2+wall);hole.lineTo(-w/2+wall,h/2-wall);hole.lineTo(w/2-wall,h/2-wall);hole.lineTo(w/2-wall,-h/2+wall);hole.closePath();s.holes.push(hole);const geo=new T.ExtrudeGeometry(s,{depth:d.length(),bevelEnabled:false});geo.applyMatrix4(new T.Matrix4().makeRotationFromQuaternion(new T.Quaternion().setFromUnitVectors(new T.Vector3(0,0,1),d.normalize())));geo.translate(...a);return add(name,geo);}

 // The concrete ledge is Boolean-unioned into the shop shell, not a second slab.
 orange.roughness=.90;orange.metalness=0;orange.userData.paintedConcrete=true;
 const supportRows=[];
 const stoolMaterial=new T.MeshStandardMaterial({color:0x9f342d,roughness:.55,metalness:.55});stoolMaterial.userData.storefront60Finish=true;
 const stools=[];
 function stool(index,angle){
  const radius=r+K.projection+.320,x=cx+radius*Math.cos(angle),z=cz+radius*Math.sin(angle);
  const group=new T.Group();group.name='DUKKAN__BAR29_TABURE_'+index;group.position.set(x,0,z);group.rotation.y=Math.atan2(-Math.cos(angle),-Math.sin(angle));root.add(group);
  function cylinder(name,rad,height,y,material=stoolMaterial){const geo=new T.CylinderGeometry(rad,rad,height,48);geo.translate(0,y+height/2,0);return add('TABURE_'+index+'_'+name,geo,material,group);}
  cylinder('YERE_BAGLI_TABAN_D220',.110,.008,.002);
  const tube=new T.Shape();tube.absarc(0,0,.030,0,Math.PI*2,false);const hole=new T.Path();hole.absarc(0,0,.027,0,Math.PI*2,true);tube.holes.push(hole);
  const post=new T.ExtrudeGeometry(tube,{depth:.684,bevelEnabled:false,curveSegments:32});post.rotateX(-Math.PI/2);post.translate(0,.016,0);add('TABURE_'+index+'_BORU_D60_ET3',post,stoolMaterial,group);
  cylinder('OTURAK_D320',.160,.012,.708);
  const bead=new T.TorusGeometry(.156,.004,10,64);bead.rotateX(Math.PI/2);bead.translate(0,.716,0);add('TABURE_'+index+'_YUVARLATILMIS_OTURAK_KENARI',bead,stoolMaterial,group);
  const foot=new T.Shape();foot.absarc(0,0,.115,0,Math.PI,false);foot.lineTo(-.030,0);foot.absarc(0,0,.030,Math.PI,0,true);foot.closePath();
  const pad=new T.ExtrudeGeometry(foot,{depth:.006,bevelEnabled:false,curveSegments:40}),P=pad.attributes.position;for(let i=0;i<P.count;i++){const xx=P.getX(i),zz=P.getY(i),yy=P.getZ(i);P.setXYZ(i,xx,.265+yy,zz);}const ids=[];for(let i=0;i<P.count;i+=3)ids.push(i,i+2,i+1);pad.setIndex(ids);pad.computeVertexNormals();add('TABURE_'+index+'_YARIM_AY_AYAK_DAYAMA',pad,stoolMaterial,group);
  for(let k=0;k<4;k++){const a=Math.PI/4+k*Math.PI/2;const bolt=new T.CylinderGeometry(.005,.005,.055,12);bolt.translate(.075*Math.cos(a),-.012,.075*Math.sin(a));add('TABURE_'+index+'_M10_ZEMIN_ANKRAJI_'+k,bolt,steel,group);}
  stools.push({center:[x,.720,z],seatDiameter:.320,angle});
 }
 stool(1,1.17);stool(2,.44);
 // 5 + .76 + 5 mm laminated straight upper light and lower moving light.

 const left=1.804,right=cx-.032,lowerY=[1.023,1.548],upperY=[1.551,2.031],lowerZ=2.926,upperZ=2.951;

 for(const [i,x]of [1.782,cx].entries())beam('PENCERE_BOSLUKLU_DIKME_'+i,[x,1.015,2.952],[x,2.050,2.952],.024,.100);

 function laminated(name,b,parent=root){const total=2*K.glass.ply+K.glass.interlayer,z=b[4];box(name+'_DIS_5MM',[b[0],b[1],b[2],b[3],z,z+.005],glass,parent);box(name+'_ARA_076',[b[0],b[1],b[2],b[3],z+.005,z+.00576],interlayer,parent);box(name+'_IC_5MM',[b[0],b[1],b[2],b[3],z+.00576,z+total],glass,parent);}

 laminated('SABIT_UST_LAMINE',[left,right,...upperY,upperZ,upperZ+.01076]);

 const sash=new T.Group();sash.name='DUKKAN__BAR29_YUKARI_KAYAN_KANAT';root.add(sash);

 laminated('HAREKETLI_ALT_LAMINE',[left,right,...lowerY,lowerZ,lowerZ+.01076],sash);

 for(const x of [left-.011,right])box('KANAT_YAN_PROFIL',[x,x+.011,lowerY[0]-.008,lowerY[1]+.008,lowerZ-.006,lowerZ+.017],trim,sash);

 for(const y of [lowerY[0]-.008,lowerY[1]])box('KANAT_YATAY_PROFIL',[left-.011,right+.011,y,y+.008,lowerZ-.006,lowerZ+.017],trim,sash);

 const handle=box('CAM_KALDIRMA_TUTAMAGI',[(left+right)/2-.065,(left+right)/2+.065,1.033,1.050,lowerZ-.040,lowerZ-.012],steel,sash);

 box('KANATLAR_ARASI_SILICI_CONTA',[left,right,lowerY[1],lowerY[1]+.008,lowerZ+.017,upperZ+.001],rubber,sash);

 // The two channels are on different planes; the lower sash overlaps behind the upper.

 const hardware=[];

 for(const [i,x]of [left-.025,right+.013].entries()){

  box('DENGE_MEKANIZMASI_YAN_KASET_'+i,[x-.012,x+.012,1.015,2.045,2.904,2.917],trim);

  for(const z of [lowerZ-.008,lowerZ+.014])box('KANAT_KILAVUZ_RAY_'+i,[x-.004,x+.004,1.015,2.040,z,z+.003],steel);

  box('YUZ_CONTASI_'+i,[x-.003,x+.003,1.020,2.032,lowerZ+.0108,lowerZ+.013],rubber);

  const drum=new T.CylinderGeometry(.015,.015,.012,24);drum.rotateZ(Math.PI/2);drum.translate(x,2.023,2.910);add('DENGE_YAYI_TAMBUR_'+i,drum);

  const cable=box('DENGE_CELIK_HALAT_'+i,[x-.0007,x+.0007,lowerY[1],2.038,2.908,2.9094],steel);hardware.push({cable,base:lowerY[1]});

 }

 box('ALT_SIZDIRMAZLIK_CONTASI',[left-.012,right+.012,1.014,1.023,lowerZ-.004,lowerZ+.015],rubber);

 box('UST_SIZDIRMAZLIK_CONTASI',[left-.012,right+.012,2.031,2.037,upperZ-.003,upperZ+.014],rubber);

 const lock=box('ICERIDEN_CAM_KILIDI',[left+.020,left+.055,1.042,1.068,lowerZ-.032,lowerZ-.008],black,sash);

 const catchMesh=box('ACIK_KONUM_EMNIYET_MANDALI',[right+.004,right+.030,1.495,1.525,lowerZ-.025,lowerZ-.005],steel);

 const state={value:0,target:0,locked:true,heldOpen:false};let lastPose=-1;

 const say=text=>IKIZ.parcaDurumYaz?.(text);

 function unlock(){if(state.value>.001)return false;state.locked=!state.locked;lock.material=state.locked?black:steel;say(state.locked?'Cam kilitlendi.':'Cam kilidi açıldı · cama basarak açabilirsin.');return true;}

 function open(){if(state.locked){say('Önce camın iç kilidini aç.');return false;}state.target=1;return true;}

 function release(){state.heldOpen=false;return true;}

 function close(){if(state.heldOpen){say('Önce açık konum emniyet mandalını serbest bırak.');return false;}state.target=0;return true;}

 const toggle=()=>{if(state.target>.5){release();return close();}return open();};

 sash.traverse(o=>{if(o.isMesh)o.userData.twinAction={kind:'elle',label:'Camı yukarı aç / kapat',toggle};});

 lock.userData.twinAction={kind:'elle',label:'Cam iç kilidini aç / kapat',toggle:unlock};

 catchMesh.userData.twinAction={kind:'elle',label:'Cam açık konum emniyetini bırak',toggle:release};

 function update(dt){const old=state.value,step=Math.min(.1,Math.max(0,dt||0))/1.2;if(!(state.locked&&state.target>state.value)&&!(state.heldOpen&&state.target<state.value))state.value+=Math.sign(state.target-state.value)*Math.min(step,Math.abs(state.target-state.value));

  if(old<1&&state.value===1)state.heldOpen=true;if(state.value===lastPose)return;lastPose=state.value;sash.position.y=state.value*K.glass.travel;

  for(const {cable,base}of hardware){const lo=base+sash.position.y,hi=2.038;if(hi>lo){cable.visible=true;cable.scale.y=hi-lo;cable.position.set(cable.userData.cableX,(hi+lo)/2,2.9087);}else cable.visible=false;}

 }

 for(const {cable}of hardware){cable.geometry.computeBoundingBox();cable.userData.cableX=cable.geometry.boundingBox.getCenter(new T.Vector3()).x;cable.geometry.dispose();cable.geometry=new T.BoxGeometry(.0014,1,.0014);}

 // Facade freezes static transforms. This sash and its changing cables stay dynamic.

 sash.userData.bar29Dynamic=true;for(const {cable}of hardware)cable.userData.bar29Dynamic=true;

 IKIZ.kancalar??=[];IKIZ.kancalar.push(update);

 const info={projection_mm:225,usableDepth_mm:225,top_mm:1015,roundedLip_mm:0,hiddenCantilevers:supportRows,monolithicConcrete:true,stools,servingWindowClear:true,

  canopyProjection_mm:0,glassLamination_mm:[5,.76,5],openingHeight_mm:480,curvedGlass:'fixed',straightGlass:'upper fixed / lower vertical sliding',insideLock:true,openPositionCatch:true,weatherSeals:true,runtimeGeometryReuse:true,mechanicalSizing:'concrete reinforcement, floor anchors and glass hardware require fabrication sizing'};

 IKIZ.disBar29={root,info,cam:{sash,state,open,close,unlock,release,update}};

 liste.push({ad:'DIS_BAR29',tur:'mobilya',kutu:[x0,cx+r+K.projection,.915,1.015,cz,cz+r+K.projection]});

 return IKIZ.disBar29;

}

