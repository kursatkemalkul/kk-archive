// Isolated QR equipment layout. Source dimensions, schematic housings; no PLC commands.
export function donanim34(T,M){
 const g=new T.Group();g.name='QR_R4_DONANIM';M.root.add(g);M.groups.donanim=g;const steel=new T.MeshStandardMaterial({color:0xb7bec4,metalness:.65,roughness:.4}),black=new T.MeshStandardMaterial({color:0x171a1e,roughness:.5});
 const box=(name,b,mat=steel,parent=g)=>{const o=new T.Mesh(new T.BoxGeometry(b[1]-b[0],b[3]-b[2],b[5]-b[4]).translate((b[0]+b[1])/2,(b[2]+b[3])/2,(b[4]+b[5])/2),mat);o.name=name;parent.add(o);return o;};
 // Source sizes: qr_donanim.js UR cabinet, qr_on77.js UPS. No duplicate PC.
 const drop=M.config.removed_pedestal_mm||0,devices=[['UR_KONTROL_KUTUSU',[30,505,126,549,40,308]],['UPS',[525,964,126,345,90,261]],['RAY_SURUCU_PANOSU',[1100,1380,126,526,60,230]]].map(([name,b])=>[name,b.map((v,i)=>i===2||i===3?v-drop:v)]);
 function label(name,text,w,h,x,y,z,back=false){const c=document.createElement('canvas');c.width=512;c.height=256;const q=c.getContext('2d');q.fillStyle='#171b22';q.fillRect(0,0,512,256);q.fillStyle='#f1f4f6';q.font='bold 32px sans-serif';q.textAlign='center';const lines=text.split('|');lines.forEach((s,i)=>q.fillText(s,256,95+i*46));const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;const o=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({map:t}));o.name=name;o.position.set(x,y,z);if(back)o.rotation.y=Math.PI;g.add(o);return o;}
 for(const[n,b]of devices){const o=box(n,b);o.userData={source:n==='UR_KONTROL_KUTUSU'?'qr_donanim.js':n==='UPS'?'qr_on77.js':'qr_on77.js ray enclosure; 280mm width, 169mm device depth; schematic cabinet',manufacturerCAD:false};box(n+'_ON_KAPAK',[b[0]+4,b[1]-4,b[2]+4,b[3]-4,b[4]-2,b[4]],black);for(const x of[b[0]+20,b[1]-20])box(n+'_MONTAJ_AYAGI_'+x,[x,x+8,114-drop,126-drop,b[4]+20,b[5]-20]);}
 for(const[n,b]of devices)label(n+'_ETIKET',n.replaceAll('_',' ')+'|'+(b[1]-b[0])+' × '+(b[3]-b[2])+' × '+(b[5]-b[4])+' mm',Math.min(310,b[1]-b[0]-20),90,(b[0]+b[1])/2,(b[2]+b[3])/2,b[4]-2.1,true);
 const [x0,y0,x1,y1]=M.config.display_window_mm;box('QR_UZUN_EKRAN_KASETI',[x0,x1+4,y0-4,y1+4,284,354],black);
 // Static capture of our real menu UI for the isolated film; no live API traffic.
 const tex=new T.TextureLoader().load(new URL('../shop-assets30/qr-menu-film.png',import.meta.url).href);tex.colorSpace=T.SRGBColorSpace;const panel=new T.Mesh(new T.PlaneGeometry(x1-x0,y1-y0),new T.MeshBasicMaterial({map:tex}));panel.name='QR_UZUN_EKRAN_2048x256';panel.position.set((x0+x1)/2,(y0+y1)/2,357.9);g.add(panel);
 for(const x of[50,920,1120,1920])box('EKRAN_RAFA_MONTAJ_'+x,[x,x+12,1821,y0-4,300,312]);
 for(const o of g.children)o.position.z+=M.config.outer_mm[2]-358;
 return {group:g,devices};
}
