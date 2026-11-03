import * as T from 'three';
// Single assembly boundary table: upper cabinets are independent assemblies,
// not an oven/folding view sliced to include the cabinet above it.
export const MONTAJ_SINIR={
 A:[.730,1.436,.790,2.78,-.845,.083],TOP:[1.436,2.5,.790,2.78,-.845,.083],
 F:[2.5,4,.788,1.305,-.845,.083],UF:[2.5,4,1.303,2.206,-.845,.083],
 K:[4,4.4,.788,2.200,-.921,.079],E:[4.402,5.292,.0,2.200,-.921,.079],
 UKE:[4,5.235,1.805,2.200,-.845,.083],B:[.730,4.400,.02,.790,-.845,.083]
};
// Assembly ownership is independent of the PLC maintenance actuator number.
export const KAPAK_MONTAJ_SAHIBI={4:'UF',14:'UF',5:'UKE',9:'B'};
export const UST_KAPAK_SAHIBI=KAPAK_MONTAJ_SAHIBI;
export function ustMontaj(n){
 if(/^(U_F_|ELK_ANA_PANO_UF|F_DAVLUMBAZ|F_KOMP_AYAK|F_UST_KABIN__|F_UST_KABIN_TAPA|F_KUTU|F_OT40|F_RESET|HAVA_KOMPRESOR|HAVA_EMNIYET|D_PIZZA_YEDEK_UST)/.test(n))return 'UF';
 if(/^U_KE_|^U_ICECEK_YEDEK/.test(n))return 'UKE';
 if(/^U_KUTU_YEDEK/.test(n))return 'UF';
 return null;
}
function bolge(p){
 if(p.z>.10||p.z<-.86||p.x<.73||p.x>5.24||p.y<0||p.y>2.25)return 'COMMON';
 if(p.x>=2.5&&p.x<4&&p.y>=1.305)return 'UF';
 if(p.y>=1.862&&p.x>=4)return 'UKE';
 if(p.x>=4.4)return 'E';
 if(p.y<.790)return 'B';
 return p.x<1.436?'A':p.x<2.5?'TOP':p.x<4?'F':'K';
}
// Only fixed, merged CAD service meshes. Moving robot/tool/product meshes are
// deliberately excluded. Split connected solids, never cut a screw in half.
const MERGED=/^(ELK_IC__|ELK_ISTASYON__|ELK_ANA_HAT__|HAVA_IC__|EMNIYET__|ACIL__|DUZ__|DAC__|F_KABLO__|F_MEK_BAG__(vida|celik|kaynak)$|F_UST_KABIN_BAG__|F_UST_KABIN__(sac|paslanmaz|plastik|conta|yalitim)$|ELK_ANA_PANO_UF__kablo_rakor$)/;
// Legacy F cabinet sheets span the oven and the technical cabinet. Partition
// their actual surfaces at the assembly joint; do not hide the whole wall as
// COMMON or borrow an uncut wall from the neighbouring assembly.
function govdeBol(o,g,indices,y){
 const keys=Object.keys(g.attributes),position=new T.Vector3(),cross=new T.Vector3();
 const parts=Object.fromEntries(['F','UF'].map(id=>[id,{attributes:Object.fromEntries(keys.map(k=>[k,[]])),box:new T.Box3(),triangles:0,area:0}]));
 let sourceArea=0;
 const area=points=>cross.subVectors(points[1],points[0]).cross(position.subVectors(points[2],points[0])).length()/2;
 const point=v=>new T.Vector3(...v.values.position).applyMatrix4(o.matrixWorld);
 const vertex=k=>{const values=Object.fromEntries(keys.map(key=>[key,Array.from({length:g.attributes[key].itemSize},(_,j)=>g.attributes[key].getComponent(k,j))]));const v={values};v.d=point(v).y-y;return v;};
 function clip(poly,below){const out=[];for(let i=0;i<poly.length;i++){const a=poly[i],b=poly[(i+1)%poly.length],aa=below?a.d<=0:a.d>=0,bb=below?b.d<=0:b.d>=0;if(aa)out.push(a);if(aa!==bb){const t=a.d/(a.d-b.d);out.push({d:0,values:Object.fromEntries(keys.map(k=>[k,a.values[k].map((v,j)=>v+(b.values[k][j]-v)*t)]))});}}return out;}
 for(let i=0;i<indices.length;i+=3){const tri=indices.slice(i,i+3).map(vertex);sourceArea+=area(tri.map(point));
  for(const [id,below]of [['F',true],['UF',false]]){const poly=clip(tri,below),part=parts[id];for(let j=1;j<poly.length-1;j++){const face=[poly[0],poly[j],poly[j+1]],points=face.map(point),a=area(points);if(a<1e-16)continue;part.area+=a;part.triangles++;for(let k=0;k<3;k++){part.box.expandByPoint(points[k]);for(const key of keys)part.attributes[key].push(...face[k].values[key]);}}}
 }
 return {parts,sourceArea};
}
const sceneCaches=new WeakMap();
export function montajSahiplikKur(scene){
 let cache=sceneCaches.get(scene);if(!cache){cache={processed:new WeakSet(),signatures:new Map(),solidSignatures:new Set(),report:{version:2,sources:[],duplicates:[],duplicateComponents:0,duplicateTriangles:0,components:0,triangles:0,renderedTriangles:0,partitionTriangleDelta:0,partitions:[]}};sceneCaches.set(scene,cache);}
 scene.updateMatrixWorld(true);
 const sources=[];scene.traverse(o=>{if(o.isMesh&&!cache.processed.has(o)&&!o.userData.assemblyOwner&&o.visible&&MERGED.test(o.name)&&!o.userData.serviceCoverReplaced&&!o.name.includes('__KAPAK_'))sources.push(o);});
 const {report,signatures,solidSignatures}=cache;
 // Exact source copies share name, world transform and all geometry attributes.
 // Retain originals for CAD/driver lookup, suppress only their duplicate render.

 function signature(o){let h=2166136261;const add=v=>{h=Math.imul(h^(v|0),16777619);};for(const v of o.matrixWorld.elements)add(Math.round(v*1e6));const g=o.geometry;for(const key of Object.keys(g.attributes).sort()){const a=g.attributes[key];add(a.count);for(let i=0;i<a.count;i++)for(let j=0;j<a.itemSize;j++)add(Math.round(a.getComponent(i,j)*1e6));}if(g.index)for(let i=0;i<g.index.count;i++)add(g.index.getX(i));return o.name+':'+h+':'+g.attributes.position.count+':'+(g.index?.count||0);}
 const v=new T.Vector3();
 for(const o of sources.reverse()){
  cache.processed.add(o);
  const sig=signature(o),previous=signatures.get(sig);
  if(previous){o.userData.assemblyDuplicate=true;report.duplicates.push({source:o.name,kept:previous.uuid,duplicate:o.uuid});continue;}signatures.set(sig,o);
  const g=o.geometry,p=g.attributes.position,ix=g.index,n=ix?.count||p.count,nt=n/3;
  if(!nt||Array.isArray(o.material))continue;
  const parent=new Int32Array(nt);for(let i=0;i<nt;i++)parent[i]=i;
  const root=i=>{while(parent[i]!==i){parent[i]=parent[parent[i]];i=parent[i];}return i;};
  const weld=new Map();
  for(let t=0;t<nt;t++)for(let j=0;j<3;j++){const k=ix?ix.getX(t*3+j):t*3+j;const key=Math.round(p.getX(k)*1e5)+','+Math.round(p.getY(k)*1e5)+','+Math.round(p.getZ(k)*1e5);const prev=weld.get(key);if(prev===undefined)weld.set(key,t);else parent[root(t)]=root(prev);}
  const components=new Map();
  for(let t=0;t<nt;t++){const r=root(t);let c=components.get(r);if(!c){c={indices:[],box:new T.Box3()};components.set(r,c);}for(let j=0;j<3;j++){const k=ix?ix.getX(t*3+j):t*3+j;c.indices.push(k);c.box.expandByPoint(v.fromBufferAttribute(p,k).applyMatrix4(o.matrixWorld));}}
  const owned=new Map(),source={name:o.name,triangles:nt,components:components.size,owners:{}};
  function partFor(id){let part=owned.get(id);if(!part){part={indices:[],fragments:[],box:new T.Box3()};owned.set(id,part);}return part;}
  for(const c of components.values()){
   // Same disconnected solid can occur in base GLB and successive service
   // overlays. Compare canonical world triangles, not names or bounding boxes.
   const faces=[];
   for(let t=0;t<c.indices.length;t+=3){const points=[];for(let j=0;j<3;j++){v.fromBufferAttribute(p,c.indices[t+j]).applyMatrix4(o.matrixWorld);points.push([v.x,v.y,v.z].map(x=>Math.round(x*1e6)).join(','));}faces.push(points.sort().join(';'));}
   faces.sort();let h1=2166136261,h2=5381;for(const face of faces)for(let i=0;i<face.length;i++){h1=Math.imul(h1^face.charCodeAt(i),16777619);h2=Math.imul(h2,33)^face.charCodeAt(i);}
   const solidKey=o.name+':'+faces.length+':'+h1+':'+h2+':'+[...c.box.min.toArray(),...c.box.max.toArray()].map(x=>Math.round(x*1e6)).join(',');
   if(solidSignatures.has(solidKey)){report.duplicateComponents++;report.duplicateTriangles+=c.indices.length/3;continue;}solidSignatures.add(solidKey);
   if(/^F_UST_KABIN__(sac|paslanmaz)$/.test(o.name)&&c.box.min.y<1.303-1e-6&&c.box.max.y>1.303+1e-6){
    const split=govdeBol(o,g,c.indices,1.303),entry={source:o.name,boundaryY:1.303,sourceTriangles:c.indices.length/3,sourceArea:split.sourceArea,renderedArea:0,owners:{}};
    for(const [id,fragment]of Object.entries(split.parts)){const part=partFor(id);part.fragments.push(fragment);part.box.union(fragment.box);source.owners[id]=(source.owners[id]||0)+fragment.triangles;entry.renderedArea+=fragment.area;entry.owners[id]={triangles:fragment.triangles,min:fragment.box.min.toArray(),max:fragment.box.max.toArray()};}
    report.partitionTriangleDelta+=split.parts.F.triangles+split.parts.UF.triangles-entry.sourceTriangles;report.partitions.push(entry);continue;
   }
   const center=c.box.getCenter(new T.Vector3()),id=bolge(center);
   // A continuous route crossing station borders is a shared trunk, with a
   // sectional view at the module boundary. A disconnected fastener stays whole.
   const a=bolge(c.box.min.clone().addScalar(.0001)),b=bolge(c.box.max.clone().addScalar(-.0001));
   const route=/kablo|kanal|hortum|HAVA_IC/.test(o.name),owner=(route||/ELK_ISTASYON__(pano|din)/.test(o.name))&&a!==b?'COMMON':id;
   const part=partFor(owner);for(const k of c.indices)part.indices.push(k);part.box.union(c.box);
   source.owners[owner]=(source.owners[owner]||0)+c.indices.length/3;
  }
  o.userData.assemblySource=true;
  for(const [id,c]of owned){
   const geometry=new T.BufferGeometry();
   if(c.fragments.length){for(const [key,a]of Object.entries(g.attributes)){const values=[];for(const k of c.indices)for(let j=0;j<a.itemSize;j++)values.push(a.getComponent(k,j));for(const fragment of c.fragments)for(const x of fragment.attributes[key])values.push(x);geometry.setAttribute(key,new T.BufferAttribute(a.normalized?new Float32Array(values):new a.array.constructor(values),a.itemSize,false));}}
   else {for(const [key,a]of Object.entries(g.attributes))geometry.setAttribute(key,a);geometry.setIndex(c.indices);}
   // Attribute arrays are shared, but bounds must only use the selected indices.
   const local=new T.Box3();const positions=geometry.attributes.position;for(const k of (geometry.index?c.indices:Array.from({length:positions.count},(_,i)=>i)))local.expandByPoint(v.fromBufferAttribute(positions,k));geometry.boundingBox=local;geometry.boundingSphere=local.getBoundingSphere(new T.Sphere());
   const mesh=new T.Mesh(geometry,o.material);mesh.name=o.name+'__MONTAJ_'+id;mesh.userData.assemblyOwner=id;mesh.userData.assemblySourceName=o.name;mesh.castShadow=o.castShadow;mesh.receiveShadow=o.receiveShadow;o.add(mesh);
   report.renderedTriangles+=(geometry.index?.count||positions.count)/3;
  }
  report.sources.push(source);report.components+=components.size;report.triangles+=nt;
 }
 scene.userData.montajSahiplik=report;return report;
}
