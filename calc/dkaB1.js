(function(r,f){var m=f();if(typeof module==='object'&&module.exports)module.exports=m;else{r.SK=r.SK||{};r.SK.dkaB1=m;}})(this,function(){
// ETAP B1 – DKA / HHS: insulina w pompie (j./h i ml/h), warunek potasowy, zmniejszenie wlewu + glukoza, monitorowanie, kryteria ustąpienia.
// Wszystkie wartości laboratoryjne wewnątrz w SI (glukoza, mocznik – mmol/l). Puste lub nierealne dane → brak wyniku (null / NaN), nic nie jest zgadywane.
var SRC={
 ADA:'ADA/EASD/JBDS/AACE/DTS – Hyperglycemic crises in adults with diabetes: consensus report 2024 (Diabetes Care 47:1257; Diabetologia 67:1650)',
 JBDS:'JBDS-IP 02 – Management of DKA in adults, 03.2023',
 JBDSH:'JBDS-IP 06 – Management of HHS in adults, 2022',
 INS:'ChPL NovoRapid (stężenie 0,05–1,0 j./ml w NaCl 0,9%); lokalna baza Pomp SOR (pen 100 j./ml)',
 KCL:'ChPL Kalium chloratum WZF 15% (maks. 40 mmol/l, 10 mmol/h przy K⁺ >3, 20 mmol/h przy K⁺ <3; 200 mmol/dobę)'};
var CFG={kHold:3.5,gluReduceMmol:250/18.016,rateStart:0.1,rateReduced:0.05,rateHHS:0.05,dexMlh:125,gluTargetMmol:200/18.016,
 conc:{min:0.05,max:1.0},allowedSyringe:[20,50]};
function nz(x){return typeof x==='number'&&isFinite(x);}
function r2(x){return Math.round(x*100)/100;}
// ---- strzykawka / pompa ----
// units – j. insuliny (z pena 100 j./ml), ml – objętość końcowa strzykawki (20 lub 50)
function syringe(units,ml){var o={ok:false,warn:[]};if(!(nz(units)&&units>0)||CFG.allowedSyringe.indexOf(ml)<0)return o;
 var conc=units/ml;o.units=units;o.ml=ml;o.conc=conc;o.insMl=units/100;o.diluentMl=ml-units/100;
 if(o.diluentMl<=0){o.warn.push('Objętość insuliny ≥ objętość strzykawki');return o;}
 if(conc<CFG.conc.min-1e-9||conc>CFG.conc.max+1e-9){o.warn.push('Stężenie '+(Math.round(conc*1000)/1000)+' j./ml poza zakresem ChPL NovoRapid 0,05–1,0 j./ml – wynik niedostępny');return o;}
 o.ok=true;return o;}
function mlh(uh,conc){return nz(uh)&&nz(conc)&&conc>0?uh/conc:NaN;}
function rateRow(w,perKg,conc){if(!(w>0)||!nz(perKg))return null;var uh=perKg*w;return{perKg:perKg,uh:uh,mlh:mlh(uh,conc)};}
// ---- warunek potasowy i suplementacja (ADA 2024; JBDS 2023; ChPL KCl) ----
function potassium(k){if(!nz(k)||k<=0||k>12)return{status:'unknown',txt:'Brak K⁺ – nie ustalono warunku startu insuliny. Oznacz K⁺ (gazometria / jonogram) PRZED insuliną.',hold:true,lvl:'red'};
 if(k<CFG.kHold)return{status:'hold',hold:true,lvl:'red',rateMmolH:10,txt:'K⁺ <3,5 mmol/l: NIE rozpoczynaj insuliny. Potas 10 mmol/h (ADA 2024) do K⁺ >3,5, EKG ciągłe, kontrola K⁺ co 1–2 h. ChPL KCl dopuszcza 20 mmol/h przy K⁺ <3,0 z zaburzeniami EKG/niedowładem (DO DECYZJI LEKARZA).'};
 if(k<5.0)return{status:'replace',hold:false,lvl:'orange',mmolPerL:40,txt:'K⁺ 3,5–5,0: dodawaj potas do płynów (ADA: 20–30 mmol/l płynu; JBDS: 40 mmol/l w worku – DO DECYZJI, który schemat), cel K⁺ 4–5. Maks. 40 mmol/l i 10 mmol/h (K⁺ >3) wg ChPL KCl – gotowy worek, nigdy bolus.'};
 if(k<5.5)return{status:'borderline',hold:false,lvl:'orange',txt:'K⁺ 5,0–5,5: ADA 2024 – bez potasu do spadku <5,0; JBDS 2023 – potas dopiero przy K⁺ <5,5 → rozbieżność wytycznych, DO DECYZJI LEKARZA. Domyślnie bez potasu; kontrola K⁺ za 2 h.'};
 if(k<6.5)return{status:'none',hold:false,lvl:'orange',txt:'K⁺ ≥5,5: bez potasu; kontrola K⁺ co 2 h; EKG.'};
 return{status:'high',hold:false,lvl:'red',txt:'K⁺ ≥6,5: bez potasu; leczenie hiperkaliemii wg modułu Elektrolity (wapń, EKG); insulina wlewem obniża K⁺.'};}
// ---- główny plan ----
// i: w,glu,ket,ph,hco3,k,na,cl,urea,sbp,gcs,knownDM,age,co{}, syrUnits, syrMl, gluReduce(mmol/l), rateReduced(j./kg/h), dex(5|10), hhsFalling (glikemia spada <5 mmol/l/h na samych płynach)
function plan(i){var D=SK_DKA();var base=D.compute({w:i.w,glu:i.glu,ket:i.ket,ph:i.ph,hco3:i.hco3,k:i.k,na:i.na,cl:i.cl,urea:i.urea,sbp:i.sbp,gcs:i.gcs,knownDM:i.knownDM,co:i.co||{},age:i.age});
 var o={mode:base.mode,base:base,lvl:base.lvl,warn:base.warn.slice(),severe:base.severe,ag:base.ag,osm:base.osm,naCorr16:base.naCorr16,naCorr24:base.naCorr24};
 o.indicated=base.indicated;o.k=potassium(i.k);
 var sy=syringe(i.syrUnits,i.syrMl);o.syringe=sy;
 var ins={allowed:false,phase:'none',reason:''};o.insulin=ins;
 var redTh=nz(i.gluReduce)&&i.gluReduce>0?i.gluReduce:CFG.gluReduceMmol,redRate=nz(i.rateReduced)&&i.rateReduced>=0.02&&i.rateReduced<=0.1?i.rateReduced:CFG.rateReduced;
 o.reduceThreshold=redTh;o.reducedRate=redRate;
 if(!base.indicated){ins.reason='Brak pełnych kryteriów DKA/HHS – nie podawać wlewu wg protokołu DKA.';}
 else if(!(i.w>0)){ins.reason='Podaj masę ciała w pasku pacjenta.';}
 else if(o.k.hold){ins.phase='hold';ins.reason=o.k.status==='unknown'?'Brak K⁺ – insulina zablokowana do czasu oznaczenia K⁺.':'K⁺ <3,5 – insulina wstrzymana, najpierw potas.';}
 else if(!sy.ok){ins.reason=sy.warn.length?sy.warn[0]:'Wybierz liczbę jednostek i strzykawkę (20 lub 50 ml).';}
 else{
  var perKg,ph;
  if(base.mode==='hhs'){
   var ketHigh=nz(i.ket)&&i.ket>=1;
   if(!ketHigh&&!i.hhsFalling){ins.phase='hhs-wait';ins.reason='HHS: insulinę rozpocznij, gdy glikemia nie spada wystarczająco na samych płynach (JBDS HHS 2022) lub gdy ketony ≥1 mmol/l – najpierw płyny i potas.';}
   else{ins.phase='hhs';perKg=CFG.rateHHS;}
  }else{ // DKA lub mieszany – leczyć jak DKA
   if(nz(i.glu)&&i.glu<redTh){ins.phase='reduced';perKg=redRate;}else{ins.phase='start';perKg=CFG.rateStart;}
  }
  if(perKg!=null){var rr=rateRow(i.w,perKg,sy.conc);ins.allowed=true;ins.perKg=rr.perKg;ins.uh=rr.uh;ins.mlh=rr.mlh;ins.conc=sy.conc;ins.insMl=sy.insMl;ins.diluentMl=sy.diluentMl;
   ins.hoursSyringe=sy.ml/rr.mlh;
   ins.rows={start:rateRow(i.w,CFG.rateStart,sy.conc),reduced:rateRow(i.w,redRate,sy.conc),hhs:rateRow(i.w,CFG.rateHHS,sy.conc)};
   if(ins.uh>15&&base.mode!=='hhs'){o.warn.push('>15 j./h – tylko po konsultacji diabetologa (JBDS)');if(o.lvl==='ok')o.lvl='orange';}
   if(rr.mlh>50){o.warn.push('Przepływ >50 ml/h – sprawdź masę i stężenie');}
  }
 }
 // glukoza równolegle
 var dexPct=i.dex===10?10:5,dexMlh=CFG.dexMlh;
 o.dextrose={needed:(base.mode!=='none')&&nz(i.glu)&&i.glu<redTh,pct:dexPct,mlh:dexMlh,gPerH:dexMlh*dexPct/100,
  txt:'Glukoza '+dexPct+'% '+dexMlh+' ml/h (= '+r2(dexMlh*dexPct/100)+' g/h) równolegle do NaCl 0,9% (JBDS 2023: 10% 125 ml/h; ADA 2024: dekstroza 5–10%), insulina nie jest odstawiana – dostosuj przepływ insuliny/glukozy do glikemii docelowej ≈200 mg/dl (11,1 mmol/l). Objętość/tempo DO DECYZJI LOKALNEJ.'};
 if(nz(i.glu)&&i.glu<4){o.lvl='red';if(o.warn.indexOf('Hipoglikemia!')<0)o.warn.push('Hipoglikemia!');}
 // płyny
 o.fluids=base.fluids;o.fluidCaution=base.fluidCaution;o.shock=base.shock;
 // monitorowanie
 o.monitor=monitoring(i,o);
 o.resolution=resolution(i,o);
 return o;}
function SK_DKA(){return (typeof require==='function'&&typeof module==='object')?require('./dka.js'):(typeof SK!=='undefined'?SK.dka:null);}
// ---- monitorowanie (odstępy w minutach) ----
// stage: 'A' – faza początkowa/wlew pełny; 'B' – stabilnie, glikemia <250 mg/dl na glukozie, poprawa; 'C' – blisko ustąpienia
function monitoring(i,o){var stage=(o.insulin.phase==='reduced')?'B':'A';
 if(o.resolution&&o.resolution.nearly)stage='C';
 var kUnstable=nz(i.k)&&(i.k<3.5||i.k>=5.5);
 var m={stage:stage,
  glu:{min:60,txt:'co 1 h (ADA 2024: co 1–2 h; JBDS: co 1 h w trakcie wlewu)'},
  k:{min:kUnstable?120:(stage==='A'?120:240),txt:kUnstable?'co 2 h (K⁺ poza zakresem 3,5–5,5)':(stage==='A'?'2 h po starcie insuliny, potem co 2 h w pierwszych 6 h (JBDS) – ADA: co 4 h':'co 4 h (ADA 2024) lub co 2 h przy suplementacji potasu')},
  gas:{min:stage==='A'?120:240,txt:stage==='A'?'gazometria żylna + ketony (BHB) co 2 h w pierwszych godzinach (JBDS)':'gazometria żylna + BHB co 4 h (ADA 2024) do ustąpienia DKA'},
  vitals:{min:60,txt:'ciśnienie, tętno, temperatura, SpO₂, GCS, diureza – co 1 h (cel diurezy >0,5 ml/kg/h)'},
  osm:{min:240,txt:'HHS: osmolalność i Na⁺ co 4 h (ADA 2024); tempo spadku patrz „Kontrola tempa”'}};
 if(o.insulin.phase==='reduced'){m.glu.txt='co 1 h (ADA 1–2 h); przy stabilnej glikemii w celu (≈200 mg/dl) po ≥ 4 h można co 2 h – DO DECYZJI';}
 return m;}
// następna kontrola: "HH:MM" + minuty → "HH:MM" (null przy błędnych danych)
function nextTime(hhmm,min){var m=/^(\d{1,2}):(\d{2})$/.exec(String(hhmm||'').trim());if(!m||!nz(min)||min<=0)return null;var h=+m[1],mi=+m[2];if(h>23||mi>59)return null;var t=(h*60+mi+Math.round(min))%1440;return String(Math.floor(t/60)).padStart(2,'0')+':'+String(t%60).padStart(2,'0');}
// ---- kryteria ustąpienia ----
function resolution(i,o){var r={dka:null,hhs:null,nearly:false,items:[]};
 var ketOk=nz(i.ket)?i.ket<0.6:null,acidOk=(nz(i.ph)&&i.ph>=7.3)||(nz(i.hco3)&&i.hco3>=18)?true:((nz(i.ph)||nz(i.hco3))?false:null);
 if(ketOk!==null&&acidOk!==null)r.dka=ketOk&&acidOk;
 r.items.push('DKA ustąpiła (ADA 2024): BHB <0,6 mmol/l ORAZ pH żylne ≥7,3 lub HCO₃⁻ ≥18 mmol/l (nie używaj luki anionowej ani ketonów w moczu)');
 var osmOk=nz(o.osm)?o.osm<300:null,gluOk=nz(i.glu)?i.glu<250/18.016:null,uOk=nz(i.urine)&&nz(i.w)&&i.w>0?(i.urine/i.w>0.5):null;
 if(osmOk!==null&&gluOk!==null&&uOk!==null)r.hhs=osmOk&&gluOk&&uOk;
 r.items.push('HHS ustąpiło (ADA 2024): osmolalność <300 mOsm/kg, glikemia <250 mg/dl (13,9 mmol/l), diureza >0,5 ml/kg/h, poprawa świadomości');
 r.nearly=(nz(i.ket)&&i.ket<1.0)&&((nz(i.ph)&&i.ph>=7.25)||(nz(i.hco3)&&i.hco3>=15));
 r.transition='Po ustąpieniu: insulina s.c. (bazowa podana ≥1–2 h przed odstawieniem wlewu IV, ADA 2024), posiłek, odstawienie wlewu dopiero po nakładaniu się działania.';
 return r;}
// ---- kontrola tempa (HHS / ryzyko obrzęku mózgu) ----
// prev,cur: {glu(mmol/l),na,osm}; hours – odstęp
function rates(prev,cur,hours){if(!prev||!cur||!(nz(hours)&&hours>0.05&&hours<=24))return null;var o={warn:[]};
 if(nz(prev.glu)&&nz(cur.glu)){o.gluPerH=(prev.glu-cur.glu)/hours;if(o.gluPerH>6.7+1e-9)o.warn.push('Spadek glikemii >6,7 mmol/l/h (120 mg/dl/h) – za szybko, ryzyko obrzęku mózgu (ADA 2024: 5–6,7 mmol/l/h = 90–120 mg/dl/h)');}
 if(nz(prev.osm)&&nz(cur.osm)){o.osmPerH=(prev.osm-cur.osm)/hours;if(o.osmPerH>8+1e-9)o.warn.push('Spadek osmolalności >8 mOsm/kg/h – za szybko (ADA 2024: 3–8 mOsm/kg/h)');}
 if(nz(prev.na)&&nz(cur.na)){o.naPer24=(cur.na-prev.na)/hours*24;if(Math.abs(o.naPer24)>10+1e-9)o.warn.push('Zmiana Na⁺ >10 mmol/l/24 h w tempie bieżącym – zwolnij (ADA 2024: ≤10 mmol/l/24 h)');}
 return o;}
return{SRC:SRC,CFG:CFG,syringe:syringe,potassium:potassium,plan:plan,monitoring:monitoring,nextTime:nextTime,resolution:resolution,rates:rates,mlh:mlh};});
