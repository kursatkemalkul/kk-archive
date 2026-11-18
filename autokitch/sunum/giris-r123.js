(() => {
  const gate=document.getElementById('site-giris');
  const finish=()=>{gate.remove();document.body.classList.remove('site-kilitli');window.dispatchEvent(new Event('autokitch-unlocked'));};
  if(sessionStorage.getItem('ak_main_ok')==='1'){finish();return;}
  document.body.classList.add('site-kilitli');
  document.getElementById('giris-form').addEventListener('submit',e=>{
    e.preventDefault();
    const field=document.getElementById('site-kod');
    if(field.value.trim().toLowerCase()==='alfa'){sessionStorage.setItem('ak_main_ok','1');finish();}
    else{document.getElementById('giris-hata').textContent='Şifreyi kontrol edip tekrar dene.';field.select();}
  });
})();
