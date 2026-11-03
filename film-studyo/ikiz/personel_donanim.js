import {duvarBirlesikGeometri} from './dukkan_plan.js';
export const PERSONEL_DONANIM={cash:{model:'APG NANO',mm:[275,370,120],interface:'Key/manual; electronic opening requires a compatible POS/printer/controller, not wired to Ingenico charging port'},bin:{inner_mm:[180,180,160],volume_l:5.184,custom:true},stool:null,locker_bounds:[1.625,1.935,.650,2.100,1.678,1.843],feet:{count:4,height_mm:80,tube_diameter_mm:30,pad_diameter_mm:38},robot_plc_changed:false};
export function personelDonanimKur(T,root,box,cylinder,tube,MAT){
 const steel=MAT.paslanmaz,black=MAT.siyah;
 // Operator faces +x. Leave a separate rear-z electrical service corridor.
 const shell=[[2.740,3.145,.080,.082,2.380,2.750],[3.143,3.145,.082,.730,2.380,2.750],
  [2.740,3.143,.082,.730,2.380,2.3815],[2.740,3.143,.082,.730,2.7485,2.750],
  [2.740,3.143,.440,.4415,2.3815,2.7485],[2.740,3.143,.605,.6065,2.3815,2.7485]];
 // Four short adjustable feet support the complete cabinet and electrical bay.
 for(const x of [2.775,3.110])for(const z of [2.415,2.835]){
  const id=`${x}_${z}`;
  cylinder('KASA_AYAK_PABUC_'+id,x,.006,z,.019,.012,black);
  cylinder('KASA_AYAK_MIL_'+id,x,.022,z,.006,.020,steel);
  cylinder('KASA_AYAK_GOVDE_'+id,x,.052,z,.015,.056,steel);
  box('KASA_AYAK_BAGLANTI_'+id,[x-.025,x+.025,.077,.080,z-.025,z+.025],steel);
 }
 box('KASA_TEKNIK_BOLME_TABAN',[2.740,3.145,.080,.082,2.750,2.870],steel);
 box('KASA_TEKNIK_BOLME_YAN',[2.740,3.145,.082,.730,2.8685,2.870],steel);
 box('KASA_TEKNIK_BOLME_SERVIS_KAPAK',[2.736,2.739,.085,.730,2.7515,2.868],steel);
 box('KASA_TEKNIK_BOLME_ARKA',[3.143,3.145,.082,.730,2.750,2.8685],steel);
 const cabinet=new T.Mesh(duvarBirlesikGeometri(T,shell),steel);cabinet.name='PERSONEL_KASA_DOLABI';root.add(cabinet);
 box('APG_NANO_GOVDE',[2.760,3.130,.612,.732,2.410,2.685],black);
 for(const [name,y0,y1]of [['NAKIT',.610,.736],['SARF',.445,.600],['COP',.085,.435]]){
  box('KASA_CEKMECE_'+name,[2.736,2.739,y0,y1,2.384,2.746],steel);
  box('KASA_GOMME_KULP_'+name,[2.733,2.736,y1-.035,y1-.020,2.490,2.620],black);
 }
 cylinder('NAKIT_ANAHTAR_KILIDI',2.731,.665,2.700,.008,.004,black,'x');
 for(const z of [2.404,2.690])box('NAKIT_CEKMECE_RAY',[2.755,3.130,.620,.630,z,z+.008],steel);
 box('SARF_CEKMECE_TABAN',[2.760,3.130,.450,.4515,2.396,2.730],steel);
 for(const z of [2.40,2.50,2.60])box('YEDEK_FIS_RULOSU',[2.790,2.850,.452,.502,z,z+.055],new T.MeshStandardMaterial({color:0xf0eee7}));
 // Closed pull-out liner: 180 x 180 x 160 mm clear volume = 5.184 L.
 const bin=new T.Mesh(duvarBirlesikGeometri(T,[[2.795,2.978,.110,.273,2.460,2.643]],[[2.7965,2.9765,.113,.275,2.4615,2.6415]]),new T.MeshStandardMaterial({color:0xdee4e2}));bin.name='PERSONEL_COP_5L';root.add(bin);
 box('COP_KAPAK',[2.795,2.978,.274,.277,2.460,2.643],steel);
 // Personal belongings are shut away from clean food-contact spares.
 const locker=new T.Mesh(duvarBirlesikGeometri(T,[[1.800,1.965,.650,2.100,2.550,2.860]],[[1.802,1.963,.652,2.098,2.552,2.858]]),steel);locker.name='PERSONEL_ESYA_DOLABI';root.add(locker);
 box('PERSONEL_ESYA_KAPAK',[1.800,1.803,.654,2.096,2.554,2.856],steel);
 box('PERSONEL_ESYA_KOL',[1.794,1.800,1.30,1.42,2.590,2.610],black);
 for(const z of [2.620,2.780]){box('PERSONEL_ASKI_TABAN',[1.950,1.961,1.820,1.860,z-.015,z+.015],steel);tube('PERSONEL_ASKI',[[1.950,1.840,z],[1.900,1.840,z],[1.900,1.855,z]],.004,steel);}
 // Same Active5, bonded directly to the fixed front surface; no holder or exposed lead.
 box('MAKINE_TABLET_ACTIVE5',[.9431,1.1569,1.6366,1.7634,.0792,.0893],black);
 // Move the complete personal locker, hooks, door and handle as
 // one rigid assembly to the wall at the left of the personnel corner.
 const lockerMount=new T.Group();lockerMount.name='PERSONEL_ESYA_SOL_DUVAR';root.add(lockerMount);
 for(const o of [...root.children])if(o===locker||/^DUKKAN_SERVIS__PERSONEL_(ESYA_|ASKI)/.test(o.name))lockerMount.add(o);
 const placement=new T.Matrix4().makeTranslation(1.780,0,1.7605).multiply(new T.Matrix4().makeRotationY(Math.PI/2)).multiply(new T.Matrix4().makeTranslation(-1.8825,0,-2.705));lockerMount.applyMatrix4(placement);
 for(const y of [.800,1.950])box('PERSONEL_DOLAP_DUVAR_ASKISI',[1.650,1.910,y,y+.025,1.668,1.6795],steel);
 return PERSONEL_DONANIM;
}
