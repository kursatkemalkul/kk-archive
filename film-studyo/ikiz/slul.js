// SLUL drawing-derived visual model. Not manufacturer CAD or a motorized SLUL.
// QR is a custom scaled linkage authorized by Kemal; production loads remain unqualified.
export const SLUL={arm:.332,start:-85*Math.PI/180,travel:.613,bodyDepth:.3625,bodyHeight:.198,bodyWidth:.037,
 source:'https://www.sugatsune.com/content/site-assets/501_PDF/SLUL.pdf'};
SLUL.end=Math.asin(SLUL.travel/SLUL.arm+Math.sin(SLUL.start));
export const QR_SLUL_SCALE=.272/SLUL.travel;
export function slulPoz(value,scale=1){
 const p=Math.max(0,Math.min(1,Number(value)||0)),s=p*p*p*(p*(p*6-15)+10),theta=SLUL.start+(SLUL.end-SLUL.start)*s;
 return {theta,y:SLUL.arm*scale*(Math.sin(theta)-Math.sin(SLUL.start)),out:SLUL.arm*scale*(Math.cos(theta)-Math.cos(SLUL.start)),scale};
}
export function slulKur(T,parent,{name,x,bottom,face,dir=1,scale=1,material,leafThickness=.003}){
 const root=new T.Group();root.name=name+'_SLUL';parent.add(root);
 root.userData={...root.userData,mechanism:'SLUL drawing-derived',customScaled:scale!==1,scale,manufacturerCAD:false,motorized:false};
 const metal=material||new T.MeshStandardMaterial({color:0xb7bec4,metalness:.8,roughness:.3});
 const dark=new T.MeshStandardMaterial({color:0x394047,roughness:.65});
 function mesh(n,g,mat=metal){const o=new T.Mesh(g,mat);o.name=name+'_SLUL_'+n;root.add(o);return o;}
 function slab(n,points,thick,xx,mat=metal){const sh=new T.Shape();points.forEach(([z,y],i)=>i?sh.lineTo(z,y):sh.moveTo(z,y));sh.closePath();
  const o=mesh(n,new T.ExtrudeGeometry(sh,{depth:thick,bevelEnabled:false}),mat);
  // Local shape x=z/out, y=height, extrusion z=across; map to world yz.
  o.rotation.y=-dir*Math.PI/2;o.position.x=xx;return o;}
 const B0=new T.Vector3(x,bottom+.025*scale,face-dir*(leafThickness+.006+.0015*scale));
 const A=B0.clone().sub(new T.Vector3(0,SLUL.arm*scale*Math.sin(SLUL.start),dir*SLUL.arm*scale*Math.cos(SLUL.start)));
 const depth=SLUL.bodyDepth*scale,height=SLUL.bodyHeight*scale;
 const body=slab('GOVDE',[[0,0],[-depth,0],[-depth,height],[-.07*scale,height],[-.07*scale,.04*scale],[0,.04*scale]],.0025*scale,x-.012*scale);
 body.position.y=A.y-height+.020*scale;body.position.z=A.z;
 const cover=slab('YAN_KORUMA',[[0,0],[-depth+.004*scale,0],[-depth+.004*scale,height-.004*scale],[-.075*scale,height-.004*scale],[-.075*scale,.035*scale],[0,.035*scale]],.002*scale,x-.016*scale,dark);
 cover.position.y=body.position.y;cover.position.z=body.position.z;
 const links=[];
 for(let i=0;i<2;i++){
  const offset=.060*scale*i,aa=A.clone().add(new T.Vector3(0,offset,0)),bb=B0.clone().add(new T.Vector3(0,offset,0));
  const L=SLUL.arm*scale,w=.010*scale;
  // Bent steel link; both pin centres retain constant separation throughout motion.
  const sh=new T.Shape();sh.moveTo(-w,0);sh.lineTo(-w,L*.23);sh.quadraticCurveTo(-.035*scale,L*.40,-.035*scale,L*.53);sh.lineTo(-w,L*.78);sh.lineTo(-w,L);sh.lineTo(w,L);sh.lineTo(w,L*.76);sh.lineTo(-.015*scale,L*.52);sh.quadraticCurveTo(-.015*scale,L*.40,w,L*.25);sh.lineTo(w,0);sh.closePath();
  const bar=mesh('SEKILLI_KOL_'+i,new T.ExtrudeGeometry(sh,{depth:.003*scale,bevelEnabled:false}).rotateY(dir*Math.PI/2));
  const pins=[];for(const [tag,pos]of [['SABIT',aa],['HAREKETLI',bb]]){const pin=mesh(tag+'_PIM_'+i,new T.CylinderGeometry(.005*scale,.005*scale,.025*scale,12));pin.rotation.z=Math.PI/2;pin.position.copy(pos);pins.push(pin);}
  links.push({A:aa,B0:bb,bar,pin:pins[1],length:L});
 }
 const plate=mesh('KANAT_BAGLANTI_PLAKASI',new T.BoxGeometry(.025*scale,.100*scale,.003*scale));
 const spacer=mesh('KANAT_ARA_MESAFE',new T.BoxGeometry(.012*scale,.040*scale,.006));
 const damper=mesh('AMORTISOR_GOVDESI',new T.BoxGeometry(.017*scale,.065*scale,.022*scale),dark);
 damper.position.set(x,A.y-.035*scale,A.z-dir*.022*scale);
 function pose(value){const q=slulPoz(value,scale);for(const l of links){const B=l.B0.clone().add(new T.Vector3(0,q.y,dir*q.out)),d=B.clone().sub(l.A);
   l.bar.position.copy(l.A);l.bar.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),d.normalize());l.pin.position.copy(B);}
  plate.position.copy(B0).add(new T.Vector3(0,.030*scale+q.y,dir*q.out));spacer.position.copy(plate.position).add(new T.Vector3(0,0,dir*(.0015*scale+.003)));root.updateMatrixWorld(true);return q;}
 pose(0);return {root,pose,links,scale};
}
