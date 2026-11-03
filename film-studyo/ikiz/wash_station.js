import {duvarBirlesikGeometri} from './dukkan_plan.js';
import {yikamaKur} from './yikama.js';
import {washFabrication57} from './wash_fabrication57.js?v=29eki-floor';
import {cabinetLeaf57} from './wash_doors57.js';
import {washServices60} from './wash_services60.js?v=29eki-floor';
import {washFeedback60} from './wash_feedback60.js';
export const WASH={bounds:[2.010,3.151,0,2.770,1.505,2.318],counter_y:.890,upper_bottom:1.480,upper_front:1.668,
 washer:{model:'MEIKO M-iClean UL',body:[2.0465,2.6465,0,.855,1.505,2.185],rack_mm:[500,600],entry_mm:435,water_per_cycle_l:2.8,tank_l:11,source:'https://www.meiko.com/en-hk/products/warewashing/undercounter-dishwashers-and-glasswashers/m-iclean-u/technical-data'},
 sink:{inner_mm:[400,450,250],custom_stainless:true,inner_bounds:[2.683,3.083,.628,.878,1.650,2.100]},
 chemical_stock:{detergent_l:5,rinse_aid_l:1,low_foam_equipment_cleaner_l:1,approved_surface_product_l:.5},tools:{cloths:4,brushes:2,paper_rolls:1,disposable_glove_boxes:2,reusable_glove_pairs:1,goggles:1}};
