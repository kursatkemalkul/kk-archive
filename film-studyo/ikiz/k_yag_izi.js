// Yağ işaretleri yalnız tesisin doğruladığı spreylendi_mm artınca eklenir.
// Akışkan çözümü değildir; gerçek doz sayacının ürün üzerindeki görsel izidir.
export function kYagIziKur(THREE) {
  const records = new Map(), geometry = new THREE.SphereGeometry(.0012, 5, 4);
  const material = new THREE.MeshStandardMaterial({color:0xe5b749,roughness:.1});
  const matrix = new THREE.Matrix4(), rotation = new THREE.Quaternion();
  const uygula = (u, k) => {
    if (String(u.yer).toUpperCase() !== 'K' || !k) return;
    const dose = +u.spreylendi_mm || 0, progress = +u.ilerleme_mm || 0, boy = +u.boy_mm || 300;
    let r = records.get(u.id);
    if (!r || dose < r.dose) { r?.mesh?.removeFromParent(); r?.mesh?.dispose(); r = {dose:0,progress,cells:[],object:null}; records.set(u.id,r); }
    if (r.object !== k.o) {
      r.mesh?.removeFromParent(); r.mesh?.dispose();
      const size = new THREE.Box3().setFromObject(k.o).getSize(new THREE.Vector3());
      const rx = Math.min(boy / 2000,size.x / 2), rz = size.z / 2;
      if (!r.cells.length) for (let x=-rx+.0015;x<rx;x+=.003) {
        const zmax=rz*Math.sqrt(Math.max(0,1-x*x/(rx*rx)));
        for (let z=-zmax+.004;z<zmax;z+=.012) r.cells.push({x,z,on:false});
      }
      r.object=k.o; r.height=(k.yariDuz ?? k.yari ?? size.y/2)+.0002;
      r.mesh=new THREE.InstancedMesh(geometry,material,r.cells.length);r.mesh.name='IKIZ_K_YAG_IZI';r.mesh.frustumCulled=false;k.o.add(r.mesh);
    }
    // Tek merkez dozu tüm disk yüzeyine dağılır; hareket eden şerit izi yok.
    const fraction = Math.min(1, dose / 300);
    r.cells.forEach((c,i)=>{ c.on = ((i * .61803398875) % 1) < fraction; });
    r.cells.forEach((c,i)=>{matrix.compose(new THREE.Vector3(c.x,r.height,c.z),rotation,new THREE.Vector3(c.on?1:0,c.on?.35:0,c.on?1:0));r.mesh.setMatrixAt(i,matrix);});
    r.mesh.instanceMatrix.needsUpdate=true;r.dose=dose;r.progress=progress;
    // Tek ürün dışındaki eski kayıtlar görsel nesne yaşam döngüsüne aittir.
    for (const [id,v] of records) if (id!==u.id && records.size>8) { v.mesh?.removeFromParent(); v.mesh?.dispose(); records.delete(id); }
  };
  uygula.temizle = () => { for (const r of records.values()) { r.mesh?.removeFromParent(); r.mesh?.dispose(); } records.clear(); };
  return uygula;
}
