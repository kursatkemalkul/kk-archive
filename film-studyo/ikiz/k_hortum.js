// 125 CAD ile aynı analitik hat. SX_K_BICAK dışında hareket saati yok.
export function kHortumKur(THREE, kok) {
  const node = kok.getObjectByName('K_SERVIS121__TLM1008_hareketli');
  if (!node) return () => {};
  const original = node.geometry;
  const xf=4155, radius=Math.hypot(4355-xf,200)/2;
  const total = 33 + Math.PI * 50 + 240 + Math.PI * radius;
  class Yol extends THREE.Curve {
    constructor(sx) { super(); this.sx = sx; }
    getPoint(t, target = new THREE.Vector3()) {
      const s = this.sx, ym=1329.1-s, yf=1250, yc=(ym+yf)/2+120;
      let l = t * total, x, y, z;
      if (l <= 33) { x=4222+l; y=1229.1-s; z=-206; }
      else if ((l -= 33) <= Math.PI*50) { const a=l/100; x=4255+100*Math.sin(a); y=ym-100*Math.cos(a); z=-206; }
      else if ((l -= Math.PI*50) <= yc-ym) { x=4355; y=ym+l; z=-206; }
      else if ((l -= yc-ym) <= Math.PI*radius) { const a=l/radius; x=(4355+xf)/2+(4355-xf)/2*Math.cos(a); y=yc+radius*Math.sin(a); z=-306+100*Math.cos(a); }
      else { l -= Math.PI*radius; x=xf; y=yc-l; z=-406; }
      return target.set(x / 1000, y / 1000, z / 1000);
    }
  }
  let last = null;
  return sx => {
    const s = Math.max(0, Math.min(125, +sx || 0));
    if (s === last) return;
    if (node.geometry !== original) node.geometry.dispose();
    node.geometry = new THREE.TubeGeometry(new Yol(s), 256, .005, 12, false);
    last = s;
  };
}
