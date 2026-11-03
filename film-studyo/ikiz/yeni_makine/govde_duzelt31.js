import {mergeGeometries} from '../vendor/BufferGeometryUtils.js';
// Scoped body/service corrections; the running PLC and motion contracts stay intact.
export function govdeDuzelt31(T,body){
  const report={upperLinesRemoved:0,upperLinesBuilt:0};
  body.updateMatrixWorld(true);
  const upper=body.getObjectByName('YMK_E_MEK'),lines=new Set(),meshes=new Set();
  const shell=o=>{let ist,kat;for(let q=o;q;q=q.parent){ist??=q.userData.ist;kat??=q.userData.kat;}return ist==='E'&&['kapak','yan','arka','cati','taban'].includes(kat);};
  body.traverse(o=>{if(!shell(o))return;if(o.isLineSegments)lines.add(o);if(o.isMesh)meshes.add(o);});
  upper?.traverse(o=>{if(o.isLineSegments)lines.add(o);if(o.isMesh)meshes.add(o);});
  // Discard historical outline siblings; derive edges only from the final solid.
  for(const o of lines)o.removeFromParent();report.upperLinesRemoved=lines.size;
  const mat=new T.LineBasicMaterial({color:0x222426,transparent:true,opacity:.55});
  for(const o of meshes){const g=new T.EdgesGeometry(o.geometry,30);if(!g.attributes.position.count){g.dispose();continue;}const l=new T.LineSegments(g,mat);l.name=o.name+'_GERCEK_KENAR31';l.userData={...o.userData,kat:o.userData.kat||'kapak',ist:'E'};l.raycast=()=>{};o.add(l);report.upperLinesBuilt++;}
  const vent=body.getObjectByName('YMK_B_MENFEZ_KANAT');if(!vent)throw Error('B menfez kanadı eksik');
  // The grille has spring catches, no invented hinge. A detached service preview
  // first pulls it free, then tilts it clear of the aperture like a removed cover.
  const pivot=new T.Vector3(4.200,.083,.079),axis=new T.Vector3(1,0,0);
  const ventPose=value=>{const v=Math.max(0,Math.min(1,value)),pull=.16*Math.min(1,v/.35),angle=75*Math.PI/180*Math.max(0,(v-.35)/.65);vent.quaternion.setFromAxisAngle(axis,angle);vent.position.copy(pivot).sub(pivot.clone().applyQuaternion(vent.quaternion));vent.position.z+=pull;vent.updateMatrix();};
  ventPose(0);
  const hit=new T.Mesh(new T.PlaneGeometry(.397,.367),new T.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false,colorWrite:false,side:T.DoubleSide}));hit.name='B_MENFEZ_TIKLAMA_YUZEYI31';hit.position.set(4.2,.269,.0792);hit.userData={ist:'B',kat:'kapak',serviceHit31:true};hit.material.userData.serviceHit31=true;vent.add(hit);
  // The empty aperture remains clickable to put the removed grille back.
  const aperture=hit.clone();aperture.geometry=hit.geometry.clone();aperture.name='B_MENFEZ_ACIKLIK_TIKLAMA31';body.getObjectByName('YMK_B_MENFEZ').add(aperture);
  return {report,ventPose};
}

