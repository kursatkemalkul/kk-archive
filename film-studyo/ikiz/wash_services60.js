import {carriers63} from './wash_carriers63.js';
import {solidTools42} from './wash_solid61.js';
// Custom installation routes in metres. Device internals remain manufacturer-controlled.
export function washServices60(T,F,root,MAT){
 const steel=MAT.paslanmaz,black=MAT.siyah,cold=new T.MeshStandardMaterial({color:0x428ba4}),hot=new T.MeshStandardMaterial({color:0xb66551}),drain=new T.MeshStandardMaterial({color:0x74827b});
 const ports={},routes=[],fixings=[],curves=new Map();
 function route(name,points,r,mat,type='hose'){
  const curve=new T.CurvePath();let last=new T.Vector3(...points[0]);
  for(let i=1;i<points.length-1;i++){
   const p=new T.Vector3(...points[i]),prev=new T.Vector3(...points[i-1]),next=new T.Vector3(...points[i+1]),u=p.clone().sub(prev),v=next.clone().sub(p),la=u.length(),lb=v.length();u.normalize();v.normalize();const angle=Math.acos(Math.max(-1,Math.min(1,u.dot(v))));
   if(angle<1e-5){curve.add(new T.LineCurve3(last,p));last=p;continue;}
   const distance=Math.min(.045*Math.tan(angle/2),la*.35,lb*.35),radius=distance/Math.tan(angle/2),a=p.clone().addScaledVector(u,-distance),b=p.clone().addScaledVector(v,distance),normal=v.clone().addScaledVector(u,-Math.cos(angle)).normalize(),center=a.clone().addScaledVector(normal,radius),axis=new T.Vector3().crossVectors(u,v).normalize(),radial=a.clone().sub(center);
   curve.add(new T.LineCurve3(last,a));class Arc extends T.Curve{getPoint(t,target=new T.Vector3()){return target.copy(radial).applyAxisAngle(axis,angle*t).add(center)}}curve.add(new Arc());last=b;
  }
  curve.add(new T.LineCurve3(last,new T.Vector3(...points.at(-1))));
  const m=new T.Mesh(new T.TubeGeometry(curve,Math.max(64,points.length*16),r,12,false),mat);m.name='YIKAMA__'+name;root.add(m);m.userData={wash60:true,type,outerDiameter_mm:r*2000,routeEnds:[points[0],points.at(-1)],source:'installation design; factory port confirmation required'};F.parts.push(m);routes.push({name,points,outerDiameter_mm:r*2000,length_m:curve.getLength(),type});curves.set(name,{curve,r,mesh:m});return m;
 }
 function port(name,p,kind){ports[name]={position:p,kind,approval:kind==='OEM'?'manufacturer port position to confirm':'building interface to verify on site'};return p;}
 const dwWater=port('MEIKO_WATER',[2.081,.170,2.118],'OEM'),dwDrain=port('MEIKO_DRAIN',[2.4995,.1205,2.073],'OEM'),dwPower=port('MEIKO_POWER',[2.3725,.150,2.160],'OEM');
 const coldSupply=port('BUILDING_COLD',[2.720,-.075,2.215],'building'),hotSupply=port('BUILDING_HOT',[3.020,-.075,2.290],'building'),sewer=port('BUILDING_DN50',[2.930,-.075,2.286],'building'),power=port('BUILDING_400V_3NPE',[3.100,-.075,2.290],'building');
 // Sealed floor sleeves remain entirely within the wash cabinet footprint.
 for(const [name,p,outer,inner]of [['SOGUK',coldSupply,.022,.010],['SICAK',hotSupply,.022,.010],['GIDER_DN50',sewer,.045,.026],['BESLEME',power,.018,.007]])F.ring('ALTTAN_GIRIS_SIZDIRMAZ_YAKA_'+name,p[0],-.003,p[2],outer,inner,.006,root,black);
 // Accessible isolation valves below bowl, above the chemical compartment roof.
 const c=port('COLD_MANIFOLD',[2.720,.535,1.990],'valve'),h=port('HOT_MANIFOLD',[3.020,.535,1.990],'valve'),dwBranch=[2.720,.515,1.990],tapBranch=[2.740,.535,1.990];
 F.pin('SOGUK_MANIFOLD_ALT_DAL',dwBranch,c,.006);F.pin('SOGUK_MANIFOLD_YAN_DAL',c,tapBranch,.006);
 route('SEBEKE_SOGUK',[coldSupply,[2.720,.535,2.215],c],.009,cold,'fixed water pipe');
 route('SEBEKE_SICAK',[hotSupply,[3.020,.535,2.290],h],.009,hot,'fixed water pipe');
 route('MEIKO_SU_HORTUMU',[dwWater,[2.081,.170,2.220],[2.081,.210,2.220],[2.720,.210,2.220],[2.720,.515,2.220],dwBranch],.009,cold);
 route('BATARYA_SOGUK',[tapBranch,[2.740,.600,2.215],[2.865,.600,2.215],[2.865,.680,2.270]],.006,cold);
 route('BATARYA_SICAK',[h,[3.020,.600,2.290],[2.901,.600,2.290],[2.901,.680,2.270]],.006,hot);
 for(const [i,p]of [c,h].entries()){
  const [x,y,z]=p;F.pin('ERISILEBILIR_SU_KESME_VANASI_'+i,[x,y,z-.020],[x,y,z+.020],.014);F.pin('VANA_KOLU_'+i,[x,y+.018,z],[x+.035,y+.018,z],.004);
 }
 F.rhs('VANA_TASIYICI_20_20_2',[2.677,.485,2.015],[3.122,.485,2.015],.020,.020);
 // Laser relief in the non-load-bearing divider lets the rail meet the side RHS.
 const divider63=F.parts.find(o=>o.name==='YIKAMA__KIMYASAL_SOL_AYIRICI');
 if(divider63){divider63.updateMatrixWorld(true);const relief=new T.BoxGeometry(.006,.022,.022);relief.translate(2.67825,.485,2.015);relief.applyMatrix4(divider63.matrixWorld.clone().invert());divider63.geometry=solidTools42(T).subtract(divider63.geometry,[relief]);divider63.userData.valveRailRelief63_mm=[6,22,22];}
 for(const x of [2.6645,3.1345])F.rhs('VANA_SASI_YAN_25_20_2',[x,.485,1.5375],[x,.485,2.289],.025,.020,.002);
 for(const x of [2.720,3.020]){F.plate('VANA_TASIYICI_ON_TAB',[x-.008,x+.008,.495,.497,1.970,2.025]);F.pin('VANA_TASIYICI_ALT_DESTEK',[x,.497,1.978],[x,.521,1.978],.003);}
 // Pumped dishwasher outlet discharges over an open receptor,50mm air gap.
 const discharge=port('DW_AIR_GAP_OUTLET',[2.800,.450,2.265],'air gap');
 route('MEIKO_TAHLIYE_HORTUMU',[dwDrain,[2.4995,.1205,2.235],[2.4995,.300,2.265],[2.700,.300,2.265],[2.700,.530,2.265],[2.740,.590,2.265],[2.800,.530,2.265],discharge],.011,drain);
 const profile=new T.Shape();profile.moveTo(.035,.400);profile.lineTo(.020,.345);profile.lineTo(.020,.300);profile.lineTo(.018,.300);profile.lineTo(.018,.345);profile.lineTo(.033,.400);profile.closePath();const funnel=new T.Mesh(new T.LatheGeometry(profile.getPoints(),40),drain);funnel.name='YIKAMA__ACIK_TAHLIYE_HUNISI_50MM_HAVA_ARALIGI';funnel.position.set(2.8,0,2.265);root.add(funnel);F.parts.push(funnel);funnel.userData={type:'drain receptor',airGap_mm:50,proofRequired:'local plumbing/backflow approval'};
 route('HUNI_SIFON_DN40',[[2.8,.300,2.265],[2.8,.175,2.265],[2.8,.175,2.205],[2.8,.260,2.205],[2.8,.260,2.280],[2.883,.230,2.255]],.020,drain,'drain pipe');
 route('EVYE_TAHLIYE_DEVAMI',[[2.883,.230,2.255],[2.883,.230,2.280],[2.930,.210,2.286]],.020,drain,'drain pipe');
 route('ORTAK_GIDER_DN50',[[2.930,.210,2.286],sewer],.025,drain,'drain pipe');
 // Enclosed accessible load isolator; electrical route occupies the right dry edge.
 const isolator=new T.Group();isolator.name='YIKAMA__SIEMENS_3LD_ANA_AYIRICI_TASARIM';root.add(isolator);
 F.plate('AYIRICI_KUTU_IP65',[2.990,3.090,.680,.832,1.547,1.637],isolator,black);F.pin('AYIRICI_DONER_KOL',[3.040,.756,1.520],[3.040,.756,1.547],.022,isolator,new T.MeshStandardMaterial({color:0xd9b54d}));
 F.holed('AYIRICI_MONTAJ_BAGI',[3.090,3.147,.695,.817,1.637,1.640],'z',[[3.100,.750,.009]]);F.plate('AYIRICI_YAN_BUKUM',[3.147,3.1485,.695,.817,1.528,1.637]);
 isolator.userData={manufacturer:'Siemens',model:'3LD2064-1TC53',envelope_mm:[100,152,117],representation:'manufacturer drawing-derived; not OEM3DCAD',rating:'4pole16A, AC23A400V7.5kW, IP65, lockable OFF',source:'Siemens3LD2064-1TC53 datasheet2025',notCertifiedSafetyController:true};
 const isolatorIn=port('ISOLATOR_IN',[3.060,.842,1.590],'electrical terminal'),isolatorOut=port('ISOLATOR_OUT',[3.025,.670,1.590],'electrical terminal');
 for(const [i,p]of [isolatorIn,isolatorOut].entries())F.pin('AYIRICI_M20_RAKOR_'+i,[p[0],p[1]-.010,p[2]],[p[0],p[1]+.010,p[2]],.010,root,black);
 route('SEBEKE_KABLOSU',[power,[3.100,.750,2.290],[3.100,.750,1.600],[3.100,.842,1.600],isolatorIn],.006,black,'power cable');
 route('MEIKO_5G25_KABLO',[isolatorOut,[3.100,.670,1.600],[3.100,.670,2.285],[3.100,.150,2.270],[2.3725,.150,2.270],dwPower],.006,black,'power cable');
 F.pin('SASI_KAYNAKLI_PE_M6',[3.112,.200,2.3015],[3.122,.200,2.3015],.003);
 route('ES_POTANSIYEL_6MM2',[[3.112,.200,2.3015],[3.110,.200,2.240],[3.110,.065,2.200],[2.640,.065,2.200],[2.640,.180,2.180]],.0025,new T.MeshStandardMaterial({color:0x9ca43b}),'protective bonding conductor');
 // Retained pipe/cable clamps fasten to existing frame/partition; no suspended tails.
 const clampRows=[];
 for(const [i,name,t]of [[0,'MEIKO_SU_HORTUMU',.30],[1,'SEBEKE_SICAK',.25],[2,'MEIKO_5G25_KABLO',.46],[3,'MEIKO_TAHLIYE_HORTUMU',.32]]){
  const {curve,r,mesh}=curves.get(name);mesh.userData.clampIds=[...(mesh.userData.clampIds||[]),i];const p=curve.getPointAt(t),axis=curve.getTangentAt(t).normalize(),q=new T.Quaternion().setFromUnitVectors(new T.Vector3(0,1,0),axis);
  const clip=F.ring('TESISAT_P_KELEPCE_'+i,0,-.002,0,r+.003,r+.0008,.004);clip.quaternion.copy(q);clip.position.copy(p);clip.userData.clamp60=i;
  const liner=F.ring('KELEPCE_EPDM_'+i,0,-.0015,0,r+.0008,r,.003,root,black);liner.quaternion.copy(q);liner.position.copy(p);liner.userData.clamp60=i;
  clampRows.push({i,p,axis,r,clip});
 }
 carriers63(T,F,root,clampRows);
 for(const [i,x,lo,hi,anchorX]of [[0,2.0265,2.0115,2.0715,2.0515],[1,3.100,3.0895,3.1495,3.1325]]){
  F.holed('ZEMIN_ANKRAJ_TABANI_'+i,[lo,hi,0,.010,2.220,2.280],'y',[[anchorX,2.250,.0055]]);
  const section=(i===0?[[2.230,.010],[2.270,.010],[2.289,.150],[2.289,.180],[2.277,.180],[2.277,.151],[2.259,.022],[2.230,.022]]:[[2.230,.010],[2.270,.010],[2.289,.150],[2.277,.150],[2.259,.022],[2.230,.022]]).map(([z,y])=>[-z,y]);
  const cleat=F.fold('ZEMIN_ANKRAJ_12MM_BAG_'+i,section,.012,'x',x-.0125,x+.0125);if(i===1)F.plate('ZEMIN_ANKRAJ_POSTA_KAYNAKLI_UST_KOL',[3.0875,3.147,.150,.180,2.277,2.289]);cleat.userData={...cleat.userData,designWorkingTension_N:750,proofAnchorOnly_N:2000,substrateQualificationRequired:true};
  F.pin('ZEMIN_ANKRAJ_M10_'+i,[anchorX,-.070,2.250],[anchorX,.032,2.250],.005);
  F.ring('ZEMIN_ANKRAJ_PUL_'+i,anchorX,.010,2.250,.010,.0055,.002);F.ring('ZEMIN_ANKRAJ_SOMUN_'+i,anchorX,.012,2.250,.009,.005,.008,root,steel,6);
 }
 F.services60={ports,routes,fixings,airGap_mm:50,drainOutletHeight_mm:-75,buildingEntry:'through floor inside cabinet footprint',electricalDesign:{supply:'400V3NPE50Hz',load_kW:6.7,manufacturerFuse_A:16,cable:'5G2.5mm² preliminary; installation derating/length to verify',protectiveBonding_mm2:6,RCD:'typeB30mA where selected/required; confirm nameplate/local design'},requiresSupplierPortConfirmation:true};
 return F.services60;
}
