// Right service cover and extended upper-left cover; robot pickup bay stays open.
// Removable service sheet with captive fasteners; no actuator/PLC changes.
export const E_SERVIS_KAPAK={outline:[[4.815,.792],[5.226,.792],[5.226,1.858],[4.815,1.858]],upper:{x:[4.404,4.813],y:[1.155,2.197],old_bottom:1.1895},pickup:[4.404,4.815,.792,1.155],z:[.0805,.082],sheet_mm:1.5,return_mm:17,removable:true};
export function eServisKapakKur(T,kok){
 // Kemal 31 Eki ("eski modelleri komple sil"): yeni makine var — eski makinenin bu parçaları artık ÜRETİLMEZ (önceden üretilip yeni_makine.js sil() ile siliniyordu).
 return;
 if(kok.getObjectByName('E_SERVIS_L_KAPAK'))return;
 const P=E_SERVIS_KAPAK,root=new T.Group();root.name='E_SERVIS_L_KAPAK';kok.add(root);
 const steel=new T.MeshStandardMaterial({color:0x8f999f,metalness:.62,roughness:.44}),black=new T.MeshStandardMaterial({color:0x20282d});
 const fasteners=[[4.840,.820],[4.840,1.830],[5.200,1.830],[5.200,.820]];
 const shape=new T.Shape();P.outline.forEach(([x,y],i)=>i?shape.lineTo(x,y):shape.moveTo(x,y));shape.closePath();
 for(const [x,y]of fasteners){const hole=new T.Path();hole.absarc(x,y,.0028,0,Math.PI*2,true);shape.holes.push(hole);}
 const grip=new T.Path();grip.moveTo(4.960,1.245);grip.lineTo(4.960,1.263);grip.lineTo(5.040,1.263);grip.lineTo(5.040,1.245);grip.closePath();shape.holes.push(grip);
 const panel=new T.Mesh(new T.ExtrudeGeometry(shape,{depth:.0015,bevelEnabled:false}),steel);panel.position.z=P.z[0];panel.name='E_SERVIS_L_SAC';root.add(panel);
 const box=(name,b,m=steel)=>{const o=new T.Mesh(new T.BoxGeometry(b[1]-b[0],b[3]-b[2],b[5]-b[4]),m);o.position.set((b[0]+b[1])/2,(b[2]+b[3])/2,(b[4]+b[5])/2);o.name=name;root.add(o);return o;};
 // Downturned edges behind the skin, all ahead of the existing frame.
 const [z0,z1]=[.0635,.0805];
 for(const b of [[4.8165,5.2245,.792,.7935,z0,z1],[5.2245,5.226,.7935,1.8565,z0,z1],
  [4.8165,5.2245,1.8565,1.858,z0,z1],[4.815,4.8165,.7935,1.8565,z0,z1]])box('E_SERVIS_KAPAK_BUKUM',b);
 // The native upper front ends at 1.1895 m; extend its left leaf to the
 // measured rear rail's lower edge at 1.155 m, on the same front plane.
 const [ux0,ux1]=P.upper.x,[uy0,uy1]=P.upper.y;
 box('E_SERVIS_L_UST_SAC',[ux0,ux1,uy0,uy1,P.z[0],P.z[1]]);
 for(const b of [[ux0,ux0+.0015,uy0,uy1,z0,z1],[ux1-.0015,ux1,uy0,uy1,z0,z1],
  [ux0+.0015,ux1-.0015,uy0,uy0+.0015,z0,z1],[ux0+.0015,ux1-.0015,uy1-.0015,uy1,z0,z1]])box('E_SERVIS_L_UST_BUKUM',b);
 // Closed recessed finger cup: no through-opening into the machine.
 box('E_SERVIS_KAPAK_GOMME_KULP_TABAN',[4.956,5.044,1.241,1.267,.071,.0725],black);
 for(const b of [[4.956,4.9575,1.241,1.267,.0725,.0805],[5.0425,5.044,1.241,1.267,.0725,.0805],[4.9575,5.0425,1.241,1.2425,.0725,.0805],[4.9575,5.0425,1.2655,1.267,.0725,.0805]])box('E_SERVIS_KAPAK_KULP_CEP',b,black);
 for(const [x,y]of [...fasteners,[4.430,1.180],[4.787,1.180],[4.430,2.170],[4.787,2.170]]){const screw=new T.Mesh(new T.CylinderGeometry(.0045,.0045,.0015,16),steel);screw.rotation.x=Math.PI/2;screw.position.set(x,y,.08275);screw.name='E_SERVIS_KAPAK_ESIR_VIDA';root.add(screw);box('E_SERVIS_KAPAK_VIDA_YARIK',[x-.0025,x+.0025,y-.0005,y+.0005,.08351,.08365],black);}
 // Remove obsolete glass in the complete pickup bay and under both skins.
 // Keep the separate lower bay and every other station unchanged.
 const cuts=[[4.403,4.8145,.791,2.198,.056,.0801],[4.8145,5.227,.791,1.859,.056,.0801]];
 kok.updateMatrixWorld(true);
 kok.traverse(o=>{if(!o.isMesh||o.name!=='E_GOVDE__on_seffaf'||!o.visible||o.userData.eLKapakKesildi)return;
  o.userData.eLKapakKesildi=true;const geo=o.geometry,positions=geo.attributes.position,ix=geo.index,world=new T.Vector3(),inverse=o.matrixWorld.clone().invert(),out=[];
  const clip=(poly,axis,bound,below)=>{const r=[],inside=p=>below?p[axis]<=bound:p[axis]>=bound;for(let i=0;i<poly.length;i++){const a=poly[i],b=poly[(i+1)%poly.length],aa=inside(a),bb=inside(b);if(aa)r.push(a);if(aa!==bb){const f=(bound-a[axis])/(b[axis]-a[axis]);r.push(a.map((v,j)=>v+(b[j]-v)*f));}}return r;};
  for(let i=0;i<(ix?ix.count:positions.count);i+=3){let pieces=[[0,1,2].map(j=>world.fromBufferAttribute(positions,ix?ix.getX(i+j):i+j).applyMatrix4(o.matrixWorld).toArray())];
   for(const cut of cuts){const remain=[];for(const polygon of pieces){let inside=polygon;for(const [axis,bound,low]of [[0,cut[0],true],[0,cut[1],false],[1,cut[2],true],[1,cut[3],false],[2,cut[4],true],[2,cut[5],false]]){if(inside.length<3)break;const outside=clip(inside,axis,bound,low);if(outside.length>=3)remain.push(outside);inside=clip(inside,axis,bound,!low);}}pieces=remain;}
   for(const polygon of pieces)for(let j=1;j<polygon.length-1;j++)for(const p of [polygon[0],polygon[j],polygon[j+1]])out.push(...world.fromArray(p).applyMatrix4(inverse).toArray());
  }
  const replacement=new T.BufferGeometry();replacement.setAttribute('position',new T.Float32BufferAttribute(out,3));replacement.computeVertexNormals();replacement.computeBoundingBox();replacement.computeBoundingSphere();o.geometry=replacement;
 });
 return root;
}
