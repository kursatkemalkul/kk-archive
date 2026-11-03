// Animate the original CAD assembly. No substitute links, trough or brackets.
export const ZINCIR=Object.freeze({fixed:3.018,length:2.05+Math.PI*.150,radius:.150,y:.058,z:1.185,links:80,min:1.176,max:4.86});
export function zincirYolu(ray,n=ZINCIR.links){
 const k=ZINCIR,x=Math.max(k.min,Math.min(k.max,ray));
 const bend=(k.fixed+x+2.05)/2,a=bend-k.fixed,b=Math.PI*k.radius;
 const point=s=>s<a?[k.fixed+s,k.y,k.z,0]:s<a+b?
  [bend+k.radius*Math.sin((s-a)/k.radius),k.y+k.radius*(1-Math.cos((s-a)/k.radius)),k.z,(s-a)/k.radius]:
  [bend-(s-a-b),k.y+2*k.radius,k.z,Math.PI];
 return {at:t=>point(t*k.length),ray:x,begin:point(0),end:point(k.length),samples:Array.from({length:n},(_,i)=>point((i+.5)*k.length/n)),length:k.length};
}
export function robotKabloKur(T,kok,IKIZ){
 const carriage=kok.getObjectByName('UR10E_body_07');
 const links=Array.from({length:80},(_,i)=>kok.getObjectByName('ROBOT25_ZINCIR_LINK_'+i));
 if(!carriage||links.some(x=>!x)){IKIZ.eksikler?.push('Özgün robot zinciri CAD montajı eksik');return ()=>{};}
 // Restore the unmodified CAD parts hidden by the superseded prototype module.
 kok.traverse(o=>{if(/^ROBOT25_ZINCIR_|^ROBOT25_UR_HIGH_FLEX_ARABA$|^ROBOT25_ARABA_KABLO_DESTEK$|^ROBOT25_ARABA_P_KLIPS|^ROBOT25_OLUK_/.test(o.name)){o.visible=true;o.userData.assemblyOwner='ROB';}});
 const obsolete=kok.getObjectByName('DT_ROBOT_ENERJI_ZINCIRI');if(obsolete)obsolete.removeFromParent();
 const p=new T.Vector3(),world=new T.Vector3(),axis=new T.Vector3(0,0,1),q=new T.Quaternion(),rootQ=new T.Quaternion(),parentQ=new T.Quaternion();
 return ()=>{
  carriage.getWorldPosition(p);kok.worldToLocal(p);const path=zincirYolu(p.x);kok.getWorldQuaternion(rootQ);
  for(let i=0;i<links.length;i++){
   const o=links[i],s=path.samples[i];world.set(s[0],s[1],s[2]);kok.localToWorld(world);o.parent.worldToLocal(world);o.position.copy(world);
   o.parent.getWorldQuaternion(parentQ);q.setFromAxisAngle(axis,s[3]);o.quaternion.copy(parentQ.invert().multiply(rootQ).multiply(q));o.updateMatrix();
  }
  IKIZ.robotZincir={surum:'original-cad18',ray:path.ray,uzunluk_m:path.length,zincir_donus_mm:150,duzlem:'original-XY',sabit:path.begin.slice(0,3),hareketli:path.end.slice(0,3),baglanti_kaynagi:'original-CAD/carriage',replacement_geometry:false};
 };
}
