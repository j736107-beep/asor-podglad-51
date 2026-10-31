(function(r,f){var m=f();if(typeof module==='object'&&module.exports)module.exports=m;else{r.SK=r.SK||{};r.SK.pressB1=m;}})(this,function(){
// ETAP B1 – Ostra niewydolność serca: kalkulator pompy dla leków wlewowych (katecholaminy, levosimendan, azotan, furosemid).
// Jednostki dawki jawne: µg/kg/min, µg/min, mg/h – wynik zawsze podaje WSZYSTKIE trzy + ml/h. Puste/nierealne dane → null.
var SRC={
 ESC:'ESC 2021 HF (McDonagh, Eur Heart J 42:3599) + ESC 2023 focused update – tab. leków inotropowych/wazopresyjnych w AHF: dobutamina 2–20, dopamina 3–5 (inotropowo), noradrenalina 0,2–1,0, adrenalina 0,05–0,5 µg/kg/min; levosimendan 0,05–0,2; NTG ≤200 µg/min; furosemid wlew 5–40 mg/h',
 NOR:'ChPL Noradrenaline Kabi 1 mg/ml (RPL 43461): standard 40 µg/ml, start 0,4–0,8 mg/h, +0,05–0,1 µg/kg/min; tabela dawek do 1 µg/kg/min; brak maks. dawki; podawać przez dostęp centralny, a bez niego do dużej żyły (wynaczynienie → martwica)',
 ADR:'ChPL Adrenalina WZF 0,1% (RPL 3065): wstrząs kardiogenny – lek 2. rzutu we wlewie 0,05–0,5 µg/kg/min; ciężka bradykardia 2–10 µg/min',
 DOB:'ChPL Dobutamin hameln 12,5 mg/ml (RPL 44515): 2,5–10 µg/kg/min, w pojedynczych przypadkach do 40; tabele dla strzykawki 250 mg/50 ml (5 mg/ml)',
 DOP:'ChPL Dopaminum hydrochloricum WZF 4% (RPL 2035): start 1–5 µg/kg/min, miareczkowanie do 20–50, >50 w zaawansowanej niewydolności; roztwór do wlewu 0,4–3,2 mg/ml (100–800 mg/250 ml)',
 LEV:'ChPL Simdax 2,5 mg/ml: bolus 6–12 µg/kg w 10 min (opcjonalnie; 6 µg/kg przy równoległych wazodylatatorach/inotropach), wlew 0,1 µg/kg/min (0,05–0,2), 24 h; przeciwwskazania: ciężka hipotensja i tachykardia, CrCl <30, ciężka niewydolność wątroby, torsade de pointes w wywiadzie',
 NTG:'ChPL Perlinganit 1 mg/ml (RPL 5252): start 5–10 µg/min, maks. 167 µg/min; ESC 2021: do 200 µg/min przy SBP >110',
 FUR:'ChPL Furosemide Kabi 20 mg/2 ml; ESC 2021 – wlew furosemidu 5–40 mg/h po bolusie 20–40 mg (u nieleczonych) lub 1–2× dawka doustna',
 PERI:'Owen VS i wsp., Crit Care 2021;25:146 (przegląd systematyczny: działania niepożądane wazopresorów przez wkłucie obwodowe – brak ustalonego bezpiecznego stężenia) oraz Enferm Intensiva 2023 (przegląd: noradrenalina <22 µg/ml bez martwicy)',
 LOC:'Lokalna baza „Pompy SOR” użytkownika (noradrenalina 4 mg/50 ml = 80 µg/ml; adrenalina 5 mg/50 ml = 100 µg/ml; dobutamina 250 mg/50 ml = 5 mg/ml; dopamina 200 mg/5 ml)'};
// ampułki: mg w ampułce, ml w ampułce; zakres dawek (typowy ESC/ChPL, ostrzeżenie czerwone, twardy limit), jednostka główna
// range: u = górna granica typowa (zielone), w = granica ostrzeżenia pomarańczowego, r = granica czerwona (potwierdzenie), h = twardy limit (blokada)
var DRUGS={
 nor:{n:'Noradrenalina',amp:{mg:4,ml:4,l:'ampułka 4 mg / 4 ml (1 mg/ml)'},main:'ugkgmin',typ:[0.05,0.5],orange:0.5,red:1.0,hard:2.0,src:['NOR','ESC'],periph:20,central:80,pnote:'Obwodowo tylko krótko (do czasu założenia dostępu centralnego), duża żyła przedramienia/dołu łokciowego, częsta kontrola miejsca wkłucia; stężenie wg przeglądów <≈22 µg/ml.',cond:'Wstrząs kardiogenny/septyczny – lek pierwszego rzutu wazopresora (ESC 2021). Ryzyko niedokrwienia, arytmii; po wynaczynieniu – pilne postępowanie (fentolamina wg lokalnej procedury).'},
 adr:{n:'Adrenalina',amp:{mg:1,ml:1,l:'ampułka 1 mg / 1 ml'},main:'ugkgmin',typ:[0.05,0.1],orange:0.1,red:0.5,hard:1.0,src:['ADR','ESC'],periph:20,central:100,pnote:'Brak ustalonego bezpiecznego stężenia obwodowego – wartość robocza; krótko, duża żyła, częsta kontrola wkłucia.',cond:'Wstrząs kardiogenny – lek 2. rzutu (ChPL: 0,05–0,5 µg/kg/min); ciężka bradykardia 2–10 µg/min (ChPL). Tachyarytmie, mleczany ↑ (efekt β2).'},
 dob:{n:'Dobutamina',amp:{mg:250,ml:20,l:'ampułka 250 mg / 20 ml (12,5 mg/ml)'},main:'ugkgmin',typ:[2.5,10],orange:10,red:20,hard:40,src:['DOB','ESC'],periph:2500,central:5000,pnote:'Możliwa obwodowo; ChPL: 5 mg/ml (250 mg/50 ml) w pompie strzykawkowej; wartość obwodowa robocza.',cond:'Niski rzut z hipoperfuzją; może obniżać RR i wywoływać tachyarytmie; efekt osłabia beta-bloker.'},
 dop:{n:'Dopamina',amp:{mg:200,ml:5,l:'ampułka 200 mg / 5 ml (40 mg/ml)'},main:'ugkgmin',typ:[1,5],orange:5,red:20,hard:50,src:['DOP','ESC'],periph:1600,central:3200,pnote:'ChPL: roztwór do wlewu 0,4–3,2 mg/ml; obwodowo wartość robocza (wynaczynienie → martwica).',cond:'ESC 2021: nie jest lekiem pierwszego wyboru (arytmie); dawka >5 µg/kg/min działa wazopresyjnie.'},
 lev:{n:'Levosimendan (dostępność lokalna – DO DECYZJI)',amp:{mg:12.5,ml:5,l:'fiolka 12,5 mg / 5 ml (2,5 mg/ml)'},main:'ugkgmin',typ:[0.05,0.1],orange:0.1,red:0.2,hard:0.2,src:['LEV','ESC'],periph:25,central:50,pnote:'ChPL: 0,025 mg/ml (12,5 mg/500 ml), do 0,05 mg/ml; można obwodowo. Wlew 24 h.',cond:'Przeciwwskazany: SBP <90 / ciężka hipotensja, tachykardia, CrCl <30, ciężka niewydolność wątroby, TdP. Bolus 6–12 µg/kg w 10 min opcjonalny (pomiń przy hipotensji). Dostępność w SOR: DO DECYZJI LOKALNEJ.',avail:true},
 ntg:{n:'Nitrogliceryna',amp:{mg:10,ml:10,l:'ampułka 10 mg / 10 ml (1 mg/ml)'},main:'ugmin',typ:[5,167],orange:167,red:200,hard:200,src:['NTG','ESC'],periph:1000,central:1000,pnote:'1 mg/ml w pompie strzykawkowej (preparat zależny); sprawdź ChPL używanego preparatu.',cond:'Tylko przy SBP >110 mmHg; przeciwwskazane z PDE-5/riocyguatem. Bez bolusa.'},
 fur:{n:'Furosemid (wlew)',amp:{mg:20,ml:2,l:'ampułka 20 mg / 2 ml (10 mg/ml)'},main:'mgh',typ:[5,40],orange:40,red:100,hard:100,src:['FUR','ESC'],periph:10000,central:10000,pnote:'10 mg/ml w pompie strzykawkowej (bez rozcieńczenia).',cond:'Najpierw bolus 20–40 mg i.v. (nieleczony) lub 1–2× dawka doustna; ocena diurezy/Na w moczu po 2 h; max ChPL 1500 mg/dobę.'}};
function nz(x){return typeof x==='number'&&isFinite(x);}
function rd(x,d){var p=Math.pow(10,d==null?2:d);return Math.round(x*p)/p;}
var UNITS=['ugkgmin','ugmin','mgh'];
// zamiana dawki na µg/min: ugkgmin×w, ugmin, mgh×1000/60
function toUgMin(dose,unit,w){if(!nz(dose)||dose<0)return NaN;if(unit==='ugkgmin')return w>0?dose*w:NaN;if(unit==='ugmin')return dose;if(unit==='mgh')return dose*1000/60;return NaN;}
// i: drug, w, amps (liczba ampułek, może być ułamek), volMl (objętość końcowa strzykawki), dose, unit, access('periph'|'central'|''), limP, limC (µg/ml, opcjonalnie), ack (potwierdzenie dawki powyżej strefy czerwonej)
function pump(i){var D=DRUGS[i.drug];if(!D)return null;var o={drug:i.drug,name:D.n,warn:[],lvl:'ok',tier:'ok',hide:false};
 if(!(nz(i.amps)&&i.amps>0&&nz(i.volMl)&&i.volMl>0&&nz(i.dose)&&i.dose>0)||UNITS.indexOf(i.unit)<0)return null;
 var mg=i.amps*D.amp.mg,vDrug=i.amps*D.amp.ml;o.mg=mg;o.drugMl=vDrug;
 if(vDrug>=i.volMl-1e-9)return {drug:i.drug,name:D.n,hide:true,lvl:'red',warn:['Objętość leku ('+rd(vDrug,1)+' ml) ≥ objętość końcowa ('+i.volMl+' ml) – popraw liczbę ampułek lub objętość.'],invalid:true};
 o.diluentMl=i.volMl-vDrug;o.conc=mg*1000/i.volMl; // µg/ml
 o.unit=i.unit;
 var ugmin=toUgMin(i.dose,i.unit,i.w);
 if(!nz(ugmin)){return {drug:i.drug,name:D.n,hide:true,lvl:'orange',warn:['Dawka w µg/kg/min wymaga masy ciała (pasek pacjenta).'],needWeight:true};}
 o.ugmin=ugmin;o.mgh=ugmin*60/1000;o.ugkgmin=i.w>0?ugmin/i.w:NaN;o.mlh=ugmin*60/o.conc;
 o.hoursSyringe=i.volMl/o.mlh;
 // dawka w jednostce głównej leku do oceny zakresu
 var dm=D.main==='ugkgmin'?o.ugkgmin:D.main==='ugmin'?o.ugmin:o.mgh;o.doseMain=dm;
 if(!nz(dm)){return {drug:i.drug,name:D.n,hide:true,lvl:'orange',warn:['Do oceny zakresu dawki ('+unitLabel(D.main)+') potrzebna masa ciała.'],needWeight:true};}
 o.mainUnit=D.main;
 // strefy
 if(dm>D.hard+1e-12){o.tier='hard';o.lvl='red';o.hide=true;o.warn.push('Dawka '+rd(dm,3)+' '+unitLabel(D.main)+' przekracza twardy limit aplikacji ('+D.hard+' '+unitLabel(D.main)+') – wynik wstrzymany. Zweryfikuj jednostkę (µg/kg/min vs µg/min!) i dawkę.');}
 else if(dm>D.red+1e-12){o.tier='red';o.lvl='red';if(!i.ack){o.hide=true;o.needAck=true;o.warn.push('Dawka '+rd(dm,3)+' '+unitLabel(D.main)+' powyżej zakresu ('+D.red+' '+unitLabel(D.main)+' wg ESC/ChPL). Wynik wstrzymany – zaznacz świadome potwierdzenie, jeśli to zamierzona dawka.');}else o.warn.push('DAWKA POWYŻEJ ZAKRESU ('+D.red+' '+unitLabel(D.main)+') – potwierdzona przez lekarza; kontrola jak na OIT.');}
 else if(dm>D.orange+1e-12){o.tier='orange';o.lvl='orange';o.warn.push('Dawka powyżej zwykłego zakresu ('+D.typ[0]+'–'+D.orange+' '+unitLabel(D.main)+'): rozważ drugi lek / konsultację OIT.');}
 if(dm<D.typ[0]-1e-12)o.warn.push('Dawka poniżej typowego zakresu początkowego ('+D.typ[0]+' '+unitLabel(D.main)+').');
 // stężenie vs dostęp
 var limP=nz(i.limP)&&i.limP>0?i.limP:D.periph,limC=nz(i.limC)&&i.limC>0?i.limC:D.central;o.limP=limP;o.limC=limC;
 o.maxMgP=limP*i.volMl/1000;o.maxAmpsP=o.maxMgP/D.amp.mg;o.maxMlP=o.maxAmpsP*D.amp.ml;
 o.maxMgC=limC*i.volMl/1000;o.maxAmpsC=o.maxMgC/D.amp.mg;
 if(i.access==='periph'){if(o.conc>limP+1e-9){o.lvl='red';o.hide=true;o.concBlock=true;o.warn.push('Stężenie '+rd(o.conc,1)+' µg/ml przekracza limit dla dostępu OBWODOWEGO ('+limP+' µg/ml). Wynik wstrzymany. Maks. dla tej objętości: '+String(rd(o.maxMlP,2)).replace('.',',')+' ml leku ('+String(rd(o.maxAmpsP,2)).replace('.',',')+' ampułki) w '+i.volMl+' ml.');}
  else o.warn.push('Dostęp obwodowy: krótko (do założenia dostępu centralnego), duża żyła, kontrola miejsca wkłucia – patrz limit czasu.');}
 else if(i.access==='central'){if(o.conc>limC+1e-9){o.lvl='red';o.hide=true;o.concBlock=true;o.warn.push('Stężenie '+rd(o.conc,1)+' µg/ml przekracza limit dla dostępu CENTRALNEGO ('+limC+' µg/ml). Wynik wstrzymany.');}}
 else{o.hide=true;o.needAccess=true;o.warn.push('Wybierz dostęp (obwodowy / centralny) – bez tego nie ustalono limitu stężenia.');}
 // spójność jednostek
 o.unitWarn='Wybrana jednostka dawki: '+unitLabel(i.unit)+(i.unit==='ugmin'?' – NIE µg/kg/min!':i.unit==='ugkgmin'?' – NIE µg/min!':'');
 o.ntgSbp=i.drug==='ntg'?'Tylko przy SBP >110 mmHg.':null;
 if(o.lvl==='ok'&&o.warn.length)o.lvl='orange';
 return o;}
function unitLabel(u){return u==='ugkgmin'?'µg/kg/min':u==='ugmin'?'µg/min':'mg/h';}
// kontrola odwrotna: ml/h → µg/kg/min
function inverse(mlh,conc,w){return w>0&&nz(mlh)&&nz(conc)?mlh*conc/(60*w):NaN;}
return{SRC:SRC,DRUGS:DRUGS,UNITS:UNITS,pump:pump,toUgMin:toUgMin,unitLabel:unitLabel,inverse:inverse};});
