// ETAP B2 – warstwa UI: antybiotyki w PZP (korekta nerkowa), sepsa (kryteria, pakiet 1 h, antybiotyki wg ogniska, ponowna ocena, raport),
// zatrucia grzybami (gatunki, próbki, leczenie, kontakty) i skale otępienia (AMTS, MoCA, MMSE, CDR).
// Silniki: calc/abxB2.js, mushB2.js, dementiaB2.js (testowane w Node: tests/etapB2.cjs). Dane: data/antybiotyki_renal.js.
(function(){
var C=SK.core,F=C.fmt,N=C.num,U=SKM.util,bx=U.bx,inp=U.inp,chk=U.chk,tabbed=U.tabbed,store=U.store,srcList=U.src;
var A=SK.abxB2,M=SK.mushB2,DM=SK.dementiaB2,DEC='DO DECYZJI LEKARZA';
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
function rich(s){return esc(s).replace(/DO DECYZJI LEKARZA/g,'<span class="dw">DO DECYZJI LEKARZA</span>').replace(/NUMER DO UZUPEŁNIENIA/g,'<span class="dw">NUMER DO UZUPEŁNIENIA</span>');}
function dw(t){return ' <span class="dw">'+(t||DEC)+'</span>';}
function fc(x,d){return F(x,d);}
function srcl(t){return '<div class="b1src">Źródło: '+t+'</div>';}
function tbl(head,rows){return '<div class="b1tw"><table class="b1t"><thead><tr>'+head.map(function(x){return '<th>'+x+'</th>';}).join('')+'</tr></thead><tbody>'+rows.map(function(r){var c=r.cls||'',cells=r.cells||r;return '<tr'+(c?' class="'+c+'"':'')+'>'+cells.map(function(x){return '<td>'+x+'</td>';}).join('')+'</tr>';}).join('')+'</tbody></table></div>';}
function ul(a){return a&&a.length?'<ul>'+a.map(function(x){return '<li>'+rich(x)+'</li>';}).join('')+'</ul>':'';}
function nz(x){return typeof x==='number'&&isFinite(x);}
function sysU(){return window.SKS&&SKS.S&&SKS.S.units==='si'?'si':'conv';}
function creaTxt(mg){if(!nz(mg))return '—';var umol=Math.round(mg*88.42);return sysU()==='si'?umol+' µmol/l ('+F(mg,2)+' mg/dl)':F(mg,2)+' mg/dl ('+umol+' µmol/l)';}
(function(){var s=document.createElement('style');s.textContent=
 '.b2tier{display:inline-block;border-radius:6px;padding:0 7px;font-size:.78rem;font-weight:700;margin-left:4px}.b2tierA{background:#ffd9de;border:1px solid #c4001a;color:#7a0010}.b2tierB{background:#fff0c9;border:1px solid #e3b341;color:#6b4a00}'+
 '.b2cont{border:3px solid #c4001a;border-radius:10px;background:#fff7f8;padding:8px 12px;margin:8px 0}.b2cont h3{margin:0 0 4px;color:#7a0010;font-size:1rem}.b2cont table{width:100%;border-collapse:collapse;font-size:.92rem}.b2cont td{border-top:1px solid #f0c4ca;padding:4px 6px;vertical-align:top}.b2cont a.tel{display:inline-block;background:#c4001a;color:#fff;border-radius:6px;padding:4px 10px;margin:2px 4px 2px 0;font-weight:800;text-decoration:none;white-space:nowrap}'+
 '.b2cont .fill{display:inline-block;background:#fff0c9;border:1px dashed #b07d00;border-radius:6px;padding:2px 8px;font-weight:700}.b2nt{border:2px solid #c46a00;background:#fff4e0;border-radius:8px;padding:6px 10px;margin:6px 0;font-weight:700}'+
 '.b2grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:8px;margin:6px 0}.b2sp{border:1px solid #d6cdea;border-radius:10px;padding:6px;background:#fff;text-align:left;cursor:pointer;display:flex;flex-direction:column;gap:2px}.b2sp.on{border:3px solid #55318f}.b2sp img{width:100%;height:96px;object-fit:cover;border-radius:6px}'+
 '.b2card{border:2px solid #d6cdea;border-radius:12px;padding:8px 12px;margin:8px 0;background:#fff}.b2card img.b2zoom{max-width:100%;max-height:240px;border-radius:8px;cursor:zoom-in;margin:4px 6px 4px 0}'+
 '#b2lb{position:fixed;inset:0;background:rgba(0,0,0,.88);z-index:9999;display:none;align-items:center;justify-content:center;flex-direction:column;padding:10px}#b2lb.on{display:flex}#b2lb img{max-width:96vw;max-height:80vh;object-fit:contain;border-radius:8px}#b2lb .cap{color:#fff;margin-top:8px;font-size:.9rem;max-width:96vw;text-align:center}#b2lb button{position:absolute;top:10px;right:14px;font-size:1.5rem;padding:6px 14px;border-radius:8px;border:0;background:#fff;cursor:pointer}'+
 '.b2it{display:block;margin:2px 0;padding:5px 8px;border:1px solid #e1d9f2;border-radius:8px;background:#fff;line-height:1.25}.b2it input{min-width:22px;min-height:22px;vertical-align:middle;margin-right:6px}.b2it .ins{display:block;color:#556;font-size:.84rem;margin-left:30px}.b2h{width:100%;margin:12px 0 2px;padding:3px 8px;background:#f1ecfb;border-radius:6px;font-weight:800;color:#55318f}'+
 '.b2cdr{border-collapse:collapse;width:100%;font-size:.88rem}.b2cdr th,.b2cdr td{border:1px solid #d6cdea;padding:4px 6px;vertical-align:top}.b2cdr th{background:#f1ecfb}.b2cdr label{display:block;cursor:pointer;line-height:1.2}'+
 '.b2res{font-size:1.4rem;font-weight:800}.b2pr{border:2px solid #333;padding:10px;margin:8px 0;background:#fff;color:#000}@media print{.b2cont{break-inside:avoid}}';
 document.head.appendChild(s);
 // lightbox (działa offline: zdjęcia są w pamięci podręcznej SW)
 var lb=document.createElement('div');lb.id='b2lb';lb.innerHTML='<button aria-label="Zamknij">✕</button><img alt=""><div class="cap"></div>';document.body.appendChild(lb);
 lb.onclick=function(e){if(e.target!==lb.querySelector('img'))lb.classList.remove('on');};document.addEventListener('keydown',function(e){if(e.key==='Escape')lb.classList.remove('on');});
 window.SORB2lightbox=function(src,cap){lb.querySelector('img').src=src;lb.querySelector('.cap').innerHTML=cap||'';lb.classList.add('on');};})();
// ---------- wspólne: kontakty toksykologiczne ----------
function contactsPanel(){var rows=M.CONTACTS.map(function(c){var phones=c.tel.length?c.tel.map(function(t){return '<a class="tel" href="'+M.telHref(t)+'">'+esc(t)+'</a>';}).join(''):'<span class="fill">'+esc(c.fill)+'</span>';
 return '<tr><td>'+esc(c.label)+'</td><td>'+phones+(c.extra?'<div class="mut">'+esc(c.extra)+'</div>':'')+'</td><td>'+(c.verified?'<span class="g">✔ zweryfikowano '+esc(c.date)+'</span>':'<span class="o">nie zweryfikowano</span>')+(c.url?'<div><a href="'+c.url+'" target="_blank" rel="noopener noreferrer">'+esc(c.urlLabel||c.url)+' ↗</a></div>':'')+'</td></tr>';}).join('');
 return '<div class="b2cont" id="b2contacts"><h3>📞 Kontakty toksykologiczne (stały panel) <span class="mut">'+esc(M.STAMP)+'</span></h3><div class="b2nt">'+esc(M.NT)+'</div><table>'+rows+'</table><div class="mut">Numery sprawdzono na stronach oficjalnych w dniu weryfikacji; zmieniają się – przed poleganiem w zagrożeniu życia dzwoń również pod 112. Brakujące numery lokalne uzupełnia użytkownik.</div></div>';}
// ============================================================ PZP – antybiotyki ============================================================
function drugRows(drugs){return drugs.map(function(d){return {cls:d.mod&&d.renalStatus!=='dec'?'warn':'',cells:['<b>'+esc(d.name)+'</b> <span class="mut">'+esc(d.route)+'</span>'+(d.role?'<div class="mut">'+esc(d.role)+'</div>':''),'<b>'+rich(d.dose)+'</b>',rich(d.renal),rich(d.note||'')]};});}
function regimenHtml(r){return '<h4 class="b1h">'+rich(r.label)+'</h4>'+(r.why?'<div class="mut">'+rich(r.why)+'</div>':'')+tbl(['Lek','Dawka i droga','Korekta nerkowa / dializa (CrCl)','Uwagi'],drugRows(r.drugs))+(r.src?srcl(esc(r.src)):'');}
function crclBox(c,P,rrt){if(!c)return '';if(!c.ok)return bx('orange','CrCl nieobliczony','Brakuje: <b>'+esc(c.missing.join(', '))+'</b>. Uzupełnij w pasku pacjenta (wiek, płeć, masa, wzrost, kreatynina). Korekta nerkowa nie została wykonana.');
 var diff=nz(P.crcl)&&Math.abs(P.crcl-c.crcl)>=1?'<div class="mut">Pasek pacjenta (masa rzeczywista): '+F(P.crcl,0)+' ml/min; do dawkowania użyto wartości z korektą masy.</div>':'';
 return bx(c.crcl<30?'orange':'ok','CrCl (Cockcroft–Gault, z korektą masy): <span class="b2res">'+F(c.crcl,0)+' ml/min</span>','Kreatynina '+creaTxt(c.crMg)+' · masa użyta: '+F(c.wUsed,0)+' kg ('+esc(c.basis)+')'+(nz(c.ibw)?' · IBW '+F(c.ibw,0)+' kg':'')+(nz(c.bmi)?' · BMI '+F(c.bmi,1):'')+(c.heightMissing?'<div class="o">Brak wzrostu: nie oceniono otyłości/niedowagi – uzupełnij wzrost.</div>':'')+(c.extreme.length?'<div class="r">Skrajna masa: '+esc(c.extreme.join(', '))+' – '+DEC+'</div>':'')+diff+(rrt&&rrt!=='none'?'<div class="o">Dializa/CRRT – CrCl nie opisuje klirensu; użyto wierszy dla dializy.</div>':'')+'<div class="mut">Reguła masy: rzeczywista, jeśli < IBW; skorygowana (IBW+0,4×(rz−IBW)), jeśli >120% IBW; w pozostałych przypadkach IBW (UNMC/Nebraska ASP).</div>');}
function capTab(H){var number=H.number,select=H.select,group=H.group,tri=H.tri,check=H.check,box=H.box,missing=H.missing;
 return{id:'antibiotics',name:'Antybiotyki – dobór empiryczny (B2)',
  form:function(){return group('Rozpoznanie i miejsce leczenia',tri('confirmed','PZP potwierdzone klinicznie / obrazowo')+select('place','Planowane miejsce leczenia',[['','Nie ustalono'],['out','Ambulatoryjnie (po pełnej kwalifikacji)'],['ward','Oddział, bez ciężkiego PZP'],['icu','Ciężkie PZP / intensywny nadzór']])+tri('comorb','Choroby współistniejące: serce, płuca, wątroba, nerki, cukrzyca, alkoholizm, nowotwór, asplenia')+tri('nursing','Dom opieki / placówka długoterminowa'))+
   group('Czynniki ryzyka drobnoustrojów opornych',tri('mrsa','MRSA w drogach oddechowych w ciągu roku / potwierdzony czynnik ryzyka')+tri('pseudo','Pseudomonas w drogach oddechowych w ciągu roku / potwierdzony czynnik ryzyka')+tri('recent','Hospitalizacja + antybiotyk pozajelitowy w ciągu 90 dni')+select('asp','Zachłyśnięcie',[['none','Nie / brak'],['pneumonitis','Zachłyśnięcie bez ropnia/ropniaka'],['abscess','Ropień płuca / ropniak']]))+
   group('Alergia, ciąża, wątroba, nerki, QT',select('allergy','Alergia na antybiotyki β-laktamowe',[['','Nie ustalono'],['none','Nie stwierdzono po zebraniu wywiadu'],['late','Reakcja późna, nieciężka (np. wysypka plamisto-grudkowa po >1 h)'],['immediate','Natychmiastowa (anafilaksja, pokrzywka, obrzęk naczynioruchowy) lub ciężka reakcja skórna (SJS/TEN/DRESS)']])+select('preg','Ciąża / karmienie',[['','Nie ustalono'],['none','Nie dotyczy'],['pregnant','Ciąża'],['breast','Karmienie piersią']])+select('liver','Choroba wątroby',[['','Nie ustalono'],['none','Brak'],['mild','Łagodna / umiarkowana'],['severe','Ciężka (Child-Pugh C)']])+select('rrt','Leczenie nerkozastępcze',[['none','Brak'],['hd','Hemodializa (HD)'],['crrt','CRRT'],['pd','Dializa otrzewnowa']])+tri('qt','Wydłużony QT / leki wydłużające QT / niewyrównane K-Mg')+tri('serotonin','Leki serotoninergiczne / IMAO (przeciwwskazanie względne do linezolidu)'))+
   '<p class="mut">Wiek, płeć, masa, wzrost i kreatynina (mg/dl lub µmol/l wg ustawień) pochodzą z paska pacjenta. Nie oznaczono niczego domyślnie: puste pole = brak wyniku.</p>'+H.reviewed();},
  calc:function(g,P){var inpt={age:P.age,sex:P.sex,w:P.w,h:P.h,crMg:P.crMg,setting:g('place')||undefined,confirmed:g('confirmed'),comorb:g('comorb'),nursing:g('nursing'),mrsa:g('mrsa'),pseudo:g('pseudo'),recentHosp:g('recent'),aspiration:g('asp'),allergy:g('allergy')||undefined,preg:g('preg')||undefined,liver:g('liver')||undefined,rrt:g('rrt')||'none',qt:g('qt'),serotonin:g('serotonin')};
   if(P.sex==='m'&&inpt.preg===undefined)inpt.preg='none';if(P.co&&P.co.preg&&inpt.preg==='none')inpt.preg='pregnant';
   var r=A.capPlan(inpt);var h=box('Dobór warunkowy do akceptacji lekarza'+dw(),'<p>Zasada: <b>polskie rekomendacje (NPOA 2016/2020) mają pierwszeństwo</b>; różnice z ERS/ESCMID, ATS/IDSA 2019 i ATS 2025 opisano niżej. Brak danych = brak wyniku; nic nie jest domyślnie „prawidłowe”.</p>','orange');
   var asm=window.SORClinicalUI&&0;
   if(!r.ok||r.needs.length){return{html:h+missing('Brak wyniku – uzupełnij: '+(r.needs.length?r.needs.join('; '):r.msg)+'.'),alarm:false};}
   h+=crclBox(r.crcl,P,inpt.rrt);
   if(r.avoid.length)h+=box('Wykluczone / unikać','<ul><li>'+r.avoid.map(rich).join('</li><li>')+'</li></ul>','orange');
   r.regimens.forEach(function(x){h+=regimenHtml(x);});
   if(!r.regimens.length)h+=box('Brak zweryfikowanego schematu','Przy zadanych ograniczeniach aplikacja nie podaje schematu – '+DEC+'.','red');
   if(r.decisions.length)h+=box('Do decyzji lekarza ('+r.decisions.length+')','<ul><li>'+r.decisions.map(rich).join('</li><li>')+'</li></ul>','orange');
   if(r.warnings.length)h+=box('Ostrzeżenia','<ul><li>'+r.warnings.map(rich).join('</li><li>')+'</li></ul>','orange');
   if(r.notes.length)h+=box('Uwagi','<ul><li>'+r.notes.map(rich).join('</li><li>')+'</li></ul>');
   h+=box('Czas leczenia – różnice źródeł','<ul><li>'+r.duration.map(rich).join('</li><li>')+'</li></ul>');
   h+=box('Polskie vs międzynarodowe – różnice','<ul><li>Ceftriakson: NPOA 2 g/24 h; ATS/IDSA 1–2 g/24 h.</li><li>Makrolid w monoterapii: NPOA dopuszcza przy oporności pneumokoków <20%; ATS/IDSA 2019 – tylko gdy oporność <25%, w innych sytuacjach nie zaleca.</li><li>Wankomycyna: NPOA 2020 podaje niespójnie 30 mg/kg/dobę w 2–3 dawkach (PZP szpitalne) i 15 mg/kg co 12 h (ciężkie PZP); dawkowanie wg stężeń – '+DEC+'.</li><li>ERS 2023 (ciężkie PZP): makrolid zamiast fluorochinolonu, GKS przy wstrząsie; ATS 2025: GKS w ciężkim PZP (poza grypą), skrócenie terapii w nieciężkim PZP.</li></ul>'.replace(/DO DECYZJI LEKARZA/g,'<span class="dw">DO DECYZJI LEKARZA</span>'));
   var drugs=[];r.regimens.forEach(function(x){x.drugs.forEach(function(d){if(!drugs.some(function(y){return y.name===d.name&&y.dose===d.dose;}))drugs.push(d);});});
   var enabled=H.gate(g)&&r.needs.length===0&&r.decisions.length===0;
   if(drugs.length)h+='<div class="b1btnrow">'+drugs.slice(0,8).map(function(d){return H.transfer(esc(d.name)+' → rejestr (propozycja)',{kind:'bolus',name:d.name,dose:d.dose,route:d.route,note:'B2: propozycja do akceptacji; korekta nerkowa: '+d.renal},enabled);}).join('')+'</div><div class="mut">Przyciski aktywne po zaznaczeniu potwierdzenia przeglądu i gdy brak punktów „DO DECYZJI”.</div>';
   h+=H.sources([]).replace('<ul></ul>','<ul>'+r.sources.map(function(s){return '<li>'+esc(s)+'</li>';}).join('')+'</ul>');
   var severeAlarm=inpt.setting==='icu'||inpt.rrt==='crrt';
   return{html:h,alarm:false};}};}
// ============================================================ SEPSA ============================================================
function sepInputs(g,P){var map=(nz(g('sbp'))&&nz(g('dbp')))?(g('sbp')+2*g('dbp'))/3:NaN;var bili=nz(g('bili'))?g('bili')/17.104:NaN;var gc=g('gcs');
 var aw=g('aw'),altered=aw==='alt'?true:aw==='ok'?false:undefined,o2=g('o2s')==='o2'?true:g('o2s')==='air'?false:undefined;
 return{infection:g('inf')===true,rr:g('rr'),sbp:g('sbp'),altered:altered,cvpu:altered,spo2:g('spo2'),o2:o2,scale2:g('sc2')===true,hr:g('hr'),temp:g('temp'),
  pf:g('pf'),vent:g('vent')===true,plt:g('plt'),bili:bili,map:map,ne:g('ne'),dobu:g('dobu')===true,gcs:gc,crMg:P.crMg,uo:g('uo'),lac:g('lac'),vasopressor:g('vaso')===true||(nz(g('ne'))&&g('ne')>0),hypotension:nz(map)?map<65:undefined};}
function sepForm(t){
 if(t==='a')return '<div class="b1full">'+chk('inf','<b>Podejrzenie / rozpoznanie zakażenia</b> (warunek oceny sepsy)')+'</div>'+
  '<div class="b2h">qSOFA / NEWS2 – parametry życiowe</div>'+inp('rr','Oddechy','/min')+inp('sbp','SBP','mmHg')+inp('dbp','DBP','mmHg')+inp('hr','Tętno','/min')+inp('temp','Temperatura','°C')+inp('spo2','SpO₂','%')+'<label>Tlen <select id="o2s"><option value="">— nie oceniono —</option><option value="air">powietrze</option><option value="o2">tlenoterapia</option></select></label>'+chk('sc2','SpO₂ skala 2 (docelowo 88–92%, hiperkapnia – tylko decyzją lekarza)')+'<label>Świadomość (ACVPU) <select id="aw"><option value="">— nie oceniono —</option><option value="ok">A – przytomny, bez nowego splątania</option><option value="alt">nowe splątanie lub C/V/P/U</option></select></label>'+
  '<div class="b2h">SOFA (opcjonalnie – brakujące elementy nie są liczone jako 0)</div>'+inp('pf','PaO₂/FiO₂','mmHg')+chk('vent','wspomaganie wentylacji')+inp('plt','Płytki','G/l')+inp('bili','Bilirubina','@bili')+inp('uo','Diureza','ml/dobę')+inp('ne','Noradrenalina','µg/kg/min')+chk('dobu','dobutamina (dowolna dawka)')+SKGCS.field(false)+
  '<div class="b2h">Perfuzja</div>'+inp('lac','Mleczany','mmol/l')+chk('vaso','wazopresor stosowany (po resuscytacji płynowej)');
 if(t==='b')return inp('t0','Godzina rozpoznania (hh:mm) – opcjonalnie','')+'<p class="mut">Pola poniżej to lista kontrolna; zaznacz wykonane.</p>'+
  chk('d_lac','Mleczany oznaczone')+chk('d_cult','Posiewy krwi ≥2 zestawy pobrane PRZED antybiotykiem (bez istotnego opóźnienia antybiotyku)')+chk('d_abx','Antybiotyk empiryczny podany')+chk('d_fluid','Płyny krystaloidy rozpoczęte')+chk('d_map','MAP ≥65 mmHg osiągnięte')+chk('d_ne','Noradrenalina włączona (gdy hipotensja po płynach)')+chk('d_src','Ognisko zakażenia zidentyfikowane / kontrola ogniska zaplanowana')+
  '<div class="b1full">'+chk('shock','Wstrząs septyczny (wazopresor + mleczany >2 mmol/l po płynach)')+chk('hl','Wysokie prawdopodobieństwo sepsy')+'</div>'+inp('nedose','Aktualna dawka noradrenaliny','µg/kg/min')+inp('nehrs','Czas trwania takiej dawki','h')+chk('hyd','Hydrokortyzon już włączony');
 if(t==='c')return '<label>Ognisko zakażenia <select id="source"><option value="">— wybierz —</option>'+Object.keys(A.SOURCES).map(function(k){return '<option value="'+k+'">'+A.SOURCES[k]+'</option>';}).join('')+'</select></label>'+
  '<label>Alergia na β-laktamy <select id="allergy"><option value="none">Nie stwierdzono</option><option value="late">Późna, nieciężka</option><option value="immediate">Natychmiastowa / ciężka skórna</option></select></label>'+
  '<label>Leczenie nerkozastępcze <select id="rrt"><option value="none">Brak</option><option value="hd">Hemodializa</option><option value="crrt">CRRT</option><option value="pd">Dializa otrzewnowa</option></select></label>'+
  chk('hospital','zakażenie szpitalne / związane z opieką zdrowotną')+chk('mrsa','ryzyko / kolonizacja MRSA')+chk('esbl','ryzyko ESBL')+chk('pseudo','ryzyko Pseudomonas')+chk('mdr','wysokie ryzyko MDR')+chk('immuno','niedobór odporności (OUN)');
 if(t==='d')return '<p class="mut">Ponowna ocena – zaznacz wykonane / spełnione.</p>'+chk('r_map','MAP ≥65 mmHg')+chk('r_lac','Mleczany powtórzone i maleją (kierunek resuscytacji; SSC 2021)')+chk('r_crt','Czas nawrotu włośniczkowego (CRT) oceniony (SSC 2021, rek. 8)')+chk('r_fl','Odpowiedź na płyny oceniona (parametry dynamiczne / USG) – brak przeładowania')+chk('r_uo','Diureza oceniona')+chk('r_cult','Wyniki posiewów przejrzane')+chk('r_deesc','Deeskalacja antybiotyków rozważona (codziennie; SSC 2021, rek. 29)')+chk('r_dose','Dawki antybiotyków sprawdzone pod kątem nerek/wątroby/masy')+chk('r_src','Kontrola ogniska wykonana lub zaplanowana (SSC 2021, rek. 27)')+chk('r_glu','Glikemia ≥180 mg/dl (≈10 mmol/l): insulina wg protokołu (SSC 2021, rek. 69)')+chk('r_hc','Hydrokortyzon rozważony przy utrzymującym się szoku (kryterium: noradrenalina ≥0,25 µg/kg/min ≥4 h)')+chk('r_bic','Wodorowęglan: tylko pH ≤7,2 i AKI 2–3 (SSC 2021, rek. 72)')+chk('r_dur','Czas leczenia zaplanowany (krótszy, jeśli możliwe; SSC 2021, rek. 30)');
 return '';}
function sepCalc(t,g,P){
 if(t==='a'){var i=sepInputs(g,P);var r=A.sepsisAssess(i);var H='';
  if(!r.ok)return{H:bx('orange','Sepsa – ocena'+dw(),rich(r.msg)+'<div class="mut">Wprowadź parametry; brak danych = brak wyniku.</div>')+srcl(esc(A.SRC.ssc21)),lvl:'ok'};
  var q=r.q,s=r.s,n=r.n;
  H+=bx(r.shock?'red':r.suspected?'orange':'ok',esc(r.msg),(r.shockPossible?'<div class="o">Wazopresor bez mleczanów: nie można potwierdzić wstrząsu septycznego (wymagane mleczany >2 mmol/l).</div>':'')+'<div class="mut">Rozpoznanie wg NPOA 2020/Sepsis-3: podejrzenie zakażenia + SOFA ≥2 pkt LUB qSOFA ≥2/3. SSC 2021 nie zaleca qSOFA jako jedynego narzędzia przesiewowego – dlatego pokazano też NEWS2.</div>');
  H+=tbl(['Skala','Wynik','Komentarz'],[
   ['qSOFA (NPOA 2020: RR >22)',(q.complete?'':'co najmniej ')+q.score+'/3',(q.complete?(q.positive?'<b class="r">dodatni (≥2)</b>':'ujemny'):'brak: '+esc(q.missing.join(', ')))+(q.differs?'<div class="o">Sepsis-3 (RR ≥22, SBP ≤100): '+q.s3+'/3'+(q.positive3!==q.positive?' – '+(q.positive3?'DODATNI':'ujemny')+' – DO DECYZJI LEKARZA':'')+'</div>':'')],
   ['NEWS2',(n.complete?'':'co najmniej ')+n.score,esc(n.txt)+(n.complete?'':' · brak: '+esc(n.missing.join(', ')))],
   ['SOFA',(s.complete?'':'co najmniej ')+s.score+' (oceniono '+s.assessed+'/6 układów)',s.complete?'':'brak: '+esc(s.missing.join(', '))+' – nie liczono jako 0']]);
  if(s.parts.length)H+='<div class="mut">SOFA wg układów: '+s.parts.map(function(x){return esc(x[0])+' '+x[1];}).join(' · ')+'</div>';
  if(r.shock||n.cls==='emergency')H+=bx('red','[HOSPITALIZACJA BEZWZGLĘDNA] – OIT / monitorowanie','Wstrząs septyczny lub NEWS2 ≥7: pilna ocena zespołu intensywnej terapii, pakiet 1 h – zakładka „Pakiet 1 h”.');
  H+=srcl(esc(A.SRC.ssc21)+'; NPOA 2020 (13.1.4); '+esc(A.SRC.news2));
  return{H:H,lvl:(r.shock||n.cls==='emergency')?'red':'ok'};}
 if(t==='b'){var w=P.w;var b=A.bundle({w:w,bmi:P.bmi,heart:P.co&&P.co.heart,renal:P.co&&P.co.renal,shock:g('shock'),highLik:g('hl')});var H2='';
  var t0=(document.getElementById('t0')||{}).value||'';var mt=/^(\d{1,2}):(\d{2})$/.exec(t0);function addH(h){if(!mt)return '';var m=(+mt[1]*60+ +mt[2]+h*60)%1440;return ' (do '+('0'+Math.floor(m/60)).slice(-2)+':'+('0'+m%60).slice(-2)+')';}
  H2+=bx('orange','Pakiet pierwszej godziny (SSC 2021) – lista kontrolna'+dw('DO DECYZJI LEKARZA'),tbl(['Element','Zalecenie','Status'],[
   ['Mleczany','Oznacz; powtórz jeśli podwyższone (SSC 2021, rek. 3)',g('d_lac')?'✔':'☐'],
   ['Posiewy krwi','≥2 zestawy przed antybiotykiem, bez istotnego opóźnienia (NPOA 2020; SSC 2021)',g('d_cult')?'✔':'☐'],
   ['Antybiotyk','Czas: '+esc(b.antibioticWithin)+addH(g('shock')||g('hl')?1:3),g('d_abx')?'✔':'☐'],
   ['Płyny','30 ml/kg krystaloidów w ciągu 3 h (SSC 2021, rek. 5; preferuj zbilansowane)'+addH(3)+': '+(nz(b.fluidMl)?'<b>'+F(b.fluidMl,0)+' ml</b> ('+F(w,0)+' kg × 30 ml)':'<span class="o">podaj masę w pasku pacjenta</span>'),g('d_fluid')?'✔':'☐'],
   ['MAP','Cel ≥65 mmHg (SSC 2021, rek. 9)',g('d_map')?'✔':'☐'],
   ['Wazopresor','Noradrenalina pierwszego wyboru; start także obwodowo (SSC 2021, rek. 37, 44)',g('d_ne')?'✔':'☐'],
   ['Ognisko','Source control możliwie szybko (SSC 2021, rek. 27)',g('d_src')?'✔':'☐']]));
  if(b.fluidNote)H2+=bx('orange','Masa ciała',rich(b.fluidNote));if(b.fluidCaution)H2+=bx('orange','Ostrożność z płynami',rich(b.fluidCaution));
  H2+=bx('','Noradrenalina i pompa','<p>'+rich(b.norepi)+'</p><p><button class="tg" onclick="SKS.show(\'ahf\');setTimeout(function(){var x=document.querySelector(\'[data-clin-tab=b1]\');if(x)x.click()},200)">→ Pompa noradrenaliny (B1)</button></p>');
  H2+=bx('','Wazopresyna / adrenalina',rich(b.vasopressin));
  var hc=nz(g('nedose'))&&nz(g('nehrs'))&&g('nedose')>=0.25&&g('nehrs')>=4;
  H2+=bx(hc&&!g('hyd')?'orange':'','Hydrokortyzon',rich(b.hydrocortisone)+(hc&&!g('hyd')?'<div class="o">Kryterium spełnione (≥0,25 µg/kg/min przez ≥4 h) – rozważ włączenie: '+DEC+'.</div>':nz(g('nedose'))?'<div class="mut">Kryterium niespełnione przy podanych wartościach.</div>':''));
  H2+=bx('','Różnice źródeł','SSC 2021: antybiotyk ≤1 h przy wstrząsie/wysokim prawdopodobieństwie. NPOA 2020 przypomina stanowisko IDSA (2018): poza wstrząsem standardy SEP-1/CMS przyjmują ≤3 h. Stosuj wg decyzji lekarza i lokalnej procedury.'.replace(/DO DECYZJI LEKARZA/g,''));
  H2+=srcl(esc(A.SRC.ssc21)+'; NPOA 2020 (13.1.4)');
  return{H:H2,lvl:g('shock')?'red':'ok'};}
 if(t==='c'){var src=g('source');var r2=A.sepsisAbx({source:src,age:P.age,sex:P.sex,w:P.w,h:P.h,crMg:P.crMg,allergy:g('allergy'),rrt:g('rrt'),hospital:g('hospital'),mrsa:g('mrsa'),esbl:g('esbl'),pseudo:g('pseudo'),mdr:g('mdr'),immuno:g('immuno'),shock:false});
  if(!r2.ok)return{H:bx('orange','Antybiotyki empiryczne w sepsie'+dw(),rich(r2.msg)),lvl:'ok'};
  var H3=bx('orange','Antybiotyki empiryczne wg ogniska – propozycja do akceptacji'+dw(),'Pierwsza dawka pełna (nie zmniejszana) bez względu na nerki. Preferencje: NPOA 2020 (13.1.4) + SSC 2021; lokalna lekowrażliwość ma pierwszeństwo.')+crclBox(r2.crcl,P,g('rrt'));
  r2.regimens.forEach(function(x){H3+=regimenHtml(x);});
  if(r2.decisions.length)H3+=bx('red','Do decyzji lekarza','<ul><li>'+r2.decisions.map(rich).join('</li><li>')+'</li></ul>');
  if(r2.warnings.length)H3+=bx('orange','Ostrzeżenia','<ul><li>'+r2.warnings.map(rich).join('</li><li>')+'</li></ul>');
  H3+=bx('','Uwagi','<ul><li>'+r2.notes.map(rich).join('</li><li>')+'</li></ul>');
  H3+='<details class="clinical-sources"><summary>Źródła</summary><ul>'+r2.src.map(function(s){return '<li>'+esc(s)+'</li>';}).join('')+'</ul></details>';
  return{H:H3,lvl:'ok'};}
 if(t==='d'){var keys=['r_map','r_lac','r_crt','r_fl','r_uo','r_cult','r_deesc','r_dose','r_src','r_glu','r_hc','r_bic','r_dur'];var open=keys.filter(function(k){return !g(k);}).length;
  var labs={r_map:'MAP ≥65',r_lac:'mleczany',r_crt:'CRT',r_fl:'odpowiedź na płyny',r_uo:'diureza',r_cult:'posiewy',r_deesc:'deeskalacja',r_dose:'dawki antybiotyków',r_src:'kontrola ogniska',r_glu:'glikemia',r_hc:'hydrokortyzon',r_bic:'wodorowęglan',r_dur:'czas leczenia'};
  return{H:bx(open?'orange':'ok','Ponowna ocena: '+(keys.length-open)+'/'+keys.length+' wykonane',open?'Niezaznaczone: '+keys.filter(function(k){return !g(k);}).map(function(k){return esc(labs[k]);}).join(', ')+'.':'Wszystkie elementy zaznaczone.')+srcl('SSC 2021 (rek. 5, 8, 27, 29, 30, 58, 69, 72)'),lvl:'ok'};}
 return{H:'',lvl:'ok'};}
function sepReport(P){
 var sa=store('sepsis_a').get(),sb=store('sepsis_b').get(),sc=store('sepsis_c').get(),sd=store('sepsis_d').get();
 var gA=function(id){var v=sa[id];if(v===undefined||v===''||v===null)return id==='aw'||id==='o2s'?'':NaN;if(typeof v==='boolean')return v;if(id==='aw'||id==='o2s')return v;var x=N(v);return isFinite(x)?x:NaN;};
 var i=sepInputs(gA,P);var as=A.sepsisAssess(i);
 var H='<div class="b2pr"><h2>Sepsa – raport końcowy (do druku)</h2>';
 var pt=window.SKS&&SKS.P?SKS.P():P;H+='<p><b>Pacjent:</b> wiek '+(nz(pt.age)?F(pt.age,0):'—')+', płeć '+({m:'M',f:'K'}[pt.sex]||'—')+', masa '+(nz(pt.w)?F(pt.w,0)+' kg':'—')+', kreatynina '+creaTxt(pt.crMg)+', CrCl (pasek) '+(nz(pt.crcl)?F(pt.crcl,0)+' ml/min':'—')+'.</p>';
 H+='<p><b>Data/godzina wydruku:</b> '+new Date().toLocaleString('pl-PL',{timeZone:'Europe/Warsaw'})+' (Europe/Warsaw)</p>';
 if(as.ok){H+='<h3>Kryteria</h3><p>'+esc(as.msg)+'</p><p>qSOFA '+(as.q.complete?'':'co najmniej ')+as.q.score+'/3 · NEWS2 '+(as.n.complete?'':'co najmniej ')+as.n.score+' · SOFA '+(as.s.complete?'':'co najmniej ')+as.s.score+' (oceniono '+as.s.assessed+'/6)</p>';}else H+='<h3>Kryteria</h3><p>Brak wyniku (nie wypełniono zakładki „Kryteria” lub brak podejrzenia zakażenia).</p>';
 var done=[['d_lac','mleczany'],['d_cult','posiewy przed antybiotykiem'],['d_abx','antybiotyk podany'],['d_fluid','płyny rozpoczęte'],['d_map','MAP ≥65'],['d_ne','noradrenalina'],['d_src','ognisko/kontrola ogniska']];
 H+='<h3>Pakiet 1 h</h3><p>Wykonane: '+(done.filter(function(x){return sb[x[0]];}).map(function(x){return esc(x[1]);}).join(', ')||'—')+'. Niewykonane/niezaznaczone: '+(done.filter(function(x){return !sb[x[0]];}).map(function(x){return esc(x[1]);}).join(', ')||'—')+'.</p>';
 var b=A.bundle({w:pt.w});if(nz(b.fluidMl))H+='<p>Płyny 30 ml/kg (masa '+F(pt.w,0)+' kg): '+F(b.fluidMl,0)+' ml.</p>';
 if(sc.source){var ab=A.sepsisAbx({source:sc.source,age:pt.age,sex:pt.sex,w:pt.w,h:pt.h,crMg:pt.crMg,allergy:sc.allergy||'none',rrt:sc.rrt||'none',hospital:!!sc.hospital,mrsa:!!sc.mrsa,esbl:!!sc.esbl,pseudo:!!sc.pseudo,mdr:!!sc.mdr,immuno:!!sc.immuno});
  H+='<h3>Antybiotyki (propozycja – '+esc(A.SOURCES[sc.source])+')</h3>';if(ab.ok){ab.regimens.forEach(function(r){H+='<p><b>'+rich(r.label)+'</b></p><ul>'+r.drugs.map(function(d){return '<li>'+esc(d.name)+' '+rich(d.dose)+' ('+esc(d.route)+') – korekta nerkowa: '+rich(d.renal)+'</li>';}).join('')+'</ul>';});if(ab.decisions.length)H+='<p><b>Do decyzji lekarza:</b></p>'+ul(ab.decisions);}else H+='<p>'+esc(ab.msg)+'</p>';}
 else H+='<h3>Antybiotyki</h3><p>Nie wybrano ogniska.</p>';
 var rk=['r_map','r_lac','r_crt','r_fl','r_uo','r_cult','r_deesc','r_dose','r_src','r_glu','r_hc','r_bic','r_dur'];H+='<h3>Ponowna ocena</h3><p>Wykonane: '+rk.filter(function(k){return sd[k];}).length+'/'+rk.length+'.</p>';
 H+='<p class="mut">Narzędzie pomocnicze, niecertyfikowane. Wszystkie dawki i decyzje weryfikuje lekarz. Źródła: SSC 2021; NPOA 2020; NEWS2 (RCP 2017); renal: UNMC/Nebraska ASP, Einstein ASP 2023, tabele ChPL (farmacjakliniczna.pl).</p></div>';
 return H;}
function printHtml(title,html){var f=document.createElement('iframe');f.style.cssText='position:fixed;right:0;bottom:0;width:0;height:0;border:0';document.body.appendChild(f);var d=f.contentWindow.document;d.open();d.write('<!doctype html><meta charset="utf-8"><title>'+esc(title)+'</title><style>body{font:13px Arial,sans-serif;margin:16px}table{border-collapse:collapse;width:100%}td,th{border:1px solid #888;padding:3px 5px}.dw{background:#fff0c9;border:1px solid #e3b341;border-radius:4px;padding:0 4px;font-size:11px}.mut{color:#555}</style>'+html);d.close();setTimeout(function(){try{f.contentWindow.focus();f.contentWindow.print();}catch(e){}setTimeout(function(){f.remove();},1500);},200);}
window.SORB2print=printHtml;
var SEP=tabbed({id:'sepsis',icon:'🦠',name:'Sepsa'},'Sepsa – kryteria, pakiet 1 h, antybiotyki, ponowna ocena',[['a','Kryteria'],['b','Pakiet 1 h'],['c','Antybiotyki wg ogniska'],['d','Ponowna ocena'],['e','Raport końcowy']],
 function(t){return t==='e'?'<button class="primary-action" id="b2print">🖨 Drukuj raport sepsy</button><span class="mut"> raport zbiera dane z pozostałych zakładek</span>':sepForm(t);},
 function(t,g,P,X){if(t==='e'){var html=sepReport(P);setTimeout(function(){var b=document.getElementById('b2print');if(b)b.onclick=function(){printHtml('Sepsa – raport',html);};},0);return{H:html,lvl:'ok'};}return sepCalc(t,g,P);},
 '<h3>Źródła</h3><ul class="src"><li>'+esc(A.SRC.ssc21)+'</li><li>'+esc(A.SRC.npoa20)+'</li><li>'+esc(A.SRC.npoa14)+'</li><li>'+esc(A.SRC.news2)+'</li><li>'+esc(A.SRC.unmc)+'</li><li>'+esc(A.SRC.einstein)+'</li><li>'+esc(A.SRC.fk)+'</li></ul><p>Reguły i różnice źródeł: README „Źródła i założenia B2”. '+dw()+': wybór antybiotyku zależy od lokalnej lekowrażliwości; dawki w CRRT; wazopresyna, hydrokortyzon.</p>');
// ============================================================ GRZYBY ============================================================
function speciesCard(sp,P){var tx=M.TX[sp.syndrome],ama=sp.syndrome==='amatoksyny',base=Object.assign({},ama?M.AMA:{},sp);var h='<article class="b2card" id="b2card"><h3>'+esc(sp.pl)+' <i>'+esc(sp.latin)+'</i><span class="b2tier b2tier'+sp.tier+'">'+(sp.tier==='A'?'POTENCJALNIE ŚMIERTELNY':'groźny / może zagrażać życiu')+'</span></h3>';
 if(sp.tier==='A')h+='<div class="b2nt">'+esc(M.POL)+'.</div>';
 h+=(M.CREDITS[sp.id]||[]).map(function(c){return '<img class="b2zoom" src="assets/mushrooms/'+c[0]+'.jpg" alt="'+esc(sp.pl)+' – fotografia referencyjna" data-cap="'+esc(sp.pl+' – Fot. '+c[1]+' · '+c[3])+'" loading="lazy">';}).join('');
 h+='<p><b>Opis (tylko wywiad, nie identyfikacja):</b> '+esc(sp.desc)+'</p><p><b>Z czym bywa mylony:</b> '+esc(sp.conf)+'</p>';
 h+='<p><b>Toksyna / mechanizm:</b> '+esc(base.mech||'')+'</p><p><b>Okres utajenia:</b> '+esc(base.lat||'')+'</p><p><b>Objawy:</b> '+esc(base.sym||'')+'</p>';
 if(sp.note)h+='<p><b>Uwagi:</b> '+rich(sp.note)+'</p>';
 if(tx){h+='<h4 class="b1h">Leczenie ('+esc(sp.syndrome)+')</h4><ul><li>'+rich(tx.what)+'</li><li><b>Węgiel aktywny:</b> '+rich(tx.charcoal)+'</li><li><b>Odtrutka / leki:</b> '+rich(tx.antidote)+'</li>'+(tx.avail?'<li class="o"><b>Dostępność w Nowym Targu:</b> '+rich(tx.avail)+'</li>':'')+(tx.transplant?'<li><b>Transplantacja wątroby:</b> '+rich(tx.transplant)+'</li>':'')+'</ul>';}
 if(ama&&nz(P.w)&&P.w>=40&&P.w<=200)h+=bx('orange','Silibinina – rachunek referencyjny'+dw(),'Dorosły '+F(P.w,0)+' kg: dawka nasycająca 5 mg/kg = <b>'+F(P.w*5,0)+' mg</b> w 1 h, następnie 20 mg/kg/dobę = <b>'+F(P.w*20,0)+' mg/dobę</b> (Toxins 2026); wg Legalon SIL (DE): 20 mg/kg/dobę w 4 wlewach po 2 h = '+F(P.w*5,0)+' mg na wlew. Fiolka Legalon SIL = 350 mg silibininy (528,5 mg soli). Preparat niedostępny w Nowym Targu; import/zamienniki – '+DEC+'.');
 h+='<h4 class="b1h">Próbki: co i kiedy</h4>'+tbl(['Kiedy','Co pobrać','Dokąd / uwagi'],M.SAMPLES.map(function(r){return r.map(rich);}));
 h+='<div class="b2nt">'+esc(M.NT)+'</div>';
 h+='<div class="mut">Źródła: '+sp.src.map(function(k){return esc(M.SRC[k]);}).join('; ')+(M.CREDITS[sp.id]?'. Fotografie: '+M.CREDITS[sp.id].map(function(c){return esc(c[1])+', <a href="https://commons.wikimedia.org/wiki/File:'+c[2]+'" target="_blank" rel="noopener noreferrer">Wikimedia Commons</a>, '+esc(c[3]);}).join('; ')+' – bez retuszu (miniatura).':'')+'</div></article>';
 return h;}
function mushTabs(H){var number=H.number,select=H.select,group=H.group,tri=H.tri,check=H.check,box=H.box,missing=H.missing;
 var spOpts=[['','— lista gatunków —']].concat(M.SPECIES.map(function(s){return [s.id,s.pl+' ('+s.latin+')'];}));
 return [
 {id:'mushrooms',name:'Grzyby: próbki, leczenie, transfer',
  form:function(){return group('Wywiad bez identyfikatorów',number('latency','Czas od posiłku do pierwszych objawów','h','',0,1000)+number('since','Czas od spożycia do teraz','h','',0,2000)+tri('suspect','Podejrzenie spożycia śmiertelnie toksycznego gatunku')+tri('gi','Wymioty / biegunka')+tri('liver','Uszkodzenie wątroby / INR rośnie')+tri('renal','Uszkodzenie nerek / skąpomocz')+select('syn','Zespół (do wyboru leczenia)',[['','Nie ustalono'],['amatoksyny','Amatoksyny (Amanita, Galerina, Lepiota)'],['orellanina','Orellanina (Cortinarius)'],['gyromitryna','Gyromitryna (Gyromitra)'],['paxillus','Paxillus (krowiak)'],['muskaryna','Muskaryna (Inocybe, Clitocybe)']]))+
   group('Kryteria do rozważenia konsultacji / transferu (zaznacz występujące)',M.TRANSFER.map(function(t,i){return check('t'+i,t[0]);}).join(''))},
  calc:function(g,P){var tr=M.triage({latency:g('latency'),since:g('since'),suspect:g('suspect'),gi:g('gi'),liver:g('liver'),renal:g('renal')});
   var h='';if(!tr.ok)h+=missing('Brak wyniku: '+tr.msg);else{
    h+=box(tr.level==='red'?'[HOSPITALIZACJA BEZWZGLĘDNA] – podejrzenie ciężkiego zatrucia grzybami':'Zatrucie grzybami – ocena wstępna','<ul><li>'+tr.reasons.map(rich).join('</li><li>')+'</li></ul><p>Okres pozornej poprawy nie wyklucza narastającej niewydolności wątroby/nerek. Pilna konsultacja toksykologiczna. <b>'+rich(tr.transferHint)+'</b></p>',tr.level==='red'?'red':'orange');
    h+=box('Pobieranie próbek – okno czasowe',rich(tr.sampling.text),tr.sampling.window==='early'||tr.sampling.window==='window'?'orange':'');}
   h+=tbl(['Kiedy','Co pobrać','Dokąd / uwagi'],M.SAMPLES.map(function(r){return r.map(rich);}));
   var ta=M.transferAssess((function(){var o={};M.TRANSFER.forEach(function(t,i){o['t'+i]=g('t'+i);});return o;})());
   h+=box(ta.any?'Kryteria transferu / konsultacji spełnione ('+ta.hit.length+')':'Kryteria transferu – nie zaznaczono',ta.any?'<ul><li>'+ta.hit.map(esc).join('</li><li>')+'</li></ul><p>'+rich(ta.msg)+'</p><p><b>Decyzja o transferze należy do lekarza.</b></p>':'<p>Zaznacz występujące kryteria. Brak zaznaczeń nie oznacza bezpieczeństwa.</p><div class="b2nt">'+esc(M.NT)+'</div>',ta.any?'red':'');
   var syn=g('syn')||'';if(syn&&M.TX[syn]){var tx=M.TX[syn];h+=box('Leczenie: '+esc(syn),'<ul><li>'+rich(tx.what)+'</li><li><b>Węgiel:</b> '+rich(tx.charcoal)+'</li><li><b>Odtrutka / leki:</b> '+rich(tx.antidote)+'</li>'+(tx.avail?'<li><b>Dostępność:</b> '+rich(tx.avail)+'</li>':'')+(tx.transplant?'<li>'+rich(tx.transplant)+'</li>':'')+'</ul>');}
   if(!syn||syn==='amatoksyny'){if(nz(P.w)&&P.w>=40&&P.w<=200)h+=box('Silibinina – rachunek referencyjny'+dw(),'Dorosły '+F(P.w,0)+' kg: 5 mg/kg = '+F(P.w*5,0)+' mg w 1 h, następnie 20 mg/kg/dobę = '+F(P.w*20,0)+' mg/dobę (Toxins 2026; Legalon SIL – informacja producenta, DE). Preparat niedostępny w Nowym Targu.');}
   h+=H.sources([]).replace('<ul></ul>','<ul>'+['wennig','oit','toxins26','charcoal24','statpearls','chop','su','legalon','gis'].map(function(k){return '<li>'+esc(M.SRC[k])+'</li>';}).join('')+'</ul>');
   return{html:h,alarm:tr.ok&&tr.level==='red'};}},
 {id:'atlas',name:'Grzyby: gatunki i fotografie',
  form:function(){return '<p class="notice">Fotografie służą zebraniu wywiadu. Pacjent nie może na ich podstawie wykluczyć zatrucia; ocena grzyboznawcy – po ugotowaniu, uszkodzeniu lub przy posiłku mieszanym cechy mogą być nierozpoznawalne. Aplikacje do rozpoznawania z telefonu są zawodne.</p>'+select('sp','Gatunek',spOpts);},
  calc:function(g,P){var id=g('sp')||'';var h='<div class="b2grid">'+M.SPECIES.map(function(s){var c=M.CREDITS[s.id]&&M.CREDITS[s.id][0];return '<button type="button" class="b2sp'+(s.id===id?' on':'')+'" data-sp="'+s.id+'">'+(c?'<img src="assets/mushrooms/'+c[0]+'.jpg" alt="" loading="lazy">':'')+'<b>'+esc(s.pl)+'</b><i>'+esc(s.latin)+'</i><span class="b2tier b2tier'+s.tier+'">'+(s.tier==='A'?'potencjalnie śmiertelny':'groźny')+'</span></button>';}).join('')+'</div>';
   var sp=M.SPECIES.filter(function(s){return s.id===id;})[0];h+=sp?speciesCard(sp,P):'<p class="mut">Wybierz gatunek z listy, aby zobaczyć kartę.</p>';
   h+=box('Co pokazać grzyboznawcy','Cały owocnik z nienaruszoną podstawą, kapelusz z góry i spodu, blaszki / rurki, trzon, pierścień, pochwa i zasnówka. Zabezpiecz resztki wszystkich gatunków z posiłku. Atlas nie jest wyczerpujący: istnieją inne trujące gatunki (Wennig 2020).','orange');
   h+='<details class="clinical-sources"><summary>Źródła i licencje fotografii</summary><ul>'+['wennig','oit','gis'].map(function(k){return '<li>'+esc(M.SRC[k])+'</li>';}).join('')+'</ul><p>Fotografie: Wikimedia Commons (licencje CC wskazane przy każdym zdjęciu; plik assets/mushrooms/credits.json).</p></details>';
   return{html:h,alarm:false};},
  after:function(el,g,update){el.querySelectorAll('[data-sp]').forEach(function(b){b.onclick=function(){var s=el.querySelector('#sp');s.value=b.dataset.sp;s.dispatchEvent(new Event('change'));};});
   el.querySelectorAll('img.b2zoom').forEach(function(im){im.onclick=function(){window.SORB2lightbox(im.getAttribute('src'),im.dataset.cap);};});}}];}
// ============================================================ OTĘPIENIE ============================================================
function itemsHtml(groups){return groups.map(function(gp){var h='<div class="b2h">'+esc(gp.g)+'</div>';gp.items.forEach(function(it){h+='<label class="b2it"><input type="checkbox" id="'+it[0]+'"> '+esc(it[1])+(it[2]?'<span class="ins">'+esc(it[2])+'</span>':'')+'</label>';});
 if(gp.sel){h+='<label class="b2it">'+esc(gp.sel.label)+' <select id="'+gp.sel.id+'"><option value="">— nie oceniono —</option>'+[0,1,2,3,4,5].slice(0,gp.sel.opts+1).map(function(n){return '<option value="'+n+'">'+n+'</option>';}).join('')+'</select></label>';}return h;}).join('');}
function amtsIn(v){var o={};DM.AMTS.forEach(function(x){o[x[0]]=v[x[0]]===true;});return o;}
function mocaIn(v){var o={};DM.mocaItemIds().forEach(function(id){o[id]=v[id]===true;});o.m_s7=v.m_s7===undefined||v.m_s7===''?undefined:+v.m_s7;return o;}
function mmseIn(v){var o={};DM.mmseItemIds().forEach(function(id){o[id]=v[id]===true;});o.s_att=v.s_att===undefined||v.s_att===''?undefined:+v.s_att;return o;}
function anyTrue(v){return Object.keys(v).some(function(k){if(k.indexOf('__')===0)return false;return v[k]===true||(typeof v[k]==='number'&&isFinite(v[k]))||(typeof v[k]==='string'&&v[k]!=='');});}
function amtsRes(v){return anyTrue(v)?DM.amts(amtsIn(v)):null;}
function mocaRes(v){return anyTrue(v)?DM.moca(mocaIn(v),v.edu===true):null;}
function mmseRes(v){return anyTrue(v)?DM.mmse(mmseIn(v)):null;}
function cdrIn(v){var b={};['M','O','J','C','H','P'].forEach(function(k){var x=v['c_'+k];b[k]=x===undefined||x===''?NaN:+x;});return b;}
function dementiaSummary(){var ra=amtsRes(store('neuro_d2').get()),rm=mocaRes(store('neuro_d3').get()),rs=mmseRes(store('neuro_d4').get()),rc=DM.cdrGlobal(cdrIn(store('neuro_d5').get()));
 var any=ra||rm||rs||(rc&&rc.ok);if(!any)return '';
 var rows=[['AMTS',ra?ra.score+'/10 – '+ra.txt:'nie oceniano'],['MoCA',rm?(rm.partial?'co najmniej ':'')+rm.score+'/30'+(rm.eduAdded?' (z +1 pkt za ≤12 lat nauki)':'')+' – '+rm.txt:'nie oceniano'],['MMSE',rs?(rs.partial?'co najmniej ':'')+rs.score+'/30 – '+rs.cat:'nie oceniano'],['CDR (globalny)',rc.ok?F(rc.cdr,1)+' – '+rc.label:'nie oceniano / niepełny']];
 return bx('','Zestawienie wyników skal (trafia do raportu zbiorczego)',tbl(['Skala','Wynik'],rows.map(function(r){return [esc(r[0]),esc(r[1])];}))+'<div class="mut">Skrining ≠ rozpoznanie. Przy podejrzeniu majaczenia (4AT) testy poznawcze są niewiarygodne.</div>');}
function dementiaForm(t){
 if(t==='d2')return '<p class="mut" style="width:100%">Zaznaczaj poprawnie wykonane elementy; w nawiasach kwadratowych polecenie dla pacjenta. Niezaznaczone = błąd / nie wykonano (0 pkt).</p>'+itemsHtml([{g:'AMTS – 10 pytań (1 pkt każde)',items:DM.AMTS}]);
 if(t==='d3')return '<p class="mut" style="width:100%">MoCA – maks. 30 pkt. Własne skrócone polecenia; oryginalny formularz i rysunki: mocacognition.com (licencja/szkolenie – '+DEC+'). Niezaznaczone = błąd / nie wykonano.</p>'+itemsHtml(DM.MOCA)+'<div class="b2h">Poprawka za wykształcenie</div><label class="b2it"><input type="checkbox" id="edu"> Pacjent miał ≤12 lat nauki <span class="ins">Jeśli pacjent miał ≤12 lat nauki, dodaj 1 punkt (jeśli wynik &lt;30).</span></label>';
 if(t==='d4')return '<p class="mut" style="width:100%">MMSE – maks. 30 pkt. Własne skrócone polecenia; oryginalny formularz © PAR – '+DEC+' (licencja). Niezaznaczone = błąd / nie wykonano.</p>'+itemsHtml(DM.MMSE);
 if(t==='d5'){var h='<p class="mut" style="width:100%">CDR: oceń każdą z 6 domen jako spadek względem zwykłego poziomu z powodu zaburzeń poznawczych (nie z powodu innych chorób/depresji). Wątpliwość między dwoma stopniami → wybierz wyższy. Globalny CDR liczy się automatycznie (algorytm Morrisa 1993).</p><div class="b1tw" style="width:100%"><table class="b2cdr"><thead><tr><th>Domena</th>'+['0','0.5','1','2','3'].map(function(k){return '<th>'+esc(DM.CDR_LAB[k])+'</th>';}).join('')+'</tr></thead><tbody>';
  DM.CDR_DOM.forEach(function(d){h+='<tr><td><b>'+esc(d[1])+' ('+d[0]+')</b><input type="hidden" id="c_'+d[0]+'"></td>'+['0','0.5','1','2','3'].map(function(k){var ok=d[2].indexOf(+k)>=0;return '<td>'+(ok?'<label><input type="radio" name="cr_'+d[0]+'" value="'+k+'"> '+esc((DM.CDR_DESC[d[0]]||{})[k]||'')+'</label>':'<span class="mut">—</span>')+'</td>';}).join('')+'</tr>';});
  return h+'</tbody></table></div>';}
 return '';}
function dementiaCalc(t,g,P){var H='';
 if(t==='d2'){var v={};DM.AMTS.forEach(function(x){v[x[0]]=g(x[0]);});var r=amtsRes(v);
  H=r?bx(r.lvl,'AMTS','<span class="b2res">'+r.score+' / 10</span> – '+esc(r.txt)+'<div class="mut">'+esc(r.note)+'</div>')+srcl(esc(DM.SRC.amts)):bx('','AMTS','Zaznacz poprawne odpowiedzi – brak wyniku bez wprowadzonych danych.');}
 if(t==='d3'){var m={edu:g('edu')};DM.mocaItemIds().forEach(function(id){m[id]=g(id);});m.m_s7=g('m_s7');var r3=mocaRes(m);
  H=r3?bx(r3.lvl,'MoCA','<span class="b2res">'+r3.score+' / 30</span> – '+esc(r3.txt)+(r3.partial?' <b>(co najmniej – nie wszystkie pozycje ocenione)</b>':'')+(r3.eduAdded?'<div>Surowy wynik '+r3.raw+' + 1 pkt (≤12 lat nauki).</div>':'')+'<div class="mut">Jeśli pacjent miał ≤12 lat nauki, dodaj 1 punkt (jeśli wynik &lt;30).</div><div class="mut">'+esc(r3.note)+'</div>')+srcl(esc(DM.SRC.moca)):bx('','MoCA','Zaznacz wykonane elementy – brak wyniku bez wprowadzonych danych.');}
 if(t==='d4'){var s={};DM.mmseItemIds().forEach(function(id){s[id]=g(id);});s.s_att=g('s_att');var r4=mmseRes(s);
  H=r4?bx(r4.lvl,'MMSE','<span class="b2res">'+r4.score+' / 30</span> – '+esc(r4.cat)+(r4.partial?' <b>(co najmniej)</b>':'')+'<div class="mut">'+esc(r4.note)+'</div>')+srcl(esc(DM.SRC.mmse)):bx('','MMSE','Zaznacz wykonane elementy – brak wyniku bez wprowadzonych danych.');}
 if(t==='d5'){var cv={};['M','O','J','C','H','P'].forEach(function(k){var hid=document.getElementById('c_'+k);var val=hid?hid.value:'';cv['c_'+k]=val;
   document.querySelectorAll('input[name="cr_'+k+'"]').forEach(function(r){r.checked=(r.value===val);r.onchange=function(){var h2=document.getElementById('c_'+k);h2.value=r.value;h2.dispatchEvent(new Event('input'));};});});
  var rc=DM.cdrGlobal(cdrIn(cv));
  H=rc.ok?bx(rc.lvl,'CDR globalny','<span class="b2res">'+F(rc.cdr,1)+'</span> – '+esc(rc.label)+'<div>Suma „boxów” (pomocnicza): '+F(rc.sum,1)+'</div><div class="mut">'+esc(rc.rule)+'</div><div class="mut">'+esc(rc.note)+'</div>')+srcl(esc(DM.SRC.cdr)):bx('','CDR','Oceń wszystkie 6 domen (brakuje: '+(rc.missing||[]).join(', ')+'). Brak wyniku bez kompletnych danych.');}
 return{H:H+dementiaSummary(),lvl:'ok'};}
// ---------- rejestracja ----------
function repl(m){var L=SKM.list;for(var i=0;i<L.length;i++)if(L[i].id===m.id){L[i]=m;return;}L.push(m);}
SEP.snapshot=function(){var any=['sepsis_a','sepsis_b','sepsis_c','sepsis_d'].some(function(k){var o=store(k).get();return Object.keys(o).some(function(x){return x.indexOf('__')!==0&&o[x]!==''&&o[x]!==false&&o[x]!=null;});});if(!any)return null;
 var d=document.createElement('div');d.innerHTML=sepReport(window.SKS&&SKS.P?SKS.P():{}).replace(/<\/(p|h2|h3|li|ul|div)>/g,'\n').replace(/<li>/g,'• ');return{text:(d.textContent||'').replace(/\n{3,}/g,'\n\n').trim()};};
repl(SEP);
window.SORB2={capTab:capTab,mushTabs:mushTabs,contactsPanel:contactsPanel,dementiaForm:dementiaForm,dementiaCalc:dementiaCalc,speciesCard:speciesCard,sepReport:sepReport,printHtml:printHtml,rich:rich};
})();
