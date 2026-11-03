import { BAGLANTI } from './k_baglanti.js';

// CAD malzemeye göre birleştirdiği vida/kaynak ağlarını hareket sahiplerine ayır.
// Özgün üçgenler/ölçüler korunur; sabit parçalar aynı düğümde kalır.
export function kMekanikKur(T, kok, E) {
  const report={ayrilanUcgen:0,baglantilar:[],kafa:[]};
  const moving={CUT:[],X:[],XZ:[]};
  const obsolete=['aluminyum_0','aluminyum_1','M4_77','M4_78','braket304'];
  if(kok.getObjectByName('K_SERVIS121__kelepce304_0__KESICI'))
    for(const id of obsolete){const o=kok.getObjectByName('K_MERKEZ120__'+id+'__KESICI');if(o)o.visible=false;}
  for(const node of new Set(BAGLANTI.map(b=>b.node))){
    const root=kok.getObjectByName(node);if(!root)continue;
    const components=BAGLANTI.filter(b=>b.node===node), meshes=[];
    root.traverse(o=>{if(o.isMesh)meshes.push(o);});
    for(const o of meshes){
      const g=o.geometry,pos=g.getAttribute('position'),index=g.index;
      const ids=index?Array.from(index.array):Array.from({length:pos.count},(_,i)=>i);
      const out={CUT:[],X:[],XZ:[],FIXED:[]};
      for(let i=0;i<ids.length;i+=3){
        const tri=ids.slice(i,i+3);
        const b=components.find(b=>tri.every(v=>[0,1,2].every(a=>{
          const x=pos.array[v*pos.itemSize+a];return x>=b.lo[a]-.00003&&x<=b.hi[a]+.00003;
        })));
        out[b?.motion||'FIXED'].push(...tri);
      }
      for(const key of ['CUT','X','XZ'])if(out[key].length){
        const geom=g.clone();geom.setIndex(out[key]);geom.computeBoundingBox();geom.computeBoundingSphere();
        const mesh=new T.Mesh(geom,o.material);mesh.name=node+'__DINAMIK_'+key+'_'+report.baglantilar.length;
        mesh.position.copy(o.position);mesh.quaternion.copy(o.quaternion);mesh.scale.copy(o.scale);o.parent.add(mesh);
        moving[key].push(mesh.name);report.ayrilanUcgen+=out[key].length/3;report.baglantilar.push(mesh.name);
      }
      g.setIndex(out.FIXED);g.computeBoundingBox();g.computeBoundingSphere();
    }
  }
  for(const [name,key] of [['K_BAG__vida109','X'],['K_BAG__vida111','XZ']]){
    if(kok.getObjectByName(name))moving[key].push(name);
  }
  kok.traverse(o=>{
    if(o.visible&&/^K_(?:MERKEZ120|SERVIS121|KESICI124)__.*__KESICI$/.test(o.name)){
      moving.CUT.push(o.name);report.kafa.push(o.name);
    }
  });
  const add=(output,names,dir,stroke)=>{
    if(!names.length)return;const k=E.cikis[output];if(!k)return;
    k.katkilar.push({tur:'oteleme',dugumler:names,yon_dunya:dir,sifir:0,olcek:.001,model_strok_mm:stroke});
  };
  add('DO_K_BICAK_IN',moving.CUT,[0,-1,0],125);
  add('DO_K_ITICI',moving.X,[1,0,0],250);
  // surucu, Z kafasına X arabasının katkısını da ekler.
  add('DO_K_ITICI',moving.XZ,[0,0,1],350);
  return report;
}
