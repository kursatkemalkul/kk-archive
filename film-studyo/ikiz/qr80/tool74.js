export function mount74(T,robot,model,I,adapter){
 const tool=robot.getObjectByName('Tool');if(!tool)throw Error('Tool frame missing');
 tool.traverse(o=>{if(o.isMesh)o.visible=false;});
 const mount=adapter.clone(true);mount.name='ROCHU66_FCM_R1_OEM_STEP';mount.rotation.z=Math.PI/90;tool.add(mount);
 const head=new T.Group();head.name='ROCHU66_4087';head.position.z=.042;tool.add(head);
 model.updateWorldMatrix(true,true);const inv=model.matrixWorld.clone().invert(),moving=[];
 model.traverse(o=>{if(!o.isMesh)return;const g=o.geometry.clone().applyMatrix4(inv.clone().multiply(o.matrixWorld)),m=new T.Mesh(g,o.material);m.name='ROCHU66_'+o.name;head.add(m);if(/^Gri_|^M5_parmak/.test(o.name)){m.userData.catalogue66=true;moving.push({m,rest:Array.from(g.attributes.position.array)});}});
 let gap=.102,lastGap=null;const tipZ=.094;
 tool.userData.tip66=sign=>new T.Vector3(sign*gap/2,0,.042+tipZ).applyMatrix4(tool.matrixWorld);
 function apply(frame){
  const r=frame.robot_poz||{},closure=T.MathUtils.clamp(r.kapanma||0,0,1),width=2*(r.contact_radius_m??.029);
  gap=T.MathUtils.clamp(r.gap_mm!=null?r.gap_mm/1000:.102+closure*(width-.102),.015,.106);
  // Catalogue PDF219: terminal20mm is a straight pad. Flex only the25mm
  // neck; never rotate/shear the flat distal pad or its M5 attachment holes.
  if(lastGap===gap)return;lastGap=gap;
  const dx=gap/2-.04375;
  for(const {m,rest:a}of moving){const p=m.geometry.attributes.position;for(let j=0;j<p.count;j++){const x=a[j*3],y=a[j*3+1],z=a[j*3+2],sign=x<0?-1:1,u=T.MathUtils.clamp((z-.049)/.025,0,1),w=u*u*(3-2*u);p.setXYZ(j,x+sign*dx*w,y,z);}p.needsUpdate=true;m.geometry.computeVertexNormals();m.geometry.computeBoundingSphere();}
  I.tutucuMekanik={gap_mm:gap*1000,closure,source:'CATALOGUE_4087_FCM_R1',straight_terminal_mm:20,finger_deformation:'proximal-flex visualization; catalogue supplies neutral dimensions, not deformed CAD'};
 }

 return apply;
}
