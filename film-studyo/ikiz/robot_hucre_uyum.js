// Retire the prototype floor leads ending at the robot's OLD fixed position.
// Their replacement is the constant-length robot_kablo.js energy chain plus
// kablolama.js UR-HIGHFLEX-FIXED, W122-FIXED-END and the external supply routes.
// No live electrical connection, PLC IO or other worker's source is edited.
export function robotHucreUyumKur(scene,IKIZ){
 const retired=[];
 for(const name of ['ELK_ZEMIN__kablo_veri','ELK_ZEMIN__kablo_guc']){
  scene.traverse(o=>{if(o.name===name){o.visible=false;o.userData.electricalRetired=true;o.userData.replacedBy='DT_ROBOT_ENERJI_ZINCIRI / ELK_BAGLANTI_AGI';retired.push(name);}});
 }
 IKIZ.robotEskiSabitKablo=retired;
}
