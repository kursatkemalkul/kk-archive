import {COBALT03} from '../blue_finish03.js?v=4cb7bf26ffaa';
import * as T from '../vendor/three.module.min.js';
import {kapaklar33} from './kapaklar71.js?v=4bb2414b40a2';
import {mekanizma34} from './mekanizma71.js';
import {donanim34} from './donanim71.js?v=77-floor';
export function kur71(C){
 const root=new T.Group();root.name='QR71_4X3';const groups={},parts=[],bays=[];
 for(const k of ['ana','raf','sac','kaide','kapak','mekanizma','ic','donanim']){groups[k]=new T.Group();groups[k].name=k;root.add(groups[k]);}
 const mats={steel:new T.MeshStandardMaterial({color:0xb7bec4,metalness:.65,roughness:.4}),shelf:new T.MeshStandardMaterial({color:0xc9cdd1,metalness:.65,roughness:.4}),skin:new T.MeshStandardMaterial({color:0x131110,roughness:.2,metalness:.45}),warm:new T.MeshStandardMaterial({color:new T.Color().setRGB(146/255,129/255,116/255),roughness:.38,metalness:.6}),rubber:new T.MeshStandardMaterial({color:0x333d42,roughness:.95}),seal:new T.MeshStandardMaterial({color:0x202326,roughness:.9}),orange:new T.MeshStandardMaterial({color:0xf06413,roughness:.42,metalness:.3})};
 function add(name,g,group,material,b,extra={}){const o=new T.Mesh(g,mats[material]);o.name=name;o.userData={group,...extra};groups[group].add(o);parts.push({name,group,material,min:[b[0],b[2],b[4]],max:[b[1],b[3],b[5]],...extra});return o;}
 function box(name,b,group='raf',material='shelf',extra={}){return add(name,new T.BoxGeometry(b[1]-b[0],b[3]-b[2],b[5]-b[4]).translate((b[0]+b[1])/2,(b[2]+b[3])/2,(b[4]+b[5])/2),group,material,b,extra);}
 function rhs(name,axis,b){const a=axis==='x'?0:axis==='y'?1:2,d=[b[1]-b[0],b[3]-b[2],b[5]-b[4]],u=[0,1,2].filter(i=>i!==a),w=d[u[0]],h=d[u[1]],t=1.5,sh=new T.Shape();sh.moveTo(-w/2,-h/2);sh.lineTo(w/2,-h/2);sh.lineTo(w/2,h/2);sh.lineTo(-w/2,h/2);sh.closePath();const hole=new T.Path();hole.moveTo(-w/2+t,-h/2+t);hole.lineTo(-w/2+t,h/2-t);hole.lineTo(w/2-t,h/2-t);hole.lineTo(w/2-t,-h/2+t);hole.closePath();sh.holes.push(hole);const g=new T.ExtrudeGeometry(sh,{depth:d[a],bevelEnabled:false});g.translate(0,0,-d[a]/2);if(a===0)g.rotateY(Math.PI/2);if(a===1)g.rotateX(Math.PI/2);g.translate((b[0]+b[1])/2,(b[2]+b[3])/2,(b[4]+b[5])/2);return add(name,g,'ana','steel',b,{section:'20x20x1.5',joint:'butt'});}
 function cutGeometry(rect,holes,t){const[x0,x1,y0,y1]=rect,H=holes.map(([a,b,c,d])=>[Math.max(x0,a),Math.min(x1,b),Math.max(y0,c),Math.min(y1,d)]).filter(h=>h[1]>h[0]&&h[3]>h[2]),xs=[...new Set([x0,x1,...H.flatMap(h=>h.slice(0,2))])].sort((a,b)=>a-b),ys=[...new Set([y0,y1,...H.flatMap(h=>h.slice(2))])].sort((a,b)=>a-b),nx=xs.length-1,ny=ys.length-1,cell=Array.from({length:nx},(_,i)=>Array.from({length:ny},(_,j)=>!H.some(([a,b,c,d])=>(xs[i]+xs[i+1])/2>a&&(xs[i]+xs[i+1])/2<b&&(ys[j]+ys[j+1])/2>c&&(ys[j]+ys[j+1])/2<d))),edges=new Map(),key=p=>p.join(',');
  const edge=(a,b)=>edges.set(key(a),b),has=(i,j)=>i>=0&&j>=0&&i<nx&&j<ny&&cell[i][j];for(let i=0;i<nx;i++)for(let j=0;j<ny;j++)if(cell[i][j]){const a=[xs[i],ys[j]],b=[xs[i+1],ys[j]],c=[xs[i+1],ys[j+1]],d=[xs[i],ys[j+1]];if(!has(i,j-1))edge(a,b);if(!has(i+1,j))edge(b,c);if(!has(i,j+1))edge(c,d);if(!has(i-1,j))edge(d,a);}
  const loops=[];while(edges.size){const start=edges.keys().next().value,p=[],first=start;let k=start;do{p.push(new T.Vector2(...k.split(',').map(Number)));const q=edges.get(k);if(!q)throw Error('Sac kesit döngüsü açık');edges.delete(k);k=key(q);}while(k!==first);loops.push(p);}
  const outer=loops.filter(p=>T.ShapeUtils.area(p)>0).map(p=>new T.Shape(p)),inside=(p,P)=>{let c=false;for(let i=0,j=P.length-1;i<P.length;j=i++)if((P[i].y>p.y)!==(P[j].y>p.y)&&p.x<(P[j].x-P[i].x)*(p.y-P[i].y)/(P[j].y-P[i].y)+P[i].x)c=!c;return c;};for(const p of loops.filter(p=>T.ShapeUtils.area(p)<0)){const sh=outer.find(sh=>inside(p[0],sh.getPoints()));if(!sh)throw Error('Sac deliği dışarıda');sh.holes.push(new T.Path(p));}return new T.ExtrudeGeometry(outer,{depth:t,bevelEnabled:false});
 }

 mats.backBlue=new T.MeshPhysicalMaterial({color:COBALT03.color,roughness:.16,metalness:.25,clearcoat:1,clearcoatRoughness:.06});
 const [W,H,D]=C.outer_mm,t=1.5,columns=C.column_lefts_mm,rows=C.shelf_tops_mm,Z=C.clear_depth_mm,drop=C.removed_pedestal_mm||0,base=112-drop;
 const posts=[1.5,546.5,1091.5,1636.5,2181.5];
 for(const x of posts)for(const z of [1.5,371.5])rhs('QR71_TEK_DIKEY_'+x+'_'+z,'y',[x,x+20,base,H-12,z,z+20]);
 for(const y of [...[112,568,888,1208,1528].map(y=>y-drop),1800,H-20]){
  for(let c=0;c<4;c++)for(const z of [1.5,371.5])rhs('QR71_YATAY_'+y+'_'+c+'_'+z,'x',[columns[c],columns[c]+525,y,y+20,z,z+20]);
  for(const x of posts)rhs('QR71_DERINLIK_'+y+'_'+x,'z',[x,x+20,y,y+20,21.5,371.5]);
 }
 box('ALT_TEKNIK_ZEMIN_KORUNDU',[13,2074,base,base+2,2,356]);
 if(base>0)box('ALT_METAL_ZEMINE_KAPAMA',[0,W,0,base,0,1.5],'sac','warm');
 for(let r=0;r<3;r++)for(let c=0;c<4;c++){
  const a=columns[c],b=a+525,f=rows[r],y=f+2,top=y+300,id=r*4+c+1;
  box('GOZ_'+id+'_TABAN',[a,b,f-1.5,f,Z[0],Z[1]]);box('GOZ_'+id+'_KAYMAZ',[a+20,b-20,f,y,Z[0],Z[1]],'ic','rubber');
  box('GOZ_'+id+'_IC_TAVAN',[a,b,top,top+1.5,Z[0],Z[1]]);
  box('GOZ_'+id+'_SOL_KORUYUCU_SAC',[a+18.5,a+20,y,top,Z[0],Z[1]]);box('GOZ_'+id+'_SAG_KORUYUCU_SAC',[b-20,b-18.5,y,top,Z[0],Z[1]]);
  const div=a+20+135;box('GOZ_'+id+'_DUZ_AYIRICI',[div,div+1.5,y,top,Z[0],Z[1]]);
  for(const right of [false,true]){const R=20,sh=new T.Shape();sh.absarc(R,R,R+t,Math.PI,1.5*Math.PI,false);sh.absarc(R,R,R,1.5*Math.PI,Math.PI,true);sh.closePath();const g=new T.ExtrudeGeometry(sh,{depth:350,bevelEnabled:false,curveSegments:24});if(right)g.scale(-1,1,1);const x=right?div:a+20;g.translate(x,y,Z[0]);add('GOZ_'+id+'_R20_'+right,g,'raf','shelf',[x-20,x+20,y,y+21.5,...Z],{floorCove:true});}
  bays.push({id,column:c,row:r,min:[a,y,Z[0]],max:[b,top,Z[1]],clear:[485,300,350],product_min:[a+20,y,Z[0]],product_max:[b-20,top,Z[1]],lane_mm:135,carton_lane_mm:348.5});
 }
 const upperFloor=C.upper_storage_floor_mm??1550;box('UST_DEPO_DUZ_TABAN',[21.5,W-21.5,upperFloor-3,upperFloor,Z[0],Z[1]]);box('EKRAN_KATI_DUZ_TABAN',[21.5,W-21.5,1818,1821,Z[0],Z[1]]);
 for(const [name,b]of [['SOL',[0,1.5,0,H,0,D]],['SAG',[W-1.5,W,0,H,0,D]],['UST',[1.5,W-1.5,H-1.5,H,0,D]]])box('DIS_'+name+'_SAC',b,'sac','skin');
 const openings=bays.map(b=>({id:'G'+String(b.id).padStart(2,'0'),kind:'eye',x0:b.min[0],x1:b.max[0],y0:b.min[1],y1:b.max[1]}));
 for(const[name,lo,hi,hinge]of [['ALT',126-drop,564-drop,'side'],['UST_IC',upperFloor,1798,'top'],['UST_TEKNIK',1822,2175,'top']])for(const[k,a,b]of [['SOL',21.5,1091.5],['SAG',1111.5,2181.5]])openings.push({id:name+'_'+k,kind:'service',hinge,x0:a,x1:b,y0:lo,y1:hi,hand:name==='ALT'?'SOL':k});
 const eyeHoles=openings.filter(q=>q.kind==='eye').map(q=>[q.x0,q.x1,q.y0,q.y1]);
 for(const side of ['ROBOT','MUSTERI']){const holes=side==='ROBOT'?openings.map(q=>[q.x0,q.x1,q.y0,q.y1]):[...eyeHoles,[20,1907,2068,2163]];const g=cutGeometry([1.5,W-1.5,base+2,H-1.5],holes,1.5);const fixedZ=side==='ROBOT'?2.5:D-4;g.translate(0,0,fixedZ);add('QR71_'+side+'_SABIT_ON_SAC',g,'sac',side==='ROBOT'?'backBlue':'orange',[1.5,W-1.5,base+2,H-1.5,fixedZ,fixedZ+1.5],{doorLand:true,sealSeat89:true});}
 const doors=kapaklar33(T,C,{root,groups,parts,box,add,cutGeometry,openings}),M={root,groups,parts,bays,doors,config:C};M.donanim=donanim34(T,M);M.mechanisms=mekanizma34(T,M,{cutGeometry});root.scale.setScalar(.001);root.updateMatrixWorld(true);
 return M;
}
