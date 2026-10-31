(function(){var C=SK.core,F=C.fmt,U=SKM.util,inp=U.inp,bx=U.bx,src=U.src,chk=U.chk,tabbed=U.tabbed,T=SK.transf;
function dw(t){return ' <span class="dw">'+(t||'DO WERYFIKACJI')+'</span>';}
function sel(id,lab,opts){return '<label>'+lab+' <select id="'+id+'">'+opts.map(function(o){return '<option value="'+o[0]+'">'+o[1]+'</option>'}).join('')+'</select></label>';}
var TR=tabbed({id:'transf',icon:'🅰️',name:'Transfuzjologia'},'Transfuzjologia',[['g','Zgodność ABO/RhD'],['d','Dawki i progi'],['rbc','KKCz – wskazania'],['plt','Trombocytopenia / KKP'],['gcsf','Neutropenia / G-CSF'],['m','Masywne przetoczenie'],['r','Reakcja'],['n','Odwracanie NOAC']],
 function(t){return t==='g'?sel('abo','Grupa biorcy',[['','— nieznana —'],['O','0'],['A','A'],['B','B'],['AB','AB']])+sel('rh','RhD',[['','—'],['+','RhD+'],['-','RhD−']]):
  t==='d'?inp('hb','Hb','g/dl')+inp('hbt','Hb docelowe','g/dl')+sel('ctx','Kontekst',[['','stabilny'],['cardiac','ch. sercowo-naczyniowa'],['acs','ACS']])+chk('coag','krwawienie + koagulopatia (PT/APTT >1,5×)')+inp('fib','Fibrynogen','g/l')+inp('plt','PLT','×10⁹/l')+sel('pctx','PLT – sytuacja',[['','profilaktyka'],['bleed','krwawienie/zabieg'],['cns','OUN/uraz wielonarządowy']]):
  t==='rbc'||t==='plt'||t==='gcsf'?SKB1.tfForm(t):t==='m'?inp('th','Czas od urazu','h')+chk('gi','krwawienie z przewodu pokarmowego')+SKB1.tfForm('mtp-add'):
  t==='r'?chk('fever','gorączka/dreszcze')+chk('fever2','≥39 °C lub wzrost ≥2 °C')+chk('urt','pokrzywka')+chk('hypo','hipotensja')+chk('dysp','duszność')+chk('back','ból lędźwi/hemoglobinuria')+chk('ana','anafilaksja'):U.NOACF();},
 function(t,g,P){var w=P.w,H='',lvl='ok';
  if(t==='rbc'||t==='plt'||t==='gcsf')return SKB1.tfCalc(t,g,P);/* ETAP B1 */
  if(t==='g'){var e=T.emergency(P.sex,P.age);var abo=g('abo'),rh=g('rh');
   if(!abo||!rh)H+=bx('red','Grupa nieznana – tryb ratunkowy','KKCz <span class="big">'+e.rbc+'</span><br>Osocze <b>'+e.plasma+'</b>'+(e.cb?'<div class="o">Kobieta <50 lat / płeć nieznana → tylko RhD−</div>':''));
   else{var c=T.compat(abo,rh,P.sex,P.age);var n=function(a){return a.map(function(x){return x==='O'?'0':x}).join(', ')};
    H+=bx('ok','KKCz','<span class="big">'+n(c.rbc)+'</span> · '+c.rbcRh.join(' / ')+(rh==='-'&&c.childbearing?'<div class="r">Kobieta <50 lat: wyłącznie RhD−</div>':''));
    H+=bx('ok','Osocze (FFP) – zgodność odwrotna','<span class="big">'+n(c.plasma)+'</span> · RhD bez znaczenia');
    H+=bx('ok','KKP','<b>'+n(c.plt)+'</b> (preferowana grupa identyczna) · '+c.pltRh);}
   H+=bx('','','Próba zgodności i kontrola przyłóżkowa AB0 – wg rozporządzenia MZ.')+SKB1.compatHtml();}
  if(t==='d'){var th=T.threshold(g('ctx')),hb=g('hb'),u=T.rbcUnits(hb,g('hbt'));
   if(!isFinite(hb))H+=bx('orange','KKCz','Podaj Hb.');else{var need=hb<th.t||(g('ctx')==='acs'&&hb<=8);lvl=hb<6?'red':need?'orange':'ok';
    H+=bx(hb<6?'red':need?'orange':'ok','KKCz – próg '+th.t+' g/dl',th.txt+(th.dw?dw():'')+'<div>'+(need?(u>0?'<span class="big">'+u+' j. KKCz</span> (1 j. ≈ +1 g/dl u ~70 kg; przetaczaj po 1 j. i oceniaj)':'Podaj Hb docelowe'):'<b>Powyżej progu – brak wskazań przy stabilnym pacjencie</b>')+'</div>');}
   var f=T.ffp(w);H+=bx('','Osocze (FFP)',!g('coag')?'Brak wskazań – osocze tylko przy krwawieniu z koagulopatią':f?'<span class="big">'+F(f.ml,0)+' ml</span> (15 ml/kg) – tylko przy krwawieniu z koagulopatią'+dw('objętość j. FFP w PL'):'Podaj masę ciała');
   var fb=T.fib(w,g('fib'));if(isFinite(g('fib')))H+=bx(fb.need?'orange':'ok','Fibrynogen '+F(g('fib'),1)+' g/l',fb.need?(w>0?'Koncentrat fibrynogenu <span class="big">'+F(fb.concLo,1)+'–'+F(fb.concHi,1)+' g</span> (25–50 mg/kg, ESA 2023) lub krioprecypitat'+dw('dawka krioprecypitatu PL'):'Podaj masę'):'≥1,5 g/l – bez suplementacji');
   var p=T.plt(g('plt'),g('pctx'));if(isFinite(g('plt')))H+=bx(p.need?'orange':'ok','KKP – próg '+p.t,p.need?'<span class="big">'+p.dose+'</span>':'Powyżej progu – brak wskazań');}
  if(t==='m'){var m=T.mtp(),x=T.txa(g('th'));lvl='red';
   H+=bx('red','Protokół masywnego przetoczenia','<span class="big">'+m.ratio+'</span><div>'+m.targets+'</div>');
   if(g('gi'))H+=bx('orange','Kwas traneksamowy','Krwawienie z GI – TXA niezalecany (HALT-IT)');
   else H+=bx(x.ok===false?'red':x.ok?'ok':'orange','Kwas traneksamowy (uraz)','<span class="big">'+x.txt+'</span>');
   H+=bx('','','Grupa nieznana: KKCz 0, osocze AB – zakładka „Zgodność ABO/RhD”.');var mt=SKB1.tfCalc('mtp-add',g,P);H+=mt.H;}
  if(t==='r'){var r=T.reaction({fever:g('fever'),fever2:g('fever2'),urt:g('urt'),hypo:g('hypo'),dysp:g('dysp'),back:g('back'),ana:g('ana')});lvl=r.lvl;
   H+=r.lvl==='ok'?bx('ok','','Brak objawów reakcji.'):bx(r.lvl,'Reakcja poprzetoczeniowa','<div class="'+(r.lvl==='red'?'r':'o')+'">'+r.red.concat(r.or).join(', ')+'</div><b>'+r.act+'</b>'+(g('ana')?'<div>Anafilaksja → moduł <b>Anafilaksja</b> (adrenalina i.m.)</div>':''));}
  if(t==='n'){var r=U.NOACC(g,w);H=r.H;lvl=r.lvl;}
  return{H:H,lvl:lvl};},
 '<h3>Źródła</h3>'+src(T.SRC)+'<p>'+dw()+': objętość jednostki FFP i dawka krioprecypitatu w PL (NCKiK); ACS – próg liberalny wg MINT 2023 vs ESC 2023; maks. PCC 50 j./kg przy anty-Xa.</p>');
var L=SKM.list;for(var i=0;i<L.length;i++)if(L[i].id==='transf')L[i]=TR;})();
