import {shopGradient30} from './shop_gradient30.js';
import {pianoBlack29} from './piano_black29.js?v=29eki-gloss';
import {duvarBirlesikGeometri} from './dukkan_plan.js';
import {HOURS_BOLD29 as SHOP_GLYPHS29} from './shop_hours_bold29.js';
// Light-responsive orange shop finishes and visual switch enclosure access; no plant commands.
export function dukkanTemiz29(T,scene,g,IKIZ){
 if(IKIZ.dukkanTemiz29)return IKIZ.dukkanTemiz29;
 const reflection=pianoBlack29(T,scene,IKIZ).env;
 const orange=new T.MeshPhysicalMaterial({color:0xe16520,roughness:.30,metalness:0,clearcoat:.38,clearcoatRoughness:.18,envMap:reflection,envMapIntensity:.70}),white=new T.MeshPhysicalMaterial({color:0xf4f4f1,roughness:.58,metalness:0,clearcoat:.12,clearcoatRoughness:.35,envMap:reflection,envMapIntensity:.35}),cream=new T.MeshBasicMaterial({color:0xffe6b8,toneMapped:false});
 const gradient30=shopGradient30(T,orange);
 for(const m of [orange,white,cream])m.userData={storefront60Finish:true,preserveReviewMaterial:true,gercekRenk:true,uniformShopFinish29:true,...(m===orange?{shopGradient30:{bottom:'#bc2f18',middle:'#db4a1e',top:'#ec6a22',worldHeight:true}}:{})};
 const root=new T.Group();root.name='DUKKAN__TEMIZ29';root.userData.wallVisibility=true;g.add(root);const removed=[],painted=new Set();let breaker=null,qr=null,largePanel=null;
 function paint(o,m){if(!o?.isMesh)return;if(m===orange||Array.isArray(m)&&m.includes(orange))gradient30.apply(o,Array.isArray(m));o.castShadow=true;o.receiveShadow=true;if(IKIZ.katmanlar?.malzemeDegistir)IKIZ.katmanlar.malzemeDegistir(o,m);else o.material=m;painted.add(o.name);}
 function refresh(){
  const backdrop=scene.getObjectByName('DUKKAN__KEDI_ARKA_DUVAR');if(backdrop){scene.updateMatrixWorld(true);gradient30.shopGradientHeight.value=Math.max(2.8,new T.Box3().setFromObject(backdrop).max.y);paint(backdrop,orange);}
  scene.updateMatrixWorld(true);const retire=[];scene.traverse(o=>{const n=o.name||'';
   if(o.isMesh){let protectedPart=false;for(let p=o;p;p=p.parent)if(/^PERSONEL_TEZGAH71|YIKAMA|^DUKKAN__BAR29|^PERSONEL_BOY_DOLABI29|TABLET|POS_MOVE/.test(p.name||''))protectedPart=true;
    if(!protectedPart){const b=new T.Box3().setFromObject(o),sz=b.getSize(new T.Vector3());if(b.min.x>1.97&&b.max.x<2.809&&b.min.z>1.67&&b.max.z<2.98&&b.min.y>.05&&b.max.y<1.60&&sz.y<.10&&sz.x<.45&&sz.z<.45)retire.push(o);}
   }

   if(/^DUKKAN__DAR_TEZGAH_|^PERSONEL_TEZGAH24|^ELLE_CEKMECE_/.test(n)||/^(?:PERSONEL__|DUKKAN_SERVIS__PERSONEL_).*(?:MENFEZ|menfez|KOL$|KULP|kol$|kulp)/.test(n)||/^DUKKAN__BAR29_(CAM_KALDIRMA_TUTAMAGI|ICERIDEN_CAM_KILIDI|ACIK_KONUM_EMNIYET_MANDALI)$/.test(n)||n==='DUKKAN__KALAN29_SERVIS_TEPSISI'||n==='DUKKAN__ACC29_COP_KUTUSU'||/^DUKKAN__KALAN29_COP_/.test(n)||/^DUKKAN__HUCRE_KAPI_(KILIT_|HAREKETLI_DIL|DUVAR_ICI_KILIT_BESLEME)/.test(n)||/CITA|CITALAR/.test(n)||/^ELLE_CEKMECE_/.test(n)||n==='PERSONEL_TEZGAH24'||n==='DUKKAN__MAKINE_ODASI_BEYAZ_KAPLAMA'||/^DUKKAN_SERVIS__(KASA_(?!TABLET)|APG_NANO|NAKIT_|SARF_CEKMECE_|YEDEK_FIS_RULOSU|TEZGAH_KABLO_GECISI)/.test(n)||/^PERSONEL__(?!el_|sabunluk_|havluluk_).*(?:menfez|etiket|kulp|kol)/i.test(n))retire.push(o);
  });for(const o of retire){if(!o.parent)continue;removed.push(o.name);o.removeFromParent();o.traverse(m=>m.geometry?.dispose());}
  if(IKIZ.disBar29){IKIZ.disBar29.cam.state.locked=false;IKIZ.disBar29.info.insideLock=false;}
  const wall=g.getObjectByName('DUKKAN__TEK_PARCA_DUVAR');if(wall)paint(wall,[white,orange]);
  g.traverse(o=>{if(!o.isMesh)return;
   if(/^DUKKAN__CEPHE58_/.test(o.name)&&!(/SPOT/.test(o.name))&&!(Array.isArray(o.material)?o.material:[o.material]).some(m=>m.transparent))paint(o,orange);
   if(o.name==='DUKKAN__KEDI_ARKA_DUVAR'||o.name==='DUKKAN__KAPI_PERSONEL_KANAT')paint(o,orange);
   if(/^DUKKAN__BAR29_(PENCERE_BOSLUKLU_DIKME_|KANAT_YAN_PROFIL$|KANAT_YATAY_PROFIL$|DENGE_MEKANIZMASI_YAN_KASET_|KANAT_KILAVUZ_RAY_)/.test(o.name))paint(o,orange);
  });
  g.traverse(o=>{if(/^DUKKAN_SERVIS__PERSONEL_SERVIS_PRIZI|^DUKKAN__TESISAT_|^DUKKAN__PRIZ_/.test(o.name))o.userData.wallVisibility=true;});
  refreshQR();pianoBlack29(T,scene,IKIZ).refresh();refreshShadows();installBreaker();installLargePanel();return {removed:removed.length,painted:painted.size,qr:!!qr,breaker:!!breaker};
 }
 // One cached daylight shadow map; reflections stay local to the orange finish.
 function refreshShadows(){
  const renderer=IKIZ.sahne?.renderer;if(!renderer)return;
  renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;
  const sun=scene.children.find(o=>o.isDirectionalLight);if(!sun)return;
  sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.camera.left=-7;sun.shadow.camera.right=7;sun.shadow.camera.top=7;sun.shadow.camera.bottom=-7;sun.shadow.camera.near=.1;sun.shadow.camera.far=25;sun.shadow.camera.updateProjectionMatrix();sun.shadow.normalBias=.012;sun.shadow.bias=-.00015;sun.shadow.radius=3;
  sun.shadow.autoUpdate=false;sun.shadow.needsUpdate=true;
  for(const name of ['DUKKAN__SLEEPING_CAT67','DUKKAN__KEDI_ARKA_DUVAR','DUKKAN__TEK_PARCA_ZEMIN'])g.getObjectByName(name)?.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});
 }
 function refreshQR(){const M=IKIZ.qrYeni42;if(!M?.root)return false;
  for(const record of M.doors.records)if(record.side==='MUSTERI')record.leaf.traverse(o=>{if(o.isMesh&&o.userData.doorLayer==='outer')paint(o,orange);});
  M.root.traverse(o=>{if(!o.isMesh)return;if(/^(MUSTERI_SABIT_SAC_|SABIT_CONTA_OTURMA_MUSTERI|DIS_(SOL|SAG|UST)_|DUVAR_KAIDESI_)/.test(o.name)){paint(o,orange);for(const c of o.children)if(c.isLineSegments)c.material.color.setHex(0xb74a16);}});
  qr=M.root;return true;
 }
 function label(text,x,y,width){const sum=[...text].reduce((a,c)=>a+SHOP_GLYPHS29.glyphs[c].advance,0),scale=width/sum,positions=[],normals=[];let at=0;
  for(const c of text){const gl=SHOP_GLYPHS29.glyphs[c],path=new T.ShapePath();for(const cmd of gl.commands){const p=cmd.slice(1);if(cmd[0]==='M')path.moveTo(...p);if(cmd[0]==='L')path.lineTo(...p);if(cmd[0]==='Q')path.quadraticCurveTo(...p);if(cmd[0]==='C')path.bezierCurveTo(...p);if(cmd[0]==='Z')path.currentPath.closePath();}if(gl.commands.length){const geo=new T.ExtrudeGeometry(path.toShapes(false),{depth:.0008/scale,bevelEnabled:false,curveSegments:4});geo.scale(scale,scale,scale);geo.translate(x+at*scale,y,3.003);positions.push(...geo.attributes.position.array);normals.push(...geo.attributes.normal.array);geo.dispose();}at+=gl.advance;}
  const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(positions,3));geo.setAttribute('normal',new T.Float32BufferAttribute(normals,3));const o=new T.Mesh(geo,cream);o.name='DUKKAN__7_24_'+text;root.add(o);return o;
 }
 label('7/24',1.080,2.520,.500);
 function installLargePanel(){
  if(largePanel)return true;
  const door=scene.getObjectByName('ROBOT25_DUVAR_PANO_KAPI');if(!door?.isMesh)return false;
  scene.updateMatrixWorld(true);const b=new T.Box3().setFromObject(door),size=b.getSize(new T.Vector3()),axis=size.x<size.z?0:2,horizontal=axis===0?2:0;
  const hinges=[];scene.traverse(o=>{if(o.isMesh&&/^ROBOT25_DUVAR_PANO_MENTESE_/.test(o.name))hinges.push(o);});
  const hc=hinges.length?new T.Box3().setFromObject(hinges[0]).getCenter(new T.Vector3()):b.min.clone(),centre=b.getCenter(new T.Vector3());
  const pivot=new T.Group();pivot.name='ROBOT25_DUVAR_PANO_ACILIR_KAPAK29';pivot.position.copy(centre);pivot.position.setComponent(horizontal,hc.getComponent(horizontal));pivot.userData={bar29Dynamic:true,visualOnly:true};scene.add(pivot);scene.updateMatrixWorld(true);
  const parts=[door];const latch=scene.getObjectByName('ROBOT25_DUVAR_PANO_KILIT');if(latch)parts.push(latch);for(const o of parts)pivot.attach(o);
  const back=scene.getObjectByName('ROBOT25_DUVAR_PANO_ARKA'),bc=back?new T.Box3().setFromObject(back).getCenter(new T.Vector3()):centre.clone().setComponent(axis,centre.getComponent(axis)+.1);
  const frontSign=Math.sign(centre.getComponent(axis)-bc.getComponent(axis))||-1,widthSign=Math.sign(centre.getComponent(horizontal)-hc.getComponent(horizontal))||1;
  const state={value:0,target:0},toggle=()=>{state.target=state.target?0:1;return state.target;},action={kind:'elle',label:'Büyük elektrik panosu kapağı · aç / kapat',toggle};
  for(const o of parts)o.traverse(m=>{if(m.isMesh)m.userData.twinAction=action;});
  largePanel={door,latch,pivot,state,toggle,sign:frontSign*widthSign*(axis===0?1:-1),closedMatrix:door.matrixWorld.clone()};IKIZ.buyukPanoKapak29=largePanel;return true;
 }
 function installBreaker(){if(breaker)return true;const body=scene.getObjectByName('ELK_DUVAR__salter');if(!body?.isMesh)return false;
  const yellow=scene.getObjectByName('ELK_DUVAR__salter_sari'),red=scene.getObjectByName('ELK_DUVAR__salter_kirmizi');if(!red)return false;
  scene.updateMatrixWorld(true);const b=new T.Box3().setFromObject(body),rb=new T.Box3().setFromObject(red),delta=rb.getCenter(new T.Vector3()).sub(b.getCenter(new T.Vector3())),axis=Math.abs(delta.x)>Math.abs(delta.z)?0:2,horizontal=axis===0?2:0,sign=Math.sign(delta.getComponent(axis))||1,lo=b.min.toArray(),hi=b.max.toArray(),front=sign>0?hi[axis]:lo[axis],t=.003;
  const bounds=[lo[0],hi[0],lo[1],hi[1],lo[2],hi[2]],hole=bounds.map((v,i)=>v+(i%2===0?.004:-.004));if(sign>0)hole[2*axis+1]=front+.005;else hole[2*axis]=front-.005;
  body.userData.wallVisibility=true;
  const geometry=duvarBirlesikGeometri(T,[bounds],[hole]);geometry.applyMatrix4(body.matrixWorld.clone().invert());body.geometry.dispose();body.geometry=geometry;
  const coverBounds=bounds.slice();coverBounds[2*axis]=sign>0?front-t:front;coverBounds[2*axis+1]=sign>0?front:front+t;
  const geo=new T.BoxGeometry(coverBounds[1]-coverBounds[0],coverBounds[3]-coverBounds[2],coverBounds[5]-coverBounds[4]);geo.translate((coverBounds[0]+coverBounds[1])/2,(coverBounds[2]+coverBounds[3])/2,(coverBounds[4]+coverBounds[5])/2);
  const cover=new T.Mesh(geo,Array.isArray(body.material)?body.material[0]:body.material);cover.name='ELK_DUVAR__KUTU_ACILIR_KAPAK';cover.userData={assemblyOwner:'POWER',katman:'kapak',visualOnly:true};scene.add(cover);
  const pivot=new T.Group();pivot.name='ELK_DUVAR__KAPAK_MENTESE29';const p=[0,0,0];p[axis]=front;p[horizontal]=lo[horizontal];pivot.position.fromArray(p);pivot.userData={assemblyOwner:'POWER',katman:'kapak',wallVisibility:true};scene.add(pivot);scene.updateMatrixWorld(true);for(const o of [cover,yellow,red].filter(Boolean))pivot.attach(o);
  const state={value:0,target:0},toggle=()=>{state.target=state.target?0:1;return state.target;};
  const action={kind:'elle',label:'Şalter panosu kapağı · aç / kapat',toggle};body.userData.twinAction=action;pivot.traverse(o=>{if(o.isMesh)o.userData.twinAction=action;});pivot.userData.bar29Dynamic=true;cover.userData.bar29Dynamic=true;
  breaker={body,cover,pivot,state,sign:axis===0?sign:-sign,axis,closedBounds:bounds,toggle};return true;
 }
 let scans=0,time=0;function update(dt){if(largePanel){const q=largePanel.state,step=Math.min(.1,Math.max(0,dt||0))/.9;q.value+=Math.sign(q.target-q.value)*Math.min(step,Math.abs(q.target-q.value));largePanel.pivot.rotation.y=largePanel.sign*q.value*Math.PI/2;}if(breaker){const q=breaker.state,step=Math.min(.1,Math.max(0,dt||0))/.9;q.value+=Math.sign(q.target-q.value)*Math.min(step,Math.abs(q.target-q.value));breaker.pivot.rotation.y=breaker.sign*q.value*Math.PI/2;}
  if(IKIZ.yuklendi&&(scans<15||!qr||!breaker||!largePanel)){time+=Math.max(0,dt||0);if(time>=2){time=0;scans++;if(scans<=15)refresh();if(!qr)refreshQR();if(!breaker)installBreaker();if(!largePanel)installLargePanel();}}
 }
 IKIZ.kancalar.push(update);IKIZ.dukkanTemiz29={root,orange,white,gradient30,refresh,refreshQR,installBreaker,installLargePanel,update,removed,painted,get breaker(){return breaker;},info:{flatOrange:false,lightResponsiveOrange:true,orangeReflection:true,orangeRoughness:.30,cachedDaylightShadows:true,hoursText:'7/24',hoursFont:'Arial Bold',glassTextRemoved:true,whiteMachineRoom:true,flutesRemoved:true,sevenDays24Hours:true,wallFixturesFollowWallVisibility:true,visualBreakerCoverOnly:true,cameraChanged:false}};
 refresh();return IKIZ.dukkanTemiz29;
}
