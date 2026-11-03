// Height-based vertex colours survive material copies and layer resets.
export function shopGradient30(T,material){
 const bottom=new T.Color(0xbc2f18),top=new T.Color(0xec6a22),point=new T.Vector3(),color=new T.Color(),height={value:2.8};
 material.color.setHex(0xffffff);material.vertexColors=true;material.onBeforeCompile=()=>{};material.customProgramCacheKey=()=> 'shop-vertex-gradient30';material.needsUpdate=true;
 function apply(o,mixed=false){
  o.updateWorldMatrix(true,false);let geo=o.geometry;
  if(!geo.userData.shopGradient30){geo=geo.clone();o.geometry=geo;geo.userData.shopGradient30=true;}
  const p=geo.attributes.position,col=new Float32Array(p.count*3);col.fill(1);
  const paint=i=>{point.fromBufferAttribute(p,i).applyMatrix4(o.matrixWorld);color.lerpColors(bottom,top,T.MathUtils.clamp(point.y/height.value,0,1));col[i*3]=color.r;col[i*3+1]=color.g;col[i*3+2]=color.b;};
  if(mixed){for(const gr of geo.groups)if(gr.materialIndex===1)for(let j=gr.start;j<gr.start+gr.count;j++)paint(geo.index?geo.index.getX(j):j);}
  else for(let i=0;i<p.count;i++)paint(i);
  geo.setAttribute('color',new T.BufferAttribute(col,3));return geo;
 }
 return {apply,shopGradientHeight:height,bottom,top};
}
