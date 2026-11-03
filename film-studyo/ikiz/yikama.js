// Server-owned manual appliance positions; ST checks measured close feedback.
export function yikamaKur(T,kok,IKIZ={},parts){
 const {hinge,tray}=parts;let opening=0,extension=0;
 function pose(a,b){opening=Math.max(0,Math.min(1,a));extension=Math.max(0,Math.min(1,b));hinge.rotation.x=opening?-opening*Math.PI/2:0;tray.position.z=extension?-.600*extension:0;kok.updateMatrixWorld(true);}
 function update(){const w=IKIZ.son?.wash60,p=w?.konum;if(p)pose(p.makine,p.sepet);return{izin:!!w?.servis_izin,kapak:opening,sepet:extension,plc_geri_bildirim:!!p};}
 pose(0,0);return{pose,update,hinge,tray,model:'MEIKO M-iClean UL',sepet_mm:[500,600],giris_mm:435};
}
