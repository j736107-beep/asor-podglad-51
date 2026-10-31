// Jednostki laboratoryjne – jedno globalne ustawienie: 'conv' (mg/dl = mg%) lub 'si' (mmol/l, µmol/l).
// Wartość kanoniczna (wewnętrzna) = SI. f = ile jednostek SI na 1 jednostkę konwencjonalną.
(function(r,f){var m=f();if(typeof module==='object'&&module.exports)module.exports=m;else{r.SK=r.SK||{};r.SK.units=m;}})(this,function(){
var A={
 glu:{si:'mmol/l',cv:'mg/dl',f:1/18.016,dsi:1,dcv:0,n:'Glukoza'},
 urea:{si:'mmol/l',cv:'mg/dl',f:1/6.006,dsi:1,dcv:0,n:'Mocznik (urea)'},
 bun:{si:'mmol/l',cv:'mg/dl',f:1/2.801,dsi:1,dcv:0,n:'Azot mocznika (BUN)'},
 crea:{si:'µmol/l',cv:'mg/dl',f:88.42,dsi:0,dcv:2,n:'Kreatynina'},
 ca:{si:'mmol/l',cv:'mg/dl',f:1/4.008,dsi:2,dcv:1,n:'Wapń'},
 mg:{si:'mmol/l',cv:'mg/dl',f:1/2.431,dsi:2,dcv:2,n:'Magnez'},
 para:{si:'µmol/l',cv:'mg/l',f:6.615,dsi:0,dcv:0,n:'Paracetamol'},
 bili:{si:'µmol/l',cv:'mg/dl',f:17.104,dsi:0,dcv:1,n:'Bilirubina'}};
function ok(v){return typeof v==='number'&&isFinite(v);}
function toSI(a,v,sys){return !ok(v)?NaN:sys==='si'?v:v*A[a].f;}
function fromSI(a,v,sys){return !ok(v)?NaN:sys==='si'?v:v/A[a].f;}
function label(a,sys){return sys==='si'?A[a].si:A[a].cv+(A[a].cv==='mg/dl'?' (mg%)':'');}
function round(a,v,sys){if(!ok(v))return'';var d=sys==='si'?A[a].dsi:A[a].dcv,p=Math.pow(10,d);return String(Math.round(v*p)/p).replace('.',',');}
function conv(a,v,from,to){return fromSI(a,toSI(a,v,from),to);}
return{A:A,toSI:toSI,fromSI:fromSI,label:label,round:round,conv:conv,DEF:'conv'};});
