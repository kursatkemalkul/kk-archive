// Small, explicit frames instead of reading datum positions from retired CAD.
// Geometry is loaded separately. Legacy labels are stable aliases for consumers.
let pending;
export function frameContract27(){
 return pending??=(async()=>{
  const r=await fetch('./ayarlar/konumlar.json',{signal:AbortSignal.timeout(15000)});if(!r.ok)throw Error('Konum sözleşmesi HTTP '+r.status);
  const c=await r.json();if(c.schema!=='autokitch.frames/1'||c.units?.length!=='m'||!c.model_sha256)throw Error('Konum sözleşmesi biçimi geçersiz');
  return c;
 })();
}
export function frameBagla27(T,I,g){
 const c=I.frameContract27;if(!c)return;
 const file=g.parser.json.asset.extras?.clean27pack;
 if(!file||!c.packs[file])throw Error('Model / konum paketi eşleşmedi');
 const frames=c.packs[file].frames;
 if(frames.length!==g.parser.json.nodes.length)throw Error('Konum düğüm sayısı değişmiş: '+file);
 const seen=new Set();
 for(const [o,a]of g.parser.associations){
  if(!a||a.nodes==null)continue;const q=frames[a.nodes];if(!q)throw Error('Konum bulunamadı');seen.add(a.nodes);
  if(q.matrix){o.matrix.fromArray(q.matrix);o.matrix.decompose(o.position,o.quaternion,o.scale);}
  else{o.position.fromArray(q.translation||[0,0,0]);o.quaternion.fromArray(q.rotation||[0,0,0,1]);o.scale.fromArray(q.scale||[1,1,1]);}
  o.updateMatrix();o.matrixWorldNeedsUpdate=true;
 }
 g.scene.updateMatrixWorld(true);
 I.frameBound27??={};I.frameBound27[file]={bound:seen.size,defined:frames.length};
}
