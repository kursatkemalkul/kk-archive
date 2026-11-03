// D2 (YONETICI 22 Eki, Kemal: "kioskta solunda saginda beyaz gozukuyor ... arada cok bosluk olmamali").
// Cephe/ayirici acikligi 450 mm (z), Samsung QM32C govdesi 421,9 mm (foy) -> iki yanda 14,05 mm, ekran alti ile odeme paneli arasinda 6 mm acik kaliyordu;
// arkadan duvarin acik renkli aciklik yuzu gorunuyordu. Gomme kiosk cercevesi: siyah eloksal aluminyum trim, ekran on yuzu duzleminde, acikliga sifir bosluk.
// Ekran, VESA, odeme paneli ve duvar olcusu degismez.
export function dukkanKioskD2(T,g,liste,MAT,IKIZ={}){
 const scr=g.getObjectByName('DUKKAN__KIOSK_GOMME_QM32C'),back=g.getObjectByName('DUKKAN__KIOSK_GOMME_IC_KASA');
 if(!scr||!back)return null;
 g.updateMatrixWorld(true);
 const sb=new T.Box3().setFromObject(scr),ob=new T.Box3().setFromObject(back);
 const pnl=g.getObjectByName('DUKKAN_SERVIS__KIOSK_ALT_PANEL');
 const root=new T.Group();root.name='DUKKAN__D2_KIOSK_CERCEVE';g.add(root);
 const trim=new T.MeshStandardMaterial({color:0x16181b,metalness:.45,roughness:.42});trim.userData.storefront60Finish=true;trim.userData.preserveReviewMaterial=true;
 const inv=g.matrixWorld.clone().invert(),added=[];
 function box(n,a){const geo=new T.BoxGeometry(a[3]-a[0],a[4]-a[1],a[5]-a[2]);geo.translate((a[0]+a[3])/2,(a[1]+a[4])/2,(a[2]+a[5])/2);geo.applyMatrix4(inv);const o=new T.Mesh(geo,trim);o.name='DUKKAN__D2_KIOSK_'+n;o.userData={d2:true,partLabel:'Gömme kiosk çerçevesi · siyah eloksal alüminyum 2 mm büküm · ekran düzlemi',productionRelease:false};root.add(o);added.push(o);return o;}
 const x0=sb.min.x,x1=sb.max.x,z0=ob.min.z,z1=ob.max.z,y1=sb.max.y,ys=sb.min.y;
 const yb=pnl?new T.Box3().setFromObject(pnl).max.y:ys;
 box('SOL',[x0,yb,z0,x1,y1,sb.min.z]);
 box('SAG',[x0,yb,sb.max.z,x1,y1,z1]);
 if(ys-yb>1e-4)box('ALT',[x0,yb,sb.min.z,x1,ys,sb.max.z]);
 if(pnl){const pb=new T.Box3().setFromObject(pnl);if(pb.min.z-z0>1e-4)box('SOL_ALT',[x0,ob.min.y,z0,x1,yb,pb.min.z]);if(z1-pb.max.z>1e-4)box('SAG_ALT',[x0,ob.min.y,pb.max.z,x1,yb,z1]);}
 const metadata={revision:'D2',opening_mm:Math.round((z1-z0)*1e4)/10,screen_mm:Math.round((sb.max.z-sb.min.z)*1e4)/10,sideGap_mm:Math.round((sb.min.z-z0)*1e4)/10,bottomGap_mm:Math.round((ys-yb)*1e4)/10,trims:added.length};
 document.documentElement.dataset.d2kiosk=JSON.stringify(metadata);
 IKIZ.d2Kiosk={root,added,metadata};return IKIZ.d2Kiosk;
}
