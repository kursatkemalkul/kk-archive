// Custom kiosk hardware, dimensions in metres. Representative geometry, not OEM CAD.
// Visual hardware only: payment authorization remains the payment provider's responsibility.
export function kioskDonanimKur(T,g,root,MAT,D){
 const metal=new T.MeshStandardMaterial({color:0xb8bec4,metalness:.78,roughness:.32});
 const dark=new T.MeshStandardMaterial({color:0x111820,roughness:.36});
 const glass=new T.MeshStandardMaterial({color:0x183c48,metalness:.25,roughness:.17,emissive:0x071316});
 const paper=new T.MeshStandardMaterial({color:0xf2f0e8,roughness:.9});
 const green=new T.MeshStandardMaterial({color:0x41bd88,emissive:0x092b1c});
 const x=D.KIOSK[0],z=(D.KIOSK[2]+D.KIOSK[3])/2,y=D.KIOSK[4];
 function box(n,b,m=metal){const o=new T.Mesh(new T.BoxGeometry(b[1]-b[0],b[3]-b[2],b[5]-b[4]),m);o.name='DUKKAN_SERVIS__'+n;o.position.set((b[0]+b[1])/2,(b[2]+b[3])/2,(b[4]+b[5])/2);root.add(o);return o;}
 function face(n,cy,cz,w,h,m=dark,depth=.008){return box('KIOSK_'+n,[x-.003-depth,x-.003,cy-h/2,cy+h/2,cz-w/2,cz+w/2],m);}
 function wire(n,pts){const vs=pts.map(p=>new T.Vector3(...p));const path=new T.CurvePath();for(let i=1;i<vs.length;i++)path.add(new T.LineCurve3(vs[i-1],vs[i]));const o=new T.Mesh(new T.TubeGeometry(path,32,.0018,8,false),dark);o.name='DUKKAN_SERVIS__KIOSK_'+n+'_KABLO';root.add(o);return {name:n,points:pts};}
 for(const n of ['KIOSK_GOVDE','KIOSK_POS_YUVA','KIOSK_FIS_AGZI','KIOSK_GOMME_ALT_YUZ','KIOSK_GOMME_POS','KIOSK_GOMME_FIS']){const o=g.getObjectByName('DUKKAN__'+n);if(o){o.parent.remove(o);o.geometry?.dispose();}}
 // Flush faceplate and enclosed rear case; all hardware is below the order screen.
 box('KIOSK_ALT_PANEL',[x-.002,x+.002,y,y+.294,z-.224,z+.224]);
 box('KIOSK_ALT_ARKA_GOVDE',[x+.025,x+.060,y+.005,y+.290,z-.220,z+.220],dark);
 face('ODEME_TERMINALI',y+.160,z+.115,.094,.196,dark,.014);
 face('ODEME_EKRANI',y+.209,z+.115,.072,.066,glass,.015);
 for(let r=0;r<4;r++)for(let c=0;c<3;c++)face('PIN_TUS_'+r+'_'+c,y+.157-r*.019,z+.091+c*.024,.019,.014,r===3&&c===2?green:metal,.017);
 if(typeof document!=='undefined')for(let r=0;r<4;r++)for(let c=0;c<3;c++){
  const canvas=document.createElement('canvas');canvas.width=64;canvas.height=48;const ctx=canvas.getContext('2d');ctx.fillStyle='#111820';ctx.font='bold 34px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText([['1','2','3'],['4','5','6'],['7','8','9'],['×','0','✓']][r][c],32,25);
  const tex=new T.CanvasTexture(canvas);tex.colorSpace=T.SRGBColorSpace;const o=new T.Mesh(new T.PlaneGeometry(.016,.012),new T.MeshBasicMaterial({map:tex,transparent:true,depthWrite:false}));o.rotation.y=-Math.PI/2;o.position.set(x-.0282,y+.157-r*.019,z+.091+c*.024);o.name='DUKKAN_SERVIS__KIOSK_PIN_RAKAM_'+r+'_'+c;root.add(o);
 }
 face('KART_CIP_GIRISI',y+.051,z+.115,.058,.005,dark,.018);
 // NFC icon lies on the payment screen surface, not in world-space UI.
 for(let i=0;i<3;i++){const pts=[];for(let j=0;j<=18;j++){const a=-.9+j/18*1.8;pts.push(new T.Vector3(x-.0192,y+.210+Math.sin(a)*(.010+i*.005),z+.102+Math.cos(a)*(.010+i*.005)));}const o=new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(pts),18,.00065,5,false),paper);o.name='DUKKAN_SERVIS__KIOSK_NFC_'+i;root.add(o);}
 face('QR_OKUYUCU_CERCEVE',y+.190,z-.030,.072,.072,dark,.010);
 face('QR_OKUYUCU_CAM',y+.190,z-.030,.055,.052,glass,.011);
 const lens=new T.Mesh(new T.CylinderGeometry(.008,.008,.002,24),dark);lens.rotation.z=Math.PI/2;lens.position.set(x-.016,y+.190,z-.030);lens.name='DUKKAN_SERVIS__KIOSK_QR_OPTIK';root.add(lens);
 face('QR_OKUYUCU_ISIK',y+.164,z-.030,.040,.002,green,.012);
 face('FIS_CERCEVE',y+.190,z-.145,.105,.038,dark,.007);
 face('FIS_CIKIS_AGZI',y+.193,z-.145,.083,.006,dark,.009);
 box('KIOSK_FIS_KAGIDI',[x-.018,x-.015,y+.153,y+.193,z-.184,z-.106],paper);
 for(let i=0;i<5;i++)box('KIOSK_FIS_BASKI_'+i,[x-.0183,x-.0181,y+.163+i*.004,y+.164+i*.004,z-.177,z-.119],dark);
 const routes=[]; // Purchased kiosk: no internal wiring or electronics modeled.
 // Staff terminal chip slot and a receipt emerging directly from its printer mouth.
 box('POS_KART_CIP_GIRISI',[2.774,2.776,.782,.787,2.434,2.486],dark);
 box('POS_FIS_KAGIDI',[2.895,2.914,.8272,.8275,2.431,2.489],paper);
 for(let i=0;i<4;i++)box('POS_FIS_BASKI_'+i,[2.899+i*.003,2.900+i*.003,.8276,.8278,2.438,2.480],dark);
 return {custom_model:true,downloaded_oem:false,interfaces:['EMV card slot','NFC','QR optical reader','receipt outlet'],routes};
}