export function washStationKur(T,g,liste,MAT,IKIZ={}){
 // Retire loose rosettes belonging to the removed pre-layout wet appliances.
 // dukkanPlan already removed their associated pipes; they are not supply ports.
 const retired=[];for(const o of [...g.children])if(/^DUKKAN__TESISAT_(MEIKO|EKIPMAN_EVYESI)_.*_ROZET$/.test(o.name)){retired.push(o.name);o.removeFromParent();}IKIZ.wash57RetiredServiceRosettes=retired;
 const root=new T.Group();root.name='DUKKAN__YIKAMA_ISTASYONU';g.add(root);const steel=MAT.paslanmaz,black=MAT.siyah,cover=new T.MeshStandardMaterial({color:0xc5d1d5,metalness:.65,roughness:.38}),shell=[];
 function box(name,b,mat=steel,parent=root){const o=new T.Mesh(new T.BoxGeometry(b[1]-b[0],b[3]-b[2],b[5]-b[4]),mat);o.position.set((b[0]+b[1])/2,(b[2]+b[3])/2,(b[4]+b[5])/2);o.name='YIKAMA__'+name;parent.add(o);return o;}
 function tube(name,pts,r=.008,mat=steel){const p=new T.CurvePath();for(let i=1;i<pts.length;i++)p.add(new T.LineCurve3(new T.Vector3(...pts[i-1]),new T.Vector3(...pts[i])));const o=new T.Mesh(new T.TubeGeometry(p,32,r,10,false),mat);o.name='YIKAMA__'+name;root.add(o);return o;}
 function cylinder(name,x,y,z,r,h,mat=steel,parent=root){const o=new T.Mesh(new T.CylinderGeometry(r,r,h,24),mat);o.name='YIKAMA__'+name;o.position.set(x,y+h/2,z);parent.add(o);return o;}
 function rounded(w,d,r){const s=new T.Shape(),x=-w/2,z=-d/2;s.moveTo(x+r,z);s.lineTo(x+w-r,z);s.quadraticCurveTo(x+w,z,x+w,z+r);s.lineTo(x+w,z+d-r);s.quadraticCurveTo(x+w,z+d,x+w-r,z+d);s.lineTo(x+r,z+d);s.quadraticCurveTo(x,z+d,x,z+d-r);s.lineTo(x,z+r);s.quadraticCurveTo(x,z,x+r,z);return s;}
 const [x0,x1,,top,z0,z1]=WASH.bounds;
 const fabrication=washFabrication57(T,root,MAT,IKIZ,box,tube,cylinder);shell.push(...fabrication.shell);
 const {washer,hinge,tray,basket,ready}=fabrication,wb=WASH.washer.body,wx0=wb[0],wz1=wb[5];
 fabrication.pan('KIMYASAL_TABAN',2.6795,3.1215,.1405,z0+.010,2.108,.0015,.0105);fabrication.pan('KIMYASAL_TAVAN',2.679,3.1195,.460,z0+.009,2.108,.0015,.020);
 const hoseBack=new T.Mesh(duvarBirlesikGeometri(T,[[2.679,3.1195,.132,.460,2.108,2.1095]],[[2.795,2.805,.435,.445,2.107,2.111],[2.815,2.825,.435,.445,2.107,2.111]]),steel);hoseBack.name='YIKAMA__KIMYASAL_ARKA_AYIRICI';root.add(hoseBack);fabrication.plate('KIMYASAL_SOL_AYIRICI',[2.6775,2.679,.130,.8485,1.539,2.108]);
 // Flush hinged chemical leaf. Feet stay visible and accessible for levelling.
 const chemRecord=cabinetLeaf57(T,fabrication,root,{name:'KIMYASAL_KAPAK',a:2.653,b:3.1485,bottom:.1025,top:.8665,front:1.505,mountWidth:0});
 const chemDoor=chemRecord.leaf;fabrication.doors=[chemRecord];
 const chemicalFloorStart=root.children.length;
 function drip(name,b){box(name+'_TABAN',[b[0],b[1],b[2],b[2]+.002,b[4],b[5]],black);for(const wall of [[b[0],b[0]+.002,b[2]+.002,b[3],b[4],b[5]],[b[1]-.002,b[1],b[2]+.002,b[3],b[4],b[5]],[b[0]+.002,b[1]-.002,b[2]+.002,b[3],b[4],b[4]+.002],[b[0]+.002,b[1]-.002,b[2]+.002,b[3],b[5]-.002,b[5]]])box(name+'_KENAR',wall,black);}
 drip('DETERJAN_SIZINTI',[2.685,2.885,.112,.206,1.555,2.055]);drip('PARLATICI_SIZINTI',[2.900,3.120,.112,.174,1.555,1.865]);drip('YUZEY_URUNU_SIZINTI',[2.900,3.000,.112,.174,1.885,2.055]);drip('TEMIZLEYICI_SIZINTI',[3.020,3.120,.112,.174,1.885,2.055]);
 const chemicals=[];chemicals.push(box('DETERJAN_5L',[2.710,2.860,.114,.394,1.585,1.775],new T.MeshStandardMaterial({color:0xe4e4dd})));cylinder('DETERJAN_KAPAK',2.785,.394,1.625,.020,.025,black);
 const blue=new T.MeshStandardMaterial({color:0x6a9ab7}),green=new T.MeshStandardMaterial({color:0x88a58f});chemicals.push(cylinder('PARLATICI_1L',3.010,.114,1.675,.045,.200,blue),cylinder('YUZEY_URUNU_500ML',2.950,.114,1.970,.033,.180,green),cylinder('DUSUK_KOPUKLU_TEMIZLEYICI_1L',3.070,.114,1.970,.040,.220,green));
 cylinder('PARLATICI_KAPAK',3.010,.314,1.675,.015,.020,blue);cylinder('YUZEY_URUNU_KAPAK',2.950,.294,1.970,.012,.018,black);cylinder('TEMIZLEYICI_KAPAK',3.070,.334,1.970,.014,.020,black);
 for(const o of root.children.slice(chemicalFloorStart))o.position.y+=.030;
 for(const [i,x,z,y]of [[0,2.785,1.625,.419],[1,3.010,1.675,.334]]){const rz=2.180+i*.020,rx=2.800+i*.020,dx=2.500+i*.020;tube('EMIS_LANSI_'+i,[[x,.180,z],[x,y+.030,z],[x,.470,z],[rx,.440,2.090],[rx,.440,rz],[rx,.755,rz],[dx,.755,2.225],[dx,.400,2.181]],.003,i?blue:black);}

 const dirty=new T.Group();dirty.name='YIKAMA__KIRLI_BEKLETME';root.add(dirty);box('KIRLI_TEPSI_TABAN',[2.030,2.630,.890,.892,1.550,2.030],steel,dirty);
 for(const b of [[2.030,2.032,.892,.910,1.550,2.030],[2.628,2.630,.892,.910,1.550,2.030],[2.032,2.628,.892,.910,1.550,1.552],[2.032,2.628,.892,.910,2.028,2.030]])box('KIRLI_TEPSI_KENAR',b,steel,dirty);
 washServices60(T,fabrication,root,MAT);washFeedback60(T,fabrication,root,chemDoor);shell.splice(0,shell.length,...fabrication.shell);
 const yikama=yikamaKur(T,washer,IKIZ,{hinge,tray});liste.push({ad:'YIKAMA_ISTASYONU',tur:'mobilya',kutu:WASH.bounds},{ad:'BULASIK_MEIKO_UL',tur:'cihaz',kutu:wb});
 let seeThrough=null;function inside(v){chemDoor.visible=!v;if(v&&!seeThrough)seeThrough=new T.MeshStandardMaterial({color:0xc5d1d5,transparent:true,opacity:.12,depthWrite:false});for(const o of shell){if(!o.userData.originalMaterial57)o.userData.originalMaterial57=o.material;o.material=v?seeThrough:o.userData.originalMaterial57;}}
 return{root,box,tube,cylinder,yikama,dirty,washer,basket,chemicals,chemDoor,inside,ready,fabrication,bilgi:WASH};
}
