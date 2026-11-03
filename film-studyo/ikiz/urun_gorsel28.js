import {GLTFLoader} from './vendor/GLTFLoader.js';
import {hamurBezeKur} from './hamur_beze.js';
export const CAN28={diameter:.058,height:.1454,datumHeight:.115,centerOffset:.0152};
export const brand28=drawer=>drawer==='K6_IC1'?'Fanta':drawer==='K6_IC2'?'Sprite':'Coca-Cola';
// The robot's published product frame is a grasp datum calibrated on the old
// 115 mm can. Keep that datum; the taller body grows upward from the same base.
// This is a lower side grasp, not a change to the robot trajectory or its speed.
export async function urunGorsel28(T){
 const loader=new GLTFLoader(),models={};
 const w=256,h=128,pixels=new Uint8Array(w*h*4);
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4,v=100+110*Math.sin(Math.PI*y/h)+35*Math.pow(Math.max(0,Math.cos(x/w*Math.PI*4)),20);pixels[i]=pixels[i+1]=pixels[i+2]=v;pixels[i+3]=255;}
 const env=new T.DataTexture(pixels,w,h,T.RGBAFormat);env.mapping=T.EquirectangularReflectionMapping;env.colorSpace=T.SRGBColorSpace;env.needsUpdate=true;
 const protect=o=>{o.userData.renkSinif='gercek';o.traverse(m=>{if(!m.isMesh)return;m.castShadow=true;m.receiveShadow=true;for(const a of(Array.isArray(m.material)?m.material:[m.material])){a.userData.gercekRenk=true;if(a.metalness>.3){a.envMap=env;a.envMapIntensity=.8;}}});return o;};
 for(const brand of ['Coca-Cola','Fanta','Sprite']){
  const s=(await loader.loadAsync(new URL('./yeni_makine/urun28/'+brand+'.glb',import.meta.url).href)).scene;
  s.updateMatrixWorld(true);const box=new T.Box3().setFromObject(s),size=box.getSize(new T.Vector3()),c=box.getCenter(new T.Vector3());
  if(Math.abs(size.x-CAN28.diameter)>.0001||Math.abs(size.y-CAN28.height)>.0001||Math.abs(size.z-CAN28.diameter)>.0001)throw Error('330 ml model ölçüsü yanlış: '+brand);
  s.position.sub(c);const root=new T.Group();root.name='URUN_28_'+brand;root.add(s);models[brand]=protect(root);
 }
 models.hamur=protect(hamurBezeKur(T,[.0938,.0572,.095]));models.lahm=protect(hamurBezeKur(T,[.0741,.0457,.075]));
 const d=new T.Group();d.name='URUN_28_TATLI';
 const mat=p=>new T.MeshStandardMaterial(p),black=mat({color:0x121518,roughness:.38}),clear=new T.MeshPhysicalMaterial({color:0xffffff,transparent:true,opacity:.2,roughness:.1,metalness:0,depthWrite:false,side:T.DoubleSide});
 const box=(sx,sy,sz,m,x,y,z)=>{const a=new T.Mesh(new T.BoxGeometry(sx,sy,sz),m);a.position.set(x,y,z);d.add(a);return a;};
 box(.065,.006,.065,black,0,-.027,0);
 box(.064,.0008,.064,clear,0,.0296,0);
 for(const z of[-.032,.032])box(.065,.053,.0007,clear,0,.0025,z);
 for(const x of[-.032,.032])box(.0007,.053,.064,clear,x,.0025,0);
 box(.049,.01,.049,mat({color:0xb38a53,roughness:.95}),0,-.019,0);
 box(.049,.026,.049,mat({color:0xf0d8a5,roughness:.9}),0,-.001,0);
 box(.049,.004,.049,mat({color:0x58331f,roughness:.65}),0,.014,0);
 const cv=document.createElement('canvas');cv.width=512;cv.height=128;const ctx=cv.getContext('2d');ctx.fillStyle='#121417';ctx.fillRect(0,0,512,128);ctx.fillStyle='white';ctx.textAlign='center';ctx.font='bold 66px Arial';ctx.fillText('AUTOKITCH',256,88);const tex=new T.CanvasTexture(cv);tex.colorSpace=T.SRGBColorSpace;
 const sticker=new T.Mesh(new T.PlaneGeometry(.046,.012),mat({map:tex}));sticker.rotation.x=-Math.PI/2;sticker.position.y=.030;d.add(sticker);models.tatli=protect(d);
 return {models,can:CAN28,protect};
}
