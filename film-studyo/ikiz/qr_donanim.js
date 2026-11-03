import {kur71} from './qr80/model71.js?v=153f342fa927';
import {QR_EKRAN} from './qr_ekran.js';
const C=await(await fetch(new URL('./qr80/config71.json',import.meta.url))).json();
Object.assign(QR_EKRAN,{x0:3.293,x1:5.341,y0:1.907,y1:2.163,z:2.105,on:2.105,aktif:[2.048,.256]});
export function qrDerinlikKur(T,kok){return new Set();}
export function qrKapakEsle(E){E.qr={};E.qr_robot_kapak={};E.qr_perde={};}
export function qrDonanimKur(T,kok,E,I){
 if(I.qrYeni80)return I.qrYeni80.apply;
 const M=kur71(structuredClone(C));M.root.name='QR_YENI80';M.root.position.fromArray(C.origin_m);kok.add(M.root);
 M.root.traverse(o=>{o.userData={...o.userData,assemblyOwner:'QR',ist:'QR',katman:o.userData.group==='ana'?'sasi':o.userData.group==='sac'?'sac':o.userData.door33||o.userData.case34?'kapak':'ic'};});
 // The existing live CSS screen owns the display; remove the draft placeholder.
 const screen=M.root.getObjectByName('QR_UZUN_EKRAN_2048x256');if(screen){screen.removeFromParent();screen.geometry.dispose();screen.material.map?.dispose();screen.material.dispose();}
 for(const r of M.doors.records){if(r.kind==='eye'){const id=+r.id.slice(1,3);r.leaf.traverse(o=>{if(o.isMesh)o.userData.twinAction={kind:'qr',id,side:r.side,label:'QR '+id+' '+r.side};});}else{r.elle=0;r.target=0;r.leaf.traverse(o=>{if(o.isMesh)o.userData.twinAction={kind:'elle',label:'QR '+r.id+' · aç/kapat',toggle:()=>r.elle=r.elle>.5?0:1};});}}
 const clamp=v=>Math.max(0,Math.min(1,Number(v)||0));
 const apply=f=>{for(const r of M.doors.records){if(r.kind==='eye'){const n=+r.id.slice(1,3),s=f.qr?.[n]||{};const v=clamp(r.side==='ROBOT'?s.kapak:(s.musteri_kapak??1-Number(s.kapi??1)));if(v!==r.v)r.pose(v);}else r.target=r.elle;}};
 I.kancalar?.push(dt=>{for(const r of M.doors.records.filter(r=>r.kind==='service')){const step=Math.min(.05,Math.max(0,dt||0))/1.4;if(r.v!==r.target)r.pose(r.v+Math.sign(r.target-r.v)*Math.min(step,Math.abs(r.target-r.v)));}});
 I.qrDonanim={source:'QR_YENI80',kapak_sayisi:24,net_goz_mm:C.product_clear_mm,PLCChanged:true,geometryChanged:true,physicalPIN:false};
 I.qrYeni80={...M,apply,origin_m:C.origin_m};I.qrYeni42=I.qrYeni80;return apply;
}

// Production QR84 shares the exact calibration delta with the robot adapter.
const {yerlesim84}=await import('./yerlesim84.js?v=84-1');
const install84=()=>{const I=window.IKIZ;if(I?.sahne)yerlesim84(I.sahne.THREE,I);else setTimeout(install84,50);};install84();

// Dükkân yapısı 31: yerleşim 84 kurulduktan sonra duvar / cephe / bar / saçak plandan temiz yeniden kurulur.
const {dukkanYapi31}=await import('./dukkan_yapi31.js?v=31-2');
const install31=()=>{const I=window.IKIZ;if(I?.yerlesim84?.ready&&I.dukkanTemiz29)dukkanYapi31(I.sahne.THREE,I);else setTimeout(install31,100);};install31();
