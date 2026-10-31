// ETAP B2 – zatrucia grzybami: gatunki potencjalnie śmiertelne w Polsce, triage wg okresu utajenia, pobieranie próbek, kryteria transferu, kontakty toksykologiczne.
// Tylko gatunki z oparciem w źródłach (patrz SRC). Nie służy do identyfikacji gatunku ani do wykluczenia zatrucia.
(function(r,f){var m=f();if(typeof module==='object'&&module.exports)module.exports=m;else{r.SK=r.SK||{};r.SK.mushB2=m;}})(this,function(){
var DEC='DO DECYZJI LEKARZA';
var SRC={
 wennig:'Wennig R., Eyer F., Schaper A., Zilker T., Andresen-Streichert H.: Mushroom Poisoning. Dtsch Arztebl Int 2020;117:701–708 (tab. 1, 3a, 3b)',
 oit:'UJ CM, Pracownia Informacji Toksykologicznej i Analiz Laboratoryjnych: „Zatrucia grzybami – rady dla grzybiarzy i nie tylko” (oit.cm.uj.edu.pl; dostęp 23.10.2026)',
 gis:'Główny Inspektorat Sanitarny: „Zatrucia grzybami – objawy, pierwsza pomoc, leczenie” (gov.pl)',
 toxins26:'Dimitrova i wsp.: Toxins 2026;18(5):216 (przegląd zatruć amatoksynami; dostęp 23.10.2026)',
 charcoal24:'Przegląd systematyczny węgla aktywnego w zatruciu amatoksynami, Clin Toxicol 2024 (Taylor & Francis)',
 statpearls:'StatPearls: Amatoxin Mushroom Toxicity',
 chop:'CHOP Poison Control Center: hepatotoxic mushroom ingestion, 2016',
 su:'SU Kraków, Zakład Diagnostyki – Pracownia Toksykologiczna: cennik 2026 (amanityna w moczu ELISA CITO)',
 legalon:'Legalon SIL – informacja producenta (Niemcy; brak polskiej ChPL)'
};
var STAMP='Zweryfikowano na oficjalnych stronach: 23.10.2026';
// ---- kontakty (zweryfikowane 23.10.2026 na stronach oficjalnych) ----
var CONTACTS=[
 {id:'uj_alarm',label:'Klinika / Oddział Toksykologii, Szpital Uniwersytecki w Krakowie – telefon alarmowy (całodobowo; odbiera lekarz dyżurny)',tel:['12 411 99 99'],verified:true,date:'23.10.2026',src:'oit.cm.uj.edu.pl; su.krakow.pl',url:'https://oit.cm.uj.edu.pl/',urlLabel:'oit.cm.uj.edu.pl'},
 {id:'ryd_alarm',label:'Szpital im. L. Rydygiera, Oddz. Toksykologii i Chorób Wewnętrznych z Pododdz. Detoksykacji (os. Złotej Jesieni 1, Kraków) – „telefon na ratunek” (24 h)',tel:['12 646 85 50'],verified:true,date:'23.10.2026',src:'szpitalrydygier.pl',url:'https://www.szpitalrydygier.pl/oddzialy/oddzial-toksykologii-i-chorob-wewnetrznych-z-pododdzialem-detoksykacji/',urlLabel:'szpitalrydygier.pl – oddział',extra:'Sekretariat oddziału: 12 646 84 04. Centrala szpitala 12 646 80 00 (pon.–pt. 7–15). Osobnego numeru „dyżurki lekarskiej” na stronie nie podano – używaj numeru „na ratunek”.'},
 {id:'pit',label:'Pracownia Informacji Toksykologicznej i Analiz Laboratoryjnych UJ CM (ul. Jakubowskiego 2, Kraków) – informacja, godziny pracy',tel:['12 400 26 60'],verified:true,date:'23.10.2026',src:'oit.cm.uj.edu.pl',url:'https://oit.cm.uj.edu.pl/o-pracowni/kontakt/',urlLabel:'oit.cm.uj.edu.pl/kontakt',extra:'oit@cm-uj.krakow.pl; telefon alarmowy tej pracowni: 12 411 99 99'},
 {id:'lab',label:'Pracownia Toksykologiczna, Zakład Diagnostyki SU Kraków (ul. Jakubowskiego 2, blok C, II p.) – laboratorium (amanityna w moczu, ELISA)',tel:['12 400 36 49','12 400 36 14'],verified:true,date:'23.10.2026',src:'su.krakow.pl (cennik 2026)',url:'https://www.su.krakow.pl/',urlLabel:'su.krakow.pl',extra:'12 400 36 49 – całodobowo. labtoxuj@cm-uj.krakow.pl. Badanie dla podmiotów zewnętrznych: uzgodnij tryb/umowę przed wysyłką.'},
 {id:'ntarg_pharm',label:'Apteka szpitalna – Nowy Targ (silibinina / NAC / penicylina G – dostępność)',tel:[],verified:false,fill:'NUMER DO UZUPEŁNIENIA'},
 {id:'ntarg_sanepid',label:'PSSE Nowy Targ – grzyboznawca / klasyfikator grzybów (identyfikacja resztek)',tel:[],verified:false,fill:'NUMER DO UZUPEŁNIENIA'},
 {id:'transplant',label:'Ośrodek transplantacji wątroby (wskaże toksykolog) – kontakt dyżurny',tel:[],verified:false,fill:'NUMER DO UZUPEŁNIENIA'},
 {id:'emerg',label:'Numer alarmowy / transport',tel:['112','999'],verified:true,date:'23.10.2026',src:'GIS (gov.pl): numer alarmowy 999/112'}];
function telHref(t){var d=String(t).replace(/\D/g,'');return d.length<=3?'tel:'+d:'tel:+48'+d;}
var NT='W Nowym Targu nie ma dedykowanych odtrutek na amatoksyny (silibinina i.v. niedostępna – informacja od lekarzy SOR; potwierdź w aptece szpitalnej). Przy podejrzeniu zatrucia amatoksynami: wczesna konsultacja z ośrodkiem toksykologicznym w Krakowie i rozważenie transferu – decyzja lekarza.';
var POL='potencjalnie śmiertelny – zależne od dawki; dawka zwykle nieznana';
// ---- gatunki ----
var AMA={mech:'Amatoksyny (α-/β-amanityna): termostabilne cykliczne oktapeptydy; hamują polimerazę RNA II → zahamowanie syntezy białek (wątroba, nerki).',lat:'Okres utajenia zwykle 6–12 h (maks. ok. 24 h; OIT UJ CM: 8, 12 lub 24 h).',
 sym:'Faza żołądkowo-jelitowa (6–24 h): silny ból brzucha, wymioty, biegunka „choleryczna” → faza wątrobowa (12–48 h) z pozorną poprawą → ostra niewydolność wątroby i nerek (24–72 h): koagulopatia, encefalopatia, drgawki, obrzęk mózgu (Wennig 2020). OIT: GI 1–3 doby, „cisza”, uszkodzenie narządów od 3.–4. doby.',
 sample:'AMA',tx:'AMA'};
var SPECIES=[
 {id:'phalloides',tier:'A',pl:'Muchomor zielonawy (sromotnikowy)',latin:'Amanita phalloides',img:['phalloides-whole','phalloides-base'],syndrome:'amatoksyny',
  desc:'Kapelusz zielonkawy, oliwkowy lub bardzo jasny; białe blaszki, pierścień na trzonie, workowata pochwa u podstawy (może być pod ziemią lub urwana).',
  conf:'Mylony z czubajką kanią, gąską zielonką i surojadkami zielonymi (OIT, GIS); także z pieczarką polną, czubajką czerwieniejącą i łuskwiakiem zmiennym (Wennig 2020).',
  note:'Odpowiada za ok. 90% śmiertelnych zatruć grzybami (Wennig 2020). Gotowanie i suszenie nie zmniejszają toksyczności (OIT). Szacunek teoretyczny (nie do wykluczania zatrucia): ok. 0,1 mg/kg α-amanityny ≈ jeden dojrzały owocnik u dorosłego; u dziecka ≈ 5–10 g grzyba (Wennig 2020).',src:['wennig','oit','gis'],credit:0},
 {id:'verna',tier:'A',pl:'Muchomor wiosenny',latin:'Amanita verna',img:['verna'],syndrome:'amatoksyny',
  desc:'Biały owocnik z pierścieniem i pochwą; młode okazy bywają mylone z pieczarkami (młode owocniki praktycznie nie do odróżnienia – OIT).',conf:'Młode owocniki mylone z pieczarkami (OIT UJ CM).',
  note:'OIT UJ CM wymienia razem z A. phalloides i A. virosa jako najniebezpieczniejsze; przebieg opisany identycznie jak w zatruciu A. phalloides.',src:['oit'],credit:0},
 {id:'virosa',tier:'A',pl:'Muchomor jadowity',latin:'Amanita virosa',img:['virosa'],syndrome:'amatoksyny',
  desc:'Biały kapelusz i blaszki; pierścień może być nietrwały; podstawa z pochwą.',conf:'Młode owocniki mylone z pieczarkami (OIT).',note:'Amatoksyny (Wennig 2020: A. phalloides, A. virosa, małe Lepiota, Galerina).',src:['wennig','oit'],credit:0},
 {id:'galerina',tier:'A',pl:'Hełmówka jadowita',latin:'Galerina marginata',img:['galerina'],syndrome:'amatoksyny',
  desc:'Mały brązowy grzyb, zwykle na drewnie; blaszki brązowieją; pierścień może być słabo widoczny. Nie wszystkie śmiertelne grzyby mają pochwę.',conf:'Mylona z łuskwiakiem zmiennym (Kuehneromyces mutabilis; Wennig 2020).',note:'Zawiera amatoksyny (Wennig 2020).',src:['wennig'],credit:0},
 {id:'lepiota',tier:'A',pl:'Czubajeczka brązowoczerwonawa i inne małe czubajeczki',latin:'Lepiota brunneoincarnata, Lepiota spp.',img:['lepiota'],syndrome:'amatoksyny',
  desc:'Małe czubajeczki z łuskowatym kapeluszem i pierścieniem; łatwe do przeoczenia w mieszanej potrawie.',conf:'Małe, często zbierane „przy okazji” – ryzyko posiłku mieszanego.',note:'Małe Lepiota (Wennig 2020) zawierają amatoksyny. Brak ustalonej polskiej nazwy zbiorczej – nazwa gatunku wg Wikipedii PL.',src:['wennig'],credit:0},
 {id:'orellanus',tier:'A',pl:'Zasłonak rudy',latin:'Cortinarius orellanus',img:['orellanus'],syndrome:'orellanina',
  desc:'Rudawy kapelusz, rdzawobrązowe blaszki, zasnówka może być słabo widoczna; brak pochwy.',conf:'Mylony z kurką (pieprznikiem jadalnym; Wennig 2020).',
  mech:'Orellanina lub jej metabolit: stres oksydacyjny, zahamowanie biosyntezy białek w nerce → śródmiąższowe zapalenie nerek (Wennig 2020).',
  lat:'Okres utajenia 36 h – 17 dni (Wennig 2020).',sym:'Pragnienie, ból w okolicy lędźwiowej, osłabienie, skąpomocz lub ostra niewydolność nerek; możliwa nieodwracalna schyłkowa niewydolność nerek wymagająca dializ.',
  note:'Brak testu w surowicy/moczu (tylko tkanka nerki). Brak odtrutki.',src:['wennig'],credit:0},
 {id:'rubellus',tier:'A',pl:'Zasłonak rudawy (spiczasty)',latin:'Cortinarius rubellus (syn. C. speciosissimus)',img:['rubellus'],syndrome:'orellanina',
  desc:'Zasłonak o rudawo-pomarańczowym, spiczastym kapeluszu (zasłonakowate).',conf:'Podobnie jak C. orellanus – ryzyko pomyłki z kurką.',
  mech:'Orellanina (jak wyżej).',lat:'Okres utajenia 36 h – 17 dni (Wennig 2020).',sym:'Jak w zatruciu orellaniną.',note:'Wennig 2020: „Deadly Webcap” (C. rubellus, syn. C. speciosissimus).',src:['wennig'],credit:0},
 {id:'gyromitra',tier:'A',pl:'Piestrzenica kasztanowata',latin:'Gyromitra esculenta',img:['gyromitra'],syndrome:'gyromitryna',
  desc:'Brązowy, pofałdowany („mózgowaty”) kapelusz; wiosną, często pod drzewami iglastymi.',conf:'Mylona ze smardzem jadalnym (Wennig 2020).',
  mech:'Gyromitryna → monometylohydrazyna (MMH): hamowanie kinazy pirydoksalu → niedobór witaminy B6/GABA; możliwa methemoglobinemia (Wennig 2020).',
  lat:'Okres utajenia 6–12 h (Wennig 2020).',sym:'Nudności, wymioty, zaburzenia świadomości, pobudzenie OUN, drgawki, uszkodzenie wątroby i nerek; możliwa methemoglobinemia. Opisano ciężkie i śmiertelne zatrucia mimo prawidłowej obróbki cieplnej.',
  note:'Brak testów w surowicy/moczu.',src:['wennig'],credit:0},
 {id:'paxillus',tier:'B',pl:'Krowiak podwinięty (olszówka)',latin:'Paxillus involutus',img:['paxillus'],syndrome:'paxillus',
  desc:'Brązowy kapelusz z podwiniętym brzegiem; blaszki zbiegające na trzon.',conf:'Uważany przez część zbieraczy za jadalny (OIT: największe kontrowersje).',
  mech:'Mechanizm immunologiczny: przeciwciała IgG → hemoliza (Wennig 2020).',lat:'Okres utajenia 60 min – 2 h (Wennig 2020).',sym:'Wymioty, biegunka, ból w okolicy lędźwiowej, uszkodzenie nerek, hipotensja; hemoliza i niewydolność wielonarządowa zwłaszcza po wielokrotnym spożyciu (nawet po latach) – możliwy zgon.',
  note:'Nie jest gatunkiem „śmiertelnym przy pierwszym spożyciu” w typowych opisach, ale zgony opisano – '+DEC+'. Dializa: z nefrologicznego punktu widzenia nie służy eliminacji toksyny.',src:['wennig','oit'],credit:0},
 {id:'inocybe',tier:'B',pl:'Włókniak ceglasty (strzępiak ceglasty)',latin:'Inocybe erubescens',img:['inocybe'],syndrome:'muskaryna',
  desc:'Biały do ceglastoczerwonawego kapelusz ze zmianą barwy po uszkodzeniu; wiosna–lato.',conf:'Mylony z młynarzykiem (Clitopilus prunulus; Wennig 2020).',
  mech:'Muskaryna: pobudzenie receptorów muskarynowych (Wennig 2020).',lat:'Okres utajenia 30 min – 2 h.',sym:'Wymioty, biegunka, zwężenie źrenic, pocenie, bradykardia, hipotensja.',note:'Wennig 2020: „Deadly Fibrecap” – leczenie: płyny i elektrolity, atropina; dawka atropiny wg lokalnej procedury ('+DEC+').',src:['wennig'],credit:0},
 {id:'clitocybe',tier:'B',pl:'Lejkówka (Clitocybe rivulosa / dealbata; PL: „lejkówka jadowita”)',latin:'Clitocybe rivulosa (= C. dealbata)',img:['clitocybe'],syndrome:'muskaryna',
  desc:'Małe białawe lejkowate grzyby na trawnikach i łąkach; kółka czarcie.',conf:'Mylona z młynarzykiem (Clitopilus prunulus).',mech:'Muskaryna.',lat:'Okres utajenia 30 min – 2 h.',sym:'Zespół muskarynowy jak wyżej.',note:'Nazwa polska wg Wikipedii PL (Wojewoda 2003: C. dealbata = lejkówka jadowita); synonimia — do weryfikacji.',src:['wennig'],credit:0}
];
var CREDITS={phalloides:[['phalloides-whole','Archenzo','Amanita_phalloides_1.JPG','CC BY-SA 3.0'],['phalloides-base','Stu’s Images','Amanita_phalloides_-_deathcap.JPG','CC BY-SA 3.0']],verna:[['verna','James St. John','Amanita_verna_(destroying_angel_mushroom).jpg','CC BY 2.0']],virosa:[['virosa','Σ64','Amanita_virosa_12.jpg','CC BY 3.0']],galerina:[['galerina','Dan Molter (shroomydan)','Galerina_marginata_61108.jpg','CC BY-SA 3.0']],lepiota:[['lepiota','Strobilomyces','Lepiota_brunneoincarnata_170929w.JPG','CC BY-SA 4.0']],orellanus:[['orellanus','Thomas Pruß','Cortinarius_orellanus_(1).JPG','CC BY-SA 3.0']],rubellus:[['rubellus','Eric Steinert','Cortinarius_rubellus_01.jpg','CC BY-SA 3.0']],gyromitra:[['gyromitra','Kruczy89','Gyromitra_esculenta01.jpg','CC0']],paxillus:[['paxillus','Florstein (Telegram:WikiPhoto.Space)','Paxillus_Involutus_LO_(img1).jpg','CC BY-SA 4.0']],inocybe:[['inocybe','Jerzy Opioła','Inocybe_erubescens_MS4_(1).jpg','CC BY-SA 4.0']],clitocybe:[['clitocybe','Strobilomyces','Clitocybe_rivulosa_20081116w.JPG','CC BY-SA 3.0']]};
// ---- postępowanie wg zespołu ----
var TX={
 'amatoksyny':{what:'Nawodnienie i elektrolity (obserwuj diurezę – toksyna wydalana głównie przez nerki), glikemia, koagulopatia (czynniki krzepnięcia).',
  charcoal:'Węgiel aktywny 0,5–1 g/kg (maks. 50 g) jednorazowo u dorosłego (Wennig 2020); w zatruciu amatoksynami rozważa się dawki powtarzane co 2–4 h (przegląd 2024: przeżycie 83% vs 75%) – tylko po ocenie czasu, drożności dróg oddechowych/ryzyka aspiracji, perystaltyki; '+DEC+'.',
  antidote:'Silibinina i.v.: 5 mg/kg w 1 h, następnie 20 mg/kg/dobę (Toxins 2026) / Legalon SIL: 20 mg/kg/dobę w 4 wlewach po 2 h (producent, DE). NAC: schemat jak w zatruciu paracetamolem – dawkowanie w amatoksynach '+DEC+'. Penicylina G: jako dodatek/alternatywa gdy brak silibininy; dawki w źródłach różne (0,5–1 mln j.m./kg/dobę) – '+DEC+'. Wennig 2020: śmiertelność 22% (sama penicylina) vs 9% (penicylina + silibinina) vs 5% (sama silibinina); zalecana silibinina, NAC jako alternatywa lub uzupełnienie. Brak RCT.',
  avail:NT,
  transplant:'Wcześnie omów kwalifikację do transplantacji wątroby przy narastającym INR/bilirubinie/kreatyninie, encefalopatii, kwasicy/mleczanach lub hipoglikemii. Kryteria Clichy i Monachium (Wennig 2020). Wartości z piśmiennictwa (przeglądy 2026): Ganzert (wskaźnik protrombinowy ≤25% + kreatynina ≥106 µmol/l, doby 3–10); Escudié (wskaźnik protrombinowy <10% lub INR >6 od doby 4) – '+DEC+'. Dializa albuminowa (MARS/Prometheus/ADVOS) nie usuwa toksyny – most do transplantacji; hemodializa w okresie utajenia (Wennig).'},
 'orellanina':{what:'Leczenie objawowe, monitorowanie kreatyniny i diurezy przez 2–3 tygodnie od ekspozycji; hemodializa wg wskazań nefrologicznych; Wennig 2020 wymienia także steroidy ('+DEC+').',charcoal:'Węgiel aktywny rozważ tylko przy wczesnym zgłoszeniu (wg ogólnych zasad).',antidote:'Brak odtrutki.',avail:'Konsultacja nefrologiczna/toksykologiczna; ośrodek z dializoterapią.'},
 'gyromitryna':{what:'Leczenie objawowe: płyny, kontrola glikemii, wątroby, methemoglobiny; drgawki: benzodiazepiny (ostrożnie – ryzyko depresji oddechowej).',charcoal:'Węgiel aktywny (Wennig 2020: „may be given”).',antidote:'Pirydoksyna (witamina B6) i.v. – dawka: '+DEC+' (nie zweryfikowano w tej wersji); alternatywa: lewetyracetam (Wennig 2020). Methemoglobinemia: błękit metylenowy wg lokalnej procedury ('+DEC+').',avail:'Dostępność pirydoksyny i.v. w Nowym Targu – potwierdź w aptece szpitalnej.'},
 'paxillus':{what:'Płyny, kontrola hemoglobiny/LDH/bilirubiny/nerek; przetoczenia przy hemolizie; plazmafereza rozważana (Wennig 2020).',charcoal:'Węgiel aktywny (Wennig 2020: „may be given”).',antidote:'Brak odtrutki.',avail:'Hemoliza z AKI – konsultacja nefrologiczna/hematologiczna.'},
 'muskaryna':{what:'Płyny i elektrolity; atropina w zespole muskarynowym (Wennig 2020) – dawkowanie '+DEC+'. Węgiel aktywny (Wennig: „may be given”).',charcoal:'Węgiel aktywny (Wennig 2020).',antidote:'Atropina – objawowo (bradykardia, ślinotok, objawy oskrzelowe); dawka: '+DEC+' (nie zweryfikowano w tej wersji).',avail:'Dostępność atropiny w Nowym Targu – potwierdź w aptece szpitalnej.'}
};
// ---- Triage wg czasu ----
function triage(p){p=p||{};var lat=num(p.latency),since=num(p.since);var r=[],lvl='ok',reasons=[];
 var any=p.suspect===true||p.gi===true||p.liver===true||p.renal===true||isFinite(lat)||isFinite(since);
 if(!any)return{ok:false,msg:'Brak wyniku: podaj czas od posiłku do objawów lub zaznacz objawy/podejrzenie.'};
 if(isFinite(lat)&&(lat<0||lat>1000))return{ok:false,msg:'Nierealny czas utajenia – popraw dane.'};
 if(isFinite(since)&&(since<0||since>2000))return{ok:false,msg:'Nierealny czas od spożycia – popraw dane.'};
 if(p.suspect===true){lvl='red';reasons.push('podejrzenie spożycia gatunku potencjalnie śmiertelnego');}
 if(isFinite(lat)&&lat>=6){lvl='red';reasons.push('okres utajenia ≥6 h – zespoły uszkadzające narządy (amatoksyny, orellanina, gyromitryna): wymagają pilnej hospitalizacji (Wennig 2020)');}
 if(p.liver===true){lvl='red';reasons.push('uszkodzenie wątroby / rosnące INR');}
 if(p.renal===true){lvl='red';reasons.push('uszkodzenie nerek / skąpomocz');}
 if(isFinite(lat)&&lat<6&&lvl!=='red'){lvl='orange';reasons.push('okres utajenia <6 h – zwykle zespoły czynnościowe o łagodniejszym przebiegu, ALE krótki okres utajenia nie wyklucza zatrucia amatoksynami przy posiłku mieszanym (Wennig 2020); muskarynowe (Inocybe/Clitocybe) mogą zagrażać życiu');}
 if(lvl==='ok'&&p.gi===true){lvl='orange';reasons.push('objawy żołądkowo-jelitowe: ustal czas utajenia i skład posiłku; współbiesiadników też zbadaj (GIS)');}
 var samp=sampling(since);
 return{ok:true,level:lvl,reasons:reasons,sampling:samp,transferHint:lvl==='red'?'Rozważ wczesną konsultację toksykologiczną (Kraków) i transfer – decyzja lekarza. '+NT:'Obserwacja i seryjne badania; ponownie oceń przy zmianie stanu.'};}
function num(x){if(typeof x==='number')return isFinite(x)?x:NaN;if(x==null||x==='')return NaN;var n=Number(String(x).replace(',','.'));return isFinite(n)?n:NaN;}
function sampling(since){var s={window:'unknown',text:''};
 if(!isFinite(since)){s.text='Czas od spożycia nieznany – pobierz mocz jak najwcześniej; interpretacja wyniku ostrożna.';return s;}
 if(since<0||since>2000){s.text='Nierealny czas od spożycia – popraw dane (brak wyniku).';return s;}
 if(since<6){s.window='early';s.text='Wcześnie (<6 h): amatoksyny wykrywalne w moczu nawet przed objawami (Wennig 2020) – POBIERZ MOCZ TERAZ; ujemny wynik nie wyklucza zatrucia, rozważ powtórzenie.';}
 else if(since<=36){s.window='window';s.text='Okno wiarygodnego oznaczenia amanityny w moczu: 6–36 h od spożycia (Wennig 2020) – POBIERZ MOCZ TERAZ (przed leczeniem, jeśli możliwe; nie opóźniaj leczenia).';}
 else if(since<=96){s.window='late';s.text='Po >36 h: amatoksyny w moczu wykrywalne krótko – wynik mniej wiarygodny, ujemny nie wyklucza (Wennig 2020); CHOP/StatPearls: wykrywalność do 3–4 dni. Pobierz mimo to.';}
 else{s.window='verylate';s.text='>4 dób od spożycia: oznaczenie amanityny w moczu mało prawdopodobne do wykrycia; opieraj się na klinice i badaniach funkcji wątroby/nerek.';}
 return s;}
var SAMPLES=[
 ['Natychmiast','Mocz na amanitynę (ELISA/LC-MS) – w oknie 6–36 h wiarygodny; SU Kraków: ELISA CITO (cennik 2026)','Pracownia Toksykologiczna SU Kraków – uzgodnij tel. 12 400 36 49 (całodobowo)'],
 ['Teraz i seryjnie (np. co 6–12 h – wg stanu)','AST, ALT, bilirubina, INR/PT, glukoza, kreatynina, mocznik, Na/K/Mg, gazometria, mleczany, (amoniak – wg dostępności); diureza','Lokalne laboratorium; narastające INR / encefalopatia = pilny kontakt z ośrodkiem transplantacyjnym'],
 ['Niezależnie od czasu','Resztki SUROWYCH grzybów, potrawy, wymiociny, popłuczyny – osobno oznaczone; zdjęcia (góra, bok, spód, cała podstawa)','Identyfikacja przez grzyboznawcę (PSSE) / mikroskopowo zarodniki z resztek (Wennig 2020); nie opóźniaj leczenia'],
 ['Dni–tygodnie (zasłonaki)','Kreatynina i diureza w dynamice 2–3 tyg.','Nefrologia; orellanina – brak testu w płynach (tylko tkanka nerki)'],
 ['Hemoliza (krowiak)','Morfologia, LDH, bilirubina, haptoglobina, kreatynina','Próba antyglobulinowa – '+DEC]];
var TRANSFER=[
 ['Podejrzenie amatoksyn (lub niepewność) – okres utajenia ≥6 h z objawami żołądkowo-jelitowymi','amatoksyny'],
 ['Jakikolwiek wzrost AST/ALT, bilirubiny lub INR; hipoglikemia','amatoksyny'],
 ['Encefalopatia, kwasica, rosnące mleczany, hipotensja oporna na płyny','amatoksyny'],
 ['Narastająca kreatynina / skąpomocz (amatoksyny lub orellanina)','nerki'],
 ['Hemoliza, methemoglobinemia, drgawki','inne'],
 ['Brak lokalnej odtrutki (silibinina) przy realnym podejrzeniu amatoksyn','amatoksyny'],
 ['Pacjent w okresie pozornej poprawy (faza „ciszy”) po spożyciu podejrzanego grzyba','amatoksyny']];
function transferAssess(f){f=f||{};var hit=[];TRANSFER.forEach(function(t,i){if(f['t'+i]===true)hit.push(t[0]);});return{any:hit.length>0,hit:hit,msg:hit.length?'Spełnione kryteria do rozważenia transferu / konsultacji ('+hit.length+'): '+NT:'Nie zaznaczono kryteriów – brak wyniku (nie oznacza bezpieczeństwa).'};}
return{SRC:SRC,SPECIES:SPECIES,CREDITS:CREDITS,TX:TX,CONTACTS:CONTACTS,STAMP:STAMP,NT:NT,POL:POL,SAMPLES:SAMPLES,TRANSFER:TRANSFER,triage:triage,sampling:sampling,transferAssess:transferAssess,telHref:telHref,DEC:DEC,AMA:AMA};});