export function bDepo31(T,mk,api){
  const p=api.P?.find(p=>p.ad==='Çekmece kutusu'&&p.eksen==='B_DEPO'&&p.kutu_mm[3]-p.kutu_mm[0]>200);
  const root=p&&mk.getObjectByName('B_P'+p.id);if(!root)throw Error('B depo kutusu bulunamadı');
  const mesh=root.userData.ic?.children.find(o=>o.isMesh);if(!mesh)throw Error('B depo gerçek ağı eksik');
  mk.updateMatrixWorld(true);const B=new T.Box3().setFromObject(mesh),[x0,y0,z0]=B.min.toArray(),[x1,y1,z1]=B.max.toArray(),t=.0015;
  const bs=[[x0,x1,y0,y0+t,z0,z1],[x0,x0+t,y0+t,y1,z0,z1],[x1-t,x1,y0+t,y1,z0,z1],[x0+t,x1-t,y0+t,y1,z0,z0+t],[x0+t,x1-t,y0+t,y1,z1-t,z1]];
  const gs=bs.map(b=>new T.BoxGeometry(b[1]-b[0],b[3]-b[2],b[5]-b[4]).translate((b[0]+b[1])/2,(b[2]+b[3])/2,(b[4]+b[5])/2));
  const g=mergeGeometries(gs);gs.forEach(g=>g.dispose());g.applyMatrix4(mesh.matrixWorld.clone().invert());mesh.geometry=g;mesh.userData.duzelt31=true;
  const ic=root.userData.ic;for(const o of [...ic.children])if(o.isLineSegments)o.removeFromParent();
  const edge=new T.LineSegments(new T.EdgesGeometry(g,30),new T.LineBasicMaterial({color:0x222426,transparent:true,opacity:.55}));edge.userData={...mesh.userData,kenar:true};ic.add(edge);
  return {id:p.id,openTop:true,sheet_mm:1.5,envelope_mm:[(x1-x0)*1000,(y1-y0)*1000,(z1-z0)*1000]};
}

// Remove only the unused outboard tip; retain the two M5 mounting holes and
// the complete DRRD bracket. The cut receives a real closed 6 mm end face.
export function ePlaka31(T,mk){
  const root=mk.getObjectByName('E_P110'),ic=root?.userData.ic||root,mesh=ic?.children.find(o=>o.isMesh);
  if(!mesh)throw Error('E baskı bağlantı plakası eksik');
  mk.updateMatrixWorld(true);const W=mesh.matrixWorld.clone(),src=(mesh.geometry.index?mesh.geometry.toNonIndexed():mesh.geometry.clone()).applyMatrix4(W),B=new T.Box3().setFromObject(mesh),cut=5.2495;
  if(B.max.x<=cut+.0001)return {trim_mm:0};
  const A=Object.entries(src.attributes),out=Object.fromEntries(A.map(([k])=>[k,[]]));
  const vertex=i=>Object.fromEntries(A.map(([k,a])=>[k,Array.from({length:a.itemSize},(_,j)=>a.array[i*a.itemSize+j])]));
  const emit=p=>{for(let i=1;i<p.length-1;i++)for(const v of[p[0],p[i],p[i+1]])for(const[k]of A)out[k].push(...v[k]);};
  for(let i=0;i<src.attributes.position.count;i+=3){const p=[vertex(i),vertex(i+1),vertex(i+2)],q=[];for(let j=0;j<3;j++){const a=p[j],b=p[(j+1)%3],ia=a.position[0]<=cut,ib=b.position[0]<=cut;if(ia)q.push(a);if(ia!==ib){const t=(cut-a.position[0])/(b.position[0]-a.position[0]);q.push(Object.fromEntries(A.map(([k])=>[k,a[k].map((v,n)=>v+(b[k][n]-v)*t)])));}}emit(q);}
  const yz=[[B.min.y,B.min.z],[B.max.y,B.min.z],[B.max.y,B.max.z],[B.min.y,B.max.z]],cap=yz.map(([y,z])=>Object.fromEntries(A.map(([k,a])=>[k,k==='position'?[cut,y,z]:k==='normal'?[1,0,0]:Array(a.itemSize).fill(0)])));emit(cap);
  const g=new T.BufferGeometry();for(const[k,a]of A)g.setAttribute(k,new T.Float32BufferAttribute(out[k],a.itemSize));g.applyMatrix4(W.invert());g.computeBoundingBox();g.computeBoundingSphere();mesh.geometry=g;mesh.userData.duzelt31=true;src.dispose();
  for(const o of[...ic.children])if(o.isLineSegments)o.removeFromParent();const line=new T.LineSegments(new T.EdgesGeometry(g,30),new T.LineBasicMaterial({color:0x222426,transparent:true,opacity:.55}));line.userData={...mesh.userData,kenar:true};ic.add(line);
  return {part:110,trim_mm:Math.round((B.max.x-cut)*1000),endX_mm:cut*1000,retainedMountingHoles:2};
}
