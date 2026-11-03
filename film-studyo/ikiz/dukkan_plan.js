// Current shop layout, metres: one joined wall shell and one indoor floor.

export const PLAN={solIc:.536,sagIc:5.476,arkaIc:-1.120,cepheIc:2.883,cepheDis:2.983,kalinlik:.10,yukseklik:2.80,ayirici:[3.173,3.273],qrSol:3.273,qrMontajPayi:0,islakKaydir:-.424,hucreDuvar:1.500,yikamaYanOn:1.668,qrBaglantiZ:1.750,yikamaSol:[1.980,2.000],yikamaArka:[2.328,2.348],islakDonus:{x:4.903,z:-.755,aci:-Math.PI/2},tezgah:[2.717,3.167,.74,.77,2.360,2.883]};

// Rectilinear solid union. Only exterior faces are emitted: no overlapping

// boxes, interior faces or artificial seams where wall segments meet.

export function duvarBirlesikGeometri(T,volumes,holes=[]){

 // A single micron grid prevents almost-identical junction coordinates from

 // generating sliver faces that collapse when uploaded as Float32 vertices.

 volumes=volumes.map(b=>b.map(v=>Math.round(v*1e6)/1e6));holes=holes.map(b=>b.map(v=>Math.round(v*1e6)/1e6));

 const axes=[0,2,4].map(a=>[...new Set([...volumes,...holes].flatMap(b=>[b[a],b[a+1]]))].sort((a,b)=>a-b));

 const [X,Y,Z]=axes,N=[X.length-1,Y.length-1,Z.length-1],on=new Set();const key=(i,j,k)=>`${i},${j},${k}`;

 const inside=(b,x,y,z)=>x>b[0]&&x<b[1]&&y>b[2]&&y<b[3]&&z>b[4]&&z<b[5];

 for(let i=0;i<N[0];i++)for(let j=0;j<N[1];j++)for(let k=0;k<N[2];k++){

  const p=[(X[i]+X[i+1])/2,(Y[j]+Y[j+1])/2,(Z[k]+Z[k+1])/2];

  if(volumes.some(b=>inside(b,...p))&&!holes.some(b=>inside(b,...p)))on.add(key(i,j,k));

 }

 const pos=[],indices=[],lookup=new Map();

 function face(v){const ids=v.map(p=>{const key=p.join(',');if(!lookup.has(key)){lookup.set(key,pos.length/3);pos.push(...p);}return lookup.get(key);});indices.push(ids[0],ids[1],ids[2],ids[0],ids[2],ids[3]);}

 // Merge coplanar exterior cells into broad faces. Junctions share the

 // same union boundary instead of many tiny independent top-face strips.

 const planes=new Map();

 function expose(d,p,u,v){const k=d+':'+p;if(!planes.has(k))planes.set(k,{d,p,cells:new Set()});planes.get(k).cells.add(u+','+v);}

 for(const cell of on){const [i,j,k]=cell.split(',').map(Number);

  if(!on.has(key(i-1,j,k)))expose(0,i,j,k);if(!on.has(key(i+1,j,k)))expose(1,i+1,j,k);

  if(!on.has(key(i,j-1,k)))expose(2,j,i,k);if(!on.has(key(i,j+1,k)))expose(3,j+1,i,k);

  if(!on.has(key(i,j,k-1)))expose(4,k,i,j);if(!on.has(key(i,j,k+1)))expose(5,k+1,i,j);

 }

 for(const {d,p,cells}of planes.values())while(cells.size){

  const [u,v]=[...cells].map(k=>k.split(',').map(Number)).sort((a,b)=>a[1]-b[1]||a[0]-b[0])[0];let w=1,h=1;

  while(cells.has((u+w)+','+v))w++;outer:while(true){for(let n=0;n<w;n++)if(!cells.has((u+n)+','+(v+h)))break outer;h++;}

  for(let a=0;a<w;a++)for(let b=0;b<h;b++)cells.delete((u+a)+','+(v+b));

  if(d<2){const x=X[p],a=Y[u],b=Y[u+w],c=Z[v],e=Z[v+h];face(d===0?[[x,a,c],[x,a,e],[x,b,e],[x,b,c]]:[[x,a,e],[x,a,c],[x,b,c],[x,b,e]]);}

  else if(d<4){const y=Y[p],a=X[u],b=X[u+w],c=Z[v],e=Z[v+h];face(d===2?[[a,y,e],[a,y,c],[b,y,c],[b,y,e]]:[[a,y,c],[a,y,e],[b,y,e],[b,y,c]]);}

  else{const z=Z[p],a=X[u],b=X[u+w],c=Y[v],e=Y[v+h];face(d===4?[[b,c,z],[a,c,z],[a,e,z],[b,e,z]]:[[a,c,z],[b,c,z],[b,e,z],[a,e,z]]);}

 }

 // Flat normals retain crisp exterior corners; coplanar triangles share normals.

 let g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setIndex(indices);g=g.toNonIndexed();g.computeVertexNormals();g.computeBoundingBox();return g;

}

