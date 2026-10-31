(function(r,f){var m=f();if(typeof module==='object'&&module.exports)module.exports=m;else{r.SK=r.SK||{};r.SK.elyteB1=m;}})(this,function(){
// ETAP B1 – Elektrolity: tabela bezpiecznych zasad wyrównywania Na⁺, K⁺, Mg²⁺, Ca²⁺.
// Wewnątrz: SI (mmol/l). Puste/nierealne dane → null (brak wyniku).
var SRC={
 ESE:'ESE/ESICM/ERBP – Clinical practice guideline on diagnosis and treatment of hyponatraemia, 2014 (Eur J Endocrinol 170:G1; Nephrol Dial Transplant 29:i1)',
 US:'Verbalis i wsp. – Hyponatremia treatment guidelines 2013 (Am J Med 126:S1)',
 ADA:'ADA/EASD/JBDS/AACE/DTS consensus: Hyperglycemic crises in adults 2024 (korekta Na⁺ o glikemię 1,6 mmol/l na 5,6 mmol/l glukozy)',
 AM:'Adrogué HJ, Madias NE – N Engl J Med 2000;342:1493 (hipernatremia / wzór Adrogué–Madias)',
 UKKA:'UK Kidney Association – Clinical Practice Guideline: Management of Hyperkalaemia in Adults, 10.2023 (wapń 6,8 mmol: 30 ml glukonianu 10% / 10 ml CaCl₂ 10%)',
 MHRA:'MHRA Drug Safety Update 2020 – wapń w ciężkiej hiperkaliemii (powtórz dawkę, gdy zmiany w EKG utrzymują się 5–10 min po dawce; działanie 30–60 min)',
 KCL:'ChPL Kalium chloratum WZF 15% (RPL 3281): maks. 40 mmol/l; 10 mmol/h przy K⁺ >3; 20 mmol/h przy K⁺ <3 (wyjątkowo 40); ≤200 mmol/dobę; 10 mmol ≈ +0,1 mmol/l',
 ERC:'ERC 2021 – szczególne okoliczności (hiperkaliemia, torsade de pointes: MgSO₄ 2 g w 10 min)',
 SFE:'Society for Endocrinology – Emergency management of acute hypocalcaemia in adults, 2016 (Endocr Connect 5:G7)',
 NHS:'Schematy szpitalne NHS (np. NHS Highland, Cornwall) / BNF – hipomagnezemia: 2 g MgSO₄ w 15 min (niestabilny 2–15 min, stabilny 1 h), potem 25 mmol w 12–24 h',
 GINA:'GINA 2023 – ciężka astma: MgSO₄ 2 g i.v. w 20 min'};
var NA3=513,NA09=154,NA045=77,NA5G=0;
var MG_MMOL_PER_G=1/0.2465; // MgSO4·7H2O 246,5 g/mol → 1 g = 4,06 mmol
var K_MMOL_PER_ML15=150/74.55; // KCl 15% = 150 mg/ml → 2,012 mmol/ml
function nz(x){return typeof x==='number'&&isFinite(x);}
function tbwF(sex,age){var old=!(age<65);return sex==='m'?(old?0.5:0.6):(old?0.45:0.5);} // nieznana płeć/wiek → ostrożniej
function adrogue(na,inf,tbw){return (inf-na)/(tbw+1);}
// ---------- Na⁺: korekta o glikemię ----------
function naCorr(na,glu){if(!nz(na)||!nz(glu))return null;var ex=Math.max(0,glu*18.016-100);return{c16:na+1.6*ex/100,c24:na+2.4*ex/100,excess:ex};}
// ---------- hiponatremia ----------
// i: na, glu(mmol/l), osm(mOsm/kg, opcjonalnie), w, sex, age, sympt('none'|'mod'|'severe'|''), onset('acute'|'chronic'|''), vol('hypo'|'eu'|'hyper'|''), highRisk(bool)
function hypoNa(i){if(!(nz(i.na)&&i.na>=80&&i.na<=180))return null;var o={lvl:'ok',steps:[],warn:[],stop:[]};
 o.cc=naCorr(i.na,i.glu);var naEff=o.cc?o.cc.c16:i.na; // korekta Katz 1,6 jako wartość robocza (Hillier 2,4 – pokazywana obok)
 o.naEff=naEff;
 o.limit=i.highRisk?8:10;o.limit2=8;o.highRisk=!!i.highRisk;
 if(nz(i.osm)&&i.osm>=275&&i.na<135){o.type='izotoniczna/hipertoniczna';o.lvl='orange';o.steps.push({t:'Nie hipotoniczna',d:'Osmolalność ≥275 mOsm/kg – to nie jest hiponatremia hipotoniczna (pseudohiponatremia / hiperglikemia / mannitol). NIE stosuj 3% NaCl; lecz przyczynę.',k:'no'});return finish(o);}
 if(o.cc&&naEff>=135){o.type='translokacyjna';o.lvl='orange';o.stop.push('Hiponatremia z hiperglikemii: Na⁺ skorygowane ≥135 mmol/l – NIE wyrównuj sodu solą (3% NaCl i 0,9% NaCl niewskazane); lecz hiperglikemię (płyny, insulina wg DKA/HHS), kontroluj Na⁺ – skorygowany Na⁺ rośnie wraz ze spadkiem glikemii.');o.steps.push({t:'Pseudohiponatremia (translokacyjna)',d:'Na⁺ zmierzone '+i.na+' → skorygowane '+(Math.round(naEff*10)/10).toString().replace('.',',')+' (Katz 1,6) / '+(Math.round(o.cc.c24*10)/10).toString().replace('.',',')+' (Hillier 2,4) mmol/l. Nie leczyć Na⁺ solą.',k:'no'});return finish(o);}
 if(naEff>=135){o.type='brak';o.steps.push({t:'Brak hiponatremii',d:'Na⁺ ≥135 mmol/l – brak wskazań do korekcji.',k:'ok'});return finish(o);}
 o.type='hipotoniczna';
 if(o.cc&&o.cc.excess>=100)o.warn.push('Glikemia '+Math.round(i.glu*18.016)+' mg/dl: część obniżenia Na⁺ wynika z hiperglikemii (Na⁺ skorygowane '+(Math.round(naEff*10)/10).toString().replace('.',',')+' / '+(Math.round(o.cc.c24*10)/10).toString().replace('.',',')+' mmol/l). Decyzje opieraj na Na⁺ skorygowanym; samą hiperglikemię lecz insuliną/płynami, nie solą.');
 o.sev=naEff<125?'ciężka (<125)':naEff<130?'umiarkowana (125–129)':'łagodna (130–134)';
 if(naEff<125||i.sympt==='severe')o.lvl='red';else if(naEff<130||i.sympt==='mod')o.lvl='orange';
 var w=i.w,tbw=w>0?w*tbwF(i.sex,i.age):NaN;o.tbw=tbw;
 if(w>0){o.d3=adrogue(naEff,NA3,tbw);o.d09=adrogue(naEff,NA09,tbw);o.bolusRise=o.d3*0.15;o.bolusAltMl=2*w;o.weightBolus=w>0;}
 var a=i.sympt;
 if(a==='severe'){o.steps.push({t:'3% NaCl – bolus',d:'150 ml 3% NaCl i.v. w 20 min (alternatywnie 2 ml/kg'+(w>0?' = '+Math.round(2*w)+' ml':'')+' przy nietypowej budowie ciała); kontrola Na⁺ po 20 min; powtórz do 2 razy lub do wzrostu Na⁺ o 5 mmol/l (maks. 3 dawki w 1. godzinie). Objawy ciężkie: drgawki, śpiączka, zatrzymanie oddechu, wymioty, GCS ≤8. UWAGA – DO DECYZJI LEKARZA: ChPL NaCl 10% (Polpharma) zabrania podania nierozcieńczonego i w zatruciu wodnym podaje maks. 100 ml/h; bolus 150 ml/20 min (=450 ml/h) wg ESE 2014 przekracza ten zapis. Przygotowanie 3% NaCl wg lokalnej receptury (do uzupełnienia).',k:'red'});
  o.steps.push({t:'Po wzroście ≥5 mmol/l lub poprawie objawów',d:'Zakończ 3% NaCl; wolny dostęp żylny 0,9% NaCl w minimalnej objętości; lecz przyczynę. Brak poprawy po +5 mmol/l: kontynuuj 3% NaCl dążąc do +1 mmol/l/h, stop gdy objawy ustąpią, Na⁺ wzrośnie łącznie o 10 mmol/l lub osiągnie 130 mmol/l; Na⁺ co 4 h.',k:'red'});}
 else if(a==='mod'){o.steps.push({t:'3% NaCl – pojedynczy wlew',d:'150 ml 3% NaCl w 20 min (jednorazowo); cel +5 mmol/l/24 h; Na⁺ po 1, 6 i 12 h; leczenie przyczyny; odstaw leki wywołujące.',k:'orange'});}
 else{ // bez objawów / łagodne
  if(i.onset==='acute')o.steps.push({t:'Ostra (<48 h), bez objawów ciężkich',d:'Zatrzymaj płyny hipotoniczne i leki wywołujące; kontrola Na⁺ co 1–4 h; przy spadku Na⁺ ≥10 mmol/l w ≤48 h rozważ pojedyncze 150 ml 3% NaCl w 20 min (ESE 2014, 3.3) – DO DECYZJI LEKARZA.',k:'orange'});
  if(i.vol==='hypo')o.steps.push({t:'Hipowolemia → 0,9% NaCl',d:'Wyrównaj objętość 0,9% NaCl lub płynem zbilansowanym 0,5–1,0 ml/kg/h'+(w>0?' (= '+Math.round(0.5*w)+'–'+Math.round(w)+' ml/h)':'')+'; Na⁺ co ≥4 h; po wyrównaniu wolemii Na⁺ może rosnąć szybko (diureza wodna) – pilnuj limitu.',k:'ok'});
  else if(i.vol==='eu')o.stop.push('Euwolemia / SIADH: NIE podawaj soli ani 3% NaCl (chyba że objawy). Pierwsza linia: ograniczenie płynów (początkowo ok. 1 l/dobę), leczenie przyczyny, odstawienie leków (ESE 2014).');
  else if(i.vol==='hyper')o.stop.push('Hiperwolemia / przewodnienie (HF, marskość, zespół nerczycowy): NIE podawaj soli – ogranicz płyny i sód, lecz przyczynę, rozważ diuretyk pętlowy; konsultacja.');
  else o.steps.push({t:'Oceń wolemię',d:'Wybierz stan wolemii: hipowolemia → 0,9% NaCl; euwolemia (SIADH) → ograniczenie płynów; hiperwolemia → ograniczenie płynów/diuretyk. Bez oceny wolemii nie podawaj soli.',k:'orange'});}
 o.target=5;
 o.steps.push({t:'Limity korekcji',d:'Cel +5 mmol/l/24 h; LIMIT: ≤'+o.limit+' mmol/l w 1. dobie'+(o.highRisk?' (wysokie ryzyko ODS)':'')+', następnie ≤8 mmol/l na każdą kolejną dobę do Na⁺ 130 mmol/l. Czynniki ryzyka ODS: Na⁺ ≤105, hipokaliemia, alkoholizm, niedożywienie, choroba wątroby.',k:'red'});
 o.steps.push({t:'Kontrola',d:'Na⁺ po 1, 6 i 12 h, potem co dobę (ESE); w czasie 3% NaCl co 4 h (co 20 min w bolusach). Diureza wodna (>100 ml/h rozcieńczonego moczu) = ryzyko przekroczenia limitu.',k:'ok'});
 o.overcorrection='Przekroczenie limitu: przerwij leczenie podnoszące Na⁺, rozważ „re-lowering”: 10 ml/kg wody wolnej od elektrolitów (np. glukoza 5%) w 1 h ze ścisłą kontrolą diurezy i bilansu + desmopresyna 2 µg i.v. (nie częściej niż co 8 h) – ESE 2014; DO DECYZJI LEKARZA / konsultacja nefrologa lub intensywisty.';
 return finish(o);}
function finish(o){if(o.stop.length&&o.lvl==='ok')o.lvl='orange';return o;}
// plan 3% NaCl na cel (Adrogué–Madias): ml i ml/h, z limitem
function plan3(i){if(!(i.w>0&&nz(i.na)&&nz(i.target)&&i.target>0))return null;var tbw=i.w*tbwF(i.sex,i.age),d=adrogue(i.na,NA3,tbw);if(!(d>0))return null;
 var lim=i.highRisk?8:10,o={tbw:tbw,d3:d,vol:i.target/d*1000};o.mlh=o.vol/24;o.exceed=i.target>lim+1e-9;o.limit=lim;o.chplMaxMlh=100;o.chplExceed=o.mlh>100+1e-9;return o;}
// kontrola postępu korekcji
function progress(naStart,naNow,hours,highRisk){if(!(nz(naStart)&&nz(naNow)&&nz(hours)&&hours>0&&hours<=72))return null;var lim=highRisk?8:10,rise=naNow-naStart,per24=rise/hours*24;
 var o={rise:rise,perH:rise/hours,per24:per24,limit:lim,remaining:lim-rise,status:'ok'};
 if(hours<=24){if(rise>lim+1e-9)o.status='exceeded';else if(rise>=lim*0.8||per24>lim*1.0)o.status='near';}
 else{var lim2=8;o.limit=lim2;if(rise/hours*24>lim2+1e-9)o.status='exceeded';}
 return o;}
// ---------- hipernatremia ----------
function hyperNa(i){if(!(nz(i.na)&&i.na>145&&i.na<=200&&i.w>0))return null;var tbw=i.w*tbwF(i.sex,i.age),o={tbw:tbw,lvl:i.na>=160||i.sympt?'red':'orange',steps:[]};
 o.deficitL=tbw*(i.na/140-1); // niedobór wolnej wody (l)
 o.perH=i.onset==='acute'?1.0:0.5;o.per24=i.onset==='acute'?24:10;
 o.d5g=adrogue(i.na,NA5G,tbw);o.d045=adrogue(i.na,NA045,tbw);
 if(i.shock)o.steps.push({t:'Hipowolemia z wstrząsem',d:'Najpierw 0,9% NaCl / płyn zbilansowany do stabilizacji hemodynamicznej, dopiero potem płyny hipotoniczne.',k:'red'});
 o.steps.push({t:'Tempo obniżania Na⁺',d:i.onset==='acute'?'Ostra (<48 h), objawowa: do ≈1 mmol/l/h do złagodzenia objawów, nie przekraczać 10–12 mmol/l/24 h po ustąpieniu objawów – DO WERYFIKACJI.':'Przewlekła (>48 h) lub nieznana: ≤0,5 mmol/l/h i ≤10 mmol/l/24 h (ryzyko obrzęku mózgu).',k:'orange'});
 o.steps.push({t:'Płyn',d:'Glukoza 5% (czysta woda po metabolizmie) lub 0,45% NaCl; doustnie/przez sondę woda, jeśli możliwe. Szac. niedobór wolnej wody: '+(Math.round(o.deficitL*10)/10).toString().replace('.',',')+' l (TBW×(Na/140−1)); 1 l glukozy 5% obniża Na⁺ o ≈'+(Math.round(-o.d5g*10)/10).toString().replace('.',',')+' mmol/l (Adrogué–Madias).',k:'ok'});
 var target=o.perH,rate=-o.d5g>0?target/(-o.d5g)*1000:NaN;o.mlhForTarget=rate;
 o.steps.push({t:'Kontrola',d:'Na⁺ co 2–4 h (co 1–2 h w ostrej), glikemia (glukoza 5% – hiperglikemia), bilans, GCS.',k:'ok'});
 return o;}
// ---------- potas ----------
function potassiumInfusion(i){ // i: mmol (K łącznie), volMl (objętość końcowa), rate (mmol/h), kSerum, central(bool)
 if(!(nz(i.mmol)&&i.mmol>0&&nz(i.volMl)&&i.volMl>0&&nz(i.rate)&&i.rate>0))return null;var o={warn:[],blocked:false};
 o.conc=i.mmol/i.volMl*1000;o.ml15=i.mmol/K_MMOL_PER_ML15;o.mlh=i.rate/o.conc*1000;o.hours=i.mmol/i.rate;
 var maxRate=nz(i.kSerum)&&i.kSerum<3?20:10;o.maxRate=maxRate;
 if(o.conc>40+1e-9){o.blocked=true;o.warn.push('Stężenie '+Math.round(o.conc)+' mmol/l >40 mmol/l – poza ChPL (maks. 40 mmol/l); wynik wstrzymany. Zmniejsz ilość potasu lub zwiększ objętość.');}
 if(i.rate>maxRate+1e-9){if(nz(i.kSerum)&&i.kSerum<3&&i.rate<=40){o.warn.push('Szybkość '+i.rate+' mmol/h >20 mmol/h: tylko wyjątkowo (K⁺ <3 z EKG/niedowładem), wymaga ciągłego EKG i decyzji lekarza (ChPL: wyjątkowo 40 mmol/h).');}else{o.blocked=true;o.warn.push('Szybkość '+i.rate+' mmol/h przekracza dopuszczalną ('+maxRate+' mmol/h przy tym K⁺) wg ChPL – wynik wstrzymany.');}}
 if(i.rate>10)o.warn.push('>10 mmol/h: ciągłe EKG i kontrola K⁺ co 1–2 h.');
 if(i.central&&i.rate>10)o.warn.push('Cewnik centralny: nie podawaj zbyt szybko (ryzyko zatrzymania krążenia – ChPL pkt 4.2/4.4).');
 o.dailyWarn=false;o.expectedRise=i.mmol/10*0.1; // 10 mmol ≈ +0,1 mmol/l (ChPL)
 return o;}
function hypoK(i){if(!nz(i.k)||i.k<=0||i.k>=8)return null;var o={lvl:'ok',steps:[]};
 if(i.k>=3.5){o.lvl='ok';o.steps.push({t:'K⁺ ≥3,5',d:'Brak wskazań do suplementacji i.v. (docelowo 4,0–5,0 u chorych z ryzykiem arytmii/HF).',k:'ok'});return o;}
 o.sev=i.k<2.5?'ciężka (<2,5)':i.k<3.0?'umiarkowana (2,5–2,9)':'łagodna (3,0–3,4)';
 o.lvl=i.k<2.5||i.ecg?'red':'orange';
 var maxRate=i.k<3?20:10;o.maxRate=maxRate;
 if(i.k>=3.0&&!i.ecg&&!i.weak)o.steps.push({t:'Preferuj doustnie',d:'K⁺ 3,0–3,4 bez zmian EKG i bez niedowładu: doustnie (np. KCl 20–40 mmol), jeśli przewód pokarmowy sprawny.',k:'ok'});
 o.steps.push({t:'Dożylnie – zasady (ChPL KCl)',d:'Roztwór użyć w ciągu 6 h od przygotowania; niezgodny z dobutaminą; nie podawać szybko do żyły centralnej (ChPL KCl WZF 15%). Gotowy roztwór: KCl 15% rozcieńczyć (10 ml = 20 mmol → 500 ml; 20 ml = 40 mmol → 1000 ml): ≤40 mmol/l. Szybkość: ≤10 mmol/h przy K⁺ >3; ≤20 mmol/h przy K⁺ <3 z EKG/niedowładem (wyjątkowo 40 mmol/h – ciągłe EKG). ≤200 mmol/dobę. Nigdy nierozcieńczony ani bolus.',k:i.k<3?'red':'orange'});
 o.steps.push({t:'Efekt',d:'10 mmol KCl ≈ +0,1 mmol/l K⁺ (ChPL, uproszczenie): kontrola K⁺ po każdych 20–40 mmol (co 1–2 h).',k:'ok'});
 o.steps.push({t:'Magnez',d:'Hipokaliemia często z hipomagnezemią – oznacz Mg i uzupełnij (oporna hipokaliemia).',k:'ok'});
 o.steps.push({t:'Dostęp',d:'Ból żyły obwodowej → dwie żyły lub duża żyła; przez cewnik centralny nie podawać zbyt szybko (ryzyko zatrzymania krążenia).',k:'ok'});
 if(i.insulin)o.steps.push({t:'Insulina / DKA',d:'K⁺ <3,5 przed insuliną w DKA: najpierw potas, insulina dopiero po K⁺ >3,5 (moduł DKA/HHS).',k:'red'});
 return o;}
// ---------- hiperkaliemia ----------
// i: k, ecg(bool), glu(mmol/l, glikemia przed), acidosis(bool), oliguria(bool), hypervol(bool)
function hyperK(i){if(!nz(i.k)||i.k<=0||i.k>12)return null;var o={lvl:'ok',steps:[],sev:null};
 o.sev=i.k>=6.5?'ciężka (≥6,5)':i.k>=6.0?'umiarkowana (6,0–6,4)':i.k>=5.5?'łagodna (5,5–5,9)':null;
 if(i.k<5.5&&!i.ecg){return o;}
 if(i.k>=6.5||i.ecg)o.lvl='red';else if(i.k>=6.0)o.lvl='orange';
 var ecgSign=i.ecg||i.k>=6.5;
 if(ecgSign)o.steps.push({n:1,t:'Wapń – ochrona serca',d:'Glukonian wapnia 10% 30 ml i.v. w 10 min (6,8 mmol Ca) LUB CaCl₂ 10% 10 ml w 5 min (6,8 mmol Ca; preferowany w NZK / okołoNZK). Ciągłe EKG. Powtórz tę samą dawkę, jeśli zmiany EKG utrzymują się 5–10 min po zakończeniu dawki; działanie trwa 30–60 min – powtarzaj wg EKG (nie obniża K⁺!). Ostrożnie u chorych na digoksynie.',k:'red',src:'UKKA 2023; MHRA 2020'});
 if(i.k>=6.0||i.ecg)o.steps.push({n:2,t:'Insulina + glukoza',d:'Insulina rozpuszczalna 10 j. + glukoza 25 g i.v. w 15–30 min (250 ml 10% lub 125 ml 20%).'+(nz(i.glu)&&i.glu<7?' Glikemia przed <7 mmol/l (126 mg/dl): dodaj glukoza 10% 50 ml/h przez 5 h (25 g) – ryzyko hipoglikemii.':' Kontrola glikemii co 30–60 min przez 6 h (hipoglikemia do 6 h po dawce).'),k:'orange',src:'UKKA 2023'});
 if(i.k>=6.5||(i.k>=6.0))o.steps.push({n:3,t:'Salbutamol',d:'Salbutamol 10–20 mg w nebulizacji – tylko jako dodatek, NIGDY jako jedyny lek.',k:'orange',src:'UKKA 2023'});
 o.steps.push({n:4,t:'Wodorowęglan',d:'Nie rutynowo. Tylko przy kwasicy metabolicznej (np. pH <7,2 / HCO₃⁻ <15–17) lub NZK – dawka i stężenie wg lokalnej procedury (DO DECYZJI LEKARZA).',k:'ok',src:'UKKA 2023 (sugestia 2C)'});
 o.steps.push({n:5,t:'Usunięcie K⁺',d:'Cyklokrzemian sodowo-cyrkonowy (Lokelma) 10 g (jeśli dostępny) – UKKA zaleca przy K⁺ ≥6,5; diuretyk pętlowy (np. furosemid 40–80 mg i.v.) przy zachowanej diurezie i braku hipowolemii; żywice (wg dostępności). Brak diurezy / K⁺ ≥6,5 mimo leczenia / AKI → pilna konsultacja nefrologa, dializa.',k:'orange',src:'UKKA 2023'});
 o.steps.push({n:6,t:'Kontrola',d:'K⁺ po 1, 2, 4, 6 i 24 h od leczenia; EKG ciągłe przy K⁺ ≥6,0; leczenie przyczyny (leki, AKI), kontrola Ca/Mg.',k:'ok',src:'UKKA 2023'});
 o.calcium=ecgSign?{ml:30,mmol:6.8,minutes:10,alt:'10 ml CaCl₂ 10% w 5 min',repeat:'po 5–10 min jeśli EKG bez poprawy'}:null;
 return o;}
// ---------- magnez ----------
function mgPlan(i){var o={lvl:'ok',steps:[]};if(!i.tdp&&!nz(i.mg)&&!i.asthma)return null;
 if(i.tdp){o.lvl='red';o.steps.push({t:'Torsade de pointes',d:'MgSO₄ 2 g (8,1 mmol; 10 ml 20%) i.v. w 10 min. Niestabilny/bez tętna – defibrylacja/ALS, MgSO₄ 2 g bolus. Uzupełnij K⁺ (cel >4,5), odstaw leki wydłużające QT, rozważ przyspieszenie rytmu.',k:'red',src:'ERC 2021'});}
 if(nz(i.mg)&&i.mg>0&&i.mg<=4){
  var severe=i.mg<0.4||(i.mg<0.7&&(i.sympt||i.arrhythmia));
  if(severe){o.lvl=o.lvl==='red'?'red':'orange';o.steps.push({t:'Ciężka / objawowa hipomagnezemia',d:'MgSO₄ 2 g w 15 min (niestabilny hemodynamicznie 2–15 min; stabilny – w 1 h), następnie 25 mmol (≈6 g MgSO₄ = 30 ml 20%) w 12–24 h. Kontrola Mg co 6–12 h, odruchy ścięgniste, RR, oddychanie.',k:'orange',src:'NHS/BNF'});}
  else if(i.mg<0.7)o.steps.push({t:'Niedobór bezobjawowy (<1,7 mg/dl = 0,7 mmol/l)',d:'Preferuj uzupełnianie doustne; i.v. wolniej niż w ciężkiej – dawka DO DECYZJI LEKARZA. Szukaj przyczyny (diuretyki, IPP, alkohol, biegunka).',k:'ok'});
  if(i.crcl>0&&i.crcl<30)o.steps.push({t:'Niewydolność nerek',d:'CrCl <30: zmniejsz dawkę (np. o 50%) i kontroluj Mg – ryzyko hipermagnezemii (BNF).',k:'orange'});
  if(i.mg>1.5)o.steps.push({t:'Hipermagnezemia',d:'Mg >3,6 mg/dl (1,5 mmol/l): nie podawać Mg; przy objawach (areflexia, hipotensja, depresja oddechowa) wapń i.v. (jak w hiperkaliemii), nawodnienie, dializa.',k:'red'});}
 if(i.asthma)o.steps.push({t:'Ciężka astma',d:'MgSO₄ 2 g i.v. w 20 min (jednorazowo) przy ciężkim/zagrażającym życiu napadzie.',k:'ok',src:'GINA 2023'});
 o.steps.push({t:'Przygotowanie',d:'MgSO₄ 20% = 200 mg/ml: 2 g = 10 ml (8,1 mmol); 1 g ≈ 4,06 mmol. Rozcieńczyć w NaCl 0,9% / glukozie 5%. Preparat i stężenie – sprawdź ampułkę (DO WERYFIKACJI).',k:'ok'});
 return o;}
function mgInfusion(i){if(!(nz(i.g)&&i.g>0&&nz(i.volMl)&&i.volMl>0&&nz(i.hours)&&i.hours>0))return null;var o={ml20:i.g/0.2,mmol:i.g*MG_MMOL_PER_G,conc:i.g*1000/i.volMl,mlh:i.volMl/i.hours};o.pct=i.g*100/i.volMl;if(o.pct>20)o.blocked=true;return o;}
// ---------- wapń ----------
function caPlan(i){if(!nz(i.ca)||i.ca<=0)return null;var o={lvl:'ok',steps:[]};o.corr=nz(i.alb)&&i.alb>0?i.ca+0.02*(40-i.alb):i.ca;
 if(o.corr<1.9||(i.sympt&&o.corr<2.1)){o.lvl='red';
  o.steps.push({t:'Bolus i.v.',d:'Glukonian wapnia 10%: 10–20 ml (2,25–4,5 mmol Ca) w 50–100 ml glukozy 5% w 10 min, z ciągłym EKG; powtarzaj do ustąpienia objawów (tężyczka, drgawki, skurcz krtani, wydłużone QT). Nie mieszać z wodorowęglanem/fosforanami.',k:'red',src:'SfE 2016'});
  o.steps.push({t:'Wlew podtrzymujący',d:'100 ml glukonianu wapnia 10% w 1 l NaCl 0,9% lub glukozy 5% – 50–100 ml/h (≈0,5–1,5 mg/kg/h wapnia elementarnego), do normokalcemii/leczenia przyczyny; Ca co 4–6 h.',k:'orange',src:'SfE 2016'});
  o.steps.push({t:'Mg i dializa',d:'Oznacz i uzupełnij Mg (hipoMg opornie hipoCa). Unikaj dużych objętości przy ESRD/dializie. Ostrożnie przy digoksynie. CaCl₂ 10% 10 ml = 6,8 mmol Ca (3× więcej niż 10 ml glukonianu) – nie myl preparatów.',k:'orange'});}
 else if(o.corr<2.1){o.lvl='orange';o.steps.push({t:'Łagodna hipokalcemia',d:'Bez objawów: doustnie wapń + kalcytriol/wit. D wg przyczyny; kontrola Ca, Mg, PTH, 25-OH-D.',k:'ok'});}
 if(o.corr>3.0){o.lvl='red';o.steps.push({t:'Hiperkalcemia',d:'Ca skorygowane >12 mg/dl (3,0 mmol/l): ciężka – nawodnienie 0,9% NaCl, leczenie przyczyny, konsultacja; szczegóły poza zakresem tego modułu.',k:'red'});}
 return o;}
// ---------- skrócona tabela reguł (renderowana w UI) ----------
var RULES=[
 {z:'Na⁺ niskie, objawy ciężkie',kiedy:'Drgawki, śpiączka, GCS ≤8, zatrzymanie oddechu',co:'3% NaCl 150 ml w 20 min (powtórz do 2×, łącznie do 3 bolusów)',limit:'Cel +5 mmol/l w 1. h; limit 10 (8 przy ryzyku ODS) w 24 h, potem 8/dobę',kontrola:'Na⁺ co 20 min w bolusach, potem co 4 h',src:'ESE 2014'},
 {z:'Na⁺ niskie, objawy umiarkowane',kiedy:'Nudności, splątanie, ból głowy',co:'3% NaCl 150 ml jednorazowo w 20 min',limit:'Cel +5 mmol/l/24 h; limit 10/8',kontrola:'Na⁺ po 1, 6, 12 h',src:'ESE 2014'},
 {z:'Na⁺ niskie, hipowolemia',kiedy:'Odwodnienie, utrata płynów/diuretyki',co:'0,9% NaCl 0,5–1 ml/kg/h',limit:'Uwaga na diurezę wodną po wyrównaniu wolemii',kontrola:'Na⁺ co ≥4 h',src:'ESE 2014'},
 {z:'Na⁺ niskie, euwolemia (SIADH)',kiedy:'Brak obrzęków, mocz stężony',co:'NIE sól – ograniczenie płynów (~1 l/d), przyczyna',limit:'Sól nasila hipoNa przy stężonym moczu',kontrola:'Na⁺ co 6–12 h',src:'ESE 2014'},
 {z:'Na⁺ niskie, hiperwolemia',kiedy:'HF, marskość, nerczyca',co:'NIE sól – ograniczenie płynów, diuretyk, leczenie przyczyny',limit:'—',kontrola:'Na⁺, bilans',src:'ESE 2014'},
 {z:'Na⁺ niskie + glikemia wysoka',kiedy:'Np. glikemia 600 mg/dl i Na⁺ 120',co:'NIE korygować solą – Na⁺ skorygowane = Na⁺ + 1,6 × (glikemia−100)/100 (mg/dl)',limit:'600 mg/dl: +8 → 128 (Katz) / +12 → 132 (Hillier)',kontrola:'Na⁺ skorygowane co 2–4 h',src:'ADA 2024'},
 {z:'Na⁺ wysokie',kiedy:'Na⁺ >145 mmol/l',co:'Glukoza 5% / 0,45% NaCl; wstrząs → najpierw 0,9% NaCl',limit:'Przewlekła ≤0,5 mmol/l/h i ≤10/24 h',kontrola:'Na⁺ co 2–4 h',src:'Adrogué–Madias 2000'},
 {z:'K⁺ niskie',kiedy:'K⁺ <3,5',co:'KCl ≤40 mmol/l, ≤10 mmol/h (K⁺ >3); ≤20 mmol/h (K⁺ <3 z EKG)',limit:'≤200 mmol/dobę; 10 mmol ≈ +0,1 mmol/l',kontrola:'K⁺ co 1–2 h, EKG, Mg',src:'ChPL KCl'},
 {z:'K⁺ wysokie z EKG / ≥6,5',kiedy:'Zmiany EKG lub K⁺ ≥6,5',co:'Wapń 30 ml glukonianu 10% (lub 10 ml CaCl₂) → powtórz po 5–10 min',limit:'Działa 30–60 min, nie obniża K⁺',kontrola:'EKG ciągłe',src:'UKKA 2023'},
 {z:'K⁺ wysokie – przesunięcie',kiedy:'K⁺ ≥6,0',co:'Insulina 10 j. + glukoza 25 g; salbutamol 10–20 mg neb',limit:'Glikemia <126 mg/dl (7 mmol/l) → glukoza 10% 50 ml/h × 5 h',kontrola:'K⁺ 1, 2, 4, 6, 24 h; glikemia 6 h',src:'UKKA 2023'},
 {z:'Mg niskie / TdP',kiedy:'TdP; Mg <1,0 mg/dl (0,4 mmol/l) lub objawy',co:'MgSO₄ 2 g w 10–15 min; potem 25 mmol w 12–24 h',limit:'CrCl <30: zmniejsz dawkę',kontrola:'Mg, odruchy, RR',src:'ERC 2021; NHS'},
 {z:'Ca niskie',kiedy:'Ca skor. <7,6 mg/dl (1,9 mmol/l) lub objawy',co:'Glukonian Ca 10% 10–20 ml w 10 min → wlew 50–100 ml/h',limit:'EKG ciągłe; uzupełnij Mg',kontrola:'Ca co 4–6 h',src:'SfE 2016'}];
return{SRC:SRC,NA3:NA3,NA09:NA09,tbwF:tbwF,adrogue:adrogue,naCorr:naCorr,hypoNa:hypoNa,plan3:plan3,progress:progress,hyperNa:hyperNa,potassiumInfusion:potassiumInfusion,hypoK:hypoK,hyperK:hyperK,mgPlan:mgPlan,mgInfusion:mgInfusion,caPlan:caPlan,RULES:RULES,K_MMOL_PER_ML15:K_MMOL_PER_ML15};});
