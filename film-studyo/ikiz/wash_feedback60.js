// Siemens catalog envelope, not OEM CAD. Monitoring only: no PL/SIL claim.
// MEIKO attachment and wet-zone use require the appliance supplier's approval.
export function washFeedback60(T,F,root,chemLeaf){
 const plastic=new T.MeshStandardMaterial({color:0x27343b,roughness:.6}),grey=new T.MeshStandardMaterial({color:0x626e73}),records=[];
 function block(name,b,parent=root,mat=plastic){const o=F.plate(name,b,parent,mat);o.userData={...o.userData,wash60:true,type:'catalog position sensor envelope',manufacturer:'Siemens',envelopeOnly:true,fieldAccepted:false,safetyCertifiedAssembly:false};return o;}
 function pair(id,fixed,moving,parent){const a=block('SIEMENS_3SE6605_2BA_'+id,fixed),b=block('SIEMENS_3SE6701_2BA_'+id,moving,parent,grey);records.push({id,sensor:a,magnet:b,signalPrefix:'DI_WASH_'+id,NO_NC:true,fieldAcceptance:false,source:'https://mall.industry.siemens.com/mall/om/EN/Catalog/Product/?mlfb=3SE6605-2BA'});return[a,b];}
 // Chemical leaf: fixed body on a welded divider return, magnet on leaf pad.
 pair('KIMYASAL',[2.690,2.778,.550,.575,1.5345,1.5475],[.037,.125,.550,.575,.0115,.0245],chemLeaf);
 F.plate('WASH_SENSOR_KIMYASAL_SASI_KULAK',[2.679,2.780,.548,.577,1.5475,1.549]);
 F.plate('WASH_MAGNET_KIMYASAL_KAPAK_PAD',[.037,.125,.550,.575,.0015,.0115],chemLeaf);
 // Appliance door: station frame supports sensor; casing is not drilled.
 pair('MAKINE',[2.100,2.188,.759,.784,1.489,1.502],[.0535,.1415,.448,.473,-.013,0],F.hinge);
 F.plate('WASH_SENSOR_MAKINE_DIK_BAG',[2.098,2.190,.784,.8635,1.489,1.4905]);
 F.plate('WASH_SENSOR_MAKINE_UST_DONUS',[2.098,2.190,.8635,.865,1.489,1.5125]);
 // Rack proof is a process signal. Tangential clip meets the actual upper rack
 // wire (Y393..397mm); the old Y450..465mm tab floated53mm above that wire.
 pair('SEPET',[2.052,2.065,.317,.405,1.540,1.565],[.0235,.0365,.317,.405,.035,.060],F.tray);
 F.plate('WASH_SENSOR_SEPET_SASI_KULAK',[2.039,2.052,.392,.407,1.5275,1.565]);
 const rackClip=F.plate('WASH_MAGNET_SEPET_TUTUCU',[.0365,.050,.392,.407,.035,.037],F.tray);
 rackClip.userData={...rackClip.userData,wash64:true,attachment:'tangential seat on existing upper rack wire X50..53/Y393..397mm; supplier-approved fastening required',movingWithRack:true};
 F.feedback60={sensors:records,requiresSupplierApplianceAttachmentApproval:true,hardwareAcceptance:false};return F.feedback60;
}
