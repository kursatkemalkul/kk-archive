const base=new URL('../../',import.meta.url);
export async function openScene(frame,onStatus){
 const [html,source]=await Promise.all([fetch(new URL('index.html',base),{cache:'no-store'}).then(check).then(r=>r.text()),fetch(new URL('ikiz.js',base),{cache:'no-store'}).then(check).then(r=>r.text())]);
 const machineURL=new URL('yeni_makine/yeni_makine.js',base);
 const [machineSource,snapshot]=await Promise.all([fetch(machineURL,{cache:'no-store'}).then(check).then(r=>r.text()),fetch(new URL('scene-source.json',import.meta.url),{cache:'no-store'}).then(check).then(r=>r.json())]);
 const absolute=(code,url)=>code.replace(/(from\s*|import\s*)(['"])(\.{1,2}\/[^'"]+)\2/g,(_,lead,q,path)=>lead+q+new URL(path,url).href+q).replace(/import\(\s*(['"])(\.{1,2}\/[^'"]+)\1\s*\)/g,(_,q,path)=>'import('+q+new URL(path,url).href+q+')');
 let machine=absolute(machineSource,machineURL);
 machine=machine.replace(/const TABAN = [^;]+;/,'const TABAN = '+JSON.stringify(new URL('./',machineURL).href)+';').replace(/const govdeUrl = [^;]+;/,'const govdeUrl = '+JSON.stringify(new URL('body.glb.gz?v='+snapshot.body_sha256,import.meta.url).href)+';');
 const machineBlob=URL.createObjectURL(new Blob([machine],{type:'text/javascript'}));
 let module=source.replace(/(from\s*|import\s*)(['"])(\.{1,2}\/[^'"]+)\2/g,(_,lead,q,path)=>lead+q+(path.startsWith('./mqtt-ws.js')?new URL('offline-mqtt.js',import.meta.url).href:new URL(path,base).href)+q).replace(/import\(\s*(['"])(\.{1,2}\/[^'"]+)\1\s*\)/g,(_,q,path)=>'import('+q+(path.includes('/yeni_makine.js')?machineBlob:new URL(path,base).href)+q+')');
 module=module.replace(/const MODEL = [^;]+;/, 'const MODEL = '+JSON.stringify(new URL('../hat3d/ikiz-v1/',base).href)+';');
 // Public viewer URLs may contain controller port rewrites. None are used by
 // this isolated renderer: replace its MQTT module and deny all write traffic.
 const moduleURL=URL.createObjectURL(new Blob([module],{type:'text/javascript'}));
 const doc=new DOMParser().parseFromString(html,'text/html');
 doc.querySelectorAll('script,iframe').forEach(n=>n.remove());
 const csp=doc.createElement('meta');csp.httpEquiv='Content-Security-Policy';csp.content="frame-src 'none'; form-action 'none'; object-src 'none'";doc.head.prepend(csp);
 const b=doc.createElement('base');b.href=base.href;doc.head.prepend(b);
 const map=doc.createElement('script');map.type='importmap';map.textContent=JSON.stringify({imports:{three:new URL('vendor/three.module.min.js',base).href}});doc.head.append(map);
 const guard=doc.createElement('script');guard.textContent=`
 window.__PROMO_ISOLATED__=true;window.__PROMO_BLOCKED__=[];
 class MemoryStore{constructor(){this.d=new Map()}getItem(k){return this.d.get(k)??null}setItem(k,v){this.d.set(k,String(v))}removeItem(k){this.d.delete(k)}clear(){this.d.clear()}key(i){return [...this.d.keys()][i]??null}get length(){return this.d.size}}
 for(const k of ['localStorage','sessionStorage'])Object.defineProperty(window,k,{value:new MemoryStore()});
 const nativeFetch=async(input,init)=>{const response=await fetchOriginal(input,init);const path=new URL(typeof input==='string'?input:input.url||String(input),document.baseURI).pathname;if(!path.endsWith('.gz')||!response.ok||response.headers.has('Content-Encoding'))return response;const headers=new Headers(response.headers);headers.delete('Content-Length');headers.delete('Content-Encoding');return new Response(response.body.pipeThrough(new DecompressionStream('gzip')),{status:response.status,statusText:response.statusText,headers});};const fetchOriginal=window.fetch.bind(window);window.fetch=(input,init={})=>{const u=new URL(typeof input==='string'?input:input.url||String(input),document.baseURI);const method=(init.method||input.method||'GET').toUpperCase();if(u.protocol==='blob:'||u.protocol==='data:')return nativeFetch(input,init);if(method!=='GET'||/^\\/(api|digital-twin|orders|hmi|musteri|tablet)(\\/|$)/.test(u.pathname)||(u.origin!==location.origin&&!/\\.(glb|gz|bin|png|jpg|jpeg|webp|json|js)(\\?|$)/i.test(u.href))){window.__PROMO_BLOCKED__.push(method+' '+u.pathname);return Promise.reject(new Error('Tanıtım sahnesinde canlı servis çağrısı engellendi'));}return nativeFetch(input,init)};
 const nativeOpen=XMLHttpRequest.prototype.open;XMLHttpRequest.prototype.open=function(method,url,...args){const u=new URL(url,document.baseURI);if(String(method).toUpperCase()!=='GET'||/^\\/(api|digital-twin|orders|hmi|musteri|tablet)(\\/|$)/.test(u.pathname))throw Error('Tanıtım sahnesinde servis çağrısı engellendi');return nativeOpen.call(this,method,url,...args)};
 window.WebSocket=class{constructor(){this.readyState=0}send(){}close(){this.readyState=3}addEventListener(){}removeEventListener(){}};
 const src=Object.getOwnPropertyDescriptor(HTMLIFrameElement.prototype,'src');if(src?.set)Object.defineProperty(HTMLIFrameElement.prototype,'src',{...src,set(){src.set.call(this,'about:blank')}});
 window.open=()=>null;navigator.sendBeacon=()=>false;
 `;doc.head.append(guard);
 const style=doc.createElement('style');style.textContent='html,body,#ana,#sahne{width:100%!important;height:100%!important;margin:0!important;padding:0!important;overflow:hidden!important}#ana{display:block!important}#yan,#sahne>*:not(#kanvas):not(#yukle){display:none!important}body>div:not(#ana),body>button{display:none!important}#kanvas{width:100%!important;height:100%!important}';doc.head.append(style);
 const script=doc.createElement('script');script.type='module';script.src=moduleURL;doc.body.append(script);
 frame.srcdoc='<!doctype html>'+doc.documentElement.outerHTML;
 const start=performance.now();
 return await new Promise((resolve,reject)=>{const timer=setInterval(()=>{try{const w=frame.contentWindow,I=w.IKIZ;if(I?.yuklendi&&I?.yeniMakine){clearInterval(timer);URL.revokeObjectURL(moduleURL);URL.revokeObjectURL(machineBlob);resolve(I);return;}const text=w.document.getElementById('yukleMetin')?.textContent;if(text)onStatus(text);const errors=I?.konsolHata||[];if(w.document.getElementById('yukleTekrar')||errors.some(e=>/yuklen|failed|404|HTTP|model missing/i.test(e))){clearInterval(timer);reject(new Error(errors.slice(-1)[0]||w.document.getElementById('yukleMetin')?.textContent||'Model yüklenemedi'));}if(performance.now()-start>240000){clearInterval(timer);reject(new Error('Sahne yüklemesi tamamlanamadı. Bağlantıyı kontrol edip yeniden deneyin.'));}}catch(e){clearInterval(timer);reject(e)}},300)});
}
function check(response){if(!response.ok)throw Error('Sahne kaynağı yüklenemedi: HTTP '+response.status);return response;}
