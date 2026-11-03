import {duvarBirlesikGeometri} from './dukkan_plan.js';
export function closedFurnitureGeometry30(T,{width,height,holes=[]}){
 const W=width/2,H=height/2,t=.0015,d=.008;
 return duvarBirlesikGeometri(T,[[-W,W,-H,H,0,d]],[[-W+t,W-t,-H+t,H-t,t,d-t],...holes]);
}
export function closedFurnitureCover30(T,{width,height,material,name}){
 const o=new T.Mesh(closedFurnitureGeometry30(T,{width,height}),material);o.name=name;
 o.userData={assemblyOwner:'PERSONEL',ist:'PERSONEL',manufacturingFinish30:true,closedWeldedCorners:true,sheetMetal:{material:'AISI304',t:.0015,depth:.008}};return o;
}
