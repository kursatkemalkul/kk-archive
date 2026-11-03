import {hardware63} from './wash_hardware63.js';
import {pan61,WASH_STANDARD61} from './wash_standard61.js';
// Exact construction type of E's concealed lower door: welded fixed barrels,
// one moving knuckle,2mm retained pin; shallow folded leaf covers the chassis.
export function cabinetLeaf57(T,F,root,{name,a,b,bottom,top,front,hand=1}){
 const origin=hand>0?a:b,w=b-a,leaf=new T.Group();leaf.name='YIKAMA__'+name;leaf.userData.kapakIstasyon='WASH';root.add(leaf);
 const ys=[bottom+.075,top-.075],hinges=[],edge=hand>0?'L':'R';
 pan61(T,F,leaf,{name,a:hand>0?0:-w,b:hand>0?w:0,bottom,top,hingeEdge:edge,hingeY:ys,grip:true});
 const axisX=origin-hand*.0005,axisZ=front+.004,localX=-hand*.0005;
 for(const y of ys){
  const fixed=[];for(const yy of [y-.010,y+.010]){
   const o=F.ring(name+'_SABIT_GIZLI_MENTESE',axisX,yy-.004,axisZ,.002,.00105,.008);o.userData.type='fixed concealed barrel';fixed.push(o);
   const weld=F.pin(name+'_SABIT_MENTESE_KOK_TIG',[axisX,yy-.004,front+.0061],[axisX,yy+.004,front+.0061],.00065);weld.userData={...weld.userData,type:'weld',notSeparatePart:true,attachment:'same root weld to one-bend sheet/post land as E enclosure50'};
  }
  const moving=F.ring(name+'_HAREKETLI_GIZLI_MENTESE',localX,y-.005,.004,.002,.00105,.010,leaf);moving.userData.type='moving concealed barrel';
  F.pin(name+'_MENTESE_PIM',[axisX,y-.015,axisZ],[axisX,y+.015,axisZ],.001);
  F.pin(name+'_PIM_ESIR_ALT_BAS',[axisX,y-.016,axisZ],[axisX,y-.015,axisZ],.0016);
  // Welded tangential moving leaf. Bore removes any material around the pin.
  const x0=Math.min(localX,hand*.012),x1=Math.max(localX,hand*.012);
  F.plate(name+'_KANAT_BAGI',[x0,x1,y-.005,y+.005,.0015,.003],leaf);
  hinges.push({fixed,moving,axis:[axisX,y,axisZ],rootAttachment:'formed sheet backed directly by RHS or folded partition'});
 }
 const hardware=hardware63(T,F,root,leaf,{name,a,b,bottom,top,front,hand});
 function pose(t){const v=Math.max(0,Math.min(1,t)),angle=hand*Math.PI/2*v,P=new T.Vector3(localX,0,.004);leaf.rotation.y=angle;leaf.position.set(axisX,0,axisZ).sub(P.clone().applyAxisAngle(new T.Vector3(0,1,0),angle));root.updateMatrixWorld(true);hardware.update(v);return{value:v,doorAngle_deg:90*v,closureError_m:0};}
 pose(0);return{name,leaf,hinges,pose,hardware,target:0,value:0,customFabricated:true,standard61:WASH_STANDARD61};
}

