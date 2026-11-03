const finished=new Set(['TESLIM_EDILDI','IPTAL','IADE']);
export function screenState(orders=[],fresh=false){
 const active=orders.filter(s=>!finished.has(s.durum));
 return {mode:active.length?'SIPARIS':!fresh?'BAGLANTI':'REKLAM',ready:active.filter(s=>['HAZIR','ZAMAN_ASIMI'].includes(s.durum)),preparing:active.filter(s=>!['HAZIR','ZAMAN_ASIMI'].includes(s.durum))};
}
export function pageItems(items,cap,clock,seconds=8){
 const pages=Math.max(1,Math.ceil(items.length/cap)),page=Math.floor(clock/(seconds*1000))%pages;
 return {items:items.slice(page*cap,(page+1)*cap),page:page+1,pages};
}
export function products(menu){return menu.filter(u=>u.aktif!==false&&!u.ek&&u.grup!=='ek');}
