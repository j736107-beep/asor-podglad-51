(function(r,f){var m=f();if(typeof module==='object'&&module.exports)module.exports=m;else{r.SK=r.SK||{};r.SK.elyte=m;}})(this,function(){
// Źródła: ESE/ESICM/ERBP hiponatremia 2014 (Eur J Endocrinol 170:G1); Verbalis i wsp. US Expert Panel 2013 (Am J Med 126:S1);
// UKKA Hyperkalaemia 10.2023; ERC 2021 Special circumstances; SfE Emergency guidance: acute hypocalcaemia 2016; ChPL.
var SRC={ESE:'ESE/ESICM/ERBP: hiponatremia 2014',US:'US Expert Panel hiponatremia 2013 (Verbalis)',UKKA:'UKKA Hyperkalaemia 10.2023',ERC:'ERC 2021 – szczególne okoliczności / zaburzenia rytmu',SFE:'Society for Endocrinology: ostra hipokalcemia 2016'};
var NA3=513, NA09=154; // mmol/l w 3% i 0,9% NaCl
function nz(x){return typeof x==='number'&&isFinite(x);}
function tbwFactor(sex,age){var old=!(age<65); // wiek nieznany → jak ≥65 (ostrożniej)
return sex==='m'?(old?0.5:0.6):(old?0.45:0.5);} // płeć nieznana → wartości kobiece (mniejsza TBW = ostrożniej)
// Adrogué–Madias: zmiana Na po 1 l płynu
function adrogue(na,inf,tbw){return (inf-na)/(tbw+1);}
function hypoNa(i){var o={lvl:'ok',warn:[]};if(!(i.w>0&&nz(i.na)))return null;
 o.noHypo=i.na>=135;
 o.tbw=i.w*tbwFactor(i.sex,i.age);o.d3=adrogue(i.na,NA3,o.tbw);o.d09=adrogue(i.na,NA09,o.tbw);
 o.bolusMl=150;o.bolusRise=o.d3*0.15;
 o.limit=i.highRisk?8:10; // ESE: ≤10 mmol/l w 1. dobie; US: 8 przy wysokim ryzyku ODS
 var tgt=nz(i.target)?i.target:5 /* ESE 2014: cel 5 mmol/l/24 h */;o.target=tgt;
 o.vol3=tgt/o.d3*1000;o.mlh3=o.vol3/24;
 if(tgt>o.limit+1e-9){o.lvl='red';o.warn.push('Plan >'+o.limit+' mmol/l/24 h – ryzyko ODS');}
 if(i.na<125)o.lvl=o.lvl==='red'?'red':'orange';
 if(i.na<120||i.severe)o.lvl='red';
 return o;}
function hyperK(i){if(!nz(i.k))return null;var o={lvl:'ok',steps:[]};
 var sev=i.k>=6.5?'ciężka':i.k>=6.0?'umiarkowana':i.k>=5.5?'łagodna':null;o.sev=sev;
 if(i.k>=6.5||(i.ecg&&i.k>=5.5))o.lvl='red';else if(i.k>=6.0)o.lvl='orange';
 if(i.ecg&&i.k>=5.5)o.steps.push({t:'Wapń',d:'Calcium gluconicum 10% 30 ml i.v. w 10 min LUB CaCl₂ 10% 10 ml w 5 min (6,8 mmol Ca)'});
 if(i.k>=6.0){o.steps.push({t:'Insulina+glukoza',d:'NovoRapid 10 j. + 25 g glukozy i.v. w 15 min (250 ml 10% lub 125 ml 20%)'});
  if(nz(i.glu)&&i.glu<7)o.steps.push({t:'Glukoza',d:'Glukoza 10% 50 ml/h przez 5 h (glikemia przed <7 mmol/l = 126 mg/dl)'});}
 if(i.k>=6.5)o.steps.push({t:'Salbutamol',d:'10–20 mg w nebulizacji (dodatkowo, nie zamiast insuliny)'});
 if(i.k>=6.0)o.steps.push({t:'Kontrola',d:'K⁺ i glikemia po 1, 2, 4, 6 h'});
 return o;}
function mg(i){var o={lvl:'ok'};if(i.tdp){o.lvl='red';o.txt='MgSO₄ 2 g i.v. w 10 min (TdP, ERC 2021)';}else if(nz(i.mg)&&i.mg<0.5){o.lvl='orange';o.txt='Mg <0,5 mmol/l (1,2 mg/dl): MgSO₄ i.v. – dawka wg ChPL/protokołu (DO WERYFIKACJI)';}
 o.mlOf20=2/0.2; // ml 20% MgSO4 (200 mg/ml) dla 2 g
 return o;}
function ca(i){if(!nz(i.ca))return null;var o={lvl:'ok'};o.corr=nz(i.alb)?i.ca+0.02*(40-i.alb):i.ca; // mmol/l, albumina g/l
 if(o.corr<1.9||(i.sympt&&o.corr<2.1)){o.lvl='red';o.bolus='Calcium gluconicum 10% 10–20 ml w 50–100 ml glukozy 5% w 10 min';o.inf='Potem: 100 ml 10% w 1 l NaCl 0,9%/G5%, 50–100 ml/h';}
 else if(o.corr<2.1)o.lvl='orange';
 if(o.corr>3.0)o.lvl='red';
 return o;}
return{SRC:SRC,NA3:NA3,NA09:NA09,tbwFactor:tbwFactor,adrogue:adrogue,hypoNa:hypoNa,hyperK:hyperK,mg:mg,ca:ca};});
