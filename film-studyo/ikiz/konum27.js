/* Explicit migration boundary. Contains no CAD geometry or production commands.
 * E's 31.5 mm assembly correction previously lived inside e_layout56's CAD
 * rebuilding routine. Keep it once, independently of that retired mechanism.
 * Full new-model endpoint calibration is validated separately.
 */
export function konumBagla27(T,I){
 if(I.konum27)return I.konum27;
 if(!I.frameContract27)throw Error('Konum sözleşmesi yüklenmedi');
 const dx=I.frameContract27.layout.E_assembly_dx_m,roots=[],root=I.kok;
 root.updateMatrixWorld(true);
 root.traverse(o=>{
  if(!/^E_/.test(o.name))return;
  for(let p=o.parent;p&&p!==root;p=p.parent)if(/^E_/.test(p.name))return;
  roots.push(o);
 });
 for(const o of roots){
  const a=o.parent.worldToLocal(o.getWorldPosition(new T.Vector3()).add(new T.Vector3(dx,0,0))),delta=a.clone().sub(o.position);
  o.position.copy(a);const rest=I.ent.dinlenme.get(o);if(rest)rest.p.add(delta);
 }
 I.stationOffsets56={...(I.stationOffsets56||{}),E:dx};
 I.esleme.assemblyOffsets_m={...(I.esleme.assemblyOffsets_m||{}),E:[dx,0,0]};
 if(I.esleme.urun?.yer?.E?.konum_m)I.esleme.urun.yer.E.konum_m[0]+=dx;
 root.updateMatrixWorld(true);
 return I.konum27={units:'m',axes:{x:'hat boyunca',y:'yukarı',z:'robot önü'},EAssemblyOffset_m:dx,roots:roots.map(o=>o.name),source:'e_layout56 approved assembly datum; geometry rebuild removed'};
}
