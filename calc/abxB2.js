// ETAP B2 – silnik: Cockcroft–Gault z korektą masy, ogólny silnik korekty nerkowej antybiotyków,
// dobór empiryczny w pozaszpitalnym zapaleniu płuc, skale sepsy (qSOFA/SOFA/NEWS2), pakiet pierwszej godziny i wybór wg ogniska.
// Wszystkie reguły mają źródło w data/antybiotyki_renal.js (SK.abxData.SRC). Brak danych => brak wyniku, nigdy domyślne „prawidłowe”.
(function(r,f){var D=(typeof module==='object'&&module.exports)?require('../data/antybiotyki_renal.js'):r.SK.abxData;var m=f(D);if(typeof module==='object'&&module.exports)module.exports=m;else{r.SK=r.SK||{};r.SK.abxB2=m;}})(this,function(D){
var DR=D.DRUGS,SRC=D.SRC;
var DEC='DO DECYZJI LEKARZA';
function nz(x){return typeof x==='number'&&isFinite(x);}
function num(x){if(typeof x==='number')return isFinite(x)?x:NaN;if(x==null||x==='')return NaN;var n=Number(String(x).replace(',','.'));return isFinite(n)?n:NaN;}
function r1(x){return Math.round(x*10)/10;}
// ---------- Cockcroft–Gault z korektą masy (UNMC/Nebraska ASP) ----------
// IBW: M 50 + 2,3 × (cale ponad 5 stóp); K 45,5 + 2,3 × (cale ponad 5 stóp). Masa: rzeczywista, jeśli < IBW; skorygowana IBW+0,4×(rz−IBW), jeśli >120% IBW; w przeciwnym razie IBW.
function ibw(h,sex){h=num(h);if(!(h>=100&&h<=230)||(sex!=='m'&&sex!=='f'))return NaN;var inch=h/2.54;return (sex==='m'?50:45.5)+2.3*(inch-60);}
function cg(p){p=p||{};var age=num(p.age),w=num(p.w),h=num(p.h),sex=p.sex,cr=num(p.crMg);var u=num(p.crUmol);if(!nz(cr)&&nz(u))cr=u/88.42;
 var miss=[];if(!(age>=18&&age<=110))miss.push(nz(age)?'wiek poza zakresem 18–110 lat':'wiek');if(sex!=='m'&&sex!=='f')miss.push('płeć');if(!(w>=25&&w<=350))miss.push(nz(w)?'masa ciała poza zakresem 25–350 kg':'masa ciała');
 if(!(cr>=0.2&&cr<=20))miss.push(nz(cr)?'kreatynina poza zakresem 0,2–20 mg/dl (18–1768 µmol/l)':'kreatynina');
 if(miss.length)return{ok:false,missing:miss,crcl:NaN};
 var ib=ibw(h,sex),wu=w,basis='masa rzeczywista (brak wzrostu – nie oceniono otyłości/niedowagi)',flag=false;
 if(nz(ib)){if(w<ib){wu=w;basis='masa rzeczywista (< IBW)';}else if(w>1.2*ib){wu=ib+0.4*(w-ib);basis='masa skorygowana (IBW + 0,4 × nadwyżka; masa >120% IBW)';}else{wu=ib;basis='masa należna (IBW)';}}else flag=true;
 var c=(140-age)*wu/(72*cr)*(sex==='f'?0.85:1);var act=(140-age)*w/(72*cr)*(sex==='f'?0.85:1);
 var bmi=nz(h)&&h>=100?w/Math.pow(h/100,2):NaN;var ext=[];if(w<40)ext.push('masa <40 kg');if(w>150)ext.push('masa >150 kg');if(nz(bmi)&&bmi<16)ext.push('BMI <16');if(nz(bmi)&&bmi>=40)ext.push('BMI ≥40');
 return{ok:true,crcl:Math.round(c*10)/10,crclActual:Math.round(act*10)/10,wUsed:r1(wu),ibw:nz(ib)?r1(ib):NaN,basis:basis,heightMissing:flag,bmi:nz(bmi)?r1(bmi):NaN,extreme:ext,crMg:cr,crUmol:Math.round(cr*88.42)};}
// ---------- korekta nerkowa ----------
function match(t,c){if(t.gt!=null&&!(c>t.gt))return false;if(t.ge!=null&&!(c>=t.ge))return false;if(t.lt!=null&&!(c<t.lt))return false;if(t.le!=null&&!(c<=t.le))return false;return true;}
// rrt: 'none'|'hd'|'crrt'|'pd'
function renal(id,crcl,rrt){var d=DR[id];if(!d)return{ok:false,text:'nieznany lek',status:'dec'};rrt=rrt||'none';
 var out={id:id,name:d.n,std:d.std,ver:d.ver,src:d.src,note:d.note||'',hepatic:d.hepatic||'',qt:!!d.qt};
 if(rrt!=='none'){var s=rrt==='hd'?d.hd:rrt==='crrt'?d.crrt:d.pd;var lab={hd:'hemodializa (HD)',crrt:'CRRT',pd:'dializa otrzewnowa'}[rrt];
  if(!s){out.text=DEC+': brak zweryfikowanego dawkowania w tej wersji dla: '+lab+' ('+d.n+'). Pierwsza dawka pełna; dalej konsultacja farmaceuty klinicznego / ChPL.';out.status='dec';out.mod=true;return out;}
  out.text=lab+': '+s;out.status=/DO DECYZJI/.test(s)||/Rozbieżn/.test(s)?'dec':'rrt';out.mod=true;if(d.norenal)out.mod=false;return out;}
 if(d.ver==='dec'||!d.rn.length){out.text=DEC+': korekta nerkowa niezweryfikowana w tej wersji ('+d.n+'). Pierwsza dawka pełna.';out.status='dec';out.mod=false;return out;}
 if(!nz(crcl)||crcl<=0||crcl>400){out.text='brak CrCl – nie obliczono korekty nerkowej (dawka standardowa: '+d.std+')';out.status='nocrcl';out.mod=false;return out;}
 for(var i=0;i<d.rn.length;i++){var t=d.rn[i];if(match(t,crcl)){out.text=t.t;out.mod=!!t.mod;out.avoid=!!t.avoid;out.tdm=!!t.tdm;out.status=t.avoid?'avoid':t.mod?'adj':'ok';return out;}}
 out.text=DEC+': CrCl poza zdefiniowanymi przedziałami.';out.status='dec';return out;}
// przy dawce innej niż standardowa tekst korekty nie może wprowadzać w błąd
function nrm(x){return String(x||'').replace(/\s*(i\.v\.\/p\.o\.|p\.o\.\/i\.v\.|p\.o\.|i\.v\.)/g,'').trim();}
function rtx(r,d,dose){if(!dose||nrm(dose)===nrm(d.std)||r.status==='dec'||r.status==='nocrcl'||r.status==='rrt'&&false)return r.text;
 if(r.status==='ok'&&/^bez zmiany/.test(r.text))return 'bez korekty nerkowej (CrCl w zakresie bez zmiany dawki)';
 if(r.status==='ok')return r.text;
 return 'uwaga: korekta dotyczy dawki standardowej ('+d.std+'): '+r.text+' – dla dawki '+dose+' przelicz/ustal: '+DEC;}
// ---------- Pozaszpitalne zapalenie płuc ----------
var CAPSRC='NPOA 2020 (rozdz. 2.4, 13.1.2), NPOA 2016; ATS/IDSA 2019; ERS/ESICM/ESCMID/ALAT 2023; ATS 2025';
function capPlan(i){i=i||{};var res={ok:false,needs:[],decisions:[],warnings:[],avoid:[],regimens:[],duration:[],crcl:null,notes:[],src:CAPSRC};
 var age=num(i.age);var adult=age>=18&&age<=110;
 if(!['out','ward','icu'].includes(i.setting)){res.needs.push('miejsce leczenia (ambulatoryjnie / oddział / ciężkie PZP)');}
 if(!adult)res.needs.push(nz(age)?'wiek poza zakresem 18–110 lat (moduł dla dorosłych)':'wiek (pasek pacjenta)');
 if(i.confirmed!==true)res.needs.push('potwierdzenie rozpoznania PZP (RTG/USG/TK + objawy)');
 [['allergy','alergia na β-laktamy (wywiad)',['none','late','immediate'].includes(i.allergy)],['preg','ciąża / karmienie',['none','pregnant','breast'].includes(i.preg)],['liver','choroba wątroby (brak / łagodna / ciężka)',['none','mild','severe'].includes(i.liver)],
  ['qt','wydłużony QT / leki wydłużające QT',i.qt===true||i.qt===false],['mrsa','MRSA w wywiadzie / czynnik ryzyka',i.mrsa===true||i.mrsa===false],['pseudo','Pseudomonas w wywiadzie / czynnik ryzyka',i.pseudo===true||i.pseudo===false],
  ['recentHosp','hospitalizacja + antybiotyk pozajelitowy w 90 dniach',i.recentHosp===true||i.recentHosp===false]].forEach(function(x){if(!x[2])res.needs.push(x[1]);});
 if(i.setting==='out'&&!(i.comorb===true||i.comorb===false))res.needs.push('choroby współistniejące (serce, płuca, wątroba, nerki, cukrzyca, alkoholizm, nowotwór, asplenia)');
 if(res.needs.length){res.msg='Brak wyniku – uzupełnij dane.';return res;}
 var c=cg(i);res.crcl=c;var rrt=i.rrt||'none';
 if(!c.ok){res.warnings.push('Nie obliczono CrCl – brakuje: '+c.missing.join(', ')+'. Dawki pokazano jako standardowe (bez korekty nerkowej), poza dializą.');}
 if(c.ok&&c.extreme.length)res.decisions.push('Skrajna masa ciała ('+c.extreme.join(', ')+'): CrCl i dawki zależne od masy – '+DEC+'.');
 var crcl=c.ok?c.crcl:NaN;
 var allergy=i.allergy||'none'; // none|late|immediate (immediate oraz ciężka późna)
 var pregn=i.preg==='pregnant'||i.preg==='breast';var qt=i.qt===true,liver=i.liver==='severe';
 var bl=allergy==='immediate'; // wykluczenie β-laktamów
 var penAvoid=allergy==='late'||allergy==='immediate';
 var mac=!qt, fq=!qt&&!pregn&&!liver, doxy=!pregn;
 if(qt)res.avoid.push('Makrolidy i fluorochinolony – wydłużony QT / leki wydłużające QT / niewyrównane K-Mg (QTc).');
 if(pregn)res.avoid.push('Doksycyklina i fluorochinolony – ciąża/karmienie (zasada ogólna; '+SRC.preg+').');
 if(liver)res.avoid.push('Moksyfloksacyna – ciężka niewydolność wątroby (Child-Pugh C; ChPL).');
 if(allergy==='late')res.avoid.push('Penicyliny (amoksycylina, amoksycylina/klawulanian, ampicylina, piperacylina/tazobaktam, kloksacylina, penicylina G) – alergia późna na penicyliny.');
 if(allergy==='immediate')res.avoid.push('Wszystkie β-laktamy w schemacie empirycznym – alergia natychmiastowa/ciężka reakcja skórna (NPOA 2016: makrolid/fluorochinolon; konsultacja alergologiczna).');
 var mrsa=i.mrsa===true,pseudo=i.pseudo===true,recent=i.recentHosp===true;
 function D1(id,dose,role){var d=DR[id];var rr=renal(id,crcl,rrt);return{id:id,name:d.n,route:d.form,dose:dose||d.std,renal:rtx(rr,d,dose),renalStatus:rr.status,mod:rr.mod,role:role||'',note:[d.note,rr.hepatic].filter(Boolean).join(' '),src:d.src};}
 var out=[];
 function reg(label,drugs,why,src){out.push({label:label,drugs:drugs,why:why||'',src:src||''});}
 function macroDrug(){return D1('azi',null,'makrolid');}
 // Wybór wg ciężkości
 if(i.setting==='out'){
  if(mrsa||pseudo){res.decisions.push('Ambulatoryjnie przy znanej kolonizacji/zakażeniu MRSA lub Pseudomonas w ciągu roku: brak zweryfikowanego schematu empirycznego p.o. – ocena hospitalizacji, posiewy; '+DEC+' (ATS/IDSA 2019: ocena i posiew, NPOA 2020: antybiotyk o aktywności odpowiedniej do czynnika).');}
  else if(!i.comorb){
   if(!penAvoid)reg('Pierwszy wybór (NPOA 2020, ATS/IDSA 2019)',[D1('amox_po','1 g co 8 h p.o.')],'Amoksycylina 1 g co 8 h – lek pierwszego wyboru (pneumokok).','NPOA 2020; ATS/IDSA 2019 tab. 3');
   var alt=[];
   if(doxy)alt.push(D1('doxy','100 mg co 12 h p.o.','alternatywa'));
   if(mac){alt.push(D1('clari','500 mg co 12 h p.o.','alternatywa (makrolid)'));alt.push(D1('azi','500 mg w 1. dobie, potem 250 mg co 24 h przez 4 dni p.o. (lub 500 mg raz na dobę przez 3 dni – NPOA 2020)','alternatywa (makrolid)'));}
   if(alt.length)reg('Alternatywy – tylko gdy lokalna oporność pneumokoków na makrolid/doksycyklinę <20% (NPOA 2020; ATS: <25% dla makrolidu)',alt,'Wybierz JEDEN lek z listy. Oporność lokalną ustala lekarz: '+DEC+'.','NPOA 2020; ATS/IDSA 2019');
   if(penAvoid&&!alt.length)res.decisions.push('Alergia na penicyliny + przeciwwskazania do doksycykliny i makrolidów: brak zweryfikowanego schematu doustnego – '+DEC+'.');
  }else{
   if(!penAvoid){var a1=[D1('amoxclav_po','1 g (875/125 mg) co 12 h p.o.','β-laktam')];var a2=[];if(doxy)a2.push(D1('doxy','100 mg co 12 h p.o.','dodatek'));if(mac){a2.push(D1('clari','500 mg co 12 h p.o.','dodatek (makrolid)'));a2.push(D1('azi','500 mg w 1. dobie, potem 250 mg co 24 h p.o.','dodatek (makrolid)'));}
    if(a2.length)reg('Choroby współistniejące (serce, płuca, wątroba, nerki, cukrzyca, alkoholizm, nowotwór, asplenia): β-laktam + doksycyklina LUB makrolid',a1.concat(a2),'Amoksycylina/klawulanian 1 g co 12 h p.o. (NPOA 2020; ATS/IDSA: 500/125 co 8 h, 875/125 co 12 h lub 2000/125 co 12 h) PLUS jeden dodatek.','NPOA 2020; ATS/IDSA 2019 tab. 3');}
   var f=[];if(fq){f.push(D1('levo','750 mg co 24 h p.o.','fluorochinolon'));if(!liver)f.push(D1('moxi','400 mg co 24 h p.o.','fluorochinolon'));}
   if(f.length)reg('Alternatywa: fluorochinolon w monoterapii (rezerwowany – rozważ ryzyka)',f,'Wybierz JEDEN lek. Fluorochinolony: ryzyko ścięgien, OUN, glikemii, QT, tętniaka aorty.','NPOA 2020; ATS/IDSA 2019');
   if(!out.length)res.decisions.push('Brak bezpiecznego zweryfikowanego schematu doustnego przy zadanych ograniczeniach (alergia/QT/ciąża/wątroba) – '+DEC+'; rozważ leczenie szpitalne.');}
 }else{ // ward / icu
  var severe=i.setting==='icu',bls=[];
  var antiPs=(pseudo||(recent&&severe));var antiMrsa=(mrsa||(recent&&severe));
  if(bl){
   // alergia natychmiastowa – bez β-laktamów (NPOA 2016)
   var d1=[];if(fq){d1.push(D1('levo','750 mg co 24 h i.v.','fluorochinolon'));if(!liver)d1.push(D1('moxi','400 mg co 24 h i.v.','fluorochinolon'));}
   if(severe&&d1.length){reg('Alergia natychmiastowa, ciężkie PZP (NPOA 2016): fluorochinolon + glikopeptyd lub linezolid',d1.concat([D1('vanco',null,'glikopeptyd'),D1('linez',null,'alternatywa dla wankomycyny')]),'Zgodnie z NPOA 2016 w cięższych przypadkach glikopeptyd lub linezolid + moksyfloksacyna/lewofloksacyna. Konsultacja alergologiczna/OIT: '+DEC+'.','NPOA 2016');}
   else if(d1.length)reg('Alergia natychmiastowa (NPOA 2016): fluorochinolon w monoterapii (7–10 dni) lub makrolid',d1.concat(mac?[D1('clari','500 mg co 12 h','makrolid'),D1('azi',null,'makrolid')]:[]),'Wybierz JEDEN lek.','NPOA 2016');
   else if(mac)reg('Alergia natychmiastowa (NPOA 2016): makrolid',[D1('clari','500 mg co 12 h','makrolid'),D1('azi',null,'makrolid')],'W ciężkim PZP monoterapia makrolidem jest niewystarczająca – '+DEC+'.','NPOA 2016');
   else res.decisions.push('Alergia natychmiastowa na β-laktamy + przeciwwskazania do makrolidów i fluorochinolonów (QT/ciąża/wątroba): brak zweryfikowanego schematu – '+DEC+' (konsultacja zakaźna/alergologiczna).');
  }else{
   var beta;
   if(pseudo){var ps=[];if(!penAvoid)ps.push(D1('ptz',null,'przeciwpseudomonasowy'));ps.push(D1('cftz',null,'przeciwpseudomonasowy'));ps.push(D1('cfep',null,'przeciwpseudomonasowy'));ps.push(D1('mero',null,'przeciwpseudomonasowy'));ps.push(D1('imi','500 mg co 6 h i.v.','przeciwpseudomonasowy'));
    reg('Pseudomonas w drogach oddechowych w ciągu roku: ZAMIAST ceftriaksonu – jeden β-laktam przeciwpseudomonasowy',ps,'NPOA 2020 (13.1.2): ceftazydym 2 g/8 h, pip/taz 4,5 g/6 h, cefepim 2 g/8 h, meropenem 1 g/8 h lub imipenem 500 mg/6 h; dodatkowo makrolid LUB fluorochinolon jak niżej.','NPOA 2020');
    if(allergy==='late')res.decisions.push('Alergia późna na penicyliny: cefalosporyny/karbapenemy przeciwpseudomonasowe – ryzyko reakcji krzyżowej niskie, ale '+DEC+'.');}
   else{beta=[D1('cftx','2 g co 24 h i.v.','β-laktam')];beta.push(D1('cfx','2 g co 8 h i.v.','β-laktam – alternatywa'));
    reg(severe?'Ciężkie PZP: β-laktam + makrolid (preferowane, NPOA 2020 / ERS 2023) — wybierz JEDEN β-laktam':'PZP wymagające hospitalizacji: β-laktam + makrolid — wybierz JEDEN β-laktam',beta,allergy==='late'?'Alergia późna (nieciężka): NPOA 2016 dopuszcza ceftriakson/cefotaksym; unikaj penicylin.':'Ceftriakson 2 g co 24 h lub cefotaksym 2 g co 8 h (NPOA 2020; ATS/IDSA: ceftriakson 1–2 g, cefotaksym 1–2 g co 8 h).','NPOA 2020; ATS/IDSA 2019 tab. 4');}
   // drugi filar
   if(mac){reg('Dodatek: makrolid (preferowany – działanie przeciwbakteryjne i immunomodulujące)',[D1('azi','500 mg co 24 h i.v.','makrolid'),D1('clari','500 mg co 12 h i.v.','makrolid')],'Wybierz JEDEN. Azytromycyna – mniej interakcji; klarytromycyna – silny inhibitor CYP3A4. ERS 2023: makrolid zamiast fluorochinolonu w ciężkim PZP; czas makrolidu 3–5 dni.','NPOA 2020; ERS 2023');}
   if(fq&&!pseudo)reg('Alternatywa dla β-laktam + makrolid: fluorochinolon (+ β-laktam w ciężkim PZP)',[D1('levo','750 mg co 24 h i.v./p.o.','fluorochinolon'),D1('moxi','400 mg co 24 h i.v./p.o.','fluorochinolon')].filter(function(x){return !(liver&&x.id==='moxi');}),severe?'W ciężkim PZP fluorochinolon łącz z β-laktamem (NPOA 2020, rozdz. 13.1.2).':'Monoterapia fluorochinolonem dopuszczalna (NPOA 2020; ATS/IDSA 2019: warunkowo).','NPOA 2020; ATS/IDSA 2019');
   if(fq&&pseudo)reg('Pseudomonas – fluorochinolon (lewofloksacyna) jako druga substancja (NPOA 2020: schemat jak wyżej z makrolidem lub fluorochinolonem)',[D1('levo','750 mg co 24 h i.v.','fluorochinolon')],'DO DECYZJI LEKARZA: wybór makrolid vs fluorochinolon przy Pseudomonas.','NPOA 2020');
   if(!mac&&!fq){reg('Przeciwwskazania do makrolidów i fluorochinolonów (QT/ciąża/wątroba): β-laktam + doksycyklina (ATS/IDSA 2019 – opcja trzecia)',doxy?[D1('doxy','100 mg co 12 h p.o./i.v.','dodatek')]:[],doxy?'Opcja warunkowa, niska jakość dowodów; '+DEC+'.':'',"ATS/IDSA 2019");if(!doxy)res.decisions.push('QT + ciąża/karmienie: brak zweryfikowanego dodatku atypowego (makrolid/FQ/doksycyklina wykluczone) – '+DEC+'.');}
  }
  if(antiMrsa&&!bl){reg('Pokrycie MRSA (czynnik ryzyka: '+(mrsa?'MRSA w drogach oddechowych w ciągu roku':'hospitalizacja + antybiotyk pozajelitowy w 90 dniach, ciężkie PZP – ATS/IDSA 2019')+') — wybierz JEDEN, do czasu posiewów',[D1('vanco',null,'glikopeptyd'),D1('linez','600 mg co 12 h i.v./p.o.','oksazolidynon')],'NPOA 2020: wankomycyna (ładowanie 25–30 mg/kg) lub linezolid 600 mg co 12 h. Wankomycyna: dawkowanie podtrzymujące WYŁĄCZNIE wg stężeń. '+(i.serotonin===true?'Zaznaczono interakcję serotoninergiczną – unikaj linezolidu.':'Sprawdź interakcje serotoninergiczne (linezolid).'),'NPOA 2020; ATS/IDSA 2019');}
  if(recent&&!severe&&!pseudo&&!mrsa)res.notes.push('Hospitalizacja + antybiotyk pozajelitowy w ciągu 90 dni, PZP nieciężkie: ATS/IDSA 2019 – pobierz posiewy/PCR; nie rozszerzaj pokrycia MRSA/Pseudomonas, dopóki wyniki lub lokalne dane nie wskażą potrzeby ('+DEC+').');
  if(recent&&severe&&!pseudo)res.decisions.push('Ciężkie PZP + hospitalizacja i antybiotyk pozajelitowy w 90 dniach: ATS/IDSA 2019 – dodać pokrycie MRSA i Pseudomonas oraz posiewy. Dla Pseudomonas wybierz β-laktam przeciwpseudomonasowy (patrz wyżej tylko po zaznaczeniu „Pseudomonas”) – '+DEC+'.');
 }
 if(i.aspiration==='abscess')res.decisions.push('Ropień płuca / ropniak: ATS/IDSA 2019 – rozważ pokrycie beztlenowców (β-laktam z inhibitorem β-laktamaz lub klindamycyna); schemat i dawki wg ChPL – '+DEC+'.');
 else if(i.aspiration==='pneumonitis')res.notes.push('Zachłyśnięcie bez ropnia/ropniaka: ATS/IDSA 2019 – nie dodawaj rutynowo pokrycia beztlenowców (zapalenie chemiczne często ustępuje w 24–48 h bez antybiotyku).');
 if(i.nursing===true)res.notes.push('Mieszkaniec domu opieki: ATS/IDSA 2019 (po zniesieniu pojęcia HCAP) – sama przynależność nie uzasadnia rozszerzenia spektrum; oceń czynniki ryzyka MRSA/Pseudomonas ('+DEC+').');
 if(rrt!=='none')res.warnings.push('Dializa/CRRT: pierwsza dawka zawsze pełna; dawki w CRRT zależą od modalności i strumienia – konsultacja farmaceuty klinicznego ('+DEC+').');
 if(i.preg==='breast')res.warnings.push('Karmienie piersią: amoksycylina i azytromycyna uznawane za zgodne z karmieniem (NHS 2025); doksycyklina/fluorochinolony – '+DEC+'.');
 if(i.preg==='pregnant')res.warnings.push('Ciąża: amoksycylina – lek preferowany; azytromycyna – gdy konieczne (dane niepełne); klarytromycyna, linezolid, karbapenemy, ertapenem – brak zweryfikowanych zasad: '+DEC+' (ChPL, konsultacja położnicza).');
 // QT dodatkowo: klarytromycyna i azytromycyna wydłużają QT – już wykluczone
 res.regimens=out;
 // czas leczenia
 res.duration=['NPOA 2020/2016: ok. 3 dni od normalizacji temperatury i stabilizacji (łącznie ok. 7 dni); drobnoustroje atypowe 7–14 dni; S. aureus 14 dni.','ATS/IDSA 2019: minimum 5 dni i stabilizacja kliniczna; ATS 2025: nieciężkie PZP po stabilizacji – krócej niż 5 dni (min. 3 dni), ciężkie ≥5 dni; ERS 2023: makrolid 3–5 dni. Różnice międzynarodowe – skracanie '+DEC+'.'];
 if(i.setting==='icu')res.notes.push('GKS w ciężkim PZP: ATS 2025 – sugeruje (poza grypą), nie w nieciężkim; ERS 2023 – sugeruje przy wstrząsie (metyloprednizolon 0,5 mg/kg co 12 h przez 5 dni jest rozsądną opcją; wyłączenia: wirusowe PZP, niekontrolowana cukrzyca). Polskie rekomendacje 2020 tego nie rozstrzygają – '+DEC+'.');
 res.ok=out.length>0||res.decisions.length>0;res.msg=res.ok?'':'Brak schematu.';
 res.sources=['npoa20','npoa16','ats19','ats25','ers23','unmc','einstein','fk','moxi','cefotax','preg'].map(function(k){return SRC[k];});
 return res;}
// ---------- Skale sepsy ----------
// qSOFA wg NPOA 2020: RR >22/min, zaburzenia świadomości, SBP <100 mmHg (uwaga: Sepsis-3 używa RR ≥22)
function qsofa(p){p=p||{};var rr=num(p.rr),sbp=num(p.sbp),alt=p.altered;var items=[],unk=[];
 if(nz(rr)&&rr>=4&&rr<=80)items.push(rr>22);else unk.push('RR');
 if(nz(sbp)&&sbp>=30&&sbp<=300)items.push(sbp<100);else unk.push('SBP');
 if(alt===true||alt===false)items.push(alt);else unk.push('świadomość');
 var s=items.filter(Boolean).length;
 // 5.0-D: równolegle Sepsis-3 (Singer, JAMA 2016): RR ≥22, SBP ≤100 – wynik różny przy RR=22 lub SBP=100 jest pokazywany (ryzyko mylnej interpretacji)
 var s3=(nz(rr)&&rr>=4&&rr<=80&&rr>=22?1:0)+(nz(sbp)&&sbp>=30&&sbp<=300&&sbp<=100?1:0)+(alt===true?1:0);
 return{score:s,s3:s3,differs:s3!==s,known:items.length,missing:unk,complete:unk.length===0,positive:s>=2,positive3:s3>=2,note:'qSOFA – NPOA 2020: RR >22/min; SSC 2021 odradza qSOFA jako jedyne narzędzie przesiewowe.'};}
function sofa(p){p=p||{};var parts=[],miss=[];
 var pf=num(p.pf),vent=p.vent===true;
 if(nz(pf)&&pf>=20&&pf<=700){parts.push(['układ oddechowy',pf>=400?0:pf>=300?1:pf>=200?2:(vent?(pf>=100?3:4):2)]);}else miss.push('PaO₂/FiO₂');
 var plt=num(p.plt);if(nz(plt)&&plt>=0&&plt<=2000)parts.push(['płytki',plt>=150?0:plt>=100?1:plt>=50?2:plt>=20?3:4]);else miss.push('PLT');
 var bil=num(p.bili);// mg/dl
 if(nz(bil)&&bil>=0&&bil<=60)parts.push(['bilirubina',bil<1.2?0:bil<2.0?1:bil<6.0?2:bil<=12?3:4]);else miss.push('bilirubina');
 var map=num(p.map),ne=num(p.ne),epi=num(p.epi),dopa=num(p.dopa),dobu=p.dobu===true;var cv=null;
 if(nz(ne)&&ne>0.1||nz(epi)&&epi>0.1||nz(dopa)&&dopa>15)cv=4;else if(nz(ne)&&ne>0||nz(epi)&&epi>0||nz(dopa)&&dopa>5)cv=3;else if(dobu||nz(dopa)&&dopa>0)cv=2;else if(nz(map)&&map>=30&&map<=200)cv=map<70?1:0;
 if(cv!=null)parts.push(['układ krążenia',cv]);else miss.push('MAP / wazopresory');
 var gcs=num(p.gcs);if(nz(gcs)&&gcs>=3&&gcs<=15)parts.push(['OUN (GCS)',gcs===15?0:gcs>=13?1:gcs>=10?2:gcs>=6?3:4]);else miss.push('GCS');
 var cr=num(p.crMg),uo=num(p.uo);var rn=null;if(nz(cr)&&cr>=0.2&&cr<=20)rn=cr<1.2?0:cr<2.0?1:cr<3.5?2:cr<=5.0?3:4;if(nz(uo)&&uo>=0){var u=uo<200?4:uo<500?3:0;rn=rn==null?(u?u:null):Math.max(rn,u);}
 if(rn!=null)parts.push(['nerki',rn]);else miss.push('kreatynina / diureza');
 var tot=parts.reduce(function(a,x){return a+x[1];},0);return{score:tot,parts:parts,missing:miss,assessed:parts.length,complete:miss.length===0,note:'SOFA wg NPOA 2020 (tab. 32); brakujące elementy NIE są liczone jako 0 – wynik „co najmniej”.'};}
function news2(p){p=p||{};var miss=[],pts=0,red=false,rows=[];
 function add(name,v){rows.push([name,v]);pts+=v;if(v===3)red=true;}
 var rr=num(p.rr);if(nz(rr)&&rr>=3&&rr<=80)add('oddechy',rr<=8?3:rr<=11?1:rr<=20?0:rr<=24?2:3);else miss.push('RR');
 var sp=num(p.spo2),sc2=p.scale2===true;
 if(nz(sp)&&sp>=40&&sp<=100){if(!sc2)add('SpO₂ (skala 1)',sp<=91?3:sp<=93?2:sp<=95?1:0);else{var ox=p.o2===true;add('SpO₂ (skala 2)',sp<=83?3:sp<=85?2:sp<=87?1:sp<=92?0:!ox?0:sp<=94?1:sp<=96?2:3);}}else miss.push('SpO₂');
 if(p.o2===true||p.o2===false)add('tlen/powietrze',p.o2?2:0);else miss.push('tlen / powietrze');
 var sbp=num(p.sbp);if(nz(sbp)&&sbp>=30&&sbp<=300)add('SBP',sbp<=90?3:sbp<=100?2:sbp<=110?1:sbp<=219?0:3);else miss.push('SBP');
 var hr=num(p.hr);if(nz(hr)&&hr>=15&&hr<=300)add('tętno',hr<=40?3:hr<=50?1:hr<=90?0:hr<=110?1:hr<=130?2:3);else miss.push('tętno');
 if(p.cvpu===true||p.cvpu===false)add('świadomość (ACVPU)',p.cvpu?3:0);else miss.push('świadomość');
 var t=num(p.temp);if(nz(t)&&t>=25&&t<=45)add('temperatura',t<=35.0?3:t<=36.0?1:t<=38.0?0:t<=39.0?1:2);else miss.push('temperatura');
 var cls=pts>=7?'emergency':(pts>=5||red)?'urgent':pts>=1?'low-med':'low';
 return{score:pts,rows:rows,missing:miss,complete:miss.length===0,red:red,cls:cls,
  txt:pts>=7?'≥7: reakcja pilna/„emergency”, ciągłe monitorowanie, ocena zespołu intensywnej terapii':pts>=5?'5–6: pilna ocena kliniczna':red?'pojedynczy parametr = 3: pilna ocena':pts>=1?'1–4: niskie ryzyko; kontrola wg wyniku':'0',src:SRC.news2};}
// ---------- Ocena sepsy ----------
function sepsisAssess(p){p=p||{};var q=qsofa(p),s=sofa(p),n=news2(p);var inf=p.infection===true;
 var flags=[];if(!inf)return{ok:false,msg:'Brak wyniku: nie zaznaczono podejrzenia zakażenia.',q:q,s:s,n:n};
 var any=q.known+s.assessed+n.rows.length;if(!any)return{ok:false,msg:'Brak wyniku: brak jakichkolwiek parametrów.',q:q,s:s,n:n};
 var susp=q.positive||s.score>=2||n.score>=5||n.red;if(q.positive)flags.push('qSOFA ≥2');if(s.score>=2)flags.push('SOFA ≥2 (co najmniej '+s.score+')');if(n.score>=5)flags.push('NEWS2 ≥5');if(n.red&&n.score<5)flags.push('NEWS2: parametr = 3');
 var vaso=p.vasopressor===true,lac=num(p.lac);var shock=vaso&&nz(lac)&&lac>2;var shockPossible=vaso&&!nz(lac);
 var hyper=nz(lac)&&lac>=2;
 return{ok:true,suspected:susp,flags:flags,shock:shock,shockPossible:shockPossible,hypoperfusion:hyper||p.hypotension===true,q:q,s:s,n:n,highLik:susp,
  msg:shock?'WSTRZĄS SEPTYCZNY (wg NPOA 2020/Sepsis-3: wazopresor do MAP ≥65 + mleczany >2 mmol/l po resuscytacji płynowej)':susp?'Podejrzenie sepsy – wysokie prawdopodobieństwo (kryteria: '+flags.join(', ')+')':'Kryteria sepsy nie spełnione w podanych danych – nie wyklucza zakażenia; kontroluj dynamikę.'};}
// ---------- pakiet pierwszej godziny ----------
function bundle(p){p=p||{};var w=num(p.w);var o={};o.fluidMl=(w>=25&&w<=350)?Math.round(30*w/50)*50:NaN; // zaokrąglenie do 50 ml
 o.fluidRaw=(w>=25&&w<=350)?30*w:NaN;o.fluidNote=(w>150||(nz(p.bmi)&&p.bmi>=35))?'Otyłość/masa >150 kg: SSC 2021 nie precyzuje masy dla 30 ml/kg – '+DEC+' (masa rzeczywista vs skorygowana).':'';
 o.fluidCaution=(p.heart===true||p.renal===true)?'Niewydolność serca/nerek: SSC 2021 – 30 ml/kg jest sugestią (słaba, niska jakość); oceń odpowiedź na płyny (CRT, USG, parametry dynamiczne) i ryzyko przeładowania – '+DEC+'.':'';
 o.antibioticWithin=p.shock===true?'natychmiast, najlepiej ≤1 h (SSC 2021, rek. 12)':p.highLik===true?'natychmiast, najlepiej ≤1 h przy wysokim prawdopodobieństwie sepsy (SSC 2021); NPOA 2020 zwraca uwagę, że poza wstrząsem standardy SEP-1/CMS przyjmują ≤3 h':'szybka ocena zakażenia vs przyczyny nieinfekcyjnej; jeśli podejrzenie zakażenia utrzymuje się – antybiotyk ≤3 h (SSC 2021, rek. 14)';
 o.map=65;o.hydrocortisone='Hydrokortyzon 200 mg/dobę (50 mg co 6 h lub wlew ciągły) – gdy noradrenalina/adrenalina ≥0,25 µg/kg/min przez ≥4 h (SSC 2021, rek. 58).';
 o.vasopressin='Wazopresyna jako drugi lek – zwykle przy noradrenalinie 0,25–0,5 µg/kg/min (SSC 2021, rek. 38); adrenalina jako kolejna opcja (rek. 39).';
 o.norepi='Noradrenalina – lek pierwszego wyboru (SSC 2021, rek. 37); nie opóźniaj – możliwy start obwodowo (rek. 44). Dawkowanie i pompa: moduł „Pompy SOR / Ostra niewydolność serca” (B1); zakres miareczkowania ustala lekarz.';
 return o;}
// ---------- antybiotyki w sepsie wg ogniska ----------
var SOURCES={
 lung:'Płuca (PZP)',uti:'Układ moczowy',abd:'Jama brzuszna (pozażółciowe)',bil:'Drogi żółciowe',skin:'Skóra / tkanki miękkie z martwicą',cns:'OUN (zapalenie opon)',unk:'Nieznane ognisko',mening:'Sepsa meningokokowa (podejrzenie)'};
function sepsisAbx(p){p=p||{};var src=p.source;if(!SOURCES[src])return{ok:false,msg:'Wybierz ognisko zakażenia.'};
 var age=num(p.age);if(!(age>=18&&age<=110))return{ok:false,msg:'Brak wyniku: podaj wiek 18–110 lat (moduł dla dorosłych).'};
 var c=cg(p);var crcl=c.ok?c.crcl:NaN;var rrt=p.rrt||'none';var allergy=p.allergy||'none';
 var out={ok:true,crcl:c,regimens:[],warnings:[],decisions:[],notes:[],src:[SRC.npoa20,SRC.npoa14,SRC.ssc21,SRC.unmc,SRC.einstein,SRC.fk]};
 if(!c.ok)out.warnings.push('Nie obliczono CrCl – brakuje: '+c.missing.join(', ')+'. Pierwsza dawka i tak pełna; dalsze dawki bez korekty nerkowej NIE są zweryfikowane.');
 if(c.ok&&c.extreme.length)out.decisions.push('Skrajna masa ciała ('+c.extreme.join(', ')+') – '+DEC+'.');
 out.notes.push('Pierwsza dawka każdego antybiotyku jest PEŁNA, niezależnie od nerek; korekta dotyczy dawek kolejnych (wiele źródeł zaleca nie zmniejszać dawek β-laktamów w pierwszych 24–48 h sepsy: '+DEC+').');
 function L(id,dose){var d=DR[id],r=renal(id,crcl,rrt);return{id:id,name:d.n,route:d.form,dose:dose||d.std,renal:rtx(r,d,dose),renalStatus:r.status,mod:r.mod,note:[d.note,r.hepatic].filter(Boolean).join(' ')};}
 function R(label,drugs,why){out.regimens.push({label:label,drugs:drugs,why:why||''});}
 var imm=allergy==='immediate',late=allergy==='late';
 var mrsa=p.mrsa===true,esbl=p.esbl===true,pseudo=p.pseudo===true,hosp=p.hospital===true,mdr=p.mdr===true;
 var pen=!(imm||late);
 if(imm)out.decisions.push('Alergia natychmiastowa/ciężka reakcja skórna na β-laktamy: brak zweryfikowanego schematu empirycznego bez β-laktamów w sepsie – NIE opóźniaj leczenia; konsultacja zakaźna/alergologiczna: '+DEC+'. (NPOA 2016 dla PZP: makrolid/fluorochinolon + glikopeptyd/linezolid.)');
 else{
 if(late)out.warnings.push('Alergia późna na penicyliny: pominięto schematy z penicyliną/pip-taz/ampicyliną/kloksacyliną; cefalosporyny i karbapenemy – '+DEC+'.');
 if(src==='lung'){
  if(hosp||pseudo){R('Szpitalne/respiratorowe zapalenie płuc (NPOA 2020, 13.1.4): β-laktam przeciwpseudomonasowy'+(p.shock?' – we wstrząsie 2 leki aktywne wobec Pseudomonas (DO DECYZJI wg lokalnej lekowrażliwości)':''),(pen?[L('ptz')]:[]).concat([L('cfep'),L('mero'),L('imi','500 mg co 6 h i.v.')]),'Wybierz JEDEN (lub dwa w szoku wg lokalnej lekowrażliwości – '+DEC+'). MRSA >20% izolatów OIT: dodaj wankomycynę lub linezolid.');}
  else{R('Sepsa z ciężkiego PZP (NPOA 2020): β-laktam + makrolid (preferowane)',[L('cftx'),L('cfx'),L('azi','500 mg co 24 h i.v.'),L('clari','500 mg co 12 h i.v.')],'Jeden β-laktam (ceftriakson LUB cefotaksym) + jeden makrolid (azytromycyna LUB klarytromycyna).');
   R('Alternatywa: β-laktam + fluorochinolon',[L('cftx'),L('levo','750 mg co 24 h i.v.'),L('moxi','400 mg co 24 h i.v.')],'Ceftriakson/cefotaksym + lewofloksacyna LUB moksyfloksacyna. NPOA 2014 (SOR): ceftriakson 2 g + lewofloksacyna 500 mg 1–2×/dobę – rozbieżne z 2020 (750 mg) – '+DEC+'.');}
 }
 if(src==='uti'){
  if(esbl||hosp||mdr||pseudo)R('Zakażenie szpitalne / ryzyko MDR (NPOA 2020): β-laktam szerokiego spektrum albo karbapenem',(pen?[L('ptz')]:[]).concat([L('mero'),L('imi','500 mg co 6–8 h i.v.')]),'Ceftolozan/tazobaktam i ceftazydym/awibaktam (NPOA 2020) – dawkowanie nerkowe niezweryfikowane: '+DEC+'. ESBL(+): karbapenem.');
  else R('Pozaszpitalne (NPOA 2020, 13.1.4): cefalosporyna III/IV gen., pip/taz lub karbapenem',[L('cftx'),L('cfx'),L('cftz'),L('cfep')].concat(pen?[L('ptz','4,5 g co 6–8 h i.v.')]:[]).concat([L('mero')]),'Wybierz JEDEN lek.');
 }
 if(src==='abd'){
  R('Zakażenie wewnątrzbrzuszne pozażółciowe (NPOA 2020)',(pen?[L('ptz')]:[]).concat([L('mero'),L('imi','500 mg co 6–8 h i.v.')]),'Wybierz JEDEN lek.'+(hosp?' Zakażenie szpitalne: modyfikacja wg czynników ryzyka MDR (glikopeptyd, linezolid, aminoglikozyd – '+DEC+'); rozważ lek przeciwgrzybiczy przy czynnikach ryzyka kandydozy.':''));
  R('Terapia skojarzona (NPOA 2020)',[L('metro','500 mg co 8 h i.v.')].concat(pen?[L('amp_q6','1–2 g co 6–8 h i.v.')]:[]).concat([L('cftz'),L('cfep'),L('cipro')]),'Metronidazol + ampicylina + JEDEN: ceftazydym / cefepim / cyprofloksacyna.');
  out.notes.push('Kontrola ogniska (source control) – SSC 2021, rek. 27: jak najszybciej, w ciągu 6–12 h, gdy możliwa.');}
 if(src==='bil'){
  R('Zakażenie dróg żółciowych (NPOA 2020): β-laktam + wankomycyna',(pen?[L('ptz')]:[]).concat([L('mero'),L('imi','500 mg co 6–8 h i.v.'),L('vanco')]),'JEDEN β-laktam (pip/taz LUB meropenem LUB imipenem) + wankomycyna (ładowanie 25–30 mg/kg, dalej wg stężeń).');
  R('Schemat bez karbapenemu (NPOA 2020)',[L('metro','500 mg co 8 h i.v.'),L('cftz'),L('cfep'),L('vanco')],'Metronidazol + ceftazydym LUB cefepim + wankomycyna.');
  out.notes.push('Kontrola ogniska (drenaż dróg żółciowych) – SSC 2021, rek. 27.');}
 if(src==='skin'){
  R('Zakażenie z martwicą – martwicze zapalenie powięzi, zgorzel gazowa, zgorzel Fourniera (NPOA 2020)',[L('vanco'),L('linez','600 mg co 12 h i.v.')].concat(pen?[L('ptz')]:[]).concat([L('mero'),L('imi','500 mg co 6–8 h i.v.')]),'JEDEN z (wankomycyna LUB linezolid) + JEDEN z (pip/taz LUB meropenem LUB imipenem).');
  out.notes.push('Pilne opracowanie chirurgiczne (source control) – SSC 2021, rek. 27. Zakażenia skóry bez martwicy: brak zweryfikowanego schematu w tym module – '+DEC+'.');}
 if(src==='cns'){
  R('Empiryczne leczenie bakteryjnego zapalenia opon (NPOA 2020, tab. 26–27), dorośli ≤50 lat',[L('cftx','2 g co 12 h i.v. (4 g/dobę w 2 dawkach)'),L('vanco')],'Ceftriakson (4 g/dobę w 2 dawkach) LUB cefotaksym (8–12 g/dobę) + wankomycyna.');
  var older=age>50||p.immuno===true;
  if(older)R('Powyżej 50 r.ż. lub niedobór odporności: dodaj ampicylinę (Listeria)',[L('amp_q4','2 g co 4 h i.v. (12 g/dobę)')],'NPOA 2020 tab. 26. Niedobór odporności: wankomycyna + ampicylina + (cefepim lub meropenem).');
  out.notes.push('Deksametazon i punkcja lędźwiowa: NIE opóźniaj antybiotyku; szczegóły – Etap C (neuroinfekcje) – '+DEC+'. Dawkowanie ceftriaksonu w ZOMR zgodnie z NPOA 2020 tab. 27 (4 g/dobę, adult).');}
 if(src==='unk'){
  R('Ognisko nieznane (NPOA 2020, 13.1.4 – pozaszpitalne)',[L('cftx')].concat(pen?[L('clox')]:[]).concat([L('vanco')]).concat(pen?[L('ptz')]:[]).concat([L('mero'),L('imi','500 mg co 6–8 h i.v.')]),'Opcje (wybierz JEDNĄ): ceftriakson + kloksacylina 2 g co 4 h; ceftriakson + wankomycyna; pip/taz + wankomycyna; karbapenem + wankomycyna.');
  if(hosp)out.notes.push('Szpitalne ognisko nieznane (NPOA 2020): pip/taz + wankomycyna LUB karbapenem + wankomycyna.');}
 if(src==='mening'){
  R('Podejrzenie sepsy meningokokowej (NPOA 2020): antybiotyk niezwłocznie po pobraniu posiewów',[L('cftx','2 g co 12–24 h i.v.')].concat([L('cfx')]).concat(pen?[L('pen_g')]:[]),'JEDEN z: ceftriakson 2 g co 12–24 h / cefotaksym 2 g co 8 h / penicylina G 4 mln j.m. co 4 h. Punkcja lędźwiowa nie może opóźnić antybiotyku; leczenie w warunkach OIT.');}
 }
 // MRSA / ESBL dodatki
 if(!imm){
  if(mrsa&&!['skin','bil','cns','unk'].includes(src))R('Dodatkowo – pokrycie MRSA (ryzyko / kolonizacja)',[L('vanco'),L('linez','600 mg co 12 h i.v.')],'JEDEN lek; wankomycyna wg stężeń.');
  if(esbl&&['lung','abd'].includes(src))out.notes.push('ESBL(+) / wysokie ryzyko: karbapenem (meropenem/imipenem) – '+DEC+' zgodnie z lokalną lekowrażliwością.');
  if(p.mdr===true)out.notes.push('Wysokie ryzyko MDR: SSC 2021 – dwa leki aktywne wobec Gram-ujemnych tylko przy wysokim ryzyku MDR; deeskalacja codziennie (rek. 17–21, 29); wydłużony wlew β-laktamów (rek. 25).');
 }
 out.notes.push('Przegląd po 48–72 h: wyniki posiewów, deeskalacja, czas leczenia (SSC 2021, rek. 29–30; NPOA 2020: 7–10 dni jest uproszczeniem).');
 return out;}
// ---------- raport/spójność pomocnicze ----------
function selfCheck(){var bad=[];Object.keys(DR).forEach(function(k){var d=DR[k];if(!d.src||!d.src.length)bad.push(k+': brak źródła');d.src.forEach(function(s){if(!SRC[s])bad.push(k+': nieznane źródło '+s);});
 if(d.ver!=='dec'&&!d.rn.length)bad.push(k+': brak przedziałów');
 // ciągłość przedziałów: każdy CrCl 0..200 trafia dokładnie w jeden przedział
 if(d.rn.length){for(var c=0;c<=200;c+=0.5){var n=d.rn.filter(function(t){return match(t,c);}).length;if(n!==1){bad.push(k+': CrCl '+c+' pasuje do '+n+' przedziałów');break;}}}});return bad;}
return{cg:cg,ibw:ibw,renal:renal,capPlan:capPlan,qsofa:qsofa,sofa:sofa,news2:news2,sepsisAssess:sepsisAssess,bundle:bundle,sepsisAbx:sepsisAbx,SOURCES:SOURCES,selfCheck:selfCheck,DEC:DEC,DRUGS:DR,SRC:SRC};});
