// These supplier entries refer to specific products in the original AUTOKITCH film library.
window.pinFirmaVideolariniBagla = function () {
  const videos = {
    "Let's Pizza":"5Ij6T2q75Lo", "PAZZI":"ewPMWyXT5eI", "Nala Robotics":"84U72eii5mY",
    "Lab2Fab (Middleby)":"Umv8HLiHjoA", "xRobotics":"hqEaC2igCrs", "Appetronix":"drgGuFU6JDw",
    "Pizzabot":"5h572vnufCY", "Juyou":"XJLFVg1xXgE", "Circus · CA-1":"WpuD0xHoH9g",
    "BOTINKIT":"Kcw0kw2v8ps", "Eatch":"qtkONuUDwHI", "Aniai":"HLvhpA6ceew",
    "RoboEatz":"Ey1yIivlgCk", "goodBytz":"GiG6Kmz_FfE", "Posha":"Ubd6NkZOEkM",
    "Moley Robotics":"Hkpocscz5Mw", "Alberts":"tsoyhTsl_vM", "Botrista":"_LbtlWvkcQ8",
    "CERĒS":"Q3MFehbBGps", "Smyze":"o_XaiAvwROo", "Makr Shakr":"H6GgpzqBPPg",
    "Macco Robotics":"JWPZtjOCo40", "Artly":"iOwGhmRRHFI", "Richtech Robotics":"lK6LbfqdOkA",
    "RoboBurger":"-YCnpUE3DN4", "Yo-Kai Express":"YiaJYVeT3wc", "Miso Robotics":"35sMoU_-Gpk",
    "Chef Robotics":"ZGtGzLdDRUU", "Cibotica":"KtDvObHzXhk", "Beyond Honeycomb":"vYq62YQ1Pmo",
    "Dobot":"TsFlc_RwIY4", "wetechfood":"vGgE7XiKImw", "Hyphen":"aD4ctvEX07Q",
    "Rolo Robotics":"T5tUEaxpaLg", "RoboChef":"wDuG27ds7OE", "Cook-e":"2MLoj4gSVXY",
    "Else Labs":"wLVWGtjE31Q", "Kyol":"AdSFSHvUOUQ", "InstaChef":"Mu_39D4reJY",
    "Doosan Robotics":"hAdF07mevIc", "Liffo":"bsDfaWvQtMg", "Chefee Robotics":"eqnyKK9hUCo"
  };
  const catalog = new Map(Array.from(document.querySelectorAll('#vsayfa .vad'),entry => [entry.dataset.yt,entry]));
  for (const label of document.querySelectorAll('#t-liste .firmalar2 > span')) {
    const name = label.textContent.trim();
    const source = catalog.get(videos[name]);
    if (!source) continue;
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = name;
    Object.assign(button.dataset,source.dataset);
    button.setAttribute('aria-label',name + ' ürün videosunu izle');
    button.setAttribute('aria-haspopup','dialog');
    label.replaceWith(button);
  }
};
