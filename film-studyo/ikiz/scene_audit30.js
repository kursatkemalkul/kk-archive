// One incremental visual geometry audit, no machine commands.
export function sceneAudit30(T,scene,IKIZ){
 if(IKIZ.sceneAudit30)return IKIZ.sceneAudit30;
 const report={complete:false,meshes:0,triangles:0,emptyMeshes:0,nonFinite:[],duplicateFacesRemoved:0,referenceAnchors:[],legacy:[]},queue=[];
 scene.updateMatrixWorld(true);scene.traverse(o=>{if(o.isMesh&&!o.isInstancedMesh)queue.push(o);});
 const retired=/^ELLE_CEKMECE_|^DUKKAN__DAR_TEZGAH_|^PERSONEL_TEZGAH24$|^DUKKAN__KALAN29_SERVIS_TEPSISI$/;
 function inspect(o){if(!o.parent||!o.geometry?.attributes.position)return;report.meshes++;if(retired.test(o.name)){report.legacy.push(o.name);o.removeFromParent();return;}
  if(o.geometry.userData?.referenceOnly){
   // Do not delete datum nodes: live motion still looks up their transforms.
   // Keep only bounding metadata and the datum transform, no vertex buffers.
   if(!o.userData.visualCleanup30||o.geometry.attributes.position.count){const old=o.geometry;old.computeBoundingBox();old.computeBoundingSphere();const empty=new T.BufferGeometry();empty.setAttribute('position',new T.Float32BufferAttribute([],3));empty.boundingBox=old.boundingBox?.clone();empty.boundingSphere=old.boundingSphere?.clone();empty.userData={...old.userData};o.geometry=empty;o.userData.visualCleanup30='reference-only anchor';}
   o.visible=false;report.referenceAnchors.push(o.name);return;
  }
  const g=o.geometry,p=g.attributes.position,ix=g.index,count=ix?.count??p.count;if(!count){report.emptyMeshes++;return;}report.triangles+=count/3;
  // Limit topology edits to shop meshes; station mechanisms retain their CAD.
  let shop=false;for(let a=o;a;a=a.parent)if(a.name==='IKIZ_DUKKAN')shop=true;
  if(!shop){for(const v of p.array)if(!Number.isFinite(v)){report.nonFinite.push(o.name);break;}return;}
  const seen=new Set(),keep=[],groups=[];let last=-1,start=0,removed=0;
  for(let i=0;i<count;i+=3){const ids=[0,1,2].map(j=>ix?ix.getX(i+j):i+j),points=ids.map(id=>[p.getX(id),p.getY(id),p.getZ(id)]);if(points.some(a=>a.some(v=>!Number.isFinite(v)))){report.nonFinite.push(o.name);return;}
   if(!shop)continue;const material=g.groups.find(gr=>i>=gr.start&&i<gr.start+gr.count)?.materialIndex??0,keys=points.map(a=>a.map(v=>Math.round(v*1e7)).join(','));const key=material+':'+[keys.join('|'),[keys[1],keys[2],keys[0]].join('|'),[keys[2],keys[0],keys[1]].join('|')].sort()[0];
   if(seen.has(key)){removed++;continue;}seen.add(key);if(material!==last){if(last>=0)groups.push([start,keep.length-start,last]);start=keep.length;last=material;}keep.push(...ids);
  }
  if(removed){if(last>=0)groups.push([start,keep.length-start,last]);const clean=g.clone();clean.setIndex(keep);clean.clearGroups();for(const group of groups)clean.addGroup(...group);o.geometry=clean;report.duplicateFacesRemoved+=removed;}
 }
 let cursor=0;function step(){const until=Math.min(queue.length,cursor+6);for(;cursor<until;cursor++)inspect(queue[cursor]);if(cursor<queue.length)setTimeout(step,0);else report.complete=true;}
 IKIZ.sceneAudit30=report;step();return report;
}
