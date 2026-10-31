(function(r,f){var m=f();if(typeof module==='object'&&module.exports)module.exports=m;else{r.SK=r.SK||{};r.SK.core=m;}})(this,function(){
// Przeliczniki jednostek (stałe fizykochemiczne: masa molowa)
var CONV={glu:18.016,ca:4.008,mg:2.431,crea:88.42,urea:6.006};
function gluMmol(v,u){return u==='mgdl'?v/18.016:v;}
function gluMgdl(v,u){return u==='mgdl'?v:v*18.016;}
function creaMgdl(v,u){return u==='umol'?v/88.42:v;}
// Cockcroft-Gault (1976): CrCl = (140-wiek)*masa/(72*Kr[mg/dl]) ×0,85 u kobiet
function cockcroft(age,w,creaMg,sex){if(!(age>0&&w>0&&creaMg>0)||(sex!=='m'&&sex!=='f'))return NaN;var c=(140-age)*w/(72*creaMg);return sex==='f'?c*0.85:c;}
function num(v){if(typeof v==='number')return Number.isFinite(v)?v:NaN;v=String(v==null?'':v).trim();if(!/^[+-]?(?:\d+(?:[.,]\d*)?|[.,]\d+)$/.test(v))return NaN;var n=Number(v.replace(',','.'));return Number.isFinite(n)?n:NaN;}
function fmt(x,d){if(x==null||!isFinite(x))return'—';if(d!=null){return (+x.toFixed(d)).toString().replace('.',',');}var a=Math.abs(x),s=a>=100?x.toFixed(0):a>=10?x.toFixed(1):a>=1?x.toFixed(2):x.toFixed(3);s=s.indexOf('.')>=0?s.replace(/0+$/,'').replace(/\.$/,''):s;return s.replace('.',',');}
// BMI = masa[kg]/(wzrost[m])^2; puste lub nierealne wartości → NaN (nic nie jest zgadywane)
function bmi(w,h){return (w>0&&h>=50&&h<=250)?w/Math.pow(h/100,2):NaN;}
function checkHeight(h){if(!(h>0))return null;if(h<100||h>230)return'red';if(h<120||h>210)return'orange';return null;}
function checkWeight(w){if(!(w>0))return null;if(w<30||w>250)return'red';if(w<40||w>180)return'orange';return null;}
// Pacjent globalny
// CKD-EPI 2021 (bez rasy; Inker NEJM 2021): eGFR ml/min/1,73 m², Kr w mg/dl
function ckdepi(cr,age,sex){if(!(cr>0&&age>=18)||(sex!=='m'&&sex!=='f'))return NaN;var k=sex==='f'?0.7:0.9,a=sex==='f'?-0.241:-0.302,r=cr/k;return 142*Math.pow(Math.min(r,1),a)*Math.pow(Math.max(r,1),-1.2)*Math.pow(0.9938,age)*(sex==='f'?1.012:1);}
function patient(p){var wRaw=num(p.w),w=wRaw>0&&wRaw<=250?wRaw:NaN, // 5.0-D: masa >250 kg lub ≤0 nie trafia do obliczeń (flaga czerwona w pasku pozostaje)
 age=num(p.age),cr=num(p.crea),cm=creaMgdl(cr,p.creaU||'mgdl');
 var crcl=cockcroft(age,w,cm,p.sex);return{w:w,age:age,sex:p.sex||'',crMg:cm,egfr:ckdepi(cm,age,p.sex),crcl:isFinite(crcl)?crcl:num(p.crcl),co:p.co||{},wFlag:checkWeight(wRaw),wRaw:wRaw,h:num(p.h),hFlag:checkHeight(num(p.h)),bmi:bmi(w,num(p.h))};}
return{CONV:CONV,gluMmol:gluMmol,gluMgdl:gluMgdl,creaMgdl:creaMgdl,cockcroft:cockcroft,ckdepi:ckdepi,num:num,fmt:fmt,checkWeight:checkWeight,bmi:bmi,checkHeight:checkHeight,patient:patient};});
