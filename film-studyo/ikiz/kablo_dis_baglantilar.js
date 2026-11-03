// External assembly harness. Coordinates are metres in the current Twin frame.
// Device pinouts tagged "planned" are procurement requirements, never OEM approval.
export function disBaglantilarKur(T,scene,IKIZ,h){
 const {ports,routes,devices,port,cable,box,retire,PROFIL,kabloYolu}=h;
 const inventory=[];
 function p(id,xyz,kind,owner='POWER'){if(!ports[id])port(id,xyz,kind,owner);return id;}
 function link(id,a,b,kind,via=[],owner='POWER',old=[]){return cable(id,a,b,kind,via,owner,old);}
 function load(id,supply,input,owner,purchased=true,notes='Supplier inlet/pinout verification pending'){
  devices.push({id,supply,input,outputs:[],kind:purchased?'purchased external assembly':'manufactured station'});
  inventory.push({id,owner,purchased,external_only:purchased,supply,input,notes,hardware_verified:false});
 }
 const supply=p('BUILDING.SUPPLY',[5.400,1.001,1.010],'AC400');
 p('WALL.IN',[5.450,1.001,1.010],'AC400');
 link('BUILDING-IN',supply,'WALL.IN','AC400');
 // Protected branch outputs exist inside our wall distribution panel.
 const wallOutputs=['PANEL.ROBOT_AC'];
 function wall(id,kind,idx){const q=p('WALL.'+id,[5.350+idx*.020,.997,kind==='AC400'?.750:.870],kind);wallOutputs.push(q);return q;}
 const isolatedIn=p('ISOLATOR.IN',[5.489,1.120,.950],'AC400');
 const isolatedOut=p('ISOLATOR.OUT',[5.489,1.300,.950],'AC400');
 const machineBranch=wall('MACHINE','AC400',0);ports[machineBranch].position=[5.489,.997,.950];link('W001',machineBranch,isolatedIn,'AC400');
 p('MAIN.AC_IN',[3.612,2.154,-.282],'AC400');
 link('W002',isolatedOut,'MAIN.AC_IN','AC400',[[5.489,1.650,.950],[5.489,1.650,-.520],[3.612,1.650,-.520],[3.612,2.154,-.520]]);
 devices.push({id:'WALL_DISTRIBUTION',supply:'WALL.IN',outputs:wallOutputs,kind:'protected branch distribution; breaker ratings require load study'});
 devices.push({id:'MACHINE_ISOLATOR',supply:isolatedIn,outputs:[isolatedOut],kind:'main machine isolator'});
 const mainOutputs=[];
 function main(id,kind,i){const q=p('MAIN.'+id,[3.410+i*.035,1.867,-.200],kind);mainOutputs.push(q);return q;}
 const stations=[['TOP',1.635,2.010,'W010'],['B',4.115,.360,'W011'],['K',4.115,1.500,'W012'],['E',4.730,1.500,'W013'],['A',1.280,1.600,'W016']];
 for(const [i,[id,x,y,no]] of stations.entries()){
  const start=main(id+'_AC','AC230',i),end=p(id+'.AC_IN',[x,y,-.830],'AC230',id);
  const lane=.720+i*.025,rz=-.900-i*.020;
  link(no,start,end,'AC230',[[ports[start].position[0],1.650,rz],[ports[start].position[0],lane,rz],[x,lane,rz],[x,y,rz]],id);
  load(id,end,null,id,id==='A',id==='A'?'Purchased opener: 1 AC feed + separate control and safety interfaces; OEM pinout pending':'Station inlet; existing manufactured internal harness retained');
 }
 devices.push({id:'MAIN_PANEL',supply:'MAIN.AC_IN',outputs:mainOutputs,kind:'manufactured protected machine distribution'});
 // Oven stays on its dedicated protected branch, not a small station plug.
 const oven=p('F.AC_IN',[2.560,.860,-.656],'AC400','F');
 link('W003',wall('OVEN','AC400',1),oven,'AC400',[[5.370,.500,.750],[5.370,.500,-.630],[2.560,.500,-.630]],'F');
 load('F_OVEN',oven,null,'F',true,'Dedicated 3-phase feed; installed oven current/plug rating must match manufacturer');
 // Every shop circuit is a full cable back to a distinct protected output.
 const services=[
 ['QR','AC230','QR.BOTTOM_AC','BINA_QR_230V'],
 ['KIOSK','AC230',p('KIOSK.AC_IN',[5.411,.850,2.475],'AC230','KIOSK'),'BINA_KIOSK_230V'],
 ['DISPLAY','AC230',p('DISPLAY.AC_IN',[5.050,1.780,2.016],'AC230','QR'),''],
 ['DESK','AC230',p('DESK.AC_IN',[3.167,.380,2.730],'AC230','SHOP'),'BINA_KASA_230V'],
 ['SERVICE','AC230',p('SERVICE.AC_IN',[.536,.350,2.450],'AC230','SHOP'),'BINA_PERSONEL_SERVIS_230V'],
 ['DISHWASHER','AC400',p('DISHWASHER.AC_IN',[2.545,.150,2.295],'AC400','WASH'),'BINA_BULASIK_400V'],
 ['SHUTTER','AC230',p('SHUTTER.CONTROL_IN',[1.735,-.062,2.940],'AC230','SHOP'),'BINA_PANJUR_230V'],
 ['RAIL','AC230',p('RAIL.AC_IN',[3.960,.085,1.934],'AC230','ROB'),''],
 ['NETWORK','AC230',p('NETWORK.AC_IN',[5.450,1.080,1.130],'AC230'),''],
 ];
 const floorOrder={SERVICE:0,SHUTTER:1,DISHWASHER:2,DESK:3,RAIL:4,DISPLAY:5,KIOSK:6};
 for(const [i,[id,kind,end,old]]of services.entries()){
  const rank=floorOrder[id]??7,start=wall(id,kind,i+2),e=ports[end].position,tx=5.365+rank*.020,cz=1.820+rank*.020,fy=-.062;
  ports[start].position=[tx,.997,.870];
  let via=[[tx,fy,.870],[tx,fy,cz],[e[0],fy,cz],[e[0],fy,e[2]]];
  if(id==='QR'){ports[start].position=[5.520,.997,1.100];via=[[5.520,-.090,1.100],[5.520,-.090,1.700],[e[0],-.090,e[2]]];}
  if(id==='NETWORK'){ports[start].position=[5.510,.997,1.110];via=[];}
  if(id==='DISPLAY'||id==='KIOSK'||id==='RAIL')via=[[tx,fy,.870],[tx,fy,cz],[e[0],fy,e[2]]];
  if(id==='SHUTTER')via=[[tx,fy,.870],[tx,fy,cz],[e[0],fy,cz]];
  link('EXT-'+id,start,end,kind==='AC230'&&!['QR','NETWORK'].includes(id)?'AC230_SWEEP':kind,via,id==='RAIL'?'ROB':id==='QR'||id==='DISPLAY'?'QR':id==='KIOSK'?'KIOSK':'POWER',old?['DUKKAN_SERVIS__'+old]:[]);
  if(!['QR','NETWORK'].includes(id))load(id,end,null,id==='RAIL'?'ROB':'POWER');
 }
 p('NETWORK.ADAPTER_DC',[5.450,1.140,1.130],'DC12');
 p('ROUTER.POWER',[5.510,1.490,1.100],'DC12');
 box('ER605_READY_ADAPTER',[5.450,1.110,1.130],[.050,.060,.030],undefined,'POWER');
 link('ER605-12V','NETWORK.ADAPTER_DC','ROUTER.POWER','DC12');
 devices.push({id:'NETWORK_POWER',supply:'NETWORK.AC_IN',outputs:['NETWORK.ADAPTER_DC'],kind:'purchased ER605 12 V adapter; supplier voltage verified'});
 // Data source is the external internet connection. Internal router electronics omitted.
 p('BUILDING.WAN',[5.435,1.001,1.154],'CAT7PATCH');p('ROUTER.WAN',[5.486,1.555,1.238],'CAT7PATCH');
 link('WAN-IN','BUILDING.WAN','ROUTER.WAN','CAT7PATCH',[[5.486,1.200,1.154],[5.486,1.555,1.154]]);
 p('ROUTER.LAN_MAIN',[5.486,1.570,1.238],'CAT7PATCH');p('MAIN.LAN_IN',[3.775,2.154,-.282],'CAT7PATCH');
 link('W020','ROUTER.LAN_MAIN','MAIN.LAN_IN','CAT7PATCH',[[5.416,1.570,1.238],[5.416,1.570,-.900],[3.775,1.570,-.900],[3.775,2.154,-.900]]);
 devices.push({id:'ROUTER',supply:'ROUTER.POWER',optional_input:'ROUTER.WAN',outputs:['ROUTER.LAN_PC','ROUTER.LAN_QR','ROUTER.LAN_MAIN'],kind:'purchased router external ports'});
 const lanOutputs=[],ecatOutputs=[];
 function dataOut(id,kind,i){const q=p('MAIN.'+id,[kind==='ECAT'?3.800+i*.025:3.900+i*.025,2.154,-.282],kind);(kind==='ECAT'?ecatOutputs:lanOutputs).push(q);return q;}
 for(const [i,[id,xyz,owner]]of [['DISPLAY',[5.285,1.940,2.016],'QR'],['KIOSK',[5.426,.900,2.475],'KIOSK'],['UR',[4.680,.100,1.974],'ROB']].entries()){
  const from=dataOut(id+'_LAN','CAT7PATCH',i),to=p(id+'.LAN_IN',xyz,'CAT7PATCH',owner),x=ports[from].position[0],z={UR:1.850,DISPLAY:1.900,KIOSK:1.940}[id],tx={UR:5.475,DISPLAY:5.495,KIOSK:5.535}[id],rz=-.855-i*.012,ry=1.730+i*.012;
  link('LAN-'+id,from,to,'CAT7PATCH',[[x,2.154,rz],[x,ry,rz],[tx,ry,rz],[tx,-.020,rz],[tx,-.020,z],[xyz[0],-.020,z],[xyz[0],-.020,xyz[2]]],owner,id==='KIOSK'?['DUKKAN_SERVIS__BINA_VERI_KIOSK']:[]);
  const d=devices.find(d=>d.id===id||(id==='UR'&&d.id==='UR_CONTROL'));if(d)d.input=to;
 }
 // Existing PLC master + EK1122 two branches: K main line, TOP/B branches.
 for(const [i,[id,x,y,no]]of [['K',4.160,1.500,'W021'],['TOP',1.680,2.010,'W022'],['B',4.160,.360,'W027']].entries()){
  const er={K:-.950,TOP:-.995,B:-.970}[id],start=dataOut(id+'_ECAT','ECAT',i),end=p(id+'.ECAT_IN',[x,y,-.830],'ECAT',id),x0=ports[start].position[0];
  link(no,start,end,'ECAT',[[x0,2.154,er],[x0,.620+i*.025,er],[x,.620+i*.025,er],[x,y,er]],id);devices.find(d=>d.id===id).input=end;
 }
 p('K.ECAT_OUT',[4.240,1.500,-.830],'ECAT','K');devices.find(d=>d.id==='K').outputs.push('K.ECAT_OUT');
 p('F.IO_ECAT_IN',[4.810,1.500,-.830],'ECAT','E');p('F.IO_ECAT_OUT',[4.850,1.500,-.830],'ECAT','E');
 link('W023','K.ECAT_OUT','F.IO_ECAT_IN','ECAT',[[4.240,1.500,-.940],[4.240,.700,-.940],[4.810,.700,-.940],[4.810,1.500,-.940]],'E');
 p('E.ECAT_IN',[4.890,1.500,-.830],'ECAT','E');p('E.ECAT_OUT',[4.930,1.500,-.830],'ECAT','E');
 // F IO lives in our E panel; the short panel patch is part of our manufactured wiring.
 link('W024','F.IO_ECAT_OUT','E.ECAT_IN','ECAT');
 devices.push({id:'F_IO',supply:'E.AC_IN',input:'F.IO_ECAT_IN',outputs:['F.IO_ECAT_OUT'],kind:'oven IO in manufactured E panel'});
 const ed=devices.find(d=>d.id==='E');ed.input='E.ECAT_IN';ed.outputs.push('E.ECAT_OUT');
 p('RAIL.ECAT_IN',[4.020,.085,1.934],'ECAT','ROB');
 link('ECAT-E-RAIL','E.ECAT_OUT','RAIL.ECAT_IN','ECAT',[[4.930,1.500,-.995],[5.455,1.500,-.995],[5.455,-.020,-.995],[5.455,-.020,1.650],[4.020,-.020,1.650],[4.020,-.020,1.934]],'ROB');
 devices.find(d=>d.id==='RAIL').input='RAIL.ECAT_IN';
 devices.push({id:'MAIN_LAN_SWITCH',supply:'MAIN.AC_IN',input:'MAIN.LAN_IN',outputs:lanOutputs,kind:'main panel powered LAN switch'});
 devices.push({id:'PLC_ECAT_MASTER',supply:'MAIN.AC_IN',outputs:ecatOutputs,kind:'PLC master K main line; EK1122 TOP and B branches'});
 for(const [i,[id,kind,to,xyz,no]]of [['A','CONTROL','A.CONTROL',[1.320,1.740,-.830],'W051'],['A','ASAFETY','A.SAFETY',[1.360,1.700,-.830],'W050'],['UR','SAFETY','UR.SAFETY_IN',[4.710,.100,1.934],'W030'],['UR','SAFETY','UR.SAFETY_OUT',[4.740,.100,1.934],'W031']].entries()){
  const from=main(id+'_'+no,kind,10+i);p(to,xyz,kind,id==='A'?'A':'ROB');const x=ports[from].position[0];
  const rz=id==='A'?(i===0?-.980:-.970):(i===2?-1.000:-1.001),zc=i===2?1.720:1.800,ry=1.340+i*.030;
  const via=id==='A'?[[x,xyz[1],rz],[xyz[0],xyz[1],rz]]:[[x,ry,rz],[5.280+i*.016,ry,rz],[5.280+i*.016,-.045,rz],[5.280+i*.016,-.045,zc],[xyz[0],-.045,zc],[xyz[0],-.045,xyz[2]]];
  link(no,from,to,kind,via,id==='A'?'A':'ROB');
 }
 // Staff purchased power strip and plug-in chargers: external tails only.
 p('STRIP.AC_IN',[3.079,.720,2.820],'CORD230','SHOP');
 p('DESK.CORD_OUT',[3.145,.380,2.730],'CORD230','SHOP');
 devices.find(d=>d.id==='DESK').outputs.push('DESK.CORD_OUT');
 link('DESK-STRIP','DESK.CORD_OUT','STRIP.AC_IN','CORD230',[[3.130,.380,2.820],[3.130,.720,2.820]],'POWER',['DUKKAN_SERVIS__MASA_GOMME_PRIZ_GIZLI_BESLEME']);
 const chargerOuts=[];
 for(const [id,x,xyz,name]of [['STAFF_TABLET',2.957,[2.940,.955,2.734],'TABLET_USB_KABLO'],['POS',2.890,[2.952,.791,2.460],'POS_DC_KABLO']]){
  const incoming=p(id+'.ADAPTER_AC',[x,.705,2.825],'CORD230','SHOP'),dc=p(id+'.CHARGE_OUT',[x,.665,2.825],'CHARGE','SHOP');chargerOuts.push(incoming);
  devices.push({id:id+'_CHARGER',supply:incoming,outputs:[dc],kind:'purchased plug-in charging adapter'});
  const known=IKIZ.dukkanServis?.routes.find(r=>r.name===name),end=p(id+'.CHARGE_IN',known?.points[0]||xyz,'CHARGE','SHOP');
  const via=id==='STAFF_TABLET'?[[2.940,.736,2.810],[ports[end].position[0],ports[end].position[1],2.810]]:[[2.890,.736,2.825],[2.980,.736,2.825],[2.980,.791,2.460]];
  link(id+'-CHARGE',dc,end,'CHARGE',via,'POWER',['DUKKAN_SERVIS__'+name]);load(id,end,null,'SHOP',true,'Charging only; data via Wi-Fi, no fictitious wired LAN');
 }
 devices.push({id:'DESK_STRIP',supply:'STRIP.AC_IN',outputs:chargerOuts,kind:'purchased power strip; internal wiring omitted'});
 // Panjur switch is the external motor interface, with a distinct UP/DOWN harness.
 p('SHUTTER.SWITCH_AC',[1.680,1.293,2.893],'AC230','SHOP');
 link('SHUTTER-SWITCH','SHUTTER.CONTROL_IN','SHUTTER.SWITCH_AC','AC230',[[1.735,1.200,2.940]],'POWER',['DUKKAN_SERVIS__PANJUR_DUGME_DUVAR_ICI_BESLEME']);
 p('SHUTTER.SWITCH_OUT',[1.680,1.320,2.893],'SHUTTER','SHOP');p('SHUTTER.MOTOR_IN',[1.800,2.095,2.993],'SHUTTER','SHOP');
 link('SHUTTER-MOTOR','SHUTTER.SWITCH_OUT','SHUTTER.MOTOR_IN','SHUTTER',[[1.735,1.400,2.950],[1.735,2.000,2.950]],'POWER',['DUKKAN_SERVIS__PANJUR_230V_DUVAR_ICI']);
 devices.push({id:'SHUTTER_SWITCH',supply:'SHUTTER.SWITCH_AC',outputs:['SHUTTER.SWITCH_OUT'],kind:'mutually exclusive up/down motor switch'});load('SHUTTER_MOTOR','SHUTTER.MOTOR_IN',null,'SHOP');
 // Complete purchased rail includes its internal motor/sensor harness; omit those interiors.
 retire('ROBOT25_SERVO_MOTOR_KABLO');retire('ELK_RAY_SENSOR__kablo_veri');
 scene.traverse(o=>{if(/^(ELK_EKSEN_KUTU|ELK_DUKKAN_PC|ELK_ROBOT_UPS|ELK_ROBOT_KAMERA)__kablo/.test(o.name))retire(o.name);});
 retire('DUKKAN_SERVIS__BINA_VERI_KASA');
 inventory.push({id:'CASH_DRAWER',purchased:true,external_only:true,cables:0,notes:'Existing manual/key drawer. Electronic kick requires a compatible fiscal POS interface, not the charging jack.'});
 // External charger of the bonded machine tablet; no tablet electronics modeled.
 const tabletAC=main('TABLET_AC','AC230',9);p('MACHINE_TABLET.ADAPTER_AC',[1.300,1.650,-.730],'AC230','A');
 link('MACHINE-TABLET-AC',tabletAC,'MACHINE_TABLET.ADAPTER_AC','AC230',[[ports[tabletAC].position[0],1.950,-.200],[ports[tabletAC].position[0],1.950,-1.010],[ports[tabletAC].position[0],1.550,-1.010],[1.300,1.550,-1.010]],'A');
 box('MACHINE_TABLET_READY_ADAPTER',[1.300,1.680,-.730],[.045,.060,.030],undefined,'A');
 p('MACHINE_TABLET.CHARGE_OUT',[1.300,1.710,-.730],'CHARGE','A');p('MACHINE_TABLET.CHARGE_IN',[1.1569,1.700,.0843],'CHARGE','A');
 devices.push({id:'MACHINE_TABLET_CHARGER',supply:'MACHINE_TABLET.ADAPTER_AC',outputs:['MACHINE_TABLET.CHARGE_OUT'],kind:'purchased supplied tablet charger'});
 const tabletCable=link('MACHINE-TABLET-CHARGE','MACHINE_TABLET.CHARGE_OUT','MACHINE_TABLET.CHARGE_IN','CHARGE',[[1.180,1.710,-.730],[1.180,1.700,0]],'A');
 load('MACHINE_TABLET','MACHINE_TABLET.CHARGE_IN',null,'A',true,'USB-C with right-angle plug, sealed panel passage and detachable service lead; connector fit pending');
 const tablet=scene.getObjectByName('DUKKAN_SERVIS__MAKINE_TABLET_ACTIVE5')||scene.getObjectByName('MAKINE_TABLET_ACTIVE5');
 if(tablet){scene.updateMatrixWorld(true);const anchor=tablet.worldToLocal(new T.Vector3(...ports['MACHINE_TABLET.CHARGE_IN'].position));let last=new T.Vector3(...ports['MACHINE_TABLET.CHARGE_IN'].position);
  tabletCable.mesh.onBeforeRender=()=>{tablet.updateWorldMatrix(true,false);const now=tablet.localToWorld(anchor.clone());if(now.distanceTo(last)<.0001)return;last.copy(now);
   ports['MACHINE_TABLET.CHARGE_IN'].position=now.toArray();tabletCable.points[tabletCable.points.length-1]=now.toArray();const q=kabloYolu(T,tabletCable.points,PROFIL.CHARGE.min_bend_mm/1000);
   tabletCable.mesh.geometry.dispose();tabletCable.mesh.geometry=new T.TubeGeometry(q.path,100,PROFIL.CHARGE.diameter_mm/2000,8,false);tabletCable.bends=q.bends;tabletCable.length_m=q.path.getLength();
  };
 }
 // Oven's AC feed does not carry PLC start/ready/fault contacts.
 p('F_IO.CONTROL_OUT',[4.810,1.500,-.790],'FCONTROL','E');p('F.CONTROL_IN',[2.620,.860,-.656],'FCONTROL','F');
 devices.find(d=>d.id==='F_IO').outputs.push('F_IO.CONTROL_OUT');
 link('W100','F_IO.CONTROL_OUT','F.CONTROL_IN','FCONTROL',[[4.810,1.300,-.850],[2.620,1.300,-.850],[2.620,.860,-.850]],'F');
 devices.find(d=>d.id==='F_OVEN').input='F.CONTROL_IN';
 const comp=main('COMPRESSOR_AC','AUX230',14);p('COMPRESSOR.AC_IN',[3.694,1.810,-.360],'AUX230','UF');
 link('W068',comp,'COMPRESSOR.AC_IN','AUX230',[[3.900,1.730,-.420],[3.694,1.730,-.420]],'UF',['HAVA_KOMPRESOR__kablo']);load('COMPRESSOR','COMPRESSOR.AC_IN',null,'UF');
 p('WALL.F_AUX',[5.470,.997,.750],'AC230');wallOutputs.push('WALL.F_AUX');p('UF.AUX_IN',[3.200,1.900,-.800],'AC230','UF');
 link('W018','WALL.F_AUX','UF.AUX_IN','AC230',[[5.470,.450,.750],[5.470,.450,-.885],[3.200,.450,-.885],[3.200,1.900,-.885]],'UF');load('UF_FAN_CONTROL','UF.AUX_IN',null,'UF',false,'Manufactured fan/utility compartment; local harness retained');
 // ER605 has no Wi-Fi radio: one ready PoE injector plus one ready access point.
 p('MAIN.LAN_AP',[3.965,2.130,-.282],'CAT7PATCH');lanOutputs.push('MAIN.LAN_AP');
 p('POE.DATA_IN',[5.349,1.530,1.145],'CAT7PATCH');p('POE.AC_IN',[5.349,1.655,1.159],'CORD230');
 p('POE.OUT',[5.349,1.530,1.175],'POE');p('AP.POE_IN',[5.366,2.550,1.500],'POE');
 p('WALL.POE_AC',[5.490,.997,1.154],'CORD230');wallOutputs.push('WALL.POE_AC');
 box('READY_TL_POE160S',[5.3485,1.5925,1.1595],[.037,.125,.059],undefined,'POWER');
 link('POE-AC','WALL.POE_AC','POE.AC_IN','CORD230',[[5.380,1.100,1.100],[5.380,1.720,1.100],[5.349,1.720,1.159]]);
 link('AP-LAN','MAIN.LAN_AP','POE.DATA_IN','CAT7PATCH',[[3.965,2.130,-.880],[3.965,2.350,-.880],[5.395,2.350,-.880],[5.395,2.350,.600],[5.395,1.450,.600],[5.349,1.450,1.145]]);
 link('W124','POE.OUT','AP.POE_IN','POE',[[5.349,1.480,1.175],[5.410,1.480,1.175],[5.410,2.550,1.175],[5.410,2.550,1.500]]);
 const ap=box('READY_EAP650_ENVELOPE',[5.3492,2.550,1.500],[.0336,.160,.160],new T.MeshStandardMaterial({color:0xf1f3f3,roughness:.5}),'POWER');
 ap.userData.envelopeSource='https://www.tp-link.com/us/business-networking/omada-sdn-access-point/eap650/';ap.userData.downloadedOEM=false;
 devices.push({id:'POE_INJECTOR',supply:'POE.AC_IN',input:'POE.DATA_IN',outputsRequireInput:false,outputs:['POE.OUT'],kind:'purchased 802.3at 30W injector'});
 devices.push({id:'POE_DATA_PATH',supply:'POE.AC_IN',input:'POE.DATA_IN',outputs:['POE.OUT#data'],kind:'external powered injector Ethernet pass-through'});
 devices.push({id:'WIFI_AP',supply:'AP.POE_IN',input:'AP.POE_IN#data',outputs:['WIFI.STAFF_TABLET','WIFI.POS','WIFI.MACHINE_TABLET'],kind:'purchased AP; one external PoE cable'});
 for(const id of ['STAFF_TABLET','POS','MACHINE_TABLET'])devices.find(d=>d.id===id).input='WIFI.'+id;
 inventory.push({id:'WIFI_AP',purchased:true,external_only:true,cables:1,notes:'EAP650 envelope 160x160x33.6; one PoE+ cable, internal wiring omitted; mounting and selected hardware revision to verify'});
 // The underfloor shutter turn is not a connector: keep one continuous physical feed.
 const shutterFirst=routes.find(r=>r.id==='EXT-SHUTTER'),shutterLast=routes.find(r=>r.id==='SHUTTER-SWITCH');
 const shutterPoints=[...shutterFirst.points,...shutterLast.points.slice(1)],shutterFrom=shutterFirst.from,shutterTo=shutterLast.to;
 for(const r of [shutterFirst,shutterLast]){r.mesh.removeFromParent();r.mesh.geometry.dispose();routes.splice(routes.indexOf(r),1);}
 link('EXT-SHUTTER',shutterFrom,shutterTo,'SHUTTER_FEED',shutterPoints.slice(1,-1),'POWER');
 const oldShutter=devices.findIndex(d=>d.id==='SHUTTER');if(oldShutter>=0)devices.splice(oldShutter,1);delete ports['SHUTTER.CONTROL_IN'];
 // Preserve devices/motors in our manufactured stations. Retire obsolete external harness bundles only.
 for(const n of ['ELK_ANA_HAT__kablo','ELK_ANA_HAT__kablo_guc','ELK_ANA_HAT__kablo_veri','DUKKAN_SERVIS__BINA_ZEMIN_KUTUSU_GUC','DUKKAN_SERVIS__BINA_ZEMIN_KUTUSU_VERI'])retire(n);
 scene.traverse(o=>{if(/^QR_(GOZ_KABLO_DALI|KAPALI_KABLO_DIKMESI)_/.test(o.name)||/^ELK_QR_(DOLAP|KUTU).*__(kablo|din|cihaz)/.test(o.name))retire(o.name);});
 const hiddenFunctional=new Set(['POE_DATA_PATH','MAIN_LAN_SWITCH','PLC_ECAT_MASTER','F_IO']);
 const deviceChecks=devices.filter(d=>!hiddenFunctional.has(d.id)).map(d=>{
  const own=id=>d.id==='MAIN_PANEL'?id?.startsWith('MAIN.'):d.id==='E'?/^(E\.|F\.IO_|F_IO\.)/.test(id||''):d.id==='A'?id?.startsWith('A.'):d.id==='UR_CONTROL'?id?.startsWith('UR.')||['ROB.CABINET_CONTROL','ROB.CAMERA_INTERFACE'].includes(id):[d.supply,d.input,d.optional_input,...d.outputs].includes(id);
  return {id:d.id,kind:d.kind,supply:d.supply,data:d.input||null,external_cables:routes.filter(r=>own(r.from)!==own(r.to)).map(r=>({id:r.id,from:r.from,to:r.to,type:r.part,diameter_mm:r.diameter_mm})),manufacturer_pinout_verified:false};
 });
 return {deviceChecks,inventory,scope:'external assembly wiring; manufactured station internal harnesses retained',hardwareAcceptance:false,
  pending:['Purchased unit exact connector/pinout confirmation','Load, voltage-drop and protective-device coordination','Protective bonding measurements','Station internal cable-to-IO mapping','Camera assembly model and combined 24V/USB pinout','Purchased rail external connector acceptance; internal OCT/sensor harness supplied with rail'],
  sources:['https://www.beckhoff.com/en-us/products/i-o/ethercat-terminals/ek-ec1xxx-bk1xx0-ethercat-coupler/ek1122.html','https://www.universal-robots.com/manuals/EN/HTML/SW10_6/Content/prod-usr-man/hardware/CB_e-series/robot_connections_cable.htm']};
}
