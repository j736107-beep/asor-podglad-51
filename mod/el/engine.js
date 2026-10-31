// Elektrolity SOR – silnik (czysty JS, testowany w Node: tests/elektrolity.cjs). 27.10.2026.
// Dawki wyłącznie z ChPL (RPL/EMA) i wytycznych z S; rozbieżności = 'DO DECYZJI LEKARZA', pokazywane obok siebie.
(function(r,f){if(typeof module==='object'&&module.exports)module.exports=f();else r.EL=f();})(this,function(){
'use strict';
var RP='https://rejestrymedyczne.ezdrowie.gov.pl/api/rpl/medicinal-products/';
var S={
 ERC:{n:'ERC 2025',label:'ERC Guidelines 2025 – Special Circumstances in Resuscitation (hiper-/hipokaliemia, Fig. 2). Resuscitation 2025;110753',url:'https://doi.org/10.1016/j.resuscitation.2025.110753'},
 ERC21:{n:'ERC 2021',label:'ERC Guidelines 2021 – Cardiac arrest in special circumstances (elektrolity, TdP). Resuscitation 2021;161:152–219',url:'https://doi.org/10.1016/j.resuscitation.2021.02.011'},
 UKKA:{n:'UKKA 2023',label:'UK Kidney Association – Clinical Practice Guideline: Treatment of Acute Hyperkalaemia in Adults (2023)',url:'https://ukkidney.org/health-professionals/guidelines/treatment-acute-hyperkalaemia-adults'},
 KDIGO:{n:'KDIGO',label:'KDIGO 2012 AKI Guideline (wskazania do RRT: hiperkaliemia/kwasica/przewodnienie oporne na leczenie) oraz KDIGO Controversies Conference – potassium, Kidney Int 2020;97:42–61',url:'https://kdigo.org/guidelines/acute-kidney-injury/'},
 ESE:{n:'ESE/ESICM/ERBP 2014',label:'Spasovski i wsp. Clinical practice guideline on diagnosis and treatment of hyponatraemia. Eur J Endocrinol 2014;170:G1–G47',url:'https://doi.org/10.1530/EJE-13-1020'},
 AM:{n:'Adrogué–Madias',label:'Adrogué HJ, Madias NE. Hyponatremia / Hypernatremia. N Engl J Med 2000;342:1581–9 i 1493–9 (wzór zmiany Na⁺ po 1 l płynu)',url:'https://doi.org/10.1056/NEJM200005253422107'},
 SFE:{n:'SfE 2016',label:'Society for Endocrinology – Emergency management of acute hypocalcaemia / severe hypercalcaemia in adults. Endocr Connect 2016;5:G7–G11',url:'https://doi.org/10.1530/EC-16-0056'},
 BNF:{n:'BNF/NHS',label:'BNF – Magnesium sulfate (hipomagnezemia: do 160 mmol w 5 dni; ostra: 35–50 mmol w 12–24 h) / schematy NHS',url:'https://bnf.nice.org.uk/drugs/magnesium-sulfate/'},
 KCL:{n:'ChPL',label:'ChPL Kalium chloratum WZF 15% (RPL 3281), pkt 4.2–4.4',url:RP+'3281/characteristic'},
 NACL:{n:'ChPL',label:'ChPL Inj. Natrii chlorati 10% Polpharma (RPL 3080), pkt 4.2',url:RP+'3080/characteristic'},
 MGP:{n:'ChPL',label:'ChPL Inj. Magnesii Sulfurici 20% Polpharma (RPL 3078), pkt 4.2–4.3',url:RP+'3078/characteristic'},
 MGK:{n:'ChPL',label:'ChPL Magnesium sulfate Kalceks 200 mg/ml (RPL 40909), pkt 2 i 4.2',url:RP+'40909/characteristic'},
 CACL:{n:'ChPL',label:'ChPL Calcium chloratum WZF 67 mg/ml (RPL 9315): 0,46 mmol Ca/ml, amp. 10 ml = 4,6 mmol',url:RP+'9315/characteristic'},
 CAGH:{n:'ChPL',label:'ChPL Calcium Gluconate hameln 95 mg/ml (RPL 40291): 0,22 mmol Ca/ml',url:RP+'40291/characteristic'},
 CAGC:{n:'ChPL',label:'ChPL Calsiosol 95,5 mg/ml (RPL 42111): 0,22 mmol Ca/ml',url:RP+'42111/characteristic'},
 BIC:{n:'ChPL',label:'ChPL Natrium bicarbonicum 8,4% Polpharma (RPL 4630): 1 ml = 1 mmol',url:RP+'4630/characteristic'},
 ADP:{n:'ChPL',label:'ChPL Addiphos (RPL 281): 1 ml = 2 mmol P + 1,5 mmol K + 1,5 mmol Na',url:RP+'281/characteristic'},
 GLP:{n:'ChPL',label:'ChPL Glycophos (RPL 11150): 1 ml = 1 mmol P + 2 mmol Na (wskazanie: żywienie pozajelitowe)',url:RP+'11150/characteristic'},
 G10:{n:'ChPL',label:'ChPL Glucosum 10% Fresenius (RPL 2711)',url:RP+'2711/characteristic'},
 G20:{n:'ChPL',label:'ChPL Glucosum 20% Fresenius (RPL 798)',url:RP+'798/characteristic'},
 ACT:{n:'ChPL',label:'ChPL Actrapid 100 j./ml (EMA) – możliwe podanie dożylne',url:'https://www.ema.europa.eu/pl/documents/product-information/actrapid-epar-product-information_pl.pdf'},
 SAL:{n:'ChPL',label:'ChPL Ventolin roztwór do nebulizacji 1 mg/ml i 2 mg/ml (hiperkaliemia – poza ChPL)',url:'https://rejestrymedyczne.ezdrowie.gov.pl/rpl/search/public'},
 LOK:{n:'ChPL',label:'ChPL Lokelma (EMA): 10 g 3×/d do 72 h',url:'https://www.ema.europa.eu/pl/documents/product-information/lokelma-epar-product-information_pl.pdf'},
 ZOL:{n:'ChPL',label:'ChPL Zometa / kwas zoledronowy 4 mg (EMA): hiperkalcemia nowotworowa 4 mg w ≥15 min w 100 ml',url:'https://www.ema.europa.eu/pl/documents/product-information/zometa-epar-product-information_pl.pdf'}
};
// ---------- jednostki ----------
var MW={ca:4.008,mg:2.431,p:3.097}; // mg/dl = mmol/l × MW (Ca 40,08; Mg 24,31; P 30,97 g/mol)
function toMmol(ion,v,unit){return unit==='mgdl'?v/MW[ion]:v;}
function toMgdl(ion,mmol){return mmol*MW[ion];}
function fmt(x){if(x==null||!isFinite(x))return'—';var a=Math.abs(x),s=a>=100?x.toFixed(0):a>=10?x.toFixed(1):x.toFixed(2);if(s.indexOf('.')>=0)s=s.replace(/0+$/,'').replace(/\.$/,'');return s.replace('.',',');}
function both(ion,mmol){return fmt(toMgdl(ion,mmol))+' mg/dl ('+fmt(mmol)+' mmol/l)';}
function checkWeight(w){if(!(w>0))return'none';if(w<30||w>250)return'red';if(w<40||w>180)return'amber';return'ok';}
// ---------- stałe preparatów (z ChPL) ----------
var P={kcl15:2.0,   // mmol K/ml (ChPL: 10 ml = 20 mmol)
 nacl10:1.711,       // mmol Na/ml (100 mg/ml : 58,44); amp. 10 ml (ChPL 6.5)
 nacl3:0.513,nacl09:0.154,naclLok:570, // STANDARD LOKALNY: 5×10 ml 10% + 100 ml G5% ≈ 570 mmol/l
 mgso4:0.2,mgMmolPerG:4.06,mgMeqPerG:8.1, // 200 mg/ml; 1 g = 4,1 mmol = 8,1 mEq (ChPL Kalceks)
 cacl:0.46,  // mmol Ca/ml (Calcium chloratum WZF 67 mg/ml)
 caglu:0.22, // mmol Ca/ml (hameln / Calsiosol)
 bic:1.0,adpP:2,adpK:1.5,adpNa:1.5,glpP:1,glpNa:2};
// ---------- wlew: obie strony ----------
// conc = jednostki/ml; zwraca ml/h z dawki/h i odwrotnie
function mlh(dosePerH,conc){return dosePerH/conc;}
function perH(mlPerH,conc){return mlPerH*conc;}
// KCl: mmol do podania, objętość końcowa (ml), szybkość mmol/h, K⁺ surowicy, dostęp ('per'|'cvc')
function kcl(i){if(!(i.mmol>0&&i.vol>0&&i.rate>0))return null;var o={warn:[],bad:false};
 o.ml15=i.mmol/P.kcl15;o.amp=Math.ceil(o.ml15/10);o.conc=i.mmol/i.vol*1000;o.cml=i.mmol/i.vol;o.mlh=mlh(i.rate,o.cml);o.hours=i.mmol/i.rate;o.min=o.hours*60;
 o.maxRate=(i.k>0&&i.k<3)?20:10;o.rise=i.mmol/10*0.1;
 if(o.conc>40+1e-9){o.bad=true;o.warn.push('Stężenie '+fmt(o.conc)+' mmol/l > 40 mmol/l (ChPL – obwodowo i centralnie). Zwiększ objętość.');}
 if(i.rate>o.maxRate+1e-9){if(o.maxRate===20&&i.rate<=40)o.warn.push('> 20 mmol/h – ChPL: tylko „w uzasadnionych przypadkach” do 40 mmol/h (K⁺ <3, EKG, niedowład): ciągłe EKG – DO DECYZJI LEKARZA.');else{o.bad=true;o.warn.push('Szybkość '+fmt(i.rate)+' mmol/h > '+o.maxRate+' mmol/h (ChPL przy K⁺ '+(o.maxRate===20?'<3':'≥3')+').');}}
 if(i.mmol>200)o.warn.push('> 200 mmol/dobę – ChPL: tylko w uzasadnionych przypadkach.');
 if(i.line==='cvc')o.warn.push('Cewnik centralny: ChPL – unikać, nie podawać szybko (ryzyko zatrzymania krążenia). Stężone roztwory KCl przez CVC wg protokołu OIT – DO DECYZJI LEKARZA.');
 return o;}
function kclFromMlh(mlPerH,mmol,vol){return perH(mlPerH,mmol/vol);} // mmol/h
// MgSO4 20%: g, objętość końcowa ml, czas min
function mgso4(i){if(!(i.g>0&&i.vol>0&&i.min>0))return null;var o={warn:[],bad:false};o.ml20=i.g/P.mgso4;o.amp=Math.ceil(o.ml20/10);o.mmol=i.g*P.mgMmolPerG;o.meq=i.g*P.mgMeqPerG;o.gph=i.g/(i.min/60);o.mlh=i.vol/(i.min/60);o.mgmin=i.g*1000/i.min;
 if(o.ml20>i.vol+1e-9){o.bad=true;o.warn.push('Objętość końcowa mniejsza niż objętość MgSO₄.');}
 if(!i.tdp&&o.gph>2+1e-9)o.warn.push('> 2 g/h – ChPL Kalceks (hipomagnezemia): maks. 2 g/h. W TdP/NZK dopuszczalny bolus 2 g – DO DECYZJI LEKARZA.');
 if(o.mgmin>300+1e-9&&!i.tdp){o.bad=true;o.warn.push('> 300 mg/min – powyżej szybkości wstrzyknięcia z ChPL Kalceks (1,5 ml/min 20%).');}
 return o;}
// STANDARD LOKALNY – zatwierdzony przez lekarza (27.10.2026): bolus hipertoniczny
// 5 amp. NaCl 10% Polpharma (RPL 3080: amp. 10 ml) = 50 ml (5 g NaCl ≈ 85,5 mmol Na) + 100 ml G5% = 150 ml ≈ 3,3% (≈570 mmol/l).
// Ampułki 10 ml potwierdzone w ChPL 6.5. Adrogué–Madias: Na_płynu = 570 mmol/l.
var NACL_LOK={ml10:50,amps:5,g:5,mmolNa:50*P.nacl10,g5:100,total:150,pct:50*0.10/150*100,mmolPerL:50*P.nacl10/0.150};
function naclLok(){return{ml10:NACL_LOK.ml10,amps:NACL_LOK.amps,g:NACL_LOK.g,mmolNa:NACL_LOK.mmolNa,g5:NACL_LOK.g5,total:NACL_LOK.total,pct:NACL_LOK.pct,mmolPerL:NACL_LOK.mmolPerL,label:'STANDARD LOKALNY – zatwierdzony przez lekarza'};}
function nacl3mix(vol){ // legacy (bilans masy 3%) – zostawione do testów porównawczych, nie używane w UI
 var x=vol*(0.03-0.009)/(0.10-0.009);return{ml10:x,ml09:vol-x,mmolNa:vol*P.nacl3};}
// ---------- sód ----------
function tbwF(sex,age){var old=age>=65;return sex==='f'?(old?0.45:0.5):sex==='m'?(old?0.5:0.6):(old?0.45:0.5);}
function adrogue(na,inf,tbw){return(inf-na)/(tbw+1);} // zmiana Na⁺ po 1 l płynu
function waterDef(na,tbw){return tbw*(na/140-1);}
// ---------- wapń ----------
function caCorr(caMmol,albGl){return albGl>0?caMmol+0.02*(40-albGl):caMmol;} // = mg/dl: Ca + 0,8×(4 − alb g/dl)
// ---------- główne obliczenie ----------
function G(k,t){return{t:'W',k:k,txt:t};}function C(k,t){return{t:'C',k:k,txt:t};}
var DIS=[['hiperK','Hiperkaliemia','K⁺ ↑'],['hipoK','Hipokaliemia','K⁺ ↓'],['hipoNa','Hiponatremia','Na⁺ ↓'],['hiperNa','Hipernatremia','Na⁺ ↑'],['hipoMg','Hipomagnezemia','Mg ↓'],['hiperMg','Hipermagnezemia','Mg ↑'],['hipoCa','Hipokalcemia','Ca ↓'],['hiperCa','Hiperkalcemia','Ca ↑'],['hipoP','Hipofosfatemia','P ↓']];
function compute(st){var w=st.w,wc=checkWeight(w),W=(wc==='ok'||wc==='amber')?w:NaN,L=st.lab||{},o=st.opt||{},f=fmt;
 var R={weight:wc,W:W,dis:st.dis,lvl:'ok',val:null,steps:[],mon:[],ctl:[],flags:[],disc:[]};
 var tbw=W>0?W*tbwF(st.sex,st.age):NaN;R.tbw=tbw;
 var d=st.dis;
 if(d==='hiperK'){var k=L.k;if(!(k>0&&k<12))return R;R.val=f(k)+' mmol/l';
  R.sev=k>=6.5?'ciężka (≥6,5)':k>=6?'umiarkowana (6,0–6,4)':k>5.5?'łagodna (5,5–5,9)':'brak hiperkaliemii (≤5,5)';
  R.lvl=(k>=6.5||o.ecg||o.arrest)?'red':k>=6?'orange':'ok';
  var ecg=o.ecg||o.arrest;
  if(ecg){R.steps.push({t:'1. Ochrona serca – wapń (zmiany EKG)',k:'red',items:[
   {name:'Calcium chloratum WZF 67 mg/ml (0,46 mmol/ml)',main:'STANDARD LOKALNY: 20 ml = 9,2 mmol Ca (≥ 9,2 min, ≤1 mmol/min)',lok:true,calc:{ml:20,mmol:20*P.cacl,min:20*P.cacl,mlh:null},rows:[['Dawka lokalna','20 ml (2 amp. × 10 ml) = 9,2 mmol Ca – STANDARD LOKALNY – zatwierdzony przez lekarza'],['Czas (ChPL)','≤1 mmol Ca/min → ≥ 9,2 min (przy 9,2 mmol); ciągłe EKG'],['ChPL 4.2','5–10 ml (2,3–4,6 mmol) bardzo powoli; hiperkaliemia z EKG – tylko pod kontrolą EKG; lokalnie przyjęto 20 ml'],['Dostęp','ChPL: tylko duże żyły lub centralnie; rozcieńczenie zalecane; martwica przy wynaczynieniu'],['Powtórzenie','po 5–10 min, jeśli EKG bez poprawy; działa 30–60 min, NIE obniża K⁺'],['Źródło porównawcze','ERC 2025: 10 ml 10% CaCl₂ (zagraniczny, 6,8 mmol) w 5 min – u nas inny preparat']],
    src:[C('CACL','0,46 mmol/ml; 5–10 ml bardzo powoli, ≤1 mmol/min; duże/centralne żyły.'),G('ERC','10 ml 10% CaCl₂ i.v. w 5 min (preparat zagraniczny – informacja źródłowa).')]},
   {name:'Glukonian wapnia 10% (Calcium Gluconate hameln / Calsiosol, 0,22 mmol/ml)',main:'STANDARD LOKALNY: 10–20 ml (2,2–4,4 mmol) w 10 min wg ChPL',lok:true,calc:{mlLo:10,mlHi:20,mmolLo:10*P.caglu,mmolHi:20*P.caglu,min:10},rows:[['Dawka lokalna','10–20 ml w 10 min (nierozc. lub w 50–100 ml G5%/NaCl 0,9%) – STANDARD LOKALNY – zatwierdzony przez lekarza (wg ChPL)'],['Limit ChPL','maks. 50 ml/24 h (hameln) / 46 ml/24 h (Calsiosol)'],['Dostęp','obwodowo – można (izotoniczny)'],['Powtórzenie','po 5–10 min wg EKG'],['Źródło porównawcze','ERC/UKKA: 30 ml 10% w 10 min (informacja źródłowa; lokalnie nie stosujemy jako domyślnej)']],
    src:[C('CAGH','10–20 ml w 10 min; maks. 50 ml/24 h.'),C('CAGC','10–20 ml w 10 min; maks. 46 ml/24 h.'),G('ERC','30 ml 10% w 10 min, gdy CaCl₂ niedostępny (informacja źródłowa).'),G('UKKA','30 ml 10% w 10 min (informacja źródłowa).')]}]});}
  if(k>=6||o.ecg||o.arrest){var lowG=L.glu>0&&L.glu<7;
   R.steps.push({t:(ecg?'2':'1')+'. Przesunięcie K⁺ do komórek',k:'orange',items:[
   {name:'Insulina rozpuszczalna (Actrapid / Humulin R fiolka 100 j./ml) + glukoza',main:'10 j. i.v. + glukoza 25 g w 15 min',calc:{u:10,g:25,ml10:250,ml20:125,ml40:62.5},rows:[['Insulina','10 j. = 0,1 ml z fiolki 100 j./ml (rozcieńcz, np. do 10 ml NaCl 0,9% → 1 j./ml)'],['Glukoza 25 g','250 ml G10% LUB 125 ml G20% w 15 min (ERC); 62,5 ml G40% – tylko duża żyła'],['Glikemia przed','<7 mmol/l (126 mg/dl) → następnie G10% 50 ml/h przez 5 h (25 g)'+(lowG?' ← DOTYCZY':'')],['Efekt','↓K⁺ o 0,7–1,4 mmol/l w 15–30 min, trwa 4–6 h'],['Monitorowanie','glikemia co 30–60 min przez ≥6 h (hipoglikemia do 28%)']],
    src:[G('ERC','10 j. insuliny + 25 g glukozy i.v.; G10% 50 ml/h × 5 h przy glikemii <7 mmol/l.'),G('UKKA','10 j. + 25 g glukozy w 15 min; glikemia przez 6 h.'),C('ACT','Actrapid – możliwe podanie i.v.; hiperkaliemia nie jest wskazaniem ChPL (poza ChPL).')]},
   {name:'Salbutamol w nebulizacji (Ventolin 2 mg/ml / 1 mg/ml)',main:'10–20 mg = 5–10 ml roztworu 2 mg/ml',rows:[['Dawka','10–20 mg nebulizacja (tylko dodatek do insuliny, nigdy sam)'],['Efekt','↓K⁺ ok. 0,9 mmol/l w 120 min'],['Uwaga','słabiej przy β-blokerach nieselektywnych, ESRD; tachykardia']],src:[G('ERC','10–20 mg neb jako dodatek do insuliny-glukozy.'),C('SAL','Wskazania ChPL: obturacja oskrzeli – hiperkaliemia poza ChPL.')]}]});
   if(o.acid||o.arrest)R.steps.push({t:'NaHCO₃ – tylko kwasica / NZK',k:'orange',items:[{name:'Natrium bicarbonicum 8,4% (1 mmol/ml, amp. 20 ml)',main:'50 mmol = 50 ml (ERC: NZK)',calc:{mmol:50,ml:50},rows:[['NZK','50 mmol i.v. osobną linią / po przepłukaniu (wytrąca się z wapniem)'],['Kwasica bez NZK','dawka wg BE: mmol = BE × masa × 0,3 (ChPL)'+(W>0&&L.be<0?' = '+f(Math.abs(L.be)*W*0.3)+' mmol; podaj początkowo 33–50%':'')+' – DO DECYZJI LEKARZA'],['Dostęp','ChPL: wlew rozcieńczony 1:1 G5% przez cewnik żylny']],src:[G('ERC','NZK z hiperkaliemią: 10 ml CaCl₂ + 50 mmol NaHCO₃.'),G('UKKA','nie rutynowo; rozważ przy kwasicy (sugestia 2C).'),C('BIC','1 ml = 1 mmol; dawka = BE × m.c. × 0,3; NZK ≤1 mEq/kg.')]}]});}
  if(k>5.5)R.steps.push({t:'Usunięcie K⁺',k:'ok',items:[{name:'Cyklokrzemian sodowo-cyrkonowy (Lokelma)',main:'10 g doustnie (ERC); ChPL 10 g 3×/d do 72 h',rows:[['Dawka','10 g p.o.; ChPL: 10 g 3×/dobę, maks. 72 h'],['Działanie','po 1–6 h']],src:[G('ERC','10 g doustnie.'),C('LOK','10 g 3×/d do 72 h (korekcja).')]},{name:'Diuretyk pętlowy',main:'przy zachowanej diurezie i bez hipowolemii – dawka DO DECYZJI LEKARZA',rows:[['Uwaga','UKKA: tylko u chorych z przewodnieniem']],src:[G('UKKA','rozważ przy przewodnieniu.')]}]});
  if(k>=6){R.dialysis=['K⁺ ≥6,5 mmol/l oporne na leczenie zachowawcze (ERC 2025: „refractory severe hyperkalaemia”)','oliguria/anuria w AKI lub ESRD','ciężka kwasica metaboliczna (pH <7,15)','przewodnienie oporne na diuretyki','NZK z hiperkaliemią – rozważ ECPR wg lokalnego protokołu'];R.steps.push({t:'Wskazania do dializy – pilnie nefrolog',k:'red',list:R.dialysis,src:[G('ERC','dializa przy opornej ciężkiej hiperkaliemii.'),G('KDIGO','RRT przy zagrażającej życiu hiperkaliemii/kwasicy/przewodnieniu opornych na leczenie.')]});}
  R.mon=['EKG ciągłe przy K⁺ ≥6,0 lub zmianach EKG','glikemia co 30–60 min przez 6 h po insulinie','bilans płynów, diureza'];
  R.ctl=['K⁺ po 1, 2, 4, 6 i 24 h (UKKA)','zmiany w EKG po każdej dawce wapnia','odstaw leki: ACEI/ARB/MRA, NLPZ, suplementy K⁺, trimetoprim, heparyna'];
  if(o.dig)R.flags.push('Digoksyna: wapń ostrożnie (wolny wlew w 20–30 min) – DO DECYZJI LEKARZA.');}
 else if(d==='hipoK'){var k=L.k;if(!(k>0&&k<8))return R;R.val=f(k)+' mmol/l';
  R.sev=k<2.5?'ciężka (<2,5)':k<3?'umiarkowana (2,5–2,9)':k<3.5?'łagodna (3,0–3,4)':'brak hipokaliemii';
  R.lvl=(k<2.5||o.ecg)?'red':k<3.5?'orange':'ok';if(k>=3.5)return R;
  var hi=k<3,rate=hi?20:10,mm=hi?40:20,vol=hi?1000:500;
  var kc=kcl({mmol:mm,vol:vol,rate:rate,k:k,line:o.cvc?'cvc':'per'});R.kcl={mmol:mm,vol:vol,rate:rate};
  if(k>=3&&!o.ecg)R.steps.push({t:'Preferuj doustnie',k:'ok',text:'K⁺ 3,0–3,4 bez zmian EKG/niedowładu: potas doustnie, jeśli przewód pokarmowy sprawny (dawka wg preparatu doustnego).'});
  R.steps.push({t:'KCl i.v. (Kalium chloratum WZF 15% – 2 mmol/ml; amp. 10 ml = 20 mmol)',k:hi?'red':'orange',items:[{name:'KCl 15% rozcieńczony do ≤40 mmol/l',main:f(mm)+' mmol = '+f(kc.ml15)+' ml KCl 15% → do '+vol+' ml; '+rate+' mmol/h = '+f(kc.mlh)+' ml/h przez '+f(kc.hours)+' h',edit:'kcl',calc:kc,rows:[['Rozcieńczenie','ChPL: 10 ml (20 mmol) do 500 ml lub 20 ml (40 mmol) do 1000 ml (= 40 mmol/l); NaCl 0,9%, G5%, Ringer, PWE'],['Szybkość obwodowo','K⁺ ≥3: ≤10 mmol/h; K⁺ <3 z EKG/niedowładem: 20 mmol/h (uzasadnione – 40 mmol/h, ciągłe EKG)'],['Centralnie','ChPL: unikać, nie szybko (zatrzymanie krążenia). Stężenie wyższe niż 40 mmol/l nie jest w ChPL – DO DECYZJI LEKARZA (protokół OIT)'],['Dobowo','≤200 mmol (więcej tylko w uzasadnionych przypadkach)'],['Efekt','10 mmol ≈ +0,1 mmol/l → ta dawka ≈ +'+f(kc.rise)+' mmol/l'],['Zużyć','w ciągu 6 h od przygotowania; niezgodny m.in. z dobutaminą']],src:[C('KCL','≤40 mmol/l; ≤10 mmol/h (K⁺ >3), 20 (wyj. 40) mmol/h (K⁺ <3); ≤200 mmol/d; unikać CVC; 10 mmol ≈ +0,1 mmol/l.')]}]});
  R.steps.push({t:'Magnez',k:'ok',text:'Hipokaliemia oporna – oznacz i uzupełnij Mg (ChPL KCl: niedobór Mg uzupełniać równolegle).'});
  R.mon=['EKG ciągłe przy >10 mmol/h lub K⁺ <3','miejsce wkłucia (ból, zapalenie żyły)'];R.ctl=['K⁺ po każdych 20–40 mmol (co 1–2 h przy szybkiej podaży)','Mg, glikemia, pH (alkaloza nasila hipoK)'];
  if(o.dka)R.flags.push('DKA/HHS: insulina dopiero przy K⁺ ≥3,5 (moduł DKA/HHS).');}
 else if(d==='hipoNa'){var na=L.na;if(!(na>=90&&na<=180))return R;R.val=f(na)+' mmol/l';
  if(L.glu>0){var ex=Math.max(0,L.glu*18.016-100);R.naCorr=na+1.6*ex/100;R.flags.push('Glikemia '+f(L.glu*18.016)+' mg/dl: Na⁺ skorygowane (Katz 1,6) = '+f(R.naCorr)+' mmol/l (Hillier 2,4: '+f(na+2.4*ex/100)+').');if(R.naCorr>=135){R.sev='hiponatremia translokacyjna';R.lvl='orange';R.steps.push({t:'NIE lecz solą',k:'red',text:'Na⁺ skorygowane ≥135 – lecz hiperglikemię (moduł DKA/HHS).'});return R;}}
  var ne=R.naCorr||na;R.sev=ne<125?'ciężka (<125)':ne<130?'umiarkowana (125–129)':ne<135?'łagodna (130–134)':'brak';if(ne>=135)return R;
  R.lvl=(o.sympt==='severe'||ne<125)?'red':(o.sympt==='mod'||ne<130)?'orange':'ok';
  R.limit=o.odsRisk?8:10;
  if(W>0){R.naclInf=P.naclLok;R.d3=adrogue(ne,P.naclLok,tbw);R.d09=adrogue(ne,154,tbw);R.bolusRise=R.d3*0.15;R.mix=naclLok();}
  var mix=R.mix||naclLok();
  var bolus={name:'Bolus hipertoniczny NaCl (STANDARD LOKALNY)',main:'5 amp. NaCl 10% (50 ml) + 100 ml G5% = 150 ml ≈ 3,3% (≈570 mmol/l, '+f(mix.mmolNa)+' mmol Na) w 20 min = 450 ml/h'+(W>0?'; przewidywany wzrost ≈ +'+f(R.bolusRise)+' mmol/l (Adrogué–Madias przy 570 mmol/l)':''),lok:true,calc:{ml:150,min:20,mlh:450,mmol:mix.mmolNa,pct:mix.pct,mmolPerL:mix.mmolPerL,ml10:mix.ml10,amps:mix.amps,g5:mix.g5},rows:[['Przygotowanie – STANDARD LOKALNY','5 amp. Inj. Natrii chlorati 10% Polpharma (RPL 3080: amp. 10 ml) = 50 ml (5 g NaCl ≈ '+f(mix.mmolNa)+' mmol Na⁺) + 100 ml glukozy 5% = 150 ml; stężenie ≈ '+f(mix.pct)+'% (≈'+f(mix.mmolPerL)+' mmol/l) – zatwierdzony przez lekarza'],['Czas','150 ml w 20 min = 450 ml/h (ESE 2014; ChPL NaCl 10% mówi ≤100 ml/h przy zatruciu wodnym – lokalnie przyjęto schemat ESE)'],['Alternatywa masy','2 ml/kg'+(W>0?' = '+f(2*W)+' ml':'')+' (nietypowa masa ciała, ESE) – DO DECYZJI LEKARZA'],['Dostęp','obwodowo dopuszczalne (wytyczne); NaCl 10% nigdy nierozcieńczony (ChPL)'],['Powtórzenie','objawy ciężkie: do 2× (łącznie 3 bolusy w 1. h) do +5 mmol/l (ESE)']],
   src:[G('ESE','ciężkie objawy: 150 ml hipertonicznego NaCl w 20 min, Na⁺ po 20 min, powtórz 2× do +5 mmol/l; limit 10 mmol/l w 1. dobie, potem 8/dobę.'),C('NACL','amp. 10 ml; 3% NaCl = 0,51 mmol/ml; ChPL: ≤100 ml/h (zatrucie wodne); wzrost ≤12 mmol/l/24 h.')]};
  if(o.sympt==='severe')R.steps.push({t:'Objawy ciężkie (drgawki, GCS ≤8, wymioty, zaburzenia oddychania)',k:'red',items:[bolus]});
  else if(o.sympt==='mod')R.steps.push({t:'Objawy umiarkowane – jednorazowo 150 ml 3% w 20 min (ESE)',k:'orange',items:[bolus]});
  else R.steps.push({t:'Bez objawów ciężkich – lecz przyczynę wg wolemii',k:'ok',text:o.vol==='hypo'?'Hipowolemia: 0,9% NaCl / płyn zbilansowany 0,5–1 ml/kg/h'+(W>0?' (= '+f(0.5*W)+'–'+f(W)+' ml/h)':'')+' (ESE); 1 l 0,9% NaCl zmieni Na⁺ o ≈ '+(W>0?f(R.d09):'—')+' mmol/l. Po wyrównaniu wolemii możliwa diureza wodna – szybki wzrost Na⁺.':o.vol==='eu'?'Euwolemia (SIADH): NIE sól; ograniczenie płynów, odstaw leki (ESE).':o.vol==='hyper'?'Hiperwolemia: NIE sól; ograniczenie płynów/Na, leczenie przyczyny.':'Oceń wolemię – bez tego nie podawaj soli.'});
  R.steps.push({t:'Limity korekty – STANDARD LOKALNY (ESE 2014)',k:'red',lok:true,text:'Cel +5 mmol/l w 1. dobie (bolusy: +5 w 1. h). LIMIT zatwierdzony: ≤'+R.limit+' mmol/l w 24 h'+(o.odsRisk?' (ryzyko ODS)':'')+', potem ≤8 mmol/l/dobę (ESE/ESICM/ERBP 2014). ChPL NaCl 10% podaje ≤12 mmol/l/24 h – lokalnie obowiązuje limit wytycznych. Ryzyko ODS: Na⁺ ≤105, hipoK, alkoholizm, niedożywienie, choroba wątroby.'});
  R.steps.push({t:'Przekroczenie limitu (ODS)',k:'orange',text:'Zatrzymaj leczenie podnoszące Na⁺; rozważ 10 ml/kg'+(W>0?' (= '+f(10*W)+' ml)':'')+' G5% w 1 h + desmopresyna 2 µg i.v. nie częściej niż co 8 h (ESE) – DO DECYZJI LEKARZA / konsultacja.'});
  R.mon=['Na⁺ po 20 min przy bolusach, potem co 4 h w czasie 3% NaCl','diureza godzinowa (>100 ml/h rozcieńczonego moczu = ryzyko przekroczenia limitu)','GCS, objawy neurologiczne'];R.ctl=['Na⁺ po 1, 6, 12 h, potem codziennie (ESE)','K⁺, glikemia, osmolalność surowicy i moczu, Na w moczu'];
  R.formula='Δ Na⁺ po 1 l = (Na płynu − Na⁺) / (TBW + 1); TBW = masa × '+tbwF(st.sex,st.age)+(W>0?' = '+f(tbw)+' l':'')+'; bolus lokalny: Na płynu = 570 mmol/l';}
 else if(d==='hiperNa'){var na=L.na;if(!(na>145&&na<=200))return R;R.val=f(na)+' mmol/l';
  R.sev=na>=160?'ciężka (≥160)':na>=150?'umiarkowana (150–159)':'łagodna (146–149)';R.lvl=na>=160?'red':'orange';
  if(W>0){R.wd=waterDef(na,tbw);R.d5=adrogue(na,0,tbw);R.d045=adrogue(na,77,tbw);var tgt=o.acute?Math.min(24,na-145):Math.min(10,na-145);R.target=tgt;R.vol5=tgt/(-R.d5)*1000;R.mlh5=R.vol5/24;}
  if(o.shock)R.steps.push({t:'Najpierw wstrząs / hipowolemia',k:'red',text:'0,9% NaCl / płyn zbilansowany do stabilizacji, dopiero potem płyny hipotoniczne.'});
  R.steps.push({t:'Niedobór wody i plan',k:'orange',items:[{name:'Glukoza 5% (woda wolna) lub 0,45% NaCl; woda p.o./sondą jeśli możliwe',main:W>0?('Niedobór wody ≈ '+f(R.wd)+' l; 1 l G5% ↓Na⁺ o '+f(-R.d5)+' mmol/l → ↓'+f(R.target)+' mmol/l/24 h = '+f(R.vol5)+' ml G5% = '+f(R.mlh5)+' ml/h + bieżące straty'):'Wpisz masę ciała',calc:W>0?{wd:R.wd,vol:R.vol5,mlh:R.mlh5}:null,rows:[['Wzór','niedobór wody = TBW × (Na/140 − 1); Δ Na⁺ = (Na płynu − Na⁺)/(TBW + 1)'],['Tempo','przewlekła/nieznana: ≤0,5 mmol/l/h i ≤10 mmol/l/24 h; ostra (<48 h): do 1 mmol/l/h – DO DECYZJI LEKARZA'],['0,45% NaCl','1 l ↓Na⁺ o '+(W>0?f(-R.d045):'—')+' mmol/l'],['Uwaga','G5% → hiperglikemia; dodać bieżące straty (diureza, gorączka, biegunka)']],src:[G('AM','Adrogué–Madias: niedobór wody, zmiana Na⁺ po 1 l; ≤10 mmol/l/24 h w przewlekłej.')]}]});
  R.mon=['Na⁺ co 2–4 h (ostra co 1–2 h)','glikemia przy G5%','diureza, bilans, GCS'];R.ctl=['Na⁺ po 2–4 h – koryguj szybkość','moczówka prosta? (osmolalność moczu, diureza)'];}
 else if(d==='hipoMg'||d==='hiperMg'){var mg=L.mg>0?toMmol('mg',L.mg,L.mgu):NaN;if(!(mg>0&&mg<5))return R;R.val=both('mg',mg);
  if(d==='hipoMg'){R.sev=mg<0.4?'ciężka (<0,4 mmol/l = <0,97 mg/dl)':mg<0.7?'umiarkowana/łagodna (<0,7 mmol/l = <1,7 mg/dl)':'brak hipomagnezemii';R.lvl=(mg<0.4||o.tdp)?'red':mg<0.7?'orange':'ok';
   if(o.tdp){var t=mgso4({g:2,vol:10,min:2,tdp:true});R.steps.push({t:'Torsade de pointes',k:'red',items:[{name:'MgSO₄ 20% (Polpharma / Kalceks 200 mg/ml)',main:'STANDARD LOKALNY: 2 g = 10 ml = 8,1 mmol (16 mEq) w 2–3 min',lok:true,calc:Object.assign(t,{min:2.5}),rows:[['Bolus – STANDARD LOKALNY','2 g (10 ml 20%) i.v. w 2–3 min – zatwierdzony przez lekarza (ChPL Kalceks; Polpharma: 5–20 min – lokalnie 2–3 min)'],['Wlew','Kalceks: 2–4 mg/min (= 0,12–0,24 g/h); nawrót – kolejne 2 g i 6–8 mg/min; Polpharma: 0,5–1 g/h'],['Dodatkowo','K⁺ do 4,5–5,0, odstaw leki wydłużające QT'],['Źródło porównawcze','ERC 2021: 2 g w 10 min (informacja źródłowa)']],src:[C('MGK','TdP: 2 g w 2–3 min, wlew 2–4 mg/min.'),C('MGP','arytmie: 1–2 g w 5–20 min (bez tętna) / 5–60 min (z tętnem), potem 0,5–1 g/h (informacja).'),G('ERC21','TdP: MgSO₄ 2 g i.v. w 10 min (informacja źródłowa).')]}]});}
   if(mg<0.7){var sev=mg<0.4||o.sympt;var a=mgso4({g:2,vol:100,min:60}),b=mgso4({g:5,vol:1000,min:180});
    R.steps.push({t:sev?'Ciężka/objawowa – MgSO₄ i.v.':'Bezobjawowa – preferuj doustnie; i.v. wolno',k:sev?'red':'orange',items:[{name:'MgSO₄ 20% (200 mg/ml; 1 g = 5 ml = 4,1 mmol = 8,1 mEq)',main:'np. 2 g (10 ml) w 100 ml w 1 h = 100 ml/h; ChPL Polpharma: 5 g (25 ml) w 1 l w 3 h = '+f(b.mlh)+' ml/h',edit:'mg',calc:{a:a,b:b},rows:[['ChPL Kalceks','1. doba 8–12 g, następnie 4–6 g/d przez 3–4 dni; maks. 2 g/h; bolus ≤300 mg/min (1,5 ml/min); cel Mg >0,4 mmol/l'],['ChPL Polpharma','ostry niedobór: 5 g w 1 l G5%/NaCl 0,9% w 3 h lub i.m. 250 mg/kg'+(W>0?' (= '+f(0.25*W)+' g)':'')+' co >4 h'],['BNF','ciężka: do 160 mmol (≈40 g) w 5 dni; ostra: 35–50 mmol w 12–24 h'],['Dostęp','obwodowo – rozcieńczony'],['Nerki','zmniejsz dawki; ciężka NN: 20 g/48 h (Polpharma); Kalceks: przeciwwskazany w ciężkiej NN bez dializy'+(st.crcl>0&&st.crcl<30?' ← CLkr <30':'')]],
     disc:'Schematy ChPL (8–12 g/1. doba; 5 g w 3 h) i BNF (35–50 mmol = 8,6–12 g w 12–24 h) – zgodne co do ilości, różne co do tempa; wybór schematu DO DECYZJI LEKARZA.',src:[C('MGK','8–12 g w 1. dobie, maks. 2 g/h.'),C('MGP','5 g w 1 l w 3 h; dawki ↓ w NN.'),G('BNF','35–50 mmol w 12–24 h.')]}]});}
   R.mon=['odruchy kolanowe (zanik = przedawkowanie)','oddech ≥16/min, RR, diureza ≥100 ml/4 h','glukonian wapnia pod ręką (antidotum)'];R.ctl=['Mg po zakończeniu wlewu i co 6–12 h','K⁺ i Ca (hipoMg → oporna hipoK/hipoCa)'];}
  else{R.sev=mg>2.5?'ciężka (>2,5 mmol/l = >6 mg/dl)':mg>1.05?'hipermagnezemia (>1,05 mmol/l = >2,55 mg/dl)':'brak hipermagnezemii';R.lvl=mg>2.5||o.sympt?'red':mg>1.05?'orange':'ok';if(mg<=1.05)return R;
   R.steps.push({t:'Odstaw magnez; antagonizm wapniem przy objawach',k:'red',items:[{name:'Glukonian wapnia 10% (0,22 mmol/ml)',main:'10–20 ml (2,2–4,4 mmol) w 10 min',calc:{ml:10,mmol:2.2,min:10},rows:[['ChPL MgSO₄ Kalceks','antidotum: 1 g glukonianu wapnia (≈10 ml) dostępny przy wlewie'],['Alternatywa','Calcium chloratum WZF 5–10 ml (2,3–4,6 mmol) powoli, duża żyła (ChPL: zatrucie MgSO₄ – 5 ml)'],['Objawy','zanik odruchów, hipotensja, bradykardia, depresja oddechowa']],src:[C('MGK','1 g glukonianu wapnia jako antidotum.'),C('CACL','zatrucie siarczanem magnezu: 5 ml (2,3 mmol), można powtarzać.'),C('CAGH','10–20 ml w 10 min.')]}]});
   R.steps.push({t:'Usunięcie Mg',k:'orange',text:'Nawodnienie 0,9% NaCl i diuretyk pętlowy przy zachowanej funkcji nerek (dawki DO DECYZJI LEKARZA); NN / ciężka hiperMg → dializa (nefrolog).'});
   R.mon=['EKG, odruchy, oddech, RR'];R.ctl=['Mg co 4–6 h; Ca po wapniu'];}}
 else if(d==='hipoCa'||d==='hiperCa'){var ca=L.ca>0?toMmol('ca',L.ca,L.cau):NaN;if(!(ca>0&&ca<6))return R;var alb=L.alb>0?(L.albu==='gdl'?L.alb*10:L.alb):NaN;
  L.ion=L.ion||o.ion;var cc=L.ion?ca:caCorr(ca,alb);R.caC=cc;R.val=(L.ion?'Ca²⁺ zjonizowany ':'Ca całkowity ')+both('ca',ca)+(alb>0&&!L.ion?' → skorygowany '+both('ca',cc)+' (alb. '+f(alb/10)+' g/dl)':'');
  if(d==='hipoCa'){var lo=L.ion?1.0:1.9,lo2=L.ion?1.15:2.1;R.sev=cc<lo?'ciężka':cc<lo2?'łagodna':'brak hipokalcemii';R.lvl=(cc<lo||o.sympt)?'red':cc<lo2?'orange':'ok';
   if(cc<lo||o.sympt){R.steps.push({t:'Bolus i.v. – objawy (tężyczka, drgawki, skurcz krtani, QT↑) lub Ca skor. <1,9 mmol/l (<7,6 mg/dl)',k:'red',items:[{name:'Glukonian wapnia 10% (Calcium Gluconate hameln / Calsiosol, 0,22 mmol/ml)',main:'10–20 ml (2,2–4,4 mmol) w 10 min, z EKG',calc:{ml:20,mmol:20*P.caglu,min:10,mlh:120},rows:[['Podanie','nierozcieńczony lub w 50–100 ml G5%/NaCl 0,9% w 10 min (ChPL); obwodowo'],['Limit ChPL','maks. 50 ml/24 h (hameln) / 46 ml/24 h (Calsiosol)'],['Niezgodności','nie mieszać z wodorowęglanem, fosforanami (wytrącanie); ceftriakson']],src:[G('SFE','10–20 ml 10% w 50–100 ml G5% w 10 min; powtarzać do ustąpienia objawów.'),C('CAGH','10–20 ml w 10 min; maks. 50 ml/24 h.')]},
    {name:'Wlew podtrzymujący glukonianu wapnia',main:'SfE: 100 ml 10% w 1 l NaCl 0,9%/G5% – 50–100 ml/h',calc:{mlh:50,caMmolH:50*100*P.caglu/1100},rows:[['Zawartość','100 ml 10% = 22 mmol Ca w 1100 ml → 50 ml/h ≈ '+f(50*22/1100)+' mmol Ca/h'+(W>0?' (≈'+f(50*22/1100*40.08/W)+' mg/kg/h)':'')],['Rozbieżność','ChPL: maks. 46–50 ml/24 h (glin) – schemat SfE przekracza ChPL']],disc:'SfE 2016 (100 ml/wlew) vs ChPL (≤46–50 ml/24 h) – DO DECYZJI LEKARZA.',src:[G('SFE','100 ml 10% w 1 l, 50–100 ml/h, do normokalcemii.'),C('CAGC','maks. 46 ml (10,12 mmol)/24 h.')]},
    {name:'Calcium chloratum WZF 67 mg/ml (0,46 mmol/ml) – alternatywa',main:'5–10 ml (2,3–4,6 mmol) bardzo powoli, ≤1 mmol/min, duża żyła/CVC',rows:[['ChPL','kolejna dawka po 1–3 dniach wg Ca; rozcieńczenie zalecane; martwica przy wynaczynieniu']],src:[C('CACL','5–10 ml bardzo powoli; ≤1 mmol/min; duże/centralne żyły.')]}]});}
   else R.steps.push({t:'Bez objawów – doustnie',k:'ok',text:'Wapń doustnie + wit. D/kalcytriol wg przyczyny (dawki DO DECYZJI LEKARZA); oznacz Mg, PTH, 25-OH-D, P, kreatyninę.'});
   R.steps.push({t:'Magnez',k:'orange',text:'Hipomagnezemia → hipokalcemia oporna: oznacz i uzupełnij Mg.'});
   R.mon=['EKG ciągłe w czasie bolusa (digoksyna – ostrożnie)','miejsce wkłucia'];R.ctl=['Ca (najlepiej zjonizowany) co 4–6 h w czasie wlewu','Mg, P, K⁺'];}
  else{var hiL=L.ion?1.35:2.6;R.sev=cc>=3.5?'ciężka (≥3,5 mmol/l = ≥14 mg/dl)':cc>=3.0?'umiarkowana (3,0–3,4 = 12–13,9 mg/dl)':cc>hiL?'łagodna':'brak hiperkalcemii';R.lvl=(cc>=3.5||o.sympt)?'red':cc>=3?'orange':'ok';if(cc<=hiL)return R;
   R.steps.push({t:'1. Nawodnienie 0,9% NaCl',k:cc>=3?'red':'orange',text:'Wyrównaj odwodnienie 0,9% NaCl (SfE 2016); objętość i tempo wg wolemii, HF i funkcji nerek – DO DECYZJI LEKARZA. Diuretyk pętlowy tylko po nawodnieniu / przy przewodnieniu.'});
   if(cc>=3)R.steps.push({t:'2. Bisfosfonian (po nawodnieniu)',k:'orange',items:[{name:'Kwas zoledronowy 4 mg (Zometa i generyki)',main:'4 mg w 100 ml NaCl 0,9%/G5% w ≥15 min = 400 ml/h',calc:{mg:4,ml:100,min:15,mlh:400},rows:[['Wskazanie ChPL','hiperkalcemia w przebiegu nowotworu (Ca skor. ≥12 mg/dl = 3,0 mmol/l)'],['Nerki','ChPL: ocena kreatyniny przed dawką; w ciężkiej NN – ocena korzyść/ryzyko'],['Inne przyczyny','(nadczynność przytarczyc, wit. D, sarkoidoza) – leczenie przyczynowe, konsultacja – DO DECYZJI LEKARZA']],src:[C('ZOL','4 mg jednorazowo w ≥15 min w 100 ml.'),G('SFE','nawodnienie, następnie bisfosfonian i.v.')]}]});
   R.steps.push({t:'Odstaw',k:'ok',text:'Wapń, wit. D, tiazydy, lit; unieruchomienie ogranicz. Ciężka hiperkalcemia z NN/oligurią → dializa (nefrolog).'});
   R.mon=['EKG (QT↓, bradyarytmie)','bilans, diureza, oddech (przewodnienie)'];R.ctl=['Ca, kreatynina, K⁺, Mg po 6–12 h','PTH, PTHrP, 25-OH-D – diagnostyka']; }}
 else if(d==='hipoP'){var p=L.p>0?toMmol('p',L.p,L.pu):NaN;if(!(p>0&&p<5))return R;R.val=both('p',p);
  R.sev=p<0.32?'ciężka (<0,32 mmol/l = <1,0 mg/dl)':p<0.65?'umiarkowana (0,32–0,64 = 1,0–1,9 mg/dl)':p<0.8?'łagodna (0,65–0,79 = 2,0–2,4 mg/dl)':'brak hipofosfatemii';R.lvl=p<0.32?'red':p<0.8?'orange':'ok';if(p>=0.8)return R;
  if(W>0){var dose=(p<0.32||o.complex?0.16:0.08)*W,max=0.24*W,ml=dose/P.adpP,kmm=ml*P.adpK;R.adp={mmol:dose,ml:ml,k:kmm,max:max,vol:Math.max(500,Math.ceil(kmm/40*1000/100)*100)};R.adp.mlh=R.adp.vol/6;R.adp.kconc=kmm/R.adp.vol*1000;}
  R.steps.push({t:p<0.65?'Fosforany i.v.':'Preferuj doustnie; i.v. gdy brak możliwości',k:p<0.32?'red':'orange',items:[{name:'Addiphos (1 ml = 2 mmol P + 1,5 mmol K⁺ + 1,5 mmol Na⁺)',main:W>0?(f(R.adp.mmol)+' mmol P = '+f(R.adp.ml)+' ml Addiphos w '+R.adp.vol+' ml przez 6 h = '+f(R.adp.mlh)+' ml/h (K⁺ '+f(R.adp.k)+' mmol)'):'Wpisz masę ciała',calc:R.adp||null,rows:[['ChPL','krótkotrwała niepowikłana: 0,08 mmol/kg w 6 h; długotrwała/złożona: 0,16 mmol/kg; pojedyncza dawka ≤0,24 mmol/kg'+(W>0?' (= '+f(R.adp.max)+' mmol)':'')+'; bardzo ciężka: do 1,2 mmol/kg/24 h'],['Nie podawać nierozcieńczonego','potas w roztworze ≤40 mmol/l (jak KCl) → objętość dobrana automatycznie'],['Niezgodności','nie z wapniem w jednej linii (wytrącanie)'],['Nerki','NN / hiperkaliemia – ostrożnie lub Glycophos (bez K⁺) – DO DECYZJI LEKARZA']],src:[C('ADP','0,08 / 0,16 mmol/kg w 6 h; maks. 0,24 mmol/kg/dawkę.')]},
   {name:'Glycophos (1 ml = 1 mmol P + 2 mmol Na⁺) – bez potasu',main:'ChPL: tylko żywienie pozajelitowe (10–20 mmol/d) – w hipofosfatemii poza ChPL: DO DECYZJI LEKARZA',rows:[['Użycie','przy hiperkaliemii/NN zamiast Addiphos – dawka mmol P jak wyżej, ml = mmol']],src:[C('GLP','żywienie pozajelitowe 10–20 mmol/d; nie podawać nierozcieńczonego.')]}]});
  R.steps.push({t:'Zespół ponownego odżywienia',k:'ok',text:'Alkoholizm, niedożywienie, DKA w leczeniu: uzupełnij też K⁺, Mg, tiaminę (moduł Leki).'});
  R.mon=['Ca (hipokalcemia przy szybkiej podaży P)','K⁺ (Addiphos zawiera potas)'];R.ctl=['P, Ca, K⁺, Mg po zakończeniu wlewu (6 h) i codziennie'];}
 return R;}
var LOCAL=[
 'Bolus hipertoniczny NaCl: 5 amp. NaCl 10% (50 ml) + 100 ml G5% = 150 ml ≈ 3,3% (≈570 mmol/l); Adrogué–Madias przy 570 mmol/l.',
 'Hiperkaliemia: Calcium chloratum WZF 20 ml = 9,2 mmol Ca; czas ≥9,2 min (≤1 mmol/min, ChPL).',
 'Glukonian wapnia: 10–20 ml wg ChPL (ERC/UKKA 30 ml – tylko informacja źródłowa).',
 'Limity korekty Na⁺: ESE/ESICM/ERBP 2014 – 10 mmol/l/24 h (8 przy ryzyku ODS).',
 'MgSO₄ w TdP: bolus 2 g w 2–3 min.'];
var DECISIONS=[
 'Re-lowering po przekroczeniu limitu Na⁺ (G5% 10 ml/kg + desmopresyna 2 µg) – zgoda lekarza/konsultacja.',
 'KCl przez cewnik centralny w stężeniu >40 mmol/l – brak w ChPL (protokół OIT).',
 'KCl 20–40 mmol/h – ChPL „w uzasadnionych przypadkach”.',
 'Schemat hipomagnezemii (Kalceks 8–12 g/1. doba vs Polpharma 5 g w 3 h vs BNF 35–50 mmol/12–24 h).',
 'NaHCO₃ w hiperkaliemii bez NZK; diuretyk pętlowy w hiperK/hiperMg/hiperCa – dawki.',
 'Hipernatremia ostra: tempo do 1 mmol/l/h.',
 'Hiperkalcemia: objętość nawodnienia; leczenie poza nowotworową (kwas zoledronowy – wskazanie ChPL tylko nowotworowa); kalcytonina – brak w zestawie.',
 'Wlew podtrzymujący glukonianu wapnia (SfE 100 ml/1 l) vs limit ChPL 46–50 ml/24 h.',
 'Glycophos poza ChPL w hipofosfatemii (gdy hiperK/NN).',
 'Digoksyna + wapń i.v. – tempo podania.',
 'Alternatywa 2 ml/kg dla bolusa hipertonicznego przy nietypowej masie ciała.'];
return{S:S,P:P,MW:MW,DIS:DIS,LOCAL:LOCAL,DECISIONS:DECISIONS,NACL_LOK:NACL_LOK,toMmol:toMmol,toMgdl:toMgdl,fmt:fmt,both:both,checkWeight:checkWeight,mlh:mlh,perH:perH,kcl:kcl,kclFromMlh:kclFromMlh,mgso4:mgso4,nacl3mix:nacl3mix,naclLok:naclLok,tbwF:tbwF,adrogue:adrogue,waterDef:waterDef,caCorr:caCorr,compute:compute};});
