(function(r,f){var m=f();if(typeof module==='object'&&module.exports)module.exports=m;else{r.SK=r.SK||{};r.SK.acoagB1=m;}})(this,function(){
// ETAP B1 – Antykoagulacja: alteplaza (Actilyse) w STEMI / udarze niedokrwiennym / zatorowości płucnej + protamina z czasem od heparyny.
// Dawki liczone z masy. Brak masy / puste / nierealne dane → null (brak wyniku). Przeciwwskazania bezwzględne ukrywają dawkę.
var SRC={
 SMPC:'ChPL / SmPC Actilyse (alteplaza) 10/20/50 mg – eMC 898, rewizja 04/2026 (dawkowanie AMI, ZP, udar; przeciwwskazania; RR; zalecenia po leczeniu)',
 ESCACS:'ESC 2023 – Guidelines for the management of acute coronary syndromes (Eur Heart J 44:3720): fibrynoliza, gdy PPCI niemożliwe w ≤120 min od rozpoznania; lek w ≤10 min od rozpoznania; objawy ≤12 h',
 ESCSTEMI:'ESC 2017 – STEMI (Ibanez, Eur Heart J 39:119): dawki leków przeciwpłytkowych i przeciwzakrzepowych przy fibrynolizie; przeciwwskazania',
 ESCPE:'ESC 2019 – ostra zatorowość płucna (Konstantinides, Eur Heart J 41:543): tromboliza, tab. schematów, przeciwwskazania',
 AHAAIS:'AHA/ASA 2019 – Early Management of Acute Ischemic Stroke (Powers, Stroke 50:e344) oraz ESO 2021 – IV trombolityczne: okno 4,5 h, RR <185/110 przed i <180/105 po, glikemia, INR ≤1,7 (ChPL Actilyse: INR ≤1,3 u chorych na VKA), PLT ≥100 tys.',
 ERC:'ERC 2021 – szczególne okoliczności: zatrzymanie krążenia z powodu ZP (dawka nieokreślona)',
 PROT:'Protamina: ChPL siarczan protaminy; ACC 2020 ECDP; tabela czasowa dawki wg czasu od heparyny (np. CHU Québec, BC EHS, ClinCalc – 1 mg/100 j. <30 min; 0,5–0,75 mg 30–60 min; 0,375–0,5 mg 60–120 min; 0,25–0,375 mg >120 min), maks. 50 mg/dawkę',
 CLX:'ChPL Clexane (enoksaparyna): protamina 1 mg/1 mg enoksaparyny w ≤8 h, 0,5 mg/1 mg po >8 h (lub 2. dawka), po >12 h zwykle zbędna'};
function nz(x){return typeof x==='number'&&isFinite(x);}
function rd(x,d){var p=Math.pow(10,d==null?1:d);return Math.round(x*p)/p;}
// ---------- listy przeciwwskazań (klikane) ----------
var CI={
 stemi:{abs:[['ich','przebyty udar krwotoczny lub udar o nieznanej przyczynie (kiedykolwiek)'],['isch6','udar niedokrwienny w ostatnich 6 mies.'],['cns','uszkodzenie OUN, guz lub malformacja tętniczo-żylna mózgu'],['trauma','duży uraz / operacja / uraz głowy w ostatnim miesiącu'],['gi','krwawienie z p. pokarmowego w ostatnim miesiącu'],['bleeddx','znana skaza krwotoczna (poza miesiączką)'],['dissect','rozwarstwienie aorty'],['puncture','nakłucie niezaciskalnego naczynia / biopsja (np. wątroby, punkcja lędźwiowa) w ostatnich 24 h'],['smpc','inne przeciwwskazanie z ChPL Actilyse: ciężka choroba wątroby/żylaki przełyku, ostre zapalenie trzustki, infekcyjne zapalenie wsierdzia/osierdzia, tętniak, poród <10 dni, skutecznie leczony VKA (INR >1,3), duża operacja/uraz <3 mies.']],
  rel:[['tia6','TIA w ostatnich 6 mies.'],['oac','doustne leczenie przeciwkrzepliwe'],['preg','ciąża lub pierwszy tydzień po porodzie'],['htn','oporne nadciśnienie (SBP >180 i/lub DBP >110)'],['liver','zaawansowana choroba wątroby'],['endo','infekcyjne zapalenie wsierdzia'],['ulcer','czynna choroba wrzodowa'],['cpr','długotrwała lub urazowa resuscytacja']]},
 pe:{abs:[['ich','przebyty udar krwotoczny lub udar o nieznanej przyczynie (kiedykolwiek)'],['isch6','udar niedokrwienny w ostatnich 6 mies.'],['cns','nowotwór OUN'],['trauma','duży uraz / operacja / uraz głowy w ostatnich 3 tyg.'],['bleeddx','skaza krwotoczna'],['active','czynne krwawienie'],['smpc','inne przeciwwskazanie z ChPL: ciężka choroba wątroby, ostre zapalenie trzustki, wsierdzie, tętniak, nowotwór z ryzykiem krwawienia, poród <10 dni, VKA z INR >1,3']],
  rel:[['tia6','TIA w ostatnich 6 mies.'],['oac','doustne leczenie przeciwkrzepliwe'],['preg','ciąża lub pierwszy tydzień po porodzie'],['puncture','nakłucie niezaciskalnego naczynia'],['cpr','urazowa resuscytacja'],['htn','oporne nadciśnienie (SBP >180)'],['liver','zaawansowana choroba wątroby'],['endo','infekcyjne zapalenie wsierdzia'],['ulcer','czynna choroba wrzodowa']]},
 stroke:{abs:[['ich','krwawienie śródczaszkowe w TK lub w wywiadzie / podejrzenie krwotoku'],['sah','objawy sugerujące krwotok podpajęczynówkowy (nawet przy prawidłowym TK)'],['stroke3','udar w ostatnich 3 miesiącach'],['strokedm','przebyty udar i współistniejąca cukrzyca (ChPL)'],['minor','niewielki lub szybko ustępujący deficyt (nieupośledzający)'],['nihss25','ciężki udar (NIHSS >25) lub rozległy zawał w TK'],['seizonset','drgawki w początkowej fazie udaru (ChPL Actilyse, p. 4.3 – przeciwwskazanie; AHA/ESO nie traktują tego jako bezwzględnego, gdy deficyt wynika z udaru, a ChPL Metalyse dopuszcza po wykluczeniu mimiku – DO DECYZJI LEKARZA / konsultacja neurologa)'],['hep48','heparyna w ostatnich 48 h z wydłużonym APTT'],['doac','NOAC w ostatnich 48 h (bez prawidłowych testów)'],['bleed','czynne/niedawne ciężkie krwawienie, skaza krwotoczna, krwawienie z p. pokarmowego'],['cnsdam','uszkodzenie OUN (nowotwór, tętniak, operacja wewnątrzczaszkowa/rdzeniowa)'],['endo','infekcyjne zapalenie wsierdzia, rozwarstwienie aorty'],['surg','duża operacja / uraz w ostatnich 3 mies., ciężka choroba wątroby, ostre zapalenie trzustki'],['under16','wiek <16 lat']],
  rel:[['age80','wiek >80 lat (indywidualna ocena korzyści)'],['preg','ciąża / połóg'],['dm','niewyrównana cukrzyca'],['mi','zawał <3 mies.']]}};
function ci(kind,v){var C=CI[kind];if(!C)return null;v=v||{};var a=C.abs.filter(function(c){return v[c[0]]}).map(function(c){return c[1]}),r=C.rel.filter(function(c){return v[c[0]]}).map(function(c){return c[1]});return{abs:a,rel:r,lvl:a.length?'red':r.length?'orange':'ok'};}
// ---------- STEMI ----------
// i: w, age, hours (od początku objawów), delayMin (czas od rozpoznania w EKG do przewidywanego PPCI), sbp, crcl, v (przeciwwskazania)
function stemi(i){var o={lvl:'ok',warn:[]};var c=ci('stemi',i.v);o.ci=c;
 if(!nz(i.hours)||i.hours<0||i.hours>72){return null;}
 if(!nz(i.delayMin)||i.delayMin<0||i.delayMin>1440)return null;
 o.hours=i.hours;o.delay=i.delayMin;
 if(i.hours>12){o.decision='outside';o.lvl='orange';o.txt='Objawy >12 h: fibrynoliza poza oknem (ESC 2023; Actilyse – schemat do 12 h). Strategia inwazyjna wg ESC (PCI przy trwającym niedokrwieniu / niestabilności). Kontakt z ośrodkiem PCI.';return o;}
 if(i.delayMin<=120){o.decision='pci';o.lvl='ok';o.txt='PPCI możliwa w ≤120 min od rozpoznania → transport na PPCI, BEZ fibrynolizy (ESC 2023). Cel: przewodnik przez zmianę ≤90 min od rozpoznania.';return o;}
 if(c.abs.length){o.decision='transfer';o.lvl='red';o.txt='Czas do PCI >120 min, ALE przeciwwskazanie bezwzględne do fibrynolizy → natychmiastowy transport na PCI mimo opóźnienia, bez fibrynolizy.';return o;}
 o.decision='lysis';o.lvl=c.rel.length?'orange':'ok';
 o.txt='Czas do PCI >120 min, objawy ≤12 h, brak przeciwwskazań bezwzględnych → fibrynoliza w ≤10 min od rozpoznania (ESC 2023), następnie natychmiastowy transport do ośrodka PCI.';
 if(!(i.w>0))return o;
 var w=i.w,reg=i.hours<=6?'acc':'h3',ph=[];
 if(reg==='acc'){ // 90-min (ChPL)
  if(w>=65)ph=[{l:'bolus i.v.',mg:15,min:0},{l:'wlew 0–30 min',mg:50,min:30},{l:'wlew 30–90 min',mg:35,min:60}];
  else ph=[{l:'bolus i.v.',mg:15,min:0},{l:'wlew 0–30 min (0,75 mg/kg)',mg:rd(0.75*w,1),min:30},{l:'wlew 30–90 min (0,5 mg/kg)',mg:rd(0.5*w,1),min:60}];
  o.regimen='Schemat przyspieszony 90 min (objawy ≤6 h) – ChPL Actilyse';}
 else{
  if(w>=65)ph=[{l:'bolus i.v.',mg:10,min:0},{l:'wlew 0–60 min',mg:50,min:60},{l:'wlew 1–3 h',mg:40,min:120}];
  else ph=[{l:'bolus i.v.',mg:10,min:0},{l:'wlew 3 h (do łącznie 1,5 mg/kg)',mg:rd(1.5*w-10,1),min:180}];
  o.regimen='Schemat 3-godzinny (objawy 6–12 h) – ChPL Actilyse';}
 ph.forEach(function(p){p.mlh=p.min>0?rd(p.mg/(p.min/60),1):null;p.ml=p.mg;});
 o.phases=ph;o.total=rd(ph.reduce(function(s,p){return s+p.mg},0),1);if(o.total>100+1e-9){o.total=100;}
 o.conc=1;
 if(i.age>=75)o.warn.push('Wiek ≥75 lat: większe ryzyko krwawienia śródczaszkowego (ChPL) – ocena ryzyka/korzyści, ESC: dla tenekteplazy połowa dawki.');
 if(w<50)o.warn.push('Masa <50 kg: większe ryzyko krwawienia (ChPL).');
 if(nz(i.sbp)&&i.sbp>160)o.warn.push('SBP >160 mmHg: większe ryzyko krwawienia (ChPL), >180/110 = przeciwwskazanie względne (ESC) – obniż ciśnienie.');
 o.adj=stemiAdjunct(i);
 o.after='Po fibrynolizie: natychmiastowy transport do ośrodka PCI. Ocena ustąpienia ST po 60–90 min: <50% → ratunkowa PCI. Rutynowa koronarografia 2–24 h po skutecznej fibrynolizie. Monitor rytmu (arytmie reperfuzyjne), unikać domięśniowych iniekcji i punkcji.';
 o.alt='ESC 2023 preferuje fibrynolityk swoisty dla fibryny, w tym tenekteplazę (jednorazowy bolus wg masy: <60 kg 30 mg, 60–<70 35, 70–<80 40, 80–<90 45, ≥90 kg 50 mg; ≥75 lat połowa dawki) – dostępność i wybór preparatu: DO DECYZJI LEKARZA.';
 return o;}
// leki wspomagające przy fibrynolizie (ESC 2017/2023)
function stemiAdjunct(i){var w=i.w,age=i.age,o={};
 o.aspirin='Aspiryna 150–300 mg p.o. (alternatywnie 75–250 mg i.v.)';
 o.clopidogrel=(nz(age)&&age>75)?'Klopidogrel 75 mg p.o. (wiek >75 lat)':'Klopidogrel 300 mg p.o. (≤75 lat)';
 if(!nz(age)){o.clopidogrel='Klopidogrel 300 mg (≤75 lat) / 75 mg (>75 lat) – podaj wiek';}
 o.noP2Y12='Nie podawaj tikagreloru ani prasugrelu przed/podczas fibrynolizy.';
 var renal=nz(i.crcl)&&i.crcl<30;
 if(w>0&&nz(age)){
  if(age<75){var bolus=30,sc=Math.min(w,100);o.enox={bolus:bolus,sc:sc,interval:renal?24:12,txt:'Enoksaparyna: 30 mg i.v. bolus, po 15 min '+rd(sc,0)+' mg s.c. (1 mg/kg; maks. 100 mg w pierwszych 2 dawkach) co '+(renal?'24':'12')+' h'+(renal?' (CrCl <30: 1×/dobę)':'')+'.'};}
  else{var sc2=Math.min(0.75*w,75);o.enox={bolus:0,sc:sc2,interval:renal?24:12,txt:'Enoksaparyna (≥75 lat): bez bolusa i.v.; '+rd(sc2,1)+' mg s.c. (0,75 mg/kg; maks. 75 mg w pierwszych 2 dawkach) co '+(renal?'24':'12')+' h.'};}}
 if(w>0){var b=Math.min(60*w,4000),rt=Math.min(12*w,1000);o.ufh={bolus:b,rate:rt,mlh:rt/500,txt:'Alternatywa – UFH: bolus 60 j./kg (maks. 4000 j.) = '+rd(b,0)+' j. + wlew 12 j./kg/h (maks. 1000 j./h) = '+rd(rt,0)+' j./h ('+String(rd(rt/500,1)).replace('.',',')+' ml/h przy 500 j./ml); aPTT 50–70 s, 24–48 h.'};}
 return o;}
// ---------- UDAR ----------
// i: w, hours (od ostatniego widzenia zdrowego), sbp, dbp, gluMmol, inr, plt (tys./µl = ×10⁹/l), v (klikane)
function stroke(i){var o={lvl:'ok',warn:[],block:[]};var c=ci('stroke',i.v);o.ci=c;
 if(!nz(i.hours)||i.hours<0||i.hours>72)return null;
 o.window=i.hours<=4.5;
 if(!o.window){o.block.push('Poza oknem 4,5 h od ostatniego widzenia zdrowego (ChPL: >4,5 h niekorzystny bilans) – nie podawać wg ChPL; przy niedopasowaniu obrazowania decyzja neurologa/ośrodka udarowego.');}
 if(c.abs.length)o.block.push('Przeciwwskazanie bezwzględne: '+c.abs.join('; ')+'.');
 if(nz(i.sbp)&&i.sbp>185||nz(i.dbp)&&i.dbp>110)o.block.push('RR >185/110 mmHg – najpierw obniż ciśnienie (urapidyl / labetalol) do <185/110; do tego czasu nie podawać alteplazy.');
 if(nz(i.gluMmol)){var mg=i.gluMmol*18.016;if(mg<50)o.block.push('Glikemia <50 mg/dl (2,8 mmol/l) – wyrównaj i oceń deficyt ponownie (mimik udaru).');else if(mg>400)o.block.push('Glikemia >400 mg/dl (22,2 mmol/l) – przeciwwskazanie wg ChPL.');}
 if(nz(i.inr)&&i.inr>1.7)o.block.push('INR >1,7 – przeciwwskazanie (AHA/ESO).');
 else if(nz(i.inr)&&i.inr>1.3)o.warn.push('INR '+String(i.inr).replace('.',',')+' (>1,3): ChPL Actilyse – u chorych leczonych VKA tromboliza tylko przy INR ≤1,3 (wytyczne AHA/ESO: ≤1,7). DO DECYZJI LEKARZA – rozbieżność ChPL vs wytyczne.');
 if(nz(i.plt)&&i.plt<100)o.block.push('PLT <100 tys./µl – przeciwwskazanie.');
 var missing=[];if(!nz(i.sbp)||!nz(i.dbp))missing.push('ciśnienie');if(!nz(i.gluMmol))missing.push('glikemia');if(!nz(i.inr)&&!i.v_noAnticoag)missing.push('INR (jeśli na VKA/podejrzenie koagulopatii)');
 o.missing=missing;
 if(o.block.length){o.lvl='red';o.decision='blocked';}
 else o.decision='eligible';
 if((c.rel.length||o.warn.length)&&o.lvl==='ok')o.lvl='orange';
 if(o.decision==='eligible'&&i.w>0){var tot=Math.min(0.9*i.w,90),bol=tot*0.1,inf=tot-bol;o.dose={total:rd(tot,1),bolus:rd(bol,1),infusion:rd(inf,1),mlh:rd(inf,1),capped:0.9*i.w>90,conc:1,txt:'0,9 mg/kg, maks. 90 mg: 10% w bolusie (1 min), reszta w 60 min'};}
 o.post='Po podaniu: RR <180/105 mmHg przez 24 h; kontrola RR i stanu neurologicznego co 15 min przez 2 h, co 30 min przez 6 h, potem co 1 h do 24 h (AHA/ASA 2019). Przez 24 h bez leków przeciwpłytkowych/przeciwkrzepliwych i bez sondy/cewnika bez wyraźnej potrzeby. Przy bólu głowy, wymiotach, pogorszeniu neurologicznym lub gwałtownym wzroście RR: przerwij wlew, pilne TK, wynik → leczenie krwotoku. Obserwuj obrzęk naczynioruchowy (szczególnie przy ACE-I).';
 o.refer='Konsultacja neurologa / telekonsultacja; ocena zamknięcia dużego naczynia (LVO) i transfer do ośrodka z trombektomią – wg lokalnego schematu (DO DECYZJI). Nie opóźniaj trombolizy na czas transportu, jeśli kwalifikuje się w ośrodku.';
 return o;}
// ---------- ZATOROWOŚĆ PŁUCNA ----------
// i: w, high(bool – wysokie ryzyko/niestabilność), rescue(bool – ratunkowa przy pogorszeniu), cpr(bool), v
function pe(i){var o={lvl:'ok',warn:[],block:[]};var c=ci('pe',i.v);o.ci=c;
 if(!(i.w>0))return null;
 if(!i.high&&!i.rescue&&!i.cpr){o.decision='noind';o.lvl='orange';o.txt='Brak wskazania: tromboliza tylko w ZP wysokiego ryzyka (niestabilność hemodynamiczna) lub jako ratunkowa przy pogorszeniu na leczeniu przeciwkrzepliwym (ESC 2019).';return o;}
 if(c.abs.length&&!i.cpr){o.decision='blocked';o.lvl='red';o.block.push('Przeciwwskazania bezwzględne: '+c.abs.join('; ')+'. W ZP zagrażającej życiu mogą stać się względne – decyzja zespołu (PERT/kardiolog); rozważ embolektomię chirurgiczną / leczenie przezskórne.');return o;}
 o.decision='eligible';o.lvl=(c.abs.length||c.rel.length)?'orange':'ok';
 if(c.abs.length)o.warn.push('Przeciwwskazania bezwzględne przy ZP zagrażającej życiu/NZK: decyzja lekarza prowadzącego – '+c.abs.join('; ')+'.');
 var w=i.w,total=w<65?1.5*w:100;total=Math.min(total,100);
 o.std={total:rd(total,1),bolus:10,infusion:rd(total-10,1),mlh:rd((total-10)/2,1),minutes:120,lowW:w<65,txt:'Standard (ChPL/ESC): 10 mg bolus w 1–2 min + '+rd(total-10,1)+' mg w 2 h (łącznie '+rd(total,1)+' mg'+(w<65?', <65 kg: maks. 1,5 mg/kg':'')+')'};
 var acc=Math.min(0.6*w,50);
 o.acc={total:rd(acc,1),minutes:15,mlh:rd(acc/0.25,0),capped:0.6*w>50,txt:'Przyspieszony (ESC 2019, tab. schematów): 0,6 mg/kg w 15 min, maks. 50 mg = '+rd(acc,1)+' mg w 15 min'};
 o.accNote='Schemat przyspieszony jest wymieniony w ESC 2019 jako opcja, ale NIE jest rejestracyjny w ChPL Actilyse (ChPL: 100 mg/2 h); dowody ograniczone – stosowany przy zagrożeniu życia / NZK; DO DECYZJI LEKARZA.';
 if(i.cpr){o.cpr={mg:50,txt:'NZK z powodu ZP: w literaturze alteplaza 50 mg i.v. w bolusie (1–2 min), powtórzenie 50 mg po 15 min przy braku ROSC; po podaniu kontynuuj RKO 60–90 min (ERC 2021). Dawka NIE jest ustalona w ERC 2021 – poziom dowodów niski (serie przypadków), DO DECYZJI LEKARZA.'};}
 o.heparin='Heparyna: po zakończeniu alteplazy wznów/rozpocznij UFH, gdy aPTT <2× górna granica normy (ChPL), cel aPTT 50–70 s. Nie mieszaj alteplazy z heparyną w jednym zestawie.';
 return o;}
// ---------- PROTAMINA ----------
var UFH_BRACKETS=[{max:30,lo:1,hi:1},{max:60,lo:0.5,hi:0.75},{max:120,lo:0.375,hi:0.5},{max:Infinity,lo:0.25,hi:0.375}];
function bracket(minAgo){return UFH_BRACKETS.find(function(b){return minAgo<b.max});}
// UFH: bolus {u, minAgo} i/lub wlew {rateUh, runningH (ile godz. trwał wlew), stoppedMinAgo (0 = nadal trwa)}
function protUfh(i){var o={lo:0,hi:0,units:0,parts:[]};var any=false;
 if(nz(i.bolusU)&&i.bolusU>0&&nz(i.bolusMinAgo)&&i.bolusMinAgo>=0){var b=bracket(i.bolusMinAgo);any=true;o.parts.push({t:'bolus '+Math.round(i.bolusU)+' j. ('+Math.round(i.bolusMinAgo)+' min temu)',lo:i.bolusU/100*b.lo,hi:i.bolusU/100*b.hi});o.units+=i.bolusU;}
 if(nz(i.rateUh)&&i.rateUh>0&&nz(i.runningH)&&i.runningH>0){var st=nz(i.stoppedMinAgo)&&i.stoppedMinAgo>0?i.stoppedMinAgo/60:0;var inWin=Math.max(0,Math.min(i.runningH,2-st));
  if(inWin>0){var u=i.rateUh*inWin;any=true;o.parts.push({t:'wlew '+Math.round(i.rateUh)+' j./h – '+rd(inWin,1)+' h w oknie 2 h = '+Math.round(u)+' j.',lo:u/100,hi:u/100});o.units+=u;}
  else{o.parts.push({t:'wlew zakończony >2 h temu – nie uwzględniono (okres półtrwania UFH ≈ 60–90 min)',lo:0,hi:0});any=true;}}
 if(!any)return null;
 o.lo=o.parts.reduce(function(s,p){return s+p.lo},0);o.hi=o.parts.reduce(function(s,p){return s+p.hi},0);
 o.cap=o.hi>50;o.loC=Math.min(o.lo,50);o.hiC=Math.min(o.hi,50);o.mlLo=o.loC/10;o.mlHi=o.hiC/10;
 o.txt='Protamina '+rd(o.loC,0)+(Math.abs(o.hiC-o.loC)>0.5?'–'+rd(o.hiC,0):'')+' mg i.v. powoli (≥10 min, ≤5 mg/min), maks. 50 mg na dawkę; kontrola aPTT/ACT po 5–15 min, ewentualne uzupełnienie do łącznie 50 mg tylko wg kontroli.';return o;}
// enoksaparyna / HDCz
function protEnox(i){if(!(nz(i.mg)&&i.mg>0)||!nz(i.hours)||i.hours<0)return null;var f,txt;
 if(i.hours<=8){f=1;txt='≤8 h od dawki: 1 mg protaminy na 1 mg enoksaparyny';}
 else if(i.hours<=12){f=0.5;txt='>8–12 h od dawki: 0,5 mg protaminy na 1 mg enoksaparyny';}
 else{return{mg:0,f:0,none:true,txt:'>12 h od dawki enoksaparyny: protamina zwykle zbędna (ChPL Clexane); decyzja wg krwawienia i CrCl.'};}
 var mg=i.mg*f,cap=mg>50;return{mg:Math.min(mg,50),f:f,cap:cap,ml:Math.min(mg,50)/10,txt:txt+(cap?' – maks. 50 mg':''),second:'Jeśli krwawienie trwa: druga dawka 0,5 mg/1 mg enoksaparyny (ChPL) – DO DECYZJI. Protamina neutralizuje anty-Xa tylko częściowo (≈60%).'};}
return{SRC:SRC,CI:CI,ci:ci,stemi:stemi,stemiAdjunct:stemiAdjunct,stroke:stroke,pe:pe,protUfh:protUfh,protEnox:protEnox,UFH_BRACKETS:UFH_BRACKETS};});
