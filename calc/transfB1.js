(function(r,f){var m=f();if(typeof module==='object'&&module.exports)module.exports=m;else{r.SK=r.SK||{};r.SK.transfB1=m;}})(this,function(){
// ETAP B1 – Transfuzjologia: zgodność grup (KKCz/osocze/KKP), wskazania, trombocytopenia, KKP napromieniowane,
// masywne przetoczenie (ile KKP zamówić), czynniki wzrostu G-CSF i kwalifikacja hospitalizacja/ambulatoryjnie w gorączce neutropenicznej.
// Hb w g/dl; PLT i ANC w ×10⁹/l (= tys./µl); glukoza w mmol/l (kanonicznie SI). Brak danych → null.
var SRC={
 PL:'Wytyczne w zakresie leczenia krwią i jej składnikami oraz produktami krwiopochodnymi w podmiotach leczniczych, wyd. III (IHiT/NCKiK) + Rozporządzenie MZ (tekst jedn. Dz.U. 2023 poz. 1742): zgodność ABO/RhD, napromienianie, dawki',
 AABB:'AABB 2023 – International Guidelines for RBC Transfusion (Carson, JAMA 2023;330:1892): próg 7 g/dl u stabilnych dorosłych; 7,5 – kardiochirurgia; 8 – ortopedia/choroba sercowo-naczyniowa',
 MINT:'MINT 2023 (Carson, NEJM 389:2446): zawał mięśnia sercowego i niedokrwistość – strategia liberalna (Hb <10) nie wykazała istotnej korzyści nad restrykcyjną (7–8)',
 ESAT:'ESA 2023 (Kietaibl, Eur J Anaesthesiol 40:226) oraz European trauma guideline 2023 (Rossaint, Crit Care 27:80): Hb docelowa 7–9 g/dl przy krwotoku; osocze:KKCz od 1:2 do 1:1; fibrynogen >1,5 g/l; TXA 1 g w ≤3 h',
 BSH:'BSH 2017 – Guidelines for the use of platelet transfusions (Estcourt, Br J Haematol 176:365): profilaktyka 10; CVC 20; punkcja lędźwiowa 40; duża operacja 50; zewnątrzoponowo 80; neurochirurgia/tylny odcinek oka 100; krwotok duży 50; uraz wielonarządowy/ICH 100',
 BSHIRR:'BSH 2020 – Guidelines on the use of irradiated blood components (Foukaneli, Transfus Med 30:3): wskazania do napromieniania (ziarnica, analogi puryn, allo-/auto-HSCT, ATG/alemtuzumab, dawcy spokrewnieni, HLA-dobrane, granulocyty, niedobory odporności, wcześniaki/wymienne)',
 ASH:'ASH 2019 – ITP (Neunert, Blood Adv 3:3829): transfuzje KKP w ITP tylko przy zagrażającym życiu krwawieniu (z IVIG/GKS)',
 ASCOCSF:'ASCO 2015 – WBC Growth Factors (Smith, J Clin Oncol 33:3199) + EORTC 2010 (Aapro, Eur J Cancer 47:8) + ESMO 2016 (Crawford, Ann Oncol 27 suppl 5): profilaktyka pierwotna przy ryzyku FN ≥20%; leczniczo – nie rutynowo, rozważ przy wysokim ryzyku powikłań',
 CSFDOSE:'ChPL filgrastym (Zarzio/Nivestim): 5 µg/kg/dobę s.c.; ChPL pegfilgrastym (Neulasta): 6 mg s.c. jednorazowo na cykl, nie w okresie od 14 dni przed do 24 h po chemioterapii; masa ≥45 kg',
 IDSA:'ASCO/IDSA 2018 – Outpatient management of fever and neutropenia (Taplitz, J Clin Oncol 36:1443): MASCC ≥21 + brak czynników wysokiego ryzyka; CISNE dla guzów litych; leczenie ambulatoryjne: pierwsza dawka empiryczna w placówce, obserwacja ≥4 h, wsparcie 24 h, transport, telefon',
 MASCC:'Klastersky 2000 (J Clin Oncol 18:3038) – MASCC risk index (maks. 26 pkt; ≥21 = niskie ryzyko)',
 CISNE:'Carmona-Bayonas 2015 (J Clin Oncol 33:465) – CISNE (0–8 pkt; 0 niskie, 1–2 pośrednie, ≥3 wysokie)',
 ELN:'ELN 2019 APL (Sanz, Blood 133:1630): PLT >30–50 ×10⁹/l i fibrynogen >1,5 g/l w ostrej białaczce promielocytowej'};
var G=['O','A','B','AB'];
var RBC={O:['O'],A:['A','O'],B:['B','O'],AB:['AB','A','B','O']};
var PLA={O:['O','A','B','AB'],A:['A','AB'],B:['B','AB'],AB:['AB']};
function nz(x){return typeof x==='number'&&isFinite(x);}
function rd(x,d){var p=Math.pow(10,d==null?1:d);return Math.round(x*p)/p;}
// tabela zgodności: dla każdej grupy biorcy z RhD – składniki, które można przetoczyć
function compatTable(){var rows=[];['O','A','B','AB'].forEach(function(g){['+','-'].forEach(function(rh){
 rows.push({abo:g,rh:rh,label:g+' RhD'+(rh==='+'?'+':'−'),
  rbc:RBC[g].map(function(x){return x}).join(', ')+(rh==='-'?' – tylko RhD−':' – RhD+ lub RhD−'),
  plasma:PLA[g].join(', ')+' (RhD nieistotne)',
  plt:[g].concat(PLA[g].filter(function(x){return x!==g})).join(', ')+' (preferuj identyczną ABO; RhD '+(rh==='-'?'−, a przy RhD+ → immunoglobulina anty-D u kobiet w wieku rozrodczym':'dowolna')+')'});});});return rows;}
// ---------- wskazania do KKCz ----------
// i: kind ('acute'|'chronic'), hb (g/dl), w (kg), burdened (choroba sercowo-naczyniowa/niewydolność serca/ACS), symptomatic, maxShift (konfig.), unstable
var HB={normal:7,burdened:8,cardiacSurg:7.5};
function rbc(i){if(!nz(i.hb)||i.hb<2||i.hb>20)return null;var o={warn:[],lvl:'ok'};
 var t=i.burdened?HB.burdened:HB.normal;o.threshold=t;o.src='AABB';
 if(i.kind==='acute'){
  o.kind='acute';o.target='7–9 g/dl (ESA 2023 / trauma 2023)';
  if(i.unstable){o.need=true;o.lvl='red';o.txt='Krwotok z niestabilnością hemodynamiczną: przetaczaj KKCz wg wyniku klinicznego, NIE czekaj na Hb (Hb wtórnie spada); uruchom protokół masywnego przetoczenia przy przewidywanej utracie. Cel Hb 7–9 g/dl.';}
  else{o.need=!!(i.hb<t||(i.symptomatic&&i.hb<t+1));o.lvl=o.need?'orange':'ok';o.txt=o.need?'Aktywne/niedawne krwawienie, Hb poniżej progu → KKCz po ocenie klinicznej; cel 7–9 g/dl.':'Hb powyżej progu przy stabilnej hemodynamice: obserwacja, kontrola Hb po 1–2 h.';}
  if(i.burdened)o.warn.push('Choroba sercowo-naczyniowa / ACS: próg 8 g/dl (AABB 2023); w zawale liberalna strategia (<10) – brak jednoznacznej korzyści (MINT 2023) → DO DECYZJI LEKARZA.');
  return o;}
 // przewlekła
 o.kind='chronic';o.need=i.hb<t;
 o.target=i.burdened?'8–9 g/dl lub ustąpienie objawów':'7–8 g/dl lub ustąpienie objawów';
 o.lvl=o.need?'orange':'ok';
 if(o.need&&w(i)){var inc=70/i.w; // przyrost Hb na 1 j. ≈ 1 g/dl × 70/masa
  var goal=i.burdened?9:8,units=Math.max(1,Math.ceil((goal-i.hb)/inc-1e-9));o.incPerUnit=rd(inc,2);o.unitsTotal=units;
  var mx=nz(i.maxShift)&&i.maxShift>0?i.maxShift:null;o.maxShift=mx;o.unitsNow=mx?Math.min(units,mx):units;o.capped=mx&&units>mx;}
 o.txt=o.need?'Niedokrwistość przewlekła, Hb <'+t+' g/dl'+(i.burdened?' (obciążony)':'')+': przetaczaj po 1 j., po każdej ocena kliniczna i Hb; cel '+o.target+'.':'Hb ≥'+t+' g/dl – przetoczenie zwykle niewskazane (poza objawami: ból w klatce, duszność, hipotensja nieodpowiadająca na wypełnienie).';
 if(o.need&&i.symptomatic===false)o.warn.push('Brak objawów: rozważ leczenie przyczynowe (żelazo, B12, EPO) zamiast przetoczenia.');
 if(i.burdened)o.warn.push('Ryzyko TACO: jedna jednostka na raz, wlew 3–4 h (max 4 h od wyjęcia z lodówki wg zasad IHiT), rozważ furosemid; monitoruj SpO₂/obrzęk.');
 o.warn.push('Przyrost Hb ≈1 g/dl na 1 j. u dorosłego ~70 kg (≈ 70/masa); liczba jednostek orientacyjna.');
 o.warn.push('Maksymalna liczba jednostek na dyżur / jednorazowo – ustalana lokalnie (DO DECYZJI LEKARZA); pole konfigurowalne.');
 return o;}
function w(i){return nz(i.w)&&i.w>0;}
// ---------- trombocytopenia ----------
var PLT_CTX={
 proph:{t:10,l:'Profilaktyka – niewydolność szpiku po chemioterapii/HSCT (odwracalna)',s:'BSH'},
 prophRisk:{t:20,l:'Profilaktyka przy gorączce/sepsie/koagulopatii lub leczeniu przeciwkrzepliwym (podwyższone ryzyko)',s:'BSH',dw:true},
 apl:{t:30,l:'Ostra białaczka promielocytowa (APL) – utrzymuj ≥30–50',s:'ELN',dw:true,hi:50},
 cvc:{t:20,l:'Założenie CVC (pod kontrolą USG)',s:'BSH'},
 lp:{t:40,l:'Punkcja lędźwiowa',s:'BSH'},
 epidural:{t:80,l:'Znieczulenie/cewnik zewnątrzoponowy',s:'BSH'},
 surgery:{t:50,l:'Duża operacja / zabieg inwazyjny',s:'BSH'},
 neuro:{t:100,l:'Neurochirurgia / tylny odcinek oka',s:'BSH'},
 bleedMinor:{t:30,l:'Krwawienie klinicznie istotne (WHO ≥2), bez zagrożenia życia',s:'BSH',dw:true},
 bleedMajor:{t:50,l:'Krwawienie duże/masywne',s:'BSH'},
 ich:{t:100,l:'Krwotok śródczaszkowy / uraz wielonarządowy z urazem głowy',s:'BSH'}};
// i: ctx, plt (×10⁹/l), thromboType ('', 'itp','ttp','hit','chronic'), bleeding, lifeThreat
function platelets(i){if(!nz(i.plt)||i.plt<0||i.plt>1500)return null;var o={warn:[],lvl:'ok'};
 if(i.thromboType==='ttp'||i.thromboType==='hit'){o.avoid=true;o.need=false;o.lvl=i.lifeThreat?'orange':'red';o.txt=(i.thromboType==='ttp'?'TTP':'HIT')+': przetaczania płytek należy UNIKAĆ (ryzyko zakrzepicy) – tylko przy zagrażającym życiu krwawieniu po konsultacji hematologa.';return o;}
 if(i.thromboType==='itp'){o.need=!!i.lifeThreat;o.lvl=o.need?'orange':'ok';o.txt=o.need?'ITP z krwawieniem zagrażającym życiu: KKP (podwójna dawka dopuszczalna) + IVIG i glikokortykosteroid; konsultacja hematologa (ASH 2019).':'ITP: KKP nie są wskazane bez krwawienia zagrażającego życiu (ASH 2019); leczenie GKS/IVIG – hematolog.';o.src='ASH';return o;}
 if(i.thromboType==='chronic'&&!i.bleeding&&i.ctx!=='cvc'&&i.ctx!=='lp'&&i.ctx!=='surgery'&&i.ctx!=='neuro'&&i.ctx!=='epidural'){o.need=false;o.txt='Przewlekła stabilna małopłytkowość (np. MDS, aplazja, marskość) bez krwawienia i bez zabiegu: profilaktyczne KKP zwykle niewskazane; PLT <10 – indywidualnie z hematologiem.';return o;}
 var C=PLT_CTX[i.ctx];if(!C){return null;}
 o.threshold=C.t;o.ctxLabel=C.l;o.src=C.s;if(C.dw)o.dw=true;
 o.need=i.plt<C.t;o.lvl=o.need?'orange':'ok';
 o.txt=o.need?'PLT '+i.plt+' < '+C.t+' ×10⁹/l ('+C.l+') → 1 dawka terapeutyczna KKP (dorosły), kontrola PLT 10 min–1 h po przetoczeniu.':'PLT '+i.plt+' ≥ '+C.t+' ×10⁹/l – KKP niewskazane dla tego kontekstu.';
 if(C.hi&&i.plt<C.hi)o.warn.push('APL: docelowo ≥'+C.hi+' ×10⁹/l przy krwawieniu/koagulopatii (ELN 2019).');
 o.dose='1 dawka terapeutyczna dorosłego = 1 KKP aferezowy lub 1 pulowany z 4–6 dawców (≥2×10¹¹ płytek); oczekiwany przyrost ≈20–40 ×10⁹/l u ~70 kg (BSH).';
 if(i.ctx==='bleedMinor'||i.ctx==='bleedMajor'||i.ctx==='ich'){if(i.plt>=C.t)o.warn.push('PLT powyżej progu, a krwawienie trwa: szukaj innej przyczyny (koagulopatia, leki przeciwpłytkowe, czynnik chirurgiczny).');}
 return o;}
// napromieniane KKP
var IRR=[['hodgkin','choroba Hodgkina (dożywotnio)'],['purine','analogi puryn (fludarabina, kladrybina, pentostatyna, bendamustyna, klofarabina) – w trakcie i po leczeniu'],['allo','allogeniczne HSCT (od kondycjonowania i przez ≥6 mies./GVHD)'],['auto','autologiczne HSCT / zbiór komórek macierzystych (w trakcie kondycjonowania ~7 dni przed do 3 mies. po)'],['atg','leczenie ATG / alemtuzumabem'],['related','dawca krwi spokrewniony z biorcą (I/II stopień)'],['hla','KKP dobierane wg HLA'],['gran','koncentrat granulocytów'],['pid','wrodzony ciężki niedobór odporności (SCID, DiGeorge)'],['neonate','przetoczenie wymienne / wcześniak / wewnątrzmaciczne']];
// i: v (zaznaczone), urgent (zagrażające życiu)
function irradiated(v,urgent){v=v||{};var ind=IRR.filter(function(x){return v[x[0]]}).map(function(x){return x[1]});
 var o={required:ind.length>0,reasons:ind,lvl:ind.length?'red':'ok'};
 o.txt=ind.length?'KKP i KKCz MUSZĄ być napromieniowane (profilaktyka TA-GVHD): '+ind.join('; ')+'.':'Brak wskazania do napromieniania wg zaznaczonych kryteriów.';
 if(ind.length){o.ifUnavailable='Gdy napromieniowanych nie ma: NIE opóźniaj przetoczenia zagrażającego życiu – podaj składnik zwykły (wykonaj leukoredukcję, jeśli dostępna), udokumentuj decyzję i niezwłocznie skonsultuj hematologa/bank krwi; przy braku zagrożenia życia – poczekaj na składnik napromieniowany (zamów w RCKiK). Po przetoczeniu informuj hematologa (BSH 2020). DO DECYZJI LEKARZA.';o.urgentTxt=urgent?'Stan zagrażający życiu: ryzyko TA-GVHD mniejsze niż ryzyko krwawienia – przetocz dostępny składnik.':'';}
 o.apheresis='KKP aferezowe (jeden dawca) vs pulowane (4–6 dawców): klinicznie równoważne; aferezowe preferowane przy alloimmunizacji/refrakcyjności i przy dobieraniu HLA/HPA; napromienianie dostępne dla obu typów.';
 return o;}
// ---------- masywne przetoczenie ----------
// i: rbcGiven, rbcPerHour, deliveryMin (konfig.), pltGiven, pltStock, ratioRbcPerPlt (domyślnie 6: 1 KKP aferezowe ≈ 6 j. KKCz), plasmaRatio (jednostki osocza na 1 KKCz; domyślnie 1)
function mtp(i){if(!nz(i.rbcGiven)||i.rbcGiven<0||!nz(i.rbcPerHour)||i.rbcPerHour<0||!nz(i.deliveryMin)||i.deliveryMin<0||i.deliveryMin>1440)return null;
 var ratio=nz(i.ratioRbcPerPlt)&&i.ratioRbcPerPlt>0?i.ratioRbcPerPlt:6;var pl=nz(i.plasmaRatio)&&i.plasmaRatio>0?i.plasmaRatio:1;
 var projected=i.rbcGiven+i.rbcPerHour*i.deliveryMin/60;
 var pltDoses=Math.ceil(projected/ratio-1e-9),given=nz(i.pltGiven)?i.pltGiven:0,stock=nz(i.pltStock)?i.pltStock:0;
 var order=Math.max(0,pltDoses-given-stock);
 var o={projectedRbc:rd(projected,1),pltTotal:pltDoses,order:order,plasmaUnits:Math.ceil(projected*pl-1e-9),ratio:ratio,plasmaRatio:pl,delay:i.deliveryMin,lvl:'orange'};
 o.txt='Przewidywane zużycie KKCz do czasu dostawy: '+o.projectedRbc+' j. → KKP łącznie '+pltDoses+' dawek ('+ratio+' j. KKCz na 1 dawkę KKP aferezowego ≈ 1:1:1 w przeliczeniu na jednostki dawców), osocze '+o.plasmaUnits+' j. Zamów z RCKiK Kraków: '+order+' dawek KKP (czas dostawy '+i.deliveryMin+' min).';
 o.warn=['Czas dostawy z RCKiK Kraków jest parametrem lokalnym (DO DECYZJI / ustalić lokalnie); jeśli nieznany – przyjmij najgorszy realny.','Proporcja 1:1:1 (KKCz:osocze:KKP) wg ATLS/PROPPR; ESA/European trauma 2023 dopuszcza osocze:KKCz od 1:2 do 1:1 – wybór protokołu lokalnego.','Cele: PLT >50 (>100 przy urazie głowy), fibrynogen >1,5 g/l, Ca²⁺ >1,15 mmol/l, T >35 °C, pH >7,2; TXA 1 g w ≤3 h od urazu (CRASH-2).'];
 return o;}
// ABC score (przewidywanie MTP w urazie)
function abc(f){f=f||{};var s=(f.penetrating?1:0)+(f.sbp90?1:0)+(f.hr120?1:0)+(f.fast?1:0);return{score:s,activate:s>=2,txt:s>=2?'ABC ≥2: wysokie prawdopodobieństwo masywnego przetoczenia – rozważ uruchomienie protokołu MTP (Nunez 2009; ATLS).':'ABC <2: MTP mało prawdopodobne – oceniaj dynamicznie.'};}
// ---------- G-CSF + gorączka neutropeniczna ----------
// neutropenia: ANC ×10⁹/l, temp °C (pojedynczy pomiar ≥38,3 lub ≥38,0 utrzymująca się ≥1 h)
function fn(i){if(!nz(i.anc)||i.anc<0||i.anc>50)return null;var o={neutropenia:i.anc<1.5,severe:i.anc<0.5,profound:i.anc<0.1};
 o.grade=i.anc>=1.5?'brak':i.anc>=1?'1. stopień (1,0–1,5)':i.anc>=0.5?'2. stopień (0,5–1,0)':i.anc>=0.1?'3–4. stopień – ciężka (<0,5)':'4. stopień – głęboka (<0,1)';
 if(nz(i.temp)){o.fever=i.temp>=38.3||(i.temp>=38.0&&!!i.feverHour);}
 o.fn=!!(o.fever&&i.anc<0.5||o.fever&&i.anc<1.0&&i.expectedFall);
 if(o.fn)o.act='GORĄCZKA NEUTROPENICZNA = stan nagły: posiewy krwi (2 zestawy) i pierwszy antybiotyk szerokospektralny w ≤60 min od triage (IDSA/ESMO); izolacja ochronna; nie podawać leków przeciwgorączkowych maskujących.';
 return o;}
// MASCC: sym: 'none'|'mild' (5), 'moderate' (3), 'severe' (0)
function mascc(f){if(!f||['none','mild','moderate','severe'].indexOf(f.sym)<0||!nz(f.age))return null;
 var s=(f.sym==='none'||f.sym==='mild'?5:f.sym==='moderate'?3:0)+(f.hypo?0:5)+(f.copd?0:4)+(f.fungal||f.haemPrevFungal?0:4)+(f.dehydr?0:3)+(f.outpt?3:0)+(f.age<60?2:0);
 return{score:s,low:s>=21};}
// CISNE: ecog2 (2), glu ≥121 mg/dl (≥6,72 mmol/l; 2), copd (1), cvd (1), mucositis≥2 (1), mono<200/µl (1)
function cisne(f){if(!f||!nz(f.gluMmol))return null;var s=(f.ecog2?2:0)+(f.gluMmol>=121/18.016-1e-9?2:0)+(f.copd?1:0)+(f.cvd?1:0)+(f.muc?1:0)+(f.mono?1:0);return{score:s,cls:s===0?'niskie':s<=2?'pośrednie':'wysokie',high:s>=3};}
// i: anc, temp, feverHour, mascc fields (m), solid (guz lity), cisne fields (c), haemMalig, hsct, expectedProlonged (ANC<0,1 >7 dni), organ (niewydolność narządowa), noSupport (brak wsparcia 24 h/transportu/telefonu), noOral
function disposition(i){var f=fn(i);if(!f||!f.fn)return {fnOk:false,note:f?'Brak kryteriów gorączki neutropenicznej (ANC <0,5 [lub <1,0 spadający] + gorączka ≥38,3 °C lub ≥38,0 °C ≥1 h).':null,res:null};
 var reasons=[];
 if(i.haemMalig)reasons.push('nowotwór hematologiczny / ostra białaczka / intensywna chemioterapia (ASCO/IDSA 2018: nie dla ambulatoryjnego)');
 if(i.hsct)reasons.push('po przeszczepie komórek krwiotwórczych');
 if(i.organ)reasons.push('niewydolność narządowa / hipotensja / sepsa');
 if(i.expectedProlonged)reasons.push('oczekiwana głęboka (<0,1) i przedłużona (>7 dni) neutropenia');
 if(i.noSupport)reasons.push('brak wsparcia 24 h, transportu lub kontaktu telefonicznego (warunek ASCO/IDSA)');
 if(i.noOral)reasons.push('niemożność doustnego przyjmowania leków');
 var m=mascc(i.m);if(!m)return{fnOk:true,res:null,note:'Uzupełnij pola MASCC, aby uzyskać wynik.',fn:f};
 if(!m.low)reasons.push('MASCC '+m.score+' (<21)');
 var c=null;if(i.solid){c=cisne(i.c);if(!c)return{fnOk:true,res:null,note:'Guz lity: uzupełnij pola CISNE (glikemia).',fn:f,mascc:m};if(c.high)reasons.push('CISNE '+c.score+' (≥3)');}
 var res=reasons.length?'hosp':'amb';
 return{fnOk:true,fn:f,mascc:m,cisne:c,res:res,reasons:reasons,
  txt:res==='hosp'?'HOSPITALIZACJA (przyczyny: '+reasons.join('; ')+').':'MOŻE AMBULATORYJNIE – decyzja lekarza: MASCC '+m.score+(c?', CISNE '+c.score:'')+', brak czynników wysokiego ryzyka. Warunki: pierwsza dawka antybiotyku empirycznego w SOR + obserwacja ≥4 h, doustnie ciprofloksacyna + amoksycylina/klawulanian (alergia na penicylinę: klindamycyna), kontrola wywiadu telefonicznego, kontrola morfologii wg hematologa/onkologa w ≤24–48 h, powrót przy pogorszeniu.',
  dw:true};}
// G-CSF: i: mode ('prophylaxis'|'treatment'), fnRisk (% ryzyko FN schematu), riskFactors (liczba), anc, febrile, w, highRiskFeatures{...}, product ('fil'|'peg')
var CSF_HIGH=[['prolonged','oczekiwana głęboka (<0,1) i przedłużona (>10 dni) neutropenia'],['age65','wiek >65 lat'],['uncontrolled','niekontrolowana choroba podstawowa'],['pneumonia','zapalenie płuc'],['sepsis','hipotensja / wielonarządowa niewydolność (sepsa)'],['fungal','inwazyjna infekcja grzybicza'],['inhosp','gorączka w trakcie hospitalizacji']];
function gcsf(i){var o={warn:[],lvl:'ok'};
 if(i.mode==='prophylaxis'){if(!nz(i.fnRisk)||i.fnRisk<0||i.fnRisk>100)return null;
  var rf=nz(i.riskFactors)?i.riskFactors:0;
  if(i.fnRisk>=20){o.rec='YES';o.txt='Ryzyko FN schematu ≥20% → profilaktyka pierwotna G-CSF zalecana (ASCO 2015/EORTC 2010), o ile nie ma równie skutecznego schematu bez G-CSF.';}
  else if(i.fnRisk>=10){o.rec=rf>0?'YES':'CONSIDER';o.txt=rf>0?'Ryzyko FN 10–20% + czynniki ryzyka pacjenta → rozważ/zalecaj profilaktykę G-CSF (ASCO/EORTC).':'Ryzyko FN 10–20% bez czynników ryzyka → rozważ ocenę indywidualną.';o.lvl='orange';}
  else{o.rec='NO';o.txt='Ryzyko FN <10% → profilaktyka G-CSF zwykle niewskazana.';}
  o.timing='Podanie 24–72 h po zakończeniu chemioterapii (nie wcześniej niż 24 h po; nie w ciągu 24 h przed kolejnym cyklem).';
  o.who='Profilaktyka dotyczy decyzji onkologa/hematologa prowadzącego – SOR zwykle nie rozpoczyna profilaktyki pierwotnej.';
 }
 else if(i.mode==='treatment'){
  if(!nz(i.anc))return null;
  var hi=CSF_HIGH.filter(function(x){return i.hi&&i.hi[x[0]]}).map(function(x){return x[1]});
  o.hi=hi;
  if(!i.febrile){o.rec='NO';o.txt='Neutropenia bez gorączki: G-CSF nie należy stosować rutynowo (ASCO 2015).';}
  else if(hi.length){o.rec='CONSIDER';o.lvl='orange';o.txt='Gorączka neutropeniczna z cechami wysokiego ryzyka powikłań ('+hi.join('; ')+') → rozważ dołączenie G-CSF do antybiotykoterapii (ASCO 2015). Konsultacja hematologa/onkologa.';}
  else{o.rec='NO';o.txt='Gorączka neutropeniczna bez cech wysokiego ryzyka: G-CSF nie jest rutynowo zalecany jako dodatek do antybiotyku (ASCO 2015).';}
 } else return null;
 if(i.product==='peg'){o.dose='Pegfilgrastym 6 mg s.c. jednorazowo na cykl (masa ≥45 kg); nie w okresie 14 dni przed do 24 h po chemioterapii (ChPL).';if(i.mode==='treatment')o.warn.push('Pegfilgrastym nie jest zarejestrowany/rutynowo zalecany w leczeniu FN – preferuj filgrastym (ESMO 2016).');}
 else{o.dose=w(i)?'Filgrastym 5 µg/kg/dobę s.c. = '+rd(5*i.w,0)+' µg/dobę (zaokrąglenie do fiolki 300/480 µg – lokalnie, DO DECYZJI) do przekroczenia nadiru ANC (np. >1,0×10⁹/l po nadirze).':'Filgrastym 5 µg/kg/dobę s.c. – podaj masę ciała.';}
 o.contra='Przeciwwskazania/ostrożność: nadwrażliwość; nie podawać w ciągu 24 h od chemioterapii; ostrożnie przy białaczkach szpikowych/MDS, niedokrwistości sierpowatokrwinkowej, ryzyku pęknięcia śledziony (ból w lewym nadbrzuszu), ARDS.';
 o.isolation='Izolacja ochronna (pokój pojedynczy, higiena rąk, bez kwiatów/owoców nieumytych) przy ANC <0,5×10⁹/l – zakres zależny od lokalnych procedur (DO DECYZJI); HEPA – głównie alloHSCT (IDSA).';
 return o;}
return{SRC:SRC,G:G,RBC:RBC,PLA:PLA,HB:HB,PLT_CTX:PLT_CTX,IRR:IRR,CSF_HIGH:CSF_HIGH,compatTable:compatTable,rbc:rbc,platelets:platelets,irradiated:irradiated,mtp:mtp,abc:abc,fn:fn,mascc:mascc,cisne:cisne,disposition:disposition,gcsf:gcsf};});
