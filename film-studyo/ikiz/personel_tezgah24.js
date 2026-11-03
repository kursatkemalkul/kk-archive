// Compatibility hook for the late 24 October setup pass.
// The personnel counter is built once by dukkanPersonel71 during shop setup.
// Never replace it with the superseded wide 24 October cabinet afterwards.
import {TEZGAH71} from './dukkan_personel71.js?v=87d58c0cefd3';
export const TEZGAH24={x0:TEZGAH71.on_x,gx0:TEZGAH71.govde.on_x,
 z0:TEZGAH71.z0,z1:TEZGAH71.z1,gz0:TEZGAH71.govde.z0,gz1:TEZGAH71.govde.z1,
 ust:TEZGAH71.ust_y,taban:TEZGAH71.govde.taban_y,sac:TEZGAH71.govde.sac,tabla:TEZGAH71.sac};
export function personelTezgah24(T,IKIZ,scene){
 const current=IKIZ.personelTezgah71;
 if(!current?.root?.parent)return null;
 const superseded=scene.getObjectByName('PERSONEL_TEZGAH24');
 if(superseded&&superseded!==current.root){superseded.removeFromParent();superseded.traverse(o=>o.geometry?.dispose());}
 // Preserve the existing interaction API for callers using the old name.
 IKIZ.personelTezgah24=current;
 current.root.userData.counterSource='dukkan_personel71 / production-detail30';
 current.root.userData.legacyOverrideRemoved=true;
 const info={...current.bilgi,latePass:'preserve-current-counter',legacyOverrideRemoved:true};
 document.documentElement.dataset.personelTezgah24='current-counter-preserved';
 return info;
}
