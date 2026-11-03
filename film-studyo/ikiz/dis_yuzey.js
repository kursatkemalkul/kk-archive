import {DataTexture,RGBAFormat,EquirectangularReflectionMapping,SRGBColorSpace} from 'three';
// Exterior finish only. Preserve geometry, mechanisms, screen pixels and markings.
export const DIS_YUZEY={metal:0xb9bec4,alt:0x454a50,altSinir:.792,duvar:0xffffff,zemin:0xa9adb2};
export function disYuzeyKur(){
 const cache=new Map(),w=256,h=128,pixels=new Uint8Array(w*h*4);
 // Neutral studio reflections are local to exterior metals, not the robot/food.
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const u=x/w,v=y/h,softbox=Math.pow(Math.max(0,Math.cos((u-.16)*Math.PI*4)),18),light=Math.round(70+95*Math.sin(v*Math.PI)+65*softbox*Math.sin(v*Math.PI));const i=(y*w+x)*4;pixels[i]=pixels[i+1]=pixels[i+2]=light;pixels[i+3]=255;}
 const reflection=new DataTexture(pixels,w,h,RGBAFormat);reflection.mapping=EquirectangularReflectionMapping;reflection.colorSpace=SRGBColorSpace;reflection.needsUpdate=true;
 return (o,c,source)=>{
  // gercekRenk (24 Eki, Kemal: 'her şey kendi renginde'): yeni makinenin parçaları kendi malzeme rengiyle kalır, paslanmaza çevrilmez
  if(!o.isMesh||o.userData?.dtScreenDepthMask||!source?.color||(source.userData?.preserveServicePlexi||source.userData?.storefront60Finish||source.userData?.gercekRenk))return source;   // ekran maskesi (gezinti.js, saydamlık 0) boyanmaz — boyanınca QR ekranı gri görünüyordu
  let style=null;
  if(o.name==='DUKKAN__TEK_PARCA_DUVAR')style='wall';
  else if(o.name==='DUKKAN__TEK_PARCA_ZEMIN')style='floor';
  else if(/^(PERSONEL_(KASA_DOLABI|ESYA_DOLABI)|DUKKAN_SERVIS__(PERSONEL_ESYA_KAPAK|KASA_(CEKMECE|TEKNIK_BOLME)|COP_KAPAK))/.test(o.name))style='metal';
  // 27 Eki (Kemal: "gerçek renk dediğinde her şey gerçek renginde; yıkamadaki toppingler, kasetler gri olmasın"): makine DIŞINDAKİ parçalar
  // (yıkama, yedek kasetler, QR, personel, robot) artık tek paslanmaz griye çevrilmez — kendi malzemesi ve saydamlığıyla kalır
  else if(c.part&&!source.map&&['A','TOP','F','UF','K','E','UKE','B','COMMON'].includes(c.id)&&!/(CONTA|GOMME_KOL|KULP|_VIDA|MENTESE|__(salter|sensor|ekran|cihaz|tapa)|__pom$|__pu(?:_dolgu)?$|__kaynak$)/i.test(o.name))style='machine';
  if(!style)return source;
  let variants=cache.get(source);if(!variants)cache.set(source,variants=new Map());if(variants.has(style))return variants.get(style);
  const m=source.clone();m.color.setHex(style==='wall'?DIS_YUZEY.duvar:style==='floor'?DIS_YUZEY.zemin:DIS_YUZEY.metal);
  m.opacity=1;m.transparent=false;m.depthWrite=true;m.metalness=['wall','floor'].includes(style)?0:.65;m.roughness=style==='wall'?1:style==='floor'?.94:.38;
  if(['machine','metal'].includes(style)){m.envMap=reflection;m.envMapIntensity=.65;}
  if('transmission'in m)m.transmission=0;
  if(m.emissive)m.emissive.setHex(0);
  m.userData={...m.userData,dtExteriorFinish:style};
  // 22 Eki (B75, Kemal: "alt bant hepsi paslanmaz olsun"): y<altSinir koyu alt bant KALDIRILDI — tum makine ayni paslanmaz (#b9bec4). DIS_YUZEY.alt/altSinir sabitleri eski cagrilar icin duruyor, kullanilmiyor.
  variants.set(style,m);return m;
 };
}
export function stilKopyala(m){const c=m.clone();c.onBeforeCompile=m.onBeforeCompile;c.customProgramCacheKey=m.customProgramCacheKey;return c;}
