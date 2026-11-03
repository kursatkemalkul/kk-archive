// Fit the existing counter to the new wall. Manual drawer mechanisms, device
// dimensions, sheet thicknesses and working heights retain their real sizes.
export function counter82(T,I){
 const S=I.sahne,g=S.scene.getObjectByName('IKIZ_DUKKAN'),root=I.personelTezgah71.root,DX=-.116;
 root.position.x+=DX;root.updateMatrix();root.updateMatrixWorld(true);
 const F=2.810,CX=2.957,CZ=2.802,t=.0015;
 function back(z,gap){if(z<=2.348)return 3.117-gap;if(z<=2.450)return 3.117-(z-2.348)*(.060/.102)-gap;if(z<=CZ)return 3.057-gap;return CX+Math.sqrt(Math.max(0,(.100-gap)**2-(z-CZ)**2));}
 const lx=(z,gap)=>back(z,gap)-DX;
 function footprint(front,z0,z1,gap,holes=[]){const s=new T.Shape();s.moveTo(front,z0);s.lineTo(front,z1);for(let k=0;k<=128;k++){const z=z1-(z1-z0)*k/128;s.lineTo(lx(z,gap),z);}s.closePath();s.holes.push(...holes);return s;}
 function band(z0,z1,gap,w){const s=new T.Shape();for(let k=0;k<=128;k++){const z=z0+(z1-z0)*k/128;if(k===0)s.moveTo(lx(z,gap),z);else s.lineTo(lx(z,gap),z);}for(let k=0;k<=128;k++){const z=z1-(z1-z0)*k/128;s.lineTo(lx(z,gap+w),z);}s.closePath();return s;}
 function extrude(shape,y0,y1){const q=new T.ExtrudeGeometry(shape,{depth:y1-y0,bevelEnabled:false,curveSegments:24}),p=q.attributes.position;for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getY(i),y=p.getZ(i);p.setXYZ(i,x,y+y0,z);}const ids=[];for(let i=0;i<p.count;i+=3)ids.push(i,i+2,i+1);q.setIndex(ids);q.computeVertexNormals();return q;}
 function replace(name,geometry){const o=root.getObjectByName('PERSONEL_TEZGAH71__'+name);if(!o)throw Error('Counter part missing '+name);o.geometry.dispose();o.geometry=geometry;for(const c of o.children)if(c.isLineSegments){c.geometry.dispose();c.geometry=new T.EdgesGeometry(geometry,30);}return o;}
 function box(b){return new T.BoxGeometry(b[1]-b[0],b[3]-b[2],b[5]-b[4]).translate((b[0]+b[1])/2,(b[2]+b[3])/2,(b[4]+b[5])/2);}
 const circle=(x,z,r)=>{const p=new T.Path();p.absarc(x,z,r,0,Math.PI*2,true);return p;};
 const holes=[circle(2.950,2.490,.008),...[-.035,.035].flatMap(x=>[-.035,.035].map(z=>circle(2.950+x,2.490+z,.00275)))];
 replace('UST_TABLA_304_1_5',extrude(footprint(F,2.350,2.850,.008,holes),.7685,.770));
 replace('KAVISLI_ARKA_ETEK_50',extrude(band(2.350,2.850,.008,t),.770,.820));
 replace('DOLAP_TABAN_1_2',extrude(footprint(2.833,2.3555,2.8235,.0115),.100,.1015));
 replace('DOLAP_KAVISLI_ARKA_1_2',extrude(band(2.354,2.825,.010,t),.100,.7685));
 replace('YAN_BUKUM_40',box([F+t,lx(2.850,.008),.730,.7685,2.8485,2.850]));
 replace('DUVAR_YANI_ETEK_50',box([F,lx(2.350,.0095),.770,.820,2.350,2.3515]));
 replace('DOLAP_YAN_DUVAR',box([2.833,lx(2.3555,.0115),.100,.7685,2.354,2.3555]));
 replace('DOLAP_YAN_UC',box([2.833,lx(2.825,.0115),.100,.7685,2.8235,2.825]));
 const originalBack=z=>2.619+Math.sqrt(Math.max(0,.544**2-(z-2.348)**2))+DX;
 // Rear feet and posts translate rigidly. Crossmember length changes only
 // along its extrusion axis; the RHS wall and its cross-section stay intact.
 root.updateMatrixWorld(true);
 root.traverse(o=>{if(!o.isMesh||!(/__(AYAK_|SASI_DIKME|UST_YATAY_TASIYICI)/.test(o.name)))return;
  const b=new T.Box3().setFromObject(o),c=b.getCenter(new T.Vector3()),z=c.z;
  const foot=/__AYAK_/.test(o.name),cross=/UST_YATAY_TASIYICI/.test(o.name),front=foot?F+.030+DX:2.845+DX;
  if(cross){const oldEnd=originalBack(z)-.045,newEnd=back(z,.010)-.045,start=F+.030+DX,p=o.geometry.attributes.position,inv=new T.Matrix4().copy(o.matrixWorld).invert(),v=new T.Vector3();for(let i=0;i<p.count;i++){v.fromBufferAttribute(p,i).applyMatrix4(o.matrixWorld);v.x=start+(v.x-start)*(newEnd-start)/(oldEnd-start);v.applyMatrix4(inv);p.setXYZ(i,v.x,v.y,v.z);}p.needsUpdate=true;o.geometry.computeBoundingBox();}
  else if(c.x>(front+originalBack(z)-(foot?.045:.020))/2){o.position.x+=back(z,.010)-originalBack(z);o.updateMatrix();}
  else return;
  for(const c of o.children)if(c.isLineSegments){c.geometry.dispose();c.geometry=new T.EdgesGeometry(o.geometry,30);}
 });
 const moved=['PERSONEL_TEZGAH71'];
 for(const n of['DUKKAN__POS_TABLET','PERSONEL_TEZGAH71__POS_MONTAJ','PERSONEL_DINLENME_TABURESI30']){const o=g.getObjectByName(n);if(o){o.position.x+=DX;o.updateMatrix();moved.push(n);}}
 const extras=[];g.traverse(o=>{if(/^SHOP30_(TEZGAH_TELEFON|TELEFON_CAM|TEZGAH_USB_C_PANEL|TEZGAH_USB_C_KABLO)$/.test(o.name))extras.push(o);});
 for(const o of extras){o.position.x+=DX;o.updateMatrix();moved.push(o.name);}
 const pos=I.ekranlar3b?.pos;if(pos){pos.o.position.x+=DX;pos.mask.position.x+=DX;if(Array.isArray(pos.konum))pos.konum[0]+=DX;pos.mask.updateMatrix();}
 // Independently added bag hooks follow the straight front ledge now. Their
 // complete geometry rotates as one rigid fitting, retaining real dimensions.
 for(const[index,x]of[[1,2.200],[2,2.900]]){const o=g.getObjectByName('DUKKAN__ACC29_CANTA_ASKISI_'+index);if(!o)continue;const b=new T.Box3().setFromObject(o),c=b.getCenter(new T.Vector3()),angle=Math.atan2(c.x-2.619,c.z-2.348);const M=new T.Matrix4().makeTranslation(x,c.y,3.153).multiply(new T.Matrix4().makeRotationY(-angle)).multiply(new T.Matrix4().makeTranslation(-c.x,-c.y,-c.z));o.applyMatrix4(M);moved.push(o.name);}
 // The prior wider room datum also moved the kiosk off its actual wall.
 // Keep its complete display/POS/receipt assembly and mask together.
 const kiosks=[];g.traverse(o=>{if((/^DUKKAN__KIOSK_|^DUKKAN__D2_KIOSK_|^DUKKAN_SERVIS__KIOSK_/.test(o.name))&&!/IC_SERVIS_KUTUSU/.test(o.name)){for(let p=o.parent;p&&p!==g;p=p.parent)if(/^DUKKAN__KIOSK_|^DUKKAN__D2_KIOSK_|^DUKKAN_SERVIS__KIOSK_/.test(p.name))return;kiosks.push(o);}});
 for(const o of kiosks){o.position.x+=DX;o.updateMatrix();moved.push(o.name);}
 const kiosk=I.ekranlar3b?.kiosk;if(kiosk){kiosk.o.position.x+=DX;kiosk.mask.position.x+=DX;if(Array.isArray(kiosk.konum))kiosk.konum[0]+=DX;kiosk.mask.updateMatrix();}
 root.updateMatrixWorld(true);const b=new T.Box3().setFromObject(root);
 return{moved,outerBounds:[...b.min.toArray(),...b.max.toArray()],rearWallGap_mm:8,drawerCount:3,drawerStroke_mm:250,tabletMountHoles:5};
}
