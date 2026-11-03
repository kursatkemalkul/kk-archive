import * as T from 'three';
import {elektrikSinif} from './elektrik_katmani.js';
import {disYuzeyKur,stilKopyala} from './dis_yuzey.js';
import {MONTAJ_SINIR,ustMontaj,montajSahiplikKur} from './montaj_sahiplik.js';
// Presentation-only layer controls. Never change PLC, poses or driver visibility.
export const KATMANLAR=[['A','Hamur açıcı'],['TOP','Topping'],['F','Fırın'],['UF','Fırın üst teknik dolap / bilgisayar'],['K','Sprey / kesme'],['E','Kutu katlama'],['B','Soğuk dolap / çekmeceler'],['ROB','Robot / ray'],['QR','QR dolabı'],['WASH','Temizlik istasyonu'],['COMMON','Ortak şasi / tesisat'],['POWER','Şalter / elektrik dağıtımı'],['ELECTRICAL','Tüm elektrik / PLC / internet'],['KIOSK','Sipariş ekranı'],['SHOP','Dükkân'],['PERSONEL','Personel alanı'],['EKRAN','Sipariş ekranları'],['MALZEME','Malzemeler / stok / ürün'],['OTHER','Diğer / sahipliği belirsiz parçalar']];
export const MAKINE_IDS=['A','TOP','F','UF','K','E','B','COMMON'];
export const IZOLASYON_SINIR={...MONTAJ_SINIR,MACHINE:[.730,5.292,.02,2.78,-.921,.079],QR:[3.270,5.365,.0,2.12,1.695,2.11],ROB:[.65,5.25,-.04,2.45,.10,1.50],WASH:[1.94,3.17,0,2.8,1.50,2.883],KIOSK:[5.33,5.48,.30,1.92,2.20,2.75]};
// TOP58 hardware uses the new1000mm enclosure depth.
IZOLASYON_SINIR.TOP58=[1.436,2.5,.788,2.2,-.921,.079];
const machineBox=IZOLASYON_SINIR.MACHINE;
const owner=n=>{
 const upper=ustMontaj(n);if(upper)return upper;
 if(/^DUKKAN_SERVIS__(BINA_|KAPAKLI_ZEMIN|.*KANAL)|^ELK_(BINA|DUVAR_PANO|ZEMIN|DUKKAN_PC|ZINCIR)|^BINA_ZEMIN|^FLOOR27_|^ROBOT25_(DIN_|DUVAR_|SAG_DUVAR_|PANO_|SCHNEIDER_|IC60N_|PE_|TP_LINK|ER605_|AG_|WAN_|BINA_|ANA_GIRIS|OLUK_|GOMULU_|ZEMIN_|CIKIS_SIFIR|KAPAK_DERZ|MAKINE_(DIK|BESLEME|ETHERNET)|ROBOT_BESLEME|SURUCU_(BESLEME|GIRIS|CIKIS))|SIGORTA_PANOSU/.test(n))return 'POWER';
 // QR-6b: staff side (counter, POS, tablet, cash/consumable drawers, lockers, hand sink, silhouette).
 if(/^(PERSONEL_|IKIZ_PERSONEL|ELLE_CEKMECE|IKIZ_EKRAN_DERINLIK_pos|DUKKAN__(POS_TABLET|DAR_TEZGAH|TESISAT_EL_LAVABO)|DUKKAN_SERVIS__(TABLET|POS_|MASA_|KASA_|PERSONEL_|NAKIT_|SARF_|COP_|YEDEK_FIS|APG_|TEZGAH_|MAKINE_TABLET))/.test(n))return 'PERSONEL';
 if(/KIOSK|IKIZ_EKRAN_DERINLIK_kiosk/.test(n))return 'KIOSK';
 if(/^(TUTUCU|UR10E|Tool$|DT_ROBOT|DT_ZINCIR|ELK_ROBOT|ELK_EKSEN|ELK_RAY|ELK_ZINCIR)/.test(n))return 'ROB';
 if(/^D_PIZZA_YEDEK/.test(n))return 'E';
 // QR-6: twin-only helpers that had no owner (product templates, tablet, QR lamps, staff silhouette).
 if(/^URUN__/.test(n))return 'COMMON';
 if(/^HMI_TABLET__/.test(n))return 'A';
 if(/^DT_E_COP/.test(n))return 'E';
 if(/^(IKIZ_GOZ_ISIK_G|SIPARIS_TURU_PIN_ISIK)/.test(n))return 'QR';
 if(/^IKIZ_PERSONEL_SILUET/.test(n))return 'PERSONEL';
 if(/^KAIDE_A|^TOPPING_MODUL__.*__ACICI|^MAKINE_TABLET|^IKIZ_EKRAN_DERINLIK_machine/.test(n))return 'A';
 if(/^KAIDE_C/.test(n))return 'TOP';
 if(/^HAVA_KOMPRESOR|^HAVA_EMNIYET|^ELK_ANA_PANO_UF/.test(n))return 'F';
 if(/^HAVA_|^ELK_ISTASYON|^ELK_IC|^EMNIYET_|^ACIL_|^DUZ_|^DAC_/.test(n))return 'COMMON';
 if(/^(YIKAMA|DUKKAN__YIKAMA|DUKKAN__TEMIZ_YEDEK|YEDEK_|KARTON_DEPO)/i.test(n))return 'WASH';
 if(/^(DT_QR|QR_|QR\d|IKIZ_QR|ELK_QR|ROBOT25_QR)/i.test(n)||/^IKIZ_EKRAN_DERINLIK_(tv|qrpin)$/.test(n))return 'QR';
 if(/^(UR10|UR_|Tool$|ROB_|ROBOT|IKIZ_J|DT_ROBOT|DT_ZINCIR|ELK_(RAY|ZINCIR))/i.test(n))return 'ROB';
 if(/^(TOPPING|U_A_|ELK_TOPPING|IKIZ_EKRAN_DERINLIK_machine|MAKINE_TABLET)/.test(n))return 'TOP';
 if(/^(A_|ELK_A_)/.test(n))return 'A';
 if(/^(F_|U_F_|ELK_F_)/.test(n))return 'F';
 if(/^(K_|ELK_K_)/.test(n))return 'K';
 if(/^(E_|ELK_E_)/.test(n))return 'E';
 if(/^(B_|CEK_|ELK_B_)/.test(n))return 'B';
 if(/^IKIZ_[AFKE]_/.test(n))return n[5];
 if(/^(U_KE_|ELK_|HAT_|SASE|ANA_)/.test(n))return 'COMMON';
 if(/^(DUKKAN|BINA|FLOOR|PERSONEL|POS_|PANJUR|IKIZ_EKRAN)/.test(n))return 'SHOP';
 return null;
};
// QR-6: outer sheet panels by geometry. Names of newer station revisions vary;
// a thin, wide part lying on the station's side/top/back/front plane is its sac.
const KABUK_SINIR={...MONTAJ_SINIR,QR:IZOLASYON_SINIR.QR,WASH:IZOLASYON_SINIR.WASH};
const _kb=new T.Box3(),_ks=new T.Vector3();
function kabukSaci(o,id){
 const s=KABUK_SINIR[id];if(!s||!o.isMesh||!o.geometry)return false;
 _kb.setFromObject(o);if(_kb.isEmpty())return false;_kb.getSize(_ks);
 const ince=Math.min(_ks.x,_ks.y,_ks.z),alan=Math.max(_ks.x*_ks.y,_ks.y*_ks.z,_ks.x*_ks.z);
 if(ince>.008||alan<.015)return false;
 // Machine stations also use the 21 Eki station standard: top 2200, back -921, front +79.
 const d=.035,yakin=(v,l)=>l.some(p=>Math.abs(v-p)<d),makine=MAKINE_IDS.includes(id);
 const ust=makine?[s[3],2.2]:[s[3]],arka=makine?[s[4],-.921]:[s[4]],on=makine?[s[5],.079]:[s[5]];
 return (_ks.x<=.008&&(yakin(_kb.min.x,[s[0]])||yakin(_kb.max.x,[s[1]])))||
  (_ks.y<=.008&&(yakin(_kb.max.y,ust)||yakin(_kb.min.y,[s[2]])))||
  (_ks.z<=.008&&(yakin(_kb.min.z,arka)||yakin(_kb.max.z,on)));
}
// QR-6d: consumables, stock and products (contents only; machines, cassettes, drawers stay).
export const MALZEME_AD=new RegExp([
 '^(IKIZ_URUN|IKIZ_URUNLER|IKIZ_STOK|IKIZ_KUTU_KARTON|URUN__|URUN_(Box|Cola|Dessert|Dough)|HAMUR_BEZE|QR56_ICECEK|D_PIZZA_YEDEK|U_KUTU_YEDEK|U_ICECEK_YEDEK|YEDEK_(HARC|KASAR|KIYMA|KUSBASI|SOS|SUCUK)|IKIZ_K_YAG_(IZI|DAMLA))',
 '__(hamur|kutu_icecek|tatli)__CEKMECE','^B_DEPO__(kasar|sucuk)',                 // B: dough, drinks, desserts, toppings
 '^E_SARJOR__karton','^E_PIZZA__','^E_KUTU__B_','_REFILL_PACKET','_REMAINING_STACK','_ONE_BLANK$',  // E: cartons, folded box, pizza
 '^ROBOT\\d+_(Cola|Dough)_stock','^ROBOT\\d+_PRODUCT_',                           // robot: carried product copies
 '^YIKAMA__(DETERJAN_\\d|PARLATICI_\\d|YUZEY_URUNU_\\d|DETERJAN_KAPAK|PARLATICI_KAPAK|YUZEY_URUNU_KAPAK|TEMIZLEYICI|ACIK_KARTON|KAGIT_HAVLU|ELDIVEN_KUTUSU|KIMYASAL_ELDIVEN)',  // wash: chemicals, paper, gloves
 'YEDEK_FIS_RULOSU'].join('|'));
