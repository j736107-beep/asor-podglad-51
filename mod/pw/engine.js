/* Przegląd wyników – czujnik bezpieczeństwa: silnik (parser + reguły). Bez sieci, bez zapisu danych. */
(function(g){'use strict';
var CFG=g.PW_CFG||(typeof require==='function'?(require('./config.js'),g.PW_CFG):null);
var GROUPS=[['zap','Wskaźniki zapalne'],['morf','Morfologia'],['nerki','Nerki i elektrolity'],['wat','Wątroba i trzustka'],['serce','Serce'],['krzep','Krzepnięcie'],['gaz','Gazometria'],['glu','Glukoza'],['inne','Inne'],['opis','Obrazowe i opisy']];
var L='(?=[\\s:\\t(\\[,;=]|$)';
// [klucz, etykieta, grupa, wzorzec nazwy]
var AN=[
['ntprobnp','NT-proBNP','serce','nt[- ]?pro[- ]?bnp'],['bnp','BNP','serce','bnp'],
['ckmb','CK-MB','serce','ck[- ]?mb(?: mass)?'],
['trop','Troponina','serce','(?:hs[- ]?)?(?:troponin[a-ząęółśżźćń]*|c?tn[ti]|hs-?c?tn[ti])(?:[\\s-]*(?:hs|t|i|\\(hs\\)|wysokoczuła|sercowa))*'],
['ck','CK','serce','(?:ck|cpk|kinaza kreatynowa)'],
['pct','Prokalcytonina','zap','(?:pct|prokalcytonina|procalcitonin)'],
['crp','CRP','zap','(?:hs-?crp|crp|białko c-reaktywne)'],
['il6','IL-6','zap','(?:il-?6|interleukina[ -]6)'],
['wbc','Leukocyty','zap','(?:wbc|leukocyty|krwinki białe|leu)'],
['neup','Neutrofile %','morf','(?:neu|neut|neutrofile|granulocyty obojętnochłonne)\\s*%'],
['neu','Neutrofile','morf','(?:neu|neut|neutrofile|granulocyty obojętnochłonne)\\s*#?'],
['lymp','Limfocyty %','morf','(?:lym|lymph|limfocyty)\\s*%'],
['lym','Limfocyty','morf','(?:lym|lymph|limfocyty)\\s*#?'],
['hb','Hemoglobina','morf','(?:hgb|hb|hemoglobina|haemoglobin|hemoglobin)'],
['ht','Hematokryt','morf','(?:hct|ht|hematokryt)'],
['rbc','Erytrocyty','morf','(?:rbc|erytrocyty|krwinki czerwone)'],
['plt','Płytki krwi','morf','(?:plt|płytki krwi|płytki|trombocyty|platelets)'],
['mchc','MCHC','morf','mchc'],['mcv','MCV','morf','mcv'],['mch','MCH','morf','mch'],['rdw','RDW','morf','rdw(?:-cv|-sd)?'],
['ret','Retikulocyty','morf','(?:retikulocyty|ret)'],['ferr','Ferrytyna','morf','(?:ferrytyna|ferritin)'],
['crea','Kreatynina','nerki','(?:kreatynina|creatinine|crea|kreat)'],
['egfr','eGFR','nerki','(?:egfr|gfr)(?:\\s*\\(?(?:ckd-epi|mdrd)\\)?)?'],
['urea','Mocznik','nerki','(?:mocznik|urea|bun)'],
['na','Sód','nerki','(?:sód|sod|na\\+?|natrium)'],
['k','Potas','nerki','(?:potas|k\\+?|kalium)'],
['cl','Chlorki','nerki','(?:chlorki|cl-?)'],
['cai','Wapń zjonizowany','nerki','(?:wapń zjonizowany|ca\\+\\+|ica|ca2\\+|ca jon\\.?)'],
['ca','Wapń','nerki','(?:wapń całkowity|wapń|ca|calcium)'],
['mg','Magnez','nerki','(?:magnez|mg\\+?\\+?|magnesium)'],
['phos','Fosforany','nerki','(?:fosforany|fosfor|phos)'],
['alt','ALT','wat','(?:alt|alat|gpt)'],['ast','AST','wat','(?:ast|aspat|got)'],
['alp','ALP','wat','(?:alp|fosfataza zasadowa)'],['ggt','GGTP','wat','(?:ggtp|ggt)'],
['bild','Bilirubina bezpośr.','wat','(?:bilirubina bezpośrednia|bilirubina związana|dbil)'],
['bil','Bilirubina','wat','(?:bilirubina całkowita|bilirubina|tbil|bil)'],
['lip','Lipaza','wat','(?:lipaza|lipase)'],['amyl','Amylaza','wat','(?:amylaza|amylase)'],
['alb','Albumina','wat','(?:albumina|albumin)'],
['inr','INR','krzep','(?:pt[- ]?inr|inr)'],['pt','PT','krzep','(?:pt|czas protrombinowy|wskaźnik quicka)'],
['aptt','APTT','krzep','(?:aptt|ptt|czas kaolinowo-kefalinowy)'],
['ddim','D-dimery','krzep','(?:d-?dimery?|d-dimer|dd)'],['fib','Fibrynogen','krzep','(?:fibrynogen|fibrinogen)'],
['ph','pH','gaz','ph'],['pco2','pCO₂','gaz','(?:pa?co2|pa?co₂)'],['po2','pO₂','gaz','(?:pa?o2|pa?o₂)'],
['hco3','HCO₃⁻','gaz','(?:hco3(?:-|std|act)?|hco₃⁻?|wodorowęglany|sbc)'],
['be','BE','gaz','(?:be(?:b|ecf)?|abe|sbe|nadmiar zasad)'],
['lac','Mleczany','gaz','(?:mleczany|kwas mlekowy|laktat|lactate|lac)'],
['sat','SatO₂','gaz','(?:sat|so2|sato2|sao2|so₂)'],
['glu','Glukoza','glu','(?:glukoza|glucose|glu|glikemia)'],['hba1c','HbA1c','glu','hba1c'],
['ket','Ciała ketonowe','glu','(?:ciała ketonowe|ketony|beta-hydroksymaślan|bhb)'],
['osm','Osmolalność','nerki','(?:osmolalność|osmolality|osm)']
].map(function(a){return{key:a[0],label:a[1],group:a[2],re:new RegExp('^(?:'+a[3]+')'+L)};});
var BYKEY={};AN.forEach(function(a){BYKEY[a.key]=a;});
// przeliczenia do jednostek kanonicznych (tylko oczywiste); null = jednostka nierozpoznana
var CANON={hb:'g/dl',crea:'mg/dl',urea:'mg/dl',glu:'mg/dl',bil:'mg/dl',bild:'mg/dl',ca:'mg/dl',mg:'mg/dl',lac:'mmol/l',trop:'ng/l',crp:'mg/l',pct:'ng/ml',fib:'g/l',ddim:'µg/l',pco2:'mmHg',po2:'mmHg',wbc:'tys/µl',plt:'tys/µl'};
function nu(u){return String(u||'').toLowerCase().replace(/\s+/g,'').replace(/feu$/,'').replace(/μ/g,'µ').replace(/^u(?=[a-z]+\/)/,'µ').replace(/^umol/,'µmol').replace(/^ug/,'µg').replace(/l$/,'l');}
function factor(key,unit){var u=nu(unit);if(!CANON[key])return 1;if(!u)return 1;
 var M={hb:{'g/dl':1,'g/l':0.1,'mmol/l':1.611},crea:{'mg/dl':1,'µmol/l':1/88.4},urea:{'mg/dl':1,'mmol/l':6.006},
 glu:{'mg/dl':1,'mmol/l':18.016},bil:{'mg/dl':1,'µmol/l':1/17.1},bild:{'mg/dl':1,'µmol/l':1/17.1},ca:{'mg/dl':1,'mmol/l':4.008},mg:{'mg/dl':1,'mmol/l':2.431},
 lac:{'mmol/l':1,'mg/dl':1/9.01},trop:{'ng/l':1,'pg/ml':1,'ng/ml':1000,'µg/l':1000},crp:{'mg/l':1,'mg/dl':10},pct:{'ng/ml':1,'µg/l':1},
 fib:{'g/l':1,'mg/dl':0.01},ddim:{'µg/l':1,'ng/ml':1,'mg/l':1000,'µg/ml':1000,'mg/dl':10000},pco2:{'mmhg':1,'kpa':7.5006},po2:{'mmhg':1,'kpa':7.5006}};
 if(key==='wbc'||key==='plt'){if(/^(tys\.?\/µl|10\^?3\/µl|10\^?9\/l|g\/l|x10\^?9\/l|x10\^?3\/µl|k\/µl|10e3\/µl|10\*3\/µl|tys\/mm3)$/.test(u))return 1;return null;}
 var m=M[key];return m&&m[u]!==undefined?m[u]:null;}
var NUM='-?\\d+(?:[.,]\\d+)?';
function pnum(s){return parseFloat(String(s).replace(',','.'));}
var RE_VAL=new RegExp('^([<>≤≥]=?)?\\s*('+NUM+')');
var RE_RANGE=new RegExp('[\\(\\[]?\\s*(?:norma:?\\s*)?('+NUM+')\\s*(?:-|–|—|÷|\\.\\.)\\s*('+NUM+')\\s*[\\)\\]]?');
var RE_RANGE_UP=new RegExp('[\\(\\[]?\\s*(?:norma:?\\s*)?([<≤])\\s*('+NUM+')\\s*[\\)\\]]?');
var RE_RANGE_LO=new RegExp('[\\(\\[]\\s*(?:norma:?\\s*)?([>≥])\\s*('+NUM+')\\s*[\\)\\]]');
var RE_FLAG=/(^|\s)(HH|LL|H|L|\*+|!|↑|↓)(?=\s|$)/;
// daty
var RE_DATE=/(?:(\d{1,2})[.\/-](\d{1,2})[.\/-](\d{4}|\d{2}(?![\d.,]))(?:[ ,T]+(?:godz\.?\s*)?(\d{1,2})[:.](\d{2}))?)|(?:(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{1,2}):(\d{2}))?)|(?:(?<![\d.,])(\d{1,2})\.(\d{1,2})\.?[ ,]+(\d{1,2}):(\d{2}))/g;
function findDates(s,yr){var out=[],m;RE_DATE.lastIndex=0;while((m=RE_DATE.exec(s))){var d,mo,y,h=0,mi=0;
 if(m[1]){d=+m[1];mo=+m[2];y=+m[3];if(y<100)y+=2000;if(m[4]){h=+m[4];mi=+m[5];}}
 else if(m[6]){y=+m[6];mo=+m[7];d=+m[8];if(m[9]){h=+m[9];mi=+m[10];}}
 else{d=+m[11];mo=+m[12];y=yr;h=+m[13];mi=+m[14];}
 if(mo<1||mo>12||d<1||d>31||h>23||mi>59)continue;out.push({t:Date.UTC(y,mo-1,d,h,mi),i:m.index,len:m[0].length});}return out;}
function fmtT(t){if(t==null)return'';var d=new Date(t),p=function(n){return(n<10?'0':'')+n;};return p(d.getUTCDate())+'.'+p(d.getUTCMonth()+1)+' '+p(d.getUTCHours())+':'+p(d.getUTCMinutes());}
function fmt(v){if(v==null||isNaN(v))return'—';var a=Math.abs(v),s=a>=100?String(Math.round(v)):a>=10?String(Math.round(v*10)/10):String(Math.round(v*100)/100);return s.replace('.',',');}
// parsowanie reszty linii po nazwie
function parseRest(rest){var r={};var s=rest.replace(/^[\s:=\t]+/,'');
 var um=s.match(/^[\[(]([^\])\d]*[a-zµ%][^\])]*)[\])]\s*/i);if(um&&!RE_VAL.test(um[1])){r.unit=um[1].trim();s=s.slice(um[0].length);}
 var vm=s.match(RE_VAL);if(!vm)return null;r.cmp=vm[1]||'';r.raw=(r.cmp?r.cmp+' ':'')+vm[2];r.val=pnum(vm[2]);s=s.slice(vm[0].length);
 var rm=s.match(RE_RANGE_UP);if(rm){r.hi=pnum(rm[2]);s=s.replace(rm[0],' ');}else if((rm=s.match(RE_RANGE_LO))){r.lo=pnum(rm[2]);s=s.replace(rm[0],' ');}else if((rm=s.match(RE_RANGE))&&!/\^\s*$/.test(s.slice(0,rm.index))){r.lo=pnum(rm[1]);r.hi=pnum(rm[2]);s=s.replace(rm[0],' ');}
 var fm=s.match(RE_FLAG);if(fm){r.flag=fm[2];s=s.replace(fm[0],' ');}
 var u=s.replace(/[\t]+/g,' ').trim().split(/\s{2,}|\s+(?=norma)/)[0].trim();if(!r.unit&&u&&u.length<=20&&/[a-zµ%\/^]/i.test(u))r.unit=u.replace(/[;,]$/,'');
 return r;}
