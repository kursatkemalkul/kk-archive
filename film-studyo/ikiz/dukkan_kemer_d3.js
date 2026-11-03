// D3 (Kemal 22 Eki: "şu kemer neden köşeye dayanmıyor ve neden kutu kutu dönüyor").
// The canopy soffit turns down into the right column along the fascia's R260 arch (centre x 5.106, y 2.13).
// In SHELL65 that turn was sampled at equal x steps (NX 96), so the rear edge of the arch had only 12 points:
// the last spans are 23.6°, 10.1°, 7.8° … flat strips, and the 19 mm thickness was a vertical offset that
// collapses at the vertical end, leaving the inner lining short of the corner.
// Replaced here by one continuous bent sheet: flat run from the last flat sample to x 5.106, then a
// 64-segment quarter arc, lining r 260 (= fascia arch) ending tangent on the column face x 5.366, back
// r 279 (19 mm radial), rear z 2.105 (QR wall) → front z 2.983 (fascia). Smooth radial normals.
// Facade dimensions, the fascia's front plane triangles and every other shell triangle are unchanged.
export const KEMER_D3={cx:5.106,cy:2.13,r0:.26,r1:.279,z0:2.105,z1:2.983,seg:64};
export function kemerD3(positions,normals,indices,whiteIndexCount){
 const {cx,cy,r0,r1,z0,z1,seg}=KEMER_D3,P=positions,N=normals;
 const at=i=>[P[3*i],P[3*i+1],P[3*i+2]];
 const inArc=p=>p[0]>=5.10&&p[1]>=cy-1e-3&&p[2]>=z0-1e-4&&p[2]<=z1+1e-4&&Math.hypot(p[0]-cx,p[1]-cy)>=.255&&Math.hypot(p[0]-cx,p[1]-cy)<=.29;
 const keepW=[],keepO=[];let removed=0,xStart=Infinity;
 for(let k=0;k<indices.length;k+=3){
  const t=[indices[k],indices[k+1],indices[k+2]],v=t.map(at);
  const band=v.every(inArc)&&Math.min(...v.map(p=>p[2]))<z0+1e-3&&Math.max(...v.map(p=>p[2]))>z1-1e-3;
  if(band){removed++;for(const p of v)xStart=Math.min(xStart,p[0]);continue;}
  (k<whiteIndexCount?keepW:keepO).push(...t);
 }
 const pos=[...P],nor=[...N],add=[];
 function vert(x,y,z,nx,ny,nz){pos.push(x,y,z);nor.push(nx,ny,nz);return pos.length/3-1;}
 // profile: (x, y, nx, ny) along the lining / back, from the flat start to the vertical end
 function profile(r,inward){const s=inward?-1:1,out=[[xStart,cy+r,0,s]];
  for(let i=0;i<=seg;i++){const a=Math.PI/2*(1-i/seg),c=Math.cos(a),n=Math.sin(a);out.push([cx+r*c,cy+r*n,s*c,s*n]);}return out;}
 function surface(prof){const a=prof.map(p=>vert(p[0],p[1],z0,p[2],p[3],0)),b=prof.map(p=>vert(p[0],p[1],z1,p[2],p[3],0));
  for(let i=0;i<prof.length-1;i++){
   // wind so the face normal agrees with the vertex normal
   const p0=prof[i],p1=prof[i+1],ex=p1[0]-p0[0],ey=p1[1]-p0[1],dz=z1-z0;   // cross((ex,ey,0),(0,0,dz)) = (ey*dz,-ex*dz,0)
   const ok=(ey*dz)*p0[2]+(-ex*dz)*p0[3]>=0;
   if(ok)add.push(a[i],a[i+1],b[i],b[i],a[i+1],b[i+1]);else add.push(a[i],b[i],a[i+1],b[i],b[i+1],a[i+1]);
  }}
 if(removed){
  surface(profile(r0,true));     // visible lining, normal towards the arch centre (into the canopy)
  surface(profile(r1,false));    // back of the sheet
  // vertical end of the sheet, inside the column (x 5.366 → 5.385, y 2.13)
  const e=[vert(cx+r0,cy,z0,0,-1,0),vert(cx+r1,cy,z0,0,-1,0),vert(cx+r0,cy,z1,0,-1,0),vert(cx+r1,cy,z1,0,-1,0)];add.push(e[0],e[1],e[2],e[2],e[1],e[3]);
 }
 const out=[...keepW,...keepO,...add];
 return {positions:pos,normals:nor,indices:out,whiteIndexCount:keepW.length,
  info:{revision:'D3',removedTriangles:removed,addedTriangles:add.length/3,arcSegments:seg,flatStart_x:Math.round(xStart*10000)/10000,lining_r_mm:260,back_r_mm:279,ends:'tangent on column face x 5.366 / rear QR wall z 2.105 / fascia z 2.983'}};
}