export function personelPlanUygula(T,kok){

 const dry=/^PERSONEL__(tezgah_|cekmece_|kam_kilit|sarf_|bez_|eldiven_|poset_|bolme_)/;

 const hand=/^PERSONEL__(el_|sabunluk_|havluluk_)/;

 kok.traverse(o=>{if(!o.isMesh)return;if(dry.test(o.name)||hand.test(o.name)){o.visible=false;return;}

  // OEM sink, dishwasher and their hoses move rigidly together, without scaling.

  o.position.x+=PLAN.islakKaydir;

 });kok.rotation.y=PLAN.islakDonus.aci;kok.position.set(PLAN.islakDonus.x,0,PLAN.islakDonus.z);kok.updateMatrixWorld(true);

}

export function dukkanPlanKur(T,g,D,liste,MAT){

 const p=PLAN,k=D.KIOSK; // Keep catalogue size and vertical screen location.

 const old=new Set(liste.filter(x=>x.tur==='duvar'||(/^ZEMIN_|^ESIK_|^KAPI_MUSTERI_|^KIOSK_|^TESISAT_|^PRIZ_KIOSK|^PRIZ_TEZGAH_[12]$|^SUPURGELIK_|^TAVAN_KENAR_|^MENFEZ_MUSTERI|^TABELA_ALANI|^SIGORTA_PANOSU_KAPAK/.test(x.ad))).map(x=>'DUKKAN__'+x.ad));

 for(const o of [...g.children])if(old.has(o.name)){g.remove(o);o.geometry?.dispose();}

 for(let i=liste.length-1;i>=0;i--)if(old.has('DUKKAN__'+liste[i].ad))liste.splice(i,1);

 const walls=[],{solIc:l,sagIc:r,arkaIc:b,kalinlik:t,yukseklik:h,cepheIc:ci,cepheDis:cd,ayirici:[a0,a1]}=p;

 const add=(...box)=>walls.push(box);

 add(l-t,l,0,h,b-t,cd);add(r,r+t,0,h,b-t,cd);add(l,r,0,h,b-t,b); // Continuous U footprint.

 // Close the entire wash/QR side, then start the curved glazing at its end.
 add(a0,a1,0,h,p.yikamaYanOn,p.yikamaArka[1]);

 // Opaque L pocket: open toward robot room, closed toward customers.

 add(...[p.yikamaSol[0],p.yikamaSol[1],0,h,p.yikamaYanOn,p.yikamaArka[1]]);

 add(p.yikamaSol[0],a0,0,h,p.yikamaArka[0],p.yikamaArka[1]);

 // Seal around the locker face: no route into the machine above or beside it.

 // Cabinet installation clearance stops below its roof; the wall header unions

 // directly into the full-height divider, with no 6 mm slit at the corner.

 add(a0,r,2.200,h,2.005,2.105);

 // The locker already has its own closed toe plinth; no duplicate bottom wall.

 const [d0,d1]=D.KAPI_P,[w0,w1,wy0,wy1]=D.PENCERE;

 add(l,d0,0,h,ci,cd);add(d0,d1,D.KAPI_Y,h,ci,cd);add(d1,w0,0,h,2.902,cd);

 // The curved hollow facade replaces all former straight window-wall pieces.

 // Keep the original 100 mm building wall.

 const [h0,h1]=D.HUCRE_KAPI,z=D.HUCRE_DUVAR;

 // Match ONLY the internal robot-room partition depth to the 100 mm structural door jamb.
 const frameT=D.HUCRE_PANEL;
 add(l,h0,0,h,z,z+frameT);add(h0,h1,D.HUCRE_KAPI_Y,h,z,z+frameT);add(h1,p.yikamaSol[1],0,h,z,z+frameT);
 // Join the adjacent perpendicular wash wall without retaining the thick partition.
 add(p.yikamaSol[0],p.yikamaSol[1],0,h,z+frameT,p.yikamaYanOn);

 // Station remains a sheet-metal cabinet, not a wall-filled niche.

 // Recessed kiosk aperture and a remaining 30 mm rear service skin.

 const screenY=k[4]+.30,screenH=.7273,zm=(k[2]+k[3])/2;

 // Only active door-lock and kiosk openings remain; shutter service cuts removed.

 const holes=[[r-.001,r+t+.001,.995,1.705,.655,1.265],[r,r+.070,k[4],screenY+screenH,zm-.225,zm+.225]];

 // Building connections enter from below; the rear wall has no service penetrations.
 const mesh=new T.Mesh(duvarBirlesikGeometri(T,walls,holes),MAT.duvar);mesh.name='DUKKAN__TEK_PARCA_DUVAR';g.add(mesh);

 const edges=new T.LineSegments(new T.EdgesGeometry(mesh.geometry,1),new T.LineBasicMaterial({color:0xb4c6d6}));edges.name='DUKKAN__DUVAR_KOSE_CIZGILERI';edges.visible=false;g.add(edges);

 walls.forEach((box,i)=>liste.push({ad:'PLAN_DUVAR_'+i,tur:'duvar',kutu:box}));

 function box(ad,coords,mat=MAT.paslanmaz,tur='mobilya'){

  const [x0,x1,y0,y1,z0,z1]=coords,o=new T.Mesh(new T.BoxGeometry(x1-x0,y1-y0,z1-z0),mat);o.name='DUKKAN__'+ad;o.position.set((x0+x1)/2,(y0+y1)/2,(z0+z1)/2);g.add(o);liste.push({ad,tur,kutu:coords});return o;

 }

 const floorServiceBores=[[2.720,2.215,.014],[3.020,2.290,.014],[2.930,2.286,.029],[3.100,2.290,.010]].map(([x,z,r])=>[x-r,x+r,-.012,.001,z-r,z+r]);
 const floor=new T.Mesh(duvarBirlesikGeometri(T,[[l-t,r+t,-.011,0,b-t,cd]],[[2.0455,2.0575,-.012,.001,2.244,2.256],[3.1265,3.1385,-.012,.001,2.244,2.256],...floorServiceBores]),MAT.zemin_ic);floor.name='DUKKAN__TEK_PARCA_ZEMIN';floor.userData.serviceEntryBores=floorServiceBores;floor.userData.wash60AnchorBores_mm=12;floor.userData.wash60AnchorBores=[[2.0455,2.0575,-.012,.001,2.244,2.256],[3.1265,3.1385,-.012,.001,2.244,2.256]];g.add(floor);liste.push({ad:'TEK_PARCA_ZEMIN',tur:'zemin',kutu:[l-t,r+t,-.011,0,b-t,cd]});

 const [tx0,tx1,ty0,ty1,tz0,tz1]=p.tezgah;

 box('DAR_TEZGAH_TABLA',p.tezgah);box('DAR_TEZGAH_ARKA_KUSAK',[tx0,tx1-.015,.64,.69,tz1-.025,tz1]);

 for(const x of [tx0+.04,tx1-.04])for(const z of [tz0+.02,tz1-.02])box('DAR_TEZGAH_AYAK_'+x+'_'+z,[x-.015,x+.015,0,ty0,z-.015,z+.015]);

 // Staff chair removed at the user's request; desk aisle remains clear.

 // 28.5 mm actual display body, rear VESA bracket and flush lower terminal.

 box('KIOSK_GOMME_QM32C',[r,r+.0285,screenY,screenY+screenH,zm-.4219/2,zm+.4219/2],MAT.siyah,'cihaz');

 box('KIOSK_GOMME_ALT_YUZ',[r,r+.003,k[4],screenY-.01,zm-.225,zm+.225],MAT.kasa,'cihaz');

 box('KIOSK_GOMME_IC_KASA',[r+.063,r+.066,k[4],screenY+screenH,zm-.225,zm+.225],MAT.kasa,'cihaz');

 box('KIOSK_GOMME_VESA100',[r+.030,r+.034,screenY+screenH/2-.06,screenY+screenH/2+.06,zm-.06,zm+.06],MAT.kasa,'cihaz');

 box('KIOSK_GOMME_POS',[r,r+.025,k[4]+.1,k[4]+.2,zm-.10,zm+.10],MAT.siyah,'cihaz');

 box('KIOSK_GOMME_FIS',[r-.0001,r+.010,k[4]+.235,k[4]+.245,zm-.085,zm+.085],MAT.ekran,'cihaz');

 const wire=new T.Line(new T.BufferGeometry().setFromPoints([[r+.045,-.02,zm],[r+.045,.1,zm],[r+.045,screenY,zm]].map(v=>new T.Vector3(...v))),new T.LineBasicMaterial({color:0xdc9760}));wire.name='DUKKAN__KIOSK_DUVAR_ICI_ALTTAN_BESLEME';g.add(wire);

 // Keep all original staff door hardware. Relocate wet service outlets with the block.

 for(const o of g.children){if(o.name.startsWith('DUKKAN__TESISAT_EL_LAVABOSU')){o.visible=false;continue;}

  if(o.name.startsWith('DUKKAN__TESISAT_')){if(o.position.x>2){o.position.x+=p.islakKaydir;o.applyMatrix4(new T.Matrix4().makeTranslation(p.islakDonus.x,0,p.islakDonus.z).multiply(new T.Matrix4().makeRotationY(p.islakDonus.aci)));}else o.position.x-=.1;}

  if(o.name==='DUKKAN__SIGORTA_PANOSU_KAPAK')o.position.x-=.1;

 }

 const gizle=hidden=>{mesh.visible=!hidden;edges.visible=!!hidden;};gizle(false);

 return {gizle,bilgi:{...p,tek_duvar_mesh:mesh.name,tek_zemin_mesh:'DUKKAN__TEK_PARCA_ZEMIN',qr_duvar_payi_mm:6,qr_cevre_on_yuz_m:2.105,tezgah_derinlik_mm:450,personel_alan_kazanci_m2:(p.ayirici[0]-p.solIc)*(p.qrBaglantiZ-p.hucreDuvar)-D.HUCRE_PANEL*(p.qrBaglantiZ-p.hucreDuvar),hucre_duvar_kaydirma_mm:250,personel_masasi:p.tezgah,yikama_kullanim_yonu:'robot odası / -z',qr_giris:'teslim yüzü açık; üst ve yan çevre kapalı',kiosk:'sağ duvara gömme; kablo duvar içinden alttan'}};

}