function cellsOf(rest){var lead=/^[\s:=]*\t/.test(rest)||/^\s{2,}/.test(rest);var c=rest.indexOf('\t')>=0?rest.replace(/^[ :=]+/,'').split('\t'):rest.trim().split(/\s{2,}/);if(lead&&c[0].trim()==='')c.shift();return c.map(function(x){return x.trim();});}
function matchName(line){var low=line.toLowerCase();for(var i=0;i<AN.length;i++){var m=low.match(AN[i].re);if(m)return{a:AN[i],len:m[0].length};}return null;}
var IMG_HEAD=/^(rtg|rentgen|zdjęcie|tk|ct|angio-?tk|tomografia|usg|ekg|echo|echokardiografia|mr|mri|rezonans|konsultacja|opis|wynik badania|scyntygrafia|dopler|doppler)(?![a-ząęółśżźćń])/i;
function parse(text){var lines=String(text||'').replace(/\r/g,'').split('\n');var yr=(function(){var d=findDates(text,new Date().getUTCFullYear());for(var i=0;i<d.length;i++){var y=new Date(d[i].t).getUTCFullYear();if(y>2000)return y;}return new Date().getUTCFullYear();})();
 var res={},descs=[],curT=null,cols=null,seq=0,blk=null,unk=[],others=0;
 function add(a,p,label){var k=a?a.key:'x:'+label.toLowerCase();if(!res[k])res[k]={key:k,label:a?a.label:label,group:a?a.group:'inne',points:[]};var pts=res[k].points;
  if(p.t!=null){for(var i=0;i<pts.length;i++)if(pts[i].t===p.t){pts.splice(i,1);break;}}p.seq=seq++;
  var f=a?factor(a.key,p.unit):1;p.v=f==null?p.val:p.val*f;p.unitOk=f!=null;pts.push(p);}
 function endBlk(){if(blk){if(blk.lines.join(' ').split(/\s+/).length>=6||blk.head)descs.push({title:blk.lines[0].slice(0,90),text:blk.lines.join('\n'),t:blk.t});blk=null;}}
 lines.forEach(function(raw){var line=raw.replace(/\u00a0/g,' ').replace(/\s+$/,'');var tl=line.trim();if(!tl){return;}
  var nm=matchName(tl);var ds=findDates(tl,yr);
  if(nm){var rest=tl.slice(nm.len),dt=null;if(ds.length===1&&!cols){dt=ds[0].t;var o=ds[0].i-nm.len;if(o>=0)rest=rest.slice(0,o)+' '+rest.slice(o+ds[0].len);}
   if(cols){var cs=cellsOf(rest),ci=0,unit='',lo,hi,pts=[];cs.forEach(function(c){if(RE_RANGE.test(c)&&!RE_VAL.test(c.replace(RE_RANGE,'').trim())&&/[-–÷]/.test(c.replace(/^-/,''))){var m=c.match(RE_RANGE);lo=pnum(m[1]);hi=pnum(m[2]);return;}
     var v=c.match(new RegExp('^([<>≤≥]=?)?\\s*('+NUM+')\\s*(HH|LL|H|L|\\*|↑|↓)?$'));if(v&&ci<cols.length){pts.push({t:cols[ci],cmp:v[1]||'',raw:(v[1]?v[1]+' ':'')+v[2],val:pnum(v[2]),flag:v[3]||''});ci++;return;}
     if(c===''){if(ci<cols.length)ci++;return;}if(!unit&&/[a-zµ%\/]/i.test(c)&&c.length<=20)unit=c;});
    if(pts.length){endBlk();pts.forEach(function(p){p.unit=unit;p.lo=lo;p.hi=hi;add(nm.a,p);});return;}}
   var r=parseRest(rest);if(r){endBlk();r.t=dt!=null?dt:curT;add(nm.a,r);return;}}
  if(ds.length>=2&&tl.length-ds.reduce(function(s,d){return s+d.len;},0)<60&&!IMG_HEAD.test(tl)){endBlk();cols=ds.map(function(d){return d.t;});return;}
  if(ds.length===1&&tl.split(/\s+/).length<=7&&!IMG_HEAD.test(tl)){endBlk();cols=null;curT=ds[0].t;return;}
  // nieznany parametr z wartością → Inne
  var gm=tl.match(new RegExp('^([A-Za-zĄĆĘŁŃÓŚŹŻąćęłńóśźż][A-Za-zĄĆĘŁŃÓŚŹŻąćęłńóśźż0-9 .\\-\\/%#]{0,35}?)\\s*(?:[:=\\t]|\\s)\\s*(?=[<>≤≥]?\\s*'+NUM+'(?:\\s|$))'));
  if(gm&&tl.length<90&&gm[1].trim().split(/\s+/).length<=4&&!IMG_HEAD.test(tl)&&!/[.!?]\s+\S/.test(tl)){var rr=parseRest(tl.slice(gm[0].length));if(rr&&(rr.unit||rr.hi!=null||rr.flag)){endBlk();rr.t=ds.length===1?ds[0].t:curT;add(null,rr,gm[1].trim());return;}}
  // opis
  if(IMG_HEAD.test(tl)){if(blk&&blk.head&&blk.lines.length===1){blk.lines.push(tl);return;}endBlk();blk={lines:[tl],head:true,t:ds.length?ds[0].t:curT};return;}
  if(blk){blk.lines.push(tl);return;}
  if(tl.split(/\s+/).length>=4){blk={lines:[tl],head:false,t:curT};return;}
 });endBlk();
 Object.keys(res).forEach(function(k){var p=res[k].points;var all=p.every(function(x){return x.t!=null;});p.sort(function(a,b){return all?a.t-b.t||a.seq-b.seq:a.seq-b.seq;});var u=p.length?p[p.length-1].unit:'';res[k].unit=u||'';res[k].sameUnit=p.every(function(x){return(x.unit||'')===(u||'');});});
 descs.forEach(function(d){d.hits=scanText(d.text);});
 return{res:res,descs:descs,anyText:/\bekg\b/i.test(text)?['ekg']:[],grupa:/grupa krwi|próba krzyżowa/i.test(text),ekg:/(^|\s)ekg(?![a-z])/i.test(text)};}
