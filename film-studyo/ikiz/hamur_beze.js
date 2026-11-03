// Hamur bezesi: yumuşak yuvarlak gövde, dinlenirken hafif düz taban.
// Ölçü değişmez: stok ve robot aynı şablonu kullanır; açılmış pide değildir.
export function hamurPozUygula(o, poz) {
 if (!poz || !['DOUGH','HAMUR'].includes(String(poz.tur).toUpperCase())) return false;
 if (!Array.isArray(poz.p) || poz.p.length!==3 || !poz.p.every(Number.isFinite)
     || !Array.isArray(poz.q) || poz.q.length!==4 || !poz.q.every(Number.isFinite)
     || Math.hypot(...poz.q)<1e-8) return false;
 // World product orientation comes from the grasp transform, not the flange.
 o.position.fromArray(poz.p);o.quaternion.fromArray(poz.q).normalize();
 return true;
}
export function hamurBezeKur(THREE, boy=[.095,.0572,.095]) {
 const g=new THREE.SphereGeometry(1,48,32),p=g.attributes.position;
 for(let i=0;i<p.count;i++)p.setY(i,Math.max(-.82,p.getY(i)));
 g.computeBoundingBox();const b=g.boundingBox,sy=boy[1]/(b.max.y-b.min.y),cy=(b.min.y+b.max.y)/2;
 for(let i=0;i<p.count;i++)p.setXYZ(i,p.getX(i)*boy[0]/2,(p.getY(i)-cy)*sy,p.getZ(i)*boy[2]/2);
 g.computeVertexNormals();g.computeBoundingBox();g.computeBoundingSphere();
 const m=new THREE.MeshStandardMaterial({color:0xe9d6b0,roughness:.94,metalness:0});m.userData.gercekRenk=true;
 const mesh=new THREE.Mesh(g,m);mesh.name='HAMUR_BEZE_YUVARLAK';mesh.castShadow=true;mesh.receiveShadow=true;
 const root=new THREE.Group();root.name='HAMUR_BEZE';root.add(mesh);return root;
}
