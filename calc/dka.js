(function(r,f){var m=f();if(typeof module==='object'&&module.exports)module.exports=m;else{r.SK=r.SK||{};r.SK.dka=m;}})(this,function(){
// Źródła: JBDS-IP 02 DKA (03.2023), JBDS-IP 06 HHS (2022), ADA/EASD/JDS/AACE/JBDS/ADS consensus Hyperglycemic crises 2024 (Diabetes Care 47:1257), ChPL NovoRapid.
var SRC={JBDS:'JBDS-IP DKA w dorosłych, 03.2023',JBDSH:'JBDS-IP HHS w dorosłych, 2022',ADA:'ADA/EASD/JBDS consensus: Hyperglycemic crises in adults 2024 (Diabetes Care 2024;47:1257)',INS:'ChPL NovoRapid (insulina aspart 100 j./ml)'};
var PEN={units:50,ml:0.5,dil:49.5,syr:50,conc:1}; // 50 j. (0,5 ml z pena 100 j./ml) + 49,5 ml NaCl 0,9% = 1 j./ml
function nz(x){return typeof x==='number'&&isFinite(x);}
// in: w[kg], glu[mmol/l], ket[mmol/l], ph, hco3, k, na, cl, urea[mmol/l], sbp, gcs, knownDM, co{heart,renal,preg}, age
function compute(i){var o={warn:[],lvl:'ok',lines:[]},w=i.w;
 function lv(l){var r={ok:0,orange:1,red:2};if(r[l]>r[o.lvl])o.lvl=l;}
 o.ag=nz(i.na)&&nz(i.cl)&&nz(i.hco3)?i.na-(i.cl+i.hco3):NaN;
 o.osm=nz(i.na)&&nz(i.glu)&&nz(i.urea)?2*i.na+i.glu+i.urea:NaN; // JBDS HHS: 2Na+glukoza+mocznik
 o.naCorr16=nz(i.na)&&nz(i.glu)?i.na+1.6*(i.glu*18.016-100)/100:NaN; // Katz
 o.naCorr24=nz(i.na)&&nz(i.glu)?i.na+2.4*(i.glu*18.016-100)/100:NaN; // Hillier
 var glyc=(nz(i.glu)&&i.glu>=11)||!!i.knownDM, ket=nz(i.ket)&&i.ket>=3, acid=(nz(i.ph)&&i.ph<7.3)||(nz(i.hco3)&&i.hco3<18);
 o.dka=glyc&&ket&&acid; // ADA 2024 (glukoza ≥200 mg/dl ≈11,1 lub znana cukrzyca; JBDS >11)
 var hhsCore=nz(i.glu)&&i.glu>=30&&nz(o.osm)&&o.osm>=320;
 o.hhs=hhsCore&&!(nz(i.ket)&&i.ket>=3)&&!(nz(i.ph)&&i.ph<7.3)&&!(nz(i.hco3)&&i.hco3<15); // JBDS HHS 2022 / ADA 2024
 o.mode=o.dka&&hhsCore?'mixed':o.dka?'dka':o.hhs?'hhs':'none';
 // ciężkość DKA (JBDS 2023 – wskazania do HDU)
 var sev=[];if(nz(i.ket)&&i.ket>6)sev.push('ketony >6');if(nz(i.hco3)&&i.hco3<5)sev.push('HCO₃ <5');if(nz(i.ph)&&i.ph<7.0)sev.push('pH <7,0');if(nz(i.k)&&i.k<3.5)sev.push('K⁺ <3,5');if(nz(i.gcs)&&i.gcs<12)sev.push('GCS <12');if(nz(i.sbp)&&i.sbp<90)sev.push('SBP <90');if(nz(o.ag)&&o.ag>16)sev.push('luka >16');
 o.severe=sev;if(sev.length&&o.dka){lv('red');o.warn.push('Ciężka DKA ('+sev.join(', ')+') → OIOM/HDU');}
 // insulina
 o.indicated=o.mode!=='none';
 if(w>0&&o.indicated){var dkaRate=o.mode==='hhs'?0.05*w:0.1*w, lowGlu=nz(i.glu)&&i.glu<14;
  if(o.mode!=='hhs'&&lowGlu)dkaRate=0.05*w; // JBDS: rozważ 0,05 j/kg/h; ADA: zmniejsz do 0,05
  o.insUh=dkaRate;o.insMlh=dkaRate/PEN.conc;o.insPerKg=dkaRate/w;
  if(o.mode!=='hhs'&&dkaRate>15){lv('orange');o.warn.push('>15 j./h – tylko po konsultacji diabetologa (JBDS)');}
  if(o.mode==='hhs')o.insNote=(nz(i.ket)&&i.ket>1)?'Ketony >1 → start insuliny od razu':'Start insuliny, gdy glukoza przestaje spadać na samych płynach';
 }
 // potas – tylko wskazówka do worka/protokołu, nigdy pompa
 if(nz(i.k)&&o.indicated){if(i.k<3.5){lv('red');o.kTxt='K⁺ <3,5: wstrzymaj insulinę, uzupełnij K⁺ wg protokołu (ADA 2024: 10 mmol/h), konsultacja';o.holdIns=true;}
  else if(i.k<=5.5)o.kTxt='KCl 40 mmol/l w worku NaCl 0,9% (JBDS) – gotowy worek, nie pompa';
  else o.kTxt='K⁺ >5,5: bez potasu';
  if(i.k>=6.5)lv('red');}
 // płyny
 o.shock=nz(i.sbp)&&i.sbp<90;if(o.shock)lv('red');
 o.fluids=!o.indicated&&!o.shock?[]:o.shock?[{v:500,t:15,txt:'500 ml NaCl 0,9% w 10–15 min, powtórz do SBP ≥90'}]:[{v:1000,t:60},{v:1000,t:120},{v:1000,t:120},{v:1000,t:240}].map(function(f){f.mlh=f.v*60/f.t;return f;});
 if(i.co&&(i.co.heart||i.co.renal||i.co.preg)||(i.age>=18&&i.age<=25)||i.age>=65){o.fluidCaution=true;lv('orange');}
 // przełączenie na glukozę
 o.gluSwitch=nz(i.glu)&&i.glu<14; o.gluTxt='Glukoza <14 mmol/l (252 mg/dl): + glukoza 10% 125 ml/h (JBDS)';
 if(nz(i.glu)&&i.glu<4){lv('red');o.warn.push('Hipoglikemia!');}
 if(o.mode==='hhs'||o.mode==='mixed')o.hhsTargets='Cel: glukoza ↓ 4–6 mmol/l/h (72–108 mg/dl/h), Na ↓ ≤10 mmol/l/24 h, osmolalność ↓ 3–8 mOsm/kg/h';
 return o;}
return{SRC:SRC,PEN:PEN,compute:compute};});
