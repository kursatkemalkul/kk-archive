// Timestamped camera poses. Sampling depends only on time, so reverse seeking
// follows the exact same path. Smootherstep avoids jumps in speed at anchors.
export function cleanKeys(value){
 if(!Array.isArray(value))return [];
 const keys=new Map();
 for(const k of value){if(!k||!Number.isFinite(k.time)||k.time<0||k.time>28||!['position','target'].every(n=>Array.isArray(k[n])&&k[n].length===3&&k[n].every(v=>Number.isFinite(v)&&Math.abs(v)<10000))||!Number.isFinite(k.fov)||k.fov<10||k.fov>120)continue;
 const time=Math.round(k.time*100)/100;keys.set(time,{time,position:[...k.position],target:[...k.target],fov:k.fov});}
 return [...keys.values()].sort((a,b)=>a.time-b.time);
}
export function putKey(keys,key){return cleanKeys([...keys,key])}
export function cameraAt(keys,time){
 if(!keys.length)return null;
 let a=keys[0],b=a;
 if(time>=keys.at(-1).time)a=b=keys.at(-1);
 else if(time>a.time){for(let i=1;i<keys.length;i++)if(time<=keys[i].time){a=keys[i-1];b=keys[i];break;}}
 const u=a===b?0:Math.max(0,Math.min(1,(time-a.time)/(b.time-a.time))),s=u*u*u*(u*(u*6-15)+10);
 const mix=(x,y)=>x+(y-x)*s;
 return {position:a.position.map((v,i)=>mix(v,b.position[i])),target:a.target.map((v,i)=>mix(v,b.target[i])),fov:mix(a.fov,b.fov)};
}
