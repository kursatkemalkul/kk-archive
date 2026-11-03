// This panel requests virtual wiring faults only. It never drives a real output.
export function sameCableRoute(reference,view){
 return !!view&&reference.from===view.from&&reference.to===view.to&&reference.profile===view.profile&&Math.abs(reference.diameter_mm-view.diameter_mm)<=1e-9&&JSON.stringify(reference.pins)===JSON.stringify(view.pins)&&reference.points.length===view.points.length&&reference.points.every((p,i)=>p.every((v,j)=>Math.abs(v-view.points[i][j])<=1e-9));
}
export function sinyalPanelKur(IKIZ, host, cables) {
 const panel=document.createElement('details');panel.dataset.signalInspector='';
 panel.innerHTML='<summary>PLC → cihaz bağlantı denetimi</summary><p data-signal-status>Kontrol sürümü bekleniyor.</p><p style="font-size:11px">Sanal kablo testi üretimi durdurabilir. Gerçek pin/PDO kabulü değildir.</p><label><input type="checkbox" data-signal-enable> Sanal bağlantı arıza testini etkinleştir</label><select aria-label="Test edilecek kablo veya sinyal" data-signal-target></select><button data-signal-break disabled>Bağlantıyı kes</button><button data-signal-restore disabled>Bağlantıyı geri tak</button><pre data-signal-detail style="font-size:11px;white-space:pre-wrap"></pre>';
 host.append(panel);
 const list=panel.querySelector('[data-signal-target]'),info=panel.querySelector('[data-signal-detail]'),status=panel.querySelector('[data-signal-status]'),enable=panel.querySelector('[data-signal-enable]'),cut=panel.querySelector('[data-signal-break]'),restore=panel.querySelector('[data-signal-restore]');
 let contract=null, graphHash=null, signalHash=null, compatible=false,last=0;
 const rows=new Map();
 for(const r of cables.routes){const o=document.createElement('option');o.value=r.id;o.textContent=r.id+' · '+r.from+' → '+r.to;list.append(o);rows.set(r.id,r);}
 const backup=document.createElement('option');backup.value='UPS.BATTERY';backup.textContent='UPS yedek enerji kullanılamıyor (sanal test)';list.append(backup);rows.set(backup.value,{id:backup.value,from:'UPS yedek enerji',to:'UPS çıkışları'});
 Promise.all(['wiring-external.json','wiring-signals.json'].map(n=>fetch(new URL('./assets/elektrik/'+n,import.meta.url),{cache:'no-store'}).then(r=>{if(!r.ok)throw Error(n);return r.text();}))).then(async ([raw,signals])=>{
  const external=JSON.parse(raw);contract=JSON.parse(signals);
  const mismatch=external.routes.filter(r=>!sameCableRoute(r,rows.get(r.id)));
  compatible=external.routes.length===cables.routes.length&&!mismatch.length;
  panel.dataset.routeMismatch=mismatch.map(r=>r.id).join(',');
  panel.dataset.routeMismatchDetail=JSON.stringify(mismatch.slice(0,1).map(r=>({reference:{from:r.from,to:r.to,pins:r.pins,points:r.points},view:rows.get(r.id)?{from:rows.get(r.id).from,to:rows.get(r.id).to,pins:rows.get(r.id).pins,points:rows.get(r.id).points}:null})));
  graphHash=[...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(raw)))].map(b=>b.toString(16).padStart(2,'0')).join('');
  signalHash=[...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(signals)))].map(b=>b.toString(16).padStart(2,'0')).join('');
  for(const r of contract.signals){rows.set(r.signal,r);const o=document.createElement('option');o.value=r.signal;o.textContent=r.station+' · '+r.signal;list.append(o);}
  refresh();
 }).catch(()=>{status.textContent='Bağlantı sözleşmesi yüklenemedi; test kapalı.';compatible=false;});
 function refresh(){
  const state=IKIZ.son?.wiring,ready=compatible&&state?.external_sha256===graphHash&&state?.signal_sha256===signalHash;
  panel.dataset.localCompatible=String(compatible);panel.dataset.externalHash=graphHash||'';panel.dataset.controllerHash=state?.external_sha256||'';panel.dataset.signalHash=signalHash||'';panel.dataset.controllerSignalHash=state?.signal_sha256||'';
  cut.disabled=restore.disabled=!ready||!enable.checked||!IKIZ.mqttBagli;
  status.textContent=!state?'Canlı kontrolcü henüz bu bağlantı sürümünü kullanmıyor.':!ready?'Görüntü ile kontrolcünün kablo sürümü uyuşmuyor; test kapalı.':Object.entries(state.stations).filter(([,ok])=>!ok).map(([s])=>s).join(', ') ? 'Bağlantısı kesik istasyonlar: '+Object.entries(state.stations).filter(([,ok])=>!ok).map(([s])=>s).join(', '):'Dijital bağlantılar sağlam · '+contract.signals.length+' sinyal · '+(contract.acceptance.explicit_channel_assignments||0)+' kanal ataması';
  const r=rows.get(list.value);if(!r)return;
  if(r.signal){
   const a=r.binding||{},pins=Object.entries(a.terminal_pins||{}).map(([k,v])=>k+' = '+v).join(', ');
   info.textContent=r.signal+'\n'+r.direction+' · '+r.type+'\nFiziksel pano: '+(a.host||r.station)+'\nTerminal: '+(a.module||'belirlenmedi')+(a.channel?' · kanal '+a.channel:'')+'\nTür: '+(a.kind||r.status)+'\nUçlar: '+(pins||'Fiziksel pin uygulanmaz / arayüz teyidi gerekir')+(a.adapter?'\nDönüştürücü: '+a.adapter:'')+(r.nc_reference?'\nNC: '+r.nc_reference:'')+'\nGerekli cihazlar: '+(r.required_devices||r.device_boundary).join(', ')+'\nTerminal pin şeması: '+(a.terminal_pinout_checked?'üretici dokümanıyla kontrol edildi':'bu kayıtta teyit edilmedi')+'\nSaha bağlantısı / PDO: '+(a.field_accepted&&a.pdo_linked?'kabul edilmiş':'makinede doğrulanmadı');
  }else info.textContent=r.id+'\n'+r.from+' → '+r.to+'\nDurum: '+(state?.faults?.includes(r.id)?'KOPUK':'bağlı');
 }
 enable.onchange=list.onchange=refresh;
 const request=kopuk=>{if(cut.disabled)return;IKIZ.kontrol?.({tip:'ikiz.kablo',hedef:list.value,kopuk});};
 cut.onclick=()=>request(true);restore.onclick=()=>request(false);
 IKIZ.kancalar.push(()=>{const now=performance.now();if(now-last>500){last=now;refresh();}});
}
