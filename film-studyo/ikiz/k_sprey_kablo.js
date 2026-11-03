// K 122 araştırma güzergâhı: PUR Ø4,6 / R23 sabit / R290 hareketli.
// Soket zarfı projedir; üreticinin gerçek STEP'i ve terminal detayı kabul bekler.
export function kSpreyKabloYolu(T,sx=0,sabit=false){
  const v=p=>new T.Vector3(...p.map(x=>x/1000)), segments=[];
  const line=(a,b)=>{const aa=v(a),bb=v(b);segments.push({L:aa.distanceTo(bb),point:p=>aa.clone().lerp(bb,p)});};
  const arc=(a,b,c)=>{
    a=v(a);b=v(b);c=v(c);const ab=b.clone().sub(a),ac=c.clone().sub(a);
    const u=ab.clone().normalize(),n=ab.clone().cross(ac).normalize(),w=n.clone().cross(u);
    const x=ab.length()/2,cx=ac.dot(u),cy=ac.dot(w),y=(ac.lengthSq()-2*x*cx)/(2*cy);
    const center=a.clone().addScaledVector(u,x).addScaledVector(w,y),R=a.distanceTo(center);
    const ex=a.clone().sub(center).normalize(),ey=n.clone().cross(ex);
    let angle=Math.atan2(c.clone().sub(center).dot(ey),c.clone().sub(center).dot(ex));if(angle<=0)angle+=2*Math.PI;
    segments.push({L:R*angle,point:p=>center.clone().addScaledVector(ex,R*Math.cos(angle*p)).addScaledVector(ey,R*Math.sin(angle*p))});
  };
  if(!sabit){
    const y=1234.7-sx,ym=y+23,yc=(ym+1250)/2+90,k=23/Math.sqrt(2);
    line([4179.8,y,-194.9],[4103,y,-194.9]);
    arc([4103,y,-194.9],[4103-k,y,-171.9-k],[4080,y,-171.9]);
    line([4080,y,-171.9],[4080,y,-43]);
    arc([4080,y,-43],[4080,ym-k,-43+k],[4080,ym,-20]);
    line([4080,ym,-20],[4080,yc,-20]);
    arc([4080,yc,-20],[4080,yc+290,-310],[4080,yc,-600]);
    line([4080,yc,-600],[4080,1250,-600]);
  }else{
    const k=23/Math.sqrt(2);
    arc([4080,1250,-600],[4080,1227,-623],[4080,1250,-646]);
    line([4080,1250,-646],[4080,1390,-646]);
    arc([4080,1390,-646],[4103-k,1390+k,-646],[4103,1413,-646]);
    line([4103,1413,-646],[4167,1413,-646]);
    arc([4167,1413,-646],[4167+k,1436-k,-646],[4190,1436,-646]);
    line([4190,1436,-646],[4190,1760,-646]);
    arc([4190,1760,-646],[4213-k,1760+k,-646],[4213,1783,-646]);
    line([4213,1783,-646],[4224,1783,-646]);
    arc([4224,1783,-646],[4224+k,1783,-669+k],[4247,1783,-669]);
    line([4247,1783,-669],[4247,1783,-711.5]);
  }
  const total=segments.reduce((s,p)=>s+p.L,0);
  class Yol extends T.Curve{
    getPoint(t,target=new T.Vector3()){let l=Math.max(0,Math.min(1,t))*total;
      for(const p of segments){if(l<=p.L+1e-12)return target.copy(p.point(Math.min(1,l/p.L)));l-=p.L;}
      return target.copy(segments.at(-1).point(1));
    }
    getLength(){return total;}
  }
  return new Yol();
}
export function kSpreyKabloKur(T,kok){
  // Kemal 31 Eki ("eski modelleri komple sil"): yeni makine var — eski makinenin bu parçaları artık ÜRETİLMEZ (önceden üretilip yeni_makine.js sil() ile siliniyordu).
  return ()=>{};
  if(!kok.getObjectByName('K_MERKEZ120__siyah_0__KESICI'))return ()=>{};
  const mat=new T.MeshStandardMaterial({color:0x263746,roughness:.65});
  const moving=new T.Mesh(new T.TubeGeometry(kSpreyKabloYolu(T),384,.0023,8,false),mat);
  moving.name='K_NOZUL_KABLO__HAREKETLI';kok.add(moving);
  const fixed=new T.Mesh(new T.TubeGeometry(kSpreyKabloYolu(T,0,true),384,.0023,8,false),mat);
  fixed.name='K_NOZUL_KABLO__SABIT';kok.add(fixed);
  const connector=new T.Mesh(new T.BoxGeometry(.026,.0182,.010),mat);
  connector.name='K_NOZUL_KABLO__M8_PROJE_ZARFI';connector.position.set(4.1869,1.2256,-.1949);
  connector.userData.uretimKabul=false;kok.add(connector);
  let last=null;
  return sx=>{sx=Math.max(0,Math.min(125,+sx||0));if(sx===last)return;
    moving.geometry.dispose();moving.geometry=new T.TubeGeometry(kSpreyKabloYolu(T,sx),384,.0023,8,false);
    connector.position.y=1.2256-sx/1000;last=sx;
  };
}
