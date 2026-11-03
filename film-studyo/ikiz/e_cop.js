// Existing E waste compartment: open 130 x 195 mm drop mouth, no flap.
// Retain the bin/tray; move the existing chute 30 mm forward on two tabs.
export const E_COP_ACIKLIK={x:[4.464,4.594],y:[.545,.740],z:.079};
export function eCopKapakUcgeni(name,vertices){
 if(name==='E_COP__celik')return true;
 return name==='E_COP__sac'&&vertices.every(p=>p[1]>.6035);
}
export function eCopUcgenler(name,vertices){
 if(eCopKapakUcgeni(name,vertices))return [];
 if(name==='DUZ_E_OLUK__paslanmaz'||(name==='E_COP__sac'&&vertices.every(p=>p[1]>.5&&p[1]<.604)))return [vertices.map(p=>[p[0],p[1],p[2]+.030])];
 if(name!=='E_GOVDE__on_seffaf')return [vertices];
 // Remove the old flap pocket's return as well as opening the skin down
 // to the existing chute tip. Exact triangle clipping preserves the rest
 // of the large cabinet-door mesh; centroid masking would remove too much.
 const lo=[4.464,.545,.058],hi=[4.594,.740,.080];
 if([0,1,2].some(a=>Math.max(...vertices.map(p=>p[a]))<lo[a]||Math.min(...vertices.map(p=>p[a]))>hi[a]))return [vertices];
 let inside=[vertices],outside=[];
 for(const[a,b,sign]of [[0,lo[0],1],[0,hi[0],-1],[1,lo[1],1],[1,hi[1],-1],[2,lo[2],1],[2,hi[2],-1]]){
  const next=[];
  for(const poly of inside){const inn=[],out=[];
   for(let i=0;i<poly.length;i++){const p=poly[i],q=poly[(i+1)%poly.length],dp=(p[a]-b)*sign,dq=(q[a]-b)*sign;
    (dp>=0?inn:out).push(p);
    if((dp>0&&dq<0)||(dp<0&&dq>0)){const t=dp/(dp-dq),v=p.map((x,j)=>x+(q[j]-x)*t);inn.push(v);out.push(v);}
   }
   if(inn.length>=3)next.push(inn);if(out.length>=3)outside.push(out);
  }inside=next;if(!inside.length)break;
 }
 const tris=[];for(const p of outside)for(let i=1;i<p.length-1;i++){const t=[p[0],p[i],p[i+1]];
  const a=t[1].map((v,j)=>v-t[0][j]),b=t[2].map((v,j)=>v-t[0][j]);
  if(Math.hypot(a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0])>1e-12)tris.push(t);
 }return tris;
}
export function eCopKur(T,kok){
 // Kemal 31 Eki ("eski modelleri komple sil"): yeni makine var — eski makinenin bu parçaları artık ÜRETİLMEZ (önceden üretilip yeni_makine.js sil() ile siliniyordu).
 return {triangles:0,nodes:[],eskiUretilmez:true};
 kok.updateMatrixWorld(true);const removed={triangles:0,nodes:[]};
 kok.traverse(o=>{
  if(!o.isMesh||!(/^(E_COP__(celik|sac)|E_GOVDE__on_seffaf|DUZ_E_OLUK__paslanmaz)$/.test(o.name))||o.userData.dtCopAcik)return;
  o.userData.dtCopAcik=true;
  const g=o.geometry,p=g.attributes.position,idx=g.index?.array,v=new T.Vector3(),positions=[],normals=[],inv=o.matrixWorld.clone().invert(),bary=new T.Vector3(),ns=g.attributes.normal;
  for(let i=0,n=idx?.length??p.count;i<n;i+=3){
   const vertices=[0,1,2].map(j=>v.fromBufferAttribute(p,idx?idx[i+j]:i+j).applyMatrix4(o.matrixWorld).toArray());
   const result=eCopUcgenler(o.name,vertices);if(!result.length&&eCopKapakUcgeni(o.name,vertices))removed.triangles++;
   const a=new T.Vector3(...vertices[0]),b=new T.Vector3(...vertices[1]),c=new T.Vector3(...vertices[2]);
   for(const tri of result)for(const pt of tri){const world=new T.Vector3(...pt);T.Triangle.getBarycoord(world,a,b,c,bary);positions.push(...world.applyMatrix4(inv).toArray());
    const normal=new T.Vector3();if(ns)for(let j=0;j<3;j++)normal.addScaledVector(new T.Vector3().fromBufferAttribute(ns,idx?idx[i+j]:i+j),bary.getComponent(j));normals.push(...normal.normalize().toArray());}
  }
  const cut=new T.BufferGeometry();cut.setAttribute('position',new T.Float32BufferAttribute(positions,3));cut.setAttribute('normal',new T.Float32BufferAttribute(normals,3));o.geometry=cut;removed.nodes.push(o.name);
 });
 if(!kok.getObjectByName('DT_E_COP_OLUK_BAG')){
  const group=new T.Group();group.name='DT_E_COP_OLUK_BAG';kok.add(group);
  const mat=new T.MeshStandardMaterial({color:0x9aa3aa,metalness:.8,roughness:.4});
  for(const x of [4.44975,4.60825]){const tab=new T.Mesh(new T.BoxGeometry(.0015,.010,.034),mat);tab.name='DT_E_COP_OLUK_BAG_'+x;tab.position.set(x,.598,.072);group.add(tab);}
 }
 return removed;
}