// słowa groźne w opisach
var KW=[
['odma','Odma','crit','odm[aąyieęo]'],['krw','Krwawienie / krwiak','crit','krwawieni|krwotok|krwiak|wylew krwi'],['rozw','Rozwarstwienie','crit','rozwarstwieni'],
['zator','Zatorowość','crit','zator'],['niedr','Niedrożność','crit','niedrożno'],['perf','Perforacja / wolny gaz','crit','perforac|woln\\w* gaz|pneumoperitoneum|powietrze pod kopułami'],
['zawal','Zawał / uniesienie ST','crit','zawał|stemi|uniesieni\\w* (?:odcink\\w* )?st(?![a-z])'],['udar','Udar / niedokrwienie OUN','crit','udar|niedokrwien\\w* (?:mózg|ośrodk|w obszarze)|ognisk\\w* niedokrwien'],
['tamp','Tamponada','crit','tamponad'],['herni','Przemieszczenie / wklinowanie','crit','przemieszczeni\\w* (?:struktur|linii)|wklinowani|wodogłowi'],
['vt','Groźna arytmia','crit','częstoskurcz\\w* komor|migotani\\w* komór|blok\\w* (?:av )?(?:iii|3\\.? st|całkowit)'],
['obrzek','Obrzęk płuc / zastój','alert','obrzęk\\w* płuc|zastój|cech\\w* zastoju'],['zpl','Zapalenie płuc / naciek','alert','zapaleni\\w* płuc|nacie[kc]|konsolidac|pneumoni'],
['tetn','Tętniak','alert','tętniak'],['af','Migotanie przedsionków','alert','migotani\\w* przedsionk'],
['plyn','Płyn','warn','płyn'],['zlam','Złamanie','warn','złamani'],['niedodma','Niedodma','warn','niedodm']
].map(function(a){return{id:a[0],label:a[1],sev:a[2],re:new RegExp('(?<![a-ząęółśżźćń])(?:'+a[3]+')','i')};});
var NEG=/(?<![a-ząęółśżźćń])(bez|brak\w*|nie stwierdz\w*|nie uwidoczn\w*|nie wykaz\w*|nie widać|niewidoczn\w*|wyklucz\w*|nie ma)(?![a-ząęółśżźćń])/gi;
var POS=/[,;]\s*[^,;]*?(natomiast|ale|jednak|lecz|widoczn|uwidoczniono|stwierdza się|obecn|z\s+cechami)/i;
function scanText(text){var hits=[];var sents=String(text).split(/(?<=[.!?])\s+|\n+/);sents.forEach(function(s){KW.forEach(function(k){var m=k.re.exec(s);if(!m)return;var before=s.slice(0,m.index),neg=false,nm,last=null;NEG.lastIndex=0;while((nm=NEG.exec(before)))last=nm;if(last){var between=before.slice(last.index+last[0].length);neg=!POS.test(between);}
  hits.push({id:k.id,label:k.label,sev:neg?'neg':k.sev,neg:neg,snippet:s.trim().slice(0,220)});});});
 var seen={};return hits.filter(function(h){var x=h.id+'|'+h.snippet;if(seen[x])return false;seen[x]=1;return true;});}
