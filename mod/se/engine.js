(function(r,f){if(typeof module==='object'&&module.exports)module.exports=f();else r.SE=f();})(this,function(){
'use strict';
var RP='https://rejestry.ezdrowie.gov.pl/api/rpl/medicinal-products/';
var S={
 AES:{n:'AES 2016',label:'Glauser i wsp. Wytyczne American Epilepsy Society. Epilepsy Curr 2016;16:48–61 (algorytm)',url:'https://aesnet.org/docs/default-source/press-releases-assets/cse-treatment-chart-final_rerelease.pdf'},
 ESETT:{n:'ESETT 2019',label:'Kapur i wsp. (ESETT). N Engl J Med 2019;381:2103–13 — cyt. za AES 2020',url:'https://pubmed.ncbi.nlm.nih.gov/31774955/'},
 AES20:{n:'AES 2020',label:'Vossler i wsp. Leczenie opornego SE — przegląd AES. Epilepsy Curr 2020;20:245–64, Tab. 1',url:'https://pmc.ncbi.nlm.nih.gov/articles/PMC7576920/'},
 NCS:{n:'NCS 2012',label:'Brophy i wsp. Wytyczne Neurocritical Care Society. Neurocrit Care 2012;17:3–23 (Tab. 3, 5, 7, 8)',url:'https://pubmed.ncbi.nlm.nih.gov/22528274/'},
 PTE:{n:'PTE 2018',label:'Jędrzejczak i wsp. Zalecenia Grupy Roboczej Polskiego Towarzystwa Epileptologii. Neurol Neurochir Pol 2018;52:419–26',url:'https://doi.org/10.1016/j.pjnns.2018.04.002'},
 ILAE:{n:'ILAE 2015',label:'Trinka i wsp. Definicja i klasyfikacja SE — ILAE. Epilepsia 2015;56:1515–23',url:'https://pubmed.ncbi.nlm.nih.gov/26336950/'},
 SHO:{n:'Shorvon 2011',label:'Shorvon, Ferlisi. Brain 2011;134:2802–18 (SE nadoporny)',url:'https://pubmed.ncbi.nlm.nih.gov/21914716/'},
 LZP:{n:'ChPL',label:'ChPL Lorabex 2 mg/ml (RPL 48474)',url:RP+'48474/characteristic'},
 DZP:{n:'ChPL',label:'ChPL Relanium 5 mg/ml (RPL 5776)',url:RP+'5776/characteristic'},
 CZP:{n:'ChPL',label:'ChPL Clonazepamum TZF 1 mg/ml (RPL 1496)',url:RP+'1496/characteristic'},
 LEV:{n:'ChPL',label:'ChPL Levetiracetam Kalceks 100 mg/ml (RPL 51405)',url:RP+'51405/characteristic'},
 VPA:{n:'ChPL',label:'ChPL Depakine 400 mg/4 ml i.v. (RPL 7506)',url:RP+'7506/characteristic'},
 PHT:{n:'ChPL',label:'ChPL Epanutin parenteral 50 mg/ml (RPL 2240)',url:RP+'2240/characteristic'},
 LCM:{n:'ChPL',label:'ChPL Lacosamide Fresenius Kabi 10 mg/ml (RPL 44427)',url:RP+'44427/characteristic'},
 MID:{n:'ChPL',label:'ChPL Midanium 5 mg/ml (RPL 9380)',url:RP+'9380/characteristic'},
 PRO:{n:'ChPL',label:'ChPL Propofol 1% MCT/LCT Fresenius (RPL 14789)',url:RP+'14789/characteristic'},
 TPN:{n:'ChPL',label:'ChPL Thiopental VUAB 0,5 g / 1,0 g (RPL 37577)',url:RP+'37577/characteristic'},
 KEP:{n:'RPL',label:'Keppra 100 mg/ml koncentrat do infuzji (RPL 16207)',url:RP+'16207'},
 KET:{n:'ChPL',label:'ChPL Ketalar 50 mg/ml (RPL 3323)',url:RP+'3323/characteristic'},
 BUC:{n:'ChPL',label:'ChPL Buccolam 10 mg/2 ml (EMA; RPL 30882) — 10 lat do <18 lat: 10 mg',url:'https://www.ema.europa.eu/pl/documents/product-information/buccolam-epar-product-information_pl.pdf'},
 EPI:{n:'ChPL',label:'ChPL Epistatus 10 mg roztwór do stosowania w jamie ustnej (RPL 43322), pkt 4.2',url:RP+'43322/characteristic'},
 RLS:{n:'ChPL',label:'ChPL Relsed 10 mg/2,5 ml mikrowlewka doodbytnicza (RPL 7955), pkt 4.2',url:RP+'7955/characteristic'},
 PHH:{n:'ChPL',label:'ChPL Phenytoin Hikma 50 mg/ml (RPL 20277), pkt 4.2–4.3',url:RP+'20277/characteristic'},
 GLU:{n:'ChPL',label:'ChPL Glucosum Teva 400 mg/ml, amp. 10 ml = 4 g (RPL 2708), pkt 4.2',url:RP+'2708/characteristic'},
 ESETT2:{n:'ESETT 2019',label:'Kapur i wsp. ESETT, N Engl J Med 2019;381:2103–13 (LEV 60 mg/kg ≤4500, fPHT 20 mg PE/kg ≤1500, VPA 40 mg/kg ≤3000; wlew 10 min)',url:'https://doi.org/10.1056/NEJMoa1905795'},
 RPL:{n:'RPL',label:'Rejestr Produktów Leczniczych — wyszukiwanie 14.10.2026',url:'https://rejestry.ezdrowie.gov.pl/rpl/search/public'}
};
function fmt(x){if(x==null||!isFinite(x))return'—';var a=Math.abs(x),s=a>=100?x.toFixed(0):a>=10?x.toFixed(1):x.toFixed(2);if(s.indexOf('.')>=0)s=s.replace(/0+$/,'').replace(/\.$/,'');return s.replace('.',',');}
function r1(x){return Math.round(x*10)/10;}
function checkWeight(w){if(!(w>0))return'none';if(w<30||w>250)return'red';if(w<40||w>180)return'amber';return'ok';}
function levMaint(crcl,liverSevere){var t;if(!(crcl>=0))t={lo:500,hi:1500,g:'brak CLkr — norma'};
 else if(crcl>=80)t={lo:500,hi:1500,g:'CLkr ≥80'};else if(crcl>=50)t={lo:500,hi:1000,g:'CLkr 50–79'};
 else if(crcl>=30)t={lo:250,hi:750,g:'CLkr 30–49'};else t={lo:250,hi:500,g:'CLkr <30'};
 if(liverSevere&&crcl<60)t={lo:t.lo/2,hi:t.hi/2,g:t.g+'; ciężka niewydolność wątroby → −50%'};return t;}
// G = wytyczne (off-label), C = ChPL, D = dostępność/fakt rejestrowy
function G(k,t){return{t:'W',k:k,txt:t};}function C(k,t){return{t:'C',k:k,txt:t};}function D(k,t){return{t:'D',k:k,txt:t};}
function mlh(ml,min){return r1(ml/min*60);}
function compute(st){
 var w=st.w,wc=checkWeight(w),W=(wc==='ok'||wc==='amber')?w:NaN,c=st.co||{},crcl=st.crcl,f=fmt;
 var given=st.given||{};// liczba podań z dziennika: {lzp:1,...}
 var zrm=st.zrmDoses||0,benzoLogged=(given.lzp||0)+(given.dzp||0)+(given.midim||0)+(given.midiv||0)+(given.czp||0),benzoTotal=zrm+benzoLogged;
 var R={weight:wc,W:W,benzoTotal:benzoTotal,drugs:{}};
 R.benzoMsg=benzoTotal>=2?{cls:'avoid',txt:'Podano już '+benzoTotal+' dawki benzodiazepiny (ZRM + SOR) → NIE powtarzaj, od razu 2. rzut. Benzodiazepinę można powtórzyć tylko raz (AES 2016; PTE 2018).'}:
  benzoTotal===1?{cls:'caution',txt:'Podano 1 dawkę benzodiazepiny → można podać jeszcze JEDNĄ pełną dawkę, potem 2. rzut (AES 2016; PTE 2018).'}:
  {cls:'ok',txt:'Brak podanych benzodiazepin → pełny 1. rzut. Jedna pełna dawka, nie dziel na małe (PTE 2018).'};
 var d=R.drugs;
 // ---------- 1. RZUT ----------
 var lzp=Math.min(0.1*W,4);
 d.lzp={line:1,name:'Lorazepam i.v. (Lorabex 2 mg/1 ml)',prep:'Lorabex 2 mg/ml — ampułka 1 ml = 2 mg',
  n:{mg:lzp,ml:lzp/2,amps:Math.ceil(lzp/2),dil:lzp,minMin:lzp/2},
  head:f(lzp)+' mg i.v. = '+f(lzp/2)+' ml',
  rows:[['Dawka',f(lzp)+' mg (0,1 mg/kg, maks. 4 mg)'],['Ampułki',Math.ceil(lzp/2)+' amp. × 2 mg/1 ml → pobierz '+f(lzp/2)+' ml'],['Rozcieńczenie','1:1 NaCl 0,9% → '+f(lzp)+' ml (NCS)'],['Szybkość','≤2 mg/min → podawaj ≥'+f(lzp/2)+' min'],['Maks.','4 mg/dawkę; ChPL: maks. 2 dawki'],['Powtórzenie','1× po 5–10 min (NCS) / 10–15 min (ChPL), jeśli napad trwa']],
  src:[G('AES','0,1 mg/kg i.v., maks. 4 mg/dawkę, można powtórzyć 1×.'),G('NCS','0,1 mg/kg do 4 mg/dawkę, powtórzyć po 5–10 min; ≤2 mg/min; rozcieńczyć 1:1 NaCl. Lek z wyboru i.v.'),G('PTE','0,05–0,1 mg/kg (zwykle 4–8 mg) przez 2–5 min; po 10 min można 4 mg.'),C('LZP','stan padaczkowy: 4 mg i.v.; powtórzyć po 10–15 min; maks. 2 dawki. Przeciwwskazany: ciężka niewydolność wątroby lub oddechowa (4.3).')],
  log:'Lorazepam '+f(lzp)+' mg i.v.'};
 var dlo=Math.min(0.15*W,10),dhi=Math.min(0.2*W,10),dz24=3*W-(st.zrmDzp||0)-(given.dzpMg||0);
 d.dzp={line:1,name:'Relanium (diazepam) i.v. 10 mg/2 ml',prep:'Relanium 5 mg/ml — ampułka 2 ml = 10 mg',
  n:{lo:dlo,hi:dhi,ml:dhi/5,amps:Math.ceil(dhi/10),minMin:dhi/5,max24:3*W,left24:dz24},
  head:(dlo===dhi?f(dhi):f(dlo)+'–'+f(dhi))+' mg i.v. = '+(dlo===dhi?f(dhi/5):f(dlo/5)+'–'+f(dhi/5))+' ml',
  rows:[['Dawka',(dlo===dhi?f(dhi):f(dlo)+'–'+f(dhi))+' mg (0,15–0,2 mg/kg, maks. 10 mg/dawkę)'],['Ampułki',Math.ceil(dhi/10)+' amp. × 10 mg/2 ml → pobierz '+f(dhi/5)+' ml'],['Rozcieńczenie','nierozcieńczony, wolno do dużej żyły'],['Szybkość','≤5 mg/min (NCS) → ≥'+f(dhi/5)+' min'],['Maks.','10 mg/dawkę (AES); ChPL: 3 mg/kg/24 h = '+f(3*W)+' mg; pozostało '+f(dz24)+' mg'],['Powtórzenie','1× po 5 min (NCS), jeśli napad trwa']],
  src:[G('AES','0,15–0,2 mg/kg i.v., maks. 10 mg/dawkę, można powtórzyć 1×.'),G('NCS','0,15 mg/kg do 10 mg/dawkę, powtórzyć po 5 min; ≤5 mg/min.'),G('PTE','dorośli 10–20 mg i.v. powoli 2–5 mg/min; można powtórzyć.'),C('DZP','10–20 mg i.v.; powtórzyć po 30–60 min; wlew maks. 3 mg/kg/24 h. Przeciwwskazany: ciężka niewydolność wątroby, ciężka niewydolność oddechowa (4.3).')],
  log:'Diazepam '+f(dhi)+' mg i.v.',logMg:dhi};
 var mim=W>40?10:(W>=13?5:NaN),mivlo=0.1*W,mivhi=0.2*W;
 d.midim={line:1,name:'Midanium / Midazolam i.m. 5 mg/ml (brak dostępu i.v.)',prep:'Midanium 5 mg/ml — amp. 1 ml = 5 mg, 3 ml = 15 mg, 10 ml = 50 mg',
  n:{mg:mim,ml:mim/5,ncs:Math.min(0.2*W,10)},
  head:f(mim)+' mg i.m. = '+f(mim/5)+' ml',
  rows:[['Dawka',f(mim)+' mg i.m. jednorazowo'],['Objętość',f(mim/5)+' ml z ampułki 5 mg/ml'],['Rozcieńczenie','nie rozcieńczać (i.m.)'],['Maks.','10 mg (NCS)'],['Powtórzenie','nie powtarzać i.m. — dalej 2. rzut (AES: pojedyncza dawka)']],
  src:[G('AES','i.m. 10 mg (>40 kg) / 5 mg (13–40 kg), pojedyncza dawka.'),G('NCS','0,2 mg/kg i.m. do 10 mg; lek z wyboru i.m.'),G('PTE','i.m. 0,2 mg/kg.')],
  log:'Midazolam '+f(mim)+' mg i.m.'};
 d.midiv={line:1,name:'Midanium / Midazolam i.v. 5 mg/ml',prep:'Midanium 5 mg/ml — amp. 1 ml = 5 mg, 3 ml = 15 mg',
  n:{lo:mivlo,hi:mivhi,ml:10/5},
  head:'10 mg i.v. = 2 ml',
  rows:[['Dawka','10 mg i.v. (dorośli; 0,1–0,2 mg/kg = '+f(mivlo)+'–'+f(mivhi)+' mg)'],['Objętość','2 ml z ampułki 5 mg/ml'],['Maks.','10 mg (PTE: dorośli 10 mg)'],['Powtórzenie','benzodiazepinę łącznie maks. 2× (PTE)']],
  src:[G('PTE','dorośli 10 mg i.v. (0,1–0,2 mg/kg).')],
  log:'Midazolam 10 mg i.v.'};
 d.czp={line:1,name:'Klonazepam i.v. 1 mg/1 ml (Clonazepamum TZF; Rivotril i.v. — brak w RPL)',prep:'Clonazepamum TZF 1 mg/ml — ampułka 1 ml = 1 mg',
  n:{mg:1,ml:1,minLo:2,minHi:4,max24:20},
  head:'1 mg i.v. = 1 ml',
  rows:[['Dawka','1 mg i.v.'],['Ampułki','1 amp. = 1 ml'],['Szybkość','0,25–0,5 mg/min → 2–4 min'],['Maks.','ChPL: 20 mg/dobę'],['Powtórzenie','benzodiazepinę łącznie maks. 2× (PTE)']],
  src:[G('PTE','dorośli 1 mg i.v., 0,25–0,5 mg/min; brak w wytycznych międzynarodowych, zalecany przez PTE.'),C('CZP','1 mg i.v.; 0,25–0,5 mg/min; maks. 20 mg/dobę. Przeciwwskazany: ciężka niewydolność oddechowa, miastenia (4.3).')],
  log:'Klonazepam 1 mg i.v.'};
 // midazolam podpoliczkowo / donosowo
 d.midbuc={line:1,name:'Midazolam podpoliczkowo (Buccolam / Epistatus); donosowo',prep:'Buccolam 10 mg/2 ml (strzykawka doustna); Epistatus 10 mg/1 ml. Donosowo: brak preparatu donosowego w RPL',
  n:{mg:10,mlBuc:2,mlEpi:1},
  head:'10 mg podpoliczkowo (dorośli – poza ChPL)',
  rows:[['Dawka','ChPL: 10 mg (10 lat do <18 lat); dorośli – brak w ChPL → DO DECYZJI LEKARZA'],['Objętość','Buccolam 2 ml (10 mg/2 ml) lub Epistatus 1 ml (10 mg/1 ml), połowę do każdego policzka'],['Donosowo','AES 2016 (poziom B) bez dawki; brak preparatu donosowego w RPL → DO DECYZJI LEKARZA'],['Powtórzenie','ChPL: nie podawać drugiej dawki bez konsultacji lekarza'],['Kiedy','AES 2016: gdy niedostępne i.m. midazolam / i.v. lorazepam / i.v. diazepam']],
  src:[G('AES','opcja (poziom B), gdy brak 3 leków podstawowych — bez podanej dawki.'),C('BUC','10 mg dla 10 lat do <18 lat; wskazanie tylko dzieci i młodzież.'),C('EPI','10 mg (1 ml) dla 10 lat do <18 lat; drugiej dawki nie podawać bez konsultacji lekarza.')],
  log:'Midazolam 10 mg podpoliczkowo'};
 var drLo=Math.min(0.2*W,20),drHi=Math.min(0.5*W,20);
 d.dzpr={line:1,name:'Diazepam doodbytniczo (Relsed 5 mg / 10 mg)',prep:'Relsed mikrowlewka 10 mg/2,5 ml (4 mg/ml) lub 5 mg/2,5 ml',
  n:{lo:drLo,hi:drHi,chpl:10,chplMax:30},
  head:'AES '+f(drLo)+'–'+f(drHi)+' mg · ChPL 10 mg',
  rows:[['Dawka AES','0,2–0,5 mg/kg = '+f(drLo)+'–'+f(drHi)+' mg, maks. 20 mg, pojedyncza dawka'],['Dawka ChPL','dorośli: 1 mikrowlewka 5 mg lub 10 mg; powtórzyć po 10–15 min; maks. 30 mg'],['Rozbieżność','AES (do 20 mg, jednorazowo) vs ChPL (5–10 mg, powtarzalnie do 30 mg) → DO DECYZJI LEKARZA'],['Mikrowlewki','10 mg = 1 × Relsed 10 mg; 20 mg = 2 × 10 mg']],
  src:[G('AES','0,2–0,5 mg/kg, maks. 20 mg/dawkę, pojedyncza dawka (poziom B), gdy brak 3 leków podstawowych.'),C('RLS','dorośli SE: 5 lub 10 mg, powtórzyć po 10–15 min, maks. 30 mg.')],
  log:'Diazepam '+f(Math.min(10,drHi))+' mg doodbytniczo'};
 // ---------- 2. RZUT ----------
 var lev=Math.min(60*W,4500),levml=lev/100,levTot=100+levml;
 d.lev={line:2,name:'Keppra / Levetiracetam i.v. 500 mg/5 ml',prep:'100 mg/ml — fiolka 5 ml = 500 mg (Keppra koncentrat RPL 16207; Levetiracetam Kalceks RPL 51405)',
  n:{mg:lev,capped:60*W>4500,ml:levml,vials:Math.ceil(lev/500),bag:100,total:levTot,min:15,mlh:mlh(levTot,15),maint:levMaint(crcl,c.liver)},
  head:f(lev)+' mg w 100 ml NaCl / 15 min = '+f(mlh(levTot,15))+' ml/h',
  rows:[['Dawka',f(lev)+' mg (60 mg/kg, maks. 4500 mg)'+(60*W>4500?' — OSIĄGNIĘTO MAKS.':'')],['Fiolki',Math.ceil(lev/500)+' fiol. × 500 mg/5 ml → pobierz '+f(levml)+' ml'],['Rozcieńczenie','w 100 ml NaCl 0,9% → razem '+f(levTot)+' ml'],['Czas','15 min'],['Pompa',f(mlh(levTot,15))+' ml/h'],['Maks.','4500 mg jednorazowo (AES); ChPL: 3000 mg/dobę'],['Podtrzymanie','ChPL: '+levMaint(crcl,c.liver).lo+'–'+levMaint(crcl,c.liver).hi+' mg 2×/dobę ('+levMaint(crcl,c.liver).g+')']],
  src:[G('AES','60 mg/kg i.v., maks. 4500 mg, jednorazowo.'),G('AES20','60 mg/kg przez 15 min (maks. 4500 mg); w ESETT skuteczność jak walproinian 40 mg/kg i fosfenytoina 20 mg PE/kg.'),G('NCS','1000–3000 mg i.v., 2–5 mg/kg/min.'),C('LEV','brak wskazania w SE (off-label); maks. 3000 mg/dobę; rozcieńczyć w ≥100 ml, wlew 15 min; dawka podtrzymująca wg CLkr.')],
  log:'Lewetyracetam '+f(lev)+' mg i.v.'};
 var vpa=Math.min(40*W,3000),vml=vpa/100;
 d.vpa={line:2,name:'Depakine i.v. (walproinian) fiolka 400 mg',prep:'Depakine 400 mg — fiolka proszku + 4 ml rozpuszczalnika = 100 mg/ml',
  n:{mg:vpa,capped:40*W>3000,ml:vml,vials:Math.ceil(vpa/400),min:10,mlh:mlh(vml,10),minAt6:vpa/(6*W),chplLo:10*W,chplHi:20*W,infMaxMgH:6*W},
  head:f(vpa)+' mg / 10 min = '+f(vml)+' ml → '+f(mlh(vml,10))+' ml/h',
  rows:[['Dawka',f(vpa)+' mg (40 mg/kg, maks. 3000 mg)'+(40*W>3000?' — OSIĄGNIĘTO MAKS.':'')],['Fiolki',Math.ceil(vpa/400)+' fiol. × 400 mg (po rozpuszczeniu 100 mg/ml) → '+f(vml)+' ml'],['Rozcieńczenie','nierozcieńczony lub 1:1 NaCl 0,9% (AES 2020)'],['Czas','10 min (ESETT); maks. szybkość 6 mg/kg/min (PTE) → nie szybciej niż '+f(vpa/(6*W))+' min'],['Pompa',f(mlh(vml,10))+' ml/h (nierozcieńczony, 10 min)'],['Maks.','3000 mg (AES, PTE); ChPL: 10–20 mg/kg = '+f(10*W)+'–'+f(20*W)+' mg'],['Powtórzenie','dodatkowo 20 mg/kg po 10 min, jeśli napad trwa (NCS, PTE) — w granicy 3 g']],
  src:[G('AES','40 mg/kg i.v., maks. 3000 mg, jednorazowo.'),G('ESETT','40 mg/kg przez 10 min (cyt. za AES 2020).'),G('NCS','20–40 mg/kg, 3–6 mg/kg/min; można dodatkowo 20 mg/kg po 10 min.'),G('PTE','20–40 mg/kg przez 10 min (maks. 6 mg/kg/min); dodatkowo 20 mg/kg; maks. 3 g. Opcja szczególnie u chorych kardiologicznych.'),C('VPA','stan padaczkowy: 10–20 mg/kg przez 5–10 min, potem wlew maks. 6 mg/kg/h ('+f(6*W)+' mg/h). Przeciwwskazany: zapalenie wątroby, porfiria, POLG, zaburzenia cyklu mocznikowego, ciąża (4.3).')],
  log:'Walproinian '+f(vpa)+' mg i.v.'};
 var pht=20*W,pml=pht/50,pvol=Math.max(50,Math.ceil(pht/10/10)*10),pt50=pht/50,pt25=pht/25;
 d.pht={line:2,name:'Epanutin (fenytoina) i.v. 250 mg/5 ml',prep:'Epanutin parenteral 50 mg/ml — fiolka 5 ml = 250 mg',
  n:{mg:pht,ml:pml,vials:Math.ceil(pht/250),vol:pvol,min50:pt50,min25:pt25,mlh50:mlh(pvol,pt50),mlh25:mlh(pvol,pt25),chpl17:17*W},
  head:f(pht)+' mg w '+pvol+' ml NaCl → '+f(mlh(pvol,pt50))+' ml/h ('+f(pt50)+' min)',
  rows:[['Dawka',f(pht)+' mg (20 mg/kg)'],['Fiolki',Math.ceil(pht/250)+' fiol. × 250 mg/5 ml → pobierz '+f(pml)+' ml'],['Rozcieńczenie','tylko NaCl 0,9% (NIE glukoza), ≤10 mg/ml → do '+pvol+' ml; filtr 0,22–0,5 µm'],['Czas','≤50 mg/min → ≥'+f(pt50)+' min (NCS, ChPL); PTE ≤25 mg/min → ≥'+f(pt25)+' min'],['Pompa',f(mlh(pvol,pt50))+' ml/h (50 mg/min) lub '+f(mlh(pvol,pt25))+' ml/h (25 mg/min)'],['Maks.','ChPL: 17 mg/kg = '+f(17*W)+' mg — KONFLIKT z wytycznymi 20 mg/kg'],['Powtórzenie','dodatkowo 5–10 mg/kg po 10 min (NCS)'],['Monitorowanie','EKG i RR w trakcie wlewu; zakończyć ≤1 h od przygotowania (ChPL)'],['Phenytoin Hikma (ChPL)','amp. 5 ml = 230 mg fenytoiny; ≤0,5 ml/min (23 mg/min); powtórzyć po 20–30 min; maks. 17 mg/kg/dobę = '+f(17*W)+' mg → DO DECYZJI LEKARZA vs 20 mg/kg (wytyczne)']],
  src:[G('AES','fosfenytoina 20 mg PE/kg (maks. 1500 mg PE) lub fenytoina 20 mg/kg; fosfenytoiny brak w Polsce (PTE 2018).'),G('NCS','20 mg/kg, ≤50 mg/min; dodatkowo 5–10 mg/kg po 10 min.'),G('PTE','20 mg/kg we wlewie, maks. 25 mg/min; nie łączyć z glukozą.'),C('PHT','≤50 mg/min; rozcieńczyć w 50–100 ml NaCl do ≤10 mg/ml; filtr; zakończyć w ciągu 1 h. Przeciwwskazana: bradykardia zatokowa, blok SA, blok AV II/III, zesp. Adamsa-Stokesa (4.3).'),C('PHH','SE: 1 amp. (230 mg) z szybkością ≤0,5 ml/min, można powtórzyć po 20–30 min; maks. 17 mg/kg/dobę. Przeciwwskazana także ≤3 mies. po zawale i przy EF <35% (4.3).')],
  warn:pvol>100?['Objętość '+pvol+' ml przekracza 50–100 ml z ChPL (wynika z wymogu ≤10 mg/ml) — zweryfikuj z apteką.']:[],
  log:'Fenytoina '+f(pht)+' mg i.v.'};
 var lcmMax=(c.renal&&crcl<=30)?250:(c.liver?300:400);
 d.lcm={line:2,name:'Lakozamid i.v. 200 mg/20 ml',prep:'Lacosamide Fresenius Kabi 10 mg/ml — fiolka 20 ml = 200 mg',
  n:{mg:200,ml:20,mlh200:mlh(20,15),mg400:400,ml400:40,mlh400:mlh(40,30),maxDay:lcmMax},
  head:'200 mg = 20 ml / 15 min → 80 ml/h',
  rows:[['Dawka','200 mg (ChPL nasycająca); NCS 200–400 mg'],['Fiolki','1 fiol. 200 mg/20 ml (400 mg = 2 fiol./40 ml)'],['Rozcieńczenie','można nierozcieńczony lub w NaCl 0,9% / glukozie 5% / Ringerze'],['Czas','200 mg: 15 min; >200 mg na wlew: ≥30 min (ChPL)'],['Pompa','200 mg: 80 ml/h (15 min); 400 mg: 80 ml/h przez 30 min'],['Maks.','ChPL: '+lcmMax+' mg/dobę'+(lcmMax<400?' (dostosowano do chorób)':'')],['Uwaga','przed podaniem EKG — PR, blok AV']],
  src:[G('NCS','200–400 mg i.v.; 200 mg przez 15 min.'),G('AES20','możliwie skuteczny w opornym SE (poziom C); teoretyczna dawka nasycająca 5–10 mg/kg — ryzyko arytmii.'),C('LCM','dawka nasycająca 200 mg; wlew 15–60 min, >200 mg/wlew ≥30 min; maks. 400 mg/dobę; CLkr ≤30: 250 mg/dobę; niewydolność wątroby łagodna/umiarkowana: 300 mg/dobę. Przeciwwskazany: blok AV II/III (4.3).')],
  log:'Lakozamid 200 mg i.v.'};
 d.pb={line:2,name:'Fenobarbital i.v.',prep:'Brak preparatu i.v. w RPL — tylko import docelowy',na:true,
  n:{aes:15*W,ncs:20*W,min50:20*W/50},
  head:f(15*W)+'–'+f(20*W)+' mg i.v.',
  rows:[['Dawka','15 mg/kg = '+f(15*W)+' mg (AES) / 20 mg/kg = '+f(20*W)+' mg (NCS, PTE)'],['Szybkość','≤50 mg/min (PTE); 50–100 mg/min (NCS) → 20 mg/kg ≥'+f(20*W/50)+' min przy 50 mg/min'],['Powtórzenie','dodatkowo 5–10 mg/kg po 10 min (NCS)'],['Dostępność','w RPL brak postaci i.v. (14.10.2026) — sprawdź aptekę szpitalną']],
  src:[G('AES','15 mg/kg i.v., jednorazowo (alternatywa).'),G('NCS','20 mg/kg, 50–100 mg/min; dodatkowo 5–10 mg/kg.'),G('PTE','20 mg/kg, maks. 50 mg/min.'),D('RPL','w RPL tylko tabletki (Luminalum) — brak postaci i.v.')],
  log:'Fenobarbital '+f(20*W)+' mg i.v.'};
 var fpe=Math.min(20*W,1500);
 d.fos={line:2,name:'Fosfenytoina i.v. (brak w RPL)',prep:'Brak fosfenytoiny w RPL (26.10.2026) — tylko import docelowy',na:true,
  n:{mg:fpe,capped:20*W>1500,min150:fpe/150,min10:10},
  head:f(fpe)+' mg PE (20 mg PE/kg, maks. 1500)',
  rows:[['Dawka',f(fpe)+' mg PE (20 mg PE/kg, maks. 1500 mg PE)'+(20*W>1500?' — OSIĄGNIĘTO MAKS.':'')],['Szybkość','≤150 mg PE/min (NCS) → ≥'+f(fpe/150)+' min; ESETT: wlew 10 min'],['Dostępność','brak w RPL — jeśli niedostępna: fenytoina (Phenytoin Hikma / Epanutin)'],['Przeciwwskazania','jak fenytoina: bradykardia, blok SA, blok AV II/III (ChPL fenytoiny)']],
  src:[G('AES','20 mg PE/kg, maks. 1500 mg PE, pojedyncza dawka (poziom U).'),G('ESETT2','20 mg PE/kg (maks. 1500 mg PE) przez 10 min — skuteczność jak LEV i VPA.'),G('NCS','20 mg PE/kg, do 150 mg PE/min.'),D('RPL','brak fosfenytoiny w RPL.')],
  log:'Fosfenytoina '+f(fpe)+' mg PE i.v.'};
 // ---------- 3. RZUT (strzykawka 50 ml) ----------
 var mb=0.2*W;
 d.mid3={line:3,name:'Midanium / Midazolam — wlew ciągły',prep:'Midanium 5 mg/ml (amp. 10 ml = 50 mg). Strzykawka 50 ml: A) nierozcieńczony 5 mg/ml = 250 mg (5 amp.); B) 1 mg/ml = 1 amp. 50 mg + 40 ml NaCl',
  n:{bolus:mb,bolusMin:mb/2,lo:0.05*W,hi:2*W,pteHi:0.4*W,chplHi:0.2*W,mlhLo5:r1(0.05*W/5),mlhHi5:r1(2*W/5),mlhPte5:r1(0.4*W/5),mlhLo1:r1(0.05*W),mlhPte1:r1(0.4*W),brkLo:0.1*W,brkHi:0.2*W},
  head:'bolus '+f(mb)+' mg, wlew '+f(0.05*W)+'–'+f(2*W)+' mg/h',
  rows:[['Bolus',f(mb)+' mg (0,2 mg/kg) z szybkością 2 mg/min → '+f(mb/2)+' min'],['Wlew','0,05–2 mg/kg/h = '+f(0.05*W)+'–'+f(2*W)+' mg/h (NCS); PTE 0,05–0,4 mg/kg/h = do '+f(0.4*W)+' mg/h'],['Pompa A (5 mg/ml)',f(0.05*W/5)+' → '+f(0.4*W/5)+' (PTE) → maks. '+f(2*W/5)+' ml/h (NCS)'],['Pompa B (1 mg/ml)',f(0.05*W)+' → '+f(0.4*W)+' ml/h (PTE); powyżej użyj strzykawki A'],['Miareczkowanie','napad przebijający: bolus 0,1–0,2 mg/kg ('+f(0.1*W)+'–'+f(0.2*W)+' mg) i ↑ wlewu o 0,05–0,1 mg/kg/h co 3–4 h (NCS)'],['Maks.','2 mg/kg/h (NCS); ChPL (sedacja): 0,2 mg/kg/h = '+f(0.2*W)+' mg/h — KONFLIKT']],
  src:[G('NCS','bolus 0,2 mg/kg (2 mg/min); wlew 0,05–2 mg/kg/h miareczkowany wg EEG; tachyfilaksja; aktywny metabolit wydalany przez nerki.'),G('PTE','bolus 0,2 mg/kg; podtrzymanie 0,05–0,4 mg/kg/h.'),G('AES20','nasycająca 0,2–0,5 mg/kg; wlew 0,1–2 mg/kg/h.'),C('MID','sedacja na OIT: podtrzymanie 0,03–0,2 mg/kg/h; brak wskazania w SE.')],
  log:'Midazolam bolus '+f(mb)+' mg + wlew'};
 d.pro={line:3,name:'Propofol 1% — wlew ciągły',prep:'Propofol 1% = 10 mg/ml — fiolka 50 ml nierozcieńczona = 500 mg (strzykawka 50 ml)',
  n:{bLo:1*W,bHi:2*W,bPteHi:3*W,bMax:10*W,start:r1(20*W*60/1000/10),lo:r1(30*W*60/1000/10),hi:r1(200*W*60/1000/10),c80:r1(80*W*60/1000/10),c4:r1(4*W/10),mghLo:30*W*60/1000,mghHi:200*W*60/1000,chplHi:4*W},
  head:'bolus '+f(W)+'–'+f(2*W)+' mg, wlew '+f(r1(30*W*0.006))+'–'+f(r1(200*W*0.006))+' ml/h',
  rows:[['Bolus','1–2 mg/kg = '+f(W)+'–'+f(2*W)+' mg = '+f(W/10)+'–'+f(2*W/10)+' ml (NCS); powtarzać co 3–5 min do maks. 10 mg/kg = '+f(10*W)+' mg (AES 2020)'],['Wlew','start 20 µg/kg/min → '+f(r1(20*W*0.006))+' ml/h; zakres 30–200 µg/kg/min = '+f(30*W*0.06)+'–'+f(200*W*0.06)+' mg/h'],['Pompa (10 mg/ml)',f(r1(30*W*0.006))+'–'+f(r1(200*W*0.006))+' ml/h'],['Miareczkowanie','↑ o 5–10 µg/kg/min co 5 min lub bolus 1 mg/kg (NCS)'],['Próg PRIS','>80 µg/kg/min (= '+f(r1(80*W*0.006))+' ml/h) >48 h — ostrożnie (NCS); ChPL: PRIS zwykle >4 mg/kg/h (= '+f(r1(4*W/10))+' ml/h) >48 h'],['Wymaga','intubacji i wentylacji mechanicznej (NCS)'],['Zmiana strzykawki','nierozcieńczony: maks. 12 h z jednej strzykawki (ChPL)']],
  src:[G('NCS','start 20 µg/kg/min z bolusem 1–2 mg/kg; wlew 30–200 µg/kg/min wg EEG; ostrożnie >80 µg/kg/min >48 h.'),G('PTE','bolus 2–3 mg/kg, dodatkowo 1–2 mg/kg; podtrzymanie 2–10 mg/kg/h.'),G('AES20','bolus 1–2 mg/kg co 3–5 min do maks. 10 mg/kg; wlew do 5 mg/kg/h.'),C('PRO','PRIS zwykle przy >4 mg/kg/h przez >48 h; nierozcieńczony wlew ≤12 h/strzykawkę.')],
  log:'Propofol bolus '+f(2*W)+' mg + wlew'};
 d.tpn={line:3,name:'Thiopental (tiopental) — wlew ciągły',prep:'Thiopental VUAB 0,5 g / 1,0 g proszek. Roztwór 2,5% = 25 mg/ml (ChPL: 500 mg w 20 ml). Strzykawka 50 ml: 1 g w 40 ml',
  n:{bLo:2*W,bHi:7*W,bPteLo:3*W,bPteHi:5*W,minAt50:7*W/50,lo:0.5*W,hi:5*W,mlhLo:r1(0.5*W/25),mlhHi:r1(5*W/25),chplSingle:1000,chplDay:2000},
  head:'bolus '+f(2*W)+'–'+f(Math.min(7*W,1000))+' mg, wlew '+f(r1(0.5*W/25))+'–'+f(r1(5*W/25))+' ml/h',
  rows:[['Bolus','2–7 mg/kg = '+f(2*W)+'–'+f(7*W)+' mg (NCS), ≤50 mg/min; PTE 3–5 mg/kg = '+f(3*W)+'–'+f(5*W)+' mg, dalej 1–2 mg/kg co 2–3 min'],['Objętość bolusu (25 mg/ml)',f(2*W/25)+'–'+f(7*W/25)+' ml'],['Wlew','0,5–5 mg/kg/h = '+f(0.5*W)+'–'+f(5*W)+' mg/h (NCS)'],['Pompa (25 mg/ml)',f(r1(0.5*W/25))+'–'+f(r1(5*W/25))+' ml/h'],['Miareczkowanie','napad przebijający: bolus 1–2 mg/kg i ↑ o 0,5–1 mg/kg/h co 12 h (NCS)'],['Maks.','ChPL: pojedynczo 1 g, dobowo 2 g — KONFLIKT z dawkami w SE'+(7*W>1000?' (bolus 7 mg/kg > 1 g)':'')],['Wymaga','intubacji i wentylacji; hipotensja, depresja krążenia (NCS)']],
  src:[G('NCS','bolus 2–7 mg/kg ≤50 mg/min; wlew 0,5–5 mg/kg/h wg EEG.'),G('PTE','bolus 3–5 mg/kg, dodatkowo 1–2 mg/kg co 2–3 min; podtrzymanie podane w tekście jako „3–7 mg/kg/min” — prawdopodobny błąd druku (mg/kg/h); nie używać bez weryfikacji.'),C('TPN','roztwór 2,5% (500 mg/20 ml); maks. pojedyncza dawka 1 g, dobowa 2 g; wskazania anestezjologiczne (brak SE).')],
  log:'Tiopental bolus '+f(Math.min(5*W,1000))+' mg + wlew'};
 d.ket={line:3,name:'Ketalar (ketamina) — wlew ciągły',prep:'Ketalar 50 mg/ml — fiolka 10 ml = 500 mg. Strzykawka 50 ml: A) nierozcieńczona 50 mg/ml (5 fiol.); B) 10 mg/ml = 1 fiol. + 40 ml NaCl',
  n:{bLo:1*W,bHi:2.5*W,lo:3*W,hi:10*W,mlhLoA:r1(3*W/50),mlhHiA:r1(10*W/50),mlhLoB:r1(3*W/10),mlhHiB:r1(10*W/10),chplLo:0.6*W,chplHi:2.4*W},
  head:'bolus '+f(W)+'–'+f(2.5*W)+' mg, wlew '+f(3*W)+'–'+f(10*W)+' mg/h',
  rows:[['Bolus','1–2,5 mg/kg = '+f(W)+'–'+f(2.5*W)+' mg = '+f(W/50)+'–'+f(2.5*W/50)+' ml z 50 mg/ml'],['Wlew','3–10 mg/kg/h = '+f(3*W)+'–'+f(10*W)+' mg/h (AES 2020)'],['Pompa A (50 mg/ml)',f(r1(3*W/50))+'–'+f(r1(10*W/50))+' ml/h'],['Pompa B (10 mg/ml)',f(r1(3*W/10))+'–'+f(r1(10*W/10))+' ml/h'],['Miareczkowanie','do wzorca burst-suppression w EEG (AES 2020)'],['Łączyć','z benzodiazepiną (AES 2020)'],['ChPL (znieczulenie)','podtrzymanie 10–40 µg/kg/min = '+f(0.6*W)+'–'+f(2.4*W)+' mg/h — dawki SE wyższe']],
  src:[G('AES20','nasycająca 1–2,5 mg/kg; podtrzymanie 3–10 mg/kg/h do burst-suppression; łączyć z BZD; unikać w III trymestrze. Dowody: poziom U (opisy przypadków).'),G('PTE','wymieniona jako opcja w SE nadopornym — bez dawek.'),G('NCS','terapia alternatywna (Tab. 9) — bez dawek.'),C('KET','tylko wskazania anestezjologiczne: indukcja 0,5–2 mg/kg we wlewie, podtrzymanie 10–40 µg/kg/min.')],
  log:'Ketamina bolus '+f(1.5*W)+' mg + wlew'};
 // ---------- 0–5 min ----------
 R.stage0={steps:['Drożność dróg oddechowych, oddech, krążenie; badanie neurologiczne','Zanotuj czas początku napadu; monitoruj parametry życiowe','Tlen (kaniula/maska); rozważ intubację, jeśli niewydolność oddechowa','Monitorowanie EKG','Glikemia z palca','Dostęp i.v.; elektrolity, morfologia, toksykologia, stężenia leków przeciwpadaczkowych'],
  glu:{aesG:25,aesMl50:50,ml40aes:25/0.4,chplG:0.2*W,ml40chpl:0.2*W/0.4},
  rows:[['Glikemia <60 mg/dl (3,3 mmol/l)','AES 2016: tiamina 100 mg i.v., potem 50 ml glukozy 50% (= 25 g)'],
   ['Glukoza w PL','Glucosum Teva 40% (amp. 10 ml = 4 g): 25 g (AES) = 62,5 ml ≈ 6,3 amp.; ChPL: 0,2 g/kg = '+f(0.2*W)+' g = '+f(0.2*W/0.4)+' ml 40% → DO DECYZJI LEKARZA'],
   ['Tiamina','100 mg i.v. przed glukozą (AES 2016); w RPL brak tiaminy do wstrzykiwań dla ludzi (tylko weterynaryjna) — sprawdź aptekę / import docelowy']],
  src:[G('AES','0–5 min: stabilizacja, EKG, glikemia; <60 mg/dl: tiamina 100 mg i.v., potem 50 ml D50W i.v.'),C('GLU','hipoglikemia: 20% lub 40% glukoza i.v. 0,2 g/kg mc.')]};
 // ---------- flagi chorób ----------
 var F={};Object.keys(d).forEach(function(k){F[k]=[];});
 function fl(k,cls,txt){F[k].push([cls,txt]);}
 if(c.liver){fl('lzp','avoid','ChPL 4.3: przeciwwskazany w ciężkiej niewydolności wątroby.');fl('dzp','avoid','ChPL 4.3: przeciwwskazany w ciężkiej niewydolności wątroby.');
  fl('vpa','avoid','ChPL 4.3: przeciwwskazany — ostre/przewlekłe zapalenie wątroby, ciężkie zapalenie wątroby w wywiadzie.');fl('pht','caution','Metabolizm wątrobowy — może być potrzebna mniejsza dawka (ChPL 4.4).');
  fl('lcm','caution','ChPL: łagodna/umiarkowana niewydolność wątroby — maks. 300 mg/dobę.');fl('lev','ok','Nie metabolizowany w wątrobie (NCS); ciężka niewydolność + CLkr <60: podtrzymanie −50% (ChPL).');}
 if(c.renal){var t=levMaint(crcl,c.liver);fl('lev','caution','ChPL: podtrzymanie '+t.lo+'–'+t.hi+' mg 2×/dobę ('+t.g+'). Dawka nasycająca wg wytycznych bez korekty.');
  if(crcl<=30)fl('lcm','caution','ChPL: CLkr ≤30 ml/min — maks. 250 mg/dobę.');fl('mid3','caution','Aktywny metabolit wydalany przez nerki — kumulacja (NCS; AES 2020).');}
 if(c.cardiac){fl('pht','avoid','ChPL 4.3: przeciwwskazana przy bradykardii zatokowej, bloku SA, bloku AV II/III, zesp. Adamsa-Stokesa; arytmie i hipotensja (NCS, PTE).');
  fl('lcm','caution','ChPL 4.3: przeciwwskazany przy bloku AV II/III; AES 2020: ostrożnie w zaburzeniach przewodzenia, niewydolności serca, chorobie strukturalnej.');
  fl('vpa','ok','PTE 2018: walproinian — opcja szczególnie u chorych z chorobami układu krążenia (bez hipotensji).');
  fl('pro','caution','Hipotensja, niewydolność serca, PRIS (NCS Tab. 8).');fl('tpn','caution','Hipotensja, depresja krążenia (NCS Tab. 8).');
  fl('mid3','ok','Mniej hipotensji niż barbiturany — może być preferowany (NCS).');fl('ket','ok','Mniej hipotensji niż inne anestetyki (AES 2020; PTE 2018).');}
 if(c.preg){fl('vpa','avoid','ChPL 4.3: przeciwwskazany w ciąży; AES 2020: nie podawać kobietom w ciąży z SE.');
  fl('lev','ok','NCS: lewetyracetam należy rozważyć w ciąży; ChPL 4.6: >1800 ciąż w monoterapii — bez wzrostu dużych wad.');
  fl('pht','caution','ChPL 4.6: duże wady rozwojowe 2–3× częściej niż w populacji ogólnej.');
  fl('lcm','caution','ChPL 4.6: brak wystarczających danych — tylko gdy bezwzględnie konieczne.');
  fl('ket','caution','AES 2020: unikać w III trymestrze.');
  fl('lzp','ok','NCS: lorazepam zalecany w ciąży jako leczenie początkowe.');}
 R.preg=c.preg?'Ciąża: rozważ RZUCAWKĘ — siarczan magnezu skuteczniejszy niż leki przeciwpadaczkowe; najlepsze leczenie to ukończenie ciąży; KTG, położnik (NCS 2012). Dawkowanie MgSO₄ wg protokołu położniczego.':null;
 d.mid3.rows.push(['Moduł Pompy SOR','ta sama receptura B: 50 mg/50 ml = 1 mg/ml (STANDARD LOKALNY – zatwierdzenie w Pompach); zakres pomp = ChPL sedacji 0,03–0,2 mg/kg/h, dawki SE wyższe – DO DECYZJI LEKARZA']);
 d.pro.rows.push(['Moduł Pompy SOR','ta sama receptura: 10 mg/ml nierozcieńczony, 20 ml lub 50 ml; zakres pomp = ChPL 0,3–4 mg/kg/h']);
 // przeciwwskazania (z ChPL) jako osobny wiersz
 Object.keys(d).forEach(function(k){var x=d[k];if(x.rows.some(function(r){return r[0]==='Przeciwwskazania'}))return;var c=x.src.filter(function(z){return z.t==='C'&&/Przeciwwskazan/.test(z.txt)}).map(function(z){return z.txt.slice(z.txt.search(/Przeciwwskazan/))});if(k==='vpa')c=['ChPL 4.3: ciąża (w padaczce — chyba że brak alternatywy), ostre/przewlekłe zapalenie wątroby, porfiria, choroby mitochondrialne (POLG), zaburzenia cyklu mocznikowego'];if(c.length)x.rows.push(['Przeciwwskazania',c.join(' ')]);});
 // klasy
 Object.keys(d).forEach(function(k){var x=d[k];x.flags=F[k];var a=F[k].some(function(z){return z[0]==='avoid'}),cu=F[k].some(function(z){return z[0]==='caution'});x.cls=a?'avoid':cu?'caution':'';});
 function pick(keys){return keys.filter(function(k){return!d[k].cls;});}
 var p1=c.liver?pick(['czp','midiv','midim']):['lzp'];
 var p2=c.preg?pick(['lev']):c.cardiac?pick(['vpa','lev']):pick(['lev','vpa','pht']);if(!p2.length)p2=pick(['lev','vpa','pht','lcm']);
 var p3=c.cardiac?pick(['mid3','ket']):[];
 p1.concat(p2,p3).forEach(function(k){if(!d[k].cls)d[k].cls='pref';});
 R.preferred=p1.concat(p2,p3);
 return R;}

// ---------- edytowalne dawki ----------
var ED={
 lzp:{f:[['dose','Dawka [mg]',function(R){return R.drugs.lzp.n.mg}]],max:4,conc:2,c:function(v,W){var m=v.dose/2;return['= '+fmt(m)+' ml ('+Math.ceil(m-1e-9)+' amp. 2 mg/1 ml)','rozcieńcz 1:1 NaCl → '+fmt(2*m)+' ml','podawaj ≥'+fmt(v.dose/2)+' min (≤2 mg/min)'];}},
 dzp:{f:[['dose','Dawka [mg]',function(R){return R.drugs.dzp.n.hi}]],max:10,c:function(v,W){return['= '+fmt(v.dose/5)+' ml ('+Math.ceil(v.dose/10-1e-9)+' amp. 10 mg/2 ml)','podawaj ≥'+fmt(v.dose/5)+' min (≤5 mg/min)'];}},
 midim:{f:[['dose','Dawka i.m. [mg]',function(R){return R.drugs.midim.n.mg}]],max:10,c:function(v){return['= '+fmt(v.dose/5)+' ml z 5 mg/ml'];}},
 midiv:{f:[['dose','Dawka i.v. [mg]',function(){return 10}]],max:10,c:function(v){return['= '+fmt(v.dose/5)+' ml z 5 mg/ml'];}},
 czp:{f:[['dose','Dawka [mg]',function(){return 1}]],max:1,c:function(v){return['= '+fmt(v.dose)+' ml (amp. 1 mg/1 ml)','podawaj '+fmt(v.dose/0.5)+'–'+fmt(v.dose/0.25)+' min (0,25–0,5 mg/min)'];}},
 lev:{f:[['dose','Dawka [mg]',function(R){return R.drugs.lev.n.mg}]],max:4500,c:function(v){var m=v.dose/100,t=100+m;return['= '+fmt(m)+' ml ('+Math.ceil(v.dose/500-1e-9)+' fiol. 500 mg/5 ml)','w 100 ml NaCl → '+fmt(t)+' ml','pompa: '+fmt(r1(t*4))+' ml/h przez 15 min'];}},
 vpa:{f:[['dose','Dawka [mg]',function(R){return R.drugs.vpa.n.mg}]],max:3000,c:function(v,W){var m=v.dose/100;return['= '+fmt(m)+' ml ('+Math.ceil(v.dose/400-1e-9)+' fiol. 400 mg, po rozpuszczeniu 100 mg/ml)','pompa: '+fmt(r1(m*6))+' ml/h przez 10 min (nierozcieńczony)'];}},
 pht:{f:[['dose','Dawka [mg]',function(R){return R.drugs.pht.n.mg}]],max:Infinity,c:function(v){var vol=Math.max(50,Math.ceil(v.dose/100)*10),t=v.dose/50;return['= '+fmt(v.dose/50)+' ml ('+Math.ceil(v.dose/250-1e-9)+' fiol. 250 mg/5 ml)','w NaCl do '+vol+' ml (≤10 mg/ml), filtr','pompa: '+fmt(r1(vol/t*60))+' ml/h → '+fmt(t)+' min (50 mg/min)'];}},
 lcm:{f:[['dose','Dawka [mg]',function(){return 200}]],max:400,c:function(v){var m=v.dose/10,t=v.dose>200?30:15;return['= '+fmt(m)+' ml ('+Math.ceil(v.dose/200-1e-9)+' fiol. 200 mg/20 ml)','pompa: '+fmt(r1(m/t*60))+' ml/h przez '+t+' min'];}},
 pb:{f:[['dose','Dawka [mg]',function(R){return R.drugs.pb.n.ncs}]],max:Infinity,c:function(v){return['≥'+fmt(v.dose/50)+' min przy 50 mg/min'];}},
 mid3:{f:[['bolus','Bolus [mg]',function(R){return R.drugs.mid3.n.bolus}],['rate','Wlew [mg/kg/h]',function(){return 0.05}]],rmax:2,c:function(v,W){var mh=v.rate*W;return['bolus = '+fmt(v.bolus/5)+' ml z 5 mg/ml, 2 mg/min → '+fmt(v.bolus/2)+' min','wlew '+fmt(mh)+' mg/h = '+fmt(r1(mh/5))+' ml/h (5 mg/ml)'];}},
 pro:{f:[['bolus','Bolus [mg]',function(R){return R.drugs.pro.n.bLo}],['rate','Wlew [µg/kg/min]',function(){return 20}]],rmax:200,ramb:80,c:function(v,W){var mh=v.rate*W*60/1000;return['bolus = '+fmt(v.bolus/10)+' ml (10 mg/ml)','wlew '+fmt(mh)+' mg/h = '+fmt(r1(mh/10))+' ml/h'];}},
 tpn:{f:[['bolus','Bolus [mg]',function(R){return R.drugs.tpn.n.bLo}],['rate','Wlew [mg/kg/h]',function(){return 0.5}]],rmax:5,bmax:1000,c:function(v,W){var mh=v.rate*W;return['bolus = '+fmt(v.bolus/25)+' ml (25 mg/ml), ≤50 mg/min → '+fmt(v.bolus/50)+' min','wlew '+fmt(mh)+' mg/h = '+fmt(r1(mh/25))+' ml/h (25 mg/ml)'];}},
 midbuc:{f:[['dose','Dawka [mg]',function(){return 10}]],max:10,c:function(v){return['= '+fmt(v.dose/5)+' ml Buccolam (5 mg/ml) lub '+fmt(v.dose/10)+' ml Epistatus (10 mg/ml)'];}},
 dzpr:{f:[['dose','Dawka [mg]',function(){return 10}]],max:20,c:function(v){return['= '+fmt(v.dose/4)+' ml (Relsed 10 mg/2,5 ml) = '+fmt(v.dose/10)+' mikrowlewki 10 mg','ChPL: maks. łącznie 30 mg'];}},
 fos:{f:[['dose','Dawka [mg PE]',function(R){return R.drugs.fos.n.mg}]],max:1500,c:function(v){return['≥'+fmt(v.dose/150)+' min przy 150 mg PE/min (NCS); ESETT 10 min','brak preparatu w RPL'];}},
 ket:{f:[['bolus','Bolus [mg]',function(R){return R.drugs.ket.n.bLo}],['rate','Wlew [mg/kg/h]',function(){return 3}]],rmax:10,c:function(v,W){var mh=v.rate*W;return['bolus = '+fmt(v.bolus/50)+' ml (50 mg/ml)','wlew '+fmt(mh)+' mg/h = '+fmt(r1(mh/50))+' ml/h (50 mg/ml)'];}}
};
function defaults(k,R){var e=ED[k],o={};e.f.forEach(function(x){o[x[0]]=x[2](R);});return o;}
function edit(k,v,W,R){var e=ED[k],x=R.drugs[k],out={lines:[],warn:[],bad:false};
 if(!(W>0))return out;var dose=v.dose!=null?v.dose:v.bolus;
 for(var i=0;i<e.f.length;i++){var val=v[e.f[i][0]];if(!(val>=0)){out.warn.push('Wpisz liczbę: '+e.f[i][1]);out.bad=true;return out;}}
 out.mgkg=dose/W;out.lines.push(fmt(dose)+' mg = '+fmt(dose/W)+' mg/kg');out.lines=out.lines.concat(e.c(v,W));
 var mx=k==='lcm'?x.n.maxDay:e.max;
 if(mx!=null&&dose>mx+1e-9){out.warn.push('Powyżej maks. '+fmt(mx)+' mg');out.bad=true;}
 if(k==='dzp'&&dose>x.n.left24+1e-9){out.warn.push('Przekracza ChPL 3 mg/kg/24 h (pozostało '+fmt(x.n.left24)+' mg)');out.bad=true;}
 if(k==='pht'&&dose>x.n.chpl17+1e-9)out.warn.push('Powyżej ChPL 17 mg/kg ('+fmt(x.n.chpl17)+' mg) — zgodnie z wytycznymi 20 mg/kg');
 if(k==='lev'&&dose>3000)out.warn.push('Powyżej ChPL 3000 mg/dobę (wytyczne do 4500 mg)');
 if(e.rmax&&v.rate>e.rmax+1e-9){out.warn.push('Wlew powyżej zakresu wytycznych (maks. '+fmt(e.rmax)+')');out.bad=true;}
 if(e.ramb&&v.rate>e.ramb)out.warn.push('>80 µg/kg/min — ryzyko PRIS przy >48 h (NCS)');
 if(e.bmax&&v.bolus>e.bmax)out.warn.push('Bolus >1 g — powyżej ChPL (maks. pojedyncza dawka 1 g)');
 return out;}
var LN={midbuc:'Midazolam podpoliczkowo',dzpr:'Diazepam doodbytniczo',fos:'Fosfenytoina i.v.',lzp:'Lorazepam (Lorabex) i.v.',dzp:'Diazepam (Relanium) i.v.',midim:'Midazolam i.m.',midiv:'Midazolam i.v.',czp:'Klonazepam i.v.',lev:'Lewetyracetam (Keppra) i.v.',vpa:'Walproinian (Depakine) i.v.',pht:'Fenytoina (Epanutin) i.v.',lcm:'Lakozamid i.v.',pb:'Fenobarbital i.v.',mid3:'Midazolam',pro:'Propofol',tpn:'Tiopental',ket:'Ketamina'};
function logText(k,v,W,R){var base=LN[k];var e=ED[k];
 if(e.f.length===1)return base+' '+fmt(v.dose)+' mg ('+fmt(v.dose/W)+' mg/kg)';
 var u=e.f[1][1].match(/\[(.*)\]/)[1];return base+': bolus '+fmt(v.bolus)+' mg + wlew '+fmt(v.rate)+' '+u;}
function phase(min){if(!(min>=0))return null;
 var a=min<5?'0–5 min: stabilizacja':min<20?'5–20 min: 1. rzut (benzodiazepina)':min<40?'20–40 min: 2. rzut':'≥40 min: 3. rzut — anestetyki z ciągłym EEG';
 var p=min<5?'przed t1 (5 min)':min<30?'SE wczesny (5–30 min)':min<60?'SE ustalony (30–60 min)':'SE oporny (>60 min) → OIOM';
 return{aes:a,pte:p,tab:min<20?1:min<40?2:3};}
return{S:S,ED:ED,defaults:defaults,edit:edit,logText:logText,compute:compute,checkWeight:checkWeight,levMaint:levMaint,fmt:fmt,phase:phase};});
