// Machine shell standard: matches iskelet_v1 AISI304/t1.5/R1.5, 8mm cover tray.
// No wire, hose, actuator, bay datum or motion changes.
export const GOVDE_STANDARD28=Object.freeze({material:'AISI 304',sheet:.0015,insideRadius:.0015,coverDepth:.008,mainProfile:'RHS 40x20x2',weld:'inside only; external flush finish'});
export function foldedCover28(T,{width,height,material,name}){
 const t=GOVDE_STANDARD28.sheet,r=GOVDE_STANDARD28.insideRadius,R=r+t,d=GOVDE_STANDARD28.coverDepth;
 if(width<=2*R||height<=2*R)throw Error('Cover too small');
 const face=new T.Mesh(new T.BoxGeometry(width-2*R,height-2*R,t).translate(0,0,t/2),material);face.name=name;
 function tag(o){o.userData={...o.userData,assemblyOwner:'QR',ist:'QR',katman:'kapak',sheetMetal:{material:GOVDE_STANDARD28.material,t,insideRadius:r,depth:d},fold28:true};return o;}
 tag(face);
 function box(n,w,h,depth,x,y,z){const o=new T.Mesh(new T.BoxGeometry(w,h,depth),material);o.name=name+'_'+n;o.position.set(x,y,z);face.add(tag(o));}
 // True quarter-circle sheet sections, corner-relieved so adjacent bends do not overlap.
 function bend(n,length,rotation,position){const s=new T.Shape();for(let i=0;i<=12;i++){const a=-Math.PI/2+i*Math.PI/24,x=R*Math.cos(a),z=R+R*Math.sin(a);i?s.lineTo(x,z):s.moveTo(x,z);}for(let i=12;i>=0;i--){const a=-Math.PI/2+i*Math.PI/24;s.lineTo(r*Math.cos(a),R+r*Math.sin(a));}s.closePath();const g=new T.ExtrudeGeometry(s,{depth:length,bevelEnabled:false,curveSegments:12});const o=new T.Mesh(g,material);o.name=name+'_'+n;o.rotation.set(...rotation);o.position.set(...position);face.add(tag(o));return o;}
 const W=width/2,H=height/2;
 // profile local(x,z) -> world(x,depth), extrusion -> y
 bend('SAG_BUKUM_R1_5',height-2*R,[Math.PI/2,0,0],[W-R,H-R,0]);
 const left=bend('SOL_BUKUM_R1_5',height-2*R,[Math.PI/2,0,0],[-W+R,H-R,0]);left.scale.x=-1;
 // local x -> world y, local y -> world z, extrusion -> world x
 const top=bend('UST_BUKUM_R1_5',width-2*R,[0,0,0],[-W+R,H-R,0]);
 const basis=new T.Matrix4().makeBasis(new T.Vector3(0,1,0),new T.Vector3(0,0,1),new T.Vector3(1,0,0));top.quaternion.setFromRotationMatrix(basis);
 const bottom=bend('ALT_BUKUM_R1_5',width-2*R,[0,0,0],[-W+R,-H+R,0]);bottom.quaternion.setFromRotationMatrix(basis);bottom.scale.x=-1;
 box('SAG_IC_DONUS',t,height-2*R,d-R,W-t/2,0,(d+R)/2);
 box('SOL_IC_DONUS',t,height-2*R,d-R,-W+t/2,0,(d+R)/2);
 box('UST_IC_DONUS',width-2*R,t,d-R,0,H-t/2,(d+R)/2);
 box('ALT_IC_DONUS',width-2*R,t,d-R,0,-H+t/2,(d+R)/2);
 return face;
}
