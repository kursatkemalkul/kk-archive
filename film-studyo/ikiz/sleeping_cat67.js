import {GLTFLoader} from './vendor/GLTFLoader.js';
import {MeshoptDecoder} from './vendor/meshopt_decoder.module.js';
export async function sleepingCat67(parent){
 try{
 const response=await fetch(new URL('./models/user-cat74.glb.gz',import.meta.url));if(!response.ok)throw new Error('Cat asset HTTP '+response.status);
 // 22 Eki: sunucu .glb.gz'yi Content-Encoding: gzip ile gönderiyor (tarayıcı zaten açıyor); yalnız gzip imzası (1f 8b) varsa aç.
 let raw=await response.arrayBuffer();{const b=new Uint8Array(raw,0,2);if(b[0]===0x1f&&b[1]===0x8b)raw=await new Response(new Blob([raw]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer();}
 const gltf=await new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).parseAsync(raw,'');gltf.scene.name='DUKKAN__SLEEPING_CAT67';gltf.scene.position.z=-0.12;
 gltf.scene.traverse(o=>{if(!o.isMesh)return;o.updateMatrix();o.matrixAutoUpdate=false;for(const m of Array.isArray(o.material)?o.material:[o.material]){m.userData.storefront60Finish=true;m.userData.preserveReviewMaterial=true;
 m.onBeforeCompile=shader=>{shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>',`#include <map_fragment>
 float cream77=(1.0-smoothstep(0.12,0.32,(diffuseColor.r-diffuseColor.g)/max(diffuseColor.r,0.001)))*smoothstep(0.06,0.28,min(diffuseColor.r,min(diffuseColor.g,diffuseColor.b)));
 float warm74=smoothstep(0.02,0.22,diffuseColor.r-diffuseColor.b);
 float stripe74=smoothstep(0.26,0.60,(diffuseColor.r-diffuseColor.g)/max(diffuseColor.r,0.001));
 diffuseColor.rgb*=mix(vec3(1.0),vec3(1.055,0.77,0.53),warm74);
 diffuseColor.rgb*=mix(vec3(1.0),vec3(0.955,0.675,0.45),stripe74*warm74*0.775);
 diffuseColor.rgb=mix(diffuseColor.rgb,min(vec3(1.0),diffuseColor.rgb*1.22+vec3(0.018)),cream77*0.75);
 `);};m.customProgramCacheKey=()=> 'storefront-cat-light-cream77';}});
 parent.add(gltf.scene);window.IKIZ?.katmanlar?.update();document.documentElement.dataset.sleepingCat67='ready';document.documentElement.dataset.cat77=JSON.stringify({source:'user FBX',triangles:181384,originalPBR:true,width_m:3.1625,roofContact_m:2.8,separateTailRemoved:true,shiftBack_m:0.20});
 }catch(e){document.documentElement.dataset.sleepingCat67='error';console.error('Storefront cat:',e);}
}
