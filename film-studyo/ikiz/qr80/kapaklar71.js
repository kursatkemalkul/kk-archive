import {COBALT03} from '../blue_finish03.js?v=4cb7bf26ffaa';
import {slulKur,slulPoz} from '../slul.js';
export function acikliklar33(C,bays){const d=bays.map(b=>({id:'G'+String(b.id).padStart(2,'0'),kind:'eye',x0:b.min[0],x1:b.max[0],y0:b.min[1],y1:b.max[1]}));
 for(const[name,y0,y1,hinge]of[['ALT',126,564,'side'],['UST_IC',1437,1798,'top'],['UST_TEKNIK',1822,2175,'top']])for(const[k,x0,x1]of[['SOL',20,982],['SAG',994,1956]])d.push({id:name+'_'+k,kind:'service',hinge,x0,x1,y0,y1,hand:name==='ALT'?'SOL':k});
 d.push({id:'PIN_SERVIS',kind:'service',hinge:'side',hand:'SOL',x0:1968,x1:2068,y0:126,y1:2175});return d;
}
export function kapaklar33(T,C,ctx){const {root,groups,parts,box,add,cutGeometry,openings}=ctx,records=[],metal=new T.MeshStandardMaterial({color:0xc6cbd0,metalness:.7,roughness:.35}),dark=new T.MeshStandardMaterial({color:0x292d31,roughness:.65}),materials={ROBOT:new T.MeshPhysicalMaterial({color:COBALT03.color,roughness:.16,metalness:.25,clearcoat:1,clearcoatRoughness:.06}),MUSTERI:new T.MeshStandardMaterial({color:new T.Color().setRGB(19/255,17/255,16/255),roughness:.2,metalness:.45}),warm:new T.MeshStandardMaterial({color:new T.Color().setRGB(146/255,129/255,116/255),roughness:.38,metalness:.6})};
 const mark=(o,r,layer)=>{o.userData={...o.userData,door33:r.id,doorLayer:layer};return o;};
 function localBox(r,name,b,mat,layer){const g=new T.BoxGeometry(b[1]-b[0],b[3]-b[2],b[5]-b[4]).translate((b[0]+b[1])/2,(b[2]+b[3])/2,(b[4]+b[5])/2),o=new T.Mesh(g,mat);o.name=r.id+'_'+name;r.leaf.add(mark(o,r,layer));return o;}
 function register(o,group,extra={}){o.updateWorldMatrix(true,true);const b=new T.Box3().setFromObject(o);parts.push({name:o.name,group,material:'door33',min:b.min.toArray(),max:b.max.toArray(),...extra});}
 function ringGeometry(x0,x1,y0,y1,outer,inner,t){const sh=new T.Shape();sh.moveTo(x0-outer,y0-outer);sh.lineTo(x1+outer,y0-outer);sh.lineTo(x1+outer,y1+outer);sh.lineTo(x0-outer,y1+outer);sh.closePath();const h=new T.Path();h.moveTo(x0-inner,y0-inner);h.lineTo(x0-inner,y1+inner);h.lineTo(x1+inner,y1+inner);h.lineTo(x1+inner,y0-inner);h.closePath();sh.holes.push(h);return new T.ExtrudeGeometry(sh,{depth:t,bevelEnabled:false});}
 // Skin/spacer interfaces are internal. Build the eight edge walls only:
 // no second planar face is generated beneath either existing metal skin.
 function frameEdgeGeometry89(x0,x1,y0,y1,inset,t){
  const a=[],loops=[[[x0,y0],[x1,y0],[x1,y1],[x0,y1]],[[x0+inset,y0+inset],[x0+inset,y1-inset],[x1-inset,y1-inset],[x1-inset,y0+inset]]];
  for(const loop of loops)for(let i=0;i<4;i++){const p=loop[i],q=loop[(i+1)%4];a.push(...p,0,...q,0,...p,t,...q,0,...q,t,...p,t);}
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(a,3));g.computeVertexNormals();g.computeBoundingBox();g.computeBoundingSphere();return g;
 }
 function hardware(r){const container=new T.Group();container.scale.setScalar(1000);container.name=r.id+'_KALDIRMA_TAKIMI';groups.mekanizma.add(container);const scale=.315/.613,dir=r.side==='ROBOT'?-1:1,face=r.side==='ROBOT'?0:C.outer_mm[2]/1000;
 for(const[hand,x]of[['SOL',(r.x0+10)/1000],['SAG',(r.x1-10)/1000]]){const h=slulKur(T,container,{name:r.id+'_'+hand,x,bottom:r.y0/1000-.003,face,dir,scale,material:metal,leafThickness:.0035});if(hand==='SAG'){h.root.position.x=2*x;h.root.scale.x=-1;}
  // Same compact fixed housing on both faces; preserve link lengths and pivots.
  h.root.traverse(o=>{if(o.isMesh&&/SABIT_PIM_[01]$/.test(o.name)){o.scale.y=.008/(.025*scale);o.userData.pin_length_mm=8;}if(o.isMesh&&/_SLUL_(GOVDE|YAN_KORUMA)$/.test(o.name)){o.scale.x=.120/(.3625*scale);o.userData.customHousingDepth_mm=120;}if(o.isMesh&&/KANAT_BAGLANTI_PLAKASI$/.test(o.name))o.scale.y=.86;});
  h.pose(0);root.updateMatrixWorld(true);const b=new T.Box3().setFromObject(h.root),wall=hand==='SOL'?r.x0:r.x1,offset=3,target=wall+(hand==='SOL'?offset:-offset),shift=target-(hand==='SOL'?b.min.x:b.max.x);h.root.position.x+=shift/1000;h.pose(0);root.updateMatrixWorld(true);
  const body=h.root.children.find(o=>/_GOVDE$/.test(o.name)&&!o.name.includes('AMORTISOR')),B=new T.Box3().setFromObject(body),a=hand==='SOL'?target-3:target,c=hand==='SOL'?target:target+3;
  box(r.id+'_'+hand+'_3mm_MONTAJ_PLAKASI',[a,c,B.min.y,B.max.y,B.min.z,B.max.z],'mekanizma','shelf',{mechanismMount:true});

  h.root.traverse(o=>{if(o.isMesh){o.name=o.name||r.id+'_SLUL_PARCA';o.userData={...o.userData,door33:r.id,mechanism33:true};register(o,'mekanizma',{mechanism:true});}});r.hardware.push(h);
 }
 }
 for(const d of openings)for(const side of(d.kind==='eye'?['ROBOT','MUSTERI']:['ROBOT'])){const r={...d,id:d.id+'_'+side,side,v:0,target:0,hardware:[]},dir=side==='ROBOT'?1:-1,origin=side==='ROBOT'?0:C.outer_mm[2];r.bottomLap=r.id.startsWith('ALT_')||r.id.startsWith('PIN_')?22:11;r.topLap=r.id.startsWith('UST_TEKNIK')?10:11;if(r.kind==='eye'){r.bottomLap=9;r.topLap=9;}r.pivot33=r.kind==='service'?(r.hinge==='top'?new T.Vector3(0,r.y1+r.topLap+1,1):new T.Vector3(r.hand==='SOL'?r.x0-6:r.x1+6,0,1)):null;r.leaf=new T.Group();r.leaf.name=r.id+'_KANAT';groups.kapak.add(r.leaf);
  if(r.id.startsWith('ALT_'))r.bottomLap=Math.min(r.bottomLap,Math.max(0,r.y0));
  const z=(a,b)=>dir===1?[a,b]:[C.outer_mm[2]-b,C.outer_mm[2]-a],outerZ=z(0,1),innerZ=z(2.5,3.5),coreZ=z(1,2.5),outer=localBox(r,'DIS_SAC_1mm',[r.x0-5,r.x1+5,r.y0-r.bottomLap,r.y1+r.topLap,...outerZ],side==='ROBOT'?materials.ROBOT:r.id.startsWith('ALT_')?materials.warm:materials[side],'outer');
  if(r.kind==='eye'||r.id.startsWith('PIN'))localBox(r,'IC_SAC_1mm',[r.x0+2,r.x1-2,r.y0+2,r.y1-2,...innerZ],metal,'inner');else{localBox(r,'IC_SAC_1mm',[r.x0+3,r.x1-3,r.y0+3,r.y1-3,7,8],metal,'inner');for(const[k,b]of [['SOL',[r.x0+2,r.x0+3,r.y0+2,r.y1-2,1,7]],['SAG',[r.x1-3,r.x1-2,r.y0+2,r.y1-2,1,7]],['ALT',[r.x0+3,r.x1-3,r.y0+2,r.y0+3,1,7]],['UST',[r.x0+3,r.x1-3,r.y1-3,r.y1-2,1,7]]])localBox(r,'E_TAVA_DONUS_'+k,b,metal,'spacer');}
  // Laser-cut 1.5 mm perimeter spacer joins the two skins without occupying
  // the clear opening. The 3 mm continuous EPDM ring sits OUTSIDE the inner skin.
  if(r.kind==='eye'||r.id.startsWith('PIN')){const coreG=frameEdgeGeometry89(r.x0+2,r.x1-2,r.y0+2,r.y1-2,3,1.5);coreG.translate(0,0,coreZ[0]);const core=new T.Mesh(coreG,metal);core.name=r.id+'_1_5mm_IC_CERCEVE';r.leaf.add(mark(core,r,'spacer'));}
  const sealG=ringGeometry(r.x0,r.x1,r.y0,r.y1,4,1,1),seal=new T.Mesh(sealG,dark);seal.name=r.id+'_KESINTISIZ_EPDM_3x2';r.leaf.add(mark(seal,r,'seal'));r.seal=seal;
  r.pose=value=>{const p=Math.max(0,Math.min(1,value));r.v=p;if(r.kind==='eye'){const q=slulPoz(p,.315/.613);r.leaf.position.set(0,q.y*1000,(side==='ROBOT'?-1:1)*q.out*1000);for(const h of r.hardware)h.pose(p);r.sealThickness=1.5+.5*Math.min(1,q.out*1000/.5);}else{const q=p*p*(3-2*p),a=q*85*Math.PI/180;r.leaf.position.set(0,0,0);r.leaf.rotation.set(0,0,0);const axis=r.hinge==='top'?new T.Vector3(1,0,0):new T.Vector3(0,1,0),ang=r.hinge==='top'||r.hand==='SOL'?a:-a;r.leaf.quaternion.setFromAxisAngle(axis,ang);r.leaf.position.copy(r.pivot33).sub(r.pivot33.clone().applyAxisAngle(axis,ang));r.sealThickness=Math.min(2,(1.5+(r.hinge==='top'?r.topLap-3:2)*Math.sin(a))/Math.cos(a));}
   seal.scale.z=r.sealThickness;seal.position.z=side==='ROBOT'?1:C.outer_mm[2]-1-r.sealThickness;r.leaf.updateMatrixWorld(true);
  };
  if(r.kind==='eye')hardware(r);else{
   // E Pinet-type adaptation: compact 0.5-scale OD2/pin1 for existing QR land.
   const horizontal=r.hinge==='top',lo=(horizontal?r.x0:r.y0)+10,hi=(horizontal?r.x1:r.y1)-10,at=horizontal?r.pivot33.y:r.pivot33.x,N=Math.floor((hi-lo)/15),length=N*15;
   const pin=new T.Mesh(new T.CylinderGeometry(.5,.5,length,16),metal);pin.name=r.id+'_PINET_KOMPAKT_PIM_D1';if(horizontal)pin.rotation.z=Math.PI/2;pin.position.set(horizontal?lo+length/2:at,horizontal?at:lo+length/2,1);groups.mekanizma.add(pin);register(pin,'mekanizma',{hinge:true});
   for(let i=0;i<N;i++){const sh=new T.Shape();sh.absarc(0,0,1,0,Math.PI*2,false);const h=new T.Path();h.absarc(0,0,.55,0,Math.PI*2,true);sh.holes.push(h);const len=14.8,g=new T.ExtrudeGeometry(sh,{depth:len,bevelEnabled:false,curveSegments:8});if(horizontal)g.rotateY(Math.PI/2);else g.rotateX(-Math.PI/2);const o=new T.Mesh(g,metal);o.name=r.id+'_PINET42_TOPUZ_'+i;const pos=lo+i*15+.1;if(horizontal)o.position.set(pos,at,1);else o.position.set(at,pos,1);(i%2?r.leaf:groups.mekanizma).add(o);o.userData={door33:r.id,hinge33:true};if(!(i%2)){register(o,'mekanizma',{hinge:true});box(r.id+'_PINET_SABIT_DIL_'+i,horizontal?[pos,pos+len,at-1,at+1,2,2.5]:[at-1,at+1,pos,pos+len,2,2.5],'mekanizma','shelf',{hingeMount:true});}else{const bb=horizontal?[pos,pos+len,at-6,at-.5,1,2]:r.hand==='SOL'?[at+.5,at+6,pos,pos+len,1,2]:[at-6,at-.5,pos,pos+len,1,2];localBox(r,'PINET_KANAT_DILI_'+i,bb,metal,'hinge');}}

  }
  if(r.kind==='eye'&&side==='MUSTERI'){
   // Customer labels: top-left 1, then left-to-right; service covers stay blank.
   const plc=Number(d.id.slice(1)),number=(2-Math.floor((plc-1)/4))*4+(plc-1)%4+1;
   const canvas=document.createElement('canvas');canvas.width=384;canvas.height=256;
   const ink=canvas.getContext('2d');ink.fillStyle='#ffffff';ink.font='500 176px Arial, sans-serif';ink.textAlign='center';ink.textBaseline='middle';ink.fillText(String(number),192,132);
   const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;
   const label=new T.Mesh(new T.PlaneGeometry(144,96),new T.MeshBasicMaterial({map:texture,transparent:true,depthWrite:false,toneMapped:false}));
   label.name=r.id+'_BEYAZ_NUMARA_'+number;label.position.set((r.x0+r.x1)/2,(r.y0+r.y1)/2,C.outer_mm[2]+.4);mark(label,r,'graphic');label.userData.customerLabel=number;r.leaf.add(label);
  }
  r.pose(0);r.leaf.traverse(o=>{if(o.isMesh){o.userData.door33=r.id;register(o,'kapak',{door:r.id,layer:o.userData.doorLayer});}});records.push(r);
 }
 const api={records,toggle:id=>{const r=records.find(r=>r.id===id);if(r)r.target=r.target>.5?0:1;},eyes:v=>{for(const r of records)if(r.kind==='eye')r.target=v;},step:dt=>{for(const r of records)if(r.v!==r.target){const d=Math.min(Math.max(dt,0),.05)/1.4;r.pose(r.v+Math.sign(r.target-r.v)*Math.min(d,Math.abs(r.target-r.v)));}}};return api;
}
