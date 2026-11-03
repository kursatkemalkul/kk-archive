// Display-only panel CAD. Existing exported datums own placement; no PLC commands.
import {GLTFLoader} from '../vendor/GLTFLoader.js';
import {mergeGeometries} from '../vendor/BufferGeometryUtils.js';
export async function panoDetay28(T,I,parent,gltf,birlestir,tag,ekler=[]){
 // 31 Eki pano31: iskeletten gelen E / K pano katmanı ikinci GLB'de; gövdeden silinen eski cihazlar atlanır.
 const bagli=o=>{for(let q=o;q;q=q.parent)if(q===gltf.scene)return true;return false;},ASSOC=[gltf,...ekler].flatMap(g=>[...g.parser.associations].map(([o,a])=>[o,a,g]));
 const url=new URL('./pano/',import.meta.url),index=await(await fetch(new URL('catalog.json',url),{signal:AbortSignal.timeout(15000)})).json();
 const root=new T.Group();root.name='YM_PANO_CIHAZLARI';parent.add(root);
 const light=new T.Group(),detail=new T.Group();light.name='YM_PANO_HAFIF';detail.name='YM_PANO_AYRINTILI';root.add(light,detail);detail.visible=false;
 const devices=[],source=[],turn=new T.Matrix4().makeRotationX(Math.PI/2).multiply(new T.Matrix4().makeScale(.001,.001,.001));
 for(const[o,a,g]of ASSOC){
  if(a?.nodes==null||!bagli(o))continue;const n=g.parser.json.nodes[a.nodes],name=n.name||'';if(!/^(CIHAZ_|SURUCU_|KIRMIZI_)/.test(name))continue;
  // 31 Eki TOP31: KIRMIZI_<ist>_<tip>_<eksen> = pano derinliğine sığmayan sürücü; düğüm matrisi derinlikte ölçekli, rengi kırmızı kalır.
  const kirmizi=name.startsWith('KIRMIZI_'),k=name.startsWith('CIHAZ_')?name.split('_').slice(2).join('_'):kirmizi?index.axes[name.split('_').slice(3).join('_')]:index.axes[name.slice(7)],file=index.types[k];if(!file)throw Error('Pano CAD eşlemesi yok: '+name);
  const station=n.extras.ist;devices.push({name,k,file,station,kirmizi,matrix:o.matrixWorld.clone()});
  o.traverse(m=>{if(m.isMesh||m.isLineSegments)source.push({o:m,M:m.matrixWorld.clone(),ist:station,katman:'ic',iskelet:null,renk:kirmizi?'gercek':'elektrik'})});
 }
 if(!devices.length)throw Error('Gövde pano cihazları bulunamadı');
 for(const m of birlestir(source,'PANO_HAFIF')){m.userData.renkSinif??='elektrik';light.add(m)}
 // Detach the original lightweight devices before the enclosure is batched.
 for(const[o,a,g]of ASSOC)if(a?.nodes!=null&&/^(CIHAZ_|SURUCU_|KIRMIZI_)/.test(g.parser.json.nodes[a.nodes].name||''))o.removeFromParent();
 const state=I.panoDetay28={devices:devices.length,types:[...new Set(devices.map(x=>x.file))].length,mode:'hafif',loaded:false,missing:[],substitutions:index.substitutions||{},placements:devices.map(d=>({name:d.name,station:d.station,type:d.file,kirmizi:d.kirmizi,matrix:d.matrix.toArray()})),kirmizi:devices.filter(d=>d.kirmizi).map(d=>d.name)};
 let pending;
 async function load(){
  if(state.loaded)return;if(pending)return pending;
  pending=(async()=>{
   const templates=new Map(),files=[...new Set(devices.map(d=>d.file))];let cursor=0;
   async function worker(){while(cursor<files.length){const file=files[cursor++],def=index.models[file];const response=await fetch(new URL(def.file,url),{signal:AbortSignal.timeout(45000)});if(!response.ok)throw Error('Pano '+file+' HTTP '+response.status);let raw=await response.arrayBuffer();const signature=new Uint8Array(raw,0,Math.min(2,raw.byteLength));if(signature[0]===31&&signature[1]===139)raw=await new Response(new Blob([raw]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer();
    const header=new DataView(raw);if(header.getUint32(0,true)!==0x46546c67||header.getUint32(8,true)!==raw.byteLength)throw Error('Pano dosyası eksik: '+file);
    if(globalThis.crypto?.subtle){const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',raw)),v=>v.toString(16).padStart(2,'0')).join('');if(hash!==def.sha256)throw Error('Pano sürümü uyuşmuyor: '+file)}
    const g=await new GLTFLoader().parseAsync(raw,'');g.scene.updateMatrixWorld(true);const byMaterial=new Map();
    g.scene.traverse(m=>{if(!m.isMesh)return;if(Array.isArray(m.material))throw Error('Desteklenmeyen çoklu CAD malzemesi: '+file);const mat=m.material,key=mat.uuid,geo=m.geometry.clone();for(const a of Object.keys(geo.attributes))if(!['position','normal',...(mat.map?['uv']:[])].includes(a))geo.deleteAttribute(a);if(!geo.attributes.normal)geo.computeVertexNormals();if(mat.map&&!geo.attributes.uv)geo.setAttribute('uv',new T.BufferAttribute(new Float32Array(geo.attributes.position.count*2),2));if(!geo.index){const idx=new Uint32Array(geo.attributes.position.count);for(let i=0;i<idx.length;i++)idx[i]=i;geo.setIndex(new T.BufferAttribute(idx,1))}geo.applyMatrix4(m.matrixWorld);if(m.matrixWorld.determinant()<0){const a=geo.index.array;for(let i=0;i<a.length;i+=3){const v=a[i+1];a[i+1]=a[i+2];a[i+2]=v}}
     if(!byMaterial.has(key))byMaterial.set(key,{mat,parts:[]});byMaterial.get(key).parts.push(geo);
    });
    const merged=[];for(const {mat,parts}of byMaterial.values()){const geo=mergeGeometries(parts,false);if(!geo)throw Error('CAD birleştirme başarısız: '+file);parts.forEach(p=>p.dispose());mat.userData={...mat.userData,gercekRenk:true,preserveReviewMaterial:true};merged.push({geo,mat})}templates.set(file,merged);g.parser.primitiveCache={};g.scene.clear();
   }}
   await Promise.all([worker(),worker()]);
   const KIRMIZI=new Map();const kirmiziMat=mat=>{if(!KIRMIZI.has(mat)){const m=mat.clone();m.map=null;m.color.set(0xd62828);m.userData={...mat.userData,gercekRenk:true,preserveReviewMaterial:true,kirmizi:true};KIRMIZI.set(mat,m)}return KIRMIZI.get(mat)};
   for(const file of files)for(const station of new Set(devices.filter(d=>d.file===file).map(d=>d.station)))for(const kir of [false,true]){const rows=devices.filter(d=>d.file===file&&d.station===station&&!!d.kirmizi===kir);if(!rows.length)continue;let j=0;for(const {geo,mat}of templates.get(file)){const mesh=new T.InstancedMesh(geo,kir?kirmiziMat(mat):mat,rows.length);mesh.name='YM_PANO_'+station+'_'+file+(kir?'_KIRMIZI_':'_')+j++;tag(mesh,station,'ic',null);mesh.userData.renkSinif=kir?'gercek':'elektrik';mesh.userData.panelCad28={file,devices:rows.length,catalogGeometry:true,substitutions:rows.filter(d=>index.substitutions?.[d.k]).map(d=>d.k)};rows.forEach((d,i)=>mesh.setMatrixAt(i,d.matrix.clone().multiply(turn)));mesh.instanceMatrix.needsUpdate=true;mesh.computeBoundingSphere();detail.add(mesh)}}
   state.loaded=true;state.draws=detail.children.length;state.triangles=detail.children.reduce((s,m)=>s+(m.geometry.index?.count||m.geometry.attributes.position.count)/3*m.count,0);
  })();try{await pending}catch(e){pending=null;state.missing=[String(e.message||e)];throw e}
 }
 return{root,state,async set(detailed){if(detailed)await load();light.visible=!detailed;detail.visible=!!detailed;state.mode=detailed?'ayrintili':'hafif';state.missing=[];I.katmanlar?.update();},light,detail};
}
