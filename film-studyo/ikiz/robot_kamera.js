// Symbolic wrist eye only. Camera hardware shape/calibration is not modeled.
export const CAMERA={front:[0,.037,.045],nominal_mm:[10,8,5],symbolic:true};
export function kameraYardimciKutular(T){return [{lo:[-.005,.033,.040],hi:[.005,.041,.045],M:new T.Matrix4()}];}
export async function robotKameraKur(T,kok,loader,IKIZ){
 const tool=kok.getObjectByName('Tool');if(!tool)return null;
 if(tool.getObjectByName('ROB_KAMERA_GOZ'))return tool.getObjectByName('ROB_KAMERA_GOZ');
 const eye=new T.Group();eye.name='ROB_KAMERA_GOZ';eye.position.fromArray(CAMERA.front);tool.add(eye);
 const housing=new T.Mesh(new T.BoxGeometry(.010,.008,.004),new T.MeshStandardMaterial({color:0x2c343b,roughness:.6}));housing.position.z=-.002;eye.add(housing);
 const material=new T.MeshStandardMaterial({color:0x123949,emissive:0x124c61,emissiveIntensity:.25,roughness:.25});
 const lens=new T.Mesh(new T.CylinderGeometry(.0025,.0025,.001,20),material);lens.rotation.x=Math.PI/2;lens.name='ROB_KAMERA_GOZ_LENS';eye.add(lens);
 IKIZ.robotKamera={model:'Küçük göz işareti',symbolic:true,physical_calibration:false};
 IKIZ.kancalar.push(()=>{const f=IKIZ.son,scan=f?.kamera?.son;material.emissiveIntensity=scan&&f.t-scan.t<.8?1:.25;});
 return eye;
}
