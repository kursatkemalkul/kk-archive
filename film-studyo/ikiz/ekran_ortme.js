// CSS screens have no WebGL depth buffer. Check the actual opaque geometry,
// including moving doors/robot, not coarse boxes which fill real apertures.
export function ekranOrtmeKur(T,scene){
 const ray=new T.Raycaster(),dir=new T.Vector3(),localRay=new T.Ray(),inv=new T.Matrix4(),point=new T.Vector3();let meshes=[],stamp=-Infinity;
 const visible=o=>{for(let p=o;p;p=p.parent)if(!p.visible)return false;return true;};
 return function blocked(camera,target,now=performance.now()){
  if(now-stamp>1000){meshes=[];scene.traverse(o=>{if(o.isMesh)meshes.push(o);});stamp=now;}
  dir.copy(target).sub(camera);const distance=dir.length();if(distance<.001)return false;
  ray.set(camera,dir.multiplyScalar(1/distance));ray.near=.002;ray.far=distance-.0002;
  for(const mesh of meshes){
   if(!visible(mesh)||mesh.userData.dtScreenDepthMask)continue;
   const materials=Array.isArray(mesh.material)?mesh.material:[mesh.material];
   if(materials.every(m=>!m?.visible||m.transparent&&m.opacity<.35))continue;
   // Cheap world-sphere broad phase before triangle intersection.
   if(!mesh.isInstancedMesh&&!mesh.isSkinnedMesh){
    const geo=mesh.geometry;if(!geo.boundingBox)geo.computeBoundingBox();
    inv.copy(mesh.matrixWorld).invert();localRay.copy(ray.ray).applyMatrix4(inv);
    const hit=localRay.intersectBox(geo.boundingBox,point);if(!hit)continue;
    // Ray may begin inside a box; otherwise its first boundary must be
    // before the screen. Avoid inspecting thousands of remote triangles.
    if(!geo.boundingBox.containsPoint(localRay.origin)&&hit.applyMatrix4(mesh.matrixWorld).distanceTo(camera)>ray.far)continue;
   }
   const hits=ray.intersectObject(mesh,false);
   if(hits.some(h=>{const m=materials[h.face?.materialIndex||0];return m?.visible&&(!m.transparent||m.opacity>=.35);}))return true;
  }
  return false;
 };
}
