export const ekranPasif=id=>id==='tv';
export function odakOlcusu(e){
 if(e.id==='qrpin')return {width:.145,height:.347,center:[5.2925,1.315,2.105],physical:true};
 return {width:e.genislik,height:e.genislik*e.boy/e.en,center:e.konum,physical:false};
}
export function odakMesafesi(e,camera,width,height){
 const s=odakOlcusu(e),tan=Math.tan(camera.fov*Math.PI/360),aspect=width/Math.max(1,height);
 return Math.max(.09,s.height/(2*tan*.76),s.width/(2*tan*aspect*.82));
}
// Exact pointer ray against the physical active screen rectangle, never a view cone.
export function ekranIsabet(T,ray,e){
 const plane=new T.Plane().setFromNormalAndCoplanarPoint(e.normal,e.o.position),p=new T.Vector3();
 if(ray.direction.dot(e.normal)>=0||!ray.intersectPlane(plane,p))return null;
 const delta=p.clone().sub(e.o.position),w=e.genislik/2,h=e.genislik*e.boy/e.en/2;
 return Math.abs(delta.dot(e.o.sag))<=w&&Math.abs(delta.dot(e.o.ust))<=h?p:null;
}
