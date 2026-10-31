(function(r,f){var m=f();if(typeof module==='object'&&module.exports)module.exports=m;else{r.SK=r.SK||{};r.SK.transf=m;}})(this,function(){
var SRC=['Rozporządzenie MZ w sprawie leczenia krwią… (tekst jedn. Obwieszczenie MZ z 25.07.2023, Dz.U. 2023 poz. 1742)','Wytyczne w zakresie leczenia krwią i jej składnikami oraz produktami krwiopochodnymi, wyd. III (IHiT/NCKiK)','BSH 2022 – Haematological management of major haemorrhage','ESA 2023 – Management of severe perioperative bleeding','European trauma guideline 2023 (Rossaint)','AABB 2023 – Red blood cell transfusion thresholds','ESC 2023 ACS; MINT 2023 (NEJM)','CRASH-2 / CRASH-3; HALT-IT','ChPL Exacyl (kwas traneksamowy)','ChPL Praxbind, Ondexxya, Beriplex'];
var G=['O','A','B','AB'];
// KKCz: biorca może otrzymać krwinki od grup:
var RBC={O:['O'],A:['A','O'],B:['B','O'],AB:['AB','A','B','O']};
// Osocze – odwrotnie (przeciwciała): biorca otrzymuje osocze od grup:
var PLA={O:['O','A','B','AB'],A:['A','AB'],B:['B','AB'],AB:['AB']};
function rhRbc(rh){return rh==='-'?['RhD−']:['RhD+','RhD−'];}
function compat(abo,rh,sex,age){if(G.indexOf(abo)<0)return null;var o={rbc:RBC[abo],plasma:PLA[abo],plt:[abo].concat(PLA[abo].filter(function(x){return x!==abo}))};
 o.rbcRh=rhRbc(rh);o.childbearing=(sex!=='m'&&sex!=='f')||(sex==='f'&&!(age>=50));
 o.pltRh=rh==='-'?(o.childbearing?'KKP RhD− (jeśli RhD+ → immunoglobulina anty-D)':'KKP RhD− preferowane'):'RhD+ lub RhD−';return o;}
function emergency(sex,age){var cb=(sex!=='m'&&sex!=='f')||(sex==='f'&&!(age>=50)); // nieznana płeć lub kobieta <50 → RhD−
 return{rbc:cb?'0 RhD− (K−)':'0 RhD+ (dopuszczalne; 0 RhD− jeśli dostępne)',plasma:'AB (alternatywnie A z niskim mianem anty-B)',cb:cb};}
// KKCz: 1 j. ≈ +1 g/dl u dorosłego ~70 kg
function rbcUnits(hb,target){if(!(isFinite(hb)&&isFinite(target))||target<=hb)return 0;return Math.ceil(target-hb-1e-9);}
function threshold(ctx){if(ctx==='acs')return{t:8,txt:'ACS: ≤8 g/dl (ESC 2023); MINT 2023 – strategia liberalna <10 g/dl',dw:true};if(ctx==='cardiac')return{t:8,txt:'Choroba sercowo-naczyniowa / ortopedia: <8 g/dl (AABB 2023)'};return{t:7,txt:'Stabilny dorosły: <7 g/dl (AABB 2023)'};}
function ffp(w){if(!(w>0&&w<=250))return null;return{ml:15*w,hi:20*w};}
function fib(w,f){var o={need:isFinite(f)&&f<1.5};if(w>0){o.concLo=25*w/1000;o.concHi=50*w/1000;}return o;}
function plt(count,ctx){var t=ctx==='cns'?100:ctx==='bleed'?50:10;return{t:t,need:isFinite(count)&&count<t,dose:'1 dawka terapeutyczna (dorosły)'};}
function txa(h){if(!isFinite(h))return{ok:null,txt:'Podaj czas od urazu'};if(h<=3)return{ok:true,txt:'1 g i.v. w 10 min, potem 1 g w 8 h'};return{ok:false,txt:'>3 h od urazu – nie podawać (CRASH-2)'};}
function mtp(){return{ratio:'1:1:1 (KKCz : osocze : KKP)',targets:'Fibrynogen >1,5 g/l, Ca²⁺ zjonizowany >1,15 mmol/l, temp. >35 °C, pH >7,2'};}
function reaction(s){var red=[],or=[];if(s.hypo)red.push('hipotensja/wstrząs');if(s.dysp)red.push('duszność (TRALI/TACO)');if(s.back)red.push('ból lędźwi / hemoglobinuria (hemoliza)');if(s.ana)red.push('anafilaksja');
 if(s.fever)(s.fever2?red:or).push(s.fever2?'gorączka ≥39 °C lub wzrost ≥2 °C':'gorączka');if(s.urt)or.push('pokrzywka');
 return{lvl:red.length?'red':or.length?'orange':'ok',red:red,or:or,
  act:red.length?'PRZERWIJ przetoczenie, utrzymaj dostęp (NaCl 0,9%), sprawdź identyfikację pacjenta i jednostki, zawiadom bank krwi, zabezpiecz worek i próbki':or.length?'Wstrzymaj przetoczenie, oceń pacjenta; kontynuacja tylko po decyzji lekarza (izolowana łagodna pokrzywka/gorączka)':''};}
return{SRC:SRC,G:G,RBC:RBC,PLA:PLA,compat:compat,emergency:emergency,rbcUnits:rbcUnits,threshold:threshold,ffp:ffp,fib:fib,plt:plt,txa:txa,mtp:mtp,reaction:reaction};});