// akcje (lok = STANDARD LOKALNY zatwierdzony; dec = DO DECYZJI LEKARZA)
var A={
 ekg:['Monitor EKG i EKG 12-odprowadzeniowe','dec'],
 hyperK1:['Calcium chloratum WZF 20 ml (2 amp. × 10 ml) = 9,2 mmol Ca i.v., podawać ≥ 9,2 min','lok','el'],
 hyperK2:['Insulina + glukoza, salbutamol, ocena wskazań do dializy – dawki i schemat w module Elektrolity SOR','dec','el'],
 hypoK:['Suplementacja potasu (i magnezu) – droga, tempo i dawki w module Elektrolity SOR; monitor EKG','dec','el'],
 hypoNa1:['Objawowa ciężka hiponatremia: bolus hipertoniczny 150 ml (5 amp. NaCl 10% × 10 ml + 100 ml G5%, ok. 3%) – moduł Elektrolity SOR','lok','el'],
 hypoNa2:['Limit korekty sodu: 10 mmol/l/24 h (8 mmol/l przy ryzyku ODS)','lok','el'],
 hyperNa:['Hipernatremia – ocena nawodnienia, wyrównanie powoli; szczegóły w module Elektrolity SOR','dec','el'],
 ca:['Hipokalcemia: glukonian wapnia 10–20 ml w 10 min wg ChPL – moduł Elektrolity SOR','lok','el'],
 mg:['Hipomagnezemia: suplementacja wg modułu Elektrolity SOR (MgSO₄ w TdP: 2 g w 2–3 min)','lok','el'],
 anem1:['Grupa krwi i próba krzyżowa, zamów KKCz (wskazania wg Transfuzjologii)','dec','transf'],
 anem2:['Szukaj źródła krwawienia (badanie per rectum, USG FAST); chirurg / endoskopia','dec','gib'],
 anem3:['Leczenie przeciwkrzepliwe? Odwrócenie działania – moduł Antykoagulacja','dec','acoag'],
 seps1:['Podejrzenie sepsy: posiewy krwi × 2 przed antybiotykiem, antybiotyk w 1. godzinie – dobór w module Zapalenie płuc / Antybiotykoterapia','dec','cap'],
 seps2:['Hipoperfuzja: krystaloidy 30 ml/kg (SSC 2021) z oceną odpowiedzi','dec','sepsis'],
 nora:['MAP < 65 mmHg mimo płynów: noradrenalina – centralnie 80 µg/ml (4 mg + 46 ml), obwodowo 20 µg/ml (1 ml + 49 ml) – Pompy SOR','lok','pompy'],
 rr:['Ciśnienie co 5 min na początku i po każdej zmianie dawki, potem co 15 min; cel MAP ≥ 65 mmHg','lok','pompy'],
 resp:['Kwasica oddechowa: oceń świadomość i oddech; rozważ NIV / intubację – anestezjolog','dec'],
 aki1:['Odstaw / skoryguj leki nefrotoksyczne (NLPZ, kontrast, aminoglikozydy, metformina); dawki leków wg CrCl','dec'],
 aki2:['Bilans płynów i diureza godzinowa','dec','fluid'],
 aki3:['Oporna hiperkaliemia, kwasica, przewodnienie, mocznica → konsultacja nefrologiczna (dializa)','dec'],
 trop1:['EKG 12-odpr. natychmiast; algorytm troponinowy 0/1/3 h (GGN 14 ng/l, istotna delta 5 ng/l) – moduł Troponina / OZW','lok','trop'],
 tropMI:['Istotny wzrost hs-troponiny (delta ≥ 5 ng/l, wartość > 14 ng/l): prawdopodobny zawał – postępowanie jak w OZW bez uniesienia ST, pilnie kardiolog','lok','trop'],
 trop3:['Delta niejednoznaczna: kontrola troponiny w 3. godzinie od pierwszego pobrania (schemat 0/1/3 h); monitor EKG, powtórz EKG','lok','trop'],
 tropX:['Po 3 oznaczeniach obraz nadal niejednoznaczny: obserwacja, konsultacja kardiologiczna, rozważ inne przyczyny wzrostu troponiny (niewydolność nerek, sepsa, zatorowość, zapalenie mięśnia sercowego)','dec','trop'],
 ddim:['D-dimery powyżej progu: interpretuj z prawdopodobieństwem klinicznym (Wells / Geneva / YEARS) → angio-TK płuc lub USG uciskowe żył – moduł Zatorowość płucna','dec','pe'],
 ddimP:['Ciąża: D-dimery tylko w algorytmie pregnancy-adapted YEARS (kryteria YEARS + USG uciskowe przy objawach ZŻG); próg standardowy 500 / wiek×10 nie obowiązuje','dec','pe'],
 trop2:['STEMI lub niestabilny pacjent → kardiolog / pracownia hemodynamiki','dec'],
 hypoG:['Hipoglikemia: glukoza i.v. natychmiast (dawka wg ChPL / standardu oddziału), kontrola glikemii co 15 min','dec'],
 hyperG:['Wyklucz DKA / HHS: ketony, gazometria, osmolalność – moduł DKA / HHS','dec','dka'],
 inr:['INR wysokie: krwawienie lub VKA → odwrócenie (PCC, wit. K) – moduł Antykoagulacja','dec','acoag'],
 plt:['Małopłytkowość: krwawienie / zabieg → rozważ KKP; wyklucz rzekomą małopłytkowość (próbka na cytrynian)','dec','transf'],
 fib:['Niski fibrynogen przy krwawieniu → rozważ koncentrat fibrynogenu / krioprecypitat','dec','transf'],
 lip:['Podejrzenie ostrego zapalenia trzustki: płyny, analgezja, USG jamy brzusznej, ocena ciężkości','dec'],
 bil:['Hiperbilirubinemia: USG jamy brzusznej (drogi żółciowe), oceń cholangitis','dec'],
 ast:['Wysokie aminotransferazy: wstrząs / niedokrwienie wątroby? Paracetamol? – oceń','dec','tox'],
 ck:['Rabdomioliza: nawodnienie, kontrola K i kreatyniny, diureza','dec'],
 // opisy
 odma:['Odma: ocena kliniczna; prężna → natychmiastowe odbarczenie; drenaż – chirurg klatki piersiowej','dec'],
 krw:['Krwawienie / krwiak: Hb, krzepnięcie, odwrócenie antykoagulacji; chirurg / neurochirurg','dec','acoag'],
 rozw:['Rozwarstwienie aorty: kontrola RR i HR, pilnie kardiochirurg / chirurg naczyniowy','dec'],
 zator:['Zatorowość płucna: stratyfikacja ryzyka, leczenie – moduł Zatorowość płucna','dec','pe'],
 niedr:['Niedrożność / perforacja: nic doustnie, sonda, pilnie chirurg','dec'],
 zawal:['Zawał / uniesienie ST: pilnie kardiolog, pracownia hemodynamiki','dec','trop'],
 udar:['Udar: czas od zachorowania, pilnie neurolog (leczenie reperfuzyjne) – moduł Neurologia','dec','neuro'],
 tamp:['Tamponada: pilnie echo serca, kardiochirurg / perikardiocenteza','dec'],
 herni:['Przemieszczenie struktur / wodogłowie: pilnie neurochirurg','dec'],
 vt:['Groźna arytmia: monitor, defibrylator w gotowości, kardiolog','dec'],
 obrzek:['Obrzęk płuc / zastój: leczenie wg modułu Ostra niewydolność serca','dec','ahf'],
 zpl:['Zapalenie płuc: CURB-65 i dobór antybiotyku – moduł Zapalenie płuc','lok','cap'],
 tetn:['Tętniak: porównaj z wcześniejszymi, przy objawach pilnie chirurg naczyniowy','dec'],
 af:['Migotanie przedsionków: moduł AF (kardiowersja, antykoagulacja)','dec','af'],
 plyn:['Płyn: oceń ilość i lokalizację w pełnym opisie','dec'],zlam:['Złamanie: unieruchomienie, analgezja, ortopeda','dec'],niedodma:['Niedodma: oceń w kontekście klinicznym','dec']
};
var MISS={hb:'Hemoglobina',plt:'Płytki krwi',inr:'INR',aptt:'APTT',fib:'Fibrynogen',grupa:'Grupa krwi i próba krzyżowa',ret:'Retikulocyty',ferr:'Ferrytyna',urea:'Mocznik',
 ph:'Gazometria (pH, pCO₂, HCO₃⁻)',crea:'Kreatynina',glu:'Glukoza',k:'Potas',mg:'Magnez',na:'Sód',osm:'Osmolalność surowicy',lac:'Mleczany',pct:'Prokalcytonina',crp:'CRP',
 posiewy:'Posiewy krwi × 2 (jeśli nie pobrano)',ekg:'EKG 12-odprowadzeniowe',trop2:'Powtórna troponina za 1 h (schemat 0/1/3 h)',trop3:'Trzecia troponina w 3. godzinie (schemat 0/1/3 h)',trop:'Troponina',ket:'Ciała ketonowe',
 ntprobnp:'NT-proBNP',lip:'Lipaza',alt:'ALT / AST',bil:'Bilirubina',mocz:'Badanie ogólne moczu',usgn:'USG nerek / dróg moczowych',moczna:'Sód i osmolalność w moczu',echo:'Echo serca',lac2:'Kontrolne mleczany za 2–4 h',ck:'CK'};
