export const PIANO_FINISH30={color:0x181a1d,roughness:.045,metalness:.25,clearcoat:1,clearcoatRoughness:.025,envMapIntensity:2.8};
// Machine exterior only: both solid skins and patterned glazing share this finish.
export const MACHINE_PIANO_FINISH30={...PIANO_FINISH30,color:0x111214,patternBrightness:.70};
// Material-local piano-black finish; no scene lighting, geometry or controls change.
export function pianoBlack29(T,scene,IKIZ){
 if(IKIZ.pianoBlack29)return IKIZ.pianoBlack29;
 const w=512,h=256,data=new Uint8Array(w*h*4);
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){
  const u=x/w,v=y/h,horizon=Math.exp(-(((v-.52)/.22)**2));let light=25+70*horizon;
  for(const [at,width,strength]of [[.10,.020,180],[.30,.065,130],[.63,.028,195],[.84,.085,115]]){let d=Math.abs(u-at);d=Math.min(d,1-d);light+=strength*Math.exp(-((d/width)**4))*Math.sin(Math.PI*v);}
  const i=(y*w+x)*4,b=Math.min(255,Math.round(light));data[i]=b;data[i+1]=b;data[i+2]=Math.min(255,b+3);data[i+3]=255;
 }
 const env=new T.DataTexture(data,w,h,T.RGBAFormat);env.mapping=T.EquirectangularReflectionMapping;env.colorSpace=T.SRGBColorSpace;env.needsUpdate=true;
 const cache=new Map(),objects=new WeakSet();let count=0;
 const excluded=/CONTA|EPDM|RUBBER|GASKET|SENSOR|KAMERA|CAMERA|EKRAN|DISPLAY|LCD|TUS|KEYPAD|TABLET|POS_|KIOSK|KABLO|CABLE|HORTUM|HOSE|MOTOR|SERVO|^DT_ROBOT|^IKIZ_ROBOT|^ROBOT[0-9_]|UR10E|^Tool$|YUVARLAK_ASKI/i;
 function refresh(){let added=0;scene.traverse(o=>{
  if(!o.isMesh||objects.has(o)||o.userData.dtScreenDepthMask)return;
  let eligible=false;for(let p=o;p;p=p.parent){if(excluded.test(p.name||'')||p.userData?.assemblyOwner==='ROB')return;if(p.name==='QR_YENI42'||p.name==='YENI_MAKINE_KOK'||p.userData?.assemblyOwner&&['A','B','E','F','K','TOP','QR','COMMON'].includes(p.userData.assemblyOwner))eligible=true;}
  if(!eligible)return;
  let changed=false;const apply=m=>{
   if(!m?.isMeshStandardMaterial||m.map||m.alphaMap||m.transmission>0||m.transparent||m.opacity<.99||m.roughness>.6)return m;
   const c=m.color.getHex(),r=c>>16&255,g=c>>8&255,b=c&255;if(Math.max(r,g,b)>75||Math.max(r,g,b)-Math.min(r,g,b)>18)return m;
   if(!cache.has(m)){const p=new T.MeshPhysicalMaterial({...PIANO_FINISH30,envMap:env});p.name='PIANO_BLACK29';p.side=m.side;p.clippingPlanes=m.clippingPlanes;p.userData={...m.userData,gercekRenk:true,preserveReviewMaterial:true,pianoBlack29:true};cache.set(m,p);}
   changed=true;return cache.get(m);
  };
  const m=Array.isArray(o.material)?o.material.map(apply):apply(o.material);if(changed){if(IKIZ.katmanlar?.malzemeDegistir)IKIZ.katmanlar.malzemeDegistir(o,m);else o.material=m;objects.add(o);count++;added++;}
 });return added;}
 IKIZ.pianoBlack29={refresh,env,get count(){return count;},info:{color:'#181a1d',roughness:.045,clearcoat:1,clearcoatRoughness:.025,envMapIntensity:2.8,reflection:'local softbox environment',orangeUnchanged:true,screensRubberAndRobotExcluded:true}};return IKIZ.pianoBlack29;
}

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
