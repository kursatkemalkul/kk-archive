// Permanently remove replaced visual geometry; shared live resources survive.
export function retireGeometry90(T,scene,node,I){
 const removed=new Set();node.traverse(o=>removed.add(o));
 const live=new Set();scene.traverse(o=>{if(!removed.has(o)&&o.geometry)live.add(o.geometry);});
 let meshes=0;const released=new Set();
 node.traverse(o=>{if(!o.geometry)return;const old=o.geometry;meshes++;
  // Old door registries may retain nodes. Release their buffers as well.
  o.geometry=new T.BufferGeometry();o.geometry.setAttribute('position',new T.Float32BufferAttribute([],3));
  if(!live.has(old)&&!released.has(old)){old.dispose();for(const k of Object.keys(old.attributes))old.deleteAttribute(k);old.setIndex(null);old.morphAttributes={};released.add(old);}
 });
 const name=node.name;node.removeFromParent();
 const r=I.sceneCleanup90??={removed:[],meshes:0};r.removed.push(name);r.meshes+=meshes;
}