function analyze(text,opt){opt=opt||{};var P=parse(text),R=P.res,C=CFG,out={alerts:[],actions:[],missing:[],sev:{}};
 function S(k){return R[k]?R[k].points.filter(function(p){return!isNaN(p.v);}):[];}
 function last(k){var s=S(k);return s.length?s[s.length-1]:null;}
 function prev(k){var s=S(k);return s.length>1?s[s.length-2]:null;}
 function lv(k){var p=last(k);return p?p.v:null;}
 function has(k){return!!R[k]||(k==='grupa'&&P.grupa)||(k==='ekg'&&P.ekg)||(k==='alt'&&(R.alt||R.ast));}
 var rank={crit:3,alert:2,warn:1};
 function al(sev,k,txt){out.alerts.push({sev:sev,key:k,text:txt});if(k&&(!out.sev[k]||rank[sev]>rank[out.sev[k]]))out.sev[k]=sev;}
 function act(){for(var i=0;i<arguments.length;i++){var id=arguments[i],a=A[id];if(a&&!out.actions.some(function(x){return x.text===a[0];}))out.actions.push({id:id,text:a[0],tag:a[1],mod:a[2]||''});}}
 function miss(){for(var i=0;i<arguments.length;i++){var k=arguments[i];var always=['posiewy','trop2','mocz','usgn','moczna','echo','lac2'].indexOf(k)>=0;if((always||!has(k))&&MISS[k]&&out.missing.indexOf(MISS[k])<0)out.missing.push(MISS[k]);}}
 function u(k){var r=R[k];return r&&r.unit?' '+r.unit:'';}
 function V(k){var p=last(k);return p?p.raw.replace('.',',')+u(k):'';}
 function tag(k){var p=last(k);return p&&!p.unitOk?' (jednostka nierozpoznana – sprawdź)':'';}
 var x,p0,p1;
 // Hb
 if((x=lv('hb'))!=null){if(x<C.hb.crit)al('crit','hb','Ciężka niedokrwistość: Hb '+V('hb')+tag('hb'));else if(x<C.hb.alert)al('alert','hb','Niedokrwistość: Hb '+V('hb')+tag('hb'));
  p0=prev('hb');if(p0&&p0.v-x>=C.hb.dropAlert)al('crit','hb','Spadek Hb o '+fmt(p0.v-x)+' g/dl ('+fmt(p0.v)+' → '+fmt(x)+') – krwawienie?');
  if(out.sev.hb){act('anem1','anem2','anem3');miss('grupa','inr','aptt','plt','ret','ferr','urea');}}
 // K
 if((x=lv('k'))!=null){if(x>=C.k.critHi)al('crit','k','Hiperkaliemia ciężka: K '+V('k'));else if(x>=C.k.alertHi)al('alert','k','Hiperkaliemia: K '+V('k'));else if(x>=C.k.warnHi)al('warn','k','Potas podwyższony: K '+V('k'));
  if(x>=C.k.alertHi){act('ekg','hyperK1','hyperK2');miss('ekg','ph','crea','glu');}
  if(x<=C.k.critLo)al('crit','k','Hipokaliemia ciężka: K '+V('k'));else if(x<C.k.alertLo)al('alert','k','Hipokaliemia: K '+V('k'));
  if(x<C.k.alertLo){act('ekg','hypoK');miss('mg','ekg');}}
 // Na
 if((x=lv('na'))!=null){if(x<C.na.critLo)al('crit','na','Hiponatremia ciężka: Na '+V('na'));else if(x<C.na.alertLo)al('alert','na','Hiponatremia: Na '+V('na'));
  if(x<C.na.alertLo){act('hypoNa1','hypoNa2');miss('osm','glu','moczna');}
  if(x>=C.na.critHi)al('crit','na','Hipernatremia ciężka: Na '+V('na'));else if(x>=C.na.alertHi)al('alert','na','Hipernatremia: Na '+V('na'));if(x>=C.na.alertHi){act('hyperNa');miss('glu','osm');}}
 // pH, mleczany, pCO2
 var ph=lv('ph'),lac=lv('lac');
 if(ph!=null){if(ph<C.ph.crit)al('crit','ph','Ciężka kwasica: pH '+V('ph'));else if(ph<C.ph.alert)al('alert','ph','Kwasica: pH '+V('ph'));else if(ph>C.ph.alertHi)al('alert','ph','Zasadowica: pH '+V('ph'));
  if(ph<C.ph.alert&&(x=lv('pco2'))!=null&&x>C.pco2.alertHi){al('alert','pco2','Kwasica oddechowa: pCO₂ '+V('pco2'));act('resp');}
  if(ph<C.ph.alert){miss('lac','k','glu','crea','ket');}}
 if(lac!=null){if(lac>C.lac.crit)al('crit','lac','Mleczany > '+fmt(C.lac.crit)+': '+V('lac')+tag('lac')+' – hipoperfuzja / wstrząs?');else if(lac>C.lac.alert)al('alert','lac','Mleczany podwyższone: '+V('lac')+tag('lac'));
  if(lac>C.lac.alert){act('seps1','seps2','nora','rr');miss('posiewy','lac2','ph','crea');}}
 // zapalne
 var pct=lv('pct'),crp=lv('crp'),wbc=lv('wbc'),sepsis=false;
 if(pct!=null){if(pct>=C.pct.alert){al('alert','pct','Prokalcytonina wysoka: '+V('pct')+' – zakażenie bakteryjne / sepsa?');sepsis=true;}else if(pct>=C.pct.warn){al('warn','pct','Prokalcytonina podwyższona: '+V('pct'));sepsis=true;}}
 if(crp!=null){p0=prev('crp');if(p0&&p0.v>0&&crp>=p0.v*C.crp.riseX&&crp>=C.crp.riseMin){al('alert','crp','CRP narasta: '+fmt(p0.v)+' → '+fmt(crp)+' mg/l');sepsis=true;}else if(crp>=C.crp.warn){al('warn','crp','CRP wysokie: '+V('crp')+tag('crp'));sepsis=true;}}
 if(wbc!=null){if(wbc>=C.wbc.critHi||wbc<C.wbc.critLo){al('crit','wbc','Leukocyty skrajne: '+V('wbc'));sepsis=true;}else if(wbc>C.wbc.alertHi||wbc<C.wbc.alertLo){al('warn','wbc','Leukocyty poza zakresem SIRS: '+V('wbc'));if(pct!=null&&pct>=C.pct.warn||crp!=null&&crp>=C.crp.warn)sepsis=true;}}
 if(sepsis){act('seps1');miss('lac','posiewy','ph');if(crp!=null&&crp>=C.crp.warn)miss('pct');if(pct!=null)miss('crp');}
 // nerki
 if((x=lv('crea'))!=null){var s=S('crea'),mn=Math.min.apply(null,s.map(function(p){return p.v;}));if(s.length>1&&(x-mn>=C.crea.riseAbs||x>=mn*C.crea.riseX)&&x>mn)al('alert','crea','Ostre uszkodzenie nerek? Kreatynina '+fmt(mn)+' → '+fmt(x)+' mg/dl'+tag('crea'));else if(x>=C.crea.alert)al('warn','crea','Kreatynina wysoka: '+V('crea')+tag('crea'));
  if(out.sev.crea){act('aki1','aki2','aki3');miss('k','ph','mocz','usgn');}}
 if((x=lv('egfr'))!=null&&x<C.egfr.alert){al('warn','egfr','eGFR < '+C.egfr.alert+': '+V('egfr')+' – korekta dawek leków');act('aki1');}
 // troponina (STANDARD LOKALNY: hs-troponina GGN 14 ng/l, istotna delta 5 ng/l, schemat 0/1/3 h)
 out.trop=null;if(R.trop){var TS=S('trop');if(TS.length){var T=C.trop,tl=TS[TS.length-1],tu=tl.hi!=null&&tl.unitOk?tl.hi*factor('trop',tl.unit||'ng/l'):T.uln;var dl=[];for(var ti=1;ti<TS.length;ti++){dl.push({from:TS[ti-1],to:TS[ti],d:TS[ti].v-TS[ti-1].v,min:TS[ti].t!=null&&TS[ti-1].t!=null?Math.round((TS[ti].t-TS[ti-1].t)/60000):null});}
  var tr={uln:tu,ulnSrc:tl.hi!=null&&tl.unitOk?'norma z wklejki':'norma lokalna',delta:T.delta,deltas:dl,n:TS.length,verdict:'',text:''},x2=tl.v,ab=x2>tu,ld=dl.length?dl[dl.length-1]:null;
  function D(z){return(z.d>0?'+':z.d<0?'−':'±')+fmt(Math.abs(z.d))+' ng/l'+(z.min!=null?' w '+z.min+' min':'');}
  if(!ld){if(ab){tr.verdict='alert';tr.text='Jedno oznaczenie powyżej normy ('+fmt(x2)+' ng/l > '+fmt(tu)+'). Powtórz za 1 h i policz deltę (schemat 0/1/3 h).';al(x2>=tu*T.critX?'crit':'alert','trop','Troponina powyżej normy: '+V('trop')+(x2>=tu*T.critX?' (≥ '+T.critX+'× GGN)':'')+' – powtórz za 1 h (0/1/3 h)');}
   else{tr.verdict='single';tr.text='Jedno oznaczenie ≤ '+fmt(tu)+' ng/l – nie wyklucza zawału. Powtórz za 1 h (schemat 0/1/3 h).';}
   miss('trop2','ekg');act('trop1');}
  else{var dd=ld.d,both=TS.slice(-2).every(function(p){return p.v<=tu;});
   if(ab&&dd>=T.delta){tr.verdict='mi';tr.text='Istotny wzrost: '+fmt(ld.from.v)+' → '+fmt(x2)+' ng/l, delta '+D(ld)+' (≥ '+T.delta+'), wartość > '+fmt(tu)+' – prawdopodobny zawał.';al('crit','trop','Troponina narasta: '+fmt(ld.from.v)+' → '+fmt(x2)+' ng/l, delta '+D(ld)+' – prawdopodobny zawał');act('ekg','tropMI','trop2');miss('ekg','k');}
   else if(both&&Math.abs(dd)<T.delta&&x2<tu-T.near){tr.verdict='low';tr.text='Oba oznaczenia ≤ '+fmt(tu)+' ng/l i delta '+D(ld)+' (< '+T.delta+') – małe prawdopodobieństwo zawału, jeśli pierwsze pobranie > 3 h od początku bólu. Przy bólu < 3 h lub dalszych objawach – kontrola w 3. godzinie.';}
   else{tr.verdict='unclear';var why=ab&&Math.abs(dd)<T.delta?'wartość > '+fmt(tu)+' ng/l, ale delta '+D(ld)+' < '+T.delta:ab&&dd<=-T.delta?'wartość > '+fmt(tu)+' ng/l i spadek '+D(ld):dd>=T.delta?'wzrost '+D(ld)+' przy wartościach w normie':'wartość blisko progu ('+fmt(x2)+' ng/l)';
    if(TS.length>=3){tr.text='Po '+TS.length+' oznaczeniach nadal niejednoznacznie: '+why+'.';al('alert','trop','Troponina niejednoznaczna po '+TS.length+' oznaczeniach: '+why);act('ekg','tropX');}
    else{tr.text='Delta niejednoznaczna: '+why+'. Zleć trzecią troponinę w 3. godzinie (schemat 0/1/3 h).';al(ab?'alert':'warn','trop','Troponina – delta niejednoznaczna ('+why+') – kontrola w 3. godzinie');act('ekg','trop3');miss('trop3');}}
   if(out.sev.trop==='crit'||ab)act('trop1','trop2');}
  tr.status=T.status;out.trop=tr;
  TS.forEach(function(p){if(p.hi==null&&p.unitOk){var f0=factor('trop',p.unit||'ng/l')||1;p.hi=T.uln/f0;p.hiLocal=true;}});}}
 // glukoza
 if((x=lv('glu'))!=null){if(x<C.glu.critLo)al('crit','glu','Hipoglikemia ciężka: '+V('glu')+tag('glu'));else if(x<C.glu.alertLo)al('alert','glu','Hipoglikemia: '+V('glu')+tag('glu'));if(x<C.glu.alertLo)act('hypoG');
  if(x>=C.glu.critHi)al('crit','glu','Hiperglikemia ciężka: '+V('glu')+tag('glu'));else if(x>=C.glu.alertHi)al('alert','glu','Hiperglikemia: '+V('glu')+tag('glu'));if(x>=C.glu.alertHi){act('hyperG');miss('ket','ph','osm','k','na');}}
 // krzepnięcie
 if((x=lv('inr'))!=null){if(x>=C.inr.crit)al('crit','inr','INR bardzo wysokie: '+V('inr'));else if(x>=C.inr.alert)al('alert','inr','INR wysokie: '+V('inr'));if(x>=C.inr.alert){act('inr');miss('hb','plt','aptt','fib','grupa');}}
 if((x=lv('plt'))!=null){if(x<C.plt.crit)al('crit','plt','Małopłytkowość ciężka: PLT '+V('plt'));else if(x<C.plt.alert)al('alert','plt','Małopłytkowość: PLT '+V('plt'));if(x<C.plt.alert){act('plt');miss('hb','inr','aptt','fib');}}
 if((x=lv('fib'))!=null&&x<C.fib.alert){al('alert','fib','Fibrynogen niski: '+V('fib'));act('fib');}
 // D-dimery (STANDARD LOKALNY: < 500 µg/l FEU do 50 r.ż., powyżej 50 r.ż. wiek × 10; ciąża – osobne progi)
 out.ddim=null;if(R.ddim){var DS=S('ddim');if(DS.length){var DC=C.ddim,age=+opt.age,pr=!!opt.preg,tri=+opt.tri||0,cut,cs,ctag;
  if(pr){var yc=opt.years;cut=yc==='0'?1000:500;var trn=tri?' Zakres referencyjny '+tri+'. trymestru (tylko informacyjnie): do '+fmt(tri===1?DC.preg.t1:tri===2?DC.preg.t2:DC.preg.t3)+' µg/l FEU.':'';cs='ciąża – pregnancy-adapted YEARS (van der Pol, NEJM 2019): '+(yc==='0'?'0 kryteriów YEARS → próg 1000 µg/l FEU':yc==='1'?'≥ 1 kryterium YEARS → próg 500 µg/l FEU':'kryteria YEARS nieokreślone → próg 500 µg/l FEU (zaznacz kryteria)')+'. Objawy ZŻG → najpierw USG uciskowe.'+trn;ctag=DC.preg.status;}
  else if(isFinite(age)&&age>DC.ageFrom){cut=age*DC.perYear;cs='próg skorygowany wiekiem: '+age+' × 10 = '+fmt(cut)+' µg/l FEU';ctag=DC.status;}
  else{cut=DC.base;cs=isFinite(age)&&opt.age!==''&&opt.age!=null?'wiek '+age+' (≤ '+DC.ageFrom+') – próg '+DC.base+' µg/l FEU':'wiek nieznany – próg '+DC.base+' µg/l FEU (podaj wiek: > 50 r.ż. próg = wiek × 10)';ctag=DC.status;}
  var dl2=DS[DS.length-1];DS.forEach(function(p){if(p.unitOk){var f1=factor('ddim',p.unit)||1;p.hi=cut/f1;p.lo=null;p.hiLocal=true;}});
  out.ddim={cut:cut,text:cs,tag:ctag,preg:pr,src:pr?DC.preg.src:'',unitOk:dl2.unitOk};
  if(!dl2.unitOk){al('warn','ddim','D-dimery: jednostka nierozpoznana ('+(dl2.unit||'brak')+') – sprawdź, czy FEU; próg '+fmt(cut)+' µg/l FEU');}
  else if(dl2.v>cut){al('warn','ddim','D-dimery powyżej progu: '+V('ddim')+' ('+cs+')');act('ddim');if(pr)act('ddimP');}
  else if(pr)act('ddimP');}}
 // wątroba/trzustka
 if((x=lv('lip'))!=null){p1=last('lip');var ul=p1.hi!=null?p1.hi:C.lip.ulnDefault;if(x>=ul*C.lip.alertX){al('alert','lip','Lipaza ≥ '+C.lip.alertX+'× norma: '+V('lip'));act('lip');miss('alt','bil','ca','crea');}}
 if((x=lv('bil'))!=null&&x>=C.bil.alert){al('warn','bil','Bilirubina wysoka: '+V('bil')+tag('bil'));act('bil');}
 ['ast','alt'].forEach(function(k){var q=last(k);if(q&&q.hi&&q.v>=q.hi*C.ast.alertX){al('warn',k,BYKEY[k].label+' > '+C.ast.alertX+'× norma: '+V(k));act('ast');}});
 if((x=lv('ca'))!=null){if(x<C.ca.critLo){al('alert','ca','Hipokalcemia: Ca '+V('ca')+tag('ca'));act('ekg','ca');miss('mg','alb');}else if(x>=C.ca.alertHi)al('alert','ca','Hiperkalcemia: Ca '+V('ca')+tag('ca'));}
 if((x=lv('mg'))!=null&&x<C.mg.alertLo){al('warn','mg','Hipomagnezemia: '+V('mg')+tag('mg'));act('mg');}
 if((x=lv('ck'))!=null&&x>=C.ck.alert){al('alert','ck','CK bardzo wysokie: '+V('ck')+' – rabdomioliza?');act('ck');miss('k','crea','mocz');}
 // opisy
 var IM={odma:['ph'],krw:['hb','plt','inr','aptt','fib','grupa'],rozw:['grupa','hb','crea','trop'],zator:['trop','ntprobnp','echo'],niedr:['lac','lip','crea','k','grupa'],perf:['lac','lip','crea','k','grupa'],
  zawal:['trop','k','mg','ekg'],udar:['glu','inr','plt','aptt'],obrzek:['ntprobnp','trop','ph','k','crea'],zpl:['pct','crp','lac','ph','urea','posiewy'],tamp:['echo'],vt:['k','mg','trop'],af:['k','mg','trop']};
 P.descs.forEach(function(d){d.hits.forEach(function(h){if(h.neg)return;var sv=h.sev==='warn'?'warn':h.sev;al(sv,null,h.label+' – „'+h.snippet.slice(0,110)+(h.snippet.length>110?'…':'')+'”');act(h.id==='perf'?'niedr':h.id);if(IM[h.id])miss.apply(null,IM[h.id]);});});
 // sortowanie i deduplikacja
 var seen={};out.alerts=out.alerts.filter(function(a){if(seen[a.text])return false;seen[a.text]=1;return true;}).sort(function(a,b){return rank[b.sev]-rank[a.sev];});
 out.parsed=P;out.groups=GROUPS;return out;}
var api={parse:parse,analyze:analyze,scanText:scanText,factor:factor,fmt:fmt,fmtT:fmtT,findDates:findDates,GROUPS:GROUPS,AN:AN,CFG:CFG};
if(typeof module!=='undefined'&&module.exports)module.exports=api;g.PW=api;
})(typeof window!=='undefined'?window:globalThis);
