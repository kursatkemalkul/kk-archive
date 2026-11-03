import {cabinetLeaf57} from './wash_doors57.js';
export const KARTON_DEPO={blank_mm:[804,404,1.6],bottom:2.4115,ceiling:2.7685,handling_gap:.020,capacity:210,daily_orders:null,source:'Current E_KUTU__B_* unscaled source geometry; 1.6 mm nominal CAD thickness',sheet_mm:1.5,beam_mm:[30,20,2],outer:[2.010,3.151,2.380,2.770,1.668,2.318],days:daily=>daily>0?210/daily:null};
export function kartonDepoKur(T,root,box,MAT,IKIZ){
 const P=KARTON_DEPO,[x0,x1,,top,z0,z1]=P.outer;
 const steel=MAT.paslanmaz;
 // Proper chassis already exists in wash57. Carton shelf is a separate dry pan.
 const F=IKIZ.wash57;F.pan('KARTON_DEPO_RAF',x0+.0215,x1-.0215,2.410,z0+.015,z1-.0215,.0015,.025);
 F.plate('KARTON_UST_SAC',[x0+.0015,x1-.0015,top-.0015,top,z0+.006,z1-.0015]);
 const doors=[{name:'KARTON_SOL_KAPAK',a:2.0125,b:2.5795,hand:1},{name:'KARTON_SAG_KAPAK',a:2.5815,b:3.1485,hand:-1}].map(d=>cabinetLeaf57(T,F,root,{...d,bottom:2.414,top:2.770,front:1.668}));F.doors.push(...doors);F.cartonDoors=doors;
 let populated=false,data=IKIZ.kartonBlankData;
 const ready=data||typeof window==='undefined'?Promise.resolve(data):fetch(new URL('./karton-depo-blank.json',import.meta.url)).then(r=>{if(!r.ok)throw Error('Karton storage asset '+r.status);return r.json();}).then(d=>{data=d;update();return d;});
 ready.catch(e=>console.error('Karton deposu kaynağı yüklenemedi',e));
 function update(){
  if(populated||!data)return;
  const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute(data.positions,3));geometry.computeVertexNormals();geometry.computeBoundingBox();
  const b=geometry.boundingBox,sz=b.getSize(new T.Vector3());
  if(Math.abs(sz.x-.804)>.001||Math.abs(sz.z-.404)>.001||sz.y>.002)throw Error('Flat source carton geometry no longer matches storage envelope');
  geometry.translate(-b.min.x,-b.min.y,-b.min.z);
  const stack=new T.InstancedMesh(geometry,new T.MeshStandardMaterial({color:0xc5a46d,roughness:1}),P.capacity),m=new T.Matrix4();stack.name='YIKAMA__ACIK_KARTON_210';
  for(let i=0;i<P.capacity;i++){m.makeTranslation(2.1785,P.bottom+i*.0016,1.791);stack.setMatrixAt(i,m);}
  stack.instanceMatrix.needsUpdate=true;stack.computeBoundingBox();stack.computeBoundingSphere();root.add(stack);populated=true;
 }
 IKIZ.kartonDepo={...P,ready,update,doors};return IKIZ.kartonDepo;
}
