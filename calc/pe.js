(function(r,f){var m=f();if(typeof module==='object'&&module.exports)module.exports=m;else{r.SK=r.SK||{};r.SK.pe=m;}})(this,function(){
// ESC 2019 PE (Konstantinides), ACCP/CHEST 2021 VTE, AHA 2011/2019 scientific statement, ChPL Actilyse
var SRC={ESC:'ESC 2019 – zatorowość płucna',CHEST:'ACCP/CHEST 2021 – VTE',AHA:'AHA 2011 scientific statement – masywna/submasywna ZP',ACT:'ChPL Actilyse (alteplaza)'};
function spesi(i){var s=0,it=[];[['age80','wiek >80'],['cancer','nowotwór'],['cardio','przewlekła ch. serca/płuc'],['hr','HR ≥110'],['sbp','SBP <100'],['sat','SaO₂ <90%']].forEach(function(k){if(i[k[0]]){s++;it.push(k[1]);}});return{score:s,items:it,low:s===0};}
// Alteplaza ZP (ChPL Actilyse): 10 mg w 1–2 min + 90 mg w 2 h; <65 kg łącznie ≤1,5 mg/kg. ESC 2019: schemat przyspieszony 0,6 mg/kg/15 min (maks. 50 mg)
function alteplase(w){if(!(w>0))return null;var tot=w<65?1.5*w:100,b=10,inf=tot-b;return{total:tot,bolus:b,inf:inf,infMlh:inf/2,acc:Math.min(0.6*w,50),accCap:0.6*w>50,lowW:w<65};}
function risk(i){var s=spesi(i);if(i.shock)return{cls:'high',lvl:'red',txt:'Wysokie ryzyko – niestabilność hemodynamiczna → tromboliza'};
 if(!s.low&&i.rv&&i.trop)return{cls:'im-high',lvl:'orange',txt:'Pośrednio-wysokie – monitorowanie, ratunkowa tromboliza przy dekompensacji'};
 if(!s.low)return{cls:'im-low',lvl:'orange',txt:'Pośrednio-niskie'};return{cls:'low',lvl:'ok',txt:'Niskie (sPESI 0) – rozważ wczesny wypis'};}
return{SRC:SRC,spesi:spesi,alteplase:alteplase,risk:risk};});
