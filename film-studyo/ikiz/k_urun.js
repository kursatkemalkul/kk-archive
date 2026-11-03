// Physical K product envelope and the actual six radial blade footprints.
// The centre Ø30 and outer 2 mm remain uncut in the current CAD.
export function kUrunSablon(THREE, source, lengthMm = 300, cut = false) {
  if (!source) return null;
  const p = source.clone(true);
  p.position.set(0, 0, 0); p.quaternion.identity(); p.scale.set(1, 1, 1);
  p.traverse(o => { o.visible = true; if(o.isMesh)o.userData.yuvarlak=true; }); p.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(p), size = box.getSize(new THREE.Vector3()), center = box.getCenter(new THREE.Vector3());
  const diameter = lengthMm / 1000;
  p.scale.set(diameter / size.x, 0.015 / size.y, diameter / size.z);
  p.position.set(-center.x * p.scale.x, -box.min.y * p.scale.y, -center.z * p.scale.z);
  const g = new THREE.Group(); g.name = cut ? 'IKIZ_KESIK_PIDE' : 'IKIZ_K_DISK'; g.add(p);
  if (cut) {
    const r0 = 0.015, r1 = Math.min(0.148, diameter / 2);
    const material = new THREE.MeshBasicMaterial({ color: 0x694020 });
    for (let i = 0; i < 6; i++) {
      const a = i * Math.PI / 3, m = new THREE.Mesh(new THREE.BoxGeometry(r1 - r0, 0.0001, 0.0008), material);
      m.name = 'K_BICAK_IZ_' + i; m.position.set((r0 + r1) / 2 * Math.cos(a), 0.01496, (r0 + r1) / 2 * Math.sin(a)); m.rotation.y = -a; g.add(m);
    }
  }
  return g;
}
