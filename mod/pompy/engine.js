// Pompy SOR v2 – silnik obliczeń (czysty JS, Node + przeglądarka). Wszystkie przeliczenia liniowe, odwracalne.
(function(r,f){if(typeof module==='object'&&module.exports)module.exports=f();else r.Engine=f();})(this,function(){
var MASS={ug:0.001,mg:1,g:1000},TIME={min:60,h:1,d:1/24};
// ilość/h w jednostce zawartości (cu) odpowiadająca dawce 1 [doseUnit] (bez masy)
function perHourFactor(doseUnit,cu){var p=doseUnit.split('/'),amt=p[0],t=p[p.length-1],f=TIME[t];if(f==null)throw Error('unit');
 if(amt==='j'){if(cu!=='j')throw Error('unit');return f;} if(cu==='j'||MASS[amt]==null||MASS[cu]==null)throw Error('unit');return f*MASS[amt]/MASS[cu];}
function isPerKg(u){return u.indexOf('/kg/')>0;}
function round(x,n){var m=Math.pow(10,n||6);return Math.round(x*m)/m;}
// ---- v2: receptura ze stężenia/ilości na strzykawkę ----
function ampConc(d){return d.amp.content/d.amp.volume;}
function recipe(d,syr){var r=d.rec&&d.rec[String(syr)];if(r==null)return{error:'Brak receptury dla strzykawki '+syr+' ml.'};
 var amount=r,drugVol=amount/ampConc(d);if(drugVol>syr+1e-9)return{error:'Objętość leku przekracza strzykawkę.'};
 var fin=d.diluted?syr:drugVol;return{syr:syr,amount:amount,drugVol:round(drugVol,6),amps:round(drugVol/d.amp.volume,6),diluent:d.diluted?round(syr-drugVol,6):0,finalVol:fin,conc:amount/fin};}
function k(unit,cu,w){if(isPerKg(unit)){if(!(w>0))return null;}else w=1;return w*perHourFactor(unit,cu);}
// dawka -> ml/h
function toMlh(d,conc,unit,dose,w){var f=k(unit,d.amp.unit,w);if(f==null||!(dose>=0)||!(conc>0))return null;return dose*f/conc;}
// ml/h -> dawka
function fromMlh(d,conc,unit,mlh,w){var f=k(unit,d.amp.unit,w);if(f==null||!(mlh>=0)||!(conc>0))return null;return mlh*conc/f;}
function perHour(conc,mlh){return mlh*conc;}
function rangeFor(d,unit){return (d.units||[]).find(function(x){return x.u===unit})||{};}
// ocena dawki: 'max' (powyżej maks.), 'hi'/'lo' (poza zakresem), null
function assess(d,unit,dose,amountH){var r=rangeFor(d,unit),o={flags:[]};
 if(r.max!=null&&dose>r.max+1e-9)o.flags.push('max');
 if(d.maxH!=null&&amountH>d.maxH.value+1e-9)o.flags.push('maxH');
 if(d.maxD!=null&&amountH*24>d.maxD.value+1e-9)o.flags.push('maxD');
 if(r.lo!=null&&dose<r.lo-1e-9)o.flags.push('lo');if(r.hi!=null&&dose>r.hi+1e-9)o.flags.push('hi');
 o.overMax=o.flags.some(function(f){return /^max/.test(f)});o.out=o.flags.length>0;return o;}
// korekta przepływu: mode 'abs' (zmiana o X w jednostce dawki) | 'pct' (o X %) | 'mlh' (o X ml/h)
function adjust(d,conc,unit,w,curMlh,mode,x){var cur=fromMlh(d,conc,unit,curMlh,w);if(cur==null||!isFinite(x))return null;var nd,nm;
 if(mode==='pct'){nm=curMlh*(1+x/100);nd=cur*(1+x/100);}else if(mode==='mlh'){nm=curMlh+x;nd=fromMlh(d,conc,unit,nm,w);}else{nd=cur+x;nm=toMlh(d,conc,unit,nd,w);}
 if(!(nm>=0)||!(nd>=0))return{error:'Nowa dawka ujemna.'};return{curDose:cur,newDose:nd,newMlh:nm,deltaMlh:nm-curMlh};}
// ---- heparyna ----
function hepBolus(w,perKg,vialConc,cap){if(!(w>0)||!(perKg>=0))return null;var u=w*perKg,capped=false;if(cap!=null&&u>cap){u=cap;capped=true;}return{units:u,mlVial:u/vialConc,capped:capped};}
// Nomogram Raschke (Ann Intern Med 1993;119:874): APTT po 6 h od startu/zmiany
var RASCHKE=[{max:35,lt:true,bolus:80,delta:4,stop:0,txt:'APTT < 35 s: bolus 80 j./kg, zwiększ wlew o 4 j./kg/h'},
 {max:45,bolus:40,delta:2,stop:0,txt:'APTT 35–45 s: bolus 40 j./kg, zwiększ wlew o 2 j./kg/h'},
 {max:70,bolus:0,delta:0,stop:0,txt:'APTT 46–70 s: bez zmian'},
 {max:90,bolus:0,delta:-2,stop:0,txt:'APTT 71–90 s: zmniejsz wlew o 2 j./kg/h'},
 {max:Infinity,bolus:0,delta:-3,stop:1,txt:'APTT > 90 s: wstrzymaj wlew na 1 h, potem zmniejsz o 3 j./kg/h'}];
function raschke(aptt,curUkgh,w,conc){if(!(aptt>0)||!(curUkgh>=0)||!(w>0)||!(conc>0))return null;
 var row=RASCHKE.find(function(r){return r.lt?aptt<r.max:aptt<=r.max;});
 var nu=Math.max(0,curUkgh+row.delta),uh=nu*w;
 return{row:row,txt:row.txt,bolusUkg:row.bolus,bolusU:row.bolus*w,stopH:row.stop,newUkgh:nu,newUh:uh,newMlh:uh/conc,oldMlh:curUkgh*w/conc,nextCheckH:6};}
// ---- zgodność wsteczna (v1: liczba ampułek) ----
function prep(d,syr,amps){var vol=amps*d.amp.volume,amount=amps*d.amp.content;
 if(!(amps>0))return{error:'Podaj liczbę ampułek.'};if(vol>syr+1e-9)return{error:'Objętość leku przekracza strzykawkę '+syr+' ml.'};
 var fin=d.diluted?syr:vol;return{amount:amount,drugVol:vol,diluent:d.diluted?syr-vol:0,finalVol:fin,conc:amount/fin};}
function rate(d,p,dose,w){return toMlh(d,p.conc,d.doseUnit,dose,isPerKg(d.doseUnit)?w:1);}
function dose(d,p,mlh,w){return fromMlh(d,p.conc,d.doseUnit,mlh,isPerKg(d.doseUnit)?w:1);}
function amountPerHour(d,p,mlh){return mlh*p.conc;}
function outOfRange(d,x){var r=d.range||{};return (r.lo!=null&&x<r.lo-1e-9)||(r.hi!=null&&x>r.hi+1e-9);}
function checkWeight(w){if(!(w>0))return null;if(w<30||w>250)return'red';if(w<40||w>180)return'amber';return null;}
function fmt(x,dp){if(x==null||!isFinite(x))return'—';var a=Math.abs(x),s=dp!=null?x.toFixed(dp):a>=100?x.toFixed(0):a>=10?x.toFixed(1):a>=1?x.toFixed(2):x.toFixed(3);s=s.indexOf('.')>=0?s.replace(/0+$/,'').replace(/\.$/,''):s;if(s==='-0')s='0';return s.replace('.',',');}
return{perHourFactor:perHourFactor,isPerKg:isPerKg,ampConc:ampConc,recipe:recipe,toMlh:toMlh,fromMlh:fromMlh,perHour:perHour,rangeFor:rangeFor,assess:assess,adjust:adjust,hepBolus:hepBolus,raschke:raschke,RASCHKE:RASCHKE,
 prep:prep,rate:rate,dose:dose,amountPerHour:amountPerHour,outOfRange:outOfRange,checkWeight:checkWeight,fmt:fmt};});
