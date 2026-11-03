import {mergeGeometries} from '../vendor/BufferGeometryUtils.js';
// E transfer_kapak29: removable black shell, arm aperture, sheet mounting tray.
// Same slulKur linkage; this adaptation sizes the case around the QR mechanism.
export function mekanizma34(T,M,ctx){
 const black=new T.MeshStandardMaterial({color:0x111418,roughness:.58}),steel=new T.MeshStandardMaterial({color:0xb7bec4,metalness:.65,roughness:.38});
 const mesh=(name,geom,mat,parent=M.groups.mekanizma)=>{const o=new T.Mesh(geom,mat);o.name=name;parent.add(o);return o;};
 const box=(name,b,mat=steel,parent=M.groups.mekanizma)=>mesh(name,new T.BoxGeometry(b[1]-b[0],b[3]-b[2],b[5]-b[4]).translate((b[0]+b[1])/2,(b[2]+b[3])/2,(b[4]+b[5])/2),mat,parent);
 const cylinder=(name,R,L,pos,parent=M.groups.mekanizma,mat=steel)=>{const o=mesh(name,new T.CylinderGeometry(R,R,L,16).rotateX(Math.PI/2),mat,parent);o.position.copy(pos);return o;};
 const moving=[],cases=[];
 M.root.updateMatrixWorld(true);
 const descriptors=[],cuts=Array.from({length:6},()=>[]),D=[16,116,124];
 for(const r of M.doors.records.filter(r=>r.kind==='eye'))for(const[hi,h]of r.hardware.entries()){
  const fixed=[];h.root.traverse(o=>{if(o.isMesh&&/_(GOVDE|YAN_KORUMA|AMORTISOR_GOVDESI)$/.test(o.name))fixed.push(o);});let B=new T.Box3();for(const o of fixed)B.union(new T.Box3().setFromObject(o));
  const dx=hi===0?1:-1,dz=r.side==='ROBOT'?1:-1,wall=hi===0?r.x0:r.x1,origin=[wall+dx*1.2,B.min.y-1.8,r.side==='ROBOT'?B.min.z-1.8:B.max.z+1.8],local=b=>{const lo=b.min.toArray(),up=b.max.toArray();return new T.Box3(new T.Vector3(...lo.map((v,k)=>Math.min((v-origin[k])*(k===0?dx:k===2?dz:1),(up[k]-origin[k])*(k===0?dx:k===2?dz:1)))),new T.Vector3(...lo.map((v,k)=>Math.max((v-origin[k])*(k===0?dx:k===2?dz:1),(up[k]-origin[k])*(k===0?dx:k===2?dz:1)))));};
  descriptors.push({r,hi,h,origin,dx,dz});
  // Four handed/front/rear representatives define ONE common cut pattern.
  if(r.id.startsWith('G01_')){const boxes=[];for(let i=0;i<=40;i++){h.pose(i/40);M.root.updateMatrixWorld(true);h.root.traverse(o=>{if(o.isMesh&&!fixed.includes(o)){const b=new T.Box3().setFromObject(o);b.expandByScalar(.65);boxes.push(local(b));}});}h.pose(0);M.root.updateMatrixWorld(true);M.groups.mekanizma.traverse(o=>{if(o.isMesh&&o.userData.mechanismMount&&o.name.startsWith(r.id+'_'+(hi===0?'SOL':'SAG')))boxes.push(local(new T.Box3().setFromObject(o)));});
   for(let ax=0;ax<3;ax++)for(let side=0;side<2;side++){const uv=[0,1,2].filter(k=>k!==ax),c=side?D[ax]-1.2:0;for(const b of boxes)if(b.min.getComponent(ax)<c+1.2&&b.max.getComponent(ax)>c)cuts[ax*2+side].push([Math.floor(b.min.getComponent(uv[0])*10)/10,Math.ceil(b.max.getComponent(uv[0])*10)/10,Math.floor(b.min.getComponent(uv[1])*10)/10,Math.ceil(b.max.getComponent(uv[1])*10)/10]);}
  }
 }
 const panels=[];for(let ax=0;ax<3;ax++)for(let side=0;side<2;side++){const uv=[0,1,2].filter(k=>k!==ax),c=side?D[ax]-1.2:0,H=cuts[ax*2+side];if(ax===2&&!side)H.push([1,15,0,116]);const reduced=H.filter((h,i)=>!H.some((q,j)=>j!==i&&q[0]<=h[0]&&q[1]>=h[1]&&q[2]<=h[2]&&q[3]>=h[3]&&(j<i||q.some((x,k)=>x!==h[k]))));let a=0,b=D[uv[0]],y=0,z=D[uv[1]];if(ax!==0){if(uv[0]===0){a+=1.2;b-=1.2;}if(uv[1]===0){y+=1.2;z-=1.2;}}if(ax===2){y+=1.2;z-=1.2;}const g=ctx.cutGeometry([a,b,y,z],reduced,1.2);if(ax===0)g.applyMatrix4(new T.Matrix4().set(0,0,1,c,1,0,0,0,0,1,0,0,0,0,0,1));else if(ax===1)g.applyMatrix4(new T.Matrix4().set(1,0,0,0,0,0,1,c,0,1,0,0,0,0,0,1));else g.translate(0,0,c);if(g.attributes.position.count)panels.push(g);}
 const common=mergeGeometries(panels,false);black.side=T.DoubleSide;for(const d of descriptors){const o=mesh(d.r.id+'_E_SIYAH_KABUK_'+d.hi,common,black);o.position.fromArray(d.origin);o.scale.set(d.dx,1,d.dz);o.userData={case34:true,door33:d.r.id,unit37:true,size_mm:D,source:'COMMON_QR_CASE_37'};cases.push(o);}
 // E-style Southco A4 closure: annular keeper, shaped M6 pin and rear L mount.
 // Installed on service leaves; QR eyes retain their existing driven hold arrangement.
 for(const r of M.doors.records.filter(r=>r.kind==='service')){
  const x=r.hinge==='top'?r.x0+90:r.x1-24,y=r.hinge==='top'?r.y0+22:(r.id.startsWith('PIN')?1000:(r.y0+r.y1)/2),z=8;
  const keeper=ctx.cutGeometry([x-12.5,x+12.5,y-20,y+20],[[x-5.2,x+5.2,y-5.2,y+5.2]],2.6);keeper.translate(0,0,z);mesh(r.id+'_SOUTHCO_A4_26_502_10_KARSILIK',keeper,steel,r.leaf);
  if(r.id.startsWith('PIN'))box(r.id+'_KARSILIK_ARA_PLAKA',[x-12.5,x+12.5,y-20,y+20,3.5,8],steel,r.leaf);
  const P=[[0,-13],[3,-13],[3,0],[8.58,0],[8.58,1],[7.6,1],[7.6,3],[8.2,4.2],[7.6,5.4],[8.2,6.6],[7.6,7.8],[8.2,9],[7.6,10.2],[7.6,12.4],[4.775,12.4],[4.775,24.85],[3.3,26.35],[0,26.35]],g=new T.LatheGeometry(P.map(([a,b])=>new T.Vector2(a,b)),24);g.rotateX(-Math.PI/2);g.translate(x,y,35.85);mesh(r.id+'_SOUTHCO_A4_99_162_PIM',g,steel);

  // Mount behind the pin, with short attachment to the nearest aperture edge.
  const baseY=r.y0-(r.id.startsWith('UST_TEKNIK')?1:0),endX=r.hinge==='top'?x+15:r.x1;const plate=ctx.cutGeometry([x-15,endX,y-12,y+12],[[x-3.2,x+3.2,y-3.2,y+3.2]],3);plate.translate(0,0,36);mesh(r.id+'_MANDAL_L_AYAK_M6_DELIKLI',plate,steel);
  if(r.hinge==='top'){box(r.id+'_MANDAL_L_BACAK',[x-15,x+15,baseY+1,y-12,36,39]);box(r.id+'_MANDAL_L_DONUS',[x-15,x+15,baseY,baseY+1,8,36]);}
  else box(r.id+'_MANDAL_L_DONUS',[r.x1-2,r.x1,y-12,y+12,7,36]);

  const ns=new T.Shape();for(let i=0;i<6;i++){const a=i*Math.PI/3;i?ns.lineTo(5.77*Math.cos(a),5.77*Math.sin(a)):ns.moveTo(5.77,0);}ns.closePath();const nh=new T.Path();nh.absarc(0,0,3.1,0,Math.PI*2,true);ns.holes.push(nh);const ng=new T.ExtrudeGeometry(ns,{depth:5.2,bevelEnabled:false,curveSegments:12});ng.translate(x,y,40.4);const nut=mesh(r.id+'_MANDAL_M6_SOMUN',ng,steel);nut.userData.closure34=true;

 }
 // Paired gas struts for the four upper service leaves. Tube and rod terminate
 // at physical ball centres; absolute pose prevents accumulation during scrubbing.
 const struts=[];
 for(const r of M.doors.records.filter(r=>r.kind==='service'&&r.hinge==='top'))for(const[side,x]of[['SOL',r.x0+32],['SAG',r.x1-32]]){
  const A=new T.Vector3(x,r.pivot33.y-300,180),L=new T.Vector3(x,r.pivot33.y-45,16),body=mesh(r.id+'_'+side+'_GAZLI_AMORTISOR_D18',new T.CylinderGeometry(9,9,208,16),black),rod=mesh(r.id+'_'+side+'_AMORTISOR_MIL_D8',new T.CylinderGeometry(4,4,1,12),steel),joints=[mesh(r.id+'_'+side+'_SABIT_ROTIL',new T.SphereGeometry(6,12,8),steel),mesh(r.id+'_'+side+'_KANAT_ROTIL',new T.SphereGeometry(6,12,8),steel)];
  box(r.id+'_'+side+'_PROFIL_ROTIL_KULAK',[x-9,x+9,A.y-9,A.y+9,186,190]);box(r.id+'_'+side+'_GAZ_KANAT_KULAK',[x-9,x+9,L.y-9,L.y+9,8,10],steel,r.leaf);
  const necks=[mesh(r.id+'_'+side+'_ALT_MAFSAL_BOYUN',new T.CylinderGeometry(3,3,12,12),steel),mesh(r.id+'_'+side+'_UST_MAFSAL_BOYUN',new T.CylinderGeometry(3,3,12,12),steel)];
  const update=()=>{r.leaf.updateMatrix();const B=L.clone().applyMatrix4(r.leaf.matrix),v=B.clone().sub(A),len=v.length(),u=v.clone().normalize(),q=new T.Quaternion().setFromUnitVectors(new T.Vector3(0,1,0),u);body.quaternion.copy(q);rod.quaternion.copy(q);body.position.copy(A).addScaledVector(u,116);rod.scale.y=Math.max(.01,len-232);rod.position.copy(A).addScaledVector(u,(208+len)/2);for(const[i,n]of necks.entries()){n.quaternion.copy(q);n.position.copy(A).addScaledVector(u,i?len-6:6);}joints[0].position.copy(A);joints[1].position.copy(B);struts.find(s=>s.body===body).length_mm=len;};r.moving34??=[];r.moving34.push(body,rod,...joints,...necks);for(const o of[body,rod,...joints,...necks])o.userData={door33:r.id,strut34:true};struts.push({door:r.id,body,rod,joints,update,length_mm:0});const old=r.pose;r.pose=v=>{old(v);update();};r.pose(0);
 }
 const families=new Map();M.root.traverse(o=>{if(o.isMesh&&/_(PINET42_TOPUZ|PINET_KANAT_DILI|PINET_SABIT_DIL|E_SIYAH_KABUK)_/.test(o.name)){const prefix=o.name.replace(/_(PINET42_TOPUZ|PINET_KANAT_DILI|PINET_SABIT_DIL)_.*$/,'_PINET_BIRLESIK').replace(/(_E_SIYAH_KABUK_[01])_[012]_[01]$/,'$1'),key=prefix+'|'+o.parent.uuid+'|'+o.material.uuid;if(!families.has(key))families.set(key,[]);families.get(key).push(o);}});
 const removed=new Set();for(const os of families.values()){if(os.length===1)continue;const geom=mergeGeometries(os.filter(o=>o.geometry.attributes.position.count).map(o=>{o.updateMatrix();return (o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone()).applyMatrix4(o.matrix);}),false);if(!geom)continue;const o=mesh(os[0].name.replace(/_(PINET42_TOPUZ|PINET_KANAT_DILI|PINET_SABIT_DIL)_.*$/,'_PINET_BIRLESIK').replace(/(_E_SIYAH_KABUK_[01])_[012]_[01]$/,'$1'),geom,os[0].material,os[0].parent);if(o.name.endsWith('_PINET_BIRLESIK'))o.name+='_'+(os[0].userData.hingeMount?'SABIT_DIL':os[0].parent===M.groups.mekanizma?'SABIT_TOPUZ':'KANAT');o.userData={...os[0].userData};for(const a of os){removed.add(a.name);a.removeFromParent();}}for(let i=M.parts.length-1;i>=0;i--)if(removed.has(M.parts[i].name))M.parts.splice(i,1);
 M.root.updateMatrixWorld(true);const known=new Set(M.parts.map(p=>p.name));M.root.traverse(o=>{if(o.isMesh&&!known.has(o.name)){const b=new T.Box3().setFromObject(o);M.parts.push({name:o.name,group:'mekanizma',min:b.min.toArray(),max:b.max.toArray()});known.add(o.name);}});const actualCases=[];M.root.traverse(o=>{if(o.isMesh&&o.userData.case34)actualCases.push(o);});return {cases:actualCases,struts};
}
