import {duvarBirlesikGeometri} from './dukkan_plan.js';
// QR-wide flush modular display: 8 x 2 real-size 256 x 128 x 23 mm P2 modules.
// Module dimensions: https://ledorient.com/indoor-led/p2-indoor-fullcolor-led-display-module-256128mm.html
// Fascia, 90 mm service cassette and mounting are our dimensioned design, not OEM CAD.
// e67: z = recessed screen plane (10 mm behind the facade); on = facade plane, glass front.
export const QR_EKRAN={x0:3.273,x1:5.36,y0:1.735,y1:2.035,z:2.095,on:2.105,cam:.006,
  aktif:[2.048,.256],piksel:[1024,128],modul_mm:[256,128,13],duzen:[8,2],derinlik:.090};
// Single locker-door numbering table (same as ortak/goz-etiket.js): PLC id (bottom-left = 1) -> label (top-left = 1).
if(typeof globalThis!=='undefined'&&!globalThis.AK_GOZ){const et=n=>{n=+n;if(!(n>=1&&n<=12))return n;return (2-Math.floor((n-1)/4))*4+(n-1)%4+1;};globalThis.AK_GOZ={etiket:et,plc:et,tablo:Array.from({length:12},(_,i)=>et(i+1))};}
