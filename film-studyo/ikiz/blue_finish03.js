// Approved cobalt finish. Material-only: no dimensions, poses or controls change.
export const COBALT03={color:0x1855c9,slope:.90,left:1.535,right:3.223,bottom:.76};
export function blueMachine03(T,IKIZ,root){
 const cache=new WeakMap(),color=new T.Color(COBALT03.color);let count=0;
 root.updateMatrixWorld(true);
 root.traverse(o=>{
  if(!o.isMesh||!['kapak','sac'].includes(o.userData.katman))return;
  const apply=m=>{
   if(!m?.userData.pianoBlack29||m.transparent||m.transmission>0||m.userData.graphiteBezel30)return m;
   const key=o.geometry;let byGeometry=cache.get(m);if(!byGeometry){byGeometry=new WeakMap();cache.set(m,byGeometry);}if(byGeometry.has(key))return byGeometry.get(key);
   const out=m.clone(),rest=o.matrixWorld.clone();
   out.name=m.name+'_COBALT03';out.userData={...m.userData,cobalt03:true,gercekRenk:true,preserveReviewMaterial:true};
   out.onBeforeCompile=shader=>{
    shader.uniforms.cobaltRest03={value:rest};shader.uniforms.cobaltColor03={value:color};
    shader.vertexShader='uniform mat4 cobaltRest03; varying vec3 cobaltPoint03;\n'+shader.vertexShader;
    shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\ncobaltPoint03=(cobaltRest03*vec4(position,1.0)).xyz;');
    shader.fragmentShader='uniform vec3 cobaltColor03; varying vec3 cobaltPoint03;\n'+shader.fragmentShader;
    shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
     float diagonal03=cobaltPoint03.x-${COBALT03.slope.toFixed(3)}*cobaltPoint03.y;
     float band03=step(${COBALT03.left},diagonal03)*step(diagonal03,${COBALT03.right})*step(${COBALT03.bottom},cobaltPoint03.y)*step(0.025,cobaltPoint03.z);
     // White printed 01 artwork remains over the paint, including its antialiasing.
     float ink03=${m.map?'smoothstep(0.65,0.9,max(diffuseColor.r,max(diffuseColor.g,diffuseColor.b)))':'0.0'};
     diffuseColor.rgb=mix(diffuseColor.rgb,cobaltColor03,band03*(1.0-ink03));`);
   };
   out.customProgramCacheKey=()=>`cobalt03-${m.map?'printed':'solid'}`;
   out.needsUpdate=true;byGeometry.set(key,out);count++;return out;
  };
  const updated=Array.isArray(o.material)?o.material.map(apply):apply(o.material);
  if(IKIZ.katmanlar?.malzemeDegistir)IKIZ.katmanlar.malzemeDegistir(o,updated);else o.material=updated;
 });
 IKIZ.cobalt03={...COBALT03,machineMaterials:count};return IKIZ.cobalt03;
}
