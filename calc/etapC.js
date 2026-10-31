// ETAP C – silniki: neuroinfekcje, kardiowersja AF, zatrucie paracetamolem (NAC + nomogram Rumack–Matthew), krwawienie z GI (dostępność endoskopii).
// UMD: Node (tests/etapC.cjs) i przeglądarka (SK.etapC). Każda reguła ma źródło (SRC). Czego nie dało się zweryfikować w źródłach – oznaczone DO DECYZJI LEKARZA.
// Brak danych lub nierealne dane => brak wyniku (nigdy domyślne „prawidłowe”).
(function(r,f){var A=(typeof module==='object'&&module.exports)?require('./abxB2.js'):r.SK.abxB2;var m=f(A);if(typeof module==='object'&&module.exports)module.exports=m;else{r.SK=r.SK||{};r.SK.etapC=m;}})(this,function(AB){
'use strict';
var DEC='DO DECYZJI LEKARZA';
function nz(x){return typeof x==='number'&&isFinite(x);}
function num(x){if(typeof x==='number')return isFinite(x)?x:NaN;if(x==null||x==='')return NaN;var n=Number(String(x).replace(',','.'));return isFinite(n)?n:NaN;}
function r1(x){return Math.round(x*10)/10;}
function r2(x){return Math.round(x*100)/100;}
var SRC={
 escmid16:'ESCMID 2016 – van de Beek D. i wsp., Clin Microbiol Infect 2016, doi:10.1016/j.cmi.2016.01.007 (dostęp 23.10.2026)',
 idsa04:'IDSA 2004 – Tunkel A.R. i wsp., Clin Infect Dis 2004;39 (1 listopada) (dostęp 23.10.2026)',
 koroun:'KOROUN/NPOA/NIL – Rekomendacje postępowania w zakażeniach OUN: cz. 1 Diagnostyka (wyd. 3, 2026), cz. 2 Leczenie (02.2026) oraz wyd. 2024 (dostęp 23.10.2026). Uwaga: „Polskie rekomendacje PTN/NPOA 2016” dotyczą dróg oddechowych – dla OUN użyto rekomendacji KOROUN',
 esc24:'ESC 2024 – Van Gelder I.C. i wsp., Eur Heart J 2024 (wytyczne AF: Tab. 13 i 17, Ryc. 12, rozdz. 9.1; dostęp 23.10.2026)',
 erc21:'ERC 2021 – Soar J. i wsp., Resuscitation 2021;161 (ALS, arytmie okołozatrzymaniowe; dostęp 23.10.2026)',
 pamw23:'Wybraniec M.T., Kampka Z., Mizia-Stec K., Pol Arch Intern Med 2023;133(9):16547, doi:10.20452/pamw.16547',
 anpaf:'AnPAF – Maciag A. i wsp., Europace 2017;19(10):1637–42, doi:10.1093/europace/euw384, PMID 28339554 (RCT vs placebo, n=74)',
 anproaf:'AnProAF – Karwowski J. i wsp., Pol Arch Intern Med 2024;134(4):16657, doi:10.20452/pamw.16657, PMID 38166357 (RCT antazolina vs propafenon i.v., n=94)',
 cant:'CANT – Wybraniec M.T. i wsp., J Am Heart Assoc 2018;7(20):e010153, doi:10.1161/JAHA.118.010153, PMID 30371270 (retrospektywne, n=450)',
 cant2:'CANT II – Wybraniec M.T. i wsp., Pol Arch Intern Med 2022;132(6):16234, doi:10.20452/pamw.16234, PMID 35293200 (rejestr, n=1365)',
 phen:'ChPL Phenazolinum 50 mg/ml, roztwór do wstrzykiwań (Polpharma, pozwolenie R/0934; rejestr RPL, dostęp 23.10.2026)',
 rytm:'ChPL Rytmonorm 150 (propafenon), rejestr RPL (dostęp 23.10.2026) – brak schematu jednorazowej dawki „pill in the pocket”',
 pip:'Schemat „pill in the pocket” propafenon 450 mg (<70 kg) / 600 mg (>70 kg): afguidelines.com/pl/propafenon (Wytyczne MP 2026, źródło WTÓRNE, oparte na ESC 2024); PAMW 2023: u chorych <70 kg stosować niższą dawkę',
 dart23:'Dart R.C. i wsp., Management of Acetaminophen Poisoning in the US and Canada, JAMA Netw Open 2023, doi:10.1001/jamanetworkopen.2023.27739',
 nacchpl:'ChPL Acetylcysteine SANDOZ 100 mg/ml, roztwór do infuzji (pozwolenie 7893; rejestr RPL, dostęp 23.10.2026)',
 bpc26:'Belgian Poison Centre – Protocol paracetamoloverdosis volwassenen en kinderen v.2 (kwiecień 2026) – m.in. schemat Prescotta, SNAP, King’s College, masa maks. 110 kg',
 esge21:'ESGE 2021 – Gralnek I.M. i wsp., Endoscopy 2021, doi:10.1055/a-1369-5274 (NVUGIH)',
 esgev22:'ESGE 2022 – żylaki przełyku i żołądka, Endoscopy 2022, doi:10.1055/a-1939-4887, PMID 36174643',
 mida:'ChPL Midazolam Accord 1 mg/ml (rejestr RPL, dostęp 23.10.2026) – sedacja płytka',
 etom:'Anestezjol Ratow 2025;4 (sedacja proceduralna w SOR, akademiamedycyny.pl) – etomidat zwykle 0,1 mg/kg, średnio ok. 0,2 mg/kg łącznie',
 prop:'ChPL Diprivan (propofol) – dawka do sedacji 0,5–1 mg/kg powoli (źródło: streszczenie z wyszukiwania; pełnego ChPL nie otwarto)'
};
// ============================================================ NEUROINFEKCJE ============================================================
var SYMP=[['fever','Gorączka ≥38 °C'],['neck','Sztywność karku'],['head','Silny ból głowy'],['alt','Zaburzenia świadomości / splątanie'],['seiz','Drgawki'],['rash','Wybroczyny / plamica (wysypka nieblednąca)'],['focal','Objawy ogniskowe (niedowład, afazja, zaburzenia widzenia…)'],['photo','Światłowstręt'],['immuno','Obniżona odporność (HIV, leki immunosupresyjne, nowotwór, cukrzyca, alkoholizm, brak śledziony)'],['tick','Ukąszenie kleszcza / pobyt w lesie, na łące'],['rural','Wieś / Podhale (ekspozycja na kleszcze – borelioza)']];
function redLight(s){s=s||{};var any=SYMP.some(function(x){return s[x[0]]===true;});
 if(!any)return{lvl:'none',reasons:[],hints:[],txt:'Zaznacz objawy – brak wyniku. Brak objawów klasycznych nie wyklucza zapalenia opon (ESCMID 2016: triada występuje u ok. 41–51%).'};
 var red=[],or=[],hints=[];
 if(s.rash)red.push('plamica / wybroczyny: u >90% chorych oznaka zakażenia meningokokowego (ESCMID 2016) – antybiotyk NATYCHMIAST, cel ≤1 h; oceń sepsę');
 if(s.fever&&s.neck&&s.alt)red.push('triada: gorączka + sztywność karku + zaburzenia świadomości');
 else{if(s.fever&&s.neck)red.push('gorączka + sztywność karku');if(s.fever&&s.alt)red.push('gorączka + zaburzenia świadomości');}
 if(s.fever&&s.seiz)red.push('gorączka + drgawki');if(s.fever&&s.focal)red.push('gorączka + objawy ogniskowe (zapalenie mózgu / ropień / ZOMR)');
 if(s.immuno&&s.fever&&(s.head||s.alt||s.neck||s.photo))red.push('obniżona odporność + gorączka + objawy z OUN (nietypowe patogeny, Listeria)');
 if(!red.length){if(s.fever&&(s.head||s.photo))or.push('gorączka + ból głowy / światłowstręt');if(s.head&&(s.neck||s.photo))or.push('ból głowy + objawy oponowe (bez gorączki)');if(s.alt)or.push('zaburzenia świadomości (różnicować m.in. zapalenie mózgu)');if(s.seiz)or.push('drgawki');if(s.focal)or.push('objawy ogniskowe (różnicować udar, ropień, zapalenie mózgu)');if(s.fever&&s.immuno)or.push('gorączka u chorego z obniżoną odpornością');}
 if(s.fever&&(s.alt||s.seiz||s.focal))hints.push('podejrzenie zapalenia mózgu (HSV/VZV): acyklowir i.v. bez czekania na PCR (KOROUN 2026; zob. zakładka „Leczenie”)');
 if(s.tick||s.rural)hints.push('ekspozycja na kleszcze: w PMR i surowicy oznacz Borrelia (przeciwciała, wskaźnik), KZM (IgM/IgG). Wg KOROUN rejony endemiczne KZM: woj. podlaskie i warmińsko-mazurskie – Podhale NIE jest tam wymienione, ale borelioza obowiązuje; nie wyklucza ekspozycji');
 var lvl=red.length?'red':or.length?'orange':'ok';
 var txt=lvl==='red'?'CZERWONE ŚWIATŁO – podejrzenie zakażenia OUN: nie opóźniaj antybiotyku (≤1 h od przyjęcia, ESCMID 2016, A); posiewy krwi przed antybiotykiem; LP po ocenie przeciwwskazań.':lvl==='orange'?'POMARAŃCZOWE – utrzymuj niski próg do LP i antybiotyku; ocena lekarska.':'Zaznaczone objawy nie spełniają kryteriów czerwonego światła, ale NIE wykluczają zakażenia OUN.';
 return{lvl:lvl,reasons:red.concat(or),hints:hints,txt:txt,noDelay:lvl==='red'};}
// CT przed LP – ESCMID 2016, IDSA 2004, KOROUN 2026 (różnice pokazane obok siebie)
function ctBeforeLP(i){i=i||{};var known=['focal','cranOnly','seizNew','gcs','immuno','papil','cnsHx','altCons','mass','bradyHtn','pupils'];
 var gcs=num(i.gcs);if(i.gcs!==undefined&&i.gcs!==''&&!(gcs>=3&&gcs<=15))return{ok:false,msg:'GCS poza zakresem 3–15 – brak wyniku.'};
 var e=[],d=[],p=[];
 if(i.focal===true&&i.cranOnly!==true)e.push('ogniskowy deficyt neurologiczny (z wyłączeniem porażeń nn. czaszkowych)');
 if(i.seizNew===true)e.push('nowo powstałe drgawki');
 if(nz(gcs)&&gcs<10)e.push('GCS <10 (=' +gcs+')');
 if(i.immuno===true)e.push('ciężki niedobór odporności');
 var ids=[];if(i.immuno===true)ids.push('niedobór odporności');if(i.cnsHx===true)ids.push('choroba OUN w wywiadzie');if(i.seizNew===true)ids.push('nowe drgawki (≤1 tyg.)');if(i.papil===true)ids.push('tarcza zastoinowa');if(i.altCons===true||(nz(gcs)&&gcs<15))ids.push('zaburzenia świadomości');if(i.focal===true&&i.cranOnly!==true)ids.push('ogniskowy deficyt neurologiczny');
 var pl=[];if(i.bradyHtn===true)pl.push('bradykardia z nadciśnieniem');if(i.altCons===true||(nz(gcs)&&gcs<15))pl.push('zmieniony stan psychiczny');if(i.pupils===true)pl.push('nierówne / rozszerzone / słabo reagujące źrenice');if(i.papil===true)pl.push('tarcza zastoinowa');if(i.focal===true&&i.cranOnly!==true)pl.push('ogniskowe objawy neurologiczne');if(i.immuno===true)pl.push('ryzyko ropnia mózgu (obniżona odporność)');
 var anyInput=['focal','seizNew','immuno','papil','cnsHx','altCons','bradyHtn','pupils'].some(function(k){return i[k]===true||i[k]===false;})||nz(gcs);
 if(!anyInput)return{ok:false,msg:'Wypełnij dane kliniczne – brak wyniku.'};
 return{ok:true,escmid:e.length>0,idsa:ids.length>0,koroun:pl.length>0,escmidWhy:e,idsaWhy:ids,korounWhy:pl,
  ct:e.length>0||ids.length>0||pl.length>0,strict:e.length>0,
  txt:e.length?'TK głowy PRZED LP – wskazane wg ESCMID 2016 (silna rekomendacja, A).':(ids.length||pl.length)?'TK przed LP wskazane wg IDSA 2004 / KOROUN 2026 (kryteria szersze niż ESCMID); wg ESCMID – niewymagane. '+DEC+'.':'Brak kryteriów TK przed LP wg ESCMID, IDSA i KOROUN – LP bez TK (ESCMID: TK bez tych cech nie jest zalecana).',
  note:'Oczekiwanie na TK NIE może opóźniać antybiotyku (ESCMID A; KOROUN). Antybiotyk ≤1 h; posiewy krwi ×2 przed antybiotykiem.'};}
function lpContra(i){i=i||{};var o=[];var plt=num(i.plt),inr=num(i.inr);
 if(nz(plt)&&(plt<20||plt>1500))return{ok:false,msg:'PLT poza realnym zakresem – brak wyniku.'};if(nz(inr)&&(inr<0.5||inr>20))return{ok:false,msg:'INR poza realnym zakresem – brak wyniku.'};
 if(nz(plt)&&plt<50)o.push('PLT <50 G/l (KOROUN 2026)');if(nz(inr)&&inr>1.4)o.push('INR >1,4 (KOROUN 2026 cz. 1; wersja 2024: >1,5 – rozbieżność, '+DEC+')');
 if(i.shock===true)o.push('wstrząs / niestabilność hemodynamiczna – najpierw resuscytacja, posiewy krwi i antybiotyk, LP odłóż (KOROUN)');
 if(i.skin===true)o.push('zakażenie skóry w miejscu nakłucia');if(i.bleeding===true)o.push('czynne krwawienie / koagulopatia');if(i.resp===true)o.push('niewydolność oddechowa (zabezpiecz drogi oddechowe)');
 var any=nz(plt)||nz(inr)||['shock','skin','bleeding','resp'].some(function(k){return i[k]===true||i[k]===false;});
 if(!any)return{ok:false,msg:'Podaj PLT, INR lub zaznacz przeciwwskazania – brak wyniku.'};
 return{ok:true,contra:o.length>0,reasons:o,txt:o.length?'LP ODROCZONA: '+o.join('; ')+'. Nie opóźniaj antybiotyku.':'Brak zaznaczonych przeciwwskazań do LP w podanych danych.'};}
var TUBES=[
 {n:1,use:'biochemia + cytologia (cytoza, rozmaz, białko, glukoza, mleczany, chlorki)',lab:'laboratorium analityczne',note:'probówka polipropylenowa, bez aktywatora krzepnięcia (KOROUN)'},
 {n:2,use:'mikrobiologia: posiew + barwienie metodą Grama (bakterie, grzyby; w razie wskazań: Cryptococcus, gruźlica)',lab:'mikrobiologia',note:'transport w temperaturze pokojowej, NIE chłodzić i NIE zamrażać; jak najszybciej'},
 {n:3,use:'diagnostyka molekularna (PCR: HSV-1/2, VZV, enterowirusy, meningokok, pneumokok, ±Borrelia, KZM wg wskazań)',lab:'laboratorium molekularne',note:'trzecia probówka przeznaczona na PCR (KOROUN); zachowaj zapas materiału'}];
var CSF_NOTES=['Min. 2 probówki, optymalnie 3 (KOROUN 2026 cz. 1). Przy małej objętości lekarz wybiera: mikrobiologia czy biochemia (KOROUN).','Opóźnienie dostarczenia >60 min: fałszywy wzrost białka i spadek glukozy (KOROUN).','Glukozę w surowicy oznacz równolegle – potrzebna do współczynnika glukozy PMR / surowica.','Posiew: CIEPLARKA W SOR vs wprost do mikrobiologii – '+DEC+' wg lokalnej mikrobiologii (KOROUN: PMR dostarczyć jak najszybciej do mikrobiologii w temp. pokojowej; cieplarka 35–37 °C dotyczy butelek z krwią po dostarczeniu do laboratorium).','Kiedy NIE robić posiewu: ESCMID 2016 (A) zaleca posiew i barwienie Grama przy podejrzeniu bakteryjnego ZOMR – rezygnacja z posiewu to '+DEC+'. Antybiotyk podany przed LP może wyjałowić PMR (KOROUN: paciorkowiec grupy B bywa dodatni jeszcze ≥8 h), ale nie jest powodem pominięcia posiewu; PCR i posiewy krwi zachowują wartość.','Transport >2 h: użyj podłoża transportowego (KOROUN).'];
// interpretacja PMR – KOROUN 2026 cz. 1 (Tab. 23; BMS/Meningitest; mleczany)
function csfInterp(i){i=i||{};var cell=num(i.cells),prot=num(i.prot),glu=num(i.glu),sglu=num(i.sglu),lac=num(i.lac),neutPct=num(i.neutPct),gram=i.gram===true;
 var anyIn=[cell,prot,glu,sglu,lac].some(nz);if(!anyIn)return{ok:false,msg:'Wpisz wyniki PMR – brak wyniku.'};
 if(nz(cell)&&(cell<0||cell>200000))return{ok:false,msg:'Cytoza poza realnym zakresem.'};if(nz(prot)&&(prot<0||prot>2000))return{ok:false,msg:'Białko poza realnym zakresem (mg/dl).'};
 if(nz(glu)&&(glu<0||glu>1000))return{ok:false,msg:'Glukoza PMR poza realnym zakresem.'};if(nz(sglu)&&(sglu<20||sglu>2000))return{ok:false,msg:'Glukoza w surowicy poza realnym zakresem.'};
 if(nz(lac)&&(lac<0||lac>40))return{ok:false,msg:'Mleczany poza realnym zakresem.'};if(nz(neutPct)&&(neutPct<0||neutPct>100))return{ok:false,msg:'% neutrofili poza zakresem.'};
 var ratio=nz(glu)&&nz(sglu)?glu/sglu:NaN;var b=[],v=[],tbfu=[];
 if(nz(cell)){if(cell>=1000)b.push('cytoza ≥1000/µl');else if(cell>=100)b.push('cytoza ≥100/µl (zakres „kilkaset” – bakteryjne i wirusowe się nakładają)');else if(cell>5)v.push('cytoza '+cell+'/µl (kilka–kilkaset: typowo wirusowe)');}
 if(nz(neutPct)&&nz(cell)&&cell>5){if(neutPct>=50)b.push('przewaga neutrofili');else v.push('przewaga limfocytów');}
 if(nz(prot)){if(prot>100)b.push('białko >100 mg/dl');else v.push('białko ≤100 mg/dl (typowo norma lub nieznacznie podwyższone w wirusowych)');}
 if(nz(ratio)){if(ratio<0.4)b.push('współczynnik glukozy <0,4');else if(ratio>=0.6)v.push('współczynnik glukozy ≥0,6');else tbfu.push('współczynnik glukozy 0,4–0,6 (strefa pośrednia: m.in. gruźlica, grzybice, część bakteryjnych)');}
 if(nz(lac)){if(lac>2.4)b.push('mleczany >2,4 mmol/l (bakteryjne, grzybicze lub gruźlicze)');else if(lac>=1.1)v.push('mleczany 1,1–2,4 mmol/l (typowo wirusowe)');}
 var bms=null;if(nz(prot)&&nz(cell)&&nz(num(i.csfNeut))&&nz(num(i.bloodNeut))){bms=(gram?2:0)+(prot>80?1:0)+(num(i.csfNeut)>1000?1:0)+(num(i.bloodNeut)>10000?1:0)+(i.seiz===true?1:0);}
 var cls='';if(gram||(b.length>=2&&v.length===0))cls='bact';else if(b.length>=1&&v.length>=1)cls='mixed';else if(v.length>=1&&b.length===0)cls='viral';else if(tbfu.length)cls='tbfungal';else if(b.length===1)cls='mixed';
 var txt={bact:'Profil PRZEMAWIA ZA bakteryjnym ZOMR – kontynuuj / włącz antybiotyk, nie odraczaj.',viral:'Profil przemawia za wirusowym ZOMR (niepewność): antybiotyku nie odstawiaj bez wyniku posiewu/PCR i decyzji lekarza. '+DEC,mixed:'Profil niejednoznaczny – nie wykluczaj bakteryjnego ZOMR; leczenie empiryczne do wyników.',tbfungal:'Profil pośredni – rozważ gruźlicę / grzybicę (Cryptococcus, BK) / listeriozę; konsultacja zakaźnicza.','':'Za mało danych do klasyfikacji.'}[cls];
 if(gram)txt='Barwienie Grama DODATNIE → bakteryjne ZOMR do czasu wyniku posiewu. '+txt;
 return{ok:true,cls:cls,ratio:nz(ratio)?r2(ratio):NaN,bact:b,viral:v,mid:tbfu,bms:bms,txt:txt,
  warn:'Cytoza/biochemia nie rozstrzygają etiologii (KOROUN); żaden algorytm nie jest w 100% czuły (ESCMID 2016). PCR / posiew rozstrzygają.',
  src:SRC.koroun+'; '+SRC.escmid16};}
// ---------- leczenie empiryczne ----------
function srcAgeGroup(age){if(!(age>=18&&age<=110))return null;return age>50?'gt50':'18-50';}
function renalFor(id,doseTxt,stdTxt,crcl,rrt){var rr=AB.renal(id,crcl,rrt||'none');var diff=(id==='cftx'||id==='cfx');var t=rr.text;
 // dawka w ZOMR różni się od dawki standardowej silnika: tekst „bez zmiany: <dawka standardowa>” byłby mylący
 if(diff&&rr.status==='ok')t='bez korekty nerkowej (progi ChPL niezmienione) – dawka jak w ZOMR podana wyżej';
 else if(diff&&rr.mod)t=t+' (to korekta ChPL dla dawki standardowej; dawka w ZOMR jest wyższa – '+DEC+')';
 return{name:rr.name,status:rr.status,text:t,std:stdTxt,dose:doseTxt,mod:!!rr.mod,avoid:!!rr.avoid,tdm:!!rr.tdm};}
function neuroTreat(i){i=i||{};var age=num(i.age),w=num(i.w);var res={ok:false,needs:[],drugs:[],decisions:[],warnings:[],notes:[],steroid:null,src:[SRC.escmid16,SRC.idsa04,SRC.koroun]};
 if(!(age>=18&&age<=110))res.needs.push(nz(age)?'wiek poza zakresem 18–110 lat (moduł dla dorosłych)':'wiek (pasek pacjenta)');
 if(!(w>=30&&w<=350))res.needs.push(nz(w)?'masa ciała poza zakresem 30–350 kg':'masa ciała (pasek pacjenta)');
 if(i.pregnancy===undefined)res.needs.push('ciąża / karmienie (tak/nie)');
 if(i.betaAllergy===undefined)res.needs.push('alergia na β-laktamy (tak/nie)');
 if(res.needs.length)return res;
 var c=AB.cg({age:age,sex:i.sex,w:w,h:i.h,crMg:i.crMg});var crcl=c.ok?c.crcl:NaN;res.crcl=c;var rrt=i.rrt||'none';
 if(!c.ok&&rrt==='none')res.warnings.push('Nie obliczono CrCl – brakuje: '+c.missing.join(', ')+'. Dawki podano jako pełne, BEZ korekty nerkowej – '+DEC+'. Pierwsza dawka zawsze pełna.');
 var listeria=age>50||i.listeriaRisk===true;res.listeria=listeria;
 if(i.betaAllergy===true){res.decisions.push('Alergia na β-laktamy: ESCMID 2016 podaje chloramfenikol / meropenem / moxifloksacynę jako alternatywy (część na podstawie opisów przypadków) – brak zweryfikowanego schematu w aplikacji: '+DEC+'. Konsultacja zakaźnicza.');}
 var D=[];
 if(i.betaAllergy!==true){
  D.push(Object.assign({role:'cefalosporyna III gen. (wybierz JEDNĄ)',drug:'Ceftriakson'},renalFor('cftx','2 g co 12 h i.v. (lub 4 g co 24 h) – ESCMID 2016 / IDSA 2004','2 g co 24 h i.v.',crcl,rrt)));
  D.push(Object.assign({role:'alternatywa (zamiast ceftriaksonu)',drug:'Cefotaksym'},renalFor('cfx','2 g co 4–6 h i.v. – ESCMID 2016','2 g co 8 h i.v.',crcl,rrt)));}
 D.push({role:'pokrycie opornego pneumokoka (ESCMID: wankomycyna LUB ryfampicyna 300 mg co 12 h)',drug:'Wankomycyna',dose:'ESCMID 2016: 10–20 mg/kg co 8–12 h i.v. (stężenie minimalne docelowo 15–20 µg/ml)',std:'dawka nasycająca 25–30 mg/kg (NPOA 2020, silnik abxB2)',status:'tdm',text:'Dawka nasycająca 25–30 mg/kg = '+r1(25*w)+'–'+r1(30*w)+' mg (masa '+w+' kg); dawkowanie podtrzymujące WYŁĄCZNIE wg stężeń (TDM), bez korekty wg CrCl – '+DEC+'.',mod:false,avoid:false,tdm:true});
 if(listeria){var rl=renalFor('amp_q4','2 g co 4 h i.v. – ESCMID 2016','2 g co 4 h i.v.',crcl,rrt);D.push(Object.assign({role:'Listeria: wiek >50 lat lub czynnik ryzyka (immunosupresja, nowotwór, cukrzyca)',drug:'Ampicylina'},rl));}
 var hsv=(i.encephalitis===true);
 if(hsv){var ra=AB.renal('acv',crcl,rrt);var mg=10*w;D.push({role:'zapalenie mózgu – NIE czekaj na PCR',drug:'Acyklowir',dose:'10 mg/kg co 8 h i.v. = '+r1(mg)+' mg/dawkę (masa '+w+' kg; przy otyłości: masa należna/skorygowana – '+DEC+')',std:'10 mg/kg co 8 h (HSV – zapalenie mózgu)',status:ra.status,text:ra.text,mod:!!ra.mod,avoid:false,tdm:false,name:'Acyklowir'});}
 res.drugs=D;
 // deksametazon
 var dx={dose:'10 mg i.v. co 6 h przez 4 dni (dorośli; ESCMID 2016, A; IDSA 2004: 0,15 mg/kg co 6 h przez 2–4 dni – '+(w>0?r1(0.15*w)+' mg':'')+')',
  when:['ESCMID 2016: razem z pierwszą dawką antybiotyku (A); jeśli antybiotyk już podano – nadal do 4 h od jego początku (C).','IDSA 2004: 10–20 min PRZED lub równocześnie z pierwszą dawką antybiotyku; zalecane przy (podejrzeniu) PNEUMOKOKOWYM ZOMR (A-I); nie powinna być podawana chorym, którym antybiotyk już podano.','KOROUN 2026: przed antybiotykiem; najpóźniej do 12 h od jego rozpoczęcia – rozbieżność z ESCMID (4 h) – '+DEC+'.','Przerwij, gdy rozpoznanie inne niż bakteryjne ZOMR lub patogen ≠ pneumokok / H. influenzae (ESCMID B; niektórzy eksperci kontynuują).','Listeria: KOROUN odradza deksametazon przy Listeria – przy czynniku ryzyka listeriozy '+DEC+'.']};
 res.steroid=dx;if(listeria)res.decisions.push('Czynnik ryzyka Listeria (>50 lat / immunosupresja): deksametazon wg KOROUN odradzany przy listeriozie, wg ESCMID/IDSA – standardowo dla ZOMR – '+DEC+'.');
 if(i.immuno===true)res.decisions.push('Obniżona odporność: spektrum patogenów szersze (ESCMID 2016) – zakres empiryczny uzgodnij z zakaźnikiem: '+DEC+'.');
 res.decisions.push('Dobór empiryczny dla regionu: wankomycyna/ryfampicyna zależy od lokalnej oporności pneumokoków – '+DEC+' (lokalna polityka antybiotykowa).');
 D.forEach(function(d){if(d.text&&/DO DECYZJI/.test(d.text))res.decisions.push(d.drug+': '+d.text);
  if(d.drug==='Ceftriakson'&&c.ok&&crcl<10)res.decisions.push('Ceftriakson przy CrCl <10: ChPL maks. 2 g/dobę, a dawka w ZOMR to 4 g/dobę – '+DEC+'.');
  if(d.drug==='Acyklowir'&&c.ok&&crcl<10)res.decisions.push('Acyklowir CrCl <10: połowa dawki co 24 h (ChPL) – '+DEC+' w zapaleniu mózgu.');});
 if(i.pregnancy===true)res.decisions.push('Ciąża / karmienie: dobór leków i deksametazon – '+DEC+'.');
 res.notes.push('Pierwsza dawka antybiotyku w ≤1 h od przyjęcia; posiewy krwi ×2 PRZED antybiotykiem, ale bez opóźniania go (ESCMID 2016, A).');
 res.notes.push('Izolacja kropelkowa przy podejrzeniu ZOMR meningokokowego/bakteryjnego (do czasu wyjaśnienia etiologii): okres izolacji nie został zweryfikowany w tej sesji – '+DEC+' wg procedur szpitala.');
 res.ok=true;return res;}
var PROPH=[['Ciprofloksacyna','500 mg p.o. jednorazowo'],['Ceftriakson','250 mg i.m. jednorazowo (preferowany w ciąży)'],['Ryfampicyna','600 mg p.o. co 12 h przez 2 dni']];
var PROPH_NOTE='Profilaktyka kontaktów po zachorowaniu meningokokowym (INFORMACJA – ESCMID 2016): w ciągu 24 h, dawki jak wyżej. Kogo objąć profilaktyką, zgłoszenie do Sanepidu i profilaktykę osoby leczonej – '+DEC+' (definicja kontaktu wg lokalnych procedur).';
function transferNeuro(i){i=i||{};var r=[];
 if(i.gcs!==undefined&&i.gcs!==''&&!(num(i.gcs)>=3&&num(i.gcs)<=15))return{ok:false,msg:'GCS poza zakresem.'};
 var gcs=num(i.gcs);
 if(nz(gcs)&&gcs<=8)r.push('OIT: GCS ≤8 – zabezpieczenie dróg oddechowych');
 if(i.shock===true)r.push('OIT: wstrząs / sepsa (meningokokemia, plamica)');if(i.seizRep===true)r.push('OIT: powtarzające się drgawki / stan padaczkowy');if(i.icp===true)r.push('OIT / neurochirurgia: objawy wzmożonego ciśnienia śródczaszkowego / wgłobienia');
 if(i.imaging===true)r.push('Neurochirurgia: ropień / ropniak podtwardówkowy / wodogłowie w obrazowaniu (ESCMID: rozważyć interwencję)');
 if(i.encephalitis===true)r.push('Oddział zakaźny / neurologia: zapalenie mózgu – leczenie acyklowirem, PCR');
 if(i.susp===true&&!r.length)r.push('Oddział zakaźny (izolacja kropelkowa) – ZOMR bez cech OIT');
 if(!r.length&&!(i.susp===true))return{ok:false,msg:'Zaznacz kryteria – brak wyniku.'};
 return{ok:true,items:r,txt:'Kryteria przekazania są propozycją – '+DEC+' (dostępność miejsc, procedury powiatowego szpitala).'};}
// ============================================================ AF – KARDIOWERSJA ============================================================
function cvEligibility(i){i=i||{};var h=num(i.hours);var res={ok:false,lvl:'none',title:'',reasons:[],actions:[],src:[SRC.esc24,SRC.pamw23]};
 if(i.unstable===true){res.ok=true;res.lvl='red';res.title='Niestabilny hemodynamicznie → kardiowersja elektryczna PILNA (ESC 2024, rozdz. 9.1: pierwszy wybór, gdy rytm zatokowy jest korzystny)';res.reasons.push('Nie opóźniaj kardiowersji z powodu antykoagulacji.');res.actions.push('Jak najszybciej włącz antykoagulację (np. jedna dawka HDCz/UFH, jeśli brak wcześniejszej) – ESC 2024: IIa B; PAMW 2023.');res.actions.push('Amiodaron jest opcją drugiego rzutu z powodu opóźnionego działania, ale może być właściwy w sytuacji ostrej (ESC 2024, rozdz. 9.1) – '+DEC+'.');return res;}
 if(i.unstable!==false&&i.unstable!==true)return{ok:false,lvl:'none',title:'',msg:'Oceń stabilność hemodynamiczną – brak wyniku.'};
 var unknown=i.unknown===true;
 if(!unknown&&!(h>=0&&h<=24*365))return{ok:false,lvl:'none',msg:nz(h)?'Czas trwania poza realnym zakresem (0 h–1 rok) – brak wyniku.':'Podaj czas trwania AF (h) albo zaznacz „czas nieznany” – brak wyniku.'};
 var oac=i.oac3w===true,tee=i.tee;res.ok=true;
 if(tee==='thrombus'){res.lvl='red';res.title='Skrzeplina w uszku LP w TOE → NIE kardiowertować';res.reasons.push('Skuteczna antykoagulacja minimum 4 tygodnie, potem powtórne TOE potwierdzające ustąpienie skrzepliny przed kardiowersją (ESC 2024: IIa, C).');return res;}
 if(!unknown&&h<24){res.lvl='ok';res.title='Czas trwania <24 h (potwierdzony początek) → kardiowersja dopuszczalna bez wcześniejszej OAC ≥3 tyg. / TOE';res.reasons.push('ESC 2024: ryzyko zatorowe jest najmniejsze w pierwszych godzinach; zgodnie z ESC 2024 „bezpieczeństwo przede wszystkim” – próg 24 h (nie 48 h).');res.actions.push('Włącz antykoagulację jak najszybciej, najlepiej PRZED kardiowersją (ESC 2024: IIa B).');res.actions.push('Alternatywa u stabilnego chorego: wstrzymanie się do 48 h na spontaniczną konwersję (ESC 2024: IIa, B).');if(i.start!==true)res.reasons.push('Początek arytmii musi być DOKŁADNIE znany (objawy ≠ początek): '+DEC+'.');return res;}
 if(oac||tee==='clear'){res.lvl='ok';res.title=oac?'Skuteczna OAC ≥3 tygodnie (DOAK – regularne przyjmowanie / VKA INR ≥2) → kardiowersja dopuszczalna':'TOE bez skrzepliny → kardiowersja wczesna dopuszczalna';res.reasons.push(oac?'ESC 2024: I, B. Przy wątpliwościach co do regularności przyjmowania DOAK / INR <2 w ostatnich 3 tyg. rozważ TOE ('+DEC+').':'ESC 2024: I, B – TOE zamiast 3 tyg. OAC; mimo to włącz OAC przed zabiegiem.');res.actions.push('Po kardiowersji OAC ≥4 tyg. (zob. zakładka „Po kardiowersji”).');return res;}
 if(!unknown&&h<48){res.lvl='orange';res.title='24–48 h: ESC 2024 – kardiowersja wczesna NIE zalecana bez OAC ≥3 tyg. lub TOE (III, C)';res.reasons.push('Wcześniejsze wytyczne (ESC 2020, cytowane w PAMW 2023) dopuszczały kardiowersję bez OAC przy czasie <48 h – rozbieżność: '+DEC+'.');res.actions.push('Opcje: TOE → kardiowersja; albo włącz OAC i kardiowersja elektywna po ≥3 tyg.; albo wstrzymanie się na spontaniczną konwersję do 48 h (IIa B).');return res;}
 res.lvl='red';res.title=unknown?'Czas nieznany → kardiowersja NIE zalecana bez OAC ≥3 tyg. lub TOE':'≥48 h → kardiowersja NIE zalecana bez OAC ≥3 tyg. lub TOE';res.reasons.push('Dotyczy kardiowersji elektrycznej I farmakologicznej (ESC 2024: oba zabiegi wymagają ≥3 tyg. OAC lub TOE).');res.actions.push('Włącz antykoagulację; kontrola rytmu serca (β-bloker / diltiazem – zakładka „Kontrola rytmu serca”); kardiowersja elektywna po ≥3 tyg. OAC albo pod kontrolą TOE.');return res;}
function postCv(i){i=i||{};var sr=i.sr;if(sr!==true&&sr!==false)return{ok:false,msg:'Zaznacz, czy przywrócono rytm zatokowy – brak wyniku.'};
 var va=i.va;var out={ok:true,main:'OAC przez co najmniej 4 TYGODNIE po kardiowersji u KAŻDEGO chorego – niezależnie od CHA₂DS₂-VA / CHA₂DS₂-VASc, czynników ryzyka i wieku, i niezależnie od tego, czy rytm zatokowy się utrzymał (ESC 2024: I, B).',
  excl:'Wyjątek opisany w ESC 2024: OAC po kardiowersji „opcjonalna” tylko, gdy początek AF DEFINITYWNIE <24 h, brak czynników ryzyka zatorowego i rytm zatokowy w <24 h – '+DEC+'; domyślnie aplikacja zaleca ≥4 tyg.',
  pamw:'PAMW 2023: przy AF <24 h i CHA₂DS₂-VASc 0 (♂) / 1 (♀) 4-tygodniową OAC można pominąć – '+DEC+'.',src:[SRC.esc24,SRC.pamw23]};
 if(i.lowRisk===true&&i.hours<24)out.note='Spełnione kryteria wyjątku – nadal '+DEC+'.';
 if(typeof va==='number'&&isFinite(va)){out.long=va>=2?'Po 4 tygodniach: OAC długoterminowo – ZALECANA (CHA₂DS₂-VA ≥2; ESC 2024).':va===1?'Po 4 tygodniach: OAC długoterminowo – ROZWAŻ (CHA₂DS₂-VA =1; ESC 2024).':'Po 4 tygodniach: CHA₂DS₂-VA =0 – bez długoterminowej OAC (poza wskazaniami innymi); decyzja lekarza.';out.longLvl=va>=2?'orange':'ok';}else out.long='Oblicz CHA₂DS₂-VA (zakładka „CHA₂DS₂-VA”) – brak wyniku dalszej OAC bez oceny.';
 if(sr===false)out.fail='Kardiowersja nieskuteczna / brak rytmu zatokowego: zasady OAC jak wyżej; plan: kontrola rytmu serca, ponowna kardiowersja elektywna – '+DEC+'.';
 return out;}
function ecPlan(i){i=i||{};var rh=i.rhythm;if(rh!=='af'&&rh!=='flutter')return{ok:false,msg:'Wybierz rytm (AF / trzepotanie) – brak wyniku.'};
 var seq=rh==='af'?[120,150,200]:[70,100,120];
 return{ok:true,rhythm:rh,seq:seq,
  energy:rh==='af'?'Dwufazowo, zsynchronizowany wstrząs: 120 → 150 → 200 J (schemat eskalacji). Alternatywa (ERC 2021): pierwszy wstrząs przy MAKSYMALNEJ energii defibrylatora jest uzasadnioną strategią – skuteczniejsza niż eskalacja, bez wzrostu zdarzeń niepożądanych. PAMW 2023: w AF może być potrzebne 150–200 J. Maksimum zależy od aparatu: '+DEC+' (instrukcja defibrylatora).':'Trzepotanie / częstoskurcz regularny: 70–120 J dwufazowo, kolejne wstrząsy ze zwiększaną energią (ERC 2021); PAMW 2023: 70–100 J.',
  steps:['Wstrząs ZSYNCHRONIZOWANY z załamkiem R (tryb SYNC; sprawdź znacznik na każdym QRS) – ERC 2021.','Elektrody: położenie przednio-tylne lub przednio-boczne – bez różnicy w skuteczności (ESC 2024).','Monitorowanie: stałe EKG, ciśnienie, pulsoksymetria; dostępne: atropina / izoprenalina lub stymulacja przezskórna na wypadek bradykardii po kardiowersji (ESC 2024).','Przy braku skuteczności: kolejny wstrząs z większą energią. Liczba prób i rola amiodaronu przed ponowną próbą: '+DEC+' (dawka amiodaronu – zakładka „Farmakologicznie”; w ERC 2021 nie została w tej sesji zweryfikowana).','Po wstrząsie: 12-odprowadzeniowe EKG, ocena rytmu, ciśnienia i stanu neurologicznego; obserwacja do pełnego wybudzenia.'],
  src:[SRC.erc21,SRC.pamw23,SRC.esc24]};}
var SEDATION=[
 {drug:'Midazolam',dose:'dorośli <60 lat: 2,0–2,5 mg i.v. powoli (ok. 1 mg/30 s), w razie potrzeby kolejne po 1 mg; zwykle łącznie ≤5 mg; >60 lat / wyniszczeni: 0,5–1,0 mg, łącznie zwykle ≤3,5 mg (ChPL – sedacja PŁYTKA)',src:SRC.mida},
 {drug:'Etomidat',dose:'ok. 0,1 mg/kg i.v., średnia dawka całkowita ok. 0,2 mg/kg (publikacja przeglądowa 2025; bez pełnego ChPL)',src:SRC.etom},
 {drug:'Propofol',dose:'0,5–1 mg/kg i.v. powoli (1–5 min), miareczkować (streszczenie ChPL Diprivan)',src:SRC.prop}];
function sedationPlan(w){w=num(w);var ok=w>=30&&w<=350;return{ok:ok,drugs:SEDATION.map(function(d){var o={drug:d.drug,dose:d.dose,src:d.src};if(ok){if(d.drug==='Etomidat')o.calc=r1(0.1*w)+' mg (0,1 mg/kg), do ok. '+r1(0.2*w)+' mg łącznie';if(d.drug==='Propofol')o.calc=r1(0.5*w)+'–'+r1(1*w)+' mg (0,5–1 mg/kg), miareczkować';}return o;}),
 notes:['Sedacja / znieczulenie do kardiowersji: ESC 2024 – midazolam, propofol lub etomidat (dożylnie); głębokość i dobór leku: '+DEC+' (zespół z doświadczeniem w sedacji / anestezjolog; lokalny protokół).','Pacjent na czczo wg lokalnych zasad sedacji – '+DEC+'; zapewnij sprzęt do udrożnienia dróg oddechowych, kapnografię / pulsoksymetrię, dostęp i.v.','Analgezja (np. opioid) do kardiowersji: brak zweryfikowanych dawek w tej wersji – '+DEC+'.'],src:[SRC.esc24,SRC.mida,SRC.etom,SRC.prop]};}
// farmakologiczna
function propafenonePIP(w){w=num(w);if(!(w>=30&&w<=250))return{ok:false,msg:nz(w)?'Masa poza zakresem 30–250 kg – brak wyniku.':'Podaj masę ciała – brak wyniku.'};
 var esc=w<70?450:(w>70?600:null);var usr=w<=80?450:600;
 var o={ok:true,w:w,escMg:esc,userMg:usr,tabsEsc:esc?esc/150:null,tabsUser:usr/150,boundary:w===70,discrepancy:esc!==null&&esc!==usr,
  src:[SRC.pip,SRC.rytm,SRC.esc24]};
 o.txt=esc===null?'Masa dokładnie 70 kg – źródła mówią „<70 kg: 450 mg” i „>70 kg: 600 mg”: '+DEC+'.':'Wg źródła (próg 70 kg): '+esc+' mg = '+(esc/150)+' tabl. Rytmonorm 150 mg.';
 o.userTxt='Wg progu podanego przez użytkownika (≤80 kg: 450 mg; >80 kg: 600 mg): '+usr+' mg = '+(usr/150)+' tabl.';
 if(o.discrepancy)o.warn='ROZBIEŻNOŚĆ: dla masy '+w+' kg (>70, ≤80 kg) źródło (70 kg) daje 600 mg, a próg użytkownika (80 kg) – 450 mg. Domyślnie pokazano wartość ze źródła; '+DEC+'.';
 return o;}
var PIP_CONTRA=['istotna strukturalna choroba serca: zawał <3 mies. (ChPL); choroba wieńcowa i przerost LK – przeciwwskazane w ESC 2024 dla klasy Ic','niewyrównana niewydolność serca z EF <35% (ChPL); HFrEF – przeciwwskazane w ESC 2024 dla klasy Ic','objawowa ciężka bradykardia, zaburzenia czynności węzła zatokowego, blok AV II° lub wyższy, blok odnogi / blok dystalny bez stymulatora (ChPL)','zespół Brugadów (ChPL); zatrzymaj, gdy QRS poszerza się o >25% (ESC 2024)','ciężkie niedociśnienie, wstrząs kardiogenny (ChPL)','zaburzenia wodno-elektrolitowe (np. potas), ciężka obturacyjna choroba płuc, miastenia (ChPL)','jednoczesne stosowanie rytonawiru (ChPL); nie łącz z innym lekiem przeciwarytmicznym (PAMW 2023)','TRZEPOTANIE przedsionków – nie do kardiowersji propafenonem (ryzyko przewodzenia 1:1)'];
function amiodarone(w){w=num(w);var o={ok:true,dose:'300 mg i.v. w 30–60 min, następnie 900–1200 mg i.v. w ciągu 24 h (ESC 2024, Tab. 13); skuteczność ok. 44% (ESC 2024), działanie opóźnione: 8–12 h do kilku dni.',alt:'Moduł v4.x podawał 5–7 mg/kg w 1–2 h – rozbieżność z ESC 2024; przyjęto ESC 2024: '+DEC+'.',
  how:['Rozcieńczenie, droga dostępu i pompa wg ChPL amiodaronu (nie zweryfikowano w tej sesji) – '+DEC+'.','Ryzyko: hipotensja, bradykardia / blok AV, wydłużenie QT; nadczynność tarczycy – tylko gdy brak alternatywy; liczne interakcje.','Kardiowersja farmakologiczna wymaga TEGO SAMEGO zabezpieczenia przeciwzakrzepowego co elektryczna: AF >24–48 h / czas nieznany bez OAC ≥3 tyg. lub TOE → ryzyko udaru / zatoru po konwersji (ESC 2024; PAMW 2023).'],src:[SRC.esc24,SRC.pamw23]};
 if(w>=30&&w<=250)o.mgkg='dla informacji: 5–7 mg/kg (moduł v4.x) = '+r1(5*w)+'–'+r1(7*w)+' mg';return o;}
function flecainideIv(w){w=num(w);return{avail:false,txt:'Flekainid i.v. – NIEDOSTĘPNY w szpitalu użytkownika (informacja od użytkownika; PAMW 2023: i.v. flekainid niedostępny w Polsce). ESC 2024: 1–2 mg/kg w 10 min – wyłącznie informacyjnie, bez przycisków i bez obliczeń do podania.',src:[SRC.esc24,SRC.pamw23]};}
function antazoline(i){i=i||{};var o={ok:true,regimens:[
 {id:'chpl',t:'ChPL Phenazolinum (Polpharma): 100–300 mg i.v. w ciągu 3–10 min pod ścisłą kontrolą ciśnienia i EKG; przerwać po powrocie rytmu zatokowego; większe dawki – OIT. Wskazanie w ChPL: napadowe zaburzenia rytmu nadkomorowego włącznie z AF, „niereagujące na standardowe leczenie przeciwarytmiczne”.',src:SRC.phen},
 {id:'anpaf',t:'AnPAF (RCT vs placebo, n=74; AF <43 h, bez niewydolności serca): 50 mg w 10 ml co 5 min, do łącznie 250 mg; konwersja 72,2% vs 10,5%, mediana czasu 16 vs 72,5 min.',src:SRC.anpaf},
 {id:'anproaf',t:'AnProAF (RCT vs propafenon i.v., n=94): antazolina do 300 mg vs propafenon do 140 mg; konwersja 63% vs 52,1% (różnica nieistotna), czas 10 vs 30 min, ciężkie zdarzenia niepożądane 10,8% vs 10,4%.',src:SRC.anproaf},
 {id:'cant',t:'CANT / CANT II (rejestry z SOR, n=450 / n=1365): bolus wolny 100–200 mg (lub rozcieńczony wlew 5–15 min); skuteczność antazoliny: CANT 85,3% (vs amiodaron 66,7%, propafenon 78,6%); CANT II 78,3% (vs amiodaron 66,9%, propafenon 72,7%).',src:SRC.cant+'; '+SRC.cant2}],
 contra:['nadwrażliwość, JASKRA, wiek <12 lat, karmienie piersią (ChPL)','padaczka (ChPL: unikać), ostrożnie: nadciśnienie, utrwalone zaburzenia rytmu, cukrzyca, nadczynność tarczycy, rozrost prostaty','IMAO, leki cholinolityczne (fenotiazyny, hydroksyzyna, TLPD) – unikać; synergia z lekami depresyjnymi OUN i alkoholem (ChPL)','PAMW 2023: stosować tylko bez strukturalnej choroby serca, przy ścisłym nadzorze EKG','nie łączyć z innym lekiem przeciwarytmicznym (PAMW 2023, Tab. 2)'],
 effects:'Możliwe (PAMW 2023): przejściowy wzrost HR i poszerzenie QRS przed konwersją, suchość w ustach, nudności, wymioty, hipotensja, bradykardia po konwersji. ChPL: senność – uwaga na prowadzenie pojazdów.',
 evid:'POZIOM DOWODÓW: jedno małe RCT vs placebo (n=74), jedno RCT vs propafenon (n=94, bez różnicy skuteczności), rejestry retrospektywne; brak dużych RCT; lek NIE jest zalecany w ESC 2024 ani wytycznych amerykańskich (PAMW 2023). Stosowanie jako lek pierwszego wyboru do kardiowersji AF wykracza poza zapis ChPL („niereagujące na standardowe leczenie”) – praktyka off-label, '+DEC+'.',
 src:[SRC.phen,SRC.anpaf,SRC.anproaf,SRC.cant,SRC.cant2,SRC.pamw23]};
 var tot=num(i.maxMg);o.maxMg=300;o.ampule='1 ampułka = 100 mg / 2 ml (50 mg/ml; ChPL)';return o;}
function pharmaScreen(i){i=i||{};var keys=['hfref','cad','lvh','valve','avb','qrs','qt','sss'];var any=keys.some(function(k){return i[k]===true||i[k]===false;});
 if(!any)return{ok:false,msg:'Oceń choroby strukturalne i EKG – brak wyniku.'};
 var shd=['hfref','cad','lvh','valve'].filter(function(k){return i[k]===true;});var ecg=['avb','qrs','qt','sss'].filter(function(k){return i[k]===true;});
 var lab={hfref:'niewydolność serca / niska EF',cad:'choroba wieńcowa',lvh:'przerost LK',valve:'istotna wada zastawkowa',avb:'blok AV / bradykardia',qrs:'szerokie QRS / BBB',qt:'QTc >500 ms',sss:'zespół chorego węzła'};
 var r={ok:true,classI:ecg.length===0&&shd.length===0,shd:shd.map(function(k){return lab[k];}),ecg:ecg.map(function(k){return lab[k];})};
 r.txt=shd.length?'Choroba strukturalna serca ('+r.shd.join(', ')+') → leki klasy Ic i antazolina NIEZALECANE; w ESC 2024 pozostaje amiodaron i.v.':ecg.length?'Zaburzenia EKG ('+r.ecg.join(', ')+') → leki klasy Ic (ChPL: zaburzenia przewodzenia, blok AV) przeciwwskazane; wybór metody: '+DEC+'.':'Brak zaznaczonych przeciwwskazań – nadal: monitorowanie EKG/RR, brak łączenia leków.';
 return r;}
// ============================================================ PARACETAMOL ============================================================
var UMOL=6.615;
function ugToUmol(x){return x*UMOL;}function umolToUg(x){return x/UMOL;}
function nomLine(t){var h=num(t);if(!(h>=4&&h<=24))return NaN;return 150*Math.pow(0.5,(h-4)/4);}
function nomHigh(t){var h=num(t);if(!(h>=4&&h<=24))return NaN;return 300*Math.pow(0.5,(h-4)/4);}
function nomogram(i){i=i||{};var unit=i.unit==='umol'?'umol':'ug';var c=num(i.conc),h=num(i.hours);
 if(i.nonAcute===true)return{ok:true,usable:false,lvl:'red',txt:'Nomogram NIE dotyczy spożycia rozłożonego w czasie / przewlekłego / o nieznanym czasie – nie interpretuj punktu; leczenie NAC wg ALT, INR i stężenia (>20 µg/ml lub nieprawidłowe ALT/AST → NAC).'};
 if(!nz(c)||!nz(h))return{ok:false,msg:'Podaj stężenie paracetamolu i czas od spożycia – brak wyniku.'};
 if(h<4)return{ok:true,usable:false,lvl:'orange',txt:'Czas <4 h od spożycia – NIE interpretować stężenia na nomogramie; powtórz oznaczenie po ≥4 h od spożycia (Dart 2023, BPC 2026). NAC nie czeka, jeśli dawka toksyczna lub niepewna.'};
 if(h>24)return{ok:true,usable:false,lvl:'orange',txt:'Czas >24 h – poza zakresem nomogramu: decyzja wg ALT/AST, INR, objawów i wykrywalnego stężenia; NAC przy cechach hepatotoksyczności (BPC 2026).'};
 var ug=unit==='umol'?umolToUg(c):c;if(!(ug>=0&&ug<=3000))return{ok:false,msg:'Stężenie poza realnym zakresem – brak wyniku.'};
 var line=nomLine(h),high=nomHigh(h);var risk=i.risk===true;var rline=risk?line/2:NaN;
 var above=ug>=line,hi=ug>=high;
 return{ok:true,usable:true,ug:ug,umol:ugToUmol(ug),hours:h,line:line,lineUmol:ugToUmol(line),high:high,above:above,hiRisk:hi,riskLine:rline,aboveRisk:risk?ug>=rline:undefined,
  lvl:above?'red':'ok',
  txt:above?'POWYŻEJ linii leczenia ('+r1(line)+' µg/ml w '+h+' h) → NAC wskazany / kontynuuj.':'PONIŻEJ linii leczenia ('+r1(line)+' µg/ml w '+h+' h) – NAC z samego nomogramu nie jest wskazany, jeśli czas i dawka są wiarygodne i jednorazowe.',
  caveats:above?[]:['Przy wątpliwości co do czasu, współspożyciu opioidów / leków antycholinergicznych, preparatach o zmodyfikowanym uwalnianiu: stężenie >10 µg/ml, ale poniżej linii → powtórz za 4–6 h (Dart 2023).','NAC mimo wyniku poniżej linii, gdy ALT/AST ponad normę lub czas niepewny (BPC 2026, Dart 2023).'],
  highTxt:hi?'Powyżej linii wysokiego ryzyka (300 µg/ml w 4 h, Dart 2023) – skontaktuj się z ośrodkiem toksykologicznym; modyfikacja schematu NAC: '+DEC+'.':'',
  riskTxt:risk?'Czynniki ryzyka (niedożywienie, alkohol przewlekły, leki indukujące CYP, choroba wątroby): niższa linia 75 µg/ml w 4 h wg BPC 2026 (ChPL: leczyć wcześniej i przy niższym stężeniu) – '+DEC+'.':''};}

// SVG nomogramu Rumack–Matthew (półlogarytmiczny): oś X 4–24 h, oś Y stężenie w µg/ml (lub µmol/l). res = wynik nomogram(); bez punktu, gdy nieinterpretowalny.
function nomogramSvg(res,unit){unit=unit==='umol'?'umol':'ug';var W=520,H=330,L=62,R=14,T=14,B=46,pw=W-L-R,ph=H-T-B;var lo=1,hi=1000;
 function X(h){return L+(h-4)/20*pw;}function Y(ug){var v=Math.min(hi,Math.max(lo,ug));return T+ph-(Math.log(v/lo)/Math.log(hi/lo))*ph;}
 var f=unit==='umol'?UMOL:1;var ticks=unit==='umol'?[10,20,50,100,200,500,1000,2000,5000]:[1,2,5,10,20,50,100,200,500,1000];
 var o=['<svg class="cnom" viewBox="0 0 '+W+' '+H+'" role="img" aria-label="Nomogram Rumack–Matthew: linia leczenia 150 µg/ml w 4 h, spadek z okresem półtrwania 4 h" xmlns="http://www.w3.org/2000/svg">','<rect x="0" y="0" width="'+W+'" height="'+H+'" fill="#fff"/>'];
 ticks.forEach(function(t){var y=Y(t/f);o.push('<line x1="'+L+'" y1="'+r1(y)+'" x2="'+(W-R)+'" y2="'+r1(y)+'" stroke="#dde" stroke-width="1"/><text x="'+(L-6)+'" y="'+r1(y+4)+'" font-size="11" text-anchor="end" fill="#333">'+t+'</text>');});
 for(var h=4;h<=24;h+=2){o.push('<line x1="'+r1(X(h))+'" y1="'+T+'" x2="'+r1(X(h))+'" y2="'+(T+ph)+'" stroke="#eef" stroke-width="1"/><text x="'+r1(X(h))+'" y="'+(T+ph+15)+'" font-size="11" text-anchor="middle" fill="#333">'+h+'</text>');}
 o.push('<rect x="'+L+'" y="'+T+'" width="'+pw+'" height="'+ph+'" fill="none" stroke="#333"/>');
 // obszar powyżej linii leczenia (lekko czerwony)
 var pts=[],ptsH=[];for(var t=4;t<=24;t+=0.5){pts.push(r1(X(t))+','+r1(Y(nomLine(t))));ptsH.push(r1(X(t))+','+r1(Y(nomHigh(t))));}
 o.push('<polygon points="'+L+','+T+' '+(W-R)+','+T+' '+pts.slice().reverse().join(' ')+'" fill="#ffe3e6" opacity=".55"/>');
 o.push('<polyline points="'+pts.join(' ')+'" fill="none" stroke="#c4001a" stroke-width="2.5"/>');
 o.push('<polyline points="'+ptsH.join(' ')+'" fill="none" stroke="#7a0010" stroke-width="1.5" stroke-dasharray="5 4"/>');
 if(res&&res.risk){}
 o.push('<text x="'+(W-R-6)+'" y="'+r1(Y(nomLine(19))+16)+'" font-size="11" text-anchor="end" fill="#c4001a" font-weight="700">linia leczenia: 150 µg/ml w 4 h (T½ 4 h)</text>');
 o.push('<text x="'+(W-R-6)+'" y="'+r1(Y(nomHigh(19))-8)+'" font-size="10" text-anchor="end" fill="#7a0010">linia wysokiego ryzyka: 300 µg/ml w 4 h</text>');
 o.push('<text x="'+r1(L+pw/2)+'" y="'+(H-6)+'" font-size="12" text-anchor="middle" fill="#222">godziny od spożycia</text>');
 o.push('<text transform="translate(13 '+r1(T+ph/2)+') rotate(-90)" font-size="12" text-anchor="middle" fill="#222">paracetamol ('+(unit==='umol'?'µmol/l':'µg/ml = mg/l')+')</text>');
 if(res&&res.ok&&res.usable){var ux=X(res.hours),uy=Y(res.ug);var col=res.above?'#c4001a':'#157a2b';o.push('<circle cx="'+r1(ux)+'" cy="'+r1(uy)+'" r="7" fill="'+col+'" stroke="#000" stroke-width="2"/><text x="'+r1(ux<W-110?ux+11:ux-11)+'" y="'+r1(uy-9)+'" font-size="12" font-weight="700" text-anchor="'+(ux<W-110?'start':'end')+'" fill="'+col+'">'+(unit==='umol'?r1(res.umol)+' µmol/l':r1(res.ug)+' µg/ml')+' / '+res.hours+' h – '+(res.above?'POWYŻEJ':'poniżej')+' linii</text>');}
 o.push('</svg>');return o.join('');}
function urgentNac(i){i=i||{};var w=num(i.w),mg=num(i.mg),h=num(i.hours);var why=[];
 if(i.timeUnknown===true)why.push('nieznany lub niewiarygodny czas spożycia');if(i.staggered===true)why.push('spożycie wielokrotne / rozłożone w czasie');
 if(nz(h)&&h>8)why.push('>8 h od spożycia');
 var mgkg=nz(mg)&&nz(w)?mg/w:NaN;if(nz(mgkg)&&mgkg>=150)why.push('dawka ≥150 mg/kg ('+r1(mgkg)+' mg/kg)');if(nz(mg)&&mg>=10000)why.push('dawka ≥10 g');if(nz(mgkg)&&mgkg>=200)why.push('dawka >200 mg/kg');
 if(i.doseUnknown===true)why.push('dawka nieznana / niepewna');if(i.risk===true)why.push('czynniki ryzyka hepatotoksyczności (próg 75 mg/kg wg BPC 2026)');
 if(i.hepatic===true)why.push('podwyższone ALT/AST lub cechy uszkodzenia wątroby');
 var data=nz(h)||nz(mg)||i.timeUnknown===true||i.staggered===true||i.doseUnknown===true;
 if(!data)return{ok:false,msg:'Podaj czas, dawkę lub zaznacz niepewność – brak wyniku.'};
 if(nz(mgkg)&&mgkg<0)return{ok:false,msg:'Ujemna dawka – brak wyniku.'};
 if(nz(mg)&&(mg<0||mg>200000))return{ok:false,msg:'Dawka poza realnym zakresem – brak wyniku.'};
 if(nz(h)&&(h<0||h>24*30))return{ok:false,msg:'Czas poza realnym zakresem – brak wyniku.'};
 var now=why.length>0;
 return{ok:true,now:now,why:why,mgkg:mgkg,txt:now?'ZAKŁADAJ DAWKĘ TOKSYCZNĄ – NAC OD RAZU, nie czekaj na wynik stężenia ('+why.join('; ')+'). Pobierz krew (stężenie, ALT/AST, INR…) równolegle.':'Dawka poniżej progu i czas wiarygodny (jednorazowe, ≤8 h): stężenie paracetamolu ≥4 h od spożycia → nomogram; NAC tylko gdy powyżej linii (lub wg '+DEC+').'};}
var NAC_CAP=110;
function nacPlan(i){i=i||{};var w=num(i.w);if(!(w>=3&&w<=350))return{ok:false,msg:nz(w)?'Masa poza zakresem 3–350 kg – brak wyniku.':'Podaj masę ciała (pasek pacjenta) – brak wyniku.'};
 var t1=num(i.t1);t1=nz(t1)?t1:60;if(!(t1>=15&&t1<=60))return{ok:false,msg:'Czas 1. wlewu poza zakresem 15–60 min.'};
 var wc=Math.min(w,NAC_CAP);var capped=w>NAC_CAP;
 var vol=w>=40?[200,500,1000]:w>=20?[100,250,500]:null;
 var defs=[[150,t1/60,'1. worek (nasycenie)'],[50,4,'2. worek'],[100,16,'3. worek']];
 var bags=defs.map(function(d,k){var mg=d[0]*wc;var o={n:d[2],mgkg:d[0],mg:Math.round(mg),conc:r1(mg/100),h:d[1]};if(vol){o.vol=vol[k];o.mlh=r1(vol[k]/d[1]);}return o;});
 var o={ok:true,w:w,wc:wc,capped:capped,bags:bags,total:Math.round(300*wc),t1:t1,
  warnings:[],decisions:[],src:[SRC.nacchpl,SRC.dart23,SRC.bpc26]};
 if(capped)o.warnings.push('Masa >'+NAC_CAP+' kg – dawki liczono dla '+NAC_CAP+' kg (BPC 2026; Dart 2023 podaje 100 kg – rozbieżność, '+DEC+').');
 if(!vol)o.decisions.push('Masa <20 kg: ChPL – objętości wlewów ustala lekarz prowadzący ('+DEC+'); ryzyko hiponatremii i drgawek przy nadmiarze płynu.');
 else if(w<40)o.warnings.push('Masa 20–40 kg: objętości wg tabeli ChPL dla dzieci ≥20 kg (100 / 250 / 500 ml); ostrożność – hiperwolemia, hiponatremia, drgawki (ChPL).');
 o.decisions.push('Czas 1. wlewu: ChPL Acetylcysteine SANDOZ – 15 min; Dart 2023 – co najmniej 60 min przy dawce 150 mg/kg; BPC 2026 – 15–60 min. Pokazano '+t1+' min (domyślnie 60 min) – '+DEC+'.');
 o.decisions.push('Niewydolność nerek: ChPL nie podaje korekty dawki – ogranicz objętość płynu zgodnie z bilansem – '+DEC+'.');
 o.decisions.push('Preparat: roztwór 100 mg/ml (ChPL Acetylcysteine SANDOZ) – potwierdź preparat dostępny w szpitalu ('+DEC+').');
 o.duration='Łącznie 300 mg/kg w ok. 20 h (ChPL: 15 min + 4 h + 16 h). Dart 2023: NAC do spełnienia kryteriów zakończenia, nie na sztywno 20–21 h.';
 o.alt='Alternatywa (BPC 2026, protokół SNAP 12 h, UK): 100 mg/kg w 200 ml / 2 h, następnie 200 mg/kg w 1000 ml / 10 h; kontrola krwi 2 h przed końcem 2. wlewu; oryginał MHRA 2012 nie został w tej sesji otwarty – '+DEC+'.';
 if(wc){o.altBags=[{mg:Math.round(100*wc),vol:200,h:2,mlh:100},{mg:Math.round(200*wc),vol:1000,h:10,mlh:100}];}
 return o;}
var PARA_MONITOR=['Stężenie paracetamolu (≥4 h od spożycia), AST/ALT, INR, kreatynina, glukoza, równowaga kwasowo-zasadowa (pH), mleczany (BPC 2026).','NAC może wydłużać czas protrombinowy (ChPL) – interpretuj INR z tą uwagą.','OIT: objawy ostrej niewydolności wątroby – INR i ALT >10× górna granica normy (BPC 2026); transfer wg kryteriów King’s College poniżej.'];
var PARA_STOP={dart:'Kryteria zakończenia NAC (Dart 2023, wg wyszukiwania; Fig. 3): paracetamol <10 µg/ml ORAZ INR <2,0 ORAZ ALT/AST prawidłowe lub spadek o 25–50% od szczytu ORAZ pacjent klinicznie dobry. Nie przerywaj automatycznie po 20–21 h.',bpc:'BPC 2026: STOP gdy paracetamol niewykrywalny, INR ≤1,3, ALT w normie i ALT ≤200% wartości początkowej; w przeciwnym razie kolejna infuzja 200 mg/kg / 10 h.',note:'Dart (INR <2,0) i BPC (INR ≤1,3) różnią się – '+DEC+'.'};
var KINGS=['pH <7,3','encefalopatia ≥2 stopnia + kreatynina >3,4 mg/dl (300 µmol/l) + INR >6,5','mleczany >3,5 mmol/l przy przyjęciu lub >3,0 mmol/l po 24 h (BPC 2026)'];
// ============================================================ GI – dostępność endoskopii ============================================================
var ENDO={open:8,close:15,tz:'Europe/Warsaw'};
function warsawParts(d){var p=new Intl.DateTimeFormat('en-GB',{timeZone:ENDO.tz,weekday:'short',hour:'2-digit',minute:'2-digit',hour12:false,year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(d);var o={};p.forEach(function(x){o[x.type]=x.value;});return{wd:o.weekday,h:+o.hour%24,m:+o.minute,y:+o.year,mo:+o.month,d:+o.day};}
function endoStatus(date){var d=date instanceof Date?date:new Date(date);if(isNaN(d.getTime()))return{ok:false,msg:'Nieprawidłowa data.'};var p=warsawParts(d);var weekend=p.wd==='Sat'||p.wd==='Sun';var mins=p.h*60+p.m;
 var inside=!weekend&&mins>=ENDO.open*60&&mins<ENDO.close*60;
 return{ok:true,inside:inside,weekend:weekend,wd:p.wd,time:('0'+p.h).slice(-2)+':'+('0'+p.m).slice(-2),txt:inside?'Pracownia endoskopii czynna (8:00–15:00) – '+DEC+': potwierdź telefonicznie (święta nie są uwzględnione).':'Poza godzinami pracowni endoskopii (8:00–15:00, pn–pt; brak dyżuru) – rozważ transfer / konsultację – '+DEC+'. Święta nie są uwzględnione.'};}
function hoursToNextOpen(date){var d0=date instanceof Date?date:new Date(date);if(isNaN(d0.getTime()))return NaN;for(var k=0;k<=24*14*60;k+=1){var t=new Date(d0.getTime()+k*60000);var s=endoStatus(t);if(s.inside)return k/60;}return NaN;}
function giEndoPlan(i){i=i||{};var when=i.when?new Date(i.when):new Date();if(isNaN(when.getTime()))return{ok:false,msg:'Nieprawidłowy czas.'};
 var st=endoStatus(when);var wait=hoursToNextOpen(when);var out={ok:true,status:st,waitH:wait,items:[],src:[SRC.esge21,SRC.esgev22]};
 var variceal=i.variceal===true,unstable=i.unstable===true;
 if(variceal){out.items.push({lvl:'red',t:'Podejrzenie krwawienia z żylaków: endoskopia w ciągu 12 h od zgłoszenia, PO resuscytacji hemodynamicznej (ESGE 2022). Przed endoskopią: terlipresyna, antybiotyk, PPI (zakładka „Leczenie”).'});
  var fit=st.inside||wait<=12;out.items.push({lvl:fit?'orange':'red',t:fit?'Najbliższe okno pracowni mieści się w 12 h ('+(st.inside?'pracownia czynna teraz':'za ok. '+r1(wait)+' h')+') – '+DEC+'.':'Najbliższe okno pracowni za ok. '+r1(wait)+' h – PONAD 12 h: rozważyć transfer / konsultację do ośrodka z całodobową endoskopią – '+DEC+'.'});}
 else if(unstable){out.items.push({lvl:'red',t:'Niestabilne krwawienie: najpierw resuscytacja (ESGE 2021: endoskopia po stabilizacji hemodynamicznej; endoskopia ≤6 h nie jest zalecana – gorsze wyniki, zwłaszcza u chorych niestabilnych lub z dużym ryzykiem anestezjologicznym). Brak ustalonego w źródłach okna, gdy krwawienie trwa mimo resuscytacji (endoskopia / radiologia zabiegowa / chirurgia) – '+DEC+'.'});
  out.items.push({lvl:st.inside?'orange':'red',t:st.inside?'Pracownia czynna – konsultacja endoskopisty po stabilizacji – '+DEC+'.':'POZA godzinami pracowni – rozważyć transfer / konsultację do ośrodka z całodobową endoskopią i chirurgią – '+DEC+'.'});}
 else{out.items.push({lvl:'ok',t:'Krwawienie niezależne od żylaków, stabilne po resuscytacji: endoskopia w ciągu 24 h od zgłoszenia, po resuscytacji (ESGE 2021, silna rekomendacja, wysoka jakość); pilna ≤12 h nie jest zalecana (wyniki nie lepsze).'});
  var ok24=st.inside||wait<=24;out.items.push({lvl:ok24?'ok':'orange',t:ok24?'Najbliższe okno pracowni ('+(st.inside?'teraz':'za ok. '+r1(wait)+' h')+') mieści się w 24 h – '+DEC+'.':'Najbliższe okno pracowni za ok. '+r1(wait)+' h – PONAD 24 h od zgłoszenia: poza godzinami pracowni – rozważyć transfer / konsultację – '+DEC+'.'});}
 return out;}
return{DEC:DEC,SRC:SRC,SYMP:SYMP,redLight:redLight,ctBeforeLP:ctBeforeLP,lpContra:lpContra,TUBES:TUBES,CSF_NOTES:CSF_NOTES,csfInterp:csfInterp,neuroTreat:neuroTreat,PROPH:PROPH,PROPH_NOTE:PROPH_NOTE,transferNeuro:transferNeuro,
 cvEligibility:cvEligibility,postCv:postCv,ecPlan:ecPlan,sedationPlan:sedationPlan,propafenonePIP:propafenonePIP,PIP_CONTRA:PIP_CONTRA,amiodarone:amiodarone,flecainideIv:flecainideIv,antazoline:antazoline,pharmaScreen:pharmaScreen,
 UMOL:UMOL,ugToUmol:ugToUmol,umolToUg:umolToUg,nomLine:nomLine,nomHigh:nomHigh,nomogram:nomogram,nomogramSvg:nomogramSvg,urgentNac:urgentNac,nacPlan:nacPlan,NAC_CAP:NAC_CAP,PARA_MONITOR:PARA_MONITOR,PARA_STOP:PARA_STOP,KINGS:KINGS,
 endoStatus:endoStatus,hoursToNextOpen:hoursToNextOpen,giEndoPlan:giEndoPlan,VERSION:'C-2026-10-23'};});
