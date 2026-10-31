(function(r,f){const m=f();if(typeof module==='object'&&module.exports)module.exports=m;else r.SORClinical=m;})(this,function(){
'use strict';
const finite=Number.isFinite,positive=x=>finite(x)&&x>0;
const adultWeight=w=>finite(w)&&w>=30&&w<=250;
function fail(message){return{ok:false,message};}
function ufhStart(w,amount,volume,omit){
 if(!adultWeight(w))return fail('Podaj i zweryfikuj masę dorosłego 30–250 kg. Poza tym zakresem dawkę ustala się indywidualnie.');
 if(!positive(amount)||!positive(volume)||amount/volume>1000||amount/5000>=volume)return fail('Nieprawidłowe przygotowanie UFH: objętość końcowa musi być większa niż objętość leku; stężenie ≤1000 j.m./ml.');
 const rawBolus=80*w,rawRate=18*w,bolus=omit?0:Math.min(10000,Math.round(rawBolus/100)*100),rate=Math.min(2000,Math.round(rawRate/50)*50),concentration=amount/volume;
 return{ok:true,w,rawBolus,rawRate,bolus,rate,perKg:rate/w,concentration,mlh:rate/concentration,drugMl:amount/5000,diluentMl:volume-amount/5000,hours:amount/rate,units24:rate*24,ml24:rate*24/concentration,vials24:Math.ceil(rate*24/25000),check:(rate/concentration)*concentration,capBolus:rawBolus>10000,capRate:rawRate>2000};
}
// Downstate PTSAF-19, 01/2026, Appendix A, Table 2 (NON-ICU). Not a universal laboratory target.
function ufhAdjust(i){
 if(i.bleeding!==false)return fail('Krwawienie: ocena pilna. Bez potwierdzonego braku krwawienia nomogram jest zablokowany.');
 if(i.postLysis!==false||i.otherAnticoagulant!==false)return fail('Po trombolizie lub przy możliwym nakładaniu antykoagulantów potrzebna jest indywidualna decyzja; zwykły nomogram nie obowiązuje.');
 if(i.local!==true||i.baselineNormal!==true)return fail('Potwierdź lokalną zgodność nomogramu 60–80 s oraz prawidłowy wyjściowy APTT. Nieprawidłowy APTT: rozważ monitorowanie anty-Xa i konsultację.');
 if(!adultWeight(i.w)||!positive(i.current)||!positive(i.aptt)||!positive(i.concentration))return fail('Podaj masę, rzeczywistą bieżącą dawkę j.m./h, kontrolny APTT i stężenie.');
 if(i.aptt>300)return fail('APTT >300 s: pilna ocena, krwawienie i wiarygodność próbki; nie wyliczono automatycznego wznowienia.');
 let delta=0,hold=0,next=6,bolusTable=null;
 if(i.aptt<45){delta=3*i.w;bolusTable=i.w<60?2000:i.w<85?3000:i.w>85&&i.w<110?4000:i.w>110?5000:null;}
 else if(i.aptt<60)delta=2*i.w;
 else if(i.aptt<=80){next=i.twoTherapeutic===true?24:6;}
 else if(i.aptt<=90)delta=-3*i.w;
 else {delta=-3*i.w;hold=2;next=2;}
 const rate=i.current+delta;
 if(rate<=0)return fail('Wyliczona dawka ≤0. Wstrzymaj automatyczne przeliczenie i ustal dalsze leczenie indywidualnie.');
 return{ok:true,rate,mlh:rate/i.concentration,perKg:rate/i.w,delta,hold,next,bolusTable,bolusAmbiguous:i.aptt<45&&(i.w===85||i.w===110),therapeutic:i.aptt>=60&&i.aptt<=80};
}
function tpa(w,concentration,mode){
 if(!adultWeight(w)||![1,2].includes(concentration))return fail('Podaj masę 30–250 kg i potwierdź stężenie alteplazy 1 lub 2 mg/ml.');
 if(mode==='rapid'){const total=Math.min(.6*w,50);return{ok:true,total,bolus:0,infusion:total,ml:total/concentration,mlh:total/concentration*4,minutes:15,offLabel:true};}
 const total=w<65?1.5*w:100,bolus=10,infusion=total-bolus;
 return{ok:true,total,bolus,infusion,bolusMl:bolus/concentration,ml:infusion/concentration,mlh:infusion/concentration/2,minutes:120,offLabel:false};
}
function enox(w,crcl,stable,aki){
 if(stable!==true||aki!==false)return fail('Niestabilność, możliwa reperfuzja lub AKI: oceń UFH zamiast rutynowego schematu HDCz.');
 if(!adultWeight(w)||!positive(crcl))return fail('Brakuje zweryfikowanej masy lub CrCl Cockcrofta–Gaulta. Nie zastępuj CrCl przez eGFR.');
 if(crcl<15)return fail('CrCl <15 ml/min: enoksaparyna niezalecana w tym wskazaniu; oceń UFH.');
 const interval=crcl<=30?24:12;return{ok:true,mg:w,iu:w*100,interval,ml:w/100,renal:interval===24};
}
function doac(crcl,drug,day){
 if(!['apixaban','rivaroxaban'].includes(drug))return fail('Nieznany lek DOAC.');
 if(!positive(crcl)||!Number.isInteger(day)||day<1)return fail('Podaj CrCl i potwierdzony dzień leczenia danym DOAC. Czas wcześniejszej heparyny oceń osobno.');
 if(crcl<15)return fail('CrCl <15 ml/min: nie zaleca się apiksabanu ani rywaroksabanu; ustal inne leczenie.');
 return drug==='apixaban'?{ok:true,mg:day<=7?10:5,interval:12,caution:crcl<30,food:false}:{ok:true,mg:day<=21?15:20,interval:day<=21?12:24,caution:crcl<30,food:true};
}
function pump(w,dose,amountMg,volume){
 if(!adultWeight(w)||!positive(dose)||!positive(amountMg)||!positive(volume))return fail('Podaj dodatnią dawkę, ilość leku i objętość końcową oraz masę dorosłego.');
 const concentration=amountMg*1000/volume,ugmin=dose*w,mlh=ugmin*60/concentration;
 if(!finite(mlh)||mlh<=0)return fail('Nieprawidłowy wynik pompy.');
 return{ok:true,concentration,ugmin,mgh:ugmin*60/1000,mlh,hours:volume/mlh,inverse:mlh*concentration/(60*w)};
}
function curb(i){
 const missing=[],items=[];let score=0;
 const n=(key,lab,fn)=>{if(!finite(i[key]))missing.push(lab);else if(fn(i[key])){score++;items.push(lab);}};
 if(typeof i.confusion!=='boolean')missing.push('splątanie');else if(i.confusion){score++;items.push('splątanie');}
 n('urea','mocznik >7 mmol/l',v=>v>7);n('rr','oddechy ≥30/min',v=>v>=30);
 if(!finite(i.sbp)||!finite(i.dbp)){if((finite(i.sbp)&&i.sbp<90)||(finite(i.dbp)&&i.dbp<=60)){score++;items.push('hipotensja');}else missing.push('SBP i DBP');}else if(i.sbp<90||i.dbp<=60){score++;items.push('hipotensja');}
 n('age','wiek ≥65',v=>v>=65);
 return{score,complete:missing.length===0,missing,items};
}
const psiFlags=[['nursing',10,'dom opieki'],['cancer',30,'nowotwór'],['liver',20,'choroba wątroby'],['heart',10,'niewydolność serca'],['stroke',10,'choroba naczyniowa mózgu'],['renal',10,'choroba nerek'],['confusion',20,'zaburzenia świadomości'],['effusion',10,'płyn opłucnowy']];
const psiNumbers=[['rr',20,'oddechy',v=>v>=30],['sbp',20,'SBP',v=>v<90],['temp',15,'temperatura',v=>v<35||v>=40],['hr',10,'HR',v=>v>=125],['ph',30,'pH tętnicze',v=>v<7.35],['urea',20,'mocznik',v=>v>=10.71],['na',20,'Na',v=>v<130],['glu',10,'glukoza',v=>v>=13.88],['hct',10,'hematokryt',v=>v<30]];
function psi(i){
 let score=0;const missing=[],breakdown=[];
 if(!finite(i.age)||i.age<18)missing.push('wiek dorosłego');else {score=i.age-(i.sex==='f'?10:0);breakdown.push(['wiek/płeć',score]);}
 if(!['m','f'].includes(i.sex))missing.push('płeć');
 psiFlags.forEach(([k,p,l])=>{if(typeof i[k]!=='boolean')missing.push(l);else if(i[k]){score+=p;breakdown.push([l,p]);}});
 psiNumbers.forEach(([k,p,l,fn])=>{if(!finite(i[k]))missing.push(l);else if(fn(i[k])){score+=p;breakdown.push([l,p]);}});
 const oxygenKnown=finite(i.pao2)||finite(i.spo2),oxygenLow=(finite(i.pao2)&&i.pao2<60)||(finite(i.spo2)&&i.spo2<90);
 if(!oxygenKnown)missing.push('PaO₂ / SpO₂');else if(oxygenLow){score+=10;breakdown.push(['hipoksemia',10]);}
 const stepFlags=['cancer','liver','heart','stroke','renal','confusion'];
 const step1=finite(i.age)&&i.age<=50&&i.age>=18&&stepFlags.every(k=>i[k]===false)&&finite(i.rr)&&i.rr<30&&finite(i.sbp)&&i.sbp>=90&&finite(i.hr)&&i.hr<125&&finite(i.temp)&&i.temp>=35&&i.temp<40;
 const cls=step1?'I':score<=70?'II':score<=90?'III':score<=130?'IV':'V';
 return{score,cls,step1,complete:step1||missing.length===0,missing:step1?[]:missing,breakdown};
}
function severeCap(i){
 const major=[],minor=[],missing=[];
 ['ventilation','vasopressor'].forEach(k=>{if(i[k]===true)major.push(k);else if(typeof i[k]!=='boolean')missing.push(k);});
 [['rr',v=>v>=30],['pf',v=>v<=250],['urea',v=>v>=7.14],['wbc',v=>v<4],['platelets',v=>v<100],['temp',v=>v<36]].forEach(([k,fn])=>{if(!finite(i[k]))missing.push(k);else if(fn(i[k]))minor.push(k);});
 ['multilobar','confusion','fluidHypotension'].forEach(k=>{if(i[k]===true)minor.push(k);else if(typeof i[k]!=='boolean')missing.push(k);});
 return{severe:major.length>0||minor.length>=3,major,minor,missing,complete:missing.length===0};
}
function capDisposition(i){
 const c=curb(i),p=psi(i),s=severeCap(i),reasons=[];
 if(s.severe)reasons.push('ciężkie PZP: kryterium duże lub ≥3 małe ATS/IDSA');
 if(finite(i.spo2)&&i.spo2<90)reasons.push('SpO₂ <90%');
 if(finite(i.sbp)&&i.sbp<90)reasons.push('SBP <90 mmHg');
 if(c.score>=3)reasons.push('CURB-65 ≥3');
 if(!p.step1&&p.score>90)reasons.push('PSI co najmniej klasa IV');
 if(i.oral===false)reasons.push('brak tolerancji doustnej');
 const admit=reasons.length>0,complete=c.complete&&p.complete&&s.complete;
 return{curb:c,psi:p,severe:s,admit,reasons,level:admit?'red':'orange',message:admit?'HOSPITALIZACJA / pilna ocena poziomu nadzoru':c.score===2?'Rozważ hospitalizację lub leczenie pod ścisłym nadzorem':'Ocena kliniczna i warunków opieki; wynik skali sam nie stanowi zgody na wypis',complete};
}
function capRegimen(i){
 const drugs=[],notes=[],blocks=[];const add=(name,dose,route,form,note)=>drugs.push({name,dose,route,form,note});
 if(i.confirmed!==true||!positive(i.crcl))return{drugs,blocks:['Potwierdź PZP i CrCl.'],notes};
 if(i.allergy!=='none'||i.preg!==false||i.liver!==false||i.immuno!==false||i.aki!==false||i.dialysis!==false)return{drugs,blocks:['Alergia, ciąża/karmienie, ciężka choroba wątroby, immunosupresja, AKI lub dializa wymagają indywidualnego schematu.'],notes};
 if(i.aspiration!==false)return{drugs,blocks:['Ropień/ropniak: indywidualna terapia i kontrola źródła; nie stosuj prostego schematu PZP.'],notes};
 if(!finite(i.weight)||i.weight<40)return{drugs,blocks:['Dawkowanie tabletek dla dorosłego ≥40 kg; potwierdź masę.'],notes};
 const out=i.place==='out';if(!['out','ward','severe'].includes(i.place))return{drugs,blocks:['Ustal miejsce leczenia.'],notes};
 if(out){
  if(i.oral!==true||i.crcl<=30||i.pseudo!==false||i.mrsa!==false||i.recent!==false)return{drugs,blocks:['Leczenie ambulatoryjne tym zestawem nie jest odpowiednie: tolerancja p.o., nerki lub ryzyko oporności.'],notes};
  if(i.comorbid===false)add('amoksycylina','1 g co 8 h','p.o.','tabletka 1 g','Plan 5 dni z kontrolą po 48–72 h; wydłużenie przy braku stabilizacji. CrCl >30. Monitoruj alergię, biegunkę, interakcje metotreksat/VKA.');
  else if(i.comorbid===true){add('amoksycylina + kwas klawulanowy','875 mg +125 mg co 12 h','p.o.','tabletka 875/125 mg','Plan 5 dni, ocena po 48–72 h; podawaj na początku posiłku. CrCl >30. Nie stosuj przy wcześniejszej żółtaczce/uszkodzeniu wątroby po tym połączeniu. Alergia: wstrzymaj i oceń.');}
  else blocks.push('Ustal choroby współistniejące.');
 }else{
  if(i.pseudo===true||(i.recent===true&&i.place==='severe')){
   const h=i.crcl>40?6:i.crcl>=20?8:12;
   add('piperacylina + tazobaktam','4 g +0,5 g co '+h+' h','i.v.','fiolka 4 g +0,5 g','Wlew 30 min wg ChPL; dłuższy wlew wyłącznie wg lokalnego protokołu. Odstęp uwzględnia CrCl '+(Math.round(i.crcl*10)/10)+' ml/min. Kontroluj nerki, Na/K, morfologię i neurotoksyczność; deeskalacja po posiewie. Pierwsza dawka i dalsze dawkowanie w ciężkim zakażeniu do oceny lekarza.');
  }else if(i.recent===true){blocks.push('Hospitalizacja + antybiotyk i.v. w 90 dniach przy nieciężkim PZP: posiewy i lokalna walidacja ryzyka; sam ten fakt nie nakazuje szerokiego leczenia.');}
  else if(i.crcl>=10)add('ceftriakson','2 g co 24 h','i.v.','proszek, 2 × fiolka 1 g','Podanie według ChPL (zwykle infuzja ≥30 min); nie mieszaj z roztworami wapnia. Zwykle bez korekty nerkowej; monitoruj alergię, morfologię, wątrobę, biegunkę. Czas według stabilizacji; przegląd 48–72 h.');
  else blocks.push('CrCl <10 ml/min: indywidualna terapia.');
 }
 const atypicalNeeded=!out||i.comorbid===true;
 if(atypicalNeeded){
  if(i.qt!==false)blocks.push('Ryzyko QT: makrolid nie został zaproponowany; konieczne alternatywne pokrycie atypowe przed akceptacją kompletu.');
  else if(i.oral===true)add('azytromycyna','500 mg co 24 h','p.o.','tabletka 500 mg','Proponowane 3 dni, łącznie 1,5 g dla tej postaci; nie jest monoterapią ciężkiego PZP. Cały czas leczenia skojarzonego zależy od przebiegu. QT, K/Mg, wątroba, interakcje digoksyna/VKA.');
  else blocks.push('Potrzebne pokrycie atypowe i.v. (np. azytromycyna 500 mg co 24 h wg ścieżki IDSA); lokalnej postaci i.v. i przygotowania nie potwierdzono.');
 }
 if(!out&&i.mrsa===true){
  if(i.serotonin!==false)blocks.push('MRSA: linezolid wymaga oceny leków serotoninergicznych / inhibitorów MAO i innych przeciwwskazań; alternatywą jest wankomycyna z monitorowaniem ekspozycji.');
  else add('linezolid','600 mg co 12 h',i.oral===true?'p.o.':'i.v.',i.oral===true?'tabletka 600 mg':'roztwór 2 mg/ml, worek 300 ml','i.v. w 30–120 min, p.o. przy tolerancji. Zwykle bez korekty nerkowej, lecz przy CrCl <30 duża ostrożność i ryzyko małopłytkowości. Morfologia/PLT, mleczany i interakcje serotoninergiczne; ChPL PZP: 10–14 dni. Okres do indywidualizacji po posiewach, nie automatycznie 5 dni. Leczenie MRSA po uzgodnieniu; linezolid nie pokrywa Gram-ujemnych.');
 }
 return{drugs,blocks,notes};
}

function gaps(i){
 const ag=finite(i.na)&&finite(i.cl)&&finite(i.hco3)?i.na-i.cl-i.hco3:NaN;
 const agK=finite(ag)&&finite(i.k)?ag+i.k:NaN;
 let ethanol=NaN;
 if(finite(i.ethanol)&&i.ethanol>=0)ethanol=i.ethanolUnit==='gL'?i.ethanol*100/4.607:i.ethanolUnit==='mmol'?i.ethanol:i.ethanol/4.607;
 const calculated=[i.na,i.glu,i.urea,ethanol].every(finite)?2*i.na+i.glu+i.urea+ethanol:NaN;
 return{ag,agK,ethanolMmol:ethanol,calculated,osmGap:finite(i.osm)&&finite(calculated)?i.osm-calculated:NaN};
}
function extrip(i){
 const g=gaps(i),reasons=[],suggest=[];
 ['coma','seizure'].forEach(k=>{if(i[k]===true)reasons.push(k==='coma'?'śpiączka':'drgawki');});
 if(i.toxin==='methanol'){
  if(i.vision===true)reasons.push('nowe zaburzenia widzenia');
  if(finite(i.ph)&&i.ph<=7.15)reasons.push('pH ≤7,15');
  if(finite(g.ag)&&g.ag>24)reasons.push('AG bez K >24 mmol/l');
  if(i.aki===true)reasons.push('upośledzona funkcja nerek');
  const lim=i.antidote==='fomepizole'?70:i.antidote==='ethanol'?60:i.antidote==='none'?50:NaN;
  if(finite(lim)&&finite(i.level)&&i.level>lim)reasons.push('stężenie metanolu przekracza próg EXTRIP dla wybranej odtrutki');
 }else{
  if(i.aki===true)reasons.push('AKI KDIGO 2–3');
  if(finite(g.agK)&&g.agK>27)reasons.push('AG z K >27 mmol/l');else if(finite(g.agK)&&g.agK>=23)suggest.push('AG z K 23–27 mmol/l');
  if(i.antidote==='fomepizole'&&i.level>310)suggest.push('glikol >310 mg/dl przy fomepizolu');
  if(i.antidote==='ethanol'){if(i.level>310)reasons.push('glikol >310 mg/dl przy etanolu');else if(i.level>=124)suggest.push('glikol 124–310 mg/dl przy etanolu');}
  if(i.antidote==='none'&&i.level>62)reasons.push('glikol >62 mg/dl bez odtrutki');
  if(i.exposure===true&&finite(g.osmGap)){
   if(i.antidote==='none'&&g.osmGap>10)reasons.push('luka osmolalna >10 bez odtrutki');
   if(i.antidote==='ethanol'&&g.osmGap>50)reasons.push('luka osmolalna >50 przy etanolu');else if(i.antidote==='ethanol'&&g.osmGap>=20)suggest.push('luka osmolalna 20–50 przy etanolu');
   if(i.antidote==='fomepizole'&&g.osmGap>50)suggest.push('luka osmolalna >50 przy fomepizolu');
  }
 }
 if(i.persistentAcidosis===true&&i.toxin==='methanol')reasons.push('utrzymująca się kwasica mimo leczenia');
 return{reasons,suggest,gaps:g,urgent:reasons.length>0||suggest.length>0};
}
function fomepizole(w,stage,diluentMl=100){if(!['loading','maintenance','later'].includes(stage))return fail('Nieznany etap leczenia.');if(!adultWeight(w))return fail('Podaj masę dorosłego 30–250 kg.');if(!finite(diluentMl)||diluentMl<100||diluentMl>500)return fail('Podaj 100–500 ml rozcieńczalnika.');const perKg=stage==='maintenance'?10:15,mg=w*perKg,concentrateMl=mg/1000,volume=diluentMl+concentrateMl;return{ok:true,perKg,mg,concentrateMl,diluentMl,volume,concentration:mg/volume,mlh:volume*2,minutes:30};}
return{ufhStart,ufhAdjust,tpa,enox,doac,pump,curb,psi,severeCap,capDisposition,psiFlags,psiNumbers,capRegimen,gaps,extrip,fomepizole,adultWeight};
});
