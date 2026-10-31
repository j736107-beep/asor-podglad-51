(function(r,f){var m=f();if(typeof module==='object'&&module.exports)module.exports=m;else{r.SK=r.SK||{};r.SK.ahf=m;}})(this,function(){
// ESC 2021 HF (McDonagh) + 2023 focused update; HFA 2019 diuretics position statement; AHA/ACC/HFSA 2022 HF; ChPL Furosemid, Nitromint/Perlinganit
var SRC={ESC:'ESC 2021 HF + 2023 update',HFA:'HFA 2019 – diuretyki w HF z przewodnieniem',AHA:'AHA/ACC/HFSA 2022 HF',FUR:'ChPL Furosemid',NTG:'ChPL nitrogliceryna i.v.'};
function nz(x){return typeof x==='number'&&isFinite(x);}
function furo(oral){if(nz(oral)&&oral>0)return{lo:oral,hi:2*oral,naive:false,txt:'1–2 × dobowa dawka doustna i.v.'};return{lo:20,hi:40,naive:true,txt:'20–40 mg i.v. (bez wcześniejszych diuretyków)'};}
function ntg(sbp){var ok=nz(sbp)&&sbp>110;return{ok:ok,start:[10,20],max:200,txt:ok?'start 10–20 µg/min, ↑ do 200 µg/min':'SBP ≤110 – nitraty niewskazane'};}
// stężenie w pompie: 50 mg/50 ml = 1 mg/ml = 1000 µg/ml → µg/min ×60/1000 = ml/h
function ntgMlh(ugmin,concMgMl){return nz(ugmin)&&ugmin>=0&&ugmin<=400&&nz(concMgMl)&&concMgMl>0?ugmin*60/(concMgMl*1000):NaN;}
function assess(i){var o={lvl:'ok',w:[]};
 if(nz(i.sbp)&&i.sbp<90){o.lvl='red';o.w.push('SBP <90 – wstrząs kardiogenny?');}
 if(nz(i.lac)&&i.lac>2){o.lvl='red';o.w.push('Mleczany >2 – hipoperfuzja');}
 if(nz(i.spo2)&&i.spo2<90){if(o.lvl==='ok')o.lvl='orange';o.w.push('SpO₂ <90% – tlen / NIV');}
 if(nz(i.rr)&&i.rr>25){if(o.lvl==='ok')o.lvl='orange';o.w.push('RR >25 – rozważ NIV');}
 return o;}
function diuresisCheck(uNa2h,urine6h){return{low:(nz(uNa2h)&&uNa2h<50)||(nz(urine6h)&&urine6h<100),txt:'Na w moczu po 2 h <50–70 mmol/l lub diureza <100–150 ml/h (6 h) → podwój dawkę'};}
return{SRC:SRC,furo:furo,ntg:ntg,ntgMlh:ntgMlh,assess:assess,diuresisCheck:diuresisCheck,maxDay:400};});
