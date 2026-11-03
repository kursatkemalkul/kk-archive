// Display-only diagnostics; the PLC remains the owner of all permissions.
export function robotStatus(f) {
  const r=f.robot||{}, d=f.robot_diagnostics||{}, p=d.preparation||{};
  if(f.duraklat)return 'simülasyon duraklatıldı';
  if(r.gorev)return `${r.gorev} · ${r.adim} · %${Math.round((r.faz||0)*100)}`;
  if(f.hat==='KAPALI')return 'hat kapalı';
  if(f.hat==='KURTARMA')return 'kurtarma işlemi bekleniyor';
  if(f.hat==='HATA')return 'hat arızası';
  if(f.hat==='SERVIS'||f.hat==='TEMIZLIK')return 'servis / temizlik';
  const reason=d.gates?.sHamurBekle;
  if(reason==='robot yolu hesaplanıyor')return `${reason} · ${p.ready||0} hazır · ${(p.queued||0)+(p.busy?1:0)} iş bekliyor`;
  return reason||'boşta';
}