function malzemeMi(o){for(let a=o;a;a=a.parent)if(MALZEME_AD.test(a.name||''))return true;return false;}
const DORT_KATMAN=new Set(['A','TOP','F','UF','K','E','UKE','B','QR','WASH','PERSONEL','COMMON']);   // 24 Eki: personel + ortak şasi de sac / kapak / şasi / iç alır
// QR-6e: door leaves / removable panels found per station in the 22 Eki run.
const KAPAK_GRUP=/^(E_CLEAN\d+_LEAF_|REAR_DOOR_SHEET_AND_LOCAL_PANEL$|A_CLEAN\d+_DOOR_(LEAF|PUSH_STRIKER)|\d+_REAR_SERVICE_SHEET_AND_LOCAL_PANEL$|K\d+_REAR_REMOVABLE_COVER|TOP\d+_ARKA_SERVIS_KAPAK|SERVIS_KAPAK_\d|IKIZ_QR_G\d+_KAPI)|__KAPAK_F_(SAG|SOL)|__on_seffaf/;   // E: only parts under a moving leaf group (hinge/shaft go with the leaf); door strips / angle seats on the body stay
function kapakGrubu(o){for(let a=o;a;a=a.parent)if(KAPAK_GRUP.test(a.name||''))return true;return false;}
// QR-6f: explicit station tag wins over every name/geometry rule: userData.katman =
// 'sac' | 'kapak' | 'sasi' | 'ic' | 'malzeme' on the mesh or any ancestor (nearest wins).
const KATMAN_ETIKET={sac:'frame',kapak:'cover',sasi:'sasi',ic:'ic'};
function katmanEtiketi(o){for(let a=o;a;a=a.parent){const k=a.userData?.katman;if(k)return k;}return null;}
export function katmanSinif(o){
 const c=katmanSinifAd(o),etiket=katmanEtiketi(o);
 if(c.id==='POWER')c.host=gucSahibi(o);
 if(o.userData?.dtScreenDepthMask){c.part=null;return c;}   // CSS3D ekran maskesi: kısım yok → malzemesi hiç kopyalanmaz (yeniden sınıflamada da)   // 24 Eki: etiketli (ör. zemin kanalı 'sasi') POWER parçası da sahibini bilsin — yoksa her 'Yalnız'da görünüyordu
 if(etiket){c.etiket=etiket;if(etiket==='malzeme')c.malzeme=true;else if(KATMAN_ETIKET[etiket]){c.part=KATMAN_ETIKET[etiket];return c;}}
 if(c.part!=='cover'&&DORT_KATMAN.has(c.id)&&kapakGrubu(o))c.part='cover';
 if(c.product!=null||malzemeMi(o))c.malzeme=true;
 if(!c.part&&KABUK_SINIR[c.id]&&kabukSaci(o,c.id)){c.part='frame';c.kabuk=true;}
 // QR-6e: named outer sheets of cabinets that sit inside a wider station box (wash T70 cabinet).
 if(DORT_KATMAN.has(c.id)&&c.part!=='cover'&&/(_YAN_SAC(_|$)|_CATI(_SAC)?$|_ARKA_SAC(_|$)|_TABAN_SAC$)/.test(o.name||'')&&!/KARTON|RAF|SHELF/.test(o.name||'')){c.part='frame';c.kabuk=true;}
 if(c.part==='frame'&&/__vida|_VIDA|_vida/.test(o.name||''))c.part=null;   // fasteners are inner system
 // QR-6c: "sac" = cladding only. RHS posts, rails and shelves (two sides <=60 mm,
 // length >=250 mm) are skeleton and stay visible with the inner devices.
 if(c.part==='frame'&&iskelet(o)){c.part='sasi';c.iskelet=true;}
 if(c.part==='frame'&&!c.kabuk&&KABUK_SINIR[c.id]&&!disDuzlemde(o,c.id)){c.part=null;c.ic=true;}
 // QR-6e: four layers per station. Remaining parts: profile bars -> chassis, else inner system.
 if(!c.part&&DORT_KATMAN.has(c.id)){if(!c.malzeme&&iskelet(o)){c.part='sasi';c.iskelet=true;}else c.part='ic';}   // 24 Eki: karton / ürün ince-uzun olsa da şasi değildir
 // QR-6c: building / cell power has no row of its own; it follows its host row.
 if(c.id==='POWER')c.host=gucSahibi(o);
 return c;
}
// Any face of the part's box within 35 mm of one of the station's outer planes.
function disDuzlemde(o,id){
 const s=KABUK_SINIR[id];if(!o.isMesh||!o.geometry)return false;_kb.setFromObject(o);if(_kb.isEmpty())return false;
 const d=.035,yakin=(v,l)=>l.some(p=>Math.abs(v-p)<d),makine=MAKINE_IDS.includes(id);
 return yakin(_kb.min.x,[s[0]])||yakin(_kb.max.x,[s[1]])||yakin(_kb.min.y,[s[2]])||yakin(_kb.max.y,makine?[s[3],2.2]:[s[3]])||yakin(_kb.min.z,makine?[s[4],-.921]:[s[4]])||yakin(_kb.max.z,makine?[s[5],.079]:[s[5]]);
}
function iskelet(o){
 if(!o.isMesh||!o.geometry)return false;
 for(let a=o;a;a=a.parent)if(/^CEK_|__CEKMECE/.test(a.name||''))return false;   // drawer rails / handles: mechanism
 if(/KANAL|kanal|KABLO|kablo|DUCT|_DIN_|__din|__vida|_VIDA/.test((o.userData.assemblySourceName||'')+' '+(o.name||'')))return false;   // own name only: ducts, DIN rails, screws
 _kb.setFromObject(o);if(_kb.isEmpty())return false;_kb.getSize(_ks);
 const d=[_ks.x,_ks.y,_ks.z].sort((a,b)=>a-b);return d[1]<=.06&&d[2]>=.25;
}
function gucSahibi(o){
 const chain=[];for(let a=o;a;a=a.parent)chain.push(a.name||'');
 // 26 Eki gece (Kemal: "robot rayda yalnız robot, ray ve kutusu"): hücrenin duvar panosu, şalterleri, ağ cihazları, bina / WAN girişi ve zemin besleme hattı dükkânın elektriğidir
 if(chain.some(n=>/^ROBOT\d+_(PANO|SCHNEIDER|IC60N|DIN_|PE_|ER605|TP_LINK|AG_|WAN|BINA|DUVAR|ANA_GIRIS|SURUCU_(GIRIS|CIKIS|BESLEME)|MAKINE_|ROBOT_BESLEME|CIKIS_SIFIR|GOMULU|KAPAK_DERZ)/.test(n)))return 'SHOP';
 if(chain.some(n=>/^(ROBOT\d+_|ELK_ZINCIR|ELK_ROBOT)/.test(n)))return 'ROB';
 if(o.isMesh&&o.geometry){_kb.setFromObject(o);const m=IZOLASYON_SINIR.MACHINE;if(!_kb.isEmpty()&&_kb.min.x>=m[0]&&_kb.max.x<=m[1]&&_kb.min.y>=m[2]&&_kb.max.y<=m[3]&&_kb.min.z>=m[4]&&_kb.max.z<=m[5])return 'COMMON';}
 return 'SHOP';
}
function katmanSinifAd(o){
 if(o.userData.assemblyOwner)return {id:o.userData.assemblyOwner,part:partOf(o.userData.assemblySourceName,o.userData.assemblyOwner)};
 // Nearest named assembly wins; source meshes of clean spares keep TOP names.
 for(let a=o;a;a=a.parent)if(a.userData?.kapakIstasyon)return{id:a.userData.kapakIstasyon,part:'cover',owners:a.userData.stationOwners};
 if(o.userData.wash57Part)return {id:'WASH',part:o.userData.wash57Part};
 const chain=[];for(let a=o;a;a=a.parent)chain.push(a.name||'');
 if(chain.some(n=>/^(DUKKAN__YIKAMA|DUKKAN__TEMIZ_YEDEK)/.test(n)))return {id:'WASH',part:partOf(o.name,'WASH')};
 const product=chain.find(n=>/^IKIZ_URUN_\d+$/.test(n));
 if(product)return {id:'COMMON',part:null,product:Number(product.slice(10))};
 if(chain.some(n=>n==='E_SERVIS_L_KAPAK'))return {id:'E',part:'cover'};
 if(chain.some(n=>/^DT_QR_.*_UST_PIVOT$/.test(n)))return {id:'QR',part:'cover'};
 for(const n of chain){const id=owner(n);if(id)return {id,part:partOf(o.name,id)};}
 return {id:'OTHER',part:null};
}
function partOf(n,id){
 // E_KAPAK and E_KOSE are carton-folding tools, not enclosure covers.
 if(id==='E'&&/^E_SERVIS_L_/.test(n))return 'cover';
 if(id==='WASH'){
  if(/(UST_DOLAP_CAM_KAPAK|UST_DOLAP_KAPAK_|UST_DOLAP_MENTESE|UL_(KAPAK|KULP)|UL_ALT_SERVIS_KAPAK|KIMYASAL_(KAPALI_KAPAK|GOMME_KOL)|KARTON.*(KAPAK|MENTESE)|SOKULUR_BAZA)/.test(n))return 'cover';
  if(/(YAN_PANEL|ARKA_SERVIS_PANEL|UL_GOVDE|UST_DOLAP_(ALT|TAVAN|ON_UST_KUSAK)|TASIYICI_DIKME|YATAY_KUSAK|KARTON.*(YAN|ARKA|TAVAN)|KARTON_DEPO_SAC)/.test(n))return 'frame';
  return null;
 }
 if(id==='ROB')return /^(UR\d+E?|UR_|TUTUCU|Tool$|DT_ROBOT|IKIZ_J)|^ROBOT\d+_(UR_|ADAPTOR|ROBOT_)/.test(n)?'robot':'ray';
 if(id==='QR'){
  if(/(GOZ_.*(KAPI|KAPAK)|QR.*(KAPI|KAPAK|DOOR|COVER)|QR_GOZ_NUMARA|QR62.*(door|cover)|DT_QR.*(KAPAK|KULP|MENTESE))/i.test(n))return 'cover';
  if(/^(QR_GOVDE|QR_GOZLER__(celik|aluminyum)$|QR62.*(wall|roof|floor|face|panel))/.test(n)||/^DT_QR_GOVDE_(SOL_YAN|SAG_YAN|KAPALI_BAZA|TAVAN|TABAN|YAN_SPINE|PIN_(UST|ALT|SOL|SAG|EKRAN_UST|QR_GOMME_YUZ))/.test(n))return 'frame';
  return null;
 }
 if(['A','TOP','F','UF','K','E','B','COMMON'].includes(id)){
  if(/_PANO__kapak(?:$|__)/i.test(n))return 'cover';
  if(/^(TOPPING_MODUL__on_seffaf|TOPPING_EMNIYET_KAPAK|TOPPING_PANO__kapak|A_ONYUZ__|CEK_.*__on_seffaf|ELK_ANA_PANO_UF__.*__KAPAK_ANA_PANO)/i.test(n))return 'cover';
  if(/(GOVDE.*on_seffaf|^(K_KAPI|F_UST_KAPAK)|^B_.*(KAPI|KAPAK)|^U_.*on_seffaf)/i.test(n))return 'cover';
  if(/^(A_GOVDE|TOPPING_GOVDE|E_GOVDE|K_GOVDE|U_[A-Z]+_GOVDE|F_UST_KABIN|B_KASA)/.test(n))return 'frame';   // QR-6e: TP10 oven body and B depot are inner devices
  if(id==='E'&&/^E_SHELL\d+_ROOF|_LOWER_SKIRT\d*_/.test(n))return 'frame';
 }
 return null;
}
export function katmanMotoru(scene,productOwner=()=>null){
 const assemblyReport=montajSahiplikKur(scene);
 const state=Object.fromEntries(KATMANLAR.map(([id])=>[id,{show:true,cover:'normal',frame:'normal',sasi:'normal',ic:'normal'}]));
 const master={machine:true,isolate:null,iskeletRenk:false};   // iskeletRenk = ANLAŞILIR RENK modu (24 Eki: 'Gerçek renk' anahtarı kapalı)
 const planes=Object.fromEntries(Object.entries(IZOLASYON_SINIR).map(([k,b])=>[k,[new T.Plane(new T.Vector3(1,0,0),-b[0]),new T.Plane(new T.Vector3(-1,0,0),b[1]),new T.Plane(new T.Vector3(0,1,0),-b[2]),new T.Plane(new T.Vector3(0,-1,0),b[3]),new T.Plane(new T.Vector3(0,0,1),-b[4]),new T.Plane(new T.Vector3(0,0,-1),b[5])]]));
 const cutMaterials=new Map();
 function clipped(m,key){if(!key)return m;let by=cutMaterials.get(m);if(!by){by=new Map();cutMaterials.set(m,by);}if(!by.has(key)){const c=stilKopyala(m);c.clippingPlanes=[...(m.clippingPlanes||[]),...(key.startsWith('X_')?planes[key.slice(2)].slice(0,2):planes[key])];c.clipIntersection=false;c.clipShadows=true;by.set(key,c);}return by.get(key);}
 const records=new Map(),clones=new Map(),normals=new Map(),finish=disYuzeyKur();
 // İSKELET (22 Eki): userData.iskelet 'ana' = red, 'ara' = yellow while "İskelet renkli" is on.
 // ANLAŞILIR RENK STANDARDI (Kemal 24 Eki gece): makine, robot, QR, yıkama, personel aynı tablo. 'Gerçek renk' kapalıyken uygulanır.
 const ISKELET_RENK={ana:0xd62828,ara:0xf2c200,sac:0xc9ced3,kapak:0x3b82f6,mekanizma:0x22a06b,kanal:0xf28c28,elektrik:0x8b5cf6,yalitim:0xf4f1e8,sogutma:0x22c3d6,vida:0x5b6670},tints=new Map();
 const RENKLI_IDS=new Set(['A','TOP','F','UF','K','E','UKE','B','COMMON','ROB','QR','WASH','PERSONEL']);
 // 24 Eki (Kemal): anlaşılır renkte YALNIZ iskelet boyanır — taşıyıcı (ana) kırmızı, bağlantı / ara elemanlar sarı; sac, kapak, kanal,
 // elektrik kendi renginde kalır; mekanizmalar modülün istasyon / mekanizma kod rengiyle (köşe rengi 'renkMek') gösterilir.
 // 27 Eki (Kemal: "diğerine basınca her şey daha kolay anlaşılsın diye renklere bölünecek"): anlaşılır renkte HER parça grubunun rengini alır —
 // iskelet ana kırmızı · ara sarı · sac açık gri · kapak mavi · iç sistem / mekanizma yeşil (yeni makine mekanizmaları modülün kod renginde) ·
 // kablo kanalı turuncu · elektrik mor · yalıtım krem · soğutma turkuaz · vida koyu gri. Ürün / malzeme ve ekranlar kendi renginde.
 function renkSinifi(r){
  if(!RENKLI_IDS.has(r.id)||r.malzeme||r.product!=null||r.o.userData.dtScreenDepthMask||r.o.isLine||r.o.isLineSegments)return null;
  const k=iskeletEtiketi(r.o);if(k)return k;
  let rs=null;for(let a=r.o;a&&!rs;a=a.parent)rs=a.userData?.renkSinif||null;
  if(rs==='gercek')return null;
  const mek=!!r.o.geometry?.attributes?.renkMek;
  if(rs==='mekanizma')return mek?null:'mekanizma';
  if(rs&&ISKELET_RENK[rs])return rs;
  if(r.electrical?.part||/KABLO|KANAL|kanal|kablo|_DIN_|PANO|SIGORTA|ELK_/.test(r.o.name||''))return /KANAL|kanal|OLUK/.test(r.o.name||'')?'kanal':'elektrik';
  if(r.part==='frame')return 'sac';if(r.part==='cover')return 'kapak';if(r.part==='sasi')return 'ana';
  if(r.part==='robot'||r.part==='ray'||r.part==='ic'||!r.part)return mek?null:'mekanizma';
  return null;}
 function mekRenk(r,acik){const g=r.o.geometry;if(!g||!g.attributes.renkMek)return;if(!g.userData.renkGercek)g.userData.renkGercek=g.attributes.color;const hedef=acik?g.attributes.renkMek:g.userData.renkGercek;if(g.attributes.color!==hedef)g.setAttribute('color',hedef);}
 function iskeletEtiketi(o){for(let a=o;a;a=a.parent){const k=a.userData?.iskelet;if(k==='ana'||k==='ara')return k;}return null;}
 function tint(m,k){let by=tints.get(m);if(!by){by={};tints.set(m,by);}if(!by[k]){const c=stilKopyala(m);c.color?.setHex(ISKELET_RENK[k]);if(c.map)c.map=null;if(c.emissive)c.emissive.setHex(ISKELET_RENK[k]).multiplyScalar(.18);if('vertexColors'in c)c.vertexColors=false;c.needsUpdate=true;by[k]=c;}return by[k];}
 // 27 Eki (Kemal: "kasetler şeffaftı"): normal görünüm malzemenin KENDİ saydamlığını korur (kaset PC kapakları, pleksi, cam); opaklaştırma yalnız açıkça istenen malzemede
 function normal(m){if(!m.userData?.normalOpak)return m;if(m.opacity>=.98&&!(m.transmission>0))return m;if(!normals.has(m)){const c=stilKopyala(m);c.opacity=1;c.transparent=false;c.depthWrite=true;if('transmission'in c)c.transmission=0;normals.set(m,c);}return normals.get(m);}
 const mapMaterial=(m,fn)=>Array.isArray(m)?m.map(fn):fn(m);
 function fade(m){if(!clones.has(m)){const c=stilKopyala(m);c.transparent=true;c.opacity=Math.min(m.opacity,.14);c.depthWrite=false;clones.set(m,c);}return clones.get(m);}
 function apply(r){
  if(r.o.userData.assemblySource||r.o.userData.assemblyDuplicate){r.o.layers.mask=0;return;}
  if(r.product!=null)r.id=productOwner(r.product)||'OTHER';
  const iso=master.isolate,electricalView=iso==='ELECTRICAL',station=iso&&iso!=='MACHINE'&& !electricalView,shared=r.id==='COMMON'||r.id==='POWER',inside=MAKINE_IDS.includes(r.id);
  let show=state[r.id]?.show&&(!inside||master.machine),cut=null;
  if(r.id==='POWER'&&r.host)show=state.POWER.show&&state[r.host].show&&(r.host!=='COMMON'||master.machine);
  if(master.malzemeYalniz)show=!!r.malzeme;else if(r.malzeme&&!state.MALZEME.show)show=false;
  if(r.malzeme&&!master.malzemeYalniz&&MAKINE_IDS.includes(r.id)&&state[r.id]?.ic==='hidden')show=false;   // 24 Eki: istasyonun iç sistemi gizliyken içindeki karton / ürün de gizli (şasi görünümünde kutu parçası kalmaz)
  if(electricalView){show=!!r.electrical&&state.ELECTRICAL.show;}
  else if(iso==='MACHINE'){show=inside||r.id==='POWER';if(shared&&r.part!=='cover')cut='MACHINE';}
  else if(station){
   show=r.id===iso;
   if(iso==='A'&&(/^TOPPING_(MODUL|DONER|X_SENSOR|TABLA_MOTOR)/.test(r.o.name)||r.o.userData.top58Transfer)){show=true;cut='A';}
   if(r.id==='TOP'&&iso==='TOP'&&(!r.part||r.part==='ic'))cut=r.o.userData.top57?'TOP58':'TOP';
   if(shared&&IZOLASYON_SINIR[iso]){const route=/kablo|kanal|hortum|HAVA_|ELK_|BINA_|DUKKAN_SERVIS|ROBOT25_/.test(r.o.name);show=route&&(!r.owners||r.owners.includes(iso));cut=iso;}
   if(r.id==='COMMON'&&['ROB','QR','WASH','KIOSK'].includes(iso))show=false;
   // Robot-cell / building power belongs to its host row only (same as the panel's "Yalnız").
   if(r.id==='POWER'&&(r.host==='ROB'||r.host==='SHOP'))show=iso===r.host;
   if(r.id==='POWER'&&['QR','KIOSK','WASH'].includes(iso))show=show&&(iso==='QR'?/QR/.test(r.o.name):iso==='KIOSK'?/KIOSK/.test(r.o.name):/BULASIK|YIKAMA/.test(r.o.name));
   if(iso==='POWER')show=r.id==='POWER';
   // Own assemblies remain complete. Only merged/shared routes are sectioned.
   // This avoids pulling a neighbouring oven component into K/E from a broad
   // common mesh while preserving real brackets and transfer lips at interfaces.
   // An owned body/door/drawer stays complete, including its feet and open
   // travel. Only shared routes below need a sectional boundary.
   if(show&&(!r.part||r.part==='ic')&&/kablo|hortum|kanal|KABLO|ZINCIR_UR_KONTROL/.test(r.o.name)&&IZOLASYON_SINIR[iso])cut=iso;
  }
  if(!iso&&r.electrical&&!state.ELECTRICAL.show)show=false;
  const part=electricalView?r.electrical?.part:r.part;
  const control=electricalView?state.ELECTRICAL:(station&&shared&&iso!=='POWER')?state[iso]:state[r.id];
  let mode=part?control?.[part]||'normal':'normal';
  // "Sac kapakları gizle" = whole outer shell: cladding plus doors / leaves; skeleton, shelves and inner system stay.
  if(part==='cover'&&mode==='normal'&&control?.frame&&control.frame!=='normal')mode=control.frame;
  r.o.layers.mask=show&&mode!=='hidden'?r.mask:0;
  let wanted=part?(mode==='glass'?r.faded:r.normal):r.material;
  if(master.iskeletRenk){const k=renkSinifi(r);if(k)wanted=mapMaterial(wanted,m=>tint(m,k));}
  mekRenk(r,master.iskeletRenk);
  r.o.material=mapMaterial(wanted,m=>clipped(m,cut));
 }
 // Placement is part of the signature: a module that moves/scales a group after the first
 // scan (e.g. wash T70 rebuild) changes the geometric tests, so the part is reclassified.
 function imza(o){const e=o.matrixWorld.elements;let s=[e[0],e[5],e[10],e[12],e[13],e[14]].map(v=>Math.round(v*100)).join(',')+'#';for(let a=o,i=0;a&&i<6;a=a.parent,i++)s+=(a.name||'')+'|'+(a.userData?.assemblyOwner||'')+'|'+(a.userData?.assemblySourceName||'')+'|'+(a.userData?.kapakIstasyon||'')+'|'+(a.userData?.katman||'')+'/';return s;}
 function scan(){montajSahiplikKur(scene);scene.updateMatrixWorld(true);scene.traverse(o=>{
  if(!(o.isMesh||o.isLine||o.isPoints))return;
  // QR-6f: a station module may rename / re-own / re-tag a part after the first scan.
  // The record keeps a signature; any change reclassifies it (layers never go stale).
  const sig=imza(o),old=records.get(o);
  if(old){if(old.sig===sig)return;const c=katmanSinif(o);for(const k of['id','part','owners','product','malzeme','iskelet','kabuk','ic','host','etiket'])delete old[k];Object.assign(old,c,{sig});if(old.part&&!old.normal){old.normal=mapMaterial(old.material,normal);old.faded=mapMaterial(old.material,fade);}apply(old);return;}
  const c=katmanSinif(o);
  // Unnamed fasteners wholly inside the enclosure are machine parts. Building
  // meshes and unclassified outside parts remain independently recoverable.
  if(c.id==='OTHER'&&o.geometry){o.geometry.computeBoundingBox();const b=o.geometry.boundingBox?.clone().applyMatrix4(o.matrixWorld);if(b&&b.min.x>=machineBox[0]&&b.max.x<=machineBox[1]&&b.min.y>=machineBox[2]&&b.max.y<=machineBox[3]&&b.min.z>=machineBox[4]&&b.max.z<=machineBox[5])c.id='COMMON';}
  o.material=mapMaterial(o.material,m=>finish(o,c,m));const r={o,...c,sig,electrical:elektrikSinif(o),mask:o.layers.mask,material:o.material};
  if(r.part||r.electrical?.part){r.normal=mapMaterial(r.material,normal);r.faded=mapMaterial(r.material,fade);}records.set(o,r);apply(r);
 });}
 function prune(){for(const[o]of records){let a=o;while(a&&a!==scene)a=a.parent;if(!a)records.delete(o);}}
 function update(){scan();for(const r of records.values())apply(r);}
 function audit(){const id=master.isolate,b=IZOLASYON_SINIR[id];if(!b)return {selection:id};scene.updateMatrixWorld(true);const outside=[];for(const r of records.values()){if(!r.o.layers.mask||!r.o.isMesh)continue;let vis=true;for(let a=r.o;a;a=a.parent)if(!a.visible)vis=false;if(!vis)continue;const box=r.o.geometry.boundingBox?.clone().applyMatrix4(r.o.matrixWorld);if(!box||box.getSize(new T.Vector3()).length()<.001)continue;const mat=Array.isArray(r.o.material)?r.o.material[0]:r.o.material;if(!mat.clippingPlanes?.length&&[box.min.x<b[0]-.01,box.max.x>b[1]+.01,box.min.y<b[2]-.01,box.max.y>b[3]+.01,box.min.z<b[4]-.01,box.max.z>b[5]+.01].some(Boolean))outside.push({name:r.o.name,owner:r.id,min:box.min.toArray(),max:box.max.toArray()});}return {selection:id,outside,duplicates:assemblyReport.duplicates.length,duplicateComponents:assemblyReport.duplicateComponents};}
 function set(id,patch){if(!state[id])return;if('show' in patch&&!(id==='ELECTRICAL'&&master.isolate==='ELECTRICAL'))master.isolate=null;Object.assign(state[id],patch);update();}
 function reset(){master.machine=true;master.isolate=null;master.malzemeYalniz=false;for(const s of Object.values(state))Object.assign(s,{show:true,cover:'normal',frame:'normal',sasi:'normal',ic:'normal',robot:'normal',ray:'normal'});update();}
 function only(id){master.machine=true;master.isolate=id;for(const [key,s]of Object.entries(state))s.show=key===id||key==='ELECTRICAL';if(id==='ELECTRICAL')Object.assign(state.ELECTRICAL,{cover:'glass',frame:'glass'});update();}
 function setMachine(show){master.isolate=null;master.machine=show;update();}
 function onlyMachine(){master.machine=true;master.isolate='MACHINE';for(const[id,s]of Object.entries(state))s.show=MAKINE_IDS.includes(id)||id==='ELECTRICAL';update();}
 function setMachinePart(key,value){for(const id of MAKINE_IDS)state[id][key]=value;update();}
 // 27 Eki: bir modül parçanın malzemesini SONRADAN değiştirirse kayıt da güncellenir (yoksa her saniyeki apply eski malzemeyi geri yazar)
 function malzemeDegistir(o,m){const r=records.get(o);o.material=m;if(r){r.material=m;if(r.part||r.electrical?.part){r.normal=mapMaterial(m,normal);r.faded=mapMaterial(m,fade);}apply(r);}}
 return {prune,malzemeDegistir,audit,assemblyReport,state,master,setMachine,onlyMachine,setMachinePart,scan,update,set,reset,only,products:()=>{for(const r of records.values())if(r.product!=null)apply(r);},counts:()=>Object.fromEntries(KATMANLAR.map(([id])=>[id,[...records.values()].filter(r=>id==='ELECTRICAL'?r.electrical&&!r.o.userData.assemblySource&&!r.o.userData.assemblyDuplicate:r.id===id).length]))};
}
export function katmanlarKur(T,scene,IKIZ){
 if(IKIZ.katmanlar)return IKIZ.katmanlar;
 if(IKIZ.sahne?.renderer)IKIZ.sahne.renderer.localClippingEnabled=true;
 const motor=katmanMotoru(scene,id=>{const u=IKIZ.son?.urunler?.find(u=>Number(u.id)===id),yer=String(u?.yer||'').toUpperCase();if(/^(QR)/.test(yer))return 'QR';if(/^(ROB|ELDE)/.test(yer))return 'ROB';if(yer==='TABLA')return 'TOP';if(/^(CEK|B)/.test(yer))return 'B';if(/^[AFKE]/.test(yer))return yer[0];return null;});IKIZ.katmanlar=motor;
 if(typeof document==='undefined'){motor.scan();return motor;}
 // QR-6 (Kemal 22 Eki): one tree — MAKİNE ▸ stations, QR, YIKAMA. Each row: eye, hide sheet panels, hide covers.
 const AGAC=[
  {id:'MAKINE',ad:'MAKİNE',grup:true,uyeler:MAKINE_IDS,alt:[
   {id:'A',ad:'A · Hamur açıcı',uyeler:['A']},{id:'TOP',ad:'TOPPING',uyeler:['TOP']},{id:'F',ad:'FIRIN',uyeler:['F','UF']},
   {id:'K',ad:'K · Sprey / kesme',uyeler:['K']},{id:'E',ad:'E · Kutu katlama',uyeler:['E','UKE']},{id:'B',ad:'B · Soğuk dolap',uyeler:['B']}]},
  {id:'ROB',ad:'ROBOT + RAY',uyeler:['ROB'],secenek:[['robot','Robotu gizle'],['ray','Rayı gizle']]},
  {id:'QR',ad:'QR DOLABI',uyeler:['QR']},
  {id:'WASH',ad:'YIKAMA',uyeler:['WASH']},
  {id:'EKRAN',ad:'SİPARİŞ EKRANLARI',uyeler:['KIOSK','EKRAN'],secenek:false},
  {id:'SHOP',ad:'DÜKKÂN',uyeler:['SHOP'],secenek:false},
  {id:'PERSONEL',ad:'PERSONEL',uyeler:['PERSONEL']},   // 24 Eki: tezgâh makine yöntemiyle → sac / kapak / şasi / iç seçenekleri
  {id:'MALZEME',ad:'MALZEMELER',uyeler:['MALZEME'],secenek:[['malzeme','Malzemeleri gizle']]}];
 const style=document.createElement('style');style.textContent=`
 #css3d [data-layer-hidden="true"]{display:none!important;visibility:hidden!important}
 #katmanDugme{position:absolute;left:90px;top:80px;z-index:38;background:#202a34;color:white;border:1px solid #62717e;border-radius:9px;padding:6px 11px;cursor:pointer;font:600 11px system-ui}
 #katmanPanel{position:absolute;left:90px;top:118px;z-index:39;width:292px;max-width:calc(100vw - 110px);max-height:calc(100vh - 200px);overflow:auto;background:#14202bf5;color:#eff5fa;border:1px solid #62717e;border-radius:10px;padding:8px 9px;font:11px system-ui;box-shadow:0 8px 25px #0008}
 #katmanPanel[hidden]{display:none}
 #katmanPanel .kt-ust{display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;gap:6px}
 #katmanPanel button{background:#293743;color:#fff;border:1px solid #5b7181;border-radius:5px;padding:3px 7px;cursor:pointer;font:11px system-ui}
 #katmanPanel .kt-satir{border-top:1px solid #33444f;padding:5px 0}
 #katmanPanel .kt-bas{display:flex;align-items:center;gap:6px}
 #katmanPanel .kt-ad{flex:1;font-weight:600}
 #katmanPanel .kt-grup>.kt-bas .kt-ad{font-weight:800;letter-spacing:.04em}
 #katmanPanel .kt-alt{margin:4px 0 0 13px;border-left:2px solid #40515e;padding-left:8px}
 #katmanPanel .kt-sec{display:flex;flex-wrap:wrap;row-gap:2px;gap:10px;margin:3px 0 0 26px;color:#c9d6e0}
 #katmanPanel .kt-sec label{display:flex;gap:3px;align-items:center;cursor:pointer;white-space:nowrap}
 #katmanPanel .kt-sec input{margin:0;width:12px;height:12px}
 #katmanPanel [data-goz]{width:24px;height:20px;padding:0;display:inline-flex;align-items:center;justify-content:center}
 #katmanPanel [data-goz][aria-pressed=false]{opacity:.5}
 #katmanPanel [data-iskelet][aria-pressed=true]{background:#2f6b45;border-color:#7fd19b}
 #katmanPanel [data-iskelet][aria-pressed=false]{background:#8a1f1f;border-color:#f2c200}
 `;document.head.append(style);
 const host=document.getElementById('sahne')||document.body,button=document.createElement('button'),panel=document.createElement('section');button.id='katmanDugme';button.textContent='◉ Katmanlar';button.setAttribute('aria-expanded','false');button.setAttribute('aria-controls','katmanPanel');panel.id='katmanPanel';panel.hidden=true;panel.setAttribute('aria-label','Katmanlar');host.append(button,panel);
 button.onclick=()=>{panel.hidden=!panel.hidden;button.setAttribute('aria-expanded',String(!panel.hidden));};
 panel.innerHTML='<div class="kt-ust"><strong>Katmanlar</strong><span><button data-iskelet aria-pressed="true" title="Açık: her parça gerçek malzeme renginde. Kapalı: anlaşılır renk — taşıyıcı iskelet kırmızı, bağlantı / ara elemanlar sarı, mekanizmalar istasyon mekanizma renkleriyle; sac ve diğerleri kendi renginde">Gerçek renk</button> <button data-reset>Tümünü göster</button> <button data-close aria-label="Kapat">✕</button></span></div><div data-agac></div>';
 const satirlar=[];
 const goster=(uyeler,deger)=>{for(const id of uyeler)if(motor.state[id])motor.state[id].show=deger;};
 function satir(dugum,kok){
  const row=document.createElement('div');row.className='kt-satir'+(dugum.grup?' kt-grup':'');row.dataset.layer=dugum.id;
  row.innerHTML=`<div class="kt-bas"><button data-goz aria-pressed="true" aria-label="${dugum.ad} göster / gizle"></button><span class="kt-ad">${dugum.ad}</span></div>`;
  const secenek=dugum.secenek===false?[]:dugum.secenek||[['frame','Sac kapakları gizle'],['cover','Kapakları gizle'],['sasi','Şasiyi gizle'],['ic','İç sistemi gizle']];
  if(secenek.length)row.insertAdjacentHTML('beforeend','<div class="kt-sec">'+secenek.map(([k,l])=>`<label><input type="checkbox" data-part="${k}">${l}</label>`).join('')+'</div>');
  {const b=document.createElement('button');b.textContent='Yalnız';b.title=dugum.ad+' dışındakileri gizle';b.dataset.yalniz=dugum.id;
   b.onclick=e=>{e.stopPropagation();if(dugum.id==='MALZEME'){for(const s of Object.values(motor.state))s.show=true;motor.master.isolate=null;motor.master.machine=true;motor.master.malzemeYalniz=true;motor.update();sync();return;}motor.master.malzemeYalniz=false;const uyeler=new Set(dugum.grup?[...MAKINE_IDS]:dugum.uyeler);motor.master.isolate=null;motor.master.machine=true;
    for(const[id,s]of Object.entries(motor.state))s.show=uyeler.has(id)||id==='ELECTRICAL'||id==='POWER'||id==='MALZEME'||(id==='EKRAN'&&!uyeler.has('KIOSK'));
    motor.update();sync();};row.querySelector('.kt-bas').append(b);}
  row.querySelector('[data-goz]').onclick=e=>{e.stopPropagation();motor.master.isolate=null;
   if(dugum.grup)motor.master.machine=!motor.master.machine;
   else{const acik=dugum.uyeler.some(id=>motor.state[id]?.show);goster(dugum.uyeler,!acik);}
   motor.update();sync();};
  if(dugum.id==='MALZEME'){const k=row.querySelector('input[data-part="malzeme"]');k.onchange=()=>{motor.master.malzemeYalniz=false;motor.state.MALZEME.show=!k.checked;motor.update();sync();};}
  else for(const kutu of row.querySelectorAll(':scope > .kt-sec input'))kutu.onchange=()=>{const hedef=dugum.grup?[...MAKINE_IDS]:dugum.uyeler;for(const id of hedef)if(motor.state[id])motor.state[id][kutu.dataset.part]=kutu.checked?'hidden':'normal';motor.update();sync();};
  kok.append(row);satirlar.push([dugum,row]);
  if(dugum.alt){const alt=document.createElement('div');alt.className='kt-alt';row.append(alt);for(const c of dugum.alt)satir(c,alt);}
 }
 for(const d of AGAC)satir(d,panel.querySelector('[data-agac]'));
 const gozSvg=acik=>'<svg width="16" height="12" viewBox="0 0 24 18" aria-hidden="true"><path d="M1 9Q12 -4 23 9Q12 22 1 9Z" fill="none" stroke="currentColor" stroke-width="1.7"/><circle cx="12" cy="9" r="3" fill="currentColor"/>'+(acik?'':'<path d="M2 1L22 17" stroke="#f8b54b" stroke-width="2.5"/>')+'</svg>';
 function sync(){
  for(const[d,row]of satirlar){
   const acik=d.grup?motor.master.machine:d.uyeler.some(id=>motor.state[id]?.show);
   const eye=row.querySelector('[data-goz]');if(eye.getAttribute('aria-pressed')!==String(acik)||!eye.firstChild){eye.innerHTML=gozSvg(acik);eye.setAttribute('aria-pressed',String(acik));}
   const hedef=d.grup?MAKINE_IDS:d.uyeler;
   if(d.id==='MALZEME'){const k=row.querySelector('input[data-part="malzeme"]');k.checked=!motor.state.MALZEME.show;k.indeterminate=false;continue;}
   for(const kutu of row.querySelectorAll(':scope > .kt-sec input')){const v=new Set(hedef.filter(id=>motor.state[id]).map(id=>motor.state[id][kutu.dataset.part]));kutu.indeterminate=v.size>1;kutu.checked=v.size===1&&v.has('hidden');}
  }
  for(const[id,key]of [['tv','QR'],['qrpin','QR'],['machine','A'],['pos','SHOP'],['kiosk','KIOSK']]){document.querySelectorAll(`iframe[data-ekran="${id}"]`).forEach(f=>{const visible=!(motor.master.isolate==='ELECTRICAL'&&motor.state.ELECTRICAL.frame==='hidden')&&((motor.master.isolate==='ELECTRICAL'&&motor.state.ELECTRICAL.show)||(motor.state.EKRAN.show&&motor.state[key].show&&motor.state.ELECTRICAL.show&&(!MAKINE_IDS.includes(key)||motor.master.machine)));f.parentElement.dataset.layerHidden=String(!visible);f.parentElement.style.setProperty('visibility',visible?'visible':'hidden','important');});}
 }
 panel.querySelector('[data-reset]').onclick=()=>{motor.reset();sync();};
 {const b=panel.querySelector('[data-iskelet]');const yaz=()=>{b.textContent=motor.master.iskeletRenk?'Renk: anlaşılır':'Renk: gerçek';b.setAttribute('aria-pressed',String(!motor.master.iskeletRenk));};yaz();b.onclick=()=>{motor.master.iskeletRenk=!motor.master.iskeletRenk;yaz();motor.update();};}   // 27 Eki (Kemal: "gerçek renk dedim, hâlâ sarı"): düğme hep 'Gerçek renk' yazıyordu, basınca anlaşılıra geçiyordu → artık o anki modu yazarpanel.querySelector('[data-close]').onclick=()=>button.click();
 for(const type of['pointerdown','pointerup','click','dblclick','wheel'])panel.addEventListener(type,e=>e.stopPropagation());
 let elapsed=1;IKIZ.kancalar.push(dt=>{motor.products();elapsed+=dt;if(elapsed>=1){elapsed=0;motor.update();sync();}});
 motor.scan();sync();
 const sinifsiz=motor.counts().OTHER;console.info('[katmanlar] sınıfsız mesh:',sinifsiz);IKIZ.katmanSinifsiz=sinifsiz;
 return motor;
}
