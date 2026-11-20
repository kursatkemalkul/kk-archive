(() => {
  const plan = document.getElementById('makine-plani');
  const buttons = Array.from(plan.querySelectorAll('[data-station]'));
  const panels = new Map(buttons.map(button => [
    button, document.getElementById(button.getAttribute('aria-controls'))
  ]));
  let active = null;

  function select(button) {
    active = active === button ? null : button;
    for (const [control, panel] of panels) {
      const expanded = control === active;
      control.setAttribute('aria-expanded', String(expanded));
      panel.hidden = !expanded;
    }
    window.ScrollTrigger?.refresh();
  }

  for (const button of buttons) button.addEventListener('click', () => select(button));
  plan.addEventListener('toggle', () => {
    if (!plan.open) select(null);
    else window.ScrollTrigger?.refresh();
  });

  const totals = new Map();
  for (const row of plan.querySelectorAll('[data-teklif-tutar]')) {
    const {teklifTutar, para} = row.dataset;
    totals.set(para, (totals.get(para) || 0) + Number(teklifTutar));
  }
  const format = new Intl.NumberFormat('tr-TR');
  document.getElementById('hat-teklif-toplami').textContent = Array.from(totals, ([currency, amount]) =>
    format.format(amount) + (currency === 'EUR' ? ' €' : ' ' + currency)
  ).join(' + ');

  function openLinkedPlan() {
    if (location.hash === '#makine-plani' && !document.getElementById('site-giris')) {
      plan.open = true;
      plan.scrollIntoView({block:'start'});
    }
  }
  window.addEventListener('autokitch-unlocked', openLinkedPlan, {once:true});
  window.addEventListener('hashchange', openLinkedPlan);
  openLinkedPlan();
})();
