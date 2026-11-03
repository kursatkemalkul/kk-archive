import {robotHucreUyumKur} from './robot_hucre_uyum.js';
// Front service layout follows the marked drawing. Closed faces share one plane.
// Opening fractions come from the same production ST maintenance controller.
import {KAPAK_MONTAJ_SAHIBI} from './montaj_sahiplik.js';
import {SLUL,slulPoz,slulKur} from './slul.js';
export const KAPAK_ON=.082;
export const KAPAKLAR=[
 {id:1,ist:'A',ad:'Açıcı üst vidalı panel',tip:'vida',b:[.736,1.4345,1.343,2.197]},
 {id:2,ist:'TOP',ad:'Topping sol yalıtımlı kapak',tip:'sol',yalitim:true,b:[1.4375,1.9665,1.143,2.197]},
 {id:3,ist:'TOP',ad:'Topping sağ yalıtımlı kapak',tip:'sag',yalitim:true,b:[1.9695,2.4985,1.143,2.197]},
 {id:4,ist:'F',ad:'Fırın üst paralel kaldırma kapağı',tip:'ust',b:[2.5015,3.9985,1.805,2.197]},
 {id:5,ist:'E',ad:'Katlama üst paralel kaldırma kapağı',tip:'ust',b:[4.0015,5.2285,1.805,2.197]},
 {id:6,ist:'K',ad:'Kesme üst vidalı panel',tip:'vida',b:[4.003,4.399,1.143,1.802]},
 {id:7,ist:'E',ad:'Kutu alma üst vidalı panel',tip:'vida',b:[4.402,4.900,1.143,1.802]},
 {id:8,ist:'E',ad:'Katlama sağ üst vidalı panel',tip:'vida',b:[4.903,5.228,1.143,1.802]},
 {id:9,ist:'K',ad:'Tek parça alt havalandırma paneli',tip:'vida',vent:true,b:[4.003,4.399,.126,.789]},
 {id:10,ist:'E',ad:'Katlama alt sol menteşeli kapak',tip:'sol',b:[4.402,4.813,.126,.789]},
 {id:11,ist:'E',ad:'Katlama alt sağ menteşeli kapak',tip:'sag',b:[4.816,5.228,.126,.789]},
 {id:12,ist:'A',ad:'Hamur koyma mavi pleksi kaldırma kapağı',tip:'ust',pleksi:true,b:[.736,1.4345,.792,1.340]},
 {id:13,ist:'E',ad:'Pide kutusu mavi pleksi kaldırma kapağı',tip:'ust',pleksi:true,b:[4.402,4.900,.792,1.140]},
 {id:14,ist:'F',ad:'Fırın orta paralel kaldırma kapağı',tip:'ust',b:[2.5015,3.9985,1.303,1.802]},
 {id:15,ist:'F',ad:'Fırın alt vidalı şerit panel',tip:'vida',b:[2.5015,3.9985,1.143,1.300]}
];
export const SABIT_PLEKSI=[
 {id:'TOP',ist:'TOP',ad:'Topping alt sabit mavi pleksi',b:[1.4375,2.4985,.792,1.140]},
 {id:'F',ist:'F',ad:'Fırın alt sabit mavi pleksi',b:[2.5015,3.9985,.792,1.140]},
 {id:'K',ist:'K',ad:'Kesme alt sabit mavi pleksi',b:[4.003,4.399,.792,1.140]},
 {id:'E',ist:'E',ad:'Katlama sağ sabit mavi pleksi',b:[4.903,5.228,.792,1.140]}
];
// Standard SLUL dimensions are retained only where the existing leaf fits.
// Short machine guards and QR leaves use the authorized custom scaled geometry.
export function kapakSlulOlcegi(p){return Math.min(1,(p.id===4?.532:p.b[3]-p.b[2]+.012)/SLUL.travel);}
export function ustKapakPoz(p,v){const q=slulPoz(v,kapakSlulOlcegi(p));return {bottom:[p.b[2]+q.y,KAPAK_ON+q.out],top:[p.b[3]+q.y,KAPAK_ON+q.out],angle:0,...q,arm:SLUL.arm*q.scale};}
export function makineKapakKur(T,scene,IKIZ){
 robotHucreUyumKur(scene,IKIZ);
 if(IKIZ.makineKapaklari)return IKIZ.makineKapaklari;
 // Kemal 31 Eki ("eski modelleri komple sil"): yeni makine var — eski makinenin bu parçaları artık ÜRETİLMEZ (önceden üretilip yeni_makine.js sil() ile siliniyordu). Servis kapaklarını yeni makine kendi açar (yeni_makine.js SERVIS ← KAPAKLAR + servis_kapaklari).
 return IKIZ.makineKapaklari={records:[],update(){},replaced:[],frontPlane:KAPAK_ON,eskiUretilmez:true};
 const replaced=[];scene.traverse(o=>{
  if(/^A_ONYUZ__|^TOPPING_MODUL__on_seffaf|^TOPPING_EMNIYET_KAPAK|^F_UST_KAPAK__|^F_UST_KABIN__on_seffaf|^U_F_GOVDE__on_seffaf|^E_GOVDE__on_seffaf|^K_GOVDE__on_seffaf|^E_SERVIS_L_KAPAK$|^EMNIYET__.*KAPAK_F_|^F_MEK_BAG__.*KAPAK_F_|^K_KAPI__/.test(o.name)){o.visible=false;o.userData.serviceCoverReplaced=true;replaced.push(o.name);}
 });
 // Remove only the old enclosure's front skin. Interior machinery and the
 // structural side/roof sheets remain. This also removes the old split vent lip.
 const cuts=[...KAPAKLAR,...SABIT_PLEKSI].map(p=>[...p.b,.049,.132]);
 scene.updateMatrixWorld(true);
 scene.traverse(o=>{
  if(!o.isMesh||!/^((U_(F|KE)_GOVDE|K_GOVDE|E_GOVDE|A_GOVDE)__(sac|on_seffaf|paslanmaz|kabuk|siyah|plastik|conta|celik|baglanti))$/.test(o.name))return;
  const g=o.geometry,pos=g.attributes.position,ix=g.index,w=new T.Vector3(),inverse=o.matrixWorld.clone().invert();let triangles=[];
  for(let i=0;i<(ix?ix.count:pos.count);i+=3)triangles.push([0,1,2].map(j=>w.fromBufferAttribute(pos,ix?ix.getX(i+j):i+j).applyMatrix4(o.matrixWorld).toArray()));
  function clip(poly,axis,bound,below){const out=[],inside=p=>below?p[axis]<=bound:p[axis]>=bound;for(let i=0;i<poly.length;i++){const a=poly[i],b=poly[(i+1)%poly.length],aa=inside(a),bb=inside(b);if(aa)out.push(a);if(aa!==bb){const t=(bound-a[axis])/(b[axis]-a[axis]);out.push(a.map((v,j)=>v+(b[j]-v)*t));}}return out;}
  for(const cut of cuts){const next=[];for(let poly of triangles){const min=[0,1,2].map(a=>Math.min(...poly.map(p=>p[a]))),max=[0,1,2].map(a=>Math.max(...poly.map(p=>p[a])));if(max[0]<cut[0]||min[0]>cut[1]||max[1]<cut[2]||min[1]>cut[3]||max[2]<cut[4]||min[2]>cut[5]){next.push(poly);continue;}
    for(const [a,b,low]of [[0,cut[0],true],[0,cut[1],false],[1,cut[2],true],[1,cut[3],false],[2,cut[4],true],[2,cut[5],false]]){if(poly.length<3)break;const outside=clip(poly,a,b,low);if(outside.length>=3)next.push(outside);poly=clip(poly,a,b,!low);}
   }triangles=next;}
  const out=[];for(const p of triangles)for(let j=1;j<p.length-1;j++)for(const q of[p[0],p[j],p[j+1]])out.push(...w.fromArray(q).applyMatrix4(inverse).toArray());
  const replacement=new T.BufferGeometry();replacement.setAttribute('position',new T.Float32BufferAttribute(out,3));replacement.computeVertexNormals();replacement.computeBoundingBox();replacement.computeBoundingSphere();o.geometry=replacement;o.userData.frontSkinRebuilt=true;
 });
 const root=new T.Group();root.name='MAKINE_SERVIS_KAPAKLARI';scene.add(root);const records=[];
 const steel=new T.MeshStandardMaterial({color:0xb9bec4,metalness:.65,roughness:.38}),dark=new T.MeshStandardMaterial({color:0x454a50,metalness:.65,roughness:.4}),seal=new T.MeshStandardMaterial({color:0x263037,roughness:.9}),inner=new T.MeshStandardMaterial({color:0xdde2e5,metalness:.4,roughness:.45}),foam=new T.MeshStandardMaterial({color:0xcac4a0,roughness:1});
 const plexi=new T.MeshPhysicalMaterial({color:0x3295bf,transparent:true,opacity:.24,roughness:.15,metalness:0,depthWrite:false,side:T.DoubleSide,thickness:.006,ior:1.49});plexi.userData.preserveServicePlexi=true;
 function box(parent,name,b,mat=steel){const o=new T.Mesh(new T.BoxGeometry(b[1]-b[0],b[3]-b[2],b[5]-b[4]),mat);o.position.set((b[0]+b[1])/2,(b[2]+b[3])/2,(b[4]+b[5])/2);o.name=name;parent.add(o);return o;}
 function ring(parent,name,b,width,z0,z1,mat){const[x0,x1,y0,y1]=b;for(const [n,r]of [['SOL',[x0,x0+width,y0,y1,z0,z1]],['SAG',[x1-width,x1,y0,y1,z0,z1]],['ALT',[x0+width,x1-width,y0,y0+width,z0,z1]],['UST',[x0+width,x1-width,y1-width,y1,z0,z1]]])box(parent,name+'_'+n,r,mat);}
 function rod(parent,name,a,b,r=.003){const d=b.clone().sub(a),o=new T.Mesh(new T.CylinderGeometry(r,r,d.length(),12),steel);o.name=name;o.position.copy(a).addScaledVector(d,.5);o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),d.normalize());parent.add(o);return o;}
 const eJamb=box(root,'SERVIS_KAPAK_E_SAG_TASIYICI',[4.900,4.903,.792,1.802,KAPAK_ON-.046,KAPAK_ON-.026],steel);eJamb.userData.kapakIstasyon='E';
 for(const p of [...KAPAKLAR,...SABIT_PLEKSI.map(p=>({...p,tip:'sabit',pleksi:true}))]){
  const holder=new T.Group();holder.name='SERVIS_KAPAK_'+p.id;holder.userData.kapakIstasyon=KAPAK_MONTAJ_SAHIBI[p.id]||p.ist;root.add(holder);
  const door=new T.Group();door.name='SERVIS_KAPAK_KANAT_'+p.id;holder.add(door);
  const[x0,x1,y0,y1]=p.b,cx=(x0+x1)/2,cy=(y0+y1)/2,w=x1-x0,h=y1-y0,hinge=p.tip==='sol'?x0:x1,thick=p.pleksi ? .006 : .0015,skinBack=KAPAK_ON-thick;
  // Recessed flange and compressible gasket back every closed joint. Nothing
  // projects beyond the common front plane; 3 mm operating seams have a backing.
  ring(holder,'SERVIS_KAPAK_OTURMA_'+p.id,[x0-.0015,x1+.0015,y0-.0015,y1+.0015],.014,KAPAK_ON-.026,KAPAK_ON-.024,steel);
  ring(door,'SERVIS_KAPAK_CONTA_'+p.id,p.b,.007,KAPAK_ON-.023,KAPAK_ON-.019,seal);
  if(p.vent){const shape=new T.Shape();shape.moveTo(x0,y0);shape.lineTo(x1,y0);shape.lineTo(x1,y1);shape.lineTo(x0,y1);shape.closePath();for(let y=y0+.045;y<y1-.03;y+=.018){const q=new T.Path();q.moveTo(x0+.035,y);q.lineTo(x0+.035,y+.006);q.lineTo(x1-.035,y+.006);q.lineTo(x1-.035,y);q.closePath();shape.holes.push(q);}const panel=new T.Mesh(new T.ExtrudeGeometry(shape,{depth:thick,bevelEnabled:false}),dark);panel.position.z=skinBack;panel.name='SERVIS_KAPAK_TEK_PARCA_MENFEZ_'+p.id;door.add(panel);box(door,'SERVIS_KAPAK_MENFEZ_FILTRE_'+p.id,[x0+.028,x1-.028,y0+.028,y1-.028,KAPAK_ON-.025,KAPAK_ON-.022],new T.MeshStandardMaterial({color:0x151b1f,roughness:1}));}
  else if(p.id===10){const sh=new T.Shape();sh.moveTo(x0,y0);sh.lineTo(x1,y0);sh.lineTo(x1,y1);sh.lineTo(x0,y1);sh.closePath();const mouth=new T.Path();mouth.moveTo(4.420,.600);mouth.lineTo(4.420,.744);mouth.lineTo(4.606,.744);mouth.lineTo(4.606,.600);mouth.closePath();sh.holes.push(mouth);const skin=new T.Mesh(new T.ExtrudeGeometry(sh,{depth:thick,bevelEnabled:false}),steel);skin.position.z=skinBack;skin.name='SERVIS_KAPAK_COP_AGZI_10';door.add(skin);}
  else box(door,'SERVIS_KAPAK_' +(p.pleksi?'MAVI_PLEKSI_':'SAC_')+p.id,[x0,x1,y0,y1,skinBack,KAPAK_ON],p.pleksi?plexi:steel);
  ring(door,'SERVIS_KAPAK_ARKA_BUKUM_'+p.id,p.b,.0015,KAPAK_ON-.018,skinBack,steel);
  if(p.yalitim){box(door,'SERVIS_KAPAK_PIR_40MM_'+p.id,[x0+.012,x1-.012,y0+.012,y1-.012,KAPAK_ON-.043,KAPAK_ON-.003],foam);box(door,'SERVIS_KAPAK_HIJYEN_IC_SAC_'+p.id,[x0+.010,x1-.010,y0+.010,y1-.010,KAPAK_ON-.0445,KAPAK_ON-.043],inner);ring(door,'SERVIS_KAPAK_TERMAL_KOPRU_'+p.id,p.b,.010,KAPAK_ON-.0445,skinBack,seal);ring(holder,'SERVIS_KAPAK_MIKNATIS_CONTA_'+p.id,p.b,.008,KAPAK_ON-.049,KAPAK_ON-.045,seal);}
  if(p.tip==='vida')for(const x of[x0+.018,x1-.018])for(const y of[y0+.018,y1-.018]){const screw=new T.Mesh(new T.CylinderGeometry(.0045,.0045,.0015,16),steel);screw.name='SERVIS_KAPAK_GOMME_VIDA_'+p.id;screw.rotation.x=Math.PI/2;screw.position.set(x,y,KAPAK_ON-.00075);door.add(screw);const socket=new T.Mesh(new T.CircleGeometry(.002,6),seal);socket.name='SERVIS_KAPAK_ALYAN_YUVA_'+p.id;socket.position.set(x,y,KAPAK_ON+.00002);door.add(socket);}
  if(['sol','sag'].includes(p.tip)){for(const y of[y0+.10,y1-.10])rod(door,'SERVIS_KAPAK_GIZLI_MENTESE_'+p.id,new T.Vector3(hinge,y-.025,KAPAK_ON-.013),new T.Vector3(hinge,y+.025,KAPAK_ON-.013),.004);const gx=p.tip==='sol'?x1-.021:x0+.021;box(door,'SERVIS_KAPAK_GOMME_KOL_'+p.id,[gx-.003,gx+.003,cy-.04,cy+.04,KAPAK_ON-.0008,KAPAK_ON-.0001],seal);}
  const arms=[];
  if(p.tip==='ust'){
   for(const [side,x]of [['SOL',x0+.025],['SAG',x1-.025]])arms.push(slulKur(T,holder,{name:'SERVIS_KAPAK_'+p.id+'_'+side,x,bottom:y0,face:KAPAK_ON,scale:kapakSlulOlcegi(p),material:steel,leafThickness:thick}));
   rod(door,'SERVIS_KAPAK_SLUL_SENKRON_MIL_'+p.id,new T.Vector3(x0+.025,y0+.055,KAPAK_ON-thick-.010),new T.Vector3(x1-.025,y0+.055,KAPAK_ON-thick-.010),.004);
  }
  const origin=new T.Vector3(p.tip==='ust'?cx:hinge,p.tip==='ust'?y0:0,KAPAK_ON);door.position.copy(origin);for(const o of door.children)o.position.sub(origin);
  if(p.id===1){scene.updateMatrixWorld(true);const tablets=[];scene.traverse(o=>{if(o.isMesh&&/^MAKINE_TABLET/.test(o.name))tablets.push(o);});for(const o of tablets)door.attach(o);}
  if(p.tip!=='sabit'){const action={kind:'makineKapak',id:p.id,label:p.ad};door.traverse(o=>{if(o.isMesh)o.userData.twinAction=action;});}
  function pose(v){v=Math.max(0,Math.min(1,v));
   if(p.tip==='ust'){const q=ustKapakPoz(p,v);door.position.set(cx,...q.bottom);door.rotation.set(0,0,0);for(const a of arms)a.pose(v);}
   else if(p.tip==='vida'){door.position.z=origin.z+.08*Math.min(1,v*2);door.visible=v<.999;}
   else if(p.tip!=='sabit')door.rotation.y=(p.tip==='sol'?-1:1)*v*Math.PI/2;
   holder.updateMatrixWorld(true);
  }
  pose(0);records.push({p,holder,door,pose,value:0,arms});
 }
 function update(dt=.016){const replay=IKIZ.zamanModu==='kayit',f=replay?IKIZ.kayitKare:IKIZ.son;for(const r of records){const v=r.p.tip==='sabit'?0:f?.servis_kapaklari?.[r.p.id]?.konum??0;r.value=replay||Math.abs(v-r.value)>.25?v:r.value+(v-r.value)*Math.min(1,dt/.045);if(Math.abs(v-r.value)<.0001)r.value=v;r.pose(r.value);if(r.p.id===1){const e=IKIZ.ekranlar3b?.machine;if(e){e.originalKapakKonum??=e.o.position.clone();e.o.position.copy(e.originalKapakKonum);e.o.position.z+=.08*Math.min(1,r.value*2);e.mask.position.copy(e.o.position).addScaledVector(e.normal,.0001);e.el.hidden=r.value>=.999;if(r.value>=.999)e.mask.visible=false;}}}}
 IKIZ.kancalar??=[];IKIZ.kancalar.push(update);IKIZ.makineKapaklari={records,update,replaced,frontPlane:KAPAK_ON,insulation_mm:40,lift:'SLUL drawing-derived / custom size',sources:[SLUL.source,'https://www.panels.kingspan.com/en-au/products/cold-storage/k-pir-coldstore-panel']};return IKIZ.makineKapaklari;
}
