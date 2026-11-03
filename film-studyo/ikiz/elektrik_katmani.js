// A cross-station inspection layer, independent of assembly ownership. Never
// move a component out of its manufacturing station to create this view.
export function elektrikSinif(o){
 if(/^DT_QR_EKRAN_(CAM|READY_PANEL|P2_MODUL_|ARKA_KAPAK|KASA_|TEKNIK_MONTAJ_PLAKASI)/.test(o.name))return {part:'frame',source:o.name};
 if(o.userData?.electrical)return {part:o.userData.electricalPart||null,source:o.name};
 const names=[];for(let a=o;a;a=a.parent){names.push(a.userData?.assemblySourceName||a.name||'');if(a.userData?.assemblyOwner)break;}
 const n=names.find(n=>{
  if(/__MONTAJ_/.test(n))n=n.replace(/__MONTAJ_.*$/,'');
  if(/^ELK_/.test(n))return !/__hava(?:_|$)/i.test(n);
  if(/kablo|kablaj|ethernet|rj45|(?:^|_)PLC(?:_|$)|(?:^|_)UPS(?:_|$)/i.test(n))return true;
  if(/^(F_KABLO|F_OT40|F_RESET|K_ELEKTRIK|E_ELEKTRIK|TOPPING_PANO|EMNIYET|ACIL_|MAKINE_TABLET|IKIZ_EKRAN_DERINLIK|DT_ZINCIR|SIGORTA_PANOSU)/.test(n))return true;
  if(/^ROBOT25_/.test(n))return /(KABLO|KONTROL_KUTUSU|SURUCU|EKSEN_MOTOR|HIGH_FLEX|ZINCIR|DIN_|DUVAR_|SAG_DUVAR_|PANO_|SCHNEIDER|IC60N|PE_|TP_LINK|ER605|AG_|WAN_|BINA_|ANA_GIRIS|OLUK_|GOMULU_|ZEMIN_|CIKIS_SIFIR|KAPAK_DERZ|BESLEME|ETHERNET|_GIRIS|_CIKIS|_GUC)/.test(n);
  if(/^(TOPPING|A_|F_|K_|E_|B_|CEK_|TUTUCU|DT_ROBOT)/.test(n)&&/(motor|servo|sensor|kamera|camera|kablo|kablaj|elektrik|enkoder|encoder|soket|switch|salter|kilit|ups|pano|reset)/i.test(n))return true;
  if(/^(DT_QR|QR_|QR\d|IKIZ_QR)/.test(n)&&/(KABLO|KANAL|ELEKTRIK|PANO|PLC|KILIT|SENSOR|OKUYUCU|READER|SCAN|FM430|PIN|TUS|KEY|EKRAN|DISPLAY|KAMERA|LOCK|AZM|STORM|RJ45|ETHERNET|USB|POWER|PSU|SURUCU)/i.test(n))return true;
  if(/^DUKKAN_SERVIS__/.test(n))return /(KABLO|KANAL|PRIZ|BESLEME|USB|POS_|TABLET_|WAN|ETHERNET|ADAPTOR|GUC|PANJUR_MOTOR|PANJUR_KUMANDA|KIOSK_|SOKET|KLEMENS|INTERKOM|BUAT)/.test(n)&&!/(KABLO_GECISI|PIN_DELIGI)/.test(n);
  if(/^DUKKAN__/.test(n))return /(POS_TABLET|PRIZ|KABLO|ELEKTRIK|PANO)/.test(n);
  if(/^KIOSK_/.test(n))return /(EKRAN|POS_|FIS_|KABLO)/.test(n);
  if(/^YIKAMA|^DUKKAN__YIKAMA/.test(n))return /(KABLO|PRIZ|ELEKTRIK|PANO|SENSOR|MOTOR)/.test(n);
  return false;
 });
 if(!n)return null;
 const part=/(PANO|KONTROL|SURUCU|SIGORTA)/i.test(n)&&/(KAPAK|__kapak(?:$|__)|ON_KAPAK)/i.test(n)?'cover':/(PANO.*(__pano|__paslanmaz|__sac)$|KONTROL_KUTUSU$|SURUCU_KUTUSU$|PANO_(ARKA|SAG|SOL|UST|ALT|GOVDE)|SIGORTA_PANOSU)/i.test(n)?'frame':null;
 return {part,source:n};
}
