(function(){var C=SK.core,F=C.fmt,N=C.num;
function h(s){return String(s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function USYS(){return window.SKS&&SKS.S&&SKS.S.units==='si'?'si':'conv'}
function inp(id,lab,unit,ph){if(unit&&unit[0]==='@'){var a=unit.slice(1);return '<label>'+lab+' <input id="'+id+'" data-u="'+a+'" inputmode="decimal" placeholder="'+(ph||'')+'"><span class="mut" data-ul="'+a+'">'+SK.units.label(a,USYS())+'</span></label>';}
 return '<label>'+lab+' <input id="'+id+'" inputmode="decimal" placeholder="'+(ph||'')+'">'+(unit?'<span class="mut">'+unit+'</span>':'')+'</label>';}
function bx(cls,title,body){return '<div class="box '+cls+'">'+(title?'<h3>'+title+'</h3>':'')+body+'</div>';}
function src(list){return '<ul class="src">'+list.map(function(s){return '<li>'+s+'</li>'}).join('')+'</ul>';}
function store(id){var k='sk_m_'+id;return{get:function(){try{return JSON.parse(localStorage.getItem(k)||'{}')}catch(e){return{}}},set:function(v){localStorage.setItem(k,JSON.stringify(v))}};}
function bind(el,id,upd){var s=store(id),v=s.get(),UN=SK.units,sys=USYS();
 // migracja: dawniej zapisywano wartości w jednostce wyświetlanej; teraz wartości z jednostką (data-u) przechowywane kanonicznie w SI
 if(v.__si!==1){var leg=window.SKS&&SKS.legacy?SKS.legacy():'conv';el.querySelectorAll('input[data-u]').forEach(function(i){if(v[i.id]!=null&&v[i.id]!==''){var x=N(v[i.id]);v[i.id]=isFinite(x)?String(UN.toSI(i.dataset.u,x,leg)):''}});v.__si=1;s.set(v);}
 el.querySelectorAll('input[id],select[id]').forEach(function(i){if(i.tagName==='SELECT'){if(v[i.id]!=null)i.value=v[i.id];i.onchange=function(){v[i.id]=i.value;s.set(v);upd()}}else if(i.type==='checkbox'){i.checked=!!v[i.id];i.onchange=function(){v[i.id]=i.checked;s.set(v);upd()}}
  else if(i.dataset.u){var a=i.dataset.u;if(v[i.id]!=null&&v[i.id]!=='')i.value=UN.round(a,UN.fromSI(a,+v[i.id],sys),sys);i.oninput=function(){var x=N(i.value);v[i.id]=isFinite(x)?String(UN.toSI(a,x,USYS())):'';s.set(v);upd()}}
  else{if(v[i.id]!=null)i.value=v[i.id];i.oninput=function(){v[i.id]=i.value;s.set(v);upd()}}});
 return function(id){var e=el.querySelector('#'+id);if(e.tagName==='SELECT')return e.value;if(e.type==='checkbox')return e.checked;if(e.dataset.u){var x=v[id];return x==null||x===''?NaN:+x}return N(e.value)};}
function infoToggle(el,html){var b=el.querySelector('.info'),d=el.querySelector('.infobox');b.onclick=function(){d.hidden=!d.hidden};d.innerHTML=html;}
// ================= DKA / HHS =================
var DKA={id:'dka',icon:'🍬',name:'DKA / HHS',render:function(el,X){var S=X.S;
 el.innerHTML='<button class="info">ℹ</button><h2>DKA / HHS</h2>'+
 '<div class="row">'+inp('glu','Glukoza','@glu')+inp('ket','Ketony',"mmol/l")+inp('ph','pH','')+inp('hco3','HCO₃⁻','mmol/l')+'</div>'+
 '<div class="row">'+inp('k','K⁺','mmol/l')+inp('na','Na⁺','mmol/l')+inp('cl','Cl⁻','mmol/l')+inp('urea','Mocznik (urea)','@urea')+inp('sbp','SBP','mmHg')+SKGCS.field(false)+'<label><input type="checkbox" id="dm"> znana cukrzyca</label></div>'+
 '<div id="out"></div><div class="infobox" hidden></div><div class="disc">Narzędzie pomocnicze, niecertyfikowane. Każdą dawkę weryfikuje lekarz.</div>';
 var g=bind(el,'dka',upd);SKGCS.mount(el);DKA.update=upd;
 infoToggle(el,'<h3>Źródła</h3>'+src([SK.dka.SRC.JBDS,SK.dka.SRC.JBDSH,SK.dka.SRC.ADA,SK.dka.SRC.INS])+
  '<p>Insulina: pen NovoRapid 100 j./ml – pobranie 0,5 ml (50 j.) do strzykawki 50 ml i uzupełnienie NaCl 0,9% do 50 ml = 1 j./ml. JBDS opisuje insulinę ludzką rozpuszczalną (Actrapid); użycie analogu z pena = praktyka lokalna, <span class="dw">DO WERYFIKACJI</span> z protokołem szpitala.</p>'+
  '<p>Potas: wyłącznie gotowe worki z KCl wg protokołu / doustnie – <b>nigdy pompa strzykawkowa</b>.</p><p>Na skorygowany: Katz (1,6) i Hillier (2,4) na każde 100 mg/dl (5,55 mmol/l) glukozy >100 mg/dl. Osmolalność = 2×Na + glukoza + mocznik (wszystko w mmol/l – przeliczane automatycznie z mg/dl).</p>');
 function upd(){var P=X.P(),w=P.w,gl=g('glu'),ur=g('urea');var i={w:w,glu:gl,ket:g('ket'),ph:g('ph'),hco3:g('hco3'),k:g('k'),na:g('na'),cl:g('cl'),urea:ur,sbp:g('sbp'),gcs:g('gcs'),knownDM:g('dm'),co:P.co,age:P.age};
  var o=SK.dka.compute(i),H='';var dx={dka:'DKA',hhs:'HHS',mixed:'DKA + HHS (mieszany) → leczyć jak DKA',none:'Brak pełnych kryteriów DKA/HHS'}[o.mode];
  H+=bx(o.mode==='none'?'':o.lvl,'',' <span class="big">'+dx+'</span>'+(o.warn.length?'<div class="r">⚠ '+o.warn.map(h).join('<br>⚠ ')+'</div>':''));
  if(!o.indicated)H+=bx('orange','Insulina','<b>Uzupełnij dane / brak kryteriów — nie podawaj wlewu wg protokołu DKA</b>');
  else if(!(w>0))H+=bx('orange','','Podaj masę ciała w pasku pacjenta.');
  else{var ins=o.insUh;H+=bx(o.holdIns?'red':(ins>15&&o.mode!=='hhs'?'orange':'ok'),'Insulina – NovoRapid 50 j./50 ml (1 j./ml)',
   (o.holdIns?'<div class="r">WSTRZYMAJ insulinę do K⁺ >3,5</div>':'')+'<span class="big">'+F(ins)+' j./h = '+F(o.insMlh)+' ml/h</span> <span class="mut">('+F(o.insPerKg)+' j./kg/h)</span>'+
   '<div class="mut">0,5 ml z pena (50 j.) + 49,5 ml NaCl 0,9%</div>'+(o.insNote?'<div class="o">'+o.insNote+'</div>':''));}
  if(o.kTxt)H+=bx(i.k<3.5?'red':'ok','Potas',h(o.kTxt));
  if(o.fluids.length)H+=bx(o.shock?'red':o.fluidCaution?'orange':'ok','Płyny – NaCl 0,9%',o.shock?'<b>'+o.fluids[0].txt+'</b>':o.fluids.map(function(f,n){return (n+1)+'. 1 l / '+(f.t/60)+' h = <b>'+F(f.mlh)+' ml/h</b>'}).join(' · ')+(o.fluidCaution?'<div class="o">Ostrożnie: wiek 18–25 / ≥65, ciąża, serce, nerki</div>':''));
  H+=bx(o.gluSwitch?'orange':'','Glukoza',o.gluSwitch?'<b>'+h(o.gluTxt)+'</b>'+(o.mode!=='hhs'?'<div>Insulina ↓ 0,05 j./kg/h</div>':''):'<span class="mut">'+h(o.gluTxt)+'</span>');
  if(o.hhsTargets)H+=bx('orange','HHS',h(o.hhsTargets));
  var c=[];if(isFinite(o.ag))c.push('Luka anionowa <b>'+F(o.ag,0)+'</b>');if(isFinite(o.osm))c.push('Osm <b>'+F(o.osm,0)+'</b> mOsm/kg');if(isFinite(o.naCorr16))c.push('Na skoryg. <b>'+F(o.naCorr16,0)+'</b> / '+F(o.naCorr24,0));
  if(c.length)H+=bx('','',c.join(' · '));
  el.querySelector('#out').innerHTML=H;X.alarm('dka',o.lvl==='red');}
 upd();}};
// ================= ELEKTROLITY =================
var EL={id:'elyte',icon:'⚗️',name:'Elektrolity – reguły (klasyczny)',render:function(el,X){var UN=SK.units,tab=store('elyte_tab').get().t||'na';
 function draw(){el.innerHTML='<button class="info">ℹ</button><h2>Elektrolity</h2><div class="tabs">'+[['na','Na⁺'],['k','K⁺'],['mg','Mg²⁺'],['ca','Ca²⁺']].map(function(t){return '<button data-t="'+t[0]+'" class="'+(t[0]===tab?'on':'')+'">'+t[1]+'</button>'}).join('')+'</div><div id="f"></div><div id="out"></div><div class="infobox" hidden></div><div class="disc">Narzędzie pomocnicze, niecertyfikowane. Każdą dawkę weryfikuje lekarz.</div>';
  el.querySelectorAll('.tabs button').forEach(function(b){b.onclick=function(){tab=b.dataset.t;store('elyte_tab').set({t:tab});draw()}});
  var S=SK.elyte.SRC;infoToggle(el,'<h3>Źródła</h3>'+src([S.ESE,S.US,S.UKKA,S.ERC,S.SFE,'ChPL preparatów'])+
   '<p>Na: wzór Adrogué–Madias (szacunek – kontrola Na po 1, 6, 12 h). 3% NaCl = 513 mmol/l; przygotowanie wg protokołu szpitala <span class="dw">DO WERYFIKACJI</span>. TBW: M 0,6 / K 0,5; ≥65 lat: M 0,5 / K 0,45.</p>'+
   '<p>K: insulina wg UKKA = insulina rozpuszczalna (Actrapid); NovoRapid = praktyka lokalna <span class="dw">DO WERYFIKACJI</span>.</p><p>Mg: leczenie hipomagnezemii poza TdP <span class="dw">DO WERYFIKACJI</span>. Preparaty PL (MgSO₄ 20%, Calcium chloratum 10%, Calcium gluconicum 10%) – sprawdź ampułkę <span class="dw">DO WERYFIKACJI</span>.</p>');
  var f=el.querySelector('#f');
  if(tab==='na')f.innerHTML='<div class="row">'+inp('na','Na⁺','mmol/l')+inp('tg','Plan wzrostu /24 h','mmol/l','5')+'<label><input type="checkbox" id="sev"> objawy ciężkie</label><label><input type="checkbox" id="hr"> wysokie ryzyko ODS (alkohol, niedożywienie, hipoK, wątroba, Na ≤105)</label></div>';
  if(tab==='k')f.innerHTML='<div class="row">'+inp('k','K⁺','mmol/l')+inp('glu','Glukoza przed','@glu')+'<label><input type="checkbox" id="ecg"> zmiany w EKG</label></div>';
  if(tab==='mg')f.innerHTML='<div class="row">'+inp('mgv','Mg','@mg')+'<label><input type="checkbox" id="tdp"> torsade de pointes</label></div>';
  if(tab==='ca')f.innerHTML='<div class="row">'+inp('cav','Ca całk.','@ca')+inp('alb','Albumina','g/l')+'<label><input type="checkbox" id="sy"> objawy (tężyczka, drgawki, QT)</label></div>';
  var g=bind(f,'elyte_'+tab,upd);EL.update=upd;
  function upd(){var P=X.P(),H='',lvl='ok';
   if(tab==='na'){var hr=g('hr')||P.co.liver;var o=SK.elyte.hypoNa({w:P.w,na:g('na'),sex:P.sex,age:P.age,severe:g('sev'),highRisk:hr,target:g('tg')});
    if(!o)H=bx('orange','','Podaj masę (pasek) i Na⁺.');else if(o.noHypo)H=bx('ok','','Na⁺ ≥135 – brak hiponatremii, brak wskazań do korekcji.');else{lvl=o.lvl;
     if(o.lvl!=='ok'&&!o.warn.length&&!g('sev'))H+=bx(o.lvl,'','<span class="big">Na⁺ '+F(g('na'),0)+' – hiponatremia '+(o.lvl==='red'?'ciężka':'umiarkowana')+'</span>');
     if(g('sev'))H+=bx('red','Objawy ciężkie','<span class="big">3% NaCl 150 ml w 20 min</span><div>Kontrola Na po 20 min, powtórz do 2× lub do wzrostu o 5 mmol/l</div><div class="mut">szac. wzrost po 150 ml: '+F(o.bolusRise,1)+' mmol/l</div>');
     H+=bx(o.lvl==='red'&&o.warn.length?'red':'ok','Limit korekcji','<span class="big">≤ '+o.limit+' mmol/l / 24 h</span>'+(o.limit===8?' <span class="o">(wysokie ryzyko ODS)</span>':'')+' · potem ≤8 / każde 24 h'+(o.warn.length?'<div class="r">⚠ '+o.warn.join('<br>')+'</div>':''));
     H+=bx('','Adrogué–Madias (TBW '+F(o.tbw,1)+' l)','1 l 3% NaCl: <b>+'+F(o.d3,1)+'</b> mmol/l · 1 l 0,9% NaCl: <b>+'+F(o.d09,1)+'</b> mmol/l<div>Plan +'+F(o.target,1)+' mmol/l/24 h → 3% NaCl <b>'+F(o.vol3,0)+' ml</b> = <b>'+F(o.mlh3,1)+' ml/h</b></div>');}}
   if(tab==='k'){var gl=g('glu');var o=SK.elyte.hyperK({k:g('k'),ecg:g('ecg'),glu:gl});
    if(!o)H=bx('orange','','Podaj K⁺.');else{lvl=o.lvl;H+=bx(o.lvl,'','<span class="big">K⁺ '+F(g('k'),1)+(o.sev?' – hiperkaliemia '+o.sev:'')+'</span>');
     H+=o.steps.map(function(s,n){return bx(s.t==='Wapń'?'red':'ok',(n+1)+'. '+s.t,h(s.d))}).join('');if(!o.steps.length&&g('k')>=5.5)H+=bx('','','Leczenie przyczyny, kontrola K⁺ i EKG.');}}
   if(tab==='mg'){var v=g('mgv');var o=SK.elyte.mg({mg:v,tdp:g('tdp')});lvl=o.lvl;
    H=o.txt?bx(o.lvl,'MgSO₄','<span class="big">'+h(o.txt)+'</span>'+(o.lvl==='red'?'<div>= '+F(o.mlOf20)+' ml MgSO₄ 20% (200 mg/ml)</div>':'')):bx('','','Mg: '+(isFinite(v)?UN.round('mg',UN.fromSI('mg',v,X.S.units),X.S.units)+' '+UN.label('mg',X.S.units):'—'));}
   if(tab==='ca'){var v=g('cav');var o=SK.elyte.ca({ca:v,alb:g('alb'),sympt:g('sy')});
    if(!o)H=bx('orange','','Podaj Ca.');else{lvl=o.lvl;H+=bx(o.lvl,'','Ca skorygowany: <span class="big">'+UN.round('ca',UN.fromSI('ca',o.corr,X.S.units),X.S.units)+' '+UN.label('ca',X.S.units)+'</span>'+(o.corr>3?'<div class="r">⚠ Hiperkalcemia ciężka</div>':''));
     if(o.bolus)H+=bx('red','Hipokalcemia',h(o.bolus)+'<div>'+h(o.inf)+'</div>');}}
   el.querySelector('#out').innerHTML=H;X.alarm('elyte',lvl==='red');}
  upd();}
 draw();}};
// ================= USTAWIENIA / O PROGRAMIE =================
var SET={id:'settings',icon:'⚙️',name:'Ustawienia',render:function(el,X){var S=X.S;
 el.innerHTML='<h2>Ustawienia</h2><div class="box"><div class="row"><label><input type="checkbox" id="snd"> Dźwięk syreny</label><label>Głośność <input type="range" id="vol" min="0" max="1" step="0.1" style="width:140px"></label><button id="tst" class="tg">▶ test alarmu</button></div>'+
 '<div class="row"><b>Jednostki laboratoryjne (wszystkie moduły):</b><span class="seg" id="un"><button data-v="conv">mg/dl (mg%)</button><button data-v="si">SI (mmol/l, µmol/l)</button></span></div><p class="mut">Dotyczy: glukoza, mocznik (urea), kreatynina, wapń (także zjonizowany), magnez, paracetamol (mg/l ↔ µmol/l). Na⁺, K⁺, Cl⁻, HCO₃⁻, ketony, mleczany – zawsze mmol/l (= mEq/l).</p>'+
 '<div class="row"><b>Czcionka:</b><span class="seg" id="fs"><button data-v="14">A−</button><button data-v="16">A</button><button data-v="19">A+</button><button data-v="22">A++</button></span></div>'+
 '<div class="row"><b>Domyślna strzykawka:</b><span class="seg" id="sy"><button data-v="50">50 ml</button><button data-v="20">20 ml</button></span></div>'+
 '<div class="row"><span class="mut">Motyw: jasny (jedyny).</span></div>'+
 '<div class="row"><button id="rst" class="tg" style="border-color:#d81b30;color:#d81b30">Resetuj wszystkie dane i ustawienia</button></div></div>';
 function seg(id,key,conv){var e=el.querySelector('#'+id);function r(){e.querySelectorAll('button').forEach(function(b){b.classList.toggle('on',String(S[key])===b.dataset.v)})}r();e.onclick=function(ev){var b=ev.target.closest('button');if(b){if(key==='units')SKS.setUnits(b.dataset.v);else X.setS(key,conv?conv(b.dataset.v):b.dataset.v);r();}}}
 seg('un','units');seg('fs','fs',Number);seg('sy','syr',Number);
 var sn=el.querySelector('#snd'),vo=el.querySelector('#vol');sn.checked=S.sound;vo.value=S.vol;sn.onchange=function(){X.setS('sound',sn.checked)};vo.oninput=function(){X.setS('vol',+vo.value)};
 el.querySelector('#tst').onclick=function(){X.alarm('test',true);setTimeout(function(){X.alarm('test',false)},2500)};
 el.querySelector('#rst').onclick=function(){if(confirm('Resetuj wszystkie dane i ustawienia: usunąć dane pacjenta, dokumentację, wykonane, bilans, zapisane nastawy, ulubione i ustawienia? Tej operacji nie można cofnąć.')){localStorage.clear();sessionStorage.clear();location.reload();}};}};
var ABOUT={id:'about',icon:'ℹ️',name:'O programie',render:function(el){el.innerHTML='<h2>Asystent lekarza SOR</h2><div class="box"><div class="big">Asystent lekarza SOR</div><p>Narzędzie pomocnicze – niecertyfikowane · wersja 5.1</p><p>Kalkulatory dla SOR: Pompy SOR, Omdlenie SOR, Stan padaczkowy SOR, DKA/HHS, Elektrolity, Antykoagulacja i odwracanie, Zatorowość płucna, Ostra niewydolność serca, Anafilaksja, Sepsa, Zatrucia, AF, Krwawienie z GI, Transfuzjologia, Neurologia (algorytm podejrzenia udaru, NIHSS, tromboliza, ICH, TIA, otępienie/majaczenie). Działa offline.</p><p><b>Narzędzie robocze. Każdą dawkę i decyzję weryfikuje lekarz.</b></p><p class="mut">Kolory: zielony – OK, pomarańczowy – ostrożnie, czerwony – niebezpieczne (lampa + syrena; 🔊 wycisza).</p></div>';}};
var soon=function(id,icon,name){return{id:id,icon:icon,name:name,soon:true,render:function(el){el.innerHTML='<h2>'+name+'</h2><div class="box orange">Moduł w przygotowaniu – kolejna wersja.</div>'}}};
window.SKM={util:{inp:inp,bx:bx,src:src,store:store,bind:bind,infoToggle:infoToggle,h:h},list:[
 {id:'pompy',icon:'💉',name:'Pompy SOR',frame:'mod/pompy/index.html',red:'.out.bad,.rng.bad,input.bad,.err'},
 {id:'omdl',icon:'🚦',name:'Omdlenie SOR',frame:'mod/omdlenie/index.html'},
 {id:'se',icon:'⚡',name:'Stan padaczkowy',frame:'mod/se/index.html',red:'#res .mx,input.bad',hide:'.wrow,.tg,#crr,.disc{display:none!important}'},
 {id:'el',icon:'⚗️',name:'Elektrolity SOR',frame:'mod/el/index.html',red:'.sev.red,input.bad',hide:'.wrow,.disc{display:none!important}'},
 {id:'trop',icon:'🫀',name:'Troponina / OZW',frame:'mod/troponina/index.html',red:'#light.L-red,#hosp.on',hide:'#mute,#next{display:none!important}'},
 DKA,EL,
 soon('acoag','🩸','Antykoagulacja'),soon('pe','🫁','Zatorowość płucna'),soon('ahf','❤️','Ostra niewydolność serca'),soon('ana','🐝','Anafilaksja'),soon('sepsis','🦠','Sepsa'),soon('tox','☠️','Zatrucia'),soon('af','💓','AF'),soon('gib','🩸','Krwawienie z GI'),soon('transf','🅰️','Transfuzjologia'),
 {sep:true},SET,ABOUT]};
// Kolejność menu: …, Neurologia, [tu: Neuroinfekcje – SKM.insertAfter('neuro',mod)], ICD-10, ICD-9, ───, Ustawienia, O programie.
// ICD-10/ICD-9 (icd-ui.js) rejestrują się zawsze tuż przed separatorem Ustawień, więc nowy moduł wstawiony po 'neuro' trafi przed nie.
SKM.insertAfter=function(id,mod){var L=SKM.list,i=L.findIndex(function(m){return m.id===id});if(i<0)L.push(mod);else L.splice(i+1,0,mod);return mod;};})();
