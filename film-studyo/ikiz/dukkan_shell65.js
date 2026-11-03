import {SHELL65} from './shell65-data.js?v=8f381c98f33e';
import {kemerD3} from './dukkan_kemer_d3.js';

// One closed Boolean boundary for the building and the orange facade. Material
// groups are finishes on this boundary, never a second wall through another.
export function dukkanShell65(T,g,facade,orange,IKIZ){
 const wall=g.getObjectByName('DUKKAN__TEK_PARCA_DUVAR');
 if(!wall)throw new Error('Storefront shell: main wall missing');
 // The room's rear datum belongs to the main layout. Extend the existing rear
 // spans if that datum changes, keeping the frontend independent of station
 // depth updates. All facade, door, glazing and kiosk coordinates stay fixed.
 wall.geometry.computeBoundingBox();
 let rearShift=wall.geometry.boundingBox.min.z-SHELL65.rearOutside_m;
 if(Math.abs(rearShift)<.000001)rearShift=0;
 const positions=SHELL65.positions.slice();
 // The baked union also owns the robot-room partition. Keep its rear skin
 // at the same 100 mm depth as the door casing, including junction vertices.
 const doorWallFront=1.500, oldDoorWallBack=1.668, doorWallBack=1.600;
 for(let i=0;i<positions.length;i+=3){
  const x=positions[i],z=positions[i+2];
  if(x>=.536-.00001&&x<=2.000+.00001&&z>=doorWallFront-.00001&&z<=oldDoorWallBack+.00001)
   positions[i+2]=doorWallFront+(z-doorWallFront)*(doorWallBack-doorWallFront)/(oldDoorWallBack-doorWallFront);
 }

 for(let i=2;i<positions.length;i+=3)if(positions[i]<=SHELL65.rearInside_m+.000001)positions[i]+=rearShift;
 // D3: right-hand soffit arch rebuilt as one smooth bent sheet (dukkan_kemer_d3.js)
 const d3=SHELL65.kemerFlush29?{...SHELL65,positions,info:SHELL65.kemerFlush29}:kemerD3(positions,SHELL65.normals,SHELL65.indices,SHELL65.whiteIndexCount);
 const geo=new T.BufferGeometry();
 geo.setAttribute('position',new T.Float32BufferAttribute(d3.positions,3));
 geo.setAttribute('normal',new T.Float32BufferAttribute(d3.normals,3));
 geo.setIndex(d3.indices);geo.addGroup(0,d3.whiteIndexCount,0);
 geo.addGroup(d3.whiteIndexCount,d3.indices.length-d3.whiteIndexCount,1);
 geo.computeBoundingBox();geo.computeBoundingSphere();
 const original=Array.isArray(wall.material)?wall.material[0]:wall.material;
 const white=original.clone();white.color.setHex(0xffffff);white.roughness=1;white.metalness=0;
 white.userData.storefront60Finish=true;white.userData.preserveReviewMaterial=true;
 wall.geometry.dispose();wall.geometry=geo;wall.material=[white,orange];
 for(const name of SHELL65.removedNames){const o=facade.getObjectByName(name);if(!o)throw new Error('Storefront shell: duplicate source missing '+name);o.removeFromParent();o.geometry.dispose();}
 const edges=g.getObjectByName('DUKKAN__DUVAR_KOSE_CIZGILERI');
 if(edges){edges.geometry.dispose();edges.geometry=new T.EdgesGeometry(geo,35);}
 const info={revision:65,wallMeshes:1,connectedComponents:1,closedBoundary:true,
  oldWallLayersRemoved:8,sharedCorners:true,QRGeometryChanged:false,
  frontDatum_m:3.002,roofDatum_m:2.8,glassRadius_mm:654,rearShift_m:rearShift,kemerD3:d3.info};
 wall.userData.storefrontShell65=info;IKIZ.storefrontShell65={wall,info};
 document.documentElement.dataset.storefrontShell65='ready';
 return info;
}
