/* Render-only projection of an immutable PLC/plant snapshot. No control logic,
 * timing integration, order processing, IO writes or pretend servo devices.
 * The old render modules consume motion names; every alias below is explicitly
 * sourced from this SAME frame's plant position / encoder-derived reading.
 */
export function gorselKare27(f){
 if(!f||f.gorsel_baglama27)return f;
 const si=f.silindirler||{},ax={...(f.eksenler||{})},derived={},motion={};
 const position=v=>v!=null&&typeof v==='object'?(v.konum??v.deger):v;
 const put=(name,value,source)=>{if(value==null||!Number.isFinite(+value))return;ax[name]=+value;derived[name]=source;};
 for(const [id,c]of Object.entries(f.cekmeceler||{})){
  // Closed-loop DC control only knows end sensors/estimated clearance; the
  // virtual plant publishes actual drawer position for drawing, not PLC feedback.
  if(!Object.hasOwn(ax,'AX_B_'+id))put('AX_B_'+id,c.konum,'virtual_plant.cekmeceler.'+id+'.konum');
 }
 for(const k of ['BESLEYICI','KOPRU','KOSE_SOL_ARKA','KOSE_SOL_ON','KOSE_SAG_ARKA','KOSE_SAG_ON'])
  if(!Object.hasOwn(ax,'AX_E_'+k))put('AX_E_'+k,si['SX_E_'+k],'virtual_plant.silindirler.SX_E_'+k);
 for(const k of ['KASAR','SUCUK'])
  if(!Object.hasOwn(ax,'AX_TOP_'+k+'_KAR'))put('AX_TOP_'+k+'_KAR',si['M_TOP_'+k+'_KAR'],'virtual_plant.motor_angle.M_TOP_'+k+'_KAR');
 for(const k of ['HARC','SOS','KIYMA','KUSBASI','KIYMA_ORTA']){
  const x=position(ax['AX_TOP_DOZ_'+k]??si['AX_TOP_DOZ_'+k]??f.analog?.['AI_TOP_UNO_'+k+'_STROK']);
  if(x!=null&&Number.isFinite(+x))motion['DO_TOP_VALF_'+k+'_PISTON']=+x; // mm, not BOOL
  const valve=position(ax['AX_TOP_GIRIS_'+k]);
  if(valve!=null&&Number.isFinite(+valve))motion['DO_TOP_VALF_'+k+'_VALF']=+valve; // same-frame actual degrees, never the opening request
 }
 const scraper=position(ax.AX_TOP_SILECEK);
 const cam=position(si.SX_TOP_SILECEK_KAM_DERECE);
 if(Object.hasOwn(si,'SX_TOP_SILECEK_KAM_DERECE')){
  for(const [name,key]of [['AX_TOP_SILECEK_KAM','SX_TOP_SILECEK_KAM_DERECE'],['AX_TOP_SILECEK_YOKE','SX_TOP_SILECEK_YOKE_MM'],['AX_TOP_SILECEK_YAY','SX_TOP_SILECEK_YAY_MM'],['DO_TOP_SILECEK','SX_TOP_SILECEK_TASIYICI_MM']]){
   const v=position(si[key]);if(v!=null&&Number.isFinite(+v))motion[name]=+v;
  }
 }else if(scraper!=null&&Number.isFinite(+scraper))motion.DO_TOP_SILECEK=+scraper; // older recorded linear schema, same-frame only
 return {...f,eksenler:ax,kontrol_eksenleri:f.eksenler,gorsel_baglama27:derived,hareket_degerleri27:motion};
}

// Contact display follows current NC position and the same PLC phase.
export function kIticiTemas28(f){
 const v=f?.eksenler?.AX_K_ITICI_Z;
 const z=v!=null?(typeof v==='object'?v.konum:v):f?.silindirler?.SX_K_ITICI_Z;
 const phase=+f?.fb?.K?.adim;
 return Number.isFinite(+z)&&+z>=349.5&&(phase===46||(!Object.hasOwn(f?.eksenler||{},'AX_K_ITICI_Z')&&!!f?.cikislar?.DO_K_ITICI_X&&phase>=30));
}
