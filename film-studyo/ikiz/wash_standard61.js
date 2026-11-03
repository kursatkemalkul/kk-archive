import {solidTools42} from './wash_solid61.js';
// Same enclosure rules as E frame53 + shell41/enclosure50. Metres; no OEM claim.
export const WASH_STANDARD61=Object.freeze({reference:'E frame53',sheet_mm:1.5,return_mm:6,seam_mm:2,postSetback_mm:7.5,innerRadius_mm:1.5,outerRadius_mm:3,sideBends:1,visibleFrontFrame:false,hinge:'concealed4mmbarrel/2mmpin',productionRelease:false});
function rect(T,a,b,c,d,r=0){const s=new T.Shape();s.moveTo(a+r,b);s.lineTo(c-r,b);if(r)s.absarc(c-r,b+r,r,-Math.PI/2,0,false);s.lineTo(c,d-r);if(r)s.absarc(c-r,d-r,r,0,Math.PI/2,false);s.lineTo(a+r,d);if(r)s.absarc(a+r,d-r,r,Math.PI/2,Math.PI,false);s.lineTo(a,b+r);if(r)s.absarc(a+r,b+r,r,Math.PI,Math.PI*1.5,false);s.closePath();return s;}
function mesh(T,F,n,g,parent,material,extra={}){const o=new T.Mesh(g,material||F.steel);o.name='YIKAMA__'+n;parent.add(o);o.userData={wash57:true,wash61:true,type:'formed sheet',sheet_mm:1.5,standard61:WASH_STANDARD61,...extra};F.parts.push(o);return o;}
export function pan61(T,F,parent,{name,a,b,bottom,top,front=0,hingeEdge=null,hingeY=[],grip=false,upperTrim=false}){
 const solid=solidTools42(T),t=.0015,depth=.006,shape=rect(T,a,bottom,b,top,t);let g=new T.ExtrudeGeometry(shape,{depth,bevelEnabled:false,curveSegments:12});g.translate(0,0,front);
 function box(x0,x1,y0,y1,z0,z1){const q=new T.BoxGeometry(x1-x0,y1-y0,z1-z0);q.translate((x0+x1)/2,(y0+y1)/2,(z0+z1)/2);return q;}
 const cuts=[box(a+t,b-t,bottom+t,top-t,front+t,front+depth+.001)];
 if(hingeEdge)for(const y of hingeY)cuts.push(box(hingeEdge==='L'?a-.001:b-t-.0001,hingeEdge==='L'?a+t+.0001:b+.001,y-.017,y+.017,front+t,front+depth+.001));
 if(upperTrim)cuts.push(box(a-.001,b+.001,top-t-.000001,top+.001,front+.0055,front+depth+.001));
 if(grip){const x=hingeEdge==='R'?a+.075:b-.075,y=(bottom+top)/2;cuts.push(box(x-.045,x+.045,y-.0125,y+.0125,front-.001,front+t+.001));}
 g=solid.subtract(g,cuts);const o=mesh(T,F,name+'_TEK_SAC_1_5_KENAR_6',g,parent,null,{type:'door skin',return_mm:6,openBack:true,closedDressedCorners:true,innerLiner:false,hingeReliefsOccupied:true,upperReturnBack_mm:upperTrim?5.5:6});
 if(grip){const x=hingeEdge==='R'?a+.075:b-.075,y=(bottom+top)/2,black=new T.MeshStandardMaterial({color:0x343e43,roughness:.65});
  for(const q of [[x-.0465,x+.0465,y-.014,y+.014,front+.0115,front+.013],[x-.0465,x-.045,y-.0125,y+.0125,front+t,front+.0115],[x+.045,x+.0465,y-.0125,y+.0125,front+t,front+.0115],[x-.0465,x+.0465,y-.014,y-.0125,front+t,front+.0115],[x-.0465,x+.0465,y+.0125,y+.014,front+t,front+.0115]])F.plate(name+'_GOMME_PARMAK_CEBI',q,parent,black);
 }
 return o;
}
export function bentLand61(T,F,parent,{name,outer,hand,bottom,top,seat,rear=2.318,land=10}){
 const t=.0015,R=.003,r=.0015,x=outer+hand*t,cx=x+hand*t,cz=seat+.003,tip=cx+hand*land/1000,s=new T.Shape();s.moveTo(outer,rear);s.lineTo(outer,cz);
 for(let i=1;i<=48;i++){const a=i*Math.PI/96;s.lineTo(cx-hand*R*Math.cos(a),cz-R*Math.sin(a));}
 s.lineTo(tip,seat);s.lineTo(tip,seat+t);s.lineTo(cx,seat+t);
 for(let i=47;i>=0;i--){const a=i*Math.PI/96;s.lineTo(cx-hand*r*Math.cos(a),cz-r*Math.sin(a));}s.lineTo(x,rear);s.closePath();
 const g=new T.ExtrudeGeometry(s,{depth:top-bottom,bevelEnabled:false,curveSegments:1});g.rotateX(Math.PI/2);g.translate(0,top,0);const p=g.attributes.position,n=g.attributes.normal;
 for(let i=0;i<p.count;i++){if(Math.abs(n.getY(i))>.01)continue;const dx=p.getX(i)-cx,dz=p.getZ(i)-cz,rr=Math.hypot(dx,dz);if(dz<=1e-7&&hand*dx<=1e-7){if(Math.abs(rr-R)<2e-6)n.setXYZ(i,dx/rr,0,dz/rr);else if(Math.abs(rr-r)<2e-6)n.setXYZ(i,-dx/rr,0,-dz/rr);}}
 return mesh(T,F,name,g,parent,F.skin,{wash57Part:'frame',thickness_mm:1.5,insideBendRadius_mm:1.5,outsideBendRadius_mm:3,oneContinuousClosedSheet:true,bends:1,frontSeat_m:seat,postFace_m:seat+t,directRHSSeat:true});
}
