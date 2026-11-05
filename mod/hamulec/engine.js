/* Ostateczny hamulec – silnik regułowy offline (bez AI, bez sieci). Korzysta z parsera Przeglądu wyników (PW). */
(function(g){'use strict';
var PW=g.PW||(typeof require==='function'?(require('../pw/config.js'),require('../pw/engine.js')):null),RU=g.HB_RULES||(typeof require==='function'?(require('./rules.js'),g.HB_RULES):null);
var NEG=/(?<![a-ząęółśżźćń])(bez|brak\w*|nie stwierdz\w*|nie zgłasza|nie podaje|neguje|zaprzecza|nie ma|nie było|nie obserwuje|nie wykaz\w*|wyklucz\w*|nie)(?![a-ząęółśżźćń])/gi;
function num(s){return parseFloat(String(s).replace(',','.'));}
function vitals(t){var v={},m,T=t.replace(/\u00a0/g,' ');
 function last(re){var x,r=null;re.lastIndex=0;while((x=re.exec(T)))r=x;return r;}
 if((m=last(/(?:\bRR\b|ciśnienie(?: tętnicze)?|\bBP\b|\bCTK\b|\bNIBP\b)\s*[:=]?\s*(\d{2,3})\s*\/\s*(\d{2,3})/gi))){v.sbp=+m[1];v.dbp=+m[2];}
 if((m=last(/(?:\bHR\b|tętno|\bAS\b|czynność serca|akcja serca)\s*[:=]?\s*(\d{2,3})(?![\d.,]|\s*\/\s*\d)/gi)))v.hr=+m[1];
 if((m=last(/(?:SpO2|SpO₂|saturacja|\bSat\b|SaO2)\s*[:=]?\s*(\d{2,3})\s*%?/gi)))v.spo2=+m[1];
 if((m=last(/GCS\s*[:=]?\s*(\d{1,2})/gi)))v.gcs=+m[1];
 if((m=last(/(?:temperatura|temp\.?|\bT\b|ciepłota)\s*[:=]?\s*(3\d|4[0-3])(?:[.,](\d))?\s*(?:°?\s*C)?/gi)))v.temp=num(m[1]+(m[2]?'.'+m[2]:''));
 if((m=last(/(?:oddech\w*|częstość oddechów|\bRespR\b|\bRF\b|\bAF\b)\s*[:=]?\s*(\d{1,2})\s*(?:\/\s*min)?/gi)))v.rr=+m[1];
 if(/tlen\w*|O2\s*\d+\s*l|na tlenie|wąsy tlenowe|maska tlenowa/i.test(T))v.o2=true;
 return v;}
function news2(v){if([v.rr,v.spo2,v.sbp,v.hr,v.temp].some(function(x){return x==null;}))return null;var s=0;
 s+=v.rr<=8?3:v.rr<=11?1:v.rr<=20?0:v.rr<=24?2:3;s+=v.spo2<=91?3:v.spo2<=93?2:v.spo2<=95?1:0;s+=v.o2?2:0;s+=v.sbp<=90?3:v.sbp<=100?2:v.sbp<=110?1:v.sbp<=219?0:3;
 s+=v.hr<=40?3:v.hr<=50?1:v.hr<=90?0:v.hr<=110?1:v.hr<=130?2:3;s+=v.gcs!=null&&v.gcs<15?3:0;s+=v.temp<=35?3:v.temp<=36?1:v.temp<=38?0:v.temp<=39?1:2;return s;}
function scan(t){var hits={},sents=String(t).split(/(?<=[.!?;])\s+|\n+/);
 RU.kw.forEach(function(k){var re=new RegExp('(?<![a-ząęółśżźćń])(?:'+k[3]+')','i');sents.forEach(function(s){var m=re.exec(s);if(!m)return;var before=s.slice(0,m.index),last=null,nm;NEG.lastIndex=0;while((nm=NEG.exec(before)))last=nm;
  var neg=!!last&&before.length-(last.index+last[0].length)<40&&!/[,;]\s*(?:ale|lecz|natomiast|jednak)/i.test(before.slice(last.index));
  if(!neg){var aft=s.slice(m.index+m[0].length,m.index+m[0].length+100).split(/[.!?;]/)[0];if(/(?<![a-ząęółśżźćń])(nie uwidoczn\w*|nie stwierdz\w*|nie wykaz\w*|nie widać|nie ma|wyklucz\w*|nie obserwuje\w*)(?![a-ząęółśżźćń])/i.test(aft)&&!/(?:natomiast|ale|jednak|lecz)\s/i.test(aft))neg=true;}
  (hits[k[0]]=hits[k[0]]||{id:k[0],label:k[1],sev:k[2],pos:[],neg:[]})[neg?'neg':'pos'].push(s.trim().slice(0,200));});});return hits;}
function age(t){var m=t.match(/(?:wiek|lat[ae]?)\s*[:=]?\s*(\d{1,3})\b|\b(\d{1,3})\s*(?:-?\s*let\w*|lata?\b|l\.|r\.\s*ż\.?|rż)/i);if(m){var a=+(m[1]||m[2]);if(a>0&&a<120)return a;}return'';}
function preg(t){if(/nie (?:jest )?w ciąży|ciąża wykluczona|test ciążowy ujemny|β-?hcg ujemn|beta-?hcg ujemn/i.test(t))return{p:false};var m=t.match(/(\d{1,2})\s*(?:\.\s*)?(?:tc|hbd|tydz\w*\s*ciąży)\b/i);
 if(m){var w=+m[1];return{p:true,tri:w<14?1:w<28?2:3,w:w};}if(/(?<![a-ząęółśżźćń])(?:w ciąży|ciężarn\w*|ciąża\b)/i.test(t))return{p:true,tri:0};return{p:false};}
function analyze(text,opt){opt=opt||{};var t=String(text||''),out={crit:[],warn:[],miss:[],info:[]};
 var a=opt.age!==''&&opt.age!=null?opt.age:age(t),pr=opt.preg!=null?{p:opt.preg,tri:opt.tri||0}:preg(t);out.age=a;out.preg=pr;
 var o=PW.analyze(t,{age:a,preg:pr.p,tri:pr.tri});out.pw=o;var R=o.parsed.res;
 o.alerts.forEach(function(x){(x.sev==='crit'?out.crit:x.sev==='alert'?out.warn:out.info).push('Wyniki: '+x.text);});
 var v=vitals(t);out.vit=v;RU.vit.forEach(function(r){var x=v[r[0]];if(x==null)return;var ok=r[1]==='<'?x<r[2]:r[1]==='>'?x>r[2]:x>=r[2];if(ok)(r[3]==='crit'?out.crit:out.warn).push('Parametry: '+r[4]+' ('+x+')');});
 var nw=news2(v);out.news=nw;if(nw!=null){if(nw>=RU.news.crit)out.crit.push('NEWS2 = '+nw+' (≥ '+RU.news.crit+')');else if(nw>=RU.news.warn)out.warn.push('NEWS2 = '+nw+' (≥ '+RU.news.warn+')');}
 var h=scan(t);out.hits=h;var P=function(id){return h[id]&&h[id].pos.length>0;};
 Object.keys(h).forEach(function(k){var x=h[k];if(!x.pos.length||x.sev==='info')return;(x.sev==='crit'?out.crit:out.warn).push('Wywiad / badanie: '+x.label+' – „'+x.pos[0].slice(0,110)+'”');});
 var hypo=v.sbp!=null&&v.sbp<90||/hipotensj|wstrząs/i.test(t);var tropBad=o.trop&&/mi|unclear|alert/.test(o.trop.verdict);
 if(pr.p&&(/ból\w* brzuch|ból\w* podbrzusz|krwawieni\w* z dróg rodnych|plamieni|krwawieni\w* z pochwy/i.test(t)))out.crit.push('Ciąża + ból brzucha / krwawienie z dróg rodnych');
 if((P('gor')||v.temp>=38)&&hypo)out.crit.push('Gorączka + hipotensja – podejrzenie wstrząsu septycznego');
 if(P('bkl')&&tropBad)out.crit.push('Ból w klatce + troponina niejednoznaczna / podwyższona ('+o.trop.text+')');
 var has={ekg:/(?<![a-ząęółśżźćń])ekg(?![a-ząęółśżźćń])/i.test(t),trop2:!!(R.trop&&R.trop.points.length>=2),tkg:/(?:tk|tomografi\w*|angio-?tk)\s+(?:głowy|mózg)|konsultacj\w* neurolog/i.test(t),hb:!!R.hb,lac:!!(R.lac||R.crp||R.pct),gaz:!!(R.ph||R.po2||v.spo2!=null),usg:/usg|konsultacj\w* ginekolog/i.test(t),psy:/konsultacj\w* psychiatr/i.test(t)};
 RU.miss.forEach(function(m){if(P(m[0])&&!has[m[1]]&&out.miss.indexOf(m[2])<0)out.miss.push(m[2]);});
 o.missing.forEach(function(m){if(out.miss.indexOf('Wyniki: '+m)<0)out.miss.push('Wyniki: '+m);});
 out.verdict=out.crit.length?'crit':(out.warn.length||out.miss.length)?'warn':'none';
 out.verdictText={crit:'NIE WOLNO WYPISAĆ – wymaga hospitalizacji',warn:'UWAGA – sprawdź przed wypisem',none:'Brak krytycznych sygnałów w analizie reguł'}[out.verdict];return out;}
var api={analyze:analyze,vitals:vitals,news2:news2,scan:scan,age:age,preg:preg,RU:RU};if(typeof module!=='undefined'&&module.exports)module.exports=api;g.HB=api;
})(typeof window!=='undefined'?window:globalThis);
