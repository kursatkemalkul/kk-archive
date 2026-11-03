// Custom fabricated 1.5mm worktop, four R1.5/R3 returns, closed mitred corners.
// Metres. The sink aperture and faucet bore remain unchanged.
export function counter62(T,material){
 const x0=2.010,x1=3.151,z0=1.505,z1=2.318,y=.880,t=.0015,R=.003,r=.0015,low=.8585;
 const top=new T.Shape();top.moveTo(x0+R,z0+R);top.lineTo(x1-R,z0+R);top.lineTo(x1-R,z1-R);top.lineTo(x0+R,z1-R);top.closePath();
 const bowl=new T.Path(),cx=2.883,cz=1.875,w=.400,d=.450,rr=.020;
 bowl.moveTo(cx-w/2+rr,cz-d/2);bowl.lineTo(cx+w/2-rr,cz-d/2);bowl.quadraticCurveTo(cx+w/2,cz-d/2,cx+w/2,cz-d/2+rr);bowl.lineTo(cx+w/2,cz+d/2-rr);bowl.quadraticCurveTo(cx+w/2,cz+d/2,cx+w/2-rr,cz+d/2);bowl.lineTo(cx-w/2+rr,cz+d/2);bowl.quadraticCurveTo(cx-w/2,cz+d/2,cx-w/2,cz+d/2-rr);bowl.lineTo(cx-w/2,cz-d/2+rr);bowl.quadraticCurveTo(cx-w/2,cz-d/2,cx-w/2+rr,cz-d/2);bowl.closePath();top.holes.push(bowl);
 const tap=new T.Path();tap.absarc(2.883,2.180,.0175,0,2*Math.PI,true);top.holes.push(tap);
 const flat=new T.ExtrudeGeometry(top,{depth:t,bevelEnabled:false,curveSegments:32});flat.rotateX(Math.PI/2);flat.translate(0,y,0);
 const positions=[],normals=[];
 function tri(a,b,c,na,nb,nc){positions.push(...a,...b,...c);normals.push(...na,...nb,...nc);}
 function perimeter(i,v,h){return [[x0+v,h,z0+v],[x1-v,h,z0+v],[x1-v,h,z1-v],[x0+v,h,z1-v]][i];}
 for(let side=0;side<4;side++){
  const normal=[[0,0,-1],[1,0,0],[0,0,1],[-1,0,0]][side],next=(side+1)%4;
  for(const inner of [false,true]){const rad=inner?r:R,sgn=inner?-1:1,points=[];
   for(let k=0;k<=32;k++){const a=k/32*Math.PI/2;points.push({v:R-rad*Math.sin(a),h:y-R+rad*Math.cos(a),n:[normal[0]*Math.sin(a)*sgn,Math.cos(a)*sgn,normal[2]*Math.sin(a)*sgn]});}
   points.push({v:inner?t:0,h:low,n:normal.map(v=>v*sgn)});
   for(let k=1;k<points.length;k++){const a=points[k-1],b=points[k],p=perimeter(side,a.v,a.h),q=perimeter(next,a.v,a.h),u=perimeter(side,b.v,b.h),v=perimeter(next,b.v,b.h);if(!inner){tri(p,q,v,a.n,a.n,b.n);tri(p,v,u,a.n,b.n,b.n);}else{tri(p,v,q,a.n,b.n,a.n);tri(p,u,v,a.n,b.n,b.n);}}
  }
  const a=perimeter(side,0,low),b=perimeter(next,0,low),c=perimeter(side,t,low),d=perimeter(next,t,low),n=[0,-1,0];tri(a,b,d,n,n,n);tri(a,d,c,n,n,n);
 }
 // Extruded flat caps at the tangent seam are internal mating faces; remove them.
 const source=flat.toNonIndexed(),p=source.attributes.position,n=source.attributes.normal;
 for(let i=0;i<p.count;i+=3){if(Math.abs(n.getY(i))<.5)continue;for(let j=0;j<3;j++){positions.push(p.getX(i+j),p.getY(i+j),p.getZ(i+j));normals.push(n.getX(i+j),n.getY(i+j),n.getZ(i+j));}}
 // Keep the cylindrical aperture walls from the flat extrusion.
 for(let i=0;i<p.count;i+=3){if(Math.abs(n.getY(i))>.5)continue;const mx=(p.getX(i)+p.getX(i+1)+p.getX(i+2))/3,mz=(p.getZ(i)+p.getZ(i+1)+p.getZ(i+2))/3;if(mx<x0+R+1e-5||mx>x1-R-1e-5||mz<z0+R+1e-5||mz>z1-R-1e-5)continue;for(let j=0;j<3;j++){positions.push(p.getX(i+j),p.getY(i+j),p.getZ(i+j));normals.push(n.getX(i+j),n.getY(i+j),n.getZ(i+j));}}
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(positions,3));g.setAttribute('normal',new T.Float32BufferAttribute(normals,3));const o=new T.Mesh(g,material);o.name='YIKAMA__TEZGAH_TEK_SAC_KAPALI_KOSE_62';o.userData={wash62:true,type:'countertop',thickness_mm:1.5,insideRadius_mm:1.5,outsideRadius_mm:3,flanges:4,closedMitredWeldedCorners:true};return o;
}
