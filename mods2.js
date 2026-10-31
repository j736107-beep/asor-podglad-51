(function(){var C=SK.core,F=C.fmt,N=C.num,U=SKM.util;var inp=U.inp,bx=U.bx,src=U.src,store=U.store,bind=U.bind,infoToggle=U.infoToggle,h=U.h;
function chk(id,l){return '<label><input type="checkbox" id="'+id+'"> '+l+'</label>';}
function tabbed(mod,title,tabs,form,calc,info){return {id:mod.id,icon:mod.icon,name:mod.name,render:function(el,X){var tab=store(mod.id+'_tab').get().t||tabs[0][0];var self=this;
 function draw(){el.innerHTML='<button class="info">ℹ</button><h2>'+title+'</h2>'+(tabs.length>1?'<div class="tabs">'+tabs.map(function(t){return '<button data-t="'+t[0]+'" class="'+(t[0]===tab?'on':'')+'">'+t[1]+'</button>'}).join('')+'</div>':'')+'<div id="f"></div><div id="out"></div><div class="infobox" hidden></div><div class="disc">Narzędzie pomocnicze, niecertyfikowane. Każdą dawkę weryfikuje lekarz.</div>';
  el.querySelectorAll('.tabs button').forEach(function(b){b.onclick=function(){tab=b.dataset.t;store(mod.id+'_tab').set({t:tab});draw()}});
  infoToggle(el,info);var f=el.querySelector('#f');f.innerHTML='<div class="row">'+form(tab)+'</div>';var g=bind(f,mod.id+'_'+tab,upd);if(window.SKGCS)SKGCS.mount(f);self.update=upd;
  function upd(){var r=calc(tab,g,X.P(),X);el.querySelector('#out').innerHTML=r.H;X.alarm(mod.id,r.lvl==='red'||r.H.indexOf('class="box red"')>=0);}upd();}
 draw();}};}
SKM.util.tabbed=tabbed;SKM.util.chk=chk;
// ============ ANTYKOAGULACJA ============
var A=SK.acoag,AS=A.SRC;
// --- wspólna karta odwracania NOAC (Antykoagulacja + Transfuzjologia) ---
function NOACF(){return chk('nb','krwawienie zagrażające życiu / pilny zabieg')+chk('dabi','dabigatran (Pradaxa)')+chk('api','apiksaban (Eliquis)')+chk('riva','riwaroksaban (Xarelto)')+chk('edo','edoksaban (Lixiana)')+inp('ld','Ostatnia dawka','mg')+inp('hr','Ile godzin temu','h');}
function NOACC(g,w){var H='',lvl='ok';if(!g('nb'))return{H:bx('orange','','Brak wskazań do odwracania – zaznacz krwawienie zagrażające życiu / pilny zabieg.'),lvl:'ok'};
 if(g('dabi')){lvl='red';H+=bx('red','Dabigatran → Praxbind','<span class="big">Idarucyzumab 5 g i.v.</span><div>2 fiolki × 2,5 g/50 ml</div>');}
 if(g('api')||g('riva')){lvl='red';var a=A.andex(g('api')?'api':'riva',g('ld'),g('hr'));H+=bx('red','Anty-Xa → andeksanet (Ondexxya)','Dawka <b>'+a.reg+'</b>: '+a.txt+(isFinite(g('ld'))?'':'<div class="o">Brak dawki → przyjęto dawkę wysoką (ChPL: nieznana dawka)</div>'));}
 if(g('api')||g('riva')||g('edo')){lvl='red';if(!(w>0))H+=bx('orange','','Podaj masę ciała (PCC).');else{var p=A.pccXa(w);H+=bx('orange',g('edo')&&!g('api')&&!g('riva')?'Edoksaban → PCC (andeksanet poza rejestracją UE)':'Bez andeksanetu','PCC <span class="big">'+F(p.iu,0)+' j. = '+F(p.ml,0)+' ml</span> (50 j./kg, EHRA 2021) <span class="dw">maks. DO WERYFIKACJI</span>');}}
 if(!H)H=bx('','','Zaznacz lek.');return{H:H,lvl:lvl};}
SKM.util.NOACF=NOACF;SKM.util.NOACC=NOACC;

var ACO=tabbed({id:'acoag',icon:'🩸',name:'Antykoagulacja'},'Antykoagulacja i odwracanie',[['ufh','Heparyna'],['enox','Enoksaparyna'],['vka','Warfaryna'],['noac','NOAC'],['alt1','Alteplaza: STEMI'],['alt2','Alteplaza: udar'],['alt3','Alteplaza: ZP'],['prot','Protamina']],
 function(t){return t==='ufh'?chk('acs','ACS (zamiast ŻChZZ/ZP)'):t==='enox'?chk('proph','profilaktyka (zamiast leczenia)'):t==='vka'?inp('inr','INR','')+chk('bleed','krwawienie zagrażające życiu / pilny zabieg'):t==='noac'?NOACF():t==='alt1'?SKB1.altForm('stemi'):t==='alt2'?SKB1.altForm('stroke'):t==='alt3'?SKB1.altForm('pe'):
  SKB1.protForm();},
 function(t,g,P){var H='',lvl='ok',w=P.w;
  /* ETAP B1: alteplaza (3 stany) i protamina z czasem – calc/acoagB1.js + b1-ui.js */
  if(t==='alt1')return SKB1.altCalc('stemi',g,P);if(t==='alt2')return SKB1.altCalc('stroke',g,P);if(t==='alt3')return SKB1.altCalc('pe',g,P);if(t==='prot')return SKB1.protCalc(g);
  if(!(w>0)&&t!=='prot')return{H:bx('orange','','Podaj masę ciała w pasku pacjenta.'),lvl:'ok'};
  if(t==='ufh'){var o=A.ufh(w,g('acs')?'acs':'vte');H=bx('ok','Heparyna niefrakcjonowana','Bolus <span class="big">'+F(o.bolus,0)+' j.</span> = '+F(o.bolus/5000,2)+' ml (5000 j./ml)<br>Wlew <span class="big">'+F(o.rate,0)+' j./h = '+F(o.mlh,1)+' ml/h</span><div class="mut">25 000 j. (5 ml) + 45 ml NaCl 0,9% = 500 j./ml · '+o.txt+'</div>'+(o.bolusCap||o.rateCap?'<div class="o">Zastosowano maksimum ACS</div>':'')+'<div class="mut">aPTT po 6 h, wg protokołu</div>');
   if(P.co.preg)H+=bx('ok','','Ciąża: heparyny nie przechodzą przez łożysko.');}
  if(t==='enox'){var o=A.enox(w,P.crcl,g('proph')?'proph':'tx');lvl=o.lvl;H=bx(o.lvl,'Enoksaparyna (Clexane 100 mg/ml)','<span class="big">'+F(o.dose,0)+' mg s.c. '+o.freq+'</span> = '+F(o.ml,2)+' ml'+(o.note?'<div class="'+(o.lvl==='red'?'r':'o')+'">'+o.note+'</div>':'')+(o.note2?'<div class="o">'+o.note2+'</div>':'')+(!isFinite(P.crcl)?'<div class="o">Brak CrCl – podaj wiek i kreatyninę</div>':''));}
  if(t==='vka'){var inr=g('inr'),o=A.pccInr(w,inr);if(g('bleed'))lvl='red';
   if(!g('bleed'))H=bx('orange','','Brak wskazań do odwracania – zaznacz krwawienie zagrażające życiu / pilny zabieg (przy samym INR: wstrzymaj VKA wg protokołu).');
   else{H=bx(g('bleed')?'red':'ok','Witamina K','<span class="big">10 mg i.v.</span> powoli (ACC 2020: 5–10 mg)');
   if(o&&o.iu)H+=bx(g('bleed')?'red':'orange','4F-PCC (Beriplex, 25 j./ml)','<span class="big">'+F(o.iu,0)+' j. = '+F(o.ml,0)+' ml</span> ('+o.perKg+' j./kg'+(o.cap?', maksimum':'')+')<div class="mut">tylko przy krwawieniu zagrażającym życiu / pilnym zabiegu</div>');
   else if(isFinite(inr))H+=bx('','',o.txt);else H+=bx('orange','','Podaj INR.');}}
  if(t==='noac'){var r=NOACC(g,w);H=r.H;lvl=r.lvl;}
  if(t==='prot'){var pu=A.protUfh(g('rate'),g('bol'),g('hb')),pe=A.protEnox(g('enx'),g('he'));
   if(pu.units>0)H+=bx(pu.cap?'orange':'ok','Protamina na UFH','<span class="big">'+F(pu.mg,0)+' mg = '+F(pu.ml,1)+' ml</span> (10 mg/ml) · na '+F(pu.units,0)+' j. z ostatnich 2 h'+(pu.cap?'<div class="o">maks. 50 mg</div>':'')+'<div class="mut">powoli ≤5 mg/min</div>');
   if(pe)H+=bx(pe.cap?'orange':'ok','Protamina na enoksaparynę','<span class="big">'+F(pe.mg,0)+' mg = '+F(pe.ml,1)+' ml</span> ('+F(pe.f)+' mg/1 mg)'+(pe.cap?'<div class="o">maks. 50 mg</div>':''));
   if(!H)H=bx('','','Podaj dawkę heparyny.');}
  return{H:H,lvl:lvl};},
 '<h3>Źródła</h3>'+src([AS.ACCP,AS.ESCACS,AS.ACC,AS.EHRA,AS.CLX,AS.BER,AS.PRX,AS.OND,AS.PROT,AS.VITK])+'<p><span class="dw">DO WERYFIKACJI</span>: rozcieńczenie heparyny w pompie (25 000 j./50 ml) – protokół szpitala; dostępny w szpitalu 4F-PCC (Beriplex vs Octaplex – inne tabele ChPL); maksymalna dawka PCC 50 j./kg przy anty-Xa; okno 2 h dla protaminy (ACC 2020: 2–3 h); enoksaparyna >100 kg.</p>');
// ============ ZATOROWOŚĆ PŁUCNA ============
var PE=SK.pe;
var PEM=tabbed({id:'pe',icon:'🫁',name:'Zatorowość płucna'},'Zatorowość płucna',[['r','Ryzyko'],['t','Tromboliza']],
 function(t){return t==='r'?chk('shock','niestabilność hemodynamiczna')+chk('age80','wiek >80')+chk('cancer','nowotwór')+chk('cardio','przewlekła ch. serca/płuc')+chk('hr','HR ≥110')+chk('sbp','SBP <100')+chk('sat','SaO₂ <90%')+chk('rv','dysfunkcja RV (echo/CT)')+chk('trop','troponina ↑'):chk('ind','wskazanie: ZP wysokiego ryzyka / pogorszenie hemodynamiczne')+chk('ci','przeciwwskazania bezwzględne do trombolizy')+chk('cpr','RKO');},
 function(t,g,P){var w=P.w,H='',lvl='ok';
  if(t==='r'){var i={};['shock','age80','cancer','cardio','hr','sbp','sat','rv','trop'].forEach(function(k){i[k]=g(k)});if(P.age>80)i.age80=true;var s=PE.spesi(i),r=PE.risk(i);lvl=r.lvl;
   H=bx(s.low?'ok':'orange','sPESI','<span class="big">'+s.score+'</span> '+(s.items.join(', ')||''))+bx(r.lvl,'Ryzyko (ESC 2019)','<b>'+r.txt+'</b>');}
  if(t==='t'&&!g('ind'))return{H:bx('orange','','Brak wskazań do trombolizy – tylko ZP wysokiego ryzyka (wstrząs/hipotensja) lub pogorszenie hemodynamiczne (ESC 2019).'),lvl:'ok'};
  if(t==='t'){if(!(w>0))return{H:bx('orange','','Podaj masę ciała.'),lvl:'ok'};var a=PE.alteplase(w);lvl=g('ci')?'red':'ok';
   H=bx(g('ci')?'red':'ok','Alteplaza (Actilyse 1 mg/ml) – standard','<span class="big">'+F(a.bolus,0)+' mg bolus + '+F(a.inf,0)+' mg w 2 h</span> = '+F(a.infMlh,1)+' ml/h<div>Razem '+F(a.total,0)+' mg'+(a.lowW?' (<65 kg: 1,5 mg/kg)':'')+'</div>'+(g('ci')?'<div class="r">⚠ Przeciwwskazania – rozważ embolektomię / leczenie przezskórne</div>':''))+
    bx('','Schemat przyspieszony (ESC 2019)','<b>'+F(a.acc,0)+' mg w 15 min</b> (0,6 mg/kg, maks. 50 mg)')+bx('','','Heparyna: po alteplazie wznowienie wg ChPL przy APTT &lt;2 × górna granica normy. Nie dubluj automatycznie bolusa; oceń poprzednią antykoagulację.')+(g('cpr')?bx('orange','RKO','Dawka w zatrzymaniu krążenia <span class="dw">DO WERYFIKACJI</span> (ERC 2021: rozważ trombolizę, RKO 60–90 min)'):'');
   if(P.co.preg){H+=bx('orange','','Ciąża: tromboliza tylko w ZP wysokiego ryzyka (ESC 2019).');}}
  return{H:H,lvl:lvl};},
 '<h3>Źródła</h3>'+src([PE.SRC.ESC,PE.SRC.CHEST,PE.SRC.AHA,PE.SRC.ACT])+'<p>UFH przed trombolizą 80 j./kg (ESC 2019). <span class="dw">DO WERYFIKACJI</span>: trombolityk w RKO; schemat przyspieszony jest pozarejestracyjny.</p>');
// ============ OSTRA NIEWYDOLNOŚĆ SERCA ============
var HF=SK.ahf;
var AHF=tabbed({id:'ahf',icon:'❤️',name:'Ostra niewydolność serca'},'Ostra niewydolność serca',[['a','Leczenie']],
 function(){return inp('sbp','SBP','mmHg')+inp('spo2','SpO₂','%')+inp('rr','RR','/min')+inp('lac','Mleczany','mmol/l')+inp('oral','Furosemid p.o. dziennie','mg')+inp('ntgd','NTG','µg/min','10');},
 function(t,g,P,X){var a=HF.assess({sbp:g('sbp'),spo2:g('spo2'),rr:g('rr'),lac:g('lac')}),H='',lvl=a.lvl;
  if(a.w.length)H+=bx(a.lvl,'','<div class="'+(a.lvl==='red'?'r':'o')+'">⚠ '+a.w.join('<br>⚠ ')+'</div>');
  var fu=HF.furo(g('oral'));H+=bx(fu.lo>HF.maxDay?'orange':'ok','Furosemid i.v.','<span class="big">'+F(fu.lo,0)+(fu.hi!==fu.lo?'–'+F(fu.hi,0):'')+' mg</span> · '+fu.txt+'<div class="mut">'+HF.diuresisCheck().txt+'</div>'+(fu.lo>HF.maxDay?'<div class="o">Powyżej 400 mg/d</div>':'')+(isFinite(P.crcl)&&P.crcl<30?'<div class="o">CrCl <30 – często potrzebne wyższe dawki</div>':''));
  var n=HF.ntg(g('sbp')),d=isFinite(g('ntgd'))?g('ntgd'):10,ml=HF.ntgMlh(d,1);
  H+=bx(n.ok?(d>n.max?'red':'ok'):(isFinite(g('sbp'))?'orange':''),'Nitrogliceryna i.v. (50 mg/50 ml = 1 mg/ml)',!isFinite(g('sbp'))?'<b class="o">Podaj SBP – nitraty tylko przy SBP >110</b>':n.ok?'<span class="big">'+F(d)+' µg/min = '+F(ml,1)+' ml/h</span><div class="mut">'+n.txt+'</div>'+(d>n.max?'<div class="r">⚠ Powyżej 200 µg/min</div>':''):'<b class="o">'+n.txt+'</b>');if(d>n.max&&n.ok)lvl='red';
  if(isFinite(g('sbp'))&&g('sbp')<90)H+=bx('red','Wstrząs','Noradrenalina / dobutamina → moduł <b>Pompy SOR</b>; konsultacja kardiologiczna, ECHO');
  H+=bx('','','Tlen gdy SpO₂ <90%; NIV przy niewydolności oddechowej. Morfina – nie rutynowo.');
  return{H:H,lvl:lvl};},
 '<h3>Źródła</h3>'+src([HF.SRC.ESC,HF.SRC.HFA,HF.SRC.AHA,HF.SRC.FUR,HF.SRC.NTG])+'<p><span class="dw">DO WERYFIKACJI</span>: rozcieńczenie NTG w pompie (50 mg/50 ml) – protokół szpitala / dostępny preparat.</p>');
var L=SKM.list;['acoag','pe','ahf'].forEach(function(id,k){var m=[ACO,PEM,AHF][k];for(var i=0;i<L.length;i++)if(L[i].id===id)L[i]=m;});})();
